/**
 * ChartManager - Handles Chart.js rendering and lifecycle
 */

import { PieChartData, BarChartData, StackedBarChartData } from '../application/ChartDataPrepService';
import { CHART_DEFAULT_OPTIONS, CHART_MIN_HEIGHTS } from './chartConstants';

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    legend?: { display: boolean; position: string };
    tooltip?: { enabled: boolean };
  };
}

// Chart.js types (simplified for browser usage)
declare const Chart: any;

export class ChartManager {
  private chartInstances: Map<string, any> = new Map();

  /**
   * Render a pie chart in the specified container
   * @param containerId - DOM element ID for chart canvas
   * @param data - Chart data to visualize
   * @param options - Chart.js configuration options
   */
  renderPieChart(
    containerId: string,
    data: PieChartData,
    options?: ChartOptions
  ): void {
    try {
      // Destroy existing chart if present
      this.destroyChart(containerId);

      const canvas = document.getElementById(containerId) as HTMLCanvasElement;
      if (!canvas) {
        console.error(`Canvas element with ID "${containerId}" not found`);
        return;
      }

      // Set minimum height
      canvas.style.minHeight = `${CHART_MIN_HEIGHTS.PIE}px`;

      // Add accessibility label
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', `תרשים עוגה של הוצאות לפי קטגוריה: ${data.labels.join(', ')}`);

      // Merge default options with custom options
      const chartOptions = {
        ...CHART_DEFAULT_OPTIONS,
        ...options,
        plugins: {
          ...CHART_DEFAULT_OPTIONS.plugins,
          ...(options?.plugins || {})
        }
      };

      // Create new chart instance
      const chart = new Chart(canvas, {
        type: 'pie',
        data: {
          labels: data.labels,
          datasets: [{
            data: data.values,
            backgroundColor: data.colors,
            borderWidth: 1,
            borderColor: '#ffffff'
          }]
        },
        options: chartOptions
      });

      this.chartInstances.set(containerId, chart);
    } catch (error) {
      console.error('Error rendering pie chart:', error);
    }
  }

  /**
   * Render a bar chart in the specified container
   * @param containerId - DOM element ID for chart canvas
   * @param data - Chart data to visualize
   * @param options - Chart.js configuration options
   */
  renderBarChart(
    containerId: string,
    data: BarChartData,
    options?: ChartOptions
  ): void {
    try {
      // Destroy existing chart if present
      this.destroyChart(containerId);

      const canvas = document.getElementById(containerId) as HTMLCanvasElement;
      if (!canvas) {
        console.error(`Canvas element with ID "${containerId}" not found`);
        return;
      }

      // Set minimum height
      canvas.style.minHeight = `${CHART_MIN_HEIGHTS.BAR}px`;

      // Add accessibility label
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', `תרשים עמודות של הוצאות חודשיות: ${data.labels.join(', ')}`);

      // Merge default options with custom options
      const chartOptions = {
        ...CHART_DEFAULT_OPTIONS,
        ...options,
        plugins: {
          ...CHART_DEFAULT_OPTIONS.plugins,
          ...(options?.plugins || {})
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'הוצאות (₪)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'חודש'
            }
          }
        }
      };

      // Create new chart instance
      const chart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: data.labels,
          datasets: [{
            label: 'הוצאות חודשיות',
            data: data.values,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: chartOptions
      });

      this.chartInstances.set(containerId, chart);
    } catch (error) {
      console.error('Error rendering bar chart:', error);
    }
  }

  /**
   * Render a stacked bar chart in the specified container
   * @param containerId - DOM element ID for chart canvas
   * @param data - Stacked chart data with datasets for income, categories, and savings
   * @param options - Chart.js configuration options
   */
  renderStackedBarChart(
    containerId: string,
    data: StackedBarChartData,
    options?: ChartOptions
  ): void {
    try {
      // Destroy existing chart if present
      this.destroyChart(containerId);

      const canvas = document.getElementById(containerId) as HTMLCanvasElement;
      if (!canvas) {
        console.error(`Canvas element with ID "${containerId}" not found`);
        return;
      }

      // Set minimum height
      canvas.style.minHeight = `${CHART_MIN_HEIGHTS.STACKED_BAR}px`;

      // Add accessibility label
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', 'תרשים עמודות מוערם של הכנסות, הוצאות וחיסכון חודשי');

      // Merge default options with custom options and stacked scales
      const chartOptions = {
        ...CHART_DEFAULT_OPTIONS,
        ...options,
        plugins: {
          ...CHART_DEFAULT_OPTIONS.plugins,
          ...(options?.plugins || {}),
          legend: {
            display: true,
            position: 'top' as const,
            rtl: true,
            textDirection: 'rtl' as const
          }
        },
        scales: {
          x: {
            stacked: true,
            title: {
              display: true,
              text: 'חודש'
            }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            title: {
              display: true,
              text: 'סכום (₪)'
            }
          }
        }
      };

      // Create new chart instance
      const chart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: data.labels,
          datasets: data.datasets
        },
        options: chartOptions
      });

      this.chartInstances.set(containerId, chart);
    } catch (error) {
      console.error('Error rendering stacked bar chart:', error);
    }
  }

  /**
   * Destroy existing chart instance to prevent memory leaks
   * @param containerId - DOM element ID of chart to destroy
   */
  destroyChart(containerId: string): void {
    const existingChart = this.chartInstances.get(containerId);
    if (existingChart) {
      try {
        existingChart.destroy();
        this.chartInstances.delete(containerId);
      } catch (error) {
        console.error('Error destroying chart:', error);
      }
    }
  }
}
