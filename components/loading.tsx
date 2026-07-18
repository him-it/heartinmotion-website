"use client"

import { useSession } from "next-auth/react"

export const Loading = () => {
    const session = useSession()

    if (session.status !== "loading")
        return null

    return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center gap-8">
            <img className="w-auto h-24 sm:h-28" src="/assets/logo.png" alt="Heart in Motion" />
            <div className="h-1 w-48 overflow-hidden rounded-full bg-muted">
                <div className="him-loader-bar h-full w-1/2 rounded-full bg-primary" />
            </div>
        </div>
    )
}
