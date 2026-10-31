'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Building2,
  Store,
  ShieldCheck,
  ShieldAlert,
  Users,
  MapPin,
  Phone,
  Mail,
  Plus,
  X,
  Copy,
  Check,
  Eye,
  SlidersHorizontal,
  Lock,
  Layers,
  Sparkles,
  Server,
  AlertTriangle,
} from 'lucide-react';

interface StoreBranch {
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
  status: 'ACTIVE' | 'EXPANDING' | 'RENOVATING';
  emergency_contact: string;
  alarm_status: 'ARMED' | 'STANDBY';
  terminals_online: number;
}

const INITIAL_BRANCHES: StoreBranch[] = [
  {
    id: '55667788-c3d4-e5f6-a1b2-889900112233',
    branch_code: 'BR-01',
    branch_name: 'Banjara Hills Flagship',
    branch_type: 'FLAGSHIP_SHOWROOM',
    city: 'Hyderabad',
    state: 'Telangana',
    address: 'Road No. 10, Banjara Hills, Near Star Hypermarket',
    pincode: '500034',
    store_manager: 'A. SivaKrishna',
    manager_phone: '+91 98480 11223',
    manager_email: 'siva.banjara@jewellerynext.com',
    gstin: '36AAACD9812K1Z8',
    bis_license: 'HM/L-9128301',
    active_counters: 8,
    vault_capacity_kg: 45.000,
    staff_count: 18,
    status: 'ACTIVE',
    emergency_contact: '+91 91100 99881 (DSP Police Control)',
    alarm_status: 'ARMED',
    terminals_online: 8,
  },
  {
    id: '55667788-c3d4-e5f6-a1b2-889900112234',
    branch_code: 'BR-02',
    branch_name: 'Jubilee Hills Boutique',
    branch_type: 'HIGH_STREET_BOUTIQUE',
    city: 'Hyderabad',
    state: 'Telangana',
    address: 'Plot 412, Road No. 36, Jubilee Hills Metro Pillar 1650',
    pincode: '500033',
    store_manager: 'N. Varma',
    manager_phone: '+91 94401 22334',
    manager_email: 'varma.jubilee@jewellerynext.com',
    gstin: '36AAACD9812K1Z8',
    bis_license: 'HM/L-9128302',
    active_counters: 4,
    vault_capacity_kg: 25.000,
    staff_count: 10,
    status: 'ACTIVE',
    emergency_contact: '+91 91100 99882 (Inspector Jubilee Hills)',
    alarm_status: 'ARMED',
    terminals_online: 4,
  },
  {
    id: '55667788-c3d4-e5f6-a1b2-889900112235',
    branch_code: 'BR-03',
    branch_name: 'Vijayawada MG Road Outlet',
    branch_type: 'HIGH_STREET_BOUTIQUE',
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    address: 'D.No 40-1-62, MG Road, Opposite Sub-Collector Office',
    pincode: '520010',
    store_manager: 'K. Ramesh',
    manager_phone: '+91 99881 33445',
    manager_email: 'ramesh.vja@jewellerynext.com',
    gstin: '37AAACD9812K1Z9',
    bis_license: 'HM/L-9128303',
    active_counters: 5,
    vault_capacity_kg: 20.000,
    staff_count: 8,
    status: 'ACTIVE',
    emergency_contact: '+91 91100 99883 (One Town Police)',
    alarm_status: 'ARMED',
    terminals_online: 5,
  },
  {
    id: '55667788-c3d4-e5f6-a1b2-889900112236',
    branch_code: 'BR-04',
    branch_name: 'Vizag Beach Road Store',
    branch_type: 'HIGH_STREET_BOUTIQUE',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    address: 'Beach Road, Near RK Beach Pier, Pandurangapuram',
    pincode: '530003',
    store_manager: 'S. Anitha',
    manager_phone: '+91 98765 44332',
    manager_email: 'anitha.vizag@jewellerynext.com',
    gstin: '37AAACD9812K1Z9',
    bis_license: 'HM/L-9128304',
    active_counters: 4,
    vault_capacity_kg: 18.000,
    staff_count: 7,
    status: 'ACTIVE',
    emergency_contact: '+91 91100 99884 (Coast Guard Liaison)',
    alarm_status: 'ARMED',
    terminals_online: 4,
  },
  {
    id: '55667788-c3d4-e5f6-a1b2-889900112237',
    branch_code: 'BR-05',
    branch_name: 'Hyderabad RGIA Terminal 1',
    branch_type: 'AIRPORT_KIOSK',
    city: 'Hyderabad',
    state: 'Telangana',
    address: 'Departure Security Hold Area, Gate 22, RGIA Shamshabad',
    pincode: '500409',
    store_manager: 'P. Sandeep',
    manager_phone: '+91 97001 55667',
    manager_email: 'sandeep.rgia@jewellerynext.com',
    gstin: '36AAACD9812K1Z8',
    bis_license: 'HM/L-9128305',
    active_counters: 3,
    vault_capacity_kg: 12.000,
    staff_count: 5,
    status: 'ACTIVE',
    emergency_contact: '+91 91100 99885 (CISF Airport Command)',
    alarm_status: 'ARMED',
    terminals_online: 3,
  },
];

export function BranchesManagementView() {
  const [branches, setBranches] = useState<StoreBranch[]>(INITIAL_BRANCHES);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filters
  const [filterCity, setFilterCity] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [isNewBranchOpen, setIsNewBranchOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<StoreBranch | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // New Branch Form
  const [newCode, setNewCode] = useState('BR-06');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<StoreBranch['branch_type']>('HIGH_STREET_BOUTIQUE');
  const [newCity, setNewCity] = useState('Hyderabad');
  const [newState, setNewState] = useState('Telangana');
  const [newAddress, setNewAddress] = useState('');
  const [newPincode, setNewPincode] = useState('500081');
  const [newManager, setNewManager] = useState('');
  const [newPhone, setNewPhone] = useState('+91 ');
  const [newEmail, setNewEmail] = useState('');
  const [newGstin, setNewGstin] = useState('36AAACD9812K1Z8');
  const [newBisLicense, setNewBisLicense] = useState('HM/L-9128306');
  const [newCounters, setNewCounters] = useState(4);
  const [newVaultCapacity, setNewVaultCapacity] = useState(20);
  const [newStaffCount, setNewStaffCount] = useState(8);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegisterBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newManager.trim()) return;

    const brandNew: StoreBranch = {
      id: crypto.randomUUID(),
      branch_code: newCode,
      branch_name: newName,
      branch_type: newType,
      city: newCity,
      state: newState,
      address: newAddress || `${newName}, Main Commercial Road`,
      pincode: newPincode,
      store_manager: newManager,
      manager_phone: newPhone,
      manager_email: newEmail || `${newManager.toLowerCase().replace(/\s+/g, '.')}@jewellerynext.com`,
      gstin: newGstin,
      bis_license: newBisLicense,
      active_counters: Number(newCounters) || 4,
      vault_capacity_kg: Number(newVaultCapacity) || 15.000,
      staff_count: Number(newStaffCount) || 6,
      status: 'EXPANDING',
      emergency_contact: '+91 91100 99890 (Central Police Command)',
      alarm_status: 'STANDBY',
      terminals_online: Number(newCounters) || 4,
    };

    setBranches((prev) => [brandNew, ...prev]);
    setIsNewBranchOpen(false);

    // Reset form
    setNewName('');
    setNewManager('');
    setNewAddress('');
  };

  const filteredBranches = branches.filter((b) => {
    if (filterCity !== 'ALL' && b.city !== filterCity) return false;
    if (filterType !== 'ALL' && b.branch_type !== filterType) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchCode = b.branch_code.toLowerCase().includes(q);
      const matchName = b.branch_name.toLowerCase().includes(q);
      const matchCity = b.city.toLowerCase().includes(q);
      const matchManager = b.store_manager.toLowerCase().includes(q);
      if (!matchCode && !matchName && !matchCity && !matchManager) return false;
    }
    return true;
  });

  const totalVaultCap = branches.reduce((acc, curr) => acc + curr.vault_capacity_kg, 0);
  const totalCounters = branches.reduce((acc, curr) => acc + curr.active_counters, 0);
  const totalStaff = branches.reduce((acc, curr) => acc + curr.staff_count, 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="branches_management" />
      <ActionToolbar
        filterPlaceholder="Filter by branch code, showroom name, city, manager..."
        insertLabel="Register New Branch"
        onInsertClick={() => setIsNewBranchOpen(true)}
      />

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
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Across 3 Metro Clusters
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Billing Counters</span>
                <Store className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">{totalCounters} Counters</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                100% cloud POS active
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Network Vault Capacity</span>
                <Lock className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-neutral-900">{totalVaultCap.toFixed(3)} kg</div>
              <div className="text-[11px] text-amber-600 mt-1 font-mono">
                Strongroom Class AA rated
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Active Store Staff</span>
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
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Cities</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Vijayawada">Vijayawada</option>
                  <option value="Visakhapatnam">Visakhapatnam</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Outlet Type:</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Formats</option>
                  <option value="FLAGSHIP_SHOWROOM">Flagship Showroom</option>
                  <option value="HIGH_STREET_BOUTIQUE">High-Street Boutique</option>
                  <option value="AIRPORT_KIOSK">Airport Kiosk</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search branch code, name, city..."
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
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  public.store_branches
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Showing {filteredBranches.length} of {branches.length} branches
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
                            {branch.branch_type.replace('_', ' ')}
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
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono">
                          {branch.vault_capacity_kg.toFixed(3)} kg
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-right font-mono">
                          {branch.staff_count}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono ${
                              branch.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                branch.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                            />
                            {branch.status}
                          </span>
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
                            <button
                              onClick={() => {
                                setSelectedBranch(branch);
                                setIsDetailModalOpen(true);
                              }}
                              className="p-1 rounded text-neutral-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                              title="Branch Terminal Telemetry"
                            >
                              <Server className="w-3.5 h-3.5" />
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.store_branches (
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
                  <span className="text-neutral-400">DEFAULT &apos;HIGH_STREET_BOUTIQUE&apos;</span>,
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
                  <br />
                  <br />
                  <span className="text-neutral-400">-- Indexes for fast lookup</span>
                  <br />
                  <span className="text-emerald-400">CREATE INDEX</span> idx_branches_city{' '}
                  <span className="text-emerald-400">ON</span> public.store_branches (city);
                  <br />
                  <span className="text-emerald-400">CREATE INDEX</span> idx_branches_status{' '}
                  <span className="text-emerald-400">ON</span> public.store_branches (status);
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
                      Branch Type
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as StoreBranch['branch_type'])}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
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
                    Branch Showroom Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Gachibowli Tech Mall Showroom"
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
                    placeholder="Floor, Mall / Street name, Landmark..."
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
                      max={30}
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
                      max={200}
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
                      max={100}
                      value={newStaffCount}
                      onChange={(e) => setNewStaffCount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Save & Register Branch
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
                    {selectedBranch.city}, {selectedBranch.state} • {selectedBranch.branch_type.replace('_', ' ')}
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
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-100 text-emerald-800">
                    ALARM {selectedBranch.alarm_status}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-neutral-700">
                  <div>
                    <span className="text-[11px] text-neutral-500 block">Strongroom Safe</span>
                    <span className="font-mono font-medium text-neutral-900">
                      {selectedBranch.vault_capacity_kg.toFixed(3)} kg Capacity
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-500 block">Class Spec</span>
                    <span className="font-medium text-neutral-900">Class AA Vault Door</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-500 block">CCTV Surveillance</span>
                    <span className="text-emerald-700 font-medium">360° AI Stream OK</span>
                  </div>
                  <div className="col-span-2 sm:col-span-3">
                    <span className="text-[11px] text-neutral-500 block">Emergency Lockdown Hotline</span>
                    <span className="font-mono text-neutral-800">{selectedBranch.emergency_contact}</span>
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
                    {selectedBranch.terminals_online}/{selectedBranch.active_counters} Online
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {Array.from({ length: selectedBranch.active_counters }).map((_, i) => (
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
                      <span className="text-[10px] text-neutral-400">Weighing Scale #0{i + 1}</span>
                      <span className="text-[10px] text-neutral-500 font-mono">192.168.{i + 10}.12</span>
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
            </div>

            <div className="px-5 py-3 border-t border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between">
              <span className="text-[11px] text-neutral-500 font-mono">
                UUID: {selectedBranch.id}
              </span>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
