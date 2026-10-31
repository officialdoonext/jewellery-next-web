'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Receipt,
  FileCheck,
  Zap,
  Building,
  Shield,
  Percent,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  X,
  Plus,
  Upload,
  ArrowUpRight,
  Sparkles,
  FileText,
  BadgeAlert,
} from 'lucide-react';

interface ShowroomExpense {
  id: string;
  voucher_no: string;
  expense_head: string;
  paid_to: string;
  vendor_gstin: string;
  base_amount: number;
  gst_paid: number;
  total_amount: number;
  gst_itc_eligible: boolean;
  payment_mode: 'Bank Transfer' | 'Petty Cash';
  paid_date: string;
}

const INITIAL_EXPENSES: ShowroomExpense[] = [
  {
    id: '00112233-b2c3-d4e5-f6a1-334455667788',
    voucher_no: 'EXP-2026-081',
    expense_head: 'Showroom Security Agency',
    paid_to: 'SIS India Armed Security Ltd',
    vendor_gstin: '36AABCS1429B1Z0',
    base_amount: 156779.66,
    gst_paid: 28220.34,
    total_amount: 185000.0,
    gst_itc_eligible: true,
    payment_mode: 'Bank Transfer',
    paid_date: '2026-10-28',
  },
  {
    id: '00112233-b2c3-d4e5-f6a1-334455667789',
    voucher_no: 'EXP-2026-082',
    expense_head: 'Electricity Bill & High-Tension Power',
    paid_to: 'TSSPDCL Commercial Power Dept',
    vendor_gstin: '36AAACT0291K1Z2',
    base_amount: 62450.0,
    gst_paid: 0.0,
    total_amount: 62450.0,
    gst_itc_eligible: false,
    payment_mode: 'Bank Transfer',
    paid_date: '2026-10-25',
  },
  {
    id: '00112233-b2c3-d4e5-f6a1-334455667790',
    voucher_no: 'EXP-2026-083',
    expense_head: 'Vault Insurance Premium (Jewellers Block Policy)',
    paid_to: 'New India Assurance Co Ltd',
    vendor_gstin: '36AAACN0192L1Z9',
    base_amount: 45000.0,
    gst_paid: 8100.0,
    total_amount: 53100.0,
    gst_itc_eligible: true,
    payment_mode: 'Bank Transfer',
    paid_date: '2026-10-20',
  },
  {
    id: '00112233-b2c3-d4e5-f6a1-334455667791',
    voucher_no: 'EXP-2026-084',
    expense_head: 'Daikin Central Showroom AC Maintenance AMC',
    paid_to: 'CoolAir HVAC Engineering',
    vendor_gstin: '36AALPC4921M1Z5',
    base_amount: 27957.63,
    gst_paid: 5032.37,
    total_amount: 32990.0,
    gst_itc_eligible: true,
    payment_mode: 'Bank Transfer',
    paid_date: '2026-10-18',
  },
  {
    id: '00112233-b2c3-d4e5-f6a1-334455667792',
    voucher_no: 'EXP-2026-085',
    expense_head: 'Staff Welfare / Premium Chai & Mineral Water',
    paid_to: 'Sri Krishna Food Supplies',
    vendor_gstin: 'Unregistered Local Vendor',
    base_amount: 8460.0,
    gst_paid: 0.0,
    total_amount: 8460.0,
    gst_itc_eligible: false,
    payment_mode: 'Petty Cash',
    paid_date: '2026-10-15',
  },
];

export function FinanceExpensesView() {
  const [expenses, setExpenses] = useState<ShowroomExpense[]>(INITIAL_EXPENSES);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals & drawers
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Expense State
  const [expenseHead, setExpenseHead] = useState('Showroom Security Agency');
  const [vendorName, setVendorName] = useState('');
  const [vendorGstin, setVendorGstin] = useState('');
  const [baseAmount, setBaseAmount] = useState<number>(0);
  const [gstRate, setGstRate] = useState<number>(18);
  const [isItcEligible, setIsItcEligible] = useState<boolean>(true);
  const [paymentMode, setPaymentMode] = useState<'Bank Transfer' | 'Petty Cash'>('Bank Transfer');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const calculatedGst = Math.round(((baseAmount * gstRate) / 100) * 100) / 100;
  const totalCalculated = Math.round((Number(baseAmount) + calculatedGst) * 100) / 100;

  const handleRecordExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (baseAmount <= 0 || !vendorName) return;

    const now = new Date().toISOString().substring(0, 10);
    const voucherNo = `EXP-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newRecord: ShowroomExpense = {
      id: crypto.randomUUID(),
      voucher_no: voucherNo,
      expense_head: expenseHead,
      paid_to: vendorName,
      vendor_gstin: vendorGstin || 'Unregistered',
      base_amount: Number(baseAmount),
      gst_paid: calculatedGst,
      total_amount: totalCalculated,
      gst_itc_eligible: isItcEligible,
      payment_mode: paymentMode,
      paid_date: now,
    };

    setExpenses([newRecord, ...expenses]);
    setIsRecordModalOpen(false);
    setVendorName('');
    setVendorGstin('');
    setBaseAmount(0);
    showToast(`Recorded expense voucher ${voucherNo} of ₹ ${totalCalculated.toLocaleString('en-IN')}`);
  };

  const totalExpenseSum = expenses.reduce((acc, curr) => acc + curr.total_amount, 0);
  const totalItcEligible = expenses
    .filter((e) => e.gst_itc_eligible)
    .reduce((acc, curr) => acc + curr.gst_paid, 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="showroom_expenses" />
      <ActionToolbar
        filterPlaceholder="Filter by voucher #, expense head, vendor GSTIN, entity..."
        insertLabel="Record Showroom Expense"
        onInsertClick={() => setIsRecordModalOpen(true)}
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
                <span className="text-[11px] font-medium uppercase tracking-wider">Expenses This Month</span>
                <Receipt className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">₹ 3,42,000</div>
              <div className="text-[11px] text-neutral-500 mt-1">October 2026 Store Ops</div>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-200 hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-emerald-800 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Eligible GST ITC Credit</span>
                <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div className="text-xl font-medium text-emerald-900 font-mono">₹ 61,560</div>
              <div className="text-[11px] text-emerald-700 mt-1">Offset against 3% jewellery GST</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Rent & Security</span>
                <Shield className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">₹ 1,85,000</div>
              <div className="text-[11px] text-neutral-500 mt-1">Armed guards + biometric vault</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Utilities & Maintenance</span>
                <Zap className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">₹ 95,440</div>
              <div className="text-[11px] text-neutral-500 mt-1">HVAC chillers & power tariff</div>
            </div>
          </div>
        </div>

        {/* Supabase-style Table */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  public.showroom_expenses
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Showing {expenses.length} store overhead vouchers
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
                        <span className="text-neutral-800">voucher_no</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">expense_head</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">paid_to / vendor</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">vendor_gstin</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">base_amount (₹)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">gst_paid (₹)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">total_amount (₹)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">gst_itc_status</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">paid_date</span>
                      </th>
                      <th className="w-16 px-3 py-2 text-center font-medium">uuid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb] text-neutral-800 font-mono">
                    {expenses.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700">
                          {row.voucher_no}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap font-sans text-neutral-900">
                          {row.expense_head}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] font-sans text-neutral-900 max-w-xs truncate">
                          {row.paid_to}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-500">
                          {row.vendor_gstin}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-right text-neutral-700">
                          ₹ {row.base_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-right text-amber-700">
                          ₹ {row.gst_paid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-right font-medium text-neutral-900">
                          ₹ {row.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-center">
                          {row.gst_itc_eligible ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ITC CLAIMABLE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-neutral-100 text-neutral-600 border border-neutral-200">
                              NO ITC / EXEMPT
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-600">
                          {row.paid_date}
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.showroom_expenses (
                  <br />
                  &nbsp;&nbsp;id <span className="text-purple-400">UUID</span>{' '}
                  <span className="text-neutral-400">PRIMARY KEY DEFAULT gen_random_uuid()</span>,
                  <br />
                  &nbsp;&nbsp;voucher_no <span className="text-purple-400">VARCHAR(50)</span>{' '}
                  <span className="text-neutral-400">UNIQUE NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;expense_head <span className="text-purple-400">VARCHAR(100)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;paid_to <span className="text-purple-400">VARCHAR(150)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;vendor_gstin <span className="text-purple-400">VARCHAR(20)</span>,
                  <br />
                  &nbsp;&nbsp;base_amount <span className="text-purple-400">NUMERIC(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;gst_paid <span className="text-purple-400">NUMERIC(10,2)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0.00</span>,
                  <br />
                  &nbsp;&nbsp;total_amount <span className="text-purple-400">NUMERIC(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;gst_itc_eligible <span className="text-purple-400">BOOLEAN</span>{' '}
                  <span className="text-neutral-400">DEFAULT TRUE</span>,
                  <br />
                  &nbsp;&nbsp;payment_mode <span className="text-purple-400">VARCHAR(20)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;Bank Transfer&apos;</span>,
                  <br />
                  &nbsp;&nbsp;paid_date <span className="text-purple-400">DATE</span>{' '}
                  <span className="text-neutral-400">DEFAULT CURRENT_DATE</span>
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawer: Record Showroom Expense */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs transition-all">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-medium text-neutral-900">
                    Record Showroom Expense Voucher
                  </h3>
                </div>
                <button
                  onClick={() => setIsRecordModalOpen(false)}
                  className="p-1 hover:bg-neutral-200/60 rounded text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRecordExpense} className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Expense Category Head
                  </label>
                  <select
                    value={expenseHead}
                    onChange={(e) => setExpenseHead(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  >
                    <option value="Showroom Security Agency">Showroom Security Agency</option>
                    <option value="Electricity Bill & High-Tension Power">Electricity Bill & High-Tension Power</option>
                    <option value="Vault Insurance Premium">Vault Insurance Premium (Jewellers Block)</option>
                    <option value="Marketing & Hoardings">Marketing & Hoardings</option>
                    <option value="Staff Welfare / Tea">Staff Welfare / Tea</option>
                    <option value="Housekeeping & Cleaning">Housekeeping & Cleaning</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Vendor / Payee Name
                  </label>
                  <input
                    type="text"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="e.g. SIS Security Ltd or CoolAir HVAC"
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Vendor GSTIN (For ITC GSTR-2B Claim)
                  </label>
                  <input
                    type="text"
                    value={vendorGstin}
                    onChange={(e) => setVendorGstin(e.target.value.toUpperCase())}
                    placeholder="e.g. 36AABCS1429B1Z0"
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Base Amount (₹)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={baseAmount || ''}
                      onChange={(e) => setBaseAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      GST Applicable
                    </label>
                    <select
                      value={gstRate}
                      onChange={(e) => setGstRate(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    >
                      <option value={18}>18% GST (Services)</option>
                      <option value={12}>12% GST (Goods)</option>
                      <option value={0}>0% / Exempt / Non-GST</option>
                    </select>
                  </div>
                </div>

                {baseAmount > 0 && (
                  <div className="p-3 bg-neutral-50 rounded border border-neutral-200 text-xs space-y-1 font-mono">
                    <div className="flex justify-between text-neutral-600">
                      <span>GST Component:</span>
                      <span>₹ {calculatedGst.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-neutral-900 font-medium">
                      <span>Total Invoice Payable:</span>
                      <span>₹ {totalCalculated.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Input Tax Credit (ITC) Eligibility
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsItcEligible(true)}
                      className={`flex-1 py-1.5 px-2 rounded text-xs border transition-colors ${
                        isItcEligible
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-medium'
                          : 'bg-white border-[#e2e8f0] text-neutral-600'
                      }`}
                    >
                      YES - Eligible for ITC
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsItcEligible(false)}
                      className={`flex-1 py-1.5 px-2 rounded text-xs border transition-colors ${
                        !isItcEligible
                          ? 'bg-neutral-100 border-neutral-300 text-neutral-800 font-medium'
                          : 'bg-white border-[#e2e8f0] text-neutral-600'
                      }`}
                    >
                      NO - Blocked / Exempt
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  >
                    <option value="Bank Transfer">Bank Transfer (HDFC Current)</option>
                    <option value="Petty Cash">Counter Petty Cash Drawer</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRecordModalOpen(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Record Expense
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
