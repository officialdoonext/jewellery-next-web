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
  CreditCard,
  QrCode,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  Check,
  X,
  Plus,
  ShieldCheck,
  Loader2,
  Trash2,
  AlertCircle,
  Monitor,
} from 'lucide-react';

export interface SettlementRecord {
  id: string;
  pos_machine: string;
  card_type: 'Visa' | 'Mastercard' | 'RuPay' | 'UPI QR' | 'Amex';
  batch_no: string;
  gross_swipe: number;
  mdr_rate?: number;
  mdr_deducted: number;
  net_credited: number;
  settlement_utr: string;
  settled_at: string;
  status: 'SETTLED' | 'PROCESSING' | 'DISPUTED';
  bank_account?: string;
  created_at?: any;
}

const POS_TERMINAL_OPTIONS = [
  'PineLabs Plutus Terminal #01 (Counter 1)',
  'PineLabs Plutus Terminal #02 (Counter 2)',
  'Paytm UPI Soundbox Pro (Counter 1)',
  'Paytm UPI Soundbox Pro (Counter 2)',
  'Razorpay POS Android EDC (Bridal Lounge)',
  'HDFC SmartHub POS Terminal #03',
];

export function FinanceUpiCardView() {
  const [settlements, setSettlements] = useState<SettlementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals & drawers
  const [isNewSettlementOpen, setIsNewSettlementOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<SettlementRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [posMachine, setPosMachine] = useState(POS_TERMINAL_OPTIONS[0]);
  const [cardType, setCardType] = useState<SettlementRecord['card_type']>('Visa');
  const [batchNo, setBatchNo] = useState('BAT-912');
  const [grossSwipe, setGrossSwipe] = useState<number>(0);
  const [settlementUtr, setSettlementUtr] = useState('');
  const [bankAccount, setBankAccount] = useState('HDFC Jewellery Current - 9021');

  // Dynamic MDR Rate based on Card/UPI Type
  const mdrRate =
    cardType === 'UPI QR'
      ? 0
      : cardType === 'RuPay'
      ? 0.4
      : cardType === 'Visa' || cardType === 'Mastercard'
      ? 1.0
      : 1.8; // Amex

  const mdrDeducted = Number(((grossSwipe * mdrRate) / 100).toFixed(2));
  const netCredited = Number((grossSwipe - mdrDeducted).toFixed(2));

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchSettlements = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'finance_upi_card'));
      const list: SettlementRecord[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<SettlementRecord, 'id'>) });
      });
      list.sort((a, b) => (b.settled_at || '').localeCompare(a.settled_at || ''));
      setSettlements(list);
    } catch (err: any) {
      console.error('Error fetching settlements:', err);
      showToast('error', err.message || 'Failed to fetch settlements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Cycle Settlement Status
  const handleCycleStatus = async (id: string, currentStatus: SettlementRecord['status']) => {
    const nextStatus: SettlementRecord['status'] =
      currentStatus === 'SETTLED'
        ? 'PROCESSING'
        : currentStatus === 'PROCESSING'
        ? 'DISPUTED'
        : 'SETTLED';

    try {
      await updateDoc(doc(db, 'finance_upi_card', id), {
        status: nextStatus,
      });
      setSettlements((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: nextStatus } : s))
      );
      showToast('success', `Settlement status set to ${nextStatus}`);
    } catch (err: any) {
      console.error('Error updating settlement status:', err);
      showToast('error', err.message || 'Failed to update settlement');
    }
  };

  // Create Settlement
  const handleCreateSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (grossSwipe <= 0) {
      showToast('error', 'Please enter a valid gross swipe amount');
      return;
    }

    try {
      setSaving(true);
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const utrVal = settlementUtr.trim() || `UTR-${cardType.toUpperCase().replace(/\s+/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const payload: Omit<SettlementRecord, 'id'> = {
        pos_machine: posMachine,
        card_type: cardType,
        batch_no: batchNo.trim(),
        gross_swipe: Number(grossSwipe),
        mdr_rate: mdrRate,
        mdr_deducted: mdrDeducted,
        net_credited: netCredited,
        settlement_utr: utrVal,
        settled_at: nowStr,
        status: 'SETTLED',
        bank_account: bankAccount,
        created_at: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'finance_upi_card'), payload);
      setSettlements((prev) => [{ id: docRef.id, ...payload }, ...prev]);
      setIsNewSettlementOpen(false);
      setGrossSwipe(0);
      setSettlementUtr('');
      showToast('success', `Recorded batch settlement of ₹ ${netCredited.toLocaleString('en-IN')}`);
    } catch (err: any) {
      console.error('Error creating settlement:', err);
      showToast('error', err.message || 'Failed to save settlement record');
    } finally {
      setSaving(false);
    }
  };

  // Delete Settlement
  const handleDeleteSettlement = async () => {
    if (!itemToDelete) return;
    try {
      setSaving(true);
      await deleteDoc(doc(db, 'finance_upi_card', itemToDelete.id));
      setSettlements((prev) => prev.filter((s) => s.id !== itemToDelete.id));
      showToast('success', `Deleted batch settlement #${itemToDelete.settlement_utr}`);
      setItemToDelete(null);
    } catch (err: any) {
      console.error('Error deleting settlement:', err);
      showToast('error', err.message || 'Failed to delete settlement');
    } finally {
      setSaving(false);
    }
  };

  // KPI Calculations
  const totalGrossSwipe = settlements.reduce((acc, curr) => acc + (Number(curr.gross_swipe) || 0), 0);
  const totalMdrDeducted = settlements.reduce((acc, curr) => acc + (Number(curr.mdr_deducted) || 0), 0);
  const totalNetBankCredited = settlements.reduce((acc, curr) => acc + (Number(curr.net_credited) || 0), 0);
  const activeTerminalsCount = new Set(settlements.map((s) => s.pos_machine)).size;

  const filteredSettlements = settlements.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.pos_machine || '').toLowerCase().includes(q) ||
      (item.card_type || '').toLowerCase().includes(q) ||
      (item.settlement_utr || '').toLowerCase().includes(q) ||
      (item.batch_no || '').toLowerCase().includes(q) ||
      (item.status || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="upi_card_batch_settlement" />
      <ActionToolbar
        filterPlaceholder="Filter by terminal, card brand, batch #, UTR..."
        insertLabel="Record Settlement"
        onInsertClick={() => setIsNewSettlementOpen(true)}
        onRefresh={fetchSettlements}
      />

      <FinanceNavigationHeader activePage="upi-card" />

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
                <span className="text-[11px] font-medium uppercase tracking-wider">Gross Swipes & UPI</span>
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">
                ₹ {totalGrossSwipe.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Total customer digital payments</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">MDR Bank Interchange</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-amber-700 font-mono">
                ₹ {totalMdrDeducted.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-amber-600 mt-1">Terminal gateway fee deducted</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Net Bank Credited</span>
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700 font-mono">
                ₹ {totalNetBankCredited.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1">Settled into current account</div>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-200 hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-emerald-800 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">EDC Terminals Active</span>
                <Monitor className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div className="text-xl font-medium text-emerald-900 font-mono">
                {activeTerminalsCount || 4} Devices
              </div>
              <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                PineLabs, Paytm Soundbox & POS
              </div>
            </div>
          </div>
        </div>

        {/* Settlements Table or Empty State */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-neutral-500">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
              <p className="text-xs font-medium">Loading live batch settlements...</p>
            </div>
          ) : filteredSettlements.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center p-8 bg-white rounded-lg border border-[#e5e7eb] shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-neutral-900 mb-1">No Batch Settlements Found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mb-4">
                {searchQuery
                  ? 'No settlements match your search. Try clearing the query.'
                  : 'Record EDC credit card swipe batches, 0% MDR UPI QR collections, and daily bank payouts.'}
              </p>
              <button
                onClick={() => setIsNewSettlementOpen(true)}
                className="px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record Batch Settlement</span>
              </button>
            </div>
          ) : (
            <div className="border border-[#e5e7eb] rounded-lg bg-white overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-neutral-500 uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3 font-medium">Terminal Device</th>
                      <th className="py-2.5 px-3 font-medium">Card / Gateway</th>
                      <th className="py-2.5 px-3 font-medium">Batch #</th>
                      <th className="py-2.5 px-3 font-medium text-right">Gross Swipe (₹)</th>
                      <th className="py-2.5 px-3 font-medium text-right">MDR (₹)</th>
                      <th className="py-2.5 px-3 font-medium text-right">Net Credited (₹)</th>
                      <th className="py-2.5 px-3 font-medium">Settlement UTR</th>
                      <th className="py-2.5 px-3 font-medium">Settled Time</th>
                      <th className="py-2.5 px-3 font-medium text-center">Status</th>
                      <th className="py-2.5 px-3 font-medium text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0] text-neutral-700">
                    {filteredSettlements.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-2 px-3 font-medium text-neutral-900 whitespace-nowrap">
                          {row.pos_machine}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                              row.card_type === 'UPI QR'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : row.card_type === 'RuPay'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : row.card_type === 'Amex'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-[#f1f5f9] text-neutral-700 border-[#e2e8f0]'
                            }`}
                          >
                            {row.card_type}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-neutral-600 whitespace-nowrap">
                          {row.batch_no}
                        </td>
                        <td className="py-2 px-3 font-mono text-neutral-800 text-right whitespace-nowrap">
                          ₹ {row.gross_swipe.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 font-mono text-amber-700 text-right whitespace-nowrap">
                          - ₹ {row.mdr_deducted.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 font-mono font-medium text-emerald-700 text-right whitespace-nowrap">
                          ₹ {row.net_credited.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-neutral-600 whitespace-nowrap">
                          <button
                            onClick={() => copyToClipboard(row.settlement_utr, row.id)}
                            className="inline-flex items-center gap-1 hover:text-emerald-700 cursor-pointer"
                            title="Copy Settlement UTR"
                          >
                            <span>{row.settlement_utr}</span>
                            {copiedId === row.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-2.5 h-2.5 text-neutral-400 opacity-60" />
                            )}
                          </button>
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                          {row.settled_at}
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleCycleStatus(row.id, row.status)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                              row.status === 'SETTLED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : row.status === 'PROCESSING'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                                : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                            }`}
                            title="Click to cycle status"
                          >
                            {row.status === 'SETTLED' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>SETTLED</span>
                              </>
                            ) : row.status === 'PROCESSING' ? (
                              <>
                                <Clock className="w-3 h-3 text-blue-600" />
                                <span>PROCESSING</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3 h-3 text-red-600" />
                                <span>DISPUTED</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => setItemToDelete(row)}
                            className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete settlement"
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

      {/* MODAL: Record Batch Settlement */}
      {isNewSettlementOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-medium text-neutral-900 uppercase tracking-wider">
                  Record EDC / UPI Batch Settlement
                </h3>
              </div>
              <button
                onClick={() => setIsNewSettlementOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSettlement} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    POS Terminal Device *
                  </label>
                  <select
                    value={posMachine}
                    onChange={(e) => setPosMachine(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                  >
                    {POS_TERMINAL_OPTIONS.map((term) => (
                      <option key={term} value={term}>
                        {term}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Card / Payment Gateway Brand *
                  </label>
                  <select
                    value={cardType}
                    onChange={(e) => setCardType(e.target.value as SettlementRecord['card_type'])}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                  >
                    <option value="UPI QR">UPI QR (0% MDR - Free)</option>
                    <option value="RuPay">RuPay Debit Card (0.4% MDR)</option>
                    <option value="Visa">Visa Credit/Debit (1.0% MDR)</option>
                    <option value="Mastercard">Mastercard (1.0% MDR)</option>
                    <option value="Amex">American Express (1.8% MDR)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Gross Swipe Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={grossSwipe || ''}
                    onChange={(e) => setGrossSwipe(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono font-medium focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    placeholder="BAT-912"
                    value={batchNo}
                    onChange={(e) => setBatchNo(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Settlement Bank UTR #
                  </label>
                  <input
                    type="text"
                    placeholder="UTR-PINELABS-9021"
                    value={settlementUtr}
                    onChange={(e) => setSettlementUtr(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Credited Bank Account
                  </label>
                  <select
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                  >
                    <option value="HDFC Jewellery Current - 9021">HDFC Jewellery Current - 9021</option>
                    <option value="SBI Current Account - 1102">SBI Current Account - 1102</option>
                    <option value="ICICI Bullion Overdraft - 4410">ICICI Bullion Overdraft - 4410</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Live MDR Preview */}
              <div className="p-3 rounded-lg bg-[#f8fafc] border border-emerald-200 text-[11px] space-y-1.5">
                <div className="flex justify-between text-neutral-600">
                  <span>Gross Customer Swipe:</span>
                  <span className="font-mono">₹ {grossSwipe.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span>MDR Gateway Charge ({mdrRate}%):</span>
                  <span className="font-mono">- ₹ {mdrDeducted.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-medium text-emerald-900 pt-1 border-t border-emerald-100">
                  <span>Net Amount Credited to Bank:</span>
                  <span className="font-mono text-sm">₹ {netCredited.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setIsNewSettlementOpen(false)}
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
                  <span>Save Batch Settlement</span>
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
              <h3 className="text-sm font-medium text-neutral-900">Delete Settlement Record?</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Are you sure you want to delete batch <span className="font-mono font-medium text-neutral-800">#{itemToDelete.batch_no}</span> (₹ {itemToDelete.gross_swipe.toLocaleString('en-IN')}) for {itemToDelete.pos_machine}?
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
                onClick={handleDeleteSettlement}
                disabled={saving}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                <span>Delete Settlement</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
