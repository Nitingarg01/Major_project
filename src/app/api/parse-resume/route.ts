import { extractTextFromPDF } from "@/lib/pdfParse";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { modelUsed } from "@/constants/constants";
import { error } from "console";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

export async function POST(request: NextRequest) {
    console.log("✅ Received POST request to /api/parse-resume");

    try {
        const contentType = request.headers.get("content-type") ?? "";
        if (!contentType.includes("multipart/form-data")) {
            console.log("❌ Invalid Content Type:", contentType)
            return NextResponse.json({
                error: "Expected multipart/form-data",
                status: 400
            }, { status: 400 })
        }

        const formData = await request.formData();
        const file = formData.get("resume") as File;

        if (!file) {
            return NextResponse.json({ 
                error: "No resume file provided",
                status: 400
            }, { status: 400 })
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({
                error: `Unsupported file type: ${file.type}. Please upload PDF, DOC, or DOCX files.`,
                status: 400
            }, { status: 400 })
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({
                error: "File size too large. Maximum allowed size is 5MB.",
                status: 400
            }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        console.log(`📄 Processing ${file.name} (${file.size} bytes)`);

        const textContent = await extractTextFromPDF(buffer);
        console.log(`📝 Extracted text length: ${textContent.length} characters`)

        if (!textContent || textContent.length < 50) {
            return NextResponse.json({
                error: "Unable to extract meaningful content from the resume. Please ensure the file is not corrupted or password-protected.",
                status: 400
            }, { status: 400 })
        }

        const promptForDetails = `;
You are an expert resume parser for tech job candidates. Extract structured information from the following resume text.

Return ONLY a valid JSON object with these exact fields:

{
  "skills": ["list of technical skills, programming languages, frameworks, tools, etc."],
  "projects": ["brief description of each project mentioned"],
  "workex": ["brief description of each work experience with company and role"]
}

Focus on:
- Technical skills: programming languages, frameworks, databases, cloud platforms, tools
- Projects: name and brief technical description 
- Work experience: company, role, key responsibilities

Resume content:
${textContent.substring(0, 4000)}
`;

        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY not configured");
        }

        const model = genAI.getGenerativeModel({
            model: modelUsed,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000
            }
        })

        const result = await model.generateContent(promptForDetails);
        const text = result.response.text();
        console.log("🧠 Gemini response received");

        try {
            // Clean the response and parse JSON
            const cleaned = text.replace(/```json\s*/g, '').replace(/\s*```/g, '').trim();
            const extracted = JSON.parse(cleaned);

            // Validate the parsed data structure
            if (!extracted.skills || !Array.isArray(extracted.skills)) {
                extracted.skills = [];
            }
            if (!extracted.projects || !Array.isArray(extracted.projects)) {
                extracted.projects = [];
            }
            if (!extracted.workex || !Array.isArray(extracted.workex)) {
                extracted.workex = [];
            }

            console.log(`✅ Successfully parsed resume: ${extracted.skills.length} skills, ${extracted.projects.length} projects, ${extracted.workex.length} work experiences`);

            return NextResponse.json({ 
                message: "Resume parsed successfully", 
                data: extracted,
                status: 200
            }, { status: 200 })

        } catch (parseError) {
            console.error("❌ Error parsing Gemini JSON response:", parseError);
            console.error("Raw response:", text);
            
            return NextResponse.json({
                error: "Failed to parse AI response. Please try uploading a different resume format.",
                status: 500,
                details: parseError instanceof Error ? parseError.message : "JSON parse error"
            }, { status: 500 });
        }

    } catch (error) {
        console.error("❌ Error in resume parser:", error);
        return NextResponse.json({
            error: "Resume parsing failed. Please try again or contact support.",
            status: 500,
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}

export async function GET() {
  return new Response("Hello from GET", { status: 200 });
}