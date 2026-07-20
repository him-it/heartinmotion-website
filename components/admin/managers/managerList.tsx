"use client"

import { getManagers, updateManager } from "@/actions/admin/managers";
import { getMemberNames } from "@/actions/admin/member";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormError } from "@/components/ui/formError";
import { Button } from "@/components/ui/button";
import { TableShell, tdClass, thClass } from "@/components/admin/workbench";
import { AddManagerSchema } from "@/schemas";
import { SubmitHandler, useForm } from "react-hook-form";
import * as z from 'zod'
import { zodResolver } from "@hookform/resolvers/zod";

const selectClass = "h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"

export const AdminManagerList = ({ managerData, memberData } : { managerData: Prisma.PromiseReturnType<typeof getManagers> | undefined, memberData: Prisma.PromiseReturnType<typeof getMemberNames> | undefined}) => {
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
        <div className="w-full">
            <div className="rounded-xl border border-border bg-card p-6 mb-8">
                <h2 className="text-sm font-semibold text-foreground mb-4">Add Manager</h2>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(addManager)}>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <FormField
                                control={form.control}
                                name="id"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Member Name:</FormLabel>
                                        <FormControl>
                                            <select
                                                {...field}
                                                disabled={isPending}
                                                className={selectClass}
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
                                    <FormItem className="flex-1">
                                        <FormLabel>Admin Level:</FormLabel>
                                        <FormControl>
                                        <select
                                                {...field}
                                                disabled={isPending}
                                                className={selectClass}
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
                        </div>
                        {addMemberError && <FormError message={addMemberError} />}
                        <div className="flex justify-end mt-4">
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isPending}
                            >
                                Add Manager
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
            <TableShell>
                <table className="min-w-full table-auto border-collapse">
                    <thead className="bg-muted">
                        <tr>
                            <th className={thClass}>Name</th>
                            <th className={thClass}>Type</th>
                            <th className={thClass + " text-right"}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {managerData && managerData.map((manager, key) => (
                            <tr key={key} className="border-b border-border last:border-0 hover:bg-muted/60 transition-colors">
                                <td className={tdClass + " font-medium"}>
                                    <Link className="text-primary hover:text-primary/90 hover:underline" href={"/admin/members/member/" + manager.id}>{manager.first_name + " " + manager.last_name}</Link>
                                </td>
                                <td className={tdClass + " text-muted-foreground"}>
                                    {manager.member_memberrestricted?.admin_level === 2 && "Member Info Only"}
                                    {manager.member_memberrestricted?.admin_level === 4 && "Basic Administrator"}
                                    {manager.member_memberrestricted?.admin_level === 10 && "Super Administrator"}
                                </td>
                                <td className={tdClass + " text-right"}>
                                    <button
                                        disabled={isPending}
                                        onClick={() => {
                                            updateAdminLevel(manager.first_name + " " + manager.last_name, manager.id, 0)
                                        }}
                                        className="text-destructive hover:text-destructive/80 text-sm font-semibold disabled:opacity-50"
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </TableShell>
        </div>
     )
}
