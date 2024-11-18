"use server"

import { getPages } from "@/actions/admin/pages/page"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import { AdminPageList } from "@/components/admin/pages/pageList"

const Admin_PagesPage = async () => {
    const pageData = await getPages()

    return (
        <AdminPageWrapper title="Pages" redirect="/admin">
            <AdminPageList pageData={pageData}></AdminPageList>
        </AdminPageWrapper>
    )
}

export default Admin_PagesPage