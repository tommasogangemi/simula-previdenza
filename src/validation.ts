import { number, object, Schema, string } from 'yup'
import type { PensionFundData } from './types'

export const pensionFormValidationSchema: Schema<PensionFundData> = object({
  fundName: string(),
  annualSalary: number().required('Campo obbligatorio').min(0, 'Inserisci un numero positivo'),
  fundCostPercent: number().required('Campo obbligatorio').min(0, 'Inserisci un numero positivo'),
  fundCostFixed: number().required('Campo obbligatorio').min(0, 'Inserisci un numero positivo'),
  stockAllocationPercent: number()
    .required('Campo obbligatorio')
    .min(0, 'Inserisci un numero positivo'),
  expectedReturnPercent: number().required('Campo obbligatorio'),
  yearsToRetirement: number().required('Campo obbligatorio').min(0, 'Inserisci un numero positivo'),
  yearOfFirstContribution: number(),
  voluntaryContributionPercent: number()
    .min(0, 'Inserisci un numero tra 0 e 100')
    .max(100, 'Inserisci un numero tra 0 e 100'),
  employerContributionPercent: number()
    .min(0, 'Inserisci un numero tra 0 e 100')
    .max(100, 'Inserisci un numero tra 0 e 100'),
  additionalDeductibleContributionPercent: number()
    .min(0, 'Inserisci un numero tra 0 e 100')
    .max(100, 'Inserisci un numero tra 0 e 100'),
})
