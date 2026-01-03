import { describe, it, expect } from 'vitest'
import {
  calculateWeightedTaxRate,
  calculateCapitalTaxRate,
  calculateContributionSummary,
  calculateYearlyProjections,
  calculateFinalSummary,
  calculateTax,
  calculateTaxSavings,
} from './simulation'
import type { YearlySnapshot } from './simulation'
import { STOCK_GAINS_TAX_RATE, BOND_GAINS_TAX_RATE, MIN_TAX_RATE, MAX_TAX_RATE } from './constants'

describe('calculateWeightedTaxRate', () => {
  it('should return stock tax rate for 100% stock allocation', () => {
    const result = calculateWeightedTaxRate(100)
    expect(result).toBe(STOCK_GAINS_TAX_RATE)
  })

  it('should return bond tax rate for 0% stock allocation (100% bonds)', () => {
    const result = calculateWeightedTaxRate(0)
    expect(result).toBe(BOND_GAINS_TAX_RATE)
  })

  it('should return weighted average for 50/50 allocation', () => {
    const result = calculateWeightedTaxRate(50)
    expect(result).toBe(16.25)
  })

  it('should return weighted average for 75% stock allocation', () => {
    const result = calculateWeightedTaxRate(75)
    expect(result).toBe(18.125)
  })

  it('should return weighted average for 25% stock allocation', () => {
    const result = calculateWeightedTaxRate(25)
    expect(result).toBe(14.375)
  })
})

describe('calculateCapitalTaxRate', () => {
  it('should return MAX_TAX_RATE when years of membership is less than threshold', () => {
    const result = calculateCapitalTaxRate(new Date().getFullYear(), 10)
    expect(result).toBe(MAX_TAX_RATE)
  })

  it('should return MAX_TAX_RATE when years of membership equals threshold', () => {
    const result = calculateCapitalTaxRate(new Date().getFullYear(), 15)
    expect(result).toBe(MAX_TAX_RATE)
  })

  it('should decrease tax rate after threshold is passed', () => {
    const result = calculateCapitalTaxRate(new Date().getFullYear(), 16)
    expect(result).toBe(14.7)
  })

  it('should calculate correct tax rate for mid-range membership', () => {
    const result = calculateCapitalTaxRate(new Date().getFullYear(), 20)
    expect(result).toBe(13.5)
  })

  it('should cap tax rate at MIN_TAX_RATE', () => {
    const result = calculateCapitalTaxRate(new Date().getFullYear(), 50)
    expect(result).toBe(MIN_TAX_RATE)
  })

  it('should return exactly MIN_TAX_RATE when calculation equals minimum', () => {
    const result = calculateCapitalTaxRate(new Date().getFullYear(), 35)
    expect(result).toBe(MIN_TAX_RATE)
  })

  it('should calculate correctly when first contribution was 5 years ago', () => {
    const currentYear = new Date().getFullYear()
    const result = calculateCapitalTaxRate(currentYear - 5, 10)
    expect(result).toBe(MAX_TAX_RATE)
  })

  it('should calculate correctly when first contribution was 10 years ago', () => {
    const currentYear = new Date().getFullYear()
    const result = calculateCapitalTaxRate(currentYear - 10, 10)
    expect(result).toBe(13.5)
  })

  it('should calculate correctly when first contribution was 20 years ago', () => {
    const currentYear = new Date().getFullYear()
    const result = calculateCapitalTaxRate(currentYear - 20, 5)
    expect(result).toBe(12)
  })

  it('should cap at MIN_TAX_RATE when first contribution was 30 years ago', () => {
    const currentYear = new Date().getFullYear()
    const result = calculateCapitalTaxRate(currentYear - 30, 10)
    expect(result).toBe(MIN_TAX_RATE)
  })
})

describe('calculateTax', () => {
  it('should calculate correct tax for high income (43% bracket)', () => {
    // Higher income bracket tax calculation
    expect(calculateTax(60000)).toBe(18000)
  })

  it('should calculate correct tax for mid income (33% bracket)', () => {
    // Mid income bracket tax calculation
    expect(calculateTax(40000)).toBe(10400)
  })

  it('should calculate correct tax for low income (23% bracket)', () => {
    // Low income bracket tax calculation
    expect(calculateTax(20000)).toBe(4600)
  })

  it('should return 0 for 0 income', () => {
    expect(calculateTax(0)).toBe(0)
  })
})

describe('calculateTaxSavings', () => {
  it('should calculate correct savings when deduction stays within highest bracket', () => {
    // Tax savings within the same bracket
    expect(calculateTaxSavings(60000, 5000)).toBe(2150)
  })

  it('should calculate correct savings when deduction crosses brackets', () => {
    // Tax savings crossing brackets
    expect(calculateTaxSavings(52000, 5000)).toBe(1850)
  })
})

describe('calculateContributionSummary', () => {
  it('should calculate correctly with only TFR', () => {
    const annualSalary = 27000
    const yearsToRetirement = 10
    const yearOfFirstContribution = new Date().getFullYear()

    const result = calculateContributionSummary(
      annualSalary,
      0, // voluntary
      0, // employer
      0, // additional
      yearsToRetirement,
      yearOfFirstContribution,
    )

    expect(result.totalAnnualContribution).toBe(2000)
    expect(result.grossTotalContribution).toBe(20000)
    expect(result.taxRate).toBe(15)
    expect(result.totalTaxAmount).toBe(3000)
    expect(result.netTotalContribution).toBe(17000)
    // Tax savings should be 0 when there are no deductible contributions
    expect(result.annualTaxSavings).toBe(0)
  })

  it('should respect deductible limit and handle past membership', () => {
    const annualSalary = 50000
    const voluntaryPercent = 2 // 1000
    const employerPercent = 2 // 1000
    const additionalPercent = 100 // Takes all remaining deductible
    const yearsToRetirement = 15
    const currentYear = new Date().getFullYear()
    const yearOfFirstContribution = currentYear - 15 // 15 years in the past

    const result = calculateContributionSummary(
      annualSalary,
      voluntaryPercent,
      employerPercent,
      additionalPercent,
      yearsToRetirement,
      yearOfFirstContribution,
    )

    const expectedAnnual = 3703.7037 + 1000 + 1000 + 3300
    expect(result.totalAnnualContribution).toBeCloseTo(expectedAnnual, 4)
    expect(result.grossTotalContribution).toBeCloseTo(expectedAnnual * 15, 2)
    expect(result.taxRate).toBe(10.5)

    const expectedGross = expectedAnnual * 15
    const expectedTax = (expectedGross * 10.5) / 100
    expect(result.totalTaxAmount).toBeCloseTo(expectedTax, 2)
    expect(result.netTotalContribution).toBeCloseTo(expectedGross - expectedTax, 2)

    // Tax savings calculation across IRPEF brackets
    expect(result.annualTaxSavings).toBeCloseTo(1749, 1)
  })
})

describe('calculateYearlyProjections', () => {
  it('should calculate correctly with zero growth and zero costs', () => {
    // 5 years, 0% return, 15% tax, 1000 contribution, 0% cost, 0 cost fixed
    const result = calculateYearlyProjections(5, 0, 15, 1000, 0, 0)

    expect(result).toHaveLength(5)
    expect(result[0]?.endValue).toBe(1000)
    expect(result[1]?.endValue).toBe(2000)
    expect(result[4]?.endValue).toBe(5000)
  })

  it('should apply compounding growth and tax correctly', () => {
    // 2 years, 10% return, 20% tax, 1000 contribution, 0% cost, 0 cost fixed
    // Year 1: Start 0, Gain 0, Net Gain 0, Contrib 1000, End 1000
    // Year 2: Start 1000, Gain 100, Net Gain 80 (20% tax), Contrib 1000, End 2080
    const result = calculateYearlyProjections(2, 10, 20, 1000, 0, 0)

    expect(result[0]?.endValue).toBe(1000)
    expect(result[1]?.netGain).toBe(80)
    expect(result[1]?.endValue).toBe(2080)
  })

  it('should subtract costs correctly', () => {
    // 1 year, 0% return, 0% tax, 1000 contribution, 1% cost, 10 cost fixed
    // Year 1: Start 0, Gain 0, Contrib 1000, Pre-cost 1000
    // Cost: 1000 * 0.01 + 10 = 20
    // End: 1000 - 20 = 980
    const result = calculateYearlyProjections(1, 0, 0, 1000, 1, 10)

    expect(result[0]?.costs).toBe(20)
    expect(result[0]?.endValue).toBe(980)
  })

  it('should handle capital erosion when costs exceed gains and contributions', () => {
    // Year 1: Start 0, Contrib 500, Cost: 500*0.1 + 100 = 150, End 350
    // Year 2: Start 350, Contrib 500, Total 850, Cost: 850*0.1 + 100 = 185, End 665
    const result = calculateYearlyProjections(2, 0, 0, 500, 10, 100)

    expect(result[0]!.endValue).toBe(350)
    expect(result[1]!.endValue).toBe(665)
  })
})

describe('calculateFinalSummary', () => {
  it('should aggregate yearly data correctly and subtract contribution tax', () => {
    const yearlyData: YearlySnapshot[] = [
      {
        year: 2027,
        netGain: 0,
        capitalGainsTaxPaid: 0,
        costs: 10,
        endValue: 990,
      },
      {
        year: 2028,
        netGain: 80,
        capitalGainsTaxPaid: 20,
        costs: 25,
        endValue: 2045,
      },
    ]

    const result = calculateFinalSummary(yearlyData, 300)

    expect(result.totalCapitalGainsTaxPaid).toBe(20)
    expect(result.totalCostsPaid).toBe(35)
    expect(result.totalAvailableAmount).toBe(1745)
  })

  it('should handle empty yearly data', () => {
    const result = calculateFinalSummary([], 0)
    expect(result.totalAvailableAmount).toBe(0)
    expect(result.totalCapitalGainsTaxPaid).toBe(0)
    expect(result.totalCostsPaid).toBe(0)
  })
})
