"use server"

import { db } from "@/lib/db"
import { requireSelfOrAdmin } from "@/lib/authGuard"

export const getUserById = async (id: number) => {
    if (!(await requireSelfOrAdmin(id)))
        return null

    try {
        const user = await db.member_member.findUnique({
            where: {
                id
             },
            include: {
                member_memberrestricted: true,
                member_memberprivate:true
            }
         })

        return user
    } catch {
        return null
    }
}

export const getRegisteredShifts = async ( member_id: number) => {
    if (!(await requireSelfOrAdmin(member_id)))
        return null

    try {
        const user = await db.events_eventshiftmember.findMany({
            where: {
                member_id
             },
             include: {
                events_eventshift: {
                    select: {
                        start_time: true,
                        description: true,
                        end_time: true
                    }
                },
                events_event: {
                    select: {
                        name: true,
                        slug: true
                    }
                }
             }
         })
        return user
    } catch {
        return null
    }
}

export const getWaitlistedShifts = async ( member_id: number) => {
    if (!(await requireSelfOrAdmin(member_id)))
        return null

    try {
        const user = await db.events_eventsignup_shifts.findMany({
            where: {
                events_eventsignup: {
                    member_id
                }
             },
             include: {
                events_eventshift: {
                    select: {
                        start_time: true
                    }
                }
             }
         })

        return user
    } catch {
        return null
    }
}

export const getHours = async ( member_id: number ) => {
    if (!(await requireSelfOrAdmin(member_id)))
        return null

    try {
        const hours = await db.events_eventshiftmember.findMany({
            where: {
                member_id
            },
            include: {
                member_member: {
                    select: {
                        member_memberprivate: {
                            select: {
                                extra_hours: true
                            }
                        }
                    }
                },
                events_eventshift: {
                    select: {
                        start_time: true,
                        end_time: true,
                        description: true,
                        events_event: {
                            select: {
                                name: true,
                                slug: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                events_eventshift: {
                    start_time: 'asc'
                }
            }
        })

        return hours
    } catch {
        return null
    }
}
