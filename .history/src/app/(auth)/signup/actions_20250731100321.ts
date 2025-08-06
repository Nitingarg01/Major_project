
import client from "@/lib/db";
import { hash } from "bcrypt-ts"

export const handleSignUp = async (formData: FormData) => {
    "use server"
    const email = formData.get("email")?.toString(); // ← CALL .toString()
    const password = formData.get("password")?.toString();
    const name = formData.get("name")?.toString();

    if (!email || !password || !name) {
        throw new Error("All feilds required")
    }
    console.log(name,email,password)

    const dbClient = client;
    const db = dbClient.db();

    const user = await db.collection("users").findOne({ email: email })
    if (user) {
        throw new Error("User Already Exists!")
    }

    const hashedPass = await hash(password, 10);
    try {
        const newUser = await db.collection("users").insertOne({
            name: name,
            email: email,
            password: hashedPass
        })
        return {
            "status":"success",
            "userId":newUser.insertedId.toString()
        }
    } catch (error) {
        return{
            "status":"failed",
            "message":error
        }
    }


}