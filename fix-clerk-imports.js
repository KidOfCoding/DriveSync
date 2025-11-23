#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const files = [
    path.join(__dirname, 'app/driver/complete-profile/page.tsx'),
    path.join(__dirname, 'app/owner/complete-profile/page.tsx')
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Replace import
    content = content.replace(
        /import { useUser, useAuth } from '@clerk\/nextjs';/g,
        "import { useAuth } from '@/components/auth/auth-provider';"
    );

    // Replace hook usage - more precise pattern
    content = content.replace(
        /const { user } = useUser\(\);\r?\n  const { isSignedIn } = useAuth\(\);/g,
        "const { user, loading: authLoading } = useAuth();\n  const isSignedIn = !!user;"
    );

    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Fixed: ${path.basename(file)}`);
});

console.log('\n✅ All profile pages updated successfully!');
