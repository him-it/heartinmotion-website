import { getEventBySlug } from "@/actions/admin/event"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import AdminEventDetails from "@/components/admin/events/event/eventDetails"
import { redirect } from "next/navigation"

const Admin_EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params
    const eventData = await getEventBySlug(slug)

    if (!eventData)
        redirect('/')

    return (
        <AdminPageWrapper title={eventData.name} redirect="/admin/events" width="max-w-5xl">
            <AdminEventDetails eventData={eventData} />
        </AdminPageWrapper>
    )
}

export default Admin_EventDetailsPage
