"use server"

import { getMemberByEmail } from "@/lib/members"
import { requireSession } from "@/lib/authGuard"
import { db } from "@/lib/db"

import { AccountSchema } from '@/schemas'
import * as z from 'zod'

export const register = async (data: z.infer<typeof AccountSchema> | any ) => {
    const sessionUser = await requireSession()

    if(!sessionUser?.email)
        return { error: "You must be signed in to register." }

    // Bind the membership to the authenticated Google account — never trust a
    // client-supplied email, and never let an existing member re-register.
    if(sessionUser.member_id !== undefined && sessionUser.member_id !== null)
        return { error: "You are already a member." }

    const email = sessionUser.email

    const validatedFields = AccountSchema.safeParse({ ...data, email })

    if(!validatedFields.success)
        return { error: "Invalid fields!" }

    const { graduating_year } = data

    const existingUser = await getMemberByEmail(email)

    if(existingUser)
        return { error: "Email already in use!" }

    await db.member_member.create({
        data: {
            ...data,
            email,
            graduating_year: Number(graduating_year),
            member_memberprivate: {
                create: {
                    start_date: new Date(new Date().getTime() - 7 * 60 * 60 * 1000),
                    in_him_group: false,
                    in_him_crew_group: false,
                    has_lanyard: false,
                    member_type: 'HM',
                    contact: 'N',
                    contact_notes: '',
                    has_name_badge: false,
                    has_crew_neck: false,
                    has_tshirt: false,
                    has_long_sleeves: false,
                    has_hoodies: false
                }
            },
            member_memberrestricted: {
                create: {
                    admin_level: 0
                }
            }
        }
    })

    return { success: "Success!" }
}