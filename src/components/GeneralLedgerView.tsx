import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  ArrowUpDown,
  Filter,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { Account, LedgerAccountActivity, CompanyProfile, AccountType } from '../types/accounting';

interface GeneralLedgerViewProps {
  ledgerActivities: LedgerAccountActivity[];
  company: CompanyProfile;
}

export const GeneralLedgerView: React.FC<GeneralLedgerViewProps> = ({
  ledgerActivities,
  company,
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAccounts, setExpandedAccounts] = useState<Record<string, boolean>>({});

  const currency = company.currencySymbol || '$';

  // Toggle account expansion
  const toggleExpand = (code: string) => {
    setExpandedAccounts((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  // Filter accounts
  const filteredLedgers = useMemo(() => {
    return ledgerActivities.filter((act) => {
      const matchesType = selectedType === 'all' || act.account.type === selectedType;
      const matchesSearch =
        act.account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.account.code.includes(searchTerm);
      return matchesType && matchesSearch;
    });
  }, [ledgerActivities, selectedType, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search account by code or name (e.g. 1020, Bank, Retainer, Payroll)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
        >
          <option value="all">All Classifications</option>
          <option value="ASSET">Assets (1000s)</option>
          <option value="LIABILITY">Liabilities (2000s)</option>
          <option value="EQUITY">Equity (3000s)</option>
          <option value="REVENUE">Revenue (4000s)</option>
          <option value="EXPENSE">Expenses (5000s-7000s)</option>
        </select>
      </div>

      {/* Account Ledgers List */}
      <div className="space-y-4">
        {filteredLedgers.map((act) => {
          const isExpanded = expandedAccounts[act.account.code] ?? true;
          const entryCount = act.entries.length;

          return (
            <div
              key={act.account.code}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs"
            >
              {/* Account Header */}
              <div
                onClick={() => toggleExpand(act.account.code)}
                className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-slate-400">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">
                        {act.account.code}
                      </span>
                      <span className="font-bold text-sm text-slate-900">{act.account.name}</span>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                          act.account.type === 'ASSET'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : act.account.type === 'LIABILITY'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : act.account.type === 'EQUITY'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : act.account.type === 'REVENUE'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {act.account.type}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Normal Balance: {act.account.normalBalance} • {entryCount} Posting{entryCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Ending Running Balance
                  </div>
                  <div className="text-base font-bold font-mono text-slate-900">
                    {currency}{act.endingBalance.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* T-Account Posting Rows */}
              {isExpanded && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Entry Ref</th>
                        <th className="px-4 py-2">Description / Memo</th>
                        <th className="px-4 py-2 text-right">Debit (Dr)</th>
                        <th className="px-4 py-2 text-right">Credit (Cr)</th>
                        <th className="px-4 py-2 text-right">Running Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {act.entries.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-slate-400 font-sans">
                            No ledger postings in this period.
                          </td>
                        </tr>
                      ) : (
                        act.entries.map((entry, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-4 py-2 text-slate-500 whitespace-nowrap">
                              {entry.date}
                            </td>
                            <td className="px-4 py-2 text-indigo-600 font-bold whitespace-nowrap">
                              {entry.entryNumber}
                            </td>
                            <td className="px-4 py-2 text-slate-800 font-sans truncate max-w-xs">
                              {entry.memo}
                            </td>
                            <td className="px-4 py-2 text-right font-bold text-slate-800">
                              {entry.debit > 0 ? `${currency}${entry.debit.toLocaleString()}` : '-'}
                            </td>
                            <td className="px-4 py-2 text-right font-bold text-slate-800">
                              {entry.credit > 0 ? `${currency}${entry.credit.toLocaleString()}` : '-'}
                            </td>
                            <td className="px-4 py-2 text-right font-bold text-indigo-700 bg-slate-50/40">
                              {currency}{entry.runningBalance.toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
