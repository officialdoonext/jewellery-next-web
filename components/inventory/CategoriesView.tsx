'use client';

import React, { useState, useEffect } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  FolderTree,
  Tag,
  Percent,
  Plus,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  FileText,
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

export interface CategoryItem {
  id: string;
  category_name: string;
  category_code: string;
  hsn_code: string;
  default_making_type: 'PERCENTAGE' | 'PER_GRAM' | 'FLAT_RATE';
  default_making_rate: number;
  default_wastage_percent: number;
  gender: 'Women' | 'Men' | 'Kids' | 'Unisex';
  active_items_count: number;
  is_active: boolean;
}

export function InventoryCategoriesView() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState('All');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Form State
  const [catName, setCatName] = useState('');
  const [catCode, setCatCode] = useState('');
  const [hsnCode, setHsnCode] = useState('71131910');
  const [makingType, setMakingType] = useState<CategoryItem['default_making_type']>('PERCENTAGE');
  const [makingRate, setMakingRate] = useState('');
  const [wastagePercent, setWastagePercent] = useState('');
  const [gender, setGender] = useState<CategoryItem['gender']>('Women');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'inventory_categories'));
      const list: CategoryItem[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<CategoryItem, 'id'>) });
      });
      setCategories(list);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      showToast('error', err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
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
    setCatName('');
    setCatCode('CAT-' + Math.floor(100 + Math.random() * 900));
    setHsnCode('71131910');
    setMakingRate('10.0');
    setWastagePercent('8.5');
    setIsAddModalOpen(true);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    try {
      setSaving(true);
      const newCategory = {
        category_name: catName.trim(),
        category_code: catCode.trim() || 'CAT-' + Math.floor(100 + Math.random() * 900),
        hsn_code: hsnCode.trim() || '71131910',
        default_making_type: makingType,
        default_making_rate: parseFloat(makingRate) || 0,
        default_wastage_percent: parseFloat(wastagePercent) || 0,
        gender,
        active_items_count: 0,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'inventory_categories'), newCategory);
      setCategories((prev) => [{ id: docRef.id, ...newCategory }, ...prev]);
      setIsAddModalOpen(false);
      showToast('success', `Category "${catName}" added successfully.`);
    } catch (err: any) {
      console.error('Error adding category:', err);
      showToast('error', err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, 'inventory_categories', id));
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast('success', `Category "${name}" deleted.`);
    } catch (err: any) {
      console.error('Error deleting category:', err);
      showToast('error', err.message || 'Failed to delete category');
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'inventory_categories', id), { is_active: !current });
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: !current } : c))
      );
    } catch (err: any) {
      console.error('Error updating status:', err);
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (selectedGender !== 'All' && c.gender !== selectedGender) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.category_name?.toLowerCase().includes(q);
      const matchCode = c.category_code?.toLowerCase().includes(q);
      const matchHsn = c.hsn_code?.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchHsn) return false;
    }
    return true;
  });

  const activeCount = categories.filter((c) => c.is_active).length;
  const avgWastage = categories.length
    ? (categories.reduce((acc, c) => acc + (c.default_wastage_percent || 0), 0) / categories.length).toFixed(1)
    : '0.0';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="inventory_categories" />
      <ActionToolbar
        filterPlaceholder="Filter categories by name, code, HSN..."
        insertLabel="New Category"
        onInsertClick={handleOpenAdd}
        onRefresh={fetchCategories}
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
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Categories</span>
                <FolderTree className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{categories.length}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">{activeCount} Active in POS</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Avg Wastage Rule</span>
                <Percent className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{avgWastage}%</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Across registered lines</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">HSN Compliance</span>
                <FileText className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">100%</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Chapter 71 Mapped</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Making Presets</span>
                <Tag className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{categories.length} Rules</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Auto-applied at billing</div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-[#f8fafc] focus:bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-medium placeholder:text-neutral-400 w-48 sm:w-60"
                />
              </div>

              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-700 font-medium cursor-pointer"
              >
                <option value="All">All Audiences</option>
                <option value="Women">Women</option>
                <option value="Men">Men</option>
                <option value="Kids">Kids</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] hover:bg-[#1fa070] text-white shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Category</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-2xs overflow-hidden">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-2 text-neutral-500">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs font-medium">Loading categories from Firebase...</span>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                  <FolderTree className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-neutral-800">No Categories Defined</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  {categories.length === 0
                    ? 'No ornament categories configured in Firestore. Click "New Category" to register your lines (e.g. Bangles, Necklaces, Rings).'
                    : 'No categories match the filter criteria.'}
                </p>
                {categories.length === 0 && (
                  <button
                    onClick={handleOpenAdd}
                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] text-white hover:bg-[#1fa070] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create First Category
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f8fafc] text-neutral-600 font-medium border-b border-[#e2e8f0]">
                    <tr>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Category &amp; Code</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">HSN Code</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Audience</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Default Making</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Default Wastage</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Status</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {filteredCategories.map((c) => (
                      <tr key={c.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-neutral-800">{c.category_name}</div>
                          <div className="text-[10px] font-mono text-neutral-500 mt-0.5">{c.category_code}</div>
                        </td>

                        <td className="py-2.5 px-3 font-mono text-neutral-700 font-medium">{c.hsn_code}</td>

                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-700">
                            {c.gender}
                          </span>
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="font-medium text-neutral-800">
                            {c.default_making_type === 'PERCENTAGE'
                              ? `${c.default_making_rate}% on Gold`
                              : c.default_making_type === 'PER_GRAM'
                              ? `₹${c.default_making_rate}/gram`
                              : `₹${c.default_making_rate} Flat`}
                          </div>
                          <div className="text-[10px] text-neutral-400">{c.default_making_type.replace('_', ' ')}</div>
                        </td>

                        <td className="py-2.5 px-3 font-medium text-emerald-700 font-mono">
                          {c.default_wastage_percent}%
                        </td>

                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => handleToggleActive(c.id, c.is_active)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors cursor-pointer ${
                              c.is_active
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                            }`}
                          >
                            {c.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeleteCategory(c.id, c.category_name)}
                            className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete category"
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

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-medium text-neutral-800">Add New Inventory Category</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bridal Chokers or Gold Bangles"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Category Code</label>
                  <input
                    type="text"
                    value={catCode}
                    onChange={(e) => setCatCode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">HSN Code</label>
                  <input
                    type="text"
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Making Charge Rule</label>
                  <select
                    value={makingType}
                    onChange={(e) => setMakingType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none font-medium"
                  >
                    <option value="PERCENTAGE">Percentage (%) on Metal</option>
                    <option value="PER_GRAM">Per Gram (₹/g)</option>
                    <option value="FLAT_RATE">Flat Fixed Rate (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Default Making Rate</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 11.5"
                    value={makingRate}
                    onChange={(e) => setMakingRate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Default Wastage %</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 8.5"
                    value={wastagePercent}
                    onChange={(e) => setWastagePercent(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Target Audience</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none font-medium"
                  >
                    <option value="Women">Women</option>
                    <option value="Men">Men</option>
                    <option value="Kids">Kids</option>
                    <option value="Unisex">Unisex</option>
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
                  <span>{saving ? 'Saving...' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
