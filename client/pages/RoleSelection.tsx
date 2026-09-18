import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type UserRole } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Building2, Settings } from 'lucide-react';

export default function RoleSelection() {
  const navigate = useNavigate();
  const { setRole } = useAuth();

  const handleRoleSelect = (role: UserRole) => {
    setRole(role);
    navigate(role === 'ngo_admin' ? '/ngo-selection' : '/auth');
  };

  const roles = [
    {
      id: 'donor',
      title: 'Donor',
      description: 'Support causes you care about',
      icon: Heart,
      color: 'from-pink-500 to-red-500',
    },
    {
      id: 'ngo_admin',
      title: 'NGO Admin',
      description: 'Manage fundraising and allocate funds',
      icon: Building2,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'app_admin',
      title: 'App Admin',
      description: 'Oversee platform analytics and management',
      icon: Settings,
      color: 'from-purple-500 to-indigo-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to FundHub
          </h1>
          <p className="text-xl text-slate-300">
            Select your role to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.id}
                className="group h-full transition-all duration-300 hover:scale-105"
              >
                <Card className="h-full border-0 shadow-xl overflow-hidden group-hover:shadow-2xl">
                  <div className={`h-32 bg-gradient-to-br ${role.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                  <CardHeader>
                    <div className="mb-4">
                      <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${role.color} p-3 mb-4`}>
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl">{role.title}</CardTitle>
                    <CardDescription className="text-base mt-2">
                      {role.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleRoleSelect(role.id as UserRole)}
                      className="w-full bg-slate-900 hover:bg-slate-800"
                      size="lg"
                    >
                      Select Role
                    </Button>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center text-slate-400">
          <p>New to FundHub? Create an account after selecting your role</p>
        </div>
      </div>
    </div>
  );
}
