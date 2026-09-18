import React, { useState } from 'react';
import { useNGO } from '@/context/NGOContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UploadCloud, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  'Education',
  'Healthcare',
  'Environment',
  'Food & Nutrition',
  'Water & Sanitation',
  'Social Development'
];

export default function NGOOnboarding() {
  const { submitOnboarding } = useNGO();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    registration_id: '',
    contact_email: '',
    phone_number: '',
    category: '',
    address: '',
    city: '',
    state: '',
    country: ''
  });
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleCategoryChange = (val: string) => {
    setFormData(prev => ({ ...prev, category: val }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload a verification document.');
      return;
    }
    if (!formData.category) {
      setError('Please select a category.');
      return;
    }
    
    setError(null);
    setLoading(true);
    try {
      await submitOnboarding(formData, file);
      // Let the parent component handle the state change
    } catch (err: any) {
      setError(err.message || 'Failed to submit onboarding details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto mt-8 shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl">Complete NGO Profile</CardTitle>
        <CardDescription>
          Please provide your organization's details to undergo verification. Donors will only see your profile after admin approval.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">NGO Name</Label>
              <Input id="name" value={formData.name} onChange={handleChange} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="registration_id">Registration Number</Label>
              <Input id="registration_id" value={formData.registration_id} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email">Public Contact Email</Label>
              <Input id="contact_email" type="email" value={formData.contact_email} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input id="phone_number" value={formData.phone_number} onChange={handleChange} required />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="category">NGO Category</Label>
              <Select value={formData.category} onValueChange={handleCategoryChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Mission & Description</Label>
              <Textarea id="description" rows={4} value={formData.description} onChange={handleChange} required />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Headquarters Address</Label>
              <Input id="address" value={formData.address} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={formData.city} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State / Province</Label>
              <Input id="state" value={formData.state} onChange={handleChange} required />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={formData.country} onChange={handleChange} required />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="document">Verification Document (PDF, JPG, PNG)</Label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50">
                <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                <Input 
                  id="document" 
                  type="file" 
                  accept=".pdf,image/*" 
                  onChange={handleFileChange} 
                  className="w-full max-w-xs cursor-pointer" 
                  required 
                />
                {file && <p className="text-sm text-green-600 mt-2">Selected: {file.name}</p>}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
            ) : 'Submit for Verification'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
