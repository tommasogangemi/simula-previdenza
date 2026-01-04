import { describe, it, expect } from 'vitest'
import {
  calculateContributionSummary,
  calculateYearlyProjections,
  calculateFinalSummary,
} from './simulation'
import type { YearlySnapshot } from './types'

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
