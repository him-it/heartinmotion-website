"use client"

import { getSpotlights } from "@/actions/leadership/spotlight"
import { PageWrapper } from "@/components/pageWrapper"
import { SpotlightPhoto } from "@/components/leadership/spotlightPhoto"
import { Prisma } from "@prisma/client"
import Link from "next/link"
import { useEffect, useState } from "react"

const CATEGORIES = ["All", "Officer", "Intern", "Volunteer"] as const

const monthYear = (date: Date) =>
    new Date(date).toLocaleDateString("en-US", { month: "long", year: "numeric" })

const SpotlightPage = () => {
    const [spotlightData, setSpotlightData] = useState<Prisma.PromiseReturnType<typeof getSpotlights>>()
    const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All")

    useEffect(() => {
        const fetchSpotlights = async () => {
            await getSpotlights()
                .then(res => {
                    if (res)
                        setSpotlightData(res)
                })
        }
        fetchSpotlights()
    }, [])

    const filtered = spotlightData?.filter(s => category === "All" || s.category === category)

    return (
        <PageWrapper title="Spotlight" eyebrow="Leadership">
            <p className="text-muted-foreground text-lg max-w-2xl mb-10 -mt-4">
                Celebrating the volunteers, interns, and officers who make Heart in Motion move.
            </p>

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

            {!spotlightData && (
                <p className="text-muted-foreground py-20 text-center">Loading…</p>
            )}

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
        </PageWrapper>
    )
}

export default SpotlightPage
