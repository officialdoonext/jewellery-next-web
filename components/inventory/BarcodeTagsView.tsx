'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Printer,
  QrCode,
  Tag,
  CheckCircle2,
  Clock,
  Layers,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Sliders,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface PrintQueueItem {
  id: string;
  tag_code: string;
  item_name: string;
  gross_wt: number;
  net_wt: number;
  karat: string;
  huid: string;
  tag_format: 'Dumbbell (68x12mm)' | 'Rat-tail (50x10mm)' | 'Butterfly (40x25mm)';
  status: 'QUEUED' | 'PRINTED';
}

const INITIAL_QUEUE: PrintQueueItem[] = [
  {
    id: 'a1290384-bb92-411a-9821-6571a82910ba',
    tag_code: 'TG9160293',
    item_name: 'Diamond Solitaire Pendant',
    gross_wt: 3.820,
    net_wt: 3.620,
    karat: '18K (750)',
    huid: 'HD8192',
    tag_format: 'Dumbbell (68x12mm)',
    status: 'QUEUED',
  },
  {
    id: 'a1290384-bb92-411a-9821-6571a82910bb',
    tag_code: 'TAG-G-8910',
    item_name: '22K Antique Temple Haar',
    gross_wt: 48.240,
    net_wt: 45.100,
    karat: '22K (916)',
    huid: 'AB92D8',
    tag_format: 'Dumbbell (68x12mm)',
    status: 'QUEUED',
  },
  {
    id: 'a1290384-bb92-411a-9821-6571a82910bc',
    tag_code: 'TAG-G-7104',
    item_name: 'Traditional Peacock Jhumkas',
    gross_wt: 18.600,
    net_wt: 17.800,
    karat: '22K (916)',
    huid: 'KL72P3',
    tag_format: 'Rat-tail (50x10mm)',
    status: 'QUEUED',
  },
  {
    id: 'a1290384-bb92-411a-9821-6571a82910bd',
    tag_code: 'TAG-D-4512',
    item_name: 'Solitaire Diamond Ring (VVS1)',
    gross_wt: 5.420,
    net_wt: 5.120,
    karat: '18K (750)',
    huid: 'DF81H9',
    tag_format: 'Butterfly (40x25mm)',
    status: 'PRINTED',
  },
  {
    id: 'a1290384-bb92-411a-9821-6571a82910be',
    tag_code: 'TAG-G-6201',
    item_name: 'Calcutta Handcrafted Bangles',
    gross_wt: 36.450,
    net_wt: 36.450,
    karat: '22K (916)',
    huid: 'MN51X2',
    tag_format: 'Dumbbell (68x12mm)',
    status: 'PRINTED',
  },
];

export function InventoryBarcodeTagsView() {
  const [queue, setQueue] = useState<PrintQueueItem[]>(INITIAL_QUEUE);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>(['a1290384-bb92-411a-9821-6571a82910ba']);
  const [selectedFormat, setSelectedFormat] = useState<'Dumbbell (68x12mm)' | 'Rat-tail (50x10mm)' | 'Butterfly (40x25mm)'>('Dumbbell (68x12mm)');

  // Selected item preview
  const previewItem = queue.find((q) => q.id === selectedIds[0]) || queue[0];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === queue.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(queue.map((q) => q.id));
    }
  };

  const handlePrintSelected = () => {
    setQueue(
      queue.map((item) => (selectedIds.includes(item.id) ? { ...item, status: 'PRINTED' } : item))
    );
  };

  const handleSinglePrint = (id: string) => {
    setQueue(
      queue.map((item) => (item.id === id ? { ...item, status: 'PRINTED' } : item))
    );
  };

  const handleClearQueue = () => {
    setQueue(queue.filter((q) => q.status !== 'PRINTED'));
    setSelectedIds([]);
  };

  const queuedCount = queue.filter((q) => q.status === 'QUEUED').length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="inventory_barcode_tags" />
      <ActionToolbar
        filterPlaceholder="Filter tags queue by barcode, HUID, item..."
        insertLabel="Print Test Tag"
        onInsertClick={() => alert('Sending test label to Zebra ZD220 (203 DPI)...')}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics Summary Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Tags in Queue</span>
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">{queuedCount} tags</div>
              <div className="text-[11px] text-amber-700 mt-1 font-mono">
                Awaiting batch send
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Printed Today</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">84 tags</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                Verified with scanner
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Connected Printer</span>
                <Printer className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-sm font-medium text-neutral-900 mt-1">Zebra ZD220 (USB)</div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Online • 203 DPI Ready
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Media Type</span>
                <Layers className="w-3.5 h-3.5 text-neutral-600" />
              </div>
              <div className="text-sm font-medium text-neutral-900 mt-1">Heatproof Polyester</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Ultrasonic & buffing safe
              </div>
            </div>
          </div>
        </div>

        {/* Live Label Preview Section */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-[#f8fafc]">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Controls */}
            <div className="flex-1 w-full space-y-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium text-neutral-800 uppercase tracking-wider">
                  Thermal Tag Layout Designer & Preview
                </span>
              </div>
              <p className="text-xs text-neutral-600">
                Previewing label for:{' '}
                <span className="font-medium text-neutral-900">
                  {previewItem ? previewItem.item_name : 'No item selected'}
                </span>
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {(['Dumbbell (68x12mm)', 'Rat-tail (50x10mm)', 'Butterfly (40x25mm)'] as const).map(
                  (fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setSelectedFormat(fmt)}
                      className={`px-3 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
                        selectedFormat === fmt
                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                          : 'bg-white text-neutral-700 border-[#e2e8f0] hover:bg-neutral-50'
                      }`}
                    >
                      {fmt}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Mock Jewellery Dumbbell / Tail Tag Visual Representation */}
            {previewItem && (
              <div className="shrink-0 bg-white border-2 border-neutral-800 p-2.5 rounded-lg shadow-sm flex items-center gap-2 font-mono text-[10px] select-none">
                {/* Left side: QR Code + Shop Name */}
                <div className="flex flex-col items-center justify-center border-r border-dashed border-neutral-400 pr-2.5">
                  <div className="w-10 h-10 bg-neutral-900 flex items-center justify-center rounded text-white text-[9px] font-sans">
                    <QrCode className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-[9px] font-bold text-neutral-800 mt-1 uppercase">
                    SRI JEWELS
                  </span>
                </div>

                {/* Center / Loop Connector */}
                <div className="w-6 border-t-2 border-b-2 border-neutral-400 h-2 self-center flex items-center justify-center">
                  <span className="text-[7px] text-neutral-400">LOOP</span>
                </div>

                {/* Right side: Weights, Karat, HUID, Barcode */}
                <div className="pl-2.5 space-y-0.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-neutral-900">{previewItem.tag_code}</span>
                    <span className="text-[9px] bg-neutral-100 px-1 rounded font-bold">
                      {previewItem.karat}
                    </span>
                  </div>
                  <div className="text-[9px] text-neutral-600">
                    GW: <span className="text-neutral-900 font-bold">{previewItem.gross_wt.toFixed(3)}g</span>{' '}
                    | NW: <span className="text-neutral-900 font-bold">{previewItem.net_wt.toFixed(3)}g</span>
                  </div>
                  <div className="text-[9px] text-emerald-700 font-semibold flex items-center gap-1">
                    HUID: {previewItem.huid} (BIS)
                  </div>
                  {/* Mock Barcode stripes */}
                  <div className="pt-0.5 flex gap-0.5 h-3 items-end">
                    {[2, 1, 3, 1, 2, 1, 4, 1, 2, 1, 3, 2, 1, 3, 1, 2].map((w, idx) => (
                      <span
                        key={idx}
                        className="bg-neutral-900 h-full inline-block"
                        style={{ width: `${w}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Batch Action Toolbar */}
        <div className="px-4 sm:px-5 py-3 bg-white border-b border-[#e5e7eb] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintSelected}
              disabled={selectedIds.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Selected ({selectedIds.length})</span>
            </button>
            <button
              onClick={handleClearQueue}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-neutral-400" />
              <span>Clear Printed</span>
            </button>
          </div>

          <div className="text-xs text-neutral-500 font-mono">
            {selectedIds.length} of {queue.length} labels selected
          </div>
        </div>

        {/* Supabase-style Table / Schema Definition Section */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            {/* Table Header Info Bar */}
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  barcode_tags_log
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Thermal tag spool queue &amp; reprint history
                </span>
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
                    <tr className="bg-[#fcfcfc] border-b border-[#e5e7eb] text-neutral-600 font-mono text-[12px]">
                      <th className="w-10 px-3 py-2 border-r border-[#e5e7eb] text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === queue.length && queue.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                        />
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-800">tag_code</span>
                          <span className="text-neutral-400 font-normal text-[10px]">code128</span>
                        </div>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">item_name</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">gross_wt</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">net_wt</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">karat</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">huid</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">tag_format</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">status</span>
                      </th>
                      <th className="px-3.5 py-2 font-medium whitespace-nowrap text-center">
                        <span className="text-neutral-800">action</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb] font-mono text-neutral-800 text-[12px]">
                    {queue.map((row) => (
                      <tr
                        key={row.id}
                        className={`hover:bg-neutral-50/80 transition-colors group ${
                          selectedIds.includes(row.id) ? 'bg-emerald-50/30' : ''
                        }`}
                      >
                        <td className="px-3 py-2 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(row.id)}
                            onChange={() => handleToggleSelect(row.id)}
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>

                        {/* Tag Code */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-medium text-neutral-900">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-800 text-[11px]">
                            <Tag className="w-2.5 h-2.5 text-neutral-500" />
                            {row.tag_code}
                          </span>
                        </td>

                        {/* Item Name */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-sans font-medium text-neutral-900">
                          {row.item_name}
                        </td>

                        {/* Gross Wt */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-medium text-neutral-900">
                          {row.gross_wt.toFixed(3)} g
                        </td>

                        {/* Net Wt */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700">
                          {row.net_wt.toFixed(3)} g
                        </td>

                        {/* Karat */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded text-[11px] bg-amber-50 text-amber-800 border border-amber-200">
                            {row.karat}
                          </span>
                        </td>

                        {/* HUID */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            {row.huid}
                          </span>
                        </td>

                        {/* Format */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-sans text-neutral-600 text-[11px]">
                          {row.tag_format}
                        </td>

                        {/* Status */}
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              row.status === 'PRINTED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>

                        {/* Print action */}
                        <td className="px-3.5 py-2 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleSinglePrint(row.id)}
                            className="p-1 hover:bg-neutral-100 rounded text-neutral-600 hover:text-emerald-700 transition-colors cursor-pointer"
                            title="Print Label"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </td>
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.barcode_tags_log (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">tag_code</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">item_name</span>{' '}
                  <span className="text-amber-300">varchar(255)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">printed_weight_g</span>{' '}
                  <span className="text-amber-300">numeric(10,3)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">huid</span>{' '}
                  <span className="text-amber-300">varchar(6)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">printer_name</span>{' '}
                  <span className="text-amber-300">varchar(64)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;Zebra ZD220&apos;,</span>
                  <br />
                  <span className="pl-6 text-blue-300">status</span>{' '}
                  <span className="text-amber-300">varchar(20)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;QUEUED&apos;,</span>
                  <br />
                  <span className="pl-6 text-blue-300">printed_at</span>{' '}
                  <span className="text-amber-300">timestamptz</span>{' '}
                  <span className="text-neutral-400">DEFAULT now()</span>
                  <br />
                  );
                  <br />
                  <br />
                  <span className="text-emerald-400">ALTER TABLE</span> public.barcode_tags_log{' '}
                  <span className="text-emerald-400">ENABLE ROW LEVEL SECURITY;</span>
                </div>
              </div>
            )}

            {/* Table Footer Bar */}
            <div className="h-[36px] bg-[#f8fafc] border-t border-[#e5e7eb] px-3.5 flex items-center justify-between text-[12px] text-neutral-500 font-mono select-none w-full">
              <div className="flex items-center gap-3">
                <span>{queue.length} labels in spooler</span>
                <span>•</span>
                <span>Dumbbell &amp; Rat-tail thermal ribbon ready</span>
              </div>
              <div className="text-emerald-600 font-medium">
                Printer Driver Online
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
