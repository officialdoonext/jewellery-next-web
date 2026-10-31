'use client';
import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import { Tag, Check, Save, Printer } from 'lucide-react';

const TEMPLATES = [
  { id: 'dumbbell', name: 'Dumbbell Jewellery Tag', dims: '68×12mm', fields: 8, driver: 'ZPL', icon: '🏷️' },
  { id: 'rattail', name: 'Rat-Tail Tag', dims: '50×10mm', fields: 6, driver: 'TSPL', icon: '🔖' },
  { id: 'butterfly', name: 'Butterfly Tag', dims: '40×25mm', fields: 10, driver: 'ZPL', icon: '🦋' },
  { id: 'coin', name: 'Coin Label', dims: '30×30mm', fields: 5, driver: 'EPL', icon: '🪙' },
];

const ALL_FIELDS = [
  'Tag Number', 'Item Name', 'Gross Weight', 'Net Weight',
  'Purity/Karat', 'HUID Code', 'QR Code', 'Barcode 1D',
  'Price (MRP)', 'Metal Type', 'Stone Details'
];

export function SettingsBarcodeTemplatesView() {
  const [activeTemplate, setActiveTemplate] = useState('dumbbell');
  const [defaultTemplate, setDefaultTemplate] = useState('dumbbell');
  const [labelWidth, setLabelWidth] = useState('68');
  const [labelHeight, setLabelHeight] = useState('12');
  const [driver, setDriver] = useState('ZPL');
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'Tag Number','Item Name','Gross Weight','Net Weight','Purity/Karat','HUID Code','QR Code','Barcode 1D'
  ]);
  const [qrContent, setQrContent] = useState('Tag ID');
  const [fontSize, setFontSize] = useState('Medium');
  const [showShopName, setShowShopName] = useState(true);

  const inputClass =
    'w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 placeholder:text-neutral-400 transition-colors';
  const labelClass = 'text-xs font-medium text-neutral-700 mb-1';
  const sectionClass =
    'p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs';
  const sectionHeader =
    'text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5';

  const toggleField = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="settings_barcode_templates" />
      <ActionToolbar
        filterPlaceholder="Filter barcode templates..."
        insertLabel="Save Template"
        onInsertClick={() => {}}
      />
      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        <div className="p-4 flex flex-col gap-4 max-w-5xl w-full mx-auto">

          {/* Template Gallery */}
          <div className={sectionClass}>
            <div className={sectionHeader}>
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              Template Gallery
            </div>
            <div className="grid grid-cols-4 gap-3">
              {TEMPLATES.map(t => (
                <div
                  key={t.id}
                  onClick={() => { setActiveTemplate(t.id); setDriver(t.driver); }}
                  className={`relative rounded-lg border p-3 cursor-pointer transition-all ${activeTemplate === t.id ? 'border-emerald-400 bg-emerald-50' : 'border-[#e2e8f0] bg-white hover:border-emerald-200'}`}
                >
                  {defaultTemplate === t.id && (
                    <span className="absolute top-2 right-2 text-[9px] font-medium bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                      DEFAULT
                    </span>
                  )}
                  <div className="text-2xl mb-2">{t.icon}</div>
                  <div className="text-xs font-medium text-neutral-800">{t.name}</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">{t.dims}</div>
                  <div className="text-[10px] text-neutral-500">{t.fields} fields • {t.driver}</div>
                  {defaultTemplate !== t.id && (
                    <button
                      onClick={e => { e.stopPropagation(); setDefaultTemplate(t.id); }}
                      className="mt-2 text-[10px] text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Set Default
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

          {/* Template Designer */}
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-3 flex flex-col gap-4">
              <div className={sectionClass}>
                <div className={sectionHeader}>
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  Template Designer — {TEMPLATES.find(t => t.id === activeTemplate)?.name}
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <div className={labelClass}>Width (mm)</div>
                    <input className={inputClass} value={labelWidth} onChange={e => setLabelWidth(e.target.value)} type="number" />
                  </div>
                  <div>
                    <div className={labelClass}>Height (mm)</div>
                    <input className={inputClass} value={labelHeight} onChange={e => setLabelHeight(e.target.value)} type="number" />
                  </div>
                  <div>
                    <div className={labelClass}>Printer Driver</div>
                    <select className={inputClass} value={driver} onChange={e => setDriver(e.target.value)}>
                      {['ZPL','TSPL','EPL'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <div className={`${labelClass} mb-2`}>Fields to Include</div>
                  <div className="flex flex-wrap gap-2">
                    {ALL_FIELDS.map(field => (
                      <button
                        key={field}
                        onClick={() => toggleField(field)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${selectedFields.includes(field) ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-white text-neutral-600 border-[#e2e8f0] hover:border-emerald-200'}`}
                      >
                        {selectedFields.includes(field) && <Check className="w-2.5 h-2.5" />}
                        {field}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className={labelClass}>QR Code Content</div>
                    <select className={inputClass} value={qrContent} onChange={e => setQrContent(e.target.value)}>
                      {['Tag ID','Full Item URL','HUID'].map(q => <option key={q}>{q}</option>)}
                    </select>
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
                </div>

                <div className="mt-3 flex items-center justify-between py-2 border-t border-[#e2e8f0]">
                  <div>
                    <div className="text-xs font-medium text-neutral-700">Show Shop Name on Tag</div>
                    <div className="text-[11px] text-neutral-500">Print your brand name on each label</div>
                  </div>
                  <button
                    onClick={() => setShowShopName(!showShopName)}
                    className={`w-9 h-5 rounded-full transition-colors relative ${showShopName ? 'bg-emerald-500' : 'bg-neutral-200'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-all ${showShopName ? 'left-4' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Area */}
            <div className="col-span-2">
              <div className={sectionClass}>
                <div className={sectionHeader}>
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  Label Preview
                </div>
                <div className="flex justify-center">
                  <div
                    className="border-2 border-dashed border-[#e2e8f0] rounded bg-white flex flex-col p-2 gap-1"
                    style={{ width: `${Math.min(parseInt(labelWidth) * 3, 200)}px`, minHeight: `${Math.min(parseInt(labelHeight) * 3, 80)}px` }}
                  >
                    {showShopName && (
                      <div className="text-[8px] text-center text-neutral-500 font-medium border-b border-dashed border-[#e2e8f0] pb-0.5">Sri Jewellers</div>
                    )}
                    {selectedFields.slice(0, 4).map(f => (
                      <div key={f} className="text-[7px] text-neutral-600 flex justify-between">
                        <span className="text-neutral-400">{f}:</span>
                        <span className="font-medium">{f === 'Gross Weight' ? '12.340g' : f === 'HUID Code' ? 'XX1234AB' : f === 'Purity/Karat' ? '916 / 22K' : '---'}</span>
                      </div>
                    ))}
                    {selectedFields.includes('QR Code') && (
                      <div className="flex justify-center mt-1">
                        <div className="w-8 h-8 bg-neutral-200 rounded flex items-center justify-center text-[6px] text-neutral-500">QR</div>
                      </div>
                    )}
                    {selectedFields.includes('Barcode 1D') && (
                      <div className="flex justify-center mt-0.5">
                        <div className="w-full h-4 bg-gradient-to-r from-neutral-800 via-white to-neutral-800" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #333 0px, #333 2px, white 2px, white 4px)' }} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex justify-center">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-[#e2e8f0] hover:bg-neutral-50 transition-colors shadow-2xs cursor-pointer">
                    <Printer className="w-3.5 h-3.5" />
                    Print Test Tag
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer">
              <Save className="w-3.5 h-3.5" />
              Save Barcode Templates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
