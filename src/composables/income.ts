import { computed, Reactive } from "vue";
import { ResultRow, TaxConfig, TaxRate, IncomeInputForm } from "../model";
import { formatNumber, getTax } from "../libs/utils";

export function useIncomeCalculator(taxConfig: TaxConfig, state: Reactive<IncomeInputForm>) {
    const cSalaryInput = computed(() => {
        return Math.max(Number(state.totalSalary.replace(/,/g, '')), 0);
    });

    const grossSalary = computed(() => {
        if (state.salaryMode === 'gross') {
            return cSalaryInput.value;
        }
        return 0; //TODO: Calculate gross from net
    });

    const cInsuranceInput = computed(() => {
        return Math.max(Number(state.insuranceInput.replace(/,/g, '')), 0);
    });

    const monthlyInsurance = computed(() => {
        if (state.insuranceMode === 'full') {
            return Math.round(Math.min(cSalaryInput.value, taxConfig.maxInsuranePerMonth) * taxConfig.insuranceRate / 100);
        }
        return Math.round(cInsuranceInput.value * taxConfig.insuranceRate / 100);
    });

    const selfReduceSalary = taxConfig.selfReduce;
    const peopleReduceSalary = computed(() => {
        return state.numberOfPeople * taxConfig.peopleReduce;
    });

    const totalReduceSalary = computed(() => {
        return selfReduceSalary + peopleReduceSalary.value;
    });

    const monthlyTaxSalary = computed(() => {
        return Math.max(cSalaryInput.value - totalReduceSalary.value - monthlyInsurance.value, 0);
    });

    const netSalary = computed(() => {
        return grossSalary.value - getTax(taxConfig.rates, monthlyTaxSalary.value, 'month') -
            monthlyInsurance.value
    });

    const monthlyResultRows = computed<ResultRow[]>(() => {
        return [
            {
                label: 'Thu nhập - GROSS (1)',
                value: formatNumber(grossSalary.value),
                heading: true,
            },
            {
                label: 'Giảm trừ gia cảnh (2)',
                value: formatNumber(totalReduceSalary.value),
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
                value: formatNumber(getTax(taxConfig.rates, monthlyTaxSalary.value, 'month')),
                heading: true,
                compare: true,
                invertCompare: true,
            },
            {
                label: 'Thực nhận - NET (6) = (1) - (3) - (5)',
                value: formatNumber(netSalary.value),
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

    const getTaxRateValue = (taxRate: TaxRate) => {
        let currentLevelTaxSalary = (0 - taxRate.min / 12);
        if (taxRate.max) {
            currentLevelTaxSalary = Math.min(
                (taxRate.max - taxRate.min) / 12,
                currentLevelTaxSalary
            )
        }

        return currentLevelTaxSalary * taxRate.rate / 100;
    }

    return {
        cTotalSalary: cSalaryInput,
        cInsuranceInput,
        monthlyResultRows,
        getTaxRateValue,
        taxRateRows
    }
}
