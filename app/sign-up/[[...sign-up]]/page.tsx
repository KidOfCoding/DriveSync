'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car, Building2, ArrowLeft } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'driver' | 'owner' | null>(null);

  useEffect(() => {
    // Get role from localStorage
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('selectedRole') as 'driver' | 'owner' | null;
      if (!role) {
        // If no role selected, redirect to role selection
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

  // After sign-up, redirect back to profile completion with verified flag
  const afterSignUpUrl = selectedRole === 'driver' 
    ? '/driver/complete-profile?verified=true' 
    : '/owner/complete-profile?verified=true';

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
          <h1 className="text-3xl font-bold mb-2">
            Sign Up as {selectedRole === 'driver' ? 'Driver' : 'Owner'}
          </h1>
          <p className="text-muted-foreground">
            Create your account to get started
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Sign up with Google to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignUp 
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "shadow-none border-0",
                  socialButtonsBlockButton: "w-full",
                },
                layout: {
                  socialButtonsPlacement: "top",
                  showOptionalFields: false,
                },
              }}
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              afterSignUpUrl={afterSignUpUrl}
              // Only show Google OAuth
              forceRedirectUrl={afterSignUpUrl}
            />
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

