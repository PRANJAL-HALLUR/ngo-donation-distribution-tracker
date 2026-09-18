import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLocation as useLocationContext } from '@/context/LocationContext';
import { useNGO } from '@/context/NGOContext';
import { useDonation } from '@/context/DonationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogOut, Heart, Search, Loader2, AlertCircle } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function NGOBrowse() {
  const navigate = useNavigate();
  const { user, userData, logout } = useAuth();
  const { location } = useLocationContext();
  const { ngos, loading } = useNGO();
  const { donations, makeDonation } = useDonation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedNGO, setSelectedNGO] = useState<string | null>(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationCurrency, setDonationCurrency] = useState('INR');
  const [donationType, setDonationType] = useState('Money');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDonating, setIsDonating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const donationTypes = ['Money', 'Food', 'Clothes', 'Books', 'Medical Supplies', 'Electronics', 'Household Items', 'Other'];

  if (!user || !userData || userData.role !== 'donor') {
    navigate('/');
    return null;
  }

  const filteredNGOs = useMemo(() => {
    return ngos.filter((ngo) => {
      const matchesSearch = ngo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ngo.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || ngo.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, ngos]);

  const categories = useMemo(() => {
    const cats = new Set(ngos.map((ngo) => ngo.category));
    return Array.from(cats).sort();
  }, [ngos]);

  const selectedNGOData = selectedNGO ? ngos.find((n) => n.id === selectedNGO) : null;
  const donationHistory = donations;

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsDonating(true);

    try {
      if (!selectedNGO) {
        throw new Error('Please select an NGO');
      }

      const amount = parseFloat(donationAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid donation amount');
      }

      await makeDonation(selectedNGO, amount, donationCurrency, donationType);

      setDonationAmount('');
      setDonationCurrency('INR');
      setSelectedNGO(null);
      setIsDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to make donation');
    } finally {
      setIsDonating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">FundHub</h1>
            <p className="text-slate-500 mt-1">Browse & Donate to NGOs</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/donor')} className="gap-1.5">
              My Impact
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/maps')} className="gap-1.5">
              Impact Map
            </Button>

            <div className="text-right border-l pl-3 ml-1 border-slate-200">
              <p className="text-sm font-semibold text-slate-900">{userData?.displayName || userData?.email || 'Donor'}</p>
              <p className="text-xs text-slate-500">{userData?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="hover:bg-slate-100"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Current Location Display */}
        {location && (
          <Card className="shadow-lg border-0 mb-8 bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">📍</div>
                <div>
                  <p className="text-sm text-slate-600">Your Current Location</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {location.city || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
                    {location.country && `, ${location.country}`}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    All your donations will be recorded from this location
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Donor Summary */}
        <Card className="shadow-lg border-0 mb-8 bg-gradient-to-r from-pink-50 to-red-50">
          <CardHeader>
            <CardTitle>Your Donation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-2">Total Donated</p>
                <p className="text-3xl font-bold text-slate-900">
                  ₹{donationHistory.reduce((sum, d) => sum + (Number(d.amount) || 0), 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Donations Made</p>
                <p className="text-3xl font-bold text-slate-900">{donationHistory.length}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">NGOs Supported</p>
                <p className="text-3xl font-bold text-slate-900">
                  {new Set(donationHistory.map((d) => d.ngo_id)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search NGOs by name or mission..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              size="sm"
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* NGO Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : filteredNGOs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-500">No NGOs found matching your search</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNGOs.map((ngo) => {
              const ngoTotalDonated = donationHistory
                .filter((d) => d.ngo_id === ngo.id)
                .reduce((sum, d) => sum + d.amount, 0);

              return (
                <Card key={ngo.id} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle>{ngo.name}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-2">
                      {ngo.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <p className="text-slate-700">
                        <span className="font-semibold">Location:</span> {ngo.city}, {ngo.state}
                      </p>
                      <p className="text-slate-600">
                        <span className="font-semibold">Contact:</span> {ngo.contact_email}
                      </p>
                    </div>

                    {ngoTotalDonated > 0 && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-900">
                          You've donated ₹{ngoTotalDonated.toLocaleString('en-IN')} to this NGO
                        </p>
                      </div>
                    )}

                    <Dialog open={isDialogOpen && selectedNGO === ngo.id} onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (!open) {
                        setSelectedNGO(null);
                        setError(null);
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
                          onClick={() => setSelectedNGO(ngo.id)}
                        >
                          <Heart className="mr-2 h-4 w-4" />
                          Donate Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Donate to {selectedNGOData?.name}</DialogTitle>
                          <DialogDescription>
                            Your donation directly supports this NGO's mission.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleDonate} className="space-y-6">
                          {error && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>{error}</AlertDescription>
                            </Alert>
                          )}

                          <div className="space-y-2">
                            <Label htmlFor="amount">Donation Amount (₹ INR)</Label>
                            <div className="flex gap-2 flex-wrap mb-2">
                              {[250, 500, 1000, 2500, 5000].map((preset) => (
                                <Button
                                  key={preset}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDonationAmount(preset.toString())}
                                  className={donationAmount === preset.toString() ? 'border-blue-600 text-blue-600 bg-blue-50' : ''}
                                >
                                  ₹{preset}
                                </Button>
                              ))}
                            </div>
                            <Input
                              id="amount"
                              type="number"
                              placeholder="Enter amount (e.g. 500)"
                              value={donationAmount}
                              onChange={(e) => setDonationAmount(e.target.value)}
                              step="1"
                              min="1"
                              disabled={isDonating}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="currency">Currency</Label>
                            <Select value={donationCurrency} onValueChange={setDonationCurrency}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="INR">INR (₹) - Indian Rupee</SelectItem>
                                <SelectItem value="USD">USD ($)</SelectItem>
                                <SelectItem value="EUR">EUR (€)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="type">Donation Type</Label>
                            <Select value={donationType} onValueChange={setDonationType}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {donationTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <Button
                            type="submit"
                            className="w-full"
                            disabled={isDonating}
                          >
                            {isDonating ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              'Confirm Donation'
                            )}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Recent Donations */}
        {donationHistory.length > 0 && (
          <Card className="shadow-lg border-0 mt-12">
            <CardHeader>
              <CardTitle>Your Recent Donations</CardTitle>
              <CardDescription>{donationHistory.length} donation{donationHistory.length !== 1 ? 's' : ''}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {donationHistory.slice(0, 5).map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center">
                        <Heart className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Donation #{donation.id.slice(0,6)}</p>
                        <p className="text-sm text-slate-500">
                          {new Date(donation.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          Type: <span className="font-semibold">{donation.type}</span>
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          Status: <Badge variant="outline">{donation.status}</Badge>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">
                        {donation.amount} {donation.currency}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
