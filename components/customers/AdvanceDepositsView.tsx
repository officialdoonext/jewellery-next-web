'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Lock,
  Coins,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  FileCheck,
  Sparkles,
  QrCode,
  Plus,
  X,
  Search,
  Check,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Loader2,
  AlertCircle,
  ShoppingBag,
  Gem,
  BookOpen,
  Trash2,
  Eye,
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

export interface AdvanceDepositRecord {
  id: string;
  receipt_no: string;
  receipt_date: string;
  customer_name: string;
  phone: string;
  advance_amount: number;
  rate_locked: boolean;
  locked_gold_rate: number;
  equivalent_grams: number;
  metal_type?: string;
  metal_advance_grams?: number;
  expiry_date: string;
  intended_jewellery: string;
  payment_mode: string;
  status: 'ACTIVE' | 'REDEEMED' | 'REFUNDED';
  created_at?: string;
}

const SAMPLE_ADVANCES: Omit<AdvanceDepositRecord, 'id'>[] = [
  {
    receipt_no: 'ADV-2026-019',
    receipt_date: '2026-09-15',
    customer_name: 'Lalitha Devi',
    phone: '+91 98865 44321',
    advance_amount: 150000.0,
    rate_locked: true,
    locked_gold_rate: 7850.0,
    equivalent_grams: 19.108,
    metal_type: '22K Gold (916)',
    metal_advance_grams: 0,
    expiry_date: '2026-12-15',
    intended_jewellery: 'Bridal Haar Set for Wedding in Dec 2026',
    payment_mode: 'RTGS Bank Transfer',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  },
  {
    receipt_no: 'ADV-2026-020',
    receipt_date: '2026-10-01',
    customer_name: 'Sridevi Rao',
    phone: '+91 98451 23456',
    advance_amount: 500000.0,
    rate_locked: true,
    locked_gold_rate: 7820.0,
    equivalent_grams: 63.938,
    metal_type: '22K Gold (916)',
    metal_advance_grams: 10.5,
    expiry_date: '2027-01-01',
    intended_jewellery: 'Custom Antique Temple Vaddanam & Choker Set',
    payment_mode: 'Cheque Clearance',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  },
  {
    receipt_no: 'ADV-2026-021',
    receipt_date: '2026-10-18',
    customer_name: 'Meera Nambiar',
    phone: '+91 94471 67890',
    advance_amount: 250000.0,
    rate_locked: false,
    locked_gold_rate: 0.0,
    equivalent_grams: 0.0,
    metal_type: '22K Gold (916)',
    metal_advance_grams: 0,
    expiry_date: '2027-04-18',
    intended_jewellery: 'Traditional Kerala Kasu Mala & Bangles',
    payment_mode: 'UPI (Google Pay)',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  },
  {
    receipt_no: 'ADV-2026-022',
    receipt_date: '2026-08-20',
    customer_name: 'Ananya Reddy',
    phone: '+91 91008 34567',
    advance_amount: 300000.0,
    rate_locked: true,
    locked_gold_rate: 7780.0,
    equivalent_grams: 38.56,
    metal_type: '18K Diamond Jewellery',
    metal_advance_grams: 0,
    expiry_date: '2026-11-20',
    intended_jewellery: 'Solitaire Diamond Engagement Set',
    payment_mode: 'Credit Card (Full)',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  },
];

export function CustomersAdvanceDepositsView() {
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [advances, setAdvances] = useState<AdvanceDepositRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [rateLockFilter, setRateLockFilter] = useState<'ALL' | 'LOCKED' | 'FLOATING'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'REDEEMED' | 'REFUNDED'>('ALL');

  // Modals & Drawers
  const [isNewAdvanceOpen, setIsNewAdvanceOpen] = useState(false);
  const [selectedAdvanceForVoucher, setSelectedAdvanceForVoucher] = useState<AdvanceDepositRecord | null>(null);
  const [selectedAdvanceForRedeem, setSelectedAdvanceForRedeem] = useState<AdvanceDepositRecord | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // New Advance form state
  const [formCustName, setFormCustName] = useState('');
  const [formCustPhone, setFormCustPhone] = useState('');
  const [formAmount, setFormAmount] = useState('100000');
  const [formRateLocked, setFormRateLocked] = useState(true);
  const [formGoldRate, setFormGoldRate] = useState('7850');
  const [formMetalType, setFormMetalType] = useState('22K Gold (916)');
  const [formMetalAdvance, setFormMetalAdvance] = useState('0');
  const [formValidityDays, setFormValidityDays] = useState('90');
  const [formPaymentMode, setFormPaymentMode] = useState('Bank Transfer');
  const [formJewelleryType, setFormJewelleryType] = useState('Bridal Wedding Jewellery Set');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const fetchAdvances = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'customers_advance_deposits'));
      const list: AdvanceDepositRecord[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<AdvanceDepositRecord, 'id'>) });
      });
      setAdvances(list);
    } catch (err: any) {
      console.error('Error fetching advance deposits:', err);
      showToast('error', err.message || 'Failed to fetch advance deposits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvances();
  }, []);

  const handleSeedSamples = async () => {
    try {
      setSaving(true);
      const added: AdvanceDepositRecord[] = [];
      for (const item of SAMPLE_ADVANCES) {
        const docRef = await addDoc(collection(db, 'customers_advance_deposits'), item);
        added.push({ id: docRef.id, ...item });
      }
      setAdvances((prev) => [...added, ...prev]);
      showToast('success', `${added.length} sample advance deposits inserted into Firestore.`);
    } catch (err: any) {
      console.error('Error seeding advances:', err);
      showToast('error', err.message || 'Failed to seed sample advance deposits');
    } finally {
      setSaving(false);
    }
  };

  // Dynamic calculations
  const calculatedGrams = useMemo(() => {
    if (!formRateLocked) return 0;
    const amt = parseFloat(formAmount) || 0;
    const rate = parseFloat(formGoldRate) || 1;
    return rate > 0 ? +(amt / rate).toFixed(3) : 0;
  }, [formAmount, formGoldRate, formRateLocked]);

  const handleCreateAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustName.trim() || !formCustPhone.trim()) return;

    try {
      setSaving(true);
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + (parseInt(formValidityDays) || 90));
      const randNo = Math.floor(100 + Math.random() * 900);
      const receiptCode = `ADV-2026-${randNo}`;

      const newAdv: Omit<AdvanceDepositRecord, 'id'> = {
        receipt_no: receiptCode,
        receipt_date: new Date().toISOString().split('T')[0],
        customer_name: formCustName.trim(),
        phone: formCustPhone.trim(),
        advance_amount: parseFloat(formAmount) || 50000,
        rate_locked: formRateLocked,
        locked_gold_rate: formRateLocked ? parseFloat(formGoldRate) || 7850 : 0,
        equivalent_grams: calculatedGrams,
        metal_type: formMetalType,
        metal_advance_grams: parseFloat(formMetalAdvance) || 0,
        expiry_date: expiry.toISOString().split('T')[0],
        intended_jewellery: formJewelleryType,
        payment_mode: formPaymentMode,
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'customers_advance_deposits'), newAdv);
      setAdvances((prev) => [{ id: docRef.id, ...newAdv }, ...prev]);
      setIsNewAdvanceOpen(false);
      showToast('success', `Advance deposit voucher ${receiptCode} created for ₹${newAdv.advance_amount.toLocaleString('en-IN')}.`);

      // Reset form
      setFormCustName('');
      setFormCustPhone('');
      setFormMetalAdvance('0');
    } catch (err: any) {
      console.error('Error adding advance deposit:', err);
      showToast('error', err.message || 'Failed to save advance deposit');
    } finally {
      setSaving(false);
    }
  };

  const handleRedeemAdvance = async (adv: AdvanceDepositRecord) => {
    try {
      setSaving(true);
      await updateDoc(doc(db, 'customers_advance_deposits', adv.id), { status: 'REDEEMED' });
      setAdvances((prev) =>
        prev.map((a) => (a.id === adv.id ? { ...a, status: 'REDEEMED' as const } : a))
      );
      setSelectedAdvanceForRedeem(null);
      showToast('success', `Advance ${adv.receipt_no} marked as REDEEMED against billing.`);
    } catch (err: any) {
      console.error('Error redeeming advance:', err);
      showToast('error', err.message || 'Failed to redeem advance deposit');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAdvance = async (id: string, receiptNo: string) => {
    if (!confirm(`Delete advance receipt "${receiptNo}"?`)) return;
    try {
      await deleteDoc(doc(db, 'customers_advance_deposits', id));
      setAdvances((prev) => prev.filter((a) => a.id !== id));
      if (selectedAdvanceForVoucher?.id === id) setSelectedAdvanceForVoucher(null);
      showToast('success', `Advance voucher "${receiptNo}" deleted.`);
    } catch (err: any) {
      console.error('Error deleting advance:', err);
      showToast('error', err.message || 'Failed to delete advance deposit');
    }
  };

  const filteredAdvances = useMemo(() => {
    return advances.filter((adv) => {
      if (rateLockFilter === 'LOCKED' && !adv.rate_locked) return false;
      if (rateLockFilter === 'FLOATING' && adv.rate_locked) return false;
      if (statusFilter !== 'ALL' && adv.status !== statusFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const mRec = adv.receipt_no?.toLowerCase().includes(q);
        const mCust = adv.customer_name?.toLowerCase().includes(q);
        const mPhone = adv.phone?.toLowerCase().includes(q);
        const mItem = adv.intended_jewellery?.toLowerCase().includes(q);
        if (!mRec && !mCust && !mPhone && !mItem) return false;
      }
      return true;
    });
  }, [advances, rateLockFilter, statusFilter, searchQuery]);

  // Derived KPI metrics
  const activeAdvances = advances.filter((a) => a.status === 'ACTIVE');
  const totalActiveRupees = activeAdvances.reduce((sum, a) => sum + (a.advance_amount || 0), 0);
  const lockedAdvances = advances.filter((a) => a.status === 'ACTIVE' && a.rate_locked);
  const totalLockedRupees = lockedAdvances.reduce((sum, a) => sum + (a.advance_amount || 0), 0);
  const totalLockedGrams = lockedAdvances.reduce((sum, a) => sum + (a.equivalent_grams || 0), 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="customers_advance_deposits" />
      <ActionToolbar
        filterPlaceholder="Filter by receipt #, customer name, phone, or jewellery..."
        insertLabel="New Advance Deposit"
        onInsertClick={() => setIsNewAdvanceOpen(true)}
        onRefresh={fetchAdvances}
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
            className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs"
          >
            Advance Deposits
          </Link>
          <Link
            href="/customers/outstanding-balances"
            className="px-2.5 py-1 rounded-md text-xs font-medium text-neutral-600 hover:text-emerald-700 hover:bg-neutral-100 transition-colors"
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
            href="/sales/billing-pos"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-emerald-700 hover:underline"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" /> Apply in POS Billing
          </Link>
          <span className="text-neutral-300">•</span>
          <Link
            href="/orders-services/custom-orders"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-emerald-700 hover:underline"
          >
            <Gem className="w-3.5 h-3.5 text-emerald-600" /> Custom Orders
          </Link>
          <span className="text-neutral-300">•</span>
          <Link
            href="/finance/receivables"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-emerald-700 hover:underline"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" /> Receivables
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

        {/* KPI Metrics Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Active Advances</span>
                <Coins className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
                ) : (
                  `₹ ${totalActiveRupees.toLocaleString('en-IN')}`
                )}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                {activeAdvances.length} active patron advance deposits
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Rate Locked Bookings</span>
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700 font-mono">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
                ) : (
                  `₹ ${totalLockedRupees.toLocaleString('en-IN')}`
                )}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                Protected against gold market spikes
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Locked Gold Equivalent</span>
                <Coins className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-amber-700 font-mono">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
                ) : (
                  `${totalLockedGrams.toFixed(3)} g`
                )}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Pure metal backing reservation
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-blue-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">GST Compliance Status</span>
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">
                100% Compliant
              </div>
              <div className="text-[11px] text-blue-600 mt-1 font-mono">
                Receipt vouchers with PAN validation
              </div>
            </div>
          </div>

          {/* Quick Filter Bar */}
          <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by receipt #, customer, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-white border border-[#e2e8f0] rounded-md text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-emerald-500 w-64"
                />
              </div>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Rate Lock:</span>
                <select
                  value={rateLockFilter}
                  onChange={(e) => setRateLockFilter(e.target.value as any)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Advance Types</option>
                  <option value="LOCKED">Rate-Locked Only</option>
                  <option value="FLOATING">Floating Day Rate</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active Advances</option>
                  <option value="REDEEMED">Redeemed Against Bill</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchAdvances}
                className="p-1.5 rounded-md border border-[#e2e8f0] bg-white text-neutral-600 hover:text-emerald-700 hover:bg-neutral-50 transition-colors"
                title="Refresh from Firestore"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsNewAdvanceOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                New Advance Deposit
              </button>
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
                  Advance Deposits ({filteredAdvances.length})
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
                firestore: customers_advance_deposits • 13 fields
              </div>
            </div>

            {/* Table Content: Data Tab */}
            {activeTab === 'data' && (
              <div className="overflow-x-auto flex-1">
                {loading ? (
                  <div className="flex flex-col items-center justify-center p-12 text-neutral-400">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
                    <span className="text-xs font-medium text-neutral-600">Connecting to Advance Deposits Ledger...</span>
                  </div>
                ) : filteredAdvances.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-medium text-neutral-900 mb-1">No Advance Deposits Found</h4>
                    <p className="text-xs text-neutral-500 max-w-sm mb-4">
                      {advances.length === 0
                        ? 'No patron advance deposits recorded in Firestore. Create a new advance deposit voucher or insert sample records.'
                        : 'No advances match the current filter criteria.'}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsNewAdvanceOpen(true)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Create Advance Voucher
                      </button>
                      {advances.length === 0 && (
                        <button
                          onClick={handleSeedSamples}
                          disabled={saving}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-300 transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
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
                          <span className="text-neutral-800">receipt_no</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">customer</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">advance_amount</span>
                          <span className="text-neutral-400 font-normal text-[10px] ml-1">inr</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                          <span className="text-neutral-800">rate_locked</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">locked_rate</span>
                          <span className="text-neutral-400 font-normal text-[10px] ml-1">inr/g</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">equiv_gold</span>
                          <span className="text-neutral-400 font-normal text-[10px] ml-1">g</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">expiry_date</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                          <span className="text-neutral-800">status</span>
                        </th>
                        <th className="px-3.5 py-2 font-medium whitespace-nowrap text-center">
                          <span className="text-neutral-800">actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {filteredAdvances.map((row) => (
                        <tr key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                          <td className="px-3 py-2 text-center border-r border-[#e5e7eb]">
                            <input type="checkbox" className="rounded border-neutral-300 text-emerald-600 focus:ring-0" />
                          </td>
                          <td className="px-3.5 py-2 font-mono text-emerald-700 font-medium border-r border-[#e5e7eb] whitespace-nowrap">
                            {row.receipt_no}
                            <span className="text-[10px] text-neutral-400 block font-normal">{row.receipt_date}</span>
                          </td>
                          <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                            <div className="font-medium text-neutral-900">{row.customer_name}</div>
                            <span className="text-[10px] text-neutral-400 font-mono block">{row.phone}</span>
                          </td>
                          <td className="px-3.5 py-2 font-mono text-right font-medium text-neutral-900 border-r border-[#e5e7eb] whitespace-nowrap">
                            ₹ {(row.advance_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-3.5 py-2 text-center border-r border-[#e5e7eb] whitespace-nowrap">
                            {row.rate_locked ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Lock className="w-3 h-3 text-emerald-600" /> LOCKED
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-300">
                                FLOATING
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-2 font-mono text-right text-neutral-700 border-r border-[#e5e7eb] whitespace-nowrap">
                            {row.rate_locked ? `₹ ${row.locked_gold_rate.toLocaleString('en-IN')}` : '—'}
                          </td>
                          <td className="px-3.5 py-2 font-mono text-right text-amber-700 font-medium border-r border-[#e5e7eb] whitespace-nowrap">
                            {row.rate_locked ? `${(row.equivalent_grams || 0).toFixed(3)} g` : '—'}
                          </td>
                          <td className="px-3.5 py-2 font-mono text-neutral-600 border-r border-[#e5e7eb] whitespace-nowrap">
                            {row.expiry_date}
                          </td>
                          <td className="px-3.5 py-2 text-center border-r border-[#e5e7eb] whitespace-nowrap">
                            {row.status === 'ACTIVE' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                                ACTIVE
                              </span>
                            )}
                            {row.status === 'REDEEMED' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono bg-blue-50 text-blue-700 border border-blue-200">
                                REDEEMED
                              </span>
                            )}
                            {row.status === 'REFUNDED' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono bg-neutral-100 text-neutral-600 border border-neutral-300">
                                REFUNDED
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-2 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedAdvanceForVoucher(row)}
                                className="p-1 hover:bg-neutral-100 rounded text-neutral-600 hover:text-emerald-700 transition-colors"
                                title="Print Rate-Lock Voucher"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              {row.status === 'ACTIVE' && (
                                <div className="flex items-center gap-1">
                                  <Link
                                    href={`/sales/billing-pos?advance=${row.receipt_no}&customer=${encodeURIComponent(row.customer_name)}&amount=${row.advance_amount}`}
                                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                                    title="Apply directly to POS Bill"
                                  >
                                    Apply Bill
                                  </Link>
                                  <button
                                    onClick={() => setSelectedAdvanceForRedeem(row)}
                                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-300 transition-colors"
                                  >
                                    Redeem
                                  </button>
                                </div>
                              )}
                              <button
                                onClick={() => handleDeleteAdvance(row.id, row.receipt_no)}
                                className="p-1 hover:bg-red-50 rounded text-neutral-400 hover:text-red-600 transition-colors"
                                title="Delete Advance"
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
                  collection: <span className="text-amber-400">&quot;customers_advance_deposits&quot;</span>
                  <br />
                  document: &#123;
                  <br />
                  &nbsp;&nbsp;id: <span className="text-blue-300">auto-generated-id</span>,
                  <br />
                  &nbsp;&nbsp;receipt_no: <span className="text-blue-300">string</span> (ADV-2026-xxx),
                  <br />
                  &nbsp;&nbsp;customer_name: <span className="text-blue-300">string</span>,
                  <br />
                  &nbsp;&nbsp;phone: <span className="text-blue-300">string</span>,
                  <br />
                  &nbsp;&nbsp;advance_amount: <span className="text-blue-300">number</span>,
                  <br />
                  &nbsp;&nbsp;rate_locked: <span className="text-blue-300">boolean</span>,
                  <br />
                  &nbsp;&nbsp;locked_gold_rate: <span className="text-blue-300">number</span>,
                  <br />
                  &nbsp;&nbsp;equivalent_grams: <span className="text-blue-300">number</span>,
                  <br />
                  &nbsp;&nbsp;metal_type: <span className="text-blue-300">string</span>,
                  <br />
                  &nbsp;&nbsp;intended_jewellery: <span className="text-blue-300">string</span>,
                  <br />
                  &nbsp;&nbsp;payment_mode: <span className="text-blue-300">string</span>,
                  <br />
                  &nbsp;&nbsp;status: <span className="text-emerald-300">&apos;ACTIVE&apos; | &apos;REDEEMED&apos; | &apos;REFUNDED&apos;</span>,
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

      {/* New Advance Deposit Drawer */}
      {isNewAdvanceOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-[#e2e8f0] animate-in slide-in-from-right duration-200">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div>
                <h3 className="text-sm font-medium text-neutral-900">New Advance Deposit Voucher</h3>
                <p className="text-[11px] text-neutral-500">Record customer advance booking deposit and lock gold rates</p>
              </div>
              <button
                onClick={() => setIsNewAdvanceOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAdvance} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-xs">
              {/* Patron Info */}
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Patron Information
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lalitha Devi"
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
                      placeholder="+91 98865 44321"
                      value={formCustPhone}
                      onChange={(e) => setFormCustPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Intended Jewellery Order / Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Bridal Antique Haram (Wedding in Dec 2026)"
                    value={formJewelleryType}
                    onChange={(e) => setFormJewelleryType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                  />
                </div>
              </div>

              {/* Deposit & Rate-Freeze Section */}
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Advance Monetary Deposit</span>
                  <span className="text-amber-600 font-mono text-[10px]">Gold Price Hedge</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Advance Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white text-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Payment Mode</label>
                    <select
                      value={formPaymentMode}
                      onChange={(e) => setFormPaymentMode(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                    >
                      <option value="Bank Transfer">Bank Transfer (RTGS / NEFT)</option>
                      <option value="Cheque">Cheque Clearance</option>
                      <option value="UPI">UPI (Google Pay / PhonePe)</option>
                      <option value="Credit Card">Credit / Debit Card</option>
                      <option value="Cash">Cash (Subject to ₹2L KYC)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Metal Standard</label>
                    <select
                      value={formMetalType}
                      onChange={(e) => setFormMetalType(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                    >
                      <option value="22K Gold (916)">22K Gold (916 Hallmarked)</option>
                      <option value="24K Bullion (999)">24K Bullion (999 Fine Gold)</option>
                      <option value="18K Diamond Jewellery">18K Diamond Jewellery</option>
                      <option value="Silver 925">Silver 925 Fine</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Physical Metal Advance (g)</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="0.000"
                      value={formMetalAdvance}
                      onChange={(e) => setFormMetalAdvance(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white text-neutral-900"
                    />
                  </div>
                </div>

                {/* Rate lock toggle */}
                <div className="p-3 rounded bg-amber-50/50 border border-amber-200/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-neutral-900">Rate-Freeze Agreement (Lock Today&apos;s Rate)</span>
                      <p className="text-[11px] text-neutral-500">Shields patron against gold rate increases until delivery</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formRateLocked}
                      onChange={(e) => setFormRateLocked(e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300 text-amber-600 focus:ring-0"
                    />
                  </div>

                  {formRateLocked && (
                    <div className="pt-2 border-t border-amber-200/60 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-xs font-medium text-neutral-700 mb-1">Locked Rate per Gram (₹)</label>
                        <input
                          type="number"
                          value={formGoldRate}
                          onChange={(e) => setFormGoldRate(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white text-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-700 mb-1">Lock Validity (Days)</label>
                        <select
                          value={formValidityDays}
                          onChange={(e) => setFormValidityDays(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                        >
                          <option value="30">30 Days</option>
                          <option value="60">60 Days</option>
                          <option value="90">90 Days (Standard Bridal)</option>
                          <option value="180">180 Days (Half Year)</option>
                        </select>
                      </div>

                      <div className="col-span-2 p-2.5 bg-white rounded border border-amber-200 text-neutral-800 text-xs font-mono">
                        Gold Grams Accrued: <span className="font-medium text-amber-700">{calculatedGrams.toFixed(3)} g</span> (22K 916)
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewAdvanceOpen(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-2xs disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Issue Advance Voucher in Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Advance Voucher Print Modal */}
      {selectedAdvanceForVoucher && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl border border-amber-200 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-amber-100 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-medium text-neutral-900">
                  Advance Booking Voucher: {selectedAdvanceForVoucher.receipt_no}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAdvanceForVoucher(null)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="border border-amber-200 rounded-lg p-4 bg-[#fffdf9] space-y-3">
                <div className="flex justify-between items-start border-b border-amber-100 pb-2">
                  <div>
                    <span className="text-[10px] text-amber-700 uppercase font-mono tracking-wider">OFFICIAL RATE-LOCK VOUCHER</span>
                    <h4 className="text-sm font-medium text-neutral-900 mt-0.5">{selectedAdvanceForVoucher.customer_name}</h4>
                    <span className="text-neutral-500 font-mono text-[11px]">{selectedAdvanceForVoucher.phone}</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-amber-200">
                    <QrCode className="w-8 h-8 text-neutral-900" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-neutral-700 text-[11px] font-mono">
                  <div>
                    <span className="text-neutral-400 block font-normal">Advance Paid:</span>
                    <span className="font-medium text-neutral-900 text-xs">
                      ₹ {(selectedAdvanceForVoucher.advance_amount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block font-normal">Booking Type:</span>
                    <span className="font-medium text-amber-700 text-xs">
                      {selectedAdvanceForVoucher.rate_locked
                        ? `Locked @ ₹${selectedAdvanceForVoucher.locked_gold_rate}/g`
                        : 'Floating Day Rate'}
                    </span>
                  </div>
                  {selectedAdvanceForVoucher.rate_locked && (
                    <div>
                      <span className="text-neutral-400 block font-normal">Equivalent Gold Weight:</span>
                      <span className="font-medium text-neutral-900 text-xs">
                        {(selectedAdvanceForVoucher.equivalent_grams || 0).toFixed(3)} g (22K)
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-neutral-400 block font-normal">Lock Expiry Date:</span>
                    <span className="font-medium text-neutral-900 text-xs">
                      {selectedAdvanceForVoucher.expiry_date}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-100 text-[10px] text-neutral-500 leading-relaxed">
                  Note: This rate-freeze deposit legally protects the customer against upward revisions in 22K 916 gold bullion rates up to {selectedAdvanceForVoucher.expiry_date}.
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                <Link
                  href={`/sales/billing-pos?advance=${selectedAdvanceForVoucher.receipt_no}&customer=${encodeURIComponent(selectedAdvanceForVoucher.customer_name)}&amount=${selectedAdvanceForVoucher.advance_amount}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" /> Apply in POS Bill
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Voucher
                  </button>
                  <button
                    onClick={() => setSelectedAdvanceForVoucher(null)}
                    className="px-4 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Redeem Advance Modal */}
      {selectedAdvanceForRedeem && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-2xl border border-[#e2e8f0] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">Redeem Advance Deposit</h3>
              </div>
              <button
                onClick={() => setSelectedAdvanceForRedeem(null)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-neutral-700 leading-relaxed">
                Apply advance deposit <span className="font-mono font-medium text-neutral-900">{selectedAdvanceForRedeem.receipt_no}</span> of ₹{selectedAdvanceForRedeem.advance_amount.toLocaleString('en-IN')} for {selectedAdvanceForRedeem.customer_name} against their jewellery bill.
              </p>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setSelectedAdvanceForRedeem(null)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRedeemAdvance(selectedAdvanceForRedeem)}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Confirm Redemption
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
