'use server'
import { auth } from "../auth"

export const createInterview = async (data: FormData,) => {
    const session = await auth()
    console.log(session?.user)
}