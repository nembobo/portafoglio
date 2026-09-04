import {
  FinancialAsset,
  Property,
  RentalContract,
  Liability,
  FinancialEvent,
  EventStatus
} from '../types';

export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCurrencyPrecise = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPercent = (rate: number): string => {
  return new Intl.NumberFormat('it-IT', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(rate);
};

/**
 * Generates all recurring automatic cash flow events (Coupons, Rents, Dividends, Mortgages, Salaries)
 * spanning 12 months past and 24 months future.
 */
export function generateAutomatedEvents(
  assets: FinancialAsset[],
  properties: Property[],
  rentalContracts: RentalContract[],
  liabilities: Liability[],
  currentDate: Date = new Date()
): FinancialEvent[] {
  const events: FinancialEvent[] = [];
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed
  const todayStr = currentDate.toISOString().split('T')[0];

  // 1. BOND COUPONS AUTOMATION
  assets.filter(a => a.isBond && (a.nominalValue || a.quantity) && a.annualCouponRate).forEach(bond => {
    const nominal = bond.nominalValue || (bond.quantity * (bond.currentPrice > 10 ? bond.currentPrice : 100)) || 0;
    const rate = bond.annualCouponRate || 0;
    const freq = bond.couponFrequency || 'SEMI_ANNUAL';
    const taxRate = bond.taxRate || 0.125;
    
    let defaultMonths = [3, 9];
    let payoutFactor = 0.5;
    if (freq === 'ANNUAL') {
      defaultMonths = [11];
      payoutFactor = 1;
    } else if (freq === 'SEMI_ANNUAL') {
      defaultMonths = [3, 9];
      payoutFactor = 0.5;
    } else if (freq === 'QUARTERLY') {
      defaultMonths = [3, 6, 9, 12];
      payoutFactor = 0.25;
    } else if (freq === 'MONTHLY') {
      defaultMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      payoutFactor = 1 / 12;
    }

    const months = bond.couponMonths || defaultMonths;
    const day = bond.couponDay || 1;
    const grossAmount = nominal * rate * payoutFactor;
    const taxAmount = grossAmount * taxRate;
    const netAmount = grossAmount - taxAmount;

    // Generate for years [currentYear - 1, currentYear, currentYear + 1]
    for (let yr = currentYear - 1; yr <= currentYear + 1; yr++) {
      months.forEach(m => {
        const monthPad = String(m).padStart(2, '0');
        const dayPad = String(day).padStart(2, '0');
        const eventDateStr = `${yr}-${monthPad}-${dayPad}`;

        if (bond.maturityDate && eventDateStr > bond.maturityDate) return;

        let status: EventStatus = 'PREVISTA';
        if (eventDateStr < todayStr) {
          // If it was more than 7 days ago and in the past, consider it received (or simulate 1 received)
          status = 'RICEVUTA';
        }

        events.push({
          id: `coupon-${bond.id}-${yr}-${m}`,
          title: `Cedola ${bond.name}`,
          category: 'CEDOLA',
          type: 'INCOME',
          date: eventDateStr,
          grossAmount,
          taxAmount,
          netAmount,
          status,
          sourceAssetId: bond.id,
          sourceAssetName: bond.name,
          accountId: bond.accountId,
          ownerId: bond.ownerId,
          isRecurring: true,
          confirmedDate: status === 'RICEVUTA' ? eventDateStr : undefined,
          notes: `Cedola automatica ${formatPercent(rate)} su VN €${nominal.toLocaleString('it-IT')}`
        });
      });
    }
  });

  // 2. REAL ESTATE AUTOMATIC RENTALS
  rentalContracts.filter(rc => rc.active).forEach(contract => {
    const property = properties.find(p => p.id === contract.propertyId);
    const propName = property ? property.name : 'Immobile';
    const propOwner = property ? property.ownerId : 'mem-1';
    const grossAmount = contract.monthlyRent;
    const taxRate = contract.taxRate || 0.21;
    const taxAmount = grossAmount * taxRate;
    const netAmount = grossAmount - taxAmount;
    const payDay = contract.paymentDayOfMonth || 5;

    // Generate month-by-month for past 6 months to next 12 months
    for (let offset = -6; offset <= 12; offset++) {
      const d = new Date(currentYear, currentMonth + offset, payDay);
      const yr = d.getFullYear();
      const m = d.getMonth() + 1;
      const monthPad = String(m).padStart(2, '0');
      const dayPad = String(payDay).padStart(2, '0');
      const eventDateStr = `${yr}-${monthPad}-${dayPad}`;

      if (contract.startDate && eventDateStr < contract.startDate) continue;
      if (contract.endDate && eventDateStr > contract.endDate) continue;

      let status: EventStatus = 'PREVISTA';
      const eventDate = new Date(eventDateStr);
      const diffDays = Math.floor((currentDate.getTime() - eventDate.getTime()) / (1000 * 3600 * 24));

      if (diffDays > 4) {
        // Past due by more than 4 days
        if (offset === -1 && contract.id === 'rent-rimini') {
          // Simulate one overdue rent to demonstrate the alert in action!
          status = 'IN_RITARDO';
        } else if (offset < 0) {
          status = 'RICEVUTA';
        } else {
          status = 'IN_RITARDO';
        }
      } else if (diffDays >= 0) {
        status = 'PREVISTA';
      }

      events.push({
        id: `rent-${contract.id}-${yr}-${monthPad}`,
        title: `Affitto: ${contract.tenantName} (${propName})`,
        category: 'AFFITTO',
        type: 'INCOME',
        date: eventDateStr,
        grossAmount,
        taxAmount,
        netAmount,
        status,
        sourceAssetId: contract.propertyId,
        sourceAssetName: propName,
        ownerId: propOwner,
        isRecurring: true,
        confirmedDate: status === 'RICEVUTA' ? eventDateStr : undefined,
        notes: `Canone concordato ${contract.taxRegime === 'CEDOLARE_SECCA' ? 'Cedolare Secca 21%' : 'Regime Ordinario 26%'}`
      });
    }
  });

  // 3. STOCK & ETF DIVIDENDS
  assets.filter(a => a.dividendPerShare && a.quantity).forEach(stock => {
    const grossAmount = (stock.dividendPerShare || 0) * stock.quantity;
    const taxRate = stock.taxRate || 0.26;
    const taxAmount = grossAmount * taxRate;
    const netAmount = grossAmount - taxAmount;

    if (stock.nextDividendPayDate) {
      events.push({
        id: `div-${stock.id}-${stock.nextDividendPayDate}`,
        title: `Dividendo ${stock.name}`,
        category: 'DIVIDENDO',
        type: 'INCOME',
        date: stock.nextDividendPayDate,
        grossAmount,
        taxAmount,
        netAmount,
        status: stock.nextDividendPayDate < todayStr ? 'RICEVUTA' : 'PREVISTA',
        sourceAssetId: stock.id,
        sourceAssetName: stock.name,
        accountId: stock.accountId,
        ownerId: stock.ownerId,
        isRecurring: true,
        notes: `Dividendo stimato ${stock.quantity} azioni × €${stock.dividendPerShare?.toFixed(2)}`
      });
    }
  });

  // 4. DEBT & MORTGAGE PAYMENTS (Uscite)
  liabilities.forEach(debt => {
    const property = properties.find(p => p.id === debt.associatedAssetId);
    const day = debt.installmentDayOfMonth || 15;

    for (let offset = -4; offset <= 12; offset++) {
      const d = new Date(currentYear, currentMonth + offset, day);
      const yr = d.getFullYear();
      const m = d.getMonth() + 1;
      const monthPad = String(m).padStart(2, '0');
      const dayPad = String(day).padStart(2, '0');
      const eventDateStr = `${yr}-${monthPad}-${dayPad}`;

      let status: EventStatus = 'PREVISTA';
      if (eventDateStr < todayStr) {
        status = 'PAGATA';
      }

      events.push({
        id: `debt-${debt.id}-${yr}-${monthPad}`,
        title: `Rata Mutuo: ${debt.name}`,
        category: 'RATA_MUTUO',
        type: 'EXPENSE',
        date: eventDateStr,
        grossAmount: debt.monthlyInstallment,
        taxAmount: 0,
        netAmount: debt.monthlyInstallment,
        status,
        sourceAssetId: debt.id,
        sourceAssetName: property ? property.name : debt.name,
        ownerId: debt.ownerId,
        isRecurring: true,
        notes: `Rata ammortamento tasso ${debt.interestRate}%`
      });
    }
  });

  // 5. TAX PAYMENTS (Acconti / Saldi IRPEF & IMU)
  const imuTaxes = properties.reduce((acc, p) => acc + (p.annualTaxes || 0), 0);
  if (imuTaxes > 0) {
    // Acconto IMU 16 Giugno, Saldo 16 Dicembre
    for (let yr = currentYear - 1; yr <= currentYear + 1; yr++) {
      events.push({
        id: `tax-imu-1-${yr}`,
        title: `Versamento Acconto IMU Patrimoniale`,
        category: 'TASSA',
        type: 'EXPENSE',
        date: `${yr}-06-16`,
        grossAmount: imuTaxes / 2,
        taxAmount: 0,
        netAmount: imuTaxes / 2,
        status: `${yr}-06-16` < todayStr ? 'PAGATA' : 'PREVISTA',
        ownerId: 'mem-all',
        isRecurring: true,
        notes: 'Imposta Municipale Propria (acconto 50%)'
      });
      events.push({
        id: `tax-imu-2-${yr}`,
        title: `Versamento Saldo IMU Patrimoniale`,
        category: 'TASSA',
        type: 'EXPENSE',
        date: `${yr}-12-16`,
        grossAmount: imuTaxes / 2,
        taxAmount: 0,
        netAmount: imuTaxes / 2,
        status: `${yr}-12-16` < todayStr ? 'PAGATA' : 'PREVISTA',
        ownerId: 'mem-all',
        isRecurring: true,
        notes: 'Imposta Municipale Propria (saldo 50%)'
      });
    }
  }

  // Sort by date ascending
  return events.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculates unrealized capital gain and latent tax liability for an asset
 */
export function calculateUnrealizedTax(asset: FinancialAsset): {
  marketValue: number;
  costBasis: number;
  unrealizedGain: number;
  latentTax: number;
  afterTaxValue: number;
} {
  const marketValue = asset.quantity * asset.currentPrice;
  const costBasis = asset.quantity * asset.averageBuyPrice;
  const unrealizedGain = Math.max(0, marketValue - costBasis);
  const latentTax = unrealizedGain * (asset.unrealizedGainTaxRate || asset.taxRate || 0.26);
  const afterTaxValue = marketValue - latentTax;

  return { marketValue, costBasis, unrealizedGain, latentTax, afterTaxValue };
}

/**
 * Calculates historical net worth trendpoints based on assets, liabilities, and growth
 */
export function generateNetWorthHistory(
  currentNetWorth: number,
  period: '1M' | '3M' | 'YTD' | '1Y' | '5Y' | 'ALL'
): { date: string; value: number; gross: number; debt: number; afterTax: number }[] {
  const points: { date: string; value: number; gross: number; debt: number; afterTax: number }[] = [];
  const count = period === '1M' ? 30 : period === '3M' ? 12 : period === 'YTD' ? 9 : period === '1Y' ? 12 : 24;
  const stepDays = period === '1M' ? 1 : period === '3M' ? 7 : period === 'YTD' ? 30 : 30;

  const now = new Date();
  const latentTaxFactor = 0.05; // ~5% latent tax on unrealized
  const debtTotal = 250000;

  for (let i = count; i >= 0; i--) {
    const d = new Date(now.getTime() - i * stepDays * 24 * 3600 * 1000);
    const label = period === '1M'
      ? `${d.getDate()} ${d.toLocaleString('it-IT', { month: 'short' })}`
      : `${d.toLocaleString('it-IT', { month: 'short' })} ${d.getFullYear().toString().slice(-2)}`;

    // Compound simulated mild variance leading to currentNetWorth
    const growthProgress = (count - i) / count;
    const baseVal = currentNetWorth * (0.88 + 0.12 * growthProgress) + (Math.sin(i * 1.3) * 12000);
    const finalVal = i === 0 ? currentNetWorth : Math.round(baseVal);
    const gross = finalVal + debtTotal;
    const afterTax = Math.round(finalVal - finalVal * latentTaxFactor);

    points.push({
      date: label,
      value: finalVal,
      gross,
      debt: debtTotal,
      afterTax
    });
  }

  return points;
}
