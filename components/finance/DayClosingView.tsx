'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Lock,
  Unlock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Scale,
  Coins,
  CreditCard,
  Flame,
  KeyRound,
  FileCheck,
  Copy,
  Check,
  Building,
  RotateCcw,
} from 'lucide-react';

interface DayClosingRecord {
  id: string;
  closing_date: string;
  total_sales_value: number;
  gold_weight_sold_g: number;
  cash_tallied: boolean;
  vault_status: 'LOCKED' | 'OPEN';
  closed_at: string;
  approved_by: string;
}

const INITIAL_CLOSINGS: DayClosingRecord[] = [
  {
    id: '33445566-e5f6-a1b2-c3d4-667788990011',
    closing_date: '2026-10-30',
    total_sales_value: 3840900.0,
    gold_weight_sold_g: 489.12,
    cash_tallied: true,
    vault_status: 'LOCKED',
    closed_at: '21:15',
    approved_by: 'Rajesh Gupta (General Manager)',
  },
  {
    id: '33445566-e5f6-a1b2-c3d4-667788990012',
    closing_date: '2026-10-29',
    total_sales_value: 4120500.0,
    gold_weight_sold_g: 524.35,
    cash_tallied: true,
    vault_status: 'LOCKED',
    closed_at: '21:20',
    approved_by: 'Rajesh Gupta (General Manager)',
  },
  {
    id: '33445566-e5f6-a1b2-c3d4-667788990013',
    closing_date: '2026-10-28',
    total_sales_value: 2950000.0,
    gold_weight_sold_g: 375.8,
    cash_tallied: true,
    vault_status: 'LOCKED',
    closed_at: '21:08',
    approved_by: 'Suresh Verma (Chief Custodian)',
  },
  {
    id: '33445566-e5f6-a1b2-c3d4-667788990014',
    closing_date: '2026-10-27',
    total_sales_value: 5120000.0,
    gold_weight_sold_g: 651.9,
    cash_tallied: true,
    vault_status: 'LOCKED',
    closed_at: '21:35',
    approved_by: 'Rajesh Gupta (General Manager)',
  },
];

export function FinanceDayClosingView() {
  const [closings, setClosings] = useState<DayClosingRecord[]>(INITIAL_CLOSINGS);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 4-step checklist state
  const [step1Cash, setStep1Cash] = useState(true);
  const [step2Gold, setStep2Gold] = useState(true);
  const [step3Card, setStep3Card] = useState(true);
  const [step4Scrap, setStep4Scrap] = useState(true);

  // Store Lock State
  const [isStoreLocked, setIsStoreLocked] = useState(true);
  const [managerPin, setManagerPin] = useState('****');
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

  const allStepsComplete = step1Cash && step2Gold && step3Card && step4Scrap;

  const handlePerformLock = () => {
    if (!allStepsComplete) {
      showToast('Please complete all 4 checklist steps before locking store');
      return;
    }

    setIsStoreLocked(true);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const today = new Date().toISOString().substring(0, 10);

    const newRecord: DayClosingRecord = {
      id: crypto.randomUUID(),
      closing_date: today,
      total_sales_value: 3840900.0,
      gold_weight_sold_g: 489.12,
      cash_tallied: true,
      vault_status: 'LOCKED',
      closed_at: nowTime,
      approved_by: 'Rajesh Gupta (Store General Manager)',
    };

    setClosings([newRecord, ...closings.filter((c) => c.closing_date !== today)]);
    showToast(`Store successfully locked at ${nowTime}. Billing frozen until tomorrow 09:00 AM.`);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="day_closing_reports" />
      <ActionToolbar
        filterPlaceholder="Search closing archives by date, approver, sales..."
        insertLabel="Perform Store Lock"
        onInsertClick={handlePerformLock}
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
                <span className="text-[11px] font-medium uppercase tracking-wider">Today&apos;s Total Sales</span>
                <Coins className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">₹ 38,40,900</div>
              <div className="text-[11px] text-neutral-500 mt-1">Gross POS Invoices Generated</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Gold Weight Sold</span>
                <Scale className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-amber-700 font-mono">489.120 g</div>
              <div className="text-[11px] text-neutral-500 mt-1">Calibrated net fine gold</div>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-200 hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-emerald-800 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Cash Drawer Tallied</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-900 font-mono">100% Match</div>
              <div className="text-[11px] text-emerald-700 mt-1">₹ 9,76,500 Physical = Book</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Safe Vault Status</span>
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                LOCKED (21:15)
              </div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                Dual Biometric Verified
              </div>
            </div>
          </div>
        </div>

        {/* Interactive 4-Step EOD Checklist & Lock Card */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between">
            {/* Left: 4-Step Checklist */}
            <div className="flex-1 w-full space-y-2.5">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium text-neutral-800 uppercase tracking-wider">
                  Mandatory 4-Step End-of-Day Store Closing Protocol
                </span>
              </div>

              <div className="space-y-2">
                {/* Step 1 */}
                <label className="flex items-center justify-between p-2.5 rounded-md bg-white border border-[#e2e8f0] hover:border-emerald-300 transition-colors cursor-pointer text-xs">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={step1Cash}
                      onChange={(e) => setStep1Cash(e.target.checked)}
                      className="rounded border-neutral-300 text-emerald-600 focus:ring-0 w-4 h-4"
                    />
                    <div>
                      <div className="font-medium text-neutral-900">
                        1. Counter Cash Drawer Tally & Safe Deposit
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        Software ₹ 9,76,500.00 vs Physical Counted ₹ 9,76,500.00 (Zero Variance)
                      </div>
                    </div>
                  </div>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-mono border border-emerald-200">
                    MATCHED
                  </span>
                </label>

                {/* Step 2 */}
                <label className="flex items-center justify-between p-2.5 rounded-md bg-white border border-[#e2e8f0] hover:border-emerald-300 transition-colors cursor-pointer text-xs">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={step2Gold}
                      onChange={(e) => setStep2Gold(e.target.checked)}
                      className="rounded border-neutral-300 text-emerald-600 focus:ring-0 w-4 h-4"
                    />
                    <div>
                      <div className="font-medium text-neutral-900">
                        2. Safe Vault Gold Physical Balance Audit
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        Opening 14,850.40g + Inward 450.20g - Outward 382.15g = Closing 14,918.45g
                      </div>
                    </div>
                  </div>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-mono border border-emerald-200">
                    VERIFIED
                  </span>
                </label>

                {/* Step 3 */}
                <label className="flex items-center justify-between p-2.5 rounded-md bg-white border border-[#e2e8f0] hover:border-emerald-300 transition-colors cursor-pointer text-xs">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={step3Card}
                      onChange={(e) => setStep3Card(e.target.checked)}
                      className="rounded border-neutral-300 text-emerald-600 focus:ring-0 w-4 h-4"
                    />
                    <div>
                      <div className="font-medium text-neutral-900">
                        3. EDC Credit Card & UPI Machine Batch Settlements Closed
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        PineLabs Plutus #01 & #02 Batch #BAT-912 Closed (Gross: ₹ 22,40,000.00)
                      </div>
                    </div>
                  </div>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-mono border border-emerald-200">
                    SETTLED
                  </span>
                </label>

                {/* Step 4 */}
                <label className="flex items-center justify-between p-2.5 rounded-md bg-white border border-[#e2e8f0] hover:border-emerald-300 transition-colors cursor-pointer text-xs">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={step4Scrap}
                      onChange={(e) => setStep4Scrap(e.target.checked)}
                      className="rounded border-neutral-300 text-emerald-600 focus:ring-0 w-4 h-4"
                    />
                    <div>
                      <div className="font-medium text-neutral-900">
                        4. Old Gold Scrap Locked in Melting Locker
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        184.65g Exchange Scrap sealed in Fireproof Melting Box #04
                      </div>
                    </div>
                  </div>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-mono border border-emerald-200">
                    SEALED
                  </span>
                </label>
              </div>
            </div>

            {/* Right: Electronic PIN & Store Lock Button */}
            <div className="w-full lg:w-72 bg-white p-3.5 rounded-lg border border-[#e2e8f0] flex flex-col justify-between shrink-0 font-mono">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <KeyRound className="w-4 h-4 text-neutral-700" />
                  <span className="text-xs font-medium font-sans text-neutral-800">
                    General Manager PIN Sign-off
                  </span>
                </div>
                <div className="text-[11px] font-sans text-neutral-500 mb-2">
                  Electronic cryptographic signature by Rajesh Gupta (GM #0104)
                </div>
                <input
                  type="password"
                  value={managerPin}
                  onChange={(e) => setManagerPin(e.target.value)}
                  placeholder="Enter 4-digit PIN"
                  className="w-full px-3 py-1.5 text-center text-sm tracking-widest border border-neutral-300 rounded bg-neutral-50 focus:bg-white focus:outline-none mb-3"
                />
              </div>

              <button
                onClick={handlePerformLock}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-xs font-medium text-white transition-colors shadow-2xs cursor-pointer ${
                  allStepsComplete
                    ? 'bg-neutral-900 hover:bg-neutral-800'
                    : 'bg-neutral-400 cursor-not-allowed'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                Perform End-of-Day Store Lock
              </button>
              <div className="text-[10px] text-neutral-400 text-center mt-1.5 font-sans">
                Locks POS billing till next morning 09:00 AM
              </div>
            </div>
          </div>
        </div>

        {/* Supabase-style Table */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  public.day_closing_reports
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Showing {closings.length} EOD audit logs
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
                        <span className="text-neutral-800">closing_date</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">total_sales_value (₹)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">gold_sold (g)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">cash_tallied</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">vault_status</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">closed_at</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">approved_by</span>
                      </th>
                      <th className="w-16 px-3 py-2 text-center font-medium">uuid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb] text-neutral-800 font-mono">
                    {closings.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700">
                          {row.closing_date}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-right font-medium text-neutral-900">
                          ₹ {row.total_sales_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-right text-amber-700 font-medium">
                          {row.gold_weight_sold_g.toFixed(3)} g
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 100% MATCH
                          </span>
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-neutral-900 text-neutral-100">
                            <Lock className="w-3 h-3 text-amber-400" /> {row.vault_status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-600">
                          {row.closed_at}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap font-sans text-neutral-700">
                          {row.approved_by}
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.day_closing_reports (
                  <br />
                  &nbsp;&nbsp;id <span className="text-purple-400">UUID</span>{' '}
                  <span className="text-neutral-400">PRIMARY KEY DEFAULT gen_random_uuid()</span>,
                  <br />
                  &nbsp;&nbsp;closing_date <span className="text-purple-400">DATE</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;total_sales_value <span className="text-purple-400">NUMERIC(12,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;gold_weight_sold_g <span className="text-purple-400">NUMERIC(10,3)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;cash_tallied <span className="text-purple-400">BOOLEAN</span>{' '}
                  <span className="text-neutral-400">DEFAULT TRUE</span>,
                  <br />
                  &nbsp;&nbsp;vault_status <span className="text-purple-400">VARCHAR(20)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;LOCKED&apos;</span>,
                  <br />
                  &nbsp;&nbsp;closed_at <span className="text-purple-400">VARCHAR(10)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;approved_by <span className="text-purple-400">VARCHAR(100)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
