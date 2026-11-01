'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import { SalesSubNav } from './SalesSubNav';
import {
  Truck,
  Scale,
  CheckCircle2,
  X,
  BadgeIndianRupee,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Search,
  ExternalLink,
  Eye,
  RefreshCw,
  Printer,
  ShieldCheck,
  Calendar,
  ArrowRight,
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

export interface DeliveryChallan {
  id: string;
  challan_no: string;
  destination: string;
  recipient_name: string;
  recipient_phone: string;
  total_items: number;
  total_weight_g: number;
  security_seal_no: string;
  custodian: string;
  dispatched_at: string;
  return_due_date: string;
  approval_value: number;
  status: 'DISPATCHED' | 'PARTIALLY_SOLD' | 'FULLY_RETURNED';
  notes: string;
  created_at: string;
}

export function SalesDeliveryChallansView() {
  const [challans, setChallans] = useState<DeliveryChallan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DISPATCHED' | 'PARTIALLY_SOLD' | 'FULLY_RETURNED'>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<DeliveryChallan | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [challanNo, setChallanNo] = useState('');
  const [destination, setDestination] = useState('VIP Customer Home Trial');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [totalItems, setTotalItems] = useState('1');
  const [totalWeight, setTotalWeight] = useState('');
  const [securitySeal, setSecuritySeal] = useState('');
  const [custodian, setCustodian] = useState('M. Sridhar (Senior Sales Exec)');
  const [returnDueDate, setReturnDueDate] = useState('');
  const [approvalValue, setApprovalValue] = useState('');
  const [notes, setNotes] = useState('');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const fetchChallans = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'sales_delivery_challans'));
      const list: DeliveryChallan[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<DeliveryChallan, 'id'>) });
      });
      list.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
      setChallans(list);
    } catch (err: unknown) {
      console.error('Error fetching challans:', err);
      showToast('error', 'Failed to load delivery challans from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, []);

  const handleOpenAddModal = () => {
    const yr = new Date().getFullYear();
    setChallanNo(`DC-${yr}-${Math.floor(1000 + Math.random() * 9000)}`);
    setDestination('VIP Customer Home Trial');
    setRecipientName('');
    setRecipientPhone('');
    setTotalItems('1');
    setTotalWeight('');
    setSecuritySeal(`SLJ-SEAL-${Math.floor(1000 + Math.random() * 9000)}`);
    setCustodian('M. Sridhar (Senior Sales Exec)');
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setReturnDueDate(d.toISOString().split('T')[0]);
    setApprovalValue('');
    setNotes('');
    setIsAddModalOpen(true);
  };

  const handleCreateChallan = async (e: React.FormEvent) => {
    e.preventDefault();
    const wt = parseFloat(totalWeight) || 0;
    const val = parseFloat(approvalValue) || 0;
    if (!recipientName.trim() || wt <= 0) {
      showToast('error', 'Recipient name and valid total weight are required.');
      return;
    }

    try {
      setSaving(true);
      const challanData = {
        challan_no: challanNo.trim(),
        destination,
        recipient_name: recipientName.trim(),
        recipient_phone: recipientPhone.trim() || 'N/A',
        total_items: parseInt(totalItems) || 1,
        total_weight_g: wt,
        security_seal_no: securitySeal.trim(),
        custodian: custodian.trim(),
        dispatched_at: new Date().toISOString(),
        return_due_date: returnDueDate,
        approval_value: val,
        status: 'DISPATCHED' as const,
        notes: notes.trim(),
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'sales_delivery_challans'), challanData);
      const newChallan: DeliveryChallan = { id: docRef.id, ...challanData };
      setChallans((prev) => [newChallan, ...prev]);
      setIsAddModalOpen(false);
      showToast('success', `Delivery challan ${newChallan.challan_no} created successfully.`);
    } catch (err: unknown) {
      console.error('Error creating challan:', err);
      showToast('error', 'Failed to save delivery challan to Firestore.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: DeliveryChallan['status']) => {
    try {
      await updateDoc(doc(db, 'sales_delivery_challans', id), { status: newStatus });
      setChallans((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
      showToast('success', `Challan status updated to ${newStatus.replace(/_/g, ' ')}`);
    } catch (err: unknown) {
      console.error('Error updating status:', err);
      showToast('error', 'Failed to update challan status.');
    }
  };

  const handleDeleteChallan = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteDoc(doc(db, 'sales_delivery_challans', id));
      setChallans((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirmId(null);
      showToast('success', 'Challan record deleted.');
    } catch (err: unknown) {
      console.error('Error deleting challan:', err);
      showToast('error', 'Failed to delete delivery challan.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredChallans = challans.filter((c) => {
    const s = searchQuery.toLowerCase();
    const matchesSearch =
      c.challan_no?.toLowerCase().includes(s) ||
      c.recipient_name?.toLowerCase().includes(s) ||
      c.destination?.toLowerCase().includes(s) ||
      c.security_seal_no?.toLowerCase().includes(s) ||
      c.custodian?.toLowerCase().includes(s);
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalApprovalValue = challans.reduce((acc, curr) => acc + (curr.approval_value || 0), 0);
  const activeDispatchedCount = challans.filter((c) => c.status === 'DISPATCHED').length;
  const totalWeightOut = challans.reduce((acc, curr) => acc + (curr.total_weight_g || 0), 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="sales_delivery_challans" />
      <ActionToolbar
        filterPlaceholder="Filter by challan #, recipient, destination, seal..."
        insertLabel="New Delivery Challan"
        onRefresh={fetchChallans}
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
                <span className="text-[11px] font-medium uppercase tracking-wider">Active Dispatched</span>
                <Truck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{activeDispatchedCount}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">{challans.length} Total logged</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Out on Approval Val</span>
                <BadgeIndianRupee className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                ₹{totalApprovalValue.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Transit insured valuation</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Weight Out</span>
                <Scale className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                {totalWeightOut.toFixed(3)} <span className="text-xs text-neutral-500 font-normal">g</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Consignment gold content</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Reconciled Status</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700">
                {challans.filter((c) => c.status === 'FULLY_RETURNED').length} Returned
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">Zero weight variance</div>
            </div>
          </div>

          {/* Filters & Actions Bar */}
          <div className="bg-white p-3 rounded-lg border border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search challan #, recipient, destination, seal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-[#e2e8f0] rounded-md text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500 font-medium">Status:</span>
              {(['ALL', 'DISPATCHED', 'PARTIALLY_SOLD', 'FULLY_RETURNED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    statusFilter === st
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-neutral-50 text-neutral-600 border border-[#e2e8f0] hover:bg-neutral-100'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}

              <Link
                href="/inventory/ornaments"
                className="ml-2 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded font-medium text-[11px] flex items-center gap-1 transition-colors"
              >
                <span>Stock Vault</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Table / Empty State */}
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center bg-white rounded-lg border border-[#e2e8f0]">
              <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mb-2" />
              <span className="text-xs text-neutral-500 font-medium">Loading delivery challans from Firestore...</span>
            </div>
          ) : filteredChallans.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center bg-white rounded-lg border border-[#e2e8f0] text-center">
              <Truck className="w-10 h-10 text-neutral-300 mb-3 stroke-1" />
              <h3 className="text-sm font-medium text-neutral-800 mb-1">No Delivery Challans Found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mb-4">
                {searchQuery
                  ? 'No delivery challans match your search query.'
                  : 'No out-on-approval challans or gate passes logged yet. Dispatch jewellery for home trial, exhibitions or photoshoots.'}
              </p>
              <button
                onClick={handleOpenAddModal}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Delivery Challan</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-[#e2e8f0] text-neutral-600 font-medium text-[11px]">
                      <th className="py-2.5 px-3">Challan #</th>
                      <th className="py-2.5 px-3">Destination</th>
                      <th className="py-2.5 px-3">Recipient</th>
                      <th className="py-2.5 px-2 text-right">Items</th>
                      <th className="py-2.5 px-2 text-right">Total Wt</th>
                      <th className="py-2.5 px-3 text-right">Approval Value</th>
                      <th className="py-2.5 px-3">Security Seal</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {filteredChallans.map((c) => (
                      <tr key={c.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-medium text-neutral-800">
                          {c.challan_no}
                          <div className="text-[10px] text-neutral-400 font-sans">
                            Due: {c.return_due_date || 'Same Day'}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-neutral-800">{c.destination}</div>
                          <div className="text-[10px] text-neutral-500 font-mono">Custodian: {c.custodian}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-neutral-800">{c.recipient_name}</div>
                          <div className="text-[10px] text-neutral-400 font-mono">{c.recipient_phone}</div>
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-neutral-700">
                          {c.total_items}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-neutral-700">
                          {c.total_weight_g?.toFixed(3)}g
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-700">
                          ₹{c.approval_value?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-600">
                          {c.security_seal_no || 'SEAL-OK'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <select
                            value={c.status}
                            onChange={(e) => handleUpdateStatus(c.id, e.target.value as any)}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium font-mono border focus:outline-none cursor-pointer ${
                              c.status === 'FULLY_RETURNED'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : c.status === 'DISPATCHED'
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-blue-100 text-blue-800 border-blue-300'
                            }`}
                          >
                            <option value="DISPATCHED">Dispatched</option>
                            <option value="PARTIALLY_SOLD">Partially Sold</option>
                            <option value="FULLY_RETURNED">Fully Returned</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedChallan(c);
                                setIsViewModalOpen(true);
                              }}
                              className="p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-neutral-100 transition-colors"
                              title="View Gate Pass"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(c.id)}
                              className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete Challan"
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

      {/* CREATE NEW CHALLAN MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-5 border border-[#e2e8f0] animate-fadeIn text-xs max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] mb-4">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-neutral-800 text-sm">Issue Outward Delivery Challan / Gate Pass</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateChallan} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Challan No *</label>
                  <input
                    type="text"
                    required
                    value={challanNo}
                    onChange={(e) => setChallanNo(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Destination Purpose</label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="VIP Customer Home Trial">VIP Customer Home Trial</option>
                    <option value="Jewellery Exhibition Stall">Jewellery Exhibition Stall</option>
                    <option value="Celebrity Photoshoot Approval">Celebrity Photoshoot Approval</option>
                    <option value="Branch Consignment">Branch Consignment</option>
                    <option value="Goldsmith Repair / Jobwork">Goldsmith Repair / Jobwork</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Return Due Date</label>
                  <input
                    type="date"
                    required
                    value={returnDueDate}
                    onChange={(e) => setReturnDueDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Recipient & Custodian */}
              <div className="p-3 bg-neutral-50 rounded-lg border border-[#e2e8f0] space-y-2.5">
                <span className="font-medium text-neutral-700 block text-[11px] uppercase tracking-wider">
                  Recipient & Security Custodian
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Recipient / Location Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Smt. Shailaja Reddy"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] bg-white rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Recipient Phone</label>
                    <input
                      type="text"
                      placeholder="+91 98490 88120"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] bg-white rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Escort / Custodian</label>
                    <input
                      type="text"
                      value={custodian}
                      onChange={(e) => setCustodian(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] bg-white rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Items & Weights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Total Pieces / Items</label>
                  <input
                    type="number"
                    value={totalItems}
                    onChange={(e) => setTotalItems(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Total Scale Weight (g) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="0.000"
                    value={totalWeight}
                    onChange={(e) => setTotalWeight(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Insurance / Approval Value (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={approvalValue}
                    onChange={(e) => setApprovalValue(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">Security Seal Number</label>
                <input
                  type="text"
                  placeholder="SLJ-SEAL-8910"
                  value={securitySeal}
                  onChange={(e) => setSecuritySeal(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono uppercase text-neutral-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">Itemized Ornaments Breakdown</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Emerald Diamond Choker (24.5g), Polki Jhumkas (14.2g), Antique Kada pair (23.7g)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                />
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
                  <span>{saving ? 'Generating...' : 'Issue Delivery Challan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW / PRINT GATE PASS MODAL */}
      {isViewModalOpen && selectedChallan && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-xl w-full p-6 border border-[#e2e8f0] animate-fadeIn text-xs max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] mb-4">
              <div>
                <h2 className="text-base font-medium text-neutral-800">OUTWARD DELIVERY CHALLAN & GATE PASS</h2>
                <p className="text-[11px] text-neutral-500">Challan #{selectedChallan.challan_no} • Security Seal #{selectedChallan.security_seal_no}</p>
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
                <span className="text-neutral-400 block font-medium">Destination:</span>
                <span className="font-medium text-neutral-800">{selectedChallan.destination}</span>
              </div>
              <div className="text-right">
                <span className="text-neutral-400 block font-medium">Return Due Date:</span>
                <span className="font-mono text-neutral-700">{selectedChallan.return_due_date}</span>
              </div>
              <div>
                <span className="text-neutral-400 block font-medium">Recipient:</span>
                <span className="font-medium text-neutral-800">{selectedChallan.recipient_name}</span>
                <div className="text-neutral-500 font-mono">{selectedChallan.recipient_phone}</div>
              </div>
              <div className="text-right">
                <span className="text-neutral-400 block font-medium">Custodian / Escort:</span>
                <span className="font-medium text-emerald-800">{selectedChallan.custodian}</span>
              </div>
            </div>

            <div className="py-3 border-b border-[#e2e8f0] space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-500">Total Items Dispatched</span>
                <span className="font-mono font-medium text-neutral-800">{selectedChallan.total_items} Pcs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Physical Scale Weight</span>
                <span className="font-mono font-medium text-neutral-800">{selectedChallan.total_weight_g?.toFixed(3)}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Transit Insurance Value</span>
                <span className="font-mono font-medium text-emerald-700">
                  ₹{selectedChallan.approval_value?.toLocaleString('en-IN')}
                </span>
              </div>
              {selectedChallan.notes && (
                <div className="pt-2 border-t border-[#e2e8f0]">
                  <span className="text-neutral-500 block mb-0.5">Itemized List:</span>
                  <p className="text-neutral-800 bg-neutral-50 p-2 rounded border border-[#e2e8f0]">
                    {selectedChallan.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-[10px] text-neutral-400">
                Official Delivery Gate Pass • Insured Jewellery in Transit
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
                  <span>Print Gate Pass</span>
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
            <h3 className="font-medium text-neutral-800 text-sm mb-2">Delete Delivery Challan?</h3>
            <p className="text-neutral-500 mb-4">
              Are you sure you want to delete this delivery challan? This cannot be undone.
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
                onClick={() => handleDeleteChallan(deleteConfirmId)}
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
