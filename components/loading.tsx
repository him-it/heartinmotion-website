"use client"

import { useSession } from "next-auth/react"

export const Loading = () => {
    const session = useSession()

    return (
        <div>
            { session.status === "loading" && 
                <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
                    <svg className="fixed animate-spin" fill="none" height="300" viewBox="0 0 48 48" width="300" xmlns="http://www.w3.org/2000/svg"><path d="M4 24C4 35.0457 12.9543 44 24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4" stroke="#ff1212" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"/></svg>
                    <img className="w-auto h-32 sm:h-34" src="/assets/logo.png" loading="lazy"/>
                </div>
            }
        </div>
    )
}
