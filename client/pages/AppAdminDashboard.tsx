import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNGO, NGO } from '@/context/NGOContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, CheckCircle, XCircle, FileText, Loader2, Users, AlertTriangle, ShieldAlert, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AppAdminDashboard() {
  const navigate = useNavigate();
  const { userData, logout } = useAuth();
  const { ngos, fetchPendingNGOs, updateNGOStatus } = useNGO();
  const { toast } = useToast();

  const [pendingNgos, setPendingNgos] = useState<NGO[]>([]);
  const [allNgos, setAllNgos] = useState<NGO[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [distributions, setDistributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData?.role === 'app_admin') {
      loadDashboardData();
    }
  }, [userData]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const pNgos = await fetchPendingNGOs();
      setPendingNgos(pNgos);

      // Fetch platform stats
      const { data: ngoData } = await supabase.from('ngos').select('*');
      if (ngoData && ngoData.length > 0) {
        setAllNgos(ngoData);
      } else {
        setAllNgos(ngos);
      }

      const { data: donData } = await supabase.from('donations').select('*').order('created_at', { ascending: false });
      if (donData && donData.length > 0) {
        setDonations(donData);
      } else {
        const localDon = localStorage.getItem('fundhub_local_donations');
        setDonations(localDon ? JSON.parse(localDon) : []);
      }
      
      const { data: distData } = await supabase.from('distributions').select('*').order('created_at', { ascending: false });
      if (distData && distData.length > 0) {
        setDistributions(distData);
      } else {
        const localDist = localStorage.getItem('fundhub_local_distributions');
        setDistributions(localDist ? JSON.parse(localDist) : []);
      }
    } catch (err) {
      console.warn('Dashboard data fallback to local:', err);
      setAllNgos(ngos);
      const localDon = localStorage.getItem('fundhub_local_donations');
      if (localDon) setDonations(JSON.parse(localDon));
      const localDist = localStorage.getItem('fundhub_local_distributions');
      if (localDist) setDistributions(JSON.parse(localDist));
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
      try {
        await updateNGOStatus(id, status);
      } catch {}
      
      // Update local state immediately
      setPendingNgos(prev => prev.filter(n => n.id !== id));
      setAllNgos(prev => prev.map(n => n.id === id ? { ...n, status } : n));

      toast({ title: `NGO ${status}`, description: `The NGO has been successfully ${status}.` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleFlagDonation = async (id: string) => {
    try {
      try {
        await supabase.from('donations').update({ is_flagged: true, flag_reason: 'Admin manually flagged' }).eq('id', id);
      } catch {}
      
      setDonations(prev => prev.map(d => d.id === id ? { ...d, is_flagged: true, flag_reason: 'Admin manually flagged' } : d));
      
      toast({ title: 'Donation Flagged', description: 'The transaction has been marked for review.', variant: 'destructive' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleVerifyProof = async (distId: string, donationId: string) => {
    try {
      try {
        await supabase.from('distributions').update({ status: 'verified' }).eq('id', distId);
        await supabase.from('donations').update({ status: 'verified' }).eq('id', donationId);
      } catch {}
      
      setDistributions(prev => prev.map(d => d.id === distId ? { ...d, status: 'verified' } : d));
      setDonations(prev => prev.map(d => d.id === donationId ? { ...d, status: 'verified' } : d));
      
      const savedDist = localStorage.getItem('fundhub_local_distributions');
      if (savedDist) {
        const parsed = JSON.parse(savedDist).map((d: any) => d.id === distId ? { ...d, status: 'verified' } : d);
        localStorage.setItem('fundhub_local_distributions', JSON.stringify(parsed));
      }

      toast({ title: 'Proof Verified', description: 'Distribution proof has been verified.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  if (!userData || userData.role !== 'app_admin') {
    navigate('/');
    return null;
  }

  // Analytics Calcs
  const totalDonationsAmount = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const activeNgos = allNgos.filter(n => n.status === 'approved').length;
  
  // Fraud Detection: Unusually large donations (> ₹50,000)
  const suspiciousDonations = donations.filter(d => Number(d.amount) > 50000 || d.is_flagged);

  // Group by category for charts
  const categoryStats = allNgos.reduce((acc: any, ngo) => {
    acc[ngo.category] = (acc[ngo.category] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.keys(categoryStats).map(key => ({ name: key, value: categoryStats[key] }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7'];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">FundHub Admin</h1>
            <p className="text-slate-500 mt-1">Platform Management & Security</p>
          </div>
          <Button variant="ghost" onClick={handleLogout}><LogOut className="h-5 w-5 mr-2" /> Logout</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="mb-8 bg-white border border-slate-200 shadow-sm flex flex-wrap h-auto">
            <TabsTrigger value="analytics"><BarChart3 className="w-4 h-4 mr-2"/> Platform Analytics</TabsTrigger>
            <TabsTrigger value="approvals"><Users className="w-4 h-4 mr-2"/> Verification Queue</TabsTrigger>
            <TabsTrigger value="proofs"><CheckCircle className="w-4 h-4 mr-2 text-green-600"/> Proofs</TabsTrigger>
            <TabsTrigger value="fraud"><ShieldAlert className="w-4 h-4 mr-2 text-red-500"/> Fraud & Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-sm border-0 border-t-4 border-blue-500">
                <CardHeader><CardTitle>Total Volume</CardTitle></CardHeader>
                <CardContent><p className="text-4xl font-bold text-slate-800">₹{totalDonationsAmount.toLocaleString('en-IN')}</p></CardContent>
              </Card>
              <Card className="shadow-sm border-0 border-t-4 border-green-500">
                <CardHeader><CardTitle>Total Transactions</CardTitle></CardHeader>
                <CardContent><p className="text-4xl font-bold text-slate-800">{donations.length}</p></CardContent>
              </Card>
              <Card className="shadow-sm border-0 border-t-4 border-purple-500">
                <CardHeader><CardTitle>Active NGOs</CardTitle></CardHeader>
                <CardContent><p className="text-4xl font-bold text-slate-800">{activeNgos}</p></CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-sm">
                <CardHeader><CardTitle>NGOs by Category</CardTitle></CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label>
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="approvals">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">NGO Verification Queue</CardTitle>
                <CardDescription>Review and approve newly registered NGOs.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-500" /></div>
                ) : pendingNgos.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">No NGOs pending approval.</div>
                ) : (
                  <div className="space-y-6">
                    {pendingNgos.map(ngo => (
                      <Card key={ngo.id} className="bg-slate-50 border border-slate-200 shadow-sm">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row justify-between gap-6">
                            <div className="space-y-2">
                              <h3 className="text-xl font-bold text-slate-900">{ngo.name}</h3>
                              <p className="text-sm text-slate-600 max-w-2xl">{ngo.description}</p>
                              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mt-4">
                                <p><strong>Category:</strong> {ngo.category}</p>
                                <p><strong>Reg Number:</strong> {ngo.registration_id}</p>
                                <p><strong>Email:</strong> {ngo.contact_email}</p>
                                <p><strong>Phone:</strong> {ngo.phone_number}</p>
                                <p><strong>Location:</strong> {ngo.city}, {ngo.country}</p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-3 min-w-[200px]">
                              {ngo.verification_document_url && (
                                <Button variant="outline" className="w-full" onClick={() => window.open(ngo.verification_document_url, '_blank')}>
                                  <FileText className="mr-2 h-4 w-4" /> View Document
                                </Button>
                              )}
                              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(ngo.id, 'approved')}>
                                <CheckCircle className="mr-2 h-4 w-4" /> Approve NGO
                              </Button>
                              <Button variant="destructive" className="w-full" onClick={() => handleStatusUpdate(ngo.id, 'rejected')}>
                                <XCircle className="mr-2 h-4 w-4" /> Reject NGO
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="proofs">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">Distribution Proofs</CardTitle>
                <CardDescription>Manually verify proof documents uploaded by NGOs.</CardDescription>
              </CardHeader>
              <CardContent>
                {distributions.filter(d => d.status === 'distributed').length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No pending proofs to verify.</p>
                ) : (
                  <div className="space-y-4">
                    {distributions.filter(d => d.status === 'distributed').map(dist => (
                      <div key={dist.id} className="flex justify-between items-center p-4 border border-slate-200 bg-white rounded-lg shadow-sm">
                        <div>
                          <p className="font-bold text-slate-800">Beneficiary: {dist.beneficiary_name}</p>
                          <p className="text-sm text-slate-600">Amount Spent: ₹{Number(dist.amount_spent).toLocaleString('en-IN')}</p>
                          <p className="text-sm text-slate-500">Notes: {dist.notes}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {dist.proof_image_url && (
                            <Button variant="outline" size="sm" onClick={() => window.open(dist.proof_image_url, '_blank')}>
                              <FileText className="mr-2 h-4 w-4" /> View Proof
                            </Button>
                          )}
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleVerifyProof(dist.id, dist.donation_id)}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Verify
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fraud">
            <Card className="shadow-lg border-red-200">
              <CardHeader className="bg-red-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" /> Suspicious Activity Alerts
                </CardTitle>
                <CardDescription>Automated flags for unusually large donations or failed verifications.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {suspiciousDonations.length === 0 ? (
                  <p className="text-slate-500 py-4 text-center">No suspicious activity detected.</p>
                ) : (
                  <div className="space-y-4">
                    {suspiciousDonations.map(d => (
                      <div key={d.id} className="flex justify-between items-center p-4 border border-red-200 bg-white rounded-lg shadow-sm">
                        <div>
                          <p className="font-bold text-slate-800 text-lg">
                            Amount: ₹{Number(d.amount).toLocaleString('en-IN')} <span className="text-xs text-slate-500 font-normal">({d.currency || 'INR'})</span>
                          </p>
                          <p className="text-sm text-slate-500">Donation ID: {d.id}</p>
                          <p className="text-sm text-red-600 mt-1 font-semibold">
                            Reason: {d.is_flagged ? d.flag_reason : 'Exceeds auto-flag threshold (> ₹50,000)'}
                          </p>
                        </div>
                        {!d.is_flagged && (
                          <Button variant="destructive" onClick={() => handleFlagDonation(d.id)}>
                            Manually Flag & Review
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <h3 className="mt-12 text-lg font-bold text-slate-800 border-b pb-2 mb-4">NGO Management</h3>
                <div className="space-y-4">
                  {allNgos.filter(n => n.status === 'approved').map(ngo => (
                    <div key={ngo.id} className="flex justify-between items-center p-4 border border-slate-200 bg-white rounded-lg">
                      <div>
                        <p className="font-bold text-slate-800">{ngo.name}</p>
                        <p className="text-sm text-slate-500">{ngo.contact_email}</p>
                      </div>
                      <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleStatusUpdate(ngo.id, 'suspended')}>
                        Suspend NGO
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}
