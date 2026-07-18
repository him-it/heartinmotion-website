import { getRegisteredShifts, getWaitlistedShifts } from "@/actions/account/user"
import { getPublicEventBySlug } from "@/actions/volunteer/event"
import { auth } from "@/auth"
import { PageWrapper } from "@/components/pageWrapper"
import { EventDetails } from "@/components/volunteer/eventDetails"
import { redirect } from "next/navigation"

const Events = async ({ params }: { params: Promise<{ slug: string[] }> }) => {
    const { slug } = await params
    const eventData = await getPublicEventBySlug(slug?.[0] ?? '')

    if (!eventData)
        redirect('/')

    // Registered/waitlisted shifts are only meaningful for a logged-in member;
    // fetched here so the shift buttons render in their correct state on first
    // paint instead of flipping after a client-side fetch.
    const session = await auth()
    const memberId = session?.user?.member_id

    const [registeredShiftData, waitlistedShiftData] = memberId
        ? await Promise.all([
            getRegisteredShifts(memberId),
            getWaitlistedShifts(memberId)
        ])
        : [null, null]

    return (
        <PageWrapper title={eventData.name}>
            <EventDetails
                eventDetailData={eventData}
                registeredShiftData={registeredShiftData}
                waitlistedShiftData={waitlistedShiftData}
            />
        </PageWrapper>
    )
}

export default Events
