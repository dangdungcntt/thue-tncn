export interface TaxRate {
    min: number
    max?: number
    rate: number
}

export type TaxConfig = {
    selfReduce: number
    peopleReduce: number
    insuranceRate: number
    rates: TaxRate[]
}

export type InputForm = {
    salaryMode: string;
    totalSalary: string;
    numberOfPeople: number;
    insuranceMode: 'salary' | 'payed',
    insuranceInput: string,
    payedTax: string
}

export type ResultRow = {
    label: string;
    value: string;
    heading?: boolean;
    compare?: boolean;
}
