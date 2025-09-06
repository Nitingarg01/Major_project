import client from "@/lib/db";
import { auth } from "@/app/auth";
import { ObjectId } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";

// Helper function for question counts (increased for HARD mode)
function getQuestionCountForType(interviewType: string): number {
  switch (interviewType) {
    case 'mixed': return 25; // Increased for more challenge
    case 'technical': return 20; // Increased
    case 'behavioral': return 18; // Increased
    case 'aptitude': return 22; // Increased
    case 'dsa': return 15; // Increased
    default: return 20;
  }
}

// Import EmergentLLMService for reliable question generation
async function generateQuestionsImmediately(interviewData: any) {
    try {
        const EmergentLLMService = await import('@/lib/emergentLLMService');
        const EnhancedCompanyIntelligenceService = await import('@/lib/enhancedCompanyIntelligence');
        
        const emergentLLMService = EmergentLLMService.default.getInstance();
        const companyIntelligence = EnhancedCompanyIntelligenceService.default.getInstance();
        
        console.log('🚀 Generating questions with Emergent LLM Service...');
        
        // Get enhanced company intelligence
        const enhancedCompanyData = await companyIntelligence.getEnhancedCompanyIntelligence(
            interviewData.companyName,
            interviewData.jobTitle || 'Software Engineer'
        );

        console.log('📊 Company intelligence gathered for', interviewData.companyName);
        
        let allQuestions: any[] = [];
        
        // Generate questions based on interview type
        if (interviewData.interviewType === 'mixed') {
            // Technical Questions
            const technicalQuestions = await emergentLLMService.generateInterviewQuestions({
                jobTitle: interviewData.jobTitle || 'Software Engineer',
                companyName: interviewData.companyName,
                skills: interviewData.skills || [],
                interviewType: 'technical',
                experienceLevel: interviewData.experienceLevel || 'mid',
                numberOfQuestions: 8,
                companyIntelligence: enhancedCompanyData?.company_data
            });

            // Behavioral Questions
            const behavioralQuestions = await emergentLLMService.generateInterviewQuestions({
                jobTitle: interviewData.jobTitle || 'Software Engineer',
                companyName: interviewData.companyName,
                skills: interviewData.skills || [],
                interviewType: 'behavioral',
                experienceLevel: interviewData.experienceLevel || 'mid',
                numberOfQuestions: 6,
                companyIntelligence: enhancedCompanyData?.company_data
            });

            // DSA Problems
            const dsaProblems = await emergentLLMService.generateDSAProblems(
                interviewData.companyName,
                getDSADifficulty(interviewData.experienceLevel),
                6
            );

            allQuestions = [
                ...technicalQuestions,
                ...behavioralQuestions,
                ...dsaProblems.map(p => ({
                    question: p.title,
                    expectedAnswer: p.description,
                    difficulty: p.difficulty,
                    category: 'dsa',
                    points: getDSAPoints(p.difficulty),
                    timeLimit: 30,
                    provider: 'emergent',
                    model: 'gpt-4o-mini',
                    evaluationCriteria: ['Problem Solving', 'Code Quality', 'Algorithm Understanding'],
                    tags: ['dsa', 'coding', interviewData.companyName],
                    problemData: p
                }))
            ];
        } else if (interviewData.interviewType === 'dsa') {
            const dsaProblems = await emergentLLMService.generateDSAProblems(
                interviewData.companyName,
                getDSADifficulty(interviewData.experienceLevel),
                8
            );

            allQuestions = dsaProblems.map(p => ({
                question: p.title,
                expectedAnswer: p.description,
                difficulty: p.difficulty,
                category: 'dsa',
                points: getDSAPoints(p.difficulty),
                timeLimit: 45,
                provider: 'emergent',
                model: 'gpt-4o-mini',
                evaluationCriteria: ['Problem Solving', 'Code Quality', 'Algorithm Understanding'],
                tags: ['dsa', 'coding', interviewData.companyName],
                problemData: p
            }));
        } else {
            // Single type interview (technical, behavioral, or aptitude)
            const questions = await emergentLLMService.generateInterviewQuestions({
                jobTitle: interviewData.jobTitle || 'Software Engineer',
                companyName: interviewData.companyName,
                skills: interviewData.skills || [],
                interviewType: interviewData.interviewType as 'technical' | 'behavioral' | 'aptitude',
                experienceLevel: interviewData.experienceLevel || 'mid',
                numberOfQuestions: getQuestionCountForType(interviewData.interviewType || 'technical'),
                companyIntelligence: enhancedCompanyData?.company_data
            });

            allQuestions = questions.map(q => ({
                question: q.question,
                expectedAnswer: q.expectedAnswer,
                difficulty: q.difficulty,
                category: q.category,
                points: q.points || 15,
                timeLimit: q.timeLimit || 8,
                provider: 'emergent',
                model: 'gpt-4o-mini',
                evaluationCriteria: q.evaluationCriteria || ['Technical Knowledge', 'Communication'],
                tags: q.tags || [interviewData.jobTitle, interviewData.companyName]
            }));
        }

        console.log(`✅ ${allQuestions.length} questions generated successfully with Emergent LLM`);
        return allQuestions;
        
    } catch (error) {
        console.error('❌ Error generating questions:', error);
        // Return some default questions as fallback
        return [
            {
                question: "Tell me about your experience with software development and how you approach solving complex technical problems.",
                expectedAnswer: "A comprehensive answer covering technical experience, problem-solving methodology, examples of complex problems solved, and lessons learned from challenging projects.",
                difficulty: "medium",
                category: "technical",
                points: 15,
                timeLimit: 8
            },
            {
                question: "Describe a situation where you had to work with a difficult team member. How did you handle it and what was the outcome?",
                expectedAnswer: "Should demonstrate interpersonal skills, conflict resolution, communication strategies, and professional growth from the experience.",
                difficulty: "medium", 
                category: "behavioral",
                points: 12,
                timeLimit: 6
            }
        ];
    }
}

// Helper function for DSA difficulty
function getDSADifficulty(experienceLevel: string): 'easy' | 'medium' | 'hard' {
    switch (experienceLevel) {
        case 'entry': return 'easy';
        case 'mid': return 'medium';
        case 'senior': return 'hard';
        default: return 'medium';
    }
}

// Helper function for DSA points
function getDSAPoints(difficulty: string): number {
    switch (difficulty) {
        case 'easy': return 15;
        case 'medium': return 25;
        case 'hard': return 40;
        default: return 20;
    }
}

export async function POST(request: NextRequest) {
    try {
        // Enhanced authentication with retry mechanism
        let session;
        let authAttempts = 0;
        const maxAuthAttempts = 3;
        
        while (authAttempts < maxAuthAttempts) {
            try {
                session = await auth()
                if (session?.user?.id) {
                    break; // Valid session found
                }
                authAttempts++;
                if (authAttempts < maxAuthAttempts) {
                    console.log(`⚠️ Session validation attempt ${authAttempts}/${maxAuthAttempts} failed, retrying...`);
                    await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retry
                }
            } catch (authError) {
                console.error("❌ Auth error:", authError);
                authAttempts++;
                if (authAttempts < maxAuthAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        }
        
        if (!session?.user?.id) {
            console.log("❌ Authentication failed after", maxAuthAttempts, "attempts")
            return NextResponse.json(
                { error: "Session expired. Please sign in again." },
                { status: 401 }
            );
        }

        console.log("✅ Authenticated user:", session.user.id)
        
        const body = await request.json()
        const { id, jobDesc, skills, companyName, projectContext, workExDetails, jobTitle, experienceLevel, interviewType } = body

        // More flexible user ID validation - use session user ID if no ID provided
        const userId = id || session.user.id;
        
        // Verify that the authenticated user matches the request (but be more lenient)
        if (id && session.user.id !== id) {
            console.log("❌ User ID mismatch:", session.user.id, "vs", id)
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            );
        }

        if (!jobDesc || !companyName || !skills || skills.length === 0) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        console.log('🚀 Creating interview with reliable question generation...');

        const dbClient = client;
        const db = dbClient.db();

        const interviewData = {
            userId: userId, // Use the resolved userId
            jobDesc,
            skills,
            jobTitle,
            companyName,
            projectContext: projectContext ?? [],
            workExDetails: workExDetails ?? [],
            experienceLevel: experienceLevel ?? 'mid',
            interviewType: interviewType ?? 'mixed',
            difficultyLevel: 'adaptive', // Adaptive difficulty based on experience
            createdAt: new Date(),
            status: 'generating'
        };

        // Create interview first
        const interviewResult = await db.collection("interviews").insertOne(interviewData);
        console.log('✅ Interview record created for user:', session.user.id);

        // Generate questions immediately (no background jobs!)
        const questions = await generateQuestionsImmediately(interviewData);
        
        // Store questions in database
        const questionsResult = await db.collection("questions").insertOne({
            questions: questions,
            answers: [],
            interviewId: interviewResult.insertedId.toString(),
            difficultyLevel: 'adaptive',
            userId: session.user.id, // Add user ID for security
            metadata: {
                generatedAt: new Date(),
                difficultyLevel: 'adaptive',
                questionType: 'emergent-llm',
                averagePoints: questions.reduce((sum, q) => sum + (q.points || 15), 0) / questions.length,
                service: 'emergent-llm'
            }
        });

        // Update interview with questions reference and mark as ready
        await db.collection("interviews").findOneAndUpdate(
            { _id: interviewResult.insertedId },
            {
                $set: {
                    questions: questionsResult.insertedId,
                    status: 'ready',
                    difficultyLevel: 'adaptive',
                    questionStats: {
                        totalQuestions: questions.length,
                        averageDifficulty: 'adaptive',
                        averageTimeLimit: questions.reduce((sum, q) => sum + (q.timeLimit || 8), 0) / questions.length,
                        totalPoints: questions.reduce((sum, q) => sum + (q.points || 15), 0)
                    }
                }
            }
        );

        console.log('🎉 One-click interview creation completed successfully for user:', session.user.id);

        return NextResponse.json(
            { 
                message: "Interview created and ready to start!", 
                id: interviewResult.insertedId,
                status: 'ready',
                questionsCount: questions.length,
                difficultyLevel: 'ADAPTIVE',
                averagePoints: questions.reduce((sum, q) => sum + (q.points || 15), 0) / questions.length,
                totalPoints: questions.reduce((sum, q) => sum + (q.points || 15), 0),
                service: 'emergent-llm',
                userId: session.user.id // Include for verification
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("❌ Error in interview creation:", error);
        
        // Don't expose internal errors that might compromise security
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const isAuthError = errorMessage.includes('auth') || errorMessage.includes('session');
        
        return NextResponse.json(
            {
                error: isAuthError ? "Authentication error" : "Failed to create interview",
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            },
            { status: isAuthError ? 401 : 500 }
        )
    }
}