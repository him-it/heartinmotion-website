"use server"

import { getUserByEmail } from '@/actions/account/user'
import { db } from "@/lib/db"

import { AccountSchema } from '@/schemas'
import { getSession } from 'next-auth/react'
import * as z from 'zod'

export const register = async (data: z.infer<typeof AccountSchema> | any ) => {
    const validatedFields = AccountSchema.safeParse(data)

    if(!validatedFields.success)
        return { error: "Invalid fields!" }

    const session = await getSession()

    if(session?.user.email) {
        const email = session.user.email

        const existingUser = await getUserByEmail(email)

        if(existingUser)
            return { error: "Email already in use!" }    
    }

    const { graduating_year } = data

    await db.member_member.create({
        data: {
            ...data,
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