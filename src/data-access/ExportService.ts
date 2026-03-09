/**
 * ExportService - Handles exporting data to CSV/Excel formats
 */

import { SalaryRecord, Expense, MonthlyReport } from '../domain/types';

export interface ExportService {
  exportSalariesToCSV(salaries: SalaryRecord[]): string;
  exportExpensesToCSV(expenses: Expense[]): string;
  exportMonthlyReportToCSV(report: MonthlyReport): string;
  downloadCSV(content: string, filename: string): void;
}

export class CSVExportService implements ExportService {
  /**
   * Export salary records to CSV format
   */
  exportSalariesToCSV(salaries: SalaryRecord[]): string {
    const headers = [
      'חודש',
      'שנה',
      'משכורת ברוטו',
      'הכנסה חייבת במס',
      'הכנסה במזומן',
      'מס הכנסה',
      'ביטוח לאומי',
      'ביטוח בריאות',
      'פנסיה עובד',
      'פנסיה מעביד',
      'קרן השתלמות עובד',
      'קרן השתלמות מעביד',
      'הכנסה נטו'
    ];

    const rows = salaries.map(salary => {
      const month = salary.month.getMonth() + 1;
      const year = salary.month.getFullYear();
      const tax = salary.taxCalculation;

      return [
        month,
        year,
        tax.grossSalary,
        tax.taxableIncome,
        tax.cashIncome,
        tax.incomeTax,
        tax.nationalInsurance,
        tax.healthInsurance,
        tax.pensionEmployeeContribution,
        tax.pensionEmployerContribution,
        tax.studyFundEmployeeContribution,
        tax.studyFundEmployerContribution,
        tax.netIncome
      ];
    });

    return this.arrayToCSV([headers, ...rows]);
  }

  /**
   * Export expenses to CSV format
   */
  exportExpensesToCSV(expenses: Expense[]): string {
    const headers = ['תאריך', 'סכום', 'קטגוריה', 'תיאור'];

    const rows = expenses.map(expense => [
      this.formatDate(expense.date),
      expense.amount,
      expense.category || '',
      expense.description || ''
    ]);

    return this.arrayToCSV([headers, ...rows]);
  }

  /**
   * Export monthly report to CSV format
   */
  exportMonthlyReportToCSV(report: MonthlyReport): string {
    const month = report.month.getMonth() + 1;
    const year = report.month.getFullYear();

    // Summary section
    const summary = [
      ['דוח חודשי', `${month}/${year}`],
      [''],
      ['הכנסה נטו', report.netIncome],
      ['סה"כ הוצאות', report.totalExpenses],
      ['חיסכון נטו', report.netSavings],
      ['']
    ];

    // Category breakdown
    const categoryHeaders = ['קטגוריה', 'סכום'];
    const categoryRows: any[] = [];
    report.expensesByCategory.forEach((amount, category) => {
      categoryRows.push([category, amount]);
    });

    // Expenses list
    const expenseHeaders = ['תאריך', 'סכום', 'קטגוריה', 'תיאור'];
    const expenseRows = report.expenses.map(expense => [
      this.formatDate(expense.date),
      expense.amount,
      expense.category || '',
      expense.description || ''
    ]);

    const allRows = [
      ...summary,
      categoryHeaders,
      ...categoryRows,
      [''],
      expenseHeaders,
      ...expenseRows
    ];

    return this.arrayToCSV(allRows);
  }

  /**
   * Trigger download of CSV file
   */
  downloadCSV(content: string, filename: string): void {
    // Add BOM for proper Hebrew encoding in Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Convert 2D array to CSV string
   */
  private arrayToCSV(data: any[][]): string {
    return data
      .map(row =>
        row
          .map(cell => {
            // Convert to string and escape quotes
            const str = String(cell ?? '');
            // Wrap in quotes if contains comma, quote, or newline
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(',')
      )
      .join('\n');
  }

  /**
   * Format date as DD/MM/YYYY
   */
  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
