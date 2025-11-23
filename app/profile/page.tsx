'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Phone, Mail, Car, Briefcase, User, Calendar, Building2, Clock, ArrowLeft } from 'lucide-react';
import { getProfile, UserProfile } from '@/lib/storage';

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/sign-in');
            return;
        }

        const loadProfile = async () => {
            if (user) {
                const storedRole = localStorage.getItem('selectedRole') as 'driver' | 'owner' | null;

                if (!storedRole) {
                    setLoading(false);
                    return;
                }

                const userProfile = await getProfile(user.uid, storedRole);
                setProfile(userProfile);
                setLoading(false);
            }
        };

        loadProfile();
    }, [user, authLoading, router]);

    if (authLoading || loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle>Profile Not Found</CardTitle>
                        <CardDescription>We couldn't find your profile information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push('/select-role')}>
                            Complete Profile
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4">
            <div className="max-w-3xl mx-auto space-y-6">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/')}
                    className="mb-2 pl-0 hover:bg-transparent hover:text-primary"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Button>

                {/* Header Card */}
                <Card className="overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/5" />
                    <CardContent className="relative pt-0">
                        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-12 mb-6">
                            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                                <AvatarImage src={profile.profilePhoto} />
                                <AvatarFallback className="text-2xl">
                                    {profile.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold">{profile.name}</h1>
                                    <Badge variant="secondary" className="capitalize">
                                        {profile.role}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Phone className="h-4 w-4" />
                                        {profile.phone}
                                    </div>
                                    {profile.email && (
                                        <div className="flex items-center gap-1">
                                            <Mail className="h-4 w-4" />
                                            {profile.email}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Button onClick={() => router.push(profile.role === 'driver' ? '/driver/complete-profile' : '/owner/complete-profile')}>
                                Edit Profile
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Details Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Personal Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Gender</div>
                                    <div className="capitalize">{profile.gender || 'Not specified'}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Age</div>
                                    <div>{profile.age || 'Not specified'}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Role Specific Info */}
                    {profile.role === 'driver' ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Car className="h-5 w-5" />
                                    Driver Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Vehicle Type</div>
                                        <div className="capitalize">
                                            {profile.vehicleType === 'other' ? profile.otherVehicleType : profile.vehicleType}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Experience</div>
                                        <div>{profile.experience ? `${profile.experience} Years` : 'Not specified'}</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground mb-1">Home Address</div>
                                    <div className="flex items-start gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <span>{profile.homeAddress}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Business Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Business Name</div>
                                    <div className="font-medium">{profile.businessName}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Business Type</div>
                                    <div>{profile.businessType || 'Not specified'}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground mb-1">Address</div>
                                    <div className="flex items-start gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <span>{profile.businessAddress}</span>
                                    </div>
                                </div>
                                {profile.businessDescription && (
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground mb-1">Description</div>
                                        <p className="text-sm text-muted-foreground">{profile.businessDescription}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
