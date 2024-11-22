"use client"

import { getMembers } from "@/actions/admin/member"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import AdminMembersList from "@/components/admin/members/membersList"
import { Prisma } from "@prisma/client"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

const Admin_MembersListPage = () => {
    const session = useSession();
    const [memberData, setMemberData] = useState<Prisma.PromiseReturnType<typeof getMembers>>({} as Prisma.PromiseReturnType<typeof getMembers>)
    useEffect(() => {
        const fetchMembers = async () => {
            await getMembers()
            .then((res) => {
                setMemberData(res)
            })
        }
        fetchMembers()
    }, [session])

    return (
        <AdminPageWrapper title="Members" redirect="/admin">
            <AdminMembersList memberData={memberData}></AdminMembersList>
        </AdminPageWrapper>
    )
}

export default Admin_MembersListPage