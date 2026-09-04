import React, { useState } from 'react';
import {
  Watch,
  Coins,
  Palette,
  Car,
  Wine,
  Gem,
  Package,
  ShieldCheck,
  FileText,
  Lock,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Info,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { AlternativeAsset, AlternativeCategory } from '../../types';
import { formatCurrency } from '../../utils/financialEngine';
import { AlternativeAssetModal } from '../modals/AlternativeAssetModal';

export const AlternativeAssetsView: React.FC = () => {
  const { filteredAlternatives, deleteAlternative, familyMembers } = useWealth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssetForEdit, setSelectedAssetForEdit] = useState<AlternativeAsset | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');

  const totalValue = filteredAlternatives.reduce((sum, a) => sum + a.currentValue, 0);
  const totalCost = filteredAlternatives.reduce((sum, a) => sum + a.purchaseValue, 0);
  const totalGain = totalValue - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  // Filter items
  const displayedItems = filteredAlternatives.filter(alt => {
    if (activeCategoryFilter === 'ALL') return true;
    return alt.category === activeCategoryFilter;
  });

  const handleOpenAdd = () => {
    setSelectedAssetForEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (asset: AlternativeAsset) => {
    setSelectedAssetForEdit(asset);
    setIsModalOpen(true);
  };

  const handleDelete = (asset: AlternativeAsset) => {
    if (confirm(`Sei sicuro di voler eliminare "${asset.name}" dal tuo patrimonio?`)) {
      deleteAlternative(asset.id);
    }
  };

  const getCategoryIcon = (category: AlternativeCategory) => {
    switch (category) {
      case 'OROLOGIO':
        return <Watch className="w-4 h-4 text-amber-600" />;
      case 'ORO_FISICO':
        return <Coins className="w-4 h-4 text-amber-600" />;
      case 'OPERA_ARTE':
        return <Palette className="w-4 h-4 text-amber-600" />;
      case 'AUTO_COLLEZIONE':
        return <Car className="w-4 h-4 text-amber-600" />;
      case 'VINO_DISTILLATI':
        return <Wine className="w-4 h-4 text-amber-600" />;
      case 'GIOIELLO':
        return <Gem className="w-4 h-4 text-amber-600" />;
      default:
        return <Package className="w-4 h-4 text-amber-600" />;
    }
  };

  const getCategoryLabel = (category: AlternativeCategory) => {
    switch (category) {
      case 'OROLOGIO':
        return 'Orologio di Lusso';
      case 'ORO_FISICO':
        return 'Oro & Metalli';
      case 'OPERA_ARTE':
        return 'Opera d\'Arte';
      case 'AUTO_COLLEZIONE':
        return 'Auto d\'Epoca';
      case 'VINO_DISTILLATI':
        return 'Vino & Distillati';
      case 'GIOIELLO':
        return 'Gioiello & Diamante';
      default:
        return 'Collezionabile';
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Asset Alternativi & Beni da Collezione
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestione dettagliata di orologi di lusso (corredo, garanzie), oro fisico (grammature, carati), perizie e beni rifugio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-200 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Aggiungi Prodotto</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Valore Attuale Stimato
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
            {formatCurrency(totalValue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {filteredAlternatives.length} beni registrati
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Capitale Investito (Costo)
          </div>
          <div className="text-2xl font-extrabold text-slate-700 mt-1 font-mono">
            {formatCurrency(totalCost)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Prezzo totale di acquisto
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Rivalutazione Storica
          </div>
          <div className={`text-2xl font-extrabold mt-1 font-mono flex items-center gap-1.5 ${
            totalGain >= 0 ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            {totalGain >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            <span>{totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain)}</span>
          </div>
          <div className="text-[11px] font-bold font-mono text-emerald-600 mt-1">
            {totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(1)}% rispetto al costo
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveCategoryFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeCategoryFilter === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Tutti ({filteredAlternatives.length})
        </button>
        <button
          onClick={() => setActiveCategoryFilter('OROLOGIO')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeCategoryFilter === 'OROLOGIO'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Watch className="w-3.5 h-3.5" />
          <span>Orologi</span>
        </button>
        <button
          onClick={() => setActiveCategoryFilter('ORO_FISICO')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeCategoryFilter === 'ORO_FISICO'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Oro & Metalli</span>
        </button>
        <button
          onClick={() => setActiveCategoryFilter('OPERA_ARTE')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeCategoryFilter === 'OPERA_ARTE'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Arte</span>
        </button>
        <button
          onClick={() => setActiveCategoryFilter('AUTO_COLLEZIONE')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeCategoryFilter === 'AUTO_COLLEZIONE'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>Auto Epoca</span>
        </button>
        <button
          onClick={() => setActiveCategoryFilter('VINO_DISTILLATI')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeCategoryFilter === 'VINO_DISTILLATI'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Wine className="w-3.5 h-3.5" />
          <span>Vini Pregiati</span>
        </button>
        <button
          onClick={() => setActiveCategoryFilter('GIOIELLO')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeCategoryFilter === 'GIOIELLO'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Gem className="w-3.5 h-3.5" />
          <span>Gioielli</span>
        </button>
      </div>

      {/* Grid of Alternative Asset Cards */}
      {displayedItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Nessun asset alternativo registrato
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Aggiungi orologi di alta manifattura con referenza e corredo, lingotti o monete d'oro con caratura e grammi, quadri o beni rifugio.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-200 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Aggiungi il tuo primo Asset Alternativo</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedItems.map(alt => {
            const gain = alt.currentValue - alt.purchaseValue;
            const gainP = alt.purchaseValue > 0 ? (gain / alt.purchaseValue) * 100 : 0;
            const owner = familyMembers.find(m => m.id === alt.ownerId);

            return (
              <div
                key={alt.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-5"
              >
                {/* Top Details */}
                <div className="space-y-3">
                  {/* Category badge & Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/60">
                        {getCategoryIcon(alt.category)}
                        {getCategoryLabel(alt.category)}
                      </span>
                      {owner && (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {owner.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(alt)}
                        title="Modifica"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(alt)}
                        title="Elimina"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">{alt.name}</h3>
                    {alt.description && (
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                        {alt.description}
                      </p>
                    )}
                  </div>

                  {/* Specific Badges / Attributes */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {/* Watch specifics */}
                    {alt.category === 'OROLOGIO' && (
                      <>
                        {alt.watchBrand && (
                          <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {alt.watchBrand}
                          </span>
                        )}
                        {alt.watchReference && (
                          <span className="text-[11px] font-mono font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                            Ref. {alt.watchReference}
                          </span>
                        )}
                        {alt.watchYear && (
                          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                            Anno {alt.watchYear}
                          </span>
                        )}
                        {alt.watchSet && (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            {alt.watchSet === 'FULL_SET'
                              ? 'Full Set Completo'
                              : alt.watchSet === 'SCATOLA_GARANZIA'
                              ? 'Scatola + Garanzia'
                              : alt.watchSet === 'SOLO_OROLOGIO'
                              ? 'Solo Orologio'
                              : alt.watchSet}
                          </span>
                        )}
                        {alt.watchWarrantyType && (
                          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                            {alt.watchWarrantyType === 'CARD_ELETTRONICA'
                              ? 'Card NFC Ufficiale'
                              : alt.watchWarrantyType === 'CARTACEA_UFFICIALE'
                              ? 'Garanzia Cartacea'
                              : alt.watchWarrantyType}
                          </span>
                        )}
                        {alt.watchCondition && (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                            {alt.watchCondition.replace(/_/g, ' ')}
                          </span>
                        )}
                      </>
                    )}

                    {/* Gold specifics */}
                    {alt.category === 'ORO_FISICO' && (
                      <>
                        {alt.goldGrams && (
                          <span className="text-[11px] font-mono font-bold text-amber-900 bg-amber-100/70 px-2.5 py-1 rounded-lg border border-amber-200">
                            Peso: {alt.goldGrams}g
                          </span>
                        )}
                        {alt.goldCarats && (
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg">
                            {alt.goldCarats}
                          </span>
                        )}
                        {alt.goldType && (
                          <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {alt.goldType}
                          </span>
                        )}
                        {alt.goldRefinery && (
                          <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                            Zecca: {alt.goldRefinery}
                          </span>
                        )}
                        {alt.goldSerial && (
                          <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                            S/N: {alt.goldSerial}
                          </span>
                        )}
                      </>
                    )}

                    {/* Art specifics */}
                    {alt.category === 'OPERA_ARTE' && (
                      <>
                        {alt.artArtist && (
                          <span className="text-[11px] font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {alt.artArtist}
                          </span>
                        )}
                        {alt.artTechnique && (
                          <span className="text-[11px] text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {alt.artTechnique}
                          </span>
                        )}
                        {alt.artDimensions && (
                          <span className="text-[11px] text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {alt.artDimensions}
                          </span>
                        )}
                      </>
                    )}

                    {/* Car specifics */}
                    {alt.category === 'AUTO_COLLEZIONE' && (
                      <>
                        {alt.carYear && (
                          <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                            Anno {alt.carYear}
                          </span>
                        )}
                        {alt.carCertification && (
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                            {alt.carCertification}
                          </span>
                        )}
                        {alt.carMileage && (
                          <span className="text-[11px] font-mono text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {alt.carMileage.toLocaleString('it-IT')} km
                          </span>
                        )}
                      </>
                    )}

                    {/* Wine specifics */}
                    {alt.category === 'VINO_DISTILLATI' && (
                      <>
                        {alt.wineProducer && (
                          <span className="text-[11px] font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {alt.wineProducer}
                          </span>
                        )}
                        {alt.wineVintage && (
                          <span className="text-[11px] font-mono text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                            Annata {alt.wineVintage}
                          </span>
                        )}
                        {alt.wineQuantity && (
                          <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
                            {alt.wineQuantity} bottiglie
                          </span>
                        )}
                      </>
                    )}

                    {/* Jewelry specifics */}
                    {alt.category === 'GIOIELLO' && (
                      <>
                        {alt.jewelryGemType && (
                          <span className="text-[11px] font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {alt.jewelryGemType}
                          </span>
                        )}
                        {alt.jewelryCarats && (
                          <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                            {alt.jewelryCarats} ct
                          </span>
                        )}
                        {alt.jewelryCertificate && (
                          <span className="text-[11px] text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {alt.jewelryCertificate}
                          </span>
                        )}
                      </>
                    )}

                    {/* Common Badges */}
                    {alt.location && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                        <Lock className="w-3 h-3 text-slate-400" />
                        {alt.location}
                      </span>
                    )}
                    {alt.hasDocuments && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                        <FileText className="w-3 h-3 text-emerald-600" />
                        Certificato / Full Set
                      </span>
                    )}
                    {alt.isInsured && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/60">
                        <ShieldCheck className="w-3 h-3 text-indigo-600" />
                        Assicurato
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Financial Box */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between font-mono">
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase font-bold font-sans tracking-wider">
                      Prezzo Acquisto
                    </div>
                    <div className="text-xs text-slate-600 font-bold mt-0.5">
                      {formatCurrency(alt.purchaseValue)}
                    </div>
                    {alt.purchaseDate && (
                      <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                        {alt.purchaseDate}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-[9px] text-slate-400 uppercase font-bold font-sans tracking-wider">
                      Valore Stimato & Gain
                    </div>
                    <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                      {formatCurrency(alt.currentValue)}
                    </div>
                    <div className={`text-[11px] font-bold ${gain >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {gain >= 0 ? '+' : ''}{formatCurrency(gain)} ({gainP >= 0 ? '+' : ''}{gainP.toFixed(1)}%)
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Alternative Asset Modal */}
      <AlternativeAssetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        assetToEdit={selectedAssetForEdit}
      />
    </div>
  );
};
