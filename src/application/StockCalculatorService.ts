/**
 * StockCalculatorService - Orchestrates stock value calculation.
 * Fetches stock prices and exchange rates via StockAPIClient,
 * computes total stock value in ILS, and validates share input.
 * Implements Requirements 3.1, 3.2, 3.3, 4.4
 */

import { StockAPIClient } from '../data-access/StockAPIClient.js';

export interface StockCalculation {
  ticker: string;
  companyName: string;
  stockPrice: number;
  currency: string;
  shares: number;
  exchangeRate: number | null; // null if already in ILS
  totalValueILS: number;
  priceDate: Date;
}

export class StockCalculatorService {
  constructor(private apiClient: StockAPIClient) {}

  /**
   * Calculate total stock value in ILS by fetching the current price
   * (and exchange rate if needed) and computing the result.
   * @param ticker - Stock ticker symbol
   * @param companyName - Display name of the company
   * @param shares - Number of shares held
   * @param currency - Currency of the stock price ("USD" | "ILS")
   * @returns StockCalculation with all details and the computed ILS value
   */
  async calculateStockValue(
    ticker: string,
    companyName: string,
    shares: number,
    currency: string
  ): Promise<StockCalculation> {
    const priceResult = await this.apiClient.fetchStockPrice(ticker);

    let exchangeRate: number | null = null;

    if (currency.toUpperCase() !== 'ILS') {
      const rateResult = await this.apiClient.fetchExchangeRate(currency, 'ILS');
      exchangeRate = rateResult.rate;
    }

    const totalValueILS = this.computeStockValue(
      priceResult.price,
      shares,
      exchangeRate,
      currency
    );

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
  computeStockValue(
    price: number,
    shares: number,
    exchangeRate: number | null,
    currency: string
  ): number {
    let value: number;

    if (currency.toUpperCase() === 'ILS') {
      value = price * shares;
    } else {
      value = price * shares * (exchangeRate ?? 1);
    }

    return Math.round(value * 100) / 100;
  }

  /**
   * Validate that a share count is a positive number.
   * @param value - The number to validate
   * @returns true if value is a positive number (> 0), false otherwise
   */
  validateShares(value: number): boolean {
    return typeof value === 'number' && isFinite(value) && value > 0;
  }
}
