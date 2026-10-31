'use client';

import React, { useState, useMemo } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  ShoppingBag,
  Coins,
  Package,
  CreditCard,
  Receipt,
  Plus,
  X,
  ShieldCheck,
  Check,
  ArrowUpDown,
  Filter,
  Eye,
  FileSpreadsheet,
  FileText,
  Building2,
  Calendar,
  Percent,
  Scale,
  Hash,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  QrCode,
  Layers,
} from 'lucide-react';

interface PurchaseInwardBill {
  id: string;
  purchase_inv_no: string;
  supplier_name: string;
  supplier_category: 'BULLION_REFINERY' | 'WHOLESALE_MANUFACTURER' | 'CASTING_HOUSE';
  purchase_category: 'BULLION_BAR' | 'FINISHED_ORNAMENTS';
  supplier_inv_date: string;
  rate_fix_date: string;
  gross_weight_g: number;
  purity_percent: number;
  pure_gold_g: number;
  gold_rate_per_g: number;
  taxable_value: number;
  gst_amount: number;
  grand_total: number;
  rcm_applicable: boolean;
  payment_terms: 'NET_15' | 'NET_30' | 'IMMEDIATE';
  payment_status: 'PAID' | 'PARTIAL' | 'UNPAID';
  auto_tag_generated: boolean;
}

const INITIAL_PURCHASES: PurchaseInwardBill[] = [
  {
    id: '88990011-2233-4455-6677-112233445566',
    purchase_inv_no: 'PUR-26-042',
    supplier_name: 'Shree Bullion Refinery',
    supplier_category: 'BULLION_REFINERY',
    purchase_category: 'BULLION_BAR',
    supplier_inv_date: '2026-10-28',
    rate_fix_date: '2026-10-28',
    gross_weight_g: 1000.000,
    purity_percent: 99.90,
    pure_gold_g: 999.000,
    gold_rate_per_g: 8090.00,
    taxable_value: 8090000.00,
    gst_amount: 242700.00,
    grand_total: 8332700.00,
    rcm_applicable: false,
    payment_terms: 'NET_15',
    payment_status: 'PARTIAL',
    auto_tag_generated: true,
  },
  {
    id: '88990011-2233-4455-6677-112233445567',
    purchase_inv_no: 'PUR-26-043',
    supplier_name: 'Mangalore Casting Works',
    supplier_category: 'CASTING_HOUSE',
    purchase_category: 'FINISHED_ORNAMENTS',
    supplier_inv_date: '2026-10-29',
    rate_fix_date: '2026-10-29',
    gross_weight_g: 450.250,
    purity_percent: 91.67,
    pure_gold_g: 412.744,
    gold_rate_per_g: 7850.00,
    taxable_value: 3240040.40,
    gst_amount: 97201.21,
    grand_total: 3337241.61,
    rcm_applicable: false,
    payment_terms: 'NET_30',
    payment_status: 'UNPAID',
    auto_tag_generated: true,
  },
  {
    id: '88990011-2233-4455-6677-112233445568',
    purchase_inv_no: 'PUR-26-044',
    supplier_name: 'Apex Jewellery Works',
    supplier_category: 'WHOLESALE_MANUFACTURER',
    purchase_category: 'FINISHED_ORNAMENTS',
    supplier_inv_date: '2026-10-26',
    rate_fix_date: '2026-10-25',
    gross_weight_g: 191.900,
    purity_percent: 91.67,
    pure_gold_g: 175.915,
    gold_rate_per_g: 7820.00,
    taxable_value: 1375655.30,
    gst_amount: 41269.66,
    grand_total: 1416924.96,
    rcm_applicable: false,
    payment_terms: 'NET_15',
    payment_status: 'PAID',
    auto_tag_generated: true,
  },
  {
    id: '88990011-2233-4455-6677-112233445569',
    purchase_inv_no: 'PUR-26-045',
    supplier_name: 'MMTC-PAMP India Ltd',
    supplier_category: 'BULLION_REFINERY',
    purchase_category: 'BULLION_BAR',
    supplier_inv_date: '2026-10-30',
    rate_fix_date: '2026-10-30',
    gross_weight_g: 1500.000,
    purity_percent: 99.99,
    pure_gold_g: 1499.850,
    gold_rate_per_g: 8120.00,
    taxable_value: 12178782.00,
    gst_amount: 365363.46,
    grand_total: 12544145.46,
    rcm_applicable: false,
    payment_terms: 'IMMEDIATE',
    payment_status: 'PAID',
    auto_tag_generated: true,
  },
  {
    id: '88990011-2233-4455-6677-112233445570',
    purchase_inv_no: 'PUR-26-046',
    supplier_name: 'Harish Patwa Goldsmith (Unregistered)',
    supplier_category: 'WHOLESALE_MANUFACTURER',
    purchase_category: 'FINISHED_ORNAMENTS',
    supplier_inv_date: '2026-10-30',
    rate_fix_date: '2026-10-30',
    gross_weight_g: 35.800,
    purity_percent: 91.67,
    pure_gold_g: 32.818,
    gold_rate_per_g: 7850.00,
    taxable_value: 257621.30,
    gst_amount: 7728.64,
    grand_total: 265349.94,
    rcm_applicable: true,
    payment_terms: 'IMMEDIATE',
    payment_status: 'PAID',
    auto_tag_generated: true,
  },
];

const SUPPLIERS_LIST = [
  'Shree Bullion Refinery',
  'Mangalore Casting Works',
  'Apex Jewellery Works',
  'MMTC-PAMP India Ltd',
  'Surat Diamond & Bullion Co.',
  'Harish Patwa Goldsmith (Unregistered)',
];

export function PurchasesEntryView() {
  const [purchases, setPurchases] = useState<PurchaseInwardBill[]>(INITIAL_PURCHASES);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'BULLION_BAR' | 'FINISHED_ORNAMENTS'>('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'All' | 'PAID' | 'PARTIAL' | 'UNPAID'>('All');
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [selectedBillForDetail, setSelectedBillForDetail] = useState<PurchaseInwardBill | null>(null);

  // Form State
  const [formSupplier, setFormSupplier] = useState(SUPPLIERS_LIST[0]);
  const [formCategory, setFormCategory] = useState<'BULLION_BAR' | 'FINISHED_ORNAMENTS'>('BULLION_BAR');
  const [formInvoiceNo, setFormInvoiceNo] = useState(`PUR-26-0${INITIAL_PURCHASES.length + 43}`);
  const [formInvDate, setFormInvDate] = useState('2026-10-31');
  const [formRateFixDate, setFormRateFixDate] = useState('2026-10-31');
  const [formPaymentTerms, setFormPaymentTerms] = useState<'NET_15' | 'NET_30' | 'IMMEDIATE'>('NET_15');
  const [formGrossWt, setFormGrossWt] = useState('500.000');
  const [formPurity, setFormPurity] = useState('99.90');
  const [formGoldRate, setFormGoldRate] = useState('8090.00');
  const [formRCM, setFormRCM] = useState(false);
  const [formAutoTag, setFormAutoTag] = useState(true);

  // Live Auto Calculations
  const calculatedValues = useMemo(() => {
    const gross = parseFloat(formGrossWt) || 0;
    const purity = parseFloat(formPurity) || 0;
    const rate = parseFloat(formGoldRate) || 0;
    const pureGold = (gross * purity) / 100;
    const taxable = pureGold * rate;
    const gst = taxable * 0.03; // 1.5% CGST + 1.5% SGST
    const grand = taxable + gst;
    return {
      gross,
      purity,
      rate,
      pureGold,
      taxable,
      gst,
      grand,
    };
  }, [formGrossWt, formPurity, formGoldRate]);

  const handleCategorySelect = (cat: 'BULLION_BAR' | 'FINISHED_ORNAMENTS') => {
    setFormCategory(cat);
    if (cat === 'BULLION_BAR') {
      setFormPurity('99.90');
      setFormGoldRate('8090.00');
    } else {
      setFormPurity('91.67');
      setFormGoldRate('7850.00');
    }
  };

  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const newBill: PurchaseInwardBill = {
      id: crypto.randomUUID ? crypto.randomUUID() : `pur-${Date.now()}`,
      purchase_inv_no: formInvoiceNo,
      supplier_name: formSupplier,
      supplier_category: formSupplier.includes('Refinery') || formSupplier.includes('MMTC')
        ? 'BULLION_REFINERY'
        : formSupplier.includes('Casting')
        ? 'CASTING_HOUSE'
        : 'WHOLESALE_MANUFACTURER',
      purchase_category: formCategory,
      supplier_inv_date: formInvDate,
      rate_fix_date: formRateFixDate,
      gross_weight_g: calculatedValues.gross,
      purity_percent: calculatedValues.purity,
      pure_gold_g: calculatedValues.pureGold,
      gold_rate_per_g: calculatedValues.rate,
      taxable_value: calculatedValues.taxable,
      gst_amount: calculatedValues.gst,
      grand_total: calculatedValues.grand,
      rcm_applicable: formRCM,
      payment_terms: formPaymentTerms,
      payment_status: 'UNPAID',
      auto_tag_generated: formAutoTag,
    };

    setPurchases([newBill, ...purchases]);
    setIsNewEntryOpen(false);
    setFormInvoiceNo(`PUR-26-0${purchases.length + 44}`);
  };

  const filteredPurchases = purchases.filter((item) => {
    if (categoryFilter !== 'All' && item.purchase_category !== categoryFilter) return false;
    if (paymentStatusFilter !== 'All' && item.payment_status !== paymentStatusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchInv = item.purchase_inv_no.toLowerCase().includes(q);
      const matchSupplier = item.supplier_name.toLowerCase().includes(q);
      if (!matchInv && !matchSupplier) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="purchases_inward_bills" />
      <ActionToolbar
        filterPlaceholder="Filter by purchase invoice # or supplier..."
        insertLabel="New Purchase Entry"
        onInsertClick={() => setIsNewEntryOpen(true)}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Inward This Month</span>
                <Receipt className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">₹ 1.84 Cr</div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                GST 3% Verified
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Bullion Bars Procured</span>
                <Coins className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-neutral-900">2,500.000 g</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Pure 999.0 Fine Metal
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Wholesale Ornaments</span>
                <Package className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">48 Pcs / 642.150 g</div>
              <div className="text-[11px] text-blue-600 mt-1 font-mono">
                22K 916 Finished stock
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Pending Payments</span>
                <CreditCard className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-amber-700">₹ 42,50,000</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Due within 15-30 days
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">RCM GST Applicable</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">₹ 84,200</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                Unregistered Karigars
              </div>
            </div>
          </div>

          {/* Quick Filter Bar */}
          <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-neutral-400 font-mono text-[11px]">Filters:</span>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as any)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Inward Types</option>
                  <option value="BULLION_BAR">Pure Bullion Bars (999)</option>
                  <option value="FINISHED_ORNAMENTS">Manufactured Ornaments</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Status:</span>
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value as any)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="PAID">Paid</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="UNPAID">Unpaid</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search Bill # or Supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 px-2.5 py-1 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none placeholder:text-neutral-400"
              />
              <button
                onClick={() => setIsNewEntryOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Purchase Entry</span>
              </button>
            </div>
          </div>
        </div>

        {/* Supabase-style Table / Schema Definition Section */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            {/* Table Header Info Bar */}
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  public.purchase_inward_bills
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Showing {filteredPurchases.length} of {purchases.length} inward bills
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
                    <tr className="bg-[#fcfcfc] border-b border-[#e5e7eb] text-neutral-600 font-mono text-[12px]">
                      <th className="w-10 px-3 py-2 border-r border-[#e5e7eb] text-center">
                        <input
                          type="checkbox"
                          className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                        />
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">bill_no</span>
                          <span className="text-neutral-400 font-normal text-[10px]">varchar</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">supplier</span>
                          <span className="text-neutral-400 font-normal text-[10px]">vendor</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">type</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-neutral-800">gross_wt_g</span>
                          <span className="text-neutral-400 font-normal text-[10px]">numeric</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-neutral-800">pure_fine_g</span>
                          <span className="text-neutral-400 font-normal text-[10px]">fine 999</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-neutral-800">gold_rate</span>
                          <span className="text-neutral-400 font-normal text-[10px]">inr/g</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-neutral-800">tax (3%)</span>
                          <span className="text-neutral-400 font-normal text-[10px]">gst</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-neutral-800">grand_total</span>
                          <span className="text-neutral-400 font-normal text-[10px]">inr</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-neutral-800">rcm</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-neutral-800">status</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">action</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {filteredPurchases.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="px-3 py-2 text-center border-r border-[#e5e7eb]">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3.5 py-2 font-mono text-neutral-900 border-r border-[#e5e7eb] whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-emerald-700">{row.purchase_inv_no}</span>
                            {row.auto_tag_generated && (
                              <span title="Barcode Tag Generated">
                                <QrCode className="w-3 h-3 text-neutral-400" />
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-neutral-400 block">{row.supplier_inv_date}</span>
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <div className="font-medium text-neutral-800">{row.supplier_name}</div>
                          <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                            {row.supplier_category.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          {row.purchase_category === 'BULLION_BAR' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              <Coins className="w-3 h-3 text-amber-500" /> Bullion Bar (999)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Package className="w-3 h-3 text-emerald-600" /> Finished 22K (916)
                            </span>
                          )}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-neutral-800 border-r border-[#e5e7eb] text-right whitespace-nowrap">
                          {row.gross_weight_g.toFixed(3)} g
                        </td>
                        <td className="px-3.5 py-2 font-mono text-amber-700 border-r border-[#e5e7eb] text-right whitespace-nowrap bg-amber-50/20">
                          {row.pure_gold_g.toFixed(3)} g
                          <span className="text-[10px] text-neutral-400 block font-normal">
                            ({row.purity_percent.toFixed(2)}%)
                          </span>
                        </td>
                        <td className="px-3.5 py-2 font-mono text-neutral-700 border-r border-[#e5e7eb] text-right whitespace-nowrap">
                          ₹ {row.gold_rate_per_g.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-neutral-600 border-r border-[#e5e7eb] text-right whitespace-nowrap">
                          ₹ {row.gst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3.5 py-2 font-mono font-medium text-neutral-900 border-r border-[#e5e7eb] text-right whitespace-nowrap">
                          ₹ {row.grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3.5 py-2 text-center border-r border-[#e5e7eb] whitespace-nowrap">
                          {row.rcm_applicable ? (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-purple-50 text-purple-700 border border-purple-200">
                              RCM Yes
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-400">Regular</span>
                          )}
                        </td>
                        <td className="px-3.5 py-2 text-center border-r border-[#e5e7eb] whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono ${
                              row.payment_status === 'PAID'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : row.payment_status === 'PARTIAL'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {row.payment_status}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 text-center whitespace-nowrap">
                          <button
                            onClick={() => setSelectedBillForDetail(row)}
                            className="p-1 hover:bg-neutral-100 rounded text-neutral-600 hover:text-emerald-700 transition-colors cursor-pointer"
                            title="View Inward Breakdown"
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

            {/* Table Content: Definition Tab */}
            {activeTab === 'definition' && (
              <div className="p-4 overflow-x-auto font-mono text-xs text-neutral-800 bg-[#fbfbfb] w-full">
                <div className="bg-neutral-900 text-neutral-100 p-4 rounded-md overflow-x-auto shadow-inner text-[12px] leading-relaxed w-full">
                  <span className="text-emerald-400">CREATE TABLE</span> public.purchase_inward_bills (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">purchase_inv_no</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>{' '}
                  <span className="text-neutral-400">UNIQUE NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">supplier_id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">REFERENCES public.suppliers_directory(id),</span>
                  <br />
                  <span className="pl-6 text-blue-300">supplier_name</span>{' '}
                  <span className="text-amber-300">varchar(255)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">purchase_category</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">CHECK (purchase_category IN (&apos;BULLION_BAR&apos;, &apos;FINISHED_ORNAMENTS&apos;)),</span>
                  <br />
                  <span className="pl-6 text-blue-300">gross_weight_g</span>{' '}
                  <span className="text-amber-300">numeric(12,3)</span>{' '}
                  <span className="text-neutral-400">NOT NULL CHECK (gross_weight_g &gt; 0),</span>
                  <br />
                  <span className="pl-6 text-blue-300">purity_percent</span>{' '}
                  <span className="text-amber-300">numeric(5,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">pure_gold_g</span>{' '}
                  <span className="text-amber-300">numeric(12,3)</span>{' '}
                  <span className="text-neutral-400">GENERATED ALWAYS AS ((gross_weight_g * purity_percent) / 100) STORED,</span>
                  <br />
                  <span className="pl-6 text-blue-300">gold_rate_per_g</span>{' '}
                  <span className="text-amber-300">numeric(12,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">taxable_value</span>{' '}
                  <span className="text-amber-300">numeric(12,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">cgst_amount</span>{' '}
                  <span className="text-amber-300">numeric(10,2)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0.00,</span>
                  <br />
                  <span className="pl-6 text-blue-300">sgst_amount</span>{' '}
                  <span className="text-amber-300">numeric(10,2)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0.00,</span>
                  <br />
                  <span className="pl-6 text-blue-300">grand_total</span>{' '}
                  <span className="text-amber-300">numeric(12,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">rcm_applicable</span>{' '}
                  <span className="text-amber-300">boolean</span>{' '}
                  <span className="text-neutral-400">DEFAULT false,</span>
                  <br />
                  <span className="pl-6 text-blue-300">payment_terms</span>{' '}
                  <span className="text-amber-300">varchar(20)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;NET_15&apos;,</span>
                  <br />
                  <span className="pl-6 text-blue-300">payment_status</span>{' '}
                  <span className="text-amber-300">varchar(20)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;UNPAID&apos;,</span>
                  <br />
                  <span className="pl-6 text-blue-300">created_at</span>{' '}
                  <span className="text-amber-300">timestamptz</span>{' '}
                  <span className="text-neutral-400">DEFAULT now()</span>
                  <br />
                  );
                  <br />
                  <br />
                  <span className="text-neutral-500">-- Indexing for Supplier ledger reconciliation</span>
                  <br />
                  <span className="text-emerald-400">CREATE INDEX</span> idx_purchase_supplier{' '}
                  <span className="text-emerald-400">ON</span> public.purchase_inward_bills (supplier_id);
                  <br />
                  <span className="text-emerald-400">ALTER TABLE</span> public.purchase_inward_bills{' '}
                  <span className="text-emerald-400">ENABLE ROW LEVEL SECURITY;</span>
                </div>
              </div>
            )}

            {/* Table Footer Bar */}
            <div className="h-[36px] bg-[#f8fafc] border-t border-[#e5e7eb] px-3.5 flex items-center justify-between text-[12px] text-neutral-500 font-mono select-none w-full">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span>Showing</span>
                  <span className="px-1.5 py-0.5 bg-white border border-[#e2e8f0] rounded text-neutral-800 font-medium">
                    {filteredPurchases.length}
                  </span>
                  <span>records</span>
                </div>
                <span>•</span>
                <span>Active Filter: {categoryFilter} / {paymentStatusFilter}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> GST Inward Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Purchase Entry Drawer Modal */}
      {isNewEntryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#e2e8f0] max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">New Purchase Inward Entry</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                  GST 3% Taxable
                </span>
              </div>
              <button
                onClick={() => setIsNewEntryOpen(false)}
                className="p-1 hover:bg-neutral-200 rounded text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreatePurchase} className="p-4 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
              {/* Inward Category Picker */}
              <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg">
                <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  Select Purchase Category
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleCategorySelect('BULLION_BAR')}
                    className={`p-3 rounded-md border text-left transition-all cursor-pointer flex items-center justify-between ${
                      formCategory === 'BULLION_BAR'
                        ? 'border-amber-500 bg-amber-50/50 text-amber-900 shadow-2xs'
                        : 'border-[#e2e8f0] bg-white text-neutral-700 hover:border-neutral-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-xs flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-amber-500" />
                        Pure Bullion Bar (999)
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        Raw pure 24K casting / bar for melting & trading
                      </div>
                    </div>
                    {formCategory === 'BULLION_BAR' && (
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCategorySelect('FINISHED_ORNAMENTS')}
                    className={`p-3 rounded-md border text-left transition-all cursor-pointer flex items-center justify-between ${
                      formCategory === 'FINISHED_ORNAMENTS'
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 shadow-2xs'
                        : 'border-[#e2e8f0] bg-white text-neutral-700 hover:border-neutral-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-xs flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-emerald-600" />
                        Manufactured Ornaments (22K / 18K)
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        Ready-to-sell jewellery with hallmark HUID
                      </div>
                    </div>
                    {formCategory === 'FINISHED_ORNAMENTS' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </button>
                </div>
              </div>

              {/* Supplier & Invoice Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Supplier / Vendor *</label>
                  <select
                    value={formSupplier}
                    onChange={(e) => setFormSupplier(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  >
                    {SUPPLIERS_LIST.map((sup) => (
                      <option key={sup} value={sup}>
                        {sup}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Purchase Bill # *</label>
                  <input
                    type="text"
                    required
                    value={formInvoiceNo}
                    onChange={(e) => setFormInvoiceNo(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Payment Terms</label>
                  <select
                    value={formPaymentTerms}
                    onChange={(e) => setFormPaymentTerms(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  >
                    <option value="NET_15">Net 15 Days</option>
                    <option value="NET_30">Net 30 Days</option>
                    <option value="IMMEDIATE">Immediate Settlement</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Supplier Bill Date</label>
                  <input
                    type="date"
                    value={formInvDate}
                    onChange={(e) => setFormInvDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Rate Fix Date</label>
                  <input
                    type="date"
                    value={formRateFixDate}
                    onChange={(e) => setFormRateFixDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                  />
                </div>
              </div>

              {/* Weight, Purity & Rate Calculations */}
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-emerald-600" />
                  Metal Specifications & Rate Valuation
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Gross Weight (grams) *</label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      value={formGrossWt}
                      onChange={(e) => setFormGrossWt(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Purity / Touch (%) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formPurity}
                      onChange={(e) => setFormPurity(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Gold Rate (₹ per gram) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formGoldRate}
                      onChange={(e) => setFormGoldRate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
                </div>

                {/* Auto Calculated Summary Strip */}
                <div className="mt-3 p-3 bg-white border border-[#e2e8f0] rounded-md grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Pure Fine Gold (999):</span>
                    <span className="text-amber-700 font-medium">{calculatedValues.pureGold.toFixed(3)} g</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Taxable Value:</span>
                    <span className="text-neutral-800 font-medium">₹ {calculatedValues.taxable.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">GST (3%):</span>
                    <span className="text-neutral-800 font-medium">₹ {calculatedValues.gst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Grand Total:</span>
                    <span className="text-emerald-700 font-medium">₹ {calculatedValues.grand.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Compliance & Tag Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] cursor-pointer hover:border-neutral-300">
                  <input
                    type="checkbox"
                    checked={formRCM}
                    onChange={(e) => setFormRCM(e.target.checked)}
                    className="mt-0.5 rounded border-neutral-300 text-emerald-600 focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-medium text-neutral-800 block">
                      Reverse Charge Mechanism (RCM)
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Check if procuring from unregistered local artisan/karigar
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] cursor-pointer hover:border-neutral-300">
                  <input
                    type="checkbox"
                    checked={formAutoTag}
                    onChange={(e) => setFormAutoTag(e.target.checked)}
                    className="mt-0.5 rounded border-neutral-300 text-emerald-600 focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-medium text-neutral-800 block">
                      Auto-Generate Barcode Tags
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Automatically add to inventory print queue upon saving
                    </span>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5e7eb]">
                <button
                  type="button"
                  onClick={() => setIsNewEntryOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Purchase Bill</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail View Drawer */}
      {selectedBillForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#e2e8f0] max-w-lg w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">
                  Bill {selectedBillForDetail.purchase_inv_no}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBillForDetail(null)}
                className="p-1 hover:bg-neutral-200 rounded text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#f1f5f9]">
                <span className="text-neutral-500">Supplier:</span>
                <span className="font-medium text-neutral-800">{selectedBillForDetail.supplier_name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#f1f5f9]">
                <span className="text-neutral-500">Gross Weight:</span>
                <span className="font-mono text-neutral-800">{selectedBillForDetail.gross_weight_g.toFixed(3)} g</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#f1f5f9]">
                <span className="text-neutral-500">Purity / Touch:</span>
                <span className="font-mono text-neutral-800">{selectedBillForDetail.purity_percent.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#f1f5f9]">
                <span className="text-neutral-500">Fine Gold Weight (999):</span>
                <span className="font-mono font-medium text-amber-700">{selectedBillForDetail.pure_gold_g.toFixed(3)} g</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#f1f5f9]">
                <span className="text-neutral-500">Gold Rate:</span>
                <span className="font-mono text-neutral-800">₹ {selectedBillForDetail.gold_rate_per_g.toFixed(2)}/g</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#f1f5f9]">
                <span className="text-neutral-500">Taxable Value:</span>
                <span className="font-mono text-neutral-800">₹ {selectedBillForDetail.taxable_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#f1f5f9]">
                <span className="text-neutral-500">GST (1.5% CGST + 1.5% SGST):</span>
                <span className="font-mono text-neutral-800">₹ {selectedBillForDetail.gst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#f1f5f9] bg-emerald-50/50 p-2 rounded">
                <span className="font-medium text-neutral-700">Grand Total Payable:</span>
                <span className="font-mono font-medium text-emerald-700">₹ {selectedBillForDetail.grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="px-4 py-3 bg-[#f8fafc] border-t border-[#e5e7eb] flex justify-end">
              <button
                onClick={() => setSelectedBillForDetail(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
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
