'use client';

import React, { useState, useEffect } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  SlidersHorizontal,
  Flame,
  AlertTriangle,
  Scale,
  CheckCircle2,
  Copy,
  Check,
  Plus,
  Trash2,
  Loader2,
  X,
  Search,
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

export interface AdjustmentRecord {
  id: string;
  adjustment_no: string;
  tag_number: string;
  item_name: string;
  original_weight_g: number;
  new_weight_g: number;
  weight_delta_g: number;
  reason: string;
  initiated_by: string;
  approved_by: string;
  created_at: string;
  status: 'APPROVED' | 'PENDING';
}

export function InventoryStockAdjustmentsView() {
  const [adjustments, setAdjustments] = useState<AdjustmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Form State
  const [adjNo, setAdjNo] = useState('');
  const [tagNo, setTagNo] = useState('');
  const [itemName, setItemName] = useState('');
  const [origWt, setOrigWt] = useState('');
  const [newWt, setNewWt] = useState('');
  const [reason, setReason] = useState('Buffing & ultrasonic cleaning loss');
  const [initiatedBy, setInitiatedBy] = useState('Counter Staff');
  const [approvedBy, setApprovedBy] = useState('Store Manager');

  const fetchAdjustments = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'inventory_stock_adjustments'));
      const list: AdjustmentRecord[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<AdjustmentRecord, 'id'>) });
      });
      list.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
      setAdjustments(list);
    } catch (err: any) {
      console.error('Error fetching stock adjustments:', err);
      showToast('error', err.message || 'Failed to fetch adjustments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdjustments();
  }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAdd = () => {
    setAdjNo('ADJ-' + Math.floor(1000 + Math.random() * 9000));
    setTagNo('TAG-G-' + Math.floor(1000 + Math.random() * 9000));
    setItemName('');
    setOrigWt('');
    setNewWt('');
    setIsAddModalOpen(true);
  };

  const handleAddAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !origWt || !newWt) return;

    try {
      setSaving(true);
      const orig = parseFloat(origWt) || 0;
      const nw = parseFloat(newWt) || 0;
      const delta = nw - orig;
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const newRecord = {
        adjustment_no: adjNo || 'ADJ-' + Math.floor(1000 + Math.random() * 9000),
        tag_number: tagNo.trim() || 'TAG-G-0000',
        item_name: itemName.trim(),
        original_weight_g: orig,
        new_weight_g: nw,
        weight_delta_g: delta,
        reason: reason.trim() || 'Weight calibration adjustment',
        initiated_by: initiatedBy.trim() || 'Staff',
        approved_by: approvedBy.trim() || 'Manager',
        created_at: dateStr,
        status: 'APPROVED' as const,
      };

      const docRef = await addDoc(collection(db, 'inventory_stock_adjustments'), newRecord);
      setAdjustments((prev) => [{ id: docRef.id, ...newRecord }, ...prev]);
      setIsAddModalOpen(false);
      showToast('success', `Adjustment ${newRecord.adjustment_no} recorded.`);
    } catch (err: any) {
      console.error('Error adding adjustment:', err);
      showToast('error', err.message || 'Failed to save adjustment');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, current: AdjustmentRecord['status']) => {
    const nextStatus = current === 'APPROVED' ? 'PENDING' : 'APPROVED';
    try {
      await updateDoc(doc(db, 'inventory_stock_adjustments', id), { status: nextStatus });
      setAdjustments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: nextStatus } : a))
      );
      showToast('success', `Adjustment status changed to ${nextStatus}.`);
    } catch (err: any) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteAdjustment = async (id: string, adjNumber: string) => {
    if (!confirm(`Delete adjustment ${adjNumber}?`)) return;
    try {
      await deleteDoc(doc(db, 'inventory_stock_adjustments', id));
      setAdjustments((prev) => prev.filter((a) => a.id !== id));
      showToast('success', `Adjustment ${adjNumber} deleted.`);
    } catch (err: any) {
      console.error('Error deleting adjustment:', err);
    }
  };

  const filteredAdjustments = adjustments.filter((a) => {
    if (filterStatus !== 'All' && a.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAdj = a.adjustment_no?.toLowerCase().includes(q);
      const matchTag = a.tag_number?.toLowerCase().includes(q);
      const matchName = a.item_name?.toLowerCase().includes(q);
      const matchReason = a.reason?.toLowerCase().includes(q);
      if (!matchAdj && !matchTag && !matchName && !matchReason) return false;
    }
    return true;
  });

  const netLossGain = adjustments.reduce((acc, curr) => acc + (curr.weight_delta_g || 0), 0);
  const approvedCount = adjustments.filter((a) => a.status === 'APPROVED').length;
  const pendingCount = adjustments.filter((a) => a.status === 'PENDING').length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="inventory_stock_adjustments" />
      <ActionToolbar
        filterPlaceholder="Filter adjustments by number, item, reason..."
        insertLabel="New Adjustment"
        onInsertClick={handleOpenAdd}
        onRefresh={fetchAdjustments}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        <div className="p-4 flex flex-col gap-4 max-w-7xl w-full mx-auto">
          {/* Toast */}
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
                <span className="text-[11px] font-medium uppercase tracking-wider">Net Loss / Gain</span>
                <Scale className="w-4 h-4 text-amber-500" />
              </div>
              <div className={`text-xl font-medium ${netLossGain < 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {netLossGain > 0 ? `+${netLossGain.toFixed(3)}` : netLossGain.toFixed(3)}{' '}
                <span className="text-xs text-neutral-500 font-normal">g</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Cumulative scale variance</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Adjustments</span>
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{adjustments.length}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Logged calibration events</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Approved by Manager</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{approvedCount}</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Audit compliant entries</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Pending Sign-off</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{pendingCount}</div>
              <div className="text-[10px] text-amber-600 font-medium mt-0.5">Awaiting supervisor sign</div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by tag, item, or reason..."
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
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] hover:bg-[#1fa070] text-white shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Record Weight Adjustment</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-2xs overflow-hidden">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-2 text-neutral-500">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs font-medium">Loading adjustments from Firebase...</span>
              </div>
            ) : filteredAdjustments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-neutral-800">No Weight Adjustments Recorded</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  {adjustments.length === 0
                    ? 'No stock weight adjustments recorded in Firebase yet. Click "Record Weight Adjustment" to log polishing, stone setting, or cleaning weight variances.'
                    : 'No adjustments match the active filters.'}
                </p>
                {adjustments.length === 0 && (
                  <button
                    onClick={handleOpenAdd}
                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] text-white hover:bg-[#1fa070] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Record First Adjustment
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f8fafc] text-neutral-600 font-medium border-b border-[#e2e8f0]">
                    <tr>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Adjustment #</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Tag &amp; Item Name</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Original Wt</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">New Scale Wt</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Variance (Delta)</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Reason</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Initiated By</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Approved By</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Status</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {filteredAdjustments.map((a) => (
                      <tr key={a.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-2.5 px-3 font-mono font-medium text-neutral-800">
                          {a.adjustment_no}
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="font-medium text-neutral-800">{a.item_name}</div>
                          <div className="text-[10px] font-mono text-neutral-500 mt-0.5">{a.tag_number}</div>
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono text-neutral-600">
                          {Number(a.original_weight_g).toFixed(3)}g
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono text-neutral-800 font-medium">
                          {Number(a.new_weight_g).toFixed(3)}g
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-medium">
                          <span className={a.weight_delta_g < 0 ? 'text-amber-700' : 'text-emerald-700'}>
                            {a.weight_delta_g > 0 ? `+${Number(a.weight_delta_g).toFixed(3)}` : Number(a.weight_delta_g).toFixed(3)}g
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-neutral-600 max-w-[200px] truncate">{a.reason}</td>
                        <td className="py-2.5 px-3 text-neutral-600">{a.initiated_by}</td>
                        <td className="py-2.5 px-3 text-neutral-600">{a.approved_by}</td>

                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => handleToggleStatus(a.id, a.status)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors cursor-pointer ${
                              a.status === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                            title="Click to toggle status"
                          >
                            {a.status}
                          </button>
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeleteAdjustment(a.id, a.adjustment_no)}
                            className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete adjustment"
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

      {/* Record Adjustment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-medium text-neutral-800">Record Stock Weight Adjustment</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAdjustment} className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Adjustment Number</label>
                  <input
                    type="text"
                    required
                    value={adjNo}
                    onChange={(e) => setAdjNo(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Barcode / Tag #</label>
                  <input
                    type="text"
                    required
                    value={tagNo}
                    onChange={(e) => setTagNo(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Ornament Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Traditional Peacock Jhumkas"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Original Weight (g) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="0.000"
                    value={origWt}
                    onChange={(e) => setOrigWt(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">New Scale Weight (g) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="0.000"
                    value={newWt}
                    onChange={(e) => setNewWt(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Reason for Adjustment</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none font-medium"
                >
                  <option value="Buffing & ultrasonic cleaning loss">Buffing &amp; ultrasonic cleaning loss</option>
                  <option value="Prong retipping & stone seat tightening">Prong retipping &amp; stone seat tightening</option>
                  <option value="Size alteration & ring cutting">Size alteration &amp; ring cutting</option>
                  <option value="Digital weighing scale recalibration">Digital weighing scale recalibration</option>
                  <option value="Customer trial wear handling loss">Customer trial wear handling loss</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Initiated By Staff</label>
                  <input
                    type="text"
                    value={initiatedBy}
                    onChange={(e) => setInitiatedBy(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Approving Manager</label>
                  <input
                    type="text"
                    value={approvedBy}
                    onChange={(e) => setApprovedBy(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
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
                  <span>{saving ? 'Saving...' : 'Confirm Adjustment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
