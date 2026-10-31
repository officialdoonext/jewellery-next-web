'use client';
import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  HardDrive, CloudUpload, Download, RefreshCw,
  Lock, CheckCircle2, AlertTriangle, Clock, Upload, Save
} from 'lucide-react';

const BACKUP_HISTORY = [
  { id: 1, snapshot: 'auto_2026-10-29_2330', date: 'Oct 29, 2026 11:30 PM', size: '284.5 MB', status: 'VERIFIED' },
  { id: 2, snapshot: 'auto_2026-10-28_2330', date: 'Oct 28, 2026 11:30 PM', size: '281.2 MB', status: 'VERIFIED' },
  { id: 3, snapshot: 'manual_2026-10-27_1045', date: 'Oct 27, 2026 10:45 AM', size: '278.9 MB', status: 'VERIFIED' },
];

export function SettingsBackupRestoreView() {
  const [autoBackup, setAutoBackup] = useState(true);
  const [schedule, setSchedule] = useState('Daily Night Closing');
  const [retention, setRetention] = useState('30 days');
  const [destLocal, setDestLocal] = useState(true);
  const [destNetwork, setDestNetwork] = useState(true);
  const [destCloud, setDestCloud] = useState(true);
  const [destUSB, setDestUSB] = useState(false);
  const [selectedRestore, setSelectedRestore] = useState<number | null>(null);

  const inputClass =
    'w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 placeholder:text-neutral-400 transition-colors';
  const labelClass = 'text-xs font-medium text-neutral-700 mb-1';
  const sectionClass =
    'p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs';
  const sectionHeader =
    'text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5';

  const Toggle = ({ value, onChange, label, sub }: { value: boolean; onChange: () => void; label: string; sub?: string }) => (
    <div className="flex items-center justify-between py-2 border-b border-[#e2e8f0] last:border-0">
      <div>
        <div className="text-xs font-medium text-neutral-700">{label}</div>
        {sub && <div className="text-[11px] text-neutral-500">{sub}</div>}
      </div>
      <button
        onClick={onChange}
        className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${value ? 'bg-emerald-500' : 'bg-neutral-200'}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-all ${value ? 'left-4' : 'left-0.5'}`} />
      </button>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="settings_backup_restore" />
      <ActionToolbar
        filterPlaceholder="Filter backup settings..."
        insertLabel="Run Backup Now"
        onInsertClick={() => {}}
      />
      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        <div className="p-4 flex flex-col gap-4 max-w-5xl w-full mx-auto">

          {/* Backup Status Hero */}
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <HardDrive className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-medium text-emerald-800">Last Backup</div>
                  <div className="text-sm font-medium text-emerald-900 mt-0.5">Oct 29, 2026 11:30 PM</div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">284.5 MB · AES-256 Encrypted</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  AES-256 Verified
                </span>
              </div>
            </div>
          </div>

          {/* Backup Schedule */}
          <div className={sectionClass}>
            <div className={sectionHeader}>
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Backup Schedule
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className={labelClass}>Schedule</div>
                <select className={inputClass} value={schedule} onChange={e => setSchedule(e.target.value)}>
                  {['Daily Night Closing','Every 6 Hours','Manual Only'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <div className={labelClass}>Retention Period</div>
                <select className={inputClass} value={retention} onChange={e => setRetention(e.target.value)}>
                  {['7 days','30 days','90 days','1 year'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <Toggle value={autoBackup} onChange={() => setAutoBackup(!autoBackup)} label="Auto-Backup" sub="Automatically backup on schedule" />
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <div>
                  <div className="text-xs font-medium text-neutral-700">Encryption</div>
                  <div className="text-[11px] text-neutral-500">AES-256 — always on, cannot be disabled</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                Always ON
              </span>
            </div>
          </div>

          {/* Backup Destinations */}
          <div className={sectionClass}>
            <div className={sectionHeader}>
              <CloudUpload className="w-3.5 h-3.5 text-emerald-600" />
              Backup Destinations
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Local Storage', sub: 'C:/JewelleryNext/Backups', value: destLocal, onChange: () => setDestLocal(!destLocal), icon: '💾' },
                { label: 'Network Drive', sub: '\\\\FILESERVER\\Backups', value: destNetwork, onChange: () => setDestNetwork(!destNetwork), icon: '🖧' },
                { label: 'Cloud (Google Drive)', sub: 'jewellerybackups@drive', value: destCloud, onChange: () => setDestCloud(!destCloud), icon: '☁️' },
                { label: 'External USB', sub: 'When connected', value: destUSB, onChange: () => setDestUSB(!destUSB), icon: '🔌' },
              ].map(dest => (
                <div key={dest.label} className="flex items-center justify-between p-3 rounded-lg bg-white border border-[#e2e8f0] hover:border-emerald-200 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{dest.icon}</span>
                    <div>
                      <div className="text-xs font-medium text-neutral-800">{dest.label}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">{dest.sub}</div>
                    </div>
                  </div>
                  <button
                    onClick={dest.onChange}
                    className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${dest.value ? 'bg-emerald-500' : 'bg-neutral-200'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-all ${dest.value ? 'left-4' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Backup History */}
          <div className={sectionClass}>
            <div className={sectionHeader}>
              <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
              Backup History
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#e2e8f0]">
                  {['Snapshot','Date','Size','Status','Actions'].map(h => (
                    <th key={h} className="text-left py-2 px-2 text-[10px] font-medium text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BACKUP_HISTORY.map(b => (
                  <tr
                    key={b.id}
                    onClick={() => setSelectedRestore(b.id)}
                    className={`border-b border-[#e2e8f0] hover:bg-white/60 transition-colors cursor-pointer ${selectedRestore === b.id ? 'bg-emerald-50' : ''}`}
                  >
                    <td className="py-2.5 px-2 font-mono text-[10px] text-neutral-600">{b.snapshot}</td>
                    <td className="py-2.5 px-2 text-neutral-700">{b.date}</td>
                    <td className="py-2.5 px-2 text-neutral-600">{b.size}</td>
                    <td className="py-2.5 px-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        {b.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      <button className="flex items-center gap-1 px-2.5 py-1 rounded border border-[#e2e8f0] bg-white text-neutral-600 hover:bg-neutral-50 text-[10px] transition-colors">
                        <Download className="w-3 h-3" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Restore Section */}
          <div className={sectionClass}>
            <div className={sectionHeader}>
              <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
              Restore
            </div>

            <div className="flex items-start gap-2 p-2.5 rounded-md bg-amber-50 border border-amber-200 mb-3">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
              <div className="text-[11px] text-amber-700 font-medium">
                ⚠ Restore will replace ALL current data. This action cannot be undone. Create a backup before proceeding.
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-[#e2e8f0] hover:bg-neutral-50 transition-colors cursor-pointer shadow-2xs">
                <Upload className="w-3.5 h-3.5" />
                Upload Backup File
                <input type="file" className="hidden" accept=".jnbak,.zip" />
              </label>
              {selectedRestore && (
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Restore Selected Snapshot
                </button>
              )}
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-[#e2e8f0] hover:bg-neutral-50 transition-colors cursor-pointer shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Test Restore (Sandbox)
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer">
              <HardDrive className="w-3.5 h-3.5" />
              Run Backup Now
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer">
              <Save className="w-3.5 h-3.5" />
              Save Backup Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
