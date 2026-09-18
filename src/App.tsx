import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { ReportModal } from './components/ReportModal';
import { TrackComplaintModal } from './components/TrackComplaintModal';
import { HomePage } from './pages/HomePage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { WorkerDashboard } from './pages/WorkerDashboard';
import { Report, DashboardStats } from './types';
import { api } from './services/api';

function MainApp() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'citizen' | 'admin' | 'worker'>('home');
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [activeTrackingReportId, setActiveTrackingReportId] = useState<string | null>(null);

  const fetchGlobalData = async () => {
    try {
      const [reportsRes, statsRes] = await Promise.all([
        api.getReports(),
        api.getDashboardStats(),
      ]);
      if (reportsRes.success) setReports(reportsRes.reports);
      if (statsRes.success) setStats(statsRes.stats);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    fetchGlobalData();
  }, []);

  const handleOpenReportModal = () => {
    setIsReportModalOpen(true);
  };

  const handleOpenTrackModal = (reportId?: string) => {
    if (reportId) {
      setActiveTrackingReportId(reportId);
    }
    setIsTrackModalOpen(true);
  };

  const handleSelectReport = (report: Report) => {
    setActiveTrackingReportId(report.reportId);
    setIsTrackModalOpen(true);
  };

  const handleReportSubmitted = (newReport: Report) => {
    fetchGlobalData();
    // After report submission, open the tracker so citizen sees their unique ID and progress
    setActiveTrackingReportId(newReport.reportId);
    setIsTrackModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view as any)}
        onOpenReportModal={handleOpenReportModal}
        onOpenTrackModal={() => handleOpenTrackModal()}
        onSelectReportId={(id) => handleOpenTrackModal(id)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            stats={stats}
            reports={reports}
            onOpenReportModal={handleOpenReportModal}
            onOpenTrackModal={() => handleOpenTrackModal()}
            onNavigate={(view) => setCurrentView(view as any)}
            onSelectReport={handleSelectReport}
          />
        )}

        {currentView === 'citizen' && (
          <CitizenDashboard
            onOpenReportModal={handleOpenReportModal}
            onSelectReport={handleSelectReport}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard onSelectReport={handleSelectReport} />
        )}

        {currentView === 'worker' && (
          <WorkerDashboard onSelectReport={handleSelectReport} />
        )}
      </main>

      {/* Global Modals */}
      <AuthModal />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={handleReportSubmitted}
      />

      <TrackComplaintModal
        isOpen={isTrackModalOpen}
        initialReportId={activeTrackingReportId || undefined}
        onClose={() => {
          setIsTrackModalOpen(false);
          setActiveTrackingReportId(null);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
