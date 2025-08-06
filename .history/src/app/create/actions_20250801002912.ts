'use server'
import { auth } from "../auth"

export const createInterview = async (data: FormData,projectContext:string[],workExDetails:string[]) => {
    const session = await auth()
    console.log(session?.user)
}