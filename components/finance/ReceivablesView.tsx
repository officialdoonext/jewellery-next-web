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
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Send,
  Copy,
  Check,
  X,
  Plus,
  ArrowDownLeft,
  Calendar,
  CreditCard,
  Loader2,
  Trash2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export interface ReceivableRecord {
  id: string;
  entity_name: string;
  invoice_no: string;
  invoice_date: string;
  amount_due: number;
  amount_paid?: number;
  balance_due?: number;
  due_date: string;
  aging_bucket: 'CURRENT' | '30_DAYS' | '60_DAYS' | '90_DAYS_OVERDUE';
  contact_phone: string;
  customer_type?: 'Retail Client' | 'Corporate' | 'Wholesale Broker';
  status?: 'PENDING' | 'PARTIALLY_PAID' | 'CLEARED';
  created_at?: any;
}

export function FinanceReceivablesView() {
  const [receivables, setReceivables] = useState<ReceivableRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgingFilter, setSelectedAgingFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals & drawers
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [activeReceivable, setActiveReceivable] = useState<ReceivableRecord | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ReceivableRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // New Receivable Form State
  const [entityName, setEntityName] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().substring(0, 10));
  const [amountDue, setAmountDue] = useState<number>(0);
  const [dueDate, setDueDate] = useState(new Date().toISOString().substring(0, 10));
  const [contactPhone, setContactPhone] = useState('+91 98490 12345');
  const [custType, setCustType] = useState<ReceivableRecord['customer_type']>('Retail Client');
  const [agingBucket, setAgingBucket] = useState<ReceivableRecord['aging_bucket']>('CURRENT');

  // Record Inward Payment Form State
  const [receiptPaymentVal, setReceiptPaymentVal] = useState<number>(0);
  const [receiptBank, setReceiptBank] = useState('HDFC Jewellery Current - 9021');

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchReceivables = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'finance_receivables'));
      const list: ReceivableRecord[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        const tot = Number(data.amount_due) || 0;
        const paid = Number(data.amount_paid) || 0;
        const bal = typeof data.balance_due === 'number' ? data.balance_due : Math.max(0, tot - paid);
        list.push({
          id: d.id,
          ...(data as Omit<ReceivableRecord, 'id'>),
          amount_paid: paid,
          balance_due: bal,
        });
      });
      list.sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''));
      setReceivables(list);
    } catch (err: any) {
      console.error('Error fetching receivables:', err);
      showToast('error', err.message || 'Failed to fetch customer receivables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceivables();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open Receipt Modal
  const handleOpenReceiptModal = (rec: ReceivableRecord) => {
    setActiveReceivable(rec);
    setReceiptPaymentVal(rec.balance_due ?? rec.amount_due);
    setIsReceiptModalOpen(true);
  };

  // Record Inward Payment Receipt
  const handleSavePaymentReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReceivable || receiptPaymentVal <= 0) {
      showToast('error', 'Please enter a valid receipt payment amount');
      return;
    }

    const currentPaid = Number(activeReceivable.amount_paid) || 0;
    const newPaid = currentPaid + Number(receiptPaymentVal);
    const newBal = Math.max(0, Number(activeReceivable.amount_due) - newPaid);
    const newStatus: ReceivableRecord['status'] = newBal === 0 ? 'CLEARED' : 'PARTIALLY_PAID';

    try {
      setSaving(true);
      await updateDoc(doc(db, 'finance_receivables', activeReceivable.id), {
        amount_paid: newPaid,
        balance_due: newBal,
        status: newStatus,
      });

      setReceivables((prev) =>
        prev.map((r) =>
          r.id === activeReceivable.id
            ? { ...r, amount_paid: newPaid, balance_due: newBal, status: newStatus }
            : r
        )
      );
      setIsReceiptModalOpen(false);
      showToast(
        'success',
        `Recorded inward payment of ₹ ${receiptPaymentVal.toLocaleString('en-IN')} for ${activeReceivable.entity_name}`
      );
    } catch (err: any) {
      console.error('Error recording payment:', err);
      showToast('error', err.message || 'Failed to update receivable');
    } finally {
      setSaving(false);
    }
  };

  // Create Receivable
  const handleCreateReceivable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amountDue <= 0 || !entityName.trim()) {
      showToast('error', 'Please enter client name and amount due');
      return;
    }

    try {
      setSaving(true);
      const invNo = invoiceNo.trim() || `INV-${new Date().getFullYear().toString().slice(-2)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const payload: Omit<ReceivableRecord, 'id'> = {
        entity_name: entityName.trim(),
        invoice_no: invNo,
        invoice_date: invoiceDate,
        amount_due: Number(amountDue),
        amount_paid: 0,
        balance_due: Number(amountDue),
        due_date: dueDate,
        aging_bucket: agingBucket,
        contact_phone: contactPhone.trim(),
        customer_type: custType,
        status: 'PENDING',
        created_at: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'finance_receivables'), payload);
      setReceivables((prev) => [{ id: docRef.id, ...payload }, ...prev]);
      setIsNewInvoiceOpen(false);
      setEntityName('');
      setAmountDue(0);
      setInvoiceNo('');
      showToast('success', `Created customer receivable #${invNo}`);
    } catch (err: any) {
      console.error('Error creating receivable:', err);
      showToast('error', err.message || 'Failed to save receivable');
    } finally {
      setSaving(false);
    }
  };

  // Delete Receivable
  const handleDeleteReceivable = async () => {
    if (!itemToDelete) return;
    try {
      setSaving(true);
      await deleteDoc(doc(db, 'finance_receivables', itemToDelete.id));
      setReceivables((prev) => prev.filter((r) => r.id !== itemToDelete.id));
      showToast('success', `Deleted receivable invoice #${itemToDelete.invoice_no}`);
      setItemToDelete(null);
    } catch (err: any) {
      console.error('Error deleting receivable:', err);
      showToast('error', err.message || 'Failed to delete receivable');
    } finally {
      setSaving(false);
    }
  };

  // KPI Calculations
  const totalOutstanding = receivables
    .filter((r) => r.status !== 'CLEARED')
    .reduce((acc, curr) => acc + (Number(curr.balance_due ?? curr.amount_due) || 0), 0);
  const currentBucketTotal = receivables
    .filter((r) => r.aging_bucket === 'CURRENT' && r.status !== 'CLEARED')
    .reduce((acc, curr) => acc + (Number(curr.balance_due ?? curr.amount_due) || 0), 0);
  const overdueBucketTotal = receivables
    .filter((r) => (r.aging_bucket === '60_DAYS' || r.aging_bucket === '90_DAYS_OVERDUE') && r.status !== 'CLEARED')
    .reduce((acc, curr) => acc + (Number(curr.balance_due ?? curr.amount_due) || 0), 0);
  const clearedCount = receivables.filter((r) => r.status === 'CLEARED').length;

  const filteredReceivables = receivables.filter((item) => {
    if (selectedAgingFilter !== 'ALL' && item.aging_bucket !== selectedAgingFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.entity_name || '').toLowerCase().includes(q) ||
      (item.invoice_no || '').toLowerCase().includes(q) ||
      (item.contact_phone || '').toLowerCase().includes(q) ||
      (item.aging_bucket || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="accounts_receivable_aging" />
      <ActionToolbar
        filterPlaceholder="Filter by customer, invoice #, phone, aging..."
        insertLabel="New Receivable"
        onInsertClick={() => setIsNewInvoiceOpen(true)}
        onRefresh={fetchReceivables}
      />

      <FinanceNavigationHeader activePage="receivables" />

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
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Outstanding</span>
                <Users className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900 font-mono">
                ₹ {totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Pending client balances</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Current (0-30 Days)</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700 font-mono">
                ₹ {currentBucketTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1">Normal billing credit cycle</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Overdue (&gt;60 Days)</span>
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              </div>
              <div className="text-xl font-medium text-red-600 font-mono">
                ₹ {overdueBucketTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-red-500 mt-1">Requires follow-up calls</div>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-200 hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-emerald-800 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Settled Invoices</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div className="text-xl font-medium text-emerald-900 font-mono">
                {clearedCount} / {receivables.length}{' '}
                <span className="text-xs text-emerald-700 font-sans font-medium">Cleared</span>
              </div>
              <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Inward collections complete
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-4 py-2 bg-white border-b border-[#e5e7eb] flex items-center gap-2 text-xs shrink-0 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-neutral-400 uppercase font-medium shrink-0">Aging Bucket:</span>
          {[
            { id: 'ALL', label: 'All Receivables' },
            { id: 'CURRENT', label: 'Current (<30d)' },
            { id: '30_DAYS', label: '30-60 Days' },
            { id: '60_DAYS', label: '60-90 Days' },
            { id: '90_DAYS_OVERDUE', label: '90+ Days Overdue' },
          ].map((bucket) => (
            <button
              key={bucket.id}
              onClick={() => setSelectedAgingFilter(bucket.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer shrink-0 ${
                selectedAgingFilter === bucket.id
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {bucket.label}
            </button>
          ))}
        </div>

        {/* Receivables Table or Empty State */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-neutral-500">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
              <p className="text-xs font-medium">Loading live customer receivables...</p>
            </div>
          ) : filteredReceivables.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center p-8 bg-white rounded-lg border border-[#e5e7eb] shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-neutral-900 mb-1">No Receivables Found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mb-4">
                {searchQuery || selectedAgingFilter !== 'ALL'
                  ? 'No customer receivables match the criteria. Try clearing the filter.'
                  : 'Record customer bridal suite credit bills, corporate gifting invoices, and inward payment receipts.'}
              </p>
              <button
                onClick={() => setIsNewInvoiceOpen(true)}
                className="px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Customer Receivable</span>
              </button>
            </div>
          ) : (
            <div className="border border-[#e5e7eb] rounded-lg bg-white overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-neutral-500 uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3 font-medium">Client / Corporate Entity</th>
                      <th className="py-2.5 px-3 font-medium">Invoice #</th>
                      <th className="py-2.5 px-3 font-medium">Date</th>
                      <th className="py-2.5 px-3 font-medium text-right">Invoice Val (₹)</th>
                      <th className="py-2.5 px-3 font-medium text-right">Balance Due (₹)</th>
                      <th className="py-2.5 px-3 font-medium">Due Date</th>
                      <th className="py-2.5 px-3 font-medium text-center">Aging</th>
                      <th className="py-2.5 px-3 font-medium">Contact Phone</th>
                      <th className="py-2.5 px-3 font-medium text-center">Receipt</th>
                      <th className="py-2.5 px-3 font-medium text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0] text-neutral-700">
                    {filteredReceivables.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-2 px-3 font-medium text-neutral-900 max-w-xs truncate" title={row.entity_name}>
                          {row.entity_name}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-neutral-600 whitespace-nowrap">
                          <button
                            onClick={() => copyToClipboard(row.invoice_no, row.id)}
                            className="inline-flex items-center gap-1 hover:text-emerald-700 cursor-pointer"
                            title="Copy Invoice #"
                          >
                            <span>{row.invoice_no}</span>
                            {copiedId === row.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-2.5 h-2.5 text-neutral-400 opacity-60" />
                            )}
                          </button>
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                          {row.invoice_date}
                        </td>
                        <td className="py-2 px-3 font-mono text-neutral-600 text-right whitespace-nowrap">
                          ₹ {row.amount_due.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 font-mono font-medium text-neutral-900 text-right whitespace-nowrap">
                          ₹ {(row.balance_due ?? row.amount_due).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-neutral-600 whitespace-nowrap">
                          {row.due_date}
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                              row.aging_bucket === 'CURRENT'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : row.aging_bucket === '30_DAYS'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : row.aging_bucket === '60_DAYS'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {row.aging_bucket.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-neutral-600 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-neutral-400" />
                            <span>{row.contact_phone}</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          {(row.balance_due ?? row.amount_due) > 0 ? (
                            <button
                              onClick={() => handleOpenReceiptModal(row)}
                              className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-medium text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                              <span>Collect Inward</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Cleared
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => setItemToDelete(row)}
                            className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete receivable"
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

      {/* MODAL: Record Inward Payment */}
      {isReceiptModalOpen && activeReceivable && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-medium text-neutral-900 uppercase tracking-wider">
                  Record Inward Payment Receipt
                </h3>
              </div>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePaymentReceipt} className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="font-medium text-neutral-900 text-xs">{activeReceivable.entity_name}</div>
                <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                  Invoice #{activeReceivable.invoice_no} • Outstanding: ₹ {(activeReceivable.balance_due ?? activeReceivable.amount_due).toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Payment Inward Amount (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={activeReceivable.balance_due ?? activeReceivable.amount_due}
                  step="0.01"
                  required
                  value={receiptPaymentVal || ''}
                  onChange={(e) => setReceiptPaymentVal(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono font-medium focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Received Into Account
                </label>
                <select
                  value={receiptBank}
                  onChange={(e) => setReceiptBank(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                >
                  <option value="HDFC Jewellery Current - 9021">HDFC Jewellery Current - 9021</option>
                  <option value="ICICI Bullion Overdraft - 4410">ICICI Bullion Overdraft - 4410</option>
                  <option value="SBI Current Account - 1102">SBI Current Account - 1102</option>
                  <option value="Counter Cash Drawer #01">Counter Cash Drawer #01</option>
                </select>
              </div>

              {/* Dynamic Balance Preview */}
              <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] flex justify-between">
                <span>Remaining Customer Balance:</span>
                <span className="font-mono font-medium">
                  ₹ {Math.max(0, (activeReceivable.balance_due ?? activeReceivable.amount_due) - Number(receiptPaymentVal)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
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
                  <span>Record Inward Collection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: New Receivable / Invoice */}
      {isNewInvoiceOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-medium text-neutral-900 uppercase tracking-wider">
                  Create Customer Receivable / Credit Invoice
                </h3>
              </div>
              <button
                onClick={() => setIsNewInvoiceOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReceivable} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Customer Type
                  </label>
                  <select
                    value={custType}
                    onChange={(e) => setCustType(e.target.value as ReceivableRecord['customer_type'])}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                  >
                    <option value="Retail Client">Retail Bridal Client</option>
                    <option value="Corporate">Corporate Gifting Client</option>
                    <option value="Wholesale Broker">Wholesale Broker</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Aging Bracket
                  </label>
                  <select
                    value={agingBucket}
                    onChange={(e) => setAgingBucket(e.target.value as ReceivableRecord['aging_bucket'])}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                  >
                    <option value="CURRENT">Current (&lt;30 Days)</option>
                    <option value="30_DAYS">30-60 Days</option>
                    <option value="60_DAYS">60-90 Days</option>
                    <option value="90_DAYS_OVERDUE">90+ Days Overdue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Customer / Corporate Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Radhika Rao / Apollo Hospital Doctors Guild"
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Total Invoice Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={amountDue || ''}
                    onChange={(e) => setAmountDue(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono font-medium focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Invoice #
                  </label>
                  <input
                    type="text"
                    placeholder="INV-26-XXXX"
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Settlement Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98490 12345"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded font-mono focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceOpen(false)}
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
                  <span>Save Receivable</span>
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
              <h3 className="text-sm font-medium text-neutral-900">Delete Receivable Record?</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Are you sure you want to delete invoice <span className="font-mono font-medium text-neutral-800">#{itemToDelete.invoice_no}</span> (₹ {itemToDelete.amount_due.toLocaleString('en-IN')}) for {itemToDelete.entity_name}?
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
                onClick={handleDeleteReceivable}
                disabled={saving}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                <span>Delete Receivable</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
