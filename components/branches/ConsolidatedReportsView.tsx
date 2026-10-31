'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  TrendingUp,
  Award,
  Download,
  FileSpreadsheet,
  FileText,
  BadgeIndianRupee,
  Scale,
  Building2,
  Calendar,
  BarChart3,
  Percent,
  CheckCircle2,
  X,
  Copy,
  Check,
  Eye,
  ArrowUpRight,
  Receipt,
  Sparkles,
} from 'lucide-react';

interface BranchFinancialStats {
  id: string;
  reporting_month: string;
  branch_name: string;
  city: string;
  rank: number;
  invoices_count: number;
  gold_sold_kg: number;
  diamond_carats_sold: number;
  gross_turnover: number;
  target_turnover: number;
  achievement_pct: number;
  net_profit_margin_pct: number;
  gst_collected_inr: number;
}

const INITIAL_FINANCIALS: BranchFinancialStats[] = [
  {
    id: '99001122-a1b2-c3d4-e5f6-223344556677',
    reporting_month: '2026-OCT',
    branch_name: 'Banjara Hills Flagship',
    city: 'Hyderabad',
    rank: 1,
    invoices_count: 512,
    gold_sold_kg: 8.850,
    diamond_carats_sold: 48.20,
    gross_turnover: 71000000.00,
    target_turnover: 65000000.00,
    achievement_pct: 109.2,
    net_profit_margin_pct: 14.8,
    gst_collected_inr: 2130000.00,
  },
  {
    id: '99001122-a1b2-c3d4-e5f6-223344556678',
    reporting_month: '2026-OCT',
    branch_name: 'Jubilee Hills Boutique',
    city: 'Hyderabad',
    rank: 2,
    invoices_count: 248,
    gold_sold_kg: 4.120,
    diamond_carats_sold: 62.40,
    gross_turnover: 38500000.00,
    target_turnover: 35000000.00,
    achievement_pct: 110.0,
    net_profit_margin_pct: 18.2,
    gst_collected_inr: 1155000.00,
  },
  {
    id: '99001122-a1b2-c3d4-e5f6-223344556679',
    reporting_month: '2026-OCT',
    branch_name: 'Vijayawada MG Road Outlet',
    city: 'Vijayawada',
    rank: 3,
    invoices_count: 194,
    gold_sold_kg: 2.820,
    diamond_carats_sold: 14.50,
    gross_turnover: 18200000.00,
    target_turnover: 18000000.00,
    achievement_pct: 101.1,
    net_profit_margin_pct: 13.5,
    gst_collected_inr: 546000.00,
  },
  {
    id: '99001122-a1b2-c3d4-e5f6-223344556680',
    reporting_month: '2026-OCT',
    branch_name: 'Vizag Beach Road Store',
    city: 'Visakhapatnam',
    rank: 4,
    invoices_count: 142,
    gold_sold_kg: 1.640,
    diamond_carats_sold: 9.80,
    gross_turnover: 11100000.00,
    target_turnover: 12000000.00,
    achievement_pct: 92.5,
    net_profit_margin_pct: 12.8,
    gst_collected_inr: 333000.00,
  },
  {
    id: '99001122-a1b2-c3d4-e5f6-223344556681',
    reporting_month: '2026-OCT',
    branch_name: 'Hyderabad RGIA Terminal 1',
    city: 'Hyderabad',
    rank: 5,
    invoices_count: 118,
    gold_sold_kg: 0.820,
    diamond_carats_sold: 8.40,
    gross_turnover: 3200000.00,
    target_turnover: 3000000.00,
    achievement_pct: 106.6,
    net_profit_margin_pct: 16.4,
    gst_collected_inr: 96000.00,
  },
];

export function BranchesConsolidatedReportsView() {
  const [stats, setStats] = useState<BranchFinancialStats[]>(INITIAL_FINANCIALS);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [selectedPeriod, setSelectedPeriod] = useState<'OCT_2026' | 'Q3_2026' | 'FY_2026_27'>('OCT_2026');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Search and Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'turnover' | 'gold' | 'margin'>('turnover');

  // Modals & Feedback
  const [selectedStats, setSelectedStats] = useState<BranchFinancialStats | null>(null);
  const [isAuditPackModalOpen, setIsAuditPackModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const totalTurnover = stats.reduce((acc, curr) => acc + curr.gross_turnover, 0);
  const totalGoldSold = stats.reduce((acc, curr) => acc + curr.gold_sold_kg, 0);
  const totalGst = stats.reduce((acc, curr) => acc + curr.gst_collected_inr, 0);
  const highestBranch = stats.reduce((prev, current) => (prev.gross_turnover > current.gross_turnover ? prev : current));

  const sortedStats = [...stats].filter((item) => {
    if (searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase();
    return item.branch_name.toLowerCase().includes(q) || item.city.toLowerCase().includes(q);
  }).sort((a, b) => {
    if (sortBy === 'turnover') return b.gross_turnover - a.gross_turnover;
    if (sortBy === 'gold') return b.gold_sold_kg - a.gold_sold_kg;
    if (sortBy === 'margin') return b.net_profit_margin_pct - a.net_profit_margin_pct;
    return 0;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="branches_consolidated_reports" />
      <ActionToolbar
        filterPlaceholder="Search financial performance by branch name, city..."
        insertLabel="Export Audit Pack"
        onInsertClick={() => setIsAuditPackModalOpen(true)}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI metrics */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 font-mono">Reporting Period:</span>
              <div className="flex items-center bg-neutral-100 p-0.5 rounded border border-[#e2e8f0] text-xs">
                <button
                  onClick={() => setSelectedPeriod('OCT_2026')}
                  className={`px-3 py-1 rounded font-medium transition-all cursor-pointer ${
                    selectedPeriod === 'OCT_2026'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  October 2026
                </button>
                <button
                  onClick={() => setSelectedPeriod('Q3_2026')}
                  className={`px-3 py-1 rounded font-medium transition-all cursor-pointer ${
                    selectedPeriod === 'Q3_2026'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Q3 2026
                </button>
                <button
                  onClick={() => setSelectedPeriod('FY_2026_27')}
                  className={`px-3 py-1 rounded font-medium transition-all cursor-pointer ${
                    selectedPeriod === 'FY_2026_27'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  FY 2026-27
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast('Consolidated GST & Sales Excel generated!')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                Export Excel
              </button>
              <button
                onClick={() => setIsAuditPackModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                Enterprise Audit Pack PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Network Turnover</span>
                <BadgeIndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">
                ₹ {(totalTurnover / 10000000).toFixed(2)} Cr
              </div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                +14.2% YoY Growth
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Network Gold Sold</span>
                <Scale className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-neutral-900">{totalGoldSold.toFixed(3)} kg</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                1,214 retail invoices
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Consolidated GST (3%)</span>
                <Receipt className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">
                ₹ {(totalGst / 100000).toFixed(2)} Lakhs
              </div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                GSTR-3B Tax Ready
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-blue-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Top Performing Branch</span>
                <Award className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 truncate">
                {highestBranch.branch_name}
              </div>
              <div className="text-[11px] text-blue-700 mt-1 font-mono">
                ₹ {(highestBranch.gross_turnover / 10000000).toFixed(2)} Cr (109.2% Target)
              </div>
            </div>
          </div>
        </div>

        {/* Branch Performance Leaderboard Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            Branch Performance Leaderboard & Target Achievement
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {stats.map((branch) => (
              <div
                key={branch.id}
                className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-medium ${
                        branch.rank === 1
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : branch.rank === 2
                          ? 'bg-neutral-200 text-neutral-800'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      #{branch.rank}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {branch.achievement_pct}% Target
                    </span>
                  </div>

                  <div className="font-medium text-neutral-900 text-xs truncate">
                    {branch.branch_name}
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono block">
                    {branch.city}
                  </span>

                  <div className="mt-3 space-y-1 text-xs font-mono">
                    <div className="text-sm font-medium text-neutral-900">
                      ₹ {(branch.gross_turnover / 10000000).toFixed(2)} Cr
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      Gold Sold: {branch.gold_sold_kg.toFixed(3)} kg
                    </div>
                    <div className="text-[11px] text-blue-700">
                      Diamonds: {branch.diamond_carats_sold.toFixed(2)} cts
                    </div>
                    <div className="text-[11px] text-emerald-700">
                      Profit Margin: {branch.net_profit_margin_pct}%
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#e2e8f0]">
                  <div className="w-full h-1.5 rounded-full bg-neutral-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${Math.min(branch.achievement_pct, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supabase-style Table */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  public.consolidated_enterprise_stats
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Showing {sortedStats.length} branch financial records
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
                        <span className="text-neutral-800">reporting_month</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">branch_name & city</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">invoices</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">gold_sold_kg</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">diamond_cts</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">gross_turnover (₹)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">profit_margin</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">gst_deposited (₹)</span>
                      </th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {sortedStats.map((item) => (
                      <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="w-10 px-3 py-2 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-[11px] text-neutral-700">
                          {item.reporting_month}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span
                            onClick={() => {
                              setSelectedStats(item);
                              setIsAuditPackModalOpen(true);
                            }}
                            className="font-medium text-emerald-700 hover:underline cursor-pointer"
                          >
                            {item.branch_name}
                          </span>
                          <span className="block text-[10px] text-neutral-400 font-mono">
                            {item.city} • Rank #{item.rank}
                          </span>
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono">
                          {item.invoices_count}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono text-neutral-900 font-medium">
                          {item.gold_sold_kg.toFixed(3)} kg
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono text-blue-700">
                          {item.diamond_carats_sold.toFixed(2)} cts
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono text-emerald-700 font-medium">
                          ₹ {item.gross_turnover.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {item.net_profit_margin_pct}%
                          </span>
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono text-neutral-700">
                          ₹ {item.gst_collected_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <button
                            onClick={() => {
                              setSelectedStats(item);
                              setIsAuditPackModalOpen(true);
                            }}
                            className="p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="View Financial Audit Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'definition' && (
              <div className="p-4 overflow-x-auto font-mono text-xs text-neutral-800 bg-[#fbfbfb] w-full">
                <div className="bg-neutral-900 text-neutral-100 p-4 rounded-md overflow-x-auto shadow-inner text-[12px] leading-relaxed w-full">
                  <span className="text-emerald-400">CREATE TABLE</span> public.consolidated_enterprise_stats (
                  <br />
                  &nbsp;&nbsp;id <span className="text-purple-400">UUID</span>{' '}
                  <span className="text-neutral-400">PRIMARY KEY DEFAULT gen_random_uuid()</span>,
                  <br />
                  &nbsp;&nbsp;reporting_month <span className="text-purple-400">VARCHAR(20)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;branch_name <span className="text-purple-400">VARCHAR(100)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;invoices_count <span className="text-purple-400">INTEGER</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0</span>,
                  <br />
                  &nbsp;&nbsp;gold_sold_kg <span className="text-purple-400">NUMERIC(10,3)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;diamond_carats_sold <span className="text-purple-400">NUMERIC(8,2)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0.00</span>,
                  <br />
                  &nbsp;&nbsp;gross_turnover <span className="text-purple-400">NUMERIC(14,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;net_profit_margin_pct <span className="text-purple-400">NUMERIC(5,2)</span>,
                  <br />
                  &nbsp;&nbsp;gst_collected_inr <span className="text-purple-400">NUMERIC(12,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;created_at <span className="text-purple-400">TIMESTAMPTZ</span>{' '}
                  <span className="text-neutral-400">DEFAULT NOW()</span>
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Enterprise Audit Pack & Statutory P&L Summary */}
      {isAuditPackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#e5e7eb] w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="px-5 py-4 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">
                  Consolidated Enterprise Statutory Audit Pack
                </h3>
              </div>
              <button
                onClick={() => setIsAuditPackModalOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar font-mono text-xs text-neutral-800">
              <div className="border border-neutral-300 p-4 rounded bg-[#fcfcfc] text-center">
                <div className="text-sm font-medium tracking-wide text-neutral-900">
                  JEWELLERY NEXT RETAILERS PVT LTD
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  Consolidated Multi-Branch Statutory Revenue & Tax Rollup
                </div>
                <div className="text-[11px] text-neutral-600 mt-1">
                  Period: October 2026 • 5 Outlets Consolidated
                </div>
              </div>

              {/* Summary Financial Rollup */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded border border-neutral-300 bg-[#f8fafc]">
                  <span className="text-[10px] text-neutral-500 uppercase block">Gross Group Turnover</span>
                  <span className="text-sm font-medium text-neutral-900">
                    ₹ {(totalTurnover / 10000000).toFixed(2)} Crores
                  </span>
                </div>
                <div className="p-3 rounded border border-neutral-300 bg-[#f8fafc]">
                  <span className="text-[10px] text-neutral-500 uppercase block">Consolidated GST (3%)</span>
                  <span className="text-sm font-medium text-emerald-700">
                    ₹ {(totalGst / 100000).toFixed(2)} Lakhs
                  </span>
                </div>
                <div className="p-3 rounded border border-neutral-300 bg-[#f8fafc]">
                  <span className="text-[10px] text-neutral-500 uppercase block">Total Gold Weight Dispatched</span>
                  <span className="text-sm font-medium text-neutral-900">
                    {totalGoldSold.toFixed(3)} kg Pure
                  </span>
                </div>
                <div className="p-3 rounded border border-neutral-300 bg-[#f8fafc]">
                  <span className="text-[10px] text-neutral-500 uppercase block">Group Profit Margin</span>
                  <span className="text-sm font-medium text-blue-700">
                    15.14% Weighted Net
                  </span>
                </div>
              </div>

              {/* Elimination Notes */}
              <div className="p-3 rounded bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <div className="font-medium flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Inter-Branch Elimination Entries
                </div>
                <p>
                  All stock transfers between Banjara Hills Flagship, Jubilee Hills, Vijayawada, Vizag, and RGIA (totaling ₹66.8 Lakhs in-transit) have been eliminated from revenue to prevent double-counting under Ind AS 110.
                </p>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between">
              <span className="text-[11px] text-neutral-500 font-mono">
                Statutory Auditor: Harish & Co Chartered Accountants
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsAuditPackModalOpen(false);
                    showToast('Enterprise Audit Pack PDF downloaded!');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Signed PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded-md shadow-lg flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
