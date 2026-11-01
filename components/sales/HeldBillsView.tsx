'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import { SalesSubNav } from './SalesSubNav';
import {
  PauseCircle,
  Play,
  Trash2,
  Printer,
  BadgeIndianRupee,
  Lock,
  X,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  Eye,
  RefreshCw,
  Scale,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';

export interface HeldBillsRecord {
  id: string;
  held_token_no: string;
  terminal_id: string;
  counter_staff: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  items_count: number;
  total_gross_wt_g: number;
  total_net_wt_g: number;
  tentative_total: number;
  parked_at: string;
  auto_release_time: string;
  items_summary: string;
  status: 'PARKED_LOCKED' | 'RESUMED' | 'RELEASED';
  created_at?: string;
}

export function SalesHeldBillsView() {
  const [heldBills, setHeldBills] = useState<HeldBillsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PARKED_LOCKED' | 'RESUMED' | 'RELEASED'>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<HeldBillsRecord | null>(null);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [tokenNo, setTokenNo] = useState('');
  const [terminalId, setTerminalId] = useState('COUNTER-01');
  const [counterStaff, setCounterStaff] = useState('Active Cashier');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [itemsCount, setItemsCount] = useState('2');
  const [grossWeight, setGrossWeight] = useState('');
  const [netWeight, setNetWeight] = useState('');
  const [tentativeTotal, setTentativeTotal] = useState('');
  const [autoReleaseTime, setAutoReleaseTime] = useState('Auto-release in 60 mins');
  const [itemsSummary, setItemsSummary] = useState('');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const fetchHeldBills = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'sales_held_bills'));
      const list: HeldBillsRecord[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<HeldBillsRecord, 'id'>) });
      });
      list.sort((a, b) => new Date(b.parked_at || b.created_at || '').getTime() - new Date(a.parked_at || a.created_at || '').getTime());
      setHeldBills(list);
    } catch (err: unknown) {
      console.error('Error fetching held bills:', err);
      showToast('error', 'Failed to load held bills from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeldBills();
  }, []);

  const handleOpenAddModal = () => {
    setTokenNo(`HOLD-TK-${Math.floor(100 + Math.random() * 900)}`);
    setTerminalId('COUNTER-01');
    setCounterStaff('Active Cashier');
    setCustomerName('');
    setCustomerPhone('');
    setItemsCount('2');
    setGrossWeight('');
    setNetWeight('');
    setTentativeTotal('');
    setAutoReleaseTime('Auto-release in 60 mins');
    setItemsSummary('');
    setIsAddModalOpen(true);
  };

  const handleCreateHeldBill = async (e: React.FormEvent) => {
    e.preventDefault();
    const gross = parseFloat(grossWeight) || 0;
    const net = parseFloat(netWeight) || gross;
    const total = parseFloat(tentativeTotal) || 0;
    if (!customerName.trim() || gross <= 0) {
      showToast('error', 'Customer name and valid weight are required.');
      return;
    }

    try {
      setSaving(true);
      const heldData = {
        held_token_no: tokenNo.trim(),
        terminal_id: terminalId,
        counter_staff: counterStaff.trim(),
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim() || 'N/A',
        items_count: parseInt(itemsCount) || 1,
        total_gross_wt_g: gross,
        total_net_wt_g: net,
        tentative_total: total,
        parked_at: new Date().toISOString(),
        auto_release_time: autoReleaseTime,
        items_summary: itemsSummary.trim() || 'Selected jewellery items on counter hold',
        status: 'PARKED_LOCKED' as const,
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'sales_held_bills'), heldData);
      const newBill: HeldBillsRecord = { id: docRef.id, ...heldData };
      setHeldBills((prev) => [newBill, ...prev]);
      setIsAddModalOpen(false);
      showToast('success', `Bill parked with token ${newBill.held_token_no}.`);
    } catch (err: unknown) {
      console.error('Error parking bill:', err);
      showToast('error', 'Failed to save parked bill to Firestore.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: HeldBillsRecord['status']) => {
    try {
      await updateDoc(doc(db, 'sales_held_bills', id), { status: newStatus });
      setHeldBills((prev) => prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
      showToast('success', `Bill status changed to ${newStatus.replace(/_/g, ' ')}`);
    } catch (err: unknown) {
      console.error('Error updating held bill status:', err);
      showToast('error', 'Failed to update bill status.');
    }
  };

  const handleDeleteHeldBill = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteDoc(doc(db, 'sales_held_bills', id));
      setHeldBills((prev) => prev.filter((b) => b.id !== id));
      setDeleteConfirmId(null);
      showToast('success', 'Parked bill discarded and removed.');
    } catch (err: unknown) {
      console.error('Error deleting held bill:', err);
      showToast('error', 'Failed to delete parked bill.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredBills = heldBills.filter((b) => {
    const s = searchQuery.toLowerCase();
    const matchesSearch =
      b.held_token_no?.toLowerCase().includes(s) ||
      b.customer_name?.toLowerCase().includes(s) ||
      b.customer_phone?.toLowerCase().includes(s) ||
      b.terminal_id?.toLowerCase().includes(s) ||
      b.items_summary?.toLowerCase().includes(s);
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeParkedCount = heldBills.filter((b) => b.status === 'PARKED_LOCKED').length;
  const totalParkedValue = heldBills
    .filter((b) => b.status === 'PARKED_LOCKED')
    .reduce((acc, curr) => acc + (curr.tentative_total || 0), 0);
  const totalParkedWeight = heldBills
    .filter((b) => b.status === 'PARKED_LOCKED')
    .reduce((acc, curr) => acc + (curr.total_gross_wt_g || 0), 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="sales_held_bills" />
      <ActionToolbar
        filterPlaceholder="Filter by token #, customer, terminal, items..."
        insertLabel="Park Bill"
        onRefresh={fetchHeldBills}
        onInsertClick={handleOpenAddModal}
      />
      <SalesSubNav />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        <div className="p-4 sm:p-5 flex flex-col gap-4 max-w-7xl w-full mx-auto">
          {/* Toast */}
          {toastType === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}
          {toastType === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Active Parked</span>
                <PauseCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-amber-700">{activeParkedCount}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">{heldBills.length} Total recorded</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Locked Total (₹)</span>
                <BadgeIndianRupee className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                ₹{totalParkedValue.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Tentative pending sales</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Locked Gold Weight</span>
                <Scale className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                {totalParkedWeight.toFixed(3)} <span className="text-xs text-neutral-500 font-normal">g</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Temporarily reserved</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Resumed / Settled</span>
                <Play className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700">
                {heldBills.filter((b) => b.status === 'RESUMED').length} Resumed
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">Checked out in POS</div>
            </div>
          </div>

          {/* Filters & Actions Bar */}
          <div className="bg-white p-3 rounded-lg border border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search token #, customer, terminal, items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-[#e2e8f0] rounded-md text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500 font-medium">Status:</span>
              {(['ALL', 'PARKED_LOCKED', 'RESUMED', 'RELEASED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    statusFilter === st
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-neutral-50 text-neutral-600 border border-[#e2e8f0] hover:bg-neutral-100'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}

              <Link
                href="/sales/billing-pos"
                className="ml-2 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded font-medium text-[11px] flex items-center gap-1 transition-colors"
              >
                <span>POS Counter</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Table / Empty State */}
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center bg-white rounded-lg border border-[#e2e8f0]">
              <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mb-2" />
              <span className="text-xs text-neutral-500 font-medium">Loading parked bills from Firestore...</span>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center bg-white rounded-lg border border-[#e2e8f0] text-center">
              <PauseCircle className="w-10 h-10 text-neutral-300 mb-3 stroke-1" />
              <h3 className="text-sm font-medium text-neutral-800 mb-1">No Held / Parked Bills</h3>
              <p className="text-xs text-neutral-500 max-w-sm mb-4">
                {searchQuery
                  ? 'No held bills match your search criteria.'
                  : 'There are no bills currently parked on hold. When customers pause to browse other ornaments or arrange payment, park them from POS.'}
              </p>
              <button
                onClick={handleOpenAddModal}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Park a Bill</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-[#e2e8f0] text-neutral-600 font-medium text-[11px]">
                      <th className="py-2.5 px-3">Token #</th>
                      <th className="py-2.5 px-3">Terminal & Staff</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Items Summary</th>
                      <th className="py-2.5 px-2 text-right">Gross Wt</th>
                      <th className="py-2.5 px-3 text-right">Tentative Total</th>
                      <th className="py-2.5 px-3">Auto Release</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {filteredBills.map((b) => (
                      <tr key={b.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-medium text-neutral-800">
                          {b.held_token_no}
                          <div className="text-[10px] text-neutral-400 font-sans">
                            {b.parked_at ? new Date(b.parked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-neutral-800">{b.terminal_id}</div>
                          <div className="text-[10px] text-neutral-500">{b.counter_staff}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-neutral-800">{b.customer_name}</div>
                          <div className="text-[10px] text-neutral-400 font-mono">{b.customer_phone}</div>
                        </td>
                        <td className="py-2.5 px-3 max-w-xs">
                          <div className="truncate text-neutral-700 font-medium" title={b.items_summary}>
                            {b.items_summary}
                          </div>
                          <div className="text-[10px] text-neutral-400">{b.items_count} pieces reserved</div>
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-neutral-700">
                          {b.total_gross_wt_g?.toFixed(3)}g
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-700">
                          ₹{b.tentative_total?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-neutral-500 text-[11px]">
                          {b.auto_release_time}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium font-mono ${
                              b.status === 'PARKED_LOCKED'
                                ? 'bg-amber-100 text-amber-800'
                                : b.status === 'RESUMED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {b.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {b.status === 'PARKED_LOCKED' && (
                              <Link
                                href="/sales/billing-pos"
                                onClick={() => handleUpdateStatus(b.id, 'RESUMED')}
                                className="p-1 rounded text-emerald-700 hover:bg-emerald-50 transition-colors"
                                title="Resume in POS Billing"
                              >
                                <Play className="w-3.5 h-3.5 fill-emerald-600" />
                              </Link>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBill(b);
                                setIsTokenModalOpen(true);
                              }}
                              className="p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-neutral-100 transition-colors"
                              title="View Token Slip"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(b.id)}
                              className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Discard Hold"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

      {/* CREATE NEW HELD BILL MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 border border-[#e2e8f0] animate-fadeIn text-xs max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] mb-4">
              <div className="flex items-center gap-2">
                <PauseCircle className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-neutral-800 text-sm">Park / Hold Counter Sale</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateHeldBill} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Token # *</label>
                  <input
                    type="text"
                    required
                    value={tokenNo}
                    onChange={(e) => setTokenNo(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Terminal</label>
                  <select
                    value={terminalId}
                    onChange={(e) => setTerminalId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="COUNTER-01">COUNTER-01</option>
                    <option value="COUNTER-02">COUNTER-02</option>
                    <option value="COUNTER-03">COUNTER-03</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Srinivasulu M"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">Customer Phone</label>
                <input
                  type="text"
                  placeholder="+91 98490 22340"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">Items Description</label>
                <input
                  type="text"
                  placeholder="e.g. 22K Gents Chain, Antique Kada"
                  value={itemsSummary}
                  onChange={(e) => setItemsSummary(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Pieces</label>
                  <input
                    type="number"
                    value={itemsCount}
                    onChange={(e) => setItemsCount(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Gross Wt (g) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="0.000"
                    value={grossWeight}
                    onChange={(e) => {
                      setGrossWeight(e.target.value);
                      if (!netWeight) setNetWeight(e.target.value);
                    }}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Tentative Total (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={tentativeTotal}
                    onChange={(e) => setTentativeTotal(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">Auto-release Timeout</label>
                <select
                  value={autoReleaseTime}
                  onChange={(e) => setAutoReleaseTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Auto-release in 30 mins">30 Minutes</option>
                  <option value="Auto-release in 60 mins">60 Minutes</option>
                  <option value="Auto-release in 120 mins">2 Hours</option>
                  <option value="Hold until end of business day">End of Business Day</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 border border-[#e2e8f0] text-neutral-600 rounded font-medium hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{saving ? 'Holding...' : 'Park Sale on Counter'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW / PRINT TOKEN SLIP MODAL */}
      {isTokenModalOpen && selectedBill && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full p-5 border border-[#e2e8f0] animate-fadeIn text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] mb-3">
              <div>
                <h2 className="text-base font-medium text-neutral-800">HELD BILL COUNTER TOKEN</h2>
                <p className="text-[11px] text-neutral-500">{selectedBill.terminal_id} • Staff: {selectedBill.counter_staff}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsTokenModalOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-3 bg-neutral-50 rounded border border-[#e2e8f0] mb-3">
              <span className="text-[11px] text-neutral-500 block uppercase font-medium">Token Number</span>
              <span className="text-2xl font-mono font-medium text-neutral-900">{selectedBill.held_token_no}</span>
            </div>

            <div className="space-y-1.5 text-[11px] pb-3 border-b border-[#e2e8f0]">
              <div className="flex justify-between">
                <span className="text-neutral-500">Customer</span>
                <span className="font-medium text-neutral-800">{selectedBill.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Items Summary</span>
                <span className="font-medium text-neutral-800 text-right truncate max-w-[180px]">
                  {selectedBill.items_summary}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Reserved Weight</span>
                <span className="font-mono text-neutral-800">{selectedBill.total_gross_wt_g?.toFixed(3)}g</span>
              </div>
              <div className="flex justify-between font-medium pt-1 border-t border-[#e2e8f0]">
                <span>Tentative Total</span>
                <span className="font-mono text-emerald-700">₹{selectedBill.tentative_total?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <span className="text-[10px] text-neutral-400">
                {selectedBill.auto_release_time}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTokenModalOpen(false)}
                  className="px-3 py-1.5 border border-[#e2e8f0] rounded text-neutral-600 hover:bg-neutral-50 font-medium"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-4 border border-[#e2e8f0] animate-fadeIn text-xs">
            <h3 className="font-medium text-neutral-800 text-sm mb-2">Discard Held Bill?</h3>
            <p className="text-neutral-500 mb-4">
              Are you sure you want to discard this held bill? Reserved items will be released back to active stock.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 border border-[#e2e8f0] text-neutral-600 rounded font-medium hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingId === deleteConfirmId}
                onClick={() => handleDeleteHeldBill(deleteConfirmId)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-medium flex items-center gap-1"
              >
                {deletingId === deleteConfirmId ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
                <span>Discard</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
