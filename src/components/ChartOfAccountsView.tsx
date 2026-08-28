import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  Plus,
  ArrowUpDown,
  BookOpen,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { Account, CompanyProfile, AccountType } from '../types/accounting';

interface ChartOfAccountsViewProps {
  accounts: Account[];
  company: CompanyProfile;
}

export const ChartOfAccountsView: React.FC<ChartOfAccountsViewProps> = ({
  accounts,
  company,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const currency = company.currencySymbol || '$';

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchesSearch =
        acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.code.includes(searchTerm) ||
        acc.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || acc.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [accounts, searchTerm, typeFilter]);

  return (
    <div className="space-y-6">
      {/* High Density Filter and Search */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search account code, name, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
        >
          <option value="all">All Classifications</option>
          <option value="ASSET">Assets (1000 - 1999)</option>
          <option value="LIABILITY">Liabilities (2000 - 2999)</option>
          <option value="EQUITY">Equity (3000 - 3999)</option>
          <option value="REVENUE">Revenue (4000 - 4999)</option>
          <option value="EXPENSE">Expenses (5000 - 7999)</option>
        </select>
      </div>

      {/* Accounts Master Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Code</th>
                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Title</th>
                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Classification</th>
                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Normal Balance</th>
                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purpose / Description</th>
                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredAccounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-indigo-700 whitespace-nowrap">
                    {acc.code}
                  </td>
                  <td className="px-4 py-2.5 font-sans font-semibold text-slate-900 whitespace-nowrap">
                    {acc.name}
                  </td>
                  <td className="px-4 py-2.5 font-sans whitespace-nowrap">
                    <span
                      className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                        acc.type === 'ASSET'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : acc.type === 'LIABILITY'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : acc.type === 'EQUITY'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : acc.type === 'REVENUE'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {acc.type}
                    </span>
                    <span className="text-[11px] text-slate-500 ml-2">
                      {acc.subCategory}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-sans text-slate-500 whitespace-nowrap">
                    {acc.normalBalance}
                  </td>
                  <td className="px-4 py-2.5 font-sans text-slate-600 max-w-sm truncate">
                    {acc.description}
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-slate-900 whitespace-nowrap">
                    {currency}{acc.currentBalance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
