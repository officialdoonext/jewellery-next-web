'use client';

import React, { useState, useMemo } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Crown,
  Sparkles,
  Gift,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Plus,
  X,
  Check,
  Sliders,
  Percent,
  TrendingUp,
  Award,
  Zap,
  ArrowRight,
  Calculator,
  QrCode,
  FileText,
} from 'lucide-react';

interface LoyaltyAccountRecord {
  id: string;
  member_id: string;
  customer_name: string;
  phone: string;
  loyalty_tier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';
  lifetime_points: number;
  points_redeemed: number;
  current_points: number;
  redeemable_value: number;
  last_active_date: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const INITIAL_LOYALTY: LoyaltyAccountRecord[] = [
  {
    id: '99001122-c3d4-e5f6-a1b2-223344556677',
    member_id: 'LYT-8821',
    customer_name: 'Sridevi Rao',
    phone: '+91 98451 23456',
    loyalty_tier: 'PLATINUM',
    lifetime_points: 4920,
    points_redeemed: 1500,
    current_points: 3420,
    redeemable_value: 1710.0,
    last_active_date: '2026-10-18',
    status: 'ACTIVE',
  },
  {
    id: '99001122-c3d4-e5f6-a1b2-223344556678',
    member_id: 'LYT-8822',
    customer_name: 'Dr. Mohan Krishna',
    phone: '+91 94401 55667',
    loyalty_tier: 'PLATINUM',
    lifetime_points: 3840,
    points_redeemed: 1000,
    current_points: 2840,
    redeemable_value: 1420.0,
    last_active_date: '2026-10-12',
    status: 'ACTIVE',
  },
  {
    id: '99001122-c3d4-e5f6-a1b2-223344556679',
    member_id: 'LYT-8823',
    customer_name: 'Venkat Raman',
    phone: '+91 97412 89012',
    loyalty_tier: 'GOLD',
    lifetime_points: 2240,
    points_redeemed: 1000,
    current_points: 1240,
    redeemable_value: 620.0,
    last_active_date: '2026-10-25',
    status: 'ACTIVE',
  },
  {
    id: '99001122-c3d4-e5f6-a1b2-223344556680',
    member_id: 'LYT-8824',
    customer_name: 'Meera Nambiar',
    phone: '+91 94471 67890',
    loyalty_tier: 'GOLD',
    lifetime_points: 1884,
    points_redeemed: 800,
    current_points: 1084,
    redeemable_value: 542.0,
    last_active_date: '2026-09-30',
    status: 'ACTIVE',
  },
  {
    id: '99001122-c3d4-e5f6-a1b2-223344556681',
    member_id: 'LYT-8825',
    customer_name: 'Ananya Reddy',
    phone: '+91 91008 34567',
    loyalty_tier: 'SILVER',
    lifetime_points: 950,
    points_redeemed: 200,
    current_points: 750,
    redeemable_value: 375.0,
    last_active_date: '2026-10-27',
    status: 'ACTIVE',
  },
  {
    id: '99001122-c3d4-e5f6-a1b2-223344556682',
    member_id: 'LYT-8826',
    customer_name: 'Priya Sharma',
    phone: '+91 98112 33445',
    loyalty_tier: 'SILVER',
    lifetime_points: 620,
    points_redeemed: 0,
    current_points: 620,
    redeemable_value: 310.0,
    last_active_date: '2026-10-15',
    status: 'ACTIVE',
  },
  {
    id: '99001122-c3d4-e5f6-a1b2-223344556683',
    member_id: 'LYT-8827',
    customer_name: 'Lalitha Devi',
    phone: '+91 98865 44321',
    loyalty_tier: 'BRONZE',
    lifetime_points: 380,
    points_redeemed: 0,
    current_points: 380,
    redeemable_value: 190.0,
    last_active_date: '2026-09-14',
    status: 'ACTIVE',
  },
];

export function CustomersLoyaltyRewardsView() {
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [accounts, setAccounts] = useState<LoyaltyAccountRecord[]>(INITIAL_LOYALTY);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE'>('ALL');

  // Interactive Redemption Calculator state
  const [calcSelectedMemberId, setCalcSelectedMemberId] = useState<string>('LYT-8821');
  const [calcRedeemPoints, setCalcRedeemPoints] = useState<number>(1000);
  const [issuedVoucherCode, setIssuedVoucherCode] = useState<string | null>(null);

  // Adjust points modal
  const [isAdjustPointsOpen, setIsAdjustPointsOpen] = useState(false);
  const [adjustCustName, setAdjustCustName] = useState('');
  const [adjustPointsValue, setAdjustPointsValue] = useState('250');
  const [adjustReason, setAdjustReason] = useState('Festive Goodwill Bonus');

  const selectedMember = useMemo(() => {
    return accounts.find((a) => a.member_id === calcSelectedMemberId) || accounts[0];
  }, [accounts, calcSelectedMemberId]);

  const maxRedeemableForSelected = selectedMember ? selectedMember.current_points : 0;
  const currentDiscountRupees = Math.round(calcRedeemPoints * 0.5);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((a) => {
      if (tierFilter !== 'ALL' && a.loyalty_tier !== tierFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const mName = a.customer_name.toLowerCase().includes(q);
        const mPhone = a.phone.toLowerCase().includes(q);
        const mId = a.member_id.toLowerCase().includes(q);
        if (!mName && !mPhone && !mId) return false;
      }
      return true;
    });
  }, [accounts, tierFilter, searchQuery]);

  const handleIssueVoucher = () => {
    const code = `REW-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setIssuedVoucherCode(code);

    // Deduct points
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.member_id === selectedMember.member_id) {
          const newCurrent = acc.current_points - calcRedeemPoints;
          return {
            ...acc,
            current_points: newCurrent,
            points_redeemed: acc.points_redeemed + calcRedeemPoints,
            redeemable_value: newCurrent * 0.5,
          };
        }
        return acc;
      })
    );
  };

  const handleAdjustPointsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pts = parseInt(adjustPointsValue) || 100;
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.customer_name.toLowerCase().includes(adjustCustName.toLowerCase()) || acc.customer_name === 'Sridevi Rao') {
          const newCurrent = acc.current_points + pts;
          return {
            ...acc,
            current_points: newCurrent,
            lifetime_points: acc.lifetime_points + pts,
            redeemable_value: newCurrent * 0.5,
          };
        }
        return acc;
      })
    );
    setIsAdjustPointsOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="customers_loyalty_rewards" />
      <ActionToolbar
        filterPlaceholder="Search loyalty member by name, phone, or membership ID..."
        insertLabel="Adjust Loyalty Points"
        onInsertClick={() => setIsAdjustPointsOpen(true)}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-purple-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Points Issued</span>
                <Award className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">1,84,200 Pts</div>
              <div className="text-[11px] text-purple-600 mt-1 font-mono">
                Lifetime patron engagement
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Points Redeemed</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700 font-mono">68,400 Pts</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                37.1% Redemption conversion rate
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Outstanding Point Value</span>
                <Coins className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-amber-700 font-mono">₹ 57,900</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Redeemable @ ₹0.50 per point
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Active Tier Members</span>
                <Crown className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">1,240 Members</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Across Bronze, Silver, Gold, Platinum
              </div>
            </div>
          </div>

          {/* Loyalty Tier Configuration Matrix (4 Cards) */}
          <div className="mt-4 pt-4 border-t border-[#f1f5f9]">
            <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-purple-600" /> Tier Benefits & Upgrade Criteria
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Bronze */}
              <div className="p-3.5 rounded-lg bg-orange-50/30 border border-orange-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-orange-800 text-xs flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-500" /> Bronze Tier
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">0 - 500 Pts</span>
                </div>
                <div className="space-y-1 text-neutral-700 text-[11px]">
                  <div>• Earn: <span className="font-medium text-neutral-900">1 pt</span> per gram gold bought</div>
                  <div>• Value: <span className="font-medium text-neutral-900">₹0.50</span> per point discount</div>
                  <div>• Perk: Birthday 2% extra discount voucher</div>
                </div>
              </div>

              {/* Silver */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-300 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800 text-xs flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-500" /> Silver Tier
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">501 - 1,500 Pts</span>
                </div>
                <div className="space-y-1 text-neutral-700 text-[11px]">
                  <div>• Earn: <span className="font-medium text-neutral-900">1.5 pts</span> per gram gold</div>
                  <div>• Value: <span className="font-medium text-neutral-900">₹0.50</span> per point discount</div>
                  <div>• Perk: 5% off making charges + free annual steam cleaning</div>
                </div>
              </div>

              {/* Gold */}
              <div className="p-3.5 rounded-lg bg-amber-50/40 border border-amber-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-amber-800 text-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Gold Tier
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">1,501 - 3,000 Pts</span>
                </div>
                <div className="space-y-1 text-neutral-700 text-[11px]">
                  <div>• Earn: <span className="font-medium text-neutral-900">2 pts</span> per gram gold</div>
                  <div>• Value: <span className="font-medium text-neutral-900">₹0.50</span> per point discount</div>
                  <div>• Perk: 10% off making charges + valuation cert</div>
                </div>
              </div>

              {/* Platinum */}
              <div className="p-3.5 rounded-lg bg-purple-50/40 border border-purple-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-purple-900 text-xs flex items-center gap-1">
                    <Crown className="w-3 h-3 text-purple-600" /> Platinum Tier
                  </span>
                  <span className="text-[10px] font-mono text-purple-600">3,001+ Pts</span>
                </div>
                <div className="space-y-1 text-neutral-700 text-[11px]">
                  <div>• Earn: <span className="font-medium text-neutral-900">3 pts</span> per gram gold</div>
                  <div>• Value: <span className="font-medium text-neutral-900">₹0.50</span> per point discount</div>
                  <div>• Perk: 15% off making charges + CAD design & VIP lounge</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Instant Points Redemption Calculator */}
          <div className="mt-4 pt-4 border-t border-[#f1f5f9]">
            <div className="p-4 rounded-lg bg-[#f8fafc] border border-emerald-200/80 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-neutral-900">
                    Counter POS Points Redemption Calculator
                  </span>
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">1 pt = ₹0.50 cash discount</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Select Customer</label>
                  <select
                    value={calcSelectedMemberId}
                    onChange={(e) => {
                      setCalcSelectedMemberId(e.target.value);
                      setIssuedVoucherCode(null);
                    }}
                    className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.member_id} value={acc.member_id}>
                        {acc.customer_name} ({acc.current_points} Pts - {acc.loyalty_tier})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-neutral-700">Points to Redeem</label>
                    <span className="text-[11px] font-mono text-emerald-700">
                      Max: {maxRedeemableForSelected} pts
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={maxRedeemableForSelected}
                    step="50"
                    value={calcRedeemPoints}
                    onChange={(e) => {
                      setCalcRedeemPoints(parseInt(e.target.value) || 0);
                      setIssuedVoucherCode(null);
                    }}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-neutral-400 mt-1">
                    <span>0 pts</span>
                    <span className="font-medium text-neutral-800">{calcRedeemPoints} pts</span>
                    <span>{maxRedeemableForSelected} pts</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-end">
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Discount Value</span>
                    <span className="text-lg font-mono font-medium text-emerald-700">
                      ₹ {currentDiscountRupees.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    onClick={handleIssueVoucher}
                    disabled={calcRedeemPoints <= 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" /> Issue Voucher
                  </button>
                </div>
              </div>

              {issuedVoucherCode && (
                <div className="mt-3 p-3 rounded bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between text-emerald-900 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Voucher <span className="font-mono font-medium">{issuedVoucherCode}</span> generated for{' '}
                      <span className="font-mono font-medium">₹{currentDiscountRupees}</span> discount. Auto-applied to POS terminal.
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-emerald-700">Valid for 24h</span>
                </div>
              )}
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
                  Loyalty Accounts ({filteredAccounts.length})
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
                public.loyalty_accounts • 9 columns
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
                        <span className="text-neutral-800">member_id</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">customer_name</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">phone</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">loyalty_tier</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">lifetime_pts</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">redeemed</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">current_pts</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">cash_value</span>
                        <span className="text-neutral-400 font-normal text-[10px] ml-1">inr</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">last_active</span>
                      </th>
                      <th className="px-3.5 py-2 font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {filteredAccounts.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="px-3 py-2 text-center border-r border-[#e5e7eb]">
                          <input type="checkbox" className="rounded border-neutral-300 text-emerald-600 focus:ring-0" />
                        </td>
                        <td className="px-3.5 py-2 font-mono text-emerald-700 font-medium border-r border-[#e5e7eb] whitespace-nowrap">
                          {row.member_id}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-medium text-neutral-900">
                          {row.customer_name}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-neutral-700 border-r border-[#e5e7eb] whitespace-nowrap">
                          {row.phone}
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
                        <td className="px-3.5 py-2 font-mono text-right text-neutral-600 border-r border-[#e5e7eb] whitespace-nowrap">
                          {row.lifetime_points}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-right text-neutral-500 border-r border-[#e5e7eb] whitespace-nowrap">
                          {row.points_redeemed}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-right font-medium text-purple-700 border-r border-[#e5e7eb] whitespace-nowrap bg-purple-50/20">
                          {row.current_points} pts
                        </td>
                        <td className="px-3.5 py-2 font-mono text-right font-medium text-neutral-900 border-r border-[#e5e7eb] whitespace-nowrap">
                          ₹ {row.redeemable_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-neutral-500 text-center border-r border-[#e5e7eb] whitespace-nowrap">
                          {row.last_active_date}
                        </td>
                        <td className="px-3.5 py-2 text-center whitespace-nowrap">
                          <button
                            onClick={() => {
                              setCalcSelectedMemberId(row.member_id);
                              setCalcRedeemPoints(Math.min(500, row.current_points));
                            }}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                          >
                            Redeem
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.loyalty_accounts (
                  <br />
                  &nbsp;&nbsp;id <span className="text-blue-300">uuid</span> PRIMARY KEY DEFAULT gen_random_uuid(),
                  <br />
                  &nbsp;&nbsp;member_id <span className="text-blue-300">varchar(50)</span> NOT NULL UNIQUE,
                  <br />
                  &nbsp;&nbsp;customer_name <span className="text-blue-300">varchar(255)</span> NOT NULL,
                  <br />
                  &nbsp;&nbsp;phone <span className="text-blue-300">varchar(20)</span> NOT NULL,
                  <br />
                  &nbsp;&nbsp;loyalty_tier <span className="text-blue-300">varchar(20)</span> DEFAULT &apos;BRONZE&apos;,
                  <br />
                  &nbsp;&nbsp;lifetime_points <span className="text-blue-300">integer</span> DEFAULT 0,
                  <br />
                  &nbsp;&nbsp;points_redeemed <span className="text-blue-300">integer</span> DEFAULT 0,
                  <br />
                  &nbsp;&nbsp;current_points <span className="text-blue-300">integer</span> DEFAULT 0,
                  <br />
                  &nbsp;&nbsp;redeemable_value <span className="text-blue-300">numeric(10,2)</span> DEFAULT 0.00,
                  <br />
                  &nbsp;&nbsp;last_active_date <span className="text-blue-300">date</span>
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Adjust Points Modal */}
      {isAdjustPointsOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-2xl border border-[#e2e8f0] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-medium text-neutral-900">Adjust Loyalty Points</h3>
              </div>
              <button
                onClick={() => setIsAdjustPointsOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustPointsSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Customer / Member</label>
                <input
                  type="text"
                  placeholder="e.g. Sridevi Rao"
                  value={adjustCustName}
                  onChange={(e) => setAdjustCustName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Points to Credit / Debit</label>
                <input
                  type="number"
                  value={adjustPointsValue}
                  onChange={(e) => setAdjustPointsValue(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Adjustment Reason</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                />
              </div>

              <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustPointsOpen(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" /> Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
