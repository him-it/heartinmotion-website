import { describe, it, expect, vi, beforeEach } from "vitest"

/**
 * Regression tests for the reported broken-access-control attacks:
 *
 *  1. POST /account/hours with an arbitrary member id  → getHours
 *  3. POST /account/shifts with an arbitrary member id → getRegisteredShifts
 *  (also getUserById — full PII by member id, and getWaitlistedShifts)
 *
 *  2. POST /volunteer/events/<slug> to harvest every volunteer's member id
 *     for an event's entire history → must go through getPublicEventBySlug,
 *     which returns capacity counts only (no member records), and the
 *     PII-bearing admin getEventBySlug must require an admin session.
 *
 * The session accessor and Prisma client are mocked so the actions run in
 * isolation. The key assertions: an unauthorised caller gets null WITHOUT the
 * database ever being queried, and the public event query structurally cannot
 * select member data.
 */

const currentUser = vi.fn()
vi.mock("@/lib/auth", () => ({ currentUser: () => currentUser() }))

const db = vi.hoisted(() => ({
    member_member: { findUnique: vi.fn() },
    events_eventshiftmember: { findMany: vi.fn() },
    events_eventsignup_shifts: { findMany: vi.fn() },
    events_event: { findFirst: vi.fn(), findUnique: vi.fn() },
}))
vi.mock("@/lib/db", () => ({ db }))

import { getUserById, getHours, getRegisteredShifts, getWaitlistedShifts } from "@/actions/account/user"
import { getEventBySlug } from "@/actions/admin/event"
import { getPublicEventBySlug } from "@/actions/volunteer/event"

const user = (member_id: number | undefined, admin_level: number | undefined) =>
    ({ member_id, admin_level, email: `u${member_id}@example.com` })

beforeEach(() => {
    currentUser.mockReset()
    for (const model of Object.values(db))
        for (const fn of Object.values(model))
            fn.mockReset()
})

// ── Attacks 1 & 3: self-scoped account data ────────────────────────────────

const selfScoped: Array<[string, (id: number) => Promise<unknown>, () => ReturnType<typeof vi.fn>]> = [
    ["getHours", getHours, () => db.events_eventshiftmember.findMany],
    ["getRegisteredShifts", getRegisteredShifts, () => db.events_eventshiftmember.findMany],
    ["getWaitlistedShifts", getWaitlistedShifts, () => db.events_eventsignup_shifts.findMany],
    ["getUserById", getUserById, () => db.member_member.findUnique],
]

describe.each(selfScoped)("%s — self-scoped access", (_name, action, query) => {
    it("returns null and never touches the DB when unauthenticated", async () => {
        currentUser.mockResolvedValue(undefined)
        query().mockResolvedValue([{ secret: true }])

        expect(await action(2)).toBeNull()
        expect(query()).not.toHaveBeenCalled()
    })

    it("returns null and never touches the DB when querying someone else's id", async () => {
        currentUser.mockResolvedValue(user(1, 0)) // logged in as member 1
        query().mockResolvedValue([{ secret: true }])

        expect(await action(2)).toBeNull() // asking for member 2
        expect(query()).not.toHaveBeenCalled()
    })

    it("returns data for the caller's own id", async () => {
        currentUser.mockResolvedValue(user(2, 0))
        query().mockResolvedValue([{ mine: true }])

        expect(await action(2)).toEqual([{ mine: true }])
        expect(query()).toHaveBeenCalledOnce()
    })

    it("allows an admin to read another member's record", async () => {
        currentUser.mockResolvedValue(user(9, 4))
        query().mockResolvedValue([{ ok: true }])

        expect(await action(2)).toEqual([{ ok: true }])
        expect(query()).toHaveBeenCalledOnce()
    })
})

// ── Attack 2: event-history enumeration ─────────────────────────────────────

describe("getPublicEventBySlug — no volunteer PII", () => {
    it("selects capacity counts only — never member records or signups", async () => {
        db.events_event.findFirst.mockResolvedValue({ id: 1, events_eventshift: [] })
        await getPublicEventBySlug("hot-chocolate")

        const arg = db.events_event.findFirst.mock.calls[0][0]
        const serialized = JSON.stringify(arg)

        // The query must not be able to return who signed up.
        expect(serialized).not.toContain("member_member")
        expect(serialized).not.toContain("events_eventsignup")
        // It only counts registrants; it never selects their ids.
        expect(arg.select.events_eventshift.select._count).toBeTruthy()
    })

    it("refuses hidden events at the database level", async () => {
        db.events_event.findFirst.mockResolvedValue(null)
        await getPublicEventBySlug("secret-event")

        const arg = db.events_event.findFirst.mock.calls[0][0]
        expect(arg.where.hidden).toBe(false)
    })
})

describe("admin getEventBySlug — PII requires an admin session", () => {
    it("returns null and never queries when the caller is not an admin", async () => {
        currentUser.mockResolvedValue(user(1, 0)) // a plain member
        db.events_event.findUnique.mockResolvedValue({ id: 1 })

        expect(await getEventBySlug("hot-chocolate")).toBeNull()
        expect(db.events_event.findUnique).not.toHaveBeenCalled()
    })

    it("returns null and never queries when unauthenticated", async () => {
        currentUser.mockResolvedValue(undefined)
        db.events_event.findUnique.mockResolvedValue({ id: 1 })

        expect(await getEventBySlug("hot-chocolate")).toBeNull()
        expect(db.events_event.findUnique).not.toHaveBeenCalled()
    })

    it("queries for an admin (level 4+)", async () => {
        currentUser.mockResolvedValue(user(9, 4))
        db.events_event.findUnique.mockResolvedValue({ id: 1 })

        expect(await getEventBySlug("hot-chocolate")).toEqual({ id: 1 })
        expect(db.events_event.findUnique).toHaveBeenCalledOnce()
    })
})
