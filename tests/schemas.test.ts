import { describe, it, expect } from "vitest"
import { AccountSchema, ShiftSchema, AddManagerSchema } from "@/schemas"

const validAccount = {
    email: "volunteer@example.com",
    first_name: "Sam",
    last_name: "Lee",
    address: "123 Main St",
    city: "San Francisco",
    zip: "94110",
    cell_phone: "415-555-1234",
    home_phone: "415-555-5678",
    dob: "2008-05-01",
    school: "Lowell",
    homeroom: "204",
    graduating_year: "2026",
    shirt_size: "M",
    activities: "Track",
    friends: "None",
    referrer: "Website",
    emergency_contact_name: "Pat Lee",
    emergency_contact_phone: "415-555-9999",
    emergency_contact_dob: "1980-01-01",
    twitter_url: "instagram.com/sam",
}

describe("AccountSchema", () => {
    it("accepts a well-formed account", () => {
        expect(AccountSchema.safeParse(validAccount).success).toBe(true)
    })

    it("rejects an invalid email", () => {
        const res = AccountSchema.safeParse({ ...validAccount, email: "not-an-email" })
        expect(res.success).toBe(false)
    })

    it("rejects a ZIP that is not 5 digits", () => {
        expect(AccountSchema.safeParse({ ...validAccount, zip: "941" }).success).toBe(false)
        expect(AccountSchema.safeParse({ ...validAccount, zip: "abcde" }).success).toBe(false)
    })

    it("rejects a malformed phone number", () => {
        const res = AccountSchema.safeParse({ ...validAccount, cell_phone: "4155551234" })
        expect(res.success).toBe(false)
    })

    it("rejects a non-4-digit graduating year", () => {
        expect(AccountSchema.safeParse({ ...validAccount, graduating_year: "26" }).success).toBe(false)
    })
})

describe("ShiftSchema", () => {
    const validShift = {
        description: "Morning setup",
        location: "Community Center",
        spots: 10,
        start_time: "2026-08-01T09:00",
        end_time: "2026-08-01T12:00",
        event_id: 1,
    }

    it("accepts a valid shift", () => {
        expect(ShiftSchema.safeParse(validShift).success).toBe(true)
    })

    it("rejects a non-datetime start_time", () => {
        expect(ShiftSchema.safeParse({ ...validShift, start_time: "tomorrow" }).success).toBe(false)
    })

    it("rejects a non-numeric spots value", () => {
        expect(ShiftSchema.safeParse({ ...validShift, spots: "ten" }).success).toBe(false)
    })
})

describe("AddManagerSchema", () => {
    it("requires both id and admin_level", () => {
        expect(AddManagerSchema.safeParse({ id: "5", admin_level: "4" }).success).toBe(true)
        expect(AddManagerSchema.safeParse({ id: "", admin_level: "4" }).success).toBe(false)
        expect(AddManagerSchema.safeParse({ id: "5", admin_level: "" }).success).toBe(false)
    })
})
