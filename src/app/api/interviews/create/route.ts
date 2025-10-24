import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { connectToDatabase } from '@/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import pdfParse from 'pdf-parse';

// Initialize AI clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const resumeFile = formData.get('resume') as File;
    const jobTitle = formData.get('jobTitle') as string;
    const companyName = formData.get('companyName') as string || '';
    const experienceLevel = formData.get('experienceLevel') as string;
    const interviewType = formData.get('interviewType') as string;

    if (!resumeFile || !jobTitle) {
      return NextResponse.json(
        { error: 'Resume and job title are required' },
        { status: 400 }
      );
    }

    // Parse resume PDF
    const resumeBuffer = Buffer.from(await resumeFile.arrayBuffer());
    let resumeText = '';
    
    try {
      const pdfData = await pdfParse(resumeBuffer);
      resumeText = pdfData.text;
    } catch (err) {
      console.error('PDF parsing error:', err);
      return NextResponse.json(
        { error: 'Failed to parse resume PDF' },
        { status: 400 }
      );
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Resume content is too short or unreadable' },
        { status: 400 }
      );
    }

    // Analyze resume with Gemini to extract key information
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const analysisPrompt = `Analyze this resume and extract:
1. Key skills (list top 10)
2. Years of experience
3. Notable projects (list 3-5)
4. Technical expertise areas
5. Soft skills mentioned

Resume:
${resumeText.substring(0, 4000)}

Provide a JSON response with keys: skills, yearsOfExperience, projects, technicalAreas, softSkills`;

    const analysisResult = await model.generateContent(analysisPrompt);
    const analysisText = analysisResult.response.text();
    
    let resumeAnalysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = analysisText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       analysisText.match(/```\s*([\s\S]*?)\s*```/) ||
                       [null, analysisText];
      resumeAnalysis = JSON.parse(jsonMatch[1] || analysisText);
    } catch (err) {
      console.error('Failed to parse resume analysis:', err);
      // Fallback to simple analysis
      resumeAnalysis = {
        skills: [],
        yearsOfExperience: 'Not specified',
        projects: [],
        technicalAreas: [],
        softSkills: []
      };
    }

    // Generate interview questions with Groq
    const questionsPrompt = `You are an expert interviewer. Generate 6 interview questions for a ${jobTitle} position${companyName ? ` at ${companyName}` : ''}.

Candidate Profile:
- Experience Level: ${experienceLevel}
- Interview Type: ${interviewType}
- Key Skills: ${resumeAnalysis.skills?.slice(0, 10).join(', ')}
- Years of Experience: ${resumeAnalysis.yearsOfExperience}
- Technical Areas: ${resumeAnalysis.technicalAreas?.join(', ')}

Generate exactly 6 questions that:
1. Are relevant to the job title and candidate's background
2. Mix behavioral and technical aspects (based on interview type)
3. Progress from easier to more challenging
4. Reference specific skills from their resume when appropriate
5. Are clear and professional

Return ONLY a JSON array of questions with this format:
[
  {
    "question": "Question text here",
    "type": "behavioral" or "technical",
    "difficulty": "easy", "medium", or "hard",
    "expectedPoints": ["key point 1", "key point 2", "key point 3"]
  }
]

Return ONLY the JSON array, no other text.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: questionsPrompt }],
      model: 'mixtral-8x7b-32768',
      temperature: 0.7,
      max_tokens: 2000,
    });

    let questions;
    try {
      const responseText = completion.choices[0]?.message?.content || '[]';
      // Extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       responseText.match(/```\s*([\s\S]*?)\s*```/) ||
                       [null, responseText];
      questions = JSON.parse(jsonMatch[1] || responseText);
      
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid questions format');
      }
    } catch (err) {
      console.error('Failed to parse questions:', err);
      // Fallback questions
      questions = [
        {
          question: `Tell me about your experience with ${resumeAnalysis.skills?.[0] || 'your main technical skill'}.`,
          type: 'technical',
          difficulty: 'easy',
          expectedPoints: ['Technical proficiency', 'Project examples', 'Problem-solving approach']
        },
        {
          question: 'Describe a challenging project you worked on and how you overcame obstacles.',
          type: 'behavioral',
          difficulty: 'medium',
          expectedPoints: ['Problem description', 'Solution approach', 'Results achieved']
        },
        {
          question: `How would you approach ${jobTitle.toLowerCase()} responsibilities at ${companyName || 'a new company'}?`,
          type: 'behavioral',
          difficulty: 'medium',
          expectedPoints: ['Planning', 'Communication', 'Adaptability']
        },
        {
          question: 'Tell me about a time when you had to work with a difficult team member.',
          type: 'behavioral',
          difficulty: 'medium',
          expectedPoints: ['Conflict resolution', 'Communication skills', 'Team collaboration']
        },
        {
          question: `What interests you most about the ${jobTitle} role?`,
          type: 'behavioral',
          difficulty: 'easy',
          expectedPoints: ['Motivation', 'Career goals', 'Company research']
        },
        {
          question: 'Where do you see yourself in the next 3-5 years?',
          type: 'behavioral',
          difficulty: 'easy',
          expectedPoints: ['Career vision', 'Growth mindset', 'Long-term commitment']
        }
      ];
    }

    // Save interview to database
    const { db } = await connectToDatabase();
    const interview = {
      userId: session.user.id,
      jobTitle,
      companyName,
      experienceLevel,
      interviewType,
      resumeText: resumeText.substring(0, 5000), // Store first 5000 chars
      resumeAnalysis,
      questions: questions.map((q: any, index: number) => ({
        ...q,
        order: index + 1,
        response: '',
        feedback: ''
      })),
      status: 'pending',
      createdAt: new Date(),
      currentQuestionIndex: 0
    };

    const result = await db.collection('interviews').insertOne(interview);

    return NextResponse.json({
      success: true,
      interviewId: result.insertedId.toString(),
      questionsCount: questions.length
    });

  } catch (error: any) {
    console.error('Error creating interview:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create interview' },
      { status: 500 }
    );
  }
}
