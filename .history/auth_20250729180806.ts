import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export const {handler,signIn,signOut,auth} = NextAuth({
    providers:[

    ],
    callbacks:{

    },
    pages:{

    }
})
