import React, { useState, useMemo, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { FinancialStatementsView } from './components/FinancialStatementsView';
import { GeneralLedgerView } from './components/GeneralLedgerView';
import { GeneralJournalView } from './components/GeneralJournalView';
import { ManualJournalModal } from './components/ManualJournalModal';
import { InvoicesBillsView } from './components/InvoicesBillsView';
import { AIReportingView } from './components/AIReportingView';
import { BudgetManagerView } from './components/BudgetManagerView';
import { ChartOfAccountsView } from './components/ChartOfAccountsView';
import { AIChatModal } from './components/AIChatModal';
import { CompanyProfileModal } from './components/CompanyProfileModal';

import {
  BusinessTransaction,
  JournalEntry,
  CompanyProfile,
  BudgetCategory,
} from './types/accounting';
import { DEFAULT_CHART_OF_ACCOUNTS } from './data/defaultChartOfAccounts';
import { SAMPLE_UGANDA_ENTERPRISE } from './data/sampleCompanyData';
import {
  calculateAccountBalances,
  getAllJournalEntries,
  generateIncomeStatement,
  generateBalanceSheet,
  generateTrialBalance,
  generateCashFlowStatement,
  calculateFinancialKPIs,
  generateLedgerActivities,
  syncBudgetsWithTransactions,
} from './utils/accountingEngine';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Bot,
  Plus,
  Menu,
  Sparkles,
  Scale,
} from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core accounting state with Uganda Shilling default
  const [company, setCompany] = useState<CompanyProfile>(() => {
    const saved = localStorage.getItem('ledgertrack_company');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return SAMPLE_UGANDA_ENTERPRISE.company;
  });

  const [transactions, setTransactions] = useState<BusinessTransaction[]>(() => {
    const saved = localStorage.getItem('ledgertrack_transactions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return SAMPLE_UGANDA_ENTERPRISE.transactions;
  });

  const [manualJournals, setManualJournals] = useState<JournalEntry[]>([]);
  
  const [budgets, setBudgets] = useState<BudgetCategory[]>(() => {
    const saved = localStorage.getItem('ledgertrack_budgets');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return SAMPLE_UGANDA_ENTERPRISE.budgets;
  });

  // Modal controls
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<BusinessTransaction | null>(null);
  const [isManualJournalModalOpen, setIsManualJournalModalOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);

  // Persist user changes to localStorage
  useEffect(() => {
    localStorage.setItem('ledgertrack_company', JSON.stringify(company));
  }, [company]);

  useEffect(() => {
    localStorage.setItem('ledgertrack_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('ledgertrack_budgets', JSON.stringify(budgets));
  }, [budgets]);

  // 1. Accounting Engine Real-Time Derivations
  const accounts = useMemo(() => {
    return calculateAccountBalances(transactions, manualJournals, DEFAULT_CHART_OF_ACCOUNTS);
  }, [transactions, manualJournals]);

  const allJournalEntries = useMemo(() => {
    return getAllJournalEntries(transactions, manualJournals);
  }, [transactions, manualJournals]);

  const incomeStatement = useMemo(() => {
    return generateIncomeStatement(accounts, transactions);
  }, [accounts, transactions]);

  const balanceSheet = useMemo(() => {
    return generateBalanceSheet(accounts, incomeStatement.netIncome);
  }, [accounts, incomeStatement.netIncome]);

  const trialBalance = useMemo(() => {
    return generateTrialBalance(accounts);
  }, [accounts]);

  const cashFlow = useMemo(() => {
    return generateCashFlowStatement(accounts, transactions, incomeStatement.netIncome);
  }, [accounts, transactions, incomeStatement.netIncome]);

  const kpis = useMemo(() => {
    return calculateFinancialKPIs(accounts, incomeStatement, balanceSheet, transactions);
  }, [accounts, incomeStatement, balanceSheet, transactions]);

  const ledgerActivities = useMemo(() => {
    return generateLedgerActivities(accounts, allJournalEntries);
  }, [accounts, allJournalEntries]);

  const syncedBudgets = useMemo(() => {
    return syncBudgetsWithTransactions(budgets, transactions);
  }, [budgets, transactions]);

  // Serialized Financial Context for AI
  const financialContext = useMemo(() => {
    return `
Company: ${company.name} (${company.industry}, ${company.entityType})
Currency: ${company.currency}
Total Revenue: ${company.currencySymbol}${incomeStatement.totalRevenue.toLocaleString()}
Gross Profit: ${company.currencySymbol}${incomeStatement.grossProfit.toLocaleString()} (${incomeStatement.grossMargin}%)
Operating Expenses: ${company.currencySymbol}${incomeStatement.totalOperatingExpenses.toLocaleString()}
Net Income: ${company.currencySymbol}${incomeStatement.netIncome.toLocaleString()} (${incomeStatement.netMargin}%)
Cash & Equivalents: ${company.currencySymbol}${balanceSheet.assets.totalCurrent.toLocaleString()}
Total Assets: ${company.currencySymbol}${balanceSheet.assets.totalAssets.toLocaleString()}
Total Liabilities: ${company.currencySymbol}${balanceSheet.liabilities.totalCurrent.toLocaleString()}
Total Shareholder Equity: ${company.currencySymbol}${balanceSheet.equity.totalEquity.toLocaleString()}
Runway: ${kpis.runwayMonths} months (Monthly Burn: ${company.currencySymbol}${kpis.monthlyBurnRate.toLocaleString()})
Current Liquidity Ratio: ${kpis.currentRatio}x
Financial Health Score: ${kpis.financialHealthScore}/100
Transactions Count: ${transactions.length}
`;
  }, [company, incomeStatement, balanceSheet, kpis, transactions]);

  // Handlers for Transactions
  const handleSaveTransaction = (tx: BusinessTransaction) => {
    setTransactions((prev) => {
      const existsIndex = prev.findIndex((t) => t.id === tx.id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = tx;
        return updated;
      }
      return [tx, ...prev];
    });
    setEditTransaction(null);
  };

  const handleEditTransaction = (tx: BusinessTransaction) => {
    setEditTransaction(tx);
    setIsTransactionModalOpen(true);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction? This will reverse its double-entry journal posting.')) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === 'paid' ? 'pending' : 'paid';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const handleSettleTransaction = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'paid' } : t))
    );
  };

  // Handler for Manual Journal Entry
  const handleSaveManualJournal = (entry: JournalEntry) => {
    setManualJournals((prev) => [entry, ...prev]);
  };

  // Handler for Presets / Restore
  const handleLoadPreset = (preset: {
    company: CompanyProfile;
    transactions: BusinessTransaction[];
    budgets: BudgetCategory[];
  }) => {
    setCompany(preset.company);
    setTransactions(preset.transactions);
    setBudgets(preset.budgets);
    setManualJournals([]);
    setActiveTab('overview');
  };

  const handleImportData = (data: any) => {
    if (data.company) setCompany(data.company);
    if (data.transactions) setTransactions(data.transactions);
    if (data.journalEntries) setManualJournals(data.journalEntries);
    if (data.budgets) setBudgets(data.budgets);
  };

  const getPageTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'overview':
        return 'Financial Performance Overview';
      case 'transactions':
        return 'Business Expenses & Transactions';
      case 'invoices_bills':
        return 'Accounts Receivable (A/R) & Accounts Payable (A/P)';
      case 'statements':
        return 'Financial Statements & Reports';
      case 'ledgers':
        return 'General Ledger & T-Accounts';
      case 'journal':
        return 'General Journal of Original Entry';
      case 'reports_ai':
        return 'AI Autonomous CFO Reports';
      case 'budgets':
        return 'Departmental Budgets & Expense Limits';
      case 'coa':
        return 'Master Chart of Accounts (COA)';
      default:
        return 'Financial Dashboard';
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* High Density Left Sidebar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        company={company}
        onOpenCompanyModal={() => setIsCompanyModalOpen(true)}
        onOpenNewTransactionModal={() => {
          setEditTransaction(null);
          setIsTransactionModalOpen(true);
        }}
        onOpenManualJournalModal={() => setIsManualJournalModalOpen(true)}
        onOpenAIChatModal={() => setIsAIChatOpen(true)}
        isBalanced={balanceSheet.isBalanced}
        variance={balanceSheet.variance}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        {/* High Density Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 md:px-8 flex-shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-semibold text-slate-800 tracking-tight truncate">
              {getPageTitle(activeTab)}
            </h1>
          </div>

          {/* Quick Header Actions & Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Fiscal Period Capsule */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md text-xs text-slate-600 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>FY 2026 • Q1-Q3 Active</span>
            </div>

            {/* Balanced Indicator Badge */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                balanceSheet.isBalanced
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {balanceSheet.isBalanced ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Balanced (Dr = Cr)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Var: {company.currencySymbol}{balanceSheet.variance.toFixed(2)}</span>
                </>
              )}
            </div>

            {/* Ask AI Virtual CFO */}
            <button
              onClick={() => setIsAIChatOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer shadow-2xs"
            >
              <Bot className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Ask AI CFO</span>
            </button>

            {/* Add Transaction Button */}
            <button
              onClick={() => {
                setEditTransaction(null);
                setIsTransactionModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-md text-xs font-medium shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Entry</span>
            </button>
          </div>
        </header>

        {/* Viewport Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {activeTab === 'overview' && (
            <OverviewDashboard
              kpis={kpis}
              incomeStatement={incomeStatement}
              balanceSheet={balanceSheet}
              transactions={transactions}
              budgets={syncedBudgets}
              company={company}
              setActiveTab={setActiveTab}
              onOpenNewTransactionModal={() => {
                setEditTransaction(null);
                setIsTransactionModalOpen(true);
              }}
              onGenerateReport={() => setActiveTab('reports_ai')}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionList
              transactions={transactions}
              company={company}
              onOpenNewTransactionModal={() => {
                setEditTransaction(null);
                setIsTransactionModalOpen(true);
              }}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onToggleStatus={handleToggleStatus}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'invoices_bills' && (
            <InvoicesBillsView
              transactions={transactions}
              company={company}
              onOpenNewTransactionModal={() => {
                setEditTransaction(null);
                setIsTransactionModalOpen(true);
              }}
              onSettleTransaction={handleSettleTransaction}
            />
          )}

          {activeTab === 'statements' && (
            <FinancialStatementsView
              incomeStatement={incomeStatement}
              balanceSheet={balanceSheet}
              trialBalance={trialBalance}
              cashFlow={cashFlow}
              company={company}
            />
          )}

          {activeTab === 'ledgers' && (
            <GeneralLedgerView
              ledgerActivities={ledgerActivities}
              company={company}
            />
          )}

          {activeTab === 'journal' && (
            <GeneralJournalView
              journalEntries={allJournalEntries}
              company={company}
              onOpenManualJournalModal={() => setIsManualJournalModalOpen(true)}
            />
          )}

          {activeTab === 'reports_ai' && (
            <AIReportingView
              kpis={kpis}
              incomeStatement={incomeStatement}
              balanceSheet={balanceSheet}
              cashFlow={cashFlow}
              company={company}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetManagerView
              budgets={syncedBudgets}
              company={company}
            />
          )}

          {activeTab === 'coa' && (
            <ChartOfAccountsView
              accounts={accounts}
              company={company}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditTransaction(null);
        }}
        onSave={handleSaveTransaction}
        editTransaction={editTransaction}
        company={company}
      />

      <ManualJournalModal
        isOpen={isManualJournalModalOpen}
        onClose={() => setIsManualJournalModalOpen(false)}
        onSave={handleSaveManualJournal}
        accounts={accounts}
        company={company}
      />

      <AIChatModal
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        company={company}
        kpis={kpis}
        financialContext={financialContext}
      />

      <CompanyProfileModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        company={company}
        onSaveCompany={(updated) => setCompany(updated)}
        onLoadPreset={handleLoadPreset}
        allAppData={{
          company,
          transactions,
          journalEntries: manualJournals,
          budgets: syncedBudgets,
        }}
        onImportData={handleImportData}
      />
    </div>
  );
}
