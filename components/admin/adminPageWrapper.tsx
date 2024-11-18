import Link from "next/link"

export const AdminPageWrapper = ({ children, title, redirect } : { children: React.ReactNode, title?: string, redirect?: string }) => {
    return (
        <div>
            <div className="text-center mb-6 mt-2">
                <div className='flex right-full ml-10 sm:ml-16 mb-10 sm:mb-0'>
                    <Link href={ redirect || '/' } className='bg-red-500 text-white py-2 px-4 rounded-full hover:bg-red-600 transition duration-300'>Back</Link>
                </div>
                <h1 className="text-red-500 text-4xl font-bold mb-6">
                    { title }
                </h1>
            </div>
            <div className="p-5">
                { children }
            </div>
        </div>
    )
}