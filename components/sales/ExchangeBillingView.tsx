'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import { SalesSubNav } from './SalesSubNav';
import {
  Coins,
  Flame,
  BadgeIndianRupee,
  Printer,
  X,
  Calculator,
  ShieldCheck,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  Eye,
  RefreshCw,
  Scale,
  ArrowRight,
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

export interface ExchangeBillRecord {
  id: string;
  exchange_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  ornament_description: string;
  old_gross_wt_g: number;
  dust_lac_deduction_g: number;
  stone_deduction_g: number;
  net_melt_wt_g: number;
  purity_percent: number;
  testing_method: 'TOUCHSTONE_ACID' | 'XRF_SPECTROMETER' | 'DENSITY_SCALE';
  net_fine_wt_g: number;
  scrap_rate_per_g: number;
  credit_amount: number;
  linked_bill_no: string;
  status: 'ADJUSTED_IN_INVOICE' | 'PENDING_OFFSET';
  created_at: string;
}

export function SalesExchangeBillingView() {
  const [exchanges, setExchanges] = useState<ExchangeBillRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ADJUSTED_IN_INVOICE' | 'PENDING_OFFSET'>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<ExchangeBillRecord | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [excId, setExcId] = useState('');
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [ornamentDesc, setOrnamentDesc] = useState('');
  const [grossWeight, setGrossWeight] = useState('');
  const [dustLac, setDustLac] = useState('0.500');
  const [stoneDed, setStoneDed] = useState('0.000');
  const [purityPercent, setPurityPercent] = useState('91.60');
  const [testingMethod, setTestingMethod] = useState<'TOUCHSTONE_ACID' | 'XRF_SPECTROMETER' | 'DENSITY_SCALE'>('XRF_SPECTROMETER');
  const [scrapRate, setScrapRate] = useState('7850');
  const [linkedBillNo, setLinkedBillNo] = useState('');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const fetchExchanges = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'sales_exchange_billing'));
      const list: ExchangeBillRecord[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<ExchangeBillRecord, 'id'>) });
      });
      list.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
      setExchanges(list);
    } catch (err: unknown) {
      console.error('Error fetching exchange records:', err);
      showToast('error', 'Failed to load old gold exchange records from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchanges();
  }, []);

  const handleOpenAddModal = () => {
    const yr = new Date().getFullYear();
    setExcId(`EXC-${yr}-${Math.floor(100 + Math.random() * 900)}`);
    setCustName('');
    setCustPhone('');
    setCustEmail('');
    setOrnamentDesc('');
    setGrossWeight('');
    setDustLac('0.500');
    setStoneDed('0.000');
    setPurityPercent('91.60');
    setTestingMethod('XRF_SPECTROMETER');
    setScrapRate('7850');
    setLinkedBillNo('');
    setIsAddModalOpen(true);
  };

  // Form Live Calculations
  const formCalculations = useMemo(() => {
    const gross = parseFloat(grossWeight) || 0;
    const dust = parseFloat(dustLac) || 0;
    const stone = parseFloat(stoneDed) || 0;
    const totalDeduction = dust + stone;
    const meltWt = Math.max(0, gross - totalDeduction);
    const purity = parseFloat(purityPercent) || 0;
    const fineWt = (meltWt * purity) / 100;
    const rate = parseFloat(scrapRate) || 0;
    const credit = Math.round(fineWt * rate);

    return { gross, dust, stone, totalDeduction, meltWt, purity, fineWt, rate, credit };
  }, [grossWeight, dustLac, stoneDed, purityPercent, scrapRate]);

  const handleCreateExchange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || formCalculations.gross <= 0) {
      showToast('error', 'Customer name and valid gross weight are required.');
      return;
    }

    try {
      setSaving(true);
      const exchangeData = {
        exchange_id: excId.trim(),
        customer_name: custName.trim(),
        customer_phone: custPhone.trim() || 'N/A',
        customer_email: custEmail.trim() || '',
        ornament_description: ornamentDesc.trim() || 'Old Gold Ornaments Scrap',
        old_gross_wt_g: formCalculations.gross,
        dust_lac_deduction_g: formCalculations.dust,
        stone_deduction_g: formCalculations.stone,
        net_melt_wt_g: Math.round(formCalculations.meltWt * 1000) / 1000,
        purity_percent: formCalculations.purity,
        testing_method: testingMethod,
        net_fine_wt_g: Math.round(formCalculations.fineWt * 1000) / 1000,
        scrap_rate_per_g: formCalculations.rate,
        credit_amount: formCalculations.credit,
        linked_bill_no: linkedBillNo.trim() || 'PENDING_OFFSET',
        status: (linkedBillNo.trim() ? 'ADJUSTED_IN_INVOICE' : 'PENDING_OFFSET') as ExchangeBillRecord['status'],
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'sales_exchange_billing'), exchangeData);
      const newRecord: ExchangeBillRecord = { id: docRef.id, ...exchangeData };
      setExchanges((prev) => [newRecord, ...prev]);
      setIsAddModalOpen(false);
      showToast('success', `Old gold exchange ${newRecord.exchange_id} recorded with ₹${newRecord.credit_amount.toLocaleString('en-IN')} credit.`);
    } catch (err: unknown) {
      console.error('Error saving exchange record:', err);
      showToast('error', 'Failed to save old gold exchange record.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: ExchangeBillRecord['status']) => {
    try {
      await updateDoc(doc(db, 'sales_exchange_billing', id), { status: newStatus });
      setExchanges((prev) => prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)));
      showToast('success', `Exchange status updated to ${newStatus.replace(/_/g, ' ')}`);
    } catch (err: unknown) {
      console.error('Error updating status:', err);
      showToast('error', 'Failed to update status.');
    }
  };

  const handleDeleteExchange = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteDoc(doc(db, 'sales_exchange_billing', id));
      setExchanges((prev) => prev.filter((e) => e.id !== id));
      setDeleteConfirmId(null);
      showToast('success', 'Exchange record deleted.');
    } catch (err: unknown) {
      console.error('Error deleting exchange:', err);
      showToast('error', 'Failed to delete exchange record.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredExchanges = exchanges.filter((e) => {
    const s = searchQuery.toLowerCase();
    const matchesSearch =
      e.exchange_id?.toLowerCase().includes(s) ||
      e.customer_name?.toLowerCase().includes(s) ||
      e.customer_phone?.toLowerCase().includes(s) ||
      e.ornament_description?.toLowerCase().includes(s) ||
      e.linked_bill_no?.toLowerCase().includes(s);
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    const matchesMethod = methodFilter === 'ALL' || e.testing_method === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const totalCreditIssued = exchanges.reduce((acc, curr) => acc + (curr.credit_amount || 0), 0);
  const totalOldGoldWeight = exchanges.reduce((acc, curr) => acc + (curr.old_gross_wt_g || 0), 0);
  const totalFineGoldMelted = exchanges.reduce((acc, curr) => acc + (curr.net_fine_wt_g || 0), 0);
  const pendingOffsetsCount = exchanges.filter((e) => e.status === 'PENDING_OFFSET').length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="sales_exchange_billing" />
      <ActionToolbar
        filterPlaceholder="Filter by exchange #, customer, description, bill..."
        insertLabel="New Exchange Entry"
        onRefresh={fetchExchanges}
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
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Exchanges</span>
                <Coins className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{exchanges.length}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">{pendingOffsetsCount} Pending bill offset</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Exchange Credit</span>
                <BadgeIndianRupee className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                ₹{totalCreditIssued.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Adjusted in sales invoices</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Gross Scrap Received</span>
                <Scale className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                {totalOldGoldWeight.toFixed(3)} <span className="text-xs text-neutral-500 font-normal">g</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Physical old ornaments</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Net Fine Content (24K)</span>
                <Flame className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-amber-700">
                {totalFineGoldMelted.toFixed(3)} <span className="text-xs text-neutral-500 font-normal">g</span>
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">Pure gold yield recovered</div>
            </div>
          </div>

          {/* Filters & Actions Bar */}
          <div className="bg-white p-3 rounded-lg border border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search exchange #, customer, scrap desc, bill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-[#e2e8f0] rounded-md text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-500 font-medium">Assay Method:</span>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="px-2 py-1 border border-[#e2e8f0] rounded text-neutral-700 text-xs focus:outline-none"
                >
                  <option value="ALL">All Methods</option>
                  <option value="XRF_SPECTROMETER">XRF Spectrometer</option>
                  <option value="TOUCHSTONE_ACID">Touchstone Acid</option>
                  <option value="DENSITY_SCALE">Density Scale</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-neutral-500 font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-2 py-1 border border-[#e2e8f0] rounded text-neutral-700 text-xs focus:outline-none"
                >
                  <option value="ALL">All Status</option>
                  <option value="ADJUSTED_IN_INVOICE">Adjusted in Invoice</option>
                  <option value="PENDING_OFFSET">Pending Offset</option>
                </select>
              </div>

              <Link
                href="/sales/billing-pos"
                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded font-medium text-[11px] flex items-center gap-1 transition-colors"
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
              <span className="text-xs text-neutral-500 font-medium">Loading old gold exchange records from Firestore...</span>
            </div>
          ) : filteredExchanges.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center bg-white rounded-lg border border-[#e2e8f0] text-center">
              <Coins className="w-10 h-10 text-neutral-300 mb-3 stroke-1" />
              <h3 className="text-sm font-medium text-neutral-800 mb-1">No Exchange Records Found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mb-4">
                {searchQuery
                  ? 'No old gold exchange records match your search.'
                  : 'No customer old gold scrap exchanges logged yet. Calculate melt weight and offset value against new jewellery purchases.'}
              </p>
              <button
                onClick={handleOpenAddModal}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Old Gold Exchange</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-[#e2e8f0] text-neutral-600 font-medium text-[11px]">
                      <th className="py-2.5 px-3">Exchange ID</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Scrap Description</th>
                      <th className="py-2.5 px-2 text-right">Old Gross</th>
                      <th className="py-2.5 px-2 text-right">Net Melt Wt</th>
                      <th className="py-2.5 px-2 text-right">Purity %</th>
                      <th className="py-2.5 px-2 text-right">Fine 24K Wt</th>
                      <th className="py-2.5 px-3 text-right">Credit Value</th>
                      <th className="py-2.5 px-3">Linked Bill</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {filteredExchanges.map((exc) => (
                      <tr key={exc.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-medium text-neutral-800">
                          {exc.exchange_id}
                          <div className="text-[10px] text-neutral-400 font-sans">
                            {exc.created_at ? new Date(exc.created_at).toLocaleDateString('en-IN') : 'Recent'}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-neutral-800">{exc.customer_name}</div>
                          <div className="text-[10px] text-neutral-400 font-mono">{exc.customer_phone}</div>
                        </td>
                        <td className="py-2.5 px-3 max-w-xs">
                          <div className="truncate text-neutral-700" title={exc.ornament_description}>
                            {exc.ornament_description}
                          </div>
                          <span className="text-[10px] font-mono text-neutral-500">
                            {exc.testing_method?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-neutral-700">
                          {exc.old_gross_wt_g?.toFixed(3)}g
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-neutral-700">
                          {exc.net_melt_wt_g?.toFixed(3)}g
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-neutral-700">
                          {exc.purity_percent?.toFixed(2)}%
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-amber-700 font-medium">
                          {exc.net_fine_wt_g?.toFixed(3)}g
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-700">
                          ₹{exc.credit_amount?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-neutral-600 text-[11px]">
                          {exc.linked_bill_no || 'UNLINKED'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium font-mono ${
                              exc.status === 'ADJUSTED_IN_INVOICE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {exc.status === 'ADJUSTED_IN_INVOICE' ? 'Adjusted' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedExchange(exc);
                                setIsReceiptModalOpen(true);
                              }}
                              className="p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-neutral-100 transition-colors"
                              title="View Exchange Assay Certificate"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateStatus(
                                  exc.id,
                                  exc.status === 'ADJUSTED_IN_INVOICE' ? 'PENDING_OFFSET' : 'ADJUSTED_IN_INVOICE'
                                )
                              }
                              className="p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-neutral-100 transition-colors"
                              title="Toggle Offset Status"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(exc.id)}
                              className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete Exchange Record"
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

      {/* CREATE NEW OLD GOLD EXCHANGE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-5 border border-[#e2e8f0] animate-fadeIn text-xs max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] mb-4">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-neutral-800 text-sm">Old Gold Valuation & Scrap Purchase</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExchange} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Exchange ID *</label>
                  <input
                    type="text"
                    required
                    value={excId}
                    onChange={(e) => setExcId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Linked Sales Bill # (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. POS-2026-1042"
                    value={linkedBillNo}
                    onChange={(e) => setLinkedBillNo(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Customer Info */}
              <div className="p-3 bg-neutral-50 rounded-lg border border-[#e2e8f0] space-y-2.5">
                <span className="font-medium text-neutral-700 block text-[11px] uppercase tracking-wider">
                  Customer Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Customer Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sunita Joshi"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] bg-white rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+91 98230 44512"
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] bg-white rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="sunita@example.com"
                      value={custEmail}
                      onChange={(e) => setCustEmail(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] bg-white rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Old Gold Valuation */}
              <div className="space-y-3">
                <span className="font-medium text-neutral-700 block text-[11px] uppercase tracking-wider">
                  Scrap Assay & Melt Breakdown
                </span>

                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Old Ornament Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Old Traditional Broad Kada & Scrap Bits"
                    value={ornamentDesc}
                    onChange={(e) => setOrnamentDesc(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Gross Scale Wt (g) *</label>
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
                    <label className="block text-neutral-600 font-medium mb-1">Dust / Lac Ded (g)</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="0.000"
                      value={dustLac}
                      onChange={(e) => setDustLac(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Stone Ded (g)</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="0.000"
                      value={stoneDed}
                      onChange={(e) => setStoneDed(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Net Melt Wt (g)</label>
                    <input
                      type="text"
                      disabled
                      value={`${formCalculations.meltWt.toFixed(3)} g`}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] bg-neutral-100 rounded font-mono text-neutral-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Assay Testing Method</label>
                    <select
                      value={testingMethod}
                      onChange={(e) => setTestingMethod(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="XRF_SPECTROMETER">XRF Spectrometer (Precision)</option>
                      <option value="TOUCHSTONE_ACID">Touchstone & Nitric Acid</option>
                      <option value="DENSITY_SCALE">Hydrostatic Density Scale</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Purity Tested (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={purityPercent}
                      onChange={(e) => setPurityPercent(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">Scrap Rate (₹/g)</label>
                    <input
                      type="number"
                      value={scrapRate}
                      onChange={(e) => setScrapRate(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Live Calculation Results */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1.5">
                <div className="flex justify-between text-emerald-800">
                  <span>Net Fine 24K Content:</span>
                  <span className="font-mono font-medium">{formCalculations.fineWt.toFixed(3)} g</span>
                </div>
                <div className="flex justify-between text-emerald-800 text-[11px]">
                  <span>Testing Purity Applied:</span>
                  <span className="font-mono">{formCalculations.purity.toFixed(2)}% ({testingMethod.replace(/_/g, ' ')})</span>
                </div>
                <div className="flex justify-between text-emerald-900 font-medium text-sm pt-1 border-t border-emerald-300">
                  <span>Old Gold Credit Valuation:</span>
                  <span className="font-mono">₹{formCalculations.credit.toLocaleString('en-IN')}</span>
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
                  <span>{saving ? 'Saving...' : 'Record Exchange Credit'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW / PRINT RECEIPT MODAL */}
      {isReceiptModalOpen && selectedExchange && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-xl w-full p-6 border border-[#e2e8f0] animate-fadeIn text-xs max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] mb-4">
              <div>
                <h2 className="text-base font-medium text-neutral-800">OLD GOLD VALUATION & ASSAY RECEIPT</h2>
                <p className="text-[11px] text-neutral-500">Ref #{selectedExchange.exchange_id} • Method: {selectedExchange.testing_method?.replace(/_/g, ' ')}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#e2e8f0] text-[11px]">
              <div>
                <span className="text-neutral-400 block font-medium">Customer:</span>
                <span className="font-medium text-neutral-800">{selectedExchange.customer_name}</span>
                <div className="text-neutral-500 font-mono">{selectedExchange.customer_phone}</div>
              </div>
              <div className="text-right">
                <span className="text-neutral-400 block font-medium">Valuation Date:</span>
                <span className="font-mono text-neutral-700">
                  {selectedExchange.created_at
                    ? new Date(selectedExchange.created_at).toLocaleDateString('en-IN')
                    : 'Today'}
                </span>
              </div>
              <div>
                <span className="text-neutral-400 block font-medium">Scrap Piece:</span>
                <span className="font-medium text-neutral-800">{selectedExchange.ornament_description}</span>
              </div>
              <div className="text-right">
                <span className="text-neutral-400 block font-medium">Linked Bill:</span>
                <span className="font-mono text-emerald-800">{selectedExchange.linked_bill_no || 'Pending Adjustment'}</span>
              </div>
            </div>

            <div className="py-3 border-b border-[#e2e8f0] space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-500">Physical Scale Gross Wt</span>
                <span className="font-mono">{selectedExchange.old_gross_wt_g?.toFixed(3)}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Dust & Stone Deductions</span>
                <span className="font-mono">
                  -{(selectedExchange.dust_lac_deduction_g + selectedExchange.stone_deduction_g).toFixed(3)}g
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-neutral-700">Net Melt Weight</span>
                <span className="font-mono text-neutral-800">{selectedExchange.net_melt_wt_g?.toFixed(3)}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Assay Tested Purity</span>
                <span className="font-mono">{selectedExchange.purity_percent?.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between font-medium text-amber-700">
                <span>Calculated Pure Fine 24K Gold</span>
                <span className="font-mono">{selectedExchange.net_fine_wt_g?.toFixed(3)}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Scrap Rate Applied</span>
                <span className="font-mono">₹{selectedExchange.scrap_rate_per_g}/g</span>
              </div>
              <div className="flex justify-between font-medium text-neutral-800 pt-2 border-t border-[#e2e8f0] text-xs">
                <span>Total Exchange Credit</span>
                <span className="font-mono text-emerald-700">
                  ₹{selectedExchange.credit_amount?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-[10px] text-neutral-400">
                Tested with XRF Spectrometer Assay • Certified Melt Value
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
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
            <h3 className="font-medium text-neutral-800 text-sm mb-2">Delete Exchange Record?</h3>
            <p className="text-neutral-500 mb-4">
              Are you sure you want to delete this old gold exchange entry? This cannot be undone.
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
                onClick={() => handleDeleteExchange(deleteConfirmId)}
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
