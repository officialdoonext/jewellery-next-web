'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Coins,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Printer,
  CreditCard,
  FileText,
  Plus,
  X,
  Search,
  Check,
  ChevronRight,
  TrendingUp,
  Award,
  AlertCircle,
  Eye,
  MessageCircle,
  Trash2,
  Loader2,
  ShoppingBag,
  Gem,
  BookOpen,
  ArrowRight,
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

export interface SchemeAccountRecord {
  id: string;
  scheme_account_no: string;
  customer_name: string;
  phone: string;
  scheme_name: string;
  monthly_installment: number;
  months_paid: number;
  total_months: number;
  total_paid_amount: number;
  accrued_gold_weight_g: number;
  next_due_date: string;
  start_date: string;
  auto_debit: boolean;
  nominee_name: string;
  nominee_relationship: string;
  benefit_type: string;
  status: 'ACTIVE' | 'MATURED' | 'CLOSED';
  created_at?: string;
}

const SAMPLE_SCHEMES: Omit<SchemeAccountRecord, 'id'>[] = [
  {
    scheme_account_no: 'SCH-2026-901',
    customer_name: 'Sridevi Rao',
    phone: '+91 98451 23456',
    scheme_name: '11+1 Suvarna Nidhi',
    monthly_installment: 25000.0,
    months_paid: 8,
    total_months: 11,
    total_paid_amount: 200000.0,
    accrued_gold_weight_g: 25.475,
    next_due_date: '2026-11-10',
    start_date: '2026-03-10',
    auto_debit: true,
    nominee_name: 'K. Rajesh Rao',
    nominee_relationship: 'Spouse',
    benefit_type: '12th Month Free Bonus (₹25,000 value)',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  },
  {
    scheme_account_no: 'SCH-2026-844',
    customer_name: 'Venkat Raman',
    phone: '+91 97412 89012',
    scheme_name: '10-Month Bullion Weight Accumulator',
    monthly_installment: 15000.0,
    months_paid: 5,
    total_months: 10,
    total_paid_amount: 75000.0,
    accrued_gold_weight_g: 9.554,
    next_due_date: '2026-11-05',
    start_date: '2026-06-05',
    auto_debit: true,
    nominee_name: 'Gayatri Raman',
    nominee_relationship: 'Spouse',
    benefit_type: '0% Making Charges up to 18% at maturity',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  },
  {
    scheme_account_no: 'SCH-2026-712',
    customer_name: 'Ananya Reddy',
    phone: '+91 91008 34567',
    scheme_name: '11+1 Suvarna Nidhi',
    monthly_installment: 10000.0,
    months_paid: 11,
    total_months: 11,
    total_paid_amount: 110000.0,
    accrued_gold_weight_g: 14.012,
    next_due_date: 'Matured (Ready to Redeem)',
    start_date: '2025-11-15',
    auto_debit: false,
    nominee_name: 'K. Vikram Reddy',
    nominee_relationship: 'Father',
    benefit_type: '1 Month Bonus (₹10,000) + 100% Making Waiver',
    status: 'MATURED',
    created_at: new Date().toISOString(),
  },
  {
    scheme_account_no: 'SCH-2026-620',
    customer_name: 'Dr. Mohan Krishna',
    phone: '+91 94401 55667',
    scheme_name: '11+1 Suvarna Nidhi',
    monthly_installment: 25000.0,
    months_paid: 9,
    total_months: 11,
    total_paid_amount: 225000.0,
    accrued_gold_weight_g: 28.662,
    next_due_date: '2026-11-14',
    start_date: '2026-02-14',
    auto_debit: true,
    nominee_name: 'Padmavathi Krishna',
    nominee_relationship: 'Spouse',
    benefit_type: '12th Month Free Bonus (₹25,000 value)',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  },
];

export function CustomersSchemesView() {
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [schemes, setSchemes] = useState<SchemeAccountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'MATURED' | 'CLOSED'>('ALL');

  // Modals & Drawers
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [selectedSchemeForPassbook, setSelectedSchemeForPassbook] = useState<SchemeAccountRecord | null>(null);
  const [selectedSchemeForPay, setSelectedSchemeForPay] = useState<SchemeAccountRecord | null>(null);
  const [selectedSchemeForRedeem, setSelectedSchemeForRedeem] = useState<SchemeAccountRecord | null>(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Enroll Form State
  const [formPlan, setFormPlan] = useState('11+1 Suvarna Nidhi');
  const [formCustName, setFormCustName] = useState('');
  const [formCustPhone, setFormCustPhone] = useState('');
  const [formEmiAmount, setFormEmiAmount] = useState('10000');
  const [formGoldRate, setFormGoldRate] = useState('7850');
  const [formAutoDebit, setFormAutoDebit] = useState(true);
  const [formNomineeName, setFormNomineeName] = useState('');
  const [formNomineeRel, setFormNomineeRel] = useState('Spouse');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'customers_schemes'));
      const list: SchemeAccountRecord[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<SchemeAccountRecord, 'id'>) });
      });
      setSchemes(list);
    } catch (err: any) {
      console.error('Error fetching customer schemes:', err);
      showToast('error', err.message || 'Failed to fetch customer schemes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleSeedSamples = async () => {
    try {
      setSaving(true);
      const added: SchemeAccountRecord[] = [];
      for (const item of SAMPLE_SCHEMES) {
        const docRef = await addDoc(collection(db, 'customers_schemes'), item);
        added.push({ id: docRef.id, ...item });
      }
      setSchemes((prev) => [...added, ...prev]);
      showToast('success', `${added.length} sample scheme accounts created in Firestore.`);
    } catch (err: any) {
      console.error('Error seeding schemes:', err);
      showToast('error', err.message || 'Failed to seed sample schemes');
    } finally {
      setSaving(false);
    }
  };

  // Dynamic calculations for enrollment modal
  const emiNumber = parseFloat(formEmiAmount) || 0;
  const rateNumber = parseFloat(formGoldRate) || 7850;
  const planTotalMonths = formPlan.includes('10-Month') ? 10 : formPlan.includes('5 Months') ? 5 : 11;
  const totalCustomerInvestment = emiNumber * planTotalMonths;
  const bonusBenefit = formPlan.includes('11+1') ? emiNumber : 0;
  const estimatedMaturityValue = totalCustomerInvestment + bonusBenefit;
  const estimatedFirstMonthGrams = rateNumber > 0 ? +(emiNumber / rateNumber).toFixed(3) : 0;
  const totalEstimatedGrams = rateNumber > 0 ? +(estimatedMaturityValue / rateNumber).toFixed(3) : 0;

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustName.trim() || !formCustPhone.trim()) return;

    try {
      setSaving(true);
      const emi = emiNumber || 5000;
      const rate = rateNumber || 7850;
      const firstGrams = +(emi / rate).toFixed(3);
      const randomDigits = Math.floor(100 + Math.random() * 900);
      const generatedAccNo = `SCH-2026-${randomDigits}`;

      const newAcc: Omit<SchemeAccountRecord, 'id'> = {
        scheme_account_no: generatedAccNo,
        customer_name: formCustName.trim(),
        phone: formCustPhone.trim(),
        scheme_name: formPlan,
        monthly_installment: emi,
        months_paid: 1,
        total_months: planTotalMonths,
        total_paid_amount: emi,
        accrued_gold_weight_g: firstGrams,
        next_due_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
        start_date: new Date().toISOString().split('T')[0],
        auto_debit: formAutoDebit,
        nominee_name: formNomineeName.trim() || 'Family Nominee',
        nominee_relationship: formNomineeRel,
        benefit_type: formPlan.includes('11+1')
          ? `12th Month Free Bonus (₹${emi.toLocaleString('en-IN')} value)`
          : '0% Making Charges up to 18% at maturity',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'customers_schemes'), newAcc);
      setSchemes((prev) => [{ id: docRef.id, ...newAcc }, ...prev]);
      setIsEnrollOpen(false);
      showToast('success', `Scheme account "${generatedAccNo}" enrolled for ${formCustName}.`);

      // Reset form
      setFormCustName('');
      setFormCustPhone('');
      setFormNomineeName('');
    } catch (err: any) {
      console.error('Error adding scheme:', err);
      showToast('error', err.message || 'Failed to enroll scheme');
    } finally {
      setSaving(false);
    }
  };

  const handlePayInstallment = async (sch: SchemeAccountRecord) => {
    try {
      setSaving(true);
      const newPaidMonths = sch.months_paid + 1;
      const newTotalPaid = sch.total_paid_amount + sch.monthly_installment;
      const additionalGrams = +(sch.monthly_installment / 7850).toFixed(3);
      const isMatured = newPaidMonths >= sch.total_months;
      const updatedData = {
        months_paid: newPaidMonths,
        total_paid_amount: newTotalPaid,
        accrued_gold_weight_g: +(sch.accrued_gold_weight_g + additionalGrams).toFixed(3),
        status: isMatured ? ('MATURED' as const) : sch.status,
        next_due_date: isMatured
          ? 'Matured (Ready to Redeem)'
          : new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      };

      await updateDoc(doc(db, 'customers_schemes', sch.id), updatedData);
      setSchemes((prev) =>
        prev.map((s) => (s.id === sch.id ? { ...s, ...updatedData } : s))
      );
      setSelectedSchemeForPay(null);
      showToast(
        'success',
        `Installment #${newPaidMonths} of ₹${sch.monthly_installment.toLocaleString('en-IN')} recorded.`
      );
    } catch (err: any) {
      console.error('Error paying installment:', err);
      showToast('error', err.message || 'Failed to record installment');
    } finally {
      setSaving(false);
    }
  };

  const handleRedeemScheme = async (sch: SchemeAccountRecord) => {
    try {
      setSaving(true);
      await updateDoc(doc(db, 'customers_schemes', sch.id), { status: 'CLOSED' });
      setSchemes((prev) =>
        prev.map((s) => (s.id === sch.id ? { ...s, status: 'CLOSED' as const } : s))
      );
      setSelectedSchemeForRedeem(null);
      showToast('success', `Scheme account ${sch.scheme_account_no} marked as REDEEMED / CLOSED.`);
    } catch (err: any) {
      console.error('Error redeeming scheme:', err);
      showToast('error', err.message || 'Failed to redeem scheme');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteScheme = async (id: string, accNo: string) => {
    if (!confirm(`Delete scheme account "${accNo}"? This action cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'customers_schemes', id));
      setSchemes((prev) => prev.filter((s) => s.id !== id));
      if (selectedSchemeForPassbook?.id === id) setSelectedSchemeForPassbook(null);
      showToast('success', `Scheme account "${accNo}" deleted.`);
    } catch (err: any) {
      console.error('Error deleting scheme:', err);
      showToast('error', err.message || 'Failed to delete scheme account');
    }
  };

  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const mAcc = s.scheme_account_no?.toLowerCase().includes(q);
        const mCust = s.customer_name?.toLowerCase().includes(q);
        const mPhone = s.phone?.toLowerCase().includes(q);
        const mPlan = s.scheme_name?.toLowerCase().includes(q);
        if (!mAcc && !mCust && !mPhone && !mPlan) return false;
      }
      return true;
    });
  }, [schemes, statusFilter, searchQuery]);

  // Derived KPI metrics
  const activeCount = schemes.filter((s) => s.status === 'ACTIVE').length;
  const maturedCount = schemes.filter((s) => s.status === 'MATURED').length;
  const totalCollections = schemes.reduce((sum, s) => sum + (s.total_paid_amount || 0), 0);
  const totalGramsAccrued = schemes.reduce((sum, s) => sum + (s.accrued_gold_weight_g || 0), 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="customers_schemes" />
      <ActionToolbar
        filterPlaceholder="Search schemes by account #, customer, or plan..."
        insertLabel="Enroll New Gold Scheme"
        onInsertClick={() => setIsEnrollOpen(true)}
        onRefresh={fetchSchemes}
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
            className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs"
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
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" /> POS Billing
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
                <span className="text-[11px] font-medium uppercase tracking-wider">Active Scheme Accounts</span>
                <Coins className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-neutral-400" /> : `${activeCount} Accounts`}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Firestore Ledger
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Scheme Inflow</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700 font-mono">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
                ) : (
                  `₹ ${totalCollections.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                )}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Accumulated customer chit deposits
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Gold Grams Accrued</span>
                <Coins className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-amber-700 font-mono">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
                ) : (
                  `${totalGramsAccrued.toFixed(3)} g`
                )}
              </div>
              <div className="text-[11px] text-amber-600 mt-1 font-mono">
                Backed by 22K 916 pure gold
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-purple-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Matured Schemes</span>
                <Award className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-xl font-medium text-purple-800 font-mono">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-neutral-400" /> : `${maturedCount} Accounts`}
              </div>
              <div className="text-[11px] text-purple-600 mt-1 font-mono">
                Ready for jewellery redemption
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
                  placeholder="Filter by account #, customer, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-white border border-[#e2e8f0] rounded-md text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-emerald-500 w-64"
                />
              </div>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active Schemes</option>
                  <option value="MATURED">Matured (Ready)</option>
                  <option value="CLOSED">Closed / Redeemed</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchSchemes}
                className="p-1.5 rounded-md border border-[#e2e8f0] bg-white text-neutral-600 hover:text-emerald-700 hover:bg-neutral-50 transition-colors"
                title="Refresh from Firestore"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsEnrollOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Enroll New Scheme
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
                  Gold Schemes ({filteredSchemes.length})
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
                firestore: customers_schemes • 15 fields
              </div>
            </div>

            {/* Table Content: Data Tab */}
            {activeTab === 'data' && (
              <div className="overflow-x-auto flex-1">
                {loading ? (
                  <div className="flex flex-col items-center justify-center p-12 text-neutral-400">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
                    <span className="text-xs font-medium text-neutral-600">Connecting to Gold Schemes Ledger...</span>
                  </div>
                ) : filteredSchemes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                      <Coins className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-medium text-neutral-900 mb-1">No Gold Schemes Found</h4>
                    <p className="text-xs text-neutral-500 max-w-sm mb-4">
                      {schemes.length === 0
                        ? 'No gold saving schemes have been enrolled in Firestore. Create a new Suvarna Nidhi account or load sample accounts.'
                        : 'No schemes match your filter query. Adjust status or search keyword.'}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEnrollOpen(true)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        New Scheme Account
                      </button>
                      {schemes.length === 0 && (
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
                          <span className="text-neutral-800">scheme_account_no</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">customer</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">plan</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">monthly_emi</span>
                          <span className="text-neutral-400 font-normal text-[10px] ml-1">inr</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">progress</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">accrued_gold</span>
                          <span className="text-neutral-400 font-normal text-[10px] ml-1">g</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">next_due_date</span>
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
                      {filteredSchemes.map((row) => (
                        <tr key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                          <td className="px-3 py-2 text-center border-r border-[#e5e7eb]">
                            <input type="checkbox" className="rounded border-neutral-300 text-emerald-600 focus:ring-0" />
                          </td>
                          <td className="px-3.5 py-2 font-mono text-emerald-700 font-medium border-r border-[#e5e7eb] whitespace-nowrap">
                            {row.scheme_account_no}
                            {row.auto_debit && (
                              <span className="text-[10px] text-neutral-400 block font-normal">e-Mandate Active</span>
                            )}
                          </td>
                          <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                            <div className="font-medium text-neutral-900">{row.customer_name}</div>
                            <span className="text-[10px] text-neutral-400 font-mono block">{row.phone}</span>
                          </td>
                          <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-800">
                            {row.scheme_name}
                          </td>
                          <td className="px-3.5 py-2 font-mono text-right font-medium text-neutral-900 border-r border-[#e5e7eb] whitespace-nowrap">
                            ₹ {(row.monthly_installment || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap min-w-[120px]">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span>{row.months_paid}/{row.total_months} mo</span>
                              <span className="text-neutral-400 font-normal">
                                {Math.round((row.months_paid / (row.total_months || 1)) * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-amber-500 h-1.5 rounded-full"
                                style={{ width: `${Math.min(100, (row.months_paid / (row.total_months || 1)) * 100)}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-3.5 py-2 font-mono text-right text-amber-700 font-medium border-r border-[#e5e7eb] whitespace-nowrap">
                            {(row.accrued_gold_weight_g || 0).toFixed(3)} g
                          </td>
                          <td className="px-3.5 py-2 font-mono text-neutral-600 border-r border-[#e5e7eb] whitespace-nowrap">
                            {row.next_due_date}
                          </td>
                          <td className="px-3.5 py-2 text-center border-r border-[#e5e7eb] whitespace-nowrap">
                            {row.status === 'ACTIVE' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                                ACTIVE
                              </span>
                            )}
                            {row.status === 'MATURED' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono bg-amber-50 text-amber-700 border border-amber-200">
                                MATURED
                              </span>
                            )}
                            {row.status === 'CLOSED' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono bg-neutral-100 text-neutral-600 border border-neutral-300">
                                CLOSED
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-2 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedSchemeForPassbook(row)}
                                className="p-1 hover:bg-neutral-100 rounded text-neutral-600 hover:text-emerald-700 transition-colors"
                                title="Interactive Passbook"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {row.status === 'ACTIVE' && (
                                <button
                                  onClick={() => setSelectedSchemeForPay(row)}
                                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                                >
                                  Pay EMI
                                </button>
                              )}
                              {row.status === 'MATURED' && (
                                <div className="flex items-center gap-1">
                                  <Link
                                    href={`/sales/billing-pos?scheme=${row.scheme_account_no}&customer=${encodeURIComponent(row.customer_name)}`}
                                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                                    title="Redeem at POS Billing"
                                  >
                                    POS Bill
                                  </Link>
                                  <button
                                    onClick={() => setSelectedSchemeForRedeem(row)}
                                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-2xs"
                                  >
                                    Close
                                  </button>
                                </div>
                              )}
                              <button
                                onClick={() => handleDeleteScheme(row.id, row.scheme_account_no)}
                                className="p-1 hover:bg-red-50 rounded text-neutral-400 hover:text-red-600 transition-colors"
                                title="Delete Scheme"
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
                  collection: <span className="text-amber-400">&quot;customers_schemes&quot;</span>
                  <br />
                  document: &#123;
                  <br />
                  &nbsp;&nbsp;id: <span className="text-blue-300">auto-generated-id</span>,
                  <br />
                  &nbsp;&nbsp;scheme_account_no: <span className="text-blue-300">string</span> (Unique SCH-2026-xxx),
                  <br />
                  &nbsp;&nbsp;customer_name: <span className="text-blue-300">string</span>,
                  <br />
                  &nbsp;&nbsp;phone: <span className="text-blue-300">string</span>,
                  <br />
                  &nbsp;&nbsp;scheme_name: <span className="text-blue-300">string</span> (11+1 Suvarna Nidhi),
                  <br />
                  &nbsp;&nbsp;monthly_installment: <span className="text-blue-300">number</span>,
                  <br />
                  &nbsp;&nbsp;months_paid: <span className="text-blue-300">number</span>,
                  <br />
                  &nbsp;&nbsp;total_months: <span className="text-blue-300">number</span> (e.g. 11),
                  <br />
                  &nbsp;&nbsp;total_paid_amount: <span className="text-blue-300">number</span>,
                  <br />
                  &nbsp;&nbsp;accrued_gold_weight_g: <span className="text-blue-300">number</span>,
                  <br />
                  &nbsp;&nbsp;auto_debit: <span className="text-blue-300">boolean</span>,
                  <br />
                  &nbsp;&nbsp;nominee_name: <span className="text-blue-300">string</span>,
                  <br />
                  &nbsp;&nbsp;status: <span className="text-emerald-300">&apos;ACTIVE&apos; | &apos;MATURED&apos; | &apos;CLOSED&apos;</span>,
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

      {/* Enroll New Scheme Drawer */}
      {isEnrollOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-[#e2e8f0] animate-in slide-in-from-right duration-200">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div>
                <h3 className="text-sm font-medium text-neutral-900">Enroll New Gold Savings Scheme</h3>
                <p className="text-[11px] text-neutral-500">Suvarna Nidhi 11-month gold chit fund with bonus month</p>
              </div>
              <button
                onClick={() => setIsEnrollOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-xs">
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-500" /> Scheme Plan Selection
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Select Plan</label>
                  <select
                    value={formPlan}
                    onChange={(e) => setFormPlan(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                  >
                    <option value="11+1 Suvarna Nidhi">11+1 Suvarna Nidhi (Pay 11 Months + 1 Month Bonus)</option>
                    <option value="10-Month Bullion Weight Accumulator">10-Month Bullion Weight Accumulator (0% Making Charges)</option>
                    <option value="Festive Golden Scheme (5 Months)">Festive Golden Scheme (5 Months + 1g Gold Coin)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Monthly Installment (₹)</label>
                    <input
                      type="number"
                      value={formEmiAmount}
                      onChange={(e) => setFormEmiAmount(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white text-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Current Gold Rate (₹/g)</label>
                    <input
                      type="number"
                      value={formGoldRate}
                      onChange={(e) => setFormGoldRate(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white text-neutral-900"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-4 gap-2">
                  {['2000', '5000', '10000', '25000'].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setFormEmiAmount(amt)}
                      className={`py-1 rounded text-xs font-mono font-medium border transition-colors ${
                        formEmiAmount === amt
                          ? 'bg-amber-50 border-amber-500 text-amber-800'
                          : 'bg-white border-[#e2e8f0] text-neutral-700'
                      }`}
                    >
                      ₹{parseInt(amt).toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>

                {/* Dynamic Maturity Calculator Box */}
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded text-xs space-y-1 font-mono">
                  <div className="text-[11px] font-sans font-medium text-amber-900 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Dynamic Plan Projection:
                  </div>
                  <div className="flex justify-between text-neutral-700">
                    <span>Total Patron Investment ({planTotalMonths} mo):</span>
                    <span className="font-medium text-neutral-900">₹ {totalCustomerInvestment.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-neutral-700">
                    <span>Jeweller Bonus (1 Mo Free):</span>
                    <span className="font-medium text-emerald-700">+ ₹ {bonusBenefit.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-neutral-700 border-t border-amber-200 pt-1">
                    <span>Total Maturity Payout Value:</span>
                    <span className="font-medium text-neutral-900">₹ {estimatedMaturityValue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-neutral-700">
                    <span>Est. Accumulated Pure Gold:</span>
                    <span className="font-medium text-amber-800">{totalEstimatedGrams} g @ ₹{rateNumber}/g</span>
                  </div>
                </div>
              </div>

              {/* Patron & Nominee */}
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Patron & Nominee Details
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sridevi Rao"
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
                      placeholder="+91 98451 23456"
                      value={formCustPhone}
                      onChange={(e) => setFormCustPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Nominee Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. K. Rajesh Rao"
                      value={formNomineeName}
                      onChange={(e) => setFormNomineeName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Relationship</label>
                    <select
                      value={formNomineeRel}
                      onChange={(e) => setFormNomineeRel(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                    >
                      <option value="Spouse">Spouse</option>
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-[#e2e8f0]">
                  <div>
                    <span className="text-xs font-medium text-neutral-900">Enable UPI e-Mandate / Auto-Debit</span>
                    <p className="text-[11px] text-neutral-500">Automatic monthly debit from patron bank account</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formAutoDebit}
                    onChange={(e) => setFormAutoDebit(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-emerald-600 focus:ring-0"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEnrollOpen(false)}
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
                  Confirm Enrollment in Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Passbook Viewer Modal */}
      {selectedSchemeForPassbook && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-amber-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-amber-100 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-600" />
                <div>
                  <h3 className="text-sm font-medium text-neutral-900">
                    Official Gold Scheme Passbook: {selectedSchemeForPassbook.scheme_account_no}
                  </h3>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {selectedSchemeForPassbook.customer_name} • {selectedSchemeForPassbook.scheme_name}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedSchemeForPassbook(null)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs custom-scrollbar">
              {/* Passbook summary card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Total Cash Paid</span>
                  <span className="text-sm font-mono font-medium text-neutral-900 mt-0.5 block">
                    ₹ {(selectedSchemeForPassbook.total_paid_amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Accrued Gold</span>
                  <span className="text-sm font-mono font-medium text-amber-700 mt-0.5 block">
                    {(selectedSchemeForPassbook.accrued_gold_weight_g || 0).toFixed(3)} g
                  </span>
                </div>
                <div className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Months Paid</span>
                  <span className="text-sm font-mono font-medium text-neutral-900 mt-0.5 block">
                    {selectedSchemeForPassbook.months_paid} of {selectedSchemeForPassbook.total_months}
                  </span>
                </div>
                <div className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Jeweller Bonus</span>
                  <span className="text-sm font-medium text-emerald-700 mt-0.5 block">
                    +1 Month Free
                  </span>
                </div>
              </div>

              {/* Installment Schedule Table */}
              <div className="border border-[#e2e8f0] rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#f8fafc] border-b border-[#e2e8f0] text-neutral-600 font-mono text-[11px]">
                    <tr>
                      <th className="p-2 border-r border-[#e5e7eb] text-center">Month #</th>
                      <th className="p-2 border-r border-[#e5e7eb]">Due Date</th>
                      <th className="p-2 border-r border-[#e5e7eb] text-right">Amount (₹)</th>
                      <th className="p-2 border-r border-[#e5e7eb] text-right">Gold Rate (₹/g)</th>
                      <th className="p-2 border-r border-[#e5e7eb] text-right">Grams Accrued</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9] font-mono text-[11px]">
                    {Array.from({ length: selectedSchemeForPassbook.total_months || 11 }).map((_, i) => {
                      const monthNum = i + 1;
                      const isPaid = monthNum <= selectedSchemeForPassbook.months_paid;
                      const dateObj = new Date(selectedSchemeForPassbook.start_date || new Date().toISOString());
                      dateObj.setMonth(dateObj.getMonth() + i);
                      const dueStr = dateObj.toISOString().split('T')[0];
                      const approxRate = 7750 + i * 15;
                      const grams = +(selectedSchemeForPassbook.monthly_installment / approxRate).toFixed(3);

                      return (
                        <tr key={monthNum} className={isPaid ? 'bg-white' : 'bg-neutral-50/50 text-neutral-400'}>
                          <td className="p-2 border-r border-[#e5e7eb] text-center font-medium">{monthNum}</td>
                          <td className="p-2 border-r border-[#e5e7eb]">{dueStr}</td>
                          <td className="p-2 border-r border-[#e5e7eb] text-right">
                            ₹ {(selectedSchemeForPassbook.monthly_installment || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="p-2 border-r border-[#e5e7eb] text-right">
                            {isPaid ? `₹ ${approxRate}` : '—'}
                          </td>
                          <td className="p-2 border-r border-[#e5e7eb] text-right font-medium text-amber-700">
                            {isPaid ? `${grams} g` : '—'}
                          </td>
                          <td className="p-2 text-center">
                            {isPaid ? (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                PAID
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[10px] text-neutral-400 border border-neutral-200">
                                PENDING
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-3 rounded bg-amber-50/70 border border-amber-200 text-amber-900 text-xs">
                <span className="font-medium">Maturity Benefit:</span> {selectedSchemeForPassbook.benefit_type}
              </div>

              <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#e2e8f0]">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/sales/billing-pos?scheme=${selectedSchemeForPassbook.scheme_account_no}&customer=${encodeURIComponent(selectedSchemeForPassbook.customer_name)}`}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" /> Convert to POS Billing
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Passbook
                  </button>
                  <button
                    onClick={() => setSelectedSchemeForPassbook(null)}
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

      {/* Pay EMI Modal */}
      {selectedSchemeForPay && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-2xl border border-[#e2e8f0] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">Pay Monthly Installment</h3>
              </div>
              <button
                onClick={() => setSelectedSchemeForPay(null)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Account:</span>
                  <span className="font-mono text-neutral-900 font-medium">{selectedSchemeForPay.scheme_account_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Patron:</span>
                  <span className="font-medium text-neutral-900">{selectedSchemeForPay.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Installment #:</span>
                  <span className="font-mono text-neutral-900">{selectedSchemeForPay.months_paid + 1} of {selectedSchemeForPay.total_months}</span>
                </div>
                <div className="flex justify-between border-t border-[#e2e8f0] pt-1.5 text-sm">
                  <span className="font-medium text-neutral-800">Amount Due:</span>
                  <span className="font-mono font-medium text-emerald-700">
                    ₹ {selectedSchemeForPay.monthly_installment.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setSelectedSchemeForPay(null)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePayInstallment(selectedSchemeForPay)}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Record Payment in Firestore
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Redeem Scheme Modal */}
      {selectedSchemeForRedeem && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-2xl border border-amber-200 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-amber-100 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-medium text-neutral-900">Redeem Matured Scheme</h3>
              </div>
              <button
                onClick={() => setSelectedSchemeForRedeem(null)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-neutral-700 leading-relaxed">
                Scheme account <span className="font-mono font-medium text-neutral-900">{selectedSchemeForRedeem.scheme_account_no}</span> for {selectedSchemeForRedeem.customer_name} has successfully matured with all {selectedSchemeForRedeem.total_months} installments paid.
              </p>

              <div className="p-3 bg-amber-50/50 border border-amber-200 rounded text-xs space-y-1 font-mono">
                <div>Total Paid: ₹{selectedSchemeForRedeem.total_paid_amount.toLocaleString('en-IN')}</div>
                <div>Accrued Pure Gold: {selectedSchemeForRedeem.accrued_gold_weight_g.toFixed(3)} g</div>
                <div className="text-emerald-700 font-medium">Making Charge Waiver: 100% applied</div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                <Link
                  href={`/sales/billing-pos?scheme=${selectedSchemeForRedeem.scheme_account_no}&customer=${encodeURIComponent(selectedSchemeForRedeem.customer_name)}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" /> Start Billing
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedSchemeForRedeem(null)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRedeemScheme(selectedSchemeForRedeem)}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-2xs disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Mark as Closed
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
