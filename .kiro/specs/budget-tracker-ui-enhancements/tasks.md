# Implementation Plan: Budget Tracker UI Enhancements

## Overview

This implementation plan adds three major enhancements to the Israeli Budget Tracker: form value persistence using LocalStorage, visual expense analysis through Chart.js pie and bar charts, and comprehensive annual reporting with total savings calculations. The implementation follows an incremental approach, building core services first, then integrating them into the UI layer, with property-based testing throughout.

## Tasks

- [x] 1. Set up Chart.js library and core infrastructure
  - Add Chart.js v4.x via CDN to index.html
  - Configure Chart.js for Hebrew/RTL support
  - Create color palette constants for chart categories
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.7_

- [x] 2. Add rent category to expense categories
  - [x] 2.1 Add "דירה" to EXPENSE_CATEGORIES constant
    - Update the category list in the appropriate location
    - Ensure alphabetical ordering in Hebrew
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ]* 2.2 Write unit tests for rent category
    - Test rent category appears in dropdown
    - Test alphabetical ordering with rent included
    - _Requirements: 3.1, 3.3_

- [x] 3. Implement FormPersistenceService
  - [x] 3.1 Create FormPersistenceService class with TypeScript interfaces
    - Define ExpenseFormState interface
    - Implement saveFormState() method
    - Implement loadFormState() method
    - Implement clearFormState() method
    - Use LocalStorage key "lastExpenseInput"
    - _Requirements: 1.3, 1.6, 8.7_
  
  - [x] 3.2 Add validation for restored form values
    - Validate date values are valid Date objects
    - Validate amount values are positive numbers
    - Handle corrupted JSON gracefully
    - _Requirements: 8.4, 8.5, 8.6_
  
  - [ ]* 3.3 Write property test for form state round-trip
    - **Property 3: Form State Round-Trip Through LocalStorage**
    - **Validates: Requirements 1.7, 8.7**
  
  - [ ]* 3.4 Write unit tests for FormPersistenceService
    - Test save and load with valid data
    - Test corrupted JSON handling
    - Test missing LocalStorage data
    - Test date validation
    - Test amount validation
    - _Requirements: 1.6, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 4. Implement ChartDataPrepService
  - [x] 4.1 Create ChartDataPrepService class with TypeScript interfaces
    - Define PieChartData interface
    - Define BarChartData interface
    - Define CategoryAggregation interface
    - Define MonthlyAggregation interface
    - _Requirements: 7.1, 7.2_
  
  - [x] 4.2 Implement preparePieChartData() method
    - Aggregate expenses by category
    - Map null categories to "ללא קטגוריה"
    - Sort by amount descending
    - Round amounts to 2 decimal places
    - Assign distinct colors to categories
    - _Requirements: 2.2, 2.5, 7.1, 7.3, 7.6, 7.8_
  
  - [x] 4.3 Implement prepareBarChartData() method
    - Aggregate expenses by month
    - Sort chronologically
    - Use LocalizationService for month names
    - Round amounts to 2 decimal places
    - _Requirements: 4.2, 4.3, 4.6, 7.2, 7.3, 7.7_
  
  - [ ]* 4.4 Write property test for pie chart category aggregation
    - **Property 4: Pie Chart Category Aggregation**
    - **Validates: Requirements 2.2, 7.1**
  
  - [ ]* 4.5 Write property test for pie chart slice count
    - **Property 5: Pie Chart Slice Count Matches Category Count**
    - **Validates: Requirements 2.3**
  
  - [ ]* 4.6 Write property test for pie chart data completeness
    - **Property 6: Pie Chart Data Completeness**
    - **Validates: Requirements 2.4**
  
  - [ ]* 4.7 Write property test for null category mapping
    - **Property 7: Null Category Mapping**
    - **Validates: Requirements 2.5**
  
  - [ ]* 4.8 Write property test for distinct colors
    - **Property 8: Distinct Colors for Categories**
    - **Validates: Requirements 2.6**
  
  - [ ]* 4.9 Write property test for category alphabetical ordering
    - **Property 9: Category List Alphabetical Ordering**
    - **Validates: Requirements 3.3**
  
  - [ ]* 4.10 Write property test for bar chart monthly aggregation
    - **Property 10: Bar Chart Monthly Aggregation**
    - **Validates: Requirements 4.2, 7.2**
  
  - [ ]* 4.11 Write property test for bar chart chronological ordering
    - **Property 11: Bar Chart Chronological Ordering**
    - **Validates: Requirements 4.3**
  
  - [ ]* 4.12 Write property test for bar chart month name localization
    - **Property 12: Bar Chart Month Name Localization**
    - **Validates: Requirements 4.6**
  
  - [ ]* 4.13 Write property test for decimal precision
    - **Property 17: Decimal Precision in Aggregations**
    - **Validates: Requirements 7.3**
  
  - [ ]* 4.14 Write property test for pie chart descending sort
    - **Property 18: Pie Chart Descending Sort Order**
    - **Validates: Requirements 7.6**
  
  - [ ]* 4.15 Write unit tests for ChartDataPrepService
    - Test empty expense arrays
    - Test single category aggregation
    - Test multiple category aggregation
    - Test null category handling
    - Test chronological sorting
    - _Requirements: 7.1, 7.2, 7.3, 7.6, 7.7, 7.8_

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement ChartManager
  - [x] 6.1 Create ChartManager class with TypeScript interfaces
    - Define ChartOptions interface
    - Implement renderPieChart() method
    - Implement renderBarChart() method
    - Implement destroyChart() method
    - Store chart instances for cleanup
    - _Requirements: 6.1, 6.2_
  
  - [x] 6.2 Configure Chart.js for accessibility and responsiveness
    - Set responsive: true
    - Set RTL locale to 'he'
    - Add ARIA labels to canvas elements
    - Configure tooltips for hover values
    - Set minimum heights (300px pie, 400px bar)
    - _Requirements: 6.4, 6.6, 9.1, 9.2, 9.3, 9.4, 9.5, 9.7_
  
  - [x] 6.3 Implement color contrast validation
    - Ensure all chart colors meet 3:1 contrast ratio
    - _Requirements: 9.6_
  
  - [ ]* 6.4 Write property test for chart accessibility labels
    - **Property 21: Chart Accessibility Labels**
    - **Validates: Requirements 9.5**
  
  - [ ]* 6.5 Write property test for color contrast ratio
    - **Property 22: Color Contrast Ratio**
    - **Validates: Requirements 9.6**
  
  - [ ]* 6.6 Write unit tests for ChartManager
    - Test pie chart rendering with valid data
    - Test bar chart rendering with valid data
    - Test chart destruction
    - Test Chart.js initialization errors
    - Test RTL configuration
    - Test accessibility labels
    - _Requirements: 6.1, 6.2, 6.4, 6.6, 9.5_

- [x] 7. Integrate form persistence into expense form UI
  - [x] 7.1 Initialize FormPersistenceService in main.js
    - Create service instance
    - Load form state on page load
    - Populate form fields with restored values
    - _Requirements: 1.7, 8.1, 8.2_
  
  - [x] 7.2 Save form state after successful expense submission
    - Call saveFormState() after addExpense() succeeds
    - Retain form values in UI after submission
    - _Requirements: 1.1, 1.2_
  
  - [x] 7.3 Preserve form state during tab navigation
    - Ensure form values persist when switching tabs
    - _Requirements: 1.5_
  
  - [ ]* 7.4 Write property test for form value persistence after submission
    - **Property 1: Form Value Persistence After Submission**
    - **Validates: Requirements 1.1**
  
  - [ ]* 7.5 Write property test for form state persistence across tab navigation
    - **Property 2: Form State Persistence Across Tab Navigation**
    - **Validates: Requirements 1.5**
  
  - [ ]* 7.6 Write property test for restored date validation
    - **Property 19: Restored Date Validation**
    - **Validates: Requirements 8.4**
  
  - [ ]* 7.7 Write property test for restored amount validation
    - **Property 20: Restored Amount Validation**
    - **Validates: Requirements 8.5**
  
  - [ ]* 7.8 Write integration tests for form persistence
    - Test form submission triggers persistence
    - Test form restoration on page load
    - Test tab navigation preserves values
    - _Requirements: 1.1, 1.5, 1.7_

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Enhance monthly report with pie chart
  - [x] 9.1 Add pie chart container to monthly report HTML
    - Add canvas element with ID "monthlyPieChart"
    - Position below summary statistics
    - Add "אין הוצאות לחודש זה" message for empty data
    - _Requirements: 2.1, 2.7, 2.8_
  
  - [x] 9.2 Integrate ChartDataPrepService and ChartManager in monthly report
    - Call preparePieChartData() with monthly expenses
    - Call renderPieChart() with prepared data
    - Destroy previous chart before rendering new one
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [x] 9.3 Handle empty expense list in monthly report
    - Display "אין הוצאות לחודש זה" when no expenses
    - Hide chart canvas when no data
    - _Requirements: 2.7_
  
  - [ ]* 9.4 Write integration tests for monthly report pie chart
    - Test pie chart renders with expenses
    - Test empty expense message displays
    - Test rent category appears in chart
    - _Requirements: 2.1, 2.7, 3.4_

- [x] 10. Implement total savings calculation
  - [x] 10.1 Add calculateTotalSavings() method to BudgetController
    - Sum all monthly net incomes
    - Sum all monthly expenses
    - Calculate difference with 2 decimal precision
    - _Requirements: 5.1, 5.2, 5.8_
  
  - [x] 10.2 Add total savings display to annual report HTML
    - Add element with label "חיסכון כולל לשנה"
    - Position below bar chart
    - Apply green color for positive, red for negative
    - Format using LocalizationService.formatCurrency()
    - _Requirements: 5.3, 5.4, 5.5, 5.6, 5.7_
  
  - [ ]* 10.3 Write property test for total savings calculation
    - **Property 13: Total Savings Calculation Correctness**
    - **Validates: Requirements 5.2, 5.8**
  
  - [ ]* 10.4 Write property test for total savings currency formatting
    - **Property 14: Total Savings Currency Formatting**
    - **Validates: Requirements 5.4**
  
  - [ ]* 10.5 Write property test for negative savings color coding
    - **Property 15: Negative Savings Color Coding**
    - **Validates: Requirements 5.5**
  
  - [ ]* 10.6 Write property test for positive savings color coding
    - **Property 16: Positive Savings Color Coding**
    - **Validates: Requirements 5.6**
  
  - [ ]* 10.7 Write unit tests for total savings calculation
    - Test positive savings
    - Test negative savings
    - Test zero savings
    - Test decimal precision
    - _Requirements: 5.2, 5.8_

- [x] 11. Enhance annual report with bar chart
  - [x] 11.1 Add bar chart container to annual report HTML
    - Add canvas element with ID "annualBarChart"
    - Position at top of annual report
    - Add axis labels: "חודש" and "הוצאות (₪)"
    - _Requirements: 4.1, 4.7, 4.8_
  
  - [x] 11.2 Integrate ChartDataPrepService and ChartManager in annual report
    - Call prepareBarChartData() with monthly reports
    - Call renderBarChart() with prepared data
    - Destroy previous chart before rendering new one
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [x] 11.3 Handle months with no expenses in bar chart
    - Display zero-height bars for empty months
    - _Requirements: 4.5_
  
  - [ ]* 11.4 Write integration tests for annual report bar chart
    - Test bar chart renders with 12 months
    - Test chronological ordering
    - Test zero-height bars for empty months
    - Test Hebrew month names
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6_

- [x] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Implement tax credit points configuration
  - [x] 13.1 Add tax credit points input to salary form HTML
    - Add input field with label "נקודות זיכוי"
    - Set default value to 2.25
    - Add validation for range 0-10 with 2 decimals
    - Add error message element for validation errors
    - _Requirements: 10.1, 10.3, 10.4, 10.5_
  
  - [x] 13.2 Implement tax credit points persistence
    - Save to LocalStorage with key "taxCreditPoints"
    - Load from LocalStorage on page load
    - _Requirements: 10.8, 10.9_
  
  - [x] 13.3 Enhance TaxCalculator to support tax credit points
    - Add taxCreditPoints parameter to calculation method
    - Calculate credit deduction: points × 223
    - Subtract credit from calculated tax
    - Ensure tax never goes negative
    - Return credit deduction in result
    - _Requirements: 10.6, 10.7_
  
  - [x] 13.4 Update tax calculation result display
    - Add separate line for "זיכוי ממס (נקודות זיכוי)"
    - Display credit deduction amount
    - _Requirements: 10.10_
  
  - [ ]* 13.5 Write property test for tax credit points range validation
    - **Property 23: Tax Credit Points Range Validation**
    - **Validates: Requirements 10.2, 10.4**
  
  - [ ]* 13.6 Write property test for tax credit deduction calculation
    - **Property 24: Tax Credit Deduction Calculation**
    - **Validates: Requirements 10.7**
  
  - [ ]* 13.7 Write property test for tax credit points persistence
    - **Property 25: Tax Credit Points Persistence**
    - **Validates: Requirements 10.8, 10.9**
  
  - [ ]* 13.8 Write property test for non-negative tax after credit
    - **Property 26: Non-Negative Tax After Credit**
    - **Validates: Requirements 10.6**
  
  - [ ]* 13.9 Write unit tests for tax credit points
    - Test default value (2.25)
    - Test custom values
    - Test range validation
    - Test decimal precision validation
    - Test credit deduction calculation
    - Test persistence to LocalStorage
    - Test restoration from LocalStorage
    - _Requirements: 10.2, 10.3, 10.4, 10.6, 10.7, 10.8, 10.9_

- [x] 14. Final integration and wiring
  - [x] 14.1 Wire all services together in main.js
    - Initialize all service instances
    - Connect form submission to persistence
    - Connect report generation to chart rendering
    - Connect tax calculation to credit points
    - _Requirements: All_
  
  - [x] 14.2 Add CSS styles for charts and new UI elements
    - Style chart containers
    - Style total savings display with color coding
    - Style tax credit points input
    - Ensure responsive layout for mobile
    - _Requirements: 5.5, 5.6, 9.1, 9.2, 9.3, 9.8_
  
  - [ ]* 14.3 Write end-to-end integration tests
    - Test complete expense entry flow with persistence
    - Test monthly report with pie chart
    - Test annual report with bar chart and savings
    - Test rent category throughout the flow
    - Test tax calculation with credit points
    - _Requirements: All_

- [x] 15. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties (26 total)
- Unit tests validate specific examples and edge cases
- All property tests should use fast-check with minimum 100 iterations
- Chart.js is loaded via CDN (no build step required)
- All amounts maintain 2 decimal precision throughout
- Hebrew/RTL support is maintained across all new features
