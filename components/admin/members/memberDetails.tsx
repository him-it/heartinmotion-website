"use client"

import * as z from 'zod'

import { zodResolver } from "@hookform/resolvers/zod"
import { deleteMemberPermanent, editClub, getMemberById, updateExtraHours } from "@/actions/admin/member"
import { AccountSchema, MemberClubSchema } from "@/schemas"
import { Prisma } from "@prisma/client"
import { useEffect, useState, useTransition } from "react"
import { SubmitHandler, useForm } from "react-hook-form"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FormSuccess } from '@/components/ui/formSuccess'
import { FormError } from '@/components/ui/formError'
import { edit } from '@/actions/account/edit'
import Link from 'next/link'
import { shiftDeleteMember, updateShiftCompleted, updateShiftConfirmed, updateShiftHours } from '@/actions/admin/event'
import { lifetimeReport } from '../events/reports/generateReports'

const AdminMemberDetails = ({ memberData } : { memberData : Prisma.PromiseReturnType<typeof getMemberById> }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'club' | 'shifts'>('profile')
    const [isPending, startTransition] = useTransition()    
    const [error, setError] = useState<string | undefined>('')
    const [success, setSuccess] = useState<string | undefined>('')

    const [extraHours, setExtraHours] = useState<number>()

    const [ updatedData, setUpdatedData ] = useState<Prisma.PromiseReturnType<typeof getMemberById>>()

    const handleTabClick = (tab: 'profile' | 'club' | 'shifts') => {
        setActiveTab(tab)
    }

    useEffect(() => {
        if(memberData && memberData.member_memberprivate) {
            profileForm.setValue("email", memberData.email)
            profileForm.setValue("first_name", memberData.first_name)
            profileForm.setValue("last_name", memberData.last_name)
            profileForm.setValue("address", memberData.address)
            profileForm.setValue("city", memberData.city)
            profileForm.setValue("zip", memberData.zip)
            profileForm.setValue("cell_phone", memberData.cell_phone)
            profileForm.setValue("home_phone", memberData.home_phone)
            profileForm.setValue("dob", memberData.dob)
            profileForm.setValue("vaccine_status", memberData.vaccine_status)
            profileForm.setValue("school", memberData.school)
            profileForm.setValue("homeroom", memberData.homeroom)
            profileForm.setValue("graduating_year", String(memberData.graduating_year))
            profileForm.setValue("shirt_size", memberData.shirt_size)
            profileForm.setValue("activities", memberData.activities)
            profileForm.setValue("comments", memberData.comments)
            profileForm.setValue("friends", memberData.friends)
            profileForm.setValue("referrer", memberData.referrer)
            profileForm.setValue("emergency_contact_name", memberData.emergency_contact_name)
            profileForm.setValue("emergency_contact_phone", memberData.emergency_contact_phone)
            profileForm.setValue("emergency_contact_dob", memberData.emergency_contact_dob)
            profileForm.setValue("twitter_url", memberData.twitter_url)

            clubForm.setValue("start_date", memberData.member_memberprivate.start_date)
            clubForm.setValue("member_type", memberData.member_memberprivate.member_type)
            clubForm.setValue("in_him_group", memberData.member_memberprivate.in_him_group)
            clubForm.setValue("in_him_crew_group", memberData.member_memberprivate.in_him_crew_group)
            clubForm.setValue("has_lanyard", memberData.member_memberprivate.has_lanyard)
            clubForm.setValue("has_name_badge", memberData.member_memberprivate.has_name_badge)
            clubForm.setValue("has_crew_neck", memberData.member_memberprivate.has_crew_neck)
            clubForm.setValue("has_tshirt", memberData.member_memberprivate.has_tshirt)
            clubForm.setValue("has_long_sleeves", memberData.member_memberprivate.has_long_sleeves)
            clubForm.setValue("has_hoodies", memberData.member_memberprivate.has_hoodies)
            clubForm.setValue("contact", memberData.member_memberprivate.contact)
            clubForm.setValue("contact_notes", memberData.member_memberprivate.contact_notes)

            setUpdatedData(memberData)
            setExtraHours(memberData.member_memberprivate.extra_hours)
        }

    }, [memberData])

    const onProfileSubmit: SubmitHandler<z.infer<typeof AccountSchema>> = (data) => {
        startTransition(() => {
            edit(data)
                .then((res) => {
                    setError(res.error)
                    setSuccess(res.success)
                })
                .catch(() => {
                    setSuccess(undefined)
                    setError("An unexpected error occured.")
                })
        })
    }

    const onClubSubmit: SubmitHandler<z.infer<typeof MemberClubSchema>> = (data) => {
        startTransition(() => {
            if(updatedData)
                editClub(updatedData.id, data)
                    .then((res) => {
                        setError(res.error)
                        setSuccess(res.success)
                    })
                    .catch(() => {
                        setSuccess(undefined)
                        setError("An unexpected error occured.")
                    })
        })
    }

    const profileForm = useForm<z.infer<typeof AccountSchema>>({
        resolver: zodResolver(AccountSchema),
        defaultValues: {
            email: '',
            first_name: '',
            last_name: '',
            address: '',
            city: '',
            zip: '',
            cell_phone: '',
            home_phone: '',
            dob: new Date(),
            vaccine_status: '',
            school: '',
            homeroom: '',
            graduating_year: '',
            shirt_size: '',
            activities: '',
            comments: '',
            friends: '',
            referrer: '',
            emergency_contact_name: '',
            emergency_contact_phone: '',
            emergency_contact_dob: new Date(),
            twitter_url: ''
        }
    })

    const clubForm = useForm<z.infer<typeof MemberClubSchema>>({
        resolver: zodResolver(MemberClubSchema),
        defaultValues: {
            start_date: new Date(),
            member_type: '',
            in_him_group: false,
            in_him_crew_group: false,
            has_lanyard: false,
            has_name_badge: false,
            has_crew_neck: false,
            has_tshirt: false,
            has_long_sleeves: false,
            has_hoodies: false,
            contact: '',
            contact_notes: ''
        }
    })


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
                    setUpdatedData({ ...updatedData, events_eventshiftmember: updatedMemberData })
                }
            })
            .catch(() => {

            })
        })
    }

    const changeCompleted = (id: number, value: boolean) => {
        startTransition(() => {
            updateShiftCompleted(id, value)
            .then(() => {
                if(updatedData) {
                    const updatedMemberData = updatedData.events_eventshiftmember.map(shift => {
                        if(typeof value === "boolean" && shift?.id === id)
                            return {...shift, completed: value}
                        return shift
                    })
                    setUpdatedData({ ...updatedData, events_eventshiftmember: updatedMemberData })
                }
            })
            .catch(() => {
                
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
                
            })
        })
    }

    const changeExtraHours = (hours: number) => {
        startTransition(() => {
            if(updatedData)
                updateExtraHours(updatedData.id, hours)
                .then(() => {
                    if(updatedData.member_memberprivate)
                        setUpdatedData({ ...updatedData, member_memberprivate: {...updatedData.member_memberprivate, extra_hours: hours} });
                })
                .catch(() => {
                    
                })
        })
    }

    const deleteShift = (id: number, name: string) => {
        if(confirm("Are you sure you want to remove " + name + " from this shift?"))
            shiftDeleteMember(id)
            .then(() => {
                if(updatedData)
                    setUpdatedData({...updatedData, events_eventshiftmember: updatedData.events_eventshiftmember.filter(shift => shift.id !== id)})
                else
                    window.location.reload()
            })
            .catch(() => {
                
            })
    }

    const deleteMember = () => {
        if(updatedData && prompt('WARNING: All data involving this member will be erased. \nHour totals for events will no longer include the work done by this member. \nOnly delete members that have not particpated at all. \nPlease type "I am confident about deleting ' + updatedData.first_name + " " + updatedData.last_name + ' permanently from Heart in Motion."') === 'I am confident about deleting ' + updatedData.first_name + " " + updatedData.last_name + ' permanently from Heart in Motion.')
            deleteMemberPermanent(updatedData.id)
                .then(() => {
                    window.location.replace("/admin/members")
                })
                .catch(() => {
                
                })
    }

    return (
            <div className="flex justify-center items-center min-h-screen flex-col gap-8">
                {updatedData && 
                    <div className="flex flex-col items-center w-full max-w-4xl">
                    <div className="flex justify-center gap-4 mb-4">
                        <button className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition"
                            disabled={!updatedData.id}
                            onClick={() => {
                                deleteMember()
                            }}
                        >
                            Delete Member
                        </button>
                        <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                            disabled={!updatedData.id}
                            onClick={() => {
                                lifetimeReport(updatedData.id)
                            }}
                        >
                            Lifetime Report
                        </button>
                    </div>
                    
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => handleTabClick('profile')}
                            className={`px-4 py-2 rounded-tl-lg rounded-tr-lg ${activeTab === 'profile' ? 'bg-white p-8 border border-gray-200 rounded-lg border-b-0 rounded-b-none hover:bg-gray-50 transition' : 'bg-gray-200 hover:bg-gray-300 transition'}`}
                            disabled={!updatedData.id}
                        >
                            Profile
                        </button>
                        <button
                            onClick={() => handleTabClick('club')}
                            className={`px-4 py-2 rounded-tl-lg rounded-tr-lg ${activeTab === 'club' ? 'bg-white p-8 border border-gray-200 rounded-lg border-b-0 rounded-b-none hover:bg-gray-50 transition' : 'bg-gray-200 hover:bg-gray-300 transition'}`}
                            disabled={!updatedData.id}
                        >
                            Club
                        </button>
                        <button
                            onClick={() => handleTabClick('shifts')}
                            className={`px-4 py-2 rounded-tl-lg rounded-tr-lg ${activeTab === 'shifts' ? 'bg-white p-8 border border-gray-200 rounded-lg border-b-0 rounded-b-none hover:bg-gray-50 transition' : 'bg-gray-200 hover:bg-gray-300 transition'}`}
                            disabled={!updatedData.id}
                        >
                            Shifts
                        </button>
                    </div>
                    <div>
                        {activeTab === 'profile' && (
                            <div className='shadow-lg p-8 border border-gray-100 rounded-lg'>
                                <Form {...profileForm}>
                                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                                        <div className='space-y-4 sm:w-96 w-55'>
                                            <FormField 
                                                control={profileForm.control}
                                                name="email"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Email</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                {...field}
                                                                type="email"
                                                                disabled={ isPending || !updatedData.id }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem> 
                                                )}
                                            />
                                            <FormField
                                                control={profileForm.control}
                                                name="first_name"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>First Name</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                {...field}
                                                                type="text"
                                                                maxLength={50}
                                                                disabled={ isPending || !updatedData.id }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem> 
                                                )}
                                            />
                                            <FormField
                                                control={profileForm.control}
                                                name="last_name"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Last Name</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                {...field}
                                                                type="text"
                                                                maxLength={50}
                                                                disabled={ isPending || !updatedData.id }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem> 
                                                )}
                                            />
                                            <FormField
                                                control={profileForm.control}
                                                name="address"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Address</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                {...field}
                                                                type="text"
                                                                maxLength={200}
                                                                disabled={ isPending || !updatedData.id }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem> 
                                                )}
                                            />
                                            <FormField
                                                control={profileForm.control}
                                                name="city"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>City</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                {...field}
                                                                type="text"
                                                                maxLength={50}
                                                                disabled={ isPending || !updatedData.id }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem> 
                                                )}
                                            />
                                            <FormField
                                                control={profileForm.control}
                                                name="zip"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Zip</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                {...field}
                                                                type="text"
                                                                maxLength={5}
                                                                disabled={ isPending || !updatedData.id }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem> 
                                                )}
                                            />
                                            <FormField
                                                control={profileForm.control}
                                                name="cell_phone"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Cell Phone</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                {...field}
                                                                placeholder="123-456-7890"
                                                                type="text"
                                                                disabled={ isPending || !updatedData.id }
                                                                maxLength={12}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem> 
                                                )}
                                            />
                                            <FormField
                                                control={profileForm.control}
                                                name="home_phone"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Home Phone</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                {...field}
                                                                placeholder="123-456-7890"
                                                                type="text"
                                                                disabled={ isPending || !updatedData.id }
                                                                maxLength={12}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem> 
                                                )}
                                            />
                                            <FormField
                                                control={profileForm.control}
                                                name="dob"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Date of Birth</FormLabel>
                                                        <FormControl>
                                                        <Input 
                                                            type="date"
                                                            {...field}
                                                            disabled={ isPending || !updatedData.id }
                                                            value={
                                                                    field.value instanceof Date
                                                                    ? field.value.toISOString().split('T')[0]
                                                                    : field.value
                                                            }
                                                        />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem> 
                                                )}
                                            />
                                            <FormField
                                                control={profileForm.control}
                                                name="vaccine_status"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Vaccine Status</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                {...field}
                                                                type="text"
                                                                maxLength={50}
                                                                disabled={ isPending || !updatedData.id }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={profileForm.control}
                                                name="school"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>School</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                {...field}
                                                                type="text"
                                                                maxLength={50}
                                                                disabled={ isPending || !updatedData.id }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={profileForm.control}
                                                name="homeroom"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Homeroom</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                {...field}
                                                                type="text"
                                                                maxLength={20}
                                                                disabled={ isPending || !updatedData.id }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={profileForm.control}
                                                name="graduating_year"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Graduation Year</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                {...field}
                                                                type="text"
                                                                maxLength={11}
                                                                disabled={ isPending || !updatedData.id }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={profileForm.control}
                                                name="shirt_size"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Shirt Size</FormLabel>
                                                        <FormControl>
                                                            <select {...field} className="border rounded p-2 mb-4 w-full" disabled={ isPending || !updatedData.id }>
                                                                <option value="XS">XS</option>
                                                                <option value="S">S</option>
                                                                <option value="M">M</option>
                                                                <option value="L">L</option>
                                                                <option value="XL">XL</option>
                                                            </select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={profileForm.control}
                                                name="activities"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Activities</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                {...field}
                                                                placeholder="Clubs/sports"
                                                                type="text"
                                                                maxLength={2000}
                                                                disabled={ isPending || !updatedData.id }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={profileForm.control}
                                                name="comments"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Comments</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                {...field}
                                                                placeholder="Additional comments"
                                                                type="text"
                                                                maxLength={2000}
                                                                disabled={ isPending || !updatedData.id }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={profileForm.control}
                                                name="friends"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Friends</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                {...field}
                                                                placeholder="List of friends currently in HIM"
                                                                type="text"
                                                                maxLength={2000}
                                                                disabled={ isPending || !updatedData.id }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={profileForm.control}
                                                name="referrer"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Referrer</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                {...field}
                                                                placeholder="Who invited you to join?"
                                                                type="text"
                                                                maxLength={100}
                                                                disabled={ isPending || !updatedData.id }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={profileForm.control}
                                                name="emergency_contact_name"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Emergency Contact Name</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                {...field}
                                                                type="text"
                                                                maxLength={100}
                                                                disabled={ isPending || !updatedData.id }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={profileForm.control}
                                                name="emergency_contact_phone"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Emergency Contact Phone</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                {...field}
                                                                placeholder="123-456-7890"
                                                                type="text"
                                                                disabled={ isPending || !updatedData.id }
                                                                maxLength={12}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={profileForm.control}
                                                name="emergency_contact_dob"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Emergency Contact Date of Birth</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                type="date"
                                                                {...field}
                                                                disabled={ isPending || !updatedData.id }
                                                                value={
                                                                    field.value instanceof Date
                                                                    ? field.value.toISOString().split('T')[0]
                                                                    : field.value
                                                                }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={profileForm.control}
                                                name="twitter_url"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Instagram URL</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                {...field}
                                                                type="text"
                                                                maxLength={200}
                                                                disabled={ isPending || !updatedData.id }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        { success ? (
                                            <FormSuccess message={ success } />
                                        ) : (
                                            <FormError message={ error } />
                                        )}
                                        <Button
                                            type="submit"
                                            className='w-full mt-8 rounded-full bg-red-500 hover:bg-red-600 transition duration-300 text-white'
                                            disabled={ isPending || !updatedData.id }
                                        >
                                            Save
                                        </Button>
                                    </form>
                                </Form>
                            </div>
                        )}
                        
                        {activeTab === 'club' && (
                            <div className='shadow-lg p-8 border border-gray-100 rounded-lg'>
                                <Form {...clubForm}>
                                    <form onSubmit={clubForm.handleSubmit(onClubSubmit)}>
                                        <div className='space-y-4 sm:w-96 w-55'>
                                            <FormField
                                                control={clubForm.control}
                                                name="start_date"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Start Date:</FormLabel>
                                                        <FormControl>
                                                        <Input 
                                                            type="date"
                                                            {...field}
                                                            disabled={ isPending || !updatedData.id }
                                                            value={
                                                                    field.value instanceof Date
                                                                    ? field.value.toISOString().split('T')[0]
                                                                    : field.value
                                                            }
                                                        />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem> 
                                                )}
                                            />
                                            <FormField
                                                control={clubForm.control}
                                                name="member_type"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Member Type:</FormLabel>
                                                        <FormControl>
                                                        <select {...field} className="border rounded p-2 mb-4 w-full" disabled={ isPending || !updatedData.id }>
                                                            <option value="CM">Club Member</option>
                                                            <option value="HM">HIM Member</option>
                                                            <option value="FM">Former Member</option>
                                                            <option value="NF">No Facebook</option>
                                                            <option value="IM">Inactive Member</option>
                                                            <option value="LE">Leadership</option>
                                                            <option value="OF">Officer</option>
                                                            <option value="IN">Intern</option>
                                                        </select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={clubForm.control}
                                                name="in_him_group"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>In HIM group:</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                className='w-6'
                                                                {...field}
                                                                type="checkbox"
                                                                value="in_him_group"
                                                                disabled={ isPending || !updatedData.id }
                                                                checked={field.value}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={clubForm.control}
                                                name="in_him_crew_group"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>In HIM Crew group:</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                className='w-6'
                                                                {...field}
                                                                type="checkbox"
                                                                value="in_him_crew_group"
                                                                disabled={ isPending || !updatedData.id }
                                                                checked={field.value}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={clubForm.control}
                                                name="has_lanyard"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Has lanyard:</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                className='w-6'
                                                                {...field}
                                                                type="checkbox"
                                                                value="has_lanyard"
                                                                disabled={ isPending || !updatedData.id }
                                                                checked={field.value}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={clubForm.control}
                                                name="has_name_badge"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Has name badge:</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                className='w-6'
                                                                {...field}
                                                                type="checkbox"
                                                                value="has_name_badge"
                                                                disabled={ isPending || !updatedData.id }
                                                                checked={field.value}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={clubForm.control}
                                                name="has_crew_neck"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Has crew neck:</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                className='w-6'
                                                                {...field}
                                                                type="checkbox"
                                                                value="has_crew_neck"
                                                                disabled={ isPending || !updatedData.id }
                                                                checked={field.value}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={clubForm.control}
                                                name="has_tshirt"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Has t-shirt:</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                className='w-6'
                                                                {...field}
                                                                type="checkbox"
                                                                value="has_tshirt"
                                                                disabled={ isPending || !updatedData.id }
                                                                checked={field.value}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={clubForm.control}
                                                name="has_long_sleeves"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Has Discord:</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                className='w-6'
                                                                {...field}
                                                                type="checkbox"
                                                                value="has_long_sleeves"
                                                                disabled={ isPending || !updatedData.id }
                                                                checked={field.value}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={clubForm.control}
                                                name="has_hoodies"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Has Waiver:</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                className='w-6'
                                                                {...field}
                                                                type="checkbox"
                                                                value="has_hoodies"
                                                                disabled={ isPending || !updatedData.id }
                                                                checked={field.value}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            /> 
                                            <FormField
                                                control={clubForm.control}
                                                name="contact"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Contact:</FormLabel>
                                                        <FormControl>
                                                            <select {...field} className="border rounded p-2 mb-4 w-full" disabled={ isPending || !updatedData.id }>
                                                                <option value="N">New</option>
                                                                <option value="P">Pending</option>
                                                                <option value="U">Unsuccessful</option>
                                                                <option value="C">Completed</option>
                                                            </select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />  
                                            <FormField
                                                control={clubForm.control}
                                                name="contact_notes"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Contact notes:</FormLabel>
                                                        <FormControl>
                                                        <textarea 
                                                            {...field} 
                                                            disabled={ isPending || !updatedData.id }
                                                            rows={4}
                                                            className="w-full p-2 border rounded-lg resize-none"
                                                        />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />                                          
                                        </div>
                                        { success ? (
                                            <FormSuccess message={ success } />
                                        ) : (
                                            <FormError message={ error } />
                                        )}
                                        <Button
                                            type="submit"
                                            className='w-full mt-8 rounded-full bg-red-500 hover:bg-red-600 transition duration-300 text-white'
                                            disabled={ isPending || !updatedData.id }
                                        >
                                            Save
                                        </Button>
                                    </form>
                                </Form>
                            </div>
                        )}
                        {activeTab === 'shifts' && (
                            <div className='shadow-lg p-8 border border-gray-100 rounded-lg'>
                                <div className='space-y-6 sm:w-full w-full'>
                                    <div className='space-y-2'>
                                        <div>
                                            <label>Recorded hours:</label>
                                            <Input
                                                value={
                                                    updatedData.events_eventshiftmember.filter(shift => shift.completed).reduce((sum, shift) => sum + shift.hours, 0)
                                                }
                                                disabled
                                            />
                                        </div>
                                        <div>
                                            <label>Extra hours:</label>
                                            <Input
                                                value={
                                                    extraHours
                                                }
                                                onChange={(e) => {
                                                    if(!isNaN(Number(e.target.value)))
                                                        setExtraHours(Number(e.target.value))
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === '-') {
                                                        if(extraHours)
                                                            setExtraHours(-extraHours)
                                                    }
                                                    if (e.key === 'Backspace') {
                                                        if(extraHours && extraHours < 0 && extraHours > -10)
                                                            setExtraHours(0)
                                                    }
                                                }}
                                                disabled={ isPending || !updatedData.id }
                                            />
                                            <Button className='mt-2 bg-black text-white'
                                                onClick={() => {
                                                    if(extraHours !== undefined)
                                                        changeExtraHours(extraHours)
                                                }}
                                                disabled={ isPending || !updatedData.id }
                                            >
                                                Update
                                            </Button>
                                        </div>
                                        <div>
                                            <label>Total hours:</label>
                                            <Input
                                                value={
                                                    updatedData.events_eventshiftmember.filter(shift => shift.completed).reduce((acc, shift) => acc + shift.hours, 0) + (updatedData.member_memberprivate ? updatedData.member_memberprivate.extra_hours : 0)
                                                }
                                                disabled
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md sm:w-full overflow-x-auto">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="p-3 text-left text-gray-600 border-b border-gray-300">Date</th>
                                                    <th className="p-3 text-left text-gray-600 border-b border-gray-300">Event/Shift</th>
                                                    <th className="p-3 text-left text-gray-600 border-b border-gray-300">Transportation</th>
                                                    <th className="p-3 text-left text-gray-600 border-b border-gray-300">Confirmed</th>
                                                    <th className="p-3 text-left text-gray-600 border-b border-gray-300">Completed</th>
                                                    <th className="p-3 text-left text-gray-600 border-b border-gray-300">Hours</th>
                                                    <th className="p-3 text-center text-gray-600 border-b border-gray-300">Delete</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    updatedData.events_eventshiftmember.map((shift, key) => (
                                                        <tr key={key} className="hover:bg-gray-50 border-solid border-2 border-gray-100">
                                                            <td className="p-3 text-gray-700">
                                                                {shift.events_eventshift.start_time.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }) + " (" + shift.events_eventshift.start_time.toLocaleString('en-US', { weekday: 'short' }) + ")"}
                                                            </td>
                                                            <td className="p-3 text-gray-700">
                                                                <Link href={"/admin/events/event/" + shift.events_eventshift.events_event.slug} className="text-red-800 hover:text-amber-950 hover:underline">{shift.events_eventshift.events_event.name}</Link>
                                                                <br/>
                                                                <Link href={"/admin/events/event/" + shift.events_eventshift.events_event.slug + "/shift/" + shift.events_eventshift.id} className="text-red-800 hover:text-amber-950 hover:underline">{"(" + shift.events_eventshift.description + ")"}</Link>
                                                            </td>
                                                            <td className="p-3 text-gray-700">{shift.transportation}</td>
                                                            <td className="p-3 text-center">
                                                                <Button
                                                                    disabled={isPending}
                                                                    className={`${shift.confirmed ? "bg-green-500 hover:bg-green-600" : "bg-red-600 hover:bg-red-700"} text-white w-full`}
                                                                    onClick={() => { changeConfirmed(shift.id, !shift.confirmed) }}
                                                                >
                                                                    {shift.confirmed ? "Yes" : "No"}
                                                                </Button>
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <Button
                                                                    disabled={isPending}
                                                                    className={`${shift.completed ? "bg-green-500 hover:bg-green-600" : "bg-red-600 hover:bg-red-700"} text-white w-full`}
                                                                    onClick={() => { changeCompleted(shift.id, !shift.completed) }}
                                                                >
                                                                    {shift.completed ? "Yes" : "No"}
                                                                </Button>
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <input
                                                                    type="number"
                                                                    defaultValue={shift.hours}
                                                                    disabled={isPending}
                                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            const target = e.target as HTMLInputElement;
                                                                            changeHours(shift.id, Number(target.value));
                                                                        }
                                                                    }}
                                                                />
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <Button
                                                                    disabled={isPending}
                                                                    className='bg-black text-white'
                                                                    onClick={() => { deleteShift(shift.id, updatedData.first_name + " " + updatedData.last_name) }}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>   
                </div>
            }
        </div>
    )
}

export default AdminMemberDetails