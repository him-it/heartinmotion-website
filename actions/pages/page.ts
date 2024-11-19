"use server"

import { db } from '@/lib/db'

export const getPageByPath = async (path: string) => {
    try {
        const page = await db.him_page.findUnique({ 
            where: { 
                path
             }
         })
        return page
    } catch {
        return null
    }
}
