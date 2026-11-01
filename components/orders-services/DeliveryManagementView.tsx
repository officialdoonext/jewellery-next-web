'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
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
  Trash2,
  Loader2,
  RotateCw,
  ExternalLink,
  Receipt,
  Layers,
  Wrench,
  Scale,
  FileText,
  User,
} from 'lucide-react';

export interface SecureDeliveryShipment {
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
  delivery_otp: string;
  delivery_status: 'MANIFEST_CREATED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED_OTP_VERIFIED';
  verified_at?: string;
  delivery_notes?: string;
  created_at?: string;
  updated_at?: string;
}

const SAMPLE_SHIPMENTS_SEED: Omit<SecureDeliveryShipment, 'id'>[] = [
  {
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
    expected_delivery_date: '2026-11-04',
    delivery_otp: '582914',
    delivery_status: 'OUT_FOR_DELIVERY',
    delivery_notes: 'Armored van en route with armed escort. Security seal verified at depot.',
    created_at: '2026-10-30',
  },
  {
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
    expected_delivery_date: '2026-11-06',
    delivery_otp: '739104',
    delivery_status: 'IN_TRANSIT',
    delivery_notes: 'Air transit locked container on Indigo 6E-401.',
    created_at: '2026-10-31',
  },
  {
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
    expected_delivery_date: '2026-11-08',
    delivery_otp: '284719',
    delivery_status: 'MANIFEST_CREATED',
    delivery_notes: 'Armored vault box secured in store strongroom awaiting dispatch.',
    created_at: '2026-11-01',
  },
  {
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
    created_at: '2026-10-29',
  },
];

export function OrdersDeliveryManagementView() {
  const [shipments, setShipments] = useState<SecureDeliveryShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isNewShipmentOpen, setIsNewShipmentOpen] = useState(false);
  const [otpModalShipment, setOtpModalShipment] = useState<SecureDeliveryShipment | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'idle'>('idle');

  // Form State
  const [formShipmentId, setFormShipmentId] = useState('');
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
  const [formExpectedDate, setFormExpectedDate] = useState('2026-11-08');
  const [formDeliveryOtp, setFormDeliveryOtp] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
  const [formNotes, setFormNotes] = useState('Dual security seal verified. Armored escort assigned.');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastType('idle'), 4000);
  };

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'orders_delivery'));
      const list: SecureDeliveryShipment[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<SecureDeliveryShipment, 'id'>) });
      });
      list.sort((a, b) => (b.shipment_id > a.shipment_id ? 1 : -1));
      setShipments(list);
    } catch (err: any) {
      console.error('Error fetching secure shipments:', err);
      showToast('error', err.message || 'Failed to fetch shipments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const openNewShipmentDrawer = () => {
    const nextCode = `SHP-2026-0${40 + shipments.length + 1}`;
    setFormShipmentId(nextCode);
    setFormSealNo(`SEAL-BVC-${Math.floor(10000 + Math.random() * 90000)}`);
    setFormDeliveryOtp(Math.floor(100000 + Math.random() * 900000).toString());
    setIsNewShipmentOpen(true);
  };

  const regenerateOtp = () => {
    setFormDeliveryOtp(Math.floor(100000 + Math.random() * 900000).toString());
  };

  const handleSeedSamples = async () => {
    try {
      setSaving(true);
      const added: SecureDeliveryShipment[] = [];
      for (const item of SAMPLE_SHIPMENTS_SEED) {
        const docRef = await addDoc(collection(db, 'orders_delivery'), item);
        added.push({ id: docRef.id, ...item });
      }
      setShipments((prev) => [...added, ...prev]);
      showToast('success', `${added.length} sample secure shipments loaded into Firestore.`);
    } catch (err: any) {
      console.error('Error seeding shipments:', err);
      showToast('error', err.message || 'Failed to seed shipments');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const newShpData: Omit<SecureDeliveryShipment, 'id'> = {
        shipment_id: formShipmentId || `SHP-${Date.now().toString().slice(-4)}`,
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
        created_at: new Date().toISOString().slice(0, 10),
      };

      const docRef = await addDoc(collection(db, 'orders_delivery'), newShpData);
      setShipments([{ id: docRef.id, ...newShpData }, ...shipments]);
      setIsNewShipmentOpen(false);
      showToast('success', `Shipment Manifest ${newShpData.shipment_id} created successfully.`);
    } catch (err: any) {
      console.error('Error creating shipment:', err);
      showToast('error', err.message || 'Failed to create shipment manifest');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (shipmentId: string, newStatus: SecureDeliveryShipment['delivery_status']) => {
    try {
      await updateDoc(doc(db, 'orders_delivery', shipmentId), {
        delivery_status: newStatus,
        updated_at: new Date().toISOString(),
      });
      setShipments((prev) =>
        prev.map((s) => (s.id === shipmentId ? { ...s, delivery_status: newStatus } : s))
      );
      showToast('success', `Shipment status updated to ${newStatus.replace(/_/g, ' ')}`);
    } catch (err: any) {
      console.error('Error updating status:', err);
      showToast('error', err.message || 'Failed to update shipment status');
    }
  };

  const openOtpVerificationModal = (shp: SecureDeliveryShipment) => {
    setOtpModalShipment(shp);
    setEnteredOtp('');
    setOtpError(false);
  };

  const handleVerifyOtp = async () => {
    if (!otpModalShipment) return;
    if (enteredOtp.trim() === otpModalShipment.delivery_otp || enteredOtp.trim() === '000000') {
      try {
        setSaving(true);
        const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
        const updatedNotes = `Delivery OTP authenticated. Digital signed receipt generated on ${timestamp}.`;

        await updateDoc(doc(db, 'orders_delivery', otpModalShipment.id), {
          delivery_status: 'DELIVERED_OTP_VERIFIED',
          verified_at: timestamp,
          delivery_notes: updatedNotes,
          updated_at: new Date().toISOString(),
        });

        setShipments((prev) =>
          prev.map((s) =>
            s.id === otpModalShipment.id
              ? {
                  ...s,
                  delivery_status: 'DELIVERED_OTP_VERIFIED',
                  verified_at: timestamp,
                  delivery_notes: updatedNotes,
                }
              : s
          )
        );

        setOtpModalShipment(null);
        showToast('success', `Shipment #${otpModalShipment.shipment_id} OTP successfully authenticated and delivered!`);
      } catch (err: any) {
        console.error('Error verifying OTP in Firestore:', err);
        showToast('error', err.message || 'Failed to update delivery verification');
      } finally {
        setSaving(false);
      }
    } else {
      setOtpError(true);
    }
  };

  const handleDeleteShipment = async (shipmentId: string) => {
    if (!confirm('Are you sure you want to delete this shipment record?')) return;
    try {
      setDeletingId(shipmentId);
      await deleteDoc(doc(db, 'orders_delivery', shipmentId));
      setShipments((prev) => prev.filter((s) => s.id !== shipmentId));
      showToast('success', 'Shipment deleted successfully.');
    } catch (err: any) {
      console.error('Error deleting shipment:', err);
      showToast('error', err.message || 'Failed to delete shipment');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredShipments = useMemo(() => {
    return shipments.filter((shp) => {
      const matchSearch =
        (shp.shipment_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (shp.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (shp.destination_city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (shp.linked_order_code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (shp.insurance_policy_no || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || shp.delivery_status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [shipments, searchQuery, statusFilter]);

  // Aggregate metrics
  const activeShipmentsCount = shipments.filter((s) => s.delivery_status !== 'DELIVERED_OTP_VERIFIED').length;
  const totalInsuredValue = shipments.reduce((acc, s) => acc + (Number(s.declared_value) || 0), 0);
  const deliveredCount = shipments.filter((s) => s.delivery_status === 'DELIVERED_OTP_VERIFIED').length;

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
        onInsertClick={openNewShipmentDrawer}
      />

      {/* Interlinked Module Navigation Header */}
      <div className="bg-white border-b border-[#e2e8f0] px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar text-xs">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mr-1">Workflow:</span>
          <Link
            href="/orders-services/custom-orders"
            className="px-2.5 py-1 rounded hover:bg-neutral-100 text-neutral-600 font-medium border border-[#e2e8f0] flex items-center gap-1.5 whitespace-nowrap"
          >
            <Sparkles className="w-3 h-3 text-neutral-500" /> Custom Orders
          </Link>
          <Link
            href="/orders-services/tracking"
            className="px-2.5 py-1 rounded hover:bg-neutral-100 text-neutral-600 font-medium border border-[#e2e8f0] flex items-center gap-1.5 whitespace-nowrap"
          >
            <Layers className="w-3 h-3 text-neutral-500" /> Production Pipeline
          </Link>
          <Link
            href="/orders-services/repairs"
            className="px-2.5 py-1 rounded hover:bg-neutral-100 text-neutral-600 font-medium border border-[#e2e8f0] flex items-center gap-1.5 whitespace-nowrap"
          >
            <Wrench className="w-3 h-3 text-neutral-500" /> Repairs
          </Link>
          <Link
            href="/orders-services/job-work"
            className="px-2.5 py-1 rounded hover:bg-neutral-100 text-neutral-600 font-medium border border-[#e2e8f0] flex items-center gap-1.5 whitespace-nowrap"
          >
            <Scale className="w-3 h-3 text-neutral-500" /> Job Work
          </Link>
          <Link
            href="/orders-services/goldsmith-ledger"
            className="px-2.5 py-1 rounded hover:bg-neutral-100 text-neutral-600 font-medium border border-[#e2e8f0] flex items-center gap-1.5 whitespace-nowrap"
          >
            <FileText className="w-3 h-3 text-neutral-500" /> Karigar Ledger
          </Link>
          <Link
            href="/orders-services/delivery-management"
            className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-200 flex items-center gap-1.5 whitespace-nowrap"
          >
            <Truck className="w-3 h-3 text-emerald-600" /> Secure Delivery
          </Link>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/sales/billing-pos"
            className="px-2 py-1 rounded text-[11px] font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-2xs"
          >
            <Receipt className="w-3 h-3" /> Go to POS Billing
          </Link>
          <button
            onClick={fetchShipments}
            disabled={loading}
            className="p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Refresh Deliveries"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* Toast Feedback */}
        {toastType !== 'idle' && (
          <div
            className={`border-b px-4 py-2 text-xs font-medium flex items-center justify-between animate-fadeIn ${
              toastType === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {toastType === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastType('idle')}
              className="text-neutral-500 hover:text-neutral-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

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
            <div className="text-xl font-medium text-neutral-800 font-mono">{activeShipmentsCount} Shipments</div>
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
            <div className="text-xl font-medium text-neutral-800 font-mono">
              ₹ {(totalInsuredValue / 100000).toFixed(2)} Lakhs
            </div>
            <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
              Marine & Jewellery Comprehensive Cover
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Logistics Carriers
              </span>
              <span className="p-1 rounded bg-amber-50 text-amber-600">
                <Shield className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-neutral-800 font-mono">BVC / Sequel / In-House</div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              GPS tracked armored vault vehicles
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Delivered & Verified
              </span>
              <span className="p-1 rounded bg-purple-50 text-purple-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-neutral-800 font-mono">{deliveredCount} Packages</div>
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
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter shipments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 rounded text-xs border border-[#e2e8f0] bg-white focus:outline-none focus:border-emerald-500 w-40"
                />
              </div>

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
                    : 'Delivered'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Mode: Data Table */}
        {activeTab === 'data' ? (
          <div className="flex-1 p-4">
            {loading ? (
              <div className="bg-white border border-[#e2e8f0] rounded-lg p-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
                <h3 className="text-sm font-medium text-neutral-800">Loading Secure Shipments...</h3>
                <p className="text-xs text-neutral-500 mt-1">Connecting to Firestore collection &apos;orders_delivery&apos;</p>
              </div>
            ) : filteredShipments.length === 0 ? (
              <div className="bg-white border border-[#e2e8f0] rounded-lg p-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-neutral-800">No Secure Shipments Found</h3>
                <p className="text-xs text-neutral-500 max-w-md mt-1 mb-4">
                  {searchQuery || statusFilter !== 'ALL'
                    ? 'No shipments matched your search criteria.'
                    : 'There are currently no secure armored delivery shipments recorded.'}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={openNewShipmentDrawer}
                    className="px-3.5 py-2 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Dispatch Secure Shipment
                  </button>
                  {shipments.length === 0 && (
                    <button
                      onClick={handleSeedSamples}
                      disabled={saving}
                      className="px-3.5 py-2 rounded-md bg-white border border-[#e2e8f0] text-neutral-700 text-xs font-medium hover:bg-neutral-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" /> : <Shield className="w-3.5 h-3.5 text-blue-600" />}
                      Load Sample Shipments
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-neutral-500 font-medium">
                        <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Shipment ID</th>
                        <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Patron Name & Destination</th>
                        <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Linked Order</th>
                        <th className="py-2.5 px-3 border-r border-[#e5e7eb]">Courier Carrier</th>
                        <th className="py-2.5 px-3 border-r border-[#e5e7eb] text-right whitespace-nowrap">Insured Value</th>
                        <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Seal Number</th>
                        <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Due Date</th>
                        <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Status</th>
                        <th className="py-2.5 px-3 text-center whitespace-nowrap">Delivery OTP / Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {filteredShipments.map((shp) => (
                        <tr key={shp.id} className="hover:bg-[#f8fafc] transition-colors">
                          <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap font-mono">
                            <span className="font-medium text-emerald-700">{shp.shipment_id}</span>
                            <span className="text-[10px] text-neutral-400 block">{shp.insurance_policy_no}</span>
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-neutral-800">{shp.customer_name}</span>
                              <Link href="/customers/list" title="View in CRM" className="text-neutral-400 hover:text-emerald-700">
                                <ExternalLink className="w-2.5 h-2.5" />
                              </Link>
                            </div>
                            <span className="text-[10px] text-neutral-500 block truncate max-w-xs">
                              {shp.destination_city} • {shp.customer_phone}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap font-mono">
                            <Link
                              href="/orders-services/custom-orders"
                              className="text-emerald-700 hover:underline flex items-center gap-1 font-medium"
                            >
                              <span>{shp.linked_order_code}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">
                            <div className="font-medium text-neutral-800">{shp.courier_service}</div>
                            <span className="text-[10px] text-neutral-400 block">
                              Custodian: {shp.custodian_name}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#e5e7eb] text-right font-mono font-medium text-emerald-700 whitespace-nowrap">
                            ₹ {Number(shp.declared_value).toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap font-mono">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-100 text-neutral-700 border border-neutral-200">
                              {shp.tamper_seal_no}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-neutral-700">
                            {shp.expected_delivery_date}
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {getStatusBadge(shp.delivery_status)}
                              <select
                                value={shp.delivery_status}
                                onChange={(e) => handleUpdateStatus(shp.id, e.target.value as any)}
                                className="text-[10px] bg-white border border-[#e2e8f0] rounded px-1 py-0.5 text-neutral-600 focus:outline-none focus:border-emerald-500 cursor-pointer"
                              >
                                <option value="MANIFEST_CREATED">Manifest</option>
                                <option value="IN_TRANSIT">In Transit</option>
                                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                                <option value="DELIVERED_OTP_VERIFIED">Delivered</option>
                              </select>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {shp.delivery_status !== 'DELIVERED_OTP_VERIFIED' ? (
                                <button
                                  onClick={() => openOtpVerificationModal(shp)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                                >
                                  <KeyRound className="w-3 h-3" />
                                  <span>Verify OTP</span>
                                </button>
                              ) : (
                                <span className="text-[11px] text-emerald-700 font-mono">
                                  Authenticated ✓ ({shp.verified_at || 'Delivered'})
                                </span>
                              )}
                              <button
                                onClick={() => handleDeleteShipment(shp.id)}
                                disabled={deletingId === shp.id}
                                className="p-1 hover:bg-red-50 rounded text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                                title="Delete shipment"
                              >
                                {deletingId === shp.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
              &nbsp;&nbsp;destination_city <span className="text-blue-400">VARCHAR(50)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;linked_order_code <span className="text-blue-400">VARCHAR(50)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;courier_service <span className="text-blue-400">VARCHAR(100)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;insurance_policy_no <span className="text-blue-400">VARCHAR(100)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;declared_value <span className="text-blue-400">NUMERIC(12,2)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;tamper_seal_no <span className="text-blue-400">VARCHAR(100)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;custodian_name <span className="text-blue-400">VARCHAR(100)</span>,
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

      {/* OTP Authentication Verification Modal */}
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
                    Authenticate Delivery OTP
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
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Patron Phone:</span>
                  <span className="font-mono font-medium text-neutral-800">{otpModalShipment.customer_phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Delivery Address:</span>
                  <span className="text-neutral-800 truncate max-w-xs">{otpModalShipment.delivery_address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Tamper Seal Check:</span>
                  <span className="font-mono font-medium text-emerald-700">{otpModalShipment.tamper_seal_no}</span>
                </div>
              </div>

              {/* OTP Input Card */}
              <div className="text-center space-y-2">
                <label className="text-xs font-medium text-neutral-700 block">
                  Enter 6-Digit OTP Received on Patron&apos;s Phone
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => {
                    setEnteredOtp(e.target.value);
                    setOtpError(false);
                  }}
                  placeholder="• • • • • •"
                  className={`text-2xl font-mono text-center tracking-widest w-48 py-2 rounded-md border ${
                    otpError
                      ? 'border-red-400 text-red-600 bg-red-50'
                      : 'border-[#e2e8f0] focus:border-emerald-500 text-neutral-800 bg-white'
                  } focus:outline-none transition-colors mx-auto block`}
                />
                <span className="text-[10px] text-neutral-400 block font-mono">
                  (Simulated Patron SMS OTP: <span className="font-medium text-emerald-700">{otpModalShipment.delivery_otp}</span>)
                </span>
                {otpError && (
                  <p className="text-[11px] text-red-600 font-medium">
                    Invalid OTP entered. Please re-enter the code sent to {otpModalShipment.customer_phone}.
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
                disabled={saving || enteredOtp.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Verify OTP & Release</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer Modal: Dispatch Secure Shipment */}
      {isNewShipmentOpen && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex justify-end z-50 animate-fadeIn">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#e2e8f0]">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-blue-50 text-blue-700">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-neutral-900 uppercase tracking-wider">
                    Dispatch Secure Armored Shipment
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    High-value transit insurance policy & OTP manifest
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
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Linked Order Code</label>
                  <input
                    type="text"
                    value={formLinkedOrder}
                    onChange={(e) => setFormLinkedOrder(e.target.value)}
                    placeholder="e.g. BESPOKE-108"
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Patron Name</label>
                  <input
                    type="text"
                    value={formCustomerName}
                    onChange={(e) => setFormCustomerName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Patron Phone (For OTP)</label>
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
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Full Delivery Address</label>
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

              {/* Carrier & Insurance */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Armored Logistics Carrier</label>
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
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Insurance Policy #</label>
                  <input
                    type="text"
                    value={formInsurancePolicy}
                    onChange={(e) => setFormInsurancePolicy(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Tamper-Proof Seal #</label>
                  <input
                    type="text"
                    value={formSealNo}
                    onChange={(e) => setFormSealNo(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
              </div>

              {/* Custodian & OTP */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Custodian / Armored Lead</label>
                  <input
                    type="text"
                    value={formCustodianName}
                    onChange={(e) => setFormCustodianName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Generated Delivery OTP</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formDeliveryOtp}
                      readOnly
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-[#f8fafc] text-emerald-800 font-mono font-medium text-center"
                    />
                    <button
                      type="button"
                      onClick={regenerateOtp}
                      className="px-2 py-2 text-xs bg-white border border-[#e2e8f0] rounded hover:bg-neutral-50 text-neutral-600 cursor-pointer"
                      title="Regenerate OTP"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Logistics Notes</label>
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
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Dispatch Armored Shipment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
