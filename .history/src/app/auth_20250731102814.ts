import NextAuth, { CredentialsSignin, User } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import client from "@/lib/db";
import { compare } from "bcrypt-ts"
import { DBUser } from "@/types/user";

export const { auth, signIn, signOut, handlers } = NextAuth({
    adapter: MongoDBAdapter(client),
    session: {
        strategy: "jwt"
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID ?? '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ''
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
                console.log(email, password)

                if (!email || !password) {
                    throw new CredentialsSignin("Please Enter Valid Credentials!")
                }

                const dbClient = client;
                const db = dbClient.db()

                const user = await db.collection<DBUser>("users").findOne({ email: email });
                if (!user) {
                    throw new CredentialsSignin("Invalid Email or Password")
                }
                const isMatch = await compare(password, user?.password)

                if (!isMatch) {
                    throw new CredentialsSignin("Invalid Email or Password")
                }
                console.log({
                    name: user.name,
                    email: user.email,
                    id: user._id
                })
                return {
                    name: user.name,
                    email: user.email,
                    id: user._id
                } satisfies User
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id;
            session.user.email = token.email;
            session.user.name = token.name;
            return session;
        }
    },
    pages: {
        signIn: '/login',
        newUser: '/signup',
    }
})

