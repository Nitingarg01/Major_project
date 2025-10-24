import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import client from "@/lib/db";
import { compare } from "bcrypt-ts";
import { DBUser } from "@/types/user";

export const { auth, signIn, signOut, handlers } = NextAuth({
    debug: true,
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours
        updateAge: 15 * 60, // Update session every 15 minutes
    },
    cookies: {
        sessionToken: {
            name: 'next-auth.session-token',
            options: {
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 // 24 hours
            }
        }
    },
    trustHost: true, // This helps with session validation in some environments
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
                    throw new Error("Please Enter Valid Credentials!");
                }

                const dbClient = client;
                const db = dbClient.db("Cluster0");

                const user = await db.collection("users").findOne({ email: email });
                if (!user) {
                    throw new Error("Invalid Email or Password");
                }
                if (!user.password) {
                    throw new Error("Please sign in with Google or reset your password");
                }

                const isMatch = await compare(password, user?.password);

                if (!isMatch) {
                    throw new Error("Invalid Email or Password");
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
        async jwt({ token, user, account, profile }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
            } else if (!token.id && token.email) {
                try {
                    const db = client.db("Cluster0");
                    const existingUser = await db
                        .collection("users")
                        .findOne({ email: token.email });
                    if (existingUser) {
                        token.id = existingUser._id.toString();
                    }
                } catch (error) {
                    console.error("Error fetching user in JWT callback:", error)
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.email = token.email!;
                session.user.name = token.name;
            }
            return session;
        },
        signIn: async ({ user, account, profile }) => {
            try {
                const dbClient = client;
                const db = dbClient.db("Cluster0");

                if (account?.provider === 'google') {
                    const { email, id, name } = user;

                    if (!email) {
                        console.error("No email provided by Google");
                        return false;
                    }

                    const alreadyUser = await db.collection("users").findOne({ 
                        email: email.toLowerCase() 
                    });

                    if (alreadyUser) {
                        // Update existing user with Google ID if missing
                        if (!alreadyUser.googleId) {
                            await db.collection('users').updateOne(
                                { email: email.toLowerCase() },
                                {
                                    $set: {
                                        googleId: id,
                                        updatedAt: new Date()
                                    }
                                }
                            );
                        }
                        // Set user.id to existing user's ID for consistency
                        user.id = alreadyUser._id.toString();
                    } else {
                        // Create new user
                        const newUser = await db.collection("users").insertOne({
                            email: email.toLowerCase(),
                            name: name,
                            googleId: id,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });
                        user.id = newUser.insertedId.toString();
                    }

                    return true;
                } else if (account?.provider === 'credentials') {
                    // For credentials provider, user.id should already be set from authorize
                    return true;
                }

                return true;
            } catch (error) {
                console.error("Error in signIn callback:", error);
                return false;
            }
        }
    },
    pages: {
        signIn: '/login',
        newUser: '/signup'
    }
})