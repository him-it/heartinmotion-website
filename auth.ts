import NextAuth from "next-auth"

import authConfig from "./auth.config"
import { getUserByEmail } from "./actions/account/user"

export const {
    handlers: { GET, POST },
    auth, 
    signIn,
    signOut
} = NextAuth({
    pages: {
        signIn: "/",
        signOut: "/"
    },
    callbacks: {
        async session({ token, session }) {
            if(token.member_id && session.user)
                session.user.member_id = token.member_id as number

            if(token.admin_level as 0 | 2 | 4 | 10 >= 0 && session.user) {
                session.user.admin_level = token.admin_level as 0 | 2 | 4 | 10
            }

            return session
        },
        async jwt({ token }) {
            if(!token.email)
                return token

            const existingUser = await getUserByEmail(token.email)

            if(!existingUser)
                return token

            token.member_id = existingUser.id

            if(existingUser.member_memberrestricted && existingUser.member_memberrestricted.admin_level >= 0) 
                token.admin_level = existingUser.member_memberrestricted.admin_level

            return token
        }
    },
    session: {strategy: "jwt"},
    ...authConfig 
})