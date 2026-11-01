'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Receipt,
  FileText,
  FileSpreadsheet,
  ShoppingBag,
  RotateCcw,
  Truck,
  Coins,
  PauseCircle,
  Users,
  Package,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SALES_NAV_ITEMS: NavItem[] = [
  { name: 'POS Counter', href: '/sales/billing-pos', icon: Receipt },
  { name: 'Invoices', href: '/sales/invoices', icon: FileText },
  { name: 'Quotations', href: '/sales/quotations', icon: FileSpreadsheet },
  { name: 'Custom Orders', href: '/sales/orders', icon: ShoppingBag },
  { name: 'Returns & Credit', href: '/sales/returns', icon: RotateCcw },
  { name: 'Delivery Challans', href: '/sales/delivery-challans', icon: Truck },
  { name: 'Old Gold Exchange', href: '/sales/exchange-billing', icon: Coins },
  { name: 'Held Bills', href: '/sales/held-bills', icon: PauseCircle },
];

const RELATED_MODULE_LINKS = [
  { name: 'Customers', href: '/customers/list', icon: Users },
  { name: 'Ornaments Stock', href: '/inventory/ornaments', icon: Package },
  { name: 'Cash Book', href: '/finance/cash-book', icon: BookOpen },
];

export function SalesSubNav() {
  const pathname = usePathname();

  return (
    <div className="bg-white border-b border-[#e2e8f0] px-3 py-1.5 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar shrink-0 text-xs">
      {/* Sales Sub-navigation items */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 mr-1.5 hidden lg:inline">
          Sales Hub:
        </span>
        {SALES_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors font-medium text-[12px] whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-neutral-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* External module quick jumps */}
      <div className="flex items-center gap-1.5 shrink-0 border-l border-[#e2e8f0] pl-3">
        <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 hidden sm:inline">
          Quick Links:
        </span>
        {RELATED_MODULE_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={`Open ${item.name}`}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50 border border-neutral-200 transition-colors"
            >
              <Icon className="w-3 h-3 text-neutral-400 group-hover:text-emerald-600" />
              <span>{item.name}</span>
              <ArrowRight className="w-2.5 h-2.5 opacity-60" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
