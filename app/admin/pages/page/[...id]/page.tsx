import { getPageById } from "@/actions/admin/pages/page"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import AdminEditPageDynamic from "@/components/admin/pages/editPageDynamic"
import { redirect } from "next/navigation"

const Admin_PagePage = async ({ params }: { params: Promise<{ id: string[] }> }) => {
    const { id } = await params
    const pageData = await getPageById(Number(id?.[0]))

    if (!pageData)
        redirect('/admin/pages')

    return (
        <AdminPageWrapper title={pageData.title} redirect="/admin/pages">
            <AdminEditPageDynamic pageData={pageData} />
        </AdminPageWrapper>
    )
}

export default Admin_PagePage
