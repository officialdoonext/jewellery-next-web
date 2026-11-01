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
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  TrendingUp,
  Percent,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Building,
  Hammer,
  Flame,
  FileSpreadsheet,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  Loader2,
  Trash2,
  Plus,
  AlertCircle,
  X,
  ShieldCheck,
} from 'lucide-react';

export interface FinancialPlStatement {
  id: string;
  statement_period: string;
  sales_revenue: number;
  making_charges_revenue?: number;
  cogs_bullion: number;
  gross_profit: number;
  operating_expenses: number;
  ebitda: number;
  depreciation_finance: number;
  pbt: number;
  tax_provision: number;
  net_profit: number;
  net_margin_percentage?: number;
  created_at?: any;
}

export function FinanceProfitLossView() {
  const [statements, setStatements] = useState<FinancialPlStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Tree table expandable sections
  const [showRevenueDetails, setShowRevenueDetails] = useState(true);
  const [showOpexDetails, setShowOpexDetails] = useState(true);

  // Modals
  const [isNewStatementOpen, setIsNewStatementOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<FinancialPlStatement | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // New Statement Form State
  const [period, setPeriod] = useState('Q3 FY2026-27 (Current Oct-Dec)');
  const [salesRev, setSalesRev] = useState<number>(0);
  const [makingRev, setMakingRev] = useState<number>(0);
  const [cogs, setCogs] = useState<number>(0);
  const [opex, setOpex] = useState<number>(0);
  const [deprecFinance, setDeprecFinance] = useState<number>(0);
  const [taxProv, setTaxProv] = useState<number>(0);

  // Dynamic Real-time Calculations for modal
  const totalRev = Number((salesRev + makingRev).toFixed(2));
  const calcGrossProfit = Number((totalRev - cogs).toFixed(2));
  const calcEbitda = Number((calcGrossProfit - opex).toFixed(2));
  const calcPbt = Number((calcEbitda - deprecFinance).toFixed(2));
  const calcNetProfit = Number((calcPbt - taxProv).toFixed(2));
  const calcNetMargin = totalRev > 0 ? Number(((calcNetProfit / totalRev) * 100).toFixed(1)) : 0;

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchStatements = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'finance_profit_loss'));
      const list: FinancialPlStatement[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<FinancialPlStatement, 'id'>) });
      });
      list.sort((a, b) => (b.statement_period || '').localeCompare(a.statement_period || ''));
      setStatements(list);
    } catch (err: any) {
      console.error('Error fetching P&L statements:', err);
      showToast('error', err.message || 'Failed to fetch P&L statements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatements();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Create P&L Statement
  const handleCreateStatement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (salesRev <= 0) {
      showToast('error', 'Please enter showroom sales revenue');
      return;
    }

    try {
      setSaving(true);
      const payload: Omit<FinancialPlStatement, 'id'> = {
        statement_period: period.trim(),
        sales_revenue: Number(salesRev),
        making_charges_revenue: Number(makingRev),
        cogs_bullion: Number(cogs),
        gross_profit: calcGrossProfit,
        operating_expenses: Number(opex),
        ebitda: calcEbitda,
        depreciation_finance: Number(deprecFinance),
        pbt: calcPbt,
        tax_provision: Number(taxProv),
        net_profit: calcNetProfit,
        net_margin_percentage: calcNetMargin,
        created_at: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'finance_profit_loss'), payload);
      setStatements((prev) => [{ id: docRef.id, ...payload }, ...prev]);
      setIsNewStatementOpen(false);
      setSalesRev(0);
      setMakingRev(0);
      setCogs(0);
      setOpex(0);
      setDeprecFinance(0);
      setTaxProv(0);
      showToast('success', `Created P&L Statement for ${period}`);
    } catch (err: any) {
      console.error('Error saving P&L statement:', err);
      showToast('error', err.message || 'Failed to save P&L statement');
    } finally {
      setSaving(false);
    }
  };

  // Delete P&L Statement
  const handleDeleteStatement = async () => {
    if (!itemToDelete) return;
    try {
      setSaving(true);
      await deleteDoc(doc(db, 'finance_profit_loss', itemToDelete.id));
      setStatements((prev) => prev.filter((s) => s.id !== itemToDelete.id));
      showToast('success', `Deleted P&L statement for ${itemToDelete.statement_period}`);
      setItemToDelete(null);
    } catch (err: any) {
      console.error('Error deleting statement:', err);
      showToast('error', err.message || 'Failed to delete statement');
    } finally {
      setSaving(false);
    }
  };

  // KPI Calculations
  const activeStatement = statements.length > 0 ? statements[0] : null;
  const totRevKpi = statements.reduce((acc, curr) => acc + (Number(curr.sales_revenue) || 0), 0);
  const totGrossKpi = statements.reduce((acc, curr) => acc + (Number(curr.gross_profit) || 0), 0);
  const totNetKpi = statements.reduce((acc, curr) => acc + (Number(curr.net_profit) || 0), 0);
  const grossMarginPercent = totRevKpi > 0 ? ((totGrossKpi / totRevKpi) * 100).toFixed(1) : '0.0';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="profit_and_loss_statement" />
      <ActionToolbar
        filterPlaceholder="Filter by financial quarter, FY period, margin..."
        insertLabel="Generate P&L"
        onInsertClick={() => setIsNewStatementOpen(true)}
        onRefresh={fetchStatements}
      />

      <FinanceNavigationHeader activePage="profit-loss" />

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
                <span className="text-[11px] font-medium uppercase tracking-wider">Gross Sales Turnover</span>
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">
                ₹ {totRevKpi.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Total jewellery billings</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Gross Margin (VA + Spread)</span>
                <Percent className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700 font-mono">
                {grossMarginPercent}%
              </div>
              <div className="text-[11px] text-emerald-600 mt-1">
                ₹ {totGrossKpi.toLocaleString('en-IN', { minimumFractionDigits: 2 })} gross profit
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Net Profit After Tax</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-800 font-mono">
                ₹ {totNetKpi.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Bottom line distributable surplus</div>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-200 hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-emerald-800 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Active Period</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div className="text-base font-medium text-emerald-900 truncate" title={activeStatement?.statement_period || 'None'}>
                {activeStatement?.statement_period || 'No Statements'}
              </div>
              <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Financial Audit
              </div>
            </div>
          </div>
        </div>

        {/* Statements Table or Empty State */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-neutral-500">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
              <p className="text-xs font-medium">Loading live P&L statements...</p>
            </div>
          ) : statements.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center p-8 bg-white rounded-lg border border-[#e5e7eb] shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-neutral-900 mb-1">No P&L Statements Generated</h3>
              <p className="text-xs text-neutral-500 max-w-sm mb-4">
                Compute quarterly and monthly profitability statements, gross spreads, EBITDA, and corporate tax provisions.
              </p>
              <button
                onClick={() => setIsNewStatementOpen(true)}
                className="px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Generate P&L Statement</span>
              </button>
            </div>
          ) : (
            <div className="border border-[#e5e7eb] rounded-lg bg-white overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-neutral-500 uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3 font-medium">Reporting Period</th>
                      <th className="py-2.5 px-3 font-medium text-right">Sales Revenue (₹)</th>
                      <th className="py-2.5 px-3 font-medium text-right">Bullion COGS (₹)</th>
                      <th className="py-2.5 px-3 font-medium text-right">Gross Profit (₹)</th>
                      <th className="py-2.5 px-3 font-medium text-right">Opex (₹)</th>
                      <th className="py-2.5 px-3 font-medium text-right">EBITDA (₹)</th>
                      <th className="py-2.5 px-3 font-medium text-right">Tax Prov (₹)</th>
                      <th className="py-2.5 px-3 font-medium text-right">Net Profit (₹)</th>
                      <th className="py-2.5 px-3 font-medium text-center">Net Margin</th>
                      <th className="py-2.5 px-3 font-medium text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0] text-neutral-700">
                    {statements.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-2 px-3 font-medium text-neutral-900 whitespace-nowrap">
                          {row.statement_period}
                        </td>
                        <td className="py-2 px-3 font-mono font-medium text-neutral-900 text-right whitespace-nowrap">
                          ₹ {row.sales_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 font-mono text-neutral-600 text-right whitespace-nowrap">
                          ₹ {row.cogs_bullion.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 font-mono font-medium text-emerald-700 text-right whitespace-nowrap">
                          ₹ {row.gross_profit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 font-mono text-neutral-600 text-right whitespace-nowrap">
                          ₹ {row.operating_expenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 font-mono text-neutral-800 text-right whitespace-nowrap">
                          ₹ {row.ebitda.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 font-mono text-neutral-600 text-right whitespace-nowrap">
                          ₹ {row.tax_provision.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 font-mono font-medium text-emerald-800 text-right whitespace-nowrap">
                          ₹ {row.net_profit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {row.net_margin_percentage ?? ((row.net_profit / row.sales_revenue) * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => setItemToDelete(row)}
                            className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete statement"
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

      {/* MODAL: Generate P&L Statement */}
      {isNewStatementOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-medium text-neutral-900 uppercase tracking-wider">
                  Generate Periodic Profit & Loss Statement
                </h3>
              </div>
              <button
                onClick={() => setIsNewStatementOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStatement} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Statement Period *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 FY2026-27 (Jan-Mar) or November 2026"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Sales Turnover (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={salesRev || ''}
                    onChange={(e) => setSalesRev(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono font-medium focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Artisan Making Charges (VA) (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={makingRev || ''}
                    onChange={(e) => setMakingRev(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Bullion COGS (Gold/Silver Cost) (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={cogs || ''}
                    onChange={(e) => setCogs(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Showroom Operating Expenses (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={opex || ''}
                    onChange={(e) => setOpex(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Depreciation & Metal Loan Interest (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={deprecFinance || ''}
                    onChange={(e) => setDeprecFinance(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Income Tax Provision @ 25% (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={taxProv || ''}
                    onChange={(e) => setTaxProv(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Live Calculations Preview */}
              <div className="p-3 rounded-lg bg-[#f8fafc] border border-emerald-200 text-[11px] space-y-1.5">
                <div className="flex justify-between text-neutral-600">
                  <span>Gross Profit (Revenue - COGS):</span>
                  <span className="font-mono text-emerald-700 font-medium">₹ {calcGrossProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>EBITDA (Gross Profit - Opex):</span>
                  <span className="font-mono font-medium">₹ {calcEbitda.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-medium text-emerald-900 pt-1 border-t border-emerald-100">
                  <span>Net Profit After Tax (PAT):</span>
                  <span className="font-mono text-sm">₹ {calcNetProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({calcNetMargin}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setIsNewStatementOpen(false)}
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
                  <span>Save Statement</span>
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
              <h3 className="text-sm font-medium text-neutral-900">Delete P&L Statement?</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Are you sure you want to delete statement for period <span className="font-mono font-medium text-neutral-800">{itemToDelete.statement_period}</span> (Sales: ₹ {itemToDelete.sales_revenue.toLocaleString('en-IN')})?
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
                onClick={handleDeleteStatement}
                disabled={saving}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                <span>Delete Statement</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
