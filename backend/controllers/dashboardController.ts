import { Request, Response } from 'express';
import { db } from '../config/db';
import { DashboardStats } from '../../src/types';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const reports = db.getReports();
    const workers = db.getWorkers();

    const totalReports = reports.length;
    const pendingReports = reports.filter((r) => r.status === 'Pending').length;
    const assignedReports = reports.filter((r) => r.status === 'Assigned').length;
    const inProgressReports = reports.filter((r) => r.status === 'In Progress').length;
    const resolvedReports = reports.filter((r) => r.status === 'Resolved').length;
    const rejectedReports = reports.filter((r) => r.status === 'Rejected').length;

    const totalWorkers = workers.length;
    const activeWorkers = workers.filter((w) => w.availability === 'On Duty' || w.availability === 'Available').length;

    const categoryStats: { [category: string]: number } = {
      'Overflowing Dustbin': 0,
      'Garbage on Road': 0,
      'Garbage Near Park': 0,
      'Garbage on Empty Plot': 0,
      'Other': 0,
    };

    reports.forEach((r) => {
      if (categoryStats[r.category] !== undefined) {
        categoryStats[r.category]++;
      } else {
        categoryStats[r.category] = 1;
      }
    });

    const recentReports = [...reports]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);

    const locationPoints = reports.map((r) => ({
      id: r.id,
      reportId: r.reportId,
      category: r.category,
      status: r.status,
      latitude: r.location.latitude,
      longitude: r.location.longitude,
      address: r.location.address,
      image: r.image,
    }));

    const stats: DashboardStats = {
      totalReports,
      pendingReports,
      assignedReports,
      inProgressReports,
      resolvedReports,
      rejectedReports,
      totalWorkers,
      activeWorkers,
      categoryStats,
      recentReports,
      locationPoints,
    };

    res.json({
      success: true,
      stats,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to compute dashboard stats.', error: err.message });
  }
};

export const resetDatabaseSeed = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = db.resetToSeed();
    res.json({
      success: true,
      message: 'Smart City database reset to official presentation seed data.',
      stats: {
        users: data.users.length,
        reports: data.reports.length,
        workers: data.workers.length,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to reset seed.', error: err.message });
  }
};
