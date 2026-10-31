'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  TrendingUp,
  Coins,
  Radio,
  Tv,
  RefreshCw,
  Plus,
  Check,
  ArrowUpRight,
  ShieldCheck,
  Scale,
  Sparkles,
  Copy,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Send,
  X,
  SlidersHorizontal,
} from 'lucide-react';

interface GoldRateRow {
  id: string;
  karat: string;
  purity_code: string;
  purity_percent: number;
  sell_rate_per_g: number;
  buy_rate_per_g: number;
  sovereign_10g_rate: number;
  bar_100g_rate: number;
  effective_time: string;
  published_by: string;
  status: 'CURRENT_ACTIVE' | 'ARCHIVED';
}

const INITIAL_RATES: GoldRateRow[] = [
  {
    id: 'dgr-01-24k-999',
    karat: '24K (Pure 999)',
    purity_code: 'Au 999',
    purity_percent: 99.9,
    sell_rate_per_g: 8120.0,
    buy_rate_per_g: 8010.0,
    sovereign_10g_rate: 81200.0,
    bar_100g_rate: 812000.0,
    effective_time: '2026-10-31 09:30 AM',
    published_by: 'B. S. Rao (Chief Valuer)',
    status: 'CURRENT_ACTIVE',
  },
  {
    id: 'dgr-02-22k-916',
    karat: '22K (Hallmark 916)',
    purity_code: 'Au 916 (BIS)',
    purity_percent: 91.67,
    sell_rate_per_g: 7850.0,
    buy_rate_per_g: 7720.0,
    sovereign_10g_rate: 78500.0,
    bar_100g_rate: 785000.0,
    effective_time: '2026-10-31 09:30 AM',
    published_by: 'B. S. Rao (Chief Valuer)',
    status: 'CURRENT_ACTIVE',
  },
  {
    id: 'dgr-03-18k-750',
    karat: '18K (Jewellery 750)',
    purity_code: 'Au 750',
    purity_percent: 75.0,
    sell_rate_per_g: 6420.0,
    buy_rate_per_g: 6280.0,
    sovereign_10g_rate: 64200.0,
    bar_100g_rate: 642000.0,
    effective_time: '2026-10-31 09:30 AM',
    published_by: 'B. S. Rao (Chief Valuer)',
    status: 'CURRENT_ACTIVE',
  },
  {
    id: 'dgr-04-14k-585',
    karat: '14K (Jewellery 585)',
    purity_code: 'Au 585',
    purity_percent: 58.5,
    sell_rate_per_g: 5010.0,
    buy_rate_per_g: 4890.0,
    sovereign_10g_rate: 50100.0,
    bar_100g_rate: 501000.0,
    effective_time: '2026-10-31 09:30 AM',
    published_by: 'B. S. Rao (Chief Valuer)',
    status: 'CURRENT_ACTIVE',
  },
  {
    id: 'dgr-05-24k-hist-1',
    karat: '24K (Pure 999) - Evening Close',
    purity_code: 'Au 999',
    purity_percent: 99.9,
    sell_rate_per_g: 8100.0,
    buy_rate_per_g: 7990.0,
    sovereign_10g_rate: 81000.0,
    bar_100g_rate: 810000.0,
    effective_time: '2026-10-30 06:45 PM',
    published_by: 'M. Sridhar (Store Admin)',
    status: 'ARCHIVED',
  },
  {
    id: 'dgr-06-22k-hist-1',
    karat: '22K (Hallmark 916) - Evening Close',
    purity_code: 'Au 916 (BIS)',
    purity_percent: 91.67,
    sell_rate_per_g: 7831.5,
    buy_rate_per_g: 7701.5,
    sovereign_10g_rate: 78315.0,
    bar_100g_rate: 783150.0,
    effective_time: '2026-10-30 06:45 PM',
    published_by: 'M. Sridhar (Store Admin)',
    status: 'ARCHIVED',
  },
];

export function RatesGoldRatesView() {
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [rates, setRates] = useState<GoldRateRow[]>(INITIAL_RATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CURRENT_ACTIVE' | 'ARCHIVED'>('ALL');

  // Broadcast & Quick Update Modal State
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [base24kRate, setBase24kRate] = useState('8120');
  const [buybackMargin, setBuybackMargin] = useState('110');
  const [broadcastTarget, setBroadcastTarget] = useState('ALL_BOARDS_AND_POS');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quick Calculator State
  const [calcKarat, setCalcKarat] = useState('22K');
  const [calcGrams, setCalcGrams] = useState('8.000');
  const [calcWastage, setCalcWastage] = useState('10.0');
  const [calcMakingPerGram, setCalcMakingPerGram] = useState('450');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleBroadcastRates = (e: React.FormEvent) => {
    e.preventDefault();
    const rate24 = parseFloat(base24kRate) || 8120;
    const margin = parseFloat(buybackMargin) || 110;
    const timestamp = 'Today ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Derive standard karats
    const new24: GoldRateRow = {
      id: `dgr-${Date.now()}-24k`,
      karat: '24K (Pure 999)',
      purity_code: 'Au 999',
      purity_percent: 99.9,
      sell_rate_per_g: Math.round(rate24 * 10) / 10,
      buy_rate_per_g: Math.round((rate24 - margin) * 10) / 10,
      sovereign_10g_rate: Math.round(rate24 * 10),
      bar_100g_rate: Math.round(rate24 * 100),
      effective_time: timestamp,
      published_by: 'B. S. Rao (Chief Valuer)',
      status: 'CURRENT_ACTIVE',
    };

    const rate22 = Math.round((rate24 * (22 / 24)) * 10) / 10;
    const new22: GoldRateRow = {
      id: `dgr-${Date.now()}-22k`,
      karat: '22K (Hallmark 916)',
      purity_code: 'Au 916 (BIS)',
      purity_percent: 91.67,
      sell_rate_per_g: rate22,
      buy_rate_per_g: Math.round((rate22 - margin) * 10) / 10,
      sovereign_10g_rate: Math.round(rate22 * 10),
      bar_100g_rate: Math.round(rate22 * 100),
      effective_time: timestamp,
      published_by: 'B. S. Rao (Chief Valuer)',
      status: 'CURRENT_ACTIVE',
    };

    const rate18 = Math.round((rate24 * (18 / 24)) * 10) / 10;
    const new18: GoldRateRow = {
      id: `dgr-${Date.now()}-18k`,
      karat: '18K (Jewellery 750)',
      purity_code: 'Au 750',
      purity_percent: 75.0,
      sell_rate_per_g: rate18,
      buy_rate_per_g: Math.round((rate18 - margin) * 10) / 10,
      sovereign_10g_rate: Math.round(rate18 * 10),
      bar_100g_rate: Math.round(rate18 * 100),
      effective_time: timestamp,
      published_by: 'B. S. Rao (Chief Valuer)',
      status: 'CURRENT_ACTIVE',
    };

    const rate14 = Math.round((rate24 * (14 / 24)) * 10) / 10;
    const new14: GoldRateRow = {
      id: `dgr-${Date.now()}-14k`,
      karat: '14K (Jewellery 585)',
      purity_code: 'Au 585',
      purity_percent: 58.5,
      sell_rate_per_g: rate14,
      buy_rate_per_g: Math.round((rate14 - margin) * 10) / 10,
      sovereign_10g_rate: Math.round(rate14 * 10),
      bar_100g_rate: Math.round(rate14 * 100),
      effective_time: timestamp,
      published_by: 'B. S. Rao (Chief Valuer)',
      status: 'CURRENT_ACTIVE',
    };

    // Archive previous active rates and prepend new rates
    const updated = rates.map((r) => ({
      ...r,
      status: 'ARCHIVED' as const,
    }));

    setRates([new24, new22, new18, new14, ...updated]);
    setBroadcastSuccess(true);
    setTimeout(() => {
      setBroadcastSuccess(false);
      setIsUpdateModalOpen(false);
    }, 1400);
  };

  const filteredRates = rates.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        r.karat.toLowerCase().includes(q) ||
        r.purity_code.toLowerCase().includes(q) ||
        r.published_by.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate quick quote
  const calcGramsNum = parseFloat(calcGrams) || 0;
  const current22k = rates.find((r) => r.karat.includes('22K') && r.status === 'CURRENT_ACTIVE')?.sell_rate_per_g || 7850;
  const current18k = rates.find((r) => r.karat.includes('18K') && r.status === 'CURRENT_ACTIVE')?.sell_rate_per_g || 6420;
  const current24k = rates.find((r) => r.karat.includes('24K') && r.status === 'CURRENT_ACTIVE')?.sell_rate_per_g || 8120;
  const activeCalcRate = calcKarat === '24K' ? current24k : calcKarat === '18K' ? current18k : current22k;
  const goldValue = calcGramsNum * activeCalcRate;
  const wastageGrams = calcGramsNum * ((parseFloat(calcWastage) || 0) / 100);
  const wastageValue = wastageGrams * activeCalcRate;
  const makingValue = calcGramsNum * (parseFloat(calcMakingPerGram) || 0);
  const subtotal = goldValue + wastageValue + makingValue;
  const gstAmount = subtotal * 0.03;
  const grandTotal = subtotal + gstAmount;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="rates_gold" />
      <ActionToolbar
        filterPlaceholder="Filter by karat, purity code, auditor..."
        insertLabel="Broadcast Live Rates"
        onInsertClick={() => setIsUpdateModalOpen(true)}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* Top Live Tickers & KPI Metrics */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* KPI 1 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">24K Sell Rate</span>
                <Coins className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">₹ 8,120.00 /g</div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-mono">
                <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                +₹20.00 (+0.25%) today
              </div>
            </div>

            {/* KPI 2 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">22K Hallmark 916</span>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">₹ 7,850.00 /g</div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-mono">
                <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                +₹18.50 (+0.24%) today
              </div>
            </div>

            {/* KPI 3 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">IBJA Market Feed</span>
                <Radio className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ONLINE
              </div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Synced 09:30 AM IST
              </div>
            </div>

            {/* KPI 4 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-blue-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">LED Display Boards</span>
                <Tv className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">4 / 4 Synced</div>
              <div className="text-[11px] text-blue-600 mt-1 font-mono">
                Window & Billing Displays
              </div>
            </div>

            {/* KPI 5 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-neutral-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Active Bullion Stock</span>
                <Scale className="w-3.5 h-3.5 text-neutral-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">38.450 kg</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Valuation ₹ 30.18 Cr
              </div>
            </div>
          </div>
        </div>

        {/* Live Broadcast Action Bar & Retail Quote Estimator */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Col 1 & 2: Quick Broadcast Banner & Info */}
          <div className="lg:col-span-2 p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-medium text-neutral-900 uppercase tracking-wider">
                    Instant Board Rate Broadcaster
                  </span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-mono">
                  Daily Revision #1
                </span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed mb-3">
                Updating the 24K pure benchmark will automatically adjust 22K (91.67%), 18K (75%), and 14K (58.5%) rates across all POS billing terminals, showroom digital LED screens, and customer mobile apps simultaneously.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-[#e2e8f0]">
              <button
                onClick={() => setIsUpdateModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Adjust Base Rate & Broadcast</span>
              </button>

              <button
                onClick={() => {
                  setRates([...rates]);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-neutral-500" />
                <span>Sync with IBJA Feed</span>
              </button>

              <span className="text-[11px] text-neutral-500 ml-auto font-mono">
                Last broadcast: 09:30 AM by B. S. Rao
              </span>
            </div>
          </div>

          {/* Col 3: Quick Customer Counter Quote Estimator */}
          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex flex-col justify-between">
            <div>
              <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                  Quick Counter Rate Estimator
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">Realtime</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="text-[10px] font-medium text-neutral-600 block mb-0.5">Karat</label>
                  <select
                    value={calcKarat}
                    onChange={(e) => setCalcKarat(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none"
                  >
                    <option value="22K">22K (₹{current22k}/g)</option>
                    <option value="24K">24K (₹{current24k}/g)</option>
                    <option value="18K">18K (₹{current18k}/g)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-neutral-600 block mb-0.5">Gross Wt (g)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={calcGrams}
                    onChange={(e) => setCalcGrams(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2.5">
                <div>
                  <label className="text-[10px] font-medium text-neutral-600 block mb-0.5">VA Wastage %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={calcWastage}
                    onChange={(e) => setCalcWastage(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-neutral-600 block mb-0.5">Making ₹/g</label>
                  <input
                    type="number"
                    value={calcMakingPerGram}
                    onChange={(e) => setCalcMakingPerGram(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-xs">
              <span className="text-neutral-500">Est. Total (+3% GST):</span>
              <span className="text-sm font-medium text-emerald-700 font-mono">
                ₹ {Math.round(grandTotal).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Supabase-style Table / Schema Definition Section */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            {/* Table Header Info Bar */}
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-600" />
                <span className="font-mono font-medium text-neutral-800">
                  daily_gold_rates
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Showing {filteredRates.length} of {rates.length} rates
                </span>
              </div>

              {/* Status Filter & Data/Definition Tab Toggle */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                  <span className="text-[11px] text-neutral-500">Filter:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Records</option>
                    <option value="CURRENT_ACTIVE">Current Active</option>
                    <option value="ARCHIVED">Archived History</option>
                  </select>
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
                          <span className="text-neutral-800">karat_grade</span>
                          <span className="text-neutral-400 font-normal text-[10px]">varchar</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">purity_code</span>
                          <span className="text-neutral-400 font-normal text-[10px]">purity_%</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">sell_rate_per_g</span>
                          <span className="text-neutral-400 font-normal text-[10px]">retail_inr</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">buy_rate_per_g</span>
                          <span className="text-neutral-400 font-normal text-[10px]">scrap_inr</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">10g_sovereign</span>
                          <span className="text-neutral-400 font-normal text-[10px]">coin_inr</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">100g_bar</span>
                          <span className="text-neutral-400 font-normal text-[10px]">bullion_inr</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">effective_time</span>
                          <span className="text-neutral-400 font-normal text-[10px]">timestamp</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">published_by</span>
                          <span className="text-neutral-400 font-normal text-[10px]">signer</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 font-medium text-center whitespace-nowrap">
                        <span className="text-neutral-800">status</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb]">
                    {filteredRates.map((row) => (
                      <tr
                        key={row.id}
                        className={`hover:bg-[#f8fafc] transition-colors font-mono ${
                          row.status === 'CURRENT_ACTIVE' ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        <td className="px-3 py-2 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-neutral-900 font-sans font-medium">{row.karat}</span>
                            {row.status === 'CURRENT_ACTIVE' && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span className="text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded text-[11px]">
                            {row.purity_code} ({row.purity_percent}%)
                          </span>
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-emerald-700 font-medium">
                          ₹ {row.sell_rate_per_g.toFixed(2)}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-800">
                          ₹ {row.buy_rate_per_g.toFixed(2)}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-800">
                          ₹ {row.sovereign_10g_rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-800">
                          ₹ {row.bar_100g_rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-600 text-[11px]">
                          {row.effective_time}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700 text-[11px] font-sans">
                          {row.published_by}
                        </td>
                        <td className="px-3.5 py-2 whitespace-nowrap text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              row.status === 'CURRENT_ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                            }`}
                          >
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.daily_gold_rates (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">karat</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">purity_percentage</span>{' '}
                  <span className="text-amber-300">numeric(5,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL CHECK (purity_percentage &gt; 0),</span>
                  <br />
                  <span className="pl-6 text-blue-300">sell_rate_per_g</span>{' '}
                  <span className="text-amber-300">numeric(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL CHECK (sell_rate_per_g &gt; 0),</span>
                  <br />
                  <span className="pl-6 text-blue-300">buy_rate_per_g</span>{' '}
                  <span className="text-amber-300">numeric(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL CHECK (buy_rate_per_g &lt;= sell_rate_per_g),</span>
                  <br />
                  <span className="pl-6 text-blue-300">sovereign_10g_rate</span>{' '}
                  <span className="text-amber-300">numeric(12,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">bar_100g_rate</span>{' '}
                  <span className="text-amber-300">numeric(14,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">is_current</span>{' '}
                  <span className="text-amber-300">boolean</span>{' '}
                  <span className="text-neutral-400">DEFAULT true,</span>
                  <br />
                  <span className="pl-6 text-blue-300">effective_time</span>{' '}
                  <span className="text-amber-300">timestamptz</span>{' '}
                  <span className="text-neutral-400">DEFAULT now() NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">published_by_user_id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">REFERENCES auth.users(id)</span>
                  <br />
                  );
                  <br />
                  <br />
                  <span className="text-neutral-500">-- Index for instantaneous current rate lookups on POS checkout</span>
                  <br />
                  <span className="text-emerald-400">CREATE INDEX</span> idx_gold_rates_current{' '}
                  <span className="text-emerald-400">ON</span> public.daily_gold_rates (is_current, effective_time DESC);
                  <br />
                  <span className="text-emerald-400">ALTER TABLE</span> public.daily_gold_rates{' '}
                  <span className="text-emerald-400">ENABLE ROW LEVEL SECURITY;</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Broadcast Live Rate Modal / Drawer */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            <div className="px-5 py-3.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span className="text-sm font-medium text-neutral-900">
                  Broadcast Live Gold Rate Revision
                </span>
              </div>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBroadcastRates} className="p-5 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-800 leading-relaxed">
                Entering the base 24K pure benchmark will recompute all retail jewellery karats (22K, 18K, 14K) and sync with all connected store hardware immediately.
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">
                  New 24K Pure (999) Sell Rate (₹ per gram)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-xs">₹</span>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={base24kRate}
                    onChange={(e) => setBase24kRate(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                    placeholder="e.g. 8120"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">
                  Scrap / Buyback Margin Spread (₹ deduction per gram)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-xs">₹</span>
                  <input
                    type="number"
                    step="1"
                    required
                    value={buybackMargin}
                    onChange={(e) => setBuybackMargin(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                    placeholder="e.g. 110"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Old gold exchange buy rate will automatically be set to (Sell Rate - ₹{buybackMargin}).
                </p>
              </div>

              {/* Derived Rates Preview Box */}
              <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-md text-xs font-mono space-y-1.5">
                <div className="text-[11px] font-sans font-medium text-neutral-600 mb-1">
                  Calculated Karat Breakdown:
                </div>
                <div className="flex justify-between text-neutral-700">
                  <span>24K (99.9%):</span>
                  <span className="font-medium text-emerald-700">₹ {(parseFloat(base24kRate) || 0).toFixed(1)} /g</span>
                </div>
                <div className="flex justify-between text-neutral-700">
                  <span>22K (91.67% BIS Hallmark):</span>
                  <span className="font-medium text-emerald-700">₹ {((parseFloat(base24kRate) || 0) * (22 / 24)).toFixed(1)} /g</span>
                </div>
                <div className="flex justify-between text-neutral-700">
                  <span>18K (75.0% Diamond Grade):</span>
                  <span className="font-medium text-emerald-700">₹ {((parseFloat(base24kRate) || 0) * (18 / 24)).toFixed(1)} /g</span>
                </div>
                <div className="flex justify-between text-neutral-700">
                  <span>14K (58.5%):</span>
                  <span className="font-medium text-emerald-700">₹ {((parseFloat(base24kRate) || 0) * (14 / 24)).toFixed(1)} /g</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">
                  Broadcast Destination Channel
                </label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                >
                  <option value="ALL_BOARDS_AND_POS">All Store LED Boards + POS Terminals + Mobile App</option>
                  <option value="POS_COUNTERS_ONLY">Billing POS Counters Only (Internal Draft)</option>
                  <option value="LED_BOARDS_ONLY">Showroom LED Window Display Boards Only</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#e5e7eb] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={broadcastSuccess}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium text-white transition-colors shadow-2xs cursor-pointer ${
                    broadcastSuccess ? 'bg-emerald-600' : 'bg-neutral-900 hover:bg-neutral-800'
                  }`}
                >
                  {broadcastSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Rates Broadcasted!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Push to POS & Display Boards</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
