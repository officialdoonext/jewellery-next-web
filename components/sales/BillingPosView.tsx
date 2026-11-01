'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import { SalesSubNav } from './SalesSubNav';
import {
  Receipt,
  Scale,
  Barcode,
  Plus,
  Trash2,
  Printer,
  PauseCircle,
  Coins,
  ShieldCheck,
  User,
  Wallet,
  X,
  BadgeIndianRupee,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  Eye,
  RefreshCw,
  ShoppingBag,
  Sparkles,
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

export interface BillItem {
  id: string;
  tag_number: string;
  huid_code: string;
  ornament_name: string;
  category: string;
  purity: string;
  gross_weight_g: number;
  stone_weight_g: number;
  stone_value: number;
  net_weight_g: number;
  wastage_percent: number;
  gold_rate_per_g: number;
  metal_value: number;
  making_charge_type: 'PER_GRAM' | 'PERCENTAGE';
  making_charge_rate: number;
  making_charges: number;
  gst_rate: number;
  gst_amount: number;
  line_total: number;
}

export interface PosInvoiceRecord {
  id: string;
  bill_no: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_pan?: string;
  items: BillItem[];
  items_count: number;
  gross_weight_g: number;
  net_weight_g: number;
  gold_rate_per_g: number;
  making_charges: number;
  taxable_value: number;
  cgst_amount: number;
  sgst_amount: number;
  gst_amount: number;
  old_gold_deduction: number;
  advance_offset: number;
  cash_paid: number;
  upi_paid: number;
  card_paid: number;
  grand_total: number;
  payment_method: string;
  payment_status: 'PAID' | 'PARTIAL' | 'CANCELLED';
  created_at: string;
}

export function SalesBillingPosView() {
  const [activeTab, setActiveTab] = useState<'terminal' | 'history'>('terminal');
  const [invoices, setInvoices] = useState<PosInvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Counter Billing Session State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPan, setCustomerPan] = useState('');
  const [activeKaratRate, setActiveKaratRate] = useState<number>(7850);
  const [selectedKarat, setSelectedKarat] = useState<string>('22K (916)');

  // Scale Reader state
  const [scaleWeight, setScaleWeight] = useState<number>(0);

  // Tag Entry inputs
  const [searchTag, setSearchTag] = useState('');
  const [itemName, setItemName] = useState('');
  const [huidCode, setHuidCode] = useState('');
  const [itemCategory, setItemCategory] = useState('Necklace');
  const [grossWeight, setGrossWeight] = useState('');
  const [stoneWeight, setStoneWeight] = useState('0.000');
  const [stoneValue, setStoneValue] = useState('0');
  const [wastagePercent, setWastagePercent] = useState('0');
  const [makingType, setMakingType] = useState<'PER_GRAM' | 'PERCENTAGE'>('PER_GRAM');
  const [makingRate, setMakingRate] = useState('750');

  // Active Bill Cart Items
  const [billItems, setBillItems] = useState<BillItem[]>([]);

  // Payment Breakdown
  const [cashAmount, setCashAmount] = useState<string>('0');
  const [upiAmount, setUpiAmount] = useState<string>('0');
  const [cardAmount, setCardAmount] = useState<string>('0');
  const [oldGoldCredit, setOldGoldCredit] = useState<string>('0');
  const [advanceOffset, setAdvanceOffset] = useState<string>('0');

  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<PosInvoiceRecord | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // History search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PARTIAL' | 'CANCELLED'>('ALL');

  // Rates lookup
  const karatRatesMap: Record<string, number> = {
    '24K (999)': 8120,
    '22K (916)': 7850,
    '18K (750)': 6420,
    '14K (585)': 5010,
    'Silver 999': 98.5,
  };

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  // Fetch invoices from Firestore
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'sales_billing_pos'));
      const list: PosInvoiceRecord[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<PosInvoiceRecord, 'id'>) });
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
      setInvoices(list);
    } catch (err: unknown) {
      console.error('Error fetching sales bills:', err);
      showToast('error', 'Failed to fetch sales bills from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleKaratChange = (karat: string) => {
    setSelectedKarat(karat);
    setActiveKaratRate(karatRatesMap[karat] || 7850);
  };

  // Add Item to Bill Cart
  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const gross = parseFloat(grossWeight) || 0;
    if (gross <= 0) {
      showToast('error', 'Gross weight must be greater than zero.');
      return;
    }
    const stone = parseFloat(stoneWeight) || 0;
    const stoneVal = parseFloat(stoneValue) || 0;
    const wastage = parseFloat(wastagePercent) || 0;
    const net = Math.max(0, gross - stone);
    const pureNetWithWastage = net * (1 + wastage / 100);
    const metalVal = pureNetWithWastage * activeKaratRate;
    const mkRate = parseFloat(makingRate) || 0;
    const mkTotal = makingType === 'PER_GRAM' ? net * mkRate : (metalVal * mkRate) / 100;
    const taxable = metalVal + mkTotal + stoneVal;
    const gst = (taxable * 3) / 100;
    const total = taxable + gst;

    const newItem: BillItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tag_number: searchTag || `TAG-G-${Math.floor(1000 + Math.random() * 9000)}`,
      huid_code: (huidCode || `HD${Math.floor(1000 + Math.random() * 8999)}`).toUpperCase(),
      ornament_name: itemName || `${selectedKarat} ${itemCategory}`,
      category: itemCategory,
      purity: selectedKarat,
      gross_weight_g: gross,
      stone_weight_g: stone,
      stone_value: stoneVal,
      net_weight_g: net,
      wastage_percent: wastage,
      gold_rate_per_g: activeKaratRate,
      metal_value: Math.round(metalVal * 100) / 100,
      making_charge_type: makingType,
      making_charge_rate: mkRate,
      making_charges: Math.round(mkTotal * 100) / 100,
      gst_rate: 3,
      gst_amount: Math.round(gst * 100) / 100,
      line_total: Math.round(total),
    };

    setBillItems((prev) => [...prev, newItem]);
    setSearchTag('');
    setItemName('');
    setGrossWeight('');
    setStoneWeight('0.000');
    setStoneValue('0');
    setWastagePercent('0');
    showToast('success', `Added ${newItem.ornament_name} to cart.`);
  };

  const handleRemoveItem = (id: string) => {
    setBillItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Bill Totals Calculations
  const billSummary = useMemo(() => {
    const totalGross = billItems.reduce((acc, i) => acc + i.gross_weight_g, 0);
    const totalNet = billItems.reduce((acc, i) => acc + i.net_weight_g, 0);
    const totalMetalVal = billItems.reduce((acc, i) => acc + i.metal_value, 0);
    const totalMaking = billItems.reduce((acc, i) => acc + i.making_charges, 0);
    const totalStoneVal = billItems.reduce((acc, i) => acc + (i.stone_value || 0), 0);
    const taxable = totalMetalVal + totalMaking + totalStoneVal;
    const totalGst = (taxable * 3) / 100;
    const cgst = totalGst / 2;
    const sgst = totalGst / 2;
    const rawGrandTotal = taxable + totalGst;
    const grandTotal = Math.round(rawGrandTotal);
    const roundOff = grandTotal - rawGrandTotal;

    return {
      totalGross,
      totalNet,
      totalMetalVal,
      totalMaking,
      totalStoneVal,
      taxable,
      totalGst,
      cgst,
      sgst,
      roundOff,
      grandTotal,
    };
  }, [billItems]);

  // Payment Balance Calculation
  const totalPaid =
    (parseFloat(cashAmount) || 0) +
    (parseFloat(upiAmount) || 0) +
    (parseFloat(cardAmount) || 0) +
    (parseFloat(oldGoldCredit) || 0) +
    (parseFloat(advanceOffset) || 0);

  const balanceRemaining = Math.max(0, billSummary.grandTotal - totalPaid);

  // Auto-fill remaining into UPI or Cash when opening payment drawer
  const handleOpenPayment = () => {
    if (billItems.length === 0) {
      showToast('error', 'Add at least one item to bill before payment.');
      return;
    }
    if (totalPaid === 0) {
      setUpiAmount(billSummary.grandTotal.toString());
    }
    setIsPaymentModalOpen(true);
  };

  // Save Completed Bill to Firestore
  const handleCompleteAndSaveBill = async () => {
    try {
      setSaving(true);
      const generatedBillNo = `POS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const paymentMethodsList: string[] = [];
      if (parseFloat(cashAmount) > 0) paymentMethodsList.push(`Cash: ₹${cashAmount}`);
      if (parseFloat(upiAmount) > 0) paymentMethodsList.push(`UPI: ₹${upiAmount}`);
      if (parseFloat(cardAmount) > 0) paymentMethodsList.push(`Card: ₹${cardAmount}`);
      if (parseFloat(oldGoldCredit) > 0) paymentMethodsList.push(`Old Gold: ₹${oldGoldCredit}`);
      if (parseFloat(advanceOffset) > 0) paymentMethodsList.push(`Scheme Adv: ₹${advanceOffset}`);

      const billRecordData = {
        bill_no: generatedBillNo,
        customer_name: customerName.trim() || 'Walk-in Guest',
        customer_phone: customerPhone.trim() || 'N/A',
        customer_email: customerEmail.trim() || '',
        customer_pan: customerPan.trim() || '',
        items: billItems,
        items_count: billItems.length,
        gross_weight_g: billSummary.totalGross,
        net_weight_g: billSummary.totalNet,
        gold_rate_per_g: activeKaratRate,
        making_charges: billSummary.totalMaking,
        taxable_value: billSummary.taxable,
        cgst_amount: billSummary.cgst,
        sgst_amount: billSummary.sgst,
        gst_amount: billSummary.totalGst,
        old_gold_deduction: parseFloat(oldGoldCredit) || 0,
        advance_offset: parseFloat(advanceOffset) || 0,
        cash_paid: parseFloat(cashAmount) || 0,
        upi_paid: parseFloat(upiAmount) || 0,
        card_paid: parseFloat(cardAmount) || 0,
        grand_total: billSummary.grandTotal,
        payment_method: paymentMethodsList.length > 0 ? paymentMethodsList.join(', ') : 'Cash',
        payment_status: (totalPaid >= billSummary.grandTotal ? 'PAID' : 'PARTIAL') as 'PAID' | 'PARTIAL',
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'sales_billing_pos'), billRecordData);
      const savedInvoice: PosInvoiceRecord = { id: docRef.id, ...billRecordData };

      setInvoices((prev) => [savedInvoice, ...prev]);
      setSelectedInvoiceForModal(savedInvoice);
      setIsPaymentModalOpen(false);
      setIsPrintModalOpen(true);

      // Reset cart
      setBillItems([]);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setCustomerPan('');
      setCashAmount('0');
      setUpiAmount('0');
      setCardAmount('0');
      setOldGoldCredit('0');
      setAdvanceOffset('0');

      showToast('success', `Bill ${generatedBillNo} generated & saved successfully!`);
    } catch (err: unknown) {
      console.error('Error saving POS bill:', err);
      showToast('error', 'Failed to save bill to Firestore.');
    } finally {
      setSaving(false);
    }
  };

  // Park / Hold Bill to `sales_held_bills`
  const handleParkBill = async () => {
    if (billItems.length === 0) {
      showToast('error', 'No items in cart to park.');
      return;
    }
    try {
      setSaving(true);
      const tokenNo = `HOLD-TK-${Math.floor(100 + Math.random() * 900)}`;
      const heldRecord = {
        held_token_no: tokenNo,
        terminal_id: 'COUNTER-01',
        counter_staff: 'Active Cashier',
        customer_name: customerName.trim() || 'Walk-in Customer',
        customer_phone: customerPhone.trim() || 'N/A',
        items_count: billItems.length,
        total_gross_wt_g: billSummary.totalGross,
        total_net_wt_g: billSummary.totalNet,
        tentative_total: billSummary.grandTotal,
        parked_at: new Date().toISOString(),
        auto_release_time: 'Auto-release in 60 mins',
        items_summary: billItems.map((i) => `${i.ornament_name} (${i.gross_weight_g}g)`).join(', '),
        status: 'PARKED_LOCKED',
      };

      await addDoc(collection(db, 'sales_held_bills'), heldRecord);
      setBillItems([]);
      showToast('success', `Bill parked successfully with token ${tokenNo}. View in Held Bills tab.`);
    } catch (err: unknown) {
      console.error('Error parking bill:', err);
      showToast('error', 'Failed to park bill.');
    } finally {
      setSaving(false);
    }
  };

  // Update Status
  const handleUpdateStatus = async (id: string, newStatus: 'PAID' | 'PARTIAL' | 'CANCELLED') => {
    try {
      await updateDoc(doc(db, 'sales_billing_pos', id), { payment_status: newStatus });
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, payment_status: newStatus } : inv))
      );
      showToast('success', `Invoice marked as ${newStatus}`);
    } catch (err: unknown) {
      console.error('Error updating status:', err);
      showToast('error', 'Failed to update invoice status');
    }
  };

  // Delete Invoice
  const handleDeleteInvoice = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteDoc(doc(db, 'sales_billing_pos', id));
      setInvoices((prev) => prev.filter((i) => i.id !== id));
      setDeleteConfirmId(null);
      showToast('success', 'Bill record deleted successfully');
    } catch (err: unknown) {
      console.error('Error deleting bill:', err);
      showToast('error', 'Failed to delete bill');
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered invoices for history view
  const filteredInvoices = invoices.filter((inv) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      inv.bill_no?.toLowerCase().includes(q) ||
      inv.customer_name?.toLowerCase().includes(q) ||
      inv.customer_phone?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || inv.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="sales_pos_billing" />
      <ActionToolbar
        filterPlaceholder="Filter by bill #, customer, HUID, tag..."
        insertLabel="New POS Bill"
        onRefresh={fetchInvoices}
        onInsertClick={() => {
          setActiveTab('terminal');
          setBillItems([]);
        }}
      />
      <SalesSubNav />

      {/* Main View Scrollable */}
      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        <div className="p-4 sm:p-5 flex flex-col gap-4 max-w-7xl w-full mx-auto">
          {/* Toast Notification */}
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

          {/* KPI Metrics Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Bills</span>
                <Receipt className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{invoices.length}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Live database records</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Sales (₹)</span>
                <BadgeIndianRupee className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                ₹{invoices.reduce((acc, curr) => acc + (curr.grand_total || 0), 0).toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Cumulative POS revenue</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Net Weight</span>
                <Scale className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                {invoices.reduce((acc, curr) => acc + (curr.net_weight_g || 0), 0).toFixed(3)}{' '}
                <span className="text-xs text-neutral-500 font-normal">g</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Total gold sold</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Current Karat Rate</span>
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700">₹{activeKaratRate}/g</div>
              <div className="text-[10px] text-neutral-500 mt-0.5">{selectedKarat} benchmark</div>
            </div>
          </div>

          {/* Tab Selector: POS Terminal vs Recent Invoices */}
          <div className="flex items-center gap-2 border-b border-[#e2e8f0] pb-2">
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'terminal'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white border border-[#e2e8f0] text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Counter POS Terminal</span>
              {billItems.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white text-emerald-700 font-medium">
                  {billItems.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white border border-[#e2e8f0] text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Saved POS Bills</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-100 text-neutral-700 font-medium">
                {invoices.length}
              </span>
            </button>
          </div>

          {/* ACTIVE TAB: POS TERMINAL */}
          {activeTab === 'terminal' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Column: Customer & Item Input (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                {/* Customer Details Box */}
                <div className="bg-white rounded-lg border border-[#e2e8f0] p-4 shadow-2xs">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#e2e8f0]">
                    <div className="flex items-center gap-2 text-neutral-800 text-xs font-medium">
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>Customer & Billing Information</span>
                    </div>
                    <Link
                      href="/customers/list"
                      className="text-[11px] text-emerald-600 hover:underline flex items-center gap-0.5 font-medium"
                    >
                      <span>Customer Directory</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-neutral-600 font-medium mb-1">Customer Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Priya Sharma"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-600 font-medium mb-1">Phone Number</label>
                      <input
                        type="text"
                        placeholder="+91 98451 22910"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-600 font-medium mb-1">Email (Optional)</label>
                      <input
                        type="email"
                        placeholder="priya@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-600 font-medium mb-1">PAN (Required for &gt; ₹2 Lakhs)</label>
                      <input
                        type="text"
                        placeholder="ABCDE1234F"
                        value={customerPan}
                        onChange={(e) => setCustomerPan(e.target.value.toUpperCase())}
                        className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none uppercase font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Ornament & Weighing Scale Entry Form */}
                <form
                  onSubmit={handleAddItem}
                  className="bg-white rounded-lg border border-[#e2e8f0] p-4 shadow-2xs flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
                    <div className="flex items-center gap-2 text-neutral-800 text-xs font-medium">
                      <Barcode className="w-4 h-4 text-emerald-600" />
                      <span>Ornament Item Entry & Digital Scale</span>
                    </div>
                    <Link
                      href="/inventory/ornaments"
                      className="text-[11px] text-emerald-600 hover:underline flex items-center gap-0.5 font-medium"
                    >
                      <span>Check Stock</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  </div>

                  {/* Metal Karat & Rate Selection */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <label className="block text-neutral-600 font-medium mb-1">Purity Karat</label>
                      <select
                        value={selectedKarat}
                        onChange={(e) => handleKaratChange(e.target.value)}
                        className="w-full px-2 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="22K (916)">22K (916)</option>
                        <option value="24K (999)">24K (999)</option>
                        <option value="18K (750)">18K (750)</option>
                        <option value="14K (585)">14K (585)</option>
                        <option value="Silver 999">Silver 999</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-neutral-600 font-medium mb-1">Rate ₹/g</label>
                      <input
                        type="number"
                        value={activeKaratRate}
                        onChange={(e) => setActiveKaratRate(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-600 font-medium mb-1">Category</label>
                      <select
                        value={itemCategory}
                        onChange={(e) => setItemCategory(e.target.value)}
                        className="w-full px-2 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="Necklace">Necklace</option>
                        <option value="Earrings">Earrings</option>
                        <option value="Bangles">Bangles</option>
                        <option value="Rings">Rings</option>
                        <option value="Chains">Chains</option>
                        <option value="Mangalsutra">Mangalsutra</option>
                        <option value="Silver Articles">Silver Articles</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-neutral-600 font-medium mb-1">Hallmark HUID</label>
                      <input
                        type="text"
                        placeholder="HD9128"
                        value={huidCode}
                        onChange={(e) => setHuidCode(e.target.value.toUpperCase())}
                        className="w-full px-2 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none font-mono uppercase"
                      />
                    </div>
                  </div>

                  {/* Ornament Name & Tag */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block text-neutral-600 font-medium mb-1">Ornament Description</label>
                      <input
                        type="text"
                        placeholder="e.g. 22K Antique Temple Choker"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-600 font-medium mb-1">Barcode / Tag #</label>
                      <input
                        type="text"
                        placeholder="TAG-G-8910"
                        value={searchTag}
                        onChange={(e) => setSearchTag(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Weights & Scale Integration */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-neutral-600 font-medium">Gross Wt (g) *</label>
                        <button
                          type="button"
                          onClick={() => {
                            const sim = (Math.random() * 25 + 5).toFixed(3);
                            setScaleWeight(parseFloat(sim));
                            setGrossWeight(sim);
                          }}
                          className="text-[10px] text-emerald-600 hover:underline flex items-center gap-0.5"
                          title="Simulate Weighing Scale Input"
                        >
                          <Scale className="w-2.5 h-2.5" />
                          <span>Scale</span>
                        </button>
                      </div>
                      <input
                        type="number"
                        step="0.001"
                        required
                        placeholder="0.000"
                        value={grossWeight}
                        onChange={(e) => setGrossWeight(e.target.value)}
                        className="w-full px-2 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
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
                        className="w-full px-2 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-600 font-medium mb-1">Stone Val (₹)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={stoneValue}
                        onChange={(e) => setStoneValue(e.target.value)}
                        className="w-full px-2 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-600 font-medium mb-1">Wastage %</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={wastagePercent}
                        onChange={(e) => setWastagePercent(e.target.value)}
                        className="w-full px-2 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Making Charges */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block text-neutral-600 font-medium mb-1">Making Charge Type</label>
                      <select
                        value={makingType}
                        onChange={(e) => setMakingType(e.target.value as 'PER_GRAM' | 'PERCENTAGE')}
                        className="w-full px-2 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="PER_GRAM">₹ Per Gram</option>
                        <option value="PERCENTAGE">% on Gold Value</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-neutral-600 font-medium mb-1">
                        {makingType === 'PER_GRAM' ? 'Rate (₹/g)' : 'Percentage (%)'}
                      </label>
                      <input
                        type="number"
                        value={makingRate}
                        onChange={(e) => setMakingRate(e.target.value)}
                        className="w-full px-2 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium shadow-2xs transition-colors flex items-center justify-center gap-1.5 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Item to Bill</span>
                      </button>
                    </div>
                  </div>
                </form>

                {/* Cart Items Table */}
                <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden shadow-2xs">
                  <div className="p-3 bg-neutral-50 border-b border-[#e2e8f0] flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-700">
                      Cart Items ({billItems.length})
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Net Wt: {billSummary.totalNet.toFixed(3)}g
                    </span>
                  </div>

                  {billItems.length === 0 ? (
                    <div className="py-8 text-center text-xs text-neutral-400">
                      <ShoppingBag className="w-8 h-8 mx-auto text-neutral-300 mb-2 stroke-1" />
                      <p>No items added to current bill yet.</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Scan or enter ornament tag above to populate.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-neutral-100/60 border-b border-[#e2e8f0] text-neutral-600 font-medium text-[11px]">
                            <th className="py-2 px-3">Item Details</th>
                            <th className="py-2 px-2 text-right">Gross Wt</th>
                            <th className="py-2 px-2 text-right">Net Wt</th>
                            <th className="py-2 px-2 text-right">Making</th>
                            <th className="py-2 px-3 text-right">Line Total (₹)</th>
                            <th className="py-2 px-2 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2e8f0]">
                          {billItems.map((item) => (
                            <tr key={item.id} className="hover:bg-neutral-50/80">
                              <td className="py-2 px-3">
                                <div className="font-medium text-neutral-800">{item.ornament_name}</div>
                                <div className="text-[10px] text-neutral-500 font-mono">
                                  {item.purity} • HUID: {item.huid_code}
                                </div>
                              </td>
                              <td className="py-2 px-2 text-right font-mono text-neutral-700">
                                {item.gross_weight_g.toFixed(3)}g
                              </td>
                              <td className="py-2 px-2 text-right font-mono text-neutral-700">
                                {item.net_weight_g.toFixed(3)}g
                              </td>
                              <td className="py-2 px-2 text-right font-mono text-neutral-700">
                                ₹{item.making_charges.toLocaleString('en-IN')}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-medium text-emerald-700">
                                ₹{item.line_total.toLocaleString('en-IN')}
                              </td>
                              <td className="py-2 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="text-neutral-400 hover:text-red-600 transition-colors p-1"
                                  title="Remove item"
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

              {/* Right Column: Checkout Summary & Actions (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="bg-white rounded-lg border border-[#e2e8f0] p-4 shadow-2xs flex flex-col gap-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
                    <div className="flex items-center gap-2 text-neutral-800 text-xs font-medium">
                      <Receipt className="w-4 h-4 text-emerald-600" />
                      <span>Live Invoice Summary</span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      3% GST Inclusive
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-neutral-600">
                      <span>Total Gross Weight</span>
                      <span className="font-mono text-neutral-800">{billSummary.totalGross.toFixed(3)} g</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>Total Net Gold</span>
                      <span className="font-mono text-neutral-800">{billSummary.totalNet.toFixed(3)} g</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>Gold Metal Value</span>
                      <span className="font-mono text-neutral-800">
                        ₹{billSummary.totalMetalVal.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>Total Making Charges</span>
                      <span className="font-mono text-neutral-800">
                        ₹{billSummary.totalMaking.toLocaleString('en-IN')}
                      </span>
                    </div>
                    {billSummary.totalStoneVal > 0 && (
                      <div className="flex justify-between text-neutral-600">
                        <span>Precious Stone Value</span>
                        <span className="font-mono text-neutral-800">
                          ₹{billSummary.totalStoneVal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-[#e2e8f0] pt-2 flex justify-between text-neutral-700 font-medium">
                      <span>Taxable Value</span>
                      <span className="font-mono">₹{billSummary.taxable.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-neutral-500 text-[11px]">
                      <span>CGST (1.5%)</span>
                      <span className="font-mono">₹{billSummary.cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-500 text-[11px]">
                      <span>SGST (1.5%)</span>
                      <span className="font-mono">₹{billSummary.sgst.toFixed(2)}</span>
                    </div>
                    {billSummary.roundOff !== 0 && (
                      <div className="flex justify-between text-neutral-500 text-[11px]">
                        <span>Round Off</span>
                        <span className="font-mono">₹{billSummary.roundOff.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="border-t border-[#e2e8f0] pt-3 flex justify-between items-baseline">
                      <span className="text-sm font-medium text-neutral-800">Grand Total</span>
                      <span className="text-2xl font-medium font-mono text-emerald-700">
                        ₹{billSummary.grandTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Deductions: Old gold & Schemes */}
                  <div className="pt-2 border-t border-[#e2e8f0] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-neutral-600 font-medium">
                        <Coins className="w-3.5 h-3.5 text-amber-600" />
                        <span>Old Gold Deduction (₹)</span>
                      </div>
                      <input
                        type="number"
                        value={oldGoldCredit}
                        onChange={(e) => setOldGoldCredit(e.target.value)}
                        className="w-28 px-2 py-1 text-right border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-neutral-600 font-medium">
                        <Wallet className="w-3.5 h-3.5 text-blue-600" />
                        <span>Scheme Advance Offset (₹)</span>
                      </div>
                      <input
                        type="number"
                        value={advanceOffset}
                        onChange={(e) => setAdvanceOffset(e.target.value)}
                        className="w-28 px-2 py-1 text-right border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-[#e2e8f0] flex flex-col gap-2">
                    <button
                      type="button"
                      disabled={billItems.length === 0 || saving}
                      onClick={handleOpenPayment}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium text-xs shadow-2xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      <BadgeIndianRupee className="w-4 h-4" />
                      <span>Proceed to Payment & Complete Bill</span>
                    </button>

                    <button
                      type="button"
                      disabled={billItems.length === 0 || saving}
                      onClick={handleParkBill}
                      className="w-full py-2 px-3 border border-[#e2e8f0] text-neutral-700 hover:bg-neutral-50 rounded-md font-medium text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Park / Hold Bill (Move to HeldBills)</span>
                    </button>
                  </div>
                </div>

                {/* Quick Link Card to Old Gold & Finance */}
                <div className="p-3 bg-neutral-50 rounded-lg border border-[#e2e8f0] text-xs flex flex-col gap-1.5">
                  <span className="font-medium text-neutral-700">Need Old Gold Valuation first?</span>
                  <p className="text-neutral-500 text-[11px]">
                    Use the Old Gold Exchange module to calculate scrap melt weight & purity credit.
                  </p>
                  <Link
                    href="/sales/exchange-billing"
                    className="text-emerald-700 hover:underline flex items-center gap-1 font-medium text-[11px]"
                  >
                    <span>Open Old Gold Exchange Calculator</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE TAB: SAVED POS BILLS (HISTORY) */}
          {activeTab === 'history' && (
            <div className="flex flex-col gap-4">
              {/* Filter and Search Bar */}
              <div className="bg-white p-3 rounded-lg border border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative w-full">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search by bill #, customer name, phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 border border-[#e2e8f0] rounded-md text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-neutral-500 font-medium">Status:</span>
                  {(['ALL', 'PAID', 'PARTIAL', 'CANCELLED'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                        statusFilter === st
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-neutral-50 text-neutral-600 border border-[#e2e8f0] hover:bg-neutral-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table or Empty State */}
              {loading ? (
                <div className="p-12 flex flex-col items-center justify-center bg-white rounded-lg border border-[#e2e8f0]">
                  <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mb-2" />
                  <span className="text-xs text-neutral-500 font-medium">Loading bills from Firestore...</span>
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center bg-white rounded-lg border border-[#e2e8f0] text-center">
                  <Receipt className="w-10 h-10 text-neutral-300 mb-3 stroke-1" />
                  <h3 className="text-sm font-medium text-neutral-800 mb-1">No POS Invoices Found</h3>
                  <p className="text-xs text-neutral-500 max-w-sm mb-4">
                    {searchQuery
                      ? 'No bills match your current search query.'
                      : 'There are no sales bills recorded yet. Create your first counter bill to get started.'}
                  </p>
                  <button
                    onClick={() => setActiveTab('terminal')}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Bill</span>
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-neutral-50 border-b border-[#e2e8f0] text-neutral-600 font-medium text-[11px]">
                          <th className="py-2.5 px-3">Bill #</th>
                          <th className="py-2.5 px-3">Customer</th>
                          <th className="py-2.5 px-2 text-right">Items</th>
                          <th className="py-2.5 px-2 text-right">Net Wt</th>
                          <th className="py-2.5 px-3 text-right">Taxable</th>
                          <th className="py-2.5 px-3 text-right">GST 3%</th>
                          <th className="py-2.5 px-3 text-right">Grand Total</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                          <th className="py-2.5 px-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e2e8f0]">
                        {filteredInvoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-neutral-50/70 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-medium text-neutral-800">
                              {inv.bill_no}
                              <div className="text-[10px] text-neutral-400 font-sans">
                                {inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-IN') : 'Recent'}
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-medium text-neutral-800">{inv.customer_name}</div>
                              <div className="text-[10px] text-neutral-500 font-mono">{inv.customer_phone}</div>
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono text-neutral-700">
                              {inv.items_count || inv.items?.length || 0}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono text-neutral-700">
                              {inv.net_weight_g?.toFixed(3)}g
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-neutral-700">
                              ₹{inv.taxable_value?.toLocaleString('en-IN')}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-neutral-500">
                              ₹{inv.gst_amount?.toLocaleString('en-IN')}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-700">
                              ₹{inv.grand_total?.toLocaleString('en-IN')}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium font-mono ${
                                  inv.payment_status === 'PAID'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : inv.payment_status === 'PARTIAL'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {inv.payment_status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedInvoiceForModal(inv);
                                    setIsPrintModalOpen(true);
                                  }}
                                  className="p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-neutral-100 transition-colors"
                                  title="View Tax Invoice Slip"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateStatus(
                                      inv.id,
                                      inv.payment_status === 'PAID' ? 'PARTIAL' : 'PAID'
                                    )
                                  }
                                  className="p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-neutral-100 transition-colors"
                                  title="Toggle Status (Paid/Partial)"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(inv.id)}
                                  className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Delete Bill"
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
          )}
        </div>
      </div>

      {/* PAYMENT DRAWER / MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 border border-[#e2e8f0] animate-fadeIn text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] mb-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-neutral-800 text-sm">Payment Breakdown & Split</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded p-2.5 mb-3 flex items-center justify-between">
              <span className="text-emerald-800 font-medium">Grand Total Payable:</span>
              <span className="text-base font-mono font-medium text-emerald-900">
                ₹{billSummary.grandTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="space-y-2.5 mb-4">
              <div>
                <label className="block text-neutral-600 font-medium mb-1">Cash Payment (₹)</label>
                <input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">UPI / QR Payment (₹)</label>
                <input
                  type="number"
                  value={upiAmount}
                  onChange={(e) => setUpiAmount(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">Card Swipe (₹)</label>
                <input
                  type="number"
                  value={cardAmount}
                  onChange={(e) => setCardAmount(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-[#e2e8f0] flex justify-between items-center text-xs">
                <span className="text-neutral-600 font-medium">Total Paid Recorded:</span>
                <span className="font-mono font-medium text-neutral-800">
                  ₹{totalPaid.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-600 font-medium">Balance Remaining:</span>
                <span
                  className={`font-mono font-medium ${
                    balanceRemaining > 0 ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                >
                  ₹{balanceRemaining.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-3 py-1.5 border border-[#e2e8f0] text-neutral-600 rounded font-medium hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleCompleteAndSaveBill}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
                <span>{saving ? 'Saving...' : 'Confirm & Save Bill'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT / VIEW INVOICE MODAL */}
      {isPrintModalOpen && selectedInvoiceForModal && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-xl w-full p-6 border border-[#e2e8f0] animate-fadeIn text-xs max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] mb-4">
              <div>
                <h2 className="text-base font-medium text-neutral-800">JEWELLERY NEXT TAX INVOICE</h2>
                <p className="text-[11px] text-neutral-500">BIS Hallmark & GST Compliant Sales Receipt</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#e2e8f0] text-[11px]">
              <div>
                <span className="text-neutral-400 block font-medium">Bill Number:</span>
                <span className="font-mono font-medium text-neutral-800">{selectedInvoiceForModal.bill_no}</span>
              </div>
              <div className="text-right">
                <span className="text-neutral-400 block font-medium">Date & Time:</span>
                <span className="font-mono text-neutral-700">
                  {selectedInvoiceForModal.created_at
                    ? new Date(selectedInvoiceForModal.created_at).toLocaleString('en-IN')
                    : 'Today'}
                </span>
              </div>
              <div>
                <span className="text-neutral-400 block font-medium">Customer:</span>
                <span className="font-medium text-neutral-800">{selectedInvoiceForModal.customer_name}</span>
                <div className="font-mono text-neutral-500">{selectedInvoiceForModal.customer_phone}</div>
              </div>
              <div className="text-right">
                <span className="text-neutral-400 block font-medium">Payment Mode:</span>
                <span className="font-medium text-neutral-800">{selectedInvoiceForModal.payment_method}</span>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="py-3 border-b border-[#e2e8f0]">
              <span className="font-medium text-neutral-700 block mb-2">Itemized List:</span>
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-[#e2e8f0] text-neutral-500 font-medium">
                    <th className="py-1">Item</th>
                    <th className="py-1 text-right">Gross</th>
                    <th className="py-1 text-right">Net</th>
                    <th className="py-1 text-right">Making</th>
                    <th className="py-1 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {selectedInvoiceForModal.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5">
                        <div className="font-medium text-neutral-800">{item.ornament_name}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          {item.purity} • HUID: {item.huid_code}
                        </div>
                      </td>
                      <td className="py-1.5 text-right font-mono">{item.gross_weight_g?.toFixed(3)}g</td>
                      <td className="py-1.5 text-right font-mono">{item.net_weight_g?.toFixed(3)}g</td>
                      <td className="py-1.5 text-right font-mono">₹{item.making_charges?.toLocaleString('en-IN')}</td>
                      <td className="py-1.5 text-right font-mono font-medium">
                        ₹{item.line_total?.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financials Totals */}
            <div className="py-3 border-b border-[#e2e8f0] space-y-1 text-[11px]">
              <div className="flex justify-between text-neutral-600">
                <span>Taxable Amount</span>
                <span className="font-mono">
                  ₹{selectedInvoiceForModal.taxable_value?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>CGST (1.5%)</span>
                <span className="font-mono">
                  ₹{selectedInvoiceForModal.cgst_amount?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>SGST (1.5%)</span>
                <span className="font-mono">
                  ₹{selectedInvoiceForModal.sgst_amount?.toFixed(2)}
                </span>
              </div>
              {selectedInvoiceForModal.old_gold_deduction > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span>Old Gold Credit Deducted</span>
                  <span className="font-mono">
                    -₹{selectedInvoiceForModal.old_gold_deduction?.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-medium text-neutral-800 pt-1 border-t border-[#e2e8f0] text-xs">
                <span>Grand Total Net Payable</span>
                <span className="font-mono text-emerald-700">
                  ₹{selectedInvoiceForModal.grand_total?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-[10px] text-neutral-400">
                Thank you for your patronage • HSN 7113
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
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
                  <span>Print Receipt</span>
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
            <h3 className="font-medium text-neutral-800 text-sm mb-2">Delete POS Bill?</h3>
            <p className="text-neutral-500 mb-4">
              Are you sure you want to delete this bill from the database? This action cannot be undone.
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
