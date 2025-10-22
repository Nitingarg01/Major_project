import client from "@/lib/db";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { data, id } = body;

        // Validate input data
        if (!data || !Array.isArray(data) || !id) {
            return NextResponse.json(
                { message: "Invalid request data. Expected answers array and interview ID.", status: 400 },
                { status: 400 }
            )
        }

        // Validate ObjectId format
        if (!ObjectId.isValid(id)) {
            return NextResponse.json(
                { message: "Invalid interview ID format", status: 400 },
                { status: 400 }
            )
        }

        const objid = new ObjectId(id);
        const db = client.db();

        console.log(`📝 Saving ${data.length} answers for interview ${id}`)
        console.log('📄 Answer data format:', {
            isArray: Array.isArray(data),
            length: data.length,
            firstAnswer: data[0],
            answerKeys: data[0] ? Object.keys(data[0]) : []
        })

        // Transform data to ensure consistent format
        const transformedAnswers = data.map((item, index) => {
            if (typeof item === 'object' && item.answer) {
                return {
                    questionIndex: index,
                    answer: item.answer,
                    timestamp: new Date()
                }
            } else if (typeof item === 'string') {
                return {
                    questionIndex: index,
                    answer: item,
                    timestamp: new Date()
                }
            } else {
                console.warn(`⚠️ Unexpected answer format at index ${index}:`, item)
                return {
                    questionIndex: index,
                    answer: item?.answer || 'No answer provided',
                    timestamp: new Date()
                }
            }
        })

        console.log('✅ Transformed answers:', {
            count: transformedAnswers.length,
            sampleTransformed: transformedAnswers[0]
        })

        // Update questions with answers
        const quesBank = await db.collection("questions").findOneAndUpdate(
            { interviewId: id },
            {
                $set: {
                    answers: transformedAnswers,
                    completedAt: new Date(),
                    answersCount: transformedAnswers.length,
                    lastUpdated: new Date()
                }
            },
            { returnDocument: 'after' }
        )

        if (!quesBank) {
            return NextResponse.json(
                { message: "Interview questions not found", status: 404 },
                { status: 404 }
            )
        }

        // Update interview status to completed
        const intSet = await db.collection("interviews").findOneAndUpdate(
            { _id: objid },
            {
                $set: {
                    status: 'completed',
                    completedAt: new Date()
                }
            },
            { returnDocument: 'after' }
        )

        if (!intSet) {
            return NextResponse.json(
                { message: "Interview not found", status: 404 },
                { status: 404 }
            )
        }

        console.log(`✅ Interview ${id} completed successfully`)

        return NextResponse.json({
            message: 'Answers uploaded successfully',
            status: 200,
            questionbank: quesBank._id,
            intStatus: intSet.status,
            answersCount: transformedAnswers.length,
            debug: {
                originalDataLength: data.length,
                transformedDataLength: transformedAnswers.length,
                sampleOriginal: data[0],
                sampleTransformed: transformedAnswers[0]
            }
        })

    } catch (error) {
        console.error('❌ Error saving answers:', error)
        return NextResponse.json(
            { 
                message: "Failed to upload answers", 
                status: 500,
                error: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        )
    }
}