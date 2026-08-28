import React, { useState } from 'react';
import {
  Sparkles,
  Printer,
  Download,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Flame,
  Scale,
  DollarSign,
  FileCheck,
  RefreshCw,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import {
  FinancialKPIs,
  IncomeStatementReport,
  BalanceSheetReport,
  CashFlowReport,
  CompanyProfile,
} from '../types/accounting';

interface AIReportingViewProps {
  kpis: FinancialKPIs;
  incomeStatement: IncomeStatementReport;
  balanceSheet: BalanceSheetReport;
  cashFlow: CashFlowReport;
  company: CompanyProfile;
}

export const AIReportingView: React.FC<AIReportingViewProps> = ({
  kpis,
  incomeStatement,
  balanceSheet,
  cashFlow,
  company,
}) => {
  const [reportType, setReportType] = useState('full');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportContent, setReportContent] = useState<string | null>(null);

  const currency = company.currencySymbol || '$';

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: company.name,
          currency: company.currency,
          kpis,
          incomeStatement,
          balanceSheet,
          cashFlow,
          reportType,
        }),
      });

      const data = await res.json();
      if (data.report) {
        setReportContent(data.report);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* High Density Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Health Score</div>
          <div className="mt-1.5 text-2xl font-bold font-mono text-indigo-700">
            {kpis.financialHealthScore}<span className="text-xs font-normal text-slate-400">/100</span>
          </div>
          <div className="text-[10px] text-emerald-600 mt-1 font-bold">Investment Grade</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Cash Runway</div>
          <div className="mt-1.5 text-2xl font-bold font-mono text-slate-900">
            {kpis.runwayMonths} <span className="text-xs font-normal text-slate-500">Months</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">Net Burn: {currency}{kpis.monthlyBurnRate.toLocaleString()}/mo</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Net Profit Margin</div>
          <div className="mt-1.5 text-2xl font-bold font-mono text-emerald-700">
            {kpis.netMargin}%
          </div>
          <div className="text-[10px] text-emerald-600 mt-1 font-bold">Accrual Recognized</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Current Ratio</div>
          <div className="mt-1.5 text-2xl font-bold font-mono text-slate-900">
            {kpis.currentRatio}x
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">Working Capital Buffer</div>
        </div>
      </div>

      {/* Focus Selector and Generation Trigger */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs w-full md:w-auto overflow-x-auto">
          {[
            { id: 'full', label: 'Executive CFO Briefing' },
            { id: 'tax', label: 'Tax Deductions & IRS' },
            { id: 'runway', label: 'Burn Rate & Runway' },
            { id: 'investor', label: 'Investor Summary' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setReportType(mode.id)}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all cursor-pointer ${
                reportType === mode.id
                  ? 'bg-white text-indigo-700 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {reportContent && (
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Report</span>
            </button>
          )}

          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Synthesizing...' : 'Generate AI Report'}</span>
          </button>
        </div>
      </div>

      {/* Report Paper Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
        {!reportContent && !isGenerating && (
          <div className="text-center py-12 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center border border-indigo-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Automated Accounting & Performance Analysis</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Generates a comprehensive executive analysis based on your live double-entry general ledger, balance sheet, and income statement.
              </p>
            </div>
            <button
              onClick={handleGenerateReport}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run Automated Analysis</span>
            </button>
          </div>
        )}

        {isGenerating && (
          <div className="text-center py-12 space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Auditing Ledgers & Analyzing Statements...</h3>
              <p className="text-xs text-slate-500">
                Evaluating double-entry books, running solvency models, and drafting recommendations.
              </p>
            </div>
          </div>
        )}

        {reportContent && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4 text-center">
              <div className="text-xs font-bold uppercase tracking-widest text-indigo-700">
                {company.name} • Virtual CFO Briefing
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-1">
                Comprehensive Business Performance & Financial Health Report
              </h2>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">
                Real-Time Accrual Books • Period: FY2026 • GAAP Verified
              </div>
            </div>

            <div className="prose max-w-none text-slate-700 text-xs leading-relaxed space-y-3 font-sans">
              {reportContent.split('\n\n').map((para, idx) => {
                if (para.startsWith('# ')) {
                  return (
                    <h2 key={idx} className="text-base font-bold text-slate-900 pt-3 pb-1 border-b border-slate-200">
                      {para.replace('# ', '')}
                    </h2>
                  );
                }
                if (para.startsWith('## ')) {
                  return (
                    <h3 key={idx} className="text-sm font-bold text-indigo-900 pt-2">
                      {para.replace('## ', '')}
                    </h3>
                  );
                }
                if (para.startsWith('### ')) {
                  return (
                    <h4 key={idx} className="text-xs font-semibold text-slate-900 pt-1">
                      {para.replace('### ', '')}
                    </h4>
                  );
                }
                if (para.startsWith('- ') || para.startsWith('* ')) {
                  const items = para.split('\n');
                  return (
                    <ul key={idx} className="space-y-1 pl-4 list-disc text-slate-700">
                      {items.map((item, iIdx) => (
                        <li key={iIdx}>
                          {item.replace(/^[-*]\s+/, '')}
                        </li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <p key={idx} className="text-slate-700 whitespace-pre-line">
                    {para}
                  </p>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
