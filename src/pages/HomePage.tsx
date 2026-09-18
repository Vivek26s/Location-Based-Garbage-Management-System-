import React, { useState } from 'react';
import {
  Trash2,
  MapPin,
  Shield,
  HardHat,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Activity,
  Award,
  PhoneCall,
  ChevronRight,
  Sparkles,
  Smartphone,
  Navigation,
} from 'lucide-react';
import { LeafletMap } from '../components/LeafletMap';
import { DashboardStats, Report } from '../types';
import { useAuth } from '../context/AuthContext';

interface HomePageProps {
  stats: DashboardStats | null;
  reports: Report[];
  onOpenReportModal: () => void;
  onOpenTrackModal: () => void;
  onNavigate: (view: string) => void;
  onSelectReport: (report: Report) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  stats,
  reports,
  onOpenReportModal,
  onOpenTrackModal,
  onNavigate,
  onSelectReport,
}) => {
  const { user, openAuthModal, quickDemoLogin } = useAuth();
  const [quickTrackId, setQuickTrackId] = useState('');

  const handleQuickTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTrackId.trim()) {
      onOpenTrackModal();
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:3rem_3rem]" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Smart City Municipal Waste Redressal Mission</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Cleaner Cities. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
              Smarter Waste Management.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Report garbage problems with exact GPS location, track cleaning operations in real-time,
            and empower sanitation workers to build a cleaner, sustainable smart city.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenReportModal}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/30 transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Report Garbage</span>
            </button>

            <button
              type="button"
              onClick={onOpenTrackModal}
              className="px-6 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 shadow-md transition flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-emerald-400" />
              <span>Track Complaint</span>
            </button>
          </div>

          {/* Quick Track Input Bar directly in Hero */}
          <div className="pt-6 max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-300 ml-3 shrink-0" />
              <input
                type="text"
                value={quickTrackId}
                onChange={(e) => setQuickTrackId(e.target.value.toUpperCase())}
                placeholder="Track complaint by ID (e.g. SWM-2026-1042)..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-400 px-2 py-2 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={onOpenTrackModal}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition whitespace-nowrap"
              >
                Track Now
              </button>
            </div>
          </div>
        </div>

        {/* Live Municipal Stats Bar */}
        <div className="relative max-w-6xl mx-auto mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {stats?.totalReports || 12}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Total Grievances Logged</div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {stats?.resolvedReports || 9}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Successfully Resolved</div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">
              {stats ? stats.inProgressReports + stats.assignedReports : 3}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Active Cleaning Units</div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">
              {stats?.totalWorkers || 3}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Dispatched Field Force</div>
          </div>
        </div>
      </section>

      {/* Real-time Interactive City Waste Map Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                Geographic Information System (GIS)
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Live City Garbage Incidents Map
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Real-time OpenStreetMap monitoring across municipal wards. Click any pin to inspect the
                grievance, photo proof, and cleaning status.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenReportModal}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Pin New Issue</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('admin')}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition"
              >
                Open Admin Map
              </button>
            </div>
          </div>

          <div className="h-96 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
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
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            Standard Redressal Workflow
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            How Smart Waste Management Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            A seamless, closed-loop civic platform connecting citizens, municipal controllers, and field sanitation workers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative group hover:border-emerald-500 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg mb-4">
              01
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Citizen Reports Issue</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Citizens click a photo, auto-detect GPS coordinates or pin the spot on the interactive map, and submit with a description.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative group hover:border-blue-500 transition">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg mb-4">
              02
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Admin Reviews & Dispatches</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Municipal command reviews the incoming grievance on the live city GIS map, assigns the nearest available sanitation worker, and sets priority.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative group hover:border-amber-500 transition">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-lg mb-4">
              03
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Worker Navigates & Cleans</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Field worker receives assignment on mobile dashboard, follows turn-by-turn navigation to the site, clears the waste, and uploads proof photo.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative group hover:border-emerald-500 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg mb-4">
              04
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Verified & Resolved</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Admin reviews completion proof, complaint is marked Resolved, and the citizen receives an instant notification with before/after photos.
            </p>
          </div>
        </div>
      </section>

      {/* Role Showcase Bento Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Citizen Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-3xl p-6 border border-emerald-200/80 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-md">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                Citizen Portal
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Public Participation</h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Log overflowing bins, street litter, park waste, and illegal dumps with one tap. Track your report status from submission to resolution.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 font-medium mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Automatic GPS Geolocation detection</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Live status tracking with unique report ID</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Real-time resolution notifications</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => {
                quickDemoLogin('citizen');
                onNavigate('citizen');
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
            >
              <span>Access Citizen Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Admin Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-3xl p-6 border border-blue-200/80 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4 shadow-md">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">
                Admin Command
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Central Municipal Operations</h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Complete bird's-eye view of municipal sanitation health. Allocate personnel, manage cleaning priorities, and monitor performance.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 font-medium mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Interactive ward map with custom status pins</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Automated and manual worker task dispatch</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Analytics on grievance categories & response time</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => {
                quickDemoLogin('admin');
                onNavigate('admin');
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
            >
              <span>Open Admin Command</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Worker Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-3xl p-6 border border-amber-200/80 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-4 shadow-md">
                <HardHat className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                Worker Dashboard
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Mobile Field Operations</h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Lightweight, field-ready mobile dashboard for sanitation drivers and sweepers. View daily tasks, route directions, and upload proof.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 font-medium mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>"Today's Tasks" list with priority urgency</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Turn-by-turn map navigation to waste spot</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Before/After completion image upload</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => {
                quickDemoLogin('worker');
                onNavigate('worker');
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
            >
              <span>Open Worker Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer / Municipal Contact */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200 pt-8 text-xs text-slate-500">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-700">Location Based Garbage Management System for Smart City</span>
          </div>
          <div>
            Swachh Bharat & Smart City GIS Initiative • Municipal Sanitation Helpline: <strong>1800-11-2244</strong>
          </div>
        </div>
      </footer>
    </div>
  );
};
