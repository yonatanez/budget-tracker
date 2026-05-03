/**
 * AdditionalIncomeManager - Manages the additional income UI in the salary tab
 * for CRUD operations on AdditionalIncomeEntry records.
 */

import { AdditionalIncomeEntry, AdditionalIncomeInput, IncomeType } from '../domain/types';
import { StorageService } from '../data-access/StorageService';
import { ValidationService } from '../data-access/ValidationService';
import { LocalizationService } from '../data-access/LocalizationService';
import { createAdditionalIncomeEntry } from '../domain/models';

const AI_TYPE_LABELS: Record<IncomeType, string> = {
  'משכורת': 'משכורת',
  'אחר': 'אחר'
};

const AI_MESSAGES = {
  EMPTY: 'לא נמצאו הכנסות נוספות',
  EDIT: 'ערוך',
  DELETE: 'מחק',
  SAVE: 'שמור',
  CANCEL: 'ביטול',
  DELETE_CONFIRM: 'האם אתה בטוח שברצונך למחוק רשומה זו?',
  SUCCESS_ADD: '✓ ההכנסה הנוספת נוספה בהצלחה!',
  SUCCESS_UPDATE: '✓ הרשומה עודכנה בהצלחה!'
} as const;

export class AdditionalIncomeManager {
  constructor(
    private storageService: StorageService,
    private validationService: ValidationService,
    private localizationService: LocalizationService
  ) {}

  /** Initialize: populate month/year selectors, attach handlers, render list */
  async init(): Promise<void> {
    this.populateMonthSelector('additionalIncomeMonth');
    this.populateYearSelector('additionalIncomeYear');

    const form = document.getElementById('additional-income-form') as HTMLFormElement | null;
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        void this.handleFormSubmit();
      });
    }

    await this.renderEntries();
  }

  private populateMonthSelector(id: string, selectedMonth?: number): void {
    const select = document.getElementById(id) as HTMLSelectElement | null;
    if (!select) return;
    select.innerHTML = '';
    const currentMonth = new Date().getMonth() + 1;
    const target = selectedMonth ?? currentMonth;
    for (let m = 1; m <= 12; m++) {
      const opt = document.createElement('option');
      opt.value = String(m);
      opt.textContent = this.localizationService.getMonthName(m);
      if (m === target) opt.selected = true;
      select.appendChild(opt);
    }
  }

  private populateYearSelector(id: string, selectedYear?: number): void {
    const select = document.getElementById(id) as HTMLSelectElement | null;
    if (!select) return;
    select.innerHTML = '';
    const currentYear = new Date().getFullYear();
    const target = selectedYear ?? currentYear;
    // Show last 2 years + next 2 years
    for (let y = currentYear - 2; y <= currentYear + 2; y++) {
      const opt = document.createElement('option');
      opt.value = String(y);
      opt.textContent = String(y);
      if (y === target) opt.selected = true;
      select.appendChild(opt);
    }
  }

  private async handleFormSubmit(): Promise<void> {
    const monthSel = document.getElementById('additionalIncomeMonth') as HTMLSelectElement | null;
    const yearSel = document.getElementById('additionalIncomeYear') as HTMLSelectElement | null;
    const typeSel = document.getElementById('additionalIncomeType') as HTMLSelectElement | null;
    const descInput = document.getElementById('additionalIncomeDescription') as HTMLInputElement | null;
    const amountInput = document.getElementById('additionalIncomeAmount') as HTMLInputElement | null;
    const resultBox = document.getElementById('additional-income-result') as HTMLElement | null;

    if (!monthSel || !yearSel || !typeSel || !descInput || !amountInput || !resultBox) return;

    const month = parseInt(monthSel.value, 10);
    const year = parseInt(yearSel.value, 10);
    const input: AdditionalIncomeInput = {
      incomeType: typeSel.value as IncomeType,
      description: descInput.value,
      amount: parseFloat(amountInput.value),
      month: new Date(year, month - 1, 1)
    };

    const validation = this.validationService.validateAdditionalIncomeInput(input);
    if (!validation.isValid) {
      this.showError(resultBox, validation.errors.join(', '));
      return;
    }

    try {
      const entry = createAdditionalIncomeEntry(input);
      await this.storageService.saveAdditionalIncome(entry);
      this.showSuccess(resultBox, AI_MESSAGES.SUCCESS_ADD);
      descInput.value = '';
      amountInput.value = '';
      await this.renderEntries();
    } catch (err) {
      this.showError(resultBox, err instanceof Error ? err.message : String(err));
    }
  }

  /** Render the entry list sorted by month desc (ties by createdAt desc) */
  async renderEntries(): Promise<void> {
    const container = document.getElementById('additional-income-list');
    if (!container) return;

    const entries = await this.storageService.loadAdditionalIncomes();

    if (entries.length === 0) {
      container.innerHTML = `<div class="empty-state">${AI_MESSAGES.EMPTY}</div>`;
      return;
    }

    const sorted = [...entries].sort((a, b) => {
      const monthDiff = b.month.getTime() - a.month.getTime();
      if (monthDiff !== 0) return monthDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    container.innerHTML = sorted.map((e) => this.renderEntryHtml(e)).join('');

    // Attach handlers
    container.querySelectorAll('.entry-item').forEach((el) => {
      const id = (el as HTMLElement).dataset.id;
      if (!id) return;
      const entry = entries.find((x) => x.id === id);
      if (!entry) return;

      el.querySelector('.edit-btn')?.addEventListener('click', () => this.showEditForm(entry));
      el.querySelector('.delete-btn')?.addEventListener('click', () => this.showDeleteConfirmation(id));
    });
  }

  private renderEntryHtml(entry: AdditionalIncomeEntry): string {
    const monthName = this.localizationService.getMonthName(entry.month.getMonth() + 1);
    const year = entry.month.getFullYear();
    const typeLabel = AI_TYPE_LABELS[entry.incomeType];
    const amount = this.formatCurrency(entry.amount);
    const desc = this.escapeHtml(entry.description);

    return `
      <div class="entry-item" data-id="${entry.id}">
        <div class="entry-details">
          <div><strong>${monthName} ${year}</strong> · ${typeLabel}</div>
          <div>${desc}</div>
          <div class="entry-amount">${amount}</div>
        </div>
        <div class="entry-actions">
          <button type="button" class="edit-btn">${AI_MESSAGES.EDIT}</button>
          <button type="button" class="delete-btn">${AI_MESSAGES.DELETE}</button>
        </div>
      </div>
    `;
  }

  private showEditForm(entry: AdditionalIncomeEntry): void {
    const existing = document.getElementById('additional-income-edit-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'additional-income-edit-overlay';
    overlay.className = 'edit-form-overlay';
    overlay.innerHTML = `
      <div class="edit-form-modal">
        <h3>עריכת הכנסה נוספת</h3>
        <form id="edit-additional-income-form" novalidate>
          <div class="form-group">
            <label>חודש:</label>
            <div class="date-selector-group">
              <select id="edit-additional-income-month" required></select>
              <select id="edit-additional-income-year" required></select>
            </div>
          </div>
          <div class="form-group">
            <label>סוג הכנסה:</label>
            <select id="edit-additional-income-type" required>
              <option value="משכורת">משכורת</option>
              <option value="אחר">אחר</option>
            </select>
          </div>
          <div class="form-group">
            <label>תיאור:</label>
            <input type="text" id="edit-additional-income-description" maxlength="200" required>
          </div>
          <div class="form-group">
            <label>סכום (₪):</label>
            <input type="number" id="edit-additional-income-amount" step="0.01" min="0.01" required>
          </div>
          <div id="edit-additional-income-error" class="error-box" style="display:none;"></div>
          <div class="form-actions">
            <button type="submit" class="btn-primary">${AI_MESSAGES.SAVE}</button>
            <button type="button" class="btn-secondary" id="edit-cancel-btn">${AI_MESSAGES.CANCEL}</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);

    // Populate selectors with the entry's values pre-selected
    this.populateMonthSelector('edit-additional-income-month', entry.month.getMonth() + 1);
    this.populateYearSelector('edit-additional-income-year', entry.month.getFullYear());

    const typeSel = document.getElementById('edit-additional-income-type') as HTMLSelectElement;
    typeSel.value = entry.incomeType;
    (document.getElementById('edit-additional-income-description') as HTMLInputElement).value = entry.description;
    (document.getElementById('edit-additional-income-amount') as HTMLInputElement).value = String(entry.amount);

    const closeModal = () => overlay.remove();

    document.getElementById('edit-cancel-btn')?.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    const form = document.getElementById('edit-additional-income-form') as HTMLFormElement;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const month = parseInt((document.getElementById('edit-additional-income-month') as HTMLSelectElement).value, 10);
      const year = parseInt((document.getElementById('edit-additional-income-year') as HTMLSelectElement).value, 10);
      const incomeType = (document.getElementById('edit-additional-income-type') as HTMLSelectElement).value as IncomeType;
      const description = (document.getElementById('edit-additional-income-description') as HTMLInputElement).value;
      const amount = parseFloat((document.getElementById('edit-additional-income-amount') as HTMLInputElement).value);

      const input: AdditionalIncomeInput = {
        incomeType,
        description,
        amount,
        month: new Date(year, month - 1, 1)
      };

      const validation = this.validationService.validateAdditionalIncomeInput(input);
      const errorBox = document.getElementById('edit-additional-income-error');
      if (!validation.isValid) {
        if (errorBox) {
          errorBox.textContent = validation.errors.join(', ');
          errorBox.style.display = 'block';
        }
        return;
      }

      try {
        const updated: AdditionalIncomeEntry = {
          id: entry.id,
          incomeType: input.incomeType,
          description: input.description,
          amount: Math.round(input.amount * 100) / 100,
          month: input.month,
          createdAt: entry.createdAt
        };
        await this.storageService.updateAdditionalIncome(entry.id, updated);
        closeModal();
        await this.renderEntries();
      } catch (err) {
        if (errorBox) {
          errorBox.textContent = err instanceof Error ? err.message : String(err);
          errorBox.style.display = 'block';
        }
      }
    });
  }

  private showDeleteConfirmation(id: string): void {
    const existing = document.getElementById('additional-income-delete-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'additional-income-delete-overlay';
    overlay.className = 'confirmation-dialog-overlay';
    overlay.innerHTML = `
      <div class="confirmation-dialog">
        <p>${AI_MESSAGES.DELETE_CONFIRM}</p>
        <div class="dialog-actions">
          <button type="button" class="btn-danger" id="confirm-delete-btn">${AI_MESSAGES.DELETE}</button>
          <button type="button" class="btn-secondary" id="cancel-delete-btn">${AI_MESSAGES.CANCEL}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    document.getElementById('cancel-delete-btn')?.addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    document.getElementById('confirm-delete-btn')?.addEventListener('click', async () => {
      try {
        await this.storageService.deleteAdditionalIncome(id);
        close();
        await this.renderEntries();
      } catch (err) {
        console.error('Failed to delete additional income:', err);
        close();
      }
    });
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  private showSuccess(box: HTMLElement, msg: string): void {
    box.textContent = msg;
    box.className = 'result-box success-box';
    box.style.display = 'block';
    setTimeout(() => {
      box.style.display = 'none';
    }, 3000);
  }

  private showError(box: HTMLElement, msg: string): void {
    box.textContent = msg;
    box.className = 'result-box error-box';
    box.style.display = 'block';
  }

  private escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
