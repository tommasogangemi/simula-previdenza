import {
  STOCK_GAINS_TAX_RATE,
  BOND_GAINS_TAX_RATE,
  MIN_TAX_RATE,
  MAX_TAX_RATE,
  YEARS_BEFORE_TAX_RATE_DECREASE,
  TAX_RATE_DECREASE,
  TAX_BRACKETS,
} from './constants'

/**
 * Calculates the weighted tax rate based on the given stock allocation percentage.
 */
export const calculateWeightedTaxRate = (stockAllocationPercent: number): number => {
  const bondPercent = 100 - stockAllocationPercent
  // Weighted average tax rate: (Stock% * STOCK_GAINS_TAX_RATE%) + (Bond% * BOND_GAINS_TAX_RATE%)
  return (
    (stockAllocationPercent / 100) * STOCK_GAINS_TAX_RATE +
    (bondPercent / 100) * BOND_GAINS_TAX_RATE
  )
}

/**
 * Calculates the tax rate on contributions added to the pension fund based on the number of years of membership.
 */
export const calculateCapitalTaxRate = (
  yearOfFirstContribution: number,
  yearsToRetirement: number,
): number => {
  const currentYear = new Date().getFullYear()
  const projectedRetirementYear = currentYear + yearsToRetirement
  const yearsOfMembership = projectedRetirementYear - yearOfFirstContribution

  if (yearsOfMembership < YEARS_BEFORE_TAX_RATE_DECREASE) {
    return MAX_TAX_RATE
  }

  const taxRate =
    MAX_TAX_RATE - (yearsOfMembership - YEARS_BEFORE_TAX_RATE_DECREASE) * TAX_RATE_DECREASE

  return Math.max(taxRate, MIN_TAX_RATE)
}

/**
 * Calculates the tax for a given income based on IRPEF brackets.
 */
export const calculateTax = (income: number): number => {
  let tax = 0
  let remainingIncome = income

  for (const bracket of TAX_BRACKETS) {
    if (remainingIncome > bracket.threshold) {
      const taxableInThisBracket = remainingIncome - bracket.threshold
      tax += (taxableInThisBracket * bracket.rate) / 100
      remainingIncome = bracket.threshold
    }
  }

  return tax
}

/**
 * Calculates the tax savings (deduction) based on the income and the deductible amount.
 */
export const calculateTaxSavings = (income: number, deduction: number): number => {
  const taxBeforeDeduction = calculateTax(income)
  const taxAfterDeduction = calculateTax(Math.max(0, income - deduction))
  return taxBeforeDeduction - taxAfterDeduction
}
