'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import { SalesSubNav } from './SalesSubNav';
import {
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  Share2,
  Printer,
  X,
  AlertCircle,
  BadgeIndianRupee,
  Plus,
  Trash2,
  Loader2,
  Search,
  ExternalLink,
  Eye,
  RefreshCw,
  Scale,
  Sparkles,
  ArrowRight,
  ShieldCheck,
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

export interface QuotationItem {
  id: string;
  quote_no: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  items_summary: string;
  category: string;
  metal_type: string;
  gross_weight_g: number;
  stone_weight_g: number;
  net_weight_g: number;
  gold_rate_applied: number;
  making_charges: number;
  wastage_percent: number;
  stone_value: number;
  discount_amount: number;
  taxable_value: number;
  gst_amount: number;
  total_estimate: number;
  valid_until: string;
  is_rate_locked: boolean;
  status: 'OPEN' | 'CONVERTED' | 'EXPIRED';
  created_at: string;
}

export function SalesQuotationsView() {
  const [quotations, setQuotations] = useState<QuotationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'OPEN' | 'CONVERTED' | 'EXPIRED'>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<QuotationItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [quoteNo, setQuoteNo] = useState('');
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [itemsSummary, setItemsSummary] = useState('');
  const [category, setCategory] = useState('Necklace');
  const [metalType, setMetalType] = useState('Gold 22K (916)');
  const [grossWeight, setGrossWeight] = useState('');
  const [stoneWeight, setStoneWeight] = useState('0.000');
  const [stoneValue, setStoneValue] = useState('0');
  const [goldRate, setGoldRate] = useState('7850');
  const [makingCharges, setMakingCharges] = useState('4500');
  const [wastagePercent, setWastagePercent] = useState('0');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [validUntil, setValidUntil] = useState('');
  const [isRateLocked, setIsRateLocked] = useState(true);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'sales_quotations'));
      const list: QuotationItem[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<QuotationItem, 'id'>) });
      });
      list.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
      setQuotations(list);
    } catch (err: unknown) {
      console.error('Error fetching quotations:', err);
      showToast('error', 'Failed to load quotations from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleOpenAddModal = () => {
    const yr = new Date().getFullYear();
    setQuoteNo(`EST-${yr}-${Math.floor(1000 + Math.random() * 9000)}`);
    setCustName('');
    setCustPhone('');
    setCustEmail('');
    setItemsSummary('');
    setGrossWeight('');
    setStoneWeight('0.000');
    setStoneValue('0');
    setGoldRate('7850');
    setMakingCharges('4500');
    setWastagePercent('0');
    setDiscountAmount('0');
    // Default valid until 3 days from now
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setValidUntil(d.toISOString().split('T')[0]);
    setIsRateLocked(true);
    setIsAddModalOpen(true);
  };

  // Live calculation for Add Form
  const formCalculations = useMemo(() => {
    const gross = parseFloat(grossWeight) || 0;
    const stone = parseFloat(stoneWeight) || 0;
    const net = Math.max(0, gross - stone);
    const rate = parseFloat(goldRate) || 0;
    const making = parseFloat(makingCharges) || 0;
    const stoneVal = parseFloat(stoneValue) || 0;
    const wastage = parseFloat(wastagePercent) || 0;
    const discount = parseFloat(discountAmount) || 0;

    const metalVal = net * (1 + wastage / 100) * rate;
    const taxable = Math.max(0, metalVal + making + stoneVal - discount);
    const totalGst = (taxable * 3) / 100;
    const totalEstimate = Math.round(taxable + totalGst);

    return { gross, stone, net, metalVal, taxable, totalGst, totalEstimate };
  }, [grossWeight, stoneWeight, goldRate, makingCharges, stoneValue, wastagePercent, discountAmount]);

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || formCalculations.gross <= 0) {
      showToast('error', 'Customer name and valid weight are required.');
      return;
    }

    try {
      setSaving(true);
      const quoteData = {
        quote_no: quoteNo.trim(),
        customer_name: custName.trim(),
        customer_phone: custPhone.trim() || 'N/A',
        customer_email: custEmail.trim() || '',
        items_summary: itemsSummary.trim() || `${metalType} ${category} Estimation`,
        category,
        metal_type: metalType,
        gross_weight_g: formCalculations.gross,
        stone_weight_g: formCalculations.stone,
        net_weight_g: formCalculations.net,
        gold_rate_applied: parseFloat(goldRate) || 0,
        making_charges: parseFloat(makingCharges) || 0,
        wastage_percent: parseFloat(wastagePercent) || 0,
        stone_value: parseFloat(stoneValue) || 0,
        discount_amount: parseFloat(discountAmount) || 0,
        taxable_value: Math.round(formCalculations.taxable * 100) / 100,
        gst_amount: Math.round(formCalculations.totalGst * 100) / 100,
        total_estimate: formCalculations.totalEstimate,
        valid_until: validUntil,
        is_rate_locked: isRateLocked,
        status: 'OPEN' as const,
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'sales_quotations'), quoteData);
      const newQuote: QuotationItem = { id: docRef.id, ...quoteData };
      setQuotations((prev) => [newQuote, ...prev]);
      setIsAddModalOpen(false);
      showToast('success', `Quotation ${newQuote.quote_no} created successfully.`);
    } catch (err: unknown) {
      console.error('Error saving quotation:', err);
      showToast('error', 'Failed to save quotation to Firestore.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'OPEN' | 'CONVERTED' | 'EXPIRED') => {
    try {
      await updateDoc(doc(db, 'sales_quotations', id), { status: newStatus });
      setQuotations((prev) => prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q)));
      showToast('success', `Quotation marked as ${newStatus}`);
    } catch (err: unknown) {
      console.error('Error updating status:', err);
      showToast('error', 'Failed to update quotation status.');
    }
  };

  const handleDeleteQuotation = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteDoc(doc(db, 'sales_quotations', id));
      setQuotations((prev) => prev.filter((q) => q.id !== id));
      setDeleteConfirmId(null);
      showToast('success', 'Quotation deleted successfully.');
    } catch (err: unknown) {
      console.error('Error deleting quotation:', err);
      showToast('error', 'Failed to delete quotation.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredQuotes = quotations.filter((q) => {
    const s = searchQuery.toLowerCase();
    const matchesSearch =
      q.quote_no?.toLowerCase().includes(s) ||
      q.customer_name?.toLowerCase().includes(s) ||
      q.customer_phone?.toLowerCase().includes(s) ||
      q.items_summary?.toLowerCase().includes(s);
    const matchesStatus = selectedStatus === 'ALL' || q.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalQuotesValue = quotations.reduce((acc, curr) => acc + (curr.total_estimate || 0), 0);
  const openQuotesCount = quotations.filter((q) => q.status === 'OPEN').length;
  const convertedCount = quotations.filter((q) => q.status === 'CONVERTED').length;
  const totalWeightEstimates = quotations.reduce((acc, curr) => acc + (curr.gross_weight_g || 0), 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="sales_quotations" />
      <ActionToolbar
        filterPlaceholder="Filter by quotation #, customer, metal, items..."
        insertLabel="New Quotation"
        onRefresh={fetchQuotations}
        onInsertClick={handleOpenAddModal}
      />
      <SalesSubNav />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        <div className="p-4 sm:p-5 flex flex-col gap-4 max-w-7xl w-full mx-auto">
          {/* Toast */}
          {toastType === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}
          {toastType === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Quotes</span>
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{quotations.length}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">{openQuotesCount} Open / Pending</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Pipeline Value</span>
                <BadgeIndianRupee className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                ₹{totalQuotesValue.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Estimated gross pipeline</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Quoted Weight</span>
                <Scale className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                {totalWeightEstimates.toFixed(3)} <span className="text-xs text-neutral-500 font-normal">g</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Physical metal weight</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Converted Sales</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700">
                {convertedCount} <span className="text-xs text-neutral-500 font-normal">Converted</span>
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">
                {quotations.length > 0
                  ? `${Math.round((convertedCount / quotations.length) * 100)}% conversion rate`
                  : '0% conversion'}
              </div>
            </div>
          </div>

          {/* Search, Status Filter & Actions */}
          <div className="bg-white p-3 rounded-lg border border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search quote #, customer, item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-[#e2e8f0] rounded-md text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500 font-medium">Status:</span>
              {(['ALL', 'OPEN', 'CONVERTED', 'EXPIRED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    selectedStatus === st
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-neutral-50 text-neutral-600 border border-[#e2e8f0] hover:bg-neutral-100'
                  }`}
                >
                  {st}
                </button>
              ))}

              <Link
                href="/sales/billing-pos"
                className="ml-2 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded font-medium text-[11px] flex items-center gap-1 transition-colors"
              >
                <span>POS Counter</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Table / Empty State */}
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center bg-white rounded-lg border border-[#e2e8f0]">
              <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mb-2" />
              <span className="text-xs text-neutral-500 font-medium">Loading quotations from Firestore...</span>
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center bg-white rounded-lg border border-[#e2e8f0] text-center">
              <FileSpreadsheet className="w-10 h-10 text-neutral-300 mb-3 stroke-1" />
              <h3 className="text-sm font-medium text-neutral-800 mb-1">No Quotations Found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mb-4">
                {searchQuery
                  ? 'No quotations match your current search.'
                  : 'No customer price quotations or estimates recorded yet. Create an estimate for a walk-in or prospective customer.'}
              </p>
              <button
                onClick={handleOpenAddModal}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Quotation</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-[#e2e8f0] text-neutral-600 font-medium text-[11px]">
                      <th className="py-2.5 px-3">Quote #</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Quoted Item</th>
                      <th className="py-2.5 px-2 text-right">Gross Wt</th>
                      <th className="py-2.5 px-2 text-right">Gold Rate</th>
                      <th className="py-2.5 px-3 text-right">Estimate Total</th>
                      <th className="py-2.5 px-3 text-center">Rate Lock</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {filteredQuotes.map((q) => (
                      <tr key={q.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-medium text-neutral-800">
                          {q.quote_no}
                          <div className="text-[10px] text-neutral-400 font-sans">
                            Valid till: {q.valid_until || 'N/A'}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-neutral-800">{q.customer_name}</div>
                          <div className="text-[10px] text-neutral-400 font-mono">{q.customer_phone}</div>
                        </td>
                        <td className="py-2.5 px-3 max-w-xs">
                          <div className="truncate text-neutral-700 font-medium" title={q.items_summary}>
                            {q.items_summary}
                          </div>
                          <div className="text-[10px] text-neutral-500 font-mono">{q.metal_type}</div>
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-neutral-700">
                          {q.gross_weight_g?.toFixed(3)}g
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-neutral-700">
                          ₹{q.gold_rate_applied}/g
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-700">
                          ₹{q.total_estimate?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {q.is_rate_locked ? (
                            <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Locked
                            </span>
                          ) : (
                            <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-medium bg-neutral-100 text-neutral-500">
                              Floating
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium font-mono ${
                              q.status === 'CONVERTED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : q.status === 'OPEN'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {q.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedQuote(q);
                                setIsViewModalOpen(true);
                              }}
                              className="p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-neutral-100 transition-colors"
                              title="View Quotation Slip"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {q.status === 'OPEN' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(q.id, 'CONVERTED')}
                                className="p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-neutral-100 transition-colors"
                                title="Convert to Sale"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(q.id)}
                              className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete Quote"
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
            </div>
          )}
        </div>
      </div>

      {/* CREATE NEW ESTIMATION / QUOTATION MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-5 border border-[#e2e8f0] animate-fadeIn text-xs max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] mb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-neutral-800 text-sm">Create New Price Quotation / Estimate</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Quotation No *</label>
                  <input
                    type="text"
                    required
                    value={quoteNo}
                    onChange={(e) => setQuoteNo(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Valid Until</label>
                  <input
                    type="date"
                    required
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="lockRate"
                    checked={isRateLocked}
                    onChange={(e) => setIsRateLocked(e.target.checked)}
                    className="rounded border-[#e2e8f0] text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="lockRate" className="text-neutral-700 font-medium cursor-pointer">
                    Lock Today&apos;s Gold Rate
                  </label>
                </div>
              </div>

              {/* Customer Info */}
              <div className="p-3 bg-neutral-50 rounded-lg border border-[#e2e8f0] space-y-2.5">
                <span className="font-medium text-neutral-700 block text-[11px] uppercase tracking-wider">
                  Customer Contact Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Customer Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Meera Nambiar"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] bg-white rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+91 98450 11223"
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] bg-white rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="meera@example.com"
                      value={custEmail}
                      onChange={(e) => setCustEmail(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] bg-white rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Jewellery Spec */}
              <div className="space-y-3">
                <span className="font-medium text-neutral-700 block text-[11px] uppercase tracking-wider">
                  Jewellery Spec & Weight Estimation
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Item Title / Summary</label>
                    <input
                      type="text"
                      placeholder="e.g. 22K Antique Temple Haar + Matching Jhumkas"
                      value={itemsSummary}
                      onChange={(e) => setItemsSummary(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-neutral-600 font-medium mb-1">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="Necklace">Necklace</option>
                        <option value="Earrings">Earrings</option>
                        <option value="Bangles">Bangles</option>
                        <option value="Rings">Rings</option>
                        <option value="Silver Articles">Silver Articles</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-neutral-600 font-medium mb-1">Metal / Purity</label>
                      <select
                        value={metalType}
                        onChange={(e) => setMetalType(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="Gold 22K (916)">Gold 22K (916)</option>
                        <option value="Gold 18K (750)">Gold 18K (750)</option>
                        <option value="Gold 24K (999)">Gold 24K (999)</option>
                        <option value="Fine Silver 999">Fine Silver 999</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Gross Wt (g) *</label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      placeholder="0.000"
                      value={grossWeight}
                      onChange={(e) => setGrossWeight(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Stone Wt (g)</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="0.000"
                      value={stoneWeight}
                      onChange={(e) => setStoneWeight(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Gold Rate (₹/g)</label>
                    <input
                      type="number"
                      value={goldRate}
                      onChange={(e) => setGoldRate(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Making Charges (₹)</label>
                    <input
                      type="number"
                      value={makingCharges}
                      onChange={(e) => setMakingCharges(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Wastage %</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={wastagePercent}
                      onChange={(e) => setWastagePercent(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Precious Stone Val (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={stoneValue}
                      onChange={(e) => setStoneValue(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Discount Offer (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Calculation Box */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1.5">
                <div className="flex justify-between text-emerald-800">
                  <span>Net Gold Content:</span>
                  <span className="font-mono font-medium">{formCalculations.net.toFixed(3)} g</span>
                </div>
                <div className="flex justify-between text-emerald-800">
                  <span>Taxable Estimate:</span>
                  <span className="font-mono font-medium">₹{formCalculations.taxable.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-700 text-[11px]">
                  <span>Estimated GST (3%):</span>
                  <span className="font-mono">₹{formCalculations.totalGst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-900 font-medium text-sm pt-1 border-t border-emerald-300">
                  <span>Total Estimated Cost:</span>
                  <span className="font-mono">₹{formCalculations.totalEstimate.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 border border-[#e2e8f0] text-neutral-600 rounded font-medium hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{saving ? 'Saving...' : 'Save Price Quotation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW / PRINT ESTIMATION SLIP MODAL */}
      {isViewModalOpen && selectedQuote && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-xl w-full p-6 border border-[#e2e8f0] animate-fadeIn text-xs max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] mb-4">
              <div>
                <h2 className="text-base font-medium text-neutral-800">PRICE ESTIMATION & QUOTATION</h2>
                <p className="text-[11px] text-neutral-500">Official Jewellery Quotation • Valid till {selectedQuote.valid_until}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#e2e8f0] text-[11px]">
              <div>
                <span className="text-neutral-400 block font-medium">Quote Ref:</span>
                <span className="font-mono font-medium text-neutral-800">{selectedQuote.quote_no}</span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">
                  Rate Lock: {selectedQuote.is_rate_locked ? 'Guaranteed' : 'Subject to Market'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-neutral-400 block font-medium">Valid Until:</span>
                <span className="font-mono text-neutral-700">{selectedQuote.valid_until}</span>
              </div>
              <div>
                <span className="text-neutral-400 block font-medium">Prepared For:</span>
                <span className="font-medium text-neutral-800">{selectedQuote.customer_name}</span>
                <div className="text-neutral-500 font-mono">{selectedQuote.customer_phone}</div>
              </div>
              <div className="text-right">
                <span className="text-neutral-400 block font-medium">Status:</span>
                <span className="font-medium text-emerald-700 font-mono">{selectedQuote.status}</span>
              </div>
            </div>

            {/* Spec Table */}
            <div className="py-3 border-b border-[#e2e8f0]">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-[#e2e8f0] text-neutral-500 font-medium">
                    <th className="py-1">Item Description</th>
                    <th className="py-1 text-right">Gross Wt</th>
                    <th className="py-1 text-right">Net Wt</th>
                    <th className="py-1 text-right">Rate</th>
                    <th className="py-1 text-right">Making</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2">
                      <div className="font-medium text-neutral-800">{selectedQuote.items_summary}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">{selectedQuote.metal_type}</div>
                    </td>
                    <td className="py-2 text-right font-mono">{selectedQuote.gross_weight_g?.toFixed(3)}g</td>
                    <td className="py-2 text-right font-mono">{selectedQuote.net_weight_g?.toFixed(3)}g</td>
                    <td className="py-2 text-right font-mono">₹{selectedQuote.gold_rate_applied}/g</td>
                    <td className="py-2 text-right font-mono">₹{selectedQuote.making_charges?.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="py-3 border-b border-[#e2e8f0] space-y-1 text-[11px]">
              <div className="flex justify-between text-neutral-600">
                <span>Taxable Value</span>
                <span className="font-mono">₹{selectedQuote.taxable_value?.toLocaleString('en-IN')}</span>
              </div>
              {selectedQuote.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Special Discount Applied</span>
                  <span className="font-mono">-₹{selectedQuote.discount_amount?.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-500">
                <span>Estimated GST (3%)</span>
                <span className="font-mono">₹{selectedQuote.gst_amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-neutral-800 pt-1 border-t border-[#e2e8f0] text-xs">
                <span>Total Estimated Value</span>
                <span className="font-mono text-emerald-700">
                  ₹{selectedQuote.total_estimate?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-[10px] text-neutral-400 max-w-xs">
                * Note: Estimation rates are valid strictly until the validity date stated above.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-3 py-1.5 border border-[#e2e8f0] rounded text-neutral-600 hover:bg-neutral-50 font-medium"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-4 border border-[#e2e8f0] animate-fadeIn text-xs">
            <h3 className="font-medium text-neutral-800 text-sm mb-2">Delete Quotation?</h3>
            <p className="text-neutral-500 mb-4">
              Are you sure you want to delete this price quotation? This action cannot be reversed.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 border border-[#e2e8f0] text-neutral-600 rounded font-medium hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingId === deleteConfirmId}
                onClick={() => handleDeleteQuotation(deleteConfirmId)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-medium flex items-center gap-1"
              >
                {deletingId === deleteConfirmId ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
