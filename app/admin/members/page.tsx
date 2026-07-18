import { getMembers } from "@/actions/admin/member"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import AdminMembersList from "@/components/admin/members/membersList"

const Admin_MembersListPage = async () => {
    const memberData = await getMembers()

    return (
        <AdminPageWrapper title="Members" redirect="/admin">
            <AdminMembersList memberData={memberData ?? undefined} />
        </AdminPageWrapper>
    )
}

export default Admin_MembersListPage
