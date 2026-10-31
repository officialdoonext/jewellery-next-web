'use client';

import React, { useState, useMemo } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Hammer,
  Scale,
  Sparkles,
  Coins,
  CreditCard,
  Plus,
  X,
  Check,
  ShieldCheck,
  Clock,
  ArrowUpDown,
  Filter,
  Eye,
  FileSpreadsheet,
  Layers,
  Percent,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Sliders,
} from 'lucide-react';

interface JobWorkerReceipt {
  id: string;
  receipt_no: string;
  karigar_name: string;
  job_card_no: string;
  raw_gold_issued_g: number;
  ornaments_received_g: number;
  items_count: number;
  scrap_dust_g: number;
  net_loss_g: number;
  loss_percent: number;
  allowed_loss_percent: number;
  excess_loss_g: number;
  labour_charge_rate: number;
  labour_rate_type: 'PER_GRAM' | 'PER_PIECE';
  total_labour_payable: number;
  hallmark_status: 'HALLMARKED_HUID' | 'PENDING_ASSAY' | 'REJECTED';
  status: 'APPROVED' | 'PENDING_INSPECTION' | 'IN_AUDIT';
  receipt_date: string;
}

const INITIAL_RECEIPTS: JobWorkerReceipt[] = [
  {
    id: 'rec-1',
    receipt_no: 'JWR-2026-108',
    karigar_name: 'Gopal Soni (Artisan #04)',
    job_card_no: 'JOB-2026-089',
    raw_gold_issued_g: 100.000,
    ornaments_received_g: 96.800,
    items_count: 4,
    scrap_dust_g: 2.350,
    net_loss_g: 0.850,
    loss_percent: 0.85,
    allowed_loss_percent: 1.20,
    excess_loss_g: 0.000,
    labour_charge_rate: 320.00,
    labour_rate_type: 'PER_GRAM',
    total_labour_payable: 30976.00,
    hallmark_status: 'HALLMARKED_HUID',
    status: 'APPROVED',
    receipt_date: '2026-10-31',
  },
  {
    id: 'rec-2',
    receipt_no: 'JWR-2026-109',
    karigar_name: 'Ramesh Chari Casting',
    job_card_no: 'JOB-2026-090',
    raw_gold_issued_g: 250.000,
    ornaments_received_g: 242.100,
    items_count: 12,
    scrap_dust_g: 5.800,
    net_loss_g: 2.100,
    loss_percent: 0.84,
    allowed_loss_percent: 1.00,
    excess_loss_g: 0.000,
    labour_charge_rate: 220.00,
    labour_rate_type: 'PER_GRAM',
    total_labour_payable: 53262.00,
    hallmark_status: 'HALLMARKED_HUID',
    status: 'APPROVED',
    receipt_date: '2026-10-31',
  },
  {
    id: 'rec-3',
    receipt_no: 'JWR-2026-110',
    karigar_name: 'Harish Patwa Goldsmith',
    job_card_no: 'JOB-2026-091',
    raw_gold_issued_g: 65.400,
    ornaments_received_g: 62.100,
    items_count: 2,
    scrap_dust_g: 1.900,
    net_loss_g: 1.400,
    loss_percent: 2.14,
    allowed_loss_percent: 1.50,
    excess_loss_g: 0.419,
    labour_charge_rate: 450.00,
    labour_rate_type: 'PER_GRAM',
    total_labour_payable: 24570.00,
    hallmark_status: 'PENDING_ASSAY',
    status: 'PENDING_INSPECTION',
    receipt_date: '2026-10-30',
  },
  {
    id: 'rec-4',
    receipt_no: 'JWR-2026-111',
    karigar_name: 'Sitaram Achari',
    job_card_no: 'JOB-2026-092',
    raw_gold_issued_g: 35.000,
    ornaments_received_g: 33.950,
    items_count: 6,
    scrap_dust_g: 0.800,
    net_loss_g: 0.250,
    loss_percent: 0.71,
    allowed_loss_percent: 1.20,
    excess_loss_g: 0.000,
    labour_charge_rate: 1500.00,
    labour_rate_type: 'PER_PIECE',
    total_labour_payable: 9000.00,
    hallmark_status: 'HALLMARKED_HUID',
    status: 'APPROVED',
    receipt_date: '2026-10-29',
  },
  {
    id: 'rec-5',
    receipt_no: 'JWR-2026-112',
    karigar_name: 'Ketan Zaveri (Filigree Studio)',
    job_card_no: 'JOB-2026-093',
    raw_gold_issued_g: 29.800,
    ornaments_received_g: 28.500,
    items_count: 1,
    scrap_dust_g: 0.900,
    net_loss_g: 0.400,
    loss_percent: 1.34,
    allowed_loss_percent: 1.50,
    excess_loss_g: 0.000,
    labour_charge_rate: 692.00,
    labour_rate_type: 'PER_GRAM',
    total_labour_payable: 19722.00,
    hallmark_status: 'PENDING_ASSAY',
    status: 'PENDING_INSPECTION',
    receipt_date: '2026-10-31',
  },
];

const KARIGAR_OPTIONS = [
  'Gopal Soni (Artisan #04)',
  'Ramesh Chari Casting',
  'Harish Patwa Goldsmith',
  'Sitaram Achari',
  'Ketan Zaveri (Filigree Studio)',
];

export function PurchasesJobWorkerReceiptsView() {
  const [receipts, setReceipts] = useState<JobWorkerReceipt[]>(INITIAL_RECEIPTS);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isNewReceiptOpen, setIsNewReceiptOpen] = useState(false);
  const [selectedReceiptForDetail, setSelectedReceiptForDetail] = useState<JobWorkerReceipt | null>(null);

  // Form State
  const [formKarigar, setFormKarigar] = useState(KARIGAR_OPTIONS[0]);
  const [formJobCard, setFormJobCard] = useState('JOB-2026-094');
  const [formRawIssued, setFormRawIssued] = useState('80.000');
  const [formOrnamentsRec, setFormOrnamentsRec] = useState('77.500');
  const [formPcsCount, setFormPcsCount] = useState('3');
  const [formScrapDust, setFormScrapDust] = useState('1.800');
  const [formAllowedLossPct, setFormAllowedLossPct] = useState('1.20');
  const [formLabourRate, setFormLabourRate] = useState('300.00');
  const [formLabourType, setFormLabourType] = useState<'PER_GRAM' | 'PER_PIECE'>('PER_GRAM');
  const [formHallmarkStatus, setFormHallmarkStatus] = useState<'HALLMARKED_HUID' | 'PENDING_ASSAY' | 'REJECTED'>('HALLMARKED_HUID');

  // Reconciled Metal Loss / Gain Calculations
  const calculations = useMemo(() => {
    const issued = parseFloat(formRawIssued) || 0;
    const received = parseFloat(formOrnamentsRec) || 0;
    const scrap = parseFloat(formScrapDust) || 0;
    const pcs = parseInt(formPcsCount) || 1;
    const allowedPct = parseFloat(formAllowedLossPct) || 1.2;
    const rate = parseFloat(formLabourRate) || 0;

    const netLoss = issued - (received + scrap);
    const lossPct = issued > 0 ? (netLoss / issued) * 100 : 0;
    const allowedLossG = (issued * allowedPct) / 100;
    const excessLoss = Math.max(0, netLoss - allowedLossG);

    const labourTotal = formLabourType === 'PER_GRAM' ? received * rate : pcs * rate;

    return {
      issued,
      received,
      scrap,
      netLoss,
      lossPct,
      allowedLossG,
      excessLoss,
      labourTotal,
    };
  }, [formRawIssued, formOrnamentsRec, formScrapDust, formAllowedLossPct, formLabourRate, formLabourType, formPcsCount]);

  const handleCreateReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    const newReceipt: JobWorkerReceipt = {
      id: crypto.randomUUID ? crypto.randomUUID() : `jwr-${Date.now()}`,
      receipt_no: `JWR-2026-0${receipts.length + 113}`,
      karigar_name: formKarigar,
      job_card_no: formJobCard,
      raw_gold_issued_g: calculations.issued,
      ornaments_received_g: calculations.received,
      items_count: parseInt(formPcsCount) || 1,
      scrap_dust_g: calculations.scrap,
      net_loss_g: calculations.netLoss,
      loss_percent: calculations.lossPct,
      allowed_loss_percent: parseFloat(formAllowedLossPct) || 1.2,
      excess_loss_g: calculations.excessLoss,
      labour_charge_rate: parseFloat(formLabourRate) || 0,
      labour_rate_type: formLabourType,
      total_labour_payable: calculations.labourTotal,
      hallmark_status: formHallmarkStatus,
      status: 'APPROVED',
      receipt_date: '2026-10-31',
    };

    setReceipts([newReceipt, ...receipts]);
    setIsNewReceiptOpen(false);
  };

  const filteredReceipts = receipts.filter((item) => {
    if (statusFilter !== 'All' && item.status !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchReceipt = item.receipt_no.toLowerCase().includes(q);
      const matchKarigar = item.karigar_name.toLowerCase().includes(q);
      const matchJob = item.job_card_no.toLowerCase().includes(q);
      if (!matchReceipt && !matchKarigar && !matchJob) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="jobworker_receipts" />
      <ActionToolbar
        filterPlaceholder="Filter by receipt #, karigar, or job card..."
        insertLabel="New Job-Worker Receipt"
        onInsertClick={() => setIsNewReceiptOpen(true)}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Receipts Today</span>
                <Hammer className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">6 Lots</div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Handcrafted jewellery
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Raw Gold Reconciled</span>
                <Coins className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-amber-700">480.200 g</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Pure 22K 916 casting alloy
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Scrap Dust Recovered</span>
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">12.450 g</div>
              <div className="text-[11px] text-blue-600 mt-1 font-mono">
                Re-sent for refining melt
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Labour Charges</span>
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">₹ 1,18,500</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Payable to Karigars
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Avg Karigar Loss</span>
                <Scale className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700">0.85%</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                Under 1.2% Allowed Limit
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-neutral-400 font-mono text-[11px]">Filters:</span>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="APPROVED">Approved</option>
                  <option value="PENDING_INSPECTION">Pending Inspection</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search Receipt, Karigar, Job #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 px-2.5 py-1 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none placeholder:text-neutral-400"
              />
              <button
                onClick={() => setIsNewReceiptOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Receive From Karigar</span>
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
                <Hammer className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  public.jobworker_receipts
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Showing {filteredReceipts.length} of {receipts.length} receipt lots
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
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">receipt_no</span>
                          <span className="text-neutral-400 font-normal text-[10px]">varchar</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">karigar & job_card</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-neutral-800">raw_issued</span>
                          <span className="text-neutral-400 font-normal text-[10px]">g</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-neutral-800">received_wt</span>
                          <span className="text-neutral-400 font-normal text-[10px]">g / pcs</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-neutral-800">scrap_dust</span>
                          <span className="text-neutral-400 font-normal text-[10px]">g</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-neutral-800">loss / gain</span>
                          <span className="text-neutral-400 font-normal text-[10px]">%</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-neutral-800">labour_charges</span>
                          <span className="text-neutral-400 font-normal text-[10px]">inr</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">hallmark</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">status</span>
                      </th>
                      <th className="px-3.5 py-2 font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">inspect</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {filteredReceipts.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="px-3 py-2 text-center border-r border-[#e5e7eb]">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3.5 py-2 font-mono border-r border-[#e5e7eb] whitespace-nowrap">
                          <span className="font-medium text-emerald-700">{row.receipt_no}</span>
                          <span className="text-[10px] text-neutral-400 block">{row.receipt_date}</span>
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <div className="font-medium text-neutral-800">{row.karigar_name}</div>
                          <span className="text-[10px] font-mono text-neutral-500 bg-[#f8fafc] px-1 rounded border border-[#e2e8f0]">
                            {row.job_card_no}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 font-mono text-neutral-700 border-r border-[#e5e7eb] text-right whitespace-nowrap">
                          {row.raw_gold_issued_g.toFixed(3)} g
                        </td>
                        <td className="px-3.5 py-2 font-mono text-neutral-900 border-r border-[#e5e7eb] text-right whitespace-nowrap font-medium">
                          {row.ornaments_received_g.toFixed(3)} g
                          <span className="text-[10px] text-neutral-400 block font-normal">
                            ({row.items_count} pcs)
                          </span>
                        </td>
                        <td className="px-3.5 py-2 font-mono text-neutral-600 border-r border-[#e5e7eb] text-right whitespace-nowrap">
                          {row.scrap_dust_g.toFixed(3)} g
                        </td>
                        <td className="px-3.5 py-2 font-mono border-r border-[#e5e7eb] text-right whitespace-nowrap">
                          <span
                            className={
                              row.loss_percent <= row.allowed_loss_percent
                                ? 'text-emerald-700 font-medium'
                                : 'text-amber-700 font-medium'
                            }
                          >
                            {row.net_loss_g.toFixed(3)} g ({row.loss_percent.toFixed(2)}%)
                          </span>
                          {row.excess_loss_g > 0 && (
                            <span className="text-[10px] text-red-600 block">
                              +{row.excess_loss_g.toFixed(3)} g excess
                            </span>
                          )}
                        </td>
                        <td className="px-3.5 py-2 font-mono font-medium text-neutral-900 border-r border-[#e5e7eb] text-right whitespace-nowrap">
                          ₹ {row.total_labour_payable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3.5 py-2 text-center border-r border-[#e5e7eb] whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono ${
                              row.hallmark_status === 'HALLMARKED_HUID'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {row.hallmark_status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 text-center border-r border-[#e5e7eb] whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono ${
                              row.status === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {row.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 text-center whitespace-nowrap">
                          <button
                            onClick={() => setSelectedReceiptForDetail(row)}
                            className="p-1 hover:bg-neutral-100 rounded text-neutral-600 hover:text-emerald-700 transition-colors cursor-pointer"
                            title="Inspect Reconciliation"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.jobworker_receipts (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">receipt_no</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>{' '}
                  <span className="text-neutral-400">UNIQUE NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">karigar_id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">REFERENCES public.suppliers_directory(id),</span>
                  <br />
                  <span className="pl-6 text-blue-300">job_card_no</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">raw_gold_issued_g</span>{' '}
                  <span className="text-amber-300">numeric(10,3)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">ornaments_received_g</span>{' '}
                  <span className="text-amber-300">numeric(10,3)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">scrap_dust_g</span>{' '}
                  <span className="text-amber-300">numeric(10,3)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0.000,</span>
                  <br />
                  <span className="pl-6 text-blue-300">net_loss_g</span>{' '}
                  <span className="text-amber-300">numeric(10,3)</span>{' '}
                  <span className="text-neutral-400">GENERATED ALWAYS AS (raw_gold_issued_g - (ornaments_received_g + scrap_dust_g)) STORED,</span>
                  <br />
                  <span className="pl-6 text-blue-300">labour_charges</span>{' '}
                  <span className="text-amber-300">numeric(12,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">hallmark_status</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;PENDING_ASSAY&apos;,</span>
                  <br />
                  <span className="pl-6 text-blue-300">status</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;APPROVED&apos;,</span>
                  <br />
                  <span className="pl-6 text-blue-300">created_at</span>{' '}
                  <span className="text-amber-300">timestamptz</span>{' '}
                  <span className="text-neutral-400">DEFAULT now()</span>
                  <br />
                  );
                  <br />
                  <br />
                  <span className="text-emerald-400">ALTER TABLE</span> public.jobworker_receipts{' '}
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
                    {filteredReceipts.length}
                  </span>
                  <span>receipts</span>
                </div>
                <span>•</span>
                <span>Active Filter: {statusFilter}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Karigar Loss Tolerance Audited
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Job-Worker Receipt Drawer Modal */}
      {isNewReceiptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#e2e8f0] max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <Hammer className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">Receive Finished Work from Karigar</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                  Loss Reconciliation
                </span>
              </div>
              <button
                onClick={() => setIsNewReceiptOpen(false)}
                className="p-1 hover:bg-neutral-200 rounded text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReceipt} className="p-4 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Artisan / Karigar *</label>
                  <select
                    value={formKarigar}
                    onChange={(e) => setFormKarigar(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  >
                    {KARIGAR_OPTIONS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Job Issue Card Ref *</label>
                  <input
                    type="text"
                    required
                    value={formJobCard}
                    onChange={(e) => setFormJobCard(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    placeholder="JOB-2026-094"
                  />
                </div>
              </div>

              {/* Weight Reconciliation Box */}
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-emerald-600" />
                  Metal Reconciliation (Grams)
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Raw Gold Issued (g) *</label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      value={formRawIssued}
                      onChange={(e) => setFormRawIssued(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Ornaments Received (g) *</label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      value={formOrnamentsRec}
                      onChange={(e) => setFormOrnamentsRec(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Pieces Count</label>
                    <input
                      type="number"
                      required
                      value={formPcsCount}
                      onChange={(e) => setFormPcsCount(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Scrap & Dust Recovered (g)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={formScrapDust}
                      onChange={(e) => setFormScrapDust(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Allowed Loss Tolerance (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formAllowedLossPct}
                      onChange={(e) => setFormAllowedLossPct(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
                </div>

                {/* Live Reconciliation Calculation Strip */}
                <div className="mt-3 p-3 bg-white border border-[#e2e8f0] rounded-md grid grid-cols-3 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Net Metal Loss:</span>
                    <span className="font-medium text-neutral-800">
                      {calculations.netLoss.toFixed(3)} g ({calculations.lossPct.toFixed(2)}%)
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Max Allowed Loss:</span>
                    <span className="font-medium text-neutral-800">{calculations.allowedLossG.toFixed(3)} g</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Excess Deduction:</span>
                    <span
                      className={`font-medium ${
                        calculations.excessLoss > 0 ? 'text-red-600' : 'text-emerald-700'
                      }`}
                    >
                      {calculations.excessLoss > 0 ? `${calculations.excessLoss.toFixed(3)} g excess` : 'Within Limit (Nil)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Making Labour Charges */}
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  Artisan Making / Labour Charges
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Rate Basis</label>
                    <select
                      value={formLabourType}
                      onChange={(e) => setFormLabourType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    >
                      <option value="PER_GRAM">Per Gram of Finished Jewellery</option>
                      <option value="PER_PIECE">Fixed Rate Per Piece</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Labour Rate (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formLabourRate}
                      onChange={(e) => setFormLabourRate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
                </div>

                <div className="mt-3 p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-md text-xs font-mono text-emerald-900 flex justify-between">
                  <span>Total Labour Payable to Karigar:</span>
                  <span className="font-medium">
                    ₹ {calculations.labourTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Hallmark Status */}
              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">BIS Hallmark Status</label>
                <select
                  value={formHallmarkStatus}
                  onChange={(e) => setFormHallmarkStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                >
                  <option value="HALLMARKED_HUID">Hallmarked with HUID Laser Engraving</option>
                  <option value="PENDING_ASSAY">Pending Assay Center Verification</option>
                  <option value="REJECTED">Assay Rejected</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5e7eb]">
                <button
                  type="button"
                  onClick={() => setIsNewReceiptOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept & Reconcile Lot</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Modal */}
      {selectedReceiptForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#e2e8f0] max-w-md w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <Hammer className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">
                  Receipt {selectedReceiptForDetail.receipt_no}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReceiptForDetail(null)}
                className="p-1 hover:bg-neutral-200 rounded text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-neutral-500">Artisan / Karigar:</span>
                <span className="font-medium text-neutral-800">{selectedReceiptForDetail.karigar_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-neutral-500">Job Card No:</span>
                <span className="font-mono text-neutral-800">{selectedReceiptForDetail.job_card_no}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-neutral-500">Raw Gold Issued:</span>
                <span className="font-mono text-neutral-800">{selectedReceiptForDetail.raw_gold_issued_g.toFixed(3)} g</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-neutral-500">Ornaments Received:</span>
                <span className="font-mono font-medium text-amber-700">{selectedReceiptForDetail.ornaments_received_g.toFixed(3)} g</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-neutral-500">Scrap Dust Recovered:</span>
                <span className="font-mono text-neutral-800">{selectedReceiptForDetail.scrap_dust_g.toFixed(3)} g</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-neutral-500">Net Manufacturing Loss:</span>
                <span className="font-mono text-neutral-800">{selectedReceiptForDetail.net_loss_g.toFixed(3)} g ({selectedReceiptForDetail.loss_percent.toFixed(2)}%)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#f1f5f9] bg-emerald-50/50 p-2 rounded">
                <span className="font-medium text-neutral-700">Labour Charges Payable:</span>
                <span className="font-mono font-medium text-emerald-700">₹ {selectedReceiptForDetail.total_labour_payable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="px-4 py-3 bg-[#f8fafc] border-t border-[#e5e7eb] flex justify-end">
              <button
                onClick={() => setSelectedReceiptForDetail(null)}
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
