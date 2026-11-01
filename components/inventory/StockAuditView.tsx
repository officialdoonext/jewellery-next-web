'use client';

import React, { useState, useEffect } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Radio,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Plus,
  Trash2,
  Loader2,
  X,
  Search,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
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

export interface AuditHistoryItem {
  id: string;
  audit_session: string;
  section: string;
  expected_pcs: number;
  scanned_pcs: number;
  match_percentage: number;
  missing_pcs: number;
  misplaced_pcs: number;
  auditor_name: string;
  audit_date: string;
  status: 'RECONCILED' | 'IN_PROGRESS' | 'DISCREPANCY';
}

export function InventoryStockAuditView() {
  const [audits, setAudits] = useState<AuditHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Scanner Simulator State
  const [activeAuditId, setActiveAuditId] = useState<string | null>(null);
  const [scanInput, setScanInput] = useState('');

  // Form State
  const [sessionName, setSessionName] = useState('');
  const [section, setSection] = useState('Bridal Necklace Vault');
  const [expectedPcs, setExpectedPcs] = useState('');
  const [auditorName, setAuditorName] = useState('Internal Audit Custodian');

  const fetchAudits = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'inventory_stock_audits'));
      const list: AuditHistoryItem[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<AuditHistoryItem, 'id'>) });
      });
      list.sort((a, b) => (b.audit_date || '').localeCompare(a.audit_date || ''));
      setAudits(list);
    } catch (err: any) {
      console.error('Error fetching stock audits:', err);
      showToast('error', err.message || 'Failed to fetch audits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const handleOpenAdd = () => {
    const today = new Date();
    const month = today.toLocaleString('default', { month: 'short' }).toUpperCase();
    setSessionName(`AUD-${today.getFullYear()}-${month}`);
    setExpectedPcs('');
    setIsAddModalOpen(true);
  };

  const handleCreateAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expectedPcs || !sessionName.trim()) return;

    try {
      setSaving(true);
      const exp = parseInt(expectedPcs) || 1;
      const today = new Date().toISOString().split('T')[0];

      const newAudit = {
        audit_session: sessionName.trim(),
        section,
        expected_pcs: exp,
        scanned_pcs: 0,
        match_percentage: 0.0,
        missing_pcs: exp,
        misplaced_pcs: 0,
        auditor_name: auditorName.trim() || 'Internal Auditor',
        audit_date: today,
        status: 'IN_PROGRESS' as const,
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'inventory_stock_audits'), newAudit);
      setAudits((prev) => [{ id: docRef.id, ...newAudit }, ...prev]);
      setIsAddModalOpen(false);
      showToast('success', `Audit session ${newAudit.audit_session} started.`);
    } catch (err: any) {
      console.error('Error starting audit:', err);
      showToast('error', err.message || 'Failed to start audit');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickScan = async (audit: AuditHistoryItem) => {
    const nextScanned = audit.scanned_pcs + 1;
    const match = Math.min(100, Math.round((nextScanned / audit.expected_pcs) * 100));
    const missing = Math.max(0, audit.expected_pcs - nextScanned);
    const status = nextScanned >= audit.expected_pcs ? 'RECONCILED' : 'IN_PROGRESS';

    try {
      await updateDoc(doc(db, 'inventory_stock_audits', audit.id), {
        scanned_pcs: nextScanned,
        match_percentage: match,
        missing_pcs: missing,
        status,
      });
      setAudits((prev) =>
        prev.map((a) =>
          a.id === audit.id
            ? { ...a, scanned_pcs: nextScanned, match_percentage: match, missing_pcs: missing, status }
            : a
        )
      );
      showToast('success', `Scanned item #${nextScanned} for ${audit.audit_session}`);
    } catch (err: any) {
      console.error('Error scanning:', err);
    }
  };

  const handleDeleteAudit = async (id: string, name: string) => {
    if (!confirm(`Delete audit session ${name}?`)) return;
    try {
      await deleteDoc(doc(db, 'inventory_stock_audits', id));
      setAudits((prev) => prev.filter((a) => a.id !== id));
      showToast('success', `Audit ${name} deleted.`);
    } catch (err: any) {
      console.error('Error deleting audit:', err);
    }
  };

  const filteredAudits = audits.filter((a) => {
    if (filterStatus !== 'All' && a.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSession = a.audit_session?.toLowerCase().includes(q);
      const matchSec = a.section?.toLowerCase().includes(q);
      const matchAuditor = a.auditor_name?.toLowerCase().includes(q);
      if (!matchSession && !matchSec && !matchAuditor) return false;
    }
    return true;
  });

  const avgMatch = audits.length
    ? (audits.reduce((acc, curr) => acc + (curr.match_percentage || 0), 0) / audits.length).toFixed(1)
    : '0.0';
  const reconciledCount = audits.filter((a) => a.status === 'RECONCILED').length;
  const inProgressCount = audits.filter((a) => a.status === 'IN_PROGRESS').length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0 font-sans">
      <TabBar title="inventory_stock_audit" />
      <ActionToolbar
        filterPlaceholder="Filter audit sessions, sections..."
        insertLabel="Start Audit"
        onInsertClick={handleOpenAdd}
        onRefresh={fetchAudits}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        <div className="p-4 flex flex-col gap-4 max-w-7xl w-full mx-auto">
          {/* Toast */}
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
                <span className="text-[11px] font-medium uppercase tracking-wider">Average Match</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{avgMatch}%</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Physical count accuracy</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Reconciled Vaults</span>
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{reconciledCount}</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">100% matched sessions</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">In-Progress Audits</span>
                <Radio className="w-4 h-4 text-amber-500 animate-pulse" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{inProgressCount}</div>
              <div className="text-[10px] text-amber-600 font-medium mt-0.5">Barcode scanning active</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Audits</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-800">{audits.length}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Completed cycle counts</div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search session or section..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-[#f8fafc] focus:bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-medium placeholder:text-neutral-400 w-48 sm:w-60"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-700 font-medium cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="RECONCILED">Reconciled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DISCREPANCY">Discrepancy</option>
              </select>
            </div>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] hover:bg-[#1fa070] text-white shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Start New Audit</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-2xs overflow-hidden">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-2 text-neutral-500">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs font-medium">Loading audit sessions from Firebase...</span>
              </div>
            ) : filteredAudits.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                  <ScanLine className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-neutral-800">No Audit Sessions</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  {audits.length === 0
                    ? 'No physical stock audit sessions logged in Firebase yet. Click "Start New Audit" to verify showroom or vault pieces against system records.'
                    : 'No sessions match your active filters.'}
                </p>
                {audits.length === 0 && (
                  <button
                    onClick={handleOpenAdd}
                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#24b47e] text-white hover:bg-[#1fa070] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Launch First Audit
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f8fafc] text-neutral-600 font-medium border-b border-[#e2e8f0]">
                    <tr>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Session Name</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Section / Counter</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Expected</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Scanned</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Match %</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Missing</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Auditor</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Date</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Status</th>
                      <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {filteredAudits.map((a) => (
                      <tr key={a.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-2.5 px-3 font-mono font-medium text-neutral-800">{a.audit_session}</td>
                        <td className="py-2.5 px-3 font-medium text-neutral-700">{a.section}</td>

                        <td className="py-2.5 px-3 text-right font-mono text-neutral-700">
                          {a.expected_pcs} pcs
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-medium text-neutral-800">
                          {a.scanned_pcs} pcs
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-medium">
                          <span className={a.match_percentage === 100 ? 'text-emerald-700' : 'text-amber-700'}>
                            {a.match_percentage}%
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono">
                          <span className={a.missing_pcs > 0 ? 'text-amber-700 font-medium' : 'text-neutral-500'}>
                            {a.missing_pcs}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-neutral-600">{a.auditor_name}</td>
                        <td className="py-2.5 px-3 text-neutral-500 text-[11px]">{a.audit_date}</td>

                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            a.status === 'RECONCILED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : a.status === 'IN_PROGRESS'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {a.status.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {a.status === 'IN_PROGRESS' && (
                              <button
                                onClick={() => handleQuickScan(a)}
                                className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1"
                                title="Simulate Barcode Scan"
                              >
                                <ScanLine className="w-2.5 h-2.5" />
                                +1 Scan
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteAudit(a.id, a.audit_session)}
                              className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete audit"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

      {/* Start Audit Session Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-medium text-neutral-800">Initiate Physical Stock Audit</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAudit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Session Code *</label>
                <input
                  type="text"
                  required
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Showroom Section / Counter</label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-700 focus:border-emerald-500 focus:outline-none font-medium"
                >
                  <option value="Bridal Necklace Vault">Bridal Necklace Vault</option>
                  <option value="Display Counter 2 Bangles">Display Counter 2 Bangles</option>
                  <option value="Diamond Solitaire Ring Tray">Diamond Solitaire Ring Tray</option>
                  <option value="Daily Chains Counter">Daily Chains Counter</option>
                  <option value="Silver Utensils Showcase">Silver Utensils Showcase</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Expected Pieces Count *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 150"
                  value={expectedPcs}
                  onChange={(e) => setExpectedPcs(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md font-mono text-neutral-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Lead Auditor Name</label>
                <input
                  type="text"
                  value={auditorName}
                  onChange={(e) => setAuditorName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-md text-neutral-800 focus:border-emerald-500 focus:outline-none"
                />
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
                  <span>{saving ? 'Saving...' : 'Start Audit'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
