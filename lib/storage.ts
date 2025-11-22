'use client';

// Simple storage utility with Appwrite sync and localStorage fallback

export interface UserProfile {
  clerkUserId: string;
  role: 'driver' | 'owner';
  name: string;
  phone: string;
  email?: string;
  profilePhoto?: string;
  profileCompleted: boolean;
  // Driver specific
  homeAddress?: string;
  location?: string;
  // Owner specific
  businessName?: string;
  businessAddress?: string;
  businessType?: string;
  businessDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Save to localStorage (always works)
export function saveToLocalStorage(userId: string, profile: UserProfile) {
  try {
    const key = `user_${userId}`;
    localStorage.setItem(key, JSON.stringify(profile));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
}

// Get from localStorage
export function getFromLocalStorage(userId: string): UserProfile | null {
  try {
    const key = `user_${userId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}

// Sync to Appwrite (if configured)
export async function syncToAppwrite(profile: UserProfile): Promise<boolean> {
  try {
    const response = await fetch('/api/sync-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: profile.role,
        profileData: profile,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error syncing to Appwrite:', error);
    return false;
  }
}

// Save profile (tries Appwrite first, falls back to localStorage)
export async function saveProfile(profile: UserProfile): Promise<boolean> {
  // Always save to localStorage first (for immediate access)
  saveToLocalStorage(profile.clerkUserId, profile);

  // Try to sync to Appwrite (if configured)
  const appwriteSuccess = await syncToAppwrite(profile);
  
  if (!appwriteSuccess) {
    console.log('Appwrite sync failed, using localStorage only');
  }

  return true; // Always return true since localStorage works
}

// Get profile (checks localStorage first, then Appwrite)
export async function getProfile(userId: string, role: 'driver' | 'owner'): Promise<UserProfile | null> {
  // Check localStorage first
  const localProfile = getFromLocalStorage(userId);
  if (localProfile) {
    return localProfile;
  }

  // Try to fetch from Appwrite (if configured)
  try {
    const response = await fetch(`/api/get-user?userId=${userId}&role=${role}`);
    if (response.ok) {
      const profile = await response.json();
      // Save to localStorage for next time
      if (profile) {
        saveToLocalStorage(userId, profile);
      }
      return profile;
    }
  } catch (error) {
    console.error('Error fetching from Appwrite:', error);
  }

  return null;
}

