'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Package,
  Calendar,
  Lock,
  X,
  BadgeIndianRupee,
  Eye,
} from 'lucide-react';

interface SalesOrder {
  id: string;
  order_no: string;
  customer_name: string;
  customer_phone: string;
  occasion: string;
  design_category: string;
  metal_karat: string;
  approx_weight_g: number;
  rate_policy: 'FIXED_LOCKED_RATE' | 'FLOATING_DAY_RATE';
  locked_rate_per_g?: number;
  advance_received: number;
  estimated_order_value: number;
  due_date: string;
  stage: 'CAD_DESIGN' | 'CASTING' | 'SETTING' | 'POLISHING' | 'HALLMARK_HUID' | 'READY_FOR_DELIVERY';
  status: 'IN_PRODUCTION' | 'COMPLETED' | 'CANCELLED';
  assigned_karigar: string;
  created_at: string;
}

const INITIAL_ORDERS: SalesOrder[] = [
  {
    id: '11ae8832-612b-42e1-897c-9bdf203912ca',
    order_no: 'ORD-2026-0312',
    customer_name: 'Kavitha R',
    customer_phone: '+91 98492 11044',
    occasion: 'Grand Wedding Reception (Nov 24)',
    design_category: 'Bridal Choker & Vaddanam Set',
    metal_karat: 'Gold 22K (916)',
    approx_weight_g: 85.000,
    rate_policy: 'FIXED_LOCKED_RATE',
    locked_rate_per_g: 7850.00,
    advance_received: 200000.00,
    estimated_order_value: 735000.00,
    due_date: '2026-11-20',
    stage: 'CASTING',
    status: 'IN_PRODUCTION',
    assigned_karigar: 'Gopal Soni (Bengal Master)',
    created_at: '2026-10-24',
  },
  {
    id: '11ae8832-612b-42e1-897c-9bdf203912cb',
    order_no: 'ORD-2026-0313',
    customer_name: 'Dr. Srinivas Rao',
    customer_phone: '+91 97010 33890',
    occasion: 'Engagement Ceremony',
    design_category: 'Solitaire Diamond Ring (2.0 ct)',
    metal_karat: 'Gold 18K (750)',
    approx_weight_g: 6.800,
    rate_policy: 'FIXED_LOCKED_RATE',
    locked_rate_per_g: 6420.00,
    advance_received: 150000.00,
    estimated_order_value: 380000.00,
    due_date: '2026-11-05',
    stage: 'SETTING',
    status: 'IN_PRODUCTION',
    assigned_karigar: 'Diamond Micro-Prong Cell #2',
    created_at: '2026-10-26',
  },
  {
    id: '11ae8832-612b-42e1-897c-9bdf203912cc',
    order_no: 'ORD-2026-0314',
    customer_name: 'Sunanda Devi',
    customer_phone: '+91 99490 88219',
    occasion: '60th Shashti Poorthi',
    design_category: 'Handcrafted Antique Kasu Mala',
    metal_karat: 'Gold 22K (916)',
    approx_weight_g: 110.000,
    rate_policy: 'FLOATING_DAY_RATE',
    advance_received: 300000.00,
    estimated_order_value: 945000.00,
    due_date: '2026-11-12',
    stage: 'POLISHING',
    status: 'IN_PRODUCTION',
    assigned_karigar: 'Subbaiah Karigar Unit',
    created_at: '2026-10-20',
  },
  {
    id: '11ae8832-612b-42e1-897c-9bdf203912cd',
    order_no: 'ORD-2026-0315',
    customer_name: 'Naveen Choudhary',
    customer_phone: '+91 98850 77123',
    occasion: 'Family Wedding Sangeet',
    design_category: 'Royal Polki & Pearl Kadas',
    metal_karat: 'Gold 22K (916)',
    approx_weight_g: 48.000,
    rate_policy: 'FIXED_LOCKED_RATE',
    locked_rate_per_g: 7850.00,
    advance_received: 100000.00,
    estimated_order_value: 415000.00,
    due_date: '2026-11-02',
    stage: 'HALLMARK_HUID',
    status: 'IN_PRODUCTION',
    assigned_karigar: 'Hyderabad Casting Unit',
    created_at: '2026-10-15',
  },
];

export function SalesOrdersView() {
  const [orders, setOrders] = useState<SalesOrder[]>(INITIAL_ORDERS);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [occasion, setOccasion] = useState('');
  const [category, setCategory] = useState('Bridal Choker & Vaddanam Set');
  const [metalKarat, setMetalKarat] = useState('Gold 22K (916)');
  const [approxWeight, setApproxWeight] = useState('45.000');
  const [ratePolicy, setRatePolicy] = useState<'FIXED_LOCKED_RATE' | 'FLOATING_DAY_RATE'>('FIXED_LOCKED_RATE');
  const [advance, setAdvance] = useState('100000');
  const [dueDate, setDueDate] = useState('2026-11-25');
  const [karigar, setKarigar] = useState('Gopal Soni (Bengal Master)');

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const wt = parseFloat(approxWeight) || 0;
    const adv = parseFloat(advance) || 0;
    const estVal = Math.round(wt * 7850 * 1.15);

    const newOrder: SalesOrder = {
      id: `ord-${orders.length + 1}-${customerName.slice(0, 3)}`,
      order_no: `ORD-2026-0${316 + orders.length}`,
      customer_name: customerName,
      customer_phone: customerPhone,
      occasion,
      design_category: category,
      metal_karat: metalKarat,
      approx_weight_g: wt,
      rate_policy: ratePolicy,
      locked_rate_per_g: ratePolicy === 'FIXED_LOCKED_RATE' ? 7850 : undefined,
      advance_received: adv,
      estimated_order_value: estVal,
      due_date: dueDate,
      stage: 'CAD_DESIGN',
      status: 'IN_PRODUCTION',
      assigned_karigar: karigar,
      created_at: '2026-10-31',
    };

    setOrders([newOrder, ...orders]);
    setIsAddModalOpen(false);
    setCustomerName('');
    setCustomerPhone('');
    setOccasion('');
  };

  const filteredOrders = orders.filter((o) => {
    if (stageFilter !== 'ALL' && o.stage !== stageFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchNo = o.order_no.toLowerCase().includes(q);
      const matchCust = o.customer_name.toLowerCase().includes(q);
      const matchCat = o.design_category.toLowerCase().includes(q);
      if (!matchNo && !matchCust && !matchCat) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="sales_orders" />
      <ActionToolbar
        filterPlaceholder="Filter by order #, customer, design..."
        insertLabel="New Custom Jewellery Order"
        onInsertClick={() => setIsAddModalOpen(true)}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Active Bridal Bookings</span>
                <Package className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">38 Orders</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                Across 6 Karigar workshops
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Advance Bookings Value</span>
                <BadgeIndianRupee className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">₹ 1.12 Cr</div>
              <div className="text-[11px] text-blue-700 mt-1 font-mono">
                Cash, UPI & Advance Ledger
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Rate-Locked Gold</span>
                <Lock className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">420.000 g</div>
              <div className="text-[11px] text-amber-700 mt-1 font-mono">
                Hedged in bullion account
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Due This Week</span>
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-xl font-medium text-purple-700">6 Orders</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Wedding delivery schedules
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-neutral-400 font-mono text-[11px]">Filters:</span>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Stage:</span>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Stages</option>
                  <option value="CAD_DESIGN">CAD Design</option>
                  <option value="CASTING">Casting</option>
                  <option value="SETTING">Stone Setting</option>
                  <option value="POLISHING">Polishing</option>
                  <option value="HALLMARK_HUID">Hallmark & HUID</option>
                  <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search Order # / Customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 px-2.5 py-1 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none placeholder:text-neutral-400 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Supabase-style Table */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">sales_orders</span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">Showing {filteredOrders.length} of {orders.length} custom orders</span>
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
                        <span className="text-neutral-800">order_no</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">customer_name</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">design_category & occasion</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">approx_weight_g</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">advance_received</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">rate_policy</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">production_stage</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">due_date</span>
                      </th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {filteredOrders.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="w-10 px-3 py-2 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-[11px]">
                          <span className="font-medium text-emerald-700 hover:underline cursor-pointer">
                            {row.order_no}
                          </span>
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-medium text-neutral-800">
                          <div>{row.customer_name}</div>
                          <div className="text-[10px] text-neutral-400 font-normal">{row.customer_phone}</div>
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <div className="font-medium text-neutral-800">{row.design_category}</div>
                          <div className="text-[10px] text-neutral-500">{row.occasion}</div>
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-right text-neutral-800">
                          {row.approx_weight_g.toFixed(3)} g
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-right font-medium text-emerald-800">
                          ₹ {row.advance_received.toLocaleString('en-IN')}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          {row.rate_policy === 'FIXED_LOCKED_RATE' ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200">
                              Locked @ ₹{row.locked_rate_per_g}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-800 border border-blue-200">
                              Floating Day Rate
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium font-mono ${
                              row.stage === 'READY_FOR_DELIVERY'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : row.stage === 'HALLMARK_HUID'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                            }`}
                          >
                            {row.stage.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-[11px] text-neutral-600">
                          {row.due_date}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <button
                            onClick={() => alert(`Order ${row.order_no}: Assigned to ${row.assigned_karigar}. Estimated value ₹${row.estimated_order_value}`)}
                            className="p-1 rounded text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
                            title="View Order Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.sales_orders (
                  <br />
                  <span className="pl-6 text-blue-300">id</span> <span className="text-amber-300">uuid</span> <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">order_no</span> <span className="text-amber-300">varchar(32)</span> <span className="text-neutral-400">UNIQUE NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">customer_name</span> <span className="text-amber-300">varchar(255)</span> <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">metal_type</span> <span className="text-amber-300">varchar(64)</span> <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">approx_weight_g</span> <span className="text-amber-300">numeric(10,3)</span> <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">advance_received</span> <span className="text-amber-300">numeric(10,2)</span> <span className="text-neutral-400">DEFAULT 0.00,</span>
                  <br />
                  <span className="pl-6 text-blue-300">due_date</span> <span className="text-amber-300">date</span> <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">stage</span> <span className="text-amber-300">varchar(32)</span> <span className="text-neutral-400">DEFAULT &apos;CAD_DESIGN&apos;</span>
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Custom Order Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full border border-[#e2e8f0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">
                  New Custom Jewellery Bridal Order
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Kavitha R"
                    className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Phone (+91)
                  </label>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98492 11044"
                    className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Occasion / Event
                  </label>
                  <input
                    type="text"
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    placeholder="e.g. Wedding Reception Nov 24"
                    className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Delivery Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Design Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Bridal Choker & Vaddanam Set">Bridal Choker & Vaddanam Set</option>
                    <option value="Solitaire Diamond Ring">Solitaire Diamond Ring</option>
                    <option value="Handcrafted Antique Kasu Mala">Handcrafted Antique Kasu Mala</option>
                    <option value="Polki & Pearl Kadas">Polki & Pearl Kadas</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Metal Karat
                  </label>
                  <select
                    value={metalKarat}
                    onChange={(e) => setMetalKarat(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Gold 22K (916)">Gold 22K (916)</option>
                    <option value="Gold 18K (750)">Gold 18K (750 Diamond)</option>
                    <option value="Gold 24K (999)">Gold 24K (999)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Approx Weight (g)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={approxWeight}
                    onChange={(e) => setApproxWeight(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Advance Paid (₹)
                  </label>
                  <input
                    type="number"
                    value={advance}
                    onChange={(e) => setAdvance(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Gold Rate Policy
                  </label>
                  <select
                    value={ratePolicy}
                    onChange={(e) => setRatePolicy(e.target.value as 'FIXED_LOCKED_RATE' | 'FLOATING_DAY_RATE')}
                    className="w-full px-2.5 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="FIXED_LOCKED_RATE">Rate Locked @ ₹7,850</option>
                    <option value="FLOATING_DAY_RATE">Floating Day Rate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">
                  Assigned Karigar Unit
                </label>
                <select
                  value={karigar}
                  onChange={(e) => setKarigar(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="Gopal Soni (Bengal Master)">Gopal Soni (Bengal Master)</option>
                  <option value="Diamond Micro-Prong Cell #2">Diamond Micro-Prong Cell #2</option>
                  <option value="Subbaiah Karigar Unit">Subbaiah Karigar Unit</option>
                  <option value="Hyderabad Casting Unit">Hyderabad Casting Unit</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#e5e7eb] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                >
                  Create Custom Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
