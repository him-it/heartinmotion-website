"use server"

import { getUpcomingEvents } from "@/actions/volunteer/event"
import { PageWrapper } from "@/components/pageWrapper"
import { EventsList } from "@/components/volunteer/eventsList"

const Events = async () => {
    const eventsListData = await getUpcomingEvents()

    return (
        <PageWrapper title="Upcoming Events">
            <EventsList eventListData={ eventsListData }></EventsList>
        </PageWrapper>
    )
}

export default Events