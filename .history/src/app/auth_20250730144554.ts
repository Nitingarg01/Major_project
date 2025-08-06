import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

const handlers = NextAuth({
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
          return null
        }
    })
]
})

export {handlers}