import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import client from '@/lib/db';
import { ObjectId } from 'mongodb';

// GET - Fetch user's interviews
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = client.db('Cluster0');
    const interviews = await db
      .collection('interviews')
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ 
      interviews: interviews.map(interview => ({
        ...interview,
        _id: interview._id.toString()
      }))
    });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json({ error: 'Failed to fetch interviews' }, { status: 500 });
  }
}
