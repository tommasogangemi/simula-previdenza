import type {
  PensionFundData,
  YearlySnapshot,
  ContributionSummary,
  SimulationResult,
  SummaryData,
} from './types'
import { DEDUCTIBLE_LIMIT, INPS_CONTRIBUTION_RATE } from './constants'
import { calculateWeightedTaxRate, calculateCapitalTaxRate, calculateTaxSavings } from './tax'

/**
 * Calculates the annual TFR based on annual salary.
 */
export const calculateAnnualTFR = (annualSalary: number): number => {
  return annualSalary / 13.5
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

  const taxableIncome = annualSalary * (1 - INPS_CONTRIBUTION_RATE / 100)
  const totalDeductibleContributions = annualVoluntary + annualEmployer + annualAdditional
  const annualTaxSavings = calculateTaxSavings(taxableIncome, totalDeductibleContributions)

  const totalAnnualContribution = annualTFR + totalDeductibleContributions
  const grossTotalContribution = totalAnnualContribution * yearsToRetirement
  const totalTaxAmount = (grossTotalContribution * taxRate) / 100
  const netTotalContribution = grossTotalContribution - totalTaxAmount

  return {
    taxRate,
    totalAnnualContribution,
    grossTotalContribution,
    totalTaxAmount,
    netTotalContribution,
    annualTaxSavings,
    annualEmployerContribution: annualEmployer,
    totalEmployerContribution: annualEmployer * yearsToRetirement,
    annualVoluntaryContribution: annualVoluntary,
    annualAdditionalContribution: annualAdditional,
    annualCashFlow: annualTaxSavings - (annualVoluntary + annualAdditional),
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
      totalAvailableAmount: 0,
      totalCapitalGainsTaxPaid: 0,
      totalCostsPaid: 0,
      totalCapitalGains: 0,
    }
  }

  const lastSnapshot = yearlyData[yearlyData.length - 1]
  const totalCapitalGainsTaxPaid = yearlyData.reduce(
    (acc, curr) => acc + curr.capitalGainsTaxPaid,
    0,
  )
  const totalCostsPaid = yearlyData.reduce((acc, curr) => acc + curr.costs, 0)
  const totalCapitalGains = yearlyData.reduce((acc, curr) => acc + curr.netGain, 0)

  // Final available fund = gross accumulated at end - taxes on contributions
  const totalAvailableAmount = Math.max(0, lastSnapshot!.endValue - totalContributionTaxAmount)

  return {
    totalAvailableAmount,
    totalCapitalGainsTaxPaid,
    totalCostsPaid,
    totalCapitalGains,
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
    fundName: data.fundName,
    capitalGainsTaxRate,
    contributionSummary,
    yearlyData,
    summaryData,
  }
}
