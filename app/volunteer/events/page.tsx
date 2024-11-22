"use client"

import { getUpcomingEvents } from "@/actions/volunteer/event"
import { PageWrapper } from "@/components/pageWrapper"
import { EventsList } from "@/components/volunteer/eventsList"
import { Prisma } from "@prisma/client"
import { useEffect, useState } from "react"

const Events = () => {
    const [ eventData, setEventData ] = useState<Prisma.PromiseReturnType<typeof getUpcomingEvents>>()

    useEffect(() => {
        const fetchEvents = async () => {
            await getUpcomingEvents()
            .then(res => {
                if(res)
                    setEventData([...res])
            })
        }
        fetchEvents()
    }, [])
    return (
        <PageWrapper title="Upcoming Events">
            <EventsList eventListData={ eventData }></EventsList>
        </PageWrapper>
    )
}

export default Events