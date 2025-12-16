import { computed, type Reactive } from "vue";
import type { ResultRow, TaxConfig, TaxLevel, IncomeInputForm } from "@/model";
import { formatNumber, getTotalTax } from "@/libs/utils";
import { useConstrainedCeiling } from "./rounding";

export function useIncomeCalculator(taxConfig: TaxConfig, state: Reactive<IncomeInputForm>) {
    const cSalaryInput = computed(() => {
        return Math.max(Number(state.totalSalary.replace(/,/g, '')), 0);
    });

    const cInsuranceInput = computed(() => {
        return Math.max(Number(state.insuranceInput.replace(/,/g, '')), 0);
    });

    const peopleReduceSalary = computed(() => {
        return Math.max(0, state.numberOfPeople) * taxConfig.monthlyPeopleReduce;
    });

    const totalReduceSalary = computed(() => {
        return taxConfig.monthlySelfReduce + peopleReduceSalary.value;
    });

    const quickTaxLookUpTable: Record<number, {
        quickDeduction: number,
        taxLevel: TaxLevel,
    }> = {}

    let s = 0;
    taxConfig.levels.forEach((taxLevel, index) => {
        if (index > 0) {
            s += (taxLevel.min - taxConfig.levels[index - 1]!.min) / 12 * taxConfig.levels[index - 1]!.percent / 100
        }
        quickTaxLookUpTable[index] = {
            quickDeduction: taxLevel.min / 12 * (taxLevel.percent / 100) - s,
            taxLevel: taxLevel
        }
    })

    const minMonthSalary = computed(() => taxConfig.minMonthlySalaryByZone[state.zone]!)

    const grossSalary = computed(() => {
        if (state.salaryMode === 'gross') {
            return cSalaryInput.value;
        }
        const targetNet = cSalaryInput.value;

        function tuneGross(gross: number, actualInsurance: number) {
            const net = grossToNet(gross, totalReduceSalary.value, actualInsurance, taxConfig);

            if (Math.ceil(net) != targetNet) {
                gross += net < targetNet ? 1 : -1
            }
            return gross
        }

        const ranges = [
            {
                min: 0, max: minMonthSalary.value, cal: function (): number {
                    return targetNet
                }
            },
            {
                min: minMonthSalary.value, max: totalReduceSalary.value, cal: function (): number {
                    // N = G - INS
                    // G = N / (1- socialRate - healthRate - empRate)
                    const insuranceRate = (taxConfig.socialInsurancePercent + taxConfig.healthInsurancePercent + taxConfig.employmentInsurancePercent) / 100
                    let gross = Math.ceil(targetNet / (1 - insuranceRate));
                    const actualInsurance = insuranceRate * gross;
                    return tuneGross(gross, actualInsurance);
                }
            },
            {
                min: totalReduceSalary.value, max: taxConfig.maxMonthlySocialInsuraneSalary,
                cal: function (): number {
                    for (let i = 0; i < taxConfig.levels.length; i++) {
                        const lookupItem = quickTaxLookUpTable[i]!;
                        const socialInsurane = taxConfig.maxMonthlySocialInsuraneSalary * taxConfig.socialInsurancePercent / 100;
                        const healthInsurane = taxConfig.maxMonthlySocialInsuraneSalary * taxConfig.healthInsurancePercent / 100;

                        const r = lookupItem.taxLevel.percent / 100
                        const q = lookupItem.quickDeduction
                        const D = totalReduceSalary.value
                        // N = G - INS - Tax
                        // TI = G - INS - D
                        // Tax = r * TI - q
                        // G = (N + SI + HI - r * (SI + HI + D) - q) / ((1 - empRate) * (1 - r))
                        let gross = Math.ceil((targetNet + socialInsurane + healthInsurane - r * (socialInsurane + healthInsurane + D) - q) / ((1 - taxConfig.employmentInsurancePercent / 100) * (1 - r)));

                        let actualInsurance = 0
                        if (gross >= taxConfig.maxMonthlySocialInsuraneSalary) {
                            actualInsurance = socialInsurane + healthInsurane + (taxConfig.employmentInsurancePercent / 100 * gross)
                        } else {
                            // G = (N - r * D - q) / ((1 - socialRate - healthRate - empRate) * (1 - r))
                            const insuranceRate = (taxConfig.socialInsurancePercent + taxConfig.healthInsurancePercent + taxConfig.employmentInsurancePercent) / 100
                            gross = Math.ceil((targetNet - r * D - q) / ((1 - insuranceRate) * (1 - r)));
                            actualInsurance = insuranceRate * gross;
                        }

                        const taxableSalary = gross - actualInsurance - D

                        if (taxableSalary >= (taxConfig.levels[i]!.min / 12) && (i == taxConfig.levels.length - 1 || taxableSalary <= (taxConfig.levels[i + 1]!.min / 12))) {
                            return tuneGross(gross, actualInsurance);
                        }
                    }
                    return 0
                }
            },
            {
                min: taxConfig.maxMonthlySocialInsuraneSalary,
                cal: function (): number {
                    for (let i = 0; i < taxConfig.levels.length; i++) {
                        const lookupItem = quickTaxLookUpTable[i]!;
                        const socialInsurane = taxConfig.maxMonthlySocialInsuraneSalary * taxConfig.socialInsurancePercent / 100;
                        const healthInsurane = taxConfig.maxMonthlySocialInsuraneSalary * taxConfig.healthInsurancePercent / 100;
                        const maxEmploymentInsuranceSalary = taxConfig.employmentInsuranceFactor * minMonthSalary.value;
                        const employmentInsurance = maxEmploymentInsuranceSalary * taxConfig.employmentInsurancePercent / 100;
                        const { roundedTotal: fullInsurance } = useConstrainedCeiling([
                            socialInsurane,
                            healthInsurane,
                            employmentInsurance,
                        ]);
                        const r = lookupItem.taxLevel.percent / 100
                        const q = lookupItem.quickDeduction
                        const D = totalReduceSalary.value
                        // N = G - INS - Tax
                        // TI = G - INS - D
                        // Tax = r * TI - q
                        // G = (N + INS - r * (INS + D) - q) / (1 - r)
                        let gross = Math.ceil((targetNet - r * (D + fullInsurance) + fullInsurance - q) / (1 - r));
                        let taxableSalary = 0
                        let actualInsurance = 0
                        if (gross >= maxEmploymentInsuranceSalary) {
                            actualInsurance = fullInsurance
                            taxableSalary = gross - actualInsurance - D;
                        } else {
                            //G = (N + SI + HI - r * (SI + HI + D) - q) / ((1 - empRate) * (1 - r))
                            gross = Math.ceil((targetNet + socialInsurane + healthInsurane - r * (socialInsurane + healthInsurane + D) - q) / ((1 - taxConfig.employmentInsurancePercent / 100) * (1 - r)));
                            actualInsurance = (socialInsurane + healthInsurane + (taxConfig.employmentInsurancePercent / 100 * gross))
                            taxableSalary = gross - actualInsurance - D
                        }

                        if (taxableSalary >= (taxConfig.levels[i]!.min / 12) && (i == taxConfig.levels.length - 1 || taxableSalary <= (taxConfig.levels[i + 1]!.min / 12))) {
                            return tuneGross(gross, actualInsurance);
                        }
                    }

                    return 0
                }
            },
        ]
        for (let j = 0; j < ranges.length; j++) {
            const range = ranges[j]!;
            if (targetNet < range.min || (!!range.max && targetNet > range.max)) {
                continue;
            }

            const gross = range.cal();
            if (gross > 0) {
                return gross;
            }
        }

        return targetNet;
    });

    const monthlySocialInsuranceSalary = computed(() => {
        if (state.slaryForInsuranceMode == 'custom') {
            return cInsuranceInput.value
        }
        if (grossSalary.value <= minMonthSalary.value) {
            return 0
        }
        return Math.min(taxConfig.maxMonthlySocialInsuraneSalary, grossSalary.value);
    });

    const monthlyEmploymentInsuranceSalary = computed(() => {
        if (state.slaryForInsuranceMode == 'custom') {
            return cInsuranceInput.value
        }
        if (grossSalary.value <= minMonthSalary.value) {
            return 0
        }
        return Math.min(taxConfig.employmentInsuranceFactor * minMonthSalary.value, grossSalary.value);
    });

    const monthlyInsurance = computed(() => {
        const { roundedItems, roundedTotal } = useConstrainedCeiling([
            monthlySocialInsuranceSalary.value * taxConfig.socialInsurancePercent / 100,
            monthlySocialInsuranceSalary.value * taxConfig.healthInsurancePercent / 100,
            monthlyEmploymentInsuranceSalary.value * taxConfig.employmentInsurancePercent / 100,
        ])
        return {
            socialInsurance: roundedItems[0] as number,
            healthInsurance: roundedItems[1] as number,
            employmentInsurance: roundedItems[2] as number,
            total: roundedTotal,
        }
    });

    const monthlyTaxSalary = computed(() => {
        return Math.max(grossSalary.value - totalReduceSalary.value - monthlyInsurance.value.total, 0);
    });

    const netSalary = computed(() => {
        return grossSalary.value - Math.ceil(getTotalTax(taxConfig.levels, monthlyTaxSalary.value, 'month')) - monthlyInsurance.value.total;
    });

    const monthlyResultRows = computed<ResultRow[]>(() => {
        const tax = Math.ceil(getTotalTax(taxConfig.levels, monthlyTaxSalary.value, 'month'))
        const isMaxSocialInsurance = monthlySocialInsuranceSalary.value == taxConfig.maxMonthlySocialInsuraneSalary
        const isMaxEmploymentInsurance = monthlyEmploymentInsuranceSalary.value == taxConfig.employmentInsuranceFactor * minMonthSalary.value
        return [
            {
                label: 'Thu nhập - GROSS (1)',
                value: formatNumber(grossSalary.value),
                heading: true,
                compare: state.salaryMode === 'net',
            },
            {
                label: 'Giảm trừ gia cảnh (2)',
                value: formatNumber(totalReduceSalary.value),
                heading: true,
                compare: true,
            },
            {
                label: 'Bản thân',
                value: formatNumber(taxConfig.monthlySelfReduce),
            },
            {
                label: 'Người phụ thuộc',
                value: formatNumber(peopleReduceSalary.value),
            },
            {
                label: 'Bảo hiểm (3)',
                value: formatNumber(monthlyInsurance.value.total),
                heading: true,
            },
            {
                label: `BHXH (${taxConfig.socialInsurancePercent}%)`,
                tooltip: isMaxSocialInsurance && `Trần BHXH: ${formatNumber(monthlySocialInsuranceSalary.value)}đ`,
                value: formatNumber(monthlyInsurance.value.socialInsurance),
            },
            {
                label: `BHYT (${taxConfig.healthInsurancePercent}%)`,
                tooltip: isMaxSocialInsurance && `Trần BHYT: ${formatNumber(monthlySocialInsuranceSalary.value)}đ`,
                value: formatNumber(monthlyInsurance.value.healthInsurance),
            },
            {
                label: `BHTN (${taxConfig.employmentInsurancePercent}%)`,
                value_tooltip: isMaxEmploymentInsurance && `Trần BHTN: ${formatNumber(monthlyEmploymentInsuranceSalary.value)}đ`,
                value: formatNumber(monthlyInsurance.value.employmentInsurance),
            },
            {
                label: 'Thu nhập tính thuế (4) = (1) - (2) - (3)',
                value: formatNumber(monthlyTaxSalary.value),
                heading: true,
                compare: true,
                invertCompare: true,
            },
            {
                label: 'Thuế phải đóng (5) = Thuế suất x (4)',
                value: formatNumber(tax),
                heading: true,
                compare: true,
                invertCompare: true,
            },
            {
                label: 'Thực nhận - NET (6) = (1) - (3) - (5)',
                value: formatNumber(netSalary.value),
                heading: true,
                compare: state.salaryMode === 'gross',
            },
        ];
    });


    return {
        cSalaryInput,
        cInsuranceInput,
        monthlyTaxSalary,
        monthlyResultRows,
    }
}

function grossToNet(gross: number, totalReduceSalary: number, insurance: number, taxConfig: TaxConfig) {
    const monthlyTaxSalary = Math.max(gross - totalReduceSalary - insurance, 0)
    return gross - Math.ceil(getTotalTax(taxConfig.levels, monthlyTaxSalary, 'month')) - Math.ceil(insurance);
}
