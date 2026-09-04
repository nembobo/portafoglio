import {
  FinancialAsset,
  Property,
  RentalContract,
  Liability,
  BankAccount,
  RegularIncome,
  TaxDisplayMode
} from '../types';
import { calculatePropertyTotalAnnualExpenses } from './propertyExpenseUtils';

export interface ForecastStreamValues {
  gross: number;
  net: number;
}

export interface DetailedForecastYear {
  year: number;
  isPast?: boolean;
  isCurrent?: boolean;
  principalRepayments: number;
  totalInflowsGross: number;
  totalInflowsNet: number;
  totalDebtService: number;
  streams: {
    cedole: ForecastStreamValues;
    affitti: ForecastStreamValues;
    dividendi: ForecastStreamValues;
    liquidita: ForecastStreamValues;
    redditoLavoro: ForecastStreamValues;
    rateMutuo: { outflow: number };
    speseImmobili: { outflow: number };
  };
  // Flat properties for compatibility
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
}

/**
 * Calculates a dynamic past and future cash flow forecast across multiple years
 * strictly reflecting only real assets, rentals, accounts, debts, and regular incomes.
 */
export function generateCashFlowForecast(
  assets: FinancialAsset[],
  properties: Property[],
  rentalContracts: RentalContract[],
  liabilities: Liability[],
  accounts: BankAccount[] = [],
  regularIncomes: RegularIncome[] = [],
  startYear: number = 2024,
  horizonOrEndYear: number = 2035,
  istatInflationRate: number = 0.02,
  dividendGrowthRate: number = 0.03
): DetailedForecastYear[] {
  const currentYear = new Date().getFullYear();
  // Handle horizon passed as count of years or absolute end year
  const endYear = horizonOrEndYear < 100 ? startYear + horizonOrEndYear - 1 : horizonOrEndYear;
  const years: DetailedForecastYear[] = [];
  let runningCumulative = 0;

  for (let yr = startYear; yr <= endYear; yr++) {
    const isPast = yr < currentYear;
    const isCurrent = yr === currentYear;
    const yearsFromNow = Math.max(0, yr - currentYear);
    const inflationFactor = yearsFromNow > 0 ? Math.pow(1 + istatInflationRate, yearsFromNow) : 1;
    const divGrowthFactor = yearsFromNow > 0 ? Math.pow(1 + dividendGrowthRate, yearsFromNow) : 1;

    // 1. CEDOLE BTP & OBBLIGAZIONI
    let cedoleGross = 0;
    let cedoleTax = 0;
    let principalRepayments = 0;

    assets
      .filter(a => a.isBond && a.annualCouponRate)
      .forEach(b => {
        const nominal = b.nominalValue || (b.quantity * 100);
        const rate = b.annualCouponRate || 0;
        const taxRate = b.taxRate || 0.125;

        let bondActive = true;
        if (b.maturityDate) {
          const matYear = parseInt(b.maturityDate.split('-')[0], 10);
          if (!isNaN(matYear)) {
            if (yr > matYear) {
              bondActive = false;
            } else if (yr === matYear) {
              principalRepayments += nominal;
            }
          }
        }

        if (bondActive) {
          const couponAnnual = nominal * rate;
          cedoleGross += couponAnnual;
          cedoleTax += couponAnnual * taxRate;
        }
      });

    const cedoleNet = Math.max(0, cedoleGross - cedoleTax);

    // 2. AFFITTI IMMOBILIARI
    let affittiGross = 0;
    let affittiTax = 0;

    const activeRentals = rentalContracts.filter(r => r.active);
    activeRentals.forEach(r => {
      let rentActive = true;
      if (r.endDate) {
        const endY = parseInt(r.endDate.split('-')[0], 10);
        if (!isNaN(endY) && yr > endY && !r.istatRevaluation) {
          rentActive = false;
        }
      }

      if (rentActive) {
        const baseAnnual = r.monthlyRent * 12;
        const revalued = r.istatRevaluation ? baseAnnual * inflationFactor : baseAnnual;
        const taxRate = r.taxRate || 0.21;
        affittiGross += revalued;
        affittiTax += revalued * taxRate;
      }
    });

    const affittiNet = Math.max(0, affittiGross - affittiTax);

    // 3. DIVIDENDI AZIONI ED ETF
    let dividendiGross = 0;
    let dividendiTax = 0;

    assets
      .filter(a => !a.isBond && a.quantity && (a.dividendPerShare || a.dividendYield))
      .forEach(s => {
        const annualPerShare = s.dividendPerShare || (s.currentPrice * (s.dividendYield || 0.025));
        const divTotal = annualPerShare * s.quantity * divGrowthFactor;
        const taxRate = s.taxRate || 0.26;
        dividendiGross += divTotal;
        dividendiTax += divTotal * taxRate;
      });

    const dividendiNet = Math.max(0, dividendiGross - dividendiTax);

    // 4. RENDIMENTI LIQUIDITÀ & CONTI DEPOSITO
    let liquiditaGross = 0;
    let liquiditaTax = 0;

    accounts
      .filter(a => a.interestRate && a.interestRate > 0)
      .forEach(a => {
        let activeLiq = true;
        if (a.lockMaturityDate) {
          const matY = parseInt(a.lockMaturityDate.split('-')[0], 10);
          if (!isNaN(matY) && yr > matY) {
            activeLiq = false;
          }
        }
        if (activeLiq) {
          const interestAnnual = a.balance * (a.interestRate || 0);
          const tax = interestAnnual * (a.taxRate || 0.26);
          liquiditaGross += interestAnnual;
          liquiditaTax += tax;
        }
      });

    const liquiditaNet = Math.max(0, liquiditaGross - liquiditaTax);

    // 5. REDDITI DA LAVORO / ENTRATE RICORRENTI ORDINARIE
    let redditoGross = 0;
    let redditoNet = 0;

    regularIncomes
      .filter(r => r.active)
      .forEach(r => {
        const mult = r.frequency === 'MONTHLY' ? (r.monthsCount || 12) : 1;
        const gross = r.grossAmount * mult * (yearsFromNow > 0 ? Math.pow(1.015, yearsFromNow) : 1);
        const net = (r.netAmount ? r.netAmount * mult : gross * (1 - (r.taxRate || 0.28))) * (yearsFromNow > 0 ? Math.pow(1.015, yearsFromNow) : 1);
        redditoGross += gross;
        redditoNet += net;
      });

    // 6. PASSIVITÀ & MUTUI (Solo se realmente presenti)
    let rateMutuo = 0;
    liabilities.forEach(l => {
      let debtActive = true;
      if (l.endDate) {
        const endY = parseInt(l.endDate.split('-')[0], 10);
        if (!isNaN(endY) && yr > endY) {
          debtActive = false;
        }
      }
      if (debtActive) {
        rateMutuo += l.monthlyInstallment * 12;
      }
    });

    // 7. SPESE IMMOBILI REALI
    let speseImmobili = 0;
    properties.forEach(p => {
      speseImmobili += calculatePropertyTotalAnnualExpenses(p);
    });
    if (speseImmobili > 0 && yearsFromNow > 0) {
      speseImmobili *= inflationFactor;
    }

    const totalInflowsGross = cedoleGross + affittiGross + dividendiGross + liquiditaGross + redditoGross;
    const totalTaxes = cedoleTax + affittiTax + dividendiTax + liquiditaTax + (redditoGross - redditoNet);
    const totalInflowsNet = totalInflowsGross - totalTaxes;

    const totalDebtService = rateMutuo;
    const totaleUscite = rateMutuo + speseImmobili;
    const netCashFlow = totalInflowsNet - totaleUscite;
    runningCumulative += netCashFlow;

    years.push({
      year: yr,
      isPast,
      isCurrent,
      principalRepayments: Math.round(principalRepayments),
      totalInflowsGross: Math.round(totalInflowsGross),
      totalInflowsNet: Math.round(totalInflowsNet),
      totalDebtService: Math.round(totalDebtService),
      streams: {
        cedole: { gross: Math.round(cedoleGross), net: Math.round(cedoleNet) },
        affitti: { gross: Math.round(affittiGross), net: Math.round(affittiNet) },
        dividendi: { gross: Math.round(dividendiGross), net: Math.round(dividendiNet) },
        liquidita: { gross: Math.round(liquiditaGross), net: Math.round(liquiditaNet) },
        redditoLavoro: { gross: Math.round(redditoGross), net: Math.round(redditoNet) },
        rateMutuo: { outflow: Math.round(rateMutuo) },
        speseImmobili: { outflow: Math.round(speseImmobili) }
      },
      // Flat properties
      cedole: Math.round(cedoleGross),
      affitti: Math.round(affittiGross),
      dividendi: Math.round(dividendiGross),
      altreEntrate: Math.round(liquiditaGross + redditoGross),
      totaleEntrateLorde: Math.round(totalInflowsGross),
      totaleEntrateNette: Math.round(totalInflowsNet),
      tasseEntrate: Math.round(totalTaxes),
      rateMutuo: Math.round(rateMutuo),
      speseImmobili: Math.round(speseImmobili),
      totaleUscite: Math.round(totaleUscite),
      netCashFlow: Math.round(netCashFlow),
      cumulativeCashFlow: Math.round(runningCumulative)
    });
  }

  return years;
}

export interface MonthlyCashFlowItem {
  month: string;
  monthName: string;
  monthNum: number;
  entrateLorde: number;
  entrateNette: number;
  tasse: number;
  uscite: number;
  cedole: number;
  affitti: number;
  dividendi: number;
  liquidita: number;
  redditoLavoro: number;
  mutuo: number;
  speseImmobili: number;
  tassePatrimoniali: number;
  netFlow: number;
}

/**
 * Generates dynamic monthly cash flow breakdown for the current or selected year,
 * strictly derived from active rental contracts, bonds, stocks, accounts, and regular incomes.
 */
export function generateMonthlyCashFlowForYear(
  year: number,
  assets: FinancialAsset[],
  properties: Property[],
  rentalContracts: RentalContract[],
  liabilities: Liability[],
  accounts: BankAccount[] = [],
  regularIncomes: RegularIncome[] = [],
  taxMode: TaxDisplayMode = 'NET'
): MonthlyCashFlowItem[] {
  const months = [
    'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu',
    'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'
  ];

  // Base monthly rent from active contracts
  const activeRentals = rentalContracts.filter(r => r.active);
  const monthlyRentGross = activeRentals.reduce((sum, r) => sum + r.monthlyRent, 0);
  const monthlyRentTax = activeRentals.reduce((sum, r) => sum + r.monthlyRent * (r.taxRate || 0.21), 0);
  const monthlyRentNet = monthlyRentGross - monthlyRentTax;

  // Real debts: monthly installment sum (0 if no liabilities)
  const monthlyDebt = liabilities.reduce((sum, l) => sum + l.monthlyInstallment, 0);

  // Real property expenses distributed monthly
  const totalAnnualPropExpenses = properties.reduce(
    (sum, p) => sum + calculatePropertyTotalAnnualExpenses(p),
    0
  );
  const monthlyPropExpenses = totalAnnualPropExpenses / 12;

  // IMU / Tasse patrimoniali: concentrated in June (acconto) and December (saldo)
  const totalAnnualImu = properties.reduce((sum, p) => sum + (p.annualTaxes || 0), 0);
  const imuPerInstallment = totalAnnualImu / 2;

  // Monthly liquidity interest
  const monthlyLiqGross = accounts
    .filter(a => a.interestRate && a.interestRate > 0)
    .reduce((sum, a) => sum + (a.balance * (a.interestRate || 0)) / 12, 0);
  const monthlyLiqTax = accounts
    .filter(a => a.interestRate && a.interestRate > 0)
    .reduce((sum, a) => sum + ((a.balance * (a.interestRate || 0)) / 12) * (a.taxRate || 0.26), 0);

  return months.map((monthName, idx) => {
    const monthNum = idx + 1;

    // 1. Bond coupons active in this month
    let couponGross = 0;
    let couponTax = 0;
    assets
      .filter(a => a.isBond && a.annualCouponRate)
      .forEach(b => {
        const nominal = b.nominalValue || (b.quantity * 100);
        const annualCoupon = nominal * (b.annualCouponRate || 0);
        const taxRate = b.taxRate || 0.125;

        let shouldPayInMonth = false;
        if (b.couponMonths && b.couponMonths.length > 0) {
          shouldPayInMonth = b.couponMonths.includes(monthNum);
        } else {
          // Default distribution based on coupon frequency
          const freq = b.couponFrequency || 'SEMI_ANNUAL';
          if (freq === 'SEMI_ANNUAL' && (monthNum === 3 || monthNum === 9)) {
            shouldPayInMonth = true;
          } else if (freq === 'ANNUAL' && monthNum === 10) {
            shouldPayInMonth = true;
          } else if (freq === 'QUARTERLY' && (monthNum % 3 === 0)) {
            shouldPayInMonth = true;
          }
        }

        if (shouldPayInMonth) {
          const divisor = b.couponFrequency === 'QUARTERLY' ? 4 : (b.couponFrequency === 'ANNUAL' ? 1 : 2);
          const amt = annualCoupon / divisor;
          couponGross += amt;
          couponTax += amt * taxRate;
        }
      });

    // 2. Dividends
    let divGross = 0;
    let divTax = 0;
    assets
      .filter(a => !a.isBond && a.quantity && (a.dividendPerShare || a.dividendYield))
      .forEach(s => {
        const annual = (s.dividendPerShare || (s.currentPrice * (s.dividendYield || 0.025))) * s.quantity;
        const taxRate = s.taxRate || 0.26;
        // Dividend season in May (European) and Nov (US/Interim)
        if (monthNum === 5) {
          divGross += annual * 0.6;
          divTax += annual * 0.6 * taxRate;
        } else if (monthNum === 11) {
          divGross += annual * 0.4;
          divTax += annual * 0.4 * taxRate;
        }
      });

    // 3. Regular Incomes (Stipendio, Pensione, ecc.)
    let redditoGross = 0;
    let redditoNet = 0;
    regularIncomes
      .filter(r => r.active)
      .forEach(r => {
        if (r.frequency === 'MONTHLY') {
          let multiplier = 1;
          // Tredicesima in December
          if (monthNum === 12 && (r.monthsCount || 12) >= 13) {
            multiplier += 1;
          }
          // Quattordicesima in June
          if (monthNum === 6 && (r.monthsCount || 12) >= 14) {
            multiplier += 1;
          }
          const gross = r.grossAmount * multiplier;
          const net = (r.netAmount || gross * (1 - (r.taxRate || 0.28))) * multiplier;
          redditoGross += gross;
          redditoNet += net;
        } else if (r.frequency === 'ANNUAL' && monthNum === 12) {
          redditoGross += r.grossAmount;
          redditoNet += r.netAmount || r.grossAmount * (1 - (r.taxRate || 0.28));
        }
      });

    // 4. IMU Property tax: June (acconto) and December (saldo)
    let imuTax = 0;
    if ((monthNum === 6 || monthNum === 12) && imuPerInstallment > 0) {
      imuTax = imuPerInstallment;
    }

    const totalInflowGross = monthlyRentGross + couponGross + divGross + monthlyLiqGross + redditoGross;
    const totalTaxes = monthlyRentTax + couponTax + divTax + monthlyLiqTax + (redditoGross - redditoNet);
    const totalInflowNet = totalInflowGross - totalTaxes;

    const totalOutflow = monthlyDebt + monthlyPropExpenses + imuTax;
    const netFlow = (taxMode === 'NET' ? totalInflowNet : totalInflowGross) - totalOutflow;

    return {
      month: `${monthName} ${String(year).slice(2)}`,
      monthName,
      monthNum,
      entrateLorde: Math.round(totalInflowGross),
      entrateNette: Math.round(totalInflowNet),
      tasse: Math.round(totalTaxes),
      uscite: Math.round(totalOutflow),
      cedole: Math.round(couponGross),
      affitti: Math.round(monthlyRentGross),
      dividendi: Math.round(divGross),
      liquidita: Math.round(monthlyLiqGross),
      redditoLavoro: Math.round(redditoGross),
      mutuo: Math.round(monthlyDebt),
      speseImmobili: Math.round(monthlyPropExpenses),
      tassePatrimoniali: Math.round(imuTax),
      netFlow: Math.round(netFlow)
    };
  });
}
