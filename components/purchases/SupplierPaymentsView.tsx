'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  CreditCard,
  Coins,
  Building2,
  Landmark,
  ArrowRightLeft,
  Plus,
  X,
  Check,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Filter,
  Eye,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  Vault,
} from 'lucide-react';

interface SupplierPayout {
  id: string;
  voucher_no: string;
  supplier_name: string;
  settlement_type: 'RTGS' | 'NEFT' | 'IMPS' | 'METAL_BAR_999';
  payout_date: string;
  bank_source?: string;
  utr_reference?: string;
  vault_source?: string;
  bar_serial_no?: string;
  metal_weight_g?: number;
  cash_amount?: number;
  status: 'PROCESSED' | 'PENDING_APPROVAL' | 'CANCELLED';
  notes: string;
}

const INITIAL_PAYOUTS: SupplierPayout[] = [
  {
    id: '11223344-a1b2-c3d4-e5f6-445566778899',
    voucher_no: 'PV-2026-0311',
    supplier_name: 'Shree Bullion Refinery',
    settlement_type: 'RTGS',
    payout_date: '2026-10-30',
    bank_source: 'HDFC Bank - Current (0021)',
    utr_reference: 'HDFCR520261030092182',
    cash_amount: 5000000.00,
    status: 'PROCESSED',
    notes: 'Advance against 1kg pure bar contract',
  },
  {
    id: '11223344-a1b2-c3d4-e5f6-445566778900',
    voucher_no: 'PV-2026-0312',
    supplier_name: 'Mangalore Casting Works',
    settlement_type: 'METAL_BAR_999',
    payout_date: '2026-10-29',
    vault_source: 'Main Vault #1',
    bar_serial_no: 'MMTC-999-8812',
    metal_weight_g: 500.000,
    cash_amount: 4045000.00, // Rupee equivalent @ 8090/g
    status: 'PROCESSED',
    notes: 'Metal settlement against antique necklace job lots',
  },
  {
    id: '11223344-a1b2-c3d4-e5f6-445566778901',
    voucher_no: 'PV-2026-0313',
    supplier_name: 'Apex Jewellery Works',
    settlement_type: 'NEFT',
    payout_date: '2026-10-28',
    bank_source: 'SBI Bullion Desk (4412)',
    utr_reference: 'SBIN00261028119028',
    cash_amount: 890000.00,
    status: 'PROCESSED',
    notes: 'Payment for invoice PUR-26-035',
  },
  {
    id: '11223344-a1b2-c3d4-e5f6-445566778902',
    voucher_no: 'PV-2026-0314',
    supplier_name: 'Harish Patwa Goldsmith',
    settlement_type: 'METAL_BAR_999',
    payout_date: '2026-10-31',
    vault_source: 'Workshop Strongroom Safe A',
    bar_serial_no: 'CAST-999-0419',
    metal_weight_g: 50.000,
    cash_amount: 404500.00,
    status: 'PENDING_APPROVAL',
    notes: 'Raw fine gold issue for filigree kadas',
  },
  {
    id: '11223344-a1b2-c3d4-e5f6-445566778903',
    voucher_no: 'PV-2026-0315',
    supplier_name: 'Surat Diamond & Bullion Co.',
    settlement_type: 'RTGS',
    payout_date: '2026-10-31',
    bank_source: 'HDFC Bank - Current (0021)',
    utr_reference: 'HDFCR520261031004128',
    cash_amount: 420000.00,
    status: 'PENDING_APPROVAL',
    notes: 'Pending manager dual auth for diamond parcel',
  },
  {
    id: '11223344-a1b2-c3d4-e5f6-445566778904',
    voucher_no: 'PV-2026-0316',
    supplier_name: 'MMTC-PAMP India Ltd',
    settlement_type: 'RTGS',
    payout_date: '2026-10-27',
    bank_source: 'Standard Chartered Bullion (9011)',
    utr_reference: 'SCBLR2026102799120',
    cash_amount: 8120000.00,
    status: 'PROCESSED',
    notes: 'Refinery 1000g bullion settlement',
  },
];

const SUPPLIERS_OPTIONS = [
  { name: 'Shree Bullion Refinery', metalBal: -50.000, cashBal: -2450000.00 },
  { name: 'Mangalore Casting Works', metalBal: -45.200, cashBal: -142000.00 },
  { name: 'Apex Jewellery Works', metalBal: 0.000, cashBal: -890000.00 },
  { name: 'MMTC-PAMP India Ltd', metalBal: 0.000, cashBal: 0.00 },
  { name: 'Surat Diamond & Bullion Co.', metalBal: 12.500, cashBal: -420000.00 },
  { name: 'Harish Patwa Goldsmith', metalBal: -59.750, cashBal: -78000.00 },
];

export function PurchasesPaymentsView() {
  const [payouts, setPayouts] = useState<SupplierPayout[]>(INITIAL_PAYOUTS);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isNewPayoutOpen, setIsNewPayoutOpen] = useState(false);
  const [selectedPayoutForDetail, setSelectedPayoutForDetail] = useState<SupplierPayout | null>(null);

  // Form State
  const [selectedSupplierName, setSelectedSupplierName] = useState(SUPPLIERS_OPTIONS[0].name);
  const [settlementMode, setSettlementMode] = useState<'BANK' | 'METAL'>('BANK');
  const [formBankSource, setFormBankSource] = useState('HDFC Bank - Current (0021)');
  const [formPaymentMode, setFormPaymentMode] = useState<'RTGS' | 'NEFT' | 'IMPS'>('RTGS');
  const [formUTR, setFormUTR] = useState('');
  const [formCashAmount, setFormCashAmount] = useState('500000.00');

  // Metal Settlement Fields
  const [formVaultSource, setFormVaultSource] = useState('Main Vault #1');
  const [formBarSerial, setFormBarSerial] = useState('MMTC-999-9021');
  const [formMetalWeight, setFormMetalWeight] = useState('100.000');
  const [formMetalGoldRate, setFormMetalGoldRate] = useState('8090.00');

  const selectedSupplierObj = SUPPLIERS_OPTIONS.find((s) => s.name === selectedSupplierName) || SUPPLIERS_OPTIONS[0];

  const handleCreatePayout = (e: React.FormEvent) => {
    e.preventDefault();
    const newVoucher: SupplierPayout = {
      id: crypto.randomUUID ? crypto.randomUUID() : `pv-${Date.now()}`,
      voucher_no: `PV-2026-0${payouts.length + 317}`,
      supplier_name: selectedSupplierName,
      settlement_type: settlementMode === 'BANK' ? formPaymentMode : 'METAL_BAR_999',
      payout_date: '2026-10-31',
      bank_source: settlementMode === 'BANK' ? formBankSource : undefined,
      utr_reference: settlementMode === 'BANK' ? formUTR || `UTR-${Date.now().toString().slice(-6)}` : undefined,
      vault_source: settlementMode === 'METAL' ? formVaultSource : undefined,
      bar_serial_no: settlementMode === 'METAL' ? formBarSerial : undefined,
      metal_weight_g: settlementMode === 'METAL' ? parseFloat(formMetalWeight) || 0 : undefined,
      cash_amount:
        settlementMode === 'BANK'
          ? parseFloat(formCashAmount) || 0
          : (parseFloat(formMetalWeight) || 0) * (parseFloat(formMetalGoldRate) || 8090),
      status: 'PROCESSED',
      notes: settlementMode === 'BANK' ? 'Bank settlement voucher' : 'Pure 999 Bullion Bar dispatch',
    };

    setPayouts([newVoucher, ...payouts]);
    setIsNewPayoutOpen(false);
  };

  const filteredPayouts = payouts.filter((item) => {
    if (modeFilter === 'BANK' && item.settlement_type === 'METAL_BAR_999') return false;
    if (modeFilter === 'METAL' && item.settlement_type !== 'METAL_BAR_999') return false;
    if (statusFilter !== 'All' && item.status !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchVoucher = item.voucher_no.toLowerCase().includes(q);
      const matchSupplier = item.supplier_name.toLowerCase().includes(q);
      const matchUtr = (item.utr_reference || '').toLowerCase().includes(q);
      const matchBar = (item.bar_serial_no || '').toLowerCase().includes(q);
      if (!matchVoucher && !matchSupplier && !matchUtr && !matchBar) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="supplier_payouts" />
      <ActionToolbar
        filterPlaceholder="Filter by voucher #, supplier, or UTR/Bar Serial..."
        insertLabel="Create Supplier Settlement"
        onInsertClick={() => setIsNewPayoutOpen(true)}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Payouts This Month</span>
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">₹ 1.42 Cr</div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Bank RTGS / NEFT Settlements
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Pure Gold Dispatched</span>
                <Coins className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-amber-700">1,850.000 g</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Pure 999 Bullion Bars Transferred
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">RTGS Transfers</span>
                <Landmark className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">24 Vouchers</div>
              <div className="text-[11px] text-blue-600 mt-1 font-mono">
                Bank reconciliation matched
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Pending Approvals</span>
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-amber-700">2 Vouchers</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Dual Authorization Required
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-neutral-400 font-mono text-[11px]">Filters:</span>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Mode:</span>
                <select
                  value={modeFilter}
                  onChange={(e) => setModeFilter(e.target.value)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Settlement Modes</option>
                  <option value="BANK">Bank Transfer (RTGS / NEFT)</option>
                  <option value="METAL">Metal Bar (999 Fine Gold)</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="PROCESSED">Processed</option>
                  <option value="PENDING_APPROVAL">Pending Approval</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search Voucher, Vendor or UTR..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 px-2.5 py-1 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none placeholder:text-neutral-400"
              />
              <button
                onClick={() => setIsNewPayoutOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Settlement</span>
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
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  public.supplier_payouts
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Showing {filteredPayouts.length} of {payouts.length} payment records
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
                          <span className="text-neutral-800">voucher_no</span>
                          <span className="text-neutral-400 font-normal text-[10px]">varchar</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">supplier</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">settlement_type</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">source / reference</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-neutral-800">metal_weight</span>
                          <span className="text-neutral-400 font-normal text-[10px]">999 fine</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-neutral-800">amount</span>
                          <span className="text-neutral-400 font-normal text-[10px]">inr</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">status</span>
                      </th>
                      <th className="px-3.5 py-2 font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">action</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {filteredPayouts.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="px-3 py-2 text-center border-r border-[#e5e7eb]">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3.5 py-2 font-mono border-r border-[#e5e7eb] whitespace-nowrap">
                          <span className="font-medium text-emerald-700">{row.voucher_no}</span>
                          <span className="text-[10px] text-neutral-400 block">{row.payout_date}</span>
                        </td>
                        <td className="px-3.5 py-2 font-medium text-neutral-800 border-r border-[#e5e7eb] whitespace-nowrap">
                          {row.supplier_name}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          {row.settlement_type === 'METAL_BAR_999' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              <Coins className="w-3 h-3 text-amber-500" /> Bullion Bar (999)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              <Landmark className="w-3 h-3 text-blue-600" /> {row.settlement_type}
                            </span>
                          )}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-[11px] border-r border-[#e5e7eb] whitespace-nowrap">
                          {row.settlement_type === 'METAL_BAR_999' ? (
                            <div>
                              <span className="text-neutral-800">{row.bar_serial_no}</span>
                              <span className="text-[10px] text-neutral-400 block">{row.vault_source}</span>
                            </div>
                          ) : (
                            <div>
                              <span className="text-neutral-800">{row.utr_reference}</span>
                              <span className="text-[10px] text-neutral-400 block">{row.bank_source}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-amber-700 border-r border-[#e5e7eb] text-right whitespace-nowrap bg-amber-50/20">
                          {row.metal_weight_g ? `${row.metal_weight_g.toFixed(3)} g` : '-'}
                        </td>
                        <td className="px-3.5 py-2 font-mono font-medium text-neutral-900 border-r border-[#e5e7eb] text-right whitespace-nowrap">
                          ₹ {row.cash_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3.5 py-2 text-center border-r border-[#e5e7eb] whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono ${
                              row.status === 'PROCESSED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {row.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 text-center whitespace-nowrap">
                          <button
                            onClick={() => setSelectedPayoutForDetail(row)}
                            className="p-1 hover:bg-neutral-100 rounded text-neutral-600 hover:text-emerald-700 transition-colors cursor-pointer"
                            title="View Voucher"
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.supplier_payouts (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">voucher_no</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>{' '}
                  <span className="text-neutral-400">UNIQUE NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">supplier_name</span>{' '}
                  <span className="text-amber-300">varchar(255)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">settlement_type</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">CHECK (settlement_type IN (&apos;RTGS&apos;, &apos;NEFT&apos;, &apos;IMPS&apos;, &apos;METAL_BAR_999&apos;)),</span>
                  <br />
                  <span className="pl-6 text-blue-300">metal_weight_g</span>{' '}
                  <span className="text-amber-300">numeric(10,3),</span>
                  <br />
                  <span className="pl-6 text-blue-300">cash_amount</span>{' '}
                  <span className="text-amber-300">numeric(14,2),</span>
                  <br />
                  <span className="pl-6 text-blue-300">utr_reference</span>{' '}
                  <span className="text-amber-300">varchar(64),</span>
                  <br />
                  <span className="pl-6 text-blue-300">bar_serial_no</span>{' '}
                  <span className="text-amber-300">varchar(64),</span>
                  <br />
                  <span className="pl-6 text-blue-300">status</span>{' '}
                  <span className="text-amber-300">varchar(20)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;PROCESSED&apos;,</span>
                  <br />
                  <span className="pl-6 text-blue-300">created_at</span>{' '}
                  <span className="text-amber-300">timestamptz</span>{' '}
                  <span className="text-neutral-400">DEFAULT now()</span>
                  <br />
                  );
                  <br />
                  <br />
                  <span className="text-emerald-400">ALTER TABLE</span> public.supplier_payouts{' '}
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
                    {filteredPayouts.length}
                  </span>
                  <span>payout records</span>
                </div>
                <span>•</span>
                <span>Filter: {modeFilter} / {statusFilter}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Dual Auth Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Supplier Payout / Settlement Drawer Modal */}
      {isNewPayoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#e2e8f0] max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">Create Supplier Payout / Settlement</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                  Dual Ledger Voucher
                </span>
              </div>
              <button
                onClick={() => setIsNewPayoutOpen(false)}
                className="p-1 hover:bg-neutral-200 rounded text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePayout} className="p-4 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
              {/* Supplier Picker & Outstanding Balances */}
              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Select Supplier *</label>
                <select
                  value={selectedSupplierName}
                  onChange={(e) => setSelectedSupplierName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                >
                  {SUPPLIERS_OPTIONS.map((sup) => (
                    <option key={sup.name} value={sup.name}>
                      {sup.name}
                    </option>
                  ))}
                </select>

                {/* Outstanding Pill */}
                <div className="mt-2 p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-md flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-neutral-400 text-[10px] block font-sans">Metal Position:</span>
                    <span className="text-amber-700 font-medium">
                      {selectedSupplierObj.metalBal.toFixed(3)} g Pure Gold
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-neutral-400 text-[10px] block font-sans">Cash Position:</span>
                    <span className="text-blue-700 font-medium">
                      ₹ {Math.abs(selectedSupplierObj.cashBal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Settlement Mode Selection */}
              <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg">
                <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
                  Select Settlement Method
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSettlementMode('BANK')}
                    className={`p-3 rounded-md border text-left transition-all cursor-pointer flex items-center justify-between ${
                      settlementMode === 'BANK'
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 shadow-2xs'
                        : 'border-[#e2e8f0] bg-white text-neutral-700 hover:border-neutral-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-xs flex items-center gap-1.5">
                        <Landmark className="w-3.5 h-3.5 text-emerald-600" />
                        Cash / Bank RTGS / NEFT
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        Clear outstanding currency balance
                      </div>
                    </div>
                    {settlementMode === 'BANK' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettlementMode('METAL')}
                    className={`p-3 rounded-md border text-left transition-all cursor-pointer flex items-center justify-between ${
                      settlementMode === 'METAL'
                        ? 'border-amber-500 bg-amber-50/50 text-amber-900 shadow-2xs'
                        : 'border-[#e2e8f0] bg-white text-neutral-700 hover:border-neutral-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-xs flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-amber-500" />
                        Fine Metal (999 Bar) Settlement
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        Dispatch physical bullion bars
                      </div>
                    </div>
                    {settlementMode === 'METAL' && (
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                  </button>
                </div>
              </div>

              {/* Mode Specific Inputs */}
              {settlementMode === 'BANK' ? (
                <div className="space-y-3 p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-neutral-700 mb-1 block">Debiting Bank Account *</label>
                      <select
                        value={formBankSource}
                        onChange={(e) => setFormBankSource(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                      >
                        <option value="HDFC Bank - Current (0021)">HDFC Bank - Current (0021)</option>
                        <option value="SBI Bullion Desk (4412)">SBI Bullion Desk (4412)</option>
                        <option value="ICICI Bullion Escrow (9018)">ICICI Bullion Escrow (9018)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-neutral-700 mb-1 block">Payment Method</label>
                      <select
                        value={formPaymentMode}
                        onChange={(e) => setFormPaymentMode(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                      >
                        <option value="RTGS">RTGS (High Value Settlement)</option>
                        <option value="NEFT">NEFT Transfer</option>
                        <option value="IMPS">IMPS Immediate</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-neutral-700 mb-1 block">Amount (₹ INR) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formCashAmount}
                        onChange={(e) => setFormCashAmount(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-700 mb-1 block">UTR Reference #</label>
                      <input
                        type="text"
                        value={formUTR}
                        onChange={(e) => setFormUTR(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                        placeholder="e.g. HDFCR5202610..."
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-neutral-700 mb-1 block">Vault Safe Location *</label>
                      <select
                        value={formVaultSource}
                        onChange={(e) => setFormVaultSource(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                      >
                        <option value="Main Vault #1">Main Vault #1 (Strongroom)</option>
                        <option value="Workshop Strongroom Safe A">Workshop Strongroom Safe A</option>
                        <option value="Bullion Counter Safe">Bullion Counter Safe</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-700 mb-1 block">Pure 999 Bar Serial # *</label>
                      <input
                        type="text"
                        required
                        value={formBarSerial}
                        onChange={(e) => setFormBarSerial(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                        placeholder="MMTC-999-9021"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-neutral-700 mb-1 block">Metal Weight (g) *</label>
                      <input
                        type="number"
                        step="0.001"
                        required
                        value={formMetalWeight}
                        onChange={(e) => setFormMetalWeight(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-700 mb-1 block">Equivalent Gold Rate (₹/g)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formMetalGoldRate}
                        onChange={(e) => setFormMetalGoldRate(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-md text-xs font-mono text-amber-900 flex justify-between">
                    <span>Rupee Valuation Equivalent:</span>
                    <span className="font-medium">
                      ₹ {((parseFloat(formMetalWeight) || 0) * (parseFloat(formMetalGoldRate) || 0)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5e7eb]">
                <button
                  type="button"
                  onClick={() => setIsNewPayoutOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Process Voucher</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedPayoutForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#e2e8f0] max-w-md w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">
                  Voucher {selectedPayoutForDetail.voucher_no}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPayoutForDetail(null)}
                className="p-1 hover:bg-neutral-200 rounded text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-neutral-500">Supplier:</span>
                <span className="font-medium text-neutral-800">{selectedPayoutForDetail.supplier_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-neutral-500">Settlement Type:</span>
                <span className="font-mono text-neutral-800">{selectedPayoutForDetail.settlement_type}</span>
              </div>
              {selectedPayoutForDetail.metal_weight_g && (
                <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                  <span className="text-neutral-500">Fine Gold Dispatched:</span>
                  <span className="font-mono font-medium text-amber-700">{selectedPayoutForDetail.metal_weight_g.toFixed(3)} g</span>
                </div>
              )}
              {selectedPayoutForDetail.bar_serial_no && (
                <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                  <span className="text-neutral-500">Bar Serial / Vault:</span>
                  <span className="font-mono text-neutral-800">{selectedPayoutForDetail.bar_serial_no} ({selectedPayoutForDetail.vault_source})</span>
                </div>
              )}
              {selectedPayoutForDetail.utr_reference && (
                <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                  <span className="text-neutral-500">Bank UTR Reference:</span>
                  <span className="font-mono text-neutral-800">{selectedPayoutForDetail.utr_reference}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-[#f1f5f9] bg-emerald-50/50 p-2 rounded">
                <span className="font-medium text-neutral-700">Settlement Value:</span>
                <span className="font-mono font-medium text-emerald-700">₹ {selectedPayoutForDetail.cash_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="px-4 py-3 bg-[#f8fafc] border-t border-[#e5e7eb] flex justify-end">
              <button
                onClick={() => setSelectedPayoutForDetail(null)}
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
