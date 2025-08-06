import axios from "axios"
const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const getUserInterviews = async ()=>{
    try {
        const res = await axios.get(`${baseURL}/api/getuserinterviews`)
        console.log(res.data.data)
        return res.data.data
    } catch (error) {
        console.log(error)
        return error
    }
}