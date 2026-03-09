/**
 * CompanyList - Static data for publicly traded companies
 * commonly associated with Israeli tech employers.
 */

interface CompanyInfo {
  ticker: string;
  name: string;
  exchange: string;
  currency: string;
}

const STOCK_COMPANY_LIST: CompanyInfo[] = [
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
function filterCompanies(query: string): CompanyInfo[] {
  if (query.length < 2) {
    return [];
  }
  const lowerQuery = query.toLowerCase();
  return STOCK_COMPANY_LIST.filter(
    (company) =>
      company.name.toLowerCase().includes(lowerQuery) ||
      company.ticker.toLowerCase().includes(lowerQuery)
  );
}

export { CompanyInfo, STOCK_COMPANY_LIST, filterCompanies };
