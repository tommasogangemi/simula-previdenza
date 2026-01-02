import type { PensionFundData } from './types'

export interface SimulationResult {
  capitalGainsTaxRate: number
  annualTFR: number
}

export const calculateWeightedTaxRate = (stockAllocationPercent: number): number => {
  const bondPercent = 100 - stockAllocationPercent
  // Weighted average tax rate: (Stock% * 20%) + (Bond% * 12.5%)
  return (stockAllocationPercent / 100) * 20 + (bondPercent / 100) * 12.5
}

export const calculateAnnualTFR = (annualSalary: number): number => {
  return annualSalary / 13.5
}

export const simulate = (data: PensionFundData): SimulationResult => {
  return {
    capitalGainsTaxRate: calculateWeightedTaxRate(data.stockAllocationPercent),
    annualTFR: calculateAnnualTFR(data.annualSalary),
  }
}
