'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  Share2,
  Printer,
  X,
  AlertCircle,
  BadgeIndianRupee,
} from 'lucide-react';

interface QuotationItem {
  id: string;
  quote_no: string;
  customer_name: string;
  customer_phone: string;
  items_summary: string;
  metal_type: string;
  gross_weight_g: number;
  gold_rate_applied: number;
  making_charges: number;
  discount_amount: number;
  total_estimate: number;
  valid_until: string;
  is_rate_locked: boolean;
  status: 'OPEN' | 'CONVERTED' | 'EXPIRED';
  created_at: string;
}

const INITIAL_QUOTATIONS: QuotationItem[] = [
  {
    id: 'cc210984-7a1a-4c22-92bb-41a7d6e49a88',
    quote_no: 'EST-2026-0419',
    customer_name: 'Meera Nambiar',
    customer_phone: '+91 98450 11223',
    items_summary: '22K Antique Temple Haar (45g) + Matching Jhumkas (15g)',
    metal_type: 'Gold 22K (916)',
    gross_weight_g: 60.000,
    gold_rate_applied: 7850.00,
    making_charges: 42000.00,
    discount_amount: 5000.00,
    total_estimate: 523340.00,
    valid_until: '2026-11-01 18:00',
    is_rate_locked: true,
    status: 'OPEN',
    created_at: '2026-10-31 10:15 AM',
  },
  {
    id: 'cc210984-7a1a-4c22-92bb-41a7d6e49a89',
    quote_no: 'EST-2026-0418',
    customer_name: 'Vikram Singhania',
    customer_phone: '+91 97112 88441',
    items_summary: '18K Diamond Solitaire Engagement Ring (1.20 ct VVS)',
    metal_type: 'Gold 18K (750)',
    gross_weight_g: 5.200,
    gold_rate_applied: 6420.00,
    making_charges: 12000.00,
    discount_amount: 0.00,
    total_estimate: 215000.00,
    valid_until: '2026-10-31 20:00',
    is_rate_locked: true,
    status: 'OPEN',
    created_at: '2026-10-31 09:40 AM',
  },
  {
    id: 'cc210984-7a1a-4c22-92bb-41a7d6e49a90',
    quote_no: 'EST-2026-0417',
    customer_name: 'Sunita Joshi',
    customer_phone: '+91 98230 44512',
    items_summary: '22K Calcutta Lightweight Bangles (Set of 4)',
    metal_type: 'Gold 22K (916)',
    gross_weight_g: 48.000,
    gold_rate_applied: 7830.00,
    making_charges: 34560.00,
    discount_amount: 3000.00,
    total_estimate: 420360.00,
    valid_until: '2026-10-30 18:00',
    is_rate_locked: false,
    status: 'CONVERTED',
    created_at: '2026-10-29 04:20 PM',
  },
  {
    id: 'cc210984-7a1a-4c22-92bb-41a7d6e49a91',
    quote_no: 'EST-2026-0416',
    customer_name: 'Harish Chandra',
    customer_phone: '+91 94401 77219',
    items_summary: '999 Fine Silver Dinner Thali Set (850g)',
    metal_type: 'Fine Silver 999',
    gross_weight_g: 850.000,
    gold_rate_applied: 98.50,
    making_charges: 8500.00,
    discount_amount: 1000.00,
    total_estimate: 93960.00,
    valid_until: '2026-10-28 18:00',
    is_rate_locked: false,
    status: 'EXPIRED',
    created_at: '2026-10-27 11:30 AM',
  },
];

export function SalesQuotationsView() {
  const [quotations, setQuotations] = useState<QuotationItem[]>(INITIAL_QUOTATIONS);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<QuotationItem | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Form State
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [summary, setSummary] = useState('');
  const [metal, setMetal] = useState('Gold 22K (916)');
  const [grossWt, setGrossWt] = useState('');
  const [ratePerG, setRatePerG] = useState('7850');
  const [making, setMaking] = useState('12000');
  const [discount, setDiscount] = useState('0');
  const [validHours, setValidHours] = useState('24');

  const handleCreateQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    const wt = parseFloat(grossWt) || 0;
    const rate = parseFloat(ratePerG) || 7850;
    const mk = parseFloat(making) || 0;
    const disc = parseFloat(discount) || 0;
    const taxable = wt * rate + mk - disc;
    const gst = (taxable * 3) / 100;
    const grandTotal = Math.round(taxable + gst);

    const now = new Date();
    const expiry = new Date(now.getTime() + parseInt(validHours) * 60 * 60 * 1000);

    const newQ: QuotationItem = {
      id: `est-${quotations.length + 1}-${custName.slice(0, 3)}`,
      quote_no: `EST-2026-0${420 + quotations.length}`,
      customer_name: custName,
      customer_phone: custPhone,
      items_summary: summary,
      metal_type: metal,
      gross_weight_g: wt,
      gold_rate_applied: rate,
      making_charges: mk,
      discount_amount: disc,
      total_estimate: grandTotal,
      valid_until: expiry.toISOString().replace('T', ' ').slice(0, 16),
      is_rate_locked: true,
      status: 'OPEN',
      created_at: 'Just now',
    };

    setQuotations([newQ, ...quotations]);
    setIsAddModalOpen(false);
    setCustName('');
    setCustPhone('');
    setSummary('');
    setGrossWt('');
  };

  const handleConvertToPos = (quote: QuotationItem) => {
    const updated = quotations.map((q) =>
      q.id === quote.id ? { ...q, status: 'CONVERTED' as const } : q
    );
    setQuotations(updated);
    alert(`Quotation ${quote.quote_no} has been converted into active POS billing bill!`);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="sales_quotations" />
      <ActionToolbar
        filterPlaceholder="Filter by quotation #, customer, metal..."
        insertLabel="New Quotation"
        onInsertClick={() => setIsAddModalOpen(true)}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Open Estimates</span>
                <Clock className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">18 Quotes</div>
              <div className="text-[11px] text-blue-700 mt-1 font-mono">
                ₹ 48.20 Lakhs pipeline
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Conversion Rate</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700">64% Bills</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                Converted within 48h
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Expiring Today</span>
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-amber-700">4 Quotes</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Gold rate lock expires
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Avg Estimate</span>
                <BadgeIndianRupee className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">₹ 2,67,000</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Per walk-in quotation
              </div>
            </div>
          </div>
        </div>

        {/* Supabase-style Table */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">quotations</span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">Showing {quotations.length} price estimates</span>
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
                        <span className="text-neutral-800">quote_no</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">customer_name & phone</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">items_summary</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">gross_wt</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">rate_applied</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">total_estimate</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">valid_until</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">status</span>
                      </th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {quotations.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="w-10 px-3 py-2 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-[11px]">
                          <span
                            onClick={() => {
                              setSelectedQuote(row);
                              setIsPrintModalOpen(true);
                            }}
                            className="font-medium text-emerald-700 hover:underline cursor-pointer"
                          >
                            {row.quote_no}
                          </span>
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-medium text-neutral-800">
                          <div>{row.customer_name}</div>
                          <div className="text-[10px] text-neutral-400 font-normal">{row.customer_phone}</div>
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] max-w-xs truncate text-neutral-700">
                          {row.items_summary}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-right text-neutral-800">
                          {row.gross_weight_g.toFixed(3)} g
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-right text-neutral-600">
                          ₹ {row.gold_rate_applied.toLocaleString('en-IN')}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-right font-medium text-neutral-900">
                          ₹ {row.total_estimate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-[11px] text-neutral-600">
                          {row.valid_until}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              row.status === 'OPEN'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : row.status === 'CONVERTED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {row.status === 'OPEN' && (
                              <button
                                onClick={() => handleConvertToPos(row)}
                                className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-medium border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
                                title="1-Click Convert to POS Bill"
                              >
                                <span>Convert to Bill</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                window.open(`https://wa.me/?text=Quotation%20${row.quote_no}%20Total%20₹${row.total_estimate}`);
                              }}
                              className="p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                              title="Share on WhatsApp"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedQuote(row);
                                setIsPrintModalOpen(true);
                              }}
                              className="p-1 rounded text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
                              title="Print Estimate Slip"
                            >
                              <Printer className="w-3.5 h-3.5" />
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.quotations (
                  <br />
                  <span className="pl-6 text-blue-300">id</span> <span className="text-amber-300">uuid</span> <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">quote_no</span> <span className="text-amber-300">varchar(32)</span> <span className="text-neutral-400">UNIQUE NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">customer_name</span> <span className="text-amber-300">varchar(255)</span> <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">valid_until</span> <span className="text-amber-300">timestamp</span> <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">total_estimate</span> <span className="text-amber-300">numeric(10,2)</span> <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">status</span> <span className="text-amber-300">varchar(32)</span> <span className="text-neutral-400">DEFAULT &apos;OPEN&apos;</span>
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Quotation Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full border border-[#e2e8f0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">
                  Create New Price Quotation
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="e.g. Meera Nambiar"
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
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="+91 98450 11223"
                    className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">
                  Items Summary / Description
                </label>
                <input
                  type="text"
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="e.g. 22K Antique Temple Haar (45g) + Matching Jhumkas (15g)"
                  className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Metal Karat
                  </label>
                  <select
                    value={metal}
                    onChange={(e) => setMetal(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Gold 22K (916)">Gold 22K (916)</option>
                    <option value="Gold 24K (999)">Gold 24K (999)</option>
                    <option value="Gold 18K (750)">Gold 18K (750)</option>
                    <option value="Fine Silver 999">Fine Silver 999</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Gross Weight (g)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={grossWt}
                    onChange={(e) => setGrossWt(e.target.value)}
                    placeholder="25.000"
                    className="w-full px-3 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Rate (₹/g)
                  </label>
                  <input
                    type="number"
                    value={ratePerG}
                    onChange={(e) => setRatePerG(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Making Charges (₹)
                  </label>
                  <input
                    type="number"
                    value={making}
                    onChange={(e) => setMaking(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Festival Discount (₹)
                  </label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Rate Validity
                  </label>
                  <select
                    value={validHours}
                    onChange={(e) => setValidHours(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="12">12 Hours Lock</option>
                    <option value="24">24 Hours Lock</option>
                    <option value="48">48 Hours Lock</option>
                  </select>
                </div>
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
                  Generate Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Estimate Slip Modal */}
      {isPrintModalOpen && selectedQuote && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-[#e2e8f0] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">
                  Quotation Slip: {selectedQuote.quote_no}
                </h3>
              </div>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 font-mono text-xs text-neutral-800 space-y-3">
              <div className="text-center pb-2 border-b border-dashed border-neutral-300">
                <div className="font-medium text-sm text-neutral-900">
                  SRI LAKSHMI JEWELLERS & DIAMONDS
                </div>
                <div className="text-[11px] text-neutral-500">Price Estimate / Quotation Slip</div>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span>Quote #:</span>
                  <span className="font-medium">{selectedQuote.quote_no}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{selectedQuote.customer_name} ({selectedQuote.customer_phone})</span>
                </div>
                <div className="flex justify-between">
                  <span>Item:</span>
                  <span className="text-right max-w-[200px] truncate">{selectedQuote.items_summary}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gross Weight:</span>
                  <span>{selectedQuote.gross_weight_g.toFixed(3)} g</span>
                </div>
                <div className="flex justify-between">
                  <span>Rate Applied:</span>
                  <span>₹ {selectedQuote.gold_rate_applied.toLocaleString('en-IN')}/g</span>
                </div>
                <div className="flex justify-between">
                  <span>Valid Until:</span>
                  <span className="text-amber-700 font-medium">{selectedQuote.valid_until}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200 text-sm font-medium text-emerald-800">
                  <span>Total Estimated Price:</span>
                  <span>₹ {selectedQuote.total_estimate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded text-[10px] text-neutral-500 text-center leading-relaxed">
                * Note: Prices subject to bullion rate fluctuation after lock expiry timestamp.<br />
                * Present this quotation at billing counter for instant bill generation.
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#e5e7eb] bg-[#f8fafc] flex justify-end gap-2">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Estimate Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
