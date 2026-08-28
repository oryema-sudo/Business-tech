export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
export type NormalBalance = 'DEBIT' | 'CREDIT';

export type AccountSubType = 
  | 'CURRENT_ASSET' 
  | 'NON_CURRENT_ASSET'
  | 'CURRENT_LIABILITY' 
  | 'NON_CURRENT_LIABILITY'
  | 'EQUITY'
  | 'OPERATING_REVENUE'
  | 'OTHER_REVENUE'
  | 'COGS'
  | 'OPERATING_EXPENSE'
  | 'TAX_EXPENSE';

export interface Account {
  id: string;
  code: string; // e.g., "1010", "1200", "2010", "4010", "6010"
  name: string;
  type: AccountType;
  subType: AccountSubType;
  subCategory?: string;
  normalBalance: NormalBalance;
  description: string;
  isSystemAccount?: boolean;
  currentBalance: number;
}

export interface JournalEntryLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  memo?: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string; // e.g. "JE-2026-001"
  date: string; // YYYY-MM-DD
  description: string;
  reference?: string; // invoice #, receipt #, check #
  sourceType: 'manual' | 'expense' | 'revenue' | 'invoice' | 'bill' | 'asset' | 'transfer' | 'equity' | 'owner_equity' | 'asset_purchase';
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  status: 'posted' | 'draft';
  createdAt: string;
}

export type TransactionType = 'expense' | 'revenue' | 'invoice' | 'bill' | 'asset_purchase' | 'transfer' | 'owner_equity';

export interface BusinessTransaction {
  id: string;
  date: string;
  type: TransactionType;
  description: string;
  entityName: string; // Vendor, Client, Bank, etc.
  category: string;
  amount: number;
  paymentMethod: 'operating_bank' | 'cash' | 'credit_card' | 'accounts_receivable' | 'accounts_payable';
  status: 'paid' | 'pending' | 'overdue';
  dueDate?: string;
  taxDeductible?: boolean;
  taxRate?: number;
  taxAmount?: number;
  receiptName?: string;
  notes?: string;
  journalEntryId?: string;
}

export interface Budget {
  id: string;
  category: string;
  accountCode: string;
  monthlyLimit: number;
  period: string; // "2026-08" or "monthly"
}

export interface BudgetCategory {
  id: string;
  name: string;
  category: string;
  allocated: number;
  spent: number;
  period: string;
}

export interface CompanyProfile {
  id?: string;
  name: string;
  industry: string;
  currency: string;
  currencySymbol: string;
  entityType?: string;
  taxId?: string;
  taxNumber?: string;
  address?: string;
  accountingMethod?: 'accrual' | 'cash';
  fiscalYearStart?: string; // "01-01"
}

// Financial Statement Structures
export interface IncomeStatementReport {
  revenue: { code: string; name: string; amount: number }[];
  totalRevenue: number;
  cogs: { code: string; name: string; amount: number }[];
  totalCogs: number;
  grossProfit: number;
  grossMargin: number;
  operatingExpenses: { code: string; name: string; amount: number; category?: string }[];
  totalOperatingExpenses: number;
  operatingIncome: number;
  operatingMargin: number;
  taxExpense: number;
  netIncome: number;
  netMargin: number;
}

export interface BalanceSheetReport {
  assets: {
    current: { code: string; name: string; amount: number }[];
    totalCurrent: number;
    nonCurrent: { code: string; name: string; amount: number }[];
    totalNonCurrent: number;
    totalAssets: number;
  };
  liabilities: {
    current: { code: string; name: string; amount: number }[];
    totalCurrent: number;
    nonCurrent: { code: string; name: string; amount: number }[];
    totalNonCurrent: number;
    totalLiabilities: number;
  };
  equity: {
    items: { code: string; name: string; amount: number }[];
    retainedEarnings: number;
    currentPeriodEarnings: number;
    totalEquity: number;
  };
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
  variance: number;
}

export interface TrialBalanceRow {
  accountCode: string;
  accountName: string;
  type: AccountType;
  debit: number;
  credit: number;
}

export interface TrialBalanceReport {
  rows: TrialBalanceRow[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  asOfDate: string;
}

export interface CashFlowReport {
  operatingActivities: { description: string; amount: number }[];
  netOperatingCash: number;
  investingActivities: { description: string; amount: number }[];
  netInvestingCash: number;
  financingActivities: { description: string; amount: number }[];
  netFinancingCash: number;
  netChangeInCash: number;
  beginningCash: number;
  endingCash: number;
}

export interface LedgerAccountActivity {
  account: Account;
  openingBalance: number;
  entries: {
    journalEntryId: string;
    entryNumber: string;
    date: string;
    description: string;
    debit: number;
    credit: number;
    runningBalance: number;
  }[];
  closingBalance: number;
}

export interface FinancialKPIs {
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  netIncome: number;
  netMargin: number;
  netProfitMargin: number;
  grossMargin: number;
  grossProfitMargin: number;
  cashBalance: number;
  cashOnHand: number;
  currentRatio: number;
  quickRatio: number;
  workingCapital: number;
  debtToEquity: number;
  debtToEquityRatio: number;
  monthlyBurnRate: number;
  runwayMonths: number;
  accountsReceivable: number;
  accountsPayable: number;
  financialHealthScore: number;
  daysSalesOutstanding: number;
  dso: number;
}
