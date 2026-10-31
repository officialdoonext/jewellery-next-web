'use client';

import React, { useState, useMemo } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Coins,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Printer,
  CreditCard,
  FileText,
  Plus,
  X,
  Search,
  Check,
  ChevronRight,
  TrendingUp,
  Award,
  AlertCircle,
  Eye,
  MessageCircle,
} from 'lucide-react';

interface SchemeAccountRecord {
  id: string;
  scheme_account_no: string;
  customer_name: string;
  phone: string;
  scheme_name: string;
  monthly_installment: number;
  months_paid: number;
  total_months: number;
  total_paid_amount: number;
  accrued_gold_weight_g: number;
  next_due_date: string;
  start_date: string;
  auto_debit: boolean;
  nominee_name: string;
  nominee_relationship: string;
  benefit_type: string;
  status: 'ACTIVE' | 'MATURED' | 'CLOSED';
}

const INITIAL_SCHEMES: SchemeAccountRecord[] = [
  {
    id: '11223344-e5f6-a1b2-c3d4-556677889901',
    scheme_account_no: 'SCH-2026-901',
    customer_name: 'Sridevi Rao',
    phone: '+91 98451 23456',
    scheme_name: '11+1 Suvarna Nidhi',
    monthly_installment: 25000.0,
    months_paid: 8,
    total_months: 11,
    total_paid_amount: 200000.0,
    accrued_gold_weight_g: 25.475,
    next_due_date: '2026-11-10',
    start_date: '2026-03-10',
    auto_debit: true,
    nominee_name: 'K. Rajesh Rao',
    nominee_relationship: 'Spouse',
    benefit_type: '12th Month Free Bonus (₹25,000 value)',
    status: 'ACTIVE',
  },
  {
    id: '11223344-e5f6-a1b2-c3d4-556677889902',
    scheme_account_no: 'SCH-2026-844',
    customer_name: 'Venkat Raman',
    phone: '+91 97412 89012',
    scheme_name: '10-Month Bullion Weight Accumulator',
    monthly_installment: 15000.0,
    months_paid: 5,
    total_months: 10,
    total_paid_amount: 75000.0,
    accrued_gold_weight_g: 9.554,
    next_due_date: '2026-11-05',
    start_date: '2026-06-05',
    auto_debit: true,
    nominee_name: 'Gayatri Raman',
    nominee_relationship: 'Spouse',
    benefit_type: '0% Making Charges up to 18% at maturity',
    status: 'ACTIVE',
  },
  {
    id: '11223344-e5f6-a1b2-c3d4-556677889903',
    scheme_account_no: 'SCH-2026-712',
    customer_name: 'Ananya Reddy',
    phone: '+91 91008 34567',
    scheme_name: '11+1 Suvarna Nidhi',
    monthly_installment: 10000.0,
    months_paid: 11,
    total_months: 11,
    total_paid_amount: 110000.0,
    accrued_gold_weight_g: 14.012,
    next_due_date: 'Matured (Ready to Redeem)',
    start_date: '2025-11-15',
    auto_debit: false,
    nominee_name: 'K. Vikram Reddy',
    nominee_relationship: 'Father',
    benefit_type: '1 Month Bonus (₹10,000) + 100% Making Waiver',
    status: 'MATURED',
  },
  {
    id: '11223344-e5f6-a1b2-c3d4-556677889904',
    scheme_account_no: 'SCH-2026-620',
    customer_name: 'Dr. Mohan Krishna',
    phone: '+91 94401 55667',
    scheme_name: '11+1 Suvarna Nidhi',
    monthly_installment: 25000.0,
    months_paid: 9,
    total_months: 11,
    total_paid_amount: 225000.0,
    accrued_gold_weight_g: 28.662,
    next_due_date: '2026-11-14',
    start_date: '2026-02-14',
    auto_debit: true,
    nominee_name: 'Padmavathi Krishna',
    nominee_relationship: 'Spouse',
    benefit_type: '12th Month Free Bonus (₹25,000 value)',
    status: 'ACTIVE',
  },
  {
    id: '11223344-e5f6-a1b2-c3d4-556677889905',
    scheme_account_no: 'SCH-2026-550',
    customer_name: 'Priya Sharma',
    phone: '+91 98112 33445',
    scheme_name: 'Festive Golden Scheme (5 Months)',
    monthly_installment: 10000.0,
    months_paid: 5,
    total_months: 5,
    total_paid_amount: 50000.0,
    accrued_gold_weight_g: 6.369,
    next_due_date: 'Matured (Ready to Redeem)',
    start_date: '2026-05-01',
    auto_debit: false,
    nominee_name: 'Amit Sharma',
    nominee_relationship: 'Spouse',
    benefit_type: 'Free 1g 24K Gold Coin on Maturity',
    status: 'MATURED',
  },
  {
    id: '11223344-e5f6-a1b2-c3d4-556677889906',
    scheme_account_no: 'SCH-2026-402',
    customer_name: 'Lalitha Devi',
    phone: '+91 98865 44321',
    scheme_name: '11+1 Suvarna Nidhi',
    monthly_installment: 5000.0,
    months_paid: 11,
    total_months: 11,
    total_paid_amount: 55000.0,
    accrued_gold_weight_g: 7.006,
    next_due_date: 'Closed on 2026-08-20',
    start_date: '2025-09-01',
    auto_debit: false,
    nominee_name: 'Suresh Kumar',
    nominee_relationship: 'Son',
    benefit_type: 'Redeemed for Gold Bangles',
    status: 'CLOSED',
  },
];

export function CustomersSchemesView() {
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [schemes, setSchemes] = useState<SchemeAccountRecord[]>(INITIAL_SCHEMES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'MATURED' | 'CLOSED'>('ALL');

  // Modals & Drawers
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [selectedSchemeForPassbook, setSelectedSchemeForPassbook] = useState<SchemeAccountRecord | null>(null);
  const [selectedSchemeForPay, setSelectedSchemeForPay] = useState<SchemeAccountRecord | null>(null);
  const [selectedSchemeForRedeem, setSelectedSchemeForRedeem] = useState<SchemeAccountRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Enroll Form State
  const [formPlan, setFormPlan] = useState('11+1 Suvarna Nidhi');
  const [formCustName, setFormCustName] = useState('');
  const [formCustPhone, setFormCustPhone] = useState('');
  const [formEmiAmount, setFormEmiAmount] = useState('10000');
  const [formAutoDebit, setFormAutoDebit] = useState(true);
  const [formNomineeName, setFormNomineeName] = useState('');
  const [formNomineeRel, setFormNomineeRel] = useState('Spouse');

  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const mAcc = s.scheme_account_no.toLowerCase().includes(q);
        const mCust = s.customer_name.toLowerCase().includes(q);
        const mPhone = s.phone.toLowerCase().includes(q);
        const mPlan = s.scheme_name.toLowerCase().includes(q);
        if (!mAcc && !mCust && !mPhone && !mPlan) return false;
      }
      return true;
    });
  }, [schemes, statusFilter, searchQuery]);

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emi = parseFloat(formEmiAmount) || 5000;
    const newAcc: SchemeAccountRecord = {
      id: crypto.randomUUID ? crypto.randomUUID() : `sch-${Date.now()}`,
      scheme_account_no: `SCH-2026-9${schemes.length + 10}`,
      customer_name: formCustName || 'New Scheme Patron',
      phone: formCustPhone || '+91 90000 00000',
      scheme_name: formPlan,
      monthly_installment: emi,
      months_paid: 1,
      total_months: formPlan.includes('10-Month') ? 10 : 11,
      total_paid_amount: emi,
      accrued_gold_weight_g: +(emi / 7850).toFixed(3),
      next_due_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      start_date: new Date().toISOString().split('T')[0],
      auto_debit: formAutoDebit,
      nominee_name: formNomineeName || 'Family Nominee',
      nominee_relationship: formNomineeRel,
      benefit_type: '100% waiver on Making Charges up to 18% on accumulated weight',
      status: 'ACTIVE',
    };

    setSchemes([newAcc, ...schemes]);
    setIsEnrollOpen(false);
    setToastMessage(`Scheme account ${newAcc.scheme_account_no} enrolled successfully.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePayInstallment = (sch: SchemeAccountRecord) => {
    const updated = schemes.map((s) => {
      if (s.id === sch.id) {
        const newPaidMonths = s.months_paid + 1;
        const newTotalPaid = s.total_paid_amount + s.monthly_installment;
        const additionalGrams = +(s.monthly_installment / 7850).toFixed(3);
        const isMatured = newPaidMonths >= s.total_months;
        return {
          ...s,
          months_paid: newPaidMonths,
          total_paid_amount: newTotalPaid,
          accrued_gold_weight_g: +(s.accrued_gold_weight_g + additionalGrams).toFixed(3),
          status: isMatured ? ('MATURED' as const) : s.status,
          next_due_date: isMatured
            ? 'Matured (Ready to Redeem)'
            : new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
        };
      }
      return s;
    });

    setSchemes(updated);
    setSelectedSchemeForPay(null);
    setToastMessage(`Installment #${sch.months_paid + 1} of ₹${sch.monthly_installment.toLocaleString('en-IN')} paid.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRedeemScheme = (sch: SchemeAccountRecord) => {
    const updated = schemes.map((s) => (s.id === sch.id ? { ...s, status: 'CLOSED' as const } : s));
    setSchemes(updated);
    setSelectedSchemeForRedeem(null);
    setToastMessage(`Scheme ${sch.scheme_account_no} redeemed for jewellery purchase.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="customers_gold_schemes" />
      <ActionToolbar
        filterPlaceholder="Search schemes by account #, customer, or plan..."
        insertLabel="Enroll New Gold Scheme"
        onInsertClick={() => setIsEnrollOpen(true)}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* Toast */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> {toastMessage}
            </span>
            <button onClick={() => setToastMessage(null)} className="hover:opacity-80">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* KPI Metrics Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Active Scheme Accounts</span>
                <Coins className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">342 Accounts</div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                94% On-time installment rate
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Monthly Collection</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700 font-mono">₹ 34.20 Lakhs</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Recurring auto-debit & counter
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Gold Grams Accrued</span>
                <Coins className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-amber-700 font-mono">384.250 g</div>
              <div className="text-[11px] text-amber-600 mt-1 font-mono">
                Locked @ 22K 916 purity standard
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-purple-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Matured This Month</span>
                <Award className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-xl font-medium text-purple-800 font-mono">28 Accounts</div>
              <div className="text-[11px] text-purple-600 mt-1 font-mono">
                Ready for jewellery redemption
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
                  placeholder="Filter by account #, customer, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-white border border-[#e2e8f0] rounded-md text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-emerald-500 w-64"
                />
              </div>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-1">
                <span className="text-[11px] text-neutral-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-transparent text-xs text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active Schemes</option>
                  <option value="MATURED">Matured (Ready)</option>
                  <option value="CLOSED">Closed / Redeemed</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEnrollOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Enroll New Scheme
              </button>
            </div>
          </div>
        </div>

        {/* Supabase-style Table */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="border border-[#e2e8f0] rounded-lg bg-white overflow-hidden shadow-2xs flex flex-col flex-1">
            {/* Header */}
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
                  Chit Schemes ({filteredSchemes.length})
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
                public.gold_saving_schemes • 12 columns
              </div>
            </div>

            {/* Table Content: Data Tab */}
            {activeTab === 'data' && (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-neutral-600 font-mono text-[11px]">
                      <th className="w-10 px-3 py-2 border-r border-[#e5e7eb] text-center">
                        <input type="checkbox" className="rounded border-neutral-300 text-emerald-600 focus:ring-0" />
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">scheme_account_no</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">customer</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">plan</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">monthly_emi</span>
                        <span className="text-neutral-400 font-normal text-[10px] ml-1">inr</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">progress</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">accrued_gold</span>
                        <span className="text-neutral-400 font-normal text-[10px] ml-1">g</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">next_due_date</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">status</span>
                      </th>
                      <th className="px-3.5 py-2 font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {filteredSchemes.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="px-3 py-2 text-center border-r border-[#e5e7eb]">
                          <input type="checkbox" className="rounded border-neutral-300 text-emerald-600 focus:ring-0" />
                        </td>
                        <td className="px-3.5 py-2 font-mono text-emerald-700 font-medium border-r border-[#e5e7eb] whitespace-nowrap">
                          {row.scheme_account_no}
                          {row.auto_debit && (
                            <span className="text-[10px] text-neutral-400 block font-normal">e-Mandate Active</span>
                          )}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <div className="font-medium text-neutral-900">{row.customer_name}</div>
                          <span className="text-[10px] text-neutral-400 font-mono block">{row.phone}</span>
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-800">
                          {row.scheme_name}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-right font-medium text-neutral-900 border-r border-[#e5e7eb] whitespace-nowrap">
                          ₹ {row.monthly_installment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap min-w-[120px]">
                          <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                            <span>{row.months_paid}/{row.total_months} mo</span>
                            <span className="text-neutral-400 font-normal">
                              {Math.round((row.months_paid / row.total_months) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-amber-500 h-1.5 rounded-full"
                              style={{ width: `${(row.months_paid / row.total_months) * 100}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-3.5 py-2 font-mono text-right text-amber-700 font-medium border-r border-[#e5e7eb] whitespace-nowrap">
                          {row.accrued_gold_weight_g.toFixed(3)} g
                        </td>
                        <td className="px-3.5 py-2 font-mono text-neutral-600 border-r border-[#e5e7eb] whitespace-nowrap">
                          {row.next_due_date}
                        </td>
                        <td className="px-3.5 py-2 text-center border-r border-[#e5e7eb] whitespace-nowrap">
                          {row.status === 'ACTIVE' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ACTIVE
                            </span>
                          )}
                          {row.status === 'MATURED' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono bg-amber-50 text-amber-700 border border-amber-200">
                              MATURED
                            </span>
                          )}
                          {row.status === 'CLOSED' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono bg-neutral-100 text-neutral-600 border border-neutral-300">
                              CLOSED
                            </span>
                          )}
                        </td>
                        <td className="px-3.5 py-2 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedSchemeForPassbook(row)}
                              className="p-1 hover:bg-neutral-100 rounded text-neutral-600 hover:text-emerald-700 transition-colors"
                              title="Interactive Passbook"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {row.status === 'ACTIVE' && (
                              <button
                                onClick={() => setSelectedSchemeForPay(row)}
                                className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                              >
                                Pay EMI
                              </button>
                            )}
                            {row.status === 'MATURED' && (
                              <button
                                onClick={() => setSelectedSchemeForRedeem(row)}
                                className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-2xs"
                              >
                                Redeem
                              </button>
                            )}
                          </div>
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.gold_saving_schemes (
                  <br />
                  &nbsp;&nbsp;id <span className="text-blue-300">uuid</span> PRIMARY KEY DEFAULT gen_random_uuid(),
                  <br />
                  &nbsp;&nbsp;scheme_account_no <span className="text-blue-300">varchar(50)</span> NOT NULL UNIQUE,
                  <br />
                  &nbsp;&nbsp;customer_name <span className="text-blue-300">varchar(255)</span> NOT NULL,
                  <br />
                  &nbsp;&nbsp;phone <span className="text-blue-300">varchar(20)</span> NOT NULL,
                  <br />
                  &nbsp;&nbsp;scheme_name <span className="text-blue-300">varchar(100)</span> NOT NULL,
                  <br />
                  &nbsp;&nbsp;monthly_installment <span className="text-blue-300">numeric(10,2)</span> NOT NULL,
                  <br />
                  &nbsp;&nbsp;months_completed <span className="text-blue-300">integer</span> DEFAULT 0,
                  <br />
                  &nbsp;&nbsp;accrued_gold_weight_g <span className="text-blue-300">numeric(10,3)</span> DEFAULT 0.000,
                  <br />
                  &nbsp;&nbsp;auto_debit <span className="text-blue-300">boolean</span> DEFAULT false,
                  <br />
                  &nbsp;&nbsp;nominee_name <span className="text-blue-300">varchar(255)</span>,
                  <br />
                  &nbsp;&nbsp;status <span className="text-blue-300">varchar(20)</span> DEFAULT &apos;ACTIVE&apos;,
                  <br />
                  &nbsp;&nbsp;created_at <span className="text-blue-300">timestamptz</span> DEFAULT now()
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enroll New Scheme Drawer */}
      {isEnrollOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-[#e2e8f0] animate-in slide-in-from-right duration-200">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div>
                <h3 className="text-sm font-medium text-neutral-900">Enroll New Gold Savings Scheme</h3>
                <p className="text-[11px] text-neutral-500">Suvarna Nidhi 11-month gold chit fund with bonus month</p>
              </div>
              <button
                onClick={() => setIsEnrollOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-xs">
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Scheme Plan Selection
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Select Plan</label>
                  <select
                    value={formPlan}
                    onChange={(e) => setFormPlan(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                  >
                    <option value="11+1 Suvarna Nidhi">11+1 Suvarna Nidhi (Pay 11 Months + 1 Month Bonus)</option>
                    <option value="10-Month Bullion Weight Accumulator">10-Month Bullion Weight Accumulator (0% Making Charges)</option>
                    <option value="Festive Golden Scheme (5 Months)">Festive Golden Scheme (5 Months + 1g Gold Coin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Monthly Installment (₹)</label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {['2000', '5000', '10000', '25000'].map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => setFormEmiAmount(amt)}
                        className={`py-1 rounded text-xs font-mono font-medium border transition-colors ${
                          formEmiAmount === amt
                            ? 'bg-amber-50 border-amber-500 text-amber-800'
                            : 'bg-white border-[#e2e8f0] text-neutral-700'
                        }`}
                      >
                        ₹{parseInt(amt).toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={formEmiAmount}
                    onChange={(e) => setFormEmiAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white text-neutral-900"
                  />
                </div>
              </div>

              {/* Patron & Nominee */}
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Patron & Nominee Details
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sridevi Rao"
                      value={formCustName}
                      onChange={(e) => setFormCustName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98451 23456"
                      value={formCustPhone}
                      onChange={(e) => setFormCustPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Nominee Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. K. Rajesh Rao"
                      value={formNomineeName}
                      onChange={(e) => setFormNomineeName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Relationship</label>
                    <select
                      value={formNomineeRel}
                      onChange={(e) => setFormNomineeRel(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                    >
                      <option value="Spouse">Spouse</option>
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                      <option value="Parent">Parent</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-[#e2e8f0]">
                  <div>
                    <span className="text-xs font-medium text-neutral-900">Enable UPI e-Mandate / Auto-Debit</span>
                    <p className="text-[11px] text-neutral-500">Automatic monthly debit from patron bank account</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formAutoDebit}
                    onChange={(e) => setFormAutoDebit(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-emerald-600 focus:ring-0"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEnrollOpen(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" /> Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Passbook Viewer Modal */}
      {selectedSchemeForPassbook && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-amber-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-amber-100 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-600" />
                <div>
                  <h3 className="text-sm font-medium text-neutral-900">
                    Official Gold Scheme Passbook: {selectedSchemeForPassbook.scheme_account_no}
                  </h3>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {selectedSchemeForPassbook.customer_name} • {selectedSchemeForPassbook.scheme_name}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedSchemeForPassbook(null)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs custom-scrollbar">
              {/* Passbook summary card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Total Cash Paid</span>
                  <span className="text-sm font-mono font-medium text-neutral-900 mt-0.5 block">
                    ₹ {selectedSchemeForPassbook.total_paid_amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Accrued Gold</span>
                  <span className="text-sm font-mono font-medium text-amber-700 mt-0.5 block">
                    {selectedSchemeForPassbook.accrued_gold_weight_g.toFixed(3)} g
                  </span>
                </div>
                <div className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Months Paid</span>
                  <span className="text-sm font-mono font-medium text-neutral-900 mt-0.5 block">
                    {selectedSchemeForPassbook.months_paid} of {selectedSchemeForPassbook.total_months}
                  </span>
                </div>
                <div className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Jeweller Bonus</span>
                  <span className="text-sm font-medium text-emerald-700 mt-0.5 block">
                    +1 Month Free
                  </span>
                </div>
              </div>

              {/* Installment Schedule Table */}
              <div className="border border-[#e2e8f0] rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#f8fafc] border-b border-[#e2e8f0] text-neutral-600 font-mono text-[11px]">
                    <tr>
                      <th className="p-2 border-r border-[#e5e7eb] text-center">Month #</th>
                      <th className="p-2 border-r border-[#e5e7eb]">Due Date</th>
                      <th className="p-2 border-r border-[#e5e7eb] text-right">Amount (₹)</th>
                      <th className="p-2 border-r border-[#e5e7eb] text-right">Gold Rate (₹/g)</th>
                      <th className="p-2 border-r border-[#e5e7eb] text-right">Grams Accrued</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9] font-mono text-[11px]">
                    {Array.from({ length: selectedSchemeForPassbook.total_months }).map((_, i) => {
                      const monthNum = i + 1;
                      const isPaid = monthNum <= selectedSchemeForPassbook.months_paid;
                      const dateObj = new Date(selectedSchemeForPassbook.start_date);
                      dateObj.setMonth(dateObj.getMonth() + i);
                      const dueStr = dateObj.toISOString().split('T')[0];
                      const approxRate = 7750 + i * 15;
                      const grams = +(selectedSchemeForPassbook.monthly_installment / approxRate).toFixed(3);

                      return (
                        <tr key={monthNum} className={isPaid ? 'bg-white' : 'bg-neutral-50/50 text-neutral-400'}>
                          <td className="p-2 border-r border-[#e5e7eb] text-center font-medium">{monthNum}</td>
                          <td className="p-2 border-r border-[#e5e7eb]">{dueStr}</td>
                          <td className="p-2 border-r border-[#e5e7eb] text-right">
                            ₹ {selectedSchemeForPassbook.monthly_installment.toLocaleString('en-IN')}
                          </td>
                          <td className="p-2 border-r border-[#e5e7eb] text-right">
                            {isPaid ? `₹ ${approxRate}` : '—'}
                          </td>
                          <td className="p-2 border-r border-[#e5e7eb] text-right font-medium text-amber-700">
                            {isPaid ? `${grams} g` : '—'}
                          </td>
                          <td className="p-2 text-center">
                            {isPaid ? (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                PAID
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[10px] text-neutral-400 border border-neutral-200">
                                PENDING
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-3 rounded bg-amber-50/70 border border-amber-200 text-amber-900 text-xs">
                <span className="font-medium">Maturity Benefit:</span> {selectedSchemeForPassbook.benefit_type}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Passbook
                </button>
                <button
                  onClick={() => setSelectedSchemeForPassbook(null)}
                  className="px-4 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pay EMI Modal */}
      {selectedSchemeForPay && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-2xl border border-[#e2e8f0] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">Pay Monthly Installment</h3>
              </div>
              <button
                onClick={() => setSelectedSchemeForPay(null)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Account:</span>
                  <span className="font-mono text-neutral-900 font-medium">{selectedSchemeForPay.scheme_account_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Patron:</span>
                  <span className="font-medium text-neutral-900">{selectedSchemeForPay.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Installment #:</span>
                  <span className="font-mono text-neutral-900">{selectedSchemeForPay.months_paid + 1} of {selectedSchemeForPay.total_months}</span>
                </div>
                <div className="flex justify-between border-t border-[#e2e8f0] pt-1.5 text-sm">
                  <span className="font-medium text-neutral-800">Amount Due:</span>
                  <span className="font-mono font-medium text-emerald-700">
                    ₹ {selectedSchemeForPay.monthly_installment.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setSelectedSchemeForPay(null)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePayInstallment(selectedSchemeForPay)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" /> Record Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Redeem Scheme Modal */}
      {selectedSchemeForRedeem && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-2xl border border-amber-200 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-amber-100 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-medium text-neutral-900">Redeem Matured Scheme</h3>
              </div>
              <button
                onClick={() => setSelectedSchemeForRedeem(null)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-neutral-700 leading-relaxed">
                Scheme account <span className="font-mono font-medium text-neutral-900">{selectedSchemeForRedeem.scheme_account_no}</span> for {selectedSchemeForRedeem.customer_name} has successfully matured with all {selectedSchemeForRedeem.total_months} installments paid.
              </p>

              <div className="p-3 bg-amber-50/50 border border-amber-200 rounded text-xs space-y-1 font-mono">
                <div>Total Paid: ₹{selectedSchemeForRedeem.total_paid_amount.toLocaleString('en-IN')}</div>
                <div>Accrued Pure Gold: {selectedSchemeForRedeem.accrued_gold_weight_g.toFixed(3)} g</div>
                <div className="text-emerald-700 font-medium">Making Charge Waiver: 100% applied</div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setSelectedSchemeForRedeem(null)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRedeemScheme(selectedSchemeForRedeem)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" /> Convert to Retail Bill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
