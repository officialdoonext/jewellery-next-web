'use client';
import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import { Keyboard, Edit3, Plus, AlertTriangle, Info, Save } from 'lucide-react';

const PRESET_SHORTCUTS = [
  { id: 1, action: 'New POS Bill', shortcut: 'F2', context: 'POS Billing', group: 'POS Billing' },
  { id: 2, action: 'Weigh Item', shortcut: 'F3', context: 'POS Billing', group: 'POS Billing' },
  { id: 3, action: 'Add Customer', shortcut: 'F4', context: 'POS Billing', group: 'POS Billing' },
  { id: 4, action: 'Cash Out / Payment', shortcut: 'F8', context: 'POS Billing', group: 'POS Billing' },
  { id: 5, action: 'Park / Hold Bill', shortcut: 'Ctrl+Space', context: 'POS Billing', group: 'POS Billing' },
  { id: 6, action: 'Open Search', shortcut: 'Ctrl+K', context: 'Global', group: 'Navigation' },
  { id: 7, action: 'Toggle Sidebar', shortcut: 'Ctrl+B', context: 'Global', group: 'Navigation' },
  { id: 8, action: 'New Purchase Entry', shortcut: 'Alt+P', context: 'Inventory', group: 'Inventory' },
  { id: 9, action: 'Void Last Item', shortcut: 'Delete', context: 'POS Billing', group: 'POS Billing' },
  { id: 10, action: 'Print Last Invoice', shortcut: 'Ctrl+P', context: 'Global', group: 'Navigation' },
];

export function SettingsKeyboardShortcutsView() {
  const [shortcuts, setShortcuts] = useState(PRESET_SHORTCUTS);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newAction, setNewAction] = useState('');
  const [newShortcut, setNewShortcut] = useState('');
  const [newContext, setNewContext] = useState('Global');
  const [recording, setRecording] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const inputClass =
    'w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 placeholder:text-neutral-400 transition-colors';
  const labelClass = 'text-xs font-medium text-neutral-700 mb-1';
  const sectionClass =
    'p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs';
  const sectionHeader =
    'text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5';

  const GROUPS = ['POS Billing', 'Navigation', 'Inventory', 'Reports'];

  const isDuplicate = (shortcut: string, currentId: number) =>
    shortcuts.some(s => s.shortcut === shortcut && s.id !== currentId);

  const handleKeyRecord = (e: React.KeyboardEvent) => {
    e.preventDefault();
    const parts: string[] = [];
    if (e.ctrlKey) parts.push('Ctrl');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');
    if (e.metaKey) parts.push('Meta');
    if (!['Control','Alt','Shift','Meta'].includes(e.key)) {
      parts.push(e.key.length === 1 ? e.key.toUpperCase() : e.key);
    }
    if (parts.length) {
      setNewShortcut(parts.join('+'));
      setRecording(false);
    }
  };

  const addShortcut = () => {
    if (!newAction.trim() || !newShortcut.trim()) return;
    const newId = Math.max(...shortcuts.map(s => s.id)) + 1;
    setShortcuts(ss => [...ss, { id: newId, action: newAction, shortcut: newShortcut, context: newContext, group: 'Custom' }]);
    setNewAction('');
    setNewShortcut('');
    setShowAddForm(false);
  };

  const resetDefaults = () => setShortcuts(PRESET_SHORTCUTS);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="settings_keyboard_shortcuts" />
      <ActionToolbar
        filterPlaceholder="Filter shortcuts..."
        insertLabel="Add Shortcut"
        onInsertClick={() => setShowAddForm(true)}
      />
      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        <div className="p-4 flex flex-col gap-4 max-w-5xl w-full mx-auto">

          {/* Info Note */}
          <div className="flex items-start gap-2 p-2.5 rounded-md bg-blue-50 border border-blue-100">
            <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
            <div className="text-[11px] text-blue-700">
              Shortcuts work only when no text input is focused. Press Escape to cancel any active shortcut.
            </div>
          </div>

          {/* Shortcut Groups */}
          {GROUPS.map(group => {
            const groupShortcuts = shortcuts.filter(s => s.group === group);
            if (!groupShortcuts.length) return null;
            return (
              <div key={group} className={sectionClass}>
                <div className={sectionHeader}>
                  <Keyboard className="w-3.5 h-3.5 text-emerald-600" />
                  {group}
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#e2e8f0]">
                      {['Action','Shortcut','Context','Edit'].map(h => (
                        <th key={h} className="text-left py-2 px-2 text-[10px] font-medium text-neutral-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {groupShortcuts.map(s => (
                      <tr key={s.id} className={`border-b border-[#e2e8f0] hover:bg-white/60 transition-colors ${isDuplicate(s.shortcut, s.id) ? 'bg-amber-50' : ''}`}>
                        <td className="py-2 px-2 text-neutral-800 font-medium">{s.action}</td>
                        <td className="py-2 px-2">
                          {editingId === s.id ? (
                            <input
                              className="px-2 py-1 text-[10px] border border-emerald-300 rounded bg-white focus:outline-none font-mono w-28"
                              value={s.shortcut}
                              onChange={e => setShortcuts(ss => ss.map(sh => sh.id === s.id ? { ...sh, shortcut: e.target.value } : sh))}
                              onBlur={() => setEditingId(null)}
                              autoFocus
                            />
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${isDuplicate(s.shortcut, s.id) ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-white text-neutral-700 border-[#e2e8f0]'}`}>
                              {isDuplicate(s.shortcut, s.id) && <AlertTriangle className="w-2.5 h-2.5 text-amber-500" />}
                              {s.shortcut}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-neutral-500 text-[10px]">{s.context}</td>
                        <td className="py-2 px-2">
                          <button
                            onClick={() => setEditingId(editingId === s.id ? null : s.id)}
                            className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}

          {/* Custom Shortcuts */}
          {shortcuts.filter(s => s.group === 'Custom').length > 0 && (
            <div className={sectionClass}>
              <div className={sectionHeader}>
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                Custom Shortcuts
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#e2e8f0]">
                    {['Action','Shortcut','Context','Edit'].map(h => (
                      <th key={h} className="text-left py-2 px-2 text-[10px] font-medium text-neutral-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shortcuts.filter(s => s.group === 'Custom').map(s => (
                    <tr key={s.id} className="border-b border-[#e2e8f0] hover:bg-white/60 transition-colors">
                      <td className="py-2 px-2 text-neutral-800 font-medium">{s.action}</td>
                      <td className="py-2 px-2">
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-medium border bg-white text-neutral-700 border-[#e2e8f0]">
                          {s.shortcut}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-neutral-500 text-[10px]">{s.context}</td>
                      <td className="py-2 px-2">
                        <button
                          onClick={() => setShortcuts(ss => ss.filter(sh => sh.id !== s.id))}
                          className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add Custom Shortcut Form */}
          {showAddForm && (
            <div className={`${sectionClass} border-emerald-300`}>
              <div className={sectionHeader}>
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                Add Custom Shortcut
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className={labelClass}>Action Name</div>
                  <input className={inputClass} value={newAction} onChange={e => setNewAction(e.target.value)} placeholder="e.g. Open Day Summary" />
                </div>
                <div>
                  <div className={labelClass}>Key Combination</div>
                  <input
                    className={`${inputClass} font-mono ${recording ? 'border-emerald-400 bg-emerald-50' : ''}`}
                    value={recording ? 'Press any key...' : newShortcut}
                    onFocus={() => setRecording(true)}
                    onBlur={() => setRecording(false)}
                    onKeyDown={recording ? handleKeyRecord : undefined}
                    readOnly={!recording}
                    placeholder="Click to record..."
                  />
                </div>
                <div>
                  <div className={labelClass}>Context</div>
                  <select className={inputClass} value={newContext} onChange={e => setNewContext(e.target.value)}>
                    {['Global','POS Billing','Inventory','Reports'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button onClick={addShortcut} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer">
                  <Plus className="w-3.5 h-3.5" />
                  Add Shortcut
                </button>
                <button onClick={() => setShowAddForm(false)} className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-600 border border-[#e2e8f0] hover:bg-neutral-50 transition-colors cursor-pointer">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={resetDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-red-600 border border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
            >
              Reset to Defaults
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer">
              <Save className="w-3.5 h-3.5" />
              Save Shortcuts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
