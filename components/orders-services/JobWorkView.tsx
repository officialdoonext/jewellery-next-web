'use client';

import React, { useState, useMemo } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Coins,
  Package,
  Scale,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  X,
  Search,
  Filter,
  Eye,
  Check,
  Building2,
  FileText,
  DollarSign,
  Layers,
  Sparkles,
} from 'lucide-react';

interface JobWorkOrder {
  id: string;
  job_order_no: string;
  goldsmith_name: string;
  workshop_unit: string;
  raw_gold_issued_g: number;
  pure_gold_karat: string;
  alloy_added_g: number;
  target_ornament_desc: string;
  target_karat: string;
  expected_finished_g: number;
  allowed_wastage_percent: number;
  actual_received_finished_g?: number;
  actual_scrap_returned_g?: number;
  actual_wastage_g?: number;
  labour_rate_per_g: number;
  expected_delivery_date: string;
  status: 'METAL_ISSUED' | 'IN_MANUFACTURING' | 'PARTIALLY_DELIVERED' | 'SETTLED';
  settlement_notes?: string;
}

const INITIAL_JOB_WORK_ORDERS: JobWorkOrder[] = [
  {
    id: 'jo-01',
    job_order_no: 'JO-2026-208',
    goldsmith_name: 'Bhaskar Jewellers Workshop',
    workshop_unit: 'Unit A - Casting & Bangles',
    raw_gold_issued_g: 250.000,
    pure_gold_karat: '24K 999',
    alloy_added_g: 22.727,
    target_ornament_desc: 'Antique Temple Kada Bangles (3 Pairs)',
    target_karat: '22K 916',
    expected_finished_g: 267.820,
    allowed_wastage_percent: 1.8,
    actual_received_finished_g: 265.400,
    actual_scrap_returned_g: 2.100,
    actual_wastage_g: 5.227,
    labour_rate_per_g: 480,
    expected_delivery_date: '2026-11-04',
    status: 'IN_MANUFACTURING',
    settlement_notes: 'Wax trees casted; currently under nakshi embossing.',
  },
  {
    id: 'jo-02',
    job_order_no: 'JO-2026-209',
    goldsmith_name: 'Soni Karigar Unit',
    workshop_unit: 'Zaveri Bazaar Branch',
    raw_gold_issued_g: 500.000,
    pure_gold_karat: '24K 999',
    alloy_added_g: 45.455,
    target_ornament_desc: 'Lightweight Hollow Machine Chains (15 Pcs)',
    target_karat: '22K 916',
    expected_finished_g: 535.636,
    allowed_wastage_percent: 1.5,
    labour_rate_per_g: 320,
    expected_delivery_date: '2026-11-07',
    status: 'METAL_ISSUED',
    settlement_notes: 'Pure 999 bullion bar handed over with hallmark test certificate.',
  },
  {
    id: 'jo-03',
    job_order_no: 'JO-2026-210',
    goldsmith_name: 'Laxmi Casting Works',
    workshop_unit: 'MIDC Industrial Foundry',
    raw_gold_issued_g: 350.000,
    pure_gold_karat: '24K 999',
    alloy_added_g: 116.667,
    target_ornament_desc: '18K Diamond Solitaire Ring Mountings (25 Units)',
    target_karat: '18K 750',
    expected_finished_g: 457.800,
    allowed_wastage_percent: 2.0,
    actual_received_finished_g: 250.000,
    actual_scrap_returned_g: 5.400,
    labour_rate_per_g: 550,
    expected_delivery_date: '2026-11-02',
    status: 'PARTIALLY_DELIVERED',
    settlement_notes: '14 mounts delivered and hallmarked; remaining 11 in buffing.',
  },
  {
    id: 'jo-04',
    job_order_no: 'JO-2026-205',
    goldsmith_name: 'Rajesh Soni Workshop',
    workshop_unit: 'Gold Souk Workshop 3',
    raw_gold_issued_g: 380.000,
    pure_gold_karat: '24K 999',
    alloy_added_g: 34.545,
    target_ornament_desc: 'Traditional Calcutta Filigree Haar & Jhumkas',
    target_karat: '22K 916',
    expected_finished_g: 407.085,
    allowed_wastage_percent: 1.8,
    actual_received_finished_g: 401.500,
    actual_scrap_returned_g: 5.800,
    actual_wastage_g: 7.245,
    labour_rate_per_g: 520,
    expected_delivery_date: '2026-10-28',
    status: 'SETTLED',
    settlement_notes: 'Wastage within 1.74% limit. Labour voucher paid via NEFT.',
  },
];

const GOLDSMITH_WORKSHOPS = [
  'Bhaskar Jewellers Workshop',
  'Soni Karigar Unit',
  'Laxmi Casting Works',
  'Rajesh Soni Workshop',
  'Mangalore Goldsmith Guild',
];

export function OrdersJobWorkView() {
  const [jobOrders, setJobOrders] = useState<JobWorkOrder[]>(INITIAL_JOB_WORK_ORDERS);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isNewJobWorkOpen, setIsNewJobWorkOpen] = useState(false);
  const [deliveryModalOrder, setDeliveryModalOrder] = useState<JobWorkOrder | null>(null);

  // Delivery Modal State
  const [deliveryFinishedWeight, setDeliveryFinishedWeight] = useState('');
  const [deliveryScrapWeight, setDeliveryScrapWeight] = useState('');

  // Form State
  const [formJobOrderNo, setFormJobOrderNo] = useState(`JO-2026-0${jobOrders.length + 211}`);
  const [formGoldsmith, setFormGoldsmith] = useState(GOLDSMITH_WORKSHOPS[0]);
  const [formWorkshopUnit, setFormWorkshopUnit] = useState('Unit A - Casting & Bangles');
  const [formRawGoldIssued, setFormRawGoldIssued] = useState('250.000');
  const [formTargetKarat, setFormTargetKarat] = useState('22K 916');
  const [formTargetOrnaments, setFormTargetOrnaments] = useState('Antique Temple Kada Bangles (3 Pairs)');
  const [formAllowedWastage, setFormAllowedWastage] = useState('1.8');
  const [formLabourRate, setFormLabourRate] = useState('450');
  const [formExpectedDate, setFormExpectedDate] = useState('2026-11-12');
  const [formNotes, setFormNotes] = useState('Alloy master mix supplied with 999 bar.');

  // Live calculation of expected finished metal
  const expectedValues = useMemo(() => {
    const rawGold = parseFloat(formRawGoldIssued) || 0;
    let alloy = 0;
    if (formTargetKarat === '22K 916') {
      alloy = rawGold * (8.33 / 91.67);
    } else if (formTargetKarat === '18K 750') {
      alloy = rawGold * (25 / 75);
    }
    const totalMetal = rawGold + alloy;
    const wastage = (totalMetal * (parseFloat(formAllowedWastage) || 1.8)) / 100;
    const expectedFinished = totalMetal - wastage;
    return {
      rawGold,
      alloy,
      totalMetal,
      wastage,
      expectedFinished,
    };
  }, [formRawGoldIssued, formTargetKarat, formAllowedWastage]);

  const handleCreateJobOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder: JobWorkOrder = {
      id: crypto.randomUUID ? crypto.randomUUID() : `jo-${Date.now()}`,
      job_order_no: formJobOrderNo,
      goldsmith_name: formGoldsmith,
      workshop_unit: formWorkshopUnit,
      raw_gold_issued_g: expectedValues.rawGold,
      pure_gold_karat: '24K 999',
      alloy_added_g: expectedValues.alloy,
      target_ornament_desc: formTargetOrnaments,
      target_karat: formTargetKarat,
      expected_finished_g: expectedValues.expectedFinished,
      allowed_wastage_percent: parseFloat(formAllowedWastage) || 1.8,
      labour_rate_per_g: parseFloat(formLabourRate) || 450,
      expected_delivery_date: formExpectedDate,
      status: 'METAL_ISSUED',
      settlement_notes: formNotes,
    };

    setJobOrders([newOrder, ...jobOrders]);
    setIsNewJobWorkOpen(false);
    setFormJobOrderNo(`JO-2026-0${jobOrders.length + 212}`);
  };

  const openDeliveryModal = (order: JobWorkOrder) => {
    setDeliveryModalOrder(order);
    setDeliveryFinishedWeight(order.expected_finished_g.toFixed(3));
    setDeliveryScrapWeight('2.150');
  };

  const handleRecordDelivery = () => {
    if (!deliveryModalOrder) return;
    const finishedWt = parseFloat(deliveryFinishedWeight) || 0;
    const scrapWt = parseFloat(deliveryScrapWeight) || 0;
    const totalReturned = finishedWt + scrapWt;
    const totalIssued = deliveryModalOrder.raw_gold_issued_g + deliveryModalOrder.alloy_added_g;
    const actualLoss = totalIssued - totalReturned;

    setJobOrders((prev) =>
      prev.map((ord) =>
        ord.id === deliveryModalOrder.id
          ? {
              ...ord,
              actual_received_finished_g: finishedWt,
              actual_scrap_returned_g: scrapWt,
              actual_wastage_g: actualLoss,
              status: 'SETTLED',
              settlement_notes: `Delivery recorded. Finished: ${finishedWt}g, Scrap: ${scrapWt}g, Loss: ${actualLoss.toFixed(3)}g`,
            }
          : ord
      )
    );
    setDeliveryModalOrder(null);
  };

  const filteredOrders = useMemo(() => {
    return jobOrders.filter((ord) => {
      const matchSearch =
        ord.job_order_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.goldsmith_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.target_ornament_desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || ord.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [jobOrders, searchQuery, statusFilter]);

  const getStatusBadge = (status: JobWorkOrder['status']) => {
    switch (status) {
      case 'METAL_ISSUED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Coins className="w-3 h-3 text-blue-600" /> Metal Issued
          </span>
        );
      case 'IN_MANUFACTURING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Flame className="w-3 h-3 text-amber-600" /> In Manufacturing
          </span>
        );
      case 'PARTIALLY_DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
            <Clock className="w-3 h-3 text-purple-600" /> Partially Delivered
          </span>
        );
      case 'SETTLED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Settled & Audited
          </span>
        );
      default:
        return <span className="text-neutral-500">{status}</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="jobwork_orders" />
      <ActionToolbar
        filterPlaceholder="Filter job work by order #, workshop, ornament..."
        insertLabel="Issue Raw Metal Order"
        onInsertClick={() => setIsNewJobWorkOpen(true)}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics Cards */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Active Job Work Orders
              </span>
              <span className="p-1 rounded bg-blue-50 text-blue-600">
                <FileText className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-neutral-800 font-mono">14 Orders</div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              Across 5 karigar casting units
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Raw Gold Issued in Workshop
              </span>
              <span className="p-1 rounded bg-amber-50 text-amber-600">
                <Coins className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-amber-800 font-mono">1,480.000 g</div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              Pure 24K 999 bullion custody
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Expected Finished Delivery
              </span>
              <span className="p-1 rounded bg-emerald-50 text-emerald-600">
                <Package className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-emerald-800 font-mono">1,452.000 g</div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              After touch alloy & melting
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Touch Wastage Allowance
              </span>
              <span className="p-1 rounded bg-purple-50 text-purple-600">
                <Scale className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-neutral-800 font-mono">1.8% Std</div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              Standard melting & filings loss tolerance
            </div>
          </div>
        </div>

        {/* Tab & Filter Controls */}
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
              Job Work Orders ({filteredOrders.length})
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
              <span className="text-[11px] font-medium text-neutral-500">Status:</span>
              {['ALL', 'METAL_ISSUED', 'IN_MANUFACTURING', 'PARTIALLY_DELIVERED', 'SETTLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white text-neutral-600 border border-[#e2e8f0] hover:bg-neutral-50'
                  }`}
                >
                  {st === 'ALL'
                    ? 'All'
                    : st === 'METAL_ISSUED'
                    ? 'Issued'
                    : st === 'IN_MANUFACTURING'
                    ? 'In Production'
                    : st === 'PARTIALLY_DELIVERED'
                    ? 'Partial'
                    : 'Settled'}
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
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Job Order #</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Goldsmith Workshop</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] text-right whitespace-nowrap">Raw 24K Issued</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb]">Target Ornaments & Karat</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] text-right whitespace-nowrap">Expected Finished</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] text-center whitespace-nowrap">Wastage %</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Due Date</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Status</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap">Workshop Delivery</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-2.5 px-3 text-center border-r border-[#e5e7eb]">
                          <input type="checkbox" className="rounded border-neutral-300 text-emerald-600" />
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap font-mono">
                          <span className="font-medium text-emerald-700">{ord.job_order_no}</span>
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">
                          <div className="font-medium text-neutral-800">{ord.goldsmith_name}</div>
                          <span className="text-[10px] text-neutral-400 block">{ord.workshop_unit}</span>
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] text-right font-mono whitespace-nowrap">
                          <span className="font-medium text-amber-700">
                            {ord.raw_gold_issued_g.toFixed(3)} g
                          </span>
                          <span className="text-[10px] text-neutral-400 block">24K 999 Bullion</span>
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb]">
                          <div className="font-medium text-neutral-800">{ord.target_ornament_desc}</div>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200 font-mono">
                            Target: {ord.target_karat}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] text-right font-mono font-medium text-neutral-800 whitespace-nowrap">
                          {ord.expected_finished_g.toFixed(3)} g
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] text-center whitespace-nowrap font-mono">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-100 text-neutral-700">
                            {ord.allowed_wastage_percent}% Std
                          </span>
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-neutral-700">
                          {ord.expected_delivery_date}
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">
                          {getStatusBadge(ord.status)}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {ord.status !== 'SETTLED' ? (
                            <button
                              onClick={() => openDeliveryModal(ord)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                            >
                              <Scale className="w-3 h-3" />
                              <span>Record Delivery</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-700 font-mono">
                              Settled ✓ (Loss: {ord.actual_wastage_g?.toFixed(3)}g)
                            </span>
                          )}
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
              <span className="text-emerald-400">CREATE TABLE</span> public.jobwork_orders (
              <br />
              &nbsp;&nbsp;id <span className="text-blue-400">UUID</span> PRIMARY KEY DEFAULT gen_random_uuid(),
              <br />
              &nbsp;&nbsp;job_order_no <span className="text-blue-400">VARCHAR(50)</span> UNIQUE NOT NULL,
              <br />
              &nbsp;&nbsp;goldsmith_name <span className="text-blue-400">VARCHAR(150)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;workshop_unit <span className="text-blue-400">VARCHAR(100)</span>,
              <br />
              &nbsp;&nbsp;raw_gold_issued_g <span className="text-blue-400">NUMERIC(10,3)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;pure_gold_karat <span className="text-blue-400">VARCHAR(20)</span> DEFAULT &apos;24K 999&apos;,
              <br />
              &nbsp;&nbsp;alloy_added_g <span className="text-blue-400">NUMERIC(10,3)</span> DEFAULT 0.000,
              <br />
              &nbsp;&nbsp;target_ornament_desc <span className="text-blue-400">TEXT</span> NOT NULL,
              <br />
              &nbsp;&nbsp;target_karat <span className="text-blue-400">VARCHAR(20)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;expected_finished_g <span className="text-blue-400">NUMERIC(10,3)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;allowed_wastage_percent <span className="text-blue-400">NUMERIC(4,2)</span> DEFAULT 1.80,
              <br />
              &nbsp;&nbsp;actual_received_finished_g <span className="text-blue-400">NUMERIC(10,3)</span>,
              <br />
              &nbsp;&nbsp;actual_scrap_returned_g <span className="text-blue-400">NUMERIC(10,3)</span>,
              <br />
              &nbsp;&nbsp;actual_wastage_g <span className="text-blue-400">NUMERIC(10,3)</span>,
              <br />
              &nbsp;&nbsp;labour_rate_per_g <span className="text-blue-400">NUMERIC(10,2)</span>,
              <br />
              &nbsp;&nbsp;expected_delivery_date <span className="text-blue-400">DATE</span> NOT NULL,
              <br />
              &nbsp;&nbsp;status <span className="text-blue-400">VARCHAR(50)</span> DEFAULT &apos;METAL_ISSUED&apos;,
              <br />
              &nbsp;&nbsp;settlement_notes <span className="text-blue-400">TEXT</span>,
              <br />
              &nbsp;&nbsp;created_at <span className="text-blue-400">TIMESTAMPTZ</span> DEFAULT now()
              <br />
              );
            </div>
          </div>
        )}
      </div>

      {/* Record Goldsmith Delivery Modal */}
      {deliveryModalOrder && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl border border-[#e2e8f0] w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-emerald-50 text-emerald-700">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-neutral-900 uppercase tracking-wider">
                    Record Goldsmith Delivery & Wastage Audit
                  </h3>
                  <span className="font-mono text-[11px] text-emerald-700">
                    {deliveryModalOrder.job_order_no} • {deliveryModalOrder.goldsmith_name}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDeliveryModalOrder(null)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Total Metal Issued (Raw + Alloy):</span>
                  <span className="font-mono font-medium text-neutral-800">
                    {(deliveryModalOrder.raw_gold_issued_g + deliveryModalOrder.alloy_added_g).toFixed(3)} g
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Expected Finished Delivery:</span>
                  <span className="font-mono font-medium text-emerald-700">
                    {deliveryModalOrder.expected_finished_g.toFixed(3)} g
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Max Allowed Wastage ({deliveryModalOrder.allowed_wastage_percent}%):</span>
                  <span className="font-mono text-neutral-700">
                    {((deliveryModalOrder.raw_gold_issued_g + deliveryModalOrder.alloy_added_g) * (deliveryModalOrder.allowed_wastage_percent / 100)).toFixed(3)} g
                  </span>
                </div>
              </div>

              {/* Delivery Weight Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Finished Ornaments Wt (g)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={deliveryFinishedWeight}
                    onChange={(e) => setDeliveryFinishedWeight(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Scrap / Dust Returned (g)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={deliveryScrapWeight}
                    onChange={(e) => setDeliveryScrapWeight(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
              </div>

              {/* Live Loss Audit Result */}
              {(() => {
                const fin = parseFloat(deliveryFinishedWeight) || 0;
                const scr = parseFloat(deliveryScrapWeight) || 0;
                const totalRet = fin + scr;
                const totalIss = deliveryModalOrder.raw_gold_issued_g + deliveryModalOrder.alloy_added_g;
                const actualLoss = totalIss - totalRet;
                const actualLossPercent = (actualLoss / totalIss) * 100;
                const isWithinTolerance = actualLossPercent <= deliveryModalOrder.allowed_wastage_percent;

                return (
                  <div
                    className={`p-3 rounded-md border text-xs ${
                      isWithinTolerance
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-medium mb-1">
                      {isWithinTolerance ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      )}
                      <span>
                        Actual Wastage: {actualLoss.toFixed(3)} g ({actualLossPercent.toFixed(2)}%)
                      </span>
                    </div>
                    <p className="text-[11px] opacity-90">
                      {isWithinTolerance
                        ? `Approved: Within allowable limit of ${deliveryModalOrder.allowed_wastage_percent}%.`
                        : `Alert: Exceeds allowed limit of ${deliveryModalOrder.allowed_wastage_percent}%. Supervisor approval required.`}
                    </p>
                  </div>
                );
              })()}
            </div>

            <div className="px-5 py-3 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeliveryModalOrder(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRecordDelivery}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Verify & Settle Job Order</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer Modal: Issue Raw Metal Job Order */}
      {isNewJobWorkOpen && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex justify-end z-50 animate-fadeIn">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#e2e8f0]">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-amber-50 text-amber-700">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-neutral-900 uppercase tracking-wider">
                    Issue Raw 24K Metal Job Order
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Issue pure bullion bar & assign manufacturing specs
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewJobWorkOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form id="new-jobwork-form" onSubmit={handleCreateJobOrder} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Job Order #</label>
                  <input
                    type="text"
                    value={formJobOrderNo}
                    onChange={(e) => setFormJobOrderNo(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Goldsmith Workshop</label>
                  <select
                    value={formGoldsmith}
                    onChange={(e) => setFormGoldsmith(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  >
                    {GOLDSMITH_WORKSHOPS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Raw Gold Issue Weight & Target Karat */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Raw 24K Gold Issued (g)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formRawGoldIssued}
                    onChange={(e) => setFormRawGoldIssued(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Target Karat Standard</label>
                  <select
                    value={formTargetKarat}
                    onChange={(e) => setFormTargetKarat(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  >
                    <option value="22K 916">22K 916 Gold (8.33% Touch)</option>
                    <option value="18K 750">18K 750 Gold (25.0% Alloy)</option>
                  </select>
                </div>
              </div>

              {/* Metal Conversion Auto Calculator Card */}
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-xs space-y-2">
                <span className="text-[11px] font-medium text-neutral-700 uppercase tracking-wider block">
                  Live Alloy & Wastage Calculation
                </span>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-white p-2 rounded border border-[#e2e8f0]">
                    <span className="text-[10px] text-neutral-500 block">Copper/Silver Alloy</span>
                    <span className="font-mono font-medium text-neutral-800">
                      +{expectedValues.alloy.toFixed(3)} g
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded border border-[#e2e8f0]">
                    <span className="text-[10px] text-neutral-500 block">Allowed Wastage</span>
                    <span className="font-mono text-amber-700">
                      -{expectedValues.wastage.toFixed(3)} g
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded border border-[#e2e8f0]">
                    <span className="text-[10px] text-neutral-500 block">Expected Finished</span>
                    <span className="font-mono font-medium text-emerald-700">
                      {expectedValues.expectedFinished.toFixed(3)} g
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">
                  Intended Ornaments to Manufacture
                </label>
                <input
                  type="text"
                  value={formTargetOrnaments}
                  onChange={(e) => setFormTargetOrnaments(e.target.value)}
                  placeholder="e.g. Antique Temple Bangles 3 Pairs, Casting Chains 10 Pcs"
                  required
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Allowed Wastage %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formAllowedWastage}
                    onChange={(e) => setFormAllowedWastage(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Labour Rate (₹/g)</label>
                  <input
                    type="number"
                    value={formLabourRate}
                    onChange={(e) => setFormLabourRate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Promised Delivery Date</label>
                <input
                  type="date"
                  value={formExpectedDate}
                  onChange={(e) => setFormExpectedDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Workshop Notes & Instructions</label>
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
                onClick={() => setIsNewJobWorkOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="new-jobwork-form"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Issue Metal & Create Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
