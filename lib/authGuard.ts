import { currentUser } from "@/lib/auth"

/**
 * Authorization helpers for server actions.
 *
 * Server actions are exposed as public HTTP endpoints, so every action that
 * reads or mutates privileged data must independently verify the caller —
 * middleware only guards page navigation, not the actions themselves.
 *
 * Admin levels: 0 = member, 2 = junior admin, 4 = basic admin, 10 = super admin.
 */

/** Returns the session user only when logged in, otherwise null. */
export const requireSession = async () => {
    const user = await currentUser()
    return user ?? null
}

/** Returns the session user only when they are a registered member, otherwise null. */
export const requireMember = async () => {
    const user = await currentUser()
    if (!user || user.member_id === undefined || user.member_id === null)
        return null
    return user
}

/** Returns the session user only when their admin level meets `minLevel`, otherwise null. */
export const requireAdmin = async (minLevel: number) => {
    const user = await currentUser()
    if (!user)
        return null

    const level = user.admin_level
    if (level === undefined || level === null || level < minLevel)
        return null

    return user
}

/**
 * Returns the session user when they own `memberId` (self-access) or are at
 * least `adminLevel`, otherwise null. Use for records scoped to a single member.
 */
export const requireSelfOrAdmin = async (memberId: number, adminLevel = 2) => {
    const user = await currentUser()
    if (!user)
        return null

    if (user.member_id === memberId)
        return user

    const level = user.admin_level
    if (level !== undefined && level !== null && level >= adminLevel)
        return user

    return null
}
