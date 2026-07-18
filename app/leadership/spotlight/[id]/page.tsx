import { getSpotlightById } from "@/actions/leadership/spotlight"
import { PageWrapper } from "@/components/pageWrapper"
import { SpotlightPhoto } from "@/components/leadership/spotlightPhoto"
import Link from "next/link"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

const monthYear = (date: Date) =>
    new Date(date).toLocaleDateString("en-US", { month: "long", year: "numeric" })

const SpotlightDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const numId = Number(id)

    if (!Number.isInteger(numId) || numId <= 0)
        redirect('/leadership/spotlight')

    const spotlight = await getSpotlightById(numId)

    if (!spotlight)
        redirect('/leadership/spotlight')

    return (
        <PageWrapper
            title={spotlight.name}
            eyebrow={`${spotlight.category} Spotlight · ${monthYear(spotlight.post_date)}`}
        >
            <Link href="/leadership/spotlight" className="eyebrow mb-8 hover:text-foreground transition-colors">
                ← All spotlights
            </Link>
            <div className="mt-8 flex flex-col md:flex-row gap-10 items-start">
                <div className="md:w-72 w-full max-w-72 shrink-0 md:sticky md:top-24">
                    <SpotlightPhoto
                        id={spotlight.id}
                        name={spotlight.name}
                        className="w-full rounded-2xl border border-border object-cover aspect-[4/5]"
                    />
                    {spotlight.content.details.length > 0 && (
                        <div className="mt-5 space-y-1">
                            {spotlight.content.details.map((detail, i) => (
                                <p
                                    key={i}
                                    className={i === 0
                                        ? "font-semibold text-foreground leading-tight"
                                        : "text-sm text-muted-foreground leading-tight"}
                                >
                                    {detail}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0 space-y-8">
                    {spotlight.content.questions.map((qa, i) => (
                        <div key={i} className="space-y-2">
                            <h2 className="text-lg font-semibold text-foreground">
                                {qa.question}
                            </h2>
                            {qa.answer.split(/\n\n+/).map((para, j) => (
                                <p key={j} className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                    {para}
                                </p>
                            ))}
                        </div>
                    ))}
                    {spotlight.content.questions.length === 0 &&
                     spotlight.content.details.length === 0 && (
                        <p className="text-muted-foreground">No details yet.</p>
                    )}
                </div>
            </div>
        </PageWrapper>
    )
}

export default SpotlightDetailPage
