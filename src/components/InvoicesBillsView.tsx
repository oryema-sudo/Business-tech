import React, { useState, useMemo } from 'react';
import {
  FileText,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Search,
} from 'lucide-react';
import { BusinessTransaction, CompanyProfile } from '../types/accounting';

interface InvoicesBillsViewProps {
  transactions: BusinessTransaction[];
  company: CompanyProfile;
  onOpenNewTransactionModal: () => void;
  onSettleTransaction: (txId: string) => void;
}

export const InvoicesBillsView: React.FC<InvoicesBillsViewProps> = ({
  transactions,
  company,
  onOpenNewTransactionModal,
  onSettleTransaction,
}) => {
  const [subTab, setSubTab] = useState<'ar' | 'ap'>('ar');
  const [searchTerm, setSearchTerm] = useState('');

  const currency = company.currencySymbol || '$';

  // Accounts Receivable (Invoices)
  const invoices = useMemo(() => {
    return transactions.filter((t) => t.type === 'invoice');
  }, [transactions]);

  // Accounts Payable (Bills)
  const bills = useMemo(() => {
    return transactions.filter((t) => t.type === 'bill');
  }, [transactions]);

  const activeList = subTab === 'ar' ? invoices : bills;

  const filteredList = useMemo(() => {
    return activeList.filter(
      (item) =>
        item.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeList, searchTerm]);

  return (
    <div className="space-y-6">
      {/* High Density Sub-Tab Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* AR Selector Card */}
        <div
          onClick={() => setSubTab('ar')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            subTab === 'ar'
              ? 'bg-white border-indigo-600 ring-2 ring-indigo-500/20 shadow-2xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <span className="font-bold text-slate-900 text-sm">Accounts Receivable (Invoices)</span>
            </div>
            <span className="text-xs font-bold text-indigo-700 font-mono">
              {invoices.filter((i) => i.status !== 'paid').length} Pending
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {currency}{invoices.filter((i) => i.status !== 'paid').reduce((s, i) => s + i.amount, 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500">Uncollected from Customers</span>
          </div>
        </div>

        {/* AP Selector Card */}
        <div
          onClick={() => setSubTab('ap')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            subTab === 'ap'
              ? 'bg-white border-indigo-600 ring-2 ring-indigo-500/20 shadow-2xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="font-bold text-slate-900 text-sm">Accounts Payable (Vendor Bills)</span>
            </div>
            <span className="text-xs font-bold text-amber-700 font-mono">
              {bills.filter((b) => b.status !== 'paid').length} Pending
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {currency}{bills.filter((b) => b.status !== 'paid').reduce((s, b) => s + b.amount, 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500">Owed to Vendors</span>
          </div>
        </div>
      </div>

      {/* Filter and Add Bar */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search ${subTab === 'ar' ? 'customer invoices' : 'vendor bills'} by entity or description...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        <button
          onClick={onOpenNewTransactionModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Create {subTab === 'ar' ? 'Invoice' : 'Bill'}</span>
        </button>
      </div>

      {/* High Density Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Issue Date</th>
                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {subTab === 'ar' ? 'Customer / Client' : 'Vendor / Supplier'}
                </th>
                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</th>
                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Date</th>
                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 font-sans font-medium">
                    No {subTab === 'ar' ? 'invoices' : 'bills'} recorded yet.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap font-mono">
                      {item.date}
                    </td>
                    <td className="px-4 py-2.5 font-sans font-semibold text-slate-900 whitespace-nowrap">
                      {item.entityName}
                    </td>
                    <td className="px-4 py-2.5 font-sans text-slate-700 max-w-xs truncate">
                      {item.description}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
                      {item.dueDate ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {item.dueDate}
                        </span>
                      ) : (
                        'Net 30'
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-900 whitespace-nowrap">
                      {currency}{item.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-center whitespace-nowrap">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                          item.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right whitespace-nowrap font-sans">
                      {item.status !== 'paid' ? (
                        <button
                          onClick={() => onSettleTransaction(item.id)}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                        >
                          {subTab === 'ar' ? 'Record Payment' : 'Mark Paid'}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 flex items-center justify-end gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
