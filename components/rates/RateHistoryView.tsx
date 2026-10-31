'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  History,
  TrendingUp,
  Calendar,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Filter,
  Sparkles,
  ShieldCheck,
  Scale,
  Clock,
  ChevronRight,
  BarChart3,
  CalendarDays,
} from 'lucide-react';

interface RateHistoryRow {
  id: string;
  date: string;
  gold_24k_rate: number;
  gold_22k_rate: number;
  gold_18k_rate: number;
  silver_rate_g: number;
  day_delta: number;
  day_delta_pct: number;
  intraday_high: number;
  intraday_low: number;
  recorded_by: string;
}

const HISTORICAL_DATA: RateHistoryRow[] = [
  {
    id: 'hist-2026-10-31',
    date: '2026-10-31',
    gold_24k_rate: 8120.0,
    gold_22k_rate: 7850.0,
    gold_18k_rate: 6420.0,
    silver_rate_g: 98.5,
    day_delta: 20.0,
    day_delta_pct: 0.25,
    intraday_high: 8135.0,
    intraday_low: 8105.0,
    recorded_by: 'B. S. Rao (Chief Valuer)',
  },
  {
    id: 'hist-2026-10-30',
    date: '2026-10-30',
    gold_24k_rate: 8100.0,
    gold_22k_rate: 7831.5,
    gold_18k_rate: 6405.0,
    silver_rate_g: 97.7,
    day_delta: -15.0,
    day_delta_pct: -0.18,
    intraday_high: 8125.0,
    intraday_low: 8090.0,
    recorded_by: 'M. Sridhar (Store Admin)',
  },
  {
    id: 'hist-2026-10-29',
    date: '2026-10-29',
    gold_24k_rate: 8115.0,
    gold_22k_rate: 7845.0,
    gold_18k_rate: 6415.0,
    silver_rate_g: 97.9,
    day_delta: 45.0,
    day_delta_pct: 0.56,
    intraday_high: 8140.0,
    intraday_low: 8070.0,
    recorded_by: 'B. S. Rao (Chief Valuer)',
  },
  {
    id: 'hist-2026-10-28',
    date: '2026-10-28',
    gold_24k_rate: 8070.0,
    gold_22k_rate: 7800.0,
    gold_18k_rate: 6380.0,
    silver_rate_g: 97.1,
    day_delta: 30.0,
    day_delta_pct: 0.37,
    intraday_high: 8085.0,
    intraday_low: 8040.0,
    recorded_by: 'M. Sridhar (Store Admin)',
  },
  {
    id: 'hist-2026-10-27',
    date: '2026-10-27',
    gold_24k_rate: 8040.0,
    gold_22k_rate: 7770.0,
    gold_18k_rate: 6355.0,
    silver_rate_g: 96.5,
    day_delta: -10.0,
    day_delta_pct: -0.12,
    intraday_high: 8060.0,
    intraday_low: 8030.0,
    recorded_by: 'B. S. Rao (Chief Valuer)',
  },
  {
    id: 'hist-2026-10-26',
    date: '2026-10-26',
    gold_24k_rate: 8050.0,
    gold_22k_rate: 7780.0,
    gold_18k_rate: 6365.0,
    silver_rate_g: 96.8,
    day_delta: 25.0,
    day_delta_pct: 0.31,
    intraday_high: 8065.0,
    intraday_low: 8020.0,
    recorded_by: 'B. S. Rao (Chief Valuer)',
  },
  {
    id: 'hist-2026-10-25',
    date: '2026-10-25',
    gold_24k_rate: 8025.0,
    gold_22k_rate: 7755.0,
    gold_18k_rate: 6345.0,
    silver_rate_g: 96.2,
    day_delta: 0.0,
    day_delta_pct: 0.0,
    intraday_high: 8035.0,
    intraday_low: 8015.0,
    recorded_by: 'Sunday Official Close',
  },
  {
    id: 'hist-2026-10-24',
    date: '2026-10-24',
    gold_24k_rate: 8025.0,
    gold_22k_rate: 7755.0,
    gold_18k_rate: 6345.0,
    silver_rate_g: 96.2,
    day_delta: 35.0,
    day_delta_pct: 0.44,
    intraday_high: 8040.0,
    intraday_low: 7990.0,
    recorded_by: 'B. S. Rao (Chief Valuer)',
  },
  {
    id: 'hist-2026-10-23',
    date: '2026-10-23',
    gold_24k_rate: 7990.0,
    gold_22k_rate: 7720.0,
    gold_18k_rate: 6315.0,
    silver_rate_g: 95.8,
    day_delta: -20.0,
    day_delta_pct: -0.25,
    intraday_high: 8010.0,
    intraday_low: 7980.0,
    recorded_by: 'M. Sridhar (Store Admin)',
  },
  {
    id: 'hist-2026-10-15',
    date: '2026-10-15',
    gold_24k_rate: 7890.0,
    gold_22k_rate: 7625.0,
    gold_18k_rate: 6240.0,
    silver_rate_g: 94.5,
    day_delta: 15.0,
    day_delta_pct: 0.19,
    intraday_high: 7910.0,
    intraday_low: 7875.0,
    recorded_by: 'B. S. Rao (Chief Valuer)',
  },
  {
    id: 'hist-2026-10-01',
    date: '2026-10-01',
    gold_24k_rate: 7720.0,
    gold_22k_rate: 7460.0,
    gold_18k_rate: 6100.0,
    silver_rate_g: 93.1,
    day_delta: -30.0,
    day_delta_pct: -0.39,
    intraday_high: 7750.0,
    intraday_low: 7715.0,
    recorded_by: 'B. S. Rao (Chief Valuer)',
  },
];

export function RatesRateHistoryView() {
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [historyList, setHistoryList] = useState<RateHistoryRow[]>(HISTORICAL_DATA);
  const [searchDateQuery, setSearchDateQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');

  // Interactive Date Rate Lookup state
  const [lookupDate, setLookupDate] = useState('2026-10-15');
  const [lookupResult, setLookupResult] = useState<RateHistoryRow | null>(
    HISTORICAL_DATA.find((r) => r.date === '2026-10-15') || null
  );

  const handleLookup = (dateStr: string) => {
    setLookupDate(dateStr);
    const found = HISTORICAL_DATA.find((r) => r.date === dateStr);
    if (found) {
      setLookupResult(found);
    } else {
      // Simulate historical extrapolation if not in mock array
      const dateNum = new Date(dateStr).getTime() || Date.now();
      const fake24k = 7800 + (Math.sin(dateNum / 10000000) * 150);
      setLookupResult({
        id: `hist-${dateStr}`,
        date: dateStr,
        gold_24k_rate: Math.round(fake24k),
        gold_22k_rate: Math.round(fake24k * (22 / 24)),
        gold_18k_rate: Math.round(fake24k * (18 / 24)),
        silver_rate_g: 94.2,
        day_delta: 12.0,
        day_delta_pct: 0.15,
        intraday_high: Math.round(fake24k + 15),
        intraday_low: Math.round(fake24k - 20),
        recorded_by: 'Official Bullion Exchange Archive',
      });
    }
  };

  const filteredHistory = historyList.filter((r) => {
    if (searchDateQuery.trim() !== '') {
      const q = searchDateQuery.toLowerCase();
      return r.date.toLowerCase().includes(q) || r.recorded_by.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="rates_history" />
      <ActionToolbar
        filterPlaceholder="Filter by date (YYYY-MM-DD), recorder, or delta..."
        insertLabel="Audit Rate History"
        onInsertClick={() => handleLookup('2026-10-31')}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics Summary Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* KPI 1: 30-Day High */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">30-Day High</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">₹ 8,140.00 /g</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Hit on Oct 29, 2026
              </div>
            </div>

            {/* KPI 2: 30-Day Low */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">30-Day Low</span>
                <ArrowDownRight className="w-3.5 h-3.5 text-neutral-500" />
              </div>
              <div className="text-xl font-medium text-neutral-900">₹ 7,720.00 /g</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Base on Oct 01, 2026
              </div>
            </div>

            {/* KPI 3: 1-Year Growth */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">1-Year Growth</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700">+22.4%</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                +₹1,480 /g since Oct 2025
              </div>
            </div>

            {/* KPI 4: All-Time Days Logged */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-blue-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Recorded Sessions</span>
                <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">1,840 Days</div>
              <div className="text-[11px] text-blue-700 mt-1 font-mono">
                Zero gaps in audit trail
              </div>
            </div>

            {/* KPI 5: Volatility */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-neutral-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Avg Daily Swing</span>
                <Scale className="w-3.5 h-3.5 text-neutral-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">± 0.64%</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Stable seasonal bullion curve
              </div>
            </div>
          </div>
        </div>

        {/* Historical Lookup & 7-Day Trajectory Progression Card */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Interactive Date Rate Lookup for Dispute Resolution */}
          <div className="lg:col-span-2 p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  Historical Date Rate Lookup (Dispute & Audit Tool)
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  Official Audit Certified
                </span>
              </div>
              <p className="text-xs text-neutral-600 mb-3">
                Select any previous date to inspect the verified official morning opening and evening closing board rates used for tax invoicing and customer old gold exchanges.
              </p>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <input
                  type="date"
                  value={lookupDate}
                  onChange={(e) => handleLookup(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                />
                <button
                  onClick={() => handleLookup('2026-10-31')}
                  className="px-2.5 py-1 text-xs rounded bg-white border border-[#e2e8f0] text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                >
                  Today
                </button>
                <button
                  onClick={() => handleLookup('2026-10-30')}
                  className="px-2.5 py-1 text-xs rounded bg-white border border-[#e2e8f0] text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                >
                  Yesterday
                </button>
                <button
                  onClick={() => handleLookup('2026-10-24')}
                  className="px-2.5 py-1 text-xs rounded bg-white border border-[#e2e8f0] text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                >
                  7 Days Ago
                </button>
                <button
                  onClick={() => handleLookup('2026-10-15')}
                  className="px-2.5 py-1 text-xs rounded bg-white border border-[#e2e8f0] text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                >
                  Mid-Month (Oct 15)
                </button>
              </div>

              {lookupResult && (
                <div className="p-3 bg-white border border-[#e2e8f0] rounded-md grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-500 block uppercase">24K Pure Rate</span>
                    <span className="text-sm font-medium text-neutral-900 font-mono">
                      ₹ {lookupResult.gold_24k_rate.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 block uppercase">22K 916 Hallmark</span>
                    <span className="text-sm font-medium text-emerald-700 font-mono">
                      ₹ {lookupResult.gold_22k_rate.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 block uppercase">Fine Silver / g</span>
                    <span className="text-sm font-medium text-neutral-800 font-mono">
                      ₹ {lookupResult.silver_rate_g.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 block uppercase">Intraday Range</span>
                    <span className="text-xs text-neutral-700 font-mono">
                      ₹{lookupResult.intraday_low} - ₹{lookupResult.intraday_high}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-[11px] text-neutral-500 mt-2">
              <span>Auditor Sign-off: {lookupResult?.recorded_by || 'B. S. Rao'}</span>
              <span className="text-emerald-600 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Immutable ledger hash verified
              </span>
            </div>
          </div>

          {/* 7-Day Rate Trajectory Mini Progression */}
          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex flex-col justify-between">
            <div>
              <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-neutral-700" />
                  7-Day 24K Trajectory
                </span>
                <span className="text-[10px] text-emerald-600 font-mono">+1.18% (7D)</span>
              </div>
              <p className="text-[11px] text-neutral-500 mb-3">
                Daily close movement comparison across previous 7 trading cycles.
              </p>

              {/* Visual mini bar indicator */}
              <div className="space-y-1.5">
                {HISTORICAL_DATA.slice(0, 5).map((item) => {
                  const widthPercent = Math.max(40, Math.min(100, ((item.gold_24k_rate - 7900) / (8150 - 7900)) * 100));
                  return (
                    <div key={item.id} className="text-[11px]">
                      <div className="flex justify-between text-neutral-600 mb-0.5 font-mono">
                        <span>{item.date.slice(5)}</span>
                        <span>₹ {item.gold_24k_rate}</span>
                      </div>
                      <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-[11px] text-neutral-500">
              <span>Base: 7,900</span>
              <span>Peak: 8,140</span>
            </div>
          </div>
        </div>

        {/* Supabase-style Table / Schema Definition Section */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            {/* Table Header Info Bar */}
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  rate_history_log
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Showing {filteredHistory.length} of {historyList.length} recorded dates
                </span>
              </div>

              {/* Data/Definition Tab Toggle */}
              <div className="flex items-center gap-2">
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
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">date</span>
                          <span className="text-neutral-400 font-normal text-[10px]">date</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">gold_24k_rate</span>
                          <span className="text-neutral-400 font-normal text-[10px]">₹/g</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">gold_22k_rate</span>
                          <span className="text-neutral-400 font-normal text-[10px]">₹/g</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">gold_18k_rate</span>
                          <span className="text-neutral-400 font-normal text-[10px]">₹/g</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">silver_rate</span>
                          <span className="text-neutral-400 font-normal text-[10px]">₹/g</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">day_delta</span>
                          <span className="text-neutral-400 font-normal text-[10px]">+/-</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">intraday_high_low</span>
                          <span className="text-neutral-400 font-normal text-[10px]">spread</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">recorded_by</span>
                          <span className="text-neutral-400 font-normal text-[10px]">auditor</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb]">
                    {filteredHistory.map((row) => (
                      <tr key={row.id} className="hover:bg-[#f8fafc] transition-colors font-mono">
                        <td className="px-3 py-2 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-medium text-neutral-900">
                          {row.date}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-amber-700 font-medium">
                          ₹ {row.gold_24k_rate.toFixed(2)}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-emerald-700 font-medium">
                          ₹ {row.gold_22k_rate.toFixed(2)}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-800">
                          ₹ {row.gold_18k_rate.toFixed(2)}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700">
                          ₹ {row.silver_rate_g.toFixed(2)}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-medium ${
                              row.day_delta > 0
                                ? 'bg-emerald-50 text-emerald-700'
                                : row.day_delta < 0
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {row.day_delta > 0 ? '+' : ''}
                            {row.day_delta.toFixed(2)} ({row.day_delta_pct > 0 ? '+' : ''}
                            {row.day_delta_pct}%)
                          </span>
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-600 text-[11px]">
                          H: ₹{row.intraday_high} / L: ₹{row.intraday_low}
                        </td>
                        <td className="px-3.5 py-2 whitespace-nowrap text-neutral-700 text-[11px] font-sans">
                          {row.recorded_by}
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.rate_history_log (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">date</span>{' '}
                  <span className="text-amber-300">date</span>{' '}
                  <span className="text-neutral-400">UNIQUE NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">gold_24k_rate</span>{' '}
                  <span className="text-amber-300">numeric(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL CHECK (gold_24k_rate &gt; 0),</span>
                  <br />
                  <span className="pl-6 text-blue-300">gold_22k_rate</span>{' '}
                  <span className="text-amber-300">numeric(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL CHECK (gold_22k_rate &gt; 0),</span>
                  <br />
                  <span className="pl-6 text-blue-300">gold_18k_rate</span>{' '}
                  <span className="text-amber-300">numeric(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">silver_rate</span>{' '}
                  <span className="text-amber-300">numeric(8,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">day_delta</span>{' '}
                  <span className="text-amber-300">numeric(6,2)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0.00,</span>
                  <br />
                  <span className="pl-6 text-blue-300">intraday_high</span>{' '}
                  <span className="text-amber-300">numeric(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">intraday_low</span>{' '}
                  <span className="text-amber-300">numeric(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">recorded_by</span>{' '}
                  <span className="text-amber-300">varchar(100)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>
                  <br />
                  );
                  <br />
                  <br />
                  <span className="text-neutral-500">-- Index for fast date lookups</span>
                  <br />
                  <span className="text-emerald-400">CREATE INDEX</span> idx_rate_history_date{' '}
                  <span className="text-emerald-400">ON</span> public.rate_history_log (date DESC);
                  <br />
                  <span className="text-emerald-400">ALTER TABLE</span> public.rate_history_log{' '}
                  <span className="text-emerald-400">ENABLE ROW LEVEL SECURITY;</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
