'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Coins,
  Scale,
  TrendingUp,
  Percent,
  Plus,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Layers,
  Sparkles,
} from 'lucide-react';

interface MetalTypeItem {
  id: string;
  metal_name: string;
  symbol: string;
  base_unit: 'GRAMS' | 'CARATS' | 'TROY_OUNCE';
  density_g_cm3: number;
  rate_feed_source: string;
  current_spot_rate: number;
  gst_rate_percent: number;
  is_taxable: boolean;
  is_active: boolean;
}

const INITIAL_METALS: MetalTypeItem[] = [
  {
    id: 'e1a90234-7711-4819-bf91-91a7c2901234',
    metal_name: 'Yellow Gold (Au)',
    symbol: 'Au',
    base_unit: 'GRAMS',
    density_g_cm3: 19.32,
    rate_feed_source: 'IBJA Spot Daily (Mumbai)',
    current_spot_rate: 7850.00,
    gst_rate_percent: 3.0,
    is_taxable: true,
    is_active: true,
  },
  {
    id: 'e1a90234-7711-4819-bf91-91a7c2901235',
    metal_name: 'Rose Gold (Au-Cu)',
    symbol: 'Au',
    base_unit: 'GRAMS',
    density_g_cm3: 15.58,
    rate_feed_source: 'IBJA Spot Daily (Mumbai)',
    current_spot_rate: 7850.00,
    gst_rate_percent: 3.0,
    is_taxable: true,
    is_active: true,
  },
  {
    id: 'e1a90234-7711-4819-bf91-91a7c2901236',
    metal_name: 'White Gold (Au-Ni)',
    symbol: 'Au',
    base_unit: 'GRAMS',
    density_g_cm3: 15.90,
    rate_feed_source: 'IBJA Spot Daily (Mumbai)',
    current_spot_rate: 7850.00,
    gst_rate_percent: 3.0,
    is_taxable: true,
    is_active: true,
  },
  {
    id: 'e1a90234-7711-4819-bf91-91a7c2901237',
    metal_name: 'Fine Silver 999 (Ag)',
    symbol: 'Ag',
    base_unit: 'GRAMS',
    density_g_cm3: 10.49,
    rate_feed_source: 'MCX Silver Future Spot',
    current_spot_rate: 94.50,
    gst_rate_percent: 3.0,
    is_taxable: true,
    is_active: true,
  },
  {
    id: 'e1a90234-7711-4819-bf91-91a7c2901238',
    metal_name: 'Sterling Silver 925 (Ag)',
    symbol: 'Ag',
    base_unit: 'GRAMS',
    density_g_cm3: 10.36,
    rate_feed_source: 'MCX Silver Future Spot',
    current_spot_rate: 87.40,
    gst_rate_percent: 3.0,
    is_taxable: true,
    is_active: true,
  },
  {
    id: 'e1a90234-7711-4819-bf91-91a7c2901239',
    metal_name: 'Platinum 950 (Pt)',
    symbol: 'Pt',
    base_unit: 'GRAMS',
    density_g_cm3: 21.45,
    rate_feed_source: 'London Bullion Market (LBMA)',
    current_spot_rate: 3420.00,
    gst_rate_percent: 3.0,
    is_taxable: true,
    is_active: true,
  },
];

export function InventoryMetalTypesView() {
  const [metals, setMetals] = useState<MetalTypeItem[]>(INITIAL_METALS);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);

  // Add Metal Form State
  const [metalName, setMetalName] = useState('');
  const [symbol, setSymbol] = useState('Au');
  const [baseUnit, setBaseUnit] = useState<'GRAMS' | 'CARATS' | 'TROY_OUNCE'>('GRAMS');
  const [density, setDensity] = useState('19.32');
  const [rateFeed, setRateFeed] = useState('IBJA Spot Daily (Mumbai)');
  const [spotRate, setSpotRate] = useState('7850.00');
  const [isTaxable, setIsTaxable] = useState(true);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleActive = (id: string) => {
    setMetals(metals.map((m) => (m.id === id ? { ...m, is_active: !m.is_active } : m)));
  };

  const handleAddMetal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!metalName) return;

    const newMetal: MetalTypeItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : `metal-${Date.now()}`,
      metal_name: metalName,
      symbol: symbol,
      base_unit: baseUnit,
      density_g_cm3: parseFloat(density) || 19.32,
      rate_feed_source: rateFeed,
      current_spot_rate: parseFloat(spotRate) || 0,
      gst_rate_percent: 3.0,
      is_taxable: isTaxable,
      is_active: true,
    };

    setMetals([...metals, newMetal]);
    setMetalName('');
    setShowAddCard(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="inventory_metal_types" />
      <ActionToolbar
        filterPlaceholder="Filter precious metals..."
        insertLabel="New Metal Type"
        onInsertClick={() => setShowAddCard(true)}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI metrics cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Supported Metals</span>
                <Coins className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">{metals.length} Metals</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                Gold, Silver, Platinum
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Base Unit</span>
                <Scale className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">Grams / Carats</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                3 Decimal precision (.001g)
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Rate Feed Active</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">IBJA / MCX Linked</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                Live market sync
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Taxable Items</span>
                <Percent className="w-3.5 h-3.5 text-neutral-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">100% at 3% GST</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                CGST 1.5% + SGST 1.5%
              </div>
            </div>
          </div>
        </div>

        {/* Add Metal Type Form (Collapsible) */}
        {showAddCard && (
          <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-[#f8fafc]">
            <div className="max-w-4xl mx-auto bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#f1f5f9]">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-neutral-800 uppercase tracking-wider">
                    Configure Precious Metal
                  </span>
                </div>
                <button
                  onClick={() => setShowAddCard(false)}
                  className="text-neutral-400 hover:text-neutral-600 text-xs cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleAddMetal} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Metal Name *</label>
                    <input
                      type="text"
                      required
                      value={metalName}
                      onChange={(e) => setMetalName(e.target.value)}
                      placeholder="e.g. Palladium 950 (Pd)"
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Chemical Symbol</label>
                    <input
                      type="text"
                      required
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value)}
                      placeholder="Au, Ag, Pt, Pd"
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Base Unit</label>
                    <select
                      value={baseUnit}
                      onChange={(e) => setBaseUnit(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    >
                      <option value="GRAMS">Grams (g)</option>
                      <option value="CARATS">Carats (cts)</option>
                      <option value="TROY_OUNCE">Troy Ounce (oz)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Specific Gravity / Density (g/cm³)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={density}
                      onChange={(e) => setDensity(e.target.value)}
                      placeholder="19.32"
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Market Rate Feed Link</label>
                    <input
                      type="text"
                      value={rateFeed}
                      onChange={(e) => setRateFeed(e.target.value)}
                      placeholder="IBJA Spot / MCX / Manual"
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Current Spot Rate (₹/unit)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={spotRate}
                      onChange={(e) => setSpotRate(e.target.value)}
                      placeholder="7850.00"
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700">
                    <input
                      type="checkbox"
                      checked={isTaxable}
                      onChange={(e) => setIsTaxable(e.target.checked)}
                      className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                    />
                    <span>Subject to 3.0% Jewellery GST</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCard(false)}
                      className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Save Metal Type
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Supabase-style Table / Schema Definition Section */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            {/* Table Header Info Bar */}
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  metal_types
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  {metals.length} precious metals master records
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
                        <span className="text-neutral-800">metal_name</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">symbol</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">base_unit</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">density (g/cm³)</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">market_feed</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">live_rate (₹)</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">taxable</span>
                      </th>
                      <th className="px-3.5 py-2 font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">status</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb] font-mono text-neutral-800 text-[12px]">
                    {metals.map((row) => (
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

                        {/* Metal Name */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-sans font-medium text-neutral-900">
                          {row.metal_name}
                        </td>

                        {/* Symbol */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-center">
                          <span className="px-2 py-0.5 rounded font-mono font-medium text-[11px] bg-neutral-100 border border-neutral-200 text-neutral-800">
                            {row.symbol}
                          </span>
                        </td>

                        {/* Base Unit */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700">
                          {row.base_unit}
                        </td>

                        {/* Density */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700">
                          {row.density_g_cm3.toFixed(2)} g/cm³
                        </td>

                        {/* Rate Feed */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-sans">
                            <TrendingUp className="w-3 h-3" />
                            {row.rate_feed_source}
                          </span>
                        </td>

                        {/* Live Rate */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-medium text-neutral-900">
                          ₹ {row.current_spot_rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Taxable */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-center">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            3.0% GST
                          </span>
                        </td>

                        {/* Active toggle */}
                        <td className="px-3.5 py-2 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleToggleActive(row.id)}
                            className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer inline-block ${
                              row.is_active ? 'bg-emerald-500' : 'bg-neutral-200'
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-xs transition-all ${
                                row.is_active ? 'left-4' : 'left-0.5'
                              }`}
                            />
                          </button>
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.metal_types (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">metal_name</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>{' '}
                  <span className="text-neutral-400">NOT NULL UNIQUE,</span>
                  <br />
                  <span className="pl-6 text-blue-300">symbol</span>{' '}
                  <span className="text-amber-300">varchar(8)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">base_unit</span>{' '}
                  <span className="text-amber-300">varchar(16)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;GRAMS&apos;,</span>
                  <br />
                  <span className="pl-6 text-blue-300">density_g_cm3</span>{' '}
                  <span className="text-amber-300">numeric(6,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">rate_feed_source</span>{' '}
                  <span className="text-amber-300">varchar(128)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;IBJA Spot Daily&apos;,</span>
                  <br />
                  <span className="pl-6 text-blue-300">current_spot_rate</span>{' '}
                  <span className="text-amber-300">numeric(12,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">is_taxable</span>{' '}
                  <span className="text-amber-300">boolean</span>{' '}
                  <span className="text-neutral-400">DEFAULT true,</span>
                  <br />
                  <span className="pl-6 text-blue-300">is_active</span>{' '}
                  <span className="text-amber-300">boolean</span>{' '}
                  <span className="text-neutral-400">DEFAULT true</span>
                  <br />
                  );
                  <br />
                  <br />
                  <span className="text-neutral-500">-- Ensure rapid rate feed synchronization</span>
                  <br />
                  <span className="text-emerald-400">ALTER TABLE</span> public.metal_types{' '}
                  <span className="text-emerald-400">ENABLE ROW LEVEL SECURITY;</span>
                </div>
              </div>
            )}

            {/* Table Footer Bar */}
            <div className="h-[36px] bg-[#f8fafc] border-t border-[#e5e7eb] px-3.5 flex items-center justify-between text-[12px] text-neutral-500 font-mono select-none w-full">
              <div className="flex items-center gap-3">
                <span>{metals.length} metals configured</span>
                <span>•</span>
                <span>IBJA / MCX live quote polling every 60s</span>
              </div>
              <div className="text-emerald-600 font-medium">
                Bullion Feed Operational
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
