"use client"

import { getEvents } from "@/actions/admin/event";
import { Prisma } from "@prisma/client";
import Link from "next/link";

const AdminEventsList = ({ eventsData }: { eventsData: Prisma.PromiseReturnType<typeof getEvents> | undefined }) => {
    return (
        <div className="flex flex-col items-center">
            <div className="flex space-x-4 mb-6">
                <Link href="/admin/events/reports" className="inline-block px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700">
                    Reports
                </Link>
                <Link href="/admin/active-events" className="inline-block px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700">
                    Active Events
                </Link>
                <Link href="/admin/events/new" className="inline-block px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700">
                    New
                </Link>
            </div>
            <div className="w-full max-w-2xl">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                    <thead>
                        <tr className="bg-gray-100">
                            <th colSpan={2} className="p-4 text-lg font-semibold text-gray-700 text-center rounded-tl-lg rounded-tr-lg">Upcoming Events</th>
                        </tr>
                        <tr>
                            <th className="p-4 text-gray-600 text-center">Event</th>
                            <th className="p-4 text-gray-600 text-center">Next Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            eventsData && eventsData.filter(event => 
                                event.events_eventshift.some(shift => shift.start_time > new Date())
                            ).map((event, key) => (
                                <tr key={key} className="border-b hover:bg-gray-50">
                                    <td className="p-4 text-center">
                                        <Link href={"/admin/events/event/" + event.slug} className="text-gray-700 hover:underline">
                                            {event.name}
                                        </Link>
                                    </td>
                                    <td className="p-4 text-center">{event.events_eventshift[0].start_time ? event.events_eventshift[0].start_time.toDateString() : "Error"}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>

                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md mt-8">
                    <thead>
                        <tr className="bg-gray-100">
                            <th colSpan={2} className="p-4 text-lg font-semibold text-gray-700 text-center rounded-tl-lg rounded-tr-lg">Past Events</th>
                        </tr>
                        <tr>
                            <th className="p-4 text-gray-600 text-center">Event</th>
                            <th className="p-4 text-gray-600 text-center">Next Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            eventsData && eventsData.filter(event => 
                                event.events_eventshift.some(shift => shift.start_time <= new Date())
                            ).map((event, key) => (
                                <tr key={key} className="border-b hover:bg-gray-50">
                                    <td className="p-4 text-center">
                                        <Link href={"/admin/events/event/" + event.slug} className="text-gray-700 hover:underline">
                                            {event.name}
                                        </Link>
                                    </td>
                                    <td className="p-4 text-center">--------</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>

                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md mt-8">
                    <thead>
                        <tr className="bg-gray-100">
                            <th colSpan={2} className="p-4 text-lg font-semibold text-gray-700 text-center rounded-tl-lg rounded-tr-lg">Empty Events</th>
                        </tr>
                        <tr>
                            <th className="p-4 text-gray-600 text-center">Event</th>
                            <th className="p-4 text-gray-600 text-center">Next Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            eventsData && eventsData.filter(event => 
                                event.events_eventshift.length <= 0
                            ).map((event, key) => (
                                <tr key={key} className="border-b hover:bg-gray-50">
                                    <td className="p-4 text-center">
                                        <Link href={"/admin/events/event/" + event.slug} className="text-gray-700 hover:underline">
                                            {event.name}
                                        </Link>
                                    </td>
                                    <td className="p-4 text-center">--------</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminEventsList;
