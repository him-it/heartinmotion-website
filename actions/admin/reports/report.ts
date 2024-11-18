"use server"

import { db } from "@/lib/db"

export const getDateRange = async (start: Date, end: Date, event_id: number) => {
    try {
        const data = await db.events_eventshift.findMany({
            where: {
                AND: [
                    {
                        event_id
                    },
                    {
                        start_time: {
                            gte: start
                        }
                    },
                    {
                        end_time: {
                            lte: end
                        }
                    }
                ]
            },
            include: {
                events_eventshiftmember: {
                    include: {
                        member_member: {
                            include: {
                                member_memberprivate: {
                                    select: {
                                        member_type: true,
                                        has_lanyard: true,
                                        has_name_badge: true,
                                        has_hoodies: true,
                                        has_long_sleeves: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: [
                        {
                            member_member: {
                                first_name: 'asc'
                            }
                        },
                        {
                            member_member: {
                                last_name: 'asc'
                            }
                        }
                    ]
                }
            }
        })
        return data
    } catch {
        return null
    }
}

export const getWeeklyUpdate = async (start: Date, end: Date) => {
    try {
        const data = await db.member_member.findMany({
            where: {
                member_memberprivate: {
                    start_date: {
                        gte: start,
                        lte: end
                    }
                }
            },
            select: {
                member_memberprivate: {
                    select: {
                        start_date: true
                    }
                },
                first_name: true,
                last_name: true,
                email: true,
                comments: true,
                cell_phone: true,
                school: true,
                graduating_year: true,
                friends: true,
                referrer: true,
                twitter_url: true,
                id: true,
                homeroom: true
            },
            orderBy: [
                {
                    member_memberprivate: {
                        start_date: 'asc'
                    }
                },
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

export const getYearlyEvent = async () => {
    try {
        const data = await db.$transaction([
            db.events_eventseason.findMany({}),
            db.events_event.findMany({
                select: {
                    name: true,
                    events_eventshift: {
                        select: {
                            start_time: true,
                            end_time: true,
                            events_eventshiftmember: {
                                select: {
                                    hours: true
                                }
                            }
                        },
                        orderBy: {
                            start_time: 'asc'
                        }
                    }
                }
            }),
        ])

        return data
    } catch {
        return null
    }
}

export const getActiveVolunteerHours = async () => {
    try {
        const data = await db.$transaction([
            db.events_eventseason.findMany({}),
            db.events_eventseason_active_events.findMany({}),
            db.member_member.findMany({
                select: {
                    first_name: true,
                    last_name: true,
                    school: true,
                    graduating_year: true,
                    dob: true,
                    events_eventshiftmember: {
                        select: {
                            events_eventshift: {
                                select: {
                                    start_time: true,
                                    event_id: true
                                }
                            }
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
            }),
        ])

        return data
    } catch {
        return null
    }
}

export const getInternOfficerVolunteer = async () => {
    try {
        const data = await db.$transaction([
            db.events_eventseason.findMany({}),
            db.member_member.findMany({
                where: {
                    member_memberprivate: {
                        OR: [
                            { 
                                member_type: "IN"
                            },
                            {
                                member_type: "OF"
                            }
                        ]
                    }
                },
                select: {
                    first_name: true,
                    last_name: true,
                    member_memberprivate: {
                        select: {
                            start_date: true
                        },
                    },
                    events_eventshiftmember: {
                        select: {
                            events_eventshift: {
                                select: {
                                    description: true,
                                    start_time: true,
                                    events_event: {
                                        select: {
                                            name: true
                                        }
                                    }
                                }
                            }
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
            }),
        ])

        return data
    } catch {
        return null
    }
}

export const getCurrentEventData = async (id: number) => {
    try {
        const data = await db.events_event.findUnique({
            where: {
                id
            },
            select: {
                name: true,
                events_eventshift: {
                    where: {
                        start_time: {
                            gte: new Date()
                        }
                    },
                    include: {
                        events_eventshiftmember: {
                            select: {
                                registration_approval_date: true,
                                transportation: true,
                                confirmed: true,
                                member_member: {
                                    include: {
                                        member_memberprivate: true
                                    }
                                },
                            },
                            orderBy: [
                                {
                                    member_member: {
                                        first_name: 'asc'
                                    }
                                },
                                {
                                    member_member: {
                                        last_name: 'asc'
                                    }
                                }
                            ]
                        },
                    },
                    orderBy: {
                        start_time: 'asc'
                    }
                }
            }
        })
        return data
    } catch {
        return null
    }
}

export const getPastEventData = async (id: number) => {
    try {
        const data = await db.events_event.findUnique({
            where: {
                id
            },
            select: {
                name: true,
                events_eventshift: {
                    include: {
                        events_eventshiftmember: {
                            select: {
                                registration_approval_date: true,
                                transportation: true,
                                confirmed: true,
                                member_member: {
                                    include: {
                                        member_memberprivate: true
                                    }
                                },
                            },
                            orderBy: [
                                {
                                    member_member: {
                                        first_name: 'asc'
                                    }
                                },
                                {
                                    member_member: {
                                        last_name: 'asc'
                                    }
                                }
                            ]
                        },
                    },
                    orderBy: {
                        start_time: 'asc'
                    }
                }
            }
        })
        return data
    } catch {
        return null
    }
}

export const getLifetime = async (id: number) => {
    try {
        const data = await db.member_member.findUnique({
            where: {
                id
            },
            select: {
                first_name: true,
                last_name: true,
                id: true,
                school: true,
                graduating_year: true,
                member_memberprivate: {
                    select: {
                        extra_hours: true
                    }
                },
                events_eventshiftmember: {
                    select: {
                        completed: true,
                        confirmed: true,
                        hours: true,
                        events_eventshift: {
                            select: {
                                start_time: true,
                                end_time: true,
                                description: true,
                                id: true,
                                events_event: {
                                    select: {
                                        id: true,
                                        name: true
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

