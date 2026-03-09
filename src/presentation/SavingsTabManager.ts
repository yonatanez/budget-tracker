/**
 * SavingsTabManager - Manages the savings tab UI for CRUD operations on savings entries
 * Implements Requirements 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10
 */

import { SavingsEntry, SavingsEntryInput, SavingsType } from '../domain/types';
import { createSavingsEntry } from '../domain/models';
import { StorageService } from '../data-access/StorageService';
import { ValidationService } from '../data-access/ValidationService';
import { LocalizationService } from '../data-access/LocalizationService';

/**
 * Hebrew labels for savings types
 */
const TYPE_LABELS: Record<SavingsType, string> = {
  savings: 'חיסכון',
  investment: 'השקעה',
  pension: 'פנסיה'
};

/**
 * Hebrew messages for the savings tab
 */
const SAVINGS_MESSAGES = {
  EMPTY_ENTRIES: 'לא נמצאו רשומות חיסכון',
  EDIT: 'ערוך',
  DELETE: 'מחק',
  SAVE: 'שמור',
  CANCEL: 'ביטול',
  DELETE_CONFIRMATION: 'האם אתה בטוח שברצונך למחוק רשומה זו?',
  SUCCESS_ADD: '✓ הרשומה נוספה בהצלחה!',
  SUCCESS_UPDATE: '✓ הרשומה עודכנה בהצלחה!',
  DESCRIPTION: 'תיאור',
  AMOUNT: 'סכום',
  MONTH: 'חודש',
  TYPE: 'סוג',
  SUBTOTAL: 'סה"כ',
  NO_DESCRIPTION: 'ללא תיאור'
} as const;

/**
 * Ordered list of savings types for consistent rendering
 */
const TYPE_ORDER: SavingsType[] = ['savings', 'investment', 'pension'];

/**
 * SavingsTabManager class for managing the savings tab UI
 */
export class SavingsTabManager {
  private storageService: StorageService;
  private validationService: ValidationService;
  private localizationService: LocalizationService;

  constructor(
    storageService: StorageService,
    validationService: ValidationService,
    localizationService: LocalizationService
  ) {
    this.storageService = storageService;
    this.validationService = validationService;
    this.localizationService = localizationService;
  }

  /**
   * Initialize the savings tab: populate month selector and attach form handler
   */
  init(): void {
    this.populateMonthSelector();
    this.attachFormHandler();
    this.renderEntries();
  }

  /**
   * Populate the month selector with Hebrew month names
   */
  private populateMonthSelector(): void {
    const monthSelect = document.getElementById('savingsMonth') as HTMLSelectElement;
    if (!monthSelect) return;

    monthSelect.innerHTML = '';
    for (let m = 1; m <= 12; m++) {
      const option = document.createElement('option');
      option.value = String(m);
      option.textContent = this.localizationService.getMonthName(m);
      monthSelect.appendChild(option);
    }

    // Default to current month
    const currentMonth = new Date().getMonth() + 1;
    monthSelect.value = String(currentMonth);
  }

  /**
   * Attach form submit handler for adding new savings entries
   */
  private attachFormHandler(): void {
    const form = document.getElementById('savings-form') as HTMLFormElement;
    if (!form) return;

    form.addEventListener('submit', async (e: Event) => {
      e.preventDefault();
      await this.handleFormSubmit();
    });
  }

  /**
   * Handle savings form submission
   */
  private async handleFormSubmit(): Promise<void> {
    const resultDiv = document.getElementById('savings-result') as HTMLElement;

    // Read form values
    const typeSelect = document.getElementById('savingsType') as HTMLSelectElement;
    const descriptionInput = document.getElementById('savingsDescription') as HTMLInputElement;
    const amountInput = document.getElementById('savingsAmount') as HTMLInputElement;
    const monthSelect = document.getElementById('savingsMonth') as HTMLSelectElement;

    const type = typeSelect.value as SavingsType;
    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value) || 0;
    const monthNum = parseInt(monthSelect.value, 10);
    const year = new Date().getFullYear();
    const month = new Date(year, monthNum - 1, 1);

    const input: SavingsEntryInput = { type, description, amount, month };

    // Validate
    const validation = this.validationService.validateSavingsEntry(input);
    if (!validation.isValid) {
      if (resultDiv) {
        resultDiv.innerHTML = validation.errors
          .map(err => `<p class="form-error">${err}</p>`)
          .join('');
        resultDiv.style.display = 'block';
      }
      return;
    }

    try {
      // Create and save entry
      const entry = createSavingsEntry(input);
      await this.storageService.saveSavingsEntry(entry);

      // Show success
      if (resultDiv) {
        resultDiv.innerHTML = `<div class="success-box">${SAVINGS_MESSAGES.SUCCESS_ADD}</div>`;
        resultDiv.style.display = 'block';
      }

      // Clear form fields
      descriptionInput.value = '';
      amountInput.value = '';

      // Refresh list
      await this.renderEntries();
    } catch (error) {
      if (resultDiv) {
        const msg = error instanceof Error ? error.message : 'שגיאה בשמירת הנתונים';
        resultDiv.innerHTML = `<div class="error-box">❌ ${msg}</div>`;
        resultDiv.style.display = 'block';
      }
    }
  }

  /**
   * Group savings entries by type
   * @param entries - Array of savings entries
   * @returns Map of type to entries array
   */
  static groupByType(entries: SavingsEntry[]): Map<SavingsType, SavingsEntry[]> {
    const groups = new Map<SavingsType, SavingsEntry[]>();
    for (const type of TYPE_ORDER) {
      groups.set(type, []);
    }
    for (const entry of entries) {
      const group = groups.get(entry.type);
      if (group) {
        group.push(entry);
      }
    }
    return groups;
  }

  /**
   * Calculate subtotal for a group of entries
   * @param entries - Array of savings entries
   * @returns Sum of amounts
   */
  static calculateSubtotal(entries: SavingsEntry[]): number {
    return entries.reduce((sum, entry) => sum + entry.amount, 0);
  }

  /**
   * Render all savings entries grouped by type with subtotals
   */
  async renderEntries(): Promise<void> {
    const container = document.getElementById('savings-entry-list') as HTMLElement;
    if (!container) return;

    try {
      const entries = await this.storageService.loadSavingsEntries();
      container.innerHTML = '';

      if (entries.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.setAttribute('role', 'status');
        emptyState.innerHTML = `<p class="empty-state-message">${SAVINGS_MESSAGES.EMPTY_ENTRIES}</p>`;
        container.appendChild(emptyState);
        return;
      }

      const groups = SavingsTabManager.groupByType(entries);

      for (const type of TYPE_ORDER) {
        const groupEntries = groups.get(type)!;
        if (groupEntries.length === 0) continue;

        const groupDiv = document.createElement('div');
        groupDiv.className = 'savings-group';
        groupDiv.setAttribute('data-type', type);

        // Group header
        const header = document.createElement('h4');
        header.className = 'savings-group-header';
        header.textContent = TYPE_LABELS[type];
        groupDiv.appendChild(header);

        // Entry list
        const listDiv = document.createElement('div');
        listDiv.className = 'entry-list';
        listDiv.setAttribute('role', 'list');
        listDiv.setAttribute('aria-label', `רשימת ${TYPE_LABELS[type]}`);

        for (const entry of groupEntries) {
          const item = this.createEntryItem(entry);
          listDiv.appendChild(item);
        }
        groupDiv.appendChild(listDiv);

        // Subtotal
        const subtotal = SavingsTabManager.calculateSubtotal(groupEntries);
        const subtotalDiv = document.createElement('div');
        subtotalDiv.className = 'savings-subtotal';
        subtotalDiv.textContent = `${SAVINGS_MESSAGES.SUBTOTAL}: ${this.formatCurrency(subtotal)}`;
        groupDiv.appendChild(subtotalDiv);

        container.appendChild(groupDiv);
      }
    } catch (error) {
      console.error('Error rendering savings entries:', error);
    }
  }

  /**
   * Create a single savings entry list item with edit/delete buttons
   */
  private createEntryItem(entry: SavingsEntry): HTMLElement {
    const item = document.createElement('div');
    item.className = 'entry-item savings-entry';
    item.setAttribute('role', 'listitem');
    item.setAttribute('data-id', entry.id);

    const monthNum = entry.month instanceof Date
      ? entry.month.getMonth() + 1
      : new Date(entry.month).getMonth() + 1;
    const monthName = this.localizationService.getMonthName(monthNum);
    const amount = this.formatCurrency(entry.amount);
    const description = entry.description || SAVINGS_MESSAGES.NO_DESCRIPTION;

    item.innerHTML = `
      <div class="entry-details">
        <div class="entry-field">
          <span class="entry-label">${SAVINGS_MESSAGES.DESCRIPTION}:</span>
          <span class="entry-value">${description}</span>
        </div>
        <div class="entry-field">
          <span class="entry-label">${SAVINGS_MESSAGES.AMOUNT}:</span>
          <span class="entry-value entry-value-highlight">${amount}</span>
        </div>
        <div class="entry-field">
          <span class="entry-label">${SAVINGS_MESSAGES.MONTH}:</span>
          <span class="entry-value">${monthName}</span>
        </div>
      </div>
      <div class="entry-actions">
        <button type="button" class="btn-edit" aria-label="${SAVINGS_MESSAGES.EDIT} ${description}">${SAVINGS_MESSAGES.EDIT}</button>
        <button type="button" class="btn-delete" aria-label="${SAVINGS_MESSAGES.DELETE} ${description}">${SAVINGS_MESSAGES.DELETE}</button>
      </div>
    `;

    // Attach edit handler
    const editBtn = item.querySelector('.btn-edit') as HTMLButtonElement;
    editBtn.addEventListener('click', () => {
      this.showEditForm(entry);
    });

    // Attach delete handler
    const deleteBtn = item.querySelector('.btn-delete') as HTMLButtonElement;
    deleteBtn.addEventListener('click', () => {
      this.showDeleteConfirmation(entry.id);
    });

    return item;
  }

  /**
   * Show inline edit form pre-populated with existing values
   * Implements Requirement 3.6
   */
  private showEditForm(entry: SavingsEntry): void {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'edit-form-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'edit-savings-title');

    const formContainer = document.createElement('div');
    formContainer.className = 'edit-form-container';

    // Get current month value
    const entryMonth = entry.month instanceof Date ? entry.month : new Date(entry.month);
    const monthNum = entryMonth.getMonth() + 1;

    // Build month options
    let monthOptions = '';
    for (let m = 1; m <= 12; m++) {
      const name = this.localizationService.getMonthName(m);
      const selected = m === monthNum ? ' selected' : '';
      monthOptions += `<option value="${m}"${selected}>${name}</option>`;
    }

    // Build type options
    let typeOptions = '';
    for (const t of TYPE_ORDER) {
      const selected = t === entry.type ? ' selected' : '';
      typeOptions += `<option value="${t}"${selected}>${TYPE_LABELS[t]}</option>`;
    }

    formContainer.innerHTML = `
      <h2 id="edit-savings-title" class="edit-form-title">עריכת רשומת חיסכון</h2>
      <form class="edit-savings-form" novalidate>
        <div class="form-errors" role="alert" aria-live="polite"></div>
        
        <div class="form-group">
          <label for="edit-savings-type">${SAVINGS_MESSAGES.TYPE}</label>
          <select id="edit-savings-type" name="type" required>
            ${typeOptions}
          </select>
        </div>
        
        <div class="form-group">
          <label for="edit-savings-description">${SAVINGS_MESSAGES.DESCRIPTION}</label>
          <input type="text" id="edit-savings-description" name="description" 
            value="${entry.description}" maxlength="200" required />
        </div>
        
        <div class="form-group">
          <label for="edit-savings-amount">${SAVINGS_MESSAGES.AMOUNT}</label>
          <input type="number" id="edit-savings-amount" name="amount" 
            value="${entry.amount}" min="0.01" step="0.01" required />
        </div>
        
        <div class="form-group">
          <label for="edit-savings-month">${SAVINGS_MESSAGES.MONTH}</label>
          <select id="edit-savings-month" name="month" required>
            ${monthOptions}
          </select>
        </div>
        
        <div class="form-buttons">
          <button type="submit" class="btn-save">${SAVINGS_MESSAGES.SAVE}</button>
          <button type="button" class="btn-cancel">${SAVINGS_MESSAGES.CANCEL}</button>
        </div>
      </form>
    `;

    overlay.appendChild(formContainer);
    document.body.appendChild(overlay);

    // Get form elements
    const form = formContainer.querySelector('.edit-savings-form') as HTMLFormElement;
    const cancelBtn = formContainer.querySelector('.btn-cancel') as HTMLButtonElement;
    const errorsContainer = formContainer.querySelector('.form-errors') as HTMLDivElement;

    const closeForm = (): void => {
      overlay.remove();
      document.removeEventListener('keydown', handleKeyDown);
    };

    const handleSubmit = async (event: Event): Promise<void> => {
      event.preventDefault();
      errorsContainer.innerHTML = '';

      const formData = new FormData(form);
      const type = formData.get('type') as SavingsType;
      const description = (formData.get('description') as string).trim();
      const amount = parseFloat(formData.get('amount') as string) || 0;
      const selectedMonth = parseInt(formData.get('month') as string, 10);
      const year = entryMonth.getFullYear();
      const month = new Date(year, selectedMonth - 1, 1);

      const input: SavingsEntryInput = { type, description, amount, month };

      // Validate
      const validation = this.validationService.validateSavingsEntry(input);
      if (!validation.isValid) {
        errorsContainer.innerHTML = validation.errors
          .map(err => `<p class="form-error">${err}</p>`)
          .join('');
        return;
      }

      // Build updated entry preserving id and createdAt
      const updatedEntry: SavingsEntry = {
        id: entry.id,
        type,
        description,
        amount,
        month,
        createdAt: entry.createdAt
      };

      try {
        await this.storageService.updateSavingsEntry(entry.id, updatedEntry);
        closeForm();

        // Show success message
        const resultDiv = document.getElementById('savings-result') as HTMLElement;
        if (resultDiv) {
          resultDiv.innerHTML = `<div class="success-box">${SAVINGS_MESSAGES.SUCCESS_UPDATE}</div>`;
          resultDiv.style.display = 'block';
        }

        await this.renderEntries();
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'שגיאה בשמירת הנתונים';
        errorsContainer.innerHTML = `<p class="form-error">${msg}</p>`;
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        closeForm();
      }
    };

    const handleOverlayClick = (event: MouseEvent): void => {
      if (event.target === overlay) {
        closeForm();
      }
    };

    form.addEventListener('submit', handleSubmit);
    cancelBtn.addEventListener('click', closeForm);
    overlay.addEventListener('click', handleOverlayClick);
    document.addEventListener('keydown', handleKeyDown);

    // Focus first input for accessibility
    const firstInput = form.querySelector('input') as HTMLInputElement;
    if (firstInput) {
      firstInput.focus();
    }
  }

  /**
   * Show Hebrew confirmation dialog before deleting a savings entry
   * Implements Requirement 3.7
   */
  private showDeleteConfirmation(id: string): void {
    const overlay = document.createElement('div');
    overlay.className = 'confirmation-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'confirmation-title');

    const dialog = document.createElement('div');
    dialog.className = 'confirmation-dialog';

    dialog.innerHTML = `
      <p id="confirmation-title" class="confirmation-message">${SAVINGS_MESSAGES.DELETE_CONFIRMATION}</p>
      <div class="confirmation-buttons">
        <button type="button" class="btn-confirm-delete">${SAVINGS_MESSAGES.DELETE}</button>
        <button type="button" class="btn-cancel">${SAVINGS_MESSAGES.CANCEL}</button>
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    const confirmBtn = dialog.querySelector('.btn-confirm-delete') as HTMLButtonElement;
    const cancelBtn = dialog.querySelector('.btn-cancel') as HTMLButtonElement;

    const closeDialog = (): void => {
      overlay.remove();
      document.removeEventListener('keydown', handleKeyDown);
    };

    const handleConfirm = async (): Promise<void> => {
      try {
        await this.storageService.deleteSavingsEntry(id);
        closeDialog();
        await this.renderEntries();
      } catch (error) {
        console.error('Error deleting savings entry:', error);
        closeDialog();
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        closeDialog();
      }
    };

    const handleOverlayClick = (event: MouseEvent): void => {
      if (event.target === overlay) {
        closeDialog();
      }
    };

    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', closeDialog);
    overlay.addEventListener('click', handleOverlayClick);
    document.addEventListener('keydown', handleKeyDown);

    // Focus cancel button for safety
    cancelBtn.focus();
  }

  /**
   * Format a number as Israeli currency (₪) with thousands separator
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
}
