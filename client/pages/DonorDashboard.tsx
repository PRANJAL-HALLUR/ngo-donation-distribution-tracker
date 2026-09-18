import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useDonation, Donation } from '@/context/DonationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Heart, LogOut, Loader2, BarChart3, Search, MapPin, FileText } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';
import { DonationReceipt } from '@/components/DonationReceipt';

export default function DonorDashboard() {
  const navigate = useNavigate();
  const { user, userData, logout } = useAuth();
  const { donations, loading } = useDonation();
  const [selectedDonationForReceipt, setSelectedDonationForReceipt] = useState<Donation | null>(null);

  const totalDonationsAmount = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const activeDonationsCount = donations.filter(d => ['pending_payment', 'allocated'].includes(d.status)).length;
  const completedDonationsCount = donations.filter(d => ['completed', 'distributed', 'verified'].includes(d.status)).length;
  
  // Group by type for pie chart
  const typeStats = donations.reduce((acc: any, don) => {
    acc[don.type || 'Money'] = (acc[don.type || 'Money'] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.keys(typeStats).map(key => ({ name: key, value: typeStats[key] }));
  const COLORS = ['#ec4899', '#f43f5e', '#e11d48', '#be123c', '#8b5cf6'];

  const donationHistory = donations;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">FundHub</h1>
            <p className="text-slate-500 mt-1">Donor Dashboard</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/browse')} className="gap-1.5">
              <Search className="h-4 w-4" /> Browse NGOs
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/maps')} className="gap-1.5">
              <MapPin className="h-4 w-4 text-blue-600" /> Impact Map
            </Button>

            <div className="text-right border-l pl-3 ml-2 border-slate-200">
              <p className="text-sm font-semibold text-slate-900">{userData?.displayName || userData?.email || 'Donor'}</p>
              <p className="text-xs text-slate-500">{userData?.email}</p>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="hover:bg-slate-100 text-slate-500"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Total Donations Card */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-pink-50 to-red-50">
            <CardHeader>
              <CardDescription className="text-base">Total Donated</CardDescription>
              <CardTitle className="text-4xl mt-2">
                {totalDonationsAmount > 0 ? `₹${totalDonationsAmount.toLocaleString('en-IN')}` : '₹0'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mt-2">
                <div className="text-sm text-slate-600 bg-white px-3 py-1 rounded-full shadow-sm">
                  <span className="font-bold text-pink-600">{activeDonationsCount}</span> Active
                </div>
                <div className="text-sm text-slate-600 bg-white px-3 py-1 rounded-full shadow-sm">
                  <span className="font-bold text-green-600">{completedDonationsCount}</span> Completed
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Browse NGOs Card */}
          <Card className="shadow-lg border-0 flex flex-col justify-between">
            <CardHeader>
              <CardTitle>Discover Verified NGOs</CardTitle>
              <CardDescription>Explore causes and track fund allocations in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 shadow-md" onClick={() => navigate('/browse')}>
                <Heart className="mr-2 h-5 w-5" />
                Browse NGOs & Make a Difference
              </Button>
            </CardContent>
          </Card>
        </div>

        {pieData.length > 0 && (
          <div className="mb-12">
            <Card className="shadow-sm border-0">
              <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-pink-600"/> My Impact by Category</CardTitle></CardHeader>
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
        )}

        {/* Donation History */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Donation History</CardTitle>
            <CardDescription>
              {loading ? 'Loading...' : `${donationHistory.length} donation${donationHistory.length !== 1 ? 's' : ''} logged`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : donationHistory.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">No donations yet. Start by supporting a verified cause!</p>
                <Button variant="outline" onClick={() => navigate('/browse')}>Browse NGOs</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {donationHistory.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center shrink-0">
                        <Heart className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Donation #{donation.id.slice(0,8)}</p>
                        <p className="text-sm text-slate-500">
                          {donation.type || 'General'} • {new Date(donation.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 justify-between sm:justify-end">
                      <div className="text-right">
                        <p className="font-bold text-slate-900">
                          ₹{Number(donation.amount).toLocaleString('en-IN')} <span className="text-xs text-slate-500 font-normal">({donation.currency || 'INR'})</span>
                        </p>
                        <Badge variant="outline" className={donation.status === 'completed' || donation.status === 'distributed' || donation.status === 'verified' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                          {donation.status}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedDonationForReceipt(donation)}
                        className="gap-1.5 text-xs font-medium"
                      >
                        <FileText className="h-3.5 w-3.5 text-slate-500" /> Receipt
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fund Allocations Transparency Card */}
        <Card className="shadow-lg border-0 mt-8 bg-blue-50/50 border-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-950">Proof-of-Distribution Assurance</CardTitle>
            <CardDescription className="text-blue-700">
              How FundHub protects your philanthropic contributions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 leading-relaxed">
              Every donation allocated to an NGO requires verifiable cryptographic evidence before funds are disbursed. 
              NGO administrators must submit stamped receipts, geo-tagged photos, or beneficiary confirmation documents 
              which are audited and verified on the blockchain and Supabase edge storage.
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Verified Donation Receipt Dialog */}
      <Dialog open={!!selectedDonationForReceipt} onOpenChange={(open) => !open && setSelectedDonationForReceipt(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-2 sm:p-6">
          {selectedDonationForReceipt && (
            <DonationReceipt
              donation={selectedDonationForReceipt}
              ngoName="Verified Partner NGO"
              donorName={userData?.displayName || userData?.name}
              donorEmail={userData?.email}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
