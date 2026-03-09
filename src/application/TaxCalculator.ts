import { SalaryComponents, TaxCalculationResult } from '../domain/types';

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
export class TaxCalculator {
  // 2026 Israeli Tax Brackets (monthly)
  private static readonly TAX_BRACKETS = [
    { ceiling: 7010, rate: 0.10 },      // Up to ₪7,010: 10%
    { ceiling: 10060, rate: 0.14 },     // ₪7,011-₪10,060: 14%
    { ceiling: 16150, rate: 0.20 },     // ₪10,061-₪16,150: 20%
    { ceiling: 22440, rate: 0.31 },     // ₪16,151-₪22,440: 31%
    { ceiling: 46690, rate: 0.35 },     // ₪22,441-₪46,690: 35%
    { ceiling: Infinity, rate: 0.47 },  // Above ₪46,690: 47%
  ];

  // National Insurance progressive brackets (2026)
  private static readonly NI_BRACKET_1_CEILING = 7703;
  private static readonly NI_BRACKET_1_RATE = 0.0104;  // 1.04%
  private static readonly NI_BRACKET_2_RATE = 0.07;     // 7.00%
  private static readonly NI_MAX_CEILING = 51910;

  // Health Insurance progressive brackets (2026)
  private static readonly HI_BRACKET_1_CEILING = 7703;
  private static readonly HI_BRACKET_1_RATE = 0.0323;  // 3.23%
  private static readonly HI_BRACKET_2_RATE = 0.0517;  // 5.17%
  private static readonly HI_MAX_CEILING = 51910;

  // Pension contribution rates
  private static readonly PENSION_EMPLOYEE_RATE = 0.06;
  private static readonly PENSION_EMPLOYER_RATE = 0.065;

  // Study fund contribution rates
  private static readonly STUDY_FUND_EMPLOYEE_RATE = 0.025;
  private static readonly STUDY_FUND_EMPLOYER_RATE = 0.075;

  // Tax credit points configuration (2024 rate)
  private static readonly MONTHLY_CREDIT_VALUE_PER_POINT = 223;
  private static readonly DEFAULT_TAX_CREDIT_POINTS = 2.25;

  /**
   * Calculate net income from salary components
   * @param salaryComponents - The salary components (base, bonus, stocks, etc.)
   * @param taxCreditPoints - Optional tax credit points (default: 2.25)
   * @returns Complete tax calculation result with all deductions
   */
  calculateNetIncome(salaryComponents: SalaryComponents, taxCreditPoints?: number): TaxCalculationResult {
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
  private calculateGrossSalary(components: SalaryComponents): number {
    return (
      components.baseSalary +
      (components.bonus || 0) +
      (components.mealVouchers || 0) +
      (components.otherCompensation || 0) +
      (components.directPensionContribution || 0) // Include in gross for tax purposes
    );
  }

  /**
   * Calculate progressive income tax based on 2026 brackets
   */
  private calculateIncomeTax(grossSalary: number): number {
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
  private calculateNationalInsurance(grossSalary: number): number {
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
  private calculateHealthInsurance(grossSalary: number): number {
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
  private calculatePensionEmployee(grossSalary: number): number {
    return grossSalary * TaxCalculator.PENSION_EMPLOYEE_RATE;
  }

  /**
   * Calculate employer pension contribution - 6.5% of gross salary
   */
  private calculatePensionEmployer(grossSalary: number): number {
    return grossSalary * TaxCalculator.PENSION_EMPLOYER_RATE;
  }

  /**
   * Calculate employee study fund contribution - 2.5% of gross salary
   */
  private calculateStudyFundEmployee(grossSalary: number): number {
    return grossSalary * TaxCalculator.STUDY_FUND_EMPLOYEE_RATE;
  }

  /**
   * Calculate employer study fund contribution - 7.5% of gross salary
   */
  private calculateStudyFundEmployer(grossSalary: number): number {
    return grossSalary * TaxCalculator.STUDY_FUND_EMPLOYER_RATE;
  }

  /**
   * Calculate tax credit deduction from tax credit points
   * @param taxCreditPoints - Number of tax credit points (0-10)
   * @returns Tax credit deduction amount
   */
  private calculateTaxCreditDeduction(taxCreditPoints: number): number {
    return taxCreditPoints * TaxCalculator.MONTHLY_CREDIT_VALUE_PER_POINT;
  }

  /**
   * Round monetary values to 2 decimal places
   */
  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
