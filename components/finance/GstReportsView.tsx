'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Clock,
  Sparkles,
  FileCheck,
  ShieldCheck,
  Building,
  Percent,
  Copy,
  Check,
  FileText,
  BadgeAlert,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';

interface GstFilingSummary {
  id: string;
  period: string;
  taxable_turnover: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  rcm_payable: number;
  itc_credit: number;
  net_tax_payable: number;
  status: 'READY_FOR_FILING' | 'FILED' | 'AMENDED';
}

interface HsnSummaryRow {
  hsn_code: string;
  description: string;
  metal_type: string;
  total_weight_g: number;
  taxable_value: number;
  cgst: number;
  sgst: number;
  total_tax: number;
}

const INITIAL_SUMMARIES: GstFilingSummary[] = [
  {
    id: '55667788-a1b2-c3d4-e5f6-889900112233',
    period: '2026-OCT',
    taxable_turnover: 94800000.0,
    cgst_amount: 1422000.0,
    sgst_amount: 1422000.0,
    igst_amount: 0.0,
    rcm_payable: 84200.0,
    itc_credit: 342000.0,
    net_tax_payable: 2502000.0,
    status: 'READY_FOR_FILING',
  },
  {
    id: '55667788-a1b2-c3d4-e5f6-889900112234',
    period: '2026-SEP',
    taxable_turnover: 88500000.0,
    cgst_amount: 1327500.0,
    sgst_amount: 1327500.0,
    igst_amount: 0.0,
    rcm_payable: 79100.0,
    itc_credit: 318000.0,
    net_tax_payable: 2337000.0,
    status: 'FILED',
  },
  {
    id: '55667788-a1b2-c3d4-e5f6-889900112235',
    period: '2026-AUG',
    taxable_turnover: 76200000.0,
    cgst_amount: 1143000.0,
    sgst_amount: 1143000.0,
    igst_amount: 0.0,
    rcm_payable: 64500.0,
    itc_credit: 285000.0,
    net_tax_payable: 2001000.0,
    status: 'FILED',
  },
];

const HSN_BREAKDOWN: HsnSummaryRow[] = [
  {
    hsn_code: '71131910',
    description: 'Articles of jewellery of Gold, whether or not plated or clad with other precious metal',
    metal_type: 'Gold 22K/18K',
    total_weight_g: 11840.45,
    taxable_value: 86200000.0,
    cgst: 1293000.0,
    sgst: 1293000.0,
    total_tax: 2586000.0,
  },
  {
    hsn_code: '71131120',
    description: 'Silver Jewellery studded with gems, pearls, or precious stones',
    metal_type: 'Silver 925/999',
    total_weight_g: 54100.0,
    taxable_value: 5800000.0,
    cgst: 87000.0,
    sgst: 87000.0,
    total_tax: 174000.0,
  },
  {
    hsn_code: '71131930',
    description: 'Articles of jewellery set with diamonds, uncut diamonds (Polki)',
    metal_type: 'Diamond Jewellery',
    total_weight_g: 1420.8,
    taxable_value: 2800000.0,
    cgst: 42000.0,
    sgst: 42000.0,
    total_tax: 84000.0,
  },
];

export function FinanceGstReportsView() {
  const [summaries, setSummaries] = useState<GstFilingSummary>(INITIAL_SUMMARIES[0]);
  const [allSummaries, setAllSummaries] = useState<GstFilingSummary[]>(INITIAL_SUMMARIES);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  const handleDownloadGstr1Json = () => {
    showToast('Downloaded GSTR-1 Official GST Portal JSON format for October 2026!');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="gst_filing_summaries" />
      <ActionToolbar
        filterPlaceholder="Filter GST filings by period, HSN code, B2B/B2C..."
        insertLabel="Download GSTR-1 JSON"
        onInsertClick={handleDownloadGstr1Json}
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
                <span className="text-[11px] font-medium uppercase tracking-wider">Taxable Turnover</span>
                <Building className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">₹ 9.48 Cr</div>
              <div className="text-[11px] text-neutral-500 mt-1">October 2026 Sales</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Output GST 3%</span>
                <Percent className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-amber-700 font-mono">₹ 28,44,000</div>
              <div className="text-[11px] text-neutral-500 mt-1">1.5% CGST + 1.5% SGST</div>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-200 hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-emerald-800 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Eligible Input Credit (ITC)</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-900 font-mono">₹ 3,42,000</div>
              <div className="text-[11px] text-emerald-700 mt-1">GSTR-2B Verified Vendors</div>
            </div>

            <div className="p-3.5 rounded-lg bg-blue-50/50 border border-blue-200 hover:border-blue-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-blue-800 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Net Tax Payable (Challan)</span>
                <FileCheck className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-blue-900 font-mono">₹ 25,02,000</div>
              <div className="text-[11px] text-blue-700 mt-1">PMT-06 Challan Ready</div>
            </div>
          </div>
        </div>

        {/* GST Sub-Components & Action Banner */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 font-mono text-xs">
            <div className="p-3 rounded bg-[#f8fafc] border border-[#e2e8f0]">
              <span className="text-[10px] uppercase text-neutral-500 block mb-0.5">CGST 1.5%</span>
              <span className="text-sm font-medium text-neutral-900">₹ 14,22,000.00</span>
              <span className="text-[10px] text-neutral-500 block mt-1 font-sans">Central Precious Metals Tax</span>
            </div>

            <div className="p-3 rounded bg-[#f8fafc] border border-[#e2e8f0]">
              <span className="text-[10px] uppercase text-neutral-500 block mb-0.5">SGST 1.5%</span>
              <span className="text-sm font-medium text-neutral-900">₹ 14,22,000.00</span>
              <span className="text-[10px] text-neutral-500 block mt-1 font-sans">State Precious Metals Tax</span>
            </div>

            <div className="p-3 rounded bg-[#f8fafc] border border-[#e2e8f0]">
              <span className="text-[10px] uppercase text-neutral-500 block mb-0.5">IGST 3.0%</span>
              <span className="text-sm font-medium text-neutral-900">₹ 0.00</span>
              <span className="text-[10px] text-neutral-500 block mt-1 font-sans">Inter-state Dispatch (0)</span>
            </div>

            <div className="p-3 rounded bg-amber-50/50 border border-amber-200">
              <span className="text-[10px] uppercase text-amber-800 block mb-0.5 font-sans">Reverse Charge (RCM)</span>
              <span className="text-sm font-medium text-amber-900">₹ 84,200.00</span>
              <span className="text-[10px] text-amber-700 block mt-1 font-sans">Old Gold from Unregistered Customers</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-neutral-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-emerald-400 font-mono">
                  Official GSTR-1 Compliant JSON & Excel Engine
                </div>
                <div className="text-xs text-neutral-300 mt-0.5">
                  100% compliant with GSTN Schema v1.4 • Includes B2B, B2CL, B2CS, and HSN 7113 Table 12
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadGstr1Json}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-2xs shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download GSTR-1 Official JSON
            </button>
          </div>
        </div>

        {/* HSN 7113 Summary Breakdown Table */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-medium text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-neutral-500" />
              HSN Table 12: Chapter 71 Jewellery & Silver Summary
            </span>
            <span className="text-xs text-neutral-500 font-mono">Statutory 3% GST Breakdown</span>
          </div>

          <div className="overflow-x-auto border border-[#e5e7eb] rounded-lg">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e5e7eb] text-neutral-600 text-[11px]">
                  <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium">HSN Code</th>
                  <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium">Commodity Description</th>
                  <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium text-right">Net Weight (g)</th>
                  <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium text-right">Taxable Value (₹)</th>
                  <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium text-right">CGST 1.5% (₹)</th>
                  <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium text-right">SGST 1.5% (₹)</th>
                  <th className="px-3 py-2 font-medium text-right">Total Tax 3% (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb] text-neutral-800">
                {HSN_BREAKDOWN.map((row) => (
                  <tr key={row.hsn_code} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="px-3 py-2.5 border-r border-[#e5e7eb] font-medium text-neutral-900">
                      {row.hsn_code}
                    </td>
                    <td className="px-3 py-2.5 border-r border-[#e5e7eb] font-sans text-neutral-700">
                      {row.description}
                    </td>
                    <td className="px-3 py-2.5 border-r border-[#e5e7eb] text-right text-amber-700 font-medium">
                      {row.total_weight_g.toFixed(2)} g
                    </td>
                    <td className="px-3 py-2.5 border-r border-[#e5e7eb] text-right font-medium text-neutral-900">
                      ₹ {row.taxable_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-2.5 border-r border-[#e5e7eb] text-right text-neutral-600">
                      ₹ {row.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-2.5 border-r border-[#e5e7eb] text-right text-neutral-600">
                      ₹ {row.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium text-emerald-700">
                      ₹ {row.total_tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Supabase-style Table */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  public.gst_filing_summaries
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Showing {allSummaries.length} statutory filing periods
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
                        <span className="text-neutral-800">period</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">taxable_turnover (₹)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">cgst_amount (₹)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">sgst_amount (₹)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">rcm_payable (₹)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">itc_credit (₹)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">net_tax_payable (₹)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">status</span>
                      </th>
                      <th className="w-16 px-3 py-2 text-center font-medium">uuid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb] text-neutral-800 font-mono">
                    {allSummaries.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-900 font-medium">
                          {row.period}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-right font-medium text-neutral-900">
                          ₹ {row.taxable_turnover.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-right text-neutral-600">
                          ₹ {row.cgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-right text-neutral-600">
                          ₹ {row.sgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-right text-amber-700">
                          ₹ {row.rcm_payable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-right text-emerald-700">
                          - ₹ {row.itc_credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-right font-medium text-blue-700">
                          ₹ {row.net_tax_payable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#e5e7eb] whitespace-nowrap text-center">
                          {row.status === 'READY_FOR_FILING' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-500" /> READY_FOR_FILING
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> FILED
                            </span>
                          )}
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.gst_filing_summaries (
                  <br />
                  &nbsp;&nbsp;id <span className="text-purple-400">UUID</span>{' '}
                  <span className="text-neutral-400">PRIMARY KEY DEFAULT gen_random_uuid()</span>,
                  <br />
                  &nbsp;&nbsp;period <span className="text-purple-400">VARCHAR(20)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;taxable_turnover <span className="text-purple-400">NUMERIC(14,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;cgst_amount <span className="text-purple-400">NUMERIC(12,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;sgst_amount <span className="text-purple-400">NUMERIC(12,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;igst_amount <span className="text-purple-400">NUMERIC(12,2)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0.00</span>,
                  <br />
                  &nbsp;&nbsp;rcm_payable <span className="text-purple-400">NUMERIC(10,2)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0.00</span>,
                  <br />
                  &nbsp;&nbsp;itc_credit <span className="text-purple-400">NUMERIC(10,2)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0.00</span>,
                  <br />
                  &nbsp;&nbsp;net_tax_payable <span className="text-purple-400">NUMERIC(12,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;status <span className="text-purple-400">VARCHAR(20)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;READY_FOR_FILING&apos;</span>
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
