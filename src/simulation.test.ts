import { describe, it, expect } from 'vitest'
import {
  calculateWeightedTaxRate,
  calculateCapitalTaxRate,
  calculateContributionSummary,
} from './simulation'
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

    // TFR: 27000 / 13.5 = 2000
    expect(result.totalAnnualContribution).toBe(2000)
    // Gross: 2000 * 10 = 20000
    expect(result.grossTotalContribution).toBe(20000)
    expect(result.taxRate).toBe(15)
    // Tax: 20000 * 0.15 = 3000
    expect(result.totalTaxAmount).toBe(3000)
    // Net: 20000 - 3000 = 17000
    expect(result.netTotalContribution).toBe(17000)
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

    // Annual TFR: 50000 / 13.5 = 3703.70...
    // Annual Voluntary: 1000
    // Annual Employer: 1000
    // Remaining Deductible: 5300 - 1000 - 1000 = 3300
    // Annual Additional: 3300
    const expectedAnnual = 3703.7037 + 1000 + 1000 + 3300 // 9003.7037...
    expect(result.totalAnnualContribution).toBeCloseTo(expectedAnnual, 4)

    // Gross: expectedAnnual * 15 = 135055.55...
    expect(result.grossTotalContribution).toBeCloseTo(expectedAnnual * 15, 2)

    expect(result.taxRate).toBe(10.5)

    // Tax amount: gross * 10.5%
    const expectedGross = expectedAnnual * 15
    const expectedTax = (expectedGross * 10.5) / 100
    expect(result.totalTaxAmount).toBeCloseTo(expectedTax, 2)
    expect(result.netTotalContribution).toBeCloseTo(expectedGross - expectedTax, 2)
  })
})
