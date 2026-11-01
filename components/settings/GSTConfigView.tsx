'use client';
import React, { useState, useEffect } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import { Shield, Plus, Edit3, Trash2, Save, Info, Zap, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface TaxRow {
  id: number;
  taxHead: string;
  hsn: string;
  cgst: number;
  sgst: number;
  igst: number;
  active: boolean;
}

export function SettingsGSTConfigView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Dynamic clean fields — no predefault dummy values
  const [gstin, setGstin] = useState('');
  const [filingFreq, setFilingFreq] = useState('Monthly GSTR-1');
  const [gstPortalUser, setGstPortalUser] = useState('');
  const [eInvoiceEnabled, setEInvoiceEnabled] = useState(false);
  const [irpEndpoint, setIrpEndpoint] = useState('');
  const [taxRows, setTaxRows] = useState<TaxRow[]>([]);
  const [autoDetectSupply, setAutoDetectSupply] = useState(true);
  const [roundOffGST, setRoundOffGST] = useState(true);
  const [includeGSTInMRP, setIncludeGSTInMRP] = useState(false);
  const [ewayThreshold, setEwayThreshold] = useState('');
  const [autoEway, setAutoEway] = useState(false);
  const [transporterKey, setTransporterKey] = useState('');
  const [editingRow, setEditingRow] = useState<number | null>(null);

  // New row form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHead, setNewHead] = useState('');
  const [newHsn, setNewHsn] = useState('');
  const [newCgst, setNewCgst] = useState('1.5');
  const [newSgst, setNewSgst] = useState('1.5');
  const [newIgst, setNewIgst] = useState('3.0');

  useEffect(() => {
    async function loadGSTConfig() {
      try {
        setLoading(true);
        // Also check if shop profile has GSTIN to suggest
        const shopSnap = await getDoc(doc(db, 'settings', 'shop-profile'));
        let initialGstin = '';
        if (shopSnap.exists() && shopSnap.data().gstin) {
          initialGstin = shopSnap.data().gstin;
        }

        const docRef = doc(db, 'settings', 'gst-config');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.gstin !== undefined) setGstin(data.gstin);
          else if (initialGstin) setGstin(initialGstin);

          if (data.filingFreq !== undefined) setFilingFreq(data.filingFreq);
          if (data.gstPortalUser !== undefined) setGstPortalUser(data.gstPortalUser);
          if (data.eInvoiceEnabled !== undefined) setEInvoiceEnabled(data.eInvoiceEnabled);
          if (data.irpEndpoint !== undefined) setIrpEndpoint(data.irpEndpoint);
          if (data.taxRows !== undefined) setTaxRows(data.taxRows);
          if (data.autoDetectSupply !== undefined) setAutoDetectSupply(data.autoDetectSupply);
          if (data.roundOffGST !== undefined) setRoundOffGST(data.roundOffGST);
          if (data.includeGSTInMRP !== undefined) setIncludeGSTInMRP(data.includeGSTInMRP);
          if (data.ewayThreshold !== undefined) setEwayThreshold(data.ewayThreshold);
          if (data.autoEway !== undefined) setAutoEway(data.autoEway);
          if (data.transporterKey !== undefined) setTransporterKey(data.transporterKey);
        } else if (initialGstin) {
          setGstin(initialGstin);
        }
      } catch (err: any) {
        console.error('Error fetching GST config:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGSTConfig();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveStatus('idle');
      const docRef = doc(db, 'settings', 'gst-config');
      await setDoc(docRef, {
        gstin,
        filingFreq,
        gstPortalUser,
        eInvoiceEnabled,
        irpEndpoint,
        taxRows,
        autoDetectSupply,
        roundOffGST,
        includeGSTInMRP,
        ewayThreshold,
        autoEway,
        transporterKey,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setSaveStatus('success');
      setStatusMessage('GST configuration saved successfully!');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch (err: any) {
      console.error('Error saving GST config:', err);
      setSaveStatus('error');
      setStatusMessage(err.message || 'Failed to save GST configuration');
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setSaving(false);
    }
  };

  const toggleRowActive = (id: number) => {
    setTaxRows(rows => rows.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const deleteRow = (id: number) => {
    setTaxRows(rows => rows.filter(r => r.id !== id));
  };

  const handleAddRow = () => {
    if (!newHead.trim()) return;
    const newId = taxRows.length ? Math.max(...taxRows.map(r => r.id)) + 1 : 1;
    setTaxRows(rows => [
      ...rows,
      {
        id: newId,
        taxHead: newHead,
        hsn: newHsn || '7113',
        cgst: parseFloat(newCgst) || 0,
        sgst: parseFloat(newSgst) || 0,
        igst: parseFloat(newIgst) || 0,
        active: true
      }
    ]);
    setNewHead('');
    setNewHsn('');
    setShowAddModal(false);
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
      <TabBar title="settings_gst_config" />
      <ActionToolbar
        filterPlaceholder="Filter GST settings..."
        insertLabel={saving ? 'Saving...' : 'Save GST Config'}
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
              <span className="text-xs font-medium">Loading saved GST configuration...</span>
            </div>
          ) : (
            <>
              {/* GST Identity */}
              <div className={sectionClass}>
                <div className={sectionHeader}>
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  GST Identity
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className={labelClass}>GSTIN</div>
                    <input
                      className={inputClass}
                      value={gstin}
                      onChange={e => setGstin(e.target.value)}
                      placeholder="Enter GSTIN (e.g. 36AABCS1234F1ZX)"
                    />
                  </div>
                  <div>
                    <div className={labelClass}>Filing Frequency</div>
                    <select
                      className={inputClass}
                      value={filingFreq}
                      onChange={e => setFilingFreq(e.target.value)}
                    >
                      <option value="Monthly GSTR-1">Monthly GSTR-1</option>
                      <option value="Quarterly QRMP">Quarterly QRMP</option>
                      <option value="Composition CMP-08">Composition CMP-08</option>
                    </select>
                  </div>
                  <div>
                    <div className={labelClass}>GST Portal Username</div>
                    <input
                      className={inputClass}
                      value={gstPortalUser}
                      onChange={e => setGstPortalUser(e.target.value)}
                      placeholder="Enter GST portal login username"
                    />
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-md bg-white border border-[#e2e8f0]">
                    <div>
                      <div className="text-xs font-medium text-neutral-700">Enable E-Invoice</div>
                      <div className="text-[11px] text-neutral-500 font-normal">Mandatory for turnover &gt; ₹5 Cr</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEInvoiceEnabled(!eInvoiceEnabled)}
                      className={`w-9 h-5 rounded-full transition-colors relative ${eInvoiceEnabled ? 'bg-emerald-500' : 'bg-neutral-200'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-all ${eInvoiceEnabled ? 'left-4' : 'left-0.5'}`} />
                    </button>
                  </div>
                  {eInvoiceEnabled && (
                    <div className="col-span-1 sm:col-span-2">
                      <div className={labelClass}>IRP Endpoint URL</div>
                      <input
                        className={inputClass}
                        value={irpEndpoint}
                        onChange={e => setIrpEndpoint(e.target.value)}
                        placeholder="https://einvoice1.gst.gov.in/"
                      />
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
                    type="button"
                    onClick={() => setShowAddModal(!showAddModal)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Tax Head
                  </button>
                </div>

                {/* Inline Add Row Form */}
                {showAddModal && (
                  <div className="mb-3 p-3 bg-white border border-emerald-200 rounded-lg shadow-2xs">
                    <div className="text-xs font-medium text-neutral-800 mb-2">Add New Tax Rate Rule</div>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-2">
                      <div className="sm:col-span-2">
                        <label className={labelClass}>Tax Head Name *</label>
                        <input
                          className={inputClass}
                          placeholder="e.g. Gold Jewellery"
                          value={newHead}
                          onChange={e => setNewHead(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>HSN Code</label>
                        <input
                          className={inputClass}
                          placeholder="7113"
                          value={newHsn}
                          onChange={e => setNewHsn(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>CGST %</label>
                        <input
                          className={inputClass}
                          type="number"
                          step="0.1"
                          placeholder="1.5"
                          value={newCgst}
                          onChange={e => setNewCgst(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>SGST %</label>
                        <input
                          className={inputClass}
                          type="number"
                          step="0.1"
                          placeholder="1.5"
                          value={newSgst}
                          onChange={e => setNewSgst(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="px-2.5 py-1 text-xs border border-neutral-200 rounded hover:bg-neutral-50 text-neutral-600 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddRow}
                        className="px-3 py-1 text-xs bg-[#24b47e] hover:bg-[#1fa070] text-white rounded font-medium shadow-2xs"
                      >
                        Add Rule
                      </button>
                    </div>
                  </div>
                )}

                {taxRows.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-md border border-dashed border-[#e2e8f0]">
                    <div className="text-xs text-neutral-500 font-medium">No tax rate rules added yet</div>
                    <div className="text-[11px] text-neutral-400 mt-1">Click &apos;Add Tax Head&apos; to configure rates for Gold, Silver, Making charges, or Utensils.</div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-[#e2e8f0]">
                          {['Tax Head', 'HSN Code', 'CGST%', 'SGST%', 'IGST%', 'Active', 'Actions'].map(h => (
                            <th key={h} className="text-left py-2 px-2 text-[10px] font-medium text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {taxRows.map(row => (
                          <tr key={row.id} className="border-b border-[#e2e8f0] hover:bg-white/60 transition-colors">
                            <td className="py-2 px-2">
                              {editingRow === row.id ? (
                                <input
                                  className="px-2 py-1 text-xs border border-emerald-300 rounded bg-white focus:outline-none font-medium"
                                  value={row.taxHead}
                                  onChange={e => setTaxRows(rows => rows.map(r => r.id === row.id ? { ...r, taxHead: e.target.value } : r))}
                                />
                              ) : (
                                <span className="text-neutral-800 font-medium">{row.taxHead}</span>
                              )}
                            </td>
                            <td className="py-2 px-2 font-mono text-neutral-600">
                              {editingRow === row.id ? (
                                <input
                                  className="w-20 px-2 py-1 text-xs border border-emerald-300 rounded bg-white focus:outline-none font-mono"
                                  value={row.hsn}
                                  onChange={e => setTaxRows(rows => rows.map(r => r.id === row.id ? { ...r, hsn: e.target.value } : r))}
                                />
                              ) : (
                                row.hsn
                              )}
                            </td>
                            <td className="py-2 px-2 text-neutral-600">
                              {editingRow === row.id ? (
                                <input
                                  className="w-16 px-2 py-1 text-xs border border-emerald-300 rounded bg-white focus:outline-none"
                                  type="number"
                                  step="0.1"
                                  value={row.cgst}
                                  onChange={e => setTaxRows(rows => rows.map(r => r.id === row.id ? { ...r, cgst: parseFloat(e.target.value) || 0 } : r))}
                                />
                              ) : (
                                `${row.cgst}%`
                              )}
                            </td>
                            <td className="py-2 px-2 text-neutral-600">
                              {editingRow === row.id ? (
                                <input
                                  className="w-16 px-2 py-1 text-xs border border-emerald-300 rounded bg-white focus:outline-none"
                                  type="number"
                                  step="0.1"
                                  value={row.sgst}
                                  onChange={e => setTaxRows(rows => rows.map(r => r.id === row.id ? { ...r, sgst: parseFloat(e.target.value) || 0 } : r))}
                                />
                              ) : (
                                `${row.sgst}%`
                              )}
                            </td>
                            <td className="py-2 px-2 text-neutral-600">
                              {editingRow === row.id ? (
                                <input
                                  className="w-16 px-2 py-1 text-xs border border-emerald-300 rounded bg-white focus:outline-none"
                                  type="number"
                                  step="0.1"
                                  value={row.igst}
                                  onChange={e => setTaxRows(rows => rows.map(r => r.id === row.id ? { ...r, igst: parseFloat(e.target.value) || 0 } : r))}
                                />
                              ) : (
                                `${row.igst}%`
                              )}
                            </td>
                            <td className="py-2 px-2">
                              <button
                                type="button"
                                onClick={() => toggleRowActive(row.id)}
                                className={`px-2 py-0.5 rounded text-[10px] font-medium ${row.active ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}
                              >
                                {row.active ? 'Active' : 'Off'}
                              </button>
                            </td>
                            <td className="py-2 px-2">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingRow(editingRow === row.id ? null : row.id)}
                                  className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
                                  title="Edit row"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteRow(row.id)}
                                  className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
                                  title="Delete row"
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
                )}
              </div>

              {/* Transaction Rules */}
              <div className={sectionClass}>
                <div className={sectionHeader}>
                  <Info className="w-3.5 h-3.5 text-emerald-600" />
                  Transaction Rules
                </div>
                <Toggle
                  value={autoDetectSupply}
                  onChange={() => setAutoDetectSupply(!autoDetectSupply)}
                  label="Supply Type Auto-Detect"
                  sub="Intra-state / Inter-state based on buyer GSTIN"
                />
                <Toggle
                  value={roundOffGST}
                  onChange={() => setRoundOffGST(!roundOffGST)}
                  label="Round-off GST Amount"
                  sub="Round final GST to nearest rupee"
                />
                <Toggle
                  value={includeGSTInMRP}
                  onChange={() => setIncludeGSTInMRP(!includeGSTInMRP)}
                  label="Include GST in MRP Pricing Display"
                  sub="Show GST-inclusive price on display tags"
                />
              </div>

              {/* E-Way Bill */}
              <div className={sectionClass}>
                <div className={sectionHeader}>
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  E-Way Bill Configuration
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className={labelClass}>Threshold Amount (₹)</div>
                    <input
                      className={inputClass}
                      value={ewayThreshold}
                      onChange={e => setEwayThreshold(e.target.value)}
                      placeholder="e.g. 50000"
                      type="number"
                    />
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-md bg-white border border-[#e2e8f0]">
                    <div>
                      <div className="text-xs font-medium text-neutral-700">Auto-generate for Sales Above Threshold</div>
                      <div className="text-[11px] text-neutral-500 font-normal">Requires Transporter API key</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoEway(!autoEway)}
                      className={`w-9 h-5 rounded-full transition-colors relative ${autoEway ? 'bg-emerald-500' : 'bg-neutral-200'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-all ${autoEway ? 'left-4' : 'left-0.5'}`} />
                    </button>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <div className={labelClass}>Transporter API Integration Key</div>
                    <input
                      className={inputClass}
                      placeholder="Enter Transporter API key..."
                      type="password"
                      value={transporterKey}
                      onChange={e => setTransporterKey(e.target.value)}
                    />
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
                  <span>{saving ? 'Saving...' : 'Save GST Configuration'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
