"use server"

import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/authGuard"

export const deleteFilePermanent = async (id: number) => {
    if (!(await requireAdmin(4)))
        return { error: "Unauthorized." }

    try {
        await db.files_file.delete({
            where: {
                id
            }
        })
        return { success: "Successfully deleted file." }
    } catch {
        return { error: "An unexpected error occurred." }
    }
}

export const createFile = async (name: string, data: string, size: number, dispname: string, thumbnail?: string) => {
    if (!(await requireAdmin(4)))
        return { error: "Unauthorized." }

    try {
        const buffer = Buffer.from(data, 'base64')
        const thumbnailBuffer = thumbnail ? Buffer.from(thumbnail, 'base64') : undefined
        await db.files_file.create({
            data: {
                name,
                data: buffer,
                size,
                thumbnail: thumbnailBuffer,
                dispname
            }
        })
        return { success: "Successfully uploaded file." }
    } catch {
        return { error: "An unexpected error occurred." }
    }
}
