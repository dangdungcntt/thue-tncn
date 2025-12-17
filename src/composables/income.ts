import { computed, type Reactive } from "vue";
import type { ResultRow, TaxConfig, TaxLevel, IncomeInputForm } from "@/model";
import { formatNumber, getTotalTax } from "@/libs/utils";
import { useConstrainedCeiling } from "./rounding";

export function useIncomeCalculator(taxConfig: TaxConfig, state: Reactive<IncomeInputForm>) {
    const cInput = computed(() => {
        return Math.max(Number(state.salaryInput.replace(/,/g, '')), 0);
    });

    const cInsuranceSalaryInput = computed(() => {
        return Math.max(Number(state.insuranceSalaryInput.replace(/,/g, '')), 0);
    });

    const dependentDeduction = computed(() => {
        return Math.max(0, state.numberOfDependent || 0) * taxConfig.monthlyDependentDeduction;
    });

    const totalDeduction = computed(() => {
        return taxConfig.monthlySelfDeduction + dependentDeduction.value;
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

    function getActualInsurance(gross: number) {
        const socialSalary = state.insuranceSalaryMode == 'custom' ? cInsuranceSalaryInput.value : Math.min(gross, taxConfig.maxMonthlySocialInsuraneSalary)
        const employmentSalary = state.insuranceSalaryMode == 'custom' ? cInsuranceSalaryInput.value : Math.min(gross, taxConfig.employmentInsuranceFactor * minMonthSalary.value)
        const { roundedTotal: actualInsurance } = useConstrainedCeiling([
            socialSalary * taxConfig.socialInsurancePercent / 100,
            socialSalary * taxConfig.healthInsurancePercent / 100,
            employmentSalary * taxConfig.employmentInsurancePercent / 100,
        ])
        return actualInsurance;
    }

    const grossSalary = computed(() => {
        if (state.inputMode === 'gross') {
            return cInput.value;
        }

        function grossToNet(gross: number) {
            const actualInsurance = getActualInsurance(gross)
            const monthlyTaxSalary = Math.max(gross - totalDeduction.value - actualInsurance, 0)
            return gross - Math.ceil(getTotalTax(taxConfig.levels, monthlyTaxSalary, 'month')) - Math.ceil(actualInsurance);
        }

        function grossToTax(gross: number) {
            const actualInsurance = getActualInsurance(gross)
            const monthlyTaxSalary = Math.max(gross - totalDeduction.value - actualInsurance, 0)
            return Math.ceil(getTotalTax(taxConfig.levels, monthlyTaxSalary, 'month'))
        }
        const targetValue = cInput.value;
        const converter = state.inputMode === 'tax' ? grossToTax : grossToNet;

        function tuneGross(gross: number) {
            let actual
            let step = 0
            do {
                step++
                actual = converter(gross);

                if (Math.ceil(actual) != targetValue) {
                    gross += actual < targetValue ? 1 : -1
                }
            } while (actual != targetValue && step < 1000);

            return gross;
        }

        let left, right
        let step = 0;
        let gross = 0;
        if (state.inputMode == 'tax') {
            left = 0
            right = Math.max(targetValue * 50, 50_000_000)
        } else {
            // net
            left = targetValue;
            right = targetValue * 3;
        }

        while (left < right && step < 1000) {
            step++;
            gross = Math.round((left + right) / 2);
            const actual = converter(gross);

            if (actual <= targetValue) {
                left = gross
            } else {
                right = gross
            }
        }

        return tuneGross(gross);
    });

    const monthlySocialInsuranceSalary = computed(() => {
        if (state.insuranceSalaryMode == 'custom') {
            return cInsuranceSalaryInput.value
        }
        if (grossSalary.value <= minMonthSalary.value) {
            return 0
        }
        return Math.min(taxConfig.maxMonthlySocialInsuraneSalary, grossSalary.value);
    });

    const monthlyEmploymentInsuranceSalary = computed(() => {
        if (state.insuranceSalaryMode == 'custom') {
            return cInsuranceSalaryInput.value
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
        return Math.max(grossSalary.value - totalDeduction.value - monthlyInsurance.value.total, 0);
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
                label: 'Thu nhập (GROSS) (1)',
                value: formatNumber(grossSalary.value),
                heading: true,
                compare: state.inputMode !== 'gross',
            },
            {
                label: 'Giảm trừ gia cảnh (2)',
                value: formatNumber(totalDeduction.value),
                heading: true,
                compare: true,
            },
            {
                label: 'Bản thân',
                value: formatNumber(taxConfig.monthlySelfDeduction),
            },
            {
                label: 'Người phụ thuộc',
                value: formatNumber(dependentDeduction.value),
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
                compare: state.inputMode !== 'tax',
                invertCompare: true,
            },
            {
                label: 'Thực nhận (NET) (6) = (1) - (3) - (5)',
                value: formatNumber(netSalary.value),
                heading: true,
                compare: state.inputMode !== 'net',
            },
        ];
    });


    return {
        cSalaryInput: cInput,
        cInsuranceInput: cInsuranceSalaryInput,
        monthlyTaxSalary,
        monthlyResultRows,
    }
}


