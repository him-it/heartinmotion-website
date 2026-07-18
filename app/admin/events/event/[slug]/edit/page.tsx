import { getEventBySlug } from "@/actions/admin/event"
import AdminEditEventDynamic from "@/components/admin/events/event/editEventDynamic"
import { redirect } from "next/navigation"

const Admin_EventDetailsEditPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params
    const eventData = await getEventBySlug(slug)

    if (!eventData)
        redirect('/')

    return (
        <AdminEditEventDynamic eventData={eventData} />
    )
}

export default Admin_EventDetailsEditPage
