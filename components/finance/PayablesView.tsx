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
  Building2,
  Calendar,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2,
  Copy,
  Check,
  X,
  CreditCard,
  Send,
  Flame,
  Hammer,
  Loader2,
  Trash2,
  Plus,
  AlertCircle,
} from 'lucide-react';

export interface PayableRecord {
  id: string;
  vendor_name: string;
  category: 'Bullion' | 'Wholesale' | 'Karigar';
  bill_ref: string;
  amount_payable: number;
  settlement_due_date: string;
  early_discount?: string;
  status: 'DUE_SOON' | 'SCHEDULED_RTGS' | 'OVERDUE' | 'SETTLED';
  bank_beneficiary_ifsc?: string;
  account_number?: string;
  remarks?: string;
  created_at?: any;
}

export function FinancePayablesView() {
  const [payables, setPayables] = useState<PayableRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals & drawers
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<PayableRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // New Payable Form State
  const [vendorName, setVendorName] = useState('');
  const [category, setCategory] = useState<PayableRecord['category']>('Bullion');
  const [billRef, setBillRef] = useState('');
  const [amountPayable, setAmountPayable] = useState<number>(0);
  const [dueDate, setDueDate] = useState(new Date().toISOString().substring(0, 10));
  const [discountTerms, setDiscountTerms] = useState('Net 10 Days');
  const [ifsc, setIfsc] = useState('HDFC0001824');
  const [accNo, setAccNo] = useState('');

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchPayables = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'finance_payables'));
      const list: PayableRecord[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<PayableRecord, 'id'>) });
      });
      list.sort((a, b) => (a.settlement_due_date || '').localeCompare(b.settlement_due_date || ''));
      setPayables(list);
    } catch (err: any) {
      console.error('Error fetching payables:', err);
      showToast('error', err.message || 'Failed to fetch vendor payables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayables();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Status Cycle: DUE_SOON -> SCHEDULED_RTGS -> SETTLED -> DUE_SOON
  const handleCycleStatus = async (id: string, currentStatus: PayableRecord['status']) => {
    const nextStatus: PayableRecord['status'] =
      currentStatus === 'DUE_SOON'
        ? 'SCHEDULED_RTGS'
        : currentStatus === 'SCHEDULED_RTGS'
        ? 'SETTLED'
        : currentStatus === 'SETTLED'
        ? 'OVERDUE'
        : 'DUE_SOON';

    try {
      await updateDoc(doc(db, 'finance_payables', id), {
        status: nextStatus,
      });
      setPayables((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p))
      );
      showToast('success', `Payable status updated to ${nextStatus}`);
    } catch (err: any) {
      console.error('Error updating status:', err);
      showToast('error', err.message || 'Failed to update payable status');
    }
  };

  // Create Payable
  const handleCreatePayable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amountPayable <= 0 || !vendorName.trim()) {
      showToast('error', 'Please enter vendor name and amount payable');
      return;
    }

    try {
      setSaving(true);
      const bRef = billRef.trim() || `PUR-${new Date().getFullYear().toString().slice(-2)}-${Math.floor(100 + Math.random() * 900)}`;
      const payload: Omit<PayableRecord, 'id'> = {
        vendor_name: vendorName.trim(),
        category,
        bill_ref: bRef,
        amount_payable: Number(amountPayable),
        settlement_due_date: dueDate,
        early_discount: discountTerms.trim() || undefined,
        status: 'DUE_SOON',
        bank_beneficiary_ifsc: ifsc.trim() || undefined,
        account_number: accNo.trim() || undefined,
        created_at: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'finance_payables'), payload);
      setPayables((prev) => [{ id: docRef.id, ...payload }, ...prev]);
      setIsPayoutModalOpen(false);
      setVendorName('');
      setAmountPayable(0);
      setBillRef('');
      setAccNo('');
      showToast('success', `Recorded payable for ${payload.vendor_name}`);
    } catch (err: any) {
      console.error('Error creating payable:', err);
      showToast('error', err.message || 'Failed to save payable');
    } finally {
      setSaving(false);
    }
  };

  // Delete Payable
  const handleDeletePayable = async () => {
    if (!itemToDelete) return;
    try {
      setSaving(true);
      await deleteDoc(doc(db, 'finance_payables', itemToDelete.id));
      setPayables((prev) => prev.filter((p) => p.id !== itemToDelete.id));
      showToast('success', `Deleted payable bill #${itemToDelete.bill_ref}`);
      setItemToDelete(null);
    } catch (err: any) {
      console.error('Error deleting payable:', err);
      showToast('error', err.message || 'Failed to delete payable');
    } finally {
      setSaving(false);
    }
  };

  // KPI Calculations
  const pendingPayables = payables.filter((p) => p.status !== 'SETTLED');
  const totalPayableAmount = pendingPayables.reduce((acc, curr) => acc + (Number(curr.amount_payable) || 0), 0);
  const bullionOutward = pendingPayables
    .filter((p) => p.category === 'Bullion')
    .reduce((acc, curr) => acc + (Number(curr.amount_payable) || 0), 0);
  const karigarCharges = pendingPayables
    .filter((p) => p.category === 'Karigar')
    .reduce((acc, curr) => acc + (Number(curr.amount_payable) || 0), 0);
  const scheduledCount = pendingPayables.filter((p) => p.status === 'SCHEDULED_RTGS').length;

  const filteredPayables = payables.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.vendor_name || '').toLowerCase().includes(q) ||
      (item.bill_ref || '').toLowerCase().includes(q) ||
      (item.category || '').toLowerCase().includes(q) ||
      (item.status || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="accounts_payable_aging" />
      <ActionToolbar
        filterPlaceholder="Filter by vendor, bill #, category, status..."
        insertLabel="New Vendor Payable"
        onInsertClick={() => setIsPayoutModalOpen(true)}
        onRefresh={fetchPayables}
      />

      <FinanceNavigationHeader activePage="payables" />

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
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Accounts Payable</span>
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">
                ₹ {totalPayableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Pending vendor settlements</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Bullion Suppliers</span>
                <Flame className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-amber-700 font-mono">
                ₹ {bullionOutward.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Refinery bars & casting metal</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Karigar Making Charges</span>
                <Hammer className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700 font-mono">
                ₹ {karigarCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1">Artisan labour dues</div>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-200 hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-emerald-800 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">RTGS Batch Scheduled</span>
                <Send className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div className="text-xl font-medium text-emerald-900 font-mono">
                {scheduledCount} <span className="text-xs text-emerald-700 font-sans font-medium">Ready</span>
              </div>
              <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                CMS Payout File Prepared
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-4 py-2 bg-white border-b border-[#e5e7eb] flex items-center gap-2 text-xs shrink-0">
          <span className="text-[11px] text-neutral-400 uppercase font-medium">Category:</span>
          {['ALL', 'Bullion', 'Wholesale', 'Karigar'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {cat === 'ALL' ? 'All Vendors' : cat}
            </button>
          ))}
        </div>

        {/* Payables Table or Empty State */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-neutral-500">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
              <p className="text-xs font-medium">Loading live vendor payables...</p>
            </div>
          ) : filteredPayables.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center p-8 bg-white rounded-lg border border-[#e5e7eb] shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-neutral-900 mb-1">No Payables Found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mb-4">
                {searchQuery || selectedCategory !== 'ALL'
                  ? 'No payables match your criteria. Try resetting the filters.'
                  : 'Record bullion vendor invoices, artisan job-work making charges, and scheduled RTGS disbursements.'}
              </p>
              <button
                onClick={() => setIsPayoutModalOpen(true)}
                className="px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Vendor Payable</span>
              </button>
            </div>
          ) : (
            <div className="border border-[#e5e7eb] rounded-lg bg-white overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-neutral-500 uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3 font-medium">Vendor Name</th>
                      <th className="py-2.5 px-3 font-medium">Category</th>
                      <th className="py-2.5 px-3 font-medium">Bill Ref #</th>
                      <th className="py-2.5 px-3 font-medium text-right">Amount Payable (₹)</th>
                      <th className="py-2.5 px-3 font-medium">Due Date</th>
                      <th className="py-2.5 px-3 font-medium">Cash Discount Terms</th>
                      <th className="py-2.5 px-3 font-medium text-center">Status</th>
                      <th className="py-2.5 px-3 font-medium text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0] text-neutral-700">
                    {filteredPayables.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-2 px-3 font-medium text-neutral-900 max-w-xs truncate" title={row.vendor_name}>
                          {row.vendor_name}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                              row.category === 'Bullion'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : row.category === 'Karigar'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-purple-50 text-purple-700 border-purple-200'
                            }`}
                          >
                            {row.category}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-neutral-600 whitespace-nowrap">
                          <button
                            onClick={() => copyToClipboard(row.bill_ref, row.id)}
                            className="inline-flex items-center gap-1 hover:text-emerald-700 cursor-pointer"
                            title="Copy Bill Ref"
                          >
                            <span>{row.bill_ref}</span>
                            {copiedId === row.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-2.5 h-2.5 text-neutral-400 opacity-60" />
                            )}
                          </button>
                        </td>
                        <td className="py-2 px-3 font-mono font-medium text-neutral-900 text-right whitespace-nowrap">
                          ₹ {row.amount_payable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-neutral-600 whitespace-nowrap">
                          {row.settlement_due_date}
                        </td>
                        <td className="py-2 px-3 text-neutral-500 text-[11px]">
                          {row.early_discount || 'Standard Net'}
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleCycleStatus(row.id, row.status)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                              row.status === 'SETTLED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : row.status === 'SCHEDULED_RTGS'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                                : row.status === 'OVERDUE'
                                ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                                : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                            }`}
                            title="Click to cycle status"
                          >
                            {row.status === 'SETTLED' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>SETTLED</span>
                              </>
                            ) : row.status === 'SCHEDULED_RTGS' ? (
                              <>
                                <Send className="w-3 h-3 text-blue-600" />
                                <span>RTGS SCHEDULED</span>
                              </>
                            ) : row.status === 'OVERDUE' ? (
                              <>
                                <ShieldAlert className="w-3 h-3 text-red-600" />
                                <span>OVERDUE</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>DUE SOON</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => setItemToDelete(row)}
                            className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete payable"
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

      {/* MODAL: New Vendor Payable */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-medium text-neutral-900 uppercase tracking-wider">
                  Record Vendor Payable / Inward Invoice
                </h3>
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePayable} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Vendor Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PayableRecord['category'])}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                  >
                    <option value="Bullion">Bullion Supplier / Refinery</option>
                    <option value="Wholesale">Wholesale Jewellery Manufacturer</option>
                    <option value="Karigar">Artisan Goldsmith (Karigar)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Settlement Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Vendor / Artisan Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MMTC-PAMP India / Surat Diamond Cutters"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Amount Payable (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={amountPayable || ''}
                    onChange={(e) => setAmountPayable(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono font-medium focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Bill / Purchase Ref #
                  </label>
                  <input
                    type="text"
                    placeholder="PUR-26-XXXX"
                    value={billRef}
                    onChange={(e) => setBillRef(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Beneficiary Bank IFSC
                  </label>
                  <input
                    type="text"
                    placeholder="HDFC0001824"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono uppercase focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    placeholder="502000129384"
                    value={accNo}
                    onChange={(e) => setAccNo(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Cash Discount / Payment Terms
                </label>
                <input
                  type="text"
                  placeholder="e.g. 0.25% if paid by Nov 02 / Net 10 Days"
                  value={discountTerms}
                  onChange={(e) => setDiscountTerms(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
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
                  <span>Save Vendor Payable</span>
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
              <h3 className="text-sm font-medium text-neutral-900">Delete Payable Record?</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Are you sure you want to delete payable bill <span className="font-mono font-medium text-neutral-800">#{itemToDelete.bill_ref}</span> (₹ {itemToDelete.amount_payable.toLocaleString('en-IN')}) for {itemToDelete.vendor_name}?
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
                onClick={handleDeletePayable}
                disabled={saving}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                <span>Delete Payable</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
