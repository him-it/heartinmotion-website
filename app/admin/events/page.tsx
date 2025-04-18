"use client"

import { getEvents } from "@/actions/admin/event"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import AdminEventsList from "@/components/admin/events/eventsList"
import { Prisma } from "@prisma/client"
import { useEffect, useState } from "react"

const Admin_EventsListPage = () => {
    const [ eventData, setEventData ] = useState<Prisma.PromiseReturnType<typeof getEvents>>()

    useEffect(() => {
        const fetchEvents = async () => {
            await getEvents()
            .then(res => {
                if(res)
                    setEventData(res)
            })
        }

        fetchEvents()
    }, [])

    return (
        <AdminPageWrapper title="Events" redirect="/admin">
           <AdminEventsList eventsData={eventData} />
        </AdminPageWrapper>
    )
}

export default Admin_EventsListPage