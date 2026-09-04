import React, { useState } from 'react';
import { WealthProvider, useWealth } from './context/WealthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { InvestmentsView } from './components/investments/InvestmentsView';
import { RealEstateView } from './components/realestate/RealEstateView';
import { CashFlowView } from './components/cashflow/CashFlowView';
import { IncomeView } from './components/income/IncomeView';
import { CalendarView } from './components/calendar/CalendarView';
import { TaxCenterView } from './components/taxes/TaxCenterView';
import { AccountsView } from './components/accounts/AccountsView';
import { DebtsView } from './components/debts/DebtsView';
import { CompaniesView } from './components/companies/CompaniesView';
import { AlternativeAssetsView } from './components/alternatives/AlternativeAssetsView';
import { SmartRulesView } from './components/banking/SmartRulesView';
import { QuickAddModal } from './components/modals/QuickAddModal';
import { WorkspaceManagerModal } from './components/modals/WorkspaceManagerModal';

const AppContent: React.FC = () => {
  const { activeTab, isFirstVisit, dismissFirstVisit } = useWealth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workspaceManagerOpen, setWorkspaceManagerOpen] = useState(false);
  const [addModalConfig, setAddModalConfig] = useState<{
    isOpen: boolean;
    mode: 'ALL' | 'FINANCIAL' | 'PROPERTY';
  }>({
    isOpen: false,
    mode: 'ALL'
  });

  const openAddModal = (mode: 'ALL' | 'FINANCIAL' | 'PROPERTY' = 'ALL') => {
    setAddModalConfig({ isOpen: true, mode });
  };

  const closeAddModal = () => {
    setAddModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
      case 'networth':
        return <DashboardView onOpenAddModal={() => openAddModal('ALL')} />;
      case 'investments':
        return <InvestmentsView onOpenAddModal={() => openAddModal('FINANCIAL')} />;
      case 'realestate':
        return <RealEstateView onOpenAddModal={() => openAddModal('PROPERTY')} />;
      case 'cashflow':
        return <CashFlowView />;
      case 'income':
        return <IncomeView />;
      case 'calendar':
        return <CalendarView />;
      case 'taxes':
      case 'reports':
        return <TaxCenterView />;
      case 'accounts':
        return <AccountsView />;
      case 'liabilities':
        return <DebtsView />;
      case 'companies':
        return <CompaniesView />;
      case 'alternatives':
        return <AlternativeAssetsView />;
      case 'banking':
        return <SmartRulesView />;
      default:
        return <DashboardView onOpenAddModal={() => openAddModal('ALL')} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex antialiased selection:bg-indigo-600 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenWorkspaceManager={() => setWorkspaceManagerOpen(true)}
      />

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Global Wealth Header */}
        <Header
          onOpenMobileSidebar={() => setSidebarOpen(true)}
          onOpenQuickAdd={() => openAddModal('ALL')}
          onOpenWorkspaceManager={() => setWorkspaceManagerOpen(true)}
        />

        {/* Dynamic Content View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Quick Add Asset / Bond / Property Modal */}
      <QuickAddModal
        isOpen={addModalConfig.isOpen}
        mode={addModalConfig.mode}
        onClose={closeAddModal}
      />

      {/* Data Isolation & Workspace Manager Modal */}
      <WorkspaceManagerModal
        isOpen={workspaceManagerOpen || isFirstVisit}
        isInitialWelcome={isFirstVisit}
        onClose={() => {
          setWorkspaceManagerOpen(false);
          if (isFirstVisit) dismissFirstVisit();
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <WealthProvider>
      <AppContent />
    </WealthProvider>
  );
}
