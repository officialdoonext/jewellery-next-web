'use client';

import React, { useState, useMemo } from 'react';
import { TabBar } from '../TabBar';
import { ActionToolbar } from '../ActionToolbar';
import {
  Wrench,
  Clock,
  Scale,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Search,
  Filter,
  Eye,
  Check,
  RotateCw,
  Sparkles,
  User,
  ShieldCheck,
  Printer,
  ChevronRight,
  Flame,
  FileText,
} from 'lucide-react';

interface JewelleryRepairJob {
  id: string;
  job_card_no: string;
  customer_name: string;
  customer_phone: string;
  ornament_description: string;
  metal_type: string;
  karat: string;
  intake_weight_g: number;
  delivery_weight_g?: number;
  weight_loss_tolerance_g: number;
  condition_notes: string;
  work_required: string[];
  estimated_service_charge: number;
  advance_paid: number;
  promised_date: string;
  assigned_karigar: string;
  status: 'INTAKE_RECEIVED' | 'WORKSHOP_IN_PROGRESS' | 'READY_FOR_PICKUP' | 'HANDED_OVER';
  handover_timestamp?: string;
  loss_approved?: boolean;
}

const INITIAL_REPAIR_JOBS: JewelleryRepairJob[] = [
  {
    id: 'rep-01',
    job_card_no: 'REP-2026-088',
    customer_name: 'Sunita Devi',
    customer_phone: '+91 98450 12345',
    ornament_description: '22K Rope Chain Link Solder & Joint Reinforce',
    metal_type: 'Yellow Gold',
    karat: '22K 916',
    intake_weight_g: 16.420,
    delivery_weight_g: 16.390,
    weight_loss_tolerance_g: 0.050,
    condition_notes: 'Minor link wear at hook junction; no missing links.',
    work_required: ['Laser Solder Link', 'Buffing & Ultrasonic Clean'],
    estimated_service_charge: 850,
    advance_paid: 500,
    promised_date: '2026-11-01',
    assigned_karigar: 'Ramesh Master',
    status: 'READY_FOR_PICKUP',
    loss_approved: true,
  },
  {
    id: 'rep-02',
    job_card_no: 'REP-2026-089',
    customer_name: 'Ramesh Gupta',
    customer_phone: '+91 97112 88492',
    ornament_description: 'Solitaire Ring Size Adjustment from 12 to 14',
    metal_type: 'White Gold',
    karat: '18K 750',
    intake_weight_g: 4.820,
    delivery_weight_g: 5.120, // Gold added for resizing
    weight_loss_tolerance_g: 0.030,
    condition_notes: 'Shank stretched and 0.300g 18K white gold piece laser welded.',
    work_required: ['Ring Resizing +2 Sizes', 'Rhodium Dip Plating'],
    estimated_service_charge: 1650,
    advance_paid: 1650,
    promised_date: '2026-11-02',
    assigned_karigar: 'Gopal Soni',
    status: 'READY_FOR_PICKUP',
    loss_approved: true,
  },
  {
    id: 'rep-03',
    job_card_no: 'REP-2026-090',
    customer_name: 'Bhavna Shah',
    customer_phone: '+91 98205 91823',
    ornament_description: 'Antique Temple Necklace Stone Tightening & Solder',
    metal_type: 'Yellow Gold',
    karat: '22K 916',
    intake_weight_g: 48.650,
    weight_loss_tolerance_g: 0.080,
    condition_notes: '2 loose ruby stones in side floral collets. Dents on reverse clasp.',
    work_required: ['Stone Tightening', 'Antique Buff & Polish', 'Clasp Spring Repair'],
    estimated_service_charge: 2400,
    advance_paid: 1000,
    promised_date: '2026-11-04',
    assigned_karigar: 'Harish Patwa',
    status: 'WORKSHOP_IN_PROGRESS',
  },
  {
    id: 'rep-04',
    job_card_no: 'REP-2026-091',
    customer_name: 'Anand Kothari',
    customer_phone: '+91 94220 33819',
    ornament_description: 'Gents Platinum Kada Clasp Spring Replacement',
    metal_type: 'Platinum',
    karat: 'Pt 950',
    intake_weight_g: 34.200,
    weight_loss_tolerance_g: 0.040,
    condition_notes: 'Internal steel safety spring rusted; replace with stainless wire.',
    work_required: ['Lock Mechanism Overhaul', 'High Gloss Polish'],
    estimated_service_charge: 3200,
    advance_paid: 0,
    promised_date: '2026-11-05',
    assigned_karigar: 'Suresh Karigar',
    status: 'INTAKE_RECEIVED',
  },
  {
    id: 'rep-05',
    job_card_no: 'REP-2026-085',
    customer_name: 'Meena Kapoor',
    customer_phone: '+91 98190 77123',
    ornament_description: 'Diamond Bangle Missing Accent Stone Replacement',
    metal_type: 'Rose Gold',
    karat: '18K Diamond',
    intake_weight_g: 18.520,
    delivery_weight_g: 18.540,
    weight_loss_tolerance_g: 0.030,
    condition_notes: 'Supplied matching 0.02ct VVS-EF round diamond. Pave prong rebuilt.',
    work_required: ['Diamond Setting', 'Micro-Prong Re-tip', 'Rhodium Flash'],
    estimated_service_charge: 2800,
    advance_paid: 2800,
    promised_date: '2026-10-30',
    assigned_karigar: 'Harish Patwa',
    status: 'HANDED_OVER',
    handover_timestamp: '2026-10-30 16:45',
    loss_approved: true,
  },
];

const KARIGAR_OPTIONS = ['Ramesh Master', 'Gopal Soni', 'Harish Patwa', 'Suresh Karigar', 'In-House Service Bench'];

export function OrdersRepairsView() {
  const [repairs, setRepairs] = useState<JewelleryRepairJob[]>(INITIAL_REPAIR_JOBS);
  const [activeTab, setActiveTab] = useState<'data' | 'definition'>('data');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isNewRepairOpen, setIsNewRepairOpen] = useState(false);
  const [handoverModalJob, setHandoverModalJob] = useState<JewelleryRepairJob | null>(null);
  const [handoverScaleWeight, setHandoverScaleWeight] = useState<string>('');

  // Form State
  const [formJobCardNo, setFormJobCardNo] = useState(`REP-2026-0${repairs.length + 92}`);
  const [formCustomerName, setFormCustomerName] = useState('Dr. Sunita Rao');
  const [formCustomerPhone, setFormCustomerPhone] = useState('+91 94480 11234');
  const [formDescription, setFormDescription] = useState('22K Rope Chain Link Solder & Lock Catch Fix');
  const [formMetalType, setFormMetalType] = useState('Yellow Gold');
  const [formKarat, setFormKarat] = useState('22K 916');
  const [formIntakeWeight, setFormIntakeWeight] = useState('16.420');
  const [formConditionNotes, setFormConditionNotes] = useState('Slight surface hairline scratches; hallmark 916 visible near lock.');
  const [formWorkTypes, setFormWorkTypes] = useState<string[]>(['Soldering', 'Buffing & Polish']);
  const [formServiceCharge, setFormServiceCharge] = useState('850');
  const [formAdvancePaid, setFormAdvancePaid] = useState('500');
  const [formPromisedDate, setFormPromisedDate] = useState('2026-11-05');
  const [formAssignedKarigar, setFormAssignedKarigar] = useState(KARIGAR_OPTIONS[0]);

  const toggleWorkType = (type: string) => {
    if (formWorkTypes.includes(type)) {
      setFormWorkTypes(formWorkTypes.filter((t) => t !== type));
    } else {
      setFormWorkTypes([...formWorkTypes, type]);
    }
  };

  const handleCreateRepairJob = (e: React.FormEvent) => {
    e.preventDefault();
    const newJob: JewelleryRepairJob = {
      id: crypto.randomUUID ? crypto.randomUUID() : `rep-${Date.now()}`,
      job_card_no: formJobCardNo,
      customer_name: formCustomerName,
      customer_phone: formCustomerPhone,
      ornament_description: formDescription,
      metal_type: formMetalType,
      karat: formKarat,
      intake_weight_g: parseFloat(formIntakeWeight) || 10.0,
      weight_loss_tolerance_g: 0.05,
      condition_notes: formConditionNotes,
      work_required: formWorkTypes,
      estimated_service_charge: parseFloat(formServiceCharge) || 500,
      advance_paid: parseFloat(formAdvancePaid) || 0,
      promised_date: formPromisedDate,
      assigned_karigar: formAssignedKarigar,
      status: 'INTAKE_RECEIVED',
    };

    setRepairs([newJob, ...repairs]);
    setIsNewRepairOpen(false);
    setFormJobCardNo(`REP-2026-0${repairs.length + 93}`);
  };

  // Open Handover Verification Modal
  const openHandoverModal = (job: JewelleryRepairJob) => {
    setHandoverModalJob(job);
    setHandoverScaleWeight((job.delivery_weight_g || job.intake_weight_g - 0.03).toFixed(3));
  };

  // Confirm Handover
  const handleConfirmHandover = () => {
    if (!handoverModalJob) return;
    const finalWeight = parseFloat(handoverScaleWeight) || handoverModalJob.intake_weight_g;
    setRepairs((prev) =>
      prev.map((j) =>
        j.id === handoverModalJob.id
          ? {
              ...j,
              delivery_weight_g: finalWeight,
              status: 'HANDED_OVER',
              handover_timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
              loss_approved: true,
            }
          : j
      )
    );
    setHandoverModalJob(null);
  };

  // Filtered jobs
  const filteredRepairs = useMemo(() => {
    return repairs.filter((job) => {
      const matchSearch =
        job.job_card_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.ornament_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.assigned_karigar.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || job.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [repairs, searchQuery, statusFilter]);

  const getStatusBadge = (status: JewelleryRepairJob['status']) => {
    switch (status) {
      case 'INTAKE_RECEIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" /> Intake Received
          </span>
        );
      case 'WORKSHOP_IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Wrench className="w-3 h-3 text-amber-600" /> In Workshop
          </span>
        );
      case 'READY_FOR_PICKUP':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Ready for Pickup
          </span>
        );
      case 'HANDED_OVER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
            <Check className="w-3 h-3 text-neutral-500" /> Handed Over
          </span>
        );
      default:
        return <span className="text-neutral-500">{status}</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white w-full min-w-0">
      <TabBar title="jewellery_repairs" />
      <ActionToolbar
        filterPlaceholder="Filter repairs by Job Card #, patron name, karigar..."
        insertLabel="New Repair Job Card"
        onInsertClick={() => setIsNewRepairOpen(true)}
      />

      <div className="flex-1 overflow-y-auto bg-[#fafafa] flex flex-col custom-scrollbar w-full">
        {/* KPI Metrics Cards */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Active Repair Jobs
              </span>
              <span className="p-1 rounded bg-blue-50 text-blue-600">
                <Wrench className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-neutral-800 font-mono">18 Items</div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              Currently on artisan workbenches
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Ready for Pickup
              </span>
              <span className="p-1 rounded bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-neutral-800 font-mono">6 Items</div>
            <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
              Polished & scale tare verified
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Pre-Repair Gold Intake
              </span>
              <span className="p-1 rounded bg-amber-50 text-amber-600">
                <Scale className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-neutral-800 font-mono">184.200 g</div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              Vaulted customer ornament custody
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-emerald-300 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Avg Repair Turnaround
              </span>
              <span className="p-1 rounded bg-purple-50 text-purple-600">
                <Clock className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-medium text-neutral-800 font-mono">2.5 Days</div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              Solder, resize, rhodium SLA
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
              Repair Jobs ({filteredRepairs.length})
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
              {['ALL', 'INTAKE_RECEIVED', 'WORKSHOP_IN_PROGRESS', 'READY_FOR_PICKUP', 'HANDED_OVER'].map((st) => (
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
                    : st === 'INTAKE_RECEIVED'
                    ? 'Intake'
                    : st === 'WORKSHOP_IN_PROGRESS'
                    ? 'Workshop'
                    : st === 'READY_FOR_PICKUP'
                    ? 'Ready'
                    : 'Delivered'}
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
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Job Card #</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Patron Name</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb]">Repair Description</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] text-right whitespace-nowrap">Intake Wt</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] text-right whitespace-nowrap">Delivery Wt</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] text-right whitespace-nowrap">Service Charge</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Promised Return</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Karigar</th>
                      <th className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">Status</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap">Handover Scale Check</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {filteredRepairs.map((job) => (
                      <tr key={job.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-2.5 px-3 text-center border-r border-[#e5e7eb]">
                          <input type="checkbox" className="rounded border-neutral-300 text-emerald-600" />
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap font-mono">
                          <span className="font-medium text-emerald-700">{job.job_card_no}</span>
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">
                          <div className="font-medium text-neutral-800">{job.customer_name}</div>
                          <div className="text-[10px] text-neutral-400 font-mono">{job.customer_phone}</div>
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb]">
                          <div className="font-medium text-neutral-800">{job.ornament_description}</div>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {job.work_required.map((w, idx) => (
                              <span
                                key={idx}
                                className="text-[9px] bg-neutral-100 text-neutral-600 px-1 py-0.2 rounded border border-neutral-200"
                              >
                                {w}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] text-right font-mono font-medium text-neutral-800 whitespace-nowrap">
                          {job.intake_weight_g.toFixed(3)} g
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] text-right font-mono whitespace-nowrap">
                          {job.delivery_weight_g ? (
                            <span className="font-medium text-emerald-700">
                              {job.delivery_weight_g.toFixed(3)} g
                            </span>
                          ) : (
                            <span className="text-[11px] text-neutral-400 italic">Pending Tare</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] text-right font-mono whitespace-nowrap">
                          <div className="font-medium text-neutral-800">
                            ₹ {job.estimated_service_charge.toLocaleString('en-IN')}
                          </div>
                          {job.advance_paid > 0 && (
                            <div className="text-[10px] text-emerald-600">
                              Adv: ₹{job.advance_paid.toLocaleString('en-IN')}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap font-mono text-neutral-700">
                          {job.promised_date}
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap text-neutral-700">
                          {job.assigned_karigar}
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e5e7eb] whitespace-nowrap">
                          {getStatusBadge(job.status)}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {job.status === 'READY_FOR_PICKUP' ? (
                            <button
                              onClick={() => openHandoverModal(job)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                            >
                              <Scale className="w-3 h-3" />
                              <span>Verify & Handover</span>
                            </button>
                          ) : job.status === 'HANDED_OVER' ? (
                            <span className="text-[11px] text-neutral-500 font-mono">
                              Verified ✓ ({job.delivery_weight_g?.toFixed(3)}g)
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-400">Workshop Stage</span>
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
              <span className="text-emerald-400">CREATE TABLE</span> public.jewellery_repairs (
              <br />
              &nbsp;&nbsp;id <span className="text-blue-400">UUID</span> PRIMARY KEY DEFAULT gen_random_uuid(),
              <br />
              &nbsp;&nbsp;job_card_no <span className="text-blue-400">VARCHAR(50)</span> UNIQUE NOT NULL,
              <br />
              &nbsp;&nbsp;customer_name <span className="text-blue-400">VARCHAR(150)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;customer_phone <span className="text-blue-400">VARCHAR(25)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;ornament_description <span className="text-blue-400">TEXT</span> NOT NULL,
              <br />
              &nbsp;&nbsp;metal_type <span className="text-blue-400">VARCHAR(50)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;karat <span className="text-blue-400">VARCHAR(30)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;intake_weight_g <span className="text-blue-400">NUMERIC(10,3)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;delivery_weight_g <span className="text-blue-400">NUMERIC(10,3)</span>,
              <br />
              &nbsp;&nbsp;weight_loss_tolerance_g <span className="text-blue-400">NUMERIC(6,3)</span> DEFAULT 0.050,
              <br />
              &nbsp;&nbsp;condition_notes <span className="text-blue-400">TEXT</span>,
              <br />
              &nbsp;&nbsp;work_required <span className="text-blue-400">TEXT[]</span>,
              <br />
              &nbsp;&nbsp;estimated_service_charge <span className="text-blue-400">NUMERIC(10,2)</span> NOT NULL,
              <br />
              &nbsp;&nbsp;advance_paid <span className="text-blue-400">NUMERIC(10,2)</span> DEFAULT 0.00,
              <br />
              &nbsp;&nbsp;promised_date <span className="text-blue-400">DATE</span> NOT NULL,
              <br />
              &nbsp;&nbsp;assigned_karigar <span className="text-blue-400">VARCHAR(100)</span>,
              <br />
              &nbsp;&nbsp;status <span className="text-blue-400">VARCHAR(50)</span> DEFAULT &apos;INTAKE_RECEIVED&apos;,
              <br />
              &nbsp;&nbsp;handover_timestamp <span className="text-blue-400">TIMESTAMPTZ</span>,
              <br />
              &nbsp;&nbsp;created_at <span className="text-blue-400">TIMESTAMPTZ</span> DEFAULT now()
              <br />
              );
            </div>
          </div>
        )}
      </div>

      {/* 1-Click Handover Verification Modal (Scale Tare Weight Re-check) */}
      {handoverModalJob && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl border border-[#e2e8f0] w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-emerald-50 text-emerald-700">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-neutral-900 uppercase tracking-wider">
                    Customer Handover Verification
                  </h3>
                  <span className="font-mono text-[11px] text-emerald-700">
                    {handoverModalJob.job_card_no} • {handoverModalJob.customer_name}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setHandoverModalJob(null)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
                <div className="text-xs text-neutral-600">
                  Ornament: <span className="font-medium text-neutral-800">{handoverModalJob.ornament_description}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-[#e2e8f0]">
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Pre-Repair Intake Wt:</span>
                    <span className="font-mono font-medium text-neutral-800 text-sm">
                      {handoverModalJob.intake_weight_g.toFixed(3)} g
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Loss Tolerance:</span>
                    <span className="font-mono text-neutral-600 text-sm">
                      ± {handoverModalJob.weight_loss_tolerance_g.toFixed(3)} g
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Digital Scale Reading */}
              <div className="p-4 rounded-lg bg-neutral-900 text-white flex flex-col items-center justify-center">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Mettler-Toledo Digital Scale Tare Connected (COM3)
                </span>
                <div className="flex items-baseline gap-2">
                  <input
                    type="number"
                    step="0.001"
                    value={handoverScaleWeight}
                    onChange={(e) => setHandoverScaleWeight(e.target.value)}
                    className="text-2xl font-mono font-medium text-emerald-400 bg-transparent text-center border-b border-emerald-500/50 focus:outline-none w-36"
                  />
                  <span className="text-sm font-mono text-neutral-300">grams</span>
                </div>
                <div className="text-[11px] font-mono text-neutral-300 mt-2">
                  Weight Difference: {(parseFloat(handoverScaleWeight || '0') - handoverModalJob.intake_weight_g).toFixed(3)} g
                  {Math.abs(parseFloat(handoverScaleWeight || '0') - handoverModalJob.intake_weight_g) <= handoverModalJob.weight_loss_tolerance_g ? (
                    <span className="ml-2 text-emerald-400 font-medium">✓ Within Normal Buffing Loss</span>
                  ) : (
                    <span className="ml-2 text-amber-400 font-medium">⚠ Tolerance Check Required</span>
                  )}
                </div>
              </div>

              {/* Payment Settlement Breakdown */}
              <div className="p-3 rounded-md bg-white border border-[#e2e8f0] text-xs">
                <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                  <span className="text-neutral-600">Total Service Charges:</span>
                  <span className="font-mono font-medium text-neutral-800">
                    ₹ {handoverModalJob.estimated_service_charge.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                  <span className="text-neutral-600">Advance Paid:</span>
                  <span className="font-mono text-emerald-700">
                    - ₹ {handoverModalJob.advance_paid.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between py-1 pt-1.5 font-medium text-neutral-900">
                  <span>Balance Payable by Patron:</span>
                  <span className="font-mono text-emerald-700">
                    ₹ {(handoverModalJob.estimated_service_charge - handoverModalJob.advance_paid).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setHandoverModalJob(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmHandover}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Weight & Deliver to Patron</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer Modal: New Repair Job Card */}
      {isNewRepairOpen && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex justify-end z-50 animate-fadeIn">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#e2e8f0]">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-blue-50 text-blue-700">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-neutral-900 uppercase tracking-wider">
                    New Jewellery Repair Job Card
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Intake digital scale tare check & customer work authorization
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewRepairOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form id="new-repair-form" onSubmit={handleCreateRepairJob} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Job Card #</label>
                  <input
                    type="text"
                    value={formJobCardNo}
                    onChange={(e) => setFormJobCardNo(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
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
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Patron Phone</label>
                <input
                  type="text"
                  value={formCustomerPhone}
                  onChange={(e) => setFormCustomerPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">Ornament Description</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. 22K Rope Chain Link Solder, Solitaire Ring Size 12 to 14"
                  required
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                />
              </div>

              {/* Metal, Karat & Digital Scale Intake Weight */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Metal</label>
                  <select
                    value={formMetalType}
                    onChange={(e) => setFormMetalType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  >
                    <option value="Yellow Gold">Yellow Gold</option>
                    <option value="White Gold">White Gold</option>
                    <option value="Rose Gold">Rose Gold</option>
                    <option value="Platinum">Platinum</option>
                    <option value="Silver">Silver 925</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Purity / Karat</label>
                  <select
                    value={formKarat}
                    onChange={(e) => setFormKarat(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  >
                    <option value="22K 916">22K 916 Gold</option>
                    <option value="18K 750">18K 750 Gold</option>
                    <option value="14K 585">14K 585 Gold</option>
                    <option value="Pt 950">Pt 950 Platinum</option>
                    <option value="Silver 925">Silver 925</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Intake Wt (g)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      value={formIntakeWeight}
                      onChange={(e) => setFormIntakeWeight(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                    />
                    <Scale className="w-3.5 h-3.5 text-emerald-600 absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* Work Required Checkboxes */}
              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1.5 block">Work Required</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Soldering',
                    'Ring Resizing',
                    'Stone Tightening',
                    'Rhodium Plating',
                    'Buffing & Polish',
                    'Laser Micro-Weld',
                  ].map((work) => (
                    <label
                      key={work}
                      className={`flex items-center gap-2 p-2 rounded border text-xs cursor-pointer transition-colors ${
                        formWorkTypes.includes(work)
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-medium'
                          : 'bg-white border-[#e2e8f0] text-neutral-700 hover:bg-[#f8fafc]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formWorkTypes.includes(work)}
                        onChange={() => toggleWorkType(work)}
                        className="rounded border-neutral-300 text-emerald-600"
                      />
                      <span>{work}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Pre-repair condition of ornament */}
              <div>
                <label className="text-xs font-medium text-neutral-700 mb-1 block">
                  Intake Condition / Existing Defects
                </label>
                <textarea
                  rows={2}
                  value={formConditionNotes}
                  onChange={(e) => setFormConditionNotes(e.target.value)}
                  placeholder="Record prior scratches, missing stones, denting to avoid customer dispute..."
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                />
              </div>

              {/* Charges & Karigar Assignment */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Service Charge (₹)</label>
                  <input
                    type="number"
                    value={formServiceCharge}
                    onChange={(e) => setFormServiceCharge(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Advance Paid (₹)</label>
                  <input
                    type="number"
                    value={formAdvancePaid}
                    onChange={(e) => setFormAdvancePaid(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 font-mono transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Promised Return Date</label>
                  <input
                    type="date"
                    value={formPromisedDate}
                    onChange={(e) => setFormPromisedDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 mb-1 block">Assign Artisan</label>
                  <select
                    value={formAssignedKarigar}
                    onChange={(e) => setFormAssignedKarigar(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-md bg-white focus:border-emerald-500 focus:outline-none text-neutral-800 transition-colors"
                  >
                    {KARIGAR_OPTIONS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </form>

            <div className="px-5 py-3 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNewRepairOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="new-repair-form"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Issue Repair Job Card</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
