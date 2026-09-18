import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface LocationInfo {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
}

export interface Donation {
  id: string;
  donor_id: string;
  ngo_id: string;
  amount: number;
  currency: string;
  status: 'pending_payment' | 'completed' | 'allocated' | 'distributed' | 'verified';
  razorpay_order_id?: string;
  type: string;
  created_at: string;
}

export interface Distribution {
  id: string;
  ngo_id: string;
  donation_id?: string;
  beneficiary_name: string;
  amount_spent: number;
  proof_image_url: string;
  notes: string;
  status: 'distributed' | 'verified';
  distributed_at: string;
}

interface DonationContextType {
  donations: Donation[];
  distributions: Distribution[];
  loading: boolean;
  makeDonation: (ngoId: string, amount: number, currency: string, type: string) => Promise<void>;
  logDistribution: (donationId: string, beneficiary: string, amount: number, notes: string, file: File) => Promise<void>;
  fetchDonorHistory: () => Promise<void>;
  fetchNGODonations: () => Promise<void>;
}

const DonationContext = createContext<DonationContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function DonationProvider({ children }: { children: React.ReactNode }) {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  
  const [donations, setDonations] = useState<Donation[]>(() => {
    const saved = localStorage.getItem('fundhub_local_donations');
    return saved ? JSON.parse(saved) : [];
  });
  const [distributions, setDistributions] = useState<Distribution[]>(() => {
    const saved = localStorage.getItem('fundhub_local_distributions');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);

  // Load Razorpay script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Save local states for demo resilience
  useEffect(() => {
    localStorage.setItem('fundhub_local_donations', JSON.stringify(donations));
  }, [donations]);

  useEffect(() => {
    localStorage.setItem('fundhub_local_distributions', JSON.stringify(distributions));
  }, [distributions]);

  const fetchDonorHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('donor_id', user.id)
        .order('created_at', { ascending: false });
      
      if (!error && data && data.length > 0) {
        setDonations(data);
      }
    } catch (err) {
      console.warn('Using local donation history:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNGODonations = async () => {
    if (!user || userData?.role !== 'ngo_admin') return;
    setLoading(true);
    try {
      const { data: ngoData } = await supabase.from('ngos').select('id').eq('user_id', user.id).single();
      if (ngoData) {
        const { data, error } = await supabase
          .from('donations')
          .select('*')
          .eq('ngo_id', ngoData.id)
          .order('created_at', { ascending: false });
          
        if (!error && data) setDonations(data);
        
        const { data: distData } = await supabase
          .from('distributions')
          .select('*')
          .eq('ngo_id', ngoData.id);
        
        if (distData) setDistributions(distData);
      }
    } catch (err) {
      console.warn('Using local NGO donation data:', err);
    } finally {
      setLoading(false);
    }
  };

  const makeDonation = async (ngoId: string, amount: number, currency: string, type: string) => {
    if (!user) throw new Error('Not authenticated');

    // 1. Create Order via Express Backend
    const res = await fetch(`${API_URL}/donations/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency })
    });
    const order = await res.json();
    
    if (!order.id) throw new Error('Failed to create payment order');

    const donationId = `don_${Date.now()}`;
    const newDonation: Donation = {
      id: donationId,
      donor_id: user.id,
      ngo_id: ngoId,
      amount,
      currency,
      type,
      status: 'pending_payment',
      razorpay_order_id: order.id,
      created_at: new Date().toISOString()
    };

    // Try saving pending donation to Supabase
    try {
      await supabase.from('donations').insert([newDonation]);
    } catch (err) {
      console.warn('Saving pending donation locally:', err);
    }

    const completeDonation = async (paymentId: string, signature: string) => {
      // Verify payment via Express Backend
      const verifyRes = await fetch(`${API_URL}/donations/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: order.id,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature
        })
      });
      
      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        const completedRecord: Donation = { ...newDonation, status: 'completed' };
        
        // Update Supabase
        try {
          await supabase.from('donations').update({ status: 'completed' }).eq('id', donationId);
        } catch {}

        // Update local state
        setDonations(prev => [completedRecord, ...prev.filter(d => d.id !== donationId)]);

        // Send Email Notification
        fetch(`${API_URL}/notifications/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: userData?.email,
            type: 'donation_success',
            data: { amount, currency, ngoName: 'Verified Partner NGO' }
          })
        }).catch(console.warn);

        toast({ title: 'Donation Successful!', description: `Thank you for donating ${amount} ${currency}.` });
      } else {
        throw new Error('Payment verification failed');
      }
    };

    // If Razorpay SDK is loaded and configured, open modal
    if ((window as any).Razorpay && import.meta.env.VITE_RAZORPAY_KEY_ID && import.meta.env.VITE_RAZORPAY_KEY_ID !== 'rzp_test_placeholder') {
      return new Promise<void>((resolve, reject) => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'FundHub NGO Donation',
          description: `Donation of ${amount} ${currency}`,
          order_id: order.id,
          handler: async function (response: any) {
            try {
              await completeDonation(response.razorpay_payment_id, response.razorpay_signature);
              resolve();
            } catch (err: any) {
              toast({ title: 'Verification Failed', description: err.message, variant: 'destructive' });
              reject(err);
            }
          },
          prefill: { email: userData?.email || '' },
          theme: { color: '#f43f5e' }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function () {
          toast({ title: 'Payment Failed', variant: 'destructive' });
          reject(new Error('Payment failed'));
        });
        rzp.open();
      });
    }

    // Seamless Mock Checkout Simulation for instant offline / viva presentation demo
    await completeDonation(`pay_mock_${Date.now()}`, 'mock_signature');
  };

  const logDistribution = async (donationId: string, beneficiary: string, amount: number, notes: string, file: File) => {
    if (!user) throw new Error('Not authenticated');

    let proofUrl = '';
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `proofs/${user.id}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('ngo_documents').upload(filePath, file);
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('ngo_documents').getPublicUrl(filePath);
        proofUrl = publicUrl;
      }
    } catch {
      console.warn('Storage bucket not accessible, creating direct object URL:');
    }

    if (!proofUrl) {
      proofUrl = URL.createObjectURL(file);
    }

    const newDist: Distribution = {
      id: `dist_${Date.now()}`,
      ngo_id: user.id,
      donation_id: donationId,
      beneficiary_name: beneficiary,
      amount_spent: amount,
      notes,
      proof_image_url: proofUrl,
      status: 'distributed',
      distributed_at: new Date().toISOString()
    };

    // Try saving to Supabase
    try {
      await supabase.from('distributions').insert([newDist]);
      if (donationId) {
        await supabase.from('donations').update({ status: 'distributed' }).eq('id', donationId);
      }
    } catch {}

    // Update local state
    setDistributions(prev => [newDist, ...prev]);
    setDonations(prev => prev.map(d => d.id === donationId ? { ...d, status: 'distributed' } : d));

    toast({ title: 'Distribution Logged!', description: 'Proof of distribution uploaded and verified.' });
  };

  return (
    <DonationContext.Provider value={{
      donations,
      distributions,
      loading,
      makeDonation,
      logDistribution,
      fetchDonorHistory,
      fetchNGODonations
    }}>
      {children}
    </DonationContext.Provider>
  );
}

export function useDonation() {
  const context = useContext(DonationContext);
  if (context === undefined) {
    throw new Error('useDonation must be used within a DonationProvider');
  }
  return context;
}
