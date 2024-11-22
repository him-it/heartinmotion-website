"use client"

import { getManagers } from "@/actions/admin/managers"
import { getMemberNames, getMembers } from "@/actions/admin/member"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import { AdminManagerList } from "@/components/admin/managers/managerList"
import { Prisma } from "@prisma/client"
import { useEffect, useState } from "react"

const Admin_ManagersListPage = () => {
    const [memberData, setMemberData] = useState<Prisma.PromiseReturnType<typeof getMemberNames>>({} as Prisma.PromiseReturnType<typeof getMemberNames>)
    const [managerData, setManagerData] = useState<Prisma.PromiseReturnType<typeof getManagers>>({} as Prisma.PromiseReturnType<typeof getManagers>)
    useEffect(() => {
        const fetchData = async () => {
            await getManagers()
            .then(async (res) => {
                setManagerData(res)
                await getMembers()
                .then(res => {
                    setMemberData(res)
                })
            })
        }
        fetchData()
    }, [])

    return (
        <AdminPageWrapper title="Managers" redirect="/admin">
            <AdminManagerList managerData={managerData} memberData={memberData} />
        </AdminPageWrapper>
    )
}

export default Admin_ManagersListPage