'use client';
import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import { Printer, Plus, Trash2, Wifi, WifiOff, Save, Activity } from 'lucide-react';

const INITIAL_PRINTERS = [
  { id: 1, name: 'Epson TM-T88VI', interface: 'USB', role: 'POS Receipts', status: 'CONNECTED', ip: '' },
  { id: 2, name: 'HP LaserJet Pro', interface: 'Network', role: 'A4 Invoices', status: 'CONNECTED', ip: '192.168.1.101' },
  { id: 3, name: 'Zebra ZD220', interface: 'USB', role: 'Jewellery Tags', status: 'OFFLINE', ip: '' },
];

export function SettingsPrinterSettingsView() {
  const [printers, setPrinters] = useState(INITIAL_PRINTERS);
  const [newPrinterName, setNewPrinterName] = useState('');
  const [newInterface, setNewInterface] = useState('USB');
  const [newIP, setNewIP] = useState('');
  const [newDriver, setNewDriver] = useState('Generic ESC/POS');
  const [newRole, setNewRole] = useState('POS Receipts');
  const [defaultDPI, setDefaultDPI] = useState('203');
  const [escPosRaw, setEscPosRaw] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const inputClass =
    'w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 placeholder:text-neutral-400 transition-colors';
  const labelClass = 'text-xs font-medium text-neutral-700 mb-1';
  const sectionClass =
    'p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs';
  const sectionHeader =
    'text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5';

  const removePrinter = (id: number) => setPrinters(ps => ps.filter(p => p.id !== id));

  const addPrinter = () => {
    if (!newPrinterName.trim()) return;
    const newId = Math.max(...printers.map(p => p.id)) + 1;
    setPrinters(ps => [...ps, { id: newId, name: newPrinterName, interface: newInterface, role: newRole, status: 'OFFLINE', ip: newIP }]);
    setNewPrinterName('');
    setNewIP('');
    setShowAddForm(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="settings_printer_settings" />
      <ActionToolbar
        filterPlaceholder="Filter printers..."
        insertLabel="Add Printer"
        onInsertClick={() => setShowAddForm(true)}
      />
      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        <div className="p-4 flex flex-col gap-4 max-w-5xl w-full mx-auto">

          {/* Connected Printers Table */}
          <div className={sectionClass}>
            <div className="flex items-center justify-between mb-2.5">
              <div className={sectionHeader} style={{ marginBottom: 0 }}>
                <Printer className="w-3.5 h-3.5 text-emerald-600" />
                Connected Printers
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add Printer
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#e2e8f0]">
                    {['Printer Name','Interface','Assigned Role','Status','Actions'].map(h => (
                      <th key={h} className="text-left py-2 px-2 text-[10px] font-medium text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {printers.map(p => (
                    <tr key={p.id} className="border-b border-[#e2e8f0] hover:bg-white/60 transition-colors">
                      <td className="py-2.5 px-2">
                        <div className="font-medium text-neutral-800">{p.name}</div>
                        {p.ip && <div className="text-[10px] text-neutral-500 font-mono">{p.ip}</div>}
                      </td>
                      <td className="py-2.5 px-2 text-neutral-600">{p.interface}</td>
                      <td className="py-2.5 px-2 text-neutral-600">{p.role}</td>
                      <td className="py-2.5 px-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${p.status === 'CONNECTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                          {p.status === 'CONNECTED' ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-1">
                          <button className="px-2.5 py-1 text-[10px] font-medium rounded border border-[#e2e8f0] bg-white text-neutral-600 hover:bg-neutral-50 transition-colors">
                            Test Print
                          </button>
                          <button
                            onClick={() => removePrinter(p.id)}
                            className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Printer Form */}
          {showAddForm && (
            <div className={`${sectionClass} border-emerald-300`}>
              <div className={sectionHeader}>
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                Add New Printer
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className={labelClass}>Printer Name</div>
                  <input className={inputClass} value={newPrinterName} onChange={e => setNewPrinterName(e.target.value)} placeholder="e.g. Epson TM-T88VII" />
                </div>
                <div>
                  <div className={labelClass}>Interface Type</div>
                  <select className={inputClass} value={newInterface} onChange={e => setNewInterface(e.target.value)}>
                    {['USB','Network','Bluetooth','Serial'].map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <div className={labelClass}>IP Address / COM Port</div>
                  <input className={inputClass} value={newIP} onChange={e => setNewIP(e.target.value)} placeholder="192.168.1.x or COM3" />
                </div>
                <div>
                  <div className={labelClass}>Driver</div>
                  <select className={inputClass} value={newDriver} onChange={e => setNewDriver(e.target.value)}>
                    {['Generic ESC/POS','Zebra ZPL','Epson ESC/POS','Star STAR-PRY'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <div className={labelClass}>Assigned Role</div>
                  <select className={inputClass} value={newRole} onChange={e => setNewRole(e.target.value)}>
                    {['POS Receipts','A4 Invoices','Tags','Certificate'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={addPrinter}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Printer
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-600 border border-[#e2e8f0] hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Print Quality */}
          <div className={sectionClass}>
            <div className={sectionHeader}>
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              Print Quality
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className={labelClass}>Default DPI</div>
                <div className="flex gap-2">
                  {['203','300','600'].map(dpi => (
                    <button
                      key={dpi}
                      onClick={() => setDefaultDPI(dpi)}
                      className={`flex-1 py-2 text-xs font-medium rounded border transition-colors ${defaultDPI === dpi ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-[#e2e8f0] bg-white text-neutral-600 hover:border-emerald-200'}`}
                    >
                      {dpi} DPI
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className={labelClass}>Paper Width (POS Receipts)</div>
                <select className={inputClass}>
                  <option>80mm</option>
                  <option>58mm</option>
                  <option>76mm</option>
                </select>
              </div>
              <div>
                <div className={labelClass}>Paper Width (Tag Printer)</div>
                <select className={inputClass}>
                  <option>68mm</option>
                  <option>50mm</option>
                  <option>40mm</option>
                  <option>30mm</option>
                </select>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between py-2 border-t border-[#e2e8f0]">
              <div>
                <div className="text-xs font-medium text-neutral-700">ESC/POS Raw Commands</div>
                <div className="text-[11px] text-neutral-500">Advanced: send raw printer commands directly</div>
              </div>
              <button
                onClick={() => setEscPosRaw(!escPosRaw)}
                className={`w-9 h-5 rounded-full transition-colors relative ${escPosRaw ? 'bg-emerald-500' : 'bg-neutral-200'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-all ${escPosRaw ? 'left-4' : 'left-0.5'}`} />
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer">
              <Save className="w-3.5 h-3.5" />
              Save Printer Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
