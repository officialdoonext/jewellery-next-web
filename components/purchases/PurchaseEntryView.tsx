'use client';

import React, { useState, useEffect } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  ShoppingBag,
  Coins,
  Package,
  Receipt,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Scale,
  Trash2,
  Loader2,
  Search,
  Building2,
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

export interface PurchaseInwardBill {
  id: string;
  purchase_inv_no: string;
  supplier_name: string;
  supplier_category: 'BULLION_REFINERY' | 'WHOLESALE_MANUFACTURER' | 'CASTING_HOUSE';
  purchase_category: 'BULLION_BAR' | 'FINISHED_ORNAMENTS';
  supplier_inv_date: string;
  rate_fix_date: string;
  gross_weight_g: number;
  purity_percent: number;
  pure_gold_g: number;
  gold_rate_per_g: number;
  taxable_value: number;
  gst_amount: number;
  grand_total: number;
  rcm_applicable: boolean;
  payment_terms: 'NET_15' | 'NET_30' | 'IMMEDIATE';
  payment_status: 'PAID' | 'PARTIAL' | 'UNPAID';
  auto_tag_generated: boolean;
}

export function PurchasesEntryView() {
  const [purchases, setPurchases] = useState<PurchaseInwardBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Form State
  const [invNo, setInvNo] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierCategory, setSupplierCategory] = useState<PurchaseInwardBill['supplier_category']>('BULLION_REFINERY');
  const [purchaseCategory, setPurchaseCategory] = useState<PurchaseInwardBill['purchase_category']>('BULLION_BAR');
  const [invDate, setInvDate] = useState(new Date().toISOString().split('T')[0]);
  const [grossWt, setGrossWt] = useState('');
  const [purity, setPurity] = useState('99.9');
  const [ratePerGram, setRatePerGram] = useState('7850.00');
  const [paymentTerms, setPaymentTerms] = useState<PurchaseInwardBill['payment_terms']>('NET_15');
  const [paymentStatus, setPaymentStatus] = useState<PurchaseInwardBill['payment_status']>('UNPAID');

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'purchases_entries'));
      const list: PurchaseInwardBill[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<PurchaseInwardBill, 'id'>) });
      });
      list.sort((a, b) => (b.supplier_inv_date || '').localeCompare(a.supplier_inv_date || ''));
      setPurchases(list);
    } catch (err: any) {
      console.error('Error fetching purchase invoices:', err);
      showToast('error', err.message || 'Failed to load purchase invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const handleOpenAdd = () => {
    setInvNo('PUR-' + Math.floor(1000 + Math.random() * 9000));
    setSupplierName('');
    setGrossWt('');
    setPurity('99.9');
    setRatePerGram('7850.00');
    setPaymentStatus('UNPAID');
    setIsAddModalOpen(true);
  };

  const handleAddPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim() || !grossWt || !ratePerGram) return;

    try {
      setSaving(true);
      const gross = parseFloat(grossWt) || 0;
      const pur = parseFloat(purity) || 99.9;
      const rate = parseFloat(ratePerGram) || 0;
      const pure = gross * (pur / 100);
      const taxable = pure * rate;
      const gst = taxable * 0.03; // 3% GST
      const grandTotal = taxable + gst;

      const newPurchase = {
        purchase_inv_no: invNo.trim() || 'PUR-' + Math.floor(1000 + Math.random() * 9000),
        supplier_name: supplierName.trim(),
        supplier_category: supplierCategory,
        purchase_category: purchaseCategory,
        supplier_inv_date: invDate,
        rate_fix_date: invDate,
        gross_weight_g: gross,
        purity_percent: pur,
        pure_gold_g: pure,
        gold_rate_per_g: rate,
        taxable_value: taxable,
        gst_amount: gst,
        grand_total: grandTotal,
        rcm_applicable: false,
        payment_terms: paymentTerms,
        payment_status: paymentStatus,
        auto_tag_generated: true,
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'purchases_entries'), newPurchase);
      setPurchases((prev) => [{ id: docRef.id, ...newPurchase }, ...prev]);
      setIsAddModalOpen(false);
      showToast('success', `Purchase invoice ${newPurchase.purchase_inv_no} recorded.`);
    } catch (err: any) {
      console.error('Error adding purchase invoice:', err);
      showToast('error', err.message || 'Failed to record purchase invoice');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, current: PurchaseInwardBill['payment_status']) => {
    const nextStatus = current === 'UNPAID' ? 'PARTIAL' : current === 'PARTIAL' ? 'PAID' : 'UNPAID';
    try {
      await updateDoc(doc(db, 'purchases_entries', id), { payment_status: nextStatus });
      setPurchases((prev) =>
        prev.map((p) => (p.id === id ? { ...p, payment_status: nextStatus } : p))
      );
      showToast('success', `Payment status changed to ${nextStatus}.`);
    } catch (err: any) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeletePurchase = async (id: string, invoiceNo: string) => {
    if (!confirm(`Delete purchase invoice ${invoiceNo}?`)) return;
    try {
      await deleteDoc(doc(db, 'purchases_entries', id));
      setPurchases((prev) => prev.filter((p) => p.id !== id));
      showToast('success', `Purchase invoice ${invoiceNo} deleted.`);
    } catch (err: any) {
      console.error('Error deleting purchase:', err);
    }
  };

  const filteredPurchases = purchases.filter((p) => {
    if (selectedCategory !== 'All' && p.purchase_category !== selectedCategory) return false;
    if (selectedStatus !== 'All' && p.payment_status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchInv = p.purchase_inv_no?.toLowerCase().includes(q);
      const matchSupp = p.supplier_name?.toLowerCase().includes(q);
      if (!matchInv && !matchSupp) return false;
    }
    return true;
  });

  const totalGrossWeight = purchases.reduce((acc, curr) => acc + (curr.gross_weight_g || 0), 0);
  const totalPureGold = purchases.reduce((acc, curr) => acc + (curr.pure_gold_g || 0), 0);
  const totalSpend = purchases.reduce((acc, curr) => acc + (curr.grand_total || 0), 0);
  const unpaidCount = purchases.filter((p) => p.payment_status !== 'PAID').length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="purchases_entry" />
      <ActionToolbar
        filterPlaceholder="Filter by invoice #, vendor, category..."
        insertLabel="New Purchase"
        onInsertClick={handleOpenAdd}
        onRefresh={fetchPurchases}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        <div className="p-4 flex flex-col gap-4 max-w-7xl w-full mx-auto">
          {/* Toast Notification */}
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
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Inward Wt</span>
                <Scale className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                {totalGrossWeight.toFixed(3)} <span className="text-xs text-neutral-500 font-normal">g</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Physical gross received</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Fine Gold Content</span>
                <Coins className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                {totalPureGold.toFixed(3)} <span className="text-xs text-neutral-500 font-normal">g</span>
              </div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">24K Fine Equivalent</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Inward Value</span>
                <Receipt className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                ₹{totalSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Includes 3% GST breakdown</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Pending Payables</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{unpaidCount} Bills</div>
              <div className="text-[10px] text-amber-600 font-medium mt-0.5">Unsettled purchase dues</div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search invoice # or supplier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-[#f8fafc] focus:bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-medium placeholder:text-neutral-400 w-48 sm:w-60"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-700 font-medium cursor-pointer"
              >
                <option value="All">All Inward Types</option>
                <option value="BULLION_BAR">Bullion Bars</option>
                <option value="FINISHED_ORNAMENTS">Finished Ornaments</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-700 font-medium cursor-pointer"
              >
                <option value="All">All Payment Statuses</option>
                <option value="PAID">Paid</option>
                <option value="PARTIAL">Partial</option>
                <option value="UNPAID">Unpaid</option>
              </select>
            </div>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] hover:bg-[#1fa070] text-white shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Purchase Invoice</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-2xs overflow-hidden">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-2 text-neutral-500">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs font-medium">Loading purchase invoices from Firebase...</span>
              </div>
            ) : filteredPurchases.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-neutral-800">No Purchase Invoices Found</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  {purchases.length === 0
                    ? 'No inward bullion or finished ornament purchases logged in Firebase yet. Click "New Purchase Invoice" to record supplier inward billing.'
                    : 'No invoices match your active filters.'}
                </p>
                {purchases.length === 0 && (
                  <button
                    onClick={handleOpenAdd}
                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] text-white hover:bg-[#1fa070] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Record First Purchase
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f8fafc] text-neutral-600 font-medium border-b border-[#e2e8f0]">
                    <tr>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Invoice # &amp; Date</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Supplier Name</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Commodity Type</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Gross Wt</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Purity %</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Fine Gold Wt</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Rate / g</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Grand Total (₹)</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Payment</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {filteredPurchases.map((p) => (
                      <tr key={p.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-mono font-medium text-neutral-800">{p.purchase_inv_no}</div>
                          <div className="text-[10px] text-neutral-500 mt-0.5">{p.supplier_inv_date}</div>
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="font-medium text-neutral-800 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{p.supplier_name}</span>
                          </div>
                          <div className="text-[10px] text-neutral-500 mt-0.5">{p.supplier_category.replace('_', ' ')}</div>
                        </td>

                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            p.purchase_category === 'BULLION_BAR'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}>
                            {p.purchase_category.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono text-neutral-800 font-medium">
                          {Number(p.gross_weight_g).toFixed(3)}g
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono text-neutral-700">
                          {p.purity_percent}%
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-700">
                          {Number(p.pure_gold_g).toFixed(3)}g
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono text-neutral-700">
                          ₹{Number(p.gold_rate_per_g).toLocaleString('en-IN')}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-medium text-neutral-900">
                          ₹{Number(p.grand_total).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>

                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => handleToggleStatus(p.id, p.payment_status)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors cursor-pointer ${
                              p.payment_status === 'PAID'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : p.payment_status === 'PARTIAL'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                            title="Click to toggle payment status"
                          >
                            {p.payment_status}
                          </button>
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeletePurchase(p.id, p.purchase_inv_no)}
                            className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete invoice"
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

      {/* Add Purchase Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-medium text-neutral-800">Record Inward Purchase Invoice</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPurchase} className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Purchase Invoice # *</label>
                  <input
                    type="text"
                    required
                    value={invNo}
                    onChange={(e) => setInvNo(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Invoice Date *</label>
                  <input
                    type="date"
                    required
                    value={invDate}
                    onChange={(e) => setInvDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Supplier / Refinery Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shree Bullion Refinery or Mangalore Casting Works"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Supplier Category</label>
                  <select
                    value={supplierCategory}
                    onChange={(e) => setSupplierCategory(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none font-medium"
                  >
                    <option value="BULLION_REFINERY">Bullion Refinery</option>
                    <option value="WHOLESALE_MANUFACTURER">Wholesale Manufacturer</option>
                    <option value="CASTING_HOUSE">Casting House</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Commodity Type</label>
                  <select
                    value={purchaseCategory}
                    onChange={(e) => setPurchaseCategory(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none font-medium"
                  >
                    <option value="BULLION_BAR">Bullion Bars (Raw 999)</option>
                    <option value="FINISHED_ORNAMENTS">Finished Ornaments (22K/18K)</option>
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
                    placeholder="1000.000"
                    value={grossWt}
                    onChange={(e) => setGrossWt(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Purity (%) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={purity}
                    onChange={(e) => setPurity(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Rate Fixed (₹/g) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="7850.00"
                    value={ratePerGram}
                    onChange={(e) => setRatePerGram(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Payment Terms</label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none font-medium"
                  >
                    <option value="IMMEDIATE">Immediate / Cash</option>
                    <option value="NET_15">Net 15 Days</option>
                    <option value="NET_30">Net 30 Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Initial Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none font-medium"
                  >
                    <option value="UNPAID">Unpaid</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="PAID">Paid</option>
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
                  <span>{saving ? 'Saving...' : 'Record Purchase'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
