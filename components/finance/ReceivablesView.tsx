'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Send,
  Copy,
  Check,
  X,
  Plus,
  BadgeAlert,
  ArrowDownLeft,
  Calendar,
  MessageSquare,
  Sparkles,
  CreditCard,
} from 'lucide-react';

interface ReceivableRecord {
  id: string;
  entity_name: string;
  invoice_no: string;
  invoice_date: string;
  amount_due: number;
  due_date: string;
  aging_bucket: 'CURRENT' | '30_DAYS' | '60_DAYS' | '90_DAYS_OVERDUE';
  contact_phone: string;
}

const INITIAL_RECEIVABLES: ReceivableRecord[] = [
  {
    id: '11223344-c3d4-e5f6-a1b2-445566778899',
    entity_name: 'GMR Corporate Gifting Services',
    invoice_no: 'INV-26-0710',
    invoice_date: '2026-10-20',
    amount_due: 380000.0,
    due_date: '2026-11-10',
    aging_bucket: 'CURRENT',
    contact_phone: '+91 98490 12345',
  },
  {
    id: '11223344-c3d4-e5f6-a1b2-445566778900',
    entity_name: 'Dr. Radhika Rao (Bridal Polki Suite Credit)',
    invoice_no: 'INV-26-0685',
    invoice_date: '2026-10-15',
    amount_due: 840000.0,
    due_date: '2026-11-05',
    aging_bucket: 'CURRENT',
    contact_phone: '+91 97011 23456',
  },
  {
    id: '11223344-c3d4-e5f6-a1b2-445566778901',
    entity_name: 'Apollo Hospital Doctors Guild Welfare',
    invoice_no: 'INV-26-0590',
    invoice_date: '2026-09-18',
    amount_due: 410000.0,
    due_date: '2026-10-18',
    aging_bucket: '30_DAYS',
    contact_phone: '+91 98480 34567',
  },
  {
    id: '11223344-c3d4-e5f6-a1b2-445566778902',
    entity_name: 'KIMS Medical Directors Memento Order',
    invoice_no: 'INV-26-0480',
    invoice_date: '2026-08-22',
    amount_due: 150000.0,
    due_date: '2026-09-22',
    aging_bucket: '60_DAYS',
    contact_phone: '+91 99890 45678',
  },
  {
    id: '11223344-c3d4-e5f6-a1b2-445566778903',
    entity_name: 'Vikramaditya Infrastructure Corp',
    invoice_no: 'INV-26-0310',
    invoice_date: '2026-06-15',
    amount_due: 62000.0,
    due_date: '2026-07-15',
    aging_bucket: '90_DAYS_OVERDUE',
    contact_phone: '+91 91210 56789',
  },
];

export function FinanceReceivablesView() {
  const [receivables, setReceivables] = useState<ReceivableRecord[]>(INITIAL_RECEIVABLES);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals & drawers
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState<ReceivableRecord | null>(null);
  const [receiptAmount, setReceiptAmount] = useState<number>(0);
  const [receiptBank, setReceiptBank] = useState('HDFC Jewellery Current - 9021');
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

  const handleSendWhatsApp = (entity: string, phone: string, amount: number) => {
    showToast(`WhatsApp payment reminder & UPI link sent to ${entity} (${phone})`);
  };

  const openRecordReceipt = (item: ReceivableRecord) => {
    setSelectedReceivable(item);
    setReceiptAmount(item.amount_due);
    setIsReceiptModalOpen(true);
  };

  const handleConfirmReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceivable || receiptAmount <= 0) return;

    if (receiptAmount >= selectedReceivable.amount_due) {
      setReceivables((prev) => prev.filter((r) => r.id !== selectedReceivable.id));
      showToast(`Settled full receivable of ₹ ${receiptAmount.toLocaleString('en-IN')} for ${selectedReceivable.entity_name}`);
    } else {
      setReceivables((prev) =>
        prev.map((r) =>
          r.id === selectedReceivable.id
            ? { ...r, amount_due: r.amount_due - Number(receiptAmount) }
            : r
        )
      );
      showToast(`Recorded partial receipt of ₹ ${receiptAmount.toLocaleString('en-IN')}`);
    }
    setIsReceiptModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="accounts_receivable" />
      <ActionToolbar
        filterPlaceholder="Filter receivables by customer, corporate client, invoice #, phone..."
        insertLabel="Record Receipt"
        onInsertClick={() => {
          if (receivables.length > 0) openRecordReceipt(receivables[0]);
        }}
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
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Receivables</span>
                <Users className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">₹ 18,42,000</div>
              <div className="text-[11px] text-neutral-500 mt-1">5 Client accounts</div>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-200 hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-emerald-800 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Current 0-30 Days</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-900 font-mono">₹ 12,20,000</div>
              <div className="text-[11px] text-emerald-700 mt-1">Healthy regular terms</div>
            </div>

            <div className="p-3.5 rounded-lg bg-blue-50/50 border border-blue-200 hover:border-blue-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-blue-800 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">31-60 Days</span>
                <Clock className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-blue-900 font-mono">₹ 4,10,000</div>
              <div className="text-[11px] text-blue-700 mt-1">Payment reminder sent</div>
            </div>

            <div className="p-3.5 rounded-lg bg-amber-50/50 border border-amber-200 hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-amber-800 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">61-90 Days</span>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-amber-900 font-mono">₹ 1,50,000</div>
              <div className="text-[11px] text-amber-700 mt-1">Senior manager call</div>
            </div>

            <div className="p-3.5 rounded-lg bg-red-50/50 border border-red-200 hover:border-red-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-red-800 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">90+ Days Overdue</span>
                <BadgeAlert className="w-3.5 h-3.5 text-red-600" />
              </div>
              <div className="text-xl font-medium text-red-900 font-mono">₹ 62,000</div>
              <div className="text-[11px] text-red-700 mt-1">Credit hold applied</div>
            </div>
          </div>
        </div>

        {/* Aging Portfolio Visual Progress Bar */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-neutral-800 uppercase tracking-wider">
                Aging Portfolio Distribution & Recovery Risk
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                Total ₹ 18.42 Lakhs • 66.2% Current
              </span>
            </div>

            <div className="h-3 w-full bg-neutral-200 rounded-full overflow-hidden flex">
              <div style={{ width: '66.2%' }} className="bg-emerald-500 h-full" title="Current 0-30 Days: 66.2%" />
              <div style={{ width: '22.3%' }} className="bg-blue-500 h-full" title="31-60 Days: 22.3%" />
              <div style={{ width: '8.1%' }} className="bg-amber-500 h-full" title="61-90 Days: 8.1%" />
              <div style={{ width: '3.4%' }} className="bg-red-500 h-full" title="90+ Days Overdue: 3.4%" />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs mt-3 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-neutral-600">Current (66.2%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-neutral-600">31-60 Days (22.3%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-neutral-600">61-90 Days (8.1%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-neutral-600">90+ Days (3.4%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Supabase-style Table */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  public.accounts_receivable
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Showing {receivables.length} accounts receivable records
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
                        <span className="text-neutral-800">entity_name</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">invoice_no</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">invoice_date</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">amount_due (₹)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">due_date</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">aging_bucket</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">contact_phone</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">actions</span>
                      </th>
                      <th className="w-16 px-3 py-2 text-center font-medium">uuid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb] text-neutral-800 font-mono">
                    {receivables.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap font-sans text-neutral-900 font-medium">
                          {row.entity_name}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700">
                          {row.invoice_no}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-600">
                          {row.invoice_date}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-right font-medium text-neutral-900">
                          ₹ {row.amount_due.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-600">
                          {row.due_date}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-center">
                          {row.aging_bucket === 'CURRENT' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                              CURRENT
                            </span>
                          )}
                          {row.aging_bucket === '30_DAYS' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-blue-50 text-blue-700 border border-blue-200">
                              30 DAYS
                            </span>
                          )}
                          {row.aging_bucket === '60_DAYS' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-amber-50 text-amber-700 border border-amber-200">
                              60 DAYS
                            </span>
                          )}
                          {row.aging_bucket === '90_DAYS_OVERDUE' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-red-50 text-red-700 border border-red-200">
                              90+ DAYS OVERDUE
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-600">
                          {row.contact_phone}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1.5 font-sans">
                            <button
                              onClick={() => handleSendWhatsApp(row.entity_name, row.contact_phone, row.amount_due)}
                              className="px-2 py-1 text-[11px] rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1 cursor-pointer"
                              title="Send WhatsApp payment link"
                            >
                              <MessageSquare className="w-3 h-3 text-emerald-600" />
                              WhatsApp Link
                            </button>
                            <button
                              onClick={() => openRecordReceipt(row)}
                              className="px-2 py-1 text-[11px] rounded bg-neutral-900 text-white hover:bg-neutral-800 cursor-pointer"
                            >
                              Record Receipt
                            </button>
                          </div>
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.accounts_receivable (
                  <br />
                  &nbsp;&nbsp;id <span className="text-purple-400">UUID</span>{' '}
                  <span className="text-neutral-400">PRIMARY KEY DEFAULT gen_random_uuid()</span>,
                  <br />
                  &nbsp;&nbsp;entity_name <span className="text-purple-400">VARCHAR(150)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;invoice_no <span className="text-purple-400">VARCHAR(50)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;invoice_date <span className="text-purple-400">DATE</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;amount_due <span className="text-purple-400">NUMERIC(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;due_date <span className="text-purple-400">DATE</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;aging_bucket <span className="text-purple-400">VARCHAR(20)</span>{' '}
                  <span className="text-neutral-400">CHECK (aging_bucket IN (&apos;CURRENT&apos;, &apos;30_DAYS&apos;, &apos;60_DAYS&apos;, &apos;90_DAYS_OVERDUE&apos;))</span>,
                  <br />
                  &nbsp;&nbsp;contact_phone <span className="text-purple-400">VARCHAR(25)</span>
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Record Customer Receipt */}
      {isReceiptModalOpen && selectedReceivable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-2xl border border-[#e5e7eb] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">
                  Record Receivable Payment Receipt
                </h3>
              </div>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="p-1 hover:bg-neutral-200/60 rounded text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReceipt} className="p-5 space-y-4">
              <div className="p-3 bg-neutral-50 rounded border border-neutral-200 text-xs space-y-1 font-mono">
                <div className="flex justify-between text-neutral-600">
                  <span>Customer / Client:</span>
                  <span className="font-sans font-medium text-neutral-900">{selectedReceivable.entity_name}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Invoice Reference:</span>
                  <span>{selectedReceivable.invoice_no}</span>
                </div>
                <div className="flex justify-between text-neutral-900 font-medium">
                  <span>Outstanding Dues:</span>
                  <span className="text-amber-700">₹ {selectedReceivable.amount_due.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">
                  Receipt Amount (₹)
                </label>
                <input
                  type="number"
                  min={1}
                  max={selectedReceivable.amount_due}
                  value={receiptAmount}
                  onChange={(e) => setReceiptAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">
                  Deposit Into Bank Account
                </label>
                <select
                  value={receiptBank}
                  onChange={(e) => setReceiptBank(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                >
                  <option value="HDFC Jewellery Current - 9021">HDFC Jewellery Current - 9021</option>
                  <option value="SBI Current Account - 1102">SBI Current Account - 1102</option>
                  <option value="Showroom Counter Cash Drawer">Showroom Counter Cash Drawer</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Confirm Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
