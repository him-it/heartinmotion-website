import { getSpotlights } from "@/actions/leadership/spotlight"
import { PageWrapper } from "@/components/pageWrapper"
import { SpotlightGallery } from "@/components/leadership/spotlightGallery"

// Public page with no cookie/header usage — force dynamic rendering so the
// spotlight list is fetched per-request instead of frozen at build time.
export const dynamic = "force-dynamic"

const SpotlightPage = async () => {
    const spotlightData = await getSpotlights()

    return (
        <PageWrapper title="Spotlight" eyebrow="Leadership">
            <p className="text-muted-foreground text-lg max-w-2xl mb-10 -mt-4">
                Celebrating the volunteers, interns, and officers who make Heart in Motion move.
            </p>
            <SpotlightGallery spotlightData={spotlightData} />
        </PageWrapper>
    )
}

export default SpotlightPage
