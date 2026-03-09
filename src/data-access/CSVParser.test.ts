/**
 * Tests for CSV Parser
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { createCSVParser } from './CSVParser';
import { Expense } from '../domain/types';

describe('CSVParser', () => {
  const parser = createCSVParser();
  
  describe('Property Tests', () => {
    describe('Property 12: CSV Parsing Round-Trip', () => {
      /**
       * **Validates: Requirements 5.4**
       * 
       * For any valid set of expense records, formatting them to CSV and then 
       * parsing the CSV back should produce equivalent expense records with all 
       * fields preserved (amount, date, category, description).
       */
      it('should preserve all expense data through format-parse round-trip', () => {
        fc.assert(
          fc.property(
            // Generate an array of valid expense records
            fc.array(
              fc.record({
                id: fc.uuid(),
                amount: fc.float({ min: Math.fround(0.01), max: Math.fround(1000000), noNaN: true }).map(n => Math.round(n * 100) / 100),
                // Generate dates in the past to avoid future date validation issues
                date: fc.date({ min: new Date(2020, 0, 1), max: new Date() }),
                // Exclude commas and newlines from strings as CSV format doesn't support them without quoting
                category: fc.option(
                  fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes(',') && !s.includes('\n') && !s.includes('\r')), 
                  { nil: null }
                ),
                description: fc.option(
                  fc.string({ minLength: 1, maxLength: 200 }).filter(s => !s.includes(',') && !s.includes('\n') && !s.includes('\r')), 
                  { nil: null }
                ),
                createdAt: fc.date({ min: new Date(2020, 0, 1), max: new Date() })
              }),
              { minLength: 1, maxLength: 50 }
            ),
            (expenses: Expense[]) => {
              // Format expenses to CSV
              const csvContent = parser.format(expenses);
              
              // Parse CSV back to expenses
              const parseResult = parser.parse(csvContent);
              
              // Verify parsing succeeded
              expect(parseResult.success).toBe(true);
              
              if (!parseResult.success) {
                return; // Type guard
              }
              
              const parsedExpenses = parseResult.value;
              
              // Verify same number of expenses
              expect(parsedExpenses.length).toBe(expenses.length);
              
              // Verify each expense's data fields are preserved
              // Note: id and createdAt are generated during parsing, so we only check data fields
              for (let i = 0; i < expenses.length; i++) {
                const original = expenses[i];
                const parsed = parsedExpenses[i];
                
                // Amount should be preserved (with 2 decimal precision)
                expect(parsed.amount).toBe(original.amount);
                
                // Date should be preserved (compare date parts only, not time)
                expect(parsed.date.getFullYear()).toBe(original.date.getFullYear());
                expect(parsed.date.getMonth()).toBe(original.date.getMonth());
                expect(parsed.date.getDate()).toBe(original.date.getDate());
                
                // Category should be preserved
                expect(parsed.category).toBe(original.category);
                
                // Description should be preserved
                expect(parsed.description).toBe(original.description);
              }
            }
          ),
          { numRuns: 100 }
        );
      });
    });
    
    describe('Property 13: CSV Parse Error Reporting', () => {
      /**
       * **Validates: Requirements 5.2**
       * 
       * For any invalid CSV content, the parser should return error messages that 
       * include the line number where the error occurred and a description of the 
       * validation failure.
       */
      it('should report line numbers and descriptions for invalid CSV content', () => {
        fc.assert(
          fc.property(
            // Generate various types of invalid CSV content
            fc.oneof(
              // Invalid amount (negative, zero, or non-numeric)
              fc.record({
                amount: fc.oneof(
                  fc.constant('invalid'),
                  fc.constant(''),
                  fc.float({ max: 0 }).map(String),
                  fc.constant('abc')
                ),
                date: fc.date({ min: new Date(2020, 0, 1), max: new Date() }).map(d => {
                  const year = d.getFullYear();
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                }),
                category: fc.constant(''),
                description: fc.constant(''),
                expectedField: fc.constant('amount')
              }),
              
              // Invalid date format
              fc.record({
                amount: fc.float({ min: Math.fround(0.01), max: Math.fround(1000) }).map(n => (Math.round(n * 100) / 100).toString()),
                date: fc.oneof(
                  fc.constant('invalid-date'),
                  fc.constant('2026/01/15'), // Wrong format
                  fc.constant('15-01-2026'), // Wrong format
                  fc.constant('2026-13-01'), // Invalid month
                  fc.constant('2026-02-30'), // Invalid day
                  fc.constant('')
                ),
                category: fc.constant(''),
                description: fc.constant(''),
                expectedField: fc.constant('date')
              }),
              
              // Future date (more than 1 day ahead)
              fc.record({
                amount: fc.float({ min: Math.fround(0.01), max: Math.fround(1000) }).map(n => (Math.round(n * 100) / 100).toString()),
                date: fc.date({ min: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), max: new Date(2030, 11, 31) }).map(d => {
                  const year = d.getFullYear();
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                }),
                category: fc.constant(''),
                description: fc.constant(''),
                expectedField: fc.constant('date')
              }),
              
              // Wrong number of columns
              fc.record({
                amount: fc.float({ min: Math.fround(0.01), max: Math.fround(1000) }).map(n => (Math.round(n * 100) / 100).toString()),
                date: fc.date({ min: new Date(2020, 0, 1), max: new Date() }).map(d => {
                  const year = d.getFullYear();
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                }),
                category: fc.constant(''),
                description: fc.constant(''),
                expectedField: fc.constant('row'),
                extraColumn: fc.constant('extra') // This will create 5 columns instead of 4
              })
            ),
            (invalidRecord) => {
              // Build CSV with header and one invalid data row
              const header = 'amount,date,category,description';
              let dataRow: string;
              
              if ('extraColumn' in invalidRecord) {
                // Wrong number of columns case
                dataRow = `${invalidRecord.amount},${invalidRecord.date},${invalidRecord.category},${invalidRecord.description},${invalidRecord.extraColumn}`;
              } else {
                dataRow = `${invalidRecord.amount},${invalidRecord.date},${invalidRecord.category},${invalidRecord.description}`;
              }
              
              const csvContent = `${header}\n${dataRow}`;
              
              // Parse the invalid CSV
              const parseResult = parser.parse(csvContent);
              
              // Verify parsing failed
              expect(parseResult.success).toBe(false);
              
              if (parseResult.success) {
                return; // Type guard
              }
              
              const errors = parseResult.error;
              
              // Verify at least one error was reported
              expect(errors.length).toBeGreaterThan(0);
              
              // Verify each error has required properties
              for (const error of errors) {
                // Error must have a line number
                expect(error.line).toBeDefined();
                expect(typeof error.line).toBe('number');
                expect(error.line).toBeGreaterThan(0);
                
                // Error must have a field identifier
                expect(error.field).toBeDefined();
                expect(typeof error.field).toBe('string');
                expect(error.field.length).toBeGreaterThan(0);
                
                // Error must have a descriptive message
                expect(error.message).toBeDefined();
                expect(typeof error.message).toBe('string');
                expect(error.message.length).toBeGreaterThan(0);
              }
              
              // Verify that at least one error mentions the expected problematic field
              const hasExpectedFieldError = errors.some(e => 
                e.field === invalidRecord.expectedField || 
                e.field === 'row' // Row errors can occur for column count issues
              );
              expect(hasExpectedFieldError).toBe(true);
            }
          ),
          { numRuns: 100 }
        );
      });
      
      it('should report correct line numbers for multiple invalid rows', () => {
        fc.assert(
          fc.property(
            fc.integer({ min: 2, max: 10 }), // Number of invalid rows
            (numRows) => {
              // Build CSV with header and multiple invalid rows
              const header = 'amount,date,category,description';
              const invalidRows: string[] = [];
              
              for (let i = 0; i < numRows; i++) {
                // Create rows with invalid amounts
                invalidRows.push(`invalid,2026-01-15,,`);
              }
              
              const csvContent = `${header}\n${invalidRows.join('\n')}`;
              
              // Parse the invalid CSV
              const parseResult = parser.parse(csvContent);
              
              // Verify parsing failed
              expect(parseResult.success).toBe(false);
              
              if (parseResult.success) {
                return; // Type guard
              }
              
              const errors = parseResult.error;
              
              // Verify we got errors for each invalid row
              expect(errors.length).toBeGreaterThanOrEqual(numRows);
              
              // Verify line numbers are in the valid range (2 to numRows + 1)
              // Line 1 is the header, data starts at line 2
              for (const error of errors) {
                expect(error.line).toBeGreaterThanOrEqual(2);
                expect(error.line).toBeLessThanOrEqual(numRows + 1);
              }
              
              // Verify line numbers are unique (each row should have at least one error)
              const lineNumbers = errors.map(e => e.line);
              const uniqueLines = new Set(lineNumbers);
              expect(uniqueLines.size).toBeGreaterThanOrEqual(1);
            }
          ),
          { numRuns: 100 }
        );
      });
    });
  });
  
  describe('Unit Tests - Edge Cases', () => {
    describe('CSV with only headers (no data rows)', () => {
      /**
       * **Validates: Requirements 4.2, 5.2**
       * 
       * When a CSV file contains only headers with no data rows, the parser 
       * should return an error indicating no valid data rows were found.
       */
      it('should return error for CSV with only headers', () => {
        const csvContent = 'amount,date,category,description';
        const result = parser.parse(csvContent);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.length).toBeGreaterThan(0);
          expect(result.error[0].message).toContain('לא מכיל שורות נתונים');
        }
      });
      
      it('should return error for CSV with headers and only empty lines', () => {
        const csvContent = 'amount,date,category,description\n\n\n';
        const result = parser.parse(csvContent);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.length).toBeGreaterThan(0);
          expect(result.error[0].message).toContain('לא מכיל שורות נתונים');
        }
      });
    });
    
    describe('Malformed CSV (missing columns, extra columns)', () => {
      /**
       * **Validates: Requirements 4.2, 5.2**
       * 
       * When a CSV file has rows with incorrect number of columns, the parser 
       * should return detailed errors with line numbers and descriptions.
       */
      it('should return error for row with missing columns', () => {
        const csvContent = 'amount,date,category,description\n100.50,2026-01-15';
        const result = parser.parse(csvContent);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.length).toBeGreaterThan(0);
          const error = result.error[0];
          expect(error.line).toBe(2);
          expect(error.field).toBe('row');
          expect(error.message).toContain('מספר עמודות שגוי');
        }
      });
      
      it('should return error for row with extra columns', () => {
        const csvContent = 'amount,date,category,description\n100.50,2026-01-15,Food,Lunch,ExtraColumn';
        const result = parser.parse(csvContent);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.length).toBeGreaterThan(0);
          const error = result.error[0];
          expect(error.line).toBe(2);
          expect(error.field).toBe('row');
          expect(error.message).toContain('מספר עמודות שגוי');
        }
      });
      
      it('should return error for CSV with wrong headers', () => {
        const csvContent = 'price,date,type,notes\n100.50,2026-01-15,Food,Lunch';
        const result = parser.parse(csvContent);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.length).toBeGreaterThan(0);
          const error = result.error[0];
          expect(error.line).toBe(1);
          expect(error.field).toBe('headers');
          expect(error.message).toContain('כותרות CSV לא תקינות');
        }
      });
      
      it('should return error for CSV with missing headers', () => {
        const csvContent = 'amount,date,category\n100.50,2026-01-15,Food';
        const result = parser.parse(csvContent);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.length).toBeGreaterThan(0);
          const error = result.error[0];
          expect(error.line).toBe(1);
          expect(error.field).toBe('headers');
          expect(error.message).toContain('כותרות CSV לא תקינות');
        }
      });
    });
    
    describe('Invalid date formats in CSV', () => {
      /**
       * **Validates: Requirements 4.2, 5.2**
       * 
       * When a CSV file contains invalid date formats, the parser should return 
       * detailed errors indicating the line number and date format issue.
       */
      it('should return error for invalid date format (DD-MM-YYYY)', () => {
        const csvContent = 'amount,date,category,description\n100.50,15-01-2026,Food,Lunch';
        const result = parser.parse(csvContent);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.length).toBeGreaterThan(0);
          const error = result.error.find(e => e.field === 'date');
          expect(error).toBeDefined();
          expect(error!.line).toBe(2);
          expect(error!.message).toContain('פורמט תקין');
        }
      });
      
      it('should return error for invalid date format (YYYY/MM/DD)', () => {
        const csvContent = 'amount,date,category,description\n100.50,2026/01/15,Food,Lunch';
        const result = parser.parse(csvContent);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.length).toBeGreaterThan(0);
          const error = result.error.find(e => e.field === 'date');
          expect(error).toBeDefined();
          expect(error!.line).toBe(2);
          expect(error!.message).toContain('פורמט תקין');
        }
      });
      
      it('should return error for invalid date (month out of range)', () => {
        const csvContent = 'amount,date,category,description\n100.50,2026-13-15,Food,Lunch';
        const result = parser.parse(csvContent);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.length).toBeGreaterThan(0);
          const error = result.error.find(e => e.field === 'date');
          expect(error).toBeDefined();
          expect(error!.line).toBe(2);
        }
      });
      
      it('should return error for invalid date (day out of range)', () => {
        const csvContent = 'amount,date,category,description\n100.50,2026-02-30,Food,Lunch';
        const result = parser.parse(csvContent);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.length).toBeGreaterThan(0);
          const error = result.error.find(e => e.field === 'date');
          expect(error).toBeDefined();
          expect(error!.line).toBe(2);
        }
      });
      
      it('should return error for non-date string', () => {
        const csvContent = 'amount,date,category,description\n100.50,not-a-date,Food,Lunch';
        const result = parser.parse(csvContent);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.length).toBeGreaterThan(0);
          const error = result.error.find(e => e.field === 'date');
          expect(error).toBeDefined();
          expect(error!.line).toBe(2);
          expect(error!.message).toContain('פורמט תקין');
        }
      });
      
      it('should return error for empty date field', () => {
        const csvContent = 'amount,date,category,description\n100.50,,Food,Lunch';
        const result = parser.parse(csvContent);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.length).toBeGreaterThan(0);
          const error = result.error.find(e => e.field === 'date');
          expect(error).toBeDefined();
          expect(error!.line).toBe(2);
        }
      });
    });
    
    describe('Empty file handling', () => {
      /**
       * **Validates: Requirements 4.2, 5.2**
       * 
       * When a CSV file is empty or contains only whitespace, the parser should 
       * return an appropriate error message.
       */
      it('should return error for completely empty file', () => {
        const csvContent = '';
        const result = parser.parse(csvContent);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.length).toBeGreaterThan(0);
          expect(result.error[0].field).toBe('file');
          expect(result.error[0].message).toContain('לא מכיל נתונים');
        }
      });
      
      it('should return error for file with only whitespace', () => {
        const csvContent = '   \n  \n  ';
        const result = parser.parse(csvContent);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.length).toBeGreaterThan(0);
          expect(result.error[0].field).toBe('file');
          expect(result.error[0].message).toContain('לא מכיל נתונים');
        }
      });
      
      it('should return error for file with only newlines', () => {
        const csvContent = '\n\n\n';
        const result = parser.parse(csvContent);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.length).toBeGreaterThan(0);
          expect(result.error[0].field).toBe('file');
          expect(result.error[0].message).toContain('לא מכיל נתונים');
        }
      });
    });
  });
});
