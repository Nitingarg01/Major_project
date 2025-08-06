import axios from "axios"
import { auth } from "./auth";
const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const getUserInterviews = async ()=>{
    const session = await auth()
      if (!session?.user?.id) {
    return []; // or throw new Error("Unauthorized")
  }
  
    try {
        const res = await axios.get(`${baseURL}/api/getuserinterviews`)
        console.log(res.data.data)
        return res.data.data
    } catch (error) {
        console.log(error)
        return error
    }
}