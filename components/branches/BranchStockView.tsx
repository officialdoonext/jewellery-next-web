'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Boxes,
  Gem,
  Scale,
  Building2,
  Lock,
  Plus,
  X,
  Copy,
  Check,
  Eye,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ArrowRightLeft,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Radio,
  FileSpreadsheet,
  TrendingUp,
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

export interface BranchStockItem {
  id: string;
  branch_code: string;
  branch_name: string;
  city: string;
  store_manager: string;
  total_items_count: number;
  gold_weight_kg: number;
  diamond_carats: number;
  silver_articles_kg: number;
  valuation_cr: number;
  vault_capacity_kg: number;
  vault_utilization_pct: number;
  last_audited_date: string;
  audit_status: 'VERIFIED_100%' | 'PENDING_RECHECK' | 'IN_AUDIT';
  active_counters: number;
  security_vault_tier: string;
  status: 'ACTIVE' | 'AUDIT_HOLD' | 'REBALANCING';
  notes?: string;
  created_at?: string;
}

export function BranchesStockView() {
  const [stockList, setStockList] = useState<BranchStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Filters & Search
  const [filterCity, setFilterCity] = useState('ALL');
  const [filterAudit, setFilterAudit] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<BranchStockItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [stockToDelete, setStockToDelete] = useState<BranchStockItem | null>(null);

  // Form State
  const [branchCode, setBranchCode] = useState('BR-01');
  const [branchName, setBranchName] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [manager, setManager] = useState('');
  const [itemsCount, setItemsCount] = useState<number>(1200);
  const [goldWeightKg, setGoldWeightKg] = useState<number>(15.5);
  const [diamondCarats, setDiamondCarats] = useState<number>(45.0);
  const [silverArticlesKg, setSilverArticlesKg] = useState<number>(8.0);
  const [valuationCr, setValuationCr] = useState<number>(12.8);
  const [vaultCapacityKg, setVaultCapacityKg] = useState<number>(35.0);
  const [securityTier, setSecurityTier] = useState('Class AA Strongroom Safe');
  const [notes, setNotes] = useState('');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const fetchStock = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'branches_stock'));
      const items: BranchStockItem[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...(d.data() as Omit<BranchStockItem, 'id'>) });
      });
      setStockList(items);
    } catch (err: any) {
      console.error('Error fetching branch stock:', err);
      showToast('error', err.message || 'Failed to fetch branch stock from Firestore');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Dynamic calculations in modal
  const calcTotalInventoryWeight = (Number(goldWeightKg) || 0) + (Number(silverArticlesKg) || 0);
  const calcVaultUtilizationPct = vaultCapacityKg > 0
    ? Math.min(100, Math.round((calcTotalInventoryWeight / Number(vaultCapacityKg)) * 100))
    : 0;

  const handleOpenAdd = () => {
    setBranchCode(`BR-0${stockList.length + 1}`);
    setBranchName('');
    setCity('Hyderabad');
    setManager('');
    setItemsCount(1200);
    setGoldWeightKg(15.5);
    setDiamondCarats(45.0);
    setSilverArticlesKg(8.0);
    setValuationCr(12.8);
    setVaultCapacityKg(35.0);
    setSecurityTier('Class AA Strongroom Safe');
    setNotes('');
    setIsAddStockOpen(true);
  };

  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim()) {
      showToast('error', 'Please provide branch name');
      return;
    }

    try {
      setSaving(true);
      const payload: Omit<BranchStockItem, 'id'> = {
        branch_code: branchCode.trim().toUpperCase(),
        branch_name: branchName.trim(),
        city: city.trim(),
        store_manager: manager.trim() || 'Store In-Charge',
        total_items_count: Number(itemsCount) || 0,
        gold_weight_kg: Number(goldWeightKg) || 0,
        diamond_carats: Number(diamondCarats) || 0,
        silver_articles_kg: Number(silverArticlesKg) || 0,
        valuation_cr: Number(valuationCr) || 0,
        vault_capacity_kg: Number(vaultCapacityKg) || 20,
        vault_utilization_pct: calcVaultUtilizationPct,
        last_audited_date: new Date().toISOString().substring(0, 10),
        audit_status: 'VERIFIED_100%',
        active_counters: 4,
        security_vault_tier: securityTier,
        status: 'ACTIVE',
        notes: notes.trim(),
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'branches_stock'), payload);
      setStockList((prev) => [{ id: docRef.id, ...payload }, ...prev]);
      setIsAddStockOpen(false);
      showToast('success', `Stock audit ledger recorded for ${payload.branch_name}`);
    } catch (err: any) {
      console.error('Error saving stock:', err);
      showToast('error', err.message || 'Failed to save branch stock');
    } finally {
      setSaving(false);
    }
  };

  const handleCycleAuditStatus = async (stockId: string, currentStatus: BranchStockItem['audit_status']) => {
    const statuses: BranchStockItem['audit_status'][] = [
      'VERIFIED_100%',
      'PENDING_RECHECK',
      'IN_AUDIT',
    ];
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];

    try {
      await updateDoc(doc(db, 'branches_stock', stockId), {
        audit_status: nextStatus,
        last_audited_date: new Date().toISOString().substring(0, 10),
      });
      setStockList((prev) =>
        prev.map((s) =>
          s.id === stockId
            ? { ...s, audit_status: nextStatus, last_audited_date: new Date().toISOString().substring(0, 10) }
            : s
        )
      );
      if (selectedStock?.id === stockId) {
        setSelectedStock({ ...selectedStock, audit_status: nextStatus });
      }
      showToast('success', `Audit status updated to ${nextStatus}`);
    } catch (err: any) {
      console.error('Error updating audit status:', err);
      showToast('error', err.message || 'Failed to update audit status');
    }
  };

  const handleDeleteStock = async () => {
    if (!stockToDelete) return;
    try {
      setSaving(true);
      await deleteDoc(doc(db, 'branches_stock', stockToDelete.id));
      setStockList((prev) => prev.filter((s) => s.id !== stockToDelete.id));
      if (selectedStock?.id === stockToDelete.id) {
        setSelectedStock(null);
        setIsDetailModalOpen(false);
      }
      showToast('success', `Stock record for "${stockToDelete.branch_name}" deleted.`);
      setStockToDelete(null);
    } catch (err: any) {
      console.error('Error deleting stock:', err);
      showToast('error', err.message || 'Failed to delete branch stock');
    } finally {
      setSaving(false);
    }
  };

  const filteredStock = stockList.filter((item) => {
    if (filterCity !== 'ALL' && item.city !== filterCity) return false;
    if (filterAudit !== 'ALL' && item.audit_status !== filterAudit) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchCode = (item.branch_code || '').toLowerCase().includes(q);
      const matchName = (item.branch_name || '').toLowerCase().includes(q);
      const matchCity = (item.city || '').toLowerCase().includes(q);
      const matchManager = (item.store_manager || '').toLowerCase().includes(q);
      if (!matchCode && !matchName && !matchCity && !matchManager) return false;
    }
    return true;
  });

  const totalGoldKg = stockList.reduce((acc, curr) => acc + (Number(curr.gold_weight_kg) || 0), 0);
  const totalDiamonds = stockList.reduce((acc, curr) => acc + (Number(curr.diamond_carats) || 0), 0);
  const totalSilverKg = stockList.reduce((acc, curr) => acc + (Number(curr.silver_articles_kg) || 0), 0);
  const totalValuation = stockList.reduce((acc, curr) => acc + (Number(curr.valuation_cr) || 0), 0);
  const uniqueCities = Array.from(new Set(stockList.map((s) => s.city).filter(Boolean)));

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="branches_stock" />
      <ActionToolbar
        filterPlaceholder="Search across all branches for SKU, Tag, Diamond ring, Choker..."
        insertLabel="Record Stock Audit"
        onInsertClick={handleOpenAdd}
        onRefresh={fetchStock}
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
            className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] flex items-center gap-1"
          >
            <Boxes className="w-3 h-3 text-emerald-600" />
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
            className="px-2.5 py-1 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-white text-[11px] flex items-center gap-1 transition-colors"
          >
            <FileSpreadsheet className="w-3 h-3 text-neutral-500" />
            Consolidated Reports
          </Link>
        </div>

        <div className="flex items-center gap-2 text-[11px] shrink-0 font-medium">
          <Link
            href="/inventory/ornaments"
            className="text-emerald-700 hover:underline flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200"
          >
            <ExternalLink className="w-3 h-3 text-emerald-600" />
            View Consolidated Inventory
          </Link>
          <span className="text-neutral-300">|</span>
          <Link
            href="/rates/gold-rates"
            className="text-neutral-500 hover:text-emerald-700 flex items-center gap-1"
          >
            <TrendingUp className="w-3 h-3 text-amber-500" />
            Base Gold Rates
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI metrics */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Enterprise Gold Stock</span>
                <Boxes className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">{totalGoldKg.toFixed(3)} kg Gold</div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Vault RFID Synced
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-blue-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Diamond Holdings</span>
                <Gem className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">{totalDiamonds.toFixed(2)} cts</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Certified Solitaires
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Silver Articles</span>
                <Scale className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-neutral-900">{totalSilverKg.toFixed(2)} kg Silver</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Utensils &amp; Idols
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Estimated Valuation</span>
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">₹{totalValuation.toFixed(2)} Cr</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                At Current Spot IBJA
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-neutral-400 font-mono text-[11px]">Filters:</span>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">City:</span>
                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer font-medium"
                >
                  <option value="ALL">All Cities</option>
                  {uniqueCities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Audit Status:</span>
                <select
                  value={filterAudit}
                  onChange={(e) => setFilterAudit(e.target.value)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer font-medium"
                >
                  <option value="ALL">All Audits</option>
                  <option value="VERIFIED_100%">Verified 100%</option>
                  <option value="PENDING_RECHECK">Pending Recheck</option>
                  <option value="IN_AUDIT">In Audit</option>
                </select>
              </div>

              <button
                onClick={fetchStock}
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
                placeholder="Search branch stock, code, manager..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 px-2.5 py-1 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none placeholder:text-neutral-400 font-mono"
              />
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stock Entry</span>
              </button>
            </div>
          </div>
        </div>

        {/* Supabase-style Table */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  public.branches_stock
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  {loading
                    ? 'Loading stock balances...'
                    : `Showing ${filteredStock.length} of ${stockList.length} store vaults`}
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
                    <span className="text-xs font-medium">Loading branch stock from Firebase...</span>
                  </div>
                ) : filteredStock.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                      <Boxes className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-medium text-neutral-800">
                      {stockList.length === 0 ? 'No Branch Stock Records Found' : 'No Stock Records Match Filter'}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                      {stockList.length === 0
                        ? 'Your multi-branch stock ledger is currently empty. Record your first branch stock tally or synchronize stock weights from RFID inventory.'
                        : 'No branch stock records match the selected city or audit filter.'}
                    </p>
                    {stockList.length === 0 && (
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <button
                          onClick={handleOpenAdd}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Record First Branch Stock
                        </button>
                        <Link
                          href="/inventory/ornaments"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Consolidated Inventory
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#fcfcfc] border-b border-[#e5e7eb] text-neutral-600 font-mono text-[11px]">
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">branch_code</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">branch_name & city</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">items_count</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">gold_weight_kg</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">diamond_cts</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">silver_kg</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">valuation_cr</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">vault_capacity & util</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">audit_status</span>
                        </th>
                        <th className="px-3 py-2 font-medium whitespace-nowrap text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {filteredStock.map((item) => (
                        <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span
                                onClick={() => {
                                  setSelectedStock(item);
                                  setIsDetailModalOpen(true);
                                }}
                                className="font-medium text-emerald-700 hover:underline cursor-pointer"
                              >
                                {item.branch_code}
                              </span>
                              <button
                                onClick={() => copyToClipboard(item.branch_code, item.id)}
                                className="text-neutral-400 hover:text-neutral-600"
                                title="Copy branch code"
                              >
                                {copiedId === item.id ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                            <div className="font-medium text-neutral-800">{item.branch_name}</div>
                            <span className="text-[10px] text-neutral-500 font-mono">
                              {item.city} • In-Charge: {item.store_manager}
                            </span>
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono">
                            <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 font-medium">
                              {Number(item.total_items_count || 0).toLocaleString('en-IN')} SKUs
                            </span>
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono font-medium text-neutral-900">
                            {Number(item.gold_weight_kg || 0).toFixed(3)} kg
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono text-blue-700 font-medium">
                            {Number(item.diamond_carats || 0).toFixed(2)} cts
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono text-neutral-700">
                            {Number(item.silver_articles_kg || 0).toFixed(2)} kg
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono font-medium text-emerald-700">
                            ₹{Number(item.valuation_cr || 0).toFixed(2)} Cr
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full ${
                                    (item.vault_utilization_pct || 0) > 85
                                      ? 'bg-red-500'
                                      : (item.vault_utilization_pct || 0) > 60
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${Math.min(item.vault_utilization_pct || 0, 100)}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-mono font-medium text-neutral-700">
                                {item.vault_utilization_pct || 0}% ({item.vault_capacity_kg || 20}kg limit)
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                            <button
                              onClick={() => handleCycleAuditStatus(item.id, item.audit_status)}
                              title="Click to cycle audit status: VERIFIED_100% -> PENDING_RECHECK -> IN_AUDIT"
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono transition-colors cursor-pointer ${
                                item.audit_status === 'VERIFIED_100%'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                  : item.audit_status === 'PENDING_RECHECK'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                              }`}
                            >
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              {item.audit_status}
                            </button>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedStock(item);
                                  setIsDetailModalOpen(true);
                                }}
                                className="p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                                title="View Stock Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <Link
                                href="/branches/transfers"
                                className="p-1 rounded text-neutral-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                                title="Initiate stock transfer from this branch"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                onClick={() => setStockToDelete(item)}
                                className="p-1 rounded text-neutral-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete stock record"
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.branches_stock (
                  <br />
                  &nbsp;&nbsp;id <span className="text-purple-400">UUID</span>{' '}
                  <span className="text-neutral-400">PRIMARY KEY DEFAULT gen_random_uuid()</span>,
                  <br />
                  &nbsp;&nbsp;branch_code <span className="text-purple-400">VARCHAR(20)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;branch_name <span className="text-purple-400">VARCHAR(100)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;city <span className="text-purple-400">VARCHAR(60)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;total_items_count <span className="text-purple-400">INTEGER</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0</span>,
                  <br />
                  &nbsp;&nbsp;gold_weight_kg <span className="text-purple-400">NUMERIC(10,3)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;diamond_carats <span className="text-purple-400">NUMERIC(10,2)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0</span>,
                  <br />
                  &nbsp;&nbsp;silver_articles_kg <span className="text-purple-400">NUMERIC(10,3)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0</span>,
                  <br />
                  &nbsp;&nbsp;valuation_cr <span className="text-purple-400">NUMERIC(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;vault_capacity_kg <span className="text-purple-400">NUMERIC(10,3)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 25.000</span>,
                  <br />
                  &nbsp;&nbsp;vault_utilization_pct <span className="text-purple-400">INTEGER</span>,
                  <br />
                  &nbsp;&nbsp;audit_status <span className="text-purple-400">VARCHAR(30)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;VERIFIED_100%&apos;</span>,
                  <br />
                  &nbsp;&nbsp;last_audited_date <span className="text-purple-400">DATE</span>,
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

      {/* Drawer: Add Stock Record */}
      {isAddStockOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs transition-all">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
                <div className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-medium text-neutral-900">
                    Record Branch Stock Audit &amp; Vault Ledger
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddStockOpen(false)}
                  className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveStock} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Branch Code
                    </label>
                    <input
                      type="text"
                      value={branchCode}
                      onChange={(e) => setBranchCode(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
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

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Branch Showroom Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jubilee Hills Boutique"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Vault In-Charge / Manager
                    </label>
                    <input
                      type="text"
                      placeholder="Manager Name"
                      value={manager}
                      onChange={(e) => setManager(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Total Ornament SKUs
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={itemsCount}
                      onChange={(e) => setItemsCount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                  <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-neutral-600" />
                      Metal &amp; Gem Weights
                    </span>
                    <span className="text-[11px] text-emerald-600 font-mono font-medium">
                      Total Weight: {calcTotalInventoryWeight.toFixed(3)} kg
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-neutral-700 mb-1 block">
                        Gold Wt (kg)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        min={0}
                        value={goldWeightKg}
                        onChange={(e) => setGoldWeightKg(Number(e.target.value))}
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
                        value={diamondCarats}
                        onChange={(e) => setDiamondCarats(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-700 mb-1 block">
                        Silver (kg)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        value={silverArticlesKg}
                        onChange={(e) => setSilverArticlesKg(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Vault Capacity Limit (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={1}
                      value={vaultCapacityKg}
                      onChange={(e) => setVaultCapacityKg(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Valuation (₹ in Crore)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={valuationCr}
                      onChange={(e) => setValuationCr(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Dynamic calculation callout */}
                <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs">
                  <div className="flex items-center justify-between text-emerald-800 font-medium">
                    <span>Vault Utilization Preview:</span>
                    <span className="font-mono">{calcVaultUtilizationPct}%</span>
                  </div>
                  <div className="w-full bg-emerald-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full"
                      style={{ width: `${calcVaultUtilizationPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-emerald-700 mt-1 block">
                    Calculated from ({calcTotalInventoryWeight.toFixed(2)} kg / {vaultCapacityKg} kg safe capacity)
                  </span>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Vault Hardware Specification
                  </label>
                  <input
                    type="text"
                    value={securityTier}
                    onChange={(e) => setSecurityTier(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Audit Notes / Comments
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Monthly physical reconciliation completed with Zero weight discrepancy."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  />
                </div>

                <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddStockOpen(false)}
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
                        <Boxes className="w-3.5 h-3.5" />
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

      {/* Modal: Stock Details */}
      {isDetailModalOpen && selectedStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#e5e7eb] w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="px-5 py-4 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-medium text-neutral-900">
                    {selectedStock.branch_name} ({selectedStock.branch_code})
                  </h3>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {selectedStock.city} • Last Audited: {selectedStock.last_audited_date}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                  <span className="text-[10px] text-neutral-500 block uppercase">Gold Weight</span>
                  <span className="text-base font-mono font-medium text-neutral-900">
                    {Number(selectedStock.gold_weight_kg || 0).toFixed(3)} kg
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                  <span className="text-[10px] text-neutral-500 block uppercase">Diamonds</span>
                  <span className="text-base font-mono font-medium text-blue-700">
                    {Number(selectedStock.diamond_carats || 0).toFixed(2)} cts
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                  <span className="text-[10px] text-neutral-500 block uppercase">Silver Articles</span>
                  <span className="text-base font-mono font-medium text-neutral-800">
                    {Number(selectedStock.silver_articles_kg || 0).toFixed(2)} kg
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                  <span className="text-[10px] text-neutral-500 block uppercase">Valuation</span>
                  <span className="text-base font-mono font-medium text-emerald-700">
                    ₹{Number(selectedStock.valuation_cr || 0).toFixed(2)} Cr
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-emerald-900 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    Vault Capacity Utilization
                  </span>
                  <span className="font-mono">{selectedStock.vault_utilization_pct || 0}% Used</span>
                </div>
                <div className="w-full bg-emerald-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full"
                    style={{ width: `${selectedStock.vault_utilization_pct || 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-neutral-600">
                  <span>Vault Storage Spec: {selectedStock.security_vault_tier || 'Class AA Safe'}</span>
                  <span>Safe Limit: {selectedStock.vault_capacity_kg || 20} kg</span>
                </div>
              </div>

              {selectedStock.notes && (
                <div className="p-3 rounded-md bg-[#f8fafc] border border-[#e2e8f0] text-xs">
                  <span className="font-medium text-neutral-700 block mb-1">Audit Notes:</span>
                  <p className="text-neutral-600">{selectedStock.notes}</p>
                </div>
              )}

              {/* Quick Interlink Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#e2e8f0]">
                <Link
                  href="/branches/transfers"
                  className="px-3 py-1.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Initiate Transfer from this Store
                </Link>
                <Link
                  href="/inventory/ornaments"
                  className="px-3 py-1.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Consolidated SKU List
                </Link>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between">
              <span className="text-[11px] text-neutral-500 font-mono">
                Firestore ID: {selectedStock.id}
              </span>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {stockToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-red-200 w-full max-w-md overflow-hidden p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-neutral-900">
                  Delete Branch Stock Record?
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Are you sure you want to delete the stock record for <span className="font-medium text-neutral-800">{stockToDelete.branch_name}</span>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => setStockToDelete(null)}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteStock}
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
