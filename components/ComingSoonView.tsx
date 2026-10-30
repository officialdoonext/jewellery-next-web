'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Table2,
  BellRing,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { SubmenuItem, NavModule } from '@/lib/types';
import { TabBar } from './TabBar';
import { ActionToolbar } from './ActionToolbar';

interface ComingSoonViewProps {
  module: NavModule;
  item: SubmenuItem;
}

export function ComingSoonView({ module, item }: ComingSoonViewProps) {
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isNotified, setIsNotified] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      {/* Top Tab Bar (Supabase style) */}
      <TabBar title={item.tablePreview.tableName} />

      {/* Action Toolbar (Supabase style) */}
      <ActionToolbar
        filterPlaceholder={`Filter ${item.tablePreview.tableName} by id, weight, status...`}
        insertLabel={`Insert ${item.name}`}
        onInsertClick={() => alert(`Creating new record in ${item.tablePreview.tableName} will be available in the upcoming release!`)}
      />

      {/* Main Content Area (Occupies full 100% width) */}
      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* Module Hero & Roadmap Status Banner */}
        <div className="p-4 sm:p-6 bg-white border-b border-[#e5e7eb] w-full">
          <div className="w-full space-y-4">
            {/* Breadcrumb & Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
                <span>modules</span>
                <ChevronRight className="w-3 h-3 text-neutral-400" />
                <span className="text-neutral-700">{module.name}</span>
                <ChevronRight className="w-3 h-3 text-neutral-400" />
                <span className="text-emerald-700 font-medium">{item.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[13px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                  <Clock className="w-3 h-3 text-amber-600" />
                  Coming Soon • Sprint Phase
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[13px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Jewellery Suite v1.1
                </span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-medium text-neutral-900 tracking-tight flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center text-sm font-medium border border-emerald-200 shadow-2xs shrink-0">
                    💎
                  </div>
                  <span>{item.name}</span>
                </h1>
                <p className="text-sm text-neutral-600 mt-1 max-w-4xl leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsNotified(!isNotified)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all shadow-2xs cursor-pointer ${
                    isNotified
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <BellRing className={`w-3.5 h-3.5 ${isNotified ? 'text-emerald-600' : 'text-neutral-500'}`} />
                  <span>{isNotified ? 'Subscribed for Alert' : 'Notify on Release'}</span>
                </button>

                <Link
                  href="/"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Planned Feature Capabilities Grid */}
            <div className="pt-2">
              <h3 className="text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Planned Jewellery Enterprise Capabilities</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 w-full">
                {item.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-3 rounded-md bg-[#f8fafc] border border-[#e2e8f0] text-xs text-neutral-700 hover:border-emerald-300 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span className="leading-snug">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Supabase-style Interactive Data Table / Schema Definition Preview (Full Width) */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 w-full">
          <div className="w-full bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            {/* Table Header Info Bar */}
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Table2 className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  {item.tablePreview.tableName}
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">{item.tablePreview.description}</span>
              </div>

              {/* Data / Definition toggle buttons */}
              <div className="flex items-center bg-neutral-200/60 p-0.5 rounded border border-neutral-300/60 text-[13px]">
                <button
                  onClick={() => setActiveTab('data')}
                  className={`px-2.5 py-0.5 rounded font-medium transition-all cursor-pointer ${
                    activeTab === 'data'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Data
                </button>
                <button
                  onClick={() => setActiveTab('definition')}
                  className={`px-2.5 py-0.5 rounded font-medium transition-all cursor-pointer ${
                    activeTab === 'definition'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Definition
                </button>
              </div>
            </div>

            {/* Table Content: Data Tab */}
            {activeTab === 'data' && (
              <div className="flex-1 overflow-x-auto custom-scrollbar w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#fcfcfc] border-b border-[#e5e7eb] text-neutral-600 font-mono text-[13px]">
                      {/* Checkbox column */}
                      <th className="w-10 px-3 py-2 border-r border-[#e5e7eb] text-center">
                        <input
                          type="checkbox"
                          className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          disabled
                        />
                      </th>
                      {item.tablePreview.columns.map((col) => (
                        <th
                          key={col.name}
                          className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-neutral-800">{col.name}</span>
                            <span className="text-neutral-400 font-normal text-[10px]">
                              {col.type}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb] font-mono text-neutral-800 text-[13px]">
                    {item.tablePreview.sampleRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-neutral-50/80 transition-colors group"
                      >
                        {/* Checkbox */}
                        <td className="px-3 py-2 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>

                        {item.tablePreview.columns.map((col) => {
                          const val = row[col.name];
                          const isId = col.name === 'id';

                          return (
                            <td
                              key={col.name}
                              className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap"
                            >
                              {val === null || val === undefined ? (
                                <span className="text-neutral-400 italic font-mono text-[10px]">
                                  NULL
                                </span>
                              ) : isId ? (
                                <div className="flex items-center gap-1.5 group/cell">
                                  <span className="truncate max-w-[120px] text-neutral-600">
                                    {String(val).slice(0, 8)}...
                                  </span>
                                  <button
                                    onClick={() => copyToClipboard(String(val), String(val))}
                                    className="opacity-0 group-hover/cell:opacity-100 p-0.5 hover:bg-neutral-200 rounded transition-opacity cursor-pointer"
                                    title="Copy UUID"
                                  >
                                    {copiedId === String(val) ? (
                                      <Check className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3 h-3 text-neutral-400" />
                                    )}
                                  </button>
                                </div>
                              ) : typeof val === 'number' && col.type.startsWith('numeric') ? (
                                <span className="text-neutral-900 font-medium">
                                  {col.name.includes('rate') || col.name.includes('total') || col.name.includes('amount') || col.name.includes('charges') || col.name.includes('payable')
                                    ? `₹ ${val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                                    : `${val.toFixed(3)} g`}
                                </span>
                              ) : typeof val === 'boolean' ? (
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[10px] ${
                                    val
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-neutral-100 text-neutral-600'
                                  }`}
                                >
                                  {val ? 'TRUE' : 'FALSE'}
                                </span>
                              ) : (
                                <span>{String(val)}</span>
                              )}
                            </td>
                          );
                        })}
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.{item.tablePreview.tableName} (
                  <br />
                  {item.tablePreview.columns.map((col, idx) => (
                    <div key={col.name} className="pl-6">
                      <span className="text-blue-300 font-medium">{col.name}</span>{' '}
                      <span className="text-amber-300">{col.type}</span>
                      {col.name === 'id' && <span className="text-neutral-400"> DEFAULT gen_random_uuid() PRIMARY KEY</span>}
                      {idx < item.tablePreview.columns.length - 1 ? ',' : ''}
                    </div>
                  ))}
                  );
                  <br />
                  <br />
                  <span className="text-neutral-500">-- Row Level Security (RLS) policies for Jewellery ERP</span>
                  <br />
                  <span className="text-emerald-400">ALTER TABLE</span> public.{item.tablePreview.tableName}{' '}
                  <span className="text-emerald-400">ENABLE ROW LEVEL SECURITY;</span>
                </div>
              </div>
            )}

            {/* Table Footer Bar (Matches Supabase Studio Bottom Bar) */}
            <div className="h-[36px] bg-[#f8fafc] border-t border-[#e5e7eb] px-3.5 flex items-center justify-between text-[13px] text-neutral-500 font-mono select-none w-full">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span>Page</span>
                  <span className="px-1.5 py-0.5 bg-white border border-[#e2e8f0] rounded text-neutral-800 font-medium">
                    1
                  </span>
                  <span>of 1</span>
                </div>
                <span>•</span>
                <span>100 rows</span>
                <span>•</span>
                <span>{item.tablePreview.sampleRows.length} sample records</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-emerald-600 font-medium">Postgres Schema Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
