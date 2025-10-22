import { extractTextFromPDF } from "@/lib/pdfParse";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { modelUsed } from "@/constants/constants";
import { auth } from "@/app/auth";
import client from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

interface ResumeAnalysisResult {
  overallScore: number;
  breakdown: {
    structure: number;
    skills: number;
    experience: number;
    projects: number;
    education: number;
    language: number;
  };
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  detailedFeedback: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({
        error: "Expected multipart/form-data",
        status: 400
      }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("resume") as File;
    const targetRole = formData.get("targetRole") as string;

    if (!file) {
      return NextResponse.json({ 
        error: "No resume file provided",
        status: 400
      }, { status: 400 });
    }

    if (!targetRole) {
      return NextResponse.json({ 
        error: "Target role is required",
        status: 400
      }, { status: 400 });
    }

    // Validate file type and size
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: `Unsupported file type: ${file.type}`,
        status: 400
      }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({
        error: "File size too large. Maximum allowed size is 5MB.",
        status: 400
      }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    console.log(`📄 Analyzing resume: ${file.name} for role: ${targetRole}`);

    const textContent = await extractTextFromPDF(buffer);
    
    if (!textContent || textContent.length < 50) {
      return NextResponse.json({
        error: "Unable to extract meaningful content from the resume.",
        status: 400
      }, { status: 400 });
    }

    const analysisPrompt = `;
You are an expert resume analyst and career coach. Analyze the following resume for a ${targetRole} position and provide comprehensive feedback.

RESUME CONTENT:
${textContent.substring(0, 5000)}

TARGET ROLE: ${targetRole}

Please provide a detailed analysis with scoring in the following format. Be thorough and constructive in your feedback.

SCORING CRITERIA (Total 100 points):
1. Structure & Formatting (15 points): Layout, organization, length, sections, readability
2. Skills & Technical Competencies (25 points): Relevance to role, depth, currency, certifications
3. Work Experience Relevance (25 points): Role alignment, impact, achievements, progression
4. Projects & Achievements (20 points): Quality, technical depth, business impact, innovation
5. Education & Certifications (10 points): Relevance, credibility, continuous learning
6. Grammar & Language Quality (5 points): Professional writing, clarity, consistency

Return ONLY a valid JSON object with this EXACT structure:
{
  "overallScore": number (0-100),
  "breakdown": {
    "structure": number (0-15),
    "skills": number (0-25),
    "experience": number (0-25),
    "projects": number (0-20),
    "education": number (0-10),
    "language": number (0-5)
  },
  "strengths": [
    "Specific strength 1",
    "Specific strength 2", 
    "Specific strength 3"
  ],
  "improvements": [
    "Specific improvement area 1",
    "Specific improvement area 2",
    "Specific improvement area 3"
  ],
  "recommendations": [
    "Actionable recommendation 1 for ${targetRole}",
    "Actionable recommendation 2 for ${targetRole}",
    "Actionable recommendation 3 for ${targetRole}"
  ],
  "detailedFeedback": "Comprehensive paragraph providing overall assessment, key observations, and strategic advice for improving the resume for ${targetRole} positions. Be specific and actionable."
}

Focus on:
- How well the resume aligns with ${targetRole} requirements
- Specific, actionable improvements
- Industry best practices for ${targetRole}
- Competitive positioning in the job market
- ATS-friendly formatting and keywords
`;

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const model = genAI.getGenerativeModel({
      model: modelUsed,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000
      }
    });

    const result = await model.generateContent(analysisPrompt);
    const text = result.response.text();
    
    try {
      const cleaned = text.replace(/```json\s*/g, '').replace(/\s*```/g, '').trim();
      const analysisResult: ResumeAnalysisResult = JSON.parse(cleaned);

      // Validate and ensure proper structure
      const validatedResult = {
        overallScore: Math.min(100, Math.max(0, analysisResult.overallScore || 0)),
        breakdown: {
          structure: Math.min(15, Math.max(0, analysisResult.breakdown?.structure || 0)),
          skills: Math.min(25, Math.max(0, analysisResult.breakdown?.skills || 0)),
          experience: Math.min(25, Math.max(0, analysisResult.breakdown?.experience || 0)),
          projects: Math.min(20, Math.max(0, analysisResult.breakdown?.projects || 0)),
          education: Math.min(10, Math.max(0, analysisResult.breakdown?.education || 0)),
          language: Math.min(5, Math.max(0, analysisResult.breakdown?.language || 0))
        },
        strengths: analysisResult.strengths || [],
        improvements: analysisResult.improvements || [],
        recommendations: analysisResult.recommendations || [],
        detailedFeedback: analysisResult.detailedFeedback || "Analysis completed successfully."
      };

      // Store in database
      const dbClient = client;
      const db = dbClient.db();
      
      const analysisRecord = {
        id: uuidv4(),
        userId: session.user.id,
        fileName: file.name,
        targetRole: targetRole,
        ...validatedResult,
        createdAt: new Date()
      };

      await db.collection("resumeAnalyses").insertOne(analysisRecord);

      console.log(`✅ Resume analysis completed. Score: ${validatedResult.overallScore}/100`);

      return NextResponse.json({ 
        message: "Resume analyzed successfully", 
        analysis: analysisRecord,
        status: 200
      }, { status: 200 });

    } catch (parseError) {
      console.error("❌ Error parsing AI analysis response:", parseError);
      console.error("Raw response:", text);
      
      return NextResponse.json({
        error: "Failed to parse analysis results. Please try again.",
        status: 500,
        details: parseError instanceof Error ? parseError.message : "Parse error"
      }, { status: 500 });
    }

  } catch (error) {
    console.error("❌ Error in resume analysis:", error);
    return NextResponse.json({
      error: "Resume analysis failed. Please try again.",
      status: 500,
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Resume Analysis API" }, { status: 200 });
}