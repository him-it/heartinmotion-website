import { PageWrapper } from "@/components/pageWrapper"
import Link from "next/link"

const SpotlightPage = () => {
    return (
        <PageWrapper title="Spotlight">
            <div className="text-center my-44">
                <div className="text-gray-400 my-10 font-bold text-5xl">
                    Coming Soon!
                    <div className="text-3xl my-3">
                        This page is currently in development.
                    </div>
                </div>

                <Link href="/home" className="text-red-500 hover:text-red-600 underline text-2xl">
                    Return Home
                </Link>
            </div>
        </PageWrapper>
    )
}

export default SpotlightPage