/**
 * Simple build script to bundle TypeScript output for browser
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Create docs directory if it doesn't exist
if (!existsSync('docs')) {
  mkdirSync('docs');
}

// Read all compiled JS files and bundle them
const files = [
  'dist/domain/types.js',
  'dist/domain/models.js',
  'dist/data-access/LocalizationService.js',
  'dist/data-access/ValidationService.js',
  'dist/data-access/CSVParser.js',
  'dist/data-access/StorageService.js',
  'dist/data-access/FormPersistenceService.js',
  'dist/data-access/ExportService.js',
  'dist/presentation/chartConstants.js',
  'dist/application/ChartDataPrepService.js',
  'dist/application/TaxCalculator.js',
  'dist/application/ExpenseManager.js',
  'dist/application/BudgetController.js',
  'dist/presentation/ChartManager.js',
  'dist/presentation/EntryManager.js',
  'dist/presentation/DateSelectorManager.js',
  'dist/application/RecurringExpenseGenerator.js',
  'dist/presentation/SavingsTabManager.js',
  'dist/presentation/ProgressBarManager.js',
  'dist/application/SavingsGoalManager.js',
  'dist/data-access/CompanyList.js',
  'dist/data-access/StockAPIClient.js',
  'dist/application/StockCalculatorService.js',
  'dist/presentation/StockValueCalculatorUI.js'
];

let bundle = '// Israeli Budget Tracker - Bundled Application\n\n';

for (const file of files) {
  try {
    let content = readFileSync(file, 'utf-8');
    
    // Remove import/export statements for browser compatibility
    content = content.replace(/^import .* from .*$/gm, '');
    content = content.replace(/^export /gm, '');
    content = content.replace(/^export\{.*\}.*$/gm, '');
    
    bundle += `// ${file}\n${content}\n\n`;
  } catch (error) {
    console.warn(`Warning: Could not read ${file}`);
  }
}

// Expose classes to window object
bundle += `
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
`;

// Write bundle
writeFileSync('docs/app.js', bundle);

console.log('✓ Build complete! Bundle created at docs/app.js');
console.log('✓ Open docs/index.html in your browser to use the app');
