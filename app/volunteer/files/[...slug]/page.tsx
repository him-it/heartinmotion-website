"use client"

import { getFileBySlug } from "@/actions/volunteer/file"
import { PageWrapper } from "@/components/pageWrapper"
import { FileDetails } from "@/components/volunteer/fileDetails"
import { Prisma } from "@prisma/client"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"

const FilePage = () => {
    const {slug} = useParams() 
    const router = useRouter()
    const [fileData, setFileData] = useState<Prisma.PromiseReturnType<typeof getFileBySlug>>()

    useEffect(() => {
        const fetchFile = async () => {
            await getFileBySlug(slug[0] as string)
            .then((res) => {
                if(res)
                    setFileData(res)
                else
                    router.push('/volunteer/files')
            })
        }

        fetchFile()
    }, [])

    return (
        <PageWrapper title={fileData ? fileData.name : "Loading..."}>
            <FileDetails fileData={fileData}></FileDetails>
        </PageWrapper>
    )
}

export default FilePage