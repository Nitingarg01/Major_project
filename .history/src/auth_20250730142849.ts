import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export const {handlers,signIn,signout,auth} = NextAuth({
providers:[
    Google({
        clientId: process.env.GOOGLE_CLIENT_ID ?? '',
        clientSecret:process.env.GOOGLE_CLIENT_SECRET ?? ''
    })
]
})