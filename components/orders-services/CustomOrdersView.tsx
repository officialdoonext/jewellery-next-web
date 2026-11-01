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
  Sparkles,
  Gem,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  X,
  Search,
  Filter,
  Eye,
  Send,
  UploadCloud,
  ChevronRight,
  ShieldCheck,
  Scale,
  DollarSign,
  Layers,
  Palette,
  Check,
  Smartphone,
  ExternalLink,
  Printer,
  Copy,
  Trash2,
  Loader2,
  ArrowRight,
  Receipt,
  Truck,
  Wrench,
  RefreshCw,
  User,
} from 'lucide-react';

export interface CustomJewelleryOrder {
  id: string;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  description: string;
  ornament_type: string;
  metal_type: string;
  karat: string;
  target_weight_g: number;
  expected_date: string;
  production_stage: '3D_CAD_APPROVED' | 'CASTING' | 'STONE_SETTING' | 'POLISHING' | 'QC_PASSED' | 'READY_FOR_DELIVERY' | 'DELIVERED';
  advance_deposit: number;
  estimated_total: number;
  gold_rate_policy: 'LOCKED' | 'FLOATING';
  locked_gold_rate: number;
  gemstone_specs: {
    setting_style: string;
    center_stone: string;
    accent_stones: string;
    diamond_count: number;
    diamond_weight_cts: number;
  };
  priority: 'STANDARD' | 'HIGH_PRIORITY_BRIDAL' | 'RUSH';
  cad_file_name: string;
  cad_approved_by_client: boolean;
  notes: string;
  created_at?: string;
  updated_at?: string;
}

const SAMPLE_ORDERS_SEED: Omit<CustomJewelleryOrder, 'id'>[] = [
  {
    order_code: 'BESPOKE-104',
    customer_name: 'Tanvi Agarwal',
    customer_phone: '+91 98201 44521',
    customer_email: 'tanvi.agarwal@example.com',
    description: 'Emerald cut cocktail ring with halo diamonds',
    ornament_type: 'Cocktail Ring',
    metal_type: 'Yellow Gold',
    karat: '18K Diamond',
    target_weight_g: 8.5,
    expected_date: '2026-11-15',
    production_stage: '3D_CAD_APPROVED',
    advance_deposit: 150000,
    estimated_total: 425000,
    gold_rate_policy: 'LOCKED',
    locked_gold_rate: 7850,
    gemstone_specs: {
      setting_style: 'Bezel Center with Micro-Pave Halo',
      center_stone: 'Natural Colombian Emerald 1.45ct',
      accent_stones: '48 Round Brilliant Diamonds VVS-EF',
      diamond_count: 48,
      diamond_weight_cts: 0.65,
    },
    priority: 'HIGH_PRIORITY_BRIDAL',
    cad_file_name: 'tanvi_ring_v3_final.step',
    cad_approved_by_client: true,
    notes: 'Client requested knife-edge band with inner laser engraving "T & R 2026"',
    created_at: '2026-10-25',
  },
  {
    order_code: 'BESPOKE-105',
    customer_name: 'Meera Nambiar',
    customer_phone: '+91 98402 78192',
    customer_email: 'meera.nambiar@domain.org',
    description: 'Antique Temple Lakshmi Haar with South Sea Pearls',
    ornament_type: 'Temple Necklace',
    metal_type: 'Yellow Gold',
    karat: '22K 916',
    target_weight_g: 64.2,
    expected_date: '2026-11-22',
    production_stage: 'CASTING',
    advance_deposit: 300000,
    estimated_total: 620000,
    gold_rate_policy: 'LOCKED',
    locked_gold_rate: 7820,
    gemstone_specs: {
      setting_style: 'Kundan Antique Jadau',
      center_stone: 'Uncut Polki Diamond Medallion',
      accent_stones: 'Burmese Ruby Cabochons & Basra Seed Pearls',
      diamond_count: 24,
      diamond_weight_cts: 2.1,
    },
    priority: 'HIGH_PRIORITY_BRIDAL',
    cad_file_name: 'meera_temple_haar_master.stl',
    cad_approved_by_client: true,
    notes: 'Intricate nakshi work depicting Lakshmi seated on lotus with dual peacocks.',
    created_at: '2026-10-26',
  },
  {
    order_code: 'BESPOKE-106',
    customer_name: 'Kavita Reddy',
    customer_phone: '+91 99081 22345',
    customer_email: 'kavita.reddy@hyderabad.in',
    description: 'Dual peacock bridal openable kada pair with rubies',
    ornament_type: 'Bridal Kada Pair',
    metal_type: 'Yellow Gold',
    karat: '22K 916',
    target_weight_g: 82.4,
    expected_date: '2026-11-28',
    production_stage: 'STONE_SETTING',
    advance_deposit: 400000,
    estimated_total: 785000,
    gold_rate_policy: 'FLOATING',
    locked_gold_rate: 7850,
    gemstone_specs: {
      setting_style: 'Prong and Channel Combined',
      center_stone: 'Twin Natural Pear Rubies (Eyes)',
      accent_stones: '120 Round Diamonds VS-GH Accents',
      diamond_count: 120,
      diamond_weight_cts: 3.4,
    },
    priority: 'HIGH_PRIORITY_BRIDAL',
    cad_file_name: 'reddy_peacock_kada_pair.obj',
    cad_approved_by_client: true,
    notes: 'Screw lock clasp mechanism with safety chain attachment requested.',
    created_at: '2026-10-27',
  },
  {
    order_code: 'BESPOKE-107',
    customer_name: 'Ananya Joshi',
    customer_phone: '+91 97654 31209',
    customer_email: 'ananya.joshi@pune.co',
    description: 'Platinum 950 Solitaire Engagement Band with Hidden Halo',
    ornament_type: 'Solitaire Ring',
    metal_type: 'Platinum',
    karat: 'Pt 950',
    target_weight_g: 5.6,
    expected_date: '2026-11-08',
    production_stage: 'READY_FOR_DELIVERY',
    advance_deposit: 250000,
    estimated_total: 510000,
    gold_rate_policy: 'LOCKED',
    locked_gold_rate: 3450,
    gemstone_specs: {
      setting_style: '4-Prong Comfort Fit with Hidden Halo',
      center_stone: 'GIA Certified 1.70ct Round Diamond D-VVS1',
      accent_stones: '16 Hidden Halo Micro-Diamonds',
      diamond_count: 17,
      diamond_weight_cts: 1.86,
    },
    priority: 'RUSH',
    cad_file_name: 'ananya_solitaire_ring_pt.step',
    cad_approved_by_client: true,
    notes: 'Express rush order for destination wedding in Udaipur on Nov 10.',
    created_at: '2026-10-28',
  },
];

export function OrdersCustomOrdersView() {
  const [orders, setOrders] = useState<CustomJewelleryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<CustomJewelleryOrder | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Form State
  const [formOrderCode, setFormOrderCode] = useState('');
  const [formCustomerName, setFormCustomerName] = useState('Tanvi Agarwal');
  const [formCustomerPhone, setFormCustomerPhone] = useState('+91 98201 44521');
  const [formCustomerEmail, setFormCustomerEmail] = useState('tanvi.agarwal@example.com');
  const [formOrnamentType, setFormOrnamentType] = useState('Cocktail Ring');
  const [formDescription, setFormDescription] = useState('Emerald cut cocktail ring with halo diamonds');
  const [formMetalType, setFormMetalType] = useState('Yellow Gold');
  const [formKarat, setFormKarat] = useState('18K Diamond');
  const [formGrossWeight, setFormGrossWeight] = useState('8.500');
  const [formExpectedDate, setFormExpectedDate] = useState('2026-11-25');
  const [formAdvanceDeposit, setFormAdvanceDeposit] = useState('150000');
  const [formEstimatedTotal, setFormEstimatedTotal] = useState('425000');
  const [formRatePolicy, setFormRatePolicy] = useState<'LOCKED' | 'FLOATING'>('LOCKED');
  const [formLockedRate, setFormLockedRate] = useState('7850');
  const [formSettingStyle, setFormSettingStyle] = useState('Prong & Bezel Halo');
  const [formCenterStone, setFormCenterStone] = useState('Natural Colombian Emerald 1.45ct');
  const [formAccentStones, setFormAccentStones] = useState('48 Round Brilliant Diamonds VVS-EF');
  const [formDiamondCount, setFormDiamondCount] = useState('48');
  const [formDiamondWeightCts, setFormDiamondWeightCts] = useState('0.65');
  const [formPriority, setFormPriority] = useState<'STANDARD' | 'HIGH_PRIORITY_BRIDAL' | 'RUSH'>('HIGH_PRIORITY_BRIDAL');
  const [formNotes, setFormNotes] = useState('Laser engraving requested on inner shank.');
  const [cadAttachedFileName, setCadAttachedFileName] = useState<string>('custom_cad_preview_v1.step');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'orders_custom'));
      const list: CustomJewelleryOrder[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<CustomJewelleryOrder, 'id'>) });
      });
      // Sort newest first
      list.sort((a, b) => (b.order_code > a.order_code ? 1 : -1));
      setOrders(list);
    } catch (err: any) {
      console.error('Error fetching custom orders:', err);
      showToast('error', err.message || 'Failed to fetch custom orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update auto-generated code when modal opens
  const openNewOrderDrawer = () => {
    const nextCode = `BESPOKE-${100 + orders.length + 1}`;
    setFormOrderCode(nextCode);
    setIsNewOrderOpen(true);
  };

  // Seed sample records
  const handleSeedSamples = async () => {
    try {
      setSaving(true);
      const added: CustomJewelleryOrder[] = [];
      for (const item of SAMPLE_ORDERS_SEED) {
        const docRef = await addDoc(collection(db, 'orders_custom'), item);
        added.push({ id: docRef.id, ...item });
      }
      setOrders((prev) => [...added, ...prev]);
      showToast('success', `${added.length} sample bespoke orders loaded into Firestore.`);
    } catch (err: any) {
      console.error('Error seeding orders:', err);
      showToast('error', err.message || 'Failed to seed sample orders');
    } finally {
      setSaving(false);
    }
  };

  // Create new bespoke order in Firestore
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const newOrderData: Omit<CustomJewelleryOrder, 'id'> = {
        order_code: formOrderCode || `BESPOKE-${Date.now().toString().slice(-4)}`,
        customer_name: formCustomerName,
        customer_phone: formCustomerPhone,
        customer_email: formCustomerEmail,
        description: formDescription,
        ornament_type: formOrnamentType,
        metal_type: formMetalType,
        karat: formKarat,
        target_weight_g: parseFloat(formGrossWeight) || 10.0,
        expected_date: formExpectedDate,
        production_stage: '3D_CAD_APPROVED',
        advance_deposit: parseFloat(formAdvanceDeposit) || 0,
        estimated_total: parseFloat(formEstimatedTotal) || 0,
        gold_rate_policy: formRatePolicy,
        locked_gold_rate: parseFloat(formLockedRate) || 7850,
        gemstone_specs: {
          setting_style: formSettingStyle,
          center_stone: formCenterStone,
          accent_stones: formAccentStones,
          diamond_count: parseInt(formDiamondCount) || 0,
          diamond_weight_cts: parseFloat(formDiamondWeightCts) || 0,
        },
        priority: formPriority,
        cad_file_name: cadAttachedFileName,
        cad_approved_by_client: true,
        notes: formNotes,
        created_at: new Date().toISOString().slice(0, 10),
      };

      const docRef = await addDoc(collection(db, 'orders_custom'), newOrderData);
      setOrders([{ id: docRef.id, ...newOrderData }, ...orders]);
      setIsNewOrderOpen(false);
      showToast('success', `Bespoke Order ${newOrderData.order_code} created successfully.`);
    } catch (err: any) {
      console.error('Error creating order:', err);
      showToast('error', err.message || 'Failed to create order');
    } finally {
      setSaving(false);
    }
  };

  // Update production stage in Firestore
  const handleUpdateStage = async (orderId: string, newStage: CustomJewelleryOrder['production_stage']) => {
    try {
      await updateDoc(doc(db, 'orders_custom', orderId), {
        production_stage: newStage,
        updated_at: new Date().toISOString(),
      });
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, production_stage: newStage } : ord))
      );
      if (selectedOrderForDetail && selectedOrderForDetail.id === orderId) {
        setSelectedOrderForDetail((prev) => (prev ? { ...prev, production_stage: newStage } : null));
      }
      showToast('success', `Order stage updated to ${newStage.replace(/_/g, ' ')}`);
    } catch (err: any) {
      console.error('Error updating stage:', err);
      showToast('error', err.message || 'Failed to update order stage');
    }
  };

  // Delete order from Firestore
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to permanently delete this bespoke order?')) return;
    try {
      setDeletingId(orderId);
      await deleteDoc(doc(db, 'orders_custom', orderId));
      setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
      if (selectedOrderForDetail?.id === orderId) {
        setSelectedOrderForDetail(null);
      }
      showToast('success', 'Custom order removed successfully.');
    } catch (err: any) {
      console.error('Error deleting order:', err);
      showToast('error', err.message || 'Failed to delete custom order');
    } finally {
      setDeletingId(null);
    }
  };

  // Purity conversion calculations
  const purityFactor = useMemo(() => {
    if (formKarat.includes('22K')) return 0.916;
    if (formKarat.includes('18K')) return 0.75;
    if (formKarat.includes('14K')) return 0.585;
    if (formKarat.includes('Pt')) return 0.95;
    return 1.0;
  }, [formKarat]);

  const targetWeightNum = parseFloat(formGrossWeight) || 0;
  const lockedRateNum = parseFloat(formLockedRate) || 0;
  const advanceDepositNum = parseFloat(formAdvanceDeposit) || 0;
  const estimatedTotalNum = parseFloat(formEstimatedTotal) || 0;

  const estimatedMetalCost = targetWeightNum * lockedRateNum;
  const balanceRemaining = Math.max(0, estimatedTotalNum - advanceDepositNum);
  const pureMetalEquiv = (targetWeightNum * purityFactor).toFixed(3);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchesSearch =
        (ord.order_code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ord.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ord.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ord.ornament_type || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage = stageFilter === 'ALL' || ord.production_stage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [orders, searchQuery, stageFilter]);

  // Aggregate metrics
  const activeOrdersCount = orders.filter((o) => o.production_stage !== 'DELIVERED').length;
  const totalBespokeValue = orders.reduce((acc, o) => acc + (o.estimated_total || 0), 0);
  const totalAdvanceReceived = orders.reduce((acc, o) => acc + (o.advance_deposit || 0), 0);
  const readyOrdersCount = orders.filter((o) => o.production_stage === 'READY_FOR_DELIVERY').length;

  const getStageBadge = (stage: CustomJewelleryOrder['production_stage']) => {
    switch (stage) {
      case '3D_CAD_APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Layers className="w-3 h-3 text-blue-600" /> CAD Approved
          </span>
        );
      case 'CASTING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Casting & Tree
          </span>
        );
      case 'STONE_SETTING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
            <Gem className="w-3 h-3 text-purple-600" /> Stone Setting
          </span>
        );
      case 'POLISHING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Sparkles className="w-3 h-3 text-amber-600" /> Polishing & Buffing
          </span>
        );
      case 'QC_PASSED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-200">
            <ShieldCheck className="w-3 h-3 text-teal-600" /> QC Passed
          </span>
        );
      case 'READY_FOR_DELIVERY':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Ready for Delivery
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
            <Check className="w-3 h-3 text-neutral-500" /> Delivered
          </span>
        );
      default:
        return <span className="text-neutral-500">{stage}</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="custom_jewellery_orders" />
      <ActionToolbar
        filterPlaceholder="Filter bespoke orders by patron, order code, ornament..."
        insertLabel="New Bespoke Order"
        onInsertClick={openNewOrderDrawer}
      />

      {/* Interlinked Module Navigation Header */}
      <div className="bg-white border-b border-[#e2e8f0] px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar text-xs">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mr-1">Workflow:</span>
          <Link
            href="/orders-services/custom-orders"
            className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-200 flex items-center gap-1.5 whitespace-nowrap"
          >
            <Sparkles className="w-3 h-3 text-emerald-600" /> Custom Orders
          </Link>
          <Link
            href="/orders-services/tracking"
            className="px-2.5 py-1 rounded hover:bg-neutral-100 text-neutral-600 font-medium border border-[#e2e8f0] flex items-center gap-1.5 whitespace-nowrap"
          >
            <Layers className="w-3 h-3 text-neutral-500" /> Production Pipeline
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
            onClick={fetchOrders}
            disabled={loading}
            className="p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
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
                <AlertCircle className="w-4 h-4 text-red-600" />
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
                Active Bespoke Orders
              </span>
              <span className="p-1 rounded bg-blue-50 text-blue-600">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-neutral-800 font-mono">
              {activeOrdersCount} Bespoke
            </div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-medium">{orders.length} total</span> in database
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Total Order Value
              </span>
              <span className="p-1 rounded bg-emerald-50 text-emerald-600">
                <DollarSign className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-neutral-800 font-mono">
              ₹ {(totalBespokeValue / 100000).toFixed(2)} Lakhs
            </div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              <span className="text-neutral-700 font-medium">
                ₹ {(totalAdvanceReceived / 100000).toFixed(2)} L
              </span>{' '}
              advance deposited
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Ready for Final POS Billing
              </span>
              <span className="p-1 rounded bg-emerald-50 text-emerald-600">
                <Receipt className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-emerald-700 font-mono">
              {readyOrdersCount} Finished
            </div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              <Link href="/sales/billing-pos" className="text-emerald-700 hover:underline flex items-center gap-0.5">
                Convert to Tax Invoice <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Patron Directory Link
              </span>
              <span className="p-1 rounded bg-purple-50 text-purple-600">
                <User className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-neutral-800 font-mono">
              CRM Sync
            </div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              <Link href="/customers/list" className="text-emerald-700 hover:underline flex items-center gap-0.5">
                Manage Customers & KYC <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Controls & Stage Filters */}
        <div className="px-4 pb-2 flex flex-wrap items-center justify-between gap-2 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('data')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'data'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-[#e2e8f0]'
              }`}
            >
              Data View ({filteredOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('definition')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'definition'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-[#e2e8f0]'
              }`}
            >
              Schema Definition (DDL)
            </button>
          </div>

          {activeTab === 'data' && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter bespoke orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 rounded text-xs border border-[#e2e8f0] bg-white focus:outline-none focus:border-emerald-500 w-44"
                />
              </div>

              <span className="text-[11px] font-medium text-neutral-500">Stage:</span>
              {['ALL', '3D_CAD_APPROVED', 'CASTING', 'STONE_SETTING', 'POLISHING', 'QC_PASSED', 'READY_FOR_DELIVERY', 'DELIVERED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStageFilter(st)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    stageFilter === st
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white text-neutral-600 border border-[#e2e8f0] hover:bg-neutral-50'
                  }`}
                >
                  {st === 'ALL'
                    ? 'All Stages'
                    : st === '3D_CAD_APPROVED'
                    ? 'CAD Approved'
                    : st === 'QC_PASSED'
                    ? 'QC Passed'
                    : st === 'READY_FOR_DELIVERY'
                    ? 'Ready'
                    : st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Mode: Data Table */}
        {activeTab === 'data' ? (
          <div className="flex-1 p-4">
            {loading ? (
              <div className="bg-white border border-[#e2e8f0] rounded-lg p-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
                <h3 className="text-sm font-medium text-neutral-800">Loading Bespoke Orders...</h3>
                <p className="text-xs text-neutral-500 mt-1">Connecting to Firestore collection &apos;orders_custom&apos;</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white border border-[#e2e8f0] rounded-lg p-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-neutral-800">No Custom Orders Found</h3>
                <p className="text-xs text-neutral-500 max-w-md mt-1 mb-4">
                  {searchQuery || stageFilter !== 'ALL'
                    ? 'No orders matched your search or stage filters.'
                    : 'There are currently no custom jewellery orders recorded in the live database.'}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={openNewOrderDrawer}
                    className="px-3.5 py-2 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create Custom Order
                  </button>
                  {orders.length === 0 && (
                    <button
                      onClick={handleSeedSamples}
                      disabled={saving}
                      className="px-3.5 py-2 rounded-md bg-white border border-[#e2e8f0] text-neutral-700 text-xs font-medium hover:bg-neutral-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" /> : <Layers className="w-3.5 h-3.5 text-blue-600" />}
                      Load Sample Orders
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-neutral-500 font-medium">
                        <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Order Code</th>
                        <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Patron Name</th>
                        <th className="py-2.5 px-3 border-r border-[#e5e7eb]">Bespoke Ornament & Karat</th>
                        <th className="py-2.5 px-3 border-r border-[#e5e7eb] text-right whitespace-nowrap">Target Wt (g)</th>
                        <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Due Date</th>
                        <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Production Stage</th>
                        <th className="py-2.5 px-3 border-r border-[#e5e7eb] text-right whitespace-nowrap">Advance / Total</th>
                        <th className="py-2.5 px-3 border-r border-[#e5e7eb] text-center whitespace-nowrap">Rate Policy</th>
                        <th className="py-2.5 px-3 text-center whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#f8fafc] transition-colors">
                          <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap font-mono">
                            <div className="font-medium text-emerald-700 flex items-center gap-1">
                              <span>{ord.order_code}</span>
                              {ord.priority === 'HIGH_PRIORITY_BRIDAL' && (
                                <span className="text-[9px] bg-red-50 text-red-600 px-1 py-0.2 rounded border border-red-200">
                                  Bridal
                                </span>
                              )}
                              {ord.priority === 'RUSH' && (
                                <span className="text-[9px] bg-amber-50 text-amber-700 px-1 py-0.2 rounded border border-amber-200">
                                  Rush
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-neutral-400 block">{ord.cad_file_name}</span>
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-neutral-800">{ord.customer_name}</span>
                              <Link
                                href="/customers/list"
                                title="Inspect patron profile in CRM"
                                className="text-neutral-400 hover:text-emerald-700"
                              >
                                <ExternalLink className="w-2.5 h-2.5" />
                              </Link>
                            </div>
                            <div className="text-[10px] text-neutral-400 font-mono">{ord.customer_phone}</div>
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#e5e7eb]">
                            <div className="font-medium text-neutral-800 line-clamp-1">{ord.description}</div>
                            <div className="text-[10px] text-neutral-500 flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                {ord.karat}
                              </span>
                              <span>{ord.gemstone_specs?.center_stone}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#e5e7eb] text-right font-mono font-medium text-neutral-800 whitespace-nowrap">
                            {Number(ord.target_weight_g).toFixed(3)} g
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-neutral-700">
                            {ord.expected_date}
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {getStageBadge(ord.production_stage)}
                              <select
                                value={ord.production_stage}
                                onChange={(e) => handleUpdateStage(ord.id, e.target.value as any)}
                                className="text-[10px] bg-white border border-[#e2e8f0] rounded px-1 py-0.5 text-neutral-600 focus:outline-none focus:border-emerald-500 cursor-pointer"
                                title="Fast update stage"
                              >
                                <option value="3D_CAD_APPROVED">CAD Approved</option>
                                <option value="CASTING">Casting</option>
                                <option value="STONE_SETTING">Setting</option>
                                <option value="POLISHING">Polishing</option>
                                <option value="QC_PASSED">QC Passed</option>
                                <option value="READY_FOR_DELIVERY">Ready</option>
                                <option value="DELIVERED">Delivered</option>
                              </select>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#e5e7eb] text-right font-mono whitespace-nowrap">
                            <div className="font-medium text-emerald-700">
                              ₹ {Number(ord.advance_deposit || 0).toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-neutral-400">
                              / ₹ {Number(ord.estimated_total || 0).toLocaleString('en-IN')}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#e5e7eb] text-center whitespace-nowrap">
                            {ord.gold_rate_policy === 'LOCKED' ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Locked @ ₹{ord.locked_gold_rate}
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                                Floating Rate
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setSelectedOrderForDetail(ord)}
                                className="p-1 hover:bg-neutral-100 rounded text-neutral-600 hover:text-emerald-700 transition-colors cursor-pointer"
                                title="Inspect 3D CAD & Specs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {ord.production_stage === 'READY_FOR_DELIVERY' && (
                                <Link
                                  href={`/sales/billing-pos?custom_order=${ord.order_code}`}
                                  className="p-1 hover:bg-emerald-50 rounded text-emerald-600 hover:text-emerald-800 transition-colors"
                                  title="Convert to Final POS Invoice"
                                >
                                  <Receipt className="w-3.5 h-3.5" />
                                </Link>
                              )}
                              <button
                                onClick={() => handleDeleteOrder(ord.id)}
                                disabled={deletingId === ord.id}
                                className="p-1 hover:bg-red-50 rounded text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                                title="Delete order"
                              >
                                {deletingId === ord.id ? (
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
            )}
          </div>
        ) : (
          /* Schema Definition Tab */
          <div className="p-4 flex-1">
            <div className="bg-[#1e1e1e] text-neutral-200 p-4 rounded-lg font-mono text-xs leading-relaxed overflow-x-auto shadow-inner">
              <span className="text-emerald-400">CREATE TABLE</span> public.custom_jewellery_orders (
              <br />
              &nbsp;&nbsp;id <span className="text-blue-400">UUID</span> PRIMARY KEY DEFAULT gen_random_uuid(),
              <br />
              &nbsp;&nbsp;order_code <span className="text-blue-400">VARCHAR(50)</span> UNIQUE NOT NULL,
              <br />
              &nbsp;&nbsp;customer_name <span className="text-blue-400">VARCHAR(150)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;customer_phone <span className="text-blue-400">VARCHAR(25)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;customer_email <span className="text-blue-400">VARCHAR(100)</span>,
              <br />
              &nbsp;&nbsp;description <span className="text-blue-400">TEXT</span> NOT NULL,
              <br />
              &nbsp;&nbsp;ornament_type <span className="text-blue-400">VARCHAR(100)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;metal_type <span className="text-blue-400">VARCHAR(50)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;karat <span className="text-blue-400">VARCHAR(30)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;target_weight_g <span className="text-blue-400">NUMERIC(10,3)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;expected_date <span className="text-blue-400">DATE</span> NOT NULL,
              <br />
              &nbsp;&nbsp;production_stage <span className="text-blue-400">VARCHAR(50)</span> NOT NULL DEFAULT &apos;3D_CAD_APPROVED&apos;,
              <br />
              &nbsp;&nbsp;advance_deposit <span className="text-blue-400">NUMERIC(12,2)</span> DEFAULT 0.00,
              <br />
              &nbsp;&nbsp;estimated_total <span className="text-blue-400">NUMERIC(12,2)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;gold_rate_policy <span className="text-blue-400">VARCHAR(20)</span> DEFAULT &apos;LOCKED&apos;,
              <br />
              &nbsp;&nbsp;locked_gold_rate <span className="text-blue-400">NUMERIC(10,2)</span>,
              <br />
              &nbsp;&nbsp;gemstone_specs <span className="text-blue-400">JSONB</span>,
              <br />
              &nbsp;&nbsp;cad_file_path <span className="text-blue-400">VARCHAR(255)</span>,
              <br />
              &nbsp;&nbsp;cad_approved_by_client <span className="text-blue-400">BOOLEAN</span> DEFAULT TRUE,
              <br />
              &nbsp;&nbsp;priority <span className="text-blue-400">VARCHAR(30)</span> DEFAULT &apos;STANDARD&apos;,
              <br />
              &nbsp;&nbsp;created_at <span className="text-blue-400">TIMESTAMPTZ</span> DEFAULT now(),
              <br />
              &nbsp;&nbsp;updated_at <span className="text-blue-400">TIMESTAMPTZ</span> DEFAULT now()
              <br />
              );
              <br />
              <br />
              <span className="text-neutral-500">-- Automated milestone notification trigger</span>
              <br />
              <span className="text-emerald-400">CREATE INDEX</span> idx_custom_orders_stage ON public.custom_jewellery_orders(production_stage);
            </div>
          </div>
        )}
      </div>

      {/* Bespoke Detail Modal (CAD Preview & Specifications) */}
      {selectedOrderForDetail && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl border border-[#e2e8f0] w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-emerald-50 text-emerald-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-medium text-emerald-700">
                      {selectedOrderForDetail.order_code}
                    </span>
                    <span className="text-neutral-300">|</span>
                    <span className="text-xs font-medium text-neutral-800">
                      {selectedOrderForDetail.ornament_type}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Patron: {selectedOrderForDetail.customer_name} ({selectedOrderForDetail.customer_phone})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderForDetail(null)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* 3D CAD Mockup Visualizer Card */}
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" /> 3D CAD Render & Geometry
                  </span>
                  <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" /> Client Signed-Off
                  </span>
                </div>

                {/* Simulated 3D CAD Viewport */}
                <div className="relative h-44 bg-neutral-900 rounded-md border border-neutral-800 flex flex-col items-center justify-center overflow-hidden group">
                  <div className="absolute inset-0 bg-radial from-neutral-800 to-neutral-950 opacity-90" />
                  <div className="relative z-10 flex flex-col items-center text-center p-4">
                    <div className="w-16 h-16 rounded-full border border-emerald-500/40 flex items-center justify-center bg-emerald-500/10 mb-2">
                      <Gem className="w-8 h-8 text-emerald-400 animate-pulse" />
                    </div>
                    <span className="text-xs font-mono text-neutral-300">
                      {selectedOrderForDetail.cad_file_name}
                    </span>
                    <span className="text-[10px] text-neutral-500 mt-0.5">
                      Target Weight: {Number(selectedOrderForDetail.target_weight_g).toFixed(3)}g | Karat: {selectedOrderForDetail.karat}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-neutral-400 z-10">
                    <span className="bg-neutral-800/80 px-2 py-0.5 rounded border border-neutral-700">
                      Viewport: Isometric Wireframe
                    </span>
                    <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                      Rhino/Matrix 3D v9
                    </span>
                  </div>
                </div>
              </div>

              {/* Gemstone Specifications Sheet */}
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Gem className="w-3.5 h-3.5 text-amber-600" /> Gemstone & Setting Specifications
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-neutral-500 block text-[11px]">Setting Style</span>
                    <span className="font-medium text-neutral-800">
                      {selectedOrderForDetail.gemstone_specs?.setting_style || 'Standard Prong'}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[11px]">Center Gemstone</span>
                    <span className="font-medium text-emerald-800">
                      {selectedOrderForDetail.gemstone_specs?.center_stone || 'None'}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[11px]">Accent Stones</span>
                    <span className="font-medium text-neutral-800">
                      {selectedOrderForDetail.gemstone_specs?.accent_stones || 'None'}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[11px]">Diamond Weight & Count</span>
                    <span className="font-medium text-neutral-800 font-mono">
                      {selectedOrderForDetail.gemstone_specs?.diamond_weight_cts || 0} cts (
                      {selectedOrderForDetail.gemstone_specs?.diamond_count || 0} stones)
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial & Gold Rate Agreement */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-md bg-white border border-[#e2e8f0] text-xs">
                  <span className="text-[11px] text-neutral-500 block mb-1">Financial Status</span>
                  <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                    <span className="text-neutral-600">Advance Received:</span>
                    <span className="font-mono font-medium text-emerald-700">
                      ₹ {Number(selectedOrderForDetail.advance_deposit).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                    <span className="text-neutral-600">Total Estimate:</span>
                    <span className="font-mono font-medium text-neutral-800">
                      ₹ {Number(selectedOrderForDetail.estimated_total).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 pt-1.5 text-neutral-600">
                    <span>Balance on Delivery:</span>
                    <span className="font-mono font-medium text-amber-700">
                      ₹ {(Number(selectedOrderForDetail.estimated_total) - Number(selectedOrderForDetail.advance_deposit)).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-md bg-white border border-[#e2e8f0] text-xs">
                  <span className="text-[11px] text-neutral-500 block mb-1">Production Stage & Notes</span>
                  <div className="mb-2 flex items-center justify-between">
                    <div>{getStageBadge(selectedOrderForDetail.production_stage)}</div>
                    <select
                      value={selectedOrderForDetail.production_stage}
                      onChange={(e) => handleUpdateStage(selectedOrderForDetail.id, e.target.value as any)}
                      className="text-[11px] border border-[#e2e8f0] rounded px-2 py-0.5 bg-white text-neutral-700 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="3D_CAD_APPROVED">CAD Approved</option>
                      <option value="CASTING">Casting</option>
                      <option value="STONE_SETTING">Setting</option>
                      <option value="POLISHING">Polishing</option>
                      <option value="QC_PASSED">QC Passed</option>
                      <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
                      <option value="DELIVERED">Delivered</option>
                    </select>
                  </div>
                  <p className="text-[11px] text-neutral-600 italic">
                    &ldquo;{selectedOrderForDetail.notes || 'No special notes provided'}&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions with Quick Interlinks */}
            <div className="px-5 py-3 border-t border-[#e2e8f0] bg-[#f8fafc] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Link
                  href={`/sales/billing-pos?custom_order=${selectedOrderForDetail.order_code}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Generate Final Invoice</span>
                </Link>
                <Link
                  href="/orders-services/tracking"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>Track in Pipeline</span>
                </Link>
              </div>
              <button
                onClick={() => setSelectedOrderForDetail(null)}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer Modal: Create New Bespoke Order */}
      {isNewOrderOpen && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex justify-end z-50 animate-fadeIn">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#e2e8f0]">
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-emerald-50 text-emerald-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-neutral-900 uppercase tracking-wider">
                    Create New Bespoke Order
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Bespoke jewellery CAD model, gemstone specs & advance deposit
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewOrderOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Form Body */}
            <form id="new-bespoke-form" onSubmit={handleCreateOrder} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {/* Order Code & Customer Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Order Code</label>
                  <input
                    type="text"
                    value={formOrderCode}
                    onChange={(e) => setFormOrderCode(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 placeholder:text-neutral-400 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Patron Name</label>
                  <input
                    type="text"
                    value={formCustomerName}
                    onChange={(e) => setFormCustomerName(e.target.value)}
                    required
                    placeholder="Enter customer name"
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  />
                </div>
              </div>

              {/* Customer Phone & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Phone Number</label>
                  <input
                    type="text"
                    value={formCustomerPhone}
                    onChange={(e) => setFormCustomerPhone(e.target.value)}
                    required
                    placeholder="+91 98..."
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Email (Optional)</label>
                  <input
                    type="email"
                    value={formCustomerEmail}
                    onChange={(e) => setFormCustomerEmail(e.target.value)}
                    placeholder="patron@domain.com"
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  />
                </div>
              </div>

              {/* Ornament Description & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Ornament Type</label>
                  <input
                    type="text"
                    value={formOrnamentType}
                    onChange={(e) => setFormOrnamentType(e.target.value)}
                    placeholder="e.g. Cocktail Ring, Temple Haar, Kada Pair"
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={formExpectedDate}
                    onChange={(e) => setFormExpectedDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Design Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  required
                  placeholder="Detail bespoke geometry, motifs, enamel work..."
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                />
              </div>

              {/* Metal, Karat & Weight */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Metal</label>
                  <select
                    value={formMetalType}
                    onChange={(e) => setFormMetalType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  >
                    <option value="Yellow Gold">Yellow Gold</option>
                    <option value="Rose Gold">Rose Gold</option>
                    <option value="White Gold">White Gold</option>
                    <option value="Platinum">Platinum 950</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Karat / Standard</label>
                  <select
                    value={formKarat}
                    onChange={(e) => setFormKarat(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  >
                    <option value="22K 916">22K 916 Gold</option>
                    <option value="18K Diamond">18K 750 Gold</option>
                    <option value="14K Casting">14K 585 Gold</option>
                    <option value="Pt 950">Pt 950 Platinum</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Target Wt (g)</label>
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

              {/* Dynamic Purity Equivalent Helper */}
              <div className="bg-[#f0fdf4] border border-emerald-200 rounded-md p-2.5 text-xs text-emerald-800 flex items-center justify-between">
                <span>Pure 24K Metal Content Equivalent:</span>
                <span className="font-mono font-medium text-emerald-900">{pureMetalEquiv} g pure</span>
              </div>

              {/* Gemstone Setting Specifications */}
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Gem className="w-3.5 h-3.5 text-emerald-600" /> Gemstone & Setting Specs
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Setting Style</label>
                  <input
                    type="text"
                    value={formSettingStyle}
                    onChange={(e) => setFormSettingStyle(e.target.value)}
                    placeholder="e.g. Prong, Micro-Pave, Bezel, Kundan Jadau"
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Center Stone</label>
                    <input
                      type="text"
                      value={formCenterStone}
                      onChange={(e) => setFormCenterStone(e.target.value)}
                      placeholder="e.g. 1.20ct Natural Emerald"
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Accent Diamonds / Pearls</label>
                    <input
                      type="text"
                      value={formAccentStones}
                      onChange={(e) => setFormAccentStones(e.target.value)}
                      placeholder="e.g. 48 Round VVS-EF"
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Diamond Stone Count</label>
                    <input
                      type="number"
                      value={formDiamondCount}
                      onChange={(e) => setFormDiamondCount(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Total Diamond Weight (Cts)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formDiamondWeightCts}
                      onChange={(e) => setFormDiamondWeightCts(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Financials & Gold Rate Policy */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Gold Rate Policy</label>
                  <select
                    value={formRatePolicy}
                    onChange={(e) => setFormRatePolicy(e.target.value as 'LOCKED' | 'FLOATING')}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  >
                    <option value="LOCKED">Rate Locked Today</option>
                    <option value="FLOATING">Floating (Delivery Day Rate)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Locked Rate (₹/g)</label>
                  <input
                    type="number"
                    value={formLockedRate}
                    onChange={(e) => setFormLockedRate(e.target.value)}
                    disabled={formRatePolicy === 'FLOATING'}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white disabled:bg-neutral-100 focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Advance Deposit Received (₹)</label>
                  <input
                    type="number"
                    value={formAdvanceDeposit}
                    onChange={(e) => setFormAdvanceDeposit(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Estimated Total Order Value (₹)</label>
                  <input
                    type="number"
                    value={formEstimatedTotal}
                    onChange={(e) => setFormEstimatedTotal(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
              </div>

              {/* Dynamic Financial Calculation Summary */}
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-md p-3 text-xs space-y-1">
                <div className="flex justify-between text-neutral-500">
                  <span>Estimated Metal Cost ({targetWeightNum}g × ₹{lockedRateNum}):</span>
                  <span className="font-mono text-neutral-700">₹ {estimatedMetalCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Advance Received:</span>
                  <span className="font-mono text-emerald-700">₹ {advanceDepositNum.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-medium text-neutral-800 pt-1 border-t border-[#e2e8f0]">
                  <span>Balance Due on Delivery:</span>
                  <span className="font-mono text-amber-700">₹ {balanceRemaining.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Priority Level */}
              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Priority Level</label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                >
                  <option value="STANDARD">Standard (15-20 Days)</option>
                  <option value="HIGH_PRIORITY_BRIDAL">High Priority Bridal</option>
                  <option value="RUSH">Express Rush (&lt; 7 Days)</option>
                </select>
              </div>

              {/* CAD 3D File Attachment Dropzone */}
              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">CAD 3D Model Attachment</label>
                <div className="border border-dashed border-[#cbd5e1] hover:border-emerald-500 bg-[#f8fafc] rounded-md p-3 text-center cursor-pointer transition-colors">
                  <UploadCloud className="w-5 h-5 text-neutral-400 mx-auto mb-1" />
                  <span className="text-xs font-medium text-neutral-700 block">
                    Upload .STEP, .STL, .3DM, or .OBJ file
                  </span>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">
                    Attached: <span className="font-mono text-emerald-600">{cadAttachedFileName}</span>
                  </span>
                </div>
              </div>

              {/* Special Workshop Instructions */}
              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Special Workshop Notes</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Engravings, hallmarking instructions, fitting specifications..."
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                />
              </div>
            </form>

            {/* Drawer Footer Actions */}
            <div className="px-5 py-3 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNewOrderOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="new-bespoke-form"
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Save Bespoke Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
