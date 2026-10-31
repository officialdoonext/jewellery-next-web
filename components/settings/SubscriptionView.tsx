'use client';
import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Award, CheckCircle2, Copy, Download, ExternalLink,
  Monitor, RefreshCw, Mail, CreditCard, Zap
} from 'lucide-react';

const MODULES = [
  { name: 'Sales & POS', icon: '🛒', active: true },
  { name: 'Inventory', icon: '📦', active: true },
  { name: 'Rates & Valuation', icon: '💰', active: true },
  { name: 'Purchases', icon: '🧾', active: true },
  { name: 'Manufacturing', icon: '⚙️', active: true },
  { name: 'Customers', icon: '👥', active: true },
  { name: 'Finance', icon: '📊', active: true },
  { name: 'Reports', icon: '📈', active: true },
  { name: 'Employees', icon: '👤', active: true },
  { name: 'Branches', icon: '🏪', active: true },
  { name: 'Settings', icon: '⚙️', active: true },
  { name: 'API Access', icon: '🔌', active: true },
];

const ACTIVE_TERMINALS = [
  { id: 'HYD-COUNTER-01', name: 'Main Counter', lastSeen: '15:45 today', os: 'Windows 11' },
  { id: 'HYD-COUNTER-02', name: 'Counter 2', lastSeen: '15:44 today', os: 'Windows 11' },
  { id: 'HYD-ADMIN', name: 'Admin PC', lastSeen: '15:44 today', os: 'Windows 10' },
  { id: 'HYD-VAULT', name: 'Vault Terminal', lastSeen: '12:30 today', os: 'Windows 11' },
  { id: 'HYD-MGR', name: 'Manager Tablet', lastSeen: 'Yesterday', os: 'iPad OS 17' },
  { id: 'HYD-DISPLAY', name: 'Display Counter', lastSeen: '15:40 today', os: 'Windows 11' },
  { id: 'HYD-REPAIR', name: 'Repair Section', lastSeen: '11:20 today', os: 'Windows 10' },
  { id: 'HYD-BILLING', name: 'Billing Counter', lastSeen: '15:43 today', os: 'Windows 11' },
];

export function SettingsSubscriptionView() {
  const [keyVisible, setKeyVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const LICENSE_KEY = 'JWLX-2026-ENTERPRISE-PRO';

  const copyKey = () => {
    navigator.clipboard.writeText(LICENSE_KEY).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sectionClass =
    'p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs';
  const sectionHeader =
    'text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5';

  const daysTotal = 730;
  const daysRemaining = 425;
  const progressPct = Math.round(((daysTotal - daysRemaining) / daysTotal) * 100);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="settings_subscription" />
      <ActionToolbar
        filterPlaceholder="Filter license..."
        insertLabel="Check for Updates"
        onInsertClick={() => {}}
      />
      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        <div className="p-4 flex flex-col gap-4 max-w-5xl w-full mx-auto">

          {/* License Hero */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-900 to-emerald-700 border border-emerald-600 shadow-2xs text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/30 flex items-center justify-center">
                  <Award className="w-4 h-4 text-emerald-200" />
                </div>
                <div>
                  <div className="text-[10px] text-emerald-300 uppercase tracking-wider">Jewellery Suite</div>
                  <div className="text-sm font-medium text-white">Enterprise License</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-medium bg-emerald-500 text-white border border-emerald-400">
                ENTERPRISE UNLIMITED
              </span>
            </div>

            <div className="mb-3">
              <div className="text-[10px] text-emerald-300 mb-1">License Key</div>
              <div className="flex items-center gap-2 bg-emerald-800/50 rounded-md px-3 py-2">
                <span className="font-mono text-sm text-white">
                  {keyVisible ? LICENSE_KEY : 'JWLX-••••-••••••••••-•••'}
                </span>
                <button
                  onClick={() => setKeyVisible(!keyVisible)}
                  className="ml-auto text-emerald-300 hover:text-white transition-colors text-[10px]"
                >
                  {keyVisible ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={copyKey}
                  className="p-1 rounded hover:bg-emerald-700 transition-colors text-emerald-300 hover:text-white"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <div className="text-[10px] text-emerald-300">Valid Until</div>
                <div className="text-xs font-medium text-white mt-0.5">December 31, 2028</div>
                <div className="text-[10px] text-emerald-400">~2 years remaining</div>
              </div>
              <div>
                <div className="text-[10px] text-emerald-300">Terminals</div>
                <div className="text-xs font-medium text-white mt-0.5">8 / 25 Active</div>
                <div className="text-[10px] text-emerald-400">17 slots available</div>
              </div>
              <div>
                <div className="text-[10px] text-emerald-300">Support</div>
                <div className="text-xs font-medium text-white mt-0.5">24/7 Dedicated SLA</div>
                <div className="text-[10px] text-emerald-400">Priority response</div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-emerald-300 mb-1">
                <span>License Period</span>
                <span>{progressPct}% elapsed</span>
              </div>
              <div className="w-full h-1.5 bg-emerald-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          </div>

          {/* Active Modules Grid */}
          <div className={sectionClass}>
            <div className={sectionHeader}>
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              Active Modules ({MODULES.length}/{MODULES.length})
            </div>
            <div className="grid grid-cols-4 gap-2">
              {MODULES.map(mod => (
                <div key={mod.name} className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors ${mod.active ? 'bg-emerald-50 border-emerald-200' : 'bg-neutral-50 border-[#e2e8f0]'}`}>
                  <span className="text-base">{mod.icon}</span>
                  <div className="min-w-0">
                    <div className="text-[10px] font-medium text-neutral-800 truncate">{mod.name}</div>
                    {mod.active && (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                        <span className="text-[9px] text-emerald-600">Active</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal Usage */}
          <div className={sectionClass}>
            <div className={sectionHeader}>
              <Monitor className="w-3.5 h-3.5 text-emerald-600" />
              Terminal Usage (8 Active / 25 Allowed)
            </div>
            <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '32%' }} />
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#e2e8f0]">
                  {['Terminal ID','Name','OS','Last Seen'].map(h => (
                    <th key={h} className="text-left py-2 px-2 text-[10px] font-medium text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ACTIVE_TERMINALS.map(t => (
                  <tr key={t.id} className="border-b border-[#e2e8f0] hover:bg-white/60 transition-colors">
                    <td className="py-2 px-2 font-mono text-[10px] text-neutral-600">{t.id}</td>
                    <td className="py-2 px-2 text-neutral-800 text-xs">{t.name}</td>
                    <td className="py-2 px-2 text-neutral-600 text-[10px]">{t.os}</td>
                    <td className="py-2 px-2 text-neutral-500 text-[10px]">{t.lastSeen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Support & Updates */}
          <div className={sectionClass}>
            <div className={sectionHeader}>
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              Support &amp; Updates
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-2.5 rounded-md bg-white border border-[#e2e8f0]">
                <div className="text-[10px] text-neutral-500">Current Version</div>
                <div className="text-xs font-medium text-neutral-800 mt-0.5">Jewellery Suite v1.2.0-enterprise</div>
              </div>
              <div className="p-2.5 rounded-md bg-white border border-[#e2e8f0]">
                <div className="text-[10px] text-neutral-500">Last Updated</div>
                <div className="text-xs font-medium text-neutral-800 mt-0.5">Oct 28, 2026</div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5" />
                Check for Updates
              </button>
              <a
                href="mailto:support@jewellerynext.in"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-[#e2e8f0] hover:bg-neutral-50 transition-colors shadow-2xs"
              >
                <Mail className="w-3.5 h-3.5" />
                Submit Support Ticket
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </a>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-[#e2e8f0] hover:bg-neutral-50 transition-colors shadow-2xs cursor-pointer">
                <Download className="w-3.5 h-3.5" />
                Download Release Notes
              </button>
            </div>
          </div>

          {/* Billing */}
          <div className={sectionClass}>
            <div className={sectionHeader}>
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              Billing
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] text-neutral-500 mb-1">Next Renewal Date</div>
                <div className="text-xs font-medium text-neutral-800">December 31, 2028</div>
              </div>
              <div>
                <div className="text-[10px] text-neutral-500 mb-1">Billing Contact</div>
                <div className="text-xs font-medium text-neutral-800">billing@srijewellers.com</div>
              </div>
              <div>
                <div className="text-[10px] text-neutral-500 mb-1">Payment Method</div>
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="text-xs font-medium text-neutral-800">Razorpay on file</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-100 text-emerald-700">Active</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-neutral-500 mb-1">Invoice History</div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-[#e2e8f0] hover:bg-neutral-50 transition-colors shadow-2xs cursor-pointer">
                  <Download className="w-3.5 h-3.5" />
                  View Past Invoices
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
