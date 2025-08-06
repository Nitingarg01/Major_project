'use server'
import { auth } from "../auth"

type formD = {
    jobDesc:string,
    skills:string[],
    companyName:string,
}

export const createInterview = async (data: formD,projectContext:string[],workExDetails:string[]) => {
    const session = await auth()
    console.log(session?.user)
    console.log(data,projectContext,workExDetails)
}