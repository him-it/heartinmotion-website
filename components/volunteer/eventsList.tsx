"use client"

import { getUpcomingEvents } from "@/actions/volunteer/event"
import { formatShiftDate, formatShiftTime } from "@/lib/time"
import { Prisma } from "@prisma/client"
import Link from "next/link"

export const EventsList = ({ eventListData } : { eventListData: Prisma.PromiseReturnType<typeof getUpcomingEvents> | undefined }) => {
    return (
        <div className="max-w-2xl mx-auto">
            {
                eventListData?.length === 0 &&
                <div className="rounded-xl border border-border bg-card shadow-xs py-16 text-center text-muted-foreground">
                    No upcoming events.
                </div>
            }
            <div className="space-y-4">
                {eventListData?.filter(event => !event.hidden).map(event => (
                            <Link
                                href={"/volunteer/events/" + event.slug}
                                key={event.slug}
                                className="group block rounded-xl border border-border bg-card p-5 shadow-xs transition-all duration-150 hover:shadow-soft hover:-translate-y-0.5"
                            >
                                <div className="flex items-center justify-between gap-3 mb-3">
                                    <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{event.name}</h2>
                                    <span className="shrink-0 text-sm text-primary font-medium">View →</span>
                                </div>
                                <div className="space-y-2">
                                    {event.events_eventshift.map((shift, key) => (
                                        <div key={key} className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 border-t border-border pt-2 first:border-t-0 first:pt-0">
                                            <span className="text-sm font-medium text-foreground">{shift.description}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {formatShiftDate(shift.start_time, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                {" · "}
                                                {formatShiftTime(shift.start_time)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </Link>
                ))}
            </div>
        </div>
    )
}
