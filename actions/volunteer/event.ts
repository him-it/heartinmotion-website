"use server"

import { db } from "@/lib/db"

export const getUpcomingEvents = async () => {
    try {
        const events = await db.events_event.findMany({ 
            where: {
                events_eventshift: {
                    some: {
                        start_time: {
                            gte: new Date()
                        }
                    }
                }
            },
            select: {
                name: true,
                slug: true,
                hidden: true,
                events_eventshift: {
                    where: {
                        start_time: {
                            gte: new Date()
                        }
                    },
                    select: {
                        start_time: true,
                        end_time: true,
                        description: true
                    }
                }
            }
         })
        return events
    } catch(e) {
        console.log(e)
        return null
    }
}

export const getEventBySlug = async (slug: string) => {
    try {
        const event = await db.events_event.findUnique({ 
            where: { 
                slug
             },
             include: {
                events_eventshift: 
                {
                    orderBy: {
                        start_time: 'asc'
                    },
                    include: {
                        events_eventshiftmember: true
                    }
                },
                events_eventshiftmember: true,
                events_eventsignup: {
                    select: {
                        id: true,
                        events_eventsignup_shifts: {
                            select: {
                                id: true,
                                events_eventshift: true
                            }
                        },
                        time: true,
                        transportation: true,
                        friends: true,
                        member_member: {
                            select: {
                                first_name: true,
                                last_name: true,
                                id: true
                            }
                        }
                    }
                }
             }
         })
        return event
    } catch {
        return null
    }
}