'use client';

import React, { useState, useMemo } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Clock,
  Sparkles,
  Layers,
  Flame,
  Gem,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  User,
  Calendar,
  Filter,
  Kanban,
  Table2,
  ChevronRight,
  MoreVertical,
  Plus,
  X,
  Check,
  RotateCcw,
  Scale,
  ShieldCheck,
} from 'lucide-react';

export type ProductionStageId =
  | 'CAD_3D_WAX'
  | 'CASTING_TREE'
  | 'STONE_SETTING'
  | 'POLISHING_BUFFING'
  | 'BIS_HALLMARK'
  | 'READY_PICKUP';

interface ProductionStageMeta {
  id: ProductionStageId;
  name: string;
  shortLabel: string;
  color: string;
  badgeBg: string;
}

const STAGES: ProductionStageMeta[] = [
  { id: 'CAD_3D_WAX', name: 'CAD & 3D Wax', shortLabel: 'CAD Wax', color: 'text-blue-600', badgeBg: 'bg-blue-50 border-blue-200' },
  { id: 'CASTING_TREE', name: 'Casting & Tree', shortLabel: 'Casting', color: 'text-amber-600', badgeBg: 'bg-amber-50 border-amber-200' },
  { id: 'STONE_SETTING', name: 'Stone Setting', shortLabel: 'Setting', color: 'text-purple-600', badgeBg: 'bg-purple-50 border-purple-200' },
  { id: 'POLISHING_BUFFING', name: 'Polishing & Buffing', shortLabel: 'Polishing', color: 'text-amber-700', badgeBg: 'bg-amber-100/60 border-amber-300' },
  { id: 'BIS_HALLMARK', name: 'BIS Hallmarking (HUID)', shortLabel: 'Hallmark', color: 'text-emerald-700', badgeBg: 'bg-emerald-50 border-emerald-200' },
  { id: 'READY_PICKUP', name: 'Ready for Pickup', shortLabel: 'Ready', color: 'text-emerald-800', badgeBg: 'bg-emerald-100/70 border-emerald-300' },
];

interface ProductionTrackingItem {
  id: string;
  order_code: string;
  customer_name: string;
  ornament_name: string;
  metal_purity: string;
  gross_weight_g: number;
  stage: ProductionStageId;
  artisan_name: string;
  workshop_unit: string;
  days_in_stage: number;
  max_stage_days: number;
  is_delayed: boolean;
  promised_date: string;
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL_BRIDAL';
  huid_code?: string;
  stage_notes?: string;
}

const INITIAL_PIPELINE: ProductionTrackingItem[] = [
  // 1. CAD & 3D Wax
  {
    id: 'trk-01',
    order_code: 'BESPOKE-109',
    customer_name: 'Radhika Singhania',
    ornament_name: 'Solitaire Engagement Band (1.50ct)',
    metal_purity: '18K Diamond',
    gross_weight_g: 4.850,
    stage: 'CAD_3D_WAX',
    artisan_name: 'Anil CAD Master',
    workshop_unit: 'Studio CAD Lab',
    days_in_stage: 1,
    max_stage_days: 2,
    is_delayed: false,
    promised_date: '2026-11-20',
    priority: 'HIGH',
    stage_notes: 'Wax printing on Solidscape resin machine',
  },
  {
    id: 'trk-02',
    order_code: 'BESPOKE-110',
    customer_name: 'Aditi Rao',
    ornament_name: 'Jhumka with Basra Pearl Drops',
    metal_purity: '22K 916',
    gross_weight_g: 22.400,
    stage: 'CAD_3D_WAX',
    artisan_name: 'Anil CAD Master',
    workshop_unit: 'Studio CAD Lab',
    days_in_stage: 2,
    max_stage_days: 3,
    is_delayed: false,
    promised_date: '2026-11-25',
    priority: 'NORMAL',
    stage_notes: '3D tree sprue alignment approved',
  },

  // 2. Casting & Tree
  {
    id: 'trk-03',
    order_code: 'BESPOKE-105',
    customer_name: 'Meera Nambiar',
    ornament_name: 'Antique Temple Lakshmi Haar',
    metal_purity: '22K 916',
    gross_weight_g: 64.200,
    stage: 'CASTING_TREE',
    artisan_name: 'Gopal Soni',
    workshop_unit: 'Vacuum Induction Unit 2',
    days_in_stage: 2,
    max_stage_days: 3,
    is_delayed: false,
    promised_date: '2026-11-22',
    priority: 'CRITICAL_BRIDAL',
    stage_notes: 'Argon vacuum cast completed; tree cut & acid pickled',
  },
  {
    id: 'trk-04',
    order_code: 'JO-2026-189',
    customer_name: 'Wholesale Batch',
    ornament_name: 'Lightweight Casting Hollow Bangles',
    metal_purity: '22K 916',
    gross_weight_g: 94.600,
    stage: 'CASTING_TREE',
    artisan_name: 'Ramesh Master',
    workshop_unit: 'Main Foundry',
    days_in_stage: 3,
    max_stage_days: 3,
    is_delayed: false,
    promised_date: '2026-11-18',
    priority: 'NORMAL',
  },

  // 3. Stone Setting
  {
    id: 'trk-05',
    order_code: 'BESPOKE-104',
    customer_name: 'Tanvi Agarwal',
    ornament_name: 'Emerald Cut Ring with Halo',
    metal_purity: '18K Diamond',
    gross_weight_g: 8.500,
    stage: 'STONE_SETTING',
    artisan_name: 'Harish Patwa',
    workshop_unit: 'Microscope Setting Desk 1',
    days_in_stage: 2,
    max_stage_days: 3,
    is_delayed: false,
    promised_date: '2026-11-15',
    priority: 'CRITICAL_BRIDAL',
    stage_notes: 'Center emerald seated; micro-pave prong tightening',
  },
  {
    id: 'trk-06',
    order_code: 'BESPOKE-106',
    customer_name: 'Kavita Reddy',
    ornament_name: 'Dual Peacock Kada Pair',
    metal_purity: '22K 916',
    gross_weight_g: 82.400,
    stage: 'STONE_SETTING',
    artisan_name: 'Harish Patwa',
    workshop_unit: 'Microscope Setting Desk 2',
    days_in_stage: 3,
    max_stage_days: 4,
    is_delayed: false,
    promised_date: '2026-11-28',
    priority: 'CRITICAL_BRIDAL',
  },

  // 4. Polishing & Buffing (with Delayed Bottleneck Alert)
  {
    id: 'trk-07',
    order_code: 'BESPOKE-102',
    customer_name: 'Vikram Mehta',
    ornament_name: 'Navratna Royal Men Ring',
    metal_purity: '22K 916',
    gross_weight_g: 14.800,
    stage: 'POLISHING_BUFFING',
    artisan_name: 'Suresh Karigar',
    workshop_unit: 'Buffing Station B',
    days_in_stage: 5,
    max_stage_days: 2,
    is_delayed: true, // Stage bottleneck!
    promised_date: '2026-11-06',
    priority: 'HIGH',
    stage_notes: 'Delayed 3+ days: rhodium bath re-plating required',
  },
  {
    id: 'trk-08',
    order_code: 'BESPOKE-107',
    customer_name: 'Ananya Joshi',
    ornament_name: 'Platinum 950 Solitaire Ring',
    metal_purity: 'Pt 950',
    gross_weight_g: 5.600,
    stage: 'POLISHING_BUFFING',
    artisan_name: 'Suresh Karigar',
    workshop_unit: 'Magnetic Tumbler Unit',
    days_in_stage: 1,
    max_stage_days: 2,
    is_delayed: false,
    promised_date: '2026-11-08',
    priority: 'HIGH',
  },

  // 5. BIS Hallmarking (HUID)
  {
    id: 'trk-09',
    order_code: 'BESPOKE-101',
    customer_name: 'Deepa Chawla',
    ornament_name: 'Antique Choker Set & Earrings',
    metal_purity: '22K 916',
    gross_weight_g: 52.120,
    stage: 'BIS_HALLMARK',
    artisan_name: 'Assaying Officer',
    workshop_unit: 'Govt Hallmarking Center #4',
    days_in_stage: 1,
    max_stage_days: 2,
    is_delayed: false,
    promised_date: '2026-11-10',
    priority: 'NORMAL',
    huid_code: 'HUID-916-JK8821',
  },

  // 6. Ready for Pickup
  {
    id: 'trk-10',
    order_code: 'BESPOKE-108',
    customer_name: 'Priya Sharma',
    ornament_name: 'Emerald Beads & Diamond Choker',
    metal_purity: '18K Diamond',
    gross_weight_g: 45.100,
    stage: 'READY_PICKUP',
    artisan_name: 'Front Counter Lead',
    workshop_unit: 'Safe Locker #3',
    days_in_stage: 1,
    max_stage_days: 5,
    is_delayed: false,
    promised_date: '2026-12-05',
    priority: 'NORMAL',
    huid_code: 'HUID-750-PL9942',
    stage_notes: 'Certificate & velvet box signed off. Ready for patron.',
  },
];

export function OrdersTrackingView() {
  const [pipeline, setPipeline] = useState<ProductionTrackingItem[]>(INITIAL_PIPELINE);
  const [viewFormat, setViewFormat] = useState<'kanban' | 'table'>('kanban');
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [filterSearch, setFilterSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'NORMAL' | 'HIGH' | 'CRITICAL_BRIDAL'>('ALL');
  const [selectedItemForAction, setSelectedItemForAction] = useState<ProductionTrackingItem | null>(null);
  const [actionStageNotes, setActionStageNotes] = useState('');

  // 1-click Advance to Next Stage
  const handleAdvanceStage = (itemId: string) => {
    setPipeline((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const currentIndex = STAGES.findIndex((s) => s.id === item.stage);
        if (currentIndex < STAGES.length - 1) {
          const nextStage = STAGES[currentIndex + 1].id;
          return {
            ...item,
            stage: nextStage,
            days_in_stage: 0,
            is_delayed: false,
            stage_notes: `Advanced to ${STAGES[currentIndex + 1].name} on Oct 31`,
          };
        }
        return item;
      })
    );
  };

  // Move back to previous stage (rework)
  const handleReworkStage = (itemId: string) => {
    setPipeline((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const currentIndex = STAGES.findIndex((s) => s.id === item.stage);
        if (currentIndex > 0) {
          const prevStage = STAGES[currentIndex - 1].id;
          return {
            ...item,
            stage: prevStage,
            days_in_stage: 1,
            is_delayed: false,
            stage_notes: `Sent for rework to ${STAGES[currentIndex - 1].name}`,
          };
        }
        return item;
      })
    );
  };

  // Filtered pipeline
  const filteredPipeline = useMemo(() => {
    return pipeline.filter((item) => {
      const matchSearch =
        item.order_code.toLowerCase().includes(filterSearch.toLowerCase()) ||
        item.customer_name.toLowerCase().includes(filterSearch.toLowerCase()) ||
        item.ornament_name.toLowerCase().includes(filterSearch.toLowerCase()) ||
        item.artisan_name.toLowerCase().includes(filterSearch.toLowerCase());
      const matchPriority = priorityFilter === 'ALL' || item.priority === priorityFilter;
      return matchSearch && matchPriority;
    });
  }, [pipeline, filterSearch, priorityFilter]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="order_stages_tracking" />
      <ActionToolbar
        filterPlaceholder="Filter pipeline orders by artisan, customer, job code..."
        insertLabel="New Production Job"
        onInsertClick={() => {}}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics Cards */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                In Production Pipeline
              </span>
              <span className="p-1 rounded bg-blue-50 text-blue-600">
                <Kanban className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-neutral-800 font-mono">32 Orders</div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              Active across 6 manufacturing stations
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                On Schedule SLA
              </span>
              <span className="p-1 rounded bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-neutral-800 font-mono">29 Orders (90.6%)</div>
            <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
              <span>Within stage lead-time SLA</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-amber-300 hover:border-amber-400 bg-amber-50/20 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-amber-800 uppercase tracking-wider">
                Stage Bottlenecks
              </span>
              <span className="p-1 rounded bg-amber-100 text-amber-700">
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-amber-900 font-mono">3 in Polishing</div>
            <div className="text-[11px] text-amber-700 mt-1 flex items-center gap-1 font-medium">
              1 order delayed &gt; 3 days in rhodium
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Avg Lead Time
              </span>
              <span className="p-1 rounded bg-purple-50 text-purple-600">
                <Clock className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-neutral-800 font-mono">12.4 Days</div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              CAD to final Hallmarked pickup
            </div>
          </div>
        </div>

        {/* View Switcher & Filter Controls */}
        <div className="px-4 pb-2 flex flex-wrap items-center justify-between gap-2 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2">
            {/* View Mode Toggle: Kanban vs Table */}
            <div className="inline-flex rounded-md border border-[#e2e8f0] bg-white p-0.5 shadow-2xs">
              <button
                onClick={() => setViewFormat('kanban')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  viewFormat === 'kanban'
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Kanban Pipeline</span>
              </button>
              <button
                onClick={() => setViewFormat('table')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  viewFormat === 'table'
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                <span>Data Table</span>
              </button>
            </div>

            {/* Supabase Schema Definition Toggle */}
            <button
              onClick={() => setActiveTab(activeTab === 'data' ? 'definition' : 'data')}
              className={`px-3 py-1 rounded-md text-xs font-medium border border-[#e2e8f0] transition-colors cursor-pointer ${
                activeTab === 'definition'
                  ? 'bg-neutral-800 text-white'
                  : 'bg-white text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {activeTab === 'definition' ? 'Close DDL' : 'View DDL'}
            </button>
          </div>

          {/* Priority Quick Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-medium text-neutral-500">Priority:</span>
            {(['ALL', 'CRITICAL_BRIDAL', 'HIGH', 'NORMAL'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  priorityFilter === p
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-white text-neutral-600 border border-[#e2e8f0] hover:bg-neutral-50'
                }`}
              >
                {p === 'ALL'
                  ? 'All Orders'
                  : p === 'CRITICAL_BRIDAL'
                  ? 'Bridal Critical'
                  : p.charAt(0) + p.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode: Schema Definition (DDL) */}
        {activeTab === 'definition' ? (
          <div className="p-4 flex-1">
            <div className="bg-[#1e1e1e] text-neutral-200 p-4 rounded-lg font-mono text-xs leading-relaxed overflow-x-auto shadow-inner">
              <span className="text-emerald-400">CREATE TABLE</span> public.order_stages_tracking (
              <br />
              &nbsp;&nbsp;id <span className="text-blue-400">UUID</span> PRIMARY KEY DEFAULT gen_random_uuid(),
              <br />
              &nbsp;&nbsp;order_code <span className="text-blue-400">VARCHAR(50)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;customer_name <span className="text-blue-400">VARCHAR(150)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;ornament_name <span className="text-blue-400">VARCHAR(200)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;stage <span className="text-blue-400">VARCHAR(50)</span> NOT NULL CHECK (stage IN (
              &apos;CAD_3D_WAX&apos;, &apos;CASTING_TREE&apos;, &apos;STONE_SETTING&apos;,
              &apos;POLISHING_BUFFING&apos;, &apos;BIS_HALLMARK&apos;, &apos;READY_PICKUP&apos;)),
              <br />
              &nbsp;&nbsp;artisan_name <span className="text-blue-400">VARCHAR(100)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;workshop_unit <span className="text-blue-400">VARCHAR(100)</span>,
              <br />
              &nbsp;&nbsp;days_in_stage <span className="text-blue-400">INTEGER</span> DEFAULT 0,
              <br />
              &nbsp;&nbsp;max_stage_days <span className="text-blue-400">INTEGER</span> DEFAULT 3,
              <br />
              &nbsp;&nbsp;is_delayed <span className="text-blue-400">BOOLEAN</span> DEFAULT FALSE,
              <br />
              &nbsp;&nbsp;huid_code <span className="text-blue-400">VARCHAR(20)</span>,
              <br />
              &nbsp;&nbsp;promised_date <span className="text-blue-400">DATE</span> NOT NULL,
              <br />
              &nbsp;&nbsp;priority <span className="text-blue-400">VARCHAR(30)</span> DEFAULT &apos;NORMAL&apos;,
              <br />
              &nbsp;&nbsp;stage_notes <span className="text-blue-400">TEXT</span>,
              <br />
              &nbsp;&nbsp;updated_at <span className="text-blue-400">TIMESTAMPTZ</span> DEFAULT now()
              <br />
              );
              <br />
              <br />
              <span className="text-emerald-400">CREATE INDEX</span> idx_tracking_stage_lead ON public.order_stages_tracking(stage, is_delayed);
            </div>
          </div>
        ) : viewFormat === 'kanban' ? (
          /* Visual Production Kanban Board (6 Stage Columns) */
          <div className="flex-1 p-4 overflow-x-auto">
            <div className="flex gap-3.5 min-w-[1280px] pb-4 items-start">
              {STAGES.map((col, colIdx) => {
                const stageItems = filteredPipeline.filter((item) => item.stage === col.id);
                return (
                  <div
                    key={col.id}
                    className="w-72 shrink-0 bg-[#f1f5f9]/70 rounded-lg border border-[#e2e8f0] flex flex-col max-h-[calc(100vh-210px)]"
                  >
                    {/* Column Header */}
                    <div className="p-3 border-b border-[#e2e8f0] bg-white rounded-t-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-medium text-neutral-800">{col.name}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-neutral-100 text-neutral-700">
                        {stageItems.length}
                      </span>
                    </div>

                    {/* Column Cards Container */}
                    <div className="p-2.5 space-y-2.5 overflow-y-auto custom-scrollbar flex-1">
                      {stageItems.length === 0 ? (
                        <div className="py-8 text-center text-[11px] text-neutral-400 border border-dashed border-[#cbd5e1] rounded-md bg-white/50">
                          No orders in {col.shortLabel}
                        </div>
                      ) : (
                        stageItems.map((item) => (
                          <div
                            key={item.id}
                            className={`p-3 rounded-lg bg-white border transition-all shadow-2xs hover:shadow-xs ${
                              item.is_delayed
                                ? 'border-amber-400 bg-amber-50/20'
                                : 'border-[#e2e8f0] hover:border-emerald-300'
                            }`}
                          >
                            {/* Card Top Row: Order Code & Priority */}
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-mono text-xs font-medium text-emerald-700">
                                {item.order_code}
                              </span>
                              {item.priority === 'CRITICAL_BRIDAL' && (
                                <span className="text-[9px] font-medium bg-red-50 text-red-700 px-1.5 py-0.2 rounded border border-red-200">
                                  Bridal Due
                                </span>
                              )}
                              {item.priority === 'HIGH' && (
                                <span className="text-[9px] font-medium bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded border border-amber-200">
                                  High
                                </span>
                              )}
                            </div>

                            {/* Customer & Item */}
                            <div className="font-medium text-xs text-neutral-800 line-clamp-1">
                              {item.ornament_name}
                            </div>
                            <div className="text-[11px] text-neutral-500 mb-2">
                              {item.customer_name} •{' '}
                              <span className="font-mono text-neutral-700 font-medium">
                                {item.gross_weight_g.toFixed(3)}g ({item.metal_purity})
                              </span>
                            </div>

                            {/* Artisan and Days in Stage */}
                            <div className="p-2 rounded bg-[#f8fafc] border border-[#e2e8f0] text-[11px] mb-2 space-y-1">
                              <div className="flex items-center justify-between text-neutral-600">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3 text-neutral-400" />
                                  <span className="truncate max-w-[120px]">{item.artisan_name}</span>
                                </span>
                                <span
                                  className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                                    item.is_delayed
                                      ? 'bg-amber-100 text-amber-800 border border-amber-300 font-medium'
                                      : 'bg-neutral-100 text-neutral-600'
                                  }`}
                                >
                                  {item.days_in_stage}d / {item.max_stage_days}d max
                                </span>
                              </div>
                              {item.huid_code && (
                                <div className="text-[10px] font-mono text-emerald-700 flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> {item.huid_code}
                                </div>
                              )}
                            </div>

                            {/* Stage Notes if present */}
                            {item.stage_notes && (
                              <p className="text-[10px] text-neutral-500 italic mb-2 line-clamp-2">
                                &ldquo;{item.stage_notes}&rdquo;
                              </p>
                            )}

                            {/* Card Footer: 1-click Advance Button */}
                            <div className="flex items-center justify-between pt-1 border-t border-[#f1f5f9]">
                              {colIdx > 0 ? (
                                <button
                                  onClick={() => handleReworkStage(item.id)}
                                  className="text-[10px] text-neutral-400 hover:text-amber-700 p-1 rounded transition-colors flex items-center gap-0.5 cursor-pointer"
                                  title="Send back for Rework"
                                >
                                  <RotateCcw className="w-2.5 h-2.5" /> Back
                                </button>
                              ) : (
                                <span className="text-[10px] text-neutral-400">Intake</span>
                              )}

                              {colIdx < STAGES.length - 1 ? (
                                <button
                                  onClick={() => handleAdvanceStage(item.id)}
                                  className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition-colors shadow-2xs cursor-pointer"
                                >
                                  <span>Advance</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              ) : (
                                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  Ready for Handover
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Table View of Pipeline */
          <div className="flex-1 p-4">
            <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-neutral-500 font-medium">
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Order Code</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Customer Name</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb]">Ornament & Purity</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Current Station</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Assigned Artisan</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] text-center whitespace-nowrap">Stage Lead Time</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Promised Due</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap">Quick Transition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {filteredPipeline.map((item) => (
                      <tr key={item.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap font-mono">
                          <span className="font-medium text-emerald-700">{item.order_code}</span>
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap font-medium text-neutral-800">
                          {item.customer_name}
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb]">
                          <div className="font-medium text-neutral-800">{item.ornament_name}</div>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            {item.gross_weight_g.toFixed(3)}g • {item.metal_purity}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            {STAGES.find((s) => s.id === item.stage)?.name}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700">
                          {item.artisan_name}
                          <span className="text-[10px] text-neutral-400 block">{item.workshop_unit}</span>
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                              item.is_delayed
                                ? 'bg-amber-100 text-amber-800 border border-amber-300 font-medium'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {item.days_in_stage} days (max {item.max_stage_days}d)
                          </span>
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-neutral-700">
                          {item.promised_date}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleAdvanceStage(item.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                          >
                            <span>Advance Stage</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
