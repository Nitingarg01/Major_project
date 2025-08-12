import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      credits?: number;
    } & DefaultSession["user"];
  }
  interface User extends DefaultUser {
    credits?: number;
  }
}