import React from 'react';
import { Watch, ShieldCheck, FileText, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { formatCurrency } from '../../utils/financialEngine';

export const AlternativeAssetsView: React.FC = () => {
  const { filteredAlternatives } = useWealth();

  const totalValue = filteredAlternatives.reduce((sum, a) => sum + a.currentValue, 0);
  const totalCost = filteredAlternatives.reduce((sum, a) => sum + a.purchaseValue, 0);
  const totalGain = totalValue - totalCost;

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Asset Alternativi & Beni da Collezione
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Orologi di lusso, metalli preziosi, opere d'arte e beni rifugio con documentazione custodita.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 px-4 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-mono">
            Valore Totale: <strong className="font-bold">{formatCurrency(totalValue)}</strong> (+{formatCurrency(totalGain)})
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAlternatives.map(alt => (
          <div
            key={alt.id}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700">
                  {alt.category.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-slate-400 font-mono">Acquisto: {alt.purchaseDate}</span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mt-2">{alt.name}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{alt.description}</p>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                {alt.location && (
                  <span className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-medium">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    {alt.location}
                  </span>
                )}
                {alt.hasDocuments && (
                  <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-[11px] font-medium">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    Full Set / Documenti
                  </span>
                )}
                {alt.isInsured && (
                  <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-[11px] font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    Assicurato
                  </span>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between font-mono">
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-bold font-sans tracking-wider">Prezzo Acquisto</div>
                <div className="text-xs text-slate-500 mt-0.5">{formatCurrency(alt.purchaseValue)}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-slate-400 uppercase font-bold font-sans tracking-wider">Valore Attuale Stimato</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">{formatCurrency(alt.currentValue)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
