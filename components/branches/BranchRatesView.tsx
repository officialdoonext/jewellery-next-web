'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Radio,
  Tv,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  ArrowUpRight,
  Monitor,
  RefreshCw,
  Send,
  X,
  Copy,
  Check,
  Building2,
  SlidersHorizontal,
  Flame,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';

interface BranchRateSync {
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
}

const INITIAL_RATES: BranchRateSync[] = [
  {
    id: '88990011-f6a1-b2c3-d4e5-112233445566',
    branch_name: 'Banjara Hills Flagship',
    city: 'Hyderabad',
    gold_24k_rate: 8560.00,
    gold_22k_rate: 7850.00,
    gold_18k_rate: 6420.00,
    silver_rate_g: 102.50,
    regional_differential_applied: 0.00,
    last_synced_time: '2026-10-31 09:31',
    display_board_status: 'ONLINE',
    hardware_ip: '192.168.10.240',
    led_panels_count: 4,
  },
  {
    id: '88990011-f6a1-b2c3-d4e5-112233445567',
    branch_name: 'Jubilee Hills Boutique',
    city: 'Hyderabad',
    gold_24k_rate: 8560.00,
    gold_22k_rate: 7850.00,
    gold_18k_rate: 6420.00,
    silver_rate_g: 102.50,
    regional_differential_applied: 0.00,
    last_synced_time: '2026-10-31 09:31',
    display_board_status: 'ONLINE',
    hardware_ip: '192.168.11.240',
    led_panels_count: 2,
  },
  {
    id: '88990011-f6a1-b2c3-d4e5-112233445568',
    branch_name: 'Vijayawada MG Road Outlet',
    city: 'Vijayawada',
    gold_24k_rate: 8575.00,
    gold_22k_rate: 7865.00,
    gold_18k_rate: 6432.00,
    silver_rate_g: 103.00,
    regional_differential_applied: 15.00,
    last_synced_time: '2026-10-31 09:32',
    display_board_status: 'ONLINE',
    hardware_ip: '192.168.12.240',
    led_panels_count: 2,
  },
  {
    id: '88990011-f6a1-b2c3-d4e5-112233445569',
    branch_name: 'Vizag Beach Road Store',
    city: 'Visakhapatnam',
    gold_24k_rate: 8580.00,
    gold_22k_rate: 7870.00,
    gold_18k_rate: 6436.00,
    silver_rate_g: 103.20,
    regional_differential_applied: 20.00,
    last_synced_time: '2026-10-31 09:32',
    display_board_status: 'ONLINE',
    hardware_ip: '192.168.13.240',
    led_panels_count: 2,
  },
  {
    id: '88990011-f6a1-b2c3-d4e5-112233445570',
    branch_name: 'Hyderabad RGIA Terminal 1',
    city: 'Hyderabad',
    gold_24k_rate: 8560.00,
    gold_22k_rate: 7850.00,
    gold_18k_rate: 6420.00,
    silver_rate_g: 102.50,
    regional_differential_applied: 0.00,
    last_synced_time: '2026-10-31 09:31',
    display_board_status: 'ONLINE',
    hardware_ip: '192.168.14.240',
    led_panels_count: 2,
  },
];

export function BranchesRatesView() {
  const [rates, setRates] = useState<BranchRateSync[]>(INITIAL_RATES);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals & Drawers
  const [isBroadcastDrawerOpen, setIsBroadcastDrawerOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchRateSync | null>(null);
  const [isLedPreviewModalOpen, setIsLedPreviewModalOpen] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccessToast, setBroadcastSuccessToast] = useState(false);

  // Central Rate Broadcast Form State
  const [base24kRate, setBase24kRate] = useState<number>(8560.00);
  const [base22kRate, setBase22kRate] = useState<number>(7850.00);
  const [base18kRate, setBase18kRate] = useState<number>(6420.00);
  const [baseSilverRate, setBaseSilverRate] = useState<number>(102.50);
  const [vijayawadaDiff, setVijayawadaDiff] = useState<number>(15.00);
  const [vizagDiff, setVizagDiff] = useState<number>(20.00);
  const [broadcastReason, setBroadcastReason] = useState('Morning Market Open IBJA Fix');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleBroadcastRates = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBroadcasting(true);

    setTimeout(() => {
      const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
      setRates((prev) =>
        prev.map((b) => {
          let diff = 0;
          if (b.city === 'Vijayawada') diff = Number(vijayawadaDiff);
          if (b.city === 'Visakhapatnam') diff = Number(vizagDiff);

          return {
            ...b,
            gold_24k_rate: Number(base24kRate) + diff,
            gold_22k_rate: Number(base22kRate) + diff,
            gold_18k_rate: Number(base18kRate) + Math.round((diff * 0.75) * 100) / 100,
            silver_rate_g: Number(baseSilverRate) + (diff > 0 ? 0.50 : 0),
            regional_differential_applied: diff,
            last_synced_time: now,
            display_board_status: 'ONLINE',
          };
        })
      );

      setIsBroadcasting(false);
      setIsBroadcastDrawerOpen(false);
      setBroadcastSuccessToast(true);
      setTimeout(() => setBroadcastSuccessToast(false), 4000);
    }, 1200);
  };

  const handleForcePushSingleBranch = (branchId: string) => {
    setRates((prev) =>
      prev.map((b) => (b.id === branchId ? { ...b, display_board_status: 'SYNCING' } : b))
    );
    setTimeout(() => {
      const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
      setRates((prev) =>
        prev.map((b) =>
          b.id === branchId ? { ...b, display_board_status: 'ONLINE', last_synced_time: now } : b
        )
      );
    }, 1000);
  };

  const totalBoards = rates.reduce((acc, curr) => acc + curr.led_panels_count, 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="branches_rates" />
      <ActionToolbar
        filterPlaceholder="Search by branch name, LED controller IP, sync telemetry..."
        insertLabel="Broadcast Bullion Rates"
        onInsertClick={() => setIsBroadcastDrawerOpen(true)}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI metrics */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Digital LED Boards</span>
                <Tv className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">{totalBoards} Boards Online</div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Ethernet & WiFi Connected
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Rate Sync Telemetry</span>
                <Radio className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">100% Synced</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Zero packet drops across stores
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">City Rate Differential</span>
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-neutral-900">Active Differential</div>
              <div className="text-[11px] text-amber-600 mt-1 font-mono">
                Hyderabad IBJA Base Model
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Last Broadcast Time</span>
                <Clock className="w-3.5 h-3.5 text-neutral-700" />
              </div>
              <div className="text-xl font-medium text-neutral-900">09:31 AM Today</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                Next scheduled: 01:00 PM
              </div>
            </div>
          </div>
        </div>

        {/* Live Master Bullion Board Banner */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Base Bullion Broadcast Rates
                </div>
                <div className="text-xs text-neutral-400 mt-0.5">
                  Centralized push updates LED Showroom Boards, Billing Scales, and Mobile Apps simultaneously
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto font-mono text-center">
              <div className="bg-neutral-800/80 px-3 py-2 rounded border border-neutral-700/60">
                <span className="text-[10px] uppercase text-neutral-400 block">Gold 24K (999)</span>
                <span className="text-sm font-medium text-amber-400">₹ {base24kRate.toFixed(2)}/g</span>
              </div>
              <div className="bg-neutral-800/80 px-3 py-2 rounded border border-neutral-700/60">
                <span className="text-[10px] uppercase text-neutral-400 block">Gold 22K (916)</span>
                <span className="text-sm font-medium text-amber-300">₹ {base22kRate.toFixed(2)}/g</span>
              </div>
              <div className="bg-neutral-800/80 px-3 py-2 rounded border border-neutral-700/60">
                <span className="text-[10px] uppercase text-neutral-400 block">Gold 18K (750)</span>
                <span className="text-sm font-medium text-amber-200">₹ {base18kRate.toFixed(2)}/g</span>
              </div>
              <div className="bg-neutral-800/80 px-3 py-2 rounded border border-neutral-700/60">
                <span className="text-[10px] uppercase text-neutral-400 block">Silver (999)</span>
                <span className="text-sm font-medium text-neutral-200">₹ {baseSilverRate.toFixed(2)}/g</span>
              </div>
            </div>

            <button
              onClick={() => setIsBroadcastDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium bg-amber-500 text-neutral-950 hover:bg-amber-400 transition-colors shadow-2xs shrink-0 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              Change & Broadcast
            </button>
          </div>
        </div>

        {/* Supabase-style Table */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  public.branch_rate_sync
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Showing {rates.length} showroom display endpoints
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
                        <span className="text-neutral-800">gold_24k (₹/g)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">gold_22k (₹/g)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">silver_rate (₹/g)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">differential</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">last_synced_time</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">board_status</span>
                      </th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {rates.map((b) => (
                      <tr key={b.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="w-10 px-3 py-2 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-[11px]">
                          <span
                            onClick={() => {
                              setSelectedBranch(b);
                              setIsLedPreviewModalOpen(true);
                            }}
                            className="font-medium text-emerald-700 hover:underline cursor-pointer"
                          >
                            {b.branch_name}
                          </span>
                          <span className="block text-[10px] text-neutral-400 font-mono">
                            IP: {b.hardware_ip} ({b.led_panels_count} Panels)
                          </span>
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700">
                          {b.city}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono">
                          ₹ {b.gold_24k_rate.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono text-amber-700 font-medium">
                          ₹ {b.gold_22k_rate.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono">
                          ₹ {b.silver_rate_g.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono text-neutral-600">
                          {b.regional_differential_applied > 0
                            ? `+ ₹${b.regional_differential_applied.toFixed(2)}`
                            : 'Base (0.00)'}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-[11px] text-neutral-600">
                          {b.last_synced_time}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          {b.display_board_status === 'ONLINE' && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              ONLINE
                            </span>
                          )}
                          {b.display_board_status === 'SYNCING' && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-spin" />
                              SYNCING
                            </span>
                          )}
                          {b.display_board_status === 'OFFLINE' && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-red-50 text-red-700 border border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              OFFLINE
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleForcePushSingleBranch(b.id)}
                              className="p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="Force Push Rates to this Branch"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBranch(b);
                                setIsLedPreviewModalOpen(true);
                              }}
                              className="p-1 rounded text-neutral-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                              title="Test LED Display Board Layout"
                            >
                              <Tv className="w-3.5 h-3.5" />
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.branch_rate_sync (
                  <br />
                  &nbsp;&nbsp;id <span className="text-purple-400">UUID</span>{' '}
                  <span className="text-neutral-400">PRIMARY KEY DEFAULT gen_random_uuid()</span>,
                  <br />
                  &nbsp;&nbsp;branch_name <span className="text-purple-400">VARCHAR(100)</span>{' '}
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
                  &nbsp;&nbsp;hardware_ip <span className="text-purple-400">VARCHAR(45)</span>,
                  <br />
                  &nbsp;&nbsp;last_synced_time <span className="text-purple-400">TIMESTAMPTZ</span>{' '}
                  <span className="text-neutral-400">DEFAULT NOW()</span>,
                  <br />
                  &nbsp;&nbsp;display_board_status <span className="text-purple-400">VARCHAR(20)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;ONLINE&apos;</span>
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawer: Central 1-Click Rate Broadcast */}
      {isBroadcastDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs transition-all">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-medium text-neutral-900">
                    Broadcast Bullion Rates to Network
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
                <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs">
                  <div className="font-medium text-amber-900 mb-1 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-amber-600" />
                    Instant Network-Wide Push
                  </div>
                  <p className="text-amber-800 text-[11px] leading-relaxed">
                    Clicking broadcast publishes these rates directly to all showroom LED boards, counter scales, billing computers, and consumer apps in real time.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      24K Pure Gold Base (₹/g)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={base24kRate}
                      onChange={(e) => setBase24kRate(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-amber-500 focus:outline-none text-neutral-800 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      22K Standard 916 (₹/g)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={base22kRate}
                      onChange={(e) => setBase22kRate(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-amber-500 focus:outline-none text-neutral-800 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      18K Diamond Jewellery (₹/g)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={base18kRate}
                      onChange={(e) => setBase18kRate(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-amber-500 focus:outline-none text-neutral-800 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Silver Fine 999 (₹/g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={baseSilverRate}
                      onChange={(e) => setBaseSilverRate(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-amber-500 focus:outline-none text-neutral-800 font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Regional City Differentials */}
                <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                  <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-600" />
                    City Association Differentials
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-neutral-700 mb-1 block">
                        Vijayawada Delta (+₹/g)
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={vijayawadaDiff}
                        onChange={(e) => setVijayawadaDiff(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-700 mb-1 block">
                        Visakhapatnam Delta (+₹/g)
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={vizagDiff}
                        onChange={(e) => setVizagDiff(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Broadcast Reason / Note
                  </label>
                  <input
                    type="text"
                    value={broadcastReason}
                    onChange={(e) => setBroadcastReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  />
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
                    disabled={isBroadcasting}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-amber-500 text-neutral-950 hover:bg-amber-600 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
                  >
                    {isBroadcasting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Pushing to LED Controllers...
                      </>
                    ) : (
                      <>
                        <Radio className="w-3.5 h-3.5" />
                        1-Click Broadcast Now
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: LED Display Screen Layout Simulation */}
      {isLedPreviewModalOpen && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4">
          <div className="bg-neutral-950 rounded-xl shadow-2xl border border-neutral-800 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 text-white">
            <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-medium text-neutral-100">
                  LED Board Hardware Preview • {selectedBranch.branch_name}
                </h3>
              </div>
              <button
                onClick={() => setIsLedPreviewModalOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* LED Screen Physical Simulation */}
            <div className="p-6 flex flex-col items-center">
              <div className="w-full max-w-lg bg-black border-4 border-amber-500/80 rounded-lg p-5 shadow-2xl relative overflow-hidden">
                {/* Brand Header */}
                <div className="text-center border-b border-amber-500/40 pb-3">
                  <div className="text-amber-400 text-lg font-mono font-medium tracking-widest">
                    JEWELLERY NEXT
                  </div>
                  <div className="text-neutral-400 text-[10px] tracking-wider font-mono">
                    OFFICIAL LIVE BULLION RATES • {selectedBranch.city.toUpperCase()}
                  </div>
                </div>

                {/* Rates Grid */}
                <div className="grid grid-cols-2 gap-4 my-5 font-mono">
                  <div className="bg-neutral-900/90 border border-amber-500/30 p-3 rounded text-center">
                    <span className="text-[11px] text-amber-400 block tracking-wider">
                      GOLD 24K (999)
                    </span>
                    <span className="text-2xl text-amber-300 font-medium tracking-wider block mt-1">
                      ₹ {selectedBranch.gold_24k_rate.toFixed(0)}
                    </span>
                    <span className="text-[10px] text-neutral-400">per gram</span>
                  </div>

                  <div className="bg-neutral-900/90 border border-amber-500/30 p-3 rounded text-center">
                    <span className="text-[11px] text-amber-400 block tracking-wider">
                      GOLD 22K (916 BIS)
                    </span>
                    <span className="text-2xl text-amber-300 font-medium tracking-wider block mt-1">
                      ₹ {selectedBranch.gold_22k_rate.toFixed(0)}
                    </span>
                    <span className="text-[10px] text-neutral-400">per gram</span>
                  </div>

                  <div className="bg-neutral-900/90 border border-amber-500/30 p-3 rounded text-center">
                    <span className="text-[11px] text-amber-400 block tracking-wider">
                      GOLD 18K (750)
                    </span>
                    <span className="text-2xl text-amber-300 font-medium tracking-wider block mt-1">
                      ₹ {selectedBranch.gold_18k_rate.toFixed(0)}
                    </span>
                    <span className="text-[10px] text-neutral-400">per gram</span>
                  </div>

                  <div className="bg-neutral-900/90 border border-amber-500/30 p-3 rounded text-center">
                    <span className="text-[11px] text-neutral-300 block tracking-wider">
                      SILVER (999)
                    </span>
                    <span className="text-2xl text-neutral-100 font-medium tracking-wider block mt-1">
                      ₹ {selectedBranch.silver_rate_g.toFixed(0)}
                    </span>
                    <span className="text-[10px] text-neutral-400">per gram</span>
                  </div>
                </div>

                {/* Scrolling Ticker Simulation */}
                <div className="bg-neutral-950 border-t border-amber-500/40 pt-2 pb-1 overflow-hidden">
                  <div className="text-[11px] font-mono text-amber-400 whitespace-nowrap animate-marquee">
                    WELCOME TO JEWELLERY NEXT • TODAY GOLD 22K ₹{selectedBranch.gold_22k_rate.toFixed(0)} • SILVER ₹{selectedBranch.silver_rate_g.toFixed(0)}/g • 100% BIS HALLMARK 916 GUARANTEE • HUID COMPLIANT
                  </div>
                </div>
              </div>

              {/* Hardware diagnostics footer */}
              <div className="w-full mt-4 flex items-center justify-between text-xs text-neutral-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Controller IP: {selectedBranch.hardware_ip}
                </span>
                <span>Port: 8080 (HD-W62 LED Controller)</span>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-900 flex items-center justify-end">
              <button
                onClick={() => setIsLedPreviewModalOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-800 text-neutral-200 hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                Close Display Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Toast Feedback */}
      {broadcastSuccessToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded-md shadow-lg flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Bullion rates successfully synchronized to all 12 showroom LED boards!</span>
        </div>
      )}
    </div>
  );
}
