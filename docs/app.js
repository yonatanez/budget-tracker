// Israeli Budget Tracker - Bundled Application

// dist/domain/types.js
/**
 * Core type definitions for the Israeli Budget Tracker
 */
{};
//# sourceMappingURL=types.js.map

// dist/domain/models.js
/**
 * Factory functions for creating domain model instances
 */
/**
 * Round a monetary value to exactly 2 decimal places
 */
function roundToTwoDecimals(value) {
    return Math.round(value * 100) / 100;
}
/**
 * Generate a unique ID for model instances
 */
function generateId() {
    // Browser-compatible UUID generation
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
/**
 * Create a new SalaryRecord with generated ID and timestamp
 */
function createSalaryRecord(salaryComponents, month, taxCalculation) {
    // Round all salary components to 2 decimal places
    const roundedComponents = {
        baseSalary: roundToTwoDecimals(salaryComponents.baseSalary),
        bonus: salaryComponents.bonus !== undefined ? roundToTwoDecimals(salaryComponents.bonus) : undefined,
        stockValue: salaryComponents.stockValue !== undefined ? roundToTwoDecimals(salaryComponents.stockValue) : undefined,
        mealVouchers: salaryComponents.mealVouchers !== undefined ? roundToTwoDecimals(salaryComponents.mealVouchers) : undefined,
        otherCompensation: salaryComponents.otherCompensation !== undefined ? roundToTwoDecimals(salaryComponents.otherCompensation) : undefined,
        directPensionContribution: salaryComponents.directPensionContribution !== undefined ? roundToTwoDecimals(salaryComponents.directPensionContribution) : undefined
    };
    // Round all tax calculation values to 2 decimal places
    const roundedTaxCalculation = {
        salaryComponents: roundedComponents,
        grossSalary: roundToTwoDecimals(taxCalculation.grossSalary),
        taxableIncome: roundToTwoDecimals(taxCalculation.taxableIncome),
        cashIncome: roundToTwoDecimals(taxCalculation.cashIncome),
        incomeTax: roundToTwoDecimals(taxCalculation.incomeTax),
        nationalInsurance: roundToTwoDecimals(taxCalculation.nationalInsurance),
        healthInsurance: roundToTwoDecimals(taxCalculation.healthInsurance),
        pensionEmployeeContribution: roundToTwoDecimals(taxCalculation.pensionEmployeeContribution),
        pensionEmployerContribution: roundToTwoDecimals(taxCalculation.pensionEmployerContribution),
        studyFundEmployeeContribution: roundToTwoDecimals(taxCalculation.studyFundEmployeeContribution),
        studyFundEmployerContribution: roundToTwoDecimals(taxCalculation.studyFundEmployerContribution),
        netIncome: roundToTwoDecimals(taxCalculation.netIncome),
        taxCreditDeduction: taxCalculation.taxCreditDeduction !== undefined ? roundToTwoDecimals(taxCalculation.taxCreditDeduction) : undefined
    };
    return {
        id: generateId(),
        salaryComponents: roundedComponents,
        month,
        taxCalculation: roundedTaxCalculation,
        createdAt: new Date()
    };
}
/**
 * Create a new Expense with generated ID and timestamp
 */
function createExpense(input) {
    return {
        id: generateId(),
        amount: roundToTwoDecimals(input.amount),
        date: input.date,
        category: input.category ?? null,
        description: input.description ?? null,
        createdAt: new Date()
    };
}
/**
 * Create a new MonthlyReport
 */
function createMonthlyReport(month, netIncome, expenses) {
    const totalExpenses = roundToTwoDecimals(expenses.reduce((sum, expense) => sum + expense.amount, 0));
    const expensesByCategory = new Map();
    expenses.forEach(expense => {
        const category = expense.category ?? 'Uncategorized';
        const current = expensesByCategory.get(category) ?? 0;
        expensesByCategory.set(category, roundToTwoDecimals(current + expense.amount));
    });
    return {
        month,
        netIncome: roundToTwoDecimals(netIncome),
        expenses,
        totalExpenses,
        expensesByCategory,
        netSavings: roundToTwoDecimals(netIncome - totalExpenses)
    };
}
/**
 * Create a new AnnualReport
 */
function createAnnualReport(startDate, endDate, monthlyReports, totalPensionAccumulation, totalStudyFundAccumulation) {
    const totalIncome = roundToTwoDecimals(monthlyReports.reduce((sum, report) => sum + report.netIncome, 0));
    const totalExpenses = roundToTwoDecimals(monthlyReports.reduce((sum, report) => sum + report.totalExpenses, 0));
    const expensesByCategory = new Map();
    monthlyReports.forEach(report => {
        report.expensesByCategory.forEach((amount, category) => {
            const current = expensesByCategory.get(category) ?? 0;
            expensesByCategory.set(category, roundToTwoDecimals(current + amount));
        });
    });
    return {
        startDate,
        endDate,
        monthlyReports,
        totalIncome,
        totalExpenses,
        totalSavings: roundToTwoDecimals(totalIncome - totalExpenses),
        expensesByCategory,
        totalPensionAccumulation: roundToTwoDecimals(totalPensionAccumulation),
        totalStudyFundAccumulation: roundToTwoDecimals(totalStudyFundAccumulation)
    };
}
/**
 * Create a new SavingsEntry with generated ID and timestamp
 */
function createSavingsEntry(input) {
    return {
        id: generateId(),
        type: input.type,
        description: input.description,
        amount: roundToTwoDecimals(input.amount),
        month: input.month,
        createdAt: new Date()
    };
}
/**
 * Create a new RecurringExpenseConfig
 */
function createRecurringExpenseConfig(amount, dayOfMonth, startMonth, endMonth, category, description) {
    return {
        amount: roundToTwoDecimals(amount),
        dayOfMonth,
        startMonth,
        endMonth,
        category,
        description
    };
}
//# sourceMappingURL=models.js.map

// dist/data-access/LocalizationService.js
/**
 * LocalizationService provides Hebrew translations and RTL support for the Israeli Budget Tracker.
 * Implements Requirements 10.1-10.9 and 9.5
 */
/**
 * Hebrew translations for all UI elements
 */
const hebrewTranslations = {
    // Salary components
    'salary.base': 'משכורת בסיס',
    'salary.bonus': 'בונוס',
    'salary.stocks': 'מניות/אופציות',
    'salary.mealVouchers': 'תלושי אוכל',
    'salary.otherCompensation': 'רכיבי שכר נוספים',
    'salary.gross': 'משכורת ברוטו',
    'salary.net': 'הכנסה נטו',
    // Tax and deductions
    'tax.incomeTax': 'מס הכנסה',
    'tax.nationalInsurance': 'ביטוח לאומי',
    'tax.healthInsurance': 'ביטוח בריאות',
    'tax.pension': 'קרן פנסיה',
    'tax.studyFund': 'קרן השתלמות',
    // General terms
    'general.expenses': 'הוצאות',
    'general.savings': 'חיסכון',
    'general.category': 'קטגוריה',
    'general.description': 'תיאור',
    'general.date': 'תאריך',
    'general.amount': 'סכום',
    // Month names
    'month.1': 'ינואר',
    'month.2': 'פברואר',
    'month.3': 'מרץ',
    'month.4': 'אפריל',
    'month.5': 'מאי',
    'month.6': 'יוני',
    'month.7': 'יולי',
    'month.8': 'אוגוסט',
    'month.9': 'ספטמבר',
    'month.10': 'אוקטובר',
    'month.11': 'נובמבר',
    'month.12': 'דצמבר',
};
/**
 * Implementation of LocalizationService for Hebrew localization
 */
class HebrewLocalizationService {
    /**
     * Translates a key to its Hebrew equivalent
     * @param key - Translation key (e.g., 'salary.base')
     * @returns Hebrew translation or the key itself if not found
     */
    translate(key) {
        return hebrewTranslations[key] || key;
    }
    /**
     * Returns the text direction for Hebrew (RTL)
     * @returns 'rtl' for Hebrew text direction
     */
    getDirection() {
        return 'rtl';
    }
    /**
     * Formats a monetary amount with the Israeli Shekel symbol
     * @param amount - Numeric amount to format
     * @returns Formatted string with ₪ symbol and 2 decimal places
     */
    formatCurrency(amount) {
        const formatted = amount.toFixed(2);
        return `₪${formatted}`;
    }
    /**
     * Formats a date in Hebrew format (DD/MM/YYYY)
     * @param date - Date object to format
     * @returns Formatted date string
     */
    formatDate(date) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
    /**
     * Returns the Hebrew name for a given month number
     * @param month - Month number (1-12)
     * @returns Hebrew month name
     */
    getMonthName(month) {
        if (month < 1 || month > 12) {
            throw new Error(`Invalid month number: ${month}. Must be between 1 and 12.`);
        }
        return this.translate(`month.${month}`);
    }
}
//# sourceMappingURL=LocalizationService.js.map

// dist/data-access/ValidationService.js
/**
 * ValidationService provides validation logic for financial data inputs.
 * Implements Requirements 1.8, 1.9, 3.2, 3.3, 3.5, 9.1, 9.2, 9.3
 */
/**
 * Implementation of ValidationService with Hebrew error messages
 */
class DefaultValidationService {
    /**
     * Validates salary components to ensure all values are non-negative
     * @param components - Salary components to validate
     * @returns Validation result with Hebrew error messages
     */
    validateSalaryComponents(components) {
        const errors = [];
        // Validate base salary (required, must be >= 0)
        if (components.baseSalary < 0) {
            errors.push('משכורת בסיס לא יכולה להיות שלילית');
        }
        // Validate optional components (if provided, must be >= 0)
        if (components.bonus !== undefined && components.bonus < 0) {
            errors.push('בונוס לא יכול להיות שלילי');
        }
        if (components.stockValue !== undefined && components.stockValue < 0) {
            errors.push('ערך מניות/אופציות לא יכול להיות שלילי');
        }
        if (components.mealVouchers !== undefined && components.mealVouchers < 0) {
            errors.push('תלושי אוכל לא יכולים להיות שליליים');
        }
        if (components.otherCompensation !== undefined && components.otherCompensation < 0) {
            errors.push('רכיבי שכר נוספים לא יכולים להיות שליליים');
        }
        // Check if total gross salary is zero
        const grossSalary = components.baseSalary +
            (components.bonus || 0) +
            (components.stockValue || 0) +
            (components.mealVouchers || 0) +
            (components.otherCompensation || 0);
        if (grossSalary === 0) {
            errors.push('סך המשכורת הברוטו לא יכול להיות אפס');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Validates an expense to ensure amount is positive and date is valid
     * @param expense - Expense input to validate
     * @returns Validation result with Hebrew error messages
     */
    validateExpense(expense) {
        const errors = [];
        // Validate amount (must be positive)
        if (expense.amount <= 0) {
            errors.push('הסכום חייב להיות מספר חיובי גדול מאפס');
        }
        // Validate date
        const dateValidation = this.validateDate(expense.date);
        if (!dateValidation.isValid) {
            errors.push(...dateValidation.errors);
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Validates a date to ensure it's not more than one day in the future
     * @param date - Date to validate
     * @returns Validation result with Hebrew error messages
     */
    validateDate(date) {
        const errors = [];
        // Check if date is valid
        if (isNaN(date.getTime())) {
            errors.push('התאריך חייב להיות בפורמט תקין');
            return {
                isValid: false,
                errors
            };
        }
        // Check if date is more than one day in the future
        const now = new Date();
        const oneDayFromNow = new Date(now);
        oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
        // Set time to end of day for comparison
        oneDayFromNow.setHours(23, 59, 59, 999);
        if (date.getTime() > oneDayFromNow.getTime()) {
            errors.push('התאריך לא יכול להיות יותר מיום אחד בעתיד');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Checks if an expense is a duplicate of any existing expense
     * Duplicates are defined as having the same amount, date, and description
     * @param expense - Expense to check
     * @param existing - Array of existing expenses
     * @returns true if duplicate found, false otherwise
     */
    checkDuplicate(expense, existing) {
        return existing.some(existingExpense => {
            // Compare amount
            if (existingExpense.amount !== expense.amount) {
                return false;
            }
            // Compare date (same day, ignoring time)
            const existingDate = new Date(existingExpense.date);
            const newDate = new Date(expense.date);
            if (existingDate.getFullYear() !== newDate.getFullYear() ||
                existingDate.getMonth() !== newDate.getMonth() ||
                existingDate.getDate() !== newDate.getDate()) {
                return false;
            }
            // Compare description (both null/undefined or same value)
            const existingDesc = existingExpense.description || '';
            const newDesc = expense.description || '';
            return existingDesc === newDesc;
        });
    }
    /**
     * Validates a recurring expense configuration
     * @param config - Recurring expense configuration to validate
     * @returns Validation result with Hebrew error messages
     */
    validateRecurringExpenseConfig(config) {
        const errors = [];
        // Validate amount (must be positive)
        if (config.amount <= 0) {
            errors.push('הסכום חייב להיות מספר חיובי גדול מאפס');
        }
        // Validate dayOfMonth (must be between 1 and 31)
        if (config.dayOfMonth < 1 || config.dayOfMonth > 31 || !Number.isInteger(config.dayOfMonth)) {
            errors.push('יום בחודש חייב להיות מספר שלם בין 1 ל-31');
        }
        // Validate startMonth <= endMonth
        const start = new Date(config.startMonth);
        const end = new Date(config.endMonth);
        if (start.getTime() > end.getTime()) {
            errors.push('חודש ההתחלה חייב להיות לפני או שווה לחודש הסיום');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Validates a savings entry input
     * @param input - Savings entry input to validate
     * @returns Validation result with Hebrew error messages
     */
    validateSavingsEntry(input) {
        const errors = [];
        // Validate description (must be non-empty after trimming)
        if (!input.description || input.description.trim().length === 0) {
            errors.push('תיאור לא יכול להיות ריק');
        }
        // Validate amount (must be positive)
        if (input.amount <= 0) {
            errors.push('הסכום חייב להיות מספר חיובי גדול מאפס');
        }
        // Validate type (must be one of: savings, investment, pension)
        const validTypes = ['savings', 'investment', 'pension'];
        if (!validTypes.includes(input.type)) {
            errors.push('סוג החיסכון חייב להיות חיסכון, השקעה או פנסיה');
        }
        // Validate month (must be a valid Date)
        if (!(input.month instanceof Date) || isNaN(input.month.getTime())) {
            errors.push('חודש חייב להיות תאריך תקין');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Validates a savings goal amount
     * @param amount - Savings goal amount to validate
     * @returns Validation result with Hebrew error messages
     */
    validateSavingsGoal(amount) {
        const errors = [];
        // Validate amount (must be positive)
        if (amount <= 0) {
            errors.push('יעד החיסכון חייב להיות מספר חיובי גדול מאפס');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
//# sourceMappingURL=ValidationService.js.map

// dist/data-access/CSVParser.js
/**
 * CSV Parser for expense import/export
 * Handles parsing CSV strings to Expense arrays and formatting Expense arrays to CSV strings
 */
/**
 * Implementation of CSV Parser for expense data
 */
class CSVParserImpl {
    HEADERS = ['amount', 'date', 'category', 'description'];
    /**
     * Parse CSV content into an array of Expense objects
     * @param csvContent - CSV string with headers
     * @returns Result with either Expense array or ParseError array
     */
    parse(csvContent) {
        const errors = [];
        const expenses = [];
        // Handle empty content
        if (!csvContent || csvContent.trim() === '') {
            return {
                success: false,
                error: [{
                        line: 0,
                        field: 'file',
                        message: 'הקובץ לא מכיל נתונים' // File contains no data
                    }]
            };
        }
        const lines = csvContent.split('\n');
        // Validate headers
        if (lines.length === 0) {
            return {
                success: false,
                error: [{
                        line: 0,
                        field: 'file',
                        message: 'הקובץ לא מכיל נתונים' // File contains no data
                    }]
            };
        }
        const headerLine = lines[0].trim();
        const headers = headerLine.split(',').map(h => h.trim());
        // Check if headers match expected format
        if (!this.validateHeaders(headers)) {
            return {
                success: false,
                error: [{
                        line: 1,
                        field: 'headers',
                        message: 'כותרות CSV לא תקינות. נדרש: amount,date,category,description' // Invalid CSV headers
                    }]
            };
        }
        // Parse data rows
        for (let i = 1; i < lines.length; i++) {
            // Remove only line ending characters (\r) but preserve other whitespace
            const line = lines[i].replace(/\r$/, '');
            // Skip empty lines
            if (line.trim() === '') {
                continue;
            }
            const lineNumber = i + 1;
            const parseResult = this.parseLine(line, lineNumber);
            if (parseResult.success) {
                expenses.push(parseResult.value);
            }
            else {
                errors.push(...parseResult.error);
            }
        }
        // If there are errors, return them
        if (errors.length > 0) {
            return {
                success: false,
                error: errors
            };
        }
        // If no data rows were parsed, return error
        if (expenses.length === 0) {
            return {
                success: false,
                error: [{
                        line: 0,
                        field: 'file',
                        message: 'הקובץ לא מכיל שורות נתונים תקינות' // File contains no valid data rows
                    }]
            };
        }
        return {
            success: true,
            value: expenses
        };
    }
    /**
     * Format an array of Expense objects into CSV string
     * @param expenses - Array of Expense objects
     * @returns CSV string with headers
     */
    format(expenses) {
        const lines = [];
        // Add headers
        lines.push(this.HEADERS.join(','));
        // Add data rows
        for (const expense of expenses) {
            const row = [
                expense.amount.toFixed(2),
                this.formatDate(expense.date),
                expense.category ?? '',
                expense.description ?? ''
            ];
            lines.push(row.join(','));
        }
        return lines.join('\n');
    }
    /**
     * Validate CSV headers
     */
    validateHeaders(headers) {
        if (headers.length !== this.HEADERS.length) {
            return false;
        }
        for (let i = 0; i < this.HEADERS.length; i++) {
            if (headers[i] !== this.HEADERS[i]) {
                return false;
            }
        }
        return true;
    }
    /**
     * Parse a single CSV line into an Expense object
     */
    parseLine(line, lineNumber) {
        const errors = [];
        const parts = line.split(',');
        // Check column count
        if (parts.length !== this.HEADERS.length) {
            return {
                success: false,
                error: [{
                        line: lineNumber,
                        field: 'row',
                        message: `מספר עמודות שגוי. נדרש: ${this.HEADERS.length}, נמצא: ${parts.length}` // Wrong number of columns
                    }]
            };
        }
        // Parse amount (trim for numeric parsing)
        const amountStr = parts[0].trim();
        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) {
            errors.push({
                line: lineNumber,
                field: 'amount',
                message: 'הסכום חייב להיות מספר חיובי גדול מאפס' // Amount must be a positive number greater than zero
            });
        }
        // Parse date (trim for date parsing)
        const dateStr = parts[1].trim();
        const date = this.parseDate(dateStr);
        if (!date) {
            errors.push({
                line: lineNumber,
                field: 'date',
                message: 'התאריך חייב להיות בפורמט תקין (YYYY-MM-DD)' // Date must be in valid format (YYYY-MM-DD)
            });
        }
        // Validate date is not too far in the future (more than 1 day)
        if (date) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(23, 59, 59, 999);
            if (date > tomorrow) {
                errors.push({
                    line: lineNumber,
                    field: 'date',
                    message: 'התאריך לא יכול להיות יותר מיום אחד בעתיד' // Date cannot be more than one day in the future
                });
            }
        }
        // If there are validation errors, return them
        if (errors.length > 0) {
            return {
                success: false,
                error: errors
            };
        }
        // Parse optional fields (do NOT trim to preserve whitespace)
        const category = parts[2] === '' ? null : parts[2];
        const description = parts[3] === '' ? null : parts[3];
        // Create expense object (without id and createdAt as those are generated by factory)
        const expense = {
            id: '', // Will be generated by factory function
            amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
            date: date,
            category,
            description,
            createdAt: new Date()
        };
        return {
            success: true,
            value: expense
        };
    }
    /**
     * Parse date string in YYYY-MM-DD format
     */
    parseDate(dateStr) {
        // Check format with regex
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dateStr)) {
            return null;
        }
        const parts = dateStr.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        // Validate ranges
        if (month < 1 || month > 12 || day < 1 || day > 31) {
            return null;
        }
        const date = new Date(year, month - 1, day);
        // Check if date is valid (handles invalid dates like Feb 30)
        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
            return null;
        }
        return date;
    }
    /**
     * Format date to YYYY-MM-DD string
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
/**
 * Create a new CSVParser instance
 */
function createCSVParser() {
    return new CSVParserImpl();
}
//# sourceMappingURL=CSVParser.js.map

// dist/data-access/StorageService.js
/**
 * StorageService provides data persistence for the Israeli Budget Tracker.
 * Uses localStorage for browser-based storage.
 * Implements Requirements 8.1, 8.2, 8.3, 8.4, 8.5
 */
/**
 * Storage keys for localStorage
 */
const STORAGE_KEYS = {
    SALARIES: 'israeli-budget-tracker:salaries',
    EXPENSES: 'israeli-budget-tracker:expenses',
    SAVINGS: 'israeli-budget-tracker:savings',
    MONTHLY_SAVINGS_GOAL: 'israeli-budget-tracker:monthly-savings-goal'
};
/**
 * Hebrew error messages for storage operations
 */
const ERROR_MESSAGES = {
    SAVE_FAILED: 'שמירת הנתונים נכשלה. אנא נסה שוב.',
    LOAD_FAILED: 'טעינת הנתונים נכשלה. מתחיל עם נתונים ריקים.',
    CORRUPTED_DATA: 'קובץ הנתונים פגום. אנא שחזר מגיבוי.',
    RECORD_NOT_FOUND: 'הרשומה לא נמצאה'
};
/**
 * Implementation of StorageService using localStorage
 */
class LocalStorageService {
    /**
     * Saves a salary record to localStorage
     * @param salary - SalaryRecord to persist
     * @throws Error with Hebrew message if save fails
     */
    async saveSalary(salary) {
        try {
            const data = await this.loadAllData();
            // Check if salary for this month already exists and update it
            const existingIndex = data.salaries.findIndex(s => s.month.getTime() === salary.month.getTime());
            if (existingIndex >= 0) {
                data.salaries[existingIndex] = salary;
            }
            else {
                data.salaries.push(salary);
            }
            // Sort salaries by month (newest first)
            data.salaries.sort((a, b) => b.month.getTime() - a.month.getTime());
            this.saveToStorage(STORAGE_KEYS.SALARIES, data.salaries);
        }
        catch (error) {
            throw new Error(ERROR_MESSAGES.SAVE_FAILED);
        }
    }
    /**
     * Saves an expense record to localStorage
     * @param expense - Expense to persist
     * @throws Error with Hebrew message if save fails
     */
    async saveExpense(expense) {
        try {
            const data = await this.loadAllData();
            data.expenses.push(expense);
            // Sort expenses by date (newest first)
            data.expenses.sort((a, b) => b.date.getTime() - a.date.getTime());
            this.saveToStorage(STORAGE_KEYS.EXPENSES, data.expenses);
        }
        catch (error) {
            throw new Error(ERROR_MESSAGES.SAVE_FAILED);
        }
    }
    /**
     * Loads all financial data from localStorage
     * @returns FinancialData containing all salaries and expenses
     * @throws Error with Hebrew message if data is corrupted
     */
    async loadAllData() {
        try {
            const salaries = this.loadFromStorage(STORAGE_KEYS.SALARIES) || [];
            const expenses = this.loadFromStorage(STORAGE_KEYS.EXPENSES) || [];
            // Deserialize dates
            const deserializedSalaries = salaries.map(s => ({
                ...s,
                month: new Date(s.month),
                createdAt: new Date(s.createdAt)
            }));
            const deserializedExpenses = expenses.map(e => ({
                ...e,
                date: new Date(e.date),
                createdAt: new Date(e.createdAt)
            }));
            return {
                salaries: deserializedSalaries,
                expenses: deserializedExpenses
            };
        }
        catch (error) {
            // If data is corrupted, throw error
            if (error instanceof SyntaxError) {
                throw new Error(ERROR_MESSAGES.CORRUPTED_DATA);
            }
            // For other errors, return empty data
            return {
                salaries: [],
                expenses: []
            };
        }
    }
    /**
     * Updates an existing salary record by ID
     * @param id - ID of the salary record to update
     * @param salary - Updated salary record data
     * @throws Error with Hebrew message if record not found
     */
    async updateSalary(id, salary) {
        const data = await this.loadAllData();
        const index = data.salaries.findIndex(s => s.id === id);
        if (index === -1) {
            throw new Error(ERROR_MESSAGES.RECORD_NOT_FOUND);
        }
        // Preserve original id and createdAt
        data.salaries[index] = {
            ...salary,
            id: data.salaries[index].id,
            createdAt: data.salaries[index].createdAt
        };
        // Re-sort by month descending
        data.salaries.sort((a, b) => b.month.getTime() - a.month.getTime());
        this.saveToStorage(STORAGE_KEYS.SALARIES, data.salaries);
    }
    /**
     * Deletes a salary record by ID
     * @param id - ID of the salary record to delete
     * @throws Error with Hebrew message if record not found
     */
    async deleteSalary(id) {
        const data = await this.loadAllData();
        const filtered = data.salaries.filter(s => s.id !== id);
        if (filtered.length === data.salaries.length) {
            throw new Error(ERROR_MESSAGES.RECORD_NOT_FOUND);
        }
        this.saveToStorage(STORAGE_KEYS.SALARIES, filtered);
    }
    /**
     * Updates an existing expense record by ID
     * @param id - ID of the expense record to update
     * @param expense - Updated expense record data
     * @throws Error with Hebrew message if record not found
     */
    async updateExpense(id, expense) {
        const data = await this.loadAllData();
        const index = data.expenses.findIndex(e => e.id === id);
        if (index === -1) {
            throw new Error(ERROR_MESSAGES.RECORD_NOT_FOUND);
        }
        // Preserve original id and createdAt
        data.expenses[index] = {
            ...expense,
            id: data.expenses[index].id,
            createdAt: data.expenses[index].createdAt
        };
        // Re-sort by date descending
        data.expenses.sort((a, b) => b.date.getTime() - a.date.getTime());
        this.saveToStorage(STORAGE_KEYS.EXPENSES, data.expenses);
    }
    /**
     * Deletes an expense record by ID
     * @param id - ID of the expense record to delete
     * @throws Error with Hebrew message if record not found
     */
    async deleteExpense(id) {
        const data = await this.loadAllData();
        const filtered = data.expenses.filter(e => e.id !== id);
        if (filtered.length === data.expenses.length) {
            throw new Error(ERROR_MESSAGES.RECORD_NOT_FOUND);
        }
        this.saveToStorage(STORAGE_KEYS.EXPENSES, filtered);
    }
    /**
     * Saves a savings entry to localStorage
     * @param entry - SavingsEntry to persist
     * @throws Error with Hebrew message if save fails
     */
    async saveSavingsEntry(entry) {
        try {
            const entries = await this.loadSavingsEntries();
            entries.push(entry);
            this.saveToStorage(STORAGE_KEYS.SAVINGS, entries);
        }
        catch (error) {
            throw new Error(ERROR_MESSAGES.SAVE_FAILED);
        }
    }
    /**
     * Loads all savings entries from localStorage
     * @returns Array of SavingsEntry records, empty array if corrupted or missing
     */
    async loadSavingsEntries() {
        try {
            const entries = this.loadFromStorage(STORAGE_KEYS.SAVINGS) || [];
            return entries.map(e => ({
                ...e,
                month: new Date(e.month),
                createdAt: new Date(e.createdAt)
            }));
        }
        catch (error) {
            console.error(ERROR_MESSAGES.CORRUPTED_DATA, error);
            return [];
        }
    }
    /**
     * Updates an existing savings entry by ID
     * @param id - ID of the savings entry to update
     * @param entry - Updated savings entry data
     * @throws Error with Hebrew message if record not found
     */
    async updateSavingsEntry(id, entry) {
        const entries = await this.loadSavingsEntries();
        const index = entries.findIndex(e => e.id === id);
        if (index === -1) {
            throw new Error(ERROR_MESSAGES.RECORD_NOT_FOUND);
        }
        entries[index] = {
            ...entry,
            id: entries[index].id,
            createdAt: entries[index].createdAt
        };
        this.saveToStorage(STORAGE_KEYS.SAVINGS, entries);
    }
    /**
     * Deletes a savings entry by ID
     * @param id - ID of the savings entry to delete
     * @throws Error with Hebrew message if record not found
     */
    async deleteSavingsEntry(id) {
        const entries = await this.loadSavingsEntries();
        const filtered = entries.filter(e => e.id !== id);
        if (filtered.length === entries.length) {
            throw new Error(ERROR_MESSAGES.RECORD_NOT_FOUND);
        }
        this.saveToStorage(STORAGE_KEYS.SAVINGS, filtered);
    }
    /**
     * Saves the monthly savings goal amount to localStorage
     * @param amount - Goal amount in ₪
     * @throws Error with Hebrew message if save fails
     */
    async saveMonthlySavingsGoal(amount) {
        try {
            this.saveToStorage(STORAGE_KEYS.MONTHLY_SAVINGS_GOAL, amount);
        }
        catch (error) {
            throw new Error(ERROR_MESSAGES.SAVE_FAILED);
        }
    }
    /**
     * Loads the monthly savings goal from localStorage
     * @returns The goal amount, or null if not set or data is corrupted
     */
    async loadMonthlySavingsGoal() {
        try {
            const value = this.loadFromStorage(STORAGE_KEYS.MONTHLY_SAVINGS_GOAL);
            if (value === null || typeof value !== 'number' || !isFinite(value)) {
                return null;
            }
            return value;
        }
        catch (error) {
            console.error(ERROR_MESSAGES.CORRUPTED_DATA, error);
            return null;
        }
    }
    /**
     * Helper method to save data to localStorage
     * @param key - Storage key
     * @param data - Data to save
     */
    saveToStorage(key, data) {
        const serialized = JSON.stringify(data);
        localStorage.setItem(key, serialized);
    }
    /**
     * Helper method to load data from localStorage
     * @param key - Storage key
     * @returns Parsed data or null if not found
     */
    loadFromStorage(key) {
        const serialized = localStorage.getItem(key);
        if (!serialized) {
            return null;
        }
        return JSON.parse(serialized);
    }
}
//# sourceMappingURL=StorageService.js.map

// dist/data-access/FormPersistenceService.js
/**
 * FormPersistenceService - Manages form state persistence to LocalStorage
 */
const STORAGE_KEY = 'lastExpenseInput';
class FormPersistenceService {
    /**
     * Save form state to LocalStorage
     * @param formData - The form data to persist
     */
    saveFormState(formData) {
        try {
            const dataToStore = {
                ...formData,
                timestamp: Date.now()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
        }
        catch (error) {
            if (error instanceof Error && error.name === 'QuotaExceededError') {
                console.error('LocalStorage quota exceeded. Form state not persisted.');
            }
            else {
                console.error('Error saving form state:', error);
            }
        }
    }
    /**
     * Load form state from LocalStorage
     * @returns The persisted form state or null if none exists
     */
    loadFormState() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                return null;
            }
            const parsed = JSON.parse(stored);
            // Validate the restored data
            if (!this.isValidFormState(parsed)) {
                console.warn('Invalid form state in LocalStorage, returning null');
                return null;
            }
            // Validate date is a valid date
            if (parsed.date && !this.isValidDate(parsed.date)) {
                console.warn('Invalid date in form state, skipping date field');
                parsed.date = '';
            }
            // Validate amount is a positive number
            if (parsed.amount && !this.isValidAmount(parsed.amount)) {
                console.warn('Invalid amount in form state, skipping amount field');
                parsed.amount = '';
            }
            return {
                amount: parsed.amount,
                date: parsed.date,
                category: parsed.category,
                description: parsed.description
            };
        }
        catch (error) {
            if (error instanceof SyntaxError) {
                console.warn('Corrupted form state in LocalStorage, returning null');
            }
            else {
                console.error('Error loading form state:', error);
            }
            return null;
        }
    }
    /**
     * Clear persisted form state
     */
    clearFormState() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        }
        catch (error) {
            console.error('Error clearing form state:', error);
        }
    }
    /**
     * Validate form state structure
     */
    isValidFormState(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }
        // Check required fields exist and are strings
        if (typeof data.amount !== 'string' ||
            typeof data.date !== 'string' ||
            typeof data.category !== 'string' ||
            typeof data.description !== 'string') {
            return false;
        }
        return true;
    }
    /**
     * Validate date string is a valid date
     */
    isValidDate(dateStr) {
        if (!dateStr)
            return true; // Empty is valid
        const date = new Date(dateStr);
        return date instanceof Date && !isNaN(date.getTime());
    }
    /**
     * Validate amount string is a positive number
     */
    isValidAmount(amountStr) {
        if (!amountStr)
            return true; // Empty is valid
        const amount = parseFloat(amountStr);
        return !isNaN(amount) && amount > 0;
    }
}
//# sourceMappingURL=FormPersistenceService.js.map

// dist/data-access/ExportService.js
/**
 * ExportService - Handles exporting data to CSV/Excel formats
 */
class CSVExportService {
    /**
     * Export salary records to CSV format
     */
    exportSalariesToCSV(salaries) {
        const headers = [
            'חודש',
            'שנה',
            'משכורת ברוטו',
            'הכנסה חייבת במס',
            'הכנסה במזומן',
            'מס הכנסה',
            'ביטוח לאומי',
            'ביטוח בריאות',
            'פנסיה עובד',
            'פנסיה מעביד',
            'קרן השתלמות עובד',
            'קרן השתלמות מעביד',
            'הכנסה נטו'
        ];
        const rows = salaries.map(salary => {
            const month = salary.month.getMonth() + 1;
            const year = salary.month.getFullYear();
            const tax = salary.taxCalculation;
            return [
                month,
                year,
                tax.grossSalary,
                tax.taxableIncome,
                tax.cashIncome,
                tax.incomeTax,
                tax.nationalInsurance,
                tax.healthInsurance,
                tax.pensionEmployeeContribution,
                tax.pensionEmployerContribution,
                tax.studyFundEmployeeContribution,
                tax.studyFundEmployerContribution,
                tax.netIncome
            ];
        });
        return this.arrayToCSV([headers, ...rows]);
    }
    /**
     * Export expenses to CSV format
     */
    exportExpensesToCSV(expenses) {
        const headers = ['תאריך', 'סכום', 'קטגוריה', 'תיאור'];
        const rows = expenses.map(expense => [
            this.formatDate(expense.date),
            expense.amount,
            expense.category || '',
            expense.description || ''
        ]);
        return this.arrayToCSV([headers, ...rows]);
    }
    /**
     * Export monthly report to CSV format
     */
    exportMonthlyReportToCSV(report) {
        const month = report.month.getMonth() + 1;
        const year = report.month.getFullYear();
        // Summary section
        const summary = [
            ['דוח חודשי', `${month}/${year}`],
            [''],
            ['הכנסה נטו', report.netIncome],
            ['סה"כ הוצאות', report.totalExpenses],
            ['חיסכון נטו', report.netSavings],
            ['']
        ];
        // Category breakdown
        const categoryHeaders = ['קטגוריה', 'סכום'];
        const categoryRows = [];
        report.expensesByCategory.forEach((amount, category) => {
            categoryRows.push([category, amount]);
        });
        // Expenses list
        const expenseHeaders = ['תאריך', 'סכום', 'קטגוריה', 'תיאור'];
        const expenseRows = report.expenses.map(expense => [
            this.formatDate(expense.date),
            expense.amount,
            expense.category || '',
            expense.description || ''
        ]);
        const allRows = [
            ...summary,
            categoryHeaders,
            ...categoryRows,
            [''],
            expenseHeaders,
            ...expenseRows
        ];
        return this.arrayToCSV(allRows);
    }
    /**
     * Trigger download of CSV file
     */
    downloadCSV(content, filename) {
        // Add BOM for proper Hebrew encoding in Excel
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    /**
     * Convert 2D array to CSV string
     */
    arrayToCSV(data) {
        return data
            .map(row => row
            .map(cell => {
            // Convert to string and escape quotes
            const str = String(cell ?? '');
            // Wrap in quotes if contains comma, quote, or newline
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        })
            .join(','))
            .join('\n');
    }
    /**
     * Format date as DD/MM/YYYY
     */
    formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
}
//# sourceMappingURL=ExportService.js.map

// dist/presentation/chartConstants.js
/**
 * Chart.js configuration constants for Budget Tracker UI
 */
/**
 * Color palette for chart categories
 * High-contrast colors meeting WCAG 3:1 contrast ratio requirement
 */
const CHART_COLORS = [
    '#FF6384', // Pink/Red
    '#36A2EB', // Blue
    '#FFCE56', // Yellow
    '#4BC0C0', // Teal
    '#9966FF', // Purple
    '#FF9F40', // Orange
    '#FF6384', // Pink (repeat for more categories)
    '#C9CBCF', // Gray
    '#4BC0C0', // Teal (repeat)
    '#FF9F40' // Orange (repeat)
];
/**
 * Chart.js default configuration for Hebrew/RTL support
 */
const CHART_DEFAULT_OPTIONS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'bottom',
            rtl: true,
            textDirection: 'rtl'
        },
        tooltip: {
            enabled: true,
            rtl: true,
            textDirection: 'rtl'
        }
    }
};
/**
 * Minimum chart heights for accessibility
 */
const CHART_MIN_HEIGHTS = {
    PIE: 300,
    BAR: 400,
    STACKED_BAR: 400
};
//# sourceMappingURL=chartConstants.js.map

// dist/application/ChartDataPrepService.js
/**
 * ChartDataPrepService - Transforms expense data into chart-compatible formats
 */

class ChartDataPrepService {
    /**
     * Prepare data for pie chart visualization
     * @param expenses - Array of expenses to aggregate
     * @returns Chart data with labels and values
     */
    preparePieChartData(expenses) {
        // Aggregate expenses by category
        const categoryMap = new Map();
        expenses.forEach(expense => {
            const category = expense.category ?? 'ללא קטגוריה';
            const current = categoryMap.get(category) ?? 0;
            categoryMap.set(category, current + expense.amount);
        });
        // Convert to array and sort descending by amount
        const aggregations = Array.from(categoryMap.entries())
            .map(([category, total]) => ({
            category,
            total: this.roundToTwoDecimals(total),
            count: 0
        }))
            .sort((a, b) => b.total - a.total);
        // Extract labels, values, and assign colors
        const labels = aggregations.map(agg => agg.category);
        const values = aggregations.map(agg => agg.total);
        const colors = labels.map((_, index) => CHART_COLORS[index % CHART_COLORS.length]);
        return { labels, values, colors };
    }
    /**
     * Prepare data for bar chart visualization
     * @param monthlyReports - Array of monthly reports
     * @param localizationService - For month name translation
     * @returns Chart data with labels and values
     */
    prepareBarChartData(monthlyReports, localizationService) {
        // Sort monthly reports chronologically
        const sortedReports = [...monthlyReports].sort((a, b) => a.month.getTime() - b.month.getTime());
        // Extract month names and total expenses
        const labels = sortedReports.map(report => {
            const month = report.month.getMonth() + 1; // 0-indexed to 1-indexed
            const year = report.month.getFullYear();
            return `${localizationService.getMonthName(month)} ${year}`;
        });
        const values = sortedReports.map(report => this.roundToTwoDecimals(report.totalExpenses));
        return { labels, values };
    }
    /**
     * Round a monetary value to exactly 2 decimal places
     */
    roundToTwoDecimals(value) {
        return Math.round(value * 100) / 100;
    }
    /**
     * Distinct color palette for stacked bar chart datasets.
     * Each color is unique to ensure visual clarity across all segments.
     */
    static STACKED_CHART_COLORS = [
        '#2E86C1', // Blue (net income)
        '#27AE60', // Green (savings)
        '#E74C3C', // Red
        '#F39C12', // Orange
        '#8E44AD', // Purple
        '#1ABC9C', // Teal
        '#D35400', // Dark Orange
        '#2980B9', // Medium Blue
        '#C0392B', // Dark Red
        '#16A085', // Dark Teal
        '#F1C40F', // Yellow
        '#7D3C98', // Dark Purple
        '#2ECC71', // Light Green
        '#E67E22', // Carrot
        '#3498DB', // Light Blue
        '#9B59B6', // Amethyst
        '#1F618D', // Navy
        '#A04000', // Brown
        '#117A65', // Dark Cyan
        '#B7950B', // Dark Yellow
    ];
    /**
     * Prepare data for stacked bar chart visualization (yearly report)
     * @param monthlyReports - Array of monthly reports (up to 12)
     * @param localizationService - For Hebrew month name translation
     * @returns Stacked chart data with 12 month labels and datasets for income, categories, and savings
     */
    prepareStackedBarChartData(monthlyReports, localizationService) {
        // Sort reports chronologically
        const sortedReports = [...monthlyReports].sort((a, b) => a.month.getTime() - b.month.getTime());
        // Build a map from month index (0-11) to report for quick lookup
        const reportByMonthIndex = new Map();
        for (const report of sortedReports) {
            const monthIndex = report.month.getMonth();
            reportByMonthIndex.set(monthIndex, report);
        }
        // Generate 12 Hebrew month labels (January through December)
        const labels = [];
        for (let m = 1; m <= 12; m++) {
            labels.push(localizationService.getMonthName(m));
        }
        // Collect all unique expense categories across all months (sorted for determinism)
        const allCategories = new Set();
        for (const report of sortedReports) {
            for (const [category] of report.expensesByCategory) {
                allCategories.add(category);
            }
        }
        const sortedCategories = Array.from(allCategories).sort();
        let colorIndex = 0;
        const getNextColor = () => {
            const color = ChartDataPrepService.STACKED_CHART_COLORS[colorIndex % ChartDataPrepService.STACKED_CHART_COLORS.length];
            colorIndex++;
            return color;
        };
        const datasets = [];
        // Dataset for net income
        const incomeData = [];
        for (let m = 0; m < 12; m++) {
            const report = reportByMonthIndex.get(m);
            incomeData.push(report ? this.roundToTwoDecimals(report.netIncome) : 0);
        }
        datasets.push({
            label: 'הכנסה נטו',
            data: incomeData,
            backgroundColor: getNextColor(),
            stack: 'income',
        });
        // Dataset for each expense category
        for (const category of sortedCategories) {
            const categoryData = [];
            for (let m = 0; m < 12; m++) {
                const report = reportByMonthIndex.get(m);
                const amount = report?.expensesByCategory.get(category) ?? 0;
                categoryData.push(this.roundToTwoDecimals(amount));
            }
            datasets.push({
                label: category,
                data: categoryData,
                backgroundColor: getNextColor(),
                stack: 'expenses',
            });
        }
        // Dataset for monthly savings
        const savingsData = [];
        for (let m = 0; m < 12; m++) {
            const report = reportByMonthIndex.get(m);
            savingsData.push(report ? this.roundToTwoDecimals(report.netSavings) : 0);
        }
        datasets.push({
            label: 'חיסכון חודשי',
            data: savingsData,
            backgroundColor: getNextColor(),
            stack: 'savings',
        });
        return { labels, datasets };
    }
}
//# sourceMappingURL=ChartDataPrepService.js.map

// dist/application/TaxCalculator.js
/**
 * TaxCalculator - Calculates Israeli tax deductions according to 2026 regulations
 *
 * This service implements the complete Israeli tax calculation including:
 * - Progressive income tax with 2026 brackets
 * - National Insurance (Bituach Leumi) ~7% up to ceiling
 * - Health Insurance (Bituach Briut) ~5% up to ceiling
 * - Pension contributions (6% employee, 6.5% employer)
 * - Study fund contributions (2.5% employee, 7.5% employer)
 */
class TaxCalculator {
    // 2026 Israeli Tax Brackets (monthly)
    static TAX_BRACKETS = [
        { ceiling: 7010, rate: 0.10 }, // Up to ₪7,010: 10%
        { ceiling: 10060, rate: 0.14 }, // ₪7,011-₪10,060: 14%
        { ceiling: 16150, rate: 0.20 }, // ₪10,061-₪16,150: 20%
        { ceiling: 22440, rate: 0.31 }, // ₪16,151-₪22,440: 31%
        { ceiling: 46690, rate: 0.35 }, // ₪22,441-₪46,690: 35%
        { ceiling: Infinity, rate: 0.47 }, // Above ₪46,690: 47%
    ];
    // National Insurance progressive brackets (2026)
    static NI_BRACKET_1_CEILING = 7703;
    static NI_BRACKET_1_RATE = 0.0104; // 1.04%
    static NI_BRACKET_2_RATE = 0.07; // 7.00%
    static NI_MAX_CEILING = 51910;
    // Health Insurance progressive brackets (2026)
    static HI_BRACKET_1_CEILING = 7703;
    static HI_BRACKET_1_RATE = 0.0323; // 3.23%
    static HI_BRACKET_2_RATE = 0.0517; // 5.17%
    static HI_MAX_CEILING = 51910;
    // Pension contribution rates
    static PENSION_EMPLOYEE_RATE = 0.06;
    static PENSION_EMPLOYER_RATE = 0.065;
    // Study fund contribution rates
    static STUDY_FUND_EMPLOYEE_RATE = 0.025;
    static STUDY_FUND_EMPLOYER_RATE = 0.075;
    // Tax credit points configuration (2024 rate)
    static MONTHLY_CREDIT_VALUE_PER_POINT = 223;
    static DEFAULT_TAX_CREDIT_POINTS = 2.25;
    /**
     * Calculate net income from salary components
     * @param salaryComponents - The salary components (base, bonus, stocks, etc.)
     * @param taxCreditPoints - Optional tax credit points (default: 2.25)
     * @returns Complete tax calculation result with all deductions
     */
    calculateNetIncome(salaryComponents, taxCreditPoints) {
        // Use default if not provided
        const creditPoints = taxCreditPoints ?? TaxCalculator.DEFAULT_TAX_CREDIT_POINTS;
        // Calculate gross salary as sum of all components
        const grossSalary = this.calculateGrossSalary(salaryComponents);
        // Taxable income includes everything
        const taxableIncome = grossSalary;
        // Cash income excludes meal vouchers (they're taxed but don't go to bank account)
        const mealVouchers = salaryComponents.mealVouchers || 0;
        const cashIncome = grossSalary - mealVouchers;
        // Pension and study fund are calculated ONLY on base salary (not bonus, food, etc.)
        const pensionBase = salaryComponents.baseSalary;
        // Calculate pension and study fund first (needed for tax calculation)
        const pensionEmployeeContribution = this.calculatePensionEmployee(pensionBase);
        const studyFundEmployeeContribution = this.calculateStudyFundEmployee(pensionBase);
        const pensionEmployerContribution = this.calculatePensionEmployer(pensionBase);
        const studyFundEmployerContribution = this.calculateStudyFundEmployer(pensionBase);
        // Taxable income for income tax = gross - pension employee - study fund employee
        // (Pension and study fund contributions are tax-deductible in Israel)
        const taxableIncomeForIncomeTax = taxableIncome - pensionEmployeeContribution - studyFundEmployeeContribution;
        // Calculate income tax on the reduced taxable income
        const incomeTaxBeforeCredit = this.calculateIncomeTax(taxableIncomeForIncomeTax);
        const taxCreditDeduction = this.calculateTaxCreditDeduction(creditPoints);
        const incomeTax = Math.max(0, incomeTaxBeforeCredit - taxCreditDeduction);
        // National Insurance and Health Insurance calculated on GROSS SALARY (before deductions)
        const nationalInsurance = this.calculateNationalInsurance(grossSalary);
        const healthInsurance = this.calculateHealthInsurance(grossSalary);
        // Calculate net income: CASH income (excludes meal vouchers) minus all employee deductions
        const netIncome = cashIncome
            - incomeTax
            - nationalInsurance
            - healthInsurance
            - pensionEmployeeContribution
            - studyFundEmployeeContribution;
        return {
            salaryComponents,
            grossSalary: this.roundToTwoDecimals(grossSalary),
            taxableIncome: this.roundToTwoDecimals(taxableIncome),
            cashIncome: this.roundToTwoDecimals(cashIncome),
            incomeTax: this.roundToTwoDecimals(incomeTax),
            nationalInsurance: this.roundToTwoDecimals(nationalInsurance),
            healthInsurance: this.roundToTwoDecimals(healthInsurance),
            pensionEmployeeContribution: this.roundToTwoDecimals(pensionEmployeeContribution),
            pensionEmployerContribution: this.roundToTwoDecimals(pensionEmployerContribution),
            studyFundEmployeeContribution: this.roundToTwoDecimals(studyFundEmployeeContribution),
            studyFundEmployerContribution: this.roundToTwoDecimals(studyFundEmployerContribution),
            netIncome: this.roundToTwoDecimals(netIncome),
            taxCreditDeduction: this.roundToTwoDecimals(taxCreditDeduction),
        };
    }
    /**
     * Calculate gross salary from all components
     */
    calculateGrossSalary(components) {
        return (components.baseSalary +
            (components.bonus || 0) +
            (components.mealVouchers || 0) +
            (components.otherCompensation || 0) +
            (components.directPensionContribution || 0) // Include in gross for tax purposes
        );
    }
    /**
     * Calculate progressive income tax based on 2026 brackets
     */
    calculateIncomeTax(grossSalary) {
        let tax = 0;
        let previousCeiling = 0;
        for (const bracket of TaxCalculator.TAX_BRACKETS) {
            if (grossSalary <= previousCeiling) {
                break;
            }
            const taxableInBracket = Math.min(grossSalary, bracket.ceiling) - previousCeiling;
            tax += taxableInBracket * bracket.rate;
            previousCeiling = bracket.ceiling;
        }
        return tax;
    }
    /**
     * Calculate National Insurance (Bituach Leumi) with progressive brackets
     * Bracket 1 (up to 7,703): 1.04%
     * Bracket 2 (7,703-51,910): 7.00%
     */
    calculateNationalInsurance(grossSalary) {
        let insurance = 0;
        // Apply bracket 1 rate to first 7,703 ₪
        const bracket1Amount = Math.min(grossSalary, TaxCalculator.NI_BRACKET_1_CEILING);
        insurance += bracket1Amount * TaxCalculator.NI_BRACKET_1_RATE;
        // Apply bracket 2 rate to amount above 7,703 ₪ up to ceiling
        if (grossSalary > TaxCalculator.NI_BRACKET_1_CEILING) {
            const bracket2Amount = Math.min(grossSalary, TaxCalculator.NI_MAX_CEILING) - TaxCalculator.NI_BRACKET_1_CEILING;
            insurance += bracket2Amount * TaxCalculator.NI_BRACKET_2_RATE;
        }
        return insurance;
    }
    /**
     * Calculate Health Insurance (Bituach Briut) with progressive brackets
     * Bracket 1 (up to 7,703): 3.23%
     * Bracket 2 (7,703-51,910): 5.17%
     */
    calculateHealthInsurance(grossSalary) {
        let insurance = 0;
        // Apply bracket 1 rate to first 7,703 ₪
        const bracket1Amount = Math.min(grossSalary, TaxCalculator.HI_BRACKET_1_CEILING);
        insurance += bracket1Amount * TaxCalculator.HI_BRACKET_1_RATE;
        // Apply bracket 2 rate to amount above 7,703 ₪ up to ceiling
        if (grossSalary > TaxCalculator.HI_BRACKET_1_CEILING) {
            const bracket2Amount = Math.min(grossSalary, TaxCalculator.HI_MAX_CEILING) - TaxCalculator.HI_BRACKET_1_CEILING;
            insurance += bracket2Amount * TaxCalculator.HI_BRACKET_2_RATE;
        }
        return insurance;
    }
    /**
     * Calculate employee pension contribution - 6% of gross salary
     */
    calculatePensionEmployee(grossSalary) {
        return grossSalary * TaxCalculator.PENSION_EMPLOYEE_RATE;
    }
    /**
     * Calculate employer pension contribution - 6.5% of gross salary
     */
    calculatePensionEmployer(grossSalary) {
        return grossSalary * TaxCalculator.PENSION_EMPLOYER_RATE;
    }
    /**
     * Calculate employee study fund contribution - 2.5% of gross salary
     */
    calculateStudyFundEmployee(grossSalary) {
        return grossSalary * TaxCalculator.STUDY_FUND_EMPLOYEE_RATE;
    }
    /**
     * Calculate employer study fund contribution - 7.5% of gross salary
     */
    calculateStudyFundEmployer(grossSalary) {
        return grossSalary * TaxCalculator.STUDY_FUND_EMPLOYER_RATE;
    }
    /**
     * Calculate tax credit deduction from tax credit points
     * @param taxCreditPoints - Number of tax credit points (0-10)
     * @returns Tax credit deduction amount
     */
    calculateTaxCreditDeduction(taxCreditPoints) {
        return taxCreditPoints * TaxCalculator.MONTHLY_CREDIT_VALUE_PER_POINT;
    }
    /**
     * Round monetary values to 2 decimal places
     */
    roundToTwoDecimals(value) {
        return Math.round(value * 100) / 100;
    }
}
//# sourceMappingURL=TaxCalculator.js.map

// dist/application/ExpenseManager.js
/**
 * ExpenseManager handles expense operations
 * Implements Requirements 3.1-3.6, 4.1-4.6, 6.1
 */

class ExpenseManager {
    validationService;
    csvParser;
    storageService;
    constructor(validationService, csvParser, storageService) {
        this.validationService = validationService;
        this.csvParser = csvParser;
        this.storageService = storageService;
    }
    /**
     * Add a single expense with validation
     */
    async addExpense(input, existingExpenses) {
        // Validate expense
        const validation = this.validationService.validateExpense(input);
        if (!validation.isValid) {
            return {
                success: false,
                error: {
                    field: 'expense',
                    message: validation.errors.join(', ')
                }
            };
        }
        // Check for duplicates
        const isDuplicate = this.validationService.checkDuplicate(input, existingExpenses);
        if (isDuplicate) {
            return {
                success: false,
                error: {
                    field: 'duplicate',
                    message: 'הוצאה זהה כבר קיימת (אותו סכום, תאריך ותיאור)'
                }
            };
        }
        // Create and save expense
        const expense = createExpense(input);
        await this.storageService.saveExpense(expense);
        return {
            success: true,
            value: expense
        };
    }
    /**
     * Upload expenses from CSV
     */
    async uploadExpenses(csvContent, existingExpenses) {
        const parseResult = this.csvParser.parse(csvContent);
        if (!parseResult.success) {
            // Convert parse errors to failed records
            const failedRecords = parseResult.error.map(err => ({
                lineNumber: err.line,
                data: '',
                error: err.message
            }));
            return {
                successCount: 0,
                failedRecords
            };
        }
        const expenses = parseResult.value;
        const failedRecords = [];
        let successCount = 0;
        for (const expense of expenses) {
            try {
                // Validate each expense
                const validation = this.validationService.validateExpense({
                    amount: expense.amount,
                    date: expense.date,
                    category: expense.category ?? undefined,
                    description: expense.description ?? undefined
                });
                if (!validation.isValid) {
                    failedRecords.push({
                        lineNumber: 0,
                        data: `${expense.amount},${expense.date}`,
                        error: validation.errors.join(', ')
                    });
                    continue;
                }
                // Save expense
                await this.storageService.saveExpense(expense);
                successCount++;
            }
            catch (error) {
                failedRecords.push({
                    lineNumber: 0,
                    data: `${expense.amount},${expense.date}`,
                    error: 'שגיאה בשמירת ההוצאה'
                });
            }
        }
        return {
            successCount,
            failedRecords
        };
    }
    /**
     * Get expenses for a specific month
     */
    getExpensesByMonth(expenses, year, month) {
        return expenses.filter(expense => {
            const expenseDate = expense.date;
            return expenseDate.getFullYear() === year && expenseDate.getMonth() === month;
        });
    }
    /**
     * Get expenses within a date range
     */
    getExpensesByDateRange(expenses, startDate, endDate) {
        return expenses.filter(expense => {
            const expenseDate = expense.date;
            return expenseDate >= startDate && expenseDate <= endDate;
        });
    }
}
//# sourceMappingURL=ExpenseManager.js.map

// dist/application/BudgetController.js
/**
 * BudgetController orchestrates all budget tracking workflows
 * Implements all requirements
 */



class BudgetController {
    taxCalculator;
    expenseManager;
    validationService;
    storageService;
    recurringExpenseGenerator;
    savingsGoalManager;
    constructor(taxCalculator, expenseManager, validationService, storageService) {
        this.taxCalculator = taxCalculator;
        this.expenseManager = expenseManager;
        this.validationService = validationService;
        this.storageService = storageService;
        this.recurringExpenseGenerator = new RecurringExpenseGenerator(validationService, storageService);
        this.savingsGoalManager = new SavingsGoalManager(storageService);
    }
    /**
     * Enter salary for a month
     */
    async enterSalary(components, month, taxCreditPoints) {
        // Validate salary components
        const validation = this.validationService.validateSalaryComponents(components);
        if (!validation.isValid) {
            return {
                success: false,
                error: {
                    field: 'salary',
                    message: validation.errors.join(', ')
                }
            };
        }
        // Calculate taxes with tax credit points
        const taxCalculation = this.taxCalculator.calculateNetIncome(components, taxCreditPoints);
        // Create and save salary record
        const salaryRecord = createSalaryRecord(components, month, taxCalculation);
        await this.storageService.saveSalary(salaryRecord);
        return {
            success: true,
            value: salaryRecord
        };
    }
    /**
     * Add a single expense
     */
    async addExpense(input) {
        const data = await this.storageService.loadAllData();
        return this.expenseManager.addExpense(input, data.expenses);
    }
    /**
     * Upload expenses from CSV
     */
    async uploadExpenses(csvContent) {
        const data = await this.storageService.loadAllData();
        return this.expenseManager.uploadExpenses(csvContent, data.expenses);
    }
    /**
     * Get monthly report
     */
    async getMonthlyReport(year, month) {
        const data = await this.storageService.loadAllData();
        // Find salary for this month
        const salary = data.salaries.find(s => s.month.getFullYear() === year && s.month.getMonth() === month);
        if (!salary) {
            return null;
        }
        // Get expenses for this month
        const expenses = this.expenseManager.getExpensesByMonth(data.expenses, year, month);
        // Create monthly report
        return createMonthlyReport(new Date(year, month, 1), salary.taxCalculation.netIncome, expenses);
    }
    /**
     * Get annual report for the last 12 months
     */
    async getAnnualReport() {
        const data = await this.storageService.loadAllData();
        // Get last 12 months
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 11);
        startDate.setDate(1);
        // Generate monthly reports for each month
        const monthlyReports = [];
        let totalPensionAccumulation = 0;
        let totalStudyFundAccumulation = 0;
        for (let i = 0; i < 12; i++) {
            const reportDate = new Date(startDate);
            reportDate.setMonth(startDate.getMonth() + i);
            const year = reportDate.getFullYear();
            const month = reportDate.getMonth();
            // Find salary for this month
            const salary = data.salaries.find(s => s.month.getFullYear() === year && s.month.getMonth() === month);
            const netIncome = salary ? salary.taxCalculation.netIncome : 0;
            const expenses = this.expenseManager.getExpensesByMonth(data.expenses, year, month);
            monthlyReports.push(createMonthlyReport(new Date(year, month, 1), netIncome, expenses));
            // Accumulate pension and study fund
            if (salary) {
                totalPensionAccumulation +=
                    salary.taxCalculation.pensionEmployeeContribution +
                        salary.taxCalculation.pensionEmployerContribution;
                totalStudyFundAccumulation +=
                    salary.taxCalculation.studyFundEmployeeContribution +
                        salary.taxCalculation.studyFundEmployerContribution;
            }
        }
        return createAnnualReport(startDate, endDate, monthlyReports, totalPensionAccumulation, totalStudyFundAccumulation);
    }
    /**
     * Load all data
     */
    async loadAllData() {
        return this.storageService.loadAllData();
    }
    /**
     * Add a new savings entry
     */
    async addSavingsEntry(input) {
        const entry = createSavingsEntry(input);
        await this.storageService.saveSavingsEntry(entry);
        return entry;
    }
    /**
     * Get all savings entries
     */
    async getSavingsEntries() {
        return this.storageService.loadSavingsEntries();
    }
    /**
     * Update an existing savings entry
     */
    async updateSavingsEntry(id, entry) {
        await this.storageService.updateSavingsEntry(id, entry);
    }
    /**
     * Delete a savings entry
     */
    async deleteSavingsEntry(id) {
        await this.storageService.deleteSavingsEntry(id);
    }
    /**
     * Set monthly savings goal
     */
    async setMonthlySavingsGoal(amount) {
        await this.savingsGoalManager.setMonthlySavingsGoal(amount);
    }
    /**
     * Get monthly savings goal
     */
    async getMonthlySavingsGoal() {
        return this.savingsGoalManager.getMonthlySavingsGoal();
    }
    /**
     * Get yearly savings goal derived from monthly goal
     */
    getYearlySavingsGoal(monthlyGoal) {
        return this.savingsGoalManager.getYearlySavingsGoal(monthlyGoal);
    }
    /**
     * Get the RecurringExpenseGenerator instance
     */
    getRecurringExpenseGenerator() {
        return this.recurringExpenseGenerator;
    }
}
//# sourceMappingURL=BudgetController.js.map

// dist/presentation/ChartManager.js
/**
 * ChartManager - Handles Chart.js rendering and lifecycle
 */

class ChartManager {
    chartInstances = new Map();
    /**
     * Render a pie chart in the specified container
     * @param containerId - DOM element ID for chart canvas
     * @param data - Chart data to visualize
     * @param options - Chart.js configuration options
     */
    renderPieChart(containerId, data, options) {
        try {
            // Destroy existing chart if present
            this.destroyChart(containerId);
            const canvas = document.getElementById(containerId);
            if (!canvas) {
                console.error(`Canvas element with ID "${containerId}" not found`);
                return;
            }
            // Set minimum height
            canvas.style.minHeight = `${CHART_MIN_HEIGHTS.PIE}px`;
            // Add accessibility label
            canvas.setAttribute('role', 'img');
            canvas.setAttribute('aria-label', `תרשים עוגה של הוצאות לפי קטגוריה: ${data.labels.join(', ')}`);
            // Merge default options with custom options
            const chartOptions = {
                ...CHART_DEFAULT_OPTIONS,
                ...options,
                plugins: {
                    ...CHART_DEFAULT_OPTIONS.plugins,
                    ...(options?.plugins || {})
                }
            };
            // Create new chart instance
            const chart = new Chart(canvas, {
                type: 'pie',
                data: {
                    labels: data.labels,
                    datasets: [{
                            data: data.values,
                            backgroundColor: data.colors,
                            borderWidth: 1,
                            borderColor: '#ffffff'
                        }]
                },
                options: chartOptions
            });
            this.chartInstances.set(containerId, chart);
        }
        catch (error) {
            console.error('Error rendering pie chart:', error);
        }
    }
    /**
     * Render a bar chart in the specified container
     * @param containerId - DOM element ID for chart canvas
     * @param data - Chart data to visualize
     * @param options - Chart.js configuration options
     */
    renderBarChart(containerId, data, options) {
        try {
            // Destroy existing chart if present
            this.destroyChart(containerId);
            const canvas = document.getElementById(containerId);
            if (!canvas) {
                console.error(`Canvas element with ID "${containerId}" not found`);
                return;
            }
            // Set minimum height
            canvas.style.minHeight = `${CHART_MIN_HEIGHTS.BAR}px`;
            // Add accessibility label
            canvas.setAttribute('role', 'img');
            canvas.setAttribute('aria-label', `תרשים עמודות של הוצאות חודשיות: ${data.labels.join(', ')}`);
            // Merge default options with custom options
            const chartOptions = {
                ...CHART_DEFAULT_OPTIONS,
                ...options,
                plugins: {
                    ...CHART_DEFAULT_OPTIONS.plugins,
                    ...(options?.plugins || {})
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'הוצאות (₪)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'חודש'
                        }
                    }
                }
            };
            // Create new chart instance
            const chart = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: data.labels,
                    datasets: [{
                            label: 'הוצאות חודשיות',
                            data: data.values,
                            backgroundColor: 'rgba(54, 162, 235, 0.6)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        }]
                },
                options: chartOptions
            });
            this.chartInstances.set(containerId, chart);
        }
        catch (error) {
            console.error('Error rendering bar chart:', error);
        }
    }
    /**
     * Render a stacked bar chart in the specified container
     * @param containerId - DOM element ID for chart canvas
     * @param data - Stacked chart data with datasets for income, categories, and savings
     * @param options - Chart.js configuration options
     */
    renderStackedBarChart(containerId, data, options) {
        try {
            // Destroy existing chart if present
            this.destroyChart(containerId);
            const canvas = document.getElementById(containerId);
            if (!canvas) {
                console.error(`Canvas element with ID "${containerId}" not found`);
                return;
            }
            // Set minimum height
            canvas.style.minHeight = `${CHART_MIN_HEIGHTS.STACKED_BAR}px`;
            // Add accessibility label
            canvas.setAttribute('role', 'img');
            canvas.setAttribute('aria-label', 'תרשים עמודות מוערם של הכנסות, הוצאות וחיסכון חודשי');
            // Merge default options with custom options and stacked scales
            const chartOptions = {
                ...CHART_DEFAULT_OPTIONS,
                ...options,
                plugins: {
                    ...CHART_DEFAULT_OPTIONS.plugins,
                    ...(options?.plugins || {}),
                    legend: {
                        display: true,
                        position: 'top',
                        rtl: true,
                        textDirection: 'rtl'
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        title: {
                            display: true,
                            text: 'חודש'
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'סכום (₪)'
                        }
                    }
                }
            };
            // Create new chart instance
            const chart = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: data.labels,
                    datasets: data.datasets
                },
                options: chartOptions
            });
            this.chartInstances.set(containerId, chart);
        }
        catch (error) {
            console.error('Error rendering stacked bar chart:', error);
        }
    }
    /**
     * Destroy existing chart instance to prevent memory leaks
     * @param containerId - DOM element ID of chart to destroy
     */
    destroyChart(containerId) {
        const existingChart = this.chartInstances.get(containerId);
        if (existingChart) {
            try {
                existingChart.destroy();
                this.chartInstances.delete(containerId);
            }
            catch (error) {
                console.error('Error destroying chart:', error);
            }
        }
    }
}
//# sourceMappingURL=ChartManager.js.map

// dist/presentation/EntryManager.js
/**
 * EntryManager - Handles rendering and management of salary and expense entry lists
 * Implements Requirements 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5
 */
/**
 * Hebrew messages for the entry manager
 */
const MESSAGES = {
    EMPTY_SALARIES: 'לא נמצאו רשומות משכורת',
    EMPTY_EXPENSES: 'לא נמצאו רשומות הוצאות',
    EDIT: 'ערוך',
    DELETE: 'מחק',
    MONTH: 'חודש',
    GROSS_SALARY: 'משכורת ברוטו',
    NET_INCOME: 'הכנסה נטו',
    DATE: 'תאריך',
    AMOUNT: 'סכום',
    CATEGORY: 'קטגוריה',
    DESCRIPTION: 'תיאור',
    NO_CATEGORY: 'ללא קטגוריה',
    NO_DESCRIPTION: 'ללא תיאור',
    DELETE_CONFIRMATION: 'האם אתה בטוח שברצונך למחוק רשומה זו?',
    CANCEL: 'ביטול',
    SAVE: 'שמור',
    EDIT_SALARY_TITLE: 'עריכת משכורת',
    EDIT_EXPENSE_TITLE: 'עריכת הוצאה',
    BASE_SALARY: 'משכורת בסיס',
    BONUS: 'בונוס',
    STOCK_VALUE: 'ערך מניות/אופציות',
    MEAL_VOUCHERS: 'תלושי אוכל',
    OTHER_COMPENSATION: 'רכיבי שכר נוספים'
};
/**
 * EntryManager class for rendering salary and expense lists
 */
class EntryManager {
    storageService;
    validationService;
    taxCalculator;
    config;
    constructor(storageService, config = {}, validationService, taxCalculator) {
        this.storageService = storageService;
        this.config = config;
        this.validationService = validationService;
        this.taxCalculator = taxCalculator;
    }
    /**
     * Render the salary list in the specified container
     * Fetches salary records via StorageService.loadAllData(), renders sorted by month descending
     * showing month, gross salary, net income, with edit and delete buttons per record
     * @param container - DOM element to render the list into
     */
    async renderSalaryList(container) {
        try {
            const data = await this.storageService.loadAllData();
            const salaries = data.salaries;
            // Clear container
            container.innerHTML = '';
            // Show empty state if no records
            if (salaries.length === 0) {
                this.showEmptyState(container, 'salary');
                return;
            }
            // Salaries are already sorted by month descending from StorageService
            const listContainer = document.createElement('div');
            listContainer.className = 'entry-list';
            listContainer.setAttribute('role', 'list');
            listContainer.setAttribute('aria-label', 'רשימת משכורות');
            salaries.forEach((salary) => {
                const item = this.createSalaryListItem(salary);
                listContainer.appendChild(item);
            });
            container.appendChild(listContainer);
        }
        catch (error) {
            console.error('Error rendering salary list:', error);
            throw error;
        }
    }
    /**
     * Render the expense list in the specified container
     * Fetches expense records, renders sorted by date descending
     * showing date, amount, category, description, with edit and delete buttons per record
     * @param container - DOM element to render the list into
     */
    async renderExpenseList(container) {
        try {
            const data = await this.storageService.loadAllData();
            const expenses = data.expenses;
            // Clear container
            container.innerHTML = '';
            // Show empty state if no records
            if (expenses.length === 0) {
                this.showEmptyState(container, 'expense');
                return;
            }
            // Expenses are already sorted by date descending from StorageService
            const listContainer = document.createElement('div');
            listContainer.className = 'entry-list';
            listContainer.setAttribute('role', 'list');
            listContainer.setAttribute('aria-label', 'רשימת הוצאות');
            expenses.forEach((expense) => {
                const item = this.createExpenseListItem(expense);
                listContainer.appendChild(item);
            });
            container.appendChild(listContainer);
        }
        catch (error) {
            console.error('Error rendering expense list:', error);
            throw error;
        }
    }
    /**
     * Filter expenses by a specific month and year
     * @param expenses - Array of expenses to filter
     * @param month - Month number (1-12)
     * @param year - Full year (e.g. 2024)
     * @returns Filtered array of expenses matching the given month/year
     */
    static filterExpensesByMonth(expenses, month, year) {
        return expenses.filter((expense) => expense.date.getMonth() + 1 === month && expense.date.getFullYear() === year);
    }
    /**
     * Render the expense list filtered by a specific month and year
     * Fetches all expense records, filters to the given month/year, then renders
     * @param container - DOM element to render the list into
     * @param month - Month number (1-12)
     * @param year - Full year (e.g. 2024)
     */
    async renderFilteredExpenseList(container, month, year) {
        try {
            const data = await this.storageService.loadAllData();
            const filtered = EntryManager.filterExpensesByMonth(data.expenses, month, year);
            // Clear container
            container.innerHTML = '';
            // Show empty state if no records match
            if (filtered.length === 0) {
                this.showEmptyState(container, 'expense');
                return;
            }
            const listContainer = document.createElement('div');
            listContainer.className = 'entry-list';
            listContainer.setAttribute('role', 'list');
            listContainer.setAttribute('aria-label', 'רשימת הוצאות');
            filtered.forEach((expense) => {
                const item = this.createExpenseListItem(expense);
                listContainer.appendChild(item);
            });
            container.appendChild(listContainer);
        }
        catch (error) {
            console.error('Error rendering filtered expense list:', error);
            throw error;
        }
    }
    /**
     * Show empty state message when no records exist
     * @param container - DOM element to render the message into
     * @param type - Type of records ('salary' or 'expense')
     */
    showEmptyState(container, type) {
        const message = type === 'salary'
            ? MESSAGES.EMPTY_SALARIES
            : MESSAGES.EMPTY_EXPENSES;
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.setAttribute('role', 'status');
        emptyState.innerHTML = `
      <p class="empty-state-message">${message}</p>
    `;
        container.innerHTML = '';
        container.appendChild(emptyState);
    }
    /**
     * Create a salary list item element
     * @param salary - SalaryRecord to render
     * @returns HTMLElement representing the salary item
     */
    createSalaryListItem(salary) {
        const item = document.createElement('div');
        item.className = 'entry-item salary-entry';
        item.setAttribute('role', 'listitem');
        item.setAttribute('data-id', salary.id);
        const monthStr = this.formatMonth(salary.month);
        const grossSalary = this.formatCurrency(salary.taxCalculation.grossSalary);
        const netIncome = this.formatCurrency(salary.taxCalculation.netIncome);
        item.innerHTML = `
      <div class="entry-details">
        <div class="entry-field">
          <span class="entry-label">${MESSAGES.MONTH}:</span>
          <span class="entry-value">${monthStr}</span>
        </div>
        <div class="entry-field">
          <span class="entry-label">${MESSAGES.GROSS_SALARY}:</span>
          <span class="entry-value">${grossSalary}</span>
        </div>
        <div class="entry-field">
          <span class="entry-label">${MESSAGES.NET_INCOME}:</span>
          <span class="entry-value entry-value-highlight">${netIncome}</span>
        </div>
      </div>
      <div class="entry-actions">
        <button type="button" class="btn-edit" aria-label="${MESSAGES.EDIT} משכורת ${monthStr}">${MESSAGES.EDIT}</button>
        <button type="button" class="btn-delete" aria-label="${MESSAGES.DELETE} משכורת ${monthStr}">${MESSAGES.DELETE}</button>
      </div>
    `;
        // Attach event listeners
        const editBtn = item.querySelector('.btn-edit');
        const deleteBtn = item.querySelector('.btn-delete');
        if (editBtn && this.config.onEditSalary) {
            editBtn.addEventListener('click', () => {
                this.config.onEditSalary(salary);
            });
        }
        if (deleteBtn && this.config.onDeleteSalary) {
            deleteBtn.addEventListener('click', () => {
                this.config.onDeleteSalary(salary.id);
            });
        }
        return item;
    }
    /**
     * Create an expense list item element
     * @param expense - Expense to render
     * @returns HTMLElement representing the expense item
     */
    createExpenseListItem(expense) {
        const item = document.createElement('div');
        item.className = 'entry-item expense-entry';
        item.setAttribute('role', 'listitem');
        item.setAttribute('data-id', expense.id);
        const dateStr = this.formatDate(expense.date);
        const amount = this.formatCurrency(expense.amount);
        const category = expense.category || MESSAGES.NO_CATEGORY;
        const description = expense.description || MESSAGES.NO_DESCRIPTION;
        item.innerHTML = `
      <div class="entry-details">
        <div class="entry-field">
          <span class="entry-label">${MESSAGES.DATE}:</span>
          <span class="entry-value">${dateStr}</span>
        </div>
        <div class="entry-field">
          <span class="entry-label">${MESSAGES.AMOUNT}:</span>
          <span class="entry-value entry-value-highlight">${amount}</span>
        </div>
        <div class="entry-field">
          <span class="entry-label">${MESSAGES.CATEGORY}:</span>
          <span class="entry-value">${category}</span>
        </div>
        <div class="entry-field">
          <span class="entry-label">${MESSAGES.DESCRIPTION}:</span>
          <span class="entry-value">${description}</span>
        </div>
      </div>
      <div class="entry-actions">
        <button type="button" class="btn-edit" aria-label="${MESSAGES.EDIT} הוצאה ${dateStr}">${MESSAGES.EDIT}</button>
        <button type="button" class="btn-delete" aria-label="${MESSAGES.DELETE} הוצאה ${dateStr}">${MESSAGES.DELETE}</button>
      </div>
    `;
        // Attach event listeners
        const editBtn = item.querySelector('.btn-edit');
        const deleteBtn = item.querySelector('.btn-delete');
        if (editBtn && this.config.onEditExpense) {
            editBtn.addEventListener('click', () => {
                this.config.onEditExpense(expense);
            });
        }
        if (deleteBtn && this.config.onDeleteExpense) {
            deleteBtn.addEventListener('click', () => {
                this.config.onDeleteExpense(expense.id);
            });
        }
        return item;
    }
    /**
     * Format a date as a Hebrew month string (e.g., "ינואר 2026")
     * @param date - Date to format
     * @returns Formatted month string
     */
    formatMonth(date) {
        return date.toLocaleDateString('he-IL', {
            year: 'numeric',
            month: 'long'
        });
    }
    /**
     * Format a date as a Hebrew date string (e.g., "15/01/2026")
     * @param date - Date to format
     * @returns Formatted date string
     */
    formatDate(date) {
        return date.toLocaleDateString('he-IL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
    /**
     * Format a number as Israeli currency (₪)
     * @param amount - Amount to format
     * @returns Formatted currency string
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('he-IL', {
            style: 'currency',
            currency: 'ILS',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }
    /**
     * Remove a salary item from the DOM by ID
     * @param id - ID of the salary record to remove
     */
    removeSalaryItem(id) {
        const item = document.querySelector(`.salary-entry[data-id="${id}"]`);
        if (item) {
            item.remove();
        }
    }
    /**
     * Remove an expense item from the DOM by ID
     * @param id - ID of the expense record to remove
     */
    removeExpenseItem(id) {
        const item = document.querySelector(`.expense-entry[data-id="${id}"]`);
        if (item) {
            item.remove();
        }
    }
    /**
     * Show a confirmation dialog for deleting a record
     * Implements Requirements 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4
     * @param type - Type of record ('salary' or 'expense')
     * @param id - ID of the record to delete
     * @param onConfirm - Callback to execute when deletion is confirmed
     */
    showDeleteConfirmation(type, id, onConfirm) {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'confirmation-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'confirmation-title');
        // Create dialog content
        const dialog = document.createElement('div');
        dialog.className = 'confirmation-dialog';
        dialog.innerHTML = `
      <p id="confirmation-title" class="confirmation-message">${MESSAGES.DELETE_CONFIRMATION}</p>
      <div class="confirmation-buttons">
        <button type="button" class="btn-confirm-delete">${MESSAGES.DELETE}</button>
        <button type="button" class="btn-cancel">${MESSAGES.CANCEL}</button>
      </div>
    `;
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        // Get button references
        const confirmBtn = dialog.querySelector('.btn-confirm-delete');
        const cancelBtn = dialog.querySelector('.btn-cancel');
        // Function to close the dialog
        const closeDialog = () => {
            overlay.remove();
            document.removeEventListener('keydown', handleKeyDown);
        };
        // Handle confirm action
        const handleConfirm = async () => {
            try {
                await onConfirm();
                closeDialog();
            }
            catch (error) {
                console.error('Error during delete confirmation:', error);
                closeDialog();
                throw error;
            }
        };
        // Handle Escape key
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeDialog();
            }
        };
        // Handle click outside dialog (on overlay)
        const handleOverlayClick = (event) => {
            if (event.target === overlay) {
                closeDialog();
            }
        };
        // Attach event listeners
        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', closeDialog);
        overlay.addEventListener('click', handleOverlayClick);
        document.addEventListener('keydown', handleKeyDown);
        // Focus the cancel button for accessibility (safer default)
        cancelBtn.focus();
    }
    /**
     * Show an edit form for a salary record
     * Implements Requirements 3.1, 3.2, 3.3, 3.4, 3.5
     * @param record - SalaryRecord to edit
     */
    showEditSalaryForm(record) {
        if (!this.validationService || !this.taxCalculator) {
            console.error('ValidationService and TaxCalculator are required for editing salaries');
            return;
        }
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'edit-form-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'edit-salary-title');
        // Create form container
        const formContainer = document.createElement('div');
        formContainer.className = 'edit-form-container';
        // Format month for input (YYYY-MM)
        const monthValue = this.formatMonthForInput(record.month);
        formContainer.innerHTML = `
      <h2 id="edit-salary-title" class="edit-form-title">${MESSAGES.EDIT_SALARY_TITLE}</h2>
      <form class="edit-salary-form" novalidate>
        <div class="form-errors" role="alert" aria-live="polite"></div>
        
        <div class="form-group">
          <label for="edit-month">${MESSAGES.MONTH}</label>
          <input type="month" id="edit-month" name="month" value="${monthValue}" required />
        </div>
        
        <div class="form-group">
          <label for="edit-base-salary">${MESSAGES.BASE_SALARY}</label>
          <input type="number" id="edit-base-salary" name="baseSalary" 
            value="${record.salaryComponents.baseSalary}" min="0" step="0.01" required />
        </div>
        
        <div class="form-group">
          <label for="edit-bonus">${MESSAGES.BONUS}</label>
          <input type="number" id="edit-bonus" name="bonus" 
            value="${record.salaryComponents.bonus || 0}" min="0" step="0.01" />
        </div>
        
        <div class="form-group">
          <label for="edit-stock-value">${MESSAGES.STOCK_VALUE}</label>
          <input type="number" id="edit-stock-value" name="stockValue" 
            value="${record.salaryComponents.stockValue || 0}" min="0" step="0.01" />
        </div>
        
        <div class="form-group">
          <label for="edit-meal-vouchers">${MESSAGES.MEAL_VOUCHERS}</label>
          <input type="number" id="edit-meal-vouchers" name="mealVouchers" 
            value="${record.salaryComponents.mealVouchers || 0}" min="0" step="0.01" />
        </div>
        
        <div class="form-group">
          <label for="edit-other-compensation">${MESSAGES.OTHER_COMPENSATION}</label>
          <input type="number" id="edit-other-compensation" name="otherCompensation" 
            value="${record.salaryComponents.otherCompensation || 0}" min="0" step="0.01" />
        </div>
        
        <div class="form-buttons">
          <button type="submit" class="btn-save">${MESSAGES.SAVE}</button>
          <button type="button" class="btn-cancel">${MESSAGES.CANCEL}</button>
        </div>
      </form>
    `;
        overlay.appendChild(formContainer);
        document.body.appendChild(overlay);
        // Get form elements
        const form = formContainer.querySelector('.edit-salary-form');
        const cancelBtn = formContainer.querySelector('.btn-cancel');
        const errorsContainer = formContainer.querySelector('.form-errors');
        // Function to close the form
        const closeForm = () => {
            overlay.remove();
            document.removeEventListener('keydown', handleKeyDown);
        };
        // Handle form submission
        const handleSubmit = async (event) => {
            event.preventDefault();
            // Clear previous errors
            errorsContainer.innerHTML = '';
            // Get form values
            const formData = new FormData(form);
            const monthInput = formData.get('month');
            const baseSalary = parseFloat(formData.get('baseSalary')) || 0;
            const bonus = parseFloat(formData.get('bonus')) || 0;
            const stockValue = parseFloat(formData.get('stockValue')) || 0;
            const mealVouchers = parseFloat(formData.get('mealVouchers')) || 0;
            const otherCompensation = parseFloat(formData.get('otherCompensation')) || 0;
            // Build salary components
            const salaryComponents = {
                baseSalary,
                bonus: bonus || undefined,
                stockValue: stockValue || undefined,
                mealVouchers: mealVouchers || undefined,
                otherCompensation: otherCompensation || undefined
            };
            // Validate salary components
            const validationResult = this.validationService.validateSalaryComponents(salaryComponents);
            if (!validationResult.isValid) {
                // Display Hebrew validation errors
                this.displayFormErrors(errorsContainer, validationResult.errors);
                return;
            }
            // Parse month
            const [year, monthNum] = monthInput.split('-').map(Number);
            const month = new Date(year, monthNum - 1, 1);
            // Recalculate tax
            const taxCalculation = this.taxCalculator.calculateNetIncome(salaryComponents);
            // Build updated salary record
            const updatedSalary = {
                id: record.id,
                salaryComponents,
                month,
                taxCalculation,
                createdAt: record.createdAt
            };
            try {
                // Update in storage
                await this.storageService.updateSalary(record.id, updatedSalary);
                // Close form
                closeForm();
                // Refresh the salary list if container is configured
                if (this.config.salaryListContainer) {
                    await this.renderSalaryList(this.config.salaryListContainer);
                }
            }
            catch (error) {
                // Display storage error
                const errorMessage = error instanceof Error ? error.message : 'שגיאה בשמירת הנתונים';
                this.displayFormErrors(errorsContainer, [errorMessage]);
            }
        };
        // Handle Escape key
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeForm();
            }
        };
        // Handle click outside form (on overlay)
        const handleOverlayClick = (event) => {
            if (event.target === overlay) {
                closeForm();
            }
        };
        // Attach event listeners
        form.addEventListener('submit', handleSubmit);
        cancelBtn.addEventListener('click', closeForm);
        overlay.addEventListener('click', handleOverlayClick);
        document.addEventListener('keydown', handleKeyDown);
        // Focus the first input for accessibility
        const firstInput = form.querySelector('input');
        if (firstInput) {
            firstInput.focus();
        }
    }
    /**
     * Display validation errors in the form
     * @param container - Container element for errors
     * @param errors - Array of error messages
     */
    displayFormErrors(container, errors) {
        container.innerHTML = errors
            .map(error => `<p class="form-error">${error}</p>`)
            .join('');
    }
    /**
     * Format a date as YYYY-MM for month input
     * @param date - Date to format
     * @returns Formatted string
     */
    formatMonthForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }
    /**
     * Format a date as YYYY-MM-DD for date input
     * @param date - Date to format
     * @returns Formatted string
     */
    formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    /**
     * Show an edit form for an expense record
     * Implements Requirements 4.1, 4.2, 4.3, 4.4, 4.5
     * @param record - Expense to edit
     */
    showEditExpenseForm(record) {
        if (!this.validationService) {
            console.error('ValidationService is required for editing expenses');
            return;
        }
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'edit-form-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'edit-expense-title');
        // Create form container
        const formContainer = document.createElement('div');
        formContainer.className = 'edit-form-container';
        // Format date for input (YYYY-MM-DD)
        const dateValue = this.formatDateForInput(record.date);
        formContainer.innerHTML = `
      <h2 id="edit-expense-title" class="edit-form-title">${MESSAGES.EDIT_EXPENSE_TITLE}</h2>
      <form class="edit-expense-form" novalidate>
        <div class="form-errors" role="alert" aria-live="polite"></div>
        
        <div class="form-group">
          <label for="edit-expense-amount">${MESSAGES.AMOUNT}</label>
          <input type="number" id="edit-expense-amount" name="amount" 
            value="${record.amount}" min="0.01" step="0.01" required />
        </div>
        
        <div class="form-group">
          <label for="edit-expense-date">${MESSAGES.DATE}</label>
          <input type="date" id="edit-expense-date" name="date" value="${dateValue}" required />
        </div>
        
        <div class="form-group">
          <label for="edit-expense-category">${MESSAGES.CATEGORY}</label>
          <input type="text" id="edit-expense-category" name="category" 
            value="${record.category || ''}" />
        </div>
        
        <div class="form-group">
          <label for="edit-expense-description">${MESSAGES.DESCRIPTION}</label>
          <input type="text" id="edit-expense-description" name="description" 
            value="${record.description || ''}" />
        </div>
        
        <div class="form-buttons">
          <button type="submit" class="btn-save">${MESSAGES.SAVE}</button>
          <button type="button" class="btn-cancel">${MESSAGES.CANCEL}</button>
        </div>
      </form>
    `;
        overlay.appendChild(formContainer);
        document.body.appendChild(overlay);
        // Get form elements
        const form = formContainer.querySelector('.edit-expense-form');
        const cancelBtn = formContainer.querySelector('.btn-cancel');
        const errorsContainer = formContainer.querySelector('.form-errors');
        // Function to close the form
        const closeForm = () => {
            overlay.remove();
            document.removeEventListener('keydown', handleKeyDown);
        };
        // Handle form submission
        const handleSubmit = async (event) => {
            event.preventDefault();
            // Clear previous errors
            errorsContainer.innerHTML = '';
            // Get form values
            const formData = new FormData(form);
            const amount = parseFloat(formData.get('amount')) || 0;
            const dateInput = formData.get('date');
            const category = formData.get('category').trim() || null;
            const description = formData.get('description').trim() || null;
            // Parse date
            const date = new Date(dateInput);
            // Validate expense
            const validationResult = this.validationService.validateExpense({
                amount,
                date,
                category: category || undefined,
                description: description || undefined
            });
            if (!validationResult.isValid) {
                // Display Hebrew validation errors
                this.displayFormErrors(errorsContainer, validationResult.errors);
                return;
            }
            // Build updated expense record (preserve id and createdAt)
            const updatedExpense = {
                id: record.id,
                amount,
                date,
                category,
                description,
                createdAt: record.createdAt
            };
            try {
                // Update in storage
                await this.storageService.updateExpense(record.id, updatedExpense);
                // Close form
                closeForm();
                // Refresh the expense list if container is configured
                if (this.config.expenseListContainer) {
                    await this.renderExpenseList(this.config.expenseListContainer);
                }
            }
            catch (error) {
                // Display storage error
                const errorMessage = error instanceof Error ? error.message : 'שגיאה בשמירת הנתונים';
                this.displayFormErrors(errorsContainer, [errorMessage]);
            }
        };
        // Handle Escape key
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeForm();
            }
        };
        // Handle click outside form (on overlay)
        const handleOverlayClick = (event) => {
            if (event.target === overlay) {
                closeForm();
            }
        };
        // Attach event listeners
        form.addEventListener('submit', handleSubmit);
        cancelBtn.addEventListener('click', closeForm);
        overlay.addEventListener('click', handleOverlayClick);
        document.addEventListener('keydown', handleKeyDown);
        // Focus the first input for accessibility
        const firstInput = form.querySelector('input');
        if (firstInput) {
            firstInput.focus();
        }
    }
}
//# sourceMappingURL=EntryManager.js.map

// dist/presentation/DateSelectorManager.js
/**
 * DateSelectorManager - Manages month and day dropdown selectors for expense date entry.
 * Replaces the single date input with separate month/day dropdowns.
 * Emits month-change events to trigger expense list filtering.
 * Implements Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */
/**
 * DateSelectorManager manages two <select> elements: month dropdown and day dropdown.
 * It keeps the day dropdown in sync with the selected month and emits change events.
 */
class DateSelectorManager {
    monthSelect;
    daySelect;
    localizationService;
    year;
    monthChangeCallbacks = [];
    /**
     * @param monthSelectId - DOM id of the month <select> element
     * @param daySelectId - DOM id of the day <select> element
     * @param localizationService - Provides Hebrew month names
     * @param year - The year context for date selection (defaults to current year)
     */
    constructor(monthSelectId, daySelectId, localizationService, year) {
        const monthEl = document.getElementById(monthSelectId);
        const dayEl = document.getElementById(daySelectId);
        if (!monthEl || !(monthEl instanceof HTMLSelectElement)) {
            throw new Error(`Month select element not found: ${monthSelectId}`);
        }
        if (!dayEl || !(dayEl instanceof HTMLSelectElement)) {
            throw new Error(`Day select element not found: ${daySelectId}`);
        }
        this.monthSelect = monthEl;
        this.daySelect = dayEl;
        this.localizationService = localizationService;
        this.year = year ?? new Date().getFullYear();
    }
    /**
     * Initialize the dropdowns: populate months with Hebrew names,
     * populate days for the current month, and set defaults to today.
     */
    init() {
        this.populateMonths();
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // 1-indexed
        const currentDay = now.getDate();
        this.monthSelect.value = String(currentMonth);
        this.populateDays(currentMonth);
        this.daySelect.value = String(currentDay);
        this.monthSelect.addEventListener('change', () => {
            this.handleMonthChange();
        });
    }
    /**
     * Populate the month dropdown with Hebrew month names (1-12).
     */
    populateMonths() {
        this.monthSelect.innerHTML = '';
        for (let m = 1; m <= 12; m++) {
            const option = document.createElement('option');
            option.value = String(m);
            option.textContent = this.localizationService.getMonthName(m);
            this.monthSelect.appendChild(option);
        }
    }
    /**
     * Populate the day dropdown with valid days (1 to last day) for the given month.
     * @param month - 1-indexed month number
     */
    populateDays(month) {
        const daysInMonth = DateSelectorManager.getDaysInMonth(this.year, month);
        this.daySelect.innerHTML = '';
        for (let d = 1; d <= daysInMonth; d++) {
            const option = document.createElement('option');
            option.value = String(d);
            option.textContent = String(d);
            this.daySelect.appendChild(option);
        }
    }
    /**
     * Handle month change: update day dropdown and clamp selected day if needed,
     * then emit month-change events.
     */
    handleMonthChange() {
        const month = this.getSelectedMonth();
        const previousDay = this.getSelectedDay();
        const daysInMonth = DateSelectorManager.getDaysInMonth(this.year, month);
        this.populateDays(month);
        // Clamp: if previous day exceeds new month's days, select last valid day
        const clampedDay = Math.min(previousDay, daysInMonth);
        this.daySelect.value = String(clampedDay);
        // Emit month-change callbacks
        for (const cb of this.monthChangeCallbacks) {
            cb(month, this.year);
        }
    }
    /**
     * Register a callback to be invoked when the selected month changes.
     * @param callback - Receives (month: 1-12, year: number)
     */
    onMonthChange(callback) {
        this.monthChangeCallbacks.push(callback);
    }
    /**
     * Get the currently selected month (1-indexed).
     */
    getSelectedMonth() {
        return parseInt(this.monthSelect.value, 10);
    }
    /**
     * Get the currently selected day.
     */
    getSelectedDay() {
        return parseInt(this.daySelect.value, 10);
    }
    /**
     * Get a Date object representing the currently selected date.
     */
    getSelectedDate() {
        return new Date(this.year, this.getSelectedMonth() - 1, this.getSelectedDay());
    }
    /**
     * Get the number of days in a given month.
     * Uses the "day 0 of next month" trick: new Date(year, month, 0).getDate()
     * where month is 1-indexed.
     * @param year - Full year
     * @param month - 1-indexed month (1 = January, 12 = December)
     */
    static getDaysInMonth(year, month) {
        return new Date(year, month, 0).getDate();
    }
}
//# sourceMappingURL=DateSelectorManager.js.map

// dist/application/RecurringExpenseGenerator.js
/**
 * RecurringExpenseGenerator creates individual expense records for each month
 * in a recurring expense configuration range.
 * Implements Requirements 1.3, 1.4, 1.5, 1.6, 1.7, 1.9
 */

class RecurringExpenseGenerator {
    validationService;
    storageService;
    constructor(validationService, storageService) {
        this.validationService = validationService;
        this.storageService = storageService;
    }
    /**
     * Validate the recurring config (start <= end month, positive amount, valid day)
     * @param config - Recurring expense configuration to validate
     * @returns ValidationResult with Hebrew error messages
     */
    validateConfig(config) {
        return this.validationService.validateRecurringExpenseConfig(config);
    }
    /**
     * Generate individual expense records for each month in range (inclusive).
     * Each expense is saved independently. On individual save failure,
     * continues saving remaining records and collects failures.
     * @param config - Recurring expense configuration
     * @returns Object with saved expenses and failed months
     */
    async generate(config) {
        const saved = [];
        const failed = [];
        const startYear = config.startMonth.getFullYear();
        const startMonth = config.startMonth.getMonth();
        const endYear = config.endMonth.getFullYear();
        const endMonth = config.endMonth.getMonth();
        let year = startYear;
        let month = startMonth;
        while (year < endYear || (year === endYear && month <= endMonth)) {
            const day = RecurringExpenseGenerator.clampDay(year, month, config.dayOfMonth);
            const date = new Date(year, month, day);
            const expense = createExpense({
                amount: config.amount,
                date,
                category: config.category,
                description: config.description
            });
            try {
                await this.storageService.saveExpense(expense);
                saved.push(expense);
            }
            catch {
                const monthDate = new Date(year, month, 1);
                failed.push({
                    month: monthDate,
                    error: `שמירת ההוצאה לחודש ${month + 1}/${year} נכשלה`
                });
            }
            // Advance to next month
            month++;
            if (month > 11) {
                month = 0;
                year++;
            }
        }
        return { saved, failed };
    }
    /**
     * Clamp day to last valid day of a given month.
     * Returns min(day, lastDayOfMonth).
     * @param year - Full year (e.g. 2024)
     * @param month - Zero-based month (0 = January, 11 = December)
     * @param day - Desired day of month
     * @returns Clamped day value
     */
    static clampDay(year, month, day) {
        const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
        return Math.min(day, lastDayOfMonth);
    }
}
//# sourceMappingURL=RecurringExpenseGenerator.js.map

// dist/presentation/SavingsTabManager.js
/**
 * SavingsTabManager - Manages the savings tab UI for CRUD operations on savings entries
 * Implements Requirements 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10
 */

/**
 * Hebrew labels for savings types
 */
const TYPE_LABELS = {
    savings: 'חיסכון',
    investment: 'השקעה',
    pension: 'פנסיה'
};
/**
 * Hebrew messages for the savings tab
 */
const SAVINGS_MESSAGES = {
    EMPTY_ENTRIES: 'לא נמצאו רשומות חיסכון',
    EDIT: 'ערוך',
    DELETE: 'מחק',
    SAVE: 'שמור',
    CANCEL: 'ביטול',
    DELETE_CONFIRMATION: 'האם אתה בטוח שברצונך למחוק רשומה זו?',
    SUCCESS_ADD: '✓ הרשומה נוספה בהצלחה!',
    SUCCESS_UPDATE: '✓ הרשומה עודכנה בהצלחה!',
    DESCRIPTION: 'תיאור',
    AMOUNT: 'סכום',
    MONTH: 'חודש',
    TYPE: 'סוג',
    SUBTOTAL: 'סה"כ',
    NO_DESCRIPTION: 'ללא תיאור'
};
/**
 * Ordered list of savings types for consistent rendering
 */
const TYPE_ORDER = ['savings', 'investment', 'pension'];
/**
 * SavingsTabManager class for managing the savings tab UI
 */
class SavingsTabManager {
    storageService;
    validationService;
    localizationService;
    constructor(storageService, validationService, localizationService) {
        this.storageService = storageService;
        this.validationService = validationService;
        this.localizationService = localizationService;
    }
    /**
     * Initialize the savings tab: populate month selector and attach form handler
     */
    init() {
        this.populateMonthSelector();
        this.attachFormHandler();
        this.renderEntries();
    }
    /**
     * Populate the month selector with Hebrew month names
     */
    populateMonthSelector() {
        const monthSelect = document.getElementById('savingsMonth');
        if (!monthSelect)
            return;
        monthSelect.innerHTML = '';
        for (let m = 1; m <= 12; m++) {
            const option = document.createElement('option');
            option.value = String(m);
            option.textContent = this.localizationService.getMonthName(m);
            monthSelect.appendChild(option);
        }
        // Default to current month
        const currentMonth = new Date().getMonth() + 1;
        monthSelect.value = String(currentMonth);
    }
    /**
     * Attach form submit handler for adding new savings entries
     */
    attachFormHandler() {
        const form = document.getElementById('savings-form');
        if (!form)
            return;
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFormSubmit();
        });
    }
    /**
     * Handle savings form submission
     */
    async handleFormSubmit() {
        const resultDiv = document.getElementById('savings-result');
        // Read form values
        const typeSelect = document.getElementById('savingsType');
        const descriptionInput = document.getElementById('savingsDescription');
        const amountInput = document.getElementById('savingsAmount');
        const monthSelect = document.getElementById('savingsMonth');
        const type = typeSelect.value;
        const description = descriptionInput.value.trim();
        const amount = parseFloat(amountInput.value) || 0;
        const monthNum = parseInt(monthSelect.value, 10);
        const year = new Date().getFullYear();
        const month = new Date(year, monthNum - 1, 1);
        const input = { type, description, amount, month };
        // Validate
        const validation = this.validationService.validateSavingsEntry(input);
        if (!validation.isValid) {
            if (resultDiv) {
                resultDiv.innerHTML = validation.errors
                    .map(err => `<p class="form-error">${err}</p>`)
                    .join('');
                resultDiv.style.display = 'block';
            }
            return;
        }
        try {
            // Create and save entry
            const entry = createSavingsEntry(input);
            await this.storageService.saveSavingsEntry(entry);
            // Show success
            if (resultDiv) {
                resultDiv.innerHTML = `<div class="success-box">${SAVINGS_MESSAGES.SUCCESS_ADD}</div>`;
                resultDiv.style.display = 'block';
            }
            // Clear form fields
            descriptionInput.value = '';
            amountInput.value = '';
            // Refresh list
            await this.renderEntries();
        }
        catch (error) {
            if (resultDiv) {
                const msg = error instanceof Error ? error.message : 'שגיאה בשמירת הנתונים';
                resultDiv.innerHTML = `<div class="error-box">❌ ${msg}</div>`;
                resultDiv.style.display = 'block';
            }
        }
    }
    /**
     * Group savings entries by type
     * @param entries - Array of savings entries
     * @returns Map of type to entries array
     */
    static groupByType(entries) {
        const groups = new Map();
        for (const type of TYPE_ORDER) {
            groups.set(type, []);
        }
        for (const entry of entries) {
            const group = groups.get(entry.type);
            if (group) {
                group.push(entry);
            }
        }
        return groups;
    }
    /**
     * Calculate subtotal for a group of entries
     * @param entries - Array of savings entries
     * @returns Sum of amounts
     */
    static calculateSubtotal(entries) {
        return entries.reduce((sum, entry) => sum + entry.amount, 0);
    }
    /**
     * Render all savings entries grouped by type with subtotals
     */
    async renderEntries() {
        const container = document.getElementById('savings-entry-list');
        if (!container)
            return;
        try {
            const entries = await this.storageService.loadSavingsEntries();
            container.innerHTML = '';
            if (entries.length === 0) {
                const emptyState = document.createElement('div');
                emptyState.className = 'empty-state';
                emptyState.setAttribute('role', 'status');
                emptyState.innerHTML = `<p class="empty-state-message">${SAVINGS_MESSAGES.EMPTY_ENTRIES}</p>`;
                container.appendChild(emptyState);
                return;
            }
            const groups = SavingsTabManager.groupByType(entries);
            for (const type of TYPE_ORDER) {
                const groupEntries = groups.get(type);
                if (groupEntries.length === 0)
                    continue;
                const groupDiv = document.createElement('div');
                groupDiv.className = 'savings-group';
                groupDiv.setAttribute('data-type', type);
                // Group header
                const header = document.createElement('h4');
                header.className = 'savings-group-header';
                header.textContent = TYPE_LABELS[type];
                groupDiv.appendChild(header);
                // Entry list
                const listDiv = document.createElement('div');
                listDiv.className = 'entry-list';
                listDiv.setAttribute('role', 'list');
                listDiv.setAttribute('aria-label', `רשימת ${TYPE_LABELS[type]}`);
                for (const entry of groupEntries) {
                    const item = this.createEntryItem(entry);
                    listDiv.appendChild(item);
                }
                groupDiv.appendChild(listDiv);
                // Subtotal
                const subtotal = SavingsTabManager.calculateSubtotal(groupEntries);
                const subtotalDiv = document.createElement('div');
                subtotalDiv.className = 'savings-subtotal';
                subtotalDiv.textContent = `${SAVINGS_MESSAGES.SUBTOTAL}: ${this.formatCurrency(subtotal)}`;
                groupDiv.appendChild(subtotalDiv);
                container.appendChild(groupDiv);
            }
        }
        catch (error) {
            console.error('Error rendering savings entries:', error);
        }
    }
    /**
     * Create a single savings entry list item with edit/delete buttons
     */
    createEntryItem(entry) {
        const item = document.createElement('div');
        item.className = 'entry-item savings-entry';
        item.setAttribute('role', 'listitem');
        item.setAttribute('data-id', entry.id);
        const monthNum = entry.month instanceof Date
            ? entry.month.getMonth() + 1
            : new Date(entry.month).getMonth() + 1;
        const monthName = this.localizationService.getMonthName(monthNum);
        const amount = this.formatCurrency(entry.amount);
        const description = entry.description || SAVINGS_MESSAGES.NO_DESCRIPTION;
        item.innerHTML = `
      <div class="entry-details">
        <div class="entry-field">
          <span class="entry-label">${SAVINGS_MESSAGES.DESCRIPTION}:</span>
          <span class="entry-value">${description}</span>
        </div>
        <div class="entry-field">
          <span class="entry-label">${SAVINGS_MESSAGES.AMOUNT}:</span>
          <span class="entry-value entry-value-highlight">${amount}</span>
        </div>
        <div class="entry-field">
          <span class="entry-label">${SAVINGS_MESSAGES.MONTH}:</span>
          <span class="entry-value">${monthName}</span>
        </div>
      </div>
      <div class="entry-actions">
        <button type="button" class="btn-edit" aria-label="${SAVINGS_MESSAGES.EDIT} ${description}">${SAVINGS_MESSAGES.EDIT}</button>
        <button type="button" class="btn-delete" aria-label="${SAVINGS_MESSAGES.DELETE} ${description}">${SAVINGS_MESSAGES.DELETE}</button>
      </div>
    `;
        // Attach edit handler
        const editBtn = item.querySelector('.btn-edit');
        editBtn.addEventListener('click', () => {
            this.showEditForm(entry);
        });
        // Attach delete handler
        const deleteBtn = item.querySelector('.btn-delete');
        deleteBtn.addEventListener('click', () => {
            this.showDeleteConfirmation(entry.id);
        });
        return item;
    }
    /**
     * Show inline edit form pre-populated with existing values
     * Implements Requirement 3.6
     */
    showEditForm(entry) {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'edit-form-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'edit-savings-title');
        const formContainer = document.createElement('div');
        formContainer.className = 'edit-form-container';
        // Get current month value
        const entryMonth = entry.month instanceof Date ? entry.month : new Date(entry.month);
        const monthNum = entryMonth.getMonth() + 1;
        // Build month options
        let monthOptions = '';
        for (let m = 1; m <= 12; m++) {
            const name = this.localizationService.getMonthName(m);
            const selected = m === monthNum ? ' selected' : '';
            monthOptions += `<option value="${m}"${selected}>${name}</option>`;
        }
        // Build type options
        let typeOptions = '';
        for (const t of TYPE_ORDER) {
            const selected = t === entry.type ? ' selected' : '';
            typeOptions += `<option value="${t}"${selected}>${TYPE_LABELS[t]}</option>`;
        }
        formContainer.innerHTML = `
      <h2 id="edit-savings-title" class="edit-form-title">עריכת רשומת חיסכון</h2>
      <form class="edit-savings-form" novalidate>
        <div class="form-errors" role="alert" aria-live="polite"></div>
        
        <div class="form-group">
          <label for="edit-savings-type">${SAVINGS_MESSAGES.TYPE}</label>
          <select id="edit-savings-type" name="type" required>
            ${typeOptions}
          </select>
        </div>
        
        <div class="form-group">
          <label for="edit-savings-description">${SAVINGS_MESSAGES.DESCRIPTION}</label>
          <input type="text" id="edit-savings-description" name="description" 
            value="${entry.description}" maxlength="200" required />
        </div>
        
        <div class="form-group">
          <label for="edit-savings-amount">${SAVINGS_MESSAGES.AMOUNT}</label>
          <input type="number" id="edit-savings-amount" name="amount" 
            value="${entry.amount}" min="0.01" step="0.01" required />
        </div>
        
        <div class="form-group">
          <label for="edit-savings-month">${SAVINGS_MESSAGES.MONTH}</label>
          <select id="edit-savings-month" name="month" required>
            ${monthOptions}
          </select>
        </div>
        
        <div class="form-buttons">
          <button type="submit" class="btn-save">${SAVINGS_MESSAGES.SAVE}</button>
          <button type="button" class="btn-cancel">${SAVINGS_MESSAGES.CANCEL}</button>
        </div>
      </form>
    `;
        overlay.appendChild(formContainer);
        document.body.appendChild(overlay);
        // Get form elements
        const form = formContainer.querySelector('.edit-savings-form');
        const cancelBtn = formContainer.querySelector('.btn-cancel');
        const errorsContainer = formContainer.querySelector('.form-errors');
        const closeForm = () => {
            overlay.remove();
            document.removeEventListener('keydown', handleKeyDown);
        };
        const handleSubmit = async (event) => {
            event.preventDefault();
            errorsContainer.innerHTML = '';
            const formData = new FormData(form);
            const type = formData.get('type');
            const description = formData.get('description').trim();
            const amount = parseFloat(formData.get('amount')) || 0;
            const selectedMonth = parseInt(formData.get('month'), 10);
            const year = entryMonth.getFullYear();
            const month = new Date(year, selectedMonth - 1, 1);
            const input = { type, description, amount, month };
            // Validate
            const validation = this.validationService.validateSavingsEntry(input);
            if (!validation.isValid) {
                errorsContainer.innerHTML = validation.errors
                    .map(err => `<p class="form-error">${err}</p>`)
                    .join('');
                return;
            }
            // Build updated entry preserving id and createdAt
            const updatedEntry = {
                id: entry.id,
                type,
                description,
                amount,
                month,
                createdAt: entry.createdAt
            };
            try {
                await this.storageService.updateSavingsEntry(entry.id, updatedEntry);
                closeForm();
                // Show success message
                const resultDiv = document.getElementById('savings-result');
                if (resultDiv) {
                    resultDiv.innerHTML = `<div class="success-box">${SAVINGS_MESSAGES.SUCCESS_UPDATE}</div>`;
                    resultDiv.style.display = 'block';
                }
                await this.renderEntries();
            }
            catch (error) {
                const msg = error instanceof Error ? error.message : 'שגיאה בשמירת הנתונים';
                errorsContainer.innerHTML = `<p class="form-error">${msg}</p>`;
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeForm();
            }
        };
        const handleOverlayClick = (event) => {
            if (event.target === overlay) {
                closeForm();
            }
        };
        form.addEventListener('submit', handleSubmit);
        cancelBtn.addEventListener('click', closeForm);
        overlay.addEventListener('click', handleOverlayClick);
        document.addEventListener('keydown', handleKeyDown);
        // Focus first input for accessibility
        const firstInput = form.querySelector('input');
        if (firstInput) {
            firstInput.focus();
        }
    }
    /**
     * Show Hebrew confirmation dialog before deleting a savings entry
     * Implements Requirement 3.7
     */
    showDeleteConfirmation(id) {
        const overlay = document.createElement('div');
        overlay.className = 'confirmation-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'confirmation-title');
        const dialog = document.createElement('div');
        dialog.className = 'confirmation-dialog';
        dialog.innerHTML = `
      <p id="confirmation-title" class="confirmation-message">${SAVINGS_MESSAGES.DELETE_CONFIRMATION}</p>
      <div class="confirmation-buttons">
        <button type="button" class="btn-confirm-delete">${SAVINGS_MESSAGES.DELETE}</button>
        <button type="button" class="btn-cancel">${SAVINGS_MESSAGES.CANCEL}</button>
      </div>
    `;
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        const confirmBtn = dialog.querySelector('.btn-confirm-delete');
        const cancelBtn = dialog.querySelector('.btn-cancel');
        const closeDialog = () => {
            overlay.remove();
            document.removeEventListener('keydown', handleKeyDown);
        };
        const handleConfirm = async () => {
            try {
                await this.storageService.deleteSavingsEntry(id);
                closeDialog();
                await this.renderEntries();
            }
            catch (error) {
                console.error('Error deleting savings entry:', error);
                closeDialog();
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeDialog();
            }
        };
        const handleOverlayClick = (event) => {
            if (event.target === overlay) {
                closeDialog();
            }
        };
        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', closeDialog);
        overlay.addEventListener('click', handleOverlayClick);
        document.addEventListener('keydown', handleKeyDown);
        // Focus cancel button for safety
        cancelBtn.focus();
    }
    /**
     * Format a number as Israeli currency (₪) with thousands separator
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('he-IL', {
            style: 'currency',
            currency: 'ILS',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }
}
//# sourceMappingURL=SavingsTabManager.js.map

// dist/presentation/ProgressBarManager.js
/**
 * ProgressBarManager - Renders progress bars for savings goal visualization.
 * Reusable for both monthly and annual report views.
 * Implements Requirements 4.4, 4.5, 4.6, 4.7, 6.3, 6.4, 6.5, 6.6
 */
class ProgressBarManager {
    localizationService;
    constructor(localizationService) {
        this.localizationService = localizationService;
    }
    /**
     * Render a progress bar inside the specified container.
     * - Green (.positive) when percentage >= 100
     * - Red (.negative) when percentage <= 0 or deficit exists
     * - Blue (.partial) for in-between values
     * @param containerId - DOM element ID to render into
     * @param progress - Progress data with percentage, actual, goal, deficit
     */
    render(containerId, progress) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Progress bar container "${containerId}" not found`);
            return;
        }
        const { percentage, actual, goal, deficit } = progress;
        // Determine fill CSS class
        let fillClass;
        if (percentage >= 100) {
            fillClass = 'positive';
        }
        else if (percentage <= 0 || deficit !== null) {
            fillClass = 'negative';
        }
        else {
            fillClass = 'partial';
        }
        // Clamp visual width to 0-100%
        const visualWidth = Math.min(Math.max(percentage, 0), 100);
        const actualFormatted = this.localizationService.formatCurrency(actual);
        const goalFormatted = this.localizationService.formatCurrency(goal);
        const deficitFormatted = deficit !== null ? this.localizationService.formatCurrency(deficit) : '';
        container.innerHTML = `<div class="progress-bar-wrapper">
    <div class="progress-bar-info">
        <span class="progress-actual">${actualFormatted}</span>
        <span class="progress-separator"> / </span>
        <span class="progress-goal">${goalFormatted}</span>
        <span class="progress-percentage">(${percentage}%)</span>
    </div>
    <div class="progress-bar-track">
        <div class="progress-bar-fill ${fillClass}" style="width: ${visualWidth}%"></div>
    </div>
    <div class="progress-deficit" style="display: ${deficit !== null ? 'block' : 'none'}">
        חסרים: ${deficitFormatted}
    </div>
</div>`;
        container.style.display = 'block';
    }
    /**
     * Hide the progress bar container.
     * @param containerId - DOM element ID to hide
     */
    hide(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.style.display = 'none';
        }
    }
    /**
     * Show the progress bar container.
     * @param containerId - DOM element ID to show
     */
    show(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.style.display = 'block';
        }
    }
}
//# sourceMappingURL=ProgressBarManager.js.map

// dist/application/SavingsGoalManager.js
/**
 * SavingsGoalManager manages monthly and yearly savings targets
 * and calculates progress toward those goals.
 * Implements Requirements 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 6.1
 */
class SavingsGoalManager {
    storageService;
    constructor(storageService) {
        this.storageService = storageService;
    }
    /**
     * Save monthly savings goal to localStorage.
     * Validates that amount is positive before persisting.
     * @param amount - Monthly savings goal in ₪ (must be > 0)
     * @throws Error with Hebrew message if amount is not positive
     */
    async setMonthlySavingsGoal(amount) {
        if (amount <= 0) {
            throw new Error('יעד החיסכון חייב להיות מספר חיובי גדול מאפס');
        }
        await this.storageService.saveMonthlySavingsGoal(amount);
    }
    /**
     * Get the current monthly savings goal, or null if not set.
     * @returns The monthly savings goal amount, or null
     */
    async getMonthlySavingsGoal() {
        return this.storageService.loadMonthlySavingsGoal();
    }
    /**
     * Calculate yearly goal as 12 × monthly goal.
     * @param monthlyGoal - The monthly savings goal amount
     * @returns Yearly savings goal
     */
    getYearlySavingsGoal(monthlyGoal) {
        return monthlyGoal * 12;
    }
    /**
     * Calculate progress percentage (clamped 0-100) with deficit info.
     * - When actual is negative: percentage = 0, deficit = |actual|
     * - When actual >= goal: percentage = 100, deficit = null
     * - Otherwise: percentage = (actual / goal) * 100, deficit = goal - actual
     * Percentage is rounded to 2 decimal places.
     * @param actual - Actual savings amount
     * @param goal - Savings goal amount (must be > 0)
     * @returns Progress object with percentage, actual, goal, and deficit
     */
    calculateProgress(actual, goal) {
        let percentage;
        let deficit;
        if (actual < 0) {
            percentage = 0;
            deficit = Math.abs(actual);
        }
        else if (actual >= goal) {
            percentage = 100;
            deficit = null;
        }
        else {
            percentage = Math.round(((actual / goal) * 100) * 100) / 100;
            deficit = goal - actual;
        }
        return { percentage, actual, goal, deficit };
    }
}
//# sourceMappingURL=SavingsGoalManager.js.map

// dist/data-access/CompanyList.js
/**
 * CompanyList - Static data for publicly traded companies
 * commonly associated with Israeli tech employers.
 */
const STOCK_COMPANY_LIST = [
    { ticker: "CHKP", name: "Check Point Software", exchange: "NASDAQ", currency: "USD" },
    { ticker: "NICE", name: "NICE Systems", exchange: "NASDAQ", currency: "USD" },
    { ticker: "MNDY", name: "monday.com", exchange: "NASDAQ", currency: "USD" },
    { ticker: "TEVA", name: "Teva Pharmaceutical", exchange: "NYSE", currency: "USD" },
    { ticker: "WIX", name: "Wix.com", exchange: "NASDAQ", currency: "USD" },
    { ticker: "GLBE", name: "Global-e Online", exchange: "NASDAQ", currency: "USD" },
    { ticker: "CYBR", name: "CyberArk Software", exchange: "NASDAQ", currency: "USD" },
    { ticker: "INMD", name: "InMode", exchange: "NASDAQ", currency: "USD" },
    { ticker: "FVRR", name: "Fiverr International", exchange: "NYSE", currency: "USD" },
    { ticker: "RSKD", name: "Riskified", exchange: "NYSE", currency: "USD" },
    { ticker: "PAYC", name: "Paycom Software", exchange: "NYSE", currency: "USD" },
    { ticker: "CRNT", name: "Ceragon Networks", exchange: "NASDAQ", currency: "USD" },
    { ticker: "SEDG", name: "SolarEdge Technologies", exchange: "NASDAQ", currency: "USD" },
    { ticker: "NVDA", name: "NVIDIA", exchange: "NASDAQ", currency: "USD" },
    { ticker: "GOOG", name: "Alphabet (Google)", exchange: "NASDAQ", currency: "USD" },
    { ticker: "AAPL", name: "Apple", exchange: "NASDAQ", currency: "USD" },
    { ticker: "MSFT", name: "Microsoft", exchange: "NASDAQ", currency: "USD" },
    { ticker: "META", name: "Meta Platforms", exchange: "NASDAQ", currency: "USD" },
    { ticker: "AMZN", name: "Amazon", exchange: "NASDAQ", currency: "USD" },
    { ticker: "INTC", name: "Intel", exchange: "NASDAQ", currency: "USD" },
];
/**
 * Filter companies by name or ticker using case-insensitive substring match.
 * Returns empty array if query is less than 2 characters.
 */
function filterCompanies(query) {
    if (query.length < 2) {
        return [];
    }
    const lowerQuery = query.toLowerCase();
    return STOCK_COMPANY_LIST.filter((company) => company.name.toLowerCase().includes(lowerQuery) ||
        company.ticker.toLowerCase().includes(lowerQuery));
}
{ STOCK_COMPANY_LIST, filterCompanies };
//# sourceMappingURL=CompanyList.js.map

// dist/data-access/StockAPIClient.js
/**
 * StockAPIClient - Fetches stock prices and exchange rates
 * using the Yahoo Finance v8 API (free, no API key, browser-compatible).
 * Implements Requirements 2.1, 2.4, 2.5, 4.1
 */
/** Base URL for Yahoo Finance v8 API — prefixed to avoid bundle collisions */
const STOCK_API_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';
/** Timeout in milliseconds for all fetch calls */
const STOCK_API_TIMEOUT_MS = 10_000;
/** CORS proxy URL to route Yahoo Finance requests through */
const CORS_PROXY_URL = 'https://proxy.corsfix.com/';
class StockAPIClient {
    /**
     * Fetch current stock price for a ticker symbol.
     * @param ticker - Stock ticker symbol (e.g., "AAPL", "CHKP")
     * @returns StockPriceResult with price, currency, and market time
     * @throws Error if the fetch fails, times out, or returns invalid data
     */
    async fetchStockPrice(ticker) {
        const yahooUrl = `${STOCK_API_BASE_URL}/${encodeURIComponent(ticker)}`;
        const url = `${CORS_PROXY_URL}${yahooUrl}`;
        const response = await this.fetchWithTimeout(url);
        const data = await response.json();
        const result = data?.chart?.result?.[0];
        if (!result) {
            throw new Error(`Invalid API response for ticker: ${ticker}`);
        }
        const meta = result.meta;
        if (typeof meta?.regularMarketPrice !== 'number' ||
            typeof meta?.currency !== 'string' ||
            typeof meta?.regularMarketTime !== 'number') {
            throw new Error(`Invalid API response structure for ticker: ${ticker}`);
        }
        return {
            ticker,
            price: meta.regularMarketPrice,
            currency: meta.currency,
            marketTime: new Date(meta.regularMarketTime * 1000),
        };
    }
    /**
     * Fetch exchange rate between two currencies.
     * Uses the Yahoo Finance API with the currency pair ticker (e.g., "USDILS=X").
     * @param from - Source currency code (e.g., "USD")
     * @param to - Target currency code (e.g., "ILS")
     * @returns ExchangeRateResult with the conversion rate and timestamp
     * @throws Error if the fetch fails, times out, or returns invalid data
     */
    async fetchExchangeRate(from, to) {
        const pairTicker = `${from}${to}=X`;
        const yahooUrl = `${STOCK_API_BASE_URL}/${encodeURIComponent(pairTicker)}`;
        const url = `${CORS_PROXY_URL}${yahooUrl}`;
        const response = await this.fetchWithTimeout(url);
        const data = await response.json();
        const result = data?.chart?.result?.[0];
        if (!result) {
            throw new Error(`Invalid API response for exchange rate: ${from}/${to}`);
        }
        const meta = result.meta;
        if (typeof meta?.regularMarketPrice !== 'number' ||
            typeof meta?.regularMarketTime !== 'number') {
            throw new Error(`Invalid API response structure for exchange rate: ${from}/${to}`);
        }
        return {
            from,
            to,
            rate: meta.regularMarketPrice,
            timestamp: new Date(meta.regularMarketTime * 1000),
        };
    }
    /**
     * Perform a fetch request with a 10-second timeout.
     * @param url - The URL to fetch
     * @returns The fetch Response
     * @throws Error if the request times out or the response is not ok
     */
    async fetchWithTimeout(url) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), STOCK_API_TIMEOUT_MS);
        try {
            const response = await fetch(url, { signal: controller.signal });
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
            }
            return response;
        }
        catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                throw new Error('Request timed out after 10 seconds');
            }
            throw error;
        }
        finally {
            clearTimeout(timeoutId);
        }
    }
}
{ STOCK_API_BASE_URL, CORS_PROXY_URL };
//# sourceMappingURL=StockAPIClient.js.map

// dist/application/StockCalculatorService.js
/**
 * StockCalculatorService - Orchestrates stock value calculation.
 * Fetches stock prices and exchange rates via StockAPIClient,
 * computes total stock value in ILS, and validates share input.
 * Implements Requirements 3.1, 3.2, 3.3, 4.4
 */
class StockCalculatorService {
    apiClient;
    constructor(apiClient) {
        this.apiClient = apiClient;
    }
    /**
     * Calculate total stock value in ILS by fetching the current price
     * (and exchange rate if needed) and computing the result.
     * @param ticker - Stock ticker symbol
     * @param companyName - Display name of the company
     * @param shares - Number of shares held
     * @param currency - Currency of the stock price ("USD" | "ILS")
     * @returns StockCalculation with all details and the computed ILS value
     */
    async calculateStockValue(ticker, companyName, shares, currency) {
        const priceResult = await this.apiClient.fetchStockPrice(ticker);
        let exchangeRate = null;
        if (currency.toUpperCase() !== 'ILS') {
            const rateResult = await this.apiClient.fetchExchangeRate(currency, 'ILS');
            exchangeRate = rateResult.rate;
        }
        const totalValueILS = this.computeStockValue(priceResult.price, shares, exchangeRate, currency);
        return {
            ticker,
            companyName,
            stockPrice: priceResult.price,
            currency,
            shares,
            exchangeRate,
            totalValueILS,
            priceDate: priceResult.marketTime,
        };
    }
    /**
     * Pure computation of stock value in ILS from known inputs (no API call).
     * - ILS currency: price × shares
     * - USD (or other foreign) currency: price × shares × exchangeRate
     * Result is rounded to 2 decimal places.
     * @param price - Stock price per share
     * @param shares - Number of shares
     * @param exchangeRate - Exchange rate to ILS (null if currency is ILS)
     * @param currency - Currency code ("USD" | "ILS")
     * @returns Total value in ILS, rounded to 2 decimal places
     */
    computeStockValue(price, shares, exchangeRate, currency) {
        let value;
        if (currency.toUpperCase() === 'ILS') {
            value = price * shares;
        }
        else {
            value = price * shares * (exchangeRate ?? 1);
        }
        return Math.round(value * 100) / 100;
    }
    /**
     * Validate that a share count is a positive number.
     * @param value - The number to validate
     * @returns true if value is a positive number (> 0), false otherwise
     */
    validateShares(value) {
        return typeof value === 'number' && isFinite(value) && value > 0;
    }
}
//# sourceMappingURL=StockCalculatorService.js.map

// dist/presentation/StockValueCalculatorUI.js
/**
 * StockValueCalculatorUI - Presentation layer for the stock value calculator.
 * Manual-only mode: user enters stock value in ILS directly and saves as investment.
 * All UI text is in Hebrew with RTL layout.
 */

/** Hebrew UI messages */
const STOCK_CALC_MESSAGES = {
    sectionTitle: 'מחשבון שווי מניות',
    invalidManualPrice: 'הערך חייב להיות מספר חיובי',
    savedConfirmation: 'שווי המניות נשמר בהצלחה כהשקעה',
    manualValueLabel: 'שווי מניות (₪):',
    manualValuePlaceholder: 'הזן שווי מניות בשקלים',
    saveManualBtn: 'שמור השקעה',
};
class StockValueCalculatorUI {
    _calculatorService;
    _localizationService;
    storageService;
    container = null;
    manualValueInput = null;
    saveManualBtn = null;
    confirmationDisplay = null;
    errorDisplay = null;
    constructor(_calculatorService, _localizationService, storageService) {
        this._calculatorService = _calculatorService;
        this._localizationService = _localizationService;
        this.storageService = storageService;
    }
    init() {
        this.container = document.getElementById('stock-calculator-container');
        if (!this.container)
            return;
        this.renderUI();
        this.attachEventListeners();
    }
    renderUI() {
        if (!this.container)
            return;
        this.container.innerHTML = `
      <div class="stock-calculator" dir="rtl">
        <h3 class="stock-calculator-title">${STOCK_CALC_MESSAGES.sectionTitle}</h3>
        <div class="stock-manual-value-section">
          <div class="stock-form-group">
            <label>${STOCK_CALC_MESSAGES.manualValueLabel}</label>
            <input type="number"
                   class="stock-manual-value-input"
                   placeholder="${STOCK_CALC_MESSAGES.manualValuePlaceholder}"
                   step="0.01" min="0" />
          </div>
          <button type="button" class="stock-save-manual-btn">${STOCK_CALC_MESSAGES.saveManualBtn}</button>
        </div>
        <div class="stock-error" style="display: none;"></div>
        <div class="stock-confirmation" style="display: none;"></div>
      </div>
    `;
        this.manualValueInput = this.container.querySelector('.stock-manual-value-input');
        this.saveManualBtn = this.container.querySelector('.stock-save-manual-btn');
        this.errorDisplay = this.container.querySelector('.stock-error');
        this.confirmationDisplay = this.container.querySelector('.stock-confirmation');
    }
    attachEventListeners() {
        this.saveManualBtn?.addEventListener('click', () => this.saveManualValue());
    }
    saveManualValue() {
        const amount = parseFloat(this.manualValueInput?.value ?? '');
        if (!amount || amount <= 0) {
            this.showError(STOCK_CALC_MESSAGES.invalidManualPrice);
            return;
        }
        this.clearError();
        const input = {
            type: 'investment',
            description: 'Stock Investment (manual entry)',
            amount,
            month: new Date()
        };
        const entry = createSavingsEntry(input);
        this.storageService.saveSavingsEntry(entry).then(() => {
            this.showConfirmation();
            if (this.manualValueInput)
                this.manualValueInput.value = '';
        });
    }
    showError(message) {
        if (!this.errorDisplay)
            return;
        this.errorDisplay.textContent = message;
        this.errorDisplay.style.display = 'block';
    }
    clearError() {
        if (!this.errorDisplay)
            return;
        this.errorDisplay.textContent = '';
        this.errorDisplay.style.display = 'none';
    }
    showConfirmation() {
        if (!this.confirmationDisplay)
            return;
        this.confirmationDisplay.textContent = STOCK_CALC_MESSAGES.savedConfirmation;
        this.confirmationDisplay.style.display = 'block';
        setTimeout(() => {
            if (this.confirmationDisplay)
                this.confirmationDisplay.style.display = 'none';
        }, 3000);
    }
}
{ StockValueCalculatorUI, STOCK_CALC_MESSAGES };
//# sourceMappingURL=StockValueCalculatorUI.js.map


// Expose classes to window object
window.LocalizationService = HebrewLocalizationService;
window.ValidationService = DefaultValidationService;
window.CSVParserImpl = CSVParserImpl;
window.LocalStorageService = LocalStorageService;
window.TaxCalculator = TaxCalculator;
window.ExpenseManager = ExpenseManager;
window.BudgetController = BudgetController;
window.FormPersistenceService = FormPersistenceService;
window.ChartDataPrepService = ChartDataPrepService;
window.ChartManager = ChartManager;
window.EntryManager = EntryManager;
window.DateSelectorManager = DateSelectorManager;
window.RecurringExpenseGenerator = RecurringExpenseGenerator;
window.SavingsTabManager = SavingsTabManager;
window.ProgressBarManager = ProgressBarManager;
window.SavingsGoalManager = SavingsGoalManager;
window.StockAPIClient = StockAPIClient;
window.StockCalculatorService = StockCalculatorService;
window.StockValueCalculatorUI = StockValueCalculatorUI;
window.createExpense = createExpense;
window.createSavingsEntry = createSavingsEntry;
window.createSalaryRecord = createSalaryRecord;
window.createMonthlyReport = createMonthlyReport;
window.createAnnualReport = createAnnualReport;
