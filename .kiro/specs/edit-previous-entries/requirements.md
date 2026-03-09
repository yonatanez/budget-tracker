# Requirements Document

## Introduction

This feature adds the ability to view, edit, and delete previously entered salary records and expense records in the Israeli Budget Tracker application. Currently, users can enter salaries and expenses but have no way to review individual entries, correct mistakes, or remove records. This feature introduces entry management UI and the corresponding data operations.

## Glossary

- **Entry_Manager**: The UI component responsible for displaying, editing, and deleting salary and expense records
- **Storage_Service**: The data persistence layer that reads and writes records to localStorage
- **Salary_Record**: A stored salary entry containing salary components, month, tax calculation, and metadata (id, createdAt)
- **Expense_Record**: A stored expense entry containing amount, date, category, description, and metadata (id, createdAt)
- **Confirmation_Dialog**: A modal dialog that asks the user to confirm a destructive action before it is executed
- **Entry_List**: A scrollable list displaying stored records with summary information and action controls
- **Edit_Form**: A pre-populated form that allows the user to modify the fields of an existing record

## Requirements

### Requirement 1: View Stored Salary Records

**User Story:** As a user, I want to see a list of all my previously entered salary records, so that I can review my salary history.

#### Acceptance Criteria

1. WHEN the user navigates to the salary tab, THE Entry_Manager SHALL display an Entry_List of all stored Salary_Records sorted by month in descending order
2. THE Entry_Manager SHALL display the month, gross salary, and net income for each Salary_Record in the Entry_List
3. IF no Salary_Records exist in the Storage_Service, THEN THE Entry_Manager SHALL display a message indicating no salary records have been entered
4. THE Entry_Manager SHALL display an edit button and a delete button for each Salary_Record in the Entry_List

### Requirement 2: View Stored Expense Records

**User Story:** As a user, I want to see a list of all my previously entered expense records, so that I can review my spending history.

#### Acceptance Criteria

1. WHEN the user navigates to the expense tab, THE Entry_Manager SHALL display an Entry_List of all stored Expense_Records sorted by date in descending order
2. THE Entry_Manager SHALL display the date, amount, category, and description for each Expense_Record in the Entry_List
3. IF no Expense_Records exist in the Storage_Service, THEN THE Entry_Manager SHALL display a message indicating no expense records have been entered
4. THE Entry_Manager SHALL display an edit button and a delete button for each Expense_Record in the Entry_List

### Requirement 3: Edit a Salary Record

**User Story:** As a user, I want to edit a previously entered salary record, so that I can correct mistakes in my salary data.

#### Acceptance Criteria

1. WHEN the user clicks the edit button on a Salary_Record, THE Entry_Manager SHALL display an Edit_Form pre-populated with the existing salary component values and month
2. WHEN the user submits the Edit_Form with valid salary data, THE Storage_Service SHALL update the existing Salary_Record with the new values and recalculated tax results
3. WHEN the user submits the Edit_Form with valid salary data, THE Entry_Manager SHALL update the Entry_List to reflect the changes
4. IF the user submits the Edit_Form with invalid salary data, THEN THE Entry_Manager SHALL display validation error messages in Hebrew and retain the Edit_Form contents
5. WHEN the user clicks a cancel button on the Edit_Form, THE Entry_Manager SHALL close the Edit_Form without modifying the Salary_Record

### Requirement 4: Edit an Expense Record

**User Story:** As a user, I want to edit a previously entered expense record, so that I can correct mistakes in my expense data.

#### Acceptance Criteria

1. WHEN the user clicks the edit button on an Expense_Record, THE Entry_Manager SHALL display an Edit_Form pre-populated with the existing amount, date, category, and description
2. WHEN the user submits the Edit_Form with valid expense data, THE Storage_Service SHALL update the existing Expense_Record with the new values while preserving the original id and createdAt
3. WHEN the user submits the Edit_Form with valid expense data, THE Entry_Manager SHALL update the Entry_List to reflect the changes
4. IF the user submits the Edit_Form with invalid expense data, THEN THE Entry_Manager SHALL display validation error messages in Hebrew and retain the Edit_Form contents
5. WHEN the user clicks a cancel button on the Edit_Form, THE Entry_Manager SHALL close the Edit_Form without modifying the Expense_Record

### Requirement 5: Delete a Salary Record

**User Story:** As a user, I want to delete a previously entered salary record, so that I can remove incorrect or duplicate entries.

#### Acceptance Criteria

1. WHEN the user clicks the delete button on a Salary_Record, THE Entry_Manager SHALL display a Confirmation_Dialog asking the user to confirm the deletion
2. WHEN the user confirms the deletion in the Confirmation_Dialog, THE Storage_Service SHALL remove the Salary_Record from persistent storage
3. WHEN the user confirms the deletion in the Confirmation_Dialog, THE Entry_Manager SHALL remove the Salary_Record from the Entry_List
4. WHEN the user cancels the deletion in the Confirmation_Dialog, THE Entry_Manager SHALL close the Confirmation_Dialog without modifying the Salary_Record

### Requirement 6: Delete an Expense Record

**User Story:** As a user, I want to delete a previously entered expense record, so that I can remove incorrect or duplicate entries.

#### Acceptance Criteria

1. WHEN the user clicks the delete button on an Expense_Record, THE Entry_Manager SHALL display a Confirmation_Dialog asking the user to confirm the deletion
2. WHEN the user confirms the deletion in the Confirmation_Dialog, THE Storage_Service SHALL remove the Expense_Record from persistent storage
3. WHEN the user confirms the deletion in the Confirmation_Dialog, THE Entry_Manager SHALL remove the Expense_Record from the Entry_List
4. WHEN the user cancels the deletion in the Confirmation_Dialog, THE Entry_Manager SHALL close the Confirmation_Dialog without modifying the Expense_Record

### Requirement 7: Storage Operations for Edit and Delete

**User Story:** As a developer, I want the Storage_Service to support updating and deleting individual records by ID, so that the edit and delete features have reliable data operations.

#### Acceptance Criteria

1. WHEN the Storage_Service receives an update request for a Salary_Record with a valid ID, THE Storage_Service SHALL replace the matching record in localStorage and preserve the sort order by month
2. WHEN the Storage_Service receives an update request for an Expense_Record with a valid ID, THE Storage_Service SHALL replace the matching record in localStorage and preserve the sort order by date
3. WHEN the Storage_Service receives a delete request for a Salary_Record with a valid ID, THE Storage_Service SHALL remove the matching record from localStorage
4. WHEN the Storage_Service receives a delete request for an Expense_Record with a valid ID, THE Storage_Service SHALL remove the matching record from localStorage
5. IF the Storage_Service receives an update or delete request with an ID that does not match any stored record, THEN THE Storage_Service SHALL throw an error with a descriptive Hebrew message
6. FOR ALL Salary_Records, updating a record then loading all data SHALL return data containing the updated values (round-trip property)
7. FOR ALL Expense_Records, updating a record then loading all data SHALL return data containing the updated values (round-trip property)

### Requirement 8: Report Consistency After Edits and Deletions

**User Story:** As a user, I want my monthly and annual reports to reflect any edits or deletions I make, so that my financial summaries remain accurate.

#### Acceptance Criteria

1. WHEN a Salary_Record is edited or deleted, THE monthly report and annual report SHALL reflect the updated data the next time the user generates a report
2. WHEN an Expense_Record is edited or deleted, THE monthly report and annual report SHALL reflect the updated data the next time the user generates a report
