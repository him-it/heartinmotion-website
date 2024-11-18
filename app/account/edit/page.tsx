"use client"

import { PageWrapper } from "@/components/pageWrapper"

import { EditForm } from "@/components/account/editForm"
import { getUserById } from "@/actions/account/user";
import { useSession } from "next-auth/react";
import { Prisma } from "@prisma/client";
import { useEffect, useState } from "react";

const EditPage = () => {
    const session = useSession();
    const  [ user, setUser ] = useState<Prisma.PromiseReturnType<typeof getUserById>>(null)

    useEffect(() => {
        const fetchShifts = async () => {
            if(session.data?.user.member_id)
                await getUserById(session.data.user.member_id)
                .then(res => {
                    setUser(res)
                })
        }

        fetchShifts()
    }, [session])

    return (
        <PageWrapper title="Edit">
            <EditForm user={ user } />
        </PageWrapper>
    )
}

export default EditPage