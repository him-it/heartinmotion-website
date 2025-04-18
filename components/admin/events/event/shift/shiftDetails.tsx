"use client"

import { completeAllMembers, confirmAllMembers, deleteShiftData, getShiftById, shiftAddMember, shiftDeleteMember, updateShift, updateShiftCompleted, updateShiftConfirmed, updateShiftHours, updateShiftHoursAll } from "@/actions/admin/event";
import { events_eventshift, Prisma } from "@prisma/client";
import { useEffect, useState, useTransition } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import * as z from 'zod'
import { SubmitHandler, useForm } from "react-hook-form";
import { AddMemberSchema, ShiftSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/ui/formError";
import { getMemberNames } from "@/actions/admin/member";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const AdminShiftDetails = ({ shiftData, memberData }: { shiftData: Prisma.PromiseReturnType<typeof getShiftById> | undefined, memberData: Prisma.PromiseReturnType<typeof getMemberNames> }) => {
    const [showEditShiftPopup, setShowEditShiftPopup] = useState(false);
    const [isPending, startTransition] = useTransition() 
    const [error, setError] = useState<string | undefined>(undefined)
    const [addMemberError, setAddMemberError] = useState<string | undefined>(undefined)
    const [success, setSuccess] = useState<string | undefined>(undefined)
    const [ updatedData, setUpdatedData ] = useState<Prisma.PromiseReturnType<typeof getShiftById>>(shiftData ? shiftData : {} as Prisma.PromiseReturnType<typeof getShiftById>)

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

    const addMemberForm = useForm<z.infer<typeof AddMemberSchema>>({
        resolver: zodResolver(AddMemberSchema),
        defaultValues: {
            id: '',
            transportation: ''
        }
    })

    const addMember : SubmitHandler<z.infer<typeof AddMemberSchema>> = (data) => {
        startTransition(() => {
            shiftAddMember(data, shiftData as events_eventshift)
                .then(() => {
                    window.location.reload()
                })
                .catch(() => {
                    setError("An unexpected error occured.")
                })
        })
    }

    const deleteShift = () => {
        if(prompt('Are you sure about deleting this shift? \nAll data and hours will be ERASED. \nPlease type "I am sure about deleting this shift."') === "I am sure about deleting this shift.")
            if(shiftData?.id && shiftData?.events_event) {
                deleteShiftData(shiftData.id)
                .then(() => {
                    window.location.replace("/admin/events/event/" + shiftData?.events_event.slug)
                })
                .catch(() => {
                    setError("An unexpected error occured.")
                })
            }
    }

    const editShift : SubmitHandler<z.infer<typeof ShiftSchema>> = (data) => {
        startTransition(() => {
            updateShift(data, shiftData?.id ? shiftData.id : NaN)
            .then(() => {
                window.location.reload()
            })
            .catch(() => {
                setError("An unexpected error occured.")
            })
        })
    }

    const deleteMember = (id: number, name: string) => {
        if(confirm("Are you sure you want to remove " + name + " from this shift?"))
            shiftDeleteMember(id)
            .then(() => {
                if(updatedData)
                    setUpdatedData({...updatedData, events_eventshiftmember: updatedData.events_eventshiftmember.filter(shift => shift.id !== id)})
                else
                    window.location.reload()
            })
            .catch(() => {
                setError("An unexpected error occured.")
            })
    }

    const changeConfirmed = (id: number, value: boolean) => {
        startTransition(() => {
            updateShiftConfirmed(id, value)
            .then(() => {
                if(updatedData) {
                    const updatedMemberData = updatedData.events_eventshiftmember.map(shift => {
                        if(typeof value === "boolean" && shift?.id === id)
                            return {...shift, confirmed: value}
                        return shift
                    })
                    setUpdatedData({ ...updatedData, events_eventshiftmember: updatedMemberData });
                }
                else
                    window.location.reload()
            })
            .catch(() => {
                setError("An unexpected error occured.")
            })
        })
    }

    const changeCompleted = (id: number, value: boolean) => {
        startTransition(() => {
            updateShiftCompleted(id, value)
            .then(() => {
                if(updatedData) {
                    const updatedMemberData = updatedData.events_eventshiftmember.map(shift => {
                        if(typeof value === "boolean" && shift.id === id)
                            return {...shift, completed: value}
                        return shift
                    })
                    setUpdatedData({ ...updatedData, events_eventshiftmember: updatedMemberData });
                }
                else
                    window.location.reload()
            })
            .catch(() => {
                setError("An unexpected error occured.")
            })
        })
    }

    const changeHours = (id: number, value: number) => {
        startTransition(() => {
            updateShiftHours(id, value)
            .then(() => {
                if(updatedData) {
                    const updatedMemberData = updatedData.events_eventshiftmember.map(shift => {
                        if(value && shift?.id === id)
                            return {...shift, hours: value}
                        return shift
                    })
                    setUpdatedData({ ...updatedData, events_eventshiftmember: updatedMemberData });
                }
                else
                    window.location.reload()
            })
            .catch(() => {
                setError("An unexpected error occured.")
            })
        })
    }

    const changeHoursAll = (id: number, value: number) => {
        startTransition(() => {
            updateShiftHoursAll(id, value)
            .then(() => {
                window.location.reload()
            })
            .catch(() => {
                setError("An unexpected error occured.")
            })
        })
    }

    const confirmAll = () => {
        if(confirm("Are you sure you want to confirm all members?"))
            startTransition(() => {
                if(shiftData?.id)
                    confirmAllMembers(shiftData.id)
                    .then(() => {
                        window.location.reload()
                    })
                    .catch(() => {
                        setError("An unexpected error occured.")
                    })
            })
    }

    const completeAll = () => {
        if(confirm("Are you sure you want to complete all members?"))
            startTransition(() => {
                if(shiftData?.id)
                    completeAllMembers(shiftData.id)
                    .then(() => {
                        window.location.reload()
                    })
                    .catch(() => {
                        setError("An unexpected error occured.")
                    })
            })
    }

    useEffect(() => {
        if(shiftData)
            setUpdatedData(shiftData)

        if (shiftData && shiftData.start_time && shiftData.end_time) {
            form.reset({
                description: shiftData.description,
                location: shiftData.location,
                spots: shiftData.spots,
                start_time: new Date(shiftData.start_time.getTime() + new Date().getTimezoneOffset() * -60 * 1000 + 3600000).toISOString().slice(0, 19),
                end_time: new Date(shiftData.end_time.getTime() + new Date().getTimezoneOffset() * -60 * 1000  + 3600000).toISOString().slice(0, 19)
            });
        }
    }, [shiftData, form])

    return (
        <div className="flex flex-col items-center">
            <div className="flex justify-center space-x-4 mb-8">
                <button 
                    onClick={() => {confirmAll()}} 
                    className="inline-block px-4 py-2 bg-red-500 text-center text-white rounded-md hover:bg-red-700">
                    Mark All Confirmed
                </button>
                <button 
                    onClick={() => {completeAll()}} 
                    className="inline-block px-4 py-2 bg-red-500 text-center text-white rounded-md hover:bg-red-700">
                    Mark All Completed
                </button>
                <button 
                    onClick={() => setShowEditShiftPopup(true)} 
                    className="inline-block px-4 py-2 bg-red-500 text-center text-white rounded-md hover:bg-red-700">
                    Edit Shift
                </button>
                <button 
                    onClick={() => {deleteShift()}} 
                    className="inline-block px-4 py-2 bg-red-500 text-center text-white rounded-md hover:bg-red-700">
                    Delete Shift
                </button>
                <button 
                    onClick={() => {deleteShift()}} 
                    className="inline-block px-4 py-2 bg-red-500 text-center text-white rounded-md hover:bg-red-700">
                    Delete Shift
                </button>
                <div>
                    <input
                        className="inline-block px-4 py-2 mt-2 border border-gray-300 rounded-md"
                        placeholder="Update All Hours"
                        onKeyDown={(e) => {
                            if (shiftData?.id && e.key === 'Enter') {
                                const target = e.target as HTMLInputElement
                                changeHoursAll(shiftData.id, Number(target.value)) 
                            }
                        }}
                    >
                    </input>
                </div>
            </div>
            {updatedData && (
                <div className="w-[80%]">
                    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mb-3 w-full">
                        <div className="flex-2 p-4">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4">Shift Details</h2>
                            <h3>{updatedData.description}</h3>
                            <p>{updatedData.start_time && updatedData.start_time.toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            <p>{updatedData.start_time && updatedData.start_time.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })} - {updatedData.end_time && updatedData.end_time.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}</p>
                            <p>{updatedData.location}</p>
                            <div className="mt-5 font-bold">
                                {updatedData.events_eventshiftmember?.length >= updatedData.spots ? (
                                    <div className="text-red-600">
                                        <p>SHIFT FULL!</p>
                                        <p>{updatedData.spots - updatedData.events_eventshiftmember?.length + " available + " + updatedData.events_eventshiftmember?.length + " filled = " + updatedData.spots}</p>
                                    </div>
                                ) : (
                                    <p>{updatedData.spots - updatedData.events_eventshiftmember?.length + " available + " + updatedData.events_eventshiftmember?.length + " filled = " + updatedData.spots + " total"}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 p-4">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4">Add a Member</h2>
                            <Form {...addMemberForm}>
                                <form onSubmit={addMemberForm.handleSubmit(addMember)}>
                                    <FormField 
                                        control={addMemberForm.control}
                                        name="id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Member Name:</FormLabel>
                                                <FormControl>
                                                    <select
                                                        {...field}
                                                        disabled={isPending}
                                                        className="border rounded p-2 mb-4 w-full"
                                                    >
                                                        <option></option>
                                                        {memberData && memberData.length > 0 && memberData.map(member => (
                                                            <option key={member.id} value={member.id}>
                                                                {member.first_name + " " + member.last_name}    
                                                            </option>
                                                        ))}
                                                    </select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField 
                                        control={addMemberForm.control}
                                        name="transportation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Transportation:</FormLabel>
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
                                    {addMemberError && <FormError message={addMemberError} />} 
                                    <div className="flex">
                                        <Button 
                                            type="submit" 
                                            className="mt-4 bg-red-500 hover:bg-red-600 transition duration-300 text-white rounded-full w-full"
                                            disabled={isPending}
                                        >
                                            Add
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    </div>
                    <div className="w-full p-4">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Members</h2>
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border border-gray-300 p-2 text-gray-600">Name</th>
                                    <th className="border border-gray-300 p-2 text-gray-600">Phone</th>
                                    <th className="border border-gray-300 p-2 text-gray-600">School</th>
                                    <th className="border border-gray-300 p-2 text-gray-600">Graduating Year</th>
                                    <th className="border border-gray-300 p-2 text-gray-600">Confirmed</th>
                                    <th className="border border-gray-300 p-2 text-gray-600">Completed</th>
                                    <th className="border border-gray-300 p-2 text-gray-600">Hours</th>
                                    <th className="border border-gray-300 p-2 text-gray-600">Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                { updatedData.events_eventshiftmember?.length > 0 && updatedData.events_eventshiftmember.map(member => (
                                    <tr key={member.id} className="border-b hover:bg-gray-50">
                                        <td className="border border-gray-300 p-2">
                                            <Link href={"/admin/members/member/" + member.member_id} className="text-red-800 hover:underline hover:text-red-950">
                                                {member.member_member.first_name + " " + member.member_member.last_name}
                                            </Link>
                                        </td>
                                        <td className="border border-gray-300 p-2">{member.member_member.cell_phone}</td>
                                        <td className="border border-gray-300 p-2">{member.member_member.school}</td>
                                        <td className="border border-gray-300 p-2">{member.member_member.graduating_year}</td>
                                        <td className="border border-gray-300 p-2 text-center">
                                            <Button 
                                                disabled={isPending} 
                                                className={(member.confirmed ? "bg-green-500 hover:bg-green-600" : "bg-red-600 hover:bg-red-700") + " w-full text-white"}
                                                onClick={ () => { changeConfirmed(member.id, !member.confirmed) } }
                                            >
                                                {member.confirmed ? "Yes" : "No" }
                                            </Button>
                                        </td>
                                        <td className="border border-gray-300 p-2 text-center">
                                            <Button 
                                                disabled={isPending} 
                                                className={(member.completed ? "bg-green-500 hover:bg-green-600" : "bg-red-600 hover:bg-red-700") + " w-full text-white"}
                                                onClick={ () => { changeCompleted(member.id, !member.completed) } }
                                            >
                                                {member.completed ? "Yes" : "No" }
                                            </Button>
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <input 
                                                type="number" 
                                                defaultValue={member.hours}
                                                disabled={isPending}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const target = e.target as HTMLInputElement
                                                        changeHours(member.id, Number(target.value)) 
                                                    }
                                                }}
                                            >      
                                            </input>
                                        </td>
                                        <td className="border border-gray-300 p-2 text-center">
                                            <Button
                                                disabled={isPending}
                                                className="bg-black text-white"
                                                onClick={() => {
                                                    deleteMember(member.id, member.member_member.first_name + " " + member.member_member.last_name)
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {showEditShiftPopup && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] md:w-[60%]">
                                <h2 className="text-xl font-bold mb-4">Edit Shift</h2>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(editShift)}>
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
                                                className="w-full mt-4 bg-red-500 hover:bg-red-600 transition duration-300 text-white rounded-full"
                                                disabled={isPending}
                                            >
                                                Save Changes
                                            </Button>
                                            <Button 
                                                type="button" 
                                                onClick={() => setShowEditShiftPopup(false)} 
                                                className="w-full mt-4 bg-white text-red-500 border border-red-500 hover:bg-red-600 hover:text-white transition duration-300 rounded-full"
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
                </div>
            )}
        </div>
    )
}

export default AdminShiftDetails;
