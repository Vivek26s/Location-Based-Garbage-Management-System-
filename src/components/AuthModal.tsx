import React, { useState, useEffect } from 'react';
import { X, User, Shield, HardHat, Mail, Lock, Phone, ArrowRight, Loader2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalInitialTab,
    authModalRole,
    login,
    register,
    quickDemoLogin,
    isLoading,
  } = useAuth();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>('citizen');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthModalOpen) {
      setTab(authModalInitialTab);
      setRole(authModalRole);
      setError(null);
      // Preset default credentials if logging in as demo
      if (authModalInitialTab === 'login') {
        if (authModalRole === 'admin') {
          setEmail('admin@smartcity.gov');
          setPassword('admin123');
        } else if (authModalRole === 'worker') {
          setEmail('worker@smartcity.gov');
          setPassword('worker123');
        } else {
          setEmail('citizen@smartcity.gov');
          setPassword('citizen123');
        }
      }
    }
  }, [isAuthModalOpen, authModalInitialTab, authModalRole]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setError('Please provide your full name.');
          return;
        }
        await register({ name, email, password, phone, role });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  const handleRoleSelect = (r: UserRole) => {
    setRole(r);
    if (tab === 'login') {
      if (r === 'admin') {
        setEmail('admin@smartcity.gov');
        setPassword('admin123');
      } else if (r === 'worker') {
        setEmail('worker@smartcity.gov');
        setPassword('worker123');
      } else {
        setEmail('citizen@smartcity.gov');
        setPassword('citizen123');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Header with Quick Role Selector */}
        <div className="p-6 bg-slate-900 text-white relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            Smart City Municipal Portal
          </div>
          <h3 className="text-xl font-bold">
            {tab === 'login' ? 'Portal Authentication' : 'Create Citizen Account'}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Role-Based Access for Municipal Sanitation Management
          </p>

          {/* Quick Demo Switcher Tabs */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="text-[11px] font-medium text-slate-400 mb-2">Select User Role:</div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleSelect('citizen')}
                className={`py-2 px-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition ${
                  role === 'citizen'
                    ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/50'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Citizen</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('worker')}
                className={`py-2 px-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition ${
                  role === 'worker'
                    ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400/50'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <HardHat className="w-4 h-4" />
                <span>Worker</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                className={`py-2 px-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition ${
                  role === 'admin'
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/50'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Switcher (Login / Register) */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition ${
              tab === 'login'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition ${
              tab === 'register'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            New Registration
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {tab === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Official / Personal Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@smartcity.gov or example.com"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Quick Demo Credentials Reminder */}
          {tab === 'login' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600">
              <div className="font-semibold text-slate-800 mb-1">Presentation One-Click Demo Logins:</div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                <button
                  type="button"
                  onClick={() => quickDemoLogin('citizen')}
                  className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 rounded text-[10px] font-medium"
                >
                  👤 Citizen Demo
                </button>
                <button
                  type="button"
                  onClick={() => quickDemoLogin('admin')}
                  className="px-2 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 rounded text-[10px] font-medium"
                >
                  🛡️ Admin Demo
                </button>
                <button
                  type="button"
                  onClick={() => quickDemoLogin('worker')}
                  className="px-2 py-1 bg-white hover:bg-amber-50 text-amber-700 border border-slate-200 rounded text-[10px] font-medium"
                >
                  👷 Worker Demo
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{tab === 'login' ? `Sign In as ${role.toUpperCase()}` : 'Complete Registration'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
