import Link from "next/link"

export const AdminPageWrapper = ({ children, title, redirect } : { children: React.ReactNode, title?: string, redirect?: string }) => {
    return (
        <div className="mx-auto max-w-6xl px-5 pt-10 pb-6">
            <Link href={ redirect || '/' } className="eyebrow mb-4 hover:text-foreground transition-colors">
                ← Back
            </Link>
            <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-[0.95] text-foreground mb-8">
                { title }
            </h1>
            <div>
                { children }
            </div>
        </div>
    )
}
