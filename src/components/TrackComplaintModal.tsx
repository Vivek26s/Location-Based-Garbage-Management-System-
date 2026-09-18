import React, { useState } from 'react';
import { X, Search, CheckCircle2, Clock, AlertTriangle, MapPin, User, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { Report, ReportStatus } from '../types';
import { api } from '../services/api';
import { LeafletMap } from './LeafletMap';

interface TrackComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReportId?: string;
}

export const TrackComplaintModal: React.FC<TrackComplaintModalProps> = ({
  isOpen,
  onClose,
  initialReportId = '',
}) => {
  const [query, setQuery] = useState(initialReportId || 'SWM-2026-1042');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getReportById(query.trim());
      if (res.success && res.report) {
        setReport(res.report);
      } else {
        setError(`No complaint found with ID "${query}". Please check the number.`);
        setReport(null);
      }
    } catch (err: any) {
      setError(err.message || `No complaint found with ID "${query}".`);
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusStep = (status: ReportStatus) => {
    switch (status) {
      case 'Pending':
        return 1;
      case 'Assigned':
        return 2;
      case 'In Progress':
        return 3;
      case 'Resolved':
        return 4;
      case 'Rejected':
        return -1;
      default:
        return 1;
    }
  };

  const currentStep = report ? getStatusStep(report.status) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Track Municipal Complaint</h3>
              <p className="text-[11px] text-slate-500">Live Smart City Waste Redressal Tracking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value.toUpperCase())}
                placeholder="Enter Complaint ID (e.g. SWM-2026-1042)"
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 uppercase tracking-wider font-semibold"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Search</span>}
            </button>
          </form>

          {/* Quick chip suggestions */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span>Try sample complaints:</span>
            {['SWM-2026-1042', 'SWM-2026-1043', 'SWM-2026-1044', 'SWM-2026-1039'].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setQuery(id);
                  api.getReportById(id).then((r) => r.report && setReport(r.report));
                }}
                className="text-emerald-700 hover:underline font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100"
              >
                {id}
              </button>
            ))}
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {report && (
            <div className="space-y-6 pt-2 border-t border-slate-100">
              {/* Status Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Complaint Reference</div>
                  <div className="text-xl font-extrabold text-slate-900 font-mono">{report.reportId}</div>
                  <div className="text-xs text-slate-600 mt-0.5">{report.category}</div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Current Status</div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${
                      report.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : report.status === 'In Progress'
                        ? 'bg-amber-100 text-amber-800'
                        : report.status === 'Assigned'
                        ? 'bg-blue-100 text-blue-800'
                        : report.status === 'Rejected'
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {report.status} {report.workerTaskStatus ? `• ${report.workerTaskStatus}` : ''}
                  </span>
                </div>
              </div>

              {/* Progress Timeline Stepper */}
              <div className="py-2">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Grievance Lifecycle</div>
                <div className="grid grid-cols-4 gap-2 relative">
                  {[
                    { step: 1, title: 'Reported', desc: 'Complaint Logged' },
                    { step: 2, title: 'Assigned', desc: 'Officer Dispatched' },
                    { step: 3, title: 'In Progress', desc: 'Waste Cleaning' },
                    { step: 4, title: 'Resolved', desc: 'Inspection Verified' },
                  ].map((s) => {
                    const isPassed = currentStep >= s.step;
                    const isCurrent = currentStep === s.step;
                    return (
                      <div key={s.step} className="flex flex-col items-center text-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition ${
                            isPassed
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                          } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}
                        >
                          {isPassed ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                        </div>
                        <div className="font-semibold text-xs text-slate-800">{s.title}</div>
                        <div className="text-[10px] text-slate-400 leading-tight hidden sm:block">{s.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Details and Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before Image & Description */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700">Citizen Reported Image</div>
                  <div className="h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img src={report.image} alt={report.category} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    "{report.description}"
                  </p>
                </div>

                {/* Map location or Resolution Proof */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Location on Map</span>
                    <span className="text-[10px] font-normal text-slate-500 truncate max-w-[150px]">
                      {report.location.address || 'GPS Coordinates'}
                    </span>
                  </div>
                  <div className="h-44 rounded-xl overflow-hidden border border-slate-200">
                    <LeafletMap
                      height="100%"
                      zoom={15}
                      center={[report.location.latitude, report.location.longitude]}
                      reports={[report]}
                      showLocateButton={false}
                    />
                  </div>

                  {/* If Resolved, show Worker Completion proof */}
                  {report.completionImage && (
                    <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                      <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Worker Resolution Proof Photo</span>
                      </div>
                      <div className="h-32 rounded-lg overflow-hidden border border-emerald-300">
                        <img src={report.completionImage} alt="Cleaned site" className="w-full h-full object-cover" />
                      </div>
                      {report.workerNotes && (
                        <p className="text-[11px] text-emerald-900 italic">
                          Worker Note: {report.workerNotes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Assignment & Notes Meta */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-slate-400">Assigned Officer: </span>
                  <strong className="text-slate-800 font-medium">
                    {report.assignedWorkerName || 'Awaiting municipal assignment'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Date Logged: </span>
                  <strong className="text-slate-800 font-medium">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </strong>
                </div>
                {report.adminNotes && (
                  <div className="col-span-full">
                    <span className="text-slate-400">Admin Remarks: </span>
                    <span className="text-slate-700">{report.adminNotes}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
