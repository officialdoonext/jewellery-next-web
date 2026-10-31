'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  User,
  Crown,
  Heart,
  Sparkles,
  Gem,
  Calendar,
  Gift,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  Coins,
  MessageCircle,
  FileText,
  Printer,
  Plus,
  X,
  Edit2,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Scale,
  Smile,
  Send,
  AlertCircle,
  BadgeCheck,
} from 'lucide-react';

interface PatronProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  vipTier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';
  memberSince: string;
  totalSpent: number;
  goldBoughtGrams: number;
  activeSchemeCount: number;
  activeSchemeName: string;
  // Sizing & Preferences
  ringSize: string;
  bangleSize: string;
  chainLength: string;
  preferredKarat: string;
  preferredMetal: string;
  gemstoneAffinity: string;
  designTaste: string;
  // Milestones & Family
  weddingAnniversary: string;
  spouseName: string;
  spouseDob: string;
  childrenDetails: string;
  preferredFestivals: string;
  // Notes
  clientNotes: string[];
  // Transactions
  recentPurchases: {
    billNo: string;
    date: string;
    itemDesc: string;
    grossWt: number;
    amount: number;
    points: number;
  }[];
  // Active Scheme details
  schemeDetails: {
    accountNo: string;
    plan: string;
    monthlyEmi: number;
    paidMonths: number;
    totalMonths: number;
    accruedGoldGrams: number;
    nextDue: string;
  };
}

const PATRON_PROFILES: Record<string, PatronProfile> = {
  'sridevi-rao': {
    id: '44556677-d4e5-f6a1-b2c3-778899001122',
    name: 'Sridevi Rao',
    phone: '+91 98451 23456',
    email: 'sridevi.rao@jubileehills.com',
    city: 'Hyderabad',
    address: 'Plot 42, Road No. 10, Jubilee Hills, Hyderabad 500033',
    vipTier: 'PLATINUM',
    memberSince: 'Oct 2021',
    totalSpent: 1845000.0,
    goldBoughtGrams: 234.5,
    activeSchemeCount: 1,
    activeSchemeName: '11+1 Suvarna Nidhi (SCH-2026-901)',
    ringSize: '14 Indian / 6.5 US',
    bangleSize: '2-6 / 2.375" (60.3mm)',
    chainLength: '18 - 20 inches',
    preferredKarat: '22K 916 Hallmark & 18K Diamonds',
    preferredMetal: 'Yellow Gold & Rose Gold',
    gemstoneAffinity: 'Zambian Emerald & VVS/EF Diamonds',
    designTaste: 'Antique Temple Jewellery & Lightweight Fusion Polki',
    weddingAnniversary: 'Nov 28, 2014 (12th Anniversary)',
    spouseName: 'K. Rajesh Rao',
    spouseDob: 'Dec 12, 1980',
    childrenDetails: 'Ananya Rao (Daughter, DOB: Mar 14, 2015 - Age 11)',
    preferredFestivals: 'Dhanteras, Akshaya Tritiya, Varalakshmi Vratham',
    clientNotes: [
      'Prefers antique matte finishing over glossy rhodium polish.',
      'Always request custom CAD preview before casting stone settings.',
      'Prefers Saturday morning showroom visits with private lounge booking.',
    ],
    recentPurchases: [
      {
        billNo: 'POS-2026-0812',
        date: '2026-08-15',
        itemDesc: '22K Antique Temple Haar Set with Uncut Emeralds',
        grossWt: 48.2,
        amount: 345000,
        points: 480,
      },
      {
        billNo: 'POS-2026-0610',
        date: '2026-05-10',
        itemDesc: '22K Floral Kada Pair with Screw Lock',
        grossWt: 38.5,
        amount: 275000,
        points: 385,
      },
      {
        billNo: 'POS-2026-0199',
        date: '2026-02-14',
        itemDesc: '18K VVS Diamond Tennis Bracelet (3.20 ct)',
        grossWt: 16.4,
        amount: 420000,
        points: 600,
      },
    ],
    schemeDetails: {
      accountNo: 'SCH-2026-901',
      plan: '11+1 Suvarna Nidhi',
      monthlyEmi: 25000,
      paidMonths: 8,
      totalMonths: 11,
      accruedGoldGrams: 25.475,
      nextDue: '2026-11-10',
    },
  },
  'venkat-raman': {
    id: '44556677-d4e5-f6a1-b2c3-778899001123',
    name: 'Venkat Raman',
    phone: '+91 97412 89012',
    email: 'venkat.raman@indiranagar.org',
    city: 'Bangalore',
    address: '74, 12th Main, Indiranagar, Bangalore 560038',
    vipTier: 'GOLD',
    memberSince: 'Mar 2023',
    totalSpent: 620000.0,
    goldBoughtGrams: 78.9,
    activeSchemeCount: 1,
    activeSchemeName: '10-Month Bullion Weight Accumulator (SCH-2026-844)',
    ringSize: '22 Indian / 10 US',
    bangleSize: '2-8 / 2.50" (63.5mm)',
    chainLength: '22 inches (Thick Cuban / Rudraksha chain)',
    preferredKarat: '22K 916 Hallmark Bullion',
    preferredMetal: 'Yellow Gold (999 & 916)',
    gemstoneAffinity: 'Yellow Sapphire (Pukhraj) & Ruby',
    designTaste: 'Solid Traditional Chains and Bullion Coins',
    weddingAnniversary: 'May 19, 2008 (18th Anniversary)',
    spouseName: 'Gayatri Raman',
    spouseDob: 'Aug 24, 1982',
    childrenDetails: 'Aditya Raman (Son, DOB: Oct 02, 2011)',
    preferredFestivals: 'Diwali Bullion Purchase, Akshaya Tritiya',
    clientNotes: [
      'Invests systematically in 10g 24K bullion bars every Dhanteras.',
      'Prefers delivery in tamper-evident CertiCard packaging.',
    ],
    recentPurchases: [
      {
        billNo: 'POS-2026-0774',
        date: '2026-07-22',
        itemDesc: '24K MMTC-PAMP Lotus Gold Bar 20g',
        grossWt: 20.0,
        amount: 161800,
        points: 200,
      },
      {
        billNo: 'POS-2026-0412',
        date: '2026-04-18',
        itemDesc: '22K Men Solid Navaratna Ring',
        grossWt: 12.8,
        amount: 98000,
        points: 130,
      },
    ],
    schemeDetails: {
      accountNo: 'SCH-2026-844',
      plan: '10-Month Weight Accumulator',
      monthlyEmi: 15000,
      paidMonths: 5,
      totalMonths: 10,
      accruedGoldGrams: 9.554,
      nextDue: '2026-11-05',
    },
  },
  'meera-nambiar': {
    id: '44556677-d4e5-f6a1-b2c3-778899001124',
    name: 'Meera Nambiar',
    phone: '+91 94471 67890',
    email: 'meera.nambiar@kochi.in',
    city: 'Kochi',
    address: 'B-402, Skyline Oasis, Panampilly Nagar, Kochi 682036',
    vipTier: 'GOLD',
    memberSince: 'Jan 2024',
    totalSpent: 542000.0,
    goldBoughtGrams: 69.2,
    activeSchemeCount: 0,
    activeSchemeName: 'None',
    ringSize: '12 Indian / 5.5 US',
    bangleSize: '2-4 / 2.25" (57.2mm)',
    chainLength: '16 inches (Choker length)',
    preferredKarat: '22K Traditional Kerala Kasu Mala',
    preferredMetal: 'Yellow Gold (High Polish)',
    gemstoneAffinity: 'Natural Rubies & Basra Pearls',
    designTaste: 'Traditional Kerala Bridal (Mulla Mottu Mala & Palakka Mala)',
    weddingAnniversary: 'Jan 24, 2020 (6th Anniversary)',
    spouseName: 'Vivek Nambiar',
    spouseDob: 'Feb 15, 1990',
    childrenDetails: 'Diya (Daughter, DOB: May 04, 2022)',
    preferredFestivals: 'Onam, Vishu Gold Purchases',
    clientNotes: [
      'Loves Kerala heritage designs with green palakka glass and rubies.',
      'Requested notification whenever new temple collections arrive from Thrissur.',
    ],
    recentPurchases: [
      {
        billNo: 'POS-2026-0901',
        date: '2026-09-08',
        itemDesc: '22K Kerala Palakka Traditional Choker',
        grossWt: 32.4,
        amount: 254000,
        points: 320,
      },
    ],
    schemeDetails: {
      accountNo: 'N/A',
      plan: 'No Active Scheme',
      monthlyEmi: 0,
      paidMonths: 0,
      totalMonths: 0,
      accruedGoldGrams: 0,
      nextDue: 'None',
    },
  },
};

export function CustomersProfileView() {
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [selectedPatronKey, setSelectedPatronKey] = useState<string>('sridevi-rao');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isWhatsAppComposerOpen, setIsWhatsAppComposerOpen] = useState(false);
  const [isStatementOpen, setIsStatementOpen] = useState(false);
  const [newNoteInput, setNewNoteInput] = useState('');
  const [waGreetingTemplate, setWaGreetingTemplate] = useState('ANNIVERSARY');

  const currentPatron = PATRON_PROFILES[selectedPatronKey] || PATRON_PROFILES['sridevi-rao'];

  // Form states for Edit
  const [editRingSize, setEditRingSize] = useState(currentPatron.ringSize);
  const [editBangleSize, setEditBangleSize] = useState(currentPatron.bangleSize);
  const [editPreferredKarat, setEditPreferredKarat] = useState(currentPatron.preferredKarat);
  const [editGemstones, setEditGemstones] = useState(currentPatron.gemstoneAffinity);
  const [editAnniversary, setEditAnniversary] = useState(currentPatron.weddingAnniversary);

  const handleSwitchPatron = (key: string) => {
    setSelectedPatronKey(key);
    const p = PATRON_PROFILES[key];
    if (p) {
      setEditRingSize(p.ringSize);
      setEditBangleSize(p.bangleSize);
      setEditPreferredKarat(p.preferredKarat);
      setEditGemstones(p.gemstoneAffinity);
      setEditAnniversary(p.weddingAnniversary);
    }
  };

  const handleAddNote = () => {
    if (!newNoteInput.trim()) return;
    currentPatron.clientNotes.unshift(newNoteInput.trim());
    setNewNoteInput('');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="customers_360_profile" />
      <ActionToolbar
        filterPlaceholder="Search customer profile by name, mobile, or PAN..."
        insertLabel="Edit Preferences"
        onInsertClick={() => setIsEditOpen(true)}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* Patron Selector Header */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-medium text-lg border border-purple-200">
              {currentPatron.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-medium text-neutral-900">{currentPatron.name}</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                  <Crown className="w-3 h-3 text-purple-600" /> {currentPatron.vipTier} VIP
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">Member since {currentPatron.memberSince}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 mt-1 font-mono">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-neutral-400" /> {currentPatron.phone}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-neutral-400" /> {currentPatron.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-neutral-400" /> {currentPatron.city}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Patron Switcher Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 font-medium">Select Patron:</span>
            <select
              value={selectedPatronKey}
              onChange={(e) => handleSwitchPatron(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-[#e2e8f0] rounded-md text-neutral-800 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
            >
              <option value="sridevi-rao">Sridevi Rao (VIP Platinum)</option>
              <option value="venkat-raman">Venkat Raman (Gold)</option>
              <option value="meera-nambiar">Meera Nambiar (Bridal Gold)</option>
            </select>

            <button
              onClick={() => setIsEditOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors shadow-2xs cursor-pointer"
            >
              <Edit2 className="w-3 h-3" /> Edit
            </button>
          </div>
        </div>

        {/* 360 Degree Portfolio Cards */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-purple-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Lifetime Purchases</span>
                <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">
                ₹ {(currentPatron.totalSpent / 100000).toFixed(2)} Lakhs
              </div>
              <div className="text-[11px] text-purple-600 mt-1 font-mono">
                ₹ {currentPatron.totalSpent.toLocaleString('en-IN')} Total
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-amber-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Gold Bought Lifetime</span>
                <Coins className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-medium text-amber-700 font-mono">
                {currentPatron.goldBoughtGrams.toFixed(3)} g
              </div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                22K / 24K Hallmarked Weight
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Active Chit Schemes</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700">
                {currentPatron.activeSchemeCount} Active Plan
              </div>
              <div className="text-[11px] text-neutral-500 mt-1 truncate">
                {currentPatron.activeSchemeName}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">KYC Compliance</span>
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700">Verified</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                PAN Linked (No TCS &lt; ₹2L)
              </div>
            </div>
          </div>

          {/* Middle 3 Sections: Sizing & Preferences, Family Milestones, Direct Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Jewellery Sizing & Preferences */}
            <div className="p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] shadow-2xs space-y-3">
              <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Gem className="w-3.5 h-3.5 text-emerald-600" /> Sizing & Preferences
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">Verified Specs</span>
              </div>

              <div className="space-y-2.5 text-xs text-neutral-700">
                <div className="flex items-center justify-between py-1 border-b border-[#e2e8f0]">
                  <span className="text-neutral-500">Ring Size:</span>
                  <span className="font-medium text-neutral-900 font-mono">{currentPatron.ringSize}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#e2e8f0]">
                  <span className="text-neutral-500">Bangle Size:</span>
                  <span className="font-medium text-neutral-900 font-mono">{currentPatron.bangleSize}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#e2e8f0]">
                  <span className="text-neutral-500">Chain Length:</span>
                  <span className="font-medium text-neutral-900">{currentPatron.chainLength}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#e2e8f0]">
                  <span className="text-neutral-500">Preferred Karat:</span>
                  <span className="font-medium text-amber-700">{currentPatron.preferredKarat}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#e2e8f0]">
                  <span className="text-neutral-500">Preferred Metal:</span>
                  <span className="font-medium text-neutral-900">{currentPatron.preferredMetal}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#e2e8f0]">
                  <span className="text-neutral-500">Gemstone Affinity:</span>
                  <span className="font-medium text-emerald-700">{currentPatron.gemstoneAffinity}</span>
                </div>
                <div className="pt-1">
                  <span className="text-[11px] text-neutral-400 block mb-0.5">Design Aesthetic:</span>
                  <p className="text-neutral-800 leading-relaxed text-[11px]">{currentPatron.designTaste}</p>
                </div>
              </div>
            </div>

            {/* Important Milestones & Family */}
            <div className="p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] shadow-2xs space-y-3">
              <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-red-500" /> Milestones & Family
                </span>
                <span className="text-[10px] text-emerald-600 font-mono">Automated SMS Active</span>
              </div>

              <div className="space-y-2.5 text-xs text-neutral-700">
                <div className="p-2.5 rounded bg-amber-50/70 border border-amber-200/60">
                  <div className="flex items-center gap-1.5 text-amber-800 font-medium text-xs mb-0.5">
                    <Gift className="w-3.5 h-3.5 text-amber-600" /> Wedding Anniversary
                  </div>
                  <div className="text-neutral-800 font-mono text-[11px]">{currentPatron.weddingAnniversary}</div>
                  <span className="text-[10px] text-amber-700 mt-0.5 block">Automated 2% celebratory voucher dispatched</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-[#e2e8f0]">
                  <span className="text-neutral-500">Spouse Name:</span>
                  <span className="font-medium text-neutral-900">{currentPatron.spouseName}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#e2e8f0]">
                  <span className="text-neutral-500">Spouse Birthday:</span>
                  <span className="font-mono text-neutral-800">{currentPatron.spouseDob}</span>
                </div>
                <div className="py-1 border-b border-[#e2e8f0]">
                  <span className="text-neutral-500 block mb-0.5">Children:</span>
                  <span className="text-neutral-800 text-[11px]">{currentPatron.childrenDetails}</span>
                </div>
                <div className="pt-1">
                  <span className="text-neutral-500 block mb-0.5">Key Gifting Festivals:</span>
                  <span className="text-emerald-700 text-[11px]">{currentPatron.preferredFestivals}</span>
                </div>
              </div>
            </div>

            {/* Direct Relationship Management & Actions */}
            <div className="p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider flex items-center justify-between mb-3">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Relationship Actions
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">1-Click</span>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setIsWhatsAppComposerOpen(true)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <MessageCircle className="w-3.5 h-3.5" /> Send WhatsApp Greeting
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setIsStatementOpen(true)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium bg-white text-neutral-800 border border-[#e2e8f0] hover:bg-neutral-50 transition-colors shadow-2xs cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-neutral-600" /> Generate Account Statement
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                  </button>

                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium bg-white text-neutral-800 border border-[#e2e8f0] hover:bg-neutral-50 transition-colors shadow-2xs cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Smile className="w-3.5 h-3.5 text-amber-500" /> Schedule VIP Lounge Visit
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                </div>
              </div>

              {/* Client Notes Section */}
              <div className="mt-3 pt-3 border-t border-[#e2e8f0]">
                <span className="text-[11px] font-medium text-neutral-700 mb-1.5 block">Staff Confidential Notes:</span>
                <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar text-[11px]">
                  {currentPatron.clientNotes.map((note, idx) => (
                    <div key={idx} className="p-1.5 bg-white border border-[#e2e8f0] rounded text-neutral-700">
                      • {note}
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="Add quick patron preference note..."
                    value={newNoteInput}
                    onChange={(e) => setNewNoteInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    className="flex-1 px-2.5 py-1 text-xs border border-[#e2e8f0] rounded bg-white text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-2.5 py-1 text-xs font-medium bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Active Chit Scheme Card */}
          {currentPatron.activeSchemeCount > 0 && (
            <div className="p-4 rounded-lg bg-amber-50/40 border border-amber-200/80 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-medium text-neutral-900">
                    Active Gold Savings Scheme: {currentPatron.schemeDetails.plan} ({currentPatron.schemeDetails.accountNo})
                  </span>
                </div>
                <div className="text-xs font-mono text-amber-800">
                  Next Due Date: <span className="font-medium">{currentPatron.schemeDetails.nextDue}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                <div className="p-2.5 bg-white rounded border border-amber-200/60">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Monthly Installment</span>
                  <span className="font-medium text-neutral-900 font-mono mt-0.5 block">
                    ₹ {currentPatron.schemeDetails.monthlyEmi.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded border border-amber-200/60">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Progress</span>
                  <span className="font-medium text-neutral-900 font-mono mt-0.5 block">
                    {currentPatron.schemeDetails.paidMonths} of {currentPatron.schemeDetails.totalMonths} Months Paid
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded border border-amber-200/60">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Accrued Pure Gold</span>
                  <span className="font-medium text-amber-700 font-mono mt-0.5 block">
                    {currentPatron.schemeDetails.accruedGoldGrams.toFixed(3)} g
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded border border-amber-200/60">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Maturity Benefit</span>
                  <span className="font-medium text-emerald-700 mt-0.5 block">
                    100% Making Charge Waiver
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-amber-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(currentPatron.schemeDetails.paidMonths / currentPatron.schemeDetails.totalMonths) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Recent Invoices & Purchases Mini Table */}
          <div className="border border-[#e2e8f0] rounded-lg bg-white overflow-hidden shadow-2xs">
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
                  Recent Invoices ({currentPatron.recentPurchases.length})
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
                public.customer_profiles • 10 columns
              </div>
            </div>

            {activeTab === 'data' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-neutral-600 font-mono text-[11px]">
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium">Invoice #</th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium">Date</th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium">Jewellery Purchased</th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium text-right">Gross Wt (g)</th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium text-right">Amount (₹)</th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium text-center">Reward Pts</th>
                      <th className="px-3.5 py-2 font-medium text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {currentPatron.recentPurchases.map((rec) => (
                      <tr key={rec.billNo} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="px-3.5 py-2 font-mono text-emerald-700 font-medium border-r border-[#e5e7eb] whitespace-nowrap">
                          {rec.billNo}
                        </td>
                        <td className="px-3.5 py-2 text-neutral-600 border-r border-[#e5e7eb] whitespace-nowrap font-mono">
                          {rec.date}
                        </td>
                        <td className="px-3.5 py-2 text-neutral-800 border-r border-[#e5e7eb]">
                          {rec.itemDesc}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-right text-neutral-800 border-r border-[#e5e7eb] whitespace-nowrap">
                          {rec.grossWt.toFixed(3)} g
                        </td>
                        <td className="px-3.5 py-2 font-mono text-right font-medium text-neutral-900 border-r border-[#e5e7eb] whitespace-nowrap">
                          ₹ {rec.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-center text-purple-700 border-r border-[#e5e7eb] whitespace-nowrap">
                          +{rec.points}
                        </td>
                        <td className="px-3.5 py-2 text-center whitespace-nowrap">
                          <button
                            onClick={() => setIsStatementOpen(true)}
                            className="p-1 hover:bg-neutral-100 rounded text-neutral-600 hover:text-emerald-700 transition-colors cursor-pointer"
                            title="View Invoice Copy"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 overflow-x-auto font-mono text-xs text-neutral-800 bg-[#fbfbfb] w-full">
                <div className="bg-neutral-900 text-neutral-100 p-4 rounded-md overflow-x-auto shadow-inner text-[12px] leading-relaxed w-full">
                  <span className="text-emerald-400">CREATE TABLE</span> public.customer_profiles (
                  <br />
                  &nbsp;&nbsp;id <span className="text-blue-300">uuid</span> PRIMARY KEY DEFAULT gen_random_uuid(),
                  <br />
                  &nbsp;&nbsp;customer_id <span className="text-blue-300">uuid</span> REFERENCES public.customers_master(id),
                  <br />
                  &nbsp;&nbsp;ring_size <span className="text-blue-300">varchar(50)</span>,
                  <br />
                  &nbsp;&nbsp;bangle_size <span className="text-blue-300">varchar(50)</span>,
                  <br />
                  &nbsp;&nbsp;chain_length <span className="text-blue-300">varchar(50)</span>,
                  <br />
                  &nbsp;&nbsp;preferred_karat <span className="text-blue-300">varchar(50)</span>,
                  <br />
                  &nbsp;&nbsp;gemstone_affinity <span className="text-blue-300">text</span>,
                  <br />
                  &nbsp;&nbsp;wedding_anniversary <span className="text-blue-300">date</span>,
                  <br />
                  &nbsp;&nbsp;spouse_name <span className="text-blue-300">varchar(255)</span>,
                  <br />
                  &nbsp;&nbsp;confidential_notes <span className="text-blue-300">text[]</span>,
                  <br />
                  &nbsp;&nbsp;updated_at <span className="text-blue-300">timestamptz</span> DEFAULT now()
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Preferences Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl border border-[#e2e8f0] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div>
                <h3 className="text-sm font-medium text-neutral-900">Edit Preferences: {currentPatron.name}</h3>
                <p className="text-[11px] text-neutral-500">Update sizing, karat affinity, and milestone dates</p>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Ring Size</label>
                  <input
                    type="text"
                    value={editRingSize}
                    onChange={(e) => setEditRingSize(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Bangle Size</label>
                  <input
                    type="text"
                    value={editBangleSize}
                    onChange={(e) => setEditBangleSize(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Preferred Karat</label>
                <input
                  type="text"
                  value={editPreferredKarat}
                  onChange={(e) => setEditPreferredKarat(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Gemstone Affinity</label>
                <input
                  type="text"
                  value={editGemstones}
                  onChange={(e) => setEditGemstones(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Anniversary</label>
                <input
                  type="text"
                  value={editAnniversary}
                  onChange={(e) => setEditAnniversary(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    currentPatron.ringSize = editRingSize;
                    currentPatron.bangleSize = editBangleSize;
                    currentPatron.preferredKarat = editPreferredKarat;
                    currentPatron.gemstoneAffinity = editGemstones;
                    currentPatron.weddingAnniversary = editAnniversary;
                    setIsEditOpen(false);
                  }}
                  className="px-4 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Greeting Composer Modal */}
      {isWhatsAppComposerOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl border border-[#e2e8f0] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">Send WhatsApp Greeting</h3>
              </div>
              <button
                onClick={() => setIsWhatsAppComposerOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Select Occasion Template</label>
                <select
                  value={waGreetingTemplate}
                  onChange={(e) => setWaGreetingTemplate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white text-neutral-800"
                >
                  <option value="ANNIVERSARY">Wedding Anniversary Wishes (+ 2% Voucher)</option>
                  <option value="FESTIVE">Dhanteras & Akshaya Tritiya Preview Invitation</option>
                  <option value="VIP_CLEANING">Complimentary Ultrasonic Jewellery Steam Cleaning</option>
                  <option value="NEW_ARRIVAL">Exclusive New Temple & Polki Arrival Alert</option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200/60 text-neutral-800 font-mono text-[11px] leading-relaxed">
                {waGreetingTemplate === 'ANNIVERSARY' && (
                  <>
                    Dear {currentPatron.name}, wishing you and {currentPatron.spouseName} a magnificent Wedding Anniversary! As our esteemed {currentPatron.vipTier} patron, enjoy an exclusive 2% celebratory discount and double reward points on your next visit. Valid through end of month!
                  </>
                )}
                {waGreetingTemplate === 'FESTIVE' && (
                  <>
                    Namaste {currentPatron.name}! May Goddess Lakshmi bless you with eternal prosperity. We cordially invite you to our private preview lounge for Dhanteras handcrafted gold & polki collection from 10 AM to 8 PM.
                  </>
                )}
                {waGreetingTemplate === 'VIP_CLEANING' && (
                  <>
                    Dear {currentPatron.name}, your complimentary VIP ultrasonic jewellery steam cleaning & prong security check is available anytime this week at our showroom. We look forward to serving you!
                  </>
                )}
                {waGreetingTemplate === 'NEW_ARRIVAL' && (
                  <>
                    Exclusive preview for {currentPatron.name}: Fresh artisan 22K temple chokers and uncut emerald polki sets have arrived directly from our master karigars. View photos or reserve your piece.
                  </>
                )}
              </div>

              <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsWhatsAppComposerOpen(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <a
                  href={`https://wa.me/${currentPatron.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Dear ${currentPatron.name}, greetings from Jewellery Next! Wishing you a very Happy Anniversary and abundant prosperity.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" /> Open WhatsApp Web
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Statement Modal */}
      {isStatementOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-lg shadow-2xl border border-[#e2e8f0] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-neutral-700" />
                <h3 className="text-sm font-medium text-neutral-900">Patron Lifetime Statement</h3>
              </div>
              <button
                onClick={() => setIsStatementOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="border border-[#e2e8f0] rounded p-3 bg-[#fafafa]">
                <div className="font-medium text-neutral-900 text-sm mb-1">{currentPatron.name}</div>
                <div className="text-neutral-500 font-mono text-[11px]">{currentPatron.phone} • {currentPatron.address}</div>
                <div className="mt-2 flex gap-4 text-neutral-700 text-xs font-mono">
                  <span>Lifetime Spend: <span className="font-medium text-neutral-900">₹ {currentPatron.totalSpent.toLocaleString('en-IN')}</span></span>
                  <span>Pure Gold: <span className="font-medium text-neutral-900">{currentPatron.goldBoughtGrams.toFixed(3)} g</span></span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-medium text-neutral-700">Invoices on Record</div>
                {currentPatron.recentPurchases.map((inv) => (
                  <div key={inv.billNo} className="p-2 border border-[#e2e8f0] rounded flex items-center justify-between bg-white text-xs">
                    <div>
                      <span className="font-mono text-emerald-700 font-medium">{inv.billNo}</span>
                      <span className="text-neutral-500 text-[11px] ml-2">({inv.date})</span>
                      <div className="text-neutral-700 text-[11px]">{inv.itemDesc}</div>
                    </div>
                    <div className="text-right font-mono font-medium text-neutral-900">
                      ₹ {inv.amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-end gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Statement
                </button>
                <button
                  onClick={() => setIsStatementOpen(false)}
                  className="px-4 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs"
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
