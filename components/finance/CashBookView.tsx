'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Wallet,
  Coins,
  CheckCircle2,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Copy,
  Check,
  X,
  ShieldCheck,
  Building2,
  Sparkles,
  Lock,
  FileText,
  BadgeIndianRupee,
  RotateCcw,
} from 'lucide-react';

interface CashBookEntry {
  id: string;
  entry_time: string;
  type: 'INFLOW' | 'OUTFLOW' | 'VAULT_TRANSFER';
  particulars: string;
  amount: number;
  drawer_balance: number;
  cashier_name: string;
  reference_no: string;
}

const INITIAL_ENTRIES: CashBookEntry[] = [
  {
    id: '77889900-e5f6-a1b2-c3d4-001122334455',
    entry_time: '2026-10-31 16:45',
    type: 'INFLOW',
    particulars: 'POS Bill #POS-2026-1042 (Diamond Bridal Choker balance)',
    amount: 145000.0,
    drawer_balance: 976500.0,
    cashier_name: 'Priya Sharma (Counter 1)',
    reference_no: 'POS-2026-1042',
  },
  {
    id: '77889900-e5f6-a1b2-c3d4-001122334456',
    entry_time: '2026-10-31 15:10',
    type: 'OUTFLOW',
    particulars: 'Petty Cash - Security Guard Shift Refreshments & Water Cans',
    amount: 1500.0,
    drawer_balance: 831500.0,
    cashier_name: 'Ramesh Patel (Head Cashier)',
    reference_no: 'PCV-2026-031',
  },
  {
    id: '77889900-e5f6-a1b2-c3d4-001122334457',
    entry_time: '2026-10-31 14:05',
    type: 'INFLOW',
    particulars: 'Customer Advance Deposit - 22K Gold Temple Necklace #ADV-491',
    amount: 250000.0,
    drawer_balance: 833000.0,
    cashier_name: 'Priya Sharma (Counter 1)',
    reference_no: 'ADV-491',
  },
  {
    id: '77889900-e5f6-a1b2-c3d4-001122334458',
    entry_time: '2026-10-31 12:30',
    type: 'VAULT_TRANSFER',
    particulars: 'Mid-Day Vault Drop - Transfer excess cash to Main Fireproof Safe',
    amount: 500000.0,
    drawer_balance: 583000.0,
    cashier_name: 'Suresh Verma (Vault Custodian)',
    reference_no: 'VLT-TRF-084',
  },
  {
    id: '77889900-e5f6-a1b2-c3d4-001122334459',
    entry_time: '2026-10-31 11:20',
    type: 'INFLOW',
    particulars: 'POS Bill #POS-2026-1038 (24K Gold Minted Bars 20g)',
    amount: 172000.0,
    drawer_balance: 1083000.0,
    cashier_name: 'Anjali Nair (Counter 2)',
    reference_no: 'POS-2026-1038',
  },
  {
    id: '77889900-e5f6-a1b2-c3d4-001122334460',
    entry_time: '2026-10-31 10:15',
    type: 'INFLOW',
    particulars: 'POS Bill #POS-2026-1031 (Silver Puja Thali Set & Diya)',
    amount: 278000.0,
    drawer_balance: 911000.0,
    cashier_name: 'Priya Sharma (Counter 1)',
    reference_no: 'POS-2026-1031',
  },
  {
    id: '77889900-e5f6-a1b2-c3d4-001122334461',
    entry_time: '2026-10-31 09:30',
    type: 'OUTFLOW',
    particulars: 'Petty Cash - Courier delivery fee for hallmarking certificates',
    amount: 2000.0,
    drawer_balance: 633000.0,
    cashier_name: 'Ramesh Patel (Head Cashier)',
    reference_no: 'PCV-2026-030',
  },
  {
    id: '77889900-e5f6-a1b2-c3d4-001122334462',
    entry_time: '2026-10-31 09:00',
    type: 'INFLOW',
    particulars: 'Day Opening Cash Float from Safe Vault #01',
    amount: 150000.0,
    drawer_balance: 150000.0,
    cashier_name: 'Ramesh Patel (Head Cashier)',
    reference_no: 'OPN-FLOAT-20261031',
  },
];

export function FinanceCashBookView() {
  const [entries, setEntries] = useState<CashBookEntry[]>(INITIAL_ENTRIES);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Denominations count state (matching ₹9,76,500 Net Drawer Balance)
  const [notes500, setNotes500] = useState<number>(1850); // 9,25,000
  const [notes200, setNotes200] = useState<number>(200);  // 40,000
  const [notes100, setNotes100] = useState<number>(90);   // 9,000
  const [notes50, setNotes50] = useState<number>(40);     // 2,000
  const [notes20, setNotes20] = useState<number>(20);     // 400
  const [notes10, setNotes10] = useState<number>(10);     // 100
  // 925000 + 40000 + 9000 + 2000 + 400 + 100 = 9,76,500

  // Modals
  const [isVaultDrawerOpen, setIsVaultDrawerOpen] = useState(false);
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Vault Transfer Form State
  const [vaultAmount, setVaultAmount] = useState<number>(500000);
  const [vaultCustodian, setVaultCustodian] = useState('Suresh Verma (Vault Custodian)');
  const [vaultRemarks, setVaultRemarks] = useState('End-of-day excess cash deposit into Safe Locker #A2');

  // New Cash Entry Form State
  const [newType, setNewType] = useState<'INFLOW' | 'OUTFLOW'>('INFLOW');
  const [newParticulars, setNewParticulars] = useState('');
  const [newAmount, setNewAmount] = useState<number>(0);
  const [newRef, setNewRef] = useState('');

  const currentBookBalance = entries.length > 0 ? entries[0].drawer_balance : 0;
  const countedTotal =
    notes500 * 500 +
    notes200 * 200 +
    notes100 * 100 +
    notes50 * 50 +
    notes20 * 20 +
    notes10 * 10;
  const variance = countedTotal - currentBookBalance;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleVaultTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (vaultAmount <= 0) return;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newBal = currentBookBalance - Number(vaultAmount);

    const newRecord: CashBookEntry = {
      id: crypto.randomUUID(),
      entry_time: now,
      type: 'VAULT_TRANSFER',
      particulars: `Safe Vault Handover - ${vaultRemarks}`,
      amount: Number(vaultAmount),
      drawer_balance: newBal,
      cashier_name: vaultCustodian,
      reference_no: `VLT-TRF-${Math.floor(100 + Math.random() * 900)}`,
    };

    setEntries([newRecord, ...entries]);
    setIsVaultDrawerOpen(false);
    showToast(`Transferred ₹ ${vaultAmount.toLocaleString('en-IN')} securely to Safe Vault`);
  };

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAmount <= 0 || !newParticulars) return;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newBal =
      newType === 'INFLOW'
        ? currentBookBalance + Number(newAmount)
        : currentBookBalance - Number(newAmount);

    const newRecord: CashBookEntry = {
      id: crypto.randomUUID(),
      entry_time: now,
      type: newType,
      particulars: newParticulars,
      amount: Number(newAmount),
      drawer_balance: newBal,
      cashier_name: 'Ramesh Patel (Head Cashier)',
      reference_no: newRef || `REF-${Date.now().toString().slice(-4)}`,
    };

    setEntries([newRecord, ...entries]);
    setIsNewEntryOpen(false);
    setNewParticulars('');
    setNewAmount(0);
    setNewRef('');
    showToast(`Recorded ${newType} entry of ₹ ${newAmount.toLocaleString('en-IN')}`);
  };

  const filteredEntries = entries.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.particulars.toLowerCase().includes(q) ||
      item.reference_no.toLowerCase().includes(q) ||
      item.cashier_name.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="counter_cash_book" />
      <ActionToolbar
        filterPlaceholder="Filter by bill #, voucher, cashier, type..."
        insertLabel="New Cash Entry"
        onInsertClick={() => setIsNewEntryOpen(true)}
      />

      {toastMessage && (
        <div className="fixed top-12 right-6 z-50 bg-neutral-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 border border-neutral-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Opening Drawer Cash</span>
                <Wallet className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">₹ 1,50,000</div>
              <div className="text-[11px] text-neutral-500 mt-1">Float issued at 09:00 AM</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Today&apos;s Cash Inflow</span>
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700 font-mono">₹ 8,45,000</div>
              <div className="text-[11px] text-emerald-600 mt-1">POS bills & advances</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Cash Outflow / Petty</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-amber-700 font-mono">₹ 18,500</div>
              <div className="text-[11px] text-neutral-500 mt-1">Store overheads & couriers</div>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-200 hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-emerald-800 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Net Drawer Balance</span>
                <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div className="text-xl font-medium text-emerald-900 font-mono">
                ₹ {currentBookBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Book Balance
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Denomination Counter Drawer & Vault Handover Card */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] shadow-2xs flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between">
            {/* Left: Denomination counting inputs */}
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-neutral-800 uppercase tracking-wider">
                    Counter Denomination Physical Tally Tool
                  </span>
                </div>
                <button
                  onClick={() => {
                    setNotes500(1850);
                    setNotes200(200);
                    setNotes100(90);
                    setNotes50(40);
                    setNotes20(20);
                    setNotes10(10);
                  }}
                  className="text-[11px] font-medium text-neutral-500 hover:text-neutral-800 flex items-center gap-1 cursor-pointer"
                  title="Reset to calculated total"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 font-mono text-xs">
                <div className="bg-white p-2 rounded border border-[#e2e8f0]">
                  <label className="text-[10px] text-neutral-500 block mb-1">₹500 Notes</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      value={notes500}
                      onChange={(e) => setNotes500(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-1.5 py-1 text-xs border border-neutral-200 rounded text-neutral-900 bg-neutral-50 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 block mt-1 text-right">
                    ₹ {(notes500 * 500).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="bg-white p-2 rounded border border-[#e2e8f0]">
                  <label className="text-[10px] text-neutral-500 block mb-1">₹200 Notes</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      value={notes200}
                      onChange={(e) => setNotes200(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-1.5 py-1 text-xs border border-neutral-200 rounded text-neutral-900 bg-neutral-50 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 block mt-1 text-right">
                    ₹ {(notes200 * 200).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="bg-white p-2 rounded border border-[#e2e8f0]">
                  <label className="text-[10px] text-neutral-500 block mb-1">₹100 Notes</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      value={notes100}
                      onChange={(e) => setNotes100(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-1.5 py-1 text-xs border border-neutral-200 rounded text-neutral-900 bg-neutral-50 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 block mt-1 text-right">
                    ₹ {(notes100 * 100).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="bg-white p-2 rounded border border-[#e2e8f0]">
                  <label className="text-[10px] text-neutral-500 block mb-1">₹50 Notes</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      value={notes50}
                      onChange={(e) => setNotes50(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-1.5 py-1 text-xs border border-neutral-200 rounded text-neutral-900 bg-neutral-50 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 block mt-1 text-right">
                    ₹ {(notes50 * 50).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="bg-white p-2 rounded border border-[#e2e8f0]">
                  <label className="text-[10px] text-neutral-500 block mb-1">₹20 Notes</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      value={notes20}
                      onChange={(e) => setNotes20(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-1.5 py-1 text-xs border border-neutral-200 rounded text-neutral-900 bg-neutral-50 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 block mt-1 text-right">
                    ₹ {(notes20 * 20).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="bg-white p-2 rounded border border-[#e2e8f0]">
                  <label className="text-[10px] text-neutral-500 block mb-1">₹10 Coins/Notes</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      value={notes10}
                      onChange={(e) => setNotes10(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-1.5 py-1 text-xs border border-neutral-200 rounded text-neutral-900 bg-neutral-50 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 block mt-1 text-right">
                    ₹ {(notes10 * 10).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Variance Indicator & Vault Drop Button */}
            <div className="w-full lg:w-72 bg-white p-3.5 rounded-lg border border-[#e2e8f0] flex flex-col justify-between shrink-0 font-mono">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-neutral-500">Physical Counted:</span>
                <span className="font-medium text-neutral-900">₹ {countedTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-neutral-500">Book Balance:</span>
                <span className="font-medium text-neutral-900">₹ {currentBookBalance.toLocaleString('en-IN')}</span>
              </div>

              <div
                className={`p-2 rounded text-xs mb-3 flex items-center justify-between ${
                  variance === 0
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {variance === 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="font-medium">
                    {variance === 0 ? '₹ 0.00 Variance' : `₹ ${variance.toLocaleString('en-IN')} Variance`}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-sans">
                  {variance === 0 ? 'Perfect Tally' : 'Mismatch'}
                </span>
              </div>

              <button
                onClick={() => setIsVaultDrawerOpen(true)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer w-full"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                Handover Cash to Safe Vault
              </button>
            </div>
          </div>
        </div>

        {/* Supabase-style Table */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  public.counter_cash_book
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Showing {filteredEntries.length} drawer audit logs
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
                        <span className="text-neutral-800">entry_time</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">type</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">particulars</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">reference_no</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">amount (₹)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">running_drawer_balance (₹)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">authorized_by</span>
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
                          {row.entry_time}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap">
                          {row.type === 'INFLOW' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ArrowDownLeft className="w-3 h-3 text-emerald-600" /> INFLOW
                            </span>
                          )}
                          {row.type === 'OUTFLOW' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-red-50 text-red-700 border border-red-200">
                              <ArrowUpRight className="w-3 h-3 text-red-600" /> OUTFLOW
                            </span>
                          )}
                          {row.type === 'VAULT_TRANSFER' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-amber-50 text-amber-800 border border-amber-200">
                              <Lock className="w-3 h-3 text-amber-600" /> VAULT DROP
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] font-sans text-neutral-900 max-w-sm truncate">
                          {row.particulars}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700">
                          {row.reference_no}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-right">
                          <span
                            className={
                              row.type === 'INFLOW'
                                ? 'text-emerald-700 font-medium'
                                : row.type === 'OUTFLOW'
                                ? 'text-red-700 font-medium'
                                : 'text-amber-800 font-medium'
                            }
                          >
                            {row.type === 'INFLOW' ? '+' : '-'} ₹{' '}
                            {row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-right text-neutral-900">
                          ₹ {row.drawer_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap font-sans text-neutral-600">
                          {row.cashier_name}
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.counter_cash_book (
                  <br />
                  &nbsp;&nbsp;id <span className="text-purple-400">UUID</span>{' '}
                  <span className="text-neutral-400">PRIMARY KEY DEFAULT gen_random_uuid()</span>,
                  <br />
                  &nbsp;&nbsp;entry_time <span className="text-purple-400">TIMESTAMPTZ</span>{' '}
                  <span className="text-neutral-400">DEFAULT NOW()</span>,
                  <br />
                  &nbsp;&nbsp;type <span className="text-purple-400">VARCHAR(20)</span>{' '}
                  <span className="text-neutral-400">CHECK (type IN (&apos;INFLOW&apos;, &apos;OUTFLOW&apos;, &apos;VAULT_TRANSFER&apos;))</span>,
                  <br />
                  &nbsp;&nbsp;particulars <span className="text-purple-400">TEXT</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;reference_no <span className="text-purple-400">VARCHAR(50)</span>,
                  <br />
                  &nbsp;&nbsp;amount <span className="text-purple-400">NUMERIC(12,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;drawer_balance <span className="text-purple-400">NUMERIC(12,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;authorized_by <span className="text-purple-400">VARCHAR(100)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawer: Handover Cash to Safe Vault */}
      {isVaultDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs transition-all">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-medium text-neutral-900">
                    Safe Vault Cash Handover
                  </h3>
                </div>
                <button
                  onClick={() => setIsVaultDrawerOpen(false)}
                  className="p-1 hover:bg-neutral-200/60 rounded text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleVaultTransfer} className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Vault Transfer Amount (₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={currentBookBalance}
                    value={vaultAmount}
                    onChange={(e) => setVaultAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    required
                  />
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Maximum available in drawer: ₹ {currentBookBalance.toLocaleString('en-IN')}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Chief Vault Custodian / Receiving Officer
                  </label>
                  <select
                    value={vaultCustodian}
                    onChange={(e) => setVaultCustodian(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  >
                    <option value="Suresh Verma (Vault Custodian)">Suresh Verma (Chief Vault Custodian - Safe A)</option>
                    <option value="Rajesh Gupta (Store General Manager)">Rajesh Gupta (Store General Manager)</option>
                    <option value="Mohan Rao (Head Auditor)">Mohan Rao (Head Auditor)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Handover Narration / Safe Compartment
                  </label>
                  <textarea
                    rows={3}
                    value={vaultRemarks}
                    onChange={(e) => setVaultRemarks(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    placeholder="e.g. End-of-day excess cash deposit into Safe Locker #A2"
                  />
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-[11px] text-amber-800 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Transfers automatically decrement counter drawer float and generate dual-signed vault receipt log for audit compliance.
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsVaultDrawerOpen(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Confirm Vault Handover
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Drawer: Record New Counter Cash Entry */}
      {isNewEntryOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs transition-all">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
                <div className="flex items-center gap-2">
                  <BadgeIndianRupee className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-medium text-neutral-900">
                    Record Counter Cash Entry
                  </h3>
                </div>
                <button
                  onClick={() => setIsNewEntryOpen(false)}
                  className="p-1 hover:bg-neutral-200/60 rounded text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateEntry} className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Transaction Direction
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewType('INFLOW')}
                      className={`py-2 px-3 text-xs rounded border transition-colors flex items-center justify-center gap-1.5 ${
                        newType === 'INFLOW'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-medium'
                          : 'bg-white border-[#e2e8f0] text-neutral-600'
                      }`}
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                      Cash Inflow
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewType('OUTFLOW')}
                      className={`py-2 px-3 text-xs rounded border transition-colors flex items-center justify-center gap-1.5 ${
                        newType === 'OUTFLOW'
                          ? 'bg-red-50 border-red-300 text-red-800 font-medium'
                          : 'bg-white border-[#e2e8f0] text-neutral-600'
                      }`}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 text-red-600" />
                      Cash Outflow
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Particulars & Customer / Bill Description
                  </label>
                  <input
                    type="text"
                    value={newParticulars}
                    onChange={(e) => setNewParticulars(e.target.value)}
                    placeholder="e.g. POS Bill #POS-2026-1045 or Tea Vendor Petty Cash"
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Reference Voucher / POS Bill #
                  </label>
                  <input
                    type="text"
                    value={newRef}
                    onChange={(e) => setNewRef(e.target.value)}
                    placeholder="e.g. POS-2026-1045 or PCV-032"
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
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

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewEntryOpen(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Add Cash Record
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
