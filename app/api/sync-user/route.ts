import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, DRIVERS_COLLECTION_ID, OWNERS_COLLECTION_ID, ID, Query, isAppwriteConfigured } from '@/lib/appwrite';

export async function POST(request: NextRequest) {
  try {
    // Check if Appwrite is configured
    if (!isAppwriteConfigured()) {
      return NextResponse.json({
        success: true,
        message: 'Appwrite not configured, using localStorage',
        usingLocalStorage: true
      });
    }

    const body = await request.json();
    const { role, profileData } = body;

    if (!profileData?.userId) {
      return NextResponse.json({ error: 'Missing userId in profile data' }, { status: 400 });
    }

    if (!role || !profileData) {
      return NextResponse.json({ error: 'Missing role or profile data' }, { status: 400 });
    }

    const collectionId = role === 'driver' ? DRIVERS_COLLECTION_ID : OWNERS_COLLECTION_ID;

    if (!collectionId) {
      return NextResponse.json({
        success: true,
        message: 'Collection not configured, using localStorage',
        usingLocalStorage: true
      });
    }

    try {
      // Check if user already exists
      const existingUsers = await databases.listDocuments(
        DATABASE_ID,
        collectionId,
        [Query.equal('userId', profileData.userId)]
      );

      if (existingUsers.documents.length > 0) {
        // Update existing user
        const documentId = existingUsers.documents[0].$id;
        await databases.updateDocument(
          DATABASE_ID,
          collectionId,
          documentId,
          {
            ...profileData,
            updatedAt: new Date().toISOString(),
          }
        );
        return NextResponse.json({ success: true, documentId, updated: true });
      } else {
        // Create new user
        const document = await databases.createDocument(
          DATABASE_ID,
          collectionId,
          ID.unique(),
          {
            userId: profileData.userId,
            role: role,
            ...profileData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        );
        return NextResponse.json({ success: true, documentId: document.$id, created: true });
      }
    } catch (appwriteError: any) {
      console.error('Appwrite error:', appwriteError);
      // Return success anyway, localStorage will be used
      return NextResponse.json({
        success: true,
        message: 'Appwrite error, using localStorage',
        usingLocalStorage: true,
        error: appwriteError.message
      });
    }
  } catch (error: any) {
    console.error('Sync error:', error);
    // Don't fail completely, localStorage will be used
    return NextResponse.json({
      success: true,
      message: 'Sync failed, using localStorage',
      usingLocalStorage: true,
      error: error.message
    });
  }
}

