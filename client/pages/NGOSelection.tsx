import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNGO } from '@/context/NGOContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, Plus, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function NGOSelection() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { ngos } = useNGO();

  const [step, setStep] = useState<'choose' | 'create'>('choose');
  const [ngoName, setNgoName] = useState('');
  const [ngoMission, setNgoMission] = useState('');
  const [ngoCategory, setNgoCategory] = useState('Other');
  const [ngoDescription, setNgoDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (role !== 'ngo_admin') {
    navigate('/');
    return null;
  }

  const handleSelectNGO = (ngoId: string) => {
    localStorage.setItem('selected_ngo_id', ngoId);
    navigate('/auth');
  };

  const handleCreateNGO = async () => {
    setError(null);
    setIsCreating(true);

    try {
      if (!ngoName.trim()) {
        throw new Error('Please enter NGO name');
      }
      if (!ngoMission.trim()) {
        throw new Error('Please enter NGO mission');
      }
      if (!ngoDescription.trim()) {
        throw new Error('Please enter NGO description');
      }

      const newNGO = {
        id: `ngo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: ngoName,
        description: ngoDescription,
        mission: ngoMission,
        image: '🏢',
        adminId: '',
        adminEmail: '',
        adminName: '',
        totalFundsReceived: 0,
        totalFundsAllocated: 0,
        category: ngoCategory,
        website: '',
        contact: '',
      };

      const ngoData = localStorage.getItem('fundhub_ngos');
      const ngosList = ngoData ? JSON.parse(ngoData) : [];
      ngosList.push(newNGO);
      localStorage.setItem('fundhub_ngos', JSON.stringify(ngosList));
      localStorage.setItem('selected_ngo_id', newNGO.id);
      navigate('/auth');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create NGO');
    } finally {
      setIsCreating(false);
    }
  };

  const categories = ['Education', 'Healthcare', 'Environment', 'Water & Sanitation', 'Social Development', 'Food & Nutrition', 'Other'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="h-8 w-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Select Your NGO</h1>
          </div>
          <p className="text-xl text-slate-300">
            Choose an existing NGO to manage or create a new one
          </p>
        </div>

        {step === 'choose' ? (
          <>
            {/* Existing NGOs */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">Join an Existing NGO</h2>
              {ngos.length === 0 ? (
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="py-12 text-center">
                    <p className="text-slate-400">No NGOs available yet. Create a new one to get started.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {ngos.map((ngo) => (
                    <Card
                      key={ngo.id}
                      className="bg-slate-800 border-slate-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all cursor-pointer"
                      onClick={() => handleSelectNGO(ngo.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-white flex items-center gap-2">
                              <span className="text-2xl">{ngo.image || '🏢'}</span>
                              {ngo.name}
                            </CardTitle>
                            <CardDescription className="text-slate-400 mt-2">
                              {ngo.category}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-slate-300">{ngo.description}</p>
                        <p className="text-xs text-slate-500">
                          <span className="font-semibold">Mission:</span> {ngo.mission || ngo.description}
                        </p>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          Select This NGO
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Create New NGO */}
            <div className="text-center">
              <p className="text-slate-400 mb-4">Don't see your NGO?</p>
              <Button
                size="lg"
                onClick={() => setStep('create')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create a New NGO
              </Button>
            </div>

            {/* Back to Role Selection */}
            <div className="mt-8 text-center">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Role Selection
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Create NGO Form */}
            <Card className="bg-slate-800 border-slate-700 mb-8">
              <CardHeader>
                <CardTitle className="text-white">Create Your NGO</CardTitle>
                <CardDescription>
                  Set up your organization to start receiving donations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="ngo-name" className="text-slate-200">NGO Name</Label>
                  <Input
                    id="ngo-name"
                    placeholder="e.g., Global Education Foundation"
                    value={ngoName}
                    onChange={(e) => setNgoName(e.target.value)}
                    disabled={isCreating}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ngo-mission" className="text-slate-200">Mission Statement</Label>
                  <Input
                    id="ngo-mission"
                    placeholder="e.g., Empower children through quality education"
                    value={ngoMission}
                    onChange={(e) => setNgoMission(e.target.value)}
                    disabled={isCreating}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ngo-category" className="text-slate-200">Category</Label>
                  <select
                    id="ngo-category"
                    value={ngoCategory}
                    onChange={(e) => setNgoCategory(e.target.value)}
                    disabled={isCreating}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:border-blue-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ngo-description" className="text-slate-200">Description</Label>
                  <textarea
                    id="ngo-description"
                    placeholder="Tell us about your organization and what you do..."
                    value={ngoDescription}
                    onChange={(e) => setNgoDescription(e.target.value)}
                    disabled={isCreating}
                    rows={4}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep('choose')}
                    disabled={isCreating}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCreateNGO}
                    disabled={isCreating}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create NGO'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
