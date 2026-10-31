'use client';

import React, { useState, useMemo } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  RotateCcw,
  FileText,
  Scale,
  CreditCard,
  AlertTriangle,
  Plus,
  X,
  Check,
  Building2,
  Calendar,
  Layers,
  ArrowUpDown,
  Search,
  Eye,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Coins,
  Package,
} from 'lucide-react';

interface PurchaseDebitNote {
  id: string;
  debit_note_no: string;
  orig_purchase_inv_no: string;
  supplier_name: string;
  item_tag_code: string;
  weight_returned_g: number;
  return_reason:
    | 'Hallmark Purity Failure'
    | 'Porosity / Casting Defect'
    | 'Weight Shortfall'
    | 'Solder Excess'
    | 'Stone Detachment';
  return_rate_per_g: number;
  rate_type: 'ORIGINAL_RATE' | 'MARKET_RATE';
  tax_reversal_amount: number;
  debit_amount: number;
  status: 'ACCEPTED_BY_VENDOR' | 'PENDING_CONFIRMATION' | 'CREDITED_TO_ACCOUNT';
  created_at: string;
}

const INITIAL_DEBIT_NOTES: PurchaseDebitNote[] = [
  {
    id: '99001122-3344-5566-7788-223344556677',
    debit_note_no: 'DN-2026-009',
    orig_purchase_inv_no: 'PUR-26-042',
    supplier_name: 'Apex Jewellery Works',
    item_tag_code: 'TAG-G-8910',
    weight_returned_g: 14.200,
    return_reason: 'Porosity / Casting Defect',
    return_rate_per_g: 7850.00,
    rate_type: 'ORIGINAL_RATE',
    tax_reversal_amount: 3344.10,
    debit_amount: 114814.10,
    status: 'ACCEPTED_BY_VENDOR',
    created_at: '2026-10-29',
  },
  {
    id: '99001122-3344-5566-7788-223344556678',
    debit_note_no: 'DN-2026-010',
    orig_purchase_inv_no: 'PUR-26-043',
    supplier_name: 'Mangalore Casting Works',
    item_tag_code: 'TAG-G-6201',
    weight_returned_g: 36.450,
    return_reason: 'Hallmark Purity Failure',
    return_rate_per_g: 7850.00,
    rate_type: 'ORIGINAL_RATE',
    tax_reversal_amount: 8583.98,
    debit_amount: 294716.48,
    status: 'PENDING_CONFIRMATION',
    created_at: '2026-10-30',
  },
  {
    id: '99001122-3344-5566-7788-223344556679',
    debit_note_no: 'DN-2026-011',
    orig_purchase_inv_no: 'PUR-26-038',
    supplier_name: 'Surat Diamond & Bullion Co.',
    item_tag_code: 'TAG-D-4512',
    weight_returned_g: 5.420,
    return_reason: 'Stone Detachment',
    return_rate_per_g: 7920.00,
    rate_type: 'MARKET_RATE',
    tax_reversal_amount: 1287.79,
    debit_amount: 44214.19,
    status: 'CREDITED_TO_ACCOUNT',
    created_at: '2026-10-25',
  },
  {
    id: '99001122-3344-5566-7788-223344556680',
    debit_note_no: 'DN-2026-012',
    orig_purchase_inv_no: 'PUR-26-035',
    supplier_name: 'Apex Jewellery Works',
    item_tag_code: 'TAG-G-3190',
    weight_returned_g: 22.180,
    return_reason: 'Weight Shortfall',
    return_rate_per_g: 7800.00,
    rate_type: 'ORIGINAL_RATE',
    tax_reversal_amount: 5190.12,
    debit_amount: 178194.12,
    status: 'ACCEPTED_BY_VENDOR',
    created_at: '2026-10-27',
  },
  {
    id: '99001122-3344-5566-7788-223344556681',
    debit_note_no: 'DN-2026-013',
    orig_purchase_inv_no: 'PUR-26-041',
    supplier_name: 'Shree Bullion Refinery',
    item_tag_code: 'BAR-999-041',
    weight_returned_g: 25.000,
    return_reason: 'Weight Shortfall',
    return_rate_per_g: 8090.00,
    rate_type: 'ORIGINAL_RATE',
    tax_reversal_amount: 6067.50,
    debit_amount: 208317.50,
    status: 'ACCEPTED_BY_VENDOR',
    created_at: '2026-10-28',
  },
  {
    id: '99001122-3344-5566-7788-223344556682',
    debit_note_no: 'DN-2026-014',
    orig_purchase_inv_no: 'PUR-26-040',
    supplier_name: 'Mangalore Casting Works',
    item_tag_code: 'TAG-G-7104',
    weight_returned_g: 15.170,
    return_reason: 'Solder Excess',
    return_rate_per_g: 7850.00,
    rate_type: 'ORIGINAL_RATE',
    tax_reversal_amount: 3572.54,
    debit_amount: 122657.04,
    status: 'PENDING_CONFIRMATION',
    created_at: '2026-10-31',
  },
];

const REASON_OPTIONS = [
  'Hallmark Purity Failure',
  'Porosity / Casting Defect',
  'Weight Shortfall',
  'Solder Excess',
  'Stone Detachment',
] as const;

export function PurchasesReturnsView() {
  const [debitNotes, setDebitNotes] = useState<PurchaseDebitNote[]>(INITIAL_DEBIT_NOTES);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'ACCEPTED_BY_VENDOR' | 'PENDING_CONFIRMATION' | 'CREDITED_TO_ACCOUNT'>('All');
  const [reasonFilter, setReasonFilter] = useState<string>('All');
  const [isNewReturnOpen, setIsNewReturnOpen] = useState(false);
  const [selectedNoteForDetail, setSelectedNoteForDetail] = useState<PurchaseDebitNote | null>(null);

  // Form State
  const [formOrigBill, setFormOrigBill] = useState('PUR-26-042');
  const [formSupplier, setFormSupplier] = useState('Apex Jewellery Works');
  const [formItemTag, setFormItemTag] = useState('TAG-G-9021');
  const [formReason, setFormReason] = useState<typeof REASON_OPTIONS[number]>('Hallmark Purity Failure');
  const [formWeight, setFormWeight] = useState('18.500');
  const [formRate, setFormRate] = useState('7850.00');
  const [formRateType, setFormRateType] = useState<'ORIGINAL_RATE' | 'MARKET_RATE'>('ORIGINAL_RATE');

  // Calculations
  const calculatedReturn = useMemo(() => {
    const wt = parseFloat(formWeight) || 0;
    const rate = parseFloat(formRate) || 0;
    const baseValue = wt * rate;
    const gstReversal = baseValue * 0.03;
    const totalDebit = baseValue + gstReversal;
    return { wt, rate, baseValue, gstReversal, totalDebit };
  }, [formWeight, formRate]);

  const handleCreateDebitNote = (e: React.FormEvent) => {
    e.preventDefault();
    const newNote: PurchaseDebitNote = {
      id: crypto.randomUUID ? crypto.randomUUID() : `dn-${Date.now()}`,
      debit_note_no: `DN-2026-0${debitNotes.length + 10}`,
      orig_purchase_inv_no: formOrigBill,
      supplier_name: formSupplier,
      item_tag_code: formItemTag,
      weight_returned_g: calculatedReturn.wt,
      return_reason: formReason,
      return_rate_per_g: calculatedReturn.rate,
      rate_type: formRateType,
      tax_reversal_amount: calculatedReturn.gstReversal,
      debit_amount: calculatedReturn.totalDebit,
      status: 'PENDING_CONFIRMATION',
      created_at: '2026-10-31',
    };

    setDebitNotes([newNote, ...debitNotes]);
    setIsNewReturnOpen(false);
  };

  const filteredDebitNotes = debitNotes.filter((item) => {
    if (statusFilter !== 'All' && item.status !== statusFilter) return false;
    if (reasonFilter !== 'All' && item.return_reason !== reasonFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchNote = item.debit_note_no.toLowerCase().includes(q);
      const matchSupplier = item.supplier_name.toLowerCase().includes(q);
      const matchBill = item.orig_purchase_inv_no.toLowerCase().includes(q);
      if (!matchNote && !matchSupplier && !matchBill) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="purchase_debit_notes" />
      <ActionToolbar
        filterPlaceholder="Filter debit notes by DN #, supplier, or original bill..."
        insertLabel="New Debit Note"
        onInsertClick={() => setIsNewReturnOpen(true)}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Debit Notes Issued</span>
                <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">{debitNotes.length} Notes</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Month of October 2026
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Value Returned</span>
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">₹ 9,45,200</div>
              <div className="text-[11px] text-blue-600 mt-1 font-mono">
                Tax reversed @ 3% GST
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Weight Returned</span>
                <Scale className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-amber-700">118.420 g</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Reversed from stock register
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Pending Vendor Credit</span>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-amber-700">₹ 3,12,000</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                2 Notes awaiting signoff
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-neutral-400 font-mono text-[11px]">Filters:</span>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Reason:</span>
                <select
                  value={reasonFilter}
                  onChange={(e) => setReasonFilter(e.target.value)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Defect Reasons</option>
                  {REASON_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="ACCEPTED_BY_VENDOR">Accepted by Vendor</option>
                  <option value="PENDING_CONFIRMATION">Pending Confirmation</option>
                  <option value="CREDITED_TO_ACCOUNT">Credited to Account</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search DN # or Supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 px-2.5 py-1 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none placeholder:text-neutral-400"
              />
              <button
                onClick={() => setIsNewReturnOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Issue Debit Note</span>
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
                <RotateCcw className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  public.purchase_debit_notes
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Showing {filteredDebitNotes.length} of {debitNotes.length} debit notes
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
                          <span className="text-neutral-800">debit_note_no</span>
                          <span className="text-neutral-400 font-normal text-[10px]">varchar</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">orig_bill_no</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">supplier</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-neutral-800">weight_returned</span>
                          <span className="text-neutral-400 font-normal text-[10px]">grams</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">return_reason</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-neutral-800">debit_amount</span>
                          <span className="text-neutral-400 font-normal text-[10px]">inr</span>
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
                    {filteredDebitNotes.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="px-3 py-2 text-center border-r border-[#e5e7eb]">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3.5 py-2 font-mono border-r border-[#e5e7eb] whitespace-nowrap">
                          <span className="font-medium text-emerald-700">{row.debit_note_no}</span>
                          <span className="text-[10px] text-neutral-400 block">{row.created_at}</span>
                        </td>
                        <td className="px-3.5 py-2 font-mono text-neutral-600 border-r border-[#e5e7eb] whitespace-nowrap">
                          {row.orig_purchase_inv_no}
                          <span className="text-[10px] text-neutral-400 block">{row.item_tag_code}</span>
                        </td>
                        <td className="px-3.5 py-2 font-medium text-neutral-800 border-r border-[#e5e7eb] whitespace-nowrap">
                          {row.supplier_name}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-amber-700 border-r border-[#e5e7eb] text-right whitespace-nowrap bg-amber-50/20 font-medium">
                          {row.weight_returned_g.toFixed(3)} g
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#f8fafc] text-neutral-700 border border-[#e2e8f0]">
                            <ShieldAlert className="w-3 h-3 text-amber-600" />
                            {row.return_reason}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 font-mono font-medium text-neutral-900 border-r border-[#e5e7eb] text-right whitespace-nowrap">
                          ₹ {row.debit_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3.5 py-2 text-center border-r border-[#e5e7eb] whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono ${
                              row.status === 'ACCEPTED_BY_VENDOR'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : row.status === 'CREDITED_TO_ACCOUNT'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {row.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 text-center whitespace-nowrap">
                          <button
                            onClick={() => setSelectedNoteForDetail(row)}
                            className="p-1 hover:bg-neutral-100 rounded text-neutral-600 hover:text-emerald-700 transition-colors cursor-pointer"
                            title="View Debit Note Detail"
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.purchase_debit_notes (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">debit_note_no</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>{' '}
                  <span className="text-neutral-400">UNIQUE NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">orig_purchase_inv_no</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">supplier_name</span>{' '}
                  <span className="text-amber-300">varchar(255)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">item_tag_code</span>{' '}
                  <span className="text-amber-300">varchar(64),</span>
                  <br />
                  <span className="pl-6 text-blue-300">weight_returned_g</span>{' '}
                  <span className="text-amber-300">numeric(10,3)</span>{' '}
                  <span className="text-neutral-400">NOT NULL CHECK (weight_returned_g &gt; 0),</span>
                  <br />
                  <span className="pl-6 text-blue-300">return_reason</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">return_rate_per_g</span>{' '}
                  <span className="text-amber-300">numeric(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">debit_amount</span>{' '}
                  <span className="text-amber-300">numeric(12,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">status</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;PENDING_CONFIRMATION&apos;,</span>
                  <br />
                  <span className="pl-6 text-blue-300">created_at</span>{' '}
                  <span className="text-amber-300">timestamptz</span>{' '}
                  <span className="text-neutral-400">DEFAULT now()</span>
                  <br />
                  );
                  <br />
                  <br />
                  <span className="text-emerald-400">ALTER TABLE</span> public.purchase_debit_notes{' '}
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
                    {filteredDebitNotes.length}
                  </span>
                  <span>records</span>
                </div>
                <span>•</span>
                <span>Active Filter: {reasonFilter} / {statusFilter}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Stock Reversal Synchronized
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Return / Debit Note Drawer Modal */}
      {isNewReturnOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#e2e8f0] max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">Issue Purchase Debit Note</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded">
                  Stock Deduction
                </span>
              </div>
              <button
                onClick={() => setIsNewReturnOpen(false)}
                className="p-1 hover:bg-neutral-200 rounded text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDebitNote} className="p-4 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Original Purchase Bill # *</label>
                  <input
                    type="text"
                    required
                    value={formOrigBill}
                    onChange={(e) => setFormOrigBill(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    placeholder="PUR-26-042"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Supplier Name *</label>
                  <input
                    type="text"
                    required
                    value={formSupplier}
                    onChange={(e) => setFormSupplier(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Item Tag Code / Barcode</label>
                  <input
                    type="text"
                    value={formItemTag}
                    onChange={(e) => setFormItemTag(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    placeholder="TAG-G-9021"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Reason for Rejection *</label>
                  <select
                    value={formReason}
                    onChange={(e) => setFormReason(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  >
                    {REASON_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-emerald-600" />
                  Weight and Return Pricing
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Weight Returned (g) *</label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      value={formWeight}
                      onChange={(e) => setFormWeight(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Rate Valuation Type</label>
                    <select
                      value={formRateType}
                      onChange={(e) => setFormRateType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    >
                      <option value="ORIGINAL_RATE">Original Inward Bill Rate</option>
                      <option value="MARKET_RATE">Current Market Rate</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Return Rate (₹/g) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formRate}
                      onChange={(e) => setFormRate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
                </div>

                <div className="mt-3 p-3 bg-white border border-[#e2e8f0] rounded-md grid grid-cols-3 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Net Metal Value:</span>
                    <span className="text-neutral-800 font-medium">₹ {calculatedReturn.baseValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Tax Reversal (3% GST):</span>
                    <span className="text-neutral-800 font-medium">₹ {calculatedReturn.gstReversal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Total Debit Amount:</span>
                    <span className="text-emerald-700 font-medium">₹ {calculatedReturn.totalDebit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5e7eb]">
                <button
                  type="button"
                  onClick={() => setIsNewReturnOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Generate Debit Note</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedNoteForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#e2e8f0] max-w-md w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">
                  Debit Note {selectedNoteForDetail.debit_note_no}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNoteForDetail(null)}
                className="p-1 hover:bg-neutral-200 rounded text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-neutral-500">Supplier:</span>
                <span className="font-medium text-neutral-800">{selectedNoteForDetail.supplier_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-neutral-500">Orig Purchase Bill:</span>
                <span className="font-mono text-neutral-800">{selectedNoteForDetail.orig_purchase_inv_no}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-neutral-500">Tag / Barcode:</span>
                <span className="font-mono text-neutral-800">{selectedNoteForDetail.item_tag_code}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-neutral-500">Weight Returned:</span>
                <span className="font-mono font-medium text-amber-700">{selectedNoteForDetail.weight_returned_g.toFixed(3)} g</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-neutral-500">Reason:</span>
                <span className="text-neutral-800">{selectedNoteForDetail.return_reason}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-neutral-500">Return Rate:</span>
                <span className="font-mono text-neutral-800">₹ {selectedNoteForDetail.return_rate_per_g.toFixed(2)}/g ({selectedNoteForDetail.rate_type})</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#f1f5f9] bg-emerald-50/50 p-2 rounded">
                <span className="font-medium text-neutral-700">Total Debit Credited:</span>
                <span className="font-mono font-medium text-emerald-700">₹ {selectedNoteForDetail.debit_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="px-4 py-3 bg-[#f8fafc] border-t border-[#e5e7eb] flex justify-end">
              <button
                onClick={() => setSelectedNoteForDetail(null)}
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
