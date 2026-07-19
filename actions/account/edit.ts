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

    // Self-service only: always edits the caller's own record. For admin edits
    // of another member, use editMember in actions/admin/member.ts instead.
    // Email (the identity key) can never be changed here.
    const { email: _email, ...rest } = data

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
