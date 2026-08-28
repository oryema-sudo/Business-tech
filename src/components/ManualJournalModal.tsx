import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Scale,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
} from 'lucide-react';
import { JournalEntry, JournalEntryLine, Account, CompanyProfile } from '../types/accounting';
import { DEFAULT_CHART_OF_ACCOUNTS } from '../data/defaultChartOfAccounts';

interface ManualJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: JournalEntry) => void;
  accounts?: Account[];
  company: CompanyProfile;
}

export const ManualJournalModal: React.FC<ManualJournalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  accounts = DEFAULT_CHART_OF_ACCOUNTS,
  company,
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [lines, setLines] = useState<JournalEntryLine[]>([
    {
      id: 'line-1',
      accountId: accounts[0]?.id || 'acc-1020',
      accountCode: accounts[0]?.code || '1020',
      accountName: accounts[0]?.name || 'Operating Checking Account',
      debit: 0,
      credit: 0,
      memo: '',
    },
    {
      id: 'line-2',
      accountId: accounts[1]?.id || 'acc-4010',
      accountCode: accounts[1]?.code || '4010',
      accountName: accounts[1]?.name || 'Client Retainer & Consulting Fees',
      debit: 0,
      credit: 0,
      memo: '',
    },
  ]);

  if (!isOpen) return null;

  const currency = company.currencySymbol || '$';

  const handleAccountChange = (index: number, accountCode: string) => {
    const acc = accounts.find((a) => a.code === accountCode);
    if (!acc) return;
    const newLines = [...lines];
    newLines[index] = {
      ...newLines[index],
      accountId: acc.id,
      accountCode: acc.code,
      accountName: acc.name,
    };
    setLines(newLines);
  };

  const handleDebitChange = (index: number, val: number) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], debit: val, credit: val > 0 ? 0 : newLines[index].credit };
    setLines(newLines);
  };

  const handleCreditChange = (index: number, val: number) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], credit: val, debit: val > 0 ? 0 : newLines[index].debit };
    setLines(newLines);
  };

  const handleMemoChange = (index: number, val: string) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], memo: val };
    setLines(newLines);
  };

  const addLine = () => {
    const defaultAcc = accounts[0];
    setLines([
      ...lines,
      {
        id: `line-${Date.now()}-${lines.length + 1}`,
        accountId: defaultAcc.id,
        accountCode: defaultAcc.code,
        accountName: defaultAcc.name,
        debit: 0,
        credit: 0,
        memo: '',
      },
    ]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 2) {
      alert('A journal entry must contain at least 2 lines (Debit and Credit).');
      return;
    }
    setLines(lines.filter((_, i) => i !== index));
  };

  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = difference < 0.01 && totalDebit > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) {
      alert('Please enter a description / memo for this journal entry.');
      return;
    }
    if (!isBalanced) {
      alert('Journal entry is out of balance. Total Debits must equal Total Credits.');
      return;
    }

    const entryId = `je-manual-${Date.now().toString().slice(-5)}`;
    const newEntry: JournalEntry = {
      id: entryId,
      entryNumber: `JE-${date.replace(/-/g, '')}-${entryId.slice(-3)}`,
      date,
      description,
      reference,
      sourceType: 'manual',
      lines: lines.map((l) => ({
        ...l,
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
      })),
      totalDebit,
      totalCredit,
      status: 'posted',
      createdAt: new Date().toISOString(),
    };

    onSave(newEntry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Scale className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Create Manual Journal Entry</h2>
              <p className="text-[11px] text-slate-500">
                Direct double-entry adjusting or correcting journal posting
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
          {/* Date, Description, Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Posting Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-600 font-semibold mb-1">Journal Memo / Header</label>
              <input
                type="text"
                required
                placeholder="e.g. Month-end depreciation adjustment or prepaid expense amortization"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 font-bold uppercase text-[10px]">
                Journal Line Items
              </label>
              <button
                type="button"
                onClick={addLine}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Line</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {lines.map((line, idx) => (
                <div
                  key={line.id}
                  className="grid grid-cols-12 gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 items-center"
                >
                  {/* Account Selector */}
                  <div className="col-span-5">
                    <select
                      value={line.accountCode}
                      onChange={(e) => handleAccountChange(idx, e.target.value)}
                      className="w-full px-2 py-1.5 rounded-md bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 cursor-pointer"
                    >
                      {accounts.map((a) => (
                        <option key={a.code} value={a.code}>
                          {a.code} - {a.name} ({a.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Line Memo */}
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="Line memo"
                      value={line.memo || ''}
                      onChange={(e) => handleMemoChange(idx, e.target.value)}
                      className="w-full px-2 py-1.5 rounded-md bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  {/* Debit Input */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Debit Dr"
                      value={line.debit || ''}
                      onChange={(e) => handleDebitChange(idx, parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-md bg-white border border-slate-200 text-slate-900 font-mono text-xs text-right focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  {/* Credit Input */}
                  <div className="col-span-2 flex items-center gap-1">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Credit Cr"
                      value={line.credit || ''}
                      onChange={(e) => handleCreditChange(idx, parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-md bg-white border border-slate-200 text-slate-900 font-mono text-xs text-right focus:outline-none focus:border-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={() => removeLine(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove Line"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Balance Calculation Footer */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between font-mono text-xs">
            <div className="space-x-4">
              <span>
                Total Debit: <strong className="text-indigo-700">{currency}{totalDebit.toLocaleString()}</strong>
              </span>
              <span>
                Total Credit: <strong className="text-indigo-700">{currency}{totalCredit.toLocaleString()}</strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {isBalanced ? (
                <span className="flex items-center gap-1 text-emerald-700 font-bold font-sans">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Balanced
                </span>
              ) : (
                <span className="flex items-center gap-1 text-rose-700 font-bold font-sans">
                  <AlertCircle className="w-4 h-4 text-rose-600" /> Difference: {currency}{difference.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
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
              disabled={!isBalanced}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-all ${
                isBalanced
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Post Journal Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
