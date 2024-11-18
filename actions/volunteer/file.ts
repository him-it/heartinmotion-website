"use server"

import { db } from "@/lib/db"

export const getFiles = async () => {
    try {
        const data = await db.files_file.findMany({})
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