# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Fault Condition** - Stock Value Inflates Gross Salary
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the tax inflation bug exists
  - **Scoped PBT Approach**: Scope the property to salary components where `stockValue > 0`. For any `SalaryComponents` with a positive `stockValue`, the gross salary should NOT include the stock value. Generate random `baseSalary` (1–100000), `bonus` (optional), `mealVouchers` (optional), `otherCompensation` (optional), and `stockValue` (1–50000). Assert that `calculateNetIncome(components).grossSalary` equals the sum of all components EXCLUDING `stockValue`.
  - Test file: `src/application/TaxCalculator.bugfix.test.ts`
  - Use `fast-check` (`fc`) to generate random `SalaryComponents` with `stockValue > 0`
  - The test assertions should match Expected Behavior Property 3 from design: `calculateGrossSalary()` SHALL NOT include `stockValue`
  - Concrete example to document: `calculateNetIncome({ baseSalary: 20000, stockValue: 50000 }).grossSalary` returns 70000 instead of expected 20000
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists because `stockValue` is currently included in gross salary)
  - Document counterexamples found to understand root cause
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.3, 1.4, 2.4_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Salary Calculations Without Stock Value Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: `calculateNetIncome({ baseSalary: 5000 })` returns `netIncome: 3904` on unfixed code
  - Observe: `calculateNetIncome({ baseSalary: 10000 })` returns `netIncome: 7540.94` on unfixed code
  - Observe: `calculateNetIncome({ baseSalary: 50000 })` returns `netIncome: 27819.14` on unfixed code
  - Test file: `src/application/TaxCalculator.bugfix.test.ts` (append to same file)
  - Write property-based test using `fast-check`: for all `SalaryComponents` where `stockValue` is `undefined` or `0`, capture the `calculateNetIncome` result from the UNFIXED code, then assert the FIXED code produces identical results
  - Simpler approach: generate random `SalaryComponents` WITHOUT `stockValue` (baseSalary: 1–100000, optional bonus, mealVouchers, otherCompensation, directPensionContribution). Assert `grossSalary` equals `baseSalary + (bonus||0) + (mealVouchers||0) + (otherCompensation||0) + (directPensionContribution||0)` and `netIncome` equals `cashIncome - incomeTax - nationalInsurance - healthInsurance - pensionEmployee - studyFundEmployee`
  - These properties hold on BOTH unfixed and fixed code since they don't involve `stockValue`
  - Verify test passes on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix stock calculator bugs

  - [x] 3.1 Add CORS proxy to StockAPIClient
    - In `src/data-access/StockAPIClient.ts`, add a `CORS_PROXY_URL` constant set to `'https://api.allorigins.win/raw?url='`
    - Modify `fetchStockPrice` and `fetchExchangeRate` to wrap the Yahoo Finance URL: `CORS_PROXY_URL + encodeURIComponent(yahooUrl)`
    - Keep `fetchWithTimeout` unchanged — only the URL passed to it changes
    - _Bug_Condition: isBugCondition({ action: 'fetch_price' }) where requestOrigin IS browser AND targetURL starts with Yahoo Finance API_
    - _Expected_Behavior: Stock price fetches succeed via CORS proxy, valid price data returned_
    - _Preservation: fetchWithTimeout timeout/abort behavior unchanged_
    - _Requirements: 1.1, 2.1, 2.2_

  - [x] 3.2 Remove stockValue from TaxCalculator.calculateGrossSalary
    - In `src/application/TaxCalculator.ts`, remove `(components.stockValue || 0) +` from the `calculateGrossSalary` method
    - The gross salary sum should only include: `baseSalary + bonus + mealVouchers + otherCompensation + directPensionContribution`
    - _Bug_Condition: isBugCondition({ action: 'store_value' }) where stockValue > 0 AND included in calculateGrossSalary_
    - _Expected_Behavior: calculateGrossSalary() does NOT include stockValue in the sum_
    - _Preservation: All salary calculations without stockValue produce identical results_
    - _Requirements: 1.3, 1.4, 2.4, 3.1_

  - [x] 3.3 Update StockValueCalculatorUI to save as SavingsEntry
    - In `src/presentation/StockValueCalculatorUI.ts`:
    - Add `StorageService` as a constructor parameter and store as instance field
    - In `updateStockValue()`, remove the block that sets `stockValueInput.value` and dispatches the `input` event
    - Instead, create a `SavingsEntryInput` with `type: 'investment'`, `description: '{companyName} Stock ({shares} shares)'`, `amount: totalILS`, `month: new Date()`
    - Call `this.storageService.saveSavingsEntry(entry)` to persist the investment
    - Add manual mode save: when user enters a value directly, also save as `SavingsEntry` with `type: 'investment'`
    - Show a confirmation message after saving
    - _Bug_Condition: isBugCondition({ action: 'store_value' }) where value written to SalaryComponents.stockValue_
    - _Expected_Behavior: Stock value saved as SavingsEntry with type 'investment' via StorageService_
    - _Preservation: Existing savings entries and savings tab unaffected_
    - _Requirements: 1.3, 2.3, 2.4, 3.4_

  - [x] 3.4 Update index.html — remove stockValue input and move stock calculator outside salary form
    - In `public/index.html`, remove or hide the `#stockValue` hidden input from the salary form
    - Move the stock calculator container (`#stock-calculator-container` or equivalent) outside the salary `<form>` element so it no longer participates in form submission
    - _Bug_Condition: stockValue input inside salary form feeds into SalaryComponents_
    - _Expected_Behavior: Stock calculator is independent of salary form_
    - _Preservation: Salary form layout and submission unchanged for all other fields_
    - _Requirements: 2.3, 2.4_

  - [x] 3.5 Pass StorageService to StockValueCalculatorUI in main.js
    - In `public/main.js`, update the `StockValueCalculatorUI` instantiation to pass the existing `StorageService` instance as a constructor argument
    - Ensure `StorageService` is imported/available in the initialization scope
    - _Requirements: 2.3_

  - [x] 3.6 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Stock Value Excluded from Gross Salary
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior: `grossSalary` should not include `stockValue`
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.4, 3.1_

  - [x] 3.7 Verify preservation tests still pass
    - **Property 2: Preservation** - Salary Calculations Without Stock Value Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

- [x] 4. Checkpoint - Ensure all tests pass
  - Run full test suite to verify no regressions
  - Ensure exploration test (Property 1) passes after fix
  - Ensure preservation test (Property 2) passes after fix
  - Ensure existing TaxCalculator tests still pass
  - Ask the user if questions arise
