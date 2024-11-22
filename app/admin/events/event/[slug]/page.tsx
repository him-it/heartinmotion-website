"use client"

import { getEventBySlug } from "@/actions/admin/event"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import AdminEventDetails from "@/components/admin/events/event/eventDetails"
import { Prisma } from "@prisma/client"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const Admin_EventDetailsPage = () => {
    const router = useRouter()
    const { slug } = useParams()!
    const [ eventData, setEventData ] = useState<Prisma.PromiseReturnType<typeof getEventBySlug>>({} as Prisma.PromiseReturnType<typeof getEventBySlug>) 

    useEffect(() => {
        const fetchEvent = async () => {
            await getEventBySlug(slug as string)
                .then(res => {
                    if(res)
                        setEventData(res)
                    else
                        router.push('/')
                })
        }

        fetchEvent()
    }, [])

    return (
        <AdminPageWrapper title={ eventData?.name ? eventData.name : "Loading..." } redirect="/admin/events">
            <AdminEventDetails eventData={ eventData } />
        </AdminPageWrapper>
    )
}

export default Admin_EventDetailsPage
