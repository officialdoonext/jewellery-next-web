'use client';
import React, { useState, useEffect } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import { Printer, Plus, Trash2, Wifi, WifiOff, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface PrinterDevice {
  id: number;
  name: string;
  interface: string;
  role: string;
  status: string;
  ip: string;
}

export function SettingsPrinterSettingsView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Dynamic state — clean empty state without predefault mock printers
  const [printers, setPrinters] = useState<PrinterDevice[]>([]);
  const [newPrinterName, setNewPrinterName] = useState('');
  const [newInterface, setNewInterface] = useState('USB');
  const [newIP, setNewIP] = useState('');
  const [newRole, setNewRole] = useState('POS Receipts');
  const [defaultDPI, setDefaultDPI] = useState('203');
  const [escPosRaw, setEscPosRaw] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    async function loadPrinterSettings() {
      try {
        setLoading(true);
        const docRef = doc(db, 'settings', 'printer-settings');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.printers !== undefined) setPrinters(data.printers);
          if (data.defaultDPI !== undefined) setDefaultDPI(data.defaultDPI);
          if (data.escPosRaw !== undefined) setEscPosRaw(data.escPosRaw);
        }
      } catch (err: any) {
        console.error('Error fetching printer settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPrinterSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveStatus('idle');
      const docRef = doc(db, 'settings', 'printer-settings');
      await setDoc(docRef, {
        printers,
        defaultDPI,
        escPosRaw,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setSaveStatus('success');
      setStatusMessage('Printer configurations saved successfully!');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch (err: any) {
      console.error('Error saving printer settings:', err);
      setSaveStatus('error');
      setStatusMessage(err.message || 'Failed to save printer settings');
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setSaving(false);
    }
  };

  const removePrinter = (id: number) => {
    setPrinters(ps => ps.filter(p => p.id !== id));
  };

  const addPrinter = () => {
    if (!newPrinterName.trim()) return;
    const newId = printers.length ? Math.max(...printers.map(p => p.id)) + 1 : 1;
    setPrinters(ps => [
      ...ps,
      {
        id: newId,
        name: newPrinterName.trim(),
        interface: newInterface,
        role: newRole,
        status: newInterface === 'Network' ? 'ONLINE' : 'CONFIGURED',
        ip: newIP.trim()
      }
    ]);
    setNewPrinterName('');
    setNewIP('');
    setShowAddForm(false);
  };

  const inputClass =
    'w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 placeholder:text-neutral-400 transition-colors font-medium';
  const labelClass = 'text-xs font-medium text-neutral-700 mb-1';
  const sectionClass =
    'p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs';
  const sectionHeader =
    'text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="settings_printer_settings" />
      <ActionToolbar
        filterPlaceholder="Filter printers..."
        insertLabel={saving ? 'Saving...' : 'Save Printers'}
        onInsertClick={handleSave}
      />
      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        <div className="p-4 flex flex-col gap-4 max-w-5xl w-full mx-auto">

          {/* Status Toast / Alert */}
          {saveStatus === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-medium animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-2 text-neutral-500">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <span className="text-xs font-medium">Loading printer configurations...</span>
            </div>
          ) : (
            <>
              {/* Connected Printers Table */}
              <div className={sectionClass}>
                <div className="flex items-center justify-between mb-2.5">
                  <div className={sectionHeader} style={{ marginBottom: 0 }}>
                    <Printer className="w-3.5 h-3.5 text-emerald-600" />
                    Configured Hardware Printers
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Printer
                  </button>
                </div>

                {/* Inline Add Printer Form */}
                {showAddForm && (
                  <div className="mb-3 p-3 bg-white border border-emerald-200 rounded-lg shadow-2xs">
                    <div className="text-xs font-medium text-neutral-800 mb-2">Connect New Printer</div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-2">
                      <div className="sm:col-span-2">
                        <label className={labelClass}>Printer Name / Model *</label>
                        <input
                          className={inputClass}
                          placeholder="e.g. Epson TM-T88VI or Zebra ZD220"
                          value={newPrinterName}
                          onChange={e => setNewPrinterName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Interface</label>
                        <select
                          className={inputClass}
                          value={newInterface}
                          onChange={e => setNewInterface(e.target.value)}
                        >
                          <option value="USB">USB</option>
                          <option value="Network">Network / Ethernet</option>
                          <option value="Bluetooth">Bluetooth</option>
                          <option value="Virtual">Virtual / PDF</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Assigned Role</label>
                        <select
                          className={inputClass}
                          value={newRole}
                          onChange={e => setNewRole(e.target.value)}
                        >
                          <option value="POS Receipts">POS Receipts</option>
                          <option value="A4 Invoices">A4 Invoices</option>
                          <option value="Jewellery Tags">Jewellery Tags</option>
                          <option value="Estimate Slips">Estimate Slips</option>
                        </select>
                      </div>
                      {newInterface === 'Network' && (
                        <div className="sm:col-span-4">
                          <label className={labelClass}>Network IP Address</label>
                          <input
                            className={inputClass}
                            placeholder="e.g. 192.168.1.100"
                            value={newIP}
                            onChange={e => setNewIP(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-2.5 py-1 text-xs border border-neutral-200 rounded hover:bg-neutral-50 text-neutral-600 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={addPrinter}
                        className="px-3 py-1 text-xs bg-[#24b47e] hover:bg-[#1fa070] text-white rounded font-medium shadow-2xs"
                      >
                        Confirm Add
                      </button>
                    </div>
                  </div>
                )}

                {printers.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-md border border-dashed border-[#e2e8f0]">
                    <div className="text-xs text-neutral-500 font-medium">No printers configured yet</div>
                    <div className="text-[11px] text-neutral-400 mt-1">Click &apos;Add Printer&apos; above to configure your thermal receipt, A4 laser, or barcode printer.</div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-[#e2e8f0]">
                          {['Printer Name', 'Interface', 'Assigned Role', 'Status', 'Actions'].map(h => (
                            <th key={h} className="text-left py-2 px-2 text-[10px] font-medium text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                              {h}
                            </th>
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
                            <td className="py-2.5 px-2 text-neutral-600 font-medium">{p.interface}</td>
                            <td className="py-2.5 px-2 text-neutral-600">{p.role}</td>
                            <td className="py-2.5 px-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                                p.status === 'ONLINE' || p.status === 'CONFIGURED'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-neutral-100 text-neutral-600'
                              }`}>
                                {p.status === 'ONLINE' ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
                                {p.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-2">
                              <button
                                type="button"
                                onClick={() => removePrinter(p.id)}
                                className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
                                title="Remove Printer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Hardware Printing Driver Settings */}
              <div className={sectionClass}>
                <div className={sectionHeader}>
                  <Printer className="w-3.5 h-3.5 text-emerald-600" />
                  Print Engine &amp; Resolution Preferences
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className={labelClass}>Default Tag Printer Resolution (DPI)</div>
                    <div className="flex gap-2">
                      {['203', '300', '600'].map(dpi => (
                        <button
                          key={dpi}
                          type="button"
                          onClick={() => setDefaultDPI(dpi)}
                          className={`flex-1 py-2 text-xs font-medium rounded border transition-colors ${
                            defaultDPI === dpi
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                              : 'border-[#e2e8f0] bg-white text-neutral-600 hover:border-emerald-200'
                          }`}
                        >
                          {dpi} DPI
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-md bg-white border border-[#e2e8f0]">
                    <div>
                      <div className="text-xs font-medium text-neutral-700">Raw ESC/POS Commands</div>
                      <div className="text-[11px] text-neutral-500 font-normal">Bypasses OS print dialog for ultra-fast printing</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEscPosRaw(!escPosRaw)}
                      className={`w-9 h-5 rounded-full transition-colors relative ${escPosRaw ? 'bg-emerald-500' : 'bg-neutral-200'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-all ${escPosRaw ? 'left-4' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium bg-[#24b47e] text-white hover:bg-[#1fa070] disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{saving ? 'Saving...' : 'Save Printer Settings'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
