'use client';

import React from 'react';
import {
  Search,
  ArrowUpDown,
  Shield,
  UserCheck,
  MoreHorizontal,
  RotateCw,
  Plus,
  ChevronDown,
  Sparkles,
  Download,
  Filter,
} from 'lucide-react';

interface ActionToolbarProps {
  filterPlaceholder?: string;
  onRefresh?: () => void;
  insertLabel?: string;
  onInsertClick?: () => void;
}

export function ActionToolbar({
  filterPlaceholder = 'Filter by id, barcode, metal, phone... or ask AI',
  onRefresh,
  insertLabel = 'Insert',
  onInsertClick,
}: ActionToolbarProps) {
  return (
    <div className="h-[42px] bg-white border-b border-[#e2e8f0] px-3 flex items-center justify-between text-xs select-none gap-2 shrink-0">
      {/* Left: Supabase Filter Search Bar */}
      <div className="flex-1 max-w-xl flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={filterPlaceholder}
            className="w-full pl-8 pr-16 py-1 bg-[#f8fafc] border border-[#e2e8f0] focus:border-emerald-500 focus:bg-white focus:outline-none rounded text-xs placeholder:text-neutral-400 text-neutral-800 transition-colors"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <span className="flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 rounded font-mono">
              <Sparkles className="w-2.5 h-2.5" /> AI
            </span>
          </div>
        </div>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Sort Button */}
        <button className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#e2e8f0] bg-white hover:bg-neutral-50 text-neutral-700 font-medium text-[13px] shadow-2xs transition-colors">
          <ArrowUpDown className="w-3 h-3 text-neutral-500" />
          <span>Sort</span>
        </button>

        {/* GST / Security Rules Pill */}
        <button className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded border border-[#e2e8f0] bg-white hover:bg-neutral-50 text-neutral-700 font-medium text-[13px] shadow-2xs transition-colors">
          <span className="w-4 h-4 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-mono font-medium text-neutral-600">
            4
          </span>
          <span>GST / RLS rules</span>
        </button>

        {/* Role Pill Dropdown */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded border border-[#e2e8f0] bg-white hover:bg-neutral-50 text-neutral-700 font-medium text-[13px] shadow-2xs transition-colors cursor-pointer">
          <span className="text-neutral-400 font-mono text-[10px]">Role</span>
          <span className="font-mono text-neutral-800">manager</span>
          <ChevronDown className="w-3 h-3 text-neutral-400" />
        </div>

        {/* More Actions Menu */}
        <button className="p-1.5 rounded border border-[#e2e8f0] bg-white hover:bg-neutral-50 text-neutral-600 transition-colors shadow-2xs">
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>

        {/* Refresh Icon */}
        <button
          onClick={onRefresh}
          className="p-1.5 rounded border border-[#e2e8f0] bg-white hover:bg-neutral-50 text-neutral-600 transition-colors shadow-2xs"
          title="Refresh Data"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        {/* Signature Supabase Emerald Green Action Button */}
        <button
          onClick={onInsertClick}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#24b47e] hover:bg-[#1fa070] text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{insertLabel}</span>
          <ChevronDown className="w-3 h-3 opacity-80" />
        </button>
      </div>
    </div>
  );
}

