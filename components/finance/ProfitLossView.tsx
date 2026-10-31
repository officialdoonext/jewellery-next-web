'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  TrendingUp,
  Percent,
  Sparkles,
  Download,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Building,
  Hammer,
  Flame,
  FileSpreadsheet,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

interface FinancialPlStatement {
  id: string;
  statement_period: string;
  sales_revenue: number;
  cogs_bullion: number;
  gross_profit: number;
  operating_expenses: number;
  ebitda: number;
  depreciation_finance: number;
  pbt: number;
  tax_provision: number;
  net_profit: number;
}

const INITIAL_STATEMENTS: FinancialPlStatement[] = [
  {
    id: '66778899-b2c3-d4e5-f6a1-990011223344',
    statement_period: 'Q3 FY2026-27 (Current Oct-Dec)',
    sales_revenue: 284000000.0,
    cogs_bullion: 251000000.0,
    gross_profit: 33000000.0,
    operating_expenses: 3200000.0,
    ebitda: 29800000.0,
    depreciation_finance: 1100000.0,
    pbt: 28700000.0,
    tax_provision: 7200000.0,
    net_profit: 21500000.0,
  },
  {
    id: '66778899-b2c3-d4e5-f6a1-990011223345',
    statement_period: 'Q2 FY2026-27 (Jul-Sep)',
    sales_revenue: 242000000.0,
    cogs_bullion: 214500000.0,
    gross_profit: 27500000.0,
    operating_expenses: 2950000.0,
    ebitda: 24550000.0,
    depreciation_finance: 1050000.0,
    pbt: 23500000.0,
    tax_provision: 5900000.0,
    net_profit: 17600000.0,
  },
  {
    id: '66778899-b2c3-d4e5-f6a1-990011223346',
    statement_period: 'Q1 FY2026-27 (Apr-Jun Akshaya Tritiya)',
    sales_revenue: 312000000.0,
    cogs_bullion: 275000000.0,
    gross_profit: 37000000.0,
    operating_expenses: 3600000.0,
    ebitda: 33400000.0,
    depreciation_finance: 1050000.0,
    pbt: 32350000.0,
    tax_provision: 8100000.0,
    net_profit: 24250000.0,
  },
];

export function FinanceProfitLossView() {
  const [statements, setStatements] = useState<FinancialPlStatement[]>(INITIAL_STATEMENTS);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tree table expandable sections state
  const [showOpexDetails, setShowOpexDetails] = useState(true);
  const [showRevenueDetails, setShowRevenueDetails] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportExcel = () => {
    showToast('Exported Comprehensive Jewellery P&L Statement to Excel format!');
  };

  const handleVarianceView = () => {
    showToast('Comparing Q3 FY26 vs Q3 FY25 (+18.4% YoY net profit growth)');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="financial_pl_statements" />
      <ActionToolbar
        filterPlaceholder="Search statement periods, EBITDA, revenue lines..."
        insertLabel="Export P&L Excel"
        onInsertClick={handleExportExcel}
      />

      {toastMessage && (
        <div className="fixed top-12 right-6 z-50 bg-neutral-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 border border-neutral-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Sales Revenue</span>
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">₹ 28.40 Cr</div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                +14.2% YoY Growth
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Cost of Goods Sold (Bullion)</span>
                <Flame className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">₹ 25.10 Cr</div>
              <div className="text-[11px] text-neutral-500 mt-1">Direct fine metal replacement</div>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-200 hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-emerald-800 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Gross Profit Margin</span>
                <Percent className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div className="text-xl font-medium text-emerald-900 font-mono">₹ 3.30 Cr (11.62%)</div>
              <div className="text-[11px] text-emerald-700 mt-1">Making charges + trading spread</div>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-200 hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-emerald-800 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Net Profit After Tax</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div className="text-xl font-medium text-emerald-900 font-mono">₹ 2.15 Cr (7.57%)</div>
              <div className="text-[11px] text-emerald-700 mt-1">Post corporate tax provision</div>
            </div>
          </div>
        </div>

        {/* Margin Contribution Breakdown Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-neutral-500" />
              Margin Contribution Source Decomposition (Gross Profit: ₹ 3.30 Cr)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleVarianceView}
                className="px-2.5 py-1 text-xs rounded border border-[#e2e8f0] bg-white hover:bg-neutral-50 text-neutral-700 font-medium cursor-pointer"
              >
                View Variance vs Last Year
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Hammer className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-neutral-900">
                      Craftsmanship & Making Charges Margin (VA)
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      Artisan value addition markup on bridal & antique ornaments
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-sm font-medium text-emerald-700">₹ 2.45 Cr</div>
                  <div className="text-[10px] text-neutral-500">74.2% of Gross Profit</div>
                </div>
              </div>
              <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden mt-3">
                <div style={{ width: '74.2%' }} className="bg-emerald-500 h-full" />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-neutral-900">
                      Bullion Price Appreciation & Trading Spread
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      IBJA morning benchmark timing, old gold scrap buyback spread
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-sm font-medium text-amber-700">₹ 85.00 Lakhs</div>
                  <div className="text-[10px] text-neutral-500">25.8% of Gross Profit</div>
                </div>
              </div>
              <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden mt-3">
                <div style={{ width: '25.8%' }} className="bg-amber-500 h-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Interactive P&L Statement Tree Table */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-medium text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-neutral-500" />
              Executive Income Statement: Q3 FY2026-27 (October 2026)
            </span>
            <span className="text-xs text-neutral-500 font-mono">All figures in INR (₹)</span>
          </div>

          <div className="border border-[#e5e7eb] rounded-lg overflow-hidden bg-white font-mono text-xs">
            <div className="divide-y divide-[#e5e7eb]">
              {/* Row: Revenue from Operations */}
              <div
                onClick={() => setShowRevenueDetails(!showRevenueDetails)}
                className="px-4 py-2.5 bg-neutral-50 flex items-center justify-between cursor-pointer hover:bg-neutral-100 transition-colors"
              >
                <div className="flex items-center gap-2 font-medium text-neutral-900 font-sans">
                  {showRevenueDetails ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <span>1. Revenue from Showroom Operations</span>
                </div>
                <div className="font-medium text-neutral-900">₹ 28,40,00,000.00</div>
              </div>

              {showRevenueDetails && (
                <div className="bg-white pl-8 pr-4 py-2 space-y-1.5 text-[11px] text-neutral-600 border-b border-[#e5e7eb]">
                  <div className="flex justify-between">
                    <span>Gold & Diamond Retail Sales (Counter POS):</span>
                    <span>₹ 25,60,00,000.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Artisan Making Charges & Wastage (VA):</span>
                    <span>₹ 2,45,00,000.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Silver Articles & Puja Ware:</span>
                    <span>₹ 35,00,000.00</span>
                  </div>
                </div>
              )}

              {/* Row: Cost of Bullion Sold */}
              <div className="px-4 py-2.5 flex items-center justify-between hover:bg-neutral-50/60">
                <div className="font-sans text-neutral-700 pl-6">
                  2. Less: Cost of Goods Sold (Bullion COGS Replacements)
                </div>
                <div className="text-neutral-700">- ₹ 25,10,00,000.00</div>
              </div>

              {/* Row: Gross Profit */}
              <div className="px-4 py-2.5 bg-emerald-50/40 flex items-center justify-between font-medium">
                <div className="font-sans text-emerald-900 pl-6">
                  3. Gross Profit (Operating Margin 11.62%)
                </div>
                <div className="text-emerald-800">₹ 3,30,00,000.00</div>
              </div>

              {/* Row: Operating Overheads */}
              <div
                onClick={() => setShowOpexDetails(!showOpexDetails)}
                className="px-4 py-2.5 bg-neutral-50 flex items-center justify-between cursor-pointer hover:bg-neutral-100 transition-colors"
              >
                <div className="flex items-center gap-2 font-medium text-neutral-900 font-sans">
                  {showOpexDetails ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <span>4. Operating & Administrative Showroom Overheads</span>
                </div>
                <div className="text-neutral-700">- ₹ 32,00,000.00</div>
              </div>

              {showOpexDetails && (
                <div className="bg-white pl-8 pr-4 py-2 space-y-1.5 text-[11px] text-neutral-600 border-b border-[#e5e7eb]">
                  <div className="flex justify-between">
                    <span>Armed Security & Vault Guard Salaries:</span>
                    <span>₹ 12,50,000.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commercial Electricity & HVAC Power Tariffs:</span>
                    <span>₹ 6,80,000.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Jewellers Block Insurance Premiums:</span>
                    <span>₹ 5,30,000.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marketing, Hoardings & Digital Campaigns:</span>
                    <span>₹ 7,40,000.00</span>
                  </div>
                </div>
              )}

              {/* Row: EBITDA */}
              <div className="px-4 py-2.5 bg-blue-50/30 flex items-center justify-between font-medium">
                <div className="font-sans text-blue-900 pl-6">
                  5. Operating EBITDA (Earnings Before Int, Tax, Depr)
                </div>
                <div className="text-blue-800">₹ 2,98,00,000.00</div>
              </div>

              {/* Row: Depreciation & Finance */}
              <div className="px-4 py-2.5 flex items-center justify-between hover:bg-neutral-50/60">
                <div className="font-sans text-neutral-700 pl-6">
                  6. Less: Depreciation & Bank Overdraft Finance Interest
                </div>
                <div className="text-neutral-700">- ₹ 11,00,000.00</div>
              </div>

              {/* Row: PBT */}
              <div className="px-4 py-2.5 flex items-center justify-between font-medium">
                <div className="font-sans text-neutral-900 pl-6">
                  7. Profit Before Tax (PBT)
                </div>
                <div className="text-neutral-900">₹ 2,87,00,000.00</div>
              </div>

              {/* Row: Tax Provision */}
              <div className="px-4 py-2.5 flex items-center justify-between hover:bg-neutral-50/60">
                <div className="font-sans text-neutral-700 pl-6">
                  8. Less: Corporate Income Tax Provision (25%)
                </div>
                <div className="text-neutral-700">- ₹ 72,00,000.00</div>
              </div>

              {/* Row: Net Profit */}
              <div className="px-4 py-3 bg-emerald-100/50 flex items-center justify-between font-medium text-sm">
                <div className="font-sans text-emerald-950 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>9. Net Profit After Tax (PAT - 7.57% Net Return)</span>
                </div>
                <div className="text-emerald-900 font-medium">₹ 2,15,00,000.00</div>
              </div>
            </div>
          </div>
        </div>

        {/* Supabase-style Table */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  public.financial_pl_statements
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Showing {statements.length} fiscal statement periods
                </span>
              </div>

              <div className="flex items-center bg-neutral-200/60 p-0.5 rounded border border-neutral-300/60 text-[13px]">
                <button
                  onClick={() => setActiveTab('data')}
                  className={`px-2.5 py-0.5 rounded font-medium transition-all cursor-pointer ${
                    activeTab === 'data'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Data
                </button>
                <button
                  onClick={() => setActiveTab('definition')}
                  className={`px-2.5 py-0.5 rounded font-medium transition-all cursor-pointer ${
                    activeTab === 'definition'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Definition
                </button>
              </div>
            </div>

            {activeTab === 'data' && (
              <div className="flex-1 overflow-x-auto custom-scrollbar w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#fcfcfc] border-b border-[#e5e7eb] text-neutral-600 font-mono text-[11px]">
                      <th className="w-10 px-3 py-2 border-r border-[#e5e7eb] text-center">
                        <input
                          type="checkbox"
                          className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                        />
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">statement_period</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">sales_revenue (₹)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">cogs_bullion (₹)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">gross_profit (₹)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">operating_expenses (₹)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">net_profit (₹)</span>
                      </th>
                      <th className="w-16 px-3 py-2 text-center font-medium">uuid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb] text-neutral-800 font-mono">
                    {statements.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap font-sans text-neutral-900 font-medium">
                          {row.statement_period}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-right font-medium text-neutral-900">
                          ₹ {row.sales_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-right text-amber-700">
                          ₹ {row.cogs_bullion.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-right text-emerald-700 font-medium">
                          ₹ {row.gross_profit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-right text-neutral-600">
                          ₹ {row.operating_expenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-right text-emerald-800 font-medium">
                          ₹ {row.net_profit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          <button
                            onClick={() => copyToClipboard(row.id, row.id)}
                            className="p-1 text-neutral-400 hover:text-neutral-700 transition-colors"
                            title="Copy UUID"
                          >
                            {copiedId === row.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'definition' && (
              <div className="p-4 bg-[#0a0a0a] text-neutral-200 font-mono text-xs overflow-x-auto">
                <div className="leading-relaxed">
                  <span className="text-emerald-400">CREATE TABLE</span> public.financial_pl_statements (
                  <br />
                  &nbsp;&nbsp;id <span className="text-purple-400">UUID</span>{' '}
                  <span className="text-neutral-400">PRIMARY KEY DEFAULT gen_random_uuid()</span>,
                  <br />
                  &nbsp;&nbsp;statement_period <span className="text-purple-400">VARCHAR(50)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;sales_revenue <span className="text-purple-400">NUMERIC(14,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;cogs_bullion <span className="text-purple-400">NUMERIC(14,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;gross_profit <span className="text-purple-400">NUMERIC(14,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;operating_expenses <span className="text-purple-400">NUMERIC(12,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;ebitda <span className="text-purple-400">NUMERIC(14,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;depreciation_finance <span className="text-purple-400">NUMERIC(12,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;pbt <span className="text-purple-400">NUMERIC(14,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;tax_provision <span className="text-purple-400">NUMERIC(12,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;net_profit <span className="text-purple-400">NUMERIC(14,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
