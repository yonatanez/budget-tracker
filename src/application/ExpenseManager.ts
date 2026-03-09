/**
 * ExpenseManager handles expense operations
 * Implements Requirements 3.1-3.6, 4.1-4.6, 6.1
 */

import { Expense, ExpenseInput, Result, ValidationError, UploadResult, FailedRecord } from '../domain/types';
import { ValidationService } from '../data-access/ValidationService';
import { CSVParser } from '../data-access/CSVParser';
import { StorageService } from '../data-access/StorageService';
import { createExpense } from '../domain/models';

export class ExpenseManager {
  constructor(
    private validationService: ValidationService,
    private csvParser: CSVParser,
    private storageService: StorageService
  ) {}

  /**
   * Add a single expense with validation
   */
  async addExpense(input: ExpenseInput, existingExpenses: Expense[]): Promise<Result<Expense, ValidationError>> {
    // Validate expense
    const validation = this.validationService.validateExpense(input);
    if (!validation.isValid) {
      return {
        success: false,
        error: {
          field: 'expense',
          message: validation.errors.join(', ')
        }
      };
    }

    // Check for duplicates
    const isDuplicate = this.validationService.checkDuplicate(input, existingExpenses);
    if (isDuplicate) {
      return {
        success: false,
        error: {
          field: 'duplicate',
          message: 'הוצאה זהה כבר קיימת (אותו סכום, תאריך ותיאור)'
        }
      };
    }

    // Create and save expense
    const expense = createExpense(input);
    await this.storageService.saveExpense(expense);

    return {
      success: true,
      value: expense
    };
  }

  /**
   * Upload expenses from CSV
   */
  async uploadExpenses(csvContent: string, existingExpenses: Expense[]): Promise<UploadResult> {
    const parseResult = this.csvParser.parse(csvContent);

    if (!parseResult.success) {
      // Convert parse errors to failed records
      const failedRecords: FailedRecord[] = parseResult.error.map(err => ({
        lineNumber: err.line,
        data: '',
        error: err.message
      }));

      return {
        successCount: 0,
        failedRecords
      };
    }

    const expenses = parseResult.value;
    const failedRecords: FailedRecord[] = [];
    let successCount = 0;

    for (const expense of expenses) {
      try {
        // Validate each expense
        const validation = this.validationService.validateExpense({
          amount: expense.amount,
          date: expense.date,
          category: expense.category ?? undefined,
          description: expense.description ?? undefined
        });

        if (!validation.isValid) {
          failedRecords.push({
            lineNumber: 0,
            data: `${expense.amount},${expense.date}`,
            error: validation.errors.join(', ')
          });
          continue;
        }

        // Save expense
        await this.storageService.saveExpense(expense);
        successCount++;
      } catch (error) {
        failedRecords.push({
          lineNumber: 0,
          data: `${expense.amount},${expense.date}`,
          error: 'שגיאה בשמירת ההוצאה'
        });
      }
    }

    return {
      successCount,
      failedRecords
    };
  }

  /**
   * Get expenses for a specific month
   */
  getExpensesByMonth(expenses: Expense[], year: number, month: number): Expense[] {
    return expenses.filter(expense => {
      const expenseDate = expense.date;
      return expenseDate.getFullYear() === year && expenseDate.getMonth() === month;
    });
  }

  /**
   * Get expenses within a date range
   */
  getExpensesByDateRange(expenses: Expense[], startDate: Date, endDate: Date): Expense[] {
    return expenses.filter(expense => {
      const expenseDate = expense.date;
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  }
}
