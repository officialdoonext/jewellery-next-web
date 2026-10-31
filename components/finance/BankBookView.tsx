'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Landmark,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  Check,
  X,
  ShieldCheck,
  CreditCard,
  Building,
  RefreshCw,
  FileCheck,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';

interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  balance: number;
  balanceDisplay: string;
  type: string;
  color: string;
}

interface BankBookEntry {
  id: string;
  date: string;
  bank_name: string;
  utr_reference: string;
  party_name: string;
  transaction_type: 'CREDIT' | 'DEBIT';
  amount: number;
  is_reconciled: boolean;
  category: string;
}

const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'hdfc',
    name: 'HDFC Jewellery Current',
    accountNumber: '9021',
    balance: 18400000.0,
    balanceDisplay: '₹ 1.84 Cr',
    type: 'Current Account',
    color: 'blue',
  },
  {
    id: 'icici',
    name: 'ICICI Bullion Overdraft',
    accountNumber: '4410',
    balance: 8250000.0,
    balanceDisplay: '₹ 82.5 Lakhs',
    type: 'OD / Metal Line',
    color: 'amber',
  },
  {
    id: 'sbi',
    name: 'SBI Current Account',
    accountNumber: '1102',
    balance: 4510000.0,
    balanceDisplay: '₹ 45.1 Lakhs',
    type: 'Primary Inward POS',
    color: 'emerald',
  },
];

const INITIAL_ENTRIES: BankBookEntry[] = [
  {
    id: '88990011-f6a1-b2c3-d4e5-112233445566',
    date: '2026-10-31 16:30',
    bank_name: 'HDFC Jewellery Current - 9021',
    utr_reference: 'HDFC263012903',
    party_name: 'Sunita Mehra (RTGS Bridal Advance)',
    transaction_type: 'CREDIT',
    amount: 550000.0,
    is_reconciled: true,
    category: 'Customer Advance',
  },
  {
    id: '88990011-f6a1-b2c3-d4e5-112233445567',
    date: '2026-10-31 15:15',
    bank_name: 'ICICI Bullion Overdraft - 4410',
    utr_reference: 'CMS-ICICI-881920',
    party_name: 'MMTC-PAMP India Bullion Gold Bar 999.9',
    transaction_type: 'DEBIT',
    amount: 4200000.0,
    is_reconciled: true,
    category: 'Bullion Purchase',
  },
  {
    id: '88990011-f6a1-b2c3-d4e5-112233445568',
    date: '2026-10-31 14:20',
    bank_name: 'SBI Current Account - 1102',
    utr_reference: 'SBI918230912',
    party_name: 'PineLabs Card Settlement Batch #912',
    transaction_type: 'CREDIT',
    amount: 346500.0,
    is_reconciled: true,
    category: 'POS EDC Swipe Settlement',
  },
  {
    id: '88990011-f6a1-b2c3-d4e5-112233445569',
    date: '2026-10-31 13:00',
    bank_name: 'HDFC Jewellery Current - 9021',
    utr_reference: 'NEFT-889021-UTR',
    party_name: 'Ketan Jewellers Wholesale Bangles Order',
    transaction_type: 'DEBIT',
    amount: 1250000.0,
    is_reconciled: false,
    category: 'Wholesale Supplier',
  },
  {
    id: '88990011-f6a1-b2c3-d4e5-112233445570',
    date: '2026-10-31 11:45',
    bank_name: 'HDFC Jewellery Current - 9021',
    utr_reference: 'CHQ-009182',
    party_name: 'Aditya Birla Corporate Gifting Cheque',
    transaction_type: 'CREDIT',
    amount: 780000.0,
    is_reconciled: false,
    category: 'Corporate Cheque Receipt',
  },
  {
    id: '88990011-f6a1-b2c3-d4e5-112233445571',
    date: '2026-10-31 10:30',
    bank_name: 'SBI Current Account - 1102',
    utr_reference: 'UPI-CR-90182490',
    party_name: 'Paytm QR Soundbox Counter Settlements',
    transaction_type: 'CREDIT',
    amount: 184500.0,
    is_reconciled: true,
    category: 'UPI Settlement',
  },
  {
    id: '88990011-f6a1-b2c3-d4e5-112233445572',
    date: '2026-10-31 09:15',
    bank_name: 'ICICI Bullion Overdraft - 4410',
    utr_reference: 'OD-INT-OCT2026',
    party_name: 'ICICI Bank Metal OD Facility Interest Debit',
    transaction_type: 'DEBIT',
    amount: 42500.0,
    is_reconciled: false,
    category: 'Bank Finance Charges',
  },
];

export function FinanceBankBookView() {
  const [entries, setEntries] = useState<BankBookEntry[]>(INITIAL_ENTRIES);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [selectedBankFilter, setSelectedBankFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Bank Entry State
  const [newBank, setNewBank] = useState('HDFC Jewellery Current - 9021');
  const [newType, setNewType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [newParty, setNewParty] = useState('');
  const [newUtr, setNewUtr] = useState('');
  const [newAmount, setNewAmount] = useState<number>(0);
  const [newCategory, setNewCategory] = useState('Customer Advance');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleVerifyUtr = (id: string) => {
    setEntries((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, is_reconciled: !item.is_reconciled } : item
      )
    );
    showToast('Transaction reconciliation status updated');
  };

  const handleCreateBankEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAmount <= 0 || !newParty) return;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newRecord: BankBookEntry = {
      id: crypto.randomUUID(),
      date: now,
      bank_name: newBank,
      utr_reference: newUtr || `UTR-${Date.now().toString().slice(-6)}`,
      party_name: newParty,
      transaction_type: newType,
      amount: Number(newAmount),
      is_reconciled: true,
      category: newCategory,
    };

    setEntries([newRecord, ...entries]);
    setIsRecordModalOpen(false);
    setNewParty('');
    setNewUtr('');
    setNewAmount(0);
    showToast(`Bank entry of ₹ ${newAmount.toLocaleString('en-IN')} recorded successfully`);
  };

  const pendingCount = entries.filter((e) => !e.is_reconciled).length;
  const reconciledPercent = (
    ((entries.length - pendingCount) / entries.length) *
    100
  ).toFixed(1);

  const filteredEntries = entries.filter((entry) => {
    if (selectedBankFilter === 'ALL') return true;
    return entry.bank_name.toLowerCase().includes(selectedBankFilter.toLowerCase());
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="bank_book_entries" />
      <ActionToolbar
        filterPlaceholder="Search by UTR reference, party entity, cheque number..."
        insertLabel="Record Bank Entry"
        onInsertClick={() => setIsRecordModalOpen(true)}
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
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Liquid Bank Balances</span>
                <Landmark className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">₹ 3.11 Cr</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Across 3 Active Current Accounts
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Auto-Reconciled</span>
                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700 font-mono">{reconciledPercent}%</div>
              <div className="text-[11px] text-neutral-500 mt-1">Bank statement API match</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Pending UTR Verifications</span>
                <Clock className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-amber-700 font-mono">{pendingCount} Entries</div>
              <div className="text-[11px] text-amber-600 mt-1">Awaiting bank clearance</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Available Overdraft Limit</span>
                <CreditCard className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">₹ 2.50 Cr</div>
              <div className="text-[11px] text-neutral-500 mt-1">ICICI Gold Metal Loan Facility</div>
            </div>
          </div>
        </div>

        {/* Bank Selector Chips Card */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-medium text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-neutral-500" /> Showroom Bank Accounts
            </span>
            <span className="text-xs text-neutral-500 font-mono">Instant automated statement sync active</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setSelectedBankFilter('ALL')}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                selectedBankFilter === 'ALL'
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                  : 'bg-[#f8fafc] text-neutral-800 border-[#e2e8f0] hover:border-neutral-300'
              }`}
            >
              <div className="text-[11px] uppercase tracking-wider opacity-75 mb-0.5">All Accounts</div>
              <div className="text-sm font-medium font-mono">All (₹ 3.11 Cr)</div>
              <div className="text-[10px] opacity-75 mt-1">Consolidated ledger view</div>
            </button>

            {BANK_ACCOUNTS.map((bank) => (
              <button
                key={bank.id}
                onClick={() => setSelectedBankFilter(bank.accountNumber)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  selectedBankFilter === bank.accountNumber
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                    : 'bg-[#f8fafc] text-neutral-800 border-[#e2e8f0] hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider opacity-75 mb-0.5">
                    {bank.type}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-200/50 text-neutral-700">
                    •••{bank.accountNumber}
                  </span>
                </div>
                <div className="text-sm font-medium font-mono">{bank.balanceDisplay}</div>
                <div className="text-[10px] opacity-75 mt-1 truncate">{bank.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Supabase-style Table */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  public.bank_book_entries
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Showing {filteredEntries.length} bank transactions
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
                        <span className="text-neutral-800">date</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">bank_name</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">utr_reference</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">party_name</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">transaction_type</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">amount (₹)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">reconciliation_status</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">actions</span>
                      </th>
                      <th className="w-16 px-3 py-2 text-center font-medium">uuid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb] text-neutral-800 font-mono">
                    {filteredEntries.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-600">
                          {row.date}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap font-sans text-neutral-900">
                          {row.bank_name}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700">
                          {row.utr_reference}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] font-sans text-neutral-900 max-w-xs truncate">
                          {row.party_name}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap">
                          {row.transaction_type === 'CREDIT' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ArrowDownLeft className="w-3 h-3 text-emerald-600" /> CREDIT
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-red-50 text-red-700 border border-red-200">
                              <ArrowUpRight className="w-3 h-3 text-red-600" /> DEBIT
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-right">
                          <span
                            className={
                              row.transaction_type === 'CREDIT'
                                ? 'text-emerald-700 font-medium'
                                : 'text-neutral-900 font-medium'
                            }
                          >
                            {row.transaction_type === 'CREDIT' ? '+' : '-'} ₹{' '}
                            {row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-center">
                          {row.is_reconciled ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> RECONCILED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-500" /> PENDING_CLEARANCE
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-center">
                          <button
                            onClick={() => handleVerifyUtr(row.id)}
                            className="px-2 py-1 text-[11px] rounded border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-sans cursor-pointer transition-colors"
                          >
                            {row.is_reconciled ? 'Flag Disputed' : 'Verify UTR'}
                          </button>
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.bank_book_entries (
                  <br />
                  &nbsp;&nbsp;id <span className="text-purple-400">UUID</span>{' '}
                  <span className="text-neutral-400">PRIMARY KEY DEFAULT gen_random_uuid()</span>,
                  <br />
                  &nbsp;&nbsp;date <span className="text-purple-400">TIMESTAMPTZ</span>{' '}
                  <span className="text-neutral-400">DEFAULT NOW()</span>,
                  <br />
                  &nbsp;&nbsp;bank_name <span className="text-purple-400">VARCHAR(100)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;utr_reference <span className="text-purple-400">VARCHAR(100)</span>{' '}
                  <span className="text-neutral-400">UNIQUE NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;party_name <span className="text-purple-400">VARCHAR(150)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;transaction_type <span className="text-purple-400">VARCHAR(10)</span>{' '}
                  <span className="text-neutral-400">CHECK (transaction_type IN (&apos;CREDIT&apos;, &apos;DEBIT&apos;))</span>,
                  <br />
                  &nbsp;&nbsp;amount <span className="text-purple-400">NUMERIC(12,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;is_reconciled <span className="text-purple-400">BOOLEAN</span>{' '}
                  <span className="text-neutral-400">DEFAULT FALSE</span>,
                  <br />
                  &nbsp;&nbsp;category <span className="text-purple-400">VARCHAR(50)</span>
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawer: Record Bank Entry / Cheque Receipt */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs transition-all">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-medium text-neutral-900">
                    Record Bank Entry / Cheque Receipt
                  </h3>
                </div>
                <button
                  onClick={() => setIsRecordModalOpen(false)}
                  className="p-1 hover:bg-neutral-200/60 rounded text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateBankEntry} className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Select Bank Account
                  </label>
                  <select
                    value={newBank}
                    onChange={(e) => setNewBank(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  >
                    <option value="HDFC Jewellery Current - 9021">HDFC Jewellery Current - 9021</option>
                    <option value="ICICI Bullion Overdraft - 4410">ICICI Bullion Overdraft - 4410</option>
                    <option value="SBI Current Account - 1102">SBI Current Account - 1102</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Transaction Direction
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewType('CREDIT')}
                      className={`py-2 px-3 text-xs rounded border transition-colors flex items-center justify-center gap-1.5 ${
                        newType === 'CREDIT'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-medium'
                          : 'bg-white border-[#e2e8f0] text-neutral-600'
                      }`}
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                      Credit (Deposit / Inward)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewType('DEBIT')}
                      className={`py-2 px-3 text-xs rounded border transition-colors flex items-center justify-center gap-1.5 ${
                        newType === 'DEBIT'
                          ? 'bg-red-50 border-red-300 text-red-800 font-medium'
                          : 'bg-white border-[#e2e8f0] text-neutral-600'
                      }`}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 text-red-600" />
                      Debit (Payout / Supplier)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Party / Entity Name
                  </label>
                  <input
                    type="text"
                    value={newParty}
                    onChange={(e) => setNewParty(e.target.value)}
                    placeholder="e.g. Ramesh Chandra (Bridal Advance) or Bullion Supplier"
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    UTR / Cheque Reference #
                  </label>
                  <input
                    type="text"
                    value={newUtr}
                    onChange={(e) => setNewUtr(e.target.value)}
                    placeholder="e.g. HDFC918203912 or CHQ-008129"
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newAmount || ''}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Ledger Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  >
                    <option value="Customer Advance">Customer Advance</option>
                    <option value="Bullion Purchase">Bullion Purchase</option>
                    <option value="POS EDC Swipe Settlement">POS EDC Swipe Settlement</option>
                    <option value="Wholesale Supplier">Wholesale Supplier</option>
                    <option value="Corporate Cheque Receipt">Corporate Cheque Receipt</option>
                    <option value="Bank Finance Charges">Bank Finance Charges</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRecordModalOpen(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Record Entry
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
