'use client';

import React, { useState, useEffect } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Package,
  Layers,
  Plus,
  X,
  Copy,
  Check,
  ShieldCheck,
  ArrowUpDown,
  Tag,
  Scale,
  Percent,
  Coins,
  MapPin,
  CheckCircle2,
  Trash2,
  Loader2,
  AlertCircle,
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

export interface OrnamentItem {
  id: string;
  tag_number: string;
  huid_code: string;
  ornament_name: string;
  category: string;
  metal: string;
  purity: string;
  gross_weight_g: number;
  net_weight_g: number;
  stone_weight_cts: number;
  location: string;
  making_charge: number;
  wastage_percent: number;
  estimated_value: number;
  status: 'IN_STOCK' | 'RESERVED' | 'ON_APPROVAL' | 'SOLD';
}

export function InventoryOrnamentsView() {
  const [ornaments, setOrnaments] = useState<OrnamentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedKarat, setSelectedKarat] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New Ornament Form State
  const [newTag, setNewTag] = useState('');
  const [newHUID, setNewHUID] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Necklace');
  const [newMetal, setNewMetal] = useState('Yellow Gold');
  const [newKarat, setNewKarat] = useState('22K (916)');
  const [newGrossWt, setNewGrossWt] = useState('');
  const [newNetWt, setNewNetWt] = useState('');
  const [newStoneWt, setNewStoneWt] = useState('0.00');
  const [newWastage, setNewWastage] = useState('10.0');
  const [newMaking, setNewMaking] = useState('5000');
  const [newLocation, setNewLocation] = useState('Main Vault #1');

  const fetchOrnaments = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'inventory_ornaments'));
      const items: OrnamentItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as Omit<OrnamentItem, 'id'>) });
      });
      setOrnaments(items);
    } catch (err: any) {
      console.error('Error fetching ornaments:', err);
      showToast('error', err.message || 'Failed to load ornaments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrnaments();
  }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setStatusMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAddModal = () => {
    const randomTag = 'TAG-G-' + Math.floor(1000 + Math.random() * 9000);
    const randomHuid = 'HD' + Math.floor(1000 + Math.random() * 8999);
    setNewTag(randomTag);
    setNewHUID(randomHuid);
    setNewName('');
    setNewGrossWt('');
    setNewNetWt('');
    setIsAddModalOpen(true);
  };

  const handleAddOrnament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newGrossWt) return;

    try {
      setSaving(true);
      const gross = parseFloat(newGrossWt) || 0;
      const net = parseFloat(newNetWt) || gross;
      const making = parseFloat(newMaking) || 0;
      const wastage = parseFloat(newWastage) || 0;
      const estimatedValue = Math.round(net * 7850 + making);

      const ornamentData = {
        tag_number: newTag || 'TAG-G-' + Math.floor(1000 + Math.random() * 9000),
        huid_code: (newHUID || 'HD' + Math.floor(1000 + Math.random() * 8999)).toUpperCase(),
        ornament_name: newName.trim(),
        category: newCategory,
        metal: newMetal,
        purity: newKarat,
        gross_weight_g: gross,
        net_weight_g: net,
        stone_weight_cts: parseFloat(newStoneWt) || 0,
        location: newLocation,
        making_charge: making,
        wastage_percent: wastage,
        estimated_value: estimatedValue,
        status: 'IN_STOCK' as const,
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'inventory_ornaments'), ornamentData);
      setOrnaments((prev) => [{ id: docRef.id, ...ornamentData }, ...prev]);
      setIsAddModalOpen(false);
      showToast('success', `Ornament "${newName}" added successfully to inventory!`);
    } catch (err: any) {
      console.error('Error adding ornament:', err);
      showToast('error', err.message || 'Failed to save ornament to Firebase');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrnament = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await deleteDoc(doc(db, 'inventory_ornaments', id));
      setOrnaments((prev) => prev.filter((item) => item.id !== id));
      showToast('success', `Ornament deleted successfully.`);
    } catch (err: any) {
      console.error('Error deleting ornament:', err);
      showToast('error', err.message || 'Failed to delete ornament');
    }
  };

  const handleStatusChange = async (id: string, currentStatus: OrnamentItem['status']) => {
    const statuses: OrnamentItem['status'][] = ['IN_STOCK', 'RESERVED', 'ON_APPROVAL', 'SOLD'];
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];
    try {
      await updateDoc(doc(db, 'inventory_ornaments', id), { status: nextStatus });
      setOrnaments((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
      );
      showToast('success', `Status updated to ${nextStatus.replace('_', ' ')}.`);
    } catch (err: any) {
      console.error('Error updating status:', err);
      showToast('error', err.message || 'Failed to update status');
    }
  };

  const filteredOrnaments = ornaments.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (selectedKarat !== 'All' && !item.purity.includes(selectedKarat)) return false;
    if (selectedLocation !== 'All' && item.location !== selectedLocation) return false;
    if (selectedStatus !== 'All' && item.status !== selectedStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTag = item.tag_number?.toLowerCase().includes(q);
      const matchHuid = item.huid_code?.toLowerCase().includes(q);
      const matchName = item.ornament_name?.toLowerCase().includes(q);
      if (!matchTag && !matchHuid && !matchName) return false;
    }
    return true;
  });

  // Dynamic calculations from actual DB items
  const totalGrossWeight = ornaments.reduce((acc, curr) => acc + (curr.gross_weight_g || 0), 0);
  const totalNetWeight = ornaments.reduce((acc, curr) => acc + (curr.net_weight_g || 0), 0);
  const totalEstimatedVal = ornaments.reduce((acc, curr) => acc + (curr.estimated_value || 0), 0);
  const inStockCount = ornaments.filter((o) => o.status === 'IN_STOCK').length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="inventory_ornaments" />
      <ActionToolbar
        filterPlaceholder="Filter by tag, HUID, ornament name..."
        insertLabel="New Ornament"
        onInsertClick={handleOpenAddModal}
        onRefresh={fetchOrnaments}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        <div className="p-4 flex flex-col gap-4 max-w-7xl w-full mx-auto">
          {/* Toast Notification */}
          {toastType === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}
          {toastType === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-medium animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Metric Summary Cards - Dynamic */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Pieces</span>
                <Package className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{ornaments.length}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">{inStockCount} In Stock</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Gross Weight</span>
                <Scale className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                {totalGrossWeight.toFixed(3)} <span className="text-xs text-neutral-500 font-normal">g</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Physical scale weight</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Net Gold Content</span>
                <Coins className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                {totalNetWeight.toFixed(3)} <span className="text-xs text-neutral-500 font-normal">g</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Excluding precious stones</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Catalog Valuation</span>
                <Tag className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                ₹{totalEstimatedVal.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Live estimated value</div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search tag, HUID, name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-[#f8fafc] focus:bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-medium placeholder:text-neutral-400 transition-colors w-48 sm:w-60"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-700 font-medium cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Necklace">Necklaces</option>
                <option value="Rings">Rings</option>
                <option value="Earrings">Earrings</option>
                <option value="Bangles">Bangles</option>
                <option value="Chains">Chains</option>
                <option value="Silverware">Silverware</option>
                <option value="Mangalsutra">Mangalsutra</option>
              </select>

              <select
                value={selectedKarat}
                onChange={(e) => setSelectedKarat(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-700 font-medium cursor-pointer"
              >
                <option value="All">All Purities</option>
                <option value="22K">22K (916)</option>
                <option value="18K">18K (750)</option>
                <option value="24K">24K (999)</option>
                <option value="Silver">Silver 999/925</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-700 font-medium cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="RESERVED">Reserved</option>
                <option value="ON_APPROVAL">On Approval</option>
                <option value="SOLD">Sold</option>
              </select>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] hover:bg-[#1fa070] text-white shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Ornament</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-2xs overflow-hidden">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-2 text-neutral-500">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs font-medium">Loading ornaments from Firebase...</span>
              </div>
            ) : filteredOrnaments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-neutral-800">No Ornaments Found</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  {ornaments.length === 0
                    ? 'Your inventory database is currently clean and empty. Click "Add Ornament" to record your first stock item.'
                    : 'No items match your active search and filter criteria.'}
                </p>
                {ornaments.length === 0 && (
                  <button
                    onClick={handleOpenAddModal}
                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] text-white hover:bg-[#1fa070] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Record First Ornament
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f8fafc] text-neutral-600 font-medium border-b border-[#e2e8f0]">
                    <tr>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Tag &amp; HUID</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Ornament Name</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Category &amp; Purity</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Gross Wt</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Net Wt</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Location</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Estimated Value</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Status</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {filteredOrnaments.map((item) => (
                      <tr key={item.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-medium text-neutral-800">{item.tag_number}</span>
                            <button
                              onClick={() => copyToClipboard(item.tag_number, item.id)}
                              className="text-neutral-400 hover:text-neutral-600"
                              title="Copy Tag"
                            >
                              {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                          <div className="text-[10px] font-mono text-neutral-500 flex items-center gap-0.5 mt-0.5">
                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                            <span>HUID: {item.huid_code}</span>
                          </div>
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="font-medium text-neutral-800">{item.ornament_name}</div>
                          <div className="text-[10px] text-neutral-500 mt-0.5">{item.metal}</div>
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="text-neutral-700 font-medium">{item.category}</div>
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                            {item.purity}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono text-neutral-800 font-medium">
                          {Number(item.gross_weight_g).toFixed(3)}g
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-medium">
                          {Number(item.net_weight_g).toFixed(3)}g
                        </td>

                        <td className="py-2.5 px-3 text-neutral-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                          <span>{item.location}</span>
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono text-neutral-800 font-medium">
                          ₹{Number(item.estimated_value).toLocaleString('en-IN')}
                        </td>

                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => handleStatusChange(item.id, item.status)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors cursor-pointer ${
                              item.status === 'IN_STOCK'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : item.status === 'RESERVED'
                                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                : item.status === 'ON_APPROVAL'
                                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200'
                            }`}
                            title="Click to cycle status"
                          >
                            {item.status.replace('_', ' ')}
                          </button>
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeleteOrnament(item.id, item.ornament_name)}
                            className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete ornament"
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

      {/* Add Ornament Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-medium text-neutral-800">Add New Jewellery Item to Stock</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddOrnament} className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Barcode / Tag Number *</label>
                  <input
                    type="text"
                    required
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">BIS HUID (6 Alphanumeric) *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={newHUID}
                    onChange={(e) => setNewHUID(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Ornament Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 22K Antique Temple Haar or Daily Wear Bangle"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Necklace">Necklace</option>
                    <option value="Rings">Rings</option>
                    <option value="Earrings">Earrings</option>
                    <option value="Bangles">Bangles</option>
                    <option value="Chains">Chains</option>
                    <option value="Silverware">Silverware</option>
                    <option value="Mangalsutra">Mangalsutra</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Metal</label>
                  <select
                    value={newMetal}
                    onChange={(e) => setNewMetal(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Yellow Gold">Yellow Gold</option>
                    <option value="Rose Gold">Rose Gold</option>
                    <option value="White Gold">White Gold</option>
                    <option value="Fine Silver">Fine Silver</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Purity</label>
                  <select
                    value={newKarat}
                    onChange={(e) => setNewKarat(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="22K (916)">22K (916)</option>
                    <option value="18K (750)">18K (750)</option>
                    <option value="24K (999)">24K (999)</option>
                    <option value="Silver 999">Silver 999</option>
                    <option value="Silver 925">Silver 925</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Gross Weight (g) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="0.000"
                    value={newGrossWt}
                    onChange={(e) => {
                      setNewGrossWt(e.target.value);
                      if (!newNetWt) setNewNetWt(e.target.value);
                    }}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Net Weight (g) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="0.000"
                    value={newNetWt}
                    onChange={(e) => setNewNetWt(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Stone Wt (Cts)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newStoneWt}
                    onChange={(e) => setNewStoneWt(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Making Charge (₹)</label>
                  <input
                    type="number"
                    value={newMaking}
                    onChange={(e) => setNewMaking(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Wastage %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWastage}
                    onChange={(e) => setNewWastage(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Vault / Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 border border-[#e2e8f0] text-neutral-600 rounded-md font-medium hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-[#24b47e] hover:bg-[#1fa070] text-white rounded-md font-medium shadow-2xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{saving ? 'Saving...' : 'Add Ornament to Stock'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
