import Link from "next/link"

// `width` constrains and centers the whole column — back link, title, and
// content share one left edge instead of the content centering independently.
export const AdminPageWrapper = ({ children, title, redirect, width } : { children: React.ReactNode, title?: string, redirect?: string, width?: string }) => {
    return (
        <div className="mx-auto max-w-6xl px-5 pt-10 pb-6">
            <div className={width ? width + " mx-auto" : undefined}>
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
        </div>
    )
}
