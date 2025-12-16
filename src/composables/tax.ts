import { computed, type MaybeRefOrGetter, type Reactive, toValue } from "vue";
import type { TaxInputForm, ResultRow, TaxConfig, TaxRateRow } from "../model";
import { formatNumber, getTaxRateValue, getTotalTax } from "../libs/utils";
import { useConstrainedRounding } from "./rounding";

export function useTaxCalculator(taxConfig: TaxConfig, state: Reactive<TaxInputForm>) {
    const cTotalSalary = computed(() => {
        return Math.round(Math.max(Number(state.totalSalary.replace(/,/g, '')), 0));
    });

    const cInsuranceInput = computed(() => {
        return Math.round(Math.max(Number(state.insuranceInput.replace(/,/g, '')), 0));
    });

    const cPayedTax = computed(() => {
        return Math.round(Math.max(Number(state.payedTax.replace(/,/g, '')), 0));
    });

    const totalSalaryOfYear = computed(() => {
        if (state.salaryMode === 'month') {
            return cTotalSalary.value * 12;
        }

        return cTotalSalary.value;
    });

    const peopleReduceSalary = computed(() => {
        return state.numberOfPeople * taxConfig.monthlyPeopleReduce * 12;
    });

    const totalReduceSalary = computed(() => {
        return taxConfig.monthlySelfReduce * 12 + peopleReduceSalary.value;
    });

    const payedInsurance = computed(() => {
        if (state.insuranceMode === 'salary') {
            return Math.round(cInsuranceInput.value * 12 * (taxConfig.socialInsuranceRate + taxConfig.healthInsuranceRate + taxConfig.employmentInsuranceRate) / 100);
        }
        return cInsuranceInput.value;
    });

    const taxSalary = computed(() => {
        return Math.max(totalSalaryOfYear.value - totalReduceSalary.value - payedInsurance.value, 0);
    });

    const totalTax = computed(() => {
        return Math.ceil(getTotalTax(taxConfig.rates, taxSalary.value, 'year'));
    });

    const remainingTax = computed(() => {
        return totalTax.value - cPayedTax.value;
    });

    const monthlySocialInsuranceSalary = computed(() => {
        if (state.slaryForInsuranceMode == 'custom') {
            return cInsuranceInput.value
        }
        return Math.min(taxConfig.maxMonthlySocialInsuraneSalary, cTotalSalary.value);
    });

    const monthlyEmploymentInsuranceSalary = computed(() => {
        if (state.slaryForInsuranceMode == 'custom') {
            return cInsuranceInput.value
        }
        return Math.min(taxConfig.employmentInsuranceFactor * taxConfig.minMonthlySalaryByZone[state.zone], cTotalSalary.value);
    });

    const monthlyInsurance = computed(() => {
        const { roundedItems, roundedTotal } = useConstrainedRounding([
            monthlySocialInsuranceSalary.value * taxConfig.socialInsuranceRate / 100,
            monthlySocialInsuranceSalary.value * taxConfig.healthInsuranceRate / 100,
            monthlyEmploymentInsuranceSalary.value * taxConfig.employmentInsuranceRate / 100,
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
        return Math.max(cTotalSalary.value - (totalReduceSalary.value / 12) - monthlyInsurance.value.total, 0);
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
                value: formatNumber(totalReduceSalary.value),
                heading: true,
                compare: true,
            },
            {
                label: 'Bản thân',
                value: formatNumber(taxConfig.monthlySelfReduce * 12),
            },
            {
                label: 'Người phụ thuộc',
                value: formatNumber(peopleReduceSalary.value),
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
                value: formatNumber(cPayedTax.value),
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
        const monthlyTax = Math.ceil(getTotalTax(taxConfig.rates, monthlyTaxSalary.value, 'month'));
        const isMaxSocialInsurance = monthlySocialInsuranceSalary.value == taxConfig.maxMonthlySocialInsuraneSalary
        const isMaxEmploymentInsurance = monthlyEmploymentInsuranceSalary.value == taxConfig.employmentInsuranceFactor * taxConfig.minMonthlySalaryByZone[state.zone]
        return [
            {
                label: 'Thu nhập (1)',
                value: formatNumber(cTotalSalary.value),
                heading: true,
            },
            {
                label: 'Giảm trừ gia cảnh (2)',
                value: formatNumber(totalReduceSalary.value / 12),
                heading: true,
                compare: true,
            },
            {
                label: 'Bản thân',
                value: formatNumber(taxConfig.monthlySelfReduce),
            },
            {
                label: 'Người phụ thuộc',
                value: formatNumber(peopleReduceSalary.value / 12),
            },
            {
                label: 'Bảo hiểm (3)',
                value: formatNumber(monthlyInsurance.value.total),
                heading: true,
            },
            {
                label: `BHXH (${taxConfig.socialInsuranceRate}%)`,
                tooltip: isMaxSocialInsurance && `Trần BHXH: ${formatNumber(monthlySocialInsuranceSalary.value)}đ`,
                value: formatNumber(monthlyInsurance.value.socialInsurance),
            },
            {
                label: `BHYT (${taxConfig.healthInsuranceRate}%)`,
                tooltip: isMaxSocialInsurance && `Trần BHYT: ${formatNumber(monthlySocialInsuranceSalary.value)}đ`,
                value: formatNumber(monthlyInsurance.value.healthInsurance),
            },
            {
                label: `BHTN (${taxConfig.employmentInsuranceRate}%)`,
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
                label: 'Thực nhận (6) = (1) - (3) - (5)',
                value: formatNumber(cTotalSalary.value - monthlyTax - monthlyInsurance.value.total),
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


export function useTaxRateRows(taxConfig: TaxConfig, monthlyTaxSalary: MaybeRefOrGetter<number>) {
    const taxRateRows = computed(() => {
        const rows: TaxRateRow[] = []
        const mTaxSalary = toValue(monthlyTaxSalary);

        for (let i = 0; i < taxConfig.rates.length; i++) {
            const rateWithMax = {
                min: taxConfig.rates[i]!.min,
                rate: taxConfig.rates[i]!.rate,
                max: i < taxConfig.rates.length - 1 ? taxConfig.rates[i + 1]!.min : 0
            };
            rows.push({
                taxRate: rateWithMax,
                monthlyTaxValue: getTaxRateValue(rateWithMax, mTaxSalary)
            });
        }
        return rows;
    });

    return {
        taxRateRows
    }
}
