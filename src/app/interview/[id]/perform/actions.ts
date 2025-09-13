'use server'
import client from "@/lib/db";
import axios from "axios";
import { ObjectId } from "mongodb";
import { aiInterviewModel } from "@/lib/aimodel";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const getInterviewDetails = async (id:string)=>{
    if(!id){
        return 
    }
     const dbClient = client;
    const db = dbClient.db();

    const interview = await db.collection("interviews").findOne({_id:new ObjectId(id)})
    return interview
}

export const getQuestions = async (interviewId:string)=>{
    console.log(interviewId)
    if(!interviewId){
        return
    }
    const db = client.db()

    const interviewQuestions = await db.collection("questions").findOne({interviewId:interviewId})
    if(!interviewQuestions){
        return null
    }
    return interviewQuestions
}

export const setAnswers = async (data:Record<string, string>[],id:string)=>{
    try {
        const response = await axios.post(`${baseURL}/api/setanswers`,{
            data:data,
            id:id
        })

        // Generate insights immediately instead of using background jobs
        try {
            await generateInsightsDirectly(id);
            console.log('✅ Insights generated successfully');
        } catch (error) {
            console.error('❌ Error generating insights:', error);
        }

        return response.data
    } catch (error:any) {
        console.log(error.message)
    }
}

// Fast insights generation using Groq AI
const generateInsightsDirectly = async (interviewId: string) => {
    const db = client.db();
    
    console.log('🚀 Starting fast feedback generation with Groq AI...');
    const startTime = Date.now();
    
    const questionsDoc = await db.collection("questions").findOne({interviewId:interviewId})
    
    if (!questionsDoc || !questionsDoc.answers || questionsDoc.answers.length === 0) {
        throw new Error('No answers found for analysis');
    }

    // Get interview details for context
    const interview = await db.collection("interviews").findOne({_id: new require('mongodb').ObjectId(interviewId)});
    const jobTitle = interview?.jobTitle || "Software Engineer";
    const companyName = interview?.companyName || "TechCorp";
    const skills = interview?.skills || ["JavaScript", "React"];

    const questions = questionsDoc.questions || [];
    const answers = questionsDoc.answers.map((ans: any) => ans.answer || 'No answer provided');

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

        console.log(`⚠️ Used fallback analysis in ${Date.now() - startTime}ms`);
        return fallbackInsights;
    }
}