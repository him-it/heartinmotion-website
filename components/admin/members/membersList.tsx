"use client"

import { getMembers } from "@/actions/admin/member";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { weeklyUpdateReport } from "../events/reports/generateReports";

const AdminMembersList = ({ memberData } : { memberData : Prisma.PromiseReturnType<typeof getMembers> }) => {
    const [ loadedData, setLoadedData ] = useState<Prisma.PromiseReturnType<typeof getMembers>>([])
    const [ page, setPage ] = useState<number>(1)
    const [ pageLength, setPageLength ] = useState<number>(100)
    const [ search, setSearch ] = useState<string>('')
    const [ maxPages, setMaxPages ] = useState<number>(1)
    const [ fromTime, setFromTime ] = useState<Date>()
    const [ toTime, setToTime ] = useState<Date>()

    useEffect(() => {
        if(memberData) {
            if(memberData.length >= pageLength*(page + 1)) 
                setLoadedData(memberData.slice(pageLength*(page-1), pageLength*(page-1) + pageLength))
            else
                setLoadedData(memberData.slice(pageLength*(page-1)))
            if(search != '') {
                setLoadedData(memberData.filter(member => (member.first_name + " " + member.last_name).toLowerCase() === search.toLowerCase() || JSON.stringify(member).toLowerCase().includes(search.toLowerCase())))  
                setMaxPages(memberData.filter(member => (member.first_name + " " + member.last_name).toLowerCase() === search.toLowerCase() || JSON.stringify(member).includes(search.toLowerCase())).length / pageLength)
            } else 
                setMaxPages(memberData.length / pageLength)
        }     
    }, [pageLength, page, search])

    useEffect(() => {
        setPage(1)
    }, [pageLength, maxPages])

    return (
    <div className="flex flex-col items-center">
        {memberData && loadedData && (
            <>
                <div className="mb-4">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setPage(1)}
                            className="p-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5" />
                            </svg>
                        </button>
                        <button
                            onClick={() => {
                                if (page > 1) setPage(page - 1);
                            }}
                            className="p-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                            </svg>
                        </button>
                        <select
                            onChange={(e) => setPage(Number(e.target.value))}
                            value={page}
                            className="border border-gray-300 rounded p-2"
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
                            className="p-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setPage(Math.ceil(memberData.length / pageLength))}
                            className="p-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                            </svg>
                        </button>
                        <select
                            onChange={(e) => setPageLength(Number(e.target.value))}
                            defaultValue={100}
                            className="border border-gray-300 rounded p-2"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={1000}>1000</option>
                        </select>

                        <div className="pl-[100px] space-x-3">
                            <label>From</label>
                            <input
                                type="date"
                                className="border border-gray-300 rounded p-2"
                                onChange={(e) => {
                                    if(e.target.valueAsDate)
                                        setFromTime(e.target.valueAsDate)
                                }}
                            />
                            <label>To</label>
                            <input
                                type="date"
                                className="border border-gray-300 rounded p-2"
                                onChange={(e) => {
                                    if(e.target.valueAsDate)
                                        setToTime(e.target.valueAsDate)
                                }}
                            />
                            <button className="p-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                                onClick={ () => {
                                    if(fromTime && toTime)
                                        weeklyUpdateReport(fromTime, toTime)
                                }}
                            >
                                Generate Report
                            </button>
                        </div>

                        <div className="pl-[100px] space-x-3">
                            <label>Search:</label>
                            <input
                                type="text"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const target = e.target as HTMLInputElement;
                                        setSearch(target.value);
                                    }
                                }}
                                className="border border-gray-300 rounded p-2"
                            />
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto md:w-full w-[80%]">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="sticky left-0 border border-gray-300 p-2 text-gray-600 text-sm md:text-base bg-gray-100 z-10">Name</th>
                                    <th className="border border-gray-300 p-2 text-gray-600 text-sm md:text-base">Cell Phone</th>
                                    <th className="border border-gray-300 p-2 text-gray-600 text-sm md:text-base">School</th>
                                    <th className="border border-gray-300 p-2 text-gray-600 text-sm md:text-base">Graduation Year</th>
                                    <th className="border border-gray-300 p-2 text-gray-600 text-sm md:text-base">Friends</th>
                                    <th className="border border-gray-300 p-2 text-gray-600 text-sm md:text-base">Hours</th>
                                    <th className="border border-gray-300 p-2 text-gray-600 text-sm md:text-base">ID</th>
                                    <th className="border border-gray-300 p-2 text-gray-600 text-sm md:text-base">Email</th>
                                    <th className="border border-gray-300 p-2 text-gray-600 text-sm md:text-base">First Name</th>
                                    <th className="border border-gray-300 p-2 text-gray-600 text-sm md:text-base">Last Name</th>
                                    <th className="border border-gray-300 p-2 text-gray-600 text-sm md:text-base">City</th>
                                    <th className="border border-gray-300 p-2 text-gray-600 text-sm md:text-base">Zip Code</th>
                                    <th className="border border-gray-300 p-2 text-gray-600 text-sm md:text-base">Home Phone</th>
                                    <th className="border border-gray-300 p-2 text-gray-600 text-sm md:text-base">Date of Birth</th>
                                    <th className="border border-gray-300 p-2 text-gray-600 text-sm md:text-base">Shirt Size</th>
                                    <th className="border border-gray-300 p-2 text-gray-600 text-sm md:text-base">Activities</th>
                                    <th className="border border-gray-300 p-2 text-gray-600 text-sm md:text-base">Questions or Comments</th>
                                    <th className="border border-gray-300 p-2 text-gray-600 text-sm md:text-base">Referrer</th>
                                    <th className="border border-gray-300 p-2 text-gray-600 text-sm md:text-base">Emergency Contact Name</th>
                                    <th className="border border-gray-300 p-2 text-gray-600 text-sm md:text-base">Emergency Contact Phone</th>
                                    <th className="border border-gray-300 p-2 text-gray-600 text-sm md:text-base">Emergency Contact Date of Birth</th>
                                    <th className="border border-gray-300 p-2 text-gray-600 text-sm md:text-base">Instagram URL</th>
                                </tr>
                            </thead>
                            <tbody>
                            {loadedData.map((member) => (
                                <tr key={member.id} className="border-b hover:bg-gray-50">
                                    <td className="sticky left-0 border border-gray-300 p-2 text-sm md:text-base bg-white max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full text-red-800 hover:underline hover:text-red-950"><Link href={"/admin/members/member/" + member.id}>{member.first_name + " " + member.last_name}</Link></div>
                                    </td>
                                    <td className="border border-gray-300 p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.cell_phone}</div>
                                    </td>
                                    <td className="border border-gray-300 p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.school}</div>
                                    </td>
                                    <td className="border border-gray-300 p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.graduating_year}</div>
                                    </td>
                                    <td className="border border-gray-300 p-2 text-sm md:text-base max-w-[400px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.friends}</div>
                                    </td>
                                    <td className="border border-gray-300 p-2 text-sm md:text-base max-w-[100px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.events_eventshiftmember.reduce((sum, shift) => shift.hours + sum, 0)}</div>
                                    </td>
                                    <td className="border border-gray-300 p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.id}</div>
                                    </td>
                                    <td className="border border-gray-300 p-2 text-sm md:text-base max-w-[300px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.email}</div>
                                    </td>
                                    <td className="border border-gray-300 p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.first_name}</div>
                                    </td>
                                    <td className="border border-gray-300 p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.last_name}</div>
                                    </td>
                                    <td className="border border-gray-300 p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.city}</div>
                                    </td>
                                    <td className="border border-gray-300 p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.zip}</div>
                                    </td>
                                    <td className="border border-gray-300 p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.home_phone}</div>
                                    </td>
                                    <td className="border border-gray-300 p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.dob.toLocaleDateString()}</div>
                                    </td>
                                    <td className="border border-gray-300 p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.shirt_size}</div>
                                    </td>
                                    <td className="border border-gray-300 p-2 text-sm md:text-base max-w-[290px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.activities}</div>
                                    </td>
                                    <td className="border border-gray-300 p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.comments}</div>
                                    </td>
                                    <td className="border border-gray-300 p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.referrer}</div>
                                    </td>
                                    <td className="border border-gray-300 p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.emergency_contact_name}</div>
                                    </td>
                                    <td className="border border-gray-300 p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.emergency_contact_phone}</div>
                                    </td>
                                    <td className="border border-gray-300 p-2 text-sm md:text-base max-w-[150px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.emergency_contact_dob.toLocaleDateString()}</div>
                                    </td>
                                    <td className="border border-gray-300 p-2 text-sm md:text-base max-w-[350px] overflow-auto whitespace-nowrap">
                                        <div className="flex items-center h-full">{member.twitter_url}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </>
        )}
    </div>
    )
}

export default AdminMembersList