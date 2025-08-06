import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export const { handler, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: 'ffewfw',
            clientSecret: 'fwefwefw'
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "text",
                    placeholder: "your@email.com"
                },
                password: {
                    label: "Password",
                    type: "password"
                }
            },
            authorize: async (credentials) => {
                // Add your user authentication logic here
                // Return user object if authentication is successful, otherwise return null
                console.log("Received credentials:", credentials);
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                // Your auth logic
                return {
                    id: "1", // dummy
                    email: credentials.email
                };
            }
        })
    ],
    callbacks: {

    },
    pages: {

    }
})
