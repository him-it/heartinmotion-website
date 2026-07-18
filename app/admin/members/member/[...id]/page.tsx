import { getMemberById } from "@/actions/admin/member"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import AdminMemberDetails from "@/components/admin/members/memberDetails"
import { redirect } from "next/navigation"

const Admin_MemberDetailsPage = async ({ params }: { params: Promise<{ id: string[] }> }) => {
    const { id } = await params
    const memberData = await getMemberById(Number(id?.[0]))

    if (!memberData)
        redirect('/admin/members')

    return (
        <AdminPageWrapper title={memberData.first_name + " " + memberData.last_name} redirect="/admin/members">
            <AdminMemberDetails memberData={memberData} />
        </AdminPageWrapper>
    )
}

export default Admin_MemberDetailsPage
