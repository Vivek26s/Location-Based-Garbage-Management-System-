import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/db';
import { generateToken, AuthRequest } from '../middleware/auth';
import { UserRole } from '../../src/types';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email and password are required.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      return;
    }

    const users = db.getUsers();
    const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const userRole: UserRole = role && ['citizen', 'worker', 'admin'].includes(role) ? role : 'citizen';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      id: `usr-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      role: userRole,
      createdAt: new Date().toISOString(),
      passwordHash,
    };

    users.push(newUser);

    // If role is worker, also create worker record in workers collection
    if (userRole === 'worker') {
      const workers = db.getWorkers();
      workers.push({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        availability: 'Available',
        assignedTasks: [],
        zone: 'Assigned District Ward',
        vehicleNumber: 'Pending Allocation',
      });
    }

    db.save();

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.', error: err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const users = db.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.', error: err.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const users = db.getUsers();
    const user = users.find((u) => u.id === req.user?.id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch user profile.', error: err.message });
  }
};

export const getDemoCredentials = (req: Request, res: Response): void => {
  res.json({
    success: true,
    demoAccounts: [
      {
        role: 'citizen',
        name: 'Priya Sharma (Citizen)',
        email: 'citizen@smartcity.gov',
        password: 'citizen123',
        description: 'Report waste issues with GPS, view reports, track live status',
      },
      {
        role: 'admin',
        name: 'Dr. Alok Verma (Admin)',
        email: 'admin@smartcity.gov',
        password: 'admin123',
        description: 'Full municipal operations, worker dispatch, interactive city map, analytics',
      },
      {
        role: 'worker',
        name: 'Rajesh Kumar (Worker)',
        email: 'worker@smartcity.gov',
        password: 'worker123',
        description: 'Mobile task view, navigation, step-by-step progress, completion photo upload',
      },
    ],
  });
};
