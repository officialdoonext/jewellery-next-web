'use client';

import React, { useState, useMemo } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  CreditCard,
  AlertCircle,
  Clock,
  TrendingDown,
  CheckCircle2,
  DollarSign,
  QrCode,
  Send,
  Plus,
  X,
  Search,
  Filter,
  Check,
  Calendar,
  Building2,
  ArrowUpRight,
  ShieldAlert,
  FileText,
  Copy,
} from 'lucide-react';

interface CustomerReceivable {
  id: string;
  customer_name: string;
  phone: string;
  bill_no: string;
  bill_date: string;
  bill_amount: number;
  credit_limit: number;
  paid_amount: number;
  outstanding_amount: number;
  days_overdue: number;
  aging_bucket: 'CURRENT_30' | 'OVERDUE_60' | 'OVERDUE_90' | 'OVERDUE_90_PLUS';
  last_payment_date: string;
  status: 'UNPAID' | 'PARTIAL';
}

const INITIAL_RECEIVABLES: CustomerReceivable[] = [
  {
    id: '77889900-a1b2-c3d4-e5f6-001122334455',
    customer_name: 'Dr. Mohan Krishna',
    phone: '+91 94401 55667',
    bill_no: 'POS-2026-0690',
    bill_date: '2026-10-12',
    bill_amount: 416000.0,
    credit_limit: 300000.0,
    paid_amount: 371000.0,
    outstanding_amount: 45000.0,
    days_overdue: 18,
    aging_bucket: 'CURRENT_30',
    last_payment_date: '2026-10-12',
    status: 'PARTIAL',
  },
  {
    id: '77889900-a1b2-c3d4-e5f6-001122334456',
    customer_name: 'Venkat Raman',
    phone: '+91 97412 89012',
    bill_no: 'POS-2026-0774',
    bill_date: '2026-09-28',
    bill_amount: 161800.0,
    credit_limit: 200000.0,
    paid_amount: 126800.0,
    outstanding_amount: 35000.0,
    days_overdue: 33,
    aging_bucket: 'OVERDUE_60',
    last_payment_date: '2026-09-28',
    status: 'PARTIAL',
  },
  {
    id: '77889900-a1b2-c3d4-e5f6-001122334457',
    customer_name: 'Ananya Reddy',
    phone: '+91 91008 34567',
    bill_no: 'POS-2026-0819',
    bill_date: '2026-10-02',
    bill_amount: 285000.0,
    credit_limit: 100000.0,
    paid_amount: 267000.0,
    outstanding_amount: 18000.0,
    days_overdue: 28,
    aging_bucket: 'CURRENT_30',
    last_payment_date: '2026-10-02',
    status: 'PARTIAL',
  },
  {
    id: '77889900-a1b2-c3d4-e5f6-001122334458',
    customer_name: 'Rajesh Varma',
    phone: '+91 98480 11223',
    bill_no: 'POS-2026-0491',
    bill_date: '2026-08-05',
    bill_amount: 520000.0,
    credit_limit: 250000.0,
    paid_amount: 370000.0,
    outstanding_amount: 150000.0,
    days_overdue: 86,
    aging_bucket: 'OVERDUE_90',
    last_payment_date: '2026-08-15',
    status: 'PARTIAL',
  },
  {
    id: '77889900-a1b2-c3d4-e5f6-001122334459',
    customer_name: 'Goutham Chand Jain',
    phone: '+91 93412 99887',
    bill_no: 'INV-2026-0219',
    bill_date: '2026-06-18',
    bill_amount: 112000.0,
    credit_limit: 100000.0,
    paid_amount: 50000.0,
    outstanding_amount: 62000.0,
    days_overdue: 134,
    aging_bucket: 'OVERDUE_90_PLUS',
    last_payment_date: '2026-07-02',
    status: 'PARTIAL',
  },
  {
    id: '77889900-a1b2-c3d4-e5f6-001122334460',
    customer_name: 'Kavitha Jagannath',
    phone: '+91 99011 44556',
    bill_no: 'POS-2026-0922',
    bill_date: '2026-10-20',
    bill_amount: 380000.0,
    credit_limit: 200000.0,
    paid_amount: 220000.0,
    outstanding_amount: 160000.0,
    days_overdue: 11,
    aging_bucket: 'CURRENT_30',
    last_payment_date: '2026-10-20',
    status: 'PARTIAL',
  },
];

export function CustomersOutstandingBalancesView() {
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [receivables, setReceivables] = useState<CustomerReceivable[]>(INITIAL_RECEIVABLES);
  const [searchQuery, setSearchQuery] = useState('');
  const [bucketFilter, setBucketFilter] = useState<string>('ALL');

  // Modals & Drawers
  const [isRepaymentOpen, setIsRepaymentOpen] = useState(false);
  const [selectedReceivableForPay, setSelectedReceivableForPay] = useState<CustomerReceivable | null>(null);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [selectedReceivableForUpi, setSelectedReceivableForUpi] = useState<CustomerReceivable | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Repayment form
  const [repayAmount, setRepayAmount] = useState('10000');
  const [repayMode, setRepayMode] = useState('UPI');
  const [repayRefNo, setRepayRefNo] = useState(`REC-${Date.now().toString().slice(-6)}`);
  const [repayDiscount, setRepayDiscount] = useState('0');

  const filteredReceivables = useMemo(() => {
    return receivables.filter((rec) => {
      if (bucketFilter !== 'ALL' && rec.aging_bucket !== bucketFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const mName = rec.customer_name.toLowerCase().includes(q);
        const mPhone = rec.phone.toLowerCase().includes(q);
        const mBill = rec.bill_no.toLowerCase().includes(q);
        if (!mName && !mPhone && !mBill) return false;
      }
      return true;
    });
  }, [receivables, bucketFilter, searchQuery]);

  const handleOpenRepayModal = (rec: CustomerReceivable) => {
    setSelectedReceivableForPay(rec);
    setRepayAmount(rec.outstanding_amount.toString());
    setIsRepaymentOpen(true);
  };

  const handleOpenUpiModal = (rec: CustomerReceivable) => {
    setSelectedReceivableForUpi(rec);
    setIsUpiModalOpen(true);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceivableForPay) return;

    const amountPaid = parseFloat(repayAmount) || 0;
    const updated = receivables.map((r) => {
      if (r.id === selectedReceivableForPay.id) {
        const remaining = Math.max(0, r.outstanding_amount - amountPaid);
        return {
          ...r,
          paid_amount: r.paid_amount + amountPaid,
          outstanding_amount: remaining,
          last_payment_date: new Date().toISOString().split('T')[0],
          status: remaining === 0 ? ('PAID' as any) : ('PARTIAL' as any),
        };
      }
      return r;
    });

    setReceivables(updated);
    setIsRepaymentOpen(false);
    setToastMessage(`Payment of ₹${amountPaid.toLocaleString('en-IN')} recorded successfully.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSendPaymentLink = () => {
    if (!selectedReceivableForUpi) return;
    setIsUpiModalOpen(false);
    setToastMessage(
      `Razorpay UPI payment link of ₹${selectedReceivableForUpi.outstanding_amount.toLocaleString(
        'en-IN'
      )} sent via SMS & WhatsApp to ${selectedReceivableForUpi.phone}.`
    );
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="customers_outstanding_receivables" />
      <ActionToolbar
        filterPlaceholder="Filter by customer, phone, or bill number..."
        insertLabel="Record Repayment"
        onInsertClick={() => {
          if (receivables.length > 0) {
            handleOpenRepayModal(receivables[0]);
          }
        }}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* Toast */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> {toastMessage}
            </span>
            <button onClick={() => setToastMessage(null)} className="hover:opacity-80">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* KPI Metrics Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Receivables</span>
                <CreditCard className="w-3.5 h-3.5 text-neutral-700" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">₹ 18,42,000</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Across 28 patron accounts
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">0 - 30 Days (Current)</span>
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700 font-mono">₹ 12,20,000</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                66.2% Within grace period
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">31 - 60 Days Due</span>
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-amber-700 font-mono">₹ 4,10,000</div>
              <div className="text-[11px] text-amber-600 mt-1 font-mono">
                22.3% Follow-up required
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-orange-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">61 - 90 Days Due</span>
                <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <div className="text-xl font-medium text-orange-700 font-mono">₹ 1,50,000</div>
              <div className="text-[11px] text-orange-600 mt-1 font-mono">
                8.1% High priority
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-red-300 transition-colors shadow-2xs col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">90+ Days Overdue</span>
                <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              </div>
              <div className="text-xl font-medium text-red-700 font-mono">₹ 62,000</div>
              <div className="text-[11px] text-red-600 mt-1 font-mono">
                3.4% Escalation level
              </div>
            </div>
          </div>

          {/* Aging Buckets Stacked Progress Visual Summary */}
          <div className="mt-4 pt-3 border-t border-[#f1f5f9]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[11px] font-medium text-neutral-600 uppercase tracking-wider">
                Aging Portfolio Health
              </span>
              <span className="text-[11px] font-mono text-neutral-500">₹ 18,42,000 Total Receivables</span>
            </div>
            <div className="h-3 w-full rounded-full bg-neutral-100 flex overflow-hidden border border-[#e2e8f0]">
              <div style={{ width: '66.2%' }} className="bg-emerald-500 h-full" title="Current (0-30d): 66.2%" />
              <div style={{ width: '22.3%' }} className="bg-amber-400 h-full" title="31-60 Days: 22.3%" />
              <div style={{ width: '8.1%' }} className="bg-orange-500 h-full" title="61-90 Days: 8.1%" />
              <div style={{ width: '3.4%' }} className="bg-red-500 h-full" title="90+ Days: 3.4%" />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[10px] text-neutral-600 mt-2 font-mono">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Current (66.2%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> 31-60d (22.3%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500" /> 61-90d (8.1%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" /> 90+ days (3.4%)
              </span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer, mobile, or bill #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-white border border-[#e2e8f0] rounded-md text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-emerald-500 w-64"
                />
              </div>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Aging:</span>
                <select
                  value={bucketFilter}
                  onChange={(e) => setBucketFilter(e.target.value)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Aging Buckets</option>
                  <option value="CURRENT_30">0 - 30 Days (Current)</option>
                  <option value="OVERDUE_60">31 - 60 Days</option>
                  <option value="OVERDUE_90">61 - 90 Days</option>
                  <option value="OVERDUE_90_PLUS">90+ Days Overdue</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Supabase-style Table */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="border border-[#e2e8f0] rounded-lg bg-white overflow-hidden shadow-2xs flex flex-col flex-1">
            {/* Header */}
            <div className="h-10 bg-[#f8fafc] border-b border-[#e2e8f0] px-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('data')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    activeTab === 'data'
                      ? 'bg-white text-neutral-900 shadow-2xs border border-[#e2e8f0]'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Outstanding Accounts ({filteredReceivables.length})
                </button>
                <button
                  onClick={() => setActiveTab('definition')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    activeTab === 'definition'
                      ? 'bg-white text-neutral-900 shadow-2xs border border-[#e2e8f0]'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Definition (DDL)
                </button>
              </div>
              <div className="text-[11px] text-neutral-400 font-mono">
                public.customer_receivables • 11 columns
              </div>
            </div>

            {/* Table Content: Data Tab */}
            {activeTab === 'data' && (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-neutral-600 font-mono text-[11px]">
                      <th className="w-10 px-3 py-2 border-r border-[#e5e7eb] text-center">
                        <input type="checkbox" className="rounded border-neutral-300 text-emerald-600 focus:ring-0" />
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">customer_name</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">phone</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">bill_no</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">bill_amount</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">credit_limit</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">paid_so_far</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">outstanding_due</span>
                        <span className="text-neutral-400 font-normal text-[10px] ml-1">inr</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">days_overdue</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">aging_tier</span>
                      </th>
                      <th className="px-3.5 py-2 font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {filteredReceivables.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="px-3 py-2 text-center border-r border-[#e5e7eb]">
                          <input type="checkbox" className="rounded border-neutral-300 text-emerald-600 focus:ring-0" />
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-medium text-neutral-900">
                          {row.customer_name}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-neutral-700 border-r border-[#e5e7eb] whitespace-nowrap">
                          {row.phone}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-emerald-700 border-r border-[#e5e7eb] whitespace-nowrap">
                          {row.bill_no}
                          <span className="text-[10px] text-neutral-400 block">{row.bill_date}</span>
                        </td>
                        <td className="px-3.5 py-2 font-mono text-right text-neutral-700 border-r border-[#e5e7eb] whitespace-nowrap">
                          ₹ {row.bill_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-right text-neutral-500 border-r border-[#e5e7eb] whitespace-nowrap">
                          ₹ {row.credit_limit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-right text-emerald-700 border-r border-[#e5e7eb] whitespace-nowrap">
                          ₹ {row.paid_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-right font-medium text-amber-800 border-r border-[#e5e7eb] whitespace-nowrap bg-amber-50/20">
                          ₹ {row.outstanding_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-center border-r border-[#e5e7eb] whitespace-nowrap">
                          {row.days_overdue} days
                        </td>
                        <td className="px-3.5 py-2 text-center border-r border-[#e5e7eb] whitespace-nowrap">
                          {row.aging_bucket === 'CURRENT_30' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Current (0-30d)
                            </span>
                          )}
                          {row.aging_bucket === 'OVERDUE_60' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono bg-amber-50 text-amber-700 border border-amber-200">
                              31-60 Days
                            </span>
                          )}
                          {row.aging_bucket === 'OVERDUE_90' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono bg-orange-50 text-orange-700 border border-orange-200">
                              61-90 Days
                            </span>
                          )}
                          {row.aging_bucket === 'OVERDUE_90_PLUS' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono bg-red-50 text-red-700 border border-red-200">
                              90+ Days Due
                            </span>
                          )}
                        </td>
                        <td className="px-3.5 py-2 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenRepayModal(row)}
                              className="px-2 py-1 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                              title="Record Repayment"
                            >
                              Record Pay
                            </button>
                            <button
                              onClick={() => handleOpenUpiModal(row)}
                              className="p-1 hover:bg-purple-50 rounded text-neutral-600 hover:text-purple-700 transition-colors"
                              title="Send UPI Link via SMS / WhatsApp"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>
                          </div>
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.customer_receivables (
                  <br />
                  &nbsp;&nbsp;id <span className="text-blue-300">uuid</span> PRIMARY KEY DEFAULT gen_random_uuid(),
                  <br />
                  &nbsp;&nbsp;customer_name <span className="text-blue-300">varchar(255)</span> NOT NULL,
                  <br />
                  &nbsp;&nbsp;phone <span className="text-blue-300">varchar(20)</span> NOT NULL,
                  <br />
                  &nbsp;&nbsp;bill_no <span className="text-blue-300">varchar(50)</span> NOT NULL,
                  <br />
                  &nbsp;&nbsp;bill_date <span className="text-blue-300">date</span> NOT NULL,
                  <br />
                  &nbsp;&nbsp;bill_amount <span className="text-blue-300">numeric(12,2)</span> NOT NULL,
                  <br />
                  &nbsp;&nbsp;credit_limit <span className="text-blue-300">numeric(12,2)</span> DEFAULT 100000.00,
                  <br />
                  &nbsp;&nbsp;paid_amount <span className="text-blue-300">numeric(12,2)</span> DEFAULT 0.00,
                  <br />
                  &nbsp;&nbsp;outstanding_amount <span className="text-blue-300">numeric(12,2)</span> NOT NULL,
                  <br />
                  &nbsp;&nbsp;days_overdue <span className="text-blue-300">integer</span> DEFAULT 0,
                  <br />
                  &nbsp;&nbsp;aging_bucket <span className="text-blue-300">varchar(20)</span> DEFAULT &apos;CURRENT_30&apos;,
                  <br />
                  &nbsp;&nbsp;last_payment_date <span className="text-blue-300">date</span>
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Record Repayment Drawer Modal */}
      {isRepaymentOpen && selectedReceivableForPay && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-[#e2e8f0] animate-in slide-in-from-right duration-200">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div>
                <h3 className="text-sm font-medium text-neutral-900">Record Customer Repayment</h3>
                <p className="text-[11px] text-neutral-500">Collect dues against invoice {selectedReceivableForPay.bill_no}</p>
              </div>
              <button
                onClick={() => setIsRepaymentOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-xs">
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Customer:</span>
                  <span className="font-medium text-neutral-900">{selectedReceivableForPay.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Original Bill:</span>
                  <span className="font-mono text-neutral-900">{selectedReceivableForPay.bill_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Total Invoice Value:</span>
                  <span className="font-mono text-neutral-900">₹ {selectedReceivableForPay.bill_amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-t border-[#e2e8f0] pt-2">
                  <span className="font-medium text-neutral-800">Current Outstanding Due:</span>
                  <span className="font-mono font-medium text-amber-700 text-sm">
                    ₹ {selectedReceivableForPay.outstanding_amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Amount Received (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedReceivableForPay.outstanding_amount}
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white text-neutral-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Payment Mode</label>
                <select
                  value={repayMode}
                  onChange={(e) => setRepayMode(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / QR)</option>
                  <option value="Cash">Cash in Hand</option>
                  <option value="CreditCard">Credit / Debit Card POS</option>
                  <option value="Cheque">Cheque Clearance</option>
                  <option value="RTGS">RTGS / NEFT Direct Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Receipt / UTR Reference #</label>
                <input
                  type="text"
                  value={repayRefNo}
                  onChange={(e) => setRepayRefNo(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                />
              </div>

              <div className="p-3 rounded bg-emerald-50/70 border border-emerald-200 text-emerald-800 text-[11px] font-mono">
                Remaining Balance after this payment: ₹{' '}
                {Math.max(0, selectedReceivableForPay.outstanding_amount - (parseFloat(repayAmount) || 0)).toLocaleString('en-IN')}
              </div>

              <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRepaymentOpen(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" /> Confirm Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPI Payment Link Modal */}
      {isUpiModalOpen && selectedReceivableForUpi && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-2xl border border-[#e2e8f0] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-medium text-neutral-900">Send Instant UPI Payment Link</h3>
              </div>
              <button
                onClick={() => setIsUpiModalOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="text-center p-4 border border-purple-200 rounded-lg bg-purple-50/30">
                <div className="w-32 h-32 mx-auto bg-white border border-purple-200 rounded p-2 flex items-center justify-center mb-2 shadow-inner">
                  <QrCode className="w-28 h-28 text-neutral-900" />
                </div>
                <div className="text-xs font-mono font-medium text-neutral-900">
                  upi://pay?pa=jewellerynext@icici&pn=JewelleryNext&am={selectedReceivableForUpi.outstanding_amount}
                </div>
                <div className="text-[11px] text-purple-700 mt-1 font-mono font-medium">
                  Dynamic Razorpay / PineLabs UPI QR
                </div>
              </div>

              <div className="space-y-1.5 text-neutral-700 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Customer:</span>
                  <span className="font-medium text-neutral-900">{selectedReceivableForUpi.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Mobile:</span>
                  <span className="font-mono text-neutral-900">{selectedReceivableForUpi.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Payable Amount:</span>
                  <span className="font-mono font-medium text-neutral-900">
                    ₹ {selectedReceivableForUpi.outstanding_amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsUpiModalOpen(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendPaymentLink}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" /> Dispatch SMS & WhatsApp Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
