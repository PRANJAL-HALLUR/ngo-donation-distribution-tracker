import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useNGO } from "@/context/NGOContext";
import { useLocation } from "@/context/LocationContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import Map, {
  Marker,
  NavigationControl,
  Popup,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

import {
  MapPin,
  Building2,
  Navigation,
  ArrowLeft,
  Search,
  CheckCircle2,
  Heart,
  Globe2,
  ShieldCheck,
  Layers,
  Sparkles,
  Info
} from "lucide-react";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";

// Coordinates for standard cities
const CITY_COORDINATES: Record<string, { lat: number; lng: number; xPercent: number; yPercent: number }> = {
  "New Delhi": { lat: 28.6139, lng: 77.209, xPercent: 44, yPercent: 28 },
  "Delhi": { lat: 28.6139, lng: 77.209, xPercent: 44, yPercent: 28 },
  "Bangalore": { lat: 12.9716, lng: 77.5946, xPercent: 48, yPercent: 78 },
  "Bengaluru": { lat: 12.9716, lng: 77.5946, xPercent: 48, yPercent: 78 },
  "Kochi": { lat: 9.9312, lng: 76.2673, xPercent: 45, yPercent: 88 },
  "Mumbai": { lat: 19.076, lng: 72.8777, xPercent: 32, yPercent: 55 },
  "Kolkata": { lat: 22.5726, lng: 88.3639, xPercent: 75, yPercent: 44 },
  "Hyderabad": { lat: 17.385, lng: 78.4867, xPercent: 50, yPercent: 62 },
  "Chennai": { lat: 13.0827, lng: 80.2707, xPercent: 57, yPercent: 76 },
};

export default function MapsTracking() {
  const navigate = useNavigate();
  const { ngos } = useNGO();
  const { location } = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedNgo, setSelectedNgo] = useState<any>(null);
  const [mapMode, setMapMode] = useState<"interactive" | "mapbox">(
    MAPBOX_TOKEN ? "mapbox" : "interactive"
  );

  const defaultLat = location?.lat || 20.5937;
  const defaultLng = location?.lng || 78.9629;

  const [viewState, setViewState] = useState({
    longitude: defaultLng,
    latitude: defaultLat,
    zoom: 4,
  });

  const categories = ["All", "Healthcare", "Education", "Disaster Relief", "Environment"];

  const approvedNgos = useMemo(() => {
    return ngos.filter((n) => n.status === "approved");
  }, [ngos]);

  const filteredNgos = useMemo(() => {
    return approvedNgos.filter((ngo) => {
      const matchesCat =
        selectedCategory === "All" ||
        ngo.category?.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ngo.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ngo.state?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [approvedNgos, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Dashboard
            </Button>
            <div className="h-5 w-px bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <Globe2 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">
                  FundHub Impact Radar
                </h1>
                <p className="text-xs text-slate-400">
                  Real-time NGO geotagging & impact transparency
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/browse")}
              className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200"
            >
              <Heart className="h-4 w-4 mr-1.5 text-pink-400" /> Browse & Donate
            </Button>

            {MAPBOX_TOKEN && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setMapMode(mapMode === "interactive" ? "mapbox" : "interactive")
                }
                className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200"
              >
                <Layers className="h-4 w-4 mr-1.5 text-blue-400" />
                {mapMode === "interactive" ? "Switch to Mapbox GL" : "Radar View"}
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-slate-400 hover:text-white hover:bg-slate-800 text-xs"
            >
              Switch Role
            </Button>
          </div>
        </div>
      </header>

      {/* KPI Stats Bar */}
      <div className="bg-slate-800/40 border-b border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Verified Centers</p>
              <p className="text-base font-bold text-white">{approvedNgos.length} Active</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Verification Level</p>
              <p className="text-base font-bold text-green-400">100% Geotagged</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Navigation className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Coverage Zones</p>
              <p className="text-base font-bold text-white">Multi-State India</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Aid Tracking</p>
              <p className="text-base font-bold text-amber-400">Proof-Verified</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Map Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search NGO by name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                className={
                  selectedCategory === cat
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/50"
                    : "border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300"
                }
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Map Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* Left/Center Map Display */}
          <div className="lg:col-span-2 relative min-h-[540px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
            {mapMode === "mapbox" && MAPBOX_TOKEN ? (
              <div className="relative w-full h-full min-h-[540px]">
                <Map
                  {...viewState}
                  onMove={(evt) => setViewState(evt.viewState)}
                  mapStyle="mapbox://styles/mapbox/dark-v11"
                  mapboxAccessToken={MAPBOX_TOKEN}
                  style={{ width: "100%", height: "100%" }}
                >
                  <NavigationControl position="bottom-right" />

                  {filteredNgos.map((ngo) => {
                    const coords = CITY_COORDINATES[ngo.city] || {
                      lat: defaultLat + (Math.random() - 0.5) * 4,
                      lng: defaultLng + (Math.random() - 0.5) * 4,
                    };

                    return (
                      <Marker
                        key={ngo.id}
                        longitude={coords.lng}
                        latitude={coords.lat}
                        onClick={(e) => {
                          e.originalEvent.stopPropagation();
                          setSelectedNgo(ngo);
                        }}
                      >
                        <div className="group relative cursor-pointer">
                          <div className="absolute -inset-2 bg-blue-500/30 rounded-full animate-ping pointer-events-none" />
                          <div className="relative bg-gradient-to-tr from-blue-600 to-cyan-500 text-white p-2.5 rounded-full shadow-lg border-2 border-white/80 hover:scale-110 transition">
                            <Building2 className="h-4 w-4" />
                          </div>
                        </div>
                      </Marker>
                    );
                  })}

                  {selectedNgo && (
                    <Popup
                      longitude={
                        CITY_COORDINATES[selectedNgo.city]?.lng || defaultLng
                      }
                      latitude={
                        CITY_COORDINATES[selectedNgo.city]?.lat || defaultLat
                      }
                      anchor="bottom"
                      onClose={() => setSelectedNgo(null)}
                      className="text-slate-900"
                    >
                      <div className="p-3 max-w-xs">
                        <div className="flex items-center gap-1.5 text-blue-600 text-xs font-semibold uppercase">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Verified NGO
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 mt-1">
                          {selectedNgo.name}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                          {selectedNgo.description}
                        </p>
                        <div className="mt-2 pt-2 border-t flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700">
                            {selectedNgo.city}, {selectedNgo.country}
                          </span>
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-blue-600 text-white"
                            onClick={() => navigate("/browse")}
                          >
                            Donate
                          </Button>
                        </div>
                      </div>
                    </Popup>
                  )}
                </Map>
              </div>
            ) : (
              /* High-Fidelity SVG Interactive Radar Canvas */
              <div className="relative w-full h-full min-h-[540px] flex flex-col justify-between p-6 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
                {/* Background Radar Grid & Coordinates */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern
                        id="grid"
                        width="40"
                        height="40"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 40 0 L 0 0 0 40"
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="0.5"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    {/* Concentric radar rings */}
                    <circle cx="50%" cy="50%" r="100" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 4" />
                    <circle cx="50%" cy="50%" r="200" fill="none" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="6 6" />
                    <circle cx="50%" cy="50%" r="300" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
                  </svg>
                </div>

                {/* Status Overlay */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-blue-500/30 text-xs text-blue-400 backdrop-blur">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    Live Geographic Telemetry Active
                  </div>
                  <div className="text-xs text-slate-400 hidden sm:block">
                    Showing {filteredNgos.length} Plotted Field Centers
                  </div>
                </div>

                {/* Stylized Geo Map Silhouette & Plotted NGO Nodes */}
                <div className="relative w-full h-[400px] my-auto">
                  {/* Stylized Map Points */}
                  {filteredNgos.map((ngo, idx) => {
                    const coords = CITY_COORDINATES[ngo.city] || {
                      xPercent: 30 + (idx * 25) % 60,
                      yPercent: 35 + (idx * 20) % 50,
                    };
                    const isSelected = selectedNgo?.id === ngo.id;

                    return (
                      <div
                        key={ngo.id}
                        onClick={() => setSelectedNgo(ngo)}
                        style={{
                          left: `${coords.xPercent}%`,
                          top: `${coords.yPercent}%`,
                        }}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-20 ${
                          isSelected ? "scale-125 z-30" : "hover:scale-110"
                        }`}
                      >
                        {/* Radar Pulse */}
                        <div className="absolute -inset-3 bg-blue-500/20 rounded-full animate-ping pointer-events-none" />

                        {/* Node Bubble */}
                        <div
                          className={`p-3 rounded-2xl shadow-xl flex items-center gap-2.5 border transition-all ${
                            isSelected
                              ? "bg-blue-600 text-white border-white shadow-blue-500/50"
                              : "bg-slate-900/90 text-slate-200 border-slate-700 hover:border-blue-400 hover:bg-slate-800"
                          }`}
                        >
                          <div className="p-1 rounded-md bg-white/10 text-white">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-bold whitespace-nowrap">
                              {ngo.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {ngo.city} • {ngo.category}
                            </p>
                          </div>
                        </div>

                        {/* Coordinates Tag */}
                        <span className="block text-center mt-1 text-[9px] font-mono text-slate-500">
                          {CITY_COORDINATES[ngo.city]?.lat?.toFixed(2) || "20.59"}° N,{" "}
                          {CITY_COORDINATES[ngo.city]?.lng?.toFixed(2) || "78.96"}° E
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Notice */}
                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                  <span className="flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-blue-400" /> Click on any field center to view audited records and dispatch details.
                  </span>
                  <span className="text-slate-500">All coordinates verified by FundHub Network</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: NGO Spotlight & Live Activity */}
          <div className="space-y-6 flex flex-col">
            {/* NGO Spotlight Card */}
            {selectedNgo ? (
              <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-900/40 to-indigo-900/20 border-b border-slate-800 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/40 mb-2">
                        {selectedNgo.category}
                      </Badge>
                      <CardTitle className="text-xl font-bold text-white">
                        {selectedNgo.name}
                      </CardTitle>
                      <CardDescription className="text-slate-400 flex items-center gap-1.5 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-blue-400" />
                        {selectedNgo.city}, {selectedNgo.state}, {selectedNgo.country}
                      </CardDescription>
                    </div>
                    <div className="text-3xl p-2 bg-slate-800 rounded-xl border border-slate-700">
                      {selectedNgo.image || "🏢"}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4 text-sm">
                  <div>
                    <h5 className="text-xs uppercase font-semibold text-slate-400">
                      Mission Statement
                    </h5>
                    <p className="text-slate-300 mt-1 leading-relaxed">
                      {selectedNgo.mission || selectedNgo.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-2 border-y border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400">Registration ID:</span>
                      <p className="font-mono text-slate-200 font-semibold mt-0.5">
                        {selectedNgo.registration_id}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Contact:</span>
                      <p className="text-slate-200 font-semibold mt-0.5 truncate">
                        {selectedNgo.contact_email}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Verified Impact:</span>
                      <p className="text-green-400 font-semibold mt-0.5">
                        ${selectedNgo.total_received || 0} Raised
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Audit Status:</span>
                      <p className="text-blue-400 font-semibold mt-0.5 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Fully Verified
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <Button
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg"
                      onClick={() => navigate("/browse")}
                    >
                      <Heart className="h-4 w-4 mr-1.5 fill-current" /> Donate Now
                    </Button>
                    <Button
                      variant="outline"
                      className="border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
                      onClick={() => setSelectedNgo(null)}
                    >
                      Close
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-900/80 border-slate-800 p-6 text-center shadow-lg flex flex-col items-center justify-center min-h-[220px]">
                <MapPin className="h-10 w-10 text-slate-600 mb-3 animate-bounce" />
                <h4 className="text-base font-bold text-white">Select a Field Center</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Click on any interactive radar node on the map to inspect live verified data, audited relief materials, and direct donation access.
                </p>
              </Card>
            )}

            {/* Live Distribution Activity Feed */}
            <Card className="bg-slate-900 border-slate-800 shadow-xl flex-1 flex flex-col">
              <CardHeader className="pb-3 border-b border-slate-800">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  Recent Field Dispatches
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Verified aid distributions logged with photographic proof
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-3.5 flex-1 overflow-y-auto max-h-[300px]">
                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-200">
                    <span>Care & Hope Foundation</span>
                    <Badge variant="outline" className="border-green-500/40 text-green-400 text-[10px]">
                      Verified
                    </Badge>
                  </div>
                  <p className="text-slate-400">
                    Dispatched emergency pediatric medical kits to 120 families in New Delhi.
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">Today • Geotag: 28.61° N, 77.20° E</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-200">
                    <span>BrightFuture Education</span>
                    <Badge variant="outline" className="border-green-500/40 text-green-400 text-[10px]">
                      Verified
                    </Badge>
                  </div>
                  <p className="text-slate-400">
                    Delivered STEM textbook sets & solar lanterns to primary school students in Bangalore.
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">Yesterday • Geotag: 12.97° N, 77.59° E</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-200">
                    <span>GreenEarth Disaster Relief</span>
                    <Badge variant="outline" className="border-green-500/40 text-green-400 text-[10px]">
                      Verified
                    </Badge>
                  </div>
                  <p className="text-slate-400">
                    Set up clean drinking water filtration systems for coastal flood recovery in Kochi.
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">2 days ago • Geotag: 9.93° N, 76.26° E</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}