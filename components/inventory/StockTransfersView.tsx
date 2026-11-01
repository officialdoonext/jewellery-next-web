'use client';

import React, { useState, useEffect } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  ArrowLeftRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Scale,
  Vault,
  Copy,
  Check,
  Plus,
  Trash2,
  Send,
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

export interface TransferManifest {
  id: string;
  transfer_id: string;
  from_location: string;
  to_location: string;
  items_count: number;
  total_grams: number;
  dispatched_by: string;
  verified_by: string;
  dispatched_at: string;
  notes: string;
  status: 'COMPLETED' | 'IN_TRANSIT' | 'REJECTED';
}

export function InventoryStockTransfersView() {
  const [transfers, setTransfers] = useState<TransferManifest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Form State
  const [transferId, setTransferId] = useState('');
  const [fromLoc, setFromLoc] = useState('Main Vault #1');
  const [toLoc, setToLoc] = useState('Display Counter B');
  const [itemsCount, setItemsCount] = useState('');
  const [totalGrams, setTotalGrams] = useState('');
  const [dispatchedBy, setDispatchedBy] = useState('Vault Custodian');
  const [verifiedBy, setVerifiedBy] = useState('Counter Head');
  const [notes, setNotes] = useState('');

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'inventory_stock_transfers'));
      const list: TransferManifest[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<TransferManifest, 'id'>) });
      });
      list.sort((a, b) => (b.dispatched_at || '').localeCompare(a.dispatched_at || ''));
      setTransfers(list);
    } catch (err: any) {
      console.error('Error fetching stock transfers:', err);
      showToast('error', err.message || 'Failed to fetch transfers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
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
    setTransferId('TRF-' + Math.floor(1000 + Math.random() * 9000));
    setItemsCount('');
    setTotalGrams('');
    setNotes('');
    setIsAddModalOpen(true);
  };

  const handleAddTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totalGrams || !itemsCount) return;

    try {
      setSaving(true);
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const newManifest = {
        transfer_id: transferId || 'TRF-' + Math.floor(1000 + Math.random() * 9000),
        from_location: fromLoc,
        to_location: toLoc,
        items_count: parseInt(itemsCount) || 1,
        total_grams: parseFloat(totalGrams) || 0,
        dispatched_by: dispatchedBy.trim() || 'Custodian',
        verified_by: verifiedBy.trim() || 'Counter Head',
        dispatched_at: dateStr,
        notes: notes.trim() || 'Internal showroom stock transfer',
        status: 'IN_TRANSIT' as const,
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'inventory_stock_transfers'), newManifest);
      setTransfers((prev) => [{ id: docRef.id, ...newManifest }, ...prev]);
      setIsAddModalOpen(false);
      showToast('success', `Transfer manifest ${newManifest.transfer_id} dispatched.`);
    } catch (err: any) {
      console.error('Error adding transfer:', err);
      showToast('error', err.message || 'Failed to dispatch transfer');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async (id: string, current: TransferManifest['status']) => {
    const nextStatus = current === 'IN_TRANSIT' ? 'COMPLETED' : current === 'COMPLETED' ? 'REJECTED' : 'IN_TRANSIT';
    try {
      await updateDoc(doc(db, 'inventory_stock_transfers', id), { status: nextStatus });
      setTransfers((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
      );
      showToast('success', `Transfer status changed to ${nextStatus}.`);
    } catch (err: any) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteTransfer = async (id: string, trfNo: string) => {
    if (!confirm(`Delete transfer ${trfNo}?`)) return;
    try {
      await deleteDoc(doc(db, 'inventory_stock_transfers', id));
      setTransfers((prev) => prev.filter((t) => t.id !== id));
      showToast('success', `Transfer ${trfNo} deleted.`);
    } catch (err: any) {
      console.error('Error deleting transfer:', err);
    }
  };

  const filteredTransfers = transfers.filter((t) => {
    if (filterStatus !== 'All' && t.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = t.transfer_id?.toLowerCase().includes(q);
      const matchFrom = t.from_location?.toLowerCase().includes(q);
      const matchTo = t.to_location?.toLowerCase().includes(q);
      const matchNotes = t.notes?.toLowerCase().includes(q);
      if (!matchId && !matchFrom && !matchTo && !matchNotes) return false;
    }
    return true;
  });

  const inTransitWeight = transfers
    .filter((t) => t.status === 'IN_TRANSIT')
    .reduce((acc, curr) => acc + (curr.total_grams || 0), 0);
  const completedCount = transfers.filter((t) => t.status === 'COMPLETED').length;
  const totalWeightTransferred = transfers.reduce((acc, curr) => acc + (curr.total_grams || 0), 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="inventory_stock_transfers" />
      <ActionToolbar
        filterPlaceholder="Filter transfers by manifest ID, destination..."
        insertLabel="New Transfer"
        onInsertClick={handleOpenAdd}
        onRefresh={fetchTransfers}
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
                <span className="text-[11px] font-medium uppercase tracking-wider">In-Transit Weight</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                {inTransitWeight.toFixed(3)} <span className="text-xs text-neutral-500 font-normal">g</span>
              </div>
              <div className="text-[10px] text-amber-600 font-medium mt-0.5">Custody handover pending</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Completed Transfers</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{completedCount}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Verified vault receipts</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Cumulative Wt</span>
                <Scale className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                {totalWeightTransferred.toFixed(3)} <span className="text-xs text-neutral-500 font-normal">g</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Inter-counter movement</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Manifests</span>
                <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{transfers.length}</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Digitally signed</div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search manifest ID or desk..."
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
                <option value="IN_TRANSIT">In Transit</option>
                <option value="COMPLETED">Completed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] hover:bg-[#1fa070] text-white shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Transfer Manifest</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-2xs overflow-hidden">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-2 text-neutral-500">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs font-medium">Loading stock transfers from Firebase...</span>
              </div>
            ) : filteredTransfers.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                  <ArrowLeftRight className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-neutral-800">No Transfers Recorded</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  {transfers.length === 0
                    ? 'No internal custody movement logged in Firebase. Click "Create Transfer Manifest" to shift stock between vault and display counters.'
                    : 'No transfers match the filter criteria.'}
                </p>
                {transfers.length === 0 && (
                  <button
                    onClick={handleOpenAdd}
                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] text-white hover:bg-[#1fa070] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Dispatch First Transfer
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f8fafc] text-neutral-600 font-medium border-b border-[#e2e8f0]">
                    <tr>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Manifest ID</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Origin &amp; Destination</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Pieces</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Total Weight</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Dispatched By</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Verified By</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Dispatched At</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Status</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {filteredTransfers.map((t) => (
                      <tr key={t.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1 font-mono font-medium text-neutral-800">
                            <span>{t.transfer_id}</span>
                            <button
                              onClick={() => copyToClipboard(t.transfer_id, t.id)}
                              className="text-neutral-400 hover:text-neutral-600"
                              title="Copy ID"
                            >
                              {copiedId === t.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="font-medium text-neutral-800 flex items-center gap-1">
                            <span>{t.from_location}</span>
                            <span className="text-neutral-400">→</span>
                            <span className="text-emerald-700">{t.to_location}</span>
                          </div>
                          <div className="text-[10px] text-neutral-500 mt-0.5">{t.notes}</div>
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-medium text-neutral-800">
                          {t.items_count} pcs
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-700">
                          {Number(t.total_grams).toFixed(3)}g
                        </td>

                        <td className="py-2.5 px-3 text-neutral-600">{t.dispatched_by}</td>
                        <td className="py-2.5 px-3 text-neutral-600">{t.verified_by}</td>

                        <td className="py-2.5 px-3 text-neutral-500 text-[11px]">{t.dispatched_at}</td>

                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => handleStatusToggle(t.id, t.status)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors cursor-pointer ${
                              t.status === 'COMPLETED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : t.status === 'IN_TRANSIT'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                            title="Click to toggle status"
                          >
                            {t.status.replace('_', ' ')}
                          </button>
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeleteTransfer(t.id, t.transfer_id)}
                            className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete transfer"
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

      {/* Dispatch Transfer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-medium text-neutral-800">Dispatch Stock Transfer Manifest</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTransfer} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Manifest Number *</label>
                <input
                  type="text"
                  required
                  value={transferId}
                  onChange={(e) => setTransferId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">From Location</label>
                  <select
                    value={fromLoc}
                    onChange={(e) => setFromLoc(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none font-medium"
                  >
                    <option value="Main Vault #1">Main Vault #1</option>
                    <option value="Display Counter B">Display Counter B</option>
                    <option value="Counter 1">Counter 1</option>
                    <option value="Counter 2">Counter 2</option>
                    <option value="Workshop">Workshop</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">To Destination</label>
                  <select
                    value={toLoc}
                    onChange={(e) => setToLoc(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none font-medium"
                  >
                    <option value="Display Counter B">Display Counter B</option>
                    <option value="Main Vault #1">Main Vault #1</option>
                    <option value="Counter 1">Counter 1</option>
                    <option value="Counter 2">Counter 2</option>
                    <option value="Workshop">Workshop (Polishing)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Number of Pieces *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 12"
                    value={itemsCount}
                    onChange={(e) => setItemsCount(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Total Weight (g) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="0.000"
                    value={totalGrams}
                    onChange={(e) => setTotalGrams(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Dispatched By</label>
                  <input
                    type="text"
                    value={dispatchedBy}
                    onChange={(e) => setDispatchedBy(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Receiving Custodian</label>
                  <input
                    type="text"
                    value={verifiedBy}
                    onChange={(e) => setVerifiedBy(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Notes / Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. Restock morning bridal showcase"
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
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{saving ? 'Saving...' : 'Dispatch Transfer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
