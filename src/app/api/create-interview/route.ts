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

// Import Preference-Based Question Generator for enhanced user-customized questions
async function generateQuestionsImmediately(interviewData: any, userId: string) {
    try {
        const { preferenceBasedQuestionGenerator } = await import('@/lib/preferenceBasedQuestionGenerator');
        const { userPreferencesService } = await import('@/lib/userPreferencesService');
        
        console.log('🎯 Generating preference-based questions with company-unique DSA problems...');
        
        // Get user preferences
        const userPreferences = await userPreferencesService.getUserPreferences(userId);
        console.log('📊 User preferences loaded for question generation');
        
        // Generate questions using preference-based system
        const questionResponse = await preferenceBasedQuestionGenerator.generatePreferenceBasedQuestions({
            userPreferences,
            jobTitle: interviewData.jobTitle || 'Software Engineer',
            companyName: interviewData.companyName,
            skills: interviewData.skills || [],
            interviewType: interviewData.interviewType || 'mixed',
            experienceLevel: interviewData.experienceLevel || 'mid',
            numberOfQuestions: getQuestionCountForType(interviewData.interviewType || 'mixed'),
            companyIntelligence: null,
            forceUniqueGeneration: true
        });

        if (!questionResponse.success) {
            throw new Error('Preference-based question generation failed');
        }

        console.log(`✅ Generated ${questionResponse.questions.length} preference-aligned questions`);
        console.log(`🔥 Company-unique DSA problems: ${questionResponse.metadata.uniqueDSAProblems}`);
        console.log(`🎯 Preference alignment: ${questionResponse.metadata.preferenceAlignment}%`);

        const allQuestions = questionResponse.data.map((q: any) => ({
            id: q.id,
            question: q.question,
            expectedAnswer: q.expectedAnswer,
            difficulty: q.difficulty || 'medium',
            category: q.category,
            points: q.points || 15,
            timeLimit: q.timeLimit || 8,
            provider: questionResponse.provider,
            model: questionResponse.model,
            evaluationCriteria: q.evaluationCriteria || ['Technical Knowledge', 'Communication', 'Problem Solving'],
            tags: q.tags || [interviewData.jobTitle, interviewData.companyName],
            hints: q.hints || [],
            companyRelevance: q.companyRelevance || 8
        }));

        console.log(`✅ ${allQuestions.length} questions generated successfully with ${questionResponse.provider} in ${questionResponse.processingTime}ms`);
        return allQuestions;
        
    } catch (error) {
        console.error('❌ Error generating questions with Smart AI:', error);
        // Return some default Smart AI enhanced questions as fallback
        return [
            {
                id: 'smart-fallback-1',
                question: "Tell me about your experience with software development and how you approach solving complex technical problems using modern frameworks and tools.",
                expectedAnswer: "A comprehensive answer covering technical expertise, problem-solving methodology, specific examples of complex problems solved, modern development practices, and lessons learned from challenging projects. Should demonstrate deep technical understanding and practical application.",
                difficulty: "medium",
                category: "technical",
                points: 15,
                timeLimit: 8,
                provider: 'fallback',
                model: 'smart-ai-fallback',
                evaluationCriteria: ['Technical Depth', 'Problem Solving', 'Modern Practices', 'Communication'],
                tags: ['technical', 'problem-solving', 'modern-development'],
                hints: ['Think about specific frameworks and tools', 'Include real-world examples'],
                companyRelevance: 7
            },
            {
                id: 'smart-fallback-2',
                question: "Describe a challenging situation where you had to collaborate with a difficult team member while working on a high-priority project. How did you handle the interpersonal dynamics and ensure project success?",
                expectedAnswer: "Should demonstrate advanced interpersonal skills, conflict resolution strategies, leadership qualities, effective communication under pressure, and ability to maintain project momentum while addressing team dynamics professionally.",
                difficulty: "medium", 
                category: "behavioral",
                points: 12,
                timeLimit: 6,
                provider: 'fallback',
                model: 'smart-ai-fallback',
                evaluationCriteria: ['Leadership', 'Communication', 'Conflict Resolution', 'Team Collaboration'],
                tags: ['behavioral', 'teamwork', 'leadership', 'communication'],
                hints: ['Focus on your role in resolution', 'Highlight project outcomes'],
                companyRelevance: 8
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
                questionType: 'smart-ai',
                averagePoints: questions.reduce((sum, q) => sum + (q.points || 15), 0) / questions.length,
                service: 'smart-ai',
                provider: questions[0]?.provider || 'unknown',
                model: questions[0]?.model || 'unknown',
                processingMethod: 'intelligent-routing'
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
                service: 'smart-ai',
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