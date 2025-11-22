'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Building2 } from 'lucide-react';

export default function SelectRolePage() {
  const router = useRouter();

  const handleRoleSelection = (role: 'driver' | 'owner') => {
    // Store role in localStorage to persist across sessions
    localStorage.setItem('selectedRole', role);
    // Navigate to profile completion (before Clerk verification)
    if (role === 'driver') {
      router.push('/driver/complete-profile');
    } else {
      router.push('/owner/complete-profile');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Welcome to RideShare
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose your role to get started
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary" onClick={() => handleRoleSelection('driver')}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Car className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">I'm a Driver</CardTitle>
              <CardDescription>
                Offer rides and earn money by sharing your journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg">
                Continue as Driver
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary" onClick={() => handleRoleSelection('owner')}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">I'm an Owner</CardTitle>
              <CardDescription>
                Manage your business and connect with drivers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg" variant="outline">
                Continue as Owner
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

