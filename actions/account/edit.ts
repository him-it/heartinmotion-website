"use server"

import { db } from "@/lib/db"
import { requireMember } from "@/lib/authGuard"

import { AccountSchema } from '@/schemas'
import * as z from 'zod'

export const edit = async (data: z.infer<typeof AccountSchema>) => {
    const user = await requireMember()

    if(!user)
        return { error: "Unauthorized." }

    const validatedFields = AccountSchema.safeParse(data)

    if(!validatedFields.success)
        return { error: "Invalid fields!" }

    const { graduating_year } = data

    // Always edit the caller's own record — ignore any client-supplied id, and
    // never allow the email (the identity key) to be changed here.
    const { id: _id, email: _email, ...rest } = data

    await db.member_member.update({
        where: {
            id: user.member_id
        },
        data: {
            ...rest,
            graduating_year: Number(graduating_year)
        }
    })

    return { success: "Saved successfully!" }
}
