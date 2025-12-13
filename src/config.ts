import { TaxConfig } from "./model";

export const TaxConfig2025: TaxConfig = {
    monthlySelfReduce: 11000000,
    monthlyPeopleReduce: 4400000,
    healthInsuranceRate: 1.5,
    employmentInsuranceRate: 1,
    socialInsuranceRate: 8,
    maxMonthlySocialInsuraneSalary: 46800000,
    rates: [
        { min: 0, rate: 5 },
        { min: 60000000, rate: 10 },
        { min: 120000000, rate: 15 },
        { min: 216000000, rate: 20 },
        { min: 384000000, rate: 25 },
        { min: 624000000, rate: 30 },
        { min: 960000000, rate: 35 },
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
    monthlySelfReduce: 15500000,
    monthlyPeopleReduce: 6200000,
    healthInsuranceRate: 1.5,
    employmentInsuranceRate: 1,
    socialInsuranceRate: 8,
    maxMonthlySocialInsuraneSalary: 46800000,
    rates: [
        { min: 0, rate: 5 },
        { min: 120000000, rate: 10 },
        { min: 360000000, rate: 20 },
        { min: 720000000, rate: 30 },
        { min: 1200000000, rate: 35 },
    ],
    employmentInsuranceFactor: 20,
    minMonthlySalaryByZone: {
        I: 5310000,
        II: 4730000,
        III: 4140000,
        IV: 3700000,
    }
};
