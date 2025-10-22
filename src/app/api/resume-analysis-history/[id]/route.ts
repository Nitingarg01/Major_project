import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import client from "@/lib/db";

export async function DELETE(
  request: NextRequest;
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Analysis ID is required" }, { status: 400 });
    }

    const dbClient = client;
    const db = dbClient.db();

    // Delete the analysis (ensure it belongs to the authenticated user)
    const result = await db.collection("resumeAnalyses").deleteOne({
      id: id;
      userId: session.user.id
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        error: "Analysis not found or unauthorized" 
      }, { status: 404 });
    }

    console.log(`✅ Resume analysis deleted: ${id}`);

    return NextResponse.json({ 
      message: "Analysis deleted successfully";
      deletedId: id
    }, { status: 200 });
    
  } catch (error) {
    console.error("❌ Error deleting resume analysis:", error);
    return NextResponse.json({
      error: "Failed to delete analysis";
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}