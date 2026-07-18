"use server"

import * as z from 'zod'

import { db } from '@/lib/db'
import { EditPageSchema } from '@/schemas'
import { requireAdmin } from '@/lib/authGuard'

export const getPages = async () => {
    if (!(await requireAdmin(4)))
        return null

    try {
        const pages = await db.him_page.findMany({ 
            orderBy: {
                id: 'asc'
            }
         })
        return pages
    } catch {
        return null
    }
}

export const getPageById = async (id: number) => {
    if (!(await requireAdmin(4)))
        return null

    try {
        const page = await db.him_page.findUnique({ 
            where: {
                id
            }
         })
        return page
    } catch {
        return null
    }
}

export const updatePage = async (data: z.infer<typeof EditPageSchema>, content: string | undefined, id: number) => {
    if (!(await requireAdmin(4)))
        return { error: "Unauthorized." }

    try {
        await db.him_page.update({
            where: {
                id
            },
            data: {
                ...data,
                content
            }
        })
        return { success: "Saved successfully!" }
    } catch {
        return { error: "An unexpected error occurred." }
    }
}