"use client"

import { getHours } from "@/actions/account/user";
import HoursEarned from "@/components/account/hoursEarned";
import { PageWrapper } from "@/components/pageWrapper";
import { Prisma } from "@prisma/client";
import { useEffect, useState } from "react";

const HoursPage = () => {
    const  [ shiftData, setShiftData ] = useState<Prisma.PromiseReturnType<typeof getHours>>(null)

  useEffect(() => {
    const fetchShifts = async () => {
        await getHours()
        .then(res => {
            setShiftData(res)
        })
    }

    fetchShifts()
  }, [])

    return (
        <PageWrapper title="Hours Earned">
            <HoursEarned shiftData={shiftData}></HoursEarned>
        </PageWrapper>
    )
}

export default HoursPage