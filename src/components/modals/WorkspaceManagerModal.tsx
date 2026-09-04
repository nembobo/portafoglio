import React, { useState, useRef } from 'react';
import {
  X,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Download,
  Upload,
  UserCheck,
  Lock,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { useWealth } from '../../context/WealthContext';

interface WorkspaceManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInitialWelcome?: boolean;
}

export const WorkspaceManagerModal: React.FC<WorkspaceManagerModalProps> = ({
  isOpen,
  onClose,
  isInitialWelcome = false
}) => {
  const {
    resetToEmpty,
    resetToDemo,
    exportWorkspaceJSON,
    importWorkspaceJSON,
    dismissFirstVisit
  } = useWealth();

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleStartEmpty = () => {
    resetToEmpty();
    dismissFirstVisit();
    onClose();
  };

  const handleLoadDemo = () => {
    resetToDemo();
    dismissFirstVisit();
    onClose();
  };

  const handleExport = () => {
    const jsonStr = exportWorkspaceJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patrimonio-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const content = event.target?.result as string;
        const success = importWorkspaceJSON(content);
        if (success) {
          setImportStatus('Backup ripristinato con successo!');
          setImportError(null);
          setTimeout(() => {
            onClose();
          }, 1000);
        } else {
          setImportError('Il file JSON selezionato non ha un formato valido.');
        }
      } catch (err) {
        setImportError('Errore durante la lettura del file di backup.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-4">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                {isInitialWelcome ? 'Benvenuto in Patrimonio' : 'Gestione Spazio Dati & Privacy'}
              </h2>
              <p className="text-xs text-slate-500">
                Controllo del tuo spazio di lavoro, isolamento e backup
              </p>
            </div>
          </div>
          {!isInitialWelcome && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Privacy & Zero-Knowledge Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                Spazio Privato & Isolato (Local Only)
              </h4>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                Tutti i dati che inserisci vengono salvati <strong>esclusivamente nel tuo browser locale</strong>. Nessun altro utente che accede al sito potrà vedere i tuoi numeri o il tuo patrimonio, e viceversa.
              </p>
            </div>
          </div>

          {/* Quick Choice Buttons */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isInitialWelcome ? 'Come desideri iniziare?' : 'Opzioni Spazio di Lavoro'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Start Empty */}
              <button
                type="button"
                onClick={handleStartEmpty}
                className="group relative p-5 rounded-2xl border-2 border-indigo-200 hover:border-indigo-600 bg-indigo-50/30 hover:bg-indigo-50/80 text-left transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold mb-3 shadow-sm group-hover:scale-105 transition-transform">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Inizia da Zero (Portafoglio Vuoto)
                  </h4>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Avvia l'applicazione con saldo 0 €, nessun asset o debito fittizio, pronto per inserire i tuoi dati reali.
                  </p>
                </div>
                <div className="mt-4 text-xs font-bold text-indigo-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Configura Spazio Vuoto →</span>
                </div>
              </button>

              {/* Option 2: Load Demo */}
              <button
                type="button"
                onClick={handleLoadDemo}
                className="group relative p-5 rounded-2xl border border-slate-200 hover:border-slate-400 bg-slate-50 hover:bg-slate-100/80 text-left transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold mb-3 shadow-sm group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Carica Esempio Dimostrativo
                  </h4>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Esplora tutte le funzionalità con un portafoglio familiare di esempio (azioni, BTP, immobili a reddito, orologi).
                  </p>
                </div>
                <div className="mt-4 text-xs font-bold text-slate-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Esplora con Demo →</span>
                </div>
              </button>
            </div>
          </div>

          {/* Backup Export / Import Section */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Salvataggio & Backup Personale
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <span>Esporta Backup (JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
              >
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Ripristina da File JSON</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {importStatus && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {importStatus}
              </div>
            )}

            {importError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                {importError}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {isInitialWelcome && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Puoi cambiare questa scelta o esportare i tuoi dati in qualunque momento dalla barra superiore.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
