import type { TaxLevel } from "@/model";
import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getTotalTax(levels: TaxLevel[], taxSalary: number, mode: 'month' | 'year' = 'year') {
    let divide = 1;
    if (mode === 'month') {
        divide = 12;
    }
    let tax = 0;
    for (let i = levels.length - 1; i >= 0; i--) {
        let level = levels[i]!;
        const minSalary = level.min / divide;

        if (taxSalary >= minSalary) {
            tax += (taxSalary - minSalary) * level.percent / 100;
            taxSalary = minSalary;
        }
    }
    return tax;
}

export function getTaxLevelValue(taxLevel: TaxLevel, monthlyTaxSalary: number) {
    let currentLevelTaxSalary = (monthlyTaxSalary - taxLevel.min / 12);
    if (taxLevel.max) {
        currentLevelTaxSalary = Math.min(
            (taxLevel.max - taxLevel.min) / 12,
            currentLevelTaxSalary
        )
    }

    return currentLevelTaxSalary * taxLevel.percent / 100;
}

export function formatNumber(number: number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
};
