export interface ConstrainedRoundingResult {
    roundedItems: number[]
    roundedTotal: number
}

/**
 * Constrained rounding:
 * - Total is rounded normally
 * - Items are rounded so that their sum equals the rounded total
 */
export function useConstrainedRounding(
    values: number[],
    options?: {
        precision?: number   // default: 0 (integer)
        priority?: number[]  // optional fixed priority order
    },
): ConstrainedRoundingResult {
    const precision = options?.precision ?? 0
    const factor = Math.pow(10, precision)

    // 1. Scale values if precision > 0
    const scaled = values.map(v => v * factor)

    // 2. Round total
    const rawTotal = scaled.reduce((a, b) => a + b, 0)
    const roundedTotal = Math.round(rawTotal)

    // 3. Floor each item
    const floors = scaled.map(v => Math.floor(v))
    let currentSum = floors.reduce((a, b) => a + b, 0)

    // 4. Calculate delta
    let delta = roundedTotal - currentSum

    if (delta > 0) {
        // 5. Fractional parts
        const fractions = scaled.map((v, i) => ({
            index: i,
            fraction: v - Math.floor(v),
            priority: options?.priority?.[i] ?? 0,
        }))

        // 6. Sort by fraction desc, then priority desc
        fractions.sort((a, b) => {
            if (b.fraction !== a.fraction) return b.fraction - a.fraction
            return b.priority - a.priority
        })

        // 7. Distribute remainder
        for (let i = 0; i < delta; i++) {
            floors[fractions[i].index] += 1
        }
    }

    return {
        roundedItems: floors.map(v => v / factor),
        roundedTotal: roundedTotal / factor,
    }
}
