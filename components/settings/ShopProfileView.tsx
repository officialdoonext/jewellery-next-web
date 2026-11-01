'use client';
import React, { useState, useEffect } from 'react';
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
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export function SettingsShopProfileView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Clean empty state — no predefault dummy values
  const [legalName, setLegalName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [tagline, setTagline] = useState('');
  const [estYear, setEstYear] = useState('');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [bisCode, setBisCode] = useState('');
  const [state, setState] = useState('');
  const [gstType, setGstType] = useState('Regular');
  const [phonePrimary, setPhonePrimary] = useState('');
  const [phoneSecondary, setPhoneSecondary] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [pin, setPin] = useState('');
  const [country, setCountry] = useState('India');
  const [bankName, setBankName] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accountType, setAccountType] = useState('Current');
  const [branch, setBranch] = useState('');
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);

  useEffect(() => {
    async function loadShopProfile() {
      try {
        setLoading(true);
        const docRef = doc(db, 'settings', 'shop-profile');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.legalName !== undefined) setLegalName(data.legalName);
          if (data.brandName !== undefined) setBrandName(data.brandName);
          if (data.tagline !== undefined) setTagline(data.tagline);
          if (data.estYear !== undefined) setEstYear(data.estYear);
          if (data.gstin !== undefined) setGstin(data.gstin);
          if (data.pan !== undefined) setPan(data.pan);
          if (data.bisCode !== undefined) setBisCode(data.bisCode);
          if (data.state !== undefined) setState(data.state);
          if (data.gstType !== undefined) setGstType(data.gstType);
          if (data.phonePrimary !== undefined) setPhonePrimary(data.phonePrimary);
          if (data.phoneSecondary !== undefined) setPhoneSecondary(data.phoneSecondary);
          if (data.email !== undefined) setEmail(data.email);
          if (data.address !== undefined) setAddress(data.address);
          if (data.city !== undefined) setCity(data.city);
          if (data.addrState !== undefined) setAddrState(data.addrState);
          if (data.pin !== undefined) setPin(data.pin);
          if (data.country !== undefined) setCountry(data.country);
          if (data.bankName !== undefined) setBankName(data.bankName);
          if (data.accountNo !== undefined) setAccountNo(data.accountNo);
          if (data.ifsc !== undefined) setIfsc(data.ifsc);
          if (data.accountType !== undefined) setAccountType(data.accountType);
          if (data.branch !== undefined) setBranch(data.branch);
          if (data.watermarkEnabled !== undefined) setWatermarkEnabled(data.watermarkEnabled);
        }
      } catch (err: any) {
        console.error('Error fetching shop profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadShopProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveStatus('idle');
      const docRef = doc(db, 'settings', 'shop-profile');
      await setDoc(docRef, {
        legalName,
        brandName,
        tagline,
        estYear,
        gstin,
        pan,
        bisCode,
        state,
        gstType,
        phonePrimary,
        phoneSecondary,
        email,
        address,
        city,
        addrState,
        pin,
        country,
        bankName,
        accountNo,
        ifsc,
        accountType,
        branch,
        watermarkEnabled,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setSaveStatus('success');
      setStatusMessage('Shop profile saved successfully!');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch (err: any) {
      console.error('Error saving shop profile:', err);
      setSaveStatus('error');
      setStatusMessage(err.message || 'Failed to save shop profile');
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

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="settings_shop_profile" />
      <ActionToolbar
        filterPlaceholder="Filter settings..."
        insertLabel={saving ? 'Saving...' : 'Save Profile'}
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
              <span className="text-xs font-medium">Loading saved shop profile...</span>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 flex flex-col gap-4">

                {/* Business Identity */}
                <div className={sectionClass}>
                  <div className={sectionHeader}>
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    Business Identity
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className={labelClass}>Legal Business Name *</div>
                      <input
                        className={inputClass}
                        value={legalName}
                        onChange={e => setLegalName(e.target.value)}
                        placeholder="Enter legal business name"
                      />
                    </div>
                    <div>
                      <div className={labelClass}>Brand Name *</div>
                      <input
                        className={inputClass}
                        value={brandName}
                        onChange={e => setBrandName(e.target.value)}
                        placeholder="Enter brand / store name"
                      />
                    </div>
                    <div>
                      <div className={labelClass}>Tagline</div>
                      <input
                        className={inputClass}
                        value={tagline}
                        onChange={e => setTagline(e.target.value)}
                        placeholder="Enter shop tagline"
                      />
                    </div>
                    <div>
                      <div className={labelClass}>Established Year</div>
                      <input
                        className={inputClass}
                        value={estYear}
                        onChange={e => setEstYear(e.target.value)}
                        placeholder="e.g. 2024"
                        type="number"
                      />
                    </div>
                  </div>
                </div>

                {/* Registration & Compliance */}
                <div className={sectionClass}>
                  <div className={sectionHeader}>
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    Registration &amp; Compliance
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className={labelClass}>GSTIN *</div>
                      <input
                        className={inputClass}
                        value={gstin}
                        onChange={e => setGstin(e.target.value)}
                        placeholder="e.g. 36AABCS1234F1ZX"
                      />
                    </div>
                    <div>
                      <div className={labelClass}>PAN *</div>
                      <input
                        className={inputClass}
                        value={pan}
                        onChange={e => setPan(e.target.value)}
                        placeholder="e.g. AABCS1234F"
                      />
                    </div>
                    <div>
                      <div className={labelClass}>BIS Hallmark Licence No (A/C Code) *</div>
                      <input
                        className={inputClass}
                        value={bisCode}
                        onChange={e => setBisCode(e.target.value)}
                        placeholder="Enter BIS licence code"
                      />
                    </div>
                    <div>
                      <div className={labelClass}>State</div>
                      <input
                        className={inputClass}
                        value={state}
                        onChange={e => setState(e.target.value)}
                        placeholder="Enter state"
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <div className={labelClass}>GST Registration Type</div>
                      <div className="flex gap-2">
                        {['Regular', 'Composition', 'Unregistered'].map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setGstType(t)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                              gstType === t
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                : 'bg-white border-[#e2e8f0] text-neutral-600 hover:border-emerald-200'
                            }`}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className={labelClass}>Phone (Primary) *</div>
                      <div className="relative">
                        <Phone className="w-3 h-3 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          className={`${inputClass} pl-7`}
                          value={phonePrimary}
                          onChange={e => setPhonePrimary(e.target.value)}
                          placeholder="Primary contact phone"
                        />
                      </div>
                    </div>
                    <div>
                      <div className={labelClass}>Phone (Secondary)</div>
                      <div className="relative">
                        <Phone className="w-3 h-3 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          className={`${inputClass} pl-7`}
                          value={phoneSecondary}
                          onChange={e => setPhoneSecondary(e.target.value)}
                          placeholder="Secondary phone"
                        />
                      </div>
                    </div>
                    <div>
                      <div className={labelClass}>Email *</div>
                      <div className="relative">
                        <Mail className="w-3 h-3 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          className={`${inputClass} pl-7`}
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="info@jewellers.com"
                          type="email"
                        />
                      </div>
                    </div>
                    <div>
                      <div className={labelClass}>City *</div>
                      <input
                        className={inputClass}
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder="City"
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <div className={labelClass}>Full Address *</div>
                      <textarea
                        className={`${inputClass} resize-none h-16`}
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder="Shop / Showroom number, street, landmark, area..."
                      />
                    </div>
                    <div>
                      <div className={labelClass}>State *</div>
                      <input
                        className={inputClass}
                        value={addrState}
                        onChange={e => setAddrState(e.target.value)}
                        placeholder="State name"
                      />
                    </div>
                    <div>
                      <div className={labelClass}>PIN Code *</div>
                      <input
                        className={inputClass}
                        value={pin}
                        onChange={e => setPin(e.target.value)}
                        placeholder="PIN code"
                        maxLength={6}
                      />
                    </div>
                    <div>
                      <div className={labelClass}>Country</div>
                      <input
                        className={inputClass}
                        value={country}
                        onChange={e => setCountry(e.target.value)}
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className={sectionClass}>
                  <div className={sectionHeader}>
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    Bank Details (for RTGS on Invoice)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className={labelClass}>Bank Name</div>
                      <input
                        className={inputClass}
                        value={bankName}
                        onChange={e => setBankName(e.target.value)}
                        placeholder="Bank name"
                      />
                    </div>
                    <div>
                      <div className={labelClass}>Account Number</div>
                      <input
                        className={inputClass}
                        value={accountNo}
                        onChange={e => setAccountNo(e.target.value)}
                        placeholder="Bank account number"
                      />
                    </div>
                    <div>
                      <div className={labelClass}>IFSC Code</div>
                      <input
                        className={inputClass}
                        value={ifsc}
                        onChange={e => setIfsc(e.target.value)}
                        placeholder="IFSC code"
                      />
                    </div>
                    <div>
                      <div className={labelClass}>Account Type</div>
                      <select
                        className={inputClass}
                        value={accountType}
                        onChange={e => setAccountType(e.target.value)}
                      >
                        <option value="Current">Current</option>
                        <option value="Savings">Savings</option>
                        <option value="OD/CC">OD / CC</option>
                      </select>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <div className={labelClass}>Branch</div>
                      <input
                        className={inputClass}
                        value={branch}
                        onChange={e => setBranch(e.target.value)}
                        placeholder="Bank branch location"
                      />
                    </div>
                  </div>
                </div>

                {/* Brand Assets */}
                <div className={sectionClass}>
                  <div className={sectionHeader}>
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    Brand Assets &amp; Preferences
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className={labelClass}>Shop Logo</div>
                      <div className="border-2 border-dashed border-[#e2e8f0] rounded-lg p-6 flex flex-col items-center gap-2 hover:border-emerald-300 transition-colors cursor-pointer bg-white">
                        <Upload className="w-5 h-5 text-neutral-400" />
                        <span className="text-xs text-neutral-500 text-center font-medium">
                          Upload Logo<br />
                          <span className="text-neutral-400 font-normal">Max 2MB, PNG/SVG</span>
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className={labelClass}>Signature Image</div>
                      <div className="border-2 border-dashed border-[#e2e8f0] rounded-lg p-6 flex flex-col items-center gap-2 hover:border-emerald-300 transition-colors cursor-pointer bg-white">
                        <Upload className="w-5 h-5 text-neutral-400" />
                        <span className="text-xs text-neutral-500 text-center font-medium">
                          Upload Signature<br />
                          <span className="text-neutral-400 font-normal">PNG, max 1MB</span>
                        </span>
                      </div>
                    </div>
                    <div className="col-span-1 sm:col-span-2 flex items-center justify-between p-2.5 rounded-md bg-white border border-[#e2e8f0]">
                      <div>
                        <div className="text-xs font-medium text-neutral-700">Invoice Watermark</div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">Show shop logo as faint watermark on invoices</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setWatermarkEnabled(!watermarkEnabled)}
                        className={`w-9 h-5 rounded-full transition-colors relative ${
                          watermarkEnabled ? 'bg-emerald-500' : 'bg-neutral-200'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-all ${
                            watermarkEnabled ? 'left-4' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium bg-[#24b47e] text-white hover:bg-[#1fa070] disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{saving ? 'Saving...' : 'Save Shop Profile'}</span>
                  </button>
                </div>
              </div>

              {/* Invoice Preview Card */}
              <div className="w-full lg:w-64 shrink-0">
                <div className="sticky top-4">
                  <div className="text-xs font-medium text-neutral-700 mb-2 uppercase tracking-wider">
                    Invoice Header Preview
                  </div>
                  <div className="rounded-lg border border-[#e2e8f0] bg-white p-4 shadow-2xs">
                    <div className="w-12 h-12 rounded bg-emerald-100 flex items-center justify-center mb-3 mx-auto">
                      <Building2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-neutral-900">
                        {brandName || 'Store / Brand Name'}
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">
                        {legalName || 'Legal Business Name'}
                      </div>
                      {tagline && (
                        <div className="text-[10px] text-emerald-600 italic mt-1 font-medium">
                          {tagline}
                        </div>
                      )}
                      <div className="border-t border-dashed border-[#e2e8f0] my-2" />
                      <div className="text-[10px] text-neutral-600 font-medium">
                        {address || 'Shop Address line'}
                      </div>
                      <div className="text-[10px] text-neutral-600">
                        {city ? `${city}${addrState ? `, ${addrState}` : ''} ${pin}` : 'City, State PIN'}
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-1">
                        {phonePrimary || 'Phone Number'}
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        {email || 'Email Address'}
                      </div>
                      <div className="border-t border-dashed border-[#e2e8f0] my-2" />
                      <div className="text-[10px] text-neutral-500">
                        GSTIN: <span className="text-neutral-700 font-medium">{gstin || '---'}</span>
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        BIS A/C: <span className="text-neutral-700 font-medium">{bisCode || '---'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="text-[10px] text-emerald-700 font-medium">
                      {gstin && bisCode ? '✓ All regulatory compliance fields set' : 'Fill details above & click save'}
                    </div>
                    <div className="text-[10px] text-emerald-600 mt-0.5">
                      Data synchronizes dynamically to Firebase Firestore.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
