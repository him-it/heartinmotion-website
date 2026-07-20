import { getEvents, getSeasons } from "@/actions/admin/event"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import AdminSeasonList from "@/components/admin/events/seasons/seasonsList"

const Admin_SeasonsListPage = async () => {
    const [seasonData, eventData] = await Promise.all([
        getSeasons(),
        getEvents()
    ])

    return (
        <AdminPageWrapper title="Seasons" redirect="/admin/events" width="max-w-4xl">
            <AdminSeasonList eventData={eventData ?? undefined} seasonData={seasonData ?? undefined} />
        </AdminPageWrapper>
    )
}

export default Admin_SeasonsListPage
