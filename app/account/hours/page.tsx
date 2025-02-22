"use client"

import { getHours } from "@/actions/account/user";
import HoursEarned from "@/components/account/hoursEarned";
import { PageWrapper } from "@/components/pageWrapper";
import { Prisma } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const HoursPage = () => {
    const session = useSession();
    const  [ shiftData, setShiftData ] = useState<Prisma.PromiseReturnType<typeof getHours>>(null)

  useEffect(() => {
    const fetchShifts = async () => {
        if(session.data?.user.member_id)
            await getHours(session.data.user.member_id)
            .then(res => {
                setShiftData(res)
            })
    }

    fetchShifts()
  }, [session])

    return (
        <PageWrapper title="Hours Earned">
            <HoursEarned shiftData={shiftData}></HoursEarned>
        </PageWrapper>
    )
}

export default HoursPage