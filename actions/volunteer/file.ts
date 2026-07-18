"use server"

import { db } from "@/lib/db"

export const getFiles = async () => {
    try {
        // List view only needs metadata + the small thumbnail — never the full
        // `data` blob (the entire PDF binary), which would otherwise be loaded
        // and serialized for every file just to render the grid.
        const data = await db.files_file.findMany({
            select: {
                id: true,
                name: true,
                dispname: true,
                size: true,
                thumbnail: true
            }
        })
        return data
    } catch {
        return null
    }
}

export const getFileBySlug = async (slug: string) => {
    try {
        const data = await db.files_file.findUnique({
            where: {
                name: slug
            }
        })
        return JSON.parse(JSON.stringify(data))
    } catch {
        return null
    }
}