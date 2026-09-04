import React, { useState } from 'react';
import {
  RefreshCw,
  TrendingUp,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  LineChart
} from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { FinancialAsset } from '../../types';
import { AssetQuoteModal } from '../investments/AssetQuoteModal';
import { formatCurrency } from '../../utils/financialEngine';

export const MarketSyncBar: React.FC = () => {
  const {
    filteredAssets,
    lastMarketSyncTime,
    isSyncingMarket,
    syncOnlineMarketPrices,
    updateAssetPrice
  } = useWealth();

  const [selectedAssetForQuote, setSelectedAssetForQuote] = useState<FinancialAsset | null>(null);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleSync = async () => {
    const count = await syncOnlineMarketPrices();
    setSyncFeedback(`Sincronizzati con successo ${count} strumenti dai mercati online!`);
    setTimeout(() => setSyncFeedback(null), 3500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-800">
                Quotazioni Live Yahoo Finance (Azioni, ETF & BTP)
              </h3>
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Feed Yahoo Attivo
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Aggiornato in tempo reale da Yahoo Finance • Ultimo sync: <span className="font-semibold text-slate-600">{lastMarketSyncTime}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {syncFeedback && (
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{syncFeedback}</span>
            </span>
          )}
          <button
            type="button"
            id="sync-market-btn"
            onClick={handleSync}
            disabled={isSyncingMarket}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-xs shadow-indigo-100 cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingMarket ? 'animate-spin' : ''}`} />
            <span>{isSyncingMarket ? 'Sincronizzazione...' : 'Sincronizza Prezzi Ora'}</span>
          </button>
        </div>
      </div>

      {/* Asset Live Quoting Ticker Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
        {filteredAssets.map(asset => {
          const totalVal = asset.quantity * asset.currentPrice;
          const isGov = asset.category === 'GOV_BOND';
          return (
            <button
              key={asset.id}
              type="button"
              onClick={() => setSelectedAssetForQuote(asset)}
              className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-indigo-50/40 hover:border-indigo-200 transition-all text-left group cursor-pointer"
            >
              <div className="truncate pr-2">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isGov ? 'bg-indigo-600' : 'bg-purple-600'}`}></span>
                  <span className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-700">
                    {asset.name}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate flex items-center gap-1.5">
                  {asset.ticker && (
                    <span className="font-bold text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded text-[9px]">
                      {asset.ticker}
                    </span>
                  )}
                  <span>{asset.isin}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-extrabold font-mono text-slate-900">
                  €{asset.currentPrice.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {formatCurrency(totalVal)}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Modal for detail and historical inspection */}
      <AssetQuoteModal
        asset={selectedAssetForQuote}
        isOpen={Boolean(selectedAssetForQuote)}
        onClose={() => setSelectedAssetForQuote(null)}
        onUpdatePrice={(newPrice) => {
          if (selectedAssetForQuote) {
            updateAssetPrice(selectedAssetForQuote.id, newPrice);
          }
        }}
      />
    </div>
  );
};
