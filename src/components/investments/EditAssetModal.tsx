import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign, Percent, Calendar, Tag, Layers, Check } from 'lucide-react';
import { FinancialAsset, AssetCategory } from '../../types';
import { useWealth } from '../../context/WealthContext';

interface EditAssetModalProps {
  asset: FinancialAsset | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditAssetModal: React.FC<EditAssetModalProps> = ({
  asset,
  isOpen,
  onClose
}) => {
  const { updateFinancialAsset, customTaxRates } = useWealth();

  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [isin, setIsin] = useState('');
  const [category, setCategory] = useState<AssetCategory>('STOCK');
  const [quantity, setQuantity] = useState(1);
  const [currentPrice, setCurrentPrice] = useState(100);
  const [averageBuyPrice, setAverageBuyPrice] = useState(100);
  const [taxRate, setTaxRate] = useState(0.26);
  const [isBond, setIsBond] = useState(false);
  const [annualCouponRate, setAnnualCouponRate] = useState(0.04);
  const [couponFrequency, setCouponFrequency] = useState<'ANNUAL' | 'SEMI_ANNUAL' | 'QUARTERLY' | 'MONTHLY'>('SEMI_ANNUAL');
  const [maturityDate, setMaturityDate] = useState('');

  useEffect(() => {
    if (asset) {
      setName(asset.name || '');
      setTicker(asset.ticker || '');
      setIsin(asset.isin || '');
      setCategory(asset.category || 'STOCK');
      setQuantity(asset.quantity || 1);
      setCurrentPrice(asset.currentPrice || 100);
      setAverageBuyPrice(asset.averageBuyPrice || 100);
      setTaxRate(asset.taxRate || 0.26);
      setIsBond(Boolean(asset.isBond || asset.category === 'GOV_BOND' || asset.category === 'BOND'));
      setAnnualCouponRate(asset.annualCouponRate || 0.04);
      setCouponFrequency(asset.couponFrequency || (asset.category === 'GOV_BOND' ? 'SEMI_ANNUAL' : 'ANNUAL'));
      setMaturityDate(asset.maturityDate || '');
    }
  }, [asset]);

  if (!isOpen || !asset) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateFinancialAsset(asset.id, {
      name: name.trim(),
      ticker: ticker.trim().toUpperCase() || undefined,
      isin: isin.trim().toUpperCase(),
      category,
      quantity: Number(quantity) || 1,
      currentPrice: Number(currentPrice) || 0,
      averageBuyPrice: Number(averageBuyPrice) || 0,
      taxRate: Number(taxRate) || 0.26,
      unrealizedGainTaxRate: Number(taxRate) || 0.26,
      isBond,
      annualCouponRate: isBond ? Number(annualCouponRate) : undefined,
      couponFrequency: isBond ? couponFrequency : undefined,
      maturityDate: isBond && maturityDate ? maturityDate : undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh] animate-in fade-in">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>Modifica Titolo / Strumento</span>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                {category}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Aggiorna quote, prezzo di mercato, PMC o aliquota fiscale applicata.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs mt-4">
          {/* Nome e Ticker */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Nome Strumento / Titolo
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="es. BTP 4.35% Nov 2033"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Ticker
              </label>
              <input
                type="text"
                value={ticker}
                onChange={e => setTicker(e.target.value)}
                placeholder="es. BTP-33"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* ISIN e Tipologia */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Codice ISIN
              </label>
              <input
                type="text"
                value={isin}
                onChange={e => setIsin(e.target.value)}
                placeholder="es. IT0005544082"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={e => {
                  const val = e.target.value as AssetCategory;
                  setCategory(val);
                  if (val === 'GOV_BOND' || val === 'BOND') {
                    setIsBond(true);
                    if (val === 'GOV_BOND') setTaxRate(0.125);
                  } else {
                    setIsBond(false);
                    if (taxRate === 0.125) setTaxRate(0.26);
                  }
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
              >
                <option value="GOV_BOND">BTP / Titolo di Stato</option>
                <option value="BOND">Obbligazione Corporate</option>
                <option value="ETF">ETF</option>
                <option value="STOCK">Azione</option>
                <option value="FUND">Fondo Comune</option>
                <option value="CERTIFICATE">Certificato</option>
                <option value="CRYPTO">Criptovaluta</option>
              </select>
            </div>
          </div>

          {/* Quantità, Prezzo Attuale, PMC */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Quantità / Quote
              </label>
              <input
                type="number"
                step="any"
                required
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Prezzo Mercato (€)
              </label>
              <input
                type="number"
                step="0.0001"
                required
                value={currentPrice}
                onChange={e => setCurrentPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold text-indigo-700"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                PMC Carico (€)
              </label>
              <input
                type="number"
                step="0.0001"
                required
                value={averageBuyPrice}
                onChange={e => setAverageBuyPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Calcolo veloce controvalore */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between font-mono">
            <span className="text-slate-500 font-sans">Controvalore Totale Attuale:</span>
            <span className="font-bold text-slate-900 text-sm">
              €{(quantity * currentPrice).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Aliquota Fiscale */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-700 font-semibold flex items-center gap-1">
                <Percent className="w-3 h-3 text-indigo-600" />
                <span>Aliquota Imposta Capital Gain / Cedole</span>
              </label>
              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                {(taxRate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTaxRate(0.125)}
                className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${
                  taxRate === 0.125
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                12.5% (BTP / White List)
              </button>
              <button
                type="button"
                onClick={() => setTaxRate(0.26)}
                className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${
                  taxRate === 0.26
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                26.0% (Azioni / ETF)
              </button>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="Custom %"
                  value={taxRate !== 0.125 && taxRate !== 0.26 ? (taxRate * 100).toFixed(1) : ''}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) setTaxRate(val / 100);
                  }}
                  className="w-full py-1.5 px-2 rounded-lg border border-slate-200 text-[11px] font-mono font-bold text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Campi specifici per Obbligazioni / BTP */}
          {isBond && (
            <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
              <div className="font-bold text-indigo-900 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Parametri Cedola Obbligazionaria</span>
                </div>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                  BTP & Whitelist
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Cedola Annua (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={(annualCouponRate * 100).toFixed(2)}
                    onChange={e => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) setAnnualCouponRate(val / 100);
                    }}
                    placeholder="es. 4.35"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Frequenza Cedola
                  </label>
                  <select
                    value={couponFrequency}
                    onChange={e => setCouponFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="SEMI_ANNUAL">Semestrale (2 cedole/anno - Standard BTP)</option>
                    <option value="ANNUAL">Annuale (1 cedola/anno)</option>
                    <option value="QUARTERLY">Trimestrale (4 cedole/anno)</option>
                    <option value="MONTHLY">Mensile (12 cedole/anno)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Data Scadenza
                  </label>
                  <input
                    type="date"
                    value={maturityDate}
                    onChange={e => setMaturityDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Anteprima stacco cedolare */}
              <div className="p-2 rounded-lg bg-white border border-indigo-100/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-600">
                  Stacco stimato per periodo ({couponFrequency === 'SEMI_ANNUAL' ? 'ogni 6 mesi' : couponFrequency === 'QUARTERLY' ? 'ogni 3 mesi' : couponFrequency === 'MONTHLY' ? 'ogni mese' : 'annuale'}):
                </span>
                <span className="font-mono font-bold text-indigo-700">
                  €{(
                    ((asset.nominalValue || asset.quantity * (asset.currentPrice > 10 ? asset.currentPrice : 100)) *
                      annualCouponRate *
                      (couponFrequency === 'SEMI_ANNUAL' ? 0.5 : couponFrequency === 'QUARTERLY' ? 0.25 : couponFrequency === 'MONTHLY' ? 1 / 12 : 1) *
                      (1 - taxRate))
                  ).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">netto</span>
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Salva Modifiche</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
