'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Receipt,
  FileText,
  Printer,
  Share2,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Copy,
  Check,
  Search,
  Plus,
  X,
  ExternalLink,
  Download,
  Eye,
  Filter,
  BadgeIndianRupee,
  Layers,
  ArrowUpDown,
  Send,
  Truck,
  Hash,
} from 'lucide-react';

interface SalesInvoice {
  id: string;
  invoice_number: string;
  invoice_type: 'B2C_RETAIL' | 'B2B_WHOLESALE';
  customer_name: string;
  customer_phone: string;
  customer_gstin?: string;
  invoice_date: string;
  gross_weight_g: number;
  net_weight_g: number;
  taxable_value: number;
  cgst_amount: number;
  sgst_amount: number;
  total_invoice_val: number;
  irn_hash: string;
  eway_bill_no?: string;
  status: 'PAID' | 'PARTIAL' | 'CANCELLED';
  items_summary: string;
}

const INITIAL_INVOICES: SalesInvoice[] = [
  {
    id: 'b5a28941-1122-48df-9e2b-f027163ba111',
    invoice_number: 'INV-26-0891',
    invoice_type: 'B2B_WHOLESALE',
    customer_name: 'Mahalakshmi Jewellers Ltd',
    customer_phone: '+91 98480 12345',
    customer_gstin: '36AAACB1234F1Z0',
    invoice_date: '2026-10-31',
    gross_weight_g: 52.400,
    net_weight_g: 50.120,
    taxable_value: 385000.00,
    cgst_amount: 5775.00,
    sgst_amount: 5775.00,
    total_invoice_val: 396550.00,
    irn_hash: '9f83a2c01948ba9e12089cf1823abce849201948201a9cbe120891238910c712',
    eway_bill_no: '241098234190',
    status: 'PAID',
    items_summary: '22K Calcutta Bangles (2 pairs), Temple Choker Set',
  },
  {
    id: 'b5a28941-1122-48df-9e2b-f027163ba112',
    invoice_number: 'INV-26-0890',
    invoice_type: 'B2C_RETAIL',
    customer_name: 'Priya Sharma',
    customer_phone: '+91 98451 22910',
    customer_gstin: '',
    invoice_date: '2026-10-31',
    gross_weight_g: 24.650,
    net_weight_g: 23.200,
    taxable_value: 200680.00,
    cgst_amount: 3010.20,
    sgst_amount: 3010.20,
    total_invoice_val: 206700.00,
    irn_hash: '4a1b8c2d91014efaa01e0129a8fbc0019201948201a9cbe120891238910c712',
    eway_bill_no: '',
    status: 'PAID',
    items_summary: '22K Antique Choker (HUID HD9128)',
  },
  {
    id: 'b5a28941-1122-48df-9e2b-f027163ba113',
    invoice_number: 'INV-26-0889',
    invoice_type: 'B2C_RETAIL',
    customer_name: 'Rajesh Varma',
    customer_phone: '+91 94401 88320',
    customer_gstin: '',
    invoice_date: '2026-10-30',
    gross_weight_g: 48.120,
    net_weight_g: 46.800,
    taxable_value: 404820.00,
    cgst_amount: 6072.30,
    sgst_amount: 6072.30,
    total_invoice_val: 416965.00,
    irn_hash: '8f3e2b1c77224bb3bc545231a7efd0029201948201a9cbe120891238910c712',
    eway_bill_no: '',
    status: 'PAID',
    items_summary: '22K Long Haram & Jhumka Set',
  },
  {
    id: 'b5a28941-1122-48df-9e2b-f027163ba114',
    invoice_number: 'INV-26-0888',
    invoice_type: 'B2B_WHOLESALE',
    customer_name: 'Srinivasa Bullion & Gems',
    customer_phone: '+91 98490 55667',
    customer_gstin: '36BBCDE5678G2Z1',
    invoice_date: '2026-10-30',
    gross_weight_g: 120.500,
    net_weight_g: 118.000,
    taxable_value: 926300.00,
    cgst_amount: 13894.50,
    sgst_amount: 13894.50,
    total_invoice_val: 954089.00,
    irn_hash: '77224bb3bc545231a7efd002b5a289419201948201a9cbe120891238910c712',
    eway_bill_no: '241098234191',
    status: 'PARTIAL',
    items_summary: 'Cast Gold Bars (100g) & Hollow Chains Lot',
  },
  {
    id: 'b5a28941-1122-48df-9e2b-f027163ba115',
    invoice_number: 'INV-26-0887',
    invoice_type: 'B2C_RETAIL',
    customer_name: 'Ananya Reddy',
    customer_phone: '+91 99882 12390',
    customer_gstin: '',
    invoice_date: '2026-10-29',
    gross_weight_g: 12.300,
    net_weight_g: 11.850,
    taxable_value: 102502.50,
    cgst_amount: 1537.54,
    sgst_amount: 1537.54,
    total_invoice_val: 105578.00,
    irn_hash: '1c9a6f4e334148cc98127482b6eda0039201948201a9cbe120891238910c712',
    eway_bill_no: '',
    status: 'PAID',
    items_summary: '18K Diamond Solitaire Ring (VVS1)',
  },
];

export function SalesInvoicesView() {
  const [invoices, setInvoices] = useState<SalesInvoice[]>(INITIAL_INVOICES);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Invoice for View Modal
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isEwayModalOpen, setIsEwayModalOpen] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (filterType !== 'ALL' && inv.invoice_type !== filterType) return false;
    if (filterStatus !== 'ALL' && inv.status !== filterStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchInv = inv.invoice_number.toLowerCase().includes(q);
      const matchCust = inv.customer_name.toLowerCase().includes(q);
      const matchGst = inv.customer_gstin?.toLowerCase().includes(q);
      const matchIrn = inv.irn_hash.toLowerCase().includes(q);
      if (!matchInv && !matchCust && !matchGst && !matchIrn) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="sales_invoices" />
      <ActionToolbar
        filterPlaceholder="Filter by invoice #, GSTIN, customer, IRN..."
        insertLabel="New Tax Invoice"
        onInsertClick={() => {}}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Invoices (Month)</span>
                <BadgeIndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">₹ 2.84 Cr</div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                882 GST invoices issued
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">B2C Retail</span>
                <Receipt className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">840 Bills</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                ₹ 2.12 Cr retail sales
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">B2B Wholesale</span>
                <Building2 className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">42 Invoices</div>
              <div className="text-[11px] text-purple-700 mt-1 font-mono">
                ₹ 72.40 Lakhs with GSTIN
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">E-Invoices Synced</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700">882 IRNs</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                NIC Portal 100% Synced
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-neutral-400 font-mono text-[11px]">Filters:</span>

              {/* Invoice Type */}
              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Type:</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Invoices</option>
                  <option value="B2C_RETAIL">B2C Retail</option>
                  <option value="B2B_WHOLESALE">B2B Wholesale</option>
                </select>
              </div>

              {/* Status */}
              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PAID">Paid</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search Invoice # / GSTIN..."
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
            {/* Table Header Info Bar */}
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  sales_invoices
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Showing {filteredInvoices.length} of {invoices.length} official tax records
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
                    <tr className="bg-[#fcfcfc] border-b border-[#e5e7eb] text-neutral-600 font-mono text-[11px]">
                      <th className="w-10 px-3 py-2 border-r border-[#e5e7eb] text-center">
                        <input
                          type="checkbox"
                          className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                        />
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">invoice_number</span>
                          <span className="text-neutral-400 font-normal text-[10px]">varchar</span>
                        </div>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">date</span>
                        </div>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">customer_name & gstin</span>
                        </div>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-neutral-800">taxable_value</span>
                          <span className="text-neutral-400 font-normal text-[10px]">inr</span>
                        </div>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-neutral-800">cgst (1.5%)</span>
                        </div>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-neutral-800">sgst (1.5%)</span>
                        </div>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-neutral-800">total_invoice_val</span>
                        </div>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">irn_hash</span>
                        </div>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">status</span>
                        </div>
                      </th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="w-10 px-3 py-2 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-[11px]">
                          <span
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setIsInvoiceModalOpen(true);
                            }}
                            className="font-medium text-emerald-700 hover:underline cursor-pointer"
                          >
                            {inv.invoice_number}
                          </span>
                          <span className="block text-[10px] text-neutral-400">
                            {inv.invoice_type === 'B2B_WHOLESALE' ? 'B2B Wholesale' : 'B2C Retail'}
                          </span>
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-neutral-600 text-[11px]">
                          {inv.invoice_date}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <div className="font-medium text-neutral-800">{inv.customer_name}</div>
                          {inv.customer_gstin ? (
                            <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1 py-0.2 rounded border border-purple-200">
                              GST: {inv.customer_gstin}
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {inv.customer_phone}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-right text-neutral-700">
                          ₹ {inv.taxable_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-right text-neutral-500">
                          ₹ {inv.cgst_amount.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-right text-neutral-500">
                          ₹ {inv.sgst_amount.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-right font-medium text-neutral-900">
                          ₹ {inv.total_invoice_val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-[11px] text-neutral-500">
                          <div className="flex items-center gap-1">
                            <span>{inv.irn_hash.slice(0, 8)}...{inv.irn_hash.slice(-6)}</span>
                            <button
                              onClick={() => copyToClipboard(inv.irn_hash, inv.id)}
                              className="text-neutral-400 hover:text-neutral-600"
                              title="Copy IRN Hash"
                            >
                              {copiedId === inv.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              inv.status === 'PAID'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setIsInvoiceModalOpen(true);
                              }}
                              className="p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                              title="Print A4 Tax Invoice"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                window.open(`https://wa.me/?text=Invoice%20${inv.invoice_number}%20Amount%20₹${inv.total_invoice_val}`);
                              }}
                              className="p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                              title="WhatsApp Invoice PDF"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                            {inv.eway_bill_no && (
                              <button
                                onClick={() => {
                                  setSelectedInvoice(inv);
                                  setIsEwayModalOpen(true);
                                }}
                                className="p-1 rounded text-neutral-500 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                                title="View E-Way Bill"
                              >
                                <Truck className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.sales_invoices (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">invoice_number</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">UNIQUE NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">customer_gstin</span>{' '}
                  <span className="text-amber-300">varchar(15)</span>{' '}
                  <span className="text-neutral-400">CHECK (customer_gstin IS NULL OR length(customer_gstin) = 15),</span>
                  <br />
                  <span className="pl-6 text-blue-300">taxable_value</span>{' '}
                  <span className="text-amber-300">numeric(12,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL CHECK (taxable_value &gt;= 0),</span>
                  <br />
                  <span className="pl-6 text-blue-300">cgst_amount</span>{' '}
                  <span className="text-amber-300">numeric(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">sgst_amount</span>{' '}
                  <span className="text-amber-300">numeric(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">total_invoice_val</span>{' '}
                  <span className="text-amber-300">numeric(12,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">irn_hash</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tax Invoice Full Preview Modal */}
      {isInvoiceModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full border border-[#e2e8f0] overflow-hidden my-8">
            <div className="px-5 py-3.5 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">
                  Tax Invoice: {selectedInvoice.invoice_number}
                </h3>
              </div>
              <button
                onClick={() => setIsInvoiceModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 font-mono text-xs text-neutral-800 space-y-4">
              <div className="text-center pb-3 border-b border-dashed border-neutral-300">
                <div className="text-base font-medium tracking-wider text-neutral-900">
                  SRI LAKSHMI JEWELLERS & DIAMONDS
                </div>
                <div className="text-[11px] text-neutral-600">
                  Plot 14, Pot Market, Secunderabad, Telangana - 500003
                </div>
                <div className="text-[11px] text-neutral-600">
                  GSTIN: 36AAACL8912P1ZS • State Code: 36 (Telangana)
                </div>
                <div className="text-[12px] font-medium text-emerald-700 mt-1">
                  TAX INVOICE ({selectedInvoice.invoice_type})
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-[11px] pb-3 border-b border-neutral-200">
                <div>
                  <div>Invoice #: <strong>{selectedInvoice.invoice_number}</strong></div>
                  <div>Date: <strong>{selectedInvoice.invoice_date}</strong></div>
                  <div>Place of Supply: <strong>Telangana (36)</strong></div>
                </div>
                <div className="text-right">
                  <div>Billed To: <strong>{selectedInvoice.customer_name}</strong></div>
                  {selectedInvoice.customer_gstin && (
                    <div>GSTIN: <strong>{selectedInvoice.customer_gstin}</strong></div>
                  )}
                  <div>Phone: <strong>{selectedInvoice.customer_phone}</strong></div>
                </div>
              </div>

              {/* Items summary */}
              <div className="py-2 border-b border-neutral-200">
                <div className="text-[11px] font-medium text-neutral-500 mb-1">PARTICULARS:</div>
                <div className="text-xs text-neutral-800">{selectedInvoice.items_summary}</div>
                <div className="text-[11px] text-neutral-500 mt-1">
                  Gross: {selectedInvoice.gross_weight_g.toFixed(3)}g • Net: {selectedInvoice.net_weight_g.toFixed(3)}g
                </div>
              </div>

              {/* GST Breakup */}
              <div className="space-y-1.5 text-[11px] text-right">
                <div className="flex justify-between">
                  <span>Taxable Value:</span>
                  <span className="font-mono">₹ {selectedInvoice.taxable_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>CGST (1.5%):</span>
                  <span className="font-mono">₹ {selectedInvoice.cgst_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>SGST (1.5%):</span>
                  <span className="font-mono">₹ {selectedInvoice.sgst_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-sm text-neutral-900 pt-2 border-t border-neutral-300">
                  <span>Total Invoice Value:</span>
                  <span className="font-mono">₹ {selectedInvoice.total_invoice_val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* IRN Barcode Box */}
              <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-md text-[10px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-700">Govt. E-Invoice Portal IRN Hash:</span>
                  <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    Digitally Signed
                  </span>
                </div>
                <div className="break-all text-neutral-500 font-mono">
                  {selectedInvoice.irn_hash}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-end gap-2">
              <button
                onClick={() => setIsInvoiceModalOpen(false)}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Tax Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* E-Way Bill Modal */}
      {isEwayModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-[#e2e8f0] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-medium text-neutral-900">
                  E-Way Bill Details
                </h3>
              </div>
              <button
                onClick={() => setIsEwayModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 font-mono text-xs space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-neutral-500">E-Way Bill #:</span>
                <span className="font-medium text-purple-700">{selectedInvoice.eway_bill_no}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-neutral-500">Related Invoice:</span>
                <span>{selectedInvoice.invoice_number}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-neutral-500">Transporter:</span>
                <span>BVC Logistics Valuables Courier</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-neutral-500">Vehicle / Tracking:</span>
                <span>SEC-VAL-8821 (Armored Van)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Validity:</span>
                <span>Valid until 02-Nov-2026 23:59</span>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#e5e7eb] bg-[#f8fafc] flex justify-end">
              <button
                onClick={() => setIsEwayModalOpen(false)}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
