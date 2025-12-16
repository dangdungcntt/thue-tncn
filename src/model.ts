export interface TaxRate {
    min: number
    max?: number
    rate: number
}

export interface TaxRateRow {
    taxRate: TaxRate
    monthlyTaxValue?: number
}

export type TaxConfig = {
    monthlySelfReduce: number
    monthlyPeopleReduce: number
    socialInsuranceRate: number
    healthInsuranceRate: number
    employmentInsuranceRate: number
    maxMonthlySocialInsuraneSalary: number
    rates: TaxRate[]
    employmentInsuranceFactor: number
    minMonthlySalaryByZone: {
        I: number,
        II: number,
        III: number,
        IV: number,
    }
}

export type TaxInputForm = {
    salaryMode: string;
    totalSalary: string;
    numberOfPeople: number;
    insuranceMode: 'salary' | 'payed',
    slaryForInsuranceMode: 'full' | 'custom',
    insuranceInput: string,
    payedTax: string
    zone: 'I' | 'II' | 'III' | 'IV'
}

export type IncomeInputForm = {
    salaryMode: 'gross' | 'net';
    totalSalary: string;
    numberOfPeople: number;
    insuranceMode: 'full' | 'custom',
    insuranceInput: string,
}

export type ResultRow = {
    label: string;
    value: string;
    tooltip?: string | false;
    value_tooltip?: string | false;
    heading?: boolean;
    compare?: boolean;
    invertCompare?: boolean;
}
