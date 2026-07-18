"use client"

import { PageWrapper } from "@/components/pageWrapper"
import { useSession } from "next-auth/react"
import Link from "next/link"

const Admin_AdminPage = () => {
    const session = useSession()

    return (
        <PageWrapper title="Admin">
            <ul className="space-y-6 list-none">
                <li>
                    <div className="rounded-md overflow-hidden max-w-xs mx-auto"  style={{ boxShadow: '0 4px 5px rgba(0, 0, 0, 0.1), 0 0 5px rgba(0, 0, 0, 0.05)' }}>
                    <Link
                        href="/admin/members"
                        className="block text-lg font-semibold text-muted-foreground hover:text-foreground py-3 px-6 rounded-md hover:bg-muted transition duration-200"
                    >
                        Members
                    </Link>
                    </div>
                </li>
                { session && session.data && session.data.user.admin_level > 2 &&
                    <>
                        <li>
                            <div className="rounded-md overflow-hidden max-w-xs mx-auto"  style={{ boxShadow: '0 4px 5px rgba(0, 0, 0, 0.1), 0 0 5px rgba(0, 0, 0, 0.05)' }}>
                            <Link
                                href="/admin/events"
                                className="block text-lg font-semibold text-muted-foreground hover:text-foreground py-3 px-6 rounded-md hover:bg-muted transition duration-200"
                            >
                                Events
                            </Link>
                            </div>
                        </li>
                        <li>
                            <div className="rounded-md overflow-hidden max-w-xs mx-auto"  style={{ boxShadow: '0 4px 5px rgba(0, 0, 0, 0.1), 0 0 5px rgba(0, 0, 0, 0.05)' }}>
                            <Link
                                href="/admin/files"
                                className="block text-lg font-semibold text-muted-foreground hover:text-foreground py-3 px-6 rounded-md hover:bg-muted transition duration-200"
                            >
                                Files
                            </Link>
                            </div>
                        </li>
                        <li>
                            <div className="rounded-md overflow-hidden max-w-xs mx-auto"  style={{ boxShadow: '0 4px 5px rgba(0, 0, 0, 0.1), 0 0 5px rgba(0, 0, 0, 0.05)' }}>
                            <Link
                                href="/admin/pages"
                                className="block text-lg font-semibold text-muted-foreground hover:text-foreground py-3 px-6 rounded-md hover:bg-muted transition duration-200"
                            >
                                Pages
                            </Link>
                            </div>
                        </li>
                        <li>
                            <div className="rounded-md overflow-hidden max-w-xs mx-auto"  style={{ boxShadow: '0 4px 5px rgba(0, 0, 0, 0.1), 0 0 5px rgba(0, 0, 0, 0.05)' }}>
                            <Link
                                href="/admin/spotlights"
                                className="block text-lg font-semibold text-muted-foreground hover:text-foreground py-3 px-6 rounded-md hover:bg-muted transition duration-200"
                            >
                                Spotlights
                            </Link>
                            </div>
                        </li>
                        {
                            session.data.user.admin_level > 4 &&
                            <li>
                                <div className="rounded-md overflow-hidden max-w-xs mx-auto"  style={{ boxShadow: '0 4px 5px rgba(0, 0, 0, 0.1), 0 0 5px rgba(0, 0, 0, 0.05)' }}>
                                <Link
                                    href="/admin/managers"
                                    className="block text-lg font-semibold text-muted-foreground hover:text-foreground py-3 px-6 rounded-md hover:bg-muted transition duration-200"
                                >
                                    Managers
                                </Link>
                                </div>
                            </li>
                        }
                    </>  
                }
            </ul>
        </PageWrapper>
    )
}

export default Admin_AdminPage