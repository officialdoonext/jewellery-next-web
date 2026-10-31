'use client';

import React, { useState, useMemo } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  FileSpreadsheet,
  Coins,
  CreditCard,
  Building2,
  Calendar,
  Download,
  Printer,
  ShieldCheck,
  Check,
  Award,
  X,
  FileText,
  Clock,
  ArrowUpDown,
  Search,
  Filter,
} from 'lucide-react';

interface LedgerRow {
  id: string;
  date: string;
  voucher_no: string;
  particulars: string;
  type: 'INWARD_PURCHASE' | 'METAL_PAYMENT' | 'BANK_RTGS' | 'DEBIT_NOTE' | 'OPENING_BAL';
  metal_dr_g: number; // Dispatched to vendor (we pay metal)
  metal_cr_g: number; // Received from vendor (vendor gives metal)
  metal_bal_g: number;
  cash_dr: number; // Paid to vendor (RTGS / cash out)
  cash_cr: number; // Billed by vendor (invoice inward)
  cash_bal: number;
}

const SUPPLIERS = [
  { id: '1', name: 'Mangalore Casting Works', gstin: '29AAACM4512H1Z2', city: 'Mangaluru' },
  { id: '2', name: 'Shree Bullion Refinery', gstin: '27AABCS9821L1ZM', city: 'Mumbai' },
  { id: '3', name: 'Apex Jewellery Works', gstin: '33AAACA7102J1ZS', city: 'Chennai' },
  { id: '4', name: 'MMTC-PAMP India Ltd', gstin: '06AAACM1920K1ZG', city: 'Gurugram' },
  { id: '5', name: 'Harish Patwa Goldsmith', gstin: 'UNREGISTERED', city: 'Rajkot' },
];

const INITIAL_STATEMENT: LedgerRow[] = [
  {
    id: 'row-1',
    date: '2026-10-01',
    voucher_no: 'OP-BAL',
    particulars: 'Opening Balance b/f',
    type: 'OPENING_BAL',
    metal_dr_g: 0.000,
    metal_cr_g: 0.000,
    metal_bal_g: -20.000,
    cash_dr: 0.00,
    cash_cr: 0.00,
    cash_bal: -100000.00,
  },
  {
    id: 'row-2',
    date: '2026-10-08',
    voucher_no: 'PUR-26-031',
    particulars: 'Inward 22K Antique Temple Chokers (Gross 210.400 g @ 91.67%)',
    type: 'INWARD_PURCHASE',
    metal_dr_g: 0.000,
    metal_cr_g: 192.873,
    metal_bal_g: -212.873,
    cash_dr: 0.00,
    cash_cr: 1514053.00,
    cash_bal: -1614053.00,
  },
  {
    id: 'row-3',
    date: '2026-10-12',
    voucher_no: 'PV-2026-0298',
    particulars: 'Fine Bullion Bar Dispatched (MMTC-999-4102)',
    type: 'METAL_PAYMENT',
    metal_dr_g: 200.000,
    metal_cr_g: 0.000,
    metal_bal_g: -12.873,
    cash_dr: 0.00,
    cash_cr: 0.00,
    cash_bal: -1614053.00,
  },
  {
    id: 'row-4',
    date: '2026-10-15',
    voucher_no: 'PV-2026-0301',
    particulars: 'RTGS Settlement via HDFC Bank (UTR HDFCR520261015881)',
    type: 'BANK_RTGS',
    metal_dr_g: 0.000,
    metal_cr_g: 0.000,
    metal_bal_g: -12.873,
    cash_dr: 1500000.00,
    cash_cr: 0.00,
    cash_bal: -114053.00,
  },
  {
    id: 'row-5',
    date: '2026-10-22',
    voucher_no: 'DN-2026-006',
    particulars: 'Debit Note: Hallmark Assay Shortfall on Bangle Lot',
    type: 'DEBIT_NOTE',
    metal_dr_g: 15.000,
    metal_cr_g: 0.000,
    metal_bal_g: 2.127,
    cash_dr: 117750.00,
    cash_cr: 0.00,
    cash_bal: 3697.00,
  },
  {
    id: 'row-6',
    date: '2026-10-28',
    voucher_no: 'PUR-26-043',
    particulars: 'Inward 22K Calcutta Floral Kadas (Gross 450.250 g @ 91.67%)',
    type: 'INWARD_PURCHASE',
    metal_dr_g: 0.000,
    metal_cr_g: 412.744,
    metal_bal_g: -410.617,
    cash_dr: 0.00,
    cash_cr: 3337241.61,
    cash_bal: -3333544.61,
  },
  {
    id: 'row-7',
    date: '2026-10-29',
    voucher_no: 'PV-2026-0312',
    particulars: 'Pure Bar Settlement (MMTC-999-8812 - 500.000 g Pure)',
    type: 'METAL_PAYMENT',
    metal_dr_g: 500.000,
    metal_cr_g: 0.000,
    metal_bal_g: 89.383,
    cash_dr: 0.00,
    cash_cr: 0.00,
    cash_bal: -3333544.61,
  },
  {
    id: 'row-8',
    date: '2026-10-30',
    voucher_no: 'PV-2026-0317',
    particulars: 'RTGS Part Settlement via Canara Bank (UTR CNRB26103099)',
    type: 'BANK_RTGS',
    metal_dr_g: 0.000,
    metal_cr_g: 0.000,
    metal_bal_g: -45.200, // Reconciled closing metal position
    cash_dr: 3191544.61,
    cash_cr: 0.00,
    cash_bal: -142000.00, // Reconciled closing cash position
  },
];

export function PurchasesLedgerView() {
  const [selectedSupplierId, setSelectedSupplierId] = useState(SUPPLIERS[0].id);
  const [dateRange, setDateRange] = useState('2026-10');
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [statementRows, setStatementRows] = useState<LedgerRow[]>(INITIAL_STATEMENT);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);

  const currentSupplier = SUPPLIERS.find((s) => s.id === selectedSupplierId) || SUPPLIERS[0];

  const totals = useMemo(() => {
    let metalDr = 0;
    let metalCr = 0;
    let cashDr = 0;
    let cashCr = 0;
    statementRows.forEach((r) => {
      metalDr += r.metal_dr_g;
      metalCr += r.metal_cr_g;
      cashDr += r.cash_dr;
      cashCr += r.cash_cr;
    });
    return { metalDr, metalCr, cashDr, cashCr };
  }, [statementRows]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="supplier_dual_ledger" />
      <ActionToolbar
        filterPlaceholder="Filter ledger entries by voucher #, particulars..."
        insertLabel="Add Entry"
        onInsertClick={() => {}}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* Supplier Selector & Date Filters Header */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium text-neutral-700">Vendor:</span>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-medium cursor-pointer"
                >
                  {SUPPLIERS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neutral-500" />
                <span className="text-xs font-medium text-neutral-700">Period:</span>
                <input
                  type="month"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCertificateOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors shadow-2xs cursor-pointer"
              >
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Balance Certificate</span>
              </button>

              <button
                onClick={() => alert('Exporting full dual-currency ledger statement to Excel & PDF...')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Statement</span>
              </button>
            </div>
          </div>

          {/* KPI Metrics Cards for Selected Supplier */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-amber-200 hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider text-amber-900">
                  Net Metal Position
                </span>
                <Coins className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-amber-700 font-mono">-45.200 g</div>
              <div className="text-[11px] text-amber-800 mt-1 font-mono">
                Pure 999 Fine Gold We Owe
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Net Cash Balance</span>
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">₹ 1,42,000</div>
              <div className="text-[11px] text-red-600 mt-1 font-mono">
                Trade Payable Balance
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Inward Transactions</span>
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">12 Bills</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                Ornaments & Bullion inward
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Last Settlement Date</span>
                <Clock className="w-3.5 h-3.5 text-neutral-500" />
              </div>
              <div className="text-xl font-medium text-neutral-900">Oct 28, 2026</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                RTGS Ref: CNRB26103099
              </div>
            </div>
          </div>
        </div>

        {/* Supabase-style Table / Schema Definition Section */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            {/* Table Header Info Bar */}
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  public.supplier_dual_ledger
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  {currentSupplier.name} ({currentSupplier.gstin})
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
                    {/* Primary Two-Column Top Header */}
                    <tr className="bg-[#f8fafc] border-b border-[#e5e7eb] text-neutral-600 font-mono text-[11px]">
                      <th colSpan={3} className="px-3.5 py-1.5 border-r border-[#e5e7eb] text-center uppercase tracking-wider">
                        Transaction Details
                      </th>
                      <th colSpan={3} className="px-3.5 py-1.5 border-r border-[#e5e7eb] text-center bg-amber-50/50 text-amber-900 uppercase tracking-wider font-medium">
                        Pure Gold Metal Ledger (Fine Grams)
                      </th>
                      <th colSpan={3} className="px-3.5 py-1.5 text-center bg-blue-50/50 text-blue-900 uppercase tracking-wider font-medium">
                        Currency Account (₹ INR)
                      </th>
                    </tr>
                    {/* Secondary Columns Header */}
                    <tr className="bg-[#fcfcfc] border-b border-[#e5e7eb] text-neutral-600 font-mono text-[11px]">
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">date</th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">voucher_no</th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap min-w-[220px]">particulars</th>
                      {/* Metal Columns */}
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] text-right whitespace-nowrap bg-amber-50/30 text-neutral-700">
                        metal_dr (g)
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] text-right whitespace-nowrap bg-amber-50/30 text-neutral-700">
                        metal_cr (g)
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] text-right whitespace-nowrap bg-amber-50/40 text-amber-900 font-medium">
                        net_metal_bal
                      </th>
                      {/* Cash Columns */}
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] text-right whitespace-nowrap bg-blue-50/30 text-neutral-700">
                        cash_dr (₹)
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] text-right whitespace-nowrap bg-blue-50/30 text-neutral-700">
                        cash_cr (₹)
                      </th>
                      <th className="px-3.5 py-2 text-right whitespace-nowrap bg-blue-50/40 text-blue-900 font-medium">
                        net_cash_bal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9] font-mono text-[11px]">
                    {statementRows.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] text-neutral-600 whitespace-nowrap">
                          {row.date}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium text-emerald-700 whitespace-nowrap">
                          {row.voucher_no}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] text-neutral-800 font-sans">
                          {row.particulars}
                        </td>
                        {/* Metal Dr */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] text-right text-neutral-700 whitespace-nowrap bg-amber-50/10">
                          {row.metal_dr_g > 0 ? row.metal_dr_g.toFixed(3) : '-'}
                        </td>
                        {/* Metal Cr */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] text-right text-neutral-700 whitespace-nowrap bg-amber-50/10">
                          {row.metal_cr_g > 0 ? row.metal_cr_g.toFixed(3) : '-'}
                        </td>
                        {/* Net Metal Bal */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] text-right whitespace-nowrap bg-amber-50/20 font-medium text-amber-800">
                          {row.metal_bal_g.toFixed(3)} g
                        </td>
                        {/* Cash Dr */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] text-right text-neutral-700 whitespace-nowrap bg-blue-50/10">
                          {row.cash_dr > 0 ? `₹ ${row.cash_dr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                        </td>
                        {/* Cash Cr */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] text-right text-neutral-700 whitespace-nowrap bg-blue-50/10">
                          {row.cash_cr > 0 ? `₹ ${row.cash_cr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                        </td>
                        {/* Net Cash Bal */}
                        <td className="px-3.5 py-2 text-right whitespace-nowrap bg-blue-50/20 font-medium text-neutral-900">
                          {row.cash_bal < 0 ? (
                            <span className="text-red-700">
                              - ₹ {Math.abs(row.cash_bal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span className="text-emerald-700">
                              + ₹ {row.cash_bal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}

                    {/* Total Row */}
                    <tr className="bg-[#f8fafc] border-t-2 border-[#e2e8f0] font-medium text-[12px]">
                      <td colSpan={3} className="px-3.5 py-2.5 border-r border-[#e5e7eb] text-right uppercase tracking-wider text-neutral-800">
                        Monthly Period Total
                      </td>
                      <td className="px-3.5 py-2.5 border-r border-[#e5e7eb] text-right text-neutral-800">
                        {totals.metalDr.toFixed(3)} g
                      </td>
                      <td className="px-3.5 py-2.5 border-r border-[#e5e7eb] text-right text-neutral-800">
                        {totals.metalCr.toFixed(3)} g
                      </td>
                      <td className="px-3.5 py-2.5 border-r border-[#e5e7eb] text-right text-amber-800 bg-amber-50/40">
                        -45.200 g
                      </td>
                      <td className="px-3.5 py-2.5 border-r border-[#e5e7eb] text-right text-neutral-800">
                        ₹ {totals.cashDr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3.5 py-2.5 border-r border-[#e5e7eb] text-right text-neutral-800">
                        ₹ {totals.cashCr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3.5 py-2.5 text-right text-red-700 bg-blue-50/40">
                        - ₹ 1,42,000.00
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Table Content: Definition Tab */}
            {activeTab === 'definition' && (
              <div className="p-4 overflow-x-auto font-mono text-xs text-neutral-800 bg-[#fbfbfb] w-full">
                <div className="bg-neutral-900 text-neutral-100 p-4 rounded-md overflow-x-auto shadow-inner text-[12px] leading-relaxed w-full">
                  <span className="text-emerald-400">CREATE TABLE</span> public.supplier_dual_ledger (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">supplier_id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">NOT NULL REFERENCES public.suppliers_directory(id),</span>
                  <br />
                  <span className="pl-6 text-blue-300">date</span>{' '}
                  <span className="text-amber-300">date</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">voucher_no</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">particulars</span>{' '}
                  <span className="text-amber-300">text</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">metal_dr_g</span>{' '}
                  <span className="text-amber-300">numeric(12,3)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0.000,</span>
                  <br />
                  <span className="pl-6 text-blue-300">metal_cr_g</span>{' '}
                  <span className="text-amber-300">numeric(12,3)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0.000,</span>
                  <br />
                  <span className="pl-6 text-blue-300">cash_dr</span>{' '}
                  <span className="text-amber-300">numeric(14,2)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0.00,</span>
                  <br />
                  <span className="pl-6 text-blue-300">cash_cr</span>{' '}
                  <span className="text-amber-300">numeric(14,2)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0.00,</span>
                  <br />
                  <span className="pl-6 text-blue-300">created_at</span>{' '}
                  <span className="text-amber-300">timestamptz</span>{' '}
                  <span className="text-neutral-400">DEFAULT now()</span>
                  <br />
                  );
                  <br />
                  <br />
                  <span className="text-emerald-400">ALTER TABLE</span> public.supplier_dual_ledger{' '}
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
                    {statementRows.length}
                  </span>
                  <span>entries</span>
                </div>
                <span>•</span>
                <span>Period: October 2026</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Reconciled with Bank & Vault Registers
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Confirmation Certificate Modal */}
      {isCertificateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#e2e8f0] max-w-lg w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-medium text-neutral-900">
                  Balance Confirmation Certificate
                </h3>
              </div>
              <button
                onClick={() => setIsCertificateOpen(false)}
                className="p-1 hover:bg-neutral-200 rounded text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-neutral-800">
              <div className="text-center pb-3 border-b border-[#e5e7eb]">
                <h4 className="font-medium text-sm text-neutral-900">CERTIFICATE OF DUAL BALANCE CONFIRMATION</h4>
                <p className="text-[11px] text-neutral-500 mt-1">Period Ending: October 31, 2026</p>
              </div>

              <div className="space-y-2">
                <p>
                  This is to certify that as per our books of accounts, the outstanding dual balance with{' '}
                  <span className="font-medium text-neutral-900">{currentSupplier.name}</span> (GSTIN:{' '}
                  <span className="font-mono">{currentSupplier.gstin}</span>) stands as follows:
                </p>

                <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg space-y-2 font-mono">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-sans text-neutral-600">Pure Gold 999 Metal Balance:</span>
                    <span className="font-medium text-amber-700">-45.200 g (Payable)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-sans text-neutral-600">Currency Cash Balance:</span>
                    <span className="font-medium text-red-700">₹ 1,42,000.00 (Payable)</span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-500 pt-1">
                  Both parties agree to reconcile any difference within 7 days of certificate issue.
                </p>
              </div>

              <div className="pt-4 border-t border-[#f1f5f9] flex justify-between text-[11px] text-neutral-600">
                <div>
                  <div className="h-8 border-b border-neutral-300 w-32 mb-1" />
                  <span>Authorized Signatory (Store)</span>
                </div>
                <div>
                  <div className="h-8 border-b border-neutral-300 w-32 mb-1" />
                  <span>Vendor Acceptance & Seal</span>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 bg-[#f8fafc] border-t border-[#e5e7eb] flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors shadow-2xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
              <button
                onClick={() => setIsCertificateOpen(false)}
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
