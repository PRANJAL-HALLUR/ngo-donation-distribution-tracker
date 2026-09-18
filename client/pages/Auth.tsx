import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type UserRole } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LocationPermissionDialog } from '@/components/LocationPermissionDialog';
import {
  Heart,
  Building2,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Lock,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { requestLocationPermission, loading: locationLoading, error: locationError } = useLocation();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [signupRole, setSignupRole] = useState<'donor' | 'ngo_admin'>('donor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLocationDialog, setShowLocationDialog] = useState(false);

  // Common Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // NGO Specific Fields
  const [ngoName, setNgoName] = useState('');
  const [ngoCategory, setNgoCategory] = useState('Healthcare');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      // Automatically route according to user role
      if (user.role === 'app_admin') {
        navigate('/dashboard');
      } else if (user.role === 'ngo_admin') {
        navigate('/dashboard');
      } else {
        setShowLocationDialog(true);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await register(
        email,
        password,
        name,
        signupRole,
        signupRole === 'ngo_admin' ? { ngoName, ngoCategory } : undefined
      );

      if (user.role === 'ngo_admin') {
        navigate('/dashboard');
      } else {
        setShowLocationDialog(true);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationGranted = async () => {
    try {
      await requestLocationPermission();
    } catch (err) {
      console.warn('Location permission note:', err);
    } finally {
      navigate('/dashboard');
    }
  };

  const handleLocationDenied = () => {
    setShowLocationDialog(false);
    navigate('/dashboard');
  };

  const quickFill = (demoEmail: string, demoPass: string = 'Password123!') => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100">
      {/* Brand Header */}
      <div className="text-center mb-8 max-w-md">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-400 mb-4 shadow-lg shadow-blue-500/10">
          <Sparkles className="h-7 w-7 text-blue-400" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          FundHub
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Transparent NGO Donation & Geotagged Distribution Platform
        </p>
      </div>

      {/* Main Authentication Card */}
      <Card className="w-full max-w-lg bg-slate-900/90 border-slate-800 shadow-2xl backdrop-blur rounded-2xl overflow-hidden">
        <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val as any); setError(null); }} className="w-full">
          <TabsList className="grid grid-cols-2 bg-slate-800/80 p-1 rounded-t-2xl border-b border-slate-800 h-12">
            <TabsTrigger
              value="signin"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 font-semibold"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 font-semibold"
            >
              Create Account
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: SIGN IN (Unified for Donor, NGO Admin, App Admin) */}
          <TabsContent value="signin" className="p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
              <CardDescription className="text-slate-400 text-sm">
                Enter your credentials. You will be automatically directed to your role's dashboard.
              </CardDescription>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-950/40 border-red-500/50 text-red-300">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email" className="text-slate-300 text-xs font-semibold uppercase">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-950/70 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password" className="text-slate-300 text-xs font-semibold uppercase">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-slate-950/70 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold h-11 shadow-lg shadow-blue-600/30 transition mt-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...
                  </>
                ) : (
                  <>
                    Sign In to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Quick Demo Access Pills */}
            <div className="pt-4 border-t border-slate-800/80">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
                Quick 1-Click Demo Logins
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => quickFill('admin@fundhub.com')}
                  className="p-2 rounded-lg bg-slate-800/60 border border-slate-700 hover:border-purple-500/50 hover:bg-slate-800 text-purple-300 transition text-center"
                >
                  <ShieldCheck className="h-3.5 w-3.5 mx-auto mb-1 text-purple-400" />
                  <span className="font-semibold block">App Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => quickFill('ngo@careandhope.org')}
                  className="p-2 rounded-lg bg-slate-800/60 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800 text-blue-300 transition text-center"
                >
                  <Building2 className="h-3.5 w-3.5 mx-auto mb-1 text-blue-400" />
                  <span className="font-semibold block">NGO Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => quickFill('donor@example.com')}
                  className="p-2 rounded-lg bg-slate-800/60 border border-slate-700 hover:border-pink-500/50 hover:bg-slate-800 text-pink-300 transition text-center"
                >
                  <Heart className="h-3.5 w-3.5 mx-auto mb-1 text-pink-400" />
                  <span className="font-semibold block">Donor</span>
                </button>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: CREATE ACCOUNT (Only for Donor and NGO; Admin is single/pre-existing) */}
          <TabsContent value="signup" className="p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold text-white">Create Account</CardTitle>
              <CardDescription className="text-slate-400 text-sm">
                Select your account category to register on FundHub.
              </CardDescription>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-950/40 border-red-500/50 text-red-300">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Account Category Selector (Donor vs NGO Admin) */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setSignupRole('donor')}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col items-center text-center ${
                  signupRole === 'donor'
                    ? 'bg-blue-600/10 border-blue-500 text-white shadow-md shadow-blue-500/10'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                <div className={`p-2 rounded-lg mb-2 ${signupRole === 'donor' ? 'bg-pink-500/20 text-pink-400' : 'bg-slate-700/50 text-slate-400'}`}>
                  <Heart className="h-5 w-5" />
                </div>
                <span className="font-bold text-sm">Donor</span>
                <span className="text-[11px] text-slate-400 mt-0.5">Donate & track aid</span>
              </div>

              <div
                onClick={() => setSignupRole('ngo_admin')}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col items-center text-center ${
                  signupRole === 'ngo_admin'
                    ? 'bg-blue-600/10 border-blue-500 text-white shadow-md shadow-blue-500/10'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                <div className={`p-2 rounded-lg mb-2 ${signupRole === 'ngo_admin' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700/50 text-slate-400'}`}>
                  <Building2 className="h-5 w-5" />
                </div>
                <span className="font-bold text-sm">NGO Admin</span>
                <span className="text-[11px] text-slate-400 mt-0.5">Raise & distribute aid</span>
              </div>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-slate-300 text-xs font-semibold uppercase">
                  {signupRole === 'ngo_admin' ? 'Representative Name' : 'Full Name'}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder={signupRole === 'ngo_admin' ? 'Authorized Director / Officer' : 'Jane Doe'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-slate-950/70 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {signupRole === 'ngo_admin' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="ngo-name" className="text-slate-300 text-xs font-semibold uppercase">
                      NGO / Organization Name
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        id="ngo-name"
                        type="text"
                        placeholder="e.g. Care & Hope Foundation"
                        value={ngoName}
                        onChange={(e) => setNgoName(e.target.value)}
                        className="pl-10 bg-slate-950/70 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ngo-cat" className="text-slate-300 text-xs font-semibold uppercase">
                      Primary Cause Category
                    </Label>
                    <select
                      id="ngo-cat"
                      value={ngoCategory}
                      onChange={(e) => setNgoCategory(e.target.value)}
                      className="w-full h-10 px-3 rounded-md bg-slate-950/70 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    >
                      <option value="Healthcare">Healthcare & Medicine</option>
                      <option value="Education">Education & Literacy</option>
                      <option value="Disaster Relief">Disaster & Emergency Relief</option>
                      <option value="Food & Hunger">Food & Hunger Alleviation</option>
                      <option value="Environment">Environment & Clean Water</option>
                    </select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-slate-300 text-xs font-semibold uppercase">
                  Official Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder={signupRole === 'ngo_admin' ? 'info@organization.org' : 'donor@example.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-950/70 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-slate-300 text-xs font-semibold uppercase">
                  Create Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-slate-950/70 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold h-11 shadow-lg shadow-blue-600/30 transition mt-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
                  </>
                ) : (
                  <>
                    Register as {signupRole === 'donor' ? 'Donor' : 'NGO'} <CheckCircle2 className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Geolocation Telemetry Prompt */}
      <LocationPermissionDialog
        open={showLocationDialog}
        onGranted={handleLocationGranted}
        onDenied={handleLocationDenied}
        isLoading={locationLoading}
        error={locationError}
      />
    </div>
  );
}
