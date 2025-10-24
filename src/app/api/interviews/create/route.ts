import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import client from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const jobTitle = formData.get('jobTitle') as string;
    const companyName = formData.get('companyName') as string;
    const interviewType = formData.get('interviewType') as string;
    const experienceLevel = formData.get('experienceLevel') as string;
    const additionalNotes = formData.get('additionalNotes') as string;
    const resumeFile = formData.get('resume') as File | null;

    // Validate required fields
    if (!jobTitle || !companyName || !interviewType || !experienceLevel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let resumeText = null;
    if (resumeFile) {
      // Parse resume (we'll implement this properly later)
      const buffer = await resumeFile.arrayBuffer();
      const text = Buffer.from(buffer).toString('utf-8');
      resumeText = text.substring(0, 5000); // Limit size
    }

    const db = client.db('Cluster0');
    
    // Create interview document
    const interviewId = uuidv4();
    const interview = {
      interviewId,
      userId: session.user.id,
      jobTitle,
      companyName,
      interviewType,
      experienceLevel,
      additionalNotes: additionalNotes || '',
      resumeText,
      status: 'pending',
      createdAt: new Date(),
      questions: [], // Will be generated during interview
      responses: []
    };

    await db.collection('interviews').insertOne(interview);

    return NextResponse.json({ 
      success: true,
      interviewId,
      message: 'Interview created successfully'
    });
  } catch (error) {
    console.error('Error creating interview:', error);
    return NextResponse.json(
      { error: 'Failed to create interview' },
      { status: 500 }
    );
  }
}
