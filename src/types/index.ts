export type Currency = 'EUR' | 'USD' | 'CHF' | 'GBP';

export type TaxDisplayMode = 'GROSS' | 'NET';

export type EntityType = 'PERSONAL' | 'FAMILY' | 'COMPANY';

export interface FamilyMember {
  id: string;
  name: string;
  role: 'Capofamiglia' | 'Coniuge' | 'Figlio' | 'Holding';
  avatarColor: string;
}

export type BankAccountType =
  | 'CONTO_CORRENTE'
  | 'CONTO_DEPOSITO_LIBERO'
  | 'CONTO_DEPOSITO_VINCOLATO'
  | 'STRUMENTO_LIQUIDITA'
  | 'BROKER'
  | 'CRYPTO_WALLET';

export interface BankAccount {
  id: string;
  name: string;
  institution: string; // e.g. "Fineco", "Intesa Sanpaolo", "Interactive Brokers"
  type: BankAccountType;
  iban?: string;
  currency: Currency;
  balance: number;
  availableLiquidity: number;
  ownerId: string; // FamilyMember id
  interestRate?: number; // e.g. 0.035 for 3.5% lordo annuo
  taxRate?: number; // e.g. 0.26 for depositi, 0.125 for BOT / ETF monetari
  lockMaturityDate?: string; // per depositi vincolati
  isLocked?: boolean;
  notes?: string;
}

export interface RegularIncome {
  id: string;
  name: string;
  category: 'STIPENDIO' | 'PENSIONE' | 'LAVORO_AUTONOMO' | 'CONSULENZA' | 'ALTRO';
  grossAmount: number;
  frequency: 'MONTHLY' | 'ANNUAL' | 'QUARTERLY';
  taxRate?: number;
  netAmount?: number;
  monthsCount?: number; // 12, 13, 14 mensilità
  ownerId?: string;
  notes?: string;
  active: boolean;
}

export type AssetCategory =
  | 'STOCK'
  | 'ETF'
  | 'BOND'
  | 'GOV_BOND' // BTP, Bot, etc.
  | 'FUND'
  | 'CERTIFICATE'
  | 'LIQUIDITY'
  | 'CRYPTO'
  | 'PRIVATE_EQUITY'
  | 'PARTICIPATION';

export interface FinancialAsset {
  id: string;
  name: string;
  ticker?: string;
  isin: string;
  category: AssetCategory;
  quantity: number;
  averageBuyPrice: number; // Prezzo medio di carico (PMC)
  currentPrice: number;
  currency: Currency;
  accountId: string; // linked bank/broker account
  ownerId: string; // linked family member or holding
  ownershipPercentage: number; // e.g. 100% or 50%
  taxRate: number; // e.g. 0.26 for stocks, 0.125 for BTP
  unrealizedGainTaxRate: number; // usually same as taxRate
  totalCouponsOrDividendsReceived: number;
  irrEstimated: number; // e.g. 7.4%
  notes?: string;

  // Specific for bonds/BTP:
  isBond?: boolean;
  nominalValue?: number; // Valore nominale e.g. 100000
  annualCouponRate?: number; // e.g. 0.04 for 4%
  couponFrequency?: 'ANNUAL' | 'SEMI_ANNUAL' | 'QUARTERLY' | 'MONTHLY';
  couponMonths?: number[]; // e.g. [3, 9] for March and September
  couponDay?: number; // e.g. 1
  maturityDate?: string; // e.g. "2030-09-01"
  isIndexed?: boolean;

  // Specific for stocks/ETFs:
  dividendPerShare?: number;
  dividendYield?: number;
  dividendFrequency?: 'ANNUAL' | 'SEMI_ANNUAL' | 'QUARTERLY';
  nextExDividendDate?: string;
  nextDividendPayDate?: string;
}

export type PropertyType =
  | 'ABITAZIONE_PERSONALE'
  | 'AFFITTO_LUNGO_TERMINE'
  | 'AFFITTO_BREVE'
  | 'COMMERCIALE'
  | 'NON_LOCATO';

export type ExpenseFrequency =
  | 'MONTHLY'
  | 'BIMONTHLY'
  | 'QUARTERLY'
  | 'SEMIANNUAL'
  | 'ANNUAL'
  | 'ONE_OFF';

export interface PropertyExpense {
  id: string;
  propertyId: string;
  name: string;
  amount: number;
  frequency: ExpenseFrequency;
  category?: 'CONDOMINIO' | 'IMU_TARI' | 'ASSICURAZIONE' | 'MANUTENZIONE' | 'GESTIONE' | 'UTENZE' | 'ALTRO';
  notes?: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  type: PropertyType;
  purchaseValue: number;
  currentValue: number;
  purchaseDate: string;
  sqm: number; // metratura
  ownerId: string;
  ownershipPercentage: number; // e.g. 100%
  associatedMortgageId?: string; // mutuo associato (opzionale)
  annualExpenses: number; // spese ordinarie complessive
  annualTaxes: number; // IMU, etc.
  annualInsurance: number;
  annualMaintenance: number;
  taxRate: number; // e.g. 0.21 (cedolare secca) or 0.26
  imageUrl?: string;
  expenses?: PropertyExpense[]; // Dettaglio spese personalizzabili
}

export interface RentalContract {
  id: string;
  propertyId: string;
  tenantName: string;
  tenantPhone?: string;
  tenantEmail?: string;
  monthlyRent: number; // canone mensile lordo
  paymentFrequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  paymentDayOfMonth: number; // e.g. 5
  startDate: string;
  endDate: string;
  additionalExpensesMonthly: number; // spese condominiali a carico inquilino
  securityDeposit: number; // deposito cauzionale
  istatRevaluation: boolean;
  taxRegime: 'CEDOLARE_SECCA' | 'ORDINARIO';
  taxRate: number; // 0.21 or 0.26
  active: boolean;
}

export type DebtType = 'MUTUO' | 'PRESTITO' | 'FINANZIAMENTO' | 'CREDIT_LOMBARD' | 'ALTRO';

export interface Liability {
  id: string;
  name: string;
  type: DebtType;
  institution: string;
  initialAmount: number;
  remainingCapital: number;
  interestRate: number; // e.g. 3.25 for 3.25%
  isFixedRate: boolean;
  monthlyInstallment: number; // rata mensile
  installmentDayOfMonth: number;
  startDate: string;
  endDate: string;
  associatedAssetId?: string; // e.g. property id
  ownerId: string;
}

export type AlternativeCategory =
  | 'OROLOGIO'
  | 'ORO_FISICO'
  | 'OPERA_ARTE'
  | 'GIOIELLO'
  | 'AUTO_COLLEZIONE'
  | 'VINO_DISTILLATI'
  | 'COLLEZIONABILE'
  | 'ALTRO';

export type WatchSetType =
  | 'FULL_SET'
  | 'SOLO_OROLOGIO'
  | 'SCATOLA_GARANZIA'
  | 'SOLO_SCATOLA'
  | 'SOLO_GARANZIA';

export type WatchWarrantyType =
  | 'CARD_ELETTRONICA'
  | 'CARTACEA_UFFICIALE'
  | 'ESTRATTO_ARCHIVIO'
  | 'SCADUTA'
  | 'RIVENDITORE_TERZO'
  | 'NESSUNA';

export type WatchCondition =
  | 'NUOVO_MAI_INDOSSATO'
  | 'OTTIMO_PARI_AL_NUOVO'
  | 'BUONO_USATO'
  | 'REVISIONATO';

export interface AlternativeAsset {
  id: string;
  name: string;
  category: AlternativeCategory;
  purchaseValue: number;
  currentValue: number;
  purchaseDate: string;
  ownerId: string;
  ownershipPercentage: number;
  description?: string;
  location?: string; // caveau, casa, cassetta sicurezza
  hasDocuments: boolean;
  isInsured: boolean;
  notes?: string;

  // Specific for Gold & Precious Metals:
  goldGrams?: number; // Peso in grammi
  goldCarats?: string; // 24K (999.9), 22K, 18K (750), ecc.
  goldType?: 'LINGOTTO' | 'MONETA' | 'GIOIELLO' | 'ALTRO';
  goldRefinery?: string; // Valcambi, Argor-Heraeus, Krugerrand, Sovereign, ecc.
  goldSerial?: string; // Numero di serie/blister

  // Specific for Luxury Watches:
  watchBrand?: string; // Rolex, Patek Philippe, Audemars Piguet, Omega, ecc.
  watchModel?: string; // Submariner Date, Daytona, Royal Oak, Nautilus, ecc.
  watchReference?: string; // Ref. es. 126610LN
  watchYear?: number | string; // Anno produzione / garanzia
  watchSet?: WatchSetType; // Full Set, Solo Orologio, ecc.
  watchWarrantyType?: WatchWarrantyType; // Card, Cartacea, ecc.
  watchCondition?: WatchCondition; // Nuovo, Ottimo, ecc.
  watchMaterial?: string; // Acciaio, Oro Giallo, Oro Rosa, Platino, Bicolore, ecc.
  watchSerial?: string; // Seriale cassa (opzionale)

  // Specific for Art & Paintings:
  artArtist?: string;
  artTitle?: string;
  artYear?: number | string;
  artTechnique?: string; // Olio su tela, scultura, litografia, ecc.
  artDimensions?: string; // es. 100x80 cm
  artCertificate?: string; // Archivio Fondazione, Galleria, Perizia

  // Specific for Classic Cars & Supercars:
  carBrandModel?: string;
  carYear?: number | string;
  carVinPlate?: string; // Targa o numero telaio
  carMileage?: number; // km
  carCertification?: string; // ASI Targa Oro, FIVA, ecc.
  carCondition?: string;

  // Specific for Fine Wine & Spirits:
  wineProducer?: string; // Cantina / Produttore
  wineVintage?: string; // Annata
  wineBottleSize?: string; // 0.75L, Magnum 1.5L, Cassa OWC
  wineQuantity?: number; // Numero bottiglie
  wineStorageCondition?: string; // Cantina termocontrollata, ecc.

  // Specific for Jewelry & Gems:
  jewelryGemType?: string; // Diamante, Smeraldo, Rubino, ecc.
  jewelryCarats?: number; // Carati
  jewelryCertificate?: string; // GIA, HRD, IGI
  jewelryMetal?: string; // Oro 18k, Platino
}

export interface CompanyParticipation {
  id: string;
  companyName: string;
  type: 'HOLDING' | 'IMMOBILIARE' | 'OPERATIVA' | 'STARTUP';
  ownershipPercentage: number;
  estimatedValuation: number; // valore quota stimato
  totalCompanyValuation: number;
  parentOwnerId: string; // e.g. family or holding id
  dividendsReceivedYtd: number;
  shareholderLoan: number; // finanziamento soci
  companyCashReserve: number; // liquidità societaria
  description?: string;
  heldAssetIds: string[]; // properties or accounts owned by this company
}

export type EventStatus = 'PREVISTA' | 'RICEVUTA' | 'IN_RITARDO' | 'PAGATA';

export type EventCategory =
  | 'CEDOLA'
  | 'DIVIDENDO'
  | 'AFFITTO'
  | 'RATA_MUTUO'
  | 'STIPENDIO'
  | 'TASSA'
  | 'ASSICURAZIONE'
  | 'MANUTENZIONE'
  | 'DISTRIBUZIONE'
  | 'SPESA_PERSONALE';

export interface FinancialEvent {
  id: string;
  title: string;
  category: EventCategory;
  type: 'INCOME' | 'EXPENSE';
  date: string; // "YYYY-MM-DD"
  grossAmount: number;
  taxAmount: number;
  netAmount: number;
  status: EventStatus;
  sourceAssetId?: string;
  sourceAssetName?: string;
  accountId?: string;
  ownerId: string;
  isRecurring: boolean;
  confirmedDate?: string;
  notes?: string;
}

export interface SmartRule {
  id: string;
  keyword: string; // e.g. "ROSSI MARIO", "MINISTERO ECONOMIA", "VANGUARD"
  category: EventCategory;
  description: string;
  targetAssetId?: string;
  targetAssetName?: string;
  action: 'MARK_RECEIVED' | 'CREATE_EVENT';
  isActive: boolean;
}

export interface BankTransactionImport {
  id: string;
  date: string;
  description: string;
  amount: number;
  matchedRuleId?: string;
  matchedEventId?: string;
  status: 'MATCHED' | 'UNMATCHED' | 'PROCESSED';
}

export interface TaxLoss {
  id: string;
  amount: number;
  date: string;
  assetSource: string;
  expiryDate: string; // e.g. 4 years from creation in Italy
  usedAmount: number;
  residualAmount: number;
}

export interface RealizedGain {
  id: string;
  assetName: string;
  category: AssetCategory;
  saleDate: string;
  salePrice: number;
  purchasePrice: number;
  gainGross: number; // can be negative for loss
  taxRate: number;
  taxDue: number;
  gainNet: number;
  taxPaid: boolean;
}

export interface GlobalTaxProfile {
  name: string;
  stockGainRate: number; // 0.26
  etfGainRate: number; // 0.26
  govBondRate: number; // 0.125
  corpBondRate: number; // 0.26
  dividendRate: number; // 0.26
  interestRate: number; // 0.26
  rentalCedolareSeccaRate: number; // 0.21
  rentalOrdinaryRate: number; // 0.26
  cryptoRate: number; // 0.26
}

export interface CustomTaxRate {
  id: string;
  name: string;
  rate: number; // e.g. 0.21, 0.23
  category: 'IMMOBILI' | 'FINANZA' | 'MISTO' | 'ALTRO';
  description?: string;
  isDefault?: boolean;
  combinedFrom?: string[]; // IDs of combined rates if blended
}

export interface AssetTimeSeriesPoint {
  date: string;
  price: number;
  value: number; // quantity * price
  volume?: number;
}

export interface AssetOnlineQuote {
  isin: string;
  ticker?: string;
  name: string;
  currentPrice: number;
  previousClose: number;
  changeAmount: number;
  changePercent: number;
  lastUpdated: string;
  category: AssetCategory;
  currency: Currency;
  couponRate?: number;
  maturityDate?: string;
  couponFrequency?: 'ANNUAL' | 'SEMI_ANNUAL' | 'QUARTERLY' | 'MONTHLY';
  yieldToMaturity?: number;
  timeSeries: {
    '1M': AssetTimeSeriesPoint[];
    '6M': AssetTimeSeriesPoint[];
    '1Y': AssetTimeSeriesPoint[];
    '3Y': AssetTimeSeriesPoint[];
    '5Y': AssetTimeSeriesPoint[];
  };
}

export interface CashFlowForecastYear {
  year: number;
  cedole: number;
  affitti: number;
  dividendi: number;
  altreEntrate: number;
  totaleEntrateLorde: number;
  totaleEntrateNette: number;
  tasseEntrate: number;
  rateMutuo: number;
  speseImmobili: number;
  totaleUscite: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
  isPast?: boolean;
}

export interface AssetDocument {
  id: string;
  assetId: string;
  assetName: string;
  name: string;
  type: 'CONTRATTO' | 'ROGITO' | 'VISURA' | 'CERTIFICATO' | 'GARANZIA' | 'FATTURA' | 'ALTRO';
  uploadDate: string;
  fileSize: string;
}

