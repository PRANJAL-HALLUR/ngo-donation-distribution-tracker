import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNGO } from '@/context/NGOContext';
import { useDonation, Donation } from '@/context/DonationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogOut, Loader2, Clock, UploadCloud, CheckCircle2, PackageOpen, BarChart3 } from 'lucide-react';
import { Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import NGOOnboarding from './NGOOnboarding';

export default function NGODashboard() {
  const navigate = useNavigate();
  const { user, userData, logout } = useAuth();
  const { currentNgo, loading: ngoLoading } = useNGO();
  const { donations, distributions, logDistribution, loading: donationLoading } = useDonation();

  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [beneficiary, setBeneficiary] = useState('');
  const [amountSpent, setAmountSpent] = useState('');
  const [notes, setNotes] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isDistributing, setIsDistributing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!user || !userData || userData.role !== 'ngo_admin') {
    navigate('/');
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleDistribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonation || !proofFile) return;

    setError(null);
    setIsDistributing(true);

    try {
      await logDistribution(
        selectedDonation.id,
        beneficiary,
        parseFloat(amountSpent),
        notes,
        proofFile
      );
      setBeneficiary('');
      setAmountSpent('');
      setNotes('');
      setProofFile(null);
      setIsDialogOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to log distribution');
    } finally {
      setIsDistributing(false);
    }
  };

  if (ngoLoading || donationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (!currentNgo || currentNgo.status === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4 flex justify-end mb-4">
          <Button variant="outline" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4"/> Logout</Button>
        </div>
        <NGOOnboarding />
      </div>
    );
  }

  if (currentNgo.status === 'pending') {
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
              We will notify you at {currentNgo.contact_email} once your account is approved.
            </p>
            <Button onClick={handleLogout} variant="outline" className="w-full">Logout</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentNgo.status === 'rejected' || currentNgo.status === 'suspended') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl text-center border-red-200">
          <CardHeader>
            <CardTitle className="text-2xl text-red-600">Account {currentNgo.status}</CardTitle>
            <CardDescription className="mt-2">
              Your NGO account has been {currentNgo.status}. Please contact support.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleLogout} className="w-full" variant="outline">Logout</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedDonations = donations.filter(d => d.status === 'completed');
  const distributedDonations = donations.filter(d => d.status === 'distributed' || d.status === 'verified');

  // Analytics Stats
  const totalReceived = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const totalDistributedAmt = distributions.reduce((sum, d) => sum + (Number(d.amount_spent) || 0), 0);

  // Group by category for charts
  const typeStats = donations.reduce((acc: any, don) => {
    acc[don.type] = (acc[don.type] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.keys(typeStats).map(key => ({ name: key, value: typeStats[key] }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ef4444'];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">FundHub NGO</h1>
            <p className="text-slate-500 mt-1">Dashboard - {currentNgo.name}</p>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="h-5 w-5 mr-2" /> Logout
          </Button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-12 space-y-8">

        {/* Analytics Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm border-0 border-t-4 border-blue-500">
            <CardHeader><CardTitle>Total Received</CardTitle></CardHeader>
            <CardContent><p className="text-4xl font-bold text-slate-800">₹{totalReceived.toLocaleString('en-IN')}</p></CardContent>
          </Card>
          <Card className="shadow-sm border-0 border-t-4 border-green-500">
            <CardHeader><CardTitle>Total Distributed</CardTitle></CardHeader>
            <CardContent><p className="text-4xl font-bold text-slate-800">₹{totalDistributedAmt.toLocaleString('en-IN')}</p></CardContent>
          </Card>
          <Card className="shadow-sm border-0 border-t-4 border-orange-500">
            <CardHeader><CardTitle>Pending Distributions</CardTitle></CardHeader>
            <CardContent><p className="text-4xl font-bold text-slate-800">{completedDonations.length}</p></CardContent>
          </Card>
        </div>

        {/* Donation Types Chart */}
        {pieData.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5"/> Donation Categories Received</CardTitle></CardHeader>
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
        )}
        
        {/* Available Donations */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackageOpen className="h-5 w-5 text-blue-600" />
              Available Donations for Distribution
            </CardTitle>
            <CardDescription>Donations that have been completed by donors and are ready to be distributed.</CardDescription>
          </CardHeader>
          <CardContent>
            {completedDonations.length === 0 ? (
              <p className="text-slate-500 py-4 text-center">No pending donations available.</p>
            ) : (
              <div className="space-y-4">
                {completedDonations.map(donation => (
                  <div key={donation.id} className="flex flex-col md:flex-row justify-between items-center p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div>
                      <p className="font-bold text-slate-800">
                        ₹{Number(donation.amount).toLocaleString('en-IN')} <span className="text-xs text-slate-500">({donation.currency || 'INR'})</span> <Badge variant="secondary" className="ml-2">{donation.type}</Badge>
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        Donation #{donation.id.slice(0, 8)} • Received {new Date(donation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <Dialog open={isDialogOpen && selectedDonation?.id === donation.id} onOpenChange={(open) => {
                      if (open) { setSelectedDonation(donation); setIsDialogOpen(true); }
                      else { setIsDialogOpen(false); }
                    }}>
                      <DialogTrigger asChild>
                        <Button className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700">Distribute & Upload Proof</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Log Distribution</DialogTitle>
                          <DialogDescription>
                            Upload proof of distribution for Donation #{donation.id.slice(0, 8)}
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleDistribute} className="space-y-4 mt-4">
                          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                          
                          <div className="space-y-2">
                            <Label>Beneficiary Name / Group</Label>
                            <Input value={beneficiary} onChange={e => setBeneficiary(e.target.value)} required placeholder="e.g., Local Orphanage" />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Amount / Items Spent (₹ INR)</Label>
                            <Input type="number" step="1" value={amountSpent} onChange={e => setAmountSpent(e.target.value)} required placeholder={`Max: ₹${donation.amount}`} max={donation.amount} />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Description / Notes</Label>
                            <Textarea value={notes} onChange={e => setNotes(e.target.value)} required placeholder="Describe how the donation was used..." />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Upload Proof (Image/PDF)</Label>
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50">
                              <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                              <Input type="file" accept=".pdf,image/*" onChange={e => setProofFile(e.target.files?.[0] || null)} className="w-full max-w-xs cursor-pointer" required />
                              {proofFile && <p className="text-sm text-green-600 mt-2">Selected: {proofFile.name}</p>}
                            </div>
                          </div>

                          <Button type="submit" className="w-full mt-4" disabled={isDistributing}>
                            {isDistributing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : 'Confirm Distribution'}
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

        {/* Distributed History */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Distribution History & Proofs
            </CardTitle>
            <CardDescription>Past distributions and uploaded verifications.</CardDescription>
          </CardHeader>
          <CardContent>
            {distributions.length === 0 ? (
              <p className="text-slate-500 py-4 text-center">No distributions logged yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {distributions.map(dist => (
                  <Card key={dist.id} className="bg-slate-50 border-slate-200">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-slate-900">{dist.beneficiary_name}</p>
                          <p className="text-sm text-slate-500">Amount Spent: ₹{Number(dist.amount_spent).toLocaleString('en-IN')}</p>
                        </div>
                        <Badge variant="outline" className={dist.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-slate-200'}>
                          {dist.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-700">{dist.notes}</p>
                      {dist.proof_image_url && (
                        <a href={dist.proof_image_url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> View Proof Document
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
