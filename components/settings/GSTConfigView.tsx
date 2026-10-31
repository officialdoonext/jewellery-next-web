'use client';
import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import { Shield, Plus, Edit3, Trash2, Save, Info, Zap } from 'lucide-react';

const INITIAL_TAX_ROWS = [
  { id: 1, taxHead: 'Gold & Silver Articles', hsn: '7113', cgst: 1.5, sgst: 1.5, igst: 3, active: true },
  { id: 2, taxHead: 'Diamond Studded Jewellery', hsn: '7113', cgst: 1.5, sgst: 1.5, igst: 3, active: true },
  { id: 3, taxHead: 'Artisan Jobwork', hsn: '9988', cgst: 2.5, sgst: 2.5, igst: 5, active: true },
  { id: 4, taxHead: 'Silver Utensils', hsn: '7114', cgst: 1.5, sgst: 1.5, igst: 3, active: true },
];

export function SettingsGSTConfigView() {
  const [gstin] = useState('36AABCS1234F1ZX');
  const [filingFreq, setFilingFreq] = useState('Monthly GSTR-1');
  const [gstPortalUser, setGstPortalUser] = useState('srijewellers_hyd');
  const [eInvoiceEnabled, setEInvoiceEnabled] = useState(false);
  const [irpEndpoint, setIrpEndpoint] = useState('https://einvoice1.gst.gov.in/');
  const [taxRows, setTaxRows] = useState(INITIAL_TAX_ROWS);
  const [autoDetectSupply, setAutoDetectSupply] = useState(true);
  const [roundOffGST, setRoundOffGST] = useState(true);
  const [includeGSTInMRP, setIncludeGSTInMRP] = useState(false);
  const [ewayThreshold, setEwayThreshold] = useState('50000');
  const [autoEway, setAutoEway] = useState(true);
  const [editingRow, setEditingRow] = useState<number | null>(null);

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

  const toggleRowActive = (id: number) => {
    setTaxRows(rows => rows.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const deleteRow = (id: number) => {
    setTaxRows(rows => rows.filter(r => r.id !== id));
  };

  const addRow = () => {
    const newId = Math.max(...taxRows.map(r => r.id)) + 1;
    setTaxRows(rows => [...rows, { id: newId, taxHead: 'New Tax Head', hsn: '0000', cgst: 0, sgst: 0, igst: 0, active: true }]);
    setEditingRow(newId);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="settings_gst_config" />
      <ActionToolbar
        filterPlaceholder="Filter GST settings..."
        insertLabel="Save Changes"
        onInsertClick={() => {}}
      />
      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        <div className="p-4 flex flex-col gap-4 max-w-5xl w-full mx-auto">

          {/* GST Identity */}
          <div className={sectionClass}>
            <div className={sectionHeader}>
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              GST Identity
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className={labelClass}>GSTIN (linked from Shop Profile)</div>
                <div className="relative">
                  <input className={`${inputClass} bg-neutral-50 text-neutral-500 cursor-not-allowed`} value={gstin} readOnly />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">read-only</span>
                </div>
              </div>
              <div>
                <div className={labelClass}>Filing Frequency</div>
                <select className={inputClass} value={filingFreq} onChange={e => setFilingFreq(e.target.value)}>
                  <option>Monthly GSTR-1</option>
                  <option>Quarterly</option>
                </select>
              </div>
              <div>
                <div className={labelClass}>GST Portal Username</div>
                <input className={inputClass} value={gstPortalUser} onChange={e => setGstPortalUser(e.target.value)} placeholder="Your GST portal login" />
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-md bg-white border border-[#e2e8f0]">
                <div>
                  <div className="text-xs font-medium text-neutral-700">Enable E-Invoice</div>
                  <div className="text-[11px] text-neutral-500">Mandatory for turnover &gt; ₹5 Cr</div>
                </div>
                <button
                  onClick={() => setEInvoiceEnabled(!eInvoiceEnabled)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${eInvoiceEnabled ? 'bg-emerald-500' : 'bg-neutral-200'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-all ${eInvoiceEnabled ? 'left-4' : 'left-0.5'}`} />
                </button>
              </div>
              {eInvoiceEnabled && (
                <div className="col-span-2">
                  <div className={labelClass}>IRP Endpoint URL</div>
                  <input className={inputClass} value={irpEndpoint} onChange={e => setIrpEndpoint(e.target.value)} />
                </div>
              )}
            </div>
          </div>

          {/* Tax Rate Matrix */}
          <div className={sectionClass}>
            <div className="flex items-center justify-between mb-2.5">
              <div className={sectionHeader} style={{ marginBottom: 0 }}>
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                Tax Rate Matrix
              </div>
              <button
                onClick={addRow}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add Row
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#e2e8f0]">
                    {['Tax Head','HSN Code','CGST%','SGST%','IGST%','Active',''].map(h => (
                      <th key={h} className="text-left py-2 px-2 text-[10px] font-medium text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {taxRows.map(row => (
                    <tr key={row.id} className="border-b border-[#e2e8f0] hover:bg-white/60 transition-colors">
                      <td className="py-2 px-2">
                        {editingRow === row.id ? (
                          <input
                            className="px-2 py-1 text-xs border border-emerald-300 rounded bg-white focus:outline-none"
                            value={row.taxHead}
                            onChange={e => setTaxRows(rows => rows.map(r => r.id === row.id ? { ...r, taxHead: e.target.value } : r))}
                          />
                        ) : (
                          <span className="text-neutral-800 font-medium">{row.taxHead}</span>
                        )}
                      </td>
                      <td className="py-2 px-2 font-mono text-neutral-600">{row.hsn}</td>
                      <td className="py-2 px-2 text-neutral-600">{row.cgst}%</td>
                      <td className="py-2 px-2 text-neutral-600">{row.sgst}%</td>
                      <td className="py-2 px-2 text-neutral-600">{row.igst}%</td>
                      <td className="py-2 px-2">
                        <button
                          onClick={() => toggleRowActive(row.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium ${row.active ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}
                        >
                          {row.active ? 'Active' : 'Off'}
                        </button>
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingRow(editingRow === row.id ? null : row.id)}
                            className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteRow(row.id)}
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

          {/* Transaction Rules */}
          <div className={sectionClass}>
            <div className={sectionHeader}>
              <Info className="w-3.5 h-3.5 text-emerald-600" />
              Transaction Rules
            </div>
            <Toggle value={autoDetectSupply} onChange={() => setAutoDetectSupply(!autoDetectSupply)} label="Supply Type Auto-Detect" sub="Intra-state / Inter-state based on buyer GSTIN" />
            <Toggle value={roundOffGST} onChange={() => setRoundOffGST(!roundOffGST)} label="Round-off GST Amount" sub="Round final GST to nearest rupee" />
            <Toggle value={includeGSTInMRP} onChange={() => setIncludeGSTInMRP(!includeGSTInMRP)} label="Include GST in MRP Pricing Display" sub="Show GST-inclusive price on display" />
          </div>

          {/* E-Way Bill */}
          <div className={sectionClass}>
            <div className={sectionHeader}>
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              E-Way Bill Configuration
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className={labelClass}>Threshold Amount (₹)</div>
                <input className={inputClass} value={ewayThreshold} onChange={e => setEwayThreshold(e.target.value)} type="number" />
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-md bg-white border border-[#e2e8f0]">
                <div>
                  <div className="text-xs font-medium text-neutral-700">Auto-generate for Sales Above Threshold</div>
                  <div className="text-[11px] text-neutral-500">Requires Transporter API key</div>
                </div>
                <button
                  onClick={() => setAutoEway(!autoEway)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${autoEway ? 'bg-emerald-500' : 'bg-neutral-200'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-all ${autoEway ? 'left-4' : 'left-0.5'}`} />
                </button>
              </div>
              <div className="col-span-2">
                <div className={labelClass}>Transporter API Integration Key</div>
                <input className={inputClass} placeholder="Enter Transporter API key..." type="password" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer">
              <Save className="w-3.5 h-3.5" />
              Save GST Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
