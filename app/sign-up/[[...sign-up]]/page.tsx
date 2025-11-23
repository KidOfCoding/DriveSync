'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car, Building2, ArrowLeft, Phone, Mail } from 'lucide-react';
import { PhoneSignUp } from '@/components/auth/phone-sign-up';

export default function SignUpPage() {
  const router = useRouter();
  const { signInWithGoogle } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'driver' | 'owner' | null>(null);
  const [view, setView] = useState<'selection' | 'phone' | 'email'>('selection');

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
            {view === 'selection' && (
              <>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Choose how you want to sign up
                </CardDescription>
              </>
            )}
            {view === 'email' && (
              <>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Sign up with Google to continue
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent>
            {view === 'selection' && (
              <div className="space-y-4">
                <Button
                  className="w-full h-12 text-lg"
                  onClick={() => setView('phone')}
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Continue with Phone
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full h-12"
                  onClick={() => setView('email')}
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Email or Google
                </Button>
              </div>
            )}

            {view === 'phone' && (
              <PhoneSignUp onBack={() => setView('selection')} />
            )}

            {view === 'email' && (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  onClick={() => setView('selection')}
                  className="mb-4 -ml-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">Sign up with Google</h3>
                  <p className="text-sm text-muted-foreground">Use your Google account to create an account</p>
                </div>

                <Button
                  className="w-full h-12"
                  variant="outline"
                  onClick={() => signInWithGoogle()}
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </div>
            )}
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

