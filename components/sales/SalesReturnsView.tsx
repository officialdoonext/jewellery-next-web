'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import { SalesSubNav } from './SalesSubNav';
import {
  RotateCcw,
  Receipt,
  Scale,
  BadgeIndianRupee,
  Flame,
  X,
  Printer,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  Eye,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
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

export interface SalesReturnRecord {
  id: string;
  credit_note_no: string;
  original_inv_no: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  return_date: string;
  ornament_description: string;
  original_weight_g: number;
  return_weight_g: number;
  weight_discrepancy_g: number;
  gold_rate_applied: number;
  deduction_amount: number;
  refund_amount: number;
  return_reason: string;
  settlement_mode: 'STORE_CREDIT_VOUCHER' | 'BANK_REFUND' | 'EXCHANGE_OFFSET';
  disposition: 'RESTOCK_TO_VAULT' | 'SENT_TO_MELTING';
  status: 'COMPLETED' | 'PENDING_APPROVAL';
  created_at: string;
}

export function SalesReturnsView() {
  const [returns, setReturns] = useState<SalesReturnRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING_APPROVAL'>('ALL');
  const [dispositionFilter, setDispositionFilter] = useState<'ALL' | 'RESTOCK_TO_VAULT' | 'SENT_TO_MELTING'>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<SalesReturnRecord | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [crnNo, setCrnNo] = useState('');
  const [invLookup, setInvLookup] = useState('');
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [ornamentDesc, setOrnamentDesc] = useState('');
  const [origWeight, setOrigWeight] = useState('');
  const [returnWeight, setReturnWeight] = useState('');
  const [goldRate, setGoldRate] = useState('7850');
  const [deduction, setDeduction] = useState('0');
  const [returnReason, setReturnReason] = useState('Size exchange requested');
  const [settlementMode, setSettlementMode] = useState<'STORE_CREDIT_VOUCHER' | 'BANK_REFUND' | 'EXCHANGE_OFFSET'>('STORE_CREDIT_VOUCHER');
  const [disposition, setDisposition] = useState<'RESTOCK_TO_VAULT' | 'SENT_TO_MELTING'>('RESTOCK_TO_VAULT');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'sales_returns'));
      const list: SalesReturnRecord[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<SalesReturnRecord, 'id'>) });
      });
      list.sort((a, b) => new Date(b.created_at || b.return_date).getTime() - new Date(a.created_at || a.return_date).getTime());
      setReturns(list);
    } catch (err: unknown) {
      console.error('Error fetching sales returns:', err);
      showToast('error', 'Failed to load returns from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleOpenAddModal = () => {
    const yr = new Date().getFullYear();
    setCrnNo(`CRN-${yr}-${Math.floor(100 + Math.random() * 900)}`);
    setInvLookup(`POS-${yr}-${Math.floor(1000 + Math.random() * 9000)}`);
    setCustName('');
    setCustPhone('');
    setCustEmail('');
    setOrnamentDesc('');
    setOrigWeight('');
    setReturnWeight('');
    setGoldRate('7850');
    setDeduction('0');
    setReturnReason('Size exchange requested');
    setSettlementMode('STORE_CREDIT_VOUCHER');
    setDisposition('RESTOCK_TO_VAULT');
    setIsAddModalOpen(true);
  };

  // Form Calculations
  const formCalculations = useMemo(() => {
    const orig = parseFloat(origWeight) || 0;
    const ret = parseFloat(returnWeight) || 0;
    const disc = ret - orig; // weight discrepancy
    const rate = parseFloat(goldRate) || 0;
    const ded = parseFloat(deduction) || 0;
    const grossVal = ret * rate;
    const netRefund = Math.max(0, Math.round(grossVal - ded));

    return { orig, ret, disc, grossVal, ded, netRefund };
  }, [origWeight, returnWeight, goldRate, deduction]);

  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || formCalculations.ret <= 0) {
      showToast('error', 'Customer name and valid returned weight are required.');
      return;
    }

    try {
      setSaving(true);
      const returnData = {
        credit_note_no: crnNo.trim(),
        original_inv_no: invLookup.trim(),
        customer_name: custName.trim(),
        customer_phone: custPhone.trim() || 'N/A',
        customer_email: custEmail.trim() || '',
        return_date: new Date().toISOString().split('T')[0],
        ornament_description: ornamentDesc.trim() || 'Gold Jewellery Return',
        original_weight_g: formCalculations.orig,
        return_weight_g: formCalculations.ret,
        weight_discrepancy_g: formCalculations.disc,
        gold_rate_applied: parseFloat(goldRate) || 0,
        deduction_amount: formCalculations.ded,
        refund_amount: formCalculations.netRefund,
        return_reason: returnReason,
        settlement_mode: settlementMode,
        disposition,
        status: 'COMPLETED' as const,
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'sales_returns'), returnData);
      const newRecord: SalesReturnRecord = { id: docRef.id, ...returnData };
      setReturns((prev) => [newRecord, ...prev]);
      setIsAddModalOpen(false);
      showToast('success', `Credit note ${newRecord.credit_note_no} created successfully.`);
    } catch (err: unknown) {
      console.error('Error creating return:', err);
      showToast('error', 'Failed to save return record to Firestore.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'COMPLETED' | 'PENDING_APPROVAL') => {
    try {
      await updateDoc(doc(db, 'sales_returns', id), { status: newStatus });
      setReturns((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
      showToast('success', `Return status updated to ${newStatus}`);
    } catch (err: unknown) {
      console.error('Error updating status:', err);
      showToast('error', 'Failed to update return status.');
    }
  };

  const handleDeleteReturn = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteDoc(doc(db, 'sales_returns', id));
      setReturns((prev) => prev.filter((r) => r.id !== id));
      setDeleteConfirmId(null);
      showToast('success', 'Return record deleted.');
    } catch (err: unknown) {
      console.error('Error deleting return:', err);
      showToast('error', 'Failed to delete return record.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredReturns = returns.filter((r) => {
    const s = searchQuery.toLowerCase();
    const matchesSearch =
      r.credit_note_no?.toLowerCase().includes(s) ||
      r.original_inv_no?.toLowerCase().includes(s) ||
      r.customer_name?.toLowerCase().includes(s) ||
      r.customer_phone?.toLowerCase().includes(s);
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesDisp = dispositionFilter === 'ALL' || r.disposition === dispositionFilter;
    return matchesSearch && matchesStatus && matchesDisp;
  });

  const totalRefundAmount = returns.reduce((acc, curr) => acc + (curr.refund_amount || 0), 0);
  const totalReturnWeight = returns.reduce((acc, curr) => acc + (curr.return_weight_g || 0), 0);
  const meltingCount = returns.filter((r) => r.disposition === 'SENT_TO_MELTING').length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="sales_returns" />
      <ActionToolbar
        filterPlaceholder="Filter by credit note #, original invoice, customer..."
        insertLabel="New Credit Note"
        onRefresh={fetchReturns}
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
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Returns</span>
                <RotateCcw className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{returns.length}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Credit notes processed</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Refund / Credit</span>
                <BadgeIndianRupee className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                ₹{totalRefundAmount.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Refund vouchers & offsets</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Returned Weight</span>
                <Scale className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                {totalReturnWeight.toFixed(3)} <span className="text-xs text-neutral-500 font-normal">g</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Physical gold returned</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Sent to Melting</span>
                <Flame className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-amber-700">
                {meltingCount} <span className="text-xs text-neutral-500 font-normal">Lots</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Scrap pot conversion</div>
            </div>
          </div>

          {/* Filters & Actions Bar */}
          <div className="bg-white p-3 rounded-lg border border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search credit note #, invoice, customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-[#e2e8f0] rounded-md text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-500 font-medium">Disposition:</span>
                <select
                  value={dispositionFilter}
                  onChange={(e) => setDispositionFilter(e.target.value as any)}
                  className="px-2 py-1 border border-[#e2e8f0] rounded text-neutral-700 text-xs focus:outline-none"
                >
                  <option value="ALL">All Dispositions</option>
                  <option value="RESTOCK_TO_VAULT">Restock Vault</option>
                  <option value="SENT_TO_MELTING">Melting Scrap</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-neutral-500 font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-2 py-1 border border-[#e2e8f0] rounded text-neutral-700 text-xs focus:outline-none"
                >
                  <option value="ALL">All Status</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING_APPROVAL">Pending Approval</option>
                </select>
              </div>

              <Link
                href="/finance/cash-book"
                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded font-medium text-[11px] flex items-center gap-1 transition-colors"
              >
                <span>Cash Book</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Table / Empty State */}
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center bg-white rounded-lg border border-[#e2e8f0]">
              <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mb-2" />
              <span className="text-xs text-neutral-500 font-medium">Loading sales returns from Firestore...</span>
            </div>
          ) : filteredReturns.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center bg-white rounded-lg border border-[#e2e8f0] text-center">
              <RotateCcw className="w-10 h-10 text-neutral-300 mb-3 stroke-1" />
              <h3 className="text-sm font-medium text-neutral-800 mb-1">No Sales Returns Found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mb-4">
                {searchQuery
                  ? 'No return credit notes match your query.'
                  : 'No customer returns or credit notes processed yet. Issue credit vouchers for returned jewellery.'}
              </p>
              <button
                onClick={handleOpenAddModal}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Issue Credit Note</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-[#e2e8f0] text-neutral-600 font-medium text-[11px]">
                      <th className="py-2.5 px-3">Credit Note #</th>
                      <th className="py-2.5 px-3">Orig. Invoice</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-2 text-right">Return Wt</th>
                      <th className="py-2.5 px-2 text-right">Weight Diff</th>
                      <th className="py-2.5 px-3 text-right">Refund Amount</th>
                      <th className="py-2.5 px-3 text-center">Settlement Mode</th>
                      <th className="py-2.5 px-3 text-center">Disposition</th>
                      <th className="py-2.5 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {filteredReturns.map((r) => (
                      <tr key={r.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-medium text-neutral-800">
                          {r.credit_note_no}
                          <div className="text-[10px] text-neutral-400 font-sans">{r.return_date}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-neutral-700">
                          {r.original_inv_no}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-neutral-800">{r.customer_name}</div>
                          <div className="text-[10px] text-neutral-400 font-mono">{r.customer_phone}</div>
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-neutral-700">
                          {r.return_weight_g?.toFixed(3)}g
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono">
                          {r.weight_discrepancy_g < 0 ? (
                            <span className="text-red-600 font-medium">{r.weight_discrepancy_g.toFixed(3)}g</span>
                          ) : r.weight_discrepancy_g > 0 ? (
                            <span className="text-emerald-600 font-medium">+{r.weight_discrepancy_g.toFixed(3)}g</span>
                          ) : (
                            <span className="text-neutral-500">0.000g</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-700">
                          ₹{r.refund_amount?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-medium bg-neutral-100 text-neutral-700">
                            {r.settlement_mode?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium font-mono ${
                              r.disposition === 'RESTOCK_TO_VAULT'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {r.disposition === 'RESTOCK_TO_VAULT' ? 'Restocked' : 'To Melting'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReturn(r);
                                setIsVoucherModalOpen(true);
                              }}
                              className="p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-neutral-100 transition-colors"
                              title="View Credit Voucher"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(r.id)}
                              className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete Return Record"
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

      {/* CREATE NEW RETURN / CREDIT NOTE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-5 border border-[#e2e8f0] animate-fadeIn text-xs max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] mb-4">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-neutral-800 text-sm">Issue Sales Return Credit Note</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReturn} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Credit Note # *</label>
                  <input
                    type="text"
                    required
                    value={crnNo}
                    onChange={(e) => setCrnNo(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Original Invoice / Bill # *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. POS-2026-1042"
                    value={invLookup}
                    onChange={(e) => setInvLookup(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Customer Contact */}
              <div className="p-3 bg-neutral-50 rounded-lg border border-[#e2e8f0] space-y-2.5">
                <span className="font-medium text-neutral-700 block text-[11px] uppercase tracking-wider">
                  Customer Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Customer Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sneha Patel"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] bg-white rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+91 98221 44019"
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] bg-white rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Return Ornament Weights */}
              <div className="space-y-3">
                <span className="font-medium text-neutral-700 block text-[11px] uppercase tracking-wider">
                  Weight Verification & Rate Calculation
                </span>

                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Returned Ornament Description</label>
                  <input
                    type="text"
                    placeholder="e.g. 22K Broad Kada, plain bangles lot"
                    value={ornamentDesc}
                    onChange={(e) => setOrnamentDesc(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Original Wt (g) *</label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      placeholder="0.000"
                      value={origWeight}
                      onChange={(e) => {
                        setOrigWeight(e.target.value);
                        if (!returnWeight) setReturnWeight(e.target.value);
                      }}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Returned Wt (g) *</label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      placeholder="0.000"
                      value={returnWeight}
                      onChange={(e) => setReturnWeight(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Gold Rate (₹/g)</label>
                    <input
                      type="number"
                      value={goldRate}
                      onChange={(e) => setGoldRate(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Deductions (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={deduction}
                      onChange={(e) => setDeduction(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Reason for Return</label>
                    <select
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Size exchange requested">Size exchange requested</option>
                      <option value="Customer liquidity cash-in">Customer liquidity cash-in</option>
                      <option value="Design preference change">Design preference change</option>
                      <option value="Manufacturing discrepancy">Manufacturing discrepancy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Settlement Mode</label>
                    <select
                      value={settlementMode}
                      onChange={(e) => setSettlementMode(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="STORE_CREDIT_VOUCHER">Store Credit Voucher</option>
                      <option value="BANK_REFUND">Direct Bank Refund</option>
                      <option value="EXCHANGE_OFFSET">Immediate Exchange Offset</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Inventory Disposition</label>
                    <select
                      value={disposition}
                      onChange={(e) => setDisposition(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="RESTOCK_TO_VAULT">Restock into Vault</option>
                      <option value="SENT_TO_MELTING">Send to Melting / Scrap</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Refund Calculations Box */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1.5">
                <div className="flex justify-between text-emerald-800">
                  <span>Weight Discrepancy:</span>
                  <span className="font-mono font-medium">
                    {formCalculations.disc.toFixed(3)} g
                  </span>
                </div>
                <div className="flex justify-between text-emerald-800">
                  <span>Gross Valuation:</span>
                  <span className="font-mono font-medium">₹{formCalculations.grossVal.toLocaleString('en-IN')}</span>
                </div>
                {formCalculations.ded > 0 && (
                  <div className="flex justify-between text-amber-700 text-[11px]">
                    <span>Deduction (loss/making):</span>
                    <span className="font-mono">-₹{formCalculations.ded.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-emerald-900 font-medium text-sm pt-1 border-t border-emerald-300">
                  <span>Net Refund / Credit Value:</span>
                  <span className="font-mono">₹{formCalculations.netRefund.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Submit Buttons */}
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
                  <span>{saving ? 'Processing...' : 'Issue Credit Note & Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW / PRINT STORE CREDIT VOUCHER MODAL */}
      {isVoucherModalOpen && selectedReturn && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-xl w-full p-6 border border-[#e2e8f0] animate-fadeIn text-xs max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] mb-4">
              <div>
                <h2 className="text-base font-medium text-neutral-800">STORE CREDIT NOTE & VOUCHER</h2>
                <p className="text-[11px] text-neutral-500">Credit Note #{selectedReturn.credit_note_no} • Issued {selectedReturn.return_date}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsVoucherModalOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#e2e8f0] text-[11px]">
              <div>
                <span className="text-neutral-400 block font-medium">Original Invoice:</span>
                <span className="font-mono font-medium text-neutral-800">{selectedReturn.original_inv_no}</span>
              </div>
              <div className="text-right">
                <span className="text-neutral-400 block font-medium">Return Date:</span>
                <span className="font-mono text-neutral-700">{selectedReturn.return_date}</span>
              </div>
              <div>
                <span className="text-neutral-400 block font-medium">Customer:</span>
                <span className="font-medium text-neutral-800">{selectedReturn.customer_name}</span>
                <div className="text-neutral-500 font-mono">{selectedReturn.customer_phone}</div>
              </div>
              <div className="text-right">
                <span className="text-neutral-400 block font-medium">Settlement:</span>
                <span className="font-medium text-emerald-800">{selectedReturn.settlement_mode?.replace(/_/g, ' ')}</span>
              </div>
            </div>

            <div className="py-3 border-b border-[#e2e8f0] space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-500">Returned Piece</span>
                <span className="font-medium text-neutral-800">{selectedReturn.ornament_description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Original Scale Weight</span>
                <span className="font-mono">{selectedReturn.original_weight_g?.toFixed(3)}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Physical Return Weight</span>
                <span className="font-mono">{selectedReturn.return_weight_g?.toFixed(3)}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Weight Discrepancy</span>
                <span className="font-mono">{selectedReturn.weight_discrepancy_g?.toFixed(3)}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Applied Rate</span>
                <span className="font-mono">₹{selectedReturn.gold_rate_applied}/g</span>
              </div>
              <div className="flex justify-between font-medium text-neutral-800 pt-2 border-t border-[#e2e8f0] text-xs">
                <span>Total Net Credit Voucher</span>
                <span className="font-mono text-emerald-700">
                  ₹{selectedReturn.refund_amount?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-[10px] text-neutral-400">
                Authorized Store Credit Voucher • Non-transferable
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsVoucherModalOpen(false)}
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
                  <span>Print Voucher</span>
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
            <h3 className="font-medium text-neutral-800 text-sm mb-2">Delete Credit Note?</h3>
            <p className="text-neutral-500 mb-4">
              Are you sure you want to delete this sales return record? This cannot be undone.
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
                onClick={() => handleDeleteReturn(deleteConfirmId)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-medium flex items-center gap-1"
              >
                {deletingId === deleteConfirmId ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
