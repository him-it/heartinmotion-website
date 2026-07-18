import { getSpotlightByIdAdmin } from "@/actions/leadership/spotlight"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import { SpotlightForm } from "@/components/admin/spotlights/spotlightForm"
import { redirect } from "next/navigation"

const Admin_EditSpotlightPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const numId = Number(id)

    if (!Number.isInteger(numId) || numId <= 0)
        redirect("/admin/spotlights")

    const spotlight = await getSpotlightByIdAdmin(numId)

    if (!spotlight)
        redirect("/admin/spotlights")

    return (
        <AdminPageWrapper title={spotlight.name} redirect="/admin/spotlights">
            <SpotlightForm spotlight={spotlight} />
        </AdminPageWrapper>
    )
}

export default Admin_EditSpotlightPage
