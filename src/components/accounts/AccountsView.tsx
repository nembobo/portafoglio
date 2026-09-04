import React from 'react';
import { Wallet, Landmark, ArrowUpRight, Plus, ShieldCheck } from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { formatCurrency } from '../../utils/financialEngine';

export const AccountsView: React.FC = () => {
  const { filteredAccounts, financialPortfolioValue, grossWealth } = useWealth();

  const totalCash = filteredAccounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Conti Correnti, Depositi & Broker
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Mappatura degli istituti bancari, saldi liquidi e conti di regolamento per cedole e affitti.
          </p>
        </div>

        <div className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100">
          Liquidità Totale: <span className="font-extrabold">{formatCurrency(totalCash)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredAccounts.map(account => (
          <div
            key={account.id}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {account.type.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Attivo
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">{account.name}</h3>
              <div className="text-xs text-slate-500 mt-0.5">{account.institution}</div>

              {account.iban && (
                <div className="mt-3 p-2.5 bg-slate-50 rounded-xl text-[11px] font-mono text-slate-600 break-all border border-slate-200">
                  {account.iban}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="text-[9px] text-slate-400 uppercase font-bold font-sans tracking-wider">Saldo Disponibile</div>
              <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
                {formatCurrency(account.balance, account.currency)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
