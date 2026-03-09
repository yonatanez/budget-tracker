/**
 * FormPersistenceService - Manages form state persistence to LocalStorage
 */

export interface ExpenseFormState {
  amount: string;
  date: string;
  category: string;
  description: string;
}

const STORAGE_KEY = 'lastExpenseInput';

export class FormPersistenceService {
  /**
   * Save form state to LocalStorage
   * @param formData - The form data to persist
   */
  saveFormState(formData: ExpenseFormState): void {
    try {
      const dataToStore = {
        ...formData,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.error('LocalStorage quota exceeded. Form state not persisted.');
      } else {
        console.error('Error saving form state:', error);
      }
    }
  }

  /**
   * Load form state from LocalStorage
   * @returns The persisted form state or null if none exists
   */
  loadFormState(): ExpenseFormState | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const parsed = JSON.parse(stored);
      
      // Validate the restored data
      if (!this.isValidFormState(parsed)) {
        console.warn('Invalid form state in LocalStorage, returning null');
        return null;
      }

      // Validate date is a valid date
      if (parsed.date && !this.isValidDate(parsed.date)) {
        console.warn('Invalid date in form state, skipping date field');
        parsed.date = '';
      }

      // Validate amount is a positive number
      if (parsed.amount && !this.isValidAmount(parsed.amount)) {
        console.warn('Invalid amount in form state, skipping amount field');
        parsed.amount = '';
      }

      return {
        amount: parsed.amount,
        date: parsed.date,
        category: parsed.category,
        description: parsed.description
      };
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.warn('Corrupted form state in LocalStorage, returning null');
      } else {
        console.error('Error loading form state:', error);
      }
      return null;
    }
  }

  /**
   * Clear persisted form state
   */
  clearFormState(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing form state:', error);
    }
  }

  /**
   * Validate form state structure
   */
  private isValidFormState(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Check required fields exist and are strings
    if (typeof data.amount !== 'string' || 
        typeof data.date !== 'string' || 
        typeof data.category !== 'string' || 
        typeof data.description !== 'string') {
      return false;
    }

    return true;
  }

  /**
   * Validate date string is a valid date
   */
  private isValidDate(dateStr: string): boolean {
    if (!dateStr) return true; // Empty is valid
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Validate amount string is a positive number
   */
  private isValidAmount(amountStr: string): boolean {
    if (!amountStr) return true; // Empty is valid
    const amount = parseFloat(amountStr);
    return !isNaN(amount) && amount > 0;
  }
}
