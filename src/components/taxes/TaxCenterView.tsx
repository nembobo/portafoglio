import React, { useState } from 'react';
import {
  Receipt,
  Percent,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Layers,
  FileDown,
  CheckCircle,
  Settings,
  HelpCircle,
  Info
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';
import { useWealth } from '../../context/WealthContext';
import { formatCurrency, formatPercent } from '../../utils/financialEngine';
import { CustomTaxRatesManager } from './CustomTaxRatesManager';

export const TaxCenterView: React.FC = () => {
  const {
    taxMetrics,
    taxProfile,
    updateTaxProfile,
    realizedGains,
    markTaxPaid,
    selectedYear,
    setSelectedYear,
    netWorth,
    afterTaxNetWorth,
    latentTaxLiability,
    showAfterTaxNetWorth,
    setShowAfterTaxNetWorth,
    filteredRentalContracts,
    filteredProperties,
    filteredAssets
  } = useWealth();

  const [activeSubTab, setActiveSubTab] = useState<'SUMMARY' | 'PROFILES' | 'REPORT'>('SUMMARY');
  const [editingTaxRates, setEditingTaxRates] = useState(false);
  const [tempProfile, setTempProfile] = useState(taxProfile);

  // Breakdown Chart data
  const taxBreakdownData = [
    { name: 'Affitti Immobiliari', value: taxMetrics.taxesBreakdown.affitti, color: '#059669' },
    { name: 'Plusvalenze Realizzate', value: taxMetrics.taxesBreakdown.plusvalenze, color: '#2563eb' },
    { name: 'Dividendi Azioni/ETF', value: taxMetrics.taxesBreakdown.dividendi, color: '#6366f1' },
    { name: 'Cedole BTP/Titoli Stato', value: taxMetrics.taxesBreakdown.cedole, color: '#d97706' },
    { name: 'Interessi Bancari', value: taxMetrics.taxesBreakdown.interessi, color: '#10b981' }
  ].filter(i => i.value > 0);

  const handleSaveTaxRates = () => {
    updateTaxProfile(tempProfile);
    setEditingTaxRates(false);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
              Tax Engine & Fiscal Optimization
            </span>
            <span className="text-xs text-slate-500">Anno Fiscale: <strong className="text-slate-800">{selectedYear}</strong></span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Report Fiscale & Pianificazione Imposte
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Calcolo automatico imposte su cedole, dividendi, affitti e plusvalenze (Lordo → Tasse → Netto).
          </p>
        </div>

        {/* Year Selector */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          {[2025, 2026, 2027, 2028].map(yr => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                selectedYear === yr ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {/* Tax Disclaimer Banner */}
      <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 flex items-start gap-3 text-xs text-slate-600 leading-relaxed">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <strong>Nota di conformità:</strong> Questo sistema è uno strumento avanzato di tracciamento, simulazione economica e reporting patrimoniale. Non costituisce parere o consulenza tributaria ufficiale. Le aliquote e le deduzioni sono personalizzabili in base al profilo del contribuente.
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1 overflow-x-auto">
        {[
          { id: 'SUMMARY', label: 'Riepilogo Fiscale' },
          { id: 'PROFILES', label: 'Aliquote & Profili Fiscali' },
          { id: 'REPORT', label: 'Report Fiscale Annuale' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              activeSubTab === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUBTAB 1: SUMMARY */}
      {activeSubTab === 'SUMMARY' && (
        <div className="space-y-6">
          {/* Top 4 Fiscal KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Reddito Lordo Annuo
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {formatCurrency(taxMetrics.totalGrossIncome)}
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Affitti + Cedole + Dividendi + Gain
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Imposte Totali Maturate
              </div>
              <div className="text-2xl font-bold text-rose-600 mt-1">
                {formatCurrency(taxMetrics.totalTaxesAccrued)}
              </div>
              <div className="text-xs text-rose-600 font-semibold mt-2">
                Aliquota Media Effettiva: {formatPercent(taxMetrics.effectiveTaxRate)}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Reddito Netto Disponibile
              </div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">
                {formatCurrency(taxMetrics.totalNetIncome)}
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Disponibile al netto di tutte le imposte
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Imposte Versate vs a Debito
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {formatCurrency(taxMetrics.taxesPayable)}
                <span className="text-xs font-normal text-slate-500 ml-1">da versare</span>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Già versate/trattenute: <strong className="text-slate-800">{formatCurrency(taxMetrics.taxesPaid)}</strong>
              </div>
            </div>
          </div>

          {/* Tri-level Concept Example Box (Requirement from Prompt) */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-xs">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
              Principio Fondamentale: LORDO → TASSE → NETTO
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-800 pt-2">
              <div className="pt-2 md:pt-0 md:pr-4">
                <div className="text-xs text-slate-400 font-medium">Affitti Immobiliari</div>
                <div className="text-base font-bold text-white mt-1">€80.400</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  → <span className="text-rose-400">-€19.020 tasse</span> → <span className="text-emerald-400 font-semibold">€61.380 netto</span>
                </div>
              </div>

              <div className="pt-2 md:pt-0 md:px-4">
                <div className="text-xs text-slate-400 font-medium">Cedole BTP (12.5%)</div>
                <div className="text-base font-bold text-white mt-1">€12.000</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  → <span className="text-rose-400">-€1.500 tasse</span> → <span className="text-emerald-400 font-semibold">€10.500 netto</span>
                </div>
              </div>

              <div className="pt-2 md:pt-0 md:px-4">
                <div className="text-xs text-slate-400 font-medium">Dividendi (26%)</div>
                <div className="text-base font-bold text-white mt-1">€4.800</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  → <span className="text-rose-400">-€1.248 tasse</span> → <span className="text-emerald-400 font-semibold">€3.552 netto</span>
                </div>
              </div>

              <div className="pt-2 md:pt-0 md:pl-4">
                <div className="text-xs text-slate-400 font-medium">Plusvalenze (26%)</div>
                <div className="text-base font-bold text-white mt-1">€20.000</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  → <span className="text-rose-400">-€5.200 tasse</span> → <span className="text-emerald-400 font-semibold">€14.800 netto</span>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Chart & Realized Gains Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Tax Breakdown Chart */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  Breakdown delle Imposte per Categoria
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Suddivisione delle imposte dovute sulle diverse tipologie di reddito
                </p>

                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taxBreakdownData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {taxBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => [formatCurrency(Number(val)), 'Imposta']}
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderRadius: '12px',
                          color: '#fff',
                          border: 'none',
                          fontSize: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                {taxBreakdownData.map(item => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600 font-medium truncate max-w-[140px]">{item.name}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Realized Capital Gains & Losses Log (2 Columns) */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Plusvalenze e Minusvalenze Realizzate ({selectedYear})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Vendite chiuse con calcolo prezzo vendita, costo fiscale e imposta dovuta
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[9px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Data</th>
                      <th className="py-2.5 px-3">Strumento</th>
                      <th className="py-2.5 px-3 text-right">Prezzo Vendita</th>
                      <th className="py-2.5 px-3 text-right">Costo Fiscale</th>
                      <th className="py-2.5 px-3 text-right">Plus/Minus</th>
                      <th className="py-2.5 px-3 text-right">Aliquota</th>
                      <th className="py-2.5 px-3 text-right">Imposta</th>
                      <th className="py-2.5 px-3 text-right">Netto</th>
                      <th className="py-2.5 px-3 text-center">Stato Imposta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {realizedGains.map(gain => (
                      <tr key={gain.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 text-slate-500">{gain.saleDate}</td>
                        <td className="py-3 px-3 font-sans font-bold text-slate-900">{gain.assetName}</td>
                        <td className="py-3 px-3 text-right font-medium text-slate-900">{formatCurrency(gain.salePrice)}</td>
                        <td className="py-3 px-3 text-right text-slate-400">{formatCurrency(gain.purchasePrice)}</td>
                        <td className={`py-3 px-3 text-right font-bold ${gain.gainGross >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {gain.gainGross >= 0 ? '+' : ''}{formatCurrency(gain.gainGross)}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-700">{formatPercent(gain.taxRate)}</td>
                        <td className="py-3 px-3 text-right text-rose-600">-{formatCurrency(gain.taxDue)}</td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-600">+{formatCurrency(gain.gainNet)}</td>
                        <td className="py-3 px-3 text-center">
                          {gain.taxPaid ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 font-sans">
                              Versata
                            </span>
                          ) : (
                            <button
                              onClick={() => markTaxPaid(gain.id)}
                              className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 hover:bg-emerald-600 hover:text-white font-sans transition-colors"
                              title="Segna come versata ad Agenzia Entrate"
                            >
                              Da Versare
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: PROFILES */}
      {activeSubTab === 'PROFILES' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Profilo Fiscale Globale & Aliquote Personalizzabili
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Gerarchia: Global Tax Profile → Asset Class Tax Rule → Individual Asset Override.
              </p>
            </div>

            {editingTaxRates ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingTaxRates(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSaveTaxRates}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Salva Aliquote
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTempProfile(taxProfile);
                  setEditingTaxRates(true);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Modifica Aliquote
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <label className="text-xs font-bold text-slate-900 block mb-1">Plusvalenze Azioni & Dividendi</label>
              {editingTaxRates ? (
                <input
                  type="number"
                  step="0.01"
                  value={tempProfile.stockGainRate}
                  onChange={e => setTempProfile({ ...tempProfile, stockGainRate: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <div className="text-lg font-bold font-mono text-slate-900">
                  {formatPercent(taxProfile.stockGainRate)}
                </div>
              )}
              <span className="text-[11px] text-slate-400">Regime standard capital gain italiano</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <label className="text-xs font-bold text-slate-900 block mb-1">Titoli di Stato & BTP (Whitelist)</label>
              {editingTaxRates ? (
                <input
                  type="number"
                  step="0.005"
                  value={tempProfile.govBondRate}
                  onChange={e => setTempProfile({ ...tempProfile, govBondRate: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <div className="text-lg font-bold font-mono text-indigo-700">
                  {formatPercent(taxProfile.govBondRate)}
                </div>
              )}
              <span className="text-[11px] text-slate-400">Aliquota agevolata BTP, BOT, CCT</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <label className="text-xs font-bold text-slate-900 block mb-1">Locazioni ad Uso Abitativo (Cedolare Secca)</label>
              {editingTaxRates ? (
                <input
                  type="number"
                  step="0.01"
                  value={tempProfile.rentalCedolareSeccaRate}
                  onChange={e => setTempProfile({ ...tempProfile, rentalCedolareSeccaRate: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <div className="text-lg font-bold font-mono text-emerald-600">
                  {formatPercent(taxProfile.rentalCedolareSeccaRate)}
                </div>
              )}
              <span className="text-[11px] text-slate-400">Cedolare secca canone concordato/libero</span>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <CustomTaxRatesManager />
          </div>
        </div>
      )}

      {/* SUBTAB 4: FISCAL REPORT */}
      {activeSubTab === 'REPORT' && (() => {
        // Dynamic aggregations based on portfolio data
        let realGrossRent = 0;
        let realTaxRent = 0;
        let realPropExpenses = 0;
        filteredRentalContracts.filter(r => r.active).forEach(r => {
          const annualRent = r.monthlyRent * 12;
          const rate = r.taxRate || 0.21;
          realGrossRent += annualRent;
          realTaxRent += annualRent * rate;
        });
        filteredProperties.forEach(p => {
          if (Array.isArray(p.expenses)) {
            realPropExpenses += p.expenses.reduce((s, e) => s + (e.frequency === 'MONTHLY' ? e.amount * 12 : e.amount), 0);
          } else {
            realPropExpenses += p.annualExpenses || 0;
          }
        });
        const realNetRent = Math.max(0, realGrossRent - realTaxRent - realPropExpenses);

        let realGrossCoupon = 0;
        let realTaxCoupon = 0;
        filteredAssets.filter(a => a.isBond && (a.nominalValue || a.quantity) && a.annualCouponRate).forEach(b => {
          const nom = b.nominalValue || (b.quantity * (b.currentPrice > 10 ? b.currentPrice : 100)) || 0;
          const annualVal = nom * (b.annualCouponRate || 0);
          const rate = b.taxRate || 0.125;
          realGrossCoupon += annualVal;
          realTaxCoupon += annualVal * rate;
        });
        const realNetCoupon = realGrossCoupon - realTaxCoupon;

        let realGrossDiv = 0;
        let realTaxDiv = 0;
        filteredAssets.filter(a => a.dividendPerShare && a.quantity).forEach(s => {
          const annualVal = (s.dividendPerShare || 0) * s.quantity;
          const rate = s.taxRate || 0.26;
          realGrossDiv += annualVal;
          realTaxDiv += annualVal * rate;
        });
        const realNetDiv = realGrossDiv - realTaxDiv;

        const realGrossPlus = realizedGains.filter(g => g.gainGross > 0).reduce((sum, g) => sum + g.gainGross, 0);
        const realTaxPlus = realizedGains.reduce((sum, g) => sum + g.taxDue, 0);
        const realNetPlus = realGrossPlus - realTaxPlus;

        const totalConsolidatedGross = realGrossRent + realGrossCoupon + realGrossDiv + realGrossPlus;
        const totalConsolidatedTax = realTaxRent + realTaxCoupon + realTaxDiv + realTaxPlus;
        const totalConsolidatedNet = realNetRent + realNetCoupon + realNetDiv + realNetPlus;
        const weightedTaxRate = totalConsolidatedGross > 0 ? (totalConsolidatedTax / totalConsolidatedGross) * 100 : 0;

        return (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Prospetto Fiscale Consolidato - Anno {selectedYear}</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    Modello Redditi PF / 730
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Riepilogo ordinato in colonne per Quadri Fiscali (RL Fabbricati, RM Capitale, RT Plusvalenze).
                </p>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <FileDown className="w-4 h-4" />
                <span>Esporta PDF / Stampa</span>
              </button>
            </div>

            {/* KPI Cards di Sintesi */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400 font-sans">Lordo Imponibile Totale</div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{formatCurrency(totalConsolidatedGross)}</div>
              </div>
              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/80">
                <div className="text-[10px] uppercase font-bold text-rose-600 font-sans">Imposte / Ritenute Totali</div>
                <div className="text-lg font-bold text-rose-700 mt-0.5">-{formatCurrency(totalConsolidatedTax)}</div>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80">
                <div className="text-[10px] uppercase font-bold text-emerald-600 font-sans">Netto Incassato Consolidato</div>
                <div className="text-lg font-bold text-emerald-700 mt-0.5">{formatCurrency(totalConsolidatedNet)}</div>
              </div>
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200/80">
                <div className="text-[10px] uppercase font-bold text-indigo-600 font-sans">Aliquota Media Effettiva</div>
                <div className="text-lg font-bold text-indigo-700 mt-0.5">{weightedTaxRate.toFixed(1)}%</div>
              </div>
            </div>

            {/* TABELLA 1: QUADRI FISCALI CONSOLIDATI (PERFETTAMENTE IN COLONNA) */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Tabella Generale Quadri Fiscali
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse font-sans">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Quadro Fiscale</th>
                      <th className="py-3 px-4">Tipologia di Reddito</th>
                      <th className="py-3 px-4 text-right">Lordo Annuo</th>
                      <th className="py-3 px-4 text-center">Aliquota / Regime</th>
                      <th className="py-3 px-4 text-right">Imposta Dovuta</th>
                      <th className="py-3 px-4 text-right">Netto Incassato</th>
                      <th className="py-3 px-4 text-center">Modalità Versamento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {/* Quadro RL - Affitti */}
                    <tr className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px]">
                          QUADRO RL
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">Redditi da Fabbricati (Locazioni)</div>
                        <div className="text-[10px] text-slate-400">
                          {filteredProperties.length} immobili registrati • Spese dedotte: -{formatCurrency(realPropExpenses)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                        {formatCurrency(realGrossRent)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
                          21.0% / Cedolare
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600">
                        -{formatCurrency(realTaxRent)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                        {formatCurrency(realNetRent)}
                      </td>
                      <td className="py-3.5 px-4 text-center text-[11px] text-slate-500 whitespace-nowrap">
                        F24 Acconto / Saldo
                      </td>
                    </tr>

                    {/* Quadro RM - Cedole BTP Whitelist */}
                    <tr className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[10px]">
                          QUADRO RM
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">Cedole Titoli di Stato & BTP (Whitelist)</div>
                        <div className="text-[10px] text-slate-400">Obbligazioni governative ed equiparate UE</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                        {formatCurrency(realGrossCoupon)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-mono text-[11px] font-bold border border-amber-200">
                          12.5% Agevolata
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600">
                        -{formatCurrency(realTaxCoupon)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                        {formatCurrency(realNetCoupon)}
                      </td>
                      <td className="py-3.5 px-4 text-center text-[11px] text-slate-500 whitespace-nowrap">
                        Ritenuta alla fonte
                      </td>
                    </tr>

                    {/* Quadro RM - Dividendi Azionari */}
                    <tr className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono text-[10px]">
                          QUADRO RM
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">Dividendi Azioni ed ETF</div>
                        <div className="text-[10px] text-slate-400">Proventi azionari ordinari</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                        {formatCurrency(realGrossDiv)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
                          26.0% Standard
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600">
                        -{formatCurrency(realTaxDiv)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                        {formatCurrency(realNetDiv)}
                      </td>
                      <td className="py-3.5 px-4 text-center text-[11px] text-slate-500 whitespace-nowrap">
                        Ritenuta alla fonte
                      </td>
                    </tr>

                    {/* Quadro RT - Plusvalenze Capital Gain */}
                    <tr className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[10px]">
                          QUADRO RT
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">Plusvalenze Realizzate (Capital Gain)</div>
                        <div className="text-[10px] text-slate-400">Cessioni a titolo oneroso di titoli e quote</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                        {formatCurrency(realGrossPlus)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
                          26.0% / Compensazione
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600">
                        -{formatCurrency(realTaxPlus)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                        {formatCurrency(realNetPlus)}
                      </td>
                      <td className="py-3.5 px-4 text-center text-[11px] text-slate-500 whitespace-nowrap">
                        F24 / Regime Amm.
                      </td>
                    </tr>
                  </tbody>

                  {/* TFOOT: RIGA DEI TOTALI PERFETTAMENTE ALLINEATA */}
                  <tfoot>
                    <tr className="bg-slate-100/90 border-t-2 border-slate-300 font-bold text-slate-900">
                      <td colSpan={2} className="py-3.5 px-4 uppercase tracking-wider text-xs">
                        TOTALE DICHIARATO ANNUALE ({selectedYear})
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-sm">
                        {formatCurrency(totalConsolidatedGross)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-indigo-700">
                        {weightedTaxRate.toFixed(1)}% medio
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-sm text-rose-600">
                        -{formatCurrency(totalConsolidatedTax)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-sm text-emerald-700">
                        {formatCurrency(totalConsolidatedNet)}
                      </td>
                      <td className="py-3.5 px-4 text-center text-[10px] text-slate-400">
                        Consolidato
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* TABELLA 2: DETTAGLIO ANALITICO PER IMMOBILE (QUADRO RL) */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Dettaglio Fiscale Analitico Immobili (Quadro RL)
                </h3>
                <span className="text-[11px] text-slate-500">
                  {filteredProperties.length} Immobili a reddito
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse font-sans">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Immobile</th>
                      <th className="py-3 px-4">Indirizzo & Città</th>
                      <th className="py-3 px-4">Inquilino</th>
                      <th className="py-3 px-4 text-right">Canone Lordo Annuo</th>
                      <th className="py-3 px-4 text-right">Spese Dedotte</th>
                      <th className="py-3 px-4 text-center">Aliquota Fiscale</th>
                      <th className="py-3 px-4 text-right">Imposta Cedolare/Ord.</th>
                      <th className="py-3 px-4 text-right">Netto Reale Annuo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProperties.map(prop => {
                      const contract = filteredRentalContracts.find(c => c.propertyId === prop.id && c.active);
                      const gross = contract ? contract.monthlyRent * 12 : 0;
                      const taxRate = contract?.taxRate || prop.taxRate || 0.21;
                      const tax = gross * taxRate;
                      let expAnnual = 0;
                      if (Array.isArray(prop.expenses)) {
                        expAnnual = prop.expenses.reduce((s, e) => s + (e.frequency === 'MONTHLY' ? e.amount * 12 : e.amount), 0);
                      } else {
                        expAnnual = prop.annualExpenses || 0;
                      }
                      const net = Math.max(0, gross - tax - expAnnual);

                      return (
                        <tr key={prop.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-bold text-slate-900">{prop.name}</td>
                          <td className="py-3 px-4 text-slate-500">{prop.address}, {prop.city}</td>
                          <td className="py-3 px-4">
                            {contract ? (
                              <span className="font-medium text-slate-800">{contract.tenantName}</span>
                            ) : (
                              <span className="text-slate-400 italic">Nessun contratto</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                            {formatCurrency(gross)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-amber-700">
                            {expAnnual > 0 ? `-${formatCurrency(expAnnual)}` : '€0'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
                              {(taxRate * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                            {tax > 0 ? `-${formatCurrency(tax)}` : '€0'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                            {formatCurrency(net)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
