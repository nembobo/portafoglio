import React, { useMemo } from 'react';
import {
  Calendar,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useWealth } from '../../context/WealthContext';
import { formatCurrency } from '../../utils/financialEngine';
import { generateMonthlyCashFlowForYear } from '../../utils/cashFlowForecaster';

export const CashFlowView: React.FC = () => {
  const {
    selectedYear,
    setSelectedYear,
    taxDisplayMode,
    setTaxDisplayMode,
    filteredAssets,
    filteredProperties,
    filteredRentalContracts,
    filteredLiabilities,
    filteredAccounts,
    filteredRegularIncomes
  } = useWealth();

  // Dynamic Cash Flow for the selected year (100% synchronized with actual database data)
  const monthlyData = useMemo(() => {
    return generateMonthlyCashFlowForYear(
      selectedYear,
      filteredAssets,
      filteredProperties,
      filteredRentalContracts,
      filteredLiabilities,
      filteredAccounts,
      filteredRegularIncomes,
      taxDisplayMode
    );
  }, [
    selectedYear,
    filteredAssets,
    filteredProperties,
    filteredRentalContracts,
    filteredLiabilities,
    filteredAccounts,
    filteredRegularIncomes,
    taxDisplayMode
  ]);

  // Aggregate stats
  const totalInflow = monthlyData.reduce(
    (sum, m) => sum + (taxDisplayMode === 'NET' ? m.entrateNette : m.entrateLorde),
    0
  );
  const totalOutflow = monthlyData.reduce((sum, m) => sum + m.uscite, 0);
  const totalTaxes = monthlyData.reduce((sum, m) => sum + m.tasse, 0);
  const netCashFlow = totalInflow - totalOutflow;
  const monthlyAverage = netCashFlow / 12;

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ArrowUpDown className="w-6 h-6 text-indigo-600" />
            <span>Flussi di Cassa (Cash Flow)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Evoluzione mensile delle entrate (cedole, affitti, dividendi, liquidità remunerata) e uscite operative.
          </p>
        </div>

        {/* View Controls & Year Picker */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Year Selector */}
          <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1 shadow-2xs">
            {[2025, 2026, 2027].map(yr => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedYear === yr
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>

          {/* Net vs Gross Toggle */}
          <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1 shadow-2xs">
            <button
              onClick={() => setTaxDisplayMode('NET')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                taxDisplayMode === 'NET'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Netto
            </button>
            <button
              onClick={() => setTaxDisplayMode('GROSS')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                taxDisplayMode === 'GROSS'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Lordo
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Entrate Totali {selectedYear} {taxDisplayMode === 'NET' ? '(Nette)' : '(Lorde)'}
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">
            +{formatCurrency(totalInflow)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Ritenute fiscali stimate: <strong className="text-rose-600 font-mono">-{formatCurrency(totalTaxes)}</strong>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Uscite Totali {selectedYear}
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-1 font-mono">
            -{formatCurrency(totalOutflow)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            {totalOutflow === 0 ? 'Nessuna passività programmata' : 'Rate mutui & spese di gestione'}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Cash Flow Netto {selectedYear}
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            +{formatCurrency(netCashFlow)}
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-2">
            Surplus operativo netto annuo
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Media Mensile Netta
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            +{formatCurrency(monthlyAverage)}
            <span className="text-xs text-slate-500 font-normal ml-1">/ mese</span>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Liquidità generata al mese
          </div>
        </div>
      </div>

      {/* Main Cash Flow Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Grafico Evoluzione Mensile {selectedYear}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Rappresentazione mensile delle entrate e uscite operative sincronizzate in tempo reale.
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Modalità: <span className="text-slate-900 font-bold">{taxDisplayMode === 'NET' ? 'Netto di Imposta' : 'Lordo'}</span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748B' }}
                stroke="#E2E8F0"
                tickFormatter={val => `€${(val / 1000).toFixed(1)}k`}
              />
              <Tooltip
                formatter={(val: any) => [formatCurrency(Number(val)), '']}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderRadius: '12px',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
              <Bar
                dataKey={taxDisplayMode === 'NET' ? 'entrateNette' : 'entrateLorde'}
                name={taxDisplayMode === 'NET' ? 'Entrate Nette' : 'Entrate Lorde'}
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              />
              {totalOutflow > 0 && (
                <Bar
                  dataKey="uscite"
                  name="Uscite Operative"
                  fill="#F43F5E"
                  radius={[4, 4, 0, 0]}
                />
              )}
              {taxDisplayMode === 'GROSS' && totalTaxes > 0 && (
                <Bar
                  dataKey="tasse"
                  name="Ritenute Fiscali"
                  fill="#F59E0B"
                  radius={[4, 4, 0, 0]}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
