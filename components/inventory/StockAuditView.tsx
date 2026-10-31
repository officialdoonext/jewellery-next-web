'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Radio,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Play,
  RotateCw,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Search,
  FileCheck2,
  Tag,
} from 'lucide-react';

interface AuditHistoryItem {
  id: string;
  audit_session: string;
  section: string;
  expected_pcs: number;
  scanned_pcs: number;
  match_percentage: number;
  missing_pcs: number;
  misplaced_pcs: number;
  auditor_name: string;
  audit_date: string;
  status: 'RECONCILED' | 'IN_PROGRESS' | 'DISCREPANCY';
}

const INITIAL_AUDITS: AuditHistoryItem[] = [
  {
    id: '34a89012-9988-4123-bc91-ae890123471b',
    audit_session: 'AUD-2026-OCT',
    section: 'Bridal Necklace Vault',
    expected_pcs: 312,
    scanned_pcs: 312,
    match_percentage: 100.00,
    missing_pcs: 0,
    misplaced_pcs: 0,
    auditor_name: 'P. Venkat (Internal Audit)',
    audit_date: '2026-10-30',
    status: 'RECONCILED',
  },
  {
    id: '34a89012-9988-4123-bc91-ae890123471c',
    audit_session: 'AUD-2026-SEP',
    section: 'Display Counter 2 Bangles',
    expected_pcs: 420,
    scanned_pcs: 420,
    match_percentage: 100.00,
    missing_pcs: 0,
    misplaced_pcs: 0,
    auditor_name: 'K. Rajesh (Vault Head)',
    audit_date: '2026-09-30',
    status: 'RECONCILED',
  },
  {
    id: '34a89012-9988-4123-bc91-ae890123471d',
    audit_session: 'AUD-2026-AUG',
    section: 'Safe Tray #14 (Solitaire Rings)',
    expected_pcs: 180,
    scanned_pcs: 179,
    match_percentage: 99.44,
    missing_pcs: 1,
    misplaced_pcs: 0,
    auditor_name: 'External Chartered Auditor',
    audit_date: '2026-08-31',
    status: 'DISCREPANCY',
  },
];

export function InventoryStockAuditView() {
  const [audits] = useState<AuditHistoryItem[]>(INITIAL_AUDITS);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live Audit Session State
  const [selectedSection, setSelectedSection] = useState('Bridal Necklace Vault');
  const [isScanning, setIsScanning] = useState(false);
  const [auditSubTab, setAuditSubTab] = useState<'found' | 'missing' | 'misplaced'>('found');
  const [scannedProgress, setScannedProgress] = useState(312);
  const expectedTotal = 312;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartScan = () => {
    setIsScanning(true);
    setScannedProgress(0);
    let current = 0;
    const interval = setInterval(() => {
      current += 52;
      if (current >= expectedTotal) {
        setScannedProgress(expectedTotal);
        setIsScanning(false);
        clearInterval(interval);
      } else {
        setScannedProgress(current);
      }
    }, 200);
  };

  const matchPercent = ((scannedProgress / expectedTotal) * 100).toFixed(2);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="inventory_stock_audit" />
      <ActionToolbar
        filterPlaceholder="Filter audit sessions by section, auditor, date..."
        insertLabel="New Audit Session"
        onInsertClick={handleStartScan}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* Live Audit Session Control & Scanner Status */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Left: Section selection & Scanner Hardware Status */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 bg-white border border-[#e2e8f0] rounded-md px-3 py-1.5">
                  <span className="text-xs text-neutral-500 font-medium">Audit Section:</span>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="bg-transparent text-xs text-neutral-800 font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="Bridal Necklace Vault">Bridal Necklace Vault (312 pcs)</option>
                    <option value="Display Counter 2 Bangles">Display Counter 2 Bangles (420 pcs)</option>
                    <option value="Safe Tray #14">Safe Tray #14 (180 pcs)</option>
                    <option value="Gold Chains Counter 1">Gold Chains Counter 1 (210 pcs)</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-mono">
                  <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>RFID Wand Connected (868 MHz UHF • 240 tags/sec)</span>
                </div>
              </div>

              {/* Right: Scan Action Button */}
              <button
                onClick={handleStartScan}
                disabled={isScanning}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    <span>Sweeping RFID Tray... ({scannedProgress}/{expectedTotal})</span>
                  </>
                ) : (
                  <>
                    <ScanLine className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Start Audit / Scan Tray</span>
                  </>
                )}
              </button>
            </div>

            {/* Audit Progress & Discrepancy KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-[#f1f5f9]">
              <div className="p-3 bg-white border border-[#e2e8f0] rounded-md">
                <div className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
                  Expected Items
                </div>
                <div className="text-lg font-medium text-neutral-900 mt-0.5">{expectedTotal} pcs</div>
                <div className="text-[10px] text-neutral-400 font-mono">Book inventory</div>
              </div>

              <div className="p-3 bg-white border border-[#e2e8f0] rounded-md">
                <div className="text-[11px] uppercase tracking-wider text-emerald-700 font-medium">
                  Scanned Items
                </div>
                <div className="text-lg font-medium text-emerald-700 mt-0.5">{scannedProgress} pcs</div>
                <div className="text-[10px] text-emerald-600 font-mono">RFID detected</div>
              </div>

              <div className="p-3 bg-white border border-[#e2e8f0] rounded-md">
                <div className="text-[11px] uppercase tracking-wider text-blue-700 font-medium">
                  Match Rate
                </div>
                <div className="text-lg font-medium text-blue-700 mt-0.5">{matchPercent}%</div>
                <div className="text-[10px] text-blue-600 font-mono">Zero discrepancy</div>
              </div>

              <div className="p-3 bg-white border border-[#e2e8f0] rounded-md">
                <div className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
                  Missing Items
                </div>
                <div className="text-lg font-medium text-neutral-900 mt-0.5">0 pcs</div>
                <div className="text-[10px] text-emerald-600 font-mono">No loss detected</div>
              </div>

              <div className="p-3 bg-white border border-[#e2e8f0] rounded-md col-span-2 sm:col-span-1">
                <div className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
                  Misplaced Items
                </div>
                <div className="text-lg font-medium text-neutral-900 mt-0.5">0 pcs</div>
                <div className="text-[10px] text-emerald-600 font-mono">Correct tray slots</div>
              </div>
            </div>

            {/* Sub-tabs: Found / Missing / Misplaced */}
            <div className="flex items-center gap-2 pt-1 text-xs">
              <button
                onClick={() => setAuditSubTab('found')}
                className={`px-3 py-1 rounded-md font-medium border transition-colors cursor-pointer ${
                  auditSubTab === 'found'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-white text-neutral-600 border-[#e2e8f0]'
                }`}
              >
                Found Items ({scannedProgress})
              </button>
              <button
                onClick={() => setAuditSubTab('missing')}
                className={`px-3 py-1 rounded-md font-medium border transition-colors cursor-pointer ${
                  auditSubTab === 'missing'
                    ? 'bg-red-50 text-red-800 border-red-300'
                    : 'bg-white text-neutral-600 border-[#e2e8f0]'
                }`}
              >
                Missing Items (0)
              </button>
              <button
                onClick={() => setAuditSubTab('misplaced')}
                className={`px-3 py-1 rounded-md font-medium border transition-colors cursor-pointer ${
                  auditSubTab === 'misplaced'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-white text-neutral-600 border-[#e2e8f0]'
                }`}
              >
                Misplaced Items (0)
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
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  physical_stock_audits
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  RFID &amp; Barcode stock audit logs with sign-off
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
                        <span className="text-neutral-800">audit_session</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">section</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">expected_pcs</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">scanned_pcs</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">match_%</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">auditor_name</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">audit_date</span>
                      </th>
                      <th className="px-3.5 py-2 font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">status</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb] font-mono text-neutral-800 text-[12px]">
                    {audits.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/80 transition-colors group">
                        <td className="px-3 py-2 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>

                        {/* Session ID */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-medium text-neutral-900">
                          <span className="px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-800 text-[11px]">
                            {row.audit_session}
                          </span>
                        </td>

                        {/* Section */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-sans font-medium text-neutral-900">
                          {row.section}
                        </td>

                        {/* Expected */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right text-neutral-700">
                          {row.expected_pcs}
                        </td>

                        {/* Scanned */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-medium text-neutral-900">
                          {row.scanned_pcs}
                        </td>

                        {/* Match % */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right">
                          <span
                            className={
                              row.match_percentage === 100
                                ? 'text-emerald-700 font-medium'
                                : 'text-amber-700 font-medium'
                            }
                          >
                            {row.match_percentage.toFixed(2)}%
                          </span>
                        </td>

                        {/* Auditor */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-sans text-neutral-600 text-[11px]">
                          {row.auditor_name}
                        </td>

                        {/* Date */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-500 text-[11px]">
                          {row.audit_date}
                        </td>

                        {/* Status */}
                        <td className="px-3.5 py-2 whitespace-nowrap text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              row.status === 'RECONCILED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {row.status}
                          </span>
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.physical_stock_audits (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">audit_session</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">section</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">expected_pcs</span>{' '}
                  <span className="text-amber-300">integer</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">scanned_pcs</span>{' '}
                  <span className="text-amber-300">integer</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">match_percentage</span>{' '}
                  <span className="text-amber-300">numeric(5,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">auditor_name</span>{' '}
                  <span className="text-amber-300">varchar(100)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">audit_date</span>{' '}
                  <span className="text-amber-300">date</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">status</span>{' '}
                  <span className="text-amber-300">varchar(20)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;RECONCILED&apos;</span>
                  <br />
                  );
                  <br />
                  <br />
                  <span className="text-emerald-400">ALTER TABLE</span> public.physical_stock_audits{' '}
                  <span className="text-emerald-400">ENABLE ROW LEVEL SECURITY;</span>
                </div>
              </div>
            )}

            {/* Table Footer Bar */}
            <div className="h-[36px] bg-[#f8fafc] border-t border-[#e5e7eb] px-3.5 flex items-center justify-between text-[12px] text-neutral-500 font-mono select-none w-full">
              <div className="flex items-center gap-3">
                <span>{audits.length} audit sessions recorded</span>
                <span>•</span>
                <span>RFID Wand certified to EPC Gen2 standards</span>
              </div>
              <div className="text-emerald-600 font-medium">
                Audit Reconciliation Complete
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
