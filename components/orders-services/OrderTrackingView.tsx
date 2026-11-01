'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
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
  Search,
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
  RotateCw,
  Trash2,
  Loader2,
  ExternalLink,
  Wrench,
  Truck,
  Receipt,
  FileText,
} from 'lucide-react';

export type ProductionStageId =
  | 'CAD_3D_WAX'
  | 'CASTING_TREE'
  | 'STONE_SETTING'
  | 'POLISHING_BUFFING'
  | 'BIS_HALLMARK'
  | 'READY_PICKUP';

export interface ProductionStageMeta {
  id: ProductionStageId;
  name: string;
  shortLabel: string;
  color: string;
  badgeBg: string;
}

export const STAGES: ProductionStageMeta[] = [
  { id: 'CAD_3D_WAX', name: 'CAD & 3D Wax', shortLabel: 'CAD Wax', color: 'text-blue-600', badgeBg: 'bg-blue-50 border-blue-200' },
  { id: 'CASTING_TREE', name: 'Casting & Tree', shortLabel: 'Casting', color: 'text-amber-600', badgeBg: 'bg-amber-50 border-amber-200' },
  { id: 'STONE_SETTING', name: 'Stone Setting', shortLabel: 'Setting', color: 'text-purple-600', badgeBg: 'bg-purple-50 border-purple-200' },
  { id: 'POLISHING_BUFFING', name: 'Polishing & Buffing', shortLabel: 'Polishing', color: 'text-amber-700', badgeBg: 'bg-amber-100/60 border-amber-300' },
  { id: 'BIS_HALLMARK', name: 'BIS Hallmarking (HUID)', shortLabel: 'Hallmark', color: 'text-emerald-700', badgeBg: 'bg-emerald-50 border-emerald-200' },
  { id: 'READY_PICKUP', name: 'Ready for Pickup', shortLabel: 'Ready', color: 'text-emerald-800', badgeBg: 'bg-emerald-100/70 border-emerald-300' },
];

export interface ProductionTrackingItem {
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
  created_at?: string;
  updated_at?: string;
}

const SAMPLE_PIPELINE_SEED: Omit<ProductionTrackingItem, 'id'>[] = [
  {
    order_code: 'BESPOKE-109',
    customer_name: 'Radhika Singhania',
    ornament_name: 'Solitaire Engagement Band (1.50ct)',
    metal_purity: '18K Diamond',
    gross_weight_g: 4.85,
    stage: 'CAD_3D_WAX',
    artisan_name: 'Anil CAD Master',
    workshop_unit: 'Studio CAD Lab',
    days_in_stage: 1,
    max_stage_days: 2,
    is_delayed: false,
    promised_date: '2026-11-20',
    priority: 'HIGH',
    stage_notes: 'Wax printing on Solidscape resin machine',
    created_at: '2026-10-28',
  },
  {
    order_code: 'BESPOKE-105',
    customer_name: 'Meera Nambiar',
    ornament_name: 'Antique Temple Lakshmi Haar',
    metal_purity: '22K 916',
    gross_weight_g: 64.2,
    stage: 'CASTING_TREE',
    artisan_name: 'Gopal Soni',
    workshop_unit: 'Vacuum Induction Unit 2',
    days_in_stage: 2,
    max_stage_days: 3,
    is_delayed: false,
    promised_date: '2026-11-22',
    priority: 'CRITICAL_BRIDAL',
    stage_notes: 'Argon vacuum cast completed; tree cut & acid pickled',
    created_at: '2026-10-29',
  },
  {
    order_code: 'BESPOKE-104',
    customer_name: 'Tanvi Agarwal',
    ornament_name: 'Emerald Cut Ring with Halo',
    metal_purity: '18K Diamond',
    gross_weight_g: 8.5,
    stage: 'STONE_SETTING',
    artisan_name: 'Harish Patwa',
    workshop_unit: 'Microscope Setting Desk 1',
    days_in_stage: 2,
    max_stage_days: 3,
    is_delayed: false,
    promised_date: '2026-11-15',
    priority: 'CRITICAL_BRIDAL',
    stage_notes: 'Center emerald seated; micro-pave prong tightening',
    created_at: '2026-10-27',
  },
  {
    order_code: 'BESPOKE-102',
    customer_name: 'Vikram Mehta',
    ornament_name: 'Navratna Royal Men Ring',
    metal_purity: '22K 916',
    gross_weight_g: 14.8,
    stage: 'POLISHING_BUFFING',
    artisan_name: 'Suresh Karigar',
    workshop_unit: 'Buffing Station B',
    days_in_stage: 5,
    max_stage_days: 2,
    is_delayed: true,
    promised_date: '2026-11-06',
    priority: 'HIGH',
    stage_notes: 'Delayed 3+ days: rhodium bath re-plating required',
    created_at: '2026-10-25',
  },
  {
    order_code: 'BESPOKE-101',
    customer_name: 'Deepa Chawla',
    ornament_name: 'Antique Choker Set & Earrings',
    metal_purity: '22K 916',
    gross_weight_g: 52.12,
    stage: 'BIS_HALLMARK',
    artisan_name: 'Assaying Officer',
    workshop_unit: 'Govt Hallmarking Center #4',
    days_in_stage: 1,
    max_stage_days: 2,
    is_delayed: false,
    promised_date: '2026-11-10',
    priority: 'NORMAL',
    huid_code: 'HUID-916-JK8821',
    created_at: '2026-10-26',
  },
  {
    order_code: 'BESPOKE-108',
    customer_name: 'Priya Sharma',
    ornament_name: 'Emerald Beads & Diamond Choker',
    metal_purity: '18K Diamond',
    gross_weight_g: 45.1,
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
    created_at: '2026-10-24',
  },
];

export function OrdersTrackingView() {
  const [pipeline, setPipeline] = useState<ProductionTrackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewFormat, setViewFormat] = useState<'kanban' | 'table'>('kanban');
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [filterSearch, setFilterSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'NORMAL' | 'HIGH' | 'CRITICAL_BRIDAL'>('ALL');
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Form State
  const [formOrderCode, setFormOrderCode] = useState('');
  const [formCustomerName, setFormCustomerName] = useState('Radhika Singhania');
  const [formOrnamentName, setFormOrnamentName] = useState('Solitaire Engagement Band (1.50ct)');
  const [formMetalPurity, setFormMetalPurity] = useState('18K Diamond');
  const [formGrossWeight, setFormGrossWeight] = useState('4.850');
  const [formStage, setFormStage] = useState<ProductionStageId>('CAD_3D_WAX');
  const [formArtisan, setFormArtisan] = useState('Anil CAD Master');
  const [formWorkshopUnit, setFormWorkshopUnit] = useState('Studio CAD Lab');
  const [formPromisedDate, setFormPromisedDate] = useState('2026-11-20');
  const [formPriority, setFormPriority] = useState<'NORMAL' | 'HIGH' | 'CRITICAL_BRIDAL'>('HIGH');
  const [formHuid, setFormHuid] = useState('');
  const [formNotes, setFormNotes] = useState('Initial CAD wax model design in progress.');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const fetchPipeline = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'orders_tracking'));
      const list: ProductionTrackingItem[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<ProductionTrackingItem, 'id'>) });
      });
      setPipeline(list);
    } catch (err: any) {
      console.error('Error fetching order tracking pipeline:', err);
      showToast('error', err.message || 'Failed to fetch tracking pipeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipeline();
  }, []);

  const openNewItemDrawer = () => {
    setFormOrderCode(`BESPOKE-${110 + pipeline.length}`);
    setIsNewItemOpen(true);
  };

  const handleSeedSamples = async () => {
    try {
      setSaving(true);
      const added: ProductionTrackingItem[] = [];
      for (const item of SAMPLE_PIPELINE_SEED) {
        const docRef = await addDoc(collection(db, 'orders_tracking'), item);
        added.push({ id: docRef.id, ...item });
      }
      setPipeline((prev) => [...added, ...prev]);
      showToast('success', `${added.length} sample tracking orders loaded into Firestore.`);
    } catch (err: any) {
      console.error('Error seeding pipeline:', err);
      showToast('error', err.message || 'Failed to seed sample orders');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTrackingItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const newItemData: Omit<ProductionTrackingItem, 'id'> = {
        order_code: formOrderCode || `BESPOKE-${Date.now().toString().slice(-4)}`,
        customer_name: formCustomerName,
        ornament_name: formOrnamentName,
        metal_purity: formMetalPurity,
        gross_weight_g: parseFloat(formGrossWeight) || 5.0,
        stage: formStage,
        artisan_name: formArtisan,
        workshop_unit: formWorkshopUnit,
        days_in_stage: 1,
        max_stage_days: 3,
        is_delayed: false,
        promised_date: formPromisedDate,
        priority: formPriority,
        huid_code: formHuid || undefined,
        stage_notes: formNotes,
        created_at: new Date().toISOString().slice(0, 10),
      };

      const docRef = await addDoc(collection(db, 'orders_tracking'), newItemData);
      setPipeline([{ id: docRef.id, ...newItemData }, ...pipeline]);
      setIsNewItemOpen(false);
      showToast('success', `Order ${newItemData.order_code} added to tracking pipeline.`);
    } catch (err: any) {
      console.error('Error adding tracking item:', err);
      showToast('error', err.message || 'Failed to add order to pipeline');
    } finally {
      setSaving(false);
    }
  };

  // 1-click Advance to Next Stage with Firestore Update
  const handleAdvanceStage = async (itemId: string) => {
    const item = pipeline.find((i) => i.id === itemId);
    if (!item) return;

    const currentIndex = STAGES.findIndex((s) => s.id === item.stage);
    if (currentIndex < STAGES.length - 1) {
      const nextStage = STAGES[currentIndex + 1].id;
      const nextStageName = STAGES[currentIndex + 1].name;
      const today = new Date().toISOString().slice(0, 10);
      const newNotes = `Advanced to ${nextStageName} on ${today}`;

      try {
        await updateDoc(doc(db, 'orders_tracking', itemId), {
          stage: nextStage,
          days_in_stage: 0,
          is_delayed: false,
          stage_notes: newNotes,
          updated_at: new Date().toISOString(),
        });

        setPipeline((prev) =>
          prev.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  stage: nextStage,
                  days_in_stage: 0,
                  is_delayed: false,
                  stage_notes: newNotes,
                }
              : i
          )
        );
        showToast('success', `Advanced ${item.order_code} to ${nextStageName}`);
      } catch (err: any) {
        console.error('Error advancing stage:', err);
        showToast('error', err.message || 'Failed to advance stage');
      }
    }
  };

  // Move back to previous stage (rework)
  const handleReworkStage = async (itemId: string) => {
    const item = pipeline.find((i) => i.id === itemId);
    if (!item) return;

    const currentIndex = STAGES.findIndex((s) => s.id === item.stage);
    if (currentIndex > 0) {
      const prevStage = STAGES[currentIndex - 1].id;
      const prevStageName = STAGES[currentIndex - 1].name;
      const newNotes = `Sent for rework to ${prevStageName}`;

      try {
        await updateDoc(doc(db, 'orders_tracking', itemId), {
          stage: prevStage,
          days_in_stage: 1,
          is_delayed: false,
          stage_notes: newNotes,
          updated_at: new Date().toISOString(),
        });

        setPipeline((prev) =>
          prev.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  stage: prevStage,
                  days_in_stage: 1,
                  is_delayed: false,
                  stage_notes: newNotes,
                }
              : i
          )
        );
        showToast('success', `Moved ${item.order_code} back to ${prevStageName} for rework`);
      } catch (err: any) {
        console.error('Error moving stage:', err);
        showToast('error', err.message || 'Failed to move stage');
      }
    }
  };

  const handleDirectStageChange = async (itemId: string, newStage: ProductionStageId) => {
    try {
      await updateDoc(doc(db, 'orders_tracking', itemId), {
        stage: newStage,
        days_in_stage: 0,
        is_delayed: false,
        updated_at: new Date().toISOString(),
      });
      setPipeline((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, stage: newStage, days_in_stage: 0, is_delayed: false } : i))
      );
      showToast('success', `Updated stage to ${STAGES.find((s) => s.id === newStage)?.name}`);
    } catch (err: any) {
      console.error('Error updating stage:', err);
      showToast('error', err.message || 'Failed to update stage');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to remove this order from tracking?')) return;
    try {
      setDeletingId(itemId);
      await deleteDoc(doc(db, 'orders_tracking', itemId));
      setPipeline((prev) => prev.filter((i) => i.id !== itemId));
      showToast('success', 'Order removed from pipeline.');
    } catch (err: any) {
      console.error('Error deleting tracking item:', err);
      showToast('error', err.message || 'Failed to delete order from tracking');
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered pipeline
  const filteredPipeline = useMemo(() => {
    return pipeline.filter((item) => {
      const matchSearch =
        (item.order_code || '').toLowerCase().includes(filterSearch.toLowerCase()) ||
        (item.customer_name || '').toLowerCase().includes(filterSearch.toLowerCase()) ||
        (item.ornament_name || '').toLowerCase().includes(filterSearch.toLowerCase()) ||
        (item.artisan_name || '').toLowerCase().includes(filterSearch.toLowerCase());
      const matchPriority = priorityFilter === 'ALL' || item.priority === priorityFilter;
      return matchSearch && matchPriority;
    });
  }, [pipeline, filterSearch, priorityFilter]);

  // Aggregate metrics
  const delayedItems = pipeline.filter((i) => i.is_delayed || i.days_in_stage > i.max_stage_days);
  const onScheduleCount = pipeline.length - delayedItems.length;
  const readyPickupCount = pipeline.filter((i) => i.stage === 'READY_PICKUP').length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="order_stages_tracking" />
      <ActionToolbar
        filterPlaceholder="Filter pipeline orders by artisan, customer, job code..."
        insertLabel="New Production Job"
        onInsertClick={openNewItemDrawer}
      />

      {/* Interlinked Module Navigation Header */}
      <div className="bg-white border-b border-[#e2e8f0] px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar text-xs">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mr-1">Workflow:</span>
          <Link
            href="/orders-services/custom-orders"
            className="px-2.5 py-1 rounded hover:bg-neutral-100 text-neutral-600 font-medium border border-[#e2e8f0] flex items-center gap-1.5 whitespace-nowrap"
          >
            <Sparkles className="w-3 h-3 text-neutral-500" /> Custom Orders
          </Link>
          <Link
            href="/orders-services/tracking"
            className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-200 flex items-center gap-1.5 whitespace-nowrap"
          >
            <Layers className="w-3 h-3 text-emerald-600" /> Production Pipeline
          </Link>
          <Link
            href="/orders-services/repairs"
            className="px-2.5 py-1 rounded hover:bg-neutral-100 text-neutral-600 font-medium border border-[#e2e8f0] flex items-center gap-1.5 whitespace-nowrap"
          >
            <Wrench className="w-3 h-3 text-neutral-500" /> Repairs
          </Link>
          <Link
            href="/orders-services/job-work"
            className="px-2.5 py-1 rounded hover:bg-neutral-100 text-neutral-600 font-medium border border-[#e2e8f0] flex items-center gap-1.5 whitespace-nowrap"
          >
            <Scale className="w-3 h-3 text-neutral-500" /> Job Work
          </Link>
          <Link
            href="/orders-services/goldsmith-ledger"
            className="px-2.5 py-1 rounded hover:bg-neutral-100 text-neutral-600 font-medium border border-[#e2e8f0] flex items-center gap-1.5 whitespace-nowrap"
          >
            <FileText className="w-3 h-3 text-neutral-500" /> Karigar Ledger
          </Link>
          <Link
            href="/orders-services/delivery-management"
            className="px-2.5 py-1 rounded hover:bg-neutral-100 text-neutral-600 font-medium border border-[#e2e8f0] flex items-center gap-1.5 whitespace-nowrap"
          >
            <Truck className="w-3 h-3 text-neutral-500" /> Secure Delivery
          </Link>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/sales/billing-pos"
            className="px-2 py-1 rounded text-[11px] font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-2xs"
          >
            <Receipt className="w-3 h-3" /> Go to POS Billing
          </Link>
          <button
            onClick={fetchPipeline}
            disabled={loading}
            className="p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Refresh Pipeline"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* Toast Feedback */}
        {toastType !== 'idle' && (
          <div
            className={`border-b px-4 py-2 text-xs font-medium flex items-center justify-between animate-fadeIn ${
              toastType === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {toastType === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastType('idle')}
              className="text-neutral-500 hover:text-neutral-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

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
            <div className="text-xl font-medium text-neutral-800 font-mono">{pipeline.length} Orders</div>
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
            <div className="text-xl font-medium text-neutral-800 font-mono">
              {onScheduleCount} Orders ({pipeline.length > 0 ? Math.round((onScheduleCount / pipeline.length) * 100) : 100}%)
            </div>
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
            <div className="text-xl font-medium text-amber-900 font-mono">{delayedItems.length} Delayed</div>
            <div className="text-[11px] text-amber-700 mt-1 flex items-center gap-1 font-medium">
              Orders requiring workshop attention
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Ready for Handover
              </span>
              <span className="p-1 rounded bg-purple-50 text-purple-600">
                <Clock className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-neutral-800 font-mono">{readyPickupCount} Ready</div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              <Link href="/orders-services/delivery-management" className="text-emerald-700 hover:underline flex items-center gap-0.5">
                Dispatch Courier <ChevronRight className="w-3 h-3" />
              </Link>
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

            {/* DDL Toggle */}
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

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search pipeline..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                className="pl-8 pr-3 py-1 rounded text-xs border border-[#e2e8f0] bg-white focus:outline-none focus:border-emerald-500 w-40"
              />
            </div>

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
                  ? 'All'
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
            </div>
          </div>
        ) : loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
            <h3 className="text-sm font-medium text-neutral-800">Loading Tracking Pipeline...</h3>
            <p className="text-xs text-neutral-500 mt-1">Connecting to Firestore collection &apos;orders_tracking&apos;</p>
          </div>
        ) : filteredPipeline.length === 0 ? (
          <div className="bg-white border border-[#e2e8f0] rounded-lg m-4 p-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Kanban className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium text-neutral-800">No Orders in Tracking Pipeline</h3>
            <p className="text-xs text-neutral-500 max-w-md mt-1 mb-4">
              {filterSearch || priorityFilter !== 'ALL'
                ? 'No pipeline orders matched your search or priority filters.'
                : 'There are currently no active orders in the manufacturing stations pipeline.'}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={openNewItemDrawer}
                className="px-3.5 py-2 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Order to Pipeline
              </button>
              {pipeline.length === 0 && (
                <button
                  onClick={handleSeedSamples}
                  disabled={saving}
                  className="px-3.5 py-2 rounded-md bg-white border border-[#e2e8f0] text-neutral-700 text-xs font-medium hover:bg-neutral-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" /> : <Layers className="w-3.5 h-3.5 text-blue-600" />}
                  Load Sample Pipeline
                </button>
              )}
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
                            {/* Card Top Row */}
                            <div className="flex items-center justify-between mb-1.5">
                              <Link
                                href="/orders-services/custom-orders"
                                className="font-mono text-xs font-medium text-emerald-700 hover:underline flex items-center gap-1"
                              >
                                <span>{item.order_code}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </Link>
                              <div className="flex items-center gap-1">
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
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  disabled={deletingId === item.id}
                                  className="text-neutral-300 hover:text-red-500 p-0.5 rounded"
                                  title="Delete from tracking"
                                >
                                  {deletingId === item.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin text-red-500" />
                                  ) : (
                                    <Trash2 className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Customer & Item */}
                            <div className="font-medium text-xs text-neutral-800 line-clamp-1">
                              {item.ornament_name}
                            </div>
                            <div className="text-[11px] text-neutral-500 mb-2">
                              <span>{item.customer_name}</span> •{' '}
                              <span className="font-mono text-neutral-700 font-medium">
                                {Number(item.gross_weight_g).toFixed(3)}g ({item.metal_purity})
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

                            {/* Stage Notes */}
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
                                <Link
                                  href="/orders-services/delivery-management"
                                  className="text-[10px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1"
                                >
                                  <Truck className="w-3 h-3" /> Dispatch
                                </Link>
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
                      <th className="py-2.5 px-3 text-center whitespace-nowrap">Quick Transition / Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {filteredPipeline.map((item) => (
                      <tr key={item.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap font-mono">
                          <Link href="/orders-services/custom-orders" className="font-medium text-emerald-700 hover:underline">
                            {item.order_code}
                          </Link>
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap font-medium text-neutral-800">
                          {item.customer_name}
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb]">
                          <div className="font-medium text-neutral-800">{item.ornament_name}</div>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            {Number(item.gross_weight_g).toFixed(3)}g • {item.metal_purity}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">
                          <select
                            value={item.stage}
                            onChange={(e) => handleDirectStageChange(item.id, e.target.value as any)}
                            className="text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded px-1.5 py-0.5 focus:outline-none focus:border-blue-400"
                          >
                            {STAGES.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
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
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleAdvanceStage(item.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                            >
                              <span>Advance</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              disabled={deletingId === item.id}
                              className="p-1 hover:bg-red-50 rounded text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete tracking item"
                            >
                              {deletingId === item.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
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

      {/* Drawer: Add New Order to Tracking Pipeline */}
      {isNewItemOpen && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex justify-end z-50 animate-fadeIn">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#e2e8f0]">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-emerald-50 text-emerald-700">
                  <Kanban className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-neutral-900 uppercase tracking-wider">
                    Add Order to Pipeline
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Assign manufacturing station, lead artisan & SLA milestones
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewItemOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form id="new-tracking-form" onSubmit={handleCreateTrackingItem} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Order Code</label>
                  <input
                    type="text"
                    value={formOrderCode}
                    onChange={(e) => setFormOrderCode(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Customer Name</label>
                  <input
                    type="text"
                    value={formCustomerName}
                    onChange={(e) => setFormCustomerName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Ornament Name & Specs</label>
                <input
                  type="text"
                  value={formOrnamentName}
                  onChange={(e) => setFormOrnamentName(e.target.value)}
                  placeholder="e.g. Solitaire Engagement Ring 1.50ct"
                  required
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Metal Purity</label>
                  <select
                    value={formMetalPurity}
                    onChange={(e) => setFormMetalPurity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  >
                    <option value="22K 916">22K 916 Gold</option>
                    <option value="18K Diamond">18K 750 Gold</option>
                    <option value="14K Casting">14K 585 Gold</option>
                    <option value="Pt 950">Pt 950 Platinum</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Gross Weight (g)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formGrossWeight}
                    onChange={(e) => setFormGrossWeight(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Initial Station Stage</label>
                  <select
                    value={formStage}
                    onChange={(e) => setFormStage(e.target.value as ProductionStageId)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Priority Level</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  >
                    <option value="NORMAL">Normal Priority</option>
                    <option value="HIGH">High Priority</option>
                    <option value="CRITICAL_BRIDAL">Critical Bridal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Assigned Artisan</label>
                  <input
                    type="text"
                    value={formArtisan}
                    onChange={(e) => setFormArtisan(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Workshop Unit / Bench</label>
                  <input
                    type="text"
                    value={formWorkshopUnit}
                    onChange={(e) => setFormWorkshopUnit(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Promised Delivery Date</label>
                  <input
                    type="date"
                    value={formPromisedDate}
                    onChange={(e) => setFormPromisedDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">BIS HUID Code (If generated)</label>
                  <input
                    type="text"
                    placeholder="e.g. HUID-916-JK8821"
                    value={formHuid}
                    onChange={(e) => setFormHuid(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Station Instructions & Notes</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                />
              </div>
            </form>

            <div className="px-5 py-3 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNewItemOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="new-tracking-form"
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Add to Pipeline</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
