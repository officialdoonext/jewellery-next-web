'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  BookOpen,
  Scale,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRightLeft,
  Copy,
  Check,
  X,
  Plus,
  ShieldCheck,
  Building,
  RotateCcw,
  BadgeAlert,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

interface JournalVoucher {
  id: string;
  voucher_no: string;
  date: string;
  debit_account: string;
  credit_account: string;
  amount: number;
  narration: string;
  posted_by: string;
  status: 'POSTED' | 'DRAFT' | 'REVERSED';
}

const INITIAL_VOUCHERS: JournalVoucher[] = [
  {
    id: '44556677-f6a1-b2c3-d4e5-778899001122',
    voucher_no: 'JV-2026-052',
    date: '2026-10-31',
    debit_account: 'Depreciation on Safe Vault & Display Counters',
    credit_account: 'Accumulated Depreciation Reserve',
    amount: 15000.0,
    narration: 'Monthly SLM depreciation on Godrej Defender vault & LED display showroom assets',
    posted_by: 'Mohan Rao (Head Auditor)',
    status: 'POSTED',
  },
  {
    id: '44556677-f6a1-b2c3-d4e5-778899001123',
    voucher_no: 'JV-2026-051',
    date: '2026-10-30',
    debit_account: 'Interest Expense on ICICI Bullion Loan Facility',
    credit_account: 'ICICI Bullion Overdraft - 4410',
    amount: 42500.0,
    narration: 'Provision for 15-day interest on unhedged metal loan tranche #ML-881',
    posted_by: 'Mohan Rao (Head Auditor)',
    status: 'POSTED',
  },
  {
    id: '44556677-f6a1-b2c3-d4e5-778899001124',
    voucher_no: 'JV-2026-050',
    date: '2026-10-29',
    debit_account: 'Inventory Mark-to-Market Valuation Gain',
    credit_account: 'Bullion Price Fluctuation Reserve A/c',
    amount: 850000.0,
    narration: 'Unrealized MTM gain on 14,850g fine gold stock at IBJA fix ₹7,850/g (22K)',
    posted_by: 'Siva Krishna (Finance Controller)',
    status: 'POSTED',
  },
  {
    id: '44556677-f6a1-b2c3-d4e5-778899001125',
    voucher_no: 'JV-2026-049',
    date: '2026-10-25',
    debit_account: 'Karigar Melting & Refining Wastage Loss (VA)',
    credit_account: 'Work-in-Progress Artisan Bullion Ledger',
    amount: 28400.0,
    narration: 'Assaying refining variance written off for Job Card #JC-2026-819',
    posted_by: 'Mohan Rao (Head Auditor)',
    status: 'POSTED',
  },
];

export function FinanceJournalEntriesView() {
  const [vouchers, setVouchers] = useState<JournalVoucher[]>(INITIAL_VOUCHERS);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals & drawers
  const [isNewVoucherOpen, setIsNewVoucherOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New JV Form State
  const [debitAccount, setDebitAccount] = useState('Depreciation on Safe Vault & Display Counters');
  const [creditAccount, setCreditAccount] = useState('Accumulated Depreciation Reserve');
  const [jvAmount, setJvAmount] = useState<number>(0);
  const [narration, setNarration] = useState('');
  const [jvDate, setJvDate] = useState('2026-10-31');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (jvAmount <= 0 || !narration) return;

    const voucherNo = `JV-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newRecord: JournalVoucher = {
      id: crypto.randomUUID(),
      voucher_no: voucherNo,
      date: jvDate,
      debit_account: debitAccount,
      credit_account: creditAccount,
      amount: Number(jvAmount),
      narration,
      posted_by: 'Siva Krishna (Finance Controller)',
      status: 'POSTED',
    };

    setVouchers([newRecord, ...vouchers]);
    setIsNewVoucherOpen(false);
    setNarration('');
    setJvAmount(0);
    showToast(`Journal voucher ${voucherNo} posted successfully! Balanced Debit/Credit.`);
  };

  const totalVoucherAmount = vouchers.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="journal_vouchers" />
      <ActionToolbar
        filterPlaceholder="Filter by voucher #, account name, narration, auditor..."
        insertLabel="Create Journal Voucher"
        onInsertClick={() => setIsNewVoucherOpen(true)}
      />

      {toastMessage && (
        <div className="fixed top-12 right-6 z-50 bg-neutral-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 border border-neutral-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Journal Vouchers Month</span>
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">48 JVs</div>
              <div className="text-[11px] text-neutral-500 mt-1">October 2026 General Ledger</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Debit/Credit</span>
                <ArrowRightLeft className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">₹ 1.24 Cr</div>
              <div className="text-[11px] text-neutral-500 mt-1">Balanced double-entry flow</div>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-200 hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-emerald-800 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Trial Balance Status</span>
                <Scale className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div className="text-xl font-medium text-emerald-900 font-mono">PERFECTLY BALANCED</div>
              <div className="text-[11px] text-emerald-700 mt-1 font-mono">₹ 0.00 Suspense Variance</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Unposted Entries</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">0 Pending</div>
              <div className="text-[11px] text-neutral-500 mt-1">Audited by Statutory CPA</div>
            </div>
          </div>
        </div>

        {/* Supabase-style Table */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  public.journal_vouchers
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Showing {vouchers.length} double-entry records
                </span>
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
                        <span className="text-neutral-800">voucher_no</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">date</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">debit_account (Dr.)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">credit_account (Cr.)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">amount (₹)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">narration</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">posted_by</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">status</span>
                      </th>
                      <th className="w-16 px-3 py-2 text-center font-medium">uuid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb] text-neutral-800 font-mono">
                    {vouchers.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700">
                          {row.voucher_no}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-600">
                          {row.date}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap font-sans text-neutral-900 font-medium">
                          {row.debit_account}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap font-sans text-neutral-700">
                          {row.credit_account}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-right font-medium text-neutral-900">
                          ₹ {row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] font-sans text-neutral-600 max-w-sm truncate">
                          {row.narration}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap font-sans text-neutral-600">
                          {row.posted_by}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {row.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          <button
                            onClick={() => copyToClipboard(row.id, row.id)}
                            className="p-1 text-neutral-400 hover:text-neutral-700 transition-colors"
                            title="Copy UUID"
                          >
                            {copiedId === row.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'definition' && (
              <div className="p-4 bg-[#0a0a0a] text-neutral-200 font-mono text-xs overflow-x-auto">
                <div className="leading-relaxed">
                  <span className="text-emerald-400">CREATE TABLE</span> public.journal_vouchers (
                  <br />
                  &nbsp;&nbsp;id <span className="text-purple-400">UUID</span>{' '}
                  <span className="text-neutral-400">PRIMARY KEY DEFAULT gen_random_uuid()</span>,
                  <br />
                  &nbsp;&nbsp;voucher_no <span className="text-purple-400">VARCHAR(50)</span>{' '}
                  <span className="text-neutral-400">UNIQUE NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;date <span className="text-purple-400">DATE</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;debit_account <span className="text-purple-400">VARCHAR(150)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;credit_account <span className="text-purple-400">VARCHAR(150)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;amount <span className="text-purple-400">NUMERIC(12,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;narration <span className="text-purple-400">TEXT</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;posted_by <span className="text-purple-400">VARCHAR(100)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;status <span className="text-purple-400">VARCHAR(20)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;POSTED&apos;</span>
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawer: Create New Journal Voucher */}
      {isNewVoucherOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs transition-all">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-medium text-neutral-900">
                    Create Double-Entry Journal Voucher
                  </h3>
                </div>
                <button
                  onClick={() => setIsNewVoucherOpen(false)}
                  className="p-1 hover:bg-neutral-200/60 rounded text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateVoucher} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Voucher Reference
                    </label>
                    <input
                      type="text"
                      value="JV-2026-053"
                      disabled
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-neutral-50 text-neutral-600 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Voucher Date
                    </label>
                    <input
                      type="date"
                      value={jvDate}
                      onChange={(e) => setJvDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Debit Account (Dr.)
                  </label>
                  <select
                    value={debitAccount}
                    onChange={(e) => setDebitAccount(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  >
                    <option value="Depreciation on Safe Vault & Display Counters">Depreciation on Safe Vault & Display Counters</option>
                    <option value="Interest Expense on ICICI Bullion Loan Facility">Interest Expense on ICICI Bullion Loan Facility</option>
                    <option value="Inventory Mark-to-Market Valuation Gain">Inventory Mark-to-Market Valuation Gain</option>
                    <option value="Karigar Melting & Refining Wastage Loss (VA)">Karigar Melting & Refining Wastage Loss (VA)</option>
                    <option value="Bullion Price Appreciation Spread">Bullion Price Appreciation Spread</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Credit Account (Cr.)
                  </label>
                  <select
                    value={creditAccount}
                    onChange={(e) => setCreditAccount(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  >
                    <option value="Accumulated Depreciation Reserve">Accumulated Depreciation Reserve</option>
                    <option value="ICICI Bullion Overdraft - 4410">ICICI Bullion Overdraft - 4410</option>
                    <option value="Bullion Price Fluctuation Reserve A/c">Bullion Price Fluctuation Reserve A/c</option>
                    <option value="Work-in-Progress Artisan Bullion Ledger">Work-in-Progress Artisan Bullion Ledger</option>
                    <option value="HDFC Jewellery Current - 9021">HDFC Jewellery Current - 9021</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={jvAmount || ''}
                    onChange={(e) => setJvAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Narration & Detailed Explanation
                  </label>
                  <textarea
                    rows={3}
                    value={narration}
                    onChange={(e) => setNarration(e.target.value)}
                    placeholder="Enter journal accounting rationale and supporting invoices/calculations..."
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    required
                  />
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-[11px] text-emerald-800 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Auto-enforces double-entry equality (Debit = Credit) with immutable audit hash.
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewVoucherOpen(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Post Voucher
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
