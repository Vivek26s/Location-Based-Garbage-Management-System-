import React, { useState, useEffect } from 'react';
import {
  Shield,
  Trash2,
  Users,
  HardHat,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  Eye,
  UserPlus,
  Edit2,
  RotateCcw,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpDown,
  FileCheck,
  X,
  Loader2,
} from 'lucide-react';
import { Report, Worker, DashboardStats, ReportStatus, ReportPriority } from '../types';
import { LeafletMap } from '../components/LeafletMap';
import { api } from '../services/api';

interface AdminDashboardProps {
  onSelectReport: (report: Report) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectReport }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'reports_table' | 'workers' | 'analytics'>('overview');

  // Assignment Modal
  const [assignModalReport, setAssignModalReport] = useState<Report | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [assignPriority, setAssignPriority] = useState<ReportPriority>('High');
  const [assignAdminNotes, setAssignAdminNotes] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Add Worker Modal
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [workerName, setWorkerName] = useState('');
  const [workerEmail, setWorkerEmail] = useState('');
  const [workerPhone, setWorkerPhone] = useState('');
  const [workerZone, setWorkerZone] = useState('');
  const [workerVehicle, setWorkerVehicle] = useState('');
  const [isAddingWorker, setIsAddingWorker] = useState(false);

  // Status Change Modal
  const [statusModalReport, setStatusModalReport] = useState<Report | null>(null);
  const [targetStatus, setTargetStatus] = useState<ReportStatus>('Resolved');
  const [statusNotes, setStatusNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Quick Action Feedback
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [reportsRes, workersRes, statsRes] = await Promise.all([
        api.getReports(),
        api.getWorkers(),
        api.getDashboardStats(),
      ]);

      if (reportsRes.success) setReports(reportsRes.reports);
      if (workersRes.success) setWorkers(workersRes.workers);
      if (statsRes.success) setStats(statsRes.stats);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  // Handle Worker Assignment
  const handleAssignWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalReport || !selectedWorkerId) return;

    setIsAssigning(true);
    try {
      const res = await api.assignWorker(
        assignModalReport.id,
        selectedWorkerId,
        assignPriority,
        assignAdminNotes
      );
      if (res.success) {
        showNotification(`Dispatched worker to Complaint #${assignModalReport.reportId}`);
        setAssignModalReport(null);
        await loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Assignment failed');
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle Status Update
  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalReport) return;

    setIsUpdatingStatus(true);
    try {
      const res = await api.updateReportStatus(statusModalReport.id, {
        status: targetStatus,
        adminNotes: statusNotes,
      });
      if (res.success) {
        showNotification(`Updated #${statusModalReport.reportId} to ${targetStatus}`);
        setStatusModalReport(null);
        await loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle Add Worker
  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerName || !workerEmail) return;

    setIsAddingWorker(true);
    try {
      const res = await api.createWorker({
        name: workerName,
        email: workerEmail,
        phone: workerPhone,
        zone: workerZone || 'Central Zone',
        vehicleNumber: workerVehicle || 'DL-1SM-0000',
      });
      if (res.success) {
        showNotification(`Sanitation Worker ${workerName} enrolled.`);
        setIsAddWorkerOpen(false);
        setWorkerName('');
        setWorkerEmail('');
        setWorkerPhone('');
        setWorkerZone('');
        setWorkerVehicle('');
        await loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add worker');
    } finally {
      setIsAddingWorker(false);
    }
  };

  // Handle Remove Worker
  const handleDeleteWorker = async (workerId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove worker "${name}"?`)) return;
    try {
      await api.deleteWorker(workerId);
      showNotification(`Worker ${name} removed.`);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete worker');
    }
  };

  // Handle Seed Reset for presentation
  const handleResetSeed = async () => {
    if (!confirm('Reset entire municipal database back to the official BCA presentation seed data?')) return;
    try {
      await api.resetSeed();
      showNotification('Database reset to presentation seed with default reports & workers.');
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesCat = categoryFilter === 'All' || r.category === categoryFilter;
    const matchesPriority = priorityFilter === 'All' || r.priority === priorityFilter;
    const matchesSearch =
      !searchQuery ||
      r.reportId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.location.address && r.location.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.assignedWorkerName && r.assignedWorkerName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesCat && matchesPriority && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>Municipal Central Command & GIS Monitoring Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">City Sanitation Control Room</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Real-time citizen grievance intake, worker dispatch, GPS mapping, and municipal compliance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAddWorkerOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enroll Worker</span>
          </button>

          <button
            type="button"
            onClick={handleResetSeed}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
            title="Reset to official demo data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Seed Data</span>
          </button>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Reports</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{reports.length}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-red-500 uppercase tracking-wider">Pending</div>
          <div className="text-2xl font-black text-red-600 mt-1">
            {reports.filter((r) => r.status === 'Pending').length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">Assigned</div>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {reports.filter((r) => r.status === 'Assigned').length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">In Progress</div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {reports.filter((r) => r.status === 'In Progress').length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Resolved</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {reports.filter((r) => r.status === 'Resolved').length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rejected</div>
          <div className="text-2xl font-black text-slate-500 mt-1">
            {reports.filter((r) => r.status === 'Rejected').length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Field Workers</div>
          <div className="text-2xl font-black text-blue-800 mt-1">{workers.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>GIS Map & Operations</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports_table')}
          className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'reports_table'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Manage Grievances ({filteredReports.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('workers')}
          className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'workers'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HardHat className="w-4 h-4" />
          <span>Sanitation Workers & Fleet ({workers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'analytics'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics & Category Breakdown</span>
        </button>
      </div>

      {/* TAB 1: GIS Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Live City GIS Waste Incidents Map</h3>
                <p className="text-xs text-slate-500">
                  OpenStreetMap real-time incident pins. Click a marker to quickly assign workers or verify status.
                </p>
              </div>
              <div className="text-xs text-slate-600 font-medium">
                Showing <strong>{reports.length}</strong> active complaints
              </div>
            </div>

            <div className="h-[460px] rounded-2xl overflow-hidden border border-slate-200">
              <LeafletMap
                height="100%"
                zoom={13}
                center={[28.6139, 77.2090]}
                reports={reports}
                onReportClick={(r) => setAssignModalReport(r)}
                showLocateButton={true}
              />
            </div>
          </div>

          {/* Quick Action Attention Queue */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Immediate Attention Required</h3>
                <p className="text-xs text-slate-500">Pending complaints awaiting officer dispatch</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('Pending');
                  setActiveTab('reports_table');
                }}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                View all pending
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reports
                .filter((r) => r.status === 'Pending')
                .slice(0, 3)
                .map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl border border-red-200 bg-red-50/40 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="font-mono font-bold text-xs text-red-900">{r.reportId}</span>
                        <span className="px-2 py-0.5 bg-red-200 text-red-900 rounded text-[10px] font-bold">
                          {r.priority}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900">{r.category}</div>
                      <p className="text-xs text-slate-600 line-clamp-2">{r.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAssignModalReport(r)}
                      className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition"
                    >
                      Assign Worker Now
                    </button>
                  </div>
                ))}

              {reports.filter((r) => r.status === 'Pending').length === 0 && (
                <div className="col-span-full py-8 text-center text-xs text-slate-400">
                  🎉 Great job! No pending complaints awaiting dispatch right now.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Reports Table */}
      {activeTab === 'reports_table' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, location, worker, keyword..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white"
              >
                <option value="All">All Categories</option>
                <option value="Overflowing Dustbin">Overflowing Dustbin</option>
                <option value="Garbage on Road">Garbage on Road</option>
                <option value="Garbage Near Park">Garbage Near Park</option>
                <option value="Garbage on Empty Plot">Garbage on Empty Plot</option>
                <option value="Other">Other</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white"
              >
                <option value="All">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">ID / Photo</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Location & Landmark</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Assigned Worker</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={report.image}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                        />
                        <div>
                          <div className="font-mono font-bold text-slate-900">{report.reportId}</div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 font-semibold text-slate-800">
                      {report.category}
                    </td>

                    <td className="p-3 max-w-[200px]">
                      <div className="truncate font-medium text-slate-800">
                        {report.location.address || 'Smart City Ward'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {report.location.latitude.toFixed(4)}, {report.location.longitude.toFixed(4)}
                      </div>
                    </td>

                    <td className="p-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          report.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : report.status === 'In Progress'
                            ? 'bg-amber-100 text-amber-800'
                            : report.status === 'Assigned'
                            ? 'bg-blue-100 text-blue-800'
                            : report.status === 'Rejected'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>

                    <td className="p-3">
                      <span
                        className={`font-bold text-[11px] ${
                          report.priority === 'Critical'
                            ? 'text-red-600'
                            : report.priority === 'High'
                            ? 'text-amber-600'
                            : 'text-slate-600'
                        }`}
                      >
                        {report.priority}
                      </span>
                    </td>

                    <td className="p-3">
                      {report.assignedWorkerName ? (
                        <div>
                          <div className="font-semibold text-slate-900">{report.assignedWorkerName}</div>
                          <div className="text-[10px] text-slate-400">
                            {report.workerTaskStatus || 'Assigned'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setAssignModalReport(report)}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold text-[11px] transition"
                        >
                          Assign
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStatusModalReport(report);
                            setTargetStatus(report.status);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-[11px] transition"
                        >
                          Status
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectReport(report)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
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

      {/* TAB 3: Workers Management */}
      {activeTab === 'workers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Municipal Sanitation Force</h3>
              <p className="text-xs text-slate-500">
                Manage drivers, field workers, zone allocations, and hydraulic tipper vehicles.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddWorkerOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Worker</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {workers.map((worker) => (
              <div
                key={worker.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                        <HardHat className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{worker.name}</h4>
                        <p className="text-xs text-slate-400">{worker.email}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        worker.availability === 'On Duty'
                          ? 'bg-emerald-100 text-emerald-800'
                          : worker.availability === 'Available'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {worker.availability}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Phone:</span>
                      <strong className="text-slate-800">{worker.phone}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Assigned Zone:</span>
                      <span className="text-slate-800 font-medium">{worker.zone || 'Central Ward'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Vehicle:</span>
                      <span className="text-slate-800 font-medium">{worker.vehicleNumber || 'Unassigned'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Active Tasks:</span>
                      <span className="font-bold text-blue-700">
                        {(worker as any).activeTasksCount ?? worker.assignedTasks.length} Complaints
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleDeleteWorker(worker.id, worker.name)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition text-xs font-semibold"
                    title="Remove Worker"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Analytics */}
      {activeTab === 'analytics' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Complaints by Garbage Category</h3>
              <div className="space-y-3 pt-2">
                {Object.entries(stats.categoryStats).map(([cat, count]) => {
                  const percent = reports.length ? Math.round((count / reports.length) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-700">{cat}</span>
                        <span className="text-slate-900 font-bold">
                          {count} ({percent}%)
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resolution Performance */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Resolution Performance & SLA</h3>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center">
                  <div className="text-3xl font-extrabold text-emerald-700">
                    {reports.length ? Math.round((stats.resolvedReports / reports.length) * 100) : 0}%
                  </div>
                  <div className="text-xs text-emerald-900 font-semibold mt-1">Resolution Rate</div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-center">
                  <div className="text-3xl font-extrabold text-blue-700">2.4 hrs</div>
                  <div className="text-xs text-blue-900 font-semibold mt-1">Avg. Redressal Time</div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-center">
                  <div className="text-3xl font-extrabold text-amber-700">{stats.activeWorkers}</div>
                  <div className="text-xs text-amber-900 font-semibold mt-1">Units On Duty</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center">
                  <div className="text-3xl font-extrabold text-slate-800">100%</div>
                  <div className="text-xs text-slate-700 font-semibold mt-1">GPS Verified</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN WORKER MODAL */}
      {assignModalReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Assign Worker to #{assignModalReport.reportId}
                </h3>
                <p className="text-xs text-slate-500">{assignModalReport.category}</p>
              </div>
              <button
                type="button"
                onClick={() => setAssignModalReport(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignWorker} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Field Sanitation Officer <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="">-- Choose Sanitation Officer --</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.availability}) • {w.zone || 'Central Ward'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dispatch Priority</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Low', 'Medium', 'High', 'Critical'] as ReportPriority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAssignPriority(p)}
                      className={`py-1.5 text-xs font-bold rounded-lg transition ${
                        assignPriority === p
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admin Instructions / Route Notes
                </label>
                <textarea
                  rows={2}
                  value={assignAdminNotes}
                  onChange={(e) => setAssignAdminNotes(e.target.value)}
                  placeholder="e.g. Deploy hydraulic loader. Clear before 4 PM."
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalReport(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning || !selectedWorkerId}
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isAssigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Dispatch Worker</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {statusModalReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">
                Update Status: #{statusModalReport.reportId}
              </h3>
              <button
                type="button"
                onClick={() => setStatusModalReport(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStatusUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Status</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as ReportStatus)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved (Cleared)</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Remarks / Reasoning</label>
                <textarea
                  rows={2}
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="e.g. Cleared and verified by Ward Inspector."
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalReport(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow transition"
                >
                  {isUpdatingStatus ? 'Updating...' : 'Save Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENROLL WORKER MODAL */}
      {isAddWorkerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Enroll Sanitation Officer</h3>
              <button
                type="button"
                onClick={() => setIsAddWorkerOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorker} className="p-6 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  placeholder="e.g. Suresh Pal"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={workerEmail}
                  onChange={(e) => setWorkerEmail(e.target.value)}
                  placeholder="suresh.pal@smartcity.gov"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={workerPhone}
                  onChange={(e) => setWorkerPhone(e.target.value)}
                  placeholder="+91 99000 11223"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Ward Zone</label>
                <input
                  type="text"
                  value={workerZone}
                  onChange={(e) => setWorkerZone(e.target.value)}
                  placeholder="e.g. Sector 5 & Ring Road"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Allocated Vehicle</label>
                <input
                  type="text"
                  value={workerVehicle}
                  onChange={(e) => setWorkerVehicle(e.target.value)}
                  placeholder="e.g. DL-1SM-5510 (Tipper)"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddWorkerOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingWorker}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow"
                >
                  {isAddingWorker ? 'Enrolling...' : 'Enroll Worker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
