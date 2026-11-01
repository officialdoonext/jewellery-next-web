'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Radio,
  Tv,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Monitor,
  RefreshCw,
  Send,
  X,
  Copy,
  Check,
  Building2,
  AlertTriangle,
  Play,
  RotateCcw,
  Loader2,
  AlertCircle,
  Trash2,
  Plus,
  ArrowRightLeft,
  Boxes,
  FileSpreadsheet,
  TrendingUp,
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

export interface BranchRateSync {
  id: string;
  branch_name: string;
  city: string;
  gold_24k_rate: number;
  gold_22k_rate: number;
  gold_18k_rate: number;
  silver_rate_g: number;
  regional_differential_applied: number;
  last_synced_time: string;
  display_board_status: 'ONLINE' | 'SYNCING' | 'OFFLINE';
  hardware_ip: string;
  led_panels_count: number;
  broadcast_notes?: string;
  created_at?: string;
}

export function BranchesRatesView() {
  const [rates, setRates] = useState<BranchRateSync[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Filters & Search
  const [filterCity, setFilterCity] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [isBroadcastDrawerOpen, setIsBroadcastDrawerOpen] = useState(false);
  const [isAddBoardOpen, setIsAddBoardOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchRateSync | null>(null);
  const [isLedPreviewModalOpen, setIsLedPreviewModalOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<BranchRateSync | null>(null);

  // Central Rate Broadcast Form State
  const [base24kRate, setBase24kRate] = useState<number>(8560.0);
  const [base22kRate, setBase22kRate] = useState<number>(7850.0);
  const [base18kRate, setBase18kRate] = useState<number>(6420.0);
  const [baseSilverRate, setBaseSilverRate] = useState<number>(102.5);
  const [broadcastReason, setBroadcastReason] = useState('Morning Market Open IBJA Fix');

  // Add Board Form State
  const [newBranchName, setNewBranchName] = useState('');
  const [newCity, setNewCity] = useState('Hyderabad');
  const [newDifferential, setNewDifferential] = useState<number>(0);
  const [newIp, setNewIp] = useState('192.168.10.240');
  const [newPanelsCount, setNewPanelsCount] = useState<number>(2);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const fetchRates = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'branches_rates'));
      const list: BranchRateSync[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<BranchRateSync, 'id'>) });
      });
      setRates(list);
    } catch (err: any) {
      console.error('Error fetching rates:', err);
      showToast('error', err.message || 'Failed to fetch rate boards from Firestore');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAddBoard = () => {
    setNewBranchName('');
    setNewCity('Hyderabad');
    setNewDifferential(0);
    setNewIp(`192.168.${rates.length + 10}.240`);
    setNewPanelsCount(2);
    setIsAddBoardOpen(true);
  };

  const handleSaveBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) {
      showToast('error', 'Please provide branch name');
      return;
    }

    try {
      setSaving(true);
      const diff = Number(newDifferential) || 0;
      const payload: Omit<BranchRateSync, 'id'> = {
        branch_name: newBranchName.trim(),
        city: newCity.trim(),
        gold_24k_rate: Number((base24kRate + diff).toFixed(2)),
        gold_22k_rate: Number((base22kRate + diff).toFixed(2)),
        gold_18k_rate: Number((base18kRate + diff).toFixed(2)),
        silver_rate_g: Number(baseSilverRate.toFixed(2)),
        regional_differential_applied: diff,
        last_synced_time: new Date().toISOString().replace('T', ' ').substring(0, 16),
        display_board_status: 'ONLINE',
        hardware_ip: newIp.trim(),
        led_panels_count: Number(newPanelsCount) || 2,
        broadcast_notes: 'Initial setup synchronization',
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'branches_rates'), payload);
      setRates((prev) => [{ id: docRef.id, ...payload }, ...prev]);
      setIsAddBoardOpen(false);
      showToast('success', `Display board configured for ${payload.branch_name}`);
    } catch (err: any) {
      console.error('Error adding display board:', err);
      showToast('error', err.message || 'Failed to add display board');
    } finally {
      setSaving(false);
    }
  };

  const handleBroadcastRates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rates.length === 0) {
      showToast('error', 'No branch boards connected to broadcast rates to.');
      return;
    }

    try {
      setSaving(true);
      const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

      const updatePromises = rates.map((board) => {
        const diff = Number(board.regional_differential_applied) || 0;
        const updated24k = Number((Number(base24kRate) + diff).toFixed(2));
        const updated22k = Number((Number(base22kRate) + diff).toFixed(2));
        const updated18k = Number((Number(base18kRate) + diff).toFixed(2));
        const updatedSilver = Number(Number(baseSilverRate).toFixed(2));

        return updateDoc(doc(db, 'branches_rates', board.id), {
          gold_24k_rate: updated24k,
          gold_22k_rate: updated22k,
          gold_18k_rate: updated18k,
          silver_rate_g: updatedSilver,
          last_synced_time: now,
          display_board_status: 'ONLINE',
          broadcast_notes: broadcastReason.trim(),
        });
      });

      await Promise.all(updatePromises);

      setRates((prev) =>
        prev.map((b) => {
          const diff = Number(b.regional_differential_applied) || 0;
          return {
            ...b,
            gold_24k_rate: Number((Number(base24kRate) + diff).toFixed(2)),
            gold_22k_rate: Number((Number(base22kRate) + diff).toFixed(2)),
            gold_18k_rate: Number((Number(base18kRate) + diff).toFixed(2)),
            silver_rate_g: Number(Number(baseSilverRate).toFixed(2)),
            last_synced_time: now,
            display_board_status: 'ONLINE',
            broadcast_notes: broadcastReason.trim(),
          };
        })
      );

      setIsBroadcastDrawerOpen(false);
      showToast('success', `Live rates pushed to all ${rates.length} showroom display boards!`);
    } catch (err: any) {
      console.error('Error broadcasting rates:', err);
      showToast('error', err.message || 'Failed to broadcast rates');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleBoardStatus = async (boardId: string, currentStatus: BranchRateSync['display_board_status']) => {
    const statuses: BranchRateSync['display_board_status'][] = ['ONLINE', 'SYNCING', 'OFFLINE'];
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];

    try {
      await updateDoc(doc(db, 'branches_rates', boardId), { display_board_status: nextStatus });
      setRates((prev) =>
        prev.map((b) => (b.id === boardId ? { ...b, display_board_status: nextStatus } : b))
      );
      if (selectedBranch?.id === boardId) {
        setSelectedBranch({ ...selectedBranch, display_board_status: nextStatus });
      }
      showToast('success', `Board status set to ${nextStatus}`);
    } catch (err: any) {
      console.error('Error updating board status:', err);
      showToast('error', err.message || 'Failed to update board status');
    }
  };

  const handleDeleteBoard = async () => {
    if (!boardToDelete) return;
    try {
      setSaving(true);
      await deleteDoc(doc(db, 'branches_rates', boardToDelete.id));
      setRates((prev) => prev.filter((b) => b.id !== boardToDelete.id));
      if (selectedBranch?.id === boardToDelete.id) {
        setSelectedBranch(null);
        setIsLedPreviewModalOpen(false);
      }
      showToast('success', `Display board for ${boardToDelete.branch_name} deleted.`);
      setBoardToDelete(null);
    } catch (err: any) {
      console.error('Error deleting board:', err);
      showToast('error', err.message || 'Failed to delete display board');
    } finally {
      setSaving(false);
    }
  };

  const filteredRates = rates.filter((b) => {
    if (filterCity !== 'ALL' && b.city !== filterCity) return false;
    if (filterStatus !== 'ALL' && b.display_board_status !== filterStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = (b.branch_name || '').toLowerCase().includes(q);
      const matchCity = (b.city || '').toLowerCase().includes(q);
      const matchIp = (b.hardware_ip || '').toLowerCase().includes(q);
      if (!matchName && !matchCity && !matchIp) return false;
    }
    return true;
  });

  const onlineCount = rates.filter((r) => r.display_board_status === 'ONLINE').length;
  const totalPanels = rates.reduce((acc, curr) => acc + (Number(curr.led_panels_count) || 0), 0);
  const avg22kRate = rates.length > 0
    ? rates.reduce((acc, curr) => acc + (Number(curr.gold_22k_rate) || 0), 0) / rates.length
    : 7850;
  const uniqueCities = Array.from(new Set(rates.map((r) => r.city).filter(Boolean)));

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="branches_rates" />
      <ActionToolbar
        filterPlaceholder="Filter by branch, city, display IP address..."
        insertLabel="Broadcast Central Rates"
        onInsertClick={() => setIsBroadcastDrawerOpen(true)}
        onRefresh={fetchRates}
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
            className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] flex items-center gap-1"
          >
            <Radio className="w-3 h-3 text-emerald-600" />
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
            href="/rates/gold-rates"
            className="text-emerald-700 hover:underline flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200"
          >
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            Master IBJA Bullion Rates
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI metrics */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Display Hardware</span>
                <Tv className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">{rates.length} Boards</div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {onlineCount}/{rates.length} Active Showroom Boards
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Average 22K (916) Rate</span>
                <Radio className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">
                ₹{avg22kRate.toFixed(2)}/g
              </div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                IBJA Benchmark + Offsets
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-blue-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">LED Matrix Panels</span>
                <Monitor className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">{totalPanels} Panels</div>
              <div className="text-[11px] text-blue-600 mt-1 font-mono">
                Digital Window Billboards
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Broadcast Latency</span>
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">0.4s Instant</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                MQTT / WebSocket Push
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
                <span className="text-[11px] text-neutral-500">Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer font-medium"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ONLINE">Online</option>
                  <option value="SYNCING">Syncing</option>
                  <option value="OFFLINE">Offline</option>
                </select>
              </div>

              <button
                onClick={fetchRates}
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
                placeholder="Search branch, city, IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 px-2.5 py-1 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none placeholder:text-neutral-400 font-mono"
              />
              <button
                onClick={handleOpenAddBoard}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-white text-neutral-700 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Board</span>
              </button>
              <button
                onClick={() => setIsBroadcastDrawerOpen(true)}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Broadcast Rates</span>
              </button>
            </div>
          </div>
        </div>

        {/* Supabase-style Table */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  public.branches_rates
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  {loading
                    ? 'Loading boards...'
                    : `Showing ${filteredRates.length} of ${rates.length} display boards`}
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
                    <span className="text-xs font-medium">Loading rate push status from Firebase...</span>
                  </div>
                ) : filteredRates.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                      <Radio className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-medium text-neutral-800">
                      {rates.length === 0 ? 'No Branch Display Boards Configured' : 'No Display Boards Match Filter'}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                      {rates.length === 0
                        ? 'No branch LED rate display boards have been configured. Register your showroom LED billboard to enable 1-click synchronized rate push.'
                        : 'No rate display boards match your active search and filter criteria.'}
                    </p>
                    {rates.length === 0 && (
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <button
                          onClick={handleOpenAddBoard}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add First Display Board
                        </button>
                        <Link
                          href="/rates/gold-rates"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View Master Bullion Rates
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#fcfcfc] border-b border-[#e5e7eb] text-neutral-600 font-mono text-[11px]">
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">branch_name & city</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">gold_24k (999)</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">gold_22k (916)</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">gold_18k (750)</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">silver_rate/g</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">regional_offset</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">board_status</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">last_synced_time</span>
                        </th>
                        <th className="px-3 py-2 font-medium whitespace-nowrap text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {filteredRates.map((item) => (
                        <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                            <div className="font-medium text-neutral-800">{item.branch_name}</div>
                            <span className="text-[10px] text-neutral-500 font-mono">
                              {item.city} • IP: {item.hardware_ip} ({item.led_panels_count} Panels)
                            </span>
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono font-medium text-neutral-900">
                            ₹{Number(item.gold_24k_rate || 0).toFixed(2)}
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono font-medium text-emerald-700">
                            ₹{Number(item.gold_22k_rate || 0).toFixed(2)}
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono text-neutral-700">
                            ₹{Number(item.gold_18k_rate || 0).toFixed(2)}
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono text-neutral-800">
                            ₹{Number(item.silver_rate_g || 0).toFixed(2)}
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono">
                            {(item.regional_differential_applied || 0) > 0 ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-800 border border-amber-200">
                                +₹{item.regional_differential_applied}/g
                              </span>
                            ) : (
                              <span className="text-neutral-400">₹0.00</span>
                            )}
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                            <button
                              onClick={() => handleToggleBoardStatus(item.id, item.display_board_status)}
                              title="Click to toggle status: ONLINE -> SYNCING -> OFFLINE"
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono transition-colors cursor-pointer ${
                                item.display_board_status === 'ONLINE'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                  : item.display_board_status === 'SYNCING'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                                  : 'bg-neutral-100 text-neutral-600 border border-neutral-300 hover:bg-neutral-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.display_board_status === 'ONLINE'
                                    ? 'bg-emerald-500'
                                    : item.display_board_status === 'SYNCING'
                                    ? 'bg-blue-500 animate-pulse'
                                    : 'bg-neutral-400'
                                }`}
                              />
                              {item.display_board_status}
                            </button>
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-[11px] text-neutral-500">
                            {item.last_synced_time}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedBranch(item);
                                  setIsLedPreviewModalOpen(true);
                                }}
                                className="p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                                title="View LED Display Billboard Preview"
                              >
                                <Tv className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setBoardToDelete(item)}
                                className="p-1 rounded text-neutral-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete display board"
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.branches_rates (
                  <br />
                  &nbsp;&nbsp;id <span className="text-purple-400">UUID</span>{' '}
                  <span className="text-neutral-400">PRIMARY KEY DEFAULT gen_random_uuid()</span>,
                  <br />
                  &nbsp;&nbsp;branch_name <span className="text-purple-400">VARCHAR(100)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;city <span className="text-purple-400">VARCHAR(60)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;gold_24k_rate <span className="text-purple-400">NUMERIC(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;gold_22k_rate <span className="text-purple-400">NUMERIC(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;gold_18k_rate <span className="text-purple-400">NUMERIC(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;silver_rate_g <span className="text-purple-400">NUMERIC(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;regional_differential_applied <span className="text-purple-400">NUMERIC(10,2)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0.00</span>,
                  <br />
                  &nbsp;&nbsp;display_board_status <span className="text-purple-400">VARCHAR(20)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;ONLINE&apos;</span>,
                  <br />
                  &nbsp;&nbsp;hardware_ip <span className="text-purple-400">VARCHAR(45)</span>,
                  <br />
                  &nbsp;&nbsp;last_synced_time <span className="text-purple-400">TIMESTAMPTZ</span>,
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

      {/* Drawer: Add New Display Board */}
      {isAddBoardOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs transition-all">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-medium text-neutral-900">
                    Configure Branch Rate Display Board
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddBoardOpen(false)}
                  className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveBoard} className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Showroom Branch Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jubilee Hills Boutique"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      City
                    </label>
                    <input
                      type="text"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Regional Premium (₹/g)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={newDifferential}
                      onChange={(e) => setNewDifferential(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Hardware IP Address
                    </label>
                    <input
                      type="text"
                      value={newIp}
                      onChange={(e) => setNewIp(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      LED Panels Count
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={16}
                      value={newPanelsCount}
                      onChange={(e) => setNewPanelsCount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
                </div>

                {/* Rate Preview with differential */}
                <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-2 text-xs">
                  <span className="font-medium text-neutral-700 block">Calculated Initial Rates for Board:</span>
                  <div className="grid grid-cols-3 gap-2 text-center font-mono">
                    <div className="p-2 bg-white rounded border border-[#e2e8f0]">
                      <span className="text-[10px] text-neutral-400 block">24K</span>
                      <span className="font-medium text-neutral-900">₹{(base24kRate + Number(newDifferential || 0)).toFixed(2)}</span>
                    </div>
                    <div className="p-2 bg-white rounded border border-[#e2e8f0]">
                      <span className="text-[10px] text-neutral-400 block">22K</span>
                      <span className="font-medium text-emerald-700">₹{(base22kRate + Number(newDifferential || 0)).toFixed(2)}</span>
                    </div>
                    <div className="p-2 bg-white rounded border border-[#e2e8f0]">
                      <span className="text-[10px] text-neutral-400 block">Silver</span>
                      <span className="font-medium text-neutral-800">₹{baseSilverRate.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddBoardOpen(false)}
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
                        <Tv className="w-3.5 h-3.5" />
                        <span>Save Board to Firestore</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Drawer: Broadcast Central Rates to All Boards */}
      {isBroadcastDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs transition-all">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-medium text-neutral-900">
                    Central 1-Click Bullion Rate Broadcast
                  </h3>
                </div>
                <button
                  onClick={() => setIsBroadcastDrawerOpen(false)}
                  className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleBroadcastRates} className="p-5 space-y-4">
                <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs text-neutral-700 space-y-1">
                  <div className="font-medium text-emerald-900 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    Synchronized Broadcast Controller
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Updating these benchmark rates will push new rates to all {rates.length} showroom display boards simultaneously, applying city-specific differentials.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Base Gold 24K (999) ₹/g
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={base24kRate}
                      onChange={(e) => setBase24kRate(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Base Gold 22K (916) ₹/g
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={base22kRate}
                      onChange={(e) => setBase22kRate(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Base Gold 18K (750) ₹/g
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={base18kRate}
                      onChange={(e) => setBase18kRate(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Base Silver Rate ₹/g
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={baseSilverRate}
                      onChange={(e) => setBaseSilverRate(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Broadcast Trigger Note / Audit Reason
                  </label>
                  <input
                    type="text"
                    value={broadcastReason}
                    onChange={(e) => setBroadcastReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    required
                  />
                </div>

                {/* Target Board Preview */}
                <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-2 text-xs">
                  <div className="flex justify-between items-center text-neutral-700 font-medium">
                    <span>Target Connected Showrooms:</span>
                    <span className="font-mono text-emerald-700">{rates.length} Boards</span>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                    {rates.map((b) => {
                      const diff = Number(b.regional_differential_applied) || 0;
                      return (
                        <div key={b.id} className="p-2 rounded bg-white border border-[#e2e8f0] flex justify-between items-center text-[11px]">
                          <div>
                            <span className="font-medium text-neutral-800">{b.branch_name}</span>
                            <span className="text-[10px] text-neutral-400 block">Offset: +₹{diff}/g</span>
                          </div>
                          <div className="text-right font-mono">
                            <span className="font-medium text-emerald-700">₹{(base22kRate + diff).toFixed(2)}</span>
                            <span className="text-[10px] text-neutral-400 block">22K Final</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBroadcastDrawerOpen(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || rates.length === 0}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Broadcasting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Push Rates to All Boards</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: LED Display Billboard Preview */}
      {isLedPreviewModalOpen && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-neutral-950 text-neutral-100 rounded-xl shadow-2xl border border-neutral-800 w-full max-w-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-medium text-neutral-100 font-mono tracking-wider">
                  {selectedBranch.branch_name} • SHOWROOM LED BOARD
                </h3>
              </div>
              <button
                onClick={() => setIsLedPreviewModalOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Digital LED Matrix Display */}
            <div className="bg-black border-2 border-neutral-700 rounded-lg p-5 font-mono shadow-inner space-y-4">
              <div className="text-center border-b border-neutral-800 pb-2">
                <div className="text-xs text-amber-400 tracking-widest uppercase">
                  TODAY&apos;S OFFICIAL BULLION RATES
                </div>
                <div className="text-[10px] text-neutral-400">
                  {selectedBranch.city} Cluster • Live Synchronized {selectedBranch.last_synced_time}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-neutral-900/90 border border-amber-500/30 p-3 rounded">
                  <span className="text-[10px] text-amber-300 block tracking-wider">GOLD 24KT (999)</span>
                  <span className="text-xl font-medium text-amber-400 tracking-wider">
                    ₹{Number(selectedBranch.gold_24k_rate || 0).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">per gram</span>
                </div>

                <div className="bg-neutral-900/90 border border-emerald-500/30 p-3 rounded">
                  <span className="text-[10px] text-emerald-300 block tracking-wider">GOLD 22KT (916)</span>
                  <span className="text-xl font-medium text-emerald-400 tracking-wider">
                    ₹{Number(selectedBranch.gold_22k_rate || 0).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">per gram</span>
                </div>

                <div className="bg-neutral-900/90 border border-neutral-700 p-3 rounded">
                  <span className="text-[10px] text-neutral-300 block tracking-wider">GOLD 18KT (750)</span>
                  <span className="text-lg font-medium text-neutral-200 tracking-wider">
                    ₹{Number(selectedBranch.gold_18k_rate || 0).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">per gram</span>
                </div>

                <div className="bg-neutral-900/90 border border-neutral-700 p-3 rounded">
                  <span className="text-[10px] text-neutral-300 block tracking-wider">SILVER 999</span>
                  <span className="text-lg font-medium text-neutral-200 tracking-wider">
                    ₹{Number(selectedBranch.silver_rate_g || 0).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">per gram</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-neutral-500 pt-1">
                Hardware Feed IP: {selectedBranch.hardware_ip} • MQTT Channel: branches/{selectedBranch.city.toLowerCase()}/rates
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-[11px] text-neutral-500 font-mono">
                Differential Applied: +₹{selectedBranch.regional_differential_applied || 0}/g
              </span>
              <button
                onClick={() => setIsLedPreviewModalOpen(false)}
                className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-neutral-800 text-white hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {boardToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-red-200 w-full max-w-md overflow-hidden p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-neutral-900">
                  Delete Display Board?
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Are you sure you want to remove the display board configuration for <span className="font-medium text-neutral-800">{boardToDelete.branch_name}</span>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => setBoardToDelete(null)}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteBoard}
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
