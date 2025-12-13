import { computed, Reactive } from "vue";
import { ResultRow, TaxConfig, TaxRate, IncomeInputForm } from "../model";
import { formatNumber, getTotalTax } from "../libs/utils";

export function useIncomeCalculator(taxConfig: TaxConfig, state: Reactive<IncomeInputForm>) {
    const cSalaryInput = computed(() => {
        return Math.max(Number(state.totalSalary.replace(/,/g, '')), 0);
    });

    const cInsuranceInput = computed(() => {
        return Math.max(Number(state.insuranceInput.replace(/,/g, '')), 0);
    });

    const peopleReduceSalary = computed(() => {
        return state.numberOfPeople * taxConfig.monthlyPeopleReduce;
    });

    const totalReduceSalary = computed(() => {
        return taxConfig.monthlySelfReduce + peopleReduceSalary.value;
    });

    const quickLookUpTable: Record<number, {
        quickDeduction: number,
        taxRate: TaxRate,
    }> = {}

    let s = 0;
    taxConfig.rates.forEach((taxRate, index) => {
        if (index > 0) {
            s += (taxRate.min - taxConfig.rates[index - 1].min) / 12 * taxConfig.rates[index - 1].rate / 100
        }
        quickLookUpTable[index] = {
            quickDeduction: taxRate.min / 12 * (taxRate.rate / 100) - s,
            taxRate: taxRate
        }
    })

    const grossSalary = computed(() => {
        if (state.salaryMode === 'gross') {
            return cSalaryInput.value;
        }
        const netSalary = cSalaryInput.value;
        for (let i = 0; i < taxConfig.rates.length; i++) {
            const lookupItem = quickLookUpTable[i];
            const maxInsurane = (taxConfig.maxMonthlySocialInsuraneSalary * taxConfig.socialInsuranceRate / 100);
            const r = lookupItem.taxRate.rate / 100
            const q = lookupItem.quickDeduction
            const D = totalReduceSalary.value
            let gross = (netSalary - r * (D + maxInsurane) + maxInsurane - q) / (1 - r);
            let taxableSalary = 0
            if (gross >= taxConfig.maxMonthlySocialInsuraneSalary) {
                taxableSalary = gross - maxInsurane - D;
            } else {
                gross = 200 * (netSalary - r * D - q) / (179 * (1 - r))
                if (gross <= taxConfig.maxMonthlySocialInsuraneSalary) {
                    taxableSalary = (1 - taxConfig.socialInsuranceRate / 100) * gross - D;
                }
            }

            if (taxableSalary >= (taxConfig.rates[i].min / 12) && (i == taxConfig.rates.length - 1 || taxableSalary <= (taxConfig.rates[i + 1].min / 12))) {
                return Math.round(gross)
            }
        }
        return 0;
    });

    const monthlyInsurance = computed(() => {
        if (state.insuranceMode === 'full') {
            return Math.round(Math.min(grossSalary.value, taxConfig.maxMonthlySocialInsuraneSalary) * taxConfig.socialInsuranceRate / 100);
        }
        return Math.round(Math.min(cInsuranceInput.value, taxConfig.maxMonthlySocialInsuraneSalary) * taxConfig.socialInsuranceRate / 100);
    });

    const monthlyTaxSalary = computed(() => {
        return Math.max(grossSalary.value - totalReduceSalary.value - monthlyInsurance.value, 0);
    });

    const netSalary = computed(() => {
        return Math.round(grossSalary.value - getTotalTax(taxConfig.rates, monthlyTaxSalary.value, 'month') -
            monthlyInsurance.value);
    });

    const monthlyResultRows = computed<ResultRow[]>(() => {
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
                value: formatNumber(getTotalTax(taxConfig.rates, monthlyTaxSalary.value, 'month')),
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
        monthlyResultRows,
    }
}
