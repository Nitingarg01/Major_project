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

        const allQuestions = questionResponse.questions.map((q: any) => ({
            id: q.id,
            question: q.question,
            expectedAnswer: q.expectedAnswer,
            difficulty: q.difficulty || 'medium',
            category: q.category,
            points: q.points || 15,
            timeLimit: q.timeLimit || 8,
            provider: q.metadata?.provider || 'preference-based',
            model: q.metadata?.model || 'enhanced-ai',
            evaluationCriteria: q.evaluationCriteria || ['Technical Knowledge', 'Communication', 'Problem Solving'],
            tags: q.tags || [interviewData.jobTitle, interviewData.companyName],
            hints: q.hints || [],
            companyRelevance: q.companyRelevance || 8,
            uniquenessScore: q.uniquenessScore,
            companyContext: q.companyContext,
            preferences: q.preferences
        }));

        console.log(`✅ ${allQuestions.length} preference-based questions generated successfully in ${questionResponse.metadata.generationTime}ms`);
        return allQuestions;
        
    } catch (error) {
        console.error('❌ Error generating preference-based questions:', error);
        // Return enhanced fallback questions
        return [
            {
                id: 'preference-fallback-1',
                question: `Tell me about your experience with software development and how you approach solving complex technical problems at ${interviewData.companyName || 'your target company'}.`,
                expectedAnswer: "A comprehensive answer covering technical expertise, problem-solving methodology, specific examples relevant to the company, modern development practices, and practical application of skills.",
                difficulty: "medium",
                category: "technical",
                points: 15,
                timeLimit: 8,
                provider: 'preference-fallback',
                model: 'enhanced-fallback',
                evaluationCriteria: ['Technical Depth', 'Problem Solving', 'Company Relevance', 'Communication'],
                tags: ['technical', 'problem-solving', interviewData.companyName],
                hints: ['Include company-specific examples', 'Discuss relevant technologies'],
                companyRelevance: 7,
                preferences: {
                    alignsWithUserPrefs: true,
                    preferenceFactors: ['Technical focus', 'Company-specific context']
                }
            },
            {
                id: 'preference-fallback-2',
                question: `Describe a challenging DSA problem you've solved that would be relevant to ${interviewData.companyName || 'your target company'}'s technical challenges.`,
                expectedAnswer: "Should demonstrate algorithmic thinking, problem-solving approach, code implementation skills, and understanding of how the solution applies to real-world business scenarios.",
                difficulty: "medium", 
                category: "dsa",
                points: 20,
                timeLimit: 25,
                provider: 'preference-fallback',
                model: 'enhanced-dsa-fallback',
                evaluationCriteria: ['Algorithmic Thinking', 'Code Quality', 'Business Application', 'Communication'],
                tags: ['dsa', 'algorithms', 'company-specific', interviewData.companyName],
                hints: ['Think about real-world applications', 'Consider company scale'],
                companyRelevance: 8,
                uniquenessScore: 6,
                companyContext: `Relevant to ${interviewData.companyName}'s technical challenges`,
                preferences: {
                    alignsWithUserPrefs: true,
                    preferenceFactors: ['DSA focus', 'Company-unique problems', 'Real-world scenarios']
                }
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

        // Generate questions immediately with user preferences
        const questions = await generateQuestionsImmediately(interviewData, userId);
        
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