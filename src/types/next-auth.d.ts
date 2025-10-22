// next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { AdapterUser } from "next-auth/adapters";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string,
      credits?: number
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    credits?: number
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser {
    credits?: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string,
    credits?: number
  }
}
