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
  Lock,
  Unlock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Scale,
  Coins,
  CreditCard,
  Copy,
  Check,
  X,
  FileCheck,
  Building,
  RotateCcw,
  Loader2,
  Trash2,
  Plus,
} from 'lucide-react';

export interface DayClosingRecord {
  id: string;
  closing_date: string;
  total_sales_value: number;
  gold_weight_sold_g: number;
  silver_weight_sold_g?: number;
  cash_in_drawer: number;
  bank_pos_total: number;
  upi_collection?: number;
  cash_tallied: boolean;
  vault_status: 'LOCKED' | 'OPEN';
  closed_at: string;
  approved_by: string;
  manager_notes?: string;
  created_at?: any;
}

export function FinanceDayClosingView() {
  const [closings, setClosings] = useState<DayClosingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<DayClosingRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // 4-step checklist state for daily operational check
  const [step1Cash, setStep1Cash] = useState(true);
  const [step2Gold, setStep2Gold] = useState(true);
  const [step3Card, setStep3Card] = useState(true);
  const [step4Scrap, setStep4Scrap] = useState(true);

  // Modal State
  const [isNewClosingOpen, setIsNewClosingOpen] = useState(false);
  const [closeDate, setCloseDate] = useState(new Date().toISOString().substring(0, 10));
  const [salesVal, setSalesVal] = useState<number>(0);
  const [goldSoldGrams, setGoldSoldGrams] = useState<number>(0);
  const [silverSoldGrams, setSilverSoldGrams] = useState<number>(0);
  const [cashDrawerVal, setCashDrawerVal] = useState<number>(0);
  const [bankPosVal, setBankPosVal] = useState<number>(0);
  const [upiVal, setUpiVal] = useState<number>(0);
  const [approver, setApprover] = useState('Rajesh Gupta (General Manager)');
  const [vaultLocked, setVaultLocked] = useState(true);
  const [notes, setNotes] = useState('All 6 POS counters tallied. Physical strongroom vault time-lock engaged.');

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchClosings = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'finance_day_closing'));
      const list: DayClosingRecord[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<DayClosingRecord, 'id'>) });
      });
      list.sort((a, b) => (b.closing_date || '').localeCompare(a.closing_date || ''));
      setClosings(list);
    } catch (err: any) {
      console.error('Error fetching day closings:', err);
      showToast('error', err.message || 'Failed to fetch day closing logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClosings();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle Vault Lock
  const handleToggleVault = async (id: string, currentStatus: 'LOCKED' | 'OPEN') => {
    const nextStatus = currentStatus === 'LOCKED' ? 'OPEN' : 'LOCKED';
    try {
      await updateDoc(doc(db, 'finance_day_closing', id), {
        vault_status: nextStatus,
      });
      setClosings((prev) =>
        prev.map((c) => (c.id === id ? { ...c, vault_status: nextStatus } : c))
      );
      showToast(
        'success',
        `Strongroom vault status set to ${nextStatus}`
      );
    } catch (err: any) {
      console.error('Error toggling vault status:', err);
      showToast('error', err.message || 'Failed to update vault status');
    }
  };

  // Record Closing
  const handleCreateClosing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (salesVal <= 0) {
      showToast('error', 'Please enter total showroom sales value');
      return;
    }

    try {
      setSaving(true);
      const payload: Omit<DayClosingRecord, 'id'> = {
        closing_date: closeDate,
        total_sales_value: Number(salesVal),
        gold_weight_sold_g: Number(goldSoldGrams),
        silver_weight_sold_g: Number(silverSoldGrams),
        cash_in_drawer: Number(cashDrawerVal),
        bank_pos_total: Number(bankPosVal),
        upi_collection: Number(upiVal),
        cash_tallied: step1Cash,
        vault_status: vaultLocked ? 'LOCKED' : 'OPEN',
        closed_at: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        approved_by: approver,
        manager_notes: notes.trim() || undefined,
        created_at: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'finance_day_closing'), payload);
      setClosings((prev) => [{ id: docRef.id, ...payload }, ...prev]);
      setIsNewClosingOpen(false);
      showToast('success', `Executed Day Closing for ${closeDate}`);
    } catch (err: any) {
      console.error('Error creating day closing:', err);
      showToast('error', err.message || 'Failed to save day closing record');
    } finally {
      setSaving(false);
    }
  };

  // Delete Closing
  const handleDeleteClosing = async () => {
    if (!itemToDelete) return;
    try {
      setSaving(true);
      await deleteDoc(doc(db, 'finance_day_closing', itemToDelete.id));
      setClosings((prev) => prev.filter((c) => c.id !== itemToDelete.id));
      showToast('success', `Deleted closing log for date ${itemToDelete.closing_date}`);
      setItemToDelete(null);
    } catch (err: any) {
      console.error('Error deleting closing:', err);
      showToast('error', err.message || 'Failed to delete closing log');
    } finally {
      setSaving(false);
    }
  };

  // KPI calculations
  const totalSalesAllTime = closings.reduce((acc, curr) => acc + (Number(curr.total_sales_value) || 0), 0);
  const totalGoldSoldAllTime = closings.reduce((acc, curr) => acc + (Number(curr.gold_weight_sold_g) || 0), 0);
  const totalCashTalliedAllTime = closings.reduce((acc, curr) => acc + (Number(curr.cash_in_drawer) || 0), 0);
  const lockedVaultsCount = closings.filter((c) => c.vault_status === 'LOCKED').length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="day_closing_vault_audit" />
      <ActionToolbar
        filterPlaceholder="Filter by date, manager, audit status..."
        insertLabel="Execute Day Closing"
        onInsertClick={() => setIsNewClosingOpen(true)}
        onRefresh={fetchClosings}
      />

      <FinanceNavigationHeader activePage="day-closing" />

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
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Sales Reconciled</span>
                <Coins className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700 font-mono">
                ₹ {totalSalesAllTime.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1">Gross POS & Invoices billed</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Gold Weight Sold</span>
                <Scale className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">
                {totalGoldSoldAllTime.toFixed(2)} <span className="text-xs text-neutral-500 font-sans">grams</span>
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Fine weight deducted from stock</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Counter Cash Vaulted</span>
                <Building className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">
                ₹ {totalCashTalliedAllTime.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Safely handed over to safe vault</div>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-200 hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-emerald-800 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Vault Integrity</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div className="text-xl font-medium text-emerald-900 font-mono">
                {lockedVaultsCount} / {closings.length}{' '}
                <span className="text-xs text-emerald-700 font-sans font-medium">Locked</span>
              </div>
              <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Physical Security Verified
              </div>
            </div>
          </div>
        </div>

        {/* 4-Step Day End Verification Checklist */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white shrink-0">
          <div className="p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium text-neutral-800 uppercase tracking-wider">
                  Mandatory Showroom Day-End 4-Step Checklist
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 font-medium">Verify before locking vault doors</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <label
                className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 cursor-pointer transition-colors ${
                  step1Cash ? 'bg-white border-emerald-300 shadow-2xs' : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={step1Cash}
                  onChange={(e) => setStep1Cash(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-medium text-neutral-900">1. Counter Cash Tally</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Physical bills counted vs POS counter balances match 100%.
                  </div>
                </div>
              </label>

              <label
                className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 cursor-pointer transition-colors ${
                  step2Gold ? 'bg-white border-emerald-300 shadow-2xs' : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={step2Gold}
                  onChange={(e) => setStep2Gold(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-medium text-neutral-900">2. Gold Scale Audit</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    High-precision weighing scale matches stock ledger deducts.
                  </div>
                </div>
              </label>

              <label
                className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 cursor-pointer transition-colors ${
                  step3Card ? 'bg-white border-emerald-300 shadow-2xs' : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={step3Card}
                  onChange={(e) => setStep3Card(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-medium text-neutral-900">3. Card & UPI Batch Close</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    PineLabs / Paytm terminals batch settlement printed and reconciled.
                  </div>
                </div>
              </label>

              <label
                className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 cursor-pointer transition-colors ${
                  step4Scrap ? 'bg-white border-emerald-300 shadow-2xs' : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={step4Scrap}
                  onChange={(e) => setStep4Scrap(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-medium text-neutral-900">4. Safe Vault Dual Lock</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Dual key turn + Electronic time-lock engaged by Custodian.
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Day Closing History Table or Empty State */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-neutral-500">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
              <p className="text-xs font-medium">Loading live day closing records...</p>
            </div>
          ) : closings.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center p-8 bg-white rounded-lg border border-[#e5e7eb] shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-neutral-900 mb-1">No Day Closing Logs Recorded</h3>
              <p className="text-xs text-neutral-500 max-w-sm mb-4">
                Execute end-of-day closing to freeze sales ledgers, tally drawer cash, and lock the strongroom vault.
              </p>
              <button
                onClick={() => setIsNewClosingOpen(true)}
                className="px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Execute First Day Closing</span>
              </button>
            </div>
          ) : (
            <div className="border border-[#e5e7eb] rounded-lg bg-white overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-neutral-500 uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3 font-medium">Closing Date</th>
                      <th className="py-2.5 px-3 font-medium">Closed At</th>
                      <th className="py-2.5 px-3 font-medium text-right">Total Sales (₹)</th>
                      <th className="py-2.5 px-3 font-medium text-right">Gold Sold (g)</th>
                      <th className="py-2.5 px-3 font-medium text-right">Cash Drawer (₹)</th>
                      <th className="py-2.5 px-3 font-medium text-center">Cash Tallied</th>
                      <th className="py-2.5 px-3 font-medium text-center">Vault Status</th>
                      <th className="py-2.5 px-3 font-medium">Approved By</th>
                      <th className="py-2.5 px-3 font-medium text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0] text-neutral-700">
                    {closings.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-2 px-3 font-mono font-medium text-neutral-900 whitespace-nowrap">
                          {row.closing_date}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                          {row.closed_at}
                        </td>
                        <td className="py-2 px-3 font-mono font-medium text-emerald-700 text-right whitespace-nowrap">
                          ₹ {row.total_sales_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 font-mono text-neutral-800 text-right whitespace-nowrap">
                          {row.gold_weight_sold_g.toFixed(2)} g
                        </td>
                        <td className="py-2 px-3 font-mono text-neutral-800 text-right whitespace-nowrap">
                          ₹ {(row.cash_in_drawer || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          {row.cash_tallied ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Tallied
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                              Discrepancy
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleToggleVault(row.id, row.vault_status)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                              row.vault_status === 'LOCKED'
                                ? 'bg-neutral-900 text-emerald-400 border border-neutral-800 hover:bg-neutral-800'
                                : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                            }`}
                            title="Click to toggle vault security status"
                          >
                            {row.vault_status === 'LOCKED' ? (
                              <>
                                <Lock className="w-3 h-3 text-emerald-400" />
                                <span>SECURE LOCKED</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3 h-3 text-red-500" />
                                <span>UNLOCKED</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-2 px-3 text-neutral-600 max-w-xs truncate" title={row.approved_by}>
                          {row.approved_by}
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => setItemToDelete(row)}
                            className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete closing log"
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

      {/* MODAL: Execute Day Closing */}
      {isNewClosingOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-medium text-neutral-900 uppercase tracking-wider">
                  Execute Daily Showroom Closing
                </h3>
              </div>
              <button
                onClick={() => setIsNewClosingOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClosing} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Closing Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={closeDate}
                    onChange={(e) => setCloseDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Approving Manager *
                  </label>
                  <select
                    value={approver}
                    onChange={(e) => setApprover(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                  >
                    <option value="Rajesh Gupta (General Manager)">Rajesh Gupta (General Manager)</option>
                    <option value="Suresh Verma (Chief Custodian)">Suresh Verma (Chief Custodian)</option>
                    <option value="Siva Krishna (Finance Controller)">Siva Krishna (Finance Controller)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Total Sales Value (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={salesVal || ''}
                    onChange={(e) => setSalesVal(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono font-medium focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Gold Sold (Grams) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={goldSoldGrams || ''}
                    onChange={(e) => setGoldSoldGrams(parseFloat(e.target.value) || 0)}
                    placeholder="0.00 g"
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Cash in Drawer (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={cashDrawerVal || ''}
                    onChange={(e) => setCashDrawerVal(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Bank POS EDC (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bankPosVal || ''}
                    onChange={(e) => setBankPosVal(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    UPI QR Inward (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={upiVal || ''}
                    onChange={(e) => setUpiVal(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Manager Security Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. All 6 POS counters tallied. Physical strongroom vault time-lock engaged."
                  className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="vaultLockCheck"
                  checked={vaultLocked}
                  onChange={(e) => setVaultLocked(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="vaultLockCheck" className="text-[11px] text-neutral-700 font-medium cursor-pointer">
                  Confirm Safe Strongroom Vault Locked & Arm Alarm
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setIsNewClosingOpen(false)}
                  className="px-3 py-1.5 rounded border border-[#e2e8f0] text-neutral-600 hover:bg-neutral-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>Save Day Closing</span>
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
              <h3 className="text-sm font-medium text-neutral-900">Delete Day Closing Log?</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Are you sure you want to delete day closing for date <span className="font-mono font-medium text-neutral-800">{itemToDelete.closing_date}</span> (₹ {itemToDelete.total_sales_value.toLocaleString('en-IN')})?
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
                onClick={handleDeleteClosing}
                disabled={saving}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                <span>Delete Closing</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
