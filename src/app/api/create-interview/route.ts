import client from "@/lib/db";
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
        const body = await request.json()
        const { id, jobDesc, skills, companyName, projectContext, workExDetails, jobTitle, experienceLevel, interviewType } = body

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
            userId: id,
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
        console.log('✅ Interview record created');

        // Generate questions immediately (no background jobs!)
        const questions = await generateQuestionsImmediately(interviewData);
        
        // Store questions in database
        const questionsResult = await db.collection("questions").insertOne({
            questions: questions,
            answers: [],
            interviewId: interviewResult.insertedId.toString(),
            difficultyLevel: 'hard', // Mark questions as hard
            metadata: {
                generatedAt: new Date(),
                difficultyLevel: 'hard',
                questionType: 'hard-mode',
                averagePoints: questions.reduce((sum, q) => sum + (q.points || 45), 0) / questions.length
            }
        });

        // Update interview with questions reference and mark as ready
        await db.collection("interviews").findOneAndUpdate(
            { _id: interviewResult.insertedId },
            {
                $set: {
                    questions: questionsResult.insertedId,
                    status: 'ready',
                    difficultyLevel: 'hard',
                    questionStats: {
                        totalQuestions: questions.length,
                        averageDifficulty: 'hard',
                        averageTimeLimit: questions.reduce((sum, q) => sum + (q.timeLimit || 12), 0) / questions.length,
                        totalPoints: questions.reduce((sum, q) => sum + (q.points || 45), 0)
                    }
                }
            }
        );

        console.log('🔥 One-click HARD interview creation completed successfully!');

        return NextResponse.json(
            { 
                message: "HARD Interview created and ready to start!", 
                id: interviewResult.insertedId,
                status: 'ready',
                questionsCount: questions.length,
                difficultyLevel: 'HARD',
                averagePoints: questions.reduce((sum, q) => sum + (q.points || 45), 0) / questions.length,
                totalPoints: questions.reduce((sum, q) => sum + (q.points || 45), 0)
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("❌ Error in HARD interview creation:", error);
        return NextResponse.json(
            {
                error: "Failed to create HARD interview",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        )
    }
}