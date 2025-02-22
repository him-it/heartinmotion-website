"use client"

import { getEventBySlug } from "@/actions/admin/event"
import { PageWrapper } from "@/components/pageWrapper"
import { EventDetails } from "@/components/volunteer/eventDetails"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Prisma } from '@prisma/client';
import { getSession } from "next-auth/react"
import { getRegisteredShifts, getWaitlistedShifts } from "@/actions/account/user"


const Events = () => {
    const router = useRouter()
    const { slug } = useParams()!
    const [ eventData, setEventData ] = useState<Prisma.PromiseReturnType<typeof getEventBySlug>>({} as Prisma.PromiseReturnType<typeof getEventBySlug>)
    const [ registeredShiftData, setRegisteredShiftData ] = useState<Prisma.PromiseReturnType<typeof getRegisteredShifts>>()
    const [ waitlistedShiftData, setWaitlistedShiftData ] = useState<Prisma.PromiseReturnType<typeof getWaitlistedShifts>>()

    useEffect(() => {
        const fetchEvent = async () => {
            await getEventBySlug(slug ? slug[0] as string : "")
                .then(async res => {
                    if(res) 
                        {
                            setEventData(res);
                                const registeredShiftsRes = await getRegisteredShifts();
                                setRegisteredShiftData(registeredShiftsRes)

                                const waitlistedShiftsRes = await getWaitlistedShifts();
                                setWaitlistedShiftData(waitlistedShiftsRes)
                        }
                    else
                        router.push('/')
                })
        }

        fetchEvent()
    }, [])

    return (
        <PageWrapper title={ eventData?.name ? eventData.name : "Loading..." }>
            <EventDetails eventDetailData={ eventData! } registeredShiftData={registeredShiftData!} waitlistedShiftData={waitlistedShiftData!}></EventDetails>
        </PageWrapper>
    )
}

export default Events