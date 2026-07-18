"use server"

import { getSpotlightsAdmin } from "@/actions/leadership/spotlight"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import { SpotlightAdminList } from "@/components/admin/spotlights/spotlightList"

const Admin_SpotlightsPage = async () => {
    const spotlightData = await getSpotlightsAdmin()

    return (
        <AdminPageWrapper title="Spotlights" redirect="/admin">
            <SpotlightAdminList spotlightData={spotlightData} />
        </AdminPageWrapper>
    )
}

export default Admin_SpotlightsPage
