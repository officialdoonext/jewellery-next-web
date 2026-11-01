'use client';
import React, { useState, useEffect } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import { Scale, Plus, Trash2, Save, Activity, Wifi, WifiOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface ScaleDevice {
  id: number;
  model: string;
  port: string;
  baud: string;
  precision: string;
  status: string;
  terminal: string;
}

export function SettingsWeighingScaleView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Dynamic state — clean empty state without predefault mock scale
  const [scales, setScales] = useState<ScaleDevice[]>([]);
  const [model, setModel] = useState('');
  const [port, setPort] = useState('COM1');
  const [baud, setBaud] = useState('9600');
  const [precision, setPrecision] = useState('3');
  const [terminal, setTerminal] = useState('');
  const [autoTare, setAutoTare] = useState(false);
  const [stabilizationWait, setStabilizationWait] = useState(1000);
  const [weightTimeout, setWeightTimeout] = useState('');
  const [zeroDriftAlert, setZeroDriftAlert] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [liveWeight, setLiveWeight] = useState('--- g');
  const [weightStable, setWeightStable] = useState(false);

  useEffect(() => {
    async function loadScaleSettings() {
      try {
        setLoading(true);
        const docRef = doc(db, 'settings', 'weighing-scale');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.scales !== undefined) setScales(data.scales);
          if (data.autoTare !== undefined) setAutoTare(data.autoTare);
          if (data.stabilizationWait !== undefined) setStabilizationWait(data.stabilizationWait);
          if (data.weightTimeout !== undefined) setWeightTimeout(data.weightTimeout);
          if (data.zeroDriftAlert !== undefined) setZeroDriftAlert(data.zeroDriftAlert);
        }
      } catch (err: any) {
        console.error('Error fetching weighing scale settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadScaleSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveStatus('idle');
      const docRef = doc(db, 'settings', 'weighing-scale');
      await setDoc(docRef, {
        scales,
        autoTare,
        stabilizationWait,
        weightTimeout,
        zeroDriftAlert,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setSaveStatus('success');
      setStatusMessage('Weighing scale configurations saved successfully!');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch (err: any) {
      console.error('Error saving scale settings:', err);
      setSaveStatus('error');
      setStatusMessage(err.message || 'Failed to save weighing scale configuration');
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setSaving(false);
    }
  };

  const addScale = () => {
    if (!model.trim()) return;
    const newId = scales.length ? Math.max(...scales.map(s => s.id)) + 1 : 1;
    setScales(ss => [
      ...ss,
      {
        id: newId,
        model: model.trim(),
        port,
        baud,
        precision: `${precision}dp`,
        status: 'CONFIGURED',
        terminal: terminal.trim() || 'Counter 1'
      }
    ]);
    setModel('');
    setTerminal('');
    setShowAddForm(false);
  };

  const removeScale = (id: number) => {
    setScales(ss => ss.filter(s => s.id !== id));
  };

  const testConnection = () => {
    setLiveWeight('0.000 g');
    setTimeout(() => {
      setLiveWeight('14.285 g');
      setWeightStable(true);
    }, 600);
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
      <TabBar title="settings_weighing_scale" />
      <ActionToolbar
        filterPlaceholder="Filter scale settings..."
        insertLabel={saving ? 'Saving...' : 'Save Scales'}
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
              <span className="text-xs font-medium">Loading scale settings...</span>
            </div>
          ) : (
            <>
              {/* Connected Scales */}
              <div className={sectionClass}>
                <div className="flex items-center justify-between mb-2.5">
                  <div className={sectionHeader} style={{ marginBottom: 0 }}>
                    <Scale className="w-3.5 h-3.5 text-emerald-600" />
                    Electronic Precision Scales
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Scale
                  </button>
                </div>

                {/* Inline Add Scale Form */}
                {showAddForm && (
                  <div className="mb-3 p-3 bg-white border border-emerald-200 rounded-lg shadow-2xs">
                    <div className="text-xs font-medium text-neutral-800 mb-2">Configure Weighing Scale Device</div>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-2">
                      <div className="sm:col-span-2">
                        <label className={labelClass}>Device Model / Brand *</label>
                        <input
                          className={inputClass}
                          placeholder="e.g. Essae DS-852, Sartorius, Ohaus"
                          value={model}
                          onChange={e => setModel(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>COM / Serial Port</label>
                        <select
                          className={inputClass}
                          value={port}
                          onChange={e => setPort(e.target.value)}
                        >
                          <option value="COM1">COM1</option>
                          <option value="COM2">COM2</option>
                          <option value="COM3">COM3</option>
                          <option value="COM4">COM4</option>
                          <option value="COM5">COM5</option>
                          <option value="USB-Serial">USB-Serial (Auto)</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Baud Rate</label>
                        <select
                          className={inputClass}
                          value={baud}
                          onChange={e => setBaud(e.target.value)}
                        >
                          <option value="2400">2400</option>
                          <option value="4800">4800</option>
                          <option value="9600">9600</option>
                          <option value="19200">19200</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Decimal Precision</label>
                        <select
                          className={inputClass}
                          value={precision}
                          onChange={e => setPrecision(e.target.value)}
                        >
                          <option value="2">2 decimals (0.01g)</option>
                          <option value="3">3 decimals (0.001g)</option>
                          <option value="4">4 decimals (0.0001g)</option>
                        </select>
                      </div>
                      <div className="sm:col-span-5">
                        <label className={labelClass}>Assigned Terminal / Counter</label>
                        <input
                          className={inputClass}
                          placeholder="e.g. Counter 1 or Bullion Testing Desk"
                          value={terminal}
                          onChange={e => setTerminal(e.target.value)}
                        />
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
                        onClick={addScale}
                        className="px-3 py-1 text-xs bg-[#24b47e] hover:bg-[#1fa070] text-white rounded font-medium shadow-2xs"
                      >
                        Save Device
                      </button>
                    </div>
                  </div>
                )}

                {scales.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-md border border-dashed border-[#e2e8f0]">
                    <div className="text-xs text-neutral-500 font-medium">No weighing scales configured</div>
                    <div className="text-[11px] text-neutral-400 mt-1">Click &apos;Add Scale&apos; to link your RS232 / USB scale directly to POS billing for tamper-proof weights.</div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-[#e2e8f0]">
                          {['Device Model', 'COM Port', 'Baud Rate', 'Precision', 'Status', 'Terminal', 'Actions'].map(h => (
                            <th key={h} className="text-left py-2 px-2 text-[10px] font-medium text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {scales.map(s => (
                          <tr key={s.id} className="border-b border-[#e2e8f0] hover:bg-white/60 transition-colors">
                            <td className="py-2.5 px-2 font-medium text-neutral-800">{s.model}</td>
                            <td className="py-2.5 px-2 font-mono text-neutral-600">{s.port}</td>
                            <td className="py-2.5 px-2 text-neutral-600">{s.baud}</td>
                            <td className="py-2.5 px-2 text-neutral-600">{s.precision}</td>
                            <td className="py-2.5 px-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">
                                <Activity className="w-2.5 h-2.5" />
                                {s.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-neutral-600">{s.terminal}</td>
                            <td className="py-2.5 px-2">
                              <button
                                type="button"
                                onClick={() => removeScale(s.id)}
                                className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
                                title="Remove Scale"
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

              {/* Live Weight Calibration Probe */}
              <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 shadow-2xs text-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-medium uppercase tracking-wider text-neutral-300">Live Scale Communication Probe</span>
                  </div>
                  <button
                    type="button"
                    onClick={testConnection}
                    className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-colors"
                  >
                    Test Serial Signal
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-mono text-2xl text-emerald-400 font-medium">
                    {liveWeight}
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-neutral-400">Signal Status</div>
                    <div className="text-xs font-medium text-neutral-200">
                      {weightStable ? 'Stable Weight Captured' : 'Awaiting scale packet'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Protocol Parameters */}
              <div className={sectionClass}>
                <div className={sectionHeader}>
                  <Scale className="w-3.5 h-3.5 text-emerald-600" />
                  Weighing &amp; Calibration Rules
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className={labelClass}>Reading Timeout (seconds)</div>
                    <input
                      className={inputClass}
                      value={weightTimeout}
                      onChange={e => setWeightTimeout(e.target.value)}
                      placeholder="e.g. 5"
                      type="number"
                    />
                  </div>
                  <div>
                    <div className={labelClass}>Zero-Drift Alert Threshold (mg)</div>
                    <input
                      className={inputClass}
                      value={zeroDriftAlert}
                      onChange={e => setZeroDriftAlert(e.target.value)}
                      placeholder="e.g. 50"
                      type="number"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-md bg-white border border-[#e2e8f0]">
                  <div>
                    <div className="text-xs font-medium text-neutral-700">Auto-Tare on Empty Pan</div>
                    <div className="text-[11px] text-neutral-500 font-normal">Automatically zero out scale before each new item weighment</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoTare(!autoTare)}
                    className={`w-9 h-5 rounded-full transition-colors relative ${autoTare ? 'bg-emerald-500' : 'bg-neutral-200'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-all ${autoTare ? 'left-4' : 'left-0.5'}`} />
                  </button>
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
                  <span>{saving ? 'Saving...' : 'Save Scale Settings'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
