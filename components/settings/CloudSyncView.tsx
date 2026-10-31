'use client';
import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import { Cloud, Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle2, Save, Activity, Database } from 'lucide-react';

const SYNC_NODES = [
  { id: 'HYD-COUNTER-01', location: 'Main Counter', pending: 0, lastSync: '15:45 today', health: 'HEALTHY_SYNCED' },
  { id: 'HYD-ADMIN', location: 'Admin PC', pending: 0, lastSync: '15:44 today', health: 'HEALTHY_SYNCED' },
  { id: 'HYD-VAULT', location: 'Vault Terminal', pending: 2, lastSync: '12:30 today', health: 'WARNING' },
];

export function SettingsCloudSyncView() {
  const [offlineMode, setOfflineMode] = useState(true);
  const [syncInterval, setSyncInterval] = useState('30s');
  const [conflictResolution, setConflictResolution] = useState('Last Write Wins');
  const [syncOnSave, setSyncOnSave] = useState(true);
  const [primaryURL, setPrimaryURL] = useState('https://sync.jewellerynext.in/api/v2');
  const [fallbackURL, setFallbackURL] = useState('https://sync2.jewellerynext.in/api/v2');
  const [sslVerify, setSslVerify] = useState(true);

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
      <TabBar title="settings_cloud_sync" />
      <ActionToolbar
        filterPlaceholder="Filter sync settings..."
        insertLabel="Force Sync Now"
        onInsertClick={() => {}}
      />
      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        <div className="p-4 flex flex-col gap-4 max-w-5xl w-full mx-auto">

          {/* Sync Status Hero */}
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-medium text-emerald-800">This Node</div>
                  <div className="text-sm font-medium text-emerald-900 mt-0.5 font-mono">HYD-COUNTER-01</div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">0 Pending Mutations · Last Sync 15:45 today</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  HEALTHY_SYNCED
                </span>
              </div>
            </div>
          </div>

          {/* Sync Nodes Table */}
          <div className={sectionClass}>
            <div className={sectionHeader}>
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              Sync Nodes
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#e2e8f0]">
                    {['Node ID','Location','Pending','Last Sync','Health','Actions'].map(h => (
                      <th key={h} className="text-left py-2 px-2 text-[10px] font-medium text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SYNC_NODES.map(node => (
                    <tr key={node.id} className="border-b border-[#e2e8f0] hover:bg-white/60 transition-colors">
                      <td className="py-2.5 px-2 font-mono text-[10px] text-neutral-700 font-medium">{node.id}</td>
                      <td className="py-2.5 px-2 text-neutral-700">{node.location}</td>
                      <td className="py-2.5 px-2">
                        {node.pending > 0 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700">{node.pending} pending</span>
                        ) : (
                          <span className="text-[10px] text-neutral-500">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-neutral-600 text-[10px]">{node.lastSync}</td>
                      <td className="py-2.5 px-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${node.health === 'HEALTHY_SYNCED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {node.health === 'HEALTHY_SYNCED' ? <Wifi className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                          {node.health}
                        </span>
                      </td>
                      <td className="py-2.5 px-2">
                        <button className="flex items-center gap-1 px-2.5 py-1 rounded border border-[#e2e8f0] bg-white text-neutral-600 hover:bg-neutral-50 text-[10px] transition-colors">
                          <RefreshCw className="w-3 h-3" />
                          Sync
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sync Configuration */}
          <div className={sectionClass}>
            <div className={sectionHeader}>
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              Sync Configuration
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className={labelClass}>Auto-sync Interval</div>
                <div className="flex gap-2">
                  {['30s','1min','5min','Manual'].map(i => (
                    <button
                      key={i}
                      onClick={() => setSyncInterval(i)}
                      className={`flex-1 py-2 text-[10px] font-medium rounded border transition-colors ${syncInterval === i ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-[#e2e8f0] bg-white text-neutral-600 hover:border-emerald-200'}`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className={labelClass}>Conflict Resolution</div>
                <select className={inputClass} value={conflictResolution} onChange={e => setConflictResolution(e.target.value)}>
                  {['Last Write Wins','Timestamp Priority','Manual Review'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <Toggle value={offlineMode} onChange={() => setOfflineMode(!offlineMode)} label="Offline Mode" sub="Keep billing active when internet is unavailable" />
            <Toggle value={syncOnSave} onChange={() => setSyncOnSave(!syncOnSave)} label="Sync on Save" sub="Immediately sync when a record is saved" />
          </div>

          {/* Network Settings */}
          <div className={sectionClass}>
            <div className={sectionHeader}>
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              Network Settings
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <div className={labelClass}>Primary Server URL</div>
                <input className={inputClass} value={primaryURL} onChange={e => setPrimaryURL(e.target.value)} />
              </div>
              <div>
                <div className={labelClass}>Fallback URL</div>
                <input className={inputClass} value={fallbackURL} onChange={e => setFallbackURL(e.target.value)} />
              </div>
              <div className="flex items-center justify-between py-2 border-t border-[#e2e8f0]">
                <div>
                  <div className="text-xs font-medium text-neutral-700">SSL Certificate Verification</div>
                  <div className="text-[11px] text-neutral-500">Verify server certificate for secure connections</div>
                </div>
                <button
                  onClick={() => setSslVerify(!sslVerify)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${sslVerify ? 'bg-emerald-500' : 'bg-neutral-200'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-all ${sslVerify ? 'left-4' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Pending Mutations */}
          <div className={sectionClass}>
            <div className={sectionHeader}>
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              Pending Mutations Queue
              <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">2 Pending</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {[
                { op: 'UPDATE', table: 'inventory', record: 'TAG-2026-4521', node: 'HYD-VAULT', time: '12:30 PM' },
                { op: 'INSERT', table: 'sales', record: 'INV-2026-0891', node: 'HYD-VAULT', time: '12:28 PM' },
              ].map((mut, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded bg-amber-50 border border-amber-200">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${mut.op === 'UPDATE' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {mut.op}
                  </span>
                  <span className="text-[10px] text-neutral-700 font-mono">{mut.table}</span>
                  <span className="text-[10px] text-neutral-600">{mut.record}</span>
                  <span className="text-[10px] text-neutral-500 ml-auto">{mut.node} · {mut.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5" />
                Force Sync Now
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-red-600 border border-red-200 hover:bg-red-50 transition-colors cursor-pointer">
                <WifiOff className="w-3.5 h-3.5" />
                Clear Sync Queue
              </button>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer">
              <Save className="w-3.5 h-3.5" />
              Save Sync Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
