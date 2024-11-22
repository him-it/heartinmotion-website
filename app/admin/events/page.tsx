"use client"

import { getEvents } from "@/actions/admin/event"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import AdminEventsList from "@/components/admin/events/eventsList"
import { Prisma } from "@prisma/client"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

const Admin_EventsListPage = () => {
    const session = useSession();
    const [ eventData, setEventData ] = useState<Prisma.PromiseReturnType<typeof getEvents>>({} as Prisma.PromiseReturnType<typeof getEvents>)

    useEffect(() => {
        const fetchEvents = async () => {
            await getEvents()
            .then(res => {
                setEventData(res)
            })
        }
        fetchEvents()
    }, [session])

    return (
        <AdminPageWrapper title="Events" redirect="/admin">
           <AdminEventsList eventsData={eventData} />
        </AdminPageWrapper>
    )
}

export default Admin_EventsListPage