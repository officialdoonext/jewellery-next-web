'use client';
import React, { useState, useEffect } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Award, CheckCircle2, Copy,
  Monitor, Plus, Trash2, Save, Loader2, AlertCircle
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface TerminalLicense {
  id: string;
  name: string;
  lastSeen: string;
  os: string;
}

export function SettingsSubscriptionView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Dynamic state — clean empty state without predefault values
  const [licenseKey, setLicenseKey] = useState('');
  const [planName, setPlanName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [validTill, setValidTill] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [maxTerminals, setMaxTerminals] = useState('');
  const [activeTerminals, setActiveTerminals] = useState<TerminalLicense[]>([]);

  // Add terminal state
  const [showAddTerminal, setShowAddTerminal] = useState(false);
  const [termId, setTermId] = useState('');
  const [termName, setTermName] = useState('');
  const [termOS, setTermOS] = useState('Windows 11');

  const [keyVisible, setKeyVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadSubscription() {
      try {
        setLoading(true);
        const docRef = doc(db, 'settings', 'subscription');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.licenseKey !== undefined) setLicenseKey(data.licenseKey);
          if (data.planName !== undefined) setPlanName(data.planName);
          if (data.organizationName !== undefined) setOrganizationName(data.organizationName);
          if (data.validTill !== undefined) setValidTill(data.validTill);
          if (data.contactEmail !== undefined) setContactEmail(data.contactEmail);
          if (data.maxTerminals !== undefined) setMaxTerminals(data.maxTerminals);
          if (data.activeTerminals !== undefined) setActiveTerminals(data.activeTerminals);
        }
      } catch (err: any) {
        console.error('Error fetching subscription settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSubscription();
  }, []);

  const handleSave = async (updatedTerminals?: TerminalLicense[]) => {
    try {
      setSaving(true);
      setSaveStatus('idle');
      const docRef = doc(db, 'settings', 'subscription');
      await setDoc(docRef, {
        licenseKey,
        planName,
        organizationName,
        validTill,
        contactEmail,
        maxTerminals,
        activeTerminals: updatedTerminals || activeTerminals,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setSaveStatus('success');
      setStatusMessage('Subscription & license details saved successfully!');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch (err: any) {
      console.error('Error saving subscription:', err);
      setSaveStatus('error');
      setStatusMessage(err.message || 'Failed to save subscription details');
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setSaving(false);
    }
  };

  const copyKey = () => {
    if (!licenseKey) return;
    navigator.clipboard.writeText(licenseKey).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addTerminal = () => {
    if (!termId.trim()) return;
    const newTerminal: TerminalLicense = {
      id: termId.trim().toUpperCase(),
      name: termName.trim() || 'Workstation',
      lastSeen: 'Active today',
      os: termOS
    };
    const nextList = [...activeTerminals, newTerminal];
    setActiveTerminals(nextList);
    setTermId('');
    setTermName('');
    setShowAddTerminal(false);
  };

  const removeTerminal = (id: string) => {
    setActiveTerminals(ts => ts.filter(t => t.id !== id));
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
      <TabBar title="settings_subscription" />
      <ActionToolbar
        filterPlaceholder="Filter license details..."
        insertLabel={saving ? 'Saving...' : 'Save License Details'}
        onInsertClick={() => handleSave()}
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
              <span className="text-xs font-medium">Loading subscription details...</span>
            </div>
          ) : (
            <>
              {/* License Hero Card */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-900 to-emerald-700 border border-emerald-600 shadow-2xs text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/30 flex items-center justify-center">
                      <Award className="w-4 h-4 text-emerald-200" />
                    </div>
                    <div>
                      <div className="text-[10px] text-emerald-300 uppercase tracking-wider">Jewellery Next Cloud Suite</div>
                      <div className="text-sm font-medium text-white">
                        {planName || 'Jewellery Suite License'}
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-medium bg-emerald-500 text-white border border-emerald-400">
                    {licenseKey ? 'LICENSED' : 'ENTER DETAILS BELOW'}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="text-[10px] text-emerald-300 mb-1">Registered Key</div>
                  <div className="flex items-center gap-2 bg-emerald-800/50 rounded-md px-3 py-2">
                    <span className="font-mono text-sm text-white">
                      {licenseKey
                        ? (keyVisible ? licenseKey : `${licenseKey.slice(0, 4)}-••••-••••-••••`)
                        : 'No license key entered yet'}
                    </span>
                    {licenseKey && (
                      <button
                        type="button"
                        onClick={() => setKeyVisible(!keyVisible)}
                        className="text-[10px] text-emerald-300 hover:text-white transition-colors"
                      >
                        {keyVisible ? 'Hide' : 'Show'}
                      </button>
                    )}
                    {licenseKey && (
                      <button
                        type="button"
                        onClick={copyKey}
                        className="ml-auto text-emerald-300 hover:text-white transition-colors"
                        title="Copy Key"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {copied && <span className="text-[10px] text-emerald-200">Copied!</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] pt-2 border-t border-emerald-700/50">
                  <div>
                    <span className="text-emerald-300">Organization:</span>{' '}
                    <span className="font-medium text-white">{organizationName || '---'}</span>
                  </div>
                  <div>
                    <span className="text-emerald-300">Valid Till:</span>{' '}
                    <span className="font-medium text-white">{validTill || '---'}</span>
                  </div>
                  <div>
                    <span className="text-emerald-300">Terminals:</span>{' '}
                    <span className="font-medium text-white">
                      {activeTerminals.length} / {maxTerminals || 'Unlimited'}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-300">Support Email:</span>{' '}
                    <span className="font-medium text-white">{contactEmail || '---'}</span>
                  </div>
                </div>
              </div>

              {/* License Details Form */}
              <div className={sectionClass}>
                <div className={sectionHeader}>
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  Subscription &amp; Organization Details
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className={labelClass}>Organization / Jeweller Name *</div>
                    <input
                      className={inputClass}
                      value={organizationName}
                      onChange={e => setOrganizationName(e.target.value)}
                      placeholder="Enter legal showroom / firm name"
                    />
                  </div>
                  <div>
                    <div className={labelClass}>License Key *</div>
                    <input
                      className={`${inputClass} font-mono`}
                      value={licenseKey}
                      onChange={e => setLicenseKey(e.target.value)}
                      placeholder="e.g. JWLX-2026-ENTERPRISE-PRO"
                    />
                  </div>
                  <div>
                    <div className={labelClass}>Plan Name</div>
                    <input
                      className={inputClass}
                      value={planName}
                      onChange={e => setPlanName(e.target.value)}
                      placeholder="e.g. Enterprise Cloud, Multi-Branch Pro"
                    />
                  </div>
                  <div>
                    <div className={labelClass}>Validity Expiry Date</div>
                    <input
                      className={inputClass}
                      value={validTill}
                      onChange={e => setValidTill(e.target.value)}
                      type="date"
                    />
                  </div>
                  <div>
                    <div className={labelClass}>Max Authorized Terminals</div>
                    <input
                      className={inputClass}
                      value={maxTerminals}
                      onChange={e => setMaxTerminals(e.target.value)}
                      placeholder="e.g. 10 or Unlimited"
                    />
                  </div>
                  <div>
                    <div className={labelClass}>Registered Support Email</div>
                    <input
                      className={inputClass}
                      value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)}
                      placeholder="e.g. billing@jewellers.com"
                      type="email"
                    />
                  </div>
                </div>
              </div>

              {/* Active Terminals Table */}
              <div className={sectionClass}>
                <div className="flex items-center justify-between mb-2.5">
                  <div className={sectionHeader} style={{ marginBottom: 0 }}>
                    <Monitor className="w-3.5 h-3.5 text-emerald-600" />
                    Authorized Billing Terminals ({activeTerminals.length})
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddTerminal(!showAddTerminal)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Authorize Terminal
                  </button>
                </div>

                {/* Inline Add Terminal Form */}
                {showAddTerminal && (
                  <div className="mb-3 p-3 bg-white border border-emerald-200 rounded-lg shadow-2xs">
                    <div className="text-xs font-medium text-neutral-800 mb-2">Authorize New Counter Terminal</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                      <div>
                        <label className={labelClass}>Terminal ID *</label>
                        <input
                          className={inputClass}
                          placeholder="e.g. POS-MAIN-01"
                          value={termId}
                          onChange={e => setTermId(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Counter Name</label>
                        <input
                          className={inputClass}
                          placeholder="e.g. Gold Section Counter"
                          value={termName}
                          onChange={e => setTermName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Operating System</label>
                        <select
                          className={inputClass}
                          value={termOS}
                          onChange={e => setTermOS(e.target.value)}
                        >
                          <option value="Windows 11">Windows 11</option>
                          <option value="Windows 10">Windows 10</option>
                          <option value="macOS">macOS</option>
                          <option value="iPadOS">iPadOS</option>
                          <option value="Android">Android POS</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddTerminal(false)}
                        className="px-2.5 py-1 text-xs border border-neutral-200 rounded hover:bg-neutral-50 text-neutral-600 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={addTerminal}
                        className="px-3 py-1 text-xs bg-[#24b47e] hover:bg-[#1fa070] text-white rounded font-medium shadow-2xs"
                      >
                        Authorize
                      </button>
                    </div>
                  </div>
                )}

                {activeTerminals.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-md border border-dashed border-[#e2e8f0]">
                    <div className="text-xs text-neutral-500 font-medium">No terminals registered yet</div>
                    <div className="text-[11px] text-neutral-400 mt-1">
                      Click &apos;Authorize Terminal&apos; to register counter workstations for this showroom license.
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-[#e2e8f0]">
                          {['Terminal ID', 'Counter Name', 'OS Platform', 'Status', 'Actions'].map(h => (
                            <th key={h} className="text-left py-2 px-2 text-[10px] font-medium text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {activeTerminals.map(t => (
                          <tr key={t.id} className="border-b border-[#e2e8f0] hover:bg-white/60 transition-colors">
                            <td className="py-2.5 px-2 font-mono font-medium text-neutral-800">{t.id}</td>
                            <td className="py-2.5 px-2 text-neutral-700 font-medium">{t.name}</td>
                            <td className="py-2.5 px-2 text-neutral-600">{t.os}</td>
                            <td className="py-2.5 px-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                AUTHORIZED
                              </span>
                            </td>
                            <td className="py-2.5 px-2">
                              <button
                                type="button"
                                onClick={() => removeTerminal(t.id)}
                                className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
                                title="Revoke terminal"
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
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium bg-[#24b47e] text-white hover:bg-[#1fa070] disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{saving ? 'Saving...' : 'Save License Details'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
