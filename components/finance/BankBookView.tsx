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
  Landmark,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  Check,
  X,
  CreditCard,
  Building,
  RefreshCw,
  FileCheck,
  AlertCircle,
  Loader2,
  Trash2,
  Plus,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export interface BankBookEntry {
  id: string;
  date: string;
  bank_name: string;
  utr_reference: string;
  party_name: string;
  transaction_type: 'CREDIT' | 'DEBIT';
  amount: number;
  is_reconciled: boolean;
  category: string;
  remarks?: string;
  created_at?: any;
}

const DEFAULT_BANK_CONFIGS = [
  { id: 'HDFC Jewellery Current - 9021', name: 'HDFC Jewellery Current', accNo: '9021', baseFloat: 5000000 },
  { id: 'ICICI Bullion Overdraft - 4410', name: 'ICICI Bullion Overdraft', accNo: '4410', baseFloat: 2500000 },
  { id: 'SBI Current Account - 1102', name: 'SBI Current Account', accNo: '1102', baseFloat: 1500000 },
];

export function FinanceBankBookView() {
  const [entries, setEntries] = useState<BankBookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBankFilter, setSelectedBankFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals & drawers
  const [isNewTxnOpen, setIsNewTxnOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<BankBookEntry | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // New Transaction Form State
  const [newBank, setNewBank] = useState('HDFC Jewellery Current - 9021');
  const [newType, setNewType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [newUtr, setNewUtr] = useState('');
  const [newParty, setNewParty] = useState('');
  const [newAmount, setNewAmount] = useState<number>(0);
  const [newCategory, setNewCategory] = useState('Customer Advance');
  const [newDate, setNewDate] = useState(new Date().toISOString().substring(0, 10));
  const [newReconciled, setNewReconciled] = useState(true);
  const [newRemarks, setNewRemarks] = useState('');

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'finance_bank_book'));
      const list: BankBookEntry[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<BankBookEntry, 'id'>) });
      });
      list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      setEntries(list);
    } catch (err: any) {
      console.error('Error fetching bank book:', err);
      showToast('error', err.message || 'Failed to fetch bank transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle Reconciled Status
  const handleToggleReconciled = async (id: string, currentVal: boolean) => {
    try {
      await updateDoc(doc(db, 'finance_bank_book', id), {
        is_reconciled: !currentVal,
      });
      setEntries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_reconciled: !currentVal } : item))
      );
      showToast('success', `Transaction marked as ${!currentVal ? 'Reconciled' : 'Unreconciled'}`);
    } catch (err: any) {
      console.error('Error toggling reconcile status:', err);
      showToast('error', err.message || 'Failed to update reconciliation');
    }
  };

  // Create Transaction
  const handleCreateTxn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAmount <= 0 || !newParty.trim()) {
      showToast('error', 'Please enter counterparty name and a valid amount');
      return;
    }

    try {
      setSaving(true);
      const utrVal = newUtr.trim() || `CMS-${newBank.slice(0, 4)}-${Math.floor(100000 + Math.random() * 900000)}`;
      const payload: Omit<BankBookEntry, 'id'> = {
        date: `${newDate} ${new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}`,
        bank_name: newBank,
        utr_reference: utrVal,
        party_name: newParty.trim(),
        transaction_type: newType,
        amount: Number(newAmount),
        is_reconciled: newReconciled,
        category: newCategory,
        remarks: newRemarks.trim() || undefined,
        created_at: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'finance_bank_book'), payload);
      setEntries((prev) => [{ id: docRef.id, ...payload }, ...prev]);
      setIsNewTxnOpen(false);
      setNewParty('');
      setNewAmount(0);
      setNewUtr('');
      setNewRemarks('');
      showToast('success', `Recorded ${newType} of ₹ ${Number(newAmount).toLocaleString('en-IN')}`);
    } catch (err: any) {
      console.error('Error recording bank transaction:', err);
      showToast('error', err.message || 'Failed to save bank transaction');
    } finally {
      setSaving(false);
    }
  };

  // Delete Transaction
  const handleDeleteTxn = async () => {
    if (!itemToDelete) return;
    try {
      setSaving(true);
      await deleteDoc(doc(db, 'finance_bank_book', itemToDelete.id));
      setEntries((prev) => prev.filter((item) => item.id !== itemToDelete.id));
      showToast('success', `Deleted bank transaction #${itemToDelete.utr_reference}`);
      setItemToDelete(null);
    } catch (err: any) {
      console.error('Error deleting transaction:', err);
      showToast('error', err.message || 'Failed to delete transaction');
    } finally {
      setSaving(false);
    }
  };

  // Calculations for KPI Cards
  const totalCredits = entries
    .filter((e) => e.transaction_type === 'CREDIT')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalDebits = entries
    .filter((e) => e.transaction_type === 'DEBIT')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const unreconciledCount = entries.filter((e) => !e.is_reconciled).length;
  const netBankFlow = totalCredits - totalDebits;

  // Filtered transactions
  const filteredEntries = entries.filter((item) => {
    if (selectedBankFilter !== 'ALL' && !item.bank_name.includes(selectedBankFilter)) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.party_name || '').toLowerCase().includes(q) ||
      (item.utr_reference || '').toLowerCase().includes(q) ||
      (item.category || '').toLowerCase().includes(q) ||
      (item.bank_name || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="bank_book_reconciliation" />
      <ActionToolbar
        filterPlaceholder="Filter by UTR, counterparty, account #, category..."
        insertLabel="Record Bank Txn"
        onInsertClick={() => setIsNewTxnOpen(true)}
        onRefresh={fetchEntries}
      />

      <FinanceNavigationHeader activePage="bank-book" />

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
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Inward Credits</span>
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700 font-mono">
                ₹ {totalCredits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1">RTGS advances & POS batch</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Outward Debits</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-amber-700 font-mono">
                ₹ {totalDebits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Bullion payouts & karigar fees</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Unreconciled Entries</span>
                <Clock className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">
                {unreconciledCount} <span className="text-xs text-neutral-500 font-sans">Pending</span>
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Awaiting bank statement tick</div>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-200 hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-emerald-800 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Net Bank Liquidity</span>
                <Landmark className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div className="text-xl font-medium text-emerald-900 font-mono">
                {netBankFlow >= 0 ? '+' : '-'} ₹ {Math.abs(netBankFlow).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Net Flow
              </div>
            </div>
          </div>
        </div>

        {/* Bank Account Balances Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium text-neutral-800 uppercase tracking-wider">
                Active Jeweller Current & Metal Loan Accounts
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-neutral-500 text-[11px]">Filter Account:</span>
              <select
                value={selectedBankFilter}
                onChange={(e) => setSelectedBankFilter(e.target.value)}
                className="px-2 py-1 bg-[#f8fafc] border border-[#e2e8f0] rounded text-xs font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Bank Accounts</option>
                <option value="HDFC">HDFC Bank</option>
                <option value="ICICI">ICICI Bank</option>
                <option value="SBI">SBI Bank</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DEFAULT_BANK_CONFIGS.map((bank) => {
              const bankEntries = entries.filter((e) => e.bank_name.includes(bank.accNo));
              const cred = bankEntries
                .filter((e) => e.transaction_type === 'CREDIT')
                .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
              const deb = bankEntries
                .filter((e) => e.transaction_type === 'DEBIT')
                .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
              const computedBalance = bank.baseFloat + cred - deb;

              return (
                <div
                  key={bank.id}
                  className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-neutral-800">{bank.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-[#e2e8f0] text-neutral-500">
                      A/c ••••{bank.accNo}
                    </span>
                  </div>
                  <div className="text-lg font-medium text-neutral-900 font-mono mb-1">
                    ₹ {computedBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-2 border-t border-[#e2e8f0]">
                    <span>In: +₹ {cred.toLocaleString('en-IN')}</span>
                    <span>Out: -₹ {deb.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transactions Table or Empty State */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-neutral-500">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
              <p className="text-xs font-medium">Loading live bank book records...</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center p-8 bg-white rounded-lg border border-[#e5e7eb] shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-neutral-900 mb-1">No Bank Book Entries Found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mb-4">
                {searchQuery || selectedBankFilter !== 'ALL'
                  ? 'No entries match your search or filter. Try clearing the filters.'
                  : 'Record bullion vendor NEFT/RTGS payments, client inward advances, and POS card batch credits.'}
              </p>
              <button
                onClick={() => setIsNewTxnOpen(true)}
                className="px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record Bank Transaction</span>
              </button>
            </div>
          ) : (
            <div className="border border-[#e5e7eb] rounded-lg bg-white overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-neutral-500 uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3 font-medium">Date & Time</th>
                      <th className="py-2.5 px-3 font-medium">Bank Account</th>
                      <th className="py-2.5 px-3 font-medium">UTR / NEFT Ref</th>
                      <th className="py-2.5 px-3 font-medium">Counterparty / Party Name</th>
                      <th className="py-2.5 px-3 font-medium">Category</th>
                      <th className="py-2.5 px-3 font-medium text-right">Amount (₹)</th>
                      <th className="py-2.5 px-3 font-medium text-center">Status</th>
                      <th className="py-2.5 px-3 font-medium text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0] text-neutral-700">
                    {filteredEntries.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-2 px-3 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                          {row.date}
                        </td>
                        <td className="py-2 px-3 text-neutral-800 font-medium whitespace-nowrap">
                          {row.bank_name}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-neutral-600 whitespace-nowrap">
                          <button
                            onClick={() => copyToClipboard(row.utr_reference, row.id)}
                            className="inline-flex items-center gap-1 hover:text-emerald-700 cursor-pointer"
                            title="Copy UTR Ref"
                          >
                            <span>{row.utr_reference}</span>
                            {copiedId === row.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-2.5 h-2.5 text-neutral-400 opacity-60" />
                            )}
                          </button>
                        </td>
                        <td className="py-2 px-3 max-w-xs truncate font-medium text-neutral-900" title={row.party_name}>
                          {row.party_name}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#f1f5f9] text-neutral-600 border border-[#e2e8f0]">
                            {row.category}
                          </span>
                        </td>
                        <td
                          className={`py-2 px-3 font-mono font-medium text-right whitespace-nowrap ${
                            row.transaction_type === 'CREDIT' ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {row.transaction_type === 'CREDIT' ? '+' : '-'} ₹ {row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleToggleReconciled(row.id, row.is_reconciled)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                              row.is_reconciled
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                            }`}
                            title="Click to toggle reconciliation"
                          >
                            {row.is_reconciled ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Reconciled</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Unreconciled</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => setItemToDelete(row)}
                            className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete transaction"
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

      {/* MODAL: Record Bank Transaction */}
      {isNewTxnOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-medium text-neutral-900 uppercase tracking-wider">
                  Record Bank Book Entry
                </h3>
              </div>
              <button
                onClick={() => setIsNewTxnOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTxn} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Transaction Nature
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType('CREDIT')}
                    className={`py-2 px-3 rounded border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      newType === 'CREDIT'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'border-[#e2e8f0] text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Inward Credit (Receipt)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('DEBIT')}
                    className={`py-2 px-3 rounded border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      newType === 'DEBIT'
                        ? 'bg-amber-50 border-amber-500 text-amber-800'
                        : 'border-[#e2e8f0] text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
                    <span>Outward Debit (Payout)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Bank Account *
                </label>
                <select
                  value={newBank}
                  onChange={(e) => setNewBank(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                >
                  <option value="HDFC Jewellery Current - 9021">HDFC Jewellery Current - 9021</option>
                  <option value="ICICI Bullion Overdraft - 4410">ICICI Bullion Overdraft - 4410</option>
                  <option value="SBI Current Account - 1102">SBI Current Account - 1102</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Counterparty / Party Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MMTC-PAMP India / Priya Sharma Bridal Advance"
                  value={newParty}
                  onChange={(e) => setNewParty(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newAmount || ''}
                    onChange={(e) => setNewAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono font-medium focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    UTR / RTGS Ref #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC263012903"
                    value={newUtr}
                    onChange={(e) => setNewUtr(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                  >
                    <option value="Customer Advance">Customer Advance</option>
                    <option value="Bullion Purchase">Bullion Purchase</option>
                    <option value="POS Settlement">POS Settlement</option>
                    <option value="Karigar Settlement">Karigar Settlement</option>
                    <option value="GST Tax Challan">GST Tax Challan</option>
                    <option value="Bank Charges / OD Interest">Bank Charges / OD Interest</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="reconcileCheck"
                  checked={newReconciled}
                  onChange={(e) => setNewReconciled(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="reconcileCheck" className="text-[11px] text-neutral-700 font-medium cursor-pointer">
                  Matched & Reconciled with Bank Statement
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setIsNewTxnOpen(false)}
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
                  <span>Save Transaction</span>
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
              <h3 className="text-sm font-medium text-neutral-900">Delete Bank Record?</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Are you sure you want to delete transaction UTR <span className="font-mono font-medium text-neutral-800">#{itemToDelete.utr_reference}</span> (₹ {itemToDelete.amount.toLocaleString('en-IN')})?
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
                onClick={handleDeleteTxn}
                disabled={saving}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                <span>Delete Record</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
