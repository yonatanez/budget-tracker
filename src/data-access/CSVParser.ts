/**
 * CSV Parser for expense import/export
 * Handles parsing CSV strings to Expense arrays and formatting Expense arrays to CSV strings
 */

import { Expense, ParseError, Result } from '../domain/types';

/**
 * CSV Parser interface for expense data
 */
export interface CSVParser {
  parse(csvContent: string): Result<Expense[], ParseError[]>;
  format(expenses: Expense[]): string;
}

/**
 * Implementation of CSV Parser for expense data
 */
export class CSVParserImpl implements CSVParser {
  private readonly HEADERS = ['amount', 'date', 'category', 'description'];
  
  /**
   * Parse CSV content into an array of Expense objects
   * @param csvContent - CSV string with headers
   * @returns Result with either Expense array or ParseError array
   */
  parse(csvContent: string): Result<Expense[], ParseError[]> {
    const errors: ParseError[] = [];
    const expenses: Expense[] = [];
    
    // Handle empty content
    if (!csvContent || csvContent.trim() === '') {
      return {
        success: false,
        error: [{
          line: 0,
          field: 'file',
          message: 'הקובץ לא מכיל נתונים' // File contains no data
        }]
      };
    }
    
    const lines = csvContent.split('\n');
    
    // Validate headers
    if (lines.length === 0) {
      return {
        success: false,
        error: [{
          line: 0,
          field: 'file',
          message: 'הקובץ לא מכיל נתונים' // File contains no data
        }]
      };
    }
    
    const headerLine = lines[0].trim();
    const headers = headerLine.split(',').map(h => h.trim());
    
    // Check if headers match expected format
    if (!this.validateHeaders(headers)) {
      return {
        success: false,
        error: [{
          line: 1,
          field: 'headers',
          message: 'כותרות CSV לא תקינות. נדרש: amount,date,category,description' // Invalid CSV headers
        }]
      };
    }
    
    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      // Remove only line ending characters (\r) but preserve other whitespace
      const line = lines[i].replace(/\r$/, '');
      
      // Skip empty lines
      if (line.trim() === '') {
        continue;
      }
      
      const lineNumber = i + 1;
      const parseResult = this.parseLine(line, lineNumber);
      
      if (parseResult.success) {
        expenses.push(parseResult.value);
      } else {
        errors.push(...parseResult.error);
      }
    }
    
    // If there are errors, return them
    if (errors.length > 0) {
      return {
        success: false,
        error: errors
      };
    }
    
    // If no data rows were parsed, return error
    if (expenses.length === 0) {
      return {
        success: false,
        error: [{
          line: 0,
          field: 'file',
          message: 'הקובץ לא מכיל שורות נתונים תקינות' // File contains no valid data rows
        }]
      };
    }
    
    return {
      success: true,
      value: expenses
    };
  }
  
  /**
   * Format an array of Expense objects into CSV string
   * @param expenses - Array of Expense objects
   * @returns CSV string with headers
   */
  format(expenses: Expense[]): string {
    const lines: string[] = [];
    
    // Add headers
    lines.push(this.HEADERS.join(','));
    
    // Add data rows
    for (const expense of expenses) {
      const row = [
        expense.amount.toFixed(2),
        this.formatDate(expense.date),
        expense.category ?? '',
        expense.description ?? ''
      ];
      lines.push(row.join(','));
    }
    
    return lines.join('\n');
  }
  
  /**
   * Validate CSV headers
   */
  private validateHeaders(headers: string[]): boolean {
    if (headers.length !== this.HEADERS.length) {
      return false;
    }
    
    for (let i = 0; i < this.HEADERS.length; i++) {
      if (headers[i] !== this.HEADERS[i]) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Parse a single CSV line into an Expense object
   */
  private parseLine(line: string, lineNumber: number): Result<Expense, ParseError[]> {
    const errors: ParseError[] = [];
    const parts = line.split(',');
    
    // Check column count
    if (parts.length !== this.HEADERS.length) {
      return {
        success: false,
        error: [{
          line: lineNumber,
          field: 'row',
          message: `מספר עמודות שגוי. נדרש: ${this.HEADERS.length}, נמצא: ${parts.length}` // Wrong number of columns
        }]
      };
    }
    
    // Parse amount (trim for numeric parsing)
    const amountStr = parts[0].trim();
    const amount = parseFloat(amountStr);
    
    if (isNaN(amount) || amount <= 0) {
      errors.push({
        line: lineNumber,
        field: 'amount',
        message: 'הסכום חייב להיות מספר חיובי גדול מאפס' // Amount must be a positive number greater than zero
      });
    }
    
    // Parse date (trim for date parsing)
    const dateStr = parts[1].trim();
    const date = this.parseDate(dateStr);
    
    if (!date) {
      errors.push({
        line: lineNumber,
        field: 'date',
        message: 'התאריך חייב להיות בפורמט תקין (YYYY-MM-DD)' // Date must be in valid format (YYYY-MM-DD)
      });
    }
    
    // Validate date is not too far in the future (more than 1 day)
    if (date) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);
      
      if (date > tomorrow) {
        errors.push({
          line: lineNumber,
          field: 'date',
          message: 'התאריך לא יכול להיות יותר מיום אחד בעתיד' // Date cannot be more than one day in the future
        });
      }
    }
    
    // If there are validation errors, return them
    if (errors.length > 0) {
      return {
        success: false,
        error: errors
      };
    }
    
    // Parse optional fields (do NOT trim to preserve whitespace)
    const category = parts[2] === '' ? null : parts[2];
    const description = parts[3] === '' ? null : parts[3];
    
    // Create expense object (without id and createdAt as those are generated by factory)
    const expense: Expense = {
      id: '', // Will be generated by factory function
      amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
      date: date!,
      category,
      description,
      createdAt: new Date()
    };
    
    return {
      success: true,
      value: expense
    };
  }
  
  /**
   * Parse date string in YYYY-MM-DD format
   */
  private parseDate(dateStr: string): Date | null {
    // Check format with regex
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
      return null;
    }
    
    const parts = dateStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    
    // Validate ranges
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }
    
    const date = new Date(year, month - 1, day);
    
    // Check if date is valid (handles invalid dates like Feb 30)
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null;
    }
    
    return date;
  }
  
  /**
   * Format date to YYYY-MM-DD string
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

/**
 * Create a new CSVParser instance
 */
export function createCSVParser(): CSVParser {
  return new CSVParserImpl();
}
