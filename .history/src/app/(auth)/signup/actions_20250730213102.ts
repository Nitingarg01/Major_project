"use server"

import client from "@/lib/db";

export const handleSignUp = async (formData:FormData)=>{
    const email = formData.get("email")?.toString(); // ← CALL .toString()
    const password = formData.get("password")?.toString();
    const name = formData.get("name")?.toString();

    if(!email||!password||!name){
        throw new Error("All feilds required")
    }

    const dbClient = client;
    const db = dbClient.db();

    const user = await db.collection("users").findOne({email:email})
    if(user){
        throw new Error("User Already Exists!")
    }
    
}