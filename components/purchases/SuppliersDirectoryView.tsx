'use client';

import React, { useState, useEffect } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Coins,
  CreditCard,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Search,
  Trash2,
  Loader2,
  Landmark,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';

export interface SupplierItem {
  id: string;
  supplier_name: string;
  category: 'Bullion Refinery' | 'Wholesale Manufacturer' | 'Casting House' | 'Gemstone Vendor' | 'Karigar';
  contact_person: string;
  phone: string;
  email: string;
  city: string;
  gstin: string;
  pan: string;
  bis_refinery_license?: string;
  metal_balance_g: number;
  cash_balance: number;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export function PurchasesSuppliersView() {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SupplierItem['category']>('Wholesale Manufacturer');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [bisLicense, setBisLicense] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'purchases_suppliers'));
      const list: SupplierItem[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<SupplierItem, 'id'>) });
      });
      list.sort((a, b) => (a.supplier_name || '').localeCompare(b.supplier_name || ''));
      setSuppliers(list);
    } catch (err: any) {
      console.error('Error fetching suppliers:', err);
      showToast('error', err.message || 'Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const handleOpenAdd = () => {
    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setCity('');
    setGstin('');
    setPan('');
    setBisLicense('');
    setBankName('');
    setAccountNumber('');
    setIfsc('');
    setIsAddModalOpen(true);
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      const newSupplier = {
        supplier_name: name.trim(),
        category,
        contact_person: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim(),
        city: city.trim(),
        gstin: gstin.trim().toUpperCase(),
        pan: pan.trim().toUpperCase() || (gstin.length >= 12 ? gstin.slice(2, 12) : ''),
        bis_refinery_license: bisLicense.trim(),
        metal_balance_g: 0,
        cash_balance: 0,
        bank_name: bankName.trim(),
        account_number: accountNumber.trim(),
        ifsc_code: ifsc.trim().toUpperCase(),
        status: 'ACTIVE' as const,
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'purchases_suppliers'), newSupplier);
      setSuppliers((prev) => [{ id: docRef.id, ...newSupplier }, ...prev]);
      setIsAddModalOpen(false);
      showToast('success', `Supplier "${name}" registered successfully.`);
    } catch (err: any) {
      console.error('Error adding supplier:', err);
      showToast('error', err.message || 'Failed to register supplier');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, current: SupplierItem['status']) => {
    const nextStatus = current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateDoc(doc(db, 'purchases_suppliers', id), { status: nextStatus });
      setSuppliers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: nextStatus } : s))
      );
      showToast('success', `Status updated to ${nextStatus}.`);
    } catch (err: any) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteSupplier = async (id: string, supplierName: string) => {
    if (!confirm(`Delete supplier "${supplierName}"?`)) return;
    try {
      await deleteDoc(doc(db, 'purchases_suppliers', id));
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      showToast('success', `Supplier "${supplierName}" deleted.`);
    } catch (err: any) {
      console.error('Error deleting supplier:', err);
    }
  };

  const filteredSuppliers = suppliers.filter((s) => {
    if (selectedCategory !== 'All' && s.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.supplier_name?.toLowerCase().includes(q);
      const matchPerson = s.contact_person?.toLowerCase().includes(q);
      const matchCity = s.city?.toLowerCase().includes(q);
      const matchGstin = s.gstin?.toLowerCase().includes(q);
      if (!matchName && !matchPerson && !matchCity && !matchGstin) return false;
    }
    return true;
  });

  const activeCount = suppliers.filter((s) => s.status === 'ACTIVE').length;
  const refineriesCount = suppliers.filter((s) => s.category === 'Bullion Refinery').length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="purchases_suppliers" />
      <ActionToolbar
        filterPlaceholder="Filter vendors by name, GSTIN, city..."
        insertLabel="New Supplier"
        onInsertClick={handleOpenAdd}
        onRefresh={fetchSuppliers}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        <div className="p-4 flex flex-col gap-4 max-w-7xl w-full mx-auto">
          {/* Toast Notification */}
          {toastType === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}
          {toastType === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-medium animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Registered Vendors</span>
                <Building2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{suppliers.length}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">{activeCount} Active in directory</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Refineries &amp; Bullion</span>
                <Coins className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{refineriesCount}</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Primary gold bar sources</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">GST Registered</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                {suppliers.filter((s) => s.gstin && s.gstin !== 'UNREGISTERED').length}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Valid 15-digit GSTINs</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Bank Details Added</span>
                <Landmark className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                {suppliers.filter((s) => s.bank_name).length}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">RTGS/NEFT settlement ready</div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search vendor name, GSTIN, city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-[#f8fafc] focus:bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-medium placeholder:text-neutral-400 w-48 sm:w-60"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-700 font-medium cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Bullion Refinery">Bullion Refinery</option>
                <option value="Wholesale Manufacturer">Wholesale Manufacturer</option>
                <option value="Casting House">Casting House</option>
                <option value="Gemstone Vendor">Gemstone Vendor</option>
                <option value="Karigar">Karigar</option>
              </select>
            </div>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] hover:bg-[#1fa070] text-white shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Supplier</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-2xs overflow-hidden">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-2 text-neutral-500">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs font-medium">Loading suppliers from Firebase...</span>
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-neutral-800">No Suppliers in Directory</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  {suppliers.length === 0
                    ? 'No vendors or bullion refineries registered in Firebase yet. Click "New Supplier" to build your vendor address book.'
                    : 'No suppliers match your active filters.'}
                </p>
                {suppliers.length === 0 && (
                  <button
                    onClick={handleOpenAdd}
                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] text-white hover:bg-[#1fa070] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Register First Supplier
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f8fafc] text-neutral-600 font-medium border-b border-[#e2e8f0]">
                    <tr>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Supplier Name</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Category</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Contact Person</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Phone &amp; Email</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">City</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">GSTIN</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Bank / RTGS Details</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Status</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {filteredSuppliers.map((s) => (
                      <tr key={s.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-neutral-800">{s.supplier_name}</div>
                          {s.bis_refinery_license && (
                            <div className="text-[10px] text-emerald-700 font-mono mt-0.5">
                              Lic: {s.bis_refinery_license}
                            </div>
                          )}
                        </td>

                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-700">
                            {s.category}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-neutral-700 font-medium">{s.contact_person || '---'}</td>

                        <td className="py-2.5 px-3">
                          <div className="text-neutral-700">{s.phone}</div>
                          <div className="text-[10px] text-neutral-400 mt-0.5">{s.email}</div>
                        </td>

                        <td className="py-2.5 px-3 text-neutral-600">{s.city}</td>

                        <td className="py-2.5 px-3 font-mono text-neutral-700 font-medium">
                          {s.gstin || '---'}
                        </td>

                        <td className="py-2.5 px-3">
                          {s.bank_name ? (
                            <div>
                              <div className="font-medium text-neutral-800">{s.bank_name}</div>
                              <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                                A/C: {s.account_number} · IFSC: {s.ifsc_code}
                              </div>
                            </div>
                          ) : (
                            <span className="text-neutral-400">---</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => handleToggleStatus(s.id, s.status)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors cursor-pointer ${
                              s.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                            }`}
                          >
                            {s.status}
                          </button>
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeleteSupplier(s.id, s.supplier_name)}
                            className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete supplier"
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
        </div>
      </div>

      {/* Add Supplier Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-medium text-neutral-800">Register New Supplier / Refinery</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSupplier} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Firm / Refinery Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mangalore Casting Works"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none font-medium"
                  >
                    <option value="Wholesale Manufacturer">Wholesale Manufacturer</option>
                    <option value="Bullion Refinery">Bullion Refinery</option>
                    <option value="Casting House">Casting House</option>
                    <option value="Gemstone Vendor">Gemstone Vendor</option>
                    <option value="Karigar">Karigar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Naveen Shenoy"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98450 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="orders@vendor.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">GSTIN</label>
                  <input
                    type="text"
                    placeholder="29AAACM4512H1Z2"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 uppercase focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">BIS Refinery Lic</label>
                  <input
                    type="text"
                    placeholder="BIS/REF/2024"
                    value={bisLicense}
                    onChange={(e) => setBisLicense(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#e2e8f0]">
                <div className="font-medium text-neutral-800 mb-2">Bank Account for RTGS Payouts</div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-neutral-700 font-medium mb-1">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-700 font-medium mb-1">Account Number</label>
                    <input
                      type="text"
                      placeholder="Account number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-700 font-medium mb-1">IFSC Code</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC0001234"
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                      className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 uppercase focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 border border-[#e2e8f0] text-neutral-600 rounded-md font-medium hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-[#24b47e] hover:bg-[#1fa070] text-white rounded-md font-medium shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{saving ? 'Saving...' : 'Register Supplier'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
