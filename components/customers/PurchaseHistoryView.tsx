'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  FileText,
  Receipt,
  Scale,
  Award,
  Coins,
  Search,
  Filter,
  Eye,
  Printer,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  X,
  Plus,
  QrCode,
  Download,
  Share2,
  ArrowUpDown,
  Check,
  Copy,
  Loader2,
  AlertCircle,
  ShoppingBag,
  Gem,
  BookOpen,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';

export interface PurchaseInvoiceRecord {
  id: string;
  invoice_no: string;
  date: string;
  customer_name: string;
  customer_phone: string;
  transaction_type: 'TAX_INVOICE' | 'EXCHANGE_BILL' | 'REPAIR_JOB' | 'SCHEME_REDEMPTION';
  items_summary: string;
  huid: string;
  gross_weight_g: number;
  net_weight_g: number;
  making_charges: number;
  gst_amount: number;
  total_paid: number;
  payment_mode: string;
  guarantee_card_reissued: boolean;
  status: 'PAID' | 'PARTIAL' | 'REFUNDED';
  created_at?: string;
}

const SAMPLE_PURCHASES: Omit<PurchaseInvoiceRecord, 'id'>[] = [
  {
    invoice_no: 'POS-2026-0812',
    date: '2026-08-15',
    customer_name: 'Sridevi Rao',
    customer_phone: '+91 98451 23456',
    transaction_type: 'TAX_INVOICE',
    items_summary: '22K Temple Antique Haar (48.200g, Uncut Zambian Emeralds)',
    huid: 'HD99281A',
    gross_weight_g: 48.2,
    net_weight_g: 45.1,
    making_charges: 38560.0,
    gst_amount: 10350.0,
    total_paid: 345000.0,
    payment_mode: 'UPI + Credit Card',
    guarantee_card_reissued: true,
    status: 'PAID',
    created_at: new Date().toISOString(),
  },
  {
    invoice_no: 'POS-2026-0801',
    date: '2026-08-10',
    customer_name: 'Venkat Raman',
    customer_phone: '+91 97412 89012',
    transaction_type: 'EXCHANGE_BILL',
    items_summary: '24K MMTC-PAMP Lotus Gold Bar (20.000g) [Old 22K Melted Exchanged]',
    huid: 'BULLION-009',
    gross_weight_g: 20.0,
    net_weight_g: 20.0,
    making_charges: 2400.0,
    gst_amount: 4854.0,
    total_paid: 161800.0,
    payment_mode: 'Old Gold Exchange + Cash',
    guarantee_card_reissued: false,
    status: 'PAID',
    created_at: new Date().toISOString(),
  },
  {
    invoice_no: 'POS-2026-0742',
    date: '2026-07-28',
    customer_name: 'Meera Nambiar',
    customer_phone: '+91 94471 67890',
    transaction_type: 'TAX_INVOICE',
    items_summary: '22K Kerala Palakka Traditional Choker (32.400g)',
    huid: 'PK77182C',
    gross_weight_g: 32.4,
    net_weight_g: 29.8,
    making_charges: 28400.0,
    gst_amount: 7620.0,
    total_paid: 254000.0,
    payment_mode: 'Net Banking (RTGS)',
    guarantee_card_reissued: false,
    status: 'PAID',
    created_at: new Date().toISOString(),
  },
  {
    invoice_no: 'POS-2026-0690',
    date: '2026-07-14',
    customer_name: 'Dr. Mohan Krishna',
    customer_phone: '+91 94401 55667',
    transaction_type: 'TAX_INVOICE',
    items_summary: '22K Men Navaratna Kada & Ring Set (52.600g)',
    huid: 'NV44190D',
    gross_weight_g: 52.6,
    net_weight_g: 48.0,
    making_charges: 42080.0,
    gst_amount: 12480.0,
    total_paid: 416000.0,
    payment_mode: 'Cheque Clearance',
    guarantee_card_reissued: false,
    status: 'PAID',
    created_at: new Date().toISOString(),
  },
];

export function CustomersPurchaseHistoryView() {
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [invoices, setInvoices] = useState<PurchaseInvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Modals
  const [selectedInvoiceForPDF, setSelectedInvoiceForPDF] = useState<PurchaseInvoiceRecord | null>(null);
  const [selectedInvoiceForGuarantee, setSelectedInvoiceForGuarantee] = useState<PurchaseInvoiceRecord | null>(null);
  const [isManualBillOpen, setIsManualBillOpen] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Manual bill form
  const [formCustName, setFormCustName] = useState('');
  const [formCustPhone, setFormCustPhone] = useState('');
  const [formBillNo, setFormBillNo] = useState('');
  const [formTxType, setFormTxType] = useState<PurchaseInvoiceRecord['transaction_type']>('TAX_INVOICE');
  const [formItemDesc, setFormItemDesc] = useState('');
  const [formHuid, setFormHuid] = useState('');
  const [formGrossWt, setFormGrossWt] = useState('24.500');
  const [formNetWt, setFormNetWt] = useState('23.800');
  const [formMaking, setFormMaking] = useState('18000');
  const [formTotal, setFormTotal] = useState('195000');
  const [formPaymentMode, setFormPaymentMode] = useState('UPI / Cash');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'customers_purchase_history'));
      const list: PurchaseInvoiceRecord[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<PurchaseInvoiceRecord, 'id'>) });
      });
      setInvoices(list);
    } catch (err: any) {
      console.error('Error fetching purchase invoices:', err);
      showToast('error', err.message || 'Failed to fetch purchase history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleSeedSamples = async () => {
    try {
      setSaving(true);
      const added: PurchaseInvoiceRecord[] = [];
      for (const item of SAMPLE_PURCHASES) {
        const docRef = await addDoc(collection(db, 'customers_purchase_history'), item);
        added.push({ id: docRef.id, ...item });
      }
      setInvoices((prev) => [...added, ...prev]);
      showToast('success', `${added.length} sample invoices inserted into Firestore.`);
    } catch (err: any) {
      console.error('Error seeding invoices:', err);
      showToast('error', err.message || 'Failed to seed sample invoices');
    } finally {
      setSaving(false);
    }
  };

  // Dynamic calculations for manual invoice form
  const totalNum = parseFloat(formTotal) || 0;
  const calculatedGst = Math.round(totalNum * 0.03); // 3% GST on Gold in India
  const taxableSubtotal = Math.max(0, totalNum - calculatedGst);

  const handleCreateManualBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustName.trim() || !formCustPhone.trim()) return;

    try {
      setSaving(true);
      const randNo = Math.floor(100 + Math.random() * 900);
      const billCode = formBillNo.trim() || `POS-2026-0${randNo}`;
      const huidCode = formHuid.trim() || `BIS-${Math.floor(100000 + Math.random() * 900000)}`;

      const newBill: Omit<PurchaseInvoiceRecord, 'id'> = {
        invoice_no: billCode,
        date: new Date().toISOString().split('T')[0],
        customer_name: formCustName.trim(),
        customer_phone: formCustPhone.trim(),
        transaction_type: formTxType,
        items_summary: formItemDesc.trim() || '22K Gold Handcrafted Ornament',
        huid: huidCode,
        gross_weight_g: parseFloat(formGrossWt) || 10,
        net_weight_g: parseFloat(formNetWt) || 9.5,
        making_charges: parseFloat(formMaking) || 5000,
        gst_amount: calculatedGst,
        total_paid: totalNum,
        payment_mode: formPaymentMode,
        guarantee_card_reissued: false,
        status: 'PAID',
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'customers_purchase_history'), newBill);
      setInvoices((prev) => [{ id: docRef.id, ...newBill }, ...prev]);
      setIsManualBillOpen(false);
      showToast('success', `Invoice ${billCode} saved with 3% GST (₹${calculatedGst}).`);

      // Reset
      setFormCustName('');
      setFormCustPhone('');
      setFormBillNo('');
      setFormItemDesc('');
      setFormHuid('');
    } catch (err: any) {
      console.error('Error saving invoice:', err);
      showToast('error', err.message || 'Failed to save invoice');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleGuaranteeCard = async (inv: PurchaseInvoiceRecord) => {
    try {
      await updateDoc(doc(db, 'customers_purchase_history', inv.id), {
        guarantee_card_reissued: true,
      });
      setInvoices((prev) =>
        prev.map((i) => (i.id === inv.id ? { ...i, guarantee_card_reissued: true } : i))
      );
      if (selectedInvoiceForGuarantee?.id === inv.id) {
        setSelectedInvoiceForGuarantee((prev) => (prev ? { ...prev, guarantee_card_reissued: true } : null));
      }
      showToast('success', `Digital Guarantee Certificate issued for ${inv.invoice_no}.`);
    } catch (err: any) {
      console.error('Error updating guarantee status:', err);
      showToast('error', err.message || 'Failed to update guarantee card');
    }
  };

  const handleDeleteInvoice = async (id: string, invoiceNo: string) => {
    if (!confirm(`Delete invoice record "${invoiceNo}"?`)) return;
    try {
      await deleteDoc(doc(db, 'customers_purchase_history', id));
      setInvoices((prev) => prev.filter((i) => i.id !== id));
      if (selectedInvoiceForPDF?.id === id) setSelectedInvoiceForPDF(null);
      if (selectedInvoiceForGuarantee?.id === id) setSelectedInvoiceForGuarantee(null);
      showToast('success', `Invoice "${invoiceNo}" deleted.`);
    } catch (err: any) {
      console.error('Error deleting invoice:', err);
      showToast('error', err.message || 'Failed to delete invoice');
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (typeFilter !== 'ALL' && inv.transaction_type !== typeFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const mInv = inv.invoice_no?.toLowerCase().includes(q);
        const mName = inv.customer_name?.toLowerCase().includes(q);
        const mItem = inv.items_summary?.toLowerCase().includes(q);
        const mHuid = inv.huid?.toLowerCase().includes(q);
        if (!mInv && !mName && !mItem && !mHuid) return false;
      }
      return true;
    });
  }, [invoices, typeFilter, searchQuery]);

  // Derived KPI metrics
  const totalBilled = invoices.reduce((sum, i) => sum + (i.total_paid || 0), 0);
  const totalGoldGrams = invoices.reduce((sum, i) => sum + (i.net_weight_g || 0), 0);
  const totalGstCollected = invoices.reduce((sum, i) => sum + (i.gst_amount || 0), 0);
  const hallmarkedCount = invoices.filter((i) => i.huid && i.huid !== 'REPAIR-NA').length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="customers_purchase_history" />
      <ActionToolbar
        filterPlaceholder="Search invoices by invoice #, customer, HUID, or item..."
        insertLabel="Record Purchase Bill"
        onInsertClick={() => setIsManualBillOpen(true)}
        onRefresh={fetchInvoices}
      />

      {/* Customer Module Interlinks Bar */}
      <div className="h-10 bg-[#f8fafc] border-b border-[#e2e8f0] px-3 sm:px-4 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar text-xs">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-medium uppercase text-neutral-400 mr-1">Modules:</span>
          <Link
            href="/customers/list"
            className="px-2.5 py-1 rounded-md text-xs font-medium text-neutral-600 hover:text-emerald-700 hover:bg-neutral-100 transition-colors"
          >
            Directory
          </Link>
          <Link
            href="/customers/schemes"
            className="px-2.5 py-1 rounded-md text-xs font-medium text-neutral-600 hover:text-emerald-700 hover:bg-neutral-100 transition-colors"
          >
            Gold Schemes
          </Link>
          <Link
            href="/customers/advance-deposits"
            className="px-2.5 py-1 rounded-md text-xs font-medium text-neutral-600 hover:text-emerald-700 hover:bg-neutral-100 transition-colors"
          >
            Advance Deposits
          </Link>
          <Link
            href="/customers/outstanding-balances"
            className="px-2.5 py-1 rounded-md text-xs font-medium text-neutral-600 hover:text-emerald-700 hover:bg-neutral-100 transition-colors"
          >
            Outstanding Dues
          </Link>
          <Link
            href="/customers/purchase-history"
            className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs"
          >
            Invoices & History
          </Link>
          <Link
            href="/customers/loyalty-rewards"
            className="px-2.5 py-1 rounded-md text-xs font-medium text-neutral-600 hover:text-emerald-700 hover:bg-neutral-100 transition-colors"
          >
            Loyalty Rewards
          </Link>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/sales/billing-pos"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-emerald-700 hover:underline"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" /> Start POS Billing
          </Link>
          <span className="text-neutral-300">•</span>
          <Link
            href="/orders-services/custom-orders"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-emerald-700 hover:underline"
          >
            <Gem className="w-3.5 h-3.5 text-emerald-600" /> Custom Orders
          </Link>
          <span className="text-neutral-300">•</span>
          <Link
            href="/finance/receivables"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-emerald-700 hover:underline"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" /> Receivables
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* Toast Feedback */}
        {toastType === 'success' && (
          <div className="mx-4 mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center justify-between animate-fadeIn shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastType('idle')} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {toastType === 'error' && (
          <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-medium flex items-center justify-between animate-fadeIn shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastType('idle')} className="text-red-600 hover:text-red-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* KPI Metrics Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Sales Invoiced</span>
                <Receipt className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-neutral-400" /> : `₹ ${totalBilled.toLocaleString('en-IN')}`}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                {invoices.length} historical invoices in Firestore
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Pure Metal Delivered</span>
                <Scale className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-amber-700 font-mono">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-neutral-400" /> : `${totalGoldGrams.toFixed(3)} g`}
              </div>
              <div className="text-[11px] text-amber-600 mt-1 font-mono">Net fine gold weight</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-blue-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">GST Collected (3%)</span>
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-neutral-400" /> : `₹ ${totalGstCollected.toLocaleString('en-IN')}`}
              </div>
              <div className="text-[11px] text-blue-600 mt-1 font-mono">GSTR-1 compliant tax invoices</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-purple-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">BIS Hallmarked HUID</span>
                <Award className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-xl font-medium text-purple-800 font-mono">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-neutral-400" /> : `${hallmarkedCount} Items`}
              </div>
              <div className="text-[11px] text-purple-600 mt-1 font-mono">100% BIS 6-digit laser verified</div>
            </div>
          </div>

          {/* Quick Filter Bar */}
          <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by invoice #, customer, HUID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-white border border-[#e2e8f0] rounded-md text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-emerald-500 w-64"
                />
              </div>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Type:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Invoice Types</option>
                  <option value="TAX_INVOICE">Tax Invoices (Retail)</option>
                  <option value="EXCHANGE_BILL">Exchange Bills</option>
                  <option value="SCHEME_REDEMPTION">Scheme Redemptions</option>
                  <option value="REPAIR_JOB">Repairs & Polishing</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchInvoices}
                className="p-1.5 rounded-md border border-[#e2e8f0] bg-white text-neutral-600 hover:text-emerald-700 hover:bg-neutral-50 transition-colors"
                title="Refresh from Firestore"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsManualBillOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Record Invoice
              </button>
            </div>
          </div>
        </div>

        {/* Supabase-style Table */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="border border-[#e2e8f0] rounded-lg bg-white overflow-hidden shadow-2xs flex flex-col flex-1">
            <div className="h-10 bg-[#f8fafc] border-b border-[#e2e8f0] px-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('data')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    activeTab === 'data'
                      ? 'bg-white text-neutral-900 shadow-2xs border border-[#e2e8f0]'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Invoices ({filteredInvoices.length})
                </button>
                <button
                  onClick={() => setActiveTab('definition')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    activeTab === 'definition'
                      ? 'bg-white text-neutral-900 shadow-2xs border border-[#e2e8f0]'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Definition (DDL)
                </button>
              </div>
              <div className="text-[11px] text-neutral-400 font-mono">
                firestore: customers_purchase_history • 14 fields
              </div>
            </div>

            {/* Table Content: Data Tab */}
            {activeTab === 'data' && (
              <div className="overflow-x-auto flex-1">
                {loading ? (
                  <div className="flex flex-col items-center justify-center p-12 text-neutral-400">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
                    <span className="text-xs font-medium text-neutral-600">Connecting to Invoices History...</span>
                  </div>
                ) : filteredInvoices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-medium text-neutral-900 mb-1">No Purchase Records Found</h4>
                    <p className="text-xs text-neutral-500 max-w-sm mb-4">
                      {invoices.length === 0
                        ? 'No invoices found in Firestore. Create a new purchase invoice or insert sample records.'
                        : 'No invoices match the filter criteria.'}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsManualBillOpen(true)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Record Invoice
                      </button>
                      {invoices.length === 0 && (
                        <button
                          onClick={handleSeedSamples}
                          disabled={saving}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-300 transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          Insert Sample Records
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-neutral-600 font-mono text-[11px]">
                        <th className="w-10 px-3 py-2 border-r border-[#e5e7eb] text-center">
                          <input type="checkbox" className="rounded border-neutral-300 text-emerald-600 focus:ring-0" />
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">invoice_no</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">customer_name</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">items_summary</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">huid</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">net_wt</span>
                          <span className="text-neutral-400 font-normal text-[10px] ml-1">g</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">total_paid</span>
                          <span className="text-neutral-400 font-normal text-[10px] ml-1">inr</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                          <span className="text-neutral-800">guarantee_card</span>
                        </th>
                        <th className="px-3.5 py-2 font-medium whitespace-nowrap text-center">
                          <span className="text-neutral-800">actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {filteredInvoices.map((row) => (
                        <tr key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                          <td className="px-3 py-2 text-center border-r border-[#e5e7eb]">
                            <input type="checkbox" className="rounded border-neutral-300 text-emerald-600 focus:ring-0" />
                          </td>
                          <td className="px-3.5 py-2 font-mono text-emerald-700 font-medium border-r border-[#e5e7eb] whitespace-nowrap">
                            {row.invoice_no}
                            <span className="text-[10px] text-neutral-400 block font-normal">{row.date}</span>
                          </td>
                          <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                            <div className="font-medium text-neutral-900">{row.customer_name}</div>
                            <span className="text-[10px] text-neutral-400 font-mono block">{row.customer_phone}</span>
                          </td>
                          <td className="px-3.5 py-2 border-r border-[#e5e7eb] text-neutral-800 max-w-xs truncate">
                            {row.items_summary}
                          </td>
                          <td className="px-3.5 py-2 font-mono border-r border-[#e5e7eb] whitespace-nowrap">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-50 text-purple-700 border border-purple-200">
                              {row.huid}
                            </span>
                          </td>
                          <td className="px-3.5 py-2 font-mono text-right text-amber-700 font-medium border-r border-[#e5e7eb] whitespace-nowrap">
                            {(row.net_weight_g || 0).toFixed(3)} g
                          </td>
                          <td className="px-3.5 py-2 font-mono text-right font-medium text-neutral-900 border-r border-[#e5e7eb] whitespace-nowrap">
                            ₹ {(row.total_paid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-3.5 py-2 text-center border-r border-[#e5e7eb] whitespace-nowrap">
                            {row.guarantee_card_reissued ? (
                              <button
                                onClick={() => setSelectedInvoiceForGuarantee(row)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                              >
                                <Award className="w-3 h-3 text-emerald-600" /> Issued
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleGuaranteeCard(row)}
                                className="px-2 py-0.5 rounded text-[10px] font-medium text-neutral-500 hover:text-emerald-700 hover:bg-neutral-100 border border-neutral-200 transition-colors"
                              >
                                Issue Card
                              </button>
                            )}
                          </td>
                          <td className="px-3.5 py-2 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedInvoiceForPDF(row)}
                                className="p-1 hover:bg-neutral-100 rounded text-neutral-600 hover:text-emerald-700 transition-colors"
                                title="View Tax Invoice"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setSelectedInvoiceForGuarantee(row)}
                                className="p-1 hover:bg-neutral-100 rounded text-neutral-600 hover:text-purple-700 transition-colors"
                                title="Guarantee Certificate"
                              >
                                <Award className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteInvoice(row.id, row.invoice_no)}
                                className="p-1 hover:bg-red-50 rounded text-neutral-400 hover:text-red-600 transition-colors"
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
                )}
              </div>
            )}

            {/* Table Content: Definition Tab */}
            {activeTab === 'definition' && (
              <div className="p-4 overflow-x-auto font-mono text-xs text-neutral-800 bg-[#fbfbfb] w-full">
                <div className="bg-neutral-900 text-neutral-100 p-4 rounded-md overflow-x-auto shadow-inner text-[12px] leading-relaxed w-full">
                  <span className="text-emerald-400">// Firestore Collection Schema</span>
                  <br />
                  collection: <span className="text-amber-400">&quot;customers_purchase_history&quot;</span>
                  <br />
                  document: &#123;
                  <br />
                  &nbsp;&nbsp;id: <span className="text-blue-300">auto-generated-id</span>,
                  <br />
                  &nbsp;&nbsp;invoice_no: <span className="text-blue-300">string</span> (POS-2026-xxx),
                  <br />
                  &nbsp;&nbsp;customer_name: <span className="text-blue-300">string</span>,
                  <br />
                  &nbsp;&nbsp;customer_phone: <span className="text-blue-300">string</span>,
                  <br />
                  &nbsp;&nbsp;transaction_type: <span className="text-emerald-300">&apos;TAX_INVOICE&apos; | &apos;EXCHANGE_BILL&apos; | &apos;REPAIR_JOB&apos; | &apos;SCHEME_REDEMPTION&apos;</span>,
                  <br />
                  &nbsp;&nbsp;items_summary: <span className="text-blue-300">string</span>,
                  <br />
                  &nbsp;&nbsp;huid: <span className="text-blue-300">string</span> (BIS Hallmark Unique ID),
                  <br />
                  &nbsp;&nbsp;gross_weight_g: <span className="text-blue-300">number</span>,
                  <br />
                  &nbsp;&nbsp;net_weight_g: <span className="text-blue-300">number</span>,
                  <br />
                  &nbsp;&nbsp;making_charges: <span className="text-blue-300">number</span>,
                  <br />
                  &nbsp;&nbsp;gst_amount: <span className="text-blue-300">number</span> (3%),
                  <br />
                  &nbsp;&nbsp;total_paid: <span className="text-blue-300">number</span>,
                  <br />
                  &nbsp;&nbsp;guarantee_card_reissued: <span className="text-blue-300">boolean</span>,
                  <br />
                  &nbsp;&nbsp;created_at: <span className="text-blue-300">ISO-timestamp</span>
                  <br />
                  &#125;
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual Bill Creation Drawer */}
      {isManualBillOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-[#e2e8f0] animate-in slide-in-from-right duration-200">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div>
                <h3 className="text-sm font-medium text-neutral-900">Record Jewellery Purchase Bill</h3>
                <p className="text-[11px] text-neutral-500">Record tax invoice with HUID hallmarking and weight details</p>
              </div>
              <button
                onClick={() => setIsManualBillOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManualBill} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-xs">
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Patron & Bill Details
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sridevi Rao"
                      value={formCustName}
                      onChange={(e) => setFormCustName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98451 23456"
                      value={formCustPhone}
                      onChange={(e) => setFormCustPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Invoice Number</label>
                    <input
                      type="text"
                      placeholder="e.g. POS-2026-0812"
                      value={formBillNo}
                      onChange={(e) => setFormBillNo(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Transaction Type</label>
                    <select
                      value={formTxType}
                      onChange={(e) => setFormTxType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                    >
                      <option value="TAX_INVOICE">Tax Invoice (Standard POS)</option>
                      <option value="EXCHANGE_BILL">Old Gold Exchange Bill</option>
                      <option value="SCHEME_REDEMPTION">Scheme Maturity Bill</option>
                      <option value="REPAIR_JOB">Repair & Service Receipt</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Ornament & Weight Details */}
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Ornament & Weight Breakdown
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Item Description *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 22K Temple Antique Haar with Uncut Zambian Emeralds"
                    value={formItemDesc}
                    onChange={(e) => setFormItemDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">HUID Hallmarking</label>
                    <input
                      type="text"
                      placeholder="HD99281A"
                      value={formHuid}
                      onChange={(e) => setFormHuid(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 text-xs font-mono uppercase border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Gross Wt (g)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={formGrossWt}
                      onChange={(e) => setFormGrossWt(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Net Gold Wt (g)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={formNetWt}
                      onChange={(e) => setFormNetWt(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Making Charges (₹)</label>
                    <input
                      type="number"
                      value={formMaking}
                      onChange={(e) => setFormMaking(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Total Bill Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formTotal}
                      onChange={(e) => setFormTotal(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white text-neutral-900"
                    />
                  </div>
                </div>

                {/* Dynamic Calculation preview */}
                <div className="p-3 bg-white rounded border border-[#e2e8f0] space-y-1 font-mono text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Taxable Value:</span>
                    <span className="text-neutral-900">₹ {taxableSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>GST (3% on Gold):</span>
                    <span className="font-medium text-emerald-700">+ ₹ {calculatedGst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-neutral-900 border-t border-[#e2e8f0] pt-1">
                    <span className="font-sans font-medium">Final Paid Total:</span>
                    <span className="font-medium text-neutral-900">₹ {totalNum.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualBillOpen(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Save Invoice in Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tax Invoice PDF Preview Modal */}
      {selectedInvoiceForPDF && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-lg shadow-2xl border border-[#e2e8f0] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">
                  Tax Invoice: {selectedInvoiceForPDF.invoice_no}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoiceForPDF(null)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-mono">
              <div className="border border-[#e2e8f0] rounded p-4 bg-[#fbfbfb] space-y-3">
                <div className="flex justify-between items-start border-b border-[#e2e8f0] pb-2">
                  <div>
                    <h4 className="font-sans font-medium text-neutral-900 text-sm">JEWELLERY NEXT SHOWROOM</h4>
                    <span className="text-[10px] text-neutral-500 block">GSTIN: 36AAACD9812K1Z8 • Road 10 Banjara Hills</span>
                    <span className="text-[10px] text-neutral-500 block">Date: {selectedInvoiceForPDF.date}</span>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      PAID IN FULL
                    </span>
                  </div>
                </div>

                <div className="text-neutral-700">
                  <span className="text-neutral-400 block">Billed To:</span>
                  <div className="font-medium text-neutral-900">{selectedInvoiceForPDF.customer_name}</div>
                  <div className="text-neutral-500">{selectedInvoiceForPDF.customer_phone}</div>
                </div>

                <div className="border-t border-b border-[#e2e8f0] py-2 space-y-1">
                  <div className="flex justify-between">
                    <span>{selectedInvoiceForPDF.items_summary}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500 text-[11px]">
                    <span>HUID: {selectedInvoiceForPDF.huid}</span>
                    <span>Net Wt: {(selectedInvoiceForPDF.net_weight_g || 0).toFixed(3)} g</span>
                  </div>
                  <div className="flex justify-between text-neutral-500 text-[11px]">
                    <span>Making Charges:</span>
                    <span>₹ {(selectedInvoiceForPDF.making_charges || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500 text-[11px]">
                    <span>GST (3%):</span>
                    <span>₹ {(selectedInvoiceForPDF.gst_amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex justify-between text-sm font-medium text-neutral-900 pt-1">
                  <span>Total Amount Paid:</span>
                  <span>₹ {(selectedInvoiceForPDF.total_paid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                <Link
                  href="/sales/billing-pos"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs font-sans"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" /> Open POS Billing
                </Link>
                <div className="flex items-center gap-2 font-sans">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Tax Invoice
                  </button>
                  <button
                    onClick={() => setSelectedInvoiceForPDF(null)}
                    className="px-4 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guarantee & Authenticity Certificate Modal */}
      {selectedInvoiceForGuarantee && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl border border-purple-200 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-purple-100 flex items-center justify-between bg-purple-50/50">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-medium text-neutral-900">
                  Hallmark Guarantee Certificate: {selectedInvoiceForGuarantee.huid}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoiceForGuarantee(null)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-purple-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-mono">
              <div className="border border-purple-200 rounded-lg p-5 bg-[#faf8fc] space-y-3 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mb-1">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="font-sans font-medium text-neutral-900 text-sm">
                  CERTIFICATE OF AUTHENTICITY & PURITY
                </h4>
                <p className="text-[11px] text-neutral-500 font-sans">
                  BIS Certified 916 Hallmarked Jewellery Guarantee
                </p>

                <div className="border-t border-b border-purple-200 py-3 text-left space-y-2 text-neutral-800 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-neutral-500 font-normal">Patron:</span>
                    <span className="font-medium text-neutral-900">{selectedInvoiceForGuarantee.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 font-normal">Item Description:</span>
                    <span className="font-medium text-neutral-900">{selectedInvoiceForGuarantee.items_summary}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 font-normal">BIS HUID Number:</span>
                    <span className="font-medium text-purple-700">{selectedInvoiceForGuarantee.huid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 font-normal">Verified Net Weight:</span>
                    <span className="font-medium text-amber-700">{(selectedInvoiceForGuarantee.net_weight_g || 0).toFixed(3)} g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 font-normal">Invoice Reference:</span>
                    <span className="font-medium text-neutral-900">{selectedInvoiceForGuarantee.invoice_no} ({selectedInvoiceForGuarantee.date})</span>
                  </div>
                </div>

                <p className="text-[10px] text-neutral-500 font-sans leading-relaxed">
                  We guarantee 100% lifetime buyback / exchange at current gold bullion rates with zero deduction on pure 22K 916 gold weight.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 font-sans">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Certificate
                </button>
                <button
                  onClick={() => setSelectedInvoiceForGuarantee(null)}
                  className="px-4 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
