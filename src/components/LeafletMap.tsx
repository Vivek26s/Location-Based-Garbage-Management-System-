import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Report, LocationData, ReportStatus } from '../types';
import { Navigation, MapPin, CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';

interface LeafletMapProps {
  reports?: Report[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  interactivePick?: boolean;
  selectedLocation?: LocationData | null;
  onLocationSelect?: (loc: { latitude: number; longitude: number; address?: string }) => void;
  onReportClick?: (report: Report) => void;
  showLocateButton?: boolean;
}

const getStatusColor = (status: ReportStatus) => {
  switch (status) {
    case 'Pending':
      return '#ef4444'; // red-500
    case 'Assigned':
      return '#3b82f6'; // blue-500
    case 'In Progress':
      return '#f59e0b'; // amber-500
    case 'Resolved':
      return '#10b981'; // emerald-500
    case 'Rejected':
      return '#6b7280'; // gray-500
    default:
      return '#3b82f6';
  }
};

const createCustomIcon = (status: ReportStatus, isSelected = false) => {
  const color = getStatusColor(status);
  const size = isSelected ? 36 : 28;

  const html = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: ${size}px;
      height: ${size}px;
      background-color: ${color};
      border: 2.5px solid white;
      border-radius: 50%;
      box-shadow: 0 4px 10px rgba(0,0,0,0.35);
      color: white;
      font-weight: bold;
      font-size: 11px;
      cursor: pointer;
      transform: translate(-50%, -50%);
    ">
      <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const createPickerIcon = () => {
  const html = `
    <div style="
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      background-color: #059669;
      border: 3px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 6px 14px rgba(5, 150, 105, 0.45);
      color: white;
      cursor: grab;
      transform: translate(-50%, -50%);
    ">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    </div>
  `;

  return L.divIcon({
    className: 'picker-leaflet-marker',
    html,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
};

export const LeafletMap: React.FC<LeafletMapProps> = ({
  reports = [],
  center = [28.6139, 77.2090], // New Delhi default
  zoom = 13,
  height = '420px',
  interactivePick = false,
  selectedLocation = null,
  onLocationSelect,
  onReportClick,
  showLocateButton = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter = selectedLocation
        ? [selectedLocation.latitude, selectedLocation.longitude]
        : center;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter as L.LatLngExpression,
        zoom,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Handle map click in interactive pick mode
      if (interactivePick) {
        map.on('click', async (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          if (onLocationSelect) {
            onLocationSelect({
              latitude: Number(lat.toFixed(6)),
              longitude: Number(lng.toFixed(6)),
              address: `GPS: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E (Selected on Map)`,
            });
          }
        });
      }
    }

    return () => {
      // Map cleanup on unmount handled gracefully
    };
  }, []);

  // Update center if props change
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center as L.LatLngExpression, zoom);
    }
  }, [center[0], center[1], zoom]);

  // Handle Interactive Picker Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (interactivePick && selectedLocation) {
      const latlng: L.LatLngExpression = [selectedLocation.latitude, selectedLocation.longitude];

      if (pickerMarkerRef.current) {
        pickerMarkerRef.current.setLatLng(latlng);
      } else {
        const marker = L.marker(latlng, {
          icon: createPickerIcon(),
          draggable: true,
        }).addTo(mapInstanceRef.current);

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          if (onLocationSelect) {
            onLocationSelect({
              latitude: Number(pos.lat.toFixed(6)),
              longitude: Number(pos.lng.toFixed(6)),
              address: `GPS: ${pos.lat.toFixed(4)}°N, ${pos.lng.toFixed(4)}°E (Pin Dropped)`,
            });
          }
        });

        pickerMarkerRef.current = marker;
      }
      mapInstanceRef.current.panTo(latlng);
    } else if (!interactivePick && pickerMarkerRef.current) {
      pickerMarkerRef.current.remove();
      pickerMarkerRef.current = null;
    }
  }, [interactivePick, selectedLocation?.latitude, selectedLocation?.longitude]);

  // Handle Reports Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    if (reports.length > 0) {
      const bounds = L.latLngBounds([]);

      reports.forEach((report) => {
        if (!report.location || typeof report.location.latitude !== 'number') return;

        const latlng: L.LatLngExpression = [report.location.latitude, report.location.longitude];
        bounds.extend(latlng);

        const marker = L.marker(latlng, {
          icon: createCustomIcon(report.status),
        });

        // Popup HTML card
        const popupContent = document.createElement('div');
        popupContent.className = 'p-3 w-64 text-slate-800 text-xs font-sans';
        popupContent.innerHTML = `
          <div class="rounded-lg overflow-hidden mb-2 relative h-28 bg-slate-100">
            <img src="${report.image}" alt="${report.category}" class="w-full h-full object-cover" />
            <span class="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-semibold text-white uppercase tracking-wider" style="background-color: ${getStatusColor(report.status)}">
              ${report.status}
            </span>
          </div>
          <div class="font-bold text-sm text-slate-900 mb-0.5">${report.reportId}</div>
          <div class="text-xs text-emerald-700 font-medium mb-1">${report.category}</div>
          <p class="text-slate-600 line-clamp-2 mb-2">${report.description}</p>
          <div class="flex items-center gap-1 text-[11px] text-slate-500 mb-2.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path></svg>
            <span class="truncate">${report.location.address || 'Smart City Ward'}</span>
          </div>
          <button id="btn-view-${report.id}" class="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition text-xs flex items-center justify-center gap-1.5">
            View Details & History
          </button>
        `;

        // Handle button inside popup
        popupContent.querySelector(`#btn-view-${report.id}`)?.addEventListener('click', () => {
          if (onReportClick) onReportClick(report);
        });

        marker.bindPopup(popupContent);
        markersLayerRef.current?.addLayer(marker);
      });

      // If reports exist and not interactive pick mode, fit bounds nicely
      if (!interactivePick && reports.length > 1 && bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
      }
    }
  }, [reports, interactivePick]);

  // GPS Auto-detect Trigger
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 16);
        }
        if (onLocationSelect) {
          onLocationSelect({
            latitude: Number(latitude.toFixed(6)),
            longitude: Number(longitude.toFixed(6)),
            address: `Current GPS: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`,
          });
        }
      },
      (error) => {
        console.warn('Geolocation error:', error);
        // Fallback default city location if permissions denied
        if (onLocationSelect) {
          onLocationSelect({
            latitude: 28.6139,
            longitude: 77.2090,
            address: 'Connaught Place Central Ward, New Delhi (Default Location)',
          });
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Legend Overlay */}
      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md border border-slate-200/80 z-[400] text-[11px] flex flex-col gap-1.5">
        <div className="font-semibold text-slate-800 text-xs border-b border-slate-100 pb-1">Status Legend</div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          <span className="text-slate-600">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span className="text-slate-600">Assigned</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="text-slate-600">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-slate-600">Resolved</span>
        </div>
      </div>

      {/* GPS Locate Button */}
      {showLocateButton && (
        <button
          type="button"
          onClick={handleLocateMe}
          className="absolute bottom-4 left-4 z-[400] bg-white hover:bg-slate-50 text-slate-700 hover:text-emerald-700 px-3.5 py-2 rounded-lg shadow-md border border-slate-200 font-medium text-xs flex items-center gap-2 transition"
          title="Detect Current GPS Location"
        >
          <Navigation className="w-4 h-4 text-emerald-600" />
          <span>Auto-Detect GPS</span>
        </button>
      )}

      {/* Interactive Pick Helper Hint */}
      {interactivePick && (
        <div className="absolute top-3 left-3 bg-emerald-700/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg shadow-md z-[400] text-xs flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          <span>Click map or drag green pin to fine-tune garbage location</span>
        </div>
      )}
    </div>
  );
};
