import Link from "next/link"

export const ErrorCard = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center p-6 bg-white shadow-md rounded-lg max-w-sm">
                <h1 className="text-3xl font-bold text-red-600 mb-6">Something went wrong!</h1>
                <p className="text-gray-700 mb-6">We encountered an unexpected issue. Please try again later or return to the homepage.</p>
                <Link href="/" className="inline-block px-6 py-3 text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors">

                </Link>
            </div>
        </div>
    )
}