import Link from "next/link"

export const AdminFormWrapper = ({ children, title, redirect } : { children: React.ReactNode, title?: string, redirect?: string }) => {
    return (
        <div className="flex justify-center items-start min-h-screen py-12 px-5">
            <div className="w-full max-w-3xl rounded-xl border border-border bg-card shadow-xs pb-6">
                <div className="p-6 border-b border-border">
                    <Link href={ redirect || '/' } className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full border border-border bg-card text-foreground hover:bg-muted transition-colors">
                        ← Back
                    </Link>
                    <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">{ title }</h1>
                </div>
                <div className="p-6">
                    { children }
                </div>
            </div>
        </div>
    )
}
