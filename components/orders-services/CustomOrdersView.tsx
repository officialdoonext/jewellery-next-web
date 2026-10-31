'use client';

import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';

interface CustomJewelleryOrder {
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
  production_stage: '3D_CAD_APPROVED' | 'CASTING' | 'STONE_SETTING' | 'POLISHING' | 'READY_FOR_DELIVERY';
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
}

const INITIAL_CUSTOM_ORDERS: CustomJewelleryOrder[] = [
  {
    id: '11223344-e5f6-a1b2-c3d4-445566778899',
    order_code: 'BESPOKE-104',
    customer_name: 'Tanvi Agarwal',
    customer_phone: '+91 98201 44521',
    customer_email: 'tanvi.agarwal@example.com',
    description: 'Emerald cut cocktail ring with halo diamonds',
    ornament_type: 'Cocktail Ring',
    metal_type: 'Yellow Gold',
    karat: '18K Diamond',
    target_weight_g: 8.500,
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
  },
  {
    id: '22334455-f6a1-b2c3-d4e5-556677889900',
    order_code: 'BESPOKE-105',
    customer_name: 'Meera Nambiar',
    customer_phone: '+91 98402 78192',
    customer_email: 'meera.nambiar@domain.org',
    description: 'Antique Temple Lakshmi Haar with South Sea Pearls',
    ornament_type: 'Temple Necklace',
    metal_type: 'Yellow Gold',
    karat: '22K 916',
    target_weight_g: 64.200,
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
      diamond_weight_cts: 2.10,
    },
    priority: 'HIGH_PRIORITY_BRIDAL',
    cad_file_name: 'meera_temple_haar_master.stl',
    cad_approved_by_client: true,
    notes: 'Intricate nakshi work depicting Lakshmi seated on lotus with dual peacocks.',
  },
  {
    id: '33445566-a1b2-c3d4-e5f6-667788990011',
    order_code: 'BESPOKE-106',
    customer_name: 'Kavita Reddy',
    customer_phone: '+91 99081 22345',
    customer_email: 'kavita.reddy@hyderabad.in',
    description: 'Dual peacock bridal openable kada pair with rubies',
    ornament_type: 'Bridal Kada Pair',
    metal_type: 'Yellow Gold',
    karat: '22K 916',
    target_weight_g: 82.400,
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
      diamond_weight_cts: 3.40,
    },
    priority: 'HIGH_PRIORITY_BRIDAL',
    cad_file_name: 'reddy_peacock_kada_pair.obj',
    cad_approved_by_client: true,
    notes: 'Screw lock clasp mechanism with safety chain attachment requested.',
  },
  {
    id: '44556677-b2c3-d4e5-f6a1-778899001122',
    order_code: 'BESPOKE-107',
    customer_name: 'Ananya Joshi',
    customer_phone: '+91 97654 31209',
    customer_email: 'ananya.joshi@pune.co',
    description: 'Platinum 950 Solitaire Engagement Band with Hidden Halo',
    ornament_type: 'Solitaire Ring',
    metal_type: 'Platinum',
    karat: 'Pt 950',
    target_weight_g: 5.600,
    expected_date: '2026-11-08',
    production_stage: 'POLISHING',
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
  },
  {
    id: '55667788-c3d4-e5f6-a1b2-889900112233',
    order_code: 'BESPOKE-108',
    customer_name: 'Priya Sharma',
    customer_phone: '+91 98110 99882',
    customer_email: 'priya.sharma@delhi.org',
    description: 'Choker with Russian emerald beads and rose cut diamonds',
    ornament_type: 'Choker Necklace',
    metal_type: 'Rose Gold',
    karat: '18K Diamond',
    target_weight_g: 45.100,
    expected_date: '2026-12-05',
    production_stage: 'READY_FOR_DELIVERY',
    advance_deposit: 500000,
    estimated_total: 980000,
    gold_rate_policy: 'LOCKED',
    locked_gold_rate: 7850,
    gemstone_specs: {
      setting_style: 'Collet and Prong Hybrid',
      center_stone: 'Tumbled Colombian Emerald Beads (120 cts)',
      accent_stones: '64 Rose Cut Diamonds VS',
      diamond_count: 64,
      diamond_weight_cts: 4.80,
    },
    priority: 'STANDARD',
    cad_file_name: 'sharma_emerald_choker.step',
    cad_approved_by_client: true,
    notes: 'Final quality inspection and BIS Hallmarking complete. Velvet box prepared.',
  },
];

const CUSTOMER_OPTIONS = [
  { name: 'Tanvi Agarwal', phone: '+91 98201 44521', email: 'tanvi.agarwal@example.com' },
  { name: 'Meera Nambiar', phone: '+91 98402 78192', email: 'meera.nambiar@domain.org' },
  { name: 'Kavita Reddy', phone: '+91 99081 22345', email: 'kavita.reddy@hyderabad.in' },
  { name: 'Ananya Joshi', phone: '+91 97654 31209', email: 'ananya.joshi@pune.co' },
  { name: 'Priya Sharma', phone: '+91 98110 99882', email: 'priya.sharma@delhi.org' },
  { name: 'Dr. Sunita Rao', phone: '+91 94480 11234', email: 'sunita.rao@clinic.in' },
  { name: 'Bhavna Parekh', phone: '+91 98212 90811', email: 'bhavna.parekh@gmail.com' },
];

export function OrdersCustomOrdersView() {
  const [orders, setOrders] = useState<CustomJewelleryOrder[]>(INITIAL_CUSTOM_ORDERS);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<CustomJewelleryOrder | null>(null);
  const [smsNotificationStatus, setSmsNotificationStatus] = useState<string | null>(null);

  // New Bespoke Order Form State
  const [formOrderCode, setFormOrderCode] = useState(`BESPOKE-${orders.length + 105}`);
  const [formCustomerName, setFormCustomerName] = useState(CUSTOMER_OPTIONS[0].name);
  const [formCustomerPhone, setFormCustomerPhone] = useState(CUSTOMER_OPTIONS[0].phone);
  const [formCustomerEmail, setFormCustomerEmail] = useState(CUSTOMER_OPTIONS[0].email);
  const [formOrnamentType, setFormOrnamentType] = useState('Cocktail Ring');
  const [formDescription, setFormDescription] = useState('Emerald cut cocktail ring with halo diamonds');
  const [formMetalType, setFormMetalType] = useState('Yellow Gold');
  const [formKarat, setFormKarat] = useState('18K Diamond');
  const [formGrossWeight, setFormGrossWeight] = useState('12.500');
  const [formExpectedDate, setFormExpectedDate] = useState('2026-11-30');
  const [formAdvanceDeposit, setFormAdvanceDeposit] = useState('150000');
  const [formEstimatedTotal, setFormEstimatedTotal] = useState('450000');
  const [formRatePolicy, setFormRatePolicy] = useState<'LOCKED' | 'FLOATING'>('LOCKED');
  const [formLockedRate, setFormLockedRate] = useState('7850');
  const [formSettingStyle, setFormSettingStyle] = useState('Prong & Bezel Halo');
  const [formCenterStone, setFormCenterStone] = useState('Center 1.20ct Natural Emerald');
  const [formAccentStones, setFormAccentStones] = useState('48 Solitaire VVS Accents (0.80 cts)');
  const [formPriority, setFormPriority] = useState<'STANDARD' | 'HIGH_PRIORITY_BRIDAL' | 'RUSH'>('HIGH_PRIORITY_BRIDAL');
  const [formNotes, setFormNotes] = useState('Client wants CAD render preview sent via WhatsApp before wax printing.');
  const [cadAttachedFileName, setCadAttachedFileName] = useState<string>('cad_model_preview_v1.step');

  // Customer dropdown selection sync
  const handleCustomerSelect = (name: string) => {
    setFormCustomerName(name);
    const found = CUSTOMER_OPTIONS.find((c) => c.name === name);
    if (found) {
      setFormCustomerPhone(found.phone);
      setFormCustomerEmail(found.email);
    }
  };

  // Submit new bespoke order
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder: CustomJewelleryOrder = {
      id: crypto.randomUUID ? crypto.randomUUID() : `bespoke-${Date.now()}`,
      order_code: formOrderCode,
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
        diamond_count: 48,
        diamond_weight_cts: 0.8,
      },
      priority: formPriority,
      cad_file_name: cadAttachedFileName,
      cad_approved_by_client: true,
      notes: formNotes,
    };

    setOrders([newOrder, ...orders]);
    setIsNewOrderOpen(false);
    setFormOrderCode(`BESPOKE-${orders.length + 106}`);
  };

  const handleSendMilestoneSms = (order: CustomJewelleryOrder) => {
    setSmsNotificationStatus(`Milestone SMS sent to ${order.customer_phone} (${order.customer_name})`);
    setTimeout(() => {
      setSmsNotificationStatus(null);
    }, 4000);
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchesSearch =
        ord.order_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.ornament_type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage = stageFilter === 'ALL' || ord.production_stage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [orders, searchQuery, stageFilter]);

  // Stage badge styler
  const getStageBadge = (stage: CustomJewelleryOrder['production_stage']) => {
    switch (stage) {
      case '3D_CAD_APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Layers className="w-3 h-3 text-blue-600" /> 3D CAD Approved
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Gem className="w-3 h-3 text-amber-600" /> Stone Setting
          </span>
        );
      case 'POLISHING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Sparkles className="w-3 h-3 text-amber-600" /> Polishing & Buffing
          </span>
        );
      case 'READY_FOR_DELIVERY':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Ready for Delivery
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
        filterPlaceholder="Filter bespoke orders by client, order code, stone type..."
        insertLabel="New Bespoke Order"
        onInsertClick={() => setIsNewOrderOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* SMS Notification Banner */}
        {smsNotificationStatus && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs font-medium text-emerald-800 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{smsNotificationStatus}</span>
            </div>
            <button
              onClick={() => setSmsNotificationStatus(null)}
              className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
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
                Active Custom Orders
              </span>
              <span className="p-1 rounded bg-blue-50 text-blue-600">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-neutral-800 font-mono">24 Bespoke</div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-medium">↑ 4 new</span> this week
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
            <div className="text-xl font-medium text-neutral-800 font-mono">₹ 82.40 Lakhs</div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              <span className="text-neutral-700 font-medium">₹ 38.50 L</span> advance deposited
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Pending CAD Sign-offs
              </span>
              <span className="p-1 rounded bg-amber-50 text-amber-600">
                <Layers className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-neutral-800 font-mono">4 Designs</div>
            <div className="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-amber-500" /> Awaiting patron WhatsApp approval
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Bridal Sets Due This Month
              </span>
              <span className="p-1 rounded bg-purple-50 text-purple-600">
                <Calendar className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-neutral-800 font-mono">8 Packages</div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              Wedding deadlines Nov 15 - Nov 30
            </div>
          </div>
        </div>

        {/* Tab Controls (Data vs Definition) & Stage Filters */}
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
              <span className="text-[11px] font-medium text-neutral-500">Stage:</span>
              {['ALL', '3D_CAD_APPROVED', 'CASTING', 'STONE_SETTING', 'POLISHING', 'READY_FOR_DELIVERY'].map((st) => (
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
                    : st === 'READY_FOR_DELIVERY'
                    ? 'Ready'
                    : st.replace('_', ' ')}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Mode: Data Table */}
        {activeTab === 'data' ? (
          <div className="flex-1 p-4">
            <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-neutral-500 font-medium">
                      <th className="py-2.5 px-3 w-8 text-center border-r border-[#e5e7eb]">
                        <input type="checkbox" className="rounded border-neutral-300 text-emerald-600" />
                      </th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Order Code</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Patron Name</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb]">Bespoke Ornament & Karat</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] text-right whitespace-nowrap">Target Wt (g)</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Due Date</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Production Stage</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] text-right whitespace-nowrap">Advance / Total</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] text-center whitespace-nowrap">Rate Policy</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-2.5 px-3 text-center border-r border-[#e5e7eb]">
                          <input type="checkbox" className="rounded border-neutral-300 text-emerald-600" />
                        </td>
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
                          <div className="font-medium text-neutral-800">{ord.customer_name}</div>
                          <div className="text-[10px] text-neutral-400 font-mono">{ord.customer_phone}</div>
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb]">
                          <div className="font-medium text-neutral-800 line-clamp-1">{ord.description}</div>
                          <div className="text-[10px] text-neutral-500 flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                              {ord.karat}
                            </span>
                            <span>{ord.gemstone_specs.center_stone}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] text-right font-mono font-medium text-neutral-800 whitespace-nowrap">
                          {ord.target_weight_g.toFixed(3)} g
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-neutral-700">
                          {ord.expected_date}
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">
                          {getStageBadge(ord.production_stage)}
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] text-right font-mono whitespace-nowrap">
                          <div className="font-medium text-emerald-700">
                            ₹ {ord.advance_deposit.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-neutral-400">
                            / ₹ {ord.estimated_total.toLocaleString('en-IN')}
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
                          <button
                            onClick={() => setSelectedOrderForDetail(ord)}
                            className="p-1 hover:bg-neutral-100 rounded text-neutral-600 hover:text-emerald-700 transition-colors cursor-pointer"
                            title="Inspect 3D CAD & Specs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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

      {/* Bespoke Detail Modal (CAD Preview Mockup & Gemstone Specs) */}
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
                      Target Weight: {selectedOrderForDetail.target_weight_g.toFixed(3)}g | Karat: {selectedOrderForDetail.karat}
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
                      {selectedOrderForDetail.gemstone_specs.setting_style}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[11px]">Center Gemstone</span>
                    <span className="font-medium text-emerald-800">
                      {selectedOrderForDetail.gemstone_specs.center_stone}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[11px]">Accent Stones</span>
                    <span className="font-medium text-neutral-800">
                      {selectedOrderForDetail.gemstone_specs.accent_stones}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[11px]">Diamond Weight & Count</span>
                    <span className="font-medium text-neutral-800 font-mono">
                      {selectedOrderForDetail.gemstone_specs.diamond_weight_cts} cts (
                      {selectedOrderForDetail.gemstone_specs.diamond_count} stones)
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
                      ₹ {selectedOrderForDetail.advance_deposit.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                    <span className="text-neutral-600">Total Estimate:</span>
                    <span className="font-mono font-medium text-neutral-800">
                      ₹ {selectedOrderForDetail.estimated_total.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 pt-1.5 text-neutral-600">
                    <span>Balance on Delivery:</span>
                    <span className="font-mono font-medium text-amber-700">
                      ₹ {(selectedOrderForDetail.estimated_total - selectedOrderForDetail.advance_deposit).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-md bg-white border border-[#e2e8f0] text-xs">
                  <span className="text-[11px] text-neutral-500 block mb-1">Production Stage & Notes</span>
                  <div className="mb-2">{getStageBadge(selectedOrderForDetail.production_stage)}</div>
                  <p className="text-[11px] text-neutral-600 italic">
                    &ldquo;{selectedOrderForDetail.notes}&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-5 py-3 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between">
              <button
                onClick={() => handleSendMilestoneSms(selectedOrderForDetail)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                <span>Send Milestone SMS / WhatsApp</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedOrderForDetail(null)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
                >
                  Close Inspection
                </button>
              </div>
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
              {/* Order Code & Customer Picker */}
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
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Select Patron</label>
                  <select
                    value={formCustomerName}
                    onChange={(e) => handleCustomerSelect(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  >
                    {CUSTOMER_OPTIONS.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer Contact Info Preview */}
              <div className="grid grid-cols-2 gap-3 bg-[#f8fafc] p-2.5 rounded border border-[#e2e8f0] text-xs">
                <div>
                  <span className="text-[10px] text-neutral-500 block">Phone</span>
                  <span className="font-mono text-neutral-700">{formCustomerPhone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block">Email</span>
                  <span className="font-mono text-neutral-700">{formCustomerEmail}</span>
                </div>
              </div>

              {/* Ornament Description & Type */}
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
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Design Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  required
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
                    placeholder="e.g. Prong, Micro-Pave, Bezel, Jadau"
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
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Accent Diamonds</label>
                    <input
                      type="text"
                      value={formAccentStones}
                      onChange={(e) => setFormAccentStones(e.target.value)}
                      placeholder="e.g. 48 Round VVS-EF"
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Financials & Gold Rate Policy */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Advance Deposit (₹)</label>
                  <input
                    type="number"
                    value={formAdvanceDeposit}
                    onChange={(e) => setFormAdvanceDeposit(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Estimated Total (₹)</label>
                  <input
                    type="number"
                    value={formEstimatedTotal}
                    onChange={(e) => setFormEstimatedTotal(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
              </div>

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

              {/* Delivery Date & Priority */}
              <div className="grid grid-cols-2 gap-3">
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
              </div>

              {/* CAD 3D File Attachment Dropzone */}
              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">CAD 3D Model Attachment</label>
                <div className="border border-dashed border-[#cbd5e1] hover:border-emerald-500 bg-[#f8fafc] rounded-md p-4 text-center cursor-pointer transition-colors">
                  <UploadCloud className="w-6 h-6 text-neutral-400 mx-auto mb-1.5" />
                  <span className="text-xs font-medium text-neutral-700 block">
                    Upload .STEP, .STL, .3DM, or .OBJ file
                  </span>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">
                    Attached file: <span className="font-mono text-emerald-600">{cadAttachedFileName}</span>
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Bespoke Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
