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

// Use Interview Service Manager for enhanced question generation
async function generateQuestionsImmediately(interviewData: any, userId: string) {
    try {
        const { interviewServiceManager } = await import('@/lib/interviewServiceManager');
        
        console.log('🎯 Generating enhanced questions with improved DSA problems...');
        
        // Generate questions using the enhanced service manager
        const questions = await interviewServiceManager.generateInterviewQuestions({
            jobTitle: interviewData.jobTitle || 'Software Engineer',
            companyName: interviewData.companyName,
            skills: interviewData.skills || [],
            interviewType: interviewData.interviewType || 'mixed',
            experienceLevel: interviewData.experienceLevel || 'mid',
            numberOfQuestions: getQuestionCountForType(interviewData.interviewType || 'mixed')
        });

        console.log(`✅ Generated ${questions.length} enhanced questions`);

        const allQuestions = questions.map((q: any) => ({
            id: q.id,
            question: q.question,
            expectedAnswer: q.expectedAnswer,
            difficulty: q.difficulty || 'medium',
            category: q.category,
            points: q.points || 15,
            timeLimit: q.timeLimit || (q.category === 'dsa' ? 45 : 8),
            provider: q.provider || 'interview-service-manager',
            model: q.model || 'enhanced-groq',
            evaluationCriteria: q.evaluationCriteria || ['Technical Knowledge', 'Communication', 'Problem Solving'],
            tags: q.tags || [interviewData.jobTitle, interviewData.companyName],
            hints: q.hints || [],
            companyRelevance: q.companyRelevance || 8,
            dsaProblem: q.dsaProblem || null // Include DSA problem data if present
        }));

        console.log(`✅ ${allQuestions.length} enhanced questions generated successfully`);
        return allQuestions;
        
    } catch (error) {
        console.error('❌ Error generating enhanced questions:', error);
        // Return enhanced fallback questions
        return [
            {
                id: 'enhanced-fallback-1',
                question: `Tell me about your experience with software development and how you approach solving complex technical problems at ${interviewData.companyName || 'your target company'}.`,
                expectedAnswer: "A comprehensive answer covering technical expertise, problem-solving methodology, specific examples relevant to the company, modern development practices, and practical application of skills.",
                difficulty: "medium",
                category: "technical",
                points: 15,
                timeLimit: 8,
                provider: 'enhanced-fallback',
                model: 'groq-fallback',
                evaluationCriteria: ['Technical Depth', 'Problem Solving', 'Company Relevance', 'Communication'],
                tags: ['technical', 'problem-solving', interviewData.companyName],
                hints: ['Include company-specific examples', 'Discuss relevant technologies'],
                companyRelevance: 7
            },
            {
                id: 'enhanced-fallback-2',
                question: `Solve this DSA problem: Two Sum Problem\n\nGiven an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.`,
                expectedAnswer: "Should demonstrate algorithmic thinking, provide a working solution, and analyze time/space complexity.",
                difficulty: "medium", 
                category: "dsa",
                points: 25,
                timeLimit: 45,
                provider: 'enhanced-fallback',
                model: 'dsa-fallback',
                evaluationCriteria: ['Correctness', 'Efficiency', 'Code Quality', 'Edge Cases'],
                tags: ['dsa', 'algorithms', 'array', interviewData.companyName],
                hints: ['Consider using a hash map', 'Think about the time complexity'],
                companyRelevance: 8,
                dsaProblem: {
                    id: 'fallback-two-sum',
                    title: 'Two Sum Problem',
                    difficulty: 'medium',
                    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
                    examples: [
                        {
                            input: 'nums = [2,7,11,15], target = 9',
                            output: '[0,1]',
                            explanation: 'Because nums[0] + nums[1] = 2 + 7 = 9, we return [0, 1].'
                        }
                    ],
                    testCases: [
                        { id: 'test1', input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0,1]' },
                        { id: 'test2', input: 'nums = [3,2,4], target = 6', expectedOutput: '[1,2]' },
                        { id: 'test3', input: 'nums = [3,3], target = 6', expectedOutput: '[0,1]' }
                    ],
                    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9'],
                    topics: ['Array', 'Hash Table'],
                    hints: ['Use a hash map to store numbers and their indices']
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
                questionType: 'preference-based',
                averagePoints: questions.reduce((sum, q) => sum + (q.points || 15), 0) / questions.length,
                service: 'preference-based-generator',
                provider: questions[0]?.provider || 'preference-enhanced',
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