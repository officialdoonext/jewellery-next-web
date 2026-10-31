'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  ShieldCheck,
  Calculator,
  Award,
  Sparkles,
  Info,
  Scale,
  Percent,
  CheckCircle2,
  Copy,
  Check,
  Flame,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface PurityStandard {
  id: string;
  karat_label: string;
  category: 'Gold' | 'Silver' | 'Platinum';
  purity_percent: number;
  hallmark_stamp: string;
  fine_metal_multiplier: number;
  melting_loss_tolerance_mg: number;
  is_active: boolean;
}

const INITIAL_PURITIES: PurityStandard[] = [
  {
    id: 'f8721980-aa11-42cb-b092-231a789ef001',
    karat_label: '24 Karat (Bullion/Coins)',
    category: 'Gold',
    purity_percent: 99.90,
    hallmark_stamp: '999',
    fine_metal_multiplier: 0.9990,
    melting_loss_tolerance_mg: 10,
    is_active: true,
  },
  {
    id: 'f8721980-aa11-42cb-b092-231a789ef002',
    karat_label: '22 Karat (Standard Jewellery)',
    category: 'Gold',
    purity_percent: 91.67,
    hallmark_stamp: '916',
    fine_metal_multiplier: 0.9167,
    melting_loss_tolerance_mg: 40,
    is_active: true,
  },
  {
    id: 'f8721980-aa11-42cb-b092-231a789ef003',
    karat_label: '18 Karat (Diamond Jewellery)',
    category: 'Gold',
    purity_percent: 75.00,
    hallmark_stamp: '750',
    fine_metal_multiplier: 0.7500,
    melting_loss_tolerance_mg: 50,
    is_active: true,
  },
  {
    id: 'f8721980-aa11-42cb-b092-231a789ef004',
    karat_label: '14 Karat (Modern Everyday)',
    category: 'Gold',
    purity_percent: 58.50,
    hallmark_stamp: '585',
    fine_metal_multiplier: 0.5850,
    melting_loss_tolerance_mg: 60,
    is_active: true,
  },
  {
    id: 'f8721980-aa11-42cb-b092-231a789ef005',
    karat_label: 'Fine Silver 999',
    category: 'Silver',
    purity_percent: 99.90,
    hallmark_stamp: '999',
    fine_metal_multiplier: 0.9990,
    melting_loss_tolerance_mg: 15,
    is_active: true,
  },
  {
    id: 'f8721980-aa11-42cb-b092-231a789ef006',
    karat_label: 'Sterling Silver 925',
    category: 'Silver',
    purity_percent: 92.50,
    hallmark_stamp: '925',
    fine_metal_multiplier: 0.9250,
    melting_loss_tolerance_mg: 35,
    is_active: true,
  },
];

export function InventoryPurityKaratView() {
  const [purities] = useState<PurityStandard[]>(INITIAL_PURITIES);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live Fine Gold Calculator State
  const [calcKaratMultiplier, setCalcKaratMultiplier] = useState<number>(0.9167);
  const [calcWeight, setCalcWeight] = useState<string>('48.240');
  const [calcBullionRate, setCalcBullionRate] = useState<string>('7850.00');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const parsedWeight = parseFloat(calcWeight) || 0;
  const parsedRate = parseFloat(calcBullionRate) || 0;
  const pureFineWeight = parsedWeight * calcKaratMultiplier;
  const calculatedBullionValue = pureFineWeight * parsedRate;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="inventory_purity_standards" />
      <ActionToolbar
        filterPlaceholder="Search purity standards..."
        insertLabel="Save Standards"
        onInsertClick={() => {}}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* Top Interactive Area: Fine Gold Calculator & BIS Hallmark Guide */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Live Interactive Fine Gold Calculator (5 cols) */}
            <div className="lg:col-span-5 p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#e2e8f0]">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-medium text-neutral-800 uppercase tracking-wider">
                      Interactive Fine Gold Calculator
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live Pure 24K Eq.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Ornament Purity</label>
                    <select
                      value={calcKaratMultiplier}
                      onChange={(e) => setCalcKaratMultiplier(parseFloat(e.target.value))}
                      className="w-full px-2.5 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    >
                      <option value={0.9167}>22K 916 (91.67%)</option>
                      <option value={0.7500}>18K 750 (75.00%)</option>
                      <option value={0.5850}>14K 585 (58.50%)</option>
                      <option value={0.9990}>24K 999 (99.90%)</option>
                      <option value={0.9250}>Silver 925 (92.50%)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Gross Weight (g)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={calcWeight}
                      onChange={(e) => setCalcWeight(e.target.value)}
                      placeholder="0.000"
                      className="w-full px-2.5 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">24K Bullion Market Rate (₹/g)</label>
                  <input
                    type="number"
                    step="1"
                    value={calcBullionRate}
                    onChange={(e) => setCalcBullionRate(e.target.value)}
                    placeholder="7850"
                    className="w-full px-2.5 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                  />
                </div>
              </div>

              {/* Result Callout */}
              <div className="mt-2 p-3 bg-white border border-emerald-200 rounded-lg shadow-2xs">
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                  <span>Pure Fine 24K Equivalent Wt:</span>
                  <span className="font-mono text-emerald-700 font-medium text-sm">
                    {pureFineWeight.toFixed(3)} g
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>Approx Bullion Metal Value:</span>
                  <span className="font-mono text-neutral-900 font-medium text-base">
                    ₹ {calculatedBullionValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* BIS Hallmark Standards Visual Guide (7 cols) */}
            <div className="lg:col-span-7 p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#e2e8f0]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-medium text-neutral-800 uppercase tracking-wider">
                      BIS Hallmark 3-Piece Stamping Standard
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    Mandatory Hallmarking Act 2021
                  </span>
                </div>

                {/* 3 Hallmark Components Visual Diagram */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Mark 1: BIS Triangle Logo */}
                  <div className="p-3 bg-white border border-[#e2e8f0] rounded-lg text-center">
                    <div className="w-8 h-8 mx-auto mb-1.5 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 text-sm font-medium">
                      △
                    </div>
                    <div className="text-xs font-medium text-neutral-900">1. BIS Standard Logo</div>
                    <p className="text-[10px] text-neutral-500 mt-0.5 leading-snug">
                      Triangular Bureau of Indian Standards mark certifying legal compliance.
                    </p>
                  </div>

                  {/* Mark 2: Purity & Fineness */}
                  <div className="p-3 bg-white border border-[#e2e8f0] rounded-lg text-center">
                    <div className="w-8 h-8 mx-auto mb-1.5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 text-xs font-mono font-medium">
                      22K916
                    </div>
                    <div className="text-xs font-medium text-neutral-900">2. Purity & Fineness</div>
                    <p className="text-[10px] text-neutral-500 mt-0.5 leading-snug">
                      22K916 (91.6%), 18K750 (75.0%), 14K585 (58.5%) etched clearly.
                    </p>
                  </div>

                  {/* Mark 3: 6-Digit HUID */}
                  <div className="p-3 bg-white border border-[#e2e8f0] rounded-lg text-center">
                    <div className="w-8 h-8 mx-auto mb-1.5 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 text-xs font-mono font-medium">
                      AB12CD
                    </div>
                    <div className="text-xs font-medium text-neutral-900">3. 6-Digit HUID Code</div>
                    <p className="text-[10px] text-neutral-500 mt-0.5 leading-snug">
                      Unique alphanumeric Hallmarking Unique ID verifiable via BIS Care App.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 p-2.5 rounded-md bg-amber-50/70 border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
                <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  All jewellery sold in India must bear all 3 laser marks. Zero tolerance for unhallmarked retail sale.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Supabase-style Table / Schema Definition Section */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            {/* Table Header Info Bar */}
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  purity_standards
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Karat standards and fine metal multipliers
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
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">id</span>
                          <span className="text-neutral-400 font-normal text-[10px]">uuid</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">karat_label</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">metal</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">purity_percent</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">hallmark_stamp</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">fine_multiplier</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">melting_loss_tol</span>
                      </th>
                      <th className="px-3.5 py-2 font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">status</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb] font-mono text-neutral-800 text-[12px]">
                    {purities.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/80 transition-colors group">
                        <td className="px-3 py-2 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>

                        {/* ID */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <div className="flex items-center gap-1.5 group/cell">
                            <span className="truncate max-w-[80px] text-neutral-500">
                              {row.id.slice(0, 8)}...
                            </span>
                            <button
                              onClick={() => copyToClipboard(row.id, row.id)}
                              className="opacity-0 group-hover/cell:opacity-100 p-0.5 hover:bg-neutral-200 rounded transition-opacity cursor-pointer"
                              title="Copy UUID"
                            >
                              {copiedId === row.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3 text-neutral-400" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Karat Label */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-sans font-medium text-neutral-900">
                          {row.karat_label}
                        </td>

                        {/* Metal */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-sans text-neutral-700">
                          {row.category}
                        </td>

                        {/* Purity % */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-medium text-neutral-900">
                          {row.purity_percent.toFixed(2)}%
                        </td>

                        {/* Hallmark Stamp */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px] font-medium">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            {row.hallmark_stamp}
                          </span>
                        </td>

                        {/* Fine Multiplier */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-900 font-medium">
                          {row.fine_metal_multiplier.toFixed(4)}
                        </td>

                        {/* Melting Loss Tolerance */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-600">
                          ± {row.melting_loss_tolerance_mg} mg/10g
                        </td>

                        {/* Status */}
                        <td className="px-3.5 py-2 whitespace-nowrap text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            STANDARD
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.purity_standards (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">karat_label</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">metal_category</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;Gold&apos;,</span>
                  <br />
                  <span className="pl-6 text-blue-300">purity_percent</span>{' '}
                  <span className="text-amber-300">numeric(5,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL CHECK (purity_percent &gt; 0 AND purity_percent &lt;= 100),</span>
                  <br />
                  <span className="pl-6 text-blue-300">hallmark_stamp</span>{' '}
                  <span className="text-amber-300">varchar(16)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">fine_metal_multiplier</span>{' '}
                  <span className="text-amber-300">numeric(6,4)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">melting_loss_tolerance_mg</span>{' '}
                  <span className="text-amber-300">integer</span>{' '}
                  <span className="text-neutral-400">DEFAULT 40,</span>
                  <br />
                  <span className="pl-6 text-blue-300">is_active</span>{' '}
                  <span className="text-amber-300">boolean</span>{' '}
                  <span className="text-neutral-400">DEFAULT true</span>
                  <br />
                  );
                  <br />
                  <br />
                  <span className="text-neutral-500">-- Fine gold conversion function for POS and Stock Register</span>
                  <br />
                  <span className="text-emerald-400">CREATE OR REPLACE FUNCTION</span> calculate_fine_gold(gross numeric, multiplier numeric){' '}
                  <span className="text-emerald-400">RETURNS numeric AS</span> $$
                  <br />
                  <span className="pl-6 text-neutral-300">SELECT round(gross * multiplier, 3);</span>
                  <br />
                  $$ <span className="text-emerald-400">LANGUAGE sql IMMUTABLE;</span>
                  <br />
                  <br />
                  <span className="text-emerald-400">ALTER TABLE</span> public.purity_standards{' '}
                  <span className="text-emerald-400">ENABLE ROW LEVEL SECURITY;</span>
                </div>
              </div>
            )}

            {/* Table Footer Bar */}
            <div className="h-[36px] bg-[#f8fafc] border-t border-[#e5e7eb] px-3.5 flex items-center justify-between text-[12px] text-neutral-500 font-mono select-none w-full">
              <div className="flex items-center gap-3">
                <span>6 purity standards configured</span>
                <span>•</span>
                <span>BIS IS 1417:2019 standard compliant</span>
              </div>
              <div className="text-emerald-600 font-medium">
                Standard Hallmarking Table
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
