export const DEDUCTIBLE_LIMIT = 5300
/**
 * Percentage tax on stock gains
 */
export const STOCK_GAINS_TAX_RATE = 20
/**
 * Percentage tax on bond gains
 */
export const BOND_GAINS_TAX_RATE = 12.5
/**
 * Minimum percentage tax on contributions to the fund
 */
export const MIN_TAX_RATE = 9
/**
 * Maximum percentage tax on contributions to the fund
 */
export const MAX_TAX_RATE = 15
/**
 * Number of years before the tax on contributions to the fund start decreasing yearly
 */
export const YEARS_BEFORE_TAX_RATE_DECREASE = 15
/**
 * Amount of yearly decrease of the tax rate on contributions to the fund
 */
export const TAX_RATE_DECREASE = 0.3

/**
 * INPS contribution rate for employees
 */
export const INPS_CONTRIBUTION_RATE = 9.19

/**
 * Italian IRPEF tax brackets for deduction calculation
 */
export const TAX_BRACKETS = [
  { threshold: 50000, rate: 43 },
  { threshold: 28000, rate: 33 },
  { threshold: 0, rate: 23 },
]
