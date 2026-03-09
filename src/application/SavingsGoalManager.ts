/**
 * SavingsGoalManager manages monthly and yearly savings targets
 * and calculates progress toward those goals.
 * Implements Requirements 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 6.1
 */

import { StorageService } from '../data-access/StorageService';

export class SavingsGoalManager {
  constructor(private storageService: StorageService) {}

  /**
   * Save monthly savings goal to localStorage.
   * Validates that amount is positive before persisting.
   * @param amount - Monthly savings goal in ₪ (must be > 0)
   * @throws Error with Hebrew message if amount is not positive
   */
  async setMonthlySavingsGoal(amount: number): Promise<void> {
    if (amount <= 0) {
      throw new Error('יעד החיסכון חייב להיות מספר חיובי גדול מאפס');
    }
    await this.storageService.saveMonthlySavingsGoal(amount);
  }

  /**
   * Get the current monthly savings goal, or null if not set.
   * @returns The monthly savings goal amount, or null
   */
  async getMonthlySavingsGoal(): Promise<number | null> {
    return this.storageService.loadMonthlySavingsGoal();
  }

  /**
   * Calculate yearly goal as 12 × monthly goal.
   * @param monthlyGoal - The monthly savings goal amount
   * @returns Yearly savings goal
   */
  getYearlySavingsGoal(monthlyGoal: number): number {
    return monthlyGoal * 12;
  }

  /**
   * Calculate progress percentage (clamped 0-100) with deficit info.
   * - When actual is negative: percentage = 0, deficit = |actual|
   * - When actual >= goal: percentage = 100, deficit = null
   * - Otherwise: percentage = (actual / goal) * 100, deficit = goal - actual
   * Percentage is rounded to 2 decimal places.
   * @param actual - Actual savings amount
   * @param goal - Savings goal amount (must be > 0)
   * @returns Progress object with percentage, actual, goal, and deficit
   */
  calculateProgress(actual: number, goal: number): {
    percentage: number;
    actual: number;
    goal: number;
    deficit: number | null;
  } {
    let percentage: number;
    let deficit: number | null;

    if (actual < 0) {
      percentage = 0;
      deficit = Math.abs(actual);
    } else if (actual >= goal) {
      percentage = 100;
      deficit = null;
    } else {
      percentage = Math.round(((actual / goal) * 100) * 100) / 100;
      deficit = goal - actual;
    }

    return { percentage, actual, goal, deficit };
  }
}
