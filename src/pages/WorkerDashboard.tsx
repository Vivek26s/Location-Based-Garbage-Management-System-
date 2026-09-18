import React, { useState, useEffect } from 'react';
import {
  HardHat,
  MapPin,
  Navigation,
  CheckCircle2,
  Clock,
  Camera,
  Upload,
  ArrowRight,
  Truck,
  FileCheck,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import { Report, WorkerTaskStatus } from '../types';
import { LeafletMap } from '../components/LeafletMap';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface WorkerDashboardProps {
  onSelectReport?: (report: Report) => void;
}

const SAMPLE_CLEANED_IMAGES = [
  'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
];

export const WorkerDashboard: React.FC<WorkerDashboardProps> = () => {
  const { user, openAuthModal, quickDemoLogin } = useAuth();
  const [todayTasks, setTodayTasks] = useState<Report[]>([]);
  const [historyTasks, setHistoryTasks] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');

  // Active Task for Map/Route View
  const [selectedTask, setSelectedTask] = useState<Report | null>(null);

  // Completion Modal
  const [completingTask, setCompletingTask] = useState<Report | null>(null);
  const [completionImage, setCompletionImage] = useState<string>('');
  const [completionNotes, setCompletionNotes] = useState<string>('');
  const [isSubmittingCompletion, setIsSubmittingCompletion] = useState(false);

  // Success banner
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchWorkerTasks = async () => {
    setIsLoading(true);
    try {
      // If worker is logged in, pass their id, otherwise fallback to worker-1 Rajesh Kumar
      const workerId = user?.role === 'worker' ? user.id : 'usr-worker-1';
      const res = await api.getWorkerTasks(workerId);
      if (res.success) {
        setTodayTasks(res.todayTasks);
        setHistoryTasks(res.historyTasks);
        if (res.todayTasks.length > 0 && !selectedTask) {
          setSelectedTask(res.todayTasks[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load worker tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerTasks();
  }, [user]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Status transition: Accepted -> On the Way -> In Progress -> Completed
  const handleTransitionStatus = async (task: Report, nextStatus: WorkerTaskStatus) => {
    if (nextStatus === 'Completed') {
      setCompletingTask(task);
      setCompletionImage(SAMPLE_CLEANED_IMAGES[0]);
      return;
    }

    try {
      const res = await api.updateReportStatus(task.id, {
        workerTaskStatus: nextStatus,
      });
      if (res.success) {
        showToast(`Task status updated to: "${nextStatus}"`);
        await fetchWorkerTasks();
      }
    } catch (err: any) {
      alert(err.message || 'Status transition failed');
    }
  };

  // Submit Completion with Proof Photo
  const handleCompleteSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingTask) return;

    setIsSubmittingCompletion(true);
    try {
      const res = await api.updateReportStatus(completingTask.id, {
        workerTaskStatus: 'Completed',
        completionImage: completionImage || SAMPLE_CLEANED_IMAGES[0],
        workerNotes: completionNotes || 'Cleaned and cleared using municipal vehicle.',
      });

      if (res.success) {
        showToast(`Complaint #${completingTask.reportId} marked Completed with proof photo!`);
        setCompletingTask(null);
        setCompletionNotes('');
        await fetchWorkerTasks();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to complete task');
    } finally {
      setIsSubmittingCompletion(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompletionImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openExternalRoute = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Mobile-friendly Worker Header */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-700 to-amber-900 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs">
            <HardHat className="w-3.5 h-3.5" />
            <span>Field Worker Sanitation Console</span>
          </div>
          <h1 className="text-2xl font-black">
            Officer: {user?.role === 'worker' ? user.name : 'Rajesh Kumar (Field Force)'}
          </h1>
          <p className="text-xs text-amber-100">
            Vehicle: <strong>DL-1SM-4421 (Hydraulic Tipper)</strong> • Zone: Sector 4 & Central Ward
          </p>
        </div>

        {(!user || user.role !== 'worker') && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => quickDemoLogin('worker')}
              className="px-4 py-2.5 bg-white text-amber-900 font-bold text-xs rounded-xl shadow-md transition hover:bg-amber-50"
            >
              Sign In as Worker Rajesh
            </button>
          </div>
        )}
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('today')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'today'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Today's Active Tasks ({todayTasks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Completed Task History ({historyTasks.length})</span>
        </button>
      </div>

      {/* TAB 1: Today's Tasks */}
      {activeTab === 'today' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Task List */}
          <div className="lg:col-span-7 space-y-4">
            {todayTasks.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="font-bold text-slate-800 text-base">All caught up!</h3>
                <p className="text-xs text-slate-500">
                  No pending garbage tasks assigned to your vehicle right now.
                </p>
              </div>
            ) : (
              todayTasks.map((task) => {
                const isSelected = selectedTask?.id === task.id;
                const status = task.workerTaskStatus || 'Assigned';

                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={`bg-white rounded-3xl p-5 border transition cursor-pointer flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? 'border-amber-500 shadow-md ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-slate-900">
                            {task.reportId}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              task.priority === 'Critical'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {task.priority} Priority
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">{task.category}</h4>
                      </div>

                      {/* Status Tag */}
                      <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold">
                        {status}
                      </span>
                    </div>

                    {/* Image & Description */}
                    <div className="flex gap-3 items-center">
                      <img
                        src={task.image}
                        alt=""
                        className="w-20 h-20 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                      />
                      <div className="space-y-1 text-xs">
                        <p className="text-slate-600 line-clamp-2">{task.description}</p>
                        <div className="flex items-center gap-1 text-slate-500 text-[11px] pt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{task.location.address || 'Smart City Ward'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Workflow Progress Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openExternalRoute(task.location.latitude, task.location.longitude);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Navigation className="w-3.5 h-3.5 text-blue-600" />
                        <span>Navigate GPS</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {status === 'Assigned' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTransitionStatus(task, 'Accepted');
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
                          >
                            Accept Task
                          </button>
                        )}

                        {status === 'Accepted' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTransitionStatus(task, 'On the Way');
                            }}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition"
                          >
                            Start Journey (On the Way)
                          </button>
                        )}

                        {status === 'On the Way' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTransitionStatus(task, 'In Progress');
                            }}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition"
                          >
                            Arrived & Cleaning (In Progress)
                          </button>
                        )}

                        {status === 'In Progress' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTransitionStatus(task, 'Completed');
                            }}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Mark Completed (Upload Proof)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Selected Task Map & Navigation Focus */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3 sticky top-24">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Site Location & Route</h3>
                  <p className="text-[11px] text-slate-500">
                    {selectedTask
                      ? `Targeting Complaint #${selectedTask.reportId}`
                      : 'Select a task to view coordinates'}
                  </p>
                </div>

                {selectedTask && (
                  <button
                    type="button"
                    onClick={() =>
                      openExternalRoute(
                        selectedTask.location.latitude,
                        selectedTask.location.longitude
                      )
                    }
                    className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Maps</span>
                  </button>
                )}
              </div>

              {selectedTask ? (
                <div className="space-y-3">
                  <div className="h-64 rounded-2xl overflow-hidden border border-slate-200">
                    <LeafletMap
                      height="100%"
                      zoom={15}
                      center={[selectedTask.location.latitude, selectedTask.location.longitude]}
                      reports={[selectedTask]}
                      showLocateButton={false}
                    />
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Address / Landmark</div>
                    <div className="font-semibold text-slate-800">
                      {selectedTask.location.address || 'Smart City Ward Coordinates'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      GPS: {selectedTask.location.latitude.toFixed(5)}°N,{' '}
                      {selectedTask.location.longitude.toFixed(5)}°E
                    </div>
                    {selectedTask.adminNotes && (
                      <div className="pt-2 border-t border-slate-200 text-[11px] text-amber-900 bg-amber-50 p-2 rounded">
                        <strong>Admin Instruction:</strong> {selectedTask.adminNotes}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-64 rounded-2xl bg-slate-50 flex items-center justify-center text-xs text-slate-400">
                  Select a task to preview map
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Task History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Completed Task History</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {historyTasks.map((task) => (
              <div
                key={task.id}
                className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono font-bold text-xs text-slate-900">{task.reportId}</span>
                    <div className="text-xs font-bold text-emerald-800 mt-0.5">{task.category}</div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                    Resolved
                  </span>
                </div>

                {/* Completion proof thumbnail */}
                {task.completionImage && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400">Resolution Photo Proof:</span>
                    <div className="h-28 rounded-xl overflow-hidden border border-emerald-200">
                      <img
                        src={task.completionImage}
                        alt="Resolution proof"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                <div className="text-[11px] text-slate-600">
                  <span className="text-slate-400">Notes: </span>
                  {task.workerNotes || 'Cleaned and cleared successfully.'}
                </div>

                <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-200">
                  Resolved on: {task.resolvedAt ? new Date(task.resolvedAt).toLocaleDateString() : 'Recent'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMPLETION PROOF UPLOAD MODAL */}
      {completingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Complete Task: #{completingTask.reportId}
                </h3>
                <p className="text-xs text-slate-500">Upload clean site proof photograph</p>
              </div>
              <button
                type="button"
                onClick={() => setCompletingTask(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmission} className="p-6 space-y-4">
              {/* Proof Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  1. Clean Site Photo Proof <span className="text-red-500">*</span>
                </label>

                <div className="space-y-3">
                  <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-slate-50 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Camera className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-700">Take Photo / Upload Clean Site</span>
                    <span className="text-[10px] text-slate-400">Shows waste has been lifted</span>
                  </label>

                  {/* Sample selection */}
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">
                      Or pick simulated cleaned proof:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {SAMPLE_CLEANED_IMAGES.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setCompletionImage(url)}
                          className={`h-16 rounded-lg overflow-hidden border-2 transition ${
                            completionImage === url
                              ? 'border-emerald-600 ring-2 ring-emerald-200'
                              : 'border-slate-200'
                          }`}
                        >
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {completionImage && (
                    <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Ready with proof photo
                    </div>
                  )}
                </div>
              </div>

              {/* Completion Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. Cleaning Operation Notes
                </label>
                <textarea
                  rows={2}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="e.g. 1.2 tonnes lifted using hydraulic arm. Site sanitized."
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCompletingTask(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCompletion}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingCompletion ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Submit Proof & Complete</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
