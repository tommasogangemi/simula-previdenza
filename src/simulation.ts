import type { PensionFundData } from './types'
import {
  STOCK_GAINS_TAX_RATE,
  BOND_GAINS_TAX_RATE,
  MIN_TAX_RATE,
  MAX_TAX_RATE,
  YEARS_BEFORE_TAX_RATE_DECREASE,
  TAX_RATE_DECREASE,
} from './constants'

export interface SimulationResult {
  capitalGainsTaxRate: number
  capitalTaxationRate: number
  annualTFR: number
}

export const calculateWeightedTaxRate = (stockAllocationPercent: number): number => {
  const bondPercent = 100 - stockAllocationPercent
  // Weighted average tax rate: (Stock% * STOCK_GAINS_TAX_RATE%) + (Bond% * BOND_GAINS_TAX_RATE%)
  return (
    (stockAllocationPercent / 100) * STOCK_GAINS_TAX_RATE +
    (bondPercent / 100) * BOND_GAINS_TAX_RATE
  )
}

export const calculateAnnualTFR = (annualSalary: number): number => {
  return annualSalary / 13.5
}

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

export const simulate = (data: PensionFundData): SimulationResult => {
  const { stockAllocationPercent, annualSalary, yearOfFirstContribution, yearsToRetirement } = data

  return {
    capitalGainsTaxRate: calculateWeightedTaxRate(stockAllocationPercent),
    capitalTaxationRate: calculateCapitalTaxRate(yearOfFirstContribution, yearsToRetirement),
    annualTFR: calculateAnnualTFR(annualSalary),
  }
}
