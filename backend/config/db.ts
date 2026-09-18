import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, Report, Worker, Notification } from '../../src/types';

export interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  reports: Report[];
  workers: Worker[];
  notifications: Notification[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'smartcity_db.json');

// Default initial seed data representing a Smart City Municipal Ward (e.g. New Delhi / Central Metro Ward)
const getInitialSeed = (): DatabaseSchema => {
  const salt = bcrypt.genSaltSync(10);
  const defaultPassHash = bcrypt.hashSync('password123', salt);
  const adminPassHash = bcrypt.hashSync('admin123', salt);
  const workerPassHash = bcrypt.hashSync('worker123', salt);
  const citizenPassHash = bcrypt.hashSync('citizen123', salt);

  const users: (User & { passwordHash: string })[] = [
    {
      id: 'usr-admin-1',
      name: 'Dr. Alok Verma',
      email: 'admin@smartcity.gov',
      phone: '+91 98765 43210',
      role: 'admin',
      createdAt: '2026-01-10T08:00:00.000Z',
      passwordHash: adminPassHash,
    },
    {
      id: 'usr-citizen-1',
      name: 'Priya Sharma',
      email: 'citizen@smartcity.gov',
      phone: '+91 98112 23344',
      role: 'citizen',
      createdAt: '2026-02-01T10:30:00.000Z',
      passwordHash: citizenPassHash,
    },
    {
      id: 'usr-citizen-2',
      name: 'Rohan Mehra',
      email: 'rohan.mehra@example.com',
      phone: '+91 98223 34455',
      role: 'citizen',
      createdAt: '2026-02-15T14:20:00.000Z',
      passwordHash: defaultPassHash,
    },
    {
      id: 'usr-worker-1',
      name: 'Rajesh Kumar',
      email: 'worker@smartcity.gov',
      phone: '+91 99100 11223',
      role: 'worker',
      createdAt: '2026-01-15T09:00:00.000Z',
      passwordHash: workerPassHash,
    },
    {
      id: 'usr-worker-2',
      name: 'Sunita Devi',
      email: 'sunita.devi@smartcity.gov',
      phone: '+91 99200 22334',
      role: 'worker',
      createdAt: '2026-01-20T09:00:00.000Z',
      passwordHash: defaultPassHash,
    },
    {
      id: 'usr-worker-3',
      name: 'Amit Singh',
      email: 'amit.singh@smartcity.gov',
      phone: '+91 99300 33445',
      role: 'worker',
      createdAt: '2026-02-05T09:00:00.000Z',
      passwordHash: defaultPassHash,
    },
  ];

  const workers: Worker[] = [
    {
      id: 'usr-worker-1',
      name: 'Rajesh Kumar',
      email: 'worker@smartcity.gov',
      phone: '+91 99100 11223',
      availability: 'On Duty',
      zone: 'Sector 4 & Central Market',
      vehicleNumber: 'DL-1SM-4421 (Hydraulic Tipper)',
      assignedTasks: ['rep-001', 'rep-003'],
    },
    {
      id: 'usr-worker-2',
      name: 'Sunita Devi',
      email: 'sunita.devi@smartcity.gov',
      phone: '+91 99200 22334',
      availability: 'Available',
      zone: 'Green Valley & City Park',
      vehicleNumber: 'DL-1SM-8902 (Compactor)',
      assignedTasks: ['rep-002'],
    },
    {
      id: 'usr-worker-3',
      name: 'Amit Singh',
      email: 'amit.singh@smartcity.gov',
      phone: '+91 99300 33445',
      availability: 'Available',
      zone: 'Industrial Corridor & Ring Road',
      vehicleNumber: 'DL-1SM-1290 (Mini Dumper)',
      assignedTasks: [],
    },
  ];

  const reports: Report[] = [
    {
      id: 'rep-001',
      reportId: 'SWM-2026-1042',
      userId: 'usr-citizen-1',
      citizenName: 'Priya Sharma',
      citizenPhone: '+91 98112 23344',
      category: 'Overflowing Dustbin',
      description: 'The community trash bin at Block C corner has been overflowing for 3 days. Foul smell spreading across the market street.',
      image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
      location: {
        latitude: 28.6139,
        longitude: 77.2090,
        address: 'Block C Market, Connaught Place Outer Ring, New Delhi',
      },
      status: 'In Progress',
      priority: 'High',
      assignedWorkerId: 'usr-worker-1',
      assignedWorkerName: 'Rajesh Kumar',
      workerTaskStatus: 'In Progress',
      adminNotes: 'Assigned to Sector 4 rapid response team. Priority clearing.',
      workerNotes: 'Dispatched vehicle DL-1SM-4421. Arrived on site, mechanical loader engaged.',
      createdAt: '2026-09-15T09:30:00.000Z',
      updatedAt: '2026-09-17T11:15:00.000Z',
    },
    {
      id: 'rep-002',
      reportId: 'SWM-2026-1043',
      userId: 'usr-citizen-2',
      citizenName: 'Rohan Mehra',
      citizenPhone: '+91 98223 34455',
      category: 'Garbage Near Park',
      description: 'Huge pile of dry leaves and plastic wrappers dumped right outside the main gate of Children Memorial Park.',
      image: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80',
      location: {
        latitude: 28.6219,
        longitude: 77.2140,
        address: 'Gate 2, Children Memorial Public Park, Shivaji Stadium Road',
      },
      status: 'Assigned',
      priority: 'Medium',
      assignedWorkerId: 'usr-worker-2',
      assignedWorkerName: 'Sunita Devi',
      workerTaskStatus: 'Accepted',
      adminNotes: 'Clear before evening park rush hours.',
      createdAt: '2026-09-16T14:10:00.000Z',
      updatedAt: '2026-09-16T16:00:00.000Z',
    },
    {
      id: 'rep-003',
      reportId: 'SWM-2026-1044',
      userId: 'usr-citizen-1',
      citizenName: 'Priya Sharma',
      citizenPhone: '+91 98112 23344',
      category: 'Garbage on Road',
      description: 'Construction debris and mixed solid waste dumped on the service lane causing severe traffic bottleneck.',
      image: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=800&q=80',
      location: {
        latitude: 28.6080,
        longitude: 77.2185,
        address: 'Service Lane near Metro Pillar 148, Barakhamba Road',
      },
      status: 'Pending',
      priority: 'Critical',
      adminNotes: 'Requires inspection by municipal enforcement team.',
      createdAt: '2026-09-17T08:15:00.000Z',
      updatedAt: '2026-09-17T08:15:00.000Z',
    },
    {
      id: 'rep-004',
      reportId: 'SWM-2026-1039',
      userId: 'usr-citizen-2',
      citizenName: 'Rohan Mehra',
      citizenPhone: '+91 98223 34455',
      category: 'Garbage on Empty Plot',
      description: 'Illegal midnight trash dumping on the corner unconstructed commercial plot.',
      image: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&w=800&q=80',
      location: {
        latitude: 28.6295,
        longitude: 77.2020,
        address: 'Plot 48-B, Commercial District, Gole Market',
      },
      status: 'Resolved',
      priority: 'Medium',
      assignedWorkerId: 'usr-worker-1',
      assignedWorkerName: 'Rajesh Kumar',
      workerTaskStatus: 'Completed',
      adminNotes: 'Cleaned thoroughly and warning sign installed.',
      workerNotes: 'All 3.5 tonnes of debris lifted using JCB and moved to Okhla treatment facility.',
      completionImage: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
      createdAt: '2026-09-12T10:00:00.000Z',
      updatedAt: '2026-09-14T17:30:00.000Z',
      resolvedAt: '2026-09-14T17:30:00.000Z',
    },
    {
      id: 'rep-005',
      reportId: 'SWM-2026-1035',
      userId: 'usr-citizen-1',
      citizenName: 'Priya Sharma',
      citizenPhone: '+91 98112 23344',
      category: 'Other',
      description: 'Broken bio-hazard disposal bin outside private diagnostic lab.',
      image: 'https://images.unsplash.com/photo-1611288875685-147054941d65?auto=format&fit=crop&w=800&q=80',
      location: {
        latitude: 28.6015,
        longitude: 77.2050,
        address: 'Near Central Health Clinic, Lodhi Colony',
      },
      status: 'Resolved',
      priority: 'High',
      assignedWorkerId: 'usr-worker-3',
      assignedWorkerName: 'Amit Singh',
      workerTaskStatus: 'Completed',
      adminNotes: 'Special biomedical waste vehicle dispatched.',
      workerNotes: 'Sanitized zone and replaced with certified municipal hazardous container.',
      completionImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
      createdAt: '2026-09-10T11:20:00.000Z',
      updatedAt: '2026-09-11T16:45:00.000Z',
      resolvedAt: '2026-09-11T16:45:00.000Z',
    },
  ];

  const notifications: Notification[] = [
    {
      id: 'notif-1',
      userId: 'usr-citizen-1',
      message: 'Your report SWM-2026-1042 has been assigned to Sanitation Worker Rajesh Kumar.',
      type: 'info',
      reportId: 'rep-001',
      read: false,
      createdAt: '2026-09-16T10:00:00.000Z',
    },
    {
      id: 'notif-2',
      userId: 'usr-citizen-1',
      message: 'Sanitation Worker Rajesh Kumar is currently in progress on your report SWM-2026-1042.',
      type: 'success',
      reportId: 'rep-001',
      read: false,
      createdAt: '2026-09-17T11:15:00.000Z',
    },
    {
      id: 'notif-3',
      userId: 'usr-worker-1',
      message: 'New high priority garbage complaint SWM-2026-1042 assigned to your unit.',
      type: 'alert',
      reportId: 'rep-001',
      read: true,
      createdAt: '2026-09-16T09:45:00.000Z',
    },
  ];

  return { users, reports, workers, notifications };
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(fileContent);
      }
    } catch (err) {
      console.error('Error reading DB file, using default seed:', err);
    }

    const initial = getInitialSeed();
    this.persist(initial);
    return initial;
  }

  private persist(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public save() {
    this.persist();
  }

  public resetToSeed() {
    this.data = getInitialSeed();
    this.persist();
    return this.data;
  }

  public getUsers() {
    return this.data.users;
  }

  public getReports() {
    return this.data.reports;
  }

  public getWorkers() {
    return this.data.workers;
  }

  public getNotifications() {
    return this.data.notifications;
  }
}

export const db = new Database();
