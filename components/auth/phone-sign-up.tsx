'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useWebOTP } from '@/hooks/use-web-otp';
import { Loader2, Phone, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/auth-provider';
import { ConfirmationResult } from 'firebase/auth';

interface PhoneSignUpProps {
    onBack: () => void;
}

export function PhoneSignUp({ onBack }: PhoneSignUpProps) {
    const { signInWithPhone, setupRecaptcha } = useAuth();
    const [phoneNumber, setPhoneNumber] = useState('+91 ');
    const [verifying, setVerifying] = useState(false);
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [cooldownEnd, setCooldownEnd] = useState<number | null>(null);
    const [cooldownLeft, setCooldownLeft] = useState(0);
    const [confirming, setConfirming] = useState(false);
    const [lastAttemptCode, setLastAttemptCode] = useState<string | null>(null);
    const router = useRouter();
    const { toast } = useToast();

    const webOtp = useWebOTP(verifying && isMounted);

    useEffect(() => {
        setIsMounted(true);
        setupRecaptcha('recaptcha-container-signup');
        const stored = localStorage.getItem('otpCooldownEnd');
        if (stored) {
            const ts = parseInt(stored, 10);
            if (!Number.isNaN(ts) && ts > Date.now()) {
                setCooldownEnd(ts);
            }
        }
    }, []);

    useEffect(() => {
        if (!cooldownEnd) return;
        const id = setInterval(() => {
            const remaining = Math.max(0, Math.ceil((cooldownEnd - Date.now()) / 1000));
            setCooldownLeft(remaining);
            if (remaining <= 0) {
                setCooldownEnd(null);
                clearInterval(id);
            }
        }, 1000);
        return () => clearInterval(id);
    }, [cooldownEnd]);

    useEffect(() => {
        if (webOtp) {
            setCode(webOtp);
            if (confirmationResult && !confirming && webOtp !== lastAttemptCode) {
                handleVerify(webOtp);
            }
        }
    }, [webOtp, confirmationResult, confirming, lastAttemptCode]);

const handleSubmitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (cooldownEnd && cooldownEnd > Date.now()) {
        toast({
            title: "Please wait",
            description: `You can resend code in ${cooldownLeft}s`,
        });
        return;
    }
    setIsLoading(true);
    try {
        const result = await signInWithPhone(phoneNumber);
        setConfirmationResult(result);
        setVerifying(true);
        const end = Date.now() + 60000;
        setCooldownEnd(end);
        localStorage.setItem('otpCooldownEnd', String(end));
        toast({
            title: "Code sent",
            description: "Please check your phone for the verification code.",
        });
    } catch (err: any) {
        console.error(err);
        const end = Date.now() + 60000;
        setCooldownEnd(end);
        localStorage.setItem('otpCooldownEnd', String(end));
        toast({
            variant: "destructive",
            title: "Error",
            description: err.message || 'Failed to send code',
        });
    } finally {
        setIsLoading(false);
    }
};

const handleVerify = async (otpCode: string) => {
    if (!confirmationResult) return;
    if (confirming || lastAttemptCode === otpCode) return;
    setConfirming(true);
    setLastAttemptCode(otpCode);
    setIsLoading(true);
    try {
        await confirmationResult.confirm(otpCode);
        const role = localStorage.getItem('selectedRole');
        if (role === 'driver') {
            router.push('/driver/complete-profile?verified=true');
        } else if (role === 'owner') {
            router.push('/owner/complete-profile?verified=true');
        } else {
            router.push('/select-role');
        }
        toast({
            title: "Success",
            description: "Phone verified successfully!",
        });
    } catch (err: any) {
        console.error(err);
        toast({
            variant: "destructive",
            title: "Verification Failed",
            description: "Invalid code. Please try again.",
        });
    } finally {
        setIsLoading(false);
        setConfirming(false);
    }
};

if (verifying) {
    return (
        <div className="space-y-4">
            <div className="text-center mb-6">
                <h2 className="text-xl font-semibold">Verify Phone</h2>
                <p className="text-sm text-muted-foreground">
                    Enter the code sent to {phoneNumber}
                </p>
            </div>

            <div className="flex justify-center py-4">
                {isMounted ? (
                    <InputOTP
                        maxLength={6}
                        value={code}
                        onChange={(value) => {
                            setCode(value);
                            if (value.length === 6) {
                                handleVerify(value);
                            }
                        }}
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                ) : (
                    <div className="h-10 w-[280px] bg-muted animate-pulse rounded" />
                )}
            </div>

            <Button
                className="w-full"
                onClick={() => handleVerify(code)}
                disabled={code.length !== 6 || isLoading || confirming}
            >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Verify
            </Button>

            <Button
                variant="ghost"
                className="w-full"
                onClick={() => setVerifying(false)}
                disabled={isLoading}
            >
                Change Phone Number
            </Button>
        </div>
    );
}

return (
    <div className="space-y-4">
        <form onSubmit={handleSubmitPhone} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        className="pl-9"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                    />
                </div>
                <p className="text-xs text-muted-foreground">
                    Enter your 10-digit mobile number (India +91)
                </p>
            </div>

            <div id="recaptcha-container-signup"></div>
            {cooldownEnd && cooldownEnd > Date.now() && (
                <p className="text-xs text-muted-foreground">Resend available in {cooldownLeft}s</p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || (cooldownEnd && cooldownEnd > Date.now())}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {cooldownEnd && cooldownEnd > Date.now() ? 'Resend Disabled' : 'Send Code'}
                {!isLoading && !(cooldownEnd && cooldownEnd > Date.now()) && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>

            <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={onBack}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Options
            </Button>
        </form>
    </div>
);
}
