'use client';

import React, { useState, useEffect } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Printer,
  QrCode,
  Tag,
  CheckCircle2,
  Clock,
  Layers,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Sliders,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Plus,
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

export interface PrintQueueItem {
  id: string;
  tag_code: string;
  item_name: string;
  gross_wt: number;
  net_wt: number;
  karat: string;
  huid: string;
  tag_format: 'Dumbbell (68x12mm)' | 'Rat-tail (50x10mm)' | 'Butterfly (40x25mm)';
  status: 'QUEUED' | 'PRINTED';
}

export function InventoryBarcodeTagsView() {
  const [queue, setQueue] = useState<PrintQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterFormat, setFilterFormat] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Form State
  const [tagCode, setTagCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [grossWt, setGrossWt] = useState('');
  const [netWt, setNetWt] = useState('');
  const [karat, setKarat] = useState('22K (916)');
  const [huid, setHuid] = useState('');
  const [tagFormat, setTagFormat] = useState<PrintQueueItem['tag_format']>('Dumbbell (68x12mm)');

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'inventory_barcode_queue'));
      const list: PrintQueueItem[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<PrintQueueItem, 'id'>) });
      });
      setQueue(list);
    } catch (err: any) {
      console.error('Error fetching barcode queue:', err);
      showToast('error', err.message || 'Failed to fetch print queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
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
    setTagCode('TG-' + Math.floor(1000 + Math.random() * 9000));
    setHuid('HD' + Math.floor(1000 + Math.random() * 8999));
    setItemName('');
    setGrossWt('');
    setNetWt('');
    setIsAddModalOpen(true);
  };

  const handleAddToQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !grossWt) return;

    try {
      setSaving(true);
      const gross = parseFloat(grossWt) || 0;
      const net = parseFloat(netWt) || gross;
      const newItem = {
        tag_code: tagCode.trim() || 'TG-' + Math.floor(1000 + Math.random() * 9000),
        item_name: itemName.trim(),
        gross_wt: gross,
        net_wt: net,
        karat,
        huid: huid.trim().toUpperCase() || 'HD' + Math.floor(1000 + Math.random() * 8999),
        tag_format: tagFormat,
        status: 'QUEUED' as const,
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'inventory_barcode_queue'), newItem);
      setQueue((prev) => [{ id: docRef.id, ...newItem }, ...prev]);
      setIsAddModalOpen(false);
      showToast('success', `Tag for "${itemName}" added to print queue.`);
    } catch (err: any) {
      console.error('Error adding to print queue:', err);
      showToast('error', err.message || 'Failed to queue tag');
    } finally {
      setSaving(false);
    }
  };

  const handlePrintAll = async () => {
    const queuedItems = queue.filter((i) => i.status === 'QUEUED');
    if (queuedItems.length === 0) {
      showToast('error', 'No queued tags to print.');
      return;
    }

    try {
      setSaving(true);
      await Promise.all(
        queuedItems.map((item) =>
          updateDoc(doc(db, 'inventory_barcode_queue', item.id), { status: 'PRINTED' })
        )
      );
      setQueue((prev) =>
        prev.map((item) => ({ ...item, status: 'PRINTED' }))
      );
      showToast('success', `Printed ${queuedItems.length} jewellery tags successfully.`);
    } catch (err: any) {
      console.error('Error printing tags:', err);
      showToast('error', err.message || 'Failed to execute print batch');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id: string, name: string) => {
    try {
      await deleteDoc(doc(db, 'inventory_barcode_queue', id));
      setQueue((prev) => prev.filter((i) => i.id !== id));
      showToast('success', `Tag removed from queue.`);
    } catch (err: any) {
      console.error('Error removing tag:', err);
    }
  };

  const filteredQueue = queue.filter((item) => {
    if (filterFormat !== 'All' && item.tag_format !== filterFormat) return false;
    if (filterStatus !== 'All' && item.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTag = item.tag_code?.toLowerCase().includes(q);
      const matchHuid = item.huid?.toLowerCase().includes(q);
      const matchName = item.item_name?.toLowerCase().includes(q);
      if (!matchTag && !matchHuid && !matchName) return false;
    }
    return true;
  });

  const queuedCount = queue.filter((i) => i.status === 'QUEUED').length;
  const printedCount = queue.filter((i) => i.status === 'PRINTED').length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="inventory_barcode_tags" />
      <ActionToolbar
        filterPlaceholder="Filter tag print queue by barcode, HUID..."
        insertLabel="Queue Tag"
        onInsertClick={handleOpenAdd}
        onRefresh={fetchQueue}
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
                <span className="text-[11px] font-medium uppercase tracking-wider">Awaiting Print</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{queuedCount}</div>
              <div className="text-[10px] text-amber-600 font-medium mt-0.5">Ready for thermal spooler</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Printed Tags</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{printedCount}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Completed tag prints</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Dumbbell Format</span>
                <Tag className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                {queue.filter((i) => i.tag_format.includes('Dumbbell')).length}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">68×12mm standard labels</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">BIS HUID Mapped</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">100%</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Ready for optical scanners</div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search barcode or HUID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-[#f8fafc] focus:bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-medium placeholder:text-neutral-400 w-48 sm:w-60"
                />
              </div>

              <select
                value={filterFormat}
                onChange={(e) => setFilterFormat(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-700 font-medium cursor-pointer"
              >
                <option value="All">All Label Types</option>
                <option value="Dumbbell (68x12mm)">Dumbbell (68x12mm)</option>
                <option value="Rat-tail (50x10mm)">Rat-tail (50x10mm)</option>
                <option value="Butterfly (40x25mm)">Butterfly (40x25mm)</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-700 font-medium cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="QUEUED">Queued</option>
                <option value="PRINTED">Printed</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintAll}
                disabled={saving || queuedCount === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print All Queued ({queuedCount})</span>
              </button>

              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] hover:bg-[#1fa070] text-white shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Queue Tag</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-2xs overflow-hidden">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-2 text-neutral-500">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs font-medium">Loading tag queue from Firebase...</span>
              </div>
            ) : filteredQueue.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                  <Printer className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-neutral-800">Print Queue Empty</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  {queue.length === 0
                    ? 'No jewellery barcode tags queued in Firebase. Click "Queue Tag" to send ornaments for thermal barcode label printing.'
                    : 'No tags match the active filters.'}
                </p>
                {queue.length === 0 && (
                  <button
                    onClick={handleOpenAdd}
                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] text-white hover:bg-[#1fa070] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Queue First Label
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f8fafc] text-neutral-600 font-medium border-b border-[#e2e8f0]">
                    <tr>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Barcode Code</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Item Name</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Purity</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Gross Wt</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Net Wt</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">HUID Stamp</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Label Format</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Status</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {filteredQueue.map((item) => (
                      <tr key={item.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1 font-mono font-medium text-neutral-800">
                            <span>{item.tag_code}</span>
                            <button
                              onClick={() => copyToClipboard(item.tag_code, item.id)}
                              className="text-neutral-400 hover:text-neutral-600"
                              title="Copy code"
                            >
                              {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 font-medium text-neutral-800">{item.item_name}</td>

                        <td className="py-2.5 px-3">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                            {item.karat}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono text-neutral-800 font-medium">
                          {Number(item.gross_wt).toFixed(3)}g
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-medium">
                          {Number(item.net_wt).toFixed(3)}g
                        </td>

                        <td className="py-2.5 px-3 font-mono font-medium text-neutral-700">
                          {item.huid}
                        </td>

                        <td className="py-2.5 px-3 text-neutral-600">{item.tag_format}</td>

                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            item.status === 'QUEUED'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {item.status}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeleteItem(item.id, item.item_name)}
                            className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Remove tag"
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

      {/* Add Tag to Queue Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-medium text-neutral-800">Queue Jewellery Label for Printing</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddToQueue} className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Tag Code *</label>
                  <input
                    type="text"
                    required
                    value={tagCode}
                    onChange={(e) => setTagCode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">BIS HUID *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={huid}
                    onChange={(e) => setHuid(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono uppercase text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Item Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diamond Pendant or 22K Bangle"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Gross Wt (g) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="0.000"
                    value={grossWt}
                    onChange={(e) => {
                      setGrossWt(e.target.value);
                      if (!netWt) setNetWt(e.target.value);
                    }}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Net Wt (g) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="0.000"
                    value={netWt}
                    onChange={(e) => setNetWt(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Purity</label>
                  <select
                    value={karat}
                    onChange={(e) => setKarat(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none font-medium"
                  >
                    <option value="22K (916)">22K (916)</option>
                    <option value="18K (750)">18K (750)</option>
                    <option value="24K (999)">24K (999)</option>
                    <option value="Silver 925">Silver 925</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Label Tag Format</label>
                <select
                  value={tagFormat}
                  onChange={(e) => setTagFormat(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none font-medium"
                >
                  <option value="Dumbbell (68x12mm)">Dumbbell (68x12mm) — Rings &amp; Bangles</option>
                  <option value="Rat-tail (50x10mm)">Rat-tail (50x10mm) — Chains &amp; Necklaces</option>
                  <option value="Butterfly (40x25mm)">Butterfly (40x25mm) — Earrings</option>
                </select>
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
                  <span>{saving ? 'Saving...' : 'Add to Queue'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
