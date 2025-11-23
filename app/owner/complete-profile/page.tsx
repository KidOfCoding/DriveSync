'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2, ArrowLeft } from 'lucide-react';
import { uploadImageClient } from '@/lib/imagekit-client';
import { saveProfile } from '@/lib/storage';

export default function CompleteOwnerProfile() {
  const { user, loading: authLoading } = useAuth();
  const isSignedIn = !!user;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isVerified = searchParams.get('verified') === 'true';
  
  // Load pending profile data if user just verified
  const [formData, setFormData] = useState(() => {
    if (typeof window !== 'undefined') {
      const pendingProfile = localStorage.getItem('pendingProfile');
      if (pendingProfile) {
        const data = JSON.parse(pendingProfile);
        return {
          name: data.name || '',
          phone: data.phone || '',
          photo: data.photo || '',
          businessName: data.businessName || '',
          businessType: data.businessType || '',
          businessAddress: data.businessAddress || '',
          businessDescription: data.businessDescription || '',
        };
      }
    }
    return {
      name: user?.displayName || '',
      phone: user?.phoneNumber || '',
      photo: '',
      businessName: '',
      businessType: '',
      businessAddress: '',
      businessDescription: '',
    };
  });

  // If user just verified, save the profile
  useEffect(() => {
    if (isVerified && isSignedIn && user) {
      const pendingProfile = localStorage.getItem('pendingProfile');
      if (pendingProfile) {
        const profileData = JSON.parse(pendingProfile);
        handleSaveAfterVerification(profileData);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVerified, isSignedIn, user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImageClient(file, 'owners');
      setFormData({ ...formData, photo: url });
      toast({
        title: 'Image uploaded',
        description: 'Your photo has been uploaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveAfterVerification = async (profileData: any) => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      // Save to Clerk metadata
      // Clerk user.update removed - using Firebase

      // Save to Appwrite/localStorage
      const finalProfileData = {
        userId: user.uid,
        role: 'owner' as const,
        name: profileData.name,
        phone: profileData.phone,
        email: profileData.email || user.email || '',
        profilePhoto: profileData.photo,
        businessName: profileData.businessName,
        businessAddress: profileData.businessAddress,
        businessType: profileData.businessType,
        businessDescription: profileData.businessDescription,
        profileCompleted: true,
      };

      await saveProfile(finalProfileData);

      // Clear pending profile
      localStorage.removeItem('pendingProfile');

      toast({
        title: 'Profile completed',
        description: 'Your owner profile has been created successfully',
      });

      router.push('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.businessName || !formData.businessAddress) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields (Name, Phone, Business Name, Business Address)',
        variant: 'destructive',
      });
      return;
    }

    // If user is already signed in, save directly
    if (isSignedIn && user?.uid) {
      setLoading(true);
      try {
        // Clerk user.update removed - using Firebase

        const profileData = {
          userId: user.uid,
          role: 'owner' as const,
          name: formData.name,
          phone: formData.phone,
          email: user.email || '',
          profilePhoto: formData.photo,
          businessName: formData.businessName,
          businessAddress: formData.businessAddress,
          businessType: formData.businessType,
          businessDescription: formData.businessDescription,
          profileCompleted: true,
        };

        await saveProfile(profileData);

        toast({
          title: 'Profile completed',
          description: 'Your owner profile has been created successfully',
        });

        router.push('/');
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to save profile. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    // If not signed in, store profile data and redirect to Clerk sign-up
    const profileData = {
      name: formData.name,
      phone: formData.phone,
      photo: formData.photo,
      businessName: formData.businessName,
      businessAddress: formData.businessAddress,
      businessType: formData.businessType,
      businessDescription: formData.businessDescription,
      role: 'owner',
    };

    // Store in localStorage temporarily
    localStorage.setItem('pendingProfile', JSON.stringify(profileData));
    localStorage.setItem('selectedRole', 'owner');

    // Redirect to Clerk sign-up
    router.push('/sign-up');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push('/select-role')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Role Selection
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Owner Profile</CardTitle>
            <CardDescription>
              {isSignedIn 
                ? 'Please provide the following information to complete your owner profile'
                : 'Fill in your details below. You will be asked to verify your identity with Google after submitting.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload */}
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={formData.photo} />
                  <AvatarFallback>
                    {formData.name.charAt(0).toUpperCase() || 'O'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-center gap-2">
                  <Label htmlFor="photo" className="cursor-pointer">
                    <Button type="button" variant="outline" asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        {uploading ? 'Uploading...' : 'Upload Photo'}
                      </span>
                    </Button>
                  </Label>
                  <input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <p className="text-xs text-muted-foreground">Max 5MB, JPG/PNG</p>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  required
                />
              </div>

              {/* Business Type */}
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Input
                  id="businessType"
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  placeholder="e.g., Transportation Company, Taxi Service"
                />
              </div>

              {/* Business Address with Map */}
              <div className="space-y-2">
                <Label htmlFor="businessAddress">Business Address *</Label>
                <Textarea
                  id="businessAddress"
                  value={formData.businessAddress}
                  onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                  placeholder="Enter your business address (with map to pinpoint location)"
                  required
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Enter your business address. You can use the map to pinpoint the exact location.
                </p>
              </div>

              {/* Business Description */}
              <div className="space-y-2">
                <Label htmlFor="businessDescription">Business Description</Label>
                <Textarea
                  id="businessDescription"
                  value={formData.businessDescription}
                  onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                  placeholder="Describe your business"
                  rows={4}
                />
              </div>


              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isSignedIn ? 'Saving...' : 'Verifying...'}
                    </>
                  ) : (
                    isSignedIn ? 'Complete Profile' : 'Continue to Verification'
                  )}
                </Button>
                {!isSignedIn && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/select-role')}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

