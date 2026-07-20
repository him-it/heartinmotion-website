import { auth } from "@/auth"
import { PageWrapper } from "@/components/pageWrapper"
import Link from "next/link"

const AdminLink = ({ href, label, description }: { href: string, label: string, description: string }) => (
    <li className="list-none">
        <Link
            href={href}
            className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-xs hover:shadow-soft hover:border-foreground/20 transition-all duration-150"
        >
            <span>
                <span className="block text-base font-semibold text-foreground">{label}</span>
                <span className="block text-sm text-muted-foreground mt-0.5">{description}</span>
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-150">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
        </Link>
    </li>
)

// Server component: the session is read server-side so the link list renders
// complete on first paint — no pop-in as the client session resolves.
const Admin_AdminPage = async () => {
    const session = await auth()
    const adminLevel = session?.user?.admin_level ?? 0

    return (
        <PageWrapper title="Admin">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
                <AdminLink href="/admin/members" label="Members" description="Search, view, and edit member records." />
                {adminLevel > 2 && (
                    <>
                        <AdminLink href="/admin/events" label="Events" description="Manage events, shifts, and registrations." />
                        <AdminLink href="/admin/files" label="Files" description="Upload and manage shared documents." />
                        <AdminLink href="/admin/pages" label="Pages" description="Edit site page content." />
                        <AdminLink href="/admin/spotlights" label="Spotlights" description="Feature volunteers, interns, and officers." />
                        {adminLevel > 4 && <AdminLink href="/admin/managers" label="Managers" description="Grant and revoke admin access." />}
                    </>
                )}
            </ul>
        </PageWrapper>
    )
}

export default Admin_AdminPage
