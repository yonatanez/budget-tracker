# Requirements Document

## Introduction

This document specifies enhancements to the Israeli Budget Tracker application (v2). The enhancements cover six areas: recurring expense entry, improved date selection with monthly filtering, a savings/investment tracking tab, monthly savings goals with progress visualization, a comprehensive yearly bar chart, and yearly savings goals tied to monthly targets. The app uses TypeScript compiled to JS, localStorage for persistence, and Hebrew (RTL) throughout.

## Glossary

- **Budget_Tracker**: The Israeli Budget Tracker web application
- **Expense_Form**: The UI form used to enter new expense records
- **Expense_List**: The UI list displaying expense records, filtered by selected month
- **Recurring_Expense_Generator**: The component that creates multiple individual expense records from a recurring expense configuration
- **Date_Selector**: The UI component consisting of separate month and day dropdown selectors for choosing an expense date
- **Savings_Tab**: A dedicated UI tab for tracking savings accounts, investments, and pension contributions
- **Savings_Entry**: A record representing a savings account balance, investment value, or pension contribution
- **Savings_Goal_Manager**: The component that manages monthly and yearly savings targets and calculates progress
- **Progress_Bar**: A visual indicator showing percentage completion of a savings goal
- **Annual_Report_Chart**: The bar chart in the annual report tab showing monthly breakdown of income, savings, and expenses by category
- **Monthly_Savings**: The calculated difference between net income and total expenses for a given month
- **Yearly_Savings_Goal**: A savings target for the full year, derived as 12 times the monthly savings goal

## Requirements

### Requirement 1: Recurring Expense Entry

**User Story:** As a user, I want to mark an expense as recurring over a range of months, so that I can quickly enter regular monthly expenses without repeating the process.

#### Acceptance Criteria

1. WHEN the user opens the Expense_Form, THE Expense_Form SHALL display a toggle option to mark the expense as recurring
2. WHEN the user enables the recurring toggle, THE Expense_Form SHALL display start-month and end-month selectors for defining the recurrence range
3. WHEN the user submits a recurring expense with a valid month range, THE Recurring_Expense_Generator SHALL create one separate Expense record for each month in the specified range (inclusive of start and end months)
4. THE Recurring_Expense_Generator SHALL assign each generated Expense record the same amount, category, and description as the original input
5. WHEN a recurring expense is generated, THE Recurring_Expense_Generator SHALL set the date of each generated Expense record to the same day-of-month within the respective month
6. WHEN the specified day-of-month does not exist in a target month (e.g., day 31 in a 30-day month), THE Recurring_Expense_Generator SHALL use the last day of that month instead
7. THE Budget_Tracker SHALL store each generated recurring Expense record as an independent record that the user can edit or delete individually
8. WHEN the user submits a recurring expense where the start month is after the end month, THE Expense_Form SHALL display a Hebrew validation error message and prevent submission
9. IF the Recurring_Expense_Generator fails to save any individual Expense record, THEN THE Budget_Tracker SHALL display a Hebrew error message identifying which month failed and continue saving the remaining records

### Requirement 2: Separate Month and Day Date Selectors

**User Story:** As a user, I want to select expense dates using separate month and day dropdowns, so that date entry is clearer and the expense list automatically filters to the selected month.

#### Acceptance Criteria

1. THE Expense_Form SHALL replace the single date input with two separate selectors: a month dropdown and a day dropdown
2. THE Date_Selector month dropdown SHALL display months in Hebrew (e.g., ינואר, פברואר) for the current year
3. THE Date_Selector day dropdown SHALL display valid days (1 through the last day) for the currently selected month
4. WHEN the user changes the selected month, THE Date_Selector SHALL update the day dropdown to show only valid days for the newly selected month
5. WHEN the selected day exceeds the number of days in the newly selected month, THE Date_Selector SHALL reset the day to the last valid day of that month
6. WHEN the Expense_Form loads, THE Date_Selector SHALL default to the current month and current day
7. WHEN the user selects a month in the Date_Selector, THE Expense_List SHALL filter and display only expenses belonging to the selected month
8. THE Expense_List SHALL update the displayed expenses each time the user changes the selected month in the Date_Selector

### Requirement 3: Savings and Investment Tracking Tab

**User Story:** As a user, I want a dedicated section to track my savings accounts, investments, and pension contributions, so that I can monitor my wealth-building progress separately from expenses.

#### Acceptance Criteria

1. THE Budget_Tracker SHALL display a Savings_Tab in the main navigation alongside the existing tabs (משכורת, הוצאה, דוח חודשי, דוח שנתי)
2. THE Savings_Tab SHALL display a form for adding a new Savings_Entry with the following fields: type (savings account / investment / pension), description, amount (₪), and month
3. THE Savings_Tab SHALL display the type selector with three options in Hebrew: חיסכון (savings), השקעה (investment), פנסיה (pension)
4. WHEN the user submits a valid Savings_Entry, THE Budget_Tracker SHALL persist the Savings_Entry to localStorage
5. THE Savings_Tab SHALL display a list of all saved Savings_Entry records grouped by type
6. WHEN the user clicks the edit button on a Savings_Entry, THE Savings_Tab SHALL display an inline edit form pre-populated with the existing values
7. WHEN the user clicks the delete button on a Savings_Entry, THE Budget_Tracker SHALL display a Hebrew confirmation dialog before deleting the record
8. IF the user confirms deletion, THEN THE Budget_Tracker SHALL remove the Savings_Entry from localStorage and update the displayed list
9. THE Savings_Tab SHALL display a total amount for each Savings_Entry type (savings, investment, pension)
10. WHEN the user enters a non-positive amount for a Savings_Entry, THE Savings_Tab SHALL display a Hebrew validation error and prevent submission

### Requirement 4: Monthly Savings Goal with Progress Bar

**User Story:** As a user, I want to set a monthly savings target and see a progress bar showing how close I am to reaching the goal, so that I can stay motivated and track my financial discipline.

#### Acceptance Criteria

1. THE Budget_Tracker SHALL provide a settings area (accessible from the monthly report tab) where the user can set a monthly savings goal amount in ₪
2. WHEN the user sets a monthly savings goal, THE Savings_Goal_Manager SHALL persist the goal amount to localStorage
3. THE Budget_Tracker SHALL calculate Monthly_Savings as net income minus total expenses for the selected month
4. WHEN a monthly savings goal is set and a monthly report is displayed, THE Budget_Tracker SHALL display a Progress_Bar showing the ratio of Monthly_Savings to the monthly savings goal
5. THE Progress_Bar SHALL display the current Monthly_Savings amount, the goal amount, and the percentage achieved
6. WHEN Monthly_Savings meets or exceeds the monthly savings goal, THE Progress_Bar SHALL display at 100% with a green visual indicator
7. WHEN Monthly_Savings is negative (expenses exceed income), THE Progress_Bar SHALL display at 0% with a red visual indicator and show the deficit amount
8. WHEN no monthly savings goal is set, THE Budget_Tracker SHALL not display the Progress_Bar
9. WHEN the user enters a non-positive value for the monthly savings goal, THE Budget_Tracker SHALL display a Hebrew validation error and reject the input

### Requirement 5: Yearly Bar Chart with All Components

**User Story:** As a user, I want to see a comprehensive yearly bar chart that breaks down income, savings, and expenses by category for each month, so that I can understand my full financial picture over time.

#### Acceptance Criteria

1. WHEN the user views the annual report, THE Annual_Report_Chart SHALL display a stacked/grouped bar chart with one group of bars per month for the last 12 months
2. THE Annual_Report_Chart SHALL include a bar segment for net income in each monthly group
3. THE Annual_Report_Chart SHALL include bar segments for each expense category that has data in each monthly group
4. THE Annual_Report_Chart SHALL include a bar segment for Monthly_Savings (net income minus total expenses) in each monthly group
5. THE Annual_Report_Chart SHALL display month labels in Hebrew on the x-axis
6. THE Annual_Report_Chart SHALL display amounts in ₪ on the y-axis
7. THE Annual_Report_Chart SHALL display a legend identifying each bar segment (income, each expense category, savings)
8. WHEN a month has no data (no income and no expenses), THE Annual_Report_Chart SHALL display empty bars (zero height) for that month
9. THE Annual_Report_Chart SHALL use distinct colors for income, savings, and each expense category to ensure visual clarity
10. THE Annual_Report_Chart SHALL include accessible aria-label attributes describing the chart content

### Requirement 6: Yearly Savings Goal

**User Story:** As a user, I want to see a yearly savings goal derived from my monthly goal, so that I can track my annual savings progress in the yearly report.

#### Acceptance Criteria

1. WHEN a monthly savings goal is set, THE Savings_Goal_Manager SHALL calculate the Yearly_Savings_Goal as 12 times the monthly savings goal amount
2. WHEN the user views the annual report and a monthly savings goal is set, THE Budget_Tracker SHALL display the Yearly_Savings_Goal alongside the total actual savings for the last 12 months
3. THE Budget_Tracker SHALL display a Progress_Bar in the annual report showing the ratio of total actual yearly savings to the Yearly_Savings_Goal
4. THE Progress_Bar in the annual report SHALL display the total actual savings amount, the Yearly_Savings_Goal amount, and the percentage achieved
5. WHEN total actual yearly savings meet or exceed the Yearly_Savings_Goal, THE Progress_Bar SHALL display at 100% with a green visual indicator
6. WHEN total actual yearly savings are negative, THE Progress_Bar SHALL display at 0% with a red visual indicator and show the deficit amount
7. WHEN no monthly savings goal is set, THE Budget_Tracker SHALL not display the yearly savings goal section in the annual report
