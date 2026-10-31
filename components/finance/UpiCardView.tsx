'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  ArrowUpRight,
  Monitor,
  RefreshCw,
  Copy,
  Check,
  X,
  ShieldCheck,
  Building2,
  Percent,
  SlidersHorizontal,
  FileCheck,
} from 'lucide-react';

interface SettlementRecord {
  id: string;
  pos_machine: string;
  card_type: 'Visa' | 'Mastercard' | 'RuPay' | 'UPI QR' | 'Amex';
  batch_no: string;
  gross_swipe: number;
  mdr_deducted: number;
  net_credited: number;
  settlement_utr: string;
  settled_at: string;
  status: 'SETTLED' | 'PROCESSING' | 'DISPUTED';
}

const INITIAL_SETTLEMENTS: SettlementRecord[] = [
  {
    id: '99001122-a1b2-c3d4-e5f6-223344556677',
    pos_machine: 'PineLabs Plutus Terminal #01',
    card_type: 'Visa',
    batch_no: 'BAT-912',
    gross_swipe: 350000.0,
    mdr_deducted: 3500.0,
    net_credited: 346500.0,
    settlement_utr: 'UTR-PINELABS-9021',
    settled_at: '2026-10-31 16:15',
    status: 'SETTLED',
  },
  {
    id: '99001122-a1b2-c3d4-e5f6-223344556678',
    pos_machine: 'PineLabs Plutus Terminal #02',
    card_type: 'Mastercard',
    batch_no: 'BAT-912',
    gross_swipe: 620000.0,
    mdr_deducted: 6200.0,
    net_credited: 613800.0,
    settlement_utr: 'UTR-PINELABS-9022',
    settled_at: '2026-10-31 15:40',
    status: 'SETTLED',
  },
  {
    id: '99001122-a1b2-c3d4-e5f6-223344556679',
    pos_machine: 'Paytm UPI Soundbox Pro',
    card_type: 'UPI QR',
    batch_no: 'BAT-912',
    gross_swipe: 285000.0,
    mdr_deducted: 0.0,
    net_credited: 285000.0,
    settlement_utr: 'PYTM-RTGS-88190',
    settled_at: '2026-10-31 14:55',
    status: 'SETTLED',
  },
  {
    id: '99001122-a1b2-c3d4-e5f6-223344556680',
    pos_machine: 'Razorpay POS Android EDC',
    card_type: 'RuPay',
    batch_no: 'BAT-912',
    gross_swipe: 415000.0,
    mdr_deducted: 3735.0,
    net_credited: 411265.0,
    settlement_utr: 'RZP-SETTL-3391',
    settled_at: '2026-10-31 13:20',
    status: 'SETTLED',
  },
  {
    id: '99001122-a1b2-c3d4-e5f6-223344556681',
    pos_machine: 'PineLabs Plutus Terminal #01',
    card_type: 'Amex',
    batch_no: 'BAT-911',
    gross_swipe: 570000.0,
    mdr_deducted: 8965.0,
    net_credited: 561035.0,
    settlement_utr: 'AMEX-DIR-8812',
    settled_at: '2026-10-31 11:10',
    status: 'SETTLED',
  },
];

export function FinanceUpiCardView() {
  const [settlements, setSettlements] = useState<SettlementRecord[]>(INITIAL_SETTLEMENTS);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals & drawers
  const [isVerifyBatchOpen, setIsVerifyBatchOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState('BAT-912');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleVerifyBatchAction = () => {
    setIsVerifyBatchOpen(false);
    showToast(`Batch ${selectedBatch} audited and matched against Bank Nodal Settlement!`);
  };

  const totalGross = settlements.reduce((acc, curr) => acc + curr.gross_swipe, 0);
  const totalMdr = settlements.reduce((acc, curr) => acc + curr.mdr_deducted, 0);
  const totalNet = settlements.reduce((acc, curr) => acc + curr.net_credited, 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="card_upi_settlements" />
      <ActionToolbar
        filterPlaceholder="Filter by POS machine, terminal ID, batch number, UTR..."
        insertLabel="Verify Batch Settlement"
        onInsertClick={() => setIsVerifyBatchOpen(true)}
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
                <span className="text-[11px] font-medium uppercase tracking-wider">Today&apos;s Card/UPI Volume</span>
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">₹ 22.40 Lakhs</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live EDC Stream
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Swipe Swipes Count</span>
                <QrCode className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">38 Transactions</div>
              <div className="text-[11px] text-neutral-500 mt-1">Zero terminal declines</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Estimated MDR Charges</span>
                <Percent className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-amber-700 font-mono">₹ 22,400 (1.0%)</div>
              <div className="text-[11px] text-neutral-500 mt-1">Average blended merchant fee</div>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-200 hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-emerald-800 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Net Credited to Bank</span>
                <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div className="text-xl font-medium text-emerald-900 font-mono">₹ 22,17,600</div>
              <div className="text-[11px] text-emerald-700 mt-1 font-mono">Direct Nodal Settlement</div>
            </div>
          </div>
        </div>

        {/* Settlement Batch Status Banner */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-900">
                    Active Settlement Batch: BAT-912
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                    ONLINE & SYNCED
                  </span>
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  Connected Terminals: PineLabs #01, PineLabs #02, Paytm Soundbox, Razorpay POS • Auto Close: 22:00 Daily
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center">
              <button
                onClick={() => setIsVerifyBatchOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                Audit & Close Batch
              </button>
            </div>
          </div>
        </div>

        {/* Supabase-style Table */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  public.card_upi_settlements
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Showing {settlements.length} settlement batches
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
                        <span className="text-neutral-800">pos_machine</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">card_type</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">batch_no</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">gross_swipe (₹)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">mdr_deducted (₹)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">net_credited (₹)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">settlement_utr</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">status</span>
                      </th>
                      <th className="w-16 px-3 py-2 text-center font-medium">uuid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb] text-neutral-800 font-mono">
                    {settlements.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap font-sans text-neutral-900">
                          {row.pos_machine}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-neutral-100 text-neutral-800 border border-neutral-200">
                            {row.card_type}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700">
                          {row.batch_no}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-right font-medium text-neutral-900">
                          ₹ {row.gross_swipe.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-right text-amber-700 font-medium">
                          - ₹ {row.mdr_deducted.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-right text-emerald-700 font-medium">
                          ₹ {row.net_credited.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-600">
                          {row.settlement_utr}
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.card_upi_settlements (
                  <br />
                  &nbsp;&nbsp;id <span className="text-purple-400">UUID</span>{' '}
                  <span className="text-neutral-400">PRIMARY KEY DEFAULT gen_random_uuid()</span>,
                  <br />
                  &nbsp;&nbsp;pos_machine <span className="text-purple-400">VARCHAR(100)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;card_type <span className="text-purple-400">VARCHAR(20)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;batch_no <span className="text-purple-400">VARCHAR(50)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;gross_swipe <span className="text-purple-400">NUMERIC(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;mdr_deducted <span className="text-purple-400">NUMERIC(8,2)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0.00</span>,
                  <br />
                  &nbsp;&nbsp;net_credited <span className="text-purple-400">NUMERIC(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;settlement_utr <span className="text-purple-400">VARCHAR(100)</span>,
                  <br />
                  &nbsp;&nbsp;settled_at <span className="text-purple-400">TIMESTAMPTZ</span>{' '}
                  <span className="text-neutral-400">DEFAULT NOW()</span>,
                  <br />
                  &nbsp;&nbsp;status <span className="text-purple-400">VARCHAR(20)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;SETTLED&apos;</span>
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Verify Settlement Batch */}
      {isVerifyBatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-2xl border border-[#e5e7eb] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">
                  Verify POS Settlement Batch #BAT-912
                </h3>
              </div>
              <button
                onClick={() => setIsVerifyBatchOpen(false)}
                className="p-1 hover:bg-neutral-200/60 rounded text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-neutral-50 rounded border border-neutral-200 text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Gross EDC Swipes:</span>
                  <span className="font-medium text-neutral-900">₹ {totalGross.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Merchant MDR Fees:</span>
                  <span className="font-medium text-amber-700">- ₹ {totalMdr.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-200 pt-1.5">
                  <span className="text-neutral-700 font-medium font-sans">Net Bank Credit:</span>
                  <span className="font-medium text-emerald-700">₹ {totalNet.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-[11px] text-emerald-800 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Bank reconciliation engine verified settlement hash with PineLabs Plutus Cloud Gateway and SBI Nodal Account #1102.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsVerifyBatchOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerifyBatchAction}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Confirm Batch Settlement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
