import { describe, it, expect } from "vitest"
import {
    parseSpotlightContent,
    serializeSpotlightContent,
    type SpotlightContent,
} from "@/lib/spotlightContent"

describe("spotlightContent parse/serialize", () => {
    it("round-trips structured content", () => {
        const content: SpotlightContent = {
            details: ["Program Manager", "Galileo High School", "Class of 2025"],
            questions: [
                { question: "Why HIM?", answer: "Because it's great." },
                { question: "Favorite memory?", answer: "First paragraph.\n\nSecond paragraph." },
            ],
        }
        expect(parseSpotlightContent(serializeSpotlightContent(content))).toEqual(content)
    })

    it("drops empty detail lines and blank Q&A pairs on serialize", () => {
        const serialized = serializeSpotlightContent({
            details: ["Keep", "  ", ""],
            questions: [
                { question: "Q", answer: "A" },
                { question: "  ", answer: "" },
                { question: "", answer: "just an answer" },
            ],
        })
        expect(JSON.parse(serialized)).toEqual({
            details: ["Keep"],
            questions: [
                { question: "Q", answer: "A" },
                { question: "", answer: "just an answer" },
            ],
        })
    })

    it("trims whitespace on serialize", () => {
        const serialized = serializeSpotlightContent({
            details: ["  spaced  "],
            questions: [{ question: "  Q  ", answer: "  A  " }],
        })
        expect(JSON.parse(serialized)).toEqual({
            details: ["spaced"],
            questions: [{ question: "Q", answer: "A" }],
        })
    })

    it("returns empty content for null/undefined/empty input", () => {
        const empty = { details: [], questions: [] }
        expect(parseSpotlightContent(null)).toEqual(empty)
        expect(parseSpotlightContent(undefined)).toEqual(empty)
        expect(parseSpotlightContent("")).toEqual(empty)
    })

    it("returns empty content for legacy HTML (non-JSON) safely", () => {
        expect(parseSpotlightContent("<p>Fall '17 Intern</p><p><strong>Q?</strong></p>"))
            .toEqual({ details: [], questions: [] })
    })

    it("returns empty content for malformed JSON of the wrong shape", () => {
        expect(parseSpotlightContent(JSON.stringify({ foo: "bar" })))
            .toEqual({ details: [], questions: [] })
        expect(parseSpotlightContent(JSON.stringify({ details: "not-array", questions: [] })))
            .toEqual({ details: [], questions: [] })
    })
})
