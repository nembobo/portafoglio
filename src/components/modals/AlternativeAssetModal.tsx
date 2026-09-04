import React, { useState, useEffect } from 'react';
import {
  X,
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
  Calendar,
  Euro,
  User,
  Info,
  CheckCircle2,
  Trash2,
  Sparkles
} from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import {
  AlternativeAsset,
  AlternativeCategory,
  WatchSetType,
  WatchWarrantyType,
  WatchCondition
} from '../../types';
import { formatCurrency } from '../../utils/financialEngine';

interface AlternativeAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetToEdit?: AlternativeAsset | null;
}

const LUXURY_WATCH_BRANDS = [
  'Rolex',
  'Patek Philippe',
  'Audemars Piguet',
  'Omega',
  'Cartier',
  'Tudor',
  'IWC Schaffhausen',
  'Jaeger-LeCoultre',
  'Vacheron Constantin',
  'Breitling',
  'Panerai',
  'Zenith',
  'Tag Heuer',
  'Hublot',
  'A. Lange & Söhne',
  'Altro'
];

const GOLD_PURITIES = [
  { value: '24K (999.9)', label: '24 Carati (999.9‰) - Oro Puro da Investimento' },
  { value: '22K (916)', label: '22 Carati (916‰) - Monete Storiche (Krugerrand, Sterlina)' },
  { value: '18K (750)', label: '18 Carati (750‰) - Oreficeria Italiana' },
  { value: '14K (585)', label: '14 Carati (585‰)' },
  { value: 'Argento 999', label: 'Argento Puro (999‰)' },
  { value: 'Platino 950', label: 'Platino Puro (950‰)' }
];

export const AlternativeAssetModal: React.FC<AlternativeAssetModalProps> = ({
  isOpen,
  onClose,
  assetToEdit
}) => {
  const { addAlternative, updateAlternative, deleteAlternative, familyMembers, selectedOwnerId } = useWealth();

  const isEdit = !!assetToEdit;

  // Base Form State
  const [category, setCategory] = useState<AlternativeCategory>('OROLOGIO');
  const [name, setName] = useState('');
  const [purchaseValue, setPurchaseValue] = useState<number | ''>(10000);
  const [currentValue, setCurrentValue] = useState<number | ''>(12500);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [ownerId, setOwnerId] = useState('mem-1');
  const [location, setLocation] = useState('Cassetta di sicurezza');
  const [hasDocuments, setHasDocuments] = useState(true);
  const [isInsured, setIsInsured] = useState(true);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  // Watch Specific
  const [watchBrand, setWatchBrand] = useState('Rolex');
  const [watchModel, setWatchModel] = useState('Submariner Date');
  const [watchReference, setWatchReference] = useState('126610LN');
  const [watchYear, setWatchYear] = useState<number | ''>(2023);
  const [watchSet, setWatchSet] = useState<WatchSetType>('FULL_SET');
  const [watchWarrantyType, setWatchWarrantyType] = useState<WatchWarrantyType>('CARD_ELETTRONICA');
  const [watchCondition, setWatchCondition] = useState<WatchCondition>('OTTIMO_PARI_AL_NUOVO');
  const [watchMaterial, setWatchMaterial] = useState('Acciaio Oystersteel');
  const [watchSerial, setWatchSerial] = useState('');

  // Gold Specific
  const [goldGrams, setGoldGrams] = useState<number | ''>(100);
  const [goldCarats, setGoldCarats] = useState('24K (999.9)');
  const [goldType, setGoldType] = useState<'LINGOTTO' | 'MONETA' | 'GIOIELLO' | 'ALTRO'>('LINGOTTO');
  const [goldRefinery, setGoldRefinery] = useState('Argor-Heraeus');
  const [goldSerial, setGoldSerial] = useState('');

  // Art Specific
  const [artArtist, setArtArtist] = useState('');
  const [artTitle, setArtTitle] = useState('');
  const [artYear, setArtYear] = useState<number | ''>('');
  const [artTechnique, setArtTechnique] = useState('Olio su tela');
  const [artDimensions, setArtDimensions] = useState('');
  const [artCertificate, setArtCertificate] = useState('Archivio Ufficiale dell\'Artista');

  // Car Specific
  const [carBrandModel, setCarBrandModel] = useState('');
  const [carYear, setCarYear] = useState<number | ''>('');
  const [carVinPlate, setCarVinPlate] = useState('');
  const [carMileage, setCarMileage] = useState<number | ''>('');
  const [carCertification, setCarCertification] = useState('ASI Targa Oro');
  const [carCondition, setCarCondition] = useState('Conservata originale');

  // Wine Specific
  const [wineProducer, setWineProducer] = useState('');
  const [wineVintage, setWineVintage] = useState('');
  const [wineBottleSize, setWineBottleSize] = useState('0.75L');
  const [wineQuantity, setWineQuantity] = useState<number | ''>(6);
  const [wineStorageCondition, setWineStorageCondition] = useState('Cantina climatizzata termocontrollata');

  // Jewelry Specific
  const [jewelryGemType, setJewelryGemType] = useState('Diamante');
  const [jewelryCarats, setJewelryCarats] = useState<number | ''>(1.5);
  const [jewelryCertificate, setJewelryCertificate] = useState('GIA (Gemological Institute of America)');
  const [jewelryMetal, setJewelryMetal] = useState('Oro Bianco 18k');

  // Load Edit Data
  useEffect(() => {
    if (assetToEdit) {
      setCategory(assetToEdit.category);
      setName(assetToEdit.name);
      setPurchaseValue(assetToEdit.purchaseValue);
      setCurrentValue(assetToEdit.currentValue);
      setPurchaseDate(assetToEdit.purchaseDate || new Date().toISOString().split('T')[0]);
      setOwnerId(assetToEdit.ownerId || (familyMembers[0]?.id || 'mem-1'));
      setLocation(assetToEdit.location || '');
      setHasDocuments(assetToEdit.hasDocuments ?? true);
      setIsInsured(assetToEdit.isInsured ?? false);
      setDescription(assetToEdit.description || '');
      setNotes(assetToEdit.notes || '');

      // Watch
      if (assetToEdit.watchBrand) setWatchBrand(assetToEdit.watchBrand);
      if (assetToEdit.watchModel) setWatchModel(assetToEdit.watchModel);
      if (assetToEdit.watchReference) setWatchReference(assetToEdit.watchReference);
      if (assetToEdit.watchYear) setWatchYear(Number(assetToEdit.watchYear));
      if (assetToEdit.watchSet) setWatchSet(assetToEdit.watchSet);
      if (assetToEdit.watchWarrantyType) setWatchWarrantyType(assetToEdit.watchWarrantyType);
      if (assetToEdit.watchCondition) setWatchCondition(assetToEdit.watchCondition);
      if (assetToEdit.watchMaterial) setWatchMaterial(assetToEdit.watchMaterial);
      if (assetToEdit.watchSerial) setWatchSerial(assetToEdit.watchSerial);

      // Gold
      if (assetToEdit.goldGrams) setGoldGrams(assetToEdit.goldGrams);
      if (assetToEdit.goldCarats) setGoldCarats(assetToEdit.goldCarats);
      if (assetToEdit.goldType) setGoldType(assetToEdit.goldType);
      if (assetToEdit.goldRefinery) setGoldRefinery(assetToEdit.goldRefinery);
      if (assetToEdit.goldSerial) setGoldSerial(assetToEdit.goldSerial);

      // Art
      if (assetToEdit.artArtist) setArtArtist(assetToEdit.artArtist);
      if (assetToEdit.artTitle) setArtTitle(assetToEdit.artTitle);
      if (assetToEdit.artYear) setArtYear(Number(assetToEdit.artYear));
      if (assetToEdit.artTechnique) setArtTechnique(assetToEdit.artTechnique);
      if (assetToEdit.artDimensions) setArtDimensions(assetToEdit.artDimensions);
      if (assetToEdit.artCertificate) setArtCertificate(assetToEdit.artCertificate);

      // Car
      if (assetToEdit.carBrandModel) setCarBrandModel(assetToEdit.carBrandModel);
      if (assetToEdit.carYear) setCarYear(Number(assetToEdit.carYear));
      if (assetToEdit.carVinPlate) setCarVinPlate(assetToEdit.carVinPlate);
      if (assetToEdit.carMileage) setCarMileage(assetToEdit.carMileage);
      if (assetToEdit.carCertification) setCarCertification(assetToEdit.carCertification);
      if (assetToEdit.carCondition) setCarCondition(assetToEdit.carCondition);

      // Wine
      if (assetToEdit.wineProducer) setWineProducer(assetToEdit.wineProducer);
      if (assetToEdit.wineVintage) setWineVintage(assetToEdit.wineVintage);
      if (assetToEdit.wineBottleSize) setWineBottleSize(assetToEdit.wineBottleSize);
      if (assetToEdit.wineQuantity) setWineQuantity(assetToEdit.wineQuantity);
      if (assetToEdit.wineStorageCondition) setWineStorageCondition(assetToEdit.wineStorageCondition);

      // Jewelry
      if (assetToEdit.jewelryGemType) setJewelryGemType(assetToEdit.jewelryGemType);
      if (assetToEdit.jewelryCarats) setJewelryCarats(assetToEdit.jewelryCarats);
      if (assetToEdit.jewelryCertificate) setJewelryCertificate(assetToEdit.jewelryCertificate);
      if (assetToEdit.jewelryMetal) setJewelryMetal(assetToEdit.jewelryMetal);
    } else {
      // Default creation state
      const defaultOwner = selectedOwnerId !== 'mem-all' ? selectedOwnerId : (familyMembers[0]?.id || 'mem-1');
      setOwnerId(defaultOwner);
      setName('');
      setPurchaseValue(10000);
      setCurrentValue(12000);
      setPurchaseDate(new Date().toISOString().split('T')[0]);
      setLocation('Cassetta di sicurezza');
      setDescription('');
      setNotes('');
    }
  }, [assetToEdit, isOpen, selectedOwnerId, familyMembers]);

  // Auto-generate title if empty
  const handleAutoTitle = () => {
    if (category === 'OROLOGIO') {
      setName(`${watchBrand} ${watchModel} ${watchReference}`.trim());
    } else if (category === 'ORO_FISICO') {
      setName(`Oro Fisico ${goldType === 'LINGOTTO' ? 'Lingotto' : goldType === 'MONETA' ? 'Moneta' : 'Oro'} ${goldGrams}g ${goldCarats}`);
    } else if (category === 'OPERA_ARTE') {
      setName(artArtist && artTitle ? `${artArtist} - "${artTitle}"` : (artArtist || artTitle || 'Opera d\'Arte'));
    } else if (category === 'AUTO_COLLEZIONE') {
      setName(carBrandModel ? `${carBrandModel} (${carYear || 'Epoca'})` : 'Auto da Collezione');
    } else if (category === 'VINO_DISTILLATI') {
      setName(wineProducer ? `${wineProducer} ${wineVintage || ''} (${wineQuantity || 1}x)` : 'Vino Pregiato');
    } else if (category === 'GIOIELLO') {
      setName(jewelryGemType ? `Anello/Gioiello con ${jewelryGemType} ${jewelryCarats ? jewelryCarats + 'ct' : ''}` : 'Gioiello');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalName = name.trim() || (
      category === 'OROLOGIO'
        ? `${watchBrand} ${watchModel} ${watchReference}`.trim()
        : category === 'ORO_FISICO'
        ? `Oro Fisico ${goldGrams}g ${goldCarats}`
        : 'Asset Alternativo'
    );

    const assetData: Omit<AlternativeAsset, 'id'> = {
      name: finalName,
      category,
      purchaseValue: Number(purchaseValue) || 0,
      currentValue: Number(currentValue) || 0,
      purchaseDate,
      ownerId,
      ownershipPercentage: 100,
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      hasDocuments,
      isInsured,
      notes: notes.trim() || undefined,

      // Specifics
      ...(category === 'OROLOGIO' && {
        watchBrand: watchBrand.trim(),
        watchModel: watchModel.trim(),
        watchReference: watchReference.trim(),
        watchYear: watchYear ? Number(watchYear) : undefined,
        watchSet,
        watchWarrantyType,
        watchCondition,
        watchMaterial: watchMaterial.trim(),
        watchSerial: watchSerial.trim() || undefined
      }),
      ...(category === 'ORO_FISICO' && {
        goldGrams: goldGrams ? Number(goldGrams) : undefined,
        goldCarats,
        goldType,
        goldRefinery: goldRefinery.trim(),
        goldSerial: goldSerial.trim() || undefined
      }),
      ...(category === 'OPERA_ARTE' && {
        artArtist: artArtist.trim(),
        artTitle: artTitle.trim(),
        artYear: artYear ? Number(artYear) : undefined,
        artTechnique: artTechnique.trim(),
        artDimensions: artDimensions.trim(),
        artCertificate: artCertificate.trim()
      }),
      ...(category === 'AUTO_COLLEZIONE' && {
        carBrandModel: carBrandModel.trim(),
        carYear: carYear ? Number(carYear) : undefined,
        carVinPlate: carVinPlate.trim(),
        carMileage: carMileage ? Number(carMileage) : undefined,
        carCertification: carCertification.trim(),
        carCondition: carCondition.trim()
      }),
      ...(category === 'VINO_DISTILLATI' && {
        wineProducer: wineProducer.trim(),
        wineVintage: wineVintage.trim(),
        wineBottleSize: wineBottleSize.trim(),
        wineQuantity: wineQuantity ? Number(wineQuantity) : 1,
        wineStorageCondition: wineStorageCondition.trim()
      }),
      ...(category === 'GIOIELLO' && {
        jewelryGemType: jewelryGemType.trim(),
        jewelryCarats: jewelryCarats ? Number(jewelryCarats) : undefined,
        jewelryCertificate: jewelryCertificate.trim(),
        jewelryMetal: jewelryMetal.trim()
      })
    };

    if (isEdit && assetToEdit) {
      updateAlternative(assetToEdit.id, assetData);
    } else {
      addAlternative(assetData);
    }

    onClose();
  };

  const handleDelete = () => {
    if (assetToEdit && confirm(`Sei sicuro di voler eliminare l'asset "${assetToEdit.name}"?`)) {
      deleteAlternative(assetToEdit.id);
      onClose();
    }
  };

  const cost = Number(purchaseValue) || 0;
  const val = Number(currentValue) || 0;
  const gain = val - cost;
  const gainPercent = cost > 0 ? (gain / cost) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              {category === 'OROLOGIO' && <Watch className="w-5 h-5" />}
              {category === 'ORO_FISICO' && <Coins className="w-5 h-5" />}
              {category === 'OPERA_ARTE' && <Palette className="w-5 h-5" />}
              {category === 'AUTO_COLLEZIONE' && <Car className="w-5 h-5" />}
              {category === 'VINO_DISTILLATI' && <Wine className="w-5 h-5" />}
              {category === 'GIOIELLO' && <Gem className="w-5 h-5" />}
              {category === 'COLLEZIONABILE' && <Package className="w-5 h-5" />}
              {category === 'ALTRO' && <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                {isEdit ? 'Modifica Asset Alternativo' : 'Nuovo Asset da Collezione / Beni Rifugio'}
              </h2>
              <p className="text-xs text-slate-500">
                Orologi di lusso, metalli preziosi, perizie, corredo e rivalutazione
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Category Selector Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Tipologia Prodotto
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setCategory('OROLOGIO')}
                className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold border transition-all text-left ${
                  category === 'OROLOGIO'
                    ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Watch className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Orologio Lusso</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('ORO_FISICO')}
                className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold border transition-all text-left ${
                  category === 'ORO_FISICO'
                    ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Coins className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Oro & Metalli</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('OPERA_ARTE')}
                className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold border transition-all text-left ${
                  category === 'OPERA_ARTE'
                    ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Palette className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Arte & Quadri</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('AUTO_COLLEZIONE')}
                className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold border transition-all text-left ${
                  category === 'AUTO_COLLEZIONE'
                    ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Car className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Auto Epoca</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('VINO_DISTILLATI')}
                className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold border transition-all text-left ${
                  category === 'VINO_DISTILLATI'
                    ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Wine className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Vini Pregiati</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('GIOIELLO')}
                className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold border transition-all text-left ${
                  category === 'GIOIELLO'
                    ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Gem className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Gioielli & Gemme</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('COLLEZIONABILE')}
                className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold border transition-all text-left ${
                  category === 'COLLEZIONABILE'
                    ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Package className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Collezionabile</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('ALTRO')}
                className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold border transition-all text-left ${
                  category === 'ALTRO'
                    ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Altro Rifugio</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC SECTION BASED ON CATEGORY */}

          {/* 1. LUXURY WATCH SECTION */}
          {category === 'OROLOGIO' && (
            <div className="bg-amber-50/40 rounded-2xl p-5 border border-amber-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <Watch className="w-4 h-4 text-amber-700" />
                  Specifiche Orologio di Alta Manifattura
                </span>
                <button
                  type="button"
                  onClick={handleAutoTitle}
                  className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 underline cursor-pointer"
                >
                  Genera Titolo Automatico
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Brand / Manifattura</label>
                  <select
                    value={watchBrand}
                    onChange={e => setWatchBrand(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {LUXURY_WATCH_BRANDS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Modello</label>
                  <input
                    type="text"
                    value={watchModel}
                    onChange={e => setWatchModel(e.target.value)}
                    placeholder="es. Submariner Date, Daytona, Royal Oak"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Referenza (Ref.)</label>
                  <input
                    type="text"
                    value={watchReference}
                    onChange={e => setWatchReference(e.target.value)}
                    placeholder="es. 126610LN, 116500LN"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Anno Produzione / Garanzia</label>
                  <input
                    type="number"
                    value={watchYear}
                    onChange={e => setWatchYear(e.target.value ? Number(e.target.value) : '')}
                    placeholder="es. 2023"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Corredo / Dotazione</label>
                  <select
                    value={watchSet}
                    onChange={e => setWatchSet(e.target.value as WatchSetType)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="FULL_SET">Full Set (Scatola + Garanzia + Tag + Manuali)</option>
                    <option value="SCATOLA_GARANZIA">Scatola e Garanzia</option>
                    <option value="SOLO_OROLOGIO">Solo Orologio</option>
                    <option value="SOLO_GARANZIA">Solo Garanzia Originale</option>
                    <option value="SOLO_SCATOLA">Solo Scatola</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tipologia Garanzia</label>
                  <select
                    value={watchWarrantyType}
                    onChange={e => setWatchWarrantyType(e.target.value as WatchWarrantyType)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="CARD_ELETTRONICA">Card Elettronica Ufficiale (NFC)</option>
                    <option value="CARTACEA_UFFICIALE">Garanzia Cartacea Originale</option>
                    <option value="ESTRATTO_ARCHIVIO">Estratto di Archivio Manifattura</option>
                    <option value="SCADUTA">Garanzia Originale Scaduta</option>
                    <option value="RIVENDITORE_TERZO">Garanzia Commerciante / Terzo</option>
                    <option value="NESSUNA">Nessuna Garanzia</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Condizioni / Stato</label>
                  <select
                    value={watchCondition}
                    onChange={e => setWatchCondition(e.target.value as WatchCondition)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="NUOVO_MAI_INDOSSATO">Nuovo con Pellicole / Mai Indossato</option>
                    <option value="OTTIMO_PARI_AL_NUOVO">Ottimo / Pari al Nuovo (No graffi)</option>
                    <option value="BUONO_USATO">Buono Stato d'Uso (Segni lievi)</option>
                    <option value="REVISIONATO">Revisionato di recente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Materiale Cassa / Bracciale</label>
                  <input
                    type="text"
                    value={watchMaterial}
                    onChange={e => setWatchMaterial(e.target.value)}
                    placeholder="es. Acciaio Oystersteel, Oro Giallo 18k, Platino"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Seriale Cassa (Opzionale/Riservato)</label>
                  <input
                    type="text"
                    value={watchSerial}
                    onChange={e => setWatchSerial(e.target.value)}
                    placeholder="es. 8X39A421"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. GOLD & PRECIOUS METALS SECTION */}
          {category === 'ORO_FISICO' && (
            <div className="bg-amber-50/40 rounded-2xl p-5 border border-amber-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-700" />
                  Dettagli Oro Fisico & Metalli da Investimento
                </span>
                <button
                  type="button"
                  onClick={handleAutoTitle}
                  className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 underline cursor-pointer"
                >
                  Genera Titolo Automatico
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tipologia</label>
                  <select
                    value={goldType}
                    onChange={e => setGoldType(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="LINGOTTO">Lingotto Certificato Good Delivery</option>
                    <option value="MONETA">Moneta da Investimento (Bullion)</option>
                    <option value="GIOIELLO">Monile / Oreficeria da Fusione</option>
                    <option value="ALTRO">Granuli / Altro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Peso / Grammatura (g)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={goldGrams}
                    onChange={e => setGoldGrams(e.target.value ? Number(e.target.value) : '')}
                    placeholder="es. 100 (o 31.10 per 1 oncia)"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Caratura & Purezza</label>
                  <select
                    value={goldCarats}
                    onChange={e => setGoldCarats(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {GOLD_PURITIES.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Raffineria / Zecca Coniatrice</label>
                  <input
                    type="text"
                    value={goldRefinery}
                    onChange={e => setGoldRefinery(e.target.value)}
                    placeholder="es. Argor-Heraeus, Valcambi, Krugerrand, Umicore, Degussa"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Numero Seriale Sigillo / Blister</label>
                  <input
                    type="text"
                    value={goldSerial}
                    onChange={e => setGoldSerial(e.target.value)}
                    placeholder="es. AH-89472910"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. ART SECTION */}
          {category === 'OPERA_ARTE' && (
            <div className="bg-amber-50/40 rounded-2xl p-5 border border-amber-200/80 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-amber-700" />
                Dati Opera d'Arte & Collezione
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Artista / Autore</label>
                  <input
                    type="text"
                    value={artArtist}
                    onChange={e => setArtArtist(e.target.value)}
                    placeholder="es. Lucio Fontana, Giorgio De Chirico"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Titolo dell'Opera</label>
                  <input
                    type="text"
                    value={artTitle}
                    onChange={e => setArtTitle(e.target.value)}
                    placeholder="es. Concetto Spaziale"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Anno Creazione</label>
                  <input
                    type="number"
                    value={artYear}
                    onChange={e => setArtYear(e.target.value ? Number(e.target.value) : '')}
                    placeholder="es. 1965"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tecnica</label>
                  <input
                    type="text"
                    value={artTechnique}
                    onChange={e => setArtTechnique(e.target.value)}
                    placeholder="es. Olio su tela, Idropittura, Scultura bronzo"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Dimensioni</label>
                  <input
                    type="text"
                    value={artDimensions}
                    onChange={e => setArtDimensions(e.target.value)}
                    placeholder="es. 100 x 80 cm"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Certificato Autenticità & Archivio</label>
                  <input
                    type="text"
                    value={artCertificate}
                    onChange={e => setArtCertificate(e.target.value)}
                    placeholder="es. Archivio Fondazione Lucio Fontana N° 1234/A"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. CLASSIC CARS SECTION */}
          {category === 'AUTO_COLLEZIONE' && (
            <div className="bg-amber-50/40 rounded-2xl p-5 border border-amber-200/80 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-amber-700" />
                Dati Auto d'Epoca & Supercar
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Marca e Modello</label>
                  <input
                    type="text"
                    value={carBrandModel}
                    onChange={e => setCarBrandModel(e.target.value)}
                    placeholder="es. Porsche 911 3.2 Carrera, Ferrari Testarossa"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Anno Immatricolazione</label>
                  <input
                    type="number"
                    value={carYear}
                    onChange={e => setCarYear(e.target.value ? Number(e.target.value) : '')}
                    placeholder="es. 1987"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Targa o Telaio (VIN)</label>
                  <input
                    type="text"
                    value={carVinPlate}
                    onChange={e => setCarVinPlate(e.target.value)}
                    placeholder="es. MI 89472A / WP0ZZZ91Z..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Chilometraggio (km)</label>
                  <input
                    type="number"
                    value={carMileage}
                    onChange={e => setCarMileage(e.target.value ? Number(e.target.value) : '')}
                    placeholder="es. 68000"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Certificazione Storica</label>
                  <input
                    type="text"
                    value={carCertification}
                    onChange={e => setCarCertification(e.target.value)}
                    placeholder="es. ASI Targa Oro, FIVA, Registro Storico"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Condizioni</label>
                  <input
                    type="text"
                    value={carCondition}
                    onChange={e => setCarCondition(e.target.value)}
                    placeholder="es. Conservata originale, Matching Numbers"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. WINE SECTION */}
          {category === 'VINO_DISTILLATI' && (
            <div className="bg-amber-50/40 rounded-2xl p-5 border border-amber-200/80 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Wine className="w-4 h-4 text-amber-700" />
                Dati Vini Pregiati & Distillati
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cantina / Produttore</label>
                  <input
                    type="text"
                    value={wineProducer}
                    onChange={e => setWineProducer(e.target.value)}
                    placeholder="es. Tenuta San Guido (Sassicaia), Masseto, DRC"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Annata</label>
                  <input
                    type="text"
                    value={wineVintage}
                    onChange={e => setWineVintage(e.target.value)}
                    placeholder="es. 2016, 2019"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Quantità Bottiglie</label>
                  <input
                    type="number"
                    value={wineQuantity}
                    onChange={e => setWineQuantity(e.target.value ? Number(e.target.value) : '')}
                    placeholder="es. 6 (Cassa OWC)"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Formato</label>
                  <input
                    type="text"
                    value={wineBottleSize}
                    onChange={e => setWineBottleSize(e.target.value)}
                    placeholder="es. 0.75L, Magnum 1.5L, Cassa Legno OWC"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Conservazione</label>
                  <input
                    type="text"
                    value={wineStorageCondition}
                    onChange={e => setWineStorageCondition(e.target.value)}
                    placeholder="es. Cantina climatizzata termocontrollata 14°C, 70% umidità"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 6. JEWELRY SECTION */}
          {category === 'GIOIELLO' && (
            <div className="bg-amber-50/40 rounded-2xl p-5 border border-amber-200/80 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Gem className="w-4 h-4 text-amber-700" />
                Dati Gioielli, Diamanti & Gemme
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Pietra Principale / Gioiello</label>
                  <input
                    type="text"
                    value={jewelryGemType}
                    onChange={e => setJewelryGemType(e.target.value)}
                    placeholder="es. Solitario Diamante, Smeraldo Colombia, Zaffiro"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Caratura Pietra (ct)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={jewelryCarats}
                    onChange={e => setJewelryCarats(e.target.value ? Number(e.target.value) : '')}
                    placeholder="es. 1.50 ct"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Certificato Gemmologico</label>
                  <input
                    type="text"
                    value={jewelryCertificate}
                    onChange={e => setJewelryCertificate(e.target.value)}
                    placeholder="es. GIA, HRD Anversa, IGI"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* NAME / TITLE OF ASSET */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Denominazione / Titolo Descrittivo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="es. Rolex Submariner Date 126610LN"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* FINANCIALS: PURCHASE VALUE, CURRENT VALUE, DATE, GAIN */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Euro className="w-4 h-4 text-emerald-600" />
              Valutazione Economica & Performance
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Prezzo Pagato / Costo Acquisto (€)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={purchaseValue}
                  onChange={e => setPurchaseValue(e.target.value ? Number(e.target.value) : '')}
                  placeholder="es. 10000"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Valore Attuale Stimato (€)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={currentValue}
                  onChange={e => setCurrentValue(e.target.value ? Number(e.target.value) : '')}
                  placeholder="es. 14500"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Data Acquisto
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={e => setPurchaseDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Gain/Loss summary banner */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 text-xs font-mono">
              <span className="text-slate-500 font-sans font-medium">Plusvalenza / Rivalutazione Storica:</span>
              <span className={`font-bold ${gain >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {gain >= 0 ? '+' : ''}{formatCurrency(gain)} ({gainPercent.toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* OWNER, LOCATION & SECURITY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Intestatario / Titolare
              </label>
              <select
                value={ownerId}
                onChange={e => setOwnerId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {familyMembers.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Luogo di Custodia
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="es. Cassetta di sicurezza Intesa, Caveau Prosegur, Casa"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* CHECKBOXES: DOCUMENTS & INSURANCE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={hasDocuments}
                onChange={e => setHasDocuments(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
              />
              <div className="text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  Documenti & Certificati Presenti
                </div>
                <div className="text-slate-500 text-[11px]">Garanzie, perizie giurate e certificati di autenticità</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={isInsured}
                onChange={e => setIsInsured(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500"
              />
              <div className="text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Copertura Assicurativa Attiva
                </div>
                <div className="text-slate-500 text-[11px]">Polizza all-risk / furto e rapina dedicata</div>
              </div>
            </label>
          </div>

          {/* DESCRIPTION & NOTES */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Note & Dettagli Aggiuntivi
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Aggiungi dettagli storici, provenienza, informazioni su revisioni o fatture..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-normal text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            {isEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Elimina Asset</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all active:scale-95"
              >
                {isEdit ? 'Salva Modifiche' : 'Aggiungi al Patrimonio'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
