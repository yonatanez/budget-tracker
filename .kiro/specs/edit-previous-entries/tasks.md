# Implementation Plan: Edit Previous Entries

## Overview

Extend the Israeli Budget Tracker with view, edit, and delete capabilities for salary and expense records. Implementation starts with StorageService data operations, then builds the EntryManager presentation component with edit forms and confirmation dialogs, and finishes by wiring everything into the existing UI.

## Tasks

- [x] 1. Extend StorageService with update and delete methods
  - [x] 1.1 Add `updateSalary(id, salary)` and `deleteSalary(id)` methods to `StorageService` interface and `LocalStorageService` implementation in `src/data-access/StorageService.ts`
    - Add `RECORD_NOT_FOUND: 'הרשומה לא נמצאה'` to `ERROR_MESSAGES`
    - `updateSalary`: load salaries, find by `id`, throw Hebrew error if not found, replace record (preserve `id` and `createdAt`), re-sort by month descending, save
    - `deleteSalary`: load salaries, filter out by `id`, throw Hebrew error if not found, save filtered array
    - _Requirements: 7.1, 7.3, 7.5, 7.6_

  - [x] 1.2 Add `updateExpense(id, expense)` and `deleteExpense(id)` methods to `StorageService` interface and `LocalStorageService` implementation in `src/data-access/StorageService.ts`
    - `updateExpense`: same pattern as `updateSalary` but re-sorts by date descending
    - `deleteExpense`: same pattern as `deleteSalary` for expenses
    - _Requirements: 7.2, 7.4, 7.5, 7.7_

  - [x] 1.3 Write property test: update preserves id and createdAt (Property 9)
    - **Property 9: Update preserves id and createdAt**
    - **Validates: Requirements 4.2**
    - In `src/data-access/StorageService.test.ts`, generate random salary/expense records, update them with new values, verify `id` and `createdAt` are unchanged

  - [x] 1.4 Write property test: sort order preserved after update (Property 10)
    - **Property 10: Sort order preserved after update**
    - **Validates: Requirements 7.1, 7.2**
    - Generate random record lists, perform updates, verify salaries sorted by month descending and expenses sorted by date descending

  - [x] 1.5 Write property test: delete removes exactly one record (Property 11)
    - **Property 11: Delete removes exactly one record**
    - **Validates: Requirements 7.3, 7.4**
    - Generate random record lists, delete a random record, verify count decreases by 1 and deleted ID is absent

  - [x] 1.6 Write property test: non-existent ID throws Hebrew error (Property 12)
    - **Property 12: Non-existent ID throws Hebrew error**
    - **Validates: Requirements 7.5**
    - Generate random IDs not in the stored list, call update/delete, verify error is thrown with non-empty Hebrew message

  - [x] 1.7 Write property test: update round-trip (Property 13)
    - **Property 13: Update round-trip**
    - **Validates: Requirements 7.6, 7.7**
    - Generate random records, update with random valid values, call `loadAllData()`, verify the updated values are present at the matching ID

  - [x] 1.8 Write unit tests for StorageService update and delete edge cases
    - Test updating a salary record and verifying the stored data matches
    - Test deleting a salary record and verifying it's removed
    - Test updating/deleting an expense record
    - Test error thrown for non-existent ID with Hebrew message
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 2. Checkpoint - Verify StorageService extensions
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Create EntryManager presentation component
  - [x] 3.1 Create `src/presentation/EntryManager.ts` with the `EntryManager` class
    - Implement `renderSalaryList(container)`: fetch salary records via `StorageService.loadAllData()`, render sorted by month descending showing month, gross salary, net income, with edit and delete buttons per record
    - Implement `renderExpenseList(container)`: fetch expense records, render sorted by date descending showing date, amount, category, description, with edit and delete buttons per record
    - Implement `showEmptyState(container, type)`: render Hebrew empty-state message when no records exist ("לא נמצאו רשומות משכורת" / "לא נמצאו רשומות הוצאות")
    - Use RTL-compatible HTML structure consistent with existing `public/index.html` patterns
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4_

  - [x] 3.2 Implement confirmation dialog in `EntryManager`
    - `showDeleteConfirmation(type, id, onConfirm)`: show modal overlay with Hebrew text "האם אתה בטוח שברצונך למחוק רשומה זו?"
    - Two buttons: "מחק" (Delete) and "ביטול" (Cancel)
    - Cancel closes dialog without action; confirm calls the appropriate `StorageService.deleteSalary/deleteExpense` and removes the item from the list
    - Clicking outside the dialog or pressing Escape triggers cancel
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4_

  - [x] 3.3 Implement salary edit form in `EntryManager`
    - `showEditSalaryForm(record)`: populate form with existing salary component values and month
    - On submit: validate via `ValidationService.validateSalaryComponents()`, recalculate via `TaxCalculator`, call `StorageService.updateSalary()`, refresh the salary list
    - On invalid input: display Hebrew validation errors, retain form contents
    - Cancel button closes form without saving
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.4 Implement expense edit form in `EntryManager`
    - `showEditExpenseForm(record)`: populate form with existing amount, date, category, description
    - On submit: validate via `ValidationService.validateExpense()`, call `StorageService.updateExpense()`, refresh the expense list
    - On invalid input: display Hebrew validation errors, retain form contents
    - Cancel button closes form without saving
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 3.5 Write unit tests for EntryManager rendering and interactions
    - Test salary list renders with correct fields (month, gross salary, net income) and edit/delete buttons
    - Test expense list renders with correct fields (date, amount, category, description) and edit/delete buttons
    - Test empty state message displayed when no records exist
    - Test edit form pre-populated with current record values
    - Test cancel on edit form leaves storage unchanged
    - Test cancel on confirmation dialog leaves storage unchanged
    - Test confirmation dialog appears on delete click
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.5, 4.1, 4.5, 5.1, 5.4, 6.1, 6.4_

- [x] 4. Checkpoint - Verify EntryManager component
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Integrate EntryManager into the application UI
  - [x] 5.1 Add entry list tabs/sections to `public/index.html`
    - Add HTML containers for salary entry list and expense entry list within the existing tab structure
    - Add CSS styles for entry list items, edit forms, confirmation dialog modal, and empty state in `public/styles.css`
    - _Requirements: 1.1, 2.1_

  - [x] 5.2 Wire EntryManager into `public/main.js`
    - Import and instantiate `EntryManager` with `StorageService`, `ValidationService`, and `TaxCalculator` dependencies
    - Call `renderSalaryList` and `renderExpenseList` on tab navigation
    - Refresh entry lists after new salary/expense is saved (so newly created records appear immediately)
    - _Requirements: 1.1, 2.1, 8.1, 8.2_

  - [x] 5.3 Write unit tests for report consistency after edits and deletions
    - Verify that after editing a salary record, generating a monthly/annual report reflects the updated net income
    - Verify that after deleting an expense record, generating a report reflects the removal
    - _Requirements: 8.1, 8.2_

- [x] 6. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document (Properties 9–13)
- The `EntryManager` is built as a TypeScript class in `src/presentation/` and compiled to `dist/` via the existing build pipeline, then consumed by `public/main.js`
- No new data models are needed; existing `SalaryRecord`, `Expense`, and `FinancialData` types are sufficient
