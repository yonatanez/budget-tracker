# Implementation Plan: Stock Value Calculator

## Overview

Implement the stock value calculator feature as a vertical slice across data-access, application, and presentation layers. Each step builds incrementally, starting with static data and interfaces, then API client, calculation service, and finally the UI. All new files are registered in `build.js` and exposed on `window`. Module-level constants use the `STOCK_` prefix to avoid bundle collisions.

## Tasks

- [x] 1. Create data models and static company list
  - [x] 1.1 Create `src/data-access/CompanyList.ts` with `CompanyInfo` interface and `STOCK_COMPANY_LIST` array
    - Define `CompanyInfo` interface (ticker, name, exchange, currency)
    - Populate the company list with Israeli tech employers (TASE, NASDAQ, NYSE)
    - Export `filterCompanies(query: string): CompanyInfo[]` function that filters by name or ticker (case-insensitive substring, minimum 2 chars)
    - _Requirements: 1.1, 1.2, 1.4, 1.5_

  - [ ]* 1.2 Write property test for company filter (Property 1)
    - **Property 1: Company Filter Returns Only Matching Results**
    - For any search query of 2+ characters, every returned company matches by name or ticker, and no matching company is excluded
    - **Validates: Requirements 1.2**

  - [ ]* 1.3 Write unit tests for company filter
    - Test "check" returns Check Point, "CHKP" returns Check Point (ticker match)
    - Test 1-character query returns empty, "xyz" returns empty
    - _Requirements: 1.2, 1.5_

- [x] 2. Implement StockAPIClient
  - [x] 2.1 Create `src/data-access/StockAPIClient.ts` with `StockAPIClient` class
    - Define `StockPriceResult` and `ExchangeRateResult` interfaces
    - Implement `fetchStockPrice(ticker: string): Promise<StockPriceResult>` using Yahoo Finance v8 API
    - Implement `fetchExchangeRate(from: string, to: string): Promise<ExchangeRateResult>` using USDILS=X ticker
    - Add 10-second timeout handling
    - Use `STOCK_API_BASE_URL` constant for the API base URL
    - _Requirements: 2.1, 2.4, 2.5, 4.1_

  - [ ]* 2.2 Write unit tests for StockAPIClient
    - Mock fetch to test successful price fetch, timeout, error response, exchange rate fetch
    - Test invalid API response handling
    - _Requirements: 2.1, 2.3, 2.5, 4.1_

- [x] 3. Implement StockCalculatorService
  - [x] 3.1 Create `src/application/StockCalculatorService.ts` with `StockCalculatorService` class
    - Define `StockCalculation` interface
    - Implement `calculateStockValue(ticker, companyName, shares, currency): Promise<StockCalculation>` that orchestrates API calls and computation
    - Implement `computeStockValue(price, shares, exchangeRate, currency): number` for pure calculation (price × shares × exchangeRate for USD, price × shares for ILS, rounded to 2 decimals)
    - Implement `validateShares(value: number): boolean` that accepts only positive numbers
    - _Requirements: 3.1, 3.2, 3.3, 4.4_

  - [ ]* 3.2 Write property test for stock value calculation (Property 2)
    - **Property 2: Stock Value Calculation Correctness**
    - For any positive price, positive shares, and positive exchange rate, verify formula correctness with 2-decimal rounding
    - **Validates: Requirements 3.2, 3.3, 4.4**

  - [ ]* 3.3 Write property test for share input validation (Property 3)
    - **Property 3: Share Input Validation**
    - For any numeric input, share count is accepted iff it is a positive number
    - **Validates: Requirements 3.1**

  - [ ]* 3.4 Write property test for computed value validity (Property 5)
    - **Property 5: Computed Value is a Valid stockValue**
    - For any valid inputs, output is finite, non-negative, and has ≤2 decimal places
    - **Validates: Requirements 7.2, 4.4**

  - [ ]* 3.5 Write unit tests for StockCalculatorService
    - Test ILS currency (no conversion), USD currency (with conversion)
    - Test edge cases: very large share counts, very small prices, exchange rate of 1.0
    - _Requirements: 3.2, 3.3, 4.4_

- [x] 4. Checkpoint - Core logic verification
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement StockValueCalculatorUI
  - [x] 5.1 Create `src/presentation/StockValueCalculatorUI.ts` with `StockValueCalculatorUI` class
    - Implement `init()` to render the stock calculator section in the salary form (company selector, share input, mode toggle, price display, result display)
    - Implement `filterCompanies(query)` calling the data-access filter function, showing autocomplete dropdown when 2+ chars typed
    - Implement `selectCompany(company)` to store selection, trigger price fetch, and persist to localStorage
    - Implement `setMode(mode: 'auto' | 'manual')` toggle — default to manual mode for backward compatibility
    - Implement `updateStockValue()` to recalculate and populate the existing `stockValue` field
    - Show loading indicator during API calls, error messages with retry on failure, manual fallback inputs for price and exchange rate
    - Display both original USD price and converted ILS price when conversion applies
    - All labels, messages, and placeholders in Hebrew; RTL layout
    - Use `STOCK_CALC_MESSAGES` and `STOCK_STORAGE_KEYS` constants
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 2.2, 2.3, 2.5, 3.4, 3.5, 3.6, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 8.1, 8.2, 8.3_

  - [ ]* 5.2 Write property test for persistence round-trip (Property 4)
    - **Property 4: Company Selection Persistence Round-Trip**
    - For any company, persisting and loading produces the same ticker and name
    - **Validates: Requirements 6.1, 6.2**

  - [ ]* 5.3 Write property test for price display completeness (Property 7)
    - **Property 7: Price Display Contains Required Information**
    - For any StockPriceResult, formatted display contains price, currency, and date
    - **Validates: Requirements 2.2**

  - [ ]* 5.4 Write property test for conversion display (Property 8)
    - **Property 8: Conversion Display Shows Both Currencies**
    - For any USD price with exchange rate, display contains both USD and ILS values
    - **Validates: Requirements 4.3**

  - [ ]* 5.5 Write property test for autocomplete format (Property 9)
    - **Property 9: Autocomplete Dropdown Format**
    - For any CompanyInfo, display string contains both name and ticker
    - **Validates: Requirements 8.3**

  - [ ]* 5.6 Write unit tests for StockValueCalculatorUI
    - Test default mode is manual, mode toggle behavior, auto-recalculation on input change
    - Test persisted company loads and triggers fetch, corrupted localStorage handled gracefully
    - Test loading indicator shown during fetch, error messages displayed on failure
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.2, 6.3, 2.3, 2.5_

- [x] 6. Wire into build and integrate with salary form
  - [x] 6.1 Update `build.js` to include new files and expose classes on `window`
    - Add `dist/data-access/CompanyList.js`, `dist/data-access/StockAPIClient.js`, `dist/application/StockCalculatorService.js`, `dist/presentation/StockValueCalculatorUI.js` to the `files` array
    - Add `window.StockAPIClient = StockAPIClient`, `window.StockCalculatorService = StockCalculatorService`, `window.StockValueCalculatorUI = StockValueCalculatorUI` to the window exposures
    - _Requirements: 7.1, 7.2_

  - [x] 6.2 Update `public/index.html` to add the stock calculator container element in the salary form section
    - Add a `<div id="stock-calculator-container">` inside the salary form area
    - _Requirements: 8.1, 8.2_

  - [x] 6.3 Update `public/main.js` to instantiate and initialize `StockValueCalculatorUI` on page load
    - Create `StockAPIClient`, `StockCalculatorService`, and `StockValueCalculatorUI` instances
    - Call `stockCalculatorUI.init()` after DOM is ready
    - Wire the `stockValue` field population into the existing salary form submission flow
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 6.4 Write property test for mode-independent storage (Property 6)
    - **Property 6: Stored stockValue is Mode-Independent**
    - For any numeric value, stored stockValue equals the field value regardless of auto/manual mode
    - **Validates: Requirements 7.3**

- [x] 7. Add CSS styles for stock calculator UI
  - Add styles for the stock calculator section to `public/styles.css`
    - Style the company selector autocomplete dropdown, share input, mode toggle, price display, result display, loading indicator, error messages
    - Ensure RTL layout consistency with existing styles
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 8. Final checkpoint - Full integration verification
  - Ensure all tests pass, ask the user if questions arise.
  - Run `npx tsc` then `node build.js` to verify the full build succeeds.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- All module-level constants must use `STOCK_` prefix to avoid collisions in the concatenated bundle
- After creating new `.ts` files, run `npx tsc` then `node build.js` to compile and bundle
