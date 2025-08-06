import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, jobDesc, skills, companyName } = body

        if (!jobDesc || !companyName || !skills || skills.length === 0) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error("Error saving form:", error);
        return NextResponse.json(
            {
                error: "Something went wrong."
            },
            { status: 500 }
        )
    }
}