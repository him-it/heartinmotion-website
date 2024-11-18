"use client"

import { getManagers, updateManager } from "@/actions/admin/managers";
import { getMemberNames } from "@/actions/admin/member";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/ui/formError";
import { Button } from "@/components/ui/button";
import { AddManagerSchema } from "@/schemas";
import { SubmitHandler, useForm } from "react-hook-form";
import * as z from 'zod'
import { zodResolver } from "@hookform/resolvers/zod";

export const AdminManagerList = ({ managerData, memberData } : { managerData: Prisma.PromiseReturnType<typeof getManagers>, memberData: Prisma.PromiseReturnType<typeof getMemberNames> }) => {
    const [isPending, startTransition] = useTransition() 
    const [addMemberError, setAddMemberError] = useState<string | undefined>(undefined)
    
    const updateAdminLevel = (name: string, member_id: number, admin_level: number) => {
        if(confirm("Are you sure you want you remove " + name + " as a manager?")) {
            startTransition(() => {
                updateManager(member_id, admin_level)
                .then(() => {
                    window.location.reload()
                })
            })
        }
    }

    const form = useForm<z.infer<typeof AddManagerSchema>>({
        resolver: zodResolver(AddManagerSchema),
        defaultValues: {
            id: '',
            admin_level: ''
        }
    })

    const addManager : SubmitHandler<z.infer<typeof AddManagerSchema>> = (data) => {
        startTransition(() => {
            updateManager(Number(data.id), Number(data.admin_level))
            .then(() => {
                window.location.reload()
            })
        })
    }

    return (
        <div className="overflow-x-auto p-4">
            <div className="mb-8">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(addManager)}>
                    <FormField 
                        control={form.control}
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
                        control={form.control}
                        name="admin_level"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Admin Level:</FormLabel>
                                <FormControl>
                                <select
                                        {...field}
                                        disabled={isPending}
                                        className="border rounded p-2 mb-4 w-full"
                                    >
                                    <option></option>
                                    <option value="2">Member Info Only</option>
                                    <option value="4">Basic Administrator</option>
                                    <option value="10">Super Administrator</option>
                                </select>
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
            <table className="min-w-full table-auto bg-white border-collapse shadow-lg">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Type</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Remove</th>
                    </tr>
                </thead>
                <tbody>
                    {managerData && managerData.map((manager, key) => (
                        <tr key={key} className="border-b">
                            <td className="px-4 py-2 text-sm text-gray-800">
                                <Link className="text-red-600 hover:text-red-700 hover:underline" href={"/admin/members/member/" + manager.id}>{manager.first_name + " " + manager.last_name}</Link>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-800">
                                {manager.member_memberrestricted?.admin_level === 2 && "Member Info Only"}
                                {manager.member_memberrestricted?.admin_level === 4 && "Basic Administrator"}
                                {manager.member_memberrestricted?.admin_level === 10 && "Super Administrator"}
                            </td>
                            <td className="px-4 py-2">
                                <button 
                                    disabled={isPending}
                                    onClick={() => {
                                        updateAdminLevel(manager.first_name + " " + manager.last_name, manager.id, 0)
                                    }}
                                    className="text-red-600 hover:text-red-800 text-sm font-semibold"
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
     )
}