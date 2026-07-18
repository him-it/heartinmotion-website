"use server"

import { db } from "@/lib/db"

export const getUpcomingEvents = async () => {
    try {
        const events = await db.events_event.findMany({
            where: {
                hidden: false,
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
    } catch {
        return null
    }
}

/**
 * Public event lookup for the volunteer-facing event page.
 *
 * Deliberately excludes all volunteer PII (names, signup records). Only the
 * event body and the per-shift capacity — the number of members registered,
 * not who they are — is returned so the page can show "spots left".
 */
export const getPublicEventBySlug = async (slug: string) => {
    try {
        // Reject hidden events server-side — a hidden event must not be
        // readable at all through the public route, not merely hidden by a
        // client-side redirect. (slug is unique, so findFirst is exact.)
        const event = await db.events_event.findFirst({
            where: {
                slug,
                hidden: false
            },
            select: {
                id: true,
                name: true,
                slug: true,
                content: true,
                hidden: true,
                events_eventshift: {
                    orderBy: {
                        start_time: 'asc'
                    },
                    select: {
                        id: true,
                        description: true,
                        location: true,
                        spots: true,
                        start_time: true,
                        end_time: true,
                        _count: {
                            select: {
                                events_eventshiftmember: true
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
