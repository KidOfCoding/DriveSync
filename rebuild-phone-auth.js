#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const phoneSignInPath = path.join(__dirname, 'components/auth/phone-sign-in.tsx');
const phoneSignUpPath = path.join(__dirname, 'components/auth/phone-sign-up.tsx');

function fixPhoneSignIn() {
    let content = fs.readFileSync(phoneSignInPath, 'utf8');

    // Find where to insert the missing useEffect code (after webOtp hook declaration)
    const insertPoint = content.indexOf('// Web OTP Hook');

    if (insertPoint === -1) {
        // File is too corrupted, need to add the Web OTP hook section
        const afterToast = content.indexOf('const { toast } = useToast();');
        if (afterToast !== -1) {
            const insertPos = content.indexOf('\r\n', afterToast) + 2;
            const codeToInsert = `
    // Web OTP Hook
    const webOtp = useWebOTP();

    useEffect(() => {
        setIsMounted(true);
        setupRecaptcha('recaptcha-container');
    }, []);

    useEffect(() => {
        if (webOtp) {
            setCode(webOtp);
            if (confirmationResult) {
                handleVerify(webOtp);
            }
        }
    }, [webOtp, confirmationResult]);

    `;
            content = content.slice(0, insertPos) + codeToInsert + content.slice(insertPos);
            fs.writeFileSync(phoneSignInPath, content, 'utf8');
            console.log('✅ Fixed phone-sign-in.tsx');
            return true;
        }
    }

    console.log('⚠️  Could not fix phone-sign-in.tsx - file structure unexpected');
    return false;
}

function fixPhoneSignUp() {
    let content = fs.readFileSync(phoneSignUpPath, 'utf8');

    // Find where to insert the missing useEffect code
    const insertPoint = content.indexOf('// Web OTP Hook');

    if (insertPoint === -1) {
        const afterToast = content.indexOf('const { toast } = useToast();');
        if (afterToast !== -1) {
            const insertPos = content.indexOf('\r\n', afterToast) + 2;
            const codeToInsert = `
    // Web OTP Hook
    const webOtp = useWebOTP();

    useEffect(() => {
        setIsMounted(true);
        setupRecaptcha('recaptcha-container-signup');
    }, []);

    useEffect(() => {
        if (webOtp) {
            setCode(webOtp);
            if (confirmationResult) {
                handleVerify(webOtp);
            }
        }
    }, [webOtp, confirmationResult]);

    `;
            content = content.slice(0, insertPos) + codeToInsert + content.slice(insertPos);
            fs.writeFileSync(phoneSignUpPath, content, 'utf8');
            console.log('✅ Fixed phone-sign-up.tsx');
            return true;
        }
    }

    console.log('⚠️  Could not fix phone-sign-up.tsx - file structure unexpected');
    return false;
}

console.log('🔧 Rebuilding corrupted phone auth files...\n');
const success1 = fixPhoneSignIn();
const success2 = fixPhoneSignUp();

if (success1 && success2) {
    console.log('\n✅ All files rebuilt successfully!');
    console.log('✅ useEffect now runs only once on mount - no more infinite loops!');
} else {
    console.log('\n⚠️  Some files could not be fixed automatically.');
    console.log('Please check the files manually.');
}
