"use client"

import { activeVolunteerHoursReport, internOfficerVolunteerReport, yearlyEventReport } from './generateReports';

const REPORTS: { label: string, description: string, onClick: (e: React.MouseEvent) => void }[] = [
    { label: "Yearly Event Report", description: "All events and hours for the year.", onClick: yearlyEventReport },
    { label: "Intern/Officer Volunteer Report", description: "Hours grouped by interns and officers.", onClick: internOfficerVolunteerReport },
    { label: "Volunteer Hours Report", description: "Hours across all volunteers.", onClick: internOfficerVolunteerReport },
    { label: "Active Volunteer Hours Report", description: "Hours for currently active volunteers.", onClick: activeVolunteerHoursReport },
]

const AdminEventReports = () => {
    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
                {REPORTS.map(report => (
                    <button
                        key={report.label}
                        onClick={report.onClick}
                        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-muted/60 transition-colors group"
                    >
                        <span>
                            <span className="block text-sm font-semibold text-foreground">{report.label}</span>
                            <span className="block text-sm text-muted-foreground mt-0.5">{report.description}</span>
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M9 12l3 3m0 0 3-3m-3 3V2.25" />
                        </svg>
                    </button>
                ))}
            </div>
        </div>
    )
}

export default AdminEventReports
