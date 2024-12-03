"use server"

import * as z from 'zod'

import { db } from "@/lib/db"
import { MemberClubSchema } from "@/schemas"

export const getMemberNames = async () => {
    try {
        const member = await db.member_member.findMany({
            select: {
                first_name: true,
                last_name: true,
                id: true
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

        return member
    } catch {
        return null
    }
}

export const getMembers = async () => {
    try {
        const members = await db.member_member.findMany({
            orderBy: [
                {
                    first_name: 'asc'
                },
                {
                    last_name: 'asc'
                }
            ],
            include: {
                events_eventshiftmember: true,
                member_memberprivate: {
                    select: {
                        extra_hours: true
                    }
                }
            }
        })

        return members
    } catch {
        return null
    }
}

export const getFriends = async (id: number) => {
    try {
        const data = await db.member_member.findUnique({
            where: {
                id
            },
            select: {
                friends: true
            }
        })

        return data
    } catch {
        return null
    }
}

export const getMemberById = async (id: number) => {
    try {
        const data = await db.member_member.findUnique({
            where: {
                id
            },
            include: {
                member_memberprivate: true,
                events_eventshiftmember: {
                    select: {
                        hours: true,
                        completed: true,
                        confirmed: true,
                        transportation: true,
                        id: true,
                        events_eventshift: {
                            select: {
                                start_time: true,
                                description: true,
                                id: true,
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
                }
            }
        })
        return data
    } catch {
        return null
    }
}

export const updateExtraHours = async (member_id: number, extra_hours: number) => {
    try {
        await db.member_memberprivate.update({
            where: {
                member_id
            },
            data: {
                extra_hours
            }
        })

        return { success: "Successfully updated extra hours." }
    } catch {
        return { error: "An unexpected error occured." }
    }
}

export const deleteMemberPermanent = async (member_id: number) => {
    try {
        await db.$transaction([
            db.events_eventsignup_shifts.deleteMany({
                where: {
                    events_eventsignup: {
                        member_id
                    }
                }
            }),
            db.events_eventsignup.deleteMany({
                where: {
                    member_id
                }
            }),
            db.events_eventshiftmember.deleteMany({
                where: {
                    member_id
                }
            }),
            db.member_memberrestricted.deleteMany({
                where: {
                    member_id
                }
            }),
            db.member_memberprivate.deleteMany({
                where: {
                    member_id
                }
            }),
            db.member_member.delete({
                where: {
                    id: member_id
                }
            })
        ])

        return { success: "Successfully deleted member." }
    } catch {
        try {
            await db.member_member.delete({
                where: {
                    id: member_id
                }
            })
            return { success: "Successfully deleted member." }
        } catch {
            return { error: "An unexpected error occured." }
        }
    }
}

export const editClub = async (member_id: number, data: z.infer<typeof MemberClubSchema>) => {
    try {
        await db.member_memberprivate.update({
            where: {
              member_id 
            },
            data: {
                ...data
            }
        })

        return { success: "Saved successfully!" }
    } catch {
        return { error: "An unexpected error occured." }
    }
}