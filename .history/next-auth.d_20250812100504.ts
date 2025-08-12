// next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;       // ✅ optional, since you add it in callbacks
      credits?: number;  // ✅ your custom field
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    credits?: number; // shows up in 'user' param of JWT callback
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    credits?: number;
  }
}
