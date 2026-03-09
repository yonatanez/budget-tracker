/**
 * Core type definitions for the Israeli Budget Tracker
 */

/**
 * Result type for operations that can succeed or fail
 */
export type Result<T, E> = 
  | { success: true; value: T }
  | { success: false; error: E };

/**
 * Salary components that make up gross salary
 */
export interface SalaryComponents {
  baseSalary: number;
  bonus?: number;
  stockValue?: number;
  mealVouchers?: number;
  otherCompensation?: number;
  directPensionContribution?: number; // Money that's taxed but goes directly to pension (not to bank account)
}

/**
 * Result of tax calculation including all deductions
 */
export interface TaxCalculationResult {
  salaryComponents: SalaryComponents;
  grossSalary: number;
  taxableIncome: number; // Total income used for tax calculation (includes direct pension)
  cashIncome: number; // Income that actually goes to bank account (excludes direct pension)
  incomeTax: number;
  nationalInsurance: number;
  healthInsurance: number;
  pensionEmployeeContribution: number;
  pensionEmployerContribution: number;
  studyFundEmployeeContribution: number;
  studyFundEmployerContribution: number;
  netIncome: number; // Actual money to bank account
  taxCreditDeduction?: number;
}

/**
 * Expense input data
 */
export interface ExpenseInput {
  amount: number;
  date: Date;
  category?: string;
  description?: string;
}

/**
 * Stored expense record
 */
export interface Expense {
  id: string;
  amount: number;
  date: Date;
  category: string | null;
  description: string | null;
  createdAt: Date;
}

/**
 * Salary record with tax calculation
 */
export interface SalaryRecord {
  id: string;
  salaryComponents: SalaryComponents;
  month: Date;
  taxCalculation: TaxCalculationResult;
  createdAt: Date;
}

/**
 * Monthly financial report
 */
export interface MonthlyReport {
  month: Date;
  netIncome: number;
  expenses: Expense[];
  totalExpenses: number;
  expensesByCategory: Map<string, number>;
  netSavings: number;
}

/**
 * Annual financial report
 */
export interface AnnualReport {
  startDate: Date;
  endDate: Date;
  monthlyReports: MonthlyReport[];
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  expensesByCategory: Map<string, number>;
  totalPensionAccumulation: number;
  totalStudyFundAccumulation: number;
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * CSV parse error
 */
export interface ParseError {
  line: number;
  field: string;
  message: string;
}

/**
 * Failed record from CSV upload
 */
export interface FailedRecord {
  lineNumber: number;
  data: string;
  error: string;
}

/**
 * Result of CSV upload operation
 */
export interface UploadResult {
  successCount: number;
  failedRecords: FailedRecord[];
}

/**
 * Financial data for persistence
 */
export interface FinancialData {
  salaries: SalaryRecord[];
  expenses: Expense[];
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

/**
 * Savings entry type
 */
export type SavingsType = 'savings' | 'investment' | 'pension';

/**
 * Savings/Investment/Pension entry
 */
export interface SavingsEntry {
  id: string;
  type: SavingsType;
  description: string;
  amount: number;
  month: Date;
  createdAt: Date;
}

/**
 * Input for creating a savings entry
 */
export interface SavingsEntryInput {
  type: SavingsType;
  description: string;
  amount: number;
  month: Date;
}

/**
 * Recurring expense configuration
 */
export interface RecurringExpenseConfig {
  amount: number;
  category?: string;
  description?: string;
  dayOfMonth: number;
  startMonth: Date; // first day of start month
  endMonth: Date;   // first day of end month
}

/**
 * Extended FinancialData to include savings
 */
export interface FinancialDataV2 extends FinancialData {
  savings: SavingsEntry[];
  monthlySavingsGoal: number | null;
}
