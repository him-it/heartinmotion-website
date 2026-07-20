"use client"

import { getMembers } from "@/actions/admin/member";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LoadingState } from "@/components/ui/loadingState";
import { Button } from "@/components/ui/button";
import { weeklyUpdateReport } from "../events/reports/generateReports";

const pagerBtnClass = "inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
const selectClass = "h-9 rounded-md border border-input bg-card px-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
const dateInputClass = "h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"

const AdminMembersList = ({ memberData } : { memberData : Prisma.PromiseReturnType<typeof getMembers> | undefined}) => {

    const [ page, setPage ] = useState<number>(1)
    const [ pageLength, setPageLength ] = useState<number>(100)
    const [ search, setSearch ] = useState<string>('')
    const [ fromTime, setFromTime ] = useState<Date>()
    const [ toTime, setToTime ] = useState<Date>()

    // Derive the visible rows + page count. Memoized so the filter and the
    // per-row JSON.stringify search only recompute when an input that actually
    // affects them changes — not on every unrelated re-render.
    const { loadedData, maxPages } = useMemo(() => {
        if(!memberData)
            return { loadedData: [] as NonNullable<typeof memberData>, maxPages: 1 }

        if(search !== '') {
            const q = search.toLowerCase()
            const filtered = memberData.filter(member =>
                (member.first_name + " " + member.last_name).toLowerCase().includes(q) ||
                JSON.stringify(member).toLowerCase().includes(q)
            )
            return { loadedData: filtered, maxPages: filtered.length / pageLength }
        }

        const start = pageLength * (page - 1)
        const slice = memberData.length >= pageLength * (page + 1)
            ? memberData.slice(start, start + pageLength)
            : memberData.slice(start)
        return { loadedData: slice, maxPages: memberData.length / pageLength }
    }, [memberData, search, page, pageLength])

    // Reset to the first page whenever the result set is re-scoped.
    useEffect(() => {
        setPage(1)
    }, [pageLength, search])

    return (
    <div className="flex flex-col items-center">
        {memberData && loadedData && (
            <>
                <div className="w-full mb-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setPage(1)}
                            aria-label="First page"
                            className={pagerBtnClass}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5" />
                            </svg>
                        </button>
                        <button
                            onClick={() => {
                                if (page > 1) setPage(page - 1);
                            }}
                            aria-label="Previous page"
                            className={pagerBtnClass}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                            </svg>
                        </button>
                        <select
                            onChange={(e) => setPage(Number(e.target.value))}
                            value={page}
                            className={selectClass}
                        >
                            {Array.from({ length: Math.ceil(maxPages) }, (_, i) => (
                                <option key={i} value={i + 1}>
                                    {i + 1}/{Math.ceil(maxPages)}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => {
                                if (page < Math.ceil(maxPages)) setPage(page + 1);
                            }}
                            aria-label="Next page"
                            className={pagerBtnClass}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setPage(Math.ceil(memberData.length / pageLength))}
                            aria-label="Last page"
                            className={pagerBtnClass}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                            </svg>
                        </button>
                        <select
                            onChange={(e) => setPageLength(Number(e.target.value))}
                            defaultValue={100}
                            className={selectClass}
                            aria-label="Rows per page"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={1000}>1000</option>
                        </select>
                    </div>

                        <div className="grow" />
                        <input
                            type="text"
                            placeholder="Search members…  ⏎"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const target = e.target as HTMLInputElement;
                                    setSearch(target.value);
                                }
                            }}
                            className={dateInputClass + " w-64 placeholder:text-muted-foreground"}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
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
                            onClick={ () => {
                                if(fromTime && toTime)
                                    weeklyUpdateReport(fromTime, toTime)
                            }}
                        >
                            Generate Report
                        </Button>
                    </div>
                </div>
                <div className="overflow-x-auto w-full rounded-xl border border-border">
                    <table className="min-w-full bg-card border border-border">
                        <thead className="bg-muted">
                            <tr>
                                <th className="sticky left-0 border border-border p-2 text-muted-foreground text-sm md:text-base bg-muted z-10">Name</th>
                                    <th className="border border-border p-2 text-muted-foreground text-sm md:text-base">Cell Phone</th>
                                    <th className="border border-border p-2 text-muted-foreground text-sm md:text-base">School</th>
                                    <th className="border border-border p-2 text-muted-foreground text-sm md:text-base">Graduation Year</th>
                                    <th className="border border-border p-2 text-muted-foreground text-sm md:text-base">Friends</th>
                                    <th className="border border-border p-2 text-muted-foreground text-sm md:text-base">Hours</th>
                                    <th className="border border-border p-2 text-muted-foreground text-sm md:text-base">ID</th>
                                    <th className="border border-border p-2 text-muted-foreground text-sm md:text-base">Email</th>
                                    <th className="border border-border p-2 text-muted-foreground text-sm md:text-base">First Name</th>
                                    <th className="border border-border p-2 text-muted-foreground text-sm md:text-base">Last Name</th>
                                    <th className="border border-border p-2 text-muted-foreground text-sm md:text-base">City</th>
                                    <th className="border border-border p-2 text-muted-foreground text-sm md:text-base">Zip Code</th>
                                    <th className="border border-border p-2 text-muted-foreground text-sm md:text-base">Home Phone</th>
                                    <th className="border border-border p-2 text-muted-foreground text-sm md:text-base">Date of Birth</th>
                                    <th className="border border-border p-2 text-muted-foreground text-sm md:text-base">Shirt Size</th>
                                    <th className="border border-border p-2 text-muted-foreground text-sm md:text-base">Activities</th>
                                    <th className="border border-border p-2 text-muted-foreground text-sm md:text-base">Questions or Comments</th>
                                    <th className="border border-border p-2 text-muted-foreground text-sm md:text-base">Referrer</th>
                                    <th className="border border-border p-2 text-muted-foreground text-sm md:text-base">Emergency Contact Name</th>
                                    <th className="border border-border p-2 text-muted-foreground text-sm md:text-base">Emergency Contact Phone</th>
                                    <th className="border border-border p-2 text-muted-foreground text-sm md:text-base">Emergency Contact Date of Birth</th>
                                    <th className="border border-border p-2 text-muted-foreground text-sm md:text-base">Instagram URL</th>
                                </tr>
                            </thead>
                            <tbody>
                            {loadedData.map((member) => (
                                <tr key={member.id} className="border-b hover:bg-muted">
                                    <td className="sticky left-0 border border-border p-2 text-sm md:text-base bg-card max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full text-primary hover:underline hover:text-primary/90"><Link href={"/admin/members/member/" + member.id}>{member.first_name + " " + member.last_name}</Link></div>
                                    </td>
                                    <td className="border border-border p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.cell_phone}</div>
                                    </td>
                                    <td className="border border-border p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.school}</div>
                                    </td>
                                    <td className="border border-border p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.graduating_year}</div>
                                    </td>
                                    <td className="border border-border p-2 text-sm md:text-base max-w-[400px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.friends}</div>
                                    </td>
                                    <td className="border border-border p-2 text-sm md:text-base max-w-[100px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.events_eventshiftmember.filter(shift => shift.completed).reduce((sum, shift) => shift.hours + sum, 0) + (member.member_memberprivate ? member.member_memberprivate?.extra_hours : 0)}</div>
                                    </td>
                                    <td className="border border-border p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.id}</div>
                                    </td>
                                    <td className="border border-border p-2 text-sm md:text-base max-w-[300px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.email}</div>
                                    </td>
                                    <td className="border border-border p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.first_name}</div>
                                    </td>
                                    <td className="border border-border p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.last_name}</div>
                                    </td>
                                    <td className="border border-border p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.city}</div>
                                    </td>
                                    <td className="border border-border p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.zip}</div>
                                    </td>
                                    <td className="border border-border p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.home_phone}</div>
                                    </td>
                                    <td className="border border-border p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.dob.toLocaleDateString('en-US', {timeZone: 'UTC'})}</div>
                                    </td>
                                    <td className="border border-border p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.shirt_size}</div>
                                    </td>
                                    <td className="border border-border p-2 text-sm md:text-base max-w-[290px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.activities}</div>
                                    </td>
                                    <td className="border border-border p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.comments}</div>
                                    </td>
                                    <td className="border border-border p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.referrer}</div>
                                    </td>
                                    <td className="border border-border p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.emergency_contact_name}</div>
                                    </td>
                                    <td className="border border-border p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.emergency_contact_phone}</div>
                                    </td>
                                    <td className="border border-border p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.emergency_contact_dob.toLocaleDateString('en-US', {timeZone: 'UTC'})}</div>
                                    </td>
                                    <td className="border border-border p-2 text-sm md:text-base max-w-[350px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.twitter_url}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </>
        )}
        {
                    !memberData &&
                    <div className="w-full">
                        <LoadingState label="Loading members…" />
                    </div>
                }
        </div>
    )
}

export default AdminMembersList