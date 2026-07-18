"use server"

import * as z from "zod"

import { db } from "@/lib/db"
import { SpotlightSchema, SpotlightContentSchema } from "@/schemas"
import { requireAdmin } from "@/lib/authGuard"
import { parseSpotlightContent, serializeSpotlightContent, type SpotlightContent } from "@/lib/spotlightContent"

export const getSpotlights = async () => {
    try {
        // List view only needs card metadata — never the image blob or the
        // full content HTML, which would balloon the payload for 200+ rows.
        const spotlights = await db.him_spotlight.findMany({
            where: {
                hidden: false
            },
            select: {
                id: true,
                name: true,
                category: true,
                post_date: true
            },
            orderBy: {
                post_date: 'desc'
            }
        })
        return spotlights
    } catch {
        return null
    }
}

export const getSpotlightById = async (id: number) => {
    try {
        const spotlight = await db.him_spotlight.findUnique({
            where: {
                id,
                hidden: false
            },
            select: {
                id: true,
                name: true,
                category: true,
                content: true,
                post_date: true
            }
        })
        if (!spotlight)
            return null

        return { ...spotlight, content: parseSpotlightContent(spotlight.content) }
    } catch {
        return null
    }
}

// ---------------------------------------------------------------------------
// Admin CRUD
//
// Server actions are public HTTP endpoints, so every admin action independently
// verifies the caller with requireAdmin(4) (basic admin) — middleware only
// guards page navigation, not the actions themselves.
// ---------------------------------------------------------------------------

export const getSpotlightsAdmin = async () => {
    if (!(await requireAdmin(4)))
        return null

    try {
        // List view — metadata only, never the image blob or full content, so
        // the payload stays small across all 240+ rows.
        const spotlights = await db.him_spotlight.findMany({
            select: {
                id: true,
                name: true,
                category: true,
                post_date: true,
                hidden: true,
                image_mime: true
            },
            orderBy: {
                post_date: 'desc'
            }
        })
        // Report whether each row has a photo without shipping the bytes.
        return spotlights.map(({ image_mime, ...rest }) => ({
            ...rest,
            has_image: image_mime !== null
        }))
    } catch {
        return null
    }
}

export const getSpotlightByIdAdmin = async (id: number) => {
    if (!(await requireAdmin(4)))
        return null

    try {
        const spotlight = await db.him_spotlight.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                category: true,
                content: true,
                post_date: true,
                hidden: true,
                image: true,
                image_mime: true
            }
        })
        if (!spotlight)
            return null

        // Hand the image to the client as a data URL so the edit form can
        // preview the current photo (the public image route 404s hidden rows),
        // and the content as structured details + Q&A for the editor.
        const { image, image_mime, content, ...rest } = spotlight
        return {
            ...rest,
            content: parseSpotlightContent(content),
            image: image && image_mime
                ? `data:${image_mime};base64,${Buffer.from(image).toString('base64')}`
                : null
        }
    } catch {
        return null
    }
}

export const createSpotlight = async (
    data: z.infer<typeof SpotlightSchema>,
    content: SpotlightContent,
    image?: { data: string, mime: string }
) => {
    if (!(await requireAdmin(4)))
        return { error: "Unauthorized." }

    const validatedFields = SpotlightSchema.safeParse(data)
    if (!validatedFields.success)
        return { error: "Invalid fields!" }

    const validatedContent = SpotlightContentSchema.safeParse(content)
    if (!validatedContent.success)
        return { error: "Invalid fields!" }

    try {
        const created = await db.him_spotlight.create({
            data: {
                name: data.name,
                category: data.category,
                post_date: data.post_date,
                hidden: data.hidden,
                content: serializeSpotlightContent(validatedContent.data),
                image: image ? Buffer.from(image.data, 'base64') : null,
                image_mime: image ? image.mime : null
            },
            select: { id: true }
        })
        return { success: "Spotlight created!", id: created.id }
    } catch {
        return { error: "An unexpected error occurred." }
    }
}

export const updateSpotlight = async (
    id: number,
    data: z.infer<typeof SpotlightSchema>,
    content: SpotlightContent,
    image?: { data: string, mime: string },
    removeImage?: boolean
) => {
    if (!(await requireAdmin(4)))
        return { error: "Unauthorized." }

    const validatedFields = SpotlightSchema.safeParse(data)
    if (!validatedFields.success)
        return { error: "Invalid fields!" }

    const validatedContent = SpotlightContentSchema.safeParse(content)
    if (!validatedContent.success)
        return { error: "Invalid fields!" }

    try {
        await db.him_spotlight.update({
            where: { id },
            data: {
                name: data.name,
                category: data.category,
                post_date: data.post_date,
                hidden: data.hidden,
                content: serializeSpotlightContent(validatedContent.data),
                // Only touch the image columns when the caller intends to:
                // a new upload replaces, an explicit removal clears, otherwise
                // the existing photo is left untouched.
                ...(image
                    ? { image: Buffer.from(image.data, 'base64'), image_mime: image.mime }
                    : removeImage
                        ? { image: null, image_mime: null }
                        : {})
            }
        })
        return { success: "Saved!" }
    } catch {
        return { error: "An unexpected error occurred." }
    }
}

export const deleteSpotlight = async (id: number) => {
    if (!(await requireAdmin(4)))
        return { error: "Unauthorized." }

    try {
        await db.him_spotlight.delete({
            where: { id }
        })
        return { success: "Spotlight deleted." }
    } catch {
        return { error: "An unexpected error occurred." }
    }
}
