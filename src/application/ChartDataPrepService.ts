/**
 * ChartDataPrepService - Transforms expense data into chart-compatible formats
 */

import { Expense, MonthlyReport } from '../domain/types';
import { LocalizationService } from '../data-access/LocalizationService';
import { CHART_COLORS } from '../presentation/chartConstants';

export interface PieChartData {
  labels: string[];
  values: number[];
  colors: string[];
}

export interface BarChartData {
  labels: string[];
  values: number[];
}

export interface StackedBarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    stack: string;
  }[];
}

interface CategoryAggregation {
  category: string;
  total: number;
  count: number;
}

interface MonthlyAggregation {
  month: Date;
  monthName: string;
  totalExpenses: number;
  totalIncome: number;
}

export class ChartDataPrepService {
  /**
   * Prepare data for pie chart visualization
   * @param expenses - Array of expenses to aggregate
   * @returns Chart data with labels and values
   */
  preparePieChartData(expenses: Expense[]): PieChartData {
    // Aggregate expenses by category
    const categoryMap = new Map<string, number>();
    
    expenses.forEach(expense => {
      const category = expense.category ?? 'ללא קטגוריה';
      const current = categoryMap.get(category) ?? 0;
      categoryMap.set(category, current + expense.amount);
    });

    // Convert to array and sort descending by amount
    const aggregations: CategoryAggregation[] = Array.from(categoryMap.entries())
      .map(([category, total]) => ({
        category,
        total: this.roundToTwoDecimals(total),
        count: 0
      }))
      .sort((a, b) => b.total - a.total);

    // Extract labels, values, and assign colors
    const labels = aggregations.map(agg => agg.category);
    const values = aggregations.map(agg => agg.total);
    const colors = labels.map((_, index) => CHART_COLORS[index % CHART_COLORS.length]);

    return { labels, values, colors };
  }

  /**
   * Prepare data for bar chart visualization
   * @param monthlyReports - Array of monthly reports
   * @param localizationService - For month name translation
   * @returns Chart data with labels and values
   */
  prepareBarChartData(
    monthlyReports: MonthlyReport[],
    localizationService: LocalizationService
  ): BarChartData {
    // Sort monthly reports chronologically
    const sortedReports = [...monthlyReports].sort((a, b) => 
      a.month.getTime() - b.month.getTime()
    );

    // Extract month names and total expenses
    const labels = sortedReports.map(report => {
      const month = report.month.getMonth() + 1; // 0-indexed to 1-indexed
      const year = report.month.getFullYear();
      return `${localizationService.getMonthName(month)} ${year}`;
    });

    const values = sortedReports.map(report => 
      this.roundToTwoDecimals(report.totalExpenses)
    );

    return { labels, values };
  }

  /**
   * Round a monetary value to exactly 2 decimal places
   */
  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }

  /**
   * Distinct color palette for stacked bar chart datasets.
   * Each color is unique to ensure visual clarity across all segments.
   */
  private static readonly STACKED_CHART_COLORS = [
    '#2E86C1', // Blue (net income)
    '#27AE60', // Green (savings)
    '#E74C3C', // Red
    '#F39C12', // Orange
    '#8E44AD', // Purple
    '#1ABC9C', // Teal
    '#D35400', // Dark Orange
    '#2980B9', // Medium Blue
    '#C0392B', // Dark Red
    '#16A085', // Dark Teal
    '#F1C40F', // Yellow
    '#7D3C98', // Dark Purple
    '#2ECC71', // Light Green
    '#E67E22', // Carrot
    '#3498DB', // Light Blue
    '#9B59B6', // Amethyst
    '#1F618D', // Navy
    '#A04000', // Brown
    '#117A65', // Dark Cyan
    '#B7950B', // Dark Yellow
  ];

  /**
   * Prepare data for stacked bar chart visualization (yearly report)
   * @param monthlyReports - Array of monthly reports (up to 12)
   * @param localizationService - For Hebrew month name translation
   * @returns Stacked chart data with 12 month labels and datasets for income, categories, and savings
   */
  prepareStackedBarChartData(
    monthlyReports: MonthlyReport[],
    localizationService: LocalizationService
  ): StackedBarChartData {
    // Sort reports chronologically
    const sortedReports = [...monthlyReports].sort(
      (a, b) => a.month.getTime() - b.month.getTime()
    );

    // Build a map from month index (0-11) to report for quick lookup
    const reportByMonthIndex = new Map<number, MonthlyReport>();
    for (const report of sortedReports) {
      const monthIndex = report.month.getMonth();
      reportByMonthIndex.set(monthIndex, report);
    }

    // Generate 12 Hebrew month labels (January through December)
    const labels: string[] = [];
    for (let m = 1; m <= 12; m++) {
      labels.push(localizationService.getMonthName(m));
    }

    // Collect all unique expense categories across all months (sorted for determinism)
    const allCategories = new Set<string>();
    for (const report of sortedReports) {
      for (const [category] of report.expensesByCategory) {
        allCategories.add(category);
      }
    }
    const sortedCategories = Array.from(allCategories).sort();

    let colorIndex = 0;
    const getNextColor = (): string => {
      const color = ChartDataPrepService.STACKED_CHART_COLORS[
        colorIndex % ChartDataPrepService.STACKED_CHART_COLORS.length
      ];
      colorIndex++;
      return color;
    };

    const datasets: StackedBarChartData['datasets'] = [];

    // Dataset for net income
    const incomeData: number[] = [];
    for (let m = 0; m < 12; m++) {
      const report = reportByMonthIndex.get(m);
      incomeData.push(report ? this.roundToTwoDecimals(report.netIncome) : 0);
    }
    datasets.push({
      label: 'הכנסה נטו',
      data: incomeData,
      backgroundColor: getNextColor(),
      stack: 'income',
    });

    // Dataset for each expense category
    for (const category of sortedCategories) {
      const categoryData: number[] = [];
      for (let m = 0; m < 12; m++) {
        const report = reportByMonthIndex.get(m);
        const amount = report?.expensesByCategory.get(category) ?? 0;
        categoryData.push(this.roundToTwoDecimals(amount));
      }
      datasets.push({
        label: category,
        data: categoryData,
        backgroundColor: getNextColor(),
        stack: 'expenses',
      });
    }

    // Dataset for monthly savings
    const savingsData: number[] = [];
    for (let m = 0; m < 12; m++) {
      const report = reportByMonthIndex.get(m);
      savingsData.push(report ? this.roundToTwoDecimals(report.netSavings) : 0);
    }
    datasets.push({
      label: 'חיסכון חודשי',
      data: savingsData,
      backgroundColor: getNextColor(),
      stack: 'savings',
    });

    return { labels, datasets };
  }
}
