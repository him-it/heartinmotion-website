"use client"

import { getEventBySlug } from "@/actions/admin/event"
import { events_event } from "@prisma/client"
import dynamic from "next/dynamic"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const Admin_EventDetailsEditPage = () => {
    const DynamicEditor = dynamic(() => import("@/components/admin/events/event/editEvent"), { ssr: false });
    
    const router = useRouter()
    const { slug } = useParams()!
    const [ eventData, setEventData ] = useState<events_event>({} as events_event) 

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
        <DynamicEditor eventData={ eventData }/>
    )
}

export default Admin_EventDetailsEditPage
