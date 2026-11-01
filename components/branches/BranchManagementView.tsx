'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Building2,
  Store,
  ShieldCheck,
  Users,
  MapPin,
  Plus,
  X,
  Copy,
  Check,
  Eye,
  Lock,
  Server,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ArrowRightLeft,
  Boxes,
  Radio,
  FileSpreadsheet,
  TrendingUp,
  RefreshCw,
  ExternalLink,
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

export interface StoreBranch {
  id: string;
  branch_code: string;
  branch_name: string;
  branch_type: 'FLAGSHIP_SHOWROOM' | 'HIGH_STREET_BOUTIQUE' | 'AIRPORT_KIOSK' | 'REGIONAL_OUTLET';
  city: string;
  state: string;
  address: string;
  pincode: string;
  store_manager: string;
  manager_phone: string;
  manager_email: string;
  gstin: string;
  bis_license: string;
  active_counters: number;
  vault_capacity_kg: number;
  staff_count: number;
  status: 'ACTIVE' | 'EXPANDING' | 'RENOVATING' | 'INACTIVE';
  emergency_contact: string;
  alarm_status: 'ARMED' | 'STANDBY';
  terminals_online: number;
  created_at?: string;
}

export function BranchesManagementView() {
  const [branches, setBranches] = useState<StoreBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Filters
  const [filterCity, setFilterCity] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [isNewBranchOpen, setIsNewBranchOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<StoreBranch | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<StoreBranch | null>(null);

  // New Branch Form State
  const [newCode, setNewCode] = useState('BR-01');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<StoreBranch['branch_type']>('FLAGSHIP_SHOWROOM');
  const [newCity, setNewCity] = useState('Hyderabad');
  const [newState, setNewState] = useState('Telangana');
  const [newAddress, setNewAddress] = useState('');
  const [newPincode, setNewPincode] = useState('500034');
  const [newManager, setNewManager] = useState('');
  const [newPhone, setNewPhone] = useState('+91 98480 11223');
  const [newEmail, setNewEmail] = useState('');
  const [newGstin, setNewGstin] = useState('36AAACD9812K1Z8');
  const [newBisLicense, setNewBisLicense] = useState('HM/L-9128301');
  const [newCounters, setNewCounters] = useState(6);
  const [newVaultCapacity, setNewVaultCapacity] = useState(30);
  const [newStaffCount, setNewStaffCount] = useState(12);
  const [newEmergencyContact, setNewEmergencyContact] = useState('+91 91100 99881 (Central Police Command)');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'branches_management'));
      const list: StoreBranch[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<StoreBranch, 'id'>) });
      });
      setBranches(list);
    } catch (err: any) {
      console.error('Error fetching branches:', err);
      showToast('error', err.message || 'Failed to fetch store branches from Firebase');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenNewBranch = () => {
    const nextCode = `BR-0${branches.length + 1}`;
    setNewCode(nextCode);
    setNewName('');
    setNewType('FLAGSHIP_SHOWROOM');
    setNewCity('Hyderabad');
    setNewState('Telangana');
    setNewAddress('');
    setNewPincode('500034');
    setNewManager('');
    setNewPhone('+91 98480 11223');
    setNewEmail('');
    setNewGstin('36AAACD9812K1Z8');
    setNewBisLicense(`HM/L-912830${branches.length + 1}`);
    setNewCounters(6);
    setNewVaultCapacity(30);
    setNewStaffCount(12);
    setNewEmergencyContact('+91 91100 99881 (Central Police Command)');
    setIsNewBranchOpen(true);
  };

  const handleRegisterBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newManager.trim()) {
      showToast('error', 'Please fill in showroom name and manager details');
      return;
    }

    try {
      setSaving(true);
      const branchPayload: Omit<StoreBranch, 'id'> = {
        branch_code: newCode.trim().toUpperCase(),
        branch_name: newName.trim(),
        branch_type: newType,
        city: newCity.trim(),
        state: newState.trim(),
        address: newAddress.trim() || `${newName}, Commercial Jewelry Hub`,
        pincode: newPincode.trim(),
        store_manager: newManager.trim(),
        manager_phone: newPhone.trim(),
        manager_email: newEmail.trim() || `${newManager.toLowerCase().replace(/\s+/g, '.')}@jewellerynext.com`,
        gstin: newGstin.trim().toUpperCase(),
        bis_license: newBisLicense.trim().toUpperCase(),
        active_counters: Number(newCounters) || 4,
        vault_capacity_kg: Number(newVaultCapacity) || 20.0,
        staff_count: Number(newStaffCount) || 8,
        status: 'ACTIVE',
        emergency_contact: newEmergencyContact.trim(),
        alarm_status: 'ARMED',
        terminals_online: Number(newCounters) || 4,
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'branches_management'), branchPayload);
      setBranches((prev) => [{ id: docRef.id, ...branchPayload }, ...prev]);
      setIsNewBranchOpen(false);
      showToast('success', `Branch "${branchPayload.branch_name}" registered successfully!`);
    } catch (err: any) {
      console.error('Error saving branch:', err);
      showToast('error', err.message || 'Failed to save branch to Firebase');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (branchId: string, currentStatus: StoreBranch['status']) => {
    const statuses: StoreBranch['status'][] = ['ACTIVE', 'EXPANDING', 'RENOVATING', 'INACTIVE'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    try {
      await updateDoc(doc(db, 'branches_management', branchId), { status: nextStatus });
      setBranches((prev) =>
        prev.map((b) => (b.id === branchId ? { ...b, status: nextStatus } : b))
      );
      if (selectedBranch && selectedBranch.id === branchId) {
        setSelectedBranch({ ...selectedBranch, status: nextStatus });
      }
      showToast('success', `Branch status updated to ${nextStatus}`);
    } catch (err: any) {
      console.error('Error updating status:', err);
      showToast('error', err.message || 'Failed to update branch status');
    }
  };

  const handleToggleAlarm = async (branchId: string, currentAlarm: StoreBranch['alarm_status']) => {
    const nextAlarm = currentAlarm === 'ARMED' ? 'STANDBY' : 'ARMED';
    try {
      await updateDoc(doc(db, 'branches_management', branchId), { alarm_status: nextAlarm });
      setBranches((prev) =>
        prev.map((b) => (b.id === branchId ? { ...b, alarm_status: nextAlarm } : b))
      );
      if (selectedBranch && selectedBranch.id === branchId) {
        setSelectedBranch({ ...selectedBranch, alarm_status: nextAlarm });
      }
      showToast('success', `Strongroom vault alarm set to ${nextAlarm}`);
    } catch (err: any) {
      console.error('Error toggling alarm:', err);
      showToast('error', err.message || 'Failed to update alarm status');
    }
  };

  const handleDeleteBranch = async () => {
    if (!branchToDelete) return;
    try {
      setSaving(true);
      await deleteDoc(doc(db, 'branches_management', branchToDelete.id));
      setBranches((prev) => prev.filter((b) => b.id !== branchToDelete.id));
      if (selectedBranch?.id === branchToDelete.id) {
        setSelectedBranch(null);
        setIsDetailModalOpen(false);
      }
      showToast('success', `Branch "${branchToDelete.branch_name}" deleted.`);
      setBranchToDelete(null);
    } catch (err: any) {
      console.error('Error deleting branch:', err);
      showToast('error', err.message || 'Failed to delete branch');
    } finally {
      setSaving(false);
    }
  };

  const filteredBranches = branches.filter((b) => {
    if (filterCity !== 'ALL' && b.city !== filterCity) return false;
    if (filterType !== 'ALL' && b.branch_type !== filterType) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchCode = (b.branch_code || '').toLowerCase().includes(q);
      const matchName = (b.branch_name || '').toLowerCase().includes(q);
      const matchCity = (b.city || '').toLowerCase().includes(q);
      const matchManager = (b.store_manager || '').toLowerCase().includes(q);
      if (!matchCode && !matchName && !matchCity && !matchManager) return false;
    }
    return true;
  });

  const totalVaultCap = branches.reduce((acc, curr) => acc + (Number(curr.vault_capacity_kg) || 0), 0);
  const totalCounters = branches.reduce((acc, curr) => acc + (Number(curr.active_counters) || 0), 0);
  const totalStaff = branches.reduce((acc, curr) => acc + (Number(curr.staff_count) || 0), 0);
  const uniqueCities = Array.from(new Set(branches.map((b) => b.city).filter(Boolean)));

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="branches_management" />
      <ActionToolbar
        filterPlaceholder="Filter by branch code, showroom name, city, manager..."
        insertLabel="Register New Branch"
        onInsertClick={handleOpenNewBranch}
        onRefresh={fetchBranches}
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
            className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] flex items-center gap-1"
          >
            <Building2 className="w-3 h-3 text-emerald-600" />
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
            className="px-2.5 py-1 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-white text-[11px] flex items-center gap-1 transition-colors"
          >
            <ArrowRightLeft className="w-3 h-3 text-neutral-500" />
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
            href="/rates/gold-rates"
            className="text-neutral-500 hover:text-emerald-700 flex items-center gap-1"
          >
            <TrendingUp className="w-3 h-3 text-amber-500" />
            Base Gold Rates
          </Link>
          <span className="text-neutral-300">|</span>
          <Link
            href="/inventory/ornaments"
            className="text-neutral-500 hover:text-emerald-700 flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3 text-neutral-400" />
            All SKU Inventory
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI metrics */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Store Outlets</span>
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">{branches.length} Branches</div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Across {uniqueCities.length || 0} City Hubs
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Billing Counters</span>
                <Store className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">{totalCounters} POS Terminals</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Cloud-synced registers
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Network Vault Capacity</span>
                <Lock className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-neutral-900">{totalVaultCap.toFixed(2)} kg</div>
              <div className="text-[11px] text-amber-600 mt-1 font-mono">
                Safe storage limit
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Retail Store Staff</span>
                <Users className="w-3.5 h-3.5 text-neutral-700" />
              </div>
              <div className="text-xl font-medium text-neutral-900">{totalStaff} Employees</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                Biometric verified
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-neutral-400 font-mono text-[11px]">Filters:</span>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">City:</span>
                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer font-medium"
                >
                  <option value="ALL">All Cities</option>
                  {uniqueCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Outlet Type:</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer font-medium"
                >
                  <option value="ALL">All Formats</option>
                  <option value="FLAGSHIP_SHOWROOM">Flagship Showroom</option>
                  <option value="HIGH_STREET_BOUTIQUE">High-Street Boutique</option>
                  <option value="AIRPORT_KIOSK">Airport Kiosk</option>
                  <option value="REGIONAL_OUTLET">Regional Outlet</option>
                </select>
              </div>

              <button
                onClick={fetchBranches}
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
                placeholder="Search branch, city, manager..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 px-2.5 py-1 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none placeholder:text-neutral-400 font-mono"
              />
              <button
                onClick={handleOpenNewBranch}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Branch</span>
              </button>
            </div>
          </div>
        </div>

        {/* Supabase-style Table */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  public.branches_management
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  {loading
                    ? 'Loading branches...'
                    : `Showing ${filteredBranches.length} of ${branches.length} branches`}
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
                    <span className="text-xs font-medium">Loading branches from Firebase Firestore...</span>
                  </div>
                ) : filteredBranches.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-medium text-neutral-800">
                      {branches.length === 0 ? 'No Store Branches Configured' : 'No Branches Match Filter'}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                      {branches.length === 0
                        ? 'Your multi-branch network is clean. Register your first flagship store, airport counter, or regional boutique to start multi-store operations.'
                        : 'No store branches match your selected city, format, or search keywords.'}
                    </p>
                    {branches.length === 0 && (
                      <button
                        onClick={handleOpenNewBranch}
                        className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Register First Branch
                      </button>
                    )}
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#fcfcfc] border-b border-[#e5e7eb] text-neutral-600 font-mono text-[11px]">
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">branch_code</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">branch_name & type</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">city & state</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">store_manager</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">active_counters</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">vault_capacity_kg</span>
                        </th>
                        <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">staff_count</span>
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
                      {filteredBranches.map((branch) => (
                        <tr key={branch.id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span
                                onClick={() => {
                                  setSelectedBranch(branch);
                                  setIsDetailModalOpen(true);
                                }}
                                className="font-medium text-emerald-700 hover:underline cursor-pointer"
                              >
                                {branch.branch_code}
                              </span>
                              <button
                                onClick={() => copyToClipboard(branch.branch_code, branch.id)}
                                className="text-neutral-400 hover:text-neutral-600"
                                title="Copy branch code"
                              >
                                {copiedId === branch.id ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                            <div className="font-medium text-neutral-800">{branch.branch_name}</div>
                            <span className="text-[10px] text-neutral-500 font-mono">
                              {(branch.branch_type || '').replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                            <div className="text-neutral-800 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-neutral-400" />
                              {branch.city}, {branch.state}
                            </div>
                            <span className="text-[10px] text-neutral-400 font-mono">PIN: {branch.pincode}</span>
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                            <div className="text-neutral-800 font-medium">{branch.store_manager}</div>
                            <span className="text-[10px] text-neutral-500 font-mono">{branch.manager_phone}</span>
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              {branch.active_counters} POS
                            </span>
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono font-medium text-neutral-800">
                            {Number(branch.vault_capacity_kg || 0).toFixed(2)} kg
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono">
                            {branch.staff_count}
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                            <button
                              onClick={() => handleUpdateStatus(branch.id, branch.status)}
                              title="Click to cycle status: ACTIVE -> EXPANDING -> RENOVATING -> INACTIVE"
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono transition-colors cursor-pointer ${
                                branch.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                  : branch.status === 'EXPANDING'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                                  : branch.status === 'RENOVATING'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                                  : 'bg-neutral-100 text-neutral-700 border border-neutral-300 hover:bg-neutral-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  branch.status === 'ACTIVE'
                                    ? 'bg-emerald-500'
                                    : branch.status === 'EXPANDING'
                                    ? 'bg-blue-500'
                                    : branch.status === 'RENOVATING'
                                    ? 'bg-amber-500'
                                    : 'bg-neutral-400'
                                }`}
                              />
                              {branch.status}
                            </button>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedBranch(branch);
                                  setIsDetailModalOpen(true);
                                }}
                                className="p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                                title="View Security & Hardware Profile"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <Link
                                href={`/branches/stock`}
                                className="p-1 rounded text-neutral-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                                title="View Stock for this branch"
                              >
                                <Boxes className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                onClick={() => setBranchToDelete(branch)}
                                className="p-1 rounded text-neutral-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete branch"
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.branches_management (
                  <br />
                  &nbsp;&nbsp;id <span className="text-purple-400">UUID</span>{' '}
                  <span className="text-neutral-400">PRIMARY KEY DEFAULT gen_random_uuid()</span>,
                  <br />
                  &nbsp;&nbsp;branch_code <span className="text-purple-400">VARCHAR(20)</span>{' '}
                  <span className="text-neutral-400">UNIQUE NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;branch_name <span className="text-purple-400">VARCHAR(100)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;branch_type <span className="text-purple-400">VARCHAR(30)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;FLAGSHIP_SHOWROOM&apos;</span>,
                  <br />
                  &nbsp;&nbsp;city <span className="text-purple-400">VARCHAR(60)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;state <span className="text-purple-400">VARCHAR(60)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;address <span className="text-purple-400">TEXT</span>,
                  <br />
                  &nbsp;&nbsp;pincode <span className="text-purple-400">VARCHAR(10)</span>,
                  <br />
                  &nbsp;&nbsp;store_manager <span className="text-purple-400">VARCHAR(80)</span>,
                  <br />
                  &nbsp;&nbsp;manager_phone <span className="text-purple-400">VARCHAR(25)</span>,
                  <br />
                  &nbsp;&nbsp;gstin <span className="text-purple-400">VARCHAR(20)</span>{' '}
                  <span className="text-neutral-400">NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;bis_license <span className="text-purple-400">VARCHAR(50)</span>,
                  <br />
                  &nbsp;&nbsp;active_counters <span className="text-purple-400">INTEGER</span>{' '}
                  <span className="text-neutral-400">DEFAULT 4</span>,
                  <br />
                  &nbsp;&nbsp;vault_capacity_kg <span className="text-purple-400">NUMERIC(10,3)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 20.000</span>,
                  <br />
                  &nbsp;&nbsp;staff_count <span className="text-purple-400">INTEGER</span>{' '}
                  <span className="text-neutral-400">DEFAULT 6</span>,
                  <br />
                  &nbsp;&nbsp;status <span className="text-purple-400">VARCHAR(20)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;ACTIVE&apos;</span>,
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

      {/* Drawer: Register New Store Branch */}
      {isNewBranchOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs transition-all">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-medium text-neutral-900">
                    Register New Store Branch
                  </h3>
                </div>
                <button
                  onClick={() => setIsNewBranchOpen(false)}
                  className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRegisterBranch} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Branch Code
                    </label>
                    <input
                      type="text"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Branch Format
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as StoreBranch['branch_type'])}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-medium"
                    >
                      <option value="FLAGSHIP_SHOWROOM">Flagship Showroom</option>
                      <option value="HIGH_STREET_BOUTIQUE">High-Street Boutique</option>
                      <option value="AIRPORT_KIOSK">Airport Kiosk</option>
                      <option value="REGIONAL_OUTLET">Regional Outlet</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Showroom Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Banjara Hills Flagship Showroom"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      City
                    </label>
                    <input
                      type="text"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      State
                    </label>
                    <input
                      type="text"
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Full Commercial Address
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Floor, Complex, Street name, Landmark..."
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  />
                </div>

                <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                  <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-neutral-600" />
                    Store Management Contacts
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-neutral-700 mb-1 block">
                        Store Manager Name
                      </label>
                      <input
                        type="text"
                        placeholder="Manager Name"
                        value={newManager}
                        onChange={(e) => setNewManager(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-700 mb-1 block">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="manager@jewellerynext.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Branch GSTIN
                    </label>
                    <input
                      type="text"
                      value={newGstin}
                      onChange={(e) => setNewGstin(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      BIS Hallmark License #
                    </label>
                    <input
                      type="text"
                      value={newBisLicense}
                      onChange={(e) => setNewBisLicense(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      POS Counters
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={newCounters}
                      onChange={(e) => setNewCounters(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Vault Safe (kg)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={newVaultCapacity}
                      onChange={(e) => setNewVaultCapacity(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Staff Count
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={newStaffCount}
                      onChange={(e) => setNewStaffCount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Emergency Security Contact
                  </label>
                  <input
                    type="text"
                    value={newEmergencyContact}
                    onChange={(e) => setNewEmergencyContact(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono text-[11px]"
                  />
                </div>

                <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewBranchOpen(false)}
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
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Save to Firestore</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Branch Detail & Security Telemetry */}
      {isDetailModalOpen && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#e5e7eb] w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="px-5 py-4 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-medium text-neutral-900">
                    {selectedBranch.branch_name} ({selectedBranch.branch_code})
                  </h3>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {selectedBranch.city}, {selectedBranch.state} • {(selectedBranch.branch_type || '').replace('_', ' ')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* Security Telemetry Card */}
              <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200">
                <div className="text-xs font-medium text-emerald-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Physical Security & Safe Vault Status
                  </span>
                  <button
                    onClick={() => handleToggleAlarm(selectedBranch.id, selectedBranch.alarm_status)}
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 transition-colors cursor-pointer"
                    title="Click to toggle ARMED / STANDBY"
                  >
                    ALARM: {selectedBranch.alarm_status || 'ARMED'} (Toggle)
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-neutral-700">
                  <div>
                    <span className="text-[11px] text-neutral-500 block">Strongroom Safe</span>
                    <span className="font-mono font-medium text-neutral-900">
                      {Number(selectedBranch.vault_capacity_kg || 0).toFixed(2)} kg Safe Limit
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-500 block">Class Spec</span>
                    <span className="font-medium text-neutral-900">Class AA Vault Strongroom</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-500 block">CCTV Surveillance</span>
                    <span className="text-emerald-700 font-medium">360° AI Feed Online</span>
                  </div>
                  <div className="col-span-2 sm:col-span-3">
                    <span className="text-[11px] text-neutral-500 block">Emergency Security Hotline</span>
                    <span className="font-mono text-neutral-800">{selectedBranch.emergency_contact || 'Central Police Station'}</span>
                  </div>
                </div>
              </div>

              {/* Hardware & Terminal Grid */}
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-neutral-600" />
                    Live Counter Terminals & Hardware Telemetry
                  </span>
                  <span className="text-[11px] text-emerald-600 font-mono">
                    {selectedBranch.active_counters}/{selectedBranch.active_counters} Online
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {Array.from({ length: Math.min(selectedBranch.active_counters || 4, 12) }).map((_, i) => (
                    <div
                      key={i}
                      className="p-2 rounded bg-white border border-[#e2e8f0] flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-medium text-neutral-800">
                          POS-0{i + 1}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </div>
                      <span className="text-[10px] text-neutral-400">Scale #{i + 1} Calibrated</span>
                      <span className="text-[10px] text-neutral-500 font-mono">192.168.10.{10 + i}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statutory Credentials */}
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
                  Statutory & Compliance Registrations
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] text-neutral-500 block">GSTIN</span>
                    <span className="font-mono font-medium text-neutral-900">{selectedBranch.gstin}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-500 block">BIS Hallmarking License #</span>
                    <span className="font-mono font-medium text-neutral-900">{selectedBranch.bis_license}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[11px] text-neutral-500 block">Full Showroom Address</span>
                    <span className="text-neutral-800">{selectedBranch.address}, PIN: {selectedBranch.pincode}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-500 block">Store Manager</span>
                    <span className="font-medium text-neutral-900">{selectedBranch.store_manager}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-500 block">Official Email</span>
                    <span className="font-mono text-neutral-800">{selectedBranch.manager_email}</span>
                  </div>
                </div>
              </div>

              {/* Interlinks Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#e2e8f0]">
                <Link
                  href="/branches/stock"
                  className="px-3 py-1.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1.5"
                >
                  <Boxes className="w-3.5 h-3.5" />
                  Check Branch Stock
                </Link>
                <Link
                  href="/branches/transfers"
                  className="px-3 py-1.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Initiate Transfer to this Branch
                </Link>
                <Link
                  href="/branches/rates"
                  className="px-3 py-1.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 flex items-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5" />
                  Push Live Rates
                </Link>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between">
              <span className="text-[11px] text-neutral-500 font-mono">
                Firestore ID: {selectedBranch.id}
              </span>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {branchToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-red-200 w-full max-w-md overflow-hidden p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-neutral-900">
                  Delete Branch Record?
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Are you sure you want to delete <span className="font-medium text-neutral-800">{branchToDelete.branch_name}</span> ({branchToDelete.branch_code})? This will permanently remove it from Firestore.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => setBranchToDelete(null)}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteBranch}
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
