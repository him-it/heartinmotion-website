"use client"

import { getEventBySlug, registerShiftSignup, deleteShiftSignup, createShift, deleteEventData } from "@/actions/admin/event";
import { ShiftSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input'
import { FormError } from '@/components/ui/formError';
import { Button } from "@/components/ui/button";
import { currentEventDataReport, dateRangeReport, pastEventDataReport } from "../reports/generateReports";

const AdminEventDetails = ({ eventData }: { eventData: Prisma.PromiseReturnType<typeof getEventBySlug> | undefined }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [showNewShiftPopup, setShowNewShiftPopup] = useState(false);
    const [showPendingPopup, setShowPendingPopup] = useState(false);
    const [selectedShift, setSelectedShift] = useState<any | null>(null);
    const [error, setError] = useState<string | undefined>(undefined)
    const [success, setSuccess] = useState<string | undefined>(undefined)
    const [isPending, startTransition] = useTransition() 
    const [ fromTime, setFromTime ] = useState<Date>()
    const [ toTime, setToTime ] = useState<Date>()

    const handleViewClick = (shiftSignup: any) => {
        setSelectedShift(shiftSignup);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        setSelectedShift(null);
    }
    
    const closeNewShiftPopup = () => {
        setShowNewShiftPopup(false)
    }

    const handleCreateShift : SubmitHandler<z.infer<typeof ShiftSchema>> = (data) => {
        startTransition(() => {
            createShift({event_id: eventData?.id, ...data})
                .then(() => {
                    closeNewShiftPopup()
                    window.location.reload()
                })
                .catch(() => {
                    setError("An unexpected error occurred.")
                })
        })
    }

    const registerShiftSignUp = (data: any) => {
        startTransition(() => {
            registerShiftSignup(data)
                .then(() => {
                    closePopup()
                    window.location.reload()
                })
                .catch(() => {
                    setSuccess(undefined)
                    setError("An unexpected error occurred.")
                })
        })
    }

    const deleteShiftSignUp = (data: any) => {
        startTransition(() => {
            deleteShiftSignup(data)
                .then(() => {
                    closePopup()
                    window.location.reload()
                })
                .catch(() => {
                    setSuccess(undefined)
                    setError("An unexpected error occurred.")
                })
        })
    }

    const deleteEvent = () => {
        if(prompt('Are you sure about deleting this event? \nAll data, shifts, and hours will be ERASED. \nPlease type "I am confident about deleting this event. Apples."') === "I am confident about deleting this event. Apples.")
            if(eventData?.id) {
                deleteEventData(eventData.id)
                .then(() => {
                    window.location.replace("/admin/events")
                })
                .catch(() => {
                    setError("An unexpected error occurred.")
                })
            }
    }

    const form = useForm<z.infer<typeof ShiftSchema>>({
        resolver: zodResolver(ShiftSchema),
        defaultValues: {
            description: '',
            location: '',
            spots: 0,
            start_time: new Date(new Date(new Date().setHours(0,0,0,0)).getTime() + new Date().getTimezoneOffset() * -60 * 1000).toISOString().slice(0, 19),
            end_time:  new Date(new Date(new Date().setHours(0,0,0,0)).getTime() + new Date().getTimezoneOffset() * -60 * 1000).toISOString().slice(0, 19)
        }
    })

    return (
        <div className="flex flex-col items-center">
            {eventData && 
            <>
                <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 mb-3">
                    <Link href={"../event/" + eventData?.slug + "/edit"} className="inline-block px-4 py-2 bg-primary text-center text-white rounded-full hover:bg-primary/90">
                        Edit event details
                    </Link>
                    <button 
                        onClick={() => setShowNewShiftPopup(true)} 
                        className="inline-block px-4 py-2 bg-primary text-center text-white rounded-full hover:bg-primary/90">
                        New Shift
                    </button>
                    <button onClick={() => deleteEvent()}  className="inline-block px-4 py-2 bg-primary text-center text-white rounded-full hover:bg-primary/90">
                        Delete Event
                    </button>
                </div>
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mb-2">
                    <button onClick={() => { currentEventDataReport(eventData.id) }} className="inline-block px-4 py-2 bg-primary text-center text-white rounded-md hover:bg-primary/90">
                        Download current event data
                    </button>
                    <button onClick={() => { pastEventDataReport(eventData.id) }} className="inline-block px-4 py-2 bg-primary text-center text-white rounded-md hover:bg-primary/90">
                        Download past event data
                    </button>
                </div>
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mb-2">
                <label className="inline-block py-2">From</label>
                    <input
                        type="date"
                        className="border border-border rounded p-2"
                        onChange={(e) => {
                            if(e.target.valueAsDate)
                                setFromTime(e.target.valueAsDate)
                        }}
                    />
                    <label className="inline-block py-2">To</label>
                    <input
                        type="date"
                        className="border border-border rounded p-2"
                        onChange={(e) => {
                            if(e.target.valueAsDate)
                                setToTime(e.target.valueAsDate)
                        }}
                    />
                    <button className="inline-block px-4 py-2 bg-primary text-center text-white rounded-md hover:bg-primary/90"
                        onClick={() => {
                            if(fromTime && toTime)
                                dateRangeReport(fromTime, toTime, eventData.id, eventData.name)
                        }}
                    >
                        Download date range
                    </button>
                </div>

                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mb-2">
                    <button
                        onClick={() => setShowPendingPopup(true)}
                        className="inline-block px-4 py-2 bg-primary text-center text-white rounded-md hover:bg-primary/90">
                        Pending Registrations ({eventData.events_eventsignup?.length ?? 0})
                    </button>
                </div>

                <div className="w-full max-w-7xl">
                    <div className="w-full space-y-8 p-4">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground mb-4">Future Shifts</h2>
                            <div className="overflow-x-auto">
                            <table className="min-w-full bg-card border border-border">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="border border-border p-2 text-muted-foreground max-w-44 overflow-auto whitespace-nowrap">Shift</th>
                                        <th className="border border-border p-2 text-muted-foreground">Date</th>
                                        <th className="border border-border p-2 text-muted-foreground">Time</th>
                                        <th className="border border-border p-2 text-muted-foreground">Location</th>
                                        <th className="border border-border p-2 text-muted-foreground">Available</th>
                                        <th className="border border-border p-2 text-muted-foreground">Filled</th>
                                        <th className="border border-border p-2 text-muted-foreground">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {eventData.events_eventshift?.filter(shift => shift.start_time > new Date()).reverse().map((shift, key) => (
                                        <tr key={key} className="border-b hover:bg-muted">
                                            <td className="border border-border p-2 max-w-44 overflow-auto whitespace-nowrap">
                                                <Link 
                                                    href={"/admin/events/event/" + eventData.slug + "/shift/" + shift.id} 
                                                    className="text-primary hover:underline hover:text-primary/90">
                                                    {shift.description}
                                                </Link>
                                            </td>
                                            <td className="border border-border p-2">{shift.start_time.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                            <td className="border border-border p-2">{shift.start_time.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) + " - " + shift.end_time.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}</td>
                                            <td className="border border-border p-2">{shift.location}</td>
                                            <td className="border border-border p-2">{shift.spots - shift.events_eventshiftmember.length}</td>
                                            <td className="border border-border p-2">{shift.events_eventshiftmember.length}</td>
                                            <td className="border border-border p-2">{shift.spots}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-foreground mb-4">Past Shifts</h2>
                            <div className="overflow-x-auto">
                            <table className="min-w-full bg-card border border-border">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="border border-border p-2 text-muted-foreground max-w-44 overflow-auto whitespace-nowrap">Shift</th>
                                        <th className="border border-border p-2 text-muted-foreground">Date</th>
                                        <th className="border border-border p-2 text-muted-foreground">Time</th>
                                        <th className="border border-border p-2 text-muted-foreground">Location</th>
                                        <th className="border border-border p-2 text-muted-foreground">Available</th>
                                        <th className="border border-border p-2 text-muted-foreground">Filled</th>
                                        <th className="border border-border p-2 text-muted-foreground">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {eventData.events_eventshift?.filter(shift => shift.start_time <= new Date()).reverse().map((shift, key) => (
                                        <tr key={key} className="border-b hover:bg-muted">
                                            <td className="borderborder-border p-2 max-w-44 overflow-auto whitespace-nowrap">
                                                <Link 
                                                    href={"/admin/events/event/" + eventData.slug + "/shift/" + shift.id}
                                                    className="text-primary hover:underline hover:text-primary/90">
                                                    {shift.description}
                                                </Link>
                                            </td>
                                            <td className="border border-border p-2">{shift.start_time.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                            <td className="border border-border p-2">{shift.start_time.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) + " - " + shift.end_time.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}</td>
                                            <td className="border border-border p-2">{shift.location}</td>
                                            <td className="border border-border p-2">{shift.spots - shift.events_eventshiftmember.length}</td>
                                            <td className="border border-border p-2">{shift.events_eventshiftmember.length}</td>
                                            <td className="border border-border p-2">{shift.spots}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            </div>
                        </div>
                    </div>
                </div>
                {showPendingPopup && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-card p-6 rounded-lg shadow-xs w-[90%] md:w-[60%]">
                            <h2 className="text-xl font-bold mb-4">Pending Registrations</h2>
                            {eventData.events_eventsignup?.length ? (
                                <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
                                    <table className="min-w-full bg-card border border-border">
                                        <thead className="bg-muted">
                                            <tr>
                                                <th className="border border-border p-2 text-muted-foreground">Member</th>
                                                <th className="border border-border p-2 text-muted-foreground">Shift</th>
                                                <th className="border border-border p-2 text-muted-foreground">Transportation</th>
                                                <th className="border border-border p-2 text-muted-foreground">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {eventData.events_eventsignup?.map((shiftSignup, key) => (
                                                <tr key={key} className="border-b hover:bg-muted">
                                                    <td className="border border-border p-2">
                                                        {shiftSignup.member_member.first_name + " " + shiftSignup.member_member.last_name}
                                                    </td>
                                                    <td className="border border-border p-2">
                                                        {shiftSignup.events_eventsignup_shifts[0]?.events_eventshift.description}
                                                    </td>
                                                    <td className="border border-border p-2">{shiftSignup.transportation}</td>
                                                    <td className="border border-border p-2 text-center">
                                                        <button
                                                            onClick={() => handleViewClick({...shiftSignup})}
                                                            className="inline-block text-primary rounded-full hover:text-primary/90 hover:underline">
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No pending registrations.</p>
                            )}
                            <button
                                onClick={() => setShowPendingPopup(false)}
                                className="mt-4 bg-muted text-black rounded px-4 py-2">
                                Close
                            </button>
                        </div>
                    </div>
                )}
                {showPopup && selectedShift && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-card p-6 rounded-lg shadow-xs w-[90%] md:w-[60%]">
                            <h2 className="text-xl font-bold mb-4">Registration Details</h2>
                            <p className="text-lg mb-4">
                                <strong>Member:</strong> {selectedShift.member_member.first_name} {selectedShift.member_member.last_name}
                            </p>
                            <p className="mb-4">
                                <strong>Shift:</strong> {selectedShift.events_eventsignup_shifts[0].events_eventshift.description + " ("} 
                                <strong>{(selectedShift.events_eventsignup_shifts[0]?.events_eventshift.spots - eventData.events_eventshiftmember.filter(shift => shift.shift_id === selectedShift.events_eventsignup_shifts[0]?.events_eventshift.id).length)}</strong>
                                <span> spots left&#41;</span>
                            </p>
                            <p className="mb-4">
                                <strong>Transportation:</strong> {selectedShift.transportation}
                            </p>
                            <p className="mb-4">
                                <strong>Date:</strong> {selectedShift.events_eventsignup_shifts[0]?.events_eventshift.start_time.toLocaleDateString('en-US')}
                            </p>
                            <p className="mb-4">
                                <strong>Friends:</strong> {selectedShift.friends}
                            </p>
                            <div className="flex space-x-4 mt-4">
                                <button 
                                    onClick={() => { registerShiftSignUp(selectedShift) }} 
                                    className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-700">
                                    Register
                                </button>
                                <button 
                                    onClick={() => { deleteShiftSignUp(selectedShift) }} 
                                    className="bg-primary text-white rounded px-4 py-2 hover:bg-primary/90">
                                    Remove
                                </button>
                            </div>
                            <button 
                                onClick={closePopup} 
                                className="mt-4 bg-muted text-black rounded px-4 py-2">
                                Close
                            </button>
                        </div>
                    </div>
                )}
                {showNewShiftPopup && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-card p-6 rounded-lg shadow-xs w-[90%] md:w-[60%]">
                            <h2 className="text-xl font-bold mb-4">New Shift</h2>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleCreateShift)}>
                                    <FormField 
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Shift Description:</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        {...field}
                                                        type="text"
                                                        placeholder=""
                                                        disabled={isPending}
                                                        className="border rounded p-2 mb-4 w-full"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField 
                                        control={form.control}
                                        name="location"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Shift Location:</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        {...field}
                                                        type="text"
                                                        placeholder=""
                                                        disabled={isPending}
                                                        className="border rounded p-2 mb-4 w-full"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField 
                                        control={form.control}
                                        name="spots"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Number of Spots:</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        {...field}
                                                        type="number"
                                                        placeholder=""
                                                        disabled={isPending}
                                                        className="border rounded p-2 mb-4 w-full"
                                                        onChange={(value) =>
                                                            field.onChange(value.target.valueAsNumber)
                                                         }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField 
                                        control={form.control}
                                        name="start_time"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Start Time:</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="datetime-local"
                                                        {...field}
                                                        disabled={isPending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField 
                                        control={form.control}
                                        name="end_time"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>End Time:</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="datetime-local"
                                                        {...field}
                                                        disabled={isPending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {error && <FormError message={error} />} 
                                    <div className="flex justify-between space-x-2">
                                        <Button 
                                            type="submit" 
                                            className="w-full mt-4 bg-primary hover:bg-primary/90 transition duration-300 text-white rounded-full"
                                            disabled={isPending}
                                        >
                                            Create Shift
                                        </Button>
                                        <Button 
                                            type="button" 
                                            onClick={closeNewShiftPopup} 
                                            className="w-full mt-4 bg-card text-primary border border-primary hover:bg-primary/90 hover:text-white transition duration-300 rounded-full"
                                            disabled={isPending}
                                        >
                                            Cancel
                                        </Button>  
                                    </div>
                                </form>
                            </Form>
                        </div>
                    </div>
                )}
            </>}
        </div>
    );
}

export default AdminEventDetails;
