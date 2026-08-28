import {
  Account,
  BusinessTransaction,
  JournalEntry,
  JournalEntryLine,
  IncomeStatementReport,
  BalanceSheetReport,
  TrialBalanceReport,
  TrialBalanceRow,
  CashFlowReport,
  LedgerAccountActivity,
  FinancialKPIs,
  BudgetCategory,
} from '../types/accounting';
import { DEFAULT_CHART_OF_ACCOUNTS } from '../data/defaultChartOfAccounts';

/**
 * Maps a business transaction to standard GAAP double-entry journal entries
 */
export function convertTransactionToJournalEntry(
  tx: BusinessTransaction,
  accounts: Account[] = DEFAULT_CHART_OF_ACCOUNTS
): JournalEntry {
  const lines: JournalEntryLine[] = [];
  const findAccByCode = (code: string) => accounts.find((a) => a.code === code);
  const findAccByNameOrCategory = (cat: string) =>
    accounts.find(
      (a) =>
        a.name.toLowerCase().includes(cat.toLowerCase()) ||
        a.code === cat ||
        cat.toLowerCase().includes(a.name.toLowerCase())
    );

  const bankAcc = findAccByCode('1020') || accounts[1]; // Operating Bank
  const arAcc = findAccByCode('1200') || accounts[3]; // A/R
  const apAcc = findAccByCode('2010') || accounts[6]; // A/P
  const capitalAcc = findAccByCode('3010') || accounts[11]; // Owner's Capital
  const equipmentAcc = findAccByCode('1500') || accounts[5]; // Equipment

  switch (tx.type) {
    case 'expense': {
      // Debit: Expense Account, Credit: Bank / Cash / Credit Card
      const expenseAcc = findAccByNameOrCategory(tx.category) || findAccByCode('6090') || accounts[15];
      lines.push({
        id: `line-${tx.id}-1`,
        accountId: expenseAcc.id,
        accountCode: expenseAcc.code,
        accountName: expenseAcc.name,
        debit: tx.amount,
        credit: 0,
        memo: tx.description,
      });

      const paymentAcc =
        tx.paymentMethod === 'cash'
          ? findAccByCode('1010') || bankAcc
          : tx.paymentMethod === 'credit_card'
          ? findAccByCode('2020') || bankAcc
          : bankAcc;

      lines.push({
        id: `line-${tx.id}-2`,
        accountId: paymentAcc.id,
        accountCode: paymentAcc.code,
        accountName: paymentAcc.name,
        debit: 0,
        credit: tx.amount,
        memo: `Paid to ${tx.entityName}`,
      });
      break;
    }

    case 'revenue': {
      // Debit: Bank / Cash, Credit: Revenue Account
      const revenueAcc = findAccByNameOrCategory(tx.category) || findAccByCode('4010') || accounts[12];
      const depositAcc = tx.paymentMethod === 'cash' ? findAccByCode('1010') || bankAcc : bankAcc;

      lines.push({
        id: `line-${tx.id}-1`,
        accountId: depositAcc.id,
        accountCode: depositAcc.code,
        accountName: depositAcc.name,
        debit: tx.amount,
        credit: 0,
        memo: `Receipt from ${tx.entityName}`,
      });

      lines.push({
        id: `line-${tx.id}-2`,
        accountId: revenueAcc.id,
        accountCode: revenueAcc.code,
        accountName: revenueAcc.name,
        debit: 0,
        credit: tx.amount,
        memo: tx.description,
      });
      break;
    }

    case 'invoice': {
      // Debit: Accounts Receivable, Credit: Revenue Account
      const revenueAcc = findAccByNameOrCategory(tx.category) || findAccByCode('4010') || accounts[12];
      lines.push({
        id: `line-${tx.id}-1`,
        accountId: arAcc.id,
        accountCode: arAcc.code,
        accountName: arAcc.name,
        debit: tx.amount,
        credit: 0,
        memo: `Billed to ${tx.entityName}`,
      });

      lines.push({
        id: `line-${tx.id}-2`,
        accountId: revenueAcc.id,
        accountCode: revenueAcc.code,
        accountName: revenueAcc.name,
        debit: 0,
        credit: tx.amount,
        memo: tx.description,
      });
      break;
    }

    case 'bill': {
      // Debit: Expense Account, Credit: Accounts Payable
      const expenseAcc = findAccByNameOrCategory(tx.category) || findAccByCode('6090') || accounts[15];
      lines.push({
        id: `line-${tx.id}-1`,
        accountId: expenseAcc.id,
        accountCode: expenseAcc.code,
        accountName: expenseAcc.name,
        debit: tx.amount,
        credit: 0,
        memo: tx.description,
      });

      lines.push({
        id: `line-${tx.id}-2`,
        accountId: apAcc.id,
        accountCode: apAcc.code,
        accountName: apAcc.name,
        debit: 0,
        credit: tx.amount,
        memo: `Bill from ${tx.entityName}`,
      });
      break;
    }

    case 'asset_purchase': {
      // Debit: Fixed Asset, Credit: Bank
      const assetAcc = findAccByNameOrCategory(tx.category) || equipmentAcc;
      lines.push({
        id: `line-${tx.id}-1`,
        accountId: assetAcc.id,
        accountCode: assetAcc.code,
        accountName: assetAcc.name,
        debit: tx.amount,
        credit: 0,
        memo: `Asset acquired: ${tx.description}`,
      });

      lines.push({
        id: `line-${tx.id}-2`,
        accountId: bankAcc.id,
        accountCode: bankAcc.code,
        accountName: bankAcc.name,
        debit: 0,
        credit: tx.amount,
        memo: `Disbursement to ${tx.entityName}`,
      });
      break;
    }

    case 'owner_equity': {
      // Debit: Bank Account, Credit: Owner's Equity Capital
      lines.push({
        id: `line-${tx.id}-1`,
        accountId: bankAcc.id,
        accountCode: bankAcc.code,
        accountName: bankAcc.name,
        debit: tx.amount,
        credit: 0,
        memo: `Capital Contribution from ${tx.entityName}`,
      });

      lines.push({
        id: `line-${tx.id}-2`,
        accountId: capitalAcc.id,
        accountCode: capitalAcc.code,
        accountName: capitalAcc.name,
        debit: 0,
        credit: tx.amount,
        memo: tx.description,
      });
      break;
    }

    case 'transfer':
    default: {
      const targetAcc = findAccByCode('1010') || accounts[0];
      lines.push({
        id: `line-${tx.id}-1`,
        accountId: targetAcc.id,
        accountCode: targetAcc.code,
        accountName: targetAcc.name,
        debit: tx.amount,
        credit: 0,
        memo: `Transfer In`,
      });

      lines.push({
        id: `line-${tx.id}-2`,
        accountId: bankAcc.id,
        accountCode: bankAcc.code,
        accountName: bankAcc.name,
        debit: 0,
        credit: tx.amount,
        memo: `Transfer Out`,
      });
      break;
    }
  }

  const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = lines.reduce((s, l) => s + l.credit, 0);

  return {
    id: `je-${tx.id}`,
    entryNumber: `JE-${tx.date.replace(/-/g, '')}-${tx.id.slice(-3)}`,
    date: tx.date,
    description: `${tx.entityName} - ${tx.description}`,
    reference: tx.receiptName || tx.id,
    sourceType: tx.type,
    lines,
    totalDebit,
    totalCredit,
    status: 'posted',
    createdAt: new Date().toISOString(),
  };
}

/**
 * Merges automatic transaction journal entries and manual adjusting entries
 */
export function getAllJournalEntries(
  transactions: BusinessTransaction[],
  manualJournals: JournalEntry[] = [],
  accounts: Account[] = DEFAULT_CHART_OF_ACCOUNTS
): JournalEntry[] {
  const autoEntries = transactions.map((tx) => convertTransactionToJournalEntry(tx, accounts));
  return [...autoEntries, ...manualJournals].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Calculates Account balances across all journal entries
 */
export function calculateAccountBalances(
  transactions: BusinessTransaction[] | Account[],
  manualJournalsOrEntries: JournalEntry[] = [],
  baseAccounts: Account[] = DEFAULT_CHART_OF_ACCOUNTS
): Account[] {
  let allEntries: JournalEntry[] = [];
  let accountsToUse = [...baseAccounts];

  if (Array.isArray(transactions) && transactions.length > 0 && 'entityName' in transactions[0]) {
    // Array of BusinessTransaction
    allEntries = getAllJournalEntries(transactions as BusinessTransaction[], manualJournalsOrEntries, baseAccounts);
  } else if (Array.isArray(transactions) && transactions.length > 0 && 'code' in transactions[0]) {
    // Array of Account
    accountsToUse = transactions as Account[];
    allEntries = manualJournalsOrEntries;
  }

  const balanceMap = new Map<string, { debitTotal: number; creditTotal: number; netBalance: number }>();

  for (const acc of accountsToUse) {
    balanceMap.set(acc.code, { debitTotal: 0, creditTotal: 0, netBalance: 0 });
  }

  for (const entry of allEntries) {
    if (entry.status !== 'posted') continue;
    for (const line of entry.lines) {
      let b = balanceMap.get(line.accountCode);
      if (!b) {
        b = { debitTotal: 0, creditTotal: 0, netBalance: 0 };
        balanceMap.set(line.accountCode, b);
      }
      b.debitTotal += line.debit;
      b.creditTotal += line.credit;
    }
  }

  return accountsToUse.map((acc) => {
    const b = balanceMap.get(acc.code);
    let net = 0;
    if (b) {
      if (acc.normalBalance === 'DEBIT') {
        net = b.debitTotal - b.creditTotal;
      } else {
        net = b.creditTotal - b.debitTotal;
      }
    }
    return {
      ...acc,
      currentBalance: net,
    };
  });
}

/**
 * Generates General Ledger T-Accounts
 */
export function generateLedgerActivities(
  accounts: Account[],
  journalEntries: JournalEntry[]
): LedgerAccountActivity[] {
  const sortedEntries = [...journalEntries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return accounts.map((acc) => {
    let runningBalance = 0;
    const entries: LedgerAccountActivity['entries'] = [];

    for (const je of sortedEntries) {
      if (je.status !== 'posted') continue;
      for (const line of je.lines) {
        if (line.accountCode === acc.code) {
          if (acc.normalBalance === 'DEBIT') {
            runningBalance += line.debit - line.credit;
          } else {
            runningBalance += line.credit - line.debit;
          }

          entries.push({
            journalEntryId: je.id,
            entryNumber: je.entryNumber,
            date: je.date,
            description: line.memo || je.description,
            debit: line.debit,
            credit: line.credit,
            runningBalance,
          });
        }
      }
    }

    return {
      account: acc,
      openingBalance: 0,
      entries,
      closingBalance: runningBalance,
    };
  });
}

/**
 * Generates Trial Balance
 */
export function generateTrialBalance(
  accounts: Account[],
  asOfDate: string = new Date().toISOString().split('T')[0]
): TrialBalanceReport {
  const rows: TrialBalanceRow[] = [];
  let totalDebit = 0;
  let totalCredit = 0;

  for (const acc of accounts) {
    const bal = acc.currentBalance;
    if (bal === 0) continue;

    let debitCol = 0;
    let creditCol = 0;

    if (acc.normalBalance === 'DEBIT') {
      if (bal >= 0) {
        debitCol = bal;
      } else {
        creditCol = Math.abs(bal);
      }
    } else {
      if (bal >= 0) {
        creditCol = bal;
      } else {
        debitCol = Math.abs(bal);
      }
    }

    totalDebit += debitCol;
    totalCredit += creditCol;

    rows.push({
      accountCode: acc.code,
      accountName: acc.name,
      type: acc.type,
      debit: debitCol,
      credit: creditCol,
    });
  }

  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return {
    rows,
    totalDebit,
    totalCredit,
    isBalanced,
    asOfDate,
  };
}

/**
 * Generates Income Statement (P&L)
 */
export function generateIncomeStatement(
  accounts: Account[],
  transactions?: BusinessTransaction[]
): IncomeStatementReport {
  const revenue: IncomeStatementReport['revenue'] = [];
  let totalRevenue = 0;

  const cogs: IncomeStatementReport['cogs'] = [];
  let totalCogs = 0;

  const operatingExpenses: IncomeStatementReport['operatingExpenses'] = [];
  let totalOperatingExpenses = 0;

  let taxExpense = 0;

  for (const acc of accounts) {
    const bal = acc.currentBalance;
    if (bal === 0) continue;

    if (acc.type === 'REVENUE') {
      revenue.push({ code: acc.code, name: acc.name, amount: bal });
      totalRevenue += bal;
    } else if (acc.type === 'EXPENSE') {
      if (acc.subCategory === 'COGS') {
        cogs.push({ code: acc.code, name: acc.name, amount: bal });
        totalCogs += bal;
      } else if (acc.subCategory === 'TAX_EXPENSE') {
        taxExpense += bal;
      } else {
        operatingExpenses.push({
          code: acc.code,
          name: acc.name,
          amount: bal,
          category: acc.name,
        });
        totalOperatingExpenses += bal;
      }
    }
  }

  const grossProfit = totalRevenue - totalCogs;
  const grossMargin = totalRevenue > 0 ? Number(((grossProfit / totalRevenue) * 100).toFixed(1)) : 0;

  const operatingIncome = grossProfit - totalOperatingExpenses;
  const operatingMargin = totalRevenue > 0 ? Number(((operatingIncome / totalRevenue) * 100).toFixed(1)) : 0;

  const netIncome = operatingIncome - taxExpense;
  const netMargin = totalRevenue > 0 ? Number(((netIncome / totalRevenue) * 100).toFixed(1)) : 0;

  return {
    revenue,
    totalRevenue,
    cogs,
    totalCogs,
    grossProfit,
    grossMargin,
    operatingExpenses,
    totalOperatingExpenses,
    operatingIncome,
    operatingMargin,
    taxExpense,
    netIncome,
    netMargin,
  };
}

/**
 * Generates Balance Sheet
 */
export function generateBalanceSheet(
  accounts: Account[],
  currentPeriodEarnings: number = 0
): BalanceSheetReport {
  const currentAssets: { code: string; name: string; amount: number }[] = [];
  let totalCurrentAssets = 0;

  const nonCurrentAssets: { code: string; name: string; amount: number }[] = [];
  let totalNonCurrentAssets = 0;

  const currentLiab: { code: string; name: string; amount: number }[] = [];
  let totalCurrentLiab = 0;

  const nonCurrentLiab: { code: string; name: string; amount: number }[] = [];
  let totalNonCurrentLiab = 0;

  const equityItems: { code: string; name: string; amount: number }[] = [];
  let totalEquityItems = 0;

  for (const acc of accounts) {
    const bal = acc.currentBalance;
    if (bal === 0) continue;

    if (acc.type === 'ASSET') {
      if (acc.subCategory === 'CURRENT_ASSET' || acc.code.startsWith('10') || acc.code.startsWith('11') || acc.code.startsWith('12')) {
        currentAssets.push({ code: acc.code, name: acc.name, amount: bal });
        totalCurrentAssets += bal;
      } else {
        nonCurrentAssets.push({ code: acc.code, name: acc.name, amount: bal });
        totalNonCurrentAssets += bal;
      }
    } else if (acc.type === 'LIABILITY') {
      if (acc.subCategory === 'CURRENT_LIABILITY' || acc.code.startsWith('20') || acc.code.startsWith('21')) {
        currentLiab.push({ code: acc.code, name: acc.name, amount: bal });
        totalCurrentLiab += bal;
      } else {
        nonCurrentLiab.push({ code: acc.code, name: acc.name, amount: bal });
        totalNonCurrentLiab += bal;
      }
    } else if (acc.type === 'EQUITY') {
      equityItems.push({ code: acc.code, name: acc.name, amount: bal });
      totalEquityItems += bal;
    }
  }

  const totalAssets = totalCurrentAssets + totalNonCurrentAssets;
  const totalLiabilities = totalCurrentLiab + totalNonCurrentLiab;

  const retainedEarnings = 0;
  const totalEquity = totalEquityItems + retainedEarnings + currentPeriodEarnings;

  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
  const variance = Math.abs(totalAssets - totalLiabilitiesAndEquity);
  const isBalanced = variance < 0.01;

  return {
    assets: {
      current: currentAssets,
      totalCurrent: totalCurrentAssets,
      nonCurrent: nonCurrentAssets,
      totalNonCurrent: totalNonCurrentAssets,
      totalAssets,
    },
    liabilities: {
      current: currentLiab,
      totalCurrent: totalCurrentLiab,
      nonCurrent: nonCurrentLiab,
      totalNonCurrent: totalNonCurrentLiab,
      totalLiabilities,
    },
    equity: {
      items: equityItems,
      retainedEarnings,
      currentPeriodEarnings,
      totalEquity,
    },
    totalLiabilitiesAndEquity,
    isBalanced,
    variance,
  };
}

/**
 * Generates Cash Flow Statement
 */
export function generateCashFlowStatement(
  accounts: Account[],
  transactions: BusinessTransaction[],
  netIncome: number
): CashFlowReport {
  const operatingActivities: { description: string; amount: number }[] = [];
  operatingActivities.push({
    description: 'Net Operating Income (Accrual basis)',
    amount: netIncome,
  });

  const arAcc = accounts.find((a) => a.code === '1200');
  if (arAcc && arAcc.currentBalance !== 0) {
    operatingActivities.push({
      description: 'Change in Accounts Receivable (A/R)',
      amount: -arAcc.currentBalance,
    });
  }

  const apAcc = accounts.find((a) => a.code === '2010');
  if (apAcc && apAcc.currentBalance !== 0) {
    operatingActivities.push({
      description: 'Change in Accounts Payable (A/P)',
      amount: apAcc.currentBalance,
    });
  }

  const netOperatingCash = operatingActivities.reduce((s, a) => s + a.amount, 0);

  const investingActivities: { description: string; amount: number }[] = [];
  const equipAcc = accounts.find((a) => a.code === '1500');
  if (equipAcc && equipAcc.currentBalance !== 0) {
    investingActivities.push({
      description: 'Capital Expenditures (Equipment & Hardware)',
      amount: -equipAcc.currentBalance,
    });
  }
  const netInvestingCash = investingActivities.reduce((s, a) => s + a.amount, 0);

  const financingActivities: { description: string; amount: number }[] = [];
  const capitalAcc = accounts.find((a) => a.code === '3010');
  if (capitalAcc && capitalAcc.currentBalance !== 0) {
    financingActivities.push({
      description: "Owner's Equity Capital Contributions",
      amount: capitalAcc.currentBalance,
    });
  }
  const netFinancingCash = financingActivities.reduce((s, a) => s + a.amount, 0);

  const netChangeInCash = netOperatingCash + netInvestingCash + netFinancingCash;
  const beginningCash = 0;

  const cash1010 = accounts.find((a) => a.code === '1010')?.currentBalance || 0;
  const cash1020 = accounts.find((a) => a.code === '1020')?.currentBalance || 0;
  const cash1030 = accounts.find((a) => a.code === '1030')?.currentBalance || 0;
  const endingCash = cash1010 + cash1020 + cash1030;

  return {
    operatingActivities,
    netOperatingCash,
    investingActivities,
    netInvestingCash,
    financingActivities,
    netFinancingCash,
    netChangeInCash,
    beginningCash,
    endingCash,
  };
}

/**
 * Calculates Comprehensive Financial KPIs
 */
export function calculateFinancialKPIs(
  accounts: Account[],
  incomeStatement: IncomeStatementReport,
  balanceSheet: BalanceSheetReport,
  transactions: BusinessTransaction[]
): FinancialKPIs {
  const cash1010 = accounts.find((a) => a.code === '1010')?.currentBalance || 0;
  const cash1020 = accounts.find((a) => a.code === '1020')?.currentBalance || 0;
  const cash1030 = accounts.find((a) => a.code === '1030')?.currentBalance || 0;
  const cashBalance = cash1010 + cash1020 + cash1030;

  const arBalance = accounts.find((a) => a.code === '1200')?.currentBalance || 0;
  const apBalance = accounts.find((a) => a.code === '2010')?.currentBalance || 0;

  const currentAssets = balanceSheet.assets.totalCurrent;
  const currentLiabilities = Math.max(balanceSheet.liabilities.totalCurrent, 1);

  const currentRatio = Number((currentAssets / currentLiabilities).toFixed(2));
  const quickRatio = Number(((cashBalance + arBalance) / currentLiabilities).toFixed(2));
  const workingCapital = currentAssets - balanceSheet.liabilities.totalCurrent;

  const debtToEquity =
    balanceSheet.equity.totalEquity > 0
      ? Number((balanceSheet.liabilities.totalLiabilities / balanceSheet.equity.totalEquity).toFixed(2))
      : 0;

  const monthlyExpenses = incomeStatement.totalOperatingExpenses + incomeStatement.totalCogs;
  const monthlyBurnRate = monthlyExpenses > 0 ? Math.round(monthlyExpenses / 3) : 1;
  const runwayMonths =
    monthlyBurnRate > 0 ? Number((cashBalance / monthlyBurnRate).toFixed(1)) : 99;

  const dso =
    incomeStatement.totalRevenue > 0 ? Math.round((arBalance / incomeStatement.totalRevenue) * 90) : 0;

  // Compute 0-100 financial health score
  let score = 70;
  if (currentRatio >= 2.0) score += 10;
  else if (currentRatio < 1.0) score -= 15;

  if (incomeStatement.netMargin >= 20) score += 10;
  else if (incomeStatement.netMargin < 0) score -= 15;

  if (runwayMonths >= 12) score += 10;
  else if (runwayMonths < 3) score -= 20;

  const financialHealthScore = Math.min(Math.max(score, 10), 100);

  return {
    totalRevenue: incomeStatement.totalRevenue,
    totalExpenses: incomeStatement.totalOperatingExpenses + incomeStatement.totalCogs + incomeStatement.taxExpense,
    grossProfit: incomeStatement.grossProfit,
    netIncome: incomeStatement.netIncome,
    netMargin: incomeStatement.netMargin,
    netProfitMargin: incomeStatement.netMargin,
    grossMargin: incomeStatement.grossMargin,
    grossProfitMargin: incomeStatement.grossMargin,
    cashBalance,
    cashOnHand: cashBalance,
    currentRatio,
    quickRatio,
    workingCapital,
    debtToEquity,
    debtToEquityRatio: debtToEquity,
    monthlyBurnRate,
    runwayMonths,
    accountsReceivable: arBalance,
    accountsPayable: apBalance,
    financialHealthScore,
    daysSalesOutstanding: dso,
    dso,
  };
}

/**
 * Syncs budget categories with live transaction spending
 */
export function syncBudgetsWithTransactions(
  budgets: BudgetCategory[],
  transactions: BusinessTransaction[]
): BudgetCategory[] {
  return budgets.map((b) => {
    const totalSpent = transactions
      .filter((t) => t.type === 'expense' && (t.category === b.category || b.name.includes(t.category)))
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      ...b,
      spent: totalSpent,
    };
  });
}
