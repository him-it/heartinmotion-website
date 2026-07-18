import { getEvents, getSeasons } from "@/actions/admin/event"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import AdminSeasonList from "@/components/admin/events/seasons/seasonsList"

const Admin_SeasonsListPage = async () => {
    const [seasonData, eventData] = await Promise.all([
        getSeasons(),
        getEvents()
    ])

    return (
        <AdminPageWrapper title="Seasons" redirect="/admin/events">
            <AdminSeasonList eventData={eventData ?? undefined} seasonData={seasonData ?? undefined} />
        </AdminPageWrapper>
    )
}

export default Admin_SeasonsListPage
