import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNGO, NGO } from '@/context/NGOContext';
import { useDonation, Donation, Distribution } from '@/context/DonationContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  LogOut,
  CheckCircle,
  XCircle,
  FileText,
  Loader2,
  Users,
  AlertTriangle,
  ShieldAlert,
  BarChart3,
  TrendingUp,
  Download,
  RefreshCw,
  Search,
  Building2,
  MapPin,
  Coins,
  ShieldCheck,
  Eye,
  Activity,
  History,
  Sliders,
  Check,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { MONTHLY_ANALYTICS_DATA, SEED_AUDIT_LOGS, AuditLog } from '@/data/demoData';

export default function AppAdminDashboard() {
  const navigate = useNavigate();
  const { userData, logout } = useAuth();
  const { ngos, fetchPendingNGOs, updateNGOStatus, resetNGOsDemoData } = useNGO();
  const {
    donations,
    distributions,
    verifyDistribution,
    flagDonation,
    unflagDonation,
    resetDonationsDemoData
  } = useDonation();
  const { toast } = useToast();

  const [pendingNgos, setPendingNgos] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProof, setSelectedProof] = useState<Distribution | null>(null);
  const [selectedNgoDoc, setSelectedNgoDoc] = useState<NGO | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'flagged' | 'completed' | 'verified'>('all');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(SEED_AUDIT_LOGS);
  const [flagThreshold, setFlagThreshold] = useState<number>(50000);
  const [auditCategoryFilter, setAuditCategoryFilter] = useState<string>('all');

  useEffect(() => {
    if (userData?.role === 'app_admin') {
      loadPendingNGOs();
    }
  }, [userData, ngos]);

  const loadPendingNGOs = async () => {
    setLoading(true);
    try {
      const pNgos = await fetchPendingNGOs();
      setPendingNgos(pNgos);
    } catch (err) {
      console.warn('Pending NGOs fallback:', err);
      setPendingNgos(ngos.filter(n => n.status === 'pending'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected' | 'suspended') => {
    try {
      await updateNGOStatus(id, status);
      setPendingNgos(prev => prev.filter(n => n.id !== id));
      
      const newLog: AuditLog = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        actor: userData?.email || 'admin@fundhub.com',
        role: 'App Admin',
        action: `NGO Status Changed to ${status.toUpperCase()}`,
        category: 'verification',
        status: status === 'approved' ? 'success' : 'alert',
        details: `NGO ID ${id} was marked as ${status} by Platform Administrator.`
      };
      setAuditLogs(prev => [newLog, ...prev]);

      toast({
        title: `NGO ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        description: `The NGO verification status has been updated.`
      });
    } catch (err: any) {
      toast({ title: 'Error updating NGO', description: err.message, variant: 'destructive' });
    }
  };

  const handleVerifyProofClick = async (distId: string, donationId?: string) => {
    try {
      await verifyDistribution(distId, donationId);
      const newLog: AuditLog = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        actor: userData?.email || 'admin@fundhub.com',
        role: 'App Admin',
        action: 'Certified Field Proof',
        category: 'distribution',
        status: 'success',
        details: `Distribution ${distId} proof certified and verified on platform escrow.`
      };
      setAuditLogs(prev => [newLog, ...prev]);
    } catch (err: any) {
      toast({ title: 'Verification failed', description: err.message, variant: 'destructive' });
    }
  };

  const handleToggleFlag = async (donation: Donation) => {
    if (donation.is_flagged) {
      await unflagDonation(donation.id);
    } else {
      await flagDonation(donation.id, 'High-value transaction flagged by App Admin for audit');
    }
  };

  const handleResetAllDemoData = () => {
    resetNGOsDemoData();
    resetDonationsDemoData();
    setAuditLogs(SEED_AUDIT_LOGS);
    toast({
      title: 'Demo Data Restored!',
      description: 'Platform analytics, verification queues, and distributions reset to initial demo values.'
    });
  };

  const handleExportCSV = () => {
    const headers = ['Donation ID', 'Donor', 'NGO', 'Amount (INR)', 'Type', 'Status', 'Date', 'Flagged'];
    const rows = donations.map(d => [
      d.id,
      d.donor_name || 'Anonymous',
      d.ngo_name || 'Partner NGO',
      d.amount,
      d.type,
      d.status,
      new Date(d.created_at).toLocaleDateString(),
      d.is_flagged ? 'YES' : 'NO'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fundhub_platform_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: 'Report Exported', description: 'Platform transactions report downloaded as CSV.' });
  };

  // Analytics Calcs
  const totalDonationsAmount = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const totalDistributedAmount = distributions.reduce((sum, d) => sum + (Number(d.amount_spent) || 0), 0);
  const activeNgos = ngos.filter(n => n.status === 'approved').length;
  const pendingCount = ngos.filter(n => n.status === 'pending').length;
  const totalBeneficiaries = distributions.reduce((sum, d) => sum + (d.beneficiary_count || 100), 0);

  // Suspicious Donations
  const suspiciousDonations = donations.filter(d => Number(d.amount) > flagThreshold || d.is_flagged);

  // Charts
  const categoryStats = ngos.reduce((acc: any, ngo) => {
    acc[ngo.category] = (acc[ngo.category] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.keys(categoryStats).map(key => ({ name: key, value: categoryStats[key] }));
  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

  const stateStats = ngos.reduce((acc: any, ngo) => {
    const st = ngo.state || 'Other';
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});
  const stateBarData = Object.keys(stateStats).map(key => ({ state: key, count: stateStats[key] }));

  // Filtered donations
  const filteredDonations = useMemo(() => {
    return donations.filter(d => {
      const matchSearch =
        d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.donor_name && d.donor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.ngo_name && d.ngo_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        d.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchSearch) return false;
      if (statusFilter === 'flagged') return d.is_flagged || Number(d.amount) > flagThreshold;
      if (statusFilter === 'completed') return d.status === 'completed';
      if (statusFilter === 'verified') return d.status === 'verified';
      return true;
    });
  }, [donations, searchTerm, statusFilter, flagThreshold]);

  const filteredLogs = useMemo(() => {
    if (auditCategoryFilter === 'all') return auditLogs;
    return auditLogs.filter(l => l.category === auditCategoryFilter);
  }, [auditLogs, auditCategoryFilter]);

  if (!userData || userData.role !== 'app_admin') {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/10 text-purple-700 border border-purple-200">
              <ShieldCheck className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">FundHub Admin Sentinel</h1>
                <Badge className="bg-purple-100 text-purple-800 border-purple-300 font-medium">Platform HQ</Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Centralized NGO Verification, Donation Auditing & Escrow Surveillance
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetAllDemoData}
              className="text-slate-700 border-slate-300 hover:bg-slate-100 gap-1.5"
              title="Reload ready values for presentations"
            >
              <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
              Reset Demo Data
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="text-slate-700 border-slate-300 hover:bg-slate-100 gap-1.5"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" />
              Export CSV
            </Button>

            <div className="h-6 w-px bg-slate-300 hidden sm:block mx-1" />

            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-800">{userData.email}</p>
                <span className="text-[11px] text-emerald-600 flex items-center justify-end gap-1 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Escrow Active
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 hover:bg-red-50 hover:text-red-700">
                <LogOut className="h-4 w-4 mr-1.5" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Executive KPI Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border border-slate-200/80 shadow-xs bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Platform Volume</p>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Coins className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-extrabold text-slate-900">₹{totalDonationsAmount.toLocaleString('en-IN')}</h3>
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" /> +18.4% from last month
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 shadow-xs bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aid Disbursed</p>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-extrabold text-slate-900">₹{totalDistributedAmount.toLocaleString('en-IN')}</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {Math.round((totalDistributedAmount / (totalDonationsAmount || 1)) * 100)}% deployed to beneficiaries
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 shadow-xs bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified NGOs</p>
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Building2 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-extrabold text-slate-900">{activeNgos} Active</h3>
                <p className="text-xs text-amber-600 font-medium mt-1">
                  {pendingCount} pending verification
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 shadow-xs bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lives Reached</p>
                <div className="p-2 rounded-lg bg-pink-50 text-pink-600">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-extrabold text-slate-900">{totalBeneficiaries.toLocaleString()}+</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Across 6 states & regions
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 shadow-xs bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fraud Risk Score</p>
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <ShieldAlert className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-extrabold text-slate-900">{suspiciousDonations.length} Flags</h3>
                <p className="text-xs text-emerald-600 font-medium mt-1">
                  98.6% clean safety score
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Master Tabs */}
        <Tabs defaultValue="analytics" className="w-full space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1 rounded-xl shadow-xs grid grid-cols-2 sm:grid-cols-5 h-auto">
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium py-2.5">
              <BarChart3 className="w-4 h-4 mr-2" /> Platform Analytics
            </TabsTrigger>
            <TabsTrigger value="approvals" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium py-2.5 relative">
              <Users className="w-4 h-4 mr-2" /> NGO Approvals
              {pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[11px] font-bold">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="proofs" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium py-2.5">
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" /> Proof Verification
            </TabsTrigger>
            <TabsTrigger value="fraud" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium py-2.5">
              <ShieldAlert className="w-4 h-4 mr-2 text-red-500" /> Fraud Sentinel
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium py-2.5">
              <History className="w-4 h-4 mr-2 text-blue-500" /> Audit Trail
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: PLATFORM ANALYTICS */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Monthly Inflow vs Distribution Chart */}
              <Card className="lg:col-span-2 border-slate-200 shadow-xs">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900">Platform Capital Flow & Aid Deployed</CardTitle>
                      <CardDescription>Monthly comparison of donations gathered vs field aid deployed (₹ INR)</CardDescription>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-medium">
                      <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Inflow</span>
                      <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Disbursed</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MONTHLY_ANALYTICS_DATA} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorDisbursed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                      <RechartsTooltip formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']} />
                      <Area type="monotone" dataKey="donations" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorInflow)" name="Donations Inflow" />
                      <Area type="monotone" dataKey="distributions" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDisbursed)" name="Aid Disbursed" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Cause Category Distribution */}
              <Card className="border-slate-200 shadow-xs">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-base font-bold text-slate-900">NGOs by Mission Cause</CardTitle>
                  <CardDescription>Verified organizational specializations</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 h-[320px] flex flex-col justify-between">
                  <div className="h-[210px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
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

            {/* State Distribution & Ledger */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Geographic Reach Bar Chart */}
              <Card className="border-slate-200 shadow-xs">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-base font-bold text-slate-900">Geographic Footprint</CardTitle>
                  <CardDescription>Verified partner networks by state</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stateBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="state" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                      <RechartsTooltip />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="NGO Units" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Transactions Ledger */}
              <Card className="lg:col-span-2 border-slate-200 shadow-xs">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900">Live Escrow Transaction Stream</CardTitle>
                      <CardDescription>Real-time donations with status and audit tags</CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                        <Input
                          placeholder="Search donor, NGO, ID..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="h-8 pl-8 text-xs w-44"
                        />
                      </div>
                      
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="h-8 px-2 rounded-md border border-slate-200 bg-white text-xs text-slate-700"
                      >
                        <option value="all">All Statuses</option>
                        <option value="completed">Ready to Disburse</option>
                        <option value="verified">100% Certified</option>
                        <option value="flagged">Flagged Only</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto max-h-[340px] overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                        <tr>
                          <th className="py-2.5 px-4">Transaction / Date</th>
                          <th className="py-2.5 px-4">Donor & NGO</th>
                          <th className="py-2.5 px-4">Type / Cause</th>
                          <th className="py-2.5 px-4">Amount</th>
                          <th className="py-2.5 px-4">Status</th>
                          <th className="py-2.5 px-4 text-right">Surveillance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredDonations.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-slate-500">
                              No transactions match your search filter.
                            </td>
                          </tr>
                        ) : (
                          filteredDonations.map((d) => (
                            <tr key={d.id} className="hover:bg-slate-50/80 transition">
                              <td className="py-3 px-4 font-mono font-medium text-slate-800">
                                {d.id}
                                <div className="text-[11px] text-slate-400 font-sans font-normal">
                                  {new Date(d.created_at).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-semibold text-slate-900">{d.donor_name || 'Anonymous Donor'}</div>
                                <div className="text-[11px] text-slate-500">{d.ngo_name || 'Verified NGO'}</div>
                              </td>
                              <td className="py-3 px-4 text-slate-600">{d.type}</td>
                              <td className="py-3 px-4 font-bold text-slate-900">
                                ₹{Number(d.amount).toLocaleString('en-IN')}
                              </td>
                              <td className="py-3 px-4">
                                {d.status === 'verified' ? (
                                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">Certified</Badge>
                                ) : d.status === 'distributed' ? (
                                  <Badge className="bg-blue-100 text-blue-800 border-blue-300">Proof Logged</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">Pending Field Use</Badge>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleFlag(d)}
                                  className={`h-7 px-2 text-xs ${d.is_flagged ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-slate-400 hover:text-slate-600'}`}
                                  title={d.is_flagged ? 'Clear flag' : 'Mark suspicious'}
                                >
                                  <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                                  {d.is_flagged ? 'Flagged' : 'Flag'}
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* TAB 2: NGO VERIFICATION QUEUE */}
          <TabsContent value="approvals" className="space-y-6">
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      NGO Credential & Onboarding Queue
                    </CardTitle>
                    <CardDescription>
                      Review legal registration documents, 80G tax certificates, and mandate details before granting platform disbursement privileges.
                    </CardDescription>
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-semibold px-3 py-1">
                    {pendingNgos.length} Applications Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-500 h-8 w-8" /></div>
                ) : pendingNgos.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                    <h4 className="font-bold text-slate-800">Verification Queue is Clear</h4>
                    <p className="text-sm text-slate-500 mt-1">All registered NGOs on FundHub have been verified or audited.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {pendingNgos.map(ngo => (
                      <Card key={ngo.id} className="border border-slate-200 bg-slate-50/50 hover:bg-white transition shadow-xs overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row justify-between gap-6">
                            <div className="space-y-3 flex-1">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl">{ngo.image || '🏛️'}</span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-bold text-slate-900">{ngo.name}</h3>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{ngo.category}</Badge>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-0.5">Govt Registration ID: <span className="font-mono font-semibold text-slate-700">{ngo.registration_id}</span></p>
                                </div>
                              </div>

                              <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">{ngo.description}</p>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-200/80">
                                <div>
                                  <span className="text-slate-400 block font-medium">Headquarters</span>
                                  <p className="font-semibold text-slate-700">{ngo.city}, {ngo.state}</p>
                                </div>
                                <div>
                                  <span className="text-slate-400 block font-medium">Authorized Contact</span>
                                  <p className="font-semibold text-slate-700">{ngo.contact_email}</p>
                                </div>
                                <div>
                                  <span className="text-slate-400 block font-medium">Phone Support</span>
                                  <p className="font-semibold text-slate-700">{ngo.phone_number}</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row lg:flex-col justify-center gap-2.5 min-w-[220px] lg:border-l lg:pl-6 border-slate-200">
                              <Button
                                variant="outline"
                                className="w-full text-slate-700 hover:bg-slate-100"
                                onClick={() => setSelectedNgoDoc(ngo)}
                              >
                                <Eye className="mr-2 h-4 w-4 text-blue-600" /> View 80G Documents
                              </Button>

                              <Button
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => handleStatusUpdate(ngo.id, 'approved')}
                              >
                                <Check className="mr-2 h-4 w-4" /> Approve & Certify
                              </Button>

                              <Button
                                variant="destructive"
                                className="w-full"
                                onClick={() => handleStatusUpdate(ngo.id, 'rejected')}
                              >
                                <XCircle className="mr-2 h-4 w-4" /> Reject Application
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Approved NGOs Directory with Management */}
                <div className="mt-12 pt-8 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-800">Approved Active Partner NGOs ({activeNgos})</h3>
                    <span className="text-xs text-slate-500">Live on Donor Marketplace</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ngos.filter(n => n.status === 'approved').map(ngo => (
                      <div key={ngo.id} className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-300 transition shadow-2xs">
                        <div className="flex items-center gap-3 truncate">
                          <span className="text-2xl">{ngo.image || '🏛️'}</span>
                          <div className="truncate">
                            <p className="font-bold text-sm text-slate-900 truncate">{ngo.name}</p>
                            <p className="text-xs text-slate-500 truncate">{ngo.city} • {ngo.category}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 text-xs shrink-0"
                          onClick={() => handleStatusUpdate(ngo.id, 'suspended')}
                        >
                          Suspend
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: DISTRIBUTION PROOFS & FIELD AUDIT */}
          <TabsContent value="proofs" className="space-y-6">
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      Field Distribution Proof Audit
                    </CardTitle>
                    <CardDescription>
                      Verify geotagged field photos, delivery receipts, and beneficiary attestations submitted by NGOs before closing escrow.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-300 font-semibold">
                    {distributions.length} Total Submissions
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {distributions.map(dist => (
                    <Card key={dist.id} className="border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col justify-between">
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-base">{dist.beneficiary_name}</h4>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              NGO: <span className="font-semibold text-slate-700">{dist.ngo_name || 'Care & Hope Foundation'}</span>
                            </p>
                          </div>
                          {dist.status === 'verified' ? (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> Certified
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1">
                              <Activity className="h-3 w-3" /> Needs Audit
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <div>
                            <span className="text-slate-400 block font-medium">Disbursed Amount</span>
                            <span className="text-slate-900 font-bold text-sm">₹{Number(dist.amount_spent).toLocaleString('en-IN')}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Beneficiaries Reached</span>
                            <span className="text-slate-900 font-bold text-sm">{dist.beneficiary_count || 100} Citizens</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Geotag Location</span>
                            <span className="text-slate-700 font-medium flex items-center gap-1 truncate">
                              <MapPin className="h-3 w-3 text-red-500 shrink-0" /> {dist.location || 'Mumbai, MH'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Submission Date</span>
                            <span className="text-slate-700 font-medium">{new Date(dist.distributed_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 italic bg-amber-50/50 p-2.5 rounded border border-amber-100">
                          "{dist.notes}"
                        </p>

                        <div className="pt-2 flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-slate-700"
                            onClick={() => setSelectedProof(dist)}
                          >
                            <FileText className="mr-1.5 h-3.5 w-3.5 text-blue-600" /> View Proof Document
                          </Button>

                          {dist.status !== 'verified' && (
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                              onClick={() => handleVerifyProofClick(dist.id, dist.donation_id)}
                            >
                              <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Approve Proof
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: FRAUD DETECTION & SECURITY */}
          <TabsContent value="fraud" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Threshold Configuration Card */}
              <Card className="border-slate-200 shadow-xs">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-purple-600" />
                    Security Sentinel Parameters
                  </CardTitle>
                  <CardDescription>Adjust automated compliance surveillance criteria</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Auto-Flag Amount Threshold (₹ INR)</Label>
                    <p className="text-xs text-slate-500 mb-2">Transactions above this sum trigger immediate admin compliance hold.</p>
                    <Input
                      type="number"
                      step={5000}
                      value={flagThreshold}
                      onChange={(e) => setFlagThreshold(Number(e.target.value))}
                      className="font-bold text-slate-900"
                    />
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-1.5 text-blue-900">
                    <p className="font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-blue-600" /> AI Anomaly Detection: Active
                    </p>
                    <p className="text-blue-800">
                      Monitoring rapid micro-transactions, mismatched GPS dispatch radii, and foreign IP gateways in real time.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Suspicious Activity Review List */}
              <Card className="lg:col-span-2 border-slate-200 shadow-xs">
                <CardHeader className="border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold flex items-center gap-2 text-red-700">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        Flagged Transactions Requiring Manual Clearance
                      </CardTitle>
                      <CardDescription>Review donations held for compliance documentation</CardDescription>
                    </div>
                    <Badge variant="destructive">{suspiciousDonations.length} Pending Actions</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {suspiciousDonations.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <ShieldCheck className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                      <p className="font-medium text-slate-700">Zero active security flags.</p>
                      <p className="text-xs text-slate-400">All transactions meet standard platform compliance thresholds.</p>
                    </div>
                  ) : (
                    suspiciousDonations.map(d => (
                      <div key={d.id} className="p-4 border border-red-200 bg-red-50/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-lg">₹{Number(d.amount).toLocaleString('en-IN')}</span>
                            <Badge variant="outline" className="border-red-300 text-red-700 bg-red-100 font-mono text-[11px]">{d.id}</Badge>
                          </div>
                          <p className="text-xs text-slate-700 font-medium">Donor: {d.donor_name || 'Anonymous'} • Target NGO: {d.ngo_name || 'Partner NGO'}</p>
                          <p className="text-xs text-red-600 font-semibold">
                            Alert: {d.flag_reason || `Exceeds current threshold (> ₹${flagThreshold.toLocaleString('en-IN')})`}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 text-xs"
                            onClick={() => unflagDonation(d.id)}
                          >
                            <Check className="h-3.5 w-3.5 mr-1" /> Clear & Release
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="text-xs"
                            onClick={() => {
                              toast({
                                title: 'Escrow Frozen',
                                description: `Payout for ${d.id} frozen pending formal donor KYC submission.`,
                                variant: 'destructive'
                              });
                            }}
                          >
                            Freeze Escrow
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* TAB 5: AUDIT TRAIL */}
          <TabsContent value="audit" className="space-y-6">
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <History className="h-4 w-4 text-blue-600" />
                      Platform Governance & Audit Log Trail
                    </CardTitle>
                    <CardDescription>Immutable record of administrative interventions, approvals, and payout verifications</CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 text-slate-400" />
                    <select
                      value={auditCategoryFilter}
                      onChange={(e) => setAuditCategoryFilter(e.target.value)}
                      className="h-8 px-2 rounded-md border border-slate-200 bg-white text-xs text-slate-700"
                    >
                      <option value="all">All Categories</option>
                      <option value="verification">Verification</option>
                      <option value="financial">Financial</option>
                      <option value="security">Security</option>
                      <option value="distribution">Distribution</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                      <tr>
                        <th className="py-2.5 px-4">Timestamp</th>
                        <th className="py-2.5 px-4">Actor & Role</th>
                        <th className="py-2.5 px-4">Action</th>
                        <th className="py-2.5 px-4">Category</th>
                        <th className="py-2.5 px-4">Audit Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 font-mono text-slate-600">{log.timestamp}</td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-900 block">{log.actor}</span>
                            <span className="text-[11px] text-slate-500">{log.role}</span>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800">{log.action}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="capitalize text-[11px]">{log.category}</Badge>
                          </td>
                          <td className="py-3 px-4 text-slate-600 max-w-md">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </main>

      {/* MODAL 1: VIEW PROOF DOCUMENT */}
      <Dialog open={!!selectedProof} onOpenChange={(open) => !open && setSelectedProof(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Verified Field Proof Dossier
            </DialogTitle>
            <DialogDescription>
              Beneficiary: {selectedProof?.beneficiary_name} • Disbursed: ₹{Number(selectedProof?.amount_spent).toLocaleString('en-IN')}
            </DialogDescription>
          </DialogHeader>

          {selectedProof && (
            <div className="space-y-4 mt-2">
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center max-h-[380px]">
                <img
                  src={selectedProof.proof_image_url}
                  alt="Distribution Proof"
                  className="max-h-[380px] w-auto object-contain"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-medium">GPS Geotag Verification</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-red-500" />
                    Lat {selectedProof.latitude || 19.1136}, Lng {selectedProof.longitude || 72.8697}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Proof Documentation Type</span>
                  <span className="font-semibold text-slate-800">{selectedProof.proof_type || 'Field Delivery Receipt & Photo'}</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 bg-white p-3 rounded border border-slate-200">
                <strong>Field Log Notes:</strong> {selectedProof.notes}
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setSelectedProof(null)}>Close</Button>
                {selectedProof.status !== 'verified' && (
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => {
                      handleVerifyProofClick(selectedProof.id, selectedProof.donation_id);
                      setSelectedProof(null);
                    }}
                  >
                    <CheckCircle className="mr-1.5 h-4 w-4" /> Certify Proof & Release Escrow
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL 2: VIEW NGO CREDENTIAL CERTIFICATE */}
      <Dialog open={!!selectedNgoDoc} onOpenChange={(open) => !open && setSelectedNgoDoc(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              NGO Legal Incorporation & Tax Clearance
            </DialogTitle>
            <DialogDescription>
              {selectedNgoDoc?.name} • Reg #{selectedNgoDoc?.registration_id}
            </DialogDescription>
          </DialogHeader>

          {selectedNgoDoc && (
            <div className="space-y-4 mt-2">
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center max-h-[380px]">
                <img
                  src={selectedNgoDoc.verification_document_url || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=60'}
                  alt="Registration Document"
                  className="max-h-[380px] w-auto object-contain"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-medium">Tax Exemption</span>
                  <span className="font-semibold text-emerald-700">Section 80G / 12A</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">FCRA Clearance</span>
                  <span className="font-semibold text-blue-700">Approved Foreign Aid</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">NITI Aayog DARPAN</span>
                  <span className="font-semibold text-slate-800">Verified Match</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setSelectedNgoDoc(null)}>Close</Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => {
                    handleStatusUpdate(selectedNgoDoc.id, 'approved');
                    setSelectedNgoDoc(null);
                  }}
                >
                  <Check className="mr-1.5 h-4 w-4" /> Approve NGO
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
