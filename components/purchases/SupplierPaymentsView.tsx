'use client';

import React, { useState, useEffect } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  CreditCard,
  Coins,
  Building2,
  Landmark,
  Plus,
  X,
  CheckCircle2,
  Clock,
  Trash2,
  Loader2,
  Search,
  AlertCircle,
  Receipt,
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

export interface SupplierPayout {
  id: string;
  voucher_no: string;
  supplier_name: string;
  settlement_type: 'RTGS' | 'NEFT' | 'IMPS' | 'METAL_BAR_999';
  payout_date: string;
  bank_source?: string;
  utr_reference?: string;
  vault_source?: string;
  bar_serial_no?: string;
  metal_weight_g?: number;
  cash_amount?: number;
  status: 'PROCESSED' | 'PENDING_APPROVAL' | 'CANCELLED';
  notes: string;
}

export function PurchasesPaymentsView() {
  const [payouts, setPayouts] = useState<SupplierPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Form State
  const [voucherNo, setVoucherNo] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [settlementType, setSettlementType] = useState<SupplierPayout['settlement_type']>('RTGS');
  const [payoutDate, setPayoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [bankSource, setBankSource] = useState('HDFC Bank - Current (0021)');
  const [utrRef, setUtrRef] = useState('');
  const [vaultSource, setVaultSource] = useState('Main Vault #1');
  const [barSerial, setBarSerial] = useState('');
  const [metalWeight, setMetalWeight] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [notes, setNotes] = useState('');

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'purchases_payments'));
      const list: SupplierPayout[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<SupplierPayout, 'id'>) });
      });
      list.sort((a, b) => (b.payout_date || '').localeCompare(a.payout_date || ''));
      setPayouts(list);
    } catch (err: any) {
      console.error('Error fetching payouts:', err);
      showToast('error', err.message || 'Failed to fetch payout vouchers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const handleOpenAdd = () => {
    setVoucherNo('PV-' + Math.floor(1000 + Math.random() * 9000));
    setSupplierName('');
    setUtrRef('');
    setBarSerial('');
    setMetalWeight('');
    setCashAmount('');
    setNotes('');
    setIsAddModalOpen(true);
  };

  const handleAddPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) return;

    try {
      setSaving(true);
      const isMetal = settlementType === 'METAL_BAR_999';
      const newPayout = {
        voucher_no: voucherNo || 'PV-' + Math.floor(1000 + Math.random() * 9000),
        supplier_name: supplierName.trim(),
        settlement_type: settlementType,
        payout_date: payoutDate,
        bank_source: !isMetal ? bankSource : '',
        utr_reference: !isMetal ? utrRef.trim() || 'UTR' + Math.floor(100000000 + Math.random() * 900000000) : '',
        vault_source: isMetal ? vaultSource : '',
        bar_serial_no: isMetal ? barSerial.trim() || 'BAR-999-' + Math.floor(1000 + Math.random() * 9000) : '',
        metal_weight_g: isMetal ? parseFloat(metalWeight) || 0 : 0,
        cash_amount: !isMetal ? parseFloat(cashAmount) || 0 : 0,
        status: 'PROCESSED' as const,
        notes: notes.trim() || 'Vendor settlement payout',
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'purchases_payments'), newPayout);
      setPayouts((prev) => [{ id: docRef.id, ...newPayout }, ...prev]);
      setIsAddModalOpen(false);
      showToast('success', `Payment voucher ${newPayout.voucher_no} processed.`);
    } catch (err: any) {
      console.error('Error adding payout voucher:', err);
      showToast('error', err.message || 'Failed to record payout voucher');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, current: SupplierPayout['status']) => {
    const nextStatus = current === 'PROCESSED' ? 'PENDING_APPROVAL' : current === 'PENDING_APPROVAL' ? 'CANCELLED' : 'PROCESSED';
    try {
      await updateDoc(doc(db, 'purchases_payments', id), { status: nextStatus });
      setPayouts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p))
      );
      showToast('success', `Status updated to ${nextStatus.replace('_', ' ')}.`);
    } catch (err: any) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeletePayout = async (id: string, vNo: string) => {
    if (!confirm(`Delete payout voucher ${vNo}?`)) return;
    try {
      await deleteDoc(doc(db, 'purchases_payments', id));
      setPayouts((prev) => prev.filter((p) => p.id !== id));
      showToast('success', `Voucher ${vNo} deleted.`);
    } catch (err: any) {
      console.error('Error deleting payout:', err);
    }
  };

  const filteredPayouts = payouts.filter((p) => {
    if (filterType !== 'All' && p.settlement_type !== filterType) return false;
    if (filterStatus !== 'All' && p.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchV = p.voucher_no?.toLowerCase().includes(q);
      const matchSupp = p.supplier_name?.toLowerCase().includes(q);
      const matchUtr = p.utr_reference?.toLowerCase().includes(q);
      const matchBar = p.bar_serial_no?.toLowerCase().includes(q);
      if (!matchV && !matchSupp && !matchUtr && !matchBar) return false;
    }
    return true;
  });

  const totalCashDisbursed = payouts.reduce((acc, curr) => acc + (curr.cash_amount || 0), 0);
  const totalMetalDisbursed = payouts.reduce((acc, curr) => acc + (curr.metal_weight_g || 0), 0);
  const processedCount = payouts.filter((p) => p.status === 'PROCESSED').length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="purchases_payments" />
      <ActionToolbar
        filterPlaceholder="Filter by voucher #, supplier, UTR..."
        insertLabel="New Payout"
        onInsertClick={handleOpenAdd}
        onRefresh={fetchPayouts}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        <div className="p-4 flex flex-col gap-4 max-w-7xl w-full mx-auto">
          {/* Toast Notification */}
          {toastType === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}
          {toastType === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-medium animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Cash Disbursed</span>
                <Landmark className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                ₹{totalCashDisbursed.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">RTGS / NEFT vendor payments</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Metal Bar Settlements</span>
                <Coins className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                {totalMetalDisbursed.toFixed(3)} <span className="text-xs text-neutral-500 font-normal">g</span>
              </div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">999 Fine Gold Bars paid</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Processed Payouts</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{processedCount} Vouchers</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Fully reconciled transactions</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Dual Settlement Modes</span>
                <CreditCard className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">RTGS &amp; Bullion</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Pure gold weight or cash</div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search voucher, supplier, UTR..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-[#f8fafc] focus:bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-medium placeholder:text-neutral-400 w-48 sm:w-60"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-700 font-medium cursor-pointer"
              >
                <option value="All">All Settlement Modes</option>
                <option value="RTGS">RTGS Bank Wire</option>
                <option value="NEFT">NEFT Transfer</option>
                <option value="IMPS">IMPS Immediate</option>
                <option value="METAL_BAR_999">Physical 999 Gold Bar</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-700 font-medium cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="PROCESSED">Processed</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] hover:bg-[#1fa070] text-white shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Payout Voucher</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-2xs overflow-hidden">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-2 text-neutral-500">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs font-medium">Loading payout vouchers from Firebase...</span>
              </div>
            ) : filteredPayouts.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-neutral-800">No Payout Vouchers Found</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  {payouts.length === 0
                    ? 'No supplier disbursements recorded in Firebase yet. Click "New Payout Voucher" to register RTGS, NEFT, or 999 physical gold bar disbursements.'
                    : 'No vouchers match your active filters.'}
                </p>
                {payouts.length === 0 && (
                  <button
                    onClick={handleOpenAdd}
                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] text-white hover:bg-[#1fa070] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Issue First Payment
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f8fafc] text-neutral-600 font-medium border-b border-[#e2e8f0]">
                    <tr>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Voucher # &amp; Date</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Supplier Name</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Settlement Mode</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Reference / UTR / Bar #</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Cash Amount (₹)</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Metal Bar (g)</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Status</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {filteredPayouts.map((p) => (
                      <tr key={p.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-mono font-medium text-neutral-800">{p.voucher_no}</div>
                          <div className="text-[10px] text-neutral-500 mt-0.5">{p.payout_date}</div>
                        </td>

                        <td className="py-2.5 px-3 font-medium text-neutral-800">{p.supplier_name}</td>

                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            p.settlement_type === 'METAL_BAR_999'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-blue-50 text-blue-800 border border-blue-200'
                          }`}>
                            {p.settlement_type.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 font-mono text-neutral-700">
                          {p.utr_reference || p.bar_serial_no || '---'}
                          <div className="text-[10px] text-neutral-400 font-sans mt-0.5">
                            {p.bank_source || p.vault_source}
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-medium text-neutral-900">
                          {p.cash_amount ? `₹${Number(p.cash_amount).toLocaleString('en-IN')}` : '---'}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-medium text-amber-700">
                          {p.metal_weight_g ? `${Number(p.metal_weight_g).toFixed(3)}g` : '---'}
                        </td>

                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => handleToggleStatus(p.id, p.status)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors cursor-pointer ${
                              p.status === 'PROCESSED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : p.status === 'PENDING_APPROVAL'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {p.status.replace('_', ' ')}
                          </button>
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeletePayout(p.id, p.voucher_no)}
                            className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
            )}
          </div>
        </div>
      </div>

      {/* Add Payout Voucher Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-medium text-neutral-800">Issue Supplier Payment Voucher</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPayout} className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Voucher Number *</label>
                  <input
                    type="text"
                    required
                    value={voucherNo}
                    onChange={(e) => setVoucherNo(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Disbursement Date</label>
                  <input
                    type="date"
                    required
                    value={payoutDate}
                    onChange={(e) => setPayoutDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Beneficiary Supplier *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shree Bullion Refinery"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Settlement Method</label>
                <select
                  value={settlementType}
                  onChange={(e) => setSettlementType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none font-medium"
                >
                  <option value="RTGS">RTGS Bank Wire (Cash)</option>
                  <option value="NEFT">NEFT Transfer (Cash)</option>
                  <option value="IMPS">IMPS Immediate (Cash)</option>
                  <option value="METAL_BAR_999">Physical 999 Fine Gold Bar (Pure Metal)</option>
                </select>
              </div>

              {settlementType === 'METAL_BAR_999' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-700 font-medium mb-1">Metal Bar Weight (g) *</label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      placeholder="100.000"
                      value={metalWeight}
                      onChange={(e) => setMetalWeight(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-700 font-medium mb-1">Bar Serial #</label>
                    <input
                      type="text"
                      placeholder="BAR-999-1082"
                      value={barSerial}
                      onChange={(e) => setBarSerial(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-700 font-medium mb-1">Cash Amount (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="500000"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-700 font-medium mb-1">Bank UTR Reference</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFCR5202610"
                      value={utrRef}
                      onChange={(e) => setUtrRef(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Settlement against purchase invoice"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 border border-[#e2e8f0] text-neutral-600 rounded-md font-medium hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-[#24b47e] hover:bg-[#1fa070] text-white rounded-md font-medium shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{saving ? 'Saving...' : 'Disburse Payment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
