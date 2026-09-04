import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Building2,
  LineChart as ChartIcon,
  Landmark,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  Info,
  ChevronRight,
  Users,
  User,
  Check,
  Building
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { useWealth } from '../../context/WealthContext';
import {
  formatCurrency,
  formatPercent,
  generateNetWorthHistory
} from '../../utils/financialEngine';
import { MarketSyncBar } from './MarketSyncBar';
import { CashFlowForecastSection } from '../cashflow/CashFlowForecastSection';

export const DashboardView: React.FC = () => {
  const {
    netWorth,
    grossWealth,
    totalDebts,
    afterTaxNetWorth,
    showAfterTaxNetWorth,
    latentTaxLiability,
    taxDisplayMode,
    netWorthChangeAmount,
    netWorthChangePercent,
    financialPortfolioValue,
    realEstateTotalValue,
    realEstateNetEquity,
    alternativeAssetsTotal,
    companiesTotal,
    cashTotal,
    annualGrossPassiveIncome,
    annualNetPassiveIncome,
    annualPassiveTaxes,
    monthlyPassiveIncomeGross,
    monthlyPassiveIncomeNet,
    next30DaysEvents,
    overdueEvents,
    taxMetrics,
    filteredAssets,
    filteredProperties,
    filteredRentalContracts,
    filteredAccounts,
    filteredCompanies,
    filteredRegularIncomes,
    confirmEventReceived,
    setActiveTab,
    familyMembers,
    selectedOwnerId,
    setSelectedOwnerId,
    showFamilyConsolidated,
    assets,
    properties,
    accounts,
    alternatives
  } = useWealth();

  const [historyPeriod, setHistoryPeriod] = useState<'1M' | '3M' | 'YTD' | '1Y' | '5Y' | 'ALL'>('1Y');

  // Consolidated total for percentage calculation
  const totalOverallWealth = useMemo(() => {
    const finTot = assets.reduce((sum, a) => sum + a.quantity * a.currentPrice, 0);
    const propTot = properties.reduce((sum, p) => sum + p.currentValue, 0);
    const cashTot = accounts.reduce((sum, a) => sum + a.balance, 0);
    const altTot = alternatives.reduce((sum, a) => sum + a.currentValue, 0);
    return finTot + propTot + cashTot + altTot;
  }, [assets, properties, accounts, alternatives]);

  // Per-member total wealth calculation for switcher chips
  const memberWealthMap = useMemo(() => {
    const map = new Map<string, number>();
    familyMembers.filter(m => m.id !== 'mem-all').forEach(m => {
      const fin = assets.filter(a => a.ownerId === m.id).reduce((sum, a) => sum + a.quantity * a.currentPrice, 0);
      const prop = properties.filter(p => p.ownerId === m.id).reduce((sum, p) => sum + p.currentValue, 0);
      const cash = accounts.filter(a => a.ownerId === m.id).reduce((sum, a) => sum + a.balance, 0);
      const alt = alternatives.filter(a => a.ownerId === m.id).reduce((sum, a) => sum + a.currentValue, 0);
      map.set(m.id, fin + prop + cash + alt);
    });
    return map;
  }, [familyMembers, assets, properties, accounts, alternatives]);

  const activeMember = familyMembers.find(m => m.id === selectedOwnerId) || (selectedOwnerId === 'mem-all' ? {
    id: 'mem-all',
    name: 'Patrimonio Familiare (Consolidato)',
    role: 'Tutti i membri',
    avatarColor: '#4F46E5'
  } : null);

  const activeMemberTotal = selectedOwnerId === 'mem-all' ? totalOverallWealth : (memberWealthMap.get(selectedOwnerId) || grossWealth);
  const activeMemberPct = totalOverallWealth > 0 ? (activeMemberTotal / totalOverallWealth) * 100 : 100;

  // Chart data for Net Worth evolution
  const netWorthHistory = generateNetWorthHistory(
    taxDisplayMode === 'NET' ? afterTaxNetWorth : grossWealth,
    historyPeriod
  );

  // Dynamic Asset allocation based on live asset quotes
  const btpTotalValue = filteredAssets
    .filter(a => a.category === 'GOV_BOND' || a.isBond)
    .reduce((sum, a) => sum + a.quantity * a.currentPrice, 0);

  const stocksEtfTotalValue = filteredAssets
    .filter(a => a.category === 'STOCK' || a.category === 'ETF')
    .reduce((sum, a) => sum + a.quantity * a.currentPrice, 0);

  // Asset allocation pie data (only non-zero values)
  const allocationData = [
    { name: 'Immobili', value: realEstateTotalValue, color: '#10B981' },
    { name: 'Titoli di Stato & BTP', value: btpTotalValue, color: '#4F46E5' },
    { name: 'ETF & Azioni', value: stocksEtfTotalValue, color: '#6366F1' },
    { name: 'Partecipazioni & Holding', value: companiesTotal, color: '#F59E0B' },
    { name: 'Liquidità & Conti', value: cashTotal, color: '#06B6D4' },
    { name: 'Asset Alternativi', value: alternativeAssetsTotal, color: '#EC4899' }
  ].filter(item => item.value > 0);

  // 100% Dynamic Passive & Regular Income Streams breakdown
  const incomeStreamData = useMemo(() => {
    const streams: Array<{ category: string; gross: number; taxes: number; net: number }> = [];

    // 1. Affitti
    let affittiGross = 0;
    let affittiTax = 0;
    filteredRentalContracts.filter(r => r.active).forEach(r => {
      const annual = r.monthlyRent * 12;
      const rate = r.taxRate || 0.21;
      affittiGross += annual;
      affittiTax += annual * rate;
    });
    if (affittiGross > 0) {
      streams.push({
        category: 'Affitti Immobiliari',
        gross: Math.round(affittiGross),
        taxes: Math.round(affittiTax),
        net: Math.round(affittiGross - affittiTax)
      });
    }

    // 2. Cedole
    let cedoleGross = 0;
    let cedoleTax = 0;
    filteredAssets.filter(a => a.isBond && a.annualCouponRate).forEach(b => {
      const nominal = b.nominalValue || (b.quantity * 100);
      const annual = nominal * (b.annualCouponRate || 0);
      const rate = b.taxRate || 0.125;
      cedoleGross += annual;
      cedoleTax += annual * rate;
    });
    if (cedoleGross > 0) {
      streams.push({
        category: 'Cedole BTP / Obbligazioni',
        gross: Math.round(cedoleGross),
        taxes: Math.round(cedoleTax),
        net: Math.round(cedoleGross - cedoleTax)
      });
    }

    // 3. Dividendi
    let divGross = 0;
    let divTax = 0;
    filteredAssets.filter(a => !a.isBond && a.dividendPerShare && a.quantity).forEach(s => {
      const annual = (s.dividendPerShare || 0) * s.quantity;
      const rate = s.taxRate || 0.26;
      divGross += annual;
      divTax += annual * rate;
    });
    if (divGross > 0) {
      streams.push({
        category: 'Dividendi Azioni & ETF',
        gross: Math.round(divGross),
        taxes: Math.round(divTax),
        net: Math.round(divGross - divTax)
      });
    }

    // 4. Liquidità & Conti Deposito
    let liqGross = 0;
    let liqTax = 0;
    filteredAccounts.filter(a => a.interestRate && a.interestRate > 0).forEach(a => {
      const annual = a.balance * (a.interestRate || 0);
      const rate = a.taxRate !== undefined ? a.taxRate : 0.26;
      liqGross += annual;
      liqTax += annual * rate;
    });
    if (liqGross > 0) {
      streams.push({
        category: 'Interessi Liquidità & Depositi',
        gross: Math.round(liqGross),
        taxes: Math.round(liqTax),
        net: Math.round(liqGross - liqTax)
      });
    }

    // 5. Redditi da Lavoro / Ricorrenti
    let regGross = 0;
    let regNet = 0;
    filteredRegularIncomes.filter(r => r.active).forEach(r => {
      const mult = r.frequency === 'MONTHLY' ? (r.monthsCount || 12) : 1;
      const g = r.grossAmount * mult;
      const n = r.netAmount ? r.netAmount * mult : g * (1 - (r.taxRate || 0.28));
      regGross += g;
      regNet += n;
    });
    if (regGross > 0) {
      streams.push({
        category: 'Redditi da Lavoro / Ricorrenti',
        gross: Math.round(regGross),
        taxes: Math.round(regGross - regNet),
        net: Math.round(regNet)
      });
    }

    // 6. Partecipazioni Societarie
    if (companiesTotal > 0) {
      let compGross = 0;
      filteredCompanies.forEach(c => {
        compGross += c.dividendsReceivedYtd;
      });
      if (compGross > 0) {
        streams.push({
          category: 'Distribuzioni Societarie',
          gross: Math.round(compGross),
          taxes: 0,
          net: Math.round(compGross)
        });
      }
    }

    return streams;
  }, [filteredRentalContracts, filteredAssets, filteredAccounts, filteredRegularIncomes, filteredCompanies, companiesTotal]);

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Dynamic Family & Subject Filter Connection Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-2xs font-bold"
              style={{
                backgroundColor: activeMember?.avatarColor ? `${activeMember.avatarColor}15` : '#EEF2FF',
                color: activeMember?.avatarColor || '#4F46E5'
              }}
            >
              {selectedOwnerId === 'mem-all' ? '🏛️' : activeMember?.name.charAt(0) || '👤'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">
                  {activeMember?.name || 'Patrimonio Familiare'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {selectedOwnerId === 'mem-all' ? 'Tutti i conti consolidati' : activeMember?.role || 'Soggetto'}
                </span>
                {selectedOwnerId !== 'mem-all' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                    {activeMemberPct.toFixed(1)}% del totale
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedOwnerId === 'mem-all'
                  ? 'Visualizzazione consolidata: tutti i titoli, immobili, liquidità e redditi della famiglia.'
                  : `Visualizzazione filtrata per ${activeMember?.name}: ${filteredAssets.length} titoli, ${filteredProperties.length} immobili, ${filteredAccounts.length} conti.`}
              </p>
            </div>
          </div>

          {selectedOwnerId !== 'mem-all' && showFamilyConsolidated && (
            <button
              onClick={() => setSelectedOwnerId('mem-all')}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-indigo-600 border border-slate-200 hover:border-indigo-200 text-xs font-bold transition-all flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
            >
              <span>🏛️ Vista Consolidata Familiare</span>
            </button>
          )}
        </div>

        {/* Quick-Switch Selector Chips */}
        <div className="flex items-center gap-2 pt-3 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Filtra Soggetto:
          </span>

          {showFamilyConsolidated && (
            <button
              onClick={() => setSelectedOwnerId('mem-all')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedOwnerId === 'mem-all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
              }`}
            >
              <span>🏛️ Tutti (Consolidato)</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                selectedOwnerId === 'mem-all' ? 'bg-indigo-700 text-white' : 'bg-slate-200/70 text-slate-700'
              }`}>
                {formatCurrency(totalOverallWealth)}
              </span>
            </button>
          )}

          {familyMembers
            .filter(m => m.id !== 'mem-all')
            .map(m => {
              const isSelected = selectedOwnerId === m.id;
              const val = memberWealthMap.get(m.id) || 0;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedOwnerId(m.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-md flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                    style={{ backgroundColor: m.avatarColor || '#6366F1' }}
                  >
                    {m.name.charAt(0)}
                  </span>
                  <span>{m.name}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                    isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-200/70 text-slate-700'
                  }`}>
                    {formatCurrency(val)}
                  </span>
                </button>
              );
            })}
        </div>
      </div>

      {/* 4 Essential Summary Cards - Sleek Interface Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {taxDisplayMode === 'NET' ? 'Patrimonio Netto Effettivo' : 'Patrimonio Lordo Attivi'}
            </p>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              taxDisplayMode === 'NET' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
            }`}>
              {taxDisplayMode === 'NET' ? 'NETTO' : 'LORDO'}
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {formatCurrency(taxDisplayMode === 'NET' ? afterTaxNetWorth : grossWealth)}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-1">
            {taxDisplayMode === 'NET'
              ? `Dedotte imposte latenti (-${formatCurrency(latentTaxLiability)})`
              : 'Totale asset, immobili e liquidità lordi'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Azioni, ETF & BTP (Live Yahoo)
          </p>
          <p className="text-2xl font-bold text-indigo-700 font-mono">
            {formatCurrency(financialPortfolioValue)}
          </p>
          <p className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Prezzi real-time da Yahoo Finance</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {taxDisplayMode === 'NET' ? 'Flussi Passivi Netti' : 'Flussi Passivi Lordi'}
            </p>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              taxDisplayMode === 'NET' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
            }`}>
              {taxDisplayMode === 'NET' ? 'NETTO' : 'LORDO'}
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {formatCurrency(taxDisplayMode === 'NET' ? annualNetPassiveIncome : annualGrossPassiveIncome)}
          </p>
          <p className="text-xs font-medium text-indigo-600 mt-1">
            Media: {formatCurrency(taxDisplayMode === 'NET' ? monthlyPassiveIncomeNet : monthlyPassiveIncomeGross)} / mese
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs border-l-4 border-l-indigo-600">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tassazione Stimata</p>
          <p className="text-2xl font-bold text-slate-900">{formatPercent(taxMetrics.effectiveTaxRate)}</p>
          <p className="text-xs font-medium text-amber-600 mt-1 flex items-center justify-between">
            <span>Tasse annue: {formatCurrency(annualPassiveTaxes)}</span>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-slate-400 hover:text-indigo-600 underline cursor-pointer text-[11px]"
            >
              Report Fiscale
            </button>
          </p>
        </div>
      </div>

      {/* Online Market Feeds & Asset Quotes Syncer */}
      <MarketSyncBar />

      {/* Overdue Items Alert Banner (if any) */}
      {overdueEvents.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">
                {overdueEvents.length} Canone di Affitto in Ritardo rispetto alla data prevista!
              </div>
              <div className="text-xs text-slate-600">
                {overdueEvents[0].title} previsto per il {overdueEvents[0].date}. Importo: {formatCurrency(overdueEvents[0].grossAmount)}.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => confirmEventReceived(overdueEvents[0].id)}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs shadow-indigo-100"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Conferma Incasso Ora</span>
            </button>
            <button
              onClick={() => setActiveTab('realestate')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
            >
              Vedi Dettagli
            </button>
          </div>
        </div>
      )}

      {/* Net Worth Evolution Chart & Asset Allocation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Net Worth History Chart (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Performance Storica</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Evoluzione consolidata del patrimonio e imposte latenti
              </p>
            </div>

            {/* Timeframe Selectors */}
            <div className="flex items-center bg-slate-50 p-1 rounded-lg border border-slate-200 gap-1">
              {(['1M', '3M', 'YTD', '1Y', '5Y', 'ALL'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setHistoryPeriod(p)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded transition-colors ${
                    historyPeriod === p
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={netWorthHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="afterTaxGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} stroke="#E2E8F0" />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  stroke="#E2E8F0"
                  tickFormatter={val => `€${(val / 1000).toFixed(0)}k`}
                  domain={['dataMin - 50000', 'dataMax + 50000']}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), '']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '10px',
                    color: '#F8FAFC',
                    border: '1px solid #1E293B',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Patrimonio Netto"
                  stroke="#4F46E5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#netWorthGrad)"
                />
                {showAfterTaxNetWorth && (
                  <Area
                    type="monotone"
                    dataKey="afterTax"
                    name="After-Tax Net Worth"
                    stroke="#10B981"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#afterTaxGrad)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
              <span className="font-medium">Patrimonio Netto (Standard)</span>
            </div>
            {showAfterTaxNetWorth && (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full border border-dashed border-emerald-500 inline-block" />
                <span className="font-medium">After-Tax Net Worth (al netto di imposte latenti)</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Asset Allocation Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Asset Allocation</h2>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                {formatCurrency(grossWealth)}
              </span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Valore']}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '10px',
                      color: '#F8FAFC',
                      border: '1px solid #1E293B',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
            {allocationData.map(item => {
              const pct = (item.value / grossWealth) * 100;
              return (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 font-medium truncate max-w-[140px]">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-slate-800">{formatCurrency(item.value)}</span>
                    <span className="text-slate-400 w-10 text-right">{pct.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Multi-Year Cash Flow Forecasting: Past and Future */}
      <CashFlowForecastSection />

      {/* Upcoming Inflows & Cash Flow Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next 30 Days Cash Inflows (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Upcoming Cash Flow (Next 30d)</h3>
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-[10px] sm:text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
            >
              View Calendar →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Data</th>
                  <th className="py-2.5 px-4">Descrizione</th>
                  <th className="py-2.5 px-4">Categoria</th>
                  <th className="py-2.5 px-4 text-right">Lordo</th>
                  <th className="py-2.5 px-4 text-right">Tasse</th>
                  <th className="py-2.5 px-4 text-right">Netto</th>
                  <th className="py-2.5 px-4 text-center">Stato</th>
                  <th className="py-2.5 px-4 text-right">Azione</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {next30DaysEvents.slice(0, 5).map(event => {
                  const parts = event.date.split('-');
                  const monthNames = ['', 'GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'];
                  const month = parts[1] ? monthNames[parseInt(parts[1], 10)] : 'MAR';
                  const day = parts[2] || '01';

                  return (
                    <tr key={event.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-white flex flex-col items-center justify-center border border-slate-200 shadow-2xs">
                            <span className="text-[8px] font-bold text-slate-400">{month}</span>
                            <span className="text-xs font-bold leading-none text-slate-800">{day}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div>{event.title}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{event.sourceAssetName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                          event.category === 'AFFITTO' ? 'bg-emerald-50 text-emerald-700' :
                          event.category === 'CEDOLA' ? 'bg-indigo-50 text-indigo-700' :
                          event.category === 'DIVIDENDO' ? 'bg-purple-50 text-purple-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {event.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        +{formatCurrency(event.grossAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-rose-600">
                        -{formatCurrency(event.taxAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                        +{formatCurrency(event.netAmount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          event.status === 'RICEVUTA' ? 'bg-emerald-50 text-emerald-700' :
                          event.status === 'IN_RITARDO' ? 'bg-amber-50 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {event.status !== 'RICEVUTA' && (
                          <button
                            onClick={() => confirmEventReceived(event.id)}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 font-medium text-[10px] transition-colors"
                            title="Conferma incasso manuale"
                          >
                            Conferma
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Passive Income Breakdown Tri-Level (1 Column) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Reddito Passivo Annuo</h2>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                Lordo → Netto
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Ripartizione per fonte: affitti, cedole, dividendi e distribuzioni holding.
            </p>

            <div className="space-y-3">
              {incomeStreamData.map(stream => (
                <div key={stream.category} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                    <span>{stream.category}</span>
                    <span className="text-emerald-600 font-mono font-bold">
                      Netto: {formatCurrency(stream.net)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Lordo: {formatCurrency(stream.gross)}</span>
                    <span className="text-rose-600">Tasse: -{formatCurrency(stream.taxes)}</span>
                  </div>
                  {/* Visual ratio bar */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden flex">
                    <div
                      className="bg-indigo-600 h-full"
                      style={{ width: `${(stream.net / stream.gross) * 100}%` }}
                      title="Netto"
                    />
                    <div
                      className="bg-rose-500 h-full"
                      style={{ width: `${(stream.taxes / stream.gross) * 100}%` }}
                      title="Tasse"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600">Aliquota Media Effettiva:</span>
            <span className="font-bold text-slate-900 font-mono text-sm">
              {formatPercent(taxMetrics.effectiveTaxRate)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
