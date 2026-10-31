'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Coins,
  CreditCard,
  Plus,
  X,
  Check,
  ShieldCheck,
  Layers,
  ArrowUpDown,
  Search,
  Eye,
  FileText,
  BadgeCheck,
  Landmark,
  ExternalLink,
} from 'lucide-react';

interface SupplierItem {
  id: string;
  supplier_name: string;
  category: 'Bullion Refinery' | 'Wholesale Manufacturer' | 'Casting House' | 'Gemstone Vendor' | 'Karigar';
  contact_person: string;
  phone: string;
  email: string;
  city: string;
  gstin: string;
  pan: string;
  bis_refinery_license?: string;
  metal_balance_g: number; // Negative = We owe vendor metal, Positive = Vendor owes us
  cash_balance: number; // Negative = We owe vendor cash, Positive = Advance with vendor
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const INITIAL_SUPPLIERS: SupplierItem[] = [
  {
    id: '00112233-4455-6677-8899-334455667788',
    supplier_name: 'Mangalore Casting Works',
    category: 'Casting House',
    contact_person: 'Naveen Shenoy',
    phone: '+91 98450 12345',
    email: 'orders@mangalorecasting.com',
    city: 'Mangaluru',
    gstin: '29AAACM4512H1Z2',
    pan: 'AAACM4512H',
    bis_refinery_license: 'BIS/REF/2023/889',
    metal_balance_g: -45.200,
    cash_balance: -142000.00,
    bank_name: 'Canara Bank',
    account_number: '0129101009841',
    ifsc_code: 'CNRB0000129',
    status: 'ACTIVE',
  },
  {
    id: '00112233-4455-6677-8899-334455667789',
    supplier_name: 'Shree Bullion Refinery',
    category: 'Bullion Refinery',
    contact_person: 'Dharmesh Zaveri',
    phone: '+91 98200 45678',
    email: 'bullion@shreerefinery.in',
    city: 'Mumbai (Zaveri Bazaar)',
    gstin: '27AABCS9821L1ZM',
    pan: 'AABCS9821L',
    bis_refinery_license: 'BIS/REF/2021/104',
    metal_balance_g: -50.000,
    cash_balance: -2450000.00,
    bank_name: 'HDFC Bank',
    account_number: '50200018928172',
    ifsc_code: 'HDFC0000060',
    status: 'ACTIVE',
  },
  {
    id: '00112233-4455-6677-8899-334455667790',
    supplier_name: 'Apex Jewellery Works',
    category: 'Wholesale Manufacturer',
    contact_person: 'K. R. Murthy',
    phone: '+91 94440 98765',
    email: 'sales@apexjewels.co.in',
    city: 'Chennai (Sowcarpet)',
    gstin: '33AAACA7102J1ZS',
    pan: 'AAACA7102J',
    bis_refinery_license: 'BIS/HM/TN-4412',
    metal_balance_g: 0.000,
    cash_balance: -890000.00,
    bank_name: 'State Bank of India',
    account_number: '31298410294',
    ifsc_code: 'SBIN0000800',
    status: 'ACTIVE',
  },
  {
    id: '00112233-4455-6677-8899-334455667791',
    supplier_name: 'MMTC-PAMP India Ltd',
    category: 'Bullion Refinery',
    contact_person: 'Corporate Sales Desk',
    phone: '+91 124 496 0000',
    email: 'sales@mmtcpamp.com',
    city: 'New Delhi / Gurugram',
    gstin: '06AAACM1920K1ZG',
    pan: 'AAACM1920K',
    bis_refinery_license: 'BIS/REF/NABL-01',
    metal_balance_g: 0.000,
    cash_balance: 0.00,
    bank_name: 'Standard Chartered',
    account_number: '22405019821',
    ifsc_code: 'SCBL0036001',
    status: 'ACTIVE',
  },
  {
    id: '00112233-4455-6677-8899-334455667792',
    supplier_name: 'Surat Diamond & Bullion Co.',
    category: 'Gemstone Vendor',
    contact_person: 'Paresh Patel',
    phone: '+91 98251 77889',
    email: 'paresh@suratgems.in',
    city: 'Surat (Varachha)',
    gstin: '24AACPS6610E1ZY',
    pan: 'AACPS6610E',
    bis_refinery_license: 'GJEPC/REG/771',
    metal_balance_g: 12.500, // Vendor owes us 12.50g
    cash_balance: -420000.00,
    bank_name: 'ICICI Bank',
    account_number: '001205018921',
    ifsc_code: 'ICIC0000012',
    status: 'ACTIVE',
  },
  {
    id: '00112233-4455-6677-8899-334455667793',
    supplier_name: 'Harish Patwa Goldsmith',
    category: 'Karigar',
    contact_person: 'Harish Patwa',
    phone: '+91 97654 32109',
    email: 'patwa.workshop@gmail.com',
    city: 'Rajkot (Soni Bazaar)',
    gstin: 'UNREGISTERED',
    pan: 'BKMPP8912K',
    metal_balance_g: -59.750, // We owe karigar metal
    cash_balance: -78000.00,
    bank_name: 'Bank of Baroda',
    account_number: '1892010001928',
    ifsc_code: 'BARB0RAJKOT',
    status: 'ACTIVE',
  },
];

const CATEGORIES_LIST = [
  'Bullion Refinery',
  'Wholesale Manufacturer',
  'Casting House',
  'Gemstone Vendor',
  'Karigar',
] as const;

export function PurchasesSuppliersView() {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>(INITIAL_SUPPLIERS);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [isNewSupplierOpen, setIsNewSupplierOpen] = useState(false);
  const [selectedSupplierForLedger, setSelectedSupplierForLedger] = useState<SupplierItem | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<typeof CATEGORIES_LIST[number]>('Wholesale Manufacturer');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formGSTIN, setFormGSTIN] = useState('');
  const [formPAN, setFormPAN] = useState('');
  const [formBIS, setFormBIS] = useState('');
  const [formMetalBal, setFormMetalBal] = useState('0.000');
  const [formCashBal, setFormCashBal] = useState('0.00');
  const [formBank, setFormBank] = useState('');
  const [formAccountNo, setFormAccountNo] = useState('');
  const [formIFSC, setFormIFSC] = useState('');

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    const newSupplier: SupplierItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : `sup-${Date.now()}`,
      supplier_name: formName,
      category: formCategory,
      contact_person: formContactPerson,
      phone: formPhone,
      email: formEmail,
      city: formCity,
      gstin: formGSTIN || 'UNREGISTERED',
      pan: formPAN,
      bis_refinery_license: formBIS || undefined,
      metal_balance_g: parseFloat(formMetalBal) || 0,
      cash_balance: parseFloat(formCashBal) || 0,
      bank_name: formBank,
      account_number: formAccountNo,
      ifsc_code: formIFSC,
      status: 'ACTIVE',
    };

    setSuppliers([newSupplier, ...suppliers]);
    setIsNewSupplierOpen(false);
    // Reset form
    setFormName('');
    setFormContactPerson('');
    setFormPhone('');
    setFormEmail('');
    setFormCity('');
    setFormGSTIN('');
    setFormPAN('');
    setFormBIS('');
    setFormMetalBal('0.000');
    setFormCashBal('0.00');
  };

  const filteredSuppliers = suppliers.filter((item) => {
    if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = item.supplier_name.toLowerCase().includes(q);
      const matchCity = item.city.toLowerCase().includes(q);
      const matchGst = item.gstin.toLowerCase().includes(q);
      if (!matchName && !matchCity && !matchGst) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="suppliers_directory" />
      <ActionToolbar
        filterPlaceholder="Filter by vendor name, GSTIN, city..."
        insertLabel="Add New Supplier"
        onInsertClick={() => setIsNewSupplierOpen(true)}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Active Suppliers</span>
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">28 Vendors</div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Verified Bullion & Casting Partners
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Fine Gold Payable</span>
                <Coins className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-amber-700">-142.450 g</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Net 999 Fine Pure Gold We Owe
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Cash Outstanding</span>
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">₹ 68,40,000</div>
              <div className="text-[11px] text-blue-600 mt-1 font-mono">
                Across 14 Trade Invoices
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">BIS Certified Refineries</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">6 Refineries</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                Hallmark Accredited 999.9 Bars
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-neutral-400 font-mono text-[11px]">Filters:</span>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Vendor Categories</option>
                  {CATEGORIES_LIST.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search Supplier, City or GSTIN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 px-2.5 py-1 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none placeholder:text-neutral-400"
              />
              <button
                onClick={() => setIsNewSupplierOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Supplier</span>
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
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  public.suppliers_directory
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Showing {filteredSuppliers.length} of {suppliers.length} vendors
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
                          <span className="text-neutral-800">supplier_name</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">category</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">contact & city</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">gstin / pan</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-neutral-800">metal_balance</span>
                          <span className="text-neutral-400 font-normal text-[10px]">fine g</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-neutral-800">cash_balance</span>
                          <span className="text-neutral-400 font-normal text-[10px]">inr</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">status</span>
                      </th>
                      <th className="px-3.5 py-2 font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">quick ledger</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {filteredSuppliers.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="px-3 py-2 text-center border-r border-[#e5e7eb]">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <div className="font-medium text-neutral-900 flex items-center gap-1.5">
                            {row.supplier_name}
                            {row.bis_refinery_license && (
                              <span title={`BIS License: ${row.bis_refinery_license}`}>
                                <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-neutral-400 font-mono">ID: {row.id.slice(0, 8)}...</span>
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            {row.category}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <div className="text-neutral-800">{row.contact_person}</div>
                          <div className="text-[11px] text-neutral-400 flex items-center gap-2">
                            <span>{row.phone}</span>
                            <span>•</span>
                            <span>{row.city}</span>
                          </div>
                        </td>
                        <td className="px-3.5 py-2 font-mono text-[11px] border-r border-[#e5e7eb] whitespace-nowrap">
                          <div className="text-neutral-800">{row.gstin}</div>
                          <div className="text-neutral-400">{row.pan}</div>
                        </td>
                        <td className="px-3.5 py-2 font-mono border-r border-[#e5e7eb] text-right whitespace-nowrap">
                          {row.metal_balance_g < 0 ? (
                            <span className="text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {row.metal_balance_g.toFixed(3)} g (We Owe)
                            </span>
                          ) : row.metal_balance_g > 0 ? (
                            <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              +{row.metal_balance_g.toFixed(3)} g (Credit)
                            </span>
                          ) : (
                            <span className="text-neutral-400">0.000 g</span>
                          )}
                        </td>
                        <td className="px-3.5 py-2 font-mono border-r border-[#e5e7eb] text-right whitespace-nowrap font-medium">
                          {row.cash_balance < 0 ? (
                            <span className="text-red-700">
                              - ₹ {Math.abs(row.cash_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          ) : row.cash_balance > 0 ? (
                            <span className="text-emerald-700">
                              + ₹ {row.cash_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span className="text-neutral-400">₹ 0.00</span>
                          )}
                        </td>
                        <td className="px-3.5 py-2 text-center border-r border-[#e5e7eb] whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                            {row.status}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 text-center whitespace-nowrap">
                          <button
                            onClick={() => setSelectedSupplierForLedger(row)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer mx-auto"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Ledger</span>
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.suppliers_directory (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">supplier_name</span>{' '}
                  <span className="text-amber-300">varchar(255)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">category</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">contact_person</span>{' '}
                  <span className="text-amber-300">varchar(128),</span>
                  <br />
                  <span className="pl-6 text-blue-300">phone</span>{' '}
                  <span className="text-amber-300">varchar(32),</span>
                  <br />
                  <span className="pl-6 text-blue-300">email</span>{' '}
                  <span className="text-amber-300">varchar(128),</span>
                  <br />
                  <span className="pl-6 text-blue-300">gstin</span>{' '}
                  <span className="text-amber-300">varchar(15),</span>
                  <br />
                  <span className="pl-6 text-blue-300">pan</span>{' '}
                  <span className="text-amber-300">varchar(10),</span>
                  <br />
                  <span className="pl-6 text-blue-300">metal_balance_g</span>{' '}
                  <span className="text-amber-300">numeric(12,3)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0.000,</span>
                  <br />
                  <span className="pl-6 text-blue-300">cash_balance</span>{' '}
                  <span className="text-amber-300">numeric(14,2)</span>{' '}
                  <span className="text-neutral-400">DEFAULT 0.00,</span>
                  <br />
                  <span className="pl-6 text-blue-300">bank_name</span>{' '}
                  <span className="text-amber-300">varchar(128),</span>
                  <br />
                  <span className="pl-6 text-blue-300">account_number</span>{' '}
                  <span className="text-amber-300">varchar(64),</span>
                  <br />
                  <span className="pl-6 text-blue-300">ifsc_code</span>{' '}
                  <span className="text-amber-300">varchar(16),</span>
                  <br />
                  <span className="pl-6 text-blue-300">status</span>{' '}
                  <span className="text-amber-300">varchar(20)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;ACTIVE&apos;,</span>
                  <br />
                  <span className="pl-6 text-blue-300">created_at</span>{' '}
                  <span className="text-amber-300">timestamptz</span>{' '}
                  <span className="text-neutral-400">DEFAULT now()</span>
                  <br />
                  );
                  <br />
                  <br />
                  <span className="text-emerald-400">ALTER TABLE</span> public.suppliers_directory{' '}
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
                    {filteredSuppliers.length}
                  </span>
                  <span>vendors</span>
                </div>
                <span>•</span>
                <span>Category: {categoryFilter}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Dual-Balance Ledger Synced
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Supplier Drawer Modal */}
      {isNewSupplierOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#e2e8f0] max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">Add New Supplier / Karigar</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                  Dual Ledger Ready
                </span>
              </div>
              <button
                onClick={() => setIsNewSupplierOpen(false)}
                className="p-1 hover:bg-neutral-200 rounded text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="p-4 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                    placeholder="e.g. Royal Bullion Refineries"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Vendor Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  >
                    {CATEGORIES_LIST.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Contact Person</label>
                  <input
                    type="text"
                    value={formContactPerson}
                    onChange={(e) => setFormContactPerson(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Phone Number</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">City / Market Location</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">GSTIN Number</label>
                  <input
                    type="text"
                    value={formGSTIN}
                    onChange={(e) => setFormGSTIN(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono uppercase"
                    placeholder="36AAAAA0000A1Z5"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">PAN Number</label>
                  <input
                    type="text"
                    value={formPAN}
                    onChange={(e) => setFormPAN(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono uppercase"
                    placeholder="AAAAA0000A"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">BIS Hallmark License #</label>
                  <input
                    type="text"
                    value={formBIS}
                    onChange={(e) => setFormBIS(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    placeholder="BIS/REF/2026/01"
                  />
                </div>
              </div>

              {/* Dual Balance Opening Section */}
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  Dual Balance Opening Position
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Opening Metal Balance (g Pure Gold)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={formMetalBal}
                      onChange={(e) => setFormMetalBal(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                      placeholder="-45.000 (negative if we owe)"
                    />
                    <span className="text-[10px] text-neutral-400 mt-0.5 block">
                      Negative if store owes metal; positive if vendor has advance gold
                    </span>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Opening Cash Balance (₹ INR)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formCashBal}
                      onChange={(e) => setFormCashBal(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                      placeholder="-100000.00 (negative if payable)"
                    />
                    <span className="text-[10px] text-neutral-400 mt-0.5 block">
                      Negative if payable; positive if supplier credit balance
                    </span>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-blue-600" />
                  Bank Details for RTGS / NEFT Settlements
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Bank Name</label>
                    <input
                      type="text"
                      value={formBank}
                      onChange={(e) => setFormBank(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                      placeholder="HDFC Bank"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Account Number</label>
                    <input
                      type="text"
                      value={formAccountNo}
                      onChange={(e) => setFormAccountNo(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">IFSC Code</label>
                    <input
                      type="text"
                      value={formIFSC}
                      onChange={(e) => setFormIFSC(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono uppercase"
                      placeholder="HDFC0000060"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5e7eb]">
                <button
                  type="button"
                  onClick={() => setIsNewSupplierOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Supplier</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick View Ledger Modal */}
      {selectedSupplierForLedger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#e2e8f0] max-w-2xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">
                  {selectedSupplierForLedger.supplier_name} - Ledger Summary
                </h3>
              </div>
              <button
                onClick={() => setSelectedSupplierForLedger(null)}
                className="p-1 hover:bg-neutral-200 rounded text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
                  <div className="text-[11px] font-medium text-amber-800 uppercase">Net Fine Metal Balance</div>
                  <div className="text-lg font-mono font-medium text-amber-900 mt-1">
                    {selectedSupplierForLedger.metal_balance_g.toFixed(3)} g
                  </div>
                  <div className="text-[10px] text-amber-700 mt-0.5">
                    {selectedSupplierForLedger.metal_balance_g < 0 ? 'Store owes 999 Fine Gold' : 'Vendor holds store metal'}
                  </div>
                </div>

                <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg">
                  <div className="text-[11px] font-medium text-blue-800 uppercase">Cash Currency Balance</div>
                  <div className="text-lg font-mono font-medium text-blue-900 mt-1">
                    ₹ {Math.abs(selectedSupplierForLedger.cash_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-blue-700 mt-0.5">
                    {selectedSupplierForLedger.cash_balance < 0 ? 'Trade Payables Due' : 'Advance Balance'}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-sans">Bank:</span>
                  <span className="text-neutral-800">{selectedSupplierForLedger.bank_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-sans">Account #:</span>
                  <span className="text-neutral-800">{selectedSupplierForLedger.account_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-sans">IFSC:</span>
                  <span className="text-neutral-800">{selectedSupplierForLedger.ifsc_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-sans">GSTIN:</span>
                  <span className="text-neutral-800">{selectedSupplierForLedger.gstin}</span>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 bg-[#f8fafc] border-t border-[#e5e7eb] flex items-center justify-between">
              <a
                href="/purchases/ledger"
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
              >
                <span>Open Full Dual Ledger</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setSelectedSupplierForLedger(null)}
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
