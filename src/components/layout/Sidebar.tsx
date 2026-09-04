import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  LineChart,
  Building2,
  ArrowUpDown,
  Coins,
  CalendarDays,
  Wallet,
  Landmark,
  Building,
  Watch,
  Receipt,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Briefcase
} from 'lucide-react';
import { useWealth, NavigationTab } from '../../context/WealthContext';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
  badgeColor?: string;
}

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, overdueEvents, resetToDemo } = useWealth();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard & Net Worth', icon: LayoutDashboard },
    { id: 'investments', label: 'Investimenti', icon: LineChart },
    {
      id: 'realestate',
      label: 'Immobili & Affitti',
      icon: Building2,
      badge: overdueEvents.length > 0 ? overdueEvents.length : undefined,
      badgeColor: 'bg-amber-500'
    },
    { id: 'cashflow', label: 'Cash Flow', icon: ArrowUpDown },
    { id: 'income', label: 'Reddito', icon: Briefcase },
    { id: 'calendar', label: 'Calendario', icon: CalendarDays },
    { id: 'reports', label: 'Report Fiscale', icon: FileText },
    { id: 'alternatives', label: 'Asset Alternativi', icon: Watch }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white text-slate-800 border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-indigo-100">
              <div className="w-4 h-4 border-2 border-white rounded-full"></div>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800 uppercase">Patrimonix</span>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Family Wealth Mgmt</p>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Piattaforma Patrimoniale
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-normal'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      item.badgeColor === 'bg-amber-500' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Profile Card & Demo reset */}
        <div className="p-4 border-t border-slate-100 bg-white space-y-2">
          <div className="bg-slate-50 p-3 rounded-lg flex items-center gap-3 border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
              R
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-700 truncate">Famiglia Rossi</p>
              <p className="text-[10px] text-slate-500 truncate">Consolidato</p>
            </div>
          </div>

          <button
            onClick={resetToDemo}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            title="Ripristina dati demo Fineco, BTP, Immobili Bologna/Rimini"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </aside>
    </>
  );
};
