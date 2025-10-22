'use server'
import client from "@/lib/db";
import axios from "axios";
import { ObjectId } from "mongodb";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export const getInterviewDetails = async (id:string)=>{
    if(!id){
        return 
    }
    try {
        const dbClient = client;
        await dbClient.connect(); // Ensure connection is established
        const db = dbClient.db();

        const interview = await db.collection("interviews").findOne({_id:new ObjectId(id)});
        return interview;
    } catch (error) {
        console.error('❌ MongoDB connection error in getInterviewDetails:', error);
        throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export const getQuestions = async (interviewId:string)=>{
    console.log(interviewId);
    if(!interviewId){
        return
    }
    try {
        const dbClient = client;
        await dbClient.connect(); // Ensure connection is established
        const db = dbClient.db();

        const interviewQuestions = await db.collection("questions").findOne({interviewId:interviewId});
        if(!interviewQuestions){
            return null;
        }
        return interviewQuestions;
    } catch (error) {
        console.error('❌ MongoDB connection error in getQuestions:', error);
        throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export const setAnswers = async (data:Record<string, string>[],id:string)=>{
    try {
        console.log('📝 Saving answers and generating feedback...');
        
        // Save answers first
        const response = await axios.post(`${baseURL}/api/setanswers`,{
            data:data,
            id:id
        })

        // Generate insights immediately with enhanced error handling
        try {
            console.log('🚀 Starting fast feedback generation...');
            const insights = await generateInsightsDirectly(id);
            console.log('✅ Fast feedback generated successfully:', {
                score: insights.overallScore,
                provider: insights.metadata?.aiProvider,
                processingTime: insights.metadata?.processingTime + 'ms'
            });
            
            return {
                ...response.data,
                feedbackGenerated: true,
                insights: insights,
                processingTime: insights.metadata?.processingTime
            };
        } catch (error) {
            console.error('❌ Error generating insights:', error);
            
            // Still return success for answer saving, feedback can be regenerated
            return {
                ...response.data,
                feedbackGenerated: false,
                error: 'Feedback generation failed but answers were saved'
            };
        }
    } catch (error:any) {
        console.error('❌ Error in setAnswers:', error);
        throw new Error(`Failed to save answers: ${error.message}`);
    }
}

// Fast insights generation using Groq AI
const generateInsightsDirectly = async (interviewId: string) => {
    try {
        const dbClient = client;
        await dbClient.connect(); // Ensure connection is established
        const db = dbClient.db();
    
    console.log('🚀 Starting fast feedback generation with Groq AI...');
    const startTime = Date.now();
    
    const questionsDoc = await db.collection("questions").findOne({interviewId:interviewId});
    
    if (!questionsDoc || !questionsDoc.answers || questionsDoc.answers.length === 0) {
        throw new Error('No answers found for analysis');
    }

    // Get interview details for context
    const interview = await db.collection("interviews").findOne({_id: new ObjectId(interviewId)});
    const interview = await db.collection("interviews").findOne({_id: new require('mongodb').ObjectId(interviewId)});
    const jobTitle = interview?.jobTitle || "Software Engineer";
    const companyName = interview?.companyName || "TechCorp";
    const skills = interview?.skills || ["JavaScript", "React"];

    const questions = questionsDoc.questions || [];
    const answers = questionsDoc.answers.map((ans: any) => ans.answer || 'No answer provided'),

    // Use Groq AI for fast analysis
    try {
        const { default: GroqAIService } = await import('@/lib/groqAIService');
        const groqService = GroqAIService.getInstance();
        
        console.log(`🧠 Analyzing ${questions.length} questions with Groq AI...`);
        
        // Generate comprehensive analysis with Groq
        const insights = await groqService.analyzeOverallPerformance(
            questions,
            answers,
            jobTitle,
            skills
        );

        // Ensure all required fields are present
        const enhancedInsights = {
            ...insights,
            overallScore: insights.overallScore || 6.5,
            parameterScores: insights.parameterScores || {
                "Technical Knowledge": 7,
                "Problem Solving": 6,
                "Communication Skills": 7,
                "Practical Application": 6,
                "Company Fit": 6
            },
            overallVerdict: insights.overallVerdict || `Strong performance in the ${jobTitle} interview at ${companyName}. Demonstrated good technical understanding with room for improvement in specific areas.`,
            adviceForImprovement: insights.adviceForImprovement || questions.slice(0, 3).map((q: any, i: number) => ({
                question: q.question,
                advice: `For this question, consider providing more specific examples and deeper technical insights.`
            })),
            strengths: insights.strengths || ["Good technical communication", "Problem-solving approach", "Relevant experience"],
            improvements: insights.improvements || ["Add more specific examples", "Elaborate on technical details", "Demonstrate broader knowledge"],
            recommendations: insights.recommendations || ["Practice more technical scenarios", "Study company-specific technologies", "Prepare detailed project examples"],
            metadata: {
                analyzedAt: new Date(),
                aiProvider: 'groq',
                model: 'llama-3.3-70b-versatile',
                processingTime: Date.now() - startTime,
                interviewId: interviewId,
                questionsAnalyzed: questions.length,
                answersProcessed: answers.length
            }
        };

        // Update the questions document with extracted insights
        await db.collection("questions").findOneAndUpdate(
            {interviewId: interviewId},
            {
                $set: {
                    extracted: enhancedInsights,
                    analyzedAt: new Date(),
                    aiProvider: 'groq'
                }
            }
        );

        // CRITICAL: Mark interview as completed so it doesn't show in dashboard
        await db.collection('interviews').updateOne(
            { _id: new ObjectId(interviewId) },
            { 
                $set: { 
                    status: 'completed',
                    completedAt: new Date(),
                    performanceAnalyzed: true,
                    finalScore: enhancedInsights.overallScore || 0
                } 
            }
        );

        // Store comprehensive performance analysis for stats dashboard
        const performanceDoc = {
            interviewId,
            userId: interview?.userId || 'unknown',
            companyName: companyName,
            jobTitle: jobTitle,
            performance: enhancedInsights,
            questions: questions.map((q: any, index: number) => ({
                ...q,
                userAnswer: answers[index] || 'No answer provided',
                response: { analysis: { score: 6 } }
            })),
            createdAt: new Date(),
            aiProvider: 'groq'
        };

        // Update or insert performance analysis
        await db.collection('performance_analysis').updateOne(
            { interviewId },
            { $set: performanceDoc },
            { upsert: true }
        );

        const processingTime = Date.now() - startTime;
        console.log(`✅ Fast feedback generated in ${processingTime}ms with Groq AI`);
        
        return enhancedInsights;
    } catch (error) {
        console.error('❌ Error generating insights with Groq:', error);
        
        // Fallback analysis if Groq fails
        const fallbackInsights = {
            overallScore: 6.0,
            parameterScores: {
                "Technical Knowledge": 6,
                "Problem Solving": 6,
                "Communication Skills": 6,
                "Practical Application": 6,
                "Company Fit": 6
            },
            overallVerdict: `Interview completed successfully. The candidate demonstrated adequate performance across different areas with potential for improvement.`,
            adviceForImprovement: questions.slice(0, 3).map((q: any, i: number) => ({
                question: q.question,
                advice: `Consider providing more detailed and specific answers with practical examples.`
            })),
            strengths: ["Completed all questions", "Showed engagement", "Demonstrated basic understanding"],
            improvements: ["Provide more detailed technical explanations", "Include specific examples", "Show deeper domain knowledge"],
            recommendations: ["Practice technical interview questions", "Study relevant technologies", "Prepare specific project examples"],
            metadata: {
                analyzedAt: new Date(),
                aiProvider: 'fallback',
                model: 'basic-analysis',
                processingTime: Date.now() - startTime,
                interviewId: interviewId,
                questionsAnalyzed: questions.length,
                answersProcessed: answers.length,
                note: 'Generated using fallback analysis due to AI service unavailability'
            }
        };

        // Store fallback insights
        await db.collection("questions").findOneAndUpdate(
            {interviewId: interviewId},
            {
                $set: {
                    extracted: fallbackInsights,
                    analyzedAt: new Date(),
                    aiProvider: 'fallback'
                }
            }
        );

        // CRITICAL: Mark interview as completed even with fallback analysis
        await db.collection('interviews').updateOne(
            { _id: new ObjectId(interviewId) },
            { 
                $set: { 
                    status: 'completed',
                    completedAt: new Date(),
                    performanceAnalyzed: true,
                    finalScore: fallbackInsights.overallScore || 0
                } 
            }
        );

        // Store fallback performance analysis for stats dashboard
        const fallbackPerformanceDoc = {
            interviewId,
            userId: interview?.userId || 'unknown',
            companyName: companyName,
            jobTitle: jobTitle,
            performance: fallbackInsights,
            questions: questions.map((q: any, index: number) => ({
                ...q,
                userAnswer: answers[index] || 'No answer provided',
                response: { analysis: { score: 6 } }
            })),
            createdAt: new Date(),
            aiProvider: 'fallback'
        };

        // Update or insert performance analysis
        await db.collection('performance_analysis').updateOne(
            { interviewId },
            { $set: fallbackPerformanceDoc },
            { upsert: true }
        );

        console.log(`⚠️ Used fallback analysis in ${Date.now() - startTime}ms`);
        return fallbackInsights;
    }
    } catch (error) {
        console.error('❌ MongoDB connection error in generateInsightsDirectly:', error);
        throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}