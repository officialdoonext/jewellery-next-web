'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  SlidersHorizontal,
  Flame,
  AlertTriangle,
  Scale,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Lock,
  Plus,
  Gem,
  Sparkles,
} from 'lucide-react';

interface AdjustmentRecord {
  id: string;
  adjustment_no: string;
  tag_number: string;
  item_name: string;
  original_weight_g: number;
  new_weight_g: number;
  weight_delta_g: number;
  reason: string;
  initiated_by: string;
  approved_by: string;
  created_at: string;
  status: 'APPROVED' | 'PENDING';
}

const INITIAL_ADJUSTMENTS: AdjustmentRecord[] = [
  {
    id: '09a8b712-4412-4889-aa81-fe90123891ca',
    adjustment_no: 'ADJ-2026-019',
    tag_number: 'TAG-G-7104',
    item_name: 'Traditional Peacock Jhumkas',
    original_weight_g: 18.640,
    new_weight_g: 18.600,
    weight_delta_g: -0.040,
    reason: 'Ultrasonic cleaning & buffing loss',
    initiated_by: 'P. Venkat (Counter 2)',
    approved_by: 'M. Sridhar (Store Manager)',
    created_at: '2026-10-30 11:20 AM',
    status: 'APPROVED',
  },
  {
    id: '09a8b712-4412-4889-aa81-fe90123891cb',
    adjustment_no: 'ADJ-2026-020',
    tag_number: 'TAG-D-4512',
    item_name: 'Solitaire Diamond Ring (VVS1)',
    original_weight_g: 5.430,
    new_weight_g: 5.420,
    weight_delta_g: -0.010,
    reason: 'Prong laser retipping & stone seat tightening',
    initiated_by: 'G. Mohan (Karigar)',
    approved_by: 'Pending Manager PIN',
    created_at: '2026-10-30 03:45 PM',
    status: 'PENDING',
  },
  {
    id: '09a8b712-4412-4889-aa81-fe90123891cc',
    adjustment_no: 'ADJ-2026-018',
    tag_number: 'TAG-G-8910',
    item_name: '22K Temple Antique Haar',
    original_weight_g: 48.230,
    new_weight_g: 48.240,
    weight_delta_g: +0.010,
    reason: 'Digital scale calibration delta (Mettler Toledo Class II)',
    initiated_by: 'K. Rajesh (Vault Head)',
    approved_by: 'M. Sridhar (Store Manager)',
    created_at: '2026-10-29 09:10 AM',
    status: 'APPROVED',
  },
  {
    id: '09a8b712-4412-4889-aa81-fe90123891cd',
    adjustment_no: 'ADJ-2026-017',
    tag_number: 'TAG-D-9031',
    item_name: 'Emerald & Diamond Choker Necklace',
    original_weight_g: 62.480,
    new_weight_g: 62.400,
    weight_delta_g: -0.080,
    reason: 'Chipped Zambian emerald accent stone replacement',
    initiated_by: 'A. Sharma (VIP Sales)',
    approved_by: 'M. Sridhar (Store Manager)',
    created_at: '2026-10-28 04:20 PM',
    status: 'APPROVED',
  },
];

export function InventoryStockAdjustmentsView() {
  const [adjustments, setAdjustments] = useState<AdjustmentRecord[]>(INITIAL_ADJUSTMENTS);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [tagNumber, setTagNumber] = useState('TAG-G-6201');
  const [itemName, setItemName] = useState('Calcutta Handcrafted Bangles');
  const [origWt, setOrigWt] = useState('36.480');
  const [newWt, setNewWt] = useState('36.450');
  const [reason, setReason] = useState('Ultrasonic Cleaning & Buffing Loss');
  const [managerPin, setManagerPin] = useState('');

  const origNum = parseFloat(origWt) || 0;
  const newNum = parseFloat(newWt) || 0;
  const delta = newNum - origNum;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApprove = (id: string) => {
    setAdjustments(
      adjustments.map((a) =>
        a.id === id ? { ...a, status: 'APPROVED', approved_by: 'M. Sridhar (Store Manager)' } : a
      )
    );
  };

  const handleCreateAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerPin) {
      alert('Supervisor / Store Manager PIN authorization is required for stock weight adjustments.');
      return;
    }

    const newRecord: AdjustmentRecord = {
      id: crypto.randomUUID ? crypto.randomUUID() : `adj-${Date.now()}`,
      adjustment_no: `ADJ-2026-0${Math.floor(21 + Math.random() * 30)}`,
      tag_number: tagNumber,
      item_name: itemName,
      original_weight_g: origNum,
      new_weight_g: newNum,
      weight_delta_g: delta,
      reason: reason,
      initiated_by: 'Showroom Operator',
      approved_by: 'M. Sridhar (Verified via PIN)',
      created_at: 'Just now',
      status: 'APPROVED',
    };

    setAdjustments([newRecord, ...adjustments]);
    setShowAddForm(false);
    setManagerPin('');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="inventory_stock_adjustments" />
      <ActionToolbar
        filterPlaceholder="Filter adjustments by tag #, adjustment no, reason..."
        insertLabel="Record Adjustment"
        onInsertClick={() => setShowAddForm(true)}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics Summary Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Monthly Buffing Loss</span>
                <Flame className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">1.420 g</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Within 0.05% workshop quota
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Stone Breakage Loss</span>
                <Gem className="w-3.5 h-3.5 text-red-500" />
              </div>
              <div className="text-xl font-medium text-neutral-900">₹ 14,200</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Gemological replacement
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Scale Calibration Delta</span>
                <Scale className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">+0.010 g</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                Class II Calibrated
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Pending Approvals</span>
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-amber-700">1 Log</div>
              <div className="text-[11px] text-amber-700 mt-1 font-mono">
                Requires Manager PIN
              </div>
            </div>
          </div>
        </div>

        {/* Record Stock Adjustment Form (Collapsible) */}
        {showAddForm && (
          <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-[#f8fafc]">
            <div className="max-w-4xl mx-auto bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#f1f5f9]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-neutral-800 uppercase tracking-wider">
                    Record Stock Weight Discrepancy / Buffing Adjustment
                  </span>
                </div>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-neutral-400 hover:text-neutral-600 text-xs cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleCreateAdjustment} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Ornament Tag # *</label>
                    <input
                      type="text"
                      required
                      value={tagNumber}
                      onChange={(e) => setTagNumber(e.target.value)}
                      placeholder="TAG-G-XXXX"
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Item Name / Description</label>
                    <input
                      type="text"
                      required
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="Item name"
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Original Recorded Weight (g)</label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      value={origWt}
                      onChange={(e) => setOrigWt(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">New Verified Scale Weight (g) *</label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      value={newWt}
                      onChange={(e) => setNewWt(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Calculated Delta (g)</label>
                    <div
                      className={`w-full px-3 py-2 text-xs border rounded-md font-mono font-medium flex items-center justify-between ${
                        delta < 0
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : delta > 0
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-white border-[#e2e8f0] text-neutral-700'
                      }`}
                    >
                      <span>{delta < 0 ? `${delta.toFixed(3)} g (Loss)` : `+${delta.toFixed(3)} g`}</span>
                      <Scale className="w-3.5 h-3.5 opacity-60" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Adjustment Reason Code *</label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    >
                      <option value="Ultrasonic Cleaning & Buffing Loss">Ultrasonic Cleaning &amp; Buffing Loss</option>
                      <option value="Stone Breakage / Accent Replacement">Stone Breakage / Accent Replacement</option>
                      <option value="Digital Scale Calibration Delta">Digital Scale Calibration Delta</option>
                      <option value="Melting & Refining Assay Discrepancy">Melting &amp; Refining Assay Discrepancy</option>
                      <option value="Moisture / Tag String Weight Delta">Moisture / Tag String Weight Delta</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Store Manager Approval PIN *</label>
                    <div className="relative">
                      <input
                        type="password"
                        maxLength={4}
                        required
                        value={managerPin}
                        onChange={(e) => setManagerPin(e.target.value)}
                        placeholder="••••"
                        className="w-full pl-3 pr-8 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono tracking-widest"
                      />
                      <Lock className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Authorize &amp; Post Adjustment</span>
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
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  stock_adjustments
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Weight discrepancy, buffing &amp; stone breakage audit trail
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
                        <span className="text-neutral-800">adjustment_no</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">tag_number</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">item_name</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">weight_delta (g)</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">reason</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">initiated_by</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">approved_by</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">timestamp</span>
                      </th>
                      <th className="px-3.5 py-2 font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">status</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb] font-mono text-neutral-800 text-[12px]">
                    {adjustments.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/80 transition-colors group">
                        <td className="px-3 py-2 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>

                        {/* Adjustment No */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-medium text-neutral-900">
                          <span className="px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-800 text-[11px]">
                            {row.adjustment_no}
                          </span>
                        </td>

                        {/* Tag # */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700">
                          {row.tag_number}
                        </td>

                        {/* Item Name */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-sans font-medium text-neutral-900">
                          {row.item_name}
                        </td>

                        {/* Delta */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-medium">
                          <span
                            className={
                              row.weight_delta_g < 0
                                ? 'text-amber-700'
                                : row.weight_delta_g > 0
                                ? 'text-emerald-700'
                                : 'text-neutral-700'
                            }
                          >
                            {row.weight_delta_g < 0
                              ? `${row.weight_delta_g.toFixed(3)} g`
                              : `+${row.weight_delta_g.toFixed(3)} g`}
                          </span>
                        </td>

                        {/* Reason */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-sans text-neutral-700 text-[11px]">
                          {row.reason}
                        </td>

                        {/* Initiated By */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-sans text-neutral-600 text-[11px]">
                          {row.initiated_by}
                        </td>

                        {/* Approved By */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-sans text-neutral-600 text-[11px]">
                          {row.approved_by}
                        </td>

                        {/* Timestamp */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-500 text-[11px]">
                          {row.created_at}
                        </td>

                        {/* Status */}
                        <td className="px-3.5 py-2 whitespace-nowrap text-center">
                          {row.status === 'APPROVED' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              APPROVED
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApprove(row.id)}
                              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                            >
                              PENDING PIN
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.stock_adjustments (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">adjustment_no</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">UNIQUE NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">tag_number</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">NOT NULL REFERENCES public.inventory_ornaments (tag_number),</span>
                  <br />
                  <span className="pl-6 text-blue-300">weight_delta_g</span>{' '}
                  <span className="text-amber-300">numeric(8,3)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">reason</span>{' '}
                  <span className="text-amber-300">varchar(255)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">approved_by</span>{' '}
                  <span className="text-amber-300">varchar(100)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">created_at</span>{' '}
                  <span className="text-amber-300">timestamptz</span>{' '}
                  <span className="text-neutral-400">DEFAULT now()</span>
                  <br />
                  );
                  <br />
                  <br />
                  <span className="text-emerald-400">ALTER TABLE</span> public.stock_adjustments{' '}
                  <span className="text-emerald-400">ENABLE ROW LEVEL SECURITY;</span>
                </div>
              </div>
            )}

            {/* Table Footer Bar */}
            <div className="h-[36px] bg-[#f8fafc] border-t border-[#e5e7eb] px-3.5 flex items-center justify-between text-[12px] text-neutral-500 font-mono select-none w-full">
              <div className="flex items-center gap-3">
                <span>{adjustments.length} logged adjustments</span>
                <span>•</span>
                <span>Manager PIN audit forensic trail active</span>
              </div>
              <div className="text-emerald-600 font-medium">
                Loss Tolerance Within Limits
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
