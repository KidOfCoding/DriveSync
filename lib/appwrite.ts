import { Client, Databases, ID, Query } from 'appwrite';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

export const databases = new Databases(client);

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
export const DRIVERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_DRIVERS_COLLECTION_ID || '';
export const OWNERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_OWNERS_COLLECTION_ID || '';

export { ID, Query };

// Check if Appwrite is configured
export const isAppwriteConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT &&
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID &&
    (process.env.NEXT_PUBLIC_APPWRITE_DRIVERS_COLLECTION_ID || process.env.NEXT_PUBLIC_APPWRITE_OWNERS_COLLECTION_ID)
  );
};

