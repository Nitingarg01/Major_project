import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import client from "@/lib/db";
import client from "@/lib/db";

export const {handlers ,signIn,signOut,auth} = NextAuth({
    adapter:MongoDBAdapter(client),
providers:[
    Google({
        clientId: process.env.GOOGLE_CLIENT_ID ?? '',
        clientSecret:process.env.GOOGLE_CLIENT_SECRET ?? ''
    }),
    Credentials({
        name: "Credentials",
        credentials: {
            email: {
                label: "Email",
                type: "email"
            },
            password: {
                label: "Password",
                type: "password"
            }
        },
        authorize: async (credentials) => {

            const dbClient = client;
            const db = dbClient.db()

          const email = credentials?.email as string | undefined;
          const password = credentials?.password as string | undefined;

          if(!email || !password){
            throw new CredentialsSignin("Please Enter Valid Credentials!")
          }

          const user = await db.collection("users").updateOne({
            email:email
          },{
            $setOnInsert:{
                email:email,
                password:password,
                role:"user",
                createdAt:new Date()
            }
          })

          if(password !== 'passcode'){
            throw new CredentialsSignin("Password not match")
          }else{
            return user
          }
        }
    })
]
})

