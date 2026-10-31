'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  AlertTriangle,
  Flame,
  Clock,
  Coins,
  TrendingUp,
  Hammer,
  CheckCircle2,
  Copy,
  Check,
  Send,
  ArrowRight,
  PackageCheck,
  AlertCircle,
} from 'lucide-react';

interface ReorderRule {
  id: string;
  category: string;
  weight_band: string;
  current_pcs: number;
  min_threshold_pcs: number;
  reorder_qty_pcs: number;
  supplier: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  est_gold_required_g: number;
  status: 'PENDING_ORDER' | 'ORDERED';
}

const INITIAL_RULES: ReorderRule[] = [
  {
    id: '71a90234-bc11-419a-9921-6571a82910aa',
    category: 'Plain Gold Chains',
    weight_band: '8.000g – 12.000g',
    current_pcs: 4,
    min_threshold_pcs: 25,
    reorder_qty_pcs: 25,
    supplier: 'Mohan Karigar Works',
    urgency: 'CRITICAL',
    est_gold_required_g: 250.000,
    status: 'PENDING_ORDER',
  },
  {
    id: '71a90234-bc11-419a-9921-6571a82910ab',
    category: 'Daily Wear Gold Rings',
    weight_band: '3.000g – 5.000g',
    current_pcs: 6,
    min_threshold_pcs: 30,
    reorder_qty_pcs: 30,
    supplier: 'Surat Diamond Craft',
    urgency: 'HIGH',
    est_gold_required_g: 120.000,
    status: 'PENDING_ORDER',
  },
  {
    id: '71a90234-bc11-419a-9921-6571a82910ac',
    category: 'Traditional Gold Jhumkas',
    weight_band: '15.000g – 20.000g',
    current_pcs: 5,
    min_threshold_pcs: 20,
    reorder_qty_pcs: 20,
    supplier: 'Calcutta Filigree Hub',
    urgency: 'HIGH',
    est_gold_required_g: 350.000,
    status: 'PENDING_ORDER',
  },
  {
    id: '71a90234-bc11-419a-9921-6571a82910ad',
    category: 'Fine Gold Coins (999)',
    weight_band: '5.000g & 10.000g',
    current_pcs: 8,
    min_threshold_pcs: 40,
    reorder_qty_pcs: 40,
    supplier: 'MMTC-PAMP India',
    urgency: 'CRITICAL',
    est_gold_required_g: 300.000,
    status: 'PENDING_ORDER',
  },
  {
    id: '71a90234-bc11-419a-9921-6571a82910ae',
    category: 'Bridal Choker Necklaces',
    weight_band: '45.000g – 65.000g',
    current_pcs: 12,
    min_threshold_pcs: 15,
    reorder_qty_pcs: 10,
    supplier: 'Rajkot Antique Goldsmiths',
    urgency: 'MEDIUM',
    est_gold_required_g: 550.000,
    status: 'ORDERED',
  },
];

export function InventoryReorderAlertsView() {
  const [rules, setRules] = useState<ReorderRule[]>(INITIAL_RULES);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOrder = (id: string) => {
    setRules(
      rules.map((r) => (r.id === id ? { ...r, status: 'ORDERED' } : r))
    );
  };

  const criticalItems = rules.filter((r) => r.urgency === 'CRITICAL' || r.urgency === 'HIGH');

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="inventory_reorder_alerts" />
      <ActionToolbar
        filterPlaceholder="Filter low stock reorder alerts by category, supplier..."
        insertLabel="Run Replenishment AI"
        onInsertClick={() => alert('Calculating Karigar orders based on 30-day showroom sales velocity...')}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI metrics cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-red-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider text-red-700">Critical Alerts</span>
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              </div>
              <div className="text-xl font-medium text-red-700">4 Categories</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Below safe showroom buffer
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Reorder Value Needed</span>
                <Coins className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">₹ 42.50 Lakhs</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                1,020.000 g Pure bullion req.
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Fast Moving Category</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-sm font-medium text-neutral-900 mt-1">Plain Gold Chains</div>
              <div className="text-[11px] text-emerald-600 mt-0.5 font-mono">
                8g–12g (Turnover 4.2x/mo)
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Avg Karigar Lead Time</span>
                <Clock className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">7 Days</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Order before Friday noon
              </div>
            </div>
          </div>
        </div>

        {/* Urgency Cards Grid: 4 cards for low-stock items */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-[#f8fafc]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-600" />
              <span className="text-xs font-medium text-neutral-800 uppercase tracking-wider">
                Immediate Action Required (Critical Stock Depletion)
              </span>
            </div>
            <span className="text-xs text-neutral-500 font-mono">
              Fast replenishment suggested
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {criticalItems.slice(0, 4).map((item) => {
              const percent = Math.min(100, Math.round((item.current_pcs / item.min_threshold_pcs) * 100));
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-lg bg-white border border-[#e2e8f0] hover:border-red-300 transition-all shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    {/* Urgency Badge & Category */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium font-mono ${
                          item.urgency === 'CRITICAL'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {item.urgency}
                      </span>
                      <span className="text-[11px] text-neutral-500 font-mono">
                        {item.current_pcs} / {item.min_threshold_pcs} pcs
                      </span>
                    </div>

                    <h4 className="text-xs font-medium text-neutral-900 leading-snug">
                      {item.category}
                    </h4>
                    <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                      Band: {item.weight_band}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          percent < 25 ? 'bg-red-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="mt-2 text-[11px] text-neutral-600">
                      Est. Gold Req:{' '}
                      <span className="font-mono font-medium text-neutral-900">
                        {item.est_gold_required_g.toFixed(3)} g
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-500 truncate">
                      Karigar: {item.supplier}
                    </div>
                  </div>

                  {/* 1-Click Create Jobwork Order button */}
                  <div className="pt-3 mt-3 border-t border-[#f1f5f9]">
                    <button
                      onClick={() => handleOrder(item.id)}
                      disabled={item.status === 'ORDERED'}
                      className={`w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                        item.status === 'ORDERED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-neutral-900 hover:bg-neutral-800 text-white shadow-2xs'
                      }`}
                    >
                      {item.status === 'ORDERED' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Jobwork Placed</span>
                        </>
                      ) : (
                        <>
                          <Hammer className="w-3.5 h-3.5 text-amber-400" />
                          <span>1-Click Jobwork Order</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Supabase-style Table / Schema Definition Section */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            {/* Table Header Info Bar */}
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  reorder_alerts
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Inventory reorder rules and fast-moving stock buffers
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
                        <span className="text-neutral-800">category</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">weight_band</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">current_stock</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">min_safe_threshold</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">reorder_qty</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">karigar_supplier</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">urgency</span>
                      </th>
                      <th className="px-3.5 py-2 font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">action</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb] font-mono text-neutral-800 text-[12px]">
                    {rules.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/80 transition-colors group">
                        <td className="px-3 py-2 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>

                        {/* Category */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-sans font-medium text-neutral-900">
                          {row.category}
                        </td>

                        {/* Weight Band */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-600">
                          {row.weight_band}
                        </td>

                        {/* Current */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-medium">
                          <span
                            className={
                              row.current_pcs <= row.min_threshold_pcs * 0.3
                                ? 'text-red-700 font-semibold'
                                : 'text-neutral-800'
                            }
                          >
                            {row.current_pcs} pcs
                          </span>
                        </td>

                        {/* Safe Threshold */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right text-neutral-600">
                          {row.min_threshold_pcs} pcs
                        </td>

                        {/* Reorder Qty */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-medium text-neutral-900">
                          +{row.reorder_qty_pcs} pcs
                        </td>

                        {/* Supplier */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-sans text-neutral-700 text-[11px]">
                          {row.supplier}
                        </td>

                        {/* Urgency */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              row.urgency === 'CRITICAL'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : row.urgency === 'HIGH'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {row.urgency}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-3.5 py-2 whitespace-nowrap text-center">
                          {row.status === 'ORDERED' ? (
                            <span className="text-emerald-700 text-[11px] font-medium flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Placed
                            </span>
                          ) : (
                            <button
                              onClick={() => handleOrder(row.id)}
                              className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-medium shadow-2xs transition-colors cursor-pointer"
                            >
                              Reorder
                            </button>
                          )}
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.reorder_alerts (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">category</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">weight_band</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">current_pcs</span>{' '}
                  <span className="text-amber-300">integer</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">min_threshold_pcs</span>{' '}
                  <span className="text-amber-300">integer</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">reorder_qty_pcs</span>{' '}
                  <span className="text-amber-300">integer</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">supplier</span>{' '}
                  <span className="text-amber-300">varchar(100)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">urgency</span>{' '}
                  <span className="text-amber-300">varchar(20)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;MEDIUM&apos;,</span>
                  <br />
                  <span className="pl-6 text-blue-300">status</span>{' '}
                  <span className="text-amber-300">varchar(20)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;PENDING_ORDER&apos;</span>
                  <br />
                  );
                  <br />
                  <br />
                  <span className="text-emerald-400">ALTER TABLE</span> public.reorder_alerts{' '}
                  <span className="text-emerald-400">ENABLE ROW LEVEL SECURITY;</span>
                </div>
              </div>
            )}

            {/* Table Footer Bar */}
            <div className="h-[36px] bg-[#f8fafc] border-t border-[#e5e7eb] px-3.5 flex items-center justify-between text-[12px] text-neutral-500 font-mono select-none w-full">
              <div className="flex items-center gap-3">
                <span>{rules.length} configured alert triggers</span>
                <span>•</span>
                <span>Diwali / Wedding season stock forecast active</span>
              </div>
              <div className="text-emerald-600 font-medium">
                Replenishment Thresholds Active
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
