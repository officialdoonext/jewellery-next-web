'use client';
import React, { useState, useEffect } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import { Scale, Info, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export function SettingsTaxRulesView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Dynamic state — clean empty state
  const [tcsRate, setTcsRate] = useState('');
  const [cashThreshold, setCashThreshold] = useState('');
  const [enforcePAN, setEnforcePAN] = useState(false);
  const [autoForm27EQ, setAutoForm27EQ] = useState(false);
  const [tcsApplicable, setTcsApplicable] = useState<string[]>([]);

  const [tdsRate, setTdsRate] = useState('');
  const [annualThreshold, setAnnualThreshold] = useState('');
  const [deductTDS, setDeductTDS] = useState(false);
  const [supplierPANMandatory, setSupplierPANMandatory] = useState(false);

  const [maxCashPerTx, setMaxCashPerTx] = useState('');
  const [requireIDAbove, setRequireIDAbove] = useState('');
  const [alertOnBreach, setAlertOnBreach] = useState(false);

  useEffect(() => {
    async function loadTaxRules() {
      try {
        setLoading(true);
        const docRef = doc(db, 'settings', 'tax-rules');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.tcsRate !== undefined) setTcsRate(data.tcsRate);
          if (data.cashThreshold !== undefined) setCashThreshold(data.cashThreshold);
          if (data.enforcePAN !== undefined) setEnforcePAN(data.enforcePAN);
          if (data.autoForm27EQ !== undefined) setAutoForm27EQ(data.autoForm27EQ);
          if (data.tcsApplicable !== undefined) setTcsApplicable(data.tcsApplicable);

          if (data.tdsRate !== undefined) setTdsRate(data.tdsRate);
          if (data.annualThreshold !== undefined) setAnnualThreshold(data.annualThreshold);
          if (data.deductTDS !== undefined) setDeductTDS(data.deductTDS);
          if (data.supplierPANMandatory !== undefined) setSupplierPANMandatory(data.supplierPANMandatory);

          if (data.maxCashPerTx !== undefined) setMaxCashPerTx(data.maxCashPerTx);
          if (data.requireIDAbove !== undefined) setRequireIDAbove(data.requireIDAbove);
          if (data.alertOnBreach !== undefined) setAlertOnBreach(data.alertOnBreach);
        }
      } catch (err: any) {
        console.error('Error fetching tax rules:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTaxRules();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveStatus('idle');
      const docRef = doc(db, 'settings', 'tax-rules');
      await setDoc(docRef, {
        tcsRate,
        cashThreshold,
        enforcePAN,
        autoForm27EQ,
        tcsApplicable,
        tdsRate,
        annualThreshold,
        deductTDS,
        supplierPANMandatory,
        maxCashPerTx,
        requireIDAbove,
        alertOnBreach,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setSaveStatus('success');
      setStatusMessage('Tax compliance & threshold rules saved successfully!');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch (err: any) {
      console.error('Error saving tax rules:', err);
      setSaveStatus('error');
      setStatusMessage(err.message || 'Failed to save tax rules');
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setSaving(false);
    }
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

  const toggleTCS = (item: string) => {
    setTcsApplicable(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="settings_tax_rules" />
      <ActionToolbar
        filterPlaceholder="Filter tax rules..."
        insertLabel={saving ? 'Saving...' : 'Save Rules'}
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
              <span className="text-xs font-medium">Loading tax rules...</span>
            </div>
          ) : (
            <>
              {/* TCS Rules */}
              <div className={sectionClass}>
                <div className={sectionHeader}>
                  <Scale className="w-3.5 h-3.5 text-emerald-600" />
                  TCS Rules — Tax Collected at Source (Section 206C)
                </div>

                <div className="flex items-start gap-2 p-2.5 rounded-md bg-blue-50 border border-blue-100 mb-3">
                  <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                  <div className="text-[11px] text-blue-700 font-medium">
                    Configure Tax Collected at Source thresholds for bullion, jewellery, and cash receipts according to Income Tax regulations.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className={labelClass}>TCS Rate (%)</div>
                    <input
                      className={inputClass}
                      value={tcsRate}
                      onChange={e => setTcsRate(e.target.value)}
                      placeholder="e.g. 1.0"
                      type="number"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <div className={labelClass}>Cash Transaction Threshold (₹)</div>
                    <input
                      className={inputClass}
                      value={cashThreshold}
                      onChange={e => setCashThreshold(e.target.value)}
                      placeholder="e.g. 200000"
                      type="number"
                    />
                  </div>
                </div>

                <Toggle
                  value={enforcePAN}
                  onChange={() => setEnforcePAN(!enforcePAN)}
                  label="Enforce PAN Capture Above Threshold"
                  sub="Mandatory PAN entry for cash transactions above specified limit"
                />
                <Toggle
                  value={autoForm27EQ}
                  onChange={() => setAutoForm27EQ(!autoForm27EQ)}
                  label="Auto-generate Form 27EQ Quarterly Summary"
                  sub="Aggregate TCS collections for quarterly compliance filing"
                />

                <div className="mt-3">
                  <div className={labelClass}>TCS Applicable Commodity Types</div>
                  <div className="flex gap-2 flex-wrap">
                    {['Gold Jewellery', 'Silver Articles', 'Loose Diamonds', 'Bullion Coins', 'Platinum'].map(item => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleTCS(item)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          tcsApplicable.includes(item)
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                            : 'bg-white text-neutral-600 border-[#e2e8f0] hover:border-emerald-200'
                        }`}
                      >
                        {item} {tcsApplicable.includes(item) ? '✓' : '+'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* TDS Rules */}
              <div className={sectionClass}>
                <div className={sectionHeader}>
                  <Scale className="w-3.5 h-3.5 text-emerald-600" />
                  TDS on Purchases (Section 194Q)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className={labelClass}>TDS Rate (%)</div>
                    <input
                      className={inputClass}
                      value={tdsRate}
                      onChange={e => setTdsRate(e.target.value)}
                      placeholder="e.g. 0.1"
                      type="number"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <div className={labelClass}>Annual Supplier Purchase Threshold (₹)</div>
                    <input
                      className={inputClass}
                      value={annualThreshold}
                      onChange={e => setAnnualThreshold(e.target.value)}
                      placeholder="e.g. 5000000"
                      type="number"
                    />
                  </div>
                </div>

                <Toggle
                  value={deductTDS}
                  onChange={() => setDeductTDS(!deductTDS)}
                  label="Auto-deduct TDS on Bullion Purchase Invoices"
                  sub="Automatically calculate TDS deduction when supplier purchases exceed threshold"
                />
                <Toggle
                  value={supplierPANMandatory}
                  onChange={() => setSupplierPANMandatory(!supplierPANMandatory)}
                  label="Supplier PAN Mandatory for TDS"
                  sub="Reject purchase invoice submission if supplier PAN is absent"
                />
              </div>

              {/* Cash Transaction Limits */}
              <div className={sectionClass}>
                <div className={sectionHeader}>
                  <Scale className="w-3.5 h-3.5 text-amber-500" />
                  Cash Limits &amp; Anti-Money Laundering Safeguards
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className={labelClass}>Max Cash Accepted Per Transaction (₹)</div>
                    <input
                      className={inputClass}
                      value={maxCashPerTx}
                      onChange={e => setMaxCashPerTx(e.target.value)}
                      placeholder="e.g. 199999"
                      type="number"
                    />
                  </div>
                  <div>
                    <div className={labelClass}>Require Customer ID / Aadhaar Above (₹)</div>
                    <input
                      className={inputClass}
                      value={requireIDAbove}
                      onChange={e => setRequireIDAbove(e.target.value)}
                      placeholder="e.g. 50000"
                      type="number"
                    />
                  </div>
                </div>

                <Toggle
                  value={alertOnBreach}
                  onChange={() => setAlertOnBreach(!alertOnBreach)}
                  label="Display Prominent Warning on Threshold Breach"
                  sub="Warn cashier immediately if payment exceeds statutory cash acceptance limit"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium bg-[#24b47e] text-white hover:bg-[#1fa070] disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{saving ? 'Saving...' : 'Save Tax Rules'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
