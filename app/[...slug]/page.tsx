"use client"

import { getPageByPath } from "@/actions/pages/page";
import { activeVolunteerHoursReport, dateRangeReport, weeklyUpdateReport, yearlyEventReport } from "@/components/admin/events/reports/generateReports";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const HIMPage = () => {
    const path = usePathname()
    const router = useRouter()

    useEffect(() => {
        const renderPage = async () => {
            await getPageByPath(path)
            .then(res => {
                const container = document.getElementById("page-content-container")!
                console.log("1")
                if(res)
                    container.innerHTML = res.content
                else
                    router.push('/')
                console.log("3")
            })
        }
        console.log("2")
        renderPage()
    }, [])

    return (
        <div className="m-5">
            <div id="page-content-container"></div>
        </div>
    )
};

export default HIMPage;
