import { useEffect, useState } from 'react';

export function useWebOTP(enabled: boolean = false) {
    const [otp, setOtp] = useState<string>('');

    useEffect(() => {
        if (!enabled) return;
        const uaMobile = (navigator as any).userAgentData?.mobile === true || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (!uaMobile) return;
        if (!('OTPCredential' in window)) return;
        if (!window.isSecureContext) return;

        const ac = new AbortController();

        navigator.credentials
            .get({
                // @ts-ignore
                otp: { transport: ['sms'] },
                signal: ac.signal,
            })
            .then((cred: any) => {
                if (cred && cred.code) {
                    setOtp(cred.code);
                }
            })
            .catch(() => {});

        return () => {
            ac.abort();
        };
    }, [enabled]);

    return otp;
}
