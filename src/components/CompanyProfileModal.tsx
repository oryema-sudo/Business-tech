import React, { useState } from 'react';
import {
  X,
  Building2,
  Download,
  Upload,
  Layers,
  Save,
  CheckCircle2,
  RefreshCw,
  Database,
  Coins,
  Globe,
  DollarSign,
  Check,
} from 'lucide-react';
import { CompanyProfile, BusinessTransaction, JournalEntry, BudgetCategory } from '../types/accounting';
import {
  SAMPLE_UGANDA_ENTERPRISE,
  SAMPLE_TECH_STARTUP,
  SAMPLE_CONSULTING_AGENCY,
  SAMPLE_RETAIL_BIZ,
  SUPPORTED_CURRENCIES,
  SupportedCurrency,
} from '../data/sampleCompanyData';

interface CompanyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyProfile;
  onSaveCompany: (updated: CompanyProfile) => void;
  onLoadPreset: (preset: {
    company: CompanyProfile;
    transactions: BusinessTransaction[];
    budgets: BudgetCategory[];
  }) => void;
  allAppData: {
    company: CompanyProfile;
    transactions: BusinessTransaction[];
    journalEntries: JournalEntry[];
    budgets: BudgetCategory[];
  };
  onImportData: (importedData: any) => void;
}

export const CompanyProfileModal: React.FC<CompanyProfileModalProps> = ({
  isOpen,
  onClose,
  company,
  onSaveCompany,
  onLoadPreset,
  allAppData,
  onImportData,
}) => {
  const [formData, setFormData] = useState<CompanyProfile>(company);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allAppData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `${formData.name.toLowerCase().replace(/\s+/g, '-')}-accounting-ledger-backup.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.company && parsed.transactions) {
            onImportData(parsed);
            alert('Ledger, chart of accounts and transactions successfully restored from backup!');
            onClose();
          } else {
            alert('Invalid backup file format. Expected JSON containing company and transactions.');
          }
        } catch (err) {
          alert('Failed to parse JSON file.');
        }
      };
    }
  };

  const handleSelectCurrencyPreset = (curr: SupportedCurrency) => {
    setFormData((prev) => ({
      ...prev,
      currency: curr.code,
      currencySymbol: curr.symbol,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCompany(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const currentCurrency = formData.currency || 'UGX';
  const currentSymbol = formData.currencySymbol || 'USh';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Settings & Company Profile</h2>
              <p className="text-[11px] text-slate-500">
                Configure currency (Uganda Shillings / Global), legal structure, and data presets
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

        <div className="p-5 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
          {/* CURRENCY & LOCALIZATION SETTINGS SECTION */}
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-slate-900 text-xs">Reporting & Operating Currency</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                <span>Active: {currentSymbol} ({currentCurrency})</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Select Uganda Shillings (UGX) or switch to any global currency. All general ledgers, trial balances, balance sheets, and P&L statements will dynamically reflect this currency.
            </p>

            {/* Quick Currency Presets (Chips) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Quick Select Currency
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SUPPORTED_CURRENCIES.slice(0, 8).map((c) => {
                  const isSelected = formData.currency === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleSelectCurrencyPreset(c)}
                      className={`flex items-center justify-between p-2 rounded-lg border text-left transition-all cursor-pointer shadow-2xs ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white font-semibold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-50/60 hover:border-indigo-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm">{c.flag}</span>
                        <div className="truncate">
                          <div className="text-[11px] font-bold leading-tight truncate">{c.code}</div>
                          <div className={`text-[9px] truncate ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                            {c.symbol}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-3 h-3 text-white shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Full Currency Dropdown + Custom Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Currency Preset List</label>
                <select
                  value={formData.currency}
                  onChange={(e) => {
                    const found = SUPPORTED_CURRENCIES.find((c) => c.code === e.target.value);
                    if (found) {
                      handleSelectCurrencyPreset(found);
                    } else {
                      setFormData({ ...formData, currency: e.target.value });
                    }
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer font-medium"
                >
                  <optgroup label="East Africa">
                    <option value="UGX">🇺🇬 UGX - Uganda Shilling (USh)</option>
                    <option value="KES">🇰🇪 KES - Kenyan Shilling (KSh)</option>
                    <option value="TZS">🇹🇿 TZS - Tanzanian Shilling (TSh)</option>
                    <option value="RWF">🇷🇼 RWF - Rwandan Franc (FRw)</option>
                  </optgroup>
                  <optgroup label="International Major">
                    <option value="USD">🇺🇸 USD - US Dollar ($)</option>
                    <option value="EUR">🇪🇺 EUR - Euro (€)</option>
                    <option value="GBP">🇬🇧 GBP - British Pound (£)</option>
                    <option value="NGN">🇳🇬 NGN - Nigerian Naira (₦)</option>
                    <option value="ZAR">🇿🇦 ZAR - South African Rand (R)</option>
                    <option value="CAD">🇨🇦 CAD - Canadian Dollar (CA$)</option>
                    <option value="AUD">🇦🇺 AUD - Australian Dollar (A$)</option>
                    <option value="AED">🇦🇪 AED - UAE Dirham (AED)</option>
                    <option value="INR">🇮🇳 INR - Indian Rupee (₹)</option>
                    <option value="CNY">🇨🇳 CNY - Chinese Yuan (¥)</option>
                    <option value="JPY">🇯🇵 JPY - Japanese Yen (¥)</option>
                    <option value="CHF">🇨🇭 CHF - Swiss Franc (CHF)</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Currency Code (ISO)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UGX, USD, EUR"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Currency Symbol</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. USh, $, €, £, KSh"
                  value={formData.currencySymbol}
                  onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono font-bold"
                />
              </div>
            </div>

            {/* Live Formatting Preview */}
            <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">Live Format Preview:</span>
              <span className="font-mono font-bold text-indigo-700">
                {currentSymbol} 150,000,000.00 ({currentCurrency})
              </span>
            </div>
          </div>

          {/* Preset Company Switcher */}
          <div className="space-y-2">
            <label className="text-slate-700 font-bold uppercase text-[10px] block">
              Load Preset Industry Business Models
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onLoadPreset(SAMPLE_UGANDA_ENTERPRISE);
                  onClose();
                }}
                className="p-3 rounded-lg bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 text-left transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 group-hover:text-indigo-700">
                    Nile Innovations Ltd (Uganda)
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    UGX (USh)
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Ugandan Tech, Enterprise & AI (Kampala, UG)
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onLoadPreset(SAMPLE_RETAIL_BIZ);
                  onClose();
                }}
                className="p-3 rounded-lg bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 text-left transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 group-hover:text-indigo-700">
                    Apex Goods & Wholesale Ltd
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    UGX (USh)
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Consumer Goods & Regional Distribution (Uganda)
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onLoadPreset(SAMPLE_TECH_STARTUP);
                  onClose();
                }}
                className="p-3 rounded-lg bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 text-left transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 group-hover:text-indigo-700">
                    Nexus AI Inc.
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    USD ($)
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  B2B SaaS / Global Venture Model
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onLoadPreset(SAMPLE_CONSULTING_AGENCY);
                  onClose();
                }}
                className="p-3 rounded-lg bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 text-left transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 group-hover:text-indigo-700">
                    Horizon Advisory Group
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    KES (KSh)
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Strategy Consulting (East Africa)
                </div>
              </button>
            </div>
          </div>

          {/* Edit Company Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 pt-2 border-t border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Legal Entity Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Industry Sector</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Entity Type</label>
                <select
                  value={formData.entityType}
                  onChange={(e) => setFormData({ ...formData, entityType: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
                >
                  <option value="Limited Company (Ltd)">Limited Company (Ltd)</option>
                  <option value="C-Corporation">C-Corporation</option>
                  <option value="S-Corporation">S-Corporation</option>
                  <option value="LLC">LLC (Limited Liability Co)</option>
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                  <option value="Partnership">Partnership</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Tax Identification Number (TIN / EIN)</label>
                <input
                  type="text"
                  placeholder="e.g. TIN-1008492019"
                  value={formData.taxNumber || ''}
                  onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Physical / Registered Office Address</label>
              <input
                type="text"
                placeholder="e.g. Nakasero, Kampala, Uganda"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                {savedSuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <Save className="w-3.5 h-3.5" />}
                <span>{savedSuccess ? 'Settings Saved!' : 'Save Settings & Currency'}</span>
              </button>
            </div>
          </form>

          {/* Backup & Restore Section */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-500" />
              <span className="font-bold text-slate-800 text-xs">Accounting Database Backup & Restore</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Export all general ledgers, journals, and transactions to JSON or restore a previous session.
            </p>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Full Backup JSON</span>
              </button>

              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium cursor-pointer shadow-2xs">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Restore Backup File</span>
                <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
