'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Layers,
  Sparkles,
  Calculator,
  Plus,
  Check,
  ShieldCheck,
  Scale,
  Percent,
  Coins,
  FileSpreadsheet,
  Users,
  X,
  SlidersHorizontal,
} from 'lucide-react';

interface WastageMatrixRow {
  id: string;
  design_complexity: string;
  applicable_karat: string;
  standard_va_pct: number;
  max_allowed_va_pct: number;
  karigar_group: string;
  inspection_standard: string;
  status: 'ACTIVE' | 'REVIEW';
  updated_at: string;
}

const INITIAL_WASTAGE_MATRIX: WastageMatrixRow[] = [
  {
    id: 'wm-001',
    design_complexity: 'Plain Machine Made (Chains & Plain Bangles)',
    applicable_karat: '22K (916)',
    standard_va_pct: 6.5,
    max_allowed_va_pct: 7.5,
    karigar_group: 'Automated Casting Line A',
    inspection_standard: 'Laser Micrometer Check',
    status: 'ACTIVE',
    updated_at: '2026-10-25',
  },
  {
    id: 'wm-002',
    design_complexity: 'Casting Studded & CNC Engraved Rings',
    applicable_karat: '22K & 18K',
    standard_va_pct: 8.5,
    max_allowed_va_pct: 9.5,
    karigar_group: 'Rajkot Precision Crafts',
    inspection_standard: 'Wax Tree Mass Loss Test',
    status: 'ACTIVE',
    updated_at: '2026-10-25',
  },
  {
    id: 'wm-003',
    design_complexity: 'Handmade Filigree & Calcutta Wirework',
    applicable_karat: '22K (916)',
    standard_va_pct: 12.0,
    max_allowed_va_pct: 13.5,
    karigar_group: 'Bengal Master Goldsmiths (12 Artisans)',
    inspection_standard: 'Bench Wire Sweep Audit',
    status: 'ACTIVE',
    updated_at: '2026-10-25',
  },
  {
    id: 'wm-004',
    design_complexity: 'Temple Jadau & Kundan Setting',
    applicable_karat: '22K (916)',
    standard_va_pct: 13.5,
    max_allowed_va_pct: 15.0,
    karigar_group: 'Jaipur & Hyderabad Guild',
    inspection_standard: 'Lac & Foil Cavity Weight Check',
    status: 'ACTIVE',
    updated_at: '2026-10-20',
  },
  {
    id: 'wm-005',
    design_complexity: 'Antique Nakshi & Embossed Chokers',
    applicable_karat: '22K (916)',
    standard_va_pct: 14.0,
    max_allowed_va_pct: 15.5,
    karigar_group: 'Coimbatore Antique Karigars',
    inspection_standard: 'Die Chasing Polishing Check',
    status: 'ACTIVE',
    updated_at: '2026-10-20',
  },
  {
    id: 'wm-006',
    design_complexity: 'Italian Hollow Link Chains & Tubing',
    applicable_karat: '18K (750)',
    standard_va_pct: 7.0,
    max_allowed_va_pct: 8.0,
    karigar_group: 'Imported Hollow Unit #2',
    inspection_standard: 'Acid Strip Core Test',
    status: 'ACTIVE',
    updated_at: '2026-10-18',
  },
];

export function RatesWastageRulesView() {
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [matrix, setMatrix] = useState<WastageMatrixRow[]>(INITIAL_WASTAGE_MATRIX);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'REVIEW'>('ALL');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDesign, setNewDesign] = useState('');
  const [newKarat, setNewKarat] = useState('22K (916)');
  const [newStdVa, setNewStdVa] = useState('9.0');
  const [newMaxVa, setNewMaxVa] = useState('10.5');
  const [newKarigarGroup, setNewKarigarGroup] = useState('In-House Goldsmiths');

  // Interactive VA Impact Calculator State
  const [calcDesign, setCalcDesign] = useState('Handmade Filigree & Calcutta Wirework');
  const [calcNetWt, setCalcNetWt] = useState('32.500');
  const [calcGoldRateG, setCalcGoldRateG] = useState('7850');

  const handleAddWastageRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesign) return;

    const row: WastageMatrixRow = {
      id: `wm-${Date.now()}`,
      design_complexity: newDesign,
      applicable_karat: newKarat,
      standard_va_pct: parseFloat(newStdVa) || 0,
      max_allowed_va_pct: parseFloat(newMaxVa) || 0,
      karigar_group: newKarigarGroup,
      inspection_standard: 'Standard Weight Audit',
      status: 'ACTIVE',
      updated_at: '2026-10-31',
    };

    setMatrix([row, ...matrix]);
    setIsAddModalOpen(false);
    setNewDesign('');
  };

  const filteredMatrix = matrix.filter((row) => {
    if (statusFilter !== 'ALL' && row.status !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        row.design_complexity.toLowerCase().includes(q) ||
        row.karigar_group.toLowerCase().includes(q) ||
        row.applicable_karat.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate VA Impact
  const selectedComplexity = matrix.find((m) => m.design_complexity === calcDesign) || matrix[0];
  const netWtNum = parseFloat(calcNetWt) || 0;
  const goldRateNum = parseFloat(calcGoldRateG) || 7850;
  const vaGrams = netWtNum * (selectedComplexity.standard_va_pct / 100);
  const grossBilledWt = netWtNum + vaGrams;
  const vaAmountInr = Math.round(vaGrams * goldRateNum);
  const pureMetalAmount = Math.round(netWtNum * goldRateNum);
  const totalBillBeforeMaking = pureMetalAmount + vaAmountInr;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="rates_wastage_rules" />
      <ActionToolbar
        filterPlaceholder="Filter by design complexity, karigar guild, karat..."
        insertLabel="Add Wastage Matrix Tier"
        onInsertClick={() => setIsAddModalOpen(true)}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics Summary Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* KPI 1 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">VA Standard Range</span>
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">6.0% - 14.0%</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                Complexity weighted grid
              </div>
            </div>

            {/* KPI 2 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Karigars Linked</span>
                <Users className="w-3.5 h-3.5 text-neutral-700" />
              </div>
              <div className="text-xl font-medium text-neutral-900">32 Goldsmiths</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Calcutta, Rajkot, Jaipur
              </div>
            </div>

            {/* KPI 3 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Filigree Handcraft VA</span>
                <Percent className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">12.00% Std</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Wire pulling & solder loss
              </div>
            </div>

            {/* KPI 4 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Machine Chains VA</span>
                <Percent className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">6.50% Std</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Low-loss CNC link forging
              </div>
            </div>

            {/* KPI 5 */}
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-neutral-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Monthly Sweep Recovery</span>
                <Scale className="w-3.5 h-3.5 text-neutral-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">1.480 kg</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                98.8% Karigar reconciliation
              </div>
            </div>
          </div>
        </div>

        {/* Interactive VA Impact Calculator & Explanation Card */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Card 1: VA Regulatory Guidelines */}
          <div className="lg:col-span-2 p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  Value Addition (VA / Wastage) Calculation Policy
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                  BIS Compliant
                </span>
              </div>
              <p className="text-xs text-neutral-600 mb-3 leading-relaxed">
                Wastage (Value Addition) compensates for unavoidable gold dust, filing, and fire-scale losses sustained by artisans during cutting, soldering, and polishing. At retail checkout, Value Addition is transparently added to net metal weight before computing GST.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#e2e8f0]">
              <span className="text-[11px] text-neutral-500 font-mono">
                Max Allowed VA cap enforces protection against arbitrary artisan overcharges.
              </span>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Complexity Tier</span>
              </button>
            </div>
          </div>

          {/* Card 2: Interactive Live VA Impact Calculator */}
          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex flex-col justify-between">
            <div>
              <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-neutral-700" />
                  VA Billing Impact Simulator
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">Calculator</span>
              </div>

              <div className="space-y-2 mb-2">
                <div>
                  <label className="text-[10px] font-medium text-neutral-600 block mb-0.5">Design Complexity</label>
                  <select
                    value={calcDesign}
                    onChange={(e) => setCalcDesign(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none"
                  >
                    {matrix.map((m) => (
                      <option key={m.id} value={m.design_complexity}>
                        {m.design_complexity} ({m.standard_va_pct}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-medium text-neutral-600 block mb-0.5">Net Ornament Wt (g)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={calcNetWt}
                      onChange={(e) => setCalcNetWt(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-neutral-600 block mb-0.5">Gold Rate (₹/g)</label>
                    <input
                      type="number"
                      value={calcGoldRateG}
                      onChange={(e) => setCalcGoldRateG(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#e2e8f0] text-xs space-y-1">
              <div className="flex justify-between text-neutral-600">
                <span>Wastage Added:</span>
                <span className="font-mono font-medium text-amber-700">+{vaGrams.toFixed(3)} g (₹ {vaAmountInr.toLocaleString('en-IN')})</span>
              </div>
              <div className="flex justify-between text-neutral-800">
                <span>Billed Gross Weight:</span>
                <span className="font-mono font-medium text-emerald-700">{grossBilledWt.toFixed(3)} g</span>
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
                <Layers className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  wastage_matrix
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Showing {filteredMatrix.length} of {matrix.length} complexity tiers
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
                    <option value="ALL">All Tiers</option>
                    <option value="ACTIVE">Active Tiers</option>
                    <option value="REVIEW">Under Review</option>
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
                          <span className="text-neutral-800">design_complexity</span>
                          <span className="text-neutral-400 font-normal text-[10px]">category</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">applicable_karat</span>
                          <span className="text-neutral-400 font-normal text-[10px]">purity</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">standard_va_%</span>
                          <span className="text-neutral-400 font-normal text-[10px]">target</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">max_allowed_va_%</span>
                          <span className="text-neutral-400 font-normal text-[10px]">cap</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">karigar_group</span>
                          <span className="text-neutral-400 font-normal text-[10px]">guild</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">inspection_standard</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 font-medium text-center whitespace-nowrap">
                        <span className="text-neutral-800">status</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb]">
                    {filteredMatrix.map((row) => (
                      <tr key={row.id} className="hover:bg-[#f8fafc] transition-colors font-mono">
                        <td className="px-3 py-2 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-900 font-sans font-medium">
                          {row.design_complexity}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700">
                          <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-[11px]">
                            {row.applicable_karat}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-emerald-700 font-medium">
                          {row.standard_va_pct.toFixed(2)}%
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-800">
                          {row.max_allowed_va_pct.toFixed(2)}%
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700 font-sans">
                          {row.karigar_group}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-600 text-[11px] font-sans">
                          {row.inspection_standard}
                        </td>
                        <td className="px-3.5 py-2 whitespace-nowrap text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              row.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.wastage_matrix (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">design_complexity</span>{' '}
                  <span className="text-amber-300">varchar(120)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">applicable_karat</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">wastage_percentage</span>{' '}
                  <span className="text-amber-300">numeric(5,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL CHECK (wastage_percentage &gt; 0),</span>
                  <br />
                  <span className="pl-6 text-blue-300">max_allowed_va_pct</span>{' '}
                  <span className="text-amber-300">numeric(5,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL CHECK (max_allowed_va_pct &gt;= wastage_percentage),</span>
                  <br />
                  <span className="pl-6 text-blue-300">karigar_group</span>{' '}
                  <span className="text-amber-300">varchar(100)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;General Guild&apos;,</span>
                  <br />
                  <span className="pl-6 text-blue-300">status</span>{' '}
                  <span className="text-amber-300">varchar(20)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;ACTIVE&apos;</span>
                  <br />
                  );
                  <br />
                  <br />
                  <span className="text-neutral-500">-- Fast lookup for pos tag pricing</span>
                  <br />
                  <span className="text-emerald-400">CREATE INDEX</span> idx_wastage_complexity{' '}
                  <span className="text-emerald-400">ON</span> public.wastage_matrix (design_complexity, applicable_karat);
                  <br />
                  <span className="text-emerald-400">ALTER TABLE</span> public.wastage_matrix{' '}
                  <span className="text-emerald-400">ENABLE ROW LEVEL SECURITY;</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Wastage Matrix Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            <div className="px-5 py-3.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-neutral-900">
                  Add Wastage (VA) Complexity Tier
                </span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddWastageRule} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">
                  Design Complexity Name
                </label>
                <input
                  type="text"
                  required
                  value={newDesign}
                  onChange={(e) => setNewDesign(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  placeholder="e.g. Micro-Prong Studded Tennis Bracelets"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">
                  Applicable Karat
                </label>
                <select
                  value={newKarat}
                  onChange={(e) => setNewKarat(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                >
                  <option value="22K (916)">22K (Hallmark 916)</option>
                  <option value="18K (750)">18K (Jewellery 750)</option>
                  <option value="14K (585)">14K (Jewellery 585)</option>
                  <option value="All Karats">All Gold Karats</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Standard VA (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newStdVa}
                    onChange={(e) => setNewStdVa(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Maximum Allowed VA (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newMaxVa}
                    onChange={(e) => setNewMaxVa(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">
                  Karigar Guild / Manufacturing Group
                </label>
                <input
                  type="text"
                  value={newKarigarGroup}
                  onChange={(e) => setNewKarigarGroup(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  placeholder="e.g. Surat Casting Cluster"
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
                  <span>Save Wastage Tier</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
