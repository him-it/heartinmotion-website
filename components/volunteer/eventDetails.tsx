"use client"

import * as z from 'zod'
import { useEffect, useState, useTransition } from "react"
import { getEventBySlug } from "@/actions/admin/event"
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

export const EventDetails = ({ eventDetailData, registeredShiftData, waitlistedShiftData } : { eventDetailData: Prisma.PromiseReturnType<typeof getEventBySlug>, registeredShiftData: Prisma.PromiseReturnType<typeof getRegisteredShifts>, waitlistedShiftData: Prisma.PromiseReturnType<typeof getWaitlistedShifts>}) => {
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
                container.innerHTML = eventDetailData.content
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
    }, [session])

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
                    setError("An unexpected error occured.")
                })
            else
                setError("An unexpected error occured.")
        })
    }

    return (
        <div className="p-5 mx-auto flex flex-col md:flex-row shadow-lg rounded-lg">
            <div className="flex-1 flex items-start">
                <div className='p-5 justify-self-auto'>
                    <div id="page-content-container" className="prose prose-md max-w-none"></div>
                </div>
            </div>
            <div className="w-full md:w-1/3 flex flex-col items-center justify-start p-4">
                <div className="w-full">
                    <h1 className="text-2xl font-bold text-center mb-6 text-red-600">Upcoming Shifts</h1>
                    {eventDetailData && eventDetailData.events_eventshift && eventDetailData.events_eventshift.filter(shift => shift.start_time > new Date()).map((shift, key) => (
                            <div key={key} className="mb-4 border rounded-lg shadow-md p-4 bg-white">
                                <h3 className="text-red-600 font-semibold text-lg">{shift.description}</h3>
                                <div className="mt-1 text-gray-700">{shift.start_time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                <div className="mt-1 text-gray-600">{ shift.start_time.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) + " - " + shift.end_time.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}</div>
                                <div className="mt-1 text-gray-600">{shift.location}</div>
                                <div className="mt-1 text-gray-600"><span className="font-bold">{shift.spots - shift.events_eventshiftmember.length}</span><span> spots left</span></div>
                                { registeredShiftData && waitlistedShiftData && session.data?.user.admin_level !== undefined &&
                                    <div>
                                        { registeredShiftData?.filter(registeredShift => registeredShift.shift_id === shift.id).length === 0 && waitlistedShiftData?.filter(waitlistedShift => waitlistedShift.eventshift_id === shift.id).length === 0 && 
                                            <Button
                                                type="button"
                                                onClick={() => handleRegisterClick({description: shift.description, id: shift.id})}
                                                className='flex w-full mt-4 rounded-full bg-red-500 hover:bg-red-600 transition duration-300 text-white'
                                                >
                                                Register
                                            </Button>                          
                                        }
                                        { registeredShiftData?.filter(registeredShift => registeredShift.shift_id === shift.id).length > 0 &&
                                            <div className='mt-3 text-white bg-green-500'>You are registered.</div>                       
                                        }
                                        { waitlistedShiftData?.filter(waitlistedShift => waitlistedShift.eventshift_id === shift.id).length > 0 && registeredShiftData?.filter(registeredShift => registeredShift.shift_id === shift.id).length === 0 &&
                                            <div className='mt-3 text-gray-600 bg-yellow-300'>You are on the waitlist.</div>                       
                                        }
                                    </div>
                                }
                                {
                                    session.data?.user.admin_level === undefined && 
                                    <div>
                                        <div className='mt-3 text-gray-600'><Link href={"/account/register"} onClick={() => {
                                            if(!session.data || !session.data.user.email)
                                                signIn("google", {
                                                    callbackUrl: DEFAULT_LOGIN_REDIRECT
                                                })
                                        }} className='text-red-500'>Become a member</Link> to register.</div>                       
                                    </div>
                                }
                                
                            </div>
                    ))}
                </div>
            </div>
            {showRegistration && selectedShift && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] md:w-[60%]"> {/* Adjusted width here */}
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
                                    className="w-full mt-4 bg-red-500 hover:bg-red-600 transition duration-300 text-white rounded-full"
                                    disabled={isPending}
                                >
                                    Register
                                </Button>
                                <Button 
                                    type="button" 
                                    onClick={() => setShowRegistration(false)} 
                                    className="w-full mt-2 bg-white text-red-500 border border-red-500 hover:bg-red-600 hover:text-white transition duration-300 rounded-full"
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