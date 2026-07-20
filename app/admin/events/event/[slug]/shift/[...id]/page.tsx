import { getShiftById } from "@/actions/admin/event"
import { getMemberNames } from "@/actions/admin/member"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import AdminShiftDetails from "@/components/admin/events/event/shift/shiftDetails"
import { redirect } from "next/navigation"

const Admin_EventShiftPage = async ({ params }: { params: Promise<{ slug: string, id: string[] }> }) => {
    const { id } = await params
    const [shiftData, memberData] = await Promise.all([
        getShiftById(Number(id?.[0])),
        getMemberNames()
    ])

    if (!shiftData || !memberData)
        redirect('/')

    return (
        <AdminPageWrapper title={shiftData.events_event.name} redirect={"/admin/events/event/" + shiftData.events_event.slug} width="max-w-5xl">
            <AdminShiftDetails shiftData={shiftData} memberData={memberData} />
        </AdminPageWrapper>
    )
}

export default Admin_EventShiftPage
