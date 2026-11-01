'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Gem,
  Sparkles,
  Calculator,
  Search,
  CheckCircle2,
  ShieldCheck,
  FileSpreadsheet,
  ExternalLink,
  Layers,
  ArrowUpRight,
  SlidersHorizontal,
  Check,
  Award,
  Zap,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Coins,
  Scale,
  Percent,
  Flame,
  Store,
  ArrowRight,
  X,
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

export interface DiamondGridRow {
  id: string;
  clarity: string;
  color_grade: string;
  carat_range: string;
  cut_grade?: string;
  base_price_per_ct_inr: number;
  rap_discount_pct: number;
  net_price_per_ct_inr: number;
  rapaport_code: string;
  lab_standard: string;
  effective_date: string;
  status: 'ACTIVE' | 'ARCHIVED';
  created_at?: string;
}

export function RatesDiamondValuationView() {
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [grids, setGrids] = useState<DiamondGridRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClarityFilter, setSelectedClarityFilter] = useState('ALL');

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClarity, setNewClarity] = useState('VVS1');
  const [newColor, setNewColor] = useState('D-F (Colorless)');
  const [newCaratRange, setNewCaratRange] = useState('1.00 - 1.49 ct');
  const [newCutGrade, setNewCutGrade] = useState('Triple Excellent (3EX)');
  const [newBasePrice, setNewBasePrice] = useState('285000');
  const [newRapDiscount, setNewRapDiscount] = useState('-22.0');
  const [newRapCode, setNewRapCode] = useState('RAP-OCT26-100-DF-VVS1');
  const [newLabStandard, setNewLabStandard] = useState('GIA / IGI Certified');

  // Interactive 4Cs Valuation Calculator State
  const [calcCarat, setCalcCarat] = useState('1.02');
  const [calcClarity, setCalcClarity] = useState('VVS1');
  const [calcColor, setCalcColor] = useState('D-F');
  const [calcCut, setCalcCut] = useState('EXCELLENT');
  const [calcCert, setCalcCert] = useState('GIA');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const fetchDiamondGrids = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'rates_diamond_valuation'));
      const list: DiamondGridRow[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<DiamondGridRow, 'id'>) });
      });
      list.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
      setGrids(list);
    } catch (err: any) {
      console.error('Error fetching diamond valuations:', err);
      showToast('error', err.message || 'Failed to fetch diamond grids');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiamondGrids();
  }, []);

  const handleAddDiamondRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const base = parseFloat(newBasePrice) || 0;
    const discount = parseFloat(newRapDiscount) || 0;
    const net = Math.round(base * (1 + discount / 100));
    const dateStr = new Date().toISOString().split('T')[0];

    const newGrid: Omit<DiamondGridRow, 'id'> = {
      clarity: newClarity,
      color_grade: newColor,
      carat_range: newCaratRange,
      cut_grade: newCutGrade,
      base_price_per_ct_inr: base,
      rap_discount_pct: discount,
      net_price_per_ct_inr: net,
      rapaport_code: newRapCode.trim() || `RAP-${newClarity}-${newCaratRange}`,
      lab_standard: newLabStandard,
      effective_date: dateStr,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    };

    try {
      setSaving(true);
      const docRef = await addDoc(collection(db, 'rates_diamond_valuation'), newGrid);
      setGrids((prev) => [{ id: docRef.id, ...newGrid }, ...prev]);
      setIsAddModalOpen(false);
      showToast('success', `Diamond pricing grid for ${newClarity} ${newColor} saved.`);
      setNewBasePrice('285000');
    } catch (err: any) {
      console.error('Error saving diamond rate:', err);
      showToast('error', err.message || 'Failed to save diamond rate');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGrid = async (id: string, label: string) => {
    if (!confirm(`Delete diamond pricing rule for "${label}"?`)) return;
    try {
      await deleteDoc(doc(db, 'rates_diamond_valuation', id));
      setGrids((prev) => prev.filter((g) => g.id !== id));
      showToast('success', `Diamond grid deleted.`);
    } catch (err: any) {
      console.error('Error deleting diamond grid:', err);
      showToast('error', err.message || 'Failed to delete diamond grid');
    }
  };

  const handleToggleStatus = async (id: string, current: string) => {
    const nextStatus = current === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
    try {
      await updateDoc(doc(db, 'rates_diamond_valuation', id), { status: nextStatus });
      setGrids((prev) =>
        prev.map((g) => (g.id === id ? { ...g, status: nextStatus as any } : g))
      );
      showToast('success', `Grid status changed to ${nextStatus}`);
    } catch (err: any) {
      console.error('Error updating status:', err);
      showToast('error', err.message || 'Failed to update status');
    }
  };

  const filteredGrids = grids.filter((g) => {
    if (selectedClarityFilter !== 'ALL' && !g.clarity.includes(selectedClarityFilter)) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        g.clarity.toLowerCase().includes(q) ||
        g.color_grade.toLowerCase().includes(q) ||
        g.carat_range.toLowerCase().includes(q) ||
        g.rapaport_code.toLowerCase().includes(q) ||
        g.lab_standard.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Interactive 4Cs Valuation calculation using live grids
  const parsedCarat = parseFloat(calcCarat) || 0.01;
  const matchedGrid = grids.find(
    (g) => g.clarity.includes(calcClarity) && g.color_grade.includes(calcColor)
  );

  let perCtPrice = matchedGrid ? matchedGrid.net_price_per_ct_inr : 185000;
  if (calcCut === 'TRIPLE_EXCELLENT') perCtPrice *= 1.05;
  if (calcCut === 'VERY_GOOD') perCtPrice *= 0.96;
  if (calcCert === 'GIA') perCtPrice *= 1.08;
  if (calcCert === 'IGI') perCtPrice *= 1.02;

  const totalCalculatedStonePrice = Math.round(parsedCarat * perCtPrice);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="rates_diamond_valuation" />
      <ActionToolbar
        filterPlaceholder="Search diamond grid by clarity, 4Cs, Rapaport code, or lab standard..."
        insertLabel="New Diamond Grid"
        onInsertClick={() => setIsAddModalOpen(true)}
        onRefresh={fetchDiamondGrids}
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
                  className="px-2.5 py-1 bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-md font-medium text-xs flex items-center gap-1 shadow-2xs"
                >
                  <Gem className="w-3 h-3 text-emerald-600" /> Diamond 4Cs
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
                title="Use Diamonds in POS Billing"
              >
                <Store className="w-3 h-3 text-emerald-600" />
                <span>Open POS Billing</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </Link>
              <Link
                href="/inventory/ornaments"
                className="text-xs px-2.5 py-1 bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-300 rounded-md font-medium flex items-center gap-1 transition-colors shadow-2xs"
                title="Apply to Studded Ornaments"
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
                <span className="text-[11px] font-medium uppercase tracking-wider">Pricing Grids</span>
                <Gem className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{grids.length}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Active clarity & color combinations</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Top Solitaire Rate</span>
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700">
                ₹{' '}
                {grids.length > 0
                  ? Math.max(...grids.map((g) => g.net_price_per_ct_inr || 0)).toLocaleString('en-IN')
                  : '0'}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Per carat D-IF / VVS1 benchmark</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Certified Labs</span>
                <Award className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">GIA • IGI • SGL</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">International lab standards</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Rapaport Sync</span>
                <Zap className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">Oct 2026 Grid</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Automatic discount adjustment</div>
            </div>
          </div>

          {/* Interactive 4Cs Valuation Calculator */}
          <div className="bg-white p-4 rounded-lg border border-[#e2e8f0] shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium text-neutral-800">
                  4Cs Diamond Valuation Calculator (Live Rapaport Model)
                </span>
              </div>
              <span className="text-[11px] text-neutral-500">
                Dynamic appraisal for loose solitaire or studded piece
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs mb-3">
              <div>
                <label className="block text-neutral-600 font-medium mb-1">Carat Weight (ct)</label>
                <input
                  type="number"
                  step="0.01"
                  value={calcCarat}
                  onChange={(e) => setCalcCarat(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">Clarity Grade</label>
                <select
                  value={calcClarity}
                  onChange={(e) => setCalcClarity(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none focus:border-emerald-500"
                >
                  <option value="IF">IF (Flawless)</option>
                  <option value="VVS1">VVS1</option>
                  <option value="VVS2">VVS2</option>
                  <option value="VS1">VS1</option>
                  <option value="VS2">VS2</option>
                  <option value="SI1">SI1</option>
                  <option value="SI2">SI2</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">Color Grade</label>
                <select
                  value={calcColor}
                  onChange={(e) => setCalcColor(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none focus:border-emerald-500"
                >
                  <option value="D-F">D-F (Colorless)</option>
                  <option value="G-H">G-H (Near Colorless)</option>
                  <option value="I-J">I-J (Slight Tint)</option>
                  <option value="K-L">K-L (Faint Yellow)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">Cut Grade</label>
                <select
                  value={calcCut}
                  onChange={(e) => setCalcCut(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none focus:border-emerald-500"
                >
                  <option value="TRIPLE_EXCELLENT">3EX (Triple Excellent)</option>
                  <option value="EXCELLENT">Excellent</option>
                  <option value="VERY_GOOD">Very Good</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">Lab Certification</label>
                <select
                  value={calcCert}
                  onChange={(e) => setCalcCert(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded bg-white text-neutral-800 focus:outline-none focus:border-emerald-500"
                >
                  <option value="GIA">GIA (USA)</option>
                  <option value="IGI">IGI (Antwerp / India)</option>
                  <option value="SGL">SGL (London / Mumbai)</option>
                  <option value="IN_HOUSE">In-House Assay</option>
                </select>
              </div>
            </div>

            <div className="bg-[#f8fafc] p-3 rounded-md border border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap gap-4 text-neutral-600">
                <div>
                  Calculated Net Rate:{' '}
                  <span className="font-mono text-neutral-800">
                    ₹{Math.round(perCtPrice).toLocaleString('en-IN')}/ct
                  </span>
                </div>
                <div>
                  Stone Weight: <span className="font-mono text-neutral-800">{calcCarat} ct</span>
                </div>
                <div>
                  Specs:{' '}
                  <span className="font-medium text-neutral-800">
                    {calcClarity} / {calcColor} / {calcCert}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 font-medium">Stone Total Valuation:</span>
                <span className="text-base font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                  ₹{totalCalculatedStonePrice.toLocaleString('en-IN')}
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
                  <Gem className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-neutral-800">Diamond Pricing Grid Master</span>
                  <span className="text-[10px] text-neutral-400 font-mono bg-neutral-100 px-1.5 py-0.5 rounded">
                    rates_diamond_valuation
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
                    Active Grid ({filteredGrids.length})
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
                  value={selectedClarityFilter}
                  onChange={(e) => setSelectedClarityFilter(e.target.value)}
                  className="text-xs px-2 py-1 border border-[#e2e8f0] rounded bg-white text-neutral-700 focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Clarity Slabs</option>
                  <option value="IF">IF</option>
                  <option value="VVS">VVS (1 & 2)</option>
                  <option value="VS">VS (1 & 2)</option>
                  <option value="SI">SI (1 & 2)</option>
                </select>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium flex items-center gap-1 transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Diamond Grid</span>
                </button>
              </div>
            </div>

            {activeTab === 'data' && (
              <>
                {loading ? (
                  <div className="p-12 flex flex-col items-center justify-center gap-3 text-neutral-500">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                    <span className="text-xs font-medium">Loading diamond valuation matrix from Firestore...</span>
                  </div>
                ) : filteredGrids.length === 0 ? (
                  <div className="p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3">
                      <Gem className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-sm font-medium text-neutral-800 mb-1">No Diamond Grids Found</h3>
                    <p className="text-xs text-neutral-500 mb-4">
                      Configure 4Cs diamond matrices by carat range, clarity, color, and Rapaport discounts to automate loose diamond and studded ornament appraisals.
                    </p>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Diamond Grid</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 overflow-x-auto custom-scrollbar w-full">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#fcfcfc] border-b border-[#e5e7eb] text-neutral-600 font-mono text-[11px]">
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                            clarity
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                            color_grade
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                            carat_range
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                            base_price_ct
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                            rap_discount
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                            net_price_ct
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                            rapaport_code
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                            lab_standard
                          </th>
                          <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                            effective_date
                          </th>
                          <th className="px-3 py-2 font-medium text-right whitespace-nowrap">
                            actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e5e7eb]">
                        {filteredGrids.map((row) => (
                          <tr key={row.id} className="hover:bg-[#f8fafc] transition-colors">
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                              <span className="font-mono bg-neutral-100 text-neutral-800 px-1.5 py-0.5 rounded text-[11px]">
                                {row.clarity}
                              </span>
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-800 font-medium">
                              {row.color_grade}
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-neutral-600">
                              {row.carat_range}
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono text-neutral-600">
                              ₹ {row.base_price_per_ct_inr?.toLocaleString('en-IN')}
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono text-emerald-700">
                              {row.rap_discount_pct}%
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono font-medium text-emerald-700">
                              ₹ {row.net_price_per_ct_inr?.toLocaleString('en-IN')}
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-neutral-500 text-[11px]">
                              {row.rapaport_code}
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-600 text-[11px]">
                              {row.lab_standard}
                            </td>
                            <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-500 text-[11px]">
                              {row.effective_date}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-right">
                              <button
                                onClick={() => handleDeleteGrid(row.id, `${row.clarity} ${row.color_grade}`)}
                                className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50"
                                title="Delete Grid"
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.rates_diamond_valuation (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">clarity</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">color_grade</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">carat_range</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">base_price_per_ct_inr</span>{' '}
                  <span className="text-amber-300">numeric(12,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">rap_discount_pct</span>{' '}
                  <span className="text-amber-300">numeric(5,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">net_price_per_ct_inr</span>{' '}
                  <span className="text-amber-300">numeric(12,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">rapaport_code</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>,
                  <br />
                  <span className="pl-6 text-blue-300">lab_standard</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>,
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

      {/* Add Diamond Grid Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <Gem className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-medium text-neutral-800">Add Diamond Pricing Grid</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDiamondRate} className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Clarity Grade</label>
                  <select
                    value={newClarity}
                    onChange={(e) => setNewClarity(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="FL">FL (Flawless)</option>
                    <option value="IF">IF (Internally Flawless)</option>
                    <option value="VVS1">VVS1</option>
                    <option value="VVS2">VVS2</option>
                    <option value="VS1">VS1</option>
                    <option value="VS2">VS2</option>
                    <option value="SI1">SI1</option>
                    <option value="SI2">SI2</option>
                    <option value="I1">I1</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Color Grade</label>
                  <select
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="D-F (Colorless)">D-F (Colorless)</option>
                    <option value="G-H (Near Colorless)">G-H (Near Colorless)</option>
                    <option value="I-J (Slight Tint)">I-J (Slight Tint)</option>
                    <option value="K-L (Faint Yellow)">K-L (Faint Yellow)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Carat Weight Range</label>
                  <select
                    value={newCaratRange}
                    onChange={(e) => setNewCaratRange(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="0.01 - 0.05 ct (Stars)">0.01 - 0.05 ct (Stars)</option>
                    <option value="0.06 - 0.15 ct (Melee)">0.06 - 0.15 ct (Melee)</option>
                    <option value="0.16 - 0.29 ct (Pointers)">0.16 - 0.29 ct (Pointers)</option>
                    <option value="0.30 - 0.49 ct">0.30 - 0.49 ct</option>
                    <option value="0.50 - 0.99 ct">0.50 - 0.99 ct</option>
                    <option value="1.00 - 1.49 ct">1.00 - 1.49 ct</option>
                    <option value="1.50 - 1.99 ct">1.50 - 1.99 ct</option>
                    <option value="2.00+ ct">2.00+ ct</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Cut Standard</label>
                  <select
                    value={newCutGrade}
                    onChange={(e) => setNewCutGrade(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Triple Excellent (3EX)">Triple Excellent (3EX)</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Very Good">Very Good</option>
                    <option value="Good">Good</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">
                    Base Rap Price (₹ / Carat) *
                  </label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={newBasePrice}
                    onChange={(e) => setNewBasePrice(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">
                    Rap Discount / Premium (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newRapDiscount}
                    onChange={(e) => setNewRapDiscount(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. -22.0 or +5.0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Rapaport Code</label>
                  <input
                    type="text"
                    value={newRapCode}
                    onChange={(e) => setNewRapCode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Certification Lab</label>
                  <select
                    value={newLabStandard}
                    onChange={(e) => setNewLabStandard(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="GIA / IGI Certified">GIA / IGI Certified</option>
                    <option value="GIA Triple Excellent">GIA Triple Excellent</option>
                    <option value="IGI / SGL Certified">IGI / SGL Certified</option>
                    <option value="Commercial Star/Melee">Commercial Star/Melee</option>
                    <option value="In-House Graded">In-House Graded</option>
                  </select>
                </div>
              </div>

              {/* Calculated preview */}
              <div className="bg-[#f8fafc] p-2.5 rounded border border-[#e2e8f0] flex items-center justify-between text-xs">
                <span className="text-neutral-500 font-medium">Net Price Per Carat:</span>
                <span className="font-mono text-emerald-700 font-medium">
                  ₹{' '}
                  {Math.round(
                    (parseFloat(newBasePrice) || 0) * (1 + (parseFloat(newRapDiscount) || 0) / 100)
                  ).toLocaleString('en-IN')}
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
                      <span>Save Diamond Grid</span>
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
