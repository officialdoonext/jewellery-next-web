'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Scale,
  Sparkles,
  Calculator,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Plus,
  Coins,
  ShieldCheck,
  Flame,
  FileSpreadsheet,
  X,
  Printer,
  Eye,
  User,
  Phone,
  ArrowRight,
} from 'lucide-react';

interface OldGoldSlip {
  id: string;
  slip_no: string;
  customer_name: string;
  customer_phone: string;
  gross_weight_g: number;
  deductions_g: number;
  net_weight_g: number;
  assessed_purity_pct: number;
  fine_gold_equivalent_g: number;
  buy_rate_per_g: number;
  final_payable_inr: number;
  testing_method: 'XRF_SPECTROMETER' | 'TOUCHSTONE_NITRIC' | 'SPECIFIC_GRAVITY';
  status: 'ACCEPTED_IN_BILL' | 'PENDING_MELT' | 'SETTLED_CASH';
  created_at: string;
}

const INITIAL_SLIPS: OldGoldSlip[] = [
  {
    id: 'ogv-slip-001',
    slip_no: 'OGV-2026-081',
    customer_name: 'Pooja Agarwal',
    customer_phone: '+91 98490 12891',
    gross_weight_g: 24.5,
    deductions_g: 2.1,
    net_weight_g: 22.4,
    assessed_purity_pct: 88.5,
    fine_gold_equivalent_g: 19.525,
    buy_rate_per_g: 8010.0,
    final_payable_inr: 156395.0,
    testing_method: 'XRF_SPECTROMETER',
    status: 'ACCEPTED_IN_BILL',
    created_at: '2026-10-31 10:15 AM',
  },
  {
    id: 'ogv-slip-002',
    slip_no: 'OGV-2026-080',
    customer_name: 'K. Venkatesh',
    customer_phone: '+91 94401 55672',
    gross_weight_g: 52.8,
    deductions_g: 3.4,
    net_weight_g: 49.4,
    assessed_purity_pct: 91.2,
    fine_gold_equivalent_g: 44.376,
    buy_rate_per_g: 8010.0,
    final_payable_inr: 355452.0,
    testing_method: 'XRF_SPECTROMETER',
    status: 'ACCEPTED_IN_BILL',
    created_at: '2026-10-31 09:40 AM',
  },
  {
    id: 'ogv-slip-003',
    slip_no: 'OGV-2026-079',
    customer_name: 'Sunita Mehra',
    customer_phone: '+91 98200 44109',
    gross_weight_g: 14.2,
    deductions_g: 1.8,
    net_weight_g: 12.4,
    assessed_purity_pct: 75.0,
    fine_gold_equivalent_g: 9.161,
    buy_rate_per_g: 8010.0,
    final_payable_inr: 73380.0,
    testing_method: 'TOUCHSTONE_NITRIC',
    status: 'PENDING_MELT',
    created_at: '2026-10-30 05:20 PM',
  },
  {
    id: 'ogv-slip-004',
    slip_no: 'OGV-2026-078',
    customer_name: 'Rajesh Goud',
    customer_phone: '+91 97011 88320',
    gross_weight_g: 38.6,
    deductions_g: 2.2,
    net_weight_g: 36.4,
    assessed_purity_pct: 90.0,
    fine_gold_equivalent_g: 32.27,
    buy_rate_per_g: 7990.0,
    final_payable_inr: 257837.0,
    testing_method: 'SPECIFIC_GRAVITY',
    status: 'SETTLED_CASH',
    created_at: '2026-10-30 03:10 PM',
  },
  {
    id: 'ogv-slip-005',
    slip_no: 'OGV-2026-077',
    customer_name: 'Deepa Krishnan',
    customer_phone: '+91 99400 12048',
    gross_weight_g: 18.9,
    deductions_g: 1.5,
    net_weight_g: 17.4,
    assessed_purity_pct: 87.5,
    fine_gold_equivalent_g: 14.996,
    buy_rate_per_g: 7990.0,
    final_payable_inr: 119818.0,
    testing_method: 'XRF_SPECTROMETER',
    status: 'ACCEPTED_IN_BILL',
    created_at: '2026-10-30 11:30 AM',
  },
];

export function RatesOldGoldValuationView() {
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [slips, setSlips] = useState<OldGoldSlip[]>(INITIAL_SLIPS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACCEPTED_IN_BILL' | 'PENDING_MELT' | 'SETTLED_CASH'>('ALL');

  // Interactive Calculator State
  const [calcCustomerName, setCalcCustomerName] = useState('Priya Narayanan');
  const [calcCustomerPhone, setCalcCustomerPhone] = useState('+91 98840 77123');
  const [calcGrossWeight, setCalcGrossWeight] = useState('22.400');
  const [calcWaxDirtDeduction, setCalcWaxDirtDeduction] = useState('0.800');
  const [calcStonesDeduction, setCalcStonesDeduction] = useState('1.000');
  const [calcAssessedPurity, setCalcAssessedPurity] = useState('88.50');
  const [calcTestingMethod, setCalcTestingMethod] = useState<'XRF_SPECTROMETER' | 'TOUCHSTONE_NITRIC' | 'SPECIFIC_GRAVITY'>('XRF_SPECTROMETER');
  const [calcMeltingLossPct, setCalcMeltingLossPct] = useState('1.5');
  const [calcBuyRate24k, setCalcBuyRate24k] = useState('8010');

  // Slip modal / receipt preview
  const [activeSlipPreview, setActiveSlipPreview] = useState<OldGoldSlip | null>(null);
  const [isGeneratedModalOpen, setIsGeneratedModalOpen] = useState(false);

  // Computations
  const gross = parseFloat(calcGrossWeight) || 0;
  const waxDirt = parseFloat(calcWaxDirtDeduction) || 0;
  const stones = parseFloat(calcStonesDeduction) || 0;
  const totalDeductions = waxDirt + stones;
  const netWeight = Math.max(0, gross - totalDeductions);
  const purityPct = parseFloat(calcAssessedPurity) || 0;
  const meltingLossFactor = 1 - (parseFloat(calcMeltingLossPct) || 0) / 100;
  const fineGoldGrams = (netWeight * (purityPct / 100)) * meltingLossFactor;
  const buyRate = parseFloat(calcBuyRate24k) || 8010;
  const finalPayable = Math.round(fineGoldGrams * buyRate);

  const handleGenerateSlip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calcCustomerName || gross <= 0) return;

    const nextSlipNumber = `OGV-2026-0${82 + (slips.length - INITIAL_SLIPS.length)}`;
    const newSlip: OldGoldSlip = {
      id: `ogv-${Date.now()}`,
      slip_no: nextSlipNumber,
      customer_name: calcCustomerName,
      customer_phone: calcCustomerPhone,
      gross_weight_g: gross,
      deductions_g: totalDeductions,
      net_weight_g: netWeight,
      assessed_purity_pct: purityPct,
      fine_gold_equivalent_g: Math.round(fineGoldGrams * 1000) / 1000,
      buy_rate_per_g: buyRate,
      final_payable_inr: finalPayable,
      testing_method: calcTestingMethod,
      status: 'ACCEPTED_IN_BILL',
      created_at: 'Today ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setSlips([newSlip, ...slips]);
    setActiveSlipPreview(newSlip);
    setIsGeneratedModalOpen(true);
  };

  const filteredSlips = slips.filter((s) => {
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        s.slip_no.toLowerCase().includes(q) ||
        s.customer_name.toLowerCase().includes(q) ||
        s.customer_phone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="rates_old_gold" />
      <ActionToolbar
        filterPlaceholder="Filter by slip #, customer name, mobile..."
        insertLabel="New Old Gold Slip"
        onInsertClick={() => {
          setCalcGrossWeight('');
          setCalcWaxDirtDeduction('0.000');
          setCalcStonesDeduction('0.000');
        }}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics Summary Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* KPI 1 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Scrap Received Today</span>
                <Scale className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">420.500 g</div>
              <div className="text-[11px] text-amber-600 mt-1 font-mono">
                14 Assessment Slips
              </div>
            </div>

            {/* KPI 2 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Net Fine Credit Value</span>
                <Coins className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">₹ 29,84,500</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                Adjusted against new sales
              </div>
            </div>

            {/* KPI 3 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-blue-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Avg Assessed Purity</span>
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">88.40%</div>
              <div className="text-[11px] text-blue-600 mt-1 font-mono">
                21.2 Karat Weighted Avg
              </div>
            </div>

            {/* KPI 4 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-neutral-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Melting Loss Buffer</span>
                <Flame className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <div className="text-xl font-medium text-neutral-900">1.50% Std</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Standard refinery burning loss
              </div>
            </div>

            {/* KPI 5 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-neutral-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">24K Scrap Benchmark</span>
                <Coins className="w-3.5 h-3.5 text-neutral-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">₹ 8,010 /g</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Sell ₹8,120 - Margin ₹110
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Old Gold Evaluation Calculator Form & Live Results */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] shadow-2xs">
            <div className="flex items-center justify-between mb-3 border-b border-[#e2e8f0] pb-2.5">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium text-neutral-900 uppercase tracking-wider">
                  Interactive Old Gold Scrap Assessment Calculator
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 font-mono">
                BIS Certified Evaluation Workflow
              </span>
            </div>

            <form onSubmit={handleGenerateSlip}>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={calcCustomerName}
                    onChange={(e) => setCalcCustomerName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    placeholder="Customer Name"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={calcCustomerPhone}
                    onChange={(e) => setCalcCustomerPhone(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    placeholder="+91..."
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Gross Weight (g)</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={calcGrossWeight}
                    onChange={(e) => setCalcGrossWeight(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    placeholder="0.000"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Lac/Wax/Dirt (g)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={calcWaxDirtDeduction}
                    onChange={(e) => setCalcWaxDirtDeduction(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    placeholder="0.000"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Stones/Enamel (g)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={calcStonesDeduction}
                    onChange={(e) => setCalcStonesDeduction(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    placeholder="0.000"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Assessed Purity (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={calcAssessedPurity}
                    onChange={(e) => setCalcAssessedPurity(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    placeholder="e.g. 88.5"
                  />
                </div>
              </div>

              {/* Assessment Method & Live Calculations Results Banner */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 p-3 bg-white border border-[#e2e8f0] rounded-md mb-4 text-xs">
                <div>
                  <label className="text-[11px] font-medium text-neutral-600 block mb-1">Testing Technique</label>
                  <select
                    value={calcTestingMethod}
                    onChange={(e) => setCalcTestingMethod(e.target.value as any)}
                    className="w-full px-2 py-1 text-xs border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none"
                  >
                    <option value="XRF_SPECTROMETER">XRF Gold Spectrometer (Lab Grade)</option>
                    <option value="TOUCHSTONE_NITRIC">Touchstone & Nitric Acid Test</option>
                    <option value="SPECIFIC_GRAVITY">Hydrostatic Specific Gravity Scale</option>
                  </select>
                </div>

                <div>
                  <span className="text-[11px] text-neutral-500 block">Net Gold Weight</span>
                  <span className="text-base font-medium text-neutral-900 font-mono">
                    {netWeight.toFixed(3)} g
                  </span>
                  <span className="text-[10px] text-neutral-400 block">
                    Gross - {totalDeductions.toFixed(3)}g deductions
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-neutral-500 block">Pure 24K Equivalent (-1.5% melt loss)</span>
                  <span className="text-base font-medium text-amber-700 font-mono">
                    {fineGoldGrams.toFixed(3)} g
                  </span>
                  <span className="text-[10px] text-neutral-400 block">
                    @ {purityPct}% purity
                  </span>
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-neutral-500 block">Payable Credit Value</span>
                    <span className="text-lg font-medium text-emerald-700 font-mono">
                      ₹ {finalPayable.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#e2e8f0]">
                <div className="text-[11px] text-neutral-500 font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Rate locked at ₹{buyRate}/g 24K scrap buy rate
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Generate Old Gold Valuation Slip</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Supabase-style Table / Schema Definition Section */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            {/* Table Header Info Bar */}
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  old_gold_assessments
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Showing {filteredSlips.length} of {slips.length} assessment slips
                </span>
              </div>

              {/* Status Filter & Data/Definition Tab Toggle */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                  <span className="text-[11px] text-neutral-500">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="ACCEPTED_IN_BILL">Accepted In Bill</option>
                    <option value="PENDING_MELT">Pending Melt</option>
                    <option value="SETTLED_CASH">Settled Cash</option>
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
                          <span className="text-neutral-800">slip_no</span>
                          <span className="text-neutral-400 font-normal text-[10px]">varchar</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">customer</span>
                          <span className="text-neutral-400 font-normal text-[10px]">contact</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">gross_wt</span>
                          <span className="text-neutral-400 font-normal text-[10px]">grams</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">deductions</span>
                          <span className="text-neutral-400 font-normal text-[10px]">grams</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">net_wt</span>
                          <span className="text-neutral-400 font-normal text-[10px]">grams</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">assessed_purity</span>
                          <span className="text-neutral-400 font-normal text-[10px]">%</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">fine_gold_eq</span>
                          <span className="text-neutral-400 font-normal text-[10px]">24k_g</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">final_payable</span>
                          <span className="text-neutral-400 font-normal text-[10px]">₹_inr</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 font-medium text-center whitespace-nowrap">
                        <span className="text-neutral-800">status</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb]">
                    {filteredSlips.map((row) => (
                      <tr key={row.id} className="hover:bg-[#f8fafc] transition-colors font-mono">
                        <td className="px-3 py-2 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-emerald-700 font-medium">
                          {row.slip_no}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <div className="text-neutral-900 font-sans font-medium">{row.customer_name}</div>
                          <div className="text-[11px] text-neutral-500">{row.customer_phone}</div>
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-800">
                          {row.gross_weight_g.toFixed(3)}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-rose-600">
                          -{row.deductions_g.toFixed(3)}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-900 font-medium">
                          {row.net_weight_g.toFixed(3)}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-800">
                          <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-[11px]">
                            {row.assessed_purity_pct.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-amber-700 font-medium">
                          {row.fine_gold_equivalent_g.toFixed(3)} g
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-emerald-700 font-medium">
                          ₹ {row.final_payable_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3.5 py-2 whitespace-nowrap text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              row.status === 'ACCEPTED_IN_BILL'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : row.status === 'PENDING_MELT'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.old_gold_assessments (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">slip_no</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">UNIQUE NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">customer_name</span>{' '}
                  <span className="text-amber-300">varchar(120)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">customer_phone</span>{' '}
                  <span className="text-amber-300">varchar(20)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">gross_weight_g</span>{' '}
                  <span className="text-amber-300">numeric(10,3)</span>{' '}
                  <span className="text-neutral-400">NOT NULL CHECK (gross_weight_g &gt; 0),</span>
                  <br />
                  <span className="pl-6 text-blue-300">deductions_g</span>{' '}
                  <span className="text-amber-300">numeric(10,3)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0.000,</span>
                  <br />
                  <span className="pl-6 text-blue-300">assessed_purity_pct</span>{' '}
                  <span className="text-amber-300">numeric(5,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL CHECK (assessed_purity_pct &gt; 0),</span>
                  <br />
                  <span className="pl-6 text-blue-300">fine_gold_equivalent_g</span>{' '}
                  <span className="text-amber-300">numeric(10,3)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">final_payable</span>{' '}
                  <span className="text-amber-300">numeric(12,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">status</span>{' '}
                  <span className="text-amber-300">varchar(24)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;ACCEPTED_IN_BILL&apos;,</span>
                  <br />
                  <span className="pl-6 text-blue-300">created_at</span>{' '}
                  <span className="text-amber-300">timestamptz</span>{' '}
                  <span className="text-neutral-400">DEFAULT now()</span>
                  <br />
                  );
                  <br />
                  <br />
                  <span className="text-neutral-500">-- Index for customer slip lookup</span>
                  <br />
                  <span className="text-emerald-400">CREATE INDEX</span> idx_old_gold_slips{' '}
                  <span className="text-emerald-400">ON</span> public.old_gold_assessments (slip_no, customer_phone);
                  <br />
                  <span className="text-emerald-400">ALTER TABLE</span> public.old_gold_assessments{' '}
                  <span className="text-emerald-400">ENABLE ROW LEVEL SECURITY;</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generated Old Gold Slip Modal */}
      {isGeneratedModalOpen && activeSlipPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="px-5 py-3.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-neutral-900">
                  Old Gold Valuation Slip ({activeSlipPreview.slip_no})
                </span>
              </div>
              <button
                onClick={() => setIsGeneratedModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-md text-xs font-mono space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Customer:</span>
                  <span className="font-medium text-neutral-800">{activeSlipPreview.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Gross Weight:</span>
                  <span className="text-neutral-800">{activeSlipPreview.gross_weight_g.toFixed(3)} g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Deductions (Wax+Stones):</span>
                  <span className="text-rose-600">-{activeSlipPreview.deductions_g.toFixed(3)} g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Net Scrap Weight:</span>
                  <span className="font-medium text-neutral-800">{activeSlipPreview.net_weight_g.toFixed(3)} g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Assessed Purity:</span>
                  <span className="text-emerald-700 font-medium">{activeSlipPreview.assessed_purity_pct}% ({activeSlipPreview.testing_method})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Fine 24K Net (less 1.5% melt):</span>
                  <span className="text-amber-700 font-medium">{activeSlipPreview.fine_gold_equivalent_g.toFixed(3)} g</span>
                </div>
                <div className="pt-2 border-t border-neutral-300 flex justify-between text-sm">
                  <span className="font-medium text-neutral-900">Credit Payable:</span>
                  <span className="font-medium text-emerald-700">₹ {activeSlipPreview.final_payable_inr.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="text-[11px] text-neutral-500 text-center font-mono">
                Customer Signature required before chemical melting.
              </div>

              <div className="pt-3 border-t border-[#e5e7eb] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGeneratedModalOpen(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert(`Thermal slip printed for ${activeSlipPreview.slip_no}`);
                    setIsGeneratedModalOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip & Link to POS</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
