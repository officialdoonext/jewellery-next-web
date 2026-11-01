'use client';

import React, { useState, useEffect } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Coins,
  Scale,
  TrendingUp,
  Percent,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  Loader2,
  X,
  Layers,
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

export interface MetalTypeItem {
  id: string;
  metal_name: string;
  symbol: string;
  base_unit: 'GRAMS' | 'CARATS' | 'TROY_OUNCE';
  density_g_cm3: number;
  rate_feed_source: string;
  current_spot_rate: number;
  gst_rate_percent: number;
  is_taxable: boolean;
  is_active: boolean;
}

export function InventoryMetalTypesView() {
  const [metals, setMetals] = useState<MetalTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Form State
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('Au');
  const [baseUnit, setBaseUnit] = useState<MetalTypeItem['base_unit']>('GRAMS');
  const [density, setDensity] = useState('19.32');
  const [rateFeed, setRateFeed] = useState('IBJA Spot Daily');
  const [spotRate, setSpotRate] = useState('');
  const [gstRate, setGstRate] = useState('3.0');

  const fetchMetals = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'inventory_metal_types'));
      const list: MetalTypeItem[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<MetalTypeItem, 'id'>) });
      });
      setMetals(list);
    } catch (err: any) {
      console.error('Error fetching metals:', err);
      showToast('error', err.message || 'Failed to fetch metal types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetals();
  }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const handleOpenAdd = () => {
    setName('');
    setSymbol('Au');
    setDensity('19.32');
    setSpotRate('7850.00');
    setGstRate('3.0');
    setIsAddModalOpen(true);
  };

  const handleAddMetal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      const newMetal = {
        metal_name: name.trim(),
        symbol: symbol.trim() || 'Au',
        base_unit: baseUnit,
        density_g_cm3: parseFloat(density) || 0,
        rate_feed_source: rateFeed.trim() || 'Manual',
        current_spot_rate: parseFloat(spotRate) || 0,
        gst_rate_percent: parseFloat(gstRate) || 3.0,
        is_taxable: true,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'inventory_metal_types'), newMetal);
      setMetals((prev) => [{ id: docRef.id, ...newMetal }, ...prev]);
      setIsAddModalOpen(false);
      showToast('success', `Metal type "${name}" registered successfully.`);
    } catch (err: any) {
      console.error('Error adding metal:', err);
      showToast('error', err.message || 'Failed to add metal type');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMetal = async (id: string, metalName: string) => {
    if (!confirm(`Delete metal type "${metalName}"?`)) return;
    try {
      await deleteDoc(doc(db, 'inventory_metal_types', id));
      setMetals((prev) => prev.filter((m) => m.id !== id));
      showToast('success', `Metal "${metalName}" deleted.`);
    } catch (err: any) {
      console.error('Error deleting metal:', err);
      showToast('error', err.message || 'Failed to delete metal');
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'inventory_metal_types', id), { is_active: !current });
      setMetals((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_active: !current } : m))
      );
    } catch (err: any) {
      console.error('Error updating metal status:', err);
    }
  };

  const filteredMetals = metals.filter((m) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.metal_name?.toLowerCase().includes(q);
      const matchSym = m.symbol?.toLowerCase().includes(q);
      const matchSource = m.rate_feed_source?.toLowerCase().includes(q);
      if (!matchName && !matchSym && !matchSource) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="inventory_metal_types" />
      <ActionToolbar
        filterPlaceholder="Filter metal commodities by name or symbol..."
        insertLabel="New Metal"
        onInsertClick={handleOpenAdd}
        onRefresh={fetchMetals}
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
                <span className="text-[11px] font-medium uppercase tracking-wider">Registered Metals</span>
                <Coins className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{metals.length}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Commodity masters</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Default GST</span>
                <Percent className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">3.0%</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Bullion / Ornaments GST</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Active Feeds</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                {metals.filter((m) => m.is_active).length}
              </div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Live ticker enabled</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Base Measurement</span>
                <Scale className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">Grams / Carats</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Standardized weights</div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search metal name or symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-[#f8fafc] focus:bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-medium placeholder:text-neutral-400 w-60"
              />
            </div>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] hover:bg-[#1fa070] text-white shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Metal Type</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-2xs overflow-hidden">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-2 text-neutral-500">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs font-medium">Loading metal types from Firebase...</span>
              </div>
            ) : filteredMetals.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                  <Coins className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-neutral-800">No Metals Registered</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  {metals.length === 0
                    ? 'No precious metals defined yet. Click "New Metal Type" to configure Yellow Gold, Fine Silver, Platinum, etc.'
                    : 'No metals match your search term.'}
                </p>
                {metals.length === 0 && (
                  <button
                    onClick={handleOpenAdd}
                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] text-white hover:bg-[#1fa070] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Configure First Metal
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f8fafc] text-neutral-600 font-medium border-b border-[#e2e8f0]">
                    <tr>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Metal Name &amp; Symbol</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Base Unit</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Density (g/cm³)</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Rate Feed</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Current Spot Rate</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">GST Rate</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Status</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {filteredMetals.map((m) => (
                      <tr key={m.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-neutral-800 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] flex items-center justify-center font-medium border border-emerald-200">
                              {m.symbol}
                            </span>
                            <span>{m.metal_name}</span>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-neutral-600 font-medium">{m.base_unit}</td>

                        <td className="py-2.5 px-3 text-right font-mono text-neutral-700 font-medium">
                          {Number(m.density_g_cm3).toFixed(2)}
                        </td>

                        <td className="py-2.5 px-3 text-neutral-600">{m.rate_feed_source}</td>

                        <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-700">
                          ₹{Number(m.current_spot_rate).toLocaleString('en-IN')}/{m.base_unit === 'GRAMS' ? 'g' : 'unit'}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono text-neutral-700 font-medium">
                          {m.gst_rate_percent}%
                        </td>

                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => handleToggleActive(m.id, m.is_active)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors cursor-pointer ${
                              m.is_active
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                            }`}
                          >
                            {m.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeleteMetal(m.id, m.metal_name)}
                            className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete metal"
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

      {/* Add Metal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-medium text-neutral-800">Add New Metal Commodity</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMetal} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Metal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yellow Gold (Au) or Platinum 950"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Chemical Symbol</label>
                  <input
                    type="text"
                    placeholder="Au, Ag, Pt"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Base Measurement Unit</label>
                  <select
                    value={baseUnit}
                    onChange={(e) => setBaseUnit(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none font-medium"
                  >
                    <option value="GRAMS">Grams (g)</option>
                    <option value="CARATS">Carats (cts)</option>
                    <option value="TROY_OUNCE">Troy Ounce (oz)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Density (g/cm³)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="19.32"
                    value={density}
                    onChange={(e) => setDensity(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">GST Rate %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={gstRate}
                    onChange={(e) => setGstRate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Initial Spot Rate (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="7850.00"
                    value={spotRate}
                    onChange={(e) => setSpotRate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Rate Feed Provider</label>
                  <input
                    type="text"
                    placeholder="IBJA Spot Daily"
                    value={rateFeed}
                    onChange={(e) => setRateFeed(e.target.value)}
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
                  <span>{saving ? 'Saving...' : 'Add Metal'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
