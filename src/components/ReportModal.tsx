import React, { useState, useEffect } from 'react';
import { X, Upload, MapPin, Camera, Sparkles, AlertCircle, CheckCircle2, Navigation, Loader2 } from 'lucide-react';
import { GarbageCategory, ReportPriority, LocationData, Report } from '../types';
import { LeafletMap } from './LeafletMap';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportCreated?: (report: Report) => void;
  onSuccess?: (report: Report) => void;
}

const CATEGORIES: { label: GarbageCategory; desc: string; icon: string }[] = [
  { label: 'Overflowing Dustbin', desc: 'Commercial or public bins spilling onto sidewalks', icon: '🗑️' },
  { label: 'Garbage on Road', desc: 'Litter, construction debris, or road blockages', icon: '🛣️' },
  { label: 'Garbage Near Park', desc: 'Waste dumping in gardens, walkways, or children play areas', icon: '🌳' },
  { label: 'Garbage on Empty Plot', desc: 'Accumulated illegal solid dumping on unbuilt land', icon: '🏗️' },
  { label: 'Other', desc: 'Hazardous, electronic, or unclassified municipal waste', icon: '⚠️' },
];

const SAMPLE_GARBAGE_IMAGES = [
  {
    label: 'Overflowing Bin',
    url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Park Litter',
    url: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Roadside Debris',
    url: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Vacant Plot Waste',
    url: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&w=800&q=80',
  },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onReportCreated,
  onSuccess,
}) => {
  const { user, openAuthModal } = useAuth();

  const [category, setCategory] = useState<GarbageCategory>('Overflowing Dustbin');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ReportPriority>('Medium');
  const [imageUrl, setImageUrl] = useState('');
  const [location, setLocation] = useState<LocationData>({
    latitude: 28.6139,
    longitude: 77.2090,
    address: 'Connaught Place Central Ward, New Delhi',
  });
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdReport, setCreatedReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto detect GPS on opening modal
  useEffect(() => {
    if (isOpen && !createdReport) {
      handleAutoDetectGPS();
    }
  }, [isOpen]);

  const handleAutoDetectGPS = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({
          latitude: Number(latitude.toFixed(6)),
          longitude: Number(longitude.toFixed(6)),
          address: `GPS Location (${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E)`,
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setError('Image file is too large. Please select a photo under 15MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a brief description of the garbage issue.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const finalImage = imageUrl || SAMPLE_GARBAGE_IMAGES[0].url;

      const payload = {
        category,
        description: description.trim(),
        priority,
        image: finalImage,
        location,
      };

      const res = await api.createReport(payload);
      if (res.success && res.report) {
        setCreatedReport(res.report);
        if (onReportCreated) onReportCreated(res.report);
        if (onSuccess) onSuccess(res.report);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setCreatedReport(null);
    setDescription('');
    setImageUrl('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Report Garbage Grievance</h3>
              <p className="text-xs text-slate-500">Smart City Municipal Sanitation Command</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {createdReport ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Grievance Registered Successfully
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2">Complaint #{createdReport.reportId}</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Your complaint has been forwarded to the Municipal Ward Monitoring Cell. A field worker will be dispatched shortly.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left max-w-md mx-auto space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="font-semibold text-slate-800">{createdReport.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-semibold text-slate-800 text-right truncate max-w-[200px]">
                  {createdReport.location.address || `${createdReport.location.latitude}, ${createdReport.location.longitude}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  {createdReport.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Logged At:</span>
                <span className="font-semibold text-slate-800">{new Date(createdReport.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={handleResetAndClose}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl shadow-md transition"
              >
                Done & View Dashboard
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!user && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                <span>You are submitting as an anonymous citizen. Log in to save to your personal profile.</span>
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="font-bold underline text-amber-900 hover:text-black ml-2 whitespace-nowrap"
                >
                  Citizen Login
                </button>
              </div>
            )}

            {/* 1. Category Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Select Garbage Category <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setCategory(cat.label)}
                    className={`p-3 rounded-xl text-left border transition flex items-start gap-2.5 ${
                      category === cat.label
                        ? 'border-emerald-500 bg-emerald-50/70 shadow-sm text-emerald-950 ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <div>
                      <div className="font-semibold text-xs text-slate-900">{cat.label}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{cat.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Photo Upload / Sample select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Upload Issue Photo <span className="text-red-500">*</span>
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                {/* Upload box */}
                <label className="relative border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/50 hover:bg-emerald-50/30 transition text-center min-h-[140px]">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-600" />
                  <div className="text-xs font-medium text-slate-700">
                    <span className="text-emerald-700 font-bold underline">Click to upload photo</span> or drag & drop
                  </div>
                  <div className="text-[10px] text-slate-400">PNG, JPG, WebP up to 15MB</div>
                </label>

                {/* Preview / Quick Sample Selector */}
                <div className="flex flex-col gap-2">
                  <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
                    <span>Or pick realistic test photo:</span>
                    {imageUrl && (
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="text-red-600 hover:underline text-[10px]"
                      >
                        Clear Image
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {SAMPLE_GARBAGE_IMAGES.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageUrl(sample.url)}
                        className={`h-16 rounded-lg overflow-hidden border-2 relative transition ${
                          imageUrl === sample.url ? 'border-emerald-600 ring-2 ring-emerald-200' : 'border-slate-200 hover:opacity-90'
                        }`}
                        title={sample.label}
                      >
                        <img src={sample.url} alt={sample.label} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  {imageUrl && (
                    <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Photo selected ready for submission
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Location & GPS Map */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  3. GPS Location & Interactive Pin <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutoDetectGPS}
                  disabled={isLocating}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 transition"
                >
                  {isLocating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Navigation className="w-3 h-3 text-emerald-600" />
                  )}
                  <span>Detect GPS</span>
                </button>
              </div>

              <div className="mb-2">
                <input
                  type="text"
                  value={location.address || ''}
                  onChange={(e) => setLocation({ ...location, address: e.target.value })}
                  placeholder="Street address or landmark description"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />
              </div>

              {/* Leaflet Picker Map */}
              <div className="h-56 rounded-xl overflow-hidden border border-slate-300">
                <LeafletMap
                  height="100%"
                  zoom={14}
                  center={[location.latitude, location.longitude]}
                  interactivePick={true}
                  selectedLocation={location}
                  onLocationSelect={(loc) => {
                    setLocation({
                      latitude: loc.latitude,
                      longitude: loc.longitude,
                      address: loc.address || location.address,
                    });
                  }}
                  showLocateButton={true}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                <span>Latitude: <strong className="text-slate-800">{location.latitude.toFixed(5)}</strong></span>
                <span>Longitude: <strong className="text-slate-800">{location.longitude.toFixed(5)}</strong></span>
              </div>
            </div>

            {/* 4. Problem Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                4. Problem Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the severity, duration, nearby landmark, or hazardous nature of the waste..."
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white resize-none"
                required
              />
            </div>

            {/* 5. Priority Selector */}
            <div className="flex items-center justify-between pt-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Priority:
              </label>
              <div className="flex gap-2">
                {(['Low', 'Medium', 'High', 'Critical'] as ReportPriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      priority === p
                        ? p === 'Critical'
                          ? 'bg-red-600 text-white shadow-sm'
                          : p === 'High'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting to Municipal Server...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Submit Grievance</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
