export const PageWrapper = ({ children, title } : { children: React.ReactNode, title: string }) => {
    return (
        <div className="text-center mb-10 mt-2">
            <h1 className="text-red-500 text-4xl font-bold mb-6">
                { title }
            </h1>
            <div>
                { children }
            </div>
        </div>
    )
}