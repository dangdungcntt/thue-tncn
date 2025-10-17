import { computed, Reactive } from "vue";
import { InputForm, ResultRow, TaxConfig, TaxRate } from "./model";

export function useTaxCalculator(taxConfig: TaxConfig, state: Reactive<InputForm>) {
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
        return getTax(taxConfig.rates, taxSalary.value);
    });

    const remainingTax = computed(() => {
        return totalTax.value - cPayedTax.value;
    });

    const monthlyInsurance = computed(() => {
        return Math.round(cInsuranceInput.value * taxConfig.insuranceRate / 100);
    });

    const monthlyTaxSalary = computed(() => {
        return Math.max(cTotalSalary.value - (totalReduceSalary.value / 12) - monthlyInsurance.value, 0);
    });

    const getTaxRateValue = (taxRate: TaxRate) => {
        let currentLevelTaxSalary = (monthlyTaxSalary.value - taxRate.min / 12);
        if (taxRate.max) {
            currentLevelTaxSalary = Math.min(
                (taxRate.max - taxRate.min) / 12,
                currentLevelTaxSalary
            )
        }

        return currentLevelTaxSalary * taxRate.rate / 100;
    }


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
            },
            {
                label: 'Bản thân',
                value: formatNumber(selfReduceSalary),
                compare: true,
            },
            {
                label: 'Người phụ thuộc',
                value: formatNumber(peopleReduceSalary.value),
                compare: true,
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
                invertCompare: true,
            },
        ];
    });

    const monthlyResultRows = computed<ResultRow[]>(() => {
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
                value: formatNumber(getTax(taxConfig.rates, monthlyTaxSalary.value, 'month')),
                heading: true,
                compare: true,
                invertCompare: true,
            },
            {
                label: 'Thực nhận (6) = (1) - (3) - (5)',
                value: formatNumber(cTotalSalary.value - getTax(taxConfig.rates, monthlyTaxSalary.value, 'month') -
                    monthlyInsurance.value),
                heading: true,
                compare: true,
            },
        ];
    });

    const taxRateRows = computed(() => {
        const rows: TaxRate[] = []
        for (let i = 0; i < taxConfig.rates.length; i++) {
            rows.push({
                min: taxConfig.rates[i].min,
                rate: taxConfig.rates[i].rate,
                max: i < taxConfig.rates.length - 1 ? taxConfig.rates[i + 1].min : 0
            });
        }
        return rows;
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
        getTaxRateValue,
        resultRows,
        monthlyResultRows,
        taxRateRows
    }
}


function getTax(rates: TaxRate[], taxSalary: number, mode = 'year') {
    let divide = 1;
    if (mode === 'month') {
        divide = 12;
    }
    let tax = 0;
    for (let i = rates.length - 1; i >= 0; i--) {
        let rate = rates[i];
        const minSalary = rate.min / divide;

        if (taxSalary >= minSalary) {
            tax += (taxSalary - minSalary) * rate.rate / 100;
            taxSalary = minSalary;
        }
    }
    return tax;
}


export function formatNumber(number: number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
};
