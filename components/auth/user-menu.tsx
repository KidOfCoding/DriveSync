'use client';
import { useState, useEffect } from 'react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth/auth-provider"
import { User, LogOut, Settings } from "lucide-react"
import Link from "next/link"

export function UserMenu() {
    const { user, logout } = useAuth();
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

    useEffect(() => {
        const loadProfilePhoto = async () => {
            if (user) {
                // Try to get role from localStorage first
                const storedRole = localStorage.getItem('selectedRole') as 'driver' | 'owner' | null;
                if (storedRole) {
                    // We need to dynamically import getProfile to avoid circular dependencies if any,
                    // or just import it at top level. Let's assume top level import is fine.
                    // Actually, let's just use the imported getProfile.
                    try {
                        const { getProfile } = await import('@/lib/storage');
                        const profile = await getProfile(user.uid, storedRole);
                        if (profile?.profilePhoto) {
                            setProfilePhoto(profile.profilePhoto);
                        }
                    } catch (error) {
                        console.error("Failed to load profile photo", error);
                    }
                }
            }
        };
        loadProfilePhoto();
    }, [user]);

    if (!user) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={profilePhoto || user.photoURL || ''} />
                    <AvatarFallback>
                        {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
