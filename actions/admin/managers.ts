"use server"

import { db } from "@/lib/db"

export const getManagers = async () => {
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
    try {
        await db.member_memberrestricted.update({
            where: {
                member_id
            },
            data: {
                admin_level
            }
        })
        return { success: "Successfully deleted file." }
    } catch {
        return { error: "An unexpected error occured." }
    }
}