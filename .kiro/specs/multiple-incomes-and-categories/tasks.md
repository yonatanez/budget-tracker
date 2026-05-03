# Implementation Plan: Multiple Incomes and Categories

## Overview

Extend the Israeli Budget Tracker to support multiple income sources per month alongside the primary salary, and add a new "חתונות" (Weddings) expense category. Implementation starts with the domain model and validation (the foundations that all other layers depend on), then moves to persistence, then the application/report layer, then the presentation layer (new `AdditionalIncomeManager` + HTML form), and finishes by wiring the new manager into `docs/main.js` and adding the new `<option>` to the expense category dropdown. Each step builds on the previous one and ends fully integrated into the bundle produced by `build.js`.

The design includes 13 correctness properties covering the additional-income model, persistence CRUD, validation, monthly/annual report aggregation, and the presentation-layer behavior (list sort, form submission, edit pre-population, delete). Property-based tests (using `fast-check`) are placed close to the implementation they validate so defects are caught as early as possible. The "חתונות" category addition is a static HTML edit with a simple DOM assertion (no PBT, per the design's testing strategy).

## Tasks

- [x] 1. Extend the domain layer with additional-income types and factory
  - [x] 1.1 Add `IncomeType`, `AdditionalIncomeInput`, and `AdditionalIncomeEntry` to `src/domain/types.ts`
    - Define `IncomeType = 'משכורת' | 'אחר'`
    - Define `AdditionalIncomeInput` with fields: `incomeType`, `description`, `amount`, `month`
    - Define `AdditionalIncomeEntry` with fields: `id`, `incomeType`, `description`, `amount`, `month`, `createdAt`
    - Extend `MonthlyReport` with new fields: `additionalIncomes: AdditionalIncomeEntry[]`, `salaryNetIncome: number`, `additionalIncomeTotal: number` (add a comment clarifying that `netIncome` now means "total income: salary net + additional")
    - Extend `AnnualReport` with new field: `totalAdditionalIncome: number`
    - _Requirements: 1.1, 1.2, 5.1, 5.2, 6.1_

  - [x] 1.2 Implement `createAdditionalIncomeEntry` factory in `src/domain/models.ts`
    - Generate a unique `id` via `generateId()`
    - Round `amount` to 2 decimals using the existing `roundToTwoDecimals` helper
    - Set `createdAt` to `new Date()`
    - Preserve `incomeType`, `description`, `month` from input
    - Export the function from `src/domain/models.ts`
    - _Requirements: 1.3, 1.4_

  - [ ]* 1.3 Write property test for factory correctness in `src/domain/models.test.ts`
    - **Property 1: Factory correctness**
    - **Validates: Requirements 1.3, 1.4**
    - Generate random `AdditionalIncomeInput` with arbitrary `incomeType ∈ {משכורת, אחר}`, description (1–200 chars), amount (>0, finite), and month (valid Date)
    - Assert: `id` is a non-empty string; two calls produce different ids; `createdAt` is a `Date` within 2 seconds of call time; `|amount − input.amount| ≤ 0.005` and the amount has at most 2 decimal places; `incomeType`, `description`, `month` are preserved
    - Use `fast-check` with ≥100 iterations

- [x] 2. Modify `createMonthlyReport` and `createAnnualReport` to include additional incomes
  - [x] 2.1 Update `createMonthlyReport` signature and body in `src/domain/models.ts`
    - Accept a new parameter `additionalIncomes: AdditionalIncomeEntry[] = []`
    - Compute `additionalIncomeTotal = roundToTwoDecimals(sum(additionalIncomes.amount))`
    - Rename the existing `netIncome` parameter to `salaryNetIncome` internally; compute `netIncome = roundToTwoDecimals(salaryNetIncome + additionalIncomeTotal)`
    - Populate the new `additionalIncomes`, `salaryNetIncome`, `additionalIncomeTotal` fields in the returned report
    - Keep `netSavings = roundToTwoDecimals(netIncome − totalExpenses)` using the widened `netIncome`
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 2.2 Update `createAnnualReport` in `src/domain/models.ts`
    - For each of the 12 monthly reports, pass through the already-widened `netIncome` into `totalIncome`
    - Compute `totalAdditionalIncome = sum(monthlyReports[i].additionalIncomeTotal)`
    - Populate the new `totalAdditionalIncome` field on the returned `AnnualReport`
    - Keep `totalSavings = totalIncome − totalExpenses`
    - _Requirements: 6.1, 6.2_

  - [ ]* 2.3 Write property test for monthly report total income invariant in `src/domain/models.test.ts`
    - **Property 11: Monthly report total income invariant**
    - **Validates: Requirements 5.1, 5.4**
    - Generate arbitrary `salaryNetIncome ∈ [0, 1_000_000]` (including 0 to cover the no-salary case), an arbitrary list of `AdditionalIncomeEntry` (0–20 entries, each with `amount > 0` finite, aligned to the same month), and an arbitrary `Expense[]`
    - Assert: `report.netIncome ≈ salaryNetIncome + Σ incomes[i].amount` (±0.01); `report.salaryNetIncome ≈ salaryNetIncome` (±0.01); `report.additionalIncomeTotal ≈ Σ incomes[i].amount` (±0.01)

  - [ ]* 2.4 Write property test for monthly report savings invariant in `src/domain/models.test.ts`
    - **Property 12: Monthly report savings invariant**
    - **Validates: Requirement 5.3**
    - For any `MonthlyReport` produced by `createMonthlyReport`, assert `|report.netSavings − (report.netIncome − report.totalExpenses)| ≤ 0.01`

  - [ ]* 2.5 Write property test for annual report aggregation invariant in `src/domain/models.test.ts`
    - **Property 13: Annual report aggregation invariant**
    - **Validates: Requirements 6.1, 6.2**
    - Generate 12 monthly reports (each built from random salaries, additional incomes, and expenses) and feed them into `createAnnualReport`
    - Assert: `totalIncome ≈ Σ monthlyReports[i].netIncome`; `totalAdditionalIncome ≈ Σ monthlyReports[i].additionalIncomeTotal` (equivalently, sum of all additional income amounts across 12 months); `totalExpenses ≈ Σ monthlyReports[i].totalExpenses`; `|totalSavings − (totalIncome − totalExpenses)| ≤ 0.01`

- [x] 3. Checkpoint - Domain layer complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Extend `StorageService` with additional-income CRUD
  - [x] 4.1 Add storage key and CRUD methods to `src/data-access/StorageService.ts`
    - Add `ADDITIONAL_INCOMES: 'israeli-budget-tracker:additional-incomes'` to `STORAGE_KEYS`
    - Declare `saveAdditionalIncome`, `loadAdditionalIncomes`, `updateAdditionalIncome`, `deleteAdditionalIncome` on the `StorageService` interface
    - Implement each on `LocalStorageService`, mirroring the existing `saveSavingsEntry` / `loadSavingsEntries` / `updateSavingsEntry` / `deleteSavingsEntry` pattern
    - `loadAdditionalIncomes` must re-hydrate `month` and `createdAt` to `Date` objects (wrap with `new Date(...)`)
    - `update` preserves the original entry's `id` and `createdAt`
    - `update` / `delete` throw `new Error(ERROR_MESSAGES.RECORD_NOT_FOUND)` ("הרשומה לא נמצאה") when the id is not present
    - `save` wraps write errors as `new Error(ERROR_MESSAGES.SAVE_FAILED)` ("שמירת הנתונים נכשלה. אנא נסה שוב.")
    - `load` catches corrupted-JSON errors, logs via `console.error`, and returns `[]`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 4.2 Write property test for persistence round-trip in `src/data-access/StorageService.test.ts`
    - **Property 2: Persistence round-trip**
    - **Validates: Requirements 2.1, 2.2**
    - Generate an arbitrary list of `AdditionalIncomeEntry` (0–20 items, unique ids, valid fields)
    - Save each via `saveAdditionalIncome`, then call `loadAdditionalIncomes`
    - Assert: the loaded list has the same entries by `id` with matching `incomeType`, `description`, `amount`, `month.getTime()`, `createdAt.getTime()`; `month` and `createdAt` are instances of `Date` (not strings)
    - Reset `localStorage` between iterations

  - [ ]* 4.3 Write property test for update preserving identity in `src/data-access/StorageService.test.ts`
    - **Property 3: Update preserves identity**
    - **Validates: Requirement 2.3**
    - Generate a non-empty stored state, pick a random existing id, and a random replacement entry
    - After `updateAdditionalIncome(id, replacement)` and `loadAdditionalIncomes`, assert: the entry with that id has the replacement's `incomeType`, `description`, `amount`, `month`; its `id` and `createdAt` match the original; all other entries are unchanged

  - [ ]* 4.4 Write property test for delete removing only the target in `src/data-access/StorageService.test.ts`
    - **Property 4: Delete removes only the target**
    - **Validates: Requirement 2.4**
    - Generate a non-empty stored state and a random existing id
    - After `deleteAdditionalIncome(id)` and `loadAdditionalIncomes`, assert: the entry with that id is absent; all other entries are present and unchanged; the resulting list length equals the original length minus 1

  - [ ]* 4.5 Write property test for CRUD-on-unknown-id throwing Hebrew error in `src/data-access/StorageService.test.ts`
    - **Property 5: CRUD on unknown id rejects with Hebrew error**
    - **Validates: Requirement 2.5**
    - Generate an arbitrary stored state and an id not present in the state (e.g., randomly generated UUID checked against existing ids)
    - Assert: both `updateAdditionalIncome(id, anyEntry)` and `deleteAdditionalIncome(id)` reject with an `Error` whose `message === 'הרשומה לא נמצאה'`

  - [ ]* 4.6 Write unit tests for date deserialization and corrupted-data handling in `src/data-access/StorageService.test.ts`
    - Write raw JSON (with string dates) into `localStorage` at the `ADDITIONAL_INCOMES` key, assert `loadAdditionalIncomes` returns `Date` instances
    - Write malformed JSON into the key, assert `loadAdditionalIncomes` returns `[]` and logs a console error
    - Simulate a `localStorage.setItem` throw, assert `saveAdditionalIncome` rejects with "שמירת הנתונים נכשלה. אנא נסה שוב."
    - _Requirements: 2.2, 2.6_

- [x] 5. Add `validateAdditionalIncomeInput` to `ValidationService`
  - [x] 5.1 Implement `validateAdditionalIncomeInput` in `src/data-access/ValidationService.ts`
    - Add the method to the `ValidationService` interface and `DefaultValidationService` implementation
    - Validate `incomeType ∈ {משכורת, אחר}`, else push "סוג הכנסה לא חוקי"
    - Trim `description`; require length in `[1, 200]`, else push "תיאור חובה" (empty) or "התיאור חייב להיות עד 200 תווים" (too long)
    - Require `amount` finite and strictly greater than 0, else push "הסכום חייב להיות מספר חיובי"
    - Require `month` to be a valid `Date`, else push "חודש לא חוקי"
    - Return `{ isValid: errors.length === 0, errors }`
    - _Requirements: 3.5, 3.6, 1.1_

  - [ ]* 5.2 Write property test for validator correctness in `src/data-access/ValidationService.test.ts`
    - **Property 6: Validator correctness**
    - **Validates: Requirements 3.5, 3.6, and the incomeType constraint from 1.1**
    - Generate arbitrary `AdditionalIncomeInput` values (including invalid ones: non-finite amounts, amounts ≤ 0, descriptions of length 0/1/200/201, whitespace-only descriptions, invalid `incomeType` strings, invalid `Date`)
    - Assert the biconditional: `isValid === true` iff all four conditions (amount > 0 finite, description trim length in [1,200], incomeType ∈ {משכורת, אחר}, valid Date) hold
    - Assert the Hebrew error message strings match those defined in the validator

  - [ ]* 5.3 Write unit tests for boundary cases in `src/data-access/ValidationService.test.ts`
    - Description length exactly 1, 199, 200, 201 (trimmed) characters
    - Whitespace-only description (should fail)
    - Amount of `0`, `-0.01`, `Infinity`, `NaN` (all should fail)
    - Amount of `0.01` (minimum valid) should pass
    - Invalid `Date` constructed via `new Date('invalid')`
    - _Requirements: 3.5, 3.6_

- [x] 6. Extend `BudgetController` with additional-income operations and updated reports
  - [x] 6.1 Add additional-income operations to `src/application/BudgetController.ts`
    - Implement `addAdditionalIncome(input)`: calls `validationService.validateAdditionalIncomeInput`, returns validation error `Result` on failure, otherwise creates the entry via `createAdditionalIncomeEntry`, persists it via `storageService.saveAdditionalIncome`, returns `{ success: true, value: entry }`
    - Implement `getAdditionalIncomes()`: delegates to `storageService.loadAdditionalIncomes()`
    - Implement `updateAdditionalIncome(id, entry)`: delegates to `storageService.updateAdditionalIncome`
    - Implement `deleteAdditionalIncome(id)`: delegates to `storageService.deleteAdditionalIncome`
    - Add a private `filterIncomesByMonth(incomes, year, month)` helper
    - _Requirements: 2.1, 2.3, 2.4, 3.4, 4.2_

  - [x] 6.2 Modify `getMonthlyReport` in `src/application/BudgetController.ts`
    - Load salaries/expenses via `loadAllData()` and additional incomes via `loadAdditionalIncomes()`
    - Filter additional incomes to the given year/month via the new helper
    - If no salary and no matching additional incomes exist, return `null`
    - If only additional incomes exist (no salary), pass `salaryNet = 0` to `createMonthlyReport`
    - Pass the filtered `monthIncomes` array as the fourth argument to `createMonthlyReport`
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 6.3 Modify `getAnnualReport` in `src/application/BudgetController.ts`
    - For each of the 12 months in the window, fetch that month's additional incomes (using the same helper) and pass them to `createMonthlyReport`
    - Forward the resulting monthly reports into `createAnnualReport` (which already aggregates `totalAdditionalIncome` from `additionalIncomeTotal`)
    - _Requirements: 6.1, 6.2_

  - [ ]* 6.4 Write unit tests for `getMonthlyReport` and `getAnnualReport` in `src/application/BudgetController.test.ts` (create the file if it does not exist)
    - Salary-only month: report matches pre-feature behavior with `additionalIncomeTotal === 0`
    - Additional-incomes-only month (no salary): report returned (not null) with `salaryNetIncome === 0` and `netIncome === additionalIncomeTotal` (Requirement 5.4)
    - Both salary and additional incomes: `netIncome === salaryNetIncome + additionalIncomeTotal`
    - Neither: `getMonthlyReport` returns `null`
    - Annual report: `totalAdditionalIncome` equals the sum across 12 months
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2_

- [x] 7. Checkpoint - Data, validation, and application layers complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Add "חתונות" category to the expense dropdown
  - [x] 8.1 Add `<option value="חתונות">חתונות</option>` to `#expenseCategory` in `docs/index.html`
    - Insert between `<option value="חשמל ומים">` and `<option value="מזון">` so Hebrew alphabetical ordering is preserved
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 8.2 Write DOM integration test asserting "חתונות" option presence
    - In a new `src/presentation/expenseCategory.test.ts` (or an existing integration test file), load `docs/index.html` into jsdom and assert that `document.querySelector('#expenseCategory option[value="חתונות"]')` is non-null and its text content equals "חתונות"
    - _Requirements: 7.1_

- [x] 9. Create the `AdditionalIncomeManager` presentation component
  - [x] 9.1 Add the Additional Income HTML section to `docs/index.html`
    - Inside `<div class="tab-content active" id="salary-tab">`, immediately after `<div id="salary-entry-section">`, insert `<div id="additional-income-section" class="entry-section">` containing: `<h3>הכנסות נוספות</h3>`; the `<form id="additional-income-form" novalidate>` with month `<select>`, type `<select>` (options: משכורת, אחר with אחר selected by default), description `<input type="text" maxlength="200">`, amount `<input type="number" step="0.01" min="0.01">`, submit button "הוסף הכנסה נוספת"; a `<div id="additional-income-result" class="result-box">`; an `<h4>רשומות הכנסות נוספות</h4>`; and a `<div id="additional-income-list" class="entry-list">` (list container)
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 9.2 Create `src/presentation/AdditionalIncomeManager.ts`
    - Class `AdditionalIncomeManager` with constructor `(budgetController: BudgetController, validationService: ValidationService, localizationService: LocalizationService)`
    - `init()`: populate `#additionalIncomeMonth` with 12 Hebrew month options via `localizationService.getMonthName`; default the selection to the current month; attach submit handler to `#additional-income-form`; call `renderEntries()`
    - `handleFormSubmit()`: read form values; build `AdditionalIncomeInput` with `month = new Date(currentYear, selectedMonth, 1)`; call `validationService.validateAdditionalIncomeInput`; on validation failure, render Hebrew errors into `#additional-income-result`; on success, call `budgetController.addAdditionalIncome(input)`; on controller error, render the Hebrew error; on success, show exact string "✓ ההכנסה הנוספת נוספה בהצלחה!" in `#additional-income-result`, clear description/amount fields, and call `renderEntries()`
    - `renderEntries()`: load entries via `budgetController.getAdditionalIncomes()`; sort by `month` descending, breaking ties with `createdAt` descending; if empty, render empty-state "לא נמצאו הכנסות נוספות"; otherwise render one `.entry-item` per entry with `data-id` attribute, displaying the Hebrew month name, income type, description, formatted amount, plus Edit and Delete buttons
    - `formatCurrency(amount)`: use `Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' })` (match `SavingsTabManager` pattern)
    - Export the class and add `window.AdditionalIncomeManager = AdditionalIncomeManager;` to the list in `build.js` (line ~74, next to `SavingsTabManager`)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.7, 4.1, 4.2_

  - [x] 9.3 Implement edit and delete flows in `AdditionalIncomeManager`
    - `showEditForm(entry)`: build a modal overlay pre-populated with `#edit-additional-income-type` (select), `#edit-additional-income-description` (text), `#edit-additional-income-amount` (number), `#edit-additional-income-month` (select, value = `String(entry.month.getMonth() + 1)`); on submit validate via `validationService.validateAdditionalIncomeInput` and call `budgetController.updateAdditionalIncome(entry.id, { ...updated, id: entry.id, createdAt: entry.createdAt })`; refresh via `renderEntries()`; Cancel button closes modal; errors surface in a dedicated error area inside the modal
    - `showDeleteConfirmation(id)`: Hebrew confirmation modal with text "האם אתה בטוח שברצונך למחוק רשומה זו?"; buttons "מחק" (confirm) and "ביטול" (cancel); on confirm, call `budgetController.deleteAdditionalIncome(id)` and then `renderEntries()`; Escape key or click outside triggers cancel
    - Wire click handlers in `renderEntries()` to call `showEditForm` and `showDeleteConfirmation` based on `data-id`
    - _Requirements: 4.3, 4.4, 4.5_

  - [ ]* 9.4 Write property test for form-submission persistence in `src/presentation/AdditionalIncomeManager.test.ts`
    - **Property 7: Form submission persists a matching entry**
    - **Validates: Requirement 3.4**
    - Using jsdom (mirroring the `EntryManager.test.ts` setup), generate valid form inputs (month 1–12, type ∈ {משכורת, אחר}, description 1–200 trimmed chars, amount > 0 finite)
    - Populate the form, submit, await async work, then assert: exactly one new entry exists in `loadAdditionalIncomes()` whose `incomeType`, `description` and `month.getFullYear()/getMonth()` match the form, and whose `amount` equals the input rounded to 2 decimals; `#additional-income-result` contains the exact string "✓ ההכנסה הנוספת נוספה בהצלחה!"
    - Reset the DOM and `localStorage` between iterations

  - [ ]* 9.5 Write property test for rendered list sort order in `src/presentation/AdditionalIncomeManager.test.ts`
    - **Property 8: Rendered list is sorted by month descending**
    - **Validates: Requirement 4.1**
    - Generate an arbitrary list of `AdditionalIncomeEntry` (0–20 items, varied `month` and `createdAt`), pre-seed `localStorage`, call `renderEntries()`
    - Assert: the sequence of `data-id` attributes read from `#additional-income-list > .entry-item` equals the input list sorted by `(month desc, createdAt desc)`

  - [ ]* 9.6 Write property test for edit-form pre-population in `src/presentation/AdditionalIncomeManager.test.ts`
    - **Property 9: Edit form pre-population**
    - **Validates: Requirement 4.3**
    - Generate an arbitrary `AdditionalIncomeEntry`, seed storage with it, render, and click its edit button
    - Assert: `#edit-additional-income-type` value equals `entry.incomeType`; `#edit-additional-income-description` value equals `entry.description`; `#edit-additional-income-amount` value (as number) equals `entry.amount`; `#edit-additional-income-month` value equals `String(entry.month.getMonth() + 1)`

  - [ ]* 9.7 Write property test for delete removing entry from DOM and storage in `src/presentation/AdditionalIncomeManager.test.ts`
    - **Property 10: Delete removes entry from DOM and storage**
    - **Validates: Requirement 4.5**
    - Generate a non-empty rendered state and pick a random rendered entry
    - Click its delete button, click "מחק" in the confirmation modal, await async work
    - Assert: the entry's `data-id` is absent from `#additional-income-list`; the entry is absent from `loadAdditionalIncomes()`; every other entry is still present in both the DOM and storage

  - [ ]* 9.8 Write unit tests for empty state, validation errors, and storage errors in `src/presentation/AdditionalIncomeManager.test.ts`
    - Empty state: with no entries, `renderEntries()` renders "לא נמצאו הכנסות נוספות"
    - Validation error: submitting the form with an empty description renders the Hebrew error from the validator in `#additional-income-result`, and no entry is persisted
    - Storage error: mock `budgetController.addAdditionalIncome` to reject with "שמירת הנתונים נכשלה. אנא נסה שוב.", verify that message is surfaced in `#additional-income-result`
    - Edit cancel: opening the edit form and clicking Cancel leaves storage unchanged and closes the modal
    - Delete cancel: clicking "ביטול" in the delete confirmation leaves both DOM and storage unchanged
    - _Requirements: 3.4, 3.5, 3.6, 4.3, 4.4_

- [x] 10. Wire `AdditionalIncomeManager` into `docs/main.js`
  - [x] 10.1 Instantiate and initialize `AdditionalIncomeManager` in the `DOMContentLoaded` handler in `docs/main.js`
    - After `SavingsTabManager` setup, construct `new window.AdditionalIncomeManager(budgetController, validationService, localizationService)` and call `await additionalIncomeManager.init()`
    - In the existing tab-click handler branch for `btn.dataset.tab === 'salary'`, add `await additionalIncomeManager.renderEntries();` so the list stays fresh when the tab is re-activated
    - _Requirements: 3.1, 4.2_

  - [x] 10.2 Update monthly report rendering in `docs/main.js` to show the additional-income breakdown
    - In the section that renders the monthly report HTML, add a breakdown block that lists `report.salaryNetIncome` and then iterates `report.additionalIncomes` to list each entry's description, income type, and formatted amount, followed by `report.additionalIncomeTotal`
    - Use Hebrew labels ("משכורת נטו", "הכנסות נוספות")
    - The `netIncome` and `totalIncome` figures already include additional incomes (the controller now sums them), so no other changes are required
    - _Requirements: 5.1, 5.2, 6.1, 6.2_

- [x] 11. Final checkpoint - Ensure all tests pass and feature is wired end-to-end
  - Run `npm test` and confirm all unit and property-based tests pass
  - Run the build (`node build.js`) and confirm `docs/app.js` is regenerated with `window.AdditionalIncomeManager` exposed
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP. The "must-implement" core includes: domain types and factory, report aggregation, `StorageService` CRUD, validator, `BudgetController` operations and report updates, HTML form + category option, `AdditionalIncomeManager` with full CRUD flows, and `main.js` wiring.
- Each task references specific requirements for traceability.
- Property tests use `fast-check` (already available via the existing `src/application/TaxCalculator.test.ts` pattern) with ≥100 iterations per property.
- The 13 properties from the design document are all covered: Property 1 (task 1.3), Property 2 (task 4.2), Property 3 (task 4.3), Property 4 (task 4.4), Property 5 (task 4.5), Property 6 (task 5.2), Property 7 (task 9.4), Property 8 (task 9.5), Property 9 (task 9.6), Property 10 (task 9.7), Property 11 (task 2.3), Property 12 (task 2.4), Property 13 (task 2.5).
- Checkpoints at tasks 3, 7, and 11 provide incremental validation points.
- The "חתונות" category addition is verified with a DOM assertion (task 8.2), consistent with the design's testing strategy that PBT does not apply to static HTML changes.
