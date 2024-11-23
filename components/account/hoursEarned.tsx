import { getHours } from "@/actions/account/user"
import { Prisma } from "@prisma/client"
import Link from "next/link"

const HoursEarned = ({shiftData} : {shiftData: Prisma.PromiseReturnType<typeof getHours>}) => {
    return (
        <div className="flex flex-col items-center">
            {shiftData &&
                <div className="overflow-x-auto md:w-full w-[80%]">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border border-gray-300 p-2 text-gray-600 text-sm md:text-base">Date</th>
                                <th className="border border-gray-300 p-2 text-gray-600 text-sm md:text-base">Event</th>
                                <th className="border border-gray-300 p-2 text-gray-600 text-sm md:text-base">Shift</th>
                                <th className="border border-gray-300 p-2 text-gray-600 text-sm md:text-base">Hours</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                shiftData.filter(shift => shift.completed).map((shift, key) => { return (
                                    <tr key={key} className="border-b hover:bg-gray-50">
                                        <td className="border border-gray-300 p-1 md:p-2 text-sm md:text-base">
                                            <div>
                                                <div>{shift.events_eventshift.start_time.toLocaleDateString('en-US', { timeZone:'UTC',  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                                <div>{shift.events_eventshift.start_time.toLocaleTimeString('en-US', { timeZone:'UTC',  hour: 'numeric', minute: 'numeric', hour12: true }) + " - " + shift.events_eventshift.end_time.toLocaleTimeString('en-US', { timeZone:'UTC', hour: 'numeric', minute: 'numeric', hour12: true })}</div>
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 p-1 md:p-2 text-sm md:text-base">
                                            <Link href={"/volunteer/events/" + shift.events_eventshift.events_event.slug} className="text-red-600 hover:underline">{shift.events_eventshift.events_event.name}</Link>
                                        </td>
                                        <td className="border border-gray-300 p-1 md:p-2 text-sm md:text-base">{shift.events_eventshift.description}</td>
                                        <td className="border border-gray-300 p-1 md:p-2 text-sm md:text-base">{shift.hours}</td>
                                    </tr>
                                )})
                            }
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={3} className="border border-gray-300 p-1 md:p-2 text-sm md:text-base">Extra Hours</td>
                                <td className="border border-gray-300 p-1 md:p-2 text-sm md:text-base">{shiftData[0]?.member_member.member_memberprivate?.extra_hours ? shiftData[0].member_member.member_memberprivate?.extra_hours : 0}</td>
                            </tr>
                            <tr>
                                <td colSpan={3} className="font-bold border border-gray-300 p-1 md:p-2 text-sm md:text-base">Total Hours</td>
                                <td className="border border-gray-300 p-1 md:p-2 text-sm md:text-base">{shiftData.filter(shift => shift.completed).reduce((sum, shift) => shift.hours + sum, 0) + (shiftData.length > 0 && shiftData[0].member_member.member_memberprivate?.extra_hours ? shiftData[0].member_member.member_memberprivate?.extra_hours : 0)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            }
        </div>
    )
}

export default HoursEarned