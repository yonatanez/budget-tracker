/**
 * StorageService provides data persistence for the Israeli Budget Tracker.
 * Uses localStorage for browser-based storage.
 * Implements Requirements 8.1, 8.2, 8.3, 8.4, 8.5
 */

import { SalaryRecord, Expense, FinancialData, SavingsEntry } from '../domain/types';

export interface StorageService {
  saveSalary(salary: SalaryRecord): Promise<void>;
  saveExpense(expense: Expense): Promise<void>;
  loadAllData(): Promise<FinancialData>;
  updateSalary(id: string, salary: SalaryRecord): Promise<void>;
  deleteSalary(id: string): Promise<void>;
  updateExpense(id: string, expense: Expense): Promise<void>;
  deleteExpense(id: string): Promise<void>;
  saveSavingsEntry(entry: SavingsEntry): Promise<void>;
  loadSavingsEntries(): Promise<SavingsEntry[]>;
  updateSavingsEntry(id: string, entry: SavingsEntry): Promise<void>;
  deleteSavingsEntry(id: string): Promise<void>;
  saveMonthlySavingsGoal(amount: number): Promise<void>;
  loadMonthlySavingsGoal(): Promise<number | null>;
}

/**
 * Storage keys for localStorage
 */
const STORAGE_KEYS = {
  SALARIES: 'israeli-budget-tracker:salaries',
  EXPENSES: 'israeli-budget-tracker:expenses',
  SAVINGS: 'israeli-budget-tracker:savings',
  MONTHLY_SAVINGS_GOAL: 'israeli-budget-tracker:monthly-savings-goal'
} as const;

/**
 * Hebrew error messages for storage operations
 */
const ERROR_MESSAGES = {
  SAVE_FAILED: 'שמירת הנתונים נכשלה. אנא נסה שוב.',
  LOAD_FAILED: 'טעינת הנתונים נכשלה. מתחיל עם נתונים ריקים.',
  CORRUPTED_DATA: 'קובץ הנתונים פגום. אנא שחזר מגיבוי.',
  RECORD_NOT_FOUND: 'הרשומה לא נמצאה'
} as const;

/**
 * Implementation of StorageService using localStorage
 */
export class LocalStorageService implements StorageService {
  /**
   * Saves a salary record to localStorage
   * @param salary - SalaryRecord to persist
   * @throws Error with Hebrew message if save fails
   */
  async saveSalary(salary: SalaryRecord): Promise<void> {
    try {
      const data = await this.loadAllData();
      
      // Check if salary for this month already exists and update it
      const existingIndex = data.salaries.findIndex(
        s => s.month.getTime() === salary.month.getTime()
      );
      
      if (existingIndex >= 0) {
        data.salaries[existingIndex] = salary;
      } else {
        data.salaries.push(salary);
      }
      
      // Sort salaries by month (newest first)
      data.salaries.sort((a, b) => b.month.getTime() - a.month.getTime());
      
      this.saveToStorage(STORAGE_KEYS.SALARIES, data.salaries);
    } catch (error) {
      throw new Error(ERROR_MESSAGES.SAVE_FAILED);
    }
  }

  /**
   * Saves an expense record to localStorage
   * @param expense - Expense to persist
   * @throws Error with Hebrew message if save fails
   */
  async saveExpense(expense: Expense): Promise<void> {
    try {
      const data = await this.loadAllData();
      data.expenses.push(expense);
      
      // Sort expenses by date (newest first)
      data.expenses.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      this.saveToStorage(STORAGE_KEYS.EXPENSES, data.expenses);
    } catch (error) {
      throw new Error(ERROR_MESSAGES.SAVE_FAILED);
    }
  }

  /**
   * Loads all financial data from localStorage
   * @returns FinancialData containing all salaries and expenses
   * @throws Error with Hebrew message if data is corrupted
   */
  async loadAllData(): Promise<FinancialData> {
    try {
      const salaries = this.loadFromStorage<SalaryRecord[]>(STORAGE_KEYS.SALARIES) || [];
      const expenses = this.loadFromStorage<Expense[]>(STORAGE_KEYS.EXPENSES) || [];
      
      // Deserialize dates
      const deserializedSalaries = salaries.map(s => ({
        ...s,
        month: new Date(s.month),
        createdAt: new Date(s.createdAt)
      }));
      
      const deserializedExpenses = expenses.map(e => ({
        ...e,
        date: new Date(e.date),
        createdAt: new Date(e.createdAt)
      }));
      
      return {
        salaries: deserializedSalaries,
        expenses: deserializedExpenses
      };
    } catch (error) {
      // If data is corrupted, throw error
      if (error instanceof SyntaxError) {
        throw new Error(ERROR_MESSAGES.CORRUPTED_DATA);
      }
      // For other errors, return empty data
      return {
        salaries: [],
        expenses: []
      };
    }
  }

  /**
   * Updates an existing salary record by ID
   * @param id - ID of the salary record to update
   * @param salary - Updated salary record data
   * @throws Error with Hebrew message if record not found
   */
  async updateSalary(id: string, salary: SalaryRecord): Promise<void> {
    const data = await this.loadAllData();
    const index = data.salaries.findIndex(s => s.id === id);

    if (index === -1) {
      throw new Error(ERROR_MESSAGES.RECORD_NOT_FOUND);
    }

    // Preserve original id and createdAt
    data.salaries[index] = {
      ...salary,
      id: data.salaries[index].id,
      createdAt: data.salaries[index].createdAt
    };

    // Re-sort by month descending
    data.salaries.sort((a, b) => b.month.getTime() - a.month.getTime());

    this.saveToStorage(STORAGE_KEYS.SALARIES, data.salaries);
  }

  /**
   * Deletes a salary record by ID
   * @param id - ID of the salary record to delete
   * @throws Error with Hebrew message if record not found
   */
  async deleteSalary(id: string): Promise<void> {
    const data = await this.loadAllData();
    const filtered = data.salaries.filter(s => s.id !== id);

    if (filtered.length === data.salaries.length) {
      throw new Error(ERROR_MESSAGES.RECORD_NOT_FOUND);
    }

    this.saveToStorage(STORAGE_KEYS.SALARIES, filtered);
  }

  /**
   * Updates an existing expense record by ID
   * @param id - ID of the expense record to update
   * @param expense - Updated expense record data
   * @throws Error with Hebrew message if record not found
   */
  async updateExpense(id: string, expense: Expense): Promise<void> {
    const data = await this.loadAllData();
    const index = data.expenses.findIndex(e => e.id === id);

    if (index === -1) {
      throw new Error(ERROR_MESSAGES.RECORD_NOT_FOUND);
    }

    // Preserve original id and createdAt
    data.expenses[index] = {
      ...expense,
      id: data.expenses[index].id,
      createdAt: data.expenses[index].createdAt
    };

    // Re-sort by date descending
    data.expenses.sort((a, b) => b.date.getTime() - a.date.getTime());

    this.saveToStorage(STORAGE_KEYS.EXPENSES, data.expenses);
  }

  /**
   * Deletes an expense record by ID
   * @param id - ID of the expense record to delete
   * @throws Error with Hebrew message if record not found
   */
  async deleteExpense(id: string): Promise<void> {
    const data = await this.loadAllData();
    const filtered = data.expenses.filter(e => e.id !== id);

    if (filtered.length === data.expenses.length) {
      throw new Error(ERROR_MESSAGES.RECORD_NOT_FOUND);
    }

    this.saveToStorage(STORAGE_KEYS.EXPENSES, filtered);
  }

  /**
   * Saves a savings entry to localStorage
   * @param entry - SavingsEntry to persist
   * @throws Error with Hebrew message if save fails
   */
  async saveSavingsEntry(entry: SavingsEntry): Promise<void> {
    try {
      const entries = await this.loadSavingsEntries();
      entries.push(entry);
      this.saveToStorage(STORAGE_KEYS.SAVINGS, entries);
    } catch (error) {
      throw new Error(ERROR_MESSAGES.SAVE_FAILED);
    }
  }

  /**
   * Loads all savings entries from localStorage
   * @returns Array of SavingsEntry records, empty array if corrupted or missing
   */
  async loadSavingsEntries(): Promise<SavingsEntry[]> {
    try {
      const entries = this.loadFromStorage<SavingsEntry[]>(STORAGE_KEYS.SAVINGS) || [];
      return entries.map(e => ({
        ...e,
        month: new Date(e.month),
        createdAt: new Date(e.createdAt)
      }));
    } catch (error) {
      console.error(ERROR_MESSAGES.CORRUPTED_DATA, error);
      return [];
    }
  }

  /**
   * Updates an existing savings entry by ID
   * @param id - ID of the savings entry to update
   * @param entry - Updated savings entry data
   * @throws Error with Hebrew message if record not found
   */
  async updateSavingsEntry(id: string, entry: SavingsEntry): Promise<void> {
    const entries = await this.loadSavingsEntries();
    const index = entries.findIndex(e => e.id === id);

    if (index === -1) {
      throw new Error(ERROR_MESSAGES.RECORD_NOT_FOUND);
    }

    entries[index] = {
      ...entry,
      id: entries[index].id,
      createdAt: entries[index].createdAt
    };

    this.saveToStorage(STORAGE_KEYS.SAVINGS, entries);
  }

  /**
   * Deletes a savings entry by ID
   * @param id - ID of the savings entry to delete
   * @throws Error with Hebrew message if record not found
   */
  async deleteSavingsEntry(id: string): Promise<void> {
    const entries = await this.loadSavingsEntries();
    const filtered = entries.filter(e => e.id !== id);

    if (filtered.length === entries.length) {
      throw new Error(ERROR_MESSAGES.RECORD_NOT_FOUND);
    }

    this.saveToStorage(STORAGE_KEYS.SAVINGS, filtered);
  }

  /**
   * Saves the monthly savings goal amount to localStorage
   * @param amount - Goal amount in ₪
   * @throws Error with Hebrew message if save fails
   */
  async saveMonthlySavingsGoal(amount: number): Promise<void> {
    try {
      this.saveToStorage(STORAGE_KEYS.MONTHLY_SAVINGS_GOAL, amount);
    } catch (error) {
      throw new Error(ERROR_MESSAGES.SAVE_FAILED);
    }
  }

  /**
   * Loads the monthly savings goal from localStorage
   * @returns The goal amount, or null if not set or data is corrupted
   */
  async loadMonthlySavingsGoal(): Promise<number | null> {
    try {
      const value = this.loadFromStorage<number>(STORAGE_KEYS.MONTHLY_SAVINGS_GOAL);
      if (value === null || typeof value !== 'number' || !isFinite(value)) {
        return null;
      }
      return value;
    } catch (error) {
      console.error(ERROR_MESSAGES.CORRUPTED_DATA, error);
      return null;
    }
  }

  /**
   * Helper method to save data to localStorage
   * @param key - Storage key
   * @param data - Data to save
   */
  private saveToStorage<T>(key: string, data: T): void {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
  }

  /**
   * Helper method to load data from localStorage
   * @param key - Storage key
   * @returns Parsed data or null if not found
   */
  private loadFromStorage<T>(key: string): T | null {
    const serialized = localStorage.getItem(key);
    if (!serialized) {
      return null;
    }
    return JSON.parse(serialized) as T;
  }
}
