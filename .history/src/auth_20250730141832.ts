import NextAuth from "next-auth";

export const {handlers,signIn,signout,auth} = NextAuth({
providers:[]
})