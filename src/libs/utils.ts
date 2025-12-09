import { TaxRate } from "../model";

export function getTax(rates: TaxRate[], taxSalary: number, mode = 'year') {
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
