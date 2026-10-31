'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  ChevronRight,
  Search,
  Plus,
  Table2,
  Lock,
  LayoutDashboard,
  FolderOpen,
  Folder,
  PanelLeftClose,
} from 'lucide-react';
import { NAVIGATION_MODULES } from '@/lib/navigation';
import { useSidebar } from '@/context/SidebarContext';

export function AppSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const navScrollRef = React.useRef<HTMLDivElement>(null);
  
  // Open ALL accordion groups by default as requested
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>(() => {
    const all: Record<string, boolean> = {};
    NAVIGATION_MODULES.forEach((mod) => {
      all[mod.id] = true;
    });
    return all;
  });

  // Keep track of scroll position and restore when navigating
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    try {
      sessionStorage.setItem('sidebar_scroll_position', String(e.currentTarget.scrollTop));
    } catch {}
  };

  React.useLayoutEffect(() => {
    try {
      const saved = sessionStorage.getItem('sidebar_scroll_position');
      if (saved && navScrollRef.current) {
        const scrollPos = parseInt(saved, 10);
        if (!isNaN(scrollPos)) {
          navScrollRef.current.scrollTop = scrollPos;
          requestAnimationFrame(() => {
            if (navScrollRef.current) {
              navScrollRef.current.scrollTop = scrollPos;
            }
          });
        }
      }
    } catch {}
  }, [pathname]);

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    NAVIGATION_MODULES.forEach((mod) => {
      all[mod.id] = true;
    });
    setOpenAccordions(all);
  };

  const collapseAll = () => {
    setOpenAccordions({});
  };

  // Filter modules and items by search query
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return NAVIGATION_MODULES;
    const q = searchQuery.toLowerCase();

    return NAVIGATION_MODULES.map((mod) => {
      const matchMod = mod.name.toLowerCase().includes(q);
      const matchingItems = mod.items.filter(
        (item) => item.name.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q)
      );
      if (matchMod || matchingItems.length > 0) {
        return {
          ...mod,
          items: matchMod ? mod.items : matchingItems,
        };
      }
      return null;
    }).filter(Boolean) as typeof NAVIGATION_MODULES;
  }, [searchQuery]);

  return (
    <aside
      className={`bg-white border-r border-[#e5e7eb] flex flex-col h-full shrink-0 select-none text-xs transition-[width,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden z-20 ${
        sidebarOpen
          ? 'w-[280px] opacity-100'
          : 'w-0 !border-r-0 opacity-0 pointer-events-none'
      }`}
    >
      <div className="w-[280px] h-full flex flex-col shrink-0">
        {/* Sidebar Header (Matches Supabase Table Editor Header) */}
        <div className="h-[46px] px-3.5 border-b border-[#e5e7eb] flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2 font-medium text-neutral-800 text-[13px]">
            <Table2 className="w-4 h-4 text-emerald-600" />
            <span>Jewellery Studio</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleSidebar}
              className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Collapse Sidebar (Ctrl+B)"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Schema / Scope Dropdown Selector */}
        <div className="p-3 pb-2 flex flex-col gap-2 border-b border-[#f1f5f9] bg-[#fafafa]">
          <div className="flex items-center justify-between bg-white border border-[#e2e8f0] rounded-md px-2.5 py-1.5 shadow-2xs hover:border-neutral-300 transition-colors cursor-pointer">
            <div className="flex items-center gap-1.5 text-neutral-700">
              <span className="text-neutral-400 font-mono text-[13px]">schema</span>
              <span className="font-medium text-neutral-900 font-mono text-[13px]">jewellery_erp</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          </div>

          {/* Action Button: New POS Bill */}
          <Link
            href="/sales/billing-pos"
            scroll={false}
            className="flex items-center justify-center gap-1.5 w-full bg-white border border-dashed border-neutral-300 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/40 text-neutral-600 rounded-md py-1.5 font-medium transition-all shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>New POS Invoice / Entry</span>
          </Link>
        </div>

        {/* Search & Accordion Controls */}
        <div className="px-3 pt-2 pb-1.5 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tables & menus..."
              className="w-full pl-8 pr-2 py-1 bg-white border border-[#e2e8f0] focus:border-emerald-500 focus:outline-none rounded text-xs placeholder:text-neutral-400 text-neutral-800 transition-colors"
            />
          </div>
          <button
            onClick={expandAll}
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Expand All Accordions"
          >
            <FolderOpen className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={collapseAll}
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Collapse All Accordions"
          >
            <Folder className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable Navigation List with Accordions */}
        <div
          ref={navScrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-2 py-1.5 space-y-1 divide-y-0 text-neutral-700 custom-scrollbar"
        >
          {/* Direct Link: Dashboard */}
          <Link
            href="/"
            scroll={false}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-all ${
              pathname === '/'
                ? 'bg-emerald-50 text-emerald-700 font-medium border border-emerald-200/60 shadow-2xs'
                : 'text-neutral-700 hover:bg-neutral-100/80 hover:text-neutral-900'
            }`}
          >
            <LayoutDashboard className={`w-3.5 h-3.5 ${pathname === '/' ? 'text-emerald-600' : 'text-neutral-500'}`} />
            <span className="flex-1">Dashboard</span>
            <span className="text-[10px] font-mono px-1 rounded bg-neutral-100 text-neutral-500">Live</span>
          </Link>

          {/* Accordion Modules */}
          {filteredModules.map((mod) => {
            const isOpen = searchQuery.trim() ? true : !!openAccordions[mod.id];
            const hasActiveChild = mod.items.some((i) => pathname === i.href);

            return (
              <div key={mod.id} className="pt-1">
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleAccordion(mod.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-colors group cursor-pointer ${
                    hasActiveChild
                      ? 'font-medium text-neutral-900 bg-neutral-100/60'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-neutral-400 group-hover:text-neutral-600 transition-transform">
                      {isOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                    </span>
                    <span className="truncate text-xs">{mod.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-neutral-100 text-neutral-500 border border-neutral-200/60">
                      {mod.items.length}
                    </span>
                  </div>
                </button>

                {/* Accordion Submenu Items */}
                {isOpen && (
                  <div className="ml-3 pl-2.5 border-l border-[#e5e7eb] my-0.5 space-y-0.5">
                    {mod.items.map((sub) => {
                      const isActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.id}
                          href={sub.href}
                          scroll={false}
                          className={`group flex items-center justify-between px-2 py-1.5 rounded-sm transition-all text-[13px] ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-800 font-medium border-l-2 border-emerald-500 shadow-2xs'
                              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70'
                          }`}
                          title={sub.name}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {/* Supabase style table icon */}
                            <Table2
                              className={`w-3 h-3 shrink-0 ${
                                isActive ? 'text-emerald-600' : 'text-neutral-400 group-hover:text-neutral-600'
                              }`}
                            />
                            <span className="truncate">{sub.name}</span>
                          </div>

                          {/* Subtle badge or lock icon like Supabase */}
                          <div className="flex items-center gap-1 shrink-0 opacity-60 group-hover:opacity-100">
                            {sub.badge && (
                              <span className="text-[9px] font-mono px-1 py-0.2 bg-emerald-100/70 text-emerald-700 rounded">
                                {sub.badge}
                              </span>
                            )}
                            <Lock className="w-2.5 h-2.5 text-neutral-400" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {filteredModules.length === 0 && (
            <div className="py-6 text-center text-neutral-400 text-xs">
              No matching tables or menus found.
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-2.5 border-t border-[#e5e7eb] bg-[#fafafa] flex items-center justify-between text-[13px] text-neutral-500 shrink-0">
          <span className="font-mono text-[11px]">11 Modules • 78 Submenus</span>
          <span className="text-emerald-600 font-medium">Ready</span>
        </div>
      </div>
    </aside>
  );
}
