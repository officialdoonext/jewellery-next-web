'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  ArrowLeftRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Scale,
  Vault,
  Copy,
  Check,
  Plus,
  Lock,
  UserCheck,
  Send,
  Eye,
} from 'lucide-react';

interface TransferManifest {
  id: string;
  transfer_id: string;
  from_location: string;
  to_location: string;
  items_count: number;
  total_grams: number;
  dispatched_by: string;
  verified_by: string;
  dispatched_at: string;
  notes: string;
  status: 'COMPLETED' | 'IN_TRANSIT' | 'REJECTED';
}

const INITIAL_TRANSFERS: TransferManifest[] = [
  {
    id: '88721903-a123-41bb-9872-dd9081263ba1',
    transfer_id: 'TRF-2026-081',
    from_location: 'Main Vault #1',
    to_location: 'Display Counter B',
    items_count: 24,
    total_grams: 820.400,
    dispatched_by: 'M. Sridhar (Custodian A)',
    verified_by: 'K. Rajesh (Counter B Head)',
    dispatched_at: '2026-10-30 10:15 AM',
    notes: 'Morning showroom display restock of bridal bangles',
    status: 'COMPLETED',
  },
  {
    id: '88721903-a123-41bb-9872-dd9081263ba2',
    transfer_id: 'TRF-2026-082',
    from_location: 'Display Counter 2',
    to_location: 'Workshop (Polishing)',
    items_count: 6,
    total_grams: 145.200,
    dispatched_by: 'P. Venkat',
    verified_by: 'G. Mohan (Master Karigar)',
    dispatched_at: '2026-10-30 02:45 PM',
    notes: 'Ultrasonic cleaning and screw tightening request',
    status: 'IN_TRANSIT',
  },
  {
    id: '88721903-a123-41bb-9872-dd9081263ba3',
    transfer_id: 'TRF-2026-083',
    from_location: 'Strongroom Safe',
    to_location: 'Exhibition Tray #4',
    items_count: 8,
    total_grams: 274.900,
    dispatched_by: 'M. Sridhar (Custodian A)',
    verified_by: 'A. Sharma (VIP Sales)',
    dispatched_at: '2026-10-30 04:10 PM',
    notes: 'VIP Bridal Suite private consultation presentation',
    status: 'IN_TRANSIT',
  },
  {
    id: '88721903-a123-41bb-9872-dd9081263ba4',
    transfer_id: 'TRF-2026-080',
    from_location: 'Workshop (Crafting)',
    to_location: 'Main Vault #1',
    items_count: 14,
    total_grams: 480.000,
    dispatched_by: 'G. Mohan (Master Karigar)',
    verified_by: 'M. Sridhar (Custodian A)',
    dispatched_at: '2026-10-29 06:30 PM',
    notes: 'Completed lot #941 with BIS laser hallmarking certificate',
    status: 'COMPLETED',
  },
];

export function InventoryStockTransfersView() {
  const [transfers, setTransfers] = useState<TransferManifest[]>(INITIAL_TRANSFERS);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showQuickForm, setShowQuickForm] = useState(false);

  // New Transfer Form State
  const [fromLoc, setFromLoc] = useState('Main Vault #1');
  const [toLoc, setToLoc] = useState('Display Counter B');
  const [itemCount, setItemCount] = useState('5');
  const [totalWeight, setTotalWeight] = useState('120.500');
  const [dispatchName, setDispatchName] = useState('M. Sridhar (Custodian A)');
  const [custodianPin, setCustodianPin] = useState('');
  const [notes, setNotes] = useState('');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAcknowledge = (id: string) => {
    setTransfers(
      transfers.map((tr) =>
        tr.id === id ? { ...tr, status: 'COMPLETED', verified_by: 'R. Incharge (Acknowledged)' } : tr
      )
    );
  };

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!totalWeight || !custodianPin) {
      alert('Dual custodian PIN authentication is mandatory for internal stock transfer.');
      return;
    }

    const newTrf: TransferManifest = {
      id: crypto.randomUUID ? crypto.randomUUID() : `trf-${Date.now()}`,
      transfer_id: `TRF-2026-0${Math.floor(84 + Math.random() * 20)}`,
      from_location: fromLoc,
      to_location: toLoc,
      items_count: parseInt(itemCount) || 1,
      total_grams: parseFloat(totalWeight) || 0,
      dispatched_by: dispatchName,
      verified_by: 'Awaiting PIN Verification',
      dispatched_at: 'Just now',
      notes: notes || 'Showroom internal transfer',
      status: 'IN_TRANSIT',
    };

    setTransfers([newTrf, ...transfers]);
    setShowQuickForm(false);
    setTotalWeight('');
    setCustodianPin('');
    setNotes('');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="inventory_stock_transfers" />
      <ActionToolbar
        filterPlaceholder="Filter transfers by manifest ID, custodian, location..."
        insertLabel="New Transfer"
        onInsertClick={() => setShowQuickForm(true)}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics Summary Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Transfers Today</span>
                <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">8 Manifests</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                All dual-authorized
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Weight Moved</span>
                <Scale className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">1,240.500 g</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Vault to counter balance
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">In-Transit Pending</span>
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-amber-700">2 Manifests</div>
              <div className="text-[11px] text-amber-700 mt-1 font-mono">
                Awaiting counter receipt
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Discrepancy</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">0.000 g</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                100% weight match
              </div>
            </div>
          </div>
        </div>

        {/* Quick Transfer Form (Collapsible) */}
        {showQuickForm && (
          <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-[#f8fafc]">
            <div className="max-w-4xl mx-auto bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#f1f5f9]">
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-neutral-800 uppercase tracking-wider">
                    Initiate Stock Movement (Dual Custodian Authentication)
                  </span>
                </div>
                <button
                  onClick={() => setShowQuickForm(false)}
                  className="text-neutral-400 hover:text-neutral-600 text-xs cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleCreateTransfer} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Origin Location *</label>
                    <select
                      value={fromLoc}
                      onChange={(e) => setFromLoc(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    >
                      <option value="Main Vault #1">Main Vault #1 (Strongroom)</option>
                      <option value="Display Counter B">Display Counter B</option>
                      <option value="Display Counter 2">Display Counter 2</option>
                      <option value="Workshop">Workshop / Polishing Bay</option>
                      <option value="Strongroom Safe">Strongroom Safe</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Destination Location *</label>
                    <select
                      value={toLoc}
                      onChange={(e) => setToLoc(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    >
                      <option value="Display Counter B">Display Counter B</option>
                      <option value="Main Vault #1">Main Vault #1 (Strongroom)</option>
                      <option value="Display Counter 2">Display Counter 2</option>
                      <option value="Exhibition Tray #4">Exhibition Tray #4</option>
                      <option value="Workshop (Polishing)">Workshop (Polishing)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Items Count (pcs)</label>
                    <input
                      type="number"
                      required
                      value={itemCount}
                      onChange={(e) => setItemCount(e.target.value)}
                      placeholder="1"
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Total Transfer Weight (g) *</label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      value={totalWeight}
                      onChange={(e) => setTotalWeight(e.target.value)}
                      placeholder="0.000"
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Receiving Custodian PIN *</label>
                    <div className="relative">
                      <input
                        type="password"
                        maxLength={4}
                        required
                        value={custodianPin}
                        onChange={(e) => setCustodianPin(e.target.value)}
                        placeholder="••••"
                        className="w-full pl-3 pr-8 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono tracking-widest"
                      />
                      <Lock className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Transfer Purpose / Notes</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Counter morning setup, Karigar lot delivery"
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowQuickForm(false)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Authorize & Dispatch Manifest</span>
                  </button>
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
                <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  stock_transfers
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Vault, counter &amp; workshop transfer manifest audit
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
                        <span className="text-neutral-800">manifest_id</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">from_location</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">to_location</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">items</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">total_grams</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">dispatched_by</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">verified_by</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">status</span>
                      </th>
                      <th className="px-3.5 py-2 font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">action</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb] font-mono text-neutral-800 text-[12px]">
                    {transfers.map((tr) => (
                      <tr key={tr.id} className="hover:bg-neutral-50/80 transition-colors group">
                        <td className="px-3 py-2 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>

                        {/* Manifest ID */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-medium text-neutral-900">
                          <span className="px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-800 text-[11px]">
                            {tr.transfer_id}
                          </span>
                        </td>

                        {/* From */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-sans text-neutral-700">
                          {tr.from_location}
                        </td>

                        {/* To */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-sans text-neutral-700 font-medium">
                          {tr.to_location}
                        </td>

                        {/* Items */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-medium text-neutral-900">
                          {tr.items_count} pcs
                        </td>

                        {/* Total Grams */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-medium text-neutral-900">
                          {tr.total_grams.toFixed(3)} g
                        </td>

                        {/* Dispatched By */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-sans text-neutral-600 text-[11px]">
                          {tr.dispatched_by}
                        </td>

                        {/* Verified By */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-sans text-neutral-600 text-[11px]">
                          {tr.verified_by}
                        </td>

                        {/* Status */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              tr.status === 'COMPLETED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : tr.status === 'IN_TRANSIT'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {tr.status}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-3.5 py-2 whitespace-nowrap text-center">
                          {tr.status === 'IN_TRANSIT' ? (
                            <button
                              onClick={() => handleAcknowledge(tr.id)}
                              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium shadow-2xs transition-colors cursor-pointer"
                            >
                              Acknowledge &amp; Receive
                            </button>
                          ) : (
                            <span className="text-neutral-400 text-[11px] font-sans flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Settled
                            </span>
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.stock_transfers (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">transfer_id</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">UNIQUE NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">from_location</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">to_location</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">total_grams</span>{' '}
                  <span className="text-amber-300">numeric(10,3)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">items_count</span>{' '}
                  <span className="text-amber-300">integer</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">dispatched_by</span>{' '}
                  <span className="text-amber-300">varchar(100)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">verified_by</span>{' '}
                  <span className="text-amber-300">varchar(100)</span>{' '}
                  <span className="text-neutral-400">DEFAULT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">status</span>{' '}
                  <span className="text-amber-300">varchar(20)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;IN_TRANSIT&apos;,</span>
                  <br />
                  <span className="pl-6 text-blue-300">dispatched_at</span>{' '}
                  <span className="text-amber-300">timestamptz</span>{' '}
                  <span className="text-neutral-400">DEFAULT now()</span>
                  <br />
                  );
                  <br />
                  <br />
                  <span className="text-emerald-400">ALTER TABLE</span> public.stock_transfers{' '}
                  <span className="text-emerald-400">ENABLE ROW LEVEL SECURITY;</span>
                </div>
              </div>
            )}

            {/* Table Footer Bar */}
            <div className="h-[36px] bg-[#f8fafc] border-t border-[#e5e7eb] px-3.5 flex items-center justify-between text-[12px] text-neutral-500 font-mono select-none w-full">
              <div className="flex items-center gap-3">
                <span>{transfers.length} manifests recorded</span>
                <span>•</span>
                <span>Dual Custodian Key &amp; PIN enforced</span>
              </div>
              <div className="text-emerald-600 font-medium">
                Vault Security In Sync
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
