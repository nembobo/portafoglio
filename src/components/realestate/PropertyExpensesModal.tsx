import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Receipt,
  Building2,
  Calendar,
  AlertCircle,
  Coins,
  Check,
  Percent,
  HelpCircle
} from 'lucide-react';
import { Property, PropertyExpense, ExpenseFrequency, RentalContract } from '../../types';
import { useWealth } from '../../context/WealthContext';
import { formatCurrency, formatPercent } from '../../utils/financialEngine';
import {
  EXPENSE_FREQUENCY_LABELS,
  calculateExpenseAnnual,
  calculateExpenseMonthly,
  calculatePropertyCashFlowAndYield,
  calculatePropertyTotalAnnualExpenses
} from '../../utils/propertyExpenseUtils';

interface PropertyExpensesModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PropertyExpensesModal: React.FC<PropertyExpensesModalProps> = ({
  property,
  isOpen,
  onClose
}) => {
  const {
    filteredRentalContracts,
    addPropertyExpense,
    deletePropertyExpense,
    updateProperty
  } = useWealth();

  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState<string>('');
  const [newFrequency, setNewFrequency] = useState<ExpenseFrequency>('MONTHLY');
  const [newCategory, setNewCategory] = useState<PropertyExpense['category']>('CONDOMINIO');

  if (!isOpen || !property) return null;

  const contract = filteredRentalContracts.find(c => c.propertyId === property.id && c.active);
  const expenses = property.expenses || [];

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newAmount);
    if (!newName.trim() || isNaN(amountNum) || amountNum <= 0) return;

    addPropertyExpense(property.id, {
      name: newName.trim(),
      amount: amountNum,
      frequency: newFrequency,
      category: newCategory
    });

    setNewName('');
    setNewAmount('');
    setNewFrequency('MONTHLY');
  };

  const cashFlow = calculatePropertyCashFlowAndYield(property, contract);
  const totalAnnualExpenses = calculatePropertyTotalAnnualExpenses(property);
  const totalMonthlyExpenses = totalAnnualExpenses / 12;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Gestione Spese & Rendimento Netto
              </h2>
              <p className="text-xs text-slate-500">
                {property.name} • {property.city} ({formatCurrency(property.currentValue)})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Live Calculated Impact Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Canone Mese
              </span>
              <span className="text-sm font-bold text-slate-900 font-mono mt-0.5 block">
                {formatCurrency(cashFlow.grossMonthlyRent)}
              </span>
              <span className="text-[10px] text-slate-500">
                {formatCurrency(cashFlow.grossAnnualRent)}/anno
              </span>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                Spese Totali
              </span>
              <span className="text-sm font-bold text-amber-900 font-mono mt-0.5 block">
                -{formatCurrency(totalMonthlyExpenses)}/m
              </span>
              <span className="text-[10px] text-amber-700">
                -{formatCurrency(totalAnnualExpenses)}/anno
              </span>
            </div>

            <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/80">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                Tasse ({formatPercent(cashFlow.taxRate)})
              </span>
              <span className="text-sm font-bold text-rose-900 font-mono mt-0.5 block">
                -{formatCurrency(cashFlow.monthlyTaxes)}/m
              </span>
              <span className="text-[10px] text-rose-700">
                -{formatCurrency(cashFlow.annualTaxes)}/anno
              </span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                Netto Mensile
              </span>
              <span className={`text-sm font-bold font-mono mt-0.5 block ${cashFlow.netMonthly >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {cashFlow.netMonthly >= 0 ? '+' : ''}{formatCurrency(cashFlow.netMonthly)}/m
              </span>
              <span className="text-[10px] font-semibold text-emerald-800">
                Yield Net: {formatPercent(cashFlow.netYield / 100)}
              </span>
            </div>
          </div>

          {/* Form to Add New Expense */}
          <form onSubmit={handleAddExpense} className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                <span>Aggiungi Nuova Spesa per questo Immobile</span>
              </span>
              <span className="text-[10px] text-indigo-600 font-medium">
                Supporta cadenza mensile, bimestrale, annuale, ecc.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Descrizione Spesa
                </label>
                <input
                  type="text"
                  placeholder="Es. Condominio, IMU, Pulizia scale, Assicurazione"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 font-medium"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Importo (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Es. 150"
                  value={newAmount}
                  onChange={e => setNewAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 font-mono font-bold"
                  required
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Periodicità
                </label>
                <select
                  value={newFrequency}
                  onChange={e => setNewFrequency(e.target.value as ExpenseFrequency)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="MONTHLY">Mensile (12/anno)</option>
                  <option value="BIMONTHLY">Bimestrale (6/anno)</option>
                  <option value="QUARTERLY">Trimestrale (4/anno)</option>
                  <option value="SEMIANNUAL">Semestrale (2/anno)</option>
                  <option value="ANNUAL">Annuale (1/anno)</option>
                  <option value="ONE_OFF">Una Tantum</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Categoria:
                </label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md text-slate-700"
                >
                  <option value="CONDOMINIO">Condominio</option>
                  <option value="IMU_TARI">IMU / TARI</option>
                  <option value="ASSICURAZIONE">Assicurazione</option>
                  <option value="MANUTENZIONE">Manutenzione</option>
                  <option value="GESTIONE">Gestione / Agenzia</option>
                  <option value="UTENZE">Utenze</option>
                  <option value="ALTRO">Altro</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Aggiungi Spesa</span>
              </button>
            </div>
          </form>

          {/* List of Registered Expenses */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Elenco Spese Attive ({expenses.length})</span>
              <span className="text-[11px] text-slate-400 font-normal">
                I valori vengono convertiti automaticamente in costo annuo e mensile
              </span>
            </div>

            {expenses.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                Nessuna voce di spesa configurata per questo immobile.
                <p className="mt-1 text-[11px] text-slate-500">
                  Usa il modulo sopra per aggiungere spese condominiali, IMU, assicurazione o manutenzione.
                </p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                {expenses.map(exp => {
                  const annualVal = calculateExpenseAnnual(exp.amount, exp.frequency);
                  const monthlyVal = annualVal / 12;

                  return (
                    <div
                      key={exp.id}
                      className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                          {EXPENSE_FREQUENCY_LABELS[exp.frequency]}
                        </span>
                        <div>
                          <div className="font-bold text-slate-800">{exp.name}</div>
                          <div className="text-[11px] text-slate-400">
                            {exp.category || 'Spesa Ordinaria'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-mono font-bold text-slate-900">
                            {formatCurrency(exp.amount)} <span className="text-[10px] font-normal text-slate-400">/{EXPENSE_FREQUENCY_LABELS[exp.frequency].toLowerCase()}</span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            ≈ {formatCurrency(monthlyVal)}/mese • {formatCurrency(annualVal)}/anno
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => deletePropertyExpense(property.id, exp.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Elimina spesa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Final Recalculated Yields */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-600 font-medium">
            <span>
              Lordo: <strong className="font-mono text-slate-900">{formatPercent(cashFlow.grossYield / 100)}</strong>
            </span>
            <span>•</span>
            <span>
              Netto Annuale: <strong className="font-mono text-emerald-600">+{formatCurrency(cashFlow.netAnnual)}</strong>
            </span>
            <span>•</span>
            <span>
              Yield Netto: <strong className="font-mono text-indigo-700 text-sm">{formatPercent(cashFlow.netYield / 100)}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            Fatto & Salva
          </button>
        </div>
      </div>
    </div>
  );
};
