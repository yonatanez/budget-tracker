# Implementation Plan: Budget Tracker Enhancements V2

## Overview

Incremental implementation of six enhancements to the Israeli Budget Tracker: recurring expenses, date selectors, savings tab, savings goals with progress bars, yearly stacked bar chart, and yearly savings goals. Each task builds on previous work, starting with domain types, then data-access/application logic, then presentation, and finally wiring everything together.

## Tasks

- [x] 1. Define new domain types and factory functions
  - [x] 1.1 Add new types to `src/domain/types.ts`
    - Add `SavingsType`, `SavingsEntry`, `SavingsEntryInput`, `RecurringExpenseConfig`, and `FinancialDataV2` interfaces
    - _Requirements: 1.3, 1.4, 3.2, 3.3_
  - [x] 1.2 Add factory functions to `src/domain/models.ts`
    - Add `createSavingsEntry(input: SavingsEntryInput): SavingsEntry` with UUID generation and timestamp
    - Add `createRecurringExpenseConfig(...)` factory
    - _Requirements: 3.4, 1.3_

- [x] 2. Extend ValidationService with new validation methods
  - [x] 2.1 Add `validateRecurringExpenseConfig` to `src/data-access/ValidationService.ts`
    - Validate startMonth <= endMonth, positive amount, valid dayOfMonth (1-31)
    - Return Hebrew error messages on failure
    - _Requirements: 1.8_
  - [x] 2.2 Add `validateSavingsEntry` to `src/data-access/ValidationService.ts`
    - Validate non-empty description, positive amount, valid type, valid month
    - Return Hebrew error messages on failure
    - _Requirements: 3.10_
  - [x] 2.3 Add `validateSavingsGoal` to `src/data-access/ValidationService.ts`
    - Validate positive amount for savings goal
    - Return Hebrew error message on failure
    - _Requirements: 4.9_
  - [ ]* 2.4 Write property test: Non-positive amount validation (Property 9)
    - **Property 9: Non-positive amount validation**
    - For any number ≤ 0, validation rejects it for both SavingsEntryInput.amount and monthly savings goal with Hebrew error
    - Add to `src/data-access/ValidationService.test.ts`
    - **Validates: Requirements 3.10, 4.9**
  - [ ]* 2.5 Write unit tests for new validation methods
    - Test recurring config with valid/invalid ranges, savings entry edge cases, goal validation
    - Add to `src/data-access/ValidationService.test.ts`
    - _Requirements: 1.8, 3.10, 4.9_

- [x] 3. Extend StorageService with savings and goal persistence
  - [x] 3.1 Add savings CRUD methods to `src/data-access/StorageService.ts`
    - Implement `saveSavingsEntry`, `loadSavingsEntries`, `updateSavingsEntry`, `deleteSavingsEntry`
    - Use localStorage key `israeli-budget-tracker:savings`
    - Handle corrupted data gracefully (return empty array, log error)
    - _Requirements: 3.4, 3.8_
  - [x] 3.2 Add monthly savings goal methods to `src/data-access/StorageService.ts`
    - Implement `saveMonthlySavingsGoal`, `loadMonthlySavingsGoal`
    - Use localStorage key `israeli-budget-tracker:monthly-savings-goal`
    - _Requirements: 4.2_
  - [ ]* 3.3 Write property test: Savings entry persistence round trip (Property 6)
    - **Property 6: Savings entry persistence round trip**
    - For any valid SavingsEntry, save then load returns entry with same id, type, description, amount, month
    - Add to `src/data-access/StorageService.test.ts`
    - **Validates: Requirements 3.4**
  - [ ]* 3.4 Write property test: Savings entry deletion (Property 8)
    - **Property 8: Savings entry deletion removes from storage**
    - For any set of saved entries and any id, delete then load returns list without that id, length reduced by 1
    - Add to `src/data-access/StorageService.test.ts`
    - **Validates: Requirements 3.8**
  - [ ]* 3.5 Write property test: Monthly savings goal persistence round trip (Property 10)
    - **Property 10: Monthly savings goal persistence round trip**
    - For any positive number, save as goal then load returns same value
    - Add to `src/data-access/StorageService.test.ts`
    - **Validates: Requirements 4.2**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement RecurringExpenseGenerator
  - [x] 5.1 Create `src/application/RecurringExpenseGenerator.ts`
    - Implement `validateConfig` using ValidationService
    - Implement `generate` to produce one Expense per month in range (inclusive)
    - Implement static `clampDay` to handle day-of-month overflow (e.g., day 31 in February → 28/29)
    - Each generated expense is independent and saved individually via StorageService
    - On individual save failure, continue saving remaining records and collect failures
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 1.9_
  - [ ]* 5.2 Write property test: Recurring expense generation count and content (Property 1)
    - **Property 1: Recurring expense generation count and content**
    - For any valid config with startMonth <= endMonth, generates exactly (endMonth - startMonth + 1) records with same amount, category, description
    - Create `src/application/RecurringExpenseGenerator.test.ts`
    - **Validates: Requirements 1.3, 1.4**
  - [ ]* 5.3 Write property test: Recurring expense day assignment with clamping (Property 2)
    - **Property 2: Recurring expense day assignment with clamping**
    - For any valid config and target month, generated date day equals min(config.dayOfMonth, lastDayOfTargetMonth)
    - Add to `src/application/RecurringExpenseGenerator.test.ts`
    - **Validates: Requirements 1.5, 1.6**
  - [ ]* 5.4 Write property test: Invalid recurring range is rejected (Property 3)
    - **Property 3: Invalid recurring range is rejected**
    - For any config where startMonth > endMonth, validation fails with error
    - Add to `src/application/RecurringExpenseGenerator.test.ts`
    - **Validates: Requirements 1.8**
  - [ ]* 5.5 Write unit tests for RecurringExpenseGenerator
    - Test edge cases: day 31 in Feb, leap year, single-month range, partial save failures
    - Add to `src/application/RecurringExpenseGenerator.test.ts`
    - _Requirements: 1.5, 1.6, 1.9_

- [x] 6. Implement SavingsGoalManager
  - [x] 6.1 Create `src/application/SavingsGoalManager.ts`
    - Implement `setMonthlySavingsGoal` with validation and persistence
    - Implement `getMonthlySavingsGoal` to load from storage
    - Implement `getYearlySavingsGoal` as `monthlyGoal × 12`
    - Implement `calculateProgress` returning percentage (clamped 0-100), actual, goal, deficit
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 6.1_
  - [ ]* 6.2 Write property test: Progress calculation (Property 11)
    - **Property 11: Progress calculation**
    - For any actual and positive goal, percentage = clamp(0, 100, (actual/goal)*100); negative actual → 0% with deficit; actual ≥ goal → 100%
    - Create `src/application/SavingsGoalManager.test.ts`
    - **Validates: Requirements 4.4, 4.5, 6.3, 6.4**
  - [ ]* 6.3 Write property test: Yearly savings goal derivation (Property 14)
    - **Property 14: Yearly savings goal derivation**
    - For any positive monthly goal, yearly goal equals monthlyGoal × 12
    - Add to `src/application/SavingsGoalManager.test.ts`
    - **Validates: Requirements 6.1**
  - [ ]* 6.4 Write unit tests for SavingsGoalManager
    - Test edge cases: zero progress, exactly at goal, negative savings, no goal set
    - Add to `src/application/SavingsGoalManager.test.ts`
    - _Requirements: 4.6, 4.7, 4.8_

- [x] 7. Extend ChartDataPrepService for stacked bar chart
  - [x] 7.1 Add `prepareStackedBarChartData` to `src/application/ChartDataPrepService.ts`
    - Produce 12 Hebrew month labels, datasets for net income, each expense category, and monthly savings
    - Use distinct colors for each dataset
    - Handle months with no data (zero-height bars)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.8, 5.9_
  - [ ]* 7.2 Write property test: Stacked bar chart data preparation (Property 12)
    - **Property 12: Stacked bar chart data preparation**
    - For any 12 MonthlyReport objects: exactly 12 Hebrew labels, datasets for income + each category + savings, all data arrays length 12
    - Create `src/application/ChartDataPrepService.test.ts`
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**
  - [ ]* 7.3 Write property test: Chart colors are distinct (Property 13)
    - **Property 13: Chart colors are distinct**
    - For any set of datasets produced, all backgroundColor values are distinct
    - Add to `src/application/ChartDataPrepService.test.ts`
    - **Validates: Requirements 5.9**

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement DateSelectorManager and expense filtering
  - [x] 9.1 Create `src/presentation/DateSelectorManager.ts`
    - Render month dropdown with Hebrew month names and day dropdown
    - Update day dropdown options when month changes (valid days for selected month)
    - Clamp selected day when switching to a month with fewer days
    - Default to current month and current day on load
    - Emit month-change events to trigger expense list filtering
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  - [ ]* 9.2 Write property test: Valid days per month (Property 4)
    - **Property 4: Valid days per month in date selector**
    - For any month/year, day selector offers exactly N options where N = days in that month; day clamped on month switch
    - Create `src/presentation/DateSelector.test.ts`
    - **Validates: Requirements 2.3, 2.4, 2.5**
  - [x] 9.3 Implement expense list filtering by selected month
    - Update `src/presentation/EntryManager.ts` to filter displayed expenses by the month selected in DateSelectorManager
    - Re-filter on every month change event
    - _Requirements: 2.7, 2.8_
  - [ ]* 9.4 Write property test: Expense list filters by selected month (Property 5)
    - **Property 5: Expense list filters by selected month**
    - For any set of expenses and selected month, filtered list contains exactly expenses in that month
    - Create `src/presentation/ExpenseFilter.test.ts`
    - **Validates: Requirements 2.7, 2.8**

- [x] 10. Update expense form with recurring toggle and date selectors
  - [x] 10.1 Update expense form HTML in `public/index.html`
    - Replace single date input with month/day dropdowns from DateSelectorManager
    - Add recurring expense toggle checkbox
    - Add start-month and end-month selectors (shown when recurring is enabled)
    - _Requirements: 1.1, 1.2, 2.1_
  - [x] 10.2 Wire recurring expense form logic in EntryManager
    - Update `src/presentation/EntryManager.ts` to show/hide recurring fields on toggle
    - On submit with recurring enabled: validate config, call RecurringExpenseGenerator, display results/errors
    - On submit without recurring: use existing single-expense flow with new date selectors
    - _Requirements: 1.1, 1.2, 1.3, 1.8, 1.9_

- [x] 11. Implement SavingsTabManager
  - [x] 11.1 Add savings tab HTML to `public/index.html`
    - Add savings tab button to navigation alongside existing tabs
    - Add savings tab content area with form (type selector, description, amount, month) and entry list
    - Type selector options: חיסכון, השקעה, פנסיה
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 11.2 Create `src/presentation/SavingsTabManager.ts`
    - Implement form submission with validation (calls ValidationService, StorageService)
    - Render savings entries grouped by type with subtotals per type
    - Implement inline edit form pre-populated with existing values
    - Implement delete with Hebrew confirmation dialog
    - _Requirements: 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_
  - [ ]* 11.3 Write property test: Savings entries grouped by type with correct totals (Property 7)
    - **Property 7: Savings entries grouped by type with correct totals**
    - For any set of SavingsEntry records, grouping by type produces groups where each contains only entries of that type and total equals sum of amounts
    - Create `src/presentation/SavingsTabManager.test.ts`
    - **Validates: Requirements 3.5, 3.9**

- [x] 12. Implement ProgressBarManager and savings goal UI
  - [x] 12.1 Create `src/presentation/ProgressBarManager.ts`
    - Render progress bar with percentage, current amount, goal amount
    - Green indicator when ≥ 100%, red indicator when negative/0% with deficit display
    - Reusable for both monthly and annual report views
    - _Requirements: 4.4, 4.5, 4.6, 4.7, 6.3, 6.4, 6.5, 6.6_
  - [x] 12.2 Add monthly savings goal settings to monthly report tab
    - Add goal input field in monthly report tab settings area
    - Wire to SavingsGoalManager for persistence
    - Display progress bar when goal is set, hide when not set
    - Calculate Monthly_Savings as net income minus total expenses
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.8_
  - [x] 12.3 Add yearly savings goal display to annual report tab
    - Display Yearly_Savings_Goal (12 × monthly) alongside total actual savings
    - Display progress bar for yearly savings progress
    - Hide yearly goal section when no monthly goal is set
    - _Requirements: 6.1, 6.2, 6.3, 6.7_

- [x] 13. Extend ChartManager with stacked bar chart rendering
  - [x] 13.1 Add `renderStackedBarChart` to `src/presentation/ChartManager.ts`
    - Render Chart.js stacked/grouped bar chart using StackedBarChartData from ChartDataPrepService
    - Configure Hebrew month labels on x-axis, ₪ amounts on y-axis
    - Add legend identifying each segment (income, categories, savings)
    - Add accessible aria-label attributes to chart container
    - _Requirements: 5.1, 5.5, 5.6, 5.7, 5.10_

- [x] 14. Wire everything together in BudgetController
  - [x] 14.1 Extend `src/application/BudgetController.ts`
    - Instantiate RecurringExpenseGenerator, SavingsGoalManager
    - Add methods for savings CRUD operations (delegating to StorageService)
    - Add methods for savings goal management (delegating to SavingsGoalManager)
    - Wire stacked bar chart data preparation into annual report flow
    - _Requirements: 1.3, 3.4, 4.2, 5.1, 6.1_
  - [x] 14.2 Wire presentation components in app initialization
    - Initialize DateSelectorManager and connect to expense form and expense list filtering
    - Initialize SavingsTabManager and connect to BudgetController
    - Initialize ProgressBarManager and connect to monthly/annual report views
    - Connect stacked bar chart rendering in annual report tab
    - _Requirements: 2.1, 3.1, 4.4, 5.1, 6.2_

- [x] 15. Update styles for new UI components
  - [x] 15.1 Add CSS styles to `public/styles.css`
    - Style recurring expense toggle and month range selectors
    - Style month/day date selector dropdowns
    - Style savings tab form, entry list, type grouping, and subtotals
    - Style progress bars (green/red states, percentage display)
    - Style stacked bar chart container and legend
    - Ensure all new styles support RTL layout
    - _Requirements: 1.1, 2.1, 3.1, 4.4, 5.7_

- [x] 16. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All UI text and error messages must be in Hebrew (RTL)
- The design uses TypeScript throughout — all implementation follows existing project conventions
