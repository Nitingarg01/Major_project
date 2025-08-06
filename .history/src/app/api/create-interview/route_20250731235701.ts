import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {} = body
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