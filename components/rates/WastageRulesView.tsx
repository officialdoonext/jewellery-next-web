'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Layers,
  Sparkles,
  Calculator,
  Plus,
  Check,
  ShieldCheck,
  Scale,
  Percent,
  Coins,
  FileSpreadsheet,
  Users,
  X,
  SlidersHorizontal,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Gem,
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

export interface WastageMatrixRow {
  id: string;
  design_complexity: string;
  applicable_karat: string;
  standard_va_pct: number;
  max_allowed_va_pct: number;
  melting_tolerance_pct: number;
  karigar_group: string;
  inspection_standard: string;
  status: 'ACTIVE' | 'REVIEW';
  updated_at: string;
  created_at?: string;
}

export function RatesWastageRulesView() {
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [matrix, setMatrix] = useState<WastageMatrixRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'REVIEW'>('ALL');

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDesign, setNewDesign] = useState('');
  const [newKarat, setNewKarat] = useState('22K (916)');
  const [newStdVa, setNewStdVa] = useState('8.5');
  const [newMaxVa, setNewMaxVa] = useState('9.5');
  const [newMeltingTolerance, setNewMeltingTolerance] = useState('0.25');
  const [newKarigarGroup, setNewKarigarGroup] = useState('In-House Goldsmiths');
  const [newInspection, setNewInspection] = useState('Wax Tree Mass Loss Test');

  // Interactive VA Impact Calculator State
  const [calcDesign, setCalcDesign] = useState('');
  const [calcNetWt, setCalcNetWt] = useState('32.500');
  const [calcGoldRateG, setCalcGoldRateG] = useState('7850');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const fetchWastageRules = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'rates_wastage_rules'));
      const list: WastageMatrixRow[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<WastageMatrixRow, 'id'>) });
      });
      list.sort((a, b) => {
        if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
        if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
        return (b.created_at || '').localeCompare(a.created_at || '');
      });
      setMatrix(list);
      if (list.length > 0 && !calcDesign) {
        setCalcDesign(list[0].design_complexity);
      }
    } catch (err: any) {
      console.error('Error fetching wastage rules:', err);
      showToast('error', err.message || 'Failed to fetch wastage rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWastageRules();
  }, []);

  const handleAddWastageRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesign.trim()) return;

    const stdVa = parseFloat(newStdVa) || 0;
    const maxVa = parseFloat(newMaxVa) || stdVa;
    const meltingTol = parseFloat(newMeltingTolerance) || 0.2;
    const dateStr = new Date().toISOString().split('T')[0];

    const newRule: Omit<WastageMatrixRow, 'id'> = {
      design_complexity: newDesign.trim(),
      applicable_karat: newKarat,
      standard_va_pct: stdVa,
      max_allowed_va_pct: maxVa,
      melting_tolerance_pct: meltingTol,
      karigar_group: newKarigarGroup.trim() || 'General Workshop',
      inspection_standard: newInspection.trim() || 'Bench Sweep Audit',
      status: 'ACTIVE',
      updated_at: dateStr,
      created_at: new Date().toISOString(),
    };

    try {
      setSaving(true);
      const docRef = await addDoc(collection(db, 'rates_wastage_rules'), newRule);
      setMatrix((prev) => [{ id: docRef.id, ...newRule }, ...prev]);
      setIsAddModalOpen(false);
      showToast('success', `Wastage rule for "${newDesign}" registered.`);
      setNewDesign('');
      setNewStdVa('8.5');
      setNewMaxVa('9.5');
    } catch (err: any) {
      console.error('Error saving wastage rule:', err);
      showToast('error', err.message || 'Failed to save wastage rule');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'REVIEW' : 'ACTIVE';
    try {
      await updateDoc(doc(db, 'rates_wastage_rules', id), { status: nextStatus });
      setMatrix((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: nextStatus as any } : r))
      );
      showToast('success', `Status updated to ${nextStatus}`);
    } catch (err: any) {
      console.error('Error toggling status:', err);
      showToast('error', err.message || 'Failed to update rule status');
    }
  };

  const handleDeleteRule = async (id: string, designName: string) => {
    if (!confirm(`Delete wastage rule for "${designName}"?`)) return;
    try {
      await deleteDoc(doc(db, 'rates_wastage_rules', id));
      setMatrix((prev) => prev.filter((r) => r.id !== id));
      showToast('success', `Wastage rule for "${designName}" deleted.`);
    } catch (err: any) {
      console.error('Error deleting rule:', err);
      showToast('error', err.message || 'Failed to delete rule');
    }
  };

  const filteredMatrix = matrix.filter((row) => {
    if (statusFilter !== 'ALL' && row.status !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        row.design_complexity?.toLowerCase().includes(q) ||
        row.applicable_karat?.toLowerCase().includes(q) ||
        row.karigar_group?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Interactive VA Calculation
  const selectedRule = matrix.find((m) => m.design_complexity === calcDesign) || matrix[0];
  const netWtNum = parseFloat(calcNetWt) || 0;
  const goldRateNum = parseFloat(calcGoldRateG) || 7850;
  const vaPercentage = selectedRule ? selectedRule.standard_va_pct : 8.5;
  const vaGrams = netWtNum * (vaPercentage / 100);
  const grossBilledGrams = netWtNum + vaGrams;
  const totalOrnamentGoldValue = grossBilledGrams * goldRateNum;
  const vaMonetaryCost = vaGrams * goldRateNum;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="rates_wastage_rules" />
      <ActionToolbar
        filterPlaceholder="Search wastage rules by design complexity, karat, or artisan guild..."
        insertLabel="New Wastage Rule"
        onInsertClick={() => setIsAddModalOpen(true)}
        onRefresh={fetchWastageRules}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        <div className="p-4 flex flex-col gap-4 max-w-7xl w-full mx-auto">
          {/* Toast */}
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
                  className="px-2.5 py-1 bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-md font-medium text-xs flex items-center gap-1 shadow-2xs"
                >
                  <Layers className="w-3 h-3 text-emerald-600" /> Wastage (VA)
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
                title="Use Current Wastage in Billing"
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
                <span className="text-[11px] font-medium uppercase tracking-wider">Total VA Slabs</span>
                <Layers className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{matrix.length}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Manufacturing categories</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Avg Standard VA</span>
                <Percent className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700">
                {matrix.length > 0
                  ? (matrix.reduce((acc, r) => acc + (r.standard_va_pct || 0), 0) / matrix.length).toFixed(1) + '%'
                  : '0.0%'}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Across active manufacturing styles</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Lowest VA (Plain)</span>
                <Scale className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                {matrix.length > 0
                  ? Math.min(...matrix.map((r) => r.standard_va_pct || 0)).toFixed(1) + '%'
                  : '0.0%'}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Machine bangles & chains</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Peak VA (Intricate)</span>
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                {matrix.length > 0
                  ? Math.max(...matrix.map((r) => r.standard_va_pct || 0)).toFixed(1) + '%'
                  : '0.0%'}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Temple Jadau & Nakshi</div>
            </div>
          </div>

          {/* Interactive VA Impact Calculator */}
          <div className="bg-white p-4 rounded-lg border border-[#e2e8f0] shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium text-neutral-800">
                  Value Addition (VA) Ornament Loss Simulator
                </span>
              </div>
              <span className="text-[11px] text-neutral-500">Live test for customer billing estimate</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
              <div>
                <label className="block text-neutral-600 font-medium mb-1">Design Style Rule</label>
                <select
                  value={calcDesign}
                  onChange={(e) => setCalcDesign(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none focus:border-emerald-500"
                >
                  {matrix.length === 0 ? (
                    <option value="">No styles available</option>
                  ) : (
                    matrix.map((m) => (
                      <option key={m.id} value={m.design_complexity}>
                        {m.design_complexity} ({m.standard_va_pct}% VA)
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">Net Ornament Weight (g)</label>
                <input
                  type="number"
                  step="0.001"
                  value={calcNetWt}
                  onChange={(e) => setCalcNetWt(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">Gold Benchmark (₹ / g)</label>
                <input
                  type="number"
                  step="10"
                  value={calcGoldRateG}
                  onChange={(e) => setCalcGoldRateG(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="bg-[#f8fafc] p-3 rounded-md border border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap gap-4 text-neutral-600">
                <div>
                  VA Allowance:{' '}
                  <span className="font-mono text-neutral-800">
                    +{vaGrams.toFixed(3)} g ({vaPercentage}%)
                  </span>
                </div>
                <div>
                  Gross Weight Billed:{' '}
                  <span className="font-mono text-neutral-800">{grossBilledGrams.toFixed(3)} g</span>
                </div>
                <div>
                  VA Added Cost:{' '}
                  <span className="font-mono text-emerald-700">
                    ₹{vaMonetaryCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 font-medium">Billed Gold Value:</span>
                <span className="text-base font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  ₹{totalOrnamentGoldValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
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
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-neutral-800">Wastage / VA Matrix Master</span>
                  <span className="text-[10px] text-neutral-400 font-mono bg-neutral-100 px-1.5 py-0.5 rounded">
                    rates_wastage_rules
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
                    Active Slabs ({filteredMatrix.length})
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
                  <option value="REVIEW">Under Review</option>
                </select>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium flex items-center gap-1 transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Wastage Rule</span>
                </button>
              </div>
            </div>

            {activeTab === 'data' && (
              <>
                {loading ? (
                  <div className="p-12 flex flex-col items-center justify-center gap-3 text-neutral-500">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                    <span className="text-xs font-medium">Loading wastage rules from Firestore...</span>
                  </div>
                ) : filteredMatrix.length === 0 ? (
                  <div className="p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3">
                      <Layers className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-sm font-medium text-neutral-800 mb-1">No Wastage Rules Found</h3>
                    <p className="text-xs text-neutral-500 mb-4">
                      Create wastage (VA) slabs for plain casting, handmade filigree, temple jadau, or CNC engraved items to control melting and polishing loss allowances.
                    </p>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Wastage Rule</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 overflow-x-auto custom-scrollbar w-full">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#fcfcfc] border-b border-[#e5e7eb] text-neutral-600 font-mono text-[11px]">
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                            design_complexity
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                            applicable_karat
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                            standard_va_%
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                            max_allowed_va_%
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                            melting_tol_%
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                            artisan_guild
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                            inspection_standard
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
                        {filteredMatrix.map((row) => (
                          <tr key={row.id} className="hover:bg-[#f8fafc] transition-colors">
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                              <span className="text-neutral-900 font-medium">{row.design_complexity}</span>
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                              <span className="text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded text-[10px] font-mono">
                                {row.applicable_karat}
                              </span>
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right text-emerald-700 font-mono font-medium">
                              {row.standard_va_pct}%
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right text-neutral-800 font-mono">
                              {row.max_allowed_va_pct}%
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right text-neutral-600 font-mono text-[11px]">
                              {row.melting_tolerance_pct || 0.25}%
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700 text-[11px]">
                              {row.karigar_group}
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-500 text-[11px]">
                              {row.inspection_standard}
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-center">
                              <button
                                onClick={() => handleToggleStatus(row.id, row.status)}
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors cursor-pointer ${
                                  row.status === 'ACTIVE'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                }`}
                                title="Click to toggle status"
                              >
                                {row.status}
                              </button>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-right">
                              <button
                                onClick={() => handleDeleteRule(row.id, row.design_complexity)}
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.rates_wastage_rules (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">design_complexity</span>{' '}
                  <span className="text-amber-300">varchar(128)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">applicable_karat</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">standard_va_pct</span>{' '}
                  <span className="text-amber-300">numeric(5,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">max_allowed_va_pct</span>{' '}
                  <span className="text-amber-300">numeric(5,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">melting_tolerance_pct</span>{' '}
                  <span className="text-amber-300">numeric(4,2)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0.25,</span>
                  <br />
                  <span className="pl-6 text-blue-300">karigar_group</span>{' '}
                  <span className="text-amber-300">varchar(128)</span>,
                  <br />
                  <span className="pl-6 text-blue-300">inspection_standard</span>{' '}
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

      {/* Add Wastage Rule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-medium text-neutral-800">Add New Wastage (VA) Rule</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddWastageRule} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">
                  Design Complexity / Workmanship Category *
                </label>
                <input
                  type="text"
                  required
                  value={newDesign}
                  onChange={(e) => setNewDesign(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. Handmade Calcutta Filigree or CNC Machine Rings"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Applicable Karat</label>
                  <select
                    value={newKarat}
                    onChange={(e) => setNewKarat(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="22K (916)">22K (Hallmark 916)</option>
                    <option value="18K (750)">18K (Jewellery 750)</option>
                    <option value="14K (585)">14K (Jewellery 585)</option>
                    <option value="24K (999)">24K (Pure 999)</option>
                    <option value="Platinum 950">Platinum 950</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Standard VA (%) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newStdVa}
                    onChange={(e) => setNewStdVa(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium text-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Maximum Allowed VA (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMaxVa}
                    onChange={(e) => setNewMaxVa(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Melting Tolerance (%)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={newMeltingTolerance}
                    onChange={(e) => setNewMeltingTolerance(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Artisan Guild / Karigar Group</label>
                <input
                  type="text"
                  value={newKarigarGroup}
                  onChange={(e) => setNewKarigarGroup(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. Master Goldsmiths Guild, Rajkot Unit"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">QC / Inspection Standard</label>
                <input
                  type="text"
                  value={newInspection}
                  onChange={(e) => setNewInspection(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. Laser Micrometer or Sweep Loss Audit"
                />
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
                      <span>Save Wastage Rule</span>
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
