import React from 'react';
import {
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  BookOpen,
  Scale,
  Sparkles,
  Sliders,
  Building2,
  FileText,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Plus,
  Bot,
  Layers,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { CompanyProfile } from '../types/accounting';

export type ActiveTab =
  | 'overview'
  | 'transactions'
  | 'invoices_bills'
  | 'statements'
  | 'ledgers'
  | 'journal'
  | 'reports_ai'
  | 'budgets'
  | 'coa';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  company: CompanyProfile;
  onOpenCompanyModal: () => void;
  onOpenNewTransactionModal: () => void;
  onOpenManualJournalModal: () => void;
  onOpenAIChatModal: () => void;
  isBalanced: boolean;
  variance: number;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  company,
  onOpenCompanyModal,
  onOpenNewTransactionModal,
  onOpenManualJournalModal,
  onOpenAIChatModal,
  isBalanced,
  variance,
  mobileMenuOpen = false,
  setMobileMenuOpen,
}) => {
  const navSections: {
    title: string;
    items: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[];
  }[] = [
    {
      title: 'Core Operations',
      items: [
        { id: 'overview', label: 'Financial Analytics', icon: <TrendingUp className="w-4 h-4" /> },
        { id: 'transactions', label: 'Transactions & Expenses', icon: <Receipt className="w-4 h-4" /> },
        { id: 'invoices_bills', label: 'A/R & A/P Invoices', icon: <FileText className="w-4 h-4" /> },
      ],
    },
    {
      title: 'GAAP & Financials',
      items: [
        { id: 'statements', label: 'Financial Statements (P&L)', icon: <FileSpreadsheet className="w-4 h-4" /> },
        { id: 'ledgers', label: 'General Ledger (T-Acc)', icon: <BookOpen className="w-4 h-4" /> },
        { id: 'journal', label: 'General Journal (JE)', icon: <Scale className="w-4 h-4" /> },
      ],
    },
    {
      title: 'Intelligence & Master Data',
      items: [
        { id: 'reports_ai', label: 'Automated AI Reports', icon: <Sparkles className="w-4 h-4 text-indigo-600" />, badge: 'AI' },
        { id: 'budgets', label: 'Budgets & Expense Limits', icon: <Sliders className="w-4 h-4" /> },
        { id: 'coa', label: 'Chart of Accounts', icon: <Layers className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <>
      {/* Desktop Sidebar (w-64) */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 h-screen sticky top-0 hidden md:flex z-30">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-sm">
              L
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-slate-900">LEDGER.AI</span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                  GAAP
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Double-Entry Financials</div>
            </div>
          </div>
        </div>

        {/* Grouped Navigation Links */}
        <nav className="flex-1 p-3.5 space-y-4 overflow-y-auto">
          {navSections.map((section, sIdx) => (
            <div key={section.title}>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2.5 pb-1.5">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium text-xs transition-colors cursor-pointer text-left ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-semibold border-l-2 border-indigo-600 shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Sidebar Active Entity Box */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50/60">
          <button
            onClick={onOpenCompanyModal}
            className="w-full flex items-center gap-3 bg-white hover:bg-slate-100/80 p-2.5 rounded-lg border border-slate-200 shadow-2xs transition-all text-left cursor-pointer group"
            title="Click to switch company profile or export/import data"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex-1 overflow-hidden min-w-0">
              <div className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">
                {company.name}
              </div>
              <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                <span className="font-semibold text-indigo-700">{company.currencySymbol || 'USh'} ({company.currency || 'UGX'})</span>
                <span>•</span>
                <span className="text-emerald-600 font-semibold">Active FY26</span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen?.(false)}
          />
          <aside className="relative w-64 bg-white border-r border-slate-200 flex flex-col h-full z-10 shadow-2xl">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-sm">
                  L
                </div>
                <span className="font-bold text-sm tracking-tight text-slate-900">LEDGER.AI</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen?.(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
              {navSections.map((section) => (
                <div key={section.title}>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 pb-1">
                    {section.title}
                  </div>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setMobileMenuOpen?.(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium text-xs text-left ${
                            isActive
                              ? 'bg-indigo-50 text-indigo-700 font-semibold'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {item.icon}
                            <span>{item.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="p-3 border-t border-slate-200">
              <button
                onClick={() => {
                  onOpenCompanyModal();
                  setMobileMenuOpen?.(false);
                }}
                className="w-full flex items-center gap-2.5 bg-slate-100 p-2.5 rounded-lg text-left"
              >
                <Building2 className="w-4 h-4 text-slate-600" />
                <div className="flex-1 truncate text-xs font-bold text-slate-800">
                  {company.name}
                </div>
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
