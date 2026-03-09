# Requirements Document

## Introduction

This document specifies the requirements for a personal monthly budget tracking application tailored for Israeli residents. The system enables users to input their salary, automatically calculates net income based on Israeli tax regulations (2026), tracks monthly expenses, and provides a comprehensive overview of the past year's financial data.

## Glossary

- **Budget_Tracker**: The personal monthly budget tracking application system
- **User**: An individual using the application to track their personal finances
- **Base_Salary**: The fixed monthly salary amount before any additional compensation
- **Bonus**: Additional compensation such as performance bonuses or one-time payments
- **Stock_Value**: Value of stock options, RSUs, or equity compensation
- **Meal_Vouchers**: Value of meal vouchers or food benefits (תלושי אוכל)
- **Other_Compensation**: Any other compensation components (car allowance, phone allowance, etc.)
- **Gross_Salary**: The total salary amount before any deductions (sum of all salary components)
- **Net_Income**: The salary amount after all mandatory deductions (taxes, pension, health insurance, etc.)
- **Tax_Calculator**: The component responsible for calculating Israeli tax deductions according to 2026 regulations
- **Expense**: A financial transaction representing money spent by the user
- **Expense_Record**: A stored entry containing expense details (amount, date, category, description)
- **Financial_Overview**: A summary display of income and expenses over a specified period
- **Monthly_Period**: A calendar month from the 1st to the last day
- **Annual_Period**: A consecutive 12-month period
- **Pension_Fund**: Mandatory retirement savings (Keren Pensia) with employee and employer contributions
- **Study_Fund**: Educational savings fund (Keren Hishtalmut) with employee and employer contributions
- **UI_Language**: Hebrew - all user interface elements, labels, and messages displayed in Hebrew

## Requirements

### Requirement 1: Salary Input and Storage

**User Story:** As a user, I want to input my gross salary with detailed components, so that the system can accurately track my income.

#### Acceptance Criteria

1. THE Budget_Tracker SHALL accept base salary input as a positive numerical value
2. THE Budget_Tracker SHALL accept optional bonus amount as a positive numerical value
3. THE Budget_Tracker SHALL accept optional stock/equity value as a positive numerical value
4. THE Budget_Tracker SHALL accept optional meal voucher value as a positive numerical value
5. THE Budget_Tracker SHALL accept optional other compensation components as positive numerical values
6. THE Budget_Tracker SHALL calculate total gross salary as the sum of all salary components
7. THE Budget_Tracker SHALL store all salary components with the associated month
8. WHEN any salary component value is entered, THE Budget_Tracker SHALL validate that the value is greater than or equal to zero
9. WHEN the total gross salary is zero, THE Budget_Tracker SHALL display an error message and reject the input
10. THE Budget_Tracker SHALL display all salary components in Hebrew in the input form

### Requirement 2: Israeli Tax Calculation (2026 Regulations)

**User Story:** As an Israeli resident, I want the system to automatically calculate my net income according to 2026 Israeli tax regulations, so that I know my actual take-home pay.

#### Acceptance Criteria

1. WHEN a gross salary is entered, THE Tax_Calculator SHALL calculate income tax according to 2026 Israeli tax brackets
2. WHEN a gross salary is entered, THE Tax_Calculator SHALL calculate mandatory pension contributions (6% employee contribution and 6.5% employer contribution)
3. WHEN a gross salary is entered, THE Tax_Calculator SHALL calculate study fund (Keren Hishtalmut) contributions (2.5% employee contribution and 7.5% employer contribution)
4. WHEN a gross salary is entered, THE Tax_Calculator SHALL calculate National Insurance (Bituach Leumi) deductions according to 2026 rates
5. WHEN a gross salary is entered, THE Tax_Calculator SHALL calculate Health Insurance (Bituach Briut) deductions according to 2026 rates
6. THE Tax_Calculator SHALL compute net income by subtracting all mandatory employee deductions from gross salary
7. THE Budget_Tracker SHALL display a breakdown showing each deduction type and amount in Hebrew
8. THE Budget_Tracker SHALL display the calculated net income to the user in Hebrew

### Requirement 3: Expense Entry

**User Story:** As a user, I want to manually add individual expenses, so that I can track my spending.

#### Acceptance Criteria

1. THE Budget_Tracker SHALL accept manual expense entry with amount, date, and optional description
2. WHEN an expense is added, THE Budget_Tracker SHALL validate that the amount is a positive numerical value
3. WHEN an expense is added, THE Budget_Tracker SHALL validate that the date is in a valid format
4. THE Budget_Tracker SHALL allow the user to assign an optional category to each expense
5. IF an invalid expense amount is provided, THEN THE Budget_Tracker SHALL display an error message and reject the entry
6. WHEN a valid expense is entered, THE Budget_Tracker SHALL store the expense record with a timestamp

### Requirement 4: Expense Upload

**User Story:** As a user, I want to upload expense data from a file, so that I can efficiently import multiple expenses at once.

#### Acceptance Criteria

1. THE Budget_Tracker SHALL accept expense data uploads in CSV format
2. WHEN a file is uploaded, THE Budget_Tracker SHALL parse the file and extract expense records
3. WHEN parsing an uploaded file, THE Budget_Tracker SHALL validate each expense record according to the same rules as manual entry
4. IF the uploaded file contains invalid data, THEN THE Budget_Tracker SHALL report which records failed validation and the reason
5. THE Budget_Tracker SHALL import all valid expense records from the uploaded file
6. WHEN an upload completes, THE Budget_Tracker SHALL display a summary showing the number of successfully imported records and any failures

### Requirement 5: Expense Data Parsing and Formatting

**User Story:** As a user, I want my expense data to be correctly parsed and formatted, so that I can reliably import and export my financial information.

#### Acceptance Criteria

1. WHEN a valid CSV file is provided, THE Expense_Parser SHALL parse it into Expense_Record objects
2. WHEN an invalid CSV file is provided, THE Expense_Parser SHALL return descriptive error messages indicating the line and nature of the error
3. THE Expense_Formatter SHALL format Expense_Record objects back into valid CSV files
4. FOR ALL valid sets of Expense_Record objects, parsing then formatting then parsing SHALL produce equivalent objects (round-trip property)

### Requirement 6: Monthly Expense Tracking

**User Story:** As a user, I want to view all expenses for a specific month, so that I can understand my monthly spending patterns.

#### Acceptance Criteria

1. THE Budget_Tracker SHALL display all expense records for a selected monthly period
2. THE Budget_Tracker SHALL calculate and display the total expenses for the selected month
3. THE Budget_Tracker SHALL group expenses by category when displaying monthly data
4. WHEN displaying monthly expenses, THE Budget_Tracker SHALL show each expense with its date, amount, category, and description
5. THE Budget_Tracker SHALL calculate and display the difference between net income and total expenses for the month

### Requirement 7: Annual Financial Overview

**User Story:** As a user, I want to see an overview of the past year's financial data, so that I can analyze my long-term financial trends.

#### Acceptance Criteria

1. THE Budget_Tracker SHALL display financial data for the most recent 12 monthly periods in Hebrew
2. FOR EACH month in the annual period, THE Budget_Tracker SHALL display the net income, total expenses, and net savings in Hebrew
3. THE Budget_Tracker SHALL calculate and display the total income for the annual period in Hebrew
4. THE Budget_Tracker SHALL calculate and display the total expenses for the annual period in Hebrew
5. THE Budget_Tracker SHALL calculate and display the total savings for the annual period in Hebrew
6. THE Budget_Tracker SHALL display a month-by-month comparison showing spending trends in Hebrew
7. WHERE expense categories exist, THE Budget_Tracker SHALL display a breakdown of expenses by category for the annual period in Hebrew
8. THE Budget_Tracker SHALL calculate and display the total annual pension accumulation (employee + employer contributions) in Hebrew
9. THE Budget_Tracker SHALL calculate and display the total annual study fund accumulation (employee + employer contributions) in Hebrew

### Requirement 8: Data Persistence

**User Story:** As a user, I want my financial data to be saved automatically, so that I don't lose my tracking information.

#### Acceptance Criteria

1. WHEN a salary entry is added, THE Budget_Tracker SHALL persist the data to storage
2. WHEN an expense record is added, THE Budget_Tracker SHALL persist the data to storage
3. WHEN the application is opened, THE Budget_Tracker SHALL load all previously saved financial data
4. IF data loading fails, THEN THE Budget_Tracker SHALL display an error message and start with empty data
5. THE Budget_Tracker SHALL maintain data integrity across application sessions

### Requirement 10: Hebrew User Interface

**User Story:** As an Israeli user, I want the entire application interface in Hebrew, so that I can use it comfortably in my native language.

#### Acceptance Criteria

1. THE Budget_Tracker SHALL display all user interface labels in Hebrew
2. THE Budget_Tracker SHALL display all form field labels in Hebrew
3. THE Budget_Tracker SHALL display all button text in Hebrew
4. THE Budget_Tracker SHALL display all error messages in Hebrew
5. THE Budget_Tracker SHALL display all report headers and column names in Hebrew
6. THE Budget_Tracker SHALL display all financial terms (salary, expenses, savings, pension, study fund) in Hebrew
7. THE Budget_Tracker SHALL support right-to-left (RTL) text direction for Hebrew content
8. THE Budget_Tracker SHALL display month names in Hebrew
9. THE Budget_Tracker SHALL display category names in Hebrew

### Requirement 9: Data Validation and Integrity

**User Story:** As a user, I want the system to validate my inputs, so that my financial data remains accurate and consistent.

#### Acceptance Criteria

1. THE Budget_Tracker SHALL reject negative values for salary and expense amounts
2. THE Budget_Tracker SHALL reject future dates that are more than one day ahead of the current date
3. WHEN duplicate expense entries are detected (same amount, date, and description), THE Budget_Tracker SHALL warn the user before saving
4. THE Budget_Tracker SHALL ensure that all stored monetary values maintain precision to two decimal places
5. WHEN displaying monetary values, THE Budget_Tracker SHALL format amounts with the appropriate currency symbol (₪)
