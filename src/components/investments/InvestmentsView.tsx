import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  FileSpreadsheet,
  Coins,
  Calendar,
  AlertCircle,
  Tag,
  DollarSign,
  Pencil,
  Trash2,
  Wallet,
  Landmark,
  Lock,
  Unlock,
  Percent,
  Edit2,
  X,
  User,
  ShieldCheck
} from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { FinancialAsset, AssetCategory, BankAccount, BankAccountType } from '../../types';
import {
  formatCurrency,
  formatPercent,
  calculateUnrealizedTax
} from '../../utils/financialEngine';
import { EditAssetModal } from './EditAssetModal';

export const InvestmentsView: React.FC<{ onOpenAddModal: () => void }> = ({ onOpenAddModal }) => {
  const {
    filteredAssets,
    filteredAccounts,
    grossWealth,
    taxDisplayMode,
    sellFinancialAsset,
    deleteFinancialAsset,
    taxLosses,
    addAccount,
    updateAccount,
    deleteAccount,
    familyMembers,
    selectedOwnerId
  } = useWealth();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sellingAsset, setSellingAsset] = useState<FinancialAsset | null>(null);
  const [sellQuantity, setSellQuantity] = useState<number>(0);
  const [sellPrice, setSellPrice] = useState<number>(0);
  const [editingAsset, setEditingAsset] = useState<FinancialAsset | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<FinancialAsset | null>(null);

  // Account Modal States for Liquidity Management
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [accInstitution, setAccInstitution] = useState('');
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<BankAccountType>('CONTO_DEPOSITO_VINCOLATO');
  const [accBalance, setAccBalance] = useState<number | ''>(25000);
  const [accInterestRate, setAccInterestRate] = useState<number | ''>(3.5);
  const [accTaxRate, setAccTaxRate] = useState<number>(0.26);
  const [accMaturityDate, setAccMaturityDate] = useState<string>('2026-12-31');
  const [accOwnerId, setAccOwnerId] = useState<string>(selectedOwnerId === 'mem-all' ? 'mem-1' : selectedOwnerId);

  // Filtered by category
  const displayedAssets = filteredAssets.filter(asset => {
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'BONDS') return asset.isBond || asset.category === 'GOV_BOND' || asset.category === 'BOND';
    if (selectedCategory === 'ETF') return asset.category === 'ETF';
    if (selectedCategory === 'STOCK') return asset.category === 'STOCK';
    return asset.category === selectedCategory;
  });

  const totalPortfolioValue = filteredAssets.reduce((sum, a) => sum + a.quantity * a.currentPrice, 0);
  const totalCostBasis = filteredAssets.reduce((sum, a) => sum + a.quantity * a.averageBuyPrice, 0);
  const totalUnrealizedGain = totalPortfolioValue - totalCostBasis;
  const totalUnrealizedGainPct = totalCostBasis > 0 ? totalUnrealizedGain / totalCostBasis : 0;

  // Total Liquidity metrics
  const totalCashBalance = filteredAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalAnnualNetInterest = filteredAccounts.reduce((sum, a) => {
    const gross = a.balance * (a.interestRate || 0);
    const tax = gross * (a.taxRate || 0.26);
    return sum + (gross - tax);
  }, 0);

  // Selling modal calculation
  const sellProceeds = sellQuantity * sellPrice;
  const sellCostBasis = sellQuantity * (sellingAsset?.averageBuyPrice || 0);
  const sellGain = sellProceeds - sellCostBasis;
  const sellTaxRate = sellingAsset?.taxRate || 0.26;
  const availableLoss = taxLosses.reduce((acc, l) => acc + l.residualAmount, 0);
  const offsetAmount = sellGain > 0 ? Math.min(sellGain, availableLoss) : 0;
  const taxableGain = Math.max(0, sellGain - offsetAmount);
  const sellTaxDue = taxableGain * sellTaxRate;
  const sellGainNet = sellGain - sellTaxDue;

  const handleOpenSell = (asset: FinancialAsset) => {
    setSellingAsset(asset);
    setSellQuantity(asset.quantity);
    setSellPrice(asset.currentPrice);
  };

  const handleConfirmSell = () => {
    if (!sellingAsset || sellQuantity <= 0) return;
    sellFinancialAsset(sellingAsset.id, sellQuantity, sellPrice);
    setSellingAsset(null);
  };

  const handleOpenAddAccount = () => {
    setEditingAccountId(null);
    setAccInstitution('');
    setAccName('');
    setAccType('CONTO_CORRENTE');
    setAccBalance('');
    setAccInterestRate(0);
    setAccTaxRate(0);
    setAccMaturityDate('');
    setAccOwnerId(selectedOwnerId === 'mem-all' ? 'mem-1' : selectedOwnerId);
    setIsAccountModalOpen(true);
  };

  const handleOpenEditAccount = (acc: BankAccount) => {
    setEditingAccountId(acc.id);
    setAccInstitution(acc.institution);
    setAccName(acc.name);
    setAccType(acc.type);
    setAccBalance(acc.balance);
    setAccInterestRate(acc.interestRate !== undefined ? acc.interestRate * 100 : '');
    setAccTaxRate(acc.taxRate !== undefined ? acc.taxRate : 0);
    setAccMaturityDate(acc.lockMaturityDate || '');
    setAccOwnerId(acc.ownerId || (selectedOwnerId === 'mem-all' ? 'mem-1' : selectedOwnerId));
    setIsAccountModalOpen(true);
  };

  const applyAccountPreset = (type: BankAccountType) => {
    setAccType(type);
    if (type === 'CONTO_CORRENTE') {
      setAccInterestRate(0);
      setAccTaxRate(0);
      setAccMaturityDate('');
    } else if (type === 'CONTO_DEPOSITO_LIBERO') {
      setAccInterestRate(3.0);
      setAccTaxRate(0.26);
      setAccMaturityDate('');
    } else if (type === 'CONTO_DEPOSITO_VINCOLATO') {
      setAccInterestRate(3.75);
      setAccTaxRate(0.26);
      if (!accMaturityDate) setAccMaturityDate('2026-12-31');
    } else if (type === 'STRUMENTO_LIQUIDITA') {
      setAccInterestRate(3.2);
      setAccTaxRate(0.125);
      setAccMaturityDate('');
    } else if (type === 'BROKER') {
      setAccInterestRate(0);
      setAccTaxRate(0);
      setAccMaturityDate('');
    }
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accInstitution.trim() || !accName.trim() || accBalance === '' || !accOwnerId) return;

    const rateNum = accInterestRate === '' ? 0 : Number(accInterestRate) / 100;
    const balanceNum = Number(accBalance);

    if (editingAccountId) {
      updateAccount(editingAccountId, {
        institution: accInstitution.trim(),
        name: accName.trim(),
        type: accType,
        balance: balanceNum,
        availableLiquidity: balanceNum,
        interestRate: rateNum,
        taxRate: accTaxRate,
        lockMaturityDate: accMaturityDate || undefined,
        isLocked: accType === 'CONTO_DEPOSITO_VINCOLATO',
        ownerId: accOwnerId
      });
    } else {
      addAccount({
        institution: accInstitution.trim(),
        name: accName.trim(),
        type: accType,
        balance: balanceNum,
        availableLiquidity: balanceNum,
        currency: 'EUR',
        interestRate: rateNum,
        taxRate: accTaxRate,
        lockMaturityDate: accMaturityDate || undefined,
        isLocked: accType === 'CONTO_DEPOSITO_VINCOLATO',
        ownerId: accOwnerId
      });
    }

    setIsAccountModalOpen(false);
    setEditingAccountId(null);
  };

  const getOwnerName = (ownerId?: string) => {
    if (!ownerId || ownerId === 'mem-all') return 'Patrimonio Familiare (Consolidato)';
    const member = familyMembers.find(m => m.id === ownerId);
    return member ? `${member.name} (${member.role})` : 'Patrimonio Familiare';
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header with Title & Summary Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Investimenti & Gestione Liquidità
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestione integrata di titoli di stato, obbligazioni, azioni, ETF e strumenti di gestione liquidità / conti deposito.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedCategory === 'LIQUIDITY' ? (
            <button
              onClick={handleOpenAddAccount}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs shadow-indigo-100 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuovo Conto / Deposito</span>
            </button>
          ) : (
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs shadow-indigo-100 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuovo Titolo / BTP</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Valore Totale Portafoglio & Liquidità
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {formatCurrency(totalPortfolioValue + totalCashBalance)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Titoli: <strong>{formatCurrency(totalPortfolioValue)}</strong> • Liquidità: <strong>{formatCurrency(totalCashBalance)}</strong>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Plusvalenza Non Realizzata Titoli
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">
            +{formatCurrency(totalUnrealizedGain)}
            <span className="text-sm font-semibold ml-2">
              ({formatPercent(totalUnrealizedGainPct)})
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Costo medio fiscale (PMC): <strong className="text-slate-800 font-mono">{formatCurrency(totalCostBasis)}</strong>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Rendimento Annuo da Depositi & Liquidità
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">
            +{formatCurrency(totalAnnualNetInterest)}
            <span className="text-xs font-normal text-slate-500 ml-1">/ anno netti</span>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Interessi generati da conti remunerati & BOT
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'ALL', label: 'Tutti i Titoli' },
          { id: 'BONDS', label: 'BTP & Obbligazioni' },
          { id: 'ETF', label: 'ETF' },
          { id: 'STOCK', label: 'Azioni' },
          { id: 'LIQUIDITY', label: `Liquidità & Gestione Depositi (${filteredAccounts.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* VIEW 1: LIQUIDITY & DEPOSITS SECTION */}
      {selectedCategory === 'LIQUIDITY' ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-cyan-600" />
                <span>Strumenti di Gestione Liquidità, Conti Deposito & Broker</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitoraggio di conti correnti, depositi vincolati, ETF monetari (XEON/C3M) e BOT con associazione a singolo profilo familiare.
              </p>
            </div>

            <button
              onClick={handleOpenAddAccount}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Aggiungi Conto / Deposito</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAccounts.map(acc => {
              const annualGrossInt = acc.balance * (acc.interestRate || 0);
              const taxRate = acc.taxRate !== undefined ? acc.taxRate : (acc.type === 'CONTO_CORRENTE' ? 0 : 0.26);
              const annualNetInt = annualGrossInt * (1 - taxRate);

              return (
                <div
                  key={acc.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {acc.institution}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                        acc.type === 'CONTO_DEPOSITO_VINCOLATO'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : acc.type === 'CONTO_DEPOSITO_LIBERO'
                          ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                          : acc.type === 'STRUMENTO_LIQUIDITA'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-slate-50 text-slate-700 border border-slate-200'
                      }`}>
                        {acc.type === 'CONTO_DEPOSITO_VINCOLATO' && <Lock className="w-2.5 h-2.5" />}
                        {acc.type === 'CONTO_DEPOSITO_LIBERO' && <Unlock className="w-2.5 h-2.5" />}
                        {acc.type === 'CONTO_DEPOSITO_VINCOLATO'
                          ? 'Vincolato'
                          : acc.type === 'CONTO_DEPOSITO_LIBERO'
                          ? 'Libero'
                          : acc.type === 'STRUMENTO_LIQUIDITA'
                          ? 'Strumento Monetario'
                          : 'Conto Corrente'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{acc.name}</h3>

                    {/* Owner / Profile Tag */}
                    <div className="flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50/70 border border-indigo-100/80 px-2.5 py-1 rounded-lg mt-2 font-medium">
                      <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="truncate">{getOwnerName(acc.ownerId)}</span>
                    </div>

                    <div className="mt-4">
                      <div className="text-xs text-slate-500 font-medium">Saldo Disponibile</div>
                      <div className="text-2xl font-bold text-slate-900 font-mono">
                        {formatCurrency(acc.balance)}
                      </div>
                    </div>

                    {acc.type === 'CONTO_CORRENTE' ? (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Liquidità Disponibile C/C</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                          0% Ritenuta Fiscale
                        </span>
                      </div>
                    ) : acc.interestRate && acc.interestRate > 0 ? (
                      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Tasso Lordo</span>
                          <span className="font-bold text-indigo-600 font-mono">
                            {formatPercent(acc.interestRate)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Rendimento Netto ({acc.taxRate === 0 ? '0% Tax' : `${((acc.taxRate || 0.26) * 100).toFixed(1)}% Tax`})</span>
                          <span className="font-bold text-emerald-600 font-mono">
                            +{formatCurrency(annualNetInt)}/anno
                          </span>
                        </div>
                        {acc.lockMaturityDate && (
                          <div className="col-span-2 text-[10px] text-slate-500 mt-1">
                            Scadenza vincolo: <strong className="text-slate-700">{acc.lockMaturityDate}</strong>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <span>Conto ordinario non vincolato</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          0% Ritenuta
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEditAccount(acc)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                      title="Modifica conto"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteAccount(acc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Elimina conto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VIEW 2: FINANCIAL ASSETS TABLE */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[9px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Strumento & ISIN</th>
                  <th className="py-3 px-4 text-center">Tipo</th>
                  <th className="py-3 px-4 text-right">Quantità</th>
                  <th className="py-3 px-4 text-right">Prezzo / PMC</th>
                  <th className="py-3 px-4 text-right">Valore Attuale</th>
                  <th className="py-3 px-4 text-right">P/L Non Realizzato</th>
                  <th className="py-3 px-4 text-right">Aliquota Fiscale</th>
                  <th className="py-3 px-4 text-right">After-Tax (Netto)</th>
                  <th className="py-3 px-4 text-right">IRR Stima</th>
                  <th className="py-3 px-4 text-right">Peso</th>
                  <th className="py-3 px-4 text-center">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedAssets.map(asset => {
                  const taxCalc = calculateUnrealizedTax(asset);
                  const pnl = taxCalc.marketValue - taxCalc.costBasis;
                  const pnlPct = taxCalc.costBasis > 0 ? pnl / taxCalc.costBasis : 0;
                  const weightPct = grossWealth > 0 ? (taxCalc.marketValue / grossWealth) * 100 : 0;

                  return (
                    <tr key={asset.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{asset.name}</div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                          <span>{asset.isin}</span>
                          {asset.ticker && <span className="text-slate-400 font-sans">• {asset.ticker}</span>}
                          {asset.isBond && (
                            <span className="text-indigo-700 font-sans font-semibold bg-indigo-50 px-1.5 py-0.5 rounded">
                              Cedola {formatPercent(asset.annualCouponRate || 0)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {asset.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-900">
                        {asset.quantity.toLocaleString('it-IT')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono">
                        <div className="font-bold text-slate-900">€{asset.currentPrice.toFixed(2)}</div>
                        <div className="text-[11px] text-slate-400">PMC: €{asset.averageBuyPrice.toFixed(2)}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(taxCalc.marketValue)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono">
                        <div className={`font-bold flex items-center justify-end gap-0.5 ${pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                        </div>
                        <div className={`text-[11px] font-semibold ${pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {pnl >= 0 ? '+' : ''}{formatPercent(pnlPct)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          asset.taxRate === 0.125 ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {formatPercent(asset.taxRate)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono">
                        <div className="font-semibold text-slate-900">
                          {formatCurrency(taxCalc.afterTaxValue)}
                        </div>
                        <div className="text-[11px] text-rose-600">
                          Tax: -{formatCurrency(taxCalc.latentTax)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-600">
                        +{asset.irrEstimated}%
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                        {weightPct.toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingAsset(asset)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="Modifica parametri titolo"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenSell(asset)}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Simula vendita quote"
                          >
                            Vendi
                          </button>
                          <button
                            type="button"
                            onClick={() => setAssetToDelete(asset)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Rimuovi titolo dal portafoglio"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {displayedAssets.length === 0 && (
            <div className="p-12 text-center">
              <TrendingUp className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700">Nessun titolo in questa categoria</h3>
              <p className="text-xs text-slate-400 mt-1">
                Non ci sono strumenti presenti per il filtro selezionato.
              </p>
              <button
                onClick={onOpenAddModal}
                className="mt-3 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                + Aggiungi Titolo / BTP
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal: Aggiungi / Modifica Conto Deposito o Liquidità */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingAccountId ? 'Modifica Conto / Strumento Liquidità' : 'Nuovo Strumento di Liquidità / Deposito'}
              </h3>
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-4 mt-4">
              {/* Quick Type Presets */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Preset Rapido Strumento
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => applyAccountPreset('CONTO_CORRENTE')}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-all text-left cursor-pointer ${
                      accType === 'CONTO_CORRENTE'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-extrabold text-slate-900 flex items-center gap-1">
                      <span>💳 Conto Corrente</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">0% Ritenuta</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyAccountPreset('CONTO_DEPOSITO_LIBERO')}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-all text-left cursor-pointer ${
                      accType === 'CONTO_DEPOSITO_LIBERO'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-extrabold text-slate-900 flex items-center gap-1">
                      <span>🔓 Deposito Libero</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">26% Ritenuta</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyAccountPreset('CONTO_DEPOSITO_VINCOLATO')}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-all text-left cursor-pointer ${
                      accType === 'CONTO_DEPOSITO_VINCOLATO'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-extrabold text-slate-900 flex items-center gap-1">
                      <span>🔒 Dep. Vincolato</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">26% Ritenuta</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyAccountPreset('STRUMENTO_LIQUIDITA')}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-all text-left cursor-pointer ${
                      accType === 'STRUMENTO_LIQUIDITA'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-extrabold text-slate-900 flex items-center gap-1">
                      <span>🏛️ BOT / Monetario</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">12.5% Ritenuta</div>
                  </button>
                </div>
              </div>

              {/* Mandatory Owner / Profile Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Intestatario / Profilo Collegato <span className="text-rose-600">*</span>
                </label>
                <select
                  required
                  value={accOwnerId}
                  onChange={e => setAccOwnerId(e.target.value)}
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
                  Banca o Istituto Emittente <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Es. Fineco, Intesa Sanpaolo, CA Auto Bank, BOT Repubblica Italiana"
                  value={accInstitution}
                  onChange={e => setAccInstitution(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome Conto / Strumento <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Es. Conto Corrente Principale, Deposito Vincolato 12M, XEON ETF Monetario"
                  value={accName}
                  onChange={e => setAccName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tipologia
                  </label>
                  <select
                    value={accType}
                    onChange={e => {
                      const newType = e.target.value as BankAccountType;
                      applyAccountPreset(newType);
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="CONTO_CORRENTE">Conto Corrente (0% ritenuta)</option>
                    <option value="CONTO_DEPOSITO_LIBERO">Deposito Libero (26%)</option>
                    <option value="CONTO_DEPOSITO_VINCOLATO">Deposito Vincolato (26%)</option>
                    <option value="STRUMENTO_LIQUIDITA">Strumento Monetario / BOT (12.5%)</option>
                    <option value="BROKER">Conto Broker / Titoli</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Saldo (€) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    required
                    placeholder="25000"
                    value={accBalance}
                    onChange={e => setAccBalance(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tasso Interesse Lordo (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.0"
                    value={accInterestRate}
                    onChange={e => setAccInterestRate(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ritenuta Fiscale
                  </label>
                  <select
                    value={accTaxRate}
                    onChange={e => setAccTaxRate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value={0}>0% (Nessuna Ritenuta / Conto Corrente Ordinario)</option>
                    <option value={0.26}>26% (Conti e Depositi Bancari)</option>
                    <option value={0.125}>12.5% (BOT & Titoli di Stato)</option>
                  </select>
                </div>
              </div>

              {accType === 'CONTO_DEPOSITO_VINCOLATO' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Data Scadenza Vincolo
                  </label>
                  <input
                    type="date"
                    value={accMaturityDate}
                    onChange={e => setAccMaturityDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {editingAccountId ? 'Salva Modifiche' : 'Aggiungi Conto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Asset Confirmation Modal */}
      {assetToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Rimuovere questo titolo?
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Stai per rimuovere definitivamente <strong className="text-slate-800">{assetToDelete.name}</strong> ({assetToDelete.isin}) dal portafoglio investimenti. Questa operazione eliminerà il titolo e i relativi flussi previsionali di cedole o dividendi.
            </p>
            <div className="flex items-center justify-end gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setAssetToDelete(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteFinancialAsset(assetToDelete.id);
                  setAssetToDelete(null);
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Conferma Rimozione
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Asset Modal */}
      <EditAssetModal
        asset={editingAsset}
        isOpen={Boolean(editingAsset)}
        onClose={() => setEditingAsset(null)}
      />

      {/* Sell Modal with Real-time Tax Calculation */}
      {sellingAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Simulazione Vendita & Calcolo Plusvalenza Fiscale
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {sellingAsset.name} ({sellingAsset.isin})
            </p>

            <div className="space-y-4 my-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantità da Vendere (Max {sellingAsset.quantity})
                </label>
                <input
                  type="number"
                  value={sellQuantity}
                  onChange={e => setSellQuantity(Number(e.target.value))}
                  max={sellingAsset.quantity}
                  min={1}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prezzo Unitario di Vendita (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={sellPrice}
                  onChange={e => setSellPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              {/* Tax Engine Calculation Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-sans">Controvalore Vendita:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(sellProceeds)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-sans">Costo Fiscale (PMC):</span>
                  <span className="text-slate-600">{formatCurrency(sellCostBasis)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1 font-bold">
                  <span className="text-slate-900 font-sans">Plusvalenza Lorda:</span>
                  <span className={sellGain >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                    {sellGain >= 0 ? '+' : ''}{formatCurrency(sellGain)}
                  </span>
                </div>

                {offsetAmount > 0 && (
                  <div className="flex justify-between text-indigo-700">
                    <span className="font-sans">Compensazione Minusvalenze:</span>
                    <span>-{formatCurrency(offsetAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-rose-600">
                  <span className="font-sans">Imposta da Versare ({formatPercent(sellTaxRate)}):</span>
                  <span>-{formatCurrency(sellTaxDue)}</span>
                </div>

                <div className="flex justify-between border-t border-slate-200 pt-1 text-sm font-bold text-slate-900">
                  <span className="font-sans">Guadagno Netto Realizzato:</span>
                  <span className="text-emerald-600">{formatCurrency(sellGainNet)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSellingAsset(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleConfirmSell}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors"
              >
                Conferma Vendita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
