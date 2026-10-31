'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Truck,
  ArrowRightLeft,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Copy,
  Check,
  X,
  Scale,
  Lock,
  Building2,
  Calendar,
  Hash,
  Eye,
  Plus,
} from 'lucide-react';

interface TransferManifest {
  id: string;
  transfer_manifest_no: string;
  eway_bill_no: string;
  source_branch: string;
  destination_branch: string;
  carrier_custodian: string;
  security_seal_no: string;
  items_count: number;
  total_gross_grams: number;
  total_fine_grams: number;
  declared_value_inr: number;
  dispatched_at: string;
  received_at?: string;
  status: 'IN_TRANSIT' | 'RECEIVED_ACKNOWLEDGED' | 'DISCREPANCY';
  dispatch_custodian: string;
  received_custodian?: string;
  items_summary: string;
}

const INITIAL_TRANSFERS: TransferManifest[] = [
  {
    id: '66778899-d4e5-f6a1-b2c3-990011223344',
    transfer_manifest_no: 'IBT-2026-042',
    eway_bill_no: 'EWB-2026-9812',
    source_branch: 'Banjara Hills Flagship',
    destination_branch: 'Jubilee Hills Boutique',
    carrier_custodian: 'BVC Armored Logistics (Van AP-09-AX-1029)',
    security_seal_no: 'SEAL-2026-8910',
    items_count: 14,
    total_gross_grams: 450.800,
    total_fine_grams: 412.930,
    declared_value_inr: 3580000.00,
    dispatched_at: '2026-10-31 10:15',
    status: 'IN_TRANSIT',
    dispatch_custodian: 'A. SivaKrishna',
    items_summary: '22K Calcutta Bangles (6 pairs), Antique Temple Chokers (2 sets)',
  },
  {
    id: '66778899-d4e5-f6a1-b2c3-990011223345',
    transfer_manifest_no: 'IBT-2026-041',
    eway_bill_no: 'EWB-2026-9810',
    source_branch: 'Banjara Hills Flagship',
    destination_branch: 'Hyderabad RGIA Terminal 1',
    carrier_custodian: 'Airport Custodian Escort (P. Sandeep)',
    security_seal_no: 'SEAL-2026-8908',
    items_count: 22,
    total_gross_grams: 391.350,
    total_fine_grams: 358.480,
    declared_value_inr: 3100000.00,
    dispatched_at: '2026-10-31 08:30',
    status: 'IN_TRANSIT',
    dispatch_custodian: 'A. SivaKrishna',
    items_summary: 'Lightweight Dailywear Chains, Diamond Pendants (VVS1)',
  },
  {
    id: '66778899-d4e5-f6a1-b2c3-990011223346',
    transfer_manifest_no: 'IBT-2026-040',
    eway_bill_no: 'EWB-2026-9799',
    source_branch: 'Vijayawada MG Road Outlet',
    destination_branch: 'Banjara Hills Flagship',
    carrier_custodian: 'Sequel Secure Logistics (Van TS-10-UB-4421)',
    security_seal_no: 'SEAL-2026-8890',
    items_count: 18,
    total_gross_grams: 620.400,
    total_fine_grams: 568.280,
    declared_value_inr: 4950000.00,
    dispatched_at: '2026-10-29 11:00',
    received_at: '2026-10-29 17:40',
    status: 'RECEIVED_ACKNOWLEDGED',
    dispatch_custodian: 'K. Ramesh',
    received_custodian: 'A. SivaKrishna',
    items_summary: 'Bridal Haar Collection Stock Rebalancing',
  },
  {
    id: '66778899-d4e5-f6a1-b2c3-990011223347',
    transfer_manifest_no: 'IBT-2026-039',
    eway_bill_no: 'EWB-2026-9781',
    source_branch: 'Banjara Hills Flagship',
    destination_branch: 'Vizag Beach Road Store',
    carrier_custodian: 'Sequel Air Secured Airway #7890',
    security_seal_no: 'SEAL-2026-8872',
    items_count: 35,
    total_gross_grams: 810.150,
    total_fine_grams: 742.100,
    declared_value_inr: 6420000.00,
    dispatched_at: '2026-10-28 09:15',
    received_at: '2026-10-28 16:30',
    status: 'RECEIVED_ACKNOWLEDGED',
    dispatch_custodian: 'A. SivaKrishna',
    received_custodian: 'S. Anitha',
    items_summary: 'Festival Bridal Stock Exhibition Allocation',
  },
  {
    id: '66778899-d4e5-f6a1-b2c3-990011223348',
    transfer_manifest_no: 'IBT-2026-038',
    eway_bill_no: 'EWB-2026-9765',
    source_branch: 'Jubilee Hills Boutique',
    destination_branch: 'Banjara Hills Flagship',
    carrier_custodian: 'Internal Custodian (N. Varma)',
    security_seal_no: 'SEAL-2026-8850',
    items_count: 5,
    total_gross_grams: 145.200,
    total_fine_grams: 133.000,
    declared_value_inr: 1150000.00,
    dispatched_at: '2026-10-26 14:00',
    received_at: '2026-10-26 15:30',
    status: 'RECEIVED_ACKNOWLEDGED',
    dispatch_custodian: 'N. Varma',
    received_custodian: 'A. SivaKrishna',
    items_summary: 'Special Customer Custom Order Ring Mounts',
  },
];

export function BranchesTransfersView() {
  const [transfers, setTransfers] = useState<TransferManifest[]>(INITIAL_TRANSFERS);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterBranch, setFilterBranch] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [isNewTransferOpen, setIsNewTransferOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<TransferManifest | null>(null);
  const [isAcknowledgeModalOpen, setIsAcknowledgeModalOpen] = useState(false);
  const [isChallanModalOpen, setIsChallanModalOpen] = useState(false);

  // Acknowledge Receipt Form
  const [receivingScaleReading, setReceivingScaleReading] = useState<number>(0);
  const [sealCheckVerified, setSealCheckVerified] = useState(false);
  const [receivingPin, setReceivingPin] = useState('');
  const [receiptNotes, setReceiptNotes] = useState('');

  // New Transfer Form State
  const [sourceBranch, setSourceBranch] = useState('Banjara Hills Flagship');
  const [destinationBranch, setDestinationBranch] = useState('Jubilee Hills Boutique');
  const [carrierCustodian, setCarrierCustodian] = useState('BVC Armored Logistics (Van AP-09-AX-1029)');
  const [securitySealNo, setSecuritySealNo] = useState(`SEAL-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [ewayBillNo, setEwayBillNo] = useState(`EWB-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [itemsCount, setItemsCount] = useState(8);
  const [grossWeightGrams, setGrossWeightGrams] = useState<number>(245.500);
  const [fineWeightGrams, setFineWeightGrams] = useState<number>(224.880);
  const [declaredVal, setDeclaredVal] = useState<number>(1950000.00);
  const [dispatchPin, setDispatchPin] = useState('');
  const [itemsDescription, setItemsDescription] = useState('22K Casting Bangles & Lightweight Necklaces');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchPin.trim() || sourceBranch === destinationBranch) return;

    const manifestNo = `IBT-2026-0${transfers.length + 43}`;
    const newTransfer: TransferManifest = {
      id: crypto.randomUUID(),
      transfer_manifest_no: manifestNo,
      eway_bill_no: ewayBillNo,
      source_branch: sourceBranch,
      destination_branch: destinationBranch,
      carrier_custodian: carrierCustodian,
      security_seal_no: securitySealNo,
      items_count: Number(itemsCount),
      total_gross_grams: Number(grossWeightGrams),
      total_fine_grams: Number(fineWeightGrams),
      declared_value_inr: Number(declaredVal),
      dispatched_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'IN_TRANSIT',
      dispatch_custodian: 'A. SivaKrishna',
      items_summary: itemsDescription,
    };

    setTransfers([newTransfer, ...transfers]);
    setIsNewTransferOpen(false);
    setDispatchPin('');
  };

  const handleConfirmReceipt = () => {
    if (!selectedTransfer || !sealCheckVerified || !receivingPin) return;

    const isMatch = Math.abs(receivingScaleReading - selectedTransfer.total_gross_grams) < 0.005;

    setTransfers((prev) =>
      prev.map((t) =>
        t.id === selectedTransfer.id
          ? {
              ...t,
              status: isMatch ? 'RECEIVED_ACKNOWLEDGED' : 'DISCREPANCY',
              received_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
              received_custodian: 'Receiving Vault Officer',
            }
          : t
      )
    );

    setIsAcknowledgeModalOpen(false);
    setReceivingPin('');
    setSealCheckVerified(false);
  };

  const filteredTransfers = transfers.filter((t) => {
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    if (filterBranch !== 'ALL' && t.source_branch !== filterBranch && t.destination_branch !== filterBranch)
      return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchManifest = t.transfer_manifest_no.toLowerCase().includes(q);
      const matchEway = t.eway_bill_no.toLowerCase().includes(q);
      const matchSeal = t.security_seal_no.toLowerCase().includes(q);
      const matchItems = t.items_summary.toLowerCase().includes(q);
      if (!matchManifest && !matchEway && !matchSeal && !matchItems) return false;
    }
    return true;
  });

  const inTransitCount = transfers.filter((t) => t.status === 'IN_TRANSIT').length;
  const inTransitWeight = transfers
    .filter((t) => t.status === 'IN_TRANSIT')
    .reduce((acc, curr) => acc + curr.total_gross_grams, 0);
  const inTransitValue = transfers
    .filter((t) => t.status === 'IN_TRANSIT')
    .reduce((acc, curr) => acc + curr.declared_value_inr, 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="inter_branch_transfers" />
      <ActionToolbar
        filterPlaceholder="Filter by manifest #, E-Way bill, seal #, branch..."
        insertLabel="New Inter-Branch Transfer"
        onInsertClick={() => setIsNewTransferOpen(true)}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI metrics */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">In-Transit Shipments</span>
                <Truck className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-neutral-900">{inTransitCount} Manifests</div>
              <div className="text-[11px] text-amber-600 mt-1 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Live GPS Armored Transit
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Grams in Transit</span>
                <Scale className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-neutral-900">{inTransitWeight.toFixed(3)} g</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Tamper-evident sealed bags
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Value in Transit</span>
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">
                ₹ {(inTransitValue / 100000).toFixed(1)} Lakhs
              </div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                Transit Insurance Covered
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Transfers This Month</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">28 Manifests</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                100% Zero Discrepancy
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-neutral-400 font-mono text-[11px]">Filters:</span>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="RECEIVED_ACKNOWLEDGED">Received & Acknowledged</option>
                  <option value="DISCREPANCY">Discrepancy</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Branch:</span>
                <select
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Branches</option>
                  <option value="Banjara Hills Flagship">Banjara Hills Flagship</option>
                  <option value="Jubilee Hills Boutique">Jubilee Hills Boutique</option>
                  <option value="Vijayawada MG Road Outlet">Vijayawada MG Road</option>
                  <option value="Vizag Beach Road Store">Vizag Beach Road</option>
                  <option value="Hyderabad RGIA Terminal 1">RGIA Terminal 1</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search Manifest # / E-Way / Seal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 px-2.5 py-1 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none placeholder:text-neutral-400 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Supabase-style Table */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  public.inter_branch_transfers
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Showing {filteredTransfers.length} of {transfers.length} transfer manifests
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
                        <span className="text-neutral-800">transfer_manifest_no</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">eway_bill_no</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">source_branch &rarr; destination</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">items</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">gross_wt_g</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">declared_val (₹)</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">dispatch_time</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">status</span>
                      </th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {filteredTransfers.map((item) => (
                      <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="w-10 px-3 py-2 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span
                              onClick={() => {
                                setSelectedTransfer(item);
                                setIsChallanModalOpen(true);
                              }}
                              className="font-medium text-emerald-700 hover:underline cursor-pointer"
                            >
                              {item.transfer_manifest_no}
                            </span>
                            <button
                              onClick={() => copyToClipboard(item.transfer_manifest_no, item.id)}
                              className="text-neutral-400 hover:text-neutral-600"
                              title="Copy manifest #"
                            >
                              {copiedId === item.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <span className="block text-[10px] text-neutral-400">
                            Seal: {item.security_seal_no}
                          </span>
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-[11px] text-neutral-700">
                          {item.eway_bill_no}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <div className="font-medium text-neutral-800 flex items-center gap-1 text-xs">
                            <span>{item.source_branch}</span>
                            <span className="text-neutral-400">&rarr;</span>
                            <span className="text-emerald-700">{item.destination_branch}</span>
                          </div>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            {item.carrier_custodian}
                          </span>
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono">
                          {item.items_count} pcs
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono">
                          <span className="font-medium text-neutral-900">
                            {item.total_gross_grams.toFixed(3)} g
                          </span>
                          <span className="block text-[10px] text-neutral-400">
                            Net: {item.total_fine_grams.toFixed(3)} g
                          </span>
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono">
                          ₹ {item.declared_value_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-[11px] text-neutral-600">
                          {item.dispatched_at}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          {item.status === 'IN_TRANSIT' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              IN TRANSIT
                            </span>
                          )}
                          {item.status === 'RECEIVED_ACKNOWLEDGED' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              ACKNOWLEDGED
                            </span>
                          )}
                          {item.status === 'DISCREPANCY' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-red-50 text-red-700 border border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              DISCREPANCY
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {item.status === 'IN_TRANSIT' && (
                              <button
                                onClick={() => {
                                  setSelectedTransfer(item);
                                  setReceivingScaleReading(item.total_gross_grams);
                                  setIsAcknowledgeModalOpen(true);
                                }}
                                className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                                title="Acknowledge & Receive Stock"
                              >
                                <Scale className="w-3 h-3 text-emerald-600" />
                                Receive
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedTransfer(item);
                                setIsChallanModalOpen(true);
                              }}
                              className="p-1 rounded text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
                              title="Print Delivery Challan"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'definition' && (
              <div className="p-4 overflow-x-auto font-mono text-xs text-neutral-800 bg-[#fbfbfb] w-full">
                <div className="bg-neutral-900 text-neutral-100 p-4 rounded-md overflow-x-auto shadow-inner text-[12px] leading-relaxed w-full">
                  <span className="text-emerald-400">CREATE TABLE</span> public.inter_branch_transfers (
                  <br />
                  &nbsp;&nbsp;id <span className="text-purple-400">UUID</span>{' '}
                  <span className="text-neutral-400">PRIMARY KEY DEFAULT gen_random_uuid()</span>,
                  <br />
                  &nbsp;&nbsp;transfer_manifest_no <span className="text-purple-400">VARCHAR(30)</span>{' '}
                  <span className="text-neutral-400">UNIQUE NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;eway_bill_no <span className="text-purple-400">VARCHAR(30)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;source_branch <span className="text-purple-400">VARCHAR(100)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;destination_branch <span className="text-purple-400">VARCHAR(100)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;carrier_custodian <span className="text-purple-400">VARCHAR(120)</span>,
                  <br />
                  &nbsp;&nbsp;security_seal_no <span className="text-purple-400">VARCHAR(50)</span>,
                  <br />
                  &nbsp;&nbsp;items_count <span className="text-purple-400">INTEGER</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;total_gross_grams <span className="text-purple-400">NUMERIC(10,3)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;total_fine_grams <span className="text-purple-400">NUMERIC(10,3)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;declared_value_inr <span className="text-purple-400">NUMERIC(12,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;dispatched_at <span className="text-purple-400">TIMESTAMPTZ</span>{' '}
                  <span className="text-neutral-400">DEFAULT NOW()</span>,
                  <br />
                  &nbsp;&nbsp;received_at <span className="text-purple-400">TIMESTAMPTZ</span>,
                  <br />
                  &nbsp;&nbsp;dispatch_custodian <span className="text-purple-400">VARCHAR(80)</span>,
                  <br />
                  &nbsp;&nbsp;received_custodian <span className="text-purple-400">VARCHAR(80)</span>,
                  <br />
                  &nbsp;&nbsp;status <span className="text-purple-400">VARCHAR(30)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;IN_TRANSIT&apos;</span>
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawer: New Inter-Branch Transfer */}
      {isNewTransferOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs transition-all">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-medium text-neutral-900">
                    Dispatch Inter-Branch Stock Transfer
                  </h3>
                </div>
                <button
                  onClick={() => setIsNewTransferOpen(false)}
                  className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTransfer} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Origin Branch
                    </label>
                    <select
                      value={sourceBranch}
                      onChange={(e) => setSourceBranch(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    >
                      <option value="Banjara Hills Flagship">Banjara Hills Flagship</option>
                      <option value="Jubilee Hills Boutique">Jubilee Hills Boutique</option>
                      <option value="Vijayawada MG Road Outlet">Vijayawada MG Road Outlet</option>
                      <option value="Vizag Beach Road Store">Vizag Beach Road Store</option>
                      <option value="Hyderabad RGIA Terminal 1">Hyderabad RGIA Terminal 1</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Destination Branch
                    </label>
                    <select
                      value={destinationBranch}
                      onChange={(e) => setDestinationBranch(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    >
                      <option value="Jubilee Hills Boutique">Jubilee Hills Boutique</option>
                      <option value="Banjara Hills Flagship">Banjara Hills Flagship</option>
                      <option value="Vijayawada MG Road Outlet">Vijayawada MG Road Outlet</option>
                      <option value="Vizag Beach Road Store">Vizag Beach Road Store</option>
                      <option value="Hyderabad RGIA Terminal 1">Hyderabad RGIA Terminal 1</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Transit Carrier / Escort Custodian
                  </label>
                  <select
                    value={carrierCustodian}
                    onChange={(e) => setCarrierCustodian(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  >
                    <option value="BVC Armored Logistics (Van AP-09-AX-1029)">
                      BVC Armored Logistics (Van AP-09-AX-1029)
                    </option>
                    <option value="Sequel Secure Logistics (Van TS-10-UB-4421)">
                      Sequel Secure Logistics (Van TS-10-UB-4421)
                    </option>
                    <option value="Internal Store Custodian Escort">Internal Store Custodian Escort</option>
                    <option value="Sequel Secured Air Freight Transit">Sequel Secured Air Freight Transit</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Security Bag Tag Seal #
                    </label>
                    <input
                      type="text"
                      value={securitySealNo}
                      onChange={(e) => setSecuritySealNo(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      E-Way Bill Number
                    </label>
                    <input
                      type="text"
                      value={ewayBillNo}
                      onChange={(e) => setEwayBillNo(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Manifest Items Summary
                  </label>
                  <textarea
                    rows={2}
                    value={itemsDescription}
                    onChange={(e) => setItemsDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    required
                  />
                </div>

                <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                  <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-neutral-600" />
                    Weight & Statutory Valuation
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-neutral-700 mb-1 block">
                        Item Pieces
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={itemsCount}
                        onChange={(e) => setItemsCount(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-700 mb-1 block">
                        Gross Wt (g)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={grossWeightGrams}
                        onChange={(e) => setGrossWeightGrams(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-700 mb-1 block">
                        Net Fine Wt (g)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={fineWeightGrams}
                        onChange={(e) => setFineWeightGrams(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Declared E-Way Value (₹)
                    </label>
                    <input
                      type="number"
                      step="100"
                      value={declaredVal}
                      onChange={(e) => setDeclaredVal(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200">
                  <div className="text-xs font-medium text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    Dispatch Authorization
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Dispatch Custodian Security PIN
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="Enter 4 or 6-digit Vault PIN"
                      value={dispatchPin}
                      onChange={(e) => setDispatchPin(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-amber-300 rounded-md bg-white focus:border-amber-500 focus:outline-none text-neutral-800 font-mono text-center tracking-widest"
                      required
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewTransferOpen(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Generate Manifest & Dispatch
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Acknowledge & Receive Stock Verification */}
      {isAcknowledgeModalOpen && selectedTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#e5e7eb] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="px-5 py-4 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">
                  Verify & Acknowledge Stock Receipt
                </h3>
              </div>
              <button
                onClick={() => setIsAcknowledgeModalOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 rounded bg-[#f8fafc] border border-[#e2e8f0] text-xs space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Manifest Number:</span>
                  <span className="font-medium text-neutral-900">{selectedTransfer.transfer_manifest_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Dispatched From:</span>
                  <span className="text-neutral-900">{selectedTransfer.source_branch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Security Seal #:</span>
                  <span className="text-neutral-900">{selectedTransfer.security_seal_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Dispatched Gross Wt:</span>
                  <span className="font-medium text-neutral-900">{selectedTransfer.total_gross_grams.toFixed(3)} g</span>
                </div>
              </div>

              {/* Digital Scale Reading */}
              <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
                <div className="text-xs font-medium text-emerald-900 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-emerald-600" />
                    Receiving Digital Scale Verification
                  </span>
                  <span className="text-[10px] text-emerald-700 font-mono">CALIBRATED LIVE</span>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Verified Gross Weight on Counter Scale (g)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={receivingScaleReading}
                    onChange={(e) => setReceivingScaleReading(Number(e.target.value))}
                    className="w-full px-3 py-2 text-base border border-emerald-300 rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-900 font-mono text-center font-medium"
                    required
                  />
                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-neutral-500">Dispatched Gross: {selectedTransfer.total_gross_grams.toFixed(3)} g</span>
                    <span
                      className={`font-medium ${
                        Math.abs(receivingScaleReading - selectedTransfer.total_gross_grams) < 0.005
                          ? 'text-emerald-700'
                          : 'text-red-600'
                      }`}
                    >
                      Variance: {(receivingScaleReading - selectedTransfer.total_gross_grams).toFixed(3)} g
                    </span>
                  </div>
                </div>
              </div>

              {/* Seal Integrity Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-lg border border-[#e2e8f0] bg-white cursor-pointer hover:bg-neutral-50 transition-colors">
                <input
                  type="checkbox"
                  checked={sealCheckVerified}
                  onChange={(e) => setSealCheckVerified(e.target.checked)}
                  className="mt-0.5 rounded border-neutral-300 text-emerald-600 focus:ring-0"
                />
                <span className="text-xs text-neutral-700 leading-relaxed">
                  I confirm the tamper-evident security seal ({selectedTransfer.security_seal_no}) is intact with zero cut, tear, or opening marks.
                </span>
              </label>

              {/* Receiving Custodian PIN */}
              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">
                  Receiving Custodian Authorization PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Enter 4 or 6-digit Receiving Vault PIN"
                  value={receivingPin}
                  onChange={(e) => setReceivingPin(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono text-center tracking-widest"
                  required
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAcknowledgeModalOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!sealCheckVerified || !receivingPin}
                onClick={handleConfirmReceipt}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Acknowledge & Receive Into Vault
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delivery Challan & E-Way Bill Preview */}
      {isChallanModalOpen && selectedTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#e5e7eb] w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="px-5 py-3.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">
                  Delivery Challan & E-Way Bill Manifest
                </h3>
              </div>
              <button
                onClick={() => setIsChallanModalOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar font-mono text-xs text-neutral-800">
              {/* Header Box */}
              <div className="border border-neutral-300 p-4 rounded bg-[#fcfcfc] text-center">
                <div className="text-sm font-medium tracking-wide text-neutral-900">
                  JEWELLERY NEXT RETAILERS PVT LTD
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  GST Delivery Challan (Rule 55 - Stock Transfer for Exhibition / Multi-Store)
                </div>
                <div className="text-[11px] text-neutral-600 mt-1">
                  Challan #{selectedTransfer.transfer_manifest_no} • E-Way Bill: {selectedTransfer.eway_bill_no}
                </div>
              </div>

              {/* Source & Destination */}
              <div className="grid grid-cols-2 gap-4 border border-neutral-300 p-3 rounded">
                <div>
                  <span className="text-[10px] uppercase text-neutral-400 block">Dispatch Origin</span>
                  <span className="font-medium text-neutral-900 block">{selectedTransfer.source_branch}</span>
                  <span className="text-[11px] text-neutral-500">Custodian: {selectedTransfer.dispatch_custodian}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-neutral-400 block">Destination Store</span>
                  <span className="font-medium text-neutral-900 block">{selectedTransfer.destination_branch}</span>
                  <span className="text-[11px] text-neutral-500">Status: {selectedTransfer.status}</span>
                </div>
              </div>

              {/* Transit Cargo Details */}
              <table className="w-full text-left border border-neutral-300 border-collapse">
                <thead className="bg-[#f8fafc] border-b border-neutral-300 text-[11px]">
                  <tr>
                    <th className="p-2 border-r border-neutral-300">Description</th>
                    <th className="p-2 border-r border-neutral-300">HSN</th>
                    <th className="p-2 border-r border-neutral-300 text-right">Pieces</th>
                    <th className="p-2 border-r border-neutral-300 text-right">Gross Wt (g)</th>
                    <th className="p-2 text-right">Declared Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-xs">
                  <tr>
                    <td className="p-2 border-r border-neutral-300">{selectedTransfer.items_summary}</td>
                    <td className="p-2 border-r border-neutral-300">71131910</td>
                    <td className="p-2 border-r border-neutral-300 text-right">{selectedTransfer.items_count}</td>
                    <td className="p-2 border-r border-neutral-300 text-right">{selectedTransfer.total_gross_grams.toFixed(3)}</td>
                    <td className="p-2 text-right font-medium">₹ {selectedTransfer.declared_value_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>

              {/* Seal & Vehicle Details */}
              <div className="p-3 rounded bg-[#f8fafc] border border-neutral-300 text-[11px] space-y-1">
                <div>Armored Carrier: {selectedTransfer.carrier_custodian}</div>
                <div>Security Seal Number: {selectedTransfer.security_seal_no}</div>
                <div>Dispatched Timestamp: {selectedTransfer.dispatched_at}</div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-4 pt-6 text-center text-[11px]">
                <div className="border-t border-neutral-400 pt-1">
                  <span>Dispatch Officer Signature</span>
                  <span className="block text-neutral-400 text-[10px]">{selectedTransfer.dispatch_custodian}</span>
                </div>
                <div className="border-t border-neutral-400 pt-1">
                  <span>Receiving Vault Custodian</span>
                  <span className="block text-neutral-400 text-[10px]">{selectedTransfer.received_custodian || 'Pending Physical Arrival'}</span>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between">
              <span className="text-[11px] text-neutral-500 font-mono">
                Manifest ID: {selectedTransfer.id}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Official Challan
                </button>
                <button
                  onClick={() => setIsChallanModalOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
