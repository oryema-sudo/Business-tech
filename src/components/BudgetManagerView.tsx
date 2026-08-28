import React, { useState } from 'react';
import {
  PieChart,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Plus,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { BudgetCategory, CompanyProfile } from '../types/accounting';

interface BudgetManagerViewProps {
  budgets: BudgetCategory[];
  company: CompanyProfile;
  onUpdateBudget?: (budgets: BudgetCategory[]) => void;
}

export const BudgetManagerView: React.FC<BudgetManagerViewProps> = ({
  budgets,
  company,
  onUpdateBudget,
}) => {
  const currency = company.currencySymbol || '$';

  const totalAllocated = budgets.reduce((s, b) => s + b.allocated, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const overallPercentage = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* High Density Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Allocated Budget</div>
          <div className="mt-1.5 text-2xl font-bold font-mono text-slate-900">
            {currency}{totalAllocated.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">Quarterly limit authorized</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Actual Outlay (Spent)</div>
          <div className="mt-1.5 text-2xl font-bold font-mono text-rose-600">
            {currency}{totalSpent.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">{overallPercentage}% consumed</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Remaining Capacity</div>
          <div className="mt-1.5 text-2xl font-bold font-mono text-emerald-700">
            {currency}{totalRemaining.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-600 mt-1 font-bold">Positive headroom</div>
        </div>
      </div>

      {/* High Density Overall Progress Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-800">Company-Wide Quarterly Allocation</span>
          <span className="font-mono font-bold text-slate-900">{overallPercentage}% Consumed</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallPercentage > 90
                ? 'bg-rose-500'
                : overallPercentage > 75
                ? 'bg-amber-500'
                : 'bg-indigo-600'
            }`}
            style={{ width: `${Math.min(overallPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Department Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((b) => {
          const pct = Math.round((b.spent / b.allocated) * 100);
          const remaining = b.allocated - b.spent;
          const isOver = b.spent > b.allocated;

          return (
            <div
              key={b.id}
              className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{b.name}</h3>
                  <div className="text-xs text-slate-500">{b.category} • {b.period}</div>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    isOver
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : pct > 80
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {isOver ? 'Over Budget' : `${pct}% Used`}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isOver
                      ? 'bg-rose-500'
                      : pct > 80
                      ? 'bg-amber-500'
                      : 'bg-indigo-600'
                  }`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>

              {/* Numbers */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Allocated:</span>
                  <span className="text-slate-800">{currency}{b.allocated.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Actual:</span>
                  <span className={isOver ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                    {currency}{b.spent.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-sans">Remaining:</span>
                  <span className={isOver ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                    {currency}{remaining.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
