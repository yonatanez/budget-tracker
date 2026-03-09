import { describe, it, expect } from 'vitest';
import type { Result, SalaryComponents, Expense } from './types';

describe('Core Types', () => {
  describe('Result type', () => {
    it('should create a success result', () => {
      const result: Result<number, string> = {
        success: true,
        value: 42
      };
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(42);
      }
    });

    it('should create an error result', () => {
      const result: Result<number, string> = {
        success: false,
        error: 'Something went wrong'
      };
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Something went wrong');
      }
    });
  });

  describe('SalaryComponents', () => {
    it('should accept base salary only', () => {
      const components: SalaryComponents = {
        baseSalary: 10000
      };
      
      expect(components.baseSalary).toBe(10000);
      expect(components.bonus).toBeUndefined();
    });

    it('should accept all salary components', () => {
      const components: SalaryComponents = {
        baseSalary: 10000,
        bonus: 2000,
        stockValue: 5000,
        mealVouchers: 500,
        otherCompensation: 1000
      };
      
      expect(components.baseSalary).toBe(10000);
      expect(components.bonus).toBe(2000);
      expect(components.stockValue).toBe(5000);
      expect(components.mealVouchers).toBe(500);
      expect(components.otherCompensation).toBe(1000);
    });
  });

  describe('Expense', () => {
    it('should have required fields', () => {
      const expense: Expense = {
        id: '123',
        amount: 100.50,
        date: new Date('2026-01-15'),
        category: null,
        description: null,
        createdAt: new Date()
      };
      
      expect(expense.id).toBe('123');
      expect(expense.amount).toBe(100.50);
      expect(expense.category).toBeNull();
      expect(expense.description).toBeNull();
    });

    it('should accept optional category and description', () => {
      const expense: Expense = {
        id: '456',
        amount: 200.00,
        date: new Date('2026-01-16'),
        category: 'Groceries',
        description: 'Weekly shopping',
        createdAt: new Date()
      };
      
      expect(expense.category).toBe('Groceries');
      expect(expense.description).toBe('Weekly shopping');
    });
  });
});
