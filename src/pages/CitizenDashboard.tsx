import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Search,
  Filter,
  User,
  ExternalLink,
  ChevronRight,
  Shield,
  FileText,
  Trash2,
  Calendar,
} from 'lucide-react';
import { Report, ReportStatus, GarbageCategory } from '../types';
import { LeafletMap } from '../components/LeafletMap';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface CitizenDashboardProps {
  onOpenReportModal: () => void;
  onSelectReport: (report: Report) => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  onOpenReportModal,
  onSelectReport,
}) => {
  const { user, openAuthModal } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'my_reports' | 'map_view' | 'profile'>('my_reports');

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      // If user is logged in, show their reports or all if guest
      const res = await api.getReports(user ? { userId: user.id } : {});
      if (res.success) {
        // If citizen has no personal reports yet, show sample/public ones
        if (res.reports.length === 0) {
          const allRes = await api.getReports();
          setReports(allRes.reports);
        } else {
          setReports(res.reports);
        }
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [user]);

  const filteredReports = reports.filter((r) => {
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesCat = categoryFilter === 'All' || r.category === categoryFilter;
    const matchesSearch =
      !searchQuery ||
      r.reportId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.location.address && r.location.address.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesCat && matchesSearch;
  });

  const pendingCount = reports.filter((r) => r.status === 'Pending').length;
  const inProgressCount = reports.filter((r) => r.status === 'In Progress' || r.status === 'Assigned').length;
  const resolvedCount = reports.filter((r) => r.status === 'Resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Citizen Grievance Redressal Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Welcome, {user ? user.name : 'Resident Citizen'}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
            Report waste accumulation, monitor municipal worker assignments, and help keep your
            neighborhood clean.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenReportModal}
            className="px-5 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Garbage Issue</span>
          </button>

          {!user && (
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition"
            >
              Sign In to Your Account
            </button>
          )}
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold">Total Complaints</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{reports.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Logged from your ward</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold">Pending Review</div>
          <div className="text-2xl font-black text-red-500 mt-1">{pendingCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">Awaiting dispatch</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold">In Progress / Assigned</div>
          <div className="text-2xl font-black text-amber-500 mt-1">{inProgressCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">Officer dispatched</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold">Resolved Cleaned</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{resolvedCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">With photo proof</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('my_reports')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'my_reports'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Complaints & History ({filteredReports.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('map_view')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'map_view'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Interactive Ward GIS Map</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Citizen Profile</span>
        </button>
      </div>

      {/* Tab 1: Complaints List */}
      {activeTab === 'my_reports' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, location, or issue..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500"
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
                className="text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="All">All Categories</option>
                <option value="Overflowing Dustbin">Overflowing Dustbin</option>
                <option value="Garbage on Road">Garbage on Road</option>
                <option value="Garbage Near Park">Garbage Near Park</option>
                <option value="Garbage on Empty Plot">Garbage on Empty Plot</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Trash2 className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700 text-sm">No complaints found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No garbage complaints matching your current filters. Click below to submit a new report.
              </p>
              <button
                type="button"
                onClick={onOpenReportModal}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
              >
                Submit New Complaint
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {/* Image Header */}
                    <div className="relative h-44 bg-slate-100">
                      <img
                        src={report.image}
                        alt={report.category}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider shadow-sm ${
                            report.status === 'Resolved'
                              ? 'bg-emerald-600'
                              : report.status === 'In Progress'
                              ? 'bg-amber-600'
                              : report.status === 'Assigned'
                              ? 'bg-blue-600'
                              : report.status === 'Rejected'
                              ? 'bg-slate-600'
                              : 'bg-red-600'
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>
                      <div className="absolute top-2.5 right-2.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                          {report.priority} Priority
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {report.reportId}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-emerald-800">{report.category}</div>
                      <p className="text-xs text-slate-600 line-clamp-2">{report.description}</p>

                      <div className="pt-2 flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{report.location.address || 'Smart City Ward'}</span>
                      </div>

                      {/* Worker assignment status tag */}
                      {report.assignedWorkerName && (
                        <div className="bg-blue-50/80 border border-blue-100 rounded-lg px-2.5 py-1 text-[11px] text-blue-800 flex items-center justify-between">
                          <span>Assigned Officer:</span>
                          <strong className="font-semibold">{report.assignedWorkerName}</strong>
                        </div>
                      )}

                      {/* If Resolved, show badge */}
                      {report.status === 'Resolved' && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1 text-[11px] text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Waste cleared & verified</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onSelectReport(report)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                    >
                      <span>Track Lifecycle</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] text-slate-400">
                      GPS: {report.location.latitude.toFixed(2)}, {report.location.longitude.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Map View */}
      {activeTab === 'map_view' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Your Neighborhood Incidents Map</h3>
            <p className="text-xs text-slate-500">
              Interactive map visualizing all reported garbage locations. Click on any marker to inspect
              details and track resolution.
            </p>
          </div>
          <div className="h-[500px] rounded-xl overflow-hidden border border-slate-200">
            <LeafletMap
              height="100%"
              zoom={13}
              center={[28.6139, 77.2090]}
              reports={reports}
              onReportClick={(r) => onSelectReport(r)}
              showLocateButton={true}
            />
          </div>
        </div>
      )}

      {/* Tab 3: Citizen Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-xl space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl">
              {user ? user.name.slice(0, 2).toUpperCase() : 'CT'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{user ? user.name : 'Resident Citizen'}</h3>
              <p className="text-xs text-slate-500">{user ? user.email : 'citizen@smartcity.gov'}</p>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 mt-1">
                Verified Citizen
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Phone Number:</span>
              <span className="font-semibold text-slate-800">{user?.phone || '+91 98112 23344'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Assigned Municipal Ward:</span>
              <span className="font-semibold text-slate-800">Central Zone - Ward 14</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Account Type:</span>
              <span className="font-semibold text-slate-800">Public Grievance Redressal</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Member Since:</span>
              <span className="font-semibold text-slate-800">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'February 2026'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
