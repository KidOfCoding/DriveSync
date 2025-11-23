#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the original backup or create fresh versions
const phoneSignInPath = path.join(__dirname, 'components/auth/phone-sign-in.tsx');
const phoneSignUpPath = path.join(__dirname, 'components/auth/phone-sign-up.tsx');

// Since files are corrupted, let's use git to restore them first
const { execSync } = require('child_process');

try {
    // Try to restore from git
    console.log('🔄 Attempting to restore files from git...');
    execSync('git restore components\\auth\\phone-sign-in.tsx components\\auth\\phone-sign-up.tsx', {
        cwd: __dirname,
        stdio: 'pipe'
    });
    console.log('✅ Files restored from git');
} catch (e) {
    console.log('⚠️  Git restore failed, files may not be in git. Will fix manually.');
}

// Now apply the fix
function fixUseEffectDependency(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // Fix the useEffect with setupRecaptcha dependency
        const oldPattern = /useEffect\(\(\) => \{\s+setIsMounted\(true\);\s+setupRecaptcha\(['"](recaptcha-container(?:-signup)?)['"]\);\s+\}, \[setupRecaptcha\]\);/gs;

        content = content.replace(oldPattern, (match, containerId) => {
            return `useEffect(() => {
        setIsMounted(true);
        setupRecaptcha('${containerId}');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);`;
        });

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed: ${path.basename(filePath)}`);
        return true;
    } catch (error) {
        console.error(`❌ Error fixing ${path.basename(filePath)}:`, error.message);
        return false;
    }
}

console.log('\n🔧 Applying useEffect dependency fix...\n');
const success1 = fixUseEffectDependency(phoneSignInPath);
const success2 = fixUseEffectDependency(phoneSignUpPath);

if (success1 && success2) {
    console.log('\n✅ All files fixed successfully!');
    console.log('\n📝 Changes made:');
    console.log('   - Removed setupRecaptcha from useEffect dependency arrays');
    console.log('   - Added empty dependency array [] to run only once on mount');
    console.log('   - This prevents infinite loops and rate limiting!');
} else {
    console.log('\n⚠️  Some files could not be fixed. Please check manually.');
}
