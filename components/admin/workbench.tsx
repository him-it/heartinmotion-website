/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: design.md · designed-as-app */
"use client"

import { cn } from "@/lib/utils"

// Shared admin workbench primitives. Every admin page composes these so the
// toolbar rhythm, table shell, and modal chrome stay identical across routes.

export const Toolbar = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("flex flex-wrap items-center gap-2 mb-6", className)}>
        {children}
    </div>
)

// Pushes everything after it to the right edge of the toolbar.
export const ToolbarSpacer = () => <div className="grow" />

export const TableShell = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("overflow-x-auto rounded-xl border border-border bg-card", className)}>
        {children}
    </div>
)

export const thClass = "px-4 py-2.5 text-left text-sm font-semibold text-foreground whitespace-nowrap"
export const tdClass = "px-4 py-2.5 text-sm text-foreground"

export const Modal = ({
    title,
    onClose,
    children,
    className
}: {
    title: string,
    onClose: () => void,
    children: React.ReactNode,
    className?: string
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
        <div
            className={cn("w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-md", className)}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-start justify-between gap-4 mb-5">
                <h2 className="text-xl font-bold text-foreground">{title}</h2>
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="shrink-0 -m-1 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            {children}
        </div>
    </div>
)
