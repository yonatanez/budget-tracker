/**
 * Unit tests for EntryManager rendering and interactions
 * Tests Requirements 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.5, 4.1, 4.5, 5.1, 5.4, 6.1, 6.4
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { EntryManager, EntryManagerConfig } from './EntryManager';
import { StorageService } from '../data-access/StorageService';
import { ValidationService, DefaultValidationService } from '../data-access/ValidationService';
import { TaxCalculator } from '../application/TaxCalculator';
import { SalaryRecord, Expense, FinancialData, TaxCalculationResult, SalaryComponents } from '../domain/types';

// Mock StorageService
const createMockStorageService = (data: FinancialData = { salaries: [], expenses: [] }): StorageService => ({
  saveSalary: vi.fn().mockResolvedValue(undefined),
  saveExpense: vi.fn().mockResolvedValue(undefined),
  loadAllData: vi.fn().mockResolvedValue(data),
  updateSalary: vi.fn().mockResolvedValue(undefined),
  updateExpense: vi.fn().mockResolvedValue(undefined),
  deleteSalary: vi.fn().mockResolvedValue(undefined),
  deleteExpense: vi.fn().mockResolvedValue(undefined),
});

// Helper to create a salary record
const createSalaryRecord = (overrides: Partial<SalaryRecord> = {}): SalaryRecord => {
  const salaryComponents: SalaryComponents = {
    baseSalary: 15000,
    bonus: 2000,
    stockValue: 1000,
    mealVouchers: 500,
    otherCompensation: 300,
  };

  const taxCalculation: TaxCalculationResult = {
    salaryComponents,
    grossSalary: 18800,
    taxableIncome: 18800,
    cashIncome: 18300,
    incomeTax: 2500,
    nationalInsurance: 1000,
    healthInsurance: 700,
    pensionEmployeeContribution: 900,
    pensionEmployerContribution: 975,
    studyFundEmployeeContribution: 375,
    studyFundEmployerContribution: 1125,
    netIncome: 12825,
  };

  return {
    id: 'salary-1',
    salaryComponents,
    month: new Date(2026, 0, 1), // January 2026
    taxCalculation,
    createdAt: new Date(2026, 0, 15),
    ...overrides,
  };
};

// Helper to create an expense record
const createExpenseRecord = (overrides: Partial<Expense> = {}): Expense => ({
  id: 'expense-1',
  amount: 250.50,
  date: new Date(2026, 0, 15),
  category: 'Groceries',
  description: 'Weekly shopping',
  createdAt: new Date(2026, 0, 15),
  ...overrides,
});

describe('EntryManager', () => {
  let container: HTMLElement;
  let mockStorageService: StorageService;
  let validationService: ValidationService;
  let taxCalculator: TaxCalculator;

  beforeEach(() => {
    // Create a container element for rendering
    container = document.createElement('div');
    document.body.appendChild(container);

    // Initialize services
    mockStorageService = createMockStorageService();
    validationService = new DefaultValidationService();
    taxCalculator = new TaxCalculator();
  });

  afterEach(() => {
    // Clean up DOM
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  describe('renderSalaryList', () => {
    it('should render salary list with correct fields (month, gross salary, net income) and edit/delete buttons', async () => {
      // _Requirements: 1.1, 1.2, 1.4_
      const salary = createSalaryRecord();
      mockStorageService = createMockStorageService({
        salaries: [salary],
        expenses: [],
      });

      const entryManager = new EntryManager(mockStorageService, {});
      await entryManager.renderSalaryList(container);

      // Verify list container exists
      const listContainer = container.querySelector('.entry-list');
      expect(listContainer).not.toBeNull();

      // Verify salary item exists
      const salaryItem = container.querySelector('.salary-entry');
      expect(salaryItem).not.toBeNull();
      expect(salaryItem?.getAttribute('data-id')).toBe('salary-1');

      // Verify month is displayed
      const monthField = container.querySelector('.entry-field');
      expect(monthField?.textContent).toContain('חודש');

      // Verify gross salary is displayed (₪18,800.00)
      const content = container.textContent || '';
      expect(content).toContain('משכורת ברוטו');
      expect(content).toContain('18,800');

      // Verify net income is displayed (₪12,825.00)
      expect(content).toContain('הכנסה נטו');
      expect(content).toContain('12,825');

      // Verify edit and delete buttons exist
      const editBtn = container.querySelector('.btn-edit');
      const deleteBtn = container.querySelector('.btn-delete');
      expect(editBtn).not.toBeNull();
      expect(deleteBtn).not.toBeNull();
      expect(editBtn?.textContent).toBe('ערוך');
      expect(deleteBtn?.textContent).toBe('מחק');
    });

    it('should render multiple salary records sorted by month descending', async () => {
      // _Requirements: 1.1_
      const salary1 = createSalaryRecord({ id: 'salary-1', month: new Date(2026, 0, 1) }); // January
      const salary2 = createSalaryRecord({ id: 'salary-2', month: new Date(2026, 2, 1) }); // March

      mockStorageService = createMockStorageService({
        salaries: [salary2, salary1], // Already sorted by StorageService
        expenses: [],
      });

      const entryManager = new EntryManager(mockStorageService, {});
      await entryManager.renderSalaryList(container);

      const salaryItems = container.querySelectorAll('.salary-entry');
      expect(salaryItems).toHaveLength(2);
      // First item should be March (newer)
      expect(salaryItems[0].getAttribute('data-id')).toBe('salary-2');
      // Second item should be January (older)
      expect(salaryItems[1].getAttribute('data-id')).toBe('salary-1');
    });
  });

  describe('renderExpenseList', () => {
    it('should render expense list with correct fields (date, amount, category, description) and edit/delete buttons', async () => {
      // _Requirements: 2.1, 2.2, 2.4_
      const expense = createExpenseRecord();
      mockStorageService = createMockStorageService({
        salaries: [],
        expenses: [expense],
      });

      const entryManager = new EntryManager(mockStorageService, {});
      await entryManager.renderExpenseList(container);

      // Verify list container exists
      const listContainer = container.querySelector('.entry-list');
      expect(listContainer).not.toBeNull();

      // Verify expense item exists
      const expenseItem = container.querySelector('.expense-entry');
      expect(expenseItem).not.toBeNull();
      expect(expenseItem?.getAttribute('data-id')).toBe('expense-1');

      // Verify all fields are displayed
      const content = container.textContent || '';
      expect(content).toContain('תאריך');
      expect(content).toContain('סכום');
      expect(content).toContain('250.50');
      expect(content).toContain('קטגוריה');
      expect(content).toContain('Groceries');
      expect(content).toContain('תיאור');
      expect(content).toContain('Weekly shopping');

      // Verify edit and delete buttons exist
      const editBtn = container.querySelector('.btn-edit');
      const deleteBtn = container.querySelector('.btn-delete');
      expect(editBtn).not.toBeNull();
      expect(deleteBtn).not.toBeNull();
      expect(editBtn?.textContent).toBe('ערוך');
      expect(deleteBtn?.textContent).toBe('מחק');
    });

    it('should render expense with null category and description using default messages', async () => {
      // _Requirements: 2.2_
      const expense = createExpenseRecord({
        category: null,
        description: null,
      });
      mockStorageService = createMockStorageService({
        salaries: [],
        expenses: [expense],
      });

      const entryManager = new EntryManager(mockStorageService, {});
      await entryManager.renderExpenseList(container);

      const content = container.textContent || '';
      expect(content).toContain('ללא קטגוריה');
      expect(content).toContain('ללא תיאור');
    });

    it('should render multiple expense records sorted by date descending', async () => {
      // _Requirements: 2.1_
      const expense1 = createExpenseRecord({ id: 'expense-1', date: new Date(2026, 0, 10) });
      const expense2 = createExpenseRecord({ id: 'expense-2', date: new Date(2026, 0, 20) });

      mockStorageService = createMockStorageService({
        salaries: [],
        expenses: [expense2, expense1], // Already sorted by StorageService
      });

      const entryManager = new EntryManager(mockStorageService, {});
      await entryManager.renderExpenseList(container);

      const expenseItems = container.querySelectorAll('.expense-entry');
      expect(expenseItems).toHaveLength(2);
      // First item should be Jan 20 (newer)
      expect(expenseItems[0].getAttribute('data-id')).toBe('expense-2');
      // Second item should be Jan 10 (older)
      expect(expenseItems[1].getAttribute('data-id')).toBe('expense-1');
    });
  });

  describe('showEmptyState', () => {
    it('should display empty state message when no salary records exist', async () => {
      // _Requirements: 1.3_
      mockStorageService = createMockStorageService({ salaries: [], expenses: [] });

      const entryManager = new EntryManager(mockStorageService, {});
      await entryManager.renderSalaryList(container);

      const emptyState = container.querySelector('.empty-state');
      expect(emptyState).not.toBeNull();
      expect(emptyState?.textContent).toContain('לא נמצאו רשומות משכורת');
    });

    it('should display empty state message when no expense records exist', async () => {
      // _Requirements: 2.3_
      mockStorageService = createMockStorageService({ salaries: [], expenses: [] });

      const entryManager = new EntryManager(mockStorageService, {});
      await entryManager.renderExpenseList(container);

      const emptyState = container.querySelector('.empty-state');
      expect(emptyState).not.toBeNull();
      expect(emptyState?.textContent).toContain('לא נמצאו רשומות הוצאות');
    });

    it('should render empty state directly via showEmptyState method', () => {
      // _Requirements: 1.3, 2.3_
      const entryManager = new EntryManager(mockStorageService, {});

      entryManager.showEmptyState(container, 'salary');
      expect(container.querySelector('.empty-state-message')?.textContent).toBe('לא נמצאו רשומות משכורת');

      container.innerHTML = '';
      entryManager.showEmptyState(container, 'expense');
      expect(container.querySelector('.empty-state-message')?.textContent).toBe('לא נמצאו רשומות הוצאות');
    });
  });

  describe('showEditSalaryForm', () => {
    it('should pre-populate edit form with current salary record values', () => {
      // _Requirements: 3.1_
      const salary = createSalaryRecord();
      const entryManager = new EntryManager(
        mockStorageService,
        {},
        validationService,
        taxCalculator
      );

      entryManager.showEditSalaryForm(salary);

      // Verify form overlay exists
      const overlay = document.querySelector('.edit-form-overlay');
      expect(overlay).not.toBeNull();

      // Verify form title
      const title = document.querySelector('#edit-salary-title');
      expect(title?.textContent).toBe('עריכת משכורת');

      // Verify form fields are pre-populated
      const monthInput = document.querySelector('#edit-month') as HTMLInputElement;
      expect(monthInput?.value).toBe('2026-01');

      const baseSalaryInput = document.querySelector('#edit-base-salary') as HTMLInputElement;
      expect(baseSalaryInput?.value).toBe('15000');

      const bonusInput = document.querySelector('#edit-bonus') as HTMLInputElement;
      expect(bonusInput?.value).toBe('2000');

      const stockValueInput = document.querySelector('#edit-stock-value') as HTMLInputElement;
      expect(stockValueInput?.value).toBe('1000');

      const mealVouchersInput = document.querySelector('#edit-meal-vouchers') as HTMLInputElement;
      expect(mealVouchersInput?.value).toBe('500');

      const otherCompensationInput = document.querySelector('#edit-other-compensation') as HTMLInputElement;
      expect(otherCompensationInput?.value).toBe('300');

      // Clean up
      overlay?.remove();
    });

    it('should close edit form on cancel without modifying storage', async () => {
      // _Requirements: 3.5_
      const salary = createSalaryRecord();
      const entryManager = new EntryManager(
        mockStorageService,
        {},
        validationService,
        taxCalculator
      );

      entryManager.showEditSalaryForm(salary);

      // Verify form is open
      let overlay = document.querySelector('.edit-form-overlay');
      expect(overlay).not.toBeNull();

      // Click cancel button
      const cancelBtn = document.querySelector('.btn-cancel') as HTMLButtonElement;
      cancelBtn?.click();

      // Verify form is closed
      overlay = document.querySelector('.edit-form-overlay');
      expect(overlay).toBeNull();

      // Verify storage was not modified
      expect(mockStorageService.updateSalary).not.toHaveBeenCalled();
    });

    it('should close edit form on Escape key without modifying storage', () => {
      // _Requirements: 3.5_
      const salary = createSalaryRecord();
      const entryManager = new EntryManager(
        mockStorageService,
        {},
        validationService,
        taxCalculator
      );

      entryManager.showEditSalaryForm(salary);

      // Verify form is open
      let overlay = document.querySelector('.edit-form-overlay');
      expect(overlay).not.toBeNull();

      // Press Escape key
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);

      // Verify form is closed
      overlay = document.querySelector('.edit-form-overlay');
      expect(overlay).toBeNull();

      // Verify storage was not modified
      expect(mockStorageService.updateSalary).not.toHaveBeenCalled();
    });
  });

  describe('showEditExpenseForm', () => {
    it('should pre-populate edit form with current expense record values', () => {
      // _Requirements: 4.1_
      const expense = createExpenseRecord();
      const entryManager = new EntryManager(
        mockStorageService,
        {},
        validationService,
        taxCalculator
      );

      entryManager.showEditExpenseForm(expense);

      // Verify form overlay exists
      const overlay = document.querySelector('.edit-form-overlay');
      expect(overlay).not.toBeNull();

      // Verify form title
      const title = document.querySelector('#edit-expense-title');
      expect(title?.textContent).toBe('עריכת הוצאה');

      // Verify form fields are pre-populated
      const amountInput = document.querySelector('#edit-expense-amount') as HTMLInputElement;
      expect(amountInput?.value).toBe('250.5');

      const dateInput = document.querySelector('#edit-expense-date') as HTMLInputElement;
      expect(dateInput?.value).toBe('2026-01-15');

      const categoryInput = document.querySelector('#edit-expense-category') as HTMLInputElement;
      expect(categoryInput?.value).toBe('Groceries');

      const descriptionInput = document.querySelector('#edit-expense-description') as HTMLInputElement;
      expect(descriptionInput?.value).toBe('Weekly shopping');

      // Clean up
      overlay?.remove();
    });

    it('should handle expense with null category and description in edit form', () => {
      // _Requirements: 4.1_
      const expense = createExpenseRecord({
        category: null,
        description: null,
      });
      const entryManager = new EntryManager(
        mockStorageService,
        {},
        validationService,
        taxCalculator
      );

      entryManager.showEditExpenseForm(expense);

      const categoryInput = document.querySelector('#edit-expense-category') as HTMLInputElement;
      expect(categoryInput?.value).toBe('');

      const descriptionInput = document.querySelector('#edit-expense-description') as HTMLInputElement;
      expect(descriptionInput?.value).toBe('');

      // Clean up
      document.querySelector('.edit-form-overlay')?.remove();
    });

    it('should close edit form on cancel without modifying storage', () => {
      // _Requirements: 4.5_
      const expense = createExpenseRecord();
      const entryManager = new EntryManager(
        mockStorageService,
        {},
        validationService,
        taxCalculator
      );

      entryManager.showEditExpenseForm(expense);

      // Verify form is open
      let overlay = document.querySelector('.edit-form-overlay');
      expect(overlay).not.toBeNull();

      // Click cancel button
      const cancelBtn = document.querySelector('.btn-cancel') as HTMLButtonElement;
      cancelBtn?.click();

      // Verify form is closed
      overlay = document.querySelector('.edit-form-overlay');
      expect(overlay).toBeNull();

      // Verify storage was not modified
      expect(mockStorageService.updateExpense).not.toHaveBeenCalled();
    });

    it('should close edit form on Escape key without modifying storage', () => {
      // _Requirements: 4.5_
      const expense = createExpenseRecord();
      const entryManager = new EntryManager(
        mockStorageService,
        {},
        validationService,
        taxCalculator
      );

      entryManager.showEditExpenseForm(expense);

      // Verify form is open
      let overlay = document.querySelector('.edit-form-overlay');
      expect(overlay).not.toBeNull();

      // Press Escape key
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);

      // Verify form is closed
      overlay = document.querySelector('.edit-form-overlay');
      expect(overlay).toBeNull();

      // Verify storage was not modified
      expect(mockStorageService.updateExpense).not.toHaveBeenCalled();
    });
  });

  describe('showDeleteConfirmation', () => {
    it('should display confirmation dialog on delete click', () => {
      // _Requirements: 5.1, 6.1_
      const entryManager = new EntryManager(mockStorageService, {});
      const onConfirm = vi.fn();

      entryManager.showDeleteConfirmation('salary', 'salary-1', onConfirm);

      // Verify dialog exists
      const overlay = document.querySelector('.confirmation-overlay');
      expect(overlay).not.toBeNull();

      // Verify dialog content
      const message = document.querySelector('.confirmation-message');
      expect(message?.textContent).toBe('האם אתה בטוח שברצונך למחוק רשומה זו?');

      // Verify buttons exist
      const confirmBtn = document.querySelector('.btn-confirm-delete');
      const cancelBtn = document.querySelector('.btn-cancel');
      expect(confirmBtn?.textContent).toBe('מחק');
      expect(cancelBtn?.textContent).toBe('ביטול');

      // Clean up
      overlay?.remove();
    });

    it('should close confirmation dialog on cancel without calling onConfirm', () => {
      // _Requirements: 5.4, 6.4_
      const entryManager = new EntryManager(mockStorageService, {});
      const onConfirm = vi.fn();

      entryManager.showDeleteConfirmation('salary', 'salary-1', onConfirm);

      // Verify dialog is open
      let overlay = document.querySelector('.confirmation-overlay');
      expect(overlay).not.toBeNull();

      // Click cancel button
      const cancelBtn = document.querySelector('.btn-cancel') as HTMLButtonElement;
      cancelBtn?.click();

      // Verify dialog is closed
      overlay = document.querySelector('.confirmation-overlay');
      expect(overlay).toBeNull();

      // Verify onConfirm was not called
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('should close confirmation dialog on Escape key without calling onConfirm', () => {
      // _Requirements: 5.4, 6.4_
      const entryManager = new EntryManager(mockStorageService, {});
      const onConfirm = vi.fn();

      entryManager.showDeleteConfirmation('expense', 'expense-1', onConfirm);

      // Verify dialog is open
      let overlay = document.querySelector('.confirmation-overlay');
      expect(overlay).not.toBeNull();

      // Press Escape key
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);

      // Verify dialog is closed
      overlay = document.querySelector('.confirmation-overlay');
      expect(overlay).toBeNull();

      // Verify onConfirm was not called
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('should close confirmation dialog on clicking outside (overlay)', () => {
      // _Requirements: 5.4, 6.4_
      const entryManager = new EntryManager(mockStorageService, {});
      const onConfirm = vi.fn();

      entryManager.showDeleteConfirmation('salary', 'salary-1', onConfirm);

      // Verify dialog is open
      let overlay = document.querySelector('.confirmation-overlay') as HTMLElement;
      expect(overlay).not.toBeNull();

      // Click on overlay (outside dialog)
      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'target', { value: overlay });
      overlay.dispatchEvent(clickEvent);

      // Verify dialog is closed
      overlay = document.querySelector('.confirmation-overlay') as HTMLElement;
      expect(overlay).toBeNull();

      // Verify onConfirm was not called
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('should call onConfirm and close dialog when confirm button is clicked', async () => {
      // _Requirements: 5.2, 5.3, 6.2, 6.3_
      const entryManager = new EntryManager(mockStorageService, {});
      const onConfirm = vi.fn().mockResolvedValue(undefined);

      entryManager.showDeleteConfirmation('salary', 'salary-1', onConfirm);

      // Click confirm button
      const confirmBtn = document.querySelector('.btn-confirm-delete') as HTMLButtonElement;
      confirmBtn?.click();

      // Wait for the async confirm handler to complete and dialog to close
      await new Promise(resolve => setTimeout(resolve, 10));

      // Verify onConfirm was called
      expect(onConfirm).toHaveBeenCalled();

      // Verify dialog is closed
      const overlay = document.querySelector('.confirmation-overlay');
      expect(overlay).toBeNull();
    });
  });

  describe('edit/delete button callbacks', () => {
    it('should call onEditSalary callback when edit button is clicked', async () => {
      // _Requirements: 1.4_
      const salary = createSalaryRecord();
      const onEditSalary = vi.fn();

      mockStorageService = createMockStorageService({
        salaries: [salary],
        expenses: [],
      });

      const config: EntryManagerConfig = { onEditSalary };
      const entryManager = new EntryManager(mockStorageService, config);
      await entryManager.renderSalaryList(container);

      // Click edit button
      const editBtn = container.querySelector('.btn-edit') as HTMLButtonElement;
      editBtn?.click();

      expect(onEditSalary).toHaveBeenCalledWith(salary);
    });

    it('should call onDeleteSalary callback when delete button is clicked', async () => {
      // _Requirements: 1.4_
      const salary = createSalaryRecord();
      const onDeleteSalary = vi.fn();

      mockStorageService = createMockStorageService({
        salaries: [salary],
        expenses: [],
      });

      const config: EntryManagerConfig = { onDeleteSalary };
      const entryManager = new EntryManager(mockStorageService, config);
      await entryManager.renderSalaryList(container);

      // Click delete button
      const deleteBtn = container.querySelector('.btn-delete') as HTMLButtonElement;
      deleteBtn?.click();

      expect(onDeleteSalary).toHaveBeenCalledWith('salary-1');
    });

    it('should call onEditExpense callback when edit button is clicked', async () => {
      // _Requirements: 2.4_
      const expense = createExpenseRecord();
      const onEditExpense = vi.fn();

      mockStorageService = createMockStorageService({
        salaries: [],
        expenses: [expense],
      });

      const config: EntryManagerConfig = { onEditExpense };
      const entryManager = new EntryManager(mockStorageService, config);
      await entryManager.renderExpenseList(container);

      // Click edit button
      const editBtn = container.querySelector('.btn-edit') as HTMLButtonElement;
      editBtn?.click();

      expect(onEditExpense).toHaveBeenCalledWith(expense);
    });

    it('should call onDeleteExpense callback when delete button is clicked', async () => {
      // _Requirements: 2.4_
      const expense = createExpenseRecord();
      const onDeleteExpense = vi.fn();

      mockStorageService = createMockStorageService({
        salaries: [],
        expenses: [expense],
      });

      const config: EntryManagerConfig = { onDeleteExpense };
      const entryManager = new EntryManager(mockStorageService, config);
      await entryManager.renderExpenseList(container);

      // Click delete button
      const deleteBtn = container.querySelector('.btn-delete') as HTMLButtonElement;
      deleteBtn?.click();

      expect(onDeleteExpense).toHaveBeenCalledWith('expense-1');
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes on salary list', async () => {
      const salary = createSalaryRecord();
      mockStorageService = createMockStorageService({
        salaries: [salary],
        expenses: [],
      });

      const entryManager = new EntryManager(mockStorageService, {});
      await entryManager.renderSalaryList(container);

      const listContainer = container.querySelector('.entry-list');
      expect(listContainer?.getAttribute('role')).toBe('list');
      expect(listContainer?.getAttribute('aria-label')).toBe('רשימת משכורות');

      const listItem = container.querySelector('.salary-entry');
      expect(listItem?.getAttribute('role')).toBe('listitem');
    });

    it('should have proper ARIA attributes on expense list', async () => {
      const expense = createExpenseRecord();
      mockStorageService = createMockStorageService({
        salaries: [],
        expenses: [expense],
      });

      const entryManager = new EntryManager(mockStorageService, {});
      await entryManager.renderExpenseList(container);

      const listContainer = container.querySelector('.entry-list');
      expect(listContainer?.getAttribute('role')).toBe('list');
      expect(listContainer?.getAttribute('aria-label')).toBe('רשימת הוצאות');

      const listItem = container.querySelector('.expense-entry');
      expect(listItem?.getAttribute('role')).toBe('listitem');
    });

    it('should have proper ARIA attributes on empty state', async () => {
      mockStorageService = createMockStorageService({ salaries: [], expenses: [] });

      const entryManager = new EntryManager(mockStorageService, {});
      await entryManager.renderSalaryList(container);

      const emptyState = container.querySelector('.empty-state');
      expect(emptyState?.getAttribute('role')).toBe('status');
    });

    it('should have proper ARIA attributes on confirmation dialog', () => {
      const entryManager = new EntryManager(mockStorageService, {});
      entryManager.showDeleteConfirmation('salary', 'salary-1', vi.fn());

      const overlay = document.querySelector('.confirmation-overlay');
      expect(overlay?.getAttribute('role')).toBe('dialog');
      expect(overlay?.getAttribute('aria-modal')).toBe('true');
      expect(overlay?.getAttribute('aria-labelledby')).toBe('confirmation-title');

      // Clean up
      overlay?.remove();
    });

    it('should have proper ARIA attributes on edit form', () => {
      const salary = createSalaryRecord();
      const entryManager = new EntryManager(
        mockStorageService,
        {},
        validationService,
        taxCalculator
      );

      entryManager.showEditSalaryForm(salary);

      const overlay = document.querySelector('.edit-form-overlay');
      expect(overlay?.getAttribute('role')).toBe('dialog');
      expect(overlay?.getAttribute('aria-modal')).toBe('true');
      expect(overlay?.getAttribute('aria-labelledby')).toBe('edit-salary-title');

      // Clean up
      overlay?.remove();
    });
  });
});
