import { getManagers } from "@/actions/admin/managers"
import { getMemberNames } from "@/actions/admin/member"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import { AdminManagerList } from "@/components/admin/managers/managerList"

const Admin_ManagersListPage = async () => {
    const [managerData, memberData] = await Promise.all([
        getManagers(),
        getMemberNames()
    ])

    return (
        <AdminPageWrapper title="Managers" redirect="/admin" width="max-w-3xl">
            <AdminManagerList managerData={managerData ?? undefined} memberData={memberData ?? undefined} />
        </AdminPageWrapper>
    )
}

export default Admin_ManagersListPage
