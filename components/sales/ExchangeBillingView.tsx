'use client';

import React, { useState } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Coins,
  Flame,
  BadgeIndianRupee,
  Printer,
  X,
  Calculator,
  ShieldCheck,
} from 'lucide-react';

interface ExchangeBillRecord {
  id: string;
  exchange_id: string;
  customer_name: string;
  customer_phone: string;
  ornament_description: string;
  old_gross_wt_g: number;
  dust_lac_deduction_g: number;
  stone_deduction_g: number;
  total_deductions_g: number;
  net_melt_wt_g: number;
  purity_percent: number;
  testing_method: 'TOUCHSTONE_ACID' | 'XRF_SPECTROMETER' | 'DENSITY_SCALE';
  net_fine_wt_g: number;
  scrap_rate_per_g: number;
  credit_amount: number;
  linked_bill_no: string;
  status: 'ADJUSTED_IN_INVOICE' | 'PENDING_OFFSET';
  created_at: string;
}

const INITIAL_EXCHANGES: ExchangeBillRecord[] = [
  {
    id: 'bb219804-d72b-402a-a921-789a7cdb8123',
    exchange_id: 'EXC-2026-051',
    customer_name: 'Sunita Joshi',
    customer_phone: '+91 98230 44512',
    ornament_description: 'Old Traditional Broad Kada & Scrap Bits',
    old_gross_wt_g: 32.500,
    dust_lac_deduction_g: 0.800,
    stone_deduction_g: 0.000,
    total_deductions_g: 0.800,
    net_melt_wt_g: 31.700,
    purity_percent: 88.50,
    testing_method: 'XRF_SPECTROMETER',
    net_fine_wt_g: 28.055,
    scrap_rate_per_g: 8010.00,
    credit_amount: 224720.00,
    linked_bill_no: 'POS-2026-1042',
    status: 'ADJUSTED_IN_INVOICE',
    created_at: '2026-10-31 10:15 AM',
  },
  {
    id: 'bb219804-d72b-402a-a921-789a7cdb8124',
    exchange_id: 'EXC-2026-050',
    customer_name: 'Hariprasad Rao',
    customer_phone: '+91 94401 11290',
    ornament_description: 'Vintage 22K Mangalsutra Chain & Beads',
    old_gross_wt_g: 24.200,
    dust_lac_deduction_g: 0.500,
    stone_deduction_g: 1.200,
    total_deductions_g: 1.700,
    net_melt_wt_g: 22.500,
    purity_percent: 91.60,
    testing_method: 'TOUCHSTONE_ACID',
    net_fine_wt_g: 20.610,
    scrap_rate_per_g: 8010.00,
    credit_amount: 165086.00,
    linked_bill_no: 'POS-2026-1043',
    status: 'ADJUSTED_IN_INVOICE',
    created_at: '2026-10-31 10:55 AM',
  },
  {
    id: 'bb219804-d72b-402a-a921-789a7cdb8125',
    exchange_id: 'EXC-2026-049',
    customer_name: 'Revathi Krishnan',
    customer_phone: '+91 98450 77122',
    ornament_description: 'Broken Plain Bangles & Pendant',
    old_gross_wt_g: 18.400,
    dust_lac_deduction_g: 0.300,
    stone_deduction_g: 0.000,
    total_deductions_g: 0.300,
    net_melt_wt_g: 18.100,
    purity_percent: 85.00,
    testing_method: 'DENSITY_SCALE',
    net_fine_wt_g: 15.385,
    scrap_rate_per_g: 8010.00,
    credit_amount: 123234.00,
    linked_bill_no: 'POS-2026-1045',
    status: 'ADJUSTED_IN_INVOICE',
    created_at: '2026-10-30 04:30 PM',
  },
];

export function SalesExchangeBillingView() {
  const [exchanges, setExchanges] = useState<ExchangeBillRecord[]>(INITIAL_EXCHANGES);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [selectedExchange, setSelectedExchange] = useState<ExchangeBillRecord | null>(null);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);

  // Live Calculator Panel state
  const [customer, setCustomer] = useState('Priya Sharma');
  const [phone, setPhone] = useState('+91 98451 22910');
  const [desc, setDesc] = useState('Old Bangles & Broken Ear studs');
  const [grossWt, setGrossWt] = useState('32.500');
  const [dustDeduction, setDustDeduction] = useState('0.800');
  const [stoneDeduction, setStoneDeduction] = useState('0.000');
  const [purityPercent, setPurityPercent] = useState('88.50');
  const [testMethod, setTestMethod] = useState<'TOUCHSTONE_ACID' | 'XRF_SPECTROMETER' | 'DENSITY_SCALE'>('XRF_SPECTROMETER');
  const [scrapRate, setScrapRate] = useState('8010');
  const [targetBill, setTargetBill] = useState('POS-2026-1046');

  // Computed values
  const gross = parseFloat(grossWt) || 0;
  const dust = parseFloat(dustDeduction) || 0;
  const stone = parseFloat(stoneDeduction) || 0;
  const totalDeductions = dust + stone;
  const netMeltWt = Math.max(0, gross - totalDeductions);
  const purity = parseFloat(purityPercent) || 0;
  const netFineWt = (netMeltWt * purity) / 100;
  const rate = parseFloat(scrapRate) || 8010;
  const creditValue = Math.round(netFineWt * rate);

  const handleRecordExchange = () => {
    const newRecord: ExchangeBillRecord = {
      id: `exc-${exchanges.length + 1}-${customer.slice(0, 3)}`,
      exchange_id: `EXC-2026-0${52 + exchanges.length}`,
      customer_name: customer,
      customer_phone: phone,
      ornament_description: desc,
      old_gross_wt_g: gross,
      dust_lac_deduction_g: dust,
      stone_deduction_g: stone,
      total_deductions_g: totalDeductions,
      net_melt_wt_g: netMeltWt,
      purity_percent: purity,
      testing_method: testMethod,
      net_fine_wt_g: netFineWt,
      scrap_rate_per_g: rate,
      credit_amount: creditValue,
      linked_bill_no: targetBill,
      status: 'ADJUSTED_IN_INVOICE',
      created_at: 'Just now',
    };

    setExchanges([newRecord, ...exchanges]);
    setSelectedExchange(newRecord);
    setIsSlipModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="sales_exchange_billing" />
      <ActionToolbar
        filterPlaceholder="Filter by exchange ID, customer, linked bill..."
        insertLabel="New Exchange Entry"
        onInsertClick={() => {}}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Old Gold Exchanged</span>
                <Coins className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">382.400 g</div>
              <div className="text-[11px] text-amber-700 mt-1 font-mono">
                Assessed across 18 bills
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Net Credit Value</span>
                <BadgeIndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700">₹ 28,45,000</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                Offset into new jewellery
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Touchstone & XRF</span>
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">18 Bills Tested</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Spectrometer purity verified
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Scrap Safe Stock</span>
                <Flame className="w-3.5 h-3.5 text-orange-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">4.820 kg</div>
              <div className="text-[11px] text-orange-700 mt-1 font-mono">
                Ready for refinery melting batch
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Old Gold Exchange Calculator Panel */}
        <div className="p-4 sm:p-5">
          <div className="p-4 rounded-lg bg-white border border-[#e2e8f0] shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9] mb-4">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-medium text-neutral-800 uppercase tracking-wide">
                  Live Old Gold Valuation & Melt Assessor
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-neutral-500 font-mono">Current 24K Scrap Buy Rate:</span>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200">
                  ₹ 8,010.00 / g
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="text-[11px] font-medium text-neutral-600 mb-1 block">Customer Name</label>
                <input
                  type="text"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-neutral-600 mb-1 block">Phone (+91)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] font-medium text-neutral-600 mb-1 block">Old Ornament Description</label>
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-4">
              <div>
                <label className="text-[11px] font-medium text-neutral-600 mb-1 block">Old Gross Wt (g)</label>
                <input
                  type="number"
                  step="0.001"
                  value={grossWt}
                  onChange={(e) => setGrossWt(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-amber-500 focus:outline-none text-right font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-neutral-600 mb-1 block">Dust/Lac (g)</label>
                <input
                  type="number"
                  step="0.001"
                  value={dustDeduction}
                  onChange={(e) => setDustDeduction(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-amber-500 focus:outline-none text-right"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-neutral-600 mb-1 block">Stones / Enamel (g)</label>
                <input
                  type="number"
                  step="0.001"
                  value={stoneDeduction}
                  onChange={(e) => setStoneDeduction(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-amber-500 focus:outline-none text-right"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-neutral-600 mb-1 block">Net Melt Wt (g)</label>
                <div className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#f8fafc] border border-[#e2e8f0] rounded-md text-right font-medium text-neutral-800">
                  {netMeltWt.toFixed(3)} g
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-neutral-600 mb-1 block">Assessed Purity %</label>
                <input
                  type="number"
                  step="0.01"
                  value={purityPercent}
                  onChange={(e) => setPurityPercent(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-amber-500 focus:outline-none text-right font-medium text-amber-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-neutral-600 mb-1 block">Net Fine Gold (g)</label>
                <div className="w-full px-2.5 py-1.5 text-xs font-mono bg-amber-50 border border-amber-200 rounded-md text-right font-medium text-amber-900">
                  {netFineWt.toFixed(3)} g
                </div>
              </div>
            </div>

            {/* Assessment Bar & Offset Action */}
            <div className="pt-3 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-[11px] text-neutral-500 block">Testing Method:</span>
                  <select
                    value={testMethod}
                    onChange={(e) => setTestMethod(e.target.value as 'TOUCHSTONE_ACID' | 'XRF_SPECTROMETER' | 'DENSITY_SCALE')}
                    className="px-2 py-1 text-xs border border-[#e2e8f0] rounded-md bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="XRF_SPECTROMETER">XRF Spectrometer (Precision 99.8%)</option>
                    <option value="TOUCHSTONE_ACID">Touchstone & Nitric Acid</option>
                    <option value="DENSITY_SCALE">Hydrostatic Specific Gravity Scale</option>
                  </select>
                </div>

                <div>
                  <span className="text-[11px] text-neutral-500 block">Scrap Buy Rate (₹/g):</span>
                  <input
                    type="number"
                    value={scrapRate}
                    onChange={(e) => setScrapRate(e.target.value)}
                    className="px-2 py-1 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white w-24"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-neutral-500 block">Target Bill Offset #:</span>
                  <input
                    type="text"
                    value={targetBill}
                    onChange={(e) => setTargetBill(e.target.value)}
                    className="px-2.5 py-1 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-medium text-neutral-500 block">
                    Calculated Credit Value
                  </span>
                  <span className="text-xl font-medium font-mono text-emerald-800">
                    ₹ {creditValue.toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  onClick={handleRecordExchange}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-2xs cursor-pointer"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Issue Exchange Credit Slip</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Supabase-style Table */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-600" />
                <span className="font-mono font-medium text-neutral-800">exchange_bills</span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">Showing {exchanges.length} exchange trade-ins</span>
              </div>

              <div className="flex items-center bg-neutral-200/60 p-0.5 rounded border border-neutral-300/60 text-[13px]">
                <button
                  onClick={() => setActiveTab('data')}
                  className={`px-2.5 py-0.5 rounded font-medium transition-all cursor-pointer ${
                    activeTab === 'data'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Data
                </button>
                <button
                  onClick={() => setActiveTab('definition')}
                  className={`px-2.5 py-0.5 rounded font-medium transition-all cursor-pointer ${
                    activeTab === 'definition'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Definition
                </button>
              </div>
            </div>

            {activeTab === 'data' && (
              <div className="flex-1 overflow-x-auto custom-scrollbar w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#fcfcfc] border-b border-[#e5e7eb] text-neutral-600 font-mono text-[11px]">
                      <th className="w-10 px-3 py-2 border-r border-[#e5e7eb] text-center">
                        <input
                          type="checkbox"
                          className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                        />
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">exchange_id</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">customer_name</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">old_gross_wt_g</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">deductions_g</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">purity_percent</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">net_fine_wt_g</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap text-right">
                        <span className="text-neutral-800">credit_amount</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">linked_bill_no</span>
                      </th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">status</span>
                      </th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {exchanges.map((row) => (
                      <tr key={row.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="w-10 px-3 py-2 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-[11px]">
                          <span
                            onClick={() => {
                              setSelectedExchange(row);
                              setIsSlipModalOpen(true);
                            }}
                            className="font-medium text-amber-700 hover:underline cursor-pointer"
                          >
                            {row.exchange_id}
                          </span>
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-medium text-neutral-800">
                          <div>{row.customer_name}</div>
                          <div className="text-[10px] text-neutral-400 font-normal">{row.customer_phone}</div>
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-right text-neutral-800">
                          {row.old_gross_wt_g.toFixed(3)} g
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-right text-red-600">
                          -{row.total_deductions_g.toFixed(3)} g
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-right font-medium text-amber-700">
                          {row.purity_percent.toFixed(2)}%
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-right font-medium text-neutral-900">
                          {row.net_fine_wt_g.toFixed(3)} g
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-right font-medium text-emerald-800">
                          ₹ {row.credit_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-[11px] text-neutral-600">
                          {row.linked_bill_no}
                        </td>
                        <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {row.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <button
                            onClick={() => {
                              setSelectedExchange(row);
                              setIsSlipModalOpen(true);
                            }}
                            className="p-1 rounded text-neutral-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                            title="Print Valuation Slip"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'definition' && (
              <div className="p-4 overflow-x-auto font-mono text-xs text-neutral-800 bg-[#fbfbfb] w-full">
                <div className="bg-neutral-900 text-neutral-100 p-4 rounded-md overflow-x-auto shadow-inner text-[12px] leading-relaxed w-full">
                  <span className="text-emerald-400">CREATE TABLE</span> public.exchange_bills (
                  <br />
                  <span className="pl-6 text-blue-300">id</span> <span className="text-amber-300">uuid</span> <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">exchange_id</span> <span className="text-amber-300">varchar(32)</span> <span className="text-neutral-400">UNIQUE NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">customer_name</span> <span className="text-amber-300">varchar(255)</span> <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">old_gross_wt_g</span> <span className="text-amber-300">numeric(10,3)</span> <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">purity_percent</span> <span className="text-amber-300">numeric(5,2)</span> <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">net_fine_wt_g</span> <span className="text-amber-300">numeric(10,3)</span> <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">credit_amount</span> <span className="text-amber-300">numeric(10,2)</span> <span className="text-neutral-400">NOT NULL</span>
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Old Gold Valuation Slip Modal */}
      {isSlipModalOpen && selectedExchange && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-[#e2e8f0] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-medium text-neutral-900">
                  Old Gold Valuation Voucher: {selectedExchange.exchange_id}
                </h3>
              </div>
              <button
                onClick={() => setIsSlipModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 font-mono text-xs text-neutral-800 space-y-3">
              <div className="text-center pb-2 border-b border-dashed border-neutral-300">
                <div className="font-medium text-sm text-neutral-900">
                  SRI LAKSHMI JEWELLERS & DIAMONDS
                </div>
                <div className="text-[11px] text-neutral-500">Old Gold Exchange Valuation Slip</div>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span>Exchange ID:</span>
                  <span className="font-medium">{selectedExchange.exchange_id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{selectedExchange.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Item Description:</span>
                  <span className="text-right max-w-[200px] truncate">{selectedExchange.ornament_description}</span>
                </div>
                <div className="flex justify-between">
                  <span>Old Gross Weight:</span>
                  <span>{selectedExchange.old_gross_wt_g.toFixed(3)} g</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Total Deductions:</span>
                  <span>-{selectedExchange.total_deductions_g.toFixed(3)} g</span>
                </div>
                <div className="flex justify-between">
                  <span>Assessed Purity:</span>
                  <span className="font-medium text-amber-800">{selectedExchange.purity_percent.toFixed(2)}% ({selectedExchange.testing_method})</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Fine Gold (24K Equiv):</span>
                  <span className="font-medium">{selectedExchange.net_fine_wt_g.toFixed(3)} g</span>
                </div>
                <div className="flex justify-between">
                  <span>Applied Scrap Buy Rate:</span>
                  <span>₹ {selectedExchange.scrap_rate_per_g.toLocaleString('en-IN')}/g</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200 text-sm font-medium text-emerald-800">
                  <span>Adjusted Credit Value:</span>
                  <span>₹ {selectedExchange.credit_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-[10px] text-neutral-500 pt-1">
                  <span>Offset into Invoice:</span>
                  <span>{selectedExchange.linked_bill_no}</span>
                </div>
              </div>

              <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded text-[10px] text-neutral-500 text-center leading-relaxed">
                * Customer signature confirms acceptance of weight deductions and purity assessment before melting.
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#e5e7eb] bg-[#f8fafc] flex justify-end gap-2">
              <button
                onClick={() => setIsSlipModalOpen(false)}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
