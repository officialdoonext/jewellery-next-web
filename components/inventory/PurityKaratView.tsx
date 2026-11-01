'use client';

import React, { useState, useEffect } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  ShieldCheck,
  Calculator,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  Loader2,
  X,
  Award,
  Scale,
  Percent,
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

export interface PurityStandard {
  id: string;
  karat_label: string;
  category: 'Gold' | 'Silver' | 'Platinum';
  purity_percent: number;
  hallmark_stamp: string;
  fine_metal_multiplier: number;
  melting_loss_tolerance_mg: number;
  is_active: boolean;
}

export function InventoryPurityKaratView() {
  const [purities, setPurities] = useState<PurityStandard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Calculator State
  const [calcGrams, setCalcGrams] = useState('10.000');
  const [calcSelectedPurity, setCalcSelectedPurity] = useState<string>('');

  // Form State
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState<PurityStandard['category']>('Gold');
  const [purityPercent, setPurityPercent] = useState('91.67');
  const [hallmark, setHallmark] = useState('916');
  const [tolerance, setTolerance] = useState('40');

  const fetchPurities = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'inventory_purity_standards'));
      const list: PurityStandard[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<PurityStandard, 'id'>) });
      });
      setPurities(list);
      if (list.length > 0 && !calcSelectedPurity) {
        setCalcSelectedPurity(list[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching purities:', err);
      showToast('error', err.message || 'Failed to fetch purity standards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurities();
  }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const handleOpenAdd = () => {
    setLabel('');
    setPurityPercent('91.67');
    setHallmark('916');
    setTolerance('40');
    setIsAddModalOpen(true);
  };

  const handleAddPurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    try {
      setSaving(true);
      const pct = parseFloat(purityPercent) || 0;
      const newPurity = {
        karat_label: label.trim(),
        category,
        purity_percent: pct,
        hallmark_stamp: hallmark.trim(),
        fine_metal_multiplier: pct / 100,
        melting_loss_tolerance_mg: parseFloat(tolerance) || 0,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'inventory_purity_standards'), newPurity);
      setPurities((prev) => [{ id: docRef.id, ...newPurity }, ...prev]);
      setIsAddModalOpen(false);
      showToast('success', `Purity "${label}" added successfully.`);
    } catch (err: any) {
      console.error('Error adding purity standard:', err);
      showToast('error', err.message || 'Failed to add purity standard');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePurity = async (id: string, karatLabel: string) => {
    if (!confirm(`Delete purity "${karatLabel}"?`)) return;
    try {
      await deleteDoc(doc(db, 'inventory_purity_standards', id));
      setPurities((prev) => prev.filter((p) => p.id !== id));
      showToast('success', `Purity standard deleted.`);
    } catch (err: any) {
      console.error('Error deleting purity:', err);
      showToast('error', err.message || 'Failed to delete standard');
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'inventory_purity_standards', id), { is_active: !current });
      setPurities((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_active: !current } : p))
      );
    } catch (err: any) {
      console.error('Error updating status:', err);
    }
  };

  const filteredPurities = purities.filter((p) => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    return true;
  });

  // Calculator Math
  const activeCalcPurity = purities.find((p) => p.id === calcSelectedPurity) || purities[0];
  const pureContentGrams = activeCalcPurity
    ? (parseFloat(calcGrams) || 0) * (activeCalcPurity.purity_percent / 100)
    : 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="inventory_purity_karat" />
      <ActionToolbar
        filterPlaceholder="Filter BIS hallmarks & karat standards..."
        insertLabel="New Purity"
        onInsertClick={handleOpenAdd}
        onRefresh={fetchPurities}
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
                <span className="text-[11px] font-medium uppercase tracking-wider">Hallmark Standards</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{purities.length}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">BIS Certified Purities</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Fine Gold Multiplier</span>
                <Percent className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">0.9167 (22K)</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Primary trade benchmark</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Melting Tolerance</span>
                <Scale className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">40 mg/10g</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Standard loss threshold</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Active in Billing</span>
                <Award className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                {purities.filter((p) => p.is_active).length}
              </div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Available for valuation</div>
            </div>
          </div>

          {/* Fine Metal Conversion Calculator */}
          {purities.length > 0 && (
            <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-900 mb-2.5">
                <Calculator className="w-4 h-4 text-emerald-700" />
                <span>Fine Metal Pure Content Calculator</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div>
                  <label className="text-[11px] text-neutral-600 font-medium mb-1 block">Gross Weight (grams)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={calcGrams}
                    onChange={(e) => setCalcGrams(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-emerald-200 rounded-md bg-white font-mono text-neutral-800 font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-600 font-medium mb-1 block">Hallmark Purity</label>
                  <select
                    value={calcSelectedPurity}
                    onChange={(e) => setCalcSelectedPurity(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-emerald-200 rounded-md bg-white text-neutral-800 font-medium focus:border-emerald-500 focus:outline-none"
                  >
                    {purities.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.karat_label} — {p.hallmark_stamp} ({p.purity_percent}%)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="p-2.5 bg-white rounded-md border border-emerald-200 text-center">
                  <div className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider">Equivalent 24K Pure Metal</div>
                  <div className="text-base font-mono font-medium text-emerald-700 mt-0.5">
                    {pureContentGrams.toFixed(3)} grams
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 font-medium">Filter Category:</span>
              {['All', 'Gold', 'Silver', 'Platinum'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                    selectedCategory === cat
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-white text-neutral-600 border-[#e2e8f0] hover:border-emerald-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] hover:bg-[#1fa070] text-white shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Purity Standard</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-2xs overflow-hidden">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-2 text-neutral-500">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs font-medium">Loading purity standards from Firebase...</span>
              </div>
            ) : filteredPurities.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-neutral-800">No Purity Standards Configured</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  {purities.length === 0
                    ? 'No BIS hallmark purity standards configured. Click "New Purity Standard" to configure 22K (916), 18K (750), 24K (999), or Silver 925.'
                    : 'No purity standards match the selected category.'}
                </p>
                {purities.length === 0 && (
                  <button
                    onClick={handleOpenAdd}
                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] text-white hover:bg-[#1fa070] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Configure First Standard
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f8fafc] text-neutral-600 font-medium border-b border-[#e2e8f0]">
                    <tr>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Karat Description</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Category</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">BIS Hallmark Stamp</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Purity %</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Fine Multiplier</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Melting Loss Tolerance</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Status</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {filteredPurities.map((p) => (
                      <tr key={p.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-2.5 px-3 font-medium text-neutral-800">{p.karat_label}</td>

                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-700">
                            {p.category}
                          </span>
                        </td>

                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200">
                            {p.hallmark_stamp}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-700">
                          {p.purity_percent}%
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono text-neutral-700 font-medium">
                          {p.fine_metal_multiplier.toFixed(4)}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono text-neutral-600">
                          {p.melting_loss_tolerance_mg} mg/10g
                        </td>

                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => handleToggleActive(p.id, p.is_active)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors cursor-pointer ${
                              p.is_active
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                            }`}
                          >
                            {p.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeletePurity(p.id, p.karat_label)}
                            className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete purity"
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

      {/* Add Purity Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-medium text-neutral-800">Add Hallmark Purity Standard</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPurity} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Karat Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 22 Karat (Standard Jewellery)"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Metal Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none font-medium"
                  >
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">BIS Hallmark Stamp</label>
                  <input
                    type="text"
                    placeholder="916, 750, 999, 925"
                    value={hallmark}
                    onChange={(e) => setHallmark(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Purity Percentage (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="91.67"
                    value={purityPercent}
                    onChange={(e) => setPurityPercent(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Melting Loss Tolerance (mg/10g)</label>
                  <input
                    type="number"
                    placeholder="40"
                    value={tolerance}
                    onChange={(e) => setTolerance(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium"
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
                  <span>{saving ? 'Saving...' : 'Add Standard'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
