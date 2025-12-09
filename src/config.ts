import { TaxConfig } from "./model";

export const TaxConfig2025: TaxConfig = {
    selfReduce: 11000000,
    peopleReduce: 4400000,
    maxInsuranePerMonth: 46800000,
    insuranceRate: 10.5,
    rates: [
        { min: 0, rate: 5 },
        { min: 60000000, rate: 10 },
        { min: 120000000, rate: 15 },
        { min: 216000000, rate: 20 },
        { min: 384000000, rate: 25 },
        { min: 624000000, rate: 30 },
        { min: 960000000, rate: 35 },
    ]
};

export const TaxConfig2026: TaxConfig = {
    selfReduce: 15500000,
    peopleReduce: 6200000,
    maxInsuranePerMonth: 46800000,
    insuranceRate: 10.5,
    rates: [
        { min: 0, rate: 5 },
        { min: 60000000, rate: 10 },
        { min: 120000000, rate: 15 },
        { min: 216000000, rate: 20 },
        { min: 384000000, rate: 25 },
        { min: 624000000, rate: 30 },
        { min: 960000000, rate: 35 },
    ]
};
