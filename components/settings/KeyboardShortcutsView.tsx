'use client';
import React, { useState, useEffect } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import { Keyboard, Plus, Trash2, Info, Save, Loader2, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface ShortcutItem {
  id: number;
  action: string;
  shortcut: string;
  context: string;
  group: string;
}

const DEFAULT_PRESET: ShortcutItem[] = [
  { id: 1, action: 'New POS Bill', shortcut: 'F2', context: 'POS Billing', group: 'POS Billing' },
  { id: 2, action: 'Weigh Item', shortcut: 'F3', context: 'POS Billing', group: 'POS Billing' },
  { id: 3, action: 'Add Customer', shortcut: 'F4', context: 'POS Billing', group: 'POS Billing' },
  { id: 4, action: 'Cash Out / Payment', shortcut: 'F8', context: 'POS Billing', group: 'POS Billing' },
  { id: 5, action: 'Park / Hold Bill', shortcut: 'Ctrl+Space', context: 'POS Billing', group: 'POS Billing' },
  { id: 6, action: 'Open Global Search', shortcut: 'Ctrl+K', context: 'Global', group: 'Navigation' },
  { id: 7, action: 'Toggle Sidebar', shortcut: 'Ctrl+B', context: 'Global', group: 'Navigation' },
];

export function SettingsKeyboardShortcutsView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Dynamic state — clean empty state by default
  const [shortcuts, setShortcuts] = useState<ShortcutItem[]>([]);
  const [newAction, setNewAction] = useState('');
  const [newShortcut, setNewShortcut] = useState('');
  const [newContext, setNewContext] = useState('POS Billing');
  const [newGroup, setNewGroup] = useState('POS Billing');
  const [recording, setRecording] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    async function loadShortcuts() {
      try {
        setLoading(true);
        const docRef = doc(db, 'settings', 'keyboard-shortcuts');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.shortcuts !== undefined) setShortcuts(data.shortcuts);
        }
      } catch (err: any) {
        console.error('Error fetching shortcuts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadShortcuts();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveStatus('idle');
      const docRef = doc(db, 'settings', 'keyboard-shortcuts');
      await setDoc(docRef, {
        shortcuts,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setSaveStatus('success');
      setStatusMessage('Keyboard shortcuts saved successfully!');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch (err: any) {
      console.error('Error saving shortcuts:', err);
      setSaveStatus('error');
      setStatusMessage(err.message || 'Failed to save keyboard shortcuts');
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyRecord = (e: React.KeyboardEvent) => {
    e.preventDefault();
    const parts: string[] = [];
    if (e.ctrlKey) parts.push('Ctrl');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');
    if (e.metaKey) parts.push('Meta');
    if (!['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
      parts.push(e.key.length === 1 ? e.key.toUpperCase() : e.key);
    }
    if (parts.length) {
      setNewShortcut(parts.join('+'));
      setRecording(false);
    }
  };

  const addShortcut = () => {
    if (!newAction.trim() || !newShortcut.trim()) return;
    const newId = shortcuts.length ? Math.max(...shortcuts.map(s => s.id)) + 1 : 1;
    setShortcuts(ss => [
      ...ss,
      {
        id: newId,
        action: newAction.trim(),
        shortcut: newShortcut.trim(),
        context: newContext,
        group: newGroup
      }
    ]);
    setNewAction('');
    setNewShortcut('');
    setShowAddForm(false);
  };

  const removeShortcut = (id: number) => {
    setShortcuts(ss => ss.filter(s => s.id !== id));
  };

  const loadDefaults = () => {
    setShortcuts(DEFAULT_PRESET);
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
      <TabBar title="settings_keyboard_shortcuts" />
      <ActionToolbar
        filterPlaceholder="Filter shortcuts..."
        insertLabel={saving ? 'Saving...' : 'Save Shortcuts'}
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
              <span className="text-xs font-medium">Loading shortcuts...</span>
            </div>
          ) : (
            <>
              {/* Header note & action */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-xs text-blue-700 font-medium">
                    Customize hotkeys for counter bill generation, barcode scans, and navigation.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadDefaults}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Load Suggested Presets
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Shortcut
                  </button>
                </div>
              </div>

              {/* Inline Add Shortcut Form */}
              {showAddForm && (
                <div className="p-3 bg-white border border-emerald-200 rounded-lg shadow-2xs">
                  <div className="text-xs font-medium text-neutral-800 mb-2">Create Custom Keyboard Hotkey</div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-2">
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Action Description *</label>
                      <input
                        className={inputClass}
                        placeholder="e.g. Quick Cash Bill or Hold Order"
                        value={newAction}
                        onChange={e => setNewAction(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Key Combination *</label>
                      <div className="relative">
                        <input
                          className={`${inputClass} font-mono`}
                          placeholder={recording ? 'Press keys on keyboard...' : 'Click & press keys'}
                          value={newShortcut}
                          onFocus={() => setRecording(true)}
                          onBlur={() => setRecording(false)}
                          onKeyDown={handleKeyRecord}
                          readOnly
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Scope / Category</label>
                      <select
                        className={inputClass}
                        value={newGroup}
                        onChange={e => setNewGroup(e.target.value)}
                      >
                        <option value="POS Billing">POS Billing</option>
                        <option value="Navigation">Navigation</option>
                        <option value="Inventory">Inventory</option>
                        <option value="Reports">Reports</option>
                      </select>
                    </div>
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
                      onClick={addShortcut}
                      className="px-3 py-1 text-xs bg-[#24b47e] hover:bg-[#1fa070] text-white rounded font-medium shadow-2xs"
                    >
                      Save Hotkey
                    </button>
                  </div>
                </div>
              )}

              {/* Shortcuts List */}
              <div className={sectionClass}>
                <div className={sectionHeader}>
                  <Keyboard className="w-3.5 h-3.5 text-emerald-600" />
                  Active Hotkeys ({shortcuts.length})
                </div>

                {shortcuts.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-md border border-dashed border-[#e2e8f0]">
                    <div className="text-xs text-neutral-500 font-medium">No keyboard shortcuts defined yet</div>
                    <div className="text-[11px] text-neutral-400 mt-1">
                      Click &apos;Add Shortcut&apos; to record your custom keys or &apos;Load Suggested Presets&apos;.
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-[#e2e8f0]">
                          {['Action', 'Key Combination', 'Scope / Group', 'Actions'].map(h => (
                            <th key={h} className="text-left py-2 px-2 text-[10px] font-medium text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {shortcuts.map(s => (
                          <tr key={s.id} className="border-b border-[#e2e8f0] hover:bg-white/60 transition-colors">
                            <td className="py-2.5 px-2 font-medium text-neutral-800">{s.action}</td>
                            <td className="py-2.5 px-2">
                              <span className="font-mono text-xs px-2 py-1 rounded bg-neutral-100 border border-neutral-200 text-neutral-800 font-medium">
                                {s.shortcut}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-neutral-600">{s.group}</td>
                            <td className="py-2.5 px-2">
                              <button
                                type="button"
                                onClick={() => removeShortcut(s.id)}
                                className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
                                title="Remove shortcut"
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

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium bg-[#24b47e] text-white hover:bg-[#1fa070] disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{saving ? 'Saving...' : 'Save Keyboard Shortcuts'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
