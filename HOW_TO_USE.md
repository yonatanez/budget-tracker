# 🎯 How to Use the Israeli Budget Tracker

## Opening the App

**Simply open `public/index.html` in your web browser!**

No installation or server needed - it's a standalone web app that runs entirely in your browser.

## First Time Setup

The app starts empty. Here's what to do:

### Step 1: Enter Your First Salary

1. The app opens on the "💰 משכורת" (Salary) tab
2. Select the current month
3. Enter your base salary (required)
4. Optionally add: bonus, stocks, meal vouchers, other compensation
5. Click "חשב ושמור" (Calculate and Save)
6. You'll see your tax breakdown and net income!

### Step 2: Add Some Expenses

1. Click the "🛒 הוצאה" (Expense) tab
2. Enter an amount (e.g., 150.50)
3. Select today's date (pre-filled)
4. Choose a category (optional)
5. Add a description (optional)
6. Click "הוסף הוצאה" (Add Expense)

### Step 3: View Your Monthly Report

1. Click the "📅 דוח חודשי" (Monthly Report) tab
2. Select the month you entered salary for
3. Click "הצג דוח" (Show Report)
4. See your income, expenses, and savings!

## Features Explained

### 💰 Salary Tab
- Calculates all Israeli tax deductions automatically
- Shows breakdown of:
  - Income tax (progressive brackets)
  - National Insurance (Bituach Leumi)
  - Health Insurance (Bituach Briut)
  - Pension contributions (employee + employer)
  - Study fund contributions (employee + employer)
- Displays your net income

### 🛒 Expense Tab
- Add individual expenses quickly
- Categories help organize spending
- Validates amounts and dates
- Warns about duplicates

### 📤 CSV Upload Tab
- Upload multiple expenses at once
- CSV format:
  ```
  amount,date,category,description
  150.50,2026-01-15,מזון,Weekly groceries
  45.00,2026-01-16,תחבורה,Bus pass
  ```
- Shows success count and any errors

### 📅 Monthly Report Tab
- View any month's financial summary
- See total income, expenses, and savings
- Expenses grouped by category
- Full list of all expenses for the month

### 📈 Annual Report Tab
- 12-month financial overview
- Total income, expenses, and savings
- Pension accumulation (employee + employer)
- Study fund accumulation (employee + employer)
- Category breakdown for the year
- Month-by-month comparison table

## Tips

1. **Enter salary first** - You need salary data to see meaningful reports
2. **Use categories** - Makes it easier to see where your money goes
3. **Regular updates** - Add expenses as they happen for accurate tracking
4. **CSV for bulk** - If you have bank statements, convert to CSV and upload
5. **Check annual report** - Great for seeing long-term savings trends

## Data Storage

- All data is saved in your browser's localStorage
- Data persists between sessions
- No account or login needed
- Data never leaves your computer
- To backup: Export your localStorage data (browser dev tools)
- To reset: Clear browser data for this site

## Troubleshooting

**"אין נתוני משכורת לחודש זה" (No salary data for this month)**
- You need to enter salary for that month first
- Go to the Salary tab and add it

**Expense won't save**
- Check that amount is positive
- Check that date isn't more than 1 day in the future
- Make sure you're not adding a duplicate

**CSV upload fails**
- Check file format matches the example
- Dates must be YYYY-MM-DD format
- Amounts must be positive numbers
- No commas in category/description fields

## Example Workflow

1. **Start of month**: Enter your salary
2. **Throughout month**: Add expenses as they occur
3. **End of month**: View monthly report to see savings
4. **Every few months**: Check annual report for trends

Enjoy tracking your finances! 🎉
