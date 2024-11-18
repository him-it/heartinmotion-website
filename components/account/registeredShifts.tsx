"use client"

import { getRegisteredShifts } from "@/actions/account/user"
import { Prisma } from "@prisma/client"
import Link from "next/link"
import { Button } from "../ui/button"
import { useTransition } from "react"
import { updateShiftConfirmed } from "@/actions/admin/event"

const RegisteredShifts = ({shiftData} : {shiftData: Prisma.PromiseReturnType<typeof getRegisteredShifts>}) => {
    const [isPending, startTransition] = useTransition() 
    
    const confirmShift = (id: number) => {
        startTransition(() => {
            updateShiftConfirmed(id, true)
            .then(() => {
                window.location.reload()
            })
        })
    }

    return (
        <div>
            {shiftData && 
                <div className="overflow-x-auto w-full">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border border-gray-300 p-2 text-gray-600 text-sm md:text-base">Event</th>
                                <th className="border border-gray-300 p-2 text-gray-600 text-sm md:text-base">Date and Time</th>
                                <th className="border border-gray-300 p-2 text-gray-600 text-sm md:text-base">Confirm</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                shiftData.map((shift, key) => (
                                    <tr key={key}>
                                        <td className="border border-gray-300 p-1 md:p-2 text-sm md:text-base">
                                            <Link href={"/volunteer/events/" + shift.events_event.slug} className="text-red-600 hover:underline">{shift.events_event.name}</Link>
                                            <p>{shift.events_eventshift.description}</p>
                                        </td>
                                        <td className="border border-gray-300 p-1 md:p-2 text-sm md:text-base">
                                            <div>
                                                <div>{shift.events_eventshift.start_time.toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                                <div>{shift.events_eventshift.start_time.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) + " - " + shift.events_eventshift.end_time.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}</div>
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 p-1 md:p-2 text-sm md:text-base">
                                            <Button 
                                                disabled={isPending || shift.confirmed || !(new Date(shift.events_eventshift.start_time).getTime() > Date.now() && new Date(shift.events_eventshift.start_time).getTime() <= Date.now() + 10 * 24 * 60 * 60 * 1000)} 
                                                className={(shift.confirmed ? "bg-green-500 hover:bg-green-600" : "bg-red-600 hover:bg-red-700") + " w-[70%] px-10 disabled:pointer-events-none text-white"}
                                                onClick={() => { confirmShift(shift.id) }}
                                            >
                                                {shift.confirmed ? "Confirmed!" : !(new Date(shift.events_eventshift.start_time).getTime() > Date.now() && new Date(shift.events_eventshift.start_time).getTime() <= Date.now() + 10 * 24 * 60 * 60 * 1000) ? "Not Now" : "Confirm" }
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            }
        </div>
    )
}

export default RegisteredShifts