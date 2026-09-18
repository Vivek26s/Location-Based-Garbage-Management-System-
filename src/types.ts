export type UserRole = 'citizen' | 'admin' | 'worker';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
}

export type GarbageCategory =
  | 'Overflowing Dustbin'
  | 'Garbage on Road'
  | 'Garbage Near Park'
  | 'Garbage on Empty Plot'
  | 'Other';

export type ReportStatus =
  | 'Pending'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected';

export type ReportPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type WorkerTaskStatus = 'Assigned' | 'Accepted' | 'On the Way' | 'In Progress' | 'Completed';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Report {
  id: string;
  reportId: string; // e.g. SWM-2026-0814
  userId: string;
  citizenName?: string;
  citizenPhone?: string;
  category: GarbageCategory;
  description: string;
  image: string; // url or base64
  location: LocationData;
  status: ReportStatus;
  priority: ReportPriority;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  workerTaskStatus?: WorkerTaskStatus;
  adminNotes?: string;
  workerNotes?: string;
  completionImage?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface Worker {
  id: string;
  name: string;
  email: string;
  phone: string;
  availability: 'Available' | 'On Duty' | 'Off Duty' | 'Busy';
  assignedTasks: string[]; // Report IDs or report unique IDs
  zone?: string;
  vehicleNumber?: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  reportId?: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  assignedReports: number;
  inProgressReports: number;
  resolvedReports: number;
  rejectedReports: number;
  totalWorkers: number;
  activeWorkers: number;
  categoryStats: { [category: string]: number };
  recentReports: Report[];
  locationPoints: Array<{
    id: string;
    reportId: string;
    category: string;
    status: ReportStatus;
    latitude: number;
    longitude: number;
    address?: string;
    image: string;
  }>;
}
