/**
 * Unit tests for StorageService
 * Tests Requirements 8.1, 8.2, 8.3, 8.4, 8.5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageService } from './StorageService';
import { SalaryRecord, Expense, SalaryComponents, TaxCalculationResult } from '../domain/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();

// Set up global localStorage mock
global.localStorage = localStorageMock as any;

describe('StorageService', () => {
  let storageService: LocalStorageService;

  beforeEach(() => {
    localStorageMock.clear();
    storageService = new LocalStorageService();
  });

  describe('saveSalary', () => {
    it('should save a salary record to localStorage', async () => {
      const salaryComponents: SalaryComponents = {
        baseSalary: 10000
      };

      const taxCalculation: TaxCalculationResult = {
        salaryComponents,
        grossSalary: 10000,
        incomeTax: 1400,
        nationalInsurance: 700,
        healthInsurance: 500,
        pensionEmployeeContribution: 600,
        pensionEmployerContribution: 650,
        studyFundEmployeeContribution: 250,
        studyFundEmployerContribution: 750,
        netIncome: 6750
      };

      const salary: SalaryRecord = {
        id: 'test-id-1',
        salaryComponents,
        month: new Date(2026, 0, 1),
        taxCalculation,
        createdAt: new Date()
      };

      await storageService.saveSalary(salary);

      const data = await storageService.loadAllData();
      expect(data.salaries).toHaveLength(1);
      expect(data.salaries[0].id).toBe('test-id-1');
      expect(data.salaries[0].salaryComponents.baseSalary).toBe(10000);
    });

    it('should update existing salary for the same month', async () => {
      const month = new Date(2026, 0, 1);
      
      const salary1: SalaryRecord = {
        id: 'test-id-1',
        salaryComponents: { baseSalary: 10000 },
        month,
        taxCalculation: {
          salaryComponents: { baseSalary: 10000 },
          grossSalary: 10000,
          incomeTax: 1400,
          nationalInsurance: 700,
          healthInsurance: 500,
          pensionEmployeeContribution: 600,
          pensionEmployerContribution: 650,
          studyFundEmployeeContribution: 250,
          studyFundEmployerContribution: 750,
          netIncome: 6750
        },
        createdAt: new Date()
      };

      const salary2: SalaryRecord = {
        id: 'test-id-2',
        salaryComponents: { baseSalary: 12000 },
        month,
        taxCalculation: {
          salaryComponents: { baseSalary: 12000 },
          grossSalary: 12000,
          incomeTax: 1680,
          nationalInsurance: 840,
          healthInsurance: 600,
          pensionEmployeeContribution: 720,
          pensionEmployerContribution: 780,
          studyFundEmployeeContribution: 300,
          studyFundEmployerContribution: 900,
          netIncome: 8100
        },
        createdAt: new Date()
      };

      await storageService.saveSalary(salary1);
      await storageService.saveSalary(salary2);

      const data = await storageService.loadAllData();
      expect(data.salaries).toHaveLength(1);
      expect(data.salaries[0].id).toBe('test-id-2');
      expect(data.salaries[0].salaryComponents.baseSalary).toBe(12000);
    });

    it('should sort salaries by month (newest first)', async () => {
      const salary1: SalaryRecord = {
        id: 'test-id-1',
        salaryComponents: { baseSalary: 10000 },
        month: new Date(2026, 0, 1),
        taxCalculation: {
          salaryComponents: { baseSalary: 10000 },
          grossSalary: 10000,
          incomeTax: 1400,
          nationalInsurance: 700,
          healthInsurance: 500,
          pensionEmployeeContribution: 600,
          pensionEmployerContribution: 650,
          studyFundEmployeeContribution: 250,
          studyFundEmployerContribution: 750,
          netIncome: 6750
        },
        createdAt: new Date()
      };

      const salary2: SalaryRecord = {
        id: 'test-id-2',
        salaryComponents: { baseSalary: 12000 },
        month: new Date(2026, 2, 1),
        taxCalculation: {
          salaryComponents: { baseSalary: 12000 },
          grossSalary: 12000,
          incomeTax: 1680,
          nationalInsurance: 840,
          healthInsurance: 600,
          pensionEmployeeContribution: 720,
          pensionEmployerContribution: 780,
          studyFundEmployeeContribution: 300,
          studyFundEmployerContribution: 900,
          netIncome: 8100
        },
        createdAt: new Date()
      };

      await storageService.saveSalary(salary1);
      await storageService.saveSalary(salary2);

      const data = await storageService.loadAllData();
      expect(data.salaries).toHaveLength(2);
      expect(data.salaries[0].month.getMonth()).toBe(2); // March (newer)
      expect(data.salaries[1].month.getMonth()).toBe(0); // January (older)
    });
  });

  describe('saveExpense', () => {
    it('should save an expense record to localStorage', async () => {
      const expense: Expense = {
        id: 'expense-1',
        amount: 150.50,
        date: new Date(2026, 0, 15),
        category: 'Groceries',
        description: 'Weekly shopping',
        createdAt: new Date()
      };

      await storageService.saveExpense(expense);

      const data = await storageService.loadAllData();
      expect(data.expenses).toHaveLength(1);
      expect(data.expenses[0].id).toBe('expense-1');
      expect(data.expenses[0].amount).toBe(150.50);
      expect(data.expenses[0].category).toBe('Groceries');
    });

    it('should append multiple expenses', async () => {
      const expense1: Expense = {
        id: 'expense-1',
        amount: 150.50,
        date: new Date(2026, 0, 15),
        category: 'Groceries',
        description: 'Weekly shopping',
        createdAt: new Date()
      };

      const expense2: Expense = {
        id: 'expense-2',
        amount: 45.00,
        date: new Date(2026, 0, 16),
        category: 'Transportation',
        description: 'Bus pass',
        createdAt: new Date()
      };

      await storageService.saveExpense(expense1);
      await storageService.saveExpense(expense2);

      const data = await storageService.loadAllData();
      expect(data.expenses).toHaveLength(2);
    });

    it('should sort expenses by date (newest first)', async () => {
      const expense1: Expense = {
        id: 'expense-1',
        amount: 150.50,
        date: new Date(2026, 0, 15),
        category: 'Groceries',
        description: 'Weekly shopping',
        createdAt: new Date()
      };

      const expense2: Expense = {
        id: 'expense-2',
        amount: 45.00,
        date: new Date(2026, 0, 20),
        category: 'Transportation',
        description: 'Bus pass',
        createdAt: new Date()
      };

      await storageService.saveExpense(expense1);
      await storageService.saveExpense(expense2);

      const data = await storageService.loadAllData();
      expect(data.expenses[0].date.getDate()).toBe(20); // Newer
      expect(data.expenses[1].date.getDate()).toBe(15); // Older
    });
  });

  describe('loadAllData', () => {
    it('should return empty data when localStorage is empty', async () => {
      const data = await storageService.loadAllData();
      
      expect(data.salaries).toEqual([]);
      expect(data.expenses).toEqual([]);
    });

    it('should deserialize dates correctly', async () => {
      const salary: SalaryRecord = {
        id: 'test-id-1',
        salaryComponents: { baseSalary: 10000 },
        month: new Date(2026, 0, 1),
        taxCalculation: {
          salaryComponents: { baseSalary: 10000 },
          grossSalary: 10000,
          incomeTax: 1400,
          nationalInsurance: 700,
          healthInsurance: 500,
          pensionEmployeeContribution: 600,
          pensionEmployerContribution: 650,
          studyFundEmployeeContribution: 250,
          studyFundEmployerContribution: 750,
          netIncome: 6750
        },
        createdAt: new Date()
      };

      const expense: Expense = {
        id: 'expense-1',
        amount: 150.50,
        date: new Date(2026, 0, 15),
        category: 'Groceries',
        description: 'Weekly shopping',
        createdAt: new Date()
      };

      await storageService.saveSalary(salary);
      await storageService.saveExpense(expense);

      const data = await storageService.loadAllData();
      
      expect(data.salaries[0].month).toBeInstanceOf(Date);
      expect(data.salaries[0].createdAt).toBeInstanceOf(Date);
      expect(data.expenses[0].date).toBeInstanceOf(Date);
      expect(data.expenses[0].createdAt).toBeInstanceOf(Date);
    });

    it('should throw error with Hebrew message for corrupted data', async () => {
      // Manually set corrupted data
      localStorage.setItem('israeli-budget-tracker:salaries', 'invalid json{');

      await expect(storageService.loadAllData()).rejects.toThrow(
        'קובץ הנתונים פגום. אנא שחזר מגיבוי.'
      );
    });
  });

  describe('updateSalary', () => {
    it('should update a salary record and verify stored data matches', async () => {
      // _Requirements: 7.1_
      const originalSalary: SalaryRecord = {
        id: 'salary-update-test-1',
        salaryComponents: { baseSalary: 15000 },
        month: new Date(2026, 3, 1),
        taxCalculation: {
          salaryComponents: { baseSalary: 15000 },
          grossSalary: 15000,
          incomeTax: 2100,
          nationalInsurance: 1050,
          healthInsurance: 750,
          pensionEmployeeContribution: 900,
          pensionEmployerContribution: 975,
          studyFundEmployeeContribution: 375,
          studyFundEmployerContribution: 1125,
          netIncome: 10125
        },
        createdAt: new Date(2026, 3, 1, 10, 0, 0)
      };

      await storageService.saveSalary(originalSalary);

      // Update with new values
      const updatedSalary: SalaryRecord = {
        id: 'different-id', // Should be overwritten with original id
        salaryComponents: { baseSalary: 20000 },
        month: new Date(2026, 5, 1), // Different month
        taxCalculation: {
          salaryComponents: { baseSalary: 20000 },
          grossSalary: 20000,
          incomeTax: 2800,
          nationalInsurance: 1400,
          healthInsurance: 1000,
          pensionEmployeeContribution: 1200,
          pensionEmployerContribution: 1300,
          studyFundEmployeeContribution: 500,
          studyFundEmployerContribution: 1500,
          netIncome: 13500
        },
        createdAt: new Date(2020, 0, 1) // Should be overwritten with original createdAt
      };

      await storageService.updateSalary('salary-update-test-1', updatedSalary);

      const data = await storageService.loadAllData();
      expect(data.salaries).toHaveLength(1);

      const found = data.salaries[0];
      // Verify updated values
      expect(found.salaryComponents.baseSalary).toBe(20000);
      expect(found.month.getMonth()).toBe(5); // June
      expect(found.taxCalculation.grossSalary).toBe(20000);
      expect(found.taxCalculation.netIncome).toBe(13500);
      // Verify preserved values
      expect(found.id).toBe('salary-update-test-1');
      expect(found.createdAt.getTime()).toBe(originalSalary.createdAt.getTime());
    });

    it('should throw Hebrew error for non-existent salary ID', async () => {
      // _Requirements: 7.5_
      const dummySalary: SalaryRecord = {
        id: 'dummy',
        salaryComponents: { baseSalary: 10000 },
        month: new Date(2026, 0, 1),
        taxCalculation: {
          salaryComponents: { baseSalary: 10000 },
          grossSalary: 10000,
          incomeTax: 1400,
          nationalInsurance: 700,
          healthInsurance: 500,
          pensionEmployeeContribution: 600,
          pensionEmployerContribution: 650,
          studyFundEmployeeContribution: 250,
          studyFundEmployerContribution: 750,
          netIncome: 6750
        },
        createdAt: new Date()
      };

      await expect(storageService.updateSalary('non-existent-id', dummySalary)).rejects.toThrow(
        'הרשומה לא נמצאה'
      );
    });
  });

  describe('deleteSalary', () => {
    it('should delete a salary record and verify it is removed', async () => {
      // _Requirements: 7.3_
      const salary1: SalaryRecord = {
        id: 'salary-delete-1',
        salaryComponents: { baseSalary: 10000 },
        month: new Date(2026, 0, 1),
        taxCalculation: {
          salaryComponents: { baseSalary: 10000 },
          grossSalary: 10000,
          incomeTax: 1400,
          nationalInsurance: 700,
          healthInsurance: 500,
          pensionEmployeeContribution: 600,
          pensionEmployerContribution: 650,
          studyFundEmployeeContribution: 250,
          studyFundEmployerContribution: 750,
          netIncome: 6750
        },
        createdAt: new Date()
      };

      const salary2: SalaryRecord = {
        id: 'salary-delete-2',
        salaryComponents: { baseSalary: 15000 },
        month: new Date(2026, 1, 1),
        taxCalculation: {
          salaryComponents: { baseSalary: 15000 },
          grossSalary: 15000,
          incomeTax: 2100,
          nationalInsurance: 1050,
          healthInsurance: 750,
          pensionEmployeeContribution: 900,
          pensionEmployerContribution: 975,
          studyFundEmployeeContribution: 375,
          studyFundEmployerContribution: 1125,
          netIncome: 10125
        },
        createdAt: new Date()
      };

      await storageService.saveSalary(salary1);
      await storageService.saveSalary(salary2);

      let data = await storageService.loadAllData();
      expect(data.salaries).toHaveLength(2);

      // Delete the first salary
      await storageService.deleteSalary('salary-delete-1');

      data = await storageService.loadAllData();
      expect(data.salaries).toHaveLength(1);
      expect(data.salaries[0].id).toBe('salary-delete-2');
      expect(data.salaries.find(s => s.id === 'salary-delete-1')).toBeUndefined();
    });

    it('should throw Hebrew error for non-existent salary ID', async () => {
      // _Requirements: 7.5_
      await expect(storageService.deleteSalary('non-existent-id')).rejects.toThrow(
        'הרשומה לא נמצאה'
      );
    });
  });

  describe('updateExpense', () => {
    it('should update an expense record and verify stored data matches', async () => {
      // _Requirements: 7.2_
      const originalExpense: Expense = {
        id: 'expense-update-test-1',
        amount: 250.50,
        date: new Date(2026, 2, 15),
        category: 'Groceries',
        description: 'Weekly shopping',
        createdAt: new Date(2026, 2, 15, 14, 30, 0)
      };

      await storageService.saveExpense(originalExpense);

      // Update with new values
      const updatedExpense: Expense = {
        id: 'different-id', // Should be overwritten with original id
        amount: 350.75,
        date: new Date(2026, 4, 20),
        category: 'Transportation',
        description: 'Monthly bus pass',
        createdAt: new Date(2020, 0, 1) // Should be overwritten with original createdAt
      };

      await storageService.updateExpense('expense-update-test-1', updatedExpense);

      const data = await storageService.loadAllData();
      expect(data.expenses).toHaveLength(1);

      const found = data.expenses[0];
      // Verify updated values
      expect(found.amount).toBe(350.75);
      expect(found.date.getMonth()).toBe(4); // May
      expect(found.category).toBe('Transportation');
      expect(found.description).toBe('Monthly bus pass');
      // Verify preserved values
      expect(found.id).toBe('expense-update-test-1');
      expect(found.createdAt.getTime()).toBe(originalExpense.createdAt.getTime());
    });

    it('should throw Hebrew error for non-existent expense ID', async () => {
      // _Requirements: 7.5_
      const dummyExpense: Expense = {
        id: 'dummy',
        amount: 100,
        date: new Date(2026, 0, 1),
        category: 'Groceries',
        description: 'Test',
        createdAt: new Date()
      };

      await expect(storageService.updateExpense('non-existent-id', dummyExpense)).rejects.toThrow(
        'הרשומה לא נמצאה'
      );
    });
  });

  describe('deleteExpense', () => {
    it('should delete an expense record and verify it is removed', async () => {
      // _Requirements: 7.4_
      const expense1: Expense = {
        id: 'expense-delete-1',
        amount: 150.50,
        date: new Date(2026, 0, 15),
        category: 'Groceries',
        description: 'Weekly shopping',
        createdAt: new Date()
      };

      const expense2: Expense = {
        id: 'expense-delete-2',
        amount: 45.00,
        date: new Date(2026, 0, 20),
        category: 'Transportation',
        description: 'Bus pass',
        createdAt: new Date()
      };

      await storageService.saveExpense(expense1);
      await storageService.saveExpense(expense2);

      let data = await storageService.loadAllData();
      expect(data.expenses).toHaveLength(2);

      // Delete the first expense
      await storageService.deleteExpense('expense-delete-1');

      data = await storageService.loadAllData();
      expect(data.expenses).toHaveLength(1);
      expect(data.expenses[0].id).toBe('expense-delete-2');
      expect(data.expenses.find(e => e.id === 'expense-delete-1')).toBeUndefined();
    });

    it('should throw Hebrew error for non-existent expense ID', async () => {
      // _Requirements: 7.5_
      await expect(storageService.deleteExpense('non-existent-id')).rejects.toThrow(
        'הרשומה לא נמצאה'
      );
    });
  });

  describe('error handling', () => {
    it('should throw Hebrew error message when save fails', async () => {
      // Mock localStorage.setItem to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      const salary: SalaryRecord = {
        id: 'test-id-1',
        salaryComponents: { baseSalary: 10000 },
        month: new Date(2026, 0, 1),
        taxCalculation: {
          salaryComponents: { baseSalary: 10000 },
          grossSalary: 10000,
          incomeTax: 1400,
          nationalInsurance: 700,
          healthInsurance: 500,
          pensionEmployeeContribution: 600,
          pensionEmployerContribution: 650,
          studyFundEmployeeContribution: 250,
          studyFundEmployerContribution: 750,
          netIncome: 6750
        },
        createdAt: new Date()
      };

      await expect(storageService.saveSalary(salary)).rejects.toThrow(
        'שמירת הנתונים נכשלה. אנא נסה שוב.'
      );

      // Restore original
      localStorage.setItem = originalSetItem;
    });

    it('should return empty data when load fails with non-corrupted error', async () => {
      // Mock localStorage.getItem to throw a non-SyntaxError
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn(() => {
        throw new Error('Storage access denied');
      });

      // Should not throw, but return empty data
      const data = await storageService.loadAllData();
      
      expect(data.salaries).toEqual([]);
      expect(data.expenses).toEqual([]);

      // Restore original
      localStorage.getItem = originalGetItem;
    });
  });
});

/**
 * Property-Based Tests for StorageService
 */

import fc from 'fast-check';

describe('StorageService - Property-Based Tests', () => {
  let storageService: LocalStorageService;

  beforeEach(() => {
    localStorageMock.clear();
    storageService = new LocalStorageService();
  });

  // Feature: edit-previous-entries, Property 9: Update preserves id and createdAt
  /**
   * **Validates: Requirements 4.2**
   * Property 9: Update preserves id and createdAt
   *
   * For any record (salary or expense), after a successful update via StorageService,
   * the returned record SHALL have the same id and createdAt values as the original record.
   */
  it('Property 9: Update preserves id and createdAt for salary records', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate a salary record to save initially
        fc.record({
          id: fc.uuid(),
          salaryComponents: fc.record({
            baseSalary: fc.float({ min: Math.fround(1000), max: Math.fround(100000), noNaN: true })
          }),
          month: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) }).map(d => new Date(d.getFullYear(), d.getMonth(), 1)),
          taxCalculation: fc.record({
            salaryComponents: fc.record({
              baseSalary: fc.float({ min: Math.fround(1000), max: Math.fround(100000), noNaN: true })
            }),
            grossSalary: fc.float({ min: Math.fround(1000), max: Math.fround(200000), noNaN: true }),
            incomeTax: fc.float({ min: Math.fround(0), max: Math.fround(50000), noNaN: true }),
            nationalInsurance: fc.float({ min: Math.fround(0), max: Math.fround(20000), noNaN: true }),
            healthInsurance: fc.float({ min: Math.fround(0), max: Math.fround(10000), noNaN: true }),
            pensionEmployeeContribution: fc.float({ min: Math.fround(0), max: Math.fround(12000), noNaN: true }),
            pensionEmployerContribution: fc.float({ min: Math.fround(0), max: Math.fround(13000), noNaN: true }),
            studyFundEmployeeContribution: fc.float({ min: Math.fround(0), max: Math.fround(5000), noNaN: true }),
            studyFundEmployerContribution: fc.float({ min: Math.fround(0), max: Math.fround(15000), noNaN: true }),
            netIncome: fc.float({ min: Math.fround(0), max: Math.fround(150000), noNaN: true })
          }),
          createdAt: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) })
        }),
        // Generate updated salary values (different from original)
        fc.record({
          salaryComponents: fc.record({
            baseSalary: fc.float({ min: Math.fround(1000), max: Math.fround(100000), noNaN: true })
          }),
          month: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) }).map(d => new Date(d.getFullYear(), d.getMonth(), 1)),
          taxCalculation: fc.record({
            salaryComponents: fc.record({
              baseSalary: fc.float({ min: Math.fround(1000), max: Math.fround(100000), noNaN: true })
            }),
            grossSalary: fc.float({ min: Math.fround(1000), max: Math.fround(200000), noNaN: true }),
            incomeTax: fc.float({ min: Math.fround(0), max: Math.fround(50000), noNaN: true }),
            nationalInsurance: fc.float({ min: Math.fround(0), max: Math.fround(20000), noNaN: true }),
            healthInsurance: fc.float({ min: Math.fround(0), max: Math.fround(10000), noNaN: true }),
            pensionEmployeeContribution: fc.float({ min: Math.fround(0), max: Math.fround(12000), noNaN: true }),
            pensionEmployerContribution: fc.float({ min: Math.fround(0), max: Math.fround(13000), noNaN: true }),
            studyFundEmployeeContribution: fc.float({ min: Math.fround(0), max: Math.fround(5000), noNaN: true }),
            studyFundEmployerContribution: fc.float({ min: Math.fround(0), max: Math.fround(15000), noNaN: true }),
            netIncome: fc.float({ min: Math.fround(0), max: Math.fround(150000), noNaN: true })
          })
        }),
        async (original, updatedValues) => {
          localStorageMock.clear();
          storageService = new LocalStorageService();

          // Save the original salary record
          await storageService.saveSalary(original as SalaryRecord);

          // Build an updated record with different id and createdAt to prove they get preserved
          const updatedRecord: SalaryRecord = {
            id: 'should-be-overwritten',
            salaryComponents: updatedValues.salaryComponents,
            month: updatedValues.month,
            taxCalculation: updatedValues.taxCalculation as any,
            createdAt: new Date(1999, 0, 1) // deliberately different
          };

          await storageService.updateSalary(original.id, updatedRecord);

          const data = await storageService.loadAllData();
          const found = data.salaries.find(s => s.id === original.id);

          expect(found).toBeDefined();
          expect(found!.id).toBe(original.id);
          expect(found!.createdAt.getTime()).toBe(original.createdAt.getTime());
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: edit-previous-entries, Property 9: Update preserves id and createdAt
  /**
   * **Validates: Requirements 4.2**
   * Property 9: Update preserves id and createdAt (expenses)
   */
  it('Property 9: Update preserves id and createdAt for expense records', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate an expense record to save initially
        fc.record({
          id: fc.uuid(),
          amount: fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }),
          date: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) }),
          category: fc.option(fc.constantFrom('Groceries', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare')),
          description: fc.option(fc.string({ minLength: 0, maxLength: 100 })),
          createdAt: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) })
        }),
        // Generate updated expense values
        fc.record({
          amount: fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }),
          date: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) }),
          category: fc.option(fc.constantFrom('Groceries', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare')),
          description: fc.option(fc.string({ minLength: 0, maxLength: 100 }))
        }),
        async (original, updatedValues) => {
          localStorageMock.clear();
          storageService = new LocalStorageService();

          // Save the original expense record
          await storageService.saveExpense(original as Expense);

          // Build an updated record with different id and createdAt to prove they get preserved
          const updatedRecord: Expense = {
            id: 'should-be-overwritten',
            amount: updatedValues.amount,
            date: updatedValues.date,
            category: updatedValues.category ?? null,
            description: updatedValues.description ?? null,
            createdAt: new Date(1999, 0, 1) // deliberately different
          };

          await storageService.updateExpense(original.id, updatedRecord);

          const data = await storageService.loadAllData();
          const found = data.expenses.find(e => e.id === original.id);

          expect(found).toBeDefined();
          expect(found!.id).toBe(original.id);
          expect(found!.createdAt.getTime()).toBe(original.createdAt.getTime());
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: edit-previous-entries, Property 10: Sort order preserved after update
  /**
   * **Validates: Requirements 7.1, 7.2**
   * Property 10: Sort order preserved after update
   *
   * For any list of salary records and any valid update to one record,
   * the stored list SHALL remain sorted by month descending after the update.
   * For any list of expense records and any valid update, the stored list
   * SHALL remain sorted by date descending.
   */
  it('Property 10: Sort order preserved after update for salary records', async () => {
    // Generator for a salary record with a specific month
    const salaryRecordArb = (month: Date) =>
      fc.record({
        id: fc.uuid(),
        salaryComponents: fc.record({
          baseSalary: fc.float({ min: Math.fround(1000), max: Math.fround(100000), noNaN: true })
        }),
        taxCalculation: fc.record({
          salaryComponents: fc.record({
            baseSalary: fc.float({ min: Math.fround(1000), max: Math.fround(100000), noNaN: true })
          }),
          grossSalary: fc.float({ min: Math.fround(1000), max: Math.fround(200000), noNaN: true }),
          taxableIncome: fc.float({ min: Math.fround(1000), max: Math.fround(200000), noNaN: true }),
          cashIncome: fc.float({ min: Math.fround(1000), max: Math.fround(200000), noNaN: true }),
          incomeTax: fc.float({ min: Math.fround(0), max: Math.fround(50000), noNaN: true }),
          nationalInsurance: fc.float({ min: Math.fround(0), max: Math.fround(20000), noNaN: true }),
          healthInsurance: fc.float({ min: Math.fround(0), max: Math.fround(10000), noNaN: true }),
          pensionEmployeeContribution: fc.float({ min: Math.fround(0), max: Math.fround(12000), noNaN: true }),
          pensionEmployerContribution: fc.float({ min: Math.fround(0), max: Math.fround(13000), noNaN: true }),
          studyFundEmployeeContribution: fc.float({ min: Math.fround(0), max: Math.fround(5000), noNaN: true }),
          studyFundEmployerContribution: fc.float({ min: Math.fround(0), max: Math.fround(15000), noNaN: true }),
          netIncome: fc.float({ min: Math.fround(0), max: Math.fround(150000), noNaN: true })
        }),
        createdAt: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) })
      }).map(rec => ({
        ...rec,
        month,
        taxCalculation: rec.taxCalculation as any
      }));

    await fc.assert(
      fc.asyncProperty(
        // Generate 2-5 unique months, then build salary records for each
        fc.array(
          fc.integer({ min: 0, max: 119 }), // 0..119 maps to 10 years * 12 months
          { minLength: 2, maxLength: 5 }
        ).chain(monthIndices => {
          const uniqueIndices = [...new Set(monthIndices)];
          // Ensure at least 2 unique months
          const indices = uniqueIndices.length >= 2 ? uniqueIndices : [0, 1];
          const months = indices.map(i => new Date(2020 + Math.floor(i / 12), i % 12, 1));
          return fc.tuple(
            fc.tuple(...months.map(m => salaryRecordArb(m))),
            // Pick an index to update
            fc.integer({ min: 0, max: months.length - 1 }),
            // Generate a new month for the updated record
            fc.integer({ min: 0, max: 119 }).map(i => new Date(2020 + Math.floor(i / 12), i % 12, 1)),
            fc.float({ min: Math.fround(1000), max: Math.fround(100000), noNaN: true })
          );
        }),
        async ([records, updateIndex, newMonth, newBaseSalary]) => {
          localStorageMock.clear();
          storageService = new LocalStorageService();

          // Save all salary records (saveSalary replaces same-month records)
          for (const record of records) {
            await storageService.saveSalary(record as SalaryRecord);
          }

          // Load to get the actual stored records
          let data = await storageService.loadAllData();
          if (data.salaries.length === 0) return; // skip if nothing stored

          const targetIndex = updateIndex % data.salaries.length;
          const target = data.salaries[targetIndex];

          // Build updated record with a potentially different month
          const updatedRecord: SalaryRecord = {
            ...target,
            salaryComponents: { baseSalary: newBaseSalary },
            month: newMonth
          };

          await storageService.updateSalary(target.id, updatedRecord);

          // Verify sort order: month descending
          data = await storageService.loadAllData();
          for (let i = 1; i < data.salaries.length; i++) {
            expect(data.salaries[i - 1].month.getTime()).toBeGreaterThanOrEqual(
              data.salaries[i].month.getTime()
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: edit-previous-entries, Property 10: Sort order preserved after update
  /**
   * **Validates: Requirements 7.1, 7.2**
   * Property 10: Sort order preserved after update (expenses)
   */
  it('Property 10: Sort order preserved after update for expense records', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate 2-5 expense records with unique IDs
        fc.array(
          fc.record({
            id: fc.uuid(),
            amount: fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }),
            date: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) }),
            category: fc.constantFrom('Groceries', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare'),
            description: fc.string({ minLength: 1, maxLength: 50 }),
            createdAt: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) })
          }),
          { minLength: 2, maxLength: 5 }
        ),
        // Index of record to update
        fc.nat(),
        // New date for the updated record
        fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) }),
        // New amount for the updated record
        fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }),
        async (records, updateIndexRaw, newDate, newAmount) => {
          localStorageMock.clear();
          storageService = new LocalStorageService();

          // Save all expense records
          for (const record of records) {
            await storageService.saveExpense(record as Expense);
          }

          // Load to get the actual stored records
          let data = await storageService.loadAllData();
          if (data.expenses.length === 0) return;

          const targetIndex = updateIndexRaw % data.expenses.length;
          const target = data.expenses[targetIndex];

          // Build updated record with a potentially different date
          const updatedRecord: Expense = {
            ...target,
            amount: newAmount,
            date: newDate
          };

          await storageService.updateExpense(target.id, updatedRecord);

          // Verify sort order: date descending
          data = await storageService.loadAllData();
          for (let i = 1; i < data.expenses.length; i++) {
            expect(data.expenses[i - 1].date.getTime()).toBeGreaterThanOrEqual(
              data.expenses[i].date.getTime()
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: edit-previous-entries, Property 11: Delete removes exactly one record
  /**
   * **Validates: Requirements 7.3, 7.4**
   * Property 11: Delete removes exactly one record
   *
   * For any list of records and any valid ID present in that list,
   * calling delete SHALL reduce the record count by exactly 1,
   * and the deleted ID SHALL not appear in the resulting list.
   */
  it('Property 11: Delete removes exactly one record for salary records', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate 1-5 salary records with unique IDs and unique months
        fc.array(
          fc.record({
            id: fc.uuid(),
            salaryComponents: fc.record({
              baseSalary: fc.float({ min: Math.fround(1000), max: Math.fround(100000), noNaN: true })
            }),
            month: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) }).map(d => new Date(d.getFullYear(), d.getMonth(), 1)),
            taxCalculation: fc.record({
              salaryComponents: fc.record({
                baseSalary: fc.float({ min: Math.fround(1000), max: Math.fround(100000), noNaN: true })
              }),
              grossSalary: fc.float({ min: Math.fround(1000), max: Math.fround(200000), noNaN: true }),
              incomeTax: fc.float({ min: Math.fround(0), max: Math.fround(50000), noNaN: true }),
              nationalInsurance: fc.float({ min: Math.fround(0), max: Math.fround(20000), noNaN: true }),
              healthInsurance: fc.float({ min: Math.fround(0), max: Math.fround(10000), noNaN: true }),
              pensionEmployeeContribution: fc.float({ min: Math.fround(0), max: Math.fround(12000), noNaN: true }),
              pensionEmployerContribution: fc.float({ min: Math.fround(0), max: Math.fround(13000), noNaN: true }),
              studyFundEmployeeContribution: fc.float({ min: Math.fround(0), max: Math.fround(5000), noNaN: true }),
              studyFundEmployerContribution: fc.float({ min: Math.fround(0), max: Math.fround(15000), noNaN: true }),
              netIncome: fc.float({ min: Math.fround(0), max: Math.fround(150000), noNaN: true })
            }),
            createdAt: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) })
          }),
          { minLength: 1, maxLength: 5 }
        ),
        // Index of record to delete
        fc.nat(),
        async (records, deleteIndexRaw) => {
          localStorageMock.clear();
          storageService = new LocalStorageService();

          // Save all salary records
          for (const record of records) {
            await storageService.saveSalary(record as SalaryRecord);
          }

          // Load to get the actual stored records (saveSalary may merge same-month records)
          let data = await storageService.loadAllData();
          if (data.salaries.length === 0) return; // skip if nothing stored

          const countBefore = data.salaries.length;
          const targetIndex = deleteIndexRaw % data.salaries.length;
          const targetId = data.salaries[targetIndex].id;

          // Delete the target record
          await storageService.deleteSalary(targetId);

          // Load data after deletion
          data = await storageService.loadAllData();

          // Verify count decreased by exactly 1
          expect(data.salaries.length).toBe(countBefore - 1);

          // Verify deleted ID is absent
          const foundDeletedId = data.salaries.find(s => s.id === targetId);
          expect(foundDeletedId).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: edit-previous-entries, Property 11: Delete removes exactly one record
  /**
   * **Validates: Requirements 7.3, 7.4**
   * Property 11: Delete removes exactly one record (expenses)
   */
  it('Property 11: Delete removes exactly one record for expense records', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate 1-5 expense records with unique IDs
        fc.array(
          fc.record({
            id: fc.uuid(),
            amount: fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }),
            date: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) }),
            category: fc.constantFrom('Groceries', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare'),
            description: fc.string({ minLength: 1, maxLength: 50 }),
            createdAt: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) })
          }),
          { minLength: 1, maxLength: 5 }
        ),
        // Index of record to delete
        fc.nat(),
        async (records, deleteIndexRaw) => {
          localStorageMock.clear();
          storageService = new LocalStorageService();

          // Save all expense records
          for (const record of records) {
            await storageService.saveExpense(record as Expense);
          }

          // Load to get the actual stored records
          let data = await storageService.loadAllData();
          if (data.expenses.length === 0) return; // skip if nothing stored

          const countBefore = data.expenses.length;
          const targetIndex = deleteIndexRaw % data.expenses.length;
          const targetId = data.expenses[targetIndex].id;

          // Delete the target record
          await storageService.deleteExpense(targetId);

          // Load data after deletion
          data = await storageService.loadAllData();

          // Verify count decreased by exactly 1
          expect(data.expenses.length).toBe(countBefore - 1);

          // Verify deleted ID is absent
          const foundDeletedId = data.expenses.find(e => e.id === targetId);
          expect(foundDeletedId).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: edit-previous-entries, Property 12: Non-existent ID throws Hebrew error
  /**
   * **Validates: Requirements 7.5**
   * Property 12: Non-existent ID throws Hebrew error
   *
   * For any ID that does not match any stored record, calling update or delete
   * on the StorageService SHALL throw an error whose message is a non-empty Hebrew string.
   */
  it('Property 12: Non-existent ID throws Hebrew error for salary operations', async () => {
    // Hebrew character range check: Hebrew letters are in Unicode range U+0590 to U+05FF
    const containsHebrew = (str: string): boolean => /[\u0590-\u05FF]/.test(str);

    await fc.assert(
      fc.asyncProperty(
        // Generate 0-3 salary records to store (can be empty)
        fc.array(
          fc.record({
            id: fc.uuid(),
            salaryComponents: fc.record({
              baseSalary: fc.float({ min: Math.fround(1000), max: Math.fround(100000), noNaN: true })
            }),
            month: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) }).map(d => new Date(d.getFullYear(), d.getMonth(), 1)),
            taxCalculation: fc.record({
              salaryComponents: fc.record({
                baseSalary: fc.float({ min: Math.fround(1000), max: Math.fround(100000), noNaN: true })
              }),
              grossSalary: fc.float({ min: Math.fround(1000), max: Math.fround(200000), noNaN: true }),
              incomeTax: fc.float({ min: Math.fround(0), max: Math.fround(50000), noNaN: true }),
              nationalInsurance: fc.float({ min: Math.fround(0), max: Math.fround(20000), noNaN: true }),
              healthInsurance: fc.float({ min: Math.fround(0), max: Math.fround(10000), noNaN: true }),
              pensionEmployeeContribution: fc.float({ min: Math.fround(0), max: Math.fround(12000), noNaN: true }),
              pensionEmployerContribution: fc.float({ min: Math.fround(0), max: Math.fround(13000), noNaN: true }),
              studyFundEmployeeContribution: fc.float({ min: Math.fround(0), max: Math.fround(5000), noNaN: true }),
              studyFundEmployerContribution: fc.float({ min: Math.fround(0), max: Math.fround(15000), noNaN: true }),
              netIncome: fc.float({ min: Math.fround(0), max: Math.fround(150000), noNaN: true })
            }),
            createdAt: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) })
          }),
          { minLength: 0, maxLength: 3 }
        ),
        // Generate a non-existent ID (UUID that won't match any stored record)
        fc.uuid(),
        // Generate a dummy salary record for update attempts
        fc.record({
          id: fc.uuid(),
          salaryComponents: fc.record({
            baseSalary: fc.float({ min: Math.fround(1000), max: Math.fround(100000), noNaN: true })
          }),
          month: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) }).map(d => new Date(d.getFullYear(), d.getMonth(), 1)),
          taxCalculation: fc.record({
            salaryComponents: fc.record({
              baseSalary: fc.float({ min: Math.fround(1000), max: Math.fround(100000), noNaN: true })
            }),
            grossSalary: fc.float({ min: Math.fround(1000), max: Math.fround(200000), noNaN: true }),
            incomeTax: fc.float({ min: Math.fround(0), max: Math.fround(50000), noNaN: true }),
            nationalInsurance: fc.float({ min: Math.fround(0), max: Math.fround(20000), noNaN: true }),
            healthInsurance: fc.float({ min: Math.fround(0), max: Math.fround(10000), noNaN: true }),
            pensionEmployeeContribution: fc.float({ min: Math.fround(0), max: Math.fround(12000), noNaN: true }),
            pensionEmployerContribution: fc.float({ min: Math.fround(0), max: Math.fround(13000), noNaN: true }),
            studyFundEmployeeContribution: fc.float({ min: Math.fround(0), max: Math.fround(5000), noNaN: true }),
            studyFundEmployerContribution: fc.float({ min: Math.fround(0), max: Math.fround(15000), noNaN: true }),
            netIncome: fc.float({ min: Math.fround(0), max: Math.fround(150000), noNaN: true })
          }),
          createdAt: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) })
        }),
        async (records, nonExistentId, dummySalary) => {
          localStorageMock.clear();
          storageService = new LocalStorageService();

          // Save all salary records
          for (const record of records) {
            await storageService.saveSalary(record as SalaryRecord);
          }

          // Load to get actual stored IDs
          const data = await storageService.loadAllData();
          const storedIds = new Set(data.salaries.map(s => s.id));

          // Skip if the generated ID happens to match a stored ID (very unlikely with UUIDs)
          if (storedIds.has(nonExistentId)) return;

          // Test updateSalary with non-existent ID
          let updateError: Error | null = null;
          try {
            await storageService.updateSalary(nonExistentId, dummySalary as SalaryRecord);
          } catch (e) {
            updateError = e as Error;
          }

          expect(updateError).not.toBeNull();
          expect(updateError!.message).toBeTruthy();
          expect(updateError!.message.length).toBeGreaterThan(0);
          expect(containsHebrew(updateError!.message)).toBe(true);

          // Test deleteSalary with non-existent ID
          let deleteError: Error | null = null;
          try {
            await storageService.deleteSalary(nonExistentId);
          } catch (e) {
            deleteError = e as Error;
          }

          expect(deleteError).not.toBeNull();
          expect(deleteError!.message).toBeTruthy();
          expect(deleteError!.message.length).toBeGreaterThan(0);
          expect(containsHebrew(deleteError!.message)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: edit-previous-entries, Property 12: Non-existent ID throws Hebrew error
  /**
   * **Validates: Requirements 7.5**
   * Property 12: Non-existent ID throws Hebrew error (expenses)
   */
  it('Property 12: Non-existent ID throws Hebrew error for expense operations', async () => {
    // Hebrew character range check: Hebrew letters are in Unicode range U+0590 to U+05FF
    const containsHebrew = (str: string): boolean => /[\u0590-\u05FF]/.test(str);

    await fc.assert(
      fc.asyncProperty(
        // Generate 0-3 expense records to store (can be empty)
        fc.array(
          fc.record({
            id: fc.uuid(),
            amount: fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }),
            date: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) }),
            category: fc.constantFrom('Groceries', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare'),
            description: fc.string({ minLength: 1, maxLength: 50 }),
            createdAt: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) })
          }),
          { minLength: 0, maxLength: 3 }
        ),
        // Generate a non-existent ID (UUID that won't match any stored record)
        fc.uuid(),
        // Generate a dummy expense record for update attempts
        fc.record({
          id: fc.uuid(),
          amount: fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }),
          date: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) }),
          category: fc.constantFrom('Groceries', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare'),
          description: fc.string({ minLength: 1, maxLength: 50 }),
          createdAt: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) })
        }),
        async (records, nonExistentId, dummyExpense) => {
          localStorageMock.clear();
          storageService = new LocalStorageService();

          // Save all expense records
          for (const record of records) {
            await storageService.saveExpense(record as Expense);
          }

          // Load to get actual stored IDs
          const data = await storageService.loadAllData();
          const storedIds = new Set(data.expenses.map(e => e.id));

          // Skip if the generated ID happens to match a stored ID (very unlikely with UUIDs)
          if (storedIds.has(nonExistentId)) return;

          // Test updateExpense with non-existent ID
          let updateError: Error | null = null;
          try {
            await storageService.updateExpense(nonExistentId, dummyExpense as Expense);
          } catch (e) {
            updateError = e as Error;
          }

          expect(updateError).not.toBeNull();
          expect(updateError!.message).toBeTruthy();
          expect(updateError!.message.length).toBeGreaterThan(0);
          expect(containsHebrew(updateError!.message)).toBe(true);

          // Test deleteExpense with non-existent ID
          let deleteError: Error | null = null;
          try {
            await storageService.deleteExpense(nonExistentId);
          } catch (e) {
            deleteError = e as Error;
          }

          expect(deleteError).not.toBeNull();
          expect(deleteError!.message).toBeTruthy();
          expect(deleteError!.message.length).toBeGreaterThan(0);
          expect(containsHebrew(deleteError!.message)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: edit-previous-entries, Property 13: Update round-trip
  /**
   * **Validates: Requirements 7.6, 7.7**
   * Property 13: Update round-trip
   *
   * For any stored record (salary or expense) and any valid updated values,
   * updating the record then calling loadAllData() SHALL return data containing
   * a record with the updated values at the matching ID.
   */
  it('Property 13: Update round-trip for salary records', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate a salary record to save initially
        fc.record({
          id: fc.uuid(),
          salaryComponents: fc.record({
            baseSalary: fc.float({ min: Math.fround(1000), max: Math.fround(100000), noNaN: true })
          }),
          month: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) }).map(d => new Date(d.getFullYear(), d.getMonth(), 1)),
          taxCalculation: fc.record({
            salaryComponents: fc.record({
              baseSalary: fc.float({ min: Math.fround(1000), max: Math.fround(100000), noNaN: true })
            }),
            grossSalary: fc.float({ min: Math.fround(1000), max: Math.fround(200000), noNaN: true }),
            incomeTax: fc.float({ min: Math.fround(0), max: Math.fround(50000), noNaN: true }),
            nationalInsurance: fc.float({ min: Math.fround(0), max: Math.fround(20000), noNaN: true }),
            healthInsurance: fc.float({ min: Math.fround(0), max: Math.fround(10000), noNaN: true }),
            pensionEmployeeContribution: fc.float({ min: Math.fround(0), max: Math.fround(12000), noNaN: true }),
            pensionEmployerContribution: fc.float({ min: Math.fround(0), max: Math.fround(13000), noNaN: true }),
            studyFundEmployeeContribution: fc.float({ min: Math.fround(0), max: Math.fround(5000), noNaN: true }),
            studyFundEmployerContribution: fc.float({ min: Math.fround(0), max: Math.fround(15000), noNaN: true }),
            netIncome: fc.float({ min: Math.fround(0), max: Math.fround(150000), noNaN: true })
          }),
          createdAt: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) })
        }),
        // Generate updated salary values
        fc.record({
          salaryComponents: fc.record({
            baseSalary: fc.float({ min: Math.fround(1000), max: Math.fround(100000), noNaN: true })
          }),
          month: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) }).map(d => new Date(d.getFullYear(), d.getMonth(), 1)),
          taxCalculation: fc.record({
            salaryComponents: fc.record({
              baseSalary: fc.float({ min: Math.fround(1000), max: Math.fround(100000), noNaN: true })
            }),
            grossSalary: fc.float({ min: Math.fround(1000), max: Math.fround(200000), noNaN: true }),
            incomeTax: fc.float({ min: Math.fround(0), max: Math.fround(50000), noNaN: true }),
            nationalInsurance: fc.float({ min: Math.fround(0), max: Math.fround(20000), noNaN: true }),
            healthInsurance: fc.float({ min: Math.fround(0), max: Math.fround(10000), noNaN: true }),
            pensionEmployeeContribution: fc.float({ min: Math.fround(0), max: Math.fround(12000), noNaN: true }),
            pensionEmployerContribution: fc.float({ min: Math.fround(0), max: Math.fround(13000), noNaN: true }),
            studyFundEmployeeContribution: fc.float({ min: Math.fround(0), max: Math.fround(5000), noNaN: true }),
            studyFundEmployerContribution: fc.float({ min: Math.fround(0), max: Math.fround(15000), noNaN: true }),
            netIncome: fc.float({ min: Math.fround(0), max: Math.fround(150000), noNaN: true })
          })
        }),
        async (original, updatedValues) => {
          localStorageMock.clear();
          storageService = new LocalStorageService();

          // Save the original salary record
          await storageService.saveSalary(original as SalaryRecord);

          // Build an updated record with the new values
          const updatedRecord: SalaryRecord = {
            id: original.id, // Use same ID to update
            salaryComponents: updatedValues.salaryComponents,
            month: updatedValues.month,
            taxCalculation: updatedValues.taxCalculation as any,
            createdAt: original.createdAt
          };

          // Update the record
          await storageService.updateSalary(original.id, updatedRecord);

          // Load all data and verify round-trip
          const data = await storageService.loadAllData();
          const found = data.salaries.find(s => s.id === original.id);

          // Verify the record exists
          expect(found).toBeDefined();

          // Verify the updated values are present
          expect(found!.salaryComponents.baseSalary).toBe(updatedValues.salaryComponents.baseSalary);
          expect(found!.month.getTime()).toBe(updatedValues.month.getTime());
          expect(found!.taxCalculation.grossSalary).toBe(updatedValues.taxCalculation.grossSalary);
          expect(found!.taxCalculation.incomeTax).toBe(updatedValues.taxCalculation.incomeTax);
          expect(found!.taxCalculation.nationalInsurance).toBe(updatedValues.taxCalculation.nationalInsurance);
          expect(found!.taxCalculation.healthInsurance).toBe(updatedValues.taxCalculation.healthInsurance);
          expect(found!.taxCalculation.pensionEmployeeContribution).toBe(updatedValues.taxCalculation.pensionEmployeeContribution);
          expect(found!.taxCalculation.pensionEmployerContribution).toBe(updatedValues.taxCalculation.pensionEmployerContribution);
          expect(found!.taxCalculation.studyFundEmployeeContribution).toBe(updatedValues.taxCalculation.studyFundEmployeeContribution);
          expect(found!.taxCalculation.studyFundEmployerContribution).toBe(updatedValues.taxCalculation.studyFundEmployerContribution);
          expect(found!.taxCalculation.netIncome).toBe(updatedValues.taxCalculation.netIncome);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: edit-previous-entries, Property 13: Update round-trip
  /**
   * **Validates: Requirements 7.6, 7.7**
   * Property 13: Update round-trip (expenses)
   */
  it('Property 13: Update round-trip for expense records', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate an expense record to save initially
        fc.record({
          id: fc.uuid(),
          amount: fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }),
          date: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) }),
          category: fc.constantFrom('Groceries', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare'),
          description: fc.string({ minLength: 1, maxLength: 50 }),
          createdAt: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) })
        }),
        // Generate updated expense values
        fc.record({
          amount: fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }),
          date: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) }),
          category: fc.constantFrom('Groceries', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare'),
          description: fc.string({ minLength: 1, maxLength: 50 })
        }),
        async (original, updatedValues) => {
          localStorageMock.clear();
          storageService = new LocalStorageService();

          // Save the original expense record
          await storageService.saveExpense(original as Expense);

          // Build an updated record with the new values
          const updatedRecord: Expense = {
            id: original.id, // Use same ID to update
            amount: updatedValues.amount,
            date: updatedValues.date,
            category: updatedValues.category,
            description: updatedValues.description,
            createdAt: original.createdAt
          };

          // Update the record
          await storageService.updateExpense(original.id, updatedRecord);

          // Load all data and verify round-trip
          const data = await storageService.loadAllData();
          const found = data.expenses.find(e => e.id === original.id);

          // Verify the record exists
          expect(found).toBeDefined();

          // Verify the updated values are present
          expect(found!.amount).toBe(updatedValues.amount);
          expect(found!.date.getTime()).toBe(updatedValues.date.getTime());
          expect(found!.category).toBe(updatedValues.category);
          expect(found!.description).toBe(updatedValues.description);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 1.7, 8.1, 8.2, 8.3, 8.5**
   * Property 4: Data Persistence Round-Trip
   * 
   * For any valid financial data (salary records with all components and expenses),
   * saving the data to storage and then loading it back should produce equivalent
   * data with all fields preserved.
   */
  it('Property 4: Save then load preserves all data', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary salary records
        fc.array(
          fc.record({
            id: fc.uuid(),
            salaryComponents: fc.record({
              baseSalary: fc.float({ min: Math.fround(1000), max: Math.fround(100000), noNaN: true }),
              bonus: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(50000), noNaN: true })),
              stockValue: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(100000), noNaN: true })),
              mealVouchers: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(2000), noNaN: true })),
              otherCompensation: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(10000), noNaN: true }))
            }),
            month: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) }).map(d => new Date(d.getFullYear(), d.getMonth(), 1)),
            taxCalculation: fc.record({
              salaryComponents: fc.record({
                baseSalary: fc.float({ min: Math.fround(1000), max: Math.fround(100000), noNaN: true }),
                bonus: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(50000), noNaN: true })),
                stockValue: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(100000), noNaN: true })),
                mealVouchers: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(2000), noNaN: true })),
                otherCompensation: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(10000), noNaN: true }))
              }),
              grossSalary: fc.float({ min: Math.fround(1000), max: Math.fround(200000), noNaN: true }),
              incomeTax: fc.float({ min: Math.fround(0), max: Math.fround(50000), noNaN: true }),
              nationalInsurance: fc.float({ min: Math.fround(0), max: Math.fround(20000), noNaN: true }),
              healthInsurance: fc.float({ min: Math.fround(0), max: Math.fround(10000), noNaN: true }),
              pensionEmployeeContribution: fc.float({ min: Math.fround(0), max: Math.fround(12000), noNaN: true }),
              pensionEmployerContribution: fc.float({ min: Math.fround(0), max: Math.fround(13000), noNaN: true }),
              studyFundEmployeeContribution: fc.float({ min: Math.fround(0), max: Math.fround(5000), noNaN: true }),
              studyFundEmployerContribution: fc.float({ min: Math.fround(0), max: Math.fround(15000), noNaN: true }),
              netIncome: fc.float({ min: Math.fround(0), max: Math.fround(150000), noNaN: true })
            }),
            createdAt: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) })
          }),
          { minLength: 0, maxLength: 5 }
        ),
        // Generate arbitrary expense records
        fc.array(
          fc.record({
            id: fc.uuid(),
            amount: fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }),
            date: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) }),
            category: fc.option(fc.constantFrom('Groceries', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare')),
            description: fc.option(fc.string({ minLength: 0, maxLength: 100 })),
            createdAt: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) })
          }),
          { minLength: 0, maxLength: 10 }
        ),
        async (salaries, expenses) => {
          // Clear storage before each test
          localStorageMock.clear();
          storageService = new LocalStorageService();

          // Save all salaries
          for (const salary of salaries) {
            await storageService.saveSalary(salary);
          }

          // Save all expenses
          for (const expense of expenses) {
            await storageService.saveExpense(expense);
          }

          // Load all data back
          const loadedData = await storageService.loadAllData();

          // Verify salary count (accounting for duplicate months being replaced)
          const uniqueMonths = new Set(salaries.map(s => s.month.getTime()));
          expect(loadedData.salaries.length).toBe(uniqueMonths.size);

          // Verify expense count
          expect(loadedData.expenses.length).toBe(expenses.length);

          // Verify all salary fields are preserved
          for (const loadedSalary of loadedData.salaries) {
            expect(loadedSalary.id).toBeDefined();
            expect(loadedSalary.salaryComponents).toBeDefined();
            expect(loadedSalary.salaryComponents.baseSalary).toBeTypeOf('number');
            expect(loadedSalary.month).toBeInstanceOf(Date);
            expect(loadedSalary.taxCalculation).toBeDefined();
            expect(loadedSalary.taxCalculation.grossSalary).toBeTypeOf('number');
            expect(loadedSalary.taxCalculation.netIncome).toBeTypeOf('number');
            expect(loadedSalary.createdAt).toBeInstanceOf(Date);
          }

          // Verify all expense fields are preserved
          for (const loadedExpense of loadedData.expenses) {
            expect(loadedExpense.id).toBeDefined();
            expect(loadedExpense.amount).toBeTypeOf('number');
            expect(loadedExpense.amount).toBeGreaterThan(0);
            expect(loadedExpense.date).toBeInstanceOf(Date);
            expect(loadedExpense.createdAt).toBeInstanceOf(Date);
            // category and description can be null
            if (loadedExpense.category !== null) {
              expect(loadedExpense.category).toBeTypeOf('string');
            }
            if (loadedExpense.description !== null) {
              expect(loadedExpense.description).toBeTypeOf('string');
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Report Consistency Tests
 * Tests for Property 14: Reports reflect current storage state
 * 
 * These tests verify that after editing or deleting records, generating reports
 * from the current storage state produces totals consistent with the modified data.
 * 
 * **Validates: Requirements 8.1, 8.2**
 */
import { createMonthlyReport, createAnnualReport } from '../domain/models';

describe('Report Consistency After Edits and Deletions', () => {
  let storageService: LocalStorageService;

  beforeEach(() => {
    localStorageMock.clear();
    storageService = new LocalStorageService();
  });

  // Feature: edit-previous-entries, Property 14: Reports reflect current storage state
  /**
   * **Validates: Requirements 8.1**
   * Verify that after editing a salary record, generating a monthly report
   * reflects the updated net income.
   */
  it('should reflect updated net income in monthly report after editing a salary record', async () => {
    // _Requirements: 8.1_
    const month = new Date(2026, 0, 1);
    
    // Create and save initial salary record
    const originalSalary: SalaryRecord = {
      id: 'salary-report-test-1',
      salaryComponents: { baseSalary: 15000 },
      month,
      taxCalculation: {
        salaryComponents: { baseSalary: 15000 },
        grossSalary: 15000,
        incomeTax: 2100,
        nationalInsurance: 1050,
        healthInsurance: 750,
        pensionEmployeeContribution: 900,
        pensionEmployerContribution: 975,
        studyFundEmployeeContribution: 375,
        studyFundEmployerContribution: 1125,
        netIncome: 10000 // Original net income
      },
      createdAt: new Date()
    };

    await storageService.saveSalary(originalSalary);

    // Create some expenses for the same month
    const expense1: Expense = {
      id: 'expense-report-1',
      amount: 500,
      date: new Date(2026, 0, 15),
      category: 'Groceries',
      description: 'Weekly shopping',
      createdAt: new Date()
    };
    const expense2: Expense = {
      id: 'expense-report-2',
      amount: 200,
      date: new Date(2026, 0, 20),
      category: 'Transportation',
      description: 'Bus pass',
      createdAt: new Date()
    };

    await storageService.saveExpense(expense1);
    await storageService.saveExpense(expense2);

    // Generate initial report from storage
    let data = await storageService.loadAllData();
    let salaryForMonth = data.salaries.find(s => s.month.getTime() === month.getTime());
    let expensesForMonth = data.expenses.filter(e => 
      e.date.getMonth() === month.getMonth() && e.date.getFullYear() === month.getFullYear()
    );
    
    let report = createMonthlyReport(month, salaryForMonth!.taxCalculation.netIncome, expensesForMonth);
    
    // Verify initial report values
    expect(report.netIncome).toBe(10000);
    expect(report.totalExpenses).toBe(700);
    expect(report.netSavings).toBe(9300);

    // Update the salary record with new net income
    const updatedSalary: SalaryRecord = {
      ...originalSalary,
      salaryComponents: { baseSalary: 20000 },
      taxCalculation: {
        salaryComponents: { baseSalary: 20000 },
        grossSalary: 20000,
        incomeTax: 2800,
        nationalInsurance: 1400,
        healthInsurance: 1000,
        pensionEmployeeContribution: 1200,
        pensionEmployerContribution: 1300,
        studyFundEmployeeContribution: 500,
        studyFundEmployerContribution: 1500,
        netIncome: 13500 // Updated net income
      }
    };

    await storageService.updateSalary('salary-report-test-1', updatedSalary);

    // Generate report again from updated storage
    data = await storageService.loadAllData();
    salaryForMonth = data.salaries.find(s => s.month.getTime() === month.getTime());
    expensesForMonth = data.expenses.filter(e => 
      e.date.getMonth() === month.getMonth() && e.date.getFullYear() === month.getFullYear()
    );
    
    report = createMonthlyReport(month, salaryForMonth!.taxCalculation.netIncome, expensesForMonth);

    // Verify report reflects updated net income
    expect(report.netIncome).toBe(13500);
    expect(report.totalExpenses).toBe(700); // Expenses unchanged
    expect(report.netSavings).toBe(12800); // 13500 - 700
  });

  // Feature: edit-previous-entries, Property 14: Reports reflect current storage state
  /**
   * **Validates: Requirements 8.2**
   * Verify that after deleting an expense record, generating a monthly report
   * reflects the removal.
   */
  it('should reflect expense removal in monthly report after deleting an expense record', async () => {
    // _Requirements: 8.2_
    const month = new Date(2026, 1, 1);
    
    // Create and save salary record
    const salary: SalaryRecord = {
      id: 'salary-report-test-2',
      salaryComponents: { baseSalary: 12000 },
      month,
      taxCalculation: {
        salaryComponents: { baseSalary: 12000 },
        grossSalary: 12000,
        incomeTax: 1680,
        nationalInsurance: 840,
        healthInsurance: 600,
        pensionEmployeeContribution: 720,
        pensionEmployerContribution: 780,
        studyFundEmployeeContribution: 300,
        studyFundEmployerContribution: 900,
        netIncome: 8000
      },
      createdAt: new Date()
    };

    await storageService.saveSalary(salary);

    // Create and save multiple expenses
    const expense1: Expense = {
      id: 'expense-delete-report-1',
      amount: 300,
      date: new Date(2026, 1, 10),
      category: 'Groceries',
      description: 'Weekly shopping',
      createdAt: new Date()
    };
    const expense2: Expense = {
      id: 'expense-delete-report-2',
      amount: 150,
      date: new Date(2026, 1, 15),
      category: 'Entertainment',
      description: 'Movie tickets',
      createdAt: new Date()
    };
    const expense3: Expense = {
      id: 'expense-delete-report-3',
      amount: 100,
      date: new Date(2026, 1, 20),
      category: 'Transportation',
      description: 'Taxi',
      createdAt: new Date()
    };

    await storageService.saveExpense(expense1);
    await storageService.saveExpense(expense2);
    await storageService.saveExpense(expense3);

    // Generate initial report from storage
    let data = await storageService.loadAllData();
    let expensesForMonth = data.expenses.filter(e => 
      e.date.getMonth() === month.getMonth() && e.date.getFullYear() === month.getFullYear()
    );
    
    let report = createMonthlyReport(month, 8000, expensesForMonth);
    
    // Verify initial report values
    expect(report.totalExpenses).toBe(550); // 300 + 150 + 100
    expect(report.netSavings).toBe(7450); // 8000 - 550
    expect(report.expensesByCategory.get('Groceries')).toBe(300);
    expect(report.expensesByCategory.get('Entertainment')).toBe(150);
    expect(report.expensesByCategory.get('Transportation')).toBe(100);

    // Delete one expense
    await storageService.deleteExpense('expense-delete-report-2');

    // Generate report again from updated storage
    data = await storageService.loadAllData();
    expensesForMonth = data.expenses.filter(e => 
      e.date.getMonth() === month.getMonth() && e.date.getFullYear() === month.getFullYear()
    );
    
    report = createMonthlyReport(month, 8000, expensesForMonth);

    // Verify report reflects expense removal
    expect(report.totalExpenses).toBe(400); // 300 + 100 (150 removed)
    expect(report.netSavings).toBe(7600); // 8000 - 400
    expect(report.expensesByCategory.get('Groceries')).toBe(300);
    expect(report.expensesByCategory.get('Entertainment')).toBeUndefined(); // Category removed
    expect(report.expensesByCategory.get('Transportation')).toBe(100);
  });

  // Feature: edit-previous-entries, Property 14: Reports reflect current storage state
  /**
   * **Validates: Requirements 8.1, 8.2**
   * Verify that annual report reflects both salary edits and expense deletions
   * across multiple months.
   */
  it('should reflect edits and deletions in annual report', async () => {
    // _Requirements: 8.1, 8.2_
    const startDate = new Date(2026, 0, 1);
    const endDate = new Date(2026, 11, 31);
    
    // Create salary records for two months
    const salary1: SalaryRecord = {
      id: 'annual-salary-1',
      salaryComponents: { baseSalary: 10000 },
      month: new Date(2026, 0, 1),
      taxCalculation: {
        salaryComponents: { baseSalary: 10000 },
        grossSalary: 10000,
        incomeTax: 1400,
        nationalInsurance: 700,
        healthInsurance: 500,
        pensionEmployeeContribution: 600,
        pensionEmployerContribution: 650,
        studyFundEmployeeContribution: 250,
        studyFundEmployerContribution: 750,
        netIncome: 7000
      },
      createdAt: new Date()
    };

    const salary2: SalaryRecord = {
      id: 'annual-salary-2',
      salaryComponents: { baseSalary: 12000 },
      month: new Date(2026, 1, 1),
      taxCalculation: {
        salaryComponents: { baseSalary: 12000 },
        grossSalary: 12000,
        incomeTax: 1680,
        nationalInsurance: 840,
        healthInsurance: 600,
        pensionEmployeeContribution: 720,
        pensionEmployerContribution: 780,
        studyFundEmployeeContribution: 300,
        studyFundEmployerContribution: 900,
        netIncome: 8000
      },
      createdAt: new Date()
    };

    await storageService.saveSalary(salary1);
    await storageService.saveSalary(salary2);

    // Create expenses for both months
    const expense1: Expense = {
      id: 'annual-expense-1',
      amount: 200,
      date: new Date(2026, 0, 15),
      category: 'Groceries',
      description: 'Shopping',
      createdAt: new Date()
    };
    const expense2: Expense = {
      id: 'annual-expense-2',
      amount: 300,
      date: new Date(2026, 1, 15),
      category: 'Groceries',
      description: 'Shopping',
      createdAt: new Date()
    };

    await storageService.saveExpense(expense1);
    await storageService.saveExpense(expense2);

    // Helper function to generate annual report from current storage
    const generateAnnualReportFromStorage = async () => {
      const data = await storageService.loadAllData();
      
      // Create monthly reports for each month with salary data
      const monthlyReports = data.salaries.map(salary => {
        const monthExpenses = data.expenses.filter(e => 
          e.date.getMonth() === salary.month.getMonth() && 
          e.date.getFullYear() === salary.month.getFullYear()
        );
        return createMonthlyReport(salary.month, salary.taxCalculation.netIncome, monthExpenses);
      });

      // Calculate pension and study fund totals
      const totalPension = data.salaries.reduce((sum, s) => 
        sum + s.taxCalculation.pensionEmployeeContribution + s.taxCalculation.pensionEmployerContribution, 0
      );
      const totalStudyFund = data.salaries.reduce((sum, s) => 
        sum + s.taxCalculation.studyFundEmployeeContribution + s.taxCalculation.studyFundEmployerContribution, 0
      );

      return createAnnualReport(startDate, endDate, monthlyReports, totalPension, totalStudyFund);
    };

    // Generate initial annual report
    let annualReport = await generateAnnualReportFromStorage();
    
    // Verify initial values
    expect(annualReport.totalIncome).toBe(15000); // 7000 + 8000
    expect(annualReport.totalExpenses).toBe(500); // 200 + 300
    expect(annualReport.totalSavings).toBe(14500); // 15000 - 500

    // Update first salary with higher net income
    const updatedSalary1: SalaryRecord = {
      ...salary1,
      salaryComponents: { baseSalary: 15000 },
      taxCalculation: {
        ...salary1.taxCalculation,
        grossSalary: 15000,
        netIncome: 10000 // Increased from 7000
      }
    };
    await storageService.updateSalary('annual-salary-1', updatedSalary1);

    // Delete one expense
    await storageService.deleteExpense('annual-expense-2');

    // Generate annual report again
    annualReport = await generateAnnualReportFromStorage();

    // Verify report reflects both changes
    expect(annualReport.totalIncome).toBe(18000); // 10000 + 8000 (updated)
    expect(annualReport.totalExpenses).toBe(200); // Only expense1 remains
    expect(annualReport.totalSavings).toBe(17800); // 18000 - 200
  });

  // Feature: edit-previous-entries, Property 14: Reports reflect current storage state
  /**
   * **Validates: Requirements 8.1**
   * Verify that editing an expense amount is reflected in the report.
   */
  it('should reflect updated expense amount in monthly report after editing an expense', async () => {
    // _Requirements: 8.2_
    const month = new Date(2026, 2, 1);
    
    // Create and save expense
    const originalExpense: Expense = {
      id: 'expense-edit-report-1',
      amount: 250,
      date: new Date(2026, 2, 10),
      category: 'Utilities',
      description: 'Electric bill',
      createdAt: new Date()
    };

    await storageService.saveExpense(originalExpense);

    // Generate initial report
    let data = await storageService.loadAllData();
    let expensesForMonth = data.expenses.filter(e => 
      e.date.getMonth() === month.getMonth() && e.date.getFullYear() === month.getFullYear()
    );
    
    let report = createMonthlyReport(month, 10000, expensesForMonth);
    
    expect(report.totalExpenses).toBe(250);
    expect(report.netSavings).toBe(9750);
    expect(report.expensesByCategory.get('Utilities')).toBe(250);

    // Update expense with new amount
    const updatedExpense: Expense = {
      ...originalExpense,
      amount: 400 // Increased from 250
    };

    await storageService.updateExpense('expense-edit-report-1', updatedExpense);

    // Generate report again
    data = await storageService.loadAllData();
    expensesForMonth = data.expenses.filter(e => 
      e.date.getMonth() === month.getMonth() && e.date.getFullYear() === month.getFullYear()
    );
    
    report = createMonthlyReport(month, 10000, expensesForMonth);

    // Verify report reflects updated expense amount
    expect(report.totalExpenses).toBe(400);
    expect(report.netSavings).toBe(9600); // 10000 - 400
    expect(report.expensesByCategory.get('Utilities')).toBe(400);
  });

  // Feature: edit-previous-entries, Property 14: Reports reflect current storage state
  /**
   * **Validates: Requirements 8.1, 8.2**
   * Verify that deleting a salary record removes it from annual report calculations.
   */
  it('should reflect salary deletion in annual report', async () => {
    // _Requirements: 8.1_
    const startDate = new Date(2026, 0, 1);
    const endDate = new Date(2026, 11, 31);
    
    // Create salary records for three months
    const salary1: SalaryRecord = {
      id: 'delete-annual-salary-1',
      salaryComponents: { baseSalary: 10000 },
      month: new Date(2026, 0, 1),
      taxCalculation: {
        salaryComponents: { baseSalary: 10000 },
        grossSalary: 10000,
        incomeTax: 1400,
        nationalInsurance: 700,
        healthInsurance: 500,
        pensionEmployeeContribution: 600,
        pensionEmployerContribution: 650,
        studyFundEmployeeContribution: 250,
        studyFundEmployerContribution: 750,
        netIncome: 5000
      },
      createdAt: new Date()
    };

    const salary2: SalaryRecord = {
      id: 'delete-annual-salary-2',
      salaryComponents: { baseSalary: 12000 },
      month: new Date(2026, 1, 1),
      taxCalculation: {
        salaryComponents: { baseSalary: 12000 },
        grossSalary: 12000,
        incomeTax: 1680,
        nationalInsurance: 840,
        healthInsurance: 600,
        pensionEmployeeContribution: 720,
        pensionEmployerContribution: 780,
        studyFundEmployeeContribution: 300,
        studyFundEmployerContribution: 900,
        netIncome: 6000
      },
      createdAt: new Date()
    };

    const salary3: SalaryRecord = {
      id: 'delete-annual-salary-3',
      salaryComponents: { baseSalary: 14000 },
      month: new Date(2026, 2, 1),
      taxCalculation: {
        salaryComponents: { baseSalary: 14000 },
        grossSalary: 14000,
        incomeTax: 1960,
        nationalInsurance: 980,
        healthInsurance: 700,
        pensionEmployeeContribution: 840,
        pensionEmployerContribution: 910,
        studyFundEmployeeContribution: 350,
        studyFundEmployerContribution: 1050,
        netIncome: 7000
      },
      createdAt: new Date()
    };

    await storageService.saveSalary(salary1);
    await storageService.saveSalary(salary2);
    await storageService.saveSalary(salary3);

    // Helper function to generate annual report
    const generateAnnualReportFromStorage = async () => {
      const data = await storageService.loadAllData();
      
      const monthlyReports = data.salaries.map(salary => {
        const monthExpenses = data.expenses.filter(e => 
          e.date.getMonth() === salary.month.getMonth() && 
          e.date.getFullYear() === salary.month.getFullYear()
        );
        return createMonthlyReport(salary.month, salary.taxCalculation.netIncome, monthExpenses);
      });

      const totalPension = data.salaries.reduce((sum, s) => 
        sum + s.taxCalculation.pensionEmployeeContribution + s.taxCalculation.pensionEmployerContribution, 0
      );
      const totalStudyFund = data.salaries.reduce((sum, s) => 
        sum + s.taxCalculation.studyFundEmployeeContribution + s.taxCalculation.studyFundEmployerContribution, 0
      );

      return createAnnualReport(startDate, endDate, monthlyReports, totalPension, totalStudyFund);
    };

    // Generate initial annual report
    let annualReport = await generateAnnualReportFromStorage();
    
    expect(annualReport.totalIncome).toBe(18000); // 5000 + 6000 + 7000
    expect(annualReport.monthlyReports.length).toBe(3);

    // Delete the middle salary record
    await storageService.deleteSalary('delete-annual-salary-2');

    // Generate annual report again
    annualReport = await generateAnnualReportFromStorage();

    // Verify report reflects salary deletion
    expect(annualReport.totalIncome).toBe(12000); // 5000 + 7000 (6000 removed)
    expect(annualReport.monthlyReports.length).toBe(2);
  });
});
