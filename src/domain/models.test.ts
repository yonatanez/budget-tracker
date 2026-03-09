/**
 * Tests for domain model factory functions
 */

import { describe, it, expect } from 'vitest';
import {
  createSalaryRecord,
  createExpense,
  createMonthlyReport,
  createAnnualReport
} from './models';
import { SalaryComponents, TaxCalculationResult, ExpenseInput } from './types';

describe('Domain Model Factories', () => {
  describe('createSalaryRecord', () => {
    it('should create a salary record with generated ID and timestamp', () => {
      const components: SalaryComponents = {
        baseSalary: 10000,
        bonus: 2000
      };
      
      const taxCalculation: TaxCalculationResult = {
        salaryComponents: components,
        grossSalary: 12000,
        taxableIncome: 12000,
        cashIncome: 12000,
        incomeTax: 1200,
        nationalInsurance: 840,
        healthInsurance: 600,
        pensionEmployeeContribution: 720,
        pensionEmployerContribution: 780,
        studyFundEmployeeContribution: 300,
        studyFundEmployerContribution: 900,
        netIncome: 8340,
        taxCreditDeduction: 501.75
      };
      
      const month = new Date(2026, 0, 1);
      const record = createSalaryRecord(components, month, taxCalculation);
      
      expect(record.id).toBeDefined();
      expect(record.id.length).toBeGreaterThan(0);
      expect(record.salaryComponents).toEqual(components);
      expect(record.month).toEqual(month);
      expect(record.taxCalculation).toEqual(taxCalculation);
      expect(record.createdAt).toBeInstanceOf(Date);
    });
    
    it('should generate unique IDs for different records', () => {
      const components: SalaryComponents = { baseSalary: 10000 };
      const taxCalculation: TaxCalculationResult = {
        salaryComponents: components,
        grossSalary: 10000,
        incomeTax: 1000,
        nationalInsurance: 700,
        healthInsurance: 500,
        pensionEmployeeContribution: 600,
        pensionEmployerContribution: 650,
        studyFundEmployeeContribution: 250,
        studyFundEmployerContribution: 750,
        netIncome: 6950
      };
      
      const month = new Date(2026, 0, 1);
      const record1 = createSalaryRecord(components, month, taxCalculation);
      const record2 = createSalaryRecord(components, month, taxCalculation);
      
      expect(record1.id).not.toEqual(record2.id);
    });
  });
  
  describe('createExpense', () => {
    it('should create an expense with generated ID and timestamp', () => {
      const input: ExpenseInput = {
        amount: 150.50,
        date: new Date(2026, 0, 15),
        category: 'Groceries',
        description: 'Weekly shopping'
      };
      
      const expense = createExpense(input);
      
      expect(expense.id).toBeDefined();
      expect(expense.id.length).toBeGreaterThan(0);
      expect(expense.amount).toBe(150.50);
      expect(expense.date).toEqual(input.date);
      expect(expense.category).toBe('Groceries');
      expect(expense.description).toBe('Weekly shopping');
      expect(expense.createdAt).toBeInstanceOf(Date);
    });
    
    it('should handle optional category and description', () => {
      const input: ExpenseInput = {
        amount: 50.00,
        date: new Date(2026, 0, 16)
      };
      
      const expense = createExpense(input);
      
      expect(expense.category).toBeNull();
      expect(expense.description).toBeNull();
    });
    
    it('should generate unique IDs for different expenses', () => {
      const input: ExpenseInput = {
        amount: 100,
        date: new Date(2026, 0, 15)
      };
      
      const expense1 = createExpense(input);
      const expense2 = createExpense(input);
      
      expect(expense1.id).not.toEqual(expense2.id);
    });
  });
  
  describe('Property Tests', () => {
    describe('Property 10: Expense Timestamp Assignment', () => {
      /**
       * **Validates: Requirements 3.6**
       * 
       * For any valid expense that is successfully stored, the expense record 
       * should have a createdAt timestamp that is set to a valid date/time.
       */
      it('should assign a valid createdAt timestamp to all created expenses', () => {
        const fc = require('fast-check');
        
        fc.assert(
          fc.property(
            // Generate arbitrary expense inputs
            fc.record({
              amount: fc.float({ min: Math.fround(0.01), max: Math.fround(1000000), noNaN: true }),
              date: fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) }),
              category: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
              description: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined })
            }),
            (expenseInput: ExpenseInput) => {
              const beforeCreation = new Date();
              const expense = createExpense(expenseInput);
              const afterCreation = new Date();
              
              // Verify createdAt is a valid Date object
              expect(expense.createdAt).toBeInstanceOf(Date);
              
              // Verify createdAt is not invalid (NaN)
              expect(isNaN(expense.createdAt.getTime())).toBe(false);
              
              // Verify createdAt is within reasonable bounds (between before and after creation)
              // Allow a small buffer for test execution time
              expect(expense.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime() - 100);
              expect(expense.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime() + 100);
              
              // Verify all other fields are preserved (amount is rounded to 2 decimal places)
              const expectedAmount = Math.round(expenseInput.amount * 100) / 100;
              expect(expense.amount).toBe(expectedAmount);
              expect(expense.date).toEqual(expenseInput.date);
              expect(expense.category).toBe(expenseInput.category ?? null);
              expect(expense.description).toBe(expenseInput.description ?? null);
              expect(expense.id).toBeDefined();
              expect(expense.id.length).toBeGreaterThan(0);
            }
          ),
          { numRuns: 100 }
        );
      });
    });
    
    describe('Property 26: Monetary Precision', () => {
      /**
       * **Validates: Requirements 9.4**
       * 
       * For any monetary value stored in the system, the value should maintain 
       * exactly two decimal places of precision.
       */
      it('should maintain exactly 2 decimal places for all monetary values', () => {
        const fc = require('fast-check');
        
        /**
         * Helper function to check if a number has at most 2 decimal places
         */
        const hasAtMostTwoDecimals = (value: number): boolean => {
          // Round to 2 decimal places and check if it equals the original
          const rounded = Math.round(value * 100) / 100;
          return Math.abs(value - rounded) < Number.EPSILON;
        };
        
        fc.assert(
          fc.property(
            // Generate arbitrary monetary values with various decimal places
            fc.record({
              // Salary components
              baseSalary: fc.float({ min: Math.fround(0.01), max: Math.fround(100000), noNaN: true }),
              bonus: fc.option(fc.float({ min: Math.fround(0.01), max: Math.fround(50000), noNaN: true }), { nil: undefined }),
              stockValue: fc.option(fc.float({ min: Math.fround(0.01), max: Math.fround(50000), noNaN: true }), { nil: undefined }),
              mealVouchers: fc.option(fc.float({ min: Math.fround(0.01), max: Math.fround(5000), noNaN: true }), { nil: undefined }),
              otherCompensation: fc.option(fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }), { nil: undefined }),
              // Expense amount
              expenseAmount: fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }),
              // Net income for reports
              netIncome: fc.float({ min: Math.fround(0.01), max: Math.fround(100000), noNaN: true })
            }),
            (values) => {
              // Round all input values to 2 decimal places to simulate proper storage
              const salaryComponents: SalaryComponents = {
                baseSalary: Math.round(values.baseSalary * 100) / 100,
                bonus: values.bonus ? Math.round(values.bonus * 100) / 100 : undefined,
                stockValue: values.stockValue ? Math.round(values.stockValue * 100) / 100 : undefined,
                mealVouchers: values.mealVouchers ? Math.round(values.mealVouchers * 100) / 100 : undefined,
                otherCompensation: values.otherCompensation ? Math.round(values.otherCompensation * 100) / 100 : undefined
              };
              
              const expenseAmount = Math.round(values.expenseAmount * 100) / 100;
              const netIncome = Math.round(values.netIncome * 100) / 100;
              
              // Create a mock tax calculation result
              const grossSalary = Math.round((
                salaryComponents.baseSalary +
                (salaryComponents.bonus ?? 0) +
                (salaryComponents.stockValue ?? 0) +
                (salaryComponents.mealVouchers ?? 0) +
                (salaryComponents.otherCompensation ?? 0)
              ) * 100) / 100;
              
              const taxCalculation: TaxCalculationResult = {
                salaryComponents,
                grossSalary,
                incomeTax: Math.round(grossSalary * 0.1 * 100) / 100,
                nationalInsurance: Math.round(grossSalary * 0.07 * 100) / 100,
                healthInsurance: Math.round(grossSalary * 0.05 * 100) / 100,
                pensionEmployeeContribution: Math.round(grossSalary * 0.06 * 100) / 100,
                pensionEmployerContribution: Math.round(grossSalary * 0.065 * 100) / 100,
                studyFundEmployeeContribution: Math.round(grossSalary * 0.025 * 100) / 100,
                studyFundEmployerContribution: Math.round(grossSalary * 0.075 * 100) / 100,
                netIncome: Math.round(netIncome * 100) / 100
              };
              
              // Create salary record
              const salaryRecord = createSalaryRecord(
                salaryComponents,
                new Date(2026, 0, 1),
                taxCalculation
              );
              
              // Create expense
              const expense = createExpense({
                amount: expenseAmount,
                date: new Date(2026, 0, 15)
              });
              
              // Create monthly report
              const monthlyReport = createMonthlyReport(
                new Date(2026, 0, 1),
                netIncome,
                [expense]
              );
              
              // Verify salary components maintain 2 decimal places
              expect(hasAtMostTwoDecimals(salaryRecord.salaryComponents.baseSalary)).toBe(true);
              if (salaryRecord.salaryComponents.bonus !== undefined) {
                expect(hasAtMostTwoDecimals(salaryRecord.salaryComponents.bonus)).toBe(true);
              }
              if (salaryRecord.salaryComponents.stockValue !== undefined) {
                expect(hasAtMostTwoDecimals(salaryRecord.salaryComponents.stockValue)).toBe(true);
              }
              if (salaryRecord.salaryComponents.mealVouchers !== undefined) {
                expect(hasAtMostTwoDecimals(salaryRecord.salaryComponents.mealVouchers)).toBe(true);
              }
              if (salaryRecord.salaryComponents.otherCompensation !== undefined) {
                expect(hasAtMostTwoDecimals(salaryRecord.salaryComponents.otherCompensation)).toBe(true);
              }
              
              // Verify tax calculation values maintain 2 decimal places
              expect(hasAtMostTwoDecimals(salaryRecord.taxCalculation.grossSalary)).toBe(true);
              expect(hasAtMostTwoDecimals(salaryRecord.taxCalculation.incomeTax)).toBe(true);
              expect(hasAtMostTwoDecimals(salaryRecord.taxCalculation.nationalInsurance)).toBe(true);
              expect(hasAtMostTwoDecimals(salaryRecord.taxCalculation.healthInsurance)).toBe(true);
              expect(hasAtMostTwoDecimals(salaryRecord.taxCalculation.pensionEmployeeContribution)).toBe(true);
              expect(hasAtMostTwoDecimals(salaryRecord.taxCalculation.pensionEmployerContribution)).toBe(true);
              expect(hasAtMostTwoDecimals(salaryRecord.taxCalculation.studyFundEmployeeContribution)).toBe(true);
              expect(hasAtMostTwoDecimals(salaryRecord.taxCalculation.studyFundEmployerContribution)).toBe(true);
              expect(hasAtMostTwoDecimals(salaryRecord.taxCalculation.netIncome)).toBe(true);
              
              // Verify expense amount maintains 2 decimal places
              expect(hasAtMostTwoDecimals(expense.amount)).toBe(true);
              
              // Verify monthly report values maintain 2 decimal places
              expect(hasAtMostTwoDecimals(monthlyReport.netIncome)).toBe(true);
              expect(hasAtMostTwoDecimals(monthlyReport.totalExpenses)).toBe(true);
              expect(hasAtMostTwoDecimals(monthlyReport.netSavings)).toBe(true);
              
              // Verify category totals maintain 2 decimal places
              monthlyReport.expensesByCategory.forEach((amount) => {
                expect(hasAtMostTwoDecimals(amount)).toBe(true);
              });
            }
          ),
          { numRuns: 100 }
        );
      });
    });
  });
  
  describe('createMonthlyReport', () => {
    it('should create a monthly report with calculated totals', () => {
      const month = new Date(2026, 0, 1);
      const netIncome = 8000;
      const expenses = [
        createExpense({ amount: 150, date: new Date(2026, 0, 15), category: 'Groceries' }),
        createExpense({ amount: 50, date: new Date(2026, 0, 16), category: 'Transportation' }),
        createExpense({ amount: 100, date: new Date(2026, 0, 17), category: 'Groceries' })
      ];
      
      const report = createMonthlyReport(month, netIncome, expenses);
      
      expect(report.month).toEqual(month);
      expect(report.netIncome).toBe(8000);
      expect(report.expenses).toEqual(expenses);
      expect(report.totalExpenses).toBe(300);
      expect(report.netSavings).toBe(7700);
    });
    
    it('should group expenses by category', () => {
      const month = new Date(2026, 0, 1);
      const netIncome = 8000;
      const expenses = [
        createExpense({ amount: 150, date: new Date(2026, 0, 15), category: 'Groceries' }),
        createExpense({ amount: 50, date: new Date(2026, 0, 16), category: 'Transportation' }),
        createExpense({ amount: 100, date: new Date(2026, 0, 17), category: 'Groceries' })
      ];
      
      const report = createMonthlyReport(month, netIncome, expenses);
      
      expect(report.expensesByCategory.get('Groceries')).toBe(250);
      expect(report.expensesByCategory.get('Transportation')).toBe(50);
    });
    
    it('should handle expenses without categories', () => {
      const month = new Date(2026, 0, 1);
      const netIncome = 8000;
      const expenses = [
        createExpense({ amount: 150, date: new Date(2026, 0, 15) })
      ];
      
      const report = createMonthlyReport(month, netIncome, expenses);
      
      expect(report.expensesByCategory.get('Uncategorized')).toBe(150);
    });
    
    it('should handle empty expense list', () => {
      const month = new Date(2026, 0, 1);
      const netIncome = 8000;
      const expenses: any[] = [];
      
      const report = createMonthlyReport(month, netIncome, expenses);
      
      expect(report.totalExpenses).toBe(0);
      expect(report.netSavings).toBe(8000);
      expect(report.expensesByCategory.size).toBe(0);
    });
  });
  
  describe('createAnnualReport', () => {
    it('should create an annual report with calculated totals', () => {
      const startDate = new Date(2025, 0, 1);
      const endDate = new Date(2025, 11, 31);
      
      const monthlyReports = [
        createMonthlyReport(new Date(2025, 0, 1), 8000, [
          createExpense({ amount: 200, date: new Date(2025, 0, 15), category: 'Groceries' })
        ]),
        createMonthlyReport(new Date(2025, 1, 1), 8500, [
          createExpense({ amount: 300, date: new Date(2025, 1, 15), category: 'Transportation' })
        ])
      ];
      
      const report = createAnnualReport(startDate, endDate, monthlyReports, 10000, 5000);
      
      expect(report.startDate).toEqual(startDate);
      expect(report.endDate).toEqual(endDate);
      expect(report.monthlyReports).toEqual(monthlyReports);
      expect(report.totalIncome).toBe(16500);
      expect(report.totalExpenses).toBe(500);
      expect(report.totalSavings).toBe(16000);
      expect(report.totalPensionAccumulation).toBe(10000);
      expect(report.totalStudyFundAccumulation).toBe(5000);
    });
    
    it('should aggregate expenses by category across all months', () => {
      const startDate = new Date(2025, 0, 1);
      const endDate = new Date(2025, 11, 31);
      
      const monthlyReports = [
        createMonthlyReport(new Date(2025, 0, 1), 8000, [
          createExpense({ amount: 200, date: new Date(2025, 0, 15), category: 'Groceries' }),
          createExpense({ amount: 100, date: new Date(2025, 0, 16), category: 'Transportation' })
        ]),
        createMonthlyReport(new Date(2025, 1, 1), 8500, [
          createExpense({ amount: 150, date: new Date(2025, 1, 15), category: 'Groceries' }),
          createExpense({ amount: 50, date: new Date(2025, 1, 16), category: 'Transportation' })
        ])
      ];
      
      const report = createAnnualReport(startDate, endDate, monthlyReports, 10000, 5000);
      
      expect(report.expensesByCategory.get('Groceries')).toBe(350);
      expect(report.expensesByCategory.get('Transportation')).toBe(150);
    });
  });
});
