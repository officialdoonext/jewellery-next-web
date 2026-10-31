'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Package,
  Sparkles,
  Layers,
  Gem,
  Vault,
  Plus,
  X,
  Copy,
  Check,
  ShieldCheck,
  Image as ImageIcon,
  ArrowUpDown,
  FileSpreadsheet,
  QrCode,
  Tag,
  Scale,
  Percent,
  Coins,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface OrnamentItem {
  id: string;
  tag_number: string;
  huid_code: string;
  ornament_name: string;
  category: string;
  metal: string;
  purity: string;
  gross_weight_g: number;
  net_weight_g: number;
  stone_weight_cts: number;
  location: string;
  making_charge: number;
  wastage_percent: number;
  estimated_value: number;
  status: 'IN_STOCK' | 'RESERVED' | 'ON_APPROVAL' | 'SOLD';
}

const INITIAL_ORNAMENTS: OrnamentItem[] = [
  {
    id: '89a1c22d-621f-4efc-8b89-a09c81bca001',
    tag_number: 'TAG-G-8910',
    huid_code: 'AB92D8',
    ornament_name: '22K Temple Antique Haar',
    category: 'Necklace',
    metal: 'Gold',
    purity: '22K (916)',
    gross_weight_g: 48.240,
    net_weight_g: 45.100,
    stone_weight_cts: 15.70,
    location: 'Main Vault #1',
    making_charge: 14500,
    wastage_percent: 12.5,
    estimated_value: 398500,
    status: 'IN_STOCK',
  },
  {
    id: '89a1c22d-621f-4efc-8b89-a09c81bca002',
    tag_number: 'TAG-D-4512',
    huid_code: 'DF81H9',
    ornament_name: 'Solitaire Diamond Ring (VVS1)',
    category: 'Rings',
    metal: 'Gold (18K)',
    purity: '18K (750)',
    gross_weight_g: 5.420,
    net_weight_g: 5.120,
    stone_weight_cts: 1.50,
    location: 'Counter 1',
    making_charge: 8500,
    wastage_percent: 8.0,
    estimated_value: 165000,
    status: 'IN_STOCK',
  },
  {
    id: '89a1c22d-621f-4efc-8b89-a09c81bca003',
    tag_number: 'TAG-G-7104',
    huid_code: 'KL72P3',
    ornament_name: 'Traditional Peacock Jhumkas',
    category: 'Earrings',
    metal: 'Gold',
    purity: '22K (916)',
    gross_weight_g: 18.600,
    net_weight_g: 17.800,
    stone_weight_cts: 4.00,
    location: 'Counter 2',
    making_charge: 6200,
    wastage_percent: 10.0,
    estimated_value: 154200,
    status: 'IN_STOCK',
  },
  {
    id: '89a1c22d-621f-4efc-8b89-a09c81bca004',
    tag_number: 'TAG-G-6201',
    huid_code: 'MN51X2',
    ornament_name: 'Handcrafted Calcutta Bangles (Pair)',
    category: 'Bangles',
    metal: 'Gold',
    purity: '22K (916)',
    gross_weight_g: 36.450,
    net_weight_g: 36.450,
    stone_weight_cts: 0.00,
    location: 'Display Counter B',
    making_charge: 11200,
    wastage_percent: 11.5,
    estimated_value: 305800,
    status: 'RESERVED',
  },
  {
    id: '89a1c22d-621f-4efc-8b89-a09c81bca005',
    tag_number: 'TAG-G-3190',
    huid_code: 'QR88V1',
    ornament_name: 'Classic Men Hollow Curb Chain',
    category: 'Chains',
    metal: 'Gold',
    purity: '22K (916)',
    gross_weight_g: 22.180,
    net_weight_g: 22.180,
    stone_weight_cts: 0.00,
    location: 'Counter 3',
    making_charge: 5500,
    wastage_percent: 8.5,
    estimated_value: 184500,
    status: 'IN_STOCK',
  },
  {
    id: '89a1c22d-621f-4efc-8b89-a09c81bca006',
    tag_number: 'TAG-D-9031',
    huid_code: 'ZC34Y9',
    ornament_name: 'Emerald & Diamond Choker Necklace',
    category: 'Necklace',
    metal: 'Gold (18K)',
    purity: '18K (750)',
    gross_weight_g: 62.400,
    net_weight_g: 54.200,
    stone_weight_cts: 41.00,
    location: 'Exhibition Tray',
    making_charge: 28000,
    wastage_percent: 14.0,
    estimated_value: 685000,
    status: 'ON_APPROVAL',
  },
  {
    id: '89a1c22d-621f-4efc-8b89-a09c81bca007',
    tag_number: 'TAG-S-1049',
    huid_code: 'AG99K2',
    ornament_name: 'Silver Puja Kalash with Coconut (999)',
    category: 'Silverware',
    metal: 'Fine Silver',
    purity: 'Silver 999',
    gross_weight_g: 450.000,
    net_weight_g: 450.000,
    stone_weight_cts: 0.00,
    location: 'Main Vault #1',
    making_charge: 4500,
    wastage_percent: 5.0,
    estimated_value: 48500,
    status: 'IN_STOCK',
  },
];

export function InventoryOrnamentsView() {
  const [ornaments, setOrnaments] = useState<OrnamentItem[]>(INITIAL_ORNAMENTS);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedKarat, setSelectedKarat] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New Ornament Form State
  const [newTag, setNewTag] = useState('TAG-G-' + Math.floor(1000 + Math.random() * 9000));
  const [newHUID, setNewHUID] = useState('HD74' + Math.floor(10 + Math.random() * 89));
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Necklace');
  const [newMetal, setNewMetal] = useState('Yellow Gold');
  const [newKarat, setNewKarat] = useState('22K (916)');
  const [newGrossWt, setNewGrossWt] = useState('');
  const [newNetWt, setNewNetWt] = useState('');
  const [newStoneWt, setNewStoneWt] = useState('0.00');
  const [newWastage, setNewWastage] = useState('10.5');
  const [newMaking, setNewMaking] = useState('8500');
  const [newLocation, setNewLocation] = useState('Main Vault #1');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddOrnament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newGrossWt) return;

    const gross = parseFloat(newGrossWt) || 0;
    const net = parseFloat(newNetWt) || gross;
    const item: OrnamentItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}`,
      tag_number: newTag,
      huid_code: newHUID.toUpperCase(),
      ornament_name: newName,
      category: newCategory,
      metal: newMetal,
      purity: newKarat,
      gross_weight_g: gross,
      net_weight_g: net,
      stone_weight_cts: parseFloat(newStoneWt) || 0,
      location: newLocation,
      making_charge: parseFloat(newMaking) || 5000,
      wastage_percent: parseFloat(newWastage) || 10,
      estimated_value: Math.round(net * 7850 + (parseFloat(newMaking) || 5000)),
      status: 'IN_STOCK',
    };

    setOrnaments([item, ...ornaments]);
    setIsAddModalOpen(false);
    // Reset form
    setNewName('');
    setNewGrossWt('');
    setNewNetWt('');
    setNewTag('TAG-G-' + Math.floor(1000 + Math.random() * 9000));
    setNewHUID('HD' + Math.floor(1000 + Math.random() * 8999));
  };

  const filteredOrnaments = ornaments.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (selectedKarat !== 'All' && !item.purity.includes(selectedKarat)) return false;
    if (selectedLocation !== 'All' && item.location !== selectedLocation) return false;
    if (selectedStatus !== 'All' && item.status !== selectedStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTag = item.tag_number.toLowerCase().includes(q);
      const matchHuid = item.huid_code.toLowerCase().includes(q);
      const matchName = item.ornament_name.toLowerCase().includes(q);
      if (!matchTag && !matchHuid && !matchName) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="inventory_ornaments" />
      <ActionToolbar
        filterPlaceholder="Filter by tag, HUID, ornament name..."
        insertLabel="New Ornament"
        onInsertClick={() => setIsAddModalOpen(true)}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics Summary Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Items</span>
                <Package className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">2,480 pcs</div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live showroom & vault
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Gold Stock</span>
                <Coins className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">38.450 kg</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                22K 916 & 18K Hallmarked
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Diamond Studded</span>
                <Gem className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">412 pcs</div>
              <div className="text-[11px] text-blue-700 mt-1 font-mono">
                284.50 cts certified
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Silver Articles</span>
                <Layers className="w-3.5 h-3.5 text-neutral-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">124.800 kg</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Pujaware & 925 Sterling
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">In Main Vault</span>
                <Vault className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">18.200 kg</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Dual Custodian lock
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
            {/* Filter Chips */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-neutral-400 font-mono text-[11px]">Filters:</span>

              {/* Category */}
              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Cat:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="Necklace">Necklace</option>
                  <option value="Bangles">Bangles</option>
                  <option value="Rings">Rings</option>
                  <option value="Chains">Chains</option>
                  <option value="Earrings">Earrings</option>
                  <option value="Silverware">Silverware</option>
                </select>
              </div>

              {/* Karat */}
              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Karat:</span>
                <select
                  value={selectedKarat}
                  onChange={(e) => setSelectedKarat(e.target.value)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Purities</option>
                  <option value="22K">22K 916</option>
                  <option value="18K">18K 750</option>
                  <option value="24K">24K 999</option>
                  <option value="Silver">Silver</option>
                </select>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Location:</span>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Locations</option>
                  <option value="Main Vault #1">Main Vault #1</option>
                  <option value="Counter 1">Counter 1</option>
                  <option value="Counter 2">Counter 2</option>
                  <option value="Counter 3">Counter 3</option>
                  <option value="Display Counter B">Display Counter B</option>
                  <option value="Exhibition Tray">Exhibition Tray</option>
                </select>
              </div>

              {/* Status */}
              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="IN_STOCK">In Stock</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="ON_APPROVAL">On Approval</option>
                  <option value="SOLD">Sold</option>
                </select>
              </div>
            </div>

            {/* Quick search input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search Tag / HUID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 px-2.5 py-1 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none placeholder:text-neutral-400"
              />
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Ornament</span>
              </button>
            </div>
          </div>
        </div>

        {/* Supabase-style Table / Schema Definition Section */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            {/* Table Header Info Bar */}
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  inventory_ornaments
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Showing {filteredOrnaments.length} of {ornaments.length} tagged pieces
                </span>
              </div>

              {/* Data / Definition toggle buttons */}
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

            {/* Table Content: Data Tab */}
            {activeTab === 'data' && (
              <div className="flex-1 overflow-x-auto custom-scrollbar w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#fcfcfc] border-b border-[#e5e7eb] text-neutral-600 font-mono text-[12px]">
                      <th className="w-10 px-3 py-2 border-r border-[#e5e7eb] text-center">
                        <input
                          type="checkbox"
                          className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                        />
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">id</span>
                          <span className="text-neutral-400 font-normal text-[10px]">uuid</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">tag_code</span>
                          <span className="text-neutral-400 font-normal text-[10px]">varchar</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">huid_code</span>
                          <span className="text-neutral-400 font-normal text-[10px]">bis_hallmark</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">ornament_name & category</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">gross_wt</span>
                          <span className="text-neutral-400 font-normal text-[10px]">numeric</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">net_wt</span>
                          <span className="text-neutral-400 font-normal text-[10px]">numeric</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">purity</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">location</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">est_value</span>
                          <span className="text-neutral-400 font-normal text-[10px]">inr</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">status</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb] font-mono text-neutral-800 text-[12px]">
                    {filteredOrnaments.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-neutral-50/80 transition-colors group"
                      >
                        <td className="px-3 py-2 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>

                        {/* ID with Copy */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <div className="flex items-center gap-1.5 group/cell">
                            <span className="truncate max-w-[80px] text-neutral-500">
                              {row.id.slice(0, 8)}...
                            </span>
                            <button
                              onClick={() => copyToClipboard(row.id, row.id)}
                              className="opacity-0 group-hover/cell:opacity-100 p-0.5 hover:bg-neutral-200 rounded transition-opacity cursor-pointer"
                              title="Copy UUID"
                            >
                              {copiedId === row.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3 text-neutral-400" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Tag Code */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-medium text-neutral-900">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-800 text-[11px]">
                            <Tag className="w-2.5 h-2.5 text-neutral-500" />
                            {row.tag_number}
                          </span>
                        </td>

                        {/* HUID Code */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            {row.huid_code}
                          </span>
                        </td>

                        {/* Ornament Name & Category */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <div className="font-sans text-neutral-900 font-medium text-xs">
                            {row.ornament_name}
                          </div>
                          <div className="font-mono text-[10px] text-neutral-400">
                            {row.category} • {row.metal}
                          </div>
                        </td>

                        {/* Gross Weight */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-medium text-neutral-900">
                          {row.gross_weight_g.toFixed(3)} g
                        </td>

                        {/* Net Weight */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700">
                          {row.net_weight_g.toFixed(3)} g
                          {row.stone_weight_cts > 0 && (
                            <span className="ml-1 text-[10px] text-blue-600 font-sans">
                              ({row.stone_weight_cts.toFixed(2)} cts)
                            </span>
                          )}
                        </td>

                        {/* Purity */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded text-[11px] bg-amber-50 text-amber-800 border border-amber-200">
                            {row.purity}
                          </span>
                        </td>

                        {/* Location */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-600 text-[11px]">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-neutral-400" />
                            {row.location}
                          </span>
                        </td>

                        {/* Estimated Value */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-medium text-neutral-900">
                          ₹ {row.estimated_value.toLocaleString('en-IN')}
                        </td>

                        {/* Status */}
                        <td className="px-3.5 py-2 whitespace-nowrap text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              row.status === 'IN_STOCK'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : row.status === 'RESERVED'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : row.status === 'ON_APPROVAL'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table Content: Definition Tab */}
            {activeTab === 'definition' && (
              <div className="p-4 overflow-x-auto font-mono text-xs text-neutral-800 bg-[#fbfbfb] w-full">
                <div className="bg-neutral-900 text-neutral-100 p-4 rounded-md overflow-x-auto shadow-inner text-[12px] leading-relaxed w-full">
                  <span className="text-emerald-400">CREATE TABLE</span> public.inventory_ornaments (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">tag_number</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">UNIQUE NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">huid_code</span>{' '}
                  <span className="text-amber-300">varchar(6)</span>{' '}
                  <span className="text-neutral-400">NOT NULL CHECK (huid_code ~ &apos;^[A-Z0-9]{'{6}'}$&apos;),</span>
                  <br />
                  <span className="pl-6 text-blue-300">ornament_name</span>{' '}
                  <span className="text-amber-300">varchar(255)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">category</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">metal_type</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;Gold&apos;,</span>
                  <br />
                  <span className="pl-6 text-blue-300">purity</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;22K (916)&apos;,</span>
                  <br />
                  <span className="pl-6 text-blue-300">gross_weight_g</span>{' '}
                  <span className="text-amber-300">numeric(10,3)</span>{' '}
                  <span className="text-neutral-400">NOT NULL CHECK (gross_weight_g &gt; 0),</span>
                  <br />
                  <span className="pl-6 text-blue-300">net_weight_g</span>{' '}
                  <span className="text-amber-300">numeric(10,3)</span>{' '}
                  <span className="text-neutral-400">NOT NULL CHECK (net_weight_g &lt;= gross_weight_g),</span>
                  <br />
                  <span className="pl-6 text-blue-300">stone_weight_cts</span>{' '}
                  <span className="text-amber-300">numeric(8,2)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0.00,</span>
                  <br />
                  <span className="pl-6 text-blue-300">location</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;Main Vault #1&apos;,</span>
                  <br />
                  <span className="pl-6 text-blue-300">making_charges</span>{' '}
                  <span className="text-amber-300">numeric(10,2)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0.00,</span>
                  <br />
                  <span className="pl-6 text-blue-300">wastage_percent</span>{' '}
                  <span className="text-amber-300">numeric(5,2)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 10.00,</span>
                  <br />
                  <span className="pl-6 text-blue-300">status</span>{' '}
                  <span className="text-amber-300">varchar(20)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;IN_STOCK&apos;,</span>
                  <br />
                  <span className="pl-6 text-blue-300">created_at</span>{' '}
                  <span className="text-amber-300">timestamptz</span>{' '}
                  <span className="text-neutral-400">DEFAULT now()</span>
                  <br />
                  );
                  <br />
                  <br />
                  <span className="text-neutral-500">-- BIS Hallmark HUID validation index</span>
                  <br />
                  <span className="text-emerald-400">CREATE INDEX</span> idx_ornaments_huid{' '}
                  <span className="text-emerald-400">ON</span> public.inventory_ornaments (huid_code);
                  <br />
                  <span className="text-emerald-400">ALTER TABLE</span> public.inventory_ornaments{' '}
                  <span className="text-emerald-400">ENABLE ROW LEVEL SECURITY;</span>
                </div>
              </div>
            )}

            {/* Table Footer Bar */}
            <div className="h-[36px] bg-[#f8fafc] border-t border-[#e5e7eb] px-3.5 flex items-center justify-between text-[12px] text-neutral-500 font-mono select-none w-full">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span>Showing</span>
                  <span className="px-1.5 py-0.5 bg-white border border-[#e2e8f0] rounded text-neutral-800 font-medium">
                    {filteredOrnaments.length}
                  </span>
                  <span>records</span>
                </div>
                <span>•</span>
                <span>Active Filter: {selectedCategory} / {selectedKarat} / {selectedStatus}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> BIS Hallmark Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Ornament Drawer / Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#e2e8f0] max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">Add New Ornament</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                  BIS Hallmarking Ready
                </span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-neutral-200 rounded text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleAddOrnament} className="p-4 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Tag Code *</label>
                  <input
                    type="text"
                    required
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    placeholder="TAG-G-9021"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    6-Digit BIS HUID Code *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={newHUID}
                      onChange={(e) => setNewHUID(e.target.value.toUpperCase())}
                      className="w-full pl-3 pr-8 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono tracking-widest uppercase"
                      placeholder="AB12CD"
                    />
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Ornament Title *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  placeholder="e.g. 22K Antique Lakshmi Choker Set"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  >
                    <option value="Necklace">Necklace</option>
                    <option value="Bangles">Bangles</option>
                    <option value="Rings">Rings</option>
                    <option value="Chains">Chains</option>
                    <option value="Earrings">Earrings</option>
                    <option value="Mangalsutra">Mangalsutra</option>
                    <option value="Kadas">Kadas</option>
                    <option value="Silverware">Silverware</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Metal Type</label>
                  <select
                    value={newMetal}
                    onChange={(e) => setNewMetal(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  >
                    <option value="Yellow Gold">Yellow Gold</option>
                    <option value="Rose Gold">Rose Gold</option>
                    <option value="White Gold">White Gold</option>
                    <option value="Fine Silver">Fine Silver</option>
                    <option value="Platinum">Platinum 950</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Purity Standard</label>
                  <select
                    value={newKarat}
                    onChange={(e) => setNewKarat(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  >
                    <option value="22K (916)">22K (916)</option>
                    <option value="18K (750)">18K (750)</option>
                    <option value="24K (999)">24K (999)</option>
                    <option value="14K (585)">14K (585)</option>
                    <option value="Silver 999">Silver 999</option>
                    <option value="Silver 925">Silver 925</option>
                  </select>
                </div>
              </div>

              {/* Weights and Rates */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Gross Weight (g) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={newGrossWt}
                    onChange={(e) => {
                      setNewGrossWt(e.target.value);
                      if (!newNetWt) setNewNetWt(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    placeholder="0.000"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Net Weight (g) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={newNetWt}
                    onChange={(e) => setNewNetWt(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    placeholder="0.000"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Stones / Diamond (cts)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newStoneWt}
                    onChange={(e) => setNewStoneWt(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Wastage VA (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWastage}
                    onChange={(e) => setNewWastage(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    placeholder="10.5"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Making Charge (₹)</label>
                  <input
                    type="number"
                    value={newMaking}
                    onChange={(e) => setNewMaking(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Showroom Location</label>
                  <select
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  >
                    <option value="Main Vault #1">Main Vault #1</option>
                    <option value="Counter 1">Counter 1</option>
                    <option value="Counter 2">Counter 2</option>
                    <option value="Counter 3">Counter 3</option>
                    <option value="Display Counter B">Display Counter B</option>
                    <option value="Exhibition Tray">Exhibition Tray</option>
                  </select>
                </div>
              </div>

              {/* Photo dropzone */}
              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Item Photograph</label>
                <div className="border border-dashed border-[#cbd5e1] rounded-lg p-4 text-center hover:bg-neutral-50 transition-colors cursor-pointer bg-[#fafafa]">
                  <ImageIcon className="w-6 h-6 text-neutral-400 mx-auto mb-1" />
                  <p className="text-xs text-neutral-600 font-medium">Click or drag photo here</p>
                  <p className="text-[10px] text-neutral-400">PNG, JPG up to 5MB</p>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#e5e7eb]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save to Inventory</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
