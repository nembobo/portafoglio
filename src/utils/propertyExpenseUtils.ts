import { Property, PropertyExpense, ExpenseFrequency, RentalContract } from '../types';

export const EXPENSE_FREQUENCY_LABELS: Record<ExpenseFrequency, string> = {
  MONTHLY: 'Mensile',
  BIMONTHLY: 'Bimestrale',
  QUARTERLY: 'Trimestrale',
  SEMIANNUAL: 'Semestrale',
  ANNUAL: 'Annuale',
  ONE_OFF: 'Una Tantum'
};

export function calculateExpenseAnnual(amount: number, frequency: ExpenseFrequency): number {
  switch (frequency) {
    case 'MONTHLY':
      return amount * 12;
    case 'BIMONTHLY':
      return amount * 6;
    case 'QUARTERLY':
      return amount * 4;
    case 'SEMIANNUAL':
      return amount * 2;
    case 'ANNUAL':
      return amount;
    case 'ONE_OFF':
      return amount; // Imputato sull'anno in corso
    default:
      return amount;
  }
}

export function calculateExpenseMonthly(amount: number, frequency: ExpenseFrequency): number {
  return calculateExpenseAnnual(amount, frequency) / 12;
}

export function calculatePropertyTotalAnnualExpenses(property: Property): number {
  if (Array.isArray(property.expenses)) {
    return property.expenses.reduce(
      (sum, exp) => sum + calculateExpenseAnnual(exp.amount, exp.frequency),
      0
    );
  }
  // If expenses array is not provided, use annualExpenses directly without phantom additions
  return property.annualExpenses || 0;
}

export function calculatePropertyTotalMonthlyExpenses(property: Property): number {
  return calculatePropertyTotalAnnualExpenses(property) / 12;
}

export function calculatePropertyCashFlowAndYield(
  property: Property,
  contract?: RentalContract
) {
  const grossMonthlyRent = contract && contract.active ? contract.monthlyRent : 0;
  const grossAnnualRent = grossMonthlyRent * 12;

  // Use the contract's selected tax rate or the property default
  const taxRate = contract ? contract.taxRate : property.taxRate || 0.21;
  const annualTaxes = grossAnnualRent * taxRate;
  const monthlyTaxes = annualTaxes / 12;

  const annualExpenses = calculatePropertyTotalAnnualExpenses(property);
  const monthlyExpenses = annualExpenses / 12;

  // Net cash flow = Gross rent - Taxes - Property expenses
  const netAnnual = grossAnnualRent - annualTaxes - annualExpenses;
  const netMonthly = grossMonthlyRent - monthlyTaxes - monthlyExpenses;

  const propValue = property.currentValue > 0 ? property.currentValue : 1;
  const grossYield = (grossAnnualRent / propValue) * 100;
  const netYield = (netAnnual / propValue) * 100;

  return {
    grossMonthlyRent,
    grossAnnualRent,
    taxRate,
    annualTaxes,
    monthlyTaxes,
    annualExpenses,
    monthlyExpenses,
    netAnnual,
    netMonthly,
    grossYield,
    netYield
  };
}
