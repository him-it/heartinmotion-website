import Link from "next/link"

export const AdminFormWrapper = ({ children, title, redirect } : { children: React.ReactNode, title?: string, redirect?: string }) => {
    return (
        <div className='flex justify-center items-center min-h-screen rounded-full my-10'>
            <div className='shadow-lg rounded-xl  border border-gray-100 sm:w-[80%] w-[75%] pb-5'>
                <div className='flex right-full mt-10 sm:ml-16 ml-5'>
                    <Link href={ redirect || '/' } className='bg-red-500 text-white py-2 px-4 rounded-full hover:bg-red-600 transition duration-300'>Back</Link>
                </div>
                <div className='mb-8 mt-8  sm:ml-16 ml-5'>
                    <h1 className="text-red-500 text-4xl font-bold mb-6">{ title }</h1>
                </div>
                { children }
            </div>
        </div>
    )
}