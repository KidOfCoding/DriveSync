'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    ConfirmationResult
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    setupRecaptcha: (elementId: string) => void;
    signInWithPhone: (phoneNumber: string) => Promise<ConfirmationResult>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            router.push('/');
        } catch (error) {
            console.error('Error signing in with Google', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            router.push('/sign-in');
        } catch (error) {
            console.error('Error signing out', error);
            throw error;
        }
    };

    const setupRecaptcha = (elementId: string) => {
        // Clear existing verifier if any
        if (window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier.clear();
            } catch (e) {
                // Ignore errors during cleanup
            }
        }

        // Create new verifier - Firebase v12 uses auth as first parameter
        window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
            'size': 'invisible',
            'callback': () => {
                // reCAPTCHA solved
            },
            'expired-callback': () => {
                // Response expired
                if (window.recaptchaVerifier) {
                    window.recaptchaVerifier.clear();
                    window.recaptchaVerifier = undefined as any;
                }
            }
        });
    };

    const signInWithPhone = async (phoneNumber: string) => {
        if (!window.recaptchaVerifier) {
            throw new Error('Recaptcha not initialized. Please try again.');
        }

        try {
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
            return confirmationResult;
        } catch (error: any) {
            console.error('Phone sign-in error:', error);
            // Clear the recaptcha on error so it can be re-initialized
            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                } catch (e) {
                    // Ignore cleanup errors
                }
                window.recaptchaVerifier = undefined as any;
            }
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout, setupRecaptcha, signInWithPhone }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

// Add window type definition for recaptchaVerifier
declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier | undefined;
    }
}
