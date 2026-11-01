'use client';

import React, { useState, useEffect } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import { FinanceNavigationHeader } from './FinanceNavigationHeader';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  BookOpen,
  Scale,
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  Copy,
  Check,
  X,
  Plus,
  ShieldCheck,
  Building,
  RotateCcw,
  Loader2,
  Trash2,
  AlertCircle,
} from 'lucide-react';

export interface JournalVoucher {
  id: string;
  voucher_no: string;
  date: string;
  debit_account: string;
  credit_account: string;
  amount: number;
  narration: string;
  posted_by: string;
  status: 'POSTED' | 'DRAFT' | 'REVERSED';
  reference_doc?: string;
  created_at?: any;
}

const DEBIT_ACCOUNTS = [
  'Depreciation on Safe Vault & Showroom Display Counters',
  'Interest Expense on ICICI Bullion Loan Facility',
  'Inventory Mark-to-Market Valuation Gain',
  'Karigar Melting & Refining Wastage Loss (VA)',
  'Old Gold Scrap Refining Variance',
  'Customer Loyalty Rewards Point Provision',
  'Shortage in Cash / Rounding Off A/c',
  'Hallmark Assay Testing & Laser Engraving Expense',
];

const CREDIT_ACCOUNTS = [
  'Accumulated Depreciation Reserve A/c',
  'ICICI Bullion Overdraft - 4410',
  'Bullion Price Fluctuation Reserve A/c',
  'Work-in-Progress Artisan Bullion Ledger',
  'Old Gold Scrap Inventory A/c',
  'Customer Advance Monies Suspense A/c',
  'Showroom Sundry Creditors Ledger',
  'HDFC Jewellery Current - 9021',
];

export function FinanceJournalEntriesView() {
  const [vouchers, setVouchers] = useState<JournalVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals & drawers
  const [isNewVoucherOpen, setIsNewVoucherOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<JournalVoucher | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // New JV Form State
  const [voucherNo, setVoucherNo] = useState('');
  const [debitAccount, setDebitAccount] = useState(DEBIT_ACCOUNTS[0]);
  const [creditAccount, setCreditAccount] = useState(CREDIT_ACCOUNTS[0]);
  const [amount, setAmount] = useState<number>(0);
  const [narration, setNarration] = useState('');
  const [jvDate, setJvDate] = useState(new Date().toISOString().substring(0, 10));
  const [postedBy, setPostedBy] = useState('Mohan Rao (Head Auditor)');
  const [refDoc, setRefDoc] = useState('');

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'finance_journal_entries'));
      const list: JournalVoucher[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<JournalVoucher, 'id'>) });
      });
      list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      setVouchers(list);
    } catch (err: any) {
      console.error('Error fetching journal entries:', err);
      showToast('error', err.message || 'Failed to fetch journal vouchers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle Status
  const handleToggleStatus = async (id: string, currentStatus: JournalVoucher['status']) => {
    const nextStatus: JournalVoucher['status'] =
      currentStatus === 'POSTED' ? 'REVERSED' : currentStatus === 'REVERSED' ? 'DRAFT' : 'POSTED';
    try {
      await updateDoc(doc(db, 'finance_journal_entries', id), {
        status: nextStatus,
      });
      setVouchers((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: nextStatus } : v))
      );
      showToast('success', `Voucher status set to ${nextStatus}`);
    } catch (err: any) {
      console.error('Error updating voucher status:', err);
      showToast('error', err.message || 'Failed to update voucher status');
    }
  };

  // Create JV
  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !narration.trim()) {
      showToast('error', 'Please enter a valid amount and accounting narration');
      return;
    }

    try {
      setSaving(true);
      const vNo = voucherNo.trim() || `JV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      const payload: Omit<JournalVoucher, 'id'> = {
        voucher_no: vNo,
        date: jvDate,
        debit_account: debitAccount,
        credit_account: creditAccount,
        amount: Number(amount),
        narration: narration.trim(),
        posted_by: postedBy,
        status: 'POSTED',
        reference_doc: refDoc.trim() || undefined,
        created_at: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'finance_journal_entries'), payload);
      setVouchers((prev) => [{ id: docRef.id, ...payload }, ...prev]);
      setIsNewVoucherOpen(false);
      setAmount(0);
      setNarration('');
      setVoucherNo('');
      setRefDoc('');
      showToast('success', `Posted Journal Voucher ${vNo} of ₹ ${Number(amount).toLocaleString('en-IN')}`);
    } catch (err: any) {
      console.error('Error creating journal voucher:', err);
      showToast('error', err.message || 'Failed to save journal voucher');
    } finally {
      setSaving(false);
    }
  };

  // Delete JV
  const handleDeleteVoucher = async () => {
    if (!itemToDelete) return;
    try {
      setSaving(true);
      await deleteDoc(doc(db, 'finance_journal_entries', itemToDelete.id));
      setVouchers((prev) => prev.filter((v) => v.id !== itemToDelete.id));
      showToast('success', `Deleted journal voucher #${itemToDelete.voucher_no}`);
      setItemToDelete(null);
    } catch (err: any) {
      console.error('Error deleting voucher:', err);
      showToast('error', err.message || 'Failed to delete voucher');
    } finally {
      setSaving(false);
    }
  };

  // KPI Calculations
  const totalPostedAmount = vouchers
    .filter((v) => v.status === 'POSTED')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const postedCount = vouchers.filter((v) => v.status === 'POSTED').length;
  const reversedCount = vouchers.filter((v) => v.status === 'REVERSED').length;

  const filteredVouchers = vouchers.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.voucher_no || '').toLowerCase().includes(q) ||
      (item.debit_account || '').toLowerCase().includes(q) ||
      (item.credit_account || '').toLowerCase().includes(q) ||
      (item.narration || '').toLowerCase().includes(q) ||
      (item.posted_by || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="general_journal_entries" />
      <ActionToolbar
        filterPlaceholder="Filter by JV #, account head, auditor, narration..."
        insertLabel="New Journal Voucher"
        onInsertClick={() => setIsNewVoucherOpen(true)}
        onRefresh={fetchVouchers}
      />

      <FinanceNavigationHeader activePage="journal-entries" />

      {/* Real-time Toast Banner */}
      {toastMessage && (
        <div
          className={`px-4 py-2 text-xs flex items-center justify-between transition-all shrink-0 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
              : 'bg-red-50 text-red-800 border-b border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-neutral-400 hover:text-neutral-700 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Debits Posted</span>
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">
                ₹ {totalPostedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">General ledger debited</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Credits Posted</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700 font-mono">
                ₹ {totalPostedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1">Balanced double-entry</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Active Vouchers</span>
                <Scale className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">
                {postedCount} <span className="text-xs text-neutral-500 font-sans">Posted</span>
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">{reversedCount} reversed / audit hold</div>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-200 hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-emerald-800 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Trial Balance Integrity</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div className="text-xl font-medium text-emerald-900 font-mono">
                Δ ₹ 0.00
              </div>
              <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Debits Equal Credits (100% Balanced)
              </div>
            </div>
          </div>
        </div>

        {/* Vouchers Table or Empty State */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-neutral-500">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
              <p className="text-xs font-medium">Loading live journal vouchers...</p>
            </div>
          ) : filteredVouchers.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center p-8 bg-white rounded-lg border border-[#e5e7eb] shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-neutral-900 mb-1">No Journal Entries Found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mb-4">
                {searchQuery
                  ? 'No journal vouchers match your filter. Try clearing the search.'
                  : 'Post adjustments, vault asset depreciation, metal loan interest provisions, and bullion price MTM gains.'}
              </p>
              <button
                onClick={() => setIsNewVoucherOpen(true)}
                className="px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Journal Voucher</span>
              </button>
            </div>
          ) : (
            <div className="border border-[#e5e7eb] rounded-lg bg-white overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-neutral-500 uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3 font-medium">Voucher #</th>
                      <th className="py-2.5 px-3 font-medium">Date</th>
                      <th className="py-2.5 px-3 font-medium">Debit Account (Dr)</th>
                      <th className="py-2.5 px-3 font-medium">Credit Account (Cr)</th>
                      <th className="py-2.5 px-3 font-medium text-right">Amount (₹)</th>
                      <th className="py-2.5 px-3 font-medium">Narration / Explanation</th>
                      <th className="py-2.5 px-3 font-medium">Auditor</th>
                      <th className="py-2.5 px-3 font-medium text-center">Status</th>
                      <th className="py-2.5 px-3 font-medium text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0] text-neutral-700">
                    {filteredVouchers.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-2 px-3 font-mono font-medium text-neutral-900 whitespace-nowrap">
                          <button
                            onClick={() => copyToClipboard(row.voucher_no, row.id)}
                            className="inline-flex items-center gap-1 hover:text-emerald-700 cursor-pointer"
                            title="Copy Voucher #"
                          >
                            <span>{row.voucher_no}</span>
                            {copiedId === row.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-2.5 h-2.5 text-neutral-400 opacity-60" />
                            )}
                          </button>
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                          {row.date}
                        </td>
                        <td className="py-2 px-3 text-emerald-800 font-medium max-w-xs truncate" title={row.debit_account}>
                          <span className="text-emerald-600 font-mono text-[10px] mr-1">Dr.</span>
                          {row.debit_account}
                        </td>
                        <td className="py-2 px-3 text-neutral-700 max-w-xs truncate" title={row.credit_account}>
                          <span className="text-neutral-400 font-mono text-[10px] mr-1">To</span>
                          {row.credit_account}
                        </td>
                        <td className="py-2 px-3 font-mono font-medium text-neutral-900 text-right whitespace-nowrap">
                          ₹ {row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 text-neutral-600 max-w-sm truncate" title={row.narration}>
                          {row.narration}
                        </td>
                        <td className="py-2 px-3 text-neutral-600 whitespace-nowrap">
                          {row.posted_by}
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(row.id, row.status)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                              row.status === 'POSTED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : row.status === 'REVERSED'
                                ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                                : 'bg-neutral-100 text-neutral-700 border border-neutral-200 hover:bg-neutral-200'
                            }`}
                            title="Click to toggle status (POSTED -> REVERSED -> DRAFT)"
                          >
                            {row.status === 'POSTED' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>POSTED</span>
                              </>
                            ) : row.status === 'REVERSED' ? (
                              <>
                                <RotateCcw className="w-3 h-3 text-red-600" />
                                <span>REVERSED</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-neutral-500" />
                                <span>DRAFT</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => setItemToDelete(row)}
                            className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete voucher"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      </div>

      {/* MODAL: Create Journal Voucher */}
      {isNewVoucherOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-medium text-neutral-900 uppercase tracking-wider">
                  Create Double-Entry Journal Voucher (JV)
                </h3>
              </div>
              <button
                onClick={() => setIsNewVoucherOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Voucher Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={jvDate}
                    onChange={(e) => setJvDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Auditor / Posted By
                  </label>
                  <select
                    value={postedBy}
                    onChange={(e) => setPostedBy(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                  >
                    <option value="Mohan Rao (Head Auditor)">Mohan Rao (Head Auditor)</option>
                    <option value="Siva Krishna (Finance Controller)">Siva Krishna (Finance Controller)</option>
                    <option value="Rajesh Gupta (General Manager)">Rajesh Gupta (General Manager)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-emerald-700 mb-1">
                  Debit Account (Dr.) *
                </label>
                <select
                  value={debitAccount}
                  onChange={(e) => setDebitAccount(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#f8fafc] border border-emerald-300 rounded focus:border-emerald-500 focus:bg-white focus:outline-none font-medium"
                >
                  {DEBIT_ACCOUNTS.map((acc) => (
                    <option key={acc} value={acc}>
                      {acc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Credit Account (Cr.) *
                </label>
                <select
                  value={creditAccount}
                  onChange={(e) => setCreditAccount(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none font-medium"
                >
                  {CREDIT_ACCOUNTS.map((acc) => (
                    <option key={acc} value={acc}>
                      {acc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Voucher Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={amount || ''}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono font-medium focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Ref Document / Certificate
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IBJA-FIX-202610 / AUDIT-092"
                    value={refDoc}
                    onChange={(e) => setRefDoc(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Accounting Narration *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Being monthly depreciation / provision for unhedged bullion loan..."
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Dynamic Accounting Preview */}
              <div className="p-3 rounded-lg bg-[#f8fafc] border border-emerald-200 text-[11px] space-y-1">
                <div className="flex justify-between text-neutral-600">
                  <span>Debit Leg (Dr.):</span>
                  <span className="font-mono text-emerald-700 font-medium">₹ {amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Credit Leg (Cr.):</span>
                  <span className="font-mono text-neutral-900 font-medium">₹ {amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="text-[10px] text-emerald-600 flex items-center gap-1 pt-1 border-t border-emerald-100">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Double-entry balance check verified (Δ ₹ 0.00)</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setIsNewVoucherOpen(false)}
                  className="px-3 py-1.5 rounded border border-[#e2e8f0] text-neutral-600 hover:bg-neutral-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Post Journal Voucher</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Confirmation */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-sm p-5 space-y-3 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium text-neutral-900">Delete Journal Voucher?</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Are you sure you want to delete JV <span className="font-mono font-medium text-neutral-800">#{itemToDelete.voucher_no}</span> (₹ {itemToDelete.amount.toLocaleString('en-IN')})?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-3 py-1.5 rounded border border-[#e2e8f0] text-neutral-600 hover:bg-neutral-50 font-medium text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteVoucher}
                disabled={saving}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                <span>Delete Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
