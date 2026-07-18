import { auth } from "@/auth"
import { PageWrapper } from "@/components/pageWrapper"
import Link from "next/link"

const cardShadow = { boxShadow: '0 4px 5px rgba(0, 0, 0, 0.1), 0 0 5px rgba(0, 0, 0, 0.05)' }

const AdminLink = ({ href, label }: { href: string, label: string }) => (
    <li>
        <div className="rounded-md overflow-hidden max-w-xs mx-auto" style={cardShadow}>
            <Link
                href={href}
                className="block text-lg font-semibold text-muted-foreground hover:text-foreground py-3 px-6 rounded-md hover:bg-muted transition duration-200"
            >
                {label}
            </Link>
        </div>
    </li>
)

// Server component: the session is read server-side so the link list renders
// complete on first paint — no pop-in as the client session resolves.
const Admin_AdminPage = async () => {
    const session = await auth()
    const adminLevel = session?.user?.admin_level ?? 0

    return (
        <PageWrapper title="Admin">
            <ul className="space-y-6 list-none">
                <AdminLink href="/admin/members" label="Members" />
                {adminLevel > 2 && (
                    <>
                        <AdminLink href="/admin/events" label="Events" />
                        <AdminLink href="/admin/files" label="Files" />
                        <AdminLink href="/admin/pages" label="Pages" />
                        <AdminLink href="/admin/spotlights" label="Spotlights" />
                        {adminLevel > 4 && <AdminLink href="/admin/managers" label="Managers" />}
                    </>
                )}
            </ul>
        </PageWrapper>
    )
}

export default Admin_AdminPage
