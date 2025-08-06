import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export const {handlers,signIn,signout,auth} = NextAuth({
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
            // Replace this with your own authentication logic
            if (credentials?.email && credentials?.password) {
                // Example: always succeed for demonstration
                return { id: "1", email: credentials.email };
            }
            return null;
        }
    })
]
})