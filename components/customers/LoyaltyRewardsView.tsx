'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Crown,
  Sparkles,
  Gift,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Plus,
  X,
  Check,
  Sliders,
  Percent,
  TrendingUp,
  Award,
  Zap,
  ArrowRight,
  Calculator,
  QrCode,
  FileText,
  Loader2,
  AlertCircle,
  ShoppingBag,
  Gem,
  BookOpen,
  Trash2,
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

export interface LoyaltyAccountRecord {
  id: string;
  member_id: string;
  customer_name: string;
  phone: string;
  loyalty_tier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';
  lifetime_points: number;
  points_redeemed: number;
  current_points: number;
  redeemable_value: number;
  last_active_date: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at?: string;
}

const SAMPLE_LOYALTY: Omit<LoyaltyAccountRecord, 'id'>[] = [
  {
    member_id: 'LYT-8821',
    customer_name: 'Sridevi Rao',
    phone: '+91 98451 23456',
    loyalty_tier: 'PLATINUM',
    lifetime_points: 4920,
    points_redeemed: 1500,
    current_points: 3420,
    redeemable_value: 1710.0,
    last_active_date: '2026-10-18',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  },
  {
    member_id: 'LYT-8822',
    customer_name: 'Dr. Mohan Krishna',
    phone: '+91 94401 55667',
    loyalty_tier: 'PLATINUM',
    lifetime_points: 3840,
    points_redeemed: 1000,
    current_points: 2840,
    redeemable_value: 1420.0,
    last_active_date: '2026-10-12',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  },
  {
    member_id: 'LYT-8823',
    customer_name: 'Venkat Raman',
    phone: '+91 97412 89012',
    loyalty_tier: 'GOLD',
    lifetime_points: 2240,
    points_redeemed: 1000,
    current_points: 1240,
    redeemable_value: 620.0,
    last_active_date: '2026-10-25',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  },
  {
    member_id: 'LYT-8824',
    customer_name: 'Meera Nambiar',
    phone: '+91 94471 67890',
    loyalty_tier: 'GOLD',
    lifetime_points: 1884,
    points_redeemed: 800,
    current_points: 1084,
    redeemable_value: 542.0,
    last_active_date: '2026-09-30',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  },
  {
    member_id: 'LYT-8825',
    customer_name: 'Ananya Reddy',
    phone: '+91 91008 34567',
    loyalty_tier: 'SILVER',
    lifetime_points: 950,
    points_redeemed: 200,
    current_points: 750,
    redeemable_value: 375.0,
    last_active_date: '2026-10-27',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  },
];

export function CustomersLoyaltyRewardsView() {
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [accounts, setAccounts] = useState<LoyaltyAccountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE'>('ALL');

  // Interactive Redemption Calculator state
  const [calcSelectedMemberId, setCalcSelectedMemberId] = useState<string>('');
  const [calcRedeemPoints, setCalcRedeemPoints] = useState<number>(500);
  const [issuedVoucherCode, setIssuedVoucherCode] = useState<string | null>(null);

  // Modals & Drawers
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isAdjustPointsOpen, setIsAdjustPointsOpen] = useState(false);
  const [selectedAccountForAction, setSelectedAccountForAction] = useState<LoyaltyAccountRecord | null>(null);
  const [adjustPointsValue, setAdjustPointsValue] = useState('250');
  const [adjustReason, setAdjustReason] = useState('Festive Goodwill Bonus');

  // Enroll form state
  const [formCustName, setFormCustName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formTier, setFormTier] = useState<LoyaltyAccountRecord['loyalty_tier']>('BRONZE');
  const [formInitialPoints, setFormInitialPoints] = useState('100');

  // Toast State
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const fetchLoyalty = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'customers_loyalty_rewards'));
      const list: LoyaltyAccountRecord[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<LoyaltyAccountRecord, 'id'>) });
      });
      setAccounts(list);
      if (list.length > 0 && !calcSelectedMemberId) {
        setCalcSelectedMemberId(list[0].member_id);
      }
    } catch (err: any) {
      console.error('Error fetching loyalty accounts:', err);
      showToast('error', err.message || 'Failed to fetch loyalty accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyalty();
  }, []);

  const handleSeedSamples = async () => {
    try {
      setSaving(true);
      const added: LoyaltyAccountRecord[] = [];
      for (const item of SAMPLE_LOYALTY) {
        const docRef = await addDoc(collection(db, 'customers_loyalty_rewards'), item);
        added.push({ id: docRef.id, ...item });
      }
      setAccounts((prev) => [...added, ...prev]);
      if (added.length > 0) setCalcSelectedMemberId(added[0].member_id);
      showToast('success', `${added.length} sample loyalty accounts inserted into Firestore.`);
    } catch (err: any) {
      console.error('Error seeding loyalty:', err);
      showToast('error', err.message || 'Failed to seed loyalty members');
    } finally {
      setSaving(false);
    }
  };

  const selectedMember = useMemo(() => {
    return accounts.find((a) => a.member_id === calcSelectedMemberId) || accounts[0];
  }, [accounts, calcSelectedMemberId]);

  const maxRedeemableForSelected = selectedMember ? selectedMember.current_points : 0;
  const currentDiscountRupees = Math.round(calcRedeemPoints * 0.5);

  const handleEnrollMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustName.trim() || !formPhone.trim()) return;

    try {
      setSaving(true);
      const pts = parseInt(formInitialPoints) || 100;
      const randNo = Math.floor(1000 + Math.random() * 9000);
      const memCode = `LYT-${randNo}`;

      const newMember: Omit<LoyaltyAccountRecord, 'id'> = {
        member_id: memCode,
        customer_name: formCustName.trim(),
        phone: formPhone.trim(),
        loyalty_tier: formTier,
        lifetime_points: pts,
        points_redeemed: 0,
        current_points: pts,
        redeemable_value: pts * 0.5,
        last_active_date: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'customers_loyalty_rewards'), newMember);
      setAccounts((prev) => [{ id: docRef.id, ...newMember }, ...prev]);
      setCalcSelectedMemberId(memCode);
      setIsEnrollModalOpen(false);
      showToast('success', `Loyalty member "${memCode}" enrolled with ${pts} bonus points.`);

      // Reset
      setFormCustName('');
      setFormPhone('');
      setFormInitialPoints('100');
    } catch (err: any) {
      console.error('Error enrolling member:', err);
      showToast('error', err.message || 'Failed to enroll member');
    } finally {
      setSaving(false);
    }
  };

  const handleIssueVoucher = async () => {
    if (!selectedMember) return;
    if (calcRedeemPoints <= 0 || calcRedeemPoints > selectedMember.current_points) {
      showToast('error', 'Invalid redemption points amount');
      return;
    }

    try {
      setSaving(true);
      const code = `REW-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newCurrent = selectedMember.current_points - calcRedeemPoints;
      const newRedeemed = (selectedMember.points_redeemed || 0) + calcRedeemPoints;
      const newRedeemValue = newCurrent * 0.5;

      await updateDoc(doc(db, 'customers_loyalty_rewards', selectedMember.id), {
        current_points: newCurrent,
        points_redeemed: newRedeemed,
        redeemable_value: newRedeemValue,
        last_active_date: new Date().toISOString().split('T')[0],
      });

      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === selectedMember.id
            ? {
                ...acc,
                current_points: newCurrent,
                points_redeemed: newRedeemed,
                redeemable_value: newRedeemValue,
              }
            : acc
        )
      );

      setIssuedVoucherCode(code);
      showToast('success', `Voucher "${code}" worth ₹${currentDiscountRupees} generated & redeemed in Firestore.`);
    } catch (err: any) {
      console.error('Error issuing voucher:', err);
      showToast('error', err.message || 'Failed to issue voucher');
    } finally {
      setSaving(false);
    }
  };

  const handleAdjustPointsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountForAction) return;

    try {
      setSaving(true);
      const pts = parseInt(adjustPointsValue) || 100;
      const newCurrent = selectedAccountForAction.current_points + pts;
      const newLifetime = selectedAccountForAction.lifetime_points + pts;
      const newRedeemValue = newCurrent * 0.5;

      await updateDoc(doc(db, 'customers_loyalty_rewards', selectedAccountForAction.id), {
        current_points: newCurrent,
        lifetime_points: newLifetime,
        redeemable_value: newRedeemValue,
        last_active_date: new Date().toISOString().split('T')[0],
      });

      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === selectedAccountForAction.id
            ? {
                ...acc,
                current_points: newCurrent,
                lifetime_points: newLifetime,
                redeemable_value: newRedeemValue,
              }
            : acc
        )
      );

      setIsAdjustPointsOpen(false);
      showToast('success', `${pts > 0 ? '+' : ''}${pts} points adjusted for ${selectedAccountForAction.customer_name}.`);
    } catch (err: any) {
      console.error('Error adjusting points:', err);
      showToast('error', err.message || 'Failed to adjust points');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async (id: string, memId: string) => {
    if (!confirm(`Delete loyalty account "${memId}"?`)) return;
    try {
      await deleteDoc(doc(db, 'customers_loyalty_rewards', id));
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      showToast('success', `Loyalty account "${memId}" deleted.`);
    } catch (err: any) {
      console.error('Error deleting account:', err);
      showToast('error', err.message || 'Failed to delete loyalty account');
    }
  };

  const filteredAccounts = useMemo(() => {
    return accounts.filter((a) => {
      if (tierFilter !== 'ALL' && a.loyalty_tier !== tierFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const mName = a.customer_name?.toLowerCase().includes(q);
        const mPhone = a.phone?.toLowerCase().includes(q);
        const mId = a.member_id?.toLowerCase().includes(q);
        if (!mName && !mPhone && !mId) return false;
      }
      return true;
    });
  }, [accounts, tierFilter, searchQuery]);

  // Derived KPI metrics
  const totalIssued = accounts.reduce((sum, a) => sum + (a.lifetime_points || 0), 0);
  const totalRedeemed = accounts.reduce((sum, a) => sum + (a.points_redeemed || 0), 0);
  const totalCurrent = accounts.reduce((sum, a) => sum + (a.current_points || 0), 0);
  const totalRedeemableRupees = accounts.reduce((sum, a) => sum + (a.redeemable_value || 0), 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="customers_loyalty_rewards" />
      <ActionToolbar
        filterPlaceholder="Search loyalty member by name, phone, or membership ID..."
        insertLabel="Enroll Member"
        onInsertClick={() => setIsEnrollModalOpen(true)}
        onRefresh={fetchLoyalty}
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
            className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs"
          >
            Loyalty Rewards
          </Link>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/sales/billing-pos"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-emerald-700 hover:underline"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" /> Redeem at POS Billing
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
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-purple-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Points Issued</span>
                <Award className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-neutral-400" /> : `${totalIssued.toLocaleString('en-IN')} Pts`}
              </div>
              <div className="text-[11px] text-purple-600 mt-1 font-mono">
                {accounts.length} enrolled loyalty members
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Points Redeemed</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700 font-mono">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-neutral-400" /> : `${totalRedeemed.toLocaleString('en-IN')} Pts`}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                Converted to retail jewellery discounts
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Active Wallet Points</span>
                <Coins className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-neutral-400" /> : `${totalCurrent.toLocaleString('en-IN')} Pts`}
              </div>
              <div className="text-[11px] text-amber-600 mt-1 font-mono">
                Ready for redemption at billing
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Redeemable Rupee Value</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700 font-mono">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-neutral-400" /> : `₹ ${totalRedeemableRupees.toLocaleString('en-IN')}`}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Valued @ ₹0.50 per loyalty point
              </div>
            </div>
          </div>

          {/* Interactive Quick Redemption Calculator */}
          {selectedMember && (
            <div className="mt-4 p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-neutral-900">
                    Instant POS Redemption Calculator
                  </span>
                  <span className="text-[11px] text-neutral-400">• Select Member & Amount</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">Member:</span>
                  <select
                    value={calcSelectedMemberId}
                    onChange={(e) => setCalcSelectedMemberId(e.target.value)}
                    className="px-2 py-1 text-xs border border-[#e2e8f0] rounded bg-white text-neutral-800"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.member_id}>
                        {acc.customer_name} ({acc.current_points} pts)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-neutral-600 font-mono">
                    <span>Redeem Points: {calcRedeemPoints}</span>
                    <span>Max: {maxRedeemableForSelected}</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max={Math.max(100, maxRedeemableForSelected)}
                    step="50"
                    value={Math.min(calcRedeemPoints, maxRedeemableForSelected)}
                    onChange={(e) => setCalcRedeemPoints(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>

                <div className="p-2.5 rounded bg-white border border-[#e2e8f0] text-center font-mono">
                  <span className="text-[10px] text-neutral-400 uppercase block font-sans">
                    Bill Discount Granted
                  </span>
                  <span className="text-base font-medium text-emerald-700">
                    - ₹ {currentDiscountRupees.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={handleIssueVoucher}
                    disabled={saving || maxRedeemableForSelected === 0}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Gift className="w-3.5 h-3.5" />}
                    Redeem & Generate Voucher
                  </button>
                  <Link
                    href={`/sales/billing-pos?discount=${currentDiscountRupees}&customer=${encodeURIComponent(selectedMember.customer_name)}`}
                    className="flex items-center gap-1 px-3 py-2 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" /> Apply POS
                  </Link>
                </div>
              </div>

              {issuedVoucherCode && (
                <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Voucher Code: <span className="font-mono font-medium">{issuedVoucherCode}</span> (₹{currentDiscountRupees} Off for {selectedMember.customer_name})
                    </span>
                  </div>
                  <button onClick={() => setIssuedVoucherCode(null)} className="text-emerald-700 hover:text-emerald-900">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quick Filter Bar */}
          <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by member ID, name, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-white border border-[#e2e8f0] rounded-md text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-emerald-500 w-64"
                />
              </div>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Tier:</span>
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value as any)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Tiers</option>
                  <option value="PLATINUM">Platinum</option>
                  <option value="GOLD">Gold</option>
                  <option value="SILVER">Silver</option>
                  <option value="BRONZE">Bronze</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchLoyalty}
                className="p-1.5 rounded-md border border-[#e2e8f0] bg-white text-neutral-600 hover:text-emerald-700 hover:bg-neutral-50 transition-colors"
                title="Refresh from Firestore"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsEnrollModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Enroll Member
              </button>
            </div>
          </div>
        </div>

        {/* Supabase-style Table */}
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
                  Loyalty Accounts ({filteredAccounts.length})
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
                firestore: customers_loyalty_rewards • 11 fields
              </div>
            </div>

            {/* Table Content: Data Tab */}
            {activeTab === 'data' && (
              <div className="overflow-x-auto flex-1">
                {loading ? (
                  <div className="flex flex-col items-center justify-center p-12 text-neutral-400">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
                    <span className="text-xs font-medium text-neutral-600">Connecting to Loyalty Rewards Ledger...</span>
                  </div>
                ) : filteredAccounts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                      <Award className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-medium text-neutral-900 mb-1">No Loyalty Accounts Found</h4>
                    <p className="text-xs text-neutral-500 max-w-sm mb-4">
                      {accounts.length === 0
                        ? 'No patron reward accounts enrolled in Firestore. Enroll a customer into the rewards club or insert sample test accounts.'
                        : 'No accounts match the selected tier or search filter.'}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEnrollModalOpen(true)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Enroll Patron
                      </button>
                      {accounts.length === 0 && (
                        <button
                          onClick={handleSeedSamples}
                          disabled={saving}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-300 transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
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
                          <span className="text-neutral-800">member_id</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">customer_name</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                          <span className="text-neutral-800">tier</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">lifetime_pts</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">redeemed_pts</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">current_pts</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">redeemable_val</span>
                          <span className="text-neutral-400 font-normal text-[10px] ml-1">inr</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">last_active</span>
                        </th>
                        <th className="px-3.5 py-2 font-medium whitespace-nowrap text-center">
                          <span className="text-neutral-800">actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {filteredAccounts.map((row) => (
                        <tr key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                          <td className="px-3 py-2 text-center border-r border-[#e5e7eb]">
                            <input type="checkbox" className="rounded border-neutral-300 text-emerald-600 focus:ring-0" />
                          </td>
                          <td className="px-3.5 py-2 font-mono text-emerald-700 font-medium border-r border-[#e5e7eb] whitespace-nowrap">
                            {row.member_id}
                          </td>
                          <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                            <div className="font-medium text-neutral-900">{row.customer_name}</div>
                            <span className="text-[10px] text-neutral-400 font-mono block">{row.phone}</span>
                          </td>
                          <td className="px-3.5 py-2 text-center border-r border-[#e5e7eb] whitespace-nowrap">
                            {row.loyalty_tier === 'PLATINUM' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                                <Crown className="w-3 h-3 text-purple-600" /> Platinum
                              </span>
                            )}
                            {row.loyalty_tier === 'GOLD' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                <Sparkles className="w-3 h-3 text-amber-500" /> Gold
                              </span>
                            )}
                            {row.loyalty_tier === 'SILVER' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-300">
                                Silver
                              </span>
                            )}
                            {row.loyalty_tier === 'BRONZE' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-50 text-orange-700 border border-orange-200">
                                Bronze
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-2 font-mono text-right text-neutral-600 border-r border-[#e5e7eb] whitespace-nowrap">
                            {(row.lifetime_points || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-3.5 py-2 font-mono text-right text-neutral-500 border-r border-[#e5e7eb] whitespace-nowrap">
                            {(row.points_redeemed || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-3.5 py-2 font-mono text-right font-medium text-amber-700 border-r border-[#e5e7eb] whitespace-nowrap">
                            {(row.current_points || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-3.5 py-2 font-mono text-right font-medium text-emerald-700 border-r border-[#e5e7eb] whitespace-nowrap">
                            ₹ {(row.redeemable_value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-3.5 py-2 font-mono text-neutral-600 border-r border-[#e5e7eb] whitespace-nowrap">
                            {row.last_active_date}
                          </td>
                          <td className="px-3.5 py-2 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedAccountForAction(row);
                                  setIsAdjustPointsOpen(true);
                                }}
                                className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                              >
                                Adjust
                              </button>
                              <Link
                                href={`/sales/billing-pos?customer=${encodeURIComponent(row.customer_name)}&phone=${encodeURIComponent(row.phone)}`}
                                className="p-1 hover:bg-emerald-50 rounded text-neutral-600 hover:text-emerald-700 transition-colors"
                                title="POS Billing"
                              >
                                <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                              </Link>
                              <button
                                onClick={() => handleDeleteMember(row.id, row.member_id)}
                                className="p-1 hover:bg-red-50 rounded text-neutral-400 hover:text-red-600 transition-colors"
                                title="Delete Account"
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
                  collection: <span className="text-amber-400">&quot;customers_loyalty_rewards&quot;</span>
                  <br />
                  document: &#123;
                  <br />
                  &nbsp;&nbsp;id: <span className="text-blue-300">auto-generated-id</span>,
                  <br />
                  &nbsp;&nbsp;member_id: <span className="text-blue-300">string</span> (LYT-xxxx),
                  <br />
                  &nbsp;&nbsp;customer_name: <span className="text-blue-300">string</span>,
                  <br />
                  &nbsp;&nbsp;phone: <span className="text-blue-300">string</span>,
                  <br />
                  &nbsp;&nbsp;loyalty_tier: <span className="text-emerald-300">&apos;PLATINUM&apos; | &apos;GOLD&apos; | &apos;SILVER&apos; | &apos;BRONZE&apos;</span>,
                  <br />
                  &nbsp;&nbsp;lifetime_points: <span className="text-blue-300">number</span>,
                  <br />
                  &nbsp;&nbsp;points_redeemed: <span className="text-blue-300">number</span>,
                  <br />
                  &nbsp;&nbsp;current_points: <span className="text-blue-300">number</span>,
                  <br />
                  &nbsp;&nbsp;redeemable_value: <span className="text-blue-300">number</span> (points * ₹0.50),
                  <br />
                  &nbsp;&nbsp;status: <span className="text-emerald-300">&apos;ACTIVE&apos; | &apos;INACTIVE&apos;</span>,
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

      {/* Enroll Loyalty Member Drawer */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-[#e2e8f0] animate-in slide-in-from-right duration-200">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div>
                <h3 className="text-sm font-medium text-neutral-900">Enroll New Loyalty Member</h3>
                <p className="text-[11px] text-neutral-500">Assign membership tier, bonus points, and phone number</p>
              </div>
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEnrollMember} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-xs">
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Member Details
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
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Loyalty Tier</label>
                    <select
                      value={formTier}
                      onChange={(e) => setFormTier(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                    >
                      <option value="BRONZE">Bronze (1 pt / ₹1,000)</option>
                      <option value="SILVER">Silver (1.5 pts / ₹1,000)</option>
                      <option value="GOLD">Gold (2 pts / ₹1,000)</option>
                      <option value="PLATINUM">Platinum VIP (3 pts / ₹1,000)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Welcome Bonus Points</label>
                    <input
                      type="number"
                      value={formInitialPoints}
                      onChange={(e) => setFormInitialPoints(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white text-neutral-900"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded bg-white border border-[#e2e8f0] text-xs font-mono flex justify-between">
                  <span className="text-neutral-500">Initial Redeemable Value:</span>
                  <span className="font-medium text-emerald-700">₹ {(parseInt(formInitialPoints) || 0) * 0.5}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
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
                  Save Member in Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Points Modal */}
      {isAdjustPointsOpen && selectedAccountForAction && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-2xl border border-[#e2e8f0] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">Adjust Loyalty Points</h3>
              </div>
              <button
                onClick={() => setIsAdjustPointsOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustPointsSubmit} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Member:</span>
                  <span className="font-medium text-neutral-900">{selectedAccountForAction.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Current Balance:</span>
                  <span className="font-mono font-medium text-amber-700">
                    {selectedAccountForAction.current_points} Pts (₹{selectedAccountForAction.redeemable_value})
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Points to Credit / Debit</label>
                <input
                  type="number"
                  required
                  placeholder="+250 or -100"
                  value={adjustPointsValue}
                  onChange={(e) => setAdjustPointsValue(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Adjustment Reason</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustPointsOpen(false)}
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
                  Confirm Points Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
