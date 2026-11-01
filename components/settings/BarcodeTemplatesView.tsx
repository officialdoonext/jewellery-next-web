'use client';
import React, { useState, useEffect } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import { Tag, Check, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const BASE_TEMPLATES = [
  { id: 'dumbbell', name: 'Dumbbell Jewellery Tag', dims: '68×12mm', defaultDriver: 'ZPL', icon: '🏷️' },
  { id: 'rattail', name: 'Rat-Tail Tag', dims: '50×10mm', defaultDriver: 'TSPL', icon: '🔖' },
  { id: 'butterfly', name: 'Butterfly Tag', dims: '40×25mm', defaultDriver: 'ZPL', icon: '🦋' },
  { id: 'coin', name: 'Coin / Bullion Label', dims: '30×30mm', defaultDriver: 'EPL', icon: '🪙' },
];

const ALL_FIELDS = [
  'Tag Number', 'Item Name', 'Gross Weight', 'Net Weight',
  'Purity / Karat', 'HUID Code', 'QR Code', 'Barcode 1D',
  'Price (MRP)', 'Metal Type', 'Stone Details', 'Shop Name'
];

export function SettingsBarcodeTemplatesView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Dynamic state — clean empty values
  const [activeTemplate, setActiveTemplate] = useState('dumbbell');
  const [defaultTemplate, setDefaultTemplate] = useState('dumbbell');
  const [labelWidth, setLabelWidth] = useState('');
  const [labelHeight, setLabelHeight] = useState('');
  const [driver, setDriver] = useState('ZPL');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [qrContent, setQrContent] = useState('');
  const [fontSize, setFontSize] = useState('Medium');
  const [showShopName, setShowShopName] = useState(false);

  useEffect(() => {
    async function loadBarcodeSettings() {
      try {
        setLoading(true);
        const docRef = doc(db, 'settings', 'barcode-templates');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.activeTemplate !== undefined) setActiveTemplate(data.activeTemplate);
          if (data.defaultTemplate !== undefined) setDefaultTemplate(data.defaultTemplate);
          if (data.labelWidth !== undefined) setLabelWidth(data.labelWidth);
          if (data.labelHeight !== undefined) setLabelHeight(data.labelHeight);
          if (data.driver !== undefined) setDriver(data.driver);
          if (data.selectedFields !== undefined) setSelectedFields(data.selectedFields);
          if (data.qrContent !== undefined) setQrContent(data.qrContent);
          if (data.fontSize !== undefined) setFontSize(data.fontSize);
          if (data.showShopName !== undefined) setShowShopName(data.showShopName);
        }
      } catch (err: any) {
        console.error('Error fetching barcode template settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBarcodeSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveStatus('idle');
      const docRef = doc(db, 'settings', 'barcode-templates');
      await setDoc(docRef, {
        activeTemplate,
        defaultTemplate,
        labelWidth,
        labelHeight,
        driver,
        selectedFields,
        qrContent,
        fontSize,
        showShopName,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setSaveStatus('success');
      setStatusMessage('Barcode template configuration saved successfully!');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch (err: any) {
      console.error('Error saving barcode settings:', err);
      setSaveStatus('error');
      setStatusMessage(err.message || 'Failed to save barcode template');
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
        insertLabel={saving ? 'Saving...' : 'Save Template'}
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
              <span className="text-xs font-medium">Loading barcode template settings...</span>
            </div>
          ) : (
            <>
              {/* Template Gallery */}
              <div className={sectionClass}>
                <div className={sectionHeader}>
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  Jewellery Tag Format Styles
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {BASE_TEMPLATES.map(t => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setActiveTemplate(t.id);
                        setDriver(t.defaultDriver);
                      }}
                      className={`relative rounded-lg border p-3 cursor-pointer transition-all ${
                        activeTemplate === t.id
                          ? 'border-emerald-400 bg-emerald-50'
                          : 'border-[#e2e8f0] bg-white hover:border-emerald-200'
                      }`}
                    >
                      {defaultTemplate === t.id && (
                        <span className="absolute top-2 right-2 text-[9px] font-medium bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                          DEFAULT
                        </span>
                      )}
                      <div className="text-2xl mb-2">{t.icon}</div>
                      <div className="text-xs font-medium text-neutral-800">{t.name}</div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">{t.dims}</div>
                      <div className="text-[10px] text-neutral-500">{t.defaultDriver} Language</div>
                      {defaultTemplate !== t.id && (
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setDefaultTemplate(t.id);
                          }}
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

              {/* Template Properties */}
              <div className={sectionClass}>
                <div className={sectionHeader}>
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  Dimensions &amp; Printer Driver
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className={labelClass}>Tag Width (mm)</div>
                    <input
                      className={inputClass}
                      value={labelWidth}
                      onChange={e => setLabelWidth(e.target.value)}
                      placeholder="e.g. 68"
                      type="number"
                    />
                  </div>
                  <div>
                    <div className={labelClass}>Tag Height (mm)</div>
                    <input
                      className={inputClass}
                      value={labelHeight}
                      onChange={e => setLabelHeight(e.target.value)}
                      placeholder="e.g. 12"
                      type="number"
                    />
                  </div>
                  <div>
                    <div className={labelClass}>Printer Language / Protocol</div>
                    <select
                      className={inputClass}
                      value={driver}
                      onChange={e => setDriver(e.target.value)}
                    >
                      <option value="ZPL">Zebra ZPL / ZPL II</option>
                      <option value="TSPL">TSC TSPL / TSPL2</option>
                      <option value="EPL">Eltron EPL</option>
                      <option value="DPL">Datamax DPL</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tag Fields Selection */}
              <div className={sectionClass}>
                <div className={sectionHeader}>
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  Select Fields to Print on Label ({selectedFields.length} selected)
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {ALL_FIELDS.map(f => {
                    const isSelected = selectedFields.includes(f);
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => toggleField(f)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                            : 'bg-white border-[#e2e8f0] text-neutral-600 hover:border-emerald-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {f}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#e2e8f0]">
                  <div>
                    <div className={labelClass}>QR Code Payload Content</div>
                    <input
                      className={inputClass}
                      value={qrContent}
                      onChange={e => setQrContent(e.target.value)}
                      placeholder="e.g. Tag ID, HUID, or Verification URL"
                    />
                  </div>
                  <div>
                    <div className={labelClass}>Tag Font Sizing</div>
                    <select
                      className={inputClass}
                      value={fontSize}
                      onChange={e => setFontSize(e.target.value)}
                    >
                      <option value="Small">Small (Compact font for micro dumbbell)</option>
                      <option value="Medium">Medium (Balanced clarity)</option>
                      <option value="Large">Large (Prominent text)</option>
                    </select>
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
                  <span>{saving ? 'Saving...' : 'Save Barcode Template'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
