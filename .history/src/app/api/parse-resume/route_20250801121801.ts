import { NextRequest,NextResponse } from "next/server";

export async function POST(request:NextRequest){
    const formData = request.formData()
    const file = (await formData).get("resume") as File
}