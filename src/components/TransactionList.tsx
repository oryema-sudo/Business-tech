import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Receipt,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpDown,
  Tag,
  Trash2,
  Edit3,
  ExternalLink,
  Scale,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { BusinessTransaction, CompanyProfile, TransactionType } from '../types/accounting';
import { ActiveTab } from './Navbar';

interface TransactionListProps {
  transactions: BusinessTransaction[];
  company: CompanyProfile;
  onOpenNewTransactionModal: () => void;
  onEditTransaction: (tx: BusinessTransaction) => void;
  onDeleteTransaction: (id: string) => void;
  onToggleStatus: (id: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  company,
  onOpenNewTransactionModal,
  onEditTransaction,
  onDeleteTransaction,
  onToggleStatus,
  setActiveTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'date' | 'amount' | 'entityName'>('date');
  const [sortAsc, setSortAsc] = useState(false);

  const currency = company.currencySymbol || '$';

  // Unique categories list
  const categories = useMemo(() => {
    const set = new Set(transactions.map((t) => t.category).filter(Boolean));
    return Array.from(set);
  }, [transactions]);

  // Filtered & sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        const matchesSearch =
          tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.category.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = typeFilter === 'all' || tx.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;

        return matchesSearch && matchesType && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'date') {
          comp = new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortField === 'amount') {
          comp = a.amount - b.amount;
        } else if (sortField === 'entityName') {
          comp = a.entityName.localeCompare(b.entityName);
        }
        return sortAsc ? comp : -comp;
      });
  }, [transactions, searchTerm, typeFilter, statusFilter, categoryFilter, sortField, sortAsc]);

  // Quick stats
  const totalExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalRevenue = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'revenue')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const pendingReceivables = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'invoice' && t.status !== 'paid')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const pendingPayables = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'bill' && t.status !== 'paid')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Entity', 'Description', 'Category', 'Amount', 'Status', 'Tax Deductible'];
    const rows = filteredTransactions.map((tx) => [
      tx.id,
      tx.date,
      tx.type,
      `"${tx.entityName.replace(/"/g, '""')}"`,
      `"${tx.description.replace(/"/g, '""')}"`,
      `"${tx.category.replace(/"/g, '""')}"`,
      tx.amount,
      tx.status,
      tx.taxDeductible ? 'Yes' : 'No',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ledger-transactions-${company.name.toLowerCase().replace(/\s+/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* High Density Metric Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Expenses</div>
          <div className="mt-1.5 text-2xl font-bold font-mono text-rose-600">
            {currency}{totalExpenses.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">Recognized on P&L</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Gross Revenue</div>
          <div className="mt-1.5 text-2xl font-bold font-mono text-emerald-600">
            {currency}{totalRevenue.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-600 mt-1 font-bold">Earned Accrual</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Uncollected A/R</div>
          <div className="mt-1.5 text-2xl font-bold font-mono text-indigo-700">
            {currency}{pendingReceivables.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">Pending Invoices</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Unpaid A/P</div>
          <div className="mt-1.5 text-2xl font-bold font-mono text-amber-700">
            {currency}{pendingPayables.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">Vendor Bills Due</div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by payee, customer, description, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses</option>
            <option value="revenue">Revenues</option>
            <option value="invoice">Invoices (A/R)</option>
            <option value="bill">Bills (A/P)</option>
            <option value="asset_purchase">CapEx / Assets</option>
            <option value="owner_equity">Owner Capital</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid / Settled</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer max-w-[140px] truncate"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* High Density Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
              <tr>
                <th
                  onClick={() => {
                    setSortField('date');
                    setSortAsc(!sortAsc);
                  }}
                  className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    setSortField('entityName');
                    setSortAsc(!sortAsc);
                  }}
                  className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                >
                  <div className="flex items-center gap-1">
                    <span>Entity / Payee</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Description & Category
                </th>
                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Type & Method
                </th>
                <th
                  onClick={() => {
                    setSortField('amount');
                    setSortAsc(!sortAsc);
                  }}
                  className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right cursor-pointer hover:text-slate-700"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Amount</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                  Status
                </th>
                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                    No transactions matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors group">
                    {/* Date */}
                    <td className="px-4 py-2.5 font-mono text-slate-500 whitespace-nowrap">
                      {tx.date}
                    </td>

                    {/* Entity / Payee */}
                    <td className="px-4 py-2.5 font-semibold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{tx.entityName}</span>
                        {tx.receiptName && (
                          <span
                            title={`Receipt Attached: ${tx.receiptName}`}
                            className="text-[10px] text-indigo-600 cursor-help"
                          >
                            📎
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Description & Category */}
                    <td className="px-4 py-2.5 max-w-xs">
                      <div className="text-slate-800 font-medium truncate" title={tx.description}>
                        {tx.description}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                          {tx.category}
                        </span>
                        {tx.taxDeductible && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            TAX DEDUCTIBLE
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Type & Payment Method */}
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          tx.type === 'revenue'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : tx.type === 'expense'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : tx.type === 'invoice'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : tx.type === 'bill'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}
                      >
                        {tx.type.replace('_', ' ')}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5 capitalize">
                        {tx.paymentMethod.replace(/_/g, ' ')}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-2.5 text-right font-mono font-bold whitespace-nowrap">
                      <span
                        className={
                          tx.type === 'revenue'
                            ? 'text-emerald-600'
                            : tx.type === 'expense'
                            ? 'text-slate-900'
                            : 'text-slate-700'
                        }
                      >
                        {tx.type === 'revenue' ? '+' : ''}
                        {currency}{tx.amount.toLocaleString()}
                      </span>
                    </td>

                    {/* Status Toggle */}
                    <td className="px-4 py-2.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => onToggleStatus(tx.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer border ${
                          tx.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : tx.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                        title="Click to toggle status"
                      >
                        {tx.status}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setActiveTab('journal')}
                          title="View General Journal Entry"
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        >
                          <Scale className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditTransaction(tx)}
                          title="Edit Transaction"
                          className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          title="Delete Transaction"
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
