export interface TaxLevel {
    min: number
    max?: number
    percent: number
}

export interface TaxLevelRow {
    taxLevel: TaxLevel
    monthlyTaxValue?: number
}

export type TaxConfig = {
    monthlySelfDeduction: number
    monthlyDependentDeduction: number
    socialInsurancePercent: number
    healthInsurancePercent: number
    employmentInsurancePercent: number
    maxMonthlySocialInsuraneSalary: number
    levels: TaxLevel[]
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
    salaryInput: string;
    numberOfDependent: number;
    insuranceMode: 'salary' | 'payed',
    insuranceSlaryMode: 'full' | 'custom',
    insuranceInput: string,
    payedTaxInput: string
    zone: 'I' | 'II' | 'III' | 'IV'
}

export type IncomeInputForm = {
    salaryMode: 'gross' | 'net';
    salaryInput: string;
    numberOfDependent: number;
    insuranceSalaryMode: 'full' | 'custom',
    insuranceSalaryInput: string,
    zone: 'I' | 'II' | 'III' | 'IV'
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

export const SalaryInsuranceModes = [
    { label: 'Toàn bộ lương', value: 'full' },
    { label: 'Khác', value: 'custom' }
];
export const Zones = ["I", "II", "III", "IV"]
