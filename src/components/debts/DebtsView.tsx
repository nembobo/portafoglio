import React from 'react';
import { Landmark, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { formatCurrency, formatPercent } from '../../utils/financialEngine';

export const DebtsView: React.FC = () => {
  const { filteredLiabilities, properties } = useWealth();

  const totalDebt = filteredLiabilities.reduce((sum, l) => sum + l.remainingCapital, 0);
  const totalInstallments = filteredLiabilities.reduce((sum, l) => sum + l.monthlyInstallment, 0);

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Debiti, Mutui & Finanziamenti
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestione passività finanziarie e calcolo dell'equity netta sugli immobili ipotecati.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 px-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-mono">
            Debito Residuo Totale: <strong className="font-bold">{formatCurrency(totalDebt)}</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredLiabilities.map(debt => {
          const property = properties.find(p => p.id === debt.associatedAssetId);
          const propValue = property ? property.currentValue : 0;
          const netEquity = Math.max(0, propValue - debt.remainingCapital);
          const ltv = propValue > 0 ? (debt.remainingCapital / propValue) * 100 : 0;

          return (
            <div
              key={debt.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
                    {debt.type} • {debt.isFixedRate ? 'Tasso Fisso' : 'Tasso Variabile'}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1.5">{debt.name}</h3>
                  <div className="text-xs text-slate-500">{debt.institution}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold font-mono text-rose-600">
                    -{formatCurrency(debt.remainingCapital)}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Capitale iniziale: {formatCurrency(debt.initialAmount)}
                  </div>
                </div>
              </div>

              {/* Specific Property Equity Breakdown (Requirement #9) */}
              {property && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
                  <div className="font-bold text-slate-800">
                    Immobile Collegato: {property.name} ({property.city})
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono">
                    <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs">
                      <div className="text-[9px] text-slate-400 uppercase font-bold font-sans">Valore Immobile</div>
                      <div className="font-bold text-slate-900 text-xs mt-0.5">{formatCurrency(propValue)}</div>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs">
                      <div className="text-[9px] text-rose-600 uppercase font-bold font-sans">Mutuo Residuo</div>
                      <div className="font-bold text-rose-600 text-xs mt-0.5">-{formatCurrency(debt.remainingCapital)}</div>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100 shadow-xs">
                      <div className="text-[9px] text-emerald-700 uppercase font-bold font-sans">Equity Netta</div>
                      <div className="font-bold text-emerald-600 text-xs mt-0.5">{formatCurrency(netEquity)}</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 flex justify-between pt-1 font-sans">
                    <span>Loan to Value (LTV): <strong className="text-slate-700">{ltv.toFixed(1)}%</strong></span>
                    <span>Ammortamento fino al: <strong className="text-slate-700">{debt.endDate}</strong></span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono border-t border-slate-100">
                <div>
                  <span className="text-slate-400 font-sans text-[11px]">Rata Mensile:</span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {formatCurrency(debt.monthlyInstallment)} (giorno {debt.installmentDayOfMonth})
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-sans text-[11px]">Tasso di Interesse:</span>
                  <div className="font-bold text-slate-900 mt-0.5">{debt.interestRate}% TAN</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
