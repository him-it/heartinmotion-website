import { getManagers } from "@/actions/admin/managers"
import { getMemberNames } from "@/actions/admin/member"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import { AdminManagerList } from "@/components/admin/managers/managerList"

const Admin_ManagersListPage = async () => {
    const managerData = await getManagers()
    const memberData = await getMemberNames()

    return (
        <AdminPageWrapper title="Managers" redirect="/admin/managers">
            <AdminManagerList managerData={managerData} memberData={memberData} />
        </AdminPageWrapper>
    )
}

export default Admin_ManagersListPage