import React, { useState } from 'react';
import {
  Percent,
  Plus,
  Link2,
  Trash2,
  Edit2,
  Check,
  X,
  Layers,
  Sparkles,
  Info,
  Sliders
} from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { CustomTaxRate } from '../../types';
import { formatPercent } from '../../utils/financialEngine';

export const CustomTaxRatesManager: React.FC = () => {
  const {
    customTaxRates,
    addCustomTaxRate,
    updateCustomTaxRate,
    deleteCustomTaxRate,
    combineTaxRates
  } = useWealth();

  // Create new rate modal / form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRatePercent, setNewRatePercent] = useState<number>(21);
  const [newCategory, setNewCategory] = useState<'IMMOBILI' | 'FINANZA' | 'MISTO'>('IMMOBILI');
  const [newDescription, setNewDescription] = useState('');

  // Combine rates modal state
  const [showCombineModal, setShowCombineModal] = useState(false);
  const [combineRate1, setCombineRate1] = useState('rate-cedolare-21');
  const [combineRate2, setCombineRate2] = useState('rate-irpef-23');
  const [combineWeight1, setCombineWeight1] = useState(50);
  const [combineCustomName, setCombineCustomName] = useState('');

  // Inline editing state
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [editRatePercent, setEditRatePercent] = useState<number>(21);
  const [editRateName, setEditRateName] = useState<string>('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addCustomTaxRate({
      name: newName.trim(),
      rate: Number(newRatePercent) / 100,
      category: newCategory,
      description: newDescription.trim() || `Aliquota personalizzata ${(Number(newRatePercent)).toFixed(1)}%`
    });

    setNewName('');
    setNewRatePercent(21);
    setNewDescription('');
    setShowAddModal(false);
  };

  const handleCombine = (e: React.FormEvent) => {
    e.preventDefault();
    const w1 = combineWeight1 / 100;
    const w2 = (100 - combineWeight1) / 100;

    combineTaxRates(
      combineRate1,
      combineRate2,
      w1,
      w2,
      combineCustomName.trim() || undefined
    );

    setShowCombineModal(false);
    setCombineCustomName('');
  };

  const startEdit = (rate: CustomTaxRate) => {
    setEditingRateId(rate.id);
    setEditRatePercent(Number((rate.rate * 100).toFixed(2)));
    setEditRateName(rate.name);
  };

  const saveEdit = (id: string) => {
    updateCustomTaxRate(id, {
      name: editRateName,
      rate: Number(editRatePercent) / 100
    });
    setEditingRateId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header with Add & Combine Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span>Aliquote Fiscali & Regimi Personalizzati</span>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              Immobili • Cedole • Miste
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configura le aliquote fisse di legge (21%, 23%, 10%, 12.5%, 26%), modificale, o combina regimi diversi per le locazioni.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCombineModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors shadow-2xs cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Combina Due Aliquote</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs shadow-indigo-100 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuova Aliquota</span>
          </button>
        </div>
      </div>

      {/* Grid of Active Tax Rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customTaxRates.map(rate => {
          const isEditing = editingRateId === rate.id;
          const isCombined = rate.category === 'MISTO' || Boolean(rate.combinedFrom);

          return (
            <div
              key={rate.id}
              className={`p-4 rounded-2xl border transition-all ${
                isCombined
                  ? 'border-indigo-200 bg-indigo-50/30 shadow-2xs'
                  : 'border-slate-200 bg-white shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    rate.category === 'IMMOBILI'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : rate.category === 'FINANZA'
                      ? 'bg-purple-50 text-purple-700 border border-purple-100'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  }`}
                >
                  {rate.category}
                </span>

                <div className="flex items-center gap-1">
                  {!isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => startEdit(rate)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Modifica aliquota"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {rate.id.startsWith('rate-comb-') || rate.id.startsWith('rate-custom-') ? (
                        <button
                          type="button"
                          onClick={() => deleteCustomTaxRate(rate.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Elimina aliquota"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => saveEdit(rate.id)}
                        className="p-1 rounded text-emerald-600 hover:bg-emerald-50"
                        title="Salva modifiche"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingRateId(null)}
                        className="p-1 rounded text-slate-400 hover:text-slate-600"
                        title="Annulla"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {!isEditing ? (
                <>
                  <h3 className="text-sm font-bold text-slate-900">{rate.name}</h3>
                  <div className="text-2xl font-black font-mono text-indigo-700 mt-1">
                    {(rate.rate * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {rate.description || 'Aliquota fiscale standard'}
                  </p>
                </>
              ) : (
                <div className="space-y-2 mt-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Nome</label>
                    <input
                      type="text"
                      value={editRateName}
                      onChange={e => setEditRateName(e.target.value)}
                      className="w-full px-2 py-1 rounded border border-slate-200 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Percentuale (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editRatePercent}
                      onChange={e => setEditRatePercent(Number(e.target.value))}
                      className="w-full px-2 py-1 rounded border border-slate-200 text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Aggiungi Nuova Aliquota */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Crea Nuova Aliquota Personalizzata</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome Aliquota / Regime</label>
                <input
                  type="text"
                  required
                  placeholder="es. Locazione Turistica Breve, Accordo Territoriale..."
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Percentuale (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newRatePercent}
                    onChange={e => setNewRatePercent(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ambito di Applicazione</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="IMMOBILI">Immobili & Locazioni</option>
                    <option value="FINANZA">Finanziario (Cedole/Plusvalenze)</option>
                    <option value="MISTO">Misto / Globale</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrizione o Note Fiscali</label>
                <textarea
                  rows={2}
                  placeholder="Dettagli di legge o condizioni di applicazione..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
                >
                  Salva Aliquota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Combina Due Aliquote */}
      {showCombineModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-indigo-600" />
                <span>Combina Due Aliquote (es. Locazioni 21% + 23%)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCombineModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCombine} className="space-y-3 text-xs">
              <p className="text-slate-500">
                Unisce due aliquote esistenti mediante media ponderata percentuale per contratti o immobili con tassazione ibrida.
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Aliquota A:</label>
                <select
                  value={combineRate1}
                  onChange={e => setCombineRate1(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  {customTaxRates.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} - {(r.rate * 100).toFixed(1)}%
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Aliquota B:</label>
                <select
                  value={combineRate2}
                  onChange={e => setCombineRate2(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  {customTaxRates.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} - {(r.rate * 100).toFixed(1)}%
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Peso Ripartizione:</span>
                  <span className="font-mono text-indigo-700 font-bold">
                    {combineWeight1}% A • {100 - combineWeight1}% B
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={combineWeight1}
                  onChange={e => setCombineWeight1(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome Combinazione (Opzionale)</label>
                <input
                  type="text"
                  placeholder="es. Locazione Mista (21% + 23%)"
                  value={combineCustomName}
                  onChange={e => setCombineCustomName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              {/* Blended Result Box */}
              {(() => {
                const r1 = customTaxRates.find(r => r.id === combineRate1)?.rate || 0.21;
                const r2 = customTaxRates.find(r => r.id === combineRate2)?.rate || 0.23;
                const blended = ((r1 * combineWeight1 / 100) + (r2 * (100 - combineWeight1) / 100)) * 100;
                return (
                  <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 flex items-center justify-between">
                    <span className="font-bold text-indigo-950">Aliquota Combinata Risultante:</span>
                    <strong className="text-lg font-mono font-black text-indigo-700">
                      {blended.toFixed(2)}%
                    </strong>
                  </div>
                );
              })()}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCombineModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
                >
                  Crea & Salva Aliquota Mista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
