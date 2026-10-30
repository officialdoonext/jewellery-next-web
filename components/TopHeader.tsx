'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ChevronDown,
  Cable,
  Search,
  HelpCircle,
  Bell,
  PanelLeftClose,
  PanelLeft,
  LayoutGrid,
} from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';

export function TopHeader() {
  const { sidebarOpen, toggleSidebar, openSearch } = useSidebar();

  return (
    <header className="h-[46px] w-full bg-white border-b border-[#e5e7eb] px-3 flex items-center justify-between text-xs text-neutral-600 select-none z-20 shrink-0">
      {/* Left Breadcrumb & Context Selectors */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {/* Toggle sidebar button */}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
          title={sidebarOpen ? 'Collapse sidebar (Ctrl+B)' : 'Expand sidebar (Ctrl+B)'}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="w-4 h-4 text-neutral-600" />
          ) : (
            <PanelLeft className="w-4 h-4 text-emerald-600" />
          )}
        </button>

        {/* Brand Icon & Name */}
        <Link href="/" className="flex items-center gap-1.5 font-medium text-neutral-900 hover:opacity-90">
          <div className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-medium text-[10px]">
            ⚡
          </div>
          <span className="font-medium text-neutral-900">Doonext</span>
          <span className="bg-neutral-100 text-neutral-600 border border-neutral-200 text-[10px] px-1.5 py-0.2 rounded font-mono font-medium">
            FREE
          </span>
        </Link>

        <span className="text-neutral-300">/</span>

        {/* Project Selector */}
        <Link href="/" className="flex items-center gap-1 px-1.5 py-1 rounded hover:bg-neutral-100 cursor-pointer text-neutral-700 transition-colors">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-medium text-neutral-900">Jewellery Next</span>
          <ChevronDown className="w-3 h-3 text-neutral-400" />
        </Link>

        <span className="text-neutral-300">/</span>

        {/* Branch / Env Selector */}
        <div className="flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-neutral-100 cursor-pointer text-neutral-700 transition-colors">
          <span className="font-mono text-neutral-800">main</span>
          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium uppercase tracking-wider">
            PRODUCTION
          </span>
          <ChevronDown className="w-3 h-3 text-neutral-400" />
        </div>

        {/* Connect Action Button */}
        <button
          onClick={() => alert('Connected to PostgreSQL Database (Supabase Cloud • Schema: public, jewellery_erp)')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#e2e8f0] bg-white hover:bg-neutral-50 text-neutral-700 font-medium text-[13px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all ml-1 cursor-pointer"
        >
          <Cable className="w-3 h-3 text-emerald-600" />
          <span>Connect</span>
        </button>
      </div>

      {/* Right Action Icons & User Profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button className="hidden sm:inline-flex px-2 py-1 text-neutral-500 hover:text-neutral-800 text-xs transition-colors cursor-pointer">
          Feedback
        </button>

        {/* Search bar input pill */}
        <div
          onClick={openSearch}
          className="flex items-center gap-2 bg-[#f8fafc] border border-[#e2e8f0] hover:border-neutral-300 rounded px-2.5 py-1 text-neutral-400 hover:text-neutral-600 text-xs w-44 md:w-52 cursor-pointer transition-all"
        >
          <Search className="w-3.5 h-3.5 text-neutral-400" />
          <span className="flex-1 text-[13px]">Search...</span>
          <kbd className="font-mono text-[10px] bg-white border border-neutral-200 px-1 rounded text-neutral-400 shadow-2xs">
            Ctrl K
          </kbd>
        </div>

        {/* Quick Icon Buttons */}
        <button
          className="p-1 rounded text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
          title="Help & Documentation"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          className="p-1 rounded text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        <button
          className="p-1 rounded text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
          title="Layout Controls"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>

        {/* User Profile Avatar */}
        <div
          className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center font-medium text-[10px] cursor-pointer ring-1 ring-neutral-200 hover:ring-emerald-500 transition-all ml-1"
          title="Arumulla SivaKrishna (Super Admin)"
        >
          SK
        </div>
      </div>
    </header>
  );
}
