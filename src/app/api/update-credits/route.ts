import client from "@/lib/db";
import { ObjectId } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId } = body

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        const dbClient = client;
        const db = dbClient.db();

        // Since this is now a free service, we return unlimited credits
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) })
        
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // For free service, return a high number to indicate unlimited
        return NextResponse.json(
            { credits: 999, message: "Unlimited free interviews!" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error fetching user credits:", error);
        return NextResponse.json(
            { error: "Failed to fetch credits" },
            { status: 500 }
        )
    }
}