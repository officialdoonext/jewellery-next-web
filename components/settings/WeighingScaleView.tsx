'use client';
import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import { Scale, Plus, Trash2, Save, Activity, Wifi, WifiOff } from 'lucide-react';

const INITIAL_SCALES = [
  { id: 1, model: 'Essae DS-852', port: 'COM3', baud: '9600', precision: '3dp', status: 'ONLINE', terminal: 'Counter 1' },
];

export function SettingsWeighingScaleView() {
  const [scales, setScales] = useState(INITIAL_SCALES);
  const [model, setModel] = useState('Essae DS-852');
  const [port, setPort] = useState('COM1');
  const [baud, setBaud] = useState('9600');
  const [dataBits, setDataBits] = useState('8');
  const [stopBits, setStopBits] = useState('1');
  const [parity, setParity] = useState('None');
  const [precision, setPrecision] = useState('3');
  const [terminal, setTerminal] = useState('Counter 1');
  const [autoTare, setAutoTare] = useState(true);
  const [stabilizationWait, setStabilizationWait] = useState(1000);
  const [weightTimeout, setWeightTimeout] = useState('5');
  const [zeroDriftAlert, setZeroDriftAlert] = useState('50');
  const [showAddForm, setShowAddForm] = useState(false);
  const [liveWeight, setLiveWeight] = useState('--- g');
  const [weightStable, setWeightStable] = useState(false);

  const inputClass =
    'w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 placeholder:text-neutral-400 transition-colors';
  const labelClass = 'text-xs font-medium text-neutral-700 mb-1';
  const sectionClass =
    'p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs';
  const sectionHeader =
    'text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5';

  const addScale = () => {
    const newId = scales.length ? Math.max(...scales.map(s => s.id)) + 1 : 1;
    setScales(ss => [...ss, { id: newId, model, port, baud, precision: `${precision}dp`, status: 'OFFLINE', terminal }]);
    setShowAddForm(false);
  };

  const removeScale = (id: number) => setScales(ss => ss.filter(s => s.id !== id));

  const testConnection = () => {
    setLiveWeight('12.340 g');
    setWeightStable(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="settings_weighing_scale" />
      <ActionToolbar
        filterPlaceholder="Filter scale settings..."
        insertLabel="Add Scale"
        onInsertClick={() => setShowAddForm(true)}
      />
      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        <div className="p-4 flex flex-col gap-4 max-w-5xl w-full mx-auto">

          {/* Connected Scales */}
          <div className={sectionClass}>
            <div className="flex items-center justify-between mb-2.5">
              <div className={sectionHeader} style={{ marginBottom: 0 }}>
                <Scale className="w-3.5 h-3.5 text-emerald-600" />
                Connected Scales
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add Scale
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#e2e8f0]">
                    {['Device Model','COM Port','Baud Rate','Precision','Status','Terminal','Actions'].map(h => (
                      <th key={h} className="text-left py-2 px-2 text-[10px] font-medium text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
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
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${s.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                          {s.status === 'ONLINE' ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
                          {s.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-neutral-600">{s.terminal}</td>
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={testConnection}
                            className="px-2.5 py-1 text-[10px] font-medium rounded border border-[#e2e8f0] bg-white text-neutral-600 hover:bg-neutral-50 transition-colors"
                          >
                            Test
                          </button>
                          <button
                            onClick={() => removeScale(s.id)}
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

          {/* Add Scale Form */}
          {showAddForm && (
            <div className={`${sectionClass} border-emerald-300`}>
              <div className={sectionHeader}>
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                Add Weighing Scale
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className={labelClass}>Device Model</div>
                  <select className={inputClass} value={model} onChange={e => setModel(e.target.value)}>
                    {['Essae DS-852','A&D GF-300','Sartorius CPA','Wensar PB','Shimadzu BX'].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <div className={labelClass}>COM Port</div>
                  <select className={inputClass} value={port} onChange={e => setPort(e.target.value)}>
                    {['COM1','COM2','COM3','COM4','COM5','COM6','COM7','COM8','COM9'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <div className={labelClass}>Baud Rate</div>
                  <select className={inputClass} value={baud} onChange={e => setBaud(e.target.value)}>
                    {['1200','2400','4800','9600','19200'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <div className={labelClass}>Data Bits</div>
                  <select className={inputClass} value={dataBits} onChange={e => setDataBits(e.target.value)}>
                    <option>7</option>
                    <option>8</option>
                  </select>
                </div>
                <div>
                  <div className={labelClass}>Stop Bits</div>
                  <select className={inputClass} value={stopBits} onChange={e => setStopBits(e.target.value)}>
                    <option>1</option>
                    <option>2</option>
                  </select>
                </div>
                <div>
                  <div className={labelClass}>Parity</div>
                  <select className={inputClass} value={parity} onChange={e => setParity(e.target.value)}>
                    {['None','Even','Odd'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <div className={labelClass}>Precision Decimals</div>
                  <select className={inputClass} value={precision} onChange={e => setPrecision(e.target.value)}>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                  </select>
                </div>
                <div>
                  <div className={labelClass}>Assign to Terminal</div>
                  <input className={inputClass} value={terminal} onChange={e => setTerminal(e.target.value)} placeholder="e.g. Counter 1" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button onClick={addScale} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer">
                  <Plus className="w-3.5 h-3.5" />
                  Add Scale
                </button>
                <button onClick={() => setShowAddForm(false)} className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-600 border border-[#e2e8f0] hover:bg-neutral-50 transition-colors cursor-pointer">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Calibration Settings */}
          <div className={sectionClass}>
            <div className={sectionHeader}>
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              Calibration Settings
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className={labelClass}>Stabilization Wait Time (ms): {stabilizationWait}ms</div>
                <input
                  type="range"
                  min={500}
                  max={3000}
                  step={100}
                  value={stabilizationWait}
                  onChange={e => setStabilizationWait(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-neutral-400 mt-0.5">
                  <span>500ms</span>
                  <span>3000ms</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div>
                  <div className={labelClass}>Weight Timeout (seconds)</div>
                  <input className={inputClass} value={weightTimeout} onChange={e => setWeightTimeout(e.target.value)} type="number" />
                </div>
                <div>
                  <div className={labelClass}>Zero Drift Alert Threshold (mg)</div>
                  <input className={inputClass} value={zeroDriftAlert} onChange={e => setZeroDriftAlert(e.target.value)} type="number" />
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between py-2 border-t border-[#e2e8f0]">
              <div>
                <div className="text-xs font-medium text-neutral-700">Auto-Tare on New Item</div>
                <div className="text-[11px] text-neutral-500">Reset scale to zero before each new item weighing</div>
              </div>
              <button
                onClick={() => setAutoTare(!autoTare)}
                className={`w-9 h-5 rounded-full transition-colors relative ${autoTare ? 'bg-emerald-500' : 'bg-neutral-200'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-all ${autoTare ? 'left-4' : 'left-0.5'}`} />
              </button>
            </div>
          </div>

          {/* Live Weight Monitor */}
          <div className={sectionClass}>
            <div className={sectionHeader}>
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              Live Weight Monitor
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 flex items-center justify-center bg-neutral-900 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-medium text-emerald-400 font-mono tracking-wider">{liveWeight}</div>
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    <span className={`w-2 h-2 rounded-full ${weightStable ? 'bg-emerald-500' : 'bg-neutral-500'}`} />
                    <span className="text-[10px] text-neutral-400">{weightStable ? 'STABLE' : 'WAITING'}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={testConnection}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <Wifi className="w-3.5 h-3.5" />
                  Test Connection
                </button>
                <button
                  onClick={() => { setLiveWeight('--- g'); setWeightStable(false); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-600 border border-[#e2e8f0] hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer">
              <Save className="w-3.5 h-3.5" />
              Save Scale Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
