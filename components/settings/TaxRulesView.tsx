'use client';
import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import { Scale, AlertTriangle, Info, Save, Shield } from 'lucide-react';

export function SettingsTaxRulesView() {
  const [tcsRate, setTcsRate] = useState('1');
  const [cashThreshold, setCashThreshold] = useState('200000');
  const [enforcePAN, setEnforcePAN] = useState(true);
  const [autoForm27EQ, setAutoForm27EQ] = useState(true);
  const [tcsApplicable, setTcsApplicable] = useState<string[]>(['Gold', 'Silver', 'Diamond']);

  const [tdsRate, setTdsRate] = useState('0.1');
  const [annualThreshold, setAnnualThreshold] = useState('5000000');
  const [deductTDS, setDeductTDS] = useState(true);
  const [supplierPANMandatory, setSupplierPANMandatory] = useState(true);

  const [maxCashPerTx, setMaxCashPerTx] = useState('199999');
  const [requireIDAbove, setRequireIDAbove] = useState('50000');
  const [alertOnBreach, setAlertOnBreach] = useState(true);

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
        insertLabel="Save Changes"
        onInsertClick={() => {}}
      />
      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        <div className="p-4 flex flex-col gap-4 max-w-5xl w-full mx-auto">

          {/* TCS Rules */}
          <div className={sectionClass}>
            <div className={sectionHeader}>
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              TCS Rules — Tax Collected at Source
            </div>

            {/* Info card */}
            <div className="flex items-start gap-2 p-2.5 rounded-md bg-blue-50 border border-blue-100 mb-3">
              <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
              <div className="text-[11px] text-blue-700">
                Under Section 206C(1H), sellers must collect TCS at 1% on cash sales of goods exceeding ₹50 lakh in a financial year. Applies to turnover &gt; ₹10 Cr.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className={labelClass}>TCS Rate (%)</div>
                <input className={inputClass} value={tcsRate} onChange={e => setTcsRate(e.target.value)} type="number" step="0.1" />
              </div>
              <div>
                <div className={labelClass}>Cash Transaction Threshold (₹)</div>
                <input className={inputClass} value={cashThreshold} onChange={e => setCashThreshold(e.target.value)} type="number" />
              </div>
            </div>

            <Toggle value={enforcePAN} onChange={() => setEnforcePAN(!enforcePAN)} label="Enforce PAN Capture Above Threshold" sub="Mandatory PAN for cash transactions above limit" />
            <Toggle value={autoForm27EQ} onChange={() => setAutoForm27EQ(!autoForm27EQ)} label="Auto-generate Form 27EQ Quarterly" sub="Prepare TCS return form automatically" />

            <div className="mt-3">
              <div className={labelClass}>TCS Applicable On</div>
              <div className="flex gap-2 flex-wrap">
                {['Gold', 'Silver', 'Diamond', 'All'].map(item => (
                  <button
                    key={item}
                    onClick={() => toggleTCS(item)}
                    className={`px-3 py-1 rounded-full text-[10px] font-medium border transition-colors ${tcsApplicable.includes(item) ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-white text-neutral-600 border-[#e2e8f0] hover:border-emerald-200'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* TDS Rules */}
          <div className={sectionClass}>
            <div className={sectionHeader}>
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              TDS Rules — Section 194Q
            </div>

            <div className="flex items-start gap-2 p-2.5 rounded-md bg-blue-50 border border-blue-100 mb-3">
              <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
              <div className="text-[11px] text-blue-700">
                Section 194Q requires buyers to deduct TDS at 0.1% on purchases exceeding ₹50 lakh from a supplier in a financial year. Buyer&apos;s turnover must exceed ₹10 Cr.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className={labelClass}>TDS Rate (%)</div>
                <input className={inputClass} value={tdsRate} onChange={e => setTdsRate(e.target.value)} type="number" step="0.01" />
              </div>
              <div>
                <div className={labelClass}>Annual Purchase Threshold (₹)</div>
                <input className={inputClass} value={annualThreshold} onChange={e => setAnnualThreshold(e.target.value)} type="number" />
              </div>
            </div>

            <Toggle value={deductTDS} onChange={() => setDeductTDS(!deductTDS)} label="Deduct TDS on Purchases Above Threshold" sub="Automatically flag purchases for TDS deduction" />
            <Toggle value={supplierPANMandatory} onChange={() => setSupplierPANMandatory(!supplierPANMandatory)} label="Supplier PAN Mandatory for TDS Deduction" sub="Block TDS deduction without valid supplier PAN" />
          </div>

          {/* Cash Transaction Limits (PMLA) */}
          <div className={sectionClass}>
            <div className={sectionHeader}>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Cash Transaction Limits — PMLA Compliance
            </div>

            <div className="flex items-start gap-2 p-2.5 rounded-md bg-amber-50 border border-amber-200 mb-3">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
              <div className="text-[11px] text-amber-700">
                Under PMLA and Income Tax Act, cash transactions above ₹2,00,000 per day per person are prohibited. Violations attract 100% penalty equal to the cash received.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className={labelClass}>Max Cash Acceptance Per Transaction (₹)</div>
                <input
                  className={`${inputClass} bg-red-50 border-red-200 text-red-800`}
                  value={maxCashPerTx}
                  onChange={e => setMaxCashPerTx(e.target.value)}
                  type="number"
                />
                <div className="text-[10px] text-red-500 mt-0.5">Enforced limit — ₹1,99,999 max per transaction</div>
              </div>
              <div>
                <div className={labelClass}>Require ID Proof Above (₹)</div>
                <input className={inputClass} value={requireIDAbove} onChange={e => setRequireIDAbove(e.target.value)} type="number" />
                <div className="text-[10px] text-neutral-500 mt-0.5">Aadhaar / PAN mandatory for cash above this limit</div>
              </div>
            </div>

            <Toggle value={alertOnBreach} onChange={() => setAlertOnBreach(!alertOnBreach)} label="Alert on Threshold Breach" sub="Show warning when cash limit is about to be breached" />
          </div>

          <div className="flex justify-end">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer">
              <Save className="w-3.5 h-3.5" />
              Save Tax Rules
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
