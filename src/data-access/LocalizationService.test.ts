import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { HebrewLocalizationService } from './LocalizationService';

describe('HebrewLocalizationService', () => {
  const service = new HebrewLocalizationService();

  describe('translate', () => {
    it('should translate salary component keys to Hebrew', () => {
      expect(service.translate('salary.base')).toBe('משכורת בסיס');
      expect(service.translate('salary.bonus')).toBe('בונוס');
      expect(service.translate('salary.stocks')).toBe('מניות/אופציות');
      expect(service.translate('salary.mealVouchers')).toBe('תלושי אוכל');
      expect(service.translate('salary.otherCompensation')).toBe('רכיבי שכר נוספים');
      expect(service.translate('salary.gross')).toBe('משכורת ברוטו');
      expect(service.translate('salary.net')).toBe('הכנסה נטו');
    });

    it('should translate tax and deduction keys to Hebrew', () => {
      expect(service.translate('tax.incomeTax')).toBe('מס הכנסה');
      expect(service.translate('tax.nationalInsurance')).toBe('ביטוח לאומי');
      expect(service.translate('tax.healthInsurance')).toBe('ביטוח בריאות');
      expect(service.translate('tax.pension')).toBe('קרן פנסיה');
      expect(service.translate('tax.studyFund')).toBe('קרן השתלמות');
    });

    it('should translate general term keys to Hebrew', () => {
      expect(service.translate('general.expenses')).toBe('הוצאות');
      expect(service.translate('general.savings')).toBe('חיסכון');
      expect(service.translate('general.category')).toBe('קטגוריה');
      expect(service.translate('general.description')).toBe('תיאור');
      expect(service.translate('general.date')).toBe('תאריך');
      expect(service.translate('general.amount')).toBe('סכום');
    });

    it('should return the key itself if translation not found', () => {
      expect(service.translate('unknown.key')).toBe('unknown.key');
    });
  });

  describe('getDirection', () => {
    it('should return rtl for Hebrew text direction', () => {
      expect(service.getDirection()).toBe('rtl');
    });
  });

  describe('formatCurrency', () => {
    it('should format amounts with ₪ symbol and 2 decimal places', () => {
      expect(service.formatCurrency(100)).toBe('₪100.00');
      expect(service.formatCurrency(1234.56)).toBe('₪1234.56');
      expect(service.formatCurrency(0.5)).toBe('₪0.50');
    });

    it('should handle zero amount', () => {
      expect(service.formatCurrency(0)).toBe('₪0.00');
    });

    it('should round to 2 decimal places', () => {
      expect(service.formatCurrency(10.999)).toBe('₪11.00');
      expect(service.formatCurrency(10.994)).toBe('₪10.99');
    });

    it('should handle large amounts', () => {
      expect(service.formatCurrency(1000000)).toBe('₪1000000.00');
    });
  });

  describe('formatDate', () => {
    it('should format dates in DD/MM/YYYY format', () => {
      const date = new Date(2026, 0, 15); // January 15, 2026
      expect(service.formatDate(date)).toBe('15/01/2026');
    });

    it('should pad single digit days and months with zero', () => {
      const date = new Date(2026, 2, 5); // March 5, 2026
      expect(service.formatDate(date)).toBe('05/03/2026');
    });

    it('should handle end of year dates', () => {
      const date = new Date(2026, 11, 31); // December 31, 2026
      expect(service.formatDate(date)).toBe('31/12/2026');
    });

    it('should handle beginning of year dates', () => {
      const date = new Date(2026, 0, 1); // January 1, 2026
      expect(service.formatDate(date)).toBe('01/01/2026');
    });
  });

  describe('getMonthName', () => {
    it('should return Hebrew month names for valid month numbers', () => {
      expect(service.getMonthName(1)).toBe('ינואר');
      expect(service.getMonthName(2)).toBe('פברואר');
      expect(service.getMonthName(3)).toBe('מרץ');
      expect(service.getMonthName(4)).toBe('אפריל');
      expect(service.getMonthName(5)).toBe('מאי');
      expect(service.getMonthName(6)).toBe('יוני');
      expect(service.getMonthName(7)).toBe('יולי');
      expect(service.getMonthName(8)).toBe('אוגוסט');
      expect(service.getMonthName(9)).toBe('ספטמבר');
      expect(service.getMonthName(10)).toBe('אוקטובר');
      expect(service.getMonthName(11)).toBe('נובמבר');
      expect(service.getMonthName(12)).toBe('דצמבר');
    });

    it('should throw error for invalid month numbers', () => {
      expect(() => service.getMonthName(0)).toThrow('Invalid month number: 0. Must be between 1 and 12.');
      expect(() => service.getMonthName(13)).toThrow('Invalid month number: 13. Must be between 1 and 12.');
      expect(() => service.getMonthName(-1)).toThrow('Invalid month number: -1. Must be between 1 and 12.');
    });
  });

  describe('Property-Based Tests', () => {
    describe('Property 27: Currency Symbol Display', () => {
      it('should include ₪ symbol for any monetary value', () => {
        /**
         * **Validates: Requirements 9.5**
         * 
         * Property: For any monetary value displayed to the user, 
         * the formatted string should include the Israeli Shekel currency symbol (₪)
         */
        fc.assert(
          fc.property(
            fc.double({ min: -1000000, max: 1000000, noNaN: true }),
            (amount: number) => {
              const formatted = service.formatCurrency(amount);
              expect(formatted).toContain('₪');
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    describe('Property 28: Hebrew UI Labels', () => {
      it('should display Hebrew text for any UI element', () => {
        /**
         * **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6**
         * 
         * Property: For any user interface element (label, button, error message, report header),
         * the displayed text should be in Hebrew (contain Hebrew characters)
         */
        
        // Define all UI element keys that should have Hebrew translations
        const uiElementKeys = [
          // Salary components (labels, form fields)
          'salary.base',
          'salary.bonus',
          'salary.stocks',
          'salary.mealVouchers',
          'salary.otherCompensation',
          'salary.gross',
          'salary.net',
          
          // Tax and deductions (report headers, labels)
          'tax.incomeTax',
          'tax.nationalInsurance',
          'tax.healthInsurance',
          'tax.pension',
          'tax.studyFund',
          
          // General terms (labels, buttons, column names)
          'general.expenses',
          'general.savings',
          'general.category',
          'general.description',
          'general.date',
          'general.amount',
        ];

        // Hebrew character range: \u0590-\u05FF (Hebrew Unicode block)
        const hebrewCharacterRegex = /[\u0590-\u05FF]/;

        fc.assert(
          fc.property(
            fc.constantFrom(...uiElementKeys),
            (key: string) => {
              const translated = service.translate(key);
              
              // Verify the translated text contains Hebrew characters
              expect(hebrewCharacterRegex.test(translated)).toBe(true);
              
              // Verify it's not just returning the key (actual translation occurred)
              expect(translated).not.toBe(key);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should display Hebrew month names for any valid month', () => {
        /**
         * **Validates: Requirements 10.1, 10.5, 10.6**
         * 
         * Property: Month names displayed in reports should be in Hebrew
         */
        
        const hebrewCharacterRegex = /[\u0590-\u05FF]/;

        fc.assert(
          fc.property(
            fc.integer({ min: 1, max: 12 }),
            (month: number) => {
              const monthName = service.getMonthName(month);
              
              // Verify the month name contains Hebrew characters
              expect(hebrewCharacterRegex.test(monthName)).toBe(true);
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    describe('Property 29: RTL Text Direction', () => {
      it('should always return rtl for Hebrew text direction', () => {
        /**
         * **Validates: Requirements 10.7**
         * 
         * Property: For any Hebrew text content displayed in the interface,
         * the text direction should be right-to-left (RTL)
         */
        
        fc.assert(
          fc.property(
            fc.anything(), // Generate any arbitrary value to test consistency
            () => {
              const direction = service.getDirection();
              
              // Verify the direction is always 'rtl' for Hebrew content
              expect(direction).toBe('rtl');
              
              // Verify it's not 'ltr'
              expect(direction).not.toBe('ltr');
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should return rtl consistently across multiple calls', () => {
        /**
         * **Validates: Requirements 10.7**
         * 
         * Property: The text direction should be consistently RTL regardless of context
         */
        
        fc.assert(
          fc.property(
            fc.integer({ min: 1, max: 1000 }), // Number of calls to test
            (numCalls: number) => {
              // Call getDirection multiple times and verify consistency
              const directions = Array.from({ length: numCalls }, () => service.getDirection());
              
              // All calls should return 'rtl'
              expect(directions.every(dir => dir === 'rtl')).toBe(true);
              
              // No call should return 'ltr'
              expect(directions.some(dir => dir === 'ltr')).toBe(false);
            }
          ),
          { numRuns: 100 }
        );
      });
    });
  });
});
