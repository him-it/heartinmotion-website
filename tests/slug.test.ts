import { describe, it, expect } from "vitest"
import { slugify } from "@/lib/slug"

describe("slugify", () => {
    it("lowercases and hyphenates spaces", () => {
        expect(slugify("Beach Cleanup")).toBe("beach-cleanup")
    })

    it("collapses repeated spaces into a single hyphen", () => {
        expect(slugify("Food   Drive")).toBe("food-drive")
    })

    it("strips punctuation and symbols", () => {
        expect(slugify("Winter Gala 2026!")).toBe("winter-gala-2026")
    })

    it("trims leading and trailing whitespace and hyphens", () => {
        expect(slugify("  --Spring Fair--  ")).toBe("spring-fair")
    })

    it("collapses repeated hyphens", () => {
        expect(slugify("A - B - C")).toBe("a-b-c")
    })

    it("returns an empty string for symbol-only input", () => {
        expect(slugify("!!!")).toBe("")
    })
})
