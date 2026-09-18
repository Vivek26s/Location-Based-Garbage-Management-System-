import { Request, Response } from 'express';
import { db } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { Report, ReportStatus, ReportPriority, WorkerTaskStatus } from '../../src/types';

export const createReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, description, image, location, priority } = req.body;

    if (!category || !description) {
      res.status(400).json({ success: false, message: 'Category and description are required.' });
      return;
    }

    if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
      res.status(400).json({ success: false, message: 'Valid GPS latitude and longitude coordinates are required.' });
      return;
    }

    const reports = db.getReports();
    const uniqueNumber = Math.floor(1000 + Math.random() * 9000);
    const reportId = `SWM-${new Date().getFullYear()}-${uniqueNumber}`;
    const now = new Date().toISOString();

    const userId = req.user?.id || 'usr-citizen-guest';
    const citizenName = req.user?.name || 'Citizen Reporter';

    // Default image if none provided
    const reportImage = image || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80';

    const newReport: Report = {
      id: `rep-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      reportId,
      userId,
      citizenName,
      citizenPhone: '',
      category,
      description,
      image: reportImage,
      location: {
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        address: location.address || `Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)}`,
      },
      status: 'Pending',
      priority: priority || 'Medium',
      createdAt: now,
      updatedAt: now,
    };

    reports.unshift(newReport);

    // Create confirmation notification
    const notifications = db.getNotifications();
    notifications.unshift({
      id: `notif-${Date.now()}`,
      userId,
      message: `Your complaint #${reportId} for "${category}" has been received and logged into the Smart City portal.`,
      type: 'info',
      reportId: newReport.id,
      read: false,
      createdAt: now,
    });

    db.save();

    res.status(201).json({
      success: true,
      message: 'Garbage grievance reported successfully.',
      report: newReport,
    });
  } catch (err: any) {
    console.error('Create report error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit report.', error: err.message });
  }
};

export const getReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, category, priority, search, workerId, userId, myReports } = req.query;
    let reports = [...db.getReports()];

    // If citizen requests their own reports or explicit myReports flag
    if (myReports === 'true' && req.user) {
      reports = reports.filter((r) => r.userId === req.user?.id);
    } else if (userId) {
      reports = reports.filter((r) => r.userId === String(userId));
    }

    if (status && status !== 'All') {
      reports = reports.filter((r) => r.status.toLowerCase() === String(status).toLowerCase());
    }

    if (category && category !== 'All') {
      reports = reports.filter((r) => r.category.toLowerCase() === String(category).toLowerCase());
    }

    if (priority && priority !== 'All') {
      reports = reports.filter((r) => r.priority.toLowerCase() === String(priority).toLowerCase());
    }

    if (workerId) {
      reports = reports.filter((r) => r.assignedWorkerId === String(workerId));
    }

    if (search) {
      const q = String(search).toLowerCase();
      reports = reports.filter(
        (r) =>
          r.reportId.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          (r.location.address && r.location.address.toLowerCase().includes(q)) ||
          (r.citizenName && r.citizenName.toLowerCase().includes(q)) ||
          (r.assignedWorkerName && r.assignedWorkerName.toLowerCase().includes(q))
      );
    }

    res.json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch reports.', error: err.message });
  }
};

export const getReportById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const reports = db.getReports();

    // Match by either internal id or public reportId (e.g. SWM-2026-1042)
    const report = reports.find(
      (r) => r.id === id || r.reportId.toUpperCase() === id.toUpperCase()
    );

    if (!report) {
      res.status(404).json({ success: false, message: `Report with identifier '${id}' not found.` });
      return;
    }

    res.json({
      success: true,
      report,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch report.', error: err.message });
  }
};

export const updateReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { category, description, priority, adminNotes, status } = req.body;

    const reports = db.getReports();
    const report = reports.find((r) => r.id === id || r.reportId === id);

    if (!report) {
      res.status(404).json({ success: false, message: 'Report not found.' });
      return;
    }

    if (category) report.category = category;
    if (description) report.description = description;
    if (priority) report.priority = priority as ReportPriority;
    if (adminNotes !== undefined) report.adminNotes = adminNotes;
    if (status) report.status = status as ReportStatus;

    report.updatedAt = new Date().toISOString();
    db.save();

    res.json({
      success: true,
      message: 'Report updated successfully.',
      report,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update report.', error: err.message });
  }
};

export const assignWorkerToReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { workerId, priority, adminNotes } = req.body;

    if (!workerId) {
      res.status(400).json({ success: false, message: 'workerId is required for assignment.' });
      return;
    }

    const reports = db.getReports();
    const report = reports.find((r) => r.id === id || r.reportId === id);

    if (!report) {
      res.status(404).json({ success: false, message: 'Report not found.' });
      return;
    }

    const workers = db.getWorkers();
    const worker = workers.find((w) => w.id === workerId);

    if (!worker) {
      res.status(404).json({ success: false, message: 'Worker not found.' });
      return;
    }

    report.assignedWorkerId = worker.id;
    report.assignedWorkerName = worker.name;
    report.status = 'Assigned';
    report.workerTaskStatus = 'Assigned';
    if (priority) report.priority = priority;
    if (adminNotes) report.adminNotes = adminNotes;
    report.updatedAt = new Date().toISOString();

    // Update worker task list if not present
    if (!worker.assignedTasks.includes(report.id)) {
      worker.assignedTasks.push(report.id);
    }
    worker.availability = 'On Duty';

    // Add notifications for Citizen and Worker
    const notifications = db.getNotifications();
    const now = new Date().toISOString();

    // To Citizen
    notifications.unshift({
      id: `notif-${Date.now()}-c`,
      userId: report.userId,
      message: `Action Update: Sanitation Officer ${worker.name} has been assigned to your report #${report.reportId}.`,
      type: 'info',
      reportId: report.id,
      read: false,
      createdAt: now,
    });

    // To Worker
    notifications.unshift({
      id: `notif-${Date.now()}-w`,
      userId: worker.id,
      message: `New Dispatch: You have been assigned garbage grievance #${report.reportId} (${report.category}). Priority: ${report.priority}.`,
      type: 'alert',
      reportId: report.id,
      read: false,
      createdAt: now,
    });

    db.save();

    res.json({
      success: true,
      message: `Report assigned to ${worker.name} successfully.`,
      report,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to assign worker.', error: err.message });
  }
};

export const updateReportStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, workerTaskStatus, workerNotes, adminNotes, completionImage } = req.body;

    const reports = db.getReports();
    const report = reports.find((r) => r.id === id || r.reportId === id);

    if (!report) {
      res.status(404).json({ success: false, message: 'Report not found.' });
      return;
    }

    const now = new Date().toISOString();

    if (workerTaskStatus) {
      report.workerTaskStatus = workerTaskStatus as WorkerTaskStatus;
      if (workerTaskStatus === 'Accepted') {
        report.status = 'Assigned';
      } else if (workerTaskStatus === 'On the Way' || workerTaskStatus === 'In Progress') {
        report.status = 'In Progress';
      } else if (workerTaskStatus === 'Completed') {
        report.status = 'Resolved';
        report.resolvedAt = now;
      }
    }

    if (status) {
      report.status = status as ReportStatus;
      if (status === 'Resolved') {
        report.resolvedAt = now;
        report.workerTaskStatus = 'Completed';
      } else if (status === 'In Progress') {
        report.workerTaskStatus = 'In Progress';
      } else if (status === 'Rejected') {
        report.resolvedAt = now;
      }
    }

    if (workerNotes !== undefined) report.workerNotes = workerNotes;
    if (adminNotes !== undefined) report.adminNotes = adminNotes;
    if (completionImage) report.completionImage = completionImage;
    report.updatedAt = now;

    // Send citizen notification about progress update
    const notifications = db.getNotifications();
    notifications.unshift({
      id: `notif-${Date.now()}-stat`,
      userId: report.userId,
      message: `Status Update: Complaint #${report.reportId} is now ${report.status}${report.workerTaskStatus ? ` (${report.workerTaskStatus})` : ''}.`,
      type: report.status === 'Resolved' ? 'success' : report.status === 'Rejected' ? 'warning' : 'info',
      reportId: report.id,
      read: false,
      createdAt: now,
    });

    db.save();

    res.json({
      success: true,
      message: `Report status updated to ${report.status}.`,
      report,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update report status.', error: err.message });
  }
};

export const deleteReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const reports = db.getReports();
    const index = reports.findIndex((r) => r.id === id || r.reportId === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Report not found.' });
      return;
    }

    // Citizen can only delete if Pending and owned by them; Admin can delete any
    const report = reports[index];
    if (req.user?.role !== 'admin' && report.userId !== req.user?.id) {
      res.status(403).json({ success: false, message: 'Unauthorized to delete this report.' });
      return;
    }

    reports.splice(index, 1);
    db.save();

    res.json({
      success: true,
      message: 'Report deleted successfully.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete report.', error: err.message });
  }
};
