import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useNGO, NGO } from "@/context/NGOContext";
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
import LeafletMap from "@/components/LeafletMap";

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
  Sparkles,
  ExternalLink,
  ChevronRight,
  Crosshair
} from "lucide-react";

export default function MapsTracking() {
  const navigate = useNavigate();
  const { ngos } = useNGO();
  const { location } = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedNgo, setSelectedNgo] = useState<NGO | null>(null);

  const categories = ["All", "Healthcare", "Education", "Disaster Relief", "Environment", "Food & Healthcare"];

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
        ngo.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ngo.address?.toLowerCase().includes(searchQuery.toLowerCase());
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
                  FundHub Geographic Field Tracker
                </h1>
                <p className="text-xs text-slate-400">
                  Real-time interactive NGO street maps & geotagged distribution transparency
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
              <p className="text-base font-bold text-white">{approvedNgos.length} Plotted</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Address Geocoding</p>
              <p className="text-base font-bold text-emerald-400">100% Street-Level</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Navigation className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Map Tile Engine</p>
              <p className="text-base font-bold text-white">OpenStreetMap / Carto</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400">API Key Dependency</p>
              <p className="text-base font-bold text-amber-400">Zero Keys (Free)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Map Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by NGO name, city, or street address..."
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

        {/* Map and Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* Real Interactive Street Map */}
          <div className="lg:col-span-2 relative min-h-[580px] flex flex-col">
            <LeafletMap
              ngos={filteredNgos}
              selectedNgo={selectedNgo}
              onSelectNgo={(ngo) => setSelectedNgo(ngo)}
              className="flex-1"
            />
          </div>

          {/* Right Panel: NGO Details & Field Centers List */}
          <div className="space-y-6 flex flex-col">
            {/* Selected NGO Spotlight Card */}
            {selectedNgo ? (
              <Card className="bg-slate-900 border-slate-800 shadow-2xl overflow-hidden ring-1 ring-blue-500/30">
                <CardHeader className="bg-gradient-to-r from-blue-950/70 to-indigo-950/40 border-b border-slate-800 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs">
                          {selectedNgo.category}
                        </Badge>
                        <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-xs flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> 100% Verified
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-bold text-white leading-snug">
                        {selectedNgo.name}
                      </CardTitle>
                    </div>
                    <div className="text-3xl p-2 bg-slate-800/80 rounded-xl border border-slate-700 shadow">
                      {selectedNgo.image || "🏢"}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4 text-sm">
                  {/* Exact Address Callout Box */}
                  <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-blue-400" />
                        Exact Physical Address
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedNgo({ ...selectedNgo })}
                        className="h-6 px-2 text-[10px] text-blue-300 hover:text-white hover:bg-blue-900/50"
                      >
                        <Crosshair className="h-3 w-3 mr-1" /> Re-center
                      </Button>
                    </div>
                    <p className="text-slate-100 font-semibold text-sm leading-relaxed">
                      {selectedNgo.address}
                    </p>
                    <p className="text-xs text-slate-400">
                      {selectedNgo.city}, {selectedNgo.state}, {selectedNgo.country}
                    </p>
                    <div className="pt-2 border-t border-blue-900/40 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Coordinates:</span>
                      <span className="text-blue-300">
                        {selectedNgo.latitude?.toFixed(4)}° N, {selectedNgo.longitude?.toFixed(4)}° E
                      </span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs uppercase font-semibold text-slate-400">
                      Mission Statement
                    </h5>
                    <p className="text-slate-300 mt-1 leading-relaxed text-xs">
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
                      <span className="text-slate-400">Verified Aid:</span>
                      <p className="text-emerald-400 font-semibold mt-0.5">
                        ${selectedNgo.total_received || 0} Raised
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2.5 pt-2">
                    <Button
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-blue-900/40"
                      onClick={() => navigate("/browse")}
                    >
                      <Heart className="h-4 w-4 mr-1.5 fill-current" /> Donate Now
                    </Button>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedNgo.latitude},${selectedNgo.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-3 py-2 rounded-md text-xs font-medium border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                      title="Open in Google Maps"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1" /> Map Link
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-white"
                      onClick={() => setSelectedNgo(null)}
                    >
                      Close
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-900/80 border-slate-800 p-5 text-center shadow-lg flex flex-col items-center justify-center min-h-[160px]">
                <div className="h-10 w-10 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-2">
                  <MapPin className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-white">Click Any Center to Zoom In</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Select a marker on the map or click a verified center below to fly down to street level and inspect exact addresses.
                </p>
              </Card>
            )}

            {/* List of Verified Centers with 1-Click Zoom */}
            <Card className="bg-slate-900 border-slate-800 shadow-xl flex flex-col">
              <CardHeader className="pb-3 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-400" />
                    Field Centers ({filteredNgos.length})
                  </CardTitle>
                  <span className="text-[11px] text-slate-400">Click to zoom into address</span>
                </div>
              </CardHeader>
              <CardContent className="p-3 space-y-2 max-h-[260px] overflow-y-auto">
                {filteredNgos.map((ngo) => {
                  const isSelected = selectedNgo?.id === ngo.id;
                  return (
                    <div
                      key={ngo.id}
                      onClick={() => setSelectedNgo(ngo)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-blue-900/40 border-blue-500/60 shadow-md ring-1 ring-blue-500/30"
                          : "bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl p-1 bg-slate-900/60 rounded-lg">{ngo.image || "🏢"}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{ngo.name}</p>
                          <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-blue-400 flex-shrink-0" />
                            {ngo.address}, {ngo.city}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-[10px] text-blue-400 hover:text-white hover:bg-blue-600 flex-shrink-0"
                      >
                        Zoom <ChevronRight className="h-3 w-3 ml-0.5" />
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

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
              <CardContent className="p-4 space-y-3.5 flex-1 overflow-y-auto max-h-[220px]">
                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-200">
                    <span>Care & Hope Foundation</span>
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">
                      Verified
                    </Badge>
                  </div>
                  <p className="text-slate-400">
                    Dispatched emergency pediatric medical kits to 120 families in Mumbai.
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">Today • Geotag: 18.9256° N, 72.8242° E</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-200">
                    <span>BrightFuture Literacy Initiative</span>
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">
                      Verified
                    </Badge>
                  </div>
                  <p className="text-slate-400">
                    Delivered STEM textbook sets & solar lanterns to primary school students in Bangalore.
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">Yesterday • Geotag: 12.8452° N, 77.6602° E</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-200">
                    <span>GreenEarth Disaster Relief</span>
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">
                      Verified
                    </Badge>
                  </div>
                  <p className="text-slate-400">
                    Set up clean drinking water filtration systems for coastal flood recovery in Fort Kochi.
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">2 days ago • Geotag: 9.9658° N, 76.2427° E</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}