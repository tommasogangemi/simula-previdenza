import { describe, it, expect } from 'vitest'
import {
  calculateWeightedTaxRate,
  calculateCapitalTaxRate,
  calculateTax,
  calculateTaxSavings,
} from './tax'
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
