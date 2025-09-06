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

// Import FreeLLMService for immediate HARD question generation
async function generateHardQuestionsImmediately(interviewData: any) {
    try {
        const FreeLLMService = await import('@/lib/freeLLMService');
        const EnhancedCompanyIntelligenceService = await import('@/lib/enhancedCompanyIntelligence');
        
        const freeLLMService = FreeLLMService.default.getInstance();
        const companyIntelligence = EnhancedCompanyIntelligenceService.default.getInstance();
        
        console.log('🔥 Generating HARD questions with Groq AI...');
        
        // Get enhanced company intelligence
        const enhancedCompanyData = await companyIntelligence.getEnhancedCompanyIntelligence(
            interviewData.companyName,
            interviewData.jobTitle || 'Software Engineer'
        );

        console.log('📊 Company intelligence gathered for', interviewData.companyName);
        
        // Generate HARD questions using the new method
        const questions = await freeLLMService.generateHardInterviewQuestions({
            jobTitle: interviewData.jobTitle || 'Software Engineer',
            companyName: interviewData.companyName,
            skills: interviewData.skills || [],
            interviewType: interviewData.interviewType || 'mixed',
            experienceLevel: 'senior', // Force senior level for HARD questions
            numberOfQuestions: getQuestionCountForType(interviewData.interviewType || 'mixed'),
            companyIntelligence: enhancedCompanyData?.company_data,
            difficultyLevel: 'hard' // Force hard difficulty
        });

        // Convert to the format expected by the database
        const formattedQuestions = questions.map(q => ({
            question: q.question,
            expectedAnswer: q.expectedAnswer,
            difficulty: 'hard', // Force hard difficulty
            category: q.category,
            points: q.points || 45, // High points for hard questions
            timeLimit: q.timeLimit || 12, // Longer time for hard questions
            provider: q.provider || 'groq',
            model: q.model || 'llama-3.1-70b',
            evaluationCriteria: q.evaluationCriteria || ['Advanced Technical Depth', 'System Thinking'],
            tags: [...(q.tags || []), 'hard', 'senior-level']
        }));

        console.log(`✅ ${formattedQuestions.length} HARD questions generated successfully with Groq`);
        return formattedQuestions;
        
    } catch (error) {
        console.error('❌ Error generating HARD questions:', error);
        // Return some default HARD questions as fallback
        return [
            {
                question: "Design a distributed system architecture for real-time collaboration that can handle 10M+ concurrent users. Discuss data consistency, conflict resolution, scalability challenges, and monitoring strategies. How would you handle network partitions and ensure data integrity?",
                expectedAnswer: "A comprehensive senior-level answer covering distributed system principles, CAP theorem, eventual consistency, operational transformation for conflict resolution, microservices architecture, load balancing strategies, database sharding, caching layers, monitoring and alerting, fault tolerance mechanisms, and disaster recovery procedures.",
                difficulty: "hard",
                category: "technical",
                points: 50,
                timeLimit: 15
            },
            {
                question: "Describe a situation where you had to make a critical technical decision that your team strongly disagreed with. How did you handle the conflict, build consensus, and what was the outcome? What would you do differently?",
                expectedAnswer: "Should demonstrate senior leadership skills, ability to handle technical conflicts, data-driven decision making, stakeholder management, building consensus through technical evidence, learning from outcomes, and adapting leadership style.",
                difficulty: "hard", 
                category: "behavioral",
                points: 45,
                timeLimit: 12
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

        console.log('🔥 Creating HARD interview with one-click generation...');

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
            experienceLevel: experienceLevel ?? 'senior', // Default to senior for hard questions
            interviewType: interviewType ?? 'mixed',
            difficultyLevel: 'hard', // Mark as hard interview
            createdAt: new Date(),
            status: 'generating'
        };

        // Create interview first
        const interviewResult = await db.collection("interviews").insertOne(interviewData);
        console.log('✅ HARD Interview record created');

        // Generate HARD questions immediately (no background jobs!)
        const questions = await generateHardQuestionsImmediately(interviewData);
        
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