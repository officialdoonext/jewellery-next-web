'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { IconRail } from './IconRail';
import { AppSidebar } from './AppSidebar';
import { TopHeader } from './TopHeader';
import { NAVIGATION_MODULES } from '@/lib/navigation';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext';
import { Search, X, Table2, ArrowRight } from 'lucide-react';

function LayoutShell({ children }: { children: React.ReactNode }) {
  const { searchModalOpen, setSearchModalOpen } = useSidebar();
  const [quickQuery, setQuickQuery] = useState('');

  // Quick jump search results
  const searchResults = React.useMemo(() => {
    if (!quickQuery.trim()) return [];
    const q = quickQuery.toLowerCase();
    const results: { moduleName: string; name: string; href: string; desc: string }[] = [];

    NAVIGATION_MODULES.forEach((mod) => {
      mod.items.forEach((item) => {
        if (
          item.name.toLowerCase().includes(q) ||
          item.slug.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        ) {
          results.push({
            moduleName: mod.name,
            name: item.name,
            href: item.href,
            desc: item.description,
          });
        }
      });
    });

    return results.slice(0, 8);
  }, [quickQuery]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white text-neutral-900 font-sans antialiased">
      {/* Top Supabase Header */}
      <TopHeader />

      {/* Main Workspace: Left Icon Rail + Collapsible AppSidebar + Full-Width Right Content Pane */}
      <div className="flex flex-1 w-full h-[calc(100vh-46px)] overflow-hidden">
        {/* Leftmost 50px Icon Rail */}
        <IconRail />

        {/* Accordion Sidebar (Collapsible / Expandable) */}
        <AppSidebar />

        {/* Right Content Area: Smoothly occupies 100% full width when sidebar is collapsed */}
        <main className="flex-1 w-full min-w-0 h-full flex flex-col overflow-hidden bg-white transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
          {children}
        </main>
      </div>

      {/* Quick Jump Search Modal (Ctrl + K) */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
          <div className="w-full max-w-xl bg-white rounded-lg shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {/* Search Input Bar */}
            <div className="p-3 border-b border-[#e5e7eb] flex items-center gap-2.5">
              <Search className="w-4 h-4 text-emerald-600 shrink-0" />
              <input
                type="text"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                autoFocus
                placeholder="Search jewellery menus, tables, billing, reports... (Type to jump)"
                className="w-full text-sm bg-transparent focus:outline-none text-neutral-900 placeholder:text-neutral-400"
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="p-1 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 divide-y divide-neutral-100 text-xs">
              {searchResults.length > 0 ? (
                searchResults.map((res, i) => (
                  <Link
                    key={i}
                    href={res.href}
                    scroll={false}
                    onClick={() => setSearchModalOpen(false)}
                    className="flex items-center justify-between p-2.5 hover:bg-neutral-50 rounded-md group transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Table2 className="w-3.5 h-3.5 text-neutral-400 group-hover:text-emerald-600" />
                      <div>
                        <div className="font-medium text-neutral-900 group-hover:text-emerald-700">
                          {res.name}
                        </div>
                        <div className="text-[13px] text-neutral-500 font-mono">
                          {res.moduleName} • {res.href}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-neutral-700 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))
              ) : quickQuery.trim() ? (
                <div className="p-6 text-center text-neutral-400 text-xs">
                  No matching menus or tables found.
                </div>
              ) : (
                <div className="p-4 text-xs text-neutral-500 space-y-2">
                  <div className="font-medium text-neutral-700 uppercase tracking-wider text-[10px]">
                    Quick Jump Suggestions
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 font-medium">
                    <Link
                      href="/sales/billing-pos"
                      scroll={false}
                      onClick={() => setSearchModalOpen(false)}
                      className="p-2 rounded hover:bg-neutral-50 text-neutral-800 flex items-center gap-2"
                    >
                      <span>⚡ Billing / POS</span>
                    </Link>
                    <Link
                      href="/inventory/ornaments"
                      scroll={false}
                      onClick={() => setSearchModalOpen(false)}
                      className="p-2 rounded hover:bg-neutral-50 text-neutral-800 flex items-center gap-2"
                    >
                      <span>💎 Ornaments Master</span>
                    </Link>
                    <Link
                      href="/rates/gold-rates"
                      scroll={false}
                      onClick={() => setSearchModalOpen(false)}
                      className="p-2 rounded hover:bg-neutral-50 text-neutral-800 flex items-center gap-2"
                    >
                      <span>📈 Daily Gold Rates</span>
                    </Link>
                    <Link
                      href="/reports/sales"
                      scroll={false}
                      onClick={() => setSearchModalOpen(false)}
                      className="p-2 rounded hover:bg-neutral-50 text-neutral-800 flex items-center gap-2"
                    >
                      <span>📊 Sales Reports</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-2.5 bg-[#f8fafc] border-t border-[#e5e7eb] flex items-center justify-between text-[13px] text-neutral-500">
              <span className="font-mono">Press ESC to close</span>
              <span className="font-mono text-emerald-600 font-medium">Supabase Command Palette</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <LayoutShell>{children}</LayoutShell>
    </SidebarProvider>
  );
}
