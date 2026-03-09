/**
 * Chart.js configuration constants for Budget Tracker UI
 */

/**
 * Color palette for chart categories
 * High-contrast colors meeting WCAG 3:1 contrast ratio requirement
 */
export const CHART_COLORS = [
  '#FF6384', // Pink/Red
  '#36A2EB', // Blue
  '#FFCE56', // Yellow
  '#4BC0C0', // Teal
  '#9966FF', // Purple
  '#FF9F40', // Orange
  '#FF6384', // Pink (repeat for more categories)
  '#C9CBCF', // Gray
  '#4BC0C0', // Teal (repeat)
  '#FF9F40'  // Orange (repeat)
];

/**
 * Chart.js default configuration for Hebrew/RTL support
 */
export const CHART_DEFAULT_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
      rtl: true,
      textDirection: 'rtl' as const
    },
    tooltip: {
      enabled: true,
      rtl: true,
      textDirection: 'rtl' as const
    }
  }
};

/**
 * Minimum chart heights for accessibility
 */
export const CHART_MIN_HEIGHTS = {
  PIE: 300,
  BAR: 400,
  STACKED_BAR: 400
};
