import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export const { handler, signIn, signOut, auth } = NextAuth({
    providers: [
        // Google({
        //     clientId: process.env.GOOGLE_CLIENT_ID ?? "", 
        //     clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
        // }),
        // Credentials({
        //     name: "Credentials",
        //     credentials: {
        //         email: {
        //             label: "Email",
        //             type: "text",
        //             placeholder: "your@email.com"
        //         },
        //         password: {
        //             label: "Password",
        //             type: "password"
        //         }
        //     },
        //     authorize: async (credentials) => {
        //         // Add your user authentication logic here
        //         // Return user object if authentication is successful, otherwise return null
        //         return null;
        //     }
        // })
    ],
    callbacks: {

    },
    pages: {

    }
})
