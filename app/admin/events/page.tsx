"use server"

import { getEvents } from "@/actions/admin/event"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import AdminEventsList from "@/components/admin/events/eventsList"
import { Prisma } from "@prisma/client"

const Admin_EventsListPage = ({ eventsData }: { eventsData: Prisma.PromiseReturnType<typeof getEvents> }) => {
    return (
        <AdminPageWrapper title="Events" redirect="/admin">
           <AdminEventsList eventsData={eventsData} />
        </AdminPageWrapper>
    )
}

export async function getServerSideProps() {
    try {
        const events = await getEvents()
        return { props: { eventsData: events } }
    } catch (error) {
        return { props: { eventsData: undefined } }
    }
}

export default Admin_EventsListPage