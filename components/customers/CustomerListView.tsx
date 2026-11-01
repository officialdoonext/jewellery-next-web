'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Users,
  ShieldCheck,
  Crown,
  Calendar,
  Search,
  Filter,
  Plus,
  X,
  Copy,
  Check,
  Eye,
  Trash2,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  FileText,
  BadgeCheck,
  AlertTriangle,
  Gift,
  Heart,
  TrendingUp,
  CreditCard,
  Sparkles,
  ShoppingBag,
  Gem,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  BookOpen,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';

export interface CustomerRecord {
  id: string;
  full_name: string;
  phone: string;
  phone_secondary?: string;
  email: string;
  city: string;
  address: string;
  pan_number: string;
  aadhaar_ref: string;
  dob: string;
  wedding_anniversary: string;
  loyalty_tier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';
  customer_tag: 'Retail' | 'Bridal' | 'Corporate' | 'Wholesale';
  total_purchases: number;
  kyc_status: 'VERIFIED' | 'PENDING' | 'EXEMPT';
  pan_verified: boolean;
  credit_limit: number;
  outstanding_balance: number;
  last_purchase_date: string;
  created_at?: string;
}

const SAMPLE_PATRONS: Omit<CustomerRecord, 'id'>[] = [
  {
    full_name: 'Sridevi Rao',
    phone: '+91 98451 23456',
    phone_secondary: '+91 98451 23457',
    email: 'sridevi.rao@jubileehills.com',
    city: 'Hyderabad',
    address: 'Plot 42, Road No. 10, Jubilee Hills',
    pan_number: 'ABCDE1234F',
    aadhaar_ref: '9182',
    dob: '1984-06-15',
    wedding_anniversary: '2014-11-28',
    loyalty_tier: 'PLATINUM',
    customer_tag: 'Bridal',
    total_purchases: 1845000.0,
    kyc_status: 'VERIFIED',
    pan_verified: true,
    credit_limit: 500000.0,
    outstanding_balance: 0.0,
    last_purchase_date: '2026-10-18',
    created_at: new Date().toISOString(),
  },
  {
    full_name: 'Venkat Raman',
    phone: '+91 97412 89012',
    phone_secondary: '+91 97412 89013',
    email: 'venkat.raman@indiranagar.org',
    city: 'Bangalore',
    address: '74, 12th Main, Indiranagar',
    pan_number: 'FGHIJ5678K',
    aadhaar_ref: '4421',
    dob: '1979-03-22',
    wedding_anniversary: '2008-05-19',
    loyalty_tier: 'GOLD',
    customer_tag: 'Retail',
    total_purchases: 620000.0,
    kyc_status: 'VERIFIED',
    pan_verified: true,
    credit_limit: 200000.0,
    outstanding_balance: 35000.0,
    last_purchase_date: '2026-10-25',
    created_at: new Date().toISOString(),
  },
  {
    full_name: 'Ananya Reddy',
    phone: '+91 91008 34567',
    email: 'ananya.reddy@hyderabadarts.in',
    city: 'Hyderabad',
    address: 'Flat 403, Cyber Gateway Enclave, Madhapur',
    pan_number: 'KLMNO9012P',
    aadhaar_ref: '7729',
    dob: '1995-11-04',
    wedding_anniversary: '2022-11-18',
    loyalty_tier: 'SILVER',
    customer_tag: 'Bridal',
    total_purchases: 285000.0,
    kyc_status: 'VERIFIED',
    pan_verified: true,
    credit_limit: 100000.0,
    outstanding_balance: 18000.0,
    last_purchase_date: '2026-10-27',
    created_at: new Date().toISOString(),
  },
  {
    full_name: 'Dr. Mohan Krishna',
    phone: '+91 94401 55667',
    email: 'm.krishna@kimshealth.org',
    city: 'Secunderabad',
    address: 'Bunglow 12, Prenderghast Road, Secunderabad',
    pan_number: 'QRSTU3456V',
    aadhaar_ref: '1098',
    dob: '1971-08-11',
    wedding_anniversary: '1998-12-14',
    loyalty_tier: 'PLATINUM',
    customer_tag: 'Retail',
    total_purchases: 940000.0,
    kyc_status: 'VERIFIED',
    pan_verified: true,
    credit_limit: 300000.0,
    outstanding_balance: 45000.0,
    last_purchase_date: '2026-10-12',
    created_at: new Date().toISOString(),
  },
];

export function CustomersListView() {
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE'>('ALL');
  const [kycFilter, setKycFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING' | 'EXEMPT'>('ALL');
  const [tagFilter, setTagFilter] = useState<'ALL' | 'Retail' | 'Bridal' | 'Corporate' | 'Wholesale'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Drawer / Modals
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  // Registration Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPhoneSec, setFormPhoneSec] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCity, setFormCity] = useState('Hyderabad');
  const [formAddress, setFormAddress] = useState('');
  const [formPan, setFormPan] = useState('');
  const [formAadhaar, setFormAadhaar] = useState('');
  const [formDob, setFormDob] = useState('');
  const [formAnniversary, setFormAnniversary] = useState('');
  const [formTier, setFormTier] = useState<'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE'>('BRONZE');
  const [formTag, setFormTag] = useState<'Retail' | 'Bridal' | 'Corporate' | 'Wholesale'>('Retail');
  const [formCreditLimit, setFormCreditLimit] = useState('100000');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'customers_directory'));
      const list: CustomerRecord[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<CustomerRecord, 'id'>) });
      });
      setCustomers(list);
    } catch (err: any) {
      console.error('Error fetching customers directory:', err);
      showToast('error', err.message || 'Failed to fetch customer directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSeedSamples = async () => {
    try {
      setSaving(true);
      const added: CustomerRecord[] = [];
      for (const item of SAMPLE_PATRONS) {
        const docRef = await addDoc(collection(db, 'customers_directory'), item);
        added.push({ id: docRef.id, ...item });
      }
      setCustomers((prev) => [...added, ...prev]);
      showToast('success', `${added.length} sample patrons registered into Firestore.`);
    } catch (err: any) {
      console.error('Error seeding patrons:', err);
      showToast('error', err.message || 'Failed to seed sample patrons');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Real-time PAN calculation
  const panClean = formPan.trim().toUpperCase();
  const isPanValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panClean);
  const derivedKyc = isPanValid ? 'VERIFIED' : panClean.length > 0 ? 'PENDING' : 'EXEMPT';

  const handleRegisterCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;

    try {
      setSaving(true);
      const newRecord: Omit<CustomerRecord, 'id'> = {
        full_name: formName.trim(),
        phone: formPhone.trim(),
        phone_secondary: formPhoneSec.trim() || undefined,
        email: formEmail.trim(),
        city: formCity.trim() || 'Hyderabad',
        address: formAddress.trim(),
        pan_number: panClean,
        aadhaar_ref: formAadhaar.trim() ? `XXXX-XXXX-${formAadhaar.trim().slice(-4)}` : '',
        dob: formDob,
        wedding_anniversary: formAnniversary,
        loyalty_tier: formTier,
        customer_tag: formTag,
        total_purchases: 0,
        kyc_status: derivedKyc,
        pan_verified: isPanValid,
        credit_limit: parseFloat(formCreditLimit) || 50000,
        outstanding_balance: 0,
        last_purchase_date: 'Never',
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'customers_directory'), newRecord);
      setCustomers((prev) => [{ id: docRef.id, ...newRecord }, ...prev]);
      setIsNewCustomerOpen(false);
      showToast('success', `Patron "${formName}" registered successfully with KYC ${derivedKyc}.`);

      // Reset form
      setFormName('');
      setFormPhone('');
      setFormPhoneSec('');
      setFormEmail('');
      setFormAddress('');
      setFormPan('');
      setFormAadhaar('');
      setFormDob('');
      setFormAnniversary('');
      setFormCreditLimit('100000');
    } catch (err: any) {
      console.error('Error adding customer:', err);
      showToast('error', err.message || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (!confirm(`Delete patron "${name}" from directory?`)) return;
    try {
      await deleteDoc(doc(db, 'customers_directory', id));
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      if (selectedCustomer?.id === id) setSelectedCustomer(null);
      showToast('success', `Customer "${name}" removed from directory.`);
    } catch (err: any) {
      console.error('Error deleting customer:', err);
      showToast('error', err.message || 'Failed to delete customer');
    }
  };

  const handleUpdateKyc = async (id: string, newKyc: CustomerRecord['kyc_status']) => {
    try {
      await updateDoc(doc(db, 'customers_directory', id), {
        kyc_status: newKyc,
        pan_verified: newKyc === 'VERIFIED',
      });
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, kyc_status: newKyc, pan_verified: newKyc === 'VERIFIED' } : c
        )
      );
      if (selectedCustomer?.id === id) {
        setSelectedCustomer((prev) =>
          prev ? { ...prev, kyc_status: newKyc, pan_verified: newKyc === 'VERIFIED' } : null
        );
      }
      showToast('success', `KYC status updated to ${newKyc}.`);
    } catch (err: any) {
      console.error('Error updating KYC:', err);
      showToast('error', err.message || 'Failed to update KYC');
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (tierFilter !== 'ALL' && c.loyalty_tier !== tierFilter) return false;
      if (kycFilter !== 'ALL' && c.kyc_status !== kycFilter) return false;
      if (tagFilter !== 'ALL' && c.customer_tag !== tagFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = c.full_name?.toLowerCase().includes(q);
        const matchesPhone = c.phone?.toLowerCase().includes(q);
        const matchesPan = c.pan_number?.toLowerCase().includes(q);
        const matchesCity = c.city?.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesPan && !matchesCity) return false;
      }
      return true;
    });
  }, [customers, tierFilter, kycFilter, tagFilter, searchQuery]);

  // Derived KPI metrics
  const totalCount = customers.length;
  const verifiedCount = customers.filter((c) => c.kyc_status === 'VERIFIED').length;
  const kycPercent = totalCount ? Math.round((verifiedCount / totalCount) * 100) : 0;
  const vipCount = customers.filter((c) => c.loyalty_tier === 'PLATINUM' || (c.total_purchases || 0) >= 500000).length;
  const totalTurnover = customers.reduce((sum, c) => sum + (c.total_purchases || 0), 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="customers_directory" />
      <ActionToolbar
        filterPlaceholder="Filter by customer name, mobile, PAN, or city..."
        insertLabel="New Patron"
        onInsertClick={() => setIsNewCustomerOpen(true)}
        onRefresh={fetchCustomers}
      />

      {/* Customer Module Interlinks Bar */}
      <div className="h-10 bg-[#f8fafc] border-b border-[#e2e8f0] px-3 sm:px-4 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar text-xs">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-medium uppercase text-neutral-400 mr-1">Modules:</span>
          <Link
            href="/customers/list"
            className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs"
          >
            Directory
          </Link>
          <Link
            href="/customers/schemes"
            className="px-2.5 py-1 rounded-md text-xs font-medium text-neutral-600 hover:text-emerald-700 hover:bg-neutral-100 transition-colors"
          >
            Gold Schemes
          </Link>
          <Link
            href="/customers/advance-deposits"
            className="px-2.5 py-1 rounded-md text-xs font-medium text-neutral-600 hover:text-emerald-700 hover:bg-neutral-100 transition-colors"
          >
            Advance Deposits
          </Link>
          <Link
            href="/customers/outstanding-balances"
            className="px-2.5 py-1 rounded-md text-xs font-medium text-neutral-600 hover:text-emerald-700 hover:bg-neutral-100 transition-colors"
          >
            Outstanding Dues
          </Link>
          <Link
            href="/customers/purchase-history"
            className="px-2.5 py-1 rounded-md text-xs font-medium text-neutral-600 hover:text-emerald-700 hover:bg-neutral-100 transition-colors"
          >
            Invoices & History
          </Link>
          <Link
            href="/customers/loyalty-rewards"
            className="px-2.5 py-1 rounded-md text-xs font-medium text-neutral-600 hover:text-emerald-700 hover:bg-neutral-100 transition-colors"
          >
            Loyalty Rewards
          </Link>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/sales/billing-pos"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-emerald-700 hover:underline"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" /> POS Billing
          </Link>
          <span className="text-neutral-300">•</span>
          <Link
            href="/orders-services/custom-orders"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-emerald-700 hover:underline"
          >
            <Gem className="w-3.5 h-3.5 text-emerald-600" /> Custom Orders
          </Link>
          <span className="text-neutral-300">•</span>
          <Link
            href="/finance/receivables"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-emerald-700 hover:underline"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" /> Receivables
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* Toast Feedback */}
        {toastType === 'success' && (
          <div className="mx-4 mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center justify-between animate-fadeIn shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastType('idle')} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {toastType === 'error' && (
          <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-medium flex items-center justify-between animate-fadeIn shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastType('idle')} className="text-red-600 hover:text-red-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* KPI Metrics Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Registered Patrons</span>
                <Users className="w-3.5 h-3.5 text-neutral-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-neutral-400" /> : `${totalCount} Patrons`}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Firestore Directory
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">KYC Compliance</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-neutral-400" /> : `${kycPercent}% Verified`}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                {verifiedCount} with verified PAN on file
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-purple-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">High-Net-Worth VIPs</span>
                <Crown className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-xl font-medium text-purple-800">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-neutral-400" /> : `${vipCount} Patrons`}
              </div>
              <div className="text-[11px] text-purple-600 mt-1 font-mono">
                Platinum tier / ₹5L+ spend
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Sales Turnover</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
                ) : (
                  `₹ ${totalTurnover.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                )}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Cumulative patron transactions
              </div>
            </div>
          </div>

          {/* Quick Filter Bar */}
          <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search name, phone, PAN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-white border border-[#e2e8f0] rounded-md text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-emerald-500 w-52"
                />
              </div>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Tier:</span>
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value as any)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Tiers</option>
                  <option value="PLATINUM">Platinum</option>
                  <option value="GOLD">Gold</option>
                  <option value="SILVER">Silver</option>
                  <option value="BRONZE">Bronze</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">KYC:</span>
                <select
                  value={kycFilter}
                  onChange={(e) => setKycFilter(e.target.value as any)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All KYC</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="PENDING">Pending</option>
                  <option value="EXEMPT">Exempt (&lt; ₹2L)</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Tag:</span>
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value as any)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Tags</option>
                  <option value="Retail">Retail</option>
                  <option value="Bridal">Bridal</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Wholesale">Wholesale</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchCustomers}
                className="p-1.5 rounded-md border border-[#e2e8f0] bg-white text-neutral-600 hover:text-emerald-700 hover:bg-neutral-50 transition-colors"
                title="Refresh from Firestore"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsNewCustomerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Patron
              </button>
            </div>
          </div>
        </div>

        {/* Supabase-style Table Container */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="border border-[#e2e8f0] rounded-lg bg-white overflow-hidden shadow-2xs flex flex-col flex-1">
            {/* Supabase Table Header Bar */}
            <div className="h-10 bg-[#f8fafc] border-b border-[#e2e8f0] px-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('data')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    activeTab === 'data'
                      ? 'bg-white text-neutral-900 shadow-2xs border border-[#e2e8f0]'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Data ({filteredCustomers.length})
                </button>
                <button
                  onClick={() => setActiveTab('definition')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    activeTab === 'definition'
                      ? 'bg-white text-neutral-900 shadow-2xs border border-[#e2e8f0]'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Definition (DDL)
                </button>
              </div>
              <div className="text-[11px] text-neutral-400 font-mono">
                firestore: customers_directory • 15 fields
              </div>
            </div>

            {/* Table Content: Data Tab */}
            {activeTab === 'data' && (
              <div className="overflow-x-auto flex-1">
                {loading ? (
                  <div className="flex flex-col items-center justify-center p-12 text-neutral-400">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
                    <span className="text-xs font-medium text-neutral-600">Connecting to Firestore Directory...</span>
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                      <Users className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-medium text-neutral-900 mb-1">No Patrons Found</h4>
                    <p className="text-xs text-neutral-500 max-w-sm mb-4">
                      {customers.length === 0
                        ? 'Your customer directory in Firestore is currently empty. Register your first customer or seed sample retail patrons.'
                        : 'No patrons match the selected filter criteria. Try adjusting the search or tier filter.'}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsNewCustomerOpen(true)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Customer
                      </button>
                      {customers.length === 0 && (
                        <button
                          onClick={handleSeedSamples}
                          disabled={saving}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-300 transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          Insert Sample Records
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-neutral-600 font-mono text-[11px]">
                        <th className="w-10 px-3 py-2 border-r border-[#e5e7eb] text-center">
                          <input type="checkbox" className="rounded border-neutral-300 text-emerald-600 focus:ring-0" />
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">id</span>
                          <span className="text-neutral-400 font-normal text-[10px] ml-1">uuid</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">full_name</span>
                          <span className="text-neutral-400 font-normal text-[10px] ml-1">varchar</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">phone</span>
                          <span className="text-neutral-400 font-normal text-[10px] ml-1">varchar</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">city</span>
                          <span className="text-neutral-400 font-normal text-[10px] ml-1">varchar</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                          <span className="text-neutral-800">pan_number</span>
                          <span className="text-neutral-400 font-normal text-[10px] ml-1">varchar</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                          <span className="text-neutral-800">loyalty_tier</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                          <span className="text-neutral-800">total_purchases</span>
                          <span className="text-neutral-400 font-normal text-[10px] ml-1">inr</span>
                        </th>
                        <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                          <span className="text-neutral-800">kyc_status</span>
                        </th>
                        <th className="px-3.5 py-2 font-medium whitespace-nowrap text-center">
                          <span className="text-neutral-800">actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {filteredCustomers.map((row) => (
                        <tr key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                          <td className="px-3 py-2 text-center border-r border-[#e5e7eb]">
                            <input type="checkbox" className="rounded border-neutral-300 text-emerald-600 focus:ring-0" />
                          </td>
                          <td className="px-3.5 py-2 font-mono text-neutral-500 border-r border-[#e5e7eb] whitespace-nowrap text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span>{row.id.substring(0, 8)}...</span>
                              <button
                                onClick={() => copyToClipboard(row.id, row.id)}
                                className="text-neutral-400 hover:text-neutral-700 transition-colors"
                                title="Copy Document ID"
                              >
                                {copiedId === row.id ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-neutral-900">{row.full_name}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                                {row.customer_tag}
                              </span>
                            </div>
                            <span className="text-[10px] text-neutral-400 block font-mono">{row.email || 'No email registered'}</span>
                          </td>
                          <td className="px-3.5 py-2 font-mono text-neutral-700 border-r border-[#e5e7eb] whitespace-nowrap">
                            {row.phone}
                          </td>
                          <td className="px-3.5 py-2 text-neutral-700 border-r border-[#e5e7eb] whitespace-nowrap">
                            {row.city || 'Hyderabad'}
                          </td>
                          <td className="px-3.5 py-2 font-mono border-r border-[#e5e7eb] whitespace-nowrap">
                            {row.pan_number ? (
                              <div className="flex items-center gap-1">
                                <span className="text-neutral-800">{row.pan_number}</span>
                                {row.pan_verified && (
                                  <span title="Income Tax PAN Validated">
                                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-neutral-400 italic text-[11px]">Not Provided</span>
                            )}
                          </td>
                          <td className="px-3.5 py-2 text-center border-r border-[#e5e7eb] whitespace-nowrap">
                            {row.loyalty_tier === 'PLATINUM' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                                <Crown className="w-3 h-3 text-purple-600" /> Platinum
                              </span>
                            )}
                            {row.loyalty_tier === 'GOLD' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                <Sparkles className="w-3 h-3 text-amber-500" /> Gold
                              </span>
                            )}
                            {row.loyalty_tier === 'SILVER' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-300">
                                Silver
                              </span>
                            )}
                            {row.loyalty_tier === 'BRONZE' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-50 text-orange-700 border border-orange-200">
                                Bronze
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-2 font-mono text-right border-r border-[#e5e7eb] whitespace-nowrap font-medium text-neutral-900">
                            ₹ {(row.total_purchases || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-3.5 py-2 text-center border-r border-[#e5e7eb] whitespace-nowrap">
                            {row.kyc_status === 'VERIFIED' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                                VERIFIED
                              </span>
                            ) : row.kyc_status === 'PENDING' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono bg-amber-50 text-amber-700 border border-amber-200">
                                PENDING
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono bg-blue-50 text-blue-700 border border-blue-200">
                                EXEMPT (&lt;2L)
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-2 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setSelectedCustomer(row)}
                                className="p-1 hover:bg-neutral-100 rounded text-neutral-600 hover:text-emerald-700 transition-colors"
                                title="View Customer Profile"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <Link
                                href={`/sales/billing-pos?customer=${encodeURIComponent(row.full_name)}&phone=${encodeURIComponent(row.phone)}`}
                                className="p-1 hover:bg-emerald-50 rounded text-neutral-600 hover:text-emerald-700 transition-colors"
                                title="Start POS Billing"
                              >
                                <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                              </Link>
                              <a
                                href={`https://wa.me/${row.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 hover:bg-emerald-50 rounded text-neutral-400 hover:text-emerald-600 transition-colors"
                                title="WhatsApp Message"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => handleDeleteCustomer(row.id, row.full_name)}
                                className="p-1 hover:bg-red-50 rounded text-neutral-400 hover:text-red-600 transition-colors"
                                title="Delete Patron"
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

            {/* Table Content: Definition Tab */}
            {activeTab === 'definition' && (
              <div className="p-4 overflow-x-auto font-mono text-xs text-neutral-800 bg-[#fbfbfb] w-full">
                <div className="bg-neutral-900 text-neutral-100 p-4 rounded-md overflow-x-auto shadow-inner text-[12px] leading-relaxed w-full">
                  <span className="text-emerald-400">// Firestore Collection Schema</span>
                  <br />
                  collection: <span className="text-amber-400">&quot;customers_directory&quot;</span>
                  <br />
                  document: &#123;
                  <br />
                  &nbsp;&nbsp;id: <span className="text-blue-300">auto-generated-id</span>,
                  <br />
                  &nbsp;&nbsp;full_name: <span className="text-blue-300">string</span> (Patron full legal name),
                  <br />
                  &nbsp;&nbsp;phone: <span className="text-blue-300">string</span> (Primary 10-digit mobile),
                  <br />
                  &nbsp;&nbsp;phone_secondary: <span className="text-blue-300">string</span> (Optional alternate),
                  <br />
                  &nbsp;&nbsp;email: <span className="text-blue-300">string</span>,
                  <br />
                  &nbsp;&nbsp;city: <span className="text-blue-300">string</span>,
                  <br />
                  &nbsp;&nbsp;address: <span className="text-blue-300">string</span>,
                  <br />
                  &nbsp;&nbsp;pan_number: <span className="text-blue-300">string</span> (Mandatory for &gt;₹2L KYC),
                  <br />
                  &nbsp;&nbsp;aadhaar_ref: <span className="text-blue-300">string</span> (Last 4 digits),
                  <br />
                  &nbsp;&nbsp;dob: <span className="text-blue-300">YYYY-MM-DD</span>,
                  <br />
                  &nbsp;&nbsp;wedding_anniversary: <span className="text-blue-300">YYYY-MM-DD</span>,
                  <br />
                  &nbsp;&nbsp;loyalty_tier: <span className="text-emerald-300">&apos;PLATINUM&apos; | &apos;GOLD&apos; | &apos;SILVER&apos; | &apos;BRONZE&apos;</span>,
                  <br />
                  &nbsp;&nbsp;customer_tag: <span className="text-emerald-300">&apos;Retail&apos; | &apos;Bridal&apos; | &apos;Corporate&apos; | &apos;Wholesale&apos;</span>,
                  <br />
                  &nbsp;&nbsp;total_purchases: <span className="text-blue-300">number</span>,
                  <br />
                  &nbsp;&nbsp;kyc_status: <span className="text-emerald-300">&apos;VERIFIED&apos; | &apos;PENDING&apos; | &apos;EXEMPT&apos;</span>,
                  <br />
                  &nbsp;&nbsp;credit_limit: <span className="text-blue-300">number</span>,
                  <br />
                  &nbsp;&nbsp;created_at: <span className="text-blue-300">ISO-timestamp</span>
                  <br />
                  &#125;
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Customer Registration Drawer Modal */}
      {isNewCustomerOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-[#e2e8f0] animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div>
                <h3 className="text-sm font-medium text-neutral-900">New Customer Registration</h3>
                <p className="text-[11px] text-neutral-500">Capture patron contact, PAN for KYC compliance, and wedding milestones</p>
              </div>
              <button
                onClick={() => setIsNewCustomerOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleRegisterCustomer} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-xs">
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-600" /> Personal Information
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sridevi Rao"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 placeholder:text-neutral-400 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Primary Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98451 23456"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 placeholder:text-neutral-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Secondary Phone</label>
                    <input
                      type="tel"
                      placeholder="+91 94401 55667"
                      value={formPhoneSec}
                      onChange={(e) => setFormPhoneSec(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 placeholder:text-neutral-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="client@domain.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 placeholder:text-neutral-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">City</label>
                    <input
                      type="text"
                      placeholder="Hyderabad"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 placeholder:text-neutral-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Full Postal Address</label>
                  <textarea
                    rows={2}
                    placeholder="Plot / Flat, Road, Colony / Landmark"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 placeholder:text-neutral-400 transition-colors resize-none"
                  />
                </div>
              </div>

              {/* KYC Compliance Section */}
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Statutory KYC & PAN Compliance
                  </span>
                  <span className="text-[10px] text-amber-600 font-mono">Mandatory &gt; ₹2,00,000</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">PAN Number</label>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="ABCDE1234F"
                      value={formPan}
                      onChange={(e) => setFormPan(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 text-xs font-mono uppercase border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 placeholder:text-neutral-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Aadhaar (Last 4 digits)</label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="9182"
                      value={formAadhaar}
                      onChange={(e) => setFormAadhaar(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 placeholder:text-neutral-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Real-time Dynamic KYC Indicator */}
                <div className={`p-2.5 rounded border text-[11px] flex items-start gap-2 ${
                  isPanValid
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                    : panClean.length > 0
                    ? 'bg-amber-50/80 border-amber-200 text-amber-800'
                    : 'bg-neutral-100/80 border-neutral-200 text-neutral-600'
                }`}>
                  <BadgeCheck className={`w-4 h-4 shrink-0 mt-0.5 ${isPanValid ? 'text-emerald-600' : 'text-neutral-400'}`} />
                  <div>
                    <div className="font-medium">
                      Status: {derivedKyc} {isPanValid ? '(Valid 10-char Income Tax PAN)' : panClean.length > 0 ? '(Format must be 5 Letters + 4 Digits + 1 Letter)' : '(Exempt for small walk-ins)'}
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">
                      Compliant with Income Tax Act Section 206C(1D) high-value billing threshold.
                    </div>
                  </div>
                </div>
              </div>

              {/* Milestones & Loyalty Tiers */}
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-amber-500" /> Milestones & Loyalty Tier
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formDob}
                      onChange={(e) => setFormDob(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Wedding Anniversary</label>
                    <input
                      type="date"
                      value={formAnniversary}
                      onChange={(e) => setFormAnniversary(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Initial Tier</label>
                    <select
                      value={formTier}
                      onChange={(e) => setFormTier(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 cursor-pointer"
                    >
                      <option value="BRONZE">Bronze (Standard)</option>
                      <option value="SILVER">Silver</option>
                      <option value="GOLD">Gold</option>
                      <option value="PLATINUM">Platinum (VIP)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Customer Tag</label>
                    <select
                      value={formTag}
                      onChange={(e) => setFormTag(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 cursor-pointer"
                    >
                      <option value="Retail">Retail</option>
                      <option value="Bridal">Bridal</option>
                      <option value="Corporate">Corporate</option>
                      <option value="Wholesale">Wholesale</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={formCreditLimit}
                    onChange={(e) => setFormCreditLimit(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewCustomerOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  Save Patron to Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Quick Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-lg shadow-2xl border border-[#e2e8f0] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-medium text-sm">
                  {selectedCustomer.full_name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-900">{selectedCustomer.full_name}</h3>
                  <p className="text-[11px] text-neutral-500 font-mono">{selectedCustomer.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Loyalty Tier</span>
                  <span className="text-sm font-medium text-neutral-900 mt-1 block">
                    {selectedCustomer.loyalty_tier}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Total Spent</span>
                  <span className="text-sm font-medium text-neutral-900 mt-1 block font-mono">
                    ₹ {(selectedCustomer.total_purchases || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">KYC Status</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-sm font-medium text-emerald-700">
                      {selectedCustomer.kyc_status}
                    </span>
                    <button
                      onClick={() =>
                        handleUpdateKyc(
                          selectedCustomer.id,
                          selectedCustomer.kyc_status === 'VERIFIED' ? 'PENDING' : 'VERIFIED'
                        )
                      }
                      className="text-[10px] text-neutral-500 hover:text-emerald-700 underline ml-1"
                    >
                      (Toggle)
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-t border-[#e2e8f0] pt-3 text-neutral-700">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Email Address:</span>
                  <span className="font-mono text-neutral-900">{selectedCustomer.email || 'None'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">City / Address:</span>
                  <span className="text-neutral-900">{selectedCustomer.address || selectedCustomer.city}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">PAN Number:</span>
                  <span className="font-mono text-neutral-900">{selectedCustomer.pan_number || 'Not provided'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Aadhaar Ref:</span>
                  <span className="font-mono text-neutral-900">{selectedCustomer.aadhaar_ref || 'None'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Wedding Anniversary:</span>
                  <span className="text-neutral-900">{selectedCustomer.wedding_anniversary || 'Not recorded'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Credit Limit:</span>
                  <span className="font-mono text-neutral-900">₹ {(selectedCustomer.credit_limit || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Current Outstanding:</span>
                  <span className="font-mono text-amber-700">₹ {(selectedCustomer.outstanding_balance || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Interlinks for Customer */}
              <div className="pt-3 border-t border-[#e2e8f0] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/sales/billing-pos?customer=${encodeURIComponent(selectedCustomer.full_name)}&phone=${encodeURIComponent(selectedCustomer.phone)}`}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" /> Start Billing
                  </Link>
                  <Link
                    href={`/orders-services/custom-orders?customer=${encodeURIComponent(selectedCustomer.full_name)}`}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-neutral-100 text-neutral-800 border border-neutral-300 hover:bg-neutral-200 transition-colors shadow-2xs"
                  >
                    <Gem className="w-3.5 h-3.5 text-neutral-600" /> Custom Order
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                  <button
                    onClick={() => handleDeleteCustomer(selectedCustomer.id, selectedCustomer.full_name)}
                    className="p-1.5 rounded-md text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                    title="Delete Customer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
