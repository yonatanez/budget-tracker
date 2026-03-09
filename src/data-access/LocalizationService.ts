/**
 * LocalizationService provides Hebrew translations and RTL support for the Israeli Budget Tracker.
 * Implements Requirements 10.1-10.9 and 9.5
 */

export interface LocalizationService {
  translate(key: string): string;
  getDirection(): 'rtl' | 'ltr';
  formatCurrency(amount: number): string;
  formatDate(date: Date): string;
  getMonthName(month: number): string;
}

/**
 * Hebrew translations for all UI elements
 */
const hebrewTranslations: Record<string, string> = {
  // Salary components
  'salary.base': 'משכורת בסיס',
  'salary.bonus': 'בונוס',
  'salary.stocks': 'מניות/אופציות',
  'salary.mealVouchers': 'תלושי אוכל',
  'salary.otherCompensation': 'רכיבי שכר נוספים',
  'salary.gross': 'משכורת ברוטו',
  'salary.net': 'הכנסה נטו',
  
  // Tax and deductions
  'tax.incomeTax': 'מס הכנסה',
  'tax.nationalInsurance': 'ביטוח לאומי',
  'tax.healthInsurance': 'ביטוח בריאות',
  'tax.pension': 'קרן פנסיה',
  'tax.studyFund': 'קרן השתלמות',
  
  // General terms
  'general.expenses': 'הוצאות',
  'general.savings': 'חיסכון',
  'general.category': 'קטגוריה',
  'general.description': 'תיאור',
  'general.date': 'תאריך',
  'general.amount': 'סכום',
  
  // Month names
  'month.1': 'ינואר',
  'month.2': 'פברואר',
  'month.3': 'מרץ',
  'month.4': 'אפריל',
  'month.5': 'מאי',
  'month.6': 'יוני',
  'month.7': 'יולי',
  'month.8': 'אוגוסט',
  'month.9': 'ספטמבר',
  'month.10': 'אוקטובר',
  'month.11': 'נובמבר',
  'month.12': 'דצמבר',
};

/**
 * Implementation of LocalizationService for Hebrew localization
 */
export class HebrewLocalizationService implements LocalizationService {
  /**
   * Translates a key to its Hebrew equivalent
   * @param key - Translation key (e.g., 'salary.base')
   * @returns Hebrew translation or the key itself if not found
   */
  translate(key: string): string {
    return hebrewTranslations[key] || key;
  }

  /**
   * Returns the text direction for Hebrew (RTL)
   * @returns 'rtl' for Hebrew text direction
   */
  getDirection(): 'rtl' | 'ltr' {
    return 'rtl';
  }

  /**
   * Formats a monetary amount with the Israeli Shekel symbol
   * @param amount - Numeric amount to format
   * @returns Formatted string with ₪ symbol and 2 decimal places
   */
  formatCurrency(amount: number): string {
    const formatted = amount.toFixed(2);
    return `₪${formatted}`;
  }

  /**
   * Formats a date in Hebrew format (DD/MM/YYYY)
   * @param date - Date object to format
   * @returns Formatted date string
   */
  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Returns the Hebrew name for a given month number
   * @param month - Month number (1-12)
   * @returns Hebrew month name
   */
  getMonthName(month: number): string {
    if (month < 1 || month > 12) {
      throw new Error(`Invalid month number: ${month}. Must be between 1 and 12.`);
    }
    return this.translate(`month.${month}`);
  }
}
