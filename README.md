# 📊 Israeli Budget Tracker - מעקב תקציב ישראלי

Personal monthly budget tracking application for Israeli residents with automatic tax calculations based on 2026 Israeli tax regulations.

## ✨ Features

- 💰 **Salary Management**: Enter monthly salary with all components (base, bonus, stocks, meal vouchers, etc.)
- 🧮 **Automatic Tax Calculation**: Calculates income tax, National Insurance, Health Insurance, pension, and study fund contributions
- 🛒 **Expense Tracking**: Add individual expenses with categories and descriptions
- 📤 **CSV Import**: Bulk upload expenses from CSV files
- 📅 **Monthly Reports**: View detailed monthly financial summaries
- 📈 **Annual Reports**: 12-month overview with pension and study fund accumulation
- 🇮🇱 **Hebrew Interface**: Full RTL support with Hebrew UI
- 💾 **Local Storage**: All data saved in your browser (no server needed)

## 🚀 Quick Start

### Option 1: Open the App Directly

1. Open `public/index.html` in your web browser
2. Start tracking your finances!

### Option 2: Build from Source

```bash
# Install dependencies
npm install

# Build the app
npm run build

# Open public/index.html in your browser
```

## 📖 How to Use

### 1. Enter Your Salary

- Go to the "משכורת" (Salary) tab
- Select the month
- Enter your salary components
- Click "חשב ושמור" (Calculate and Save)
- View your tax breakdown and net income

### 2. Add Expenses

- Go to the "הוצאה" (Expense) tab
- Enter amount, date, category, and description
- Click "הוסף הוצאה" (Add Expense)

### 3. Upload CSV

- Go to the "העלאת CSV" (Upload CSV) tab
- Prepare a CSV file with this format:
  ```
  amount,date,category,description
  150.50,2026-01-15,מזון,קניות שבועיות
  45.00,2026-01-16,תחבורה,כרטיסייה חודשית
  ```
- Upload the file

### 4. View Reports

- **Monthly Report**: Select a month to see income, expenses, and savings
- **Annual Report**: View 12-month summary with pension/study fund accumulation

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📋 2026 Israeli Tax Regulations

The app implements the following tax calculations:

### Income Tax Brackets (2026)
- Up to ₪7,010/month: 10%
- ₪7,011-₪10,080/month: 14%
- ₪10,081-₪16,150/month: 20%
- ₪16,151-₪22,440/month: 31%
- ₪22,441-₪46,690/month: 35%
- Above ₪46,690/month: 47%

### Other Deductions
- **National Insurance**: ~7% (capped at ₪47,000/month)
- **Health Insurance**: ~5% (capped at ₪47,000/month)
- **Pension**: 6% employee + 6.5% employer
- **Study Fund**: 2.5% employee + 7.5% employer

## 🏗️ Architecture

The app follows a layered architecture:

- **Presentation Layer**: HTML/CSS/JS interface
- **Application Layer**: BudgetController, TaxCalculator, ExpenseManager
- **Domain Layer**: Core business models and logic
- **Data Access Layer**: Storage, validation, localization, CSV parsing

## 🔒 Privacy

All data is stored locally in your browser using localStorage. No data is sent to any server.

## 📝 License

MIT License - feel free to use and modify as needed.

## 🤝 Contributing

This project was built with property-based testing to ensure correctness. All 122 tests pass, covering:
- Tax calculations
- Data validation
- CSV parsing
- Storage persistence
- Hebrew localization

---

Made with ❤️ for Israeli residents
