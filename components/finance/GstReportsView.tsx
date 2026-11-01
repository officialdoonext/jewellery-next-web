'use client';

import React, { useState, useEffect } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import { FinanceNavigationHeader } from './FinanceNavigationHeader';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  X,
  Plus,
  ShieldCheck,
  Building,
  Loader2,
  Trash2,
  AlertCircle,
  FileCheck,
  Scale,
} from 'lucide-react';

export interface GstFilingSummary {
  id: string;
  period: string;
  taxable_turnover: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  rcm_payable: number;
  itc_credit: number;
  net_tax_payable: number;
  status: 'READY_FOR_FILING' | 'FILED' | 'AMENDED';
  hsn_code?: string;
  gold_weight_grams?: number;
  filing_arn?: string;
  created_at?: any;
}

const HSN_MASTER_OPTIONS = [
  { code: '71131910', label: '71131910 - Articles of Jewellery of Gold 22K/18K' },
  { code: '71131120', label: '71131120 - Silver Jewellery Studded with Gems/Pearls' },
  { code: '71023910', label: '71023910 - Cut & Polished Natural Certified Diamonds' },
  { code: '71081200', label: '71081200 - Bullion Minted Gold Bars 999.9 Purity' },
];

export function FinanceGstReportsView() {
  const [summaries, setSummaries] = useState<GstFilingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals & drawers
  const [isNewReturnOpen, setIsNewReturnOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<GstFilingSummary | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // New Return Form State
  const [period, setPeriod] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
  const [turnover, setTurnover] = useState<number>(0);
  const [interstateIgst, setInterstateIgst] = useState<number>(0);
  const [rcm, setRcm] = useState<number>(0);
  const [itc, setItc] = useState<number>(0);
  const [hsnCode, setHsnCode] = useState(HSN_MASTER_OPTIONS[0].code);
  const [goldWeightGrams, setGoldWeightGrams] = useState<number>(0);
  const [arn, setArn] = useState('');

  // Dynamic GST 3% Calculation (Jewellery rate: 1.5% CGST + 1.5% SGST)
  const calculatedCgst = Number(((turnover * 0.015)).toFixed(2));
  const calculatedSgst = Number(((turnover * 0.015)).toFixed(2));
  const calculatedTotalOutputGst = Number((calculatedCgst + calculatedSgst + interstateIgst).toFixed(2));
  const calculatedNetTax = Number((calculatedTotalOutputGst + rcm - itc).toFixed(2));

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchSummaries = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'finance_gst_reports'));
      const list: GstFilingSummary[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<GstFilingSummary, 'id'>) });
      });
      list.sort((a, b) => (b.period || '').localeCompare(a.period || ''));
      setSummaries(list);
    } catch (err: any) {
      console.error('Error fetching GST reports:', err);
      showToast('error', err.message || 'Failed to fetch GST summaries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle Filing Status
  const handleToggleStatus = async (id: string, currentStatus: GstFilingSummary['status']) => {
    const nextStatus: GstFilingSummary['status'] =
      currentStatus === 'READY_FOR_FILING' ? 'FILED' : currentStatus === 'FILED' ? 'AMENDED' : 'READY_FOR_FILING';
    const generatedArn = nextStatus === 'FILED' ? `AA36${Math.floor(10000000000 + Math.random() * 90000000000)}` : undefined;

    try {
      await updateDoc(doc(db, 'finance_gst_reports', id), {
        status: nextStatus,
        ...(generatedArn ? { filing_arn: generatedArn } : {}),
      });
      setSummaries((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: nextStatus, ...(generatedArn ? { filing_arn: generatedArn } : {}) } : s))
      );
      showToast('success', `GST Return status updated to ${nextStatus}`);
    } catch (err: any) {
      console.error('Error updating return status:', err);
      showToast('error', err.message || 'Failed to update GST return status');
    }
  };

  // Create GST Summary
  const handleCreateSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (turnover <= 0) {
      showToast('error', 'Please enter taxable jewellery turnover');
      return;
    }

    try {
      setSaving(true);
      const payload: Omit<GstFilingSummary, 'id'> = {
        period: period.toUpperCase(),
        taxable_turnover: Number(turnover),
        cgst_amount: calculatedCgst,
        sgst_amount: calculatedSgst,
        igst_amount: Number(interstateIgst),
        rcm_payable: Number(rcm),
        itc_credit: Number(itc),
        net_tax_payable: calculatedNetTax,
        status: 'READY_FOR_FILING',
        hsn_code: hsnCode,
        gold_weight_grams: Number(goldWeightGrams) || undefined,
        filing_arn: arn.trim() || undefined,
        created_at: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'finance_gst_reports'), payload);
      setSummaries((prev) => [{ id: docRef.id, ...payload }, ...prev]);
      setIsNewReturnOpen(false);
      setTurnover(0);
      setInterstateIgst(0);
      setRcm(0);
      setItc(0);
      setGoldWeightGrams(0);
      setArn('');
      showToast('success', `Created GSTR-1 & 3B return summary for ${period}`);
    } catch (err: any) {
      console.error('Error creating GST summary:', err);
      showToast('error', err.message || 'Failed to save GST summary');
    } finally {
      setSaving(false);
    }
  };

  // Delete Summary
  const handleDeleteSummary = async () => {
    if (!itemToDelete) return;
    try {
      setSaving(true);
      await deleteDoc(doc(db, 'finance_gst_reports', itemToDelete.id));
      setSummaries((prev) => prev.filter((s) => s.id !== itemToDelete.id));
      showToast('success', `Deleted GST return for period ${itemToDelete.period}`);
      setItemToDelete(null);
    } catch (err: any) {
      console.error('Error deleting return:', err);
      showToast('error', err.message || 'Failed to delete GST return');
    } finally {
      setSaving(false);
    }
  };

  // KPI Calculations
  const totalTurnover = summaries.reduce((acc, curr) => acc + (Number(curr.taxable_turnover) || 0), 0);
  const totalOutputGst = summaries.reduce(
    (acc, curr) => acc + (Number(curr.cgst_amount) + Number(curr.sgst_amount) + Number(curr.igst_amount) || 0),
    0
  );
  const totalItc = summaries.reduce((acc, curr) => acc + (Number(curr.itc_credit) || 0), 0);
  const totalNetPayable = summaries.reduce((acc, curr) => acc + (Number(curr.net_tax_payable) || 0), 0);

  const filteredSummaries = summaries.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.period || '').toLowerCase().includes(q) ||
      (item.hsn_code || '').toLowerCase().includes(q) ||
      (item.filing_arn || '').toLowerCase().includes(q) ||
      (item.status || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="gst_gstr1_3b_compliance" />
      <ActionToolbar
        filterPlaceholder="Filter by period, ARN, HSN code, status..."
        insertLabel="Generate GST Summary"
        onInsertClick={() => setIsNewReturnOpen(true)}
        onRefresh={fetchSummaries}
      />

      <FinanceNavigationHeader activePage="gst-reports" />

      {/* Real-time Toast Banner */}
      {toastMessage && (
        <div
          className={`px-4 py-2 text-xs flex items-center justify-between transition-all shrink-0 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
              : 'bg-red-50 text-red-800 border-b border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-neutral-400 hover:text-neutral-700 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Taxable Turnover</span>
                <Building className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">
                ₹ {totalTurnover.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Total jewellery billings</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Output GST (3%)</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700 font-mono">
                ₹ {totalOutputGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1">1.5% CGST + 1.5% SGST collected</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Input Tax Credit (ITC)</span>
                <FileCheck className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-amber-700 font-mono">
                ₹ {totalItc.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Bullion purchase & expenses ITC</div>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-200 hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-emerald-800 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Net Govt Tax Payout</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div className="text-xl font-medium text-emerald-900 font-mono">
                ₹ {totalNetPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                GSTR-3B Challan Obligation
              </div>
            </div>
          </div>
        </div>

        {/* GST Filing History Table or Empty State */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-neutral-500">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
              <p className="text-xs font-medium">Loading live GST compliance records...</p>
            </div>
          ) : filteredSummaries.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center p-8 bg-white rounded-lg border border-[#e5e7eb] shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-neutral-900 mb-1">No GST Reports Generated</h3>
              <p className="text-xs text-neutral-500 max-w-sm mb-4">
                {searchQuery
                  ? 'No GST records match your filter. Try clearing the search.'
                  : 'Compute monthly GSTR-1 outward gold sales, HSN 7113 breakdown, reverse charge RCM, and 3% tax liabilities.'}
              </p>
              <button
                onClick={() => setIsNewReturnOpen(true)}
                className="px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Generate GST Return</span>
              </button>
            </div>
          ) : (
            <div className="border border-[#e5e7eb] rounded-lg bg-white overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-neutral-500 uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3 font-medium">Return Period</th>
                      <th className="py-2.5 px-3 font-medium text-right">Taxable Turnover (₹)</th>
                      <th className="py-2.5 px-3 font-medium text-right">CGST 1.5% (₹)</th>
                      <th className="py-2.5 px-3 font-medium text-right">SGST 1.5% (₹)</th>
                      <th className="py-2.5 px-3 font-medium text-right">RCM (₹)</th>
                      <th className="py-2.5 px-3 font-medium text-right">ITC Offset (₹)</th>
                      <th className="py-2.5 px-3 font-medium text-right">Net Tax Payable (₹)</th>
                      <th className="py-2.5 px-3 font-medium">Filing ARN</th>
                      <th className="py-2.5 px-3 font-medium text-center">Status</th>
                      <th className="py-2.5 px-3 font-medium text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0] text-neutral-700">
                    {filteredSummaries.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-2 px-3 font-mono font-medium text-neutral-900 whitespace-nowrap">
                          {row.period}
                        </td>
                        <td className="py-2 px-3 font-mono font-medium text-neutral-900 text-right whitespace-nowrap">
                          ₹ {row.taxable_turnover.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 font-mono text-neutral-600 text-right whitespace-nowrap">
                          ₹ {row.cgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 font-mono text-neutral-600 text-right whitespace-nowrap">
                          ₹ {row.sgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 font-mono text-neutral-600 text-right whitespace-nowrap">
                          ₹ {row.rcm_payable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 font-mono text-emerald-700 text-right whitespace-nowrap">
                          - ₹ {row.itc_credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 font-mono font-medium text-emerald-800 text-right whitespace-nowrap">
                          ₹ {row.net_tax_payable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                          {row.filing_arn ? (
                            <button
                              onClick={() => copyToClipboard(row.filing_arn!, row.id)}
                              className="inline-flex items-center gap-1 hover:text-emerald-700 cursor-pointer"
                              title="Copy ARN"
                            >
                              <span>{row.filing_arn}</span>
                              {copiedId === row.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-2.5 h-2.5 text-neutral-400 opacity-60" />
                              )}
                            </button>
                          ) : (
                            <span className="text-neutral-400 italic">Not Filed</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(row.id, row.status)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                              row.status === 'FILED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : row.status === 'READY_FOR_FILING'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                                : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                            }`}
                            title="Click to advance status"
                          >
                            {row.status === 'FILED' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>FILED</span>
                              </>
                            ) : row.status === 'READY_FOR_FILING' ? (
                              <>
                                <Clock className="w-3 h-3 text-blue-600" />
                                <span>READY</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                <span>AMENDED</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => setItemToDelete(row)}
                            className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete return"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* MODAL: Generate GST Summary */}
      {isNewReturnOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-medium text-neutral-900 uppercase tracking-wider">
                  Generate GSTR-1 & 3B Monthly Return
                </h3>
              </div>
              <button
                onClick={() => setIsNewReturnOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSummary} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Return Period (YYYY-MM) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="2026-11"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    HSN Code
                  </label>
                  <select
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                  >
                    {HSN_MASTER_OPTIONS.map((hsn) => (
                      <option key={hsn.code} value={hsn.code}>
                        {hsn.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Taxable Sales Turnover (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={turnover || ''}
                    onChange={(e) => setTurnover(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono font-medium focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Gold Weight Dispatched (Grams)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={goldWeightGrams || ''}
                    onChange={(e) => setGoldWeightGrams(parseFloat(e.target.value) || 0)}
                    placeholder="0.00 g"
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Interstate IGST (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={interstateIgst || ''}
                    onChange={(e) => setInterstateIgst(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    RCM Payable (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={rcm || ''}
                    onChange={(e) => setRcm(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    ITC Credit Offset (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={itc || ''}
                    onChange={(e) => setItc(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Live Tax Summary Calculation */}
              <div className="p-3 rounded-lg bg-[#f8fafc] border border-emerald-200 text-[11px] space-y-1.5">
                <div className="flex justify-between text-neutral-600">
                  <span>Intrastate CGST (1.5%):</span>
                  <span className="font-mono">₹ {calculatedCgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Intrastate SGST (1.5%):</span>
                  <span className="font-mono">₹ {calculatedSgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Gross Output GST (3%):</span>
                  <span className="font-mono font-medium text-neutral-900">
                    ₹ {calculatedTotalOutputGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Less ITC Credit Offset:</span>
                  <span className="font-mono">- ₹ {itc.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-medium text-emerald-900 pt-1 border-t border-emerald-100">
                  <span>Net Government Cash Challan:</span>
                  <span className="font-mono text-sm">₹ {calculatedNetTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setIsNewReturnOpen(false)}
                  className="px-3 py-1.5 rounded border border-[#e2e8f0] text-neutral-600 hover:bg-neutral-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Save GST Return</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Confirmation */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-sm p-5 space-y-3 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium text-neutral-900">Delete GST Return?</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Are you sure you want to delete return for period <span className="font-mono font-medium text-neutral-800">{itemToDelete.period}</span> (Turnover: ₹ {itemToDelete.taxable_turnover.toLocaleString('en-IN')})?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-3 py-1.5 rounded border border-[#e2e8f0] text-neutral-600 hover:bg-neutral-50 font-medium text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSummary}
                disabled={saving}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                <span>Delete Return</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
