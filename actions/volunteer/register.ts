"use server"

import { db } from '@/lib/db'

import { RegisterSchema } from '@/schemas'
import * as z from 'zod'
import { requireMember } from '@/lib/authGuard'

export const registerShift = async (data: z.infer<typeof RegisterSchema>, member_id: number, eventshift_id: number, event_id: number ) => {
    const user = await requireMember()

    // Always register the caller's own membership — never trust a
    // client-supplied member_id, or any signed-in member could register (or
    // waitlist) shifts on someone else's behalf.
    if(!user || user.member_id !== member_id)
        return { error: "Unauthorized." }

    const validatedFields = RegisterSchema.safeParse(data)

    if(!validatedFields.success)
        return { error: "Invalid fields!" }

    if(!member_id || !eventshift_id || !event_id)
        return { error: "An unexpected error occurred." }

    const shiftCheck = await db.events_eventsignup.findFirst({
        where: {
            member_id,
            events_eventsignup_shifts: {
                some: {
                    eventshift_id
                }
            }
        }
    })

    if(shiftCheck)
        return { error: "You are already registered for this shift." }

    await db.events_eventsignup.create({
        data: {
            event_id,
            member_id,
            transportation: data.transportation,
            time: new Date().getTime(),
            friends: data.friends || '',
            events_eventsignup_shifts: {
                create: {
                    eventshift_id
                }
            }
        }
    })

    return { success: "Registered!" }
}