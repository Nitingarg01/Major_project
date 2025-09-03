import axios from "axios"
import { auth } from "./auth";
import client from "@/lib/db";
import { ObjectId } from "mongodb";
import { Interview, InterviewCardProps } from "@/types/interview";

export const getUserInterviews = async () => {
        const session = await auth()
        const userId = session?.user?.id

        if (!userId) {
                return []
        }

        const dbClient = client;
        const db = dbClient.db();

        const interviews = await db.collection("interviews").find({ userId: userId }).toArray() as unknown as Interview[];
        return interviews
}

export const updateCreds = async (id: string) => {
       if(!id){
        return ;
       }
       const db = client.db()

       const user = await db.collection('users').findOne({_id:new ObjectId(id)})
       return user?.credits;
}

export const getUserStats = async () => {
        const session = await auth()
        const userId = session?.user?.id

        if (!userId) {
                return {
                        totalInterviews: 0,
                        completedInterviews: 0,
                        averageScore: 0
                }
        }

        const dbClient = client;
        const db = dbClient.db();

        // Get all interviews for the user
        const interviews = await db.collection("interviews").find({ userId: userId }).toArray() as unknown as Interview[];
        
        // Get all question documents for completed interviews to calculate scores
        const completedInterviews = interviews.filter(interview => interview.status === 'completed');
        
        let totalScore = 0;
        let validScoreCount = 0;

        // Calculate average score from completed interviews
        for (const interview of completedInterviews) {
                try {
                        const questionDoc = await db.collection("questions").findOne({ 
                                interviewId: interview._id.toString() 
                        });
                        
                        if (questionDoc?.extracted?.overallScore) {
                                totalScore += questionDoc.extracted.overallScore;
                                validScoreCount++;
                        }
                } catch (error) {
                        console.error('Error fetching score for interview:', interview._id, error);
                }
        }

        const averageScore = validScoreCount > 0 ? Math.round(totalScore / validScoreCount) : 0;

        return {
                totalInterviews: interviews.length,
                completedInterviews: completedInterviews.length,
                averageScore: averageScore
        };
}