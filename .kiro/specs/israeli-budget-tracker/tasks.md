# Implementation Plan: Israeli Budget Tracker

## Overview

This implementation plan breaks down the Israeli Budget Tracker feature into discrete coding tasks. The application will be built using TypeScript with a layered architecture (Presentation, Application, Domain, Data Access). The implementation follows an incremental approach, building core functionality first, then adding features, and finally integrating everything together.

## Tasks

- [x] 1. Set up project structure and core types
  - Create directory structure for layered architecture (presentation, application, domain, data-access)
  - Define core TypeScript interfaces and types (SalaryComponents, TaxCalculationResult, Expense, Result type)
  - Set up testing framework (Jest or Vitest) with fast-check for property-based testing
  - Configure TypeScript with strict mode and appropriate compiler options
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 3.1, 3.4_

- [ ] 2. Implement localization service
  - [x] 2.1 Create LocalizationService with Hebrew translations
    - Implement translate() method with Hebrew UI labels (משכורת בסיס, בונוס, מניות/אופציות, etc.)
    - Implement formatCurrency() to display amounts with ₪ symbol
    - Implement formatDate() for Hebrew date formatting
    - Implement getMonthName() for Hebrew month names
    - Implement getDirection() returning 'rtl'
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 9.5_
  
  - [x] 2.2 Write property test for currency formatting
    - **Property 27: Currency Symbol Display**
    - **Validates: Requirements 9.5**
  
  - [x] 2.3 Write property test for Hebrew UI labels
    - **Property 28: Hebrew UI Labels**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6**
  
  - [x] 2.4 Write property test for RTL text direction
    - **Property 29: RTL Text Direction**
    - **Validates: Requirements 10.7**

- [ ] 3. Implement validation service
  - [x] 3.1 Create ValidationService with core validation methods
    - Implement validateSalaryComponents() to reject negative values
    - Implement validateExpense() to check amount and date validity
    - Implement validateDate() to reject dates more than one day in the future
    - Implement checkDuplicate() to detect duplicate expenses
    - Return Hebrew error messages for all validation failures
    - _Requirements: 1.8, 1.9, 3.2, 3.3, 3.5, 9.1, 9.2, 9.3_
  
  - [x] 3.2 Write property test for amount validation
    - **Property 1: Salary Component Validation**
    - **Property 3: Amount Validation**
    - **Validates: Requirements 1.8, 1.9, 3.2, 3.5, 9.1**
  
  - [x] 3.3 Write property test for date validation
    - **Property 11: Date Validation**
    - **Validates: Requirements 3.3, 9.2**
  
  - [x] 3.4 Write unit tests for validation edge cases
    - Test zero amount rejection
    - Test negative amount rejection
    - Test future date rejection (more than 1 day ahead)
    - Test duplicate detection with same amount, date, and description
    - _Requirements: 1.8, 1.9, 3.2, 3.3, 9.1, 9.2, 9.3_

- [ ] 4. Implement tax calculator
  - [x] 4.1 Create TaxCalculator with 2026 Israeli tax regulations
    - Implement calculateNetIncome() method
    - Implement progressive income tax calculation with 2026 brackets
    - Implement National Insurance calculation (~7% up to ceiling)
    - Implement Health Insurance calculation (~5% up to ceiling)
    - Implement pension contributions (6% employee, 6.5% employer)
    - Implement study fund contributions (2.5% employee, 7.5% employer)
    - Calculate net income as gross minus all employee deductions
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_
  
  - [x] 4.2 Write property test for gross salary calculation
    - **Property 2: Gross Salary Calculation**
    - **Validates: Requirements 1.6**
  
  - [x] 4.3 Write property test for net income calculation
    - **Property 5: Net Income Calculation Invariant**
    - **Validates: Requirements 2.6**
  
  - [x] 4.4 Write property test for pension contributions
    - **Property 6: Pension Contribution Calculation**
    - **Validates: Requirements 2.2**
  
  - [x] 4.5 Write property test for study fund contributions
    - **Property 7: Study Fund Contribution Calculation**
    - **Validates: Requirements 2.3**
  
  - [x] 4.6 Write property test for tax breakdown completeness
    - **Property 8: Tax Breakdown Completeness**
    - **Validates: Requirements 2.7, 2.8**
  
  - [x] 4.7 Write unit tests for tax calculation examples
    - Test salary of ₪5,000 (below first bracket ceiling)
    - Test salary of ₪10,000 (crosses multiple brackets)
    - Test salary of ₪50,000 (above all ceilings)
    - Test National Insurance ceiling application
    - Test Health Insurance ceiling application
    - _Requirements: 2.1, 2.4, 2.5_

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement domain models
  - [x] 6.1 Create SalaryRecord, Expense, MonthlyReport, and AnnualReport models
    - Define SalaryRecord interface with id, salaryComponents, month, taxCalculation, createdAt
    - Define Expense interface with id, amount, date, category, description, createdAt
    - Define MonthlyReport interface with month, netIncome, expenses, totalExpenses, expensesByCategory, netSavings
    - Define AnnualReport interface with date range, monthly reports, totals, pension/study fund accumulation
    - Implement factory functions for creating model instances with generated IDs and timestamps
    - _Requirements: 1.7, 3.6, 6.1, 6.2, 6.3, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9_
  
  - [x] 6.2 Write property test for expense timestamp assignment
    - **Property 10: Expense Timestamp Assignment**
    - **Validates: Requirements 3.6**
  
  - [x] 6.3 Write property test for monetary precision
    - **Property 26: Monetary Precision**
    - **Validates: Requirements 9.4**

- [ ] 7. Implement CSV parser
  - [x] 7.1 Create CSVParser for expense import/export
    - Implement parse() method to convert CSV string to Expense array
    - Implement format() method to convert Expense array to CSV string
    - Handle CSV headers (amount, date, category, description)
    - Validate each row during parsing
    - Return detailed ParseError objects with line numbers for invalid rows
    - _Requirements: 4.1, 4.2, 5.1, 5.2, 5.3_
  
  - [x] 7.2 Write property test for CSV round-trip
    - **Property 12: CSV Parsing Round-Trip**
    - **Validates: Requirements 5.4**
  
  - [x] 7.3 Write property test for CSV parse error reporting
    - **Property 13: CSV Parse Error Reporting**
    - **Validates: Requirements 5.2**
  
  - [x] 7.4 Write unit tests for CSV edge cases
    - Test CSV with only headers (no data rows)
    - Test malformed CSV (missing columns, extra columns)
    - Test invalid date formats in CSV
    - Test empty file handling
    - _Requirements: 4.2, 5.2_

- [ ] 8. Implement storage service
  - [x] 8.1 Create StorageService for data persistence
    - Implement saveSalary() to persist salary records
    - Implement saveExpense() to persist expense records
    - Implement loadAllData() to retrieve all financial data
    - Use localStorage or file system for storage (depending on deployment target)
    - Handle storage errors gracefully with Hebrew error messages
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 8.2 Write property test for data persistence round-trip
    - **Property 4: Data Persistence Round-Trip**
    - **Validates: Requirements 1.7, 8.1, 8.2, 8.3, 8.5**
  
  - [x] 8.3 Write unit tests for storage error conditions
    - Test storage failure simulation
    - Test corrupted data file handling
    - Test load failure with empty data initialization
    - _Requirements: 8.4_

- [ ] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement expense manager
  - [ ] 10.1 Create ExpenseManager for expense operations
    - Implement addExpense() with validation and storage
    - Implement uploadExpenses() using CSVParser and validation
    - Implement getExpensesByMonth() to filter expenses by month
    - Implement getExpensesByDateRange() for date range queries
    - Return UploadResult with success count and failed records
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 6.1_
  
  - [ ] 10.2 Write property test for expense entry with optional fields
    - **Property 9: Expense Entry with Optional Fields**
    - **Validates: Requirements 3.1, 3.4**
  
  - [ ] 10.3 Write property test for upload validation consistency
    - **Property 14: Upload Validation Consistency**
    - **Validates: Requirements 4.3**
  
  - [ ] 10.4 Write property test for partial upload success
    - **Property 15: Partial Upload Success**
    - **Validates: Requirements 4.5, 4.6**
  
  - [ ] 10.5 Write property test for duplicate detection
    - **Property 25: Duplicate Detection**
    - **Validates: Requirements 9.3**

- [ ] 11. Implement budget controller
  - [ ] 11.1 Create BudgetController to orchestrate workflows
    - Implement enterSalary() to validate, calculate taxes, and store salary
    - Implement addExpense() delegating to ExpenseManager
    - Implement uploadExpenses() delegating to ExpenseManager
    - Implement getMonthlyReport() to generate monthly financial summary
    - Implement getAnnualReport() to generate annual financial overview
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9_
  
  - [ ] 11.2 Write property test for monthly expense filtering
    - **Property 16: Monthly Expense Filtering**
    - **Validates: Requirements 6.1**
  
  - [ ] 11.3 Write property test for monthly total calculation
    - **Property 17: Monthly Total Calculation**
    - **Validates: Requirements 6.2**
  
  - [ ] 11.4 Write property test for monthly savings calculation
    - **Property 18: Monthly Savings Calculation**
    - **Validates: Requirements 6.5**
  
  - [ ] 11.5 Write property test for category grouping correctness
    - **Property 19: Category Grouping Correctness**
    - **Validates: Requirements 6.3, 7.7**
  
  - [ ] 11.6 Write property test for annual period coverage
    - **Property 20: Annual Period Coverage**
    - **Validates: Requirements 7.1**
  
  - [ ] 11.7 Write property test for annual totals calculation
    - **Property 21: Annual Totals Calculation**
    - **Validates: Requirements 7.3, 7.4, 7.5**
  
  - [ ] 11.8 Write property test for monthly report completeness
    - **Property 22: Monthly Report Completeness**
    - **Validates: Requirements 7.2, 7.6**
  
  - [ ] 11.9 Write property test for annual pension accumulation
    - **Property 23: Annual Pension Accumulation Calculation**
    - **Validates: Requirements 7.8**
  
  - [ ] 11.10 Write property test for annual study fund accumulation
    - **Property 24: Annual Study Fund Accumulation Calculation**
    - **Validates: Requirements 7.9**
  
  - [ ] 11.11 Write integration tests for complete workflows
    - Test complete workflow: enter salary → add expenses → view monthly report
    - Test upload CSV → view expenses → verify persistence
    - Test multiple months → generate annual report
    - _Requirements: 1.7, 3.6, 6.1, 6.2, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3_

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement presentation layer
  - [x] 13.1 Create salary input form component
    - Build form with fields for all salary components (base, bonus, stocks, meal vouchers, other)
    - Display all labels in Hebrew using LocalizationService
    - Apply RTL text direction
    - Integrate with BudgetController.enterSalary()
    - Display validation errors in Hebrew
    - Show tax calculation breakdown after submission
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.8, 1.9, 1.10, 2.7, 2.8, 10.1, 10.2, 10.7_
  
  - [x] 13.2 Create expense entry form component
    - Build form with fields for amount, date, category, description
    - Display all labels in Hebrew using LocalizationService
    - Apply RTL text direction
    - Integrate with BudgetController.addExpense()
    - Display validation errors and duplicate warnings in Hebrew
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 9.3, 10.1, 10.2, 10.3, 10.7_
  
  - [x] 13.3 Create CSV upload component
    - Build file upload interface with Hebrew labels
    - Integrate with BudgetController.uploadExpenses()
    - Display upload summary (success count and failures) in Hebrew
    - Show detailed error messages for failed records in Hebrew
    - _Requirements: 4.1, 4.2, 4.4, 4.6, 10.1, 10.3, 10.7_
  
  - [x] 13.4 Create monthly report component
    - Build month selector with Hebrew month names
    - Display net income, total expenses, and net savings in Hebrew with ₪ symbol
    - Show expense list with date, amount, category, description in Hebrew
    - Display expenses grouped by category in Hebrew
    - Apply RTL text direction
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 9.5, 10.1, 10.5, 10.7, 10.8, 10.9_
  
  - [x] 13.5 Create annual report component
    - Display 12-month financial overview in Hebrew
    - Show month-by-month comparison with Hebrew month names
    - Display total income, total expenses, total savings in Hebrew with ₪ symbol
    - Show category breakdown for the year in Hebrew
    - Display total pension accumulation (employee + employer) in Hebrew
    - Display total study fund accumulation (employee + employer) in Hebrew
    - Apply RTL text direction
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 9.5, 10.1, 10.5, 10.6, 10.7, 10.8_

- [ ] 14. Wire all components together
  - [x] 14.1 Create main application component
    - Set up navigation between salary input, expense entry, upload, monthly report, and annual report
    - Initialize BudgetController with all dependencies
    - Set up data loading on application start
    - Handle storage errors with Hebrew error messages
    - Apply global RTL styling for Hebrew interface
    - _Requirements: 8.3, 8.4, 10.7_
  
  - [ ] 14.2 Add error boundary and global error handling
    - Implement error boundary component for React (if using React)
    - Display all error messages in Hebrew
    - Ensure graceful degradation on errors
    - _Requirements: 8.4, 10.4_

- [ ] 15. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (29 properties total)
- Unit tests validate specific examples and edge cases
- All user-facing text must be in Hebrew with RTL support
- TypeScript is used throughout for type safety
- The layered architecture ensures clean separation of concerns
