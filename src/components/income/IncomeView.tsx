import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  Receipt,
  User,
  CheckCircle,
  XCircle,
  X,
  Building,
  DollarSign,
  Percent,
  Calendar
} from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { formatCurrency, formatPercent } from '../../utils/financialEngine';
import { RegularIncome } from '../../types';

export const IncomeView: React.FC = () => {
  const {
    filteredRegularIncomes,
    addRegularIncome,
    updateRegularIncome,
    deleteRegularIncome,
    familyMembers,
    selectedOwnerId,
    taxDisplayMode
  } = useWealth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);

  // Form State
  const [incName, setIncName] = useState('');
  const [incCategory, setIncCategory] = useState<RegularIncome['category']>('STIPENDIO');
  const [amountType, setAmountType] = useState<'NET' | 'GROSS'>('NET');
  const [incAmount, setIncAmount] = useState<number | ''>(2500);
  const [incFrequency, setIncFrequency] = useState<'MONTHLY' | 'ANNUAL' | 'QUARTERLY'>('MONTHLY');
  const [incMonthsCount, setIncMonthsCount] = useState<number>(13);
  const [incTaxRate, setIncTaxRate] = useState<number | ''>(0); // %
  const [incOwnerId, setIncOwnerId] = useState<string>(selectedOwnerId === 'mem-all' ? 'mem-1' : selectedOwnerId);
  const [incActive, setIncActive] = useState<boolean>(true);

  // Aggregate Calculations
  const totalAnnualGross = filteredRegularIncomes
    .filter(i => i.active)
    .reduce((sum, inc) => {
      const mult = inc.frequency === 'MONTHLY' ? (inc.monthsCount || 12) : 1;
      return sum + inc.grossAmount * mult;
    }, 0);

  const totalAnnualNet = filteredRegularIncomes
    .filter(i => i.active)
    .reduce((sum, inc) => {
      const mult = inc.frequency === 'MONTHLY' ? (inc.monthsCount || 12) : 1;
      if (inc.taxRate === 0 || inc.grossAmount === inc.netAmount) {
        return sum + (inc.netAmount || inc.grossAmount) * mult;
      }
      const gross = inc.grossAmount * mult;
      const net = inc.netAmount ? inc.netAmount * mult : gross * (1 - (inc.taxRate || 0.28));
      return sum + net;
    }, 0);

  const totalTaxesWithheld = Math.max(0, totalAnnualGross - totalAnnualNet);
  const monthlyAverageNet = totalAnnualNet / 12;

  const handleOpenAdd = () => {
    setEditingIncomeId(null);
    setIncName('');
    setIncCategory('STIPENDIO');
    setAmountType('NET');
    setIncAmount(2500);
    setIncFrequency('MONTHLY');
    setIncMonthsCount(13);
    setIncTaxRate(0);
    setIncOwnerId(selectedOwnerId === 'mem-all' ? 'mem-1' : selectedOwnerId);
    setIncActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (inc: RegularIncome) => {
    setEditingIncomeId(inc.id);
    setIncName(inc.name);
    setIncCategory(inc.category);
    const isNetDirect = inc.taxRate === 0 || inc.grossAmount === inc.netAmount;
    setAmountType(isNetDirect ? 'NET' : 'GROSS');
    setIncAmount(isNetDirect ? (inc.netAmount || inc.grossAmount) : inc.grossAmount);
    setIncFrequency(inc.frequency);
    setIncMonthsCount(inc.monthsCount || 12);
    setIncTaxRate(isNetDirect ? 0 : (inc.taxRate ? inc.taxRate * 100 : 28));
    setIncOwnerId(inc.ownerId || (selectedOwnerId === 'mem-all' ? 'mem-1' : selectedOwnerId));
    setIncActive(inc.active);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incName.trim() || incAmount === '' || !incOwnerId) return;

    const amtNum = Number(incAmount);
    let grossNum = amtNum;
    let netNum = amtNum;
    let taxRateDecimal = 0;

    if (amountType === 'GROSS') {
      grossNum = amtNum;
      taxRateDecimal = incTaxRate === '' ? 0 : Number(incTaxRate) / 100;
      netNum = grossNum * (1 - taxRateDecimal);
    } else {
      // Net mode with 0% tax
      netNum = amtNum;
      grossNum = amtNum;
      taxRateDecimal = 0;
    }

    if (editingIncomeId) {
      updateRegularIncome(editingIncomeId, {
        name: incName.trim(),
        category: incCategory,
        grossAmount: grossNum,
        netAmount: Math.round(netNum),
        frequency: incFrequency,
        monthsCount: incFrequency === 'MONTHLY' ? incMonthsCount : 1,
        taxRate: taxRateDecimal,
        ownerId: incOwnerId,
        active: incActive
      });
    } else {
      addRegularIncome({
        name: incName.trim(),
        category: incCategory,
        grossAmount: grossNum,
        netAmount: Math.round(netNum),
        frequency: incFrequency,
        monthsCount: incFrequency === 'MONTHLY' ? incMonthsCount : 1,
        taxRate: taxRateDecimal,
        ownerId: incOwnerId,
        active: incActive
      });
    }

    setIsModalOpen(false);
    setEditingIncomeId(null);
  };

  const getOwnerName = (ownerId?: string) => {
    if (!ownerId || ownerId === 'mem-all') return 'Patrimonio Familiare';
    const member = familyMembers.find(m => m.id === ownerId);
    return member ? `${member.name} (${member.role})` : 'Patrimonio Familiare';
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-indigo-600" />
            <span>Redditi da Lavoro & Entrate Ricorrenti</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestione di stipendi, pensioni, fatturato professionale e consulenze con calcolo di mensilità (13a/14a) e stima del netto.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-indigo-100 transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuovo Reddito</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Reddito Annuale Lordo
          </div>
          <div className="text-2xl font-bold text-indigo-700 mt-1 font-mono">
            +{formatCurrency(totalAnnualGross)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Totale fatturato e stipendi lordi
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Ritenute & IRPEF Stimate
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-1 font-mono">
            -{formatCurrency(totalTaxesWithheld)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Incidenza fiscale media: {totalAnnualGross > 0 ? formatPercent(totalTaxesWithheld / totalAnnualGross) : '0%'}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Reddito Annuale Netto
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">
            +{formatCurrency(totalAnnualNet)}
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-2">
            Disponibilità netta effettiva
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Media Mensile Netta
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            +{formatCurrency(monthlyAverageNet)}
            <span className="text-xs text-slate-500 font-normal ml-1">/ mese</span>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Distribuzione su 12 mesi
          </div>
        </div>
      </div>

      {/* Income List Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Fonti di Reddito Configurate ({filteredRegularIncomes.length})
          </h2>
        </div>

        {filteredRegularIncomes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Nessun reddito registrato</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Aggiungi il tuo stipendio, pensione, consulenza o fatturato per integrare i flussi di lavoro con il patrimonio complessivo.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Aggiungi Reddito</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRegularIncomes.map(inc => {
              const mult = inc.frequency === 'MONTHLY' ? (inc.monthsCount || 12) : 1;
              const annualGross = inc.grossAmount * mult;
              const annualNet = inc.netAmount ? inc.netAmount * mult : annualGross * (1 - (inc.taxRate || 0.28));

              return (
                <div
                  key={inc.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                    inc.active ? 'border-slate-200 hover:border-slate-300' : 'border-slate-200 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {inc.category.replace(/_/g, ' ')}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        inc.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {inc.active ? 'Attivo' : 'Sospeso'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{inc.name}</h3>

                    {/* Owner / Profile Tag */}
                    <div className="flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50/70 border border-indigo-100/80 px-2.5 py-1 rounded-lg mt-2 font-medium">
                      <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="truncate">{getOwnerName(inc.ownerId)}</span>
                    </div>

                    <div className="mt-4">
                      <div className="text-xs text-slate-500 font-medium">
                        {inc.taxRate === 0 || inc.grossAmount === inc.netAmount ? 'Importo Netto Diretto' : 'Importo Base Lordo'}
                      </div>
                      <div className="text-2xl font-bold text-slate-900 font-mono flex items-baseline gap-2">
                        <span>{formatCurrency(inc.netAmount || inc.grossAmount)}</span>
                        <span className="text-xs font-normal text-slate-400">
                          / {inc.frequency === 'MONTHLY' ? 'mese' : 'anno'}
                        </span>
                        {inc.taxRate === 0 || inc.grossAmount === inc.netAmount ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-sans">
                            0% Ritenuta (Netto)
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">
                          {inc.frequency === 'MONTHLY' ? `Mensilità: ${inc.monthsCount || 12}` : 'Frequenza'}
                        </span>
                        <span className="font-bold text-indigo-600 font-mono">
                          {inc.taxRate === 0 || inc.grossAmount === inc.netAmount ? 'Netto Diretto' : formatCurrency(annualGross)}
                          {inc.taxRate !== 0 && inc.grossAmount !== inc.netAmount && <span className="text-[10px] text-slate-400 font-normal">/anno</span>}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">
                          {inc.taxRate === 0 || inc.grossAmount === inc.netAmount ? 'Totale Annuo Netto' : 'Netto Stimato'}
                        </span>
                        <span className="font-bold text-emerald-600 font-mono">
                          +{formatCurrency(annualNet)}/anno
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => updateRegularIncome(inc.id, { active: !inc.active })}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      {inc.active ? 'Disattiva' : 'Attiva'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(inc)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        title="Modifica"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteRegularIncome(inc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Elimina"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Aggiungi / Modifica Entrata */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingIncomeId ? 'Modifica Fonte di Reddito' : 'Nuova Fonte di Reddito'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Intestatario / Profilo <span className="text-rose-600">*</span>
                </label>
                <select
                  required
                  value={incOwnerId}
                  onChange={e => setIncOwnerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="mem-all">Patrimonio Familiare (Consolidato)</option>
                  {familyMembers.filter(m => m.id !== 'mem-all').map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Fonte o Datore di Lavoro <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Es. Stipendio Azienda S.p.A., Pensione INPS, Studio Professionale"
                  value={incName}
                  onChange={e => setIncName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={incCategory}
                    onChange={e => setIncCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="STIPENDIO">Stipendio</option>
                    <option value="PENSIONE">Pensione</option>
                    <option value="LAVORO_AUTONOMO">Lavoro Autonomo</option>
                    <option value="CONSULENZA">Consulenza</option>
                    <option value="ALTRO">Altro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Frequenza
                  </label>
                  <select
                    value={incFrequency}
                    onChange={e => setIncFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="MONTHLY">Mensile</option>
                    <option value="ANNUAL">Annuale</option>
                    <option value="QUARTERLY">Trimestrale</option>
                  </select>
                </div>
              </div>

              {/* Mode Toggle: Netto vs Lordo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Modalità di Inserimento Importo <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setAmountType('NET');
                      setIncTaxRate(0);
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      amountType === 'NET'
                        ? 'bg-white text-emerald-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Importo NETTO (0% Aliquota)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAmountType('GROSS');
                      if (incTaxRate === 0) setIncTaxRate(28);
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      amountType === 'GROSS'
                        ? 'bg-white text-indigo-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Importo LORDO (con IRPEF)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {amountType === 'NET' ? 'Importo Netto Percepito (€)' : 'Importo Lordo (€)'} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    required
                    placeholder={amountType === 'NET' ? '2500' : '3800'}
                    value={incAmount}
                    onChange={e => setIncAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold"
                  />
                </div>

                {incFrequency === 'MONTHLY' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mensilità Totali
                    </label>
                    <select
                      value={incMonthsCount}
                      onChange={e => setIncMonthsCount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                    >
                      <option value={12}>12 mensilità</option>
                      <option value={13}>13 mensilità (con 13esima)</option>
                      <option value={14}>14 mensilità (con 13 e 14esima)</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Aliquota Fiscale / Ritenuta (%)
                    </label>
                    {amountType === 'NET' ? (
                      <div className="w-full px-3 py-2 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-bold">
                        0% (Netto Diretto)
                      </div>
                    ) : (
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        value={incTaxRate}
                        onChange={e => setIncTaxRate(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold"
                      />
                    )}
                  </div>
                )}
              </div>

              {incFrequency === 'MONTHLY' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Aliquota Fiscale / Ritenute IRPEF stimate (%)
                  </label>
                  {amountType === 'NET' ? (
                    <div className="w-full px-3 py-2 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-bold flex items-center justify-between">
                      <span>0% - Nessuna ritenuta applicata (Importo inserito già Netto)</span>
                      <span className="text-[10px] bg-emerald-200/60 px-2 py-0.5 rounded">Netto 100%</span>
                    </div>
                  ) : (
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={incTaxRate}
                      onChange={e => setIncTaxRate(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold"
                    />
                  )}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {editingIncomeId ? 'Salva Modifiche' : 'Aggiungi Reddito'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
