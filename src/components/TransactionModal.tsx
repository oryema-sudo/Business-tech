import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Receipt,
  FileText,
  DollarSign,
  Calendar,
  Building2,
  Tag,
  Paperclip,
  CheckCircle2,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { BusinessTransaction, TransactionType, CompanyProfile, Account } from '../types/accounting';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: BusinessTransaction) => void;
  editTransaction?: BusinessTransaction | null;
  company: CompanyProfile;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editTransaction,
  company,
}) => {
  const [formData, setFormData] = useState<Partial<BusinessTransaction>>({
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    entityName: '',
    description: '',
    category: 'Software, Cloud & SaaS Infrastructure',
    amount: 0,
    paymentMethod: 'operating_bank',
    status: 'paid',
    taxDeductible: true,
    notes: '',
    receiptName: '',
  });

  const [isCategorizing, setIsCategorizing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);

  useEffect(() => {
    if (editTransaction) {
      setFormData(editTransaction);
    } else {
      setFormData({
        id: `tx-${Date.now().toString().slice(-5)}`,
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        entityName: '',
        description: '',
        category: 'Software, Cloud & SaaS Infrastructure',
        amount: 0,
        paymentMethod: 'operating_bank',
        status: 'paid',
        taxDeductible: true,
        notes: '',
        receiptName: '',
      });
      setAiSuggestion(null);
    }
  }, [editTransaction, isOpen]);

  if (!isOpen) return null;

  const currency = company.currencySymbol || '$';

  // AI Auto-Categorizer
  const handleAICategorize = async () => {
    if (!formData.description && !formData.entityName) {
      alert('Please enter at least a Payee/Entity or Description first.');
      return;
    }
    setIsCategorizing(true);
    try {
      const res = await fetch('/api/ai/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: formData.description || formData.entityName,
          vendor: formData.entityName,
          type: formData.type,
          amount: formData.amount || 100,
        }),
      });
      const data = await res.json();
      if (data.suggestion) {
        setAiSuggestion(data.suggestion);
        setFormData((prev) => ({
          ...prev,
          category: data.suggestion.debitAccountName || prev.category,
          taxDeductible: data.suggestion.taxDeductible !== undefined ? data.suggestion.taxDeductible : prev.taxDeductible,
          notes: data.suggestion.accountingNotes ? `${data.suggestion.accountingNotes}` : prev.notes,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.entityName || !formData.description || !formData.amount) {
      alert('Please fill in Entity/Payee, Description, and a valid Amount.');
      return;
    }

    const finalTx: BusinessTransaction = {
      id: formData.id || `tx-${Date.now().toString().slice(-5)}`,
      date: formData.date || new Date().toISOString().split('T')[0],
      type: (formData.type as TransactionType) || 'expense',
      entityName: formData.entityName,
      description: formData.description,
      category: formData.category || 'General & Administrative Expenses',
      amount: Number(formData.amount),
      paymentMethod: formData.paymentMethod || 'operating_bank',
      status: formData.status || 'paid',
      dueDate: formData.dueDate,
      taxDeductible: formData.taxDeductible,
      notes: formData.notes,
      receiptName: formData.receiptName,
    };

    onSave(finalTx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Receipt className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {editTransaction ? 'Edit Business Entry' : 'Record Business Transaction / Expense'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Posts directly to double-entry general ledger
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Top Row: Type & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Transaction Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
              >
                <option value="expense">Expense (Operational Outlay)</option>
                <option value="revenue">Revenue (Sales / Client Payment)</option>
                <option value="invoice">Invoice (Accounts Receivable - A/R)</option>
                <option value="bill">Vendor Bill (Accounts Payable - A/P)</option>
                <option value="asset_purchase">CapEx / Equipment Asset Purchase</option>
                <option value="owner_equity">Owner Capital Contribution</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Posting Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
              />
            </div>
          </div>

          {/* Payee / Entity & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                {formData.type === 'revenue' || formData.type === 'invoice'
                  ? 'Client / Customer / Source'
                  : 'Vendor / Payee / Recipient'}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AWS, Stripe, Google Ads, Horizon Inc"
                value={formData.entityName}
                onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Amount ({currency})
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">
                  {currency}
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  placeholder="0.00"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Description & AI Button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-600 font-semibold">Business Memo / Description</label>
              <button
                type="button"
                onClick={handleAICategorize}
                disabled={isCategorizing}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isCategorizing ? 'animate-spin' : ''}`} />
                <span>{isCategorizing ? 'Auditing with AI...' : 'AI Auto-Classify'}</span>
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Monthly cloud server cluster hosting fee for production environment"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Chart of Accounts Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
              >
                <optgroup label="Operating Expenses (6000s)">
                  <option value="Software, Cloud & SaaS Infrastructure">6040 Software, Cloud & SaaS Infrastructure</option>
                  <option value="Salaries, Wages & Benefits">6010 Salaries, Wages & Benefits</option>
                  <option value="Rent & Office Facilities">6020 Rent & Office Facilities</option>
                  <option value="Advertising & Marketing Acquisition">6030 Advertising & Marketing Acquisition</option>
                  <option value="Legal, Accounting & Professional Fees">6070 Legal, Accounting & Professional Fees</option>
                  <option value="Travel, Lodging & Client Meals">6060 Travel, Lodging & Client Meals</option>
                  <option value="Utilities, Telecom & High-Speed Internet">6050 Utilities & Telecom</option>
                  <option value="General & Administrative Supplies">6090 General & Administrative</option>
                </optgroup>
                <optgroup label="Cost of Goods Sold (5000s)">
                  <option value="Cost of Goods Sold (COGS)">5010 Cost of Goods Sold</option>
                  <option value="Subcontractor & Direct Labor Cost">5020 Subcontractor & Direct Labor</option>
                </optgroup>
                <optgroup label="Revenue Streams (4000s)">
                  <option value="Client Retainer & Consulting Fees">4010 Client Retainer & Consulting Fees</option>
                  <option value="Software Subscription & SaaS Revenue">4020 SaaS Subscription Revenue</option>
                  <option value="Product & Merchandise Sales">4030 Product Sales</option>
                </optgroup>
                <optgroup label="Assets & Equity (1000s & 3000s)">
                  <option value="Office & IT Equipment">1500 Office & IT Equipment (CapEx)</option>
                  <option value="Owner's / Shareholder Capital">3010 Owner's Capital</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Settlement Account</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
              >
                <option value="operating_bank">1020 Operating Bank Account</option>
                <option value="cash">1010 Petty Cash on Hand</option>
                <option value="credit_card">2020 Corporate Credit Card</option>
                <option value="accounts_receivable">1200 Accounts Receivable (A/R)</option>
                <option value="accounts_payable">2010 Accounts Payable (A/P)</option>
              </select>
            </div>
          </div>

          {/* Status & Tax Deductible */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Settlement Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
              >
                <option value="paid">Paid / Settled</option>
                <option value="pending">Pending Settlement</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.taxDeductible}
                  onChange={(e) => setFormData({ ...formData, taxDeductible: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-slate-700 font-medium">Eligible Tax Deduction (Schedule C / 1120)</span>
              </label>
            </div>
          </div>

          {/* Live Double-Entry Posting Preview */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase">
              <span className="flex items-center gap-1.5 text-indigo-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> GAAP Double-Entry Preview
              </span>
              <span className="text-emerald-600 font-bold">Balanced (Dr = Cr)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-slate-400 text-[10px] block">DEBIT:</span>
                <span className="text-slate-900 font-semibold truncate block">
                  {formData.type === 'revenue' ? '1020 Operating Bank' : formData.category}
                </span>
                <span className="text-indigo-700 font-bold block text-[11px] mt-0.5">
                  {currency}{Number(formData.amount || 0).toLocaleString()}
                </span>
              </div>
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-slate-400 text-[10px] block">CREDIT:</span>
                <span className="text-slate-900 font-semibold truncate block">
                  {formData.type === 'revenue' ? formData.category : '1020 Operating Bank'}
                </span>
                <span className="text-indigo-700 font-bold block text-[11px] mt-0.5">
                  {currency}{Number(formData.amount || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-2xs"
            >
              {editTransaction ? 'Save Changes' : 'Post to Ledger'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
