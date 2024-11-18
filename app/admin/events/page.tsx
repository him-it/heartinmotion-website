"use server"

import { getEvents } from "@/actions/admin/event"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import AdminEventsList from "@/components/admin/events/eventsList"

const Admin_EventsListPage = async () => {
    const events = await getEvents()

    return (
        <AdminPageWrapper title="Events" redirect="/admin">
           <AdminEventsList eventsData={events} />
        </AdminPageWrapper>
    )
}

export default Admin_EventsListPage