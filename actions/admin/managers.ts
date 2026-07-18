"use server"

import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/authGuard"

export const getManagers = async () => {
    if (!(await requireAdmin(10)))
        return null

    try {
        const data = await db.member_member.findMany({
            where: {
                member_memberrestricted: {
                    admin_level: {
                        gt: 0
                    }
                }
            },
            select: {
                first_name: true,
                last_name: true,
                id: true,
                member_memberrestricted: {
                    select: {
                        admin_level: true
                    }
                }
            },
            orderBy: [
                {
                    first_name: 'asc'
                },
                {
                    last_name: 'asc'
                }
            ]
        })
        return data
    } catch {
        return null
    }
}

export const updateManager = async (member_id: number, admin_level: number) => {
    if (!(await requireAdmin(10)))
        return { error: "Unauthorized." }

    try {
        await db.member_memberrestricted.update({
            where: {
                member_id
            },
            data: {
                admin_level
            }
        })
        return { success: "Successfully updated manager." }
    } catch {
        return { error: "An unexpected error occurred." }
    }
}