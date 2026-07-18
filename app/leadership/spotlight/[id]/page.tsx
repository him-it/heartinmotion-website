"use client"

import { getSpotlightById } from "@/actions/leadership/spotlight"
import { PageWrapper } from "@/components/pageWrapper"
import { SpotlightPhoto } from "@/components/leadership/spotlightPhoto"
import { sanitizeHtml } from "@/lib/sanitize"
import { Prisma } from "@prisma/client"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const monthYear = (date: Date) =>
    new Date(date).toLocaleDateString("en-US", { month: "long", year: "numeric" })

const SpotlightDetailPage = () => {
    const { id } = useParams()!
    const router = useRouter()
    const [spotlight, setSpotlight] = useState<Prisma.PromiseReturnType<typeof getSpotlightById>>()

    useEffect(() => {
        const fetchSpotlight = async () => {
            const numId = Number(id)
            if (!Number.isInteger(numId) || numId <= 0) {
                router.push('/leadership/spotlight')
                return
            }
            await getSpotlightById(numId)
                .then(res => {
                    if (res)
                        setSpotlight(res)
                    else
                        router.push('/leadership/spotlight')
                })
        }
        fetchSpotlight()
    }, [])

    return (
        <PageWrapper
            title={spotlight ? spotlight.name : "Loading..."}
            eyebrow={spotlight ? `${spotlight.category} Spotlight · ${monthYear(spotlight.post_date)}` : "Spotlight"}
        >
            <Link href="/leadership/spotlight" className="eyebrow mb-8 hover:text-foreground transition-colors">
                ← All spotlights
            </Link>
            {spotlight && (
                <div className="mt-8 flex flex-col md:flex-row gap-10 items-start">
                    <div className="md:w-72 w-full max-w-72 shrink-0 md:sticky md:top-24">
                        <SpotlightPhoto
                            id={spotlight.id}
                            name={spotlight.name}
                            className="w-full rounded-2xl border border-border object-cover aspect-[4/5]"
                        />
                    </div>
                    <div
                        className="prose prose-neutral max-w-none flex-1 min-w-0"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(spotlight.content) }}
                    />
                </div>
            )}
        </PageWrapper>
    )
}

export default SpotlightDetailPage
