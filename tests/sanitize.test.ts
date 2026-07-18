// @vitest-environment jsdom
import { describe, it, expect } from "vitest"
import { sanitizeHtml } from "@/lib/sanitize"

describe("sanitizeHtml", () => {
    it("returns an empty string for null/undefined/empty input", () => {
        expect(sanitizeHtml(null)).toBe("")
        expect(sanitizeHtml(undefined)).toBe("")
        expect(sanitizeHtml("")).toBe("")
    })

    it("preserves safe formatting markup", () => {
        const html = "<p>Hello <strong>world</strong></p>"
        expect(sanitizeHtml(html)).toBe(html)
    })

    it("strips <script> tags", () => {
        const out = sanitizeHtml('<p>ok</p><script>alert(1)</script>')
        expect(out).not.toContain("<script")
        expect(out).not.toContain("alert(1)")
    })

    it("removes inline event handlers", () => {
        const out = sanitizeHtml('<img src="x" onerror="alert(1)">')
        expect(out.toLowerCase()).not.toContain("onerror")
    })

    it("strips javascript: URLs", () => {
        const out = sanitizeHtml('<a href="javascript:alert(1)">click</a>')
        expect(out.toLowerCase()).not.toContain("javascript:")
    })

    it("keeps anchor targets on legitimate links", () => {
        const out = sanitizeHtml('<a href="https://example.com" target="_blank">link</a>')
        expect(out).toContain('href="https://example.com"')
        expect(out).toContain('target="_blank"')
    })

    it("allows a trusted YouTube embed iframe", () => {
        const out = sanitizeHtml('<iframe src="https://www.youtube.com/embed/abc123" allowfullscreen></iframe>')
        expect(out).toContain("<iframe")
        expect(out).toContain("youtube.com/embed/abc123")
    })

    it("strips an iframe pointing at an untrusted host", () => {
        const out = sanitizeHtml('<iframe src="https://evil.example.com/phish"></iframe>')
        expect(out).not.toContain("evil.example.com")
        expect(out).not.toContain("<iframe")
    })
})
