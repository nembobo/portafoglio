import React from 'react';
import {
  Menu,
  Plus,
  Users,
  AlertCircle,
  TrendingUp,
  Percent,
  Calendar,
  Building,
  Check,
  Database,
  ShieldCheck
} from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { AccountSelectorDropdown } from './AccountSelectorDropdown';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenQuickAdd: () => void;
  onOpenWorkspaceManager?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onOpenQuickAdd,
  onOpenWorkspaceManager
}) => {
  const {
    familyMembers,
    selectedOwnerId,
    setSelectedOwnerId,
    taxDisplayMode,
    setTaxDisplayMode,
    showAfterTaxNetWorth,
    setShowAfterTaxNetWorth,
    overdueEvents,
    setActiveTab,
    selectedYear,
    setSelectedYear
  } = useWealth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 text-slate-800 px-4 sm:px-8">
      <div className="h-full flex items-center justify-between gap-3">
        {/* Left: Mobile Toggle & Context Selector */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-sidebar-toggle"
            onClick={onOpenMobileSidebar}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden"
            aria-label="Apri menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="text-base sm:text-lg font-bold text-slate-800 hidden md:block">Overview Patrimoniale</h1>
          <div className="hidden md:block h-4 w-[1px] bg-slate-200"></div>

          {/* Family / Entity Context Selector */}
          <AccountSelectorDropdown />

          {/* Fiscal Year Picker */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="fiscal-year-selector"
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
              <option value={2028}>2028</option>
            </select>
          </div>
        </div>

        {/* Right: GROSS / NET Toggle, Alerts, and Quick Add */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Overdue alert indicator */}
          {overdueEvents.length > 0 && (
            <button
              onClick={() => setActiveTab('realestate')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors text-xs font-semibold animate-pulse"
              title={`${overdueEvents.length} canone o rata in ritardo! Clicca per visualizzare.`}
            >
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">{overdueEvents.length} In Ritardo</span>
            </button>
          )}

          {/* Synced status */}
          <div className="hidden xl:flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Synced: Live
          </div>

          {/* GROSS / NET (LORDO / NETTO) Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              id="toggle-gross"
              onClick={() => {
                setTaxDisplayMode('GROSS');
              }}
              className={`px-3 py-1 text-xs font-bold transition-all rounded-lg cursor-pointer ${
                taxDisplayMode === 'GROSS'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Visualizza valori lordi (totale attivi ed entrate ante imposte)"
            >
              Lordo
            </button>
            <button
              id="toggle-net"
              onClick={() => {
                setTaxDisplayMode('NET');
              }}
              className={`px-3 py-1 text-xs font-bold transition-all rounded-lg cursor-pointer ${
                taxDisplayMode === 'NET'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Visualizza valori netti (dedotte passività, imposte latenti e ritenute fiscali)"
            >
              Netto
            </button>
          </div>

          {/* After-Tax Net Worth Latent Tax Switch */}
          <button
            id="toggle-after-tax-nw"
            onClick={() => setShowAfterTaxNetWorth(!showAfterTaxNetWorth)}
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showAfterTaxNetWorth
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="Calcola imposte latenti su plusvalenze non realizzate"
          >
            <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
              showAfterTaxNetWorth ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
            }`}>
              {showAfterTaxNetWorth && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span>After-Tax</span>
          </button>

          {/* Spazio Dati & Backup Button */}
          {onOpenWorkspaceManager && (
            <button
              onClick={onOpenWorkspaceManager}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              title="Gestisci Spazio Dati, Inizia da Zero o Esporta Backup"
            >
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span>Dati & Privacy</span>
            </button>
          )}

          {/* Quick Add Button */}
          <button
            id="quick-add-btn"
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs font-bold shadow-md shadow-indigo-100 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Asset +</span>
          </button>
        </div>
      </div>
    </header>
  );
};
