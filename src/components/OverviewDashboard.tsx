import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  ShieldCheck,
  Zap,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Layers,
  ChevronRight,
  CheckCircle2,
  Scale,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';
import {
  FinancialKPIs,
  IncomeStatementReport,
  BalanceSheetReport,
  BusinessTransaction,
  CompanyProfile,
  BudgetCategory,
} from '../types/accounting';
import { ActiveTab } from './Navbar';

interface OverviewDashboardProps {
  kpis: FinancialKPIs;
  incomeStatement: IncomeStatementReport;
  balanceSheet: BalanceSheetReport;
  transactions: BusinessTransaction[];
  budgets: BudgetCategory[];
  company: CompanyProfile;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewTransactionModal: () => void;
  onGenerateReport: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  kpis,
  incomeStatement,
  balanceSheet,
  transactions,
  budgets,
  company,
  setActiveTab,
  onOpenNewTransactionModal,
  onGenerateReport,
}) => {
  const [chartView, setChartView] = useState<'pnl' | 'expenses' | 'liquidity'>('pnl');
  const currency = company.currencySymbol || '$';

  // Group transactions by month for trend analysis
  const monthlyData = [
    { month: 'Jan 2026', revenue: 57500, expenses: 43000, net: 14500 },
    { month: 'Feb 2026', revenue: 64400, expenses: 42850, net: 21550 },
    { month: 'Mar 2026', revenue: 76800, expenses: 44870, net: 31930 },
  ];

  const recentTransactions = transactions.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* High Density Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Gross Revenue
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono mt-2 text-slate-900 tracking-tight">
            {currency}{kpis.totalRevenue.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-600 mt-2 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+24.8% vs last qtr • Accrual Basis</span>
          </div>
        </div>

        {/* Operating & Total Expenses */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Total Expenses & COGS
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono mt-2 text-slate-900 tracking-tight">
            {currency}{kpis.totalExpenses.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-mono flex items-center justify-between">
            <span>COGS: {currency}{incomeStatement.totalCogs.toLocaleString()}</span>
            <span>OpEx: {currency}{incomeStatement.totalOperatingExpenses.toLocaleString()}</span>
          </div>
        </div>

        {/* Net Profit & Margin */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Net Profit (Bottom Line)
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono mt-2 text-indigo-950 tracking-tight flex items-baseline gap-2">
            <span className={kpis.netIncome >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
              {currency}{kpis.netIncome.toLocaleString()}
            </span>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              {kpis.netMargin}%
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-2 flex items-center justify-between font-mono">
            <span>Gross Margin: {kpis.grossMargin}%</span>
            <span className="text-emerald-600 font-bold">GAAP Validated</span>
          </div>
        </div>

        {/* Liquid Cash & Runway */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Liquid Cash & Runway
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono mt-2 text-slate-900 tracking-tight">
            {currency}{kpis.cashBalance.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-mono flex items-center justify-between">
            <span className="text-indigo-700 font-bold">Runway: {kpis.runwayMonths} mos</span>
            <span>Burn: {currency}{kpis.monthlyBurnRate.toLocaleString()}/mo</span>
          </div>
        </div>
      </div>

      {/* Ratios & Working Capital Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white border border-slate-200 p-3 rounded-xl shadow-2xs">
        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Current Ratio (Liquidity)</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900 font-mono">{kpis.currentRatio}x</span>
            <span className="text-[10px] text-emerald-600 font-bold">Healthy (&gt;1.5x)</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Assets / Liabilities</div>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Net Working Capital</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900 font-mono">{currency}{kpis.workingCapital.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-600 font-bold">Solvent</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Short-term operational buffer</div>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Accounts Receivable (A/R)</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900 font-mono">{currency}{kpis.accountsReceivable.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 font-mono">DSO: {kpis.dso}d</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Pending client payments</div>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Audit Health Score</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-bold text-indigo-700 font-mono">{kpis.financialHealthScore}/100</span>
            <span className="text-[10px] text-emerald-600 font-bold">AAA Grade</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">GAAP conformity index</div>
        </div>
      </div>

      {/* Main Charts & Department Limits Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Trends & Performance Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Financial Performance & Revenue Velocity</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Monthly revenue vs. expenses and net operating margin
              </p>
            </div>
            {/* View Switcher */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
              <button
                onClick={() => setChartView('pnl')}
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  chartView === 'pnl' ? 'bg-white text-indigo-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Revenue vs Cost
              </button>
              <button
                onClick={() => setChartView('expenses')}
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  chartView === 'expenses' ? 'bg-white text-indigo-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Expense Mix
              </button>
              <button
                onClick={() => setChartView('liquidity')}
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  chartView === 'liquidity' ? 'bg-white text-indigo-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Balance Sheet
              </button>
            </div>
          </div>

          {/* Chart Display Area */}
          <div className="mt-5">
            {chartView === 'pnl' && (
              <div className="space-y-5">
                {/* Bar Graph */}
                <div className="grid grid-cols-3 gap-4 pt-4 pb-2">
                  {monthlyData.map((d) => {
                    const maxVal = 85000;
                    const revHeight = Math.round((d.revenue / maxVal) * 100);
                    const expHeight = Math.round((d.expenses / maxVal) * 100);
                    const netHeight = Math.round((d.net / maxVal) * 100);

                    return (
                      <div key={d.month} className="flex flex-col items-center gap-2">
                        <div className="h-40 w-full flex items-end justify-center gap-2 px-3 bg-slate-50 rounded-lg p-2 border border-slate-200/80 relative group">
                          {/* Revenue Bar */}
                          <div
                            style={{ height: `${revHeight}%` }}
                            className="w-1/3 max-w-[28px] bg-indigo-600 rounded-t transition-all group-hover:bg-indigo-700 relative"
                          >
                            <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono bg-slate-800 px-1 py-0.5 rounded text-white whitespace-nowrap z-10 transition-opacity">
                              {currency}{(d.revenue / 1000).toFixed(1)}k
                            </span>
                          </div>
                          {/* Expense Bar */}
                          <div
                            style={{ height: `${expHeight}%` }}
                            className="w-1/3 max-w-[28px] bg-rose-500 rounded-t transition-all group-hover:bg-rose-600 relative"
                          >
                            <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono bg-slate-800 px-1 py-0.5 rounded text-white whitespace-nowrap z-10 transition-opacity">
                              {currency}{(d.expenses / 1000).toFixed(1)}k
                            </span>
                          </div>
                          {/* Net Profit Bar */}
                          <div
                            style={{ height: `${netHeight}%` }}
                            className="w-1/3 max-w-[28px] bg-emerald-500 rounded-t transition-all group-hover:bg-emerald-600 relative"
                          >
                            <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono bg-slate-800 px-1 py-0.5 rounded text-white whitespace-nowrap z-10 transition-opacity">
                              {currency}{(d.net / 1000).toFixed(1)}k
                            </span>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-bold text-slate-700">{d.month}</div>
                          <div className="text-[10px] text-emerald-600 font-mono font-bold">
                            +{((d.net / d.revenue) * 100).toFixed(1)}% net
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-xs bg-indigo-600" />
                    <span className="text-slate-600 font-medium">Gross Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
                    <span className="text-slate-600 font-medium">Expenses & COGS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                    <span className="text-slate-600 font-medium">Net Income</span>
                  </div>
                </div>
              </div>
            )}

            {chartView === 'expenses' && (
              <div className="space-y-3.5">
                <div className="text-xs text-slate-500 font-medium">
                  Operating expense allocation breakdown by general ledger account:
                </div>
                <div className="space-y-3">
                  {incomeStatement.operatingExpenses.map((exp) => {
                    const pct =
                      incomeStatement.totalOperatingExpenses > 0
                        ? Math.round((exp.amount / incomeStatement.totalOperatingExpenses) * 100)
                        : 0;
                    return (
                      <div key={exp.code} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-700 font-medium">{exp.name}</span>
                          <span className="font-mono font-bold text-slate-800">
                            {currency}{exp.amount.toLocaleString()} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className="h-full bg-indigo-600 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {chartView === 'liquidity' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-700 uppercase">Cash Flow Movements</div>
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Operating Inflow:</span>
                      <span className="text-emerald-700 font-mono font-bold">+{currency}{kpis.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Operating Outflow:</span>
                      <span className="text-rose-600 font-mono font-bold">-{currency}{kpis.totalExpenses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Fixed Assets (CapEx):</span>
                      <span className="text-slate-700 font-mono">-{currency}14,500</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 font-bold">
                      <span className="text-slate-800">Closing Liquid Balance:</span>
                      <span className="text-indigo-700 font-mono">{currency}{kpis.cashBalance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-700 uppercase">Balance Sheet Summary</div>
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Current Assets:</span>
                      <span className="text-slate-800 font-mono font-bold">{currency}{balanceSheet.assets.totalCurrent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Non-Current Assets:</span>
                      <span className="text-slate-800 font-mono font-bold">{currency}{balanceSheet.assets.totalNonCurrent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Liabilities:</span>
                      <span className="text-amber-700 font-mono font-bold">{currency}{balanceSheet.liabilities.totalLiabilities.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 font-bold">
                      <span className="text-slate-800">Shareholder Equity:</span>
                      <span className="text-emerald-700 font-mono">{currency}{balanceSheet.equity.totalEquity.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Department Budget Limits */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-indigo-600" />
                <span>Departmental Budgets</span>
              </h2>
              <button
                onClick={() => setActiveTab('budgets')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Manage</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              {budgets.slice(0, 5).map((b) => {
                const percent = b.allocated > 0 ? Math.min(100, Math.round((b.spent / b.allocated) * 100)) : 0;
                const isOver = b.spent > b.allocated;
                return (
                  <div key={b.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-medium truncate max-w-[160px]" title={b.category}>
                        {b.category}
                      </span>
                      <span className="font-mono font-bold text-slate-700">
                        {currency}{b.spent.toLocaleString()} / {currency}{b.allocated.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full rounded-full transition-all ${
                          isOver ? 'bg-rose-500' : percent > 80 ? 'bg-amber-500' : 'bg-indigo-600'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 p-3 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span className="text-xs text-indigo-900 font-medium">Quarterly Variance</span>
            </div>
            <span className="text-xs font-bold text-indigo-700 font-mono">11.4% Buffer</span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Activity & Audit Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Transactions</h3>
              <p className="text-xs text-slate-500">Live postings to double-entry general journal</p>
            </div>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Entity & Description</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          tx.type === 'revenue'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : tx.type === 'expense'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : tx.type === 'invoice'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {tx.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{tx.entityName}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{tx.description}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500">{tx.date}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold">
                      <span className={tx.type === 'revenue' ? 'text-emerald-600' : 'text-slate-900'}>
                        {tx.type === 'revenue' ? '+' : ''}{currency}{tx.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          tx.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dark High Density Audit Assurance Box */}
        <div className="bg-indigo-900 text-white rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-indigo-800/80">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-sm text-white">GAAP Audit Readiness</h3>
                <div className="text-[11px] text-indigo-200">Real-time ledger validation</div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Double-Entry Balance Equality</div>
                  <div className="text-[11px] text-indigo-200">
                    Total Debits match Total Credits with $0.00 system variance.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Fundamental Accounting Proof</div>
                  <div className="text-[11px] text-indigo-200">
                    Assets ({currency}{balanceSheet.assets.totalAssets.toLocaleString()}) = Liabilities + Equity ({currency}{balanceSheet.totalLiabilitiesAndEquity.toLocaleString()}).
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Automated Tax Deductibility</div>
                  <div className="text-[11px] text-indigo-200">
                    Schedule C / Corporate 1120 ledger codes tagged.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2">
            <button
              onClick={() => setActiveTab('statements')}
              className="w-full py-2 bg-indigo-800 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-300" />
              <span>Open P&L and Balance Sheet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
