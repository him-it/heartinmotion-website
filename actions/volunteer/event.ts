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