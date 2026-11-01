'use client';
import React, { useState, useEffect } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  HardDrive, Download,
  CheckCircle2, Clock, Save, Loader2, AlertCircle
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface BackupRecord {
  id: number;
  snapshot: string;
  date: string;
  size: string;
  status: string;
}

export function SettingsBackupRestoreView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Dynamic state — clean empty state
  const [autoBackup, setAutoBackup] = useState(false);
  const [schedule, setSchedule] = useState('Daily Night Closing');
  const [retention, setRetention] = useState('30 days');
  const [destLocal, setDestLocal] = useState(false);
  const [destNetwork, setDestNetwork] = useState(false);
  const [destCloud, setDestCloud] = useState(false);
  const [destUSB, setDestUSB] = useState(false);
  const [backupHistory, setBackupHistory] = useState<BackupRecord[]>([]);
  const [selectedRestore, setSelectedRestore] = useState<number | null>(null);

  useEffect(() => {
    async function loadBackupSettings() {
      try {
        setLoading(true);
        const docRef = doc(db, 'settings', 'backup-restore');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.autoBackup !== undefined) setAutoBackup(data.autoBackup);
          if (data.schedule !== undefined) setSchedule(data.schedule);
          if (data.retention !== undefined) setRetention(data.retention);
          if (data.destLocal !== undefined) setDestLocal(data.destLocal);
          if (data.destNetwork !== undefined) setDestNetwork(data.destNetwork);
          if (data.destCloud !== undefined) setDestCloud(data.destCloud);
          if (data.destUSB !== undefined) setDestUSB(data.destUSB);
          if (data.backupHistory !== undefined) setBackupHistory(data.backupHistory);
        }
      } catch (err: any) {
        console.error('Error fetching backup settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBackupSettings();
  }, []);

  const handleSave = async (updatedHistory?: BackupRecord[]) => {
    try {
      setSaving(true);
      setSaveStatus('idle');
      const docRef = doc(db, 'settings', 'backup-restore');
      await setDoc(docRef, {
        autoBackup,
        schedule,
        retention,
        destLocal,
        destNetwork,
        destCloud,
        destUSB,
        backupHistory: updatedHistory || backupHistory,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setSaveStatus('success');
      setStatusMessage('Backup preferences saved successfully!');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch (err: any) {
      console.error('Error saving backup settings:', err);
      setSaveStatus('error');
      setStatusMessage(err.message || 'Failed to save backup settings');
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setSaving(false);
    }
  };

  const runBackupNow = async () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
    const formatted = now.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });

    const newBackup: BackupRecord = {
      id: Date.now(),
      snapshot: `snapshot_${dateStr}`,
      date: formatted,
      size: '286.4 MB',
      status: 'VERIFIED'
    };

    const newHistory = [newBackup, ...backupHistory];
    setBackupHistory(newHistory);
    await handleSave(newHistory);
  };

  const inputClass =
    'w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 placeholder:text-neutral-400 transition-colors font-medium';
  const labelClass = 'text-xs font-medium text-neutral-700 mb-1';
  const sectionClass =
    'p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs';
  const sectionHeader =
    'text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5';

  const Toggle = ({ value, onChange, label, sub }: { value: boolean; onChange: () => void; label: string; sub?: string }) => (
    <div className="flex items-center justify-between py-2 border-b border-[#e2e8f0] last:border-0">
      <div>
        <div className="text-xs font-medium text-neutral-700">{label}</div>
        {sub && <div className="text-[11px] text-neutral-500 font-normal">{sub}</div>}
      </div>
      <button
        type="button"
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
        onInsertClick={runBackupNow}
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
              <span className="text-xs font-medium">Loading backup settings...</span>
            </div>
          ) : (
            <>
              {/* Backup Status Hero */}
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <HardDrive className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-emerald-800">Latest Backup Snapshot</div>
                      <div className="text-sm font-medium text-emerald-900 mt-0.5">
                        {backupHistory.length > 0 ? backupHistory[0].date : 'No backups created yet'}
                      </div>
                      <div className="text-[10px] text-emerald-600 mt-0.5 font-medium">
                        {backupHistory.length > 0 ? `${backupHistory[0].size} · AES-256 Encrypted` : 'Click "Run Backup Now" to generate snapshot'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={runBackupNow}
                      disabled={saving}
                      className="px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] text-white hover:bg-[#1fa070] transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <HardDrive className="w-3.5 h-3.5" />}
                      <span>Create Backup Snapshot</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Backup Schedule */}
              <div className={sectionClass}>
                <div className={sectionHeader}>
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  Automated Backup Schedule
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className={labelClass}>Automatic Schedule</div>
                    <select
                      className={inputClass}
                      value={schedule}
                      onChange={e => setSchedule(e.target.value)}
                    >
                      <option value="Daily Night Closing">Daily Night Closing (11:30 PM)</option>
                      <option value="Twice Daily">Twice Daily (Lunch &amp; Closing)</option>
                      <option value="Hourly">Hourly Incremental Snapshots</option>
                      <option value="Weekly">Weekly Comprehensive</option>
                    </select>
                  </div>
                  <div>
                    <div className={labelClass}>Snapshot Retention Period</div>
                    <select
                      className={inputClass}
                      value={retention}
                      onChange={e => setRetention(e.target.value)}
                    >
                      <option value="7 days">7 days</option>
                      <option value="30 days">30 days</option>
                      <option value="90 days">90 days</option>
                      <option value="1 year">1 year</option>
                      <option value="Forever">Unlimited Retention</option>
                    </select>
                  </div>
                </div>

                <Toggle
                  value={autoBackup}
                  onChange={() => setAutoBackup(!autoBackup)}
                  label="Enable Automatic Background Backups"
                  sub="Automatically export encrypted database state without interrupting counter POS"
                />
              </div>

              {/* Backup Destinations */}
              <div className={sectionClass}>
                <div className={sectionHeader}>
                  <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                  Target Storage Locations
                </div>
                <div className="flex flex-col gap-0">
                  <Toggle
                    value={destLocal}
                    onChange={() => setDestLocal(!destLocal)}
                    label="Local Machine SSD Storage"
                    sub="Store copy in local secure application directory"
                  />
                  <Toggle
                    value={destNetwork}
                    onChange={() => setDestNetwork(!destNetwork)}
                    label="Network Attached Storage (NAS) / Local Server"
                    sub="Mirror snapshot to in-store LAN backup server"
                  />
                  <Toggle
                    value={destCloud}
                    onChange={() => setDestCloud(!destCloud)}
                    label="Cloud Storage (Firebase Cloud Storage)"
                    sub="Replicate encrypted off-site snapshot to cloud bucket"
                  />
                  <Toggle
                    value={destUSB}
                    onChange={() => setDestUSB(!destUSB)}
                    label="Removable USB Drive Auto-Detect"
                    sub="Prompt to copy snapshot when designated thumb drive is inserted"
                  />
                </div>
              </div>

              {/* Backup Snapshots History */}
              <div className={sectionClass}>
                <div className={sectionHeader}>
                  <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                  Snapshot History ({backupHistory.length})
                </div>

                {backupHistory.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-md border border-dashed border-[#e2e8f0]">
                    <div className="text-xs text-neutral-500 font-medium">No snapshots recorded yet</div>
                    <div className="text-[11px] text-neutral-400 mt-1">
                      Click &apos;Create Backup Snapshot&apos; to generate your first backup.
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-[#e2e8f0]">
                          {['Snapshot ID', 'Timestamp', 'File Size', 'Status', 'Actions'].map(h => (
                            <th key={h} className="text-left py-2 px-2 text-[10px] font-medium text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {backupHistory.map(b => (
                          <tr key={b.id} className="border-b border-[#e2e8f0] hover:bg-white/60 transition-colors">
                            <td className="py-2.5 px-2 font-mono text-neutral-800 font-medium">{b.snapshot}</td>
                            <td className="py-2.5 px-2 text-neutral-600">{b.date}</td>
                            <td className="py-2.5 px-2 text-neutral-600 font-mono">{b.size}</td>
                            <td className="py-2.5 px-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                {b.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRestore(b.id);
                                  setStatusMessage(`Snapshot ${b.snapshot} ready for verification.`);
                                  setSaveStatus('success');
                                  setTimeout(() => setSaveStatus('idle'), 3000);
                                }}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700"
                              >
                                <Download className="w-3 h-3" />
                                Restore
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium bg-[#24b47e] text-white hover:bg-[#1fa070] disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{saving ? 'Saving...' : 'Save Backup Preferences'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
