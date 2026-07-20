"use client"

import { getEvents } from "@/actions/admin/event";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { TableShell, Toolbar, ToolbarSpacer, tdClass, thClass } from "@/components/admin/workbench";

const EventsTable = ({ title, events, showDate }: {
    title: string,
    events: NonNullable<Prisma.PromiseReturnType<typeof getEvents>>,
    showDate?: boolean
}) => (
    <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">{title}</h2>
        <TableShell>
            <table className="min-w-full table-auto border-collapse">
                <thead className="bg-muted">
                    <tr>
                        <th className={thClass}>Event</th>
                        <th className={thClass}>Next Date</th>
                    </tr>
                </thead>
                <tbody>
                    {events.map(event => (
                        <tr key={event.id} className="border-b border-border last:border-0 hover:bg-muted/60 transition-colors">
                            <td className={tdClass + " font-medium"}>
                                <Link href={"/admin/events/event/" + event.slug} className="text-primary hover:underline hover:text-primary/90">
                                    {event.name}
                                </Link>
                            </td>
                            <td className={tdClass + " text-muted-foreground whitespace-nowrap"}>
                                {showDate
                                    ? (event.events_eventshift[0]?.start_time ? event.events_eventshift[0].start_time.toDateString() : "Error")
                                    : "—"}
                            </td>
                        </tr>
                    ))}
                    {events.length === 0 && (
                        <tr>
                            <td colSpan={2} className="px-4 py-8 text-center text-sm text-muted-foreground">
                                No events.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </TableShell>
    </div>
)

const AdminEventsList = ({ eventsData }: { eventsData: Prisma.PromiseReturnType<typeof getEvents> | undefined }) => {
    // Group once per data change with a single time reference, instead of
    // filtering three times with a fresh Date per comparison on every render.
    // An event with both past and future shifts appears in Upcoming and Past,
    // matching the original behavior.
    const { upcoming, past, empty } = useMemo(() => {
        const now = new Date()
        const data = eventsData ?? []
        return {
            upcoming: data.filter(event => event.events_eventshift.some(shift => shift.start_time > now)),
            past: data.filter(event => event.events_eventshift.some(shift => shift.start_time <= now)),
            empty: data.filter(event => event.events_eventshift.length <= 0)
        }
    }, [eventsData])

    return (
        <div className="w-full max-w-3xl mx-auto">
            <Toolbar>
                <Button size="sm" asChild>
                    <Link href="/admin/events/new">New Event</Link>
                </Button>
                <ToolbarSpacer />
                <Button size="sm" variant="outline" asChild>
                    <Link href="/admin/events/reports">Reports</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                    <Link href="/admin/events/seasons">Seasons</Link>
                </Button>
            </Toolbar>

            <div className="space-y-8">
                <EventsTable title="Upcoming Events" events={upcoming} showDate />
                <EventsTable title="Past Events" events={past} />
                <EventsTable title="Empty Events" events={empty} />
            </div>
        </div>
    );
};

export default AdminEventsList;
