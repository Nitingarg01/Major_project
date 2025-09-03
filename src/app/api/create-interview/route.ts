import client from "@/lib/db";
import { ObjectId } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";

// Helper function for question counts
function getQuestionCountForType(interviewType: string): number {
  switch (interviewType) {
    case 'mixed': return 20;
    case 'technical': return 15;
    case 'behavioral': return 12;
    case 'aptitude': return 18;
    case 'dsa': return 14;
    default: return 15;
  }
}

// Import AI model for immediate question generation
async function generateQuestionsImmediately(interviewData: any) {
    try {
        const { aiInterviewModel } = await import('@/lib/aimodel')
        
        let resumeContent = '';
        if (interviewData.projectContext?.length > 0 || interviewData.workExDetails?.length > 0) {
            resumeContent = `Projects: ${interviewData.projectContext?.join(', ') || 'None'}\nWork Experience: ${interviewData.workExDetails?.join(', ') || 'None'}`;
        }

        console.log('🤖 Generating questions with AI...');
        
        const questions = await aiInterviewModel.generateInterviewQuestions({
            jobTitle: interviewData.jobTitle || 'Software Engineer',
            companyName: interviewData.companyName,
            skills: interviewData.skills || [],
            jobDescription: interviewData.jobDesc || '',
            experienceLevel: interviewData.experienceLevel || 'mid',
            interviewType: interviewData.interviewType || 'mixed',
            resumeContent: resumeContent || undefined,
            numberOfQuestions: this.getQuestionCountForType(interviewData.interviewType || 'mixed')
        });

        // Convert to the format expected by the database
        const formattedQuestions = questions.map(q => ({
            question: q.question,
            expectedAnswer: q.expectedAnswer,
            difficulty: q.difficulty,
            category: q.category,
            points: q.points
        }));

        console.log('✅ Questions generated successfully');
        return formattedQuestions;
        
    } catch (error) {
        console.error('❌ Error generating questions:', error);
        // Return some default questions as fallback
        return [
            {
                question: "Tell me about yourself and your background in software development.",
                expectedAnswer: "A good answer should cover relevant experience, skills, and career goals.",
                difficulty: "easy",
                category: "behavioral",
                points: 10
            },
            {
                question: "What interests you about this role and our company?",
                expectedAnswer: "Should show research about the company and genuine interest in the position.",
                difficulty: "easy", 
                category: "behavioral",
                points: 10
            }
        ];
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, jobDesc, skills, companyName, projectContext, workExDetails, jobTitle, experienceLevel, interviewType } = body

        if (!jobDesc || !companyName || !skills || skills.length === 0) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        console.log('🚀 Creating interview with one-click generation...');

        const dbClient = client;
        const db = dbClient.db();

        const interviewData = {
            userId: id,
            jobDesc,
            skills,
            jobTitle,
            companyName,
            projectContext: projectContext ?? [],
            workExDetails: workExDetails ?? [],
            experienceLevel: experienceLevel ?? 'mid',
            interviewType: interviewType ?? 'mixed',
            createdAt: new Date(),
            status: 'generating'
        };

        // Create interview first
        const interviewResult = await db.collection("interviews").insertOne(interviewData);
        console.log('✅ Interview record created');

        // Generate questions immediately (no background jobs!)
        const questions = await generateQuestionsImmediately(interviewData);
        
        // Store questions in database
        const questionsResult = await db.collection("questions").insertOne({
            questions: questions,
            answers: [],
            interviewId: interviewResult.insertedId.toString(),
        });

        // Update interview with questions reference and mark as ready
        await db.collection("interviews").findOneAndUpdate(
            { _id: interviewResult.insertedId },
            {
                $set: {
                    questions: questionsResult.insertedId,
                    status: 'ready'
                }
            }
        );

        console.log('🎉 One-click interview creation completed successfully!');

        return NextResponse.json(
            { 
                message: "Interview created and ready to start!", 
                id: interviewResult.insertedId,
                status: 'ready',
                questionsCount: questions.length
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("❌ Error in one-click interview creation:", error);
        return NextResponse.json(
            {
                error: "Failed to create interview",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        )
    }
}