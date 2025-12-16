import { computed, type MaybeRefOrGetter, type Reactive, toValue } from "vue";
import type { TaxInputForm, ResultRow, TaxConfig, TaxLevelRow, TaxLevel } from "../model";
import { formatNumber, getTaxLevelValue, getTotalTax } from "../libs/utils";
import { useConstrainedCeiling } from "./rounding";

export function useTaxCalculator(taxConfig: TaxConfig, state: Reactive<TaxInputForm>) {
    const cSalaryInput = computed(() => {
        return Math.round(Math.max(Number(state.salaryInput.replace(/,/g, '')), 0));
    });

    const cInsuranceInput = computed(() => {
        return Math.round(Math.max(Number(state.insuranceInput.replace(/,/g, '')), 0));
    });

    const cPayedTaxInput = computed(() => {
        return Math.round(Math.max(Number(state.payedTaxInput.replace(/,/g, '')), 0));
    });

    const totalSalaryOfYear = computed(() => {
        if (state.salaryMode === 'month') {
            return cSalaryInput.value * 12;
        }

        return cSalaryInput.value;
    });

    const dependentDeduction = computed(() => {
        return Math.max(0, state.numberOfDependent) * taxConfig.monthlyDependentDeduction * 12;
    });

    const totalDeduction = computed(() => {
        return taxConfig.monthlySelfDeduction * 12 + dependentDeduction.value;
    });

    const payedInsurance = computed(() => {
        if (state.insuranceMode === 'salary') {
            return Math.round(cInsuranceInput.value * 12 * (taxConfig.socialInsurancePercent + taxConfig.healthInsurancePercent + taxConfig.employmentInsurancePercent) / 100);
        }
        return cInsuranceInput.value;
    });

    const taxSalary = computed(() => {
        return Math.max(totalSalaryOfYear.value - totalDeduction.value - payedInsurance.value, 0);
    });

    const totalTax = computed(() => {
        return Math.ceil(getTotalTax(taxConfig.levels, taxSalary.value, 'year'));
    });

    const remainingTax = computed(() => {
        return totalTax.value - cPayedTaxInput.value;
    });

    const monthlySocialInsuranceSalary = computed(() => {
        if (state.insuranceSlaryMode == 'custom') {
            return cInsuranceInput.value
        }
        return Math.min(taxConfig.maxMonthlySocialInsuraneSalary, cSalaryInput.value);
    });

    const monthlyEmploymentInsuranceSalary = computed(() => {
        if (state.insuranceSlaryMode == 'custom') {
            return cInsuranceInput.value
        }
        return Math.min(taxConfig.employmentInsuranceFactor * taxConfig.minMonthlySalaryByZone[state.zone], cSalaryInput.value);
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
    })

    const monthlyTaxSalary = computed(() => {
        if (state.salaryMode !== 'month' || state.insuranceMode != 'salary') {
            return 0;
        }
        return Math.max(cSalaryInput.value - (totalDeduction.value / 12) - monthlyInsurance.value.total, 0);
    });

    const resultRows = computed<ResultRow[]>(() => {
        return [
            {
                label: 'Tổng Thu nhập chịu thuế (1)',
                value: formatNumber(totalSalaryOfYear.value),
                heading: true,
            },
            {
                label: 'Giảm trừ gia cảnh (2)',
                value: formatNumber(totalDeduction.value),
                heading: true,
                compare: true,
            },
            {
                label: 'Bản thân',
                value: formatNumber(taxConfig.monthlySelfDeduction * 12),
            },
            {
                label: 'Người phụ thuộc',
                value: formatNumber(dependentDeduction.value),
            },
            {
                label: 'Bảo hiểm đã đóng (3)',
                value: formatNumber(payedInsurance.value),
                heading: true,
            },
            {
                label: 'Tổng thu nhập tính thuế (4) = (1) - (2) - (3)',
                value: formatNumber(taxSalary.value),
                heading: true,
                compare: true,
                invertCompare: true,
            },
            {
                label: 'Tổng thuế phải đóng (5) = Thuế suất x (4)',
                value: formatNumber(totalTax.value),
                heading: true,
                compare: true,
                invertCompare: true,
            },
            {
                label: 'Thuế đã khấu trừ (6)',
                value: formatNumber(cPayedTaxInput.value),
                heading: true,
            },
            {
                label: remainingTax.value > 0 ? 'Thuế còn phải đóng (7) = (5) - (6)' : 'Thuế được nhận lại (7) = (6) - (5)',
                value: formatNumber(Math.abs(remainingTax.value)),
                heading: true,
                compare: true,
                invertCompare: remainingTax.value > 0,
            },
        ];
    });

    const monthlyResultRows = computed<ResultRow[]>(() => {
        const monthlyTax = Math.ceil(getTotalTax(taxConfig.levels, monthlyTaxSalary.value, 'month'));
        const isMaxSocialInsurance = monthlySocialInsuranceSalary.value == taxConfig.maxMonthlySocialInsuraneSalary
        const isMaxEmploymentInsurance = monthlyEmploymentInsuranceSalary.value == taxConfig.employmentInsuranceFactor * taxConfig.minMonthlySalaryByZone[state.zone]
        return [
            {
                label: 'Thu nhập - GROSS (1)',
                value: formatNumber(cSalaryInput.value),
                heading: true,
            },
            {
                label: 'Giảm trừ gia cảnh (2)',
                value: formatNumber(totalDeduction.value / 12),
                heading: true,
                compare: true,
            },
            {
                label: 'Bản thân',
                value: formatNumber(taxConfig.monthlySelfDeduction),
            },
            {
                label: 'Người phụ thuộc',
                value: formatNumber(dependentDeduction.value / 12),
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
                value: formatNumber(monthlyTax),
                heading: true,
                compare: true,
                invertCompare: true,
            },
            {
                label: 'Thực nhận - NET (6) = (1) - (3) - (5)',
                value: formatNumber(cSalaryInput.value - monthlyTax - monthlyInsurance.value.total),
                heading: true,
                compare: true,
            },
        ];
    });

    return {
        monthlyTaxSalary,
        resultRows,
        monthlyResultRows,
    }
}


export function useTaxLevelRows(taxConfig: TaxConfig, monthlyTaxSalary: MaybeRefOrGetter<number>) {
    const taxLevelRows = computed(() => {
        const rows: TaxLevelRow[] = []
        const mTaxSalary = toValue(monthlyTaxSalary);

        for (let i = 0; i < taxConfig.levels.length; i++) {
            const levelWithMax: TaxLevel = {
                min: taxConfig.levels[i]!.min,
                percent: taxConfig.levels[i]!.percent,
                max: i < taxConfig.levels.length - 1 ? taxConfig.levels[i + 1]!.min : 0
            };
            rows.push({
                taxLevel: levelWithMax,
                monthlyTaxValue: Math.ceil(getTaxLevelValue(levelWithMax, mTaxSalary)),
            });
        }
        return rows;
    });

    return {
        taxLevelRows
    }
}
