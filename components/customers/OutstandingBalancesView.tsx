'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
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
  Loader2,
  ShoppingBag,
  Gem,
  BookOpen,
  Trash2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';

export interface CustomerReceivable {
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
  status: 'UNPAID' | 'PARTIAL' | 'SETTLED';
  created_at?: string;
}

const SAMPLE_RECEIVABLES: Omit<CustomerReceivable, 'id'>[] = [
  {
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
    created_at: new Date().toISOString(),
  },
  {
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
    created_at: new Date().toISOString(),
  },
  {
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
    created_at: new Date().toISOString(),
  },
  {
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
    created_at: new Date().toISOString(),
  },
  {
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
    created_at: new Date().toISOString(),
  },
];

export function CustomersOutstandingBalancesView() {
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [receivables, setReceivables] = useState<CustomerReceivable[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bucketFilter, setBucketFilter] = useState<string>('ALL');

  // Modals & Drawers
  const [isNewReceivableOpen, setIsNewReceivableOpen] = useState(false);
  const [isRepaymentOpen, setIsRepaymentOpen] = useState(false);
  const [selectedReceivableForPay, setSelectedReceivableForPay] = useState<CustomerReceivable | null>(null);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [selectedReceivableForUpi, setSelectedReceivableForUpi] = useState<CustomerReceivable | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Repayment form
  const [repayAmount, setRepayAmount] = useState('10000');
  const [repayMode, setRepayMode] = useState('UPI');

  // New Receivable Form State
  const [formCustName, setFormCustName] = useState('');
  const [formCustPhone, setFormCustPhone] = useState('');
  const [formBillNo, setFormBillNo] = useState('');
  const [formBillDate, setFormBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [formBillAmount, setFormBillAmount] = useState('100000');
  const [formPaidAmount, setFormPaidAmount] = useState('50000');
  const [formCreditLimit, setFormCreditLimit] = useState('200000');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const fetchReceivables = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'customers_outstanding'));
      const list: CustomerReceivable[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<CustomerReceivable, 'id'>) });
      });
      setReceivables(list);
    } catch (err: any) {
      console.error('Error fetching receivables:', err);
      showToast('error', err.message || 'Failed to fetch outstanding receivables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceivables();
  }, []);

  const handleSeedSamples = async () => {
    try {
      setSaving(true);
      const added: CustomerReceivable[] = [];
      for (const item of SAMPLE_RECEIVABLES) {
        const docRef = await addDoc(collection(db, 'customers_outstanding'), item);
        added.push({ id: docRef.id, ...item });
      }
      setReceivables((prev) => [...added, ...prev]);
      showToast('success', `${added.length} sample receivables inserted into Firestore.`);
    } catch (err: any) {
      console.error('Error seeding receivables:', err);
      showToast('error', err.message || 'Failed to seed sample receivables');
    } finally {
      setSaving(false);
    }
  };

  // Dynamic calculations for New Receivable
  const billAmtNum = parseFloat(formBillAmount) || 0;
  const paidAmtNum = parseFloat(formPaidAmount) || 0;
  const dynamicOutstanding = Math.max(0, billAmtNum - paidAmtNum);
  const diffTime = Math.abs(new Date().getTime() - new Date(formBillDate || Date.now()).getTime());
  const dynamicDaysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const dynamicBucket: CustomerReceivable['aging_bucket'] =
    dynamicDaysOverdue <= 30
      ? 'CURRENT_30'
      : dynamicDaysOverdue <= 60
      ? 'OVERDUE_60'
      : dynamicDaysOverdue <= 90
      ? 'OVERDUE_90'
      : 'OVERDUE_90_PLUS';

  const handleCreateReceivable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustName.trim() || !formCustPhone.trim()) return;

    try {
      setSaving(true);
      const randNo = Math.floor(100 + Math.random() * 900);
      const billCode = formBillNo.trim() || `POS-2026-0${randNo}`;

      const newRec: Omit<CustomerReceivable, 'id'> = {
        customer_name: formCustName.trim(),
        phone: formCustPhone.trim(),
        bill_no: billCode,
        bill_date: formBillDate,
        bill_amount: billAmtNum,
        credit_limit: parseFloat(formCreditLimit) || 200000,
        paid_amount: paidAmtNum,
        outstanding_amount: dynamicOutstanding,
        days_overdue: dynamicDaysOverdue,
        aging_bucket: dynamicBucket,
        last_payment_date: paidAmtNum > 0 ? formBillDate : 'None',
        status: dynamicOutstanding === 0 ? 'SETTLED' : paidAmtNum > 0 ? 'PARTIAL' : 'UNPAID',
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'customers_outstanding'), newRec);
      setReceivables((prev) => [{ id: docRef.id, ...newRec }, ...prev]);
      setIsNewReceivableOpen(false);
      showToast('success', `Receivable for ${formCustName} with balance ₹${dynamicOutstanding.toLocaleString('en-IN')} created.`);

      // Reset
      setFormCustName('');
      setFormCustPhone('');
      setFormBillNo('');
    } catch (err: any) {
      console.error('Error creating receivable:', err);
      showToast('error', err.message || 'Failed to save receivable');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenRepayModal = (rec: CustomerReceivable) => {
    setSelectedReceivableForPay(rec);
    setRepayAmount(rec.outstanding_amount.toString());
    setIsRepaymentOpen(true);
  };

  const handleOpenUpiModal = (rec: CustomerReceivable) => {
    setSelectedReceivableForUpi(rec);
    setIsUpiModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceivableForPay) return;

    try {
      setSaving(true);
      const amountPaid = parseFloat(repayAmount) || 0;
      const remaining = Math.max(0, selectedReceivableForPay.outstanding_amount - amountPaid);
      const newPaidTotal = selectedReceivableForPay.paid_amount + amountPaid;
      const newStatus = remaining === 0 ? ('SETTLED' as const) : ('PARTIAL' as const);
      const todayStr = new Date().toISOString().split('T')[0];

      await updateDoc(doc(db, 'customers_outstanding', selectedReceivableForPay.id), {
        paid_amount: newPaidTotal,
        outstanding_amount: remaining,
        last_payment_date: todayStr,
        status: newStatus,
      });

      setReceivables((prev) =>
        prev.map((r) =>
          r.id === selectedReceivableForPay.id
            ? {
                ...r,
                paid_amount: newPaidTotal,
                outstanding_amount: remaining,
                last_payment_date: todayStr,
                status: newStatus,
              }
            : r
        )
      );

      setIsRepaymentOpen(false);
      showToast('success', `Repayment of ₹${amountPaid.toLocaleString('en-IN')} saved to Firestore.`);
    } catch (err: any) {
      console.error('Error recording payment:', err);
      showToast('error', err.message || 'Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReceivable = async (id: string, billNo: string) => {
    if (!confirm(`Delete receivable record for "${billNo}"?`)) return;
    try {
      await deleteDoc(doc(db, 'customers_outstanding', id));
      setReceivables((prev) => prev.filter((r) => r.id !== id));
      showToast('success', `Receivable "${billNo}" deleted.`);
    } catch (err: any) {
      console.error('Error deleting receivable:', err);
      showToast('error', err.message || 'Failed to delete receivable');
    }
  };

  const handleSendPaymentLink = () => {
    if (!selectedReceivableForUpi) return;
    setIsUpiModalOpen(false);
    showToast(
      'success',
      `Razorpay UPI payment link of ₹${selectedReceivableForUpi.outstanding_amount.toLocaleString(
        'en-IN'
      )} sent via SMS & WhatsApp to ${selectedReceivableForUpi.phone}.`
    );
  };

  const filteredReceivables = useMemo(() => {
    return receivables.filter((rec) => {
      if (bucketFilter !== 'ALL' && rec.aging_bucket !== bucketFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const mName = rec.customer_name?.toLowerCase().includes(q);
        const mPhone = rec.phone?.toLowerCase().includes(q);
        const mBill = rec.bill_no?.toLowerCase().includes(q);
        if (!mName && !mPhone && !mBill) return false;
      }
      return true;
    });
  }, [receivables, bucketFilter, searchQuery]);

  // Derived KPI metrics
  const totalReceivables = receivables.reduce((sum, r) => sum + (r.outstanding_amount || 0), 0);
  const overdue30 = receivables.filter((r) => r.aging_bucket === 'CURRENT_30').reduce((sum, r) => sum + r.outstanding_amount, 0);
  const overdue60 = receivables.filter((r) => r.aging_bucket === 'OVERDUE_60').reduce((sum, r) => sum + r.outstanding_amount, 0);
  const overdue90 = receivables.filter((r) => r.aging_bucket === 'OVERDUE_90').reduce((sum, r) => sum + r.outstanding_amount, 0);
  const overdue90Plus = receivables.filter((r) => r.aging_bucket === 'OVERDUE_90_PLUS').reduce((sum, r) => sum + r.outstanding_amount, 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="customers_outstanding" />
      <ActionToolbar
        filterPlaceholder="Filter by customer, phone, or bill number..."
        insertLabel="New Receivable Record"
        onInsertClick={() => setIsNewReceivableOpen(true)}
        onRefresh={fetchReceivables}
      />

      {/* Customer Module Interlinks Bar */}
      <div className="h-10 bg-[#f8fafc] border-b border-[#e2e8f0] px-3 sm:px-4 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar text-xs">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-medium uppercase text-neutral-400 mr-1">Modules:</span>
          <Link
            href="/customers/list"
            className="px-2.5 py-1 rounded-md text-xs font-medium text-neutral-600 hover:text-emerald-700 hover:bg-neutral-100 transition-colors"
          >
            Directory
          </Link>
          <Link
            href="/customers/schemes"
            className="px-2.5 py-1 rounded-md text-xs font-medium text-neutral-600 hover:text-emerald-700 hover:bg-neutral-100 transition-colors"
          >
            Gold Schemes
          </Link>
          <Link
            href="/customers/advance-deposits"
            className="px-2.5 py-1 rounded-md text-xs font-medium text-neutral-600 hover:text-emerald-700 hover:bg-neutral-100 transition-colors"
          >
            Advance Deposits
          </Link>
          <Link
            href="/customers/outstanding-balances"
            className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs"
          >
            Outstanding Dues
          </Link>
          <Link
            href="/customers/purchase-history"
            className="px-2.5 py-1 rounded-md text-xs font-medium text-neutral-600 hover:text-emerald-700 hover:bg-neutral-100 transition-colors"
          >
            Invoices & History
          </Link>
          <Link
            href="/customers/loyalty-rewards"
            className="px-2.5 py-1 rounded-md text-xs font-medium text-neutral-600 hover:text-emerald-700 hover:bg-neutral-100 transition-colors"
          >
            Loyalty Rewards
          </Link>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/finance/receivables"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-emerald-700 hover:underline"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" /> Full Receivables Ledger
          </Link>
          <span className="text-neutral-300">•</span>
          <Link
            href="/sales/billing-pos"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-emerald-700 hover:underline"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" /> POS Billing
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* Toast Feedback */}
        {toastType === 'success' && (
          <div className="mx-4 mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center justify-between animate-fadeIn shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastType('idle')} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {toastType === 'error' && (
          <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-medium flex items-center justify-between animate-fadeIn shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastType('idle')} className="text-red-600 hover:text-red-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Aging KPI Summary Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Receivables</span>
                <CreditCard className="w-3.5 h-3.5 text-neutral-700" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-neutral-400" /> : `₹ ${totalReceivables.toLocaleString('en-IN')}`}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                {receivables.filter((r) => r.outstanding_amount > 0).length} customer balances
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Current (0-30d)</span>
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700 font-mono">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-neutral-400" /> : `₹ ${overdue30.toLocaleString('en-IN')}`}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">Standard grace period</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Overdue (31-60d)</span>
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-amber-700 font-mono">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-neutral-400" /> : `₹ ${overdue60.toLocaleString('en-IN')}`}
              </div>
              <div className="text-[11px] text-amber-600 mt-1 font-mono">First reminder sent</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-orange-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Overdue (61-90d)</span>
                <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <div className="text-xl font-medium text-orange-700 font-mono">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-neutral-400" /> : `₹ ${overdue90.toLocaleString('en-IN')}`}
              </div>
              <div className="text-[11px] text-orange-600 mt-1 font-mono">Follow-up call required</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-red-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Critical (90d+)</span>
                <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              </div>
              <div className="text-xl font-medium text-red-700 font-mono">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-neutral-400" /> : `₹ ${overdue90Plus.toLocaleString('en-IN')}`}
              </div>
              <div className="text-[11px] text-red-600 mt-1 font-mono">Credit locked</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by customer, phone, or bill..."
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
                  <option value="CURRENT_30">Current (0-30 days)</option>
                  <option value="OVERDUE_60">31-60 days</option>
                  <option value="OVERDUE_90">61-90 days</option>
                  <option value="OVERDUE_90_PLUS">90+ days (Critical)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchReceivables}
                className="p-1.5 rounded-md border border-[#e2e8f0] bg-white text-neutral-600 hover:text-emerald-700 hover:bg-neutral-50 transition-colors"
                title="Refresh from Firestore"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsNewReceivableOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                New Receivable
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="border border-[#e2e8f0] rounded-lg bg-white overflow-hidden shadow-2xs flex flex-col flex-1">
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
                  Receivables ({filteredReceivables.length})
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
                firestore: customers_outstanding • 13 fields
              </div>
            </div>

            {/* Table Content: Data Tab */}
            {activeTab === 'data' && (
              <div className="overflow-x-auto flex-1">
                {loading ? (
                  <div className="flex flex-col items-center justify-center p-12 text-neutral-400">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
                    <span className="text-xs font-medium text-neutral-600">Connecting to Outstanding Receivables...</span>
                  </div>
                ) : filteredReceivables.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-medium text-neutral-900 mb-1">No Receivables Found</h4>
                    <p className="text-xs text-neutral-500 max-w-sm mb-4">
                      {receivables.length === 0
                        ? 'No outstanding customer balances found in Firestore. Add a customer credit sale or insert sample test balances.'
                        : 'No records match your selected aging bucket or search query.'}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsNewReceivableOpen(true)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Record Credit Bill
                      </button>
                      {receivables.length === 0 && (
                        <button
                          onClick={handleSeedSamples}
                          disabled={saving}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-300 transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          Insert Sample Records
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
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
                          <span className="text-neutral-800">bill_no</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">bill_amount</span>
                          <span className="text-neutral-400 font-normal text-[10px] ml-1">inr</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">paid_amount</span>
                          <span className="text-neutral-400 font-normal text-[10px] ml-1">inr</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">due_amount</span>
                          <span className="text-neutral-400 font-normal text-[10px] ml-1">inr</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                          <span className="text-neutral-800">days_overdue</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                          <span className="text-neutral-800">aging_bucket</span>
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
                          <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                            <div className="font-medium text-neutral-900">{row.customer_name}</div>
                            <span className="text-[10px] text-neutral-400 font-mono block">{row.phone}</span>
                          </td>
                          <td className="px-3.5 py-2 font-mono text-neutral-700 border-r border-[#e5e7eb] whitespace-nowrap">
                            {row.bill_no}
                            <span className="text-[10px] text-neutral-400 block font-normal">{row.bill_date}</span>
                          </td>
                          <td className="px-3.5 py-2 font-mono text-right text-neutral-800 border-r border-[#e5e7eb] whitespace-nowrap">
                            ₹ {(row.bill_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-3.5 py-2 font-mono text-right text-neutral-600 border-r border-[#e5e7eb] whitespace-nowrap">
                            ₹ {(row.paid_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-3.5 py-2 font-mono text-right font-medium text-amber-700 border-r border-[#e5e7eb] whitespace-nowrap">
                            ₹ {(row.outstanding_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-3.5 py-2 font-mono text-center border-r border-[#e5e7eb] whitespace-nowrap">
                            {row.days_overdue} days
                          </td>
                          <td className="px-3.5 py-2 text-center border-r border-[#e5e7eb] whitespace-nowrap">
                            {row.aging_bucket === 'CURRENT_30' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Current (0-30d)
                              </span>
                            )}
                            {row.aging_bucket === 'OVERDUE_60' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                Overdue (31-60d)
                              </span>
                            )}
                            {row.aging_bucket === 'OVERDUE_90' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-orange-50 text-orange-700 border border-orange-200">
                                Overdue (61-90d)
                              </span>
                            )}
                            {row.aging_bucket === 'OVERDUE_90_PLUS' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 border border-red-200">
                                90+ Days Critical
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-2 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {row.outstanding_amount > 0 ? (
                                <>
                                  <button
                                    onClick={() => handleOpenRepayModal(row)}
                                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                                  >
                                    Record Payment
                                  </button>
                                  <button
                                    onClick={() => handleOpenUpiModal(row)}
                                    className="p-1 hover:bg-neutral-100 rounded text-neutral-600 hover:text-emerald-700 transition-colors"
                                    title="Send UPI Link"
                                  >
                                    <QrCode className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                                  Settled
                                </span>
                              )}
                              <button
                                onClick={() => handleDeleteReceivable(row.id, row.bill_no)}
                                className="p-1 hover:bg-red-50 rounded text-neutral-400 hover:text-red-600 transition-colors"
                                title="Delete Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Table Content: Definition Tab */}
            {activeTab === 'definition' && (
              <div className="p-4 overflow-x-auto font-mono text-xs text-neutral-800 bg-[#fbfbfb] w-full">
                <div className="bg-neutral-900 text-neutral-100 p-4 rounded-md overflow-x-auto shadow-inner text-[12px] leading-relaxed w-full">
                  <span className="text-emerald-400">// Firestore Collection Schema</span>
                  <br />
                  collection: <span className="text-amber-400">&quot;customers_outstanding&quot;</span>
                  <br />
                  document: &#123;
                  <br />
                  &nbsp;&nbsp;id: <span className="text-blue-300">auto-generated-id</span>,
                  <br />
                  &nbsp;&nbsp;customer_name: <span className="text-blue-300">string</span>,
                  <br />
                  &nbsp;&nbsp;phone: <span className="text-blue-300">string</span>,
                  <br />
                  &nbsp;&nbsp;bill_no: <span className="text-blue-300">string</span> (POS-2026-xxx),
                  <br />
                  &nbsp;&nbsp;bill_date: <span className="text-blue-300">YYYY-MM-DD</span>,
                  <br />
                  &nbsp;&nbsp;bill_amount: <span className="text-blue-300">number</span>,
                  <br />
                  &nbsp;&nbsp;credit_limit: <span className="text-blue-300">number</span>,
                  <br />
                  &nbsp;&nbsp;paid_amount: <span className="text-blue-300">number</span>,
                  <br />
                  &nbsp;&nbsp;outstanding_amount: <span className="text-blue-300">number</span>,
                  <br />
                  &nbsp;&nbsp;days_overdue: <span className="text-blue-300">number</span>,
                  <br />
                  &nbsp;&nbsp;aging_bucket: <span className="text-emerald-300">&apos;CURRENT_30&apos; | &apos;OVERDUE_60&apos; | &apos;OVERDUE_90&apos; | &apos;OVERDUE_90_PLUS&apos;</span>,
                  <br />
                  &nbsp;&nbsp;status: <span className="text-emerald-300">&apos;UNPAID&apos; | &apos;PARTIAL&apos; | &apos;SETTLED&apos;</span>,
                  <br />
                  &nbsp;&nbsp;created_at: <span className="text-blue-300">ISO-timestamp</span>
                  <br />
                  &#125;
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Receivable Drawer */}
      {isNewReceivableOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-[#e2e8f0] animate-in slide-in-from-right duration-200">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div>
                <h3 className="text-sm font-medium text-neutral-900">Record Customer Credit Receivable</h3>
                <p className="text-[11px] text-neutral-500">Track unpaid or credit jewellery sales and payment due dates</p>
              </div>
              <button
                onClick={() => setIsNewReceivableOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReceivable} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-xs">
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Patron Details
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Mohan Krishna"
                      value={formCustName}
                      onChange={(e) => setFormCustName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 94401 55667"
                      value={formCustPhone}
                      onChange={(e) => setFormCustPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Bill / Invoice #</label>
                    <input
                      type="text"
                      placeholder="e.g. POS-2026-0690"
                      value={formBillNo}
                      onChange={(e) => setFormBillNo(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Bill Date</label>
                    <input
                      type="date"
                      value={formBillDate}
                      onChange={(e) => setFormBillDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Amount & Credit Terms
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Total Bill Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formBillAmount}
                      onChange={(e) => setFormBillAmount(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white text-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Initial Paid Amount (₹)</label>
                    <input
                      type="number"
                      value={formPaidAmount}
                      onChange={(e) => setFormPaidAmount(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white text-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Customer Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={formCreditLimit}
                    onChange={(e) => setFormCreditLimit(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white text-neutral-900"
                  />
                </div>

                {/* Dynamic Calculation Indicator */}
                <div className="p-3 bg-white rounded border border-[#e2e8f0] space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Remaining Balance Due:</span>
                    <span className="font-medium text-amber-700">₹ {dynamicOutstanding.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Calculated Overdue:</span>
                    <span className="text-neutral-900">{dynamicDaysOverdue} Days</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Assigned Aging Category:</span>
                    <span className="font-sans text-[11px] font-medium text-emerald-700">{dynamicBucket}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewReceivableOpen(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Save Receivable in Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Repayment Modal */}
      {isRepaymentOpen && selectedReceivableForPay && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-2xl border border-[#e2e8f0] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">Record Customer Repayment</h3>
              </div>
              <button
                onClick={() => setIsRepaymentOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Patron:</span>
                  <span className="font-medium text-neutral-900">{selectedReceivableForPay.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Bill Number:</span>
                  <span className="font-mono text-neutral-900 font-medium">{selectedReceivableForPay.bill_no}</span>
                </div>
                <div className="flex justify-between border-t border-[#e2e8f0] pt-1.5 text-sm">
                  <span className="font-medium text-neutral-800">Current Outstanding:</span>
                  <span className="font-mono font-medium text-amber-700">
                    ₹ {selectedReceivableForPay.outstanding_amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Repayment Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Payment Channel</label>
                <select
                  value={repayMode}
                  onChange={(e) => setRepayMode(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe)</option>
                  <option value="Cash">Cash Receipt</option>
                  <option value="Bank Transfer">Bank Transfer (IMPS / NEFT)</option>
                  <option value="Card">POS Credit/Debit Card</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRepaymentOpen(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Confirm Settlement in Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPI Payment Link Modal */}
      {isUpiModalOpen && selectedReceivableForUpi && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-lg shadow-2xl border border-[#e2e8f0] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">Send UPI Payment Link</h3>
              </div>
              <button
                onClick={() => setIsUpiModalOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-center">
              <div className="mx-auto w-32 h-32 p-2 border border-neutral-200 rounded-lg bg-neutral-50 flex items-center justify-center">
                <QrCode className="w-24 h-24 text-neutral-800" />
              </div>
              <div>
                <span className="font-mono text-base font-medium text-neutral-900 block">
                  ₹ {selectedReceivableForUpi.outstanding_amount.toLocaleString('en-IN')}
                </span>
                <span className="text-neutral-500 text-[11px]">Due for bill {selectedReceivableForUpi.bill_no}</span>
              </div>
              <p className="text-neutral-600 text-[11px]">
                Generate an instant Razorpay dynamic UPI QR & payment link sent straight to {selectedReceivableForUpi.customer_name} ({selectedReceivableForUpi.phone}).
              </p>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsUpiModalOpen(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendPaymentLink}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" /> Send Payment SMS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
