"use client"

import * as z from 'zod'
import { useEffect, useState, useTransition } from "react"
import { getPublicEventBySlug } from "@/actions/volunteer/event"
import { Prisma } from "@prisma/client"
import { Button } from "../ui/button"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form'
import { Input } from '@/components/ui/input'
import { RegisterSchema } from '@/schemas'
import { registerShift } from '@/actions/volunteer/register'
import { signIn, useSession } from 'next-auth/react'
import { FormError } from '../ui/formError'
import Link from 'next/link'
import { getRegisteredShifts, getWaitlistedShifts } from '@/actions/account/user'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'
import { getFriends } from '@/actions/admin/member'
import { sanitizeHtml } from '@/lib/sanitize'
import { formatShiftDate, formatShiftTimeRange } from '@/lib/time'

export const EventDetails = ({ eventDetailData, registeredShiftData, waitlistedShiftData } : { eventDetailData: Prisma.PromiseReturnType<typeof getPublicEventBySlug>, registeredShiftData: Prisma.PromiseReturnType<typeof getRegisteredShifts>, waitlistedShiftData: Prisma.PromiseReturnType<typeof getWaitlistedShifts>}) => {
    const [showRegistration, setShowRegistration] = useState(false);
    const [selectedShift, setSelectedShift] = useState<{description: string, id: number} | null>(null);

    const [isPending, startTransition] = useTransition()    
    const [error, setError] = useState<string | undefined>('') 

    const [friends, setFriends] = useState('')

    const session = useSession()

    useEffect(() => {
        if(eventDetailData?.hidden)
            window.location.replace("/")

        const renderPage = () => {
            const container = document.getElementById("page-content-container")!
            if (eventDetailData?.content)
                container.innerHTML = sanitizeHtml(eventDetailData.content)
            else
                container.innerHTML = "Loading..."
        }
        renderPage()

    }, [eventDetailData]);

    useEffect(() => {
        const fetchFriends = async () => {
            if(session.data?.user.member_id)
                await getFriends(session.data?.user.member_id)
                    .then(res => {
                        setFriends(res?.friends ? res?.friends : '')
                        form.setValue("friends", res?.friends ? res?.friends : '')
                    })
        }

        fetchFriends()
    // Depend on the member id, not the session object — the session object gets
    // a new identity on every auth refresh, which would refetch friends each time.
    }, [session.data?.user.member_id])

    const handleRegisterClick = (shift: {description: string, id: number}) => {
        setSelectedShift(shift);
        setShowRegistration(true);
    };

    const form = useForm<z.infer<typeof RegisterSchema>>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            transportation: 'Bus',
            friends: ''
        }
    })

    const onSubmit: SubmitHandler<z.infer<typeof RegisterSchema>> = (data) => {
        startTransition(() => {
            if(session.data?.user.member_id && eventDetailData && selectedShift)
                registerShift(data, session.data?.user.member_id, selectedShift.id, eventDetailData.id)
                .then(() => {
                    setShowRegistration(false)
                    window.location.reload()
                })
                .catch(() => {
                    setError("An unexpected error occurred.")
                })
            else
                setError("An unexpected error occurred.")
        })
    }

    return (
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex-1 flex items-start">
                <div className='p-5'>
                    <div id="page-content-container" className="prose prose-md max-w-none text-start"></div>
                </div>
            </div>
            <div className="w-full md:w-1/3 flex flex-col items-center justify-start p-4">
                <div className="w-full">
                    <h1 className="text-2xl font-bold text-center mb-6 text-primary">Upcoming Shifts</h1>
                    {eventDetailData && eventDetailData.events_eventshift && eventDetailData.events_eventshift.filter(shift => shift.start_time > new Date()).map((shift, key) => (
                            <div key={key} className="mb-4 rounded-xl border border-border shadow-xs p-4 bg-card">
                                <h3 className="text-foreground font-semibold text-lg">{shift.description}</h3>
                                <div className="mt-1 text-sm text-muted-foreground">{formatShiftDate(shift.start_time, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                <div className="mt-1 text-sm text-muted-foreground">{formatShiftTimeRange(shift.start_time, shift.end_time)}</div>
                                <div className="mt-1 text-sm text-muted-foreground">{shift.location}</div>
                                <div className="mt-2 inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground"><span className="font-semibold mr-1">{(shift.spots - shift._count.events_eventshiftmember >= 0) ? (shift.spots - shift._count.events_eventshiftmember) : 0}</span><span>spots left</span></div>
                                { registeredShiftData && waitlistedShiftData && session.data?.user.admin_level !== undefined &&
                                    <div>
                                        { registeredShiftData?.filter(registeredShift => registeredShift.shift_id === shift.id).length === 0 && waitlistedShiftData?.filter(waitlistedShift => waitlistedShift.eventshift_id === shift.id).length === 0 && (shift.spots - shift._count.events_eventshiftmember) > 0 &&
                                            <Button
                                                type="button"
                                                onClick={() => handleRegisterClick({description: shift.description, id: shift.id})}
                                                className='flex w-full mt-4'
                                                >
                                                Register
                                            </Button>
                                        }
                                        { registeredShiftData?.filter(registeredShift => registeredShift.shift_id === shift.id).length > 0 &&
                                            <div className='mt-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-sm font-medium text-emerald-700'>You are registered.</div>
                                        }
                                        { waitlistedShiftData?.filter(waitlistedShift => waitlistedShift.eventshift_id === shift.id).length > 0 && registeredShiftData?.filter(registeredShift => registeredShift.shift_id === shift.id).length === 0 &&
                                            <div className='mt-3 rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-sm font-medium text-amber-700'>You are on the waitlist.</div>
                                        }
                                        {
                                            registeredShiftData?.filter(registeredShift => registeredShift.shift_id === shift.id).length === 0 && waitlistedShiftData?.filter(waitlistedShift => waitlistedShift.eventshift_id === shift.id).length === 0 && (shift.spots - shift._count.events_eventshiftmember) <= 0 &&
                                            <div className='mt-3 text-sm text-muted-foreground'>There are no available spots in this shift.</div>
                                        }
                                    </div>
                                }
                                {
                                    session.data?.user.admin_level === undefined &&
                                    <div>
                                        <div className='mt-3 text-sm text-muted-foreground'><Link href={"/account/register"} onClick={() => {
                                            if(!session.data || !session.data.user.email)
                                                signIn("google", {
                                                    callbackUrl: DEFAULT_LOGIN_REDIRECT
                                                })
                                        }} className='text-primary font-medium'>Become a member</Link> to register.</div>
                                    </div>
                                }

                            </div>
                    ))}
                </div>
            </div>
            {showRegistration && selectedShift && (
                <div className="fixed inset-0 flex items-center justify-center bg-foreground/40 backdrop-blur-sm">
                    <div className="bg-card p-6 rounded-xl shadow-lift border border-border w-[90%] md:w-[60%]"> {/* Adjusted width here */}
                        <h2 className="text-xl font-bold mb-4">Register for Shift</h2>
                        <p className="text-lg mb-4">{selectedShift.description}</p>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <FormField 
                                    control={form.control}
                                    name="transportation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Transportation:</FormLabel>
                                            <FormControl>
                                                <select {...field} className="border rounded p-2 mb-4 w-full">
                                                    <option value="Bus">Bus</option>
                                                    <option value="Ride">Ride</option>
                                                    <option value="Walk">Walk</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField 
                                    control={form.control}
                                    name="friends"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Friends:</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field}
                                                    type="text"
                                                    placeholder=""
                                                    className="border rounded p-2 mb-4 w-full"
                                                    value={friends}
                                                    onChange={
                                                        (e) => {
                                                            setFriends(e.target.value)
                                                            form.setValue("friends", friends)
                                                        }
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                { error &&
                                    <FormError message={ error } />
                                } 
                                <Button
                                    type="submit"
                                    className="w-full mt-4"
                                    disabled={isPending}
                                >
                                    Register
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowRegistration(false)}
                                    className="w-full mt-2"
                                    disabled={isPending}
                                >
                                    Cancel
                                </Button>
                            </form>
                        </Form>
                    </div>
                </div>
            )}
        </div>
    )
}