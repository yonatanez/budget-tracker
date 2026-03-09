/**
 * Factory functions for creating domain model instances
 */

import { 
  SalaryRecord, 
  Expense, 
  MonthlyReport, 
  AnnualReport,
  SalaryComponents,
  TaxCalculationResult,
  ExpenseInput,
  SavingsEntry,
  SavingsEntryInput,
  RecurringExpenseConfig
} from './types';

/**
 * Round a monetary value to exactly 2 decimal places
 */
function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Generate a unique ID for model instances
 */
function generateId(): string {
  // Browser-compatible UUID generation
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Create a new SalaryRecord with generated ID and timestamp
 */
export function createSalaryRecord(
  salaryComponents: SalaryComponents,
  month: Date,
  taxCalculation: TaxCalculationResult
): SalaryRecord {
  // Round all salary components to 2 decimal places
  const roundedComponents: SalaryComponents = {
    baseSalary: roundToTwoDecimals(salaryComponents.baseSalary),
    bonus: salaryComponents.bonus !== undefined ? roundToTwoDecimals(salaryComponents.bonus) : undefined,
    stockValue: salaryComponents.stockValue !== undefined ? roundToTwoDecimals(salaryComponents.stockValue) : undefined,
    mealVouchers: salaryComponents.mealVouchers !== undefined ? roundToTwoDecimals(salaryComponents.mealVouchers) : undefined,
    otherCompensation: salaryComponents.otherCompensation !== undefined ? roundToTwoDecimals(salaryComponents.otherCompensation) : undefined,
    directPensionContribution: salaryComponents.directPensionContribution !== undefined ? roundToTwoDecimals(salaryComponents.directPensionContribution) : undefined
  };
  
  // Round all tax calculation values to 2 decimal places
  const roundedTaxCalculation: TaxCalculationResult = {
    salaryComponents: roundedComponents,
    grossSalary: roundToTwoDecimals(taxCalculation.grossSalary),
    taxableIncome: roundToTwoDecimals(taxCalculation.taxableIncome),
    cashIncome: roundToTwoDecimals(taxCalculation.cashIncome),
    incomeTax: roundToTwoDecimals(taxCalculation.incomeTax),
    nationalInsurance: roundToTwoDecimals(taxCalculation.nationalInsurance),
    healthInsurance: roundToTwoDecimals(taxCalculation.healthInsurance),
    pensionEmployeeContribution: roundToTwoDecimals(taxCalculation.pensionEmployeeContribution),
    pensionEmployerContribution: roundToTwoDecimals(taxCalculation.pensionEmployerContribution),
    studyFundEmployeeContribution: roundToTwoDecimals(taxCalculation.studyFundEmployeeContribution),
    studyFundEmployerContribution: roundToTwoDecimals(taxCalculation.studyFundEmployerContribution),
    netIncome: roundToTwoDecimals(taxCalculation.netIncome),
    taxCreditDeduction: taxCalculation.taxCreditDeduction !== undefined ? roundToTwoDecimals(taxCalculation.taxCreditDeduction) : undefined
  };
  
  return {
    id: generateId(),
    salaryComponents: roundedComponents,
    month,
    taxCalculation: roundedTaxCalculation,
    createdAt: new Date()
  };
}

/**
 * Create a new Expense with generated ID and timestamp
 */
export function createExpense(input: ExpenseInput): Expense {
  return {
    id: generateId(),
    amount: roundToTwoDecimals(input.amount),
    date: input.date,
    category: input.category ?? null,
    description: input.description ?? null,
    createdAt: new Date()
  };
}

/**
 * Create a new MonthlyReport
 */
export function createMonthlyReport(
  month: Date,
  netIncome: number,
  expenses: Expense[]
): MonthlyReport {
  const totalExpenses = roundToTwoDecimals(
    expenses.reduce((sum, expense) => sum + expense.amount, 0)
  );
  
  const expensesByCategory = new Map<string, number>();
  expenses.forEach(expense => {
    const category = expense.category ?? 'Uncategorized';
    const current = expensesByCategory.get(category) ?? 0;
    expensesByCategory.set(category, roundToTwoDecimals(current + expense.amount));
  });
  
  return {
    month,
    netIncome: roundToTwoDecimals(netIncome),
    expenses,
    totalExpenses,
    expensesByCategory,
    netSavings: roundToTwoDecimals(netIncome - totalExpenses)
  };
}

/**
 * Create a new AnnualReport
 */
export function createAnnualReport(
  startDate: Date,
  endDate: Date,
  monthlyReports: MonthlyReport[],
  totalPensionAccumulation: number,
  totalStudyFundAccumulation: number
): AnnualReport {
  const totalIncome = roundToTwoDecimals(
    monthlyReports.reduce((sum, report) => sum + report.netIncome, 0)
  );
  const totalExpenses = roundToTwoDecimals(
    monthlyReports.reduce((sum, report) => sum + report.totalExpenses, 0)
  );
  
  const expensesByCategory = new Map<string, number>();
  monthlyReports.forEach(report => {
    report.expensesByCategory.forEach((amount, category) => {
      const current = expensesByCategory.get(category) ?? 0;
      expensesByCategory.set(category, roundToTwoDecimals(current + amount));
    });
  });
  
  return {
    startDate,
    endDate,
    monthlyReports,
    totalIncome,
    totalExpenses,
    totalSavings: roundToTwoDecimals(totalIncome - totalExpenses),
    expensesByCategory,
    totalPensionAccumulation: roundToTwoDecimals(totalPensionAccumulation),
    totalStudyFundAccumulation: roundToTwoDecimals(totalStudyFundAccumulation)
  };
}

/**
 * Create a new SavingsEntry with generated ID and timestamp
 */
export function createSavingsEntry(input: SavingsEntryInput): SavingsEntry {
  return {
    id: generateId(),
    type: input.type,
    description: input.description,
    amount: roundToTwoDecimals(input.amount),
    month: input.month,
    createdAt: new Date()
  };
}

/**
 * Create a new RecurringExpenseConfig
 */
export function createRecurringExpenseConfig(
  amount: number,
  dayOfMonth: number,
  startMonth: Date,
  endMonth: Date,
  category?: string,
  description?: string
): RecurringExpenseConfig {
  return {
    amount: roundToTwoDecimals(amount),
    dayOfMonth,
    startMonth,
    endMonth,
    category,
    description
  };
}

