'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import { SalesSubNav } from './SalesSubNav';
import {
  Package,
  Calendar,
  Lock,
  X,
  BadgeIndianRupee,
  Eye,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  RefreshCw,
  Printer,
  Scale,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  UserCheck,
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

export interface SalesOrder {
  id: string;
  order_no: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  occasion: string;
  design_category: string;
  metal_karat: string;
  approx_weight_g: number;
  net_weight_g: number;
  rate_policy: 'FIXED_LOCKED_RATE' | 'FLOATING_DAY_RATE';
  locked_rate_per_g?: number;
  advance_received: number;
  estimated_order_value: number;
  balance_due: number;
  due_date: string;
  stage: 'CAD_DESIGN' | 'CASTING' | 'SETTING' | 'POLISHING' | 'HALLMARK_HUID' | 'READY_FOR_DELIVERY';
  status: 'IN_PRODUCTION' | 'COMPLETED' | 'CANCELLED';
  assigned_karigar: string;
  notes?: string;
  created_at: string;
}

const PRODUCTION_STAGES: Array<{ id: SalesOrder['stage']; label: string }> = [
  { id: 'CAD_DESIGN', label: 'CAD Design' },
  { id: 'CASTING', label: 'Wax & Casting' },
  { id: 'SETTING', label: 'Stone Setting' },
  { id: 'POLISHING', label: 'Hand Polish' },
  { id: 'HALLMARK_HUID', label: 'BIS Hallmark' },
  { id: 'READY_FOR_DELIVERY', label: 'Ready for Delivery' },
];

export function SalesOrdersView() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [isJobCardModalOpen, setIsJobCardModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [orderNo, setOrderNo] = useState('');
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [occasion, setOccasion] = useState('Grand Wedding');
  const [designCategory, setDesignCategory] = useState('Bridal Choker & Vaddanam Set');
  const [metalKarat, setMetalKarat] = useState('Gold 22K (916)');
  const [approxGrossWeight, setApproxGrossWeight] = useState('');
  const [approxNetWeight, setApproxNetWeight] = useState('');
  const [ratePolicy, setRatePolicy] = useState<'FIXED_LOCKED_RATE' | 'FLOATING_DAY_RATE'>('FIXED_LOCKED_RATE');
  const [lockedRate, setLockedRate] = useState('7850');
  const [advanceReceived, setAdvanceReceived] = useState('50000');
  const [dueDate, setDueDate] = useState('');
  const [assignedKarigar, setAssignedKarigar] = useState('Gopal Soni (Bengal Master)');
  const [notes, setNotes] = useState('');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'sales_orders'));
      const list: SalesOrder[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<SalesOrder, 'id'>) });
      });
      list.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
      setOrders(list);
    } catch (err: unknown) {
      console.error('Error fetching orders:', err);
      showToast('error', 'Failed to load custom orders from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenAddModal = () => {
    const yr = new Date().getFullYear();
    setOrderNo(`ORD-${yr}-${Math.floor(1000 + Math.random() * 9000)}`);
    setCustName('');
    setCustPhone('');
    setCustEmail('');
    setOccasion('Grand Wedding');
    setDesignCategory('Bridal Choker & Vaddanam Set');
    setMetalKarat('Gold 22K (916)');
    setApproxGrossWeight('');
    setApproxNetWeight('');
    setRatePolicy('FIXED_LOCKED_RATE');
    setLockedRate('7850');
    setAdvanceReceived('50000');
    // Default due date 2 weeks from now
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setDueDate(d.toISOString().split('T')[0]);
    setAssignedKarigar('Gopal Soni (Bengal Master)');
    setNotes('');
    setIsAddModalOpen(true);
  };

  // Form calculation
  const formCalculations = useMemo(() => {
    const gross = parseFloat(approxGrossWeight) || 0;
    const net = parseFloat(approxNetWeight) || gross;
    const rate = parseFloat(lockedRate) || 7850;
    const advance = parseFloat(advanceReceived) || 0;
    const makingEst = net * 850;
    const estTaxable = net * rate + makingEst;
    const gst = (estTaxable * 3) / 100;
    const totalEst = Math.round(estTaxable + gst);
    const balance = Math.max(0, totalEst - advance);

    return { gross, net, totalEst, advance, balance };
  }, [approxGrossWeight, approxNetWeight, lockedRate, advanceReceived]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || formCalculations.gross <= 0) {
      showToast('error', 'Please enter customer name and estimated weight.');
      return;
    }

    try {
      setSaving(true);
      const orderData = {
        order_no: orderNo.trim(),
        customer_name: custName.trim(),
        customer_phone: custPhone.trim() || 'N/A',
        customer_email: custEmail.trim() || '',
        occasion,
        design_category: designCategory,
        metal_karat: metalKarat,
        approx_weight_g: formCalculations.gross,
        net_weight_g: formCalculations.net,
        rate_policy: ratePolicy,
        locked_rate_per_g: ratePolicy === 'FIXED_LOCKED_RATE' ? parseFloat(lockedRate) || 0 : undefined,
        advance_received: formCalculations.advance,
        estimated_order_value: formCalculations.totalEst,
        balance_due: formCalculations.balance,
        due_date: dueDate,
        stage: 'CAD_DESIGN' as const,
        status: 'IN_PRODUCTION' as const,
        assigned_karigar: assignedKarigar,
        notes: notes.trim(),
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'sales_orders'), orderData);
      const newOrder: SalesOrder = { id: docRef.id, ...orderData };
      setOrders((prev) => [newOrder, ...prev]);
      setIsAddModalOpen(false);
      showToast('success', `Custom order ${newOrder.order_no} logged successfully.`);
    } catch (err: unknown) {
      console.error('Error saving order:', err);
      showToast('error', 'Failed to save order to Firestore.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStage = async (id: string, newStage: SalesOrder['stage']) => {
    try {
      const isReady = newStage === 'READY_FOR_DELIVERY';
      const updates: Partial<SalesOrder> = {
        stage: newStage,
        status: isReady ? 'COMPLETED' : 'IN_PRODUCTION',
      };
      await updateDoc(doc(db, 'sales_orders', id), updates);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, ...updates } : o))
      );
      showToast('success', `Order stage updated to ${newStage.replace(/_/g, ' ')}`);
    } catch (err: unknown) {
      console.error('Error updating stage:', err);
      showToast('error', 'Failed to update order stage.');
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteDoc(doc(db, 'sales_orders', id));
      setOrders((prev) => prev.filter((o) => o.id !== id));
      setDeleteConfirmId(null);
      showToast('success', 'Order record deleted.');
    } catch (err: unknown) {
      console.error('Error deleting order:', err);
      showToast('error', 'Failed to delete order.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const s = searchQuery.toLowerCase();
    const matchesSearch =
      o.order_no?.toLowerCase().includes(s) ||
      o.customer_name?.toLowerCase().includes(s) ||
      o.customer_phone?.toLowerCase().includes(s) ||
      o.design_category?.toLowerCase().includes(s) ||
      o.assigned_karigar?.toLowerCase().includes(s);
    const matchesStage = selectedStage === 'ALL' || o.stage === selectedStage;
    const matchesStatus = selectedStatus === 'ALL' || o.status === selectedStatus;
    return matchesSearch && matchesStage && matchesStatus;
  });

  const totalOrdersValue = orders.reduce((acc, curr) => acc + (curr.estimated_order_value || 0), 0);
  const totalAdvances = orders.reduce((acc, curr) => acc + (curr.advance_received || 0), 0);
  const inProductionCount = orders.filter((o) => o.status === 'IN_PRODUCTION').length;
  const readyCount = orders.filter((o) => o.stage === 'READY_FOR_DELIVERY').length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="sales_orders" />
      <ActionToolbar
        filterPlaceholder="Filter by order #, customer, occasion, karigar..."
        insertLabel="New Custom Order"
        onRefresh={fetchOrders}
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
                <span className="text-[11px] font-medium uppercase tracking-wider">Active In-Production</span>
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{inProductionCount}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">{readyCount} Ready for delivery</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Order Pipeline</span>
                <BadgeIndianRupee className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                ₹{totalOrdersValue.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Custom order book value</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Advances Collected</span>
                <Scale className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700">
                ₹{totalAdvances.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Booking cash & UPI receipts</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Outstanding Balance</span>
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                ₹{Math.max(0, totalOrdersValue - totalAdvances).toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">Payable on delivery</div>
            </div>
          </div>

          {/* Filters & Direct Links Bar */}
          <div className="bg-white p-3 rounded-lg border border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search order #, customer, occasion, karigar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-[#e2e8f0] rounded-md text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-500 font-medium">Stage:</span>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="px-2 py-1 border border-[#e2e8f0] rounded text-neutral-700 text-xs focus:outline-none"
                >
                  <option value="ALL">All Stages</option>
                  {PRODUCTION_STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-neutral-500 font-medium">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-2 py-1 border border-[#e2e8f0] rounded text-neutral-700 text-xs focus:outline-none"
                >
                  <option value="ALL">All Status</option>
                  <option value="IN_PRODUCTION">In Production</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <Link
                href="/sales/delivery-challans"
                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded font-medium text-[11px] flex items-center gap-1 transition-colors"
              >
                <span>Delivery Challans</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Table / Empty State */}
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center bg-white rounded-lg border border-[#e2e8f0]">
              <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mb-2" />
              <span className="text-xs text-neutral-500 font-medium">Loading custom orders from Firestore...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center bg-white rounded-lg border border-[#e2e8f0] text-center">
              <ShoppingBag className="w-10 h-10 text-neutral-300 mb-3 stroke-1" />
              <h3 className="text-sm font-medium text-neutral-800 mb-1">No Custom Orders Found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mb-4">
                {searchQuery
                  ? 'No orders match your filter criteria.'
                  : 'No custom jewellery orders placed yet. Log custom bridal, engagement or bespoke artisan orders.'}
              </p>
              <button
                onClick={handleOpenAddModal}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Custom Order</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-[#e2e8f0] text-neutral-600 font-medium text-[11px]">
                      <th className="py-2.5 px-3">Order # & Due</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Design & Karat</th>
                      <th className="py-2.5 px-2 text-right">Approx Wt</th>
                      <th className="py-2.5 px-3 text-right">Est. Value</th>
                      <th className="py-2.5 px-3 text-right">Advance Paid</th>
                      <th className="py-2.5 px-3 text-center">Manufacturing Stage</th>
                      <th className="py-2.5 px-3">Assigned Karigar</th>
                      <th className="py-2.5 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-medium text-neutral-800">
                          {o.order_no}
                          <div className="text-[10px] text-amber-700 font-sans flex items-center gap-1 mt-0.5">
                            <Calendar className="w-2.5 h-2.5" />
                            <span>Due: {o.due_date}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-neutral-800">{o.customer_name}</div>
                          <div className="text-[10px] text-neutral-400 font-mono">{o.customer_phone}</div>
                        </td>
                        <td className="py-2.5 px-3 max-w-xs">
                          <div className="truncate text-neutral-700 font-medium" title={o.design_category}>
                            {o.design_category}
                          </div>
                          <div className="text-[10px] text-neutral-500 font-mono">
                            {o.metal_karat} • {o.occasion}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-neutral-700">
                          {o.approx_weight_g?.toFixed(3)}g
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-neutral-800">
                          ₹{o.estimated_order_value?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-700">
                          ₹{o.advance_received?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <select
                            value={o.stage}
                            onChange={(e) => handleUpdateStage(o.id, e.target.value as any)}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium font-mono border focus:outline-none cursor-pointer ${
                              o.stage === 'READY_FOR_DELIVERY'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : o.stage === 'HALLMARK_HUID'
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {PRODUCTION_STAGES.map((st) => (
                              <option key={st.id} value={st.id}>
                                {st.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-3 text-neutral-600 text-[11px]">
                          {o.assigned_karigar}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOrder(o);
                                setIsJobCardModalOpen(true);
                              }}
                              className="p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-neutral-100 transition-colors"
                              title="View Order Job Card"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(o.id)}
                              className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete Order"
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

      {/* CREATE NEW CUSTOM ORDER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-5 border border-[#e2e8f0] animate-fadeIn text-xs max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-neutral-800 text-sm">Create Bespoke / Custom Sales Order</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Order Number *</label>
                  <input
                    type="text"
                    required
                    value={orderNo}
                    onChange={(e) => setOrderNo(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Occasion</label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Grand Wedding">Grand Wedding</option>
                    <option value="Engagement Ceremony">Engagement Ceremony</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Festival / Diwali">Festival / Diwali</option>
                    <option value="Daily Wear Custom">Daily Wear Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Target Delivery Date *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Customer Contact */}
              <div className="p-3 bg-neutral-50 rounded-lg border border-[#e2e8f0] space-y-2.5">
                <span className="font-medium text-neutral-700 block text-[11px] uppercase tracking-wider">
                  Customer Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Customer Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kavitha R"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] bg-white rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+91 98492 11044"
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] bg-white rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="kavitha@example.com"
                      value={custEmail}
                      onChange={(e) => setCustEmail(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] bg-white rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Jewellery Specifications */}
              <div className="space-y-3">
                <span className="font-medium text-neutral-700 block text-[11px] uppercase tracking-wider">
                  Design & Karigar Allocation
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-neutral-600 font-medium mb-1">Design Category & Details</label>
                    <input
                      type="text"
                      placeholder="e.g. Bridal Choker & Vaddanam Set"
                      value={designCategory}
                      onChange={(e) => setDesignCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Metal Karat</label>
                    <select
                      value={metalKarat}
                      onChange={(e) => setMetalKarat(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Gold 22K (916)">Gold 22K (916)</option>
                      <option value="Gold 18K (750)">Gold 18K (750)</option>
                      <option value="Gold 24K (999)">Gold 24K (999)</option>
                      <option value="Platinum 950">Platinum 950</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Approx Gross Wt (g) *</label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      placeholder="0.000"
                      value={approxGrossWeight}
                      onChange={(e) => {
                        setApproxGrossWeight(e.target.value);
                        if (!approxNetWeight) setApproxNetWeight(e.target.value);
                      }}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Approx Net Wt (g) *</label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      placeholder="0.000"
                      value={approxNetWeight}
                      onChange={(e) => setApproxNetWeight(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Rate Policy</label>
                    <select
                      value={ratePolicy}
                      onChange={(e) => setRatePolicy(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="FIXED_LOCKED_RATE">Fixed Locked Rate</option>
                      <option value="FLOATING_DAY_RATE">Floating Day Rate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Locked Rate (₹/g)</label>
                    <input
                      type="number"
                      value={lockedRate}
                      onChange={(e) => setLockedRate(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Advance Received (₹)</label>
                    <input
                      type="number"
                      value={advanceReceived}
                      onChange={(e) => setAdvanceReceived(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Assigned Karigar / Cell</label>
                    <input
                      type="text"
                      placeholder="e.g. Gopal Soni (Bengal Master)"
                      value={assignedKarigar}
                      onChange={(e) => setAssignedKarigar(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Special Crafting Notes & Stone Specs</label>
                  <textarea
                    rows={2}
                    placeholder="Custom sizing, special prong setting, antique matte finish..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Estimation Summary */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1.5">
                <div className="flex justify-between text-emerald-800">
                  <span>Estimated Total Order Value:</span>
                  <span className="font-mono font-medium">₹{formCalculations.totalEst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-700 text-[11px]">
                  <span>Advance Received:</span>
                  <span className="font-mono">₹{formCalculations.advance.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-900 font-medium text-sm pt-1 border-t border-emerald-300">
                  <span>Balance Due on Delivery:</span>
                  <span className="font-mono">₹{formCalculations.balance.toLocaleString('en-IN')}</span>
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
                  <span>{saving ? 'Saving...' : 'Book Custom Order'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW / PRINT JOB CARD MODAL */}
      {isJobCardModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-xl w-full p-6 border border-[#e2e8f0] animate-fadeIn text-xs max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] mb-4">
              <div>
                <h2 className="text-base font-medium text-neutral-800">KARIGAR WORK ORDER & JOB CARD</h2>
                <p className="text-[11px] text-neutral-500">Order #{selectedOrder.order_no} • Due: {selectedOrder.due_date}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsJobCardModalOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#e2e8f0] text-[11px]">
              <div>
                <span className="text-neutral-400 block font-medium">Customer:</span>
                <span className="font-medium text-neutral-800">{selectedOrder.customer_name}</span>
                <div className="text-neutral-500 font-mono">{selectedOrder.customer_phone}</div>
              </div>
              <div className="text-right">
                <span className="text-neutral-400 block font-medium">Assigned Artisan:</span>
                <span className="font-medium text-emerald-800">{selectedOrder.assigned_karigar}</span>
              </div>
              <div>
                <span className="text-neutral-400 block font-medium">Occasion:</span>
                <span className="font-medium text-neutral-800">{selectedOrder.occasion}</span>
              </div>
              <div className="text-right">
                <span className="text-neutral-400 block font-medium">Current Stage:</span>
                <span className="font-mono text-emerald-700 font-medium">{selectedOrder.stage}</span>
              </div>
            </div>

            {/* Spec */}
            <div className="py-3 border-b border-[#e2e8f0] space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-500">Design Category</span>
                <span className="font-medium text-neutral-800">{selectedOrder.design_category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Metal Purity Spec</span>
                <span className="font-mono font-medium text-neutral-800">{selectedOrder.metal_karat}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Target Gross Weight</span>
                <span className="font-mono font-medium text-neutral-800">{selectedOrder.approx_weight_g?.toFixed(3)}g</span>
              </div>
              {selectedOrder.notes && (
                <div className="pt-2 border-t border-[#e2e8f0]">
                  <span className="text-neutral-500 block mb-0.5">Karigar Notes:</span>
                  <p className="text-neutral-800 bg-neutral-50 p-2 rounded border border-[#e2e8f0]">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Financials */}
            <div className="py-3 border-b border-[#e2e8f0] space-y-1 text-[11px]">
              <div className="flex justify-between text-neutral-600">
                <span>Estimated Order Total</span>
                <span className="font-mono">₹{selectedOrder.estimated_order_value?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Advance Received</span>
                <span className="font-mono">₹{selectedOrder.advance_received?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-medium text-neutral-800 pt-1 border-t border-[#e2e8f0] text-xs">
                <span>Balance Payable</span>
                <span className="font-mono text-amber-700">
                  ₹{selectedOrder.balance_due?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-[10px] text-neutral-400">
                Authorized Workshop Job Sheet • jewellery-next
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsJobCardModalOpen(false)}
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
                  <span>Print Job Card</span>
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
            <h3 className="font-medium text-neutral-800 text-sm mb-2">Delete Custom Order?</h3>
            <p className="text-neutral-500 mb-4">
              Are you sure you want to delete this custom order? This will remove the production tracking record.
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
                onClick={() => handleDeleteOrder(deleteConfirmId)}
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
