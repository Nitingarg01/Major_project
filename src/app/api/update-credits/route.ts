import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import client from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, amount = 1 } = body;

    const db = client.db();
    
    // Get current user data
    const user = await db.collection('users').findOne({
      email: session.user.email
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // For now, we'll maintain unlimited access by always returning high credit count
    const updatedUser = await db.collection('users').findOneAndUpdate(
      { email: session.user.email },
      { 
        $set: { 
          credits: 999, // High credit count for unlimited access
          lastUpdated: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return NextResponse.json(
      { credits: 999, message: "Access granted for premium features!" },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating user access:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}