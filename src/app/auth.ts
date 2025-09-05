import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import client from "@/lib/db";
import { compare } from "bcrypt-ts"
import { DBUser } from "@/types/user";

export const { auth, signIn, signOut, handlers } = NextAuth({
    debug: true,
    session: {
        strategy: "jwt"
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID ?? '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
            allowDangerousEmailAccountLinking: true
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
            authorize: async (credentials, req: Request) => {
                const email = credentials?.email as string | undefined;
                const password = credentials?.password as string | undefined;

                if (!email || !password) {
                    throw new Error("Please Enter Valid Credentials!")
                }

                const dbClient = client;
                const db = dbClient.db("Cluster0")

                const user = await db.collection("users").findOne({ email: email });
                if (!user) {
                    throw new Error("Invalid Email or Password")
                }
                if (!user.password) {
                    throw new Error("Please sign in with Google or reset your password")
                }

                const isMatch = await compare(password, user?.password)

                if (!isMatch) {
                    throw new Error("Invalid Email or Password")
                }

                return {
                    name: user.name,
                    email: user.email,
                    id: user._id.toString(),
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
            } else if (!token.id && token.email) {
                const db = client.db("Cluster0");
                const existingUser = await db
                    .collection("users")
                    .findOne({ email: token.email });
                if (existingUser) {
                    token.id = existingUser._id.toString();
                }
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id as string;
            session.user.email = token.email!;
            session.user.name = token.name;
            return session;
        },
        signIn: async ({ user, account }) => {
            const dbClient = client;
            const db = dbClient.db()

            if (account?.provider === 'google') {
                try {
                    const { email, id, name, } = user

                    const alreadyUser = await db.collection("users").findOne({ email: email?.toLowerCase() })

                    if (alreadyUser) {
                        if (!alreadyUser.googleId) {
                            await db.collection('users').updateOne(
                                { email: email?.toLocaleLowerCase() },
                                {
                                    $set: {
                                        googleId: id,
                                        updatedAt: new Date()
                                    }
                                }
                            )
                        }
                    } else {
                        await db.collection("users").insertOne({
                            email: email?.toLowerCase(),
                            name: name,
                            googleId: id,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });
                    }

                    return true
                } catch (error) {
                    console.error("Error in Google signIn callback:", error);
                    throw new Error("Error while Creating User")
                }
            }
            return true
        }
    },
    pages: {
        signIn: '/login',
        newUser: '/signup',
    }
})