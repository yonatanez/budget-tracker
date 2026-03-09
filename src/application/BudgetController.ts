/**
 * BudgetController orchestrates all budget tracking workflows
 * Implements all requirements
 */

import { 
  SalaryComponents, 
  SalaryRecord, 
  ExpenseInput, 
  Expense, 
  MonthlyReport, 
  AnnualReport,
  Result,
  ValidationError,
  UploadResult,
  SavingsEntry,
  SavingsEntryInput
} from '../domain/types';
import { TaxCalculator } from './TaxCalculator';
import { ExpenseManager } from './ExpenseManager';
import { ValidationService } from '../data-access/ValidationService';
import { StorageService } from '../data-access/StorageService';
import { createSalaryRecord, createMonthlyReport, createAnnualReport, createSavingsEntry } from '../domain/models';
import { RecurringExpenseGenerator } from './RecurringExpenseGenerator';
import { SavingsGoalManager } from './SavingsGoalManager';

export class BudgetController {
  private recurringExpenseGenerator: RecurringExpenseGenerator;
  private savingsGoalManager: SavingsGoalManager;

  constructor(
    private taxCalculator: TaxCalculator,
    private expenseManager: ExpenseManager,
    private validationService: ValidationService,
    private storageService: StorageService
  ) {
    this.recurringExpenseGenerator = new RecurringExpenseGenerator(validationService, storageService);
    this.savingsGoalManager = new SavingsGoalManager(storageService);
  }

  /**
   * Enter salary for a month
   */
  async enterSalary(components: SalaryComponents, month: Date, taxCreditPoints?: number): Promise<Result<SalaryRecord, ValidationError>> {
    // Validate salary components
    const validation = this.validationService.validateSalaryComponents(components);
    if (!validation.isValid) {
      return {
        success: false,
        error: {
          field: 'salary',
          message: validation.errors.join(', ')
        }
      };
    }

    // Calculate taxes with tax credit points
    const taxCalculation = this.taxCalculator.calculateNetIncome(components, taxCreditPoints);

    // Create and save salary record
    const salaryRecord = createSalaryRecord(components, month, taxCalculation);
    await this.storageService.saveSalary(salaryRecord);

    return {
      success: true,
      value: salaryRecord
    };
  }

  /**
   * Add a single expense
   */
  async addExpense(input: ExpenseInput): Promise<Result<Expense, ValidationError>> {
    const data = await this.storageService.loadAllData();
    return this.expenseManager.addExpense(input, data.expenses);
  }

  /**
   * Upload expenses from CSV
   */
  async uploadExpenses(csvContent: string): Promise<UploadResult> {
    const data = await this.storageService.loadAllData();
    return this.expenseManager.uploadExpenses(csvContent, data.expenses);
  }

  /**
   * Get monthly report
   */
  async getMonthlyReport(year: number, month: number): Promise<MonthlyReport | null> {
    const data = await this.storageService.loadAllData();

    // Find salary for this month
    const salary = data.salaries.find(s => 
      s.month.getFullYear() === year && s.month.getMonth() === month
    );

    if (!salary) {
      return null;
    }

    // Get expenses for this month
    const expenses = this.expenseManager.getExpensesByMonth(data.expenses, year, month);

    // Create monthly report
    return createMonthlyReport(
      new Date(year, month, 1),
      salary.taxCalculation.netIncome,
      expenses
    );
  }

  /**
   * Get annual report for the last 12 months
   */
  async getAnnualReport(): Promise<AnnualReport> {
    const data = await this.storageService.loadAllData();

    // Get last 12 months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 11);
    startDate.setDate(1);

    // Generate monthly reports for each month
    const monthlyReports: MonthlyReport[] = [];
    let totalPensionAccumulation = 0;
    let totalStudyFundAccumulation = 0;

    for (let i = 0; i < 12; i++) {
      const reportDate = new Date(startDate);
      reportDate.setMonth(startDate.getMonth() + i);
      
      const year = reportDate.getFullYear();
      const month = reportDate.getMonth();

      // Find salary for this month
      const salary = data.salaries.find(s => 
        s.month.getFullYear() === year && s.month.getMonth() === month
      );

      const netIncome = salary ? salary.taxCalculation.netIncome : 0;
      const expenses = this.expenseManager.getExpensesByMonth(data.expenses, year, month);

      monthlyReports.push(createMonthlyReport(
        new Date(year, month, 1),
        netIncome,
        expenses
      ));

      // Accumulate pension and study fund
      if (salary) {
        totalPensionAccumulation += 
          salary.taxCalculation.pensionEmployeeContribution +
          salary.taxCalculation.pensionEmployerContribution;
        
        totalStudyFundAccumulation += 
          salary.taxCalculation.studyFundEmployeeContribution +
          salary.taxCalculation.studyFundEmployerContribution;
      }
    }

    return createAnnualReport(
      startDate,
      endDate,
      monthlyReports,
      totalPensionAccumulation,
      totalStudyFundAccumulation
    );
  }

  /**
   * Load all data
   */
  async loadAllData() {
    return this.storageService.loadAllData();
  }

  /**
   * Add a new savings entry
   */
  async addSavingsEntry(input: SavingsEntryInput): Promise<SavingsEntry> {
    const entry = createSavingsEntry(input);
    await this.storageService.saveSavingsEntry(entry);
    return entry;
  }

  /**
   * Get all savings entries
   */
  async getSavingsEntries(): Promise<SavingsEntry[]> {
    return this.storageService.loadSavingsEntries();
  }

  /**
   * Update an existing savings entry
   */
  async updateSavingsEntry(id: string, entry: SavingsEntry): Promise<void> {
    await this.storageService.updateSavingsEntry(id, entry);
  }

  /**
   * Delete a savings entry
   */
  async deleteSavingsEntry(id: string): Promise<void> {
    await this.storageService.deleteSavingsEntry(id);
  }

  /**
   * Set monthly savings goal
   */
  async setMonthlySavingsGoal(amount: number): Promise<void> {
    await this.savingsGoalManager.setMonthlySavingsGoal(amount);
  }

  /**
   * Get monthly savings goal
   */
  async getMonthlySavingsGoal(): Promise<number | null> {
    return this.savingsGoalManager.getMonthlySavingsGoal();
  }

  /**
   * Get yearly savings goal derived from monthly goal
   */
  getYearlySavingsGoal(monthlyGoal: number): number {
    return this.savingsGoalManager.getYearlySavingsGoal(monthlyGoal);
  }

  /**
   * Get the RecurringExpenseGenerator instance
   */
  getRecurringExpenseGenerator(): RecurringExpenseGenerator {
    return this.recurringExpenseGenerator;
  }

}
