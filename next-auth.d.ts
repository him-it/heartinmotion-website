import NextAuth, { DefaultSession } from "next-auth"

export type ExtendedUser = DefaultSession["user"] & {
    admin_level: 0 | 2 | 4 | 10,
    member_id: number
}

declare module "next-auth" {
    interface Session {
        user: ExtendedUser
    }
}