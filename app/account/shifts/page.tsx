"use client"

import { getRegisteredShifts } from "@/actions/account/user";
import RegisteredShifts from "@/components/account/registeredShifts";
import { PageWrapper } from "@/components/pageWrapper";
import { Prisma } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const ShiftsPage = () => {
    const  [ shiftData, setShiftData ] = useState<Prisma.PromiseReturnType<typeof getRegisteredShifts>>(null)

  useEffect(() => {
    const fetchShifts = async () => {
        await getRegisteredShifts()
        .then(res => {
            setShiftData(res)
        })
    }

    fetchShifts()
  }, [])

    return (
        <PageWrapper title="Registered Shifts">
            <RegisteredShifts shiftData={shiftData}></RegisteredShifts>
        </PageWrapper>
    )
}

export default ShiftsPage