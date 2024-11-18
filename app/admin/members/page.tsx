"use server"

import { getMembers } from "@/actions/admin/member"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import AdminMembersList from "@/components/admin/members/membersList"

const Admin_MembersListPage = async () => {
    const memberData = await getMembers()

    return (
        <AdminPageWrapper title="Members" redirect="/admin">
            <AdminMembersList memberData={memberData}></AdminMembersList>
        </AdminPageWrapper>
    )
}

export default Admin_MembersListPage