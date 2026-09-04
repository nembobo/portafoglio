import React, { useState } from 'react';
import {
  CalendarDays,
  Coins,
  Building2,
  Receipt,
  Landmark,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { FinancialEvent, EventCategory } from '../../types';
import { formatCurrency, formatPercent } from '../../utils/financialEngine';

export const CalendarView: React.FC = () => {
  const { filteredEvents, confirmEventReceived, taxDisplayMode } = useWealth();

  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [selectedHorizon, setSelectedHorizon] = useState<'30D' | 'MONTH' | 'YEAR'>('30D');

  const todayStr = new Date().toISOString().split('T')[0];
  const next30Str = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0];
  const currentMonthPrefix = todayStr.slice(0, 7);

  // Filter events based on horizon and category
  const displayedEvents = filteredEvents.filter(event => {
    // Horizon filter
    if (selectedHorizon === '30D') {
      if (event.date < todayStr && event.status !== 'IN_RITARDO') return false;
      if (event.date > next30Str) return false;
    } else if (selectedHorizon === 'MONTH') {
      if (!event.date.startsWith(currentMonthPrefix)) return false;
    }

    // Category filter
    if (selectedFilter === 'ALL') return true;
    return event.category === selectedFilter;
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Calendario Finanziario & Fiscale Unificato
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visualizzazione temporale di tutte le cedole, affitti ricorrenti, dividendi e scadenze fiscali (Lordo/Netto).
          </p>
        </div>

        {/* Horizon Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setSelectedHorizon('30D')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              selectedHorizon === '30D' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Prossimi 30 Giorni
          </button>
          <button
            onClick={() => setSelectedHorizon('MONTH')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              selectedHorizon === 'MONTH' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mese Corrente
          </button>
          <button
            onClick={() => setSelectedHorizon('YEAR')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              selectedHorizon === 'YEAR' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tutto l'Anno
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'ALL', label: 'Tutti gli Eventi' },
          { id: 'AFFITTO', label: 'Affitti Immobiliari' },
          { id: 'CEDOLA', label: 'Cedole BTP / Obbligazioni' },
          { id: 'DIVIDENDO', label: 'Dividendi' },
          { id: 'RATA_MUTUO', label: 'Rate Mutui' },
          { id: 'TASSA', label: 'Tasse & Scadenze Fiscali' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedFilter(cat.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              selectedFilter === cat.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {displayedEvents.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            Nessun evento programmato per il periodo e filtri selezionati.
          </div>
        ) : (
          displayedEvents.map(event => {
            const isTax = event.category === 'TASSA';
            const isIncome = event.type === 'INCOME';

            return (
              <div
                key={event.id}
                className={`p-4 rounded-2xl border bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-300 ${
                  event.status === 'IN_RITARDO'
                    ? 'border-amber-300 bg-amber-50/30'
                    : isTax
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Left: Date Badge & Title */}
                <div className="flex items-start sm:items-center gap-3">
                  <div
                    className={`w-14 text-center py-2 px-2 rounded-xl font-mono text-xs border shrink-0 ${
                      event.status === 'IN_RITARDO'
                        ? 'bg-amber-100 border-amber-300 text-amber-900'
                        : isTax
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="font-extrabold text-sm leading-tight">
                      {event.date.split('-')[2]}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-500 mt-0.5">
                      {new Date(event.date).toLocaleString('it-IT', { month: 'short' })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isTax
                            ? 'bg-amber-100 text-amber-800 font-extrabold'
                            : event.category === 'AFFITTO'
                            ? 'bg-emerald-50 text-emerald-700'
                            : event.category === 'CEDOLA'
                            ? 'bg-indigo-50 text-indigo-700'
                            : event.category === 'DIVIDENDO'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {isTax ? '⚖️ SCADENZA FISCALE' : event.category}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{event.date}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mt-1">{event.title}</h4>
                    {event.notes && (
                      <div className="text-xs text-slate-500 mt-0.5">{event.notes}</div>
                    )}
                  </div>
                </div>

                {/* Right: Amounts (Lordo -> Tasse -> Netto) and Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <div className="text-right font-mono">
                    <div className="text-sm font-bold">
                      <span className={isIncome ? 'text-emerald-600' : 'text-rose-600'}>
                        {isIncome ? '+' : '-'}{formatCurrency(taxDisplayMode === 'NET' ? event.netAmount : event.grossAmount)}
                      </span>
                    </div>
                    {event.taxAmount > 0 && (
                      <div className="text-[11px] text-slate-400">
                        Lordo: {formatCurrency(event.grossAmount)} (Tax: -{formatCurrency(event.taxAmount)})
                      </div>
                    )}
                  </div>

                  {/* Status Badge & Action */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        event.status === 'RICEVUTA' || event.status === 'PAGATA'
                          ? 'bg-emerald-50 text-emerald-700'
                          : event.status === 'IN_RITARDO'
                          ? 'bg-amber-100 text-amber-800 animate-pulse font-extrabold'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {event.status}
                    </span>

                    {event.status !== 'RICEVUTA' && event.status !== 'PAGATA' && (
                      <button
                        onClick={() => confirmEventReceived(event.id)}
                        className="p-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs shadow-indigo-100"
                        title="Conferma incasso / pagamento"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Conferma</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
