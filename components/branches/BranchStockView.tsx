'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Boxes,
  Search,
  Sparkles,
  ArrowRightLeft,
  Gem,
  Scale,
  Building2,
  Lock,
  Layers,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  Copy,
  Check,
  ChevronRight,
  Eye,
  Send,
  SlidersHorizontal,
} from 'lucide-react';

interface BranchStockSummary {
  id: string;
  branch_name: string;
  city: string;
  total_items_count: number;
  gold_weight_kg: number;
  diamond_carats: number;
  silver_articles_kg: number;
  valuation_cr: number;
  last_audited_date: string;
  audit_status: 'VERIFIED_100%' | 'PENDING_RECHECK';
  vault_utilization_pct: number;
}

interface CrossBranchItem {
  id: string;
  tag_number: string;
  item_name: string;
  category: string;
  branch_name: string;
  tray_number: string;
  counter_name: string;
  vault_location: string;
  gross_weight_g: number;
  net_fine_weight_g: number;
  diamond_weight_cts?: number;
  selling_price_inr: number;
  status: 'AVAILABLE' | 'ON_TRIAL' | 'VAULT_STORED';
}

const INITIAL_SUMMARIES: BranchStockSummary[] = [
  {
    id: '77889900-e5f6-a1b2-c3d4-001122334455',
    branch_name: 'Banjara Hills Flagship',
    city: 'Hyderabad',
    total_items_count: 2480,
    gold_weight_kg: 32.400,
    diamond_carats: 145.20,
    silver_articles_kg: 18.500,
    valuation_cr: 26.80,
    last_audited_date: '2026-10-30',
    audit_status: 'VERIFIED_100%',
    vault_utilization_pct: 72,
  },
  {
    id: '77889900-e5f6-a1b2-c3d4-001122334456',
    branch_name: 'Jubilee Hills Boutique',
    city: 'Hyderabad',
    total_items_count: 820,
    gold_weight_kg: 10.200,
    diamond_carats: 84.50,
    silver_articles_kg: 4.200,
    valuation_cr: 9.40,
    last_audited_date: '2026-10-29',
    audit_status: 'VERIFIED_100%',
    vault_utilization_pct: 41,
  },
  {
    id: '77889900-e5f6-a1b2-c3d4-001122334457',
    branch_name: 'Vijayawada MG Road Outlet',
    city: 'Vijayawada',
    total_items_count: 940,
    gold_weight_kg: 8.650,
    diamond_carats: 28.40,
    silver_articles_kg: 12.000,
    valuation_cr: 7.20,
    last_audited_date: '2026-10-28',
    audit_status: 'VERIFIED_100%',
    vault_utilization_pct: 43,
  },
  {
    id: '77889900-e5f6-a1b2-c3d4-001122334458',
    branch_name: 'Vizag Beach Road Store',
    city: 'Visakhapatnam',
    total_items_count: 650,
    gold_weight_kg: 6.850,
    diamond_carats: 19.80,
    silver_articles_kg: 9.400,
    valuation_cr: 5.60,
    last_audited_date: '2026-10-27',
    audit_status: 'VERIFIED_100%',
    vault_utilization_pct: 38,
  },
  {
    id: '77889900-e5f6-a1b2-c3d4-001122334459',
    branch_name: 'Hyderabad RGIA Terminal 1',
    city: 'Hyderabad',
    total_items_count: 310,
    gold_weight_kg: 2.500,
    diamond_carats: 16.80,
    silver_articles_kg: 1.500,
    valuation_cr: 2.30,
    last_audited_date: '2026-10-31',
    audit_status: 'VERIFIED_100%',
    vault_utilization_pct: 21,
  },
];

const SAMPLE_CROSS_BRANCH_ITEMS: CrossBranchItem[] = [
  {
    id: 'cb-001',
    tag_number: 'TAG-G-91024',
    item_name: 'Solitaire Diamond Ring VVS1 (1.20 ct)',
    category: 'Diamond Rings',
    branch_name: 'Jubilee Hills Boutique',
    tray_number: 'Tray D-04',
    counter_name: 'Diamond Salon #02',
    vault_location: 'Safe B, Shelf 2',
    gross_weight_g: 4.850,
    net_fine_weight_g: 3.650,
    diamond_weight_cts: 1.20,
    selling_price_inr: 485000.00,
    status: 'AVAILABLE',
  },
  {
    id: 'cb-002',
    tag_number: 'TAG-G-88192',
    item_name: 'Temple Antique Haar with Polki & Emeralds',
    category: 'Bridal Chokers',
    branch_name: 'Banjara Hills Flagship',
    tray_number: 'Tray T-01',
    counter_name: 'Bridal Pavilion Counter #01',
    vault_location: 'Main Strongroom Vault #1',
    gross_weight_g: 88.400,
    net_fine_weight_g: 78.200,
    selling_price_inr: 720000.00,
    status: 'AVAILABLE',
  },
  {
    id: 'cb-003',
    tag_number: 'TAG-G-77210',
    item_name: 'Calcutta Handcrafted Kada (Pair)',
    category: 'Bangles & Kadas',
    branch_name: 'Vijayawada MG Road Outlet',
    tray_number: 'Tray B-08',
    counter_name: 'Gold Counter #03',
    vault_location: 'Vault Locker 4',
    gross_weight_g: 48.600,
    net_fine_weight_g: 44.500,
    selling_price_inr: 395000.00,
    status: 'AVAILABLE',
  },
  {
    id: 'cb-004',
    tag_number: 'TAG-G-66291',
    item_name: 'Solitaire Diamond Tennis Bracelet (5.40 ct)',
    category: 'Diamond Sets',
    branch_name: 'Banjara Hills Flagship',
    tray_number: 'Tray D-12',
    counter_name: 'VIP Private Lounge',
    vault_location: 'Main Strongroom Vault #2',
    gross_weight_g: 16.800,
    net_fine_weight_g: 12.400,
    diamond_weight_cts: 5.40,
    selling_price_inr: 950000.00,
    status: 'ON_TRIAL',
  },
  {
    id: 'cb-005',
    tag_number: 'TAG-G-55102',
    item_name: 'Lightweight Dailywear 22K Mangalsutra Chain',
    category: 'Dailywear Chains',
    branch_name: 'Hyderabad RGIA Terminal 1',
    tray_number: 'Tray A-02',
    counter_name: 'Express Kiosk Display',
    vault_location: 'Compact Kiosk Safe',
    gross_weight_g: 14.200,
    net_fine_weight_g: 13.000,
    selling_price_inr: 118000.00,
    status: 'AVAILABLE',
  },
  {
    id: 'cb-006',
    tag_number: 'TAG-G-44091',
    item_name: 'Vintage Kasu Mala 22K (Lakshmi Coins)',
    category: 'Bridal Chokers',
    branch_name: 'Vizag Beach Road Store',
    tray_number: 'Tray T-06',
    counter_name: 'Traditional Gold Counter #01',
    vault_location: 'Strongroom Vault #1',
    gross_weight_g: 54.100,
    net_fine_weight_g: 49.550,
    selling_price_inr: 445000.00,
    status: 'AVAILABLE',
  },
];

export function BranchesStockView() {
  const [summaries, setSummaries] = useState<BranchStockSummary[]>(INITIAL_SUMMARIES);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Cross-Branch Item Locator search state
  const [locatorQuery, setLocatorQuery] = useState('');
  const [locatorCategory, setLocatorCategory] = useState('ALL');

  // Modals
  const [selectedBranch, setSelectedBranch] = useState<BranchStockSummary | null>(null);
  const [isTrayModalOpen, setIsTrayModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [targetTransferBranch, setTargetTransferBranch] = useState('Banjara Hills Flagship');
  const [transferRequestNotes, setTransferRequestNotes] = useState('');
  const [requestSubmittedToast, setRequestSubmittedToast] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendTransferRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRequestModalOpen(false);
    setRequestSubmittedToast(true);
    setTimeout(() => setRequestSubmittedToast(false), 3500);
  };

  // Cross-branch items search results
  const matchedItems = SAMPLE_CROSS_BRANCH_ITEMS.filter((item) => {
    if (locatorCategory !== 'ALL' && item.category !== locatorCategory) return false;
    if (locatorQuery.trim() === '') return true;
    const q = locatorQuery.toLowerCase();
    return (
      item.item_name.toLowerCase().includes(q) ||
      item.tag_number.toLowerCase().includes(q) ||
      item.branch_name.toLowerCase().includes(q) ||
      item.tray_number.toLowerCase().includes(q)
    );
  });

  const totalGoldKg = summaries.reduce((acc, curr) => acc + curr.gold_weight_kg, 0);
  const totalDiamonds = summaries.reduce((acc, curr) => acc + curr.diamond_carats, 0);
  const totalValuation = summaries.reduce((acc, curr) => acc + curr.valuation_cr, 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="branches_stock" />
      <ActionToolbar
        filterPlaceholder="Search across all branches for SKU, Tag, Diamond ring, Choker..."
        insertLabel="Request Stock Transfer"
        onInsertClick={() => {
          setSelectedBranch(summaries[0]);
          setIsRequestModalOpen(true);
        }}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI metrics */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Enterprise Total Stock</span>
                <Boxes className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">{totalGoldKg.toFixed(3)} kg Gold</div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live RFID Tally Synced
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-blue-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Diamond Holdings</span>
                <Gem className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">{totalDiamonds.toFixed(2)} cts</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Certified GIA / IGI Solitaires
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Network Inventory Value</span>
                <Scale className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">₹ {totalValuation.toFixed(2)} Cr</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                Market Value Mark-to-Market
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Stock Rebalancing</span>
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-neutral-900">1 Transfer Recommended</div>
              <div className="text-[11px] text-amber-600 mt-1 font-mono">
                Surplus chokers at Flagship
              </div>
            </div>
          </div>
        </div>

        {/* Cross-Branch Ornament Locator Tool */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-neutral-900 uppercase tracking-wider">
                    Cross-Branch Ornament Locator
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Locate ornaments immediately across any showroom counter, tray, or vault safe
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={locatorCategory}
                  onChange={(e) => setLocatorCategory(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Diamond Rings">Diamond Rings</option>
                  <option value="Bridal Chokers">Bridal Chokers</option>
                  <option value="Bangles & Kadas">Bangles & Kadas</option>
                  <option value="Diamond Sets">Diamond Sets</option>
                  <option value="Dailywear Chains">Dailywear Chains</option>
                </select>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by tag #, item name, or style..."
                    value={locatorQuery}
                    onChange={(e) => setLocatorQuery(e.target.value)}
                    className="w-64 pl-8 pr-3 py-1 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none placeholder:text-neutral-400 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Matched items cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-3">
              {matchedItems.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-md bg-white border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs flex flex-col justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {item.tag_number}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          item.status === 'AVAILABLE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="font-medium text-neutral-900 mt-1 line-clamp-1">
                      {item.item_name}
                    </div>

                    <div className="mt-2 text-[11px] text-neutral-600 space-y-0.5 font-mono">
                      <div className="flex items-center gap-1 text-neutral-800">
                        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="font-medium">{item.branch_name}</span>
                      </div>
                      <div className="text-neutral-500 pl-4">
                        {item.counter_name} • {item.tray_number}
                      </div>
                      <div className="text-neutral-400 pl-4 text-[10px]">
                        Safe: {item.vault_location}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#f1f5f9] flex items-center justify-between text-[11px]">
                    <div className="font-mono text-neutral-700">
                      <span>{item.gross_weight_g.toFixed(3)}g</span>
                      {item.diamond_weight_cts && (
                        <span className="text-blue-600 ml-1">({item.diamond_weight_cts} ct)</span>
                      )}
                    </div>
                    <div className="font-medium text-neutral-900 font-mono">
                      ₹ {item.selling_price_inr.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Branch Stock Breakdown Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-neutral-600" />
            Branch Stock Holdings Comparison
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {summaries.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-neutral-900 truncate">
                      {b.branch_name}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono block">
                    {b.city}
                  </span>

                  <div className="mt-3 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-neutral-500 text-[11px]">Gold:</span>
                      <span className="font-medium text-neutral-900">{b.gold_weight_kg.toFixed(3)} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 text-[11px]">Diamonds:</span>
                      <span className="text-blue-700 font-medium">{b.diamond_carats.toFixed(2)} cts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 text-[11px]">Items:</span>
                      <span className="text-neutral-800">{b.total_items_count} pcs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 text-[11px]">Valuation:</span>
                      <span className="text-emerald-700 font-medium">₹ {b.valuation_cr.toFixed(2)} Cr</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#e2e8f0]">
                  <div className="flex justify-between items-center text-[10px] text-neutral-500 font-mono mb-1">
                    <span>Vault Safe Load</span>
                    <span>{b.vault_utilization_pct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-neutral-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        b.vault_utilization_pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${b.vault_utilization_pct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supabase-style Table */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  public.branch_stock_summary
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Showing {summaries.length} store inventory registers
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
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#fcfcfc] border-b border-[#e5e7eb] text-neutral-600 font-mono text-[11px]">
                      <th className="w-10 px-3 py-2 border-r border-[#e5e7eb] text-center">
                        <input
                          type="checkbox"
                          className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                        />
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">branch_name</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">city</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">total_items_count</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">gold_weight_kg</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">diamond_carats</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">silver_articles_kg</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">valuation_cr</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">last_audited_date</span>
                      </th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {summaries.map((item) => (
                      <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="w-10 px-3 py-2 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-[11px]">
                          <span
                            onClick={() => {
                              setSelectedBranch(item);
                              setIsTrayModalOpen(true);
                            }}
                            className="font-medium text-emerald-700 hover:underline cursor-pointer"
                          >
                            {item.branch_name}
                          </span>
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700">
                          {item.city}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono">
                          {item.total_items_count}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono">
                          <span className="font-medium text-neutral-900">{item.gold_weight_kg.toFixed(3)} kg</span>
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono text-blue-700">
                          {item.diamond_carats.toFixed(2)} cts
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono">
                          {item.silver_articles_kg.toFixed(3)} kg
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono text-emerald-700 font-medium">
                          ₹ {item.valuation_cr.toFixed(2)} Cr
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span>{item.last_audited_date}</span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedBranch(item);
                                setIsTrayModalOpen(true);
                              }}
                              className="px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
                            >
                              Tray Details
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBranch(item);
                                setTargetTransferBranch(item.branch_name);
                                setIsRequestModalOpen(true);
                              }}
                              className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                            >
                              Request Transfer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'definition' && (
              <div className="p-4 overflow-x-auto font-mono text-xs text-neutral-800 bg-[#fbfbfb] w-full">
                <div className="bg-neutral-900 text-neutral-100 p-4 rounded-md overflow-x-auto shadow-inner text-[12px] leading-relaxed w-full">
                  <span className="text-emerald-400">CREATE TABLE</span> public.branch_stock_summary (
                  <br />
                  &nbsp;&nbsp;id <span className="text-purple-400">UUID</span>{' '}
                  <span className="text-neutral-400">PRIMARY KEY DEFAULT gen_random_uuid()</span>,
                  <br />
                  &nbsp;&nbsp;branch_name <span className="text-purple-400">VARCHAR(100)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;total_items_count <span className="text-purple-400">INTEGER</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0</span>,
                  <br />
                  &nbsp;&nbsp;gold_weight_kg <span className="text-purple-400">NUMERIC(10,3)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;diamond_carats <span className="text-purple-400">NUMERIC(8,2)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0.00</span>,
                  <br />
                  &nbsp;&nbsp;silver_articles_kg <span className="text-purple-400">NUMERIC(10,3)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0.000</span>,
                  <br />
                  &nbsp;&nbsp;valuation_cr <span className="text-purple-400">NUMERIC(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;last_audited_date <span className="text-purple-400">DATE</span>,
                  <br />
                  &nbsp;&nbsp;updated_at <span className="text-purple-400">TIMESTAMPTZ</span>{' '}
                  <span className="text-neutral-400">DEFAULT NOW()</span>
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Branch Tray & Category Breakdown */}
      {isTrayModalOpen && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#e5e7eb] w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="px-5 py-4 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-medium text-neutral-900">
                    {selectedBranch.branch_name} • Tray & Category Stock
                  </h3>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    Total: {selectedBranch.gold_weight_kg.toFixed(3)} kg Gold • {selectedBranch.diamond_carats.toFixed(2)} cts Diamond
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsTrayModalOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc]">
                  <div className="font-medium text-neutral-900 mb-1 flex items-center justify-between">
                    <span>Bridal Chokers & Haar</span>
                    <span className="font-mono text-emerald-700">12 Trays</span>
                  </div>
                  <div className="text-[11px] text-neutral-500 space-y-0.5 font-mono">
                    <div>Gross Weight: 14.800 kg</div>
                    <div>Pieces: 184 Items</div>
                    <div>Safe: Strongroom Class AA Safe #1</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc]">
                  <div className="font-medium text-neutral-900 mb-1 flex items-center justify-between">
                    <span>Bangles & Kadas</span>
                    <span className="font-mono text-emerald-700">18 Trays</span>
                  </div>
                  <div className="text-[11px] text-neutral-500 space-y-0.5 font-mono">
                    <div>Gross Weight: 9.600 kg</div>
                    <div>Pieces: 420 Pairs</div>
                    <div>Safe: Counter B Displays & Vault Safe #2</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc]">
                  <div className="font-medium text-neutral-900 mb-1 flex items-center justify-between">
                    <span>Diamond Solitaires & Rings</span>
                    <span className="font-mono text-blue-700">8 Trays</span>
                  </div>
                  <div className="text-[11px] text-neutral-500 space-y-0.5 font-mono">
                    <div>Gross Weight: 2.100 kg</div>
                    <div>Diamonds: {selectedBranch.diamond_carats.toFixed(2)} Carats</div>
                    <div>Safe: High-Security Diamond Locker #01</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc]">
                  <div className="font-medium text-neutral-900 mb-1 flex items-center justify-between">
                    <span>Dailywear Chains & Mangalsutra</span>
                    <span className="font-mono text-emerald-700">14 Trays</span>
                  </div>
                  <div className="text-[11px] text-neutral-500 space-y-0.5 font-mono">
                    <div>Gross Weight: 5.900 kg</div>
                    <div>Pieces: 610 Items</div>
                    <div>Safe: Counter A Express Trays</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between">
              <span className="text-[11px] text-neutral-500 font-mono">
                Audit Verified: {selectedBranch.last_audited_date}
              </span>
              <button
                onClick={() => setIsTrayModalOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Request Stock Transfer */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#e5e7eb] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="px-5 py-4 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">
                  Request Stock Rebalance Transfer
                </h3>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendTransferRequest} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">
                  Requesting Stock From Branch
                </label>
                <select
                  value={targetTransferBranch}
                  onChange={(e) => setTargetTransferBranch(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                >
                  <option value="Banjara Hills Flagship">Banjara Hills Flagship</option>
                  <option value="Jubilee Hills Boutique">Jubilee Hills Boutique</option>
                  <option value="Vijayawada MG Road Outlet">Vijayawada MG Road Outlet</option>
                  <option value="Vizag Beach Road Store">Vizag Beach Road Store</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">
                  Category / Items Needed
                </label>
                <input
                  type="text"
                  defaultValue="22K Calcutta Bangles & Solitaire Ring Stock"
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">
                  Approximate Weight Requested (g)
                </label>
                <input
                  type="number"
                  step="0.001"
                  defaultValue={350.000}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">
                  Requisition Justification
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. VIP Customer Bridal booking tomorrow morning..."
                  value={transferRequestNotes}
                  onChange={(e) => setTransferRequestNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                />
              </div>

              <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit Transfer Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Toast */}
      {requestSubmittedToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded-md shadow-lg flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Transfer Requisition submitted to Central Vault Custodian!</span>
        </div>
      )}
    </div>
  );
}
