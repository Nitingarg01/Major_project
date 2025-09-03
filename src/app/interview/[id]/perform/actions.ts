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

// Direct insights generation without Inngest
const generateInsightsDirectly = async (interviewId: string) => {
    const db = client.db();
    
    const questionsDoc = await db.collection("questions").findOne({interviewId:interviewId})
    
    if (!questionsDoc || !questionsDoc.answers || questionsDoc.answers.length === 0) {
        throw new Error('No answers found for analysis');
    }

    const length = questionsDoc.answers.length
    let qnaArr = []

    for(let i=0; i<length; i++){
        const obj = {
            question: questionsDoc.questions[i]?.question,
            expectedAnswer: questionsDoc.questions[i]?.expectedAnswer,
            answer: questionsDoc.answers[i]?.answer
        }
        qnaArr.push(obj)
    }

    // Use AI model to generate insights
    try {
        const insights = await aiInterviewModel.analyzeInterviewPerformance(
            questionsDoc.questions,
            questionsDoc.answers.map((ans: any) => ans.answer),
            "Software Engineer", // Default job title
            [] // Default skills
        );

        // Update the questions document with extracted insights
        await db.collection("questions").findOneAndUpdate(
            {interviewId: interviewId},
            {
                $set: {
                    extracted: insights
                }
            }
        );

        return insights;
    } catch (error) {
        console.error('Error analyzing performance:', error);
        throw error;
    }
}