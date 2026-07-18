"use client"

import { useState } from "react"

const initials = (name: string) =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0]?.toUpperCase())
        .join("")

// Colors are derived from the name so the same person always gets the same
// placeholder color, instead of a random one that shifts on every render.
const PALETTE = [
    "bg-rose-100 text-rose-700",
    "bg-amber-100 text-amber-700",
    "bg-emerald-100 text-emerald-700",
    "bg-sky-100 text-sky-700",
    "bg-violet-100 text-violet-700",
    "bg-pink-100 text-pink-700",
]

const colorFor = (name: string) => {
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
    return PALETTE[Math.abs(hash) % PALETTE.length]
}

/**
 * Renders the spotlight photo at /api/spotlight/image/[id]. Many legacy
 * spotlights have no recoverable photo (see wp-etl-spotlight.mjs) — the API
 * route 404s for those, so we fall back to an initials avatar rather than a
 * broken image icon.
 */
export const SpotlightPhoto = ({ id, name, className }: { id: number, name: string, className?: string }) => {
    const [failed, setFailed] = useState(false)

    if (failed) {
        return (
            <div className={`flex items-center justify-center font-bold ${colorFor(name)} ${className || ""}`}>
                <span className="text-3xl">{initials(name) || "?"}</span>
            </div>
        )
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={`/api/spotlight/image/${id}`}
            alt={name}
            loading="lazy"
            onError={() => setFailed(true)}
            className={className}
        />
    )
}
