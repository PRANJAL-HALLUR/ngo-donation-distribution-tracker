import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNGO } from '@/context/NGOContext';
import { useDonation, Donation, Distribution } from '@/context/DonationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LogOut,
  Loader2,
  Clock,
  UploadCloud,
  CheckCircle2,
  PackageOpen,
  BarChart3,
  TrendingUp,
  MapPin,
  Building2,
  Heart,
  PlusCircle,
  FileText,
  Download,
  RefreshCw,
  Eye,
  Crosshair,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';
import {
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { SEED_CAMPAIGNS, Campaign } from '@/data/demoData';
import NGOOnboarding from './NGOOnboarding';

export default function NGODashboard() {
  const navigate = useNavigate();
  const { user, userData, logout } = useAuth();
  const { currentNgo, loading: ngoLoading, resetNGOsDemoData } = useNGO();
  const {
    donations,
    distributions,
    logDistribution,
    resetDonationsDemoData,
    loading: donationLoading
  } = useDonation();
  const { toast } = useToast();

  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [beneficiary, setBeneficiary] = useState('');
  const [amountSpent, setAmountSpent] = useState('');
  const [beneficiaryCount, setBeneficiaryCount] = useState('50');
  const [locationName, setLocationName] = useState('Mumbai, Maharashtra');
  const [notes, setNotes] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofUrlSample, setProofUrlSample] = useState('');
  const [isDistributing, setIsDistributing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedHistoryDist, setSelectedHistoryDist] = useState<Distribution | null>(null);

  // Campaigns state
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    try {
      const stored = localStorage.getItem('fundhub_local_campaigns');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return SEED_CAMPAIGNS;
  });

  // Create Campaign modal state
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [campTitle, setCampTitle] = useState('');
  const [campCategory, setCampCategory] = useState('Food & Nutrition');
  const [campTarget, setCampTarget] = useState('');
  const [campBeneficiaries, setCampBeneficiaries] = useState('');
  const [campDescription, setCampDescription] = useState('');

  if (!user || !userData || userData.role !== 'ngo_admin') {
    navigate('/');
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isDemoNgo = userData?.email === 'ngo@careandhope.org' || user?.email === 'ngo@careandhope.org';
  const effectiveNgo = isDemoNgo
    ? (currentNgo || {
        id: '11111111-1111-1111-1111-111111111111',
        user_id: 'seed-1',
        name: 'Care & Hope Foundation',
        description: 'Providing nutritional meals, healthcare kits, and shelter support to underprivileged children and families across urban communities.',
        mission: 'Eliminating hunger and empowering the next generation through health and education.',
        registration_id: 'REG-100234',
        contact_email: 'contact@careandhope.org',
        phone_number: '+91 9876543210',
        category: 'Food & Healthcare',
        address: '12 Marine Drive, Nariman Point',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        latitude: 18.9256,
        longitude: 72.8242,
        verification_document_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=60',
        status: 'approved',
        total_received: 65500,
        image: '🍲'
      })
    : currentNgo;

  // Filter donations relevant to this NGO
  const ngoDonations = useMemo(() => {
    return donations.filter(d => 
      !d.ngo_id || 
      d.ngo_id === effectiveNgo?.id || 
      d.ngo_id === '11111111-1111-1111-1111-111111111111' ||
      d.ngo_name === effectiveNgo?.name
    );
  }, [donations, effectiveNgo]);

  const ngoDistributions = useMemo(() => {
    return distributions.filter(d => 
      !d.ngo_id || 
      d.ngo_id === effectiveNgo?.id || 
      d.ngo_id === user.id || 
      d.ngo_id === '11111111-1111-1111-1111-111111111111' ||
      d.ngo_name === effectiveNgo?.name
    );
  }, [distributions, effectiveNgo, user]);

  const completedDonations = ngoDonations.filter(d => d.status === 'completed');
  const totalReceived = ngoDonations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const totalDistributedAmt = ngoDistributions.reduce((sum, d) => sum + (Number(d.amount_spent) || 0), 0);
  const totalBeneficiaries = ngoDistributions.reduce((sum, d) => sum + (d.beneficiary_count || 50), 0);

  const handleDistribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonation) return;

    setError(null);
    setIsDistributing(true);

    try {
      await logDistribution(
        selectedDonation.id,
        beneficiary,
        parseFloat(amountSpent),
        notes,
        proofFile,
        {
          beneficiary_count: parseInt(beneficiaryCount) || 50,
          location: locationName,
          proofUrlFallback: proofUrlSample || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=60'
        }
      );
      setBeneficiary('');
      setAmountSpent('');
      setBeneficiaryCount('50');
      setNotes('');
      setProofFile(null);
      setProofUrlSample('');
      setIsDialogOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to log distribution');
    } finally {
      setIsDistributing(false);
    }
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campTitle || !campTarget) return;

    const newCamp: Campaign = {
      id: `camp_${Date.now()}`,
      ngoId: effectiveNgo?.id || '11111111-1111-1111-1111-111111111111',
      title: campTitle,
      category: campCategory,
      targetAmount: parseFloat(campTarget),
      raisedAmount: 0,
      beneficiariesTarget: parseInt(campBeneficiaries) || 200,
      beneficiariesReached: 0,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      description: campDescription || 'Community relief initiative.'
    };

    const updated = [newCamp, ...campaigns];
    setCampaigns(updated);
    localStorage.setItem('fundhub_local_campaigns', JSON.stringify(updated));

    setCampTitle('');
    setCampTarget('');
    setCampBeneficiaries('');
    setCampDescription('');
    setIsCampaignDialogOpen(false);

    toast({
      title: 'Campaign Launched!',
      description: `"${newCamp.title}" is now active and accepting donations.`
    });
  };

  const handleDetectGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationName(`Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(4)} (GPS Verified)`);
          toast({ title: 'GPS Geotag Detected', description: 'Device GPS location tagged to proof record.' });
        },
        () => {
          setLocationName('Mumbai, Maharashtra (19.0760° N, 72.8777° E)');
          toast({ title: 'Default Geotag Set', description: 'Tagged to NGO Headquarters coordinates.' });
        }
      );
    } else {
      setLocationName('Mumbai, Maharashtra');
    }
  };

  const handleResetAllDemoData = () => {
    resetNGOsDemoData();
    resetDonationsDemoData();
    setCampaigns(SEED_CAMPAIGNS);
    localStorage.setItem('fundhub_local_campaigns', JSON.stringify(SEED_CAMPAIGNS));
    toast({
      title: 'Demo Data Restored!',
      description: 'NGO analytics, incoming donations, campaigns, and distribution history reset to initial ready demo values.'
    });
  };

  const handleExportNGOReport = () => {
    const headers = ['Record Type', 'ID / Ref', 'Beneficiary / Donor', 'Amount (INR)', 'Category / Notes', 'Status', 'Date'];
    const rows = [
      ...ngoDonations.map(d => ['Donation Intake', d.id, d.donor_name || 'Donor', d.amount, d.type, d.status, new Date(d.created_at).toLocaleDateString()]),
      ...ngoDistributions.map(dist => ['Field Distribution', dist.id, dist.beneficiary_name, dist.amount_spent, dist.notes, dist.status, new Date(dist.distributed_at).toLocaleDateString()])
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ngo_transparency_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: 'Report Downloaded', description: 'NGO Transparency & 80G Disbursal Report downloaded as CSV.' });
  };

  // Group by category for charts
  const typeStats = ngoDonations.reduce((acc: any, don) => {
    acc[don.type] = (acc[don.type] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.keys(typeStats).map(key => ({ name: key, value: typeStats[key] }));
  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  const monthlyData = [
    { month: 'Jul', received: 15000, distributed: 12000 },
    { month: 'Aug', received: 22000, distributed: 18000 },
    { month: 'Sep', received: 28000, distributed: 25000 },
    { month: 'Oct', received: 65500, distributed: 35500 }
  ];

  if (ngoLoading || donationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (!isDemoNgo && (!effectiveNgo || effectiveNgo.status === undefined)) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4 flex justify-end mb-4">
          <Button variant="outline" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4"/> Logout</Button>
        </div>
        <NGOOnboarding />
      </div>
    );
  }

  if (!isDemoNgo && effectiveNgo.status === 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
            <CardTitle className="text-2xl">Application Under Review</CardTitle>
            <CardDescription className="mt-2 text-base">
              Your NGO verification documents are currently being reviewed by our administration team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">
              We will notify you at {effectiveNgo.contact_email} once your account is approved.
            </p>
            <Button onClick={handleLogout} variant="outline" className="w-full">Logout</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl p-2 bg-blue-50 rounded-xl border border-blue-200 shrink-0">
              {effectiveNgo?.image || '🍲'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{effectiveNgo?.name || 'Care & Hope Foundation'}</h1>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-medium">80G Verified</Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {effectiveNgo?.city}, {effectiveNgo?.state} • Reg #{effectiveNgo?.registration_id} • Escrow Partner
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetAllDemoData}
              className="text-slate-700 border-slate-300 hover:bg-slate-100 gap-1.5"
              title="Reset sample values for demo"
            >
              <RefreshCw className="h-3.5 w-3.5 text-blue-600" /> Reset Demo Data
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportNGOReport}
              className="text-slate-700 border-slate-300 hover:bg-slate-100 gap-1.5"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" /> Export 80G Report
            </Button>

            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
              onClick={() => setIsCampaignDialogOpen(true)}
            >
              <PlusCircle className="h-3.5 w-3.5" /> Launch Campaign
            </Button>

            <div className="h-6 w-px bg-slate-300 hidden sm:block mx-1" />

            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 hover:bg-red-50 hover:text-red-700">
              <LogOut className="h-4 w-4 mr-1.5" /> Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Executive Impact Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-slate-200 shadow-xs bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Received</p>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Heart className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-extrabold text-slate-900">₹{totalReceived.toLocaleString('en-IN')}</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Across {ngoDonations.length} donor contributions
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-xs bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Aid Disbursed</p>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-extrabold text-slate-900">₹{totalDistributedAmt.toLocaleString('en-IN')}</h3>
                <p className="text-xs text-emerald-600 font-medium mt-1">
                  {Math.round((totalDistributedAmt / (totalReceived || 1)) * 100)}% utilization rate
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-xs bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available for Deployment</p>
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <PackageOpen className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-extrabold text-slate-900">{completedDonations.length} Pending</h3>
                <p className="text-xs text-amber-600 font-medium mt-1">
                  Ready to disburse with field proof
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-xs bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Direct Beneficiaries</p>
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Sparkles className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-extrabold text-slate-900">{totalBeneficiaries}+ Lives</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Verified with geotagged deliveries
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* NGO Workspace Tabs */}
        <Tabs defaultValue="intake" className="w-full space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1 rounded-xl shadow-xs grid grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="intake" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium py-2.5">
              <PackageOpen className="w-4 h-4 mr-2" /> Donation Intake ({completedDonations.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium py-2.5">
              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> Distribution Proofs ({ngoDistributions.length})
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium py-2.5">
              <TrendingUp className="w-4 h-4 mr-2 text-purple-500" /> Active Relief Drives
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium py-2.5">
              <BarChart3 className="w-4 h-4 mr-2 text-amber-500" /> NGO Analytics
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: INTAKE & DISTRIBUTION */}
          <TabsContent value="intake" className="space-y-6">
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <PackageOpen className="h-5 w-5 text-blue-600" />
                      Incoming Donations Ready for Field Deployment
                    </CardTitle>
                    <CardDescription>
                      Funds transferred by donors held in platform escrow. Upload geotagged proof of delivery to release funds and notify donors.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200 font-semibold">
                    {completedDonations.length} Pending Distribution
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {completedDonations.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                    <h4 className="font-bold text-slate-800">All Received Donations Disbursed!</h4>
                    <p className="text-sm text-slate-500 mt-1">There are no pending donations awaiting field deployment.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completedDonations.map(donation => (
                      <div
                        key={donation.id}
                        className="p-5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-slate-900">
                              ₹{Number(donation.amount).toLocaleString('en-IN')}
                            </span>
                            <Badge variant="secondary" className="font-medium">{donation.type}</Badge>
                            <span className="text-xs font-mono text-slate-400">#{donation.id.slice(0, 10)}</span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Donor: <strong className="text-slate-700">{donation.donor_name || 'Anonymous Supporter'}</strong> • Received {new Date(donation.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <Dialog
                          open={isDialogOpen && selectedDonation?.id === donation.id}
                          onOpenChange={(open) => {
                            if (open) {
                              setSelectedDonation(donation);
                              setAmountSpent(donation.amount.toString());
                              setIsDialogOpen(true);
                            } else {
                              setIsDialogOpen(false);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                              Deploy Aid & Upload Proof
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[540px]">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <PackageOpen className="h-5 w-5 text-blue-600" />
                                Log Field Distribution & Geotag Proof
                              </DialogTitle>
                              <DialogDescription>
                                Disbursing aid for Donation #{donation.id.slice(0, 10)} (Max: ₹{donation.amount})
                              </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleDistribute} className="space-y-4 mt-3">
                              {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

                              <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Beneficiary Name or Community Group</Label>
                                <Input
                                  value={beneficiary}
                                  onChange={e => setBeneficiary(e.target.value)}
                                  required
                                  placeholder="e.g., Sneha Sadan Orphanage, Andheri East"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold">Amount Spent (₹ INR)</Label>
                                  <Input
                                    type="number"
                                    value={amountSpent}
                                    onChange={e => setAmountSpent(e.target.value)}
                                    required
                                    max={donation.amount}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold">Direct Beneficiary Count</Label>
                                  <Input
                                    type="number"
                                    value={beneficiaryCount}
                                    onChange={e => setBeneficiaryCount(e.target.value)}
                                    required
                                    placeholder="e.g. 50"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs font-semibold">Distribution Location / Geotag</Label>
                                  <button
                                    type="button"
                                    onClick={handleDetectGPS}
                                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-medium"
                                  >
                                    <Crosshair className="h-3 w-3" /> Detect Current GPS
                                  </button>
                                </div>
                                <Input
                                  value={locationName}
                                  onChange={e => setLocationName(e.target.value)}
                                  placeholder="e.g., Dharavi Slum Ward 7, Mumbai"
                                  required
                                />
                              </div>

                              <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Field Delivery Description & Items</Label>
                                <Textarea
                                  value={notes}
                                  onChange={e => setNotes(e.target.value)}
                                  required
                                  rows={2}
                                  placeholder="Describe how supplies/aid reached beneficiaries..."
                                />
                              </div>

                              <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Upload Photo / Attested Invoice Proof</Label>
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 text-center">
                                  <UploadCloud className="h-7 w-7 text-slate-400 mb-1" />
                                  <Input
                                    type="file"
                                    accept=".pdf,image/*"
                                    onChange={e => setProofFile(e.target.files?.[0] || null)}
                                    className="w-full max-w-xs cursor-pointer text-xs"
                                  />
                                  <p className="text-[11px] text-slate-400 mt-1">Accepts PNG, JPG, or PDF (Max 10MB)</p>
                                </div>
                              </div>

                              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isDistributing}>
                                {isDistributing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying & Uploading...</> : 'Confirm Distribution & Submit to Escrow'}
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: DISTRIBUTION PROOF GALLERY */}
          <TabsContent value="history" className="space-y-6">
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      Field Proof Records & Audit Certifications
                    </CardTitle>
                    <CardDescription>
                      All logged distribution events with geotags and platform admin approval states.
                    </CardDescription>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-medium">
                    {ngoDistributions.filter(d => d.status === 'verified').length} / {ngoDistributions.length} Certified
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {ngoDistributions.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">No distributions logged yet.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {ngoDistributions.map(dist => (
                      <Card key={dist.id} className="border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col justify-between">
                        <CardContent className="p-5 space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="font-bold text-slate-900 text-base">{dist.beneficiary_name}</h4>
                              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-red-500" /> {dist.location || 'Mumbai, Maharashtra'}
                              </p>
                            </div>
                            {dist.status === 'verified' ? (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 flex items-center gap-1 font-medium">
                                <CheckCircle2 className="h-3 w-3" /> Certified by Admin
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1 font-medium">
                                <Clock className="h-3 w-3" /> In Admin Review
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div>
                              <span className="text-slate-400 block font-medium">Amount Deployed</span>
                              <span className="text-slate-900 font-bold text-sm">₹{Number(dist.amount_spent).toLocaleString('en-IN')}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-medium">Impact Count</span>
                              <span className="text-slate-900 font-bold text-sm">{dist.beneficiary_count || 50} Citizens</span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-200">
                            <strong>Field Notes:</strong> {dist.notes}
                          </p>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] text-slate-400">
                              Logged on {new Date(dist.distributed_at).toLocaleDateString()}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs text-blue-600 hover:text-blue-700"
                              onClick={() => setSelectedHistoryDist(dist)}
                            >
                              <FileText className="mr-1.5 h-3.5 w-3.5" /> View Proof Document
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: RELIEF CAMPAIGNS */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Active Relief Drives & Funding Goals</h3>
                <p className="text-xs text-slate-500">Fundraising initiatives managed by {effectiveNgo?.name}</p>
              </div>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                onClick={() => setIsCampaignDialogOpen(true)}
              >
                <PlusCircle className="h-3.5 w-3.5" /> Create Relief Drive
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {campaigns.map(camp => {
                const percent = Math.min(100, Math.round((camp.raisedAmount / (camp.targetAmount || 1)) * 100));
                return (
                  <Card key={camp.id} className="border-slate-200 shadow-xs flex flex-col justify-between">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                          {camp.category}
                        </Badge>
                        <Badge className={camp.status === 'active' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-200 text-slate-700'}>
                          {camp.status === 'active' ? 'Live Campaign' : 'Completed'}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-bold text-slate-900 mt-1">{camp.title}</CardTitle>
                      <CardDescription className="line-clamp-2 text-xs">{camp.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1.5">
                          <span className="text-slate-600">Progress ({percent}%)</span>
                          <span className="text-slate-900 font-bold">₹{camp.raisedAmount.toLocaleString()} / ₹{camp.targetAmount.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${percent}%` }} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-slate-400 block font-medium">Target Citizens</span>
                          <span className="font-bold text-slate-800">{camp.beneficiariesTarget} People</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Citizens Reached</span>
                          <span className="font-bold text-emerald-700">{camp.beneficiariesReached} People</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Ends: {camp.endDate}</span>
                        <span className="font-medium text-blue-600">80G Tax Deductible</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* TAB 4: NGO ANALYTICS */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Monthly Intake vs Deployed */}
              <Card className="lg:col-span-2 border-slate-200 shadow-xs">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold">Monthly Funding Intake vs Deployed Aid</CardTitle>
                      <CardDescription>Comparison of funds raised vs field deployment (₹ INR)</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 h-[290px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                      <RechartsTooltip formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']} />
                      <Bar dataKey="received" fill="#3b82f6" name="Received" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="distributed" fill="#10b981" name="Deployed" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Cause Breakdown */}
              <Card className="border-slate-200 shadow-xs">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-base font-bold">Donations by Aid Category</CardTitle>
                  <CardDescription>Distribution across mission packages</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 h-[290px] flex flex-col justify-between">
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={75} paddingAngle={4} dataKey="value">
                          {pieData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                    {pieData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-1.5 truncate">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                        <span className="text-slate-600 truncate">{entry.name}</span>
                        <span className="font-semibold text-slate-900 ml-auto">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </main>

      {/* MODAL 1: VIEW PROOF DOCUMENT */}
      <Dialog open={!!selectedHistoryDist} onOpenChange={(open) => !open && setSelectedHistoryDist(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Field Proof Dossier
            </DialogTitle>
            <DialogDescription>
              Beneficiary: {selectedHistoryDist?.beneficiary_name} • Spent: ₹{Number(selectedHistoryDist?.amount_spent).toLocaleString('en-IN')}
            </DialogDescription>
          </DialogHeader>

          {selectedHistoryDist && (
            <div className="space-y-4 mt-2">
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center max-h-[350px]">
                <img
                  src={selectedHistoryDist.proof_image_url}
                  alt="Proof Document"
                  className="max-h-[350px] w-auto object-contain"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-medium">GPS Geotag Verification</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-red-500" /> {selectedHistoryDist.location || 'Mumbai, MH'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Impact Reach</span>
                  <span className="font-semibold text-slate-800">{selectedHistoryDist.beneficiary_count || 50} Citizens Supported</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 bg-white p-3 rounded border border-slate-200">
                <strong>Field Log Notes:</strong> {selectedHistoryDist.notes}
              </p>

              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setSelectedHistoryDist(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL 2: LAUNCH NEW CAMPAIGN */}
      <Dialog open={isCampaignDialogOpen} onOpenChange={setIsCampaignDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-blue-600" />
              Launch New Relief Campaign
            </DialogTitle>
            <DialogDescription>
              Create a targeted fundraising drive with verifiable milestones.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCampaign} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Campaign Title</Label>
              <Input
                value={campTitle}
                onChange={e => setCampTitle(e.target.value)}
                placeholder="e.g., Winter Warmth & Nutrition Drive"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Target Amount (₹ INR)</Label>
                <Input
                  type="number"
                  value={campTarget}
                  onChange={e => setCampTarget(e.target.value)}
                  placeholder="50000"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Beneficiary Target</Label>
                <Input
                  type="number"
                  value={campBeneficiaries}
                  onChange={e => setCampBeneficiaries(e.target.value)}
                  placeholder="300"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Cause Category</Label>
              <select
                value={campCategory}
                onChange={e => setCampCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-xs text-slate-800"
              >
                <option value="Food & Nutrition">Food & Nutrition</option>
                <option value="Healthcare & Medicine">Healthcare & Medicine</option>
                <option value="Education & Literacy">Education & Literacy</option>
                <option value="Disaster Relief">Disaster Relief</option>
                <option value="Elderly Welfare">Elderly Welfare</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Campaign Description</Label>
              <Textarea
                value={campDescription}
                onChange={e => setCampDescription(e.target.value)}
                rows={3}
                placeholder="Explain the mission, beneficiaries, and item breakdown..."
                required
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Launch Campaign on FundHub
            </Button>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
