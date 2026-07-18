"use client"

import { getSpotlights } from "@/actions/leadership/spotlight"
import { SpotlightPhoto } from "@/components/leadership/spotlightPhoto"
import { Prisma } from "@prisma/client"
import Link from "next/link"
import { useState } from "react"

const CATEGORIES = ["All", "Officer", "Intern", "Volunteer"] as const

const monthYear = (date: Date) =>
    new Date(date).toLocaleDateString("en-US", { month: "long", year: "numeric" })

// Client half of the spotlight listing: holds the category-filter state.
// Data arrives fully loaded from the server page, so there is no fetch here.
export const SpotlightGallery = ({ spotlightData }: { spotlightData: Prisma.PromiseReturnType<typeof getSpotlights> }) => {
    const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All")

    const filtered = spotlightData?.filter(s => category === "All" || s.category === category)

    return (
        <>
            <div className="flex flex-wrap gap-2 mb-10">
                {CATEGORIES.map(c => (
                    <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                            category === c
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        {c}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {filtered?.map(s => (
                    <Link
                        key={s.id}
                        href={`/leadership/spotlight/${s.id}`}
                        className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-foreground/25 transition-colors"
                    >
                        <div className="aspect-[4/5] overflow-hidden bg-muted">
                            <SpotlightPhoto
                                id={s.id}
                                name={s.name}
                                className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                            />
                        </div>
                        <div className="p-4">
                            <p className="font-semibold text-foreground leading-tight">{s.name}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {s.category} · {monthYear(s.post_date)}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </>
    )
}
