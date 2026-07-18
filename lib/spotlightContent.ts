import { SpotlightContentSchema } from "@/schemas"

/**
 * Structured spotlight content. Stored as a JSON string in the existing
 * `him_spotlight.content` LongText column (no schema migration needed):
 *
 *   - `details`   free-text description lines (role, school, class, …)
 *   - `questions` interview-style { question, answer } pairs
 *
 * Answers keep `\n\n` between paragraphs. Everything is plain text — the public
 * page renders it through React (which escapes), so unlike the old HTML blob it
 * carries no stored-XSS surface and needs no sanitization.
 */
export type SpotlightContent = {
    details: string[]
    questions: { question: string; answer: string }[]
}

export const EMPTY_SPOTLIGHT_CONTENT: SpotlightContent = { details: [], questions: [] }

/**
 * Parse the stored `content` string into structured form. Returns empty content
 * for anything that isn't our JSON shape (legacy HTML, un-migrated rows, junk),
 * so callers never have to guard against a throw.
 */
export const parseSpotlightContent = (raw: string | null | undefined): SpotlightContent => {
    if (!raw)
        return { details: [], questions: [] }

    try {
        const parsed = SpotlightContentSchema.safeParse(JSON.parse(raw))
        if (parsed.success)
            return parsed.data
    } catch {
        // not JSON — fall through
    }
    return { details: [], questions: [] }
}

/**
 * Serialize structured content back to a JSON string for storage, trimming each
 * field and dropping empty detail lines and blank Q&A pairs.
 */
export const serializeSpotlightContent = (content: SpotlightContent): string => {
    const details = content.details
        .map(d => d.trim())
        .filter(Boolean)

    const questions = content.questions
        .map(q => ({ question: q.question.trim(), answer: q.answer.trim() }))
        .filter(q => q.question || q.answer)

    return JSON.stringify({ details, questions })
}
