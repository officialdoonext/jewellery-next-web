'use client';
import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Building2,
  Save,
  Upload,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  FileText,
  Shield,
} from 'lucide-react';

export function SettingsShopProfileView() {
  const [legalName, setLegalName] = useState('Srinivasa Jewellers Pvt Ltd');
  const [brandName, setBrandName] = useState('Sri Jewellers');
  const [tagline, setTagline] = useState('Pure Gold. Pure Trust.');
  const [estYear, setEstYear] = useState('1998');
  const [gstin, setGstin] = useState('36AABCS1234F1ZX');
  const [pan, setPan] = useState('AABCS1234F');
  const [bisCode, setBisCode] = useState('HYD-BIS-2024-00123');
  const [state, setState] = useState('Telangana');
  const [gstType, setGstType] = useState('Regular');
  const [phonePrimary, setPhonePrimary] = useState('+91 98765 43210');
  const [phoneSecondary, setPhoneSecondary] = useState('');
  const [email, setEmail] = useState('info@srijewellers.com');
  const [address, setAddress] = useState('12-3-45, Jewellers Street, Abids');
  const [city, setCity] = useState('Hyderabad');
  const [addrState, setAddrState] = useState('Telangana');
  const [pin, setPin] = useState('500001');
  const [country, setCountry] = useState('India');
  const [bankName, setBankName] = useState('State Bank of India');
  const [accountNo, setAccountNo] = useState('31234567890');
  const [ifsc, setIfsc] = useState('SBIN0001234');
  const [accountType, setAccountType] = useState('Current');
  const [branch, setBranch] = useState('Abids, Hyderabad');
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);

  const inputClass =
    'w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 placeholder:text-neutral-400 transition-colors';
  const labelClass = 'text-xs font-medium text-neutral-700 mb-1';
  const sectionClass =
    'p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs';
  const sectionHeader =
    'text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="settings_shop_profile" />
      <ActionToolbar
        filterPlaceholder="Filter settings..."
        insertLabel="Save Changes"
        onInsertClick={() => {}}
      />
      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        <div className="p-4 flex flex-col gap-4 max-w-5xl w-full mx-auto">

          {/* Invoice Header Preview */}
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-4">

              {/* Business Identity */}
              <div className={sectionClass}>
                <div className={sectionHeader}>
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  Business Identity
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className={labelClass}>Legal Business Name *</div>
                    <input className={inputClass} value={legalName} onChange={e => setLegalName(e.target.value)} placeholder="e.g. Srinivasa Jewellers Pvt Ltd" />
                  </div>
                  <div>
                    <div className={labelClass}>Brand Name *</div>
                    <input className={inputClass} value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="e.g. Sri Jewellers" />
                  </div>
                  <div>
                    <div className={labelClass}>Tagline</div>
                    <input className={inputClass} value={tagline} onChange={e => setTagline(e.target.value)} placeholder="e.g. Pure Gold. Pure Trust." />
                  </div>
                  <div>
                    <div className={labelClass}>Established Year</div>
                    <input className={inputClass} value={estYear} onChange={e => setEstYear(e.target.value)} placeholder="e.g. 1998" type="number" />
                  </div>
                </div>
              </div>

              {/* Registration & Compliance */}
              <div className={sectionClass}>
                <div className={sectionHeader}>
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  Registration &amp; Compliance
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className={labelClass}>GSTIN *</div>
                    <input className={inputClass} value={gstin} onChange={e => setGstin(e.target.value)} placeholder="e.g. 36AABCS1234F1ZX" />
                  </div>
                  <div>
                    <div className={labelClass}>PAN *</div>
                    <input className={inputClass} value={pan} onChange={e => setPan(e.target.value)} placeholder="e.g. AABCS1234F" />
                  </div>
                  <div>
                    <div className={labelClass}>BIS Hallmark Licence No (A/C Code) *</div>
                    <input className={inputClass} value={bisCode} onChange={e => setBisCode(e.target.value)} placeholder="e.g. HYD-BIS-2024-00123" />
                  </div>
                  <div>
                    <div className={labelClass}>State</div>
                    <select className={inputClass} value={state} onChange={e => setState(e.target.value)}>
                      {['Telangana','Maharashtra','Karnataka','Tamil Nadu','Gujarat','Rajasthan','Delhi','West Bengal','Uttar Pradesh','Kerala'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <div className={labelClass}>GST Registration Type</div>
                    <div className="flex gap-2">
                      {['Regular','Composition'].map(t => (
                        <button
                          key={t}
                          onClick={() => setGstType(t)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${gstType === t ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-[#e2e8f0] text-neutral-600 hover:border-emerald-200'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact & Location */}
              <div className={sectionClass}>
                <div className={sectionHeader}>
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  Contact &amp; Location
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className={labelClass}>Phone (Primary) *</div>
                    <div className="relative">
                      <Phone className="w-3 h-3 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input className={`${inputClass} pl-7`} value={phonePrimary} onChange={e => setPhonePrimary(e.target.value)} placeholder="+91 98765 43210" />
                    </div>
                  </div>
                  <div>
                    <div className={labelClass}>Phone (Secondary)</div>
                    <div className="relative">
                      <Phone className="w-3 h-3 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input className={`${inputClass} pl-7`} value={phoneSecondary} onChange={e => setPhoneSecondary(e.target.value)} placeholder="+91 40 2345 6789" />
                    </div>
                  </div>
                  <div>
                    <div className={labelClass}>Email *</div>
                    <div className="relative">
                      <Mail className="w-3 h-3 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input className={`${inputClass} pl-7`} value={email} onChange={e => setEmail(e.target.value)} placeholder="info@example.com" type="email" />
                    </div>
                  </div>
                  <div>
                    <div className={labelClass}>City *</div>
                    <input className={inputClass} value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Hyderabad" />
                  </div>
                  <div className="col-span-2">
                    <div className={labelClass}>Full Address *</div>
                    <textarea
                      className={`${inputClass} resize-none h-16`}
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="Shop No., Street, Area..."
                    />
                  </div>
                  <div>
                    <div className={labelClass}>State *</div>
                    <select className={inputClass} value={addrState} onChange={e => setAddrState(e.target.value)}>
                      {['Telangana','Maharashtra','Karnataka','Tamil Nadu','Gujarat','Rajasthan','Delhi','West Bengal','Uttar Pradesh','Kerala'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className={labelClass}>PIN Code *</div>
                    <input className={inputClass} value={pin} onChange={e => setPin(e.target.value)} placeholder="500001" maxLength={6} />
                  </div>
                  <div>
                    <div className={labelClass}>Country</div>
                    <input className={inputClass} value={country} disabled />
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className={sectionClass}>
                <div className={sectionHeader}>
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  Bank Details (for RTGS on Invoice)
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className={labelClass}>Bank Name</div>
                    <input className={inputClass} value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. State Bank of India" />
                  </div>
                  <div>
                    <div className={labelClass}>Account Number</div>
                    <input className={inputClass} value={accountNo} onChange={e => setAccountNo(e.target.value)} placeholder="e.g. 31234567890" />
                  </div>
                  <div>
                    <div className={labelClass}>IFSC Code</div>
                    <input className={inputClass} value={ifsc} onChange={e => setIfsc(e.target.value)} placeholder="e.g. SBIN0001234" />
                  </div>
                  <div>
                    <div className={labelClass}>Account Type</div>
                    <select className={inputClass} value={accountType} onChange={e => setAccountType(e.target.value)}>
                      <option>Current</option>
                      <option>Savings</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <div className={labelClass}>Branch</div>
                    <input className={inputClass} value={branch} onChange={e => setBranch(e.target.value)} placeholder="e.g. Abids, Hyderabad" />
                  </div>
                </div>
              </div>

              {/* Brand Assets */}
              <div className={sectionClass}>
                <div className={sectionHeader}>
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  Brand Assets
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className={labelClass}>Shop Logo</div>
                    <div className="border-2 border-dashed border-[#e2e8f0] rounded-lg p-6 flex flex-col items-center gap-2 hover:border-emerald-300 transition-colors cursor-pointer bg-white">
                      <Upload className="w-5 h-5 text-neutral-400" />
                      <span className="text-xs text-neutral-500 text-center">Upload Logo<br /><span className="text-neutral-400">Max 2MB, PNG/SVG</span></span>
                    </div>
                  </div>
                  <div>
                    <div className={labelClass}>Signature Image</div>
                    <div className="border-2 border-dashed border-[#e2e8f0] rounded-lg p-6 flex flex-col items-center gap-2 hover:border-emerald-300 transition-colors cursor-pointer bg-white">
                      <Upload className="w-5 h-5 text-neutral-400" />
                      <span className="text-xs text-neutral-500 text-center">Upload Signature<br /><span className="text-neutral-400">PNG, max 1MB</span></span>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center justify-between p-2.5 rounded-md bg-white border border-[#e2e8f0]">
                    <div>
                      <div className="text-xs font-medium text-neutral-700">Invoice Watermark</div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">Show shop logo as faint watermark on invoices</div>
                    </div>
                    <button
                      onClick={() => setWatermarkEnabled(!watermarkEnabled)}
                      className={`w-9 h-5 rounded-full transition-colors relative ${watermarkEnabled ? 'bg-emerald-500' : 'bg-neutral-200'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-all ${watermarkEnabled ? 'left-4' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer">
                  <Save className="w-3.5 h-3.5" />
                  Save Shop Profile
                </button>
              </div>
            </div>

            {/* Invoice Preview Card */}
            <div className="w-64 shrink-0">
              <div className="sticky top-4">
                <div className="text-xs font-medium text-neutral-700 mb-2 uppercase tracking-wider">Invoice Header Preview</div>
                <div className="rounded-lg border border-[#e2e8f0] bg-white p-4 shadow-2xs">
                  <div className="w-12 h-12 rounded bg-emerald-100 flex items-center justify-center mb-3 mx-auto">
                    <Building2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-neutral-900">{brandName || 'Brand Name'}</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">{legalName || 'Legal Name'}</div>
                    {tagline && <div className="text-[10px] text-emerald-600 italic mt-1">{tagline}</div>}
                    <div className="border-t border-dashed border-[#e2e8f0] my-2" />
                    <div className="text-[10px] text-neutral-600">{address || 'Shop Address'}</div>
                    <div className="text-[10px] text-neutral-600">{city}{addrState ? `, ${addrState}` : ''} {pin}</div>
                    <div className="text-[10px] text-neutral-500 mt-1">{phonePrimary}</div>
                    <div className="text-[10px] text-neutral-500">{email}</div>
                    <div className="border-t border-dashed border-[#e2e8f0] my-2" />
                    <div className="text-[10px] text-neutral-500">GSTIN: <span className="text-neutral-700 font-medium">{gstin}</span></div>
                    <div className="text-[10px] text-neutral-500">BIS A/C: <span className="text-neutral-700 font-medium">{bisCode}</span></div>
                  </div>
                </div>
                <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="text-[10px] text-emerald-700 font-medium">All GST fields saved</div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">Your shop profile is BIS compliant</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
