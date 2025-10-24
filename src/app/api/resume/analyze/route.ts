import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { connectToDatabase } from '@/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pdfParse from 'pdf-parse';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const resumeFile = formData.get('resume') as File;
    const targetRole = formData.get('targetRole') as string;
    const targetCompany = formData.get('targetCompany') as string || '';
    const experienceLevel = formData.get('experienceLevel') as string;

    if (!resumeFile || !targetRole) {
      return NextResponse.json(
        { error: 'Resume and target role are required' },
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

    // Comprehensive AI Analysis with Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const analysisPrompt = `You are an expert resume analyzer and career coach. Analyze this resume for a ${targetRole} position${targetCompany ? ` at ${targetCompany}` : ''}.

Resume Content:
${resumeText.substring(0, 8000)}

Experience Level: ${experienceLevel}

Provide a comprehensive analysis in JSON format with the following structure:

{
  "atsScore": (0-100) - Applicant Tracking System compatibility score,
  "overallAssessment": "good/average/needs improvement",
  "summary": "2-3 sentence overall assessment",
  
  "strengths": [
    "List 4-6 key strengths of this resume"
  ],
  
  "weaknesses": [
    "List 4-6 areas that need improvement"
  ],
  
  "atsAnalysis": {
    "keywords": {
      "score": (0-100),
      "found": ["keywords found in resume"],
      "missing": ["important keywords missing for the role"]
    },
    "formatting": {
      "score": (0-100),
      "issues": ["formatting issues that may affect ATS parsing"]
    },
    "sections": {
      "score": (0-100),
      "present": ["sections found"],
      "missing": ["recommended sections not found"]
    }
  },
  
  "roleSpecificFeedback": {
    "relevance": (0-100),
    "keySkillsMatch": ["skills that match the role"],
    "missingSkills": ["important skills for the role not mentioned"],
    "experienceAlignment": "How well experience aligns with the role",
    "recommendations": ["specific improvements for this role"]
  },
  
  "detailedSuggestions": {
    "content": [
      "Specific content improvement suggestions"
    ],
    "formatting": [
      "Formatting and structure suggestions"
    ],
    "keywords": [
      "Keywords to add for better ATS performance"
    ],
    "impact": [
      "Ways to make achievements more impactful"
    ]
  },
  
  "quickWins": [
    "3-5 quick improvements that can be made immediately"
  ],
  
  "nextSteps": [
    "3-5 actionable next steps to improve the resume"
  ],
  
  "industryStandards": {
    "lengthAssessment": "Assessment of resume length",
    "designQuality": "Assessment of visual presentation",
    "contentDensity": "Assessment of information density"
  }
}

Be specific, actionable, and encouraging. Focus on helping the candidate improve.
Return ONLY valid JSON, no other text.`;

    const result = await model.generateContent(analysisPrompt);
    const analysisText = result.response.text();
    
    let analysis;
    try {
      const jsonMatch = analysisText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       analysisText.match(/```\s*([\s\S]*?)\s*```/) ||
                       [null, analysisText];
      analysis = JSON.parse(jsonMatch[1] || analysisText);
    } catch (err) {
      console.error('Failed to parse AI analysis:', err);
      // Fallback analysis
      analysis = {
        atsScore: 65,
        overallAssessment: 'average',
        summary: 'Your resume shows potential but needs optimization for ATS systems and role-specific requirements.',
        strengths: [
          'Clear professional experience section',
          'Relevant skills listed',
          'Educational background included'
        ],
        weaknesses: [
          'Missing important keywords for the role',
          'Could improve formatting for ATS compatibility',
          'Achievements could be more quantified'
        ],
        atsAnalysis: {
          keywords: {
            score: 60,
            found: ['Basic role-related keywords'],
            missing: ['Industry-specific terminology', 'Technical skills']
          },
          formatting: {
            score: 70,
            issues: ['Use standard section headings', 'Avoid complex formatting']
          },
          sections: {
            score: 65,
            present: ['Experience', 'Education', 'Skills'],
            missing: ['Professional Summary', 'Certifications']
          }
        },
        roleSpecificFeedback: {
          relevance: 70,
          keySkillsMatch: ['General skills applicable to the role'],
          missingSkills: ['Specific tools and technologies'],
          experienceAlignment: 'Experience is somewhat relevant but could be better tailored',
          recommendations: [
            'Add role-specific keywords',
            'Quantify achievements with metrics',
            'Highlight relevant projects'
          ]
        },
        detailedSuggestions: {
          content: [
            'Add a professional summary at the top',
            'Use action verbs to start bullet points',
            'Include metrics and results'
          ],
          formatting: [
            'Use standard fonts (Arial, Calibri)',
            'Keep formatting simple',
            'Use consistent spacing'
          ],
          keywords: [
            'Research job descriptions for the role',
            'Include technical tools and frameworks',
            'Add industry-specific terminology'
          ],
          impact: [
            'Replace "Responsible for" with "Led/Managed/Drove"',
            'Add numbers and percentages',
            'Show business impact'
          ]
        },
        quickWins: [
          'Add a professional summary section',
          'Quantify at least 3 achievements',
          'Update skills section with role-specific keywords',
          'Use consistent formatting throughout',
          'Proofread for typos and grammar'
        ],
        nextSteps: [
          'Research job descriptions for target role',
          'Update resume with relevant keywords',
          'Quantify all major achievements',
          'Get feedback from peers in the industry',
          'Test resume with online ATS checkers'
        ],
        industryStandards: {
          lengthAssessment: 'Appropriate length for experience level',
          designQuality: 'Could be more professional',
          contentDensity: 'Good balance of information'
        }
      };
    }

    // Save analysis to database
    const { db } = await connectToDatabase();
    const analysisDoc = {
      userId: session.user.id,
      fileName: resumeFile.name,
      targetRole,
      targetCompany,
      experienceLevel,
      resumeText: resumeText.substring(0, 10000),
      ...analysis,
      createdAt: new Date()
    };

    const insertResult = await db.collection('resumeAnalyses').insertOne(analysisDoc);

    return NextResponse.json({
      success: true,
      analysisId: insertResult.insertedId.toString(),
      atsScore: analysis.atsScore
    });

  } catch (error: any) {
    console.error('Error analyzing resume:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze resume' },
      { status: 500 }
    );
  }
}
