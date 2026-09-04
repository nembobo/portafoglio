import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Home,
  Coins,
  ShieldCheck,
  Percent,
  SlidersHorizontal,
  Table as TableIcon,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  ComposedChart
} from 'recharts';
import { useWealth } from '../../context/WealthContext';
import { generateCashFlowForecast } from '../../utils/cashFlowForecaster';
import { formatCurrency, formatPercent } from '../../utils/financialEngine';

export const CashFlowForecastSection: React.FC = () => {
  const {
    filteredAssets,
    filteredProperties,
    filteredRentalContracts,
    filteredLiabilities,
    filteredAccounts,
    filteredRegularIncomes,
    taxDisplayMode
  } = useWealth();

  const [forecastHorizon, setForecastHorizon] = useState<number>(7); // 7 years total (2 past + 5 future)
  const [viewMode, setViewMode] = useState<'CHART' | 'TABLE'>('CHART');
  const [includePrincipalRepayments, setIncludePrincipalRepayments] = useState(true);

  // Generate projections
  const forecastYears = useMemo(() => {
    return generateCashFlowForecast(
      filteredAssets,
      filteredProperties,
      filteredRentalContracts,
      filteredLiabilities,
      filteredAccounts,
      filteredRegularIncomes,
      2024,
      forecastHorizon
    );
  }, [filteredAssets, filteredProperties, filteredRentalContracts, filteredLiabilities, filteredAccounts, filteredRegularIncomes, forecastHorizon]);

  // Transform data for ComposedChart (Bars for streams + Line for Net Cash Flow)
  const chartData = useMemo(() => {
    return forecastYears.map(item => {
      const cedole = taxDisplayMode === 'NET' ? (item.streams?.cedole?.net ?? item.cedole ?? 0) : (item.streams?.cedole?.gross ?? item.cedole ?? 0);
      const affitti = taxDisplayMode === 'NET' ? (item.streams?.affitti?.net ?? item.affitti ?? 0) : (item.streams?.affitti?.gross ?? item.affitti ?? 0);
      const dividendi = taxDisplayMode === 'NET' ? (item.streams?.dividendi?.net ?? item.dividendi ?? 0) : (item.streams?.dividendi?.gross ?? item.dividendi ?? 0);
      const capitalMaturity = includePrincipalRepayments ? (item.principalRepayments || 0) : 0;
      const rateMutuo = item.streams?.rateMutuo?.outflow ?? item.rateMutuo ?? 0;
      const netCashFlow = (cedole + affitti + dividendi + capitalMaturity) - rateMutuo;

      return {
        year: item.year.toString(),
        isPast: item.isPast,
        isCurrent: item.isCurrent,
        label: `${item.year}${item.isCurrent ? ' (Oggi)' : item.isPast ? ' (Storico)' : ''}`,
        'Cedole BTP / Obbligazioni': Math.round(cedole),
        'Affitti Immobiliari': Math.round(affitti),
        'Dividendi Azioni & ETF': Math.round(dividendi),
        'Rimborso Titoli Scadenza': Math.round(capitalMaturity),
        'Uscite Rate Mutuo': Math.round(rateMutuo),
        'Flusso Netto': Math.round(netCashFlow),
        totalGross: Math.round(item.totalInflowsGross),
        totalNet: Math.round(item.totalInflowsNet)
      };
    });
  }, [forecastYears, taxDisplayMode, includePrincipalRepayments]);

  // Aggregate future 5 years income
  const futureYears = forecastYears.filter(f => !f.isPast);
  const total5YearsGross = futureYears.reduce((sum, f) => sum + f.totalInflowsGross, 0);
  const total5YearsNet = futureYears.reduce((sum, f) => sum + f.totalInflowsNet, 0);
  const total5YearsDebts = futureYears.reduce((sum, f) => sum + f.totalDebtService, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      {/* Section Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Previsione Flussi di Cassa (Passato & Futuro)</span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                Cedole • Affitti • Dividendi
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Proiezione automatica pluriennale delle entrate passive ricorrenti e delle scadenze di capitale.
          </p>
        </div>

        {/* Controls: Horizon, Principal toggle, Chart/Table */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Include Capital Maturity Checkbox */}
          <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 cursor-pointer text-[11px] font-semibold hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={includePrincipalRepayments}
              onChange={e => setIncludePrincipalRepayments(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Includi Rimborsi Capitale a Scadenza</span>
          </label>

          {/* Horizon Selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {[
              { label: '5 Anni', val: 5 },
              { label: '7 Anni', val: 7 },
              { label: '10 Anni', val: 10 }
            ].map(h => (
              <button
                key={h.val}
                type="button"
                onClick={() => setForecastHorizon(h.val)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-colors ${
                  forecastHorizon === h.val
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('CHART')}
              className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-md transition-colors ${
                viewMode === 'CHART'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              <span>Grafico</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-md transition-colors ${
                viewMode === 'TABLE'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <TableIcon className="w-3 h-3" />
              <span>Tabella</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Quick Projection KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Totale Entrate Future {forecastHorizon - 2}y
          </span>
          <div className="text-xl font-extrabold font-mono text-slate-900 mt-0.5">
            {formatCurrency(taxDisplayMode === 'NET' ? total5YearsNet : total5YearsGross)}
          </div>
          <span className="text-[10px] text-indigo-600 font-semibold">
            {taxDisplayMode === 'NET' ? 'Netto stimato post-imposte' : 'Lordo complessivo'}
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Media Annua Prevista
          </span>
          <div className="text-xl font-extrabold font-mono text-slate-900 mt-0.5">
            {formatCurrency(futureYears.length > 0 ? (taxDisplayMode === 'NET' ? total5YearsNet : total5YearsGross) / futureYears.length : 0)}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">
            ~{formatCurrency((futureYears.length > 0 ? (taxDisplayMode === 'NET' ? total5YearsNet : total5YearsGross) / futureYears.length : 0) / 12)} / mese
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Uscite Debiti {forecastHorizon - 2}y
          </span>
          <div className="text-xl font-extrabold font-mono text-rose-600 mt-0.5">
            -{formatCurrency(total5YearsDebts)}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            Rate mutuo e prestiti programmati
          </span>
        </div>
      </div>

      {/* Chart View */}
      {viewMode === 'CHART' ? (
        <div className="space-y-3">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  stroke="#E2E8F0"
                  tickFormatter={val => `€${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [formatCurrency(Number(val)), name]}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '10px',
                    color: '#F8FAFC',
                    fontSize: '12px',
                    border: '1px solid #1E293B'
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  iconType="circle"
                />
                <Bar dataKey="Affitti Immobiliari" stackId="inflows" fill="#10B981" />
                <Bar dataKey="Cedole BTP / Obbligazioni" stackId="inflows" fill="#4F46E5" />
                <Bar dataKey="Dividendi Azioni & ETF" stackId="inflows" fill="#8B5CF6" />
                {includePrincipalRepayments && (
                  <Bar dataKey="Rimborso Titoli Scadenza" stackId="inflows" fill="#F59E0B" />
                )}
                <Line
                  type="monotone"
                  dataKey="Flusso Netto"
                  name="Flusso Netto Post-Mutui (€)"
                  stroke="#0F172A"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0F172A' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span className="text-[11px]">
              * Gli anni <strong>2024 e 2025</strong> rappresentano lo storico registrato; gli anni <strong>2026-2030+</strong> proiettano i contratti di affitto attivi, le cedole BTP e i dividendi attesi.
            </span>
            <span className="font-semibold text-slate-700">
              Modalità visualizzazione: <strong className="text-indigo-600">{taxDisplayMode === 'NET' ? 'Netto Fiscale' : 'Lordo'}</strong>
            </span>
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[9px] uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Anno</th>
                <th className="py-2.5 px-3 text-right">Affitti</th>
                <th className="py-2.5 px-3 text-right">Cedole BTP</th>
                <th className="py-2.5 px-3 text-right">Dividendi</th>
                <th className="py-2.5 px-3 text-right">Rimborsi Capitale</th>
                <th className="py-2.5 px-3 text-right">Totale Entrate</th>
                <th className="py-2.5 px-3 text-right">Rate Debiti</th>
                <th className="py-2.5 px-3 text-right font-bold text-slate-900">Flusso Netto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {forecastYears.map(item => {
                const cedole = taxDisplayMode === 'NET' ? (item.streams?.cedole?.net ?? item.cedole ?? 0) : (item.streams?.cedole?.gross ?? item.cedole ?? 0);
                const affitti = taxDisplayMode === 'NET' ? (item.streams?.affitti?.net ?? item.affitti ?? 0) : (item.streams?.affitti?.gross ?? item.affitti ?? 0);
                const dividendi = taxDisplayMode === 'NET' ? (item.streams?.dividendi?.net ?? item.dividendi ?? 0) : (item.streams?.dividendi?.gross ?? item.dividendi ?? 0);
                const cap = includePrincipalRepayments ? (item.principalRepayments || 0) : 0;
                const debt = item.streams?.rateMutuo?.outflow ?? item.rateMutuo ?? 0;
                const net = (cedole + affitti + dividendi + cap) - debt;

                return (
                  <tr
                    key={item.year}
                    className={`hover:bg-slate-50 transition-colors ${item.isCurrent ? 'bg-indigo-50/40 font-semibold' : ''}`}
                  >
                    <td className="py-2.5 px-3 font-bold font-mono">
                      <div className="flex items-center gap-1.5">
                        <span>{item.year}</span>
                        {item.isCurrent && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[9px]">Oggi</span>
                        )}
                        {item.isPast && (
                          <span className="text-[9px] text-slate-400 font-normal">Storico</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700">+{formatCurrency(affitti)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-indigo-700">+{formatCurrency(cedole)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-purple-700">+{formatCurrency(dividendi)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-amber-600">
                      {cap > 0 ? `+${formatCurrency(cap)}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      +{formatCurrency(cedole + affitti + dividendi + cap)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-600">
                      -{formatCurrency(debt)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-extrabold text-slate-900 bg-slate-50/50">
                      {formatCurrency(net)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
