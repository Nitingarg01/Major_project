import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing performance API...');
    
    const session = await auth();
    console.log('Session:', { hasSession: !!session, hasUserId: !!session?.user?.id });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Test database connection
    const { db } = await connectToDatabase();
    console.log('Database connected successfully');
    
    // Test collections exist
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Test if performances collection exists
    const performancesExists = collections.some(c => c.name === 'performances');
    console.log('Performances collection exists:', performancesExists);
    
    // Test ObjectId creation
    const testObjectId = new ObjectId(session.user.id);
    console.log('ObjectId created successfully:', testObjectId);
    
    return NextResponse.json({
      success: true;
      message: 'All tests passed';
      data: {
        hasSession: !!session;
        userId: session.user.id;
        dbConnected: true;
        collectionsCount: collections.length;
        performancesExists
      }
    })
    
  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json({
      success: false;
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}