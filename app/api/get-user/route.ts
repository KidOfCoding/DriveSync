import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, DRIVERS_COLLECTION_ID, OWNERS_COLLECTION_ID, Query, isAppwriteConfigured } from '@/lib/appwrite';

export async function GET(request: NextRequest) {
  try {
    // Check if Appwrite is configured
    if (!isAppwriteConfigured()) {
      return NextResponse.json(null);
    }

    const searchParams = request.nextUrl.searchParams;
    const requestedUserId = searchParams.get('userId');
    const role = searchParams.get('role') as 'driver' | 'owner';

    if (!requestedUserId || !role) {
      return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
    }

    const collectionId = role === 'driver' ? DRIVERS_COLLECTION_ID : OWNERS_COLLECTION_ID;

    if (!collectionId) {
      return NextResponse.json(null);
    }

    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        collectionId,
        [Query.equal('userId', requestedUserId)]
      );

      if (result.documents.length > 0) {
        return NextResponse.json(result.documents[0]);
      }

      return NextResponse.json(null);
    } catch (appwriteError: any) {
      console.error('Appwrite error:', appwriteError);
      return NextResponse.json(null);
    }
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(null);
  }
}

