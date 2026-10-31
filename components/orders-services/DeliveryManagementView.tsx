'use client';

import React, { useState, useMemo } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Truck,
  Shield,
  ShieldCheck,
  KeyRound,
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Search,
  Filter,
  Eye,
  Check,
  MapPin,
  Lock,
  Phone,
  DollarSign,
  QrCode,
  Sparkles,
} from 'lucide-react';

interface SecureDeliveryShipment {
  id: string;
  shipment_id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  destination_city: string;
  linked_order_code: string;
  courier_service: 'BVC Logistics Armored' | 'Sequel Secure Logistics' | 'In-House Armed Escort' | 'Brinks Global';
  insurance_policy_no: string;
  declared_value: number;
  tamper_seal_no: string;
  custodian_name: string;
  custodian_contact: string;
  expected_delivery_date: string;
  delivery_otp: string; // 6-digit OTP
  delivery_status: 'MANIFEST_CREATED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED_OTP_VERIFIED';
  verified_at?: string;
  delivery_notes?: string;
}

const INITIAL_SHIPMENTS: SecureDeliveryShipment[] = [
  {
    id: 'shp-01',
    shipment_id: 'SHP-2026-041',
    customer_name: 'Tanvi Agarwal',
    customer_phone: '+91 98201 44521',
    delivery_address: 'Apartment 14B, Oberoi Sky Heights, Lokhandwala, Andheri West',
    destination_city: 'Mumbai',
    linked_order_code: 'BESPOKE-104',
    courier_service: 'BVC Logistics Armored',
    insurance_policy_no: 'POL-JWL-9812',
    declared_value: 850000,
    tamper_seal_no: 'SEAL-BVC-88412',
    custodian_name: 'Inspector Vikram Salve',
    custodian_contact: '+91 99200 11982',
    expected_delivery_date: '2026-10-31',
    delivery_otp: '582914',
    delivery_status: 'OUT_FOR_DELIVERY',
    delivery_notes: 'Armored van en route with armed escort. Security seal verified at depot.',
  },
  {
    id: 'shp-02',
    shipment_id: 'SHP-2026-042',
    customer_name: 'Meera Nambiar',
    customer_phone: '+91 98402 78192',
    delivery_address: '42 Boat Club Road, R.A. Puram',
    destination_city: 'Chennai',
    linked_order_code: 'BESPOKE-105',
    courier_service: 'Sequel Secure Logistics',
    insurance_policy_no: 'POL-JWL-9814',
    declared_value: 1240000,
    tamper_seal_no: 'SEAL-SQL-44910',
    custodian_name: 'Senthil Kumar (Sequel Lead)',
    custodian_contact: '+91 98410 77291',
    expected_delivery_date: '2026-11-02',
    delivery_otp: '739104',
    delivery_status: 'IN_TRANSIT',
    delivery_notes: 'Air transit locked container on Indigo 6E-401.',
  },
  {
    id: 'shp-03',
    shipment_id: 'SHP-2026-043',
    customer_name: 'Kavita Reddy',
    customer_phone: '+91 99081 22345',
    delivery_address: 'Villa 18, Jubilee Hills Road No. 36',
    destination_city: 'Hyderabad',
    linked_order_code: 'BESPOKE-106',
    courier_service: 'In-House Armed Escort',
    insurance_policy_no: 'POL-JWL-9815',
    declared_value: 1560000,
    tamper_seal_no: 'SEAL-INH-11209',
    custodian_name: 'Major Raghavendra (Retd)',
    custodian_contact: '+91 99080 33419',
    expected_delivery_date: '2026-11-03',
    delivery_otp: '284719',
    delivery_status: 'MANIFEST_CREATED',
    delivery_notes: 'Armored vault box secured in store strongroom awaiting dispatch.',
  },
  {
    id: 'shp-04',
    shipment_id: 'SHP-2026-039',
    customer_name: 'Ananya Joshi',
    customer_phone: '+91 97654 31209',
    delivery_address: '12 Prabhat Road, Lane 5, Deccan Gymkhana',
    destination_city: 'Pune',
    linked_order_code: 'BESPOKE-107',
    courier_service: 'BVC Logistics Armored',
    insurance_policy_no: 'POL-JWL-9801',
    declared_value: 510000,
    tamper_seal_no: 'SEAL-BVC-88390',
    custodian_name: 'Sunil Jadhav',
    custodian_contact: '+91 97650 44102',
    expected_delivery_date: '2026-10-31',
    delivery_otp: '419208',
    delivery_status: 'DELIVERED_OTP_VERIFIED',
    verified_at: '2026-10-31 14:22',
    delivery_notes: 'OTP verified by patron Ananya Joshi. Handover completed without damage.',
  },
];

export function OrdersDeliveryManagementView() {
  const [shipments, setShipments] = useState<SecureDeliveryShipment[]>(INITIAL_SHIPMENTS);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isNewShipmentOpen, setIsNewShipmentOpen] = useState(false);
  const [otpModalShipment, setOtpModalShipment] = useState<SecureDeliveryShipment | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState(false);

  // Form State
  const [formShipmentId, setFormShipmentId] = useState(`SHP-2026-0${shipments.length + 41}`);
  const [formCustomerName, setFormCustomerName] = useState('Dr. Sunita Rao');
  const [formCustomerPhone, setFormCustomerPhone] = useState('+91 94480 11234');
  const [formDeliveryAddress, setFormDeliveryAddress] = useState('74 Palace Orchard, Sadashivnagar, Bengaluru 560080');
  const [formDestinationCity, setFormDestinationCity] = useState('Bengaluru');
  const [formLinkedOrder, setFormLinkedOrder] = useState('BESPOKE-108');
  const [formCourier, setFormCourier] = useState<SecureDeliveryShipment['courier_service']>('BVC Logistics Armored');
  const [formInsurancePolicy, setFormInsurancePolicy] = useState('POL-JWL-9820');
  const [formDeclaredValue, setFormDeclaredValue] = useState('980000');
  const [formSealNo, setFormSealNo] = useState(`SEAL-BVC-${Math.floor(10000 + Math.random() * 90000)}`);
  const [formCustodianName, setFormCustodianName] = useState('Inspector M. Gowda');
  const [formCustodianContact, setFormCustodianContact] = useState('+91 94481 99201');
  const [formExpectedDate, setFormExpectedDate] = useState('2026-11-04');
  const [formDeliveryOtp, setFormDeliveryOtp] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
  const [formNotes, setFormNotes] = useState('Dual security seal verified. Armored escort assigned.');

  const regenerateOtp = () => {
    setFormDeliveryOtp(Math.floor(100000 + Math.random() * 900000).toString());
  };

  const handleCreateShipment = (e: React.FormEvent) => {
    e.preventDefault();
    const newShp: SecureDeliveryShipment = {
      id: crypto.randomUUID ? crypto.randomUUID() : `shp-${Date.now()}`,
      shipment_id: formShipmentId,
      customer_name: formCustomerName,
      customer_phone: formCustomerPhone,
      delivery_address: formDeliveryAddress,
      destination_city: formDestinationCity,
      linked_order_code: formLinkedOrder,
      courier_service: formCourier,
      insurance_policy_no: formInsurancePolicy,
      declared_value: parseFloat(formDeclaredValue) || 100000,
      tamper_seal_no: formSealNo,
      custodian_name: formCustodianName,
      custodian_contact: formCustodianContact,
      expected_delivery_date: formExpectedDate,
      delivery_otp: formDeliveryOtp,
      delivery_status: 'MANIFEST_CREATED',
      delivery_notes: formNotes,
    };

    setShipments([newShp, ...shipments]);
    setIsNewShipmentOpen(false);
    setFormShipmentId(`SHP-2026-0${shipments.length + 42}`);
  };

  const openOtpVerificationModal = (shp: SecureDeliveryShipment) => {
    setOtpModalShipment(shp);
    setEnteredOtp('');
    setOtpError(false);
  };

  const handleVerifyOtp = () => {
    if (!otpModalShipment) return;
    if (enteredOtp.trim() === otpModalShipment.delivery_otp) {
      setShipments((prev) =>
        prev.map((s) =>
          s.id === otpModalShipment.id
            ? {
                ...s,
                delivery_status: 'DELIVERED_OTP_VERIFIED',
                verified_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
                delivery_notes: `Delivery OTP ${enteredOtp} authenticated. Digital signed receipt generated.`,
              }
            : s
        )
      );
      setOtpModalShipment(null);
    } else {
      setOtpError(true);
    }
  };

  const filteredShipments = useMemo(() => {
    return shipments.filter((shp) => {
      const matchSearch =
        shp.shipment_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shp.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shp.destination_city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shp.linked_order_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shp.insurance_policy_no.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || shp.delivery_status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [shipments, searchQuery, statusFilter]);

  const getStatusBadge = (status: SecureDeliveryShipment['delivery_status']) => {
    switch (status) {
      case 'MANIFEST_CREATED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Package className="w-3 h-3 text-blue-600" /> Manifest Created
          </span>
        );
      case 'IN_TRANSIT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Truck className="w-3 h-3 text-amber-600" /> Armored Transit
          </span>
        );
      case 'OUT_FOR_DELIVERY':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
            <KeyRound className="w-3 h-3 text-purple-600 animate-pulse" /> Out for Delivery
          </span>
        );
      case 'DELIVERED_OTP_VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> OTP Verified Delivered
          </span>
        );
      default:
        return <span className="text-neutral-500">{status}</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="secure_deliveries" />
      <ActionToolbar
        filterPlaceholder="Filter secure shipments by ID, patron, policy #, city..."
        insertLabel="Dispatch Secure Shipment"
        onInsertClick={() => setIsNewShipmentOpen(true)}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics Cards */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Active High-Value Shipments
              </span>
              <span className="p-1 rounded bg-blue-50 text-blue-600">
                <Truck className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-neutral-800 font-mono">4 Shipments</div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              Protected by tamper-evident physical seals
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Insured Transit Value
              </span>
              <span className="p-1 rounded bg-emerald-50 text-emerald-600">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-neutral-800 font-mono">₹ 48.50 Lakhs</div>
            <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
              Marine & Jewellery Comprehensive Cover
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Armored Logistics Carrier
              </span>
              <span className="p-1 rounded bg-amber-50 text-amber-600">
                <Shield className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-neutral-800 font-mono">BVC / Sequel / Brinks</div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              GPS tracked armored vault vehicles
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Delivered Today
              </span>
              <span className="p-1 rounded bg-purple-50 text-purple-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-neutral-800 font-mono">3 Packages</div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              100% patron OTP authenticated
            </div>
          </div>
        </div>

        {/* Tab & Status Controls */}
        <div className="px-4 pb-2 flex flex-wrap items-center justify-between gap-2 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('data')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'data'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-[#e2e8f0]'
              }`}
            >
              Secure Shipments ({filteredShipments.length})
            </button>
            <button
              onClick={() => setActiveTab('definition')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'definition'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-[#e2e8f0]'
              }`}
            >
              Schema Definition (DDL)
            </button>
          </div>

          {activeTab === 'data' && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-medium text-neutral-500">Status:</span>
              {['ALL', 'MANIFEST_CREATED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED_OTP_VERIFIED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white text-neutral-600 border border-[#e2e8f0] hover:bg-neutral-50'
                  }`}
                >
                  {st === 'ALL'
                    ? 'All'
                    : st === 'MANIFEST_CREATED'
                    ? 'Manifest'
                    : st === 'IN_TRANSIT'
                    ? 'In Transit'
                    : st === 'OUT_FOR_DELIVERY'
                    ? 'Out for Delivery'
                    : 'Delivered (OTP)'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Mode: Data Table */}
        {activeTab === 'data' ? (
          <div className="flex-1 p-4">
            <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-neutral-500 font-medium">
                      <th className="py-2.5 px-3 w-8 text-center border-r border-[#e5e7eb]">
                        <input type="checkbox" className="rounded border-neutral-300 text-emerald-600" />
                      </th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Shipment ID</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Patron & Destination</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Armored Courier</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Insurance Policy #</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] text-right whitespace-nowrap">Declared Value</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Tamper Box Seal</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Custodian / Driver</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Delivery Status</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap">OTP Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {filteredShipments.map((shp) => (
                      <tr key={shp.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-2.5 px-3 text-center border-r border-[#e5e7eb]">
                          <input type="checkbox" className="rounded border-neutral-300 text-emerald-600" />
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap font-mono">
                          <span className="font-medium text-emerald-700">{shp.shipment_id}</span>
                          <span className="text-[10px] text-neutral-400 block">{shp.linked_order_code}</span>
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb]">
                          <div className="font-medium text-neutral-800">{shp.customer_name}</div>
                          <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-neutral-400" />
                            <span>{shp.destination_city}</span> • <span className="font-mono">{shp.customer_phone}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">
                          <span className="font-medium text-neutral-800">{shp.courier_service}</span>
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-neutral-700">
                          {shp.insurance_policy_no}
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] text-right font-mono font-medium text-neutral-900 whitespace-nowrap">
                          ₹ {shp.declared_value.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-[11px] text-neutral-700">
                          <span className="bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                            {shp.tamper_seal_no}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700">
                          <div>{shp.custodian_name}</div>
                          <span className="text-[10px] text-neutral-400 font-mono">{shp.custodian_contact}</span>
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">
                          {getStatusBadge(shp.delivery_status)}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {shp.delivery_status === 'OUT_FOR_DELIVERY' ? (
                            <button
                              onClick={() => openOtpVerificationModal(shp)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                            >
                              <KeyRound className="w-3 h-3" />
                              <span>Verify OTP Handover</span>
                            </button>
                          ) : shp.delivery_status === 'DELIVERED_OTP_VERIFIED' ? (
                            <span className="text-[11px] text-emerald-700 font-mono">
                              Verified ✓ ({shp.verified_at?.slice(11)})
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-400 font-mono">
                              OTP: {shp.delivery_otp}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Schema Definition Tab */
          <div className="p-4 flex-1">
            <div className="bg-[#1e1e1e] text-neutral-200 p-4 rounded-lg font-mono text-xs leading-relaxed overflow-x-auto shadow-inner">
              <span className="text-emerald-400">CREATE TABLE</span> public.secure_deliveries (
              <br />
              &nbsp;&nbsp;id <span className="text-blue-400">UUID</span> PRIMARY KEY DEFAULT gen_random_uuid(),
              <br />
              &nbsp;&nbsp;shipment_id <span className="text-blue-400">VARCHAR(50)</span> UNIQUE NOT NULL,
              <br />
              &nbsp;&nbsp;customer_name <span className="text-blue-400">VARCHAR(150)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;customer_phone <span className="text-blue-400">VARCHAR(25)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;delivery_address <span className="text-blue-400">TEXT</span> NOT NULL,
              <br />
              &nbsp;&nbsp;destination_city <span className="text-blue-400">VARCHAR(100)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;linked_order_code <span className="text-blue-400">VARCHAR(50)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;courier_service <span className="text-blue-400">VARCHAR(100)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;insurance_policy_no <span className="text-blue-400">VARCHAR(100)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;declared_value <span className="text-blue-400">NUMERIC(12,2)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;tamper_seal_no <span className="text-blue-400">VARCHAR(50)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;custodian_name <span className="text-blue-400">VARCHAR(150)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;custodian_contact <span className="text-blue-400">VARCHAR(25)</span>,
              <br />
              &nbsp;&nbsp;expected_delivery_date <span className="text-blue-400">DATE</span> NOT NULL,
              <br />
              &nbsp;&nbsp;delivery_otp <span className="text-blue-400">VARCHAR(10)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;delivery_status <span className="text-blue-400">VARCHAR(50)</span> DEFAULT &apos;MANIFEST_CREATED&apos;,
              <br />
              &nbsp;&nbsp;verified_at <span className="text-blue-400">TIMESTAMPTZ</span>,
              <br />
              &nbsp;&nbsp;created_at <span className="text-blue-400">TIMESTAMPTZ</span> DEFAULT now()
              <br />
              );
            </div>
          </div>
        )}
      </div>

      {/* Verify Delivery OTP & Handover Modal */}
      {otpModalShipment && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl border border-[#e2e8f0] w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-emerald-50 text-emerald-700">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-neutral-900 uppercase tracking-wider">
                    Authenticate Delivery Handover OTP
                  </h3>
                  <span className="font-mono text-[11px] text-emerald-700">
                    {otpModalShipment.shipment_id} • {otpModalShipment.customer_name}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setOtpModalShipment(null)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Destination:</span>
                  <span className="font-medium text-neutral-800">{otpModalShipment.destination_city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Tamper Box Seal:</span>
                  <span className="font-mono font-medium text-neutral-800">{otpModalShipment.tamper_seal_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Declared Value:</span>
                  <span className="font-mono font-medium text-emerald-700">
                    ₹ {otpModalShipment.declared_value.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* OTP Input Field */}
              <div className="text-center space-y-2">
                <label className="text-xs font-medium text-neutral-700 block">
                  Enter 6-Digit Patron Handover OTP
                </label>
                <div className="flex justify-center">
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => {
                      setEnteredOtp(e.target.value);
                      setOtpError(false);
                    }}
                    placeholder="••••••"
                    className="w-48 text-center tracking-[0.5em] text-2xl font-mono px-3 py-2 border border-[#e2e8f0] rounded-md focus:outline-none focus:border-emerald-500 bg-white"
                  />
                </div>
                <span className="text-[10px] text-neutral-400 block font-mono">
                  (Test Demonstration OTP: <span className="text-neutral-600 font-medium">{otpModalShipment.delivery_otp}</span>)
                </span>
                {otpError && (
                  <p className="text-xs text-red-600 font-medium flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Incorrect OTP entered. Please recheck with patron.
                  </p>
                )}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setOtpModalShipment(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyOtp}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Validate OTP & Release Package</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Secure Shipment Drawer Modal */}
      {isNewShipmentOpen && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex justify-end z-50 animate-fadeIn">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#e2e8f0]">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-blue-50 text-blue-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-neutral-900 uppercase tracking-wider">
                    Dispatch Secure Armored Shipment
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    High-value transit insurance policy, tamper box seal & 6-digit OTP
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewShipmentOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form id="new-shipment-form" onSubmit={handleCreateShipment} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Shipment ID</label>
                  <input
                    type="text"
                    value={formShipmentId}
                    onChange={(e) => setFormShipmentId(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Linked Order / Invoice #</label>
                  <input
                    type="text"
                    value={formLinkedOrder}
                    onChange={(e) => setFormLinkedOrder(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
              </div>

              {/* Patron & Contact */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Patron Recipient Name</label>
                  <input
                    type="text"
                    value={formCustomerName}
                    onChange={(e) => setFormCustomerName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Patron Contact Phone</label>
                  <input
                    type="text"
                    value={formCustomerPhone}
                    onChange={(e) => setFormCustomerPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Full Delivery Street Address</label>
                <textarea
                  rows={2}
                  value={formDeliveryAddress}
                  onChange={(e) => setFormDeliveryAddress(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Destination City</label>
                  <input
                    type="text"
                    value={formDestinationCity}
                    onChange={(e) => setFormDestinationCity(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Armored Logistics Partner</label>
                  <select
                    value={formCourier}
                    onChange={(e) => setFormCourier(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  >
                    <option value="BVC Logistics Armored">BVC Logistics Armored</option>
                    <option value="Sequel Secure Logistics">Sequel Secure Logistics</option>
                    <option value="In-House Armed Escort">In-House Armed Escort</option>
                    <option value="Brinks Global">Brinks Global</option>
                  </select>
                </div>
              </div>

              {/* Transit Insurance & Tamper Seal */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Transit Insurance Policy #</label>
                  <input
                    type="text"
                    value={formInsurancePolicy}
                    onChange={(e) => setFormInsurancePolicy(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Declared Value (₹)</label>
                  <input
                    type="number"
                    value={formDeclaredValue}
                    onChange={(e) => setFormDeclaredValue(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Security Box Seal #</label>
                  <input
                    type="text"
                    value={formSealNo}
                    onChange={(e) => setFormSealNo(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={formExpectedDate}
                    onChange={(e) => setFormExpectedDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  />
                </div>
              </div>

              {/* Custodian & Armed Escort */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Custodian / Escort Name</label>
                  <input
                    type="text"
                    value={formCustodianName}
                    onChange={(e) => setFormCustodianName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Custodian Phone</label>
                  <input
                    type="text"
                    value={formCustodianContact}
                    onChange={(e) => setFormCustodianContact(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
              </div>

              {/* Delivery OTP Generator Box */}
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-600" /> 6-Digit Delivery Handover OTP
                  </span>
                  <button
                    type="button"
                    onClick={regenerateOtp}
                    className="text-[11px] font-medium text-emerald-700 hover:text-emerald-900 cursor-pointer"
                  >
                    Regenerate Code
                  </button>
                </div>
                <div className="flex items-center justify-between bg-white p-2.5 rounded border border-[#e2e8f0]">
                  <span className="text-xl font-mono font-medium tracking-widest text-emerald-700">
                    {formDeliveryOtp}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    Sent to patron {formCustomerPhone} on dispatch
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Transit Notes</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                />
              </div>
            </form>

            <div className="px-5 py-3 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNewShipmentOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="new-shipment-form"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Issue Manifest & Dispatch</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
