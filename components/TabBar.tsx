'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  Table2,
  X,
  Plus,
  PanelLeft,
  LayoutDashboard,
} from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';

interface TabBarProps {
  title: string;
}

export function TabBar({ title }: TabBarProps) {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useSidebar();

  return (
    <div className="h-[36px] bg-[#f8fafc] border-b border-[#e2e8f0] px-2 flex items-center justify-between text-xs select-none shrink-0 overflow-x-auto no-scrollbar">
      {/* Left: Expand toggle (if collapsed) and active tab */}
      <div className="flex items-center gap-1 h-full">
        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="p-1 rounded text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200/60 transition-colors mr-1 cursor-pointer"
            title="Expand Sidebar (Ctrl+B)"
          >
            <PanelLeft className="w-3.5 h-3.5 text-emerald-600" />
          </button>
        )}

        {/* Active Tab matching Supabase styling */}
        <div className="flex items-center gap-2 px-3 h-[28px] bg-white border border-[#e2e8f0] border-b-transparent rounded-t-md text-neutral-800 font-medium text-[13px] shadow-2xs">
          {pathname === '/' ? (
            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Table2 className="w-3.5 h-3.5 text-emerald-600" />
          )}
          <span className="font-mono">{title}</span>
          <button
            className="p-0.5 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-700 transition-colors ml-1"
            title="Close Tab"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Add Tab Button */}
        <button
          className="p-1 hover:bg-neutral-200/50 rounded text-neutral-400 hover:text-neutral-700 transition-colors"
          title="Open New Tab"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: Quick Context Badges */}
      <div className="flex items-center gap-2 text-[13px] text-neutral-500">
        <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          BIS Hallmark 916 Compliant
        </span>
      </div>
    </div>
  );
}
