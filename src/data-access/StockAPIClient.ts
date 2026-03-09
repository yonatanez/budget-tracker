/**
 * StockAPIClient - Fetches stock prices and exchange rates
 * using the Yahoo Finance v8 API (free, no API key, browser-compatible).
 * Implements Requirements 2.1, 2.4, 2.5, 4.1
 */

export interface StockPriceResult {
  ticker: string;
  price: number;
  currency: string;
  marketTime: Date;
}

export interface ExchangeRateResult {
  from: string;
  to: string;
  rate: number;
  timestamp: Date;
}

/** Base URL for Yahoo Finance v8 API — prefixed to avoid bundle collisions */
const STOCK_API_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

/** Timeout in milliseconds for all fetch calls */
const STOCK_API_TIMEOUT_MS = 10_000;

/** CORS proxy URL to route Yahoo Finance requests through */
const CORS_PROXY_URL = 'https://proxy.corsfix.com/';

export class StockAPIClient {
  /**
   * Fetch current stock price for a ticker symbol.
   * @param ticker - Stock ticker symbol (e.g., "AAPL", "CHKP")
   * @returns StockPriceResult with price, currency, and market time
   * @throws Error if the fetch fails, times out, or returns invalid data
   */
  async fetchStockPrice(ticker: string): Promise<StockPriceResult> {
    const yahooUrl = `${STOCK_API_BASE_URL}/${encodeURIComponent(ticker)}`;
    const url = `${CORS_PROXY_URL}${yahooUrl}`;
    const response = await this.fetchWithTimeout(url);
    const data = await response.json();

    const result = data?.chart?.result?.[0];
    if (!result) {
      throw new Error(`Invalid API response for ticker: ${ticker}`);
    }

    const meta = result.meta;
    if (
      typeof meta?.regularMarketPrice !== 'number' ||
      typeof meta?.currency !== 'string' ||
      typeof meta?.regularMarketTime !== 'number'
    ) {
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
  async fetchExchangeRate(from: string, to: string): Promise<ExchangeRateResult> {
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
    if (
      typeof meta?.regularMarketPrice !== 'number' ||
      typeof meta?.regularMarketTime !== 'number'
    ) {
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
  private async fetchWithTimeout(url: string): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), STOCK_API_TIMEOUT_MS);

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
      }
      return response;
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Request timed out after 10 seconds');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export { STOCK_API_BASE_URL, CORS_PROXY_URL };
