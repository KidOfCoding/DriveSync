'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Car, Building2, ArrowLeft } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'driver' | 'owner' | null>(null);

  useEffect(() => {
    // Get role from localStorage
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('selectedRole') as 'driver' | 'owner' | null;
      if (!role) {
        router.push('/select-role');
        return;
      }
      setSelectedRole(role);
    }
  }, [router]);

  if (!selectedRole) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => router.push('/select-role')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Change Role
        </Button>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            {selectedRole === 'driver' ? (
              <Car className="h-6 w-6 text-primary" />
            ) : (
              <Building2 className="h-6 w-6 text-primary" />
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to your {selectedRole === 'driver' ? 'Driver' : 'Owner'} account
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "shadow-none border-0",
                  socialButtonsBlockButton: "w-full",
                },
                layout: {
                  socialButtonsPlacement: "top",
                },
              }}
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              afterSignInUrl="/"
            />
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/sign-up" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

