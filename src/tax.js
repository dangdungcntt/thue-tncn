export const TaxRates = [
    { min: 0, rate: 5 },
    { min: 60000000, rate: 10 },
    { min: 120000000, rate: 15 },
    { min: 216000000, rate: 20 },
    { min: 384000000, rate: 25 },
    { min: 624000000, rate: 30 },
    { min: 960000000, rate: 35 },
];

export function GetTax(taxSalary, mode = 'year') {
    let divide = 1;
    if (mode === 'month') {
        divide = 12;
    }
    let tax = 0;
    for (let i = TaxRates.length - 1; i >= 0; i--) {
        let rate = TaxRates[i];
        rate.min /= divide;

        if (taxSalary >= rate.min) {
            tax += (taxSalary - rate.min) * rate.rate / 100;
            taxSalary = rate.min;
        }
    }
    return tax;
}
