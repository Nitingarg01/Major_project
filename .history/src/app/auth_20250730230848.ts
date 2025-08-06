import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import client from "@/lib/db";
import { compare } from "bcrypt-ts"

export const {handlers ,signIn,signOut,auth} =  NextAuth({
    adapter:MongoDBAdapter(client),
providers:[
    Google({
        clientId: process.env.GOOGLE_CLIENT_ID ?? '',
        clientSecret:process.env.GOOGLE_CLIENT_SECRET ?? ''
    }),
    Credentials({
        name: "credentials",
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

          const email = credentials?.email as string | undefined;
          const password = credentials?.password as string | undefined;
          console.log(email,password)

          if(!email || !password){
            throw new CredentialsSignin("Please Enter Valid Credentials!")
          }

          const dbClient = client;
          const db = dbClient.db()

          const user = await db.collection("users").findOne({ email: email });
          if(!user){
            throw new CredentialsSignin("Invalid Email or Password")
          }
          const isMatch = await compare(password,user?.password)

          if(!isMatch){
            throw new CredentialsSignin("Invalid Email or Password")
          }
         return {
            name:user.name,
            email:user.email,
            id:user._id
         }
        }
    })
],
callbacks:{

},
pages:{
    signIn: '/login',
    newUser: '/signup',
}
})

