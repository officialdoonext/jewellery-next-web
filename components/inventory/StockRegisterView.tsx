'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  BookOpen,
  Calendar,
  FileSpreadsheet,
  Download,
  Filter,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Scale,
  Coins,
  Copy,
  Check,
  ShieldCheck,
  Flame,
} from 'lucide-react';

interface StockDailyEntry {
  id: string;
  date: string;
  metal_type: string;
  opening_gross_g: number;
  inward_g: number;
  outward_g: number;
  melting_adjust_g: number;
  closing_gross_g: number;
  pure_fine_g: number;
  reconciled_by: string;
  status: 'VERIFIED' | 'PENDING' | 'DISCREPANCY';
}

const INITIAL_REGISTER: StockDailyEntry[] = [
  {
    id: '5561a902-8812-4f81-992a-cc21890ba123',
    date: '2026-10-30',
    metal_type: 'Gold 22K (916)',
    opening_gross_g: 14850.400,
    inward_g: 450.200,
    outward_g: 382.150,
    melting_adjust_g: -0.040,
    closing_gross_g: 14918.410,
    pure_fine_g: 13675.250,
    reconciled_by: 'M. Sridhar (Manager)',
    status: 'VERIFIED',
  },
  {
    id: '5561a902-8812-4f81-992a-cc21890ba124',
    date: '2026-10-29',
    metal_type: 'Gold 22K (916)',
    opening_gross_g: 14610.150,
    inward_g: 520.000,
    outward_g: 279.700,
    melting_adjust_g: -0.050,
    closing_gross_g: 14850.400,
    pure_fine_g: 13612.860,
    reconciled_by: 'M. Sridhar (Manager)',
    status: 'VERIFIED',
  },
  {
    id: '5561a902-8812-4f81-992a-cc21890ba125',
    date: '2026-10-30',
    metal_type: 'Gold 18K (750)',
    opening_gross_g: 3410.800,
    inward_g: 85.400,
    outward_g: 42.100,
    melting_adjust_g: 0.000,
    closing_gross_g: 3454.100,
    pure_fine_g: 2590.575,
    reconciled_by: 'K. Kavita (Auditor)',
    status: 'VERIFIED',
  },
  {
    id: '5561a902-8812-4f81-992a-cc21890ba126',
    date: '2026-10-30',
    metal_type: 'Silver 999 (Articles)',
    opening_gross_g: 124500.000,
    inward_g: 1200.000,
    outward_g: 900.000,
    melting_adjust_g: 0.000,
    closing_gross_g: 124800.000,
    pure_fine_g: 124675.200,
    reconciled_by: 'R. Rajesh (Vault Incharge)',
    status: 'VERIFIED',
  },
  {
    id: '5561a902-8812-4f81-992a-cc21890ba127',
    date: '2026-10-28',
    metal_type: 'Gold 22K (916)',
    opening_gross_g: 14450.000,
    inward_g: 310.400,
    outward_g: 150.200,
    melting_adjust_g: -0.050,
    closing_gross_g: 14610.150,
    pure_fine_g: 13392.500,
    reconciled_by: 'M. Sridhar (Manager)',
    status: 'VERIFIED',
  },
];

export function InventoryStockRegisterView() {
  const [register] = useState<StockDailyEntry[]>(INITIAL_REGISTER);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter States
  const [selectedMetal, setSelectedMetal] = useState<string>('All');
  const [startDate, setStartDate] = useState('2026-10-28');
  const [endDate, setEndDate] = useState('2026-10-30');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredEntries = register.filter((entry) => {
    if (selectedMetal !== 'All' && !entry.metal_type.includes(selectedMetal)) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="inventory_stock_register" />
      <ActionToolbar
        filterPlaceholder="Filter register entries by date, metal, manager..."
        insertLabel="Reconcile Today"
        onInsertClick={() => alert('Starting daily closing weight audit & pure gold ledger reconciliation...')}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics Summary Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Opening Gross Stock */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-1">
                Opening Gross
              </div>
              <div className="text-lg font-medium text-neutral-900">14,850.400 g</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Start of day 22K
              </div>
            </div>

            {/* Inward Gross */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="text-[11px] font-medium uppercase tracking-wider text-emerald-700 mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-600" /> Purchases
              </div>
              <div className="text-lg font-medium text-emerald-700">+450.200 g</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                Karigar lots inward
              </div>
            </div>

            {/* Outward Sales */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="text-[11px] font-medium uppercase tracking-wider text-blue-700 mb-1 flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-blue-600" /> Sales Outward
              </div>
              <div className="text-lg font-medium text-blue-700">-382.150 g</div>
              <div className="text-[11px] text-blue-600 mt-1 font-mono">
                Counter billing total
              </div>
            </div>

            {/* Adjustments */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="text-[11px] font-medium uppercase tracking-wider text-amber-700 mb-1 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-600" /> Melting/Adjust
              </div>
              <div className="text-lg font-medium text-amber-700">-0.040 g</div>
              <div className="text-[11px] text-amber-600 mt-1 font-mono">
                Buffing & testing
              </div>
            </div>

            {/* Closing Gross */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-800 mb-1">
                Closing Gross
              </div>
              <div className="text-lg font-medium text-neutral-900">14,918.410 g</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                Net gain +68.010 g
              </div>
            </div>

            {/* Pure Fine Balance */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-1 flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-600" /> Pure Fine Gold
              </div>
              <div className="text-lg font-medium text-neutral-900">13,675.250 g</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                24K equivalent wt
              </div>
            </div>
          </div>

          {/* Date range & Filter Bar */}
          <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {/* Metal Filter */}
              <div className="flex items-center gap-1.5 bg-white border border-[#e2e8f0] rounded-md px-2.5 py-1">
                <span className="text-[11px] text-neutral-500">Metal:</span>
                <select
                  value={selectedMetal}
                  onChange={(e) => setSelectedMetal(e.target.value)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Precious Metals</option>
                  <option value="Gold 22K">Gold 22K 916</option>
                  <option value="Gold 18K">Gold 18K 750</option>
                  <option value="Silver">Silver 999 Articles</option>
                </select>
              </div>

              {/* Date pickers */}
              <div className="flex items-center gap-2 bg-white border border-[#e2e8f0] rounded-md px-2.5 py-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-[11px] text-neutral-500">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-xs text-neutral-800 bg-transparent focus:outline-none"
                />
                <span className="text-neutral-300">→</span>
                <span className="text-[11px] text-neutral-500">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-xs text-neutral-800 bg-transparent focus:outline-none"
                />
              </div>
            </div>

            {/* Export buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => alert('Exporting Stock Register to Excel (.xlsx)...')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors shadow-2xs cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export Excel</span>
              </button>
              <button
                onClick={() => alert('Generating Signed Stock Register PDF report...')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Supabase-style Table / Schema Definition Section */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            {/* Table Header Info Bar */}
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  stock_register_daily
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Daily fine gold accounting &amp; weight ledger
                </span>
              </div>

              {/* Data / Definition toggle buttons */}
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

            {/* Table Content: Data Tab */}
            {activeTab === 'data' && (
              <div className="flex-1 overflow-x-auto custom-scrollbar w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#fcfcfc] border-b border-[#e5e7eb] text-neutral-600 font-mono text-[12px]">
                      <th className="w-10 px-3 py-2 border-r border-[#e5e7eb] text-center">
                        <input
                          type="checkbox"
                          className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                        />
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">date</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">metal_type</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">opening_gross (g)</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right text-emerald-700">
                        <span className="text-emerald-700">+ inward (g)</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right text-blue-700">
                        <span className="text-blue-700">- outward (g)</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right text-amber-700">
                        <span className="text-amber-700">melting/adj (g)</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">closing_gross (g)</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right font-semibold">
                        <span className="text-neutral-900">pure_fine_24k (g)</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">reconciled_by</span>
                      </th>
                      <th className="px-3.5 py-2 font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">status</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb] font-mono text-neutral-800 text-[12px]">
                    {filteredEntries.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/80 transition-colors group">
                        <td className="px-3 py-2 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>

                        {/* Date */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-medium text-neutral-900">
                          {row.date}
                        </td>

                        {/* Metal Type */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded text-[11px] bg-amber-50 text-amber-800 border border-amber-200">
                            {row.metal_type}
                          </span>
                        </td>

                        {/* Opening */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right text-neutral-700">
                          {row.opening_gross_g.toFixed(3)}
                        </td>

                        {/* Inward */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right text-emerald-700 font-medium">
                          +{row.inward_g.toFixed(3)}
                        </td>

                        {/* Outward */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right text-blue-700 font-medium">
                          -{row.outward_g.toFixed(3)}
                        </td>

                        {/* Melting/Adjust */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right text-amber-700">
                          {row.melting_adjust_g < 0 ? row.melting_adjust_g.toFixed(3) : `+${row.melting_adjust_g.toFixed(3)}`}
                        </td>

                        {/* Closing */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-medium text-neutral-900">
                          {row.closing_gross_g.toFixed(3)}
                        </td>

                        {/* Pure Fine */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-medium text-neutral-900 bg-amber-50/20">
                          {row.pure_fine_g.toFixed(3)}
                        </td>

                        {/* Reconciled By */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-sans text-neutral-600 text-[11px]">
                          {row.reconciled_by}
                        </td>

                        {/* Status */}
                        <td className="px-3.5 py-2 whitespace-nowrap text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table Content: Definition Tab */}
            {activeTab === 'definition' && (
              <div className="p-4 overflow-x-auto font-mono text-xs text-neutral-800 bg-[#fbfbfb] w-full">
                <div className="bg-neutral-900 text-neutral-100 p-4 rounded-md overflow-x-auto shadow-inner text-[12px] leading-relaxed w-full">
                  <span className="text-emerald-400">CREATE TABLE</span> public.stock_register_daily (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">date</span>{' '}
                  <span className="text-amber-300">date</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">metal_type</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">opening_gross_g</span>{' '}
                  <span className="text-amber-300">numeric(12,3)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">inward_g</span>{' '}
                  <span className="text-amber-300">numeric(12,3)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0.000,</span>
                  <br />
                  <span className="pl-6 text-blue-300">outward_g</span>{' '}
                  <span className="text-amber-300">numeric(12,3)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0.000,</span>
                  <br />
                  <span className="pl-6 text-blue-300">melting_adjust_g</span>{' '}
                  <span className="text-amber-300">numeric(12,3)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0.000,</span>
                  <br />
                  <span className="pl-6 text-blue-300">closing_gross_g</span>{' '}
                  <span className="text-amber-300">numeric(12,3)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">pure_fine_g</span>{' '}
                  <span className="text-amber-300">numeric(12,3)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">reconciled_by</span>{' '}
                  <span className="text-amber-300">varchar(100)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">status</span>{' '}
                  <span className="text-amber-300">varchar(20)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;VERIFIED&apos;,</span>
                  <br />
                  <span className="pl-6 text-blue-300">CONSTRAINT</span> unique_daily_metal{' '}
                  <span className="text-neutral-400">UNIQUE (date, metal_type)</span>
                  <br />
                  );
                  <br />
                  <br />
                  <span className="text-emerald-400">ALTER TABLE</span> public.stock_register_daily{' '}
                  <span className="text-emerald-400">ENABLE ROW LEVEL SECURITY;</span>
                </div>
              </div>
            )}

            {/* Table Footer Bar */}
            <div className="h-[36px] bg-[#f8fafc] border-t border-[#e5e7eb] px-3.5 flex items-center justify-between text-[12px] text-neutral-500 font-mono select-none w-full">
              <div className="flex items-center gap-3">
                <span>{filteredEntries.length} daily reconcile records</span>
                <span>•</span>
                <span>Zero unaccounted weight discrepancy</span>
              </div>
              <div className="text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Pure Gold Balance Balanced
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
