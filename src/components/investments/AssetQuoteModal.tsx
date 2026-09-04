import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Calendar,
  ShieldCheck,
  Percent,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { FinancialAsset } from '../../types';
import { lookupOnlineAsset, AssetOnlineQuote } from '../../utils/marketDataService';
import { formatCurrency, formatPercent } from '../../utils/financialEngine';

interface AssetQuoteModalProps {
  asset: FinancialAsset | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePrice?: (newPrice: number) => void;
}

export const AssetQuoteModal: React.FC<AssetQuoteModalProps> = ({
  asset,
  isOpen,
  onClose,
  onUpdatePrice
}) => {
  const [quote, setQuote] = useState<AssetOnlineQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<'1M' | '6M' | '1Y' | '3Y' | '5Y'>('1Y');
  const [chartMode, setChartMode] = useState<'PRICE' | 'VALUE'>('PRICE');

  useEffect(() => {
    if (asset && isOpen) {
      loadQuote();
    }
  }, [asset, isOpen]);

  const loadQuote = async () => {
    if (!asset) return;
    setLoading(true);
    try {
      const q = await lookupOnlineAsset(asset.isin || asset.name, asset.quantity);
      setQuote(q);
      if (onUpdatePrice && q.currentPrice !== asset.currentPrice) {
        onUpdatePrice(q.currentPrice);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !asset) return null;

  const currentVal = asset.quantity * (quote ? quote.currentPrice : asset.currentPrice);
  const buyVal = asset.quantity * asset.averageBuyPrice;
  const gain = currentVal - buyVal;
  const gainPct = buyVal > 0 ? (gain / buyVal) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 overflow-hidden space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {asset.category}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Ripresa Online Attiva
              </span>
            </div>
            <h2 className="text-base font-extrabold text-slate-900 mt-1">{asset.name}</h2>
            <p className="text-xs text-slate-400 font-mono">
              ISIN: {asset.isin} {asset.ticker && `• Ticker: ${asset.ticker}`}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Market Price & KPIs */}
        <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Prezzo Live</span>
            <div className="text-lg font-bold font-mono text-slate-900">
              €{quote ? quote.currentPrice.toFixed(2) : asset.currentPrice.toFixed(2)}
            </div>
            {quote && (
              <span className={`text-[10px] font-bold font-mono ${quote.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {quote.changePercent >= 0 ? '+' : ''}{quote.changePercent}%
              </span>
            )}
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Quantità / Nominale</span>
            <div className="text-lg font-bold font-mono text-slate-900">
              {asset.quantity.toLocaleString('it-IT')}
            </div>
            <span className="text-[10px] text-slate-500">PMC: €{asset.averageBuyPrice.toFixed(2)}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Controvalore Attuale</span>
            <div className="text-lg font-bold font-mono text-indigo-700">
              {formatCurrency(currentVal)}
            </div>
            <span className={`text-[10px] font-bold font-mono ${gain >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {gain >= 0 ? '+' : ''}{formatCurrency(gain)} ({gainPct >= 0 ? '+' : ''}{gainPct.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Interactive Chart: Prezzo o Valore nel tempo */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Serie Temporale:</span>
              <div className="flex bg-slate-100 p-0.5 rounded text-[10px]">
                <button
                  type="button"
                  onClick={() => setChartMode('PRICE')}
                  className={`px-2 py-0.5 rounded font-semibold ${chartMode === 'PRICE' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500'}`}
                >
                  Prezzo (€)
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode('VALUE')}
                  className={`px-2 py-0.5 rounded font-semibold ${chartMode === 'VALUE' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500'}`}
                >
                  Valore Totale (€)
                </button>
              </div>
            </div>

            {/* Timeframe pills */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded gap-1">
              {(['1M', '6M', '1Y', '3Y', '5Y'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setTimeframe(p)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    timeframe === p
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="h-44 w-full bg-white rounded-xl border border-slate-100 p-2">
            {quote ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={quote.timeSeries[timeframe]} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="assetModalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94A3B8' }} stroke="#E2E8F0" />
                  <YAxis
                    tick={{ fontSize: 9, fill: '#94A3B8' }}
                    stroke="#E2E8F0"
                    domain={['auto', 'auto']}
                    tickFormatter={val => chartMode === 'VALUE' ? `€${(val/1000).toFixed(0)}k` : `€${val}`}
                  />
                  <Tooltip
                    formatter={(val: any) => [
                      chartMode === 'VALUE' ? formatCurrency(Number(val)) : `€${Number(val).toFixed(2)}`,
                      chartMode === 'VALUE' ? 'Valore di Portafoglio' : 'Prezzo di Mercato'
                    ]}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '11px',
                      padding: '4px 8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={chartMode === 'VALUE' ? 'value' : 'price'}
                    stroke="#4F46E5"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#assetModalGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Caricamento dati di mercato...
              </div>
            )}
          </div>
        </div>

        {/* Bond Coupon or Dividend Metadata */}
        {asset.isBond && (
          <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Flusso Cedolare Annuo</span>
              <div className="font-bold text-slate-900 font-mono">
                {asset.annualCouponRate ? `${(asset.annualCouponRate * 100).toFixed(2)}% lordo` : 'N/A'} • {asset.couponFrequency === 'SEMI_ANNUAL' ? 'Semestrale' : 'Annuale'}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400">Scadenza / Rimborso 100</span>
              <div className="font-bold text-indigo-700 font-mono">
                {asset.maturityDate || 'Non definita'}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={loadQuote}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Aggiornamento...' : 'Aggiorna Prezzo Live'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
