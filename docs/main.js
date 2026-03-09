// Main application logic for Israeli Budget Tracker

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Initialize services
        const localizationService = new window.LocalizationService();
        const validationService = new window.ValidationService(localizationService);
        const csvParser = new window.CSVParserImpl();
        const storageService = new window.LocalStorageService();
        const taxCalculator = new window.TaxCalculator();
        const expenseManager = new window.ExpenseManager(validationService, csvParser, storageService);
        const budgetController = new window.BudgetController(taxCalculator, expenseManager, validationService, storageService);
        const formPersistenceService = new window.FormPersistenceService();
        const chartDataPrepService = new window.ChartDataPrepService();
        const chartManager = new window.ChartManager();
        
        // Get entry list containers
        const salaryEntryListContainer = document.getElementById('salary-entry-list');
        const expenseEntryListContainer = document.getElementById('expense-entry-list');
        
        // Initialize EntryManager with config for callbacks
        const entryManager = new window.EntryManager(
            storageService,
            {
                salaryListContainer: salaryEntryListContainer,
                expenseListContainer: expenseEntryListContainer,
                onEditSalary: (salary) => entryManager.showEditSalaryForm(salary),
                onEditExpense: (expense) => entryManager.showEditExpenseForm(expense),
                onDeleteSalary: (id) => {
                    entryManager.showDeleteConfirmation('salary', id, async () => {
                        await storageService.deleteSalary(id);
                        entryManager.removeSalaryItem(id);
                    });
                },
                onDeleteExpense: (id) => {
                    entryManager.showDeleteConfirmation('expense', id, async () => {
                        await storageService.deleteExpense(id);
                        entryManager.removeExpenseItem(id);
                    });
                }
            },
            validationService,
            taxCalculator
        );

        // Initialize SavingsGoalManager and ProgressBarManager
        const savingsGoalManager = new window.SavingsGoalManager(storageService);
        const progressBarManager = new window.ProgressBarManager(localizationService);

        // Initialize SavingsTabManager
        const savingsTabManager = new window.SavingsTabManager(
            storageService,
            validationService,
            localizationService
        );
        savingsTabManager.init();

        // Load saved monthly savings goal and display in input
        try {
            const savedGoal = await savingsGoalManager.getMonthlySavingsGoal();
            if (savedGoal !== null) {
                document.getElementById('monthlySavingsGoal').value = savedGoal;
            }
        } catch (err) {
            console.error('Error loading savings goal:', err);
        }

        // Wire save savings goal button
        document.getElementById('saveSavingsGoal').addEventListener('click', async () => {
            const goalInput = document.getElementById('monthlySavingsGoal');
            const goalValue = parseFloat(goalInput.value);
            if (isNaN(goalValue) || goalValue <= 0) {
                showError('יעד החיסכון חייב להיות מספר חיובי גדול מאפס');
                return;
            }
            try {
                await savingsGoalManager.setMonthlySavingsGoal(goalValue);
                const btn = document.getElementById('saveSavingsGoal');
                const originalText = btn.textContent;
                btn.textContent = '✓ היעד נשמר!';
                btn.disabled = true;
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }, 2000);
            } catch (err) {
                showError(err.message);
            }
        });

        console.log('✓ Services initialized successfully');

        // Initialize Stock Value Calculator
        const stockAPIClient = new window.StockAPIClient();
        const stockCalculatorService = new window.StockCalculatorService(stockAPIClient);
        const stockCalculatorUI = new window.StockValueCalculatorUI(stockCalculatorService, localizationService, storageService);
        stockCalculatorUI.init();

        // Load and populate form state from LocalStorage
        const savedFormState = formPersistenceService.loadFormState();
        if (savedFormState) {
            if (savedFormState.amount) {
                document.getElementById('expenseAmount').value = savedFormState.amount;
            }
            if (savedFormState.category) {
                document.getElementById('expenseCategory').value = savedFormState.category;
            }
            if (savedFormState.description) {
                document.getElementById('expenseDescription').value = savedFormState.description;
            }
            console.log('✓ Form state restored from LocalStorage');
        }

        // Load tax credit points from LocalStorage
        const savedTaxCreditPoints = localStorage.getItem('taxCreditPoints');
        if (savedTaxCreditPoints) {
            document.getElementById('taxCreditPoints').value = savedTaxCreditPoints;
            console.log('✓ Tax credit points restored from LocalStorage');
        }

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                console.log('Tab clicked:', btn.dataset.tab);
                
                // Remove active class from all tabs
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab
                btn.classList.add('active');
                const tabId = btn.dataset.tab + '-tab';
                const tabContent = document.getElementById(tabId);
                
                if (tabContent) {
                    tabContent.classList.add('active');
                } else {
                    console.error('Tab content not found:', tabId);
                }
                
                // Hide error message
                const errorMsg = document.getElementById('error-message');
                if (errorMsg) {
                    errorMsg.style.display = 'none';
                }
                
                // Render entry lists when navigating to salary or expense tabs
                if (btn.dataset.tab === 'salary' && salaryEntryListContainer) {
                    await entryManager.renderSalaryList(salaryEntryListContainer);
                } else if (btn.dataset.tab === 'expense' && expenseEntryListContainer) {
                    // Render filtered by currently selected month
                    const selMonth = parseInt(document.getElementById('expenseMonth').value, 10) || (new Date().getMonth() + 1);
                    const selYear = new Date().getFullYear();
                    await entryManager.renderFilteredExpenseList(expenseEntryListContainer, selMonth, selYear);
                } else if (btn.dataset.tab === 'savings') {
                    await savingsTabManager.renderEntries();
                } else if (btn.dataset.tab === 'monthly') {
                    // Auto-select best month: current month if salary exists, otherwise previous month
                    try {
                        const data = await storageService.loadAllData();
                        const now = new Date();
                        const currentMonthDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                        
                        const hasCurrentMonth = data.salaries.some(s => 
                            s.month.getFullYear() === currentMonthDate.getFullYear() && 
                            s.month.getMonth() === currentMonthDate.getMonth()
                        );
                        const hasPrevMonth = data.salaries.some(s => 
                            s.month.getFullYear() === prevMonthDate.getFullYear() && 
                            s.month.getMonth() === prevMonthDate.getMonth()
                        );
                        
                        let targetDate = currentMonthDate;
                        if (!hasCurrentMonth && hasPrevMonth) {
                            targetDate = prevMonthDate;
                        }
                        
                        const monthStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
                        document.getElementById('reportMonth').value = monthStr;
                    } catch (err) {
                        console.error('Error setting default report month:', err);
                    }
                }
            });
        });

        console.log('✓ Tab switching initialized');

        // Set default month to current month
        const now = new Date();
const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
document.getElementById('month').value = currentMonth;

// Set reportMonth to current month initially (will be updated when tab opens)
document.getElementById('reportMonth').value = currentMonth;

// Set default expense date to today - now using DateSelectorManager
// Initialize date selector for expense form
const dateSelectorManager = new window.DateSelectorManager('expenseMonth', 'expenseDay', localizationService);
dateSelectorManager.init();

// Initialize recurring expense generator
const recurringExpenseGenerator = new window.RecurringExpenseGenerator(validationService, storageService);

// Populate recurring start/end month selectors with Hebrew month names
const recurringStartMonth = document.getElementById('recurringStartMonth');
const recurringEndMonth = document.getElementById('recurringEndMonth');
for (let m = 1; m <= 12; m++) {
    const name = localizationService.getMonthName(m);
    const opt1 = document.createElement('option');
    opt1.value = String(m);
    opt1.textContent = name;
    recurringStartMonth.appendChild(opt1);
    const opt2 = document.createElement('option');
    opt2.value = String(m);
    opt2.textContent = name;
    recurringEndMonth.appendChild(opt2);
}
// Default recurring months to current month
const currentMonthNum = now.getMonth() + 1;
recurringStartMonth.value = String(currentMonthNum);
recurringEndMonth.value = String(currentMonthNum);

// Recurring toggle show/hide logic
document.getElementById('recurringToggle').addEventListener('change', (e) => {
    document.getElementById('recurring-fields').style.display = e.target.checked ? 'block' : 'none';
});

// Wire month change to filter expense list
dateSelectorManager.onMonthChange(async (month, year) => {
    if (expenseEntryListContainer) {
        await entryManager.renderFilteredExpenseList(expenseEntryListContainer, month, year);
    }
});

// Duplicate last month salary button
document.getElementById('duplicateLastMonth').addEventListener('click', async () => {
    try {
        const data = await storageService.loadAllData();
        if (data.salaries.length === 0) {
            showError('אין רשומות משכורת קודמות לשכפול');
            return;
        }
        
        // Get the most recent salary (already sorted by month descending)
        const lastSalary = data.salaries[0];
        const comp = lastSalary.salaryComponents;
        
        // Fill in the detailed form fields
        document.getElementById('baseSalary').value = comp.baseSalary || '';
        document.getElementById('bonus').value = comp.bonus || '';
        document.getElementById('mealVouchers').value = comp.mealVouchers || '';
        document.getElementById('otherCompensation').value = comp.otherCompensation || '';
        
        // Set month to current month (not the duplicated month)
        document.getElementById('month').value = currentMonth;
        
        // Make sure we're in detailed mode
        document.getElementById('simplifiedMode').checked = false;
        document.getElementById('detailed-inputs').style.display = 'block';
        document.getElementById('simplified-inputs').style.display = 'none';
        
        // Show success feedback
        const btn = document.getElementById('duplicateLastMonth');
        const originalText = btn.textContent;
        btn.textContent = '✓ הנתונים הועתקו!';
        btn.disabled = true;
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
        }, 2000);
    } catch (error) {
        showError('שגיאה בשכפול המשכורת: ' + error.message);
    }
});

// Simplified mode toggle
document.getElementById('simplifiedMode').addEventListener('change', (e) => {
    const isSimplified = e.target.checked;
    document.getElementById('detailed-inputs').style.display = isSimplified ? 'none' : 'block';
    document.getElementById('simplified-inputs').style.display = isSimplified ? 'block' : 'none';
    
    // Toggle required attributes so hidden fields don't block form submission
    document.querySelectorAll('#detailed-inputs [required]').forEach(el => {
        if (isSimplified) { el.removeAttribute('required'); el.dataset.wasRequired = 'true'; }
        else { el.setAttribute('required', ''); }
    });
    document.querySelectorAll('#simplified-inputs [required]').forEach(el => {
        if (!isSimplified) { el.removeAttribute('required'); el.dataset.wasRequired = 'true'; }
        else { el.setAttribute('required', ''); }
    });
    
    // Set month values
    if (isSimplified) {
        document.getElementById('simpleMonth').value = currentMonth;
    }
});

// On initial load, remove required from simplified inputs (they start hidden)
document.querySelectorAll('#simplified-inputs [required]').forEach(el => {
    el.removeAttribute('required');
    el.dataset.wasRequired = 'true';
});

// Salary form submission
document.getElementById('salary-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const isSimplified = document.getElementById('simplifiedMode').checked;
        
        if (isSimplified) {
            // Simplified mode - just store the values directly
            const monthValue = document.getElementById('simpleMonth').value;
            const [year, month] = monthValue.split('-').map(Number);
            const monthDate = new Date(year, month - 1, 1);
            
            const grossSalary = parseFloat(document.getElementById('simpleGrossSalary').value) || 0;
            const totalTax = parseFloat(document.getElementById('simpleTotalTax').value) || 0;
            const pension = parseFloat(document.getElementById('simplePension').value) || 0;
            const studyFund = parseFloat(document.getElementById('simpleStudyFund').value) || 0;
            const netIncome = parseFloat(document.getElementById('simpleNetIncome').value) || 0;
            
            // Create a simplified salary record
            const components = {
                baseSalary: grossSalary // Store gross as base for simplified mode
            };
            
            // Create a manual tax calculation result
            const taxCalculation = {
                salaryComponents: components,
                grossSalary: grossSalary,
                taxableIncome: grossSalary,
                cashIncome: grossSalary,
                incomeTax: totalTax, // Store total tax as income tax
                nationalInsurance: 0,
                healthInsurance: 0,
                pensionEmployeeContribution: pension / 2, // Assume 50/50 split
                pensionEmployerContribution: pension / 2,
                studyFundEmployeeContribution: studyFund / 2,
                studyFundEmployerContribution: studyFund / 2,
                netIncome: netIncome,
                taxCreditDeduction: 0
            };
            
            const salaryRecord = window.createSalaryRecord(components, monthDate, taxCalculation);
            await storageService.saveSalary(salaryRecord);
            
            let html = '<div class="success-box">✓ המשכורת נשמרה בהצלחה!</div>';
            html += '<div class="monthly-summary">';
            html += `<div class="summary-card"><div class="summary-label">משכורת ברוטו</div><div class="summary-value">${localizationService.formatCurrency(grossSalary)}</div></div>`;
            html += `<div class="summary-card"><div class="summary-label">ניכויי מס</div><div class="summary-value">${localizationService.formatCurrency(totalTax)}</div></div>`;
            html += `<div class="summary-card"><div class="summary-label">הכנסה נטו</div><div class="summary-value">${localizationService.formatCurrency(netIncome)}</div></div>`;
            html += '</div>';
            
            html += '<table>';
            html += '<tr><th>פריט</th><th>סכום</th></tr>';
            html += `<tr><td>סך ניכויי מס</td><td>${localizationService.formatCurrency(totalTax)}</td></tr>`;
            html += `<tr><td>פנסיה (סה"כ)</td><td>${localizationService.formatCurrency(pension)}</td></tr>`;
            html += `<tr><td>קרן השתלמות (סה"כ)</td><td>${localizationService.formatCurrency(studyFund)}</td></tr>`;
            html += '</table>';
            
            document.getElementById('salary-details').innerHTML = html;
            document.getElementById('salary-result').style.display = 'block';
            
            // Refresh salary entry list after save
            if (salaryEntryListContainer) {
                await entryManager.renderSalaryList(salaryEntryListContainer);
            }
        } else {
            // Detailed mode - calculate everything
            // Validate tax credit points
            const taxCreditPointsInput = document.getElementById('taxCreditPoints');
            const taxCreditPoints = parseFloat(taxCreditPointsInput.value);
            const taxCreditError = document.getElementById('taxCreditError');
            
            if (isNaN(taxCreditPoints) || taxCreditPoints < 0 || taxCreditPoints > 10) {
                taxCreditError.textContent = 'נקודות זיכוי חייבות להיות בין 0 ל-10';
                taxCreditError.style.display = 'block';
                return;
            }
                
        // Check decimal places (max 2)
        const decimalPlaces = (taxCreditPoints.toString().split('.')[1] || '').length;
        if (decimalPlaces > 2) {
            taxCreditError.textContent = 'נקודות זיכוי יכולות להכיל עד 2 ספרות אחרי הנקודה';
            taxCreditError.style.display = 'block';
            return;
        }
        
        taxCreditError.style.display = 'none';
        
        // Save tax credit points to LocalStorage
        localStorage.setItem('taxCreditPoints', taxCreditPoints.toString());
        
        const monthValue = document.getElementById('month').value;
        const [year, month] = monthValue.split('-').map(Number);
        const monthDate = new Date(year, month - 1, 1);
        
        const components = {
            baseSalary: parseFloat(document.getElementById('baseSalary').value),
            bonus: document.getElementById('bonus').value ? parseFloat(document.getElementById('bonus').value) : undefined,
            mealVouchers: document.getElementById('mealVouchers').value ? parseFloat(document.getElementById('mealVouchers').value) : undefined,
            otherCompensation: document.getElementById('otherCompensation').value ? parseFloat(document.getElementById('otherCompensation').value) : undefined
        };
        
        const result = await budgetController.enterSalary(components, monthDate, taxCreditPoints);
        
        if (result.success) {
            const salary = result.value;
            const tax = salary.taxCalculation;
            
            let html = '<div class="success-box">✓ המשכורת נשמרה בהצלחה!</div>';
            html += '<div class="monthly-summary">';
            html += `<div class="summary-card"><div class="summary-label">הכנסה חייבת במס</div><div class="summary-value">${localizationService.formatCurrency(tax.taxableIncome)}</div></div>`;
            html += `<div class="summary-card"><div class="summary-label">הכנסה במזומן</div><div class="summary-value">${localizationService.formatCurrency(tax.cashIncome)}</div></div>`;
            html += `<div class="summary-card"><div class="summary-label">הכנסה נטו</div><div class="summary-value">${localizationService.formatCurrency(tax.netIncome)}</div></div>`;
            html += '</div>';
            
            html += '<table>';
            html += '<tr><th>ניכוי</th><th>סכום</th></tr>';
            if (tax.taxableIncome !== tax.cashIncome) {
                const mealVouchers = tax.taxableIncome - tax.cashIncome;
                html += `<tr><td>תלושי אוכל (לא מועברים לחשבון)</td><td style="color: #ff9800;">${localizationService.formatCurrency(mealVouchers)}</td></tr>`;
            }
            html += `<tr><td>מס הכנסה</td><td>${localizationService.formatCurrency(tax.incomeTax)}</td></tr>`;
            if (tax.taxCreditDeduction) {
                html += `<tr><td>זיכוי ממס (נקודות זיכוי)</td><td style="color: #388e3c;">-${localizationService.formatCurrency(tax.taxCreditDeduction)}</td></tr>`;
            }
            html += `<tr><td>ביטוח לאומי</td><td>${localizationService.formatCurrency(tax.nationalInsurance)}</td></tr>`;
            html += `<tr><td>ביטוח בריאות</td><td>${localizationService.formatCurrency(tax.healthInsurance)}</td></tr>`;
            html += `<tr><td>קרן פנסיה (עובד)</td><td>${localizationService.formatCurrency(tax.pensionEmployeeContribution)}</td></tr>`;
            html += `<tr><td>קרן פנסיה (מעביד)</td><td>${localizationService.formatCurrency(tax.pensionEmployerContribution)}</td></tr>`;
            html += `<tr><td>קרן השתלמות (עובד)</td><td>${localizationService.formatCurrency(tax.studyFundEmployeeContribution)}</td></tr>`;
            html += `<tr><td>קרן השתלמות (מעביד)</td><td>${localizationService.formatCurrency(tax.studyFundEmployerContribution)}</td></tr>`;
            html += '</table>';
            
            document.getElementById('salary-details').innerHTML = html;
            document.getElementById('salary-result').style.display = 'block';
            document.getElementById('salary-result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            // Refresh salary entry list after save
            if (salaryEntryListContainer) {
                await entryManager.renderSalaryList(salaryEntryListContainer);
            }
        } else {
            showError(result.error.message);
        }
        }
    } catch (error) {
        console.error('Salary submission error:', error);
        showError('שגיאה בשמירת המשכורת: ' + error.message);
    }
});

// Expense form submission
document.getElementById('expense-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const category = document.getElementById('expenseCategory').value || undefined;
        const description = document.getElementById('expenseDescription').value || undefined;
        const isRecurring = document.getElementById('recurringToggle').checked;

        // Read month/day from dropdowns
        const selectedMonth = parseInt(document.getElementById('expenseMonth').value, 10);
        const selectedDay = parseInt(document.getElementById('expenseDay').value, 10);
        const year = now.getFullYear();

        if (isRecurring) {
            // Recurring expense flow
            const startMonthVal = parseInt(document.getElementById('recurringStartMonth').value, 10);
            const endMonthVal = parseInt(document.getElementById('recurringEndMonth').value, 10);

            const config = {
                amount: amount,
                category: category,
                description: description,
                dayOfMonth: selectedDay,
                startMonth: new Date(year, startMonthVal - 1, 1),
                endMonth: new Date(year, endMonthVal - 1, 1)
            };

            // Validate recurring config
            const validation = validationService.validateRecurringExpenseConfig(config);
            if (!validation.isValid) {
                showError(validation.errors.join(', '));
                return;
            }

            // Generate recurring expenses
            const result = await recurringExpenseGenerator.generate(config);

            // Display results
            let html = '';
            if (result.saved.length > 0) {
                html += `<div class="success-box">✓ נוספו ${result.saved.length} הוצאות חוזרות בהצלחה!</div>`;
            }
            if (result.failed.length > 0) {
                html += '<div class="error-box">';
                result.failed.forEach(f => {
                    html += `<p>❌ ${f.error}</p>`;
                });
                html += '</div>';
            }

            document.getElementById('expense-result').innerHTML = html;
            document.getElementById('expense-result').style.display = 'block';

            // Refresh expense entry list
            if (expenseEntryListContainer) {
                await entryManager.renderFilteredExpenseList(expenseEntryListContainer, selectedMonth, year);
            }

            // Clear amount and description for next entry
            document.getElementById('expenseAmount').value = '';
            document.getElementById('expenseDescription').value = '';
        } else {
            // Single expense flow with new date selectors
            const expenseDate = new Date(year, selectedMonth - 1, selectedDay);

            const input = {
                amount: amount,
                date: expenseDate,
                category: category,
                description: description
            };

            const result = await budgetController.addExpense(input);

            if (result.success) {
                // Save form state for persistence (without date, since we use dropdowns now)
                const formState = {
                    amount: document.getElementById('expenseAmount').value,
                    category: document.getElementById('expenseCategory').value,
                    description: document.getElementById('expenseDescription').value
                };
                formPersistenceService.saveFormState(formState);

                document.getElementById('expense-result').innerHTML = 
                    '<div class="success-box">✓ ההוצאה נוספה בהצלחה!</div>';
                document.getElementById('expense-result').style.display = 'block';

                // Refresh expense entry list filtered by selected month
                if (expenseEntryListContainer) {
                    await entryManager.renderFilteredExpenseList(expenseEntryListContainer, selectedMonth, year);
                }

                // Keep form values but clear amount and description for next entry
                document.getElementById('expenseAmount').value = '';
                document.getElementById('expenseDescription').value = '';
            } else {
                showError(result.error.message);
            }
        }
    } catch (error) {
        showError('שגיאה בהוספת ההוצאה: ' + error.message);
    }
});

// Monthly report
document.getElementById('monthly-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const monthValue = document.getElementById('reportMonth').value;
        const [year, month] = monthValue.split('-').map(Number);
        
        const report = await budgetController.getMonthlyReport(year, month - 1);
        
        if (!report) {
            document.getElementById('monthly-details').innerHTML = 
                '<div class="info-box">אין נתוני משכורת לחודש זה</div>';
            document.getElementById('monthly-result').style.display = 'block';
            document.getElementById('monthly-chart-container').style.display = 'none';
            progressBarManager.hide('monthly-progress-bar');
            return;
        }
        
        // Show chart container
        document.getElementById('monthly-chart-container').style.display = 'block';
        
        // Render pie chart if there are expenses
        if (report.expenses.length > 0) {
            const pieChartData = chartDataPrepService.preparePieChartData(report.expenses);
            chartManager.renderPieChart('monthlyPieChart', pieChartData);
            document.getElementById('no-expenses-message').style.display = 'none';
        } else {
            document.getElementById('no-expenses-message').style.display = 'block';
            chartManager.destroyChart('monthlyPieChart');
        }
        
        let html = '<div class="monthly-summary">';
        html += `<div class="summary-card"><div class="summary-label">הכנסה נטו</div><div class="summary-value">${localizationService.formatCurrency(report.netIncome)}</div></div>`;
        html += `<div class="summary-card"><div class="summary-label">סה"כ הוצאות</div><div class="summary-value">${localizationService.formatCurrency(report.totalExpenses)}</div></div>`;
        html += `<div class="summary-card"><div class="summary-label">חיסכון נטו</div><div class="summary-value">${localizationService.formatCurrency(report.netSavings)}</div></div>`;
        html += '</div>';
        
        if (report.expensesByCategory.size > 0) {
            html += '<h3>הוצאות לפי קטגוריה</h3>';
            html += '<div class="category-summary">';
            report.expensesByCategory.forEach((amount, category) => {
                html += `<div class="category-card"><div class="category-name">${category}</div><div class="category-amount">${localizationService.formatCurrency(amount)}</div></div>`;
            });
            html += '</div>';
        }
        
        if (report.expenses.length > 0) {
            html += '<h3>רשימת הוצאות</h3>';
            html += '<div class="expense-list">';
            report.expenses.forEach(expense => {
                html += '<div class="expense-item">';
                html += '<div class="expense-details">';
                html += `<div class="expense-amount">${localizationService.formatCurrency(expense.amount)}</div>`;
                html += `<div class="expense-date">${localizationService.formatDate(expense.date)}</div>`;
                if (expense.category) {
                    html += `<span class="expense-category">${expense.category}</span>`;
                }
                if (expense.description) {
                    html += `<div>${expense.description}</div>`;
                }
                html += '</div>';
                html += '</div>';
            });
            html += '</div>';
        }
        
        document.getElementById('monthly-details').innerHTML = html;
        document.getElementById('monthly-result').style.display = 'block';
        
        // Show or hide savings goal progress bar
        try {
            const goalAmount = await savingsGoalManager.getMonthlySavingsGoal();
            if (goalAmount !== null) {
                const progressData = savingsGoalManager.calculateProgress(report.netSavings, goalAmount);
                progressBarManager.render('monthly-progress-bar', progressData);
            } else {
                progressBarManager.hide('monthly-progress-bar');
            }
        } catch (err) {
            console.error('Error displaying savings progress:', err);
            progressBarManager.hide('monthly-progress-bar');
        }
    } catch (error) {
        showError('שגיאה בטעינת הדוח החודשי: ' + error.message);
    }
});

// Annual report
document.getElementById('annual-btn').addEventListener('click', async () => {
    try {
        const report = await budgetController.getAnnualReport();
        
        // Show chart container
        document.getElementById('annual-chart-container').style.display = 'block';
        
        // Render stacked bar chart (Req 5.1)
        const stackedBarChartData = chartDataPrepService.prepareStackedBarChartData(report.monthlyReports, localizationService);
        chartManager.renderStackedBarChart('annualBarChart', stackedBarChartData);
        
        // Display total savings with color coding
        const savingsDisplay = document.getElementById('annual-savings-display');
        const savingsAmount = document.getElementById('annual-savings-amount');
        savingsDisplay.style.display = 'block';
        
        const formattedSavings = localizationService.formatCurrency(report.totalSavings);
        savingsAmount.textContent = formattedSavings;
        
        // Color code based on positive/negative
        if (report.totalSavings < 0) {
            savingsAmount.style.color = '#d32f2f'; // Red
        } else {
            savingsAmount.style.color = '#388e3c'; // Green
        }
        
        // Yearly savings goal display (Req 6.1, 6.2, 6.3, 6.7)
        try {
            const monthlyGoal = await savingsGoalManager.getMonthlySavingsGoal();
            const annualGoalSection = document.getElementById('annual-goal-section');
            if (monthlyGoal !== null) {
                const yearlyGoal = savingsGoalManager.getYearlySavingsGoal(monthlyGoal);
                const progress = savingsGoalManager.calculateProgress(report.totalSavings, yearlyGoal);
                progressBarManager.render('annual-progress-bar', progress);
                annualGoalSection.style.display = 'block';
            } else {
                annualGoalSection.style.display = 'none';
            }
        } catch (err) {
            console.error('Error displaying yearly savings goal:', err);
            document.getElementById('annual-goal-section').style.display = 'none';
        }
        
        let html = '<div class="monthly-summary">';
        html += `<div class="summary-card"><div class="summary-label">סה"כ הכנסות</div><div class="summary-value">${localizationService.formatCurrency(report.totalIncome)}</div></div>`;
        html += `<div class="summary-card"><div class="summary-label">סה"כ הוצאות</div><div class="summary-value">${localizationService.formatCurrency(report.totalExpenses)}</div></div>`;
        html += `<div class="summary-card"><div class="summary-label">סה"כ חיסכון</div><div class="summary-value">${localizationService.formatCurrency(report.totalSavings)}</div></div>`;
        html += '</div>';
        
        html += '<div class="monthly-summary">';
        html += `<div class="summary-card"><div class="summary-label">צבירת פנסיה שנתית</div><div class="summary-value">${localizationService.formatCurrency(report.totalPensionAccumulation)}</div></div>`;
        html += `<div class="summary-card"><div class="summary-label">צבירת קרן השתלמות שנתית</div><div class="summary-value">${localizationService.formatCurrency(report.totalStudyFundAccumulation)}</div></div>`;
        html += '</div>';
        
        if (report.expensesByCategory.size > 0) {
            html += '<h3>הוצאות שנתיות לפי קטגוריה</h3>';
            html += '<div class="category-summary">';
            report.expensesByCategory.forEach((amount, category) => {
                html += `<div class="category-card"><div class="category-name">${category}</div><div class="category-amount">${localizationService.formatCurrency(amount)}</div></div>`;
            });
            html += '</div>';
        }
        
        html += '<h3>סיכום חודשי</h3>';
        html += '<table>';
        html += '<tr><th>חודש</th><th>הכנסה נטו</th><th>הוצאות</th><th>חיסכון</th></tr>';
        report.monthlyReports.forEach(monthly => {
            const monthName = localizationService.getMonthName(monthly.month.getMonth() + 1);
            html += '<tr>';
            html += `<td>${monthName} ${monthly.month.getFullYear()}</td>`;
            html += `<td>${localizationService.formatCurrency(monthly.netIncome)}</td>`;
            html += `<td>${localizationService.formatCurrency(monthly.totalExpenses)}</td>`;
            html += `<td>${localizationService.formatCurrency(monthly.netSavings)}</td>`;
            html += '</tr>';
        });
        html += '</table>';
        
        document.getElementById('annual-details').innerHTML = html;
        document.getElementById('annual-result').style.display = 'block';
    } catch (error) {
        showError('שגיאה בטעינת הדוח השנתי: ' + error.message);
    }
});

// Error display helper
function showError(message) {
    const errorBox = document.getElementById('error-message');
    errorBox.textContent = '❌ ' + message;
    errorBox.style.display = 'block';
    
    // Scroll to error
    errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Hide after 5 seconds
    setTimeout(() => {
        errorBox.style.display = 'none';
    }, 5000);
}

        // Load initial data
        try {
            const data = await budgetController.loadAllData();
            console.log('✓ Data loaded:', data.salaries.length, 'salaries,', data.expenses.length, 'expenses');
            
            // Render initial salary list (salary tab is active by default)
            if (salaryEntryListContainer) {
                await entryManager.renderSalaryList(salaryEntryListContainer);
                console.log('✓ Initial salary entry list rendered');
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }

    } catch (error) {
        console.error('Initialization error:', error);
        alert('שגיאה באתחול האפליקציה. אנא רענן את הדף.');
    }
});
