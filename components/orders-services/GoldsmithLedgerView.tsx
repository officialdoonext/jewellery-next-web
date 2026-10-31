'use client';

import React, { useState, useMemo } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Coins,
  Scale,
  Calendar,
  DollarSign,
  Plus,
  X,
  Search,
  Filter,
  Check,
  Building2,
  FileSpreadsheet,
  FileText,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  CheckCircle2,
  Printer,
  ChevronDown,
} from 'lucide-react';

interface LedgerEntry {
  id: string;
  entry_date: string;
  voucher_no: string;
  transaction_type: 'BULLION_ISSUE' | 'FINISHED_DELIVERY' | 'LABOUR_PAYMENT' | 'METAL_SETTLEMENT';
  particulars: string;
  metal_debit_g: number; // Gold issued to artisan
  metal_credit_g: number; // Gold returned by artisan
  net_metal_balance_g: number; // Running metal balance
  labour_earned: number; // Labour amount earned
  labour_paid: number; // Labour paid to artisan
  net_labour_due: number; // Running labour due
  payment_mode?: 'UPI' | 'NEFT' | 'CASH' | 'CHEQUE';
  reference_job_order?: string;
}

const GOLDSMITHS_LIST = [
  'Bhaskar Jewellers Workshop',
  'Ramesh Soni Karigar',
  'Harish Patwa Goldsmith',
  'Soni Karigar Unit',
  'Laxmi Casting Works',
];

const INITIAL_LEDGER_ENTRIES: Record<string, LedgerEntry[]> = {
  'Bhaskar Jewellers Workshop': [
    {
      id: 'led-01',
      entry_date: '2026-10-18',
      voucher_no: 'VCH-26-881',
      transaction_type: 'BULLION_ISSUE',
      particulars: 'Raw 24K Pure Gold Bar Issued for Bridal Sets',
      metal_debit_g: 100.000,
      metal_credit_g: 0.000,
      net_metal_balance_g: 100.000,
      labour_earned: 0,
      labour_paid: 0,
      net_labour_due: 0,
      reference_job_order: 'JO-2026-195',
    },
    {
      id: 'led-02',
      entry_date: '2026-10-22',
      voucher_no: 'DEL-26-402',
      transaction_type: 'FINISHED_DELIVERY',
      particulars: 'Finished 22K Haar & Kada delivered (91.450g) + Scrap (2.100g) + Wastage allowed (1.800g)',
      metal_debit_g: 0.000,
      metal_credit_g: 95.350,
      net_metal_balance_g: 4.650,
      labour_earned: 42000,
      labour_paid: 0,
      net_labour_due: 42000,
      reference_job_order: 'JO-2026-195',
    },
    {
      id: 'led-03',
      entry_date: '2026-10-24',
      voucher_no: 'PAY-26-119',
      transaction_type: 'LABOUR_PAYMENT',
      particulars: 'Weekly Labour advance payment via HDFC Bank NEFT',
      metal_debit_g: 0.000,
      metal_credit_g: 0.000,
      net_metal_balance_g: 4.650,
      labour_earned: 0,
      labour_paid: 30000,
      net_labour_due: 12000,
      payment_mode: 'NEFT',
    },
    {
      id: 'led-04',
      entry_date: '2026-10-25',
      voucher_no: 'VCH-26-895',
      transaction_type: 'BULLION_ISSUE',
      particulars: 'Raw 24K Gold Bar Issued for Temple Kada Pair',
      metal_debit_g: 250.000,
      metal_credit_g: 0.000,
      net_metal_balance_g: 254.650,
      labour_earned: 0,
      labour_paid: 0,
      net_labour_due: 12000,
      reference_job_order: 'JO-2026-208',
    },
    {
      id: 'led-05',
      entry_date: '2026-10-29',
      voucher_no: 'DEL-26-418',
      transaction_type: 'FINISHED_DELIVERY',
      particulars: 'Delivered Partial Batch: 2 Temple Kada (198.400g) + Filings returned (7.600g)',
      metal_debit_g: 0.000,
      metal_credit_g: 206.000,
      net_metal_balance_g: 48.650,
      labour_earned: 22200,
      labour_paid: 0,
      net_labour_due: 34200,
      reference_job_order: 'JO-2026-208',
    },
  ],
  'Ramesh Soni Karigar': [
    {
      id: 'led-06',
      entry_date: '2026-10-20',
      voucher_no: 'VCH-26-889',
      transaction_type: 'BULLION_ISSUE',
      particulars: 'Raw 24K Gold Issued for Chain Links',
      metal_debit_g: 150.000,
      metal_credit_g: 0.000,
      net_metal_balance_g: 150.000,
      labour_earned: 0,
      labour_paid: 0,
      net_labour_due: 0,
      reference_job_order: 'JO-2026-198',
    },
    {
      id: 'led-07',
      entry_date: '2026-10-27',
      voucher_no: 'DEL-26-411',
      transaction_type: 'FINISHED_DELIVERY',
      particulars: 'Delivered 8 Chains (132.500g) + Scrap (14.200g)',
      metal_debit_g: 0.000,
      metal_credit_g: 146.700,
      net_metal_balance_g: 3.300,
      labour_earned: 18500,
      labour_paid: 18500,
      net_labour_due: 0,
      payment_mode: 'UPI',
    },
  ],
};

export function OrdersGoldsmithLedgerView() {
  const [selectedGoldsmith, setSelectedGoldsmith] = useState<string>(GOLDSMITHS_LIST[0]);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-31');
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);

  // Settlement Form State
  const [settlementType, setSettlementType] = useState<'LABOUR_PAYMENT' | 'METAL_SETTLEMENT' | 'COMBINED'>('LABOUR_PAYMENT');
  const [settleVoucherNo, setSettleVoucherNo] = useState('PAY-26-128');
  const [settleMetalGrams, setSettleMetalGrams] = useState('48.650');
  const [settleLabourAmount, setSettleLabourAmount] = useState('34200');
  const [settlePaymentMode, setSettlePaymentMode] = useState<'UPI' | 'NEFT' | 'CASH' | 'CHEQUE'>('NEFT');
  const [settleNotes, setSettleNotes] = useState('Full settlement of pending labour charges.');

  const currentLedger = useMemo(() => {
    return INITIAL_LEDGER_ENTRIES[selectedGoldsmith] || [];
  }, [selectedGoldsmith]);

  // Running totals for the selected artisan
  const ledgerMetrics = useMemo(() => {
    const lastRow = currentLedger[currentLedger.length - 1];
    return {
      pendingMetalBalance: lastRow ? lastRow.net_metal_balance_g : 48.65,
      unsettledLabourDue: lastRow ? lastRow.net_labour_due : 34200,
      activeJobs: 3,
      lastAuditDate: 'Oct 25, 2026',
    };
  }, [currentLedger]);

  const filteredEntries = useMemo(() => {
    return currentLedger.filter((entry) => {
      const matchSearch =
        entry.voucher_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.particulars.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.reference_job_order && entry.reference_job_order.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSearch;
    });
  }, [currentLedger, searchQuery]);

  const handleSaveSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    const lastRow = currentLedger[currentLedger.length - 1];
    const prevMetal = lastRow ? lastRow.net_metal_balance_g : 0;
    const prevLabour = lastRow ? lastRow.net_labour_due : 0;

    let metalCredit = 0;
    let labourPaid = 0;

    if (settlementType === 'METAL_SETTLEMENT' || settlementType === 'COMBINED') {
      metalCredit = parseFloat(settleMetalGrams) || 0;
    }
    if (settlementType === 'LABOUR_PAYMENT' || settlementType === 'COMBINED') {
      labourPaid = parseFloat(settleLabourAmount) || 0;
    }

    const newEntry: LedgerEntry = {
      id: crypto.randomUUID ? crypto.randomUUID() : `led-${Date.now()}`,
      entry_date: new Date().toISOString().slice(0, 10),
      voucher_no: settleVoucherNo,
      transaction_type: settlementType === 'METAL_SETTLEMENT' ? 'METAL_SETTLEMENT' : 'LABOUR_PAYMENT',
      particulars: `${settleNotes} (${settlePaymentMode})`,
      metal_debit_g: 0,
      metal_credit_g: metalCredit,
      net_metal_balance_g: Math.max(0, prevMetal - metalCredit),
      labour_earned: 0,
      labour_paid: labourPaid,
      net_labour_due: Math.max(0, prevLabour - labourPaid),
      payment_mode: settlePaymentMode,
    };

    INITIAL_LEDGER_ENTRIES[selectedGoldsmith] = [...currentLedger, newEntry];
    setIsSettlementOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="goldsmith_metal_ledger" />
      <ActionToolbar
        filterPlaceholder="Filter ledger vouchers, job orders, settlement particulars..."
        insertLabel="Settle / Pay Labour"
        onInsertClick={() => setIsSettlementOpen(true)}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* Artisan Selector & Date Range Filter Bar */}
        <div className="p-4 bg-white border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded bg-amber-50 text-amber-700">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-medium text-neutral-500 tracking-wider block">
                Select Artisan Workshop Account
              </span>
              <select
                value={selectedGoldsmith}
                onChange={(e) => setSelectedGoldsmith(e.target.value)}
                className="text-xs font-medium text-neutral-800 bg-[#f8fafc] border border-[#e2e8f0] rounded-md px-2.5 py-1 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {GOLDSMITHS_LIST.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" /> Date Range:
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1 text-xs border border-[#e2e8f0] rounded bg-[#f8fafc] text-neutral-700"
            />
            <span className="text-neutral-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1 text-xs border border-[#e2e8f0] rounded bg-[#f8fafc] text-neutral-700"
            />
          </div>
        </div>

        {/* KPI Metrics Cards */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Pure Gold Balance Pending
              </span>
              <span className="p-1 rounded bg-amber-50 text-amber-600">
                <Coins className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-amber-800 font-mono">
              {ledgerMetrics.pendingMetalBalance.toFixed(3)} g
            </div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              Pure 24K held by artisan workshop
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Unsettled Labour Due
              </span>
              <span className="p-1 rounded bg-emerald-50 text-emerald-600">
                <DollarSign className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-neutral-800 font-mono">
              ₹ {ledgerMetrics.unsettledLabourDue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
              <span>Earned on delivered ornaments</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Active Job Orders
              </span>
              <span className="p-1 rounded bg-blue-50 text-blue-600">
                <FileText className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-neutral-800 font-mono">
              {ledgerMetrics.activeJobs} Orders
            </div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              Open manufacturing vouchers
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Last Physical Audit
              </span>
              <span className="p-1 rounded bg-purple-50 text-purple-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-neutral-800 font-mono">
              {ledgerMetrics.lastAuditDate}
            </div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              Vault weigh-in verified
            </div>
          </div>
        </div>

        {/* Tab Switcher: Statement Data vs Definition */}
        <div className="px-4 pb-2 flex items-center justify-between border-b border-[#e2e8f0]">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('data')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'data'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-[#e2e8f0]'
              }`}
            >
              Metal & Labour Statement ({filteredEntries.length})
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
        </div>

        {/* View Mode: Real-time Statement Data Table */}
        {activeTab === 'data' ? (
          <div className="flex-1 p-4">
            <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-neutral-500 font-medium">
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Date</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Voucher #</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb]">Particulars & Job Reference</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] text-right whitespace-nowrap text-amber-700 bg-amber-50/20">
                        Metal Dr (g Issued)
                      </th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] text-right whitespace-nowrap text-emerald-700 bg-emerald-50/20">
                        Metal Cr (g Returned)
                      </th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] text-right whitespace-nowrap font-medium text-neutral-900">
                        Net Metal Balance (g)
                      </th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] text-right whitespace-nowrap">
                        Labour Earned (₹)
                      </th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] text-right whitespace-nowrap text-emerald-700">
                        Labour Paid (₹)
                      </th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap font-medium text-neutral-900">
                        Net Labour Due (₹)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {filteredEntries.map((row) => (
                      <tr key={row.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-neutral-600">
                          {row.entry_date}
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap font-mono">
                          <span className="font-medium text-neutral-800">{row.voucher_no}</span>
                          {row.reference_job_order && (
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-100 block mt-0.5">
                              {row.reference_job_order}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb]">
                          <div className="font-medium text-neutral-800">{row.particulars}</div>
                          {row.payment_mode && (
                            <span className="text-[10px] font-mono text-blue-600">
                              Mode: {row.payment_mode}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] text-right font-mono whitespace-nowrap bg-amber-50/20">
                          {row.metal_debit_g > 0 ? (
                            <span className="font-medium text-amber-700">
                              +{row.metal_debit_g.toFixed(3)} g
                            </span>
                          ) : (
                            <span className="text-neutral-300">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] text-right font-mono whitespace-nowrap bg-emerald-50/20">
                          {row.metal_credit_g > 0 ? (
                            <span className="font-medium text-emerald-700">
                              -{row.metal_credit_g.toFixed(3)} g
                            </span>
                          ) : (
                            <span className="text-neutral-300">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] text-right font-mono whitespace-nowrap font-medium text-neutral-900">
                          {row.net_metal_balance_g.toFixed(3)} g
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] text-right font-mono whitespace-nowrap">
                          {row.labour_earned > 0 ? (
                            <span>₹ {row.labour_earned.toLocaleString('en-IN')}</span>
                          ) : (
                            <span className="text-neutral-300">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] text-right font-mono whitespace-nowrap text-emerald-700">
                          {row.labour_paid > 0 ? (
                            <span>₹ {row.labour_paid.toLocaleString('en-IN')}</span>
                          ) : (
                            <span className="text-neutral-300">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap font-medium text-neutral-900">
                          ₹ {row.net_labour_due.toLocaleString('en-IN')}
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
              <span className="text-emerald-400">CREATE TABLE</span> public.goldsmith_metal_ledger (
              <br />
              &nbsp;&nbsp;id <span className="text-blue-400">UUID</span> PRIMARY KEY DEFAULT gen_random_uuid(),
              <br />
              &nbsp;&nbsp;goldsmith_name <span className="text-blue-400">VARCHAR(150)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;entry_date <span className="text-blue-400">DATE</span> NOT NULL,
              <br />
              &nbsp;&nbsp;voucher_no <span className="text-blue-400">VARCHAR(50)</span> UNIQUE NOT NULL,
              <br />
              &nbsp;&nbsp;transaction_type <span className="text-blue-400">VARCHAR(50)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;particulars <span className="text-blue-400">TEXT</span> NOT NULL,
              <br />
              &nbsp;&nbsp;metal_debit_g <span className="text-blue-400">NUMERIC(10,3)</span> DEFAULT 0.000,
              <br />
              &nbsp;&nbsp;metal_credit_g <span className="text-blue-400">NUMERIC(10,3)</span> DEFAULT 0.000,
              <br />
              &nbsp;&nbsp;net_metal_balance_g <span className="text-blue-400">NUMERIC(10,3)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;labour_earned <span className="text-blue-400">NUMERIC(10,2)</span> DEFAULT 0.00,
              <br />
              &nbsp;&nbsp;labour_paid <span className="text-blue-400">NUMERIC(10,2)</span> DEFAULT 0.00,
              <br />
              &nbsp;&nbsp;net_labour_due <span className="text-blue-400">NUMERIC(10,2)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;payment_mode <span className="text-blue-400">VARCHAR(20)</span>,
              <br />
              &nbsp;&nbsp;reference_job_order <span className="text-blue-400">VARCHAR(50)</span>,
              <br />
              &nbsp;&nbsp;created_at <span className="text-blue-400">TIMESTAMPTZ</span> DEFAULT now()
              <br />
              );
            </div>
          </div>
        )}
      </div>

      {/* Settle Metal Balance / Pay Labour Drawer Modal */}
      {isSettlementOpen && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex justify-end z-50 animate-fadeIn">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#e2e8f0]">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-emerald-50 text-emerald-700">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-neutral-900 uppercase tracking-wider">
                    Settle Metal Balance & Pay Labour
                  </h3>
                  <span className="text-[11px] text-neutral-500">
                    Artisan: <span className="font-medium text-neutral-800">{selectedGoldsmith}</span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsSettlementOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form id="settlement-form" onSubmit={handleSaveSettlement} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {/* Current Balances Header Card */}
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Pure Gold Pending</span>
                  <span className="font-mono font-medium text-amber-800 text-sm">
                    {ledgerMetrics.pendingMetalBalance.toFixed(3)} g
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Labour Charges Due</span>
                  <span className="font-mono font-medium text-emerald-700 text-sm">
                    ₹ {ledgerMetrics.unsettledLabourDue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Settlement Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'LABOUR_PAYMENT', label: 'Pay Labour' },
                    { id: 'METAL_SETTLEMENT', label: 'Return Metal' },
                    { id: 'COMBINED', label: 'Combined Both' },
                  ].map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setSettlementType(t.id as any)}
                      className={`py-2 px-2 rounded border text-xs font-medium transition-colors cursor-pointer text-center ${
                        settlementType === t.id
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-white border-[#e2e8f0] text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Voucher #</label>
                  <input
                    type="text"
                    value={settleVoucherNo}
                    onChange={(e) => setSettleVoucherNo(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Payment Mode</label>
                  <select
                    value={settlePaymentMode}
                    onChange={(e) => setSettlePaymentMode(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  >
                    <option value="NEFT">HDFC Bank NEFT / RTGS</option>
                    <option value="UPI">UPI Instant (GPay / PhonePe)</option>
                    <option value="CASH">Cash Drawer Voucher</option>
                    <option value="CHEQUE">Account Payee Cheque</option>
                  </select>
                </div>
              </div>

              {(settlementType === 'LABOUR_PAYMENT' || settlementType === 'COMBINED') && (
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Labour Amount to Pay (₹)</label>
                  <input
                    type="number"
                    value={settleLabourAmount}
                    onChange={(e) => setSettleLabourAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
              )}

              {(settlementType === 'METAL_SETTLEMENT' || settlementType === 'COMBINED') && (
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Pure Metal Grams Returned (g)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={settleMetalGrams}
                    onChange={(e) => setSettleMetalGrams(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Settlement Particulars / Notes</label>
                <textarea
                  rows={2}
                  value={settleNotes}
                  onChange={(e) => setSettleNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                />
              </div>
            </form>

            <div className="px-5 py-3 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSettlementOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="settlement-form"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Post Settlement to Ledger</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
