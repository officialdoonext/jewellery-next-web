'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  TrendingUp,
  Receipt,
  Package,
  Users,
  Coins,
  ArrowUpRight,
  Plus,
  Table2,
  Copy,
  Check,
  Scale,
  ArrowRight,
} from 'lucide-react';
import { TabBar } from './TabBar';
import { ActionToolbar } from './ActionToolbar';

const LIVE_RATES = [
  { metal: 'Gold 24K (Pure 999)', rate: 8120, delta: '+20.00', unit: '/ gram', isUp: true, time: '09:30 AM' },
  { metal: 'Gold 22K (916 Hallmark)', rate: 7850, delta: '+18.50', unit: '/ gram', isUp: true, time: '09:30 AM' },
  { metal: 'Gold 18K (Jewellery 750)', rate: 6420, delta: '+15.00', unit: '/ gram', isUp: true, time: '09:30 AM' },
  { metal: 'Silver Fine (999)', rate: 98.50, delta: '+0.80', unit: '/ gram', isUp: true, time: '09:30 AM' },
];

const RECENT_TRANSACTIONS = [
  {
    id: '4a1b8c2d-9101-4efa-a01e-0129a8fbc001',
    bill_no: 'POS-2026-1042',
    customer: 'Priya Sharma',
    phone: '+91 98451 22910',
    item_category: '22K Temple Antique Haar',
    gross_wt: 24.650,
    net_wt: 23.200,
    gold_rate: 7850.00,
    making_charges: 18560.00,
    gst: 6012.30,
    grand_total: 206417.30,
    payment_mode: 'UPI + Card',
    status: 'PAID',
    huid: 'HD9128',
  },
  {
    id: '8f3e2b1c-7722-4bb3-bc54-5231a7efd002',
    bill_no: 'POS-2026-1043',
    customer: 'Rajesh Varma',
    phone: '+91 91984 98193',
    item_category: 'Bridal Kadas (Pair)',
    gross_wt: 48.120,
    net_wt: 46.800,
    gold_rate: 7850.00,
    making_charges: 37440.00,
    gst: 12145.20,
    grand_total: 416965.20,
    payment_mode: 'Old Gold + Cash',
    status: 'PAID',
    huid: 'AB8192',
  },
  {
    id: '1c9a6f4e-3341-48cc-9812-7482b6eda003',
    bill_no: 'POS-2026-1044',
    customer: 'Ananya Reddy',
    phone: '+91 91996 38156',
    item_category: 'Peacock Jhumkas 22K',
    gross_wt: 12.300,
    net_wt: 11.850,
    gold_rate: 7850.00,
    making_charges: 9480.00,
    gst: 3075.08,
    grand_total: 105577.58,
    payment_mode: 'Credit Card',
    status: 'PAID',
    huid: 'KL8210',
  },
  {
    id: '7b2c918a-4421-4d1a-bf47-79bcae01a892',
    bill_no: 'POS-2026-1045',
    customer: 'Gama Next',
    phone: '+91 91628 12883',
    item_category: 'Solitaire Diamond Ring 18K',
    gross_wt: 5.420,
    net_wt: 5.120,
    gold_rate: 6420.00,
    making_charges: 12500.00,
    gst: 4520.00,
    grand_total: 184500.00,
    payment_mode: 'Net Banking',
    status: 'PAID',
    huid: 'DF9012',
  },
  {
    id: '2d8a01f4-b521-4d9a-a829-10928bca9111',
    bill_no: 'POS-2026-1046',
    customer: 'Arumulla Siva Krishna',
    phone: '+91 91939 86383',
    item_category: 'Plain Gold Chain 22K',
    gross_wt: 16.200,
    net_wt: 16.200,
    gold_rate: 7850.00,
    making_charges: 8910.00,
    gst: 4082.40,
    grand_total: 140162.40,
    payment_mode: 'UPI',
    status: 'PAID',
    huid: 'ZX7712',
  },
  {
    id: '9e17c21a-adb8-4070-a56c-d6a7711dd732',
    bill_no: 'POS-2026-1047',
    customer: 'Sai Sri',
    phone: '+91 91903 26216',
    item_category: 'Gold Bangles 4 Pcs',
    gross_wt: 32.500,
    net_wt: 32.500,
    gold_rate: 7850.00,
    making_charges: 20800.00,
    gst: 8277.75,
    grand_total: 284202.75,
    payment_mode: 'Cheque Pending',
    status: 'PARTIAL',
    huid: 'NM4190',
  },
];

export function DashboardView() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      {/* Top Tab Bar (Supabase style) */}
      <TabBar title="live_retail_sales_today" />

      {/* Action Toolbar */}
      <ActionToolbar
        filterPlaceholder="Filter by invoice_id, customer, phone, metal, HUID... or ask AI"
        insertLabel="New POS Bill"
        onInsertClick={() => window.location.href = '/sales/billing-pos'}
      />

      {/* Scrollable Dashboard Body (Occupies full 100% width) */}
      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* Bullion Board Live Rates Ticker */}
        <div className="bg-white border-b border-[#e5e7eb] px-4 sm:px-6 py-2.5 w-full">
          <div className="w-full flex flex-col xl:flex-row xl:items-center justify-between gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-neutral-800 uppercase tracking-wider flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                Live Bullion Rates
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">IBJA Synced</span>
            </div>

            {/* Rate Ticker Chips */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 flex-1">
              {LIVE_RATES.map((rate, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-1.5 rounded-md bg-[#f8fafc] border border-[#e2e8f0] text-xs hover:border-emerald-300 transition-colors"
                >
                  <div className="truncate">
                    <div className="text-[10px] text-neutral-500 font-medium truncate">{rate.metal}</div>
                    <div className="font-mono font-medium text-neutral-900 text-[12px]">
                      ₹ {rate.rate.toLocaleString('en-IN')}{' '}
                      <span className="text-[10px] text-neutral-400 font-normal">{rate.unit}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded ml-1 shrink-0">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>{rate.delta}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Rates update link */}
            <Link
              href="/rates/gold-rates"
              className="text-[13px] font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 shrink-0"
            >
              <span>Update Board</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* KPI Metrics Summary Cards */}
        <div className="p-4 sm:p-6 bg-white border-b border-[#e5e7eb] w-full">
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 w-full">
              {/* Card 1 */}
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
                <div className="flex items-center justify-between text-neutral-500 text-xs mb-1">
                  <span>Today&apos;s Total Sales</span>
                  <Receipt className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl font-medium font-mono text-neutral-900">₹ 38,40,900</div>
                <div className="flex items-center gap-1.5 text-[13px] text-emerald-600 font-mono mt-1">
                  <span>+18.4% vs yesterday</span>
                  <span className="text-neutral-400">•</span>
                  <span className="text-neutral-500">48 Invoices</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
                <div className="flex items-center justify-between text-neutral-500 text-xs mb-1">
                  <span>Gold Weight Sold</span>
                  <Scale className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-xl font-medium font-mono text-neutral-900">489.120 g</div>
                <div className="flex items-center gap-1.5 text-[13px] text-neutral-500 font-mono mt-1">
                  <span>Pure Fine: 448.034 g</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
                <div className="flex items-center justify-between text-neutral-500 text-xs mb-1">
                  <span>Total Stock Valuation</span>
                  <Package className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-xl font-medium font-mono text-neutral-900">₹ 48.24 Cr</div>
                <div className="flex items-center gap-1.5 text-[13px] text-neutral-500 font-mono mt-1">
                  <span>Vault Safe: 48.2 kg</span>
                </div>
              </div>

              {/* Card 4 */}
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
                <div className="flex items-center justify-between text-neutral-500 text-xs mb-1">
                  <span>Customer Schemes</span>
                  <Users className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-xl font-medium font-mono text-neutral-900">342 Active</div>
                <div className="flex items-center gap-1.5 text-[13px] text-emerald-600 font-mono mt-1">
                  <span>₹ 34.2L monthly EMI</span>
                </div>
              </div>

              {/* Card 5 */}
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
                <div className="flex items-center justify-between text-neutral-500 text-xs mb-1">
                  <span>Custom Bridal Orders</span>
                  <Sparkles className="w-4 h-4 text-pink-500" />
                </div>
                <div className="text-xl font-medium font-mono text-neutral-900">14 Orders</div>
                <div className="flex items-center gap-1.5 text-[13px] text-amber-600 font-mono mt-1">
                  <span>3 Due for Wedding</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Supabase-style Data Table View: Live Sales Records (Auto Occupies 100% Full Width) */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 w-full">
          <div className="w-full bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            {/* Table Header Bar */}
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Table2 className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  pos_sales_transactions
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">Live retail point-of-sale invoices & counter transactions</span>
              </div>

              {/* Data / Definition toggle */}
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
                    <tr className="bg-[#fcfcfc] border-b border-[#e5e7eb] text-neutral-600 font-mono text-[13px]">
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
                          <span className="text-neutral-800">bill_no</span>
                          <span className="text-neutral-400 font-normal text-[10px]">varchar</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">customer</span>
                          <span className="text-neutral-400 font-normal text-[10px]">text</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">phone</span>
                          <span className="text-neutral-400 font-normal text-[10px]">text</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">ornament</span>
                          <span className="text-neutral-400 font-normal text-[10px]">varchar</span>
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
                          <span className="text-neutral-800">rate_per_g</span>
                          <span className="text-neutral-400 font-normal text-[10px]">numeric</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">making_charges</span>
                          <span className="text-neutral-400 font-normal text-[10px]">numeric</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">gst_3%</span>
                          <span className="text-neutral-400 font-normal text-[10px]">numeric</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">grand_total</span>
                          <span className="text-neutral-400 font-normal text-[10px]">numeric</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">payment</span>
                          <span className="text-neutral-400 font-normal text-[10px]">varchar</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">status</span>
                          <span className="text-neutral-400 font-normal text-[10px]">varchar</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb] font-mono text-neutral-800 text-[13px]">
                    {RECENT_TRANSACTIONS.map((row) => (
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

                        {/* ID Column with Copy icon */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <div className="flex items-center gap-1.5 group/cell">
                            <span className="truncate max-w-[100px] text-neutral-500 font-mono">
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

                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium text-emerald-700 whitespace-nowrap">
                          {row.bill_no}
                        </td>

                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium text-neutral-900 whitespace-nowrap">
                          {row.customer}
                        </td>

                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] text-neutral-600 whitespace-nowrap">
                          {row.phone}
                        </td>

                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] text-neutral-700 whitespace-nowrap">
                          {row.item_category}
                        </td>

                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] text-neutral-800 whitespace-nowrap">
                          {row.gross_wt.toFixed(3)} g
                        </td>

                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium text-neutral-900 whitespace-nowrap">
                          {row.net_wt.toFixed(3)} g
                        </td>

                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] text-neutral-700 whitespace-nowrap">
                          ₹ {row.gold_rate.toLocaleString('en-IN')}
                        </td>

                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] text-neutral-700 whitespace-nowrap">
                          ₹ {row.making_charges.toLocaleString('en-IN')}
                        </td>

                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] text-neutral-700 whitespace-nowrap">
                          ₹ {row.gst.toLocaleString('en-IN')}
                        </td>

                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium text-neutral-900 whitespace-nowrap">
                          ₹ {row.grand_total.toLocaleString('en-IN')}
                        </td>

                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] text-neutral-600 whitespace-nowrap">
                          {row.payment_mode}
                        </td>

                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              row.status === 'PAID'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.pos_sales_transactions (
                  <br />
                  &nbsp;&nbsp;id <span className="text-amber-300">uuid</span> PRIMARY KEY DEFAULT gen_random_uuid(),
                  <br />
                  &nbsp;&nbsp;bill_no <span className="text-amber-300">varchar(32)</span> UNIQUE NOT NULL,
                  <br />
                  &nbsp;&nbsp;customer_id <span className="text-amber-300">uuid</span> REFERENCES public.customers(id),
                  <br />
                  &nbsp;&nbsp;gross_weight_g <span className="text-amber-300">numeric(10,3)</span> NOT NULL,
                  <br />
                  &nbsp;&nbsp;net_weight_g <span className="text-amber-300">numeric(10,3)</span> NOT NULL,
                  <br />
                  &nbsp;&nbsp;gold_rate_per_g <span className="text-amber-300">numeric(10,2)</span> NOT NULL,
                  <br />
                  &nbsp;&nbsp;making_charges <span className="text-amber-300">numeric(10,2)</span> NOT NULL,
                  <br />
                  &nbsp;&nbsp;gst_amount <span className="text-amber-300">numeric(10,2)</span> NOT NULL,
                  <br />
                  &nbsp;&nbsp;grand_total <span className="text-amber-300">numeric(12,2)</span> NOT NULL,
                  <br />
                  &nbsp;&nbsp;payment_status <span className="text-amber-300">varchar(20)</span> DEFAULT &apos;PAID&apos;
                  <br />
                  );
                </div>
              </div>
            )}

            {/* Supabase Table Footer Bar */}
            <div className="h-[36px] bg-[#f8fafc] border-t border-[#e5e7eb] px-3.5 flex items-center justify-between text-[13px] text-neutral-500 font-mono select-none w-full">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span>Page</span>
                  <span className="px-1.5 py-0.5 bg-white border border-[#e2e8f0] rounded text-neutral-800 font-medium">
                    1
                  </span>
                  <span>of 1</span>
                </div>
                <span>•</span>
                <span>100 rows</span>
                <span>•</span>
                <span>6 records today</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live Sync Connected
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
