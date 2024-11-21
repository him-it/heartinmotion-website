"use client"

import { getPageById } from "@/actions/admin/pages/page"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import { Prisma } from "@prisma/client"
import dynamic from "next/dynamic"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"

const Admin_PagePage = () => {
    const router = useRouter()
    const { id } = useParams()!
    const [ pageData, setPageData ] = useState<Prisma.PromiseReturnType<typeof getPageById>>()

    const DynamicEditor = dynamic(() => import("@/components/admin/pages/editPage"), { ssr: false });

    useEffect(() => {
        const fetchPage = async () => {
            await getPageById(Number(id))
            .then((res) => {
                if(res)
                    setPageData(res)
                else
                    router.replace('/admin/pages')
            })
        }

        fetchPage()
    }, [])

    return (
        <AdminPageWrapper title={pageData ? pageData.title : "Loading..."} redirect="/admin/pages">
            <DynamicEditor pageData={ pageData }/>
        </AdminPageWrapper>
    )
}

export default Admin_PagePage