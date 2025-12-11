import { computed, MaybeRefOrGetter, Reactive, toValue } from "vue";
import { TaxInputForm, ResultRow, TaxConfig, TaxRateRow } from "../model";
import { formatNumber, getTaxRateValue, getTotalTax } from "../libs/utils";

export function useTaxCalculator(taxConfig: TaxConfig, state: Reactive<TaxInputForm>) {
    const cTotalSalary = computed(() => {
        return Math.max(Number(state.totalSalary.replace(/,/g, '')), 0);
    });

    const cInsuranceInput = computed(() => {
        return Math.max(Number(state.insuranceInput.replace(/,/g, '')), 0);
    });

    const cPayedTax = computed(() => {
        return Math.max(Number(state.payedTax.replace(/,/g, '')), 0);
    });

    const totalSalaryOfYear = computed(() => {
        if (state.salaryMode === 'month') {
            return cTotalSalary.value * 12;
        }

        return cTotalSalary.value;
    });

    const selfReduceSalary = taxConfig.selfReduce * 12;
    const peopleReduceSalary = computed(() => {
        return state.numberOfPeople * taxConfig.peopleReduce * 12;
    });

    const totalReduceSalary = computed(() => {
        return selfReduceSalary + peopleReduceSalary.value;
    });

    const payedInsurance = computed(() => {
        if (state.insuranceMode === 'salary') {
            return Math.round(cInsuranceInput.value * 12 * taxConfig.insuranceRate / 100);
        }
        return cInsuranceInput.value;
    });

    const taxSalary = computed(() => {
        return Math.max(totalSalaryOfYear.value - totalReduceSalary.value - payedInsurance.value, 0);
    });

    const totalTax = computed(() => {
        return getTotalTax(taxConfig.rates, taxSalary.value, 'year');
    });

    const remainingTax = computed(() => {
        return totalTax.value - cPayedTax.value;
    });

    const monthlyInsurance = computed(() => {
        return Math.round(cInsuranceInput.value * taxConfig.insuranceRate / 100);
    });

    const monthlyTaxSalary = computed(() => {
        if (state.salaryMode !== 'month' || state.insuranceMode != 'salary') {
            return 0;
        }
        return Math.max(cTotalSalary.value - (totalReduceSalary.value / 12) - monthlyInsurance.value, 0);
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
                value: formatNumber(selfReduceSalary),
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
        const monthlyTax = getTotalTax(taxConfig.rates, monthlyTaxSalary.value, 'month');
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
                label: 'Bảo hiểm (3)',
                value: formatNumber(monthlyInsurance.value),
                heading: true,
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
                value: formatNumber(cTotalSalary.value - monthlyTax - monthlyInsurance.value),
                heading: true,
                compare: true,
            },
        ];
    });

    return {
        cTotalSalary,
        cInsuranceInput,
        cPayedTax,
        totalSalaryOfYear,
        selfReduceSalary,
        peopleReduceSalary,
        totalReduceSalary,
        payedInsurance,
        taxSalary,
        totalTax,
        remainingTax,
        monthlyInsurance,
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
                min: taxConfig.rates[i].min,
                rate: taxConfig.rates[i].rate,
                max: i < taxConfig.rates.length - 1 ? taxConfig.rates[i + 1].min : 0
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
