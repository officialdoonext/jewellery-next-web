'use client';

import React, { useState, useMemo } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Receipt,
  Scale,
  Barcode,
  Plus,
  Trash2,
  Printer,
  PauseCircle,
  Sparkles,
  Coins,
  ShieldCheck,
  User,
  Wallet,
  X,
  BadgeIndianRupee,
} from 'lucide-react';

interface BillItem {
  id: string;
  tag_number: string;
  huid_code: string;
  ornament_name: string;
  category: string;
  purity: string;
  gross_weight_g: number;
  stone_weight_g: number;
  net_weight_g: number;
  gold_rate_per_g: number;
  metal_value: number;
  making_charge_type: 'PER_GRAM' | 'PERCENTAGE';
  making_charge_rate: number;
  making_charges: number;
  gst_rate: number;
  gst_amount: number;
  line_total: number;
}

interface PosInvoiceRecord {
  id: string;
  bill_no: string;
  customer_name: string;
  customer_phone: string;
  items_count: number;
  gross_weight_g: number;
  net_weight_g: number;
  gold_rate_per_g: number;
  making_charges: number;
  taxable_value: number;
  gst_amount: number;
  grand_total: number;
  payment_method: string;
  payment_status: 'PAID' | 'PARTIAL' | 'HELD';
  created_at: string;
}

const INITIAL_POS_INVOICES: PosInvoiceRecord[] = [
  {
    id: '4a1b8c2d-9101-4efa-a01e-0129a8fbc001',
    bill_no: 'POS-2026-1042',
    customer_name: 'Priya Sharma',
    customer_phone: '+91 98451 22910',
    items_count: 2,
    gross_weight_g: 24.650,
    net_weight_g: 23.200,
    gold_rate_per_g: 7850.00,
    making_charges: 18560.00,
    taxable_value: 200680.00,
    gst_amount: 6020.40,
    grand_total: 206700.00,
    payment_method: 'UPI + Old Gold',
    payment_status: 'PAID',
    created_at: '2026-10-31 10:42 AM',
  },
  {
    id: '8f3e2b1c-7722-4bb3-bc54-5231a7efd002',
    bill_no: 'POS-2026-1043',
    customer_name: 'Rajesh Varma',
    customer_phone: '+91 94401 88320',
    items_count: 3,
    gross_weight_g: 48.120,
    net_weight_g: 46.800,
    gold_rate_per_g: 7850.00,
    making_charges: 37440.00,
    taxable_value: 404820.00,
    gst_amount: 12144.60,
    grand_total: 416965.00,
    payment_method: 'Credit Card',
    payment_status: 'PAID',
    created_at: '2026-10-31 11:05 AM',
  },
  {
    id: '1c9a6f4e-3341-48cc-9812-7482b6eda003',
    bill_no: 'POS-2026-1044',
    customer_name: 'Ananya Reddy',
    customer_phone: '+91 99882 12390',
    items_count: 1,
    gross_weight_g: 12.300,
    net_weight_g: 11.850,
    gold_rate_per_g: 7850.00,
    making_charges: 9480.00,
    taxable_value: 102502.50,
    gst_amount: 3075.08,
    grand_total: 105578.00,
    payment_method: 'Advance Deposit',
    payment_status: 'PARTIAL',
    created_at: '2026-10-31 11:18 AM',
  },
  {
    id: '5e7a9b0c-1234-45aa-89bb-0912bcde0004',
    bill_no: 'POS-2026-1045',
    customer_name: 'M. K. Swaminathan',
    customer_phone: '+91 97110 33451',
    items_count: 4,
    gross_weight_g: 64.800,
    net_weight_g: 62.500,
    gold_rate_per_g: 7850.00,
    making_charges: 53125.00,
    taxable_value: 543750.00,
    gst_amount: 16312.50,
    grand_total: 560062.00,
    payment_method: 'Cash + Card',
    payment_status: 'PAID',
    created_at: '2026-10-31 11:32 AM',
  },
];

const PRESET_INVENTORY_ITEMS = [
  {
    tag: 'TAG-G-8910',
    huid: 'HD9128',
    name: '22K Temple Antique Choker',
    category: 'Necklace',
    purity: '22K (916)',
    gross: 24.650,
    stone: 1.450,
    defaultMakingType: 'PER_GRAM' as const,
    defaultMakingRate: 800,
  },
  {
    tag: 'TAG-G-7104',
    huid: 'KL72P3',
    name: 'Traditional Peacock Jhumkas',
    category: 'Earrings',
    purity: '22K (916)',
    gross: 18.600,
    stone: 0.800,
    defaultMakingType: 'PER_GRAM' as const,
    defaultMakingRate: 750,
  },
  {
    tag: 'TAG-G-6201',
    huid: 'MN51X2',
    name: 'Handcrafted Calcutta Bangles (Pair)',
    category: 'Bangles',
    purity: '22K (916)',
    gross: 36.450,
    stone: 0.000,
    defaultMakingType: 'PERCENTAGE' as const,
    defaultMakingRate: 11.5,
  },
  {
    tag: 'TAG-D-4512',
    huid: 'DF81H9',
    name: 'Solitaire Diamond Ring (VVS1)',
    category: 'Rings',
    purity: '18K (750)',
    gross: 5.420,
    stone: 0.300,
    defaultMakingType: 'PER_GRAM' as const,
    defaultMakingRate: 1200,
  },
];

export function SalesBillingPosView() {
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [invoices, setInvoices] = useState<PosInvoiceRecord[]>(INITIAL_POS_INVOICES);

  // Counter Billing Session State
  const [customerName, setCustomerName] = useState('Priya Sharma');
  const [customerPhone, setCustomerPhone] = useState('+91 98451 22910');
  const [activeKaratRate, setActiveKaratRate] = useState<number>(7850);
  const [selectedKarat, setSelectedKarat] = useState<string>('22K (916)');

  // Scale Reader state
  const [scaleWeight, setScaleWeight] = useState<number>(24.650);

  // Tag Entry inputs
  const [searchTag, setSearchTag] = useState('TAG-G-8910');
  const [itemName, setItemName] = useState('22K Temple Antique Choker');
  const [huidCode, setHuidCode] = useState('HD9128');
  const [itemCategory, setItemCategory] = useState('Necklace');
  const [grossWeight, setGrossWeight] = useState('24.650');
  const [stoneWeight, setStoneWeight] = useState('1.450');
  const [makingType, setMakingType] = useState<'PER_GRAM' | 'PERCENTAGE'>('PER_GRAM');
  const [makingRate, setMakingRate] = useState('800');

  // Active Bill Cart Items
  const [billItems, setBillItems] = useState<BillItem[]>([
    {
      id: 'item-101',
      tag_number: 'TAG-G-8910',
      huid_code: 'HD9128',
      ornament_name: '22K Temple Antique Choker',
      category: 'Necklace',
      purity: '22K (916)',
      gross_weight_g: 24.650,
      stone_weight_g: 1.450,
      net_weight_g: 23.200,
      gold_rate_per_g: 7850.00,
      metal_value: 182120.00,
      making_charge_type: 'PER_GRAM',
      making_charge_rate: 800,
      making_charges: 18560.00,
      gst_rate: 3,
      gst_amount: 6020.40,
      line_total: 206700.40,
    },
  ]);

  // Payment Drawer / Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [lastCompletedBill, setLastCompletedBill] = useState<PosInvoiceRecord | null>(null);

  // Payment breakdown states
  const [cashAmount, setCashAmount] = useState<string>('50000');
  const [upiAmount, setUpiAmount] = useState<string>('100000');
  const [cardAmount, setCardAmount] = useState<string>('0');
  const [oldGoldCredit, setOldGoldCredit] = useState<string>('56700');
  const [advanceOffset, setAdvanceOffset] = useState<string>('0');

  // Rates lookup
  const karatRatesMap: Record<string, number> = {
    '24K (999)': 8120,
    '22K (916)': 7850,
    '18K (750)': 6420,
    '14K (585)': 5010,
    'Silver 999': 98.5,
  };

  const handleKaratChange = (karat: string) => {
    setSelectedKarat(karat);
    setActiveKaratRate(karatRatesMap[karat] || 7850);
  };

  const handleQuickLookup = (tagCode: string) => {
    setSearchTag(tagCode);
    const found = PRESET_INVENTORY_ITEMS.find((i) => i.tag.toLowerCase() === tagCode.toLowerCase());
    if (found) {
      setItemName(found.name);
      setHuidCode(found.huid);
      setItemCategory(found.category);
      setSelectedKarat(found.purity);
      setActiveKaratRate(karatRatesMap[found.purity] || 7850);
      setGrossWeight(found.gross.toFixed(3));
      setStoneWeight(found.stone.toFixed(3));
      setMakingType(found.defaultMakingType);
      setMakingRate(found.defaultMakingRate.toString());
      setScaleWeight(found.gross);
    }
  };

  // Add Item to Bill
  const handleAddItem = () => {
    const gross = parseFloat(grossWeight) || 0;
    const stone = parseFloat(stoneWeight) || 0;
    const net = Math.max(0, gross - stone);
    const metalVal = net * activeKaratRate;
    const mkRate = parseFloat(makingRate) || 0;
    const mkTotal = makingType === 'PER_GRAM' ? net * mkRate : (metalVal * mkRate) / 100;
    const taxable = metalVal + mkTotal;
    const gst = (taxable * 3) / 100;
    const total = taxable + gst;

    const newItem: BillItem = {
      id: `item-${billItems.length + 1}-${searchTag}`,
      tag_number: searchTag || `TAG-G-8920`,
      huid_code: huidCode || 'HD9128',
      ornament_name: itemName || 'Gold Ornament',
      category: itemCategory,
      purity: selectedKarat,
      gross_weight_g: gross,
      stone_weight_g: stone,
      net_weight_g: net,
      gold_rate_per_g: activeKaratRate,
      metal_value: metalVal,
      making_charge_type: makingType,
      making_charge_rate: mkRate,
      making_charges: mkTotal,
      gst_rate: 3,
      gst_amount: gst,
      line_total: total,
    };

    setBillItems([...billItems, newItem]);
    setSearchTag('');
    setItemName('');
    setGrossWeight('');
    setStoneWeight('0.000');
  };

  const handleRemoveItem = (id: string) => {
    setBillItems(billItems.filter((item) => item.id !== id));
  };

  // Bill Totals Calculations
  const billSummary = useMemo(() => {
    const totalGross = billItems.reduce((acc, i) => acc + i.gross_weight_g, 0);
    const totalNet = billItems.reduce((acc, i) => acc + i.net_weight_g, 0);
    const totalMetalVal = billItems.reduce((acc, i) => acc + i.metal_value, 0);
    const totalMaking = billItems.reduce((acc, i) => acc + i.making_charges, 0);
    const taxable = totalMetalVal + totalMaking;
    const totalGst = (taxable * 3) / 100;
    const cgst = totalGst / 2;
    const sgst = totalGst / 2;
    const rawGrandTotal = taxable + totalGst;
    const grandTotal = Math.round(rawGrandTotal);
    const roundOff = grandTotal - rawGrandTotal;

    return {
      totalGross,
      totalNet,
      totalMetalVal,
      totalMaking,
      taxable,
      totalGst,
      cgst,
      sgst,
      roundOff,
      grandTotal,
    };
  }, [billItems]);

  // Payment Balance Calculation
  const totalPaid =
    (parseFloat(cashAmount) || 0) +
    (parseFloat(upiAmount) || 0) +
    (parseFloat(cardAmount) || 0) +
    (parseFloat(oldGoldCredit) || 0) +
    (parseFloat(advanceOffset) || 0);

  const balanceRemaining = billSummary.grandTotal - totalPaid;

  const handleCompleteBill = () => {
    const newBillNo = `POS-2026-${1046 + invoices.length}`;
    const newInvoice: PosInvoiceRecord = {
      id: `inv-${invoices.length + 1}-${newBillNo}`,
      bill_no: newBillNo,
      customer_name: customerName || 'Walk-in Guest',
      customer_phone: customerPhone || '+91 99999 00000',
      items_count: billItems.length,
      gross_weight_g: billSummary.totalGross,
      net_weight_g: billSummary.totalNet,
      gold_rate_per_g: activeKaratRate,
      making_charges: billSummary.totalMaking,
      taxable_value: billSummary.taxable,
      gst_amount: billSummary.totalGst,
      grand_total: billSummary.grandTotal,
      payment_method:
        totalPaid >= billSummary.grandTotal ? 'Split Payment (UPI/Cash/Exch)' : 'Partially Paid',
      payment_status: totalPaid >= billSummary.grandTotal ? 'PAID' : 'PARTIAL',
      created_at: 'Just now',
    };

    setInvoices([newInvoice, ...invoices]);
    setLastCompletedBill(newInvoice);
    setIsPaymentModalOpen(false);
    setIsPrintModalOpen(true);
  };

  const handleParkBill = () => {
    if (billItems.length === 0) return;
    alert(`Bill parked for customer "${customerName}". You can resume it from the Held Bills tab.`);
    setBillItems([]);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="sales_pos_billing" />
      <ActionToolbar
        filterPlaceholder="Filter by bill #, customer, HUID, tag..."
        insertLabel="New POS Bill"
        onInsertClick={() => {
          setBillItems([]);
          setCustomerName('Priya Sharma');
        }}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics Summary Cards */}
        <div className="p-4 sm:p-5 border-b border-[#e5e7eb] bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Today&apos;s Sales</span>
                <BadgeIndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">₹ 38,40,900</div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                +14.2% vs yesterday
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Bills Generated</span>
                <Receipt className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">48 Invoices</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Counter 1: 28 • Counter 2: 20
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Gold Sold</span>
                <Coins className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">489.120 g</div>
              <div className="text-[11px] text-amber-700 mt-1 font-mono">
                22K: 442.100g • 18K: 47.020g
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Avg Bill Value</span>
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-xl font-medium text-neutral-900">₹ 80,018</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                Highest: ₹ 4,20,000
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider">Connected Scale</span>
                <Scale className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-medium text-emerald-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Essae DS-852
              </div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                COM3: 9600 Baud • Stabilized
              </div>
            </div>
          </div>
        </div>

        {/* Live Counter POS Billing Interface */}
        <div className="p-4 sm:p-5 flex flex-col lg:flex-row gap-5">
          {/* Left: Active Bill Entry & Item Scanner Form */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Header: Customer & Metal Rate Bar */}
            <div className="p-4 rounded-lg bg-white border border-[#e2e8f0] shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-neutral-800 uppercase tracking-wide">
                    Customer Lookup & Rate Lock
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-neutral-500 font-mono">Terminal:</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-100 text-neutral-700 border border-neutral-200">
                    COUNTER-01 (Suresh K.)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Customer Name / Phone
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Mobile (+91)
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98451 22910"
                    className="w-full px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Active Metal Karat & Rate
                  </label>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={selectedKarat}
                      onChange={(e) => handleKaratChange(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-medium cursor-pointer"
                    >
                      <option value="22K (916)">22K (916) - ₹ 7,850/g</option>
                      <option value="24K (999)">24K (999) - ₹ 8,120/g</option>
                      <option value="18K (750)">18K (750) - ₹ 6,420/g</option>
                      <option value="14K (585)">14K (585) - ₹ 5,010/g</option>
                      <option value="Silver 999">Silver 999 - ₹ 98.50/g</option>
                    </select>
                    <span className="px-2 py-1.5 rounded text-xs font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
                      ₹ {activeKaratRate.toLocaleString('en-IN')}/g
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fast Item Scanner & Weighing Scale Sync Box */}
            <div className="p-4 rounded-lg bg-white border border-[#e2e8f0] shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9] mb-3">
                <div className="flex items-center gap-2">
                  <Barcode className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-neutral-800 uppercase tracking-wide">
                    Fast Item Tag Scanner & Scale Reader
                  </span>
                </div>

                {/* Digital Scale Badge with Tare */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono">
                    <Scale className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Live Scale:</span>
                    <span className="font-medium">{scaleWeight.toFixed(3)} g</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <button
                    onClick={() => {
                      setGrossWeight(scaleWeight.toFixed(3));
                    }}
                    className="px-2 py-1 rounded text-[11px] font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300 transition-colors cursor-pointer"
                    title="Transfer scale weight to gross weight"
                  >
                    Sync Scale
                  </button>
                  <button
                    onClick={() => setScaleWeight(0.0)}
                    className="px-2 py-1 rounded text-[11px] font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300 transition-colors cursor-pointer"
                  >
                    Tare
                  </button>
                </div>
              </div>

              {/* Tag Quick Selector Pills */}
              <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs">
                <span className="text-[11px] text-neutral-400 font-mono">Quick Tags:</span>
                {PRESET_INVENTORY_ITEMS.map((item) => (
                  <button
                    key={item.tag}
                    onClick={() => handleQuickLookup(item.tag)}
                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-neutral-700 border border-neutral-200 transition-colors cursor-pointer"
                  >
                    {item.tag} ({item.name.slice(0, 14)}...)
                  </button>
                ))}
              </div>

              {/* Inputs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                <div className="col-span-2">
                  <label className="text-[11px] font-medium text-neutral-600 mb-1 block">
                    Tag Barcode / RFID
                  </label>
                  <input
                    type="text"
                    value={searchTag}
                    onChange={(e) => setSearchTag(e.target.value)}
                    placeholder="e.g. TAG-G-8910"
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[11px] font-medium text-neutral-600 mb-1 block">
                    Ornament Name
                  </label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. 22K Temple Antique Choker"
                    className="w-full px-2.5 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-neutral-600 mb-1 block">
                    HUID Code
                  </label>
                  <input
                    type="text"
                    value={huidCode}
                    onChange={(e) => setHuidCode(e.target.value.toUpperCase())}
                    placeholder="HD9128"
                    className="w-full px-2 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-neutral-600 mb-1 block">
                    Gross Wt (g)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(e.target.value)}
                    placeholder="24.650"
                    className="w-full px-2 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-right font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-neutral-600 mb-1 block">
                    Stone Wt (g)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={stoneWeight}
                    onChange={(e) => setStoneWeight(e.target.value)}
                    placeholder="1.450"
                    className="w-full px-2 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-right"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-neutral-600 mb-1 block">
                    Net Gold Wt (g)
                  </label>
                  <div className="w-full px-2 py-1.5 text-xs font-mono bg-[#f8fafc] border border-[#e2e8f0] rounded-md text-right font-medium text-emerald-800">
                    {Math.max(0, (parseFloat(grossWeight) || 0) - (parseFloat(stoneWeight) || 0)).toFixed(3)} g
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-neutral-600 mb-1 block">
                    Making Type
                  </label>
                  <select
                    value={makingType}
                    onChange={(e) => setMakingType(e.target.value as 'PER_GRAM' | 'PERCENTAGE')}
                    className="w-full px-2 py-1.5 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="PER_GRAM">Per Gram (₹)</option>
                    <option value="PERCENTAGE">% of Gold</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-neutral-600 mb-1 block">
                    Making Rate {makingType === 'PER_GRAM' ? '(₹/g)' : '(%)'}
                  </label>
                  <input
                    type="number"
                    value={makingRate}
                    onChange={(e) => setMakingRate(e.target.value)}
                    placeholder="800"
                    className="w-full px-2 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-right"
                  />
                </div>

                <div className="col-span-2 flex items-end">
                  <button
                    onClick={handleAddItem}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer h-[32px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item to Bill (Enter)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Active Counter Bill Items Table */}
            <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-2xs overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <span className="font-mono font-medium text-neutral-800">
                    Active Bill Items ({billItems.length})
                  </span>
                </div>
                <div className="flex items-center gap-3 text-neutral-500 text-[11px]">
                  <span>Total Gross: <strong className="font-medium text-neutral-800 font-mono">{billSummary.totalGross.toFixed(3)} g</strong></span>
                  <span>Total Net: <strong className="font-medium text-neutral-800 font-mono">{billSummary.totalNet.toFixed(3)} g</strong></span>
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#fcfcfc] border-b border-[#e5e7eb] text-neutral-600 font-mono text-[11px]">
                      <th className="px-3 py-2 border-r border-[#e5e7eb]">#</th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb]">Tag / HUID</th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb]">Ornament & Purity</th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] text-right">Gross (g)</th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] text-right">Net Wt (g)</th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] text-right">Rate (₹/g)</th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] text-right">Making Chg</th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] text-right">3% GST</th>
                      <th className="px-3 py-2 border-r border-[#e5e7eb] text-right">Line Total (₹)</th>
                      <th className="px-2 py-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {billItems.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-8 text-center text-neutral-400">
                          Scan a tag or select a quick item above to start billing.
                        </td>
                      </tr>
                    ) : (
                      billItems.map((item, index) => (
                        <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="px-3 py-2 border-r border-[#e5e7eb] text-neutral-400 font-mono text-[11px]">
                            {index + 1}
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] font-mono text-[11px] whitespace-nowrap">
                            <span className="font-medium text-neutral-800">{item.tag_number}</span>
                            <span className="text-neutral-400 ml-1.5">[{item.huid_code}]</span>
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                            <div className="font-medium text-neutral-800">{item.ornament_name}</div>
                            <span className="text-[10px] text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                              {item.purity}
                            </span>
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] font-mono text-right text-neutral-700">
                            {item.gross_weight_g.toFixed(3)}
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] font-mono text-right font-medium text-emerald-800">
                            {item.net_weight_g.toFixed(3)}
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] font-mono text-right text-neutral-600">
                            ₹ {item.gold_rate_per_g.toLocaleString('en-IN')}
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] font-mono text-right text-neutral-700">
                            ₹ {Math.round(item.making_charges).toLocaleString('en-IN')}
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] font-mono text-right text-neutral-500">
                            ₹ {item.gst_amount.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 border-r border-[#e5e7eb] font-mono text-right font-medium text-neutral-900">
                            ₹ {Math.round(item.line_total).toLocaleString('en-IN')}
                          </td>
                          <td className="px-2 py-2 text-center">
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: Real-time Invoice Breakdown & Multi-Payment Splitter */}
          <div className="w-full lg:w-96 flex flex-col gap-4">
            <div className="p-4 rounded-lg bg-white border border-[#e2e8f0] shadow-2xs flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9] mb-3">
                <span className="text-xs font-medium text-neutral-800 uppercase tracking-wide flex items-center gap-1.5">
                  <BadgeIndianRupee className="w-4 h-4 text-emerald-600" />
                  Bill Calculation Summary
                </span>
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  GST 3% Applicable
                </span>
              </div>

              {/* Subtotal Items */}
              <div className="space-y-2 text-xs py-2">
                <div className="flex justify-between text-neutral-600">
                  <span>Gross Gold Value:</span>
                  <span className="font-mono text-neutral-800">
                    ₹ {Math.round(billSummary.totalMetalVal).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Craftsmanship / Making:</span>
                  <span className="font-mono text-neutral-800">
                    ₹ {Math.round(billSummary.totalMaking).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between font-medium text-neutral-800 pt-1 border-t border-[#f1f5f9]">
                  <span>Taxable Value:</span>
                  <span className="font-mono">
                    ₹ {Math.round(billSummary.taxable).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600 text-[11px]">
                  <span>CGST (1.5%):</span>
                  <span className="font-mono">₹ {billSummary.cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-600 text-[11px]">
                  <span>SGST (1.5%):</span>
                  <span className="font-mono">₹ {billSummary.sgst.toFixed(2)}</span>
                </div>
                {billSummary.roundOff !== 0 && (
                  <div className="flex justify-between text-neutral-400 text-[11px]">
                    <span>Round-off:</span>
                    <span className="font-mono">{billSummary.roundOff > 0 ? `+${billSummary.roundOff.toFixed(2)}` : billSummary.roundOff.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Grand Total Box */}
              <div className="p-3 my-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-medium text-emerald-800 uppercase tracking-wider">
                    Total Payable Amount
                  </div>
                  <div className="text-2xl font-medium text-emerald-900 font-mono">
                    ₹ {billSummary.grandTotal.toLocaleString('en-IN')}
                  </div>
                </div>
                <ShieldCheck className="w-8 h-8 text-emerald-600 opacity-60" />
              </div>

              {/* Fast Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={handleParkBill}
                  disabled={billItems.length === 0}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Park / Hold Bill</span>
                </button>

                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  disabled={billItems.length === 0}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Payment Split</span>
                </button>
              </div>

              <button
                onClick={handleCompleteBill}
                disabled={billItems.length === 0}
                className="w-full mt-2.5 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Complete & Print GST Invoice (F10)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Supabase-style Data Table with Data & Definition tabs */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-2xs overflow-hidden flex flex-col flex-1">
            <div className="px-4 py-2.5 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-medium text-neutral-800">
                  pos_invoices
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">
                  Showing {invoices.length} recent counter bills
                </span>
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
                    <tr className="bg-[#fcfcfc] border-b border-[#e5e7eb] text-neutral-600 font-mono text-[12px]">
                      <th className="w-10 px-3 py-2 border-r border-[#e5e7eb] text-center">
                        <input
                          type="checkbox"
                          className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                        />
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">bill_no</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">customer_name</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">gross_wt</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">net_wt</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">rate_per_g</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">making_charges</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">gst_amount</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">grand_total</span>
                      </th>
                      <th className="px-3.5 py-2 border-r border-[#e5e7eb] font-medium whitespace-nowrap">
                        <span className="text-neutral-800">payment_status</span>
                      </th>
                      <th className="px-3.5 py-2 font-medium whitespace-nowrap text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="w-10 px-3 py-2 border-r border-[#e5e7eb] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-0"
                          />
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-[11px]">
                          <span className="font-medium text-emerald-700 hover:underline cursor-pointer">
                            {inv.bill_no}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-medium text-neutral-800">
                          <div>{inv.customer_name}</div>
                          <div className="text-[10px] text-neutral-400 font-normal">{inv.customer_phone}</div>
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-neutral-700">
                          {inv.gross_weight_g.toFixed(3)} g
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono font-medium text-neutral-900">
                          {inv.net_weight_g.toFixed(3)} g
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-neutral-700">
                          ₹ {inv.gold_rate_per_g.toLocaleString('en-IN')}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-neutral-700">
                          ₹ {Math.round(inv.making_charges).toLocaleString('en-IN')}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-neutral-500">
                          ₹ {inv.gst_amount.toFixed(2)}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap font-mono font-medium text-neutral-900">
                          ₹ {inv.grand_total.toLocaleString('en-IN')}
                        </td>
                        <td className="px-3.5 py-2 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              inv.payment_status === 'PAID'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {inv.payment_status}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 whitespace-nowrap text-center">
                          <button
                            onClick={() => {
                              setLastCompletedBill(inv);
                              setIsPrintModalOpen(true);
                            }}
                            className="p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Print GST Invoice"
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
                  <span className="text-emerald-400">CREATE TABLE</span> public.pos_invoices (
                  <br />
                  <span className="pl-6 text-blue-300">id</span>{' '}
                  <span className="text-amber-300">uuid</span>{' '}
                  <span className="text-neutral-400">DEFAULT gen_random_uuid() PRIMARY KEY,</span>
                  <br />
                  <span className="pl-6 text-blue-300">bill_no</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">UNIQUE NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">customer_name</span>{' '}
                  <span className="text-amber-300">varchar(255)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">gross_weight_g</span>{' '}
                  <span className="text-amber-300">numeric(10,3)</span>{' '}
                  <span className="text-neutral-400">NOT NULL CHECK (gross_weight_g &gt; 0),</span>
                  <br />
                  <span className="pl-6 text-blue-300">net_weight_g</span>{' '}
                  <span className="text-amber-300">numeric(10,3)</span>{' '}
                  <span className="text-neutral-400">NOT NULL CHECK (net_weight_g &gt; 0),</span>
                  <br />
                  <span className="pl-6 text-blue-300">gold_rate_per_g</span>{' '}
                  <span className="text-amber-300">numeric(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">making_charges</span>{' '}
                  <span className="text-amber-300">numeric(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL DEFAULT 0.00,</span>
                  <br />
                  <span className="pl-6 text-blue-300">gst_amount</span>{' '}
                  <span className="text-amber-300">numeric(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">grand_total</span>{' '}
                  <span className="text-amber-300">numeric(10,2)</span>{' '}
                  <span className="text-neutral-400">NOT NULL,</span>
                  <br />
                  <span className="pl-6 text-blue-300">payment_status</span>{' '}
                  <span className="text-amber-300">varchar(32)</span>{' '}
                  <span className="text-neutral-400">DEFAULT &apos;PAID&apos;</span>
                  <br />
                  );
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Payment Splitter Drawer / Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full border border-[#e2e8f0] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">
                  Multi-Payment Splitter
                </h3>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-emerald-700">Total Invoice Amount:</div>
                  <div className="text-xl font-mono font-medium text-emerald-900">
                    ₹ {billSummary.grandTotal.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-neutral-500">Balance Remaining:</div>
                  <div className={`text-base font-mono font-medium ${balanceRemaining === 0 ? 'text-emerald-700' : balanceRemaining > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                    ₹ {balanceRemaining.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Cash Received (₹)
                    </label>
                    <input
                      type="number"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      UPI / GPay / PhonePe (₹)
                    </label>
                    <input
                      type="number"
                      value={upiAmount}
                      onChange={(e) => setUpiAmount(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Credit / Debit Card (₹)
                    </label>
                    <input
                      type="number"
                      value={cardAmount}
                      onChange={(e) => setCardAmount(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">
                      Old Gold Exchange Credit (₹)
                    </label>
                    <input
                      type="number"
                      value={oldGoldCredit}
                      onChange={(e) => setOldGoldCredit(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">
                    Customer Advance Deposit Offset (₹)
                  </label>
                  <input
                    type="number"
                    value={advanceOffset}
                    onChange={(e) => setAdvanceOffset(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-1.5 text-xs font-mono border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-end gap-2">
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteBill}
                className="px-4 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
              >
                Confirm Payment & Generate Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tax Invoice Preview & Print Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full border border-[#e2e8f0] overflow-hidden my-8">
            <div className="px-5 py-3.5 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-medium text-neutral-900">
                  GST Tax Invoice Receipt Preview
                </h3>
              </div>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 font-mono text-xs text-neutral-800 space-y-4">
              <div className="text-center pb-3 border-b border-dashed border-neutral-300">
                <div className="text-base font-medium tracking-wider text-neutral-900">
                  SRI LAKSHMI JEWELLERS & DIAMONDS
                </div>
                <div className="text-[11px] text-neutral-600">
                  Plot 14, Pot Market, Secunderabad, Telangana - 500003
                </div>
                <div className="text-[11px] text-neutral-600">
                  GSTIN: 36AAACL8912P1ZS • BIS Hallmark Lic: HM/L-9120849
                </div>
                <div className="text-[12px] font-medium text-emerald-700 mt-1">
                  TAX INVOICE (RETAIL COUNTER SALE)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pb-2 border-b border-dashed border-neutral-300">
                <div>
                  <div>Invoice #: <strong>{lastCompletedBill?.bill_no || 'POS-2026-1046'}</strong></div>
                  <div>Date: <strong>31-Oct-2026 11:45 AM</strong></div>
                  <div>Billed by: <strong>Terminal 01 (Suresh K.)</strong></div>
                </div>
                <div className="text-right">
                  <div>Customer: <strong>{customerName}</strong></div>
                  <div>Phone: <strong>{customerPhone}</strong></div>
                  <div>Place of Supply: <strong>Telangana (36)</strong></div>
                </div>
              </div>

              <div className="space-y-1.5 py-1">
                <div className="grid grid-cols-12 text-[11px] font-medium text-neutral-600 pb-1 border-b border-neutral-200">
                  <div className="col-span-5">Ornament / HUID</div>
                  <div className="col-span-2 text-right">Net Wt</div>
                  <div className="col-span-2 text-right">Rate/g</div>
                  <div className="col-span-3 text-right">Total (₹)</div>
                </div>

                {billItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 text-[11px] py-0.5">
                    <div className="col-span-5">
                      {item.ornament_name}
                      <span className="block text-[10px] text-neutral-400">HUID: {item.huid_code}</span>
                    </div>
                    <div className="col-span-2 text-right">{item.net_weight_g.toFixed(3)}g</div>
                    <div className="col-span-2 text-right">₹{item.gold_rate_per_g}</div>
                    <div className="col-span-3 text-right">₹{Math.round(item.line_total).toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-dashed border-neutral-300 space-y-1 text-right text-[11px]">
                <div>Taxable Value: ₹ {Math.round(billSummary.taxable).toLocaleString('en-IN')}</div>
                <div>CGST @ 1.5%: ₹ {billSummary.cgst.toFixed(2)}</div>
                <div>SGST @ 1.5%: ₹ {billSummary.sgst.toFixed(2)}</div>
                <div className="text-sm font-medium text-neutral-900 pt-1 border-t border-neutral-300">
                  Grand Total: ₹ {billSummary.grandTotal.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="pt-3 border-t border-dashed border-neutral-300 text-[10px] text-neutral-500 leading-relaxed">
                * All jewellery hallmarked by Bureau of Indian Standards (BIS).<br />
                * Old gold valuation is strictly based on touchstone & XRF spectrometer testing.<br />
                * Goods once sold can be exchanged within 7 days with original invoice tag.
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between">
              <span className="text-[11px] text-neutral-500 font-mono">
                Supports A4 Laser & 3-Inch Thermal
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
