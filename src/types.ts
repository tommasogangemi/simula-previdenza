export interface PensionFundData {
  fundName?: string
  annualSalary: number
  fundCostPercent: number
  fundCostFixed: number
  stockAllocationPercent: number
  expectedReturnPercent: number
  yearsToRetirement: number
  yearOfFirstContribution: number
  voluntaryContributionPercent: number
  employerContributionPercent: number
  additionalDeductibleContributionPercent: number
}

export interface YearlySnapshot {
  year: number
  netGain: number
  capitalGainsTaxPaid: number
  costs: number
  endValue: number
}

/**
 * Aggregates the values related to contributions to the fund, on a yearly basis.
 */
export interface AnnualContributions {
  totalAnnualContribution: number
  annualTaxSavings: number
  annualEmployerContribution: number
  annualVoluntaryContribution: number
  annualAdditionalContribution: number
  annualCashFlow: number
}

/**
 * Aggregates the final values for the simulation with totals over the whole simulation period.
 */
export interface SimulationSummary {
  finalNetAmount: number
  grossTotalContribution: number
  totalContributionsTaxAmount: number
  netTotalContribution: number
  contributionsTaxRate: number
  totalEmployerContribution: number
  totalCapitalGainsTaxPaid: number
  totalCostsPaid: number
  totalCapitalGains: number
}

export interface SimulationResult {
  fundName?: string
  capitalGainsTaxRate: number
  annualContributions: AnnualContributions
  yearlyData: YearlySnapshot[]
  simulationSummary: SimulationSummary
}
