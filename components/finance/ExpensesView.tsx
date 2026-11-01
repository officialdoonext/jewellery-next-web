'use client';

import React, { useState, useEffect } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import { FinanceNavigationHeader } from './FinanceNavigationHeader';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Receipt,
  FileCheck,
  Building,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  X,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Trash2,
  Zap,
} from 'lucide-react';

export interface ShowroomExpense {
  id: string;
  voucher_no: string;
  expense_head: string;
  paid_to: string;
  vendor_gstin: string;
  base_amount: number;
  gst_rate: number;
  gst_paid: number;
  total_amount: number;
  gst_itc_eligible: boolean;
  payment_mode: 'Bank Transfer' | 'Petty Cash' | 'UPI / Card';
  paid_date: string;
  approval_status: 'APPROVED' | 'PENDING' | 'REJECTED';
  created_at?: any;
}

const EXPENSE_HEADS = [
  'Showroom Security Agency',
  'Electricity & High-Tension Power',
  'Vault Insurance Premium (Jewellers Block)',
  'Central Showroom AC Maintenance AMC',
  'Staff Salary & Sales Commissions',
  'BIS Hallmarking & Assay Testing Fees',
  'Staff Welfare / Tea & Refreshments',
  'CCTV & Electronic Surveillance AMC',
  'Marketing, Hoardings & Influencers',
  'Legal, CA & Internal Audit Fees',
];

export function FinanceExpensesView() {
  const [expenses, setExpenses] = useState<ShowroomExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals & forms
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ShowroomExpense | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // New Expense Form State
  const [voucherNo, setVoucherNo] = useState('');
  const [expenseHead, setExpenseHead] = useState(EXPENSE_HEADS[0]);
  const [paidTo, setPaidTo] = useState('');
  const [vendorGstin, setVendorGstin] = useState('');
  const [baseAmount, setBaseAmount] = useState<number>(0);
  const [gstRate, setGstRate] = useState<number>(18);
  const [itcEligible, setItcEligible] = useState(true);
  const [paymentMode, setPaymentMode] = useState<ShowroomExpense['payment_mode']>('Bank Transfer');
  const [paidDate, setPaidDate] = useState(new Date().toISOString().substring(0, 10));

  // Dynamic calculations in modal
  const calculatedGstPaid = Number(((baseAmount * gstRate) / 100).toFixed(2));
  const calculatedTotal = Number((baseAmount + calculatedGstPaid).toFixed(2));

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'finance_expenses'));
      const list: ShowroomExpense[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<ShowroomExpense, 'id'>) });
      });
      list.sort((a, b) => (b.paid_date || '').localeCompare(a.paid_date || ''));
      setExpenses(list);
    } catch (err: any) {
      console.error('Error fetching expenses:', err);
      showToast('error', err.message || 'Failed to fetch showroom expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle Approval Status
  const handleToggleApproval = async (id: string, currentStatus: ShowroomExpense['approval_status']) => {
    const nextStatus = currentStatus === 'APPROVED' ? 'PENDING' : 'APPROVED';
    try {
      await updateDoc(doc(db, 'finance_expenses', id), {
        approval_status: nextStatus,
      });
      setExpenses((prev) =>
        prev.map((e) => (e.id === id ? { ...e, approval_status: nextStatus } : e))
      );
      showToast('success', `Expense voucher updated to ${nextStatus}`);
    } catch (err: any) {
      console.error('Error toggling expense approval:', err);
      showToast('error', err.message || 'Failed to update approval status');
    }
  };

  // Save New Expense
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (baseAmount <= 0 || !paidTo.trim()) {
      showToast('error', 'Please enter payee name and a valid base amount');
      return;
    }

    try {
      setSaving(true);
      const vNo = voucherNo.trim() || `EXP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      const payload: Omit<ShowroomExpense, 'id'> = {
        voucher_no: vNo,
        expense_head: expenseHead,
        paid_to: paidTo.trim(),
        vendor_gstin: vendorGstin.trim().toUpperCase() || 'Unregistered Local Vendor',
        base_amount: Number(baseAmount),
        gst_rate: Number(gstRate),
        gst_paid: calculatedGstPaid,
        total_amount: calculatedTotal,
        gst_itc_eligible: itcEligible,
        payment_mode: paymentMode,
        paid_date: paidDate,
        approval_status: 'APPROVED',
        created_at: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'finance_expenses'), payload);
      setExpenses((prev) => [{ id: docRef.id, ...payload }, ...prev]);
      setIsNewExpenseOpen(false);
      setPaidTo('');
      setVendorGstin('');
      setBaseAmount(0);
      setVoucherNo('');
      showToast('success', `Recorded voucher ${vNo} of ₹ ${calculatedTotal.toLocaleString('en-IN')}`);
    } catch (err: any) {
      console.error('Error recording expense:', err);
      showToast('error', err.message || 'Failed to save expense voucher');
    } finally {
      setSaving(false);
    }
  };

  // Delete Expense
  const handleDeleteExpense = async () => {
    if (!itemToDelete) return;
    try {
      setSaving(true);
      await deleteDoc(doc(db, 'finance_expenses', itemToDelete.id));
      setExpenses((prev) => prev.filter((e) => e.id !== itemToDelete.id));
      showToast('success', `Deleted voucher #${itemToDelete.voucher_no}`);
      setItemToDelete(null);
    } catch (err: any) {
      console.error('Error deleting expense:', err);
      showToast('error', err.message || 'Failed to delete expense');
    } finally {
      setSaving(false);
    }
  };

  // KPI Calculations
  const totalExpenseVal = expenses.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
  const totalItcClaimable = expenses
    .filter((e) => e.gst_itc_eligible)
    .reduce((acc, curr) => acc + (Number(curr.gst_paid) || 0), 0);
  const nonItcAmount = expenses
    .filter((e) => !e.gst_itc_eligible)
    .reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
  const pendingApprovals = expenses.filter((e) => e.approval_status === 'PENDING').length;

  const filteredExpenses = expenses.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.expense_head || '').toLowerCase().includes(q) ||
      (item.paid_to || '').toLowerCase().includes(q) ||
      (item.voucher_no || '').toLowerCase().includes(q) ||
      (item.vendor_gstin || '').toLowerCase().includes(q) ||
      (item.payment_mode || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="showroom_operating_expenses" />
      <ActionToolbar
        filterPlaceholder="Filter by voucher #, payee, GSTIN, expense head..."
        insertLabel="Record Expense"
        onInsertClick={() => setIsNewExpenseOpen(true)}
        onRefresh={fetchExpenses}
      />

      <FinanceNavigationHeader activePage="expenses" />

      {/* Real-time Toast Banner */}
      {toastMessage && (
        <div
          className={`px-4 py-2 text-xs flex items-center justify-between transition-all shrink-0 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
              : 'bg-red-50 text-red-800 border-b border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-neutral-400 hover:text-neutral-700 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Expenses</span>
                <Receipt className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">
                ₹ {totalExpenseVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Operating overheads paid</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Eligible Input ITC</span>
                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700 font-mono">
                ₹ {totalItcClaimable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1">Offset against 3% GST output</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Non-ITC Overheads</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-amber-700 font-mono">
                ₹ {nonItcAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Power bills & petty cash</div>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-200 hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-emerald-800 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Approval Status</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div className="text-xl font-medium text-emerald-900 font-mono">
                {expenses.length - pendingApprovals} / {expenses.length}{' '}
                <span className="text-xs text-emerald-700 font-sans font-medium">Approved</span>
              </div>
              <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {pendingApprovals > 0 ? `${pendingApprovals} pending review` : 'All audited & approved'}
              </div>
            </div>
          </div>
        </div>

        {/* Expenses Table or Empty State */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-neutral-500">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
              <p className="text-xs font-medium">Loading live expense records...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center p-8 bg-white rounded-lg border border-[#e5e7eb] shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-neutral-900 mb-1">No Expense Vouchers Found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mb-4">
                {searchQuery
                  ? 'No expense vouchers match your filter. Try clearing the search.'
                  : 'Record showroom utility bills, armed security agency invoices, vault insurance, and assaying fees.'}
              </p>
              <button
                onClick={() => setIsNewExpenseOpen(true)}
                className="px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record First Expense</span>
              </button>
            </div>
          ) : (
            <div className="border border-[#e5e7eb] rounded-lg bg-white overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-neutral-500 uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3 font-medium">Voucher #</th>
                      <th className="py-2.5 px-3 font-medium">Expense Head</th>
                      <th className="py-2.5 px-3 font-medium">Paid To / Vendor</th>
                      <th className="py-2.5 px-3 font-medium">GSTIN</th>
                      <th className="py-2.5 px-3 font-medium text-right">Base Amount (₹)</th>
                      <th className="py-2.5 px-3 font-medium text-right">GST Paid (₹)</th>
                      <th className="py-2.5 px-3 font-medium text-right">Total Amount (₹)</th>
                      <th className="py-2.5 px-3 font-medium text-center">ITC Eligible</th>
                      <th className="py-2.5 px-3 font-medium text-center">Status</th>
                      <th className="py-2.5 px-3 font-medium text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0] text-neutral-700">
                    {filteredExpenses.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-2 px-3 font-mono font-medium text-neutral-900 whitespace-nowrap">
                          <button
                            onClick={() => copyToClipboard(row.voucher_no, row.id)}
                            className="inline-flex items-center gap-1 hover:text-emerald-700 cursor-pointer"
                            title="Copy Voucher #"
                          >
                            <span>{row.voucher_no}</span>
                            {copiedId === row.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-2.5 h-2.5 text-neutral-400 opacity-60" />
                            )}
                          </button>
                        </td>
                        <td className="py-2 px-3 font-medium text-neutral-800 whitespace-nowrap">
                          {row.expense_head}
                        </td>
                        <td className="py-2 px-3 text-neutral-700 max-w-xs truncate" title={row.paid_to}>
                          {row.paid_to}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                          {row.vendor_gstin}
                        </td>
                        <td className="py-2 px-3 font-mono text-neutral-800 text-right whitespace-nowrap">
                          ₹ {row.base_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 font-mono text-neutral-500 text-right whitespace-nowrap">
                          ₹ {row.gst_paid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 font-mono font-medium text-neutral-900 text-right whitespace-nowrap">
                          ₹ {row.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          {row.gst_itc_eligible ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              YES
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-500 border border-neutral-200">
                              NO
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleToggleApproval(row.id, row.approval_status)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                              row.approval_status === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                            }`}
                            title="Click to toggle approval"
                          >
                            {row.approval_status === 'APPROVED' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Approved</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Pending</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => setItemToDelete(row)}
                            className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete voucher"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Record Expense Voucher */}
      {isNewExpenseOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-medium text-neutral-900 uppercase tracking-wider">
                  Record Showroom Expense Voucher
                </h3>
              </div>
              <button
                onClick={() => setIsNewExpenseOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Expense Head *
                  </label>
                  <select
                    value={expenseHead}
                    onChange={(e) => setExpenseHead(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                  >
                    {EXPENSE_HEADS.map((head) => (
                      <option key={head} value={head}>
                        {head}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as ShowroomExpense['payment_mode'])}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="Petty Cash">Petty Cash Counter</option>
                    <option value="UPI / Card">UPI / Corporate Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Paid To / Vendor Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SIS India Armed Security Ltd / TSSPDCL Power"
                  value={paidTo}
                  onChange={(e) => setPaidTo(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Vendor GSTIN (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="36AAACS1234F1Z5"
                    value={vendorGstin}
                    onChange={(e) => setVendorGstin(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono uppercase focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={paidDate}
                    onChange={(e) => setPaidDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Base Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={baseAmount || ''}
                    onChange={(e) => setBaseAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono font-medium focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Applicable GST Rate
                  </label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                  >
                    <option value={18}>18% (Services, Security, AMC)</option>
                    <option value={12}>12% (Equipment Maintenance)</option>
                    <option value={5}>5% (Essential Supplies)</option>
                    <option value={0}>0% Exempt (Electricity, Chai, Wages)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Live Tax Preview */}
              <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-1.5 text-[11px]">
                <div className="flex justify-between text-neutral-600">
                  <span>Base Taxable Amount:</span>
                  <span className="font-mono">₹ {baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>GST Paid ({gstRate}%):</span>
                  <span className="font-mono text-emerald-700">+ ₹ {calculatedGstPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-medium text-neutral-900 pt-1 border-t border-[#e2e8f0]">
                  <span>Total Voucher Payable:</span>
                  <span className="font-mono text-sm text-neutral-900">₹ {calculatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="itcCheck"
                  checked={itcEligible}
                  onChange={(e) => setItcEligible(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="itcCheck" className="text-[11px] text-neutral-700 font-medium cursor-pointer">
                  Eligible for GST Input Tax Credit (ITC claim against jewellery tax liability)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setIsNewExpenseOpen(false)}
                  className="px-3 py-1.5 rounded border border-[#e2e8f0] text-neutral-600 hover:bg-neutral-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Save Expense Voucher</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Confirmation */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-sm p-5 space-y-3 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium text-neutral-900">Delete Expense Voucher?</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Are you sure you want to delete voucher <span className="font-mono font-medium text-neutral-800">#{itemToDelete.voucher_no}</span> (₹ {itemToDelete.total_amount.toLocaleString('en-IN')}) for {itemToDelete.paid_to}?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-3 py-1.5 rounded border border-[#e2e8f0] text-neutral-600 hover:bg-neutral-50 font-medium text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteExpense}
                disabled={saving}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                <span>Delete Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
