#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const driverFile = path.join(__dirname, 'app/driver/complete-profile/page.tsx');
const ownerFile = path.join(__dirname, 'app/owner/complete-profile/page.tsx');

function fixProfilePage(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Fix user property references
    content = content.replace(/user\?\.fullName/g, 'user?.displayName');
    content = content.replace(/user\?\.primaryPhoneNumber\?\.phoneNumber/g, 'user?.phoneNumber');
    content = content.replace(/user\?\.primaryEmailAddress\?\.emailAddress/g, 'user?.email');
    content = content.replace(/user\?\.id/g, 'user?.uid');
    content = content.replace(/user\.id/g, 'user.uid');

    // Fix clerkUserId to userId
    content = content.replace(/clerkUserId:/g, 'userId:');

    // Remove Clerk user.update calls - find and remove the entire block
    content = content.replace(/await user\.update\(\{[\s\S]*?\}\);/g, '// Clerk user.update removed - using Firebase');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${path.basename(path.dirname(filePath))}/${path.basename(filePath)}`);
}

console.log('🔧 Fixing profile pages...\n');
fixProfilePage(driverFile);
fixProfilePage(ownerFile);
console.log('\n✅ All profile pages updated with Firebase user properties!');
