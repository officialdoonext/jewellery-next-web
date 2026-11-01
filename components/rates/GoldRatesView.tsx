'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  TrendingUp,
  Coins,
  Radio,
  Tv,
  RefreshCw,
  Plus,
  Check,
  ArrowUpRight,
  ShieldCheck,
  Scale,
  Sparkles,
  Copy,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Send,
  X,
  SlidersHorizontal,
  Trash2,
  Loader2,
  ArrowRight,
  Store,
  Gem,
  Percent,
  Flame,
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

export interface GoldRateRow {
  id: string;
  karat: string;
  purity_code: string;
  purity_percent: number;
  sell_rate_per_g: number;
  buy_rate_per_g: number;
  sovereign_10g_rate: number;
  bar_100g_rate: number;
  effective_time: string;
  published_by: string;
  status: 'CURRENT_ACTIVE' | 'ARCHIVED';
  notes?: string;
  created_at?: string;
}

export function RatesGoldRatesView() {
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [rates, setRates] = useState<GoldRateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CURRENT_ACTIVE' | 'ARCHIVED'>('ALL');

  // Toast State
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Broadcast & Quick Update Modal State
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [base24kRate, setBase24kRate] = useState('8120');
  const [buybackMargin, setBuybackMargin] = useState('110');
  const [broadcastTarget, setBroadcastTarget] = useState('ALL_BOARDS_AND_POS');
  const [broadcastPublisher, setBroadcastPublisher] = useState('Chief Valuer');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Custom Single Rate Modal State
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customKarat, setCustomKarat] = useState('22K (Hallmark 916)');
  const [customPurityCode, setCustomPurityCode] = useState('Au 916 (BIS)');
  const [customPurityPercent, setCustomPurityPercent] = useState('91.67');
  const [customSellRate, setCustomSellRate] = useState('7850');
  const [customBuyRate, setCustomBuyRate] = useState('7720');
  const [customPublishedBy, setCustomPublishedBy] = useState('Chief Valuer');
  const [customNotes, setCustomNotes] = useState('Daily standard hallmark rate');

  // Quick Calculator State
  const [calcKarat, setCalcKarat] = useState('22K');
  const [calcGrams, setCalcGrams] = useState('8.000');
  const [calcWastage, setCalcWastage] = useState('10.0');
  const [calcMakingPerGram, setCalcMakingPerGram] = useState('450');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const fetchRates = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'rates_gold'));
      const list: GoldRateRow[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<GoldRateRow, 'id'>) });
      });
      // Sort by status (active first) then created_at desc if available
      list.sort((a, b) => {
        if (a.status === 'CURRENT_ACTIVE' && b.status !== 'CURRENT_ACTIVE') return -1;
        if (a.status !== 'CURRENT_ACTIVE' && b.status === 'CURRENT_ACTIVE') return 1;
        return (b.created_at || '').localeCompare(a.created_at || '');
      });
      setRates(list);
    } catch (err: any) {
      console.error('Error fetching gold rates:', err);
      showToast('error', err.message || 'Failed to fetch gold rates from Firestore');
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

  // Broadcast & Save multi-karat rates
  const handleBroadcastRates = async (e: React.FormEvent) => {
    e.preventDefault();
    const rate24 = parseFloat(base24kRate) || 8120;
    const margin = parseFloat(buybackMargin) || 110;
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
    const timestamp = `${dateStr} ${timeStr}`;
    const isoNow = new Date().toISOString();

    const rate22 = Math.round(rate24 * (22 / 24) * 10) / 10;
    const rate18 = Math.round(rate24 * (18 / 24) * 10) / 10;
    const rate14 = Math.round(rate24 * (14 / 24) * 10) / 10;

    const payloadItems: Omit<GoldRateRow, 'id'>[] = [
      {
        karat: '24K (Pure 999)',
        purity_code: 'Au 999',
        purity_percent: 99.9,
        sell_rate_per_g: Math.round(rate24 * 10) / 10,
        buy_rate_per_g: Math.round((rate24 - margin) * 10) / 10,
        sovereign_10g_rate: Math.round(rate24 * 10),
        bar_100g_rate: Math.round(rate24 * 100),
        effective_time: timestamp,
        published_by: broadcastPublisher.trim() || 'Chief Valuer',
        status: 'CURRENT_ACTIVE',
        notes: `Broadcast to ${broadcastTarget.replace(/_/g, ' ')}`,
        created_at: isoNow,
      },
      {
        karat: '22K (Hallmark 916)',
        purity_code: 'Au 916 (BIS)',
        purity_percent: 91.67,
        sell_rate_per_g: rate22,
        buy_rate_per_g: Math.round((rate22 - margin) * 10) / 10,
        sovereign_10g_rate: Math.round(rate22 * 10),
        bar_100g_rate: Math.round(rate22 * 100),
        effective_time: timestamp,
        published_by: broadcastPublisher.trim() || 'Chief Valuer',
        status: 'CURRENT_ACTIVE',
        notes: `Broadcast to ${broadcastTarget.replace(/_/g, ' ')}`,
        created_at: isoNow,
      },
      {
        karat: '18K (Jewellery 750)',
        purity_code: 'Au 750',
        purity_percent: 75.0,
        sell_rate_per_g: rate18,
        buy_rate_per_g: Math.round((rate18 - margin) * 10) / 10,
        sovereign_10g_rate: Math.round(rate18 * 10),
        bar_100g_rate: Math.round(rate18 * 100),
        effective_time: timestamp,
        published_by: broadcastPublisher.trim() || 'Chief Valuer',
        status: 'CURRENT_ACTIVE',
        notes: `Broadcast to ${broadcastTarget.replace(/_/g, ' ')}`,
        created_at: isoNow,
      },
      {
        karat: '14K (Jewellery 585)',
        purity_code: 'Au 585',
        purity_percent: 58.5,
        sell_rate_per_g: rate14,
        buy_rate_per_g: Math.round((rate14 - margin) * 10) / 10,
        sovereign_10g_rate: Math.round(rate14 * 10),
        bar_100g_rate: Math.round(rate14 * 100),
        effective_time: timestamp,
        published_by: broadcastPublisher.trim() || 'Chief Valuer',
        status: 'CURRENT_ACTIVE',
        notes: `Broadcast to ${broadcastTarget.replace(/_/g, ' ')}`,
        created_at: isoNow,
      },
    ];

    try {
      setSaving(true);
      // Optional: Archive currently active existing rates in Firestore
      const activeCurrent = rates.filter((r) => r.status === 'CURRENT_ACTIVE');
      for (const cur of activeCurrent) {
        await updateDoc(doc(db, 'rates_gold', cur.id), { status: 'ARCHIVED' });
      }

      const inserted: GoldRateRow[] = [];
      for (const item of payloadItems) {
        const docRef = await addDoc(collection(db, 'rates_gold'), item);
        inserted.push({ id: docRef.id, ...item });
      }

      setRates((prev) => [
        ...inserted,
        ...prev.map((r) => ({ ...r, status: 'ARCHIVED' as const })),
      ]);

      setBroadcastSuccess(true);
      showToast('success', `Live gold rates broadcasted & synced across 4 karats.`);
      setTimeout(() => {
        setBroadcastSuccess(false);
        setIsUpdateModalOpen(false);
      }, 1200);
    } catch (err: any) {
      console.error('Error broadcasting gold rates:', err);
      showToast('error', err.message || 'Failed to save gold rates');
    } finally {
      setSaving(false);
    }
  };

  // Add Custom Single Karat Rate
  const handleAddCustomRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customKarat.trim() || !customSellRate) return;

    const sell = parseFloat(customSellRate) || 0;
    const buy = parseFloat(customBuyRate) || sell - 100;
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

    const newRate: Omit<GoldRateRow, 'id'> = {
      karat: customKarat.trim(),
      purity_code: customPurityCode.trim() || 'Au',
      purity_percent: parseFloat(customPurityPercent) || 91.67,
      sell_rate_per_g: sell,
      buy_rate_per_g: buy,
      sovereign_10g_rate: Math.round(sell * 10),
      bar_100g_rate: Math.round(sell * 100),
      effective_time: `${dateStr} ${timeStr}`,
      published_by: customPublishedBy.trim() || 'Chief Valuer',
      status: 'CURRENT_ACTIVE',
      notes: customNotes.trim(),
      created_at: new Date().toISOString(),
    };

    try {
      setSaving(true);
      const docRef = await addDoc(collection(db, 'rates_gold'), newRate);
      setRates((prev) => [{ id: docRef.id, ...newRate }, ...prev]);
      setIsCustomModalOpen(false);
      showToast('success', `Gold rate for "${customKarat}" created successfully.`);
    } catch (err: any) {
      console.error('Error adding custom rate:', err);
      showToast('error', err.message || 'Failed to add custom rate');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'CURRENT_ACTIVE' ? 'ARCHIVED' : 'CURRENT_ACTIVE';
    try {
      await updateDoc(doc(db, 'rates_gold', id), { status: nextStatus });
      setRates((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: nextStatus as any } : r))
      );
      showToast('success', `Rate marked as ${nextStatus}`);
    } catch (err: any) {
      console.error('Error updating status:', err);
      showToast('error', err.message || 'Failed to update rate status');
    }
  };

  const handleDeleteRate = async (id: string, karat: string) => {
    if (!confirm(`Delete gold rate entry for "${karat}"? This action cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'rates_gold', id));
      setRates((prev) => prev.filter((r) => r.id !== id));
      showToast('success', `Gold rate "${karat}" deleted.`);
    } catch (err: any) {
      console.error('Error deleting rate:', err);
      showToast('error', err.message || 'Failed to delete gold rate');
    }
  };

  const filteredRates = rates.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        r.karat?.toLowerCase().includes(q) ||
        r.purity_code?.toLowerCase().includes(q) ||
        r.published_by?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate quick quote from dynamic rates
  const calcGramsNum = parseFloat(calcGrams) || 0;
  const current22k = rates.find((r) => r.karat.includes('22K') && r.status === 'CURRENT_ACTIVE')?.sell_rate_per_g || 7850;
  const current18k = rates.find((r) => r.karat.includes('18K') && r.status === 'CURRENT_ACTIVE')?.sell_rate_per_g || 6420;
  const current24k = rates.find((r) => r.karat.includes('24K') && r.status === 'CURRENT_ACTIVE')?.sell_rate_per_g || 8120;
  const activeCalcRate = calcKarat === '24K' ? current24k : calcKarat === '18K' ? current18k : current22k;
  const goldValue = calcGramsNum * activeCalcRate;
  const wastageGrams = calcGramsNum * ((parseFloat(calcWastage) || 0) / 100);
  const wastageValue = wastageGrams * activeCalcRate;
  const makingValue = calcGramsNum * (parseFloat(calcMakingPerGram) || 0);
  const subtotal = goldValue + wastageValue + makingValue;
  const gstAmount = subtotal * 0.03;
  const grandTotal = subtotal + gstAmount;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="rates_gold" />
      <ActionToolbar
        filterPlaceholder="Search gold rates by karat, purity code, or valuer..."
        insertLabel="Broadcast Rates"
        onInsertClick={() => setIsUpdateModalOpen(true)}
        onRefresh={fetchRates}
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

          {/* Cross-Module Quick Navigation Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-[#e2e8f0] rounded-lg shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Rates & Valuation Hub:
              </span>
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <Link
                  href="/rates/gold-rates"
                  className="px-2.5 py-1 bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-md font-medium text-xs flex items-center gap-1 shadow-2xs"
                >
                  <Coins className="w-3 h-3 text-emerald-600" /> Gold Rates
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
                  className="px-2.5 py-1 bg-white border border-neutral-200 text-neutral-600 hover:text-emerald-700 hover:border-emerald-200 rounded-md font-medium text-xs flex items-center gap-1 transition-colors"
                >
                  <Flame className="w-3 h-3 text-neutral-400" /> Old Gold Assay
                </Link>
              </div>
            </div>

            {/* Related Outbound Links */}
            <div className="flex items-center gap-2">
              <Link
                href="/sales/billing-pos"
                className="text-xs px-2.5 py-1 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-md font-medium flex items-center gap-1 transition-colors shadow-2xs"
                title="Use Current Rate in POS Billing"
              >
                <Store className="w-3 h-3 text-emerald-600" />
                <span>Open POS Billing</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </Link>
              <Link
                href="/inventory/ornaments"
                className="text-xs px-2.5 py-1 bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-300 rounded-md font-medium flex items-center gap-1 transition-colors shadow-2xs"
                title="Apply Rates to Ornaments"
              >
                <span>Ornaments Stock</span>
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

          {/* Top Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">24K Pure (Au 999)</span>
                <Coins className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                ₹ {current24k.toFixed(2)}
                <span className="text-[11px] text-neutral-500 font-normal"> /g</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                10g Bullion: ₹ {(current24k * 10).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">22K Standard 916</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700">
                ₹ {current22k.toFixed(2)}
                <span className="text-[11px] text-neutral-500 font-normal"> /g</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                8g Sovereign: ₹ {(current22k * 8).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">18K Hallmarked 750</span>
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                ₹ {current18k.toFixed(2)}
                <span className="text-[11px] text-neutral-500 font-normal"> /g</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Diamond mountings base</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Rate Records</span>
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{rates.length}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                {rates.filter((r) => r.status === 'CURRENT_ACTIVE').length} currently active
              </div>
            </div>
          </div>

          {/* Quick Rate Estimator & POS Estimator */}
          <div className="bg-white p-4 rounded-lg border border-[#e2e8f0] shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium text-neutral-800">
                  Instant Jewellery Estimation Calculator (Live Sync)
                </span>
              </div>
              <span className="text-[11px] text-neutral-500">
                Real-time computation including Wastage & 3% GST
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs mb-3">
              <div>
                <label className="block text-neutral-600 font-medium mb-1">Karat</label>
                <select
                  value={calcKarat}
                  onChange={(e) => setCalcKarat(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none focus:border-emerald-500"
                >
                  <option value="24K">24K Pure (₹{current24k}/g)</option>
                  <option value="22K">22K Hallmark 916 (₹{current22k}/g)</option>
                  <option value="18K">18K Jewellery 750 (₹{current18k}/g)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">Net Weight (g)</label>
                <input
                  type="number"
                  step="0.001"
                  value={calcGrams}
                  onChange={(e) => setCalcGrams(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">Wastage / VA (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={calcWastage}
                  onChange={(e) => setCalcWastage(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">Making Charge (₹/g)</label>
                <input
                  type="number"
                  step="10"
                  value={calcMakingPerGram}
                  onChange={(e) => setCalcMakingPerGram(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="bg-[#f8fafc] p-3 rounded-md border border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap gap-4 text-neutral-600">
                <div>
                  Gold Value:{' '}
                  <span className="font-mono text-neutral-800">
                    ₹{goldValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  VA Value ({calcWastage}%):{' '}
                  <span className="font-mono text-neutral-800">
                    ₹{wastageValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  Making: <span className="font-mono text-neutral-800">₹{makingValue.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  GST (3%):{' '}
                  <span className="font-mono text-neutral-800">
                    ₹{gstAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 font-medium">Estimated Total:</span>
                <span className="text-base font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  ₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
                <Link
                  href="/sales/billing-pos"
                  className="ml-2 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                >
                  <span>Apply in POS</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-2xs overflow-hidden flex flex-col">
            {/* Toolbar Header */}
            <div className="p-3 border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-neutral-800">Gold Daily Board Master</span>
                  <span className="text-[10px] text-neutral-400 font-mono bg-neutral-100 px-1.5 py-0.5 rounded">
                    rates_gold
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
                    Data Records ({filteredRates.length})
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
                  <option value="CURRENT_ACTIVE">Active Only</option>
                  <option value="ARCHIVED">Archived</option>
                </select>

                <button
                  onClick={() => setIsCustomModalOpen(true)}
                  className="px-2.5 py-1 text-xs border border-neutral-200 hover:border-emerald-300 text-neutral-700 hover:text-emerald-700 rounded bg-white transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Karat Rate</span>
                </button>

                <button
                  onClick={() => setIsUpdateModalOpen(true)}
                  className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium flex items-center gap-1 transition-colors shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast Today</span>
                </button>
              </div>
            </div>

            {/* Table or Empty State or Loading */}
            {activeTab === 'data' && (
              <>
                {loading ? (
                  <div className="p-12 flex flex-col items-center justify-center gap-3 text-neutral-500">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                    <span className="text-xs font-medium">Fetching real-time gold rates from Firestore...</span>
                  </div>
                ) : filteredRates.length === 0 ? (
                  <div className="p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3">
                      <Coins className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-sm font-medium text-neutral-800 mb-1">No Gold Rates Available</h3>
                    <p className="text-xs text-neutral-500 mb-4">
                      No gold rate entries found in the Firestore database. You can broadcast standard 24K, 22K, 18K, 14K rates in one click or add custom karat rates.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsUpdateModalOpen(true)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>Broadcast Today&apos;s Rates</span>
                      </button>
                      <button
                        onClick={() => setIsCustomModalOpen(true)}
                        className="px-3 py-1.5 bg-white border border-[#e2e8f0] text-neutral-700 hover:text-neutral-900 rounded text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Karat Rate</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-x-auto custom-scrollbar w-full">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#fcfcfc] border-b border-[#e5e7eb] text-neutral-600 font-mono text-[11px]">
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                            karat_grade
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                            purity_code
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                            sell_rate_per_g
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                            buy_rate_per_g
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                            10g_sovereign
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                            100g_bar
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                            effective_time
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                            published_by
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
                        {filteredRates.map((row) => (
                          <tr
                            key={row.id}
                            className={`hover:bg-[#f8fafc] transition-colors ${
                              row.status === 'CURRENT_ACTIVE' ? 'bg-amber-50/15' : ''
                            }`}
                          >
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className="text-neutral-900 font-medium">{row.karat}</span>
                                {row.status === 'CURRENT_ACTIVE' && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                              <span className="text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded text-[11px] font-mono">
                                {row.purity_code} ({row.purity_percent}%)
                              </span>
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right text-emerald-700 font-mono font-medium">
                              ₹ {row.sell_rate_per_g?.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right text-neutral-800 font-mono">
                              ₹ {row.buy_rate_per_g?.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right text-neutral-700 font-mono">
                              ₹ {row.sovereign_10g_rate?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right text-neutral-700 font-mono">
                              ₹ {row.bar_100g_rate?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-500 text-[11px]">
                              {row.effective_time}
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700 text-[11px]">
                              {row.published_by}
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-center">
                              <button
                                onClick={() => handleToggleStatus(row.id, row.status)}
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors cursor-pointer ${
                                  row.status === 'CURRENT_ACTIVE'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200'
                                }`}
                                title="Click to toggle status"
                              >
                                {row.status}
                              </button>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => copyToClipboard(`₹${row.sell_rate_per_g}/g`, row.id)}
                                  className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                                  title="Copy Rate"
                                >
                                  {copiedId === row.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDeleteRate(row.id, row.karat)}
                                  className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50"
                                  title="Delete Rate"
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

            {/* Schema Definition Tab */}
            {activeTab === 'definition' && (
              <div className="p-4 bg-[#fbfbfb] text-xs font-mono">
                <div className="bg-neutral-900 text-neutral-100 p-4 rounded-md overflow-x-auto shadow-inner text-[11px] leading-relaxed">
                  <span className="text-emerald-400">CREATE TABLE</span> public.rates_gold (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">karat</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">purity_code</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">purity_percent</span>{' '}
                  <span className="text-amber-300">numeric(5,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">sell_rate_per_g</span>{' '}
                  <span className="text-amber-300">numeric(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">buy_rate_per_g</span>{' '}
                  <span className="text-amber-300">numeric(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">sovereign_10g_rate</span>{' '}
                  <span className="text-amber-300">numeric(12,2)</span>,
                  <br />
                  <span className="pl-6 text-blue-300">bar_100g_rate</span>{' '}
                  <span className="text-amber-300">numeric(14,2)</span>,
                  <br />
                  <span className="pl-6 text-blue-300">effective_time</span>{' '}
                  <span className="text-amber-300">timestamptz</span>{' '}
                  <span className="text-neutral-400">DEFAULT now() NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">published_by</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>,
                  <br />
                  <span className="pl-6 text-blue-300">status</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;CURRENT_ACTIVE&apos;</span>
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Broadcast Rates Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                <h2 className="text-sm font-medium text-neutral-800">
                  Broadcast Today&apos;s Gold Daily Rates
                </h2>
              </div>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBroadcastRates} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">
                  Base 24K (Au 999) Spot Rate (₹ / gram) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={base24kRate}
                    onChange={(e) => setBase24kRate(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 font-mono">₹</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Standard benchmark rate from IBJA or bullion market
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">
                    Buyback Spread / Margin (₹ / gram)
                  </label>
                  <input
                    type="number"
                    value={buybackMargin}
                    onChange={(e) => setBuybackMargin(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-neutral-400 mt-0.5">Deduction for old gold scrap buy</p>
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Published By / Signer</label>
                  <input
                    type="text"
                    value={broadcastPublisher}
                    onChange={(e) => setBroadcastPublisher(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    placeholder="Chief Valuer / Admin"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Broadcast Target Channel</label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="ALL_BOARDS_AND_POS">All LED Display Boards + POS Billing + E-Commerce</option>
                  <option value="IN_STORE_LED_ONLY">In-Store Display Boards Only</option>
                  <option value="POS_TERMINALS_ONLY">POS Cash Counters Only</option>
                </select>
              </div>

              {/* Real-time Karat Preview Grid */}
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded p-2.5 space-y-1.5">
                <span className="text-[10px] font-medium uppercase text-neutral-500 tracking-wider">
                  Derived Rates Live Calculation:
                </span>
                <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-mono">
                  <div className="p-1.5 bg-white border border-[#e2e8f0] rounded">
                    <div className="text-neutral-500 text-[10px]">24K Pure</div>
                    <div className="font-medium text-emerald-700">₹{parseFloat(base24kRate) || 0}</div>
                  </div>
                  <div className="p-1.5 bg-white border border-[#e2e8f0] rounded">
                    <div className="text-neutral-500 text-[10px]">22K (916)</div>
                    <div className="font-medium text-neutral-800">
                      ₹{Math.round(((parseFloat(base24kRate) || 0) * (22 / 24)) * 10) / 10}
                    </div>
                  </div>
                  <div className="p-1.5 bg-white border border-[#e2e8f0] rounded">
                    <div className="text-neutral-500 text-[10px]">18K (750)</div>
                    <div className="font-medium text-neutral-800">
                      ₹{Math.round(((parseFloat(base24kRate) || 0) * (18 / 24)) * 10) / 10}
                    </div>
                  </div>
                  <div className="p-1.5 bg-white border border-[#e2e8f0] rounded">
                    <div className="text-neutral-500 text-[10px]">14K (585)</div>
                    <div className="font-medium text-neutral-800">
                      ₹{Math.round(((parseFloat(base24kRate) || 0) * (14 / 24)) * 10) / 10}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
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
                      <span>Broadcasting...</span>
                    </>
                  ) : (
                    <>
                      <Radio className="w-3.5 h-3.5" />
                      <span>Confirm & Broadcast Live</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Single Rate Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-medium text-neutral-800">Add Custom Karat Rate</h2>
              </div>
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomRate} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Karat Grade Label *</label>
                <input
                  type="text"
                  required
                  value={customKarat}
                  onChange={(e) => setCustomKarat(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. 20K Custom or 23K Special"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Purity Code</label>
                  <input
                    type="text"
                    value={customPurityCode}
                    onChange={(e) => setCustomPurityCode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    placeholder="Au 833 / Au 958"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Purity Percent (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={customPurityPercent}
                    onChange={(e) => setCustomPurityPercent(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Sell Rate (₹ / g) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={customSellRate}
                    onChange={(e) => setCustomSellRate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Buy / Scrap Rate (₹ / g)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={customBuyRate}
                    onChange={(e) => setCustomBuyRate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Published By</label>
                <input
                  type="text"
                  value={customPublishedBy}
                  onChange={(e) => setCustomPublishedBy(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  placeholder="Optional reference notes"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
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
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Save Rate</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
