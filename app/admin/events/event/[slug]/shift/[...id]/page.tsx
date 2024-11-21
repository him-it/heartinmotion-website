"use client"

import { getShiftById } from "@/actions/admin/event"
import { getMemberNames } from "@/actions/admin/member"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import AdminShiftDetails from "@/components/admin/events/event/shift/shiftDetails"
import { Prisma } from "@prisma/client"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const Admin_EventShiftPage = () => {
    const router = useRouter()
    const { id } = useParams()!
    const [ shiftData, setShiftData ] = useState<Prisma.PromiseReturnType<typeof getShiftById>>({} as Prisma.PromiseReturnType<typeof getShiftById>) 
    const [ memberData, setMemberData ] = useState<Prisma.PromiseReturnType<typeof getMemberNames>>({} as Prisma.PromiseReturnType<typeof getMemberNames>)

    useEffect(() => {
        const fetchEvent = async () => {
            await getShiftById(Number(id))
                .then(async (res) => {
                    if(res) {
                        setShiftData(res)
                        await getMemberNames()
                            .then(res => {
                                if(res)
                                    setMemberData(res)
                                else
                                    router.push('/')
                            })
                    }
                    else
                        router.push('/')
                })
        }

        fetchEvent()
    }, [])

    return (
        <AdminPageWrapper title={ shiftData?.events_event?.name ? shiftData.events_event.name : "Loading..." } redirect={"/admin/events/event/" + shiftData?.events_event?.slug}>
            <AdminShiftDetails shiftData={ shiftData } memberData={ memberData } />
        </AdminPageWrapper>
    )
}

export default Admin_EventShiftPage
