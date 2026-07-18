"use client"

import { getPageByPath } from "@/actions/pages/page";
import { sanitizeHtml } from "@/lib/sanitize";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const HIMPage = () => {
    const path = usePathname()!
    const router = useRouter()

    useEffect(() => {
        const renderPage = async () => {
            await getPageByPath(path)
            .then(res => {
                const container = document.getElementById("page-content-container")!
                if(res) {
                    container.innerHTML = sanitizeHtml(res.content)
                }
                else
                    router.push('/')
            })
        }
        renderPage()
    }, [])

    return (
        <div className="mx-auto w-[90%] max-w-5xl py-12">
            <div id="page-content-container" className="prose prose-neutral max-w-none"></div>
        </div>
    )
};

export default HIMPage;
