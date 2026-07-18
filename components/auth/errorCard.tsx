import Link from "next/link"

export const ErrorCard = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-muted">
            <div className="text-center p-6 bg-card shadow-md rounded-lg max-w-sm">
                <h1 className="text-3xl font-bold text-primary mb-6">Something went wrong!</h1>
                <p className="text-foreground mb-6">We encountered an unexpected issue. Please try again later or return to the homepage.</p>
                <Link href="/" className="inline-block px-6 py-3 text-white bg-primary rounded-full hover:bg-primary/90 transition-colors">

                </Link>
            </div>
        </div>
    )
}