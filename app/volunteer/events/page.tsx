import { getUpcomingEvents } from "@/actions/volunteer/event"
import { PageWrapper } from "@/components/pageWrapper"
import { EventsList } from "@/components/volunteer/eventsList"

// Public page with no cookie/header usage — force dynamic rendering so the
// event list is fetched per-request instead of frozen at build time.
export const dynamic = "force-dynamic"

const Events = async () => {
    const eventData = await getUpcomingEvents()

    return (
        <PageWrapper title="Upcoming Events">
            <EventsList eventListData={eventData ?? undefined} />
        </PageWrapper>
    )
}

export default Events
