/**
 * ProgressBarManager - Renders progress bars for savings goal visualization.
 * Reusable for both monthly and annual report views.
 * Implements Requirements 4.4, 4.5, 4.6, 4.7, 6.3, 6.4, 6.5, 6.6
 */

import { LocalizationService } from '../data-access/LocalizationService';

export interface ProgressData {
  percentage: number;
  actual: number;
  goal: number;
  deficit: number | null;
}

export class ProgressBarManager {
  private localizationService: LocalizationService;

  constructor(localizationService: LocalizationService) {
    this.localizationService = localizationService;
  }

  /**
   * Render a progress bar inside the specified container.
   * - Green (.positive) when percentage >= 100
   * - Red (.negative) when percentage <= 0 or deficit exists
   * - Blue (.partial) for in-between values
   * @param containerId - DOM element ID to render into
   * @param progress - Progress data with percentage, actual, goal, deficit
   */
  render(containerId: string, progress: ProgressData): void {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Progress bar container "${containerId}" not found`);
      return;
    }

    const { percentage, actual, goal, deficit } = progress;

    // Determine fill CSS class
    let fillClass: string;
    if (percentage >= 100) {
      fillClass = 'positive';
    } else if (percentage <= 0 || deficit !== null) {
      fillClass = 'negative';
    } else {
      fillClass = 'partial';
    }

    // Clamp visual width to 0-100%
    const visualWidth = Math.min(Math.max(percentage, 0), 100);

    const actualFormatted = this.localizationService.formatCurrency(actual);
    const goalFormatted = this.localizationService.formatCurrency(goal);
    const deficitFormatted = deficit !== null ? this.localizationService.formatCurrency(deficit) : '';

    container.innerHTML = `<div class="progress-bar-wrapper">
    <div class="progress-bar-info">
        <span class="progress-actual">${actualFormatted}</span>
        <span class="progress-separator"> / </span>
        <span class="progress-goal">${goalFormatted}</span>
        <span class="progress-percentage">(${percentage}%)</span>
    </div>
    <div class="progress-bar-track">
        <div class="progress-bar-fill ${fillClass}" style="width: ${visualWidth}%"></div>
    </div>
    <div class="progress-deficit" style="display: ${deficit !== null ? 'block' : 'none'}">
        חסרים: ${deficitFormatted}
    </div>
</div>`;

    container.style.display = 'block';
  }

  /**
   * Hide the progress bar container.
   * @param containerId - DOM element ID to hide
   */
  hide(containerId: string): void {
    const container = document.getElementById(containerId);
    if (container) {
      container.style.display = 'none';
    }
  }

  /**
   * Show the progress bar container.
   * @param containerId - DOM element ID to show
   */
  show(containerId: string): void {
    const container = document.getElementById(containerId);
    if (container) {
      container.style.display = 'block';
    }
  }
}
