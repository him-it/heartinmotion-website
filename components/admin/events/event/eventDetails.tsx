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
import { Modal, TableShell, Toolbar, ToolbarSpacer, tdClass, thClass } from "@/components/admin/workbench";
import { currentEventDataReport, dateRangeReport, pastEventDataReport } from "../reports/generateReports";

const dateInputClass = "h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"

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

    const pendingCount = eventData?.events_eventsignup?.length ?? 0

    return (
        <div className="w-full max-w-5xl mx-auto">
            {eventData &&
            <>
                <Toolbar>
                    <Button size="sm" onClick={() => setShowNewShiftPopup(true)}>
                        New Shift
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                        <Link href={"../event/" + eventData?.slug + "/edit"}>
                            Edit event details
                        </Link>
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowPendingPopup(true)}>
                        Pending Registrations
                        <span className={
                            "ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold " +
                            (pendingCount > 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")
                        }>
                            {pendingCount}
                        </span>
                    </Button>
                    <ToolbarSpacer />
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteEvent()}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                        Delete Event
                    </Button>
                </Toolbar>

                <div className="rounded-xl border border-border bg-card p-5 mb-8">
                    <h2 className="text-sm font-semibold text-foreground mb-3">Reports</h2>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => { currentEventDataReport(eventData.id) }}>
                            Current event data
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { pastEventDataReport(eventData.id) }}>
                            Past event data
                        </Button>
                        <div className="flex flex-wrap items-center gap-2 sm:ml-4 sm:border-l sm:border-border sm:pl-4">
                            <label className="text-sm text-muted-foreground">From</label>
                            <input
                                type="date"
                                className={dateInputClass}
                                onChange={(e) => {
                                    if(e.target.valueAsDate)
                                        setFromTime(e.target.valueAsDate)
                                }}
                            />
                            <label className="text-sm text-muted-foreground">To</label>
                            <input
                                type="date"
                                className={dateInputClass}
                                onChange={(e) => {
                                    if(e.target.valueAsDate)
                                        setToTime(e.target.valueAsDate)
                                }}
                            />
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={!fromTime || !toTime}
                                onClick={() => {
                                    if(fromTime && toTime)
                                        dateRangeReport(fromTime, toTime, eventData.id, eventData.name)
                                }}
                            >
                                Date range
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground mb-3">Future Shifts</h2>
                        <TableShell>
                            <table className="min-w-full table-auto border-collapse">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className={thClass}>Shift</th>
                                        <th className={thClass}>Date</th>
                                        <th className={thClass}>Time</th>
                                        <th className={thClass}>Location</th>
                                        <th className={thClass + " text-right"}>Available</th>
                                        <th className={thClass + " text-right"}>Filled</th>
                                        <th className={thClass + " text-right"}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {eventData.events_eventshift?.filter(shift => shift.start_time > new Date()).reverse().map((shift, key) => (
                                        <tr key={key} className="border-b border-border last:border-0 hover:bg-muted/60 transition-colors">
                                            <td className={tdClass + " font-medium"}>
                                                <Link
                                                    href={"/admin/events/event/" + eventData.slug + "/shift/" + shift.id}
                                                    className="text-primary hover:underline hover:text-primary/90">
                                                    {shift.description}
                                                </Link>
                                            </td>
                                            <td className={tdClass + " whitespace-nowrap"}>{shift.start_time.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                            <td className={tdClass + " whitespace-nowrap"}>{shift.start_time.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) + " - " + shift.end_time.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}</td>
                                            <td className={tdClass}>{shift.location}</td>
                                            <td className={tdClass + " text-right tabular-nums"}>{shift.spots - shift.events_eventshiftmember.length}</td>
                                            <td className={tdClass + " text-right tabular-nums"}>{shift.events_eventshiftmember.length}</td>
                                            <td className={tdClass + " text-right tabular-nums"}>{shift.spots}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </TableShell>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-foreground mb-3">Past Shifts</h2>
                        <TableShell>
                            <table className="min-w-full table-auto border-collapse">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className={thClass}>Shift</th>
                                        <th className={thClass}>Date</th>
                                        <th className={thClass}>Time</th>
                                        <th className={thClass}>Location</th>
                                        <th className={thClass + " text-right"}>Available</th>
                                        <th className={thClass + " text-right"}>Filled</th>
                                        <th className={thClass + " text-right"}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {eventData.events_eventshift?.filter(shift => shift.start_time <= new Date()).reverse().map((shift, key) => (
                                        <tr key={key} className="border-b border-border last:border-0 hover:bg-muted/60 transition-colors">
                                            <td className={tdClass + " font-medium"}>
                                                <Link
                                                    href={"/admin/events/event/" + eventData.slug + "/shift/" + shift.id}
                                                    className="text-primary hover:underline hover:text-primary/90">
                                                    {shift.description}
                                                </Link>
                                            </td>
                                            <td className={tdClass + " whitespace-nowrap"}>{shift.start_time.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                            <td className={tdClass + " whitespace-nowrap"}>{shift.start_time.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) + " - " + shift.end_time.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}</td>
                                            <td className={tdClass}>{shift.location}</td>
                                            <td className={tdClass + " text-right tabular-nums"}>{shift.spots - shift.events_eventshiftmember.length}</td>
                                            <td className={tdClass + " text-right tabular-nums"}>{shift.events_eventshiftmember.length}</td>
                                            <td className={tdClass + " text-right tabular-nums"}>{shift.spots}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </TableShell>
                    </div>
                </div>

                {showPendingPopup && (
                    <Modal title="Pending Registrations" onClose={() => setShowPendingPopup(false)} className="max-w-3xl">
                        {eventData.events_eventsignup?.length ? (
                            <TableShell>
                                <table className="min-w-full table-auto border-collapse">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className={thClass}>Member</th>
                                            <th className={thClass}>Shift</th>
                                            <th className={thClass}>Transportation</th>
                                            <th className={thClass + " text-right"}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {eventData.events_eventsignup?.map((shiftSignup, key) => (
                                            <tr key={key} className="border-b border-border last:border-0 hover:bg-muted/60 transition-colors">
                                                <td className={tdClass + " font-medium"}>
                                                    {shiftSignup.member_member.first_name + " " + shiftSignup.member_member.last_name}
                                                </td>
                                                <td className={tdClass}>
                                                    {shiftSignup.events_eventsignup_shifts[0]?.events_eventshift.description}
                                                </td>
                                                <td className={tdClass + " text-muted-foreground"}>{shiftSignup.transportation}</td>
                                                <td className={tdClass + " text-right"}>
                                                    <button
                                                        onClick={() => handleViewClick({...shiftSignup})}
                                                        className="text-primary hover:text-primary/90 text-sm font-semibold hover:underline">
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </TableShell>
                        ) : (
                            <p className="text-sm text-muted-foreground py-6 text-center">No pending registrations.</p>
                        )}
                    </Modal>
                )}
                {showPopup && selectedShift && (
                    <Modal title="Registration Details" onClose={closePopup}>
                        <dl className="space-y-3 text-sm">
                            <div className="flex gap-2">
                                <dt className="font-semibold text-foreground">Member:</dt>
                                <dd className="text-foreground">{selectedShift.member_member.first_name} {selectedShift.member_member.last_name}</dd>
                            </div>
                            <div className="flex gap-2">
                                <dt className="font-semibold text-foreground">Shift:</dt>
                                <dd className="text-foreground">
                                    {selectedShift.events_eventsignup_shifts[0].events_eventshift.description + " ("}
                                    <strong>{(selectedShift.events_eventsignup_shifts[0]?.events_eventshift.spots - eventData.events_eventshiftmember.filter(shift => shift.shift_id === selectedShift.events_eventsignup_shifts[0]?.events_eventshift.id).length)}</strong>
                                    <span> spots left&#41;</span>
                                </dd>
                            </div>
                            <div className="flex gap-2">
                                <dt className="font-semibold text-foreground">Transportation:</dt>
                                <dd className="text-foreground">{selectedShift.transportation}</dd>
                            </div>
                            <div className="flex gap-2">
                                <dt className="font-semibold text-foreground">Date:</dt>
                                <dd className="text-foreground">{selectedShift.events_eventsignup_shifts[0]?.events_eventshift.start_time.toLocaleDateString('en-US')}</dd>
                            </div>
                            <div className="flex gap-2">
                                <dt className="font-semibold text-foreground">Friends:</dt>
                                <dd className="text-foreground">{selectedShift.friends}</dd>
                            </div>
                        </dl>
                        <div className="flex items-center gap-2 mt-6">
                            <Button
                                size="sm"
                                disabled={isPending}
                                onClick={() => { registerShiftSignUp(selectedShift) }}
                            >
                                Register
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={isPending}
                                onClick={() => { deleteShiftSignUp(selectedShift) }}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                                Remove
                            </Button>
                            <ToolbarSpacer />
                            <Button size="sm" variant="ghost" onClick={closePopup}>
                                Close
                            </Button>
                        </div>
                    </Modal>
                )}
                {showNewShiftPopup && (
                    <Modal title="New Shift" onClose={closeNewShiftPopup}>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleCreateShift)} className="space-y-4">
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
                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={closeNewShiftPopup}
                                        disabled={isPending}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={isPending}
                                    >
                                        Create Shift
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </Modal>
                )}
            </>}
        </div>
    );
}

export default AdminEventDetails;
