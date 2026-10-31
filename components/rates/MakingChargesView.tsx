'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Percent,
  Plus,
  Sparkles,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Check,
  SlidersHorizontal,
  X,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  TrendingDown,
  Hammer,
  Coins,
  Calculator,
} from 'lucide-react';

interface MakingChargeRule {
  id: string;
  category_name: string;
  charge_type: 'PERCENTAGE_OF_GOLD' | 'FIXED_PER_GRAM' | 'FLAT_PER_PIECE';
  base_rate_value: number;
  min_charge_floor: number;
  festival_discount_pct: number;
  net_effective_charge: string;
  status: 'ACTIVE' | 'INACTIVE';
  updated_at: string;
}

const INITIAL_MAKING_RULES: MakingChargeRule[] = [
  {
    id: 'mcr-001',
    category_name: 'Plain Machine Bangles & Kadas',
    charge_type: 'PERCENTAGE_OF_GOLD',
    base_rate_value: 9.5,
    min_charge_floor: 1200.0,
    festival_discount_pct: 2.0,
    net_effective_charge: '7.50% of gold value',
    status: 'ACTIVE',
    updated_at: '2026-10-28',
  },
  {
    id: 'mcr-002',
    category_name: 'Antique Temple Jewellery & Haar',
    charge_type: 'PERCENTAGE_OF_GOLD',
    base_rate_value: 16.5,
    min_charge_floor: 3500.0,
    festival_discount_pct: 2.0,
    net_effective_charge: '14.50% of gold value',
    status: 'ACTIVE',
    updated_at: '2026-10-28',
  },
  {
    id: 'mcr-003',
    category_name: 'Solid Casting Rings & Bands',
    charge_type: 'FIXED_PER_GRAM',
    base_rate_value: 650.0,
    min_charge_floor: 850.0,
    festival_discount_pct: 10.0,
    net_effective_charge: '₹ 585.00 / gram',
    status: 'ACTIVE',
    updated_at: '2026-10-28',
  },
  {
    id: 'mcr-004',
    category_name: 'Hollow Curb & Rope Chains',
    charge_type: 'FIXED_PER_GRAM',
    base_rate_value: 380.0,
    min_charge_floor: 900.0,
    festival_discount_pct: 0.0,
    net_effective_charge: '₹ 380.00 / gram',
    status: 'ACTIVE',
    updated_at: '2026-10-25',
  },
  {
    id: 'mcr-005',
    category_name: 'Solitaire Diamond Mountings (18K)',
    charge_type: 'FLAT_PER_PIECE',
    base_rate_value: 8500.0,
    min_charge_floor: 8500.0,
    festival_discount_pct: 5.0,
    net_effective_charge: '₹ 8,075.00 / piece',
    status: 'ACTIVE',
    updated_at: '2026-10-25',
  },
  {
    id: 'mcr-006',
    category_name: 'Handmade Filigree Earrings & Jhumkas',
    charge_type: 'PERCENTAGE_OF_GOLD',
    base_rate_value: 14.0,
    min_charge_floor: 1500.0,
    festival_discount_pct: 2.0,
    net_effective_charge: '12.00% of gold value',
    status: 'ACTIVE',
    updated_at: '2026-10-25',
  },
  {
    id: 'mcr-007',
    category_name: 'Traditional Mangalsutra & Pendants',
    charge_type: 'PERCENTAGE_OF_GOLD',
    base_rate_value: 11.0,
    min_charge_floor: 1800.0,
    festival_discount_pct: 2.0,
    net_effective_charge: '9.00% of gold value',
    status: 'ACTIVE',
    updated_at: '2026-10-20',
  },
];

export function RatesMakingChargesView() {
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [rules, setRules] = useState<MakingChargeRule[]>(INITIAL_MAKING_RULES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newType, setNewType] = useState<'PERCENTAGE_OF_GOLD' | 'FIXED_PER_GRAM' | 'FLAT_PER_PIECE'>('PERCENTAGE_OF_GOLD');
  const [newBaseRate, setNewBaseRate] = useState('12.5');
  const [newMinFloor, setNewMinFloor] = useState('1500');
  const [newFestivalDiscount, setNewFestivalDiscount] = useState('2.0');

  // Test Estimator State
  const [testCategory, setTestCategory] = useState('Plain Machine Bangles & Kadas');
  const [testWeightG, setTestWeightG] = useState('24.000');
  const [testGoldRateG, setTestGoldRateG] = useState('7850');

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory) return;

    const baseVal = parseFloat(newBaseRate) || 0;
    const discountVal = parseFloat(newFestivalDiscount) || 0;
    const effectiveVal = baseVal * (1 - discountVal / 100);

    let effectiveStr = '';
    if (newType === 'PERCENTAGE_OF_GOLD') {
      effectiveStr = `${(baseVal - discountVal).toFixed(2)}% of gold value`;
    } else if (newType === 'FIXED_PER_GRAM') {
      effectiveStr = `₹ ${effectiveVal.toFixed(2)} / gram`;
    } else {
      effectiveStr = `₹ ${effectiveVal.toFixed(2)} / piece`;
    }

    const item: MakingChargeRule = {
      id: `mcr-${Date.now()}`,
      category_name: newCategory,
      charge_type: newType,
      base_rate_value: baseVal,
      min_charge_floor: parseFloat(newMinFloor) || 0,
      festival_discount_pct: discountVal,
      net_effective_charge: effectiveStr,
      status: 'ACTIVE',
      updated_at: '2026-10-31',
    };

    setRules([item, ...rules]);
    setIsAddModalOpen(false);
    setNewCategory('');
  };

  const filteredRules = rules.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return r.category_name.toLowerCase().includes(q) || r.net_effective_charge.toLowerCase().includes(q);
    }
    return true;
  });

  // Test calculation computation
  const selectedRule = rules.find((r) => r.category_name === testCategory) || rules[0];
  const weight = parseFloat(testWeightG) || 0;
  const goldRate = parseFloat(testGoldRateG) || 7850;
  const goldTotal = weight * goldRate;

  let calculatedMC = 0;
  if (selectedRule.charge_type === 'PERCENTAGE_OF_GOLD') {
    const netPct = Math.max(0, selectedRule.base_rate_value - selectedRule.festival_discount_pct);
    calculatedMC = goldTotal * (netPct / 100);
  } else if (selectedRule.charge_type === 'FIXED_PER_GRAM') {
    const netPerG = selectedRule.base_rate_value * (1 - selectedRule.festival_discount_pct / 100);
    calculatedMC = weight * netPerG;
  } else {
    calculatedMC = selectedRule.base_rate_value * (1 - selectedRule.festival_discount_pct / 100);
  }

  const finalMCWithFloor = Math.max(calculatedMC, selectedRule.min_charge_floor);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="rates_making_charges" />
      <ActionToolbar
        filterPlaceholder="Filter by category, charge method, rate..."
        insertLabel="Add Making Rule"
        onInsertClick={() => setIsAddModalOpen(true)}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics Summary Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* KPI 1 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Configured Rules</span>
                <Hammer className="w-3.5 h-3.5 text-neutral-700" />
              </div>
              <div className="text-xl font-medium text-neutral-900">18 Categories</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                Plain, Casting & Antique
              </div>
            </div>

            {/* KPI 2 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Plain Gold Avg MC</span>
                <Percent className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">10.50%</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Bangles, Chains & Rings
              </div>
            </div>

            {/* KPI 3 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Antique / Temple MC</span>
                <Percent className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">16.50%</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Handcrafted Nakshi & Jadau
              </div>
            </div>

            {/* KPI 4 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Festival Override</span>
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700">Active (-2% Off)</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                Diwali Festive Promotion
              </div>
            </div>

            {/* KPI 5 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-neutral-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Gross MC Margin</span>
                <Coins className="w-3.5 h-3.5 text-neutral-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">14.8% Share</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Net showroom revenue
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Making Charge Sandbox & Test Estimator */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Card 1: Promotional Policy Announcement */}
          <div className="lg:col-span-2 p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  Active Craftsmanship & Festive Making Policy
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                  Promotion Active
                </span>
              </div>
              <p className="text-xs text-neutral-600 mb-3 leading-relaxed">
                Making charges can be configured dynamically as either a percentage of the live 22K/18K gold value, a fixed rate per gross gram, or a flat fee per certified piece. Promotional festival discounts are automatically deducted at POS counters without overriding minimum cost floors.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#e2e8f0]">
              <span className="text-[11px] text-neutral-500 font-mono">
                Minimum charge floor prevents loss on lightweight intricate ornaments.
              </span>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category Making Rule</span>
              </button>
            </div>
          </div>

          {/* Card 2: Interactive Sandbox Estimator */}
          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex flex-col justify-between">
            <div>
              <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-neutral-700" />
                  Rule Sandbox Tester
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">Verify POS</span>
              </div>

              <div className="space-y-2 mb-2">
                <div>
                  <label className="text-[10px] font-medium text-neutral-600 block mb-0.5">Category</label>
                  <select
                    value={testCategory}
                    onChange={(e) => setTestCategory(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none"
                  >
                    {rules.map((r) => (
                      <option key={r.id} value={r.category_name}>
                        {r.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-medium text-neutral-600 block mb-0.5">Weight (g)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={testWeightG}
                      onChange={(e) => setTestWeightG(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-neutral-600 block mb-0.5">22K Rate (₹/g)</label>
                    <input
                      type="number"
                      value={testGoldRateG}
                      onChange={(e) => setTestGoldRateG(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-xs">
              <span className="text-neutral-500">Net Making Charge:</span>
              <span className="text-sm font-medium text-emerald-700 font-mono">
                ₹ {Math.round(finalMCWithFloor).toLocaleString('en-IN')}
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
                <Percent className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  making_charge_rules
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Showing {filteredRules.length} of {rules.length} configured rules
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
                    <option value="ALL">All Rules</option>
                    <option value="ACTIVE">Active Only</option>
                    <option value="INACTIVE">Inactive</option>
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
                          <span className="text-neutral-800">category_name</span>
                          <span className="text-neutral-400 font-normal text-[10px]">varchar</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">calculation_method</span>
                          <span className="text-neutral-400 font-normal text-[10px]">type</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">base_rate_value</span>
                          <span className="text-neutral-400 font-normal text-[10px]">standard</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">min_floor_charge</span>
                          <span className="text-neutral-400 font-normal text-[10px]">₹_min</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">festive_discount</span>
                          <span className="text-neutral-400 font-normal text-[10px]">%_off</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">net_effective_charge</span>
                          <span className="text-neutral-400 font-normal text-[10px]">pos_rate</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 font-medium text-center whitespace-nowrap">
                        <span className="text-neutral-800">status</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb]">
                    {filteredRules.map((row) => (
                      <tr key={row.id} className="hover:bg-[#f8fafc] transition-colors font-mono">
                        <td className="px-3 py-2 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-900 font-sans font-medium">
                          {row.category_name}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-600">
                          <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-[11px]">
                            {row.charge_type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-800 font-medium">
                          {row.charge_type === 'PERCENTAGE_OF_GOLD' ? `${row.base_rate_value}%` : `₹ ${row.base_rate_value.toFixed(2)}`}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700">
                          ₹ {row.min_charge_floor.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-emerald-600">
                          {row.festival_discount_pct > 0 ? `-${row.festival_discount_pct}%` : '0%'}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-emerald-700 font-medium">
                          {row.net_effective_charge}
                        </td>
                        <td className="px-3.5 py-2 whitespace-nowrap text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              row.status === 'ACTIVE'
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.making_charge_rules (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">category_name</span>{' '}
                  <span className="text-amber-300">varchar(100)</span>{' '}
                  <span className="text-neutral-400">UNIQUE NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">charge_type</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">NOT NULL CHECK (charge_type IN (&apos;PERCENTAGE_OF_GOLD&apos;, &apos;FIXED_PER_GRAM&apos;, &apos;FLAT_PER_PIECE&apos;)),</span>
                  <br />
                  <span className="pl-6 text-blue-300">rate_value</span>{' '}
                  <span className="text-amber-300">numeric(8,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL CHECK (rate_value &gt;= 0),</span>
                  <br />
                  <span className="pl-6 text-blue-300">min_charge_floor</span>{' '}
                  <span className="text-amber-300">numeric(8,2)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0.00,</span>
                  <br />
                  <span className="pl-6 text-blue-300">festival_discount_pct</span>{' '}
                  <span className="text-amber-300">numeric(5,2)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0.00,</span>
                  <br />
                  <span className="pl-6 text-blue-300">is_active</span>{' '}
                  <span className="text-amber-300">boolean</span>{' '}
                  <span className="text-neutral-400">DEFAULT true,</span>
                  <br />
                  <span className="pl-6 text-blue-300">updated_at</span>{' '}
                  <span className="text-amber-300">timestamptz</span>{' '}
                  <span className="text-neutral-400">DEFAULT now()</span>
                  <br />
                  );
                  <br />
                  <br />
                  <span className="text-neutral-500">-- Fast lookup on checkout billing</span>
                  <br />
                  <span className="text-emerald-400">CREATE INDEX</span> idx_making_category{' '}
                  <span className="text-emerald-400">ON</span> public.making_charge_rules (category_name, is_active);
                  <br />
                  <span className="text-emerald-400">ALTER TABLE</span> public.making_charge_rules{' '}
                  <span className="text-emerald-400">ENABLE ROW LEVEL SECURITY;</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Update Rule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            <div className="px-5 py-3.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-neutral-900">
                  Add / Update Making Charge Rule
                </span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRule} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  placeholder="e.g. Calcutta Handcrafted Bangles"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Calculation Method</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                >
                  <option value="PERCENTAGE_OF_GOLD">Percentage of Gold Metal Value (%)</option>
                  <option value="FIXED_PER_GRAM">Fixed Rate per Gram (₹/g)</option>
                  <option value="FLAT_PER_PIECE">Flat Charge per Piece (₹)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    {newType === 'PERCENTAGE_OF_GOLD' ? 'Base Rate (%)' : 'Base Rate (₹)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newBaseRate}
                    onChange={(e) => setNewBaseRate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Minimum Floor Charge (₹)
                  </label>
                  <input
                    type="number"
                    step="50"
                    required
                    value={newMinFloor}
                    onChange={(e) => setNewMinFloor(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">
                  Festival Promotional Discount (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={newFestivalDiscount}
                  onChange={(e) => setNewFestivalDiscount(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                  placeholder="e.g. 2.0"
                />
              </div>

              <div className="pt-3 border-t border-[#e5e7eb] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Making Rule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
