"use server"

import { db } from "@/lib/db"

export const deleteFilePermanent = async (id: number) => {
    try {
        await db.files_file.delete({
            where: {
                id
            }
        })
        return { success: "Successfully deleted file." }
    } catch {
        return { error: "An unexpected error occured." }
    }
}

export const createFile = async (name: string, data: string, size: number, dispname: string, thumbnail?: string) => {
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
        return { success: "Successfully deleted file." }
    } catch {
        return { error: "An unexpected error occured." }
    }
}