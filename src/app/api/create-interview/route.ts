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

// Import ReliableAIService for robust question generation
async function generateQuestionsImmediately(interviewData: any) {
    try {
        const ReliableAIService = await import('@/lib/reliableAIService');
        const EnhancedCompanyIntelligenceService = await import('@/lib/enhancedCompanyIntelligence');
        
        const aiService = ReliableAIService.default.getInstance();
        const companyIntelligence = EnhancedCompanyIntelligenceService.default.getInstance();
        
        console.log('🚀 Generating questions with Reliable AI Service...');
        
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
            const technicalQuestions = await aiService.generateInterviewQuestions({
                jobTitle: interviewData.jobTitle || 'Software Engineer',
                companyName: interviewData.companyName,
                skills: interviewData.skills || [],
                interviewType: 'technical',
                experienceLevel: interviewData.experienceLevel || 'mid',
                numberOfQuestions: 8,
                companyIntelligence: enhancedCompanyData?.company_data
            });

            // Behavioral Questions
            const behavioralQuestions = await aiService.generateInterviewQuestions({
                jobTitle: interviewData.jobTitle || 'Software Engineer',
                companyName: interviewData.companyName,
                skills: interviewData.skills || [],
                interviewType: 'behavioral',
                experienceLevel: interviewData.experienceLevel || 'mid',
                numberOfQuestions: 6,
                companyIntelligence: enhancedCompanyData?.company_data
            });

            // DSA Problems
            const dsaProblems = await aiService.generateDSAProblems(
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
            const dsaProblems = await aiService.generateDSAProblems(
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
            const questions = await aiService.generateInterviewQuestions({
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
        console.log("🎯 CREATE INTERVIEW API - Starting");
        
        // Simple session validation
        const session = await auth();
        
        if (!session?.user?.id) {
            console.log("❌ No valid session found");
            return NextResponse.json(
                { error: "Please sign in to create an interview." },
                { status: 401 }
            );
        }

        console.log("✅ AUTHENTICATED USER:", session.user.id);
        
        const body = await request.json();
        const { 
            id, 
            jobDesc, 
            skills, 
            companyName, 
            projectContext, 
            workExDetails, 
            jobTitle, 
            experienceLevel, 
            interviewType,
            selectedRounds,
            estimatedDuration,
            difficultyPreference,
            companyIntelligence,
            roundConfigs
        } = body;

        // ALWAYS use the authenticated session user ID for security
        const userId = session.user.id;
        
        console.log("🛡️ Using authenticated user ID:", userId);

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
            userId: userId,
            jobDesc,
            skills,
            jobTitle,
            companyName,
            projectContext: projectContext ?? [],
            workExDetails: workExDetails ?? [],
            experienceLevel: experienceLevel ?? 'mid',
            interviewType: interviewType ?? 'mixed',
            selectedRounds: selectedRounds ?? ['technical', 'behavioral'],
            estimatedDuration: estimatedDuration ?? 60,
            difficultyPreference: difficultyPreference ?? 'adaptive',
            companyIntelligence: companyIntelligence,
            roundConfigs: roundConfigs,
            createdAt: new Date(),
            status: 'generating'
        };

        // Create interview first
        const interviewResult = await db.collection("interviews").insertOne(interviewData);
        console.log('✅ Interview record created for user:', session.user.id);

        // Generate questions immediately
        const questions = await generateQuestionsImmediately(interviewData);
        
        // Store questions in database
        const questionsResult = await db.collection("questions").insertOne({
            questions: questions,
            answers: [],
            interviewId: interviewResult.insertedId.toString(),
            userId: session.user.id,
            metadata: {
                generatedAt: new Date(),
                questionType: 'reliable-ai',
                averagePoints: questions.reduce((sum, q) => sum + (q.points || 15), 0) / questions.length,
                service: 'reliable-ai'
            }
        });

        // Update interview with questions reference and mark as ready
        await db.collection("interviews").findOneAndUpdate(
            { _id: interviewResult.insertedId },
            {
                $set: {
                    questions: questionsResult.insertedId,
                    status: 'ready',
                    questionStats: {
                        totalQuestions: questions.length,
                        averageTimeLimit: questions.reduce((sum, q) => sum + (q.timeLimit || 8), 0) / questions.length,
                        totalPoints: questions.reduce((sum, q) => sum + (q.points || 15), 0)
                    }
                }
            }
        );

        console.log('🎉 Interview creation completed successfully for user:', session.user.id);

        return NextResponse.json(
            { 
                message: "Interview created and ready to start!", 
                id: interviewResult.insertedId,
                status: 'ready',
                questionsCount: questions.length,
                averagePoints: questions.reduce((sum, q) => sum + (q.points || 15), 0) / questions.length,
                totalPoints: questions.reduce((sum, q) => sum + (q.points || 15), 0),
                service: 'reliable-ai',
                userId: session.user.id
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