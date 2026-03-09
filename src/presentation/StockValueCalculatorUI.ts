/**
 * StockValueCalculatorUI - Presentation layer for the stock value calculator.
 * Manual-only mode: user enters stock value in ILS directly and saves as investment.
 * All UI text is in Hebrew with RTL layout.
 */

import { StorageService } from '../data-access/StorageService.js';
import { SavingsEntryInput } from '../domain/types.js';
import { createSavingsEntry } from '../domain/models.js';

/** Hebrew UI messages */
const STOCK_CALC_MESSAGES = {
  sectionTitle: 'מחשבון שווי מניות',
  invalidManualPrice: 'הערך חייב להיות מספר חיובי',
  savedConfirmation: 'שווי המניות נשמר בהצלחה כהשקעה',
  manualValueLabel: 'שווי מניות (₪):',
  manualValuePlaceholder: 'הזן שווי מניות בשקלים',
  saveManualBtn: 'שמור השקעה',
} as const;

class StockValueCalculatorUI {
  private container: HTMLElement | null = null;
  private manualValueInput: HTMLInputElement | null = null;
  private saveManualBtn: HTMLButtonElement | null = null;
  private confirmationDisplay: HTMLElement | null = null;
  private errorDisplay: HTMLElement | null = null;

  constructor(
    private _calculatorService: unknown,
    private _localizationService: unknown,
    private storageService: StorageService
  ) {}

  init(): void {
    this.container = document.getElementById('stock-calculator-container');
    if (!this.container) return;

    this.renderUI();
    this.attachEventListeners();
  }

  private renderUI(): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="stock-calculator" dir="rtl">
        <h3 class="stock-calculator-title">${STOCK_CALC_MESSAGES.sectionTitle}</h3>
        <div class="stock-manual-value-section">
          <div class="stock-form-group">
            <label>${STOCK_CALC_MESSAGES.manualValueLabel}</label>
            <input type="number"
                   class="stock-manual-value-input"
                   placeholder="${STOCK_CALC_MESSAGES.manualValuePlaceholder}"
                   step="0.01" min="0" />
          </div>
          <button type="button" class="stock-save-manual-btn">${STOCK_CALC_MESSAGES.saveManualBtn}</button>
        </div>
        <div class="stock-error" style="display: none;"></div>
        <div class="stock-confirmation" style="display: none;"></div>
      </div>
    `;

    this.manualValueInput = this.container.querySelector('.stock-manual-value-input');
    this.saveManualBtn = this.container.querySelector('.stock-save-manual-btn');
    this.errorDisplay = this.container.querySelector('.stock-error');
    this.confirmationDisplay = this.container.querySelector('.stock-confirmation');
  }

  private attachEventListeners(): void {
    this.saveManualBtn?.addEventListener('click', () => this.saveManualValue());
  }

  private saveManualValue(): void {
    const amount = parseFloat(this.manualValueInput?.value ?? '');
    if (!amount || amount <= 0) {
      this.showError(STOCK_CALC_MESSAGES.invalidManualPrice);
      return;
    }
    this.clearError();

    const input: SavingsEntryInput = {
      type: 'investment',
      description: 'Stock Investment (manual entry)',
      amount,
      month: new Date()
    };
    const entry = createSavingsEntry(input);
    this.storageService.saveSavingsEntry(entry).then(() => {
      this.showConfirmation();
      if (this.manualValueInput) this.manualValueInput.value = '';
    });
  }

  private showError(message: string): void {
    if (!this.errorDisplay) return;
    this.errorDisplay.textContent = message;
    this.errorDisplay.style.display = 'block';
  }

  private clearError(): void {
    if (!this.errorDisplay) return;
    this.errorDisplay.textContent = '';
    this.errorDisplay.style.display = 'none';
  }

  private showConfirmation(): void {
    if (!this.confirmationDisplay) return;
    this.confirmationDisplay.textContent = STOCK_CALC_MESSAGES.savedConfirmation;
    this.confirmationDisplay.style.display = 'block';
    setTimeout(() => {
      if (this.confirmationDisplay) this.confirmationDisplay.style.display = 'none';
    }, 3000);
  }
}

export { StockValueCalculatorUI, STOCK_CALC_MESSAGES };
