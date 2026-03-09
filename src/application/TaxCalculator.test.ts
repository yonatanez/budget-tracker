import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { TaxCalculator } from './TaxCalculator';
import { SalaryComponents } from '../domain/types';

describe('TaxCalculator', () => {
  const calculator = new TaxCalculator();

  describe('calculateNetIncome', () => {
    it('should calculate correctly for salary of ₪5,000 (below first bracket ceiling)', () => {
      const components: SalaryComponents = {
        baseSalary: 5000,
      };

      const result = calculator.calculateNetIncome(components, 0);

      // Gross salary
      expect(result.grossSalary).toBe(5000);

      // Pension employee: 5000 * 0.06 = 300
      expect(result.pensionEmployeeContribution).toBe(300);

      // Study fund employee: 5000 * 0.025 = 125
      expect(result.studyFundEmployeeContribution).toBe(125);

      // Income tax: taxable = 5000 - 300 (pension) - 125 (study fund) = 4575
      // 4575 * 0.10 = 457.5
      expect(result.incomeTax).toBe(457.5);

      // National Insurance (progressive): 5000 * 1.04% = 52
      expect(result.nationalInsurance).toBe(52);

      // Health Insurance (progressive): 5000 * 3.23% = 161.50
      expect(result.healthInsurance).toBe(161.5);

      // Pension employer: 5000 * 0.065 = 325
      expect(result.pensionEmployerContribution).toBe(325);

      // Study fund employer: 5000 * 0.075 = 375
      expect(result.studyFundEmployerContribution).toBe(375);

      // Net income: 5000 - 457.5 - 52 - 161.5 - 300 - 125 = 3904
      expect(result.netIncome).toBe(3904);
    });

    it('should calculate correctly for salary of ₪10,000 (crosses multiple brackets)', () => {
      const components: SalaryComponents = {
        baseSalary: 10000,
      };

      const result = calculator.calculateNetIncome(components, 0);

      // Gross salary
      expect(result.grossSalary).toBe(10000);

      // Pension employee: 10000 * 0.06 = 600
      expect(result.pensionEmployeeContribution).toBe(600);

      // Study fund employee: 10000 * 0.025 = 250
      expect(result.studyFundEmployeeContribution).toBe(250);

      // Income tax calculation (on taxable = 10000 - 600 - 250 = 9150):
      // First bracket: 7010 * 0.10 = 701
      // Second bracket: (9150 - 7010) * 0.14 = 2140 * 0.14 = 299.6
      // Total: 701 + 299.6 = 1000.6
      expect(result.incomeTax).toBe(1000.6);

      // National Insurance (progressive): 
      // Bracket 1: 7703 * 1.04% = 80.11
      // Bracket 2: (10000 - 7703) * 7.00% = 2297 * 7.00% = 160.79
      // Total: 80.11 + 160.79 = 240.90
      expect(result.nationalInsurance).toBe(240.9);

      // Health Insurance (progressive):
      // Bracket 1: 7703 * 3.23% = 248.81
      // Bracket 2: (10000 - 7703) * 5.17% = 2297 * 5.17% = 118.75
      // Total: 248.81 + 118.75 = 367.56
      expect(result.healthInsurance).toBe(367.56);

      // Pension employer: 10000 * 0.065 = 650
      expect(result.pensionEmployerContribution).toBe(650);

      // Study fund employer: 10000 * 0.075 = 750
      expect(result.studyFundEmployerContribution).toBe(750);

      // Net income: 10000 - 1000.6 - 240.9 - 367.56 - 600 - 250 = 7540.94
      expect(result.netIncome).toBe(7540.94);
    });

    it('should calculate correctly for salary of ₪50,000 (above all ceilings)', () => {
      const components: SalaryComponents = {
        baseSalary: 50000,
      };

      const result = calculator.calculateNetIncome(components, 0);

      // Gross salary
      expect(result.grossSalary).toBe(50000);

      // Pension employee: 50000 * 0.06 = 3000
      expect(result.pensionEmployeeContribution).toBe(3000);

      // Study fund employee: 50000 * 0.025 = 1250
      expect(result.studyFundEmployeeContribution).toBe(1250);

      // Income tax calculation (on taxable = 50000 - 3000 - 1250 = 45750):
      // Bracket 1: 7010 * 0.10 = 701
      // Bracket 2: (10060 - 7010) * 0.14 = 3050 * 0.14 = 427
      // Bracket 3: (16150 - 10060) * 0.20 = 6090 * 0.20 = 1218
      // Bracket 4: (22440 - 16150) * 0.31 = 6290 * 0.31 = 1949.9
      // Bracket 5: (45750 - 22440) * 0.35 = 23310 * 0.35 = 8158.5
      // Total: 701 + 427 + 1218 + 1949.9 + 8158.5 = 12454.4
      expect(result.incomeTax).toBe(12454.4);

      // National Insurance (progressive, capped at 51910):
      // Bracket 1: 7703 * 1.04% = 80.11
      // Bracket 2: (50000 - 7703) * 7.00% = 42297 * 7.00% = 2960.79
      // Total: 80.11 + 2960.79 = 3040.90
      expect(result.nationalInsurance).toBe(3040.9);

      // Health Insurance (progressive, capped at 51910):
      // Bracket 1: 7703 * 3.23% = 248.81
      // Bracket 2: (50000 - 7703) * 5.17% = 42297 * 5.17% = 2186.75
      // Total: 248.81 + 2186.75 = 2435.56
      expect(result.healthInsurance).toBe(2435.56);

      // Pension employer: 50000 * 0.065 = 3250
      expect(result.pensionEmployerContribution).toBe(3250);

      // Study fund employer: 50000 * 0.075 = 3750
      expect(result.studyFundEmployerContribution).toBe(3750);

      // Net income: 50000 - 12454.4 - 3040.9 - 2435.56 - 3000 - 1250 = 27819.14
      expect(result.netIncome).toBe(27819.14);
    });

    it('should apply National Insurance ceiling correctly', () => {
      const components: SalaryComponents = {
        baseSalary: 60000,
      };

      const result = calculator.calculateNetIncome(components);

      // National Insurance (progressive, capped at 51910):
      // Bracket 1: 7703 * 1.04% = 80.11
      // Bracket 2: (51910 - 7703) * 7.00% = 44207 * 7.00% = 3094.49
      // Total: 80.11 + 3094.49 = 3174.60
      expect(result.nationalInsurance).toBe(3174.6);
    });

    it('should apply Health Insurance ceiling correctly', () => {
      const components: SalaryComponents = {
        baseSalary: 60000,
      };

      const result = calculator.calculateNetIncome(components);

      // Health Insurance (progressive, capped at 51910):
      // Bracket 1: 7703 * 3.23% = 248.81
      // Bracket 2: (51910 - 7703) * 5.17% = 44207 * 5.17% = 2285.50
      // Total: 248.81 + 2285.50 = 2534.31
      expect(result.healthInsurance).toBe(2534.31);
    });

    it('should calculate gross salary from all components (excluding stockValue)', () => {
      const components: SalaryComponents = {
        baseSalary: 10000,
        bonus: 2000,
        stockValue: 1500,
        mealVouchers: 500,
        otherCompensation: 1000,
      };

      const result = calculator.calculateNetIncome(components);

      // Gross: 10000 + 2000 + 500 + 1000 = 13500 (stockValue excluded)
      expect(result.grossSalary).toBe(13500);
      expect(result.salaryComponents).toEqual(components);
    });

    it('should handle optional salary components', () => {
      const components: SalaryComponents = {
        baseSalary: 8000,
        bonus: 1000,
        // stockValue, mealVouchers, otherCompensation omitted
      };

      const result = calculator.calculateNetIncome(components);

      // Gross: 8000 + 1000 = 9000
      expect(result.grossSalary).toBe(9000);
    });

    it('should maintain 2 decimal places precision for all monetary values', () => {
      const components: SalaryComponents = {
        baseSalary: 7777.77,
      };

      const result = calculator.calculateNetIncome(components);

      // Check all values have at most 2 decimal places
      expect(result.grossSalary.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
      expect(result.incomeTax.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
      expect(result.nationalInsurance.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
      expect(result.healthInsurance.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
      expect(result.pensionEmployeeContribution.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
      expect(result.pensionEmployerContribution.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
      expect(result.studyFundEmployeeContribution.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
      expect(result.studyFundEmployerContribution.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
      expect(result.netIncome.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
    });

    it('should include all required fields in tax breakdown', () => {
      const components: SalaryComponents = {
        baseSalary: 10000,
      };

      const result = calculator.calculateNetIncome(components);

      // Verify all required fields are present
      expect(result).toHaveProperty('salaryComponents');
      expect(result).toHaveProperty('grossSalary');
      expect(result).toHaveProperty('incomeTax');
      expect(result).toHaveProperty('nationalInsurance');
      expect(result).toHaveProperty('healthInsurance');
      expect(result).toHaveProperty('pensionEmployeeContribution');
      expect(result).toHaveProperty('pensionEmployerContribution');
      expect(result).toHaveProperty('studyFundEmployeeContribution');
      expect(result).toHaveProperty('studyFundEmployerContribution');
      expect(result).toHaveProperty('netIncome');
    });
  });
});

  describe('Property-Based Tests', () => {
    describe('Property 2: Gross Salary Calculation', () => {
      it('should calculate gross salary as sum of all salary components excluding stockValue', () => {
        /**
         * **Validates: Requirements 1.6, 2.4**
         * 
         * Property: For any set of salary components, the calculated gross salary 
         * should equal the sum of all provided component values EXCLUDING stockValue
         * (baseSalary + bonus + mealVouchers + otherCompensation + directPensionContribution).
         * stockValue is stored as an investment entry, not part of salary.
         */
        const calculator = new TaxCalculator();
        
        fc.assert(
          fc.property(
            // Generate arbitrary salary components with positive values
            // Using integers divided by 100 to create monetary values with 2 decimal places
            fc.record({
              baseSalary: fc.integer({ min: 1, max: 10000000 }).map(n => n / 100),
              bonus: fc.option(fc.integer({ min: 1, max: 5000000 }).map(n => n / 100), { nil: undefined }),
              stockValue: fc.option(fc.integer({ min: 1, max: 5000000 }).map(n => n / 100), { nil: undefined }),
              mealVouchers: fc.option(fc.integer({ min: 1, max: 500000 }).map(n => n / 100), { nil: undefined }),
              otherCompensation: fc.option(fc.integer({ min: 1, max: 2000000 }).map(n => n / 100), { nil: undefined }),
            }),
            (components: SalaryComponents) => {
              const result = calculator.calculateNetIncome(components);
              
              // Calculate expected gross salary manually — stockValue is EXCLUDED
              const expectedGross = 
                components.baseSalary +
                (components.bonus || 0) +
                (components.mealVouchers || 0) +
                (components.otherCompensation || 0);
              
              // Round to 2 decimal places for comparison (matching TaxCalculator behavior)
              const expectedGrossRounded = Math.round(expectedGross * 100) / 100;
              
              // Verify gross salary equals sum of all components excluding stockValue
              expect(result.grossSalary).toBe(expectedGrossRounded);
            }
          ),
          { numRuns: 100 } // Run 100 iterations as specified in design
        );
      });
    });

    describe('Property 5: Net Income Calculation Invariant', () => {
      it('should calculate net income as cash income minus all employee deductions', () => {
        /**
         * **Validates: Requirements 2.6**
         * 
         * Property: For any salary components, the calculated net income should always 
         * equal the cash income (gross minus meal vouchers) minus the sum of all employee 
         * deductions (income tax + national insurance + health insurance + pension employee 
         * contribution + study fund employee contribution).
         */
        const calculator = new TaxCalculator();
        
        fc.assert(
          fc.property(
            // Generate arbitrary salary components with positive values
            // Using integers divided by 100 to create monetary values with 2 decimal places
            fc.record({
              baseSalary: fc.integer({ min: 1, max: 10000000 }).map(n => n / 100),
              bonus: fc.option(fc.integer({ min: 1, max: 5000000 }).map(n => n / 100), { nil: undefined }),
              stockValue: fc.option(fc.integer({ min: 1, max: 5000000 }).map(n => n / 100), { nil: undefined }),
              mealVouchers: fc.option(fc.integer({ min: 1, max: 500000 }).map(n => n / 100), { nil: undefined }),
              otherCompensation: fc.option(fc.integer({ min: 1, max: 2000000 }).map(n => n / 100), { nil: undefined }),
            }),
            (components: SalaryComponents) => {
              const result = calculator.calculateNetIncome(components);
              
              // Calculate expected net income: cash income minus all employee deductions
              const expectedNetIncome = 
                result.cashIncome 
                - result.incomeTax 
                - result.nationalInsurance 
                - result.healthInsurance 
                - result.pensionEmployeeContribution 
                - result.studyFundEmployeeContribution;
              
              // Round to 2 decimal places for comparison (matching TaxCalculator behavior)
              const expectedNetIncomeRounded = Math.round(expectedNetIncome * 100) / 100;
              
              // Verify net income equals cash income minus all employee deductions
              // Note: Employer contributions (pension and study fund) should NOT be deducted
              // Allow for 0.05 difference due to floating-point rounding in intermediate calculations
              const difference = Math.abs(result.netIncome - expectedNetIncomeRounded);
              expect(difference).toBeLessThan(0.05);
            }
          ),
          { numRuns: 100 } // Run 100 iterations as specified in design
        );
      });
    });

    describe('Property 6: Pension Contribution Calculation', () => {
      it('should calculate pension contributions as exactly 6% employee and 6.5% employer of BASE SALARY', () => {
        /**
         * **Validates: Requirements 2.2**
         * 
         * Property: For any salary components, the employee pension contribution 
         * should equal exactly 6% of the BASE SALARY (baseSalary × 0.06), and 
         * the employer pension contribution should equal exactly 6.5% of the BASE 
         * SALARY (baseSalary × 0.065). Pension is NOT calculated on bonus, meal vouchers, or other compensation.
         */
        const calculator = new TaxCalculator();
        
        fc.assert(
          fc.property(
            // Generate arbitrary salary components with positive values
            // Using integers divided by 100 to create monetary values with 2 decimal places
            fc.record({
              baseSalary: fc.integer({ min: 1, max: 10000000 }).map(n => n / 100),
              bonus: fc.option(fc.integer({ min: 1, max: 5000000 }).map(n => n / 100), { nil: undefined }),
              stockValue: fc.option(fc.integer({ min: 1, max: 5000000 }).map(n => n / 100), { nil: undefined }),
              mealVouchers: fc.option(fc.integer({ min: 1, max: 500000 }).map(n => n / 100), { nil: undefined }),
              otherCompensation: fc.option(fc.integer({ min: 1, max: 2000000 }).map(n => n / 100), { nil: undefined }),
            }),
            (components: SalaryComponents) => {
              const result = calculator.calculateNetIncome(components);
              
              // Calculate expected pension contributions based on BASE SALARY only
              const expectedEmployeeContribution = components.baseSalary * 0.06;
              const expectedEmployerContribution = components.baseSalary * 0.065;
              
              // Round to 2 decimal places for comparison (matching TaxCalculator behavior)
              const expectedEmployeeRounded = Math.round(expectedEmployeeContribution * 100) / 100;
              const expectedEmployerRounded = Math.round(expectedEmployerContribution * 100) / 100;
              
              // Verify employee pension contribution is exactly 6% of BASE salary
              // Allow for 0.02 difference due to floating-point rounding (0.01 cent tolerance)
              expect(Math.abs(result.pensionEmployeeContribution - expectedEmployeeRounded)).toBeLessThan(0.02);
              
              // Verify employer pension contribution is exactly 6.5% of BASE salary
              // Allow for 0.02 difference due to floating-point rounding (0.01 cent tolerance)
              expect(Math.abs(result.pensionEmployerContribution - expectedEmployerRounded)).toBeLessThan(0.02);
            }
          ),
          { numRuns: 100 } // Run 100 iterations as specified in design
        );
      });
    });

    describe('Property 7: Study Fund Contribution Calculation', () => {
      it('should calculate study fund contributions as exactly 2.5% employee and 7.5% employer of BASE SALARY', () => {
        /**
         * **Validates: Requirements 2.3**
         * 
         * Property: For any salary components, the employee study fund contribution 
         * should equal exactly 2.5% of the BASE SALARY (baseSalary × 0.025), and 
         * the employer study fund contribution should equal exactly 7.5% of the BASE 
         * SALARY (baseSalary × 0.075). Study fund is NOT calculated on bonus, meal vouchers, or other compensation.
         */
        const calculator = new TaxCalculator();
        
        fc.assert(
          fc.property(
            // Generate arbitrary salary components with positive values
            // Using integers divided by 100 to create monetary values with 2 decimal places
            fc.record({
              baseSalary: fc.integer({ min: 1, max: 10000000 }).map(n => n / 100),
              bonus: fc.option(fc.integer({ min: 1, max: 5000000 }).map(n => n / 100), { nil: undefined }),
              stockValue: fc.option(fc.integer({ min: 1, max: 5000000 }).map(n => n / 100), { nil: undefined }),
              mealVouchers: fc.option(fc.integer({ min: 1, max: 500000 }).map(n => n / 100), { nil: undefined }),
              otherCompensation: fc.option(fc.integer({ min: 1, max: 2000000 }).map(n => n / 100), { nil: undefined }),
            }),
            (components: SalaryComponents) => {
              const result = calculator.calculateNetIncome(components);
              
              // Calculate expected study fund contributions based on BASE SALARY only
              const expectedEmployeeContribution = components.baseSalary * 0.025;
              const expectedEmployerContribution = components.baseSalary * 0.075;
              
              // Round to 2 decimal places for comparison (matching TaxCalculator behavior)
              const expectedEmployeeRounded = Math.round(expectedEmployeeContribution * 100) / 100;
              const expectedEmployerRounded = Math.round(expectedEmployerContribution * 100) / 100;
              
              // Verify employee study fund contribution is exactly 2.5% of BASE salary
              // Allow for 0.02 difference due to floating-point rounding (0.01 cent tolerance)
              expect(Math.abs(result.studyFundEmployeeContribution - expectedEmployeeRounded)).toBeLessThan(0.02);
              
              // Verify employer study fund contribution is exactly 7.5% of BASE salary
              // Allow for 0.02 difference due to floating-point rounding (0.01 cent tolerance)
              expect(Math.abs(result.studyFundEmployerContribution - expectedEmployerRounded)).toBeLessThan(0.02);
            }
          ),
          { numRuns: 100 } // Run 100 iterations as specified in design
        );
      });
    });

    describe('Property 8: Tax Breakdown Completeness', () => {
      it('should return tax breakdown with all required fields present and valid', () => {
        /**
         * **Validates: Requirements 2.7, 2.8**
         * 
         * Property: For any tax calculation result, the breakdown should contain 
         * all required deduction types: income tax, national insurance, health insurance, 
         * pension contributions (employee and employer), study fund contributions 
         * (employee and employer), and net income. All values should be non-negative numbers.
         */
        const calculator = new TaxCalculator();
        
        fc.assert(
          fc.property(
            // Generate arbitrary salary components with positive values
            // Using integers divided by 100 to create monetary values with 2 decimal places
            fc.record({
              baseSalary: fc.integer({ min: 1, max: 10000000 }).map(n => n / 100),
              bonus: fc.option(fc.integer({ min: 1, max: 5000000 }).map(n => n / 100), { nil: undefined }),
              stockValue: fc.option(fc.integer({ min: 1, max: 5000000 }).map(n => n / 100), { nil: undefined }),
              mealVouchers: fc.option(fc.integer({ min: 1, max: 500000 }).map(n => n / 100), { nil: undefined }),
              otherCompensation: fc.option(fc.integer({ min: 1, max: 2000000 }).map(n => n / 100), { nil: undefined }),
            }),
            (components: SalaryComponents) => {
              const result = calculator.calculateNetIncome(components);
              
              // Verify all required fields are present
              expect(result).toHaveProperty('salaryComponents');
              expect(result).toHaveProperty('grossSalary');
              expect(result).toHaveProperty('incomeTax');
              expect(result).toHaveProperty('nationalInsurance');
              expect(result).toHaveProperty('healthInsurance');
              expect(result).toHaveProperty('pensionEmployeeContribution');
              expect(result).toHaveProperty('pensionEmployerContribution');
              expect(result).toHaveProperty('studyFundEmployeeContribution');
              expect(result).toHaveProperty('studyFundEmployerContribution');
              expect(result).toHaveProperty('netIncome');
              
              // Verify all monetary values are numbers
              expect(typeof result.grossSalary).toBe('number');
              expect(typeof result.incomeTax).toBe('number');
              expect(typeof result.nationalInsurance).toBe('number');
              expect(typeof result.healthInsurance).toBe('number');
              expect(typeof result.pensionEmployeeContribution).toBe('number');
              expect(typeof result.pensionEmployerContribution).toBe('number');
              expect(typeof result.studyFundEmployeeContribution).toBe('number');
              expect(typeof result.studyFundEmployerContribution).toBe('number');
              expect(typeof result.netIncome).toBe('number');
              
              // Verify all monetary values are non-negative (>= 0)
              // Note: Net income can be negative if deductions exceed cash income
              expect(result.grossSalary).toBeGreaterThanOrEqual(0);
              expect(result.incomeTax).toBeGreaterThanOrEqual(0);
              expect(result.nationalInsurance).toBeGreaterThanOrEqual(0);
              expect(result.healthInsurance).toBeGreaterThanOrEqual(0);
              expect(result.pensionEmployeeContribution).toBeGreaterThanOrEqual(0);
              expect(result.pensionEmployerContribution).toBeGreaterThanOrEqual(0);
              expect(result.studyFundEmployeeContribution).toBeGreaterThanOrEqual(0);
              expect(result.studyFundEmployerContribution).toBeGreaterThanOrEqual(0);
              // Net income can be negative, so we don't check it
              
              // Verify all monetary values are finite (not NaN or Infinity)
              expect(Number.isFinite(result.grossSalary)).toBe(true);
              expect(Number.isFinite(result.incomeTax)).toBe(true);
              expect(Number.isFinite(result.nationalInsurance)).toBe(true);
              expect(Number.isFinite(result.healthInsurance)).toBe(true);
              expect(Number.isFinite(result.pensionEmployeeContribution)).toBe(true);
              expect(Number.isFinite(result.pensionEmployerContribution)).toBe(true);
              expect(Number.isFinite(result.studyFundEmployeeContribution)).toBe(true);
              expect(Number.isFinite(result.studyFundEmployerContribution)).toBe(true);
              expect(Number.isFinite(result.netIncome)).toBe(true);
              
              // Verify salaryComponents is preserved in the result
              expect(result.salaryComponents).toEqual(components);
            }
          ),
          { numRuns: 100 } // Run 100 iterations as specified in design
        );
      });
    });
  });
