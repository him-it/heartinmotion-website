"use client"

import { getUpcomingEvents } from "@/actions/volunteer/event"
import { Prisma } from "@prisma/client"
import Link from "next/link"

export const EventsList = ({ eventListData } : { eventListData: Prisma.PromiseReturnType<typeof getUpcomingEvents> | undefined }) => {
    return (
        <div className="p-5 max-w-lg mx-auto">
            {
                eventListData?.length === 0 &&
                <div className="text-gray-500">
                    No upcoming events.
                </div>
            }
            {eventListData?.map((event, key) => {
                if(!event.hidden)
                    return (
                        <Link href={"/volunteer/events/" + event.slug} key={key} className="block mb-6 p-4 border rounded-lg shadow-lg bg-white hover:bg-gray-100 transition duration-200">
                            <h2 className="text-2xl font-medium text-red-500 mb-2">{event.name}</h2>
                            {event.events_eventshift.map((shift, key) => (
                                <div key={key} className="mb-3">
                                    <h3 className="text-l text-red-500 font-medium">{shift.description}</h3>
                                    <p className="text-gray-600 text-sm">
                                        {shift.start_time.toLocaleDateString('en-US', { timeZone:'UTC',  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        {shift.start_time.toLocaleTimeString('en-US', { timeZone:'UTC',  hour: 'numeric', minute: 'numeric', hour12: true }) + " - " + shift.end_time.toLocaleTimeString('en-US', { timeZone:'UTC', hour: 'numeric', minute: 'numeric', hour12: true })}
                                    </p>
                                </div>
                            ))}
                        </Link>
                    )
            })}
        </div>
    )
}