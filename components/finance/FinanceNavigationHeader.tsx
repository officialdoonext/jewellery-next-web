'use client';

import React from 'react';
import Link from 'next/link';
import {
  Wallet,
  Landmark,
  CreditCard,
  Receipt,
  Users,
  Building2,
  Lock,
  BookOpen,
  FileSpreadsheet,
  TrendingUp,
  ExternalLink,
  ShoppingBag,
  Truck,
  IndianRupee,
} from 'lucide-react';

export type FinanceSubpage =
  | 'cash-book'
  | 'bank-book'
  | 'upi-card'
  | 'expenses'
  | 'receivables'
  | 'payables'
  | 'day-closing'
  | 'journal-entries'
  | 'gst-reports'
  | 'profit-loss';

interface FinanceNavigationHeaderProps {
  activePage: FinanceSubpage;
}

const FINANCE_NAV_ITEMS: { id: FinanceSubpage; label: string; href: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'cash-book', label: 'Cash Book', href: '/finance/cash-book', icon: Wallet },
  { id: 'bank-book', label: 'Bank Book', href: '/finance/bank-book', icon: Landmark },
  { id: 'upi-card', label: 'UPI & Cards', href: '/finance/upi-card', icon: CreditCard },
  { id: 'expenses', label: 'Expenses', href: '/finance/expenses', icon: Receipt },
  { id: 'receivables', label: 'Receivables', href: '/finance/receivables', icon: Users },
  { id: 'payables', label: 'Payables', href: '/finance/payables', icon: Building2 },
  { id: 'day-closing', label: 'Day Closing', href: '/finance/day-closing', icon: Lock },
  { id: 'journal-entries', label: 'Journal Entries', href: '/finance/journal-entries', icon: BookOpen },
  { id: 'gst-reports', label: 'GST Reports', href: '/finance/gst-reports', icon: FileSpreadsheet },
  { id: 'profit-loss', label: 'Profit & Loss', href: '/finance/profit-loss', icon: TrendingUp },
];

export function FinanceNavigationHeader({ activePage }: FinanceNavigationHeaderProps) {
  return (
    <div className="h-[38px] bg-[#f8fafc] border-b border-[#e2e8f0] px-4 flex items-center justify-between text-xs overflow-x-auto no-scrollbar gap-2 shrink-0">
      <div className="flex items-center gap-1 font-medium">
        <span className="text-[11px] text-neutral-400 uppercase tracking-wider mr-1 shrink-0">Finance:</span>
        {FINANCE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`px-2.5 py-1 rounded-md text-[11px] flex items-center gap-1 shrink-0 transition-colors ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-white'
              }`}
            >
              <Icon className={`w-3 h-3 ${isActive ? 'text-emerald-600' : 'text-neutral-500'}`} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-[11px] shrink-0 font-medium">
        <span className="text-neutral-300 hidden xl:inline">|</span>
        <Link
          href="/sales/invoices"
          className="text-neutral-500 hover:text-emerald-700 flex items-center gap-1 transition-colors"
          title="Sales Invoices & Revenue"
        >
          <ShoppingBag className="w-3 h-3 text-emerald-600" />
          <span>Sales Invoices</span>
        </Link>
        <span className="text-neutral-300">|</span>
        <Link
          href="/purchases/payments"
          className="text-neutral-500 hover:text-emerald-700 flex items-center gap-1 transition-colors"
          title="Supplier Outward Payments"
        >
          <Truck className="w-3 h-3 text-blue-600" />
          <span>Supplier Payouts</span>
        </Link>
        <span className="text-neutral-300">|</span>
        <Link
          href="/customers/advance-deposits"
          className="text-neutral-500 hover:text-emerald-700 flex items-center gap-1 transition-colors"
          title="Customer Advance Monies"
        >
          <IndianRupee className="w-3 h-3 text-amber-600" />
          <span>Customer Advances</span>
        </Link>
      </div>
    </div>
  );
}
