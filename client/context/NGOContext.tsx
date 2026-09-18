import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface NGO {
  id: string;
  user_id: string;
  name: string;
  description: string;
  registration_id: string;
  contact_email: string;
  phone_number: string;
  category: string;
  address: string;
  city: string;
  state: string;
  country: string;
  verification_document_url: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  total_received: number;
  image?: string;
  mission?: string;
}

interface NGOContextType {
  ngos: NGO[];
  loading: boolean;
  fetchApprovedNGOs: () => Promise<void>;
  fetchPendingNGOs: () => Promise<NGO[]>;
  updateNGOStatus: (id: string, status: NGO['status']) => Promise<void>;
  submitOnboarding: (ngoData: Partial<NGO>, file: File) => Promise<void>;
  currentNgo: NGO | null;
  refreshCurrentNgo: () => Promise<void>;
}

const SEED_NGOS: NGO[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    user_id: 'seed-1',
    name: 'Care & Hope Foundation',
    description: 'Providing nutritional meals, healthcare kits, and shelter support to underprivileged children and families across urban communities.',
    mission: 'Eliminating hunger and empowering the next generation through health and education.',
    registration_id: 'REG-100234',
    contact_email: 'contact@careandhope.org',
    phone_number: '+91 9876543210',
    category: 'Food & Healthcare',
    address: '12 Marine Drive',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    verification_document_url: '',
    status: 'approved',
    total_received: 4250,
    image: '🍲'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    user_id: 'seed-2',
    name: 'BrightFuture Literacy Initiative',
    description: 'Distributing textbooks, setting up solar-powered computer labs, and sponsoring tuition for rural primary schools.',
    mission: 'Bridging the digital and educational divide for rural children.',
    registration_id: 'REG-200543',
    contact_email: 'info@brightfuture.org',
    phone_number: '+91 9876543211',
    category: 'Education',
    address: '45 Tech Park',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    verification_document_url: '',
    status: 'approved',
    total_received: 7800,
    image: '📚'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    user_id: 'seed-3',
    name: 'GreenEarth Disaster Relief',
    description: 'Rapid response units providing clean drinking water filtration systems, emergency blankets, and medical aid during emergencies.',
    mission: 'Delivering swift, verified humanitarian relief where disaster strikes.',
    registration_id: 'REG-300876',
    contact_email: 'relief@greenearth.org',
    phone_number: '+91 9876543212',
    category: 'Disaster Relief',
    address: '8 Coastal Way',
    city: 'Kochi',
    state: 'Kerala',
    country: 'India',
    verification_document_url: '',
    status: 'approved',
    total_received: 12400,
    image: '🌍'
  }
];

const NGOContext = createContext<NGOContextType | undefined>(undefined);

export function NGOProvider({ children }: { children: React.ReactNode }) {
  const { user, userData } = useAuth();
  const [ngos, setNgos] = useState<NGO[]>(SEED_NGOS);
  const [currentNgo, setCurrentNgo] = useState<NGO | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchApprovedNGOs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ngos')
        .select('*')
        .eq('status', 'approved');
      if (error) throw error;
      if (data && data.length > 0) {
        setNgos(data);
      }
    } catch (err) {
      console.warn('Could not fetch NGOs from Supabase, using verified seed data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingNGOs = async () => {
    try {
      const { data, error } = await supabase
        .from('ngos')
        .select('*')
        .eq('status', 'pending');
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching pending NGOs:', err);
      return [];
    }
  };

  const updateNGOStatus = async (id: string, status: NGO['status']) => {
    try {
      const { error } = await supabase
        .from('ngos')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      
      // Update local state if needed
      setNgos(prev => prev.map(n => n.id === id ? { ...n, status } : n));
    } catch (err) {
      console.error('Error updating NGO status:', err);
      throw err;
    }
  };

  const refreshCurrentNgo = async () => {
    if (!user || userData?.role !== 'ngo_admin') return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ngos')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      setCurrentNgo(data || null);
    } catch (err) {
      console.error('Error fetching current NGO:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitOnboarding = async (ngoData: Partial<NGO>, file: File) => {
    if (!user) throw new Error('Not authenticated');
    
    try {
      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Math.random()}.${fileExt}`;
      const filePath = `verifications/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('ngo_documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('ngo_documents')
        .getPublicUrl(filePath);

      // 2. Update NGO Profile in Database
      const { error: updateError } = await supabase
        .from('ngos')
        .update({
          ...ngoData,
          verification_document_url: publicUrl,
          status: 'pending' // Moves them to pending approval
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;
      
      await refreshCurrentNgo();
    } catch (err) {
      console.error('Error submitting onboarding:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (userData?.role === 'donor') {
      fetchApprovedNGOs();
    }
    if (userData?.role === 'ngo_admin') {
      refreshCurrentNgo();
    }
  }, [userData]);

  const value: NGOContextType = {
    ngos,
    loading,
    fetchApprovedNGOs,
    fetchPendingNGOs,
    updateNGOStatus,
    submitOnboarding,
    currentNgo,
    refreshCurrentNgo
  };

  return <NGOContext.Provider value={value}>{children}</NGOContext.Provider>;
}

export function useNGO() {
  const context = useContext(NGOContext);
  if (context === undefined) {
    throw new Error('useNGO must be used within an NGOProvider');
  }
  return context;
}
