'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Upload, MapPin, Loader2, ArrowLeft } from 'lucide-react';
import { uploadImageClient } from '@/lib/imagekit-client';
import { saveProfile } from '@/lib/storage';

export default function CompleteDriverProfile() {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
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
          email: data.email || '',
          photo: data.photo || '',
          location: data.location || '',
          address: data.address || '',
        };
      }
    }
    return {
      name: user?.fullName || '',
      phone: user?.primaryPhoneNumber?.phoneNumber || '',
      email: user?.primaryEmailAddress?.emailAddress || '',
      photo: '',
      location: '',
      address: '',
    };
  });
  const [locationPermission, setLocationPermission] = useState(false);

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
      const url = await uploadImageClient(file, 'drivers');
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

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Geolocation not supported',
        description: 'Your browser does not support geolocation',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          if (data.display_name) {
            const location = data.display_name.split(',').slice(0, 3).join(',');
            setFormData({ ...formData, location: `${latitude}, ${longitude}`, address: location });
            setLocationPermission(true);
            toast({
              title: 'Location fetched',
              description: 'Your location has been retrieved successfully',
            });
          }
        } catch (error) {
          // Fallback to coordinates if reverse geocoding fails
          const { latitude, longitude } = position.coords;
          setFormData({ ...formData, location: `${latitude}, ${longitude}` });
          setLocationPermission(true);
          toast({
            title: 'Location fetched',
            description: 'Location coordinates retrieved',
          });
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        toast({
          title: 'Location access denied',
          description: 'Please allow location access or enter manually',
          variant: 'destructive',
        });
      }
    );
  };

  const handleSaveAfterVerification = async (profileData: any) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Save to Clerk metadata
      await user.update({
        unsafeMetadata: {
          role: 'driver',
          profileCompleted: true,
          ...profileData,
        },
      });

      // Save to Appwrite/localStorage
      const finalProfileData = {
        clerkUserId: user.id,
        role: 'driver' as const,
        name: profileData.name,
        phone: profileData.phone,
        email: profileData.email || user.primaryEmailAddress?.emailAddress || '',
        profilePhoto: profileData.photo,
        homeAddress: profileData.address,
        location: profileData.location,
        profileCompleted: true,
      };

      await saveProfile(finalProfileData);

      // Clear pending profile
      localStorage.removeItem('pendingProfile');

      toast({
        title: 'Profile completed',
        description: 'Your driver profile has been created successfully',
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
    
    if (!formData.name || !formData.phone || !formData.address) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields (Name, Phone, Home Address)',
        variant: 'destructive',
      });
      return;
    }

    // If user is already signed in, save directly
    if (isSignedIn && user?.id) {
      setLoading(true);
      try {
        await user.update({
          unsafeMetadata: {
            role: 'driver',
            profileCompleted: true,
            ...formData,
          },
        });

        const profileData = {
          clerkUserId: user.id,
          role: 'driver' as const,
          name: formData.name,
          phone: formData.phone,
          email: formData.email || user.primaryEmailAddress?.emailAddress || '',
          profilePhoto: formData.photo,
          homeAddress: formData.address,
          location: formData.location,
          profileCompleted: true,
        };

        await saveProfile(profileData);

        toast({
          title: 'Profile completed',
          description: 'Your driver profile has been created successfully',
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
      email: formData.email,
      photo: formData.photo,
      address: formData.address,
      location: formData.location,
      role: 'driver',
    };

    // Store in localStorage temporarily
    localStorage.setItem('pendingProfile', JSON.stringify(profileData));
    localStorage.setItem('selectedRole', 'driver');

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
            <CardTitle>Complete Your Driver Profile</CardTitle>
            <CardDescription>
              {isSignedIn 
                ? 'Please provide the following information to complete your driver profile'
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
                    {formData.name.charAt(0).toUpperCase() || 'D'}
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


              {/* Home Address with Map */}
              <div className="space-y-2">
                <Label htmlFor="address">Home Address *</Label>
                <div className="flex gap-2">
                  <Input
                    id="address"
                    value={formData.address || formData.location}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter your home address or click to use current location"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={loading}
                    title="Use current location"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MapPin className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {locationPermission && (
                  <p className="text-xs text-green-600">Location fetched successfully</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Click the map icon to automatically detect your location
                </p>
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

