import client from "@/lib/db";
import { auth } from "@/app/auth";
import { ObjectId } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";

// Helper function for question counts (updated for new requirements)
function getQuestionCountForType(interviewType: string): number {
  switch (interviewType) {
    case 'mixed': return 16; // 6 Technical + 4 Behavioral + 4 Aptitude + 2 DSA
    case 'technical': return 12; // Technical focus
    case 'behavioral': return 10; // Behavioral focus
    case 'aptitude': return 15; // Aptitude focus
    case 'dsa': return 2; // Exactly 2 DSA problems
    default: return 12
  }
}

// Use Interview Service Manager for enhanced question generation
async function generateQuestionsImmediately(interviewData: any, userId: string) {
    try {
        const { interviewServiceManager } = await import('@/lib/interviewServiceManager');
        
        console.log('🎯 Generating enhanced questions with improved interview structure...');
        
        // Generate questions using the enhanced service manager
        const questions = await interviewServiceManager.generateInterviewQuestions({
            jobTitle: interviewData.jobTitle || 'Software Engineer',
            companyName: interviewData.companyName,
            skills: interviewData.skills || [],
            interviewType: interviewData.interviewType || 'mixed',
            experienceLevel: interviewData.experienceLevel || 'mid',
            numberOfQuestions: getQuestionCountForType(interviewData.interviewType || 'mixed')
        });

        console.log(`✅ Generated ${questions.length} enhanced questions with proper distribution`);

        const allQuestions = questions.map((q: any) => ({
            id: q.id,
            question: q.question,
            expectedAnswer: q.expectedAnswer,
            difficulty: q.difficulty || 'medium',
            category: q.category,
            points: q.points || getPointsForCategory(q.category, q.difficulty),
            timeLimit: q.timeLimit || getTimeLimitForCategory(q.category),
            provider: q.provider || 'interview-service-manager',
            model: q.model || 'enhanced-groq',
            evaluationCriteria: q.evaluationCriteria || ['Technical Knowledge', 'Communication', 'Problem Solving'],
            tags: q.tags || [interviewData.jobTitle, interviewData.companyName],
            hints: q.hints || [],
            companyRelevance: q.companyRelevance || 8,
            dsaProblem: q.dsaProblem || null // Include DSA problem data if present
        }));

        console.log(`✅ ${allQuestions.length} enhanced questions processed successfully`);
        return allQuestions;
        
    } catch (error) {
        console.error('❌ Error generating enhanced questions:', error);
        // Return enhanced fallback questions
        return generateEnhancedFallbackQuestions(interviewData);
    }
}

// Enhanced fallback questions for error scenarios
function generateEnhancedFallbackQuestions(interviewData: any): any[] {
    const fallbackQuestions = [];
    const questionCount = getQuestionCountForType(interviewData.interviewType);
    
    if (interviewData.interviewType === 'mixed') {
        // Generate balanced mix for mixed interviews
        // Technical questions (6)
        for (let i = 0; i < 6; i++) {
            fallbackQuestions.push({
                id: `enhanced-tech-fallback-${i}`,
                question: `Describe your experience with ${interviewData.skills[i % interviewData.skills.length]} and how you would implement it at ${interviewData.companyName}.`,
                expectedAnswer: "A comprehensive technical answer with practical examples and implementation details.",
                difficulty: "medium",
                category: "technical",
                points: 15,
                timeLimit: 5,
                provider: 'enhanced-fallback',
                evaluationCriteria: ['Technical Depth', 'Practical Application', 'Company Relevance'],
                tags: ['technical', interviewData.companyName, interviewData.skills[i % interviewData.skills.length]],
                companyRelevance: 8
            });
        }
        
        // Behavioral questions (4)
        const behavioralPrompts = [
            "Tell me about a challenging project you led",
            "Describe a time when you had to work with a difficult team member",
            "How do you handle tight deadlines and pressure",
            "Give an example of when you had to learn a new technology quickly"
        ];
        
        for (let i = 0; i < 4; i++) {
            fallbackQuestions.push({
                id: `enhanced-behavioral-fallback-${i}`,
                question: `${behavioralPrompts[i]} and how it relates to working at ${interviewData.companyName}.`,
                expectedAnswer: "A structured behavioral answer using the STAR method with specific examples.",
                difficulty: "medium",
                category: "behavioral",
                points: 12,
                timeLimit: 5,
                provider: 'enhanced-fallback',
                evaluationCriteria: ['Communication', 'Leadership', 'Problem Solving', 'Cultural Fit'],
                tags: ['behavioral', interviewData.companyName],
                companyRelevance: 7
            });
        }
        
        // Aptitude questions (4)
        const aptitudePrompts = [
            "You have 8 balls, one of which weighs slightly more. Using a balance scale only twice, how do you identify the heavier ball?",
            "How would you explain cloud computing to a 5-year-old?",
            "Estimate how many smartphone users are there globally",
            "If you were to design a system for a library, what would be your approach?"
        ];
        
        for (let i = 0; i < 4; i++) {
            fallbackQuestions.push({
                id: `enhanced-aptitude-fallback-${i}`,
                question: aptitudePrompts[i],
                expectedAnswer: "A logical approach with clear reasoning and systematic problem-solving.",
                difficulty: "medium",
                category: "aptitude",
                points: 10,
                timeLimit: 5,
                provider: 'enhanced-fallback',
                evaluationCriteria: ['Logical Reasoning', 'Problem Solving', 'Creativity'],
                tags: ['aptitude', 'logic', 'problem-solving'],
                companyRelevance: 6
            });
        }
        
        // DSA questions (2)
        fallbackQuestions.push({
            id: 'enhanced-dsa-fallback-1',
            question: `DSA Problem 1: Two Sum\n\nGiven an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.`,
            expectedAnswer: "A working solution with proper time and space complexity analysis. Expected approach: hash map with O(n) time complexity.",
            difficulty: "medium", 
            category: "dsa",
            points: 30,
            timeLimit: 45,
            provider: 'enhanced-fallback',
            evaluationCriteria: ['Correctness', 'Efficiency', 'Code Quality', 'Edge Cases'],
            tags: ['dsa', 'algorithms', 'array', interviewData.companyName],
            companyRelevance: 9,
            dsaProblem: {
                id: 'fallback-two-sum',
                title: 'Two Sum Problem',
                difficulty: 'medium',
                description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
                examples: [{
                    input: 'nums = [2,7,11,15], target = 9',
                    output: '[0,1]',
                    explanation: 'Because nums[0] + nums[1] = 2 + 7 = 9, we return [0, 1].'
                }],
                testCases: [
                    { id: 'test1', input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0,1]' },
                    { id: 'test2', input: 'nums = [3,2,4], target = 6', expectedOutput: '[1,2]' }
                ],
                constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9'],
                topics: ['Array', 'Hash Table'],
                hints: ['Use a hash map to store numbers and their indices']
            }
        });
        
        fallbackQuestions.push({
            id: 'enhanced-dsa-fallback-2',
            question: `DSA Problem 2: Valid Parentheses\n\nGiven a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.`,
            expectedAnswer: "A stack-based solution with proper validation logic. Expected approach: stack data structure with O(n) time complexity.",
            difficulty: "medium",
            category: "dsa", 
            points: 30,
            timeLimit: 45,
            provider: 'enhanced-fallback',
            evaluationCriteria: ['Correctness', 'Efficiency', 'Code Quality', 'Edge Cases'],
            tags: ['dsa', 'stack', 'string', interviewData.companyName],
            companyRelevance: 8,
            dsaProblem: {
                id: 'fallback-valid-parentheses',
                title: 'Valid Parentheses',
                difficulty: 'medium',
                description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
                examples: [{
                    input: 's = "()"',
                    output: 'true',
                    explanation: 'The parentheses are properly matched.'
                }],
                testCases: [
                    { id: 'test1', input: 's = "()"', expectedOutput: 'true' },
                    { id: 'test2', input: 's = "()[]{}"', expectedOutput: 'true' },
                    { id: 'test3', input: 's = "(]"', expectedOutput: 'false' }
                ],
                constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only'],
                topics: ['String', 'Stack'],
                hints: ['Use a stack to keep track of opening brackets']
            }
        });
        
    } else if (interviewData.interviewType === 'dsa') {
        // Generate exactly 2 DSA problems
        fallbackQuestions.push({
            id: 'enhanced-dsa-only-fallback-1',
            question: `DSA Problem 1: Binary Tree Level Order Traversal\n\nGiven the root of a binary tree, return the level order traversal of its nodes' values.`,
            expectedAnswer: "A BFS-based solution using queue data structure with proper level separation.",
            difficulty: getDSADifficultyForLevel(interviewData.experienceLevel),
            category: "dsa",
            points: getDSAPointsForDifficulty(getDSADifficultyForLevel(interviewData.experienceLevel)),
            timeLimit: 45,
            provider: 'enhanced-fallback',
            evaluationCriteria: ['Correctness', 'Efficiency', 'Code Quality', 'Tree Traversal Understanding'],
            tags: ['dsa', 'tree', 'bfs', interviewData.companyName],
            companyRelevance: 9
        });
        
        fallbackQuestions.push({
            id: 'enhanced-dsa-only-fallback-2', 
            question: `DSA Problem 2: Longest Substring Without Repeating Characters\n\nGiven a string s, find the length of the longest substring without repeating characters.`,
            expectedAnswer: "A sliding window approach with hash set for character tracking.",
            difficulty: getDSADifficultyForLevel(interviewData.experienceLevel),
            category: "dsa",
            points: getDSAPointsForDifficulty(getDSADifficultyForLevel(interviewData.experienceLevel)),
            timeLimit: 45,
            provider: 'enhanced-fallback',
            evaluationCriteria: ['Correctness', 'Efficiency', 'Code Quality', 'String Processing'],
            tags: ['dsa', 'string', 'sliding-window', interviewData.companyName],
            companyRelevance: 8
        });
    } else {
        // Generate questions for other specific types
        for (let i = 0; i < questionCount; i++) {
            fallbackQuestions.push({
                id: `enhanced-${interviewData.interviewType}-fallback-${i}`,
                question: `Tell me about your experience with ${interviewData.skills[i % interviewData.skills.length]} in a ${interviewData.interviewType} context at ${interviewData.companyName}.`,
                expectedAnswer: `A comprehensive ${interviewData.interviewType} answer with specific examples and practical application.`,
                difficulty: "medium",
                category: interviewData.interviewType,
                points: getPointsForCategory(interviewData.interviewType, "medium"),
                timeLimit: getTimeLimitForCategory(interviewData.interviewType),
                provider: 'enhanced-fallback',
                evaluationCriteria: ['Relevance', 'Depth', 'Communication', 'Practical Application'],
                tags: [interviewData.interviewType, interviewData.companyName],
                companyRelevance: 7
            });
        }
    }
    
    return fallbackQuestions;
}

// Helper functions for enhanced scoring
function getPointsForCategory(category: string, difficulty: string = 'medium'): number {
    const basePoints = {
        'technical': 15,
        'behavioral': 12,
        'aptitude': 10,
        'dsa': 30
    };
    
    const difficultyMultiplier = {
        'easy': 0.8,
        'medium': 1.0,
        'hard': 1.5
    };
    
    return Math.round((basePoints[category as keyof typeof basePoints] || 10) * (difficultyMultiplier[difficulty as keyof typeof difficultyMultiplier] || 1));
}

function getTimeLimitForCategory(category: string): number {
    const timelimits = {
        'technical': 5,
        'behavioral': 5,
        'aptitude': 5,
        'dsa': 45
    };
    
    return timelimits[category as keyof typeof timelimits] || 5;
}

function getDSADifficultyForLevel(experienceLevel: string): 'easy' | 'medium' | 'hard' {
    switch (experienceLevel) {
        case 'entry': return 'easy';
        case 'mid': return 'medium';
        case 'senior': return 'hard',
        default: return 'medium'
    }
}

function getDSAPointsForDifficulty(difficulty: string): number {
    switch (difficulty) {
        case 'easy': return 20;
        case 'medium': return 30;
        case 'hard': return 45,
        default: return 30
    }
}

export async function POST(request: NextRequest) {
    try {
        console.log("🎯 CREATE INTERVIEW API - Starting with enhanced features");
        
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

        console.log('🚀 Creating interview with enhanced question generation...');
        console.log(`📊 Interview Type: ${interviewType} - Expected Questions: ${getQuestionCountForType(interviewType)}`);

        const dbClient = client;
        const db = dbClient.db();

        // Check for duplicate company interview (only if there's a completed interview)
        const existingCompanyInterview = await db.collection('interviews').findOne({
            userId: userId,
            companyName: companyName,
            status: 'completed'
        });

        if (existingCompanyInterview) {
            console.log(`⚠️ User already has a completed interview for ${companyName}`);
            return NextResponse.json(
                { 
                    error: `You have already completed an interview for ${companyName}. Check your performance stats to view the results.`,
                    existingInterviewId: existingCompanyInterview._id,
                    redirectTo: '/performance'
                },
                { status: 409 } // Conflict status
            );
        }

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
            selectedRounds: selectedRounds ?? (interviewType === 'mixed' ? ['technical', 'behavioral', 'aptitude', 'dsa'] : [interviewType]),
            estimatedDuration: estimatedDuration ?? calculateEstimatedDuration(interviewType),
            difficultyPreference: difficultyPreference ?? 'adaptive',
            companyIntelligence: companyIntelligence,
            roundConfigs: roundConfigs,
            createdAt: new Date(),
            status: 'generating',
            enhancedFeatures: {
                mixedInterviewIncludes: interviewType === 'mixed' ? ['technical', 'behavioral', 'aptitude', 'dsa'] : null,
                dsaQuestionCount: interviewType === 'dsa' ? 2 : (interviewType === 'mixed' ? 2 : 0),
                totalQuestionCount: getQuestionCountForType(interviewType)
            }
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
                questionType: 'enhanced-structured',
                averagePoints: questions.reduce((sum, q) => sum + (q.points || 15), 0) / questions.length,
                service: 'enhanced-interview-service-manager',
                provider: questions[0]?.provider || 'enhanced-generator',
                model: questions[0]?.model || 'groq-enhanced',
                processingMethod: 'intelligent-routing-v2',
                interviewStructure: {
                    mixed: interviewType === 'mixed',
                    dsaOnly: interviewType === 'dsa',
                    questionDistribution: getQuestionDistribution(questions),
                    enhancedFeatures: interviewData.enhancedFeatures
                }
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
                        totalPoints: questions.reduce((sum, q) => sum + (q.points || 15), 0),
                        categoryBreakdown: getQuestionDistribution(questions)
                    }
                }
            }
        );

        console.log('🎉 Enhanced interview creation completed successfully for user:', session.user.id);
        console.log(`📈 Generated: ${questions.length} questions with proper distribution`);

        return NextResponse.json(
            { 
                message: `Enhanced interview created and ready! ${interviewType === 'mixed' ? 'Includes all 4 rounds: Technical + Behavioral + Aptitude + DSA' : interviewType === 'dsa' ? 'DSA interview with 2 challenging problems' : `${interviewType} interview ready`}`, 
                id: interviewResult.insertedId,
                status: 'ready',
                questionsCount: questions.length,
                averagePoints: questions.reduce((sum, q) => sum + (q.points || 15), 0) / questions.length,
                totalPoints: questions.reduce((sum, q) => sum + (q.points || 15), 0),
                service: 'enhanced-smart-ai',
                userId: session.user.id,
                enhancedFeatures: interviewData.enhancedFeatures,
                questionDistribution: getQuestionDistribution(questions)
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("❌ Error in enhanced interview creation:", error);
        
        // Don't expose internal errors that might compromise security
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const isAuthError = errorMessage.includes('auth') || errorMessage.includes('session');
        
        return NextResponse.json(
            {
                error: isAuthError ? "Authentication error" : "Failed to create enhanced interview",
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            },
            { status: isAuthError ? 401 : 500 }
        )
    }
}

// Helper function to calculate estimated duration based on interview type
function calculateEstimatedDuration(interviewType: string): number {
    switch (interviewType) {
        case 'mixed': return 120; // 2 hours for comprehensive interview
        case 'dsa': return 90; // 1.5 hours for 2 DSA problems
        case 'technical': return 60; // 1 hour for technical
        case 'behavioral': return 50; // 50 minutes for behavioral
        case 'aptitude': return 75; // 1.25 hours for aptitude
        default: return 60
    }
}

// Helper function to get question distribution
function getQuestionDistribution(questions: any[]): { [key: string]: number } {
    const distribution: { [key: string]: number } = {};
    questions.forEach(q => {
        distribution[q.category] = (distribution[q.category] || 0) + 1;
    });
    return distribution;
}