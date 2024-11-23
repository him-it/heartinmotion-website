"use client"

import { getEvents, getSeasons } from "@/actions/admin/event"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import AdminSeasonList from "@/components/admin/events/seasons/seasonsList"
import { Prisma } from "@prisma/client"
import { useEffect, useState } from "react"


const Admin_SeasonsListPage = () => {
    const [seasonData, setSeasonData] = useState<Prisma.PromiseReturnType<typeof getSeasons>>()
    const [eventData, setEventData] = useState<Prisma.PromiseReturnType<typeof getEvents>>()

    useEffect(() => {
        const fetchData = async () => {
            await getSeasons()
            .then(async (res) => {
                setSeasonData(res)
                await getEvents()
                .then(res => {
                    setEventData(res)
                })
            })
        }
        fetchData()
    }, [])

    return (
        <AdminPageWrapper title="Seasons" redirect="/admin/events">
            <AdminSeasonList eventData={eventData} seasonData={seasonData}></AdminSeasonList>
        </AdminPageWrapper>
    )
}

export default Admin_SeasonsListPage