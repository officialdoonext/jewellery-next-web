'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  Package,
  TrendingUp,
  ShoppingBag,
  Users,
  Clock,
  Landmark,
  BarChart3,
  ShieldCheck,
  Building2,
  Settings,
  Sparkles,
  PanelLeft,
} from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';

export function IconRail() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useSidebar();

  const railLinks = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Sales & POS', href: '/sales/billing-pos', icon: Receipt },
    { name: 'Inventory & Stock', href: '/inventory/ornaments', icon: Package },
    { name: 'Rates & Valuation', href: '/rates/gold-rates', icon: TrendingUp },
    { name: 'Purchases', href: '/purchases/entry', icon: ShoppingBag },
    { name: 'Customers', href: '/customers/list', icon: Users },
    { name: 'Orders & Services', href: '/orders-services/custom-orders', icon: Clock },
    { name: 'Finance & Accounts', href: '/finance/cash-book', icon: Landmark },
    { name: 'Reports', href: '/reports/sales', icon: BarChart3 },
    { name: 'Employees & Access', href: '/employees/list', icon: ShieldCheck },
    { name: 'Branches', href: '/branches/management', icon: Building2 },
    { name: 'Settings', href: '/settings/shop-profile', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href.split('/').slice(0, 2).join('/'))) {
      return true;
    }
    return false;
  };

  return (
    <aside
      className={`shrink-0 bg-[#1c1c1c] text-neutral-400 flex flex-col items-center justify-between py-2.5 border-r border-[#2e2e2e] z-30 select-none transition-[width,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${
        sidebarOpen
          ? 'w-0 !border-r-0 opacity-0 pointer-events-none'
          : 'w-[50px] opacity-100'
      }`}
    >
      <div className="w-[50px] h-full flex flex-col items-center justify-between shrink-0">
        {/* Top Section: Brand Logo & Expand Button */}
        <div className="flex flex-col items-center gap-2 w-full">
          <Link
            href="/"
            scroll={false}
            className="group relative flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-all shadow-sm"
            title="Jewellery Next - Home"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </Link>

          {/* Dedicated Expand Sidebar Button */}
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-8 h-8 rounded-md bg-[#262626] text-emerald-400 hover:text-white hover:bg-emerald-600 transition-all cursor-pointer shadow-sm"
            title="Expand Full Sidebar Menu (Ctrl+B)"
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          {/* Separator */}
          <div className="w-5 h-[1px] bg-[#333333] my-0.5" />

          {/* Navigation Icons */}
          <nav className="flex flex-col items-center gap-1 w-full px-1 overflow-y-auto no-scrollbar max-h-[calc(100vh-170px)]">
            {railLinks.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  scroll={false}
                  className={`relative group flex items-center justify-center w-9 h-9 rounded-md transition-all ${
                    active
                      ? 'bg-[#2a2a2a] text-emerald-400 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-100 hover:bg-[#262626]'
                  }`}
                  title={item.name}
                >
                  {active && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-emerald-400 rounded-r-full" />
                  )}
                  <Icon className="w-4 h-4 stroke-[1.8]" />

                  {/* Hover Tooltip */}
                  <div className="absolute left-full ml-2.5 px-2.5 py-1 bg-[#181818] text-neutral-200 text-xs rounded border border-[#333333] shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: Status Indicator */}
        <div className="flex flex-col items-center gap-2 w-full pt-2 border-t border-[#333333]">
          <div className="relative group cursor-pointer">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="absolute left-full ml-2.5 bottom-0 px-2 py-1 bg-[#181818] text-[13px] text-emerald-400 rounded border border-[#333333] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
              System Online • 916 BIS Active
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
