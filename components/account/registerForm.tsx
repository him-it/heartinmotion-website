"use client"

import * as z from 'zod'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, SubmitHandler } from "react-hook-form"
import { AccountSchema } from '@/schemas'

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
import { register } from '@/actions/account/register'
import { useEffect, useState, useTransition } from 'react'
import { FormError } from '../ui/formError'
import { FormSuccess } from '../ui/formSuccess'
import { signOut } from 'next-auth/react'

export const RegisterForm = ({ email }: { email : string }) => {
    const [isPending, startTransition] = useTransition()    
    const [error, setError] = useState<string | undefined>('')
    const [success, setSuccess] = useState<string | undefined>('')

    useEffect(() => {
        form.setValue("email", email)
    }, [email])

    const schoolList = [
        'Alice Fong Yu',
        'AP Giannini',
        'Balboa',
        'Burton',
        'Galileo',
        'El Camino',
        'Hoover',
        'Lick-Wilmerding',
        'Lincoln',
        'Lowell',
        'Mills',
        'Presidio',
        'Roosevelt',
        'SOTA',
        'Wallenberg',
        'Washington',
        'Westmoor',
        'CCSF',
        'SFSU'
    ]

    const form = useForm<z.infer<typeof AccountSchema>>({
        resolver: zodResolver(AccountSchema),
        defaultValues: {
            email: email,
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

    const onSubmit: SubmitHandler<z.infer<typeof AccountSchema>> = (data) => {
        startTransition(() => {
            if(confirm("Once you successfully register you will be logged out and must sign back in. Are you ready?"))
            register(data)
                .then((res) => {
                    setError(res.error)
                    setSuccess(res.success)

                    signOut()
                })
                .catch(() => {
                    setSuccess(undefined)
                    setError("An unexpected error occured.")
                })
        })
    }

    return (
        <div className='shadow-lg p-8 border border-gray-100 rounded-lg'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className='space-y-4 sm:w-96 w-55'>
                        <FormField 
                            control={form.control}
                            name="email"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field}
                                            type="email"
                                            disabled
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem> 
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="first_name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field}
                                            type="text"
                                            maxLength={50}
                                            disabled={ isPending }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem> 
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="last_name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field}
                                            type="text"
                                            maxLength={50}
                                            disabled={ isPending }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem> 
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field}
                                            type="text"
                                            maxLength={200}
                                            disabled={ isPending }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem> 
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="city"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field}
                                            type="text"
                                            maxLength={50}
                                            disabled={ isPending }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem> 
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="zip"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Zip</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field}
                                            type="text"
                                            maxLength={5}
                                            disabled={ isPending }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem> 
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="cell_phone"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Cell Phone</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field}
                                            placeholder="123-456-7890"
                                            type="text"
                                            disabled={ isPending }
                                            maxLength={12}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem> 
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="home_phone"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Home Phone</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field}
                                            placeholder="123-456-7890"
                                            type="text"
                                            disabled={ isPending }
                                            maxLength={12}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem> 
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="dob"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Date of Birth</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="date"
                                            {...field}
                                            disabled={ isPending }
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
                            control={form.control}
                            name="vaccine_status"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Vaccine Status</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field}
                                            type="text"
                                            maxLength={50}
                                            disabled={isPending}
                                            placeholder='Optional'
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="school"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>School</FormLabel>
                                    <FormControl>
                                        { schoolList.includes(form.getValues("school")) ? 
                                            <select {...field} className="border rounded p-2 mb-4 w-full" disabled={isPending}
                                                onChange={(e) => {
                                                    if(e.target.value === "Other")
                                                        form.setValue("school", "")
                                                    else
                                                        form.setValue("school", e.target.value)
                                                }}
                                            >
                                                {
                                                    schoolList.map((school, key) => (
                                                        <option key={key} value={school}>{school}</option>
                                                    ))
                                                }
                                                <option value="Other">Other</option>
                                            </select> : (
                                                <div>
                                                    <select className="border rounded p-2 mb-4 w-full" value="Other" disabled={isPending}
                                                        onChange={(e) => {
                                                            if(schoolList.includes(e.target.value))
                                                                form.setValue("school", e.target.value)
                                                        }}
                                                    >
                                                        {
                                                            schoolList.map((school, key) => (
                                                                <option key={key} value={school}>{school}</option>
                                                            ))
                                                        }
                                                        <option value="Other">Other</option>
                                                    </select>
                                                    <Input 
                                                        {...field}
                                                        type="text"
                                                        maxLength={50}
                                                        disabled={isPending}
                                                    />
                                                </div>
                                            )
                                        }
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="homeroom"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Homeroom</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field}
                                            type="text"
                                            maxLength={20}
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="graduating_year"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Graduation Year</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field}
                                            type="text"
                                            maxLength={11}
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="shirt_size"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Shirt Size</FormLabel>
                                    <FormControl>
                                        <select {...field} className="border rounded p-2 mb-4 w-full" disabled={isPending}>
                                            <option></option>
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
                            control={form.control}
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
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
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
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
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
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
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
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="emergency_contact_name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Emergency Contact Name</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field}
                                            type="text"
                                            maxLength={100}
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="emergency_contact_phone"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Emergency Contact Phone</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field}
                                            placeholder="123-456-7890"
                                            type="text"
                                            disabled={isPending}
                                            maxLength={12}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="emergency_contact_dob"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Emergency Contact Date of Birth</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="date"
                                            {...field}
                                            disabled={isPending}
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
                            control={form.control}
                            name="twitter_url"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Instagram URL</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field}
                                            type="text"
                                            maxLength={200}
                                            disabled={isPending}
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
                        className='text-white w-full mt-8 rounded-full bg-red-500 hover:bg-red-600 transition duration-300'
                        disabled={ isPending }
                    >
                        Save
                    </Button>
                </form>
            </Form>
        </div>
    )
}