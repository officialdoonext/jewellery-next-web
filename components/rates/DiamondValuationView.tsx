'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Gem,
  Sparkles,
  Calculator,
  Search,
  CheckCircle2,
  ShieldCheck,
  FileSpreadsheet,
  ExternalLink,
  Layers,
  ArrowUpRight,
  SlidersHorizontal,
  Check,
  Award,
  Zap,
} from 'lucide-react';

interface DiamondGridRow {
  id: string;
  clarity: string;
  color_grade: string;
  carat_range: string;
  base_price_per_ct_inr: number;
  rap_discount_pct: number;
  net_price_per_ct_inr: number;
  rapaport_code: string;
  lab_standard: string;
  effective_date: string;
}

const INITIAL_DIAMOND_GRIDS: DiamondGridRow[] = [
  {
    id: 'dpg-001',
    clarity: 'VVS1',
    color_grade: 'D-F (Colorless)',
    carat_range: '1.00 - 1.49 ct',
    base_price_per_ct_inr: 285000.0,
    rap_discount_pct: -22.0,
    net_price_per_ct_inr: 222300.0,
    rapaport_code: 'RAP-OCT26-100-DF-VVS1',
    lab_standard: 'GIA / IGI Certified',
    effective_date: '2026-10-15',
  },
  {
    id: 'dpg-002',
    clarity: 'VVS2',
    color_grade: 'E-F (Colorless)',
    carat_range: '0.50 - 0.99 ct',
    base_price_per_ct_inr: 185000.0,
    rap_discount_pct: -25.0,
    net_price_per_ct_inr: 138750.0,
    rapaport_code: 'RAP-OCT26-050-EF-VVS2',
    lab_standard: 'IGI / SGL Certified',
    effective_date: '2026-10-15',
  },
  {
    id: 'dpg-003',
    clarity: 'VS1',
    color_grade: 'G-H (Near Colorless)',
    carat_range: '0.50 - 0.99 ct',
    base_price_per_ct_inr: 142000.0,
    rap_discount_pct: -28.0,
    net_price_per_ct_inr: 102240.0,
    rapaport_code: 'RAP-OCT26-050-GH-VS1',
    lab_standard: 'GIA / IGI Certified',
    effective_date: '2026-10-15',
  },
  {
    id: 'dpg-004',
    clarity: 'VS2',
    color_grade: 'G-H (Near Colorless)',
    carat_range: '0.30 - 0.49 ct',
    base_price_per_ct_inr: 96000.0,
    rap_discount_pct: -30.0,
    net_price_per_ct_inr: 67200.0,
    rapaport_code: 'RAP-OCT26-030-GH-VS2',
    lab_standard: 'IGI Certified',
    effective_date: '2026-10-15',
  },
  {
    id: 'dpg-005',
    clarity: 'SI1',
    color_grade: 'I-J (Slight Tint)',
    carat_range: '0.30 - 0.49 ct',
    base_price_per_ct_inr: 72000.0,
    rap_discount_pct: -32.0,
    net_price_per_ct_inr: 48960.0,
    rapaport_code: 'RAP-OCT26-030-IJ-SI1',
    lab_standard: 'SGL Certified',
    effective_date: '2026-10-15',
  },
  {
    id: 'dpg-006',
    clarity: 'IF (Internally Flawless)',
    color_grade: 'D (Exceptional)',
    carat_range: '1.50 - 1.99 ct',
    base_price_per_ct_inr: 495000.0,
    rap_discount_pct: -18.0,
    net_price_per_ct_inr: 405900.0,
    rapaport_code: 'RAP-OCT26-150-D-IF',
    lab_standard: 'GIA Triple Excellent',
    effective_date: '2026-10-15',
  },
  {
    id: 'dpg-007',
    clarity: 'SI2',
    color_grade: 'K-L (Faint Yellow)',
    carat_range: '0.10 - 0.29 ct',
    base_price_per_ct_inr: 48000.0,
    rap_discount_pct: -35.0,
    net_price_per_ct_inr: 31200.0,
    rapaport_code: 'RAP-OCT26-010-KL-SI2',
    lab_standard: 'Commercial Star/Melee',
    effective_date: '2026-10-15',
  },
];

export function RatesDiamondValuationView() {
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [grids, setGrids] = useState<DiamondGridRow[]>(INITIAL_DIAMOND_GRIDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClarityFilter, setSelectedClarityFilter] = useState('ALL');

  // Interactive 4Cs Valuation Calculator State
  const [calcCarat, setCalcCarat] = useState('1.02');
  const [calcCut, setCalcCut] = useState<'EXCELLENT' | 'VERY_GOOD' | 'GOOD'>('EXCELLENT');
  const [calcColor, setCalcColor] = useState<'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J'>('E');
  const [calcClarity, setCalcClarity] = useState<'IF' | 'VVS1' | 'VVS2' | 'VS1' | 'VS2' | 'SI1' | 'SI2'>('VVS1');
  const [calcFluorescence, setCalcFluorescence] = useState<'NONE' | 'FAINT' | 'MEDIUM' | 'STRONG'>('NONE');
  const [certLookupNo, setCertLookupNo] = useState('GIA-2219481029');
  const [certVerified, setCertVerified] = useState(true);

  // Valuation Computation based on 4Cs
  const caratNum = parseFloat(calcCarat) || 0;

  // Base multiplier per ct
  let basePerCt = 180000;
  if (caratNum >= 1.5) basePerCt = 380000;
  else if (caratNum >= 1.0) basePerCt = 260000;
  else if (caratNum >= 0.5) basePerCt = 150000;
  else basePerCt = 85000;

  // Clarity multiplier
  const clarityMultipliers: Record<string, number> = {
    IF: 1.4,
    VVS1: 1.25,
    VVS2: 1.15,
    VS1: 1.0,
    VS2: 0.9,
    SI1: 0.78,
    SI2: 0.65,
  };

  // Color multiplier
  const colorMultipliers: Record<string, number> = {
    D: 1.2,
    E: 1.12,
    F: 1.05,
    G: 0.98,
    H: 0.92,
    I: 0.85,
    J: 0.78,
  };

  // Cut adjustment
  let cutAdjustment = 1.0;
  if (calcCut === 'EXCELLENT') cutAdjustment = 1.05;
  if (calcCut === 'GOOD') cutAdjustment = 0.92;

  // Fluorescence penalty
  let fluorPenalty = 1.0;
  if (calcFluorescence === 'MEDIUM') fluorPenalty = 0.96;
  if (calcFluorescence === 'STRONG') fluorPenalty = 0.91;

  const rawPerCarat = basePerCt * (clarityMultipliers[calcClarity] || 1.0) * (colorMultipliers[calcColor] || 1.0) * cutAdjustment * fluorPenalty;
  const rapDiscountPct = -24.0;
  const netPerCarat = rawPerCarat * (1 + rapDiscountPct / 100);
  const totalValuation = Math.round(netPerCarat * caratNum);

  const filteredGrids = grids.filter((g) => {
    if (selectedClarityFilter !== 'ALL' && !g.clarity.includes(selectedClarityFilter)) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        g.clarity.toLowerCase().includes(q) ||
        g.color_grade.toLowerCase().includes(q) ||
        g.rapaport_code.toLowerCase().includes(q) ||
        g.carat_range.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="rates_diamond" />
      <ActionToolbar
        filterPlaceholder="Filter by clarity, color, Rapaport code..."
        insertLabel="Update Rapaport Matrix"
        onInsertClick={() => alert('Rapaport Oct 2026 Grid is currently active.')}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics Summary Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* KPI 1 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-blue-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Active Diamond Catalog</span>
                <Gem className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">412 Stones</div>
              <div className="text-[11px] text-blue-600 mt-1 font-mono">
                284.50 Total Carats
              </div>
            </div>

            {/* KPI 2 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-blue-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Rapaport Price Feed</span>
                <Zap className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-emerald-700">Oct 2026 Feed</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                Verified Global Benchmark
              </div>
            </div>

            {/* KPI 3 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-blue-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Certified Ratio</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">98.2% Lab</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                GIA, IGI & SGL Inscribed
              </div>
            </div>

            {/* KPI 4 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-blue-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Base Price / Ct</span>
                <Award className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">₹ 1,85,000</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Median 0.70 ct VVS2 benchmark
              </div>
            </div>

            {/* KPI 5 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-blue-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Vault Value</span>
                <Layers className="w-3.5 h-3.5 text-neutral-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">₹ 5.26 Cr</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Loose + Mounted Solitaires
              </div>
            </div>
          </div>
        </div>

        {/* Interactive 4Cs Valuation Engine Card */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] shadow-2xs">
            <div className="flex items-center justify-between mb-3 border-b border-[#e2e8f0] pb-2.5">
              <div className="flex items-center gap-2">
                <Gem className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-neutral-900 uppercase tracking-wider">
                  Interactive 4Cs Diamond Valuation Engine
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 font-mono">
                Rapaport & International Gemological Standard
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
              {/* Carat */}
              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Carat Weight (cts)</label>
                <input
                  type="number"
                  step="0.01"
                  value={calcCarat}
                  onChange={(e) => setCalcCarat(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-blue-500 focus:outline-none text-neutral-800 font-mono"
                  placeholder="e.g. 1.02"
                />
              </div>

              {/* Color */}
              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Color Grade</label>
                <select
                  value={calcColor}
                  onChange={(e) => setCalcColor(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-blue-500 focus:outline-none text-neutral-800"
                >
                  <option value="D">D (Completely Colorless)</option>
                  <option value="E">E (Colorless)</option>
                  <option value="F">F (Colorless)</option>
                  <option value="G">G (Near Colorless)</option>
                  <option value="H">H (Near Colorless)</option>
                  <option value="I">I (Slight Color)</option>
                  <option value="J">J (Slight Color)</option>
                </select>
              </div>

              {/* Clarity */}
              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Clarity Grade</label>
                <select
                  value={calcClarity}
                  onChange={(e) => setCalcClarity(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-blue-500 focus:outline-none text-neutral-800"
                >
                  <option value="IF">IF (Internally Flawless)</option>
                  <option value="VVS1">VVS1 (Very Very Slightly Included 1)</option>
                  <option value="VVS2">VVS2 (Very Very Slightly Included 2)</option>
                  <option value="VS1">VS1 (Very Slightly Included 1)</option>
                  <option value="VS2">VS2 (Very Slightly Included 2)</option>
                  <option value="SI1">SI1 (Slightly Included 1)</option>
                  <option value="SI2">SI2 (Slightly Included 2)</option>
                </select>
              </div>

              {/* Cut */}
              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Cut Grade</label>
                <select
                  value={calcCut}
                  onChange={(e) => setCalcCut(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-blue-500 focus:outline-none text-neutral-800"
                >
                  <option value="EXCELLENT">Excellent (Ideal Polish/Sym)</option>
                  <option value="VERY_GOOD">Very Good</option>
                  <option value="GOOD">Good Commercial</option>
                </select>
              </div>

              {/* Fluorescence */}
              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Fluorescence</label>
                <select
                  value={calcFluorescence}
                  onChange={(e) => setCalcFluorescence(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-blue-500 focus:outline-none text-neutral-800"
                >
                  <option value="NONE">None (Zero Blue)</option>
                  <option value="FAINT">Faint</option>
                  <option value="MEDIUM">Medium Blue (-4%)</option>
                  <option value="STRONG">Strong Blue (-9%)</option>
                </select>
              </div>
            </div>

            {/* Certificate lookup & Results Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 p-3 bg-white border border-[#e2e8f0] rounded-md mb-2 text-xs">
              <div className="flex flex-col justify-between">
                <div>
                  <label className="text-[11px] font-medium text-neutral-600 block mb-1">
                    Lab Certificate Lookup
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={certLookupNo}
                      onChange={(e) => setCertLookupNo(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-[#e2e8f0] rounded bg-white text-neutral-800 font-mono"
                    />
                  </div>
                </div>
                <div className="text-[10px] text-emerald-600 flex items-center gap-1 mt-1 font-mono">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  GIA Report #2219481029 active
                </div>
              </div>

              <div>
                <span className="text-[11px] text-neutral-500 block">Rapaport Benchmark Price</span>
                <span className="text-base font-medium text-neutral-900 font-mono">
                  ₹ {Math.round(rawPerCarat).toLocaleString('en-IN')} / ct
                </span>
                <span className="text-[10px] text-neutral-400 block font-mono">
                  Base 100% list price
                </span>
              </div>

              <div>
                <span className="text-[11px] text-neutral-500 block">Rapaport Discount Matrix</span>
                <span className="text-base font-medium text-rose-600 font-mono">
                  -24.0%
                </span>
                <span className="text-[10px] text-neutral-400 block font-mono">
                  Net: ₹ {Math.round(netPerCarat).toLocaleString('en-IN')} / ct
                </span>
              </div>

              <div className="flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-neutral-500 block">Total Stone Valuation</span>
                  <span className="text-lg font-medium text-blue-700 font-mono">
                    ₹ {totalValuation.toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 block font-mono">
                  For {caratNum} ct {calcColor} {calcClarity} {calcCut}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Supabase-style Table / Schema Definition Section */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            {/* Table Header Info Bar */}
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Gem className="w-4 h-4 text-blue-600" />
                <span className="font-mono font-medium text-neutral-800">
                  diamond_price_grids
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Showing {filteredGrids.length} of {grids.length} Rapaport price tiers
                </span>
              </div>

              {/* Filter & Tab Toggle */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                  <span className="text-[11px] text-neutral-500">Clarity:</span>
                  <select
                    value={selectedClarityFilter}
                    onChange={(e) => setSelectedClarityFilter(e.target.value)}
                    className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Clarities</option>
                    <option value="IF">IF</option>
                    <option value="VVS">VVS</option>
                    <option value="VS">VS</option>
                    <option value="SI">SI</option>
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
                          <span className="text-neutral-800">clarity</span>
                          <span className="text-neutral-400 font-normal text-[10px]">grade</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">color_band</span>
                          <span className="text-neutral-400 font-normal text-[10px]">d_to_z</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">carat_range</span>
                          <span className="text-neutral-400 font-normal text-[10px]">weight_band</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">base_price_ct</span>
                          <span className="text-neutral-400 font-normal text-[10px]">rap_inr</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">discount</span>
                          <span className="text-neutral-400 font-normal text-[10px]">%</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">net_price_ct</span>
                          <span className="text-neutral-400 font-normal text-[10px]">final_inr</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">rapaport_code</span>
                          <span className="text-neutral-400 font-normal text-[10px]">sku</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">certification_standard</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb]">
                    {filteredGrids.map((row) => (
                      <tr key={row.id} className="hover:bg-[#f8fafc] transition-colors font-mono">
                        <td className="px-3 py-2 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-blue-700 font-medium">
                          {row.clarity}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-900 font-sans font-medium">
                          {row.color_grade}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-800">
                          {row.carat_range}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700">
                          ₹ {row.base_price_per_ct_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-rose-600">
                          {row.rap_discount_pct}%
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-emerald-700 font-medium">
                          ₹ {row.net_price_per_ct_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-600 text-[11px]">
                          {row.rapaport_code}
                        </td>
                        <td className="px-3.5 py-2 whitespace-nowrap text-neutral-700 text-[11px] font-sans">
                          {row.lab_standard}
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.diamond_price_grids (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">clarity</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">color</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">carat_range</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">base_price_per_ct</span>{' '}
                  <span className="text-amber-300">numeric(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL CHECK (base_price_per_ct &gt; 0),</span>
                  <br />
                  <span className="pl-6 text-blue-300">rapaport_code</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>{' '}
                  <span className="text-neutral-400">UNIQUE NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">effective_date</span>{' '}
                  <span className="text-amber-300">date</span>{' '}
                  <span className="text-neutral-400">DEFAULT current_date</span>
                  <br />
                  );
                  <br />
                  <br />
                  <span className="text-neutral-500">-- Composite index for fast 4Cs matrix query</span>
                  <br />
                  <span className="text-emerald-400">CREATE INDEX</span> idx_diamond_4cs{' '}
                  <span className="text-emerald-400">ON</span> public.diamond_price_grids (clarity, color, carat_range);
                  <br />
                  <span className="text-emerald-400">ALTER TABLE</span> public.diamond_price_grids{' '}
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
