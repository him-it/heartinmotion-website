"use client"

import { getSpotlightByIdAdmin } from "@/actions/leadership/spotlight"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import { Prisma } from "@prisma/client"
import dynamic from "next/dynamic"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const DynamicForm = dynamic(
    () => import("@/components/admin/spotlights/spotlightForm").then(m => m.SpotlightForm),
    { ssr: false }
)

const Admin_EditSpotlightPage = () => {
    const router = useRouter()
    const { id } = useParams()!
    const [spotlight, setSpotlight] = useState<Prisma.PromiseReturnType<typeof getSpotlightByIdAdmin>>()

    useEffect(() => {
        const numId = Number(id)
        if (!Number.isInteger(numId) || numId <= 0) {
            router.replace("/admin/spotlights")
            return
        }
        getSpotlightByIdAdmin(numId).then(res => {
            if (res)
                setSpotlight(res)
            else
                router.replace("/admin/spotlights")
        })
    }, [])

    return (
        <AdminPageWrapper title={spotlight ? spotlight.name : "Loading…"} redirect="/admin/spotlights">
            {spotlight && <DynamicForm spotlight={spotlight} />}
        </AdminPageWrapper>
    )
}

export default Admin_EditSpotlightPage
