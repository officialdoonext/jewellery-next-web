'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Building2,
  Calendar,
  Clock,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Percent,
  CheckCircle2,
  Copy,
  Check,
  X,
  CreditCard,
  Send,
  Flame,
  Hammer,
  BadgeAlert,
} from 'lucide-react';

interface PayableRecord {
  id: string;
  vendor_name: string;
  category: 'Bullion' | 'Wholesale' | 'Karigar';
  bill_ref: string;
  amount_payable: number;
  settlement_due_date: string;
  early_discount: string;
  status: 'DUE_SOON' | 'SCHEDULED_RTGS' | 'OVERDUE';
}

const INITIAL_PAYABLES: PayableRecord[] = [
  {
    id: '22334455-d4e5-f6a1-b2c3-556677889900',
    vendor_name: 'Shree Bullion Refinery & Assay Ltd',
    category: 'Bullion',
    bill_ref: 'PUR-26-042',
    amount_payable: 3090000.0,
    settlement_due_date: '2026-11-05',
    early_discount: '0.25% if paid by Nov 02',
    status: 'DUE_SOON',
  },
  {
    id: '22334455-d4e5-f6a1-b2c3-556677889901',
    vendor_name: 'MMTC-PAMP India Bullion Vault',
    category: 'Bullion',
    bill_ref: 'PUR-26-040',
    amount_payable: 2110000.0,
    settlement_due_date: '2026-11-07',
    early_discount: 'Net 10 Days',
    status: 'SCHEDULED_RTGS',
  },
  {
    id: '22334455-d4e5-f6a1-b2c3-556677889902',
    vendor_name: 'Surat Diamond Cutting & Polishers',
    category: 'Wholesale',
    bill_ref: 'PUR-26-038',
    amount_payable: 1220000.0,
    settlement_due_date: '2026-11-12',
    early_discount: '1.0% Cash Discount',
    status: 'DUE_SOON',
  },
  {
    id: '22334455-d4e5-f6a1-b2c3-556677889903',
    vendor_name: 'Master Goldsmith Balaram Artisan Guild',
    category: 'Karigar',
    bill_ref: 'JW-2026-119',
    amount_payable: 280000.0,
    settlement_due_date: '2026-11-03',
    early_discount: 'Labour Settlement',
    status: 'SCHEDULED_RTGS',
  },
  {
    id: '22334455-d4e5-f6a1-b2c3-556677889904',
    vendor_name: 'Kolkata Filigree Filaments & Co',
    category: 'Karigar',
    bill_ref: 'JW-2026-114',
    amount_payable: 140000.0,
    settlement_due_date: '2026-11-04',
    early_discount: 'Wastage (VA) Adjustment',
    status: 'DUE_SOON',
  },
];

export function FinancePayablesView() {
  const [payables, setPayables] = useState<PayableRecord[]>(INITIAL_PAYABLES);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals & drawers
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Vendor Payout Form State
  const [vendorName, setVendorName] = useState('');
  const [category, setCategory] = useState<'Bullion' | 'Wholesale' | 'Karigar'>('Bullion');
  const [billRef, setBillRef] = useState('');
  const [amountPayable, setAmountPayable] = useState<number>(0);
  const [dueDate, setDueDate] = useState('2026-11-10');
  const [paymentMode, setPaymentMode] = useState('RTGS Bank Wire');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSchedulePayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountPayable <= 0 || !vendorName) return;

    const newRecord: PayableRecord = {
      id: crypto.randomUUID(),
      vendor_name: vendorName,
      category,
      bill_ref: billRef || `PUR-26-${Math.floor(100 + Math.random() * 900)}`,
      amount_payable: Number(amountPayable),
      settlement_due_date: dueDate,
      early_discount: 'Scheduled Wire Payout',
      status: 'SCHEDULED_RTGS',
    };

    setPayables([newRecord, ...payables]);
    setIsPayoutModalOpen(false);
    setVendorName('');
    setBillRef('');
    setAmountPayable(0);
    showToast(`Scheduled RTGS payout of ₹ ${Number(amountPayable).toLocaleString('en-IN')} to ${vendorName}`);
  };

  const toggleStatus = (id: string) => {
    setPayables((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: p.status === 'SCHEDULED_RTGS' ? 'DUE_SOON' : 'SCHEDULED_RTGS',
            }
          : p
      )
    );
    showToast('Updated payout schedule status');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="accounts_payable" />
      <ActionToolbar
        filterPlaceholder="Filter by vendor name, bullion ref, karigar name, bill..."
        insertLabel="Schedule Vendor Payout"
        onInsertClick={() => setIsPayoutModalOpen(true)}
      />

      {toastMessage && (
        <div className="fixed top-12 right-6 z-50 bg-neutral-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 border border-neutral-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Payables Due</span>
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">₹ 68,40,000</div>
              <div className="text-[11px] text-neutral-500 mt-1">5 Verified suppliers</div>
            </div>

            <div className="p-3.5 rounded-lg bg-amber-50/50 border border-amber-200 hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-amber-800 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Bullion Commitments</span>
                <Flame className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-amber-900 font-mono">₹ 52,00,000</div>
              <div className="text-[11px] text-amber-700 mt-1">Refinery gold bar purchases</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Artisan Labour Bills</span>
                <Hammer className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">₹ 4,20,000</div>
              <div className="text-[11px] text-neutral-500 mt-1">Karigar job-work accounts</div>
            </div>

            <div className="p-3.5 rounded-lg bg-red-50/50 border border-red-200 hover:border-red-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-red-800 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Dues in Next 7 Days</span>
                <Clock className="w-3.5 h-3.5 text-red-600" />
              </div>
              <div className="text-xl font-medium text-red-900 font-mono">₹ 38,00,000</div>
              <div className="text-[11px] text-red-700 mt-1">Cashflow requirement</div>
            </div>
          </div>
        </div>

        {/* Cashflow Commitment Forecast Card */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium text-neutral-800 uppercase tracking-wider">
                  Cashflow Commitment Forecast (Next 15 Days Outflow Schedule)
                </span>
              </div>
              <span className="text-xs text-neutral-500 font-mono">
                ICICI OD & HDFC Liquid Balance: ₹ 3.11 Cr Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono text-xs">
              <div className="p-3 bg-white rounded border border-neutral-200">
                <div className="text-[10px] text-neutral-500 uppercase">Nov 03 (Mon)</div>
                <div className="text-sm font-medium text-neutral-900 mt-1">₹ 2,80,000</div>
                <div className="text-[10px] text-neutral-600 font-sans mt-0.5 truncate">
                  Balaram Artisan Guild
                </div>
              </div>

              <div className="p-3 bg-white rounded border border-neutral-200">
                <div className="text-[10px] text-neutral-500 uppercase">Nov 04 (Tue)</div>
                <div className="text-sm font-medium text-neutral-900 mt-1">₹ 1,40,000</div>
                <div className="text-[10px] text-neutral-600 font-sans mt-0.5 truncate">
                  Kolkata Filigree Filaments
                </div>
              </div>

              <div className="p-3 bg-amber-50/50 rounded border border-amber-200">
                <div className="text-[10px] text-amber-800 uppercase font-sans">Nov 05 (Wed) • Bullion Cutoff</div>
                <div className="text-sm font-medium text-amber-900 mt-1">₹ 30,90,000</div>
                <div className="text-[10px] text-amber-700 font-sans mt-0.5 truncate">
                  Shree Bullion Refinery
                </div>
              </div>

              <div className="p-3 bg-amber-50/50 rounded border border-amber-200">
                <div className="text-[10px] text-amber-800 uppercase font-sans">Nov 07 (Fri) • Refinery Wire</div>
                <div className="text-sm font-medium text-amber-900 mt-1">₹ 21,10,000</div>
                <div className="text-[10px] text-amber-700 font-sans mt-0.5 truncate">
                  MMTC-PAMP India
                </div>
              </div>

              <div className="p-3 bg-white rounded border border-neutral-200">
                <div className="text-[10px] text-neutral-500 uppercase">Nov 12 (Wed)</div>
                <div className="text-sm font-medium text-neutral-900 mt-1">₹ 12,20,000</div>
                <div className="text-[10px] text-neutral-600 font-sans mt-0.5 truncate">
                  Surat Diamond Cutting
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Supabase-style Table */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  public.accounts_payable
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Showing {payables.length} upcoming supplier liabilities
                </span>
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
                        <span className="text-neutral-800">vendor_name</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">category</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">bill_ref</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">amount_payable (₹)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">settlement_due_date</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">early_discount_terms</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">status</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">actions</span>
                      </th>
                      <th className="w-16 px-3 py-2 text-center font-medium">uuid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb] text-neutral-800 font-mono">
                    {payables.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap font-sans text-neutral-900 font-medium">
                          {row.vendor_name}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap">
                          {row.category === 'Bullion' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-amber-50 text-amber-700 border border-amber-200">
                              <Flame className="w-3 h-3 text-amber-600" /> Bullion
                            </span>
                          )}
                          {row.category === 'Wholesale' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-blue-50 text-blue-700 border border-blue-200">
                              Wholesale
                            </span>
                          )}
                          {row.category === 'Karigar' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-purple-50 text-purple-700 border border-purple-200">
                              <Hammer className="w-3 h-3 text-purple-600" /> Karigar
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700">
                          {row.bill_ref}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-right font-medium text-neutral-900">
                          ₹ {row.amount_payable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-600">
                          {row.settlement_due_date}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap font-sans text-neutral-600">
                          {row.early_discount}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-center">
                          {row.status === 'SCHEDULED_RTGS' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> SCHEDULED_RTGS
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-500" /> DUE_SOON
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-center">
                          <button
                            onClick={() => toggleStatus(row.id)}
                            className="px-2 py-1 text-[11px] rounded border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-sans cursor-pointer transition-colors"
                          >
                            {row.status === 'SCHEDULED_RTGS' ? 'Edit Wire' : 'Schedule Wire'}
                          </button>
                        </td>
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          <button
                            onClick={() => copyToClipboard(row.id, row.id)}
                            className="p-1 text-neutral-400 hover:text-neutral-700 transition-colors"
                            title="Copy UUID"
                          >
                            {copiedId === row.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'definition' && (
              <div className="p-4 bg-[#0a0a0a] text-neutral-200 font-mono text-xs overflow-x-auto">
                <div className="leading-relaxed">
                  <span className="text-emerald-400">CREATE TABLE</span> public.accounts_payable (
                  <br />
                  &nbsp;&nbsp;id <span className="text-purple-400">UUID</span>{' '}
                  <span className="text-neutral-400">PRIMARY KEY DEFAULT gen_random_uuid()</span>,
                  <br />
                  &nbsp;&nbsp;vendor_name <span className="text-purple-400">VARCHAR(150)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;category <span className="text-purple-400">VARCHAR(20)</span>{' '}
                  <span className="text-neutral-400">CHECK (category IN (&apos;Bullion&apos;, &apos;Wholesale&apos;, &apos;Karigar&apos;))</span>,
                  <br />
                  &nbsp;&nbsp;bill_ref <span className="text-purple-400">VARCHAR(50)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;amount_payable <span className="text-purple-400">NUMERIC(12,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;settlement_due_date <span className="text-purple-400">DATE</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;early_discount <span className="text-purple-400">VARCHAR(100)</span>,
                  <br />
                  &nbsp;&nbsp;status <span className="text-purple-400">VARCHAR(20)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;DUE_SOON&apos;</span>
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawer: Schedule Vendor Payout */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs transition-all">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-medium text-neutral-900">
                    Schedule Supplier Payout / Wire
                  </h3>
                </div>
                <button
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="p-1 hover:bg-neutral-200/60 rounded text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSchedulePayout} className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Vendor / Merchant Name
                  </label>
                  <input
                    type="text"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="e.g. Shree Bullion Refinery or Gujarat Artisans"
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Supplier Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setCategory('Bullion')}
                      className={`py-1.5 px-2 rounded text-xs border transition-colors flex items-center justify-center gap-1 ${
                        category === 'Bullion'
                          ? 'bg-amber-50 border-amber-300 text-amber-800 font-medium'
                          : 'bg-white border-[#e2e8f0] text-neutral-600'
                      }`}
                    >
                      Bullion
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategory('Wholesale')}
                      className={`py-1.5 px-2 rounded text-xs border transition-colors flex items-center justify-center gap-1 ${
                        category === 'Wholesale'
                          ? 'bg-blue-50 border-blue-300 text-blue-800 font-medium'
                          : 'bg-white border-[#e2e8f0] text-neutral-600'
                      }`}
                    >
                      Wholesale
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategory('Karigar')}
                      className={`py-1.5 px-2 rounded text-xs border transition-colors flex items-center justify-center gap-1 ${
                        category === 'Karigar'
                          ? 'bg-purple-50 border-purple-300 text-purple-800 font-medium'
                          : 'bg-white border-[#e2e8f0] text-neutral-600'
                      }`}
                    >
                      Karigar
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Bill / Inward Ref #
                  </label>
                  <input
                    type="text"
                    value={billRef}
                    onChange={(e) => setBillRef(e.target.value)}
                    placeholder="e.g. PUR-26-045 or JW-120"
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Amount Payable (₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={amountPayable || ''}
                    onChange={(e) => setAmountPayable(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Settlement Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Settlement Method
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  >
                    <option value="RTGS Bank Wire">RTGS Bank Wire (HDFC Jewellery Current)</option>
                    <option value="ICICI Bullion Overdraft Facility">ICICI Bullion Overdraft Facility</option>
                    <option value="Metal Account Transfer (Fine Gold 999)">Metal Account Transfer (Fine Gold 999)</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPayoutModalOpen(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Schedule Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
