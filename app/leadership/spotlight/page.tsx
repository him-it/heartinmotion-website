import { PageWrapper } from "@/components/pageWrapper"
import Link from "next/link"

const SpotlightPage = () => {
    return (
        <PageWrapper title="Spotlight" eyebrow="Leadership">
            <div className="rounded-3xl border border-border bg-card py-24 px-6 text-center">
                <span className="eyebrow justify-center mb-5">In development</span>
                <p className="mt-5 text-3xl sm:text-4xl font-extrabold tracking-[-0.02em] text-foreground mb-3">
                    Something <span className="marker">worth the wait</span>.
                </p>
                <p className="text-muted-foreground text-lg mb-9 max-w-md mx-auto">
                    We&apos;re building a place to celebrate the volunteers who make Heart in Motion move.
                </p>
                <Link href="/home" className="inline-flex items-center rounded-full bg-primary text-primary-foreground font-semibold px-6 py-3 hover:bg-primary/90 transition-colors">
                    Return home
                </Link>
            </div>
        </PageWrapper>
    )
}

export default SpotlightPage
