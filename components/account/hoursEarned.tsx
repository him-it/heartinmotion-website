import { getHours } from "@/actions/account/user"
import { formatShiftDate, formatShiftTimeRange } from "@/lib/time"
import { Prisma } from "@prisma/client"
import Link from "next/link"

const HoursEarned = ({shiftData} : {shiftData: Prisma.PromiseReturnType<typeof getHours>}) => {
    return (
        <div className="flex flex-col items-center">
            {shiftData &&
                <div className="overflow-x-auto md:w-full w-[80%]">
                    <table className="min-w-full bg-card border border-border">
                        <thead className="bg-muted">
                            <tr>
                                <th className="border border-border p-2 text-muted-foreground text-sm md:text-base">Date</th>
                                <th className="border border-border p-2 text-muted-foreground text-sm md:text-base">Event</th>
                                <th className="border border-border p-2 text-muted-foreground text-sm md:text-base">Shift</th>
                                <th className="border border-border p-2 text-muted-foreground text-sm md:text-base">Hours</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                shiftData.filter(shift => shift.completed).map((shift, key) => { return (
                                    <tr key={key} className="border-b hover:bg-muted">
                                        <td className="border border-border p-1 md:p-2 text-sm md:text-base">
                                            <div>
                                                <div>{formatShiftDate(shift.events_eventshift.start_time)}</div>
                                                <div>{formatShiftTimeRange(shift.events_eventshift.start_time, shift.events_eventshift.end_time)}</div>
                                            </div>
                                        </td>
                                        <td className="border border-border p-1 md:p-2 text-sm md:text-base">
                                            <Link href={"/volunteer/events/" + shift.events_eventshift.events_event.slug} className="text-primary hover:underline">{shift.events_eventshift.events_event.name}</Link>
                                        </td>
                                        <td className="border border-border p-1 md:p-2 text-sm md:text-base">{shift.events_eventshift.description}</td>
                                        <td className="border border-border p-1 md:p-2 text-sm md:text-base">{shift.hours}</td>
                                    </tr>
                                )})
                            }
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={3} className="border border-border p-1 md:p-2 text-sm md:text-base">Extra Hours</td>
                                <td className="border border-border p-1 md:p-2 text-sm md:text-base">{shiftData[0]?.member_member.member_memberprivate?.extra_hours ? shiftData[0].member_member.member_memberprivate?.extra_hours : 0}</td>
                            </tr>
                            <tr>
                                <td colSpan={3} className="font-bold border border-border p-1 md:p-2 text-sm md:text-base">Total Hours</td>
                                <td className="border border-border p-1 md:p-2 text-sm md:text-base">{shiftData.filter(shift => shift.completed).reduce((sum, shift) => shift.hours + sum, 0) + (shiftData.length > 0 && shiftData[0].member_member.member_memberprivate?.extra_hours ? shiftData[0].member_member.member_memberprivate?.extra_hours : 0)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            }
        </div>
    )
}

export default HoursEarned