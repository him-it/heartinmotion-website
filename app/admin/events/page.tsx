"use client"

import { getEvents } from "@/actions/admin/event"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import AdminEventsList from "@/components/admin/events/eventsList"
import { Prisma } from "@prisma/client"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

const Admin_EventsListPage = () => {
    const [ eventData, setEventData ] = useState<Prisma.PromiseReturnType<typeof getEvents>>()
    const session = useSession()

    useEffect(() => {
        const fetchEvents = async () => {
            await getEvents()
            .then(res => {
                setEventData(res)
                console.log(res)
                console.log("hi")
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