'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  TrendingUp,
  CircleDollarSign,
  Radio,
  Tv,
  RefreshCw,
  Plus,
  Check,
  ArrowUpRight,
  ShieldCheck,
  Scale,
  Sparkles,
  Layers,
  Calculator,
  Send,
  X,
  SlidersHorizontal,
  PackageCheck,
  FileSpreadsheet,
  Boxes,
} from 'lucide-react';

interface SilverRateRow {
  id: string;
  purity_grade: string;
  purity_code: string;
  purity_percent: number;
  rate_per_gram: number;
  rate_per_kg: number;
  buyback_rate_per_g: number;
  bar_1kg_rate: number;
  effective_date: string;
  updated_by: string;
  status: 'CURRENT_ACTIVE' | 'ARCHIVED';
}

const INITIAL_SILVER_RATES: SilverRateRow[] = [
  {
    id: 'dsr-01-999-fine',
    purity_grade: 'Fine Silver 999 (Bars & Grain)',
    purity_code: 'Ag 999',
    purity_percent: 99.9,
    rate_per_gram: 98.5,
    rate_per_kg: 98500.0,
    buyback_rate_per_g: 94.0,
    bar_1kg_rate: 98500.0,
    effective_date: '2026-10-31 09:30 AM',
    updated_by: 'B. S. Rao (Chief Valuer)',
    status: 'CURRENT_ACTIVE',
  },
  {
    id: 'dsr-02-925-sterling',
    purity_grade: 'Sterling Silver 925 (Jewellery & Articles)',
    purity_code: 'Ag 925 (Standard)',
    purity_percent: 92.5,
    rate_per_gram: 91.2,
    rate_per_kg: 91200.0,
    buyback_rate_per_g: 86.5,
    bar_1kg_rate: 91200.0,
    effective_date: '2026-10-31 09:30 AM',
    updated_by: 'B. S. Rao (Chief Valuer)',
    status: 'CURRENT_ACTIVE',
  },
  {
    id: 'dsr-03-800-utensils',
    purity_grade: 'Traditional Silverware 800 (Utensils & Murtis)',
    purity_code: 'Ag 800',
    purity_percent: 80.0,
    rate_per_gram: 78.8,
    rate_per_kg: 78800.0,
    buyback_rate_per_g: 74.0,
    bar_1kg_rate: 78800.0,
    effective_date: '2026-10-31 09:30 AM',
    updated_by: 'B. S. Rao (Chief Valuer)',
    status: 'CURRENT_ACTIVE',
  },
  {
    id: 'dsr-04-999-prev',
    purity_grade: 'Fine Silver 999 - Yesterday Close',
    purity_code: 'Ag 999',
    purity_percent: 99.9,
    rate_per_gram: 97.7,
    rate_per_kg: 97700.0,
    buyback_rate_per_g: 93.2,
    bar_1kg_rate: 97700.0,
    effective_date: '2026-10-30 06:30 PM',
    updated_by: 'M. Sridhar (Store Admin)',
    status: 'ARCHIVED',
  },
  {
    id: 'dsr-05-925-prev',
    purity_grade: 'Sterling Silver 925 - Yesterday Close',
    purity_code: 'Ag 925',
    purity_percent: 92.5,
    rate_per_gram: 90.4,
    rate_per_kg: 90400.0,
    buyback_rate_per_g: 85.8,
    bar_1kg_rate: 90400.0,
    effective_date: '2026-10-30 06:30 PM',
    updated_by: 'M. Sridhar (Store Admin)',
    status: 'ARCHIVED',
  },
];

export function RatesSilverRatesView() {
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [rates, setRates] = useState<SilverRateRow[]>(INITIAL_SILVER_RATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CURRENT_ACTIVE' | 'ARCHIVED'>('ALL');

  // Modal / Drawer state
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [inputRatePerKg, setInputRatePerKg] = useState('98500');
  const [buybackDiscountPct, setBuybackDiscountPct] = useState('4.5');
  const [broadcastTarget, setBroadcastTarget] = useState('ALL');
  const [broadcastDone, setBroadcastDone] = useState(false);

  // Estimator state
  const [calcArticleType, setCalcArticleType] = useState('PUJA_THALI');
  const [calcGrams, setCalcGrams] = useState('250.000');
  const [calcPurity, setCalcPurity] = useState('925');

  const handleUpdateSilverRates = (e: React.FormEvent) => {
    e.preventDefault();
    const kg = parseFloat(inputRatePerKg) || 98500;
    const perGram999 = kg / 1000;
    const discount = (parseFloat(buybackDiscountPct) || 4.5) / 100;
    const timeStr = 'Today ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const new999: SilverRateRow = {
      id: `dsr-${Date.now()}-999`,
      purity_grade: 'Fine Silver 999 (Bars & Grain)',
      purity_code: 'Ag 999',
      purity_percent: 99.9,
      rate_per_gram: Math.round(perGram999 * 100) / 100,
      rate_per_kg: kg,
      buyback_rate_per_g: Math.round((perGram999 * (1 - discount)) * 100) / 100,
      bar_1kg_rate: kg,
      effective_date: timeStr,
      updated_by: 'B. S. Rao (Chief Valuer)',
      status: 'CURRENT_ACTIVE',
    };

    const perGram925 = perGram999 * (92.5 / 99.9);
    const new925: SilverRateRow = {
      id: `dsr-${Date.now()}-925`,
      purity_grade: 'Sterling Silver 925 (Jewellery & Articles)',
      purity_code: 'Ag 925 (Standard)',
      purity_percent: 92.5,
      rate_per_gram: Math.round(perGram925 * 100) / 100,
      rate_per_kg: Math.round(perGram925 * 1000),
      buyback_rate_per_g: Math.round((perGram925 * (1 - discount)) * 100) / 100,
      bar_1kg_rate: Math.round(perGram925 * 1000),
      effective_date: timeStr,
      updated_by: 'B. S. Rao (Chief Valuer)',
      status: 'CURRENT_ACTIVE',
    };

    const perGram800 = perGram999 * (80.0 / 99.9);
    const new800: SilverRateRow = {
      id: `dsr-${Date.now()}-800`,
      purity_grade: 'Traditional Silverware 800 (Utensils & Murtis)',
      purity_code: 'Ag 800',
      purity_percent: 80.0,
      rate_per_gram: Math.round(perGram800 * 100) / 100,
      rate_per_kg: Math.round(perGram800 * 1000),
      buyback_rate_per_g: Math.round((perGram800 * (1 - discount)) * 100) / 100,
      bar_1kg_rate: Math.round(perGram800 * 1000),
      effective_date: timeStr,
      updated_by: 'B. S. Rao (Chief Valuer)',
      status: 'CURRENT_ACTIVE',
    };

    const archived = rates.map((r) => ({ ...r, status: 'ARCHIVED' as const }));
    setRates([new999, new925, new800, ...archived]);
    setBroadcastDone(true);
    setTimeout(() => {
      setBroadcastDone(false);
      setIsUpdateModalOpen(false);
    }, 1400);
  };

  const filteredRates = rates.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        r.purity_grade.toLowerCase().includes(q) ||
        r.purity_code.toLowerCase().includes(q) ||
        r.updated_by.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate article estimate
  const current999Rate = rates.find((r) => r.purity_grade.includes('999') && r.status === 'CURRENT_ACTIVE')?.rate_per_gram || 98.5;
  const current925Rate = rates.find((r) => r.purity_grade.includes('925') && r.status === 'CURRENT_ACTIVE')?.rate_per_gram || 91.2;
  const activeRateG = calcPurity === '999' ? current999Rate : current925Rate;
  const weightG = parseFloat(calcGrams) || 0;
  const silverBaseValue = weightG * activeRateG;

  let makingPerG = 12;
  let wastagePercent = 8.5;
  if (calcArticleType === 'PUJA_THALI') {
    makingPerG = 14;
    wastagePercent = 8.5;
  } else if (calcArticleType === 'ANTIQUE_MURTI') {
    makingPerG = 24;
    wastagePercent = 12.0;
  } else if (calcArticleType === 'SILVER_COIN') {
    makingPerG = 3;
    wastagePercent = 1.0;
  } else if (calcArticleType === 'ANKLETS_CHAINS') {
    makingPerG = 28;
    wastagePercent = 9.0;
  }

  const wastageVal = (weightG * (wastagePercent / 100)) * activeRateG;
  const makingVal = weightG * makingPerG;
  const estSubtotal = silverBaseValue + wastageVal + makingVal;
  const estGst = estSubtotal * 0.03;
  const estGrandTotal = estSubtotal + estGst;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="rates_silver" />
      <ActionToolbar
        filterPlaceholder="Filter by purity grade, code, modifier..."
        insertLabel="Broadcast Silver Rates"
        onInsertClick={() => setIsUpdateModalOpen(true)}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics Summary Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* KPI 1 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-slate-400 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Fine Silver 999</span>
                <CircleDollarSign className="w-3.5 h-3.5 text-neutral-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">₹ 98.50 /g</div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-mono">
                <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                ₹ 98,500 /kg (+₹0.80)
              </div>
            </div>

            {/* KPI 2 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-slate-400 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Sterling 925 Grade</span>
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">₹ 91.20 /g</div>
              <div className="text-[11px] text-neutral-600 mt-1 font-mono">
                ₹ 91,200 /kg standard
              </div>
            </div>

            {/* KPI 3 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-slate-400 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Articles Wastage VA</span>
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">8.5% Std</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Pooja articles & dinnerware
              </div>
            </div>

            {/* KPI 4 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-slate-400 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Bullion Safe Stock</span>
                <Scale className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">124.8 kg</div>
              <div className="text-[11px] text-blue-600 mt-1 font-mono">
                Valuation ₹ 1.23 Cr
              </div>
            </div>

            {/* KPI 5 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-slate-400 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Coins & Minted Bars</span>
                <Boxes className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">850 pcs</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                10g, 50g, 100g, 500g, 1kg
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Rules & Quick Estimator Section */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Differential Pricing Rules Card */}
          <div className="lg:col-span-2 p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex flex-col justify-between">
            <div>
              <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <PackageCheck className="w-3.5 h-3.5 text-neutral-700" />
                  Differential Silver Pricing Categories
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                  Active Formula
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-3 text-xs">
                <div className="p-2.5 rounded bg-white border border-[#e2e8f0]">
                  <div className="font-medium text-neutral-900 mb-1">Raw Bullion / Grain</div>
                  <div className="text-[11px] text-neutral-500">Fine 999 Bars & Casted Pellets</div>
                  <div className="mt-2 text-emerald-700 font-mono text-xs">Market Rate + 0% VA</div>
                </div>
                <div className="p-2.5 rounded bg-white border border-[#e2e8f0]">
                  <div className="font-medium text-neutral-900 mb-1">Hallmarked Articles</div>
                  <div className="text-[11px] text-neutral-500">Diyas, Puja Thalis, Kalash</div>
                  <div className="mt-2 text-neutral-800 font-mono text-xs">+8.5% VA + ₹14/g MC</div>
                </div>
                <div className="p-2.5 rounded bg-white border border-[#e2e8f0]">
                  <div className="font-medium text-neutral-900 mb-1">Antique & Temple Ware</div>
                  <div className="text-[11px] text-neutral-500">Idols, Filigree & Oxidized Sets</div>
                  <div className="mt-2 text-neutral-800 font-mono text-xs">+12.0% VA + ₹24/g MC</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#e2e8f0]">
              <span className="text-[11px] text-neutral-500 font-mono">
                Old silver exchange buyback standard: 95.5% of assessed fine weight
              </span>
              <button
                onClick={() => setIsUpdateModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Adjust Silver Base / Kg</span>
              </button>
            </div>
          </div>

          {/* Quick Silver Counter Estimator */}
          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex flex-col justify-between">
            <div>
              <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-neutral-700" />
                  Silver Article Estimator
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">Counter POS</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="text-[10px] font-medium text-neutral-600 block mb-0.5">Article Type</label>
                  <select
                    value={calcArticleType}
                    onChange={(e) => setCalcArticleType(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none"
                  >
                    <option value="PUJA_THALI">Puja Thali / Kalash</option>
                    <option value="ANTIQUE_MURTI">Antique Murti / Idol</option>
                    <option value="SILVER_COIN">Silver Coin / Bar</option>
                    <option value="ANKLETS_CHAINS">Sterling Anklets</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-neutral-600 block mb-0.5">Weight (Grams)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={calcGrams}
                    onChange={(e) => setCalcGrams(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2.5">
                <div>
                  <label className="text-[10px] font-medium text-neutral-600 block mb-0.5">Purity Grade</label>
                  <select
                    value={calcPurity}
                    onChange={(e) => setCalcPurity(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none"
                  >
                    <option value="925">Sterling 925 (₹{current925Rate}/g)</option>
                    <option value="999">Fine 999 (₹{current999Rate}/g)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-neutral-600 block mb-0.5">VA + Making</label>
                  <div className="px-2 py-1 text-xs bg-neutral-100 rounded text-neutral-700 font-mono">
                    {wastagePercent}% + ₹{makingPerG}/g
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-xs">
              <span className="text-neutral-500">Estimate (+3% GST):</span>
              <span className="text-sm font-medium text-emerald-700 font-mono">
                ₹ {Math.round(estGrandTotal).toLocaleString('en-IN')}
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
                <CircleDollarSign className="w-4 h-4 text-neutral-700" />
                <span className="font-mono font-medium text-neutral-800">
                  daily_silver_rates
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
                          <span className="text-neutral-800">purity_grade</span>
                          <span className="text-neutral-400 font-normal text-[10px]">varchar</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">purity_code</span>
                          <span className="text-neutral-400 font-normal text-[10px]">symbol</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">rate_per_gram</span>
                          <span className="text-neutral-400 font-normal text-[10px]">₹/g</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">rate_per_kg</span>
                          <span className="text-neutral-400 font-normal text-[10px]">₹/kg</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">buyback_scrap_rate</span>
                          <span className="text-neutral-400 font-normal text-[10px]">₹/g</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">effective_date</span>
                          <span className="text-neutral-400 font-normal text-[10px]">timestamp</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">updated_by</span>
                          <span className="text-neutral-400 font-normal text-[10px]">user</span>
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
                          row.status === 'CURRENT_ACTIVE' ? 'bg-slate-50/40' : ''
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
                            <span className="text-neutral-900 font-sans font-medium">{row.purity_grade}</span>
                            {row.status === 'CURRENT_ACTIVE' && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span className="text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded text-[11px]">
                            {row.purity_code}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-emerald-700 font-medium">
                          ₹ {row.rate_per_gram.toFixed(2)}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-800 font-medium">
                          ₹ {row.rate_per_kg.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700">
                          ₹ {row.buyback_rate_per_g.toFixed(2)}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-600 text-[11px]">
                          {row.effective_date}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700 text-[11px] font-sans">
                          {row.updated_by}
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.daily_silver_rates (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">purity_grade</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">purity_code</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">rate_per_gram</span>{' '}
                  <span className="text-amber-300">numeric(8,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL CHECK (rate_per_gram &gt; 0),</span>
                  <br />
                  <span className="pl-6 text-blue-300">rate_per_kg</span>{' '}
                  <span className="text-amber-300">numeric(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL CHECK (rate_per_kg &gt; 0),</span>
                  <br />
                  <span className="pl-6 text-blue-300">buyback_rate_per_g</span>{' '}
                  <span className="text-amber-300">numeric(8,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">is_active</span>{' '}
                  <span className="text-amber-300">boolean</span>{' '}
                  <span className="text-neutral-400">DEFAULT true,</span>
                  <br />
                  <span className="pl-6 text-blue-300">effective_date</span>{' '}
                  <span className="text-amber-300">timestamptz</span>{' '}
                  <span className="text-neutral-400">DEFAULT now() NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">updated_by_user_id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">REFERENCES auth.users(id)</span>
                  <br />
                  );
                  <br />
                  <br />
                  <span className="text-neutral-500">-- Index for active rate retrieval</span>
                  <br />
                  <span className="text-emerald-400">CREATE INDEX</span> idx_silver_rates_active{' '}
                  <span className="text-emerald-400">ON</span> public.daily_silver_rates (is_active, effective_date DESC);
                  <br />
                  <span className="text-emerald-400">ALTER TABLE</span> public.daily_silver_rates{' '}
                  <span className="text-emerald-400">ENABLE ROW LEVEL SECURITY;</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Broadcast Silver Rate Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            <div className="px-5 py-3.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CircleDollarSign className="w-4 h-4 text-neutral-700" />
                <span className="text-sm font-medium text-neutral-900">
                  Update & Broadcast Silver Board Rates
                </span>
              </div>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSilverRates} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">
                  Fine Silver 999 Benchmark Rate (₹ per Kilogram)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-xs">₹</span>
                  <input
                    type="number"
                    step="50"
                    required
                    value={inputRatePerKg}
                    onChange={(e) => setInputRatePerKg(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                    placeholder="e.g. 98500"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-1 font-mono">
                  <span>Equivalent per gram:</span>
                  <span className="font-medium text-emerald-700">₹ {((parseFloat(inputRatePerKg) || 0) / 1000).toFixed(2)} /g</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">
                  Scrap / Buyback Deduction Discount (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={buybackDiscountPct}
                  onChange={(e) => setBuybackDiscountPct(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  placeholder="e.g. 4.5"
                />
              </div>

              {/* Derived Preview */}
              <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-md text-xs font-mono space-y-1">
                <div className="text-[11px] font-sans font-medium text-neutral-600 mb-1">
                  Derived Market Grid:
                </div>
                <div className="flex justify-between text-neutral-700">
                  <span>Fine 999:</span>
                  <span className="font-medium text-emerald-700">₹ {((parseFloat(inputRatePerKg) || 0) / 1000).toFixed(2)} /g (₹{parseFloat(inputRatePerKg) || 0}/kg)</span>
                </div>
                <div className="flex justify-between text-neutral-700">
                  <span>Sterling 925:</span>
                  <span className="font-medium text-emerald-700">₹ {(((parseFloat(inputRatePerKg) || 0) / 1000) * 0.925).toFixed(2)} /g</span>
                </div>
                <div className="flex justify-between text-neutral-700">
                  <span>Buyback Scrap 999:</span>
                  <span className="font-medium text-neutral-800">₹ {(((parseFloat(inputRatePerKg) || 0) / 1000) * (1 - (parseFloat(buybackDiscountPct) || 0)/100)).toFixed(2)} /g</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">
                  Broadcast Channels
                </label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                >
                  <option value="ALL">Showroom LED Windows + All POS Counters</option>
                  <option value="INTERNAL">Internal POS Counters Only</option>
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
                  disabled={broadcastDone}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium text-white transition-colors shadow-2xs cursor-pointer ${
                    broadcastDone ? 'bg-emerald-600' : 'bg-neutral-900 hover:bg-neutral-800'
                  }`}
                >
                  {broadcastDone ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Silver Rates Broadcasted!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Update & Push Silver Rates</span>
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
