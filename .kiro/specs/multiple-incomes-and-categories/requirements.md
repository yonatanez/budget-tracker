# Requirements Document

## Introduction

This feature extends the Israeli Budget Tracker to support multiple income sources per month and adds a new "חתונות" (Weddings) expense category. Currently, the app only supports a single salary entry per month (overwriting any previous entry for the same month). Users need the ability to record additional income sources such as freelance work, rental income, and side jobs alongside their primary salary. Additionally, the expense category dropdown needs to include "חתונות" (Weddings) as a predefined option.

## Glossary

- **Budget_Tracker**: The Israeli Budget Tracker application that manages income and expense records
- **Salary_Form**: The form in the salary tab used to enter monthly salary data with tax calculations
- **Additional_Income_Form**: A new form for entering supplementary income sources that are not subject to payslip-based tax calculations
- **Additional_Income_Entry**: A record representing a non-salary income source for a given month (e.g., freelance, rental, gifts)
- **Expense_Category_Dropdown**: The `<select>` element in the expense form that lists predefined expense categories
- **Monthly_Report**: The report showing income, expenses, and savings for a selected month
- **Annual_Report**: The report showing aggregated financial data over the last 12 months
- **StorageService**: The localStorage-based persistence layer for all financial data
- **Income_Type**: A label describing the source of income: "משכורת" (Salary) or "אחר" (Other)

## Requirements

### Requirement 1: Additional Income Data Model

**User Story:** As a user, I want additional income entries to be stored with a type, description, amount, and month, so that I can track diverse income sources separately from my salary.

#### Acceptance Criteria

1. THE Budget_Tracker SHALL define an `AdditionalIncomeEntry` type with fields: id (string), incomeType (string), description (string), amount (number), month (Date), and createdAt (Date)
2. THE Budget_Tracker SHALL define an `AdditionalIncomeInput` type with fields: incomeType (string), description (string), amount (number), and month (Date)
3. WHEN an Additional_Income_Entry is created, THE Budget_Tracker SHALL generate a unique id and set createdAt to the current timestamp
4. THE Budget_Tracker SHALL round the amount field of each Additional_Income_Entry to exactly 2 decimal places

### Requirement 2: Additional Income Persistence

**User Story:** As a user, I want my additional income entries to be saved in localStorage, so that they persist across browser sessions.

#### Acceptance Criteria

1. THE StorageService SHALL provide a `saveAdditionalIncome(entry)` method that persists an Additional_Income_Entry to localStorage
2. THE StorageService SHALL provide a `loadAdditionalIncomes()` method that returns all stored Additional_Income_Entry records with dates correctly deserialized
3. THE StorageService SHALL provide an `updateAdditionalIncome(id, entry)` method that updates an existing record by id
4. THE StorageService SHALL provide a `deleteAdditionalIncome(id)` method that removes a record by id
5. IF a record with the specified id does not exist during update or delete, THEN THE StorageService SHALL throw an error with the Hebrew message "הרשומה לא נמצאה"
6. IF localStorage write fails, THEN THE StorageService SHALL throw an error with the Hebrew message "שמירת הנתונים נכשלה. אנא נסה שוב."

### Requirement 3: Additional Income Form UI

**User Story:** As a user, I want a form in the salary tab to add additional income sources, so that I can record freelance, rental, and other income alongside my salary.

#### Acceptance Criteria

1. THE Budget_Tracker SHALL display an "הכנסות נוספות" (Additional Incomes) section in the salary tab, below the existing salary form and results
2. THE Additional_Income_Form SHALL contain a month selector, an income type dropdown, a description text field (max 200 characters), and an amount field (₪)
3. THE Additional_Income_Form SHALL include an income type dropdown with predefined options: "משכורת" (Salary), "אחר" (Other)
4. WHEN the Additional_Income_Form is submitted with valid data, THE Budget_Tracker SHALL save the entry and display a success message "✓ ההכנסה הנוספת נוספה בהצלחה!"
5. IF the amount is zero or negative, THEN THE Budget_Tracker SHALL display a validation error and prevent submission
6. IF the description exceeds 200 characters, THEN THE Budget_Tracker SHALL display a validation error and prevent submission
7. THE Additional_Income_Form SHALL default the month selector to the current month

### Requirement 4: Additional Income Entry List

**User Story:** As a user, I want to see, edit, and delete my additional income entries, so that I can manage my recorded income sources.

#### Acceptance Criteria

1. THE Budget_Tracker SHALL display a list of Additional_Income_Entry records below the Additional_Income_Form, sorted by month descending
2. WHEN the salary tab is opened, THE Budget_Tracker SHALL load and render all Additional_Income_Entry records
3. WHEN the user clicks the edit button on an Additional_Income_Entry, THE Budget_Tracker SHALL display an inline edit form pre-populated with the entry data
4. WHEN the user clicks the delete button on an Additional_Income_Entry, THE Budget_Tracker SHALL display a confirmation dialog before deleting
5. WHEN an Additional_Income_Entry is successfully deleted, THE Budget_Tracker SHALL remove the entry from the displayed list without a full page reload

### Requirement 5: Monthly Report Includes Additional Incomes

**User Story:** As a user, I want the monthly report to include my additional incomes in the total income calculation, so that I get an accurate picture of my monthly finances.

#### Acceptance Criteria

1. WHEN generating a monthly report, THE Monthly_Report SHALL sum the salary net income and all Additional_Income_Entry amounts for that month to compute total income
2. THE Monthly_Report SHALL display a breakdown showing salary net income and each additional income entry separately
3. THE Monthly_Report SHALL calculate net savings as total income (salary net + additional incomes) minus total expenses
4. IF no salary record exists but additional income entries exist for a month, THEN THE Monthly_Report SHALL use the sum of additional incomes as total income

### Requirement 6: Annual Report Includes Additional Incomes

**User Story:** As a user, I want the annual report to include additional incomes, so that my yearly financial overview is complete.

#### Acceptance Criteria

1. WHEN generating an annual report, THE Annual_Report SHALL include Additional_Income_Entry amounts in the total income for each month
2. THE Annual_Report SHALL reflect additional incomes in the total savings calculation (total income minus total expenses)

### Requirement 7: Add "חתונות" Expense Category

**User Story:** As a user, I want a "חתונות" (Weddings) category in the expense form, so that I can categorize wedding-related expenses.

#### Acceptance Criteria

1. THE Expense_Category_Dropdown SHALL include "חתונות" as a predefined option
2. THE Expense_Category_Dropdown SHALL maintain alphabetical order in Hebrew for all category options
3. WHEN "חתונות" is selected as the category and an expense is saved, THE Budget_Tracker SHALL store "חתונות" as the category value
4. THE Monthly_Report SHALL display "חתונות" expenses grouped under the "חתונות" category in the expense breakdown
