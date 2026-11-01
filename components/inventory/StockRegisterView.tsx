'use client';

import React, { useState, useEffect } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  BookOpen,
  Calendar,
  Download,
  Filter,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Scale,
  Coins,
  AlertCircle,
  Plus,
  Trash2,
  Loader2,
  X,
  Search,
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

export interface StockDailyEntry {
  id: string;
  date: string;
  metal_type: string;
  opening_gross_g: number;
  inward_g: number;
  outward_g: number;
  melting_adjust_g: number;
  closing_gross_g: number;
  pure_fine_g: number;
  reconciled_by: string;
  status: 'VERIFIED' | 'PENDING' | 'DISCREPANCY';
}

export function InventoryStockRegisterView() {
  const [register, setRegister] = useState<StockDailyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterMetal, setFilterMetal] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [metalType, setMetalType] = useState('Gold 22K (916)');
  const [openingGross, setOpeningGross] = useState('');
  const [inward, setInward] = useState('');
  const [outward, setOutward] = useState('');
  const [meltingAdjust, setMeltingAdjust] = useState('-0.040');
  const [reconciledBy, setReconciledBy] = useState('Store Manager');

  const fetchRegister = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'inventory_stock_register'));
      const list: StockDailyEntry[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<StockDailyEntry, 'id'>) });
      });
      // Sort by date descending
      list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      setRegister(list);
    } catch (err: any) {
      console.error('Error fetching stock register:', err);
      showToast('error', err.message || 'Failed to fetch stock register');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegister();
  }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const handleOpenAdd = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setOpeningGross('');
    setInward('');
    setOutward('');
    setMeltingAdjust('-0.040');
    setIsAddModalOpen(true);
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openingGross || !date) return;

    try {
      setSaving(true);
      const open = parseFloat(openingGross) || 0;
      const inW = parseFloat(inward) || 0;
      const outW = parseFloat(outward) || 0;
      const melt = parseFloat(meltingAdjust) || 0;
      const closing = open + inW - outW + melt;
      const pure = closing * 0.9167; // default 22K multiplier or based on metal

      const newEntry = {
        date,
        metal_type: metalType,
        opening_gross_g: open,
        inward_g: inW,
        outward_g: outW,
        melting_adjust_g: melt,
        closing_gross_g: closing,
        pure_fine_g: pure,
        reconciled_by: reconciledBy.trim() || 'Store Manager',
        status: 'VERIFIED' as const,
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'inventory_stock_register'), newEntry);
      setRegister((prev) => [{ id: docRef.id, ...newEntry }, ...prev]);
      setIsAddModalOpen(false);
      showToast('success', `Daily stock entry for ${date} recorded successfully.`);
    } catch (err: any) {
      console.error('Error adding stock register entry:', err);
      showToast('error', err.message || 'Failed to record entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (id: string, dateStr: string) => {
    if (!confirm(`Delete stock entry for ${dateStr}?`)) return;
    try {
      await deleteDoc(doc(db, 'inventory_stock_register', id));
      setRegister((prev) => prev.filter((r) => r.id !== id));
      showToast('success', 'Entry deleted successfully.');
    } catch (err: any) {
      console.error('Error deleting entry:', err);
    }
  };

  const filteredRegister = register.filter((r) => {
    if (filterMetal !== 'All' && r.metal_type !== filterMetal) return false;
    if (filterStatus !== 'All' && r.status !== filterStatus) return false;
    return true;
  });

  const totalInward = register.reduce((acc, curr) => acc + (curr.inward_g || 0), 0);
  const totalOutward = register.reduce((acc, curr) => acc + (curr.outward_g || 0), 0);
  const totalFine = register.length ? register[0].pure_fine_g : 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="inventory_stock_register" />
      <ActionToolbar
        filterPlaceholder="Filter daily register by date, manager..."
        insertLabel="New Day Entry"
        onInsertClick={handleOpenAdd}
        onRefresh={fetchRegister}
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

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Recorded Inward</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                +{totalInward.toFixed(3)} <span className="text-xs text-neutral-500 font-normal">g</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Purchases, jobwork, &amp; returns</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Recorded Outward</span>
                <TrendingDown className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                -{totalOutward.toFixed(3)} <span className="text-xs text-neutral-500 font-normal">g</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">POS billings &amp; transfers</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Latest Pure Fine Balance</span>
                <Coins className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                {totalFine.toFixed(3)} <span className="text-xs text-neutral-500 font-normal">g</span>
              </div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">24K Pure equivalent</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Verified Days</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                {register.filter((r) => r.status === 'VERIFIED').length} / {register.length}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Reconciled daily registers</div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterMetal}
                onChange={(e) => setFilterMetal(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-700 font-medium cursor-pointer"
              >
                <option value="All">All Metals</option>
                <option value="Gold 22K (916)">Gold 22K (916)</option>
                <option value="Gold 18K (750)">Gold 18K (750)</option>
                <option value="Fine Silver 999">Fine Silver 999</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-700 font-medium cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="VERIFIED">Verified</option>
                <option value="PENDING">Pending</option>
                <option value="DISCREPANCY">Discrepancy</option>
              </select>
            </div>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] hover:bg-[#1fa070] text-white shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Record Day Closing</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-2xs overflow-hidden">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-2 text-neutral-500">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs font-medium">Loading stock register from Firebase...</span>
              </div>
            ) : filteredRegister.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-neutral-800">No Register Entries Found</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  {register.length === 0
                    ? 'No daily stock ledger recorded in Firebase yet. Click "Record Day Closing" to submit opening, inward, outward, and closing balances.'
                    : 'No entries match your active filters.'}
                </p>
                {register.length === 0 && (
                  <button
                    onClick={handleOpenAdd}
                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] text-white hover:bg-[#1fa070] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Record First Day
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f8fafc] text-neutral-600 font-medium border-b border-[#e2e8f0]">
                    <tr>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Date</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Metal Commodity</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Opening Gross</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Inward (+)</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Outward (-)</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Melting / Loss</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Closing Gross</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Pure Fine (24K)</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Reconciled By</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Status</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {filteredRegister.map((r) => (
                      <tr key={r.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-2.5 px-3 font-mono font-medium text-neutral-800">{r.date}</td>

                        <td className="py-2.5 px-3 font-medium text-neutral-700">{r.metal_type}</td>

                        <td className="py-2.5 px-3 text-right font-mono text-neutral-600">
                          {Number(r.opening_gross_g).toFixed(3)}g
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-medium">
                          +{Number(r.inward_g).toFixed(3)}g
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono text-amber-700 font-medium">
                          -{Number(r.outward_g).toFixed(3)}g
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono text-neutral-500">
                          {Number(r.melting_adjust_g).toFixed(3)}g
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-medium text-neutral-800">
                          {Number(r.closing_gross_g).toFixed(3)}g
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-800">
                          {Number(r.pure_fine_g).toFixed(3)}g
                        </td>

                        <td className="py-2.5 px-3 text-neutral-600">{r.reconciled_by}</td>

                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            r.status === 'VERIFIED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : r.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {r.status}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeleteEntry(r.id, r.date)}
                            className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete entry"
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

      {/* Record Day Closing Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-medium text-neutral-800">Record Daily Stock Balance</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddEntry} className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Entry Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Metal Commodity</label>
                  <select
                    value={metalType}
                    onChange={(e) => setMetalType(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none font-medium"
                  >
                    <option value="Gold 22K (916)">Gold 22K (916)</option>
                    <option value="Gold 18K (750)">Gold 18K (750)</option>
                    <option value="Fine Silver 999">Fine Silver 999</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Opening Gross Wt (g) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="0.000"
                    value={openingGross}
                    onChange={(e) => setOpeningGross(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Inward Purchases (g)</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    value={inward}
                    onChange={(e) => setInward(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Outward Sales (g)</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    value={outward}
                    onChange={(e) => setOutward(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Melting / Loss Adjust (g)</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="-0.040"
                    value={meltingAdjust}
                    onChange={(e) => setMeltingAdjust(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Reconciled / Audited By</label>
                <input
                  type="text"
                  value={reconciledBy}
                  onChange={(e) => setReconciledBy(e.target.value)}
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
                  <span>{saving ? 'Saving...' : 'Save Register Entry'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
