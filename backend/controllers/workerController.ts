import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { Worker } from '../../src/types';

export const getWorkers = async (req: Request, res: Response): Promise<void> => {
  try {
    const workers = db.getWorkers();
    const reports = db.getReports();

    // Enrich workers with active task counts
    const enriched = workers.map((w) => {
      const activeTasks = reports.filter(
        (r) => r.assignedWorkerId === w.id && r.status !== 'Resolved' && r.status !== 'Rejected'
      );
      const completedTasks = reports.filter(
        (r) => r.assignedWorkerId === w.id && r.status === 'Resolved'
      );
      return {
        ...w,
        activeTasksCount: activeTasks.length,
        completedTasksCount: completedTasks.length,
      };
    });

    res.json({
      success: true,
      workers: enriched,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch workers.', error: err.message });
  }
};

export const createWorker = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, zone, vehicleNumber, password } = req.body;

    if (!name || !email) {
      res.status(400).json({ success: false, message: 'Name and email are required.' });
      return;
    }

    const workers = db.getWorkers();
    const existingWorker = workers.find((w) => w.email.toLowerCase() === email.toLowerCase());
    if (existingWorker) {
      res.status(409).json({ success: false, message: 'Worker with this email already exists.' });
      return;
    }

    const users = db.getUsers();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || 'worker123', salt);

    const workerId = `usr-worker-${Date.now()}`;

    // Create user account
    users.push({
      id: workerId,
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      role: 'worker',
      createdAt: new Date().toISOString(),
      passwordHash,
    });

    const newWorker: Worker = {
      id: workerId,
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      availability: 'Available',
      assignedTasks: [],
      zone: zone || 'General Municipal Zone',
      vehicleNumber: vehicleNumber || 'Unassigned',
    };

    workers.push(newWorker);
    db.save();

    res.status(201).json({
      success: true,
      message: 'Sanitation worker profile created successfully.',
      worker: newWorker,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to create worker.', error: err.message });
  }
};

export const updateWorker = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, phone, zone, vehicleNumber, availability } = req.body;

    const workers = db.getWorkers();
    const worker = workers.find((w) => w.id === id);

    if (!worker) {
      res.status(404).json({ success: false, message: 'Worker not found.' });
      return;
    }

    if (name) worker.name = name;
    if (phone) worker.phone = phone;
    if (zone) worker.zone = zone;
    if (vehicleNumber) worker.vehicleNumber = vehicleNumber;
    if (availability) worker.availability = availability;

    // Update corresponding user record
    const users = db.getUsers();
    const user = users.find((u) => u.id === id);
    if (user) {
      if (name) user.name = name;
      if (phone) user.phone = phone;
    }

    db.save();

    res.json({
      success: true,
      message: 'Worker details updated.',
      worker,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update worker.', error: err.message });
  }
};

export const deleteWorker = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const workers = db.getWorkers();
    const index = workers.findIndex((w) => w.id === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Worker not found.' });
      return;
    }

    workers.splice(index, 1);

    // Also remove from users
    const users = db.getUsers();
    const uIndex = users.findIndex((u) => u.id === id);
    if (uIndex !== -1) {
      users.splice(uIndex, 1);
    }

    db.save();

    res.json({
      success: true,
      message: 'Worker removed successfully.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete worker.', error: err.message });
  }
};

export const getWorkerTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workerId = req.params.id || req.user?.id;
    if (!workerId) {
      res.status(400).json({ success: false, message: 'Worker ID required.' });
      return;
    }

    const reports = db.getReports();
    const workerReports = reports.filter((r) => r.assignedWorkerId === workerId);

    const active = workerReports.filter((r) => r.status !== 'Resolved' && r.status !== 'Rejected');
    const completed = workerReports.filter((r) => r.status === 'Resolved');

    res.json({
      success: true,
      workerId,
      todayTasks: active,
      historyTasks: completed,
      totalAssigned: workerReports.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch worker tasks.', error: err.message });
  }
};
