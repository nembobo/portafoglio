import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingUp,
  Home,
  Search,
  Sparkles,
  RefreshCw,
  Link2,
  Check,
  Calendar,
  Layers,
  Info,
  DollarSign,
  Receipt,
  Plus,
  Trash2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { useWealth } from '../../context/WealthContext';
import { AssetCategory, PropertyExpense, ExpenseFrequency } from '../../types';
import { lookupOnlineAsset, AssetOnlineQuote } from '../../utils/marketDataService';
import { formatCurrency, formatPercent } from '../../utils/financialEngine';
import { calculateExpenseAnnual } from '../../utils/propertyExpenseUtils';

interface InitialExpenseInput {
  id: string;
  name: string;
  amount: number;
  frequency: ExpenseFrequency;
  category: 'CONDOMINIO' | 'IMU' | 'MANUTENZIONE' | 'ASSICURAZIONE' | 'ALTRO';
}

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'FINANCIAL' | 'PROPERTY' | 'DEBT' | 'ALTERNATIVE';
  mode?: 'ALL' | 'FINANCIAL' | 'PROPERTY';
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'FINANCIAL',
  mode = 'ALL'
}) => {
  const {
    addFinancialAsset,
    addProperty,
    addRentalContract,
    selectedOwnerId,
    customTaxRates,
    addCustomTaxRate,
    combineTaxRates
  } = useWealth();

  const initialType = mode === 'PROPERTY' ? 'PROPERTY' : mode === 'FINANCIAL' ? 'FINANCIAL' : defaultType;
  const [assetType, setAssetType] = useState<'FINANCIAL' | 'PROPERTY' | 'DEBT' | 'ALTERNATIVE'>(initialType);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'PROPERTY') {
        setAssetType('PROPERTY');
      } else if (mode === 'FINANCIAL') {
        setAssetType('FINANCIAL');
      } else if (defaultType) {
        setAssetType(defaultType);
      }
    }
  }, [isOpen, mode, defaultType]);

  // Financial Asset Form State
  const [finName, setFinName] = useState('');
  const [finIsin, setFinIsin] = useState('');
  const [finCategory, setFinCategory] = useState<AssetCategory>('GOV_BOND');
  const [finQuantity, setFinQuantity] = useState(1000);
  const [finPrice, setFinPrice] = useState(100);
  const [finBuyPrice, setFinBuyPrice] = useState(100);
  const [finIsBond, setFinIsBond] = useState(true);
  const [finCouponRate, setFinCouponRate] = useState(0.0435);
  const [finCouponFreq, setFinCouponFreq] = useState<'SEMESTRAL' | 'ANNUAL'>('SEMESTRAL');
  const [finTaxRate, setFinTaxRate] = useState(0.125);
  const [finMaturityDate, setFinMaturityDate] = useState('2033-11-01');

  // Online Quote State & Time Series
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [onlineQuote, setOnlineQuote] = useState<AssetOnlineQuote | null>(null);
  const [chartPeriod, setChartPeriod] = useState<'1M' | '6M' | '1Y' | '3Y' | '5Y'>('1Y');
  const [chartMode, setChartMode] = useState<'PRICE' | 'VALUE'>('PRICE');

  // Property Form State
  const [propName, setPropName] = useState('');
  const [propAddress, setPropAddress] = useState('');
  const [propCity, setPropCity] = useState('Milano');
  const [propPurchaseVal, setPropPurchaseVal] = useState(300000);
  const [propCurrentVal, setPropCurrentVal] = useState(320000);
  const [hasRentalContract, setHasRentalContract] = useState(true);
  const [tenantName, setTenantName] = useState('');
  const [monthlyRent, setMonthlyRent] = useState(1200);

  // Initial Expenses during creation
  const [propExpenses, setPropExpenses] = useState<InitialExpenseInput[]>([]);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState<number | ''>('');
  const [newExpenseFrequency, setNewExpenseFrequency] = useState<ExpenseFrequency>('MONTHLY');
  const [newExpenseCategory, setNewExpenseCategory] = useState<'CONDOMINIO' | 'IMU' | 'MANUTENZIONE' | 'ASSICURAZIONE' | 'ALTRO'>('CONDOMINIO');

  const handleAddInitialExpense = () => {
    if (!newExpenseName.trim() || !newExpenseAmount || Number(newExpenseAmount) <= 0) return;
    setPropExpenses(prev => [
      ...prev,
      {
        id: `init-exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: newExpenseName.trim(),
        amount: Number(newExpenseAmount),
        frequency: newExpenseFrequency,
        category: newExpenseCategory
      }
    ]);
    setNewExpenseName('');
    setNewExpenseAmount('');
  };

  const handleRemoveInitialExpense = (id: string) => {
    setPropExpenses(prev => prev.filter(e => e.id !== id));
  };

  const calculatedInitialAnnualExpenses = propExpenses.reduce(
    (sum, exp) => sum + calculateExpenseAnnual(exp.amount, exp.frequency),
    0
  );
  const calculatedInitialMonthlyExpenses = calculatedInitialAnnualExpenses / 12;

  // Tax Customization for Property / Rental
  const [selectedTaxRateId, setSelectedTaxRateId] = useState<string>('rate-cedolare-21');
  const [isCustomRateActive, setIsCustomRateActive] = useState(false);
  const [customTaxRateInput, setCustomTaxRateInput] = useState<number>(21);
  const [showCombineModal, setShowCombineModal] = useState(false);
  const [combineRate1, setCombineRate1] = useState('rate-cedolare-21');
  const [combineRate2, setCombineRate2] = useState('rate-irpef-23');
  const [combineWeight1, setCombineWeight1] = useState(50);

  if (!isOpen) return null;

  // Handle Online Asset Search
  const handleOnlineLookup = async (queryToSearch?: string) => {
    const q = queryToSearch || finIsin || finName;
    if (!q.trim()) return;

    setIsSearchingOnline(true);
    try {
      const quote = await lookupOnlineAsset(q, finQuantity);
      setOnlineQuote(quote);
      setFinName(quote.name);
      setFinIsin(quote.isin);
      setFinPrice(quote.currentPrice);
      if (quote.previousClose && finBuyPrice === 100) {
        setFinBuyPrice(quote.previousClose);
      }
      setFinCategory(quote.category);

      const isBondInstrument = quote.category === 'GOV_BOND' || quote.category === 'BOND';
      setFinIsBond(isBondInstrument);

      if (isBondInstrument) {
        setFinTaxRate(quote.category === 'GOV_BOND' ? 0.125 : 0.26);
        if (quote.couponRate !== undefined) setFinCouponRate(quote.couponRate);
        if (quote.maturityDate) setFinMaturityDate(quote.maturityDate);
        if (quote.couponFrequency) {
          setFinCouponFreq(quote.couponFrequency === 'SEMI_ANNUAL' ? 'SEMESTRAL' : 'ANNUAL');
        }
      } else {
        setFinTaxRate(0.26);
      }
    } finally {
      setIsSearchingOnline(false);
    }
  };

  // Combine two tax rates
  const handleCombineRates = () => {
    const w1 = combineWeight1 / 100;
    const w2 = (100 - combineWeight1) / 100;
    const combinedId = combineTaxRates(combineRate1, combineRate2, w1, w2);
    if (combinedId) {
      setSelectedTaxRateId(combinedId);
      setIsCustomRateActive(false);
      setShowCombineModal(false);
    }
  };

  const getEffectivePropertyTaxRate = (): number => {
    if (isCustomRateActive) {
      return customTaxRateInput / 100;
    }
    const found = customTaxRates.find(r => r.id === selectedTaxRateId);
    return found ? found.rate : 0.21;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (assetType === 'FINANCIAL') {
      if (!finName || !finIsin) return;
      addFinancialAsset({
        name: finName,
        isin: finIsin.toUpperCase(),
        category: finCategory,
        quantity: Number(finQuantity),
        currentPrice: Number(finPrice),
        averageBuyPrice: Number(finBuyPrice),
        currency: 'EUR',
        accountId: 'acc-1',
        ownerId: selectedOwnerId === 'mem-all' ? 'user-1' : selectedOwnerId,
        ownershipPercentage: 100,
        isBond: finIsBond,
        annualCouponRate: finIsBond ? Number(finCouponRate) : undefined,
        couponFrequency: finIsBond ? (finCouponFreq === 'SEMESTRAL' ? 'SEMI_ANNUAL' : 'ANNUAL') : undefined,
        maturityDate: finIsBond ? finMaturityDate : undefined,
        taxRate: Number(finTaxRate),
        unrealizedGainTaxRate: Number(finTaxRate),
        totalCouponsOrDividendsReceived: 0,
        irrEstimated: Number(finIsBond ? ((finCouponRate * 100) + 0.35).toFixed(1) : 7.5)
      });
    } else if (assetType === 'PROPERTY') {
      if (!propName || !propAddress) return;
      const propId = `prop-${Date.now()}`;
      const effTaxRate = getEffectivePropertyTaxRate();

      const finalExpenses: PropertyExpense[] = propExpenses.map((exp, idx) => ({
        id: `exp-${propId}-${idx + 1}-${Date.now()}`,
        propertyId: propId,
        name: exp.name,
        amount: exp.amount,
        frequency: exp.frequency,
        category: exp.category
      }));

      addProperty({
        id: propId,
        name: propName,
        address: propAddress,
        city: propCity,
        type: 'AFFITTO_LUNGO_TERMINE',
        purchaseDate: new Date().toISOString().split('T')[0],
        purchaseValue: Number(propPurchaseVal),
        currentValue: Number(propCurrentVal),
        sqm: 85,
        annualExpenses: calculatedInitialAnnualExpenses,
        annualTaxes: 0,
        annualInsurance: 0,
        annualMaintenance: 0,
        expenses: finalExpenses,
        taxRate: effTaxRate,
        ownerId: selectedOwnerId === 'mem-all' ? 'user-1' : selectedOwnerId,
        ownershipPercentage: 100
      });

      if (hasRentalContract && tenantName && monthlyRent > 0) {
        addRentalContract({
          propertyId: propId,
          tenantName,
          monthlyRent: Number(monthlyRent),
          paymentFrequency: 'MONTHLY',
          paymentDayOfMonth: 5,
          startDate: new Date().toISOString().split('T')[0],
          endDate: '2028-12-31',
          additionalExpensesMonthly: 0,
          securityDeposit: Number(monthlyRent) * 3,
          istatRevaluation: true,
          taxRegime: effTaxRate === 0.21 ? 'CEDOLARE_SECCA' : 'ORDINARIO',
          taxRate: effTaxRate,
          active: true
        });
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 overflow-y-auto max-h-[92vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <span>
                {mode === 'FINANCIAL'
                  ? 'Nuovo Titolo / BTP (Azioni, ETF, Obbligazioni)'
                  : mode === 'PROPERTY'
                  ? 'Nuovo Immobile & Locazione'
                  : 'Aggiungi Asset al Patrimonio'}
              </span>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                {mode === 'PROPERTY' ? 'Aliquote & Canoni' : 'Ripresa Live & Mercati'}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              {mode === 'FINANCIAL'
                ? 'Collega con ISIN o Ticker per storico e prezzi live da Yahoo Finance, o inserisci i valori manualmente.'
                : mode === 'PROPERTY'
                ? 'Inserisci un immobile, imposta il valore d\'acquisto e attuale, il canone di locazione e le aliquote fiscali.'
                : 'Collega con ISIN/Ticker per storico e prezzi live, oppure inserisci immobili con aliquote fiscali su misura.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Asset Type Selector - ONLY visible when mode is 'ALL' (e.g. from Dashboard or Header) */}
        {mode === 'ALL' && (
          <div className="grid grid-cols-2 gap-2 my-4">
            <button
              type="button"
              onClick={() => setAssetType('FINANCIAL')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                assetType === 'FINANCIAL'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs shadow-indigo-100'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Titolo / BTP / ETF / Azione (Online ISIN)</span>
            </button>
            <button
              type="button"
              onClick={() => setAssetType('PROPERTY')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                assetType === 'PROPERTY'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs shadow-indigo-100'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Immobile & Locazione (Aliquote Flessibili)</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {assetType === 'FINANCIAL' && (
            <>
              {/* Online Lookup Card */}
              <div className="p-3.5 bg-indigo-50/40 rounded-xl border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Ripresa Online da Mercato (ISIN o Ticker)</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Mercato Live Attivo
                  </span>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Digita ISIN (es. IT0005544082) o Ticker (VWCE, RACE, AAPL)..."
                      value={finIsin}
                      onChange={e => setFinIsin(e.target.value.toUpperCase())}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleOnlineLookup();
                        }
                      }}
                      className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 bg-white font-mono text-xs uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOnlineLookup()}
                    disabled={isSearchingOnline}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-xs shadow-indigo-100"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSearchingOnline ? 'animate-spin' : ''}`} />
                    <span>{isSearchingOnline ? 'Ricerca...' : 'Cerca Online'}</span>
                  </button>
                </div>

                {/* Fast Preset Chips */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className="text-slate-400 font-medium">Predefiniti:</span>
                  {[
                    { label: 'BTP 2033 (IT0005544082)', isin: 'IT0005544082' },
                    { label: 'VWCE All-World ETF', isin: 'IE00BK5BQT80' },
                    { label: 'BTP Valore 2030', isin: 'IT0005584856' },
                    { label: 'Ferrari (RACE)', isin: 'NL0011585146' },
                    { label: 'Apple (AAPL)', isin: 'US0378331005' }
                  ].map(preset => (
                    <button
                      key={preset.isin}
                      type="button"
                      onClick={() => {
                        setFinIsin(preset.isin);
                        handleOnlineLookup(preset.isin);
                      }}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 font-medium transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Online Quote Result & Time Series Preview */}
                {onlineQuote && (
                  <div className="mt-3 p-3 bg-white rounded-xl border border-indigo-200 shadow-2xs space-y-3 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{onlineQuote.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          ISIN: {onlineQuote.isin} {onlineQuote.ticker && `• Ticker: ${onlineQuote.ticker}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-extrabold font-mono text-slate-900">
                            €{onlineQuote.currentPrice.toFixed(2)}
                          </div>
                          <div className={`text-[10px] font-bold font-mono ${onlineQuote.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {onlineQuote.changePercent >= 0 ? '+' : ''}{onlineQuote.changePercent}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Historical Time Series: Value & Price over time */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                            Andamento Storico:
                          </span>
                          <div className="flex bg-slate-100 p-0.5 rounded text-[9px]">
                            <button
                              type="button"
                              onClick={() => setChartMode('PRICE')}
                              className={`px-1.5 py-0.5 rounded font-semibold ${chartMode === 'PRICE' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500'}`}
                            >
                              Prezzo Unitario
                            </button>
                            <button
                              type="button"
                              onClick={() => setChartMode('VALUE')}
                              className={`px-1.5 py-0.5 rounded font-semibold ${chartMode === 'VALUE' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500'}`}
                            >
                              Valore Totale (€)
                            </button>
                          </div>
                        </div>

                        {/* Timeframe pills */}
                        <div className="flex items-center gap-1">
                          {(['1M', '6M', '1Y', '3Y', '5Y'] as const).map(period => (
                            <button
                              key={period}
                              type="button"
                              onClick={() => setChartPeriod(period)}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-colors ${
                                chartPeriod === period
                                  ? 'bg-indigo-600 text-white shadow-2xs'
                                  : 'text-slate-400 hover:text-slate-700 bg-slate-50'
                              }`}
                            >
                              {period}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Mini Chart */}
                      <div className="h-28 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={onlineQuote.timeSeries[chartPeriod]} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="quoteGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94A3B8' }} stroke="#E2E8F0" />
                            <YAxis
                              tick={{ fontSize: 9, fill: '#94A3B8' }}
                              stroke="#E2E8F0"
                              domain={['auto', 'auto']}
                              tickFormatter={val => chartMode === 'VALUE' ? `€${(val/1000).toFixed(0)}k` : `€${val}`}
                            />
                            <Tooltip
                              formatter={(val: any) => [
                                chartMode === 'VALUE' ? formatCurrency(Number(val)) : `€${Number(val).toFixed(2)}`,
                                chartMode === 'VALUE' ? 'Valore Stimato' : 'Prezzo Unitario'
                              ]}
                              contentStyle={{
                                backgroundColor: '#0F172A',
                                borderRadius: '8px',
                                color: '#F8FAFC',
                                fontSize: '11px',
                                padding: '4px 8px'
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey={chartMode === 'VALUE' ? 'value' : 'price'}
                              stroke="#4F46E5"
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#quoteGrad)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Asset Core Details Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome Strumento</label>
                  <input
                    type="text"
                    required
                    placeholder="es. BTP 4.35% 2033"
                    value={finName}
                    onChange={e => setFinName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Categoria Asset</label>
                  <select
                    value={finCategory}
                    onChange={e => {
                      const cat = e.target.value as AssetCategory;
                      setFinCategory(cat);
                      const isBondType = cat === 'GOV_BOND' || cat === 'BOND';
                      setFinIsBond(isBondType);
                      setFinTaxRate(cat === 'GOV_BOND' ? 0.125 : 0.26);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="GOV_BOND">Titolo di Stato / BTP (12.5% Tax)</option>
                    <option value="BOND">Obbligazione Corporate (26% Tax)</option>
                    <option value="ETF">ETF Indicizzato (26% Tax)</option>
                    <option value="STOCK">Azione / Equity (26% Tax)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantità / Nominale</label>
                  <input
                    type="number"
                    value={finQuantity}
                    onChange={e => setFinQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prezzo Medio (PMC)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={finBuyPrice}
                    onChange={e => setFinBuyPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prezzo Attuale</label>
                  <input
                    type="number"
                    step="0.01"
                    value={finPrice}
                    onChange={e => setFinPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Bond coupon and tax rate settings */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isBondCheck"
                    checked={finIsBond}
                    onChange={e => {
                      setFinIsBond(e.target.checked);
                      setFinTaxRate(e.target.checked ? 0.125 : 0.26);
                    }}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="isBondCheck" className="font-bold text-slate-900 cursor-pointer">
                    È un'obbligazione o Titolo di Stato (BTP con flusso cedolare periodico)
                  </label>
                </div>

                {finIsBond && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tasso Cedola Annuo (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={Number((finCouponRate * 100).toFixed(2))}
                        onChange={e => setFinCouponRate(Number(e.target.value) / 100)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                      <span className="text-[10px] text-slate-400">es. 4.35% per BTP 2033</span>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Frequenza Cedola</label>
                      <select
                        value={finCouponFreq}
                        onChange={e => setFinCouponFreq(e.target.value as any)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        <option value="SEMESTRAL">Semestrale (ogni 6 mesi)</option>
                        <option value="ANNUAL">Annuale (1 volta l'anno)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Scadenza Titolo</label>
                      <input
                        type="date"
                        value={finMaturityDate}
                        onChange={e => setFinMaturityDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {assetType === 'PROPERTY' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome Immobile</label>
                  <input
                    type="text"
                    required
                    placeholder="es. Bilocale Centro Storico"
                    value={propName}
                    onChange={e => setPropName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Città & Indirizzo</label>
                  <input
                    type="text"
                    required
                    placeholder="es. Corso Buenos Aires 12, Milano"
                    value={propAddress}
                    onChange={e => setPropAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prezzo Acquisto (€)</label>
                  <input
                    type="number"
                    value={propPurchaseVal}
                    onChange={e => setPropPurchaseVal(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valutazione Attuale (€)</label>
                  <input
                    type="number"
                    value={propCurrentVal}
                    onChange={e => setPropCurrentVal(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Tax Rate Customizer Box */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Aliquota Fiscale Applicata</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCombineModal(true)}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Link2 className="w-3 h-3" />
                    <span>Combina Due Aliquote (es. 21% + 23%)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Seleziona Profilo Fiscale:
                    </label>
                    <select
                      disabled={isCustomRateActive}
                      value={selectedTaxRateId}
                      onChange={e => setSelectedTaxRateId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:opacity-50 text-xs"
                    >
                      {customTaxRates
                        .filter(r => r.category === 'IMMOBILI' || r.category === 'MISTO')
                        .map(rate => (
                          <option key={rate.id} value={rate.id}>
                            {rate.name} - {(rate.rate * 100).toFixed(1)}%
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-slate-600">
                        O Inserisci Aliquota Libera:
                      </label>
                      <label className="flex items-center gap-1 text-[10px] text-indigo-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isCustomRateActive}
                          onChange={e => setIsCustomRateActive(e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Attiva Custom</span>
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        disabled={!isCustomRateActive}
                        value={customTaxRateInput}
                        onChange={e => setCustomTaxRateInput(Number(e.target.value))}
                        className={`w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          isCustomRateActive ? 'bg-white text-slate-900 border-indigo-400 font-bold' : 'bg-slate-100 text-slate-400'
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span>Aliquota effettiva per questo immobile:</span>
                  <strong className="text-indigo-700 font-bold font-mono text-xs">
                    {(getEffectivePropertyTaxRate() * 100).toFixed(1)}%
                  </strong>
                </div>
              </div>

              {/* Rental Contract */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasContractCheck"
                    checked={hasRentalContract}
                    onChange={e => setHasRentalContract(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="hasContractCheck" className="font-bold text-slate-900 cursor-pointer">
                    Immobile a reddito (Genera canone mensile continuo)
                  </label>
                </div>

                {hasRentalContract && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nome Inquilino / Conduttore</label>
                      <input
                        type="text"
                        placeholder="es. Mario Rossi"
                        value={tenantName}
                        onChange={e => setTenantName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Canone Mensile Lordo (€)</label>
                      <input
                        type="number"
                        value={monthlyRent}
                        onChange={e => setMonthlyRent(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sezione: Spese Ricorrenti Immobile (Opzionale alla creazione) */}
              <div className="p-3.5 bg-amber-50/40 rounded-xl border border-amber-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950 text-xs">
                    <Receipt className="w-4 h-4 text-amber-600" />
                    <span>Spese Ricorrenti dell'Immobile (Opzionale)</span>
                  </div>
                  <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-semibold">
                    {propExpenses.length} {propExpenses.length === 1 ? 'spesa definita' : 'spese definite'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-snug">
                  Puoi inserire subito le spese periodiche (es. spese condominiali, IMU, assicurazione o manutenzioni stimate). Se non ne inserisci, l'immobile verrà salvato a spese zero.
                </p>

                {/* Input Riga Nuova Spesa */}
                <div className="p-2.5 bg-white rounded-lg border border-amber-200 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Nome / Voce di Spesa</label>
                      <input
                        type="text"
                        placeholder="es. Spese Condominiali ordinarie"
                        value={newExpenseName}
                        onChange={e => setNewExpenseName(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Importo (€)</label>
                      <input
                        type="number"
                        placeholder="es. 80"
                        value={newExpenseAmount}
                        onChange={e => setNewExpenseAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Frequenza</label>
                      <select
                        value={newExpenseFrequency}
                        onChange={e => setNewExpenseFrequency(e.target.value as ExpenseFrequency)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-amber-500 bg-white"
                      >
                        <option value="MONTHLY">Mensile</option>
                        <option value="BIMONTHLY">Bimestrale</option>
                        <option value="QUARTERLY">Trimestrale</option>
                        <option value="SEMIANNUAL">Semestrale</option>
                        <option value="ANNUAL">Annuale</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">Categoria:</span>
                      <select
                        value={newExpenseCategory}
                        onChange={e => setNewExpenseCategory(e.target.value as any)}
                        className="text-[11px] border border-slate-200 rounded px-2 py-0.5 bg-white"
                      >
                        <option value="CONDOMINIO">Condominio</option>
                        <option value="IMU">IMU / Tributi</option>
                        <option value="ASSICURAZIONE">Assicurazione</option>
                        <option value="MANUTENZIONE">Manutenzione</option>
                        <option value="ALTRO">Altro</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddInitialExpense}
                      disabled={!newExpenseName.trim() || !newExpenseAmount || Number(newExpenseAmount) <= 0}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-md text-xs font-bold transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Aggiungi Spesa</span>
                    </button>
                  </div>
                </div>

                {/* Lista Spese Inserite */}
                {propExpenses.length > 0 && (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {propExpenses.map(exp => (
                      <div
                        key={exp.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-amber-100 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            {exp.category}
                          </span>
                          <span className="font-medium text-slate-800">{exp.name}</span>
                          <span className="text-slate-400 text-[11px]">({exp.frequency.toLowerCase()})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-700">
                            -€{exp.amount.toLocaleString('it-IT')}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveInitialExpense(exp.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Rimuovi spesa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Box Totale Spese e Riepilogo Calcolo Guadagno */}
                <div className="p-3 bg-white rounded-xl border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Totale Spese Immobile:</span>
                    <span className="font-mono font-bold text-amber-700">
                      -{formatCurrency(calculatedInitialAnnualExpenses)}/anno (-{formatCurrency(calculatedInitialMonthlyExpenses)}/mese)
                    </span>
                  </div>

                  {hasRentalContract && monthlyRent > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span>Formula Calcolo Guadagno Netto:</span>
                        <span className="font-mono">Canone Lordo - Spese - Tasse</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-center font-mono text-[11px] p-2 bg-slate-50 rounded-lg">
                        <div>
                          <div className="text-[9px] text-slate-400">Canone Mese</div>
                          <div className="font-bold text-slate-900">+{formatCurrency(monthlyRent)}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-amber-600">Spese Mese</div>
                          <div className="font-bold text-amber-600">-{formatCurrency(calculatedInitialMonthlyExpenses)}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-rose-600">Tasse Mese</div>
                          <div className="font-bold text-rose-600">-{formatCurrency((monthlyRent * getEffectivePropertyTaxRate()))}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-emerald-600">Netto Mese</div>
                          <div className="font-bold text-emerald-600">
                            +{formatCurrency(
                              Math.max(
                                0,
                                monthlyRent -
                                  calculatedInitialMonthlyExpenses -
                                  monthlyRent * getEffectivePropertyTaxRate()
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors text-xs"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs shadow-indigo-100 transition-colors text-xs"
            >
              Salva Asset
            </button>
          </div>
        </form>
      </div>

      {/* Modal for Combining Two Tax Rates */}
      {showCombineModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-indigo-600" />
                <span>Combina Due Aliquote Fiscali</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCombineModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Crea una nuova aliquota ponderata combinando due tipologie di tassazione (ad es. per locazioni con regimi misti o porzioni ad aliquote diverse 21% e 23%).
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Prima Aliquota (A):</label>
                <select
                  value={combineRate1}
                  onChange={e => setCombineRate1(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                >
                  {customTaxRates.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({(r.rate * 100).toFixed(1)}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Seconda Aliquota (B):</label>
                <select
                  value={combineRate2}
                  onChange={e => setCombineRate2(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                >
                  {customTaxRates.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({(r.rate * 100).toFixed(1)}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Ripartizione / Peso:</span>
                  <span className="font-mono text-indigo-600">{combineWeight1}% A • {100 - combineWeight1}% B</span>
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

              {/* Calculated Result Box */}
              {(() => {
                const r1 = customTaxRates.find(r => r.id === combineRate1)?.rate || 0.21;
                const r2 = customTaxRates.find(r => r.id === combineRate2)?.rate || 0.23;
                const combined = ((r1 * combineWeight1 / 100) + (r2 * (100 - combineWeight1) / 100)) * 100;
                return (
                  <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-indigo-900">Aliquota Finale Combinata:</span>
                    <strong className="font-mono text-base font-bold text-indigo-700">
                      {combined.toFixed(2)}%
                    </strong>
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCombineModal(false)}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleCombineRates}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
              >
                Salva & Applica all'Immobile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
