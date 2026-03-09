/**
 * DateSelectorManager - Manages month and day dropdown selectors for expense date entry.
 * Replaces the single date input with separate month/day dropdowns.
 * Emits month-change events to trigger expense list filtering.
 * Implements Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */

import { LocalizationService } from '../data-access/LocalizationService';

/**
 * Callback type for month change events
 */
export type MonthChangeCallback = (month: number, year: number) => void;

/**
 * DateSelectorManager manages two <select> elements: month dropdown and day dropdown.
 * It keeps the day dropdown in sync with the selected month and emits change events.
 */
export class DateSelectorManager {
  private monthSelect: HTMLSelectElement;
  private daySelect: HTMLSelectElement;
  private localizationService: LocalizationService;
  private year: number;
  private monthChangeCallbacks: MonthChangeCallback[] = [];

  /**
   * @param monthSelectId - DOM id of the month <select> element
   * @param daySelectId - DOM id of the day <select> element
   * @param localizationService - Provides Hebrew month names
   * @param year - The year context for date selection (defaults to current year)
   */
  constructor(
    monthSelectId: string,
    daySelectId: string,
    localizationService: LocalizationService,
    year?: number
  ) {
    const monthEl = document.getElementById(monthSelectId);
    const dayEl = document.getElementById(daySelectId);

    if (!monthEl || !(monthEl instanceof HTMLSelectElement)) {
      throw new Error(`Month select element not found: ${monthSelectId}`);
    }
    if (!dayEl || !(dayEl instanceof HTMLSelectElement)) {
      throw new Error(`Day select element not found: ${daySelectId}`);
    }

    this.monthSelect = monthEl;
    this.daySelect = dayEl;
    this.localizationService = localizationService;
    this.year = year ?? new Date().getFullYear();
  }

  /**
   * Initialize the dropdowns: populate months with Hebrew names,
   * populate days for the current month, and set defaults to today.
   */
  init(): void {
    this.populateMonths();
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-indexed
    const currentDay = now.getDate();

    this.monthSelect.value = String(currentMonth);
    this.populateDays(currentMonth);
    this.daySelect.value = String(currentDay);

    this.monthSelect.addEventListener('change', () => {
      this.handleMonthChange();
    });
  }

  /**
   * Populate the month dropdown with Hebrew month names (1-12).
   */
  private populateMonths(): void {
    this.monthSelect.innerHTML = '';
    for (let m = 1; m <= 12; m++) {
      const option = document.createElement('option');
      option.value = String(m);
      option.textContent = this.localizationService.getMonthName(m);
      this.monthSelect.appendChild(option);
    }
  }

  /**
   * Populate the day dropdown with valid days (1 to last day) for the given month.
   * @param month - 1-indexed month number
   */
  private populateDays(month: number): void {
    const daysInMonth = DateSelectorManager.getDaysInMonth(this.year, month);
    this.daySelect.innerHTML = '';
    for (let d = 1; d <= daysInMonth; d++) {
      const option = document.createElement('option');
      option.value = String(d);
      option.textContent = String(d);
      this.daySelect.appendChild(option);
    }
  }

  /**
   * Handle month change: update day dropdown and clamp selected day if needed,
   * then emit month-change events.
   */
  private handleMonthChange(): void {
    const month = this.getSelectedMonth();
    const previousDay = this.getSelectedDay();
    const daysInMonth = DateSelectorManager.getDaysInMonth(this.year, month);

    this.populateDays(month);

    // Clamp: if previous day exceeds new month's days, select last valid day
    const clampedDay = Math.min(previousDay, daysInMonth);
    this.daySelect.value = String(clampedDay);

    // Emit month-change callbacks
    for (const cb of this.monthChangeCallbacks) {
      cb(month, this.year);
    }
  }

  /**
   * Register a callback to be invoked when the selected month changes.
   * @param callback - Receives (month: 1-12, year: number)
   */
  onMonthChange(callback: MonthChangeCallback): void {
    this.monthChangeCallbacks.push(callback);
  }

  /**
   * Get the currently selected month (1-indexed).
   */
  getSelectedMonth(): number {
    return parseInt(this.monthSelect.value, 10);
  }

  /**
   * Get the currently selected day.
   */
  getSelectedDay(): number {
    return parseInt(this.daySelect.value, 10);
  }

  /**
   * Get a Date object representing the currently selected date.
   */
  getSelectedDate(): Date {
    return new Date(this.year, this.getSelectedMonth() - 1, this.getSelectedDay());
  }

  /**
   * Get the number of days in a given month.
   * Uses the "day 0 of next month" trick: new Date(year, month, 0).getDate()
   * where month is 1-indexed.
   * @param year - Full year
   * @param month - 1-indexed month (1 = January, 12 = December)
   */
  static getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }
}
