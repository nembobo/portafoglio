import React from 'react';
import { Building, GitFork, ArrowDownRight, Layers, Coins, Landmark, ShieldCheck } from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { formatCurrency, formatPercent } from '../../utils/financialEngine';

export const CompaniesView: React.FC = () => {
  const { filteredCompanies, properties, accounts } = useWealth();

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Partecipazioni, Società & Holding
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Mappatura societaria di holding, veicoli immobiliari e strutture patrimoniali multilivello.
          </p>
        </div>
      </div>

      {/* Visual Corporate Hierarchy Tree (Requirement #11) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <GitFork className="w-5 h-5 text-indigo-600" />
          <span>Struttura Patrimoniale Consolidata</span>
        </h3>
        <p className="text-xs text-slate-500">
          Rappresentazione ad albero delle catene di controllo, partecipazioni e asset sottostanti.
        </p>

        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-xs space-y-3">
          {/* Level 1 */}
          <div className="flex items-center gap-2 font-bold text-slate-900 font-sans text-sm">
            <span className="w-3 h-3 rounded-full bg-indigo-600" />
            <span>Famiglia Rossi (Consolidato Familiare)</span>
          </div>

          {/* Level 2 Branch A: Holding */}
          <div className="pl-6 border-l-2 border-slate-200 ml-1.5 space-y-3">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between font-sans">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-amber-600" />
                  <span>Aurora Capital Holding S.r.l. (100% Marco Rossi)</span>
                </div>
                <span className="font-mono text-emerald-600 font-bold">€750.000</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-sans">
                Dividendi distribuiti YTD: €35.000 • Finanziamento soci: €50.000 • Riserva cassa: €75.000
              </div>

              {/* Sub-assets of Holding */}
              <div className="mt-3 pl-4 border-l-2 border-amber-400 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>↳ Fondo Commerciale & Uffici (Via dell'Industria, Bologna)</span>
                  <span className="font-bold text-slate-900 font-mono">€600.000</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>↳ BPM - Conto Societario Liquidità</span>
                  <span className="font-bold text-slate-900 font-mono">€75.000</span>
                </div>
              </div>
            </div>

            {/* Level 2 Branch B: Persona Fisica Direct Holdings */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between font-sans">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-indigo-600" />
                  <span>Patrimonio Diretto Persona Fisica (Marco ed Elena)</span>
                </div>
                <span className="font-mono text-emerald-600 font-bold">€1.400.000</span>
              </div>
              <div className="mt-3 pl-4 border-l-2 border-indigo-400 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>↳ Deposito Titoli Fineco (BTP €300k, ETF €200k, Azioni €100k, Liquidità €50k)</span>
                  <span className="font-bold text-slate-900 font-mono">€650.000</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>↳ Immobili Bologna & Rimini (Abitativi locati)</span>
                  <span className="font-bold text-slate-900 font-mono">€800.000</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>↳ Asset Alternativi (Rolex Submariner + Oro fisico)</span>
                  <span className="font-bold text-slate-900 font-mono">€45.000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCompanies.map(comp => (
          <div
            key={comp.id}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-300 transition-all"
          >
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800">
                {comp.type}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1.5">{comp.companyName}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{comp.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-mono">
              <div>
                <div className="text-slate-400 uppercase font-bold font-sans text-[9px] tracking-wider">Quota Posseduta</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{comp.ownershipPercentage}%</div>
              </div>
              <div>
                <div className="text-slate-400 uppercase font-bold font-sans text-[9px] tracking-wider">Valutazione Quota</div>
                <div className="font-bold text-emerald-600 text-base mt-0.5">{formatCurrency(comp.estimatedValuation)}</div>
              </div>
              <div>
                <div className="text-slate-400 uppercase font-bold font-sans text-[9px] tracking-wider">Dividendi Distribuiti</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">+{formatCurrency(comp.dividendsReceivedYtd)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
