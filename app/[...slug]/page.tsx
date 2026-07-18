"use client"

import { getPageByPath } from "@/actions/pages/page";
import { LoadingState } from "@/components/ui/loadingState";
import { sanitizeHtml } from "@/lib/sanitize";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// This page must stay client-side: sanitizeHtml uses the browser build of
// DOMPurify, so the CMS content can only be sanitized and injected in the
// browser. The shared LoadingState covers the fetch instead of a blank page.
const HIMPage = () => {
    const path = usePathname()!
    const router = useRouter()
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        const renderPage = async () => {
            await getPageByPath(path)
            .then(res => {
                const container = document.getElementById("page-content-container")
                if(res && container) {
                    container.innerHTML = sanitizeHtml(res.content)
                    setLoaded(true)
                }
                else
                    router.push('/')
            })
        }
        renderPage()
    }, [])

    return (
        <div className="mx-auto w-[90%] max-w-5xl py-12">
            {!loaded && <LoadingState />}
            <div id="page-content-container" className="prose prose-neutral max-w-none"></div>
        </div>
    )
};

export default HIMPage;
