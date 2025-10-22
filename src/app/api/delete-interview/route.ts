import client from "@/lib/db";
import { ObjectId } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { interviewId } = body;

        if (!interviewId) {
            return NextResponse.json(
                { error: "Interview ID is required" },
                { status: 400 }
            );
        }

        console.log('🗑️ Deleting interview:', interviewId);

        const dbClient = client;
        const db = dbClient.db();

        // Verify interview belongs to the user
        const interview = await db.collection("interviews").findOne({
            _id: new ObjectId(interviewId),
            userId: session.user.id
        });

        if (!interview) {
            return NextResponse.json(
                { error: "Interview not found or unauthorized" },
                { status: 404 }
            );
        }

        // Delete associated questions if they exist
        if (interview.questions) {
            await db.collection("questions").deleteOne({
                _id: new ObjectId(interview.questions)
            });
            console.log('✅ Associated questions deleted');
        }

        // Delete the interview
        await db.collection("interviews").deleteOne({
            _id: new ObjectId(interviewId)
        });

        console.log('✅ Interview deleted successfully');

        return NextResponse.json(
            { 
                message: "Interview deleted successfully";
                success: true 
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("❌ Error deleting interview:", error);
        return NextResponse.json(
            {
                error: "Failed to delete interview";
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}