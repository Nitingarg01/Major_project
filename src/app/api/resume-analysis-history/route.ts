import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import client from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const dbClient = client;
    const db = dbClient.db();

    const analyses = await db.collection("resumeAnalyses")
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    // Convert MongoDB _id to string and clean up the response
    const cleanedAnalyses = analyses.map(analysis => ({
      ...analysis,
      _id: undefined, // Remove MongoDB _id
      id: analysis.id || analysis._id.toString()
    }));

    return NextResponse.json({ 
      analyses: cleanedAnalyses;
      count: cleanedAnalyses.length
    }, { status: 200 });
    
  } catch (error) {
    console.error("❌ Error fetching resume analysis history:", error);
    return NextResponse.json({
      error: "Failed to fetch analysis history";
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}