'use client';

import React, { useState, useMemo } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  FileText,
  Receipt,
  Scale,
  Award,
  Coins,
  Search,
  Filter,
  Eye,
  Printer,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  X,
  Plus,
  QrCode,
  Download,
  Share2,
  ArrowUpDown,
  Check,
  Copy,
} from 'lucide-react';

interface PurchaseInvoiceRecord {
  id: string;
  invoice_no: string;
  date: string;
  customer_name: string;
  customer_phone: string;
  transaction_type: 'TAX_INVOICE' | 'EXCHANGE_BILL' | 'REPAIR_JOB' | 'SCHEME_REDEMPTION';
  items_summary: string;
  huid: string;
  gross_weight_g: number;
  net_weight_g: number;
  making_charges: number;
  gst_amount: number;
  total_paid: number;
  payment_mode: string;
  guarantee_card_reissued: boolean;
  status: 'PAID' | 'PARTIAL' | 'REFUNDED';
}

const INITIAL_PURCHASES: PurchaseInvoiceRecord[] = [
  {
    id: '66778899-f6a1-b2c3-d4e5-990011223344',
    invoice_no: 'POS-2026-0812',
    date: '2026-08-15',
    customer_name: 'Sridevi Rao',
    customer_phone: '+91 98451 23456',
    transaction_type: 'TAX_INVOICE',
    items_summary: '22K Temple Antique Haar (48.200g, Uncut Zambian Emeralds)',
    huid: 'HD99281A',
    gross_weight_g: 48.2,
    net_weight_g: 45.1,
    making_charges: 38560.0,
    gst_amount: 10350.0,
    total_paid: 345000.0,
    payment_mode: 'UPI + Credit Card',
    guarantee_card_reissued: true,
    status: 'PAID',
  },
  {
    id: '66778899-f6a1-b2c3-d4e5-990011223345',
    invoice_no: 'POS-2026-0801',
    date: '2026-08-10',
    customer_name: 'Venkat Raman',
    customer_phone: '+91 97412 89012',
    transaction_type: 'EXCHANGE_BILL',
    items_summary: '24K MMTC-PAMP Lotus Gold Bar (20.000g) [Old 22K Melted Exchanged]',
    huid: 'BULLION-009',
    gross_weight_g: 20.0,
    net_weight_g: 20.0,
    making_charges: 2400.0,
    gst_amount: 4854.0,
    total_paid: 161800.0,
    payment_mode: 'Old Gold Exchange + Cash',
    guarantee_card_reissued: false,
    status: 'PAID',
  },
  {
    id: '66778899-f6a1-b2c3-d4e5-990011223346',
    invoice_no: 'POS-2026-0742',
    date: '2026-07-28',
    customer_name: 'Meera Nambiar',
    customer_phone: '+91 94471 67890',
    transaction_type: 'TAX_INVOICE',
    items_summary: '22K Kerala Palakka Traditional Choker (32.400g)',
    huid: 'PK77182C',
    gross_weight_g: 32.4,
    net_weight_g: 29.8,
    making_charges: 28400.0,
    gst_amount: 7620.0,
    total_paid: 254000.0,
    payment_mode: 'Net Banking (RTGS)',
    guarantee_card_reissued: false,
    status: 'PAID',
  },
  {
    id: '66778899-f6a1-b2c3-d4e5-990011223347',
    invoice_no: 'POS-2026-0690',
    date: '2026-07-14',
    customer_name: 'Dr. Mohan Krishna',
    customer_phone: '+91 94401 55667',
    transaction_type: 'TAX_INVOICE',
    items_summary: '22K Men Navaratna Kada & Ring Set (52.600g)',
    huid: 'NV44190D',
    gross_weight_g: 52.6,
    net_weight_g: 48.0,
    making_charges: 42080.0,
    gst_amount: 12480.0,
    total_paid: 416000.0,
    payment_mode: 'Cheque Clearance',
    guarantee_card_reissued: false,
    status: 'PAID',
  },
  {
    id: '66778899-f6a1-b2c3-d4e5-990011223348',
    invoice_no: 'POS-2026-0610',
    date: '2026-06-25',
    customer_name: 'Ananya Reddy',
    customer_phone: '+91 91008 34567',
    transaction_type: 'SCHEME_REDEMPTION',
    items_summary: '22K Floral Kada Pair with Screw Lock (38.500g)',
    huid: 'KD11928F',
    gross_weight_g: 38.5,
    net_weight_g: 37.2,
    making_charges: 0.0, // 100% waiver via Suvarna Nidhi Scheme
    gst_amount: 8250.0,
    total_paid: 275000.0,
    payment_mode: 'Scheme Maturity Voucher (100%)',
    guarantee_card_reissued: true,
    status: 'PAID',
  },
  {
    id: '66778899-f6a1-b2c3-d4e5-990011223349',
    invoice_no: 'POS-2026-0534',
    date: '2026-05-18',
    customer_name: 'Priya Sharma',
    customer_phone: '+91 98112 33445',
    transaction_type: 'TAX_INVOICE',
    items_summary: '18K Diamond Solitaire Ring 3.800g (0.75ct VVS/EF)',
    huid: 'DM33991S',
    gross_weight_g: 3.8,
    net_weight_g: 3.65,
    making_charges: 14500.0,
    gst_amount: 6192.0,
    total_paid: 206400.0,
    payment_mode: 'Credit Card (EMI)',
    guarantee_card_reissued: false,
    status: 'PAID',
  },
  {
    id: '66778899-f6a1-b2c3-d4e5-990011223350',
    invoice_no: 'REP-2026-0088',
    date: '2026-04-12',
    customer_name: 'Lalitha Devi',
    customer_phone: '+91 98865 44321',
    transaction_type: 'REPAIR_JOB',
    items_summary: 'Antique Gold Necklace Solder, Prong Re-tipping & Rhodium Dip',
    huid: 'REPAIR-NA',
    gross_weight_g: 28.5,
    net_weight_g: 28.5,
    making_charges: 4500.0,
    gst_amount: 810.0,
    total_paid: 5310.0,
    payment_mode: 'Cash',
    guarantee_card_reissued: false,
    status: 'PAID',
  },
];

export function CustomersPurchaseHistoryView() {
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [invoices, setInvoices] = useState<PurchaseInvoiceRecord[]>(INITIAL_PURCHASES);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('ALL');

  // Modals
  const [selectedInvoiceForPDF, setSelectedInvoiceForPDF] = useState<PurchaseInvoiceRecord | null>(null);
  const [selectedInvoiceForGuarantee, setSelectedInvoiceForGuarantee] = useState<PurchaseInvoiceRecord | null>(null);
  const [emailAlertSuccess, setEmailAlertSuccess] = useState<string | null>(null);
  const [isManualBillOpen, setIsManualBillOpen] = useState(false);

  // Manual bill form
  const [formCustName, setFormCustName] = useState('');
  const [formCustPhone, setFormCustPhone] = useState('');
  const [formBillNo, setFormBillNo] = useState(`POS-2026-0${invoices.length + 813}`);
  const [formItemDesc, setFormItemDesc] = useState('');
  const [formGrossWt, setFormGrossWt] = useState('24.500');
  const [formNetWt, setFormNetWt] = useState('23.800');
  const [formMaking, setFormMaking] = useState('18000');
  const [formTotal, setFormTotal] = useState('195000');

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (typeFilter !== 'ALL' && inv.transaction_type !== typeFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const mInv = inv.invoice_no.toLowerCase().includes(q);
        const mName = inv.customer_name.toLowerCase().includes(q);
        const mItem = inv.items_summary.toLowerCase().includes(q);
        const mHuid = inv.huid.toLowerCase().includes(q);
        if (!mInv && !mName && !mItem && !mHuid) return false;
      }
      return true;
    });
  }, [invoices, typeFilter, searchQuery]);

  const handleSendEmail = (inv: PurchaseInvoiceRecord) => {
    setEmailAlertSuccess(`Tax invoice ${inv.invoice_no} dispatched to customer email address.`);
    setTimeout(() => setEmailAlertSuccess(null), 3000);
  };

  const handleCreateManualBill = (e: React.FormEvent) => {
    e.preventDefault();
    const newBill: PurchaseInvoiceRecord = {
      id: crypto.randomUUID ? crypto.randomUUID() : `inv-${Date.now()}`,
      invoice_no: formBillNo,
      date: new Date().toISOString().split('T')[0],
      customer_name: formCustName || 'Counter Walk-in',
      customer_phone: formCustPhone || '+91 90000 00000',
      transaction_type: 'TAX_INVOICE',
      items_summary: formItemDesc || '22K Gold Handcrafted Ornament',
      huid: `BIS-${Math.floor(100000 + Math.random() * 900000)}`,
      gross_weight_g: parseFloat(formGrossWt) || 10,
      net_weight_g: parseFloat(formNetWt) || 9.5,
      making_charges: parseFloat(formMaking) || 5000,
      gst_amount: Math.round((parseFloat(formTotal) || 50000) * 0.03),
      total_paid: parseFloat(formTotal) || 50000,
      payment_mode: 'UPI / Cash',
      guarantee_card_reissued: false,
      status: 'PAID',
    };
    setInvoices([newBill, ...invoices]);
    setIsManualBillOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="customers_purchase_history" />
      <ActionToolbar
        filterPlaceholder="Search by invoice #, customer name, HUID, or item..."
        insertLabel="Record Offline Bill"
        onInsertClick={() => setIsManualBillOpen(true)}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* Toast Alert for Email */}
        {emailAlertSuccess && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> {emailAlertSuccess}
            </span>
            <button onClick={() => setEmailAlertSuccess(null)} className="hover:opacity-80">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* KPI Metrics Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Invoices Issued</span>
                <Receipt className="w-3.5 h-3.5 text-neutral-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">4,890 Bills</div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                100% GST E-Invoice Synced
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Sales Turnover</span>
                <Coins className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">₹ 24.8 Cr</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Lifetime Patrons Volume
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-purple-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Reissued Guarantee Cards</span>
                <Award className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-xl font-medium text-purple-800 font-mono">42 Cards</div>
              <div className="text-[11px] text-purple-600 mt-1 font-mono">
                HUID Hallmark & Purity Re-cert
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Old Gold Exchanged</span>
                <Scale className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-amber-700 font-mono">184.200 kg</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Settled towards new purchases
              </div>
            </div>
          </div>

          {/* Quick Filter Bar */}
          <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by bill #, customer, or HUID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-white border border-[#e2e8f0] rounded-md text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-emerald-500 w-64"
                />
              </div>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Type:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Transactions</option>
                  <option value="TAX_INVOICE">Tax Invoice</option>
                  <option value="EXCHANGE_BILL">Old Gold Exchange Bill</option>
                  <option value="SCHEME_REDEMPTION">Scheme Redemption</option>
                  <option value="REPAIR_JOB">Repair & Polish Job</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Period:</span>
                <select
                  value={dateRangeFilter}
                  onChange={(e) => setDateRangeFilter(e.target.value)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Time</option>
                  <option value="FY26">FY 2026 - 2027</option>
                  <option value="FY25">FY 2025 - 2026</option>
                  <option value="M30">Last 30 Days</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsManualBillOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Record Offline Bill
              </button>
            </div>
          </div>
        </div>

        {/* Supabase-style Table */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="border border-[#e2e8f0] rounded-lg bg-white overflow-hidden shadow-2xs flex flex-col flex-1">
            {/* Header */}
            <div className="h-10 bg-[#f8fafc] border-b border-[#e2e8f0] px-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('data')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    activeTab === 'data'
                      ? 'bg-white text-neutral-900 shadow-2xs border border-[#e2e8f0]'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Purchase Timeline ({filteredInvoices.length})
                </button>
                <button
                  onClick={() => setActiveTab('definition')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    activeTab === 'definition'
                      ? 'bg-white text-neutral-900 shadow-2xs border border-[#e2e8f0]'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Definition (DDL)
                </button>
              </div>
              <div className="text-[11px] text-neutral-400 font-mono">
                public.customer_orders_history • 12 columns
              </div>
            </div>

            {/* Table Content: Data Tab */}
            {activeTab === 'data' && (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-neutral-600 font-mono text-[11px]">
                      <th className="w-10 px-3 py-2 border-r border-[#e5e7eb] text-center">
                        <input type="checkbox" className="rounded border-neutral-300 text-emerald-600 focus:ring-0" />
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">invoice_no</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">date</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">customer</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium">
                        <span className="text-neutral-800">items_purchased_summary</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">gross_wt</span>
                        <span className="text-neutral-400 font-normal text-[10px] ml-1">g</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">net_wt</span>
                        <span className="text-neutral-400 font-normal text-[10px] ml-1">g</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">making_charges</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">total_paid</span>
                        <span className="text-neutral-400 font-normal text-[10px] ml-1">inr</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">payment_mode</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">status</span>
                      </th>
                      <th className="px-3.5 py-2 font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {filteredInvoices.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="px-3 py-2 text-center border-r border-[#e5e7eb]">
                          <input type="checkbox" className="rounded border-neutral-300 text-emerald-600 focus:ring-0" />
                        </td>
                        <td className="px-3.5 py-2 font-mono text-emerald-700 font-medium border-r border-[#e5e7eb] whitespace-nowrap">
                          {row.invoice_no}
                          <span className="text-[10px] text-neutral-400 block font-normal">HUID: {row.huid}</span>
                        </td>
                        <td className="px-3.5 py-2 font-mono text-neutral-600 border-r border-[#e5e7eb] whitespace-nowrap">
                          {row.date}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <div className="font-medium text-neutral-900">{row.customer_name}</div>
                          <span className="text-[10px] text-neutral-400 font-mono block">{row.customer_phone}</span>
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] text-neutral-800 max-w-xs">
                          <div className="line-clamp-2">{row.items_summary}</div>
                          {row.guarantee_card_reissued && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-purple-700 font-medium bg-purple-50 px-1 rounded mt-0.5 border border-purple-200">
                              <Award className="w-2.5 h-2.5" /> Guarantee Re-issued
                            </span>
                          )}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-right text-neutral-800 border-r border-[#e5e7eb] whitespace-nowrap">
                          {row.gross_weight_g.toFixed(3)} g
                        </td>
                        <td className="px-3.5 py-2 font-mono text-right text-amber-700 border-r border-[#e5e7eb] whitespace-nowrap">
                          {row.net_weight_g.toFixed(3)} g
                        </td>
                        <td className="px-3.5 py-2 font-mono text-right text-neutral-700 border-r border-[#e5e7eb] whitespace-nowrap">
                          ₹ {row.making_charges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-right font-medium text-neutral-900 border-r border-[#e5e7eb] whitespace-nowrap">
                          ₹ {row.total_paid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3.5 py-2 text-neutral-600 border-r border-[#e5e7eb] whitespace-nowrap text-[11px]">
                          {row.payment_mode}
                        </td>
                        <td className="px-3.5 py-2 text-center border-r border-[#e5e7eb] whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {row.status}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setSelectedInvoiceForPDF(row)}
                              className="p-1 hover:bg-neutral-100 rounded text-neutral-600 hover:text-emerald-700 transition-colors"
                              title="View Tax Invoice"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setSelectedInvoiceForGuarantee(row)}
                              className="p-1 hover:bg-purple-50 rounded text-neutral-600 hover:text-purple-700 transition-colors"
                              title="Re-issue Guarantee Certificate"
                            >
                              <Award className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleSendEmail(row)}
                              className="p-1 hover:bg-blue-50 rounded text-neutral-600 hover:text-blue-700 transition-colors"
                              title="Email Invoice to Patron"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.customer_orders_history (
                  <br />
                  &nbsp;&nbsp;id <span className="text-blue-300">uuid</span> PRIMARY KEY DEFAULT gen_random_uuid(),
                  <br />
                  &nbsp;&nbsp;invoice_no <span className="text-blue-300">varchar(50)</span> NOT NULL UNIQUE,
                  <br />
                  &nbsp;&nbsp;customer_name <span className="text-blue-300">varchar(255)</span> NOT NULL,
                  <br />
                  &nbsp;&nbsp;customer_phone <span className="text-blue-300">varchar(20)</span>,
                  <br />
                  &nbsp;&nbsp;transaction_type <span className="text-blue-300">varchar(50)</span> DEFAULT &apos;TAX_INVOICE&apos;,
                  <br />
                  &nbsp;&nbsp;items_summary <span className="text-blue-300">text</span> NOT NULL,
                  <br />
                  &nbsp;&nbsp;huid <span className="text-blue-300">varchar(50)</span>,
                  <br />
                  &nbsp;&nbsp;gross_weight_g <span className="text-blue-300">numeric(10,3)</span> NOT NULL,
                  <br />
                  &nbsp;&nbsp;net_weight_g <span className="text-blue-300">numeric(10,3)</span> NOT NULL,
                  <br />
                  &nbsp;&nbsp;making_charges <span className="text-blue-300">numeric(10,2)</span> DEFAULT 0.00,
                  <br />
                  &nbsp;&nbsp;gst_amount <span className="text-blue-300">numeric(10,2)</span> NOT NULL,
                  <br />
                  &nbsp;&nbsp;total_paid <span className="text-blue-300">numeric(12,2)</span> NOT NULL,
                  <br />
                  &nbsp;&nbsp;purchased_at <span className="text-blue-300">date</span> DEFAULT CURRENT_DATE
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tax Invoice Modal */}
      {selectedInvoiceForPDF && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-lg shadow-2xl border border-[#e2e8f0] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">Tax Invoice: {selectedInvoiceForPDF.invoice_no}</h3>
              </div>
              <button
                onClick={() => setSelectedInvoiceForPDF(null)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="border border-[#e2e8f0] rounded p-3 bg-[#fafafa] flex justify-between items-start">
                <div>
                  <div className="text-[11px] text-neutral-500 uppercase tracking-wider">Billed To</div>
                  <div className="font-medium text-neutral-900 text-sm mt-0.5">{selectedInvoiceForPDF.customer_name}</div>
                  <div className="text-neutral-500 font-mono text-[11px]">{selectedInvoiceForPDF.customer_phone}</div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-neutral-500">Invoice Date:</span>
                  <div className="font-mono text-neutral-900 font-medium">{selectedInvoiceForPDF.date}</div>
                  <div className="text-[10px] text-emerald-700 font-mono mt-0.5">GST 3% Paid</div>
                </div>
              </div>

              <div className="border border-[#e2e8f0] rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f8fafc] border-b border-[#e2e8f0] text-neutral-600 font-mono text-[11px]">
                    <tr>
                      <th className="p-2 border-r border-[#e5e7eb]">Description</th>
                      <th className="p-2 border-r border-[#e5e7eb] text-right">Gross Wt</th>
                      <th className="p-2 border-r border-[#e5e7eb] text-right">Net Wt</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#f1f5f9]">
                      <td className="p-2 border-r border-[#e5e7eb] text-neutral-800">
                        {selectedInvoiceForPDF.items_summary}
                        <span className="block text-[10px] text-neutral-400 font-mono">HUID: {selectedInvoiceForPDF.huid}</span>
                      </td>
                      <td className="p-2 border-r border-[#e5e7eb] font-mono text-right">
                        {selectedInvoiceForPDF.gross_weight_g.toFixed(3)}g
                      </td>
                      <td className="p-2 border-r border-[#e5e7eb] font-mono text-right text-amber-700">
                        {selectedInvoiceForPDF.net_weight_g.toFixed(3)}g
                      </td>
                      <td className="p-2 font-mono text-right text-neutral-900 font-medium">
                        ₹ {selectedInvoiceForPDF.total_paid.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between text-neutral-600">
                  <span>Making Charges:</span>
                  <span>₹ {selectedInvoiceForPDF.making_charges.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>GST Breakup (CGST 1.5% + SGST 1.5%):</span>
                  <span>₹ {selectedInvoiceForPDF.gst_amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-medium text-neutral-900 border-t border-[#e2e8f0] pt-1.5 text-xs">
                  <span>Grand Total Paid:</span>
                  <span>₹ {selectedInvoiceForPDF.total_paid.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Invoice
                </button>
                <button
                  onClick={() => setSelectedInvoiceForPDF(null)}
                  className="px-4 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guarantee Certificate Re-issue Modal */}
      {selectedInvoiceForGuarantee && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl border border-purple-200 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-purple-100 flex items-center justify-between bg-purple-50/50">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-medium text-purple-950">Official Certificate of Authenticity & Guarantee</h3>
              </div>
              <button
                onClick={() => setSelectedInvoiceForGuarantee(null)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-purple-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-4 rounded-lg border border-purple-200 bg-[#fdfcff] space-y-3">
                <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                  <div>
                    <span className="text-[10px] text-purple-600 uppercase tracking-widest font-mono">JEWELLERY NEXT GUARANTEE</span>
                    <h4 className="text-xs font-medium text-neutral-900 mt-0.5">{selectedInvoiceForGuarantee.items_summary}</h4>
                  </div>
                  <div className="p-2 rounded bg-white border border-purple-200">
                    <QrCode className="w-8 h-8 text-purple-700" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-neutral-700 text-[11px]">
                  <div>
                    <span className="text-neutral-400 block">BIS Hallmark HUID:</span>
                    <span className="font-mono font-medium text-purple-800 text-xs">{selectedInvoiceForGuarantee.huid}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Purity Guaranteed:</span>
                    <span className="font-mono font-medium text-emerald-700 text-xs">22K (91.67% Fine Gold)</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Gross Weight:</span>
                    <span className="font-mono text-neutral-900">{selectedInvoiceForGuarantee.gross_weight_g.toFixed(3)} g</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Net Gold Weight:</span>
                    <span className="font-mono text-neutral-900">{selectedInvoiceForGuarantee.net_weight_g.toFixed(3)} g</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-purple-50/70 border border-purple-200 text-[10px] text-purple-900 leading-relaxed">
                  ✓ Lifetime 100% buyback guarantee on gold weight at prevailing market rate.<br />
                  ✓ Complimentary ultrasonic cleaning and prong security checks at any store.
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Card
                </button>
                <button
                  onClick={() => {
                    selectedInvoiceForGuarantee.guarantee_card_reissued = true;
                    setSelectedInvoiceForGuarantee(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" /> Confirm Reissue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Offline Bill Drawer */}
      {isManualBillOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-[#e2e8f0] animate-in slide-in-from-right duration-200">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div>
                <h3 className="text-sm font-medium text-neutral-900">Record Offline POS Bill</h3>
                <p className="text-[11px] text-neutral-500">Record historical or counter offline jewellery purchase</p>
              </div>
              <button
                onClick={() => setIsManualBillOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManualBill} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-xs">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sridevi Rao"
                  value={formCustName}
                  onChange={(e) => setFormCustName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Customer Phone</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98451 23456"
                  value={formCustPhone}
                  onChange={(e) => setFormCustPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Item Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 22K Lakshmi Kasu Necklace"
                  value={formItemDesc}
                  onChange={(e) => setFormItemDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Gross Wt (g)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formGrossWt}
                    onChange={(e) => setFormGrossWt(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Net Wt (g)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formNetWt}
                    onChange={(e) => setFormNetWt(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Making Charges (₹)</label>
                  <input
                    type="number"
                    value={formMaking}
                    onChange={(e) => setFormMaking(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Total Paid (₹)</label>
                  <input
                    type="number"
                    value={formTotal}
                    onChange={(e) => setFormTotal(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualBillOpen(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" /> Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
