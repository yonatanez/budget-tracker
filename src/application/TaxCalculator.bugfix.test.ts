import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { TaxCalculator } from './TaxCalculator';
import { SalaryComponents } from '../domain/types';

describe('TaxCalculator Bugfix - Stock Value Exploration', () => {
  const calculator = new TaxCalculator();

  describe('Property 1: Fault Condition - Stock Value Inflates Gross Salary', () => {
    /**
     * **Validates: Requirements 1.3, 1.4, 2.4**
     *
     * Bug condition: When stockValue > 0, calculateGrossSalary() includes it
     * in the gross salary sum, inflating income tax, national insurance, and
     * health insurance calculations.
     *
     * Expected behavior: grossSalary should NOT include stockValue.
     * It should equal baseSalary + bonus + mealVouchers + otherCompensation + directPensionContribution.
     *
     * Concrete example: calculateNetIncome({ baseSalary: 20000, stockValue: 50000 }).grossSalary
     * returns 70000 instead of expected 20000.
     *
     * This test is EXPECTED TO FAIL on unfixed code — failure confirms the bug exists.
     */
    it('grossSalary should not include stockValue for any salary components with stockValue > 0', () => {
      fc.assert(
        fc.property(
          fc.record({
            baseSalary: fc.integer({ min: 1, max: 100000 }),
            bonus: fc.option(fc.integer({ min: 1, max: 50000 }), { nil: undefined }),
            mealVouchers: fc.option(fc.integer({ min: 1, max: 5000 }), { nil: undefined }),
            otherCompensation: fc.option(fc.integer({ min: 1, max: 20000 }), { nil: undefined }),
            stockValue: fc.integer({ min: 1, max: 50000 }),
          }),
          (components: SalaryComponents) => {
            const result = calculator.calculateNetIncome(components);

            // Expected gross salary: sum of all components EXCLUDING stockValue
            const expectedGross =
              components.baseSalary +
              (components.bonus || 0) +
              (components.mealVouchers || 0) +
              (components.otherCompensation || 0) +
              (components.directPensionContribution || 0);

            const expectedGrossRounded = Math.round(expectedGross * 100) / 100;

            expect(result.grossSalary).toBe(expectedGrossRounded);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

describe('TaxCalculator Bugfix - Preservation', () => {
  const calculator = new TaxCalculator();

  describe('Property 2: Preservation - Salary Calculations Without Stock Value Unchanged', () => {
    /**
     * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
     *
     * Preservation property: For any SalaryComponents where stockValue is
     * undefined or 0, the salary calculations must remain correct.
     *
     * grossSalary must equal baseSalary + (bonus||0) + (mealVouchers||0)
     *   + (otherCompensation||0) + (directPensionContribution||0)
     *
     * netIncome must equal cashIncome - incomeTax - nationalInsurance
     *   - healthInsurance - pensionEmployee - studyFundEmployee
     *
     * These properties hold on BOTH unfixed and fixed code since they
     * don't involve stockValue.
     */
    it('grossSalary equals sum of non-stock components for salary without stockValue', () => {
      fc.assert(
        fc.property(
          fc.record({
            baseSalary: fc.integer({ min: 1, max: 100000 }),
            bonus: fc.option(fc.integer({ min: 1, max: 50000 }), { nil: undefined }),
            mealVouchers: fc.option(fc.integer({ min: 1, max: 5000 }), { nil: undefined }),
            otherCompensation: fc.option(fc.integer({ min: 1, max: 20000 }), { nil: undefined }),
            directPensionContribution: fc.option(fc.integer({ min: 1, max: 10000 }), { nil: undefined }),
          }),
          (components: SalaryComponents) => {
            const result = calculator.calculateNetIncome(components);

            const expectedGross =
              components.baseSalary +
              (components.bonus || 0) +
              (components.mealVouchers || 0) +
              (components.otherCompensation || 0) +
              (components.directPensionContribution || 0);

            expect(result.grossSalary).toBe(Math.round(expectedGross * 100) / 100);
          }
        ),
        { numRuns: 200 }
      );
    });

    it('netIncome equals cashIncome minus all employee deductions for salary without stockValue', () => {
      fc.assert(
        fc.property(
          fc.record({
            baseSalary: fc.integer({ min: 1, max: 100000 }),
            bonus: fc.option(fc.integer({ min: 1, max: 50000 }), { nil: undefined }),
            mealVouchers: fc.option(fc.integer({ min: 1, max: 5000 }), { nil: undefined }),
            otherCompensation: fc.option(fc.integer({ min: 1, max: 20000 }), { nil: undefined }),
            directPensionContribution: fc.option(fc.integer({ min: 1, max: 10000 }), { nil: undefined }),
          }),
          (components: SalaryComponents) => {
            const result = calculator.calculateNetIncome(components);

            // netIncome = cashIncome - incomeTax - nationalInsurance - healthInsurance
            //             - pensionEmployee - studyFundEmployee
            const expectedNet =
              result.cashIncome -
              result.incomeTax -
              result.nationalInsurance -
              result.healthInsurance -
              result.pensionEmployeeContribution -
              result.studyFundEmployeeContribution;

            // Allow small floating point tolerance due to rounding
            expect(result.netIncome).toBeCloseTo(expectedNet, 1);
          }
        ),
        { numRuns: 200 }
      );
    });
  });
});
