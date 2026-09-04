import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Home,
  FileText,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Percent,
  TrendingUp,
  Receipt,
  ShieldAlert,
  ArrowRight,
  Sliders,
  Settings2,
  Link2,
  Sparkles,
  Calculator,
  Trash2
} from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { Property, RentalContract } from '../../types';
import { formatCurrency, formatPercent } from '../../utils/financialEngine';
import {
  calculatePropertyCashFlowAndYield,
  calculatePropertyTotalAnnualExpenses,
  EXPENSE_FREQUENCY_LABELS
} from '../../utils/propertyExpenseUtils';
import { PropertyExpensesModal } from './PropertyExpensesModal';

export const RealEstateView: React.FC<{ onOpenAddModal: () => void }> = ({ onOpenAddModal }) => {
  const {
    filteredProperties,
    filteredRentalContracts,
    confirmEventReceived,
    events,
    customTaxRates,
    updateRentalContract,
    deleteProperty,
    setActiveTab
  } = useWealth();

  const [editingContractTaxId, setEditingContractTaxId] = useState<string | null>(null);
  const [selectedPropertyForExpenses, setSelectedPropertyForExpenses] = useState<Property | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [rentViewMode, setRentViewMode] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');

  // Property values
  const totalValue = filteredProperties.reduce((sum, p) => sum + p.currentValue, 0);
  const totalPurchaseValue = filteredProperties.reduce((sum, p) => sum + p.purchaseValue, 0);
  const totalGain = totalValue - totalPurchaseValue;

  // Annual and monthly aggregated expenses across all properties
  const totalAnnualExpenses = filteredProperties.reduce((sum, p) => {
    return sum + calculatePropertyTotalAnnualExpenses(p);
  }, 0);
  const totalMonthlyExpenses = totalAnnualExpenses / 12;

  // Annual Rents & Taxes
  const activeContracts = filteredRentalContracts.filter(c => c.active);
  const totalAnnualRentGross = activeContracts.reduce((sum, c) => sum + c.monthlyRent * 12, 0);
  const totalAnnualRentTaxes = activeContracts.reduce((sum, c) => sum + c.monthlyRent * 12 * (c.taxRate || 0.21), 0);
  
  // Real Net Rent after taxes and after property expenses
  const totalAnnualRentNet = Math.max(0, totalAnnualRentGross - totalAnnualRentTaxes - totalAnnualExpenses);
  const totalMonthlyRentNet = totalAnnualRentNet / 12;

  // Average Gross & Net Yield
  const avgGrossYield = totalValue > 0 ? totalAnnualRentGross / totalValue : 0;
  const avgNetYield = totalValue > 0 ? totalAnnualRentNet / totalValue : 0;

  // Current property being edited in modal (refresh reference if modified)
  const currentModalProperty = selectedPropertyForExpenses
    ? filteredProperties.find(p => p.id === selectedPropertyForExpenses.id) || selectedPropertyForExpenses
    : null;

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Patrimonio Immobiliare & Gestione Affitti
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Controllo canoni automatici, visione mensile/annuale, gestione spese ricorrenti e calcolo dinamico del rendimento netto.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Monthly vs Annual View Switcher */}
          <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1 shadow-2xs">
            <button
              onClick={() => setRentViewMode('MONTHLY')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                rentViewMode === 'MONTHLY'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Visione Mensile
            </button>
            <button
              onClick={() => setRentViewMode('ANNUAL')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                rentViewMode === 'ANNUAL'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Visione Annuale
            </button>
          </div>

          <button
            onClick={() => setActiveTab('reports')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Percent className="w-3.5 h-3.5 text-indigo-600" />
            <span>Aliquote Fiscali</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs shadow-indigo-100 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuovo Immobile</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards - Completely free of debts/mortgages as requested */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Valore Immobili Totale
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {formatCurrency(totalValue)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Plusvalenza non realizzata: <strong className="text-emerald-600 font-mono">+{formatCurrency(totalGain)}</strong>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Spese Totali Immobili
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1 font-mono">
            {formatCurrency(totalAnnualExpenses)}
            <span className="text-xs font-normal text-slate-400 ml-1">/anno</span>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Impatto mensile: <strong className="text-amber-700 font-mono">-{formatCurrency(totalMonthlyExpenses)}/mese</strong>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Canoni Annui (Lordo & Netto)
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">
            +{formatCurrency(totalAnnualRentNet)}
            <span className="text-xs font-normal text-slate-500 ml-1">netto reale</span>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Lordo: <strong className="text-slate-800 font-mono">{formatCurrency(totalAnnualRentGross)}</strong> (Spese: -{formatCurrency(totalAnnualExpenses)})
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs border-l-4 border-l-indigo-600">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Rendimento da Locazione (Yield)
          </div>
          <div className="text-2xl font-bold text-indigo-700 mt-1 font-mono">
            {formatPercent(avgNetYield)} <span className="text-xs font-normal text-slate-500">Net Yield</span>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Gross Yield medio: <strong className="text-slate-800 font-mono">{formatPercent(avgGrossYield)}</strong>
          </div>
        </div>
      </div>

      {/* Properties List with Expense Configuration & Rental Yields */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide">
            Immobili in Portafoglio ({filteredProperties.length})
          </h2>
          <span className="text-xs text-slate-500">
            Fai clic su <strong>"Gestisci Spese"</strong> per aggiungere spese mensili, bimestrali o annuali
          </span>
        </div>

        {filteredProperties.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Nessun immobile nel portafoglio</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Non hai ancora registrato nessun immobile. Aggiungi il tuo primo immobile per monitorare valore di mercato, canoni di locazione e spese.
            </p>
            <button
              type="button"
              onClick={onOpenAddModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Aggiungi Immobile</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {filteredProperties.map(property => {
              const contract = filteredRentalContracts.find(c => c.propertyId === property.id && c.active);
              const cashFlow = calculatePropertyCashFlowAndYield(property, contract);
              const expensesList = property.expenses || [];

              // Pending rent event for this property
              const rentEvents = events.filter(e => e.category === 'AFFITTO' && e.sourceAssetId === property.id);
              const overdueEvent = rentEvents.find(e => e.status === 'IN_RITARDO');
              const nextEvent = rentEvents.find(e => e.status === 'PREVISTA');

              return (
                <div
                  key={property.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all"
                >
                  <div>
                    {/* Property Header */}
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                            {property.type.replace(/_/g, ' ')}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 mt-1">
                            {property.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {property.address}, {property.city} • {property.sqm} mq
                          </p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <div className="flex items-center gap-2">
                            <div className="text-lg font-bold text-slate-900 font-mono">
                              {formatCurrency(property.currentValue)}
                            </div>
                            <button
                              type="button"
                              onClick={() => setPropertyToDelete(property)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Rimuovi immobile dal portafoglio"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Acquisto: {formatCurrency(property.purchaseValue)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Property Expenses Quick Bar & Editor Trigger */}
                    <div className="p-4 bg-amber-50/40 border-b border-slate-100 text-xs flex items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-amber-900 flex items-center gap-1.5">
                          <Receipt className="w-3.5 h-3.5 text-amber-600" />
                          <span>Spese Immobile:</span>
                          <span className="font-mono">-{formatCurrency(cashFlow.annualExpenses)}/anno</span>
                        </div>
                        <div className="text-[11px] text-amber-700/80 font-mono mt-0.5">
                          Media mensile: -{formatCurrency(cashFlow.monthlyExpenses)}/mese ({expensesList.length} {expensesList.length === 1 ? 'voce' : 'voci'})
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedPropertyForExpenses(property)}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1 cursor-pointer active:scale-95 shrink-0"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Gestisci Spese ({expensesList.length})</span>
                      </button>
                    </div>

                    {/* Rental Contract Details */}
                    <div className="p-5 space-y-3.5 text-xs">
                      {contract ? (
                        <>
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <div>
                              <span className="text-slate-500 font-medium">Inquilino Attivo:</span>
                              <div className="font-bold text-slate-900">{contract.tenantName}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-emerald-600 font-mono">
                                {rentViewMode === 'ANNUAL'
                                  ? `+${formatCurrency(contract.monthlyRent * 12)}/anno`
                                  : `+${formatCurrency(contract.monthlyRent)}/mese`}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Giorno {contract.paymentDayOfMonth} • {contract.taxRegime === 'CEDOLARE_SECCA' ? 'Cedolare' : 'Ord.'} ({(contract.taxRate * 100).toFixed(1)}%)
                              </div>
                            </div>
                          </div>

                          {/* Quad-level Cashflow Breakdown: Lordo, Spese, Tasse, Netto Mese / Anno */}
                          <div className="grid grid-cols-4 gap-1.5 text-center p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 font-mono">
                            <div>
                              <div className="text-[8px] text-slate-400 uppercase font-sans font-bold">
                                {rentViewMode === 'ANNUAL' ? 'Lordo Anno' : 'Lordo'}
                              </div>
                              <div className="font-bold text-slate-900 text-[11px]">
                                {formatCurrency(rentViewMode === 'ANNUAL' ? cashFlow.grossAnnualRent : cashFlow.grossMonthlyRent)}
                              </div>
                            </div>
                            <div>
                              <div className="text-[8px] text-amber-600 uppercase font-sans font-bold">
                                {rentViewMode === 'ANNUAL' ? 'Spese Anno' : 'Spese'}
                              </div>
                              <div className="font-bold text-amber-600 text-[11px]">
                                -{formatCurrency(rentViewMode === 'ANNUAL' ? cashFlow.annualExpenses : cashFlow.monthlyExpenses)}
                              </div>
                            </div>
                            <div>
                              <div className="text-[8px] text-rose-600 uppercase font-sans font-bold">
                                {rentViewMode === 'ANNUAL' ? 'Tasse Anno' : 'Tasse'}
                              </div>
                              <div className="font-bold text-rose-600 text-[11px]">
                                -{formatCurrency(rentViewMode === 'ANNUAL' ? cashFlow.annualTaxes : cashFlow.monthlyTaxes)}
                              </div>
                            </div>
                            <div>
                              <div className="text-[8px] text-emerald-600 uppercase font-sans font-bold">
                                {rentViewMode === 'ANNUAL' ? 'Netto Anno' : 'Netto Mese'}
                              </div>
                              <div className={`font-bold text-[11px] ${
                                (rentViewMode === 'ANNUAL' ? cashFlow.netAnnual : cashFlow.netMonthly) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                              }`}>
                                {(rentViewMode === 'ANNUAL' ? cashFlow.netAnnual : cashFlow.netMonthly) >= 0 ? '+' : ''}
                                {formatCurrency(rentViewMode === 'ANNUAL' ? cashFlow.netAnnual : cashFlow.netMonthly)}
                              </div>
                            </div>
                          </div>

                          {/* Rental Yields: Gross vs Net Calculated Live */}
                          <div className="flex items-center justify-between text-xs pt-0.5 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                            <span className="text-slate-500">
                              Gross Yield: <strong className="text-slate-800 font-mono">{formatPercent(cashFlow.grossYield / 100)}</strong>
                            </span>
                            <span className="text-indigo-700 font-bold">
                              Net Yield Reale: <strong className="font-mono text-sm">{formatPercent(cashFlow.netYield / 100)}</strong>
                            </span>
                          </div>

                          {/* Interactive Tax Rate Selector */}
                          <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5 bg-slate-50/70 p-2 rounded-xl">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-700 flex items-center gap-1">
                                <Percent className="w-3 h-3 text-indigo-600" />
                                <span>Aliquota Fiscale Immobile:</span>
                              </span>
                              <span className="font-bold font-mono text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                {(contract.taxRate * 100).toFixed(1)}%
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <select
                                value={
                                  customTaxRates.find(r => Math.abs(r.rate - contract.taxRate) < 0.001)?.id || 'custom'
                                }
                                onChange={e => {
                                  const val = e.target.value;
                                  if (val === 'custom') {
                                    setEditingContractTaxId(contract.id);
                                  } else {
                                    const selectedRate = customTaxRates.find(r => r.id === val);
                                    if (selectedRate) {
                                      updateRentalContract(contract.id, {
                                        taxRate: selectedRate.rate,
                                        taxRegime: selectedRate.rate <= 0.21 ? 'CEDOLARE_SECCA' : 'ORDINARIO'
                                      });
                                    }
                                  }
                                }}
                                className="w-full text-[11px] font-semibold bg-white border border-slate-200 rounded-lg p-1.5 text-slate-800 focus:ring-1 focus:ring-indigo-500"
                              >
                                <optgroup label="Aliquote Fisse e Personalizzate">
                                  {customTaxRates
                                    .filter(r => r.category === 'IMMOBILI' || r.category === 'MISTO')
                                    .map(rate => (
                                      <option key={rate.id} value={rate.id}>
                                        {rate.name} ({(rate.rate * 100).toFixed(1)}%)
                                      </option>
                                    ))}
                                </optgroup>
                                <option value="custom">✏️ Inserisci Aliquota % Personalizzata...</option>
                              </select>
                            </div>

                            {editingContractTaxId === contract.id && (
                              <div className="flex items-center gap-1.5 mt-1 animate-in fade-in">
                                <input
                                  type="number"
                                  step="0.1"
                                  placeholder="es. 22.5"
                                  defaultValue={(contract.taxRate * 100).toFixed(1)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      const num = parseFloat((e.target as HTMLInputElement).value);
                                      if (!isNaN(num) && num >= 0 && num <= 100) {
                                        updateRentalContract(contract.id, {
                                          taxRate: num / 100,
                                          taxRegime: num <= 21 ? 'CEDOLARE_SECCA' : 'ORDINARIO'
                                        });
                                        setEditingContractTaxId(null);
                                      }
                                    }
                                  }}
                                  className="w-24 text-[11px] font-mono font-bold bg-white border border-indigo-400 rounded px-2 py-1"
                                />
                                <span className="text-[11px] text-slate-500">Premi Invio</span>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-slate-400 text-xs">
                          Nessun contratto di locazione attivo registrato per questo immobile.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Event Tracker Footer */}
                  <div className="p-3.5 bg-slate-50 border-t border-slate-100">
                    {overdueEvent ? (
                      <div className="flex items-center justify-between text-xs bg-amber-50 p-2 rounded-xl border border-amber-200 text-amber-800">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="font-bold text-[11px]">Canone in ritardo dal {overdueEvent.date}</span>
                        </div>
                        <button
                          onClick={() => confirmEventReceived(overdueEvent.id)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shrink-0 transition-colors shadow-xs cursor-pointer"
                        >
                          Incassa
                        </button>
                      </div>
                    ) : nextEvent ? (
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Prossimo accredito: <strong>{nextEvent.date}</strong></span>
                        </div>
                        <button
                          onClick={() => confirmEventReceived(nextEvent.id)}
                          className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                        >
                          Segna Ricevuto
                        </button>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tutti i canoni del periodo risultano saldati.</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Property Confirmation Modal */}
      {propertyToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Rimuovere questo immobile?
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Stai per eliminare definitivamente <strong className="text-slate-800">{propertyToDelete.name}</strong> ({propertyToDelete.address}, {propertyToDelete.city}). Verranno rimossi anche i contratti di locazione attivi e le spese associate.
            </p>
            <div className="flex items-center justify-end gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setPropertyToDelete(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteProperty(propertyToDelete.id);
                  setPropertyToDelete(null);
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Conferma Rimozione
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Property Expenses Modal */}
      <PropertyExpensesModal
        property={currentModalProperty}
        isOpen={Boolean(selectedPropertyForExpenses)}
        onClose={() => setSelectedPropertyForExpenses(null)}
      />
    </div>
  );
};
