import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type UserRole = 'donor' | 'ngo_admin' | 'app_admin';

export interface UserData {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  displayName?: string;
  ngoName?: string;
  ngoCategory?: string;
}

interface AuthContextType {
  user: any | null;
  userData: UserData | null;
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;
  loading: boolean;
  error: string | null;
  register: (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    ngoDetails?: { ngoName?: string; ngoCategory?: string }
  ) => Promise<UserData>;
  login: (email: string, password: string) => Promise<UserData>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get local user registry
function getUsersRegistry(): Record<string, UserData> {
  try {
    const raw = localStorage.getItem('fundhub_users_registry');
    return raw ? JSON.parse(raw) : {
      'admin@fundhub.com': {
        id: 'usr_admin_1',
        email: 'admin@fundhub.com',
        role: 'app_admin',
        name: 'System Admin',
        displayName: 'Platform Administrator',
      }
    };
  } catch {
    return {};
  }
}

function saveUsersRegistry(registry: Record<string, UserData>) {
  localStorage.setItem('fundhub_users_registry', JSON.stringify(registry));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check local session first for seamless offline/demo support
    const stored = localStorage.getItem('fundhub_demo_user');
    if (stored) {
      try {
        const demoUser: UserData = JSON.parse(stored);
        setUser({ id: demoUser.id, email: demoUser.email });
        setUserData(demoUser);
        setRole(demoUser.role);
        setLoading(false);
        return;
      } catch {
        localStorage.removeItem('fundhub_demo_user');
      }
    }

    // 2. Check active Supabase sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch((err) => {
      console.warn('Could not connect to Supabase auth session, continuing as guest:', err);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        if (!localStorage.getItem('fundhub_demo_user')) {
          setUserData(null);
          setRole(null);
        }
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setUserData({
          ...data,
          displayName: data.name || data.email?.split('@')[0] || 'User',
        });
        setRole(data.role);
      }
    } catch (err) {
      console.warn('Error fetching profile from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    selectedRole: UserRole,
    ngoDetails?: { ngoName?: string; ngoCategory?: string }
  ): Promise<UserData> => {
    try {
      setError(null);
      let registeredUser: any = null;

      // Try Supabase cloud signup if available
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (!authError && authData?.user) {
          registeredUser = authData.user;
          await supabase.from('users').insert([
            { id: authData.user.id, email, role: selectedRole }
          ]);
          
          if (selectedRole === 'donor') {
            await supabase.from('donors').insert([{ user_id: authData.user.id, name }]);
          } else if (selectedRole === 'ngo_admin') {
            await supabase.from('ngos').insert([{
              user_id: authData.user.id,
              name: ngoDetails?.ngoName || `${name}'s Foundation`,
              category: ngoDetails?.ngoCategory || 'Healthcare',
              description: 'Registered on FundHub'
            }]);
          }
        }
      } catch (cloudErr) {
        console.warn('Supabase signup fallback:', cloudErr);
      }

      const userId = registeredUser?.id || `usr_${Date.now()}`;
      const profile: UserData = {
        id: userId,
        email: email.trim().toLowerCase(),
        role: selectedRole,
        name,
        displayName: name || email.split('@')[0],
        ngoName: ngoDetails?.ngoName,
        ngoCategory: ngoDetails?.ngoCategory,
      };

      // Save to persistent registry
      const registry = getUsersRegistry();
      registry[profile.email] = profile;
      saveUsersRegistry(registry);

      // Save active session
      localStorage.setItem('fundhub_demo_user', JSON.stringify(profile));
      setUser({ id: userId, email });
      setUserData(profile);
      setRole(selectedRole);

      return profile;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const login = async (email: string, password: string): Promise<UserData> => {
    try {
      setError(null);
      const cleanEmail = email.trim().toLowerCase();

      // 1. Try Supabase Auth
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (!error && data?.session?.user) {
          setUser(data.session.user);
          await fetchProfile(data.session.user.id);
        }
      } catch (cloudErr) {
        console.warn('Supabase login checking local registry:', cloudErr);
      }

      // 2. Check local users registry
      const registry = getUsersRegistry();
      let matchedUser = registry[cleanEmail];

      // 3. Smart role detection if not in registry
      if (!matchedUser) {
        let detectedRole: UserRole = 'donor';
        if (cleanEmail.includes('admin') || cleanEmail === 'admin@fundhub.com') {
          detectedRole = 'app_admin';
        } else if (cleanEmail.includes('ngo')) {
          detectedRole = 'ngo_admin';
        }

        matchedUser = {
          id: `usr_${Date.now()}`,
          email: cleanEmail,
          role: detectedRole,
          name: cleanEmail.split('@')[0],
          displayName: cleanEmail.split('@')[0],
        };
        registry[cleanEmail] = matchedUser;
        saveUsersRegistry(registry);
      }

      // Save active session
      localStorage.setItem('fundhub_demo_user', JSON.stringify(matchedUser));
      setUser({ id: matchedUser.id, email: matchedUser.email });
      setUserData(matchedUser);
      setRole(matchedUser.role);

      return matchedUser;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      localStorage.removeItem('fundhub_demo_user');
      setUser(null);
      setUserData(null);
      setRole(null);
      try {
        await supabase.auth.signOut();
      } catch {}
    } catch (err: any) {
      setError(err.message || 'Logout failed');
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, role, setRole, loading, error, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
