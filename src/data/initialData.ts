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
  CustomTaxRate,
  RegularIncome
} from '../types';

export const INITIAL_FAMILY_MEMBERS: FamilyMember[] = [
  { id: 'mem-all', name: 'Patrimonio Familiare (Consolidato)', role: 'Capofamiglia', avatarColor: '#059669' },
  { id: 'mem-1', name: 'Marco Rossi', role: 'Capofamiglia', avatarColor: '#2563eb' },
  { id: 'mem-2', name: 'Elena Bianchi', role: 'Coniuge', avatarColor: '#db2777' },
  { id: 'mem-3', name: 'Luca Rossi', role: 'Figlio', avatarColor: '#7c3aed' }
];

export const INITIAL_ACCOUNTS: BankAccount[] = [
  {
    id: 'acc-fineco',
    name: 'Fineco Bank - Deposito Titoli & CC',
    institution: 'Fineco Bank',
    type: 'BROKER',
    iban: 'IT89X0301503200000003482910',
    currency: 'EUR',
    balance: 50000,
    availableLiquidity: 50000,
    ownerId: 'mem-1',
    interestRate: 0.00
  },
  {
    id: 'acc-intesa',
    name: 'Intesa Sanpaolo - Conto Corrente Primario',
    institution: 'Intesa Sanpaolo',
    type: 'CONTO_CORRENTE',
    iban: 'IT44Y0306909606100000012938',
    currency: 'EUR',
    balance: 32000,
    availableLiquidity: 32000,
    ownerId: 'mem-1',
    interestRate: 0.00
  },
  {
    id: 'acc-deposito-ca',
    name: 'Conto Deposito Libero 3.6% - Rendimento Liquidità',
    institution: 'CA Auto Bank',
    type: 'CONTO_DEPOSITO_LIBERO',
    iban: 'IT22A0311101600000000987654',
    currency: 'EUR',
    balance: 25000,
    availableLiquidity: 25000,
    ownerId: 'mem-1',
    interestRate: 0.036,
    taxRate: 0.26,
    notes: 'Rendimento lordo 3.60% con liquidazione trimestrale degli interessi.'
  }
];

export const INITIAL_FINANCIAL_ASSETS: FinancialAsset[] = [
  // BTP - 300,000 € total
  {
    id: 'asset-btp-1',
    name: 'BTP 4.00% 01/09/2033 (MOT)',
    isin: 'IT0005547407',
    ticker: '0E79.L',
    category: 'GOV_BOND',
    quantity: 300000,
    averageBuyPrice: 98.4,
    currentPrice: 104.66,
    currency: 'EUR',
    accountId: 'acc-fineco',
    ownerId: 'mem-1',
    ownershipPercentage: 100,
    taxRate: 0.125, // Titoli di Stato 12.5%
    unrealizedGainTaxRate: 0.125,
    totalCouponsOrDividendsReceived: 24000,
    irrEstimated: 4.35,
    isBond: true,
    nominalValue: 300000,
    annualCouponRate: 0.04, // 4%
    couponFrequency: 'SEMI_ANNUAL',
    couponMonths: [3, 9], // Marzo e Settembre
    couponDay: 1,
    maturityDate: '2033-09-01',
    notes: 'Titolo di Stato italiano whitelist al 12.5%.'
  },
  // ETF - 200,000 € total
  {
    id: 'asset-etf-1',
    name: 'Vanguard FTSE All-World UCITS ETF (VWCE)',
    isin: 'IE00BK5BQT80',
    ticker: 'VWCE.MI',
    category: 'ETF',
    quantity: 1100,
    averageBuyPrice: 104.5,
    currentPrice: 125.8,
    currency: 'EUR',
    accountId: 'acc-fineco',
    ownerId: 'mem-1',
    ownershipPercentage: 100,
    taxRate: 0.26,
    unrealizedGainTaxRate: 0.26,
    totalCouponsOrDividendsReceived: 0,
    irrEstimated: 8.9,
    dividendYield: 0.0,
    notes: 'ETF ad accumulazione globale.'
  },
  {
    id: 'asset-etf-2',
    name: 'iShares Core MSCI World UCITS ETF (SWDA)',
    isin: 'IE00B4L5Y983',
    ticker: 'SWDA.MI',
    category: 'ETF',
    quantity: 680,
    averageBuyPrice: 78.2,
    currentPrice: 90.6,
    currency: 'EUR',
    accountId: 'acc-fineco',
    ownerId: 'mem-2',
    ownershipPercentage: 100,
    taxRate: 0.26,
    unrealizedGainTaxRate: 0.26,
    totalCouponsOrDividendsReceived: 0,
    irrEstimated: 7.8,
    notes: 'ETF Core World portafoglio Elena.'
  },
  // Azioni - 100,000 € total
  {
    id: 'asset-stock-1',
    name: 'Apple Inc.',
    isin: 'US0378331005',
    ticker: 'AAPL',
    category: 'STOCK',
    quantity: 260,
    averageBuyPrice: 165.0,
    currentPrice: 228.5,
    currency: 'EUR',
    accountId: 'acc-fineco',
    ownerId: 'mem-1',
    ownershipPercentage: 100,
    taxRate: 0.26,
    unrealizedGainTaxRate: 0.26,
    totalCouponsOrDividendsReceived: 1240,
    irrEstimated: 14.2,
    dividendPerShare: 1.0,
    dividendYield: 0.005,
    dividendFrequency: 'QUARTERLY',
    nextExDividendDate: '2026-11-08',
    nextDividendPayDate: '2026-11-14',
    notes: 'Posizione tech di lungo periodo con dividendo trimestrale.'
  },
  {
    id: 'asset-stock-2',
    name: 'Ferrari N.V.',
    isin: 'NL0011585146',
    ticker: 'RACE.MI',
    category: 'STOCK',
    quantity: 100,
    averageBuyPrice: 310.0,
    currentPrice: 405.0,
    currency: 'EUR',
    accountId: 'acc-fineco',
    ownerId: 'mem-1',
    ownershipPercentage: 100,
    taxRate: 0.26,
    unrealizedGainTaxRate: 0.26,
    totalCouponsOrDividendsReceived: 850,
    irrEstimated: 12.1,
    dividendPerShare: 2.44,
    dividendYield: 0.006,
    dividendFrequency: 'ANNUAL',
    nextExDividendDate: '2027-04-20',
    nextDividendPayDate: '2027-05-02',
    notes: 'Luxury compounder con dividendo annuale primaverile.'
  }
];

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-bologna',
    name: 'Appartamento Centro Storico',
    address: 'Via Santo Stefano 42',
    city: 'Bologna',
    type: 'AFFITTO_LUNGO_TERMINE',
    purchaseValue: 310000,
    currentValue: 350000,
    purchaseDate: '2021-04-15',
    sqm: 95,
    ownerId: 'mem-1',
    ownershipPercentage: 100,
    annualExpenses: 1200,
    annualTaxes: 1450, // IMU
    annualInsurance: 420,
    annualMaintenance: 800,
    taxRate: 0.21, // Cedolare secca 21%
    expenses: [
      {
        id: 'exp-bologna-1',
        propertyId: 'prop-bologna',
        name: 'Spese Condominiali Ordinarie',
        amount: 100,
        frequency: 'MONTHLY',
        category: 'CONDOMINIO'
      },
      {
        id: 'exp-bologna-2',
        propertyId: 'prop-bologna',
        name: 'IMU Comune di Bologna (Acconto + Saldo)',
        amount: 725,
        frequency: 'SEMIANNUAL',
        category: 'IMU_TARI'
      },
      {
        id: 'exp-bologna-3',
        propertyId: 'prop-bologna',
        name: 'Assicurazione Globale Fabbricato',
        amount: 420,
        frequency: 'ANNUAL',
        category: 'ASSICURAZIONE'
      },
      {
        id: 'exp-bologna-4',
        propertyId: 'prop-bologna',
        name: 'Manutenzione Ordinaria & Revisione Caldaia',
        amount: 200,
        frequency: 'QUARTERLY',
        category: 'MANUTENZIONE'
      }
    ]
  },
  {
    id: 'prop-rimini',
    name: 'Trilocale Vista Mare',
    address: 'Viale Regina Elena 18',
    city: 'Rimini',
    type: 'AFFITTO_LUNGO_TERMINE',
    purchaseValue: 400000,
    currentValue: 450000,
    purchaseDate: '2022-09-20',
    sqm: 110,
    ownerId: 'mem-2',
    ownershipPercentage: 100,
    annualExpenses: 1500,
    annualTaxes: 1800,
    annualInsurance: 500,
    annualMaintenance: 1100,
    taxRate: 0.21,
    expenses: [
      {
        id: 'exp-rimini-1',
        propertyId: 'prop-rimini',
        name: 'Spese Condominiali & Ascensore',
        amount: 250,
        frequency: 'BIMONTHLY',
        category: 'CONDOMINIO'
      },
      {
        id: 'exp-rimini-2',
        propertyId: 'prop-rimini',
        name: 'IMU Seconda Casa Mare',
        amount: 900,
        frequency: 'SEMIANNUAL',
        category: 'IMU_TARI'
      },
      {
        id: 'exp-rimini-3',
        propertyId: 'prop-rimini',
        name: 'Polizza Incendio & Scoppio',
        amount: 500,
        frequency: 'ANNUAL',
        category: 'ASSICURAZIONE'
      },
      {
        id: 'exp-rimini-4',
        propertyId: 'prop-rimini',
        name: 'Manutenzione e Tagliando Condizionatori',
        amount: 550,
        frequency: 'SEMIANNUAL',
        category: 'MANUTENZIONE'
      }
    ]
  },
  {
    id: 'prop-commerciale',
    name: 'Fondo Commerciale & Uffici',
    address: 'Via dell’Industria 88',
    city: 'Bologna',
    type: 'COMMERCIALE',
    purchaseValue: 520000,
    currentValue: 600000,
    purchaseDate: '2020-01-10',
    sqm: 260,
    ownerId: 'mem-holding',
    ownershipPercentage: 100,
    annualExpenses: 2800,
    annualTaxes: 3600,
    annualInsurance: 950,
    annualMaintenance: 2000,
    taxRate: 0.26, // Regime societario/ordinario
    expenses: [
      {
        id: 'exp-comm-1',
        propertyId: 'prop-commerciale',
        name: 'Spese Condominiali & Pulizia Parti Comuni',
        amount: 466.67,
        frequency: 'BIMONTHLY',
        category: 'CONDOMINIO'
      },
      {
        id: 'exp-comm-2',
        propertyId: 'prop-commerciale',
        name: 'IMU Immobile Commerciale D/8',
        amount: 1800,
        frequency: 'SEMIANNUAL',
        category: 'IMU_TARI'
      },
      {
        id: 'exp-comm-3',
        propertyId: 'prop-commerciale',
        name: 'Polizza R.C. & Globale Fabbricati',
        amount: 950,
        frequency: 'ANNUAL',
        category: 'ASSICURAZIONE'
      },
      {
        id: 'exp-comm-4',
        propertyId: 'prop-commerciale',
        name: 'Manutenzione Impianti Tecnologici & Ascensore',
        amount: 500,
        frequency: 'QUARTERLY',
        category: 'MANUTENZIONE'
      }
    ]
  }
];

export const INITIAL_RENTAL_CONTRACTS: RentalContract[] = [
  {
    id: 'rent-bologna',
    propertyId: 'prop-bologna',
    tenantName: 'Mario Rossi',
    tenantPhone: '+39 347 1234567',
    tenantEmail: 'mario.rossi@example.com',
    monthlyRent: 1400,
    paymentFrequency: 'MONTHLY',
    paymentDayOfMonth: 5,
    startDate: '2023-01-01',
    endDate: '2027-12-31',
    additionalExpensesMonthly: 120,
    securityDeposit: 4200,
    istatRevaluation: true,
    taxRegime: 'CEDOLARE_SECCA',
    taxRate: 0.21,
    active: true
  },
  {
    id: 'rent-rimini',
    propertyId: 'prop-rimini',
    tenantName: 'Studio Legale & Partners',
    tenantPhone: '+39 0541 987654',
    tenantEmail: 'amministrazione@studiolegale.it',
    monthlyRent: 1800,
    paymentFrequency: 'MONTHLY',
    paymentDayOfMonth: 10,
    startDate: '2023-06-01',
    endDate: '2029-05-31',
    additionalExpensesMonthly: 150,
    securityDeposit: 5400,
    istatRevaluation: true,
    taxRegime: 'CEDOLARE_SECCA',
    taxRate: 0.21,
    active: true
  },
  {
    id: 'rent-commerciale',
    propertyId: 'prop-commerciale',
    tenantName: 'TechSolutions S.p.A.',
    tenantPhone: '+39 051 445566',
    tenantEmail: 'finance@techsolutions.com',
    monthlyRent: 3500,
    paymentFrequency: 'MONTHLY',
    paymentDayOfMonth: 1,
    startDate: '2022-01-01',
    endDate: '2034-12-31',
    additionalExpensesMonthly: 300,
    securityDeposit: 10500,
    istatRevaluation: true,
    taxRegime: 'ORDINARIO',
    taxRate: 0.26,
    active: true
  }
];

export const INITIAL_LIABILITIES: Liability[] = [];

export const INITIAL_ALTERNATIVES: AlternativeAsset[] = [
  {
    id: 'alt-rolex',
    name: 'Rolex Submariner Date 126610LN',
    category: 'OROLOGIO',
    purchaseValue: 10800,
    currentValue: 15000,
    purchaseDate: '2022-03-10',
    ownerId: 'mem-1',
    ownershipPercentage: 100,
    description: 'Acciaio Oystersteel, lunetta Cerachrom nera, quadrante nero. Full set con scatola e garanzia originale.',
    location: 'Cassetta di sicurezza Intesa',
    hasDocuments: true,
    isInsured: true,
    notes: 'Valutazione di mercato aggiornata a fine 2025.'
  },
  {
    id: 'alt-oro',
    name: 'Oro Fisico da Investimento (Lingotti 500g)',
    category: 'ORO_FISICO',
    purchaseValue: 22500,
    currentValue: 30000,
    purchaseDate: '2020-05-18',
    ownerId: 'mem-all',
    ownershipPercentage: 100,
    description: 'Lingotti certificati London Good Delivery 999.9/1000 con sigillo bancario.',
    location: 'Caveau Prosegur',
    hasDocuments: true,
    isInsured: true,
    notes: 'Copertura inflattiva e riserva strategica di liquidità.'
  }
];

export const INITIAL_COMPANIES: CompanyParticipation[] = [];

export const INITIAL_REGULAR_INCOMES: RegularIncome[] = [
  {
    id: 'inc-stipendio-1',
    name: 'Reddito da Lavoro / Stipendio Primario',
    category: 'STIPENDIO',
    grossAmount: 3800,
    netAmount: 2600,
    frequency: 'MONTHLY',
    taxRate: 0.315,
    monthsCount: 13,
    ownerId: 'mem-1',
    notes: 'Accredito mensile stipendio fisso con tredicesima a dicembre.',
    active: true
  }
];

export const INITIAL_SMART_RULES: SmartRule[] = [
  {
    id: 'rule-1',
    keyword: 'ROSSI MARIO',
    category: 'AFFITTO',
    description: 'Bonifico canone affitto Appartamento Bologna',
    targetAssetId: 'prop-bologna',
    targetAssetName: 'Appartamento Centro Storico (Bologna)',
    action: 'MARK_RECEIVED',
    isActive: true
  },
  {
    id: 'rule-2',
    keyword: 'MINISTERO ECONOMIA',
    category: 'CEDOLA',
    description: 'Accredito cedola semestrale BTP 4%',
    targetAssetId: 'asset-btp-1',
    targetAssetName: 'BTP 4.00% 01/09/2033',
    action: 'MARK_RECEIVED',
    isActive: true
  },
  {
    id: 'rule-3',
    keyword: 'VANGUARD',
    category: 'DIVIDENDO',
    description: 'Distribuzione dividendo ETF',
    targetAssetId: 'asset-etf-1',
    targetAssetName: 'Vanguard FTSE All-World',
    action: 'MARK_RECEIVED',
    isActive: true
  },
  {
    id: 'rule-4',
    keyword: 'TECHSULTIONS',
    category: 'AFFITTO',
    description: 'Canone mensile Fondo Commerciale Bologna',
    targetAssetId: 'prop-commerciale',
    targetAssetName: 'Fondo Commerciale & Uffici',
    action: 'MARK_RECEIVED',
    isActive: true
  }
];

export const INITIAL_TAX_LOSSES: TaxLoss[] = [
  {
    id: 'loss-1',
    amount: 80000,
    date: '2024-03-15',
    assetSource: 'Vendita Certificate Basket & Fixed Income',
    expiryDate: '2028-12-31',
    usedAmount: 20000,
    residualAmount: 60000
  }
];

export const INITIAL_REALIZED_GAINS: RealizedGain[] = [
  {
    id: 'gain-1',
    assetName: 'Microsoft Corporation (MSFT)',
    category: 'STOCK',
    saleDate: '2026-02-10',
    salePrice: 70000,
    purchasePrice: 50000,
    gainGross: 20000,
    taxRate: 0.26,
    taxDue: 5200,
    gainNet: 14800,
    taxPaid: false
  },
  {
    id: 'gain-2',
    assetName: 'BTP Short Term 2025',
    category: 'GOV_BOND',
    saleDate: '2025-11-15',
    salePrice: 51200,
    purchasePrice: 48000,
    gainGross: 3200,
    taxRate: 0.125,
    taxDue: 400,
    gainNet: 2800,
    taxPaid: true
  }
];

export const INITIAL_GLOBAL_TAX_PROFILE: GlobalTaxProfile = {
  name: 'Italia Persona Fisica & Cedolare Secca',
  stockGainRate: 0.26,
  etfGainRate: 0.26,
  govBondRate: 0.125,
  corpBondRate: 0.26,
  dividendRate: 0.26,
  interestRate: 0.26,
  rentalCedolareSeccaRate: 0.21,
  rentalOrdinaryRate: 0.26,
  cryptoRate: 0.26
};

export const INITIAL_DOCUMENTS: AssetDocument[] = [
  {
    id: 'doc-1',
    assetId: 'prop-bologna',
    assetName: 'Appartamento Centro Storico',
    name: 'Atto_di_Compravendita_Rogito_2021.pdf',
    type: 'ROGITO',
    uploadDate: '2021-04-18',
    fileSize: '3.4 MB'
  },
  {
    id: 'doc-2',
    assetId: 'prop-bologna',
    assetName: 'Appartamento Centro Storico',
    name: 'Contratto_Locazione_Registrato_AdE_2023.pdf',
    type: 'CONTRATTO',
    uploadDate: '2023-01-05',
    fileSize: '1.2 MB'
  },
  {
    id: 'doc-3',
    assetId: 'asset-btp-1',
    assetName: 'BTP 4.00% 01/09/2033',
    name: 'Scheda_Informativa_Tesoro_BTP_2033.pdf',
    type: 'CERTIFICATO',
    uploadDate: '2023-09-02',
    fileSize: '640 KB'
  },
  {
    id: 'doc-4',
    assetId: 'alt-rolex',
    assetName: 'Rolex Submariner 126610LN',
    name: 'Garanzia_Ufficiale_Card_Rolex.pdf',
    type: 'GARANZIA',
    uploadDate: '2022-03-12',
    fileSize: '2.1 MB'
  }
];

export const INITIAL_CUSTOM_TAX_RATES: CustomTaxRate[] = [
  {
    id: 'rate-cedolare-21',
    name: 'Cedolare Secca Standard',
    rate: 0.21,
    category: 'IMMOBILI',
    isDefault: true,
    description: 'Aliquota fissa per locazioni abitative a canone libero (21%)'
  },
  {
    id: 'rate-concordato-10',
    name: 'Canone Concordato Agevolato',
    rate: 0.10,
    category: 'IMMOBILI',
    isDefault: true,
    description: 'Aliquota ridotta per contratti a canone concordato 3+2 (10%)'
  },
  {
    id: 'rate-irpef-23',
    name: 'IRPEF 1°/2° Scaglione (23%)',
    rate: 0.23,
    category: 'IMMOBILI',
    isDefault: true,
    description: 'Aliquota base ordinaria IRPEF sui redditi fondiari (23%)'
  },
  {
    id: 'rate-btp-125',
    name: 'Titoli di Stato & BTP (12.5%)',
    rate: 0.125,
    category: 'FINANZA',
    isDefault: true,
    description: 'Tassazione agevolata per titoli di stato ed emittenti white list (12.5%)'
  },
  {
    id: 'rate-ordinaria-26',
    name: 'Ritenuta Finanziaria Ordinaria (26%)',
    rate: 0.26,
    category: 'FINANZA',
    isDefault: true,
    description: 'Aliquota standard per capital gain, dividendi e titoli corporate (26%)'
  }
];

