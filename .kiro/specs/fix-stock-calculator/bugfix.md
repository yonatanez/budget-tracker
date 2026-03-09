# Bugfix Requirements Document

## Introduction

The stock value calculator in the Israeli Budget Tracker has two critical issues:

1. **API Failure**: The Yahoo Finance API calls (`https://query1.finance.yahoo.com/v8/finance/chart/`) fail in the browser due to CORS restrictions, making the "auto" mode (fetch stock price by ticker) non-functional. Users cannot calculate stock value from share count because the price fetch always fails.

2. **Incorrect Storage Category**: The calculated or manually entered stock value is stored as `SalaryComponents.stockValue`, which feeds into `TaxCalculator.calculateGrossSalary()` and is included in gross salary, income tax, national insurance, and health insurance calculations. The user wants stock value treated as a separate **investment** entry (via the existing `SavingsEntry` with `type: 'investment'`), not as part of salary/income.

Additionally, the user wants two clear input modes:
- **Option 1 (Auto)**: Enter number of shares → system fetches price and calculates total value in ILS
- **Option 2 (Manual)**: Enter the stock value directly as a number

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user selects a company and the system attempts to fetch the stock price via Yahoo Finance API THEN the system fails with a CORS error or HTTP error because the Yahoo Finance v8 API does not allow browser-origin requests, leaving the user with no stock price data

1.2 WHEN the stock price fetch fails THEN the system shows a manual fallback for price/exchange rate entry, but the UX flow is confusing because the user must still know the stock price and exchange rate to proceed in "auto" mode

1.3 WHEN a stock value is calculated (or manually entered) THEN the system writes the value to the `stockValue` HTML input field which maps to `SalaryComponents.stockValue`, causing the stock value to be included in gross salary and all tax/insurance calculations

1.4 WHEN a stock value is included in `SalaryComponents.stockValue` THEN the `TaxCalculator.calculateGrossSalary()` adds it to the gross salary sum, inflating income tax, national insurance, and health insurance deductions incorrectly

### Expected Behavior (Correct)

2.1 WHEN a user selects a company and the system attempts to fetch the stock price THEN the system SHALL use a CORS-compatible approach (e.g., a CORS proxy, an alternative API, or a server-side relay) so that stock price data is successfully retrieved in the browser

2.2 WHEN the stock price fetch fails THEN the system SHALL clearly offer the user the option to switch to manual value entry mode (Option 2) where they enter the total stock value directly in ILS, without needing to know the per-share price or exchange rate

2.3 WHEN a stock value is determined (either calculated from shares × price or entered manually) THEN the system SHALL store it as a `SavingsEntry` with `type: 'investment'` via the existing `StorageService.saveSavingsEntry()`, NOT as `SalaryComponents.stockValue`

2.4 WHEN a stock value is stored as an investment THEN the system SHALL NOT include it in gross salary or tax calculations — it SHALL appear only in the savings/investments section of the budget tracker

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user enters salary components (base salary, bonus, meal vouchers, other compensation, direct pension contribution) without stock value THEN the system SHALL CONTINUE TO calculate gross salary, taxes, and net income correctly as before

3.2 WHEN a user searches for a company in the Company Selector THEN the system SHALL CONTINUE TO filter and display matching companies from the predefined company list

3.3 WHEN a user selects a company THEN the system SHALL CONTINUE TO persist the selection to localStorage and restore it on page load

3.4 WHEN a user creates savings/investment entries through the existing savings tab THEN the system SHALL CONTINUE TO store and display them correctly

3.5 WHEN a user toggles between auto and manual mode in the stock calculator THEN the system SHALL CONTINUE TO switch the UI between the two input modes
