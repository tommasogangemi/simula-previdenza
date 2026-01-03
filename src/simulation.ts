import type { PensionFundData } from './types'
import {
  STOCK_GAINS_TAX_RATE,
  BOND_GAINS_TAX_RATE,
  MIN_TAX_RATE,
  MAX_TAX_RATE,
  YEARS_BEFORE_TAX_RATE_DECREASE,
  TAX_RATE_DECREASE,
  DEDUCTIBLE_LIMIT,
} from './constants'

export interface ContributionSummary {
  taxRate: number
  totalAnnualContribution: number
  grossTotalContribution: number
  totalTaxAmount: number
  netTotalContribution: number
}

export interface SimulationResult {
  capitalGainsTaxRate: number
  contributionSummary: ContributionSummary
}

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

export const calculateAnnualTFR = (annualSalary: number): number => {
  return annualSalary / 13.5
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
 * Calculates the contribution summary based on the given parameters.
 * Focuses on the contributions that will be taxed at the end of the simulation with the contribution tax rate.
 */
export const calculateContributionSummary = (
  annualSalary: number,
  voluntaryContributionPercent: number,
  employerContributionPercent: number,
  additionalDeductibleContributionPercent: number,
  yearsToRetirement: number,
  yearOfFirstContribution: number,
): ContributionSummary => {
  const taxRate = calculateCapitalTaxRate(yearOfFirstContribution, yearsToRetirement)
  const annualTFR = calculateAnnualTFR(annualSalary)

  const annualVoluntary = (annualSalary * voluntaryContributionPercent) / 100
  const annualEmployer = (annualSalary * employerContributionPercent) / 100
  const remainingDeductible = Math.max(0, DEDUCTIBLE_LIMIT - annualVoluntary - annualEmployer)
  const annualAdditional = (remainingDeductible * additionalDeductibleContributionPercent) / 100

  const totalAnnualContribution = annualTFR + annualVoluntary + annualEmployer + annualAdditional
  const grossTotalContribution = totalAnnualContribution * yearsToRetirement
  const totalTaxAmount = (grossTotalContribution * taxRate) / 100
  const netTotalContribution = grossTotalContribution - totalTaxAmount

  return {
    taxRate,
    totalAnnualContribution,
    grossTotalContribution,
    totalTaxAmount,
    netTotalContribution,
  }
}

export const simulate = (data: PensionFundData): SimulationResult => {
  const {
    stockAllocationPercent,
    annualSalary,
    yearOfFirstContribution,
    yearsToRetirement,
    voluntaryContributionPercent,
    employerContributionPercent,
    additionalDeductibleContributionPercent,
  } = data

  const contributionSummary = calculateContributionSummary(
    annualSalary,
    voluntaryContributionPercent,
    employerContributionPercent,
    additionalDeductibleContributionPercent,
    yearsToRetirement,
    yearOfFirstContribution,
  )

  return {
    capitalGainsTaxRate: calculateWeightedTaxRate(stockAllocationPercent),
    contributionSummary,
  }
}
