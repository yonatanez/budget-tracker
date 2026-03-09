/**
 * RecurringExpenseGenerator creates individual expense records for each month
 * in a recurring expense configuration range.
 * Implements Requirements 1.3, 1.4, 1.5, 1.6, 1.7, 1.9
 */

import { RecurringExpenseConfig, Expense, ValidationResult } from '../domain/types';
import { createExpense } from '../domain/models';
import { ValidationService } from '../data-access/ValidationService';
import { StorageService } from '../data-access/StorageService';

export class RecurringExpenseGenerator {
  constructor(
    private validationService: ValidationService,
    private storageService: StorageService
  ) {}

  /**
   * Validate the recurring config (start <= end month, positive amount, valid day)
   * @param config - Recurring expense configuration to validate
   * @returns ValidationResult with Hebrew error messages
   */
  validateConfig(config: RecurringExpenseConfig): ValidationResult {
    return this.validationService.validateRecurringExpenseConfig(config);
  }

  /**
   * Generate individual expense records for each month in range (inclusive).
   * Each expense is saved independently. On individual save failure,
   * continues saving remaining records and collects failures.
   * @param config - Recurring expense configuration
   * @returns Object with saved expenses and failed months
   */
  async generate(config: RecurringExpenseConfig): Promise<{
    saved: Expense[];
    failed: { month: Date; error: string }[];
  }> {
    const saved: Expense[] = [];
    const failed: { month: Date; error: string }[] = [];

    const startYear = config.startMonth.getFullYear();
    const startMonth = config.startMonth.getMonth();
    const endYear = config.endMonth.getFullYear();
    const endMonth = config.endMonth.getMonth();

    let year = startYear;
    let month = startMonth;

    while (year < endYear || (year === endYear && month <= endMonth)) {
      const day = RecurringExpenseGenerator.clampDay(year, month, config.dayOfMonth);
      const date = new Date(year, month, day);

      const expense = createExpense({
        amount: config.amount,
        date,
        category: config.category,
        description: config.description
      });

      try {
        await this.storageService.saveExpense(expense);
        saved.push(expense);
      } catch {
        const monthDate = new Date(year, month, 1);
        failed.push({
          month: monthDate,
          error: `שמירת ההוצאה לחודש ${month + 1}/${year} נכשלה`
        });
      }

      // Advance to next month
      month++;
      if (month > 11) {
        month = 0;
        year++;
      }
    }

    return { saved, failed };
  }

  /**
   * Clamp day to last valid day of a given month.
   * Returns min(day, lastDayOfMonth).
   * @param year - Full year (e.g. 2024)
   * @param month - Zero-based month (0 = January, 11 = December)
   * @param day - Desired day of month
   * @returns Clamped day value
   */
  static clampDay(year: number, month: number, day: number): number {
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    return Math.min(day, lastDayOfMonth);
  }
}
