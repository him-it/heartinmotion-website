/**
 * The one loading indicator used everywhere: route-level loading.tsx files,
 * lazy-loaded editors, and any client component that still fetches after
 * mount. Server-safe (no hooks) so it can render inside server components.
 * Reuses the him-loader-bar animation from the session splash so every
 * loading state on the site looks identical.
 */
export const LoadingState = ({ label = "Loading…" }: { label?: string }) => {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-24">
            <div className="h-1 w-48 overflow-hidden rounded-full bg-muted">
                <div className="him-loader-bar h-full w-1/2 rounded-full bg-primary" />
            </div>
            <span className="text-sm text-muted-foreground">{label}</span>
        </div>
    )
}
