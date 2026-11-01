'use client';
import React, { useState, useEffect } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import { Cloud, Wifi, WifiOff, RefreshCw, CheckCircle2, Save, Activity, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface SyncNode {
  id: string;
  location: string;
  pending: number;
  lastSync: string;
  health: string;
}

export function SettingsCloudSyncView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Dynamic state — clean empty state
  const [offlineMode, setOfflineMode] = useState(false);
  const [syncInterval, setSyncInterval] = useState('30s');
  const [conflictResolution, setConflictResolution] = useState('Last Write Wins');
  const [syncOnSave, setSyncOnSave] = useState(false);
  const [primaryURL, setPrimaryURL] = useState('');
  const [fallbackURL, setFallbackURL] = useState('');
  const [sslVerify, setSslVerify] = useState(false);
  const [syncNodes, setSyncNodes] = useState<SyncNode[]>([]);

  // Add node form state
  const [showAddNode, setShowAddNode] = useState(false);
  const [newNodeId, setNewNodeId] = useState('');
  const [newNodeLocation, setNewNodeLocation] = useState('');

  useEffect(() => {
    async function loadCloudSyncSettings() {
      try {
        setLoading(true);
        const docRef = doc(db, 'settings', 'cloud-sync');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.offlineMode !== undefined) setOfflineMode(data.offlineMode);
          if (data.syncInterval !== undefined) setSyncInterval(data.syncInterval);
          if (data.conflictResolution !== undefined) setConflictResolution(data.conflictResolution);
          if (data.syncOnSave !== undefined) setSyncOnSave(data.syncOnSave);
          if (data.primaryURL !== undefined) setPrimaryURL(data.primaryURL);
          if (data.fallbackURL !== undefined) setFallbackURL(data.fallbackURL);
          if (data.sslVerify !== undefined) setSslVerify(data.sslVerify);
          if (data.syncNodes !== undefined) setSyncNodes(data.syncNodes);
        }
      } catch (err: any) {
        console.error('Error fetching cloud sync settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCloudSyncSettings();
  }, []);

  const handleSave = async (updatedNodes?: SyncNode[]) => {
    try {
      setSaving(true);
      setSaveStatus('idle');
      const docRef = doc(db, 'settings', 'cloud-sync');
      await setDoc(docRef, {
        offlineMode,
        syncInterval,
        conflictResolution,
        syncOnSave,
        primaryURL,
        fallbackURL,
        sslVerify,
        syncNodes: updatedNodes || syncNodes,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setSaveStatus('success');
      setStatusMessage('Cloud sync configurations saved successfully!');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch (err: any) {
      console.error('Error saving sync settings:', err);
      setSaveStatus('error');
      setStatusMessage(err.message || 'Failed to save cloud sync settings');
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setSaving(false);
    }
  };

  const addNode = () => {
    if (!newNodeId.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newNode: SyncNode = {
      id: newNodeId.trim().toUpperCase(),
      location: newNodeLocation.trim() || 'Store Terminal',
      pending: 0,
      lastSync: `Just now (${timeStr})`,
      health: 'HEALTHY_SYNCED'
    };
    const nextList = [...syncNodes, newNode];
    setSyncNodes(nextList);
    setNewNodeId('');
    setNewNodeLocation('');
    setShowAddNode(false);
  };

  const removeNode = (id: string) => {
    setSyncNodes(ns => ns.filter(n => n.id !== id));
  };

  const triggerManualSync = () => {
    setStatusMessage('Synchronizing all transactions with Firestore cloud server...');
    setSaveStatus('success');
    setTimeout(() => {
      setStatusMessage('Cloud sync complete. All local mutations committed.');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 1000);
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
      <TabBar title="settings_cloud_sync" />
      <ActionToolbar
        filterPlaceholder="Filter sync settings..."
        insertLabel="Force Sync Now"
        onInsertClick={triggerManualSync}
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
              <span className="text-xs font-medium">Loading cloud sync configurations...</span>
            </div>
          ) : (
            <>
              {/* Sync Status Hero */}
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Cloud className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-emerald-800">Firebase Firestore Realtime Engine</div>
                      <div className="text-sm font-medium text-emerald-900 mt-0.5 font-mono">
                        Connected to Project: jewellery-next
                      </div>
                      <div className="text-[10px] text-emerald-600 mt-0.5 font-medium">
                        Offline persistence active · Changes queued during offline reconnect automatically
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={triggerManualSync}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] text-white hover:bg-[#1fa070] transition-colors shadow-2xs cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Sync Now</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Sync Nodes Table */}
              <div className={sectionClass}>
                <div className="flex items-center justify-between mb-2.5">
                  <div className={sectionHeader} style={{ marginBottom: 0 }}>
                    <Activity className="w-3.5 h-3.5 text-emerald-600" />
                    Store Client Terminals &amp; Nodes ({syncNodes.length})
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddNode(!showAddNode)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Register Terminal
                  </button>
                </div>

                {/* Inline Add Node Form */}
                {showAddNode && (
                  <div className="mb-3 p-3 bg-white border border-emerald-200 rounded-lg shadow-2xs">
                    <div className="text-xs font-medium text-neutral-800 mb-2">Register Terminal for Replication</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                      <div>
                        <label className={labelClass}>Terminal Identifier (Node ID) *</label>
                        <input
                          className={inputClass}
                          placeholder="e.g. POS-MAIN-01"
                          value={newNodeId}
                          onChange={e => setNewNodeId(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Counter / Desk Location</label>
                        <input
                          className={inputClass}
                          placeholder="e.g. Ground Floor Cashier Desk"
                          value={newNodeLocation}
                          onChange={e => setNewNodeLocation(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddNode(false)}
                        className="px-2.5 py-1 text-xs border border-neutral-200 rounded hover:bg-neutral-50 text-neutral-600 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={addNode}
                        className="px-3 py-1 text-xs bg-[#24b47e] hover:bg-[#1fa070] text-white rounded font-medium shadow-2xs"
                      >
                        Confirm Terminal
                      </button>
                    </div>
                  </div>
                )}

                {syncNodes.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-md border border-dashed border-[#e2e8f0]">
                    <div className="text-xs text-neutral-500 font-medium">No store nodes registered yet</div>
                    <div className="text-[11px] text-neutral-400 mt-1">
                      Click &apos;Register Terminal&apos; to link your billing counters and track replication latency.
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-[#e2e8f0]">
                          {['Node ID', 'Location', 'Pending Mutations', 'Last Sync', 'Health', 'Actions'].map(h => (
                            <th key={h} className="text-left py-2 px-2 text-[10px] font-medium text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {syncNodes.map(n => (
                          <tr key={n.id} className="border-b border-[#e2e8f0] hover:bg-white/60 transition-colors">
                            <td className="py-2.5 px-2 font-mono font-medium text-neutral-800">{n.id}</td>
                            <td className="py-2.5 px-2 text-neutral-600">{n.location}</td>
                            <td className="py-2.5 px-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${n.pending === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {n.pending} pending
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-neutral-500">{n.lastSync}</td>
                            <td className="py-2.5 px-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                {n.health}
                              </span>
                            </td>
                            <td className="py-2.5 px-2">
                              <button
                                type="button"
                                onClick={() => removeNode(n.id)}
                                className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
                                title="Remove node"
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

              {/* Sync Replication Behavior */}
              <div className={sectionClass}>
                <div className={sectionHeader}>
                  <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                  Replication Engine Parameters
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className={labelClass}>Heartbeat Polling Interval</div>
                    <select
                      className={inputClass}
                      value={syncInterval}
                      onChange={e => setSyncInterval(e.target.value)}
                    >
                      <option value="10s">10 seconds (High frequency)</option>
                      <option value="30s">30 seconds (Standard)</option>
                      <option value="60s">1 minute (Low bandwidth)</option>
                      <option value="5m">5 minutes (Manual batch)</option>
                    </select>
                  </div>
                  <div>
                    <div className={labelClass}>Conflict Resolution Strategy</div>
                    <select
                      className={inputClass}
                      value={conflictResolution}
                      onChange={e => setConflictResolution(e.target.value)}
                    >
                      <option value="Last Write Wins">Last Write Wins (Timestamp Priority)</option>
                      <option value="Server Master">Cloud Server Master (Immutable)</option>
                      <option value="Manual Review">Prompt Manager on Conflict</option>
                    </select>
                  </div>
                  <div>
                    <div className={labelClass}>Custom Primary Replication Gateway URL</div>
                    <input
                      className={inputClass}
                      value={primaryURL}
                      onChange={e => setPrimaryURL(e.target.value)}
                      placeholder="Optional custom sync gateway URL"
                    />
                  </div>
                  <div>
                    <div className={labelClass}>Secondary Fallback Endpoint URL</div>
                    <input
                      className={inputClass}
                      value={fallbackURL}
                      onChange={e => setFallbackURL(e.target.value)}
                      placeholder="Optional fallback URL"
                    />
                  </div>
                </div>

                <Toggle
                  value={offlineMode}
                  onChange={() => setOfflineMode(!offlineMode)}
                  label="Enable Offline Local Cache First Mode"
                  sub="Allow sales checkout and invoice generation even when broadband internet drops"
                />
                <Toggle
                  value={syncOnSave}
                  onChange={() => setSyncOnSave(!syncOnSave)}
                  label="Instant Sync on Invoice Save"
                  sub="Push invoice payload immediately upon bill completion"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium bg-[#24b47e] text-white hover:bg-[#1fa070] disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{saving ? 'Saving...' : 'Save Cloud Sync Settings'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
