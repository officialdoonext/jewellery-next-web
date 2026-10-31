'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  PauseCircle,
  Play,
  Trash2,
  Printer,
  BadgeIndianRupee,
  Lock,
  Radio,
  X,
} from 'lucide-react';

interface HeldBillsRecord {
  id: string;
  held_token_no: string;
  terminal_id: string;
  counter_staff: string;
  customer_name: string;
  customer_phone: string;
  items_count: number;
  total_gross_wt_g: number;
  total_net_wt_g: number;
  tentative_total: number;
  parked_at: string;
  auto_release_time: string;
  items_summary: string;
  status: 'PARKED_LOCKED' | 'RESUMED' | 'RELEASED';
}

const INITIAL_HELD_BILLS: HeldBillsRecord[] = [
  {
    id: 'de289174-88aa-419b-a765-cc98716bca99',
    held_token_no: 'HOLD-TK-081',
    terminal_id: 'COUNTER-02',
    counter_staff: 'Suresh Kumar',
    customer_name: 'Dr. Srinivasulu M',
    customer_phone: '+91 98490 22340',
    items_count: 3,
    total_gross_wt_g: 48.600,
    total_net_wt_g: 46.200,
    tentative_total: 184500.00,
    parked_at: '2026-10-31 11:15 AM',
    auto_release_time: 'Auto-release in 42 mins',
    items_summary: '22K Gents Hollow Chain (22.5g), 22K Ring (6.2g), Antique Kada (19.9g)',
    status: 'PARKED_LOCKED',
  },
  {
    id: 'de289174-88aa-419b-a765-cc98716bca98',
    held_token_no: 'HOLD-TK-080',
    terminal_id: 'COUNTER-01',
    counter_staff: 'R. K. Naidu',
    customer_name: 'Deepa Varma (VIP)',
    customer_phone: '+91 97011 88445',
    items_count: 5,
    total_gross_wt_g: 74.200,
    total_net_wt_g: 68.500,
    tentative_total: 412000.00,
    parked_at: '2026-10-31 11:25 AM',
    auto_release_time: 'Auto-release in 52 mins',
    items_summary: 'Bridal Choker set with matching ear drops & Maang Tikka',
    status: 'PARKED_LOCKED',
  },
  {
    id: 'de289174-88aa-419b-a765-cc98716bca97',
    held_token_no: 'HOLD-TK-079',
    terminal_id: 'COUNTER-03',
    counter_staff: 'P. Anitha',
    customer_name: 'Walk-in Guest #4',
    customer_phone: '+91 99490 33810',
    items_count: 2,
    total_gross_wt_g: 14.800,
    total_net_wt_g: 14.200,
    tentative_total: 114000.00,
    parked_at: '2026-10-31 11:02 AM',
    auto_release_time: 'Auto-release in 29 mins',
    items_summary: '18K Diamond Pendant + 22K Plain Bangles',
    status: 'PARKED_LOCKED',
  },
  {
    id: 'de289174-88aa-419b-a765-cc98716bca96',
    held_token_no: 'HOLD-TK-078',
    terminal_id: 'COUNTER-02',
    counter_staff: 'Suresh Kumar',
    customer_name: 'Chandrashekar Rao',
    customer_phone: '+91 98850 77123',
    items_count: 4,
    total_gross_wt_g: 38.100,
    total_net_wt_g: 38.100,
    tentative_total: 134500.00,
    parked_at: '2026-10-31 10:45 AM',
    auto_release_time: 'Auto-release in 12 mins',
    items_summary: '22K Gold Coins (10g x 2, 8g x 1, 5g x 1)',
    status: 'PARKED_LOCKED',
  },
];

export function SalesHeldBillsView() {
  const [heldBills, setHeldBills] = useState<HeldBillsRecord[]>(INITIAL_HELD_BILLS);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [selectedBill, setSelectedBill] = useState<HeldBillsRecord | null>(null);
  const [isTokenSlipOpen, setIsTokenSlipOpen] = useState(false);

  const handleResumeBill = (bill: HeldBillsRecord) => {
    alert(`Resumed Bill ${bill.held_token_no} for "${bill.customer_name}". Ready on POS billing counter!`);
    setHeldBills(heldBills.filter((b) => b.id !== bill.id));
  };

  const handleReleaseBill = (id: string) => {
    if (confirm('Are you sure you want to discard this held session and unlock all items back to showroom inventory?')) {
      setHeldBills(heldBills.filter((b) => b.id !== id));
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="sales_held_bills" />
      <ActionToolbar
        filterPlaceholder="Filter by token #, terminal, customer, staff..."
        insertLabel="Park Current Session"
        onInsertClick={() => {
          alert('To park a bill, click "Park / Hold Bill" in the Billing / POS screen.');
        }}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Parked Sessions</span>
                <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">{heldBills.length} Sessions</div>
              <div className="text-[11px] text-amber-700 mt-1 font-mono">
                Across 3 Billing Counters
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Locked Items</span>
                <Lock className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">
                {heldBills.reduce((acc, b) => acc + b.items_count, 0)} Pieces
              </div>
              <div className="text-[11px] text-blue-700 mt-1 font-mono">
                Temporarily held in trays
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Parked Value</span>
                <BadgeIndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700">
                ₹ {heldBills.reduce((acc, b) => acc + b.tentative_total, 0).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Ready for instant checkout
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Sync Health</span>
                <Radio className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                All Synced
              </div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Terminals 01, 02, 03 Connected
              </div>
            </div>
          </div>
        </div>

        {/* Supabase-style Table */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <PauseCircle className="w-4 h-4 text-amber-600" />
                <span className="font-mono font-medium text-neutral-800">held_bills</span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">Showing {heldBills.length} paused billing sessions</span>
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

            {activeTab === 'data' && (
              <div className="flex-1 overflow-x-auto custom-scrollbar w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#fcfcfc] border-b border-[#e5e7eb] text-neutral-600 font-mono text-[11px]">
                      <th className="w-10 px-3 py-2 border-r border-[#e5e7eb] text-center">
                        <input
                          type="checkbox"
                          className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                        />
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">token_no</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">terminal & staff</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">customer_name</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">scanned_items_summary</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">items</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">total_wt_g</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">tentative_total</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">parked_at</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">timer</span>
                      </th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {heldBills.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="w-10 px-3 py-2 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-[11px]">
                          <span
                            onClick={() => {
                              setSelectedBill(row);
                              setIsTokenSlipOpen(true);
                            }}
                            className="font-medium text-amber-700 hover:underline cursor-pointer"
                          >
                            {row.held_token_no}
                          </span>
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-100 text-neutral-800 border border-neutral-200 mr-1.5">
                            {row.terminal_id}
                          </span>
                          <span className="text-neutral-600 text-[11px]">{row.counter_staff}</span>
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-medium text-neutral-800">
                          <div>{row.customer_name}</div>
                          <div className="text-[10px] text-neutral-400 font-normal">{row.customer_phone}</div>
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] max-w-xs truncate text-neutral-700">
                          {row.items_summary}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-center text-neutral-700">
                          {row.items_count} pcs
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-right text-neutral-800">
                          {row.total_gross_wt_g.toFixed(3)} g
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-right font-medium text-neutral-900">
                          ₹ {row.tentative_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-[11px] text-neutral-500">
                          {row.parked_at}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            {row.auto_release_time}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleResumeBill(row)}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                              title="1-Click Resume Bill to POS"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Resume</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBill(row);
                                setIsTokenSlipOpen(true);
                              }}
                              className="p-1 rounded text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
                              title="Print Token Slip"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleReleaseBill(row.id)}
                              className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Discard & Unlock Items"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'definition' && (
              <div className="p-4 overflow-x-auto font-mono text-xs text-neutral-800 bg-[#fbfbfb] w-full">
                <div className="bg-neutral-900 text-neutral-100 p-4 rounded-md overflow-x-auto shadow-inner text-[12px] leading-relaxed w-full">
                  <span className="text-emerald-400">CREATE TABLE</span> public.held_bills (
                  <br />
                  <span className="pl-6 text-blue-300">id</span> <span className="text-amber-300">uuid</span> <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">terminal_id</span> <span className="text-amber-300">varchar(32)</span> <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">counter_staff</span> <span className="text-amber-300">varchar(255)</span> <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">items_count</span> <span className="text-amber-300">integer</span> <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">tentative_total</span> <span className="text-amber-300">numeric(10,2)</span> <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">parked_at</span> <span className="text-amber-300">timestamp</span> <span className="text-neutral-400">DEFAULT now()</span>
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Held Bill Token Slip Modal */}
      {isTokenSlipOpen && selectedBill && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full border border-[#e2e8f0] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <PauseCircle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-medium text-neutral-900">
                  Parked Counter Token
                </h3>
              </div>
              <button
                onClick={() => setIsTokenSlipOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 font-mono text-xs text-neutral-800 space-y-3">
              <div className="text-center pb-2 border-b border-dashed border-neutral-300">
                <div className="font-medium text-sm text-neutral-900">
                  SRI LAKSHMI JEWELLERS
                </div>
                <div className="text-xl font-medium text-amber-700 mt-1">
                  {selectedBill.held_token_no}
                </div>
                <div className="text-[10px] text-neutral-400">Held Session Token</div>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span>Terminal:</span>
                  <span>{selectedBill.terminal_id} ({selectedBill.counter_staff})</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{selectedBill.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Items Count:</span>
                  <span>{selectedBill.items_count} pieces ({selectedBill.total_gross_wt_g.toFixed(3)}g)</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-neutral-200 font-medium text-neutral-900">
                  <span>Tentative Total:</span>
                  <span>₹ {selectedBill.tentative_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-neutral-500 text-[10px]">
                  <span>Parked At:</span>
                  <span>{selectedBill.parked_at}</span>
                </div>
              </div>

              <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[10px] text-amber-800 text-center">
                Hand this token to the customer. Any terminal can scan and resume this checkout immediately.
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#e5e7eb] bg-[#f8fafc] flex justify-end gap-2">
              <button
                onClick={() => setIsTokenSlipOpen(false)}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Token</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
