'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  RotateCcw,
  Receipt,
  Scale,
  BadgeIndianRupee,
  Flame,
  X,
  Printer,
} from 'lucide-react';

interface SalesReturnRecord {
  id: string;
  credit_note_no: string;
  original_inv_no: string;
  customer_name: string;
  customer_phone: string;
  return_date: string;
  return_weight_g: number;
  original_weight_g: number;
  weight_discrepancy_g: number;
  deduction_amount: number;
  refund_amount: number;
  return_reason: string;
  settlement_mode: 'STORE_CREDIT_VOUCHER' | 'BANK_REFUND' | 'EXCHANGE_OFFSET';
  disposition: 'RESTOCK_TO_VAULT' | 'SENT_TO_MELTING';
  status: 'COMPLETED' | 'PENDING_APPROVAL';
}

const INITIAL_RETURNS: SalesReturnRecord[] = [
  {
    id: '90c4217f-e221-4d1a-bf47-79bcae01a892',
    credit_note_no: 'CRN-2026-014',
    original_inv_no: 'POS-2026-0982',
    customer_name: 'Sneha Patel',
    customer_phone: '+91 98221 44019',
    return_date: '2026-10-31',
    return_weight_g: 8.420,
    original_weight_g: 8.420,
    weight_discrepancy_g: 0.000,
    deduction_amount: 0.00,
    refund_amount: 66097.00,
    return_reason: 'Size exchange requested',
    settlement_mode: 'STORE_CREDIT_VOUCHER',
    disposition: 'RESTOCK_TO_VAULT',
    status: 'COMPLETED',
  },
  {
    id: '90c4217f-e221-4d1a-bf47-79bcae01a893',
    credit_note_no: 'CRN-2026-013',
    original_inv_no: 'POS-2026-0965',
    customer_name: 'K. Venkateswarlu',
    customer_phone: '+91 94410 99823',
    return_date: '2026-10-30',
    return_weight_g: 15.200,
    original_weight_g: 15.400,
    weight_discrepancy_g: -0.200,
    deduction_amount: 3200.00,
    refund_amount: 116120.00,
    return_reason: 'Customer liquidity cash-in',
    settlement_mode: 'BANK_REFUND',
    disposition: 'SENT_TO_MELTING',
    status: 'COMPLETED',
  },
  {
    id: '90c4217f-e221-4d1a-bf47-79bcae01a894',
    credit_note_no: 'CRN-2026-012',
    original_inv_no: 'POS-2026-0941',
    customer_name: 'Deepika Iyer',
    customer_phone: '+91 97118 66201',
    return_date: '2026-10-29',
    return_weight_g: 19.180,
    original_weight_g: 19.180,
    weight_discrepancy_g: 0.000,
    deduction_amount: 0.00,
    refund_amount: 159783.00,
    return_reason: 'Design preference change',
    settlement_mode: 'EXCHANGE_OFFSET',
    disposition: 'RESTOCK_TO_VAULT',
    status: 'COMPLETED',
  },
];

export function SalesReturnsView() {
  const [returns, setReturns] = useState<SalesReturnRecord[]>(INITIAL_RETURNS);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<SalesReturnRecord | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  // Form State
  const [invLookup, setInvLookup] = useState('POS-2026-0982');
  const [customerName, setCustomerName] = useState('Sneha Patel');
  const [customerPhone, setCustomerPhone] = useState('+91 98221 44019');
  const [origWeight, setOrigWeight] = useState('8.420');
  const [returnWeight, setReturnWeight] = useState('8.420');
  const [returnReason, setReturnReason] = useState('Size exchange requested');
  const [deductions, setDeductions] = useState('0');
  const [refundMode, setRefundMode] = useState<'STORE_CREDIT_VOUCHER' | 'BANK_REFUND' | 'EXCHANGE_OFFSET'>('STORE_CREDIT_VOUCHER');
  const [disposition, setDisposition] = useState<'RESTOCK_TO_VAULT' | 'SENT_TO_MELTING'>('RESTOCK_TO_VAULT');

  const handleLookup = () => {
    if (invLookup === 'POS-2026-0982') {
      setCustomerName('Sneha Patel');
      setCustomerPhone('+91 98221 44019');
      setOrigWeight('8.420');
      setReturnWeight('8.420');
    } else {
      setCustomerName('Meera Nambiar');
      setCustomerPhone('+91 98450 11223');
      setOrigWeight('12.500');
      setReturnWeight('12.500');
    }
  };

  const handleCreateReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const retWt = parseFloat(returnWeight) || 0;
    const orgWt = parseFloat(origWeight) || retWt;
    const ded = parseFloat(deductions) || 0;
    const netRefund = Math.max(0, retWt * 7850 - ded);

    const newRecord: SalesReturnRecord = {
      id: `ret-${returns.length + 1}-${Date.now().toString().slice(-4)}`,
      credit_note_no: `CRN-2026-${15 + returns.length}`,
      original_inv_no: invLookup,
      customer_name: customerName,
      customer_phone: customerPhone,
      return_date: '2026-10-31',
      return_weight_g: retWt,
      original_weight_g: orgWt,
      weight_discrepancy_g: retWt - orgWt,
      deduction_amount: ded,
      refund_amount: netRefund,
      return_reason: returnReason,
      settlement_mode: refundMode,
      disposition,
      status: 'COMPLETED',
    };

    setReturns([newRecord, ...returns]);
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="sales_returns" />
      <ActionToolbar
        filterPlaceholder="Filter by credit note #, original invoice, customer..."
        insertLabel="New Return / Credit Note"
        onInsertClick={() => setIsAddModalOpen(true)}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Returns This Month</span>
                <BadgeIndianRupee className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">₹ 3,42,000</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                1.2% return rate (Well within limits)
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Credit Notes Issued</span>
                <Receipt className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">14 Notes</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                100% Verified & Approved
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Weight Restocked</span>
                <Scale className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">42.800 g</div>
              <div className="text-[11px] text-blue-700 mt-1 font-mono">
                Re-tagged & restored to vault
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Sent to Melting</span>
                <Flame className="w-3.5 h-3.5 text-orange-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">12.400 g</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Sent to workshop refinery pot
              </div>
            </div>
          </div>
        </div>

        {/* Supabase-style Table */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">sales_returns</span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">Showing {returns.length} credit notes</span>
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
                        <span className="text-neutral-800">credit_note_no</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">original_inv_no</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">customer_name</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">return_weight_g</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">deduction_amount</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">refund_amount</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">return_reason</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">settlement</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">status</span>
                      </th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {returns.map((row) => (
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
                              setSelectedReturn(row);
                              setIsVoucherModalOpen(true);
                            }}
                            className="font-medium text-emerald-700 hover:underline cursor-pointer"
                          >
                            {row.credit_note_no}
                          </span>
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-[11px] text-neutral-600">
                          {row.original_inv_no}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-medium text-neutral-800">
                          <div>{row.customer_name}</div>
                          <div className="text-[10px] text-neutral-400 font-normal">{row.customer_phone}</div>
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-right text-neutral-800">
                          {row.return_weight_g.toFixed(3)} g
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-right text-red-600">
                          {row.deduction_amount > 0 ? `- ₹ ${row.deduction_amount.toLocaleString('en-IN')}` : '₹ 0.00'}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-right font-medium text-neutral-900">
                          ₹ {row.refund_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700">
                          {row.return_reason}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-100 text-neutral-700 border border-neutral-200">
                            {row.settlement_mode.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {row.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <button
                            onClick={() => {
                              setSelectedReturn(row);
                              setIsVoucherModalOpen(true);
                            }}
                            className="p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Print Credit Note Voucher"
                          >
                            <Printer className="w-3.5 h-3.5" />
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.sales_returns (
                  <br />
                  <span className="pl-6 text-blue-300">id</span> <span className="text-amber-300">uuid</span> <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">credit_note_no</span> <span className="text-amber-300">varchar(32)</span> <span className="text-neutral-400">UNIQUE NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">original_inv_no</span> <span className="text-amber-300">varchar(32)</span> <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">return_weight_g</span> <span className="text-amber-300">numeric(10,3)</span> <span className="text-neutral-400">NOT NULL CHECK (return_weight_g &gt; 0),</span>
                  <br />
                  <span className="pl-6 text-blue-300">refund_amount</span> <span className="text-amber-300">numeric(10,2)</span> <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">return_reason</span> <span className="text-amber-300">varchar(255)</span> <span className="text-neutral-400">NOT NULL</span>
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Return Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full border border-[#e2e8f0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">
                  New Sales Return & Credit Note
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReturn} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">
                  Original Invoice Lookup
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={invLookup}
                    onChange={(e) => setInvLookup(e.target.value)}
                    placeholder="e.g. POS-2026-0982"
                    className="flex-1 px-3 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleLookup}
                    className="px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300 transition-colors cursor-pointer"
                  >
                    Lookup
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Phone (+91)
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Original Gross Weight (g)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={origWeight}
                    onChange={(e) => setOrigWeight(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-[#f8fafc]"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Returned Scale Weight (g)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={returnWeight}
                    onChange={(e) => setReturnWeight(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Wastage/Stone Deductions (₹)
                  </label>
                  <input
                    type="number"
                    value={deductions}
                    onChange={(e) => setDeductions(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Return Reason
                  </label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Size exchange requested">Size exchange requested</option>
                    <option value="Design preference change">Design preference change</option>
                    <option value="Customer liquidity cash-in">Customer liquidity cash-in</option>
                    <option value="Minor manufacturing defect">Minor manufacturing defect</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Settlement Mode
                  </label>
                  <select
                    value={refundMode}
                    onChange={(e) => setRefundMode(e.target.value as 'STORE_CREDIT_VOUCHER' | 'BANK_REFUND' | 'EXCHANGE_OFFSET')}
                    className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="STORE_CREDIT_VOUCHER">Store Credit Note Voucher</option>
                    <option value="BANK_REFUND">Instant Bank / UPI Refund</option>
                    <option value="EXCHANGE_OFFSET">Direct POS Exchange Offset</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Ornament Disposition
                  </label>
                  <select
                    value={disposition}
                    onChange={(e) => setDisposition(e.target.value as 'RESTOCK_TO_VAULT' | 'SENT_TO_MELTING')}
                    className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="RESTOCK_TO_VAULT">Restock into Vault (Re-tag)</option>
                    <option value="SENT_TO_MELTING">Send to Melting Refinery</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#e5e7eb] flex justify-end gap-2">
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
                  Issue Credit Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credit Note Voucher Print Preview Modal */}
      {isVoucherModalOpen && selectedReturn && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-[#e2e8f0] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">
                  Credit Note Voucher: {selectedReturn.credit_note_no}
                </h3>
              </div>
              <button
                onClick={() => setIsVoucherModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 font-mono text-xs text-neutral-800 space-y-4">
              <div className="text-center pb-2 border-b border-dashed border-neutral-300">
                <div className="font-medium text-sm text-neutral-900">
                  SRI LAKSHMI JEWELLERS & DIAMONDS
                </div>
                <div className="text-[11px] text-neutral-500">Official Credit Note Voucher</div>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span>Credit Note #:</span>
                  <span className="font-medium">{selectedReturn.credit_note_no}</span>
                </div>
                <div className="flex justify-between">
                  <span>Original Bill #:</span>
                  <span>{selectedReturn.original_inv_no}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{selectedReturn.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Returned Weight:</span>
                  <span>{selectedReturn.return_weight_g.toFixed(3)} g</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200 text-sm font-medium text-emerald-800">
                  <span>Credit Balance Value:</span>
                  <span>₹ {selectedReturn.refund_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded text-[10px] text-neutral-500 text-center">
                Valid for 180 days across all showroom counters upon presentation.
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#e5e7eb] bg-[#f8fafc] flex justify-end gap-2">
              <button
                onClick={() => setIsVoucherModalOpen(false)}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
