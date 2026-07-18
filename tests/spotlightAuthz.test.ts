import { describe, it, expect, vi, beforeEach } from "vitest"

/**
 * Access-control tests for the spotlight admin CRUD actions.
 *
 * Server actions are public HTTP endpoints, so every admin action must
 * independently reject non-admin callers (requireAdmin(4)) BEFORE touching the
 * database. The public read actions must never leak the image blob or hidden
 * rows. The session accessor and Prisma client are mocked so the actions run
 * in isolation.
 */

const currentUser = vi.fn()
vi.mock("@/lib/auth", () => ({ currentUser: () => currentUser() }))

const db = vi.hoisted(() => ({
    him_spotlight: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}))
vi.mock("@/lib/db", () => ({ db }))

import {
    getSpotlights,
    getSpotlightById,
    getSpotlightsAdmin,
    getSpotlightByIdAdmin,
    createSpotlight,
    updateSpotlight,
    deleteSpotlight,
} from "@/actions/leadership/spotlight"

const user = (admin_level: number | undefined) =>
    ({ member_id: 1, admin_level, email: "u@example.com" })

const validData = {
    name: "Jane Doe",
    category: "Officer" as const,
    post_date: new Date("2024-01-01"),
    hidden: false,
}

const validContent = {
    details: ["Program Manager", "Some School", "Class of 2025"],
    questions: [{ question: "Why HIM?", answer: "Because." }],
}

beforeEach(() => {
    currentUser.mockReset()
    for (const fn of Object.values(db.him_spotlight))
        fn.mockReset()
})

// ── Admin actions must gate on requireAdmin(4) ──────────────────────────────

const adminReads: Array<[string, () => Promise<unknown>, () => ReturnType<typeof vi.fn>]> = [
    ["getSpotlightsAdmin", () => getSpotlightsAdmin(), () => db.him_spotlight.findMany],
    ["getSpotlightByIdAdmin", () => getSpotlightByIdAdmin(1), () => db.him_spotlight.findUnique],
]

describe.each(adminReads)("%s — admin-only read", (_name, action, query) => {
    it("returns null and never queries when unauthenticated", async () => {
        currentUser.mockResolvedValue(undefined)
        query().mockResolvedValue([{ secret: true }])

        expect(await action()).toBeNull()
        expect(query()).not.toHaveBeenCalled()
    })

    it("returns null and never queries for a plain member", async () => {
        currentUser.mockResolvedValue(user(0))
        query().mockResolvedValue([{ secret: true }])

        expect(await action()).toBeNull()
        expect(query()).not.toHaveBeenCalled()
    })

    it("returns null and never queries for a junior admin (level 2)", async () => {
        currentUser.mockResolvedValue(user(2))
        query().mockResolvedValue([{ secret: true }])

        expect(await action()).toBeNull()
        expect(query()).not.toHaveBeenCalled()
    })
})

const adminWrites: Array<[string, () => Promise<{ error?: string }>, () => ReturnType<typeof vi.fn>]> = [
    ["createSpotlight", () => createSpotlight(validData, validContent), () => db.him_spotlight.create],
    ["updateSpotlight", () => updateSpotlight(1, validData, validContent), () => db.him_spotlight.update],
    ["deleteSpotlight", () => deleteSpotlight(1), () => db.him_spotlight.delete],
]

describe.each(adminWrites)("%s — admin-only mutation", (_name, action, query) => {
    it("is rejected and never mutates when unauthenticated", async () => {
        currentUser.mockResolvedValue(undefined)

        expect((await action()).error).toBeTruthy()
        expect(query()).not.toHaveBeenCalled()
    })

    it("is rejected and never mutates for a plain member", async () => {
        currentUser.mockResolvedValue(user(0))

        expect((await action()).error).toBeTruthy()
        expect(query()).not.toHaveBeenCalled()
    })

    it("is rejected and never mutates for a basic admin below level 4", async () => {
        currentUser.mockResolvedValue(user(2))

        expect((await action()).error).toBeTruthy()
        expect(query()).not.toHaveBeenCalled()
    })
})

describe("admin actions run for a level-4 admin", () => {
    it("createSpotlight persists and returns the new id", async () => {
        currentUser.mockResolvedValue(user(4))
        db.him_spotlight.create.mockResolvedValue({ id: 42 })

        const res = await createSpotlight(validData, validContent)
        expect(res).toMatchObject({ id: 42 })
        expect(db.him_spotlight.create).toHaveBeenCalledOnce()
    })

    it("createSpotlight serializes structured content to a JSON string", async () => {
        currentUser.mockResolvedValue(user(4))
        db.him_spotlight.create.mockResolvedValue({ id: 42 })

        await createSpotlight(validData, validContent)
        const arg = db.him_spotlight.create.mock.calls[0][0]
        expect(typeof arg.data.content).toBe("string")
        expect(JSON.parse(arg.data.content)).toEqual(validContent)
    })

    it("createSpotlight rejects invalid fields without querying", async () => {
        currentUser.mockResolvedValue(user(4))

        const res = await createSpotlight({ ...validData, category: "Nope" as never }, validContent)
        expect(res.error).toBeTruthy()
        expect(db.him_spotlight.create).not.toHaveBeenCalled()
    })

    it("deleteSpotlight removes the row", async () => {
        currentUser.mockResolvedValue(user(4))
        db.him_spotlight.delete.mockResolvedValue({ id: 1 })

        const res = await deleteSpotlight(1)
        expect(res.success).toBeTruthy()
        expect(db.him_spotlight.delete).toHaveBeenCalledOnce()
    })
})

// ── Public reads must not leak blobs or hidden rows ─────────────────────────

describe("public spotlight reads — no blob, no hidden rows", () => {
    it("getSpotlights selects metadata only and filters hidden", async () => {
        db.him_spotlight.findMany.mockResolvedValue([])
        await getSpotlights()

        const arg = db.him_spotlight.findMany.mock.calls[0][0]
        expect(arg.where.hidden).toBe(false)
        expect(arg.select.image).toBeUndefined()
        expect(arg.select.content).toBeUndefined()
    })

    it("getSpotlightById filters hidden and never selects the image blob", async () => {
        db.him_spotlight.findUnique.mockResolvedValue(null)
        await getSpotlightById(1)

        const arg = db.him_spotlight.findUnique.mock.calls[0][0]
        expect(arg.where.hidden).toBe(false)
        expect(arg.select.image).toBeUndefined()
    })
})
