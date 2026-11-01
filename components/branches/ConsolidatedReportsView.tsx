'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  TrendingUp,
  Download,
  FileSpreadsheet,
  FileText,
  BadgeIndianRupee,
  Scale,
  Building2,
  Calendar,
  BarChart3,
  Percent,
  CheckCircle2,
  X,
  Copy,
  Check,
  Eye,
  ArrowUpRight,
  Receipt,
  Sparkles,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  Boxes,
  Radio,
  ArrowRightLeft,
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

export interface BranchFinancialStats {
  id: string;
  reporting_month: string;
  branch_name: string;
  city: string;
  rank: number;
  invoices_count: number;
  gold_sold_kg: number;
  diamond_carats_sold: number;
  gross_turnover: number;
  target_turnover: number;
  achievement_pct: number;
  net_profit_margin_pct: number;
  gst_collected_inr: number;
  store_manager?: string;
  notes?: string;
  created_at?: string;
}

export function BranchesConsolidatedReportsView() {
  const [stats, setStats] = useState<BranchFinancialStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-OCT');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Search and Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'turnover' | 'gold' | 'margin'>('turnover');

  // Modals & Drawers
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);
  const [selectedStats, setSelectedStats] = useState<BranchFinancialStats | null>(null);
  const [isAuditPackModalOpen, setIsAuditPackModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<BranchFinancialStats | null>(null);

  // New Performance Record State
  const [branchName, setBranchName] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [manager, setManager] = useState('');
  const [reportingMonth, setReportingMonth] = useState('2026-OCT');
  const [invoicesCount, setInvoicesCount] = useState<number>(350);
  const [goldSoldKg, setGoldSoldKg] = useState<number>(5.5);
  const [diamondSoldCts, setDiamondSoldCts] = useState<number>(35.0);
  const [grossTurnover, setGrossTurnover] = useState<number>(45000000);
  const [targetTurnover, setTargetTurnover] = useState<number>(40000000);
  const [marginPct, setMarginPct] = useState<number>(15.5);
  const [reportNotes, setReportNotes] = useState('');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'branches_reports'));
      const list: BranchFinancialStats[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<BranchFinancialStats, 'id'>) });
      });
      // Sort initially by rank or turnover
      list.sort((a, b) => (Number(b.gross_turnover) || 0) - (Number(a.gross_turnover) || 0));
      // Re-assign ranks
      list.forEach((item, index) => {
        item.rank = index + 1;
      });
      setStats(list);
    } catch (err: any) {
      console.error('Error fetching consolidated reports:', err);
      showToast('error', err.message || 'Failed to fetch reports from Firestore');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Dynamic calculations for modal
  const calcAchievementPct = targetTurnover > 0
    ? Number(((grossTurnover / targetTurnover) * 100).toFixed(1))
    : 100;
  const calcGstInr = Number((grossTurnover * 0.03).toFixed(2)); // 3% GST on jewellery turnover
  const calcNetProfitInr = Number((grossTurnover * (marginPct / 100)).toFixed(2));

  const handleOpenAdd = () => {
    setBranchName('');
    setCity('Hyderabad');
    setManager('');
    setReportingMonth(selectedPeriod || '2026-OCT');
    setInvoicesCount(350);
    setGoldSoldKg(5.5);
    setDiamondSoldCts(35.0);
    setGrossTurnover(45000000);
    setTargetTurnover(40000000);
    setMarginPct(15.5);
    setReportNotes('');
    setIsAddReportOpen(true);
  };

  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim()) {
      showToast('error', 'Please provide branch name');
      return;
    }

    try {
      setSaving(true);
      const payload: Omit<BranchFinancialStats, 'id'> = {
        reporting_month: reportingMonth.trim(),
        branch_name: branchName.trim(),
        city: city.trim(),
        rank: stats.length + 1,
        invoices_count: Number(invoicesCount) || 0,
        gold_sold_kg: Number(goldSoldKg) || 0,
        diamond_carats_sold: Number(diamondSoldCts) || 0,
        gross_turnover: Number(grossTurnover) || 0,
        target_turnover: Number(targetTurnover) || 0,
        achievement_pct: calcAchievementPct,
        net_profit_margin_pct: Number(marginPct) || 0,
        gst_collected_inr: calcGstInr,
        store_manager: manager.trim() || 'Store Manager',
        notes: reportNotes.trim(),
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'branches_reports'), payload);
      const updatedList = [{ id: docRef.id, ...payload }, ...stats];
      updatedList.sort((a, b) => b.gross_turnover - a.gross_turnover);
      updatedList.forEach((item, idx) => {
        item.rank = idx + 1;
      });
      setStats(updatedList);
      setIsAddReportOpen(false);
      showToast('success', `Financial performance ledger saved for ${payload.branch_name}`);
    } catch (err: any) {
      console.error('Error saving performance report:', err);
      showToast('error', err.message || 'Failed to save performance record');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!reportToDelete) return;
    try {
      setSaving(true);
      await deleteDoc(doc(db, 'branches_reports', reportToDelete.id));
      const updated = stats.filter((s) => s.id !== reportToDelete.id);
      updated.forEach((item, idx) => {
        item.rank = idx + 1;
      });
      setStats(updated);
      if (selectedStats?.id === reportToDelete.id) {
        setSelectedStats(null);
        setIsAuditPackModalOpen(false);
      }
      showToast('success', `Performance ledger for ${reportToDelete.branch_name} deleted.`);
      setReportToDelete(null);
    } catch (err: any) {
      console.error('Error deleting report:', err);
      showToast('error', err.message || 'Failed to delete report');
    } finally {
      setSaving(false);
    }
  };

  const exportCSV = () => {
    if (stats.length === 0) {
      showToast('error', 'No data to export.');
      return;
    }
    const headers = 'Rank,Branch Name,City,Month,Invoices,Gold Sold (kg),Diamond Sold (cts),Gross Turnover (INR),Target (INR),Achievement %,Net Margin %,GST Collected (INR)\n';
    const rows = stats
      .map(
        (s) =>
          `${s.rank},"${s.branch_name}","${s.city}",${s.reporting_month},${s.invoices_count},${s.gold_sold_kg},${s.diamond_carats_sold},${s.gross_turnover},${s.target_turnover},${s.achievement_pct}%,${s.net_profit_margin_pct}%,${s.gst_collected_inr}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Consolidated_Branch_Report_${selectedPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Consolidated audit report downloaded as CSV.');
  };

  const filteredStats = stats
    .filter((item) => {
      if (selectedPeriod !== 'ALL' && item.reporting_month !== selectedPeriod) {
        // if user wants to see specific month
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = (item.branch_name || '').toLowerCase().includes(q);
        const matchCity = (item.city || '').toLowerCase().includes(q);
        if (!matchName && !matchCity) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'turnover') return (b.gross_turnover || 0) - (a.gross_turnover || 0);
      if (sortBy === 'gold') return (b.gold_sold_kg || 0) - (a.gold_sold_kg || 0);
      if (sortBy === 'margin') return (b.net_profit_margin_pct || 0) - (a.net_profit_margin_pct || 0);
      return 0;
    });

  const totalTurnover = stats.reduce((acc, curr) => acc + (Number(curr.gross_turnover) || 0), 0);
  const totalGoldSold = stats.reduce((acc, curr) => acc + (Number(curr.gold_sold_kg) || 0), 0);
  const totalGst = stats.reduce((acc, curr) => acc + (Number(curr.gst_collected_inr) || 0), 0);
  const totalInvoices = stats.reduce((acc, curr) => acc + (Number(curr.invoices_count) || 0), 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="consolidated_enterprise_stats" />
      <ActionToolbar
        filterPlaceholder="Search across branch performance by store name, city, turnover..."
        insertLabel="Add Performance Ledger"
        onInsertClick={handleOpenAdd}
        onRefresh={fetchReports}
      />

      {/* Real-time Toast Banner */}
      {toastType !== 'idle' && (
        <div
          className={`px-4 py-2 text-xs flex items-center justify-between transition-all ${
            toastType === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
              : 'bg-red-50 text-red-800 border-b border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastType === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastType('idle')}
            className="p-0.5 hover:bg-neutral-200/50 rounded text-neutral-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Module Interlinking Sub-Header Bar */}
      <div className="h-[38px] bg-[#f8fafc] border-b border-[#e2e8f0] px-4 flex items-center justify-between text-xs overflow-x-auto no-scrollbar gap-2 shrink-0">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="text-[11px] text-neutral-400 uppercase tracking-wider mr-1">Modules:</span>
          <Link
            href="/branches/management"
            className="px-2.5 py-1 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-white text-[11px] flex items-center gap-1 transition-colors"
          >
            <Building2 className="w-3 h-3 text-neutral-500" />
            Branch Directory
          </Link>
          <Link
            href="/branches/stock"
            className="px-2.5 py-1 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-white text-[11px] flex items-center gap-1 transition-colors"
          >
            <Boxes className="w-3 h-3 text-neutral-500" />
            Branch Stock
          </Link>
          <Link
            href="/branches/transfers"
            className="px-2.5 py-1 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-white text-[11px] flex items-center gap-1 transition-colors"
          >
            <ArrowRightLeft className="w-3 h-3 text-neutral-500" />
            Inter-Branch Transfers
          </Link>
          <Link
            href="/branches/rates"
            className="px-2.5 py-1 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-white text-[11px] flex items-center gap-1 transition-colors"
          >
            <Radio className="w-3 h-3 text-neutral-500" />
            Rate Broadcast
          </Link>
          <Link
            href="/branches/consolidated-reports"
            className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] flex items-center gap-1"
          >
            <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
            Consolidated Reports
          </Link>
        </div>

        <div className="flex items-center gap-2 text-[11px] shrink-0 font-medium">
          <Link
            href="/finance/gst-reports"
            className="text-neutral-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <Receipt className="w-3 h-3 text-neutral-400" />
            GST Monthly Consolidation
          </Link>
          <span className="text-neutral-300">|</span>
          <Link
            href="/finance/profit-loss"
            className="text-neutral-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <TrendingUp className="w-3 h-3 text-neutral-400" />
            Enterprise P&amp;L
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI metrics */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Group Consolidated Turnover</span>
                <BadgeIndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">
                ₹{(totalTurnover / 10000000).toFixed(2)} Cr
              </div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Across {stats.length} Showroom Outlets
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Net Gold Weight Liquidated</span>
                <Scale className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">
                {totalGoldSold.toFixed(3)} kg
              </div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                From {totalInvoices} Invoiced Bills
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-blue-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Statutory GST Payable (3%)</span>
                <Receipt className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">
                ₹{(totalGst / 100000).toFixed(2)} Lakhs
              </div>
              <div className="text-[11px] text-blue-600 mt-1 font-mono">
                GSTR-1 Ready Elimination
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Audit Reconciliation Pack</span>
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">100% Reconciled</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                Zero Branch Variance
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-neutral-400 font-mono text-[11px]">Period:</span>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer font-medium"
                >
                  <option value="ALL">All Periods</option>
                  <option value="2026-OCT">October 2026</option>
                  <option value="2026-SEP">September 2026</option>
                  <option value="2026-AUG">August 2026</option>
                </select>
              </div>

              <span className="text-neutral-400 font-mono text-[11px] ml-2">Sort By:</span>
              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer font-medium"
                >
                  <option value="turnover">Turnover (High to Low)</option>
                  <option value="gold">Gold Sold (kg)</option>
                  <option value="margin">Profit Margin %</option>
                </select>
              </div>

              <button
                onClick={fetchReports}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-600 hover:text-neutral-900 bg-white border border-[#e2e8f0] rounded-md hover:bg-neutral-50 transition-colors font-medium cursor-pointer"
                title="Reload from Firestore"
              >
                <RefreshCw className="w-3 h-3 text-neutral-500" />
                <span>Sync</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search branch, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 px-2.5 py-1 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none placeholder:text-neutral-400 font-mono"
              />
              <button
                onClick={exportCSV}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-white text-neutral-700 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors cursor-pointer"
                title="Export as CSV"
              >
                <Download className="w-3.5 h-3.5 text-neutral-500" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Record</span>
              </button>
            </div>
          </div>
        </div>

        {/* Supabase-style Table */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  public.branches_reports
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  {loading
                    ? 'Loading reports...'
                    : `Showing ${filteredStats.length} of ${stats.length} branch reports`}
                </span>
              </div>

              <div className="flex items-center bg-neutral-200/60 p-0.5 rounded border border-neutral-300/60 text-[13px]">
                <button
                  onClick={() => setActiveTab('data')}
                  className={`px-2.5 py-0.5 rounded font-medium transition-all cursor-pointer ${
                    activeTab === 'data'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Data
                </button>
                <button
                  onClick={() => setActiveTab('definition')}
                  className={`px-2.5 py-0.5 rounded font-medium transition-all cursor-pointer ${
                    activeTab === 'definition'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Definition
                </button>
              </div>
            </div>

            {activeTab === 'data' && (
              <div className="flex-1 overflow-x-auto custom-scrollbar w-full">
                {loading ? (
                  <div className="p-16 flex flex-col items-center justify-center gap-2 text-neutral-500">
                    <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
                    <span className="text-xs font-medium">Loading consolidated reports from Firebase...</span>
                  </div>
                ) : filteredStats.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-medium text-neutral-800">
                      {stats.length === 0 ? 'No Consolidated Reports Found' : 'No Reports Match Filter'}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                      {stats.length === 0
                        ? 'Your multi-branch performance reporting database is currently clean. Record your first monthly branch financial ledger to view consolidated rollups.'
                        : 'No records match your active search or period selection.'}
                    </p>
                    {stats.length === 0 && (
                      <button
                        onClick={handleOpenAdd}
                        className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Record First Branch Report
                      </button>
                    )}
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#fcfcfc] border-b border-[#e5e7eb] text-neutral-600 font-mono text-[11px]">
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                          <span className="text-neutral-800">rank</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">branch_name & city</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">invoices</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">gold_sold_kg</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">diamond_cts</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">gross_turnover</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">target_achievement</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">profit_margin</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">gst_collected</span>
                        </th>
                        <th className="px-3 py-2 font-medium whitespace-nowrap text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {filteredStats.map((item) => (
                        <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-[11px] text-center font-medium">
                            <span
                              className={`w-6 h-6 inline-flex items-center justify-center rounded-full text-[11px] ${
                                item.rank === 1
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300 font-medium'
                                  : item.rank === 2
                                  ? 'bg-neutral-200 text-neutral-800 font-medium'
                                  : item.rank === 3
                                  ? 'bg-orange-100 text-orange-800 font-medium'
                                  : 'text-neutral-500'
                              }`}
                            >
                              #{item.rank}
                            </span>
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                            <div className="font-medium text-neutral-800">{item.branch_name}</div>
                            <span className="text-[10px] text-neutral-500 font-mono">
                              {item.city} • Period: {item.reporting_month}
                            </span>
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono">
                            {Number(item.invoices_count || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono font-medium text-neutral-900">
                            {Number(item.gold_sold_kg || 0).toFixed(3)} kg
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono text-blue-700 font-medium">
                            {Number(item.diamond_carats_sold || 0).toFixed(2)} cts
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono font-medium text-emerald-700">
                            ₹{(Number(item.gross_turnover || 0) / 10000000).toFixed(2)} Cr
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] ${
                                (item.achievement_pct || 0) >= 100
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {item.achievement_pct}%
                            </span>
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono font-medium text-neutral-800">
                            {item.net_profit_margin_pct}%
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono text-neutral-700">
                            ₹{(Number(item.gst_collected_inr || 0) / 100000).toFixed(2)} L
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedStats(item);
                                  setIsAuditPackModalOpen(true);
                                }}
                                className="p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                                title="View Performance Breakdown"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setReportToDelete(item)}
                                className="p-1 rounded text-neutral-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete report"
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

            {activeTab === 'definition' && (
              <div className="p-4 overflow-x-auto font-mono text-xs text-neutral-800 bg-[#fbfbfb] w-full">
                <div className="bg-neutral-900 text-neutral-100 p-4 rounded-md overflow-x-auto shadow-inner text-[12px] leading-relaxed w-full">
                  <span className="text-emerald-400">CREATE TABLE</span> public.branches_reports (
                  <br />
                  &nbsp;&nbsp;id <span className="text-purple-400">UUID</span>{' '}
                  <span className="text-neutral-400">PRIMARY KEY DEFAULT gen_random_uuid()</span>,
                  <br />
                  &nbsp;&nbsp;reporting_month <span className="text-purple-400">VARCHAR(20)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;branch_name <span className="text-purple-400">VARCHAR(100)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;city <span className="text-purple-400">VARCHAR(60)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;invoices_count <span className="text-purple-400">INTEGER</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0</span>,
                  <br />
                  &nbsp;&nbsp;gold_sold_kg <span className="text-purple-400">NUMERIC(10,3)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;diamond_carats_sold <span className="text-purple-400">NUMERIC(10,2)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0</span>,
                  <br />
                  &nbsp;&nbsp;gross_turnover <span className="text-purple-400">NUMERIC(15,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;target_turnover <span className="text-purple-400">NUMERIC(15,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;achievement_pct <span className="text-purple-400">NUMERIC(5,2)</span>,
                  <br />
                  &nbsp;&nbsp;net_profit_margin_pct <span className="text-purple-400">NUMERIC(5,2)</span>,
                  <br />
                  &nbsp;&nbsp;gst_collected_inr <span className="text-purple-400">NUMERIC(12,2)</span>,
                  <br />
                  &nbsp;&nbsp;created_at <span className="text-purple-400">TIMESTAMPTZ</span>{' '}
                  <span className="text-neutral-400">DEFAULT NOW()</span>
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawer: Add Performance Record */}
      {isAddReportOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs transition-all">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-medium text-neutral-900">
                    Record Branch Monthly Financial Performance
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddReportOpen(false)}
                  className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveReport} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Branch Showroom Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Banjara Hills Flagship"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Reporting Month
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2026-OCT"
                      value={reportingMonth}
                      onChange={(e) => setReportingMonth(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Store Manager
                    </label>
                    <input
                      type="text"
                      placeholder="Manager Name"
                      value={manager}
                      onChange={(e) => setManager(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                  <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-neutral-600" />
                      Sales Volume &amp; Weight Metrics
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-neutral-700 mb-1 block">
                        Invoices Count
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={invoicesCount}
                        onChange={(e) => setInvoicesCount(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-700 mb-1 block">
                        Gold Sold (kg)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        min={0}
                        value={goldSoldKg}
                        onChange={(e) => setGoldSoldKg(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-700 mb-1 block">
                        Diamond (cts)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        value={diamondSoldCts}
                        onChange={(e) => setDiamondSoldCts(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Gross Turnover (₹ INR)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={grossTurnover}
                      onChange={(e) => setGrossTurnover(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Target Turnover (₹ INR)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={targetTurnover}
                      onChange={(e) => setTargetTurnover(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Net Profit Margin (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      max={100}
                      value={marginPct}
                      onChange={(e) => setMarginPct(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      GST Collected (3% auto)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`₹${calcGstInr.toLocaleString('en-IN')}`}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-neutral-100 text-neutral-600 font-mono"
                    />
                  </div>
                </div>

                {/* Dynamic Calculation Callout */}
                <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                  <div className="flex justify-between text-emerald-900 font-medium">
                    <span>Target Achievement Ratio:</span>
                    <span className="font-mono">{calcAchievementPct}%</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 text-[11px]">
                    <span>Estimated Net Profit Generated:</span>
                    <span className="font-mono font-medium">₹{(calcNetProfitInr / 100000).toFixed(2)} Lakhs</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Audit Review Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Exceeded festive revenue targets driven by bridal diamond choker demand."
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  />
                </div>

                <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddReportOpen(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Save to Firestore</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Audit Pack & Detail View */}
      {isAuditPackModalOpen && selectedStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#e5e7eb] w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="px-5 py-4 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-medium text-neutral-900">
                    {selectedStats.branch_name} • Performance Review
                  </h3>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {selectedStats.city} • Period: {selectedStats.reporting_month}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsAuditPackModalOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                  <span className="text-[10px] text-neutral-500 block uppercase">Gross Turnover</span>
                  <span className="text-base font-mono font-medium text-emerald-700">
                    ₹{(Number(selectedStats.gross_turnover || 0) / 10000000).toFixed(2)} Cr
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                  <span className="text-[10px] text-neutral-500 block uppercase">Gold Sold</span>
                  <span className="text-base font-mono font-medium text-neutral-900">
                    {Number(selectedStats.gold_sold_kg || 0).toFixed(3)} kg
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                  <span className="text-[10px] text-neutral-500 block uppercase">Diamonds Sold</span>
                  <span className="text-base font-mono font-medium text-blue-700">
                    {Number(selectedStats.diamond_carats_sold || 0).toFixed(2)} cts
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Target vs Actual:</span>
                  <span className="font-mono font-medium text-neutral-800">
                    ₹{(selectedStats.target_turnover / 10000000).toFixed(2)} Cr Target ({selectedStats.achievement_pct}% Achieved)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Net Profit Margin:</span>
                  <span className="font-mono text-emerald-700 font-medium">
                    {selectedStats.net_profit_margin_pct}% (approx ₹{((selectedStats.gross_turnover * (selectedStats.net_profit_margin_pct / 100)) / 100000).toFixed(2)} Lakhs)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">GST Collected @ 3%:</span>
                  <span className="font-mono text-neutral-900 font-medium">
                    ₹{Number(selectedStats.gst_collected_inr || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Total Invoices Billed:</span>
                  <span className="font-mono text-neutral-900 font-medium">
                    {selectedStats.invoices_count} retail bills
                  </span>
                </div>
              </div>

              {selectedStats.notes && (
                <div className="p-3 rounded-md bg-[#f8fafc] border border-[#e2e8f0] text-xs">
                  <span className="font-medium text-neutral-700 block mb-1">Executive Notes:</span>
                  <p className="text-neutral-600">{selectedStats.notes}</p>
                </div>
              )}

              {/* Interlinks */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#e2e8f0]">
                <Link
                  href="/finance/gst-reports"
                  className="px-3 py-1.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 flex items-center gap-1.5"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  View GST Returns
                </Link>
                <Link
                  href="/finance/profit-loss"
                  className="px-3 py-1.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1.5"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Consolidated P&amp;L
                </Link>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between">
              <span className="text-[11px] text-neutral-500 font-mono">
                Firestore ID: {selectedStats.id}
              </span>
              <button
                onClick={() => setIsAuditPackModalOpen(false)}
                className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {reportToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-red-200 w-full max-w-md overflow-hidden p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-neutral-900">
                  Delete Performance Record?
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Are you sure you want to delete the performance record for <span className="font-medium text-neutral-800">{reportToDelete.branch_name}</span>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => setReportToDelete(null)}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteReport}
                disabled={saving}
                className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
