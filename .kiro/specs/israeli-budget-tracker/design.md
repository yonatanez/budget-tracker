# Design Document: Israeli Budget Tracker

## Overview

The Israeli Budget Tracker is a personal finance application designed specifically for Israeli residents to manage their monthly income and expenses. The system automatically calculates net income based on 2026 Israeli tax regulations, tracks expenses through manual entry or CSV upload, and provides comprehensive monthly and annual financial overviews.

The application follows a client-side architecture with local data persistence, ensuring user privacy and offline functionality. The core design emphasizes accurate tax calculations, robust data validation, and intuitive financial reporting.

### Key Design Goals

- Accurate implementation of 2026 Israeli tax regulations (income tax, National Insurance, Health Insurance, pension, study fund)
- Hebrew user interface with RTL support for comfortable native language experience
- Annual pension and study fund accumulation tracking (employee + employer contributions)
- Reliable data persistence with validation to maintain financial data integrity
- Support for both manual expense entry and bulk CSV import
- Clear financial reporting for monthly and annual periods
- Robust error handling and user feedback

## Architecture

The system follows a layered architecture pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  (User Interface - Forms, Reports, Visualizations)      │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Budget     │  │     Tax      │  │   Expense    │ │
│  │  Controller  │  │  Calculator  │  │   Manager    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                      Domain Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Salary     │  │   Expense    │  │  Financial   │ │
│  │    Model     │  │    Model     │  │   Report     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                   Data Access Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Storage    │  │     CSV      │  │  Validation  │ │
│  │   Service    │  │    Parser    │  │   Service    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

**Presentation Layer**: Handles user interactions, form inputs, and data visualization. Delegates business logic to the application layer.

**Application Layer**: Orchestrates business operations, coordinates between domain models, and manages application workflows.

**Domain Layer**: Contains core business entities and logic. Models represent financial concepts (salary, expenses, reports) with their associated behaviors.

**Data Access Layer**: Manages data persistence, file parsing, and validation. Abstracts storage mechanisms from business logic.

## Components and Interfaces

### Localization Component

Provides Hebrew translations and RTL support for the user interface.

```typescript
interface LocalizationService {
  translate(key: string): string;
  getDirection(): 'rtl' | 'ltr';
  formatCurrency(amount: number): string;
  formatDate(date: Date): string;
  getMonthName(month: number): string;
}
```

**Hebrew UI Labels** (examples):
- משכורת בסיס (Base Salary)
- בונוס (Bonus)
- מניות/אופציות (Stocks/Options)
- תלושי אוכל (Meal Vouchers)
- רכיבי שכר נוספים (Other Compensation)
- משכורת ברוטו (Gross Salary)
- הכנסה נטו (Net Income)
- מס הכנסה (Income Tax)
- ביטוח לאומי (National Insurance)
- ביטוח בריאות (Health Insurance)
- קרן פנסיה (Pension Fund)
- קרן השתלמות (Study Fund)
- הוצאות (Expenses)
- חיסכון (Savings)
- קטגוריה (Category)
- תיאור (Description)
- תאריך (Date)
- סכום (Amount)

### Tax Calculator Component

Responsible for computing Israeli tax deductions according to 2026 regulations.

```typescript
interface TaxCalculator {
  calculateNetIncome(salaryComponents: SalaryComponents): TaxCalculationResult;
}

interface SalaryComponents {
  baseSalary: number;
  bonus?: number;
  stockValue?: number;
  mealVouchers?: number;
  otherCompensation?: number;
}

interface TaxCalculationResult {
  salaryComponents: SalaryComponents;
  grossSalary: number; // Sum of all components
  incomeTax: number;
  nationalInsurance: number;
  healthInsurance: number;
  pensionEmployeeContribution: number;
  pensionEmployerContribution: number;
  studyFundEmployeeContribution: number;
  studyFundEmployerContribution: number;
  netIncome: number;
}
```

**2026 Israeli Tax Regulations**:

- **Income Tax Brackets** (2026 estimated):
  - Up to ₪7,010/month (₪84,120/year): 10%
  - ₪7,011-₪10,080/month (₪84,121-₪120,960/year): 14%
  - ₪10,081-₪16,150/month (₪120,961-₪193,800/year): 20%
  - ₪16,151-₪22,440/month (₪193,801-₪269,280/year): 31%
  - ₪22,441-₪46,690/month (₪269,281-₪560,280/year): 35%
  - Above ₪46,690/month (₪560,280/year): 47%

- **National Insurance (Bituach Leumi)**: ~7% on income up to ceiling (~₪47,000/month)
- **Health Insurance (Bituach Briut)**: ~5% on income up to ceiling (~₪47,000/month)
- **Pension Contribution (Keren Pensia)**: 
  - Employee: 6% (deducted from salary)
  - Employer: 6.5% (additional contribution, not deducted from salary)
- **Study Fund (Keren Hishtalmut)**: 
  - Employee: 2.5% (deducted from salary)
  - Employer: 7.5% (additional contribution, not deducted from salary)

The Tax Calculator applies progressive taxation on the total gross salary (sum of all components), calculating each bracket separately and summing the results.

### Expense Manager Component

Manages expense entry, validation, and retrieval.

```typescript
interface ExpenseManager {
  addExpense(expense: ExpenseInput): Result<Expense, ValidationError>;
  uploadExpenses(csvData: string): UploadResult;
  getExpensesByMonth(year: number, month: number): Expense[];
  getExpensesByDateRange(startDate: Date, endDate: Date): Expense[];
}

interface ExpenseInput {
  amount: number;
  date: Date;
  category?: string;
  description?: string;
}

interface UploadResult {
  successCount: number;
  failedRecords: FailedRecord[];
}

interface FailedRecord {
  lineNumber: number;
  data: string;
  error: string;
}
```

### CSV Parser Component

Handles parsing and formatting of expense data in CSV format.

```typescript
interface CSVParser {
  parse(csvContent: string): Result<Expense[], ParseError[]>;
  format(expenses: Expense[]): string;
}

interface ParseError {
  line: number;
  field: string;
  message: string;
}
```

**CSV Format Specification**:
```
amount,date,category,description
150.50,2026-01-15,Groceries,Weekly shopping
45.00,2026-01-16,Transportation,Bus pass
```

### Storage Service Component

Provides data persistence with automatic saving and loading.

```typescript
interface StorageService {
  saveSalary(salary: SalaryRecord): Promise<void>;
  saveExpense(expense: Expense): Promise<void>;
  loadAllData(): Promise<FinancialData>;
}

interface FinancialData {
  salaries: SalaryRecord[];
  expenses: Expense[];
}
```

### Budget Controller Component

Orchestrates the main application workflows and coordinates between components.

```typescript
interface BudgetController {
  enterSalary(components: SalaryComponents, month: Date): Result<SalaryRecord, ValidationError>;
  addExpense(input: ExpenseInput): Result<Expense, ValidationError>;
  uploadExpenses(file: File): Promise<UploadResult>;
  getMonthlyReport(year: number, month: number): MonthlyReport;
  getAnnualReport(): AnnualReport;
}
```

### Validation Service Component

Centralizes validation logic for all financial data inputs.

```typescript
interface ValidationService {
  validateSalaryComponents(components: SalaryComponents): ValidationResult;
  validateExpense(expense: ExpenseInput): ValidationResult;
  validateDate(date: Date): ValidationResult;
  checkDuplicate(expense: ExpenseInput, existing: Expense[]): boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
```

## Data Models

### Salary Record

```typescript
interface SalaryRecord {
  id: string;
  salaryComponents: SalaryComponents;
  month: Date; // First day of the month
  taxCalculation: TaxCalculationResult;
  createdAt: Date;
}

interface SalaryComponents {
  baseSalary: number;
  bonus?: number;
  stockValue?: number;
  mealVouchers?: number;
  otherCompensation?: number;
}
```

### Expense

```typescript
interface Expense {
  id: string;
  amount: number;
  date: Date;
  category: string | null;
  description: string | null;
  createdAt: Date;
}
```

### Monthly Report

```typescript
interface MonthlyReport {
  month: Date;
  netIncome: number;
  expenses: Expense[];
  totalExpenses: number;
  expensesByCategory: Map<string, number>;
  netSavings: number; // netIncome - totalExpenses
}
```

### Annual Report

```typescript
interface AnnualReport {
  startDate: Date;
  endDate: Date;
  monthlyReports: MonthlyReport[];
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  expensesByCategory: Map<string, number>;
  totalPensionAccumulation: number; // Sum of employee + employer contributions for the year
  totalStudyFundAccumulation: number; // Sum of employee + employer contributions for the year
}
```

### Result Type

```typescript
type Result<T, E> = 
  | { success: true; value: T }
  | { success: false; error: E };
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Salary Component Validation

*For any* salary component (base salary, bonus, stock value, meal vouchers, other compensation), if the component value is negative, then the system should reject the input and return a validation error.

**Validates: Requirements 1.8**

### Property 2: Gross Salary Calculation

*For any* set of salary components, the calculated gross salary should equal the sum of all provided component values (baseSalary + bonus + stockValue + mealVouchers + otherCompensation).

**Validates: Requirements 1.6**

### Property 3: Amount Validation

*For any* monetary amount input (salary or expense), if the amount is less than or equal to zero, then the system should reject the input and return a validation error.

**Validates: Requirements 1.9, 3.2, 3.5, 9.1**

### Property 4: Data Persistence Round-Trip

*For any* valid financial data (salary records with all components and expenses), saving the data to storage and then loading it back should produce equivalent data with all fields preserved.

**Validates: Requirements 1.7, 8.1, 8.2, 8.3, 8.5**

### Property 5: Net Income Calculation Invariant

*For any* gross salary amount (calculated from all components), the calculated net income should always equal the gross salary minus the sum of all employee deductions (income tax + national insurance + health insurance + pension employee contribution + study fund employee contribution).

**Validates: Requirements 2.6**

### Property 6: Pension Contribution Calculation

*For any* gross salary amount, the employee pension contribution should equal exactly 6% of the gross salary (grossSalary × 0.06), and the employer pension contribution should equal exactly 6.5% of the gross salary (grossSalary × 0.065).

**Validates: Requirements 2.2**

### Property 7: Study Fund Contribution Calculation

*For any* gross salary amount, the employee study fund contribution should equal exactly 2.5% of the gross salary (grossSalary × 0.025), and the employer study fund contribution should equal exactly 7.5% of the gross salary (grossSalary × 0.075).

**Validates: Requirements 2.3**

### Property 8: Tax Breakdown Completeness

*For any* tax calculation result, the breakdown should contain all required deduction types: income tax, national insurance, health insurance, pension contributions (employee and employer), study fund contributions (employee and employer), and net income.

**Validates: Requirements 2.7, 2.8**

### Property 9: Expense Entry with Optional Fields

*For any* valid expense with a positive amount and valid date, the system should accept the expense regardless of whether category and description are provided or omitted.

**Validates: Requirements 3.1, 3.4**

### Property 10: Expense Timestamp Assignment

*For any* valid expense that is successfully stored, the expense record should have a createdAt timestamp that is set to a valid date/time.

**Validates: Requirements 3.6**

### Property 11: Date Validation

*For any* date input, if the date is more than one day in the future from the current date, then the system should reject the input with a validation error.

**Validates: Requirements 3.3, 9.2**

### Property 12: CSV Parsing Round-Trip

*For any* valid set of expense records, formatting them to CSV and then parsing the CSV back should produce equivalent expense records with all fields preserved (amount, date, category, description).

**Validates: Requirements 5.4**

### Property 13: CSV Parse Error Reporting

*For any* invalid CSV content, the parser should return error messages that include the line number where the error occurred and a description of the validation failure.

**Validates: Requirements 5.2**

### Property 14: Upload Validation Consistency

*For any* expense data, the validation rules applied during CSV upload should be identical to the validation rules applied during manual entry (amount validation, date validation, format validation).

**Validates: Requirements 4.3**

### Property 15: Partial Upload Success

*For any* CSV file containing a mix of valid and invalid expense records, the system should successfully import all valid records while reporting failures for invalid records, and the count of imported records should equal the number of valid records.

**Validates: Requirements 4.5, 4.6**

### Property 16: Monthly Expense Filtering

*For any* selected month and year, the monthly expense list should contain only expenses where the expense date falls within that calendar month (from the 1st to the last day of the month).

**Validates: Requirements 6.1**

### Property 17: Monthly Total Calculation

*For any* month's expenses, the calculated total expenses should equal the sum of all individual expense amounts for that month.

**Validates: Requirements 6.2**

### Property 18: Monthly Savings Calculation

*For any* month with net income and expenses, the net savings should equal the net income minus the total expenses (netSavings = netIncome - totalExpenses).

**Validates: Requirements 6.5**

### Property 19: Category Grouping Correctness

*For any* set of expenses with categories, when grouped by category, the sum of all category totals should equal the total of all expenses.

**Validates: Requirements 6.3, 7.7**

### Property 20: Annual Period Coverage

*For any* annual report request, the report should include data for exactly the most recent 12 consecutive monthly periods.

**Validates: Requirements 7.1**

### Property 21: Annual Totals Calculation

*For any* annual report, the total annual income should equal the sum of all monthly net incomes, the total annual expenses should equal the sum of all monthly expenses, and the total annual savings should equal total income minus total expenses.

**Validates: Requirements 7.3, 7.4, 7.5**

### Property 22: Monthly Report Completeness

*For any* month included in an annual report, the monthly data should include net income, total expenses, and net savings values.

**Validates: Requirements 7.2, 7.6**

### Property 23: Annual Pension Accumulation Calculation

*For any* annual report, the total pension accumulation should equal the sum of all monthly employee pension contributions plus all monthly employer pension contributions across the 12-month period.

**Validates: Requirements 7.8**

### Property 24: Annual Study Fund Accumulation Calculation

*For any* annual report, the total study fund accumulation should equal the sum of all monthly employee study fund contributions plus all monthly employer study fund contributions across the 12-month period.

**Validates: Requirements 7.9**

### Property 25: Duplicate Detection

*For any* new expense entry, if an existing expense has the same amount, date, and description, then the system should detect this as a potential duplicate and issue a warning.

**Validates: Requirements 9.3**

### Property 26: Monetary Precision

*For any* monetary value stored in the system, the value should maintain exactly two decimal places of precision.

**Validates: Requirements 9.4**

### Property 27: Currency Symbol Display

*For any* monetary value displayed to the user, the formatted string should include the Israeli Shekel currency symbol (₪).

**Validates: Requirements 9.5**

### Property 28: Hebrew UI Labels

*For any* user interface element (label, button, error message, report header), the displayed text should be in Hebrew.

**Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6**

### Property 29: RTL Text Direction

*For any* Hebrew text content displayed in the interface, the text direction should be right-to-left (RTL).

**Validates: Requirements 10.7**

## Error Handling

The system implements comprehensive error handling across all layers:

### Input Validation Errors

- **Invalid Amount**: Return error message "הסכום חייב להיות מספר חיובי גדול מאפס" (Amount must be a positive number greater than zero)
- **Invalid Date Format**: Return error message "התאריך חייב להיות בפורמט תקין (YYYY-MM-DD)" (Date must be in valid format)
- **Future Date**: Return error message "התאריך לא יכול להיות יותר מיום אחד בעתיד" (Date cannot be more than one day in the future)
- **Missing Required Fields**: Return error message specifying which required field is missing in Hebrew

### File Upload Errors

- **Invalid CSV Format**: Return error message "הקובץ חייב להיות בפורמט CSV תקין" (File must be in valid CSV format)
- **Parse Errors**: Return detailed error with line number and field name in Hebrew
- **Empty File**: Return error message "הקובץ לא מכיל נתונים" (File contains no data)
- **Encoding Issues**: Return error message "קידוד הקובץ לא נתמך, אנא השתמש ב-UTF-8" (File encoding not supported, please use UTF-8)

### Storage Errors

- **Save Failure**: Display error message "שמירת הנתונים נכשלה. אנא נסה שוב." (Failed to save data. Please try again.)
- **Load Failure**: Display error message "טעינת הנתונים נכשלה. מתחיל עם נתונים ריקים." (Failed to load saved data. Starting with empty data.) and initialize with empty state
- **Corruption Detection**: Display error message "קובץ הנתונים פגום. אנא שחזר מגיבוי." (Data file is corrupted. Please restore from backup.)

### Calculation Errors

- **Missing Salary Data**: Return error message "לא נמצאו נתוני משכורת לחודש המבוקש" (No salary data found for the specified month)
- **Invalid Tax Bracket**: Log error and use default calculation (should not occur with valid inputs)

### Error Response Pattern

All errors follow a consistent structure:

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}
```

### Error Recovery Strategies

- **Validation Errors**: Reject input, preserve existing state, provide clear feedback
- **Storage Errors**: Attempt retry once, then fail gracefully with user notification
- **Parse Errors**: Continue processing valid records, collect all errors for batch reporting
- **Calculation Errors**: Use safe defaults where possible, log for debugging

## Testing Strategy

The testing strategy employs a dual approach combining unit tests for specific scenarios and property-based tests for comprehensive coverage.

### Property-Based Testing

Property-based testing will be implemented using **fast-check** (for TypeScript/JavaScript) to verify universal properties across randomized inputs. Each property test will run a minimum of 100 iterations to ensure thorough coverage.

**Property Test Configuration**:
```typescript
import fc from 'fast-check';

// Example property test structure
fc.assert(
  fc.property(
    fc.float({ min: 0.01, max: 1000000 }), // arbitrary generator
    (grossSalary) => {
      // Test implementation
    }
  ),
  { numRuns: 100 } // Minimum 100 iterations
);
```

**Property Tests to Implement**:

1. **Property 1: Amount Validation** - Generate random negative and zero values, verify rejection
   - Tag: *Feature: israeli-budget-tracker, Property 1: Amount validation rejects non-positive values*

2. **Property 2: Data Persistence Round-Trip** - Generate random financial data, save and load, verify equivalence
   - Tag: *Feature: israeli-budget-tracker, Property 2: Save then load preserves all data*

3. **Property 3: Net Income Calculation Invariant** - Generate random salaries, verify net = gross - deductions
   - Tag: *Feature: israeli-budget-tracker, Property 3: Net income equals gross minus all deductions*

4. **Property 4: Pension Contribution** - Generate random salaries, verify pension = salary × 0.06
   - Tag: *Feature: israeli-budget-tracker, Property 4: Pension contribution is exactly 6% of gross*

5. **Property 9: CSV Round-Trip** - Generate random expense sets, format to CSV, parse back, verify equivalence
   - Tag: *Feature: israeli-budget-tracker, Property 9: CSV format then parse preserves expense data*

6. **Property 14: Monthly Total Calculation** - Generate random expense sets, verify total = sum of amounts
   - Tag: *Feature: israeli-budget-tracker, Property 14: Monthly total equals sum of expenses*

7. **Property 15: Monthly Savings** - Generate random income and expenses, verify savings = income - expenses
   - Tag: *Feature: israeli-budget-tracker, Property 15: Net savings equals income minus expenses*

8. **Property 16: Category Grouping** - Generate random categorized expenses, verify sum of categories = total
   - Tag: *Feature: israeli-budget-tracker, Property 16: Category totals sum to overall total*

9. **Property 18: Annual Totals** - Generate random monthly data, verify annual = sum of monthly
   - Tag: *Feature: israeli-budget-tracker, Property 18: Annual totals equal sum of monthly totals*

10. **Property 21: Monetary Precision** - Generate random monetary values, verify 2 decimal places maintained
    - Tag: *Feature: israeli-budget-tracker, Property 21: All monetary values maintain 2 decimal precision*

### Unit Testing

Unit tests focus on specific examples, edge cases, and integration points. These complement property tests by validating concrete scenarios.

**Unit Tests to Implement**:

1. **Tax Calculation Examples**:
   - Test salary of ₪5,000 (below first bracket ceiling)
   - Test salary of ₪10,000 (crosses multiple brackets)
   - Test salary of ₪50,000 (above all ceilings)
   - Test National Insurance ceiling application
   - Test Health Insurance ceiling application

2. **Edge Cases**:
   - Empty expense list for monthly report
   - Month with no salary data
   - CSV with only headers (no data rows)
   - Expense on month boundary (last day of month)
   - Leap year date handling (February 29)

3. **Error Conditions**:
   - Malformed CSV (missing columns, extra columns)
   - Invalid date formats in CSV
   - Storage failure simulation
   - Corrupted data file handling

4. **Integration Tests**:
   - Complete workflow: enter salary → add expenses → view monthly report
   - Upload CSV → view expenses → verify persistence
   - Multiple months → generate annual report

5. **Duplicate Detection**:
   - Exact duplicate (same amount, date, description)
   - Near duplicate (same amount and date, different description)
   - Same amount different dates

### Test Coverage Goals

- **Line Coverage**: Minimum 90%
- **Branch Coverage**: Minimum 85%
- **Property Tests**: All 22 properties implemented
- **Unit Tests**: Minimum 50 test cases covering examples and edge cases

### Testing Tools

- **Property-Based Testing**: fast-check
- **Unit Testing**: Jest or Vitest
- **Coverage**: Istanbul/nyc
- **Mocking**: Jest mocks for storage layer

### Continuous Testing

- Run property tests on every commit (100 iterations each)
- Run full test suite before merges
- Monitor test execution time (property tests may be slower)
- Track flaky tests and investigate failures
