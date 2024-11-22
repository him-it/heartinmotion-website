"use client"

import { getFiles } from "@/actions/volunteer/file"
import { PageWrapper } from "@/components/pageWrapper"
import { FileList } from "@/components/volunteer/fileList"
import { Prisma } from "@prisma/client"
import { useEffect, useState } from "react"

const FilesPage = () => {
    const [fileData, setFileData] = useState<Prisma.PromiseReturnType<typeof getFiles>>()
    useEffect(() => {
        const fetchFiles = async () => {
            await getFiles()
            .then((res) => {
                setFileData(res)
            })
        }
        fetchFiles()
    }, [])

    return (
        <PageWrapper title="Files">
            <FileList fileData={JSON.parse(JSON.stringify(fileData))}></FileList>
        </PageWrapper>
    )
}

export default FilesPage