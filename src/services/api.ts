import { User, Report, Worker, Notification, DashboardStats } from '../types';

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('swm_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ success: boolean; token: string; user: User; message?: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  async register(userData: { name: string; email: string; password: string; phone?: string; role?: string }): Promise<{ success: boolean; token: string; user: User; message?: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  async getMe(): Promise<{ success: boolean; user: User }> {
    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch user');
    return data;
  },

  async getDemoUsers(): Promise<{ success: boolean; demoAccounts: any[] }> {
    const res = await fetch('/api/auth/demo-users');
    return res.json();
  },

  // Reports
  async getReports(params?: Record<string, string>): Promise<{ success: boolean; count: number; reports: Report[] }> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await fetch(`/api/reports${query}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch reports');
    return data;
  },

  async getReportById(id: string): Promise<{ success: boolean; report: Report }> {
    const res = await fetch(`/api/reports/${id}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Report not found');
    return data;
  },

  async createReport(reportData: any): Promise<{ success: boolean; message: string; report: Report }> {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reportData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to submit report');
    return data;
  },

  async updateReport(id: string, updates: any): Promise<{ success: boolean; report: Report }> {
    const res = await fetch(`/api/reports/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update report');
    return data;
  },

  async assignWorker(id: string, workerId: string, priority?: string, adminNotes?: string): Promise<{ success: boolean; report: Report }> {
    const res = await fetch(`/api/reports/${id}/assign`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ workerId, priority, adminNotes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to assign worker');
    return data;
  },

  async updateReportStatus(id: string, payload: any): Promise<{ success: boolean; report: Report }> {
    const res = await fetch(`/api/reports/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update status');
    return data;
  },

  async deleteReport(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/reports/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete report');
    return data;
  },

  // Workers
  async getWorkers(): Promise<{ success: boolean; workers: Worker[] }> {
    const res = await fetch('/api/workers', {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch workers');
    return data;
  },

  async createWorker(workerData: any): Promise<{ success: boolean; worker: Worker }> {
    const res = await fetch('/api/workers', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(workerData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create worker');
    return data;
  },

  async updateWorker(id: string, workerData: any): Promise<{ success: boolean; worker: Worker }> {
    const res = await fetch(`/api/workers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(workerData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update worker');
    return data;
  },

  async deleteWorker(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/workers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete worker');
    return data;
  },

  async getWorkerTasks(workerId?: string): Promise<{ success: boolean; todayTasks: Report[]; historyTasks: Report[] }> {
    const endpoint = workerId ? `/api/workers/${workerId}/tasks` : '/api/workers/me/tasks';
    const res = await fetch(endpoint, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch worker tasks');
    return data;
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<{ success: boolean; stats: DashboardStats }> {
    const res = await fetch('/api/dashboard/stats');
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch stats');
    return data;
  },

  async resetSeed(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/dashboard/reset-seed', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to reset seed');
    return data;
  },

  // Notifications
  async getNotifications(): Promise<{ success: boolean; notifications: Notification[]; unreadCount: number }> {
    const res = await fetch('/api/notifications', {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch notifications');
    return data;
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
  },

  async markAllNotificationsRead(): Promise<void> {
    await fetch('/api/notifications/read-all', {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
  },
};
