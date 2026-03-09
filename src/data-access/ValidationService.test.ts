import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { DefaultValidationService } from './ValidationService';
import { SalaryComponents, ExpenseInput, Expense } from '../domain/types';

describe('DefaultValidationService', () => {
  const service = new DefaultValidationService();

  describe('validateSalaryComponents', () => {
    it('should accept valid positive salary components', () => {
      const components: SalaryComponents = {
        baseSalary: 10000,
        bonus: 2000,
        stockValue: 5000,
        mealVouchers: 500,
        otherCompensation: 1000
      };

      const result = service.validateSalaryComponents(components);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept valid salary with only base salary', () => {
      const components: SalaryComponents = {
        baseSalary: 10000
      };

      const result = service.validateSalaryComponents(components);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject negative base salary', () => {
      const components: SalaryComponents = {
        baseSalary: -1000
      };

      const result = service.validateSalaryComponents(components);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('משכורת בסיס לא יכולה להיות שלילית');
    });

    it('should reject negative bonus', () => {
      const components: SalaryComponents = {
        baseSalary: 10000,
        bonus: -500
      };

      const result = service.validateSalaryComponents(components);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('בונוס לא יכול להיות שלילי');
    });

    it('should reject negative stock value', () => {
      const components: SalaryComponents = {
        baseSalary: 10000,
        stockValue: -1000
      };

      const result = service.validateSalaryComponents(components);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('ערך מניות/אופציות לא יכול להיות שלילי');
    });

    it('should reject negative meal vouchers', () => {
      const components: SalaryComponents = {
        baseSalary: 10000,
        mealVouchers: -100
      };

      const result = service.validateSalaryComponents(components);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('תלושי אוכל לא יכולים להיות שליליים');
    });

    it('should reject negative other compensation', () => {
      const components: SalaryComponents = {
        baseSalary: 10000,
        otherCompensation: -200
      };

      const result = service.validateSalaryComponents(components);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('רכיבי שכר נוספים לא יכולים להיות שליליים');
    });

    it('should reject when total gross salary is zero', () => {
      const components: SalaryComponents = {
        baseSalary: 0
      };

      const result = service.validateSalaryComponents(components);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('סך המשכורת הברוטו לא יכול להיות אפס');
    });

    it('should collect multiple errors', () => {
      const components: SalaryComponents = {
        baseSalary: -1000,
        bonus: -500,
        stockValue: -200
      };

      const result = service.validateSalaryComponents(components);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain('משכורת בסיס לא יכולה להיות שלילית');
      expect(result.errors).toContain('בונוס לא יכול להיות שלילי');
      expect(result.errors).toContain('ערך מניות/אופציות לא יכול להיות שלילי');
    });

    it('should accept zero for optional components', () => {
      const components: SalaryComponents = {
        baseSalary: 10000,
        bonus: 0,
        stockValue: 0,
        mealVouchers: 0,
        otherCompensation: 0
      };

      const result = service.validateSalaryComponents(components);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateExpense', () => {
    it('should accept valid expense', () => {
      const expense: ExpenseInput = {
        amount: 100,
        date: new Date(),
        category: 'Food',
        description: 'Groceries'
      };

      const result = service.validateExpense(expense);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject zero amount', () => {
      const expense: ExpenseInput = {
        amount: 0,
        date: new Date(),
        category: 'Food'
      };

      const result = service.validateExpense(expense);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('הסכום חייב להיות מספר חיובי גדול מאפס');
    });

    it('should reject negative amount', () => {
      const expense: ExpenseInput = {
        amount: -50,
        date: new Date(),
        category: 'Food'
      };

      const result = service.validateExpense(expense);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('הסכום חייב להיות מספר חיובי גדול מאפס');
    });

    it('should reject invalid date', () => {
      const expense: ExpenseInput = {
        amount: 100,
        date: new Date('invalid'),
        category: 'Food'
      };

      const result = service.validateExpense(expense);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('התאריך חייב להיות בפורמט תקין');
    });

    it('should reject date more than one day in the future', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);

      const expense: ExpenseInput = {
        amount: 100,
        date: futureDate,
        category: 'Food'
      };

      const result = service.validateExpense(expense);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('התאריך לא יכול להיות יותר מיום אחד בעתיד');
    });

    it('should accept expense without optional fields', () => {
      const expense: ExpenseInput = {
        amount: 100,
        date: new Date()
      };

      const result = service.validateExpense(expense);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateDate', () => {
    it('should accept current date', () => {
      const result = service.validateDate(new Date());
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);

      const result = service.validateDate(pastDate);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept date one day in the future', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const result = service.validateDate(tomorrow);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject date more than one day in the future', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);

      const result = service.validateDate(futureDate);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('התאריך לא יכול להיות יותר מיום אחד בעתיד');
    });

    it('should reject invalid date', () => {
      const invalidDate = new Date('invalid');

      const result = service.validateDate(invalidDate);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('התאריך חייב להיות בפורמט תקין');
    });
  });

  describe('checkDuplicate', () => {
    const existingExpenses: Expense[] = [
      {
        id: '1',
        amount: 100,
        date: new Date(2026, 0, 15),
        category: 'Food',
        description: 'Groceries',
        createdAt: new Date()
      },
      {
        id: '2',
        amount: 50,
        date: new Date(2026, 0, 16),
        category: 'Transport',
        description: 'Bus pass',
        createdAt: new Date()
      },
      {
        id: '3',
        amount: 100,
        date: new Date(2026, 0, 15),
        category: 'Food',
        description: null,
        createdAt: new Date()
      }
    ];

    it('should detect exact duplicate', () => {
      const newExpense: ExpenseInput = {
        amount: 100,
        date: new Date(2026, 0, 15),
        category: 'Food',
        description: 'Groceries'
      };

      const isDuplicate = service.checkDuplicate(newExpense, existingExpenses);
      expect(isDuplicate).toBe(true);
    });

    it('should not detect duplicate with different amount', () => {
      const newExpense: ExpenseInput = {
        amount: 101,
        date: new Date(2026, 0, 15),
        category: 'Food',
        description: 'Groceries'
      };

      const isDuplicate = service.checkDuplicate(newExpense, existingExpenses);
      expect(isDuplicate).toBe(false);
    });

    it('should not detect duplicate with different date', () => {
      const newExpense: ExpenseInput = {
        amount: 100,
        date: new Date(2026, 0, 16),
        category: 'Food',
        description: 'Groceries'
      };

      const isDuplicate = service.checkDuplicate(newExpense, existingExpenses);
      expect(isDuplicate).toBe(false);
    });

    it('should not detect duplicate with different description', () => {
      const newExpense: ExpenseInput = {
        amount: 100,
        date: new Date(2026, 0, 15),
        category: 'Food',
        description: 'Different description'
      };

      const isDuplicate = service.checkDuplicate(newExpense, existingExpenses);
      expect(isDuplicate).toBe(false);
    });

    it('should detect duplicate when both descriptions are null/undefined', () => {
      const newExpense: ExpenseInput = {
        amount: 100,
        date: new Date(2026, 0, 15),
        category: 'Food',
        description: undefined
      };

      const isDuplicate = service.checkDuplicate(newExpense, existingExpenses);
      expect(isDuplicate).toBe(true);
    });

    it('should detect duplicate when both descriptions are empty strings', () => {
      const newExpense: ExpenseInput = {
        amount: 100,
        date: new Date(2026, 0, 15),
        category: 'Food',
        description: ''
      };

      const isDuplicate = service.checkDuplicate(newExpense, existingExpenses);
      expect(isDuplicate).toBe(true);
    });

    it('should not detect duplicate in empty list', () => {
      const newExpense: ExpenseInput = {
        amount: 100,
        date: new Date(2026, 0, 15),
        category: 'Food',
        description: 'Groceries'
      };

      const isDuplicate = service.checkDuplicate(newExpense, []);
      expect(isDuplicate).toBe(false);
    });

    it('should ignore time component when comparing dates', () => {
      const newExpense: ExpenseInput = {
        amount: 100,
        date: new Date(2026, 0, 15, 14, 30, 0), // 2:30 PM
        category: 'Food',
        description: 'Groceries'
      };

      const isDuplicate = service.checkDuplicate(newExpense, existingExpenses);
      expect(isDuplicate).toBe(true);
    });
  });

  describe('Property-Based Tests', () => {
    describe('Property 1 & 3: Amount Validation', () => {
      it('should reject any negative salary component', () => {
        /**
         * **Validates: Requirements 1.8, 1.9, 9.1**
         * 
         * Property 1: Salary Component Validation
         * For any salary component, if the component value is negative,
         * then the system should reject the input and return a validation error.
         */
        fc.assert(
          fc.property(
            fc.double({ min: -1000000, max: -0.01, noNaN: true }),
            (negativeValue: number) => {
              const components: SalaryComponents = {
                baseSalary: negativeValue
              };

              const result = service.validateSalaryComponents(components);
              expect(result.isValid).toBe(false);
              expect(result.errors.length).toBeGreaterThan(0);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should reject any non-positive expense amount', () => {
        /**
         * **Validates: Requirements 3.2, 3.5, 9.1**
         * 
         * Property 3: Amount Validation
         * For any monetary amount input (expense), if the amount is less than or equal to zero,
         * then the system should reject the input and return a validation error.
         */
        fc.assert(
          fc.property(
            fc.double({ min: -1000000, max: 0, noNaN: true }),
            (nonPositiveAmount: number) => {
              const expense: ExpenseInput = {
                amount: nonPositiveAmount,
                date: new Date()
              };

              const result = service.validateExpense(expense);
              expect(result.isValid).toBe(false);
              expect(result.errors).toContain('הסכום חייב להיות מספר חיובי גדול מאפס');
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should accept any positive salary component', () => {
        /**
         * **Validates: Requirements 1.8, 9.1**
         * 
         * Property: For any positive salary component value,
         * the system should accept the input (assuming total is not zero).
         */
        fc.assert(
          fc.property(
            fc.double({ min: 0.01, max: 1000000, noNaN: true }),
            (positiveValue: number) => {
              const components: SalaryComponents = {
                baseSalary: positiveValue
              };

              const result = service.validateSalaryComponents(components);
              expect(result.isValid).toBe(true);
              expect(result.errors).toHaveLength(0);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should accept any positive expense amount with valid date', () => {
        /**
         * **Validates: Requirements 3.2, 9.1**
         * 
         * Property: For any positive expense amount with a valid date,
         * the system should accept the input.
         */
        fc.assert(
          fc.property(
            fc.double({ min: 0.01, max: 1000000, noNaN: true }),
            (positiveAmount: number) => {
              const expense: ExpenseInput = {
                amount: positiveAmount,
                date: new Date()
              };

              const result = service.validateExpense(expense);
              expect(result.isValid).toBe(true);
              expect(result.errors).toHaveLength(0);
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    describe('Property 11: Date Validation', () => {
      it('should reject any date more than one day in the future', () => {
        /**
         * **Validates: Requirements 3.3, 9.2**
         * 
         * Property 11: Date Validation
         * For any date input, if the date is more than one day in the future from the current date,
         * then the system should reject the input with a validation error.
         */
        fc.assert(
          fc.property(
            fc.integer({ min: 2, max: 365 }), // Days in the future (more than 1)
            (daysInFuture: number) => {
              const futureDate = new Date();
              futureDate.setDate(futureDate.getDate() + daysInFuture);

              const result = service.validateDate(futureDate);
              expect(result.isValid).toBe(false);
              expect(result.errors).toContain('התאריך לא יכול להיות יותר מיום אחד בעתיד');
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should accept any past date', () => {
        /**
         * **Validates: Requirements 3.3, 9.2**
         * 
         * Property: For any date in the past, the system should accept the input.
         */
        fc.assert(
          fc.property(
            fc.integer({ min: 1, max: 3650 }), // Days in the past (up to 10 years)
            (daysInPast: number) => {
              const pastDate = new Date();
              pastDate.setDate(pastDate.getDate() - daysInPast);

              const result = service.validateDate(pastDate);
              expect(result.isValid).toBe(true);
              expect(result.errors).toHaveLength(0);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should accept current date and tomorrow', () => {
        /**
         * **Validates: Requirements 3.3, 9.2**
         * 
         * Property: Current date and up to one day in the future should be accepted.
         */
        fc.assert(
          fc.property(
            fc.constantFrom(0, 1), // 0 = today, 1 = tomorrow
            (daysOffset: number) => {
              const date = new Date();
              date.setDate(date.getDate() + daysOffset);

              const result = service.validateDate(date);
              expect(result.isValid).toBe(true);
              expect(result.errors).toHaveLength(0);
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    describe('Property 25: Duplicate Detection', () => {
      it('should detect duplicates with same amount, date, and description', () => {
        /**
         * **Validates: Requirements 9.3**
         * 
         * Property 25: Duplicate Detection
         * For any new expense entry, if an existing expense has the same amount, date, and description,
         * then the system should detect this as a potential duplicate.
         */
        fc.assert(
          fc.property(
            fc.double({ min: 0.01, max: 10000, noNaN: true }),
            fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) }),
            fc.option(fc.string(), { nil: null }),
            (amount: number, date: Date, description: string | null) => {
              // Create an existing expense
              const existingExpense: Expense = {
                id: '1',
                amount,
                date,
                category: 'Test',
                description,
                createdAt: new Date()
              };

              // Create a new expense with the same data
              const newExpense: ExpenseInput = {
                amount,
                date: new Date(date), // Same date
                category: 'Test',
                description: description || undefined
              };

              const isDuplicate = service.checkDuplicate(newExpense, [existingExpense]);
              expect(isDuplicate).toBe(true);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should not detect duplicate when amount differs', () => {
        /**
         * **Validates: Requirements 9.3**
         * 
         * Property: Expenses with different amounts should not be considered duplicates.
         */
        fc.assert(
          fc.property(
            fc.double({ min: 0.01, max: 10000, noNaN: true }),
            fc.double({ min: 0.01, max: 10000, noNaN: true }),
            fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) }),
            fc.option(fc.string(), { nil: null }),
            (amount1: number, amount2: number, date: Date, description: string | null) => {
              // Skip if amounts are the same
              fc.pre(amount1 !== amount2);

              const existingExpense: Expense = {
                id: '1',
                amount: amount1,
                date,
                category: 'Test',
                description,
                createdAt: new Date()
              };

              const newExpense: ExpenseInput = {
                amount: amount2,
                date: new Date(date),
                category: 'Test',
                description: description || undefined
              };

              const isDuplicate = service.checkDuplicate(newExpense, [existingExpense]);
              expect(isDuplicate).toBe(false);
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    describe('Error Messages in Hebrew', () => {
      it('should return Hebrew error messages for all validation failures', () => {
        /**
         * **Validates: Requirements 10.4**
         * 
         * Property: All error messages should be in Hebrew (contain Hebrew characters).
         */
        const hebrewCharacterRegex = /[\u0590-\u05FF]/;

        fc.assert(
          fc.property(
            fc.oneof(
              // Generate invalid salary components
              fc.record({
                baseSalary: fc.double({ min: -1000, max: -0.01, noNaN: true })
              }),
              // Generate invalid expenses
              fc.record({
                amount: fc.double({ min: -1000, max: 0, noNaN: true }),
                date: fc.constant(new Date())
              })
            ),
            (invalidInput: any) => {
              let result;
              
              if ('baseSalary' in invalidInput) {
                result = service.validateSalaryComponents(invalidInput as SalaryComponents);
              } else {
                result = service.validateExpense(invalidInput as ExpenseInput);
              }

              // Verify that errors exist and all contain Hebrew characters
              expect(result.isValid).toBe(false);
              expect(result.errors.length).toBeGreaterThan(0);
              
              result.errors.forEach(error => {
                expect(hebrewCharacterRegex.test(error)).toBe(true);
              });
            }
          ),
          { numRuns: 100 }
        );
      });
    });
  });
});
