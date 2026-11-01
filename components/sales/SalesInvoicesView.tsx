'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import { SalesSubNav } from './SalesSubNav';
import {
  Receipt,
  Printer,
  ShieldCheck,
  Building2,
  Copy,
  Check,
  X,
  BadgeIndianRupee,
  Truck,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  Eye,
  RefreshCw,
  FileText,
  Scale,
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

export interface SalesInvoice {
  id: string;
  invoice_number: string;
  invoice_type: 'B2C_RETAIL' | 'B2B_WHOLESALE';
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_gstin?: string;
  customer_pan?: string;
  invoice_date: string;
  items_summary: string;
  ornament_category: string;
  purity: string;
  huid_code: string;
  gross_weight_g: number;
  net_weight_g: number;
  gold_rate_per_g: number;
  making_charges: number;
  wastage_percent: number;
  stone_value: number;
  taxable_value: number;
  cgst_amount: number;
  sgst_amount: number;
  total_invoice_val: number;
  payment_method: string;
  irn_hash: string;
  eway_bill_no?: string;
  status: 'PAID' | 'PARTIAL' | 'CANCELLED';
  created_at: string;
}

export function SalesInvoicesView() {
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'ALL' | 'B2C_RETAIL' | 'B2B_WHOLESALE'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PAID' | 'PARTIAL' | 'CANCELLED'>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Invoice Form State
  const [invNumber, setInvNumber] = useState('');
  const [invType, setInvType] = useState<'B2C_RETAIL' | 'B2B_WHOLESALE'>('B2C_RETAIL');
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custGstin, setCustGstin] = useState('');
  const [custPan, setCustPan] = useState('');
  const [invDate, setInvDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemsSummary, setItemsSummary] = useState('');
  const [category, setCategory] = useState('Necklace');
  const [purity, setPurity] = useState('22K (916)');
  const [huid, setHuid] = useState('');
  const [grossWeight, setGrossWeight] = useState('');
  const [netWeight, setNetWeight] = useState('');
  const [goldRate, setGoldRate] = useState('7850');
  const [makingCharges, setMakingCharges] = useState('5000');
  const [wastagePercent, setWastagePercent] = useState('0');
  const [stoneValue, setStoneValue] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [ewayBill, setEwayBill] = useState('');

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

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'sales_invoices'));
      const list: SalesInvoice[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<SalesInvoice, 'id'>) });
      });
      list.sort((a, b) => new Date(b.created_at || b.invoice_date).getTime() - new Date(a.created_at || a.invoice_date).getTime());
      setInvoices(list);
    } catch (err: unknown) {
      console.error('Error fetching invoices:', err);
      showToast('error', 'Failed to load invoices from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleOpenAddModal = () => {
    const yr = new Date().getFullYear().toString().slice(-2);
    setInvNumber(`INV-${yr}-${Math.floor(1000 + Math.random() * 9000)}`);
    setCustName('');
    setCustPhone('');
    setCustEmail('');
    setCustGstin('');
    setCustPan('');
    setItemsSummary('');
    setHuid(`HD${Math.floor(1000 + Math.random() * 8999)}`);
    setGrossWeight('');
    setNetWeight('');
    setGoldRate('7850');
    setMakingCharges('5000');
    setStoneValue('0');
    setWastagePercent('0');
    setEwayBill('');
    setIsAddModalOpen(true);
  };

  // Live calculation for Add Form
  const formCalculations = useMemo(() => {
    const gross = parseFloat(grossWeight) || 0;
    const net = parseFloat(netWeight) || gross;
    const rate = parseFloat(goldRate) || 0;
    const making = parseFloat(makingCharges) || 0;
    const stoneVal = parseFloat(stoneValue) || 0;
    const wastage = parseFloat(wastagePercent) || 0;

    const metalVal = net * (1 + wastage / 100) * rate;
    const taxable = metalVal + making + stoneVal;
    const totalGst = (taxable * 3) / 100;
    const cgst = totalGst / 2;
    const sgst = totalGst / 2;
    const grandTotal = Math.round(taxable + totalGst);

    return { gross, net, metalVal, taxable, cgst, sgst, totalGst, grandTotal };
  }, [grossWeight, netWeight, goldRate, makingCharges, stoneValue, wastagePercent]);

  // Handle Create Invoice
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || formCalculations.gross <= 0) {
      showToast('error', 'Please enter customer name and valid weights.');
      return;
    }

    try {
      setSaving(true);
      const randomIrn = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

      const invoiceData = {
        invoice_number: invNumber.trim(),
        invoice_type: invType,
        customer_name: custName.trim(),
        customer_phone: custPhone.trim() || 'N/A',
        customer_email: custEmail.trim() || '',
        customer_gstin: custGstin.trim() || '',
        customer_pan: custPan.trim() || '',
        invoice_date: invDate,
        items_summary: itemsSummary.trim() || `${purity} ${category} (HUID: ${huid})`,
        ornament_category: category,
        purity,
        huid_code: huid.trim().toUpperCase(),
        gross_weight_g: formCalculations.gross,
        net_weight_g: formCalculations.net,
        gold_rate_per_g: parseFloat(goldRate) || 0,
        making_charges: parseFloat(makingCharges) || 0,
        wastage_percent: parseFloat(wastagePercent) || 0,
        stone_value: parseFloat(stoneValue) || 0,
        taxable_value: Math.round(formCalculations.taxable * 100) / 100,
        cgst_amount: Math.round(formCalculations.cgst * 100) / 100,
        sgst_amount: Math.round(formCalculations.sgst * 100) / 100,
        total_invoice_val: formCalculations.grandTotal,
        payment_method: paymentMethod,
        irn_hash: randomIrn,
        eway_bill_no: ewayBill.trim() || (formCalculations.grandTotal > 200000 ? `EWB-${Math.floor(100000000000 + Math.random() * 900000000000)}` : ''),
        status: 'PAID' as const,
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'sales_invoices'), invoiceData);
      const newInvoice: SalesInvoice = { id: docRef.id, ...invoiceData };
      setInvoices((prev) => [newInvoice, ...prev]);
      setIsAddModalOpen(false);
      showToast('success', `Invoice ${newInvoice.invoice_number} created successfully.`);
    } catch (err: unknown) {
      console.error('Error saving invoice:', err);
      showToast('error', 'Failed to save invoice to Firestore.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'PAID' | 'PARTIAL' | 'CANCELLED') => {
    try {
      await updateDoc(doc(db, 'sales_invoices', id), { status: newStatus });
      setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status: newStatus } : inv)));
      showToast('success', `Invoice status updated to ${newStatus}`);
    } catch (err: unknown) {
      console.error('Error updating status:', err);
      showToast('error', 'Failed to update invoice status.');
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteDoc(doc(db, 'sales_invoices', id));
      setInvoices((prev) => prev.filter((i) => i.id !== id));
      setDeleteConfirmId(null);
      showToast('success', 'Invoice record deleted.');
    } catch (err: unknown) {
      console.error('Error deleting invoice:', err);
      showToast('error', 'Failed to delete invoice.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      inv.invoice_number?.toLowerCase().includes(q) ||
      inv.customer_name?.toLowerCase().includes(q) ||
      inv.customer_gstin?.toLowerCase().includes(q) ||
      inv.huid_code?.toLowerCase().includes(q);
    const matchesType = selectedType === 'ALL' || inv.invoice_type === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || inv.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalRevenue = invoices.reduce((acc, curr) => acc + (curr.total_invoice_val || 0), 0);
  const totalTaxCollected = invoices.reduce((acc, curr) => acc + (curr.cgst_amount || 0) + (curr.sgst_amount || 0), 0);
  const totalGoldWeight = invoices.reduce((acc, curr) => acc + (curr.net_weight_g || 0), 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="sales_invoices" />
      <ActionToolbar
        filterPlaceholder="Filter by invoice #, customer name, GSTIN, HUID..."
        insertLabel="New Tax Invoice"
        onRefresh={fetchInvoices}
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
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Invoices</span>
                <FileText className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{invoices.length}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Live GST registered tax bills</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Invoice Revenue</span>
                <BadgeIndianRupee className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Cumulative billing gross</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Net Gold Sold</span>
                <Scale className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                {totalGoldWeight.toFixed(3)} <span className="text-xs text-neutral-500 font-normal">g</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Hallmarked pure gold</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">GST Collected (3%)</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700">
                ₹{totalTaxCollected.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">CGST 1.5% + SGST 1.5%</div>
            </div>
          </div>

          {/* Filters & Direct Links Bar */}
          <div className="bg-white p-3 rounded-lg border border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search invoice #, customer name, GSTIN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-[#e2e8f0] rounded-md text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-500 font-medium">Type:</span>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                  className="px-2 py-1 border border-[#e2e8f0] rounded text-neutral-700 text-xs focus:outline-none"
                >
                  <option value="ALL">All Types</option>
                  <option value="B2C_RETAIL">B2C Retail</option>
                  <option value="B2B_WHOLESALE">B2B Wholesale</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-neutral-500 font-medium">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="px-2 py-1 border border-[#e2e8f0] rounded text-neutral-700 text-xs focus:outline-none"
                >
                  <option value="ALL">All Status</option>
                  <option value="PAID">Paid</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <Link
                href="/sales/billing-pos"
                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded font-medium text-[11px] flex items-center gap-1 transition-colors"
              >
                <Receipt className="w-3 h-3" />
                <span>POS Counter</span>
              </Link>
            </div>
          </div>

          {/* Table / Empty State */}
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center bg-white rounded-lg border border-[#e2e8f0]">
              <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mb-2" />
              <span className="text-xs text-neutral-500 font-medium">Loading sales invoices from Firestore...</span>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center bg-white rounded-lg border border-[#e2e8f0] text-center">
              <FileText className="w-10 h-10 text-neutral-300 mb-3 stroke-1" />
              <h3 className="text-sm font-medium text-neutral-800 mb-1">No Sales Invoices Found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mb-4">
                {searchQuery
                  ? 'No tax invoices match your search query.'
                  : 'No tax invoices created in the system yet. Generate your first official GST invoice.'}
              </p>
              <button
                onClick={handleOpenAddModal}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Tax Invoice</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-[#e2e8f0] text-neutral-600 font-medium text-[11px]">
                      <th className="py-2.5 px-3">Invoice Details</th>
                      <th className="py-2.5 px-3">Customer / Buyer</th>
                      <th className="py-2.5 px-3">Items Summary</th>
                      <th className="py-2.5 px-2 text-right">Net Wt</th>
                      <th className="py-2.5 px-3 text-right">Taxable</th>
                      <th className="py-2.5 px-3 text-right">GST (3%)</th>
                      <th className="py-2.5 px-3 text-right">Total Invoice</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-medium text-neutral-800">
                          <div className="flex items-center gap-1.5">
                            <span>{inv.invoice_number}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-sans uppercase font-medium ${
                                inv.invoice_type === 'B2B_WHOLESALE'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-neutral-100 text-neutral-600'
                              }`}
                            >
                              {inv.invoice_type === 'B2B_WHOLESALE' ? 'B2B' : 'B2C'}
                            </span>
                          </div>
                          <div className="text-[10px] text-neutral-400 font-sans mt-0.5">{inv.invoice_date}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-neutral-800">{inv.customer_name}</div>
                          {inv.customer_gstin ? (
                            <div className="text-[10px] font-mono text-neutral-500">
                              GSTIN: {inv.customer_gstin}
                            </div>
                          ) : (
                            <div className="text-[10px] text-neutral-400 font-mono">{inv.customer_phone}</div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 max-w-xs">
                          <div className="truncate text-neutral-700" title={inv.items_summary}>
                            {inv.items_summary || 'Gold Jewellery items'}
                          </div>
                          {inv.huid_code && (
                            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1 rounded">
                              HUID: {inv.huid_code}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-neutral-700">
                          {inv.net_weight_g?.toFixed(3)}g
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-neutral-700">
                          ₹{inv.taxable_value?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-neutral-500">
                          ₹{((inv.cgst_amount || 0) + (inv.sgst_amount || 0)).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-700">
                          ₹{inv.total_invoice_val?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium font-mono ${
                              inv.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inv.status === 'PARTIAL'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setIsViewModalOpen(true);
                              }}
                              className="p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-neutral-100 transition-colors"
                              title="View Official Tax Invoice"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateStatus(
                                  inv.id,
                                  inv.status === 'PAID' ? 'PARTIAL' : 'PAID'
                                )
                              }
                              className="p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-neutral-100 transition-colors"
                              title="Toggle Status"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(inv.id)}
                              className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete Invoice"
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

      {/* CREATE NEW TAX INVOICE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-5 border border-[#e2e8f0] animate-fadeIn text-xs max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-neutral-800 text-sm">Create Official GST Tax Invoice</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              {/* Type, Invoice No, Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Invoice Type</label>
                  <select
                    value={invType}
                    onChange={(e) => setInvType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="B2C_RETAIL">B2C Retail Customer</option>
                    <option value="B2B_WHOLESALE">B2B Wholesale / Inter-state</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Invoice Number *</label>
                  <input
                    type="text"
                    required
                    value={invNumber}
                    onChange={(e) => setInvNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Invoice Date</label>
                  <input
                    type="date"
                    required
                    value={invDate}
                    onChange={(e) => setInvDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Customer Info */}
              <div className="p-3 bg-neutral-50 rounded-lg border border-[#e2e8f0] space-y-2.5">
                <span className="font-medium text-neutral-700 block text-[11px] uppercase tracking-wider">
                  Customer & Buyer Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Customer / Entity Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mahalakshmi Jewellers Ltd"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] bg-white rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+91 98480 12345"
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] bg-white rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">GSTIN (Optional for B2B)</label>
                    <input
                      type="text"
                      placeholder="36AAACB1234F1Z0"
                      value={custGstin}
                      onChange={(e) => setCustGstin(e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] bg-white rounded font-mono uppercase text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">PAN Number</label>
                    <input
                      type="text"
                      placeholder="ABCDE1234F"
                      value={custPan}
                      onChange={(e) => setCustPan(e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] bg-white rounded font-mono uppercase text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Jewellery Item Information */}
              <div className="space-y-3">
                <span className="font-medium text-neutral-700 block text-[11px] uppercase tracking-wider">
                  Jewellery Spec & Weight Breakdown
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Necklace">Necklace</option>
                      <option value="Bangles">Bangles</option>
                      <option value="Earrings">Earrings</option>
                      <option value="Rings">Rings</option>
                      <option value="Chains">Chains</option>
                      <option value="Bridal Set">Bridal Set</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Purity Karat</label>
                    <select
                      value={purity}
                      onChange={(e) => setPurity(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="22K (916)">22K (916)</option>
                      <option value="24K (999)">24K (999)</option>
                      <option value="18K (750)">18K (750)</option>
                      <option value="14K (585)">14K (585)</option>
                      <option value="Silver 999">Silver 999</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Hallmark HUID</label>
                    <input
                      type="text"
                      placeholder="HD9128"
                      value={huid}
                      onChange={(e) => setHuid(e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono uppercase text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Items Description / Title</label>
                  <input
                    type="text"
                    placeholder="e.g. 22K Calcutta Bangles (2 pairs), Temple Choker Set"
                    value={itemsSummary}
                    onChange={(e) => setItemsSummary(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
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
                      onChange={(e) => {
                        setGrossWeight(e.target.value);
                        if (!netWeight) setNetWeight(e.target.value);
                      }}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Net Gold Wt (g) *</label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      placeholder="0.000"
                      value={netWeight}
                      onChange={(e) => setNetWeight(e.target.value)}
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
                    <label className="block text-neutral-600 font-medium mb-1">Stone Value (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={stoneValue}
                      onChange={(e) => setStoneValue(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="UPI">UPI / QR Code</option>
                      <option value="Bank Transfer">Bank Transfer / NEFT</option>
                      <option value="Credit Card">Credit / Debit Card</option>
                      <option value="Cash">Cash</option>
                      <option value="Split Payment">Split (UPI + Cash)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Financial Calculation Box */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1.5">
                <div className="flex justify-between text-emerald-800">
                  <span>Taxable Value:</span>
                  <span className="font-mono font-medium">₹{formCalculations.taxable.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-700 text-[11px]">
                  <span>CGST (1.5%) + SGST (1.5%):</span>
                  <span className="font-mono">₹{formCalculations.totalGst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-900 font-medium text-sm pt-1 border-t border-emerald-300">
                  <span>Grand Total Net Payable:</span>
                  <span className="font-mono">₹{formCalculations.grandTotal.toLocaleString('en-IN')}</span>
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
                  <span>{saving ? 'Creating...' : 'Create & Save Tax Invoice'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW / PRINT TAX INVOICE MODAL */}
      {isViewModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-xl w-full p-6 border border-[#e2e8f0] animate-fadeIn text-xs max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] mb-4">
              <div>
                <h2 className="text-base font-medium text-neutral-800">TAX INVOICE - JEWELLERY NEXT</h2>
                <p className="text-[11px] text-neutral-500">HSN Code 7113 • BIS Hallmarked Jewellery</p>
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
                <span className="text-neutral-400 block font-medium">Invoice Number:</span>
                <span className="font-mono font-medium text-neutral-800">{selectedInvoice.invoice_number}</span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">
                  Type: {selectedInvoice.invoice_type}
                </span>
              </div>
              <div className="text-right">
                <span className="text-neutral-400 block font-medium">Invoice Date:</span>
                <span className="font-mono text-neutral-700">{selectedInvoice.invoice_date}</span>
              </div>
              <div>
                <span className="text-neutral-400 block font-medium">Customer / Buyer:</span>
                <span className="font-medium text-neutral-800">{selectedInvoice.customer_name}</span>
                <div className="text-neutral-500 font-mono">{selectedInvoice.customer_phone}</div>
                {selectedInvoice.customer_gstin && (
                  <div className="text-neutral-600 font-mono text-[10px]">GSTIN: {selectedInvoice.customer_gstin}</div>
                )}
              </div>
              <div className="text-right">
                <span className="text-neutral-400 block font-medium">Payment Method:</span>
                <span className="font-medium text-neutral-800">{selectedInvoice.payment_method}</span>
                <div className="mt-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800">
                    STATUS: {selectedInvoice.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Item Table */}
            <div className="py-3 border-b border-[#e2e8f0]">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-[#e2e8f0] text-neutral-500 font-medium">
                    <th className="py-1">Description</th>
                    <th className="py-1 text-right">Gross</th>
                    <th className="py-1 text-right">Net</th>
                    <th className="py-1 text-right">Rate</th>
                    <th className="py-1 text-right">Taxable</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2">
                      <div className="font-medium text-neutral-800">{selectedInvoice.items_summary}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        {selectedInvoice.purity} • HUID: {selectedInvoice.huid_code}
                      </div>
                    </td>
                    <td className="py-2 text-right font-mono">{selectedInvoice.gross_weight_g?.toFixed(3)}g</td>
                    <td className="py-2 text-right font-mono">{selectedInvoice.net_weight_g?.toFixed(3)}g</td>
                    <td className="py-2 text-right font-mono">₹{selectedInvoice.gold_rate_per_g}/g</td>
                    <td className="py-2 text-right font-mono font-medium">
                      ₹{selectedInvoice.taxable_value?.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* GST & Totals */}
            <div className="py-3 border-b border-[#e2e8f0] space-y-1 text-[11px]">
              <div className="flex justify-between text-neutral-600">
                <span>Taxable Amount</span>
                <span className="font-mono">₹{selectedInvoice.taxable_value?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>CGST (1.5%)</span>
                <span className="font-mono">₹{selectedInvoice.cgst_amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>SGST (1.5%)</span>
                <span className="font-mono">₹{selectedInvoice.sgst_amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-neutral-800 pt-1 border-t border-[#e2e8f0] text-xs">
                <span>Grand Total (Net Payable)</span>
                <span className="font-mono text-emerald-700">
                  ₹{selectedInvoice.total_invoice_val?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* IRN & Eway Bill if present */}
            {selectedInvoice.irn_hash && (
              <div className="py-2 border-b border-[#e2e8f0] text-[10px]">
                <div className="flex items-center justify-between text-neutral-500 mb-0.5">
                  <span className="font-medium">e-Invoice IRN Hash:</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedInvoice.irn_hash, 'irn')}
                    className="text-emerald-600 hover:underline flex items-center gap-0.5"
                  >
                    {copiedId === 'irn' ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                    <span>{copiedId === 'irn' ? 'Copied' : 'Copy IRN'}</span>
                  </button>
                </div>
                <div className="font-mono text-neutral-700 break-all bg-neutral-50 p-1.5 rounded border border-[#e2e8f0]">
                  {selectedInvoice.irn_hash}
                </div>
              </div>
            )}

            <div className="pt-4 flex items-center justify-between">
              <span className="text-[10px] text-neutral-400">
                Certified Original Tax Invoice • jewellery-next
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
                  <span>Print Tax Invoice</span>
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
            <h3 className="font-medium text-neutral-800 text-sm mb-2">Delete Sales Invoice?</h3>
            <p className="text-neutral-500 mb-4">
              Are you sure you want to delete this invoice? The record will be permanently removed from Firestore.
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
                onClick={() => handleDeleteInvoice(deleteConfirmId)}
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
