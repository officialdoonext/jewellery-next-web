'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Scale,
  Sparkles,
  Calculator,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Plus,
  Coins,
  ShieldCheck,
  Flame,
  FileSpreadsheet,
  X,
  Printer,
  Eye,
  User,
  Phone,
  ArrowRight,
  Loader2,
  Trash2,
  Percent,
  Gem,
  Layers,
  Store,
  ExternalLink,
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

export interface OldGoldSlip {
  id: string;
  slip_no: string;
  customer_name: string;
  customer_phone: string;
  gross_weight_g: number;
  deductions_g: number;
  net_weight_g: number;
  assessed_purity_pct: number;
  fine_gold_equivalent_g: number;
  buy_rate_per_g: number;
  final_payable_inr: number;
  testing_method: 'XRF_SPECTROMETER' | 'TOUCHSTONE_NITRIC' | 'SPECIFIC_GRAVITY' | 'FIRE_ASSAY';
  status: 'ACCEPTED_IN_BILL' | 'PENDING_MELT' | 'SETTLED_CASH' | 'ARCHIVED';
  melting_loss_pct?: number;
  valuer_notes?: string;
  created_at: string;
}

export function RatesOldGoldValuationView() {
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [slips, setSlips] = useState<OldGoldSlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACCEPTED_IN_BILL' | 'PENDING_MELT' | 'SETTLED_CASH'>('ALL');

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Modal State: New Slip
  const [isNewSlipModalOpen, setIsNewSlipModalOpen] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [grossWt, setGrossWt] = useState('24.500');
  const [deductionsWt, setDeductionsWt] = useState('2.100');
  const [purityPct, setPurityPct] = useState('88.5');
  const [meltingLossPct, setMeltingLossPct] = useState('1.0');
  const [buyRateG, setBuyRateG] = useState('8010');
  const [testMethod, setTestMethod] = useState<OldGoldSlip['testing_method']>('XRF_SPECTROMETER');
  const [settlementStatus, setSettlementStatus] = useState<OldGoldSlip['status']>('ACCEPTED_IN_BILL');
  const [ornamentNotes, setOrnamentNotes] = useState('Old traditional gold chain and studs');

  // Slip Details / Print Preview Modal
  const [selectedSlip, setSelectedSlip] = useState<OldGoldSlip | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const fetchSlips = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'rates_old_gold_valuation'));
      const list: OldGoldSlip[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<OldGoldSlip, 'id'>) });
      });
      list.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
      setSlips(list);
    } catch (err: any) {
      console.error('Error fetching old gold slips:', err);
      showToast('error', err.message || 'Failed to fetch valuation slips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlips();
  }, []);

  // Compute live values for modal
  const calcGross = parseFloat(grossWt) || 0;
  const calcDeduct = parseFloat(deductionsWt) || 0;
  const calcNet = Math.max(0, calcGross - calcDeduct);
  const calcPurity = parseFloat(purityPct) || 0;
  const calcLoss = parseFloat(meltingLossPct) || 0;
  const calcFineEquivalent = calcNet * (calcPurity / 100) * ((100 - calcLoss) / 100);
  const calcBuyRate = parseFloat(buyRateG) || 8010;
  const calcPayable = Math.round(calcFineEquivalent * calcBuyRate);

  const handleCreateSlip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim()) return;

    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeStr = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const slipNumber = `OGV-${new Date().getFullYear()}-${String(slips.length + 1).padStart(3, '0')}`;

    const newSlip: Omit<OldGoldSlip, 'id'> = {
      slip_no: slipNumber,
      customer_name: custName.trim(),
      customer_phone: custPhone.trim() || '+91 98000 00000',
      gross_weight_g: calcGross,
      deductions_g: calcDeduct,
      net_weight_g: Math.round(calcNet * 1000) / 1000,
      assessed_purity_pct: calcPurity,
      melting_loss_pct: calcLoss,
      fine_gold_equivalent_g: Math.round(calcFineEquivalent * 1000) / 1000,
      buy_rate_per_g: calcBuyRate,
      final_payable_inr: calcPayable,
      testing_method: testMethod,
      status: settlementStatus,
      valuer_notes: ornamentNotes.trim(),
      created_at: `${dateStr} ${timeStr}`,
    };

    try {
      setSaving(true);
      const docRef = await addDoc(collection(db, 'rates_old_gold_valuation'), newSlip);
      setSlips((prev) => [{ id: docRef.id, ...newSlip }, ...prev]);
      setIsNewSlipModalOpen(false);
      showToast('success', `Valuation slip ${slipNumber} issued for ₹${calcPayable.toLocaleString('en-IN')}`);
      setCustName('');
      setCustPhone('');
    } catch (err: any) {
      console.error('Error creating slip:', err);
      showToast('error', err.message || 'Failed to create valuation slip');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: OldGoldSlip['status']) => {
    try {
      await updateDoc(doc(db, 'rates_old_gold_valuation', id), { status: newStatus });
      setSlips((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      );
      showToast('success', `Slip marked as ${newStatus.replace(/_/g, ' ')}`);
    } catch (err: any) {
      console.error('Error updating slip status:', err);
      showToast('error', err.message || 'Failed to update slip status');
    }
  };

  const handleDeleteSlip = async (id: string, slipNo: string) => {
    if (!confirm(`Delete old gold valuation slip "${slipNo}"?`)) return;
    try {
      await deleteDoc(doc(db, 'rates_old_gold_valuation', id));
      setSlips((prev) => prev.filter((s) => s.id !== id));
      showToast('success', `Slip "${slipNo}" deleted.`);
    } catch (err: any) {
      console.error('Error deleting slip:', err);
      showToast('error', err.message || 'Failed to delete slip');
    }
  };

  const filteredSlips = slips.filter((s) => {
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        s.slip_no.toLowerCase().includes(q) ||
        s.customer_name.toLowerCase().includes(q) ||
        s.customer_phone.toLowerCase().includes(q) ||
        s.testing_method.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Totals
  const totalFinePurchased = slips.reduce((acc, s) => acc + (s.fine_gold_equivalent_g || 0), 0);
  const totalValuationPayable = slips.reduce((acc, s) => acc + (s.final_payable_inr || 0), 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="rates_old_gold_valuation" />
      <ActionToolbar
        filterPlaceholder="Search old gold slips by customer name, slip number, phone..."
        insertLabel="New Assay Slip"
        onInsertClick={() => setIsNewSlipModalOpen(true)}
        onRefresh={fetchSlips}
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

          {/* Cross-Module Navigation Hub */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-[#e2e8f0] rounded-lg shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Rates & Valuation Hub:
              </span>
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <Link
                  href="/rates/gold-rates"
                  className="px-2.5 py-1 bg-white border border-neutral-200 text-neutral-600 hover:text-emerald-700 hover:border-emerald-200 rounded-md font-medium text-xs flex items-center gap-1 transition-colors"
                >
                  <Coins className="w-3 h-3 text-neutral-400" /> Gold Rates
                </Link>
                <Link
                  href="/rates/silver-rates"
                  className="px-2.5 py-1 bg-white border border-neutral-200 text-neutral-600 hover:text-emerald-700 hover:border-emerald-200 rounded-md font-medium text-xs flex items-center gap-1 transition-colors"
                >
                  <Scale className="w-3 h-3 text-neutral-400" /> Silver Bullion
                </Link>
                <Link
                  href="/rates/making-charges"
                  className="px-2.5 py-1 bg-white border border-neutral-200 text-neutral-600 hover:text-emerald-700 hover:border-emerald-200 rounded-md font-medium text-xs flex items-center gap-1 transition-colors"
                >
                  <Percent className="w-3 h-3 text-neutral-400" /> Making Charges
                </Link>
                <Link
                  href="/rates/wastage-rules"
                  className="px-2.5 py-1 bg-white border border-neutral-200 text-neutral-600 hover:text-emerald-700 hover:border-emerald-200 rounded-md font-medium text-xs flex items-center gap-1 transition-colors"
                >
                  <Layers className="w-3 h-3 text-neutral-400" /> Wastage (VA)
                </Link>
                <Link
                  href="/rates/diamond-valuation"
                  className="px-2.5 py-1 bg-white border border-neutral-200 text-neutral-600 hover:text-emerald-700 hover:border-emerald-200 rounded-md font-medium text-xs flex items-center gap-1 transition-colors"
                >
                  <Gem className="w-3 h-3 text-neutral-400" /> Diamond 4Cs
                </Link>
                <Link
                  href="/rates/old-gold-valuation"
                  className="px-2.5 py-1 bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-md font-medium text-xs flex items-center gap-1 shadow-2xs"
                >
                  <Flame className="w-3 h-3 text-emerald-600" /> Old Gold Assay
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/sales/exchange-billing"
                className="text-xs px-2.5 py-1 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-md font-medium flex items-center gap-1 transition-colors shadow-2xs"
                title="Credit into Exchange Bill"
              >
                <Store className="w-3 h-3 text-emerald-600" />
                <span>Exchange Billing</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </Link>
              <Link
                href="/sales/billing-pos"
                className="text-xs px-2.5 py-1 bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-300 rounded-md font-medium flex items-center gap-1 transition-colors shadow-2xs"
                title="Use in POS Counter"
              >
                <span>POS Billing</span>
                <ExternalLink className="w-2.5 h-2.5 text-neutral-400" />
              </Link>
              <Link
                href="/branches/rates"
                className="text-xs px-2.5 py-1 bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-300 rounded-md font-medium flex items-center gap-1 transition-colors shadow-2xs"
                title="Branch Rate Adjustments"
              >
                <span>Branch Rates</span>
              </Link>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Assay Slips</span>
                <Receipt className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{slips.length}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Recorded scrap transactions</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Fine Gold Acquired</span>
                <Scale className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700">
                {totalFinePurchased.toFixed(3)} g
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Net pure 999 equivalent</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Valuation Value</span>
                <Coins className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                ₹ {totalValuationPayable.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Customer credit / payouts</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Testing Standard</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">XRF Certified</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Non-destructive spectrometer</div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-2xs overflow-hidden flex flex-col">
            <div className="p-3 border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-neutral-800">Old Gold Valuation & Assay Slips</span>
                  <span className="text-[10px] text-neutral-400 font-mono bg-neutral-100 px-1.5 py-0.5 rounded">
                    rates_old_gold_valuation
                  </span>
                </div>

                <div className="h-4 w-[1px] bg-neutral-200" />

                <div className="flex items-center gap-1 bg-[#f1f5f9] p-0.5 rounded">
                  <button
                    onClick={() => setActiveTab('data')}
                    className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors ${
                      activeTab === 'data'
                        ? 'bg-white text-neutral-800 shadow-2xs'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    Slips ({filteredSlips.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('definition')}
                    className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors ${
                      activeTab === 'definition'
                        ? 'bg-white text-neutral-800 shadow-2xs'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    Schema Definition
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="text-xs px-2 py-1 border border-[#e2e8f0] rounded bg-white text-neutral-700 focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACCEPTED_IN_BILL">Accepted in Bill</option>
                  <option value="PENDING_MELT">Pending Melt</option>
                  <option value="SETTLED_CASH">Settled Cash</option>
                </select>

                <button
                  onClick={() => setIsNewSlipModalOpen(true)}
                  className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium flex items-center gap-1 transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Assay Slip</span>
                </button>
              </div>
            </div>

            {activeTab === 'data' && (
              <>
                {loading ? (
                  <div className="p-12 flex flex-col items-center justify-center gap-3 text-neutral-500">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                    <span className="text-xs font-medium">Loading old gold slips from Firestore...</span>
                  </div>
                ) : filteredSlips.length === 0 ? (
                  <div className="p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3">
                      <Flame className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-sm font-medium text-neutral-800 mb-1">No Valuation Slips Found</h3>
                    <p className="text-xs text-neutral-500 mb-4">
                      Create old gold assessment slips with gross weight, enamel/stone deductions, XRF purity testing, and melting loss to calculate exact exchange or payout values.
                    </p>
                    <button
                      onClick={() => setIsNewSlipModalOpen(true)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create First Assay Slip</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 overflow-x-auto custom-scrollbar w-full">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#fcfcfc] border-b border-[#e5e7eb] text-neutral-600 font-mono text-[11px]">
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                            slip_no
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                            customer
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                            gross_wt
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                            deductions
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                            net_wt
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                            purity_%
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                            fine_gold_eq
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                            buy_rate
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                            payable_amount
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                            method
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium text-center whitespace-nowrap">
                            status
                          </th>
                          <th className="px-3 py-2 font-medium text-right whitespace-nowrap">
                            actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e5e7eb]">
                        {filteredSlips.map((row) => (
                          <tr key={row.id} className="hover:bg-[#f8fafc] transition-colors">
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-neutral-800 font-medium">
                              {row.slip_no}
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="text-neutral-900 font-medium">{row.customer_name}</span>
                                <span className="text-[10px] text-neutral-400 font-mono">{row.customer_phone}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono text-neutral-700">
                              {Number(row.gross_weight_g).toFixed(3)} g
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono text-red-600">
                              -{Number(row.deductions_g).toFixed(3)} g
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono text-neutral-900 font-medium">
                              {Number(row.net_weight_g).toFixed(3)} g
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono text-neutral-700">
                              {Number(row.assessed_purity_pct).toFixed(1)}%
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono text-emerald-700 font-medium">
                              {Number(row.fine_gold_equivalent_g).toFixed(3)} g
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono text-neutral-700">
                              ₹ {row.buy_rate_per_g?.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono font-medium text-emerald-700">
                              ₹ {row.final_payable_inr?.toLocaleString('en-IN')}
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                              <span className="text-[10px] font-mono text-neutral-600 bg-neutral-100 px-1 py-0.5 rounded">
                                {row.testing_method.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-center">
                              <select
                                value={row.status}
                                onChange={(e) => handleUpdateStatus(row.id, e.target.value as any)}
                                className={`text-[10px] px-2 py-0.5 rounded-full font-medium border focus:outline-none cursor-pointer ${
                                  row.status === 'ACCEPTED_IN_BILL'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : row.status === 'SETTLED_CASH'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                <option value="ACCEPTED_IN_BILL">Accepted in Bill</option>
                                <option value="SETTLED_CASH">Settled Cash</option>
                                <option value="PENDING_MELT">Pending Melt</option>
                                <option value="ARCHIVED">Archived</option>
                              </select>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => setSelectedSlip(row)}
                                  className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                                  title="View Slip Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSlip(row.id, row.slip_no)}
                                  className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50"
                                  title="Delete Slip"
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
                )}
              </>
            )}

            {activeTab === 'definition' && (
              <div className="p-4 bg-[#fbfbfb] text-xs font-mono">
                <div className="bg-neutral-900 text-neutral-100 p-4 rounded-md overflow-x-auto shadow-inner text-[11px] leading-relaxed">
                  <span className="text-emerald-400">CREATE TABLE</span> public.rates_old_gold_valuation (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">slip_no</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">NOT NULL UNIQUE,</span>
                  <br />
                  <span className="pl-6 text-blue-300">customer_name</span>{' '}
                  <span className="text-amber-300">varchar(128)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">customer_phone</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>,
                  <br />
                  <span className="pl-6 text-blue-300">gross_weight_g</span>{' '}
                  <span className="text-amber-300">numeric(8,3)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">deductions_g</span>{' '}
                  <span className="text-amber-300">numeric(8,3)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0,</span>
                  <br />
                  <span className="pl-6 text-blue-300">net_weight_g</span>{' '}
                  <span className="text-amber-300">numeric(8,3)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">assessed_purity_pct</span>{' '}
                  <span className="text-amber-300">numeric(5,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">fine_gold_equivalent_g</span>{' '}
                  <span className="text-amber-300">numeric(8,3)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">buy_rate_per_g</span>{' '}
                  <span className="text-amber-300">numeric(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">final_payable_inr</span>{' '}
                  <span className="text-amber-300">numeric(12,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">testing_method</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>,
                  <br />
                  <span className="pl-6 text-blue-300">status</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;ACCEPTED_IN_BILL&apos;</span>
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Slip Modal */}
      {isNewSlipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-medium text-neutral-800">New Old Gold Assay & Valuation Slip</h2>
              </div>
              <button
                onClick={() => setIsNewSlipModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSlip} className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. Pooja Agarwal"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Mobile Contact</label>
                  <input
                    type="text"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    placeholder="+91 98490 12891"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Gross Weight (Grams) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={grossWt}
                    onChange={(e) => setGrossWt(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Deductions (Stones, Wax, Enamel)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={deductionsWt}
                    onChange={(e) => setDeductionsWt(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none text-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Assessed Purity (%) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={purityPct}
                    onChange={(e) => setPurityPct(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Melting Loss (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={meltingLossPct}
                    onChange={(e) => setMeltingLossPct(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Buy Rate (₹ / g) *</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={buyRateG}
                    onChange={(e) => setBuyRateG(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Testing Technique</label>
                  <select
                    value={testMethod}
                    onChange={(e) => setTestMethod(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="XRF_SPECTROMETER">XRF Spectrometer (Non-Destructive)</option>
                    <option value="TOUCHSTONE_NITRIC">Touchstone & Nitric Acid</option>
                    <option value="SPECIFIC_GRAVITY">Specific Gravity Balance</option>
                    <option value="FIRE_ASSAY">Fire Assay (Cupellation)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Settlement Status</label>
                  <select
                    value={settlementStatus}
                    onChange={(e) => setSettlementStatus(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="ACCEPTED_IN_BILL">Accepted in Bill (Exchange Credit)</option>
                    <option value="SETTLED_CASH">Settled Cash / Direct Payout</option>
                    <option value="PENDING_MELT">Pending Ingot Melt Verification</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Article Notes / Description</label>
                <input
                  type="text"
                  value={ornamentNotes}
                  onChange={(e) => setOrnamentNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. 2 pair gold bangles with lac filling removed"
                />
              </div>

              {/* Live Calculation Preview */}
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded p-2.5 space-y-1.5">
                <span className="text-[10px] font-medium uppercase text-neutral-500 tracking-wider">
                  Valuation Computed Breakdown:
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono">
                  <div className="p-1.5 bg-white border border-[#e2e8f0] rounded">
                    <div className="text-neutral-500 text-[10px]">Net Weight</div>
                    <div className="font-medium text-neutral-800">{calcNet.toFixed(3)} g</div>
                  </div>
                  <div className="p-1.5 bg-white border border-[#e2e8f0] rounded">
                    <div className="text-neutral-500 text-[10px]">Fine 999 Gold</div>
                    <div className="font-medium text-emerald-700">{calcFineEquivalent.toFixed(3)} g</div>
                  </div>
                  <div className="p-1.5 bg-white border border-[#e2e8f0] rounded">
                    <div className="text-neutral-500 text-[10px]">Final Payout</div>
                    <div className="font-medium text-emerald-700">₹{calcPayable.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setIsNewSlipModalOpen(false)}
                  className="px-3 py-1.5 border border-[#e2e8f0] text-neutral-600 rounded text-xs hover:bg-neutral-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Issuing...</span>
                    </>
                  ) : (
                    <>
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Issue Slip & Save</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slip Details / Inspection Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-md overflow-hidden text-xs">
            <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-medium text-neutral-800">
                  Valuation Voucher {selectedSlip.slip_no}
                </h2>
              </div>
              <button
                onClick={() => setSelectedSlip(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2">
                <div>
                  <div className="font-medium text-neutral-800 text-sm">{selectedSlip.customer_name}</div>
                  <div className="text-neutral-400 font-mono text-[11px]">{selectedSlip.customer_phone}</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {selectedSlip.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-neutral-600">
                <div>Gross Weight:</div>
                <div className="font-mono text-neutral-800 text-right">{selectedSlip.gross_weight_g} g</div>
                <div>Deductions:</div>
                <div className="font-mono text-red-600 text-right">-{selectedSlip.deductions_g} g</div>
                <div>Net Weight:</div>
                <div className="font-mono text-neutral-800 font-medium text-right">{selectedSlip.net_weight_g} g</div>
                <div>Assessed Purity:</div>
                <div className="font-mono text-neutral-800 text-right">{selectedSlip.assessed_purity_pct}%</div>
                <div>Fine Gold (999 eq):</div>
                <div className="font-mono text-emerald-700 font-medium text-right">
                  {selectedSlip.fine_gold_equivalent_g} g
                </div>
                <div>Buy Rate Applied:</div>
                <div className="font-mono text-neutral-800 text-right">₹{selectedSlip.buy_rate_per_g}/g</div>
                <div>Testing Method:</div>
                <div className="font-mono text-neutral-800 text-right">
                  {selectedSlip.testing_method.replace(/_/g, ' ')}
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded border border-emerald-200 flex items-center justify-between">
                <span className="text-emerald-900 font-medium">Final Credit / Payable:</span>
                <span className="text-base font-mono font-medium text-emerald-800">
                  ₹{selectedSlip.final_payable_inr?.toLocaleString('en-IN')}
                </span>
              </div>

              {selectedSlip.valuer_notes && (
                <div className="text-[11px] text-neutral-500 italic bg-neutral-50 p-2 rounded border border-[#e2e8f0]">
                  Notes: {selectedSlip.valuer_notes}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-[#e2e8f0]">
                <Link
                  href="/sales/exchange-billing"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Credit in POS Exchange Bill</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedSlip(null)}
                  className="px-3 py-1.5 border border-[#e2e8f0] text-neutral-600 rounded text-xs hover:bg-neutral-50 font-medium"
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
