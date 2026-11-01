'use client';

import React, { useState, useEffect } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  AlertTriangle,
  Flame,
  Clock,
  Coins,
  TrendingUp,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Plus,
  Trash2,
  Loader2,
  X,
  Search,
  AlertCircle,
  PackageCheck,
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

export interface ReorderRule {
  id: string;
  category: string;
  weight_band: string;
  current_pcs: number;
  min_threshold_pcs: number;
  reorder_qty_pcs: number;
  supplier: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  est_gold_required_g: number;
  status: 'PENDING_ORDER' | 'ORDERED';
}

export function InventoryReorderAlertsView() {
  const [rules, setRules] = useState<ReorderRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Form State
  const [category, setCategory] = useState('Plain Gold Chains');
  const [weightBand, setWeightBand] = useState('8.000g – 12.000g');
  const [currentPcs, setCurrentPcs] = useState('5');
  const [minThreshold, setMinThreshold] = useState('20');
  const [reorderQty, setReorderQty] = useState('25');
  const [supplier, setSupplier] = useState('Mohan Karigar Works');
  const [urgency, setUrgency] = useState<ReorderRule['urgency']>('HIGH');
  const [estGold, setEstGold] = useState('250.000');

  const fetchRules = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'inventory_reorder_alerts'));
      const list: ReorderRule[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<ReorderRule, 'id'>) });
      });
      setRules(list);
    } catch (err: any) {
      console.error('Error fetching reorder alerts:', err);
      showToast('error', err.message || 'Failed to fetch reorder rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const handleOpenAdd = () => {
    setCategory('Plain Gold Chains');
    setWeightBand('8.000g – 12.000g');
    setCurrentPcs('');
    setMinThreshold('');
    setReorderQty('');
    setEstGold('');
    setIsAddModalOpen(true);
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category.trim() || !minThreshold) return;

    try {
      setSaving(true);
      const cur = parseInt(currentPcs) || 0;
      const min = parseInt(minThreshold) || 10;
      const qty = parseInt(reorderQty) || 20;
      const gold = parseFloat(estGold) || 100.0;

      const newRule = {
        category: category.trim(),
        weight_band: weightBand.trim(),
        current_pcs: cur,
        min_threshold_pcs: min,
        reorder_qty_pcs: qty,
        supplier: supplier.trim() || 'Default Karigar',
        urgency,
        est_gold_required_g: gold,
        status: 'PENDING_ORDER' as const,
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'inventory_reorder_alerts'), newRule);
      setRules((prev) => [{ id: docRef.id, ...newRule }, ...prev]);
      setIsAddModalOpen(false);
      showToast('success', `Reorder rule for "${category}" created.`);
    } catch (err: any) {
      console.error('Error adding reorder rule:', err);
      showToast('error', err.message || 'Failed to create reorder rule');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, current: ReorderRule['status']) => {
    const nextStatus = current === 'PENDING_ORDER' ? 'ORDERED' : 'PENDING_ORDER';
    try {
      await updateDoc(doc(db, 'inventory_reorder_alerts', id), { status: nextStatus });
      setRules((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r))
      );
      showToast('success', `PO Status changed to ${nextStatus.replace('_', ' ')}.`);
    } catch (err: any) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteRule = async (id: string, catName: string) => {
    if (!confirm(`Delete reorder alert for ${catName}?`)) return;
    try {
      await deleteDoc(doc(db, 'inventory_reorder_alerts', id));
      setRules((prev) => prev.filter((r) => r.id !== id));
      showToast('success', 'Alert rule deleted.');
    } catch (err: any) {
      console.error('Error deleting rule:', err);
    }
  };

  const filteredRules = rules.filter((r) => {
    if (filterUrgency !== 'All' && r.urgency !== filterUrgency) return false;
    if (filterStatus !== 'All' && r.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCat = r.category?.toLowerCase().includes(q);
      const matchBand = r.weight_band?.toLowerCase().includes(q);
      const matchSupp = r.supplier?.toLowerCase().includes(q);
      if (!matchCat && !matchBand && !matchSupp) return false;
    }
    return true;
  });

  const criticalCount = rules.filter((r) => r.urgency === 'CRITICAL').length;
  const pendingGoldWeight = rules
    .filter((r) => r.status === 'PENDING_ORDER')
    .reduce((acc, curr) => acc + (curr.est_gold_required_g || 0), 0);
  const pendingOrdersCount = rules.filter((r) => r.status === 'PENDING_ORDER').length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="inventory_reorder_alerts" />
      <ActionToolbar
        filterPlaceholder="Filter reorder alerts by category, supplier..."
        insertLabel="New Reorder Rule"
        onInsertClick={handleOpenAdd}
        onRefresh={fetchRules}
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
                <span className="text-[11px] font-medium uppercase tracking-wider">Critical Shortages</span>
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-xl font-medium text-red-700">{criticalCount}</div>
              <div className="text-[10px] text-red-600 font-medium mt-0.5">Below buffer safety limits</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Gold Bullion Required</span>
                <Coins className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                {pendingGoldWeight.toFixed(3)} <span className="text-xs text-neutral-500 font-normal">g</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">For pending karigar orders</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Pending Reorders</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{pendingOrdersCount}</div>
              <div className="text-[10px] text-amber-600 font-medium mt-0.5">PO issuance needed</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Active Rules</span>
                <PackageCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{rules.length}</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Continuous buffer monitors</div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search category or supplier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-[#f8fafc] focus:bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-medium placeholder:text-neutral-400 w-48 sm:w-60"
                />
              </div>

              <select
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-700 font-medium cursor-pointer"
              >
                <option value="All">All Urgencies</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-700 font-medium cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="PENDING_ORDER">Pending Order</option>
                <option value="ORDERED">Ordered</option>
              </select>
            </div>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] hover:bg-[#1fa070] text-white shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Reorder Threshold</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-2xs overflow-hidden">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-2 text-neutral-500">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs font-medium">Loading reorder alerts from Firebase...</span>
              </div>
            ) : filteredRules.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-neutral-800">No Reorder Rules Configured</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  {rules.length === 0
                    ? 'No low-stock threshold rules logged in Firebase yet. Click "Create Reorder Threshold" to protect against fast-moving stockouts.'
                    : 'No rules match your active filters.'}
                </p>
                {rules.length === 0 && (
                  <button
                    onClick={handleOpenAdd}
                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] text-white hover:bg-[#1fa070] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Configure First Rule
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f8fafc] text-neutral-600 font-medium border-b border-[#e2e8f0]">
                    <tr>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Category &amp; Band</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Current Stock</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Min Threshold</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Reorder Qty</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Preferred Karigar / Supplier</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Est Gold Required</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Urgency</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Status</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {filteredRules.map((r) => (
                      <tr key={r.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-neutral-800">{r.category}</div>
                          <div className="text-[10px] text-neutral-500 font-mono mt-0.5">{r.weight_band}</div>
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-medium text-neutral-800">
                          {r.current_pcs} pcs
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono text-neutral-600">
                          {r.min_threshold_pcs} pcs
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-700">
                          {r.reorder_qty_pcs} pcs
                        </td>

                        <td className="py-2.5 px-3 text-neutral-700">{r.supplier}</td>

                        <td className="py-2.5 px-3 text-right font-mono font-medium text-neutral-800">
                          {Number(r.est_gold_required_g).toFixed(3)}g
                        </td>

                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            r.urgency === 'CRITICAL'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : r.urgency === 'HIGH'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {r.urgency}
                          </span>
                        </td>

                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => handleToggleStatus(r.id, r.status)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors cursor-pointer ${
                              r.status === 'ORDERED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                            title="Click to toggle PO status"
                          >
                            {r.status.replace('_', ' ')}
                          </button>
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeleteRule(r.id, r.category)}
                            className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete rule"
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

      {/* Add Reorder Rule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-medium text-neutral-800">Create Stock Reorder Alert Rule</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRule} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Category / Ornament Type *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plain Gold Chains or Temple Bangles"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Target Weight Band</label>
                <input
                  type="text"
                  placeholder="e.g. 8.000g – 12.000g"
                  value={weightBand}
                  onChange={(e) => setWeightBand(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Current Stock *</label>
                  <input
                    type="number"
                    required
                    placeholder="5"
                    value={currentPcs}
                    onChange={(e) => setCurrentPcs(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Min Threshold *</label>
                  <input
                    type="number"
                    required
                    placeholder="20"
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Reorder Qty *</label>
                  <input
                    type="number"
                    required
                    placeholder="25"
                    value={reorderQty}
                    onChange={(e) => setReorderQty(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Preferred Supplier / Karigar</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Urgency Priority</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none font-medium"
                  >
                    <option value="CRITICAL">Critical (Immediate Out-of-Stock)</option>
                    <option value="HIGH">High (Within 3 days)</option>
                    <option value="MEDIUM">Medium (Normal Reorder)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Estimated Gold Required (g)</label>
                <input
                  type="number"
                  step="0.001"
                  placeholder="250.000"
                  value={estGold}
                  onChange={(e) => setEstGold(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
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
                  <span>{saving ? 'Saving...' : 'Set Alert Rule'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
