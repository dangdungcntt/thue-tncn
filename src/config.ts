import type { TaxConfig } from "./model";

export const TaxConfig2025: TaxConfig = {
    monthlySelfDeduction: 11000000,
    monthlyDependentDeduction: 4400000,
    healthInsurancePercent: 1.5,
    employmentInsurancePercent: 1,
    socialInsurancePercent: 8,
    maxMonthlySocialInsuraneSalary: 46800000,
    levels: [
        { min: 0, percent: 5 },
        { min: 60000000, percent: 10 },
        { min: 120000000, percent: 15 },
        { min: 216000000, percent: 20 },
        { min: 384000000, percent: 25 },
        { min: 624000000, percent: 30 },
        { min: 960000000, percent: 35 },
    ],
    employmentInsuranceFactor: 20,
    minMonthlySalaryByZone: {
        I: 4960000,
        II: 4410000,
        III: 3860000,
        IV: 3450000,
    }
};

export const TaxConfig2026: TaxConfig = {
    monthlySelfDeduction: 15500000,
    monthlyDependentDeduction: 6200000,
    healthInsurancePercent: 1.5,
    employmentInsurancePercent: 1,
    socialInsurancePercent: 8,
    maxMonthlySocialInsuraneSalary: 46800000,
    levels: [
        { min: 0, percent: 5 },
        { min: 120000000, percent: 10 },
        { min: 360000000, percent: 20 },
        { min: 720000000, percent: 30 },
        { min: 1200000000, percent: 35 },
    ],
    employmentInsuranceFactor: 20,
    minMonthlySalaryByZone: {
        I: 5310000,
        II: 4730000,
        III: 4140000,
        IV: 3700000,
    }
};
