'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Truck,
  Scale,
  CheckCircle2,
  X,
  BadgeIndianRupee,
} from 'lucide-react';

interface DeliveryChallan {
  id: string;
  challan_no: string;
  destination: string;
  recipient_name: string;
  recipient_phone: string;
  total_items: number;
  total_weight_g: number;
  security_seal_no: string;
  custodian: string;
  dispatched_at: string;
  return_due_date: string;
  approval_value: number;
  status: 'DISPATCHED' | 'PARTIALLY_SOLD' | 'FULLY_RETURNED';
  notes: string;
}

const INITIAL_CHALLANS: DeliveryChallan[] = [
  {
    id: 'ff837162-8192-4bb7-b892-230912c98aef',
    challan_no: 'DC-2026-0081',
    destination: 'VIP Customer Home Trial',
    recipient_name: 'Smt. Shailaja Reddy (Banjara Hills)',
    recipient_phone: '+91 98490 88120',
    total_items: 4,
    total_weight_g: 62.400,
    security_seal_no: 'SLJ-SEAL-8910',
    custodian: 'M. Sridhar (Senior Sales Exec)',
    dispatched_at: '2026-10-31 10:30 AM',
    return_due_date: '2026-10-31 18:00',
    approval_value: 520000.00,
    status: 'DISPATCHED',
    notes: 'Emerald Diamond Choker, Polki Jhumkas, Antique Kada pair',
  },
  {
    id: 'ff837162-8192-4bb7-b892-230912c98af0',
    challan_no: 'DC-2026-0080',
    destination: 'Jewellery Exhibition Stall',
    recipient_name: 'Novotel HICC Expo Pavilion Stall #14',
    recipient_phone: '+91 94411 22901',
    total_items: 18,
    total_weight_g: 215.800,
    security_seal_no: 'SLJ-SEAL-8909',
    custodian: 'R. K. Naidu (Store Manager)',
    dispatched_at: '2026-10-30 08:00 AM',
    return_due_date: '2026-11-02 20:00',
    approval_value: 1840000.00,
    status: 'DISPATCHED',
    notes: 'Bridal necklace sets & temple antique showcase showcase',
  },
  {
    id: 'ff837162-8192-4bb7-b892-230912c98af1',
    challan_no: 'DC-2026-0079',
    destination: 'Celebrity Photoshoot Approval',
    recipient_name: 'Studio Lotus / Film Nagar',
    recipient_phone: '+91 97000 44192',
    total_items: 6,
    total_weight_g: 58.200,
    security_seal_no: 'SLJ-SEAL-8908',
    custodian: 'Deepak Varma',
    dispatched_at: '2026-10-29 11:00 AM',
    return_due_date: '2026-10-30 14:00',
    approval_value: 485000.00,
    status: 'PARTIALLY_SOLD',
    notes: '1 Solitaire Ring purchased on bill POS-2026-1039, 5 items returned',
  },
  {
    id: 'ff837162-8192-4bb7-b892-230912c98af2',
    challan_no: 'DC-2026-0078',
    destination: 'Branch Consignment',
    recipient_name: 'Madhapur Express Store',
    recipient_phone: '+91 98450 33819',
    total_items: 10,
    total_weight_g: 76.100,
    security_seal_no: 'SLJ-SEAL-8907',
    custodian: 'Armored Carrier BVC',
    dispatched_at: '2026-10-28 09:30 AM',
    return_due_date: '2026-10-29 18:00',
    approval_value: 635000.00,
    status: 'FULLY_RETURNED',
    notes: 'Reconciliation verified with Zero weight discrepancy',
  },
];

export function SalesDeliveryChallansView() {
  const [challans, setChallans] = useState<DeliveryChallan[]>(INITIAL_CHALLANS);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<DeliveryChallan | null>(null);
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);

  // Form State
  const [destination, setDestination] = useState('VIP Customer Home Trial');
  const [recipient, setRecipient] = useState('');
  const [phone, setPhone] = useState('');
  const [custodian, setCustodian] = useState('M. Sridhar (Senior Sales Exec)');
  const [itemsCount, setItemsCount] = useState('4');
  const [totalWeight, setTotalWeight] = useState('48.500');
  const [sealNo, setSealNo] = useState('SLJ-SEAL-8910');
  const [dueDate, setDueDate] = useState('2026-11-01 18:00');
  const [approvalVal, setApprovalVal] = useState('420000');
  const [notes, setNotes] = useState('');

  const handleCreateChallan = (e: React.FormEvent) => {
    e.preventDefault();
    const newChallan: DeliveryChallan = {
      id: `dc-${challans.length + 1}-${recipient.slice(0, 3)}`,
      challan_no: `DC-2026-00${82 + challans.length}`,
      destination,
      recipient_name: recipient,
      recipient_phone: phone,
      total_items: parseInt(itemsCount) || 1,
      total_weight_g: parseFloat(totalWeight) || 0,
      security_seal_no: sealNo,
      custodian,
      dispatched_at: '2026-10-31 12:00 PM',
      return_due_date: dueDate,
      approval_value: parseFloat(approvalVal) || 0,
      status: 'DISPATCHED',
      notes,
    };

    setChallans([newChallan, ...challans]);
    setIsAddModalOpen(false);
    setRecipient('');
    setPhone('');
    setNotes('');
  };

  const handleReconcileSubmit = (status: 'FULLY_RETURNED' | 'PARTIALLY_SOLD') => {
    if (!selectedChallan) return;
    setChallans(
      challans.map((c) => (c.id === selectedChallan.id ? { ...c, status } : c))
    );
    setIsReconcileModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="sales_delivery_challans" />
      <ActionToolbar
        filterPlaceholder="Filter by challan #, destination, custodian..."
        insertLabel="Create Delivery Challan"
        onInsertClick={() => setIsAddModalOpen(true)}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Active Challans</span>
                <Truck className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">6 Challans</div>
              <div className="text-[11px] text-amber-700 mt-1 font-mono">
                Outward on approval
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Ornaments in Transit</span>
                <Scale className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">412.500 g</div>
              <div className="text-[11px] text-blue-700 mt-1 font-mono">
                38 tagged jewellery pcs
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Value on Approval</span>
                <BadgeIndianRupee className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-xl font-medium text-purple-700">₹ 34.80 Lakhs</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Fully insured in-transit
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Reconciled Today</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700">2 Challans</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                100% Items accounted for
              </div>
            </div>
          </div>
        </div>

        {/* Supabase-style Table */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">delivery_challans</span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">Showing {challans.length} outward approval records</span>
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
                        <span className="text-neutral-800">challan_no</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">destination & recipient</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">items</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">total_weight_g</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">approval_val</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">security_seal</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">custodian</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">due_date</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">status</span>
                      </th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {challans.map((row) => (
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
                              setSelectedChallan(row);
                              setIsReconcileModalOpen(true);
                            }}
                            className="font-medium text-emerald-700 hover:underline cursor-pointer"
                          >
                            {row.challan_no}
                          </span>
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-medium text-neutral-800">
                          <div>{row.destination}</div>
                          <div className="text-[10px] text-neutral-500 font-normal">{row.recipient_name}</div>
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-center text-neutral-700">
                          {row.total_items} pcs
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-right text-neutral-800 font-medium">
                          {row.total_weight_g.toFixed(3)} g
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-right text-neutral-700">
                          ₹ {row.approval_value.toLocaleString('en-IN')}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-[10px] text-neutral-600">
                          {row.security_seal_no}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700 text-[11px]">
                          {row.custodian}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-[11px] text-neutral-600">
                          {row.return_due_date}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                              row.status === 'FULLY_RETURNED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : row.status === 'PARTIALLY_SOLD'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <button
                            onClick={() => {
                              setSelectedChallan(row);
                              setIsReconcileModalOpen(true);
                            }}
                            className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-medium border border-neutral-300 transition-colors cursor-pointer"
                          >
                            Reconcile
                          </button>
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.delivery_challans (
                  <br />
                  <span className="pl-6 text-blue-300">id</span> <span className="text-amber-300">uuid</span> <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">challan_no</span> <span className="text-amber-300">varchar(32)</span> <span className="text-neutral-400">UNIQUE NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">destination</span> <span className="text-amber-300">varchar(255)</span> <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">total_items</span> <span className="text-amber-300">integer</span> <span className="text-neutral-400">NOT NULL CHECK (total_items &gt; 0),</span>
                  <br />
                  <span className="pl-6 text-blue-300">total_weight_g</span> <span className="text-amber-300">numeric(10,3)</span> <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">status</span> <span className="text-amber-300">varchar(32)</span> <span className="text-neutral-400">DEFAULT &apos;DISPATCHED&apos;</span>
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Challan Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full border border-[#e2e8f0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">
                  Create Outward Delivery Challan
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateChallan} className="p-5 space-y-3.5">
              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">
                  Challan Destination / Purpose
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="VIP Customer Home Trial">VIP Customer Home Trial</option>
                  <option value="Jewellery Exhibition Stall">Jewellery Exhibition Stall</option>
                  <option value="Celebrity Photoshoot Approval">Celebrity Photoshoot Approval</option>
                  <option value="Branch Consignment">Branch Consignment Transfer</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Recipient Name / Client
                  </label>
                  <input
                    type="text"
                    required
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="e.g. Smt. Shailaja Reddy"
                    className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Phone (+91)
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98490 88120"
                    className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Items Count
                  </label>
                  <input
                    type="number"
                    value={itemsCount}
                    onChange={(e) => setItemsCount(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Total Weight (g)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={totalWeight}
                    onChange={(e) => setTotalWeight(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Approval Value (₹)
                  </label>
                  <input
                    type="number"
                    value={approvalVal}
                    onChange={(e) => setApprovalVal(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Security Seal #
                  </label>
                  <input
                    type="text"
                    value={sealNo}
                    onChange={(e) => setSealNo(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Assigned Store Custodian
                  </label>
                  <input
                    type="text"
                    value={custodian}
                    onChange={(e) => setCustodian(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Return Due Date & Time
                  </label>
                  <input
                    type="text"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">
                  Ornaments Tag Description / Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 22K Emerald Choker, Pair of Antique Kadas, Ruby Jhumkas"
                  className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#e5e7eb] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                >
                  Issue Challan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reconcile Challan Modal */}
      {isReconcileModalOpen && selectedChallan && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-[#e2e8f0] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">
                  Reconcile Challan {selectedChallan.challan_no}
                </h3>
              </div>
              <button
                onClick={() => setIsReconcileModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 font-mono text-xs space-y-3">
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Destination:</span>
                  <span className="font-medium text-neutral-800">{selectedChallan.destination}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-neutral-500">Total Dispatched:</span>
                  <span>{selectedChallan.total_items} items ({selectedChallan.total_weight_g.toFixed(3)}g)</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-neutral-500">Approval Value:</span>
                  <span>₹ {selectedChallan.approval_value.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="text-[11px] text-neutral-600">
                Please confirm the reconciliation outcome after weighing and inspecting items returned to showroom:
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => handleReconcileSubmit('FULLY_RETURNED')}
                  className="px-3 py-2 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer text-center"
                >
                  All Items Returned (100% Restock)
                </button>
                <button
                  onClick={() => handleReconcileSubmit('PARTIALLY_SOLD')}
                  className="px-3 py-2 rounded-md text-xs font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-2xs cursor-pointer text-center"
                >
                  Partially Sold (Convert remainder to POS)
                </button>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#e5e7eb] bg-[#f8fafc] flex justify-end">
              <button
                onClick={() => setIsReconcileModalOpen(false)}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
