"use server"

import { db } from '@/lib/db'

import { RegisterSchema } from '@/schemas'
import * as z from 'zod'

export const registerShift = async (data: z.infer<typeof RegisterSchema>, member_id: number, eventshift_id: number, event_id: number ) => {
    const validatedFields = RegisterSchema.safeParse(data)

    if(!validatedFields.success)
        return { error: "Invalid fields!" }

    if(!member_id || !eventshift_id || !event_id)
        return { error: "An unexpected error occured." }

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