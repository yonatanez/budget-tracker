/**
 * EntryManager - Handles rendering and management of salary and expense entry lists
 * Implements Requirements 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { SalaryRecord, Expense, FinancialData, SalaryComponents } from '../domain/types';
import { StorageService } from '../data-access/StorageService';
import { ValidationService } from '../data-access/ValidationService';
import { TaxCalculator } from '../application/TaxCalculator';

/**
 * Callback type for edit button clicks
 */
export type EditCallback<T> = (record: T) => void;

/**
 * Callback type for delete button clicks
 */
export type DeleteCallback = (id: string) => void;

/**
 * Configuration for EntryManager
 */
export interface EntryManagerConfig {
  onEditSalary?: EditCallback<SalaryRecord>;
  onDeleteSalary?: DeleteCallback;
  onEditExpense?: EditCallback<Expense>;
  onDeleteExpense?: DeleteCallback;
  salaryListContainer?: HTMLElement;
  expenseListContainer?: HTMLElement;
}

/**
 * Hebrew messages for the entry manager
 */
const MESSAGES = {
  EMPTY_SALARIES: 'לא נמצאו רשומות משכורת',
  EMPTY_EXPENSES: 'לא נמצאו רשומות הוצאות',
  EDIT: 'ערוך',
  DELETE: 'מחק',
  MONTH: 'חודש',
  GROSS_SALARY: 'משכורת ברוטו',
  NET_INCOME: 'הכנסה נטו',
  DATE: 'תאריך',
  AMOUNT: 'סכום',
  CATEGORY: 'קטגוריה',
  DESCRIPTION: 'תיאור',
  NO_CATEGORY: 'ללא קטגוריה',
  NO_DESCRIPTION: 'ללא תיאור',
  DELETE_CONFIRMATION: 'האם אתה בטוח שברצונך למחוק רשומה זו?',
  CANCEL: 'ביטול',
  SAVE: 'שמור',
  EDIT_SALARY_TITLE: 'עריכת משכורת',
  EDIT_EXPENSE_TITLE: 'עריכת הוצאה',
  BASE_SALARY: 'משכורת בסיס',
  BONUS: 'בונוס',
  STOCK_VALUE: 'ערך מניות/אופציות',
  MEAL_VOUCHERS: 'תלושי אוכל',
  OTHER_COMPENSATION: 'רכיבי שכר נוספים'
} as const;

/**
 * EntryManager class for rendering salary and expense lists
 */
export class EntryManager {
  private storageService: StorageService;
  private validationService?: ValidationService;
  private taxCalculator?: TaxCalculator;
  private config: EntryManagerConfig;

  constructor(
    storageService: StorageService, 
    config: EntryManagerConfig = {},
    validationService?: ValidationService,
    taxCalculator?: TaxCalculator
  ) {
    this.storageService = storageService;
    this.config = config;
    this.validationService = validationService;
    this.taxCalculator = taxCalculator;
  }

  /**
   * Render the salary list in the specified container
   * Fetches salary records via StorageService.loadAllData(), renders sorted by month descending
   * showing month, gross salary, net income, with edit and delete buttons per record
   * @param container - DOM element to render the list into
   */
  async renderSalaryList(container: HTMLElement): Promise<void> {
    try {
      const data: FinancialData = await this.storageService.loadAllData();
      const salaries = data.salaries;

      // Clear container
      container.innerHTML = '';

      // Show empty state if no records
      if (salaries.length === 0) {
        this.showEmptyState(container, 'salary');
        return;
      }

      // Salaries are already sorted by month descending from StorageService
      const listContainer = document.createElement('div');
      listContainer.className = 'entry-list';
      listContainer.setAttribute('role', 'list');
      listContainer.setAttribute('aria-label', 'רשימת משכורות');

      salaries.forEach((salary) => {
        const item = this.createSalaryListItem(salary);
        listContainer.appendChild(item);
      });

      container.appendChild(listContainer);
    } catch (error) {
      console.error('Error rendering salary list:', error);
      throw error;
    }
  }


  /**
   * Render the expense list in the specified container
   * Fetches expense records, renders sorted by date descending
   * showing date, amount, category, description, with edit and delete buttons per record
   * @param container - DOM element to render the list into
   */
  async renderExpenseList(container: HTMLElement): Promise<void> {
    try {
      const data: FinancialData = await this.storageService.loadAllData();
      const expenses = data.expenses;

      // Clear container
      container.innerHTML = '';

      // Show empty state if no records
      if (expenses.length === 0) {
        this.showEmptyState(container, 'expense');
        return;
      }

      // Expenses are already sorted by date descending from StorageService
      const listContainer = document.createElement('div');
      listContainer.className = 'entry-list';
      listContainer.setAttribute('role', 'list');
      listContainer.setAttribute('aria-label', 'רשימת הוצאות');

      expenses.forEach((expense) => {
        const item = this.createExpenseListItem(expense);
        listContainer.appendChild(item);
      });

      container.appendChild(listContainer);
    } catch (error) {
      console.error('Error rendering expense list:', error);
      throw error;
    }
  }

  /**
   * Filter expenses by a specific month and year
   * @param expenses - Array of expenses to filter
   * @param month - Month number (1-12)
   * @param year - Full year (e.g. 2024)
   * @returns Filtered array of expenses matching the given month/year
   */
  static filterExpensesByMonth(expenses: Expense[], month: number, year: number): Expense[] {
    return expenses.filter(
      (expense) => expense.date.getMonth() + 1 === month && expense.date.getFullYear() === year
    );
  }

  /**
   * Render the expense list filtered by a specific month and year
   * Fetches all expense records, filters to the given month/year, then renders
   * @param container - DOM element to render the list into
   * @param month - Month number (1-12)
   * @param year - Full year (e.g. 2024)
   */
  async renderFilteredExpenseList(container: HTMLElement, month: number, year: number): Promise<void> {
    try {
      const data: FinancialData = await this.storageService.loadAllData();
      const filtered = EntryManager.filterExpensesByMonth(data.expenses, month, year);

      // Clear container
      container.innerHTML = '';

      // Show empty state if no records match
      if (filtered.length === 0) {
        this.showEmptyState(container, 'expense');
        return;
      }

      const listContainer = document.createElement('div');
      listContainer.className = 'entry-list';
      listContainer.setAttribute('role', 'list');
      listContainer.setAttribute('aria-label', 'רשימת הוצאות');

      filtered.forEach((expense) => {
        const item = this.createExpenseListItem(expense);
        listContainer.appendChild(item);
      });

      container.appendChild(listContainer);
    } catch (error) {
      console.error('Error rendering filtered expense list:', error);
      throw error;
    }
  }

  /**
   * Show empty state message when no records exist
   * @param container - DOM element to render the message into
   * @param type - Type of records ('salary' or 'expense')
   */
  showEmptyState(container: HTMLElement, type: 'salary' | 'expense'): void {
    const message = type === 'salary' 
      ? MESSAGES.EMPTY_SALARIES 
      : MESSAGES.EMPTY_EXPENSES;

    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.setAttribute('role', 'status');
    emptyState.innerHTML = `
      <p class="empty-state-message">${message}</p>
    `;

    container.innerHTML = '';
    container.appendChild(emptyState);
  }

  /**
   * Create a salary list item element
   * @param salary - SalaryRecord to render
   * @returns HTMLElement representing the salary item
   */
  private createSalaryListItem(salary: SalaryRecord): HTMLElement {
    const item = document.createElement('div');
    item.className = 'entry-item salary-entry';
    item.setAttribute('role', 'listitem');
    item.setAttribute('data-id', salary.id);

    const monthStr = this.formatMonth(salary.month);
    const grossSalary = this.formatCurrency(salary.taxCalculation.grossSalary);
    const netIncome = this.formatCurrency(salary.taxCalculation.netIncome);

    item.innerHTML = `
      <div class="entry-details">
        <div class="entry-field">
          <span class="entry-label">${MESSAGES.MONTH}:</span>
          <span class="entry-value">${monthStr}</span>
        </div>
        <div class="entry-field">
          <span class="entry-label">${MESSAGES.GROSS_SALARY}:</span>
          <span class="entry-value">${grossSalary}</span>
        </div>
        <div class="entry-field">
          <span class="entry-label">${MESSAGES.NET_INCOME}:</span>
          <span class="entry-value entry-value-highlight">${netIncome}</span>
        </div>
      </div>
      <div class="entry-actions">
        <button type="button" class="btn-edit" aria-label="${MESSAGES.EDIT} משכורת ${monthStr}">${MESSAGES.EDIT}</button>
        <button type="button" class="btn-delete" aria-label="${MESSAGES.DELETE} משכורת ${monthStr}">${MESSAGES.DELETE}</button>
      </div>
    `;

    // Attach event listeners
    const editBtn = item.querySelector('.btn-edit') as HTMLButtonElement;
    const deleteBtn = item.querySelector('.btn-delete') as HTMLButtonElement;

    if (editBtn && this.config.onEditSalary) {
      editBtn.addEventListener('click', () => {
        this.config.onEditSalary!(salary);
      });
    }

    if (deleteBtn && this.config.onDeleteSalary) {
      deleteBtn.addEventListener('click', () => {
        this.config.onDeleteSalary!(salary.id);
      });
    }

    return item;
  }


  /**
   * Create an expense list item element
   * @param expense - Expense to render
   * @returns HTMLElement representing the expense item
   */
  private createExpenseListItem(expense: Expense): HTMLElement {
    const item = document.createElement('div');
    item.className = 'entry-item expense-entry';
    item.setAttribute('role', 'listitem');
    item.setAttribute('data-id', expense.id);

    const dateStr = this.formatDate(expense.date);
    const amount = this.formatCurrency(expense.amount);
    const category = expense.category || MESSAGES.NO_CATEGORY;
    const description = expense.description || MESSAGES.NO_DESCRIPTION;

    item.innerHTML = `
      <div class="entry-details">
        <div class="entry-field">
          <span class="entry-label">${MESSAGES.DATE}:</span>
          <span class="entry-value">${dateStr}</span>
        </div>
        <div class="entry-field">
          <span class="entry-label">${MESSAGES.AMOUNT}:</span>
          <span class="entry-value entry-value-highlight">${amount}</span>
        </div>
        <div class="entry-field">
          <span class="entry-label">${MESSAGES.CATEGORY}:</span>
          <span class="entry-value">${category}</span>
        </div>
        <div class="entry-field">
          <span class="entry-label">${MESSAGES.DESCRIPTION}:</span>
          <span class="entry-value">${description}</span>
        </div>
      </div>
      <div class="entry-actions">
        <button type="button" class="btn-edit" aria-label="${MESSAGES.EDIT} הוצאה ${dateStr}">${MESSAGES.EDIT}</button>
        <button type="button" class="btn-delete" aria-label="${MESSAGES.DELETE} הוצאה ${dateStr}">${MESSAGES.DELETE}</button>
      </div>
    `;

    // Attach event listeners
    const editBtn = item.querySelector('.btn-edit') as HTMLButtonElement;
    const deleteBtn = item.querySelector('.btn-delete') as HTMLButtonElement;

    if (editBtn && this.config.onEditExpense) {
      editBtn.addEventListener('click', () => {
        this.config.onEditExpense!(expense);
      });
    }

    if (deleteBtn && this.config.onDeleteExpense) {
      deleteBtn.addEventListener('click', () => {
        this.config.onDeleteExpense!(expense.id);
      });
    }

    return item;
  }

  /**
   * Format a date as a Hebrew month string (e.g., "ינואר 2026")
   * @param date - Date to format
   * @returns Formatted month string
   */
  private formatMonth(date: Date): string {
    return date.toLocaleDateString('he-IL', { 
      year: 'numeric', 
      month: 'long' 
    });
  }

  /**
   * Format a date as a Hebrew date string (e.g., "15/01/2026")
   * @param date - Date to format
   * @returns Formatted date string
   */
  private formatDate(date: Date): string {
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  /**
   * Format a number as Israeli currency (₪)
   * @param amount - Amount to format
   * @returns Formatted currency string
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Remove a salary item from the DOM by ID
   * @param id - ID of the salary record to remove
   */
  removeSalaryItem(id: string): void {
    const item = document.querySelector(`.salary-entry[data-id="${id}"]`);
    if (item) {
      item.remove();
    }
  }

  /**
   * Remove an expense item from the DOM by ID
   * @param id - ID of the expense record to remove
   */
  removeExpenseItem(id: string): void {
    const item = document.querySelector(`.expense-entry[data-id="${id}"]`);
    if (item) {
      item.remove();
    }
  }

  /**
   * Show a confirmation dialog for deleting a record
   * Implements Requirements 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4
   * @param type - Type of record ('salary' or 'expense')
   * @param id - ID of the record to delete
   * @param onConfirm - Callback to execute when deletion is confirmed
   */
  showDeleteConfirmation(
    type: 'salary' | 'expense',
    id: string,
    onConfirm: () => void | Promise<void>
  ): void {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'confirmation-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'confirmation-title');

    // Create dialog content
    const dialog = document.createElement('div');
    dialog.className = 'confirmation-dialog';

    dialog.innerHTML = `
      <p id="confirmation-title" class="confirmation-message">${MESSAGES.DELETE_CONFIRMATION}</p>
      <div class="confirmation-buttons">
        <button type="button" class="btn-confirm-delete">${MESSAGES.DELETE}</button>
        <button type="button" class="btn-cancel">${MESSAGES.CANCEL}</button>
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Get button references
    const confirmBtn = dialog.querySelector('.btn-confirm-delete') as HTMLButtonElement;
    const cancelBtn = dialog.querySelector('.btn-cancel') as HTMLButtonElement;

    // Function to close the dialog
    const closeDialog = (): void => {
      overlay.remove();
      document.removeEventListener('keydown', handleKeyDown);
    };

    // Handle confirm action
    const handleConfirm = async (): Promise<void> => {
      try {
        await onConfirm();
        closeDialog();
      } catch (error) {
        console.error('Error during delete confirmation:', error);
        closeDialog();
        throw error;
      }
    };

    // Handle Escape key
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        closeDialog();
      }
    };

    // Handle click outside dialog (on overlay)
    const handleOverlayClick = (event: MouseEvent): void => {
      if (event.target === overlay) {
        closeDialog();
      }
    };

    // Attach event listeners
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', closeDialog);
    overlay.addEventListener('click', handleOverlayClick);
    document.addEventListener('keydown', handleKeyDown);

    // Focus the cancel button for accessibility (safer default)
    cancelBtn.focus();
  }

  /**
   * Show an edit form for a salary record
   * Implements Requirements 3.1, 3.2, 3.3, 3.4, 3.5
   * @param record - SalaryRecord to edit
   */
  showEditSalaryForm(record: SalaryRecord): void {
    if (!this.validationService || !this.taxCalculator) {
      console.error('ValidationService and TaxCalculator are required for editing salaries');
      return;
    }

    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'edit-form-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'edit-salary-title');

    // Create form container
    const formContainer = document.createElement('div');
    formContainer.className = 'edit-form-container';

    // Format month for input (YYYY-MM)
    const monthValue = this.formatMonthForInput(record.month);

    formContainer.innerHTML = `
      <h2 id="edit-salary-title" class="edit-form-title">${MESSAGES.EDIT_SALARY_TITLE}</h2>
      <form class="edit-salary-form" novalidate>
        <div class="form-errors" role="alert" aria-live="polite"></div>
        
        <div class="form-group">
          <label for="edit-month">${MESSAGES.MONTH}</label>
          <input type="month" id="edit-month" name="month" value="${monthValue}" required />
        </div>
        
        <div class="form-group">
          <label for="edit-base-salary">${MESSAGES.BASE_SALARY}</label>
          <input type="number" id="edit-base-salary" name="baseSalary" 
            value="${record.salaryComponents.baseSalary}" min="0" step="0.01" required />
        </div>
        
        <div class="form-group">
          <label for="edit-bonus">${MESSAGES.BONUS}</label>
          <input type="number" id="edit-bonus" name="bonus" 
            value="${record.salaryComponents.bonus || 0}" min="0" step="0.01" />
        </div>
        
        <div class="form-group">
          <label for="edit-stock-value">${MESSAGES.STOCK_VALUE}</label>
          <input type="number" id="edit-stock-value" name="stockValue" 
            value="${record.salaryComponents.stockValue || 0}" min="0" step="0.01" />
        </div>
        
        <div class="form-group">
          <label for="edit-meal-vouchers">${MESSAGES.MEAL_VOUCHERS}</label>
          <input type="number" id="edit-meal-vouchers" name="mealVouchers" 
            value="${record.salaryComponents.mealVouchers || 0}" min="0" step="0.01" />
        </div>
        
        <div class="form-group">
          <label for="edit-other-compensation">${MESSAGES.OTHER_COMPENSATION}</label>
          <input type="number" id="edit-other-compensation" name="otherCompensation" 
            value="${record.salaryComponents.otherCompensation || 0}" min="0" step="0.01" />
        </div>
        
        <div class="form-buttons">
          <button type="submit" class="btn-save">${MESSAGES.SAVE}</button>
          <button type="button" class="btn-cancel">${MESSAGES.CANCEL}</button>
        </div>
      </form>
    `;

    overlay.appendChild(formContainer);
    document.body.appendChild(overlay);

    // Get form elements
    const form = formContainer.querySelector('.edit-salary-form') as HTMLFormElement;
    const cancelBtn = formContainer.querySelector('.btn-cancel') as HTMLButtonElement;
    const errorsContainer = formContainer.querySelector('.form-errors') as HTMLDivElement;

    // Function to close the form
    const closeForm = (): void => {
      overlay.remove();
      document.removeEventListener('keydown', handleKeyDown);
    };

    // Handle form submission
    const handleSubmit = async (event: Event): Promise<void> => {
      event.preventDefault();

      // Clear previous errors
      errorsContainer.innerHTML = '';

      // Get form values
      const formData = new FormData(form);
      const monthInput = formData.get('month') as string;
      const baseSalary = parseFloat(formData.get('baseSalary') as string) || 0;
      const bonus = parseFloat(formData.get('bonus') as string) || 0;
      const stockValue = parseFloat(formData.get('stockValue') as string) || 0;
      const mealVouchers = parseFloat(formData.get('mealVouchers') as string) || 0;
      const otherCompensation = parseFloat(formData.get('otherCompensation') as string) || 0;

      // Build salary components
      const salaryComponents: SalaryComponents = {
        baseSalary,
        bonus: bonus || undefined,
        stockValue: stockValue || undefined,
        mealVouchers: mealVouchers || undefined,
        otherCompensation: otherCompensation || undefined
      };

      // Validate salary components
      const validationResult = this.validationService!.validateSalaryComponents(salaryComponents);

      if (!validationResult.isValid) {
        // Display Hebrew validation errors
        this.displayFormErrors(errorsContainer, validationResult.errors);
        return;
      }

      // Parse month
      const [year, monthNum] = monthInput.split('-').map(Number);
      const month = new Date(year, monthNum - 1, 1);

      // Recalculate tax
      const taxCalculation = this.taxCalculator!.calculateNetIncome(salaryComponents);

      // Build updated salary record
      const updatedSalary: SalaryRecord = {
        id: record.id,
        salaryComponents,
        month,
        taxCalculation,
        createdAt: record.createdAt
      };

      try {
        // Update in storage
        await this.storageService.updateSalary(record.id, updatedSalary);

        // Close form
        closeForm();

        // Refresh the salary list if container is configured
        if (this.config.salaryListContainer) {
          await this.renderSalaryList(this.config.salaryListContainer);
        }
      } catch (error) {
        // Display storage error
        const errorMessage = error instanceof Error ? error.message : 'שגיאה בשמירת הנתונים';
        this.displayFormErrors(errorsContainer, [errorMessage]);
      }
    };

    // Handle Escape key
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        closeForm();
      }
    };

    // Handle click outside form (on overlay)
    const handleOverlayClick = (event: MouseEvent): void => {
      if (event.target === overlay) {
        closeForm();
      }
    };

    // Attach event listeners
    form.addEventListener('submit', handleSubmit);
    cancelBtn.addEventListener('click', closeForm);
    overlay.addEventListener('click', handleOverlayClick);
    document.addEventListener('keydown', handleKeyDown);

    // Focus the first input for accessibility
    const firstInput = form.querySelector('input') as HTMLInputElement;
    if (firstInput) {
      firstInput.focus();
    }
  }

  /**
   * Display validation errors in the form
   * @param container - Container element for errors
   * @param errors - Array of error messages
   */
  private displayFormErrors(container: HTMLElement, errors: string[]): void {
    container.innerHTML = errors
      .map(error => `<p class="form-error">${error}</p>`)
      .join('');
  }

  /**
   * Format a date as YYYY-MM for month input
   * @param date - Date to format
   * @returns Formatted string
   */
  private formatMonthForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Format a date as YYYY-MM-DD for date input
   * @param date - Date to format
   * @returns Formatted string
   */
  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Show an edit form for an expense record
   * Implements Requirements 4.1, 4.2, 4.3, 4.4, 4.5
   * @param record - Expense to edit
   */
  showEditExpenseForm(record: Expense): void {
    if (!this.validationService) {
      console.error('ValidationService is required for editing expenses');
      return;
    }

    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'edit-form-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'edit-expense-title');

    // Create form container
    const formContainer = document.createElement('div');
    formContainer.className = 'edit-form-container';

    // Format date for input (YYYY-MM-DD)
    const dateValue = this.formatDateForInput(record.date);

    formContainer.innerHTML = `
      <h2 id="edit-expense-title" class="edit-form-title">${MESSAGES.EDIT_EXPENSE_TITLE}</h2>
      <form class="edit-expense-form" novalidate>
        <div class="form-errors" role="alert" aria-live="polite"></div>
        
        <div class="form-group">
          <label for="edit-expense-amount">${MESSAGES.AMOUNT}</label>
          <input type="number" id="edit-expense-amount" name="amount" 
            value="${record.amount}" min="0.01" step="0.01" required />
        </div>
        
        <div class="form-group">
          <label for="edit-expense-date">${MESSAGES.DATE}</label>
          <input type="date" id="edit-expense-date" name="date" value="${dateValue}" required />
        </div>
        
        <div class="form-group">
          <label for="edit-expense-category">${MESSAGES.CATEGORY}</label>
          <input type="text" id="edit-expense-category" name="category" 
            value="${record.category || ''}" />
        </div>
        
        <div class="form-group">
          <label for="edit-expense-description">${MESSAGES.DESCRIPTION}</label>
          <input type="text" id="edit-expense-description" name="description" 
            value="${record.description || ''}" />
        </div>
        
        <div class="form-buttons">
          <button type="submit" class="btn-save">${MESSAGES.SAVE}</button>
          <button type="button" class="btn-cancel">${MESSAGES.CANCEL}</button>
        </div>
      </form>
    `;

    overlay.appendChild(formContainer);
    document.body.appendChild(overlay);

    // Get form elements
    const form = formContainer.querySelector('.edit-expense-form') as HTMLFormElement;
    const cancelBtn = formContainer.querySelector('.btn-cancel') as HTMLButtonElement;
    const errorsContainer = formContainer.querySelector('.form-errors') as HTMLDivElement;

    // Function to close the form
    const closeForm = (): void => {
      overlay.remove();
      document.removeEventListener('keydown', handleKeyDown);
    };

    // Handle form submission
    const handleSubmit = async (event: Event): Promise<void> => {
      event.preventDefault();

      // Clear previous errors
      errorsContainer.innerHTML = '';

      // Get form values
      const formData = new FormData(form);
      const amount = parseFloat(formData.get('amount') as string) || 0;
      const dateInput = formData.get('date') as string;
      const category = (formData.get('category') as string).trim() || null;
      const description = (formData.get('description') as string).trim() || null;

      // Parse date
      const date = new Date(dateInput);

      // Validate expense
      const validationResult = this.validationService!.validateExpense({
        amount,
        date,
        category: category || undefined,
        description: description || undefined
      });

      if (!validationResult.isValid) {
        // Display Hebrew validation errors
        this.displayFormErrors(errorsContainer, validationResult.errors);
        return;
      }

      // Build updated expense record (preserve id and createdAt)
      const updatedExpense: Expense = {
        id: record.id,
        amount,
        date,
        category,
        description,
        createdAt: record.createdAt
      };

      try {
        // Update in storage
        await this.storageService.updateExpense(record.id, updatedExpense);

        // Close form
        closeForm();

        // Refresh the expense list if container is configured
        if (this.config.expenseListContainer) {
          await this.renderExpenseList(this.config.expenseListContainer);
        }
      } catch (error) {
        // Display storage error
        const errorMessage = error instanceof Error ? error.message : 'שגיאה בשמירת הנתונים';
        this.displayFormErrors(errorsContainer, [errorMessage]);
      }
    };

    // Handle Escape key
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        closeForm();
      }
    };

    // Handle click outside form (on overlay)
    const handleOverlayClick = (event: MouseEvent): void => {
      if (event.target === overlay) {
        closeForm();
      }
    };

    // Attach event listeners
    form.addEventListener('submit', handleSubmit);
    cancelBtn.addEventListener('click', closeForm);
    overlay.addEventListener('click', handleOverlayClick);
    document.addEventListener('keydown', handleKeyDown);

    // Focus the first input for accessibility
    const firstInput = form.querySelector('input') as HTMLInputElement;
    if (firstInput) {
      firstInput.focus();
    }
  }
}
