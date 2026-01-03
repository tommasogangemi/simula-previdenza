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

export interface YearlySnapshot {
  year: number
  netGain: number
  capitalGainsTaxPaid: number
  costs: number
  endValue: number
}

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
  yearlyData: YearlySnapshot[]
  summaryData: SummaryData
}

export interface SummaryData {
  totalAvailableFund: number
  totalCapitalGainsTaxPaid: number
  totalCostsPaid: number
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

/**
 * Calculates a year-by-year projection of the pension fund value.
 */
export const calculateYearlyProjections = (
  yearsToRetirement: number,
  expectedReturnPercent: number,
  capitalGainsTaxRate: number,
  annualContribution: number,
  fundCostPercent: number,
  fundCostFixed: number,
): YearlySnapshot[] => {
  const snapshots: YearlySnapshot[] = []

  const currentYear = new Date().getFullYear()

  let currentValue = 0

  for (let i = 0; i < yearsToRetirement; i++) {
    const startingValue = currentValue

    // Compute capital gain
    const capitalGain = startingValue * (expectedReturnPercent / 100)

    // Compute net gain removing capital gain tax
    const capitalGainsTaxPaid = capitalGain * (capitalGainsTaxRate / 100)
    const netGain = capitalGain - capitalGainsTaxPaid

    // Sum net gain to starting value + contributions
    const valueBeforeCost = startingValue + netGain + annualContribution

    // Compute percentage cost from obtained total
    const percentageCost = valueBeforeCost * (fundCostPercent / 100)

    // Detract costs
    const totalCosts = percentageCost + fundCostFixed
    const endValue = Math.max(0, valueBeforeCost - totalCosts)

    snapshots.push({
      year: currentYear + i,
      netGain,
      capitalGainsTaxPaid,
      costs: totalCosts,
      endValue,
    })

    currentValue = endValue
  }

  return snapshots
}

/**
 * Calculates a summary of the final results of the simulation.
 */
export const calculateFinalSummary = (
  yearlyData: YearlySnapshot[],
  totalContributionTaxAmount: number,
): SummaryData => {
  if (yearlyData.length === 0) {
    return {
      totalAvailableFund: 0,
      totalCapitalGainsTaxPaid: 0,
      totalCostsPaid: 0,
    }
  }

  const lastSnapshot = yearlyData[yearlyData.length - 1]
  const totalCapitalGainsTaxPaid = yearlyData.reduce(
    (acc, curr) => acc + curr.capitalGainsTaxPaid,
    0,
  )
  const totalCostsPaid = yearlyData.reduce((acc, curr) => acc + curr.costs, 0)

  // Final available fund = gross accumulated at end - taxes on contributions
  const totalAvailableFund = Math.max(0, lastSnapshot!.endValue - totalContributionTaxAmount)

  return {
    totalAvailableFund,
    totalCapitalGainsTaxPaid,
    totalCostsPaid,
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
    expectedReturnPercent,
    fundCostPercent,
    fundCostFixed,
  } = data

  const contributionSummary = calculateContributionSummary(
    annualSalary,
    voluntaryContributionPercent,
    employerContributionPercent,
    additionalDeductibleContributionPercent,
    yearsToRetirement,
    yearOfFirstContribution,
  )

  const capitalGainsTaxRate = calculateWeightedTaxRate(stockAllocationPercent)

  const yearlyData = calculateYearlyProjections(
    yearsToRetirement,
    expectedReturnPercent,
    capitalGainsTaxRate,
    contributionSummary.totalAnnualContribution,
    fundCostPercent,
    fundCostFixed,
  )

  const summaryData = calculateFinalSummary(yearlyData, contributionSummary.totalTaxAmount)

  return {
    capitalGainsTaxRate,
    contributionSummary,
    yearlyData,
    summaryData,
  }
}
