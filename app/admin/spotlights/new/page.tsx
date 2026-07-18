"use client"

import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import { SpotlightForm } from "@/components/admin/spotlights/spotlightForm"

const Admin_NewSpotlightPage = () => {
    return (
        <AdminPageWrapper title="New Spotlight" redirect="/admin/spotlights">
            <SpotlightForm />
        </AdminPageWrapper>
    )
}

export default Admin_NewSpotlightPage
