import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Zap,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  UploadCloud,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { formatCurrency } from '../../utils/financialEngine';

export const SmartRulesView: React.FC = () => {
  const {
    smartRules,
    addSmartRule,
    toggleSmartRule,
    deleteSmartRule,
    processBankMovement,
    properties,
    assets
  } = useWealth();

  const [newKeyword, setNewKeyword] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<'AFFITTO' | 'CEDOLA' | 'DIVIDENDO' | 'ALTRO'>('AFFITTO');

  // CSV Simulator State
  const [simulatedDescription, setSimulatedDescription] = useState(
    'BONIFICO DISPOSTO DA ROSSI MARIO SALDO CANONE LOCAZIONE VIA SANTO STEFANO 42'
  );
  const [simulatedAmount, setSimulatedAmount] = useState<number>(1400);
  const [reconciliationResult, setReconciliationResult] = useState<{ matched: boolean; message: string } | null>(null);

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;

    addSmartRule({
      keyword: newKeyword.trim().toUpperCase(),
      category: newCategory as any,
      description: newDescription || `Riconoscimento automatico ${newKeyword}`,
      action: 'MARK_RECEIVED',
      isActive: true
    });

    setNewKeyword('');
    setNewDescription('');
  };

  const handleTestReconciliation = () => {
    const res = processBankMovement(simulatedDescription, simulatedAmount, new Date().toISOString().split('T')[0]);
    setReconciliationResult(res);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
              Open Banking & Reconciliazione Intelligente
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Smart Rules & Import Estratti Conto
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Riconoscimento automatico dei bonifici di inquilini, cedole BTP e dividendi tramite regole semantiche.
          </p>
        </div>
      </div>

      {/* Interactive Bank Statement CSV Simulator Box */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-800">
              Simulatore & Importazione Movimenti Bancari (CSV / PSD2)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Architettura predisposta Open Banking</span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Incolla o seleziona una causale bancaria reale per verificare come il motore di Smart Rules la intercetta e converte automaticamente l'entrata prevista in <strong>"RICEVUTA"</strong>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Causale Movimento Bancario (es. estratto conto Fineco / Intesa)
            </label>
            <input
              type="text"
              value={simulatedDescription}
              onChange={e => setSimulatedDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
              <span className="text-slate-400 font-medium">Test rapidi:</span>
              <button
                onClick={() => {
                  setSimulatedDescription('BONIFICO DA ROSSI MARIO AFFITTO VIA SANTO STEFANO');
                  setSimulatedAmount(1400);
                }}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-medium"
              >
                Inquilino Bologna (Rossi Mario)
              </button>
              <button
                onClick={() => {
                  setSimulatedDescription('ACCREDITO CEDOLA MINISTERO ECONOMIA BTP 01/09/2033');
                  setSimulatedAmount(6000);
                }}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-medium"
              >
                Cedola BTP Tesoro
              </button>
              <button
                onClick={() => {
                  setSimulatedDescription('DIVIDENDO VANGUARD FTSE ALL-WORLD UCITS');
                  setSimulatedAmount(650);
                }}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-medium"
              >
                Dividendo Vanguard
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Importo Accreditato (€)</label>
            <input
              type="number"
              value={simulatedAmount}
              onChange={e => setSimulatedAmount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleTestReconciliation}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs shadow-indigo-100"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Esegui Riconciliazione Regola</span>
            </button>
          </div>
        </div>

        {/* Live Result Feedback */}
        {reconciliationResult && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2.5 ${
              reconciliationResult.matched
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border border-amber-200 text-amber-900'
            }`}
          >
            {reconciliationResult.matched ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span className="font-semibold">{reconciliationResult.message}</span>
          </div>
        )}
      </div>

      {/* Active Rules List & Rule Creator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rules Table (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Regole Intelligenti Attive</h3>
            <span className="text-xs font-mono text-slate-400">{smartRules.length} Regole configurate</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[9px] tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Keyword di Matching</th>
                  <th className="py-2.5 px-3">Categoria</th>
                  <th className="py-2.5 px-3">Descrizione Regola</th>
                  <th className="py-2.5 px-3 text-center">Stato</th>
                  <th className="py-2.5 px-3 text-right">Azione</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {smartRules.map(rule => (
                  <tr key={rule.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-600">
                      "{rule.keyword}"
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-700 uppercase">
                        {rule.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-sans">
                      <div>{rule.description}</div>
                      {rule.targetAssetName && (
                        <div className="text-[11px] text-slate-400 font-mono">Asset: {rule.targetAssetName}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => toggleSmartRule(rule.id)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors font-sans ${
                          rule.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {rule.isActive ? 'ATTIVA' : 'PAUSA'}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => deleteSmartRule(rule.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Elimina regola"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add New Rule Card (1 Column) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-800">Crea Nuova Smart Rule</h3>
          <p className="text-xs text-slate-500">
            Aggiungi una parola chiave che quando compare nel bonifico salda automaticamente la rata o il canone.
          </p>

          <form onSubmit={handleCreateRule} className="space-y-3 pt-2 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Keyword Identificativa</label>
              <input
                type="text"
                value={newKeyword}
                onChange={e => setNewKeyword(e.target.value)}
                placeholder="es. ROSSI MARIO oppure BTP"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg uppercase font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Categoria Evento</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="AFFITTO">Affitto Immobile</option>
                <option value="CEDOLA">Cedola Titolo di Stato / Obbligazione</option>
                <option value="DIVIDENDO">Dividendo Azionario / ETF</option>
                <option value="ALTRO">Altra Entrata Ricorrente</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Descrizione Regola</label>
              <input
                type="text"
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                placeholder="es. Bonifico canone mensile inquilino"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 mt-4 shadow-xs shadow-indigo-100"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Aggiungi Smart Rule</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
