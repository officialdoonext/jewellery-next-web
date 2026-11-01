'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Coins,
  Scale,
  Calendar,
  DollarSign,
  Plus,
  X,
  Search,
  Filter,
  Check,
  Building2,
  FileSpreadsheet,
  FileText,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  CheckCircle2,
  Printer,
  ChevronDown,
  ChevronRight,
  Trash2,
  Loader2,
  RotateCw,
  ExternalLink,
  Sparkles,
  Layers,
  Wrench,
  Truck,
  Receipt,
} from 'lucide-react';

export interface LedgerEntry {
  id: string;
  goldsmith_name: string;
  entry_date: string;
  voucher_no: string;
  transaction_type: 'BULLION_ISSUE' | 'FINISHED_DELIVERY' | 'LABOUR_PAYMENT' | 'METAL_SETTLEMENT';
  particulars: string;
  metal_debit_g: number;
  metal_credit_g: number;
  net_metal_balance_g: number;
  labour_earned: number;
  labour_paid: number;
  net_labour_due: number;
  payment_mode?: 'UPI' | 'NEFT' | 'CASH' | 'CHEQUE';
  reference_job_order?: string;
  created_at?: string;
}

const GOLDSMITHS_LIST = [
  'Bhaskar Jewellers Workshop',
  'Ramesh Soni Karigar',
  'Harish Patwa Goldsmith',
  'Soni Karigar Unit',
  'Laxmi Casting Works',
];

const SAMPLE_LEDGER_SEED: Omit<LedgerEntry, 'id'>[] = [
  {
    goldsmith_name: 'Bhaskar Jewellers Workshop',
    entry_date: '2026-10-18',
    voucher_no: 'VCH-26-881',
    transaction_type: 'BULLION_ISSUE',
    particulars: 'Raw 24K Pure Gold Bar Issued for Bridal Sets',
    metal_debit_g: 100.0,
    metal_credit_g: 0.0,
    net_metal_balance_g: 100.0,
    labour_earned: 0,
    labour_paid: 0,
    net_labour_due: 0,
    reference_job_order: 'JO-2026-195',
    created_at: '2026-10-18',
  },
  {
    goldsmith_name: 'Bhaskar Jewellers Workshop',
    entry_date: '2026-10-22',
    voucher_no: 'DEL-26-402',
    transaction_type: 'FINISHED_DELIVERY',
    particulars: 'Finished 22K Haar & Kada delivered (91.450g) + Scrap (2.100g) + Wastage allowed (1.800g)',
    metal_debit_g: 0.0,
    metal_credit_g: 95.35,
    net_metal_balance_g: 4.65,
    labour_earned: 42000,
    labour_paid: 0,
    net_labour_due: 42000,
    reference_job_order: 'JO-2026-195',
    created_at: '2026-10-22',
  },
  {
    goldsmith_name: 'Bhaskar Jewellers Workshop',
    entry_date: '2026-10-24',
    voucher_no: 'PAY-26-119',
    transaction_type: 'LABOUR_PAYMENT',
    particulars: 'Weekly Labour advance payment via HDFC Bank NEFT',
    metal_debit_g: 0.0,
    metal_credit_g: 0.0,
    net_metal_balance_g: 4.65,
    labour_earned: 0,
    labour_paid: 30000,
    net_labour_due: 12000,
    payment_mode: 'NEFT',
    created_at: '2026-10-24',
  },
  {
    goldsmith_name: 'Bhaskar Jewellers Workshop',
    entry_date: '2026-10-25',
    voucher_no: 'VCH-26-895',
    transaction_type: 'BULLION_ISSUE',
    particulars: 'Raw 24K Gold Bar Issued for Temple Kada Pair',
    metal_debit_g: 250.0,
    metal_credit_g: 0.0,
    net_metal_balance_g: 254.65,
    labour_earned: 0,
    labour_paid: 0,
    net_labour_due: 12000,
    reference_job_order: 'JO-2026-208',
    created_at: '2026-10-25',
  },
  {
    goldsmith_name: 'Ramesh Soni Karigar',
    entry_date: '2026-10-20',
    voucher_no: 'VCH-26-889',
    transaction_type: 'BULLION_ISSUE',
    particulars: 'Raw 24K Gold Issued for Chain Links',
    metal_debit_g: 150.0,
    metal_credit_g: 0.0,
    net_metal_balance_g: 150.0,
    labour_earned: 0,
    labour_paid: 0,
    net_labour_due: 0,
    reference_job_order: 'JO-2026-198',
    created_at: '2026-10-20',
  },
  {
    goldsmith_name: 'Ramesh Soni Karigar',
    entry_date: '2026-10-27',
    voucher_no: 'DEL-26-411',
    transaction_type: 'FINISHED_DELIVERY',
    particulars: 'Delivered 8 Chains (132.500g) + Scrap (14.200g)',
    metal_debit_g: 0.0,
    metal_credit_g: 146.7,
    net_metal_balance_g: 3.3,
    labour_earned: 18500,
    labour_paid: 18500,
    net_labour_due: 0,
    payment_mode: 'UPI',
    created_at: '2026-10-27',
  },
];

export function OrdersGoldsmithLedgerView() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedGoldsmith, setSelectedGoldsmith] = useState<string>(GOLDSMITHS_LIST[0]);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-11-30');
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Settlement Form State
  const [settlementType, setSettlementType] = useState<'LABOUR_PAYMENT' | 'METAL_SETTLEMENT' | 'COMBINED'>('LABOUR_PAYMENT');
  const [settleVoucherNo, setSettleVoucherNo] = useState('');
  const [settleMetalGrams, setSettleMetalGrams] = useState('0.000');
  const [settleLabourAmount, setSettleLabourAmount] = useState('10000');
  const [settlePaymentMode, setSettlePaymentMode] = useState<'UPI' | 'NEFT' | 'CASH' | 'CHEQUE'>('NEFT');
  const [settleNotes, setSettleNotes] = useState('Labour settlement payment.');
  const [settleRefJob, setSettleRefJob] = useState('');

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'orders_goldsmith_ledger'));
      const list: LedgerEntry[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<LedgerEntry, 'id'>) });
      });
      list.sort((a, b) => (a.entry_date > b.entry_date ? 1 : -1));
      setEntries(list);
    } catch (err: any) {
      console.error('Error fetching ledger entries:', err);
      showToast('error', err.message || 'Failed to fetch goldsmith ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const openSettlementDrawer = () => {
    setSettleVoucherNo(`VCH-${Date.now().toString().slice(-4)}`);
    setIsSettlementOpen(true);
  };

  const handleSeedSamples = async () => {
    try {
      setSaving(true);
      const added: LedgerEntry[] = [];
      for (const item of SAMPLE_LEDGER_SEED) {
        const docRef = await addDoc(collection(db, 'orders_goldsmith_ledger'), item);
        added.push({ id: docRef.id, ...item });
      }
      setEntries((prev) => [...added, ...prev]);
      showToast('success', `${added.length} sample ledger entries added to Firestore.`);
    } catch (err: any) {
      console.error('Error seeding ledger:', err);
      showToast('error', err.message || 'Failed to seed sample ledger entries');
    } finally {
      setSaving(false);
    }
  };

  // Filter entries for the selected artisan
  const artisanEntries = useMemo(() => {
    return entries.filter((e) => e.goldsmith_name === selectedGoldsmith);
  }, [entries, selectedGoldsmith]);

  // Running totals for the selected artisan
  const ledgerMetrics = useMemo(() => {
    const totalDebit = artisanEntries.reduce((acc, r) => acc + (Number(r.metal_debit_g) || 0), 0);
    const totalCredit = artisanEntries.reduce((acc, r) => acc + (Number(r.metal_credit_g) || 0), 0);
    const netMetal = Math.max(0, totalDebit - totalCredit);

    const totalEarned = artisanEntries.reduce((acc, r) => acc + (Number(r.labour_earned) || 0), 0);
    const totalPaid = artisanEntries.reduce((acc, r) => acc + (Number(r.labour_paid) || 0), 0);
    const netLabour = Math.max(0, totalEarned - totalPaid);

    return {
      pendingMetalBalance: netMetal,
      unsettledLabourDue: netLabour,
      totalEntries: artisanEntries.length,
      lastAuditDate: artisanEntries.length > 0 ? artisanEntries[artisanEntries.length - 1].entry_date : 'N/A',
    };
  }, [artisanEntries]);

  const filteredEntries = useMemo(() => {
    return artisanEntries.filter((entry) => {
      const matchSearch =
        (entry.voucher_no || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.particulars || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.reference_job_order && entry.reference_job_order.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSearch;
    });
  }, [artisanEntries, searchQuery]);

  const handleSaveSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      let metalCredit = 0;
      let labourPaid = 0;

      if (settlementType === 'METAL_SETTLEMENT' || settlementType === 'COMBINED') {
        metalCredit = parseFloat(settleMetalGrams) || 0;
      }
      if (settlementType === 'LABOUR_PAYMENT' || settlementType === 'COMBINED') {
        labourPaid = parseFloat(settleLabourAmount) || 0;
      }

      const newMetalBalance = Math.max(0, ledgerMetrics.pendingMetalBalance - metalCredit);
      const newLabourDue = Math.max(0, ledgerMetrics.unsettledLabourDue - labourPaid);

      const newEntryData: Omit<LedgerEntry, 'id'> = {
        goldsmith_name: selectedGoldsmith,
        entry_date: new Date().toISOString().slice(0, 10),
        voucher_no: settleVoucherNo || `VCH-${Date.now().toString().slice(-4)}`,
        transaction_type:
          settlementType === 'METAL_SETTLEMENT'
            ? 'METAL_SETTLEMENT'
            : 'LABOUR_PAYMENT',
        particulars: `${settleNotes} (${settlePaymentMode})`,
        metal_debit_g: 0,
        metal_credit_g: metalCredit,
        net_metal_balance_g: newMetalBalance,
        labour_earned: 0,
        labour_paid: labourPaid,
        net_labour_due: newLabourDue,
        payment_mode: settlePaymentMode,
        reference_job_order: settleRefJob || undefined,
        created_at: new Date().toISOString().slice(0, 10),
      };

      const docRef = await addDoc(collection(db, 'orders_goldsmith_ledger'), newEntryData);
      setEntries([...entries, { id: docRef.id, ...newEntryData }]);
      setIsSettlementOpen(false);
      showToast('success', `Voucher #${newEntryData.voucher_no} posted to ${selectedGoldsmith} ledger.`);
    } catch (err: any) {
      console.error('Error posting settlement:', err);
      showToast('error', err.message || 'Failed to post settlement');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this ledger transaction voucher?')) return;
    try {
      setDeletingId(entryId);
      await deleteDoc(doc(db, 'orders_goldsmith_ledger', entryId));
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      showToast('success', 'Ledger transaction deleted successfully.');
    } catch (err: any) {
      console.error('Error deleting entry:', err);
      showToast('error', err.message || 'Failed to delete ledger entry');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="goldsmith_metal_ledger" />
      <ActionToolbar
        filterPlaceholder="Filter ledger vouchers, job orders, settlement particulars..."
        insertLabel="Settle / Pay Labour"
        onInsertClick={openSettlementDrawer}
      />

      {/* Interlinked Module Navigation Header */}
      <div className="bg-white border-b border-[#e2e8f0] px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar text-xs">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mr-1">Workflow:</span>
          <Link
            href="/orders-services/custom-orders"
            className="px-2.5 py-1 rounded hover:bg-neutral-100 text-neutral-600 font-medium border border-[#e2e8f0] flex items-center gap-1.5 whitespace-nowrap"
          >
            <Sparkles className="w-3 h-3 text-neutral-500" /> Custom Orders
          </Link>
          <Link
            href="/orders-services/tracking"
            className="px-2.5 py-1 rounded hover:bg-neutral-100 text-neutral-600 font-medium border border-[#e2e8f0] flex items-center gap-1.5 whitespace-nowrap"
          >
            <Layers className="w-3 h-3 text-neutral-500" /> Production Pipeline
          </Link>
          <Link
            href="/orders-services/repairs"
            className="px-2.5 py-1 rounded hover:bg-neutral-100 text-neutral-600 font-medium border border-[#e2e8f0] flex items-center gap-1.5 whitespace-nowrap"
          >
            <Wrench className="w-3 h-3 text-neutral-500" /> Repairs
          </Link>
          <Link
            href="/orders-services/job-work"
            className="px-2.5 py-1 rounded hover:bg-neutral-100 text-neutral-600 font-medium border border-[#e2e8f0] flex items-center gap-1.5 whitespace-nowrap"
          >
            <Scale className="w-3 h-3 text-neutral-500" /> Job Work
          </Link>
          <Link
            href="/orders-services/goldsmith-ledger"
            className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-200 flex items-center gap-1.5 whitespace-nowrap"
          >
            <FileText className="w-3 h-3 text-emerald-600" /> Karigar Ledger
          </Link>
          <Link
            href="/orders-services/delivery-management"
            className="px-2.5 py-1 rounded hover:bg-neutral-100 text-neutral-600 font-medium border border-[#e2e8f0] flex items-center gap-1.5 whitespace-nowrap"
          >
            <Truck className="w-3 h-3 text-neutral-500" /> Secure Delivery
          </Link>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/purchases/job-worker-receipts"
            className="px-2 py-1 rounded text-[11px] font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-2xs"
          >
            <Scale className="w-3 h-3" /> Reconcile Loss
          </Link>
          <button
            onClick={fetchLedger}
            disabled={loading}
            className="p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Refresh Ledger"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* Toast Feedback */}
        {toastType !== 'idle' && (
          <div
            className={`border-b px-4 py-2 text-xs font-medium flex items-center justify-between animate-fadeIn ${
              toastType === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {toastType === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastType('idle')}
              className="text-neutral-500 hover:text-neutral-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Artisan Selector Bar */}
        <div className="p-4 bg-white border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded bg-amber-50 text-amber-700">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-medium text-neutral-500 tracking-wider block">
                Artisan Workshop Account
              </span>
              <select
                value={selectedGoldsmith}
                onChange={(e) => setSelectedGoldsmith(e.target.value)}
                className="text-xs font-medium text-neutral-800 bg-[#f8fafc] border border-[#e2e8f0] rounded-md px-2.5 py-1 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {GOLDSMITHS_LIST.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/orders-services/job-work"
              className="text-emerald-700 hover:underline flex items-center gap-1 font-medium"
            >
              Issue Raw Gold to {selectedGoldsmith.split(' ')[0]} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* KPI Metrics Cards */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Pure Gold Balance Pending
              </span>
              <span className="p-1 rounded bg-amber-50 text-amber-600">
                <Coins className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-amber-800 font-mono">
              {ledgerMetrics.pendingMetalBalance.toFixed(3)} g
            </div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              Pure 24K held by artisan workshop
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Unsettled Labour Due
              </span>
              <span className="p-1 rounded bg-emerald-50 text-emerald-600">
                <DollarSign className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-neutral-800 font-mono">
              ₹ {ledgerMetrics.unsettledLabourDue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
              <span>Earned on delivered ornaments</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Total Ledger Vouchers
              </span>
              <span className="p-1 rounded bg-blue-50 text-blue-600">
                <FileText className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-neutral-800 font-mono">
              {ledgerMetrics.totalEntries} Vouchers
            </div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              Recorded in live Firestore
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Raw Gold Reconcile Link
              </span>
              <span className="p-1 rounded bg-purple-50 text-purple-600">
                <Scale className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-neutral-800 font-mono">
              Audit Status
            </div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              <Link href="/purchases/job-worker-receipts" className="text-emerald-700 hover:underline flex items-center gap-0.5">
                Inspect Worker Receipts <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Switcher & Search */}
        <div className="px-4 pb-2 flex items-center justify-between border-b border-[#e2e8f0]">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('data')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'data'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-[#e2e8f0]'
              }`}
            >
              Metal & Labour Statement ({filteredEntries.length})
            </button>
            <button
              onClick={() => setActiveTab('definition')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'definition'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-[#e2e8f0]'
              }`}
            >
              Schema Definition (DDL)
            </button>
          </div>

          {activeTab === 'data' && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search vouchers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 rounded text-xs border border-[#e2e8f0] bg-white focus:outline-none focus:border-emerald-500 w-48"
              />
            </div>
          )}
        </div>

        {/* View Mode: Statement Data Table */}
        {activeTab === 'data' ? (
          <div className="flex-1 p-4">
            {loading ? (
              <div className="bg-white border border-[#e2e8f0] rounded-lg p-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
                <h3 className="text-sm font-medium text-neutral-800">Loading Goldsmith Ledger...</h3>
                <p className="text-xs text-neutral-500 mt-1">Connecting to Firestore collection &apos;orders_goldsmith_ledger&apos;</p>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="bg-white border border-[#e2e8f0] rounded-lg p-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                  <Coins className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-neutral-800">No Ledger Entries for {selectedGoldsmith}</h3>
                <p className="text-xs text-neutral-500 max-w-md mt-1 mb-4">
                  {searchQuery
                    ? 'No vouchers matched your search term.'
                    : 'There are no metal issue, delivery, or payment vouchers recorded for this artisan workshop.'}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={openSettlementDrawer}
                    className="px-3.5 py-2 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Post Settlement / Voucher
                  </button>
                  {entries.length === 0 && (
                    <button
                      onClick={handleSeedSamples}
                      disabled={saving}
                      className="px-3.5 py-2 rounded-md bg-white border border-[#e2e8f0] text-neutral-700 text-xs font-medium hover:bg-neutral-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" /> : <Coins className="w-3.5 h-3.5 text-amber-600" />}
                      Load Sample Ledger
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-neutral-500 font-medium">
                        <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Date</th>
                        <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Voucher #</th>
                        <th className="py-2.5 px-3 border-r border-[#e5e7eb]">Particulars & Job Reference</th>
                        <th className="py-2.5 px-3 border-r border-[#e5e7eb] text-right whitespace-nowrap text-amber-700 bg-amber-50/20">
                          Metal Dr (g Issued)
                        </th>
                        <th className="py-2.5 px-3 border-r border-[#e5e7eb] text-right whitespace-nowrap text-emerald-700 bg-emerald-50/20">
                          Metal Cr (g Returned)
                        </th>
                        <th className="py-2.5 px-3 border-r border-[#e5e7eb] text-right whitespace-nowrap font-medium text-neutral-900">
                          Net Metal (g)
                        </th>
                        <th className="py-2.5 px-3 border-r border-[#e5e7eb] text-right whitespace-nowrap">
                          Labour Earned
                        </th>
                        <th className="py-2.5 px-3 border-r border-[#e5e7eb] text-right whitespace-nowrap text-emerald-700">
                          Labour Paid
                        </th>
                        <th className="py-2.5 px-3 border-r border-[#e5e7eb] text-right whitespace-nowrap font-medium text-neutral-900">
                          Net Labour Due
                        </th>
                        <th className="py-2.5 px-3 text-center whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {filteredEntries.map((row) => (
                        <tr key={row.id} className="hover:bg-[#f8fafc] transition-colors">
                          <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-neutral-600">
                            {row.entry_date}
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap font-mono">
                            <span className="font-medium text-neutral-800">{row.voucher_no}</span>
                            {row.reference_job_order && (
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-100 block mt-0.5">
                                {row.reference_job_order}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#e5e7eb]">
                            <div className="font-medium text-neutral-800">{row.particulars}</div>
                            {row.payment_mode && (
                              <span className="text-[10px] font-mono text-blue-600">
                                Mode: {row.payment_mode}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#e5e7eb] text-right font-mono whitespace-nowrap bg-amber-50/20">
                            {Number(row.metal_debit_g) > 0 ? (
                              <span className="font-medium text-amber-700">
                                +{Number(row.metal_debit_g).toFixed(3)} g
                              </span>
                            ) : (
                              <span className="text-neutral-300">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#e5e7eb] text-right font-mono whitespace-nowrap bg-emerald-50/20">
                            {Number(row.metal_credit_g) > 0 ? (
                              <span className="font-medium text-emerald-700">
                                -{Number(row.metal_credit_g).toFixed(3)} g
                              </span>
                            ) : (
                              <span className="text-neutral-300">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#e5e7eb] text-right font-mono whitespace-nowrap font-medium text-neutral-900">
                            {Number(row.net_metal_balance_g || 0).toFixed(3)} g
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#e5e7eb] text-right font-mono whitespace-nowrap">
                            {Number(row.labour_earned) > 0 ? (
                              <span>₹ {Number(row.labour_earned).toLocaleString('en-IN')}</span>
                            ) : (
                              <span className="text-neutral-300">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#e5e7eb] text-right font-mono whitespace-nowrap text-emerald-700">
                            {Number(row.labour_paid) > 0 ? (
                              <span>₹ {Number(row.labour_paid).toLocaleString('en-IN')}</span>
                            ) : (
                              <span className="text-neutral-300">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#e5e7eb] text-right font-mono whitespace-nowrap font-medium text-neutral-900">
                            ₹ {Number(row.net_labour_due || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteEntry(row.id)}
                              disabled={deletingId === row.id}
                              className="p-1 hover:bg-red-50 rounded text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete voucher"
                            >
                              {deletingId === row.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Schema Definition Tab */
          <div className="p-4 flex-1">
            <div className="bg-[#1e1e1e] text-neutral-200 p-4 rounded-lg font-mono text-xs leading-relaxed overflow-x-auto shadow-inner">
              <span className="text-emerald-400">CREATE TABLE</span> public.goldsmith_metal_ledger (
              <br />
              &nbsp;&nbsp;id <span className="text-blue-400">UUID</span> PRIMARY KEY DEFAULT gen_random_uuid(),
              <br />
              &nbsp;&nbsp;goldsmith_name <span className="text-blue-400">VARCHAR(150)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;entry_date <span className="text-blue-400">DATE</span> NOT NULL,
              <br />
              &nbsp;&nbsp;voucher_no <span className="text-blue-400">VARCHAR(50)</span> UNIQUE NOT NULL,
              <br />
              &nbsp;&nbsp;transaction_type <span className="text-blue-400">VARCHAR(50)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;particulars <span className="text-blue-400">TEXT</span> NOT NULL,
              <br />
              &nbsp;&nbsp;metal_debit_g <span className="text-blue-400">NUMERIC(10,3)</span> DEFAULT 0.000,
              <br />
              &nbsp;&nbsp;metal_credit_g <span className="text-blue-400">NUMERIC(10,3)</span> DEFAULT 0.000,
              <br />
              &nbsp;&nbsp;net_metal_balance_g <span className="text-blue-400">NUMERIC(10,3)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;labour_earned <span className="text-blue-400">NUMERIC(10,2)</span> DEFAULT 0.00,
              <br />
              &nbsp;&nbsp;labour_paid <span className="text-blue-400">NUMERIC(10,2)</span> DEFAULT 0.00,
              <br />
              &nbsp;&nbsp;net_labour_due <span className="text-blue-400">NUMERIC(10,2)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;payment_mode <span className="text-blue-400">VARCHAR(20)</span>,
              <br />
              &nbsp;&nbsp;reference_job_order <span className="text-blue-400">VARCHAR(50)</span>,
              <br />
              &nbsp;&nbsp;created_at <span className="text-blue-400">TIMESTAMPTZ</span> DEFAULT now()
              <br />
              );
            </div>
          </div>
        )}
      </div>

      {/* Settle Metal Balance / Pay Labour Drawer Modal */}
      {isSettlementOpen && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex justify-end z-50 animate-fadeIn">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#e2e8f0]">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-emerald-50 text-emerald-700">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-neutral-900 uppercase tracking-wider">
                    Settle Metal Balance & Pay Labour
                  </h3>
                  <span className="text-[11px] text-neutral-500">
                    Artisan: <span className="font-medium text-neutral-800">{selectedGoldsmith}</span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsSettlementOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form id="settlement-form" onSubmit={handleSaveSettlement} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {/* Current Balances Header Card */}
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Pure Gold Pending</span>
                  <span className="font-mono font-medium text-amber-800 text-sm">
                    {ledgerMetrics.pendingMetalBalance.toFixed(3)} g
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Labour Charges Due</span>
                  <span className="font-mono font-medium text-emerald-700 text-sm">
                    ₹ {ledgerMetrics.unsettledLabourDue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Settlement Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'LABOUR_PAYMENT', label: 'Pay Labour' },
                    { id: 'METAL_SETTLEMENT', label: 'Return Metal' },
                    { id: 'COMBINED', label: 'Combined Both' },
                  ].map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setSettlementType(t.id as any)}
                      className={`py-2 px-2 rounded border text-xs font-medium transition-colors cursor-pointer text-center ${
                        settlementType === t.id
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-white border-[#e2e8f0] text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Voucher #</label>
                  <input
                    type="text"
                    value={settleVoucherNo}
                    onChange={(e) => setSettleVoucherNo(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Payment Mode</label>
                  <select
                    value={settlePaymentMode}
                    onChange={(e) => setSettlePaymentMode(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  >
                    <option value="NEFT">HDFC Bank NEFT / RTGS</option>
                    <option value="UPI">UPI Instant (GPay / PhonePe)</option>
                    <option value="CASH">Cash Drawer Voucher</option>
                    <option value="CHEQUE">Account Payee Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Reference Job Order (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. JO-2026-208"
                  value={settleRefJob}
                  onChange={(e) => setSettleRefJob(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                />
              </div>

              {(settlementType === 'LABOUR_PAYMENT' || settlementType === 'COMBINED') && (
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Labour Amount to Pay (₹)</label>
                  <input
                    type="number"
                    value={settleLabourAmount}
                    onChange={(e) => setSettleLabourAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
              )}

              {(settlementType === 'METAL_SETTLEMENT' || settlementType === 'COMBINED') && (
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Pure Metal Grams Returned (g)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={settleMetalGrams}
                    onChange={(e) => setSettleMetalGrams(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Settlement Particulars / Notes</label>
                <textarea
                  rows={2}
                  value={settleNotes}
                  onChange={(e) => setSettleNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                />
              </div>
            </form>

            <div className="px-5 py-3 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSettlementOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="settlement-form"
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Post Settlement to Ledger</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
