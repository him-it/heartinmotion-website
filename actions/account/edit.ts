"use server"

import { db } from "@/lib/db"

import { AccountSchema } from '@/schemas'
import * as z from 'zod'

export const edit = async (data: z.infer<typeof AccountSchema>) => {
    const validatedFields = AccountSchema.safeParse(data)

    if(!validatedFields.success)
        return { error: "Invalid fields!" }

    const { email, graduating_year } = data

    await db.member_member.update({
        where: {
            email
        },
        data: {
            ...data,
            graduating_year: Number(graduating_year)
        }
    })

    return { success: "Saved successfully!" }
}