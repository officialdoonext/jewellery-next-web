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
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Wallet,
  Coins,
  CheckCircle2,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Copy,
  Check,
  X,
  Building2,
  Lock,
  RotateCcw,
  Loader2,
  Trash2,
  Plus,
  ShieldCheck,
} from 'lucide-react';

export interface CashBookEntry {
  id: string;
  entry_time: string;
  type: 'INFLOW' | 'OUTFLOW' | 'VAULT_TRANSFER';
  particulars: string;
  amount: number;
  drawer_balance: number;
  cashier_name: string;
  reference_no: string;
  category?: string;
  created_at?: any;
}

export function FinanceCashBookView() {
  const [entries, setEntries] = useState<CashBookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Denominations count state
  const [notes500, setNotes500] = useState<number>(0);
  const [notes200, setNotes200] = useState<number>(0);
  const [notes100, setNotes100] = useState<number>(0);
  const [notes50, setNotes50] = useState<number>(0);
  const [notes20, setNotes20] = useState<number>(0);
  const [notes10, setNotes10] = useState<number>(0);

  // Modals
  const [isVaultDrawerOpen, setIsVaultDrawerOpen] = useState(false);
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CashBookEntry | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Vault Transfer Form State
  const [vaultAmount, setVaultAmount] = useState<number>(50000);
  const [vaultCustodian, setVaultCustodian] = useState('Suresh Verma (Vault Custodian)');
  const [vaultRemarks, setVaultRemarks] = useState('End-of-day excess cash deposit into Safe Locker #A2');

  // New Cash Entry Form State
  const [newType, setNewType] = useState<'INFLOW' | 'OUTFLOW'>('INFLOW');
  const [newParticulars, setNewParticulars] = useState('');
  const [newAmount, setNewAmount] = useState<number>(0);
  const [newRef, setNewRef] = useState('');
  const [newCashier, setNewCashier] = useState('Priya Sharma (Counter 1)');
  const [newCategory, setNewCategory] = useState('POS Bill Sale');

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'finance_cash_book'));
      const list: CashBookEntry[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<CashBookEntry, 'id'>) });
      });
      // Sort newest first
      list.sort((a, b) => (b.entry_time || '').localeCompare(a.entry_time || ''));
      setEntries(list);

      // Auto-populate denomination demo count if balance exists and notes are 0
      const bal = list.length > 0 ? list[0].drawer_balance : 0;
      if (bal > 0 && notes500 === 0 && notes200 === 0) {
        const count500 = Math.floor(bal / 500);
        const rem = bal % 500;
        setNotes500(count500);
        setNotes100(Math.floor(rem / 100));
      }
    } catch (err: any) {
      console.error('Error fetching cash book:', err);
      showToast('error', err.message || 'Failed to fetch cash book entries from Firebase');
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

  const currentBookBalance = entries.length > 0 ? entries[0].drawer_balance : 0;
  const countedTotal =
    notes500 * 500 +
    notes200 * 200 +
    notes100 * 100 +
    notes50 * 50 +
    notes20 * 20 +
    notes10 * 10;
  const variance = countedTotal - currentBookBalance;

  // Dynamic KPI Metrics
  const totalInflow = entries
    .filter((e) => e.type === 'INFLOW')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalOutflow = entries
    .filter((e) => e.type === 'OUTFLOW' || e.type === 'VAULT_TRANSFER')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const openingFloat = entries.length > 0 ? entries[entries.length - 1].amount : 0;

  const handleVaultTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (vaultAmount <= 0) {
      showToast('error', 'Please enter a valid vault handover amount');
      return;
    }
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newBal = currentBookBalance - Number(vaultAmount);

    try {
      setSaving(true);
      const payload: Omit<CashBookEntry, 'id'> = {
        entry_time: now,
        type: 'VAULT_TRANSFER',
        particulars: `Safe Vault Handover - ${vaultRemarks}`,
        amount: Number(vaultAmount),
        drawer_balance: newBal,
        cashier_name: vaultCustodian,
        reference_no: `VLT-TRF-${Math.floor(100 + Math.random() * 900)}`,
        category: 'Vault Transfer',
        created_at: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'finance_cash_book'), payload);
      setEntries((prev) => [{ id: docRef.id, ...payload }, ...prev]);
      setIsVaultDrawerOpen(false);
      showToast('success', `Transferred ₹ ${vaultAmount.toLocaleString('en-IN')} securely to Safe Vault`);
    } catch (err: any) {
      console.error('Error saving vault transfer:', err);
      showToast('error', err.message || 'Failed to record vault transfer');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAmount <= 0 || !newParticulars.trim()) {
      showToast('error', 'Please enter particulars and an amount greater than 0');
      return;
    }
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newBal =
      newType === 'INFLOW'
        ? currentBookBalance + Number(newAmount)
        : currentBookBalance - Number(newAmount);

    try {
      setSaving(true);
      const payload: Omit<CashBookEntry, 'id'> = {
        entry_time: now,
        type: newType,
        particulars: newParticulars.trim(),
        amount: Number(newAmount),
        drawer_balance: newBal,
        cashier_name: newCashier,
        reference_no: newRef.trim() || `REF-${Date.now().toString().slice(-4)}`,
        category: newCategory,
        created_at: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'finance_cash_book'), payload);
      setEntries((prev) => [{ id: docRef.id, ...payload }, ...prev]);
      setIsNewEntryOpen(false);
      setNewParticulars('');
      setNewAmount(0);
      setNewRef('');
      showToast('success', `Recorded ${newType} entry of ₹ ${Number(newAmount).toLocaleString('en-IN')}`);
    } catch (err: any) {
      console.error('Error saving cash entry:', err);
      showToast('error', err.message || 'Failed to record cash entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async () => {
    if (!itemToDelete) return;
    try {
      setSaving(true);
      await deleteDoc(doc(db, 'finance_cash_book', itemToDelete.id));
      setEntries((prev) => prev.filter((item) => item.id !== itemToDelete.id));
      showToast('success', `Deleted cash entry #${itemToDelete.reference_no}`);
      setItemToDelete(null);
    } catch (err: any) {
      console.error('Error deleting entry:', err);
      showToast('error', err.message || 'Failed to delete entry');
    } finally {
      setSaving(false);
    }
  };

  const filteredEntries = entries.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.particulars || '').toLowerCase().includes(q) ||
      (item.reference_no || '').toLowerCase().includes(q) ||
      (item.cashier_name || '').toLowerCase().includes(q) ||
      (item.type || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="counter_cash_book" />
      <ActionToolbar
        filterPlaceholder="Filter by bill #, voucher, cashier, type..."
        insertLabel="New Cash Entry"
        onInsertClick={() => setIsNewEntryOpen(true)}
        onRefresh={fetchEntries}
      />

      <FinanceNavigationHeader activePage="cash-book" />

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
                <span className="text-[11px] font-medium uppercase tracking-wider">Opening Float</span>
                <Wallet className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">
                ₹ {openingFloat.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Starting counter cash</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Cash Inflows</span>
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700 font-mono">
                ₹ {totalInflow.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1">POS bills & advances</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Outflows & Vault</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-amber-700 font-mono">
                ₹ {totalOutflow.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Petty cash & vault drops</div>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-200 hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-emerald-800 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Net Drawer Balance</span>
                <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div className="text-xl font-medium text-emerald-900 font-mono">
                ₹ {currentBookBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Book Balance
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Denomination Counter Drawer & Vault Handover Card */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white shrink-0">
          <div className="p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] shadow-2xs flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between">
            {/* Left: Denomination counting inputs */}
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-neutral-800 uppercase tracking-wider">
                    Counter Denomination Physical Tally Tool
                  </span>
                </div>
                <button
                  onClick={() => {
                    setNotes500(0);
                    setNotes200(0);
                    setNotes100(0);
                    setNotes50(0);
                    setNotes20(0);
                    setNotes10(0);
                  }}
                  className="text-[11px] font-medium text-neutral-500 hover:text-neutral-800 flex items-center gap-1 cursor-pointer"
                  title="Reset counter inputs"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { label: '₹ 500', val: notes500, setVal: setNotes500 },
                  { label: '₹ 200', val: notes200, setVal: setNotes200 },
                  { label: '₹ 100', val: notes100, setVal: setNotes100 },
                  { label: '₹ 50', val: notes50, setVal: setNotes50 },
                  { label: '₹ 20', val: notes20, setVal: setNotes20 },
                  { label: '₹ 10', val: notes10, setVal: setNotes10 },
                ].map((item) => (
                  <div key={item.label} className="bg-white border border-[#e2e8f0] rounded p-2 text-center">
                    <span className="text-[10px] text-neutral-500 font-mono block mb-1">{item.label}</span>
                    <input
                      type="number"
                      min="0"
                      value={item.val || ''}
                      onChange={(e) => item.setVal(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      placeholder="0"
                      className="w-full text-center font-mono text-xs font-medium py-1 px-0.5 border border-[#e2e8f0] rounded focus:border-emerald-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-neutral-400 font-mono block mt-1">
                      ₹ {(item.val * parseInt(item.label.replace(/\D/g, ''), 10)).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Variance & Vault Drop Button */}
            <div className="lg:w-80 w-full flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[#e2e8f0] pt-4 lg:pt-0 lg:pl-5 gap-3">
              <div>
                <div className="text-[11px] text-neutral-500 uppercase font-medium">Physical Cash Counted</div>
                <div className="text-xl font-medium text-neutral-900 font-mono">
                  ₹ {countedTotal.toLocaleString('en-IN')}
                </div>
              </div>

              <div
                className={`p-2.5 rounded border text-xs flex items-center justify-between ${
                  variance === 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium">
                  {variance === 0 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  )}
                  <span>{variance === 0 ? 'Physical matches Drawer Book' : 'Discrepancy / Variance'}</span>
                </div>
                <span className="font-mono font-medium">
                  {variance >= 0 ? `+ ₹ ${variance.toLocaleString('en-IN')}` : `- ₹ ${Math.abs(variance).toLocaleString('en-IN')}`}
                </span>
              </div>

              <button
                onClick={() => setIsVaultDrawerOpen(true)}
                className="w-full py-2 px-3 rounded bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Handover to Safe Vault</span>
              </button>
            </div>
          </div>
        </div>

        {/* Entries Table or Empty State */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-neutral-500">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
              <p className="text-xs font-medium">Loading live cash book transactions...</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center p-8 bg-white rounded-lg border border-[#e5e7eb] shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-neutral-900 mb-1">No Cash Book Entries Found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mb-4">
                {searchQuery
                  ? 'No entries match your search query. Try clearing the filter.'
                  : 'Start recording counter cash inflows, customer advances, petty cash vouchers, and safe vault transfers.'}
              </p>
              <button
                onClick={() => setIsNewEntryOpen(true)}
                className="px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Cash Entry</span>
              </button>
            </div>
          ) : (
            <div className="border border-[#e5e7eb] rounded-lg bg-white overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-neutral-500 uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3 font-medium">Date & Time</th>
                      <th className="py-2.5 px-3 font-medium">Type</th>
                      <th className="py-2.5 px-3 font-medium">Particulars</th>
                      <th className="py-2.5 px-3 font-medium">Ref / Voucher</th>
                      <th className="py-2.5 px-3 font-medium">Cashier</th>
                      <th className="py-2.5 px-3 font-medium text-right">Amount (₹)</th>
                      <th className="py-2.5 px-3 font-medium text-right">Drawer Bal (₹)</th>
                      <th className="py-2.5 px-3 font-medium text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0] text-neutral-700">
                    {filteredEntries.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-2 px-3 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                          {row.entry_time}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          {row.type === 'INFLOW' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                              INFLOW
                            </span>
                          )}
                          {row.type === 'OUTFLOW' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              <ArrowUpRight className="w-3 h-3 text-amber-600" />
                              OUTFLOW
                            </span>
                          )}
                          {row.type === 'VAULT_TRANSFER' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              <ArrowRightLeft className="w-3 h-3 text-blue-600" />
                              VAULT DROP
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 max-w-xs truncate font-medium text-neutral-900" title={row.particulars}>
                          {row.particulars}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-neutral-600 whitespace-nowrap">
                          <button
                            onClick={() => copyToClipboard(row.reference_no, row.id)}
                            className="inline-flex items-center gap-1 hover:text-emerald-700 cursor-pointer"
                            title="Copy Ref #"
                          >
                            <span>{row.reference_no}</span>
                            {copiedId === row.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-2.5 h-2.5 text-neutral-400 opacity-60" />
                            )}
                          </button>
                        </td>
                        <td className="py-2 px-3 text-neutral-600 whitespace-nowrap">{row.cashier_name}</td>
                        <td
                          className={`py-2 px-3 font-mono font-medium text-right whitespace-nowrap ${
                            row.type === 'INFLOW'
                              ? 'text-emerald-700'
                              : row.type === 'OUTFLOW'
                              ? 'text-amber-700'
                              : 'text-blue-700'
                          }`}
                        >
                          {row.type === 'INFLOW' ? '+' : '-'} ₹ {row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 font-mono text-neutral-900 text-right whitespace-nowrap font-medium">
                          ₹ {row.drawer_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => setItemToDelete(row)}
                            className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete entry"
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

      {/* MODAL: New Cash Entry */}
      {isNewEntryOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-medium text-neutral-900 uppercase tracking-wider">
                  Record Counter Cash Entry
                </h3>
              </div>
              <button
                onClick={() => setIsNewEntryOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Cash Flow Direction
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType('INFLOW')}
                    className={`py-2 px-3 rounded border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      newType === 'INFLOW'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'border-[#e2e8f0] text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Inflow (Receipt)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('OUTFLOW')}
                    className={`py-2 px-3 rounded border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      newType === 'OUTFLOW'
                        ? 'bg-amber-50 border-amber-500 text-amber-800'
                        : 'border-[#e2e8f0] text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
                    <span>Outflow (Petty)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Particulars / Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. POS Bill #1042 / Refreshment expense / Gold Scrap float"
                  value={newParticulars}
                  onChange={(e) => setNewParticulars(e.target.value)}
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
                    Ref / Bill / Voucher #
                  </label>
                  <input
                    type="text"
                    placeholder="POS-2026-XXXX"
                    value={newRef}
                    onChange={(e) => setNewRef(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Cashier / Counter
                  </label>
                  <select
                    value={newCashier}
                    onChange={(e) => setNewCashier(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                  >
                    <option value="Priya Sharma (Counter 1)">Priya Sharma (Counter 1)</option>
                    <option value="Anjali Nair (Counter 2)">Anjali Nair (Counter 2)</option>
                    <option value="Ramesh Patel (Head Cashier)">Ramesh Patel (Head Cashier)</option>
                    <option value="Suresh Verma (Vault Custodian)">Suresh Verma (Vault Custodian)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                  >
                    <option value="POS Bill Sale">POS Bill Sale</option>
                    <option value="Customer Advance">Customer Advance</option>
                    <option value="Petty Cash Overhead">Petty Cash Overhead</option>
                    <option value="Store Refreshments">Store Refreshments</option>
                    <option value="Security / Courier">Security / Courier</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Preview */}
              <div className="p-2.5 rounded bg-neutral-50 border border-[#e2e8f0] flex items-center justify-between text-[11px]">
                <span className="text-neutral-500">Projected Drawer Bal:</span>
                <span className="font-mono font-medium text-neutral-900">
                  ₹{' '}
                  {(newType === 'INFLOW'
                    ? currentBookBalance + Number(newAmount)
                    : currentBookBalance - Number(newAmount)
                  ).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setIsNewEntryOpen(false)}
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
                  <span>Save to Cash Book</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Safe Vault Handover */}
      {isVaultDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-medium text-neutral-900 uppercase tracking-wider">
                  Transfer Cash to Main Safe Vault
                </h3>
              </div>
              <button
                onClick={() => setIsVaultDrawerOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleVaultTransfer} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Vault Transfer Amount (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={vaultAmount || ''}
                  onChange={(e) => setVaultAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono font-medium focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Receiving Vault Custodian *
                </label>
                <select
                  value={vaultCustodian}
                  onChange={(e) => setVaultCustodian(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                >
                  <option value="Suresh Verma (Vault Custodian)">Suresh Verma (Vault Custodian)</option>
                  <option value="Rajesh Gupta (General Manager)">Rajesh Gupta (General Manager)</option>
                  <option value="Central Strongroom Guard #02">Central Strongroom Guard #02</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Vault Remarks / Locker ID
                </label>
                <input
                  type="text"
                  value={vaultRemarks}
                  onChange={(e) => setVaultRemarks(e.target.value)}
                  placeholder="e.g. End-of-day excess cash deposit into Safe Locker #A2"
                  className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center justify-between">
                <span>Remaining in Counter Drawer:</span>
                <span className="font-mono font-medium">
                  ₹ {(currentBookBalance - Number(vaultAmount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setIsVaultDrawerOpen(false)}
                  className="px-3 py-1.5 rounded border border-[#e2e8f0] text-neutral-600 hover:bg-neutral-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}
                  <span>Confirm Vault Handover</span>
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
              <h3 className="text-sm font-medium text-neutral-900">Delete Cash Entry?</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Are you sure you want to delete entry <span className="font-mono font-medium text-neutral-800">#{itemToDelete.reference_no}</span> (₹ {itemToDelete.amount.toLocaleString('en-IN')})?
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
                onClick={handleDeleteEntry}
                disabled={saving}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                <span>Delete Entry</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
