"use client"

import { deleteSpotlight, getSpotlightsAdmin } from "@/actions/leadership/spotlight"
import { Prisma } from "@prisma/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"

const CATEGORIES = ["All", "Officer", "Intern", "Volunteer"] as const

const monthYear = (date: Date) =>
    new Date(date).toLocaleDateString("en-US", { month: "long", year: "numeric" })

export const SpotlightAdminList = ({
    spotlightData
}: {
    spotlightData: Prisma.PromiseReturnType<typeof getSpotlightsAdmin>
}) => {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [query, setQuery] = useState("")
    const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All")

    const filtered = useMemo(() => {
        if (!spotlightData)
            return []
        const q = query.trim().toLowerCase()
        return spotlightData.filter(s =>
            (category === "All" || s.category === category) &&
            (q === "" || s.name.toLowerCase().includes(q))
        )
    }, [spotlightData, query, category])

    const onDelete = (id: number, name: string) => {
        if (!confirm(`Delete the spotlight for "${name}"? This cannot be undone.`))
            return
        startTransition(() => {
            deleteSpotlight(id).then(res => {
                if (res?.error)
                    alert(res.error)
                else
                    router.refresh()
            })
        })
    }

    if (!spotlightData)
        return (
            <p className="text-muted-foreground py-10">
                Unable to load spotlights, or you are not authorized.
            </p>
        )

    return (
        <div>
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search by name…"
                    className="flex-1 min-w-[200px] rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <div className="flex flex-wrap gap-2">
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
                <Link
                    href="/admin/spotlights/new"
                    className="rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                    + New Spotlight
                </Link>
            </div>

            <p className="text-sm text-muted-foreground mb-3">
                {filtered.length} of {spotlightData.length} spotlights
            </p>

            <div className="overflow-x-auto rounded-xl border border-border">
                <table className="min-w-full table-auto bg-card border-collapse">
                    <thead className="bg-muted">
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">Name</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">Category</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">Date</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">Photo</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">Visibility</th>
                            <th className="px-4 py-2 text-right text-sm font-semibold text-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(s => (
                            <tr key={s.id} className="border-b border-border last:border-0">
                                <td className="px-4 py-2 text-sm text-foreground font-medium">{s.name}</td>
                                <td className="px-4 py-2 text-sm text-muted-foreground">{s.category}</td>
                                <td className="px-4 py-2 text-sm text-muted-foreground">{monthYear(s.post_date)}</td>
                                <td className="px-4 py-2 text-sm">
                                    {s.has_image
                                        ? <span className="text-emerald-600">Yes</span>
                                        : <span className="text-muted-foreground">—</span>}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                    {s.hidden
                                        ? <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Hidden</span>
                                        : <span className="inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600">Visible</span>}
                                </td>
                                <td className="px-4 py-2 text-right whitespace-nowrap">
                                    <Link
                                        href={`/admin/spotlights/spotlight/${s.id}`}
                                        className="text-primary hover:text-primary/90 text-sm font-semibold"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => onDelete(s.id, s.name)}
                                        disabled={isPending}
                                        className="ml-4 text-destructive hover:text-destructive/80 text-sm font-semibold disabled:opacity-50"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                                    No spotlights match your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
