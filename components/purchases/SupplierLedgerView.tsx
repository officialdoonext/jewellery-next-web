'use client';

import React, { useState, useEffect } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  FileSpreadsheet,
  Coins,
  CreditCard,
  Building2,
  Calendar,
  Plus,
  Trash2,
  Loader2,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';

export interface LedgerRow {
  id: string;
  supplier_name: string;
  date: string;
  voucher_no: string;
  particulars: string;
  type: 'INWARD_PURCHASE' | 'METAL_PAYMENT' | 'BANK_RTGS' | 'DEBIT_NOTE' | 'OPENING_BAL';
  metal_dr_g: number;
  metal_cr_g: number;
  cash_dr: number;
  cash_cr: number;
}

export function PurchasesLedgerView() {
  const [ledgerRows, setLedgerRows] = useState<LedgerRow[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Form State
  const [vendorName, setVendorName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [voucherNo, setVoucherNo] = useState('');
  const [particulars, setParticulars] = useState('');
  const [txType, setTxType] = useState<LedgerRow['type']>('INWARD_PURCHASE');
  const [metalDr, setMetalDr] = useState('');
  const [metalCr, setMetalCr] = useState('');
  const [cashDr, setCashDr] = useState('');
  const [cashCr, setCashCr] = useState('');

  const fetchLedger = async () => {
    try {
      setLoading(true);
      // Fetch ledger rows
      const snap = await getDocs(collection(db, 'purchases_ledger'));
      const list: LedgerRow[] = [];
      const suppSet = new Set<string>();

      snap.forEach((d) => {
        const data = d.data() as Omit<LedgerRow, 'id'>;
        list.push({ id: d.id, ...data });
        if (data.supplier_name) suppSet.add(data.supplier_name);
      });

      // Also fetch suppliers directory
      const suppSnap = await getDocs(collection(db, 'purchases_suppliers'));
      suppSnap.forEach((d) => {
        const name = d.data().supplier_name;
        if (name) suppSet.add(name);
      });

      list.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      setLedgerRows(list);
      setSuppliers(Array.from(suppSet));
    } catch (err: any) {
      console.error('Error fetching ledger:', err);
      showToast('error', err.message || 'Failed to load supplier ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const handleOpenAdd = () => {
    setVendorName(selectedSupplier !== 'All' ? selectedSupplier : suppliers[0] || '');
    setVoucherNo('LED-' + Math.floor(1000 + Math.random() * 9000));
    setParticulars('Bullion purchase invoice balance');
    setMetalDr('');
    setMetalCr('');
    setCashDr('');
    setCashCr('');
    setIsAddModalOpen(true);
  };

  const handleAddRow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim()) return;

    try {
      setSaving(true);
      const newRow = {
        supplier_name: vendorName.trim(),
        date,
        voucher_no: voucherNo.trim() || 'LED-' + Math.floor(1000 + Math.random() * 9000),
        particulars: particulars.trim() || 'Ledger adjustment',
        type: txType,
        metal_dr_g: parseFloat(metalDr) || 0,
        metal_cr_g: parseFloat(metalCr) || 0,
        cash_dr: parseFloat(cashDr) || 0,
        cash_cr: parseFloat(cashCr) || 0,
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'purchases_ledger'), newRow);
      setLedgerRows((prev) => [...prev, { id: docRef.id, ...newRow }]);
      if (!suppliers.includes(newRow.supplier_name)) {
        setSuppliers((prev) => [...prev, newRow.supplier_name]);
      }
      setIsAddModalOpen(false);
      showToast('success', `Ledger entry recorded for ${vendorName}.`);
    } catch (err: any) {
      console.error('Error adding ledger row:', err);
      showToast('error', err.message || 'Failed to add ledger transaction');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRow = async (id: string, voucher: string) => {
    if (!confirm(`Delete ledger entry ${voucher}?`)) return;
    try {
      await deleteDoc(doc(db, 'purchases_ledger', id));
      setLedgerRows((prev) => prev.filter((r) => r.id !== id));
      showToast('success', `Entry ${voucher} deleted.`);
    } catch (err: any) {
      console.error('Error deleting ledger row:', err);
    }
  };

  const filteredRows = ledgerRows.filter((r) => {
    if (selectedSupplier !== 'All' && r.supplier_name !== selectedSupplier) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchV = r.voucher_no?.toLowerCase().includes(q);
      const matchP = r.particulars?.toLowerCase().includes(q);
      const matchS = r.supplier_name?.toLowerCase().includes(q);
      if (!matchV && !matchP && !matchS) return false;
    }
    return true;
  });

  // Calculate cumulative balances dynamically
  let runningMetal = 0;
  let runningCash = 0;
  const rowsWithBalances = filteredRows.map((row) => {
    // Dr increases what we gave/paid; Cr increases what we owe/received
    runningMetal += (row.metal_dr_g || 0) - (row.metal_cr_g || 0);
    runningCash += (row.cash_dr || 0) - (row.cash_cr || 0);
    return {
      ...row,
      metal_bal_g: runningMetal,
      cash_bal: runningCash,
    };
  });

  const totalMetalCr = filteredRows.reduce((acc, curr) => acc + (curr.metal_cr_g || 0), 0);
  const totalMetalDr = filteredRows.reduce((acc, curr) => acc + (curr.metal_dr_g || 0), 0);
  const netMetalBalance = totalMetalDr - totalMetalCr;

  const totalCashCr = filteredRows.reduce((acc, curr) => acc + (curr.cash_cr || 0), 0);
  const totalCashDr = filteredRows.reduce((acc, curr) => acc + (curr.cash_dr || 0), 0);
  const netCashBalance = totalCashDr - totalCashCr;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="purchases_ledger" />
      <ActionToolbar
        filterPlaceholder="Filter statement vouchers, particulars..."
        insertLabel="New Transaction"
        onInsertClick={handleOpenAdd}
        onRefresh={fetchLedger}
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
                <span className="text-[11px] font-medium uppercase tracking-wider">Net Cash Position</span>
                <CreditCard className="w-4 h-4 text-emerald-600" />
              </div>
              <div className={`text-xl font-medium ${netCashBalance < 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                ₹{Math.abs(netCashBalance).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                {netCashBalance < 0 ? 'Payable to vendor' : 'Advance with vendor'}
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Net Pure Metal Bal</span>
                <Coins className="w-4 h-4 text-amber-500" />
              </div>
              <div className={`text-xl font-medium ${netMetalBalance < 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {Math.abs(netMetalBalance).toFixed(3)} <span className="text-xs text-neutral-500 font-normal">g</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                {netMetalBalance < 0 ? 'Gold weight owed to vendor' : 'Excess metal deposited'}
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Metal Received</span>
                <TrendingDown className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                {totalMetalCr.toFixed(3)} <span className="text-xs text-neutral-500 font-normal">g</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Inward bullion credits</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Cash Settled</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">
                ₹{totalCashDr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">RTGS debited</div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search voucher or particulars..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-[#f8fafc] focus:bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-medium placeholder:text-neutral-400 w-48 sm:w-60"
                />
              </div>

              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-700 font-medium cursor-pointer max-w-xs"
              >
                <option value="All">All Suppliers / Vendors</option>
                {suppliers.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] hover:bg-[#1fa070] text-white shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Record Ledger Entry</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-2xs overflow-hidden">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-2 text-neutral-500">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs font-medium">Loading dual running ledger from Firebase...</span>
              </div>
            ) : rowsWithBalances.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-neutral-800">No Ledger Transactions Found</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  {ledgerRows.length === 0
                    ? 'No supplier ledger transactions recorded in Firebase yet. Click "Record Ledger Entry" to post dual gold & cash balance entries.'
                    : 'No entries match your active supplier filter.'}
                </p>
                {ledgerRows.length === 0 && (
                  <button
                    onClick={handleOpenAdd}
                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] text-white hover:bg-[#1fa070] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Record Opening / First Entry
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f8fafc] text-neutral-600 font-medium border-b border-[#e2e8f0]">
                    <tr>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Date &amp; Voucher</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Supplier Name</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Particulars</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Metal Paid (Dr)</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Metal Recv (Cr)</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Metal Balance</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Cash Paid (Dr)</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Cash Billed (Cr)</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Cash Balance</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {rowsWithBalances.map((row) => (
                      <tr key={row.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-mono font-medium text-neutral-800">{row.voucher_no}</div>
                          <div className="text-[10px] text-neutral-500 mt-0.5">{row.date}</div>
                        </td>

                        <td className="py-2.5 px-3 font-medium text-neutral-800">{row.supplier_name}</td>

                        <td className="py-2.5 px-3 text-neutral-700">{row.particulars}</td>

                        <td className="py-2.5 px-3 text-right font-mono text-neutral-700">
                          {row.metal_dr_g ? `${Number(row.metal_dr_g).toFixed(3)}g` : '---'}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono text-neutral-700">
                          {row.metal_cr_g ? `${Number(row.metal_cr_g).toFixed(3)}g` : '---'}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-medium">
                          <span className={row.metal_bal_g < 0 ? 'text-amber-700' : 'text-emerald-700'}>
                            {Number(row.metal_bal_g).toFixed(3)}g
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono text-neutral-700">
                          {row.cash_dr ? `₹${Number(row.cash_dr).toLocaleString('en-IN')}` : '---'}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono text-neutral-700">
                          {row.cash_cr ? `₹${Number(row.cash_cr).toLocaleString('en-IN')}` : '---'}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-medium">
                          <span className={row.cash_bal < 0 ? 'text-amber-700' : 'text-emerald-700'}>
                            ₹{Number(row.cash_bal).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeleteRow(row.id, row.voucher_no)}
                            className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete entry"
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

      {/* Add Ledger Transaction Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-medium text-neutral-800">Record Vendor Ledger Entry</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRow} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Supplier / Refinery Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mangalore Casting Works"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Voucher / Ref #</label>
                  <input
                    type="text"
                    required
                    value={voucherNo}
                    onChange={(e) => setVoucherNo(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Transaction Nature</label>
                <select
                  value={txType}
                  onChange={(e) => setTxType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none font-medium"
                >
                  <option value="INWARD_PURCHASE">Inward Bullion / Ornament Purchase</option>
                  <option value="BANK_RTGS">Bank RTGS Payment (Cash Debit)</option>
                  <option value="METAL_PAYMENT">Physical Gold Bar Paid (Metal Debit)</option>
                  <option value="DEBIT_NOTE">Purchase Return Debit Note</option>
                  <option value="OPENING_BAL">Opening Balance Carryforward</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Particulars / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Inward gold bar billing or RTGS payment"
                  value={particulars}
                  onChange={(e) => setParticulars(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#e2e8f0]">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Metal Paid (Dr) grams</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    value={metalDr}
                    onChange={(e) => setMetalDr(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Metal Recv (Cr) grams</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    value={metalCr}
                    onChange={(e) => setMetalCr(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Cash Paid (Dr) ₹</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={cashDr}
                    onChange={(e) => setCashDr(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Cash Billed (Cr) ₹</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={cashCr}
                    onChange={(e) => setCashCr(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                  />
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
                  <span>{saving ? 'Saving...' : 'Post Entry'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
