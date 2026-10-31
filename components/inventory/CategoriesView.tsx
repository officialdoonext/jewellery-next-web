'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  FolderTree,
  Tag,
  Percent,
  Hash,
  Users,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface CategoryItem {
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

const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: '12d8a01f-b521-4d9a-a829-10928bca9111',
    category_name: 'Gold Bangles & Kadas',
    category_code: 'CAT-BNG-01',
    hsn_code: '71131910',
    default_making_type: 'PERCENTAGE',
    default_making_rate: 11.5,
    default_wastage_percent: 10.0,
    gender: 'Women',
    active_items_count: 420,
    is_active: true,
  },
  {
    id: '12d8a01f-b521-4d9a-a829-10928bca9112',
    category_name: 'Bridal Chokers & Haar',
    category_code: 'CAT-NK-02',
    hsn_code: '71131910',
    default_making_type: 'PER_GRAM',
    default_making_rate: 650,
    default_wastage_percent: 12.5,
    gender: 'Women',
    active_items_count: 145,
    is_active: true,
  },
  {
    id: '12d8a01f-b521-4d9a-a829-10928bca9113',
    category_name: 'Men Chains & Bracelets',
    category_code: 'CAT-CHN-03',
    hsn_code: '71131910',
    default_making_type: 'PER_GRAM',
    default_making_rate: 380,
    default_wastage_percent: 7.5,
    gender: 'Men',
    active_items_count: 310,
    is_active: true,
  },
  {
    id: '12d8a01f-b521-4d9a-a829-10928bca9114',
    category_name: 'Solitaire & Cocktail Rings',
    category_code: 'CAT-RNG-04',
    hsn_code: '71131910',
    default_making_type: 'FLAT_RATE',
    default_making_rate: 4500,
    default_wastage_percent: 8.0,
    gender: 'Unisex',
    active_items_count: 580,
    is_active: true,
  },
  {
    id: '12d8a01f-b521-4d9a-a829-10928bca9115',
    category_name: 'Traditional Jhumkas & Studs',
    category_code: 'CAT-EAR-05',
    hsn_code: '71131910',
    default_making_type: 'PERCENTAGE',
    default_making_rate: 13.0,
    default_wastage_percent: 11.0,
    gender: 'Women',
    active_items_count: 490,
    is_active: true,
  },
  {
    id: '12d8a01f-b521-4d9a-a829-10928bca9116',
    category_name: 'Auspicious Mangalsutra Sets',
    category_code: 'CAT-MNG-06',
    hsn_code: '71131910',
    default_making_type: 'PERCENTAGE',
    default_making_rate: 12.0,
    default_wastage_percent: 9.5,
    gender: 'Women',
    active_items_count: 215,
    is_active: true,
  },
  {
    id: '12d8a01f-b521-4d9a-a829-10928bca9117',
    category_name: 'Silver Puja Utensils & Articles',
    category_code: 'CAT-SLV-07',
    hsn_code: '71141110',
    default_making_type: 'PER_GRAM',
    default_making_rate: 22,
    default_wastage_percent: 4.0,
    gender: 'Unisex',
    active_items_count: 180,
    is_active: true,
  },
  {
    id: '12d8a01f-b521-4d9a-a829-10928bca9118',
    category_name: 'Fine Gold & Silver Coins (999)',
    category_code: 'CAT-CON-08',
    hsn_code: '71189000',
    default_making_type: 'FLAT_RATE',
    default_making_rate: 350,
    default_wastage_percent: 0.0,
    gender: 'Unisex',
    active_items_count: 140,
    is_active: true,
  },
];

export function InventoryCategoriesView() {
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatCode, setNewCatCode] = useState('');
  const [newHsnCode, setNewHsnCode] = useState('71131910');
  const [newMakingType, setNewMakingType] = useState<'PERCENTAGE' | 'PER_GRAM' | 'FLAT_RATE'>('PERCENTAGE');
  const [newMakingRate, setNewMakingRate] = useState('12.5');
  const [newWastage, setNewWastage] = useState('10.0');
  const [newGender, setNewGender] = useState<'Women' | 'Men' | 'Kids' | 'Unisex'>('Women');
  const [newIsActive, setNewIsActive] = useState(true);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    const code = newCatCode.trim() || `CAT-${newCatName.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 89)}`;
    const newItem: CategoryItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : `cat-${Date.now()}`,
      category_name: newCatName,
      category_code: code,
      hsn_code: newHsnCode,
      default_making_type: newMakingType,
      default_making_rate: parseFloat(newMakingRate) || 0,
      default_wastage_percent: parseFloat(newWastage) || 0,
      gender: newGender,
      active_items_count: 0,
      is_active: newIsActive,
    };

    setCategories([newItem, ...categories]);
    setNewCatName('');
    setNewCatCode('');
    setShowAddForm(false);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="inventory_categories" />
      <ActionToolbar
        filterPlaceholder="Filter categories by name, code, HSN..."
        insertLabel="New Category"
        onInsertClick={() => setShowAddForm(true)}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI metrics cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Active Categories</span>
                <FolderTree className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">{categories.length}</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                Hierarchy mapped
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Items Tagged</span>
                <Tag className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">2,480</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Across all showrooms
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Standard HSN Codes</span>
                <Hash className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">7113, 7114, 7118</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                3% GST jewellery chapter
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Avg Making Charge</span>
                <Percent className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">12.5%</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Standard wastage base
              </div>
            </div>
          </div>
        </div>

        {/* Form Card (Collapsible) */}
        {showAddForm && (
          <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-[#f8fafc]">
            <div className="max-w-4xl mx-auto bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#f1f5f9]">
                <div className="flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-neutral-800 uppercase tracking-wider">
                    Add Product Category
                  </span>
                </div>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-neutral-400 hover:text-neutral-600 text-xs cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleAddCategory} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Category Name *</label>
                    <input
                      type="text"
                      required
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="e.g. Diamond Nose Pins & Studs"
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 placeholder:text-neutral-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Category Code</label>
                    <input
                      type="text"
                      value={newCatCode}
                      onChange={(e) => setNewCatCode(e.target.value)}
                      placeholder="CAT-NP-09 (Auto if blank)"
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">GST HSN Code *</label>
                    <select
                      value={newHsnCode}
                      onChange={(e) => setNewHsnCode(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    >
                      <option value="71131910">71131910 — Gold Jewellery Studded/Plain</option>
                      <option value="71131120">71131120 — Silver Jewellery Plain</option>
                      <option value="71141110">71141110 — Silver Articles / Puja Items</option>
                      <option value="71189000">71189000 — Gold Coins (Other Coinage)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Making Charge Rule</label>
                    <select
                      value={newMakingType}
                      onChange={(e) => setNewMakingType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="PER_GRAM">Per Gram (₹/g)</option>
                      <option value="FLAT_RATE">Flat Rate (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Default Value ({newMakingType === 'PERCENTAGE' ? '%' : '₹'})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newMakingRate}
                      onChange={(e) => setNewMakingRate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Wastage VA (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newWastage}
                      onChange={(e) => setNewWastage(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Target Gender</label>
                    <select
                      value={newGender}
                      onChange={(e) => setNewGender(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    >
                      <option value="Women">Women</option>
                      <option value="Men">Men</option>
                      <option value="Kids">Kids</option>
                      <option value="Unisex">Unisex</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700">
                    <input
                      type="checkbox"
                      checked={newIsActive}
                      onChange={(e) => setNewIsActive(e.target.checked)}
                      className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                    />
                    <span>Active in POS Billing Catalog</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Save Category
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Supabase-style Table / Schema Definition Section */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            {/* Table Header Info Bar */}
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  product_categories
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  {categories.length} configured jewellery departments
                </span>
              </div>

              {/* Data / Definition toggle buttons */}
              <div className="flex items-center bg-neutral-200/60 p-0.5 rounded border border-neutral-300/60 text-[13px]">
                <button
                  onClick={() => setActiveTab('data')}
                  className={`px-2.5 py-0.5 rounded font-medium transition-all cursor-pointer ${
                    activeTab === 'data'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Data
                </button>
                <button
                  onClick={() => setActiveTab('definition')}
                  className={`px-2.5 py-0.5 rounded font-medium transition-all cursor-pointer ${
                    activeTab === 'definition'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Definition
                </button>
              </div>
            </div>

            {/* Table Content: Data Tab */}
            {activeTab === 'data' && (
              <div className="flex-1 overflow-x-auto custom-scrollbar w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#fcfcfc] border-b border-[#e5e7eb] text-neutral-600 font-mono text-[12px]">
                      <th className="w-10 px-3 py-2 border-r border-[#e5e7eb] text-center">
                        <input
                          type="checkbox"
                          className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                        />
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">id</span>
                          <span className="text-neutral-400 font-normal text-[10px]">uuid</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">category_name</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">code</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">hsn_code</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">making_rule</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">wastage_va</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">gender</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">items_count</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">status</span>
                      </th>
                      <th className="px-3.5 py-2 font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb] font-mono text-neutral-800 text-[12px]">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-neutral-50/80 transition-colors group">
                        <td className="px-3 py-2 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>

                        {/* ID */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <div className="flex items-center gap-1.5 group/cell">
                            <span className="truncate max-w-[80px] text-neutral-500">
                              {cat.id.slice(0, 8)}...
                            </span>
                            <button
                              onClick={() => copyToClipboard(cat.id, cat.id)}
                              className="opacity-0 group-hover/cell:opacity-100 p-0.5 hover:bg-neutral-200 rounded transition-opacity cursor-pointer"
                              title="Copy UUID"
                            >
                              {copiedId === cat.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3 text-neutral-400" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Category Name */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-sans font-medium text-neutral-900">
                          {cat.category_name}
                        </td>

                        {/* Code */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-700 text-[11px]">
                            {cat.category_code}
                          </span>
                        </td>

                        {/* HSN Code */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700">
                          {cat.hsn_code}
                        </td>

                        {/* Making Rule */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span className="text-neutral-900 font-medium">
                            {cat.default_making_type === 'PERCENTAGE'
                              ? `${cat.default_making_rate}%`
                              : cat.default_making_type === 'PER_GRAM'
                              ? `₹ ${cat.default_making_rate}/g`
                              : `₹ ${cat.default_making_rate} flat`}
                          </span>
                        </td>

                        {/* Wastage */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700">
                          {cat.default_wastage_percent.toFixed(1)}%
                        </td>

                        {/* Gender */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded text-[11px] bg-blue-50 text-blue-700 border border-blue-200 font-sans">
                            {cat.gender}
                          </span>
                        </td>

                        {/* Items Count */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-medium text-neutral-900">
                          {cat.active_items_count} pcs
                        </td>

                        {/* Status */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              cat.is_active
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {cat.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-3.5 py-2 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="p-1 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded transition-colors"
                              title="Delete category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table Content: Definition Tab */}
            {activeTab === 'definition' && (
              <div className="p-4 overflow-x-auto font-mono text-xs text-neutral-800 bg-[#fbfbfb] w-full">
                <div className="bg-neutral-900 text-neutral-100 p-4 rounded-md overflow-x-auto shadow-inner text-[12px] leading-relaxed w-full">
                  <span className="text-emerald-400">CREATE TABLE</span> public.product_categories (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">category_name</span>{' '}
                  <span className="text-amber-300">varchar(100)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">category_code</span>{' '}
                  <span className="text-amber-300">varchar(20)</span>{' '}
                  <span className="text-neutral-400">UNIQUE NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">hsn_code</span>{' '}
                  <span className="text-amber-300">varchar(10)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">default_making_type</span>{' '}
                  <span className="text-amber-300">varchar(20)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;PERCENTAGE&apos;,</span>
                  <br />
                  <span className="pl-6 text-blue-300">default_making_rate</span>{' '}
                  <span className="text-amber-300">numeric(10,2)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 12.00,</span>
                  <br />
                  <span className="pl-6 text-blue-300">default_wastage_percent</span>{' '}
                  <span className="text-amber-300">numeric(5,2)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 10.00,</span>
                  <br />
                  <span className="pl-6 text-blue-300">gender</span>{' '}
                  <span className="text-amber-300">varchar(20)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;Women&apos;,</span>
                  <br />
                  <span className="pl-6 text-blue-300">is_active</span>{' '}
                  <span className="text-amber-300">boolean</span>{' '}
                  <span className="text-neutral-400">DEFAULT true</span>
                  <br />
                  );
                  <br />
                  <br />
                  <span className="text-neutral-500">-- Index on category code and GST HSN lookup</span>
                  <br />
                  <span className="text-emerald-400">CREATE INDEX</span> idx_categories_code{' '}
                  <span className="text-emerald-400">ON</span> public.product_categories (category_code);
                  <br />
                  <span className="text-emerald-400">ALTER TABLE</span> public.product_categories{' '}
                  <span className="text-emerald-400">ENABLE ROW LEVEL SECURITY;</span>
                </div>
              </div>
            )}

            {/* Table Footer Bar */}
            <div className="h-[36px] bg-[#f8fafc] border-t border-[#e5e7eb] px-3.5 flex items-center justify-between text-[12px] text-neutral-500 font-mono select-none w-full">
              <div className="flex items-center gap-3">
                <span>{categories.length} categories active</span>
                <span>•</span>
                <span>HSN compliant with GST portal 2026</span>
              </div>
              <div className="text-emerald-600 font-medium">
                Tax Category Rules Ready
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
