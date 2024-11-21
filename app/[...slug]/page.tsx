"use client"

import { getPageByPath } from "@/actions/pages/page";
import { PageWrapper } from "@/components/pageWrapper";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const HIMPage = () => {
    const path = usePathname()
    const router = useRouter()

    const [title, setTitle] = useState<string>('')

    useEffect(() => {
        const renderPage = async () => {
            await getPageByPath(path)
            .then(res => {
                const container = document.getElementById("page-content-container")!
                if(res) {
                    container.innerHTML = res.content
                    if(res.title!="Home")
                        setTitle(res.title)
                }
                else
                    router.push('/')
            })
        }
        renderPage()
    }, [])

    return (
        <PageWrapper title={title}>
            <div id="page-content-container" className="prose prose-sm max-w-none"></div>
        </PageWrapper>
    )
};

export default HIMPage;
