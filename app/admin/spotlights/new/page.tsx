"use client"

import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import dynamic from "next/dynamic"

const DynamicForm = dynamic(
    () => import("@/components/admin/spotlights/spotlightForm").then(m => m.SpotlightForm),
    { ssr: false }
)

const Admin_NewSpotlightPage = () => {
    return (
        <AdminPageWrapper title="New Spotlight" redirect="/admin/spotlights">
            <DynamicForm />
        </AdminPageWrapper>
    )
}

export default Admin_NewSpotlightPage
