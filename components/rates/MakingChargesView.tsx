'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Percent,
  Plus,
  Sparkles,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Check,
  SlidersHorizontal,
  X,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  TrendingDown,
  Hammer,
  Coins,
  Calculator,
  Loader2,
  Trash2,
  AlertCircle,
  Scale,
  Gem,
  Flame,
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

export interface MakingChargeRule {
  id: string;
  category_name: string;
  charge_type: 'PERCENTAGE_OF_GOLD' | 'FIXED_PER_GRAM' | 'FLAT_PER_PIECE';
  base_rate_value: number;
  min_charge_floor: number;
  festival_discount_pct: number;
  net_effective_charge: string;
  metal_applicability: string;
  karigar_department: string;
  status: 'ACTIVE' | 'INACTIVE';
  updated_at: string;
  created_at?: string;
}

export function RatesMakingChargesView() {
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [rules, setRules] = useState<MakingChargeRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newType, setNewType] = useState<'PERCENTAGE_OF_GOLD' | 'FIXED_PER_GRAM' | 'FLAT_PER_PIECE'>('PERCENTAGE_OF_GOLD');
  const [newBaseRate, setNewBaseRate] = useState('12.5');
  const [newMinFloor, setNewMinFloor] = useState('1500');
  const [newFestivalDiscount, setNewFestivalDiscount] = useState('2.0');
  const [newMetalApplicability, setNewMetalApplicability] = useState('22K Gold (916)');
  const [newKarigarDept, setNewKarigarDept] = useState('In-House Goldsmith Unit');

  // Interactive Live Making Calculator State
  const [testCategory, setTestCategory] = useState('');
  const [testWeight, setTestWeight] = useState('15.500');
  const [testGoldRate, setTestGoldRate] = useState('7850');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const fetchRules = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'rates_making_charges'));
      const list: MakingChargeRule[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<MakingChargeRule, 'id'>) });
      });
      list.sort((a, b) => {
        if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
        if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
        return (b.created_at || '').localeCompare(a.created_at || '');
      });
      setRules(list);
      if (list.length > 0 && !testCategory) {
        setTestCategory(list[0].category_name);
      }
    } catch (err: any) {
      console.error('Error fetching making charges:', err);
      showToast('error', err.message || 'Failed to fetch making charges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const calculateEffectiveString = (
    type: 'PERCENTAGE_OF_GOLD' | 'FIXED_PER_GRAM' | 'FLAT_PER_PIECE',
    base: number,
    discount: number
  ) => {
    if (type === 'PERCENTAGE_OF_GOLD') {
      const netPct = Math.max(0, base - discount);
      return `${netPct.toFixed(2)}% of gold value`;
    } else if (type === 'FIXED_PER_GRAM') {
      const netPerG = Math.max(0, base * (1 - discount / 100));
      return `₹ ${netPerG.toFixed(2)} / gram`;
    } else {
      const netPiece = Math.max(0, base * (1 - discount / 100));
      return `₹ ${netPiece.toLocaleString('en-IN', { maximumFractionDigits: 2 })} / piece`;
    }
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    const base = parseFloat(newBaseRate) || 0;
    const minFloor = parseFloat(newMinFloor) || 0;
    const discount = parseFloat(newFestivalDiscount) || 0;
    const effective = calculateEffectiveString(newType, base, discount);
    const dateStr = new Date().toISOString().split('T')[0];

    const newRule: Omit<MakingChargeRule, 'id'> = {
      category_name: newCategory.trim(),
      charge_type: newType,
      base_rate_value: base,
      min_charge_floor: minFloor,
      festival_discount_pct: discount,
      net_effective_charge: effective,
      metal_applicability: newMetalApplicability,
      karigar_department: newKarigarDept,
      status: 'ACTIVE',
      updated_at: dateStr,
      created_at: new Date().toISOString(),
    };

    try {
      setSaving(true);
      const docRef = await addDoc(collection(db, 'rates_making_charges'), newRule);
      setRules((prev) => [{ id: docRef.id, ...newRule }, ...prev]);
      setIsAddModalOpen(false);
      showToast('success', `Making charge rule for "${newCategory}" saved.`);
      // Reset form
      setNewCategory('');
      setNewBaseRate('12.5');
      setNewMinFloor('1500');
    } catch (err: any) {
      console.error('Error saving making rule:', err);
      showToast('error', err.message || 'Failed to save making rule');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateDoc(doc(db, 'rates_making_charges', id), { status: nextStatus });
      setRules((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: nextStatus as any } : r))
      );
      showToast('success', `Status updated to ${nextStatus}`);
    } catch (err: any) {
      console.error('Error toggling status:', err);
      showToast('error', err.message || 'Failed to update rule status');
    }
  };

  const handleDeleteRule = async (id: string, catName: string) => {
    if (!confirm(`Delete making charge rule for "${catName}"?`)) return;
    try {
      await deleteDoc(doc(db, 'rates_making_charges', id));
      setRules((prev) => prev.filter((r) => r.id !== id));
      showToast('success', `Rule for "${catName}" deleted.`);
    } catch (err: any) {
      console.error('Error deleting rule:', err);
      showToast('error', err.message || 'Failed to delete rule');
    }
  };

  const filteredRules = rules.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        r.category_name?.toLowerCase().includes(q) ||
        r.charge_type?.toLowerCase().includes(q) ||
        r.karigar_department?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Simulator calculation
  const selectedRule = rules.find((r) => r.category_name === testCategory) || rules[0];
  const wt = parseFloat(testWeight) || 0;
  const gRate = parseFloat(testGoldRate) || 7850;
  let simulatedMaking = 0;

  if (selectedRule) {
    if (selectedRule.charge_type === 'PERCENTAGE_OF_GOLD') {
      const netPct = Math.max(0, selectedRule.base_rate_value - selectedRule.festival_discount_pct);
      const goldVal = wt * gRate;
      simulatedMaking = Math.max(selectedRule.min_charge_floor, (goldVal * netPct) / 100);
    } else if (selectedRule.charge_type === 'FIXED_PER_GRAM') {
      const netPerG = Math.max(0, selectedRule.base_rate_value * (1 - selectedRule.festival_discount_pct / 100));
      simulatedMaking = Math.max(selectedRule.min_charge_floor, wt * netPerG);
    } else {
      const netFlat = Math.max(0, selectedRule.base_rate_value * (1 - selectedRule.festival_discount_pct / 100));
      simulatedMaking = Math.max(selectedRule.min_charge_floor, netFlat);
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="rates_making_charges" />
      <ActionToolbar
        filterPlaceholder="Search making charges by category, charge type, or karigar..."
        insertLabel="New Making Rule"
        onInsertClick={() => setIsAddModalOpen(true)}
        onRefresh={fetchRules}
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
                  className="px-2.5 py-1 bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-md font-medium text-xs flex items-center gap-1 shadow-2xs"
                >
                  <Percent className="w-3 h-3 text-emerald-600" /> Making Charges
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
                title="Apply in Billing POS"
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
                <span className="text-[11px] font-medium uppercase tracking-wider">Configured Rules</span>
                <Percent className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{rules.length}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                {rules.filter((r) => r.status === 'ACTIVE').length} active in POS
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">% Of Gold Value Rules</span>
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700">
                {rules.filter((r) => r.charge_type === 'PERCENTAGE_OF_GOLD').length}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Bangles, Haar, Mangalsutra</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Per-Gram Rules</span>
                <Hammer className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                {rules.filter((r) => r.charge_type === 'FIXED_PER_GRAM').length}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Chains & Casting Rings</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Flat Piece Mountings</span>
                <Tag className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                {rules.filter((r) => r.charge_type === 'FLAT_PER_PIECE').length}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Solitaires & Jadau Studs</div>
            </div>
          </div>

          {/* Interactive Live Making Calculator Simulator */}
          <div className="bg-white p-4 rounded-lg border border-[#e2e8f0] shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium text-neutral-800">
                  Making Charges Live Calculator Simulator
                </span>
              </div>
              <span className="text-[11px] text-neutral-500">
                Tests minimum charge floor & festival discounts in real time
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
              <div>
                <label className="block text-neutral-600 font-medium mb-1">Ornaments Category Rule</label>
                <select
                  value={testCategory}
                  onChange={(e) => setTestCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none focus:border-emerald-500"
                >
                  {rules.length === 0 ? (
                    <option value="">No categories available</option>
                  ) : (
                    rules.map((r) => (
                      <option key={r.id} value={r.category_name}>
                        {r.category_name} ({r.charge_type === 'PERCENTAGE_OF_GOLD' ? `${r.base_rate_value}%` : `₹${r.base_rate_value}`})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">Gross Ornament Weight (g)</label>
                <input
                  type="number"
                  step="0.001"
                  value={testWeight}
                  onChange={(e) => setTestWeight(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">Gold Rate Reference (₹ / g)</label>
                <input
                  type="number"
                  step="10"
                  value={testGoldRate}
                  onChange={(e) => setTestGoldRate(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="bg-[#f8fafc] p-3 rounded-md border border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap gap-4 text-neutral-600">
                <div>
                  Charge Type:{' '}
                  <span className="font-medium text-neutral-800">
                    {selectedRule?.charge_type?.replace(/_/g, ' ') || 'N/A'}
                  </span>
                </div>
                <div>
                  Min Floor Protection:{' '}
                  <span className="font-mono text-neutral-800">
                    ₹{selectedRule?.min_charge_floor?.toLocaleString('en-IN') || 0}
                  </span>
                </div>
                <div>
                  Festival Concession:{' '}
                  <span className="font-mono text-emerald-700">
                    {selectedRule?.festival_discount_pct || 0}% off
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 font-medium">Computed Making Fee:</span>
                <span className="text-base font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                  ₹{simulatedMaking.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
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
                  <Percent className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-neutral-800">Making Charges Matrix</span>
                  <span className="text-[10px] text-neutral-400 font-mono bg-neutral-100 px-1.5 py-0.5 rounded">
                    rates_making_charges
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
                    Active Rules ({filteredRules.length})
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
                  <option value="ACTIVE">Active Only</option>
                  <option value="INACTIVE">Inactive</option>
                </select>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium flex items-center gap-1 transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Making Rule</span>
                </button>
              </div>
            </div>

            {activeTab === 'data' && (
              <>
                {loading ? (
                  <div className="p-12 flex flex-col items-center justify-center gap-3 text-neutral-500">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                    <span className="text-xs font-medium">Loading making charges from Firestore...</span>
                  </div>
                ) : filteredRules.length === 0 ? (
                  <div className="p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3">
                      <Percent className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-sm font-medium text-neutral-800 mb-1">No Making Charge Rules Defined</h3>
                    <p className="text-xs text-neutral-500 mb-4">
                      Create standard making charge rules for machine bangles, antique temple jewellery, casting rings, or filigree work to auto-calculate labor in POS billing.
                    </p>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Making Rule</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 overflow-x-auto custom-scrollbar w-full">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#fcfcfc] border-b border-[#e5e7eb] text-neutral-600 font-mono text-[11px]">
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                            category_name
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                            charge_type
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                            base_rate
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                            min_floor
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                            discount
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                            net_effective
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                            applicability
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                            workshop_dept
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
                        {filteredRules.map((row) => (
                          <tr key={row.id} className="hover:bg-[#f8fafc] transition-colors">
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                              <span className="text-neutral-900 font-medium">{row.category_name}</span>
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                              <span className="text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded text-[10px] font-mono">
                                {row.charge_type.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono text-neutral-800">
                              {row.charge_type === 'PERCENTAGE_OF_GOLD' ? `${row.base_rate_value}%` : `₹${row.base_rate_value}`}
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono text-neutral-700">
                              ₹ {row.min_charge_floor?.toLocaleString('en-IN')}
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono text-emerald-700">
                              {row.festival_discount_pct > 0 ? `${row.festival_discount_pct}%` : '0%'}
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-emerald-800 font-medium">
                              {row.net_effective_charge}
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-600 text-[11px]">
                              {row.metal_applicability || '22K Gold'}
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-600 text-[11px]">
                              {row.karigar_department || 'General Workshop'}
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-center">
                              <button
                                onClick={() => handleToggleStatus(row.id, row.status)}
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors cursor-pointer ${
                                  row.status === 'ACTIVE'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200'
                                }`}
                                title="Click to toggle status"
                              >
                                {row.status}
                              </button>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-right">
                              <button
                                onClick={() => handleDeleteRule(row.id, row.category_name)}
                                className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50"
                                title="Delete Rule"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.rates_making_charges (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">category_name</span>{' '}
                  <span className="text-amber-300">varchar(128)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">charge_type</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">NOT NULL CHECK (charge_type IN (&apos;PERCENTAGE_OF_GOLD&apos;, &apos;FIXED_PER_GRAM&apos;, &apos;FLAT_PER_PIECE&apos;)),</span>
                  <br />
                  <span className="pl-6 text-blue-300">base_rate_value</span>{' '}
                  <span className="text-amber-300">numeric(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">min_charge_floor</span>{' '}
                  <span className="text-amber-300">numeric(10,2)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0,</span>
                  <br />
                  <span className="pl-6 text-blue-300">festival_discount_pct</span>{' '}
                  <span className="text-amber-300">numeric(5,2)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0,</span>
                  <br />
                  <span className="pl-6 text-blue-300">net_effective_charge</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>,
                  <br />
                  <span className="pl-6 text-blue-300">metal_applicability</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>,
                  <br />
                  <span className="pl-6 text-blue-300">karigar_department</span>{' '}
                  <span className="text-amber-300">varchar(128)</span>,
                  <br />
                  <span className="pl-6 text-blue-300">status</span>{' '}
                  <span className="text-amber-300">varchar(16)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;ACTIVE&apos;</span>
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Making Rule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-medium text-neutral-800">Add New Making Charge Rule</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRule} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">
                  Ornament Category / Design Style *
                </label>
                <input
                  type="text"
                  required
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. Antique Temple Choker or Calcutta Filigree"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Charge Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="PERCENTAGE_OF_GOLD">% of Gold Value</option>
                    <option value="FIXED_PER_GRAM">Fixed Rate / Gram (₹)</option>
                    <option value="FLAT_PER_PIECE">Flat Rate / Piece (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">
                    Base Value {newType === 'PERCENTAGE_OF_GOLD' ? '(%)' : '(₹)'} *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newBaseRate}
                    onChange={(e) => setNewBaseRate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium text-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">
                    Minimum Floor Charge (₹)
                  </label>
                  <input
                    type="number"
                    value={newMinFloor}
                    onChange={(e) => setNewMinFloor(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">
                    Festival / Promotional Discount (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newFestivalDiscount}
                    onChange={(e) => setNewFestivalDiscount(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Metal Applicability</label>
                  <select
                    value={newMetalApplicability}
                    onChange={(e) => setNewMetalApplicability(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="22K Gold (916)">22K Gold (916)</option>
                    <option value="18K Gold (750)">18K Gold (750)</option>
                    <option value="14K Gold (585)">14K Gold (585)</option>
                    <option value="925 Sterling Silver">925 Sterling Silver</option>
                    <option value="All Metals">All Metals</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Karigar Department</label>
                  <input
                    type="text"
                    value={newKarigarDept}
                    onChange={(e) => setNewKarigarDept(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. Rajkot Unit, Bengal Unit"
                  />
                </div>
              </div>

              {/* Effective calculation preview */}
              <div className="bg-[#f8fafc] p-2.5 rounded border border-[#e2e8f0] flex items-center justify-between text-xs">
                <span className="text-neutral-500 font-medium">Net Effective Rate:</span>
                <span className="font-mono text-emerald-700 font-medium">
                  {calculateEffectiveString(
                    newType,
                    parseFloat(newBaseRate) || 0,
                    parseFloat(newFestivalDiscount) || 0
                  )}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
                      <span>Save Making Rule</span>
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
