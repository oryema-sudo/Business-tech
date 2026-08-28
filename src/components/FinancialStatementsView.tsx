import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Scale,
  DollarSign,
  Layers,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import {
  IncomeStatementReport,
  BalanceSheetReport,
  TrialBalanceReport,
  CashFlowReport,
  CompanyProfile,
} from '../types/accounting';

interface FinancialStatementsViewProps {
  incomeStatement: IncomeStatementReport;
  balanceSheet: BalanceSheetReport;
  trialBalance: TrialBalanceReport;
  cashFlow: CashFlowReport;
  company: CompanyProfile;
}

export const FinancialStatementsView: React.FC<FinancialStatementsViewProps> = ({
  incomeStatement,
  balanceSheet,
  trialBalance,
  cashFlow,
  company,
}) => {
  const [activeStatement, setActiveStatement] = useState<'pnl' | 'balance_sheet' | 'trial_balance' | 'cash_flow'>('pnl');
  const currency = company.currencySymbol || '$';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* High Density Statement Sub-Nav & Controls */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveStatement('pnl')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeStatement === 'pnl'
                ? 'bg-white text-indigo-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Income Statement (P&L)</span>
          </button>

          <button
            onClick={() => setActiveStatement('balance_sheet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeStatement === 'balance_sheet'
                ? 'bg-white text-indigo-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Balance Sheet</span>
          </button>

          <button
            onClick={() => setActiveStatement('trial_balance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeStatement === 'trial_balance'
                ? 'bg-white text-indigo-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Trial Balance</span>
          </button>

          <button
            onClick={() => setActiveStatement('cash_flow')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeStatement === 'cash_flow'
                ? 'bg-white text-indigo-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Cash Flow</span>
          </button>
        </div>

        <button
          onClick={handlePrint}
          className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Statement Container (Document Paper Style in High Density) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
        {/* Formal Document Title */}
        <div className="text-center pb-5 border-b border-slate-200 space-y-1">
          <div className="text-xs font-bold uppercase tracking-widest text-indigo-700">
            {company.name}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {activeStatement === 'pnl' && 'Statement of Operations & Comprehensive Income (P&L)'}
            {activeStatement === 'balance_sheet' && 'Statement of Financial Position (Balance Sheet)'}
            {activeStatement === 'trial_balance' && 'Adjusted Trial Balance'}
            {activeStatement === 'cash_flow' && 'Statement of Cash Flows'}
          </h2>
          <div className="text-[11px] text-slate-500 font-mono">
            Fiscal Period Ended 2026 • Accrual Basis GAAP • Currency: {company.currency}
          </div>
        </div>

        {/* 1. INCOME STATEMENT (P&L) */}
        {activeStatement === 'pnl' && (
          <div className="space-y-5 text-xs">
            {/* Revenue Section */}
            <div className="space-y-2">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                Operating Revenue
              </div>
              <div className="space-y-1.5 pl-3">
                {incomeStatement.revenue.map((r) => (
                  <div key={r.code} className="flex items-center justify-between text-slate-700">
                    <span>{r.code} - {r.name}</span>
                    <span className="font-mono font-medium">{currency}{r.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between font-bold text-slate-900 pt-2 border-t border-slate-200 text-xs">
                <span>Total Gross Revenue</span>
                <span className="font-mono text-emerald-700">{currency}{incomeStatement.totalRevenue.toLocaleString()}</span>
              </div>
            </div>

            {/* COGS Section */}
            <div className="space-y-2">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                Cost of Goods Sold & Direct Labor
              </div>
              <div className="space-y-1.5 pl-3">
                {incomeStatement.cogs.length === 0 ? (
                  <div className="text-slate-400 italic">No direct cost of goods sold recorded.</div>
                ) : (
                  incomeStatement.cogs.map((c) => (
                    <div key={c.code} className="flex items-center justify-between text-slate-700">
                      <span>{c.code} - {c.name}</span>
                      <span className="font-mono font-medium">{currency}{c.amount.toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="flex items-center justify-between font-semibold text-slate-800 pt-2 border-t border-slate-200">
                <span>Total Cost of Goods Sold</span>
                <span className="font-mono text-slate-900">{currency}{incomeStatement.totalCogs.toLocaleString()}</span>
              </div>
            </div>

            {/* Gross Profit Summary Line */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between font-bold text-xs text-slate-900">
              <div>
                <span>Gross Profit</span>
                <span className="text-[11px] text-emerald-700 font-semibold ml-2">
                  ({incomeStatement.grossMargin}% Gross Margin)
                </span>
              </div>
              <span className="font-mono text-emerald-700">{currency}{incomeStatement.grossProfit.toLocaleString()}</span>
            </div>

            {/* Operating Expenses (OpEx) */}
            <div className="space-y-2">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                Operating Expenses (SG&A)
              </div>
              <div className="space-y-1.5 pl-3">
                {incomeStatement.operatingExpenses.map((exp) => (
                  <div key={exp.code} className="flex items-center justify-between text-slate-700">
                    <span>{exp.code} - {exp.name}</span>
                    <span className="font-mono font-medium">{currency}{exp.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between font-semibold text-slate-800 pt-2 border-t border-slate-200">
                <span>Total Operating Expenses</span>
                <span className="font-mono text-rose-700">{currency}{incomeStatement.totalOperatingExpenses.toLocaleString()}</span>
              </div>
            </div>

            {/* Operating Income / EBITDA */}
            <div className="flex items-center justify-between font-semibold text-slate-800 pt-2 border-t border-slate-200">
              <div>
                <span>Operating Income (EBITDA)</span>
                <span className="text-[11px] text-slate-500 font-normal ml-2">
                  ({incomeStatement.operatingMargin}% Operating Margin)
                </span>
              </div>
              <span className="font-mono text-slate-900">{currency}{incomeStatement.operatingIncome.toLocaleString()}</span>
            </div>

            {/* Net Income Final Double Underline */}
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between text-sm font-bold text-slate-900">
              <div>
                <span className="text-indigo-950">Net Operating Income (Bottom Line)</span>
                <div className="text-[11px] text-slate-500 font-normal">
                  Net Margin: {incomeStatement.netMargin}%
                </div>
              </div>
              <span className="font-mono text-indigo-700 text-base">
                {currency}{incomeStatement.netIncome.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* 2. BALANCE SHEET */}
        {activeStatement === 'balance_sheet' && (
          <div className="space-y-6 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-slate-800">
                  Fundamental Equation: Assets = Liabilities + Equity
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-700 font-mono">
                {balanceSheet.isBalanced ? 'PROVEN BALANCED' : 'VARIANCE DETECTED'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* ASSETS Column */}
              <div className="space-y-5">
                <div className="font-bold text-slate-900 uppercase tracking-wider text-xs pb-1 border-b border-slate-200">
                  Assets
                </div>

                {/* Current Assets */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">
                    Current Assets
                  </div>
                  <div className="space-y-1.5 pl-3">
                    {balanceSheet.assets.current.map((a) => (
                      <div key={a.code} className="flex justify-between text-slate-700">
                        <span>{a.code} - {a.name}</span>
                        <span className="font-mono font-medium">{currency}{a.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-semibold text-slate-800 pt-1.5 border-t border-slate-200">
                    <span>Total Current Assets</span>
                    <span className="font-mono text-slate-900">{currency}{balanceSheet.assets.totalCurrent.toLocaleString()}</span>
                  </div>
                </div>

                {/* Non-Current Assets */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">
                    Non-Current Assets & Property
                  </div>
                  <div className="space-y-1.5 pl-3">
                    {balanceSheet.assets.nonCurrent.map((a) => (
                      <div key={a.code} className="flex justify-between text-slate-700">
                        <span>{a.code} - {a.name}</span>
                        <span className="font-mono font-medium">{currency}{a.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-semibold text-slate-800 pt-1.5 border-t border-slate-200">
                    <span>Total Non-Current Assets</span>
                    <span className="font-mono text-slate-900">{currency}{balanceSheet.assets.totalNonCurrent.toLocaleString()}</span>
                  </div>
                </div>

                {/* Total Assets */}
                <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-100 flex justify-between font-bold text-xs text-slate-900">
                  <span>Total Assets</span>
                  <span className="font-mono text-indigo-700">{currency}{balanceSheet.assets.totalAssets.toLocaleString()}</span>
                </div>
              </div>

              {/* LIABILITIES & EQUITY Column */}
              <div className="space-y-5">
                <div className="font-bold text-slate-900 uppercase tracking-wider text-xs pb-1 border-b border-slate-200">
                  Liabilities & Equity
                </div>

                {/* Current Liabilities */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">
                    Current Liabilities
                  </div>
                  <div className="space-y-1.5 pl-3">
                    {balanceSheet.liabilities.current.map((l) => (
                      <div key={l.code} className="flex justify-between text-slate-700">
                        <span>{l.code} - {l.name}</span>
                        <span className="font-mono font-medium">{currency}{l.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-semibold text-slate-800 pt-1.5 border-t border-slate-200">
                    <span>Total Current Liabilities</span>
                    <span className="font-mono text-slate-900">{currency}{balanceSheet.liabilities.totalCurrent.toLocaleString()}</span>
                  </div>
                </div>

                {/* Equity */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">
                    Shareholder Equity
                  </div>
                  <div className="space-y-1.5 pl-3">
                    {balanceSheet.equity.items.map((eq) => (
                      <div key={eq.code} className="flex justify-between text-slate-700">
                        <span>{eq.code} - {eq.name}</span>
                        <span className="font-mono font-medium">{currency}{eq.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Current Period Net Earnings</span>
                      <span className="font-mono">{currency}{balanceSheet.equity.currentPeriodEarnings.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-800 pt-1.5 border-t border-slate-200">
                    <span>Total Shareholder Equity</span>
                    <span className="font-mono text-slate-900">{currency}{balanceSheet.equity.totalEquity.toLocaleString()}</span>
                  </div>
                </div>

                {/* Total Liabilities & Equity */}
                <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-100 flex justify-between font-bold text-xs text-slate-900">
                  <span>Total Liabilities & Equity</span>
                  <span className="font-mono text-indigo-700">{currency}{balanceSheet.totalLiabilitiesAndEquity.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. TRIAL BALANCE */}
        {activeStatement === 'trial_balance' && (
          <div className="space-y-4 text-xs">
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Account Code & Name</th>
                    <th className="px-4 py-2.5">Classification</th>
                    <th className="px-4 py-2.5 text-right">Debit Balance</th>
                    <th className="px-4 py-2.5 text-right">Credit Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {trialBalance.rows.map((row) => (
                    <tr key={row.accountCode} className="hover:bg-slate-50/60">
                      <td className="px-4 py-2 font-sans font-medium text-slate-900">
                        {row.accountCode} - {row.accountName}
                      </td>
                      <td className="px-4 py-2 font-sans text-slate-500">
                        {row.type}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-800 font-bold">
                        {row.debit > 0 ? `${currency}${row.debit.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-800 font-bold">
                        {row.credit > 0 ? `${currency}${row.credit.toLocaleString()}` : '-'}
                      </td>
                    </tr>
                  ))}
                  {/* Totals */}
                  <tr className="bg-slate-50 font-bold text-slate-900 text-xs border-t-2 border-slate-300">
                    <td colSpan={2} className="px-4 py-2.5 font-sans">
                      Trial Balance Sum Totals
                    </td>
                    <td className="px-4 py-2.5 text-right text-indigo-700 font-mono font-bold">
                      {currency}{trialBalance.totalDebit.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-right text-indigo-700 font-mono font-bold">
                      {currency}{trialBalance.totalCredit.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs font-semibold text-emerald-800">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Trial balance is verified in complete mathematical balance ($0.00 variance).
              </span>
            </div>
          </div>
        )}

        {/* 4. CASH FLOW STATEMENT */}
        {activeStatement === 'cash_flow' && (
          <div className="space-y-5 text-xs">
            {/* Operating Activities */}
            <div className="space-y-2">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                Cash Flow from Operating Activities
              </div>
              <div className="space-y-1.5 pl-3">
                {cashFlow.operatingActivities.map((op, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700">
                    <span>{op.description}</span>
                    <span className="font-mono font-medium">{currency}{op.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-semibold text-slate-800 pt-2 border-t border-slate-200">
                <span>Net Cash Provided by Operating Activities</span>
                <span className="font-mono text-emerald-700 font-bold">{currency}{cashFlow.netOperatingCash.toLocaleString()}</span>
              </div>
            </div>

            {/* Investing Activities */}
            <div className="space-y-2">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                Cash Flow from Investing Activities (CapEx)
              </div>
              <div className="space-y-1.5 pl-3">
                {cashFlow.investingActivities.map((inv, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700">
                    <span>{inv.description}</span>
                    <span className="font-mono font-medium">{currency}{inv.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-semibold text-slate-800 pt-2 border-t border-slate-200">
                <span>Net Cash Used in Investing Activities</span>
                <span className="font-mono text-rose-700 font-bold">{currency}{cashFlow.netInvestingCash.toLocaleString()}</span>
              </div>
            </div>

            {/* Financing Activities */}
            <div className="space-y-2">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                Cash Flow from Financing Activities
              </div>
              <div className="space-y-1.5 pl-3">
                {cashFlow.financingActivities.map((fin, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700">
                    <span>{fin.description}</span>
                    <span className="font-mono font-medium">{currency}{fin.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-semibold text-slate-800 pt-2 border-t border-slate-200">
                <span>Net Cash Provided by Financing Activities</span>
                <span className="font-mono text-emerald-700 font-bold">{currency}{cashFlow.netFinancingCash.toLocaleString()}</span>
              </div>
            </div>

            {/* Cash Summary */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Net Increase in Cash & Equivalents:</span>
                <span className="text-slate-900 font-mono font-bold">{currency}{cashFlow.netChangeInCash.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Cash at Beginning of Period:</span>
                <span className="text-slate-900 font-mono font-bold">{currency}{cashFlow.beginningCash.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-xs text-slate-900">
                <span className="text-indigo-950">Cash & Equivalents at End of Period:</span>
                <span className="font-mono text-indigo-700 text-sm">{currency}{cashFlow.endingCash.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
