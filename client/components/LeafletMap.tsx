import React, { useEffect, useRef, useState, useCallback } from 'react';
import { NGO } from '@/context/NGOContext';
import { Maximize2, ZoomIn, ZoomOut, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type MapTileStyle = 'osm' | 'osm-hot' | 'satellite';

interface LeafletMapProps {
  ngos: NGO[];
  selectedNgo: NGO | null;
  onSelectNgo: (ngo: NGO) => void;
  className?: string;
  defaultZoom?: number;
}

const TILE_PROVIDERS: Record<MapTileStyle, { url: string; attribution: string; maxZoom: number; name: string; subdomains?: string | string[] }> = {
  'osm': {
    name: 'OpenStreetMap',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  },
  'osm-hot': {
    name: 'Humanitarian OSM',
    url: 'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles by HOT',
    maxZoom: 19
  },
  'satellite': {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
    maxZoom: 18
  }
};

export default function LeafletMap({
  ngos,
  selectedNgo,
  onSelectNgo,
  className = '',
  defaultZoom = 5
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const currentTileLayerRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const [mapReady, setMapReady] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<MapTileStyle>('osm');
  const [currentZoom, setCurrentZoom] = useState<number>(defaultZoom);

  // Check and load Leaflet library
  useEffect(() => {
    const checkLeaflet = () => {
      if ((window as any).L) {
        setMapReady(true);
        return;
      }

      // Check if local files or script exists
      let script = document.getElementById('leaflet-script') as HTMLScriptElement | null;
      if (!script) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = '/leaflet/leaflet.css';
        document.head.appendChild(link);

        script = document.createElement('script');
        script.id = 'leaflet-script';
        script.src = '/leaflet/leaflet.js';
        script.async = true;
        script.onload = () => setMapReady(true);
        document.body.appendChild(script);
      } else {
        const timer = setInterval(() => {
          if ((window as any).L) {
            setMapReady(true);
            clearInterval(timer);
          }
        }, 100);
        return () => clearInterval(timer);
      }
    };

    checkLeaflet();
  }, []);

  // Initialize Map with proper sizing and invalidateSize calls
  useEffect(() => {
    if (!mapReady || !mapContainerRef.current || mapInstanceRef.current) return;
    const L = (window as any).L;

    // Center over India by default
    const map = L.map(mapContainerRef.current, {
      center: [20.5937, 78.9629],
      zoom: defaultZoom,
      zoomControl: false,
      minZoom: 3,
      maxZoom: 19
    });

    const config = TILE_PROVIDERS[currentStyle];
    const tileLayerOptions: any = {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
    };
    if (config.subdomains) {
      tileLayerOptions.subdomains = config.subdomains;
    }

    const tileLayer = L.tileLayer(config.url, tileLayerOptions).addTo(map);

    currentTileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    // Trigger immediate resize recalculation for flex containers
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
    setTimeout(() => {
      map.invalidateSize();
    }, 500);

    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    return () => {
      window.removeEventListener('resize', onResize);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapReady]);

  // Update tile layer style when currentStyle changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;
    const L = (window as any).L;
    const map = mapInstanceRef.current;
    const config = TILE_PROVIDERS[currentStyle];

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const tileLayerOptions: any = {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
    };
    if (config.subdomains) {
      tileLayerOptions.subdomains = config.subdomains;
    }

    const newTileLayer = L.tileLayer(config.url, tileLayerOptions).addTo(map);
    currentTileLayerRef.current = newTileLayer;
    map.invalidateSize();
  }, [currentStyle, mapReady]);

  // Render / Update Markers for NGOs
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;
    const L = (window as any).L;
    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    ngos.forEach((ngo) => {
      const lat = ngo.latitude || 20.5937;
      const lng = ngo.longitude || 78.9629;
      const isSelected = selectedNgo?.id === ngo.id;

      // Custom HTML Marker Icon
      const customIcon = L.divIcon({
        className: 'ngo-pin-container',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: ${
              isSelected ? 'rgba(59, 130, 246, 0.45)' : 'rgba(59, 130, 246, 0.2)'
            }; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="
              width: 38px;
              height: 38px;
              border-radius: 50%;
              background: ${isSelected ? 'linear-gradient(135deg, #2563eb, #06b6d4)' : 'linear-gradient(135deg, #1e293b, #0f172a)'};
              border: 2px solid ${isSelected ? '#ffffff' : '#38bdf8'};
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 0 12px ${isSelected ? 'rgba(56, 189, 248, 0.8)' : 'rgba(56, 189, 248, 0.3)'};
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
              transition: transform 0.2s ease;
            ">
              ${ngo.image || '🏢'}
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -24]
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      // Popup Content with exact physical address & coordinates
      const popupContent = `
        <div style="min-width: 270px; max-width: 320px; padding: 16px; background: #090d16; color: #f8fafc; font-family: system-ui, sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-size: 10px; font-weight: 700; color: #38bdf8; text-transform: uppercase; background: rgba(56,189,248,0.15); padding: 3px 8px; border-radius: 9999px; border: 1px solid rgba(56,189,248,0.3);">
              ${ngo.category}
            </span>
            <span style="font-size: 10px; color: #4ade80; display: flex; align-items: center; gap: 4px; font-weight: 600;">
              ✓ Verified Center
            </span>
          </div>

          <h4 style="font-size: 15px; font-weight: 800; color: #ffffff; margin: 0 0 6px 0; line-height: 1.3;">
            ${ngo.name}
          </h4>

          <div style="margin: 8px 0; padding: 10px; background: #131c2e; border-radius: 8px; border: 1px solid #1e293b; font-size: 11px;">
            <div style="color: #38bdf8; font-weight: 700; margin-bottom: 3px; display: flex; align-items: center; gap: 4px;">
              📍 Exact Physical Address:
            </div>
            <div style="color: #f1f5f9; font-weight: 500; line-height: 1.4;">
              ${ngo.address}, ${ngo.city}, ${ngo.state}, ${ngo.country}
            </div>
            <div style="color: #64748b; font-family: monospace; font-size: 10px; margin-top: 5px; padding-top: 4px; border-top: 1px dashed #334155;">
              GPS: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E
            </div>
          </div>

          <p style="font-size: 11px; color: #94a3b8; margin: 6px 0 10px 0; line-height: 1.4;">
            ${ngo.mission || ngo.description}
          </p>

          <div style="display: flex; gap: 6px; margin-top: 8px;">
            <a href="/browse" style="flex: 1; text-align: center; background: #2563eb; color: #ffffff; font-weight: 700; padding: 7px 10px; border-radius: 6px; text-decoration: none; font-size: 11px; display: inline-block;">
              ❤️ Donate Now
            </a>
            <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank" rel="noopener noreferrer" style="background: #1e293b; color: #94a3b8; border: 1px solid #334155; padding: 7px 10px; border-radius: 6px; text-decoration: none; font-size: 11px; display: inline-block;">
              🗺️ Directions
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 340,
        className: 'custom-dark-popup'
      });

      marker.on('click', () => {
        onSelectNgo(ngo);
        map.flyTo([lat, lng], 16, { animate: true, duration: 1.2 });
      });

      markersRef.current.set(ngo.id, marker);
    });
  }, [ngos, mapReady, selectedNgo]);

  // When selectedNgo changes externally, fly directly to it and open popup
  useEffect(() => {
    if (!selectedNgo || !mapInstanceRef.current || !mapReady) return;
    const map = mapInstanceRef.current;
    const lat = selectedNgo.latitude || 20.5937;
    const lng = selectedNgo.longitude || 78.9629;

    map.flyTo([lat, lng], 16, { animate: true, duration: 1.5 });

    const marker = markersRef.current.get(selectedNgo.id);
    if (marker) {
      setTimeout(() => {
        marker.openPopup();
      }, 700);
    }
  }, [selectedNgo, mapReady]);

  // Zoom In / Out Handlers
  const handleZoomIn = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  }, []);

  // Fit all markers in view
  const handleFitAll = useCallback(() => {
    if (!mapInstanceRef.current || ngos.length === 0) return;
    const L = (window as any).L;
    const bounds = L.latLngBounds(
      ngos.map((n) => [n.latitude || 20.5937, n.longitude || 78.9629])
    );
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], animate: true });
  }, [ngos]);

  return (
    <div className={`relative w-full h-[620px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl ${className}`}>
      {/* Map DOM Container - positioned absolute to guarantee dimensions */}
      <div
        ref={mapContainerRef}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', zIndex: 1 }}
      />

      {/* Top Left: Live Status Badge & Style Switcher */}
      <div className="absolute top-4 left-4 z-20 flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-blue-500/30 text-xs text-blue-400 backdrop-blur shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live Street Map Active</span>
          <span className="text-[10px] text-slate-400 font-mono">({ngos.length} Centers)</span>
        </div>

        {/* Tile Layer Selector */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl backdrop-blur shadow-lg">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCurrentStyle('osm')}
            className={`h-7 px-2.5 text-xs rounded-lg ${
              currentStyle === 'osm'
                ? 'bg-blue-600 text-white font-semibold shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            🗺️ OpenStreetMap
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCurrentStyle('osm-hot')}
            className={`h-7 px-2.5 text-xs rounded-lg ${
              currentStyle === 'osm-hot'
                ? 'bg-blue-600 text-white font-semibold shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            ❤️ Humanitarian
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCurrentStyle('satellite')}
            className={`h-7 px-2.5 text-xs rounded-lg ${
              currentStyle === 'satellite'
                ? 'bg-blue-600 text-white font-semibold shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            🛰️ Satellite
          </Button>
        </div>
      </div>

      {/* Top Right: Interactive Map Controls (Zoom, Fit All) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <div className="flex flex-col bg-slate-900/95 border border-slate-700/80 rounded-xl overflow-hidden shadow-2xl backdrop-blur">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleZoomIn}
            title="Zoom into streets"
            className="h-9 w-9 text-slate-300 hover:text-white hover:bg-slate-800 rounded-none border-b border-slate-800"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleZoomOut}
            title="Zoom out"
            className="h-9 w-9 text-slate-300 hover:text-white hover:bg-slate-800 rounded-none border-b border-slate-800"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleFitAll}
            title="Fit All Centers in View"
            className="h-9 w-9 text-slate-300 hover:text-white hover:bg-slate-800 rounded-none"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Current Zoom Indicator */}
        <div className="bg-slate-900/90 border border-slate-800 text-[10px] text-slate-400 px-2.5 py-1 rounded-lg backdrop-blur text-center font-mono shadow">
          {currentZoom >= 15 ? '🔍 Street Level' : currentZoom >= 10 ? '🏙️ City Level' : '🗺️ National View'}
        </div>
      </div>

      {/* Bottom Hint Bar */}
      <div className="absolute bottom-3 left-4 right-4 z-20 pointer-events-none flex items-center justify-between">
        <div className="pointer-events-auto bg-slate-950/85 border border-slate-800/90 backdrop-blur px-3 py-1.5 rounded-lg text-[11px] text-slate-400 shadow-lg flex items-center gap-2">
          <Compass className="h-3.5 w-3.5 text-blue-400" />
          <span>Zoom in with mouse wheel or <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300">+</kbd> to view exact streets and building addresses.</span>
        </div>
      </div>
    </div>
  );
}
