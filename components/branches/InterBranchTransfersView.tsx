'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Loader2,
  AlertCircle,
  Trash2,
  RefreshCw,
  ExternalLink,
  Boxes,
  Radio,
  FileSpreadsheet,
  TrendingUp,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';

export interface TransferManifest {
  id: string;
  transfer_manifest_no: string;
  eway_bill_no: string;
  transit_pass_no?: string;
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
  status: 'IN_TRANSIT' | 'RECEIVED_ACKNOWLEDGED' | 'DISCREPANCY' | 'CANCELLED';
  dispatch_custodian: string;
  received_custodian?: string;
  items_summary: string;
  notes?: string;
  created_at?: string;
}

export function BranchesTransfersView() {
  const [transfers, setTransfers] = useState<TransferManifest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterBranch, setFilterBranch] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [isNewTransferOpen, setIsNewTransferOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<TransferManifest | null>(null);
  const [isAcknowledgeModalOpen, setIsAcknowledgeModalOpen] = useState(false);
  const [isChallanModalOpen, setIsChallanModalOpen] = useState(false);
  const [transferToDelete, setTransferToDelete] = useState<TransferManifest | null>(null);

  // Acknowledge Receipt Form
  const [receivingScaleReading, setReceivingScaleReading] = useState<number>(0);
  const [sealCheckVerified, setSealCheckVerified] = useState(false);
  const [receivingOfficer, setReceivingOfficer] = useState('Receiving Vault Officer');
  const [receiptNotes, setReceiptNotes] = useState('');

  // New Transfer Form State
  const [sourceBranch, setSourceBranch] = useState('Banjara Hills Flagship');
  const [destinationBranch, setDestinationBranch] = useState('Jubilee Hills Boutique');
  const [carrierCustodian, setCarrierCustodian] = useState('BVC Armored Logistics (Van AP-09-AX-1029)');
  const [securitySealNo, setSecuritySealNo] = useState('');
  const [ewayBillNo, setEwayBillNo] = useState('');
  const [transitPassNo, setTransitPassNo] = useState('');
  const [itemsCount, setItemsCount] = useState<number>(10);
  const [grossWeightGrams, setGrossWeightGrams] = useState<number>(250.0);
  const [fineWeightGrams, setFineWeightGrams] = useState<number>(229.0);
  const [declaredVal, setDeclaredVal] = useState<number>(1980000.0);
  const [dispatchCustodian, setDispatchCustodian] = useState('A. SivaKrishna');
  const [itemsDescription, setItemsDescription] = useState('22K Casting Bangles & Lightweight Necklaces');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'branches_transfers'));
      const list: TransferManifest[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<TransferManifest, 'id'>) });
      });
      setTransfers(list);
    } catch (err: any) {
      console.error('Error fetching transfers:', err);
      showToast('error', err.message || 'Failed to fetch transfers from Firestore');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenNewTransfer = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setSecuritySealNo(`SEAL-2026-${randomSuffix}`);
    setEwayBillNo(`EWB-2026-${randomSuffix}`);
    setTransitPassNo(`TP-TS-${randomSuffix}`);
    setSourceBranch('Banjara Hills Flagship');
    setDestinationBranch('Jubilee Hills Boutique');
    setCarrierCustodian('BVC Armored Logistics (Van AP-09-AX-1029)');
    setItemsCount(8);
    setGrossWeightGrams(245.5);
    setFineWeightGrams(224.88);
    setDeclaredVal(1950000);
    setDispatchCustodian('A. SivaKrishna');
    setItemsDescription('22K Casting Bangles & Lightweight Necklaces');
    setIsNewTransferOpen(true);
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceBranch === destinationBranch) {
      showToast('error', 'Source and destination branches cannot be identical');
      return;
    }

    try {
      setSaving(true);
      const manifestNo = `IBT-2026-0${transfers.length + 45}`;
      const payload: Omit<TransferManifest, 'id'> = {
        transfer_manifest_no: manifestNo,
        eway_bill_no: ewayBillNo.trim().toUpperCase(),
        transit_pass_no: transitPassNo.trim().toUpperCase(),
        source_branch: sourceBranch,
        destination_branch: destinationBranch,
        carrier_custodian: carrierCustodian.trim(),
        security_seal_no: securitySealNo.trim().toUpperCase(),
        items_count: Number(itemsCount) || 1,
        total_gross_grams: Number(grossWeightGrams) || 0,
        total_fine_grams: Number(fineWeightGrams) || 0,
        declared_value_inr: Number(declaredVal) || 0,
        dispatched_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'IN_TRANSIT',
        dispatch_custodian: dispatchCustodian.trim() || 'Head Vault Officer',
        items_summary: itemsDescription.trim(),
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'branches_transfers'), payload);
      setTransfers((prev) => [{ id: docRef.id, ...payload }, ...prev]);
      setIsNewTransferOpen(false);
      showToast('success', `Transfer manifest ${manifestNo} dispatched successfully!`);
    } catch (err: any) {
      console.error('Error creating transfer:', err);
      showToast('error', err.message || 'Failed to dispatch transfer');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmReceipt = async () => {
    if (!selectedTransfer || !sealCheckVerified) {
      showToast('error', 'Please verify that the security tamper seal is intact before confirming');
      return;
    }

    try {
      setSaving(true);
      const isMatch = Math.abs(receivingScaleReading - selectedTransfer.total_gross_grams) < 0.01;
      const nextStatus = isMatch ? 'RECEIVED_ACKNOWLEDGED' : 'DISCREPANCY';
      const receivedTime = new Date().toISOString().replace('T', ' ').substring(0, 16);

      await updateDoc(doc(db, 'branches_transfers', selectedTransfer.id), {
        status: nextStatus,
        received_at: receivedTime,
        received_custodian: receivingOfficer.trim() || 'Receiving Vault Officer',
        notes: receiptNotes.trim()
          ? receiptNotes
          : isMatch
          ? 'Weight reconciled with precision scale.'
          : `Discrepancy: Dispatched ${selectedTransfer.total_gross_grams}g vs Received ${receivingScaleReading}g`,
      });

      setTransfers((prev) =>
        prev.map((t) =>
          t.id === selectedTransfer.id
            ? {
                ...t,
                status: nextStatus,
                received_at: receivedTime,
                received_custodian: receivingOfficer.trim(),
              }
            : t
        )
      );

      setIsAcknowledgeModalOpen(false);
      setSealCheckVerified(false);
      setReceiptNotes('');
      showToast(
        isMatch ? 'success' : 'error',
        isMatch
          ? `Transfer ${selectedTransfer.transfer_manifest_no} received & acknowledged!`
          : `Weight mismatch recorded on ${selectedTransfer.transfer_manifest_no}!`
      );
    } catch (err: any) {
      console.error('Error acknowledging receipt:', err);
      showToast('error', err.message || 'Failed to acknowledge receipt');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTransfer = async () => {
    if (!transferToDelete) return;
    try {
      setSaving(true);
      await deleteDoc(doc(db, 'branches_transfers', transferToDelete.id));
      setTransfers((prev) => prev.filter((t) => t.id !== transferToDelete.id));
      if (selectedTransfer?.id === transferToDelete.id) {
        setSelectedTransfer(null);
      }
      showToast('success', `Transfer manifest ${transferToDelete.transfer_manifest_no} deleted.`);
      setTransferToDelete(null);
    } catch (err: any) {
      console.error('Error deleting transfer:', err);
      showToast('error', err.message || 'Failed to delete transfer');
    } finally {
      setSaving(false);
    }
  };

  const filteredTransfers = transfers.filter((t) => {
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    if (filterBranch !== 'ALL' && t.source_branch !== filterBranch && t.destination_branch !== filterBranch)
      return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchManifest = (t.transfer_manifest_no || '').toLowerCase().includes(q);
      const matchEway = (t.eway_bill_no || '').toLowerCase().includes(q);
      const matchSeal = (t.security_seal_no || '').toLowerCase().includes(q);
      const matchItems = (t.items_summary || '').toLowerCase().includes(q);
      if (!matchManifest && !matchEway && !matchSeal && !matchItems) return false;
    }
    return true;
  });

  const inTransitCount = transfers.filter((t) => t.status === 'IN_TRANSIT').length;
  const inTransitWeight = transfers
    .filter((t) => t.status === 'IN_TRANSIT')
    .reduce((acc, curr) => acc + (Number(curr.total_gross_grams) || 0), 0);
  const inTransitValue = transfers
    .filter((t) => t.status === 'IN_TRANSIT')
    .reduce((acc, curr) => acc + (Number(curr.declared_value_inr) || 0), 0);
  const acknowledgedCount = transfers.filter((t) => t.status === 'RECEIVED_ACKNOWLEDGED').length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="inter_branch_transfers" />
      <ActionToolbar
        filterPlaceholder="Filter by manifest #, E-Way bill, seal #, branch..."
        insertLabel="New Inter-Branch Transfer"
        onInsertClick={handleOpenNewTransfer}
        onRefresh={fetchTransfers}
      />

      {/* Real-time Toast Banner */}
      {toastType !== 'idle' && (
        <div
          className={`px-4 py-2 text-xs flex items-center justify-between transition-all ${
            toastType === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
              : 'bg-red-50 text-red-800 border-b border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastType === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastType('idle')}
            className="p-0.5 hover:bg-neutral-200/50 rounded text-neutral-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Module Interlinking Sub-Header Bar */}
      <div className="h-[38px] bg-[#f8fafc] border-b border-[#e2e8f0] px-4 flex items-center justify-between text-xs overflow-x-auto no-scrollbar gap-2 shrink-0">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="text-[11px] text-neutral-400 uppercase tracking-wider mr-1">Modules:</span>
          <Link
            href="/branches/management"
            className="px-2.5 py-1 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-white text-[11px] flex items-center gap-1 transition-colors"
          >
            <Building2 className="w-3 h-3 text-neutral-500" />
            Branch Directory
          </Link>
          <Link
            href="/branches/stock"
            className="px-2.5 py-1 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-white text-[11px] flex items-center gap-1 transition-colors"
          >
            <Boxes className="w-3 h-3 text-neutral-500" />
            Branch Stock
          </Link>
          <Link
            href="/branches/transfers"
            className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] flex items-center gap-1"
          >
            <ArrowRightLeft className="w-3 h-3 text-emerald-600" />
            Inter-Branch Transfers
          </Link>
          <Link
            href="/branches/rates"
            className="px-2.5 py-1 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-white text-[11px] flex items-center gap-1 transition-colors"
          >
            <Radio className="w-3 h-3 text-neutral-500" />
            Rate Broadcast
          </Link>
          <Link
            href="/branches/consolidated-reports"
            className="px-2.5 py-1 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-white text-[11px] flex items-center gap-1 transition-colors"
          >
            <FileSpreadsheet className="w-3 h-3 text-neutral-500" />
            Consolidated Reports
          </Link>
        </div>

        <div className="flex items-center gap-2 text-[11px] shrink-0 font-medium">
          <Link
            href="/inventory/stock-transfers"
            className="text-neutral-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3 text-neutral-400" />
            Internal Vault Transfers
          </Link>
          <span className="text-neutral-300">|</span>
          <Link
            href="/sales/delivery-challans"
            className="text-neutral-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <FileText className="w-3 h-3 text-neutral-400" />
            Delivery Challans
          </Link>
        </div>
      </div>

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
                Live Armored Transit
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Gross Weight Moving</span>
                <Scale className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">{inTransitWeight.toFixed(3)} g</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Across active logistics
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Transit Declared Value</span>
                <Lock className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">
                ₹{(inTransitValue / 100000).toFixed(2)} Lakhs
              </div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                Transit Insured 100%
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Delivered &amp; Reconciled</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">{acknowledgedCount} Shipments</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                Zero weight shortfall
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
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer font-medium"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="RECEIVED_ACKNOWLEDGED">Received &amp; Verified</option>
                  <option value="DISCREPANCY">Discrepancy</option>
                </select>
              </div>

              <button
                onClick={fetchTransfers}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-600 hover:text-neutral-900 bg-white border border-[#e2e8f0] rounded-md hover:bg-neutral-50 transition-colors font-medium cursor-pointer"
                title="Reload from Firestore"
              >
                <RefreshCw className="w-3 h-3 text-neutral-500" />
                <span>Sync</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search manifest, e-way bill, seal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 px-2.5 py-1 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none placeholder:text-neutral-400 font-mono"
              />
              <button
                onClick={handleOpenNewTransfer}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Transfer</span>
              </button>
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
                  public.branches_transfers
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  {loading
                    ? 'Loading shipments...'
                    : `Showing ${filteredTransfers.length} of ${transfers.length} transfers`}
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
                {loading ? (
                  <div className="p-16 flex flex-col items-center justify-center gap-2 text-neutral-500">
                    <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
                    <span className="text-xs font-medium">Loading transfer manifests from Firebase...</span>
                  </div>
                ) : filteredTransfers.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                      <Truck className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-medium text-neutral-800">
                      {transfers.length === 0 ? 'No Inter-Branch Transfers Found' : 'No Transfers Match Filter'}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                      {transfers.length === 0
                        ? 'No transfer manifests have been created yet. Generate your first inter-branch delivery challan and E-Way Bill for armored transit.'
                        : 'No transfers match your active search and filter criteria.'}
                    </p>
                    {transfers.length === 0 && (
                      <button
                        onClick={handleOpenNewTransfer}
                        className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Initiate First Transfer
                      </button>
                    )}
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#fcfcfc] border-b border-[#e5e7eb] text-neutral-600 font-mono text-[11px]">
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">manifest_no</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">route (source → dest)</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">carrier &amp; seal</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">gross_grams</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">fine_grams</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">declared_val</span>
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
                                title="Copy manifest"
                              >
                                {copiedId === item.id ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                              {item.eway_bill_no}
                            </div>
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                            <div className="flex items-center gap-1 text-neutral-800 font-medium">
                              <span>{item.source_branch}</span>
                              <ArrowRightLeft className="w-3 h-3 text-neutral-400 shrink-0" />
                              <span>{item.destination_branch}</span>
                            </div>
                            <span className="text-[10px] text-neutral-500 font-mono">
                              Dispatched: {item.dispatched_at}
                            </span>
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                            <div className="text-neutral-800 font-medium">{item.carrier_custodian}</div>
                            <span className="text-[10px] text-neutral-500 font-mono flex items-center gap-1 mt-0.5">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              {item.security_seal_no}
                            </span>
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono font-medium text-neutral-900">
                            {Number(item.total_gross_grams || 0).toFixed(3)}g
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono text-emerald-700 font-medium">
                            {Number(item.total_fine_grams || 0).toFixed(3)}g
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono text-neutral-800">
                            ₹{Number(item.declared_value_inr || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                            {item.status === 'IN_TRANSIT' ? (
                              <button
                                onClick={() => {
                                  setSelectedTransfer(item);
                                  setReceivingScaleReading(item.total_gross_grams);
                                  setIsAcknowledgeModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                                title="Click to Acknowledge Receipt"
                              >
                                <Clock className="w-3 h-3 text-amber-500 animate-spin" />
                                IN TRANSIT (Receive)
                              </button>
                            ) : item.status === 'RECEIVED_ACKNOWLEDGED' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                RECEIVED
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-red-50 text-red-700 border border-red-200">
                                <AlertTriangle className="w-3 h-3 text-red-600" />
                                DISCREPANCY
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedTransfer(item);
                                  setIsChallanModalOpen(true);
                                }}
                                className="p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                                title="View Delivery Challan / Transit Pass"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setTransferToDelete(item)}
                                className="p-1 rounded text-neutral-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete manifest"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'definition' && (
              <div className="p-4 overflow-x-auto font-mono text-xs text-neutral-800 bg-[#fbfbfb] w-full">
                <div className="bg-neutral-900 text-neutral-100 p-4 rounded-md overflow-x-auto shadow-inner text-[12px] leading-relaxed w-full">
                  <span className="text-emerald-400">CREATE TABLE</span> public.branches_transfers (
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
                  &nbsp;&nbsp;carrier_custodian <span className="text-purple-400">VARCHAR(100)</span>,
                  <br />
                  &nbsp;&nbsp;security_seal_no <span className="text-purple-400">VARCHAR(30)</span>,
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
                  &nbsp;&nbsp;status <span className="text-purple-400">VARCHAR(30)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;IN_TRANSIT&apos;</span>,
                  <br />
                  &nbsp;&nbsp;dispatched_at <span className="text-purple-400">TIMESTAMPTZ</span>,
                  <br />
                  &nbsp;&nbsp;received_at <span className="text-purple-400">TIMESTAMPTZ</span>,
                  <br />
                  &nbsp;&nbsp;created_at <span className="text-purple-400">TIMESTAMPTZ</span>{' '}
                  <span className="text-neutral-400">DEFAULT NOW()</span>
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawer: New Inter-Branch Transfer Form */}
      {isNewTransferOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs transition-all">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
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
                      Source Branch (Dispatching)
                    </label>
                    <input
                      type="text"
                      value={sourceBranch}
                      onChange={(e) => setSourceBranch(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Destination Branch (Receiving)
                    </label>
                    <input
                      type="text"
                      value={destinationBranch}
                      onChange={(e) => setDestinationBranch(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      E-Way Bill #
                    </label>
                    <input
                      type="text"
                      value={ewayBillNo}
                      onChange={(e) => setEwayBillNo(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Tamper Seal #
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
                      Transit Pass #
                    </label>
                    <input
                      type="text"
                      value={transitPassNo}
                      onChange={(e) => setTransitPassNo(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Armored Carrier / Custodian Escort
                  </label>
                  <input
                    type="text"
                    value={carrierCustodian}
                    onChange={(e) => setCarrierCustodian(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    required
                  />
                </div>

                <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                  <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-neutral-600" />
                      Manifest Weights &amp; Valuation
                    </span>
                    <span className="text-[11px] text-emerald-600 font-mono font-medium">
                      Purity: {((Number(fineWeightGrams) / (Number(grossWeightGrams) || 1)) * 100).toFixed(1)}% Fine
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-neutral-700 mb-1 block">
                        Gross Wt (grams)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        min={0}
                        value={grossWeightGrams}
                        onChange={(e) => {
                          const gross = Number(e.target.value);
                          setGrossWeightGrams(gross);
                          setFineWeightGrams(Number((gross * 0.916).toFixed(3)));
                        }}
                        className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-700 mb-1 block">
                        Fine Wt (grams)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        min={0}
                        value={fineWeightGrams}
                        onChange={(e) => setFineWeightGrams(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-700 mb-1 block">
                        Declared INR
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={declaredVal}
                        onChange={(e) => setDeclaredVal(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Pieces Count
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={itemsCount}
                      onChange={(e) => setItemsCount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Dispatching Officer
                    </label>
                    <input
                      type="text"
                      value={dispatchCustodian}
                      onChange={(e) => setDispatchCustodian(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Manifest Items Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. 22K Casting Bangles (6 pairs), Antique Temple Chokers (2 sets)"
                    value={itemsDescription}
                    onChange={(e) => setItemsDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    required
                  />
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
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Dispatching...</span>
                      </>
                    ) : (
                      <>
                        <Truck className="w-3.5 h-3.5" />
                        <span>Dispatch &amp; Save Manifest</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Acknowledge & Weigh Inward Shipment */}
      {isAcknowledgeModalOpen && selectedTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#e5e7eb] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="px-5 py-4 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-medium text-neutral-900">
                    Acknowledge Branch Inward Receipt
                  </h3>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    Manifest: {selectedTransfer.transfer_manifest_no}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsAcknowledgeModalOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Route:</span>
                  <span className="font-medium text-neutral-900">
                    {selectedTransfer.source_branch} → {selectedTransfer.destination_branch}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Dispatched Gross Weight:</span>
                  <span className="font-mono font-medium text-neutral-900">
                    {Number(selectedTransfer.total_gross_grams || 0).toFixed(3)} grams
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Expected Security Seal:</span>
                  <span className="font-mono text-emerald-700 font-medium">
                    {selectedTransfer.security_seal_no}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">
                  Receiving Precision Scale Gross Reading (grams)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={receivingScaleReading}
                  onChange={(e) => setReceivingScaleReading(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono text-sm"
                  required
                />
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Delta vs Dispatched:{' '}
                  <span
                    className={`font-mono font-medium ${
                      Math.abs(receivingScaleReading - selectedTransfer.total_gross_grams) < 0.01
                        ? 'text-emerald-600'
                        : 'text-red-600'
                    }`}
                  >
                    {(receivingScaleReading - selectedTransfer.total_gross_grams).toFixed(3)}g
                  </span>
                </span>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">
                  Receiving Vault Officer Name
                </label>
                <input
                  type="text"
                  value={receivingOfficer}
                  onChange={(e) => setReceivingOfficer(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  required
                />
              </div>

              <label className="flex items-start gap-2 p-3 rounded-lg border border-neutral-200 bg-neutral-50 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={sealCheckVerified}
                  onChange={(e) => setSealCheckVerified(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-neutral-700">
                  I physically inspected the security tamper seal <span className="font-mono font-medium text-neutral-900">{selectedTransfer.security_seal_no}</span> and confirm it was intact with NO signs of transit breach.
                </span>
              </label>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">
                  Receiving Inward Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Unboxed in presence of branch manager, items matched manifest count."
                  value={receiptNotes}
                  onChange={(e) => setReceiptNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAcknowledgeModalOpen(false)}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReceipt}
                disabled={saving || !sealCheckVerified}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Inward Receipt</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View Challan & Manifest Printable Sheet */}
      {isChallanModalOpen && selectedTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#e5e7eb] w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="px-5 py-4 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">
                  Inter-Branch Delivery Challan &amp; Transit Pass
                </h3>
              </div>
              <button
                onClick={() => setIsChallanModalOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 font-mono text-xs max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* Printable Header */}
              <div className="border border-neutral-300 p-4 rounded-sm space-y-3 bg-white">
                <div className="text-center border-b border-neutral-200 pb-3">
                  <div className="text-base font-medium text-neutral-900 tracking-wider">
                    JEWELLERY NEXT RETAIL ENTERPRISE
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    INTER-BRANCH CONSIGNMENT DELIVERY CHALLAN (RULE 55 GST)
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[11px]">
                  <div>
                    <span className="text-neutral-500 block">Manifest Number:</span>
                    <span className="font-medium text-neutral-900">{selectedTransfer.transfer_manifest_no}</span>
                    <span className="text-neutral-500 block mt-2">GST E-Way Bill Number:</span>
                    <span className="font-medium text-neutral-900">{selectedTransfer.eway_bill_no}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Security Seal Number:</span>
                    <span className="font-medium text-emerald-700">{selectedTransfer.security_seal_no}</span>
                    <span className="text-neutral-500 block mt-2">Transit Pass / E-Pass:</span>
                    <span className="font-medium text-neutral-900">{selectedTransfer.transit_pass_no || 'NA'}</span>
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-3 grid grid-cols-2 gap-4 text-[11px]">
                  <div>
                    <span className="text-neutral-500 block">Consignor (Dispatching Store):</span>
                    <span className="font-medium text-neutral-900">{selectedTransfer.source_branch}</span>
                    <span className="text-neutral-500 block mt-1">Dispatched By: {selectedTransfer.dispatch_custodian}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Consignee (Receiving Store):</span>
                    <span className="font-medium text-neutral-900">{selectedTransfer.destination_branch}</span>
                    <span className="text-neutral-500 block mt-1">
                      Received By: {selectedTransfer.received_custodian || 'Pending Delivery'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-3 text-[11px]">
                  <span className="text-neutral-500 block mb-1">Items Included:</span>
                  <p className="font-sans text-neutral-800 bg-neutral-50 p-2 rounded border border-neutral-200">
                    {selectedTransfer.items_summary} ({selectedTransfer.items_count} Ornaments)
                  </p>
                </div>

                <div className="border-t border-neutral-200 pt-3 grid grid-cols-3 gap-3 text-center text-[11px]">
                  <div className="p-2 bg-neutral-50 rounded">
                    <span className="text-neutral-500 block">Gross Weight</span>
                    <span className="font-medium text-neutral-900">{Number(selectedTransfer.total_gross_grams || 0).toFixed(3)}g</span>
                  </div>
                  <div className="p-2 bg-neutral-50 rounded">
                    <span className="text-neutral-500 block">Fine Weight (91.6%)</span>
                    <span className="font-medium text-emerald-700">{Number(selectedTransfer.total_fine_grams || 0).toFixed(3)}g</span>
                  </div>
                  <div className="p-2 bg-neutral-50 rounded">
                    <span className="text-neutral-500 block">Declared GST Value</span>
                    <span className="font-medium text-neutral-900">₹{Number(selectedTransfer.declared_value_inr || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Interlinks */}
              <div className="flex items-center gap-2 pt-2 border-t border-neutral-200 font-sans text-xs">
                <Link
                  href="/sales/delivery-challans"
                  className="px-3 py-1.5 rounded text-neutral-700 bg-neutral-100 hover:bg-neutral-200 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View All Delivery Challans
                </Link>
                <Link
                  href="/inventory/stock-transfers"
                  className="px-3 py-1.5 rounded text-neutral-700 bg-neutral-100 hover:bg-neutral-200 flex items-center gap-1.5 transition-colors"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  View Internal Vault Transfers
                </Link>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Consignment Note
              </button>
              <button
                onClick={() => setIsChallanModalOpen(false)}
                className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {transferToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-red-200 w-full max-w-md overflow-hidden p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-neutral-900">
                  Delete Transfer Manifest?
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Are you sure you want to delete manifest <span className="font-medium text-neutral-800">{transferToDelete.transfer_manifest_no}</span>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => setTransferToDelete(null)}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTransfer}
                disabled={saving}
                className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
