export interface TaxRate {
    min: number
    max?: number
    rate: number
}

export type TaxConfig = {
    selfReduce: number
    peopleReduce: number
    insuranceRate: number
    maxInsuranePerMonth: number
    rates: TaxRate[]
}

export type TaxInputForm = {
    salaryMode: string;
    totalSalary: string;
    numberOfPeople: number;
    insuranceMode: 'salary' | 'payed',
    insuranceInput: string,
    payedTax: string
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
    heading?: boolean;
    compare?: boolean;
    invertCompare?: boolean;
}
