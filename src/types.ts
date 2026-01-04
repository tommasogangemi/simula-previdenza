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

export interface ContributionSummary {
  taxRate: number
  totalAnnualContribution: number
  grossTotalContribution: number
  totalTaxAmount: number
  netTotalContribution: number
  annualTaxSavings: number
  annualEmployerContribution: number
  totalEmployerContribution: number
  annualVoluntaryContribution: number
  annualAdditionalContribution: number
  annualCashFlow: number
}

export interface SummaryData {
  totalAvailableAmount: number
  totalCapitalGainsTaxPaid: number
  totalCostsPaid: number
  totalCapitalGains: number
}

export interface SimulationResult {
  fundName?: string
  capitalGainsTaxRate: number
  contributionSummary: ContributionSummary
  yearlyData: YearlySnapshot[]
  summaryData: SummaryData
}
