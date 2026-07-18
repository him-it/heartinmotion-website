import { db } from "@/lib/db"

/**
 * Internal member lookup used during authentication (the NextAuth `jwt`
 * callback) and registration. This is intentionally NOT a `"use server"`
 * action: it must run before a session exists, so it cannot be guarded, and
 * therefore must never be exposed as a callable endpoint.
 */
export const getMemberByEmail = async (email: string) => {
    try {
        const user = await db.member_member.findUnique({
            where: {
                email
            },
            include: {
                member_memberrestricted: true,
                member_memberprivate: true
            }
        })
        return user
    } catch {
        return null
    }
}
