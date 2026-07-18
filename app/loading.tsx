import { LoadingState } from "@/components/ui/loadingState"

// Global route loading boundary — shown during navigation while any server
// component page is fetching. Navbar/footer stay mounted around it.
export default function Loading() {
    return (
        <div className="mx-auto max-w-6xl px-5 pt-12 pb-6">
            <LoadingState />
        </div>
    )
}
