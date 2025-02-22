"use server"

import { db } from "@/lib/db"

import { AccountSchema } from '@/schemas'
import { getSession } from "next-auth/react"
import * as z from 'zod'

export const edit = async (data: z.infer<typeof AccountSchema>) => {
    const session = await getSession()

    const id = session?.user.member_id ? session.user.member_id : NaN

    const validatedFields = AccountSchema.safeParse(data)

    if(!validatedFields.success)
        return { error: "Invalid fields!" }

    const { graduating_year } = data

    await db.member_member.update({
        where: {
            id
        },
        data: {
            ...data,
            graduating_year: Number(graduating_year)
        }
    })

    return { success: "Saved successfully!" }
}