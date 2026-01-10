import type {
  PensionFundData,
  YearlySnapshot,
  AnnualContributions,
  SimulationResult,
  SimulationSummary,
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
 * Calculates the annual contribution summary based on the given parameters.
 * Focuses on annual values only. Aggregated totals are calculated in the simulation summary.
 */
export const calculateAnnualContributions = (
  annualSalary: number,
  voluntaryContributionPercent: number,
  employerContributionPercent: number,
  additionalDeductibleContributionPercent: number,
): AnnualContributions => {
  const annualTFR = calculateAnnualTFR(annualSalary)

  const annualVoluntary = (annualSalary * voluntaryContributionPercent) / 100
  const annualEmployer = (annualSalary * employerContributionPercent) / 100
  const remainingDeductible = Math.max(0, DEDUCTIBLE_LIMIT - annualVoluntary - annualEmployer)
  const annualAdditional = (remainingDeductible * additionalDeductibleContributionPercent) / 100

  const taxableIncome = annualSalary * (1 - INPS_CONTRIBUTION_RATE / 100)
  const totalDeductibleContributions = annualVoluntary + annualEmployer + annualAdditional
  const annualTaxSavings = calculateTaxSavings(taxableIncome, totalDeductibleContributions)

  const totalAnnualContribution = annualTFR + totalDeductibleContributions

  return {
    totalAnnualContribution,
    annualTaxSavings,
    annualEmployerContribution: annualEmployer,
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
export const calculateSimulationSummary = (
  yearlyData: YearlySnapshot[],
  annualContributionSummary: AnnualContributions,
  yearsToRetirement: number,
  yearOfFirstContribution: number,
): SimulationSummary => {
  if (yearlyData.length === 0) {
    return {
      finalNetAmount: 0,
      totalCapitalGainsTaxPaid: 0,
      totalCostsPaid: 0,
      totalCapitalGains: 0,
      grossTotalContribution: 0,
      totalContributionsTaxAmount: 0,
      netTotalContribution: 0,
      contributionsTaxRate: 0,
      totalEmployerContribution: 0,
    }
  }

  const lastSnapshot = yearlyData[yearlyData.length - 1]
  const totalCapitalGainsTaxPaid = yearlyData.reduce(
    (acc, curr) => acc + curr.capitalGainsTaxPaid,
    0,
  )
  const totalCostsPaid = yearlyData.reduce((acc, curr) => acc + curr.costs, 0)
  const totalCapitalGains = yearlyData.reduce((acc, curr) => acc + curr.netGain, 0)

  // Contribution aggregations
  const contributionTaxRate = calculateCapitalTaxRate(yearOfFirstContribution, yearsToRetirement)
  const grossTotalContribution =
    annualContributionSummary.totalAnnualContribution * yearsToRetirement
  const totalTaxAmount = (grossTotalContribution * contributionTaxRate) / 100
  const netTotalContribution = grossTotalContribution - totalTaxAmount
  const totalEmployerContribution =
    annualContributionSummary.annualEmployerContribution * yearsToRetirement

  // Final available fund = gross accumulated at end - taxes on contributions
  const totalAvailableAmount = Math.max(0, lastSnapshot!.endValue - totalTaxAmount)

  return {
    finalNetAmount: totalAvailableAmount,
    totalCapitalGainsTaxPaid,
    totalCostsPaid,
    totalCapitalGains,
    grossTotalContribution,
    totalContributionsTaxAmount: totalTaxAmount,
    netTotalContribution,
    contributionsTaxRate: contributionTaxRate,
    totalEmployerContribution,
  }
}

export const simulate = (data: PensionFundData): SimulationResult => {
  const {
    stockAllocationPercent,
    annualSalary,
    yearsToRetirement,
    expectedReturnPercent,
    fundCostPercent,
    fundCostFixed,
    yearOfFirstContribution = new Date().getFullYear(),
    voluntaryContributionPercent = 0,
    employerContributionPercent = 0,
    additionalDeductibleContributionPercent = 0,
  } = data

  const annualContributionSummary = calculateAnnualContributions(
    annualSalary,
    voluntaryContributionPercent,
    employerContributionPercent,
    additionalDeductibleContributionPercent,
  )

  const capitalGainsTaxRate = calculateWeightedTaxRate(stockAllocationPercent)

  const yearlyData = calculateYearlyProjections(
    yearsToRetirement,
    expectedReturnPercent,
    capitalGainsTaxRate,
    annualContributionSummary.totalAnnualContribution,
    fundCostPercent,
    fundCostFixed,
  )

  const simulationSummary = calculateSimulationSummary(
    yearlyData,
    annualContributionSummary,
    yearsToRetirement,
    yearOfFirstContribution,
  )

  return {
    fundName: data.fundName,
    capitalGainsTaxRate,
    annualContributions: annualContributionSummary,
    yearlyData,
    simulationSummary,
  }
}
