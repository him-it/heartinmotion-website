import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock the session accessor so the guards can be tested without NextAuth/Prisma.
const currentUser = vi.fn()
vi.mock("@/lib/auth", () => ({
    currentUser: () => currentUser(),
}))

import {
    requireSession,
    requireMember,
    requireAdmin,
    requireSelfOrAdmin,
} from "@/lib/authGuard"

const member = { member_id: 42, admin_level: 0 }
const juniorAdmin = { member_id: 7, admin_level: 2 }
const basicAdmin = { member_id: 8, admin_level: 4 }
const superAdmin = { member_id: 9, admin_level: 10 }
const nonMember = { member_id: undefined, admin_level: undefined, email: "new@example.com" }

beforeEach(() => {
    currentUser.mockReset()
})

describe("requireSession", () => {
    it("returns null when logged out", async () => {
        currentUser.mockResolvedValue(undefined)
        expect(await requireSession()).toBeNull()
    })

    it("returns the user when logged in (even without a member record)", async () => {
        currentUser.mockResolvedValue(nonMember)
        expect(await requireSession()).toBe(nonMember)
    })
})

describe("requireMember", () => {
    it("returns null when logged out", async () => {
        currentUser.mockResolvedValue(undefined)
        expect(await requireMember()).toBeNull()
    })

    it("returns null for a logged-in non-member", async () => {
        currentUser.mockResolvedValue(nonMember)
        expect(await requireMember()).toBeNull()
    })

    it("returns the user for a member", async () => {
        currentUser.mockResolvedValue(member)
        expect(await requireMember()).toBe(member)
    })
})

describe("requireAdmin", () => {
    it("returns null when logged out", async () => {
        currentUser.mockResolvedValue(undefined)
        expect(await requireAdmin(2)).toBeNull()
    })

    it("returns null for a plain member", async () => {
        currentUser.mockResolvedValue(member)
        expect(await requireAdmin(2)).toBeNull()
    })

    it("rejects an admin below the required level", async () => {
        currentUser.mockResolvedValue(juniorAdmin)
        expect(await requireAdmin(4)).toBeNull()
    })

    it("accepts an admin at exactly the required level", async () => {
        currentUser.mockResolvedValue(basicAdmin)
        expect(await requireAdmin(4)).toBe(basicAdmin)
    })

    it("accepts an admin above the required level", async () => {
        currentUser.mockResolvedValue(superAdmin)
        expect(await requireAdmin(4)).toBe(superAdmin)
    })

    it("guards the super-admin tier", async () => {
        currentUser.mockResolvedValue(basicAdmin)
        expect(await requireAdmin(10)).toBeNull()
        currentUser.mockResolvedValue(superAdmin)
        expect(await requireAdmin(10)).toBe(superAdmin)
    })
})

describe("requireSelfOrAdmin", () => {
    it("allows a member to access their own record", async () => {
        currentUser.mockResolvedValue(member)
        expect(await requireSelfOrAdmin(42)).toBe(member)
    })

    it("denies a member accessing someone else's record", async () => {
        currentUser.mockResolvedValue(member)
        expect(await requireSelfOrAdmin(99)).toBeNull()
    })

    it("allows an admin to access another member's record", async () => {
        currentUser.mockResolvedValue(juniorAdmin)
        expect(await requireSelfOrAdmin(99)).toBe(juniorAdmin)
    })

    it("denies a below-threshold admin accessing another record", async () => {
        currentUser.mockResolvedValue(member)
        expect(await requireSelfOrAdmin(99, 2)).toBeNull()
    })

    it("returns null when logged out", async () => {
        currentUser.mockResolvedValue(undefined)
        expect(await requireSelfOrAdmin(42)).toBeNull()
    })
})
