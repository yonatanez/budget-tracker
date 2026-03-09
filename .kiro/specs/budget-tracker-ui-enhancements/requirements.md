# Requirements Document

## Introduction

This document specifies requirements for enhancing the Israeli Budget Tracker application with improved user experience features. The enhancements include form value persistence for faster data entry, visual expense analysis through pie charts in monthly reports, and comprehensive annual reporting with bar charts and savings calculations.

## Glossary

- **Expense_Form**: The user interface form for entering individual expense records
- **Monthly_Report**: A report displaying income, expenses, and savings for a single month
- **Annual_Report**: A report displaying aggregated financial data across 12 consecutive months
- **Expense_Category**: A classification label for expenses (e.g., מזון, תחבורה, דירה)
- **Form_State**: The current values stored in form input fields
- **Pie_Chart**: A circular statistical graphic divided into slices to show proportional data
- **Bar_Chart**: A chart presenting categorical data with rectangular bars
- **Total_Savings**: The calculated difference between total income and total expenses over a period
- **LocalStorage**: Browser-based persistent storage mechanism for client-side data
- **Tax_Credit_Points**: Israeli tax credit points (נקודות זיכוי) used to calculate tax deductions
- **Salary_Form**: The user interface form for entering salary and tax calculation parameters

## Requirements

### Requirement 1: Form Value Persistence

**User Story:** As a user entering multiple similar expenses, I want the form to remember my previous input values, so that I can quickly enter repeated expenses without re-typing common values.

#### Acceptance Criteria

1. WHEN a user successfully submits an expense, THE Expense_Form SHALL retain all submitted values in the form fields
2. WHEN the Expense_Form is displayed after a successful submission, THE Expense_Form SHALL populate all input fields with the most recently submitted values
3. THE Expense_Form SHALL persist the following fields: amount, date, category, and description
4. WHEN a user manually clears a form field, THE Expense_Form SHALL allow the field to remain empty
5. WHEN a user navigates away from the expense tab and returns, THE Expense_Form SHALL display the most recently submitted values
6. THE Expense_Form SHALL store the last submitted values in LocalStorage with key "lastExpenseInput"
7. WHEN the application loads, THE Expense_Form SHALL retrieve and populate fields from LocalStorage if previous values exist

### Requirement 2: Monthly Report Pie Chart Visualization

**User Story:** As a user reviewing my monthly expenses, I want to see a pie chart showing expense breakdown by category, so that I can quickly understand where my money is going.

#### Acceptance Criteria

1. WHEN a Monthly_Report is displayed, THE Monthly_Report SHALL include a Pie_Chart visualization
2. THE Pie_Chart SHALL display expense amounts grouped by Expense_Category
3. WHEN expenses exist in multiple categories, THE Pie_Chart SHALL show one slice per category with size proportional to the category total
4. THE Pie_Chart SHALL display the category name and amount for each slice
5. WHEN expenses have no category assigned, THE Pie_Chart SHALL group them under "ללא קטגוריה" (Uncategorized)
6. THE Pie_Chart SHALL use distinct colors for each category slice
7. WHEN a Monthly_Report has no expenses, THE Pie_Chart SHALL display a message "אין הוצאות לחודש זה" (No expenses for this month)
8. THE Pie_Chart SHALL be positioned below the monthly summary statistics and above the detailed expense list

### Requirement 3: Rent Category Addition

**User Story:** As a user tracking housing expenses, I want to categorize expenses as rent, so that I can monitor my largest monthly expense separately.

#### Acceptance Criteria

1. THE Expense_Form SHALL include "דירה" (Rent) as an available Expense_Category option
2. WHEN a user selects the category dropdown, THE Expense_Form SHALL display "דירה" in the list of categories
3. THE Expense_Form SHALL position "דירה" alphabetically among other Hebrew category names
4. WHEN an expense is saved with category "דירה", THE Monthly_Report SHALL include it in the Pie_Chart as a distinct category
5. THE Annual_Report SHALL aggregate "דירה" expenses separately from other categories

### Requirement 4: Annual Report Bar Chart Visualization

**User Story:** As a user reviewing my annual spending patterns, I want to see a bar chart showing monthly expenses across the year, so that I can identify spending trends and seasonal variations.

#### Acceptance Criteria

1. WHEN an Annual_Report is displayed, THE Annual_Report SHALL include a Bar_Chart visualization
2. THE Bar_Chart SHALL display total expenses for each month in the 12-month period
3. THE Bar_Chart SHALL show months on the horizontal axis in chronological order
4. THE Bar_Chart SHALL show expense amounts on the vertical axis
5. WHEN a month has no expenses, THE Bar_Chart SHALL display a bar with zero height for that month
6. THE Bar_Chart SHALL display month names in Hebrew using the format from LocalizationService
7. THE Bar_Chart SHALL include axis labels: "חודש" (Month) for horizontal and "הוצאות (₪)" (Expenses) for vertical
8. THE Bar_Chart SHALL be positioned at the top of the Annual_Report before other statistics

### Requirement 5: Annual Total Savings Calculation

**User Story:** As a user planning my financial future, I want to see my total savings for the year, so that I can understand my overall financial progress.

#### Acceptance Criteria

1. WHEN an Annual_Report is generated, THE Annual_Report SHALL calculate Total_Savings
2. THE Total_Savings SHALL equal the sum of all monthly net income minus the sum of all monthly expenses
3. THE Annual_Report SHALL display Total_Savings prominently with the label "חיסכון כולל לשנה" (Total Annual Savings)
4. THE Annual_Report SHALL format Total_Savings using the currency format from LocalizationService
5. WHEN Total_Savings is negative, THE Annual_Report SHALL display the value in red color
6. WHEN Total_Savings is positive, THE Annual_Report SHALL display the value in green color
7. THE Annual_Report SHALL position the Total_Savings display immediately below the Bar_Chart
8. THE Total_Savings calculation SHALL maintain exactly 2 decimal places of precision

### Requirement 6: Chart Rendering Library Integration

**User Story:** As a developer implementing chart visualizations, I want to use a lightweight charting library, so that charts render correctly without adding significant application size.

#### Acceptance Criteria

1. THE application SHALL integrate a JavaScript charting library for rendering Pie_Chart and Bar_Chart
2. THE charting library SHALL support both pie chart and bar chart types
3. THE charting library SHALL work in browser environments without requiring a build step
4. THE charting library SHALL support Hebrew text rendering in RTL direction
5. THE charting library SHALL allow customization of colors, labels, and dimensions
6. WHEN a chart is rendered, THE application SHALL ensure the chart is responsive to container width
7. THE charting library SHALL have a file size smaller than 100KB when minified

### Requirement 7: Chart Data Preparation

**User Story:** As a developer implementing chart features, I want to transform expense data into chart-compatible formats, so that charts display accurate information.

#### Acceptance Criteria

1. WHEN preparing data for a Pie_Chart, THE application SHALL aggregate expenses by Expense_Category
2. WHEN preparing data for a Bar_Chart, THE application SHALL aggregate expenses by month
3. THE application SHALL convert expense amounts to numbers with exactly 2 decimal places
4. WHEN category totals are calculated, THE application SHALL sum all expenses with matching category values
5. WHEN monthly totals are calculated, THE application SHALL sum all expenses within each month's date range
6. THE application SHALL sort Pie_Chart data by amount in descending order
7. THE application SHALL sort Bar_Chart data by month in chronological order
8. WHEN an expense has null category, THE application SHALL assign it to "ללא קטגוריה" for aggregation

### Requirement 8: Form State Persistence Across Sessions

**User Story:** As a user who closes and reopens the application, I want my last expense form values to persist, so that I can continue entering similar expenses without re-entering defaults.

#### Acceptance Criteria

1. WHEN the application is closed and reopened, THE Expense_Form SHALL restore the last submitted values from LocalStorage
2. WHEN LocalStorage contains "lastExpenseInput" data, THE Expense_Form SHALL parse and populate all fields on initialization
3. WHEN LocalStorage does not contain "lastExpenseInput" data, THE Expense_Form SHALL display empty fields
4. THE Expense_Form SHALL validate that restored date values are valid Date objects before populating
5. THE Expense_Form SHALL validate that restored amount values are positive numbers before populating
6. WHEN restored data is invalid or corrupted, THE Expense_Form SHALL display empty fields and log a warning
7. THE Expense_Form SHALL serialize form data to JSON format before storing in LocalStorage

### Requirement 9: Chart Accessibility and Responsiveness

**User Story:** As a user viewing reports on different devices, I want charts to be readable and properly sized, so that I can analyze my finances on any screen size.

#### Acceptance Criteria

1. WHEN a chart is rendered, THE chart SHALL adapt its width to the container element
2. THE Pie_Chart SHALL maintain a minimum height of 300 pixels
3. THE Bar_Chart SHALL maintain a minimum height of 400 pixels
4. WHEN the browser window is resized, THE charts SHALL redraw to fit the new dimensions
5. THE charts SHALL include alt text or aria-labels describing the data for screen readers
6. THE chart colors SHALL have sufficient contrast ratio (minimum 3:1) for accessibility
7. WHEN a user hovers over a chart element, THE chart SHALL display a tooltip with exact values
8. THE charts SHALL render correctly in both desktop and mobile viewport sizes

### Requirement 10: Configurable Tax Credit Points

**User Story:** As a user calculating my net salary, I want to configure my tax credit points (נקודות זיכוי), so that I can get accurate tax calculations based on my personal situation.

#### Acceptance Criteria

1. THE Salary_Form SHALL include an input field for Tax_Credit_Points labeled "נקודות זיכוי"
2. THE Tax_Credit_Points input SHALL accept decimal values between 0 and 10 with up to 2 decimal places
3. THE Tax_Credit_Points input SHALL have a default value of 2.25 (standard single person credit)
4. WHEN a user enters Tax_Credit_Points, THE application SHALL validate the value is within the valid range
5. WHEN Tax_Credit_Points is invalid, THE Salary_Form SHALL display an error message "נקודות זיכוי חייבות להיות בין 0 ל-10"
6. THE tax calculation SHALL incorporate Tax_Credit_Points to reduce taxable income
7. THE tax deduction from Tax_Credit_Points SHALL equal (Tax_Credit_Points × Monthly_Credit_Value) where Monthly_Credit_Value is 223 ILS per point (2024 rate)
8. THE Salary_Form SHALL persist Tax_Credit_Points value in LocalStorage with key "taxCreditPoints"
9. WHEN the application loads, THE Salary_Form SHALL restore Tax_Credit_Points from LocalStorage if a value exists
10. THE tax calculation result SHALL display the credit amount separately with label "זיכוי ממס (נקודות זיכוי)"
