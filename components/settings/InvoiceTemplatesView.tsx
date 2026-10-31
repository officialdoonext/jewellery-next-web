'use client';
import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import { FileText, Check, Printer } from 'lucide-react';

const TEMPLATES = [
  { id: 'thermal', name: 'Thermal 3" Roll', size: '80mm Roll', icon: '🧾' },
  { id: 'a4', name: 'A4 GST Tax Invoice', size: 'A4 Portrait', icon: '📄' },
  { id: 'a5', name: 'A5 Estimate Slip', size: 'A5 Portrait', icon: '📋' },
  { id: 'guarantee', name: 'Guarantee Card', size: '100×65mm', icon: '🏅' },
];

export function SettingsInvoiceTemplatesView() {
  const [activeTemplate, setActiveTemplate] = useState('a4');
  const [defaultTemplate, setDefaultTemplate] = useState('a4');
  const [paperFormat, setPaperFormat] = useState('A4 Portrait');
  const [showItemBreakup, setShowItemBreakup] = useState(true);
  const [showHUID, setShowHUID] = useState(true);
  const [showQR, setShowQR] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [terms, setTerms] = useState('Goods once sold will not be taken back. All disputes subject to Hyderabad jurisdiction.');
  const [headerLayout, setHeaderLayout] = useState('Logo Left');
  const [fontSize, setFontSize] = useState('Medium');
  const [invoicePrefix, setInvoicePrefix] = useState('INV-');
  const [showMakingCharge, setShowMakingCharge] = useState(true);
  const [gstBreakup, setGstBreakup] = useState('Combined CGST+SGST');
  const [defaultCopies, setDefaultCopies] = useState('1');
  const [autoPrint, setAutoPrint] = useState(false);

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

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="settings_invoice_templates" />
      <ActionToolbar
        filterPlaceholder="Filter templates..."
        insertLabel="Save Changes"
        onInsertClick={() => {}}
      />
      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        <div className="p-4 flex flex-col gap-4 max-w-5xl w-full mx-auto">

          {/* Template Gallery */}
          <div className={sectionClass}>
            <div className={sectionHeader}>
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              Template Gallery
            </div>
            <div className="grid grid-cols-4 gap-3">
              {TEMPLATES.map(t => (
                <div
                  key={t.id}
                  onClick={() => setActiveTemplate(t.id)}
                  className={`relative rounded-lg border p-3.5 cursor-pointer transition-all ${activeTemplate === t.id ? 'border-emerald-400 bg-emerald-50' : 'border-[#e2e8f0] bg-white hover:border-emerald-200'}`}
                >
                  {defaultTemplate === t.id && (
                    <span className="absolute top-2 right-2 text-[9px] font-medium bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                      DEFAULT
                    </span>
                  )}
                  <div className="text-2xl mb-2">{t.icon}</div>
                  <div className="text-xs font-medium text-neutral-800">{t.name}</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">{t.size}</div>
                  {defaultTemplate !== t.id && (
                    <button
                      onClick={e => { e.stopPropagation(); setDefaultTemplate(t.id); }}
                      className="mt-2 text-[10px] text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Set as Default
                    </button>
                  )}
                  {activeTemplate === t.id && (
                    <div className="absolute bottom-2 right-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active Template Settings */}
          <div className={sectionClass}>
            <div className={sectionHeader}>
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              Active Template Settings — {TEMPLATES.find(t => t.id === activeTemplate)?.name}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <div>
                  <div className={labelClass}>Paper Format</div>
                  <select className={inputClass} value={paperFormat} onChange={e => setPaperFormat(e.target.value)}>
                    {['A4 Portrait','A4 Landscape','A5','Thermal 80mm','Thermal 58mm'].map(f => (
                      <option key={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className={labelClass}>Invoice Number Prefix</div>
                  <input className={inputClass} value={invoicePrefix} onChange={e => setInvoicePrefix(e.target.value)} placeholder="INV-" />
                </div>

                <div>
                  <div className={labelClass}>Header Layout</div>
                  <div className="flex gap-2">
                    {['Logo Left','Logo Center','Logo Right'].map(l => (
                      <button
                        key={l}
                        onClick={() => setHeaderLayout(l)}
                        className={`flex-1 py-2 text-[10px] font-medium rounded border transition-colors ${headerLayout === l ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-[#e2e8f0] bg-white text-neutral-600 hover:border-emerald-200'}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className={labelClass}>Font Size</div>
                  <div className="flex gap-2">
                    {['Small','Medium','Large'].map(s => (
                      <button
                        key={s}
                        onClick={() => setFontSize(s)}
                        className={`flex-1 py-2 text-[10px] font-medium rounded border transition-colors ${fontSize === s ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-[#e2e8f0] bg-white text-neutral-600 hover:border-emerald-200'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className={labelClass}>GST Breakup Style</div>
                  <div className="flex gap-2">
                    {['Combined CGST+SGST','Split line-by-line'].map(s => (
                      <button
                        key={s}
                        onClick={() => setGstBreakup(s)}
                        className={`flex-1 py-2 text-[10px] font-medium rounded border transition-colors ${gstBreakup === s ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-[#e2e8f0] bg-white text-neutral-600 hover:border-emerald-200'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-0">
                <Toggle value={showItemBreakup} onChange={() => setShowItemBreakup(!showItemBreakup)} label="Show Item Breakup Table" sub="Display detailed item rows on invoice" />
                <Toggle value={showHUID} onChange={() => setShowHUID(!showHUID)} label="Show HUID / BIS Stamp" sub="Print BIS Hallmark unique ID" />
                <Toggle value={showQR} onChange={() => setShowQR(!showQR)} label="Show QR Code for UPI Payment" sub="Auto-generate UPI QR on invoice" />
                <Toggle value={showMakingCharge} onChange={() => setShowMakingCharge(!showMakingCharge)} label="Show Making Charge Breakup" sub="Separate making charge line item" />
                <Toggle value={showTerms} onChange={() => setShowTerms(!showTerms)} label="Show Terms &amp; Conditions" sub="Print T&C at invoice footer" />
                {showTerms && (
                  <div className="pt-2">
                    <div className={labelClass}>Custom Terms Text</div>
                    <textarea
                      className={`${inputClass} resize-none h-20`}
                      value={terms}
                      onChange={e => setTerms(e.target.value)}
                      placeholder="Enter terms and conditions..."
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Print Settings */}
          <div className={sectionClass}>
            <div className={sectionHeader}>
              <Printer className="w-3.5 h-3.5 text-emerald-600" />
              Print Settings
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className={labelClass}>Default Copies</div>
                <div className="flex gap-2">
                  {['1','2','3'].map(c => (
                    <button
                      key={c}
                      onClick={() => setDefaultCopies(c)}
                      className={`flex-1 py-2 text-xs font-medium rounded border transition-colors ${defaultCopies === c ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-[#e2e8f0] bg-white text-neutral-600 hover:border-emerald-200'}`}
                    >
                      {c} {c === '1' ? 'Copy' : 'Copies'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-neutral-700">Auto-print on Bill Completion</div>
                  <div className="text-[11px] text-neutral-500">Trigger print immediately after billing</div>
                </div>
                <button
                  onClick={() => setAutoPrint(!autoPrint)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${autoPrint ? 'bg-emerald-500' : 'bg-neutral-200'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-all ${autoPrint ? 'left-4' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer">
              <FileText className="w-3.5 h-3.5" />
              Save Template Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
