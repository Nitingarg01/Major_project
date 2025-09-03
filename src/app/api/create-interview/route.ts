import client from "@/lib/db";
import { ObjectId } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";

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

        const dbClient = client;
        const db = dbClient.db();

        // Create interview without deducting credits (free service)
        const result = await db.collection("interviews").insertOne({
            userId: id,
            jobDesc,
            skills,
            jobTitle,
            companyName,
            projectContext: projectContext ?? [],
            workExDetails: workExDetails ?? [],
            experienceLevel: experienceLevel ?? 'mid',
            interviewType: interviewType ?? 'mixed',
            createdAt: new Date(),
            status: 'ready'
        })

        console.log('✅ Interview created successfully for user:', id)

        return NextResponse.json(
            { 
                message: "Interview created successfully!", 
                id: result.insertedId,
                status: 'ready'
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("❌ Error creating interview:", error);
        return NextResponse.json(
            {
                error: "Failed to create interview"
            },
            { status: 500 }
        )
    }
}