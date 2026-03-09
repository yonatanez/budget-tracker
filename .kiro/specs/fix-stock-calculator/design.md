# Fix Stock Calculator Bugfix Design

## Overview

The stock value calculator has two critical bugs: (1) the Yahoo Finance API fails due to CORS restrictions, making auto-mode non-functional, and (2) the calculated stock value is incorrectly stored as `SalaryComponents.stockValue`, which inflates gross salary and all tax/insurance calculations. The fix will route API calls through a CORS proxy, restructure the UI into two clear modes (Auto and Manual), and store the result as a `SavingsEntry` with `type: 'investment'` via `StorageService.saveSavingsEntry()` instead of writing to the `stockValue` salary input field.

## Glossary

- **Bug_Condition (C)**: The conditions that trigger the two bugs — (1) any browser-originated fetch to Yahoo Finance v8 API, and (2) any stock value written to `SalaryComponents.stockValue`
- **Property (P)**: The desired behavior — (1) stock price fetches succeed via CORS proxy, and (2) stock value is stored as a `SavingsEntry` with `type: 'investment'`, not included in salary/tax calculations
- **Preservation**: Existing salary calculation, company selector, localStorage persistence, savings tab, and mode-toggle behaviors that must remain unchanged
- **StockAPIClient**: The class in `src/data-access/StockAPIClient.ts` that fetches stock prices and exchange rates from Yahoo Finance v8 API
- **StockCalculatorService**: The class in `src/application/StockCalculatorService.ts` that orchestrates stock value calculation using StockAPIClient
- **StockValueCalculatorUI**: The class in `src/presentation/StockValueCalculatorUI.ts` that renders the stock calculator UI and writes results to the `stockValue` input field
- **TaxCalculator.calculateGrossSalary**: The private method in `src/application/TaxCalculator.ts` that sums all `SalaryComponents` including `stockValue` into gross salary

## Bug Details

### Fault Condition

The bug manifests in two independent ways:

**Bug 1 (CORS):** When the browser calls `fetch()` against `https://query1.finance.yahoo.com/v8/finance/chart/{ticker}`, the request fails because Yahoo Finance does not send `Access-Control-Allow-Origin` headers, causing the browser to block the response.

**Bug 2 (Wrong Storage):** When a stock value is calculated or entered, `StockValueCalculatorUI.updateStockValue()` writes the value to the hidden `#stockValue` input field, which maps to `SalaryComponents.stockValue`. `TaxCalculator.calculateGrossSalary()` then adds this value to gross salary, inflating income tax, national insurance, and health insurance.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { action: 'fetch_price' | 'store_value', ticker?: string, value?: number }
  OUTPUT: boolean

  IF input.action = 'fetch_price' THEN
    RETURN requestOrigin IS browser
           AND targetURL STARTS_WITH 'https://query1.finance.yahoo.com'
           AND response LACKS 'Access-Control-Allow-Origin' header

  IF input.action = 'store_value' THEN
    RETURN input.value > 0
           AND targetField = 'SalaryComponents.stockValue'
           AND value IS included IN TaxCalculator.calculateGrossSalary()
END FUNCTION
```

### Examples

- **CORS failure**: User selects "Check Point (CHKP)", enters 100 shares, clicks Calculate → fetch to `https://query1.finance.yahoo.com/v8/finance/chart/CHKP` fails with CORS error → user sees error message, no price data retrieved. **Expected**: Price is fetched successfully via CORS proxy.
- **Tax inflation**: User enters base salary ₪20,000 and stock value ₪50,000 → `calculateGrossSalary()` returns ₪70,000 → income tax, NI, and HI are calculated on ₪70,000 instead of ₪20,000. **Expected**: Stock value is stored as investment entry, gross salary remains ₪20,000.
- **Manual mode storage**: User switches to manual mode, enters ₪100,000 as stock value → value is written to `#stockValue` input → included in salary. **Expected**: Value is saved as `SavingsEntry` with `type: 'investment'`.
- **Edge case — zero shares**: User enters 0 shares → validation rejects (this is correct behavior and should remain unchanged).

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Salary calculation (base salary, bonus, meal vouchers, other compensation, direct pension contribution) without stock value must continue to produce correct gross salary, taxes, and net income
- Company selector search, filtering, and display must continue to work
- Company selection persistence to localStorage must continue to work
- Existing savings/investment entries created through the savings tab must continue to be stored and displayed correctly
- Mode toggle between auto and manual in the stock calculator UI must continue to switch input modes

**Scope:**
All inputs that do NOT involve stock value calculation or storage should be completely unaffected by this fix. This includes:
- All salary form submissions without stock value
- All expense entries
- All existing savings tab operations
- Company search and selection (only the downstream storage changes)
- Tax calculations for salary-only inputs

## Hypothesized Root Cause

Based on the bug description, the most likely issues are:

1. **Direct Yahoo Finance API calls from browser (CORS)**: `StockAPIClient.fetchWithTimeout()` calls `fetch(url)` directly against `https://query1.finance.yahoo.com/v8/finance/chart/...`. Yahoo Finance does not include CORS headers in responses, so the browser blocks the response. The code has no CORS proxy or alternative API path.

2. **Stock value written to salary input field**: `StockValueCalculatorUI.updateStockValue()` at line ~183 sets `document.getElementById('stockValue').value = totalILS.toString()` and dispatches an `input` event. This hidden input is part of the salary form, so when the form is submitted, the value flows into `SalaryComponents.stockValue`.

3. **TaxCalculator includes stockValue in gross salary**: `TaxCalculator.calculateGrossSalary()` explicitly sums `components.stockValue || 0` into the gross salary total, which is then used for income tax brackets, national insurance, and health insurance calculations.

4. **No integration with SavingsEntry storage**: The stock calculator UI has no reference to `StorageService` or `createSavingsEntry`. It was designed to output to the salary form rather than the savings system.

## Correctness Properties

Property 1: Fault Condition - CORS Proxy Enables Price Fetching

_For any_ stock ticker fetch request originating from the browser, the fixed `StockAPIClient` SHALL route the request through a CORS proxy (e.g., `https://api.allorigins.win/raw?url=...`) so that the response is not blocked by the browser's same-origin policy, and valid price data is returned.

**Validates: Requirements 2.1, 2.2**

Property 2: Fault Condition - Stock Value Stored as Investment Entry

_For any_ stock value calculation (auto or manual mode) that produces a positive ILS value, the fixed `StockValueCalculatorUI` SHALL create a `SavingsEntry` with `type: 'investment'` and save it via `StorageService.saveSavingsEntry()`, and SHALL NOT write the value to the `#stockValue` input field or `SalaryComponents.stockValue`.

**Validates: Requirements 2.3, 2.4**

Property 3: Preservation - Salary Calculations Exclude Stock Value

_For any_ salary calculation where `SalaryComponents` is provided (with or without a `stockValue` field), the fixed `TaxCalculator.calculateGrossSalary()` SHALL NOT include `stockValue` in the gross salary sum, preserving correct tax, national insurance, and health insurance calculations based only on salary components (base salary, bonus, meal vouchers, other compensation, direct pension contribution).

**Validates: Requirements 3.1**

Property 4: Preservation - Existing Functionality Unchanged

_For any_ interaction that does not involve stock value calculation (company search, salary form without stock, expense entries, existing savings entries), the fixed code SHALL produce exactly the same behavior as the original code, preserving all existing functionality.

**Validates: Requirements 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `src/data-access/StockAPIClient.ts`

**Function**: `fetchWithTimeout`

**Specific Changes**:
1. **Add CORS proxy wrapping**: Modify `fetchWithTimeout` (or the URL construction in `fetchStockPrice`/`fetchExchangeRate`) to route requests through a CORS proxy such as `https://api.allorigins.win/raw?url=` by prepending the proxy URL to the Yahoo Finance URL. The proxy URL should be a configurable constant (`CORS_PROXY_URL`).
2. **Encode the target URL**: The Yahoo Finance URL must be `encodeURIComponent`-encoded when passed as a query parameter to the proxy.

**File**: `src/presentation/StockValueCalculatorUI.ts`

**Function**: `updateStockValue`

**Specific Changes**:
3. **Remove salary input write**: Remove the block that sets `document.getElementById('stockValue').value` and dispatches the `input` event.
4. **Add StorageService dependency**: Accept a `StorageService` instance in the constructor (or via a setter) so the UI can save entries.
5. **Save as SavingsEntry**: After computing `totalILS`, call `createSavingsEntry({ type: 'investment', description: '{companyName} Stock ({shares} shares)', amount: totalILS, month: new Date() })` and then `storageService.saveSavingsEntry(entry)`.
6. **Add manual mode direct save**: In manual mode, when the user enters a value and confirms, create a `SavingsEntry` with `type: 'investment'` and the entered amount, then save via `StorageService`.
7. **Show confirmation**: Display a success message after saving the investment entry.

**File**: `src/application/TaxCalculator.ts`

**Function**: `calculateGrossSalary`

**Specific Changes**:
8. **Remove stockValue from gross salary**: Remove `(components.stockValue || 0)` from the sum in `calculateGrossSalary()`.

**File**: `src/domain/types.ts`

**Specific Changes**:
9. **Remove stockValue from SalaryComponents** (optional, breaking change): Consider removing `stockValue?: number` from the `SalaryComponents` interface. If backward compatibility with stored data is needed, keep the field but ensure it is ignored in calculations.

**File**: `public/index.html`

**Specific Changes**:
10. **Remove or hide stockValue input**: Remove the hidden `#stockValue` input from the salary form, or move the stock calculator container outside the salary form so it no longer feeds into salary submission.

**File**: `public/main.js`

**Specific Changes**:
11. **Pass StorageService to StockValueCalculatorUI**: Update initialization code to inject `StorageService` into the `StockValueCalculatorUI` constructor.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bugs on unfixed code, then verify the fixes work correctly and preserve existing behavior.

### Exploratory Fault Condition Checking

**Goal**: Surface counterexamples that demonstrate the bugs BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that (1) attempt to fetch stock prices and observe CORS failures, and (2) calculate stock values and verify they end up in `SalaryComponents.stockValue` and inflate gross salary. Run these tests on the UNFIXED code to observe failures.

**Test Cases**:
1. **CORS Fetch Test**: Call `StockAPIClient.fetchStockPrice('AAPL')` in a browser-like environment → observe fetch failure due to CORS (will fail on unfixed code)
2. **Stock Value in Salary Test**: Set `stockValue` input to 50000, submit salary form → observe `calculateGrossSalary()` includes 50000 (will fail on unfixed code — demonstrates the bug)
3. **Manual Mode Storage Test**: Enter manual stock value of 100000 → observe it is written to `#stockValue` input and included in salary (will fail on unfixed code)
4. **Tax Inflation Test**: Calculate taxes with baseSalary=20000 and stockValue=50000 → observe grossSalary=70000 instead of 20000 (will fail on unfixed code)

**Expected Counterexamples**:
- `fetchStockPrice` throws CORS/network error for any ticker
- `calculateGrossSalary({ baseSalary: 20000, stockValue: 50000 })` returns 70000 instead of 20000
- Possible causes: direct Yahoo Finance URL without CORS proxy, `stockValue` included in `calculateGrossSalary` sum

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed functions produce the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  IF input.action = 'fetch_price' THEN
    result := StockAPIClient_fixed.fetchStockPrice(input.ticker)
    ASSERT result.price IS number AND result.price > 0
    ASSERT requestURL STARTS_WITH CORS_PROXY_URL

  IF input.action = 'store_value' THEN
    StockValueCalculatorUI_fixed.updateStockValue()
    ASSERT saveSavingsEntry WAS called WITH type = 'investment'
    ASSERT stockValueInput.value WAS NOT set
    ASSERT TaxCalculator.calculateGrossSalary() DOES NOT include stockValue
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed functions produce the same result as the original functions.

**Pseudocode:**
```
FOR ALL salaryComponents WHERE salaryComponents.stockValue = 0 OR undefined DO
  ASSERT TaxCalculator_original.calculateNetIncome(salaryComponents)
       = TaxCalculator_fixed.calculateNetIncome(salaryComponents)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many random salary component combinations to verify tax calculations are unchanged
- It catches edge cases in tax bracket boundaries that manual tests might miss
- It provides strong guarantees that salary-only calculations are not affected by the fix

**Test Plan**: Observe behavior on UNFIXED code first for salary-only calculations, then write property-based tests capturing that behavior and verify it holds after the fix.

**Test Cases**:
1. **Salary Calculation Preservation**: Generate random `SalaryComponents` (without stockValue) → verify `calculateNetIncome` produces identical results before and after fix
2. **Company Selector Preservation**: Verify company search and selection continues to work after API client changes
3. **Savings Tab Preservation**: Verify existing savings entries are unaffected by the new investment entry storage
4. **Mode Toggle Preservation**: Verify switching between auto and manual mode continues to work in the UI

### Unit Tests

- Test `StockAPIClient.fetchStockPrice` with CORS proxy URL construction
- Test `StockAPIClient.fetchExchangeRate` with CORS proxy URL construction
- Test `TaxCalculator.calculateGrossSalary` no longer includes `stockValue`
- Test `TaxCalculator.calculateNetIncome` with various salary components (no stockValue)
- Test `StockValueCalculatorUI.updateStockValue` calls `saveSavingsEntry` with correct `SavingsEntry`
- Test `StockValueCalculatorUI.updateStockValue` does NOT write to `#stockValue` input
- Test manual mode saves value as investment entry

### Property-Based Tests

- Generate random `SalaryComponents` without `stockValue` and verify `calculateNetIncome` results match between original and fixed `TaxCalculator`
- Generate random `SalaryComponents` with `stockValue > 0` and verify `calculateGrossSalary` in fixed code does NOT include `stockValue`
- Generate random positive stock values and verify they are saved as `SavingsEntry` with `type: 'investment'`

### Integration Tests

- Test full auto-mode flow: select company → fetch price via CORS proxy → enter shares → calculate → verify investment entry saved
- Test full manual-mode flow: switch to manual → enter ILS value → confirm → verify investment entry saved
- Test salary form submission after stock calculation → verify gross salary does not include stock value
- Test that saved investment entries appear in the savings tab
