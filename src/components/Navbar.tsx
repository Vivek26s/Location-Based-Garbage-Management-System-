import React from 'react';
import {
  Trash2,
  MapPin,
  Shield,
  HardHat,
  User,
  LogOut,
  PlusCircle,
  Search,
  Sparkles,
  LayoutDashboard,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenReportModal: () => void;
  onOpenTrackModal: () => void;
  onSelectReportId?: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenReportModal,
  onOpenTrackModal,
  onSelectReportId,
}) => {
  const { user, logout, openAuthModal, quickDemoLogin } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Smart City Government Tech Banner / Quick Demo Bar */}
      <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-[11px] flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-emerald-400">SMART CITY MUNICIPAL PORTAL</span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400">Location Based Garbage Management System</span>
        </div>

        {/* Quick Demo Switcher for Examiners / Reviewers */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-slate-400 mr-1 hidden md:inline">Quick Demo Switch:</span>
          <button
            type="button"
            onClick={() => {
              quickDemoLogin('citizen');
              onNavigate('citizen');
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
              user?.role === 'citizen'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Switch to Citizen Account"
          >
            👤 Citizen
          </button>
          <button
            type="button"
            onClick={() => {
              quickDemoLogin('admin');
              onNavigate('admin');
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
              user?.role === 'admin'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Switch to Municipal Admin Account"
          >
            🛡️ Admin
          </button>
          <button
            type="button"
            onClick={() => {
              quickDemoLogin('worker');
              onNavigate('worker');
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
              user?.role === 'worker'
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Switch to Sanitation Worker Account"
          >
            👷 Worker
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left focus:outline-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight leading-tight flex items-center gap-1.5">
              <span>SmartClean</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                GIS
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Smart City Waste Management</div>
          </div>
        </button>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`px-3 py-2 rounded-lg transition ${
              currentView === 'home'
                ? 'text-emerald-700 bg-emerald-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => onNavigate('citizen')}
            className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
              currentView === 'citizen'
                ? 'text-emerald-700 bg-emerald-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Citizen Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('admin')}
            className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
              currentView === 'admin'
                ? 'text-blue-700 bg-blue-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Command</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('worker')}
            className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
              currentView === 'worker'
                ? 'text-amber-700 bg-amber-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <HardHat className="w-3.5 h-3.5" />
            <span>Worker Field Tasks</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick Track Complaint Button */}
          <button
            type="button"
            onClick={onOpenTrackModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Track Complaint</span>
          </button>

          {/* Primary CTA: Report Garbage */}
          <button
            type="button"
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Garbage</span>
          </button>

          {/* Notification dropdown */}
          <NotificationDropdown onSelectReport={onSelectReportId} />

          {/* Auth Button or Profile Info */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                  {user.name}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-700">
                  {user.role}
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 bg-slate-50/70 px-2 py-1.5 text-[11px] font-semibold text-slate-600">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className={`py-1 px-2 rounded ${currentView === 'home' ? 'text-emerald-700 font-bold' : ''}`}
        >
          Home
        </button>
        <button
          type="button"
          onClick={() => onNavigate('citizen')}
          className={`py-1 px-2 rounded ${currentView === 'citizen' ? 'text-emerald-700 font-bold' : ''}`}
        >
          Citizen
        </button>
        <button
          type="button"
          onClick={() => onNavigate('admin')}
          className={`py-1 px-2 rounded ${currentView === 'admin' ? 'text-blue-700 font-bold' : ''}`}
        >
          Admin
        </button>
        <button
          type="button"
          onClick={() => onNavigate('worker')}
          className={`py-1 px-2 rounded ${currentView === 'worker' ? 'text-amber-700 font-bold' : ''}`}
        >
          Worker
        </button>
        <button
          type="button"
          onClick={onOpenTrackModal}
          className="py-1 px-2 rounded text-slate-700 font-medium flex items-center gap-1"
        >
          <Search className="w-3 h-3" /> Track
        </button>
      </div>
    </header>
  );
};
