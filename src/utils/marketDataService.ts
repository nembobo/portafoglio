import { AssetOnlineQuote, AssetCategory, AssetTimeSeriesPoint, Currency } from '../types';

export type { AssetOnlineQuote };

export interface KnownInstrument {
  isin: string;
  ticker?: string;
  name: string;
  category: AssetCategory;
  price: number;
  previousClose: number;
  changePercent: number;
  couponRate?: number;
  maturityDate?: string;
  couponFrequency?: 'ANNUAL' | 'SEMI_ANNUAL' | 'QUARTERLY' | 'MONTHLY';
  yieldToMaturity?: number;
  taxRate: number;
  currency: Currency;
  description: string;
}

export const KNOWN_INSTRUMENTS: KnownInstrument[] = [
  // BTP & Titoli di Stato
  {
    isin: 'IT0005544082',
    ticker: '0E79.L',
    name: 'BTP 4.35% 01 Nov 2033 (MOT)',
    category: 'GOV_BOND',
    price: 104.66,
    previousClose: 104.50,
    changePercent: 0.15,
    couponRate: 0.0435,
    maturityDate: '2033-11-01',
    couponFrequency: 'SEMI_ANNUAL',
    yieldToMaturity: 3.75,
    taxRate: 0.125,
    currency: 'EUR',
    description: 'Titolo di Stato Repubblica Italiana con cedola semestrale al 4.35% annuo.'
  },
  {
    isin: 'IT0005547407',
    ticker: 'BTP10.MI',
    name: 'BTP 4.00% 01/09/2033',
    category: 'GOV_BOND',
    price: 102.10,
    previousClose: 101.95,
    changePercent: 0.15,
    couponRate: 0.04,
    maturityDate: '2033-09-01',
    couponFrequency: 'SEMI_ANNUAL',
    yieldToMaturity: 3.82,
    taxRate: 0.125,
    currency: 'EUR',
    description: 'Buono del Tesoro Poliennale a tasso fisso, cedola semestrale 4%.'
  },
  {
    isin: 'IT0005436693',
    ticker: 'BTP-1MZ37',
    name: 'BTP 4.00% 01 Mar 2037',
    category: 'GOV_BOND',
    price: 101.40,
    previousClose: 101.10,
    changePercent: 0.30,
    couponRate: 0.04,
    maturityDate: '2037-03-01',
    couponFrequency: 'SEMI_ANNUAL',
    yieldToMaturity: 3.92,
    taxRate: 0.125,
    currency: 'EUR',
    description: 'Buono del Tesoro Poliennale a 15 anni, tassazione agevolata 12.5%.'
  },
  {
    isin: 'IT0005584856',
    ticker: 'BTP-VAL2030',
    name: 'BTP Valore Mar 2030 Cum',
    category: 'GOV_BOND',
    price: 102.10,
    previousClose: 101.90,
    changePercent: 0.20,
    couponRate: 0.0360,
    maturityDate: '2030-03-05',
    couponFrequency: 'QUARTERLY',
    yieldToMaturity: 3.52,
    taxRate: 0.125,
    currency: 'EUR',
    description: 'Emissione BTP Valore per clientela retail con cedole trimestrali.'
  },
  {
    isin: 'IT0005518524',
    ticker: 'BTP-ITA2028',
    name: 'BTP Italia Nov 2028 Indicizzato FOI',
    category: 'GOV_BOND',
    price: 99.80,
    previousClose: 99.70,
    changePercent: 0.10,
    couponRate: 0.0260,
    maturityDate: '2028-11-22',
    couponFrequency: 'SEMI_ANNUAL',
    yieldToMaturity: 3.80,
    taxRate: 0.125,
    currency: 'EUR',
    description: 'Titolo di Stato indicizzato all\'inflazione italiana FOI.'
  },

  // ETF
  {
    isin: 'IE00BK5BQT80',
    ticker: 'VWCE.MI',
    name: 'Vanguard FTSE All-World UCITS ETF (Acc)',
    category: 'ETF',
    price: 168.21,
    previousClose: 168.03,
    changePercent: 0.11,
    taxRate: 0.26,
    currency: 'EUR',
    description: 'ETF globale ad accumulazione diversificato su mercati mondiali.'
  },
  {
    isin: 'IE00B4L5Y983',
    ticker: 'SWDA.MI',
    name: 'iShares Core MSCI World UCITS ETF (Acc)',
    category: 'ETF',
    price: 127.89,
    previousClose: 127.84,
    changePercent: 0.04,
    taxRate: 0.26,
    currency: 'EUR',
    description: 'ETF benchmark sui mercati sviluppati con bassissimo TER (0.20%).'
  },
  {
    isin: 'IE00B5BMR087',
    ticker: 'CSSPX.MI',
    name: 'iShares Core S&P 500 UCITS ETF (Acc)',
    category: 'ETF',
    price: 565.30,
    previousClose: 560.10,
    changePercent: 0.93,
    taxRate: 0.26,
    currency: 'EUR',
    description: 'ETF sulle 500 maggiori società statunitensi.'
  },

  // Azioni Italiane ed Internazionali
  {
    isin: 'NL0011585146',
    ticker: 'RACE.MI',
    name: 'Ferrari N.V.',
    category: 'STOCK',
    price: 356.80,
    previousClose: 357.70,
    changePercent: -0.25,
    taxRate: 0.26,
    currency: 'EUR',
    description: 'Leader mondiale nel settore automobilistico di lusso e corse sportive.'
  },
  {
    isin: 'US0378331005',
    ticker: 'AAPL',
    name: 'Apple Inc.',
    category: 'STOCK',
    price: 328.21,
    previousClose: 324.96,
    changePercent: 1.00,
    taxRate: 0.26,
    currency: 'USD',
    description: 'Colosso tecnologico globale (iPhone, Mac, Services, AI).'
  },
  {
    isin: 'IT0000072618',
    ticker: 'ISP.MI',
    name: 'Intesa Sanpaolo S.p.A.',
    category: 'STOCK',
    price: 6.69,
    previousClose: 6.65,
    changePercent: 0.60,
    taxRate: 0.26,
    currency: 'EUR',
    description: 'Primo gruppo bancario in Italia con generoso rendimento da dividendo.'
  },
  {
    isin: 'IT0003128367',
    ticker: 'ENEL.MI',
    name: 'Enel S.p.A.',
    category: 'STOCK',
    price: 9.03,
    previousClose: 8.98,
    changePercent: 0.55,
    taxRate: 0.26,
    currency: 'EUR',
    description: 'Multinazionale dell\'energia e principale utility elettrica europea.'
  }
];

/**
 * Resolve any query or ISIN into the Yahoo Finance ticker
 */
export function resolveYahooSymbol(symbolOrIsin: string, category?: AssetCategory): string {
  const clean = symbolOrIsin.trim().toUpperCase();

  // BTP benchmarks on Yahoo Finance:
  if (
    clean === 'IT0005544082' ||
    clean === 'IT0005547407' ||
    clean.includes('BTP') ||
    clean.includes('BOT') ||
    category === 'GOV_BOND'
  ) {
    if (clean === 'BTP10.MI' || clean === 'BT27.MI' || clean === '0E79.L') {
      return clean;
    }
    // Default BTP 10Y / MOT benchmark
    return '0E79.L';
  }

  // Known tickers
  if (clean === 'VWCE' || clean === 'IE00BK5BQT80') return 'VWCE.MI';
  if (clean === 'SWDA' || clean === 'IE00B4L5Y983') return 'SWDA.MI';
  if (clean === 'RACE' || clean === 'NL0011585146') return 'RACE.MI';
  if (clean === 'ISP' || clean === 'IT0000072618') return 'ISP.MI';
  if (clean === 'ENEL' || clean === 'IT0003128367') return 'ENEL.MI';
  if (clean === 'AAPL' || clean === 'US0378331005') return 'AAPL';
  if (clean === 'CSSPX' || clean === 'IE00B5BMR087') return 'CSSPX.MI';

  // If already contains a dot (e.g. RACE.MI, VWCE.MI, BTP10.MI), return as is
  if (clean.includes('.')) {
    return clean;
  }

  // If standard US ticker
  if (['MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA'].includes(clean)) {
    return clean;
  }

  // Default Italian stocks on Milan exchange
  if (category === 'STOCK') {
    return `${clean}.MI`;
  }

  return clean;
}

/**
 * Direct Live Yahoo Finance Fetcher
 * Tries local Vite proxy first (`/api/yahoo`), falls back to public CORS proxy if needed.
 */
export async function fetchLiveYahooChart(symbol: string): Promise<any | null> {
  const endpoints = [
    `/api/yahoo/v8/finance/chart/${encodeURIComponent(symbol)}?range=1mo&interval=1d`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1mo&interval=1d`)}`
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json?.chart?.result?.[0]?.meta) {
          return json.chart.result[0];
        }
      }
    } catch {
      // Continue to next endpoint if available
    }
  }

  return null;
}

/**
 * Generate historical time-series curve for an asset
 */
export function generateAssetTimeSeries(
  basePrice: number,
  quantity: number = 1000,
  category: AssetCategory = 'STOCK'
): {
  '1M': AssetTimeSeriesPoint[];
  '6M': AssetTimeSeriesPoint[];
  '1Y': AssetTimeSeriesPoint[];
  '3Y': AssetTimeSeriesPoint[];
  '5Y': AssetTimeSeriesPoint[];
} {
  const periods = [
    { key: '1M' as const, days: 30, volatility: 0.008, trend: 0.015 },
    { key: '6M' as const, days: 180, volatility: 0.012, trend: 0.045 },
    { key: '1Y' as const, days: 365, volatility: 0.014, trend: 0.09 },
    { key: '3Y' as const, days: 1095, volatility: 0.018, trend: 0.28 },
    { key: '5Y' as const, days: 1825, volatility: 0.022, trend: 0.52 }
  ];

  const result: any = {};
  const isBond = category === 'GOV_BOND' || category === 'BOND';
  const factor = isBond ? 0.35 : 1.0;

  periods.forEach(p => {
    const pointsCount = p.key === '1M' ? 15 : p.key === '6M' ? 24 : p.key === '1Y' ? 36 : 48;
    const intervalDays = Math.max(1, Math.floor(p.days / pointsCount));
    const now = new Date();
    const points: AssetTimeSeriesPoint[] = [];

    const totalReturn = p.trend * factor;
    const startPrice = basePrice / (1 + totalReturn);

    for (let i = 0; i <= pointsCount; i++) {
      const pointDate = new Date(now.getTime() - (pointsCount - i) * intervalDays * 24 * 3600 * 1000);
      const dateStr = pointDate.toISOString().split('T')[0];

      const progress = i / pointsCount;
      const noise = Math.sin(i * 1.5) * p.volatility * factor + Math.cos(i * 0.8) * 0.005;
      const interpolatedPrice =
        i === pointsCount
          ? basePrice
          : Number((startPrice + (basePrice - startPrice) * progress + basePrice * noise).toFixed(2));

      points.push({
        date: dateStr,
        price: Math.max(0.01, interpolatedPrice),
        value: Math.round(interpolatedPrice * quantity),
        volume: Math.round(50000 + Math.random() * 200000)
      });
    }

    result[p.key] = points;
  });

  return result;
}

/**
 * Online Asset Lookup Engine powered by Yahoo Finance
 */
export async function lookupOnlineAsset(query: string, quantity: number = 1000): Promise<AssetOnlineQuote> {
  const clean = query.trim().toUpperCase();
  const yahooSymbol = resolveYahooSymbol(clean);

  // Attempt live Yahoo Finance query
  try {
    const yahooData = await fetchLiveYahooChart(yahooSymbol);
    if (yahooData?.meta) {
      const meta = yahooData.meta;
      const regularPrice = meta.regularMarketPrice ?? meta.previousClose ?? 100;
      const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? regularPrice;
      const diff = Number((regularPrice - previousClose).toFixed(2));
      const pct = previousClose > 0 ? Number(((diff / previousClose) * 100).toFixed(2)) : 0;

      const category: AssetCategory =
        yahooSymbol.includes('BTP') || yahooSymbol === '0E79.L' || clean.includes('BTP')
          ? 'GOV_BOND'
          : yahooSymbol.includes('VWCE') || yahooSymbol.includes('SWDA') || clean.includes('ETF')
          ? 'ETF'
          : 'STOCK';

      // Build timeseries from Yahoo historical timestamps if available
      const timestamps: number[] = yahooData.timestamp || [];
      const closes: (number | null)[] = yahooData.indicators?.quote?.[0]?.close || [];
      const realPoints: AssetTimeSeriesPoint[] = [];

      for (let i = 0; i < timestamps.length; i++) {
        const c = closes[i];
        if (c !== null && c !== undefined && !isNaN(c)) {
          const d = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
          realPoints.push({
            date: d,
            price: Number(c.toFixed(2)),
            value: Math.round(c * quantity)
          });
        }
      }

      const syntheticSeries = generateAssetTimeSeries(regularPrice, quantity, category);
      const timeSeries = {
        ...syntheticSeries,
        '1M': realPoints.length > 5 ? realPoints : syntheticSeries['1M']
      };

      return {
        isin: clean.length === 12 ? clean : `IT${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        ticker: meta.symbol || yahooSymbol,
        name: meta.longName || meta.shortName || clean,
        currentPrice: Number(regularPrice.toFixed(2)),
        previousClose: Number(previousClose.toFixed(2)),
        changeAmount: diff,
        changePercent: pct,
        lastUpdated: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        category,
        currency: (meta.currency as Currency) || 'EUR',
        couponRate: category === 'GOV_BOND' ? 0.04 : undefined,
        maturityDate: category === 'GOV_BOND' ? '2033-09-01' : undefined,
        couponFrequency: category === 'GOV_BOND' ? 'SEMI_ANNUAL' : undefined,
        yieldToMaturity: category === 'GOV_BOND' ? 3.85 : undefined,
        timeSeries
      };
    }
  } catch (err) {
    console.warn('Yahoo Finance live lookup failed, fallback to local database:', err);
  }

  // Fallback: Check KNOWN_INSTRUMENTS
  const exact = KNOWN_INSTRUMENTS.find(
    i => i.isin.toUpperCase() === clean || (i.ticker && i.ticker.toUpperCase() === clean)
  );

  const matched = exact || KNOWN_INSTRUMENTS.find(
    i =>
      i.isin.toUpperCase().includes(clean) ||
      (i.ticker && i.ticker.toUpperCase().includes(clean)) ||
      i.name.toUpperCase().includes(clean)
  );

  if (matched) {
    const diff = Number((matched.price - matched.previousClose).toFixed(2));
    const pct = Number(((diff / matched.previousClose) * 100).toFixed(2));
    const timeSeries = generateAssetTimeSeries(matched.price, quantity, matched.category);

    return {
      isin: matched.isin,
      ticker: matched.ticker,
      name: matched.name,
      currentPrice: matched.price,
      previousClose: matched.previousClose,
      changeAmount: diff,
      changePercent: pct,
      lastUpdated: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      category: matched.category,
      currency: matched.currency,
      couponRate: matched.couponRate,
      maturityDate: matched.maturityDate,
      couponFrequency: matched.couponFrequency,
      yieldToMaturity: matched.yieldToMaturity,
      timeSeries
    };
  }

  // Generic fallback
  const isItalianGov = clean.startsWith('IT0005') || clean.includes('BTP') || clean.includes('BOT');
  const isEtf = clean.startsWith('IE00') || clean.startsWith('LU') || clean.includes('ETF');
  const inferredCategory: AssetCategory = isItalianGov ? 'GOV_BOND' : isEtf ? 'ETF' : 'STOCK';
  const inferredPrice = isItalianGov ? 102.1 : isEtf ? 128.5 : 220.0;
  const prevClose = Number((inferredPrice * 0.995).toFixed(2));
  const diff = Number((inferredPrice - prevClose).toFixed(2));
  const pct = Number(((diff / prevClose) * 100).toFixed(2));

  return {
    isin: clean.length === 12 ? clean : `IT${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    ticker: clean.length <= 8 ? clean : undefined,
    name: `${clean} (${inferredCategory})`,
    currentPrice: inferredPrice,
    previousClose: prevClose,
    changeAmount: diff,
    changePercent: pct,
    lastUpdated: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    category: inferredCategory,
    currency: 'EUR',
    timeSeries: generateAssetTimeSeries(inferredPrice, quantity, inferredCategory)
  };
}
