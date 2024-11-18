"use client"

import { getMemberById } from "@/actions/admin/member"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import AdminMemberDetails from "@/components/admin/members/memberDetails"
import { Prisma } from "@prisma/client"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const Admin_MemberDetailsPage = () => {
    const router = useRouter()
    const { id } = useParams()
    const [ memberData, setMemberData ] = useState<Prisma.PromiseReturnType<typeof getMemberById>>()

    useEffect(() => {
        const fetchMember = async () => {
            await getMemberById(Number(id))
                .then(res => {
                    if(res)
                        setMemberData(res)
                    else
                        router.push('/')
                })
        }

        fetchMember()
    }, [])

    return (
        <AdminPageWrapper title={memberData ? memberData.first_name + " " + memberData.last_name : "Loading..."} redirect="/admin/members">
            <AdminMemberDetails memberData={memberData ? memberData : {} as Prisma.PromiseReturnType<typeof getMemberById>}></AdminMemberDetails>
        </AdminPageWrapper>
    )
}

export default Admin_MemberDetailsPage