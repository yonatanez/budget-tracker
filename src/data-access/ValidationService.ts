/**
 * ValidationService provides validation logic for financial data inputs.
 * Implements Requirements 1.8, 1.9, 3.2, 3.3, 3.5, 9.1, 9.2, 9.3
 */

import { SalaryComponents, ExpenseInput, ValidationResult, Expense, RecurringExpenseConfig, SavingsEntryInput, SavingsType } from '../domain/types';

export interface ValidationService {
  validateSalaryComponents(components: SalaryComponents): ValidationResult;
  validateExpense(expense: ExpenseInput): ValidationResult;
  validateDate(date: Date): ValidationResult;
  checkDuplicate(expense: ExpenseInput, existing: Expense[]): boolean;
  validateRecurringExpenseConfig(config: RecurringExpenseConfig): ValidationResult;
  validateSavingsEntry(input: SavingsEntryInput): ValidationResult;
  validateSavingsGoal(amount: number): ValidationResult;
}


/**
 * Implementation of ValidationService with Hebrew error messages
 */
export class DefaultValidationService implements ValidationService {
  /**
   * Validates salary components to ensure all values are non-negative
   * @param components - Salary components to validate
   * @returns Validation result with Hebrew error messages
   */
  validateSalaryComponents(components: SalaryComponents): ValidationResult {
    const errors: string[] = [];

    // Validate base salary (required, must be >= 0)
    if (components.baseSalary < 0) {
      errors.push('משכורת בסיס לא יכולה להיות שלילית');
    }

    // Validate optional components (if provided, must be >= 0)
    if (components.bonus !== undefined && components.bonus < 0) {
      errors.push('בונוס לא יכול להיות שלילי');
    }

    if (components.stockValue !== undefined && components.stockValue < 0) {
      errors.push('ערך מניות/אופציות לא יכול להיות שלילי');
    }

    if (components.mealVouchers !== undefined && components.mealVouchers < 0) {
      errors.push('תלושי אוכל לא יכולים להיות שליליים');
    }

    if (components.otherCompensation !== undefined && components.otherCompensation < 0) {
      errors.push('רכיבי שכר נוספים לא יכולים להיות שליליים');
    }

    // Check if total gross salary is zero
    const grossSalary = 
      components.baseSalary +
      (components.bonus || 0) +
      (components.stockValue || 0) +
      (components.mealVouchers || 0) +
      (components.otherCompensation || 0);

    if (grossSalary === 0) {
      errors.push('סך המשכורת הברוטו לא יכול להיות אפס');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates an expense to ensure amount is positive and date is valid
   * @param expense - Expense input to validate
   * @returns Validation result with Hebrew error messages
   */
  validateExpense(expense: ExpenseInput): ValidationResult {
    const errors: string[] = [];

    // Validate amount (must be positive)
    if (expense.amount <= 0) {
      errors.push('הסכום חייב להיות מספר חיובי גדול מאפס');
    }

    // Validate date
    const dateValidation = this.validateDate(expense.date);
    if (!dateValidation.isValid) {
      errors.push(...dateValidation.errors);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates a date to ensure it's not more than one day in the future
   * @param date - Date to validate
   * @returns Validation result with Hebrew error messages
   */
  validateDate(date: Date): ValidationResult {
    const errors: string[] = [];

    // Check if date is valid
    if (isNaN(date.getTime())) {
      errors.push('התאריך חייב להיות בפורמט תקין');
      return {
        isValid: false,
        errors
      };
    }

    // Check if date is more than one day in the future
    const now = new Date();
    const oneDayFromNow = new Date(now);
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
    
    // Set time to end of day for comparison
    oneDayFromNow.setHours(23, 59, 59, 999);

    if (date.getTime() > oneDayFromNow.getTime()) {
      errors.push('התאריך לא יכול להיות יותר מיום אחד בעתיד');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Checks if an expense is a duplicate of any existing expense
   * Duplicates are defined as having the same amount, date, and description
   * @param expense - Expense to check
   * @param existing - Array of existing expenses
   * @returns true if duplicate found, false otherwise
   */
  checkDuplicate(expense: ExpenseInput, existing: Expense[]): boolean {
    return existing.some(existingExpense => {
      // Compare amount
      if (existingExpense.amount !== expense.amount) {
        return false;
      }

      // Compare date (same day, ignoring time)
      const existingDate = new Date(existingExpense.date);
      const newDate = new Date(expense.date);
      
      if (
        existingDate.getFullYear() !== newDate.getFullYear() ||
        existingDate.getMonth() !== newDate.getMonth() ||
        existingDate.getDate() !== newDate.getDate()
      ) {
        return false;
      }

      // Compare description (both null/undefined or same value)
      const existingDesc = existingExpense.description || '';
      const newDesc = expense.description || '';
      
      return existingDesc === newDesc;
    });
  }

  /**
   * Validates a recurring expense configuration
   * @param config - Recurring expense configuration to validate
   * @returns Validation result with Hebrew error messages
   */
  validateRecurringExpenseConfig(config: RecurringExpenseConfig): ValidationResult {
    const errors: string[] = [];

    // Validate amount (must be positive)
    if (config.amount <= 0) {
      errors.push('הסכום חייב להיות מספר חיובי גדול מאפס');
    }

    // Validate dayOfMonth (must be between 1 and 31)
    if (config.dayOfMonth < 1 || config.dayOfMonth > 31 || !Number.isInteger(config.dayOfMonth)) {
      errors.push('יום בחודש חייב להיות מספר שלם בין 1 ל-31');
    }

    // Validate startMonth <= endMonth
    const start = new Date(config.startMonth);
    const end = new Date(config.endMonth);
    if (start.getTime() > end.getTime()) {
      errors.push('חודש ההתחלה חייב להיות לפני או שווה לחודש הסיום');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates a savings entry input
   * @param input - Savings entry input to validate
   * @returns Validation result with Hebrew error messages
   */
  validateSavingsEntry(input: SavingsEntryInput): ValidationResult {
    const errors: string[] = [];

    // Validate description (must be non-empty after trimming)
    if (!input.description || input.description.trim().length === 0) {
      errors.push('תיאור לא יכול להיות ריק');
    }

    // Validate amount (must be positive)
    if (input.amount <= 0) {
      errors.push('הסכום חייב להיות מספר חיובי גדול מאפס');
    }

    // Validate type (must be one of: savings, investment, pension)
    const validTypes: SavingsType[] = ['savings', 'investment', 'pension'];
    if (!validTypes.includes(input.type)) {
      errors.push('סוג החיסכון חייב להיות חיסכון, השקעה או פנסיה');
    }

    // Validate month (must be a valid Date)
    if (!(input.month instanceof Date) || isNaN(input.month.getTime())) {
      errors.push('חודש חייב להיות תאריך תקין');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates a savings goal amount
   * @param amount - Savings goal amount to validate
   * @returns Validation result with Hebrew error messages
   */
  validateSavingsGoal(amount: number): ValidationResult {
    const errors: string[] = [];

    // Validate amount (must be positive)
    if (amount <= 0) {
      errors.push('יעד החיסכון חייב להיות מספר חיובי גדול מאפס');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

}
