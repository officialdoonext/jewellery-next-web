'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  TrendingUp,
  CircleDollarSign,
  Radio,
  Tv,
  RefreshCw,
  Plus,
  Check,
  ArrowUpRight,
  ShieldCheck,
  Scale,
  Sparkles,
  Layers,
  Calculator,
  Send,
  X,
  SlidersHorizontal,
  PackageCheck,
  FileSpreadsheet,
  Boxes,
  Loader2,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
  Coins,
  Gem,
  Percent,
  Flame,
  Store,
  ArrowRight,
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

export interface SilverRateRow {
  id: string;
  purity_grade: string;
  purity_code: string;
  purity_percent: number;
  rate_per_gram: number;
  rate_per_kg: number;
  buyback_rate_per_g: number;
  bar_1kg_rate: number;
  effective_date: string;
  updated_by: string;
  status: 'CURRENT_ACTIVE' | 'ARCHIVED';
  notes?: string;
  created_at?: string;
}

export function RatesSilverRatesView() {
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [rates, setRates] = useState<SilverRateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CURRENT_ACTIVE' | 'ARCHIVED'>('ALL');

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Broadcast Modal State
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [inputRatePerKg, setInputRatePerKg] = useState('98500');
  const [buybackDiscountPct, setBuybackDiscountPct] = useState('4.5');
  const [broadcastTarget, setBroadcastTarget] = useState('ALL');
  const [broadcastSigner, setBroadcastSigner] = useState('Chief Valuer');
  const [broadcastDone, setBroadcastDone] = useState(false);

  // Custom Silver Modal State
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customGrade, setCustomGrade] = useState('Sterling Silver 925 (Jewellery & Articles)');
  const [customPurityCode, setCustomPurityCode] = useState('Ag 925');
  const [customPurityPct, setCustomPurityPct] = useState('92.5');
  const [customRatePerG, setCustomRatePerG] = useState('91.20');
  const [customBuybackPerG, setCustomBuybackPerG] = useState('86.50');
  const [customSigner, setCustomSigner] = useState('Chief Valuer');
  const [customNotes, setCustomNotes] = useState('Standard retail silver rate');

  // Estimator state
  const [calcArticleType, setCalcArticleType] = useState('PUJA_THALI');
  const [calcGrams, setCalcGrams] = useState('250.000');
  const [calcPurity, setCalcPurity] = useState('925');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const fetchSilverRates = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'rates_silver'));
      const list: SilverRateRow[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<SilverRateRow, 'id'>) });
      });
      list.sort((a, b) => {
        if (a.status === 'CURRENT_ACTIVE' && b.status !== 'CURRENT_ACTIVE') return -1;
        if (a.status !== 'CURRENT_ACTIVE' && b.status === 'CURRENT_ACTIVE') return 1;
        return (b.created_at || '').localeCompare(a.created_at || '');
      });
      setRates(list);
    } catch (err: any) {
      console.error('Error fetching silver rates:', err);
      showToast('error', err.message || 'Failed to fetch silver rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSilverRates();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Broadcast & Sync multi-grade silver rates
  const handleUpdateSilverRates = async (e: React.FormEvent) => {
    e.preventDefault();
    const kg = parseFloat(inputRatePerKg) || 98500;
    const discount = parseFloat(buybackDiscountPct) || 4.5;
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

    const rate999g = Math.round((kg / 1000) * 10) / 10;
    const buy999g = Math.round((rate999g * (1 - discount / 100)) * 10) / 10;

    const rate925g = Math.round((rate999g * 0.925) * 10) / 10;
    const buy925g = Math.round((rate925g * (1 - discount / 100)) * 10) / 10;

    const rate800g = Math.round((rate999g * 0.8) * 10) / 10;
    const buy800g = Math.round((rate800g * (1 - discount / 100)) * 10) / 10;

    const payloadItems: Omit<SilverRateRow, 'id'>[] = [
      {
        purity_grade: 'Fine Silver 999 (Bars & Grain)',
        purity_code: 'Ag 999',
        purity_percent: 99.9,
        rate_per_gram: rate999g,
        rate_per_kg: kg,
        buyback_rate_per_g: buy999g,
        bar_1kg_rate: kg,
        effective_date: timestamp,
        updated_by: broadcastSigner.trim() || 'Chief Valuer',
        status: 'CURRENT_ACTIVE',
        notes: `Broadcast to ${broadcastTarget}`,
        created_at: isoNow,
      },
      {
        purity_grade: 'Sterling Silver 925 (Jewellery & Articles)',
        purity_code: 'Ag 925 (Standard)',
        purity_percent: 92.5,
        rate_per_gram: rate925g,
        rate_per_kg: Math.round(kg * 0.925),
        buyback_rate_per_g: buy925g,
        bar_1kg_rate: Math.round(kg * 0.925),
        effective_date: timestamp,
        updated_by: broadcastSigner.trim() || 'Chief Valuer',
        status: 'CURRENT_ACTIVE',
        notes: `Broadcast to ${broadcastTarget}`,
        created_at: isoNow,
      },
      {
        purity_grade: 'Traditional Silverware 800 (Utensils & Murtis)',
        purity_code: 'Ag 800',
        purity_percent: 80.0,
        rate_per_gram: rate800g,
        rate_per_kg: Math.round(kg * 0.8),
        buyback_rate_per_g: buy800g,
        bar_1kg_rate: Math.round(kg * 0.8),
        effective_date: timestamp,
        updated_by: broadcastSigner.trim() || 'Chief Valuer',
        status: 'CURRENT_ACTIVE',
        notes: `Broadcast to ${broadcastTarget}`,
        created_at: isoNow,
      },
    ];

    try {
      setSaving(true);
      // Archive current active
      const activeCurrent = rates.filter((r) => r.status === 'CURRENT_ACTIVE');
      for (const cur of activeCurrent) {
        await updateDoc(doc(db, 'rates_silver', cur.id), { status: 'ARCHIVED' });
      }

      const inserted: SilverRateRow[] = [];
      for (const item of payloadItems) {
        const docRef = await addDoc(collection(db, 'rates_silver'), item);
        inserted.push({ id: docRef.id, ...item });
      }

      setRates((prev) => [
        ...inserted,
        ...prev.map((r) => ({ ...r, status: 'ARCHIVED' as const })),
      ]);

      setBroadcastDone(true);
      showToast('success', `Silver rates synced for Fine 999, Sterling 925, and Silverware 800.`);
      setTimeout(() => {
        setBroadcastDone(false);
        setIsUpdateModalOpen(false);
      }, 1200);
    } catch (err: any) {
      console.error('Error saving silver rates:', err);
      showToast('error', err.message || 'Failed to save silver rates');
    } finally {
      setSaving(false);
    }
  };

  // Add Custom Silver Grade
  const handleAddCustomSilver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGrade.trim() || !customRatePerG) return;

    const rateG = parseFloat(customRatePerG) || 0;
    const buyG = parseFloat(customBuybackPerG) || rateG * 0.95;
    const kgRate = Math.round(rateG * 1000);
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

    const newRate: Omit<SilverRateRow, 'id'> = {
      purity_grade: customGrade.trim(),
      purity_code: customPurityCode.trim() || 'Ag',
      purity_percent: parseFloat(customPurityPct) || 92.5,
      rate_per_gram: rateG,
      rate_per_kg: kgRate,
      buyback_rate_per_g: buyG,
      bar_1kg_rate: kgRate,
      effective_date: `${dateStr} ${timeStr}`,
      updated_by: customSigner.trim() || 'Chief Valuer',
      status: 'CURRENT_ACTIVE',
      notes: customNotes.trim(),
      created_at: new Date().toISOString(),
    };

    try {
      setSaving(true);
      const docRef = await addDoc(collection(db, 'rates_silver'), newRate);
      setRates((prev) => [{ id: docRef.id, ...newRate }, ...prev]);
      setIsCustomModalOpen(false);
      showToast('success', `Silver rate "${customGrade}" created.`);
    } catch (err: any) {
      console.error('Error adding silver rate:', err);
      showToast('error', err.message || 'Failed to add custom silver rate');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'CURRENT_ACTIVE' ? 'ARCHIVED' : 'CURRENT_ACTIVE';
    try {
      await updateDoc(doc(db, 'rates_silver', id), { status: nextStatus });
      setRates((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: nextStatus as any } : r))
      );
      showToast('success', `Silver rate status updated to ${nextStatus}`);
    } catch (err: any) {
      console.error('Error toggling status:', err);
      showToast('error', err.message || 'Failed to update status');
    }
  };

  const handleDeleteRate = async (id: string, grade: string) => {
    if (!confirm(`Delete silver rate entry for "${grade}"?`)) return;
    try {
      await deleteDoc(doc(db, 'rates_silver', id));
      setRates((prev) => prev.filter((r) => r.id !== id));
      showToast('success', `Silver rate "${grade}" deleted.`);
    } catch (err: any) {
      console.error('Error deleting silver rate:', err);
      showToast('error', err.message || 'Failed to delete silver rate');
    }
  };

  const filteredRates = rates.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        r.purity_grade?.toLowerCase().includes(q) ||
        r.purity_code?.toLowerCase().includes(q) ||
        r.updated_by?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Dynamic values from rates
  const current999 = rates.find((r) => r.purity_code.includes('999') && r.status === 'CURRENT_ACTIVE')?.rate_per_gram || 98.5;
  const current925 = rates.find((r) => r.purity_code.includes('925') && r.status === 'CURRENT_ACTIVE')?.rate_per_gram || 91.2;
  const current800 = rates.find((r) => r.purity_code.includes('800') && r.status === 'CURRENT_ACTIVE')?.rate_per_gram || 78.8;
  const current1kg = rates.find((r) => r.status === 'CURRENT_ACTIVE')?.rate_per_kg || 98500;

  // Estimator calculation
  const gramsNum = parseFloat(calcGrams) || 0;
  const activeRate = calcPurity === '999' ? current999 : calcPurity === '800' ? current800 : current925;
  const silverBaseValue = gramsNum * activeRate;
  const makingPerG = calcArticleType === 'PUJA_THALI' ? 22 : calcArticleType === 'PAYAL' ? 18 : 35;
  const makingTotal = gramsNum * makingPerG;
  const articleSubtotal = silverBaseValue + makingTotal;
  const articleGst = articleSubtotal * 0.03;
  const articleGrandTotal = articleSubtotal + articleGst;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="rates_silver" />
      <ActionToolbar
        filterPlaceholder="Search silver rates by purity grade, Ag code, or valuer..."
        insertLabel="Broadcast Silver"
        onInsertClick={() => setIsUpdateModalOpen(true)}
        onRefresh={fetchSilverRates}
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
                  className="px-2.5 py-1 bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-md font-medium text-xs flex items-center gap-1 shadow-2xs"
                >
                  <Scale className="w-3 h-3 text-emerald-600" /> Silver Bullion
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
                title="Apply to Ornaments"
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

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Fine Silver 999</span>
                <Scale className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                ₹ {current999.toFixed(2)}
                <span className="text-[11px] text-neutral-500 font-normal"> /g</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                1 Kg Bullion: ₹ {current1kg.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Sterling Silver 925</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700">
                ₹ {current925.toFixed(2)}
                <span className="text-[11px] text-neutral-500 font-normal"> /g</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Payal & jewellery benchmark</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Silverware 800</span>
                <Boxes className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                ₹ {current800.toFixed(2)}
                <span className="text-[11px] text-neutral-500 font-normal"> /g</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Puja articles & murtis</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Silver Records</span>
                <PackageCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{rates.length}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                {rates.filter((r) => r.status === 'CURRENT_ACTIVE').length} currently active
              </div>
            </div>
          </div>

          {/* Interactive Silver Article Estimator */}
          <div className="bg-white p-4 rounded-lg border border-[#e2e8f0] shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium text-neutral-800">
                  Silver Article & Utensil Pricing Estimator
                </span>
              </div>
              <span className="text-[11px] text-neutral-500">Live rate sync + making charges + 3% GST</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
              <div>
                <label className="block text-neutral-600 font-medium mb-1">Article Category</label>
                <select
                  value={calcArticleType}
                  onChange={(e) => setCalcArticleType(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none focus:border-emerald-500"
                >
                  <option value="PUJA_THALI">Puja Thali / Kalash (₹22/g making)</option>
                  <option value="PAYAL">Payal / Leg Chains (₹18/g making)</option>
                  <option value="MURTI">Solid Murti / Idol (₹35/g making)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">Purity Grade</label>
                <select
                  value={calcPurity}
                  onChange={(e) => setCalcPurity(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none focus:border-emerald-500"
                >
                  <option value="999">Fine Silver 999 (₹{current999}/g)</option>
                  <option value="925">Sterling Silver 925 (₹{current925}/g)</option>
                  <option value="800">Silverware 800 (₹{current800}/g)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">Weight (Grams)</label>
                <input
                  type="number"
                  step="0.1"
                  value={calcGrams}
                  onChange={(e) => setCalcGrams(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="bg-[#f8fafc] p-3 rounded-md border border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap gap-4 text-neutral-600">
                <div>
                  Silver Value:{' '}
                  <span className="font-mono text-neutral-800">
                    ₹{silverBaseValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  Making Charges: <span className="font-mono text-neutral-800">₹{makingTotal.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  GST (3%):{' '}
                  <span className="font-mono text-neutral-800">
                    ₹{articleGst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 font-medium">Estimated Total:</span>
                <span className="text-base font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  ₹{articleGrandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
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
            <div className="p-3 border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-neutral-800">Silver Bullion & Articles Master</span>
                  <span className="text-[10px] text-neutral-400 font-mono bg-neutral-100 px-1.5 py-0.5 rounded">
                    rates_silver
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
                  <span>Add Grade Rate</span>
                </button>

                <button
                  onClick={() => setIsUpdateModalOpen(true)}
                  className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium flex items-center gap-1 transition-colors shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast Silver</span>
                </button>
              </div>
            </div>

            {activeTab === 'data' && (
              <>
                {loading ? (
                  <div className="p-12 flex flex-col items-center justify-center gap-3 text-neutral-500">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                    <span className="text-xs font-medium">Loading real-time silver rates from Firestore...</span>
                  </div>
                ) : filteredRates.length === 0 ? (
                  <div className="p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3">
                      <Scale className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-sm font-medium text-neutral-800 mb-1">No Silver Rates Available</h3>
                    <p className="text-xs text-neutral-500 mb-4">
                      No silver rate entries found in the Firestore database. You can broadcast standard 999 Fine, 925 Sterling, and 800 Silverware rates or create custom grades.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsUpdateModalOpen(true)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>Broadcast Live Silver Rates</span>
                      </button>
                      <button
                        onClick={() => setIsCustomModalOpen(true)}
                        className="px-3 py-1.5 bg-white border border-[#e2e8f0] text-neutral-700 hover:text-neutral-900 rounded text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Grade Rate</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-x-auto custom-scrollbar w-full">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#fcfcfc] border-b border-[#e5e7eb] text-neutral-600 font-mono text-[11px]">
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                            purity_grade
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                            purity_code
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                            rate_per_g
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                            rate_per_kg
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                            buyback_per_g
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                            bar_1kg_rate
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                            effective_date
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                            updated_by
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
                                <span className="text-neutral-900 font-medium">{row.purity_grade}</span>
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
                              ₹ {row.rate_per_gram?.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right text-neutral-800 font-mono">
                              ₹ {row.rate_per_kg?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right text-neutral-800 font-mono">
                              ₹ {row.buyback_rate_per_g?.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right text-neutral-700 font-mono">
                              ₹ {row.bar_1kg_rate?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-500 text-[11px]">
                              {row.effective_date}
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700 text-[11px]">
                              {row.updated_by}
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
                                  onClick={() => copyToClipboard(`₹${row.rate_per_gram}/g`, row.id)}
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
                                  onClick={() => handleDeleteRate(row.id, row.purity_grade)}
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

            {/* Definition Tab */}
            {activeTab === 'definition' && (
              <div className="p-4 bg-[#fbfbfb] text-xs font-mono">
                <div className="bg-neutral-900 text-neutral-100 p-4 rounded-md overflow-x-auto shadow-inner text-[11px] leading-relaxed">
                  <span className="text-emerald-400">CREATE TABLE</span> public.rates_silver (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">purity_grade</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>{' '}
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
                  <span className="pl-6 text-blue-300">rate_per_gram</span>{' '}
                  <span className="text-amber-300">numeric(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">rate_per_kg</span>{' '}
                  <span className="text-amber-300">numeric(12,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">buyback_rate_per_g</span>{' '}
                  <span className="text-amber-300">numeric(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">bar_1kg_rate</span>{' '}
                  <span className="text-amber-300">numeric(12,2)</span>,
                  <br />
                  <span className="pl-6 text-blue-300">effective_date</span>{' '}
                  <span className="text-amber-300">timestamptz</span>{' '}
                  <span className="text-neutral-400">DEFAULT now() NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">updated_by</span>{' '}
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

      {/* Broadcast Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                <h2 className="text-sm font-medium text-neutral-800">
                  Broadcast Live Silver Bullion Rates
                </h2>
              </div>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSilverRates} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">
                  Fine Silver 999 Benchmark (₹ / Kilogram) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="100"
                    required
                    value={inputRatePerKg}
                    onChange={(e) => setInputRatePerKg(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium text-emerald-700"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 font-mono">₹</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Equivalent to ₹{((parseFloat(inputRatePerKg) || 0) / 1000).toFixed(2)} per gram
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">
                    Buyback Scrap Discount (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={buybackDiscountPct}
                    onChange={(e) => setBuybackDiscountPct(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-neutral-400 mt-0.5">Old silver scrap discount</p>
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Signer / Valuer</label>
                  <input
                    type="text"
                    value={broadcastSigner}
                    onChange={(e) => setBroadcastSigner(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
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
                  <option value="ALL">All POS Counters + Bullion Desks + LED Displays</option>
                  <option value="POS_ONLY">POS Counter Billing Only</option>
                  <option value="BULLION_DESK">Bullion Desk Only</option>
                </select>
              </div>

              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded p-2.5 space-y-1.5">
                <span className="text-[10px] font-medium uppercase text-neutral-500 tracking-wider">
                  Derived Rates Live Preview:
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono">
                  <div className="p-1.5 bg-white border border-[#e2e8f0] rounded">
                    <div className="text-neutral-500 text-[10px]">999 Fine</div>
                    <div className="font-medium text-emerald-700">
                      ₹{Math.round(((parseFloat(inputRatePerKg) || 0) / 1000) * 10) / 10}/g
                    </div>
                  </div>
                  <div className="p-1.5 bg-white border border-[#e2e8f0] rounded">
                    <div className="text-neutral-500 text-[10px]">925 Sterling</div>
                    <div className="font-medium text-neutral-800">
                      ₹{Math.round((((parseFloat(inputRatePerKg) || 0) / 1000) * 0.925) * 10) / 10}/g
                    </div>
                  </div>
                  <div className="p-1.5 bg-white border border-[#e2e8f0] rounded">
                    <div className="text-neutral-500 text-[10px]">800 Silverware</div>
                    <div className="font-medium text-neutral-800">
                      ₹{Math.round((((parseFloat(inputRatePerKg) || 0) / 1000) * 0.8) * 10) / 10}/g
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

      {/* Add Custom Silver Grade Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-medium text-neutral-800">Add Custom Silver Grade</h2>
              </div>
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomSilver} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Purity Grade Name *</label>
                <input
                  type="text"
                  required
                  value={customGrade}
                  onChange={(e) => setCustomGrade(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. Fine Silver 999.9 Coins"
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
                    placeholder="Ag 925 / Ag 999"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Purity Percent (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customPurityPct}
                    onChange={(e) => setCustomPurityPct(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Retail Rate (₹ / g) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={customRatePerG}
                    onChange={(e) => setCustomRatePerG(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Buyback (₹ / g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customBuybackPerG}
                    onChange={(e) => setCustomBuybackPerG(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Updated By</label>
                <input
                  type="text"
                  value={customSigner}
                  onChange={(e) => setCustomSigner(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Notes</label>
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
                      <span>Save Silver Rate</span>
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
