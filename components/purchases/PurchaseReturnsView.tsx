'use client';

import React, { useState, useEffect } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  RotateCcw,
  Scale,
  CreditCard,
  AlertTriangle,
  Plus,
  X,
  CheckCircle2,
  Coins,
  Search,
  Building2,
  Trash2,
  Loader2,
  AlertCircle,
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

export interface PurchaseDebitNote {
  id: string;
  debit_note_no: string;
  orig_purchase_inv_no: string;
  supplier_name: string;
  item_tag_code: string;
  weight_returned_g: number;
  return_reason:
    | 'Hallmark Purity Failure'
    | 'Porosity / Casting Defect'
    | 'Weight Shortfall'
    | 'Solder Excess'
    | 'Stone Detachment';
  return_rate_per_g: number;
  rate_type: 'ORIGINAL_RATE' | 'MARKET_RATE';
  tax_reversal_amount: number;
  debit_amount: number;
  status: 'ACCEPTED_BY_VENDOR' | 'PENDING_CONFIRMATION' | 'CREDITED_TO_ACCOUNT';
  created_at: string;
}

export function PurchasesReturnsView() {
  const [debitNotes, setDebitNotes] = useState<PurchaseDebitNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Form State
  const [noteNo, setNoteNo] = useState('');
  const [origInv, setOrigInv] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [tagCode, setTagCode] = useState('');
  const [weightReturned, setWeightReturned] = useState('');
  const [returnReason, setReturnReason] = useState<PurchaseDebitNote['return_reason']>('Porosity / Casting Defect');
  const [ratePerGram, setRatePerGram] = useState('7850.00');
  const [rateType, setRateType] = useState<PurchaseDebitNote['rate_type']>('ORIGINAL_RATE');

  const fetchDebitNotes = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'purchases_debit_notes'));
      const list: PurchaseDebitNote[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<PurchaseDebitNote, 'id'>) });
      });
      list.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
      setDebitNotes(list);
    } catch (err: any) {
      console.error('Error fetching debit notes:', err);
      showToast('error', err.message || 'Failed to load debit notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebitNotes();
  }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const handleOpenAdd = () => {
    setNoteNo('DN-' + Math.floor(1000 + Math.random() * 9000));
    setOrigInv('PUR-' + Math.floor(1000 + Math.random() * 9000));
    setSupplierName('');
    setTagCode('TAG-G-' + Math.floor(1000 + Math.random() * 9000));
    setWeightReturned('');
    setRatePerGram('7850.00');
    setIsAddModalOpen(true);
  };

  const handleAddDebitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim() || !weightReturned || !ratePerGram) return;

    try {
      setSaving(true);
      const wt = parseFloat(weightReturned) || 0;
      const rate = parseFloat(ratePerGram) || 0;
      const baseValue = wt * rate;
      const taxReversal = baseValue * 0.03; // 3% GST reversal
      const totalDebit = baseValue + taxReversal;
      const today = new Date().toISOString().split('T')[0];

      const newNote = {
        debit_note_no: noteNo.trim() || 'DN-' + Math.floor(1000 + Math.random() * 9000),
        orig_purchase_inv_no: origInv.trim() || 'PUR-0000',
        supplier_name: supplierName.trim(),
        item_tag_code: tagCode.trim() || 'TAG-G-0000',
        weight_returned_g: wt,
        return_reason: returnReason,
        return_rate_per_g: rate,
        rate_type: rateType,
        tax_reversal_amount: taxReversal,
        debit_amount: totalDebit,
        status: 'PENDING_CONFIRMATION' as const,
        created_at: today,
      };

      const docRef = await addDoc(collection(db, 'purchases_debit_notes'), newNote);
      setDebitNotes((prev) => [{ id: docRef.id, ...newNote }, ...prev]);
      setIsAddModalOpen(false);
      showToast('success', `Debit note ${newNote.debit_note_no} created.`);
    } catch (err: any) {
      console.error('Error adding debit note:', err);
      showToast('error', err.message || 'Failed to create debit note');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, current: PurchaseDebitNote['status']) => {
    const nextStatus: PurchaseDebitNote['status'] =
      current === 'PENDING_CONFIRMATION'
        ? 'ACCEPTED_BY_VENDOR'
        : current === 'ACCEPTED_BY_VENDOR'
        ? 'CREDITED_TO_ACCOUNT'
        : 'PENDING_CONFIRMATION';

    try {
      await updateDoc(doc(db, 'purchases_debit_notes', id), { status: nextStatus });
      setDebitNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: nextStatus } : n))
      );
      showToast('success', `Debit note status changed to ${nextStatus.replace(/_/g, ' ')}.`);
    } catch (err: any) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteNote = async (id: string, noteNumber: string) => {
    if (!confirm(`Delete debit note ${noteNumber}?`)) return;
    try {
      await deleteDoc(doc(db, 'purchases_debit_notes', id));
      setDebitNotes((prev) => prev.filter((n) => n.id !== id));
      showToast('success', `Debit note ${noteNumber} deleted.`);
    } catch (err: any) {
      console.error('Error deleting debit note:', err);
    }
  };

  const filteredNotes = debitNotes.filter((n) => {
    if (filterStatus !== 'All' && n.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNote = n.debit_note_no?.toLowerCase().includes(q);
      const matchSupp = n.supplier_name?.toLowerCase().includes(q);
      const matchTag = n.item_tag_code?.toLowerCase().includes(q);
      if (!matchNote && !matchSupp && !matchTag) return false;
    }
    return true;
  });

  const totalReturnedWeight = debitNotes.reduce((acc, curr) => acc + (curr.weight_returned_g || 0), 0);
  const totalDebitAmount = debitNotes.reduce((acc, curr) => acc + (curr.debit_amount || 0), 0);
  const pendingCount = debitNotes.filter((n) => n.status === 'PENDING_CONFIRMATION').length;
  const acceptedCount = debitNotes.filter((n) => n.status === 'ACCEPTED_BY_VENDOR' || n.status === 'CREDITED_TO_ACCOUNT').length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="purchases_returns" />
      <ActionToolbar
        filterPlaceholder="Filter debit notes by vendor, invoice, tag..."
        insertLabel="New Debit Note"
        onInsertClick={handleOpenAdd}
        onRefresh={fetchDebitNotes}
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
                <span className="text-[11px] font-medium uppercase tracking-wider">Weight Returned</span>
                <Scale className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-amber-700">
                {totalReturnedWeight.toFixed(3)} <span className="text-xs text-neutral-500 font-normal">g</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Defective / rejected metal</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Debit Value</span>
                <CreditCard className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                ₹{totalDebitAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Credited / recoverable</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Vendor Accepted</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{acceptedCount} Notes</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Adjusted in ledger</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Pending Acceptance</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{pendingCount} Notes</div>
              <div className="text-[10px] text-amber-600 font-medium mt-0.5">Vendor confirmation due</div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search debit note, supplier, tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-[#f8fafc] focus:bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-medium placeholder:text-neutral-400 w-48 sm:w-60"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-700 font-medium cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="PENDING_CONFIRMATION">Pending Confirmation</option>
                <option value="ACCEPTED_BY_VENDOR">Accepted by Vendor</option>
                <option value="CREDITED_TO_ACCOUNT">Credited to Account</option>
              </select>
            </div>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] hover:bg-[#1fa070] text-white shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Debit Note</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-2xs overflow-hidden">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-2 text-neutral-500">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs font-medium">Loading debit notes from Firebase...</span>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-neutral-800">No Purchase Debit Notes</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  {debitNotes.length === 0
                    ? 'No supplier returns recorded in Firebase yet. Click "New Debit Note" to log rejected casting lots, hallmark assay failures, or weight shortfalls.'
                    : 'No debit notes match your active filters.'}
                </p>
                {debitNotes.length === 0 && (
                  <button
                    onClick={handleOpenAdd}
                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] text-white hover:bg-[#1fa070] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Issue First Debit Note
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f8fafc] text-neutral-600 font-medium border-b border-[#e2e8f0]">
                    <tr>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Debit Note #</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Orig Invoice</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Supplier Name</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Item Tag</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Returned Wt</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Rejection Reason</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Debit Rate</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Debit Amount</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Status</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {filteredNotes.map((n) => (
                      <tr key={n.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-2.5 px-3 font-mono font-medium text-neutral-800">{n.debit_note_no}</td>

                        <td className="py-2.5 px-3 font-mono text-neutral-600">{n.orig_purchase_inv_no}</td>

                        <td className="py-2.5 px-3 font-medium text-neutral-800">{n.supplier_name}</td>

                        <td className="py-2.5 px-3 font-mono text-neutral-600">{n.item_tag_code}</td>

                        <td className="py-2.5 px-3 text-right font-mono font-medium text-amber-700">
                          {Number(n.weight_returned_g).toFixed(3)}g
                        </td>

                        <td className="py-2.5 px-3 text-neutral-700">{n.return_reason}</td>

                        <td className="py-2.5 px-3 text-right font-mono text-neutral-700">
                          ₹{Number(n.return_rate_per_g).toLocaleString('en-IN')}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-medium text-neutral-900">
                          ₹{Number(n.debit_amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>

                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => handleToggleStatus(n.id, n.status)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors cursor-pointer ${
                              n.status === 'ACCEPTED_BY_VENDOR'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : n.status === 'CREDITED_TO_ACCOUNT'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                            title="Click to advance status"
                          >
                            {n.status.replace(/_/g, ' ')}
                          </button>
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeleteNote(n.id, n.debit_note_no)}
                            className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete note"
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

      {/* Add Debit Note Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-medium text-neutral-800">Issue Purchase Debit Note</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDebitNote} className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Debit Note # *</label>
                  <input
                    type="text"
                    required
                    value={noteNo}
                    onChange={(e) => setNoteNo(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Original Invoice #</label>
                  <input
                    type="text"
                    required
                    value={origInv}
                    onChange={(e) => setOrigInv(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Supplier Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Jewellery Works"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Item Barcode / Tag</label>
                  <input
                    type="text"
                    value={tagCode}
                    onChange={(e) => setTagCode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Returned Wt (g) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="0.000"
                    value={weightReturned}
                    onChange={(e) => setWeightReturned(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Rejection / Return Reason</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none font-medium"
                >
                  <option value="Porosity / Casting Defect">Porosity / Casting Defect</option>
                  <option value="Hallmark Purity Failure">Hallmark Purity Failure</option>
                  <option value="Weight Shortfall">Weight Shortfall vs Invoice</option>
                  <option value="Solder Excess">Excessive Low-Karat Solder</option>
                  <option value="Stone Detachment">Loose Stone / Detachment</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Rate Fixed (₹/g) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={ratePerGram}
                    onChange={(e) => setRatePerGram(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Rate Type</label>
                  <select
                    value={rateType}
                    onChange={(e) => setRateType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none font-medium"
                  >
                    <option value="ORIGINAL_RATE">Original Invoice Rate</option>
                    <option value="MARKET_RATE">Today Market Rate</option>
                  </select>
                </div>
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
                  <span>{saving ? 'Saving...' : 'Issue Debit Note'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
