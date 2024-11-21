"use client"

import { getPageByPath } from "@/actions/pages/page";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const HIMPage = () => {
    const path = usePathname()
    const router = useRouter()

    useEffect(() => {
        const renderPage = async () => {
            await getPageByPath(path)
            .then(res => {
                const container = document.getElementById("page-content-container")!
                if(res) {
                    container.innerHTML = res.content
                    container.classList.remove('tailwind-layout')
                }
                else
                    router.push('/')
            })
        }
        renderPage()
    }, [])

    return (
        <div className="m-5">
            <div className="prose" id="page-content-container"></div>
        </div>
    )
};

export default HIMPage;
