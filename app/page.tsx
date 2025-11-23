'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { UserMenu } from '@/components/auth/user-menu';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Navigation, Users, Clock, DollarSign, Car, Search, Star, Loader2, MapPinned } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const isSignedIn = !!user;
  const router = useRouter();
  const { toast } = useToast();
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [activeTab, setActiveTab] = useState('rider');
  const [searching, setSearching] = useState(false);
  const [postingRide, setPostingRide] = useState(false);
  const [rideForm, setRideForm] = useState({
    start: '',
    end: '',
    time: '',
    seats: '',
    price: '',
  });

  // Check if profile is completed on mount
  useEffect(() => {
    if (isSignedIn && user && !loading) {
      // const profileCompleted = user.unsafeMetadata?.profileCompleted; // Clerk specific
      // const role = user.unsafeMetadata?.role; // Clerk specific

      // For Firebase, we might check a user profile document in Firestore/Appwrite
      // For now, we'll rely on localStorage for role if available, or skip
      const role = localStorage.getItem('selectedRole');

      // Check if there's pending profile data to save
      const pendingProfile = localStorage.getItem('pendingProfile');
      if (pendingProfile) {
        // User just verified, now save the profile
        const profileData = JSON.parse(pendingProfile);
        // This will be handled by the profile completion page
        if (role === 'driver') {
          router.push('/driver/complete-profile?verified=true');
        } else if (role === 'owner') {
          router.push('/owner/complete-profile?verified=true');
        }
        return;
      }

      // Logic for redirecting to complete profile if needed can be added here
      // based on fetching user profile from database
    }
  }, [isSignedIn, user, loading, router]);

  const activeRides = [
    {
      id: 1,
      driver: 'John Doe',
      from: 'Downtown Station',
      to: 'Airport Terminal',
      time: '2:30 PM',
      price: '$15.50',
      seats: 2,
      rating: 4.8,
      avatar: 'JD'
    },
    {
      id: 2,
      driver: 'Sarah Smith',
      from: 'City Center',
      to: 'University Campus',
      time: '3:15 PM',
      price: '$12.00',
      seats: 3,
      rating: 4.9,
      avatar: 'SS'
    },
    {
      id: 3,
      driver: 'Mike Johnson',
      from: 'Shopping Mall',
      to: 'Beach Park',
      time: '4:00 PM',
      price: '$18.75',
      seats: 1,
      rating: 4.7,
      avatar: 'MJ'
    }
  ];

  const myRides = [
    {
      id: 1,
      type: 'Upcoming',
      from: 'My Location',
      to: 'Coffee Shop',
      time: '5:00 PM',
      price: '$8.50',
      status: 'confirmed'
    },
    {
      id: 2,
      type: 'Completed',
      from: 'Home',
      to: 'Office',
      time: '9:00 AM',
      price: '$10.00',
      status: 'completed'
    }
  ];

  const getCurrentLocation = (field: 'pickup' | 'destination') => {
    if (!navigator.geolocation) {
      toast({
        title: 'Geolocation not supported',
        description: 'Your browser does not support geolocation',
        variant: 'destructive',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Using a free geocoding service (you can replace with your preferred service)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          if (data.display_name) {
            const location = data.display_name.split(',').slice(0, 3).join(',');
            if (field === 'pickup') {
              setPickup(location);
            } else {
              setDestination(location);
            }
            toast({
              title: 'Location fetched',
              description: 'Your location has been retrieved',
            });
          }
        } catch (error) {
          const { latitude, longitude } = position.coords;
          const location = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          if (field === 'pickup') {
            setPickup(location);
          } else {
            setDestination(location);
          }
          toast({
            title: 'Location fetched',
            description: 'Coordinates retrieved',
          });
        }
      },
      (error) => {
        toast({
          title: 'Location access denied',
          description: 'Please allow location access or enter manually',
          variant: 'destructive',
        });
      }
    );
  };

  const handleSearchRides = () => {
    if (!pickup || !destination) {
      toast({
        title: 'Missing information',
        description: 'Please enter both pickup and destination',
        variant: 'destructive',
      });
      return;
    }

    if (!isSignedIn) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to search for rides',
        variant: 'destructive',
      });
      router.push('/sign-in');
      return;
    }

    setSearching(true);
    // Simulate API call
    setTimeout(() => {
      setSearching(false);
      toast({
        title: 'Search complete',
        description: `Found ${activeRides.length} rides from ${pickup} to ${destination}`,
      });
    }, 1500);
  };

  const handleBookRide = (rideId: number) => {
    if (!isSignedIn) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to book a ride',
        variant: 'destructive',
      });
      router.push('/sign-in');
      return;
    }

    toast({
      title: 'Ride booked!',
      description: 'Your ride has been booked successfully',
    });
  };

  const handlePostRide = () => {
    if (!isSignedIn) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to post a ride',
        variant: 'destructive',
      });
      router.push('/sign-in');
      return;
    }

    if (!rideForm.start || !rideForm.end || !rideForm.time || !rideForm.seats || !rideForm.price) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setPostingRide(true);
    // Simulate API call
    setTimeout(() => {
      setPostingRide(false);
      toast({
        title: 'Ride posted!',
        description: 'Your ride has been posted successfully',
      });
      setRideForm({ start: '', end: '', time: '', seats: '', price: '' });
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Car className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">RideShare</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Rides</Link>
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Drivers</Link>
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">About</Link>
          </nav>
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <UserMenu />
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="outline" size="sm">Sign In</Button>
                </Link>
                <Link href="/select-role">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Share Rides, Save Money
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with drivers and passengers going your way. Real-time ride sharing made simple.
          </p>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="rider">Find a Ride</TabsTrigger>
            <TabsTrigger value="driver">Offer a Ride</TabsTrigger>
          </TabsList>

          {/* Rider Tab */}
          <TabsContent value="rider" className="space-y-6">
            {/* Booking Form */}
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Book Your Ride
                </CardTitle>
                <CardDescription>
                  Enter your pickup and destination to find available rides
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Pickup Location
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter pickup address"
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => getCurrentLocation('pickup')}
                      title="Use current location"
                    >
                      <MapPinned className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-primary" />
                    Destination
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter destination address"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => getCurrentLocation('destination')}
                      title="Use current location"
                    >
                      <MapPinned className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSearchRides}
                  disabled={searching}
                >
                  {searching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search Rides
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Available Rides */}
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-semibold mb-4">Available Rides</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeRides.map((ride) => (
                  <Card key={ride.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ride.driver}`} />
                            <AvatarFallback>{ride.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{ride.driver}</CardTitle>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-muted-foreground">{ride.rating}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary">{ride.seats} seats</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3 text-green-500" />
                          <span className="font-medium">{ride.from}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Navigation className="h-3 w-3 text-red-500" />
                          <span>{ride.to}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{ride.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <span className="font-bold text-lg">{ride.price}</span>
                        </div>
                      </div>
                      <Button
                        className="w-full mt-2"
                        onClick={() => handleBookRide(ride.id)}
                      >
                        Book Ride
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* My Rides */}
            {isSignedIn && (
              <Card className="max-w-4xl mx-auto mt-8">
                <CardHeader>
                  <CardTitle>My Rides</CardTitle>
                  <CardDescription>View your upcoming and past rides</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {myRides.map((ride) => (
                      <div key={ride.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={ride.status === 'confirmed' ? 'default' : 'secondary'}>
                              {ride.type}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-green-500" />
                              <span className="font-medium">{ride.from}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Navigation className="h-4 w-4 text-red-500" />
                              <span>{ride.to}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{ride.time}</span>
                          </div>
                          <div className="font-bold text-lg">{ride.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Driver Tab */}
          <TabsContent value="driver" className="space-y-6">
            {!isSignedIn ? (
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>Sign In Required</CardTitle>
                  <CardDescription>
                    Please sign in to post rides and manage your driver profile
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                  <Link href="/sign-in" className="flex-1">
                    <Button className="w-full">Sign In</Button>
                  </Link>
                  <Link href="/select-role" className="flex-1">
                    <Button variant="outline" className="w-full">Sign Up</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Car className="h-5 w-5" />
                      Offer a Ride
                    </CardTitle>
                    <CardDescription>
                      Share your ride and earn money by taking passengers along
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        Starting Point
                      </label>
                      <Input
                        placeholder="Enter your starting location"
                        value={rideForm.start}
                        onChange={(e) => setRideForm({ ...rideForm, start: e.target.value })}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-primary" />
                        Destination
                      </label>
                      <Input
                        placeholder="Enter your destination"
                        value={rideForm.end}
                        onChange={(e) => setRideForm({ ...rideForm, end: e.target.value })}
                        className="w-full"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          Departure Time
                        </label>
                        <Input
                          type="time"
                          value={rideForm.time}
                          onChange={(e) => setRideForm({ ...rideForm, time: e.target.value })}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          Available Seats
                        </label>
                        <Input
                          type="number"
                          placeholder="2"
                          min="1"
                          max="8"
                          value={rideForm.seats}
                          onChange={(e) => setRideForm({ ...rideForm, seats: e.target.value })}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        Price per Seat
                      </label>
                      <Input
                        type="number"
                        placeholder="15.00"
                        step="0.01"
                        value={rideForm.price}
                        onChange={(e) => setRideForm({ ...rideForm, price: e.target.value })}
                        className="w-full"
                      />
                    </div>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handlePostRide}
                      disabled={postingRide}
                    >
                      {postingRide ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Car className="mr-2 h-4 w-4" />
                          Post Ride
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Driver Stats */}
                <div className="max-w-4xl mx-auto grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Total Rides</CardDescription>
                      <CardTitle className="text-3xl">127</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Earnings</CardDescription>
                      <CardTitle className="text-3xl">$2,450</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Rating</CardDescription>
                      <CardTitle className="text-3xl flex items-center gap-1">
                        4.9 <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Car className="h-5 w-5 text-primary" />
              <span className="font-bold">RideShare</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
