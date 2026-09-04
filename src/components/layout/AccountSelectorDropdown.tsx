import React, { useState, useRef, useEffect } from 'react';
import {
  Users,
  ChevronDown,
  Check,
  Plus,
  Trash2,
  Building2,
  User,
  Shield,
  X
} from 'lucide-react';
import { useWealth } from '../../context/WealthContext';

export const AccountSelectorDropdown: React.FC = () => {
  const {
    familyMembers,
    selectedOwnerId,
    setSelectedOwnerId,
    addFamilyMember,
    deleteFamilyMember,
    showFamilyConsolidated,
    toggleShowFamilyConsolidated
  } = useWealth();

  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Membro Familiare');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowAddForm(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentMember = familyMembers.find(m => m.id === selectedOwnerId) || (showFamilyConsolidated ? {
    id: 'mem-all',
    name: 'Patrimonio Familiare (Consolidato)',
    role: 'Tutta la Famiglia',
    avatarColor: '#4F46E5'
  } : familyMembers[0] || {
    id: 'mem-1',
    name: 'Membro Principale',
    role: 'Titolare',
    avatarColor: '#4F46E5'
  });

  const handleSelect = (id: string) => {
    setSelectedOwnerId(id);
    setIsOpen(false);
    setShowAddForm(false);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#8B5CF6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const createdId = addFamilyMember({
      name: newName.trim(),
      role: newRole,
      avatarColor: randomColor
    });

    setSelectedOwnerId(createdId);
    setNewName('');
    setShowAddForm(false);
    setIsOpen(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (id === 'mem-all') {
      toggleShowFamilyConsolidated();
      return;
    }
    deleteFamilyMember(id);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        id="family-account-dropdown-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs sm:text-sm pl-2.5 pr-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer shadow-2xs"
      >
        <span className="flex items-center justify-center w-5 h-5 rounded-lg text-xs" style={{ backgroundColor: currentMember.avatarColor ? `${currentMember.avatarColor}20` : '#EEF2FF', color: currentMember.avatarColor || '#4F46E5' }}>
          {currentMember.id === 'mem-all' ? '🏛️' : currentMember.role === 'Holding' ? '🏢' : '👤'}
        </span>
        <span className="truncate max-w-[150px] sm:max-w-[190px] font-bold">
          {currentMember.name}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Filtro Patrimonio & Conti
            </span>
            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {familyMembers.length} Voci
            </span>
          </div>

          {/* Consolidated Family Wealth Option */}
          <div className="p-1.5">
            {showFamilyConsolidated ? (
              <div
                onClick={() => handleSelect('mem-all')}
                className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                  selectedOwnerId === 'mem-all'
                    ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-100'
                    : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm shadow-2xs">
                    🏛️
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Patrimonio Familiare
                    </div>
                    <div className="text-[10px] text-indigo-600 font-medium">
                      Consolidato (Tutti i conti e soggetti)
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {selectedOwnerId === 'mem-all' && (
                    <Check className="w-4 h-4 text-indigo-600" />
                  )}
                  <button
                    type="button"
                    title="Rimuovi / Nascondi voce Patrimonio Familiare"
                    onClick={(e) => handleDelete(e, 'mem-all')}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1 rounded-md transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={toggleShowFamilyConsolidated}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-indigo-600 bg-indigo-50/70 hover:bg-indigo-100 rounded-xl border border-dashed border-indigo-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Aggiungi voce "Patrimonio Familiare"</span>
              </button>
            )}
          </div>

          <div className="px-3.5 pt-2 pb-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-t border-slate-100 mt-1">
            Singoli Conti & Membri
          </div>

          {/* Individual Members List */}
          <div className="max-h-56 overflow-y-auto px-1.5 space-y-0.5">
            {familyMembers
              .filter(m => m.id !== 'mem-all')
              .map(member => (
                <div
                  key={member.id}
                  onClick={() => handleSelect(member.id)}
                  className={`group flex items-center justify-between px-3 py-2 rounded-xl text-left cursor-pointer transition-colors ${
                    selectedOwnerId === member.id
                      ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-100'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ backgroundColor: member.avatarColor || '#6366F1' }}
                    >
                      {member.name.charAt(0)}
                    </span>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {member.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {member.role || 'Membro'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {selectedOwnerId === member.id && (
                      <Check className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                    {/* Remove account button */}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, member.id)}
                      className="p-1 rounded text-slate-300 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Rimuovi conto/soggetto dalla tendina"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Add Account / Subject Form */}
          <div className="pt-2 px-2 border-t border-slate-100 mt-1">
            {!showAddForm ? (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-50 hover:bg-indigo-50 text-indigo-600 font-bold text-xs transition-colors border border-dashed border-slate-200 hover:border-indigo-300"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Aggiungi Conto / Soggetto</span>
              </button>
            ) : (
              <form onSubmit={handleCreate} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-800">Nuovo Conto o Soggetto</span>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Es. Marco Rossi, Trust, Conto Broker..."
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    required
                    autoFocus
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Capofamiglia">Capofamiglia</option>
                    <option value="Coniuge">Coniuge</option>
                    <option value="Figlio / Erede">Figlio / Erede</option>
                    <option value="Holding / Società">Holding / Società</option>
                    <option value="Conto Broker Co-intestato">Conto Broker Co-intestato</option>
                    <option value="Trust / Altro">Trust / Altro</option>
                  </select>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-2.5 py-1 rounded text-[11px] text-slate-600 hover:bg-slate-200"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-xs"
                  >
                    Salva ed Entra
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
