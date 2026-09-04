import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  FamilyMember,
  BankAccount,
  FinancialAsset,
  Property,
  RentalContract,
  Liability,
  AlternativeAsset,
  CompanyParticipation,
  FinancialEvent,
  SmartRule,
  TaxLoss,
  RealizedGain,
  GlobalTaxProfile,
  AssetDocument,
  TaxDisplayMode,
  CustomTaxRate,
  PropertyExpense,
  RegularIncome
} from '../types';
import {
  INITIAL_FAMILY_MEMBERS,
  INITIAL_ACCOUNTS,
  INITIAL_FINANCIAL_ASSETS,
  INITIAL_PROPERTIES,
  INITIAL_RENTAL_CONTRACTS,
  INITIAL_LIABILITIES,
  INITIAL_ALTERNATIVES,
  INITIAL_COMPANIES,
  INITIAL_SMART_RULES,
  INITIAL_TAX_LOSSES,
  INITIAL_REALIZED_GAINS,
  INITIAL_GLOBAL_TAX_PROFILE,
  INITIAL_DOCUMENTS,
  INITIAL_CUSTOM_TAX_RATES,
  INITIAL_REGULAR_INCOMES
} from '../data/initialData';
import { generateAutomatedEvents, calculateUnrealizedTax } from '../utils/financialEngine';
import { KNOWN_INSTRUMENTS, lookupOnlineAsset } from '../utils/marketDataService';
import { calculateExpenseAnnual, calculatePropertyTotalAnnualExpenses } from '../utils/propertyExpenseUtils';

export type NavigationTab =
  | 'dashboard'
  | 'networth'
  | 'investments'
  | 'realestate'
  | 'cashflow'
  | 'income'
  | 'calendar'
  | 'accounts'
  | 'liabilities'
  | 'companies'
  | 'alternatives'
  | 'taxes'
  | 'banking'
  | 'reports'
  | 'documents';

interface WealthContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  taxDisplayMode: TaxDisplayMode;
  setTaxDisplayMode: (mode: TaxDisplayMode) => void;
  showAfterTaxNetWorth: boolean;
  setShowAfterTaxNetWorth: (enabled: boolean) => void;
  selectedOwnerId: string;
  setSelectedOwnerId: (ownerId: string) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;

  familyMembers: FamilyMember[];
  accounts: BankAccount[];
  assets: FinancialAsset[];
  properties: Property[];
  rentalContracts: RentalContract[];
  liabilities: Liability[];
  alternatives: AlternativeAsset[];
  companies: CompanyParticipation[];
  smartRules: SmartRule[];
  taxLosses: TaxLoss[];
  realizedGains: RealizedGain[];
  taxProfile: GlobalTaxProfile;
  customTaxRates: CustomTaxRate[];
  documents: AssetDocument[];
  events: FinancialEvent[];

  // Market Sync
  lastMarketSyncTime: string;
  isSyncingMarket: boolean;
  syncOnlineMarketPrices: () => Promise<number>;
  updateAssetPrice: (assetId: string, newPrice: number) => void;

  // Filtered views
  filteredAssets: FinancialAsset[];
  filteredProperties: Property[];
  filteredRentalContracts: RentalContract[];
  filteredLiabilities: Liability[];
  filteredAlternatives: AlternativeAsset[];
  filteredAccounts: BankAccount[];
  filteredCompanies: CompanyParticipation[];
  filteredEvents: FinancialEvent[];
  filteredRegularIncomes: RegularIncome[];
  regularIncomes: RegularIncome[];
  showFamilyConsolidated: boolean;
  setShowFamilyConsolidated: (show: boolean) => void;
  toggleShowFamilyConsolidated: () => void;

  // Computed Metrics
  grossWealth: number;
  totalDebts: number;
  netWorth: number;
  latentTaxLiability: number;
  afterTaxNetWorth: number;
  netWorthChangeAmount: number;
  netWorthChangePercent: number;

  financialPortfolioValue: number;
  realEstateTotalValue: number;
  realEstateNetEquity: number;
  alternativeAssetsTotal: number;
  companiesTotal: number;
  cashTotal: number;

  // Passive Income (Yearly & Monthly)
  annualGrossPassiveIncome: number;
  annualNetPassiveIncome: number;
  annualPassiveTaxes: number;
  totalPropertyExpenses: number;
  monthlyPassiveIncomeGross: number;
  monthlyPassiveIncomeNet: number;

  // Next 30 days inflows & outflows
  next30DaysEvents: FinancialEvent[];
  overdueEvents: FinancialEvent[];

  // Tax Engine Metrics
  taxMetrics: {
    totalGrossIncome: number;
    totalTaxesAccrued: number;
    totalNetIncome: number;
    taxesPaid: number;
    taxesPayable: number;
    effectiveTaxRate: number;
    realizedCapitalGains: number;
    realizedCapitalLosses: number;
    availableMinusvalenze: number;
    unrealizedGainsTotal: number;
    taxesBreakdown: {
      affitti: number;
      cedole: number;
      dividendi: number;
      plusvalenze: number;
      interessi: number;
    };
  };

  // Actions
  confirmEventReceived: (eventId: string) => void;
  addFamilyMember: (member: Omit<FamilyMember, 'id'> & { id?: string }) => string;
  updateFamilyMember: (id: string, updates: Partial<FamilyMember>) => void;
  deleteFamilyMember: (id: string) => void;
  addCustomTaxRate: (rate: Omit<CustomTaxRate, 'id'> & { id?: string }) => string;
  updateCustomTaxRate: (id: string, updates: Partial<CustomTaxRate>) => void;
  deleteCustomTaxRate: (id: string) => void;
  combineTaxRates: (rateId1: string, rateId2: string, weight1?: number, weight2?: number, combinedName?: string) => string;
  addFinancialAsset: (asset: Omit<FinancialAsset, 'id'> & { id?: string }) => string;
  updateFinancialAsset: (assetId: string, updates: Partial<FinancialAsset>) => void;
  deleteFinancialAsset: (assetId: string) => void;
  sellFinancialAsset: (assetId: string, sellQty: number, sellPrice: number) => void;
  addProperty: (property: Omit<Property, 'id'> & { id?: string }) => string;
  updateProperty: (propertyId: string, updates: Partial<Property>) => void;
  deleteProperty: (propertyId: string) => void;
  addPropertyExpense: (propertyId: string, expense: Omit<PropertyExpense, 'id' | 'propertyId'>) => string;
  updatePropertyExpense: (propertyId: string, expenseId: string, updates: Partial<PropertyExpense>) => void;
  deletePropertyExpense: (propertyId: string, expenseId: string) => void;
  addRentalContract: (contract: Omit<RentalContract, 'id'> & { id?: string }) => string;
  updateRentalContract: (id: string, updates: Partial<RentalContract>) => void;
  addAccount: (account: Omit<BankAccount, 'id'> & { id?: string }) => string;
  updateAccount: (id: string, updates: Partial<BankAccount>) => void;
  deleteAccount: (id: string) => void;
  addRegularIncome: (income: Omit<RegularIncome, 'id'> & { id?: string }) => string;
  updateRegularIncome: (id: string, updates: Partial<RegularIncome>) => void;
  deleteRegularIncome: (id: string) => void;
  addLiability: (liability: Omit<Liability, 'id'> & { id?: string }) => string;
  addAlternative: (alt: Omit<AlternativeAsset, 'id'> & { id?: string }) => string;
  updateAlternative: (id: string, updates: Partial<AlternativeAsset>) => void;
  deleteAlternative: (id: string) => void;
  addSmartRule: (rule: Omit<SmartRule, 'id'> & { id?: string }) => string;
  toggleSmartRule: (ruleId: string) => void;
  deleteSmartRule: (ruleId: string) => void;
  processBankMovement: (keywordMatch: string, amount: number, date: string) => { matched: boolean; message: string };
  updateTaxProfile: (updates: Partial<GlobalTaxProfile>) => void;
  markTaxPaid: (gainId: string) => void;
  resetToDemo: () => void;
  resetToEmpty: () => void;
  exportWorkspaceJSON: () => string;
  importWorkspaceJSON: (jsonStr: string) => boolean;
  isFirstVisit: boolean;
  dismissFirstVisit: () => void;
}

const WealthContext = createContext<WealthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'patrimonio_wealth_app_v2';

export const WealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [taxDisplayMode, setTaxDisplayMode] = useState<TaxDisplayMode>('GROSS');
  const [showAfterTaxNetWorth, setShowAfterTaxNetWorth] = useState<boolean>(true);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('mem-all');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [showFamilyConsolidated, setShowFamilyConsolidated] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_show_family_consolidated`);
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Core entities
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_family_members`);
    return saved ? JSON.parse(saved) : INITIAL_FAMILY_MEMBERS;
  });

  const [customTaxRates, setCustomTaxRates] = useState<CustomTaxRate[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_custom_tax_rates`);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOM_TAX_RATES;
  });

  const [lastMarketSyncTime, setLastMarketSyncTime] = useState<string>('Oggi, 17:30');
  const [isSyncingMarket, setIsSyncingMarket] = useState<boolean>(false);

  const [accounts, setAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_accounts`);
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [regularIncomes, setRegularIncomes] = useState<RegularIncome[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_regular_incomes`);
    return saved ? JSON.parse(saved) : INITIAL_REGULAR_INCOMES;
  });

  const [assets, setAssets] = useState<FinancialAsset[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_assets`);
    return saved ? JSON.parse(saved) : INITIAL_FINANCIAL_ASSETS;
  });

  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_properties`);
    if (!saved) return INITIAL_PROPERTIES;
    try {
      const parsed: Property[] = JSON.parse(saved);
      return parsed.map(p => {
        if (p.associatedMortgageId === 'debt-mutuo-1') {
          return { ...p, associatedMortgageId: undefined };
        }
        return p;
      });
    } catch {
      return INITIAL_PROPERTIES;
    }
  });

  const [rentalContracts, setRentalContracts] = useState<RentalContract[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_rentals`);
    return saved ? JSON.parse(saved) : INITIAL_RENTAL_CONTRACTS;
  });

  const [liabilities, setLiabilities] = useState<Liability[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_liabilities`);
    if (!saved) return INITIAL_LIABILITIES;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter((l: any) => l.id !== 'debt-mutuo-1') : INITIAL_LIABILITIES;
    } catch {
      return INITIAL_LIABILITIES;
    }
  });

  const [alternatives, setAlternatives] = useState<AlternativeAsset[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_alternatives`);
    return saved ? JSON.parse(saved) : INITIAL_ALTERNATIVES;
  });

  const [companies, setCompanies] = useState<CompanyParticipation[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_companies`);
    if (!saved) return INITIAL_COMPANIES;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter((c: any) => c.id !== 'comp-aurora') : INITIAL_COMPANIES;
    } catch {
      return INITIAL_COMPANIES;
    }
  });

  const [smartRules, setSmartRules] = useState<SmartRule[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_rules`);
    return saved ? JSON.parse(saved) : INITIAL_SMART_RULES;
  });

  const [taxLosses, setTaxLosses] = useState<TaxLoss[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_losses`);
    return saved ? JSON.parse(saved) : INITIAL_TAX_LOSSES;
  });

  const [realizedGains, setRealizedGains] = useState<RealizedGain[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_gains`);
    return saved ? JSON.parse(saved) : INITIAL_REALIZED_GAINS;
  });

  const [taxProfile, setTaxProfile] = useState<GlobalTaxProfile>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_tax_profile`);
    return saved ? JSON.parse(saved) : INITIAL_GLOBAL_TAX_PROFILE;
  });

  const [documents] = useState<AssetDocument[]>(INITIAL_DOCUMENTS);

  // Automatic events engine
  const [events, setEvents] = useState<FinancialEvent[]>(() => {
    return generateAutomatedEvents(
      INITIAL_FINANCIAL_ASSETS,
      INITIAL_PROPERTIES,
      INITIAL_RENTAL_CONTRACTS,
      INITIAL_LIABILITIES
    );
  });

  // Re-generate events when assets, properties, rentals or liabilities change
  useEffect(() => {
    const autoEvents = generateAutomatedEvents(assets, properties, rentalContracts, liabilities);
    setEvents(autoEvents);
  }, [assets, properties, rentalContracts, liabilities]);

  // Persist core state
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_family_members`, JSON.stringify(familyMembers));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_custom_tax_rates`, JSON.stringify(customTaxRates));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_assets`, JSON.stringify(assets));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_properties`, JSON.stringify(properties));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_rentals`, JSON.stringify(rentalContracts));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_liabilities`, JSON.stringify(liabilities));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_alternatives`, JSON.stringify(alternatives));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_accounts`, JSON.stringify(accounts));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_rules`, JSON.stringify(smartRules));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_losses`, JSON.stringify(taxLosses));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_gains`, JSON.stringify(realizedGains));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_tax_profile`, JSON.stringify(taxProfile));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_regular_incomes`, JSON.stringify(regularIncomes));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_show_family_consolidated`, JSON.stringify(showFamilyConsolidated));
  }, [familyMembers, customTaxRates, assets, properties, rentalContracts, liabilities, alternatives, accounts, smartRules, taxLosses, realizedGains, taxProfile, regularIncomes, showFamilyConsolidated]);

  // Filtered entities based on Selected Member / Holding
  const filteredAssets = useMemo(() => {
    if (selectedOwnerId === 'mem-all') return assets;
    return assets.filter(a => a.ownerId === selectedOwnerId);
  }, [assets, selectedOwnerId]);

  const filteredProperties = useMemo(() => {
    if (selectedOwnerId === 'mem-all') return properties;
    return properties.filter(p => p.ownerId === selectedOwnerId);
  }, [properties, selectedOwnerId]);

  const filteredRentalContracts = useMemo(() => {
    const propIds = new Set(filteredProperties.map(p => p.id));
    return rentalContracts.filter(r => propIds.has(r.propertyId));
  }, [rentalContracts, filteredProperties]);

  const filteredLiabilities = useMemo(() => {
    if (selectedOwnerId === 'mem-all') return liabilities;
    return liabilities.filter(l => l.ownerId === selectedOwnerId);
  }, [liabilities, selectedOwnerId]);

  const filteredAlternatives = useMemo(() => {
    if (selectedOwnerId === 'mem-all') return alternatives;
    return alternatives.filter(a => a.ownerId === selectedOwnerId);
  }, [alternatives, selectedOwnerId]);

  const filteredAccounts = useMemo(() => {
    if (selectedOwnerId === 'mem-all') return accounts;
    return accounts.filter(a => a.ownerId === selectedOwnerId);
  }, [accounts, selectedOwnerId]);

  const filteredRegularIncomes = useMemo(() => {
    if (selectedOwnerId === 'mem-all') return regularIncomes;
    return regularIncomes.filter(r => r.ownerId === selectedOwnerId);
  }, [regularIncomes, selectedOwnerId]);

  const filteredCompanies = useMemo(() => {
    if (selectedOwnerId === 'mem-all') return companies;
    return companies.filter(c => c.parentOwnerId === selectedOwnerId);
  }, [companies, selectedOwnerId]);

  const filteredEvents = useMemo(() => {
    if (selectedOwnerId === 'mem-all') return events;
    return events.filter(e => e.ownerId === selectedOwnerId);
  }, [events, selectedOwnerId]);

  // Calculations
  const financialPortfolioValue = useMemo(() => {
    return filteredAssets.reduce((sum, a) => sum + a.quantity * a.currentPrice, 0);
  }, [filteredAssets]);

  const cashTotal = useMemo(() => {
    return filteredAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  }, [filteredAccounts]);

  const realEstateTotalValue = useMemo(() => {
    return filteredProperties.reduce((sum, p) => sum + p.currentValue, 0);
  }, [filteredProperties]);

  const totalDebts = useMemo(() => {
    return filteredLiabilities.reduce((sum, l) => sum + l.remainingCapital, 0);
  }, [filteredLiabilities]);

  const realEstateNetEquity = useMemo(() => {
    return Math.max(0, realEstateTotalValue - totalDebts);
  }, [realEstateTotalValue, totalDebts]);

  const alternativeAssetsTotal = useMemo(() => {
    return filteredAlternatives.reduce((sum, alt) => sum + alt.currentValue, 0);
  }, [filteredAlternatives]);

  const companiesTotal = useMemo(() => {
    return filteredCompanies.reduce((sum, c) => sum + c.estimatedValuation, 0);
  }, [filteredCompanies]);

  const grossWealth = useMemo(() => {
    return financialPortfolioValue + realEstateTotalValue + alternativeAssetsTotal + companiesTotal + cashTotal;
  }, [financialPortfolioValue, realEstateTotalValue, alternativeAssetsTotal, companiesTotal, cashTotal]);

  const netWorth = useMemo(() => {
    return grossWealth; // Debiti e passività rimossi su richiesta per ordine
  }, [grossWealth]);

  // Latent taxes on unrealized capital gains
  const { latentTaxLiability, unrealizedGainsTotal } = useMemo(() => {
    let taxSum = 0;
    let gainSum = 0;
    filteredAssets.forEach(a => {
      const calc = calculateUnrealizedTax(a);
      taxSum += calc.latentTax;
      gainSum += calc.unrealizedGain;
    });
    return { latentTaxLiability: taxSum, unrealizedGainsTotal: gainSum };
  }, [filteredAssets]);

  const afterTaxNetWorth = useMemo(() => {
    return netWorth - latentTaxLiability;
  }, [netWorth, latentTaxLiability]);

  const netWorthChangeAmount = 78500;
  const netWorthChangePercent = 0.043;

  // Passive Income Analytics (Annualized based on active contracts, coupons, dividends)
  const {
    annualGrossPassiveIncome,
    annualNetPassiveIncome,
    annualPassiveTaxes,
    totalPropertyExpenses,
    taxesBreakdown
  } = useMemo(() => {
    let grossRent = 0;
    let taxRent = 0;
    filteredRentalContracts.filter(r => r.active).forEach(r => {
      const annualRent = r.monthlyRent * 12;
      const rate = r.taxRate || 0.21;
      grossRent += annualRent;
      taxRent += annualRent * rate;
    });

    let grossCoupon = 0;
    let taxCoupon = 0;
    filteredAssets.filter(a => a.isBond && a.nominalValue && a.annualCouponRate).forEach(b => {
      const annualVal = (b.nominalValue || 0) * (b.annualCouponRate || 0);
      const rate = b.taxRate || 0.125;
      grossCoupon += annualVal;
      taxCoupon += annualVal * rate;
    });

    let grossDiv = 0;
    let taxDiv = 0;
    filteredAssets.filter(a => a.dividendPerShare && a.quantity).forEach(s => {
      const annualVal = (s.dividendPerShare || 0) * s.quantity;
      const rate = s.taxRate || 0.26;
      grossDiv += annualVal;
      taxDiv += annualVal * rate;
    });

    let grossDist = 0;
    filteredCompanies.forEach(c => {
      grossDist += c.dividendsReceivedYtd;
    });

    let grossInterest = 0;
    let taxInterest = 0;
    filteredAccounts.filter(a => a.interestRate && a.interestRate > 0).forEach(a => {
      const annual = a.balance * (a.interestRate || 0);
      const rate = a.taxRate || 0.26;
      grossInterest += annual;
      taxInterest += annual * rate;
    });

    // Deduct property maintenance and operating expenses
    let totalPropExpenses = 0;
    filteredProperties.forEach(p => {
      totalPropExpenses += calculatePropertyTotalAnnualExpenses(p);
    });

    const totalGross = grossRent + grossCoupon + grossDiv + grossDist + grossInterest;
    const totalTax = taxRent + taxCoupon + taxDiv + taxInterest;
    const totalNet = Math.max(0, totalGross - totalTax - totalPropExpenses);

    return {
      annualGrossPassiveIncome: totalGross,
      annualNetPassiveIncome: totalNet,
      annualPassiveTaxes: totalTax,
      totalPropertyExpenses: totalPropExpenses,
      taxesBreakdown: {
        affitti: taxRent,
        cedole: taxCoupon,
        dividendi: taxDiv,
        plusvalenze: realizedGains.reduce((sum, g) => sum + g.taxDue, 0),
        interessi: taxInterest
      }
    };
  }, [filteredRentalContracts, filteredAssets, filteredCompanies, filteredAccounts, filteredProperties, realizedGains]);

  const monthlyPassiveIncomeGross = annualGrossPassiveIncome / 12;
  const monthlyPassiveIncomeNet = annualNetPassiveIncome / 12;

  // Next 30 days events & overdue items
  const { next30DaysEvents, overdueEvents } = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const next30Date = new Date(today.getTime() + 30 * 24 * 3600 * 1000);
    const next30Str = next30Date.toISOString().split('T')[0];

    const next30 = filteredEvents.filter(e => e.date >= todayStr && e.date <= next30Str);
    const overdue = filteredEvents.filter(e => e.status === 'IN_RITARDO');

    return { next30DaysEvents: next30, overdueEvents: overdue };
  }, [filteredEvents]);

  // Tax metrics
  const taxMetrics = useMemo(() => {
    const totalGross = annualGrossPassiveIncome + realizedGains.reduce((sum, g) => sum + g.gainGross, 0);
    const totalTax = annualPassiveTaxes + realizedGains.reduce((sum, g) => sum + g.taxDue, 0);
    const totalNet = totalGross - totalTax;
    const taxesPaid = realizedGains.filter(g => g.taxPaid).reduce((sum, g) => sum + g.taxDue, 0) + 3800; // paid YTD
    const taxesPayable = Math.max(0, totalTax - taxesPaid);
    const effectiveTaxRate = totalGross > 0 ? totalTax / totalGross : 0;

    const realizedCapitalGains = realizedGains.filter(g => g.gainGross > 0).reduce((sum, g) => sum + g.gainGross, 0);
    const realizedCapitalLosses = realizedGains.filter(g => g.gainGross < 0).reduce((sum, g) => sum + Math.abs(g.gainGross), 0);
    const availableMinusvalenze = taxLosses.reduce((sum, l) => sum + l.residualAmount, 0);

    return {
      totalGrossIncome: totalGross,
      totalTaxesAccrued: totalTax,
      totalNetIncome: totalNet,
      taxesPaid,
      taxesPayable,
      effectiveTaxRate,
      realizedCapitalGains,
      realizedCapitalLosses,
      availableMinusvalenze,
      unrealizedGainsTotal,
      taxesBreakdown
    };
  }, [annualGrossPassiveIncome, annualPassiveTaxes, realizedGains, taxLosses, unrealizedGainsTotal, taxesBreakdown]);

  // Actions
  const confirmEventReceived = (eventId: string) => {
    setEvents(prev =>
      prev.map(e => {
        if (e.id === eventId) {
          return {
            ...e,
            status: e.type === 'EXPENSE' ? 'PAGATA' : 'RICEVUTA',
            confirmedDate: new Date().toISOString().split('T')[0]
          };
        }
        return e;
      })
    );
  };

  const addFinancialAsset = (newAsset: Omit<FinancialAsset, 'id'> & { id?: string }): string => {
    const id = newAsset.id || `asset-${Date.now()}`;
    setAssets(prev => [...prev, { ...newAsset, id }]);
    return id;
  };

  const sellFinancialAsset = (assetId: string, sellQty: number, sellPrice: number) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    const costBasis = sellQty * asset.averageBuyPrice;
    const proceeds = sellQty * sellPrice;
    const gainGross = proceeds - costBasis;
    const taxRate = asset.taxRate || 0.26;

    // Check if minusvalenze can offset gain
    let taxDue = Math.max(0, gainGross * taxRate);
    if (gainGross > 0 && taxLosses.length > 0) {
      // Offset against first available minusvalenza
      const loss = taxLosses[0];
      const offset = Math.min(gainGross, loss.residualAmount);
      const taxableGain = gainGross - offset;
      taxDue = Math.max(0, taxableGain * taxRate);

      setTaxLosses(prev =>
        prev.map(l =>
          l.id === loss.id
            ? { ...l, usedAmount: l.usedAmount + offset, residualAmount: l.residualAmount - offset }
            : l
        )
      );
    }

    const newGain: RealizedGain = {
      id: `gain-${Date.now()}`,
      assetName: asset.name,
      category: asset.category,
      saleDate: new Date().toISOString().split('T')[0],
      salePrice: proceeds,
      purchasePrice: costBasis,
      gainGross,
      taxRate,
      taxDue,
      gainNet: gainGross - taxDue,
      taxPaid: false
    };

    setRealizedGains(prev => [newGain, ...prev]);

    // Reduce quantity or remove asset
    if (asset.quantity <= sellQty) {
      setAssets(prev => prev.filter(a => a.id !== assetId));
    } else {
      setAssets(prev =>
        prev.map(a => (a.id === assetId ? { ...a, quantity: a.quantity - sellQty } : a))
      );
    }
  };

  const updateFinancialAsset = (assetId: string, updates: Partial<FinancialAsset>) => {
    setAssets(prev =>
      prev.map(a => (a.id === assetId ? { ...a, ...updates } : a))
    );
  };

  const deleteFinancialAsset = (assetId: string) => {
    setAssets(prev => prev.filter(a => a.id !== assetId));
    setEvents(prev => prev.filter(e => e.sourceAssetId !== assetId));
  };

  const addProperty = (newProp: Omit<Property, 'id'> & { id?: string }): string => {
    const id = newProp.id || `prop-${Date.now()}`;
    setProperties(prev => [...prev, { ...newProp, id }]);
    return id;
  };

  const updateProperty = (propertyId: string, updates: Partial<Property>) => {
    setProperties(prev =>
      prev.map(p => (p.id === propertyId ? { ...p, ...updates } : p))
    );
  };

  const deleteProperty = (propertyId: string) => {
    setProperties(prev => prev.filter(p => p.id !== propertyId));
    setRentalContracts(prev => prev.filter(c => c.propertyId !== propertyId));
    setEvents(prev => prev.filter(e => e.sourceAssetId !== propertyId));
  };

  const addPropertyExpense = (propertyId: string, expense: Omit<PropertyExpense, 'id' | 'propertyId'>): string => {
    const id = `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newExpense: PropertyExpense = {
      ...expense,
      id,
      propertyId
    };

    setProperties(prev =>
      prev.map(p => {
        if (p.id !== propertyId) return p;
        const currentExpenses = p.expenses || [];
        const updatedExpenses = [...currentExpenses, newExpense];
        const annualExpenses = updatedExpenses.reduce(
          (sum, exp) => sum + calculateExpenseAnnual(exp.amount, exp.frequency),
          0
        );
        return {
          ...p,
          expenses: updatedExpenses,
          annualExpenses
        };
      })
    );
    return id;
  };

  const updatePropertyExpense = (propertyId: string, expenseId: string, updates: Partial<PropertyExpense>) => {
    setProperties(prev =>
      prev.map(p => {
        if (p.id !== propertyId) return p;
        const currentExpenses = p.expenses || [];
        const updatedExpenses = currentExpenses.map(exp =>
          exp.id === expenseId ? { ...exp, ...updates } : exp
        );
        const annualExpenses = updatedExpenses.reduce(
          (sum, exp) => sum + calculateExpenseAnnual(exp.amount, exp.frequency),
          0
        );
        return {
          ...p,
          expenses: updatedExpenses,
          annualExpenses
        };
      })
    );
  };

  const deletePropertyExpense = (propertyId: string, expenseId: string) => {
    setProperties(prev =>
      prev.map(p => {
        if (p.id !== propertyId) return p;
        const currentExpenses = p.expenses || [];
        const updatedExpenses = currentExpenses.filter(exp => exp.id !== expenseId);
        const annualExpenses = updatedExpenses.reduce(
          (sum, exp) => sum + calculateExpenseAnnual(exp.amount, exp.frequency),
          0
        );
        return {
          ...p,
          expenses: updatedExpenses,
          annualExpenses
        };
      })
    );
  };

  const addRentalContract = (newContract: Omit<RentalContract, 'id'> & { id?: string }): string => {
    const id = newContract.id || `rent-${Date.now()}`;
    setRentalContracts(prev => [...prev, { ...newContract, id }]);
    return id;
  };

  const updateRentalContract = (id: string, updates: Partial<RentalContract>) => {
    setRentalContracts(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  const addLiability = (newDebt: Omit<Liability, 'id'> & { id?: string }): string => {
    const id = newDebt.id || `debt-${Date.now()}`;
    setLiabilities(prev => [...prev, { ...newDebt, id }]);
    return id;
  };

  const addAlternative = (newAlt: Omit<AlternativeAsset, 'id'> & { id?: string }): string => {
    const id = newAlt.id || `alt-${Date.now()}`;
    setAlternatives(prev => [...prev, { ...newAlt, id }]);
    return id;
  };

  const updateAlternative = (id: string, updates: Partial<AlternativeAsset>) => {
    setAlternatives(prev => prev.map(a => (a.id === id ? { ...a, ...updates } : a)));
  };

  const deleteAlternative = (id: string) => {
    setAlternatives(prev => prev.filter(a => a.id !== id));
  };

  const addSmartRule = (rule: Omit<SmartRule, 'id'> & { id?: string }): string => {
    const id = rule.id || `rule-${Date.now()}`;
    setSmartRules(prev => [...prev, { ...rule, id }]);
    return id;
  };

  const toggleSmartRule = (ruleId: string) => {
    setSmartRules(prev =>
      prev.map(r => (r.id === ruleId ? { ...r, isActive: !r.isActive } : r))
    );
  };

  const deleteSmartRule = (ruleId: string) => {
    setSmartRules(prev => prev.filter(r => r.id !== ruleId));
  };

  const processBankMovement = (keywordMatch: string, amount: number, date: string) => {
    const upper = keywordMatch.toUpperCase();
    const matchedRule = smartRules.find(r => r.isActive && upper.includes(r.keyword.toUpperCase()));

    if (!matchedRule) {
      return { matched: false, message: `Nessuna Smart Rule attiva corrispondente a "${keywordMatch}".` };
    }

    // Try to find matching pending event
    const targetEvent = events.find(
      e =>
        (e.status === 'PREVISTA' || e.status === 'IN_RITARDO') &&
        (e.sourceAssetId === matchedRule.targetAssetId || e.category === matchedRule.category)
    );

    if (targetEvent) {
      confirmEventReceived(targetEvent.id);
      return {
        matched: true,
        message: `Regola applicata: "${matchedRule.keyword}". Entrata "${targetEvent.title}" confermata come RICEVUTA!`
      };
    }

    return {
      matched: true,
      message: `Regola "${matchedRule.keyword}" identificata con successo per ${matchedRule.description}.`
    };
  };

  const updateTaxProfile = (updates: Partial<GlobalTaxProfile>) => {
    setTaxProfile(prev => ({ ...prev, ...updates }));
  };

  const markTaxPaid = (gainId: string) => {
    setRealizedGains(prev =>
      prev.map(g => (g.id === gainId ? { ...g, taxPaid: true } : g))
    );
  };

  const addFamilyMember = (member: Omit<FamilyMember, 'id'> & { id?: string }): string => {
    const id = member.id || `mem-${Date.now()}`;
    setFamilyMembers(prev => [...prev, { ...member, id }]);
    return id;
  };

  const updateFamilyMember = (id: string, updates: Partial<FamilyMember>) => {
    setFamilyMembers(prev => prev.map(m => (m.id === id ? { ...m, ...updates } : m)));
  };

  const deleteFamilyMember = (id: string) => {
    if (id === 'mem-all') {
      toggleShowFamilyConsolidated();
      return;
    }
    const remaining = familyMembers.filter(m => m.id !== id && m.id !== 'mem-all');
    setFamilyMembers(prev => prev.filter(m => m.id !== id));
    if (selectedOwnerId === id) {
      if (showFamilyConsolidated) {
        setSelectedOwnerId('mem-all');
      } else {
        setSelectedOwnerId(remaining[0]?.id || 'mem-1');
      }
    }
  };

  const addCustomTaxRate = (rate: Omit<CustomTaxRate, 'id'> & { id?: string }): string => {
    const id = rate.id || `rate-${Date.now()}`;
    setCustomTaxRates(prev => [...prev, { ...rate, id }]);
    return id;
  };

  const updateCustomTaxRate = (id: string, updates: Partial<CustomTaxRate>) => {
    setCustomTaxRates(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
  };

  const deleteCustomTaxRate = (id: string) => {
    setCustomTaxRates(prev => prev.filter(r => r.id !== id));
  };

  const combineTaxRates = (
    rateId1: string,
    rateId2: string,
    weight1: number = 0.5,
    weight2: number = 0.5,
    combinedName?: string
  ): string => {
    const r1 = customTaxRates.find(r => r.id === rateId1);
    const r2 = customTaxRates.find(r => r.id === rateId2);
    if (!r1 || !r2) return '';

    const blendedRate = Number(((r1.rate * weight1) + (r2.rate * weight2)).toFixed(4));
    const name = combinedName || `Aliquota Mista (${(r1.rate * 100).toFixed(0)}% + ${(r2.rate * 100).toFixed(0)}%)`;
    const id = `rate-comb-${Date.now()}`;

    const newCombinedRate: CustomTaxRate = {
      id,
      name,
      rate: blendedRate,
      category: 'MISTO',
      description: `Combinazione ponderata tra ${r1.name} (${(weight1 * 100).toFixed(0)}%) e ${r2.name} (${(weight2 * 100).toFixed(0)}%)`,
      combinedFrom: [r1.id, r2.id]
    };

    setCustomTaxRates(prev => [...prev, newCombinedRate]);
    return id;
  };

  const updateAssetPrice = (assetId: string, newPrice: number) => {
    setAssets(prev =>
      prev.map(a => (a.id === assetId ? { ...a, currentPrice: newPrice } : a))
    );
  };

  const syncOnlineMarketPrices = async (): Promise<number> => {
    setIsSyncingMarket(true);
    let updatedCount = 0;
    try {
      const updates = await Promise.all(
        assets.map(async asset => {
          try {
            const query = asset.ticker || asset.isin;
            const quote = await lookupOnlineAsset(query, asset.quantity);
            if (quote && quote.currentPrice > 0) {
              return { id: asset.id, price: quote.currentPrice };
            }
          } catch {
            // ignore individual error
          }
          return null;
        })
      );

      const priceMap = new Map<string, number>();
      updates.forEach(u => {
        if (u) {
          priceMap.set(u.id, u.price);
          updatedCount++;
        }
      });

      if (priceMap.size > 0) {
        setAssets(prev =>
          prev.map(a => {
            const p = priceMap.get(a.id);
            return p !== undefined ? { ...a, currentPrice: p } : a;
          })
        );
      }

      const now = new Date();
      setLastMarketSyncTime(
        `Oggi, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      );
      return updatedCount;
    } finally {
      setIsSyncingMarket(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      syncOnlineMarketPrices().catch(() => {});
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const toggleShowFamilyConsolidated = () => {
    setShowFamilyConsolidated(prev => {
      const next = !prev;
      if (!next && selectedOwnerId === 'mem-all') {
        const firstIndiv = familyMembers.find(m => m.id !== 'mem-all');
        if (firstIndiv) setSelectedOwnerId(firstIndiv.id);
      }
      return next;
    });
  };

  const addRegularIncome = (income: Omit<RegularIncome, 'id'> & { id?: string }): string => {
    const id = income.id || `inc-${Date.now()}`;
    const newInc: RegularIncome = { ...income, id };
    setRegularIncomes(prev => [...prev, newInc]);
    return id;
  };

  const updateRegularIncome = (id: string, updates: Partial<RegularIncome>) => {
    setRegularIncomes(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
  };

  const deleteRegularIncome = (id: string) => {
    setRegularIncomes(prev => prev.filter(r => r.id !== id));
  };

  const addAccount = (account: Omit<BankAccount, 'id'> & { id?: string }): string => {
    const id = account.id || `acc-${Date.now()}`;
    const newAcc: BankAccount = { ...account, id };
    setAccounts(prev => [...prev, newAcc]);
    return id;
  };

  const updateAccount = (id: string, updates: Partial<BankAccount>) => {
    setAccounts(prev => prev.map(a => (a.id === id ? { ...a, ...updates } : a)));
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(() => {
    return localStorage.getItem(`${LOCAL_STORAGE_KEY}_onboarding_dismissed`) !== 'true';
  });

  const dismissFirstVisit = () => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_onboarding_dismissed`, 'true');
    setIsFirstVisit(false);
  };

  const resetToEmpty = () => {
    localStorage.clear();
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_onboarding_dismissed`, 'true');
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_workspace_mode`, 'empty');

    const initialMember: FamilyMember = {
      id: 'mem-1',
      name: 'Il Mio Profilo',
      role: 'Capofamiglia',
      avatarColor: '#4f46e5'
    };

    setFamilyMembers([initialMember]);
    setCustomTaxRates(INITIAL_CUSTOM_TAX_RATES);
    setSelectedOwnerId('mem-1');
    setShowFamilyConsolidated(false);
    setAssets([]);
    setProperties([]);
    setRentalContracts([]);
    setLiabilities([]);
    setAlternatives([]);
    setCompanies([]);
    setRegularIncomes([]);
    setAccounts([
      {
        id: 'acc-1',
        institution: 'Banca Principale',
        name: 'Conto Corrente',
        type: 'CONTO_CORRENTE',
        balance: 0,
        availableLiquidity: 0,
        ownerId: 'mem-1',
        currency: 'EUR',
        taxRate: 0
      }
    ]);
    setSmartRules([]);
    setTaxLosses([]);
    setRealizedGains([]);
    setTaxProfile(INITIAL_GLOBAL_TAX_PROFILE);
    setEvents([]);
  };

  const resetToDemo = () => {
    localStorage.clear();
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_onboarding_dismissed`, 'true');
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_workspace_mode`, 'demo');
    setFamilyMembers(INITIAL_FAMILY_MEMBERS);
    setCustomTaxRates(INITIAL_CUSTOM_TAX_RATES);
    setSelectedOwnerId('mem-all');
    setShowFamilyConsolidated(true);
    setAssets(INITIAL_FINANCIAL_ASSETS);
    setProperties(INITIAL_PROPERTIES);
    setRentalContracts(INITIAL_RENTAL_CONTRACTS);
    setLiabilities(INITIAL_LIABILITIES);
    setAlternatives(INITIAL_ALTERNATIVES);
    setCompanies(INITIAL_COMPANIES);
    setSmartRules(INITIAL_SMART_RULES);
    setTaxLosses(INITIAL_TAX_LOSSES);
    setRealizedGains(INITIAL_REALIZED_GAINS);
    setTaxProfile(INITIAL_GLOBAL_TAX_PROFILE);
    setAccounts(INITIAL_ACCOUNTS);
    setRegularIncomes(INITIAL_REGULAR_INCOMES);
    setEvents(
      generateAutomatedEvents(
        INITIAL_FINANCIAL_ASSETS,
        INITIAL_PROPERTIES,
        INITIAL_RENTAL_CONTRACTS,
        INITIAL_LIABILITIES
      )
    );
  };

  const exportWorkspaceJSON = (): string => {
    const data = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      familyMembers,
      customTaxRates,
      assets,
      properties,
      rentalContracts,
      liabilities,
      alternatives,
      companies,
      accounts,
      regularIncomes,
      smartRules,
      taxLosses,
      realizedGains,
      taxProfile,
      showFamilyConsolidated
    };
    return JSON.stringify(data, null, 2);
  };

  const importWorkspaceJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.familyMembers)) setFamilyMembers(data.familyMembers);
      if (Array.isArray(data.customTaxRates)) setCustomTaxRates(data.customTaxRates);
      if (Array.isArray(data.assets)) setAssets(data.assets);
      if (Array.isArray(data.properties)) setProperties(data.properties);
      if (Array.isArray(data.rentalContracts)) setRentalContracts(data.rentalContracts);
      if (Array.isArray(data.liabilities)) setLiabilities(data.liabilities);
      if (Array.isArray(data.alternatives)) setAlternatives(data.alternatives);
      if (Array.isArray(data.companies)) setCompanies(data.companies);
      if (Array.isArray(data.accounts)) setAccounts(data.accounts);
      if (Array.isArray(data.regularIncomes)) setRegularIncomes(data.regularIncomes);
      if (Array.isArray(data.smartRules)) setSmartRules(data.smartRules);
      if (Array.isArray(data.taxLosses)) setTaxLosses(data.taxLosses);
      if (Array.isArray(data.realizedGains)) setRealizedGains(data.realizedGains);
      if (data.taxProfile) setTaxProfile(data.taxProfile);
      if (typeof data.showFamilyConsolidated === 'boolean') setShowFamilyConsolidated(data.showFamilyConsolidated);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_onboarding_dismissed`, 'true');
      setIsFirstVisit(false);
      return true;
    } catch (e) {
      console.error('Failed to import JSON', e);
      return false;
    }
  };

  return (
    <WealthContext.Provider
      value={{
        activeTab,
        setActiveTab,
        taxDisplayMode,
        setTaxDisplayMode,
        showAfterTaxNetWorth,
        setShowAfterTaxNetWorth,
        selectedOwnerId,
        setSelectedOwnerId,
        selectedYear,
        setSelectedYear,

        familyMembers,
        accounts,
        assets,
        properties,
        rentalContracts,
        liabilities,
        alternatives,
        companies,
        smartRules,
        taxLosses,
        realizedGains,
        taxProfile,
        customTaxRates,
        documents,
        events,

        lastMarketSyncTime,
        isSyncingMarket,
        syncOnlineMarketPrices,
        updateAssetPrice,

        filteredAssets,
        filteredProperties,
        filteredRentalContracts,
        filteredLiabilities,
        filteredAlternatives,
        filteredAccounts,
        filteredCompanies,
        filteredEvents,
        filteredRegularIncomes,
        regularIncomes,
        showFamilyConsolidated,
        setShowFamilyConsolidated,
        toggleShowFamilyConsolidated,

        grossWealth,
        totalDebts,
        netWorth,
        latentTaxLiability,
        afterTaxNetWorth,
        netWorthChangeAmount,
        netWorthChangePercent,

        financialPortfolioValue,
        realEstateTotalValue,
        realEstateNetEquity,
        alternativeAssetsTotal,
        companiesTotal,
        cashTotal,

        annualGrossPassiveIncome,
        annualNetPassiveIncome,
        annualPassiveTaxes,
        totalPropertyExpenses,
        monthlyPassiveIncomeGross,
        monthlyPassiveIncomeNet,

        next30DaysEvents,
        overdueEvents,

        taxMetrics,

        confirmEventReceived,
        addFamilyMember,
        updateFamilyMember,
        deleteFamilyMember,
        addCustomTaxRate,
        updateCustomTaxRate,
        deleteCustomTaxRate,
        combineTaxRates,
        addFinancialAsset,
        updateFinancialAsset,
        deleteFinancialAsset,
        sellFinancialAsset,
        addProperty,
        updateProperty,
        deleteProperty,
        addPropertyExpense,
        updatePropertyExpense,
        deletePropertyExpense,
        addRentalContract,
        updateRentalContract,
        addAccount,
        updateAccount,
        deleteAccount,
        addRegularIncome,
        updateRegularIncome,
        deleteRegularIncome,
        addLiability,
        addAlternative,
        updateAlternative,
        deleteAlternative,
        addSmartRule,
        toggleSmartRule,
        deleteSmartRule,
        processBankMovement,
        updateTaxProfile,
        markTaxPaid,
        resetToDemo,
        resetToEmpty,
        exportWorkspaceJSON,
        importWorkspaceJSON,
        isFirstVisit,
        dismissFirstVisit
      }}
    >
      {children}
    </WealthContext.Provider>
  );
};

export const useWealth = (): WealthContextType => {
  const context = useContext(WealthContext);
  if (!context) {
    throw new Error('useWealth must be used within a WealthProvider');
  }
  return context;
};
