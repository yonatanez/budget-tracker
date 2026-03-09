# Requirements Document

## Introduction

This feature enhances the existing stock value field in the Israeli Budget Tracker salary form. Currently, `stockValue` in `SalaryComponents` is a plain number input where users manually enter a shekel amount. The enhancement allows users to select their employer company (publicly traded), fetch real-time stock price data via a free API, enter the number of shares/options they hold, and have the system automatically calculate the total stock value in ILS. This calculated value feeds into the existing gross salary and tax calculation pipeline.

## Glossary

- **Stock_Calculator**: The UI component and logic responsible for company selection, stock price fetching, share count input, and stock value computation
- **Company_Selector**: The searchable dropdown/autocomplete UI element that lets users find and select their employer's stock ticker
- **Stock_API_Client**: The service that fetches current stock price data from an external financial API
- **Price_Display**: The UI element showing the fetched stock price and currency to the user
- **Share_Input**: The input field where users enter the number of shares or vested options they hold
- **Stock_Value_Result**: The computed total value in ILS (price × shares × exchange rate if needed) that populates the existing `stockValue` field
- **Company_List**: A predefined or API-sourced list of publicly traded companies with their ticker symbols and exchange information
- **Exchange_Rate**: The USD/ILS (or other currency/ILS) conversion rate used when stock prices are in foreign currency

## Requirements

### Requirement 1: Company Selection

**User Story:** As a user, I want to search for and select the company I work at from a list of publicly traded companies, so that the system can look up the correct stock price.

#### Acceptance Criteria

1. THE Company_Selector SHALL display a searchable input field with autocomplete functionality in the salary form
2. WHEN the user types at least 2 characters into the Company_Selector, THE Company_Selector SHALL display matching companies filtered by name or ticker symbol
3. WHEN the user selects a company from the Company_Selector, THE Stock_Calculator SHALL store the selected company ticker symbol and display the company name
4. THE Company_List SHALL include Israeli (TASE) and US (NASDAQ, NYSE) publicly traded companies commonly associated with Israeli tech employers
5. WHEN no matching companies are found for the user's search query, THE Company_Selector SHALL display a "לא נמצאו תוצאות" (no results found) message

### Requirement 2: Stock Price Fetching

**User Story:** As a user, I want the system to fetch the current stock price for my selected company, so that I can see an up-to-date valuation.

#### Acceptance Criteria

1. WHEN the user selects a company from the Company_Selector, THE Stock_API_Client SHALL fetch the current stock price for the selected ticker symbol
2. WHEN the stock price is successfully fetched, THE Price_Display SHALL show the price, the currency (USD/ILS), and the date of the price data
3. IF the Stock_API_Client fails to fetch the stock price, THEN THE Stock_Calculator SHALL display an error message and allow the user to retry or enter a manual price
4. THE Stock_API_Client SHALL use a free public financial API that does not require a paid subscription
5. WHILE the Stock_API_Client is fetching price data, THE Price_Display SHALL show a loading indicator

### Requirement 3: Stock Value Calculation

**User Story:** As a user, I want to enter my number of shares and have the system calculate the total stock value in ILS, so that I can include accurate stock compensation in my salary.

#### Acceptance Criteria

1. THE Share_Input SHALL accept a positive number representing the number of shares or vested options the user holds
2. WHEN the user has selected a company and entered a share count, THE Stock_Calculator SHALL compute the Stock_Value_Result as: stock price × number of shares
3. WHEN the stock price is in a foreign currency (USD), THE Stock_Calculator SHALL convert the Stock_Value_Result to ILS using the current Exchange_Rate
4. WHEN the Stock_Value_Result is computed, THE Stock_Calculator SHALL populate the existing `stockValue` field in the salary form with the calculated ILS amount
5. WHEN either the stock price or the share count changes, THE Stock_Calculator SHALL recalculate the Stock_Value_Result automatically
6. THE Stock_Calculator SHALL display the calculated Stock_Value_Result to the user before populating the salary form field

### Requirement 4: Exchange Rate Handling

**User Story:** As a user, I want foreign currency stock prices to be automatically converted to ILS, so that my stock value is accurately reflected in my budget.

#### Acceptance Criteria

1. WHEN the selected company's stock price is denominated in USD, THE Stock_API_Client SHALL fetch the current USD/ILS exchange rate
2. IF the Stock_API_Client fails to fetch the Exchange_Rate, THEN THE Stock_Calculator SHALL allow the user to enter a manual exchange rate
3. THE Price_Display SHALL show both the original foreign currency price and the converted ILS price when a conversion is applied
4. THE Stock_Calculator SHALL round the final ILS Stock_Value_Result to two decimal places

### Requirement 5: Manual Override

**User Story:** As a user, I want to be able to manually enter or override the stock value, so that I can still use the feature when the API is unavailable or when I know the exact value from my pay slip.

#### Acceptance Criteria

1. THE Stock_Calculator SHALL provide a toggle to switch between automatic calculation mode and manual entry mode
2. WHEN the user switches to manual entry mode, THE Stock_Calculator SHALL enable direct editing of the `stockValue` field as a plain number input (current behavior)
3. WHEN the user switches to automatic calculation mode, THE Stock_Calculator SHALL disable direct editing of the `stockValue` field and populate the value from the calculation
4. THE Stock_Calculator SHALL default to manual entry mode to preserve backward compatibility with existing user workflows

### Requirement 6: Persistence of Company Selection

**User Story:** As a user, I want my company selection to be remembered, so that I do not have to search for my company every time I enter a salary.

#### Acceptance Criteria

1. WHEN the user selects a company, THE Stock_Calculator SHALL persist the selected company ticker and name to localStorage
2. WHEN the salary form loads, THE Stock_Calculator SHALL pre-populate the Company_Selector with the previously selected company if one exists in localStorage
3. WHEN the salary form loads with a persisted company selection, THE Stock_Calculator SHALL automatically fetch the latest stock price for the persisted company

### Requirement 7: Integration with Existing Tax Calculation

**User Story:** As a user, I want the calculated stock value to flow into the existing tax calculation, so that my net income reflects stock compensation accurately.

#### Acceptance Criteria

1. WHEN the Stock_Value_Result is populated into the `stockValue` field, THE TaxCalculator SHALL include the stock value in the gross salary calculation as it does today
2. THE Stock_Calculator SHALL produce a numeric ILS value compatible with the existing `SalaryComponents.stockValue` field type
3. WHEN the user submits the salary form, THE salary record SHALL store the final numeric `stockValue` regardless of whether the value was calculated automatically or entered manually

### Requirement 8: Hebrew RTL UI Compliance

**User Story:** As a Hebrew-speaking user, I want the stock calculator UI to be in Hebrew and follow RTL layout, so that the experience is consistent with the rest of the application.

#### Acceptance Criteria

1. THE Stock_Calculator SHALL display all labels, messages, and placeholders in Hebrew
2. THE Stock_Calculator SHALL follow RTL layout consistent with the existing application design
3. THE Company_Selector autocomplete dropdown SHALL display company names with their ticker symbols in a readable format for Hebrew users
