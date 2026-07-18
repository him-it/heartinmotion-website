export const PageWrapper = ({ children, title, eyebrow } : { children: React.ReactNode, title: string, eyebrow?: string }) => {
    return (
        <div className="mx-auto max-w-6xl px-5 pt-12 pb-6">
            <span className="eyebrow mb-4">{ eyebrow || "Heart in Motion" }</span>
            <h1 className="mt-4 text-4xl sm:text-6xl font-extrabold tracking-[-0.03em] leading-[0.95] text-foreground mb-10">
                { title }
            </h1>
            <div>
                { children }
            </div>
        </div>
    )
}
