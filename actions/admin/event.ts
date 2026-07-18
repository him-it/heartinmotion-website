"use server"

import * as z from 'zod'

import { db } from "@/lib/db"
import { AddMemberSchema, EventSchema, ShiftSchema } from '@/schemas'
import { events_eventshift } from '@prisma/client'
import { requireAdmin } from '@/lib/authGuard'
import { slugify } from '@/lib/slug'

export const getEventBySlug = async (slug: string) => {
    if (!(await requireAdmin(4)))
        return null

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
                        // Detail page only reads the per-shift registrant count.
                        events_eventshiftmember: {
                            select: {
                                id: true
                            }
                        }
                    }
                },
                // Top-level list is only used to count registrants per shift id.
                events_eventshiftmember: {
                    select: {
                        shift_id: true
                    }
                },
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

export const updateEvent = async (data: z.infer<typeof EventSchema>, content: string | undefined, id: number | undefined) => {
    if (!(await requireAdmin(4)))
        return { error: "Unauthorized." }

    const validatedFields = EventSchema.safeParse(data)

    if(!validatedFields.success)
        return { error: "Invalid fields!" }

    if(!id)
        return { error: "An unexpected error occurred." }

    await db.events_event.update({
        where: {
            id
        },
        data: {
            ...data,
            content
        }
    })

    return { success: "Saved!" }
}

export const getSeasons = async () => {
    if (!(await requireAdmin(4)))
        return null

    try {
        const seasons = await db.events_eventseason.findMany({
            select: {
                season: true,
                n_required_active_events: true,
                events_eventseason_active_events: {
                    select: {
                        id: true,
                        events_event: {
                            select: {
                                name: true,
                                id: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                season: 'asc'
            }
        })
        return seasons
    } catch {
        return null
    }
}

export const getEvents = async () => {
    if (!(await requireAdmin(4)))
        return null

    try {
        const events = await db.events_event.findMany({
            select: {
                name: true,
                slug: true,
                id: true,
                events_eventshift: {
                    orderBy: {
                        start_time: 'desc'
                    }
                }
            }
        })
        return events
    } catch {
        return null
    }
}


export const registerShiftSignup = async (data: any) => {
    if (!(await requireAdmin(4)))
        return { error: "Unauthorized." }

    try {
        await db.$transaction([
            db.events_eventsignup_shifts.delete({
                where: {
                    id: data.events_eventsignup_shifts[0].id
                }
            }),
            db.events_eventsignup.delete({
                where: {
                    id: data.id
                }
            }),
            db.events_eventshiftmember.create({
                data: {
                    events_eventshift: { 
                        connect: { id: data.events_eventsignup_shifts[0].events_eventshift.id } 
                    },
                    member_member: { 
                        connect: { id: data.member_member.id } 
                    },
                    events_event: {
                        connect: { id: data.events_eventsignup_shifts[0].events_eventshift.event_id } 
                    },
                    notified: false,
                    confirmed: false,
                    transportation: data.transportation,
                    hours: Math.abs(data.events_eventsignup_shifts[0].events_eventshift.start_time.getTime() - data.events_eventsignup_shifts[0].events_eventshift.end_time.getTime()) / (1000 * 60 * 60),
                    completedall: false,
                    confirmedall: false,
                    registration_approval_date: new Date(new Date().getTime() + 7 * 60 * 60 * 1000)
                }
            })
        ])
        return { success: "Saved successfully!" }
    } catch {
        return { error: "An unexpected error occurred." }
    }
}

export const deleteShiftSignup = async (data: any) => {
    if (!(await requireAdmin(4)))
        return { error: "Unauthorized." }

    try {
        await db.$transaction([
            db.events_eventsignup_shifts.delete({
                where: {
                    id: data.events_eventsignup_shifts[0].id
                }
            }),
            db.events_eventsignup.delete({
                where: {
                    id: data.id
                }
            })
        ])
    } catch {
        return { error: "An unexpected error occurred." }
    }
}

export const getShiftById = async (id: number) => {
    if (!(await requireAdmin(4)))
        return null

    try {
        const shift = await db.events_eventshift.findUnique({
            where: {
                id
            },
            include: {
                events_eventshiftmember: {
                    include: {
                        member_member: true
                    }
                },
                events_event: true,
            }
        })

        return shift
    } catch {
        return null
    }
}

export const createShift = async (data: z.infer<typeof ShiftSchema>) => {
    if (!(await requireAdmin(4)))
        return { error: "Unauthorized." }

    try {
        await db.events_eventshift.create({
            data: {
                description: data.description,
                location: data.location,
                start_time: new Date(new Date(data.start_time).getTime() + 7 * 60 * 60 * 1000),
                end_time: new Date(new Date(data.end_time).getTime() + 7 * 60 * 60 * 1000),
                spots: data.spots,
                events_event: {
                    connect: {id: data.event_id}
                }
            }
        })
    } catch {
        return {error: "An unexpected error occurred."}
    }
}

export const updateShift = async (data: z.infer<typeof ShiftSchema>, id: number) => {
    if (!(await requireAdmin(4)))
        return { error: "Unauthorized." }

    try {
        await db.events_eventshift.update({
            where: {
                id
            },
            data: {
                description: data.description,
                location: data.location,
                start_time: new Date(new Date(data.start_time).getTime() + 7 * 60 * 60 * 1000),
                end_time: new Date(new Date(data.end_time).getTime() + 7 * 60 * 60 * 1000),
                spots: data.spots
            }
        })
    } catch {
        return {error: "An unexpected error occurred."}
    }
}

export const shiftAddMember = async (data: z.infer<typeof AddMemberSchema>, shiftData: events_eventshift ) => {
    if (!(await requireAdmin(4)))
        return { error: "Unauthorized." }

    try {
        await db.events_eventshiftmember.create({
            data: {
                member_member: {
                    connect: { id: Number(data.id) }
                },
                events_eventshift: {
                    connect: {id: shiftData.id}
                },
                events_event: {
                    connect: {id: shiftData.event_id}
                },
                transportation: data.transportation,
                confirmed: false,
                completed: false,
                hours: Math.abs(shiftData.start_time.getTime() - shiftData.end_time.getTime()) / (1000 * 60 * 60),
                completedall: false,
                confirmedall: false,
                notified: false,
                registration_approval_date: new Date(new Date().getTime() + 7 * 60 * 60 * 1000)
            }
        })
    } catch {
        return {error: "An unexpected error occurred."}
    }
}

export const shiftDeleteMember = async (id: number) => {
    if (!(await requireAdmin(4)))
        return { error: "Unauthorized." }

    try {
        await db.events_eventshiftmember.delete({
            where: {
                id
            }
        })
    } catch {
        return {error: "An unexpected error occurred."}
    }
}

export const updateShiftConfirmed = async (id: number, value: boolean) => {
    if (!(await requireAdmin(4)))
        return { error: "Unauthorized." }

    try {
        await db.events_eventshiftmember.update({
            where: {
                id
            },
            data: {
                confirmed: value
            }
        })
    } catch {
        return {error: "An unexpected error occurred."}
    }
}

export const updateShiftCompleted = async (id: number, value: boolean) => {
    if (!(await requireAdmin(4)))
        return { error: "Unauthorized." }

    try {
        await db.events_eventshiftmember.update({
            where: {
                id
            },
            data: {
                completed: value
            }
        })
    } catch {
        return {error: "An unexpected error occurred."}
    }
}

export const updateShiftHours = async (id: number, value: number) => {
    if (!(await requireAdmin(4)))
        return { error: "Unauthorized." }

    try {
        await db.events_eventshiftmember.update({
            where: {
                id
            },
            data: {
                hours: value
            }
        })
    } catch {
        return {error: "An unexpected error occurred."}
    }
}

export const updateShiftHoursAll = async (shift_id: number, value: number) => {
    if (!(await requireAdmin(4)))
        return { error: "Unauthorized." }

    try {
        await db.events_eventshiftmember.updateMany({
            where: {
                shift_id
            },
            data: {
                hours: value
            }
        })
    } catch {
        return {error: "An unexpected error occurred."}
    }
}

export const deleteShiftData = async (id: number) => {
    if (!(await requireAdmin(4)))
        return { error: "Unauthorized." }

    try {
        await db.$transaction([
            db.events_eventshiftmember.deleteMany({
                where: {
                    shift_id: id
                }
            }),
            db.events_eventsignup.deleteMany({
                where: {
                    events_eventsignup_shifts: {
                        some: {
                            eventshift_id: id
                        }
                    }
                }
            }),
            db.events_eventsignup_shifts.deleteMany({
                where: {
                    eventshift_id: id
                }
            }),
            db.events_eventshift.delete({
                where: {
                    id
                }
            })
        ])
    } catch {
        return {error: "An unexpected error occurred."}
    }
}

export const deleteEventData = async (id: number) => {
    if (!(await requireAdmin(4)))
        return { error: "Unauthorized." }

    try {
        await db.$transaction([
            db.events_eventsignup_shifts.deleteMany({
                where: {
                    events_eventshift: {
                        event_id: id
                    }
                }
            }),
            db.events_eventshiftmember.deleteMany({
                where: {
                    event_id: id
                }
            }),
            db.events_eventsignup.deleteMany({
                where: {
                    event_id: id
                }
            }),
            db.events_eventshift.deleteMany({
                where: {
                    event_id: id
                }
            }),
            db.events_eventseason_active_events.deleteMany({
                where: {
                    event_id: id
                }
            }),
            db.events_event.delete({
                where: {
                    id
                }
            })
        ])
    } catch {
        return {error: "An unexpected error occurred."}
    }
}

export const confirmAllMembers = async (id: number) => {
    if (!(await requireAdmin(4)))
        return { error: "Unauthorized." }

    try {
        await db.events_eventshiftmember.updateMany({
            where: {
                shift_id: id
            },
            data: {
                confirmed: true
            }
        })
    } catch {
        return {error: "An unexpected error occurred."}
    }
}

export const completeAllMembers = async (id: number) => {
    if (!(await requireAdmin(4)))
        return { error: "Unauthorized." }

    try {
        await db.events_eventshiftmember.updateMany({
            where: {
                shift_id: id
            },
            data: {
                completed: true
            }
        })
    } catch {
        return {error: "An unexpected error occurred."}
    }
}

export const createEvent = async (data: z.infer<typeof EventSchema>, content: string) => {
    if (!(await requireAdmin(4)))
        return { error: "Unauthorized." }

    const validatedFields = EventSchema.safeParse(data)

    if(!validatedFields.success)
        return { error: "Invalid fields!" }

    const slug = slugify(data.name)

    const checkEvent = await db.events_event.findUnique({
        where: {
            slug
        }
    })

    if(checkEvent)
        return { error: "Event name cannot be the same as another event." }

    await db.events_event.create({
        data: {
            ...data,
            content,
            slug
        }
    })

    return { success: "Saved!" }
}

export const updateActiveSeasonEvents = async (createActive : {event_id: number, eventseason_id: number}[], deleteActive: number[], season: number, n_required_active_events?: number) => {
    if (!(await requireAdmin(4)))
        return { error: "Unauthorized." }

    try {
        await db.$transaction([
            db.events_eventseason.update({
                where: {
                    season
                },
                data:{
                    n_required_active_events
                }
            }),
            db.events_eventseason_active_events.createMany({
                data: [
                    ...createActive
                ]
            }),
            db.events_eventseason_active_events.deleteMany({
                where: {
                    id: {
                        in: deleteActive
                    }
                }
            })
        ])
        return { success: "Saved!" }
    } catch {
        return {error: "An unexpected error occurred."}
    }
}

export const createSeason = async (season: number, n_required_active_events: number, createActive : {event_id: number, eventseason_id: number}[]) => {
    if (!(await requireAdmin(4)))
        return { error: "Unauthorized." }

    try {
        await db.events_eventseason.create({
            data: {
                season,
                n_required_active_events
            }
        })
        .then(async () => {
            await db.events_eventseason_active_events.createMany({
                data: [
                    ...createActive
                ]
            })
        })

        return { success: "Saved!" }
    }
    catch {
        return {error: "An unexpected error occurred."}
    }
}

export const deleteSeason = async (season: number) => {
    if (!(await requireAdmin(4)))
        return { error: "Unauthorized." }

    try {
        await db.$transaction([
            db.events_eventseason_active_events.deleteMany({
                where: {
                    eventseason_id: season
                }
            }),
            db.events_eventseason.delete({
                where: {
                    season
                }
            })
        ])
        return { success: "Deleted!" }
    }
    catch {
        return {error: "An unexpected error occurred."}
    }
}