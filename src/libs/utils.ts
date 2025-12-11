import { TaxRate } from "../model";

export function getTotalTax(rates: TaxRate[], taxSalary: number, mode: 'month' | 'year' = 'year') {
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

export function getTaxRateValue(taxRate: TaxRate, monthlyTaxSalary: number) {
    let currentLevelTaxSalary = (monthlyTaxSalary - taxRate.min / 12);
    if (taxRate.max) {
        currentLevelTaxSalary = Math.min(
            (taxRate.max - taxRate.min) / 12,
            currentLevelTaxSalary
        )
    }

    return currentLevelTaxSalary * taxRate.rate / 100;
}

export function formatNumber(number: number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
};
